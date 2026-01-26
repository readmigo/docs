# Readmigo 账号体系设计文档

> Version: 2.0.0
> Status: Implementation Complete - Documentation Updated
> Author: System Architect
> Last Updated: 2025-12-28

---

## 1. 概述

### 1.1 目标

设计一个灵活的账号体系，支持：
- 游客（匿名用户）无缝使用产品
- 游客转正式用户时数据完整迁移
- 正式用户退出登录后可以游客身份继续使用
- 多账户关联与管理
- 完整的消费记录追踪
- 安全的 API 访问控制
- 全链路日志追踪

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| **设备优先** | 每个设备有唯一标识，是账号关联的基础 |
| **数据不丢失** | 游客期间产生的数据在登录后完整迁移 |
| **身份可追溯** | 任何时刻都能追溯用户的完整身份链 |
| **安全校验** | API 层面有完整的身份校验机制 |

---

## 2. 账号类型定义

### 2.1 账号类型

```
┌─────────────────────────────────────────────────────────────────┐
│                        Account Types                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Guest      │  ───►   │  Registered  │                      │
│  │   Account    │  升级   │   Account    │                      │
│  │              │         │              │                      │
│  │ • 设备绑定    │         │ • Apple ID   │                      │
│  │ • 临时数据    │         │ • Google ID  │                      │
│  │ • 功能受限    │         │ • 完整功能    │                      │
│  └──────────────┘         └──────────────┘                      │
│         ▲                        │                              │
│         │        退出登录        │                              │
│         └────────────────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| 账号类型 | 标识方式 | 数据持久化 | 订阅能力 |
|---------|---------|-----------|---------|
| **游客账号 (Guest)** | Device ID + Guest Token | 本地 + 云端临时存储 | 不支持 |
| **正式账号 (Registered)** | Apple ID / Google ID | 完整云端同步 | 支持 |

### 2.2 账号状态机

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
    ┌───────────┐       ┌───────────────┐       ┌───────────┐│
    │   NEW     │──────►│   ACTIVE      │──────►│  MERGED   ││
    │  (新建)   │       │   (活跃)      │       │  (已合并) ││
    └───────────┘       └───────────────┘       └───────────┘│
                              │                       │       │
                              │                       │       │
                              ▼                       ▼       │
                        ┌───────────┐          ┌───────────┐ │
                        │ SUSPENDED │          │  DELETED  │ │
                        │  (暂停)   │          │  (已删除) │ │
                        └───────────┘          └───────────┘ │
                              │                              │
                              └──────────────────────────────┘
                                       恢复
```

---

## 3. 数据模型设计

### 3.1 核心实体关系

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Entity Relationship Diagram                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     1:N     ┌──────────────┐     1:N    ┌──────────────┐  │
│  │    Device    │─────────────│   Account    │────────────│   Identity   │  │
│  │              │             │              │            │              │  │
│  │ • deviceId   │             │ • accountId  │            │ • identityId │  │
│  │ • platform   │             │ • type       │            │ • provider   │  │
│  │ • model      │             │ • status     │            │ • providerId │  │
│  └──────────────┘             └──────────────┘            └──────────────┘  │
│         │                            │                                       │
│         │                            │                                       │
│         │                            │ 1:N                                   │
│         │                            ▼                                       │
│         │                     ┌──────────────┐                              │
│         │                     │AccountBinding│                              │
│         │                     │              │                              │
│         │                     │ • guestAcct  │                              │
│         └─────────────────────│ • regAcct    │                              │
│              关联设备          │ • boundAt    │                              │
│                               └──────────────┘                              │
│                                      │                                       │
│                                      │ 1:1                                   │
│                                      ▼                                       │
│                               ┌──────────────┐                              │
│                               │ Subscription │                              │
│                               │              │                              │
│                               │ • planType   │                              │
│                               │ • status     │                              │
│                               │ • expiresAt  │                              │
│                               └──────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Prisma Schema 设计 (实际实现)

> 以下为当前代码库中已实现的 Schema，位于 `packages/database/prisma/schema.prisma`

```prisma
// ============================================
// User - 统一用户模型（支持游客和正式用户）
// ============================================
model User {
  id       String  @id @default(uuid()) @db.Uuid
  email    String? @unique @db.VarChar(255)
  appleId  String? @unique @map("apple_id") @db.VarChar(255)
  googleId String? @unique @map("google_id") @db.VarChar(255)

  // 账户类型与状态
  accountType AccountType   @default(REGISTERED) @map("account_type")
  status      AccountStatus @default(ACTIVE)
  deviceId    String?       @map("device_id") @db.VarChar(255) // Guest 用户的设备绑定

  // Guest 账户绑定关系（升级后绑定到正式账户）
  boundToId     String?   @map("bound_to_id") @db.Uuid
  boundTo       User?     @relation("GuestBinding", fields: [boundToId], references: [id])
  guestAccounts User[]    @relation("GuestBinding")
  boundAt       DateTime? @map("bound_at")

  // 用户画像
  displayName       String?      @map("display_name") @db.VarChar(100)
  avatarUrl         String?      @map("avatar_url") @db.VarChar(500)
  nativeLanguage    String       @default("zh-CN") @map("native_language") @db.VarChar(10)
  englishLevel      EnglishLevel @default(INTERMEDIATE) @map("english_level")
  preferredLanguage String       @default("zh-Hans") @map("preferred_language") @db.VarChar(10)

  // 学习目标
  dailyGoalMinutes Int     @default(15) @map("daily_goal_minutes")
  learningPurpose  String? @map("learning_purpose") @db.VarChar(50)

  // 时间戳
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  lastActiveAt DateTime? @map("last_active_at")

  // 注销相关字段
  scheduledDeletionAt DateTime? @map("scheduled_deletion_at") // 30天冷静期
  deletedAt           DateTime? @map("deleted_at")
  deletionReason      String?   @map("deletion_reason") @db.VarChar(500)

  // 关联
  subscription    Subscription?
  userBooks       UserBook[]
  readingSessions ReadingSession[]
  userVocabulary  UserVocabulary[]
  aiInteractions  AIInteraction[]
  dailyStats      DailyStats[]
  authorChats     AuthorChatSession[]
  agoraPosts      AgoraPost[]
  devices         Device[]
  deletionLogs    AccountDeletionLog[]
  orders          Order[]

  @@index([deviceId])
  @@index([accountType])
  @@index([status])
  @@index([scheduledDeletionAt])
  @@map("users")
}

enum AccountType {
  GUEST       // 游客账号
  REGISTERED  // 正式账号
}

enum AccountStatus {
  ACTIVE            // 活跃
  SUSPENDED         // 暂停
  MERGED            // 已合并到其他账号
  PENDING_DELETION  // 待删除（30天冷静期）
  DELETED           // 已删除
}

// ============================================
// Device - 设备信息（支持多设备管理）
// ============================================
model Device {
  id       String  @id @default(uuid()) @db.Uuid
  deviceId String  @unique @map("device_id") @db.VarChar(255)
  userId   String? @map("user_id") @db.Uuid
  user     User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

  // 设备信息
  platform    Platform @default(IOS)
  deviceModel String?  @map("device_model") @db.VarChar(100)
  deviceName  String?  @map("device_name") @db.VarChar(100)
  osVersion   String?  @map("os_version") @db.VarChar(30)
  appVersion  String?  @map("app_version") @db.VarChar(30)
  pushToken   String?  @map("push_token") @db.VarChar(500)
  isPrimary   Boolean  @default(false) @map("is_primary")
  isLoggedOut Boolean  @default(false) @map("is_logged_out") // 远程登出标记

  // 时间戳
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([lastActiveAt])
  @@map("devices")
}

enum Platform {
  IOS
  ANDROID
  WEB
}

// ============================================
// AccountDeletionLog - 账号注销审计日志
// ============================================
model AccountDeletionLog {
  id     String @id @default(uuid()) @db.Uuid
  userId String @map("user_id") @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  action      DeletionAction
  scheduledAt DateTime?      @map("scheduled_at")
  executedAt  DateTime?      @map("executed_at")

  deletedData Json? @map("deleted_data") @db.JsonB  // 审计数据摘要
  metadata    Json? @db.JsonB

  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("account_deletion_logs")
}

enum DeletionAction {
  DELETION_REQUESTED  // 用户请求注销
  DELETION_CANCELLED  // 用户取消注销
  DELETION_COMPLETED  // 注销完成
}

// ============================================
// Subscription - 订阅管理
// ============================================
model Subscription {
  id     String @id @default(uuid()) @db.Uuid
  userId String @unique @map("user_id") @db.Uuid
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  planType PlanType           @default(FREE) @map("plan_type")
  status   SubscriptionStatus @default(ACTIVE)
  source   SubscriptionSource @default(NONE)

  // Apple IAP
  originalTransactionId String? @map("original_transaction_id") @db.VarChar(255)
  latestReceiptData     String? @map("latest_receipt_data") @db.Text
  productId             String? @map("product_id") @db.VarChar(100)

  // 试用信息
  trialStartedAt DateTime? @map("trial_started_at")
  trialEndsAt    DateTime? @map("trial_ends_at")
  trialUsed      Boolean   @default(false) @map("trial_used")

  // 时间
  startedAt   DateTime  @default(now()) @map("started_at")
  expiresAt   DateTime? @map("expires_at")
  cancelledAt DateTime? @map("cancelled_at")

  // 管理员授权
  grantedBy      String?   @map("granted_by") @db.Uuid
  grantReason    String?   @map("grant_reason") @db.VarChar(500)
  grantExpiresAt DateTime? @map("grant_expires_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  orders Order[]

  @@map("subscriptions")
}

enum PlanType {
  FREE
  PRO
  PREMIUM
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  GRACE_PERIOD
  TRIAL
  TRIAL_EXPIRED
}

enum SubscriptionSource {
  NONE
  APPLE_IAP
  GOOGLE_PLAY
  STRIPE
  PROMO_CODE
  ADMIN_GRANT
}

// ============================================
// Order & Transaction - 订单与交易记录
// ============================================
model Order {
  id             String       @id @default(uuid()) @db.Uuid
  userId         String       @map("user_id") @db.Uuid
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionId String?      @map("subscription_id") @db.Uuid
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])

  // 订单信息
  productId   String       @map("product_id") @db.VarChar(100)
  productType ProductType  @map("product_type")
  status      OrderStatus  @default(PENDING)

  // 金额
  amount     Decimal  @db.Decimal(10, 2)
  currency   String   @default("USD") @db.VarChar(3)

  // Apple 交易
  transactionId         String? @map("transaction_id") @db.VarChar(255)
  originalTransactionId String? @map("original_transaction_id") @db.VarChar(255)

  // 退款关联
  refundRequestId String?        @map("refund_request_id") @db.Uuid
  refundRequest   RefundRequest? @relation(fields: [refundRequestId], references: [id])

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  transactions Transaction[]

  @@index([userId])
  @@index([subscriptionId])
  @@index([transactionId])
  @@map("orders")
}

model Transaction {
  id      String @id @default(uuid()) @db.Uuid
  orderId String @map("order_id") @db.Uuid
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  type   TransactionType
  status TransactionStatus @default(PENDING)
  amount Decimal           @db.Decimal(10, 2)

  metadata  Json?    @db.JsonB
  createdAt DateTime @default(now()) @map("created_at")

  @@index([orderId])
  @@map("transactions")
}

enum TransactionType {
  PURCHASE
  RENEWAL
  REFUND
  UPGRADE
  DOWNGRADE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## 4. 账号生命周期流程

### 4.1 游客账号创建

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Guest Account Creation Flow                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐  │
│   │  App    │     │   Device    │     │   Backend   │     │   DB    │  │
│   │  Start  │     │   Service   │     │   Service   │     │         │  │
│   └────┬────┘     └──────┬──────┘     └──────┬──────┘     └────┬────┘  │
│        │                 │                   │                  │       │
│        │  Get Device ID  │                   │                  │       │
│        │────────────────►│                   │                  │       │
│        │                 │                   │                  │       │
│        │  Device ID      │                   │                  │       │
│        │◄────────────────│                   │                  │       │
│        │                 │                   │                  │       │
│        │  POST /auth/guest                   │                  │       │
│        │─────────────────────────────────────►                  │       │
│        │                 │                   │                  │       │
│        │                 │                   │  Create Device   │       │
│        │                 │                   │─────────────────►│       │
│        │                 │                   │                  │       │
│        │                 │                   │  Create Account  │       │
│        │                 │                   │  (type=GUEST)    │       │
│        │                 │                   │─────────────────►│       │
│        │                 │                   │                  │       │
│        │                 │                   │  Link Device     │       │
│        │                 │                   │  to Account      │       │
│        │                 │                   │─────────────────►│       │
│        │                 │                   │                  │       │
│        │  Guest Token + Account Info         │                  │       │
│        │◄─────────────────────────────────────                  │       │
│        │                 │                   │                  │       │
│        │  Store Token    │                   │                  │       │
│        │  in Keychain    │                   │                  │       │
│        │                 │                   │                  │       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 游客升级为正式账号

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Guest to Registered Upgrade Flow                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User has Guest Account (G1) and wants to Sign in with Apple            │
│                                                                          │
│   Scenario A: Apple ID is NEW (never registered before)                  │
│   ─────────────────────────────────────────────────────                  │
│                                                                          │
│   1. Create Identity (provider=APPLE, providerId=xxx)                    │
│   2. Upgrade G1: accountType = REGISTERED                                │
│   3. Link Identity to G1                                                 │
│   4. Keep all existing data                                              │
│                                                                          │
│   Result: G1 becomes a Registered Account                                │
│                                                                          │
│   ┌────────┐                    ┌────────────────┐                       │
│   │   G1   │  ─── Upgrade ───►  │ G1 (Registered)│                       │
│   │ Guest  │                    │  + Apple ID    │                       │
│   └────────┘                    └────────────────┘                       │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│   Scenario B: Apple ID ALREADY has a Registered Account (R1)             │
│   ─────────────────────────────────────────────────────────              │
│                                                                          │
│   1. Find existing R1 by Apple ID                                        │
│   2. Create AccountBinding (guest=G1, registered=R1)                     │
│   3. Migrate data from G1 to R1 (merge strategy)                         │
│   4. Mark G1.status = MERGED, G1.primaryAccountId = R1.id                │
│   5. Switch device to use R1                                             │
│                                                                          │
│   ┌────────┐     ┌────────────┐                                         │
│   │   G1   │     │     R1     │                                         │
│   │ Guest  │     │ Registered │                                         │
│   └───┬────┘     └─────┬──────┘                                         │
│       │    Binding     │                                                 │
│       └───────────────►│                                                 │
│            Data        │                                                 │
│           Migrate      │                                                 │
│                        │                                                 │
│   Result: G1 merged into R1, G1 kept for audit                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 正式账号退出后以游客身份继续

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Registered User Logout Flow                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User is logged in as R1, clicks "Sign Out"                            │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                     User Choice Dialog                            │  │
│   │                                                                   │  │
│   │  "Sign Out Options"                                               │  │
│   │                                                                   │  │
│   │  ○ Continue as Guest (keep using app without account)            │  │
│   │  ○ Sign Out completely (return to login screen)                  │  │
│   │                                                                   │  │
│   │         [Cancel]                    [Confirm]                    │  │
│   │                                                                   │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   Option 1: Continue as Guest                                            │
│   ───────────────────────────                                            │
│   1. Create new Guest Account (G2)                                       │
│   2. Link G2 to same device                                             │
│   3. G2 starts fresh (no data from R1)                                  │
│   4. Record DeviceAccountHistory (action=LOGOUT for R1, GUEST_CREATED)  │
│   5. Store AccountBinding potential (if G2 later logs back into R1)    │
│                                                                          │
│   Option 2: Sign Out Completely                                          │
│   ──────────────────────────────                                         │
│   1. Clear all local data                                               │
│   2. Return to login/onboarding screen                                  │
│   3. Record DeviceAccountHistory (action=LOGOUT for R1)                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4 数据迁移策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Data Migration Strategy                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   When Guest (G1) merges into Registered (R1):                          │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │ Data Type          │ Strategy        │ Conflict Resolution     │    │
│   ├────────────────────┼─────────────────┼─────────────────────────┤    │
│   │ UserBooks          │ Merge           │ Keep higher progress    │    │
│   │ ReadingSessions    │ Merge           │ Keep all records        │    │
│   │ UserVocabulary     │ Merge           │ Keep best SM-2 stats    │    │
│   │ AIInteractions     │ Merge           │ Keep all records        │    │
│   │ DailyStats         │ Aggregate       │ Sum values by date      │    │
│   │ Settings           │ Prefer R1       │ R1 settings win         │    │
│   │ Subscription       │ N/A             │ Only R1 can subscribe   │    │
│   └────────────────────┴─────────────────┴─────────────────────────┘    │
│                                                                          │
│   Migration Process:                                                     │
│                                                                          │
│   1. Begin Transaction                                                   │
│   2. For each data type:                                                │
│      a. Load G1 data                                                    │
│      b. Load R1 data (if exists)                                        │
│      c. Apply merge strategy                                            │
│      d. Update accountId from G1 to R1                                  │
│   3. Create migration log                                               │
│   4. Update AccountBinding.dataMigrationStatus                          │
│   5. Commit Transaction                                                 │
│                                                                          │
│   Rollback: If any step fails, rollback and mark FAILED                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. API 设计

### 5.1 认证 API

```yaml
# 新增：游客认证
POST /api/v1/auth/guest
Request:
  {
    "deviceId": "string",           # 设备唯一标识
    "platform": "IOS|ANDROID|WEB",
    "deviceModel": "string",        # optional
    "osVersion": "string",          # optional
    "appVersion": "string"          # optional
  }
Response:
  {
    "accessToken": "string",
    "refreshToken": "string",
    "account": {
      "id": "uuid",
      "accountType": "GUEST",
      "status": "ACTIVE",
      "displayName": "Guest User",
      "englishLevel": "BEGINNER"
    },
    "device": {
      "id": "uuid",
      "deviceId": "string"
    },
    "isNewAccount": true
  }

# 升级游客账号（通过 Apple/Google 登录）
POST /api/v1/auth/upgrade
Request:
  {
    "provider": "APPLE|GOOGLE",
    "identityToken": "string",      # Apple identity token
    "idToken": "string",            # Google ID token
    "authorizationCode": "string",  # Apple authorization code
    "fullName": "string"            # optional
  }
Response:
  {
    "accessToken": "string",
    "refreshToken": "string",
    "account": {
      "id": "uuid",
      "accountType": "REGISTERED",
      "status": "ACTIVE",
      "email": "string",
      "displayName": "string"
    },
    "upgrade": {
      "previousAccountId": "uuid",  # 原游客账号 ID
      "upgradeType": "CONVERTED|MERGED",
      "dataMigrated": true,
      "bindingId": "uuid"           # 如果是 MERGED
    }
  }

# 登出（支持选择继续游客模式）
POST /api/v1/auth/logout
Request:
  {
    "continueAsGuest": true,        # 是否以游客身份继续
    "deviceId": "string"
  }
Response:
  {
    "success": true,
    "guestAccount": {               # 如果 continueAsGuest=true
      "accessToken": "string",
      "refreshToken": "string",
      "account": { ... }
    }
  }
```

### 5.2 账号管理 API

```yaml
# 获取当前账号信息（包含关联关系）
GET /api/v1/account/me
Response:
  {
    "account": {
      "id": "uuid",
      "accountType": "REGISTERED",
      "status": "ACTIVE",
      "email": "user@example.com",
      "displayName": "John Doe",
      "englishLevel": "INTERMEDIATE",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "identities": [
      {
        "provider": "APPLE",
        "email": "user@example.com",
        "isPrimary": true,
        "lastUsedAt": "2025-12-20T10:00:00Z"
      }
    ],
    "linkedAccounts": [
      {
        "id": "uuid",
        "accountType": "GUEST",
        "status": "MERGED",
        "boundAt": "2025-12-15T08:00:00Z",
        "dataStats": {
          "booksRead": 3,
          "vocabularyLearned": 150,
          "readingMinutes": 480
        }
      }
    ],
    "subscription": {
      "planType": "PRO",
      "status": "ACTIVE",
      "expiresAt": "2026-01-01T00:00:00Z"
    },
    "stats": {
      "totalReadingMinutes": 1200,
      "totalWordsLearned": 500,
      "streakDays": 15
    }
  }

# 获取账号绑定历史
GET /api/v1/account/bindings
Response:
  {
    "bindings": [
      {
        "id": "uuid",
        "guestAccount": {
          "id": "uuid",
          "createdAt": "2025-12-01T00:00:00Z"
        },
        "boundAt": "2025-12-15T08:00:00Z",
        "bindingSource": "login_prompt",
        "dataMigrationStatus": "COMPLETED",
        "migratedData": {
          "userBooks": 3,
          "readingSessions": 15,
          "userVocabulary": 150
        }
      }
    ]
  }

# 获取消费记录
GET /api/v1/account/transactions
Query: ?page=1&limit=20&startDate=2025-01-01&endDate=2025-12-31
Response:
  {
    "transactions": [
      {
        "id": "uuid",
        "transactionId": "apple_txn_xxx",
        "productId": "com.readmigo.pro.yearly",
        "type": "INITIAL_PURCHASE",
        "priceAmount": 49.99,
        "priceCurrency": "USD",
        "purchaseDate": "2025-12-01T00:00:00Z",
        "expiresDate": "2026-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    },
    "summary": {
      "totalSpent": 49.99,
      "currency": "USD",
      "activeSubscription": "PRO"
    }
  }
```

### 5.3 Dashboard API (Admin)

```yaml
# 查询用户详情（含关联账号）
GET /api/admin/accounts/:accountId
Response:
  {
    "account": {
      "id": "uuid",
      "accountType": "REGISTERED",
      "status": "ACTIVE",
      "email": "user@example.com",
      "displayName": "John Doe",
      "createdAt": "2025-01-01T00:00:00Z",
      "lastActiveAt": "2025-12-23T10:00:00Z"
    },
    "identities": [...],
    "devices": [
      {
        "id": "uuid",
        "deviceId": "xxx",
        "platform": "IOS",
        "model": "iPhone 15 Pro",
        "lastActiveAt": "2025-12-23T10:00:00Z"
      }
    ],
    "linkedAccounts": [...],
    "subscription": {
      "planType": "PRO",
      "status": "ACTIVE",
      "transactions": [...]
    },
    "activityStats": {
      "totalReadingMinutes": 1200,
      "totalAIInteractions": 350,
      "vocabularySize": 500
    }
  }

# 搜索账号（支持多种条件）
GET /api/admin/accounts/search
Query:
  ?email=user@example.com
  &deviceId=xxx
  &appleId=xxx
  &accountType=REGISTERED
  &subscriptionStatus=ACTIVE
  &page=1&limit=20
Response:
  {
    "accounts": [...],
    "pagination": {...}
  }

# 查看账号关联图谱
GET /api/admin/accounts/:accountId/graph
Response:
  {
    "nodes": [
      { "id": "uuid", "type": "REGISTERED", "label": "主账号" },
      { "id": "uuid", "type": "GUEST", "label": "游客账号 1" },
      { "id": "uuid", "type": "GUEST", "label": "游客账号 2" }
    ],
    "edges": [
      { "from": "guest1", "to": "main", "type": "MERGED", "date": "2025-12-15" },
      { "from": "guest2", "to": "main", "type": "MERGED", "date": "2025-12-20" }
    ]
  }
```

---

## 6. 安全设计

### 6.1 Token 结构

```typescript
// Access Token Payload
interface AccessTokenPayload {
  // 标准 JWT Claims
  sub: string;        // Account ID
  iat: number;        // Issued At
  exp: number;        // Expiration (7 days)

  // Custom Claims
  accountType: 'GUEST' | 'REGISTERED';
  deviceId: string;
  sessionId: string;  // 用于追踪和撤销

  // 安全校验
  fingerprint: string; // 设备指纹 hash
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string;        // Account ID
  jti: string;        // Token ID (用于撤销)
  iat: number;
  exp: number;        // 30 days

  deviceId: string;
  family: string;     // Token family (用于检测重放攻击)
}
```

### 6.2 API 安全校验流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      API Security Validation Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Request                                                                │
│      │                                                                   │
│      ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 1. Rate Limiting                                                 │   │
│   │    • Guest: 60 req/min                                          │   │
│   │    • Registered: 120 req/min                                    │   │
│   │    • Pro: 300 req/min                                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│      │                                                                   │
│      ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 2. JWT Validation                                                │   │
│   │    • Verify signature                                           │   │
│   │    • Check expiration                                           │   │
│   │    • Validate account status (not SUSPENDED/DELETED)            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│      │                                                                   │
│      ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 3. Device Binding Validation                                     │   │
│   │    • Extract X-Device-ID header                                 │   │
│   │    • Compare with token.deviceId                                │   │
│   │    • Flag if mismatch (potential token theft)                   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│      │                                                                   │
│      ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 4. Permission Check                                              │   │
│   │    • accountType gates certain endpoints                        │   │
│   │    • subscription tier gates premium features                   │   │
│   │    • Guest: limited AI interactions, no subscription            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│      │                                                                   │
│      ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 5. Audit Logging                                                 │   │
│   │    • Log accountId, deviceId, action, IP, timestamp             │   │
│   │    • Track sensitive operations                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│      │                                                                   │
│      ▼                                                                   │
│   Response                                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Request Headers

```typescript
// 必需的请求头
interface RequiredHeaders {
  'Authorization': `Bearer ${accessToken}`;
  'X-Device-ID': string;      // 设备唯一标识
  'X-App-Version': string;    // 应用版本
  'X-Platform': 'ios' | 'android' | 'web';
}

// 可选的请求头（用于增强安全）
interface OptionalHeaders {
  'X-Request-ID': string;     // 请求追踪 ID
  'X-Timezone': string;       // 用户时区
  'X-Locale': string;         // 用户语言
  'X-Device-Fingerprint': string; // 设备指纹
}
```

---

## 7. 日志设计

### 7.1 日志结构

```typescript
interface AccountLog {
  // 基础信息
  id: string;
  timestamp: string;          // ISO 8601
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

  // 账号信息 (核心要求)
  account: {
    id: string;
    type: 'GUEST' | 'REGISTERED';
    email?: string;           // 脱敏: u***@example.com
  };

  // 设备信息
  device: {
    id: string;
    platform: string;
    appVersion: string;
  };

  // 请求上下文
  request: {
    id: string;               // Correlation ID
    method: string;
    path: string;
    ip: string;               // 脱敏或哈希
    userAgent: string;
  };

  // 事件详情
  event: {
    category: string;         // 'AUTH', 'ACCOUNT', 'SUBSCRIPTION', 'READING'
    action: string;           // 'LOGIN', 'LOGOUT', 'UPGRADE', etc.
    result: 'SUCCESS' | 'FAILURE';
    errorCode?: string;
    errorMessage?: string;
  };

  // 业务数据 (根据事件类型)
  data?: Record<string, any>;

  // 性能指标
  duration?: number;          // ms
}
```

### 7.2 日志示例

```json
// 游客账号创建
{
  "id": "log_abc123",
  "timestamp": "2025-12-23T10:00:00.000Z",
  "level": "INFO",
  "account": {
    "id": "acc_guest_123",
    "type": "GUEST"
  },
  "device": {
    "id": "dev_xyz",
    "platform": "ios",
    "appVersion": "1.0.0"
  },
  "request": {
    "id": "req_123",
    "method": "POST",
    "path": "/api/v1/auth/guest",
    "ip": "xxx.xxx.xxx.xxx",
    "userAgent": "Readmigo/1.0 (iPhone; iOS 17.2)"
  },
  "event": {
    "category": "AUTH",
    "action": "GUEST_CREATED",
    "result": "SUCCESS"
  },
  "data": {
    "deviceModel": "iPhone 15 Pro",
    "osVersion": "17.2"
  },
  "duration": 45
}

// 游客升级为正式账号
{
  "id": "log_def456",
  "timestamp": "2025-12-23T11:00:00.000Z",
  "level": "INFO",
  "account": {
    "id": "acc_reg_456",
    "type": "REGISTERED",
    "email": "u***r@example.com"
  },
  "device": {
    "id": "dev_xyz",
    "platform": "ios",
    "appVersion": "1.0.0"
  },
  "request": {
    "id": "req_456",
    "method": "POST",
    "path": "/api/v1/auth/upgrade",
    "ip": "xxx.xxx.xxx.xxx",
    "userAgent": "Readmigo/1.0 (iPhone; iOS 17.2)"
  },
  "event": {
    "category": "AUTH",
    "action": "GUEST_UPGRADED",
    "result": "SUCCESS"
  },
  "data": {
    "previousAccountId": "acc_guest_123",
    "upgradeType": "MERGED",
    "identityProvider": "APPLE",
    "dataMigrated": true,
    "migratedItems": {
      "userBooks": 3,
      "vocabulary": 150,
      "readingSessions": 15
    }
  },
  "duration": 1250
}
```

### 7.3 关键审计事件

| 事件类别 | 事件类型 | 日志级别 | 保留期限 |
|---------|---------|---------|---------|
| AUTH | GUEST_CREATED | INFO | 90 天 |
| AUTH | LOGIN | INFO | 90 天 |
| AUTH | LOGOUT | INFO | 90 天 |
| AUTH | GUEST_UPGRADED | INFO | 永久 |
| AUTH | TOKEN_REFRESH | DEBUG | 30 天 |
| AUTH | LOGIN_FAILED | WARN | 180 天 |
| ACCOUNT | ACCOUNT_MERGED | INFO | 永久 |
| ACCOUNT | ACCOUNT_DELETED | INFO | 永久 |
| ACCOUNT | SETTINGS_CHANGED | INFO | 90 天 |
| SUBSCRIPTION | PURCHASE | INFO | 永久 |
| SUBSCRIPTION | RENEWAL | INFO | 永久 |
| SUBSCRIPTION | CANCELLATION | INFO | 永久 |
| SUBSCRIPTION | REFUND | WARN | 永久 |
| SECURITY | SUSPICIOUS_ACTIVITY | WARN | 365 天 |
| SECURITY | TOKEN_REUSE_DETECTED | ERROR | 365 天 |

---

## 8. 行业最佳实践补充

### 8.1 匿名用户识别 (Anonymous User ID)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Anonymous User Identification                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  参考: Amplitude, Mixpanel, Segment 的实践                              │
│                                                                          │
│  核心概念:                                                               │
│  • Anonymous ID: 基于设备的持久化标识                                    │
│  • User ID: 登录后的正式用户 ID                                         │
│  • Alias: 将 Anonymous ID 与 User ID 关联                               │
│                                                                          │
│  实现:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  install  ─────► anonymous_id = UUID (stored in keychain)       │    │
│  │                                                                  │    │
│  │  login    ─────► alias(anonymous_id, user_id)                   │    │
│  │                  所有 anonymous_id 的数据归属到 user_id          │    │
│  │                                                                  │    │
│  │  logout   ─────► new anonymous_id (可选)                        │    │
│  │                  或保留原 anonymous_id 继续追踪                   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  优势:                                                                   │
│  • 完整的用户旅程追踪（从匿名到注册）                                    │
│  • 更准确的转化漏斗分析                                                  │
│  • 支持跨设备用户识别                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 账号链接与合并策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Account Linking Strategies                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  参考: Firebase Auth, Auth0, Supabase 的实践                            │
│                                                                          │
│  1. 自动链接 (Auto-linking)                                             │
│     • 当新登录的邮箱与现有账号匹配时自动合并                             │
│     • 风险: 邮箱可能被他人注册                                          │
│     • 建议: 仅在邮箱已验证时自动链接                                    │
│                                                                          │
│  2. 手动链接 (Manual linking)                                           │
│     • 用户在设置中主动添加其他登录方式                                   │
│     • 需要验证两个身份都属于同一用户                                     │
│     • 更安全但用户体验稍差                                              │
│                                                                          │
│  3. 智能提示链接 (Prompted linking)                                     │
│     • 检测到可能的重复账号时提示用户                                     │
│     • 例如: "我们发现您可能已有账号，是否合并？"                         │
│     • 平衡了安全性和用户体验                                            │
│                                                                          │
│  建议 Readmigo 采用: 智能提示链接 + 手动链接                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 数据隔离与隐私合规

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Data Isolation & Privacy Compliance                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  GDPR / CCPA 合规要求:                                                  │
│                                                                          │
│  1. 数据可携带性 (Data Portability)                                     │
│     • 用户可导出所有个人数据                                            │
│     • 包括账号信息、学习记录、订阅历史                                   │
│     • API: GET /api/v1/account/export                                   │
│                                                                          │
│  2. 删除权 (Right to Erasure)                                           │
│     • 用户可请求删除所有数据                                            │
│     • 软删除 + 30天冷却期 + 硬删除                                      │
│     • 保留匿名化的统计数据用于分析                                       │
│     • API: DELETE /api/v1/account/me                                    │
│                                                                          │
│  3. 游客数据处理                                                        │
│     • 游客数据 90 天后自动清理（未转化为正式用户）                       │
│     • 明确告知用户游客数据的临时性                                       │
│     • 提供"保存进度"提示鼓励注册                                        │
│                                                                          │
│  4. 数据隔离                                                            │
│     • 多账号用户的数据在合并前完全隔离                                   │
│     • 合并需要用户明确同意                                              │
│     • 合并后原账号数据保留审计痕迹                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.4 账号安全增强

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Account Security Enhancements                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. 异常登录检测                                                        │
│     • 新设备登录通知                                                    │
│     • 异常地理位置警告                                                  │
│     • 短时间内多次失败尝试锁定                                          │
│                                                                          │
│  2. Token 安全                                                          │
│     • Refresh Token Rotation (每次刷新生成新 token)                     │
│     • Token Family 追踪 (检测重放攻击)                                  │
│     • 可撤销的 Token (Redis 黑名单)                                     │
│                                                                          │
│  3. 设备信任管理                                                        │
│     • 用户可查看所有已登录设备                                          │
│     • 支持远程登出指定设备                                              │
│     • 设备绑定 Token (Token 与设备 ID 绑定)                             │
│                                                                          │
│  4. 敏感操作保护                                                        │
│     • 修改邮箱/绑定新身份需要重新认证                                    │
│     • 删除账号需要额外确认步骤                                          │
│     • 管理员操作需要 MFA                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.5 多账号场景处理

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Multi-Account Scenarios                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  场景 1: 用户有多个社交账号                                             │
│  ─────────────────────────────                                           │
│  用户同时有 Apple ID 和 Google 账号，想要统一                           │
│                                                                          │
│  解决方案:                                                               │
│  • 主账号设置: 用户选择一个作为主账号                                   │
│  • 身份链接: 其他登录方式链接到主账号                                   │
│  • 统一数据: 所有数据归属主账号                                         │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  场景 2: 家庭共享设备                                                   │
│  ───────────────────────                                                 │
│  一个 iPad 被家庭成员共享使用                                           │
│                                                                          │
│  解决方案:                                                               │
│  • 支持设备上的账号切换                                                 │
│  • 本地数据按账号隔离                                                   │
│  • 提供快速切换入口                                                     │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  场景 3: 误创建多个账号                                                 │
│  ─────────────────────────                                               │
│  用户不小心用不同方式创建了多个账号，想要合并                           │
│                                                                          │
│  解决方案:                                                               │
│  • 账号合并功能 (Settings -> Account -> Merge Accounts)                 │
│  • 需要验证两个账号的所有权                                             │
│  • 数据合并策略 (保留更完整的数据)                                      │
│  • 订阅迁移 (如果有付费)                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Dashboard 展示设计

### 9.1 用户详情页

```
┌─────────────────────────────────────────────────────────────────────────┐
│  User Detail - John Doe                                      [Actions ▼]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ Basic Info                      │  │ Subscription                │   │
│  │                                 │  │                             │   │
│  │ Account ID: acc_abc123          │  │ Plan: PRO                   │   │
│  │ Type: REGISTERED                │  │ Status: ACTIVE              │   │
│  │ Status: ACTIVE                  │  │ Expires: 2026-01-01         │   │
│  │ Email: user@example.com         │  │                             │   │
│  │ Created: 2025-01-01             │  │ Total Spent: $49.99         │   │
│  │ Last Active: 2 hours ago        │  │                             │   │
│  └─────────────────────────────────┘  └─────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Linked Accounts                                                   │   │
│  │                                                                   │   │
│  │  ┌──────────┐      ┌──────────┐      ┌──────────┐                │   │
│  │  │  Guest   │ ───► │  Main    │ ◄─── │  Guest   │                │   │
│  │  │ acc_g1   │      │ acc_abc  │      │ acc_g2   │                │   │
│  │  │ Merged   │      │ Current  │      │ Merged   │                │   │
│  │  │ 12/15    │      │          │      │ 12/20    │                │   │
│  │  └──────────┘      └──────────┘      └──────────┘                │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Identities                                                        │   │
│  │                                                                   │   │
│  │  Provider    │ Email              │ Primary │ Last Used          │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  Apple       │ user@icloud.com    │ Yes     │ 2 hours ago        │   │
│  │  Google      │ user@gmail.com     │ No      │ 1 week ago         │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Devices                                                           │   │
│  │                                                                   │   │
│  │  Device         │ Platform │ App Ver │ Last Active              │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  iPhone 15 Pro  │ iOS 17.2 │ 1.0.0   │ 2 hours ago (Current)   │   │
│  │  iPad Pro       │ iOS 17.1 │ 1.0.0   │ 3 days ago              │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Transaction History                                               │   │
│  │                                                                   │   │
│  │  Date       │ Product              │ Type      │ Amount          │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  2025-12-01 │ Pro Yearly           │ Purchase  │ $49.99          │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 账号关联图谱

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Account Relationship Graph                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                              ┌────────────────┐                         │
│                              │   Registered   │                         │
│                              │   acc_abc123   │                         │
│                              │                │                         │
│                              │  Apple + Google│                         │
│                              │  Pro Subscriber│                         │
│                              └───────┬────────┘                         │
│                                      │                                   │
│                    ┌─────────────────┼─────────────────┐                │
│                    │                 │                 │                │
│                    ▼                 ▼                 ▼                │
│             ┌──────────┐      ┌──────────┐      ┌──────────┐           │
│             │  Guest   │      │  Guest   │      │  Device  │           │
│             │  acc_g1  │      │  acc_g2  │      │  dev_xyz │           │
│             │          │      │          │      │          │           │
│             │ Merged   │      │ Merged   │      │ iPhone   │           │
│             │ 12/15/25 │      │ 12/20/25 │      │ Current  │           │
│             └──────────┘      └──────────┘      └──────────┘           │
│                    │                 │                                   │
│                    │                 │                                   │
│             Data Migrated:    Data Migrated:                            │
│             • 3 books         • 2 books                                 │
│             • 150 vocab       • 80 vocab                                │
│             • 480 min read    • 120 min read                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. 实施计划与进度

### Phase 1: 基础账号体系 ✅ 已完成

| 任务 | 状态 | 实现位置 |
|------|------|----------|
| 扩展数据库 Schema (User, Device, Subscription) | ✅ | `packages/database/prisma/schema.prisma` |
| 实现游客账号创建 API | ✅ | `apps/backend/src/modules/auth/auth.service.ts:259-335` |
| 实现游客升级流程 | ✅ | `apps/backend/src/modules/auth/auth.service.ts:337-440` |
| 添加设备绑定逻辑 | ✅ | `apps/backend/src/modules/devices/` |
| 更新 iOS 客户端 AuthManager | ✅ | `ios/Readmigo/Features/Auth/AuthManager.swift` |
| 更新 Android 客户端 AuthManager | ✅ | `android/app/src/main/java/com/readmigo/app/features/auth/` |

### Phase 2: 数据迁移与安全 ✅ 已完成

| 任务 | 状态 | 实现位置 |
|------|------|----------|
| 实现数据迁移服务 (游客→正式账号) | ✅ | `auth.service.ts:migrateGuestData()` |
| 添加 Token 安全增强 (JWT + Refresh) | ✅ | `apps/backend/src/modules/auth/` |
| 实现设备绑定校验 | ✅ | `devices.controller.ts:check-logout` |
| 添加审计日志 | ✅ | `AccountDeletionLog` 模型 |
| 远程设备登出 | ✅ | `devices.controller.ts:118-150` |

### Phase 3: Dashboard 集成 ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| Admin 用户列表 API | ✅ | `admin.controller.ts:720-757` |
| Admin 用户详情 API | ✅ | 包含订阅、设备信息 |
| Admin 订阅管理 API | ✅ | 扩展/授权/撤销订阅 |
| 账号关联图谱展示 API | ✅ | `admin.service.ts:654-799 getUserAccountGraph()` |
| 消费记录查询 API | ✅ | `admin.service.ts getTransactions()` + `getUserBilling()` |
| 账号搜索增强 | ✅ | 支持 deviceId, appleId, googleId, subscriptionStatus 等高级筛选 |

### Phase 4: 高级功能 ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| 多账号合并功能 | ✅ | 后端 `boundTo` 关系已支持，Dashboard 可查看合并记录 |
| 账号切换优化 | ⚠️ | 客户端待优化 |
| 数据导出功能 (GDPR) | ✅ | `users.service.ts:813-998 exportUserData()` + `admin.controller.ts:795-798` |
| 账号删除流程 | ✅ | 30天冷静期完整实现 |

### Phase 5: Web 客户端完善 ❌ 待开始

| 任务 | 状态 | 说明 |
|------|------|------|
| 游客认证 API 集成 | ❌ | NextAuth 已配置，Guest 模式待实现 |
| Guest 模式状态管理 | ❌ | 待实现 |
| 账号升级流程 UI | ❌ | 待实现 |

### Phase 6: ID 格式迁移 ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| AccountIdService 设计 | ✅ | `common/services/account-id.service.ts` |
| UUID → ULID 迁移脚本 | ✅ | `packages/database/scripts/migrate-uuid-to-ulid.ts` |
| 向后兼容性处理 | ✅ | `users.controller.ts:125-147 getAccountId()` |
| 迁移验证测试 | ✅ | 脚本内含 verify 模式 |

---

## 10.1 实现总结

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Implementation Progress Summary                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Component          │ Progress │ Status                          │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ Database Schema    │ ████████ │ 100% - 完整实现                 │    │
│  │ Backend API        │ ████████ │ 100% - 认证/设备/订阅完整       │    │
│  │ iOS Client         │ ████████ │ 100% - AuthManager 完整         │    │
│  │ Android Client     │ ████████ │ 100% - Kotlin 实现完整          │    │
│  │ Web Client         │ ████░░░░ │ 50%  - NextAuth 已配置          │    │
│  │ Admin Dashboard    │ ████████ │ 100% - API 完成，UI 待完善      │    │
│  │ Data Migration     │ ████████ │ 100% - 迁移脚本就绪             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Overall Progress: ██████████████████░░ 90%                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 关键代码位置速查

| 功能 | 文件路径 |
|------|---------|
| Prisma Schema | `packages/database/prisma/schema.prisma` |
| 游客认证 | `apps/backend/src/modules/auth/auth.service.ts:259-335` |
| 账号升级 | `apps/backend/src/modules/auth/auth.service.ts:337-440` |
| 数据迁移 | `apps/backend/src/modules/auth/auth.service.ts:migrateGuestData()` |
| 账号删除 | `apps/backend/src/modules/users/users.service.ts:430-767` |
| 数据导出 (GDPR) | `apps/backend/src/modules/users/users.service.ts:813-998` |
| 设备管理 | `apps/backend/src/modules/devices/devices.controller.ts` |
| iOS Auth | `ios/Readmigo/Features/Auth/AuthManager.swift` |
| Android Auth | `android/app/src/main/java/com/readmigo/app/features/auth/` |
| Admin API | `apps/backend/src/modules/admin/admin.controller.ts` |
| Admin 账号图谱 | `apps/backend/src/modules/admin/admin.service.ts:654-799` |
| Admin 交易查询 | `apps/backend/src/modules/admin/admin.service.ts getTransactions()` |
| ID 生成服务 | `apps/backend/src/common/services/account-id.service.ts` |
| ID 迁移脚本 | `packages/database/scripts/migrate-uuid-to-ulid.ts` |

---

## 11. 开放问题与决策记录

### 已解决问题

| 问题 | 决策 | 实现状态 |
|------|------|----------|
| 游客数据保留期限 | 90 天后自动清理未转化游客数据 | ✅ 已实现 |
| 多设备同时登录 | 允许，支持多设备管理和远程登出 | ✅ 已实现 |
| 订阅迁移 | 游客无法订阅，升级后继承正式账号订阅 | ✅ 已实现 |
| 历史数据迁移 | 保持 User 模型，添加 accountType 字段区分 | ✅ 已实现 |

### 已决策问题

| 问题 | 决策 |
|------|------|
| ID 格式迁移时机 | 停机维护 |
| Web 客户端优先级 | 移动端优先，Web 游客模式后续实现 |
| 账号合并 UI 设计 | 自动后台合并，Dashboard 可查看合并记录 |

---

## 12. 相关文档

| 文档 | 位置 | 说明 |
|------|------|------|
| **登录需求同步** | `docs/07-modules/account/login-requirements-sync.md` | API 登录需求矩阵，设计与实现差异 |
| **登录必要性分析** | `docs/03-architecture/login-necessity-analysis.md` | 登录场景分析，什么时候非登录不可 |
| **用户权限规格** | `docs/07-modules/account/user-permissions-spec.md` | 权限矩阵和功能限制实现 |
| **iOS Guest 模式** | `docs/04-development/platforms/ios/guest-mode-plan.md` | iOS 客户端实现计划 |
| **Guest 模式（模块）** | `docs/07-modules/modules/guest-mode.md` | 跨平台 Guest 模式定义 |

---

## 13. 附录

### A. 术语表

| 术语 | 定义 |
|-----|------|
| Account | 统一账号实体，包括游客和正式用户 |
| Identity | 身份提供者绑定（Apple、Google 等） |
| Device | 用户设备信息 |
| Binding | 游客账号与正式账号的关联关系 |
| Migration | 账号合并时的数据迁移 |

### B. 参考资料

- [Firebase Authentication - Account Linking](https://firebase.google.com/docs/auth/web/account-linking)
- [Auth0 - Account Linking](https://auth0.com/docs/manage-users/user-accounts/user-account-linking)
- [Segment - Identity Resolution](https://segment.com/docs/personas/identity-resolution/)
- [GDPR - Data Portability](https://gdpr-info.eu/art-20-gdpr/)

---

**Document Status**: Implementation Complete (90%)
**Last Updated**: 2025-12-28
**Next Steps**:
- Phase 5: Web 客户端游客模式
- Phase 6: 执行 ID 格式迁移 (需停机维护)
