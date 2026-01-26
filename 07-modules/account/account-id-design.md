# Readmigo 账号ID格式设计文档

> Version: 2.0.0
> Status: Draft - Pending Review
> Author: System Architect
> Date: 2025-12-23

---

## 1. 概述

### 1.1 设计目标

账号ID是全栈系统的**核心标识符**，用于：

| 用途 | 说明 |
|------|------|
| **日志关联** | API日志、BE日志、FE日志、Client日志统一搜索 |
| **崩溃追踪** | Sentry中通过账号ID定位用户相关崩溃 |
| **Dashboard查询** | 账单、阅读时长、反馈、建议、阅读数据、书籍等 |
| **数据分析** | 用户行为分析、转化漏斗、留存分析 |
| **客服支持** | 快速定位用户问题和历史记录 |

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **精简高效** | 最短格式，节省带宽和存储 |
| **类型可识别** | 首字符区分账号类型 |
| **全局唯一** | 无需协调，分布式生成 |
| **时间有序** | 支持按创建时间排序 |
| **全栈一致** | 从Client到DB使用同一ID |

---

## 2. 账号ID格式

### 2.1 格式规范

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Account ID Format (v2)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  格式: {type}{ulid}                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   g01HV6BGKCPG3M8QDJX9Y7CJ5ZA                                       │    │
│  │   │└────────────────────────────┘                                   │    │
│  │   │              │                                                   │    │
│  │   │              └── ULID (26 chars): 时间戳 + 随机数               │    │
│  │   │                                                                  │    │
│  │   └── 类型前缀 (1 char): g=游客, r=正式, s=系统                     │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  示例:                                                                       │
│  • 游客账号:   g01HV6BGKCPG3M8QDJX9Y7CJ5ZA  (27 chars)                     │
│  • 正式账号:   r01HV6BGKCPG3M8QDJX9Y7CJ5ZB  (27 chars)                     │
│  • 系统账号:   s01HV6BGKCPG3M8QDJX9Y7CJ5ZC  (27 chars)                     │
│                                                                              │
│  对比旧方案:                                                                 │
│  • 旧: usr_guest_01HV6BGKCPG3M8QDJX9Y7CJ5ZA (37 chars)                     │
│  • 新: g01HV6BGKCPG3M8QDJX9Y7CJ5ZA          (27 chars)                     │
│  • 节省: 10 chars/ID = 27% 带宽节省                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 类型前缀定义

| 前缀 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `g` | Guest | 游客账号 | `g01HV6BGKCPG3M8QDJX9Y7CJ5ZA` |
| `r` | Registered | 正式注册账号 | `r01HV6BGKCPG3M8QDJX9Y7CJ5ZB` |
| `s` | System | 系统账号（自动化任务） | `s01HV6BGKCPG3M8QDJX9Y7CJ5ZC` |
| `d` | Deleted | 已注销账号（预留） | `d01HV6BGKCPG3M8QDJX9Y7CJ5ZD` |

### 2.3 ID 验证正则

```typescript
// 账号ID格式正则
const ACCOUNT_ID_PATTERN = /^[grsd][0-9A-HJKMNP-TV-Z]{26}$/i;

// 各类型正则
const GUEST_ID_PATTERN = /^g[0-9A-HJKMNP-TV-Z]{26}$/i;
const REGISTERED_ID_PATTERN = /^r[0-9A-HJKMNP-TV-Z]{26}$/i;
const SYSTEM_ID_PATTERN = /^s[0-9A-HJKMNP-TV-Z]{26}$/i;
const DELETED_ID_PATTERN = /^d[0-9A-HJKMNP-TV-Z]{26}$/i;
```

### 2.4 容量规划

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Capacity Analysis                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ULID 容量:                                                                 │
│  • 时间戳: 48 bits = 可用至 10889 年                                       │
│  • 随机数: 80 bits = 每毫秒 1.21 × 10^24 个唯一ID                          │
│                                                                              │
│  10年用户增长预估:                                                          │
│  ────────────────────────────────────────────────────────────────────────   │
│  Year 1:   1M 用户    → ULID 完全满足                                      │
│  Year 5:   100M 用户  → ULID 完全满足                                      │
│  Year 10:  1B 用户    → ULID 完全满足                                      │
│                                                                              │
│  带宽节省估算 (按日活 100K, 每用户 50 次 API 调用):                        │
│  • 旧方案: 37 chars × 50 × 100K = 185 MB/天                                │
│  • 新方案: 27 chars × 50 × 100K = 135 MB/天                                │
│  • 节省: 50 MB/天 = 27%                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 全链路追踪设计

### 3.1 账号ID作为统一标识

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Account ID: Cross-System Correlation                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           Account ID: r01HV6BGK...                          │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐       │
│  │   Client    │           │   Backend   │           │  Dashboard  │       │
│  │    Logs     │           │    Logs     │           │   Queries   │       │
│  │             │           │             │           │             │       │
│  │ • Sentry    │           │ • API Logs  │           │ • 账单      │       │
│  │ • Analytics │           │ • Error Log │           │ • 阅读时长  │       │
│  │ • Crashlytics│          │ • Audit Log │           │ • 反馈建议  │       │
│  └─────────────┘           └─────────────┘           │ • 阅读数据  │       │
│                                                       │ • 书籍列表  │       │
│                                                       └─────────────┘       │
│                                                                              │
│  搜索示例:                                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Sentry:    account_id:r01HV6BGKCPG3M8QDJX9Y7CJ5ZB                       │
│  • ELK:       accountId:"r01HV6BGKCPG3M8QDJX9Y7CJ5ZB"                      │
│  • Dashboard: /admin/users/r01HV6BGKCPG3M8QDJX9Y7CJ5ZB                     │
│  • SQL:       WHERE account_id = 'r01HV6BGKCPG3M8QDJX9Y7CJ5ZB'             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 日志格式规范

```typescript
// ============================================
// 统一日志格式 - 必须包含 accountId
// ============================================

// API 请求日志
interface APILog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';

  // 核心标识 - 必填
  accountId: string;        // r01HV6BGK...
  requestId: string;        // 请求追踪ID

  // 请求信息
  method: string;
  path: string;
  statusCode: number;
  duration: number;

  // 上下文
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

// Backend 业务日志
interface BusinessLog {
  timestamp: string;
  level: string;

  // 核心标识 - 必填
  accountId: string;

  // 业务信息
  module: string;           // 'reading', 'subscription', 'medal'
  action: string;           // 'session_start', 'purchase', 'unlock'
  data?: Record<string, any>;
}

// 错误日志
interface ErrorLog {
  timestamp: string;
  level: 'ERROR';

  // 核心标识 - 必填
  accountId: string;
  requestId?: string;

  // 错误信息
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, any>;
}
```

### 3.3 Sentry 集成

```typescript
// ============================================
// Sentry 配置 - 关联账号ID
// ============================================

// iOS Client
import Sentry

func configureSentry(accountId: String) {
    SentrySDK.configureScope { scope in
        scope.setUser(Sentry.User(userId: accountId))
        scope.setTag("account_type", accountId.hasPrefix("g") ? "guest" : "registered")
    }
}

// Backend NestJS
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const accountId = request.user?.accountId;

    if (accountId) {
      Sentry.setUser({ id: accountId });
      Sentry.setTag('account_type', accountId.startsWith('g') ? 'guest' : 'registered');
    }

    return next.handle();
  }
}
```

### 3.4 Dashboard 数据关联

```typescript
// ============================================
// Dashboard 统一查询接口
// ============================================

interface AccountDashboardData {
  accountId: string;                    // r01HV6BGK...

  // 基础信息
  profile: {
    displayName: string;
    email?: string;
    createdAt: Date;
    lastActiveAt: Date;
  };

  // 账单信息
  billing: {
    subscription: SubscriptionInfo;
    transactions: Transaction[];
    totalSpent: number;
  };

  // 阅读数据
  reading: {
    totalDuration: number;              // 总阅读时长(分钟)
    booksRead: number;                  // 已读书籍数
    currentStreak: number;              // 连续阅读天数
    dailyStats: DailyReadingStat[];
  };

  // 反馈与建议
  feedback: {
    submissions: FeedbackItem[];
    ratings: AppRating[];
  };

  // 勋章
  medals: {
    unlocked: Medal[];
    progress: MedalProgress[];
  };
}

// Dashboard API
GET /admin/accounts/:accountId
GET /admin/accounts/:accountId/billing
GET /admin/accounts/:accountId/reading
GET /admin/accounts/:accountId/feedback
GET /admin/accounts/:accountId/medals
```

---

## 4. ID 生成服务

### 4.1 TypeScript 实现

```typescript
// ============================================
// account-id.service.ts
// ============================================

import { ulid, decodeTime } from 'ulid';
import { Injectable } from '@nestjs/common';

export enum AccountType {
  GUEST = 'g',
  REGISTERED = 'r',
  SYSTEM = 's',
  DELETED = 'd',
}

export interface ParsedAccountId {
  type: AccountType;
  ulid: string;
  timestamp: Date;
  isValid: boolean;
}

@Injectable()
export class AccountIdService {
  private readonly ID_PATTERN = /^[grsd][0-9A-HJKMNP-TV-Z]{26}$/i;

  /**
   * 生成游客账号ID
   */
  generateGuestId(): string {
    return `g${ulid()}`;
  }

  /**
   * 生成正式账号ID
   */
  generateRegisteredId(): string {
    return `r${ulid()}`;
  }

  /**
   * 生成系统账号ID
   */
  generateSystemId(): string {
    return `s${ulid()}`;
  }

  /**
   * 验证ID格式
   */
  isValidId(id: string): boolean {
    return this.ID_PATTERN.test(id);
  }

  /**
   * 解析账号ID
   */
  parseId(id: string): ParsedAccountId | null {
    if (!this.isValidId(id)) return null;

    const type = id[0] as AccountType;
    const ulidPart = id.slice(1);

    try {
      const timestamp = new Date(decodeTime(ulidPart));
      return { type, ulid: ulidPart, timestamp, isValid: true };
    } catch {
      return null;
    }
  }

  /**
   * 获取账号类型
   */
  getType(id: string): AccountType | null {
    if (!this.isValidId(id)) return null;
    return id[0] as AccountType;
  }

  /**
   * 类型判断快捷方法
   */
  isGuest(id: string): boolean {
    return id?.startsWith('g') && this.isValidId(id);
  }

  isRegistered(id: string): boolean {
    return id?.startsWith('r') && this.isValidId(id);
  }

  isSystem(id: string): boolean {
    return id?.startsWith('s') && this.isValidId(id);
  }

  isDeleted(id: string): boolean {
    return id?.startsWith('d') && this.isValidId(id);
  }

  /**
   * 获取创建时间
   */
  getCreatedAt(id: string): Date | null {
    return this.parseId(id)?.timestamp ?? null;
  }
}
```

### 4.2 iOS Swift 实现

```swift
// ============================================
// AccountIdService.swift
// ============================================

import Foundation

enum AccountType: String {
    case guest = "g"
    case registered = "r"
    case system = "s"
    case deleted = "d"
}

struct ParsedAccountId {
    let type: AccountType
    let ulid: String
    let timestamp: Date
}

final class AccountIdService {
    static let shared = AccountIdService()
    private init() {}

    private let idPattern = "^[grsd][0-9A-HJKMNP-TV-Z]{26}$"

    // MARK: - Generation (主要由后端生成)

    func generateLocalGuestId() -> String {
        return "g\(ULID.generate())"
    }

    // MARK: - Validation

    func isValid(_ id: String) -> Bool {
        id.range(of: idPattern, options: .regularExpression) != nil
    }

    // MARK: - Parsing

    func parse(_ id: String) -> ParsedAccountId? {
        guard isValid(id) else { return nil }

        let typeChar = String(id.prefix(1))
        let ulidPart = String(id.dropFirst())

        guard let type = AccountType(rawValue: typeChar),
              let timestamp = ULID.decodeTimestamp(from: ulidPart) else {
            return nil
        }

        return ParsedAccountId(type: type, ulid: ulidPart, timestamp: timestamp)
    }

    // MARK: - Type Checking

    func getType(_ id: String) -> AccountType? {
        guard isValid(id), let first = id.first else { return nil }
        return AccountType(rawValue: String(first))
    }

    func isGuest(_ id: String) -> Bool { id.hasPrefix("g") && isValid(id) }
    func isRegistered(_ id: String) -> Bool { id.hasPrefix("r") && isValid(id) }
    func isSystem(_ id: String) -> Bool { id.hasPrefix("s") && isValid(id) }
    func isDeleted(_ id: String) -> Bool { id.hasPrefix("d") && isValid(id) }
}

// MARK: - ULID

struct ULID {
    private static let chars = Array("0123456789ABCDEFGHJKMNPQRSTVWXYZ")

    static func generate() -> String {
        let ts = UInt64(Date().timeIntervalSince1970 * 1000)
        var result = ""

        // Timestamp (10 chars)
        var t = ts
        for _ in 0..<10 {
            result = String(chars[Int(t & 0x1F)]) + result
            t >>= 5
        }

        // Random (16 chars)
        for _ in 0..<16 {
            result += String(chars[Int.random(in: 0..<32)])
        }

        return result
    }

    static func decodeTimestamp(from ulid: String) -> Date? {
        guard ulid.count == 26 else { return nil }

        var ts: UInt64 = 0
        for char in ulid.prefix(10) {
            guard let idx = chars.firstIndex(of: char.uppercased().first ?? " ") else { return nil }
            ts = (ts << 5) | UInt64(idx)
        }

        return Date(timeIntervalSince1970: Double(ts) / 1000)
    }
}
```

---

## 5. 账号注销设计

### 5.1 注销流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Account Deletion Flow                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   用户请求注销                                                               │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────┐                                                           │
│   │ 身份验证    │  重新登录验证身份                                          │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │ 冷静期确认  │  告知 30 天冷静期，可撤销                                  │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐     ┌─────────────────────────────────────────┐          │
│   │ 立即执行    │────►│ 1. 状态改为 PENDING_DELETION             │          │
│   │ (软删除)    │     │ 2. 清除敏感数据（密码、Token）           │          │
│   └──────┬──────┘     │ 3. 发送确认邮件                          │          │
│          │            │ 4. 记录注销日志                          │          │
│          │            └─────────────────────────────────────────┘          │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │ 30天冷静期  │  用户可随时取消注销，恢复账号                              │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐     ┌─────────────────────────────────────────┐          │
│   │ 定时任务    │────►│ 1. 状态改为 DELETED                       │          │
│   │ (硬删除)    │     │ 2. ID前缀改为 d (dxxx)                   │          │
│   └─────────────┘     │ 3. 删除个人数据 (GDPR)                   │          │
│                       │ 4. 保留匿名化统计数据                     │          │
│                       │ 5. 保留交易记录 (法规要求)                │          │
│                       └─────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 数据处理策略

```typescript
// ============================================
// account-deletion.service.ts
// ============================================

@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountIdService: AccountIdService,
  ) {}

  /**
   * 请求注销账号 - 开始冷静期
   */
  async requestDeletion(accountId: string): Promise<void> {
    // 验证账号存在且活跃
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.status !== 'ACTIVE') {
      throw new BadRequestException('Account not found or already inactive');
    }

    // 计算删除时间（30天后）
    const scheduledDeletionAt = new Date();
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

    await this.prisma.$transaction(async (tx) => {
      // 1. 更新账号状态
      await tx.account.update({
        where: { id: accountId },
        data: {
          status: 'PENDING_DELETION',
          scheduledDeletionAt,
        },
      });

      // 2. 撤销所有活跃 Token
      await tx.refreshToken.deleteMany({
        where: { accountId },
      });

      // 3. 记录注销请求
      await tx.accountDeletionLog.create({
        data: {
          accountId,
          action: 'DELETION_REQUESTED',
          scheduledAt: scheduledDeletionAt,
        },
      });
    });

    // 4. 发送确认邮件
    await this.sendDeletionConfirmationEmail(account);
  }

  /**
   * 取消注销 - 恢复账号
   */
  async cancelDeletion(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (account?.status !== 'PENDING_DELETION') {
      throw new BadRequestException('Account is not pending deletion');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: accountId },
        data: {
          status: 'ACTIVE',
          scheduledDeletionAt: null,
        },
      });

      await tx.accountDeletionLog.create({
        data: {
          accountId,
          action: 'DELETION_CANCELLED',
        },
      });
    });
  }

  /**
   * 执行永久删除 - 定时任务调用
   */
  async executePermanentDeletion(accountId: string): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: { subscription: true },
    });

    if (account?.status !== 'PENDING_DELETION') {
      throw new Error('Account not in pending deletion state');
    }

    // 生成新的已删除ID (保留ULID部分，仅改前缀)
    const deletedId = 'd' + accountId.slice(1);

    await this.prisma.$transaction(async (tx) => {
      // 1. 删除个人数据
      await this.deletePersonalData(tx, accountId);

      // 2. 匿名化统计数据
      await this.anonymizeStatistics(tx, accountId);

      // 3. 更新账号状态和ID
      await tx.account.update({
        where: { id: accountId },
        data: {
          id: deletedId,
          status: 'DELETED',
          email: null,
          displayName: 'Deleted User',
          avatarUrl: null,
          deletedAt: new Date(),
        },
      });

      // 4. 记录删除完成
      await tx.accountDeletionLog.create({
        data: {
          accountId: deletedId,
          action: 'DELETION_COMPLETED',
          deletedData: {
            originalId: accountId,
            deletedAt: new Date().toISOString(),
          },
        },
      });
    });
  }

  /**
   * 删除个人数据 (GDPR 合规)
   */
  private async deletePersonalData(tx: PrismaTransaction, accountId: string): Promise<void> {
    // 删除身份绑定
    await tx.identity.deleteMany({ where: { accountId } });

    // 删除设备关联
    await tx.device.updateMany({
      where: { currentAccountId: accountId },
      data: { currentAccountId: null },
    });

    // 删除推送 Token
    await tx.pushToken.deleteMany({ where: { accountId } });

    // 删除反馈和建议
    await tx.feedback.deleteMany({ where: { accountId } });

    // 删除 AI 对话记录
    await tx.aiInteraction.deleteMany({ where: { accountId } });

    // 清除词汇学习详细记录
    await tx.userVocabulary.deleteMany({ where: { accountId } });
  }

  /**
   * 匿名化统计数据 (保留用于产品分析)
   */
  private async anonymizeStatistics(tx: PrismaTransaction, accountId: string): Promise<void> {
    // 阅读统计 - 保留聚合数据，移除账号关联
    await tx.dailyReadingStats.updateMany({
      where: { accountId },
      data: { accountId: 'ANONYMOUS' },
    });

    // 勋章解锁记录 - 保留用于统计
    await tx.userMedal.updateMany({
      where: { accountId },
      data: { accountId: 'ANONYMOUS' },
    });
  }
}
```

### 5.3 注销 API

```yaml
# 请求注销账号
POST /api/v1/account/delete
Request:
  {
    "confirmation": "DELETE MY ACCOUNT"  # 需要用户输入确认
  }
Response:
  {
    "success": true,
    "scheduledDeletionAt": "2026-01-22T00:00:00Z",
    "message": "Your account will be permanently deleted in 30 days. You can cancel this request anytime before then."
  }

# 取消注销
POST /api/v1/account/delete/cancel
Response:
  {
    "success": true,
    "message": "Account deletion cancelled. Your account is now active."
  }

# 获取注销状态
GET /api/v1/account/delete/status
Response:
  {
    "status": "PENDING_DELETION",
    "scheduledDeletionAt": "2026-01-22T00:00:00Z",
    "daysRemaining": 15,
    "canCancel": true
  }
```

### 5.4 Prisma Schema 更新

```prisma
// 账号状态枚举 - 增加注销相关状态
enum AccountStatus {
  ACTIVE              // 活跃
  SUSPENDED           // 暂停
  MERGED              // 已合并
  PENDING_DELETION    // 待删除（冷静期）
  DELETED             // 已删除
}

model Account {
  id                    String        @id  // gxxx / rxxx / dxxx
  status                AccountStatus @default(ACTIVE)

  // 注销相关字段
  scheduledDeletionAt   DateTime?     // 计划删除时间
  deletedAt             DateTime?     // 实际删除时间
  deletionReason        String?       // 注销原因（可选）

  // ... 其他字段
}

// 注销日志
model AccountDeletionLog {
  id          String   @id @default(uuid())
  accountId   String   // 原账号ID或删除后的ID
  action      DeletionAction

  scheduledAt DateTime?
  executedAt  DateTime?

  deletedData Json?    // 删除的数据摘要（审计用）
  metadata    Json?

  createdAt   DateTime @default(now())

  @@index([accountId])
  @@index([createdAt])
}

enum DeletionAction {
  DELETION_REQUESTED
  DELETION_CANCELLED
  DELETION_COMPLETED
}
```

---

## 6. 数据库设计

### 6.1 Schema 更新

```prisma
model Account {
  // 精简ID格式: gxxx (游客) / rxxx (正式) / sxxx (系统) / dxxx (已删除)
  id              String        @id  // 27 chars

  accountType     AccountType   @default(GUEST)
  status          AccountStatus @default(ACTIVE)

  // ... 其他字段保持不变

  @@index([status])
  @@index([accountType, status])
}
```

### 6.2 查询优化

```sql
-- 账号ID格式使得类型查询高效
-- 游客账号
SELECT * FROM "Account" WHERE id LIKE 'g%';

-- 正式账号
SELECT * FROM "Account" WHERE id LIKE 'r%';

-- 已删除账号
SELECT * FROM "Account" WHERE id LIKE 'd%';

-- 按类型统计
SELECT
  LEFT(id, 1) as type,
  COUNT(*) as count
FROM "Account"
GROUP BY LEFT(id, 1);
```

---

## 7. 账号升级流程

### 7.1 游客升级为正式账号

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Guest to Registered Upgrade                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  原账号: g01HV6BGKCPG3M8QDJX9Y7CJ5ZA (游客)                                 │
│                     │                                                        │
│                     │ 绑定 Apple ID / Google / 手机号                        │
│                     ▼                                                        │
│  新账号: r01HV6BGKF5N6P7QRSTUVWX8YZA (正式)                                 │
│                                                                              │
│  处理流程:                                                                   │
│  1. 生成新的正式账号ID (rxxx)                                               │
│  2. 迁移游客数据到新账号                                                    │
│  3. 游客账号状态改为 MERGED                                                 │
│  4. 建立 AccountBinding 关联记录                                            │
│                                                                              │
│  为什么不复用ID?                                                            │
│  • 通过ID即可永久区分账号来源（游客转化 vs 直接注册）                        │
│  • 便于分析用户转化漏斗                                                     │
│  • 保留完整审计轨迹                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. API 请求规范

### 8.1 请求头

```typescript
// 必需的请求头
interface RequiredHeaders {
  'Authorization': `Bearer ${accessToken}`;
  'X-Account-ID': string;     // gxxx 或 rxxx
  'X-Device-ID': string;
  'X-Request-ID': string;     // 请求追踪ID
}
```

### 8.2 JWT Token

```typescript
interface JwtPayload {
  sub: string;              // Account ID (gxxx 或 rxxx)
  type: 'g' | 'r' | 's';    // 账号类型
  deviceId: string;
  iat: number;
  exp: number;
}
```

---

## 9. 监控与运维

### 9.1 关键指标

```typescript
// Prometheus 指标
const metrics = {
  // ID 生成
  accountsCreated: new Counter({
    name: 'readmigo_accounts_created_total',
    labelNames: ['type'],  // g, r, s
  }),

  // 账号状态
  accountsByStatus: new Gauge({
    name: 'readmigo_accounts_by_status',
    labelNames: ['type', 'status'],
  }),

  // 注销
  deletionRequests: new Counter({
    name: 'readmigo_deletion_requests_total',
  }),
  deletionCancelled: new Counter({
    name: 'readmigo_deletion_cancelled_total',
  }),
  deletionCompleted: new Counter({
    name: 'readmigo_deletion_completed_total',
  }),
};
```

### 9.2 日志搜索示例

```bash
# ELK/CloudWatch 查询示例

# 查找用户所有日志
accountId:"r01HV6BGKCPG3M8QDJX9Y7CJ5ZB"

# 查找游客账号错误
accountId:g* AND level:ERROR

# 查找特定时间段的用户活动
accountId:"r01HV6BGKCPG3M8QDJX9Y7CJ5ZB" AND @timestamp:[2025-12-01 TO 2025-12-31]
```

---

## 10. 实施计划

### Phase 1: ID 格式实现 (优先级: 高)

- [ ] 实现 AccountIdService (BE + iOS)
- [ ] 更新账号创建流程
- [ ] 添加 ID 验证中间件

### Phase 2: 全链路追踪 (优先级: 高)

- [ ] 统一日志格式，必须包含 accountId
- [ ] 配置 Sentry 关联账号ID
- [ ] Dashboard 查询接口实现

### Phase 3: 账号注销 (优先级: 中)

- [ ] 注销 API 实现
- [ ] 冷静期定时任务
- [ ] GDPR 数据删除逻辑

---

## 11. 附录

### A. ID 示例

```
游客账号:    g01HV6BGKCPG3M8QDJX9Y7CJ5ZA
正式账号:    r01HV6BGKCPG3M8QDJX9Y7CJ5ZB
系统账号:    s01HV6BGKCPG3M8QDJX9Y7CJ5ZC
已删除账号:  d01HV6BGKCPG3M8QDJX9Y7CJ5ZD
```

### B. 带宽节省对比

| 方案 | ID长度 | 示例 | 节省 |
|------|--------|------|------|
| 旧方案 | 37 chars | `usr_guest_01HV6BGKCPG3M8...` | - |
| 新方案 | 27 chars | `g01HV6BGKCPG3M8...` | 27% |

---

**Document Status**: Ready for Review
**Next Steps**: 请 review 后提出修改意见

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 已规划 | 20% | 2025-12-23 | 设计文档完成，代码实现待开发 |
| v1.1 | 🚧 实施中 | 60% | 2025-12-27 | AccountIdService 已实现，Schema 已更新 |
| v1.2 | ✅ Phase 2-3 完成 | 85% | 2025-12-27 | 全链路追踪 + 账号注销 API 完成 |
| v1.3 | 🚧 Phase 4 实施中 | 92% | 2025-12-28 | Phase 4.1-4.2 完成 |
| v1.4 | ✅ Phase 4 脚本完成 | 100% | 2025-12-28 | Phase 4.1-4.4 脚本全部完成，待数据库执行 |

### 已完成 ✅
- [x] Account ID 格式设计（前缀 + ULID）
- [x] ID 类型前缀定义（g/r/s/d）
- [x] ULID 生成策略设计
- [x] 全链路追踪设计
- [x] 账号注销流程设计
- [x] 日志格式规范
- [x] 监控指标设计
- [x] **实现 AccountIdService (Backend)** - `apps/backend/src/common/services/account-id.service.ts`
  - [x] ID生成函数（generateGuestId, generateRegisteredId, generateSystemId）
  - [x] ID验证函数（isValidId）
  - [x] 类型解析函数（parseId, getType）
  - [x] 类型判断函数（isGuest, isRegistered, isSystem, isDeleted）
  - [x] 时间戳提取（getCreatedAt）
  - [x] 已注销标记（markAsDeleted）
- [x] **实现 AccountIdService (iOS)** - `ios/Readmigo/Core/Services/AccountIdService.swift`
  - [x] Swift版本的ID验证
  - [x] ID显示格式化
  - [x] ULID生成与解码
- [x] **更新 Prisma Schema** - `packages/database/prisma/schema.prisma`
  - [x] 添加 AccountStatus 枚举（ACTIVE, SUSPENDED, MERGED, PENDING_DELETION, DELETED）
  - [x] 添加 DeletionAction 枚举
  - [x] 添加 AccountDeletionLog 模型
  - [x] User 模型添加 status, scheduledDeletionAt, deletedAt, deletionReason 字段
- [x] **集成 AccountIdService 到 UsersService**
  - [x] 添加账号类型检查方法（isGuestAccount, isRegisteredAccount）
  - [x] 添加账号ID生成方法（generateGuestAccountId, generateRegisteredAccountId）
- [x] **Phase 2: 全链路追踪**
  - [x] 统一日志格式 - RuntimeLog 支持 accountId
  - [x] 配置 Sentry 关联 accountId - `SentryService.setAccountContext()`
  - [x] LogsService 支持 accountId 追踪
- [x] **Phase 3: 账号注销 API**
  - [x] 注销 API 实现 - `apps/backend/src/modules/users/users.controller.ts`
    - [x] POST /users/me/deletion（发起注销 - 30天冷静期）
    - [x] DELETE /users/me/deletion（取消注销）
    - [x] GET /users/me/deletion/status（查询注销状态）
  - [x] 冷静期定时任务 - `@Cron(EVERY_DAY_AT_2AM)`
    - [x] 每日凌晨2点检查 scheduledDeletionAt
    - [x] 自动执行到期账号的永久删除
  - [x] GDPR 数据删除逻辑 - `permanentlyDeleteAccount()`
    - [x] 删除用户所有关联数据
    - [x] 匿名化用户信息
    - [x] 记录删除审计日志

### 进行中 🚧
- [ ] 无

### 待开发 📝

**Phase 4: 数据迁移 (UUID → 新 ID 格式)**

详见下方《Phase 4 数据迁移设计》章节

### 依赖项
- ✅ Account 模型已存在
- ✅ ULID 库已安装 (`ulid@3.0.2`)
- ✅ AccountIdService 已实现（Backend + iOS）
- ✅ Prisma Schema 已更新
- ✅ Sentry 配置已完成 - `SentryService.setAccountContext()`
- ✅ RuntimeLog 日志系统已集成
- 📝 需要 Dashboard 管理界面

### 技术债务
- [x] ~~缺少 ID 格式性能测试~~ ✅ 2025-12-28 已完成
- 缺少大规模数据下的查询性能测试
- [x] ~~缺少账号注销的E2E测试~~ ✅ 2025-12-28 已完成
- [x] ~~日志搜索功能需要优化（建立索引）~~ ✅ 2025-12-28 GIN索引已添加
- 🚧 数据库迁移: Phase 4 实施中

---

## Phase 4: 数据迁移设计 (UUID → 新 ID 格式)

> **Status**: 🚧 实施中 (Phase 4.1 完成, Phase 4.2 进行中)
> **Priority**: 中（当前系统正常运行，但新格式有长期收益）
> **Risk Level**: 高（涉及主键变更）
> **Updated**: 2025-12-28

### 12.1 背景与目标

#### 当前状态
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Current State                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Database:                                                                   │
│  • User.id: UUID 格式 (36 chars)                                            │
│  • 示例: "550e8400-e29b-41d4-a716-446655440000"                             │
│                                                                              │
│  问题:                                                                       │
│  • 无法从 ID 判断账号类型（需查库）                                          │
│  • 无法从 ID 获取创建时间                                                    │
│  • 带宽占用相对较高                                                          │
│  • 日志搜索时无法直接识别账号类型                                            │
│                                                                              │
│  目标状态:                                                                   │
│  • User.id: 新格式 (27 chars)                                               │
│  • 示例: "g01HV6BGKCPG3M8QDJX9Y7CJ5ZA" (游客)                               │
│  • 示例: "r01HV6BGKCPG3M8QDJX9Y7CJ5ZB" (正式)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 迁移收益
| 收益 | 说明 |
|------|------|
| **类型可识别** | 从 ID 首字符即可判断账号类型 |
| **时间可提取** | ULID 内含时间戳，可提取创建时间 |
| **带宽节省** | 27 chars vs 36 chars = 25% 节省 |
| **日志友好** | 搜索 `g*` 即可找所有游客 |

### 12.2 迁移策略评估

#### 方案对比

| 方案 | 停机时间 | 复杂度 | 数据一致性 | 回滚难度 | 推荐度 |
|------|----------|--------|------------|----------|--------|
| **方案A: 双写+渐进迁移** | 无 | 高 | 高 | 中 | ⭐⭐⭐⭐ |
| **方案B: 维护窗口批量迁移** | 1-4小时 | 中 | 高 | 低 | ⭐⭐⭐ |
| **方案C: 保留双ID字段** | 无 | 低 | 中 | 高 | ⭐⭐ |

#### 推荐方案: A - 双写+渐进迁移

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    方案A: 双写+渐进迁移                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  阶段1: 准备 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 添加 newAccountId 字段（允许 NULL）                                │    │
│  │ • 为现有用户生成新ID并填充 newAccountId                              │    │
│  │ • 建立 oldId → newId 映射表                                          │    │
│  │ • 添加 newAccountId 索引                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段2: 双写 (2周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 所有写入同时更新 id 和 newAccountId                                 │    │
│  │ • API 同时支持新旧 ID 查询                                           │    │
│  │ • 监控新ID使用率                                                      │    │
│  │ • 更新客户端逐步使用新ID                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段3: 切换 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 将 newAccountId 设为主键                                           │    │
│  │ • 保留 legacyUuid 字段用于历史关联                                   │    │
│  │ • 更新所有外键引用                                                    │    │
│  │ • 删除 newAccountId 字段（合并到 id）                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段4: 清理 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 移除对旧ID的支持                                                    │    │
│  │ • 删除 legacyUuid 字段                                                │    │
│  │ • 清理映射表                                                          │    │
│  │ • 更新文档                                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.3 详细迁移步骤

#### 阶段1: 准备阶段

```prisma
// schema.prisma 变更

model User {
  id              String        @id @default(uuid()) @db.Uuid  // 当前主键
  newAccountId    String?       @unique @map("new_account_id") // 新 ID (暂时可空)

  // ... 其他字段

  @@index([newAccountId])
}

// 映射表（临时）
model AccountIdMapping {
  id            String   @id @default(uuid())
  legacyUuid    String   @unique @map("legacy_uuid")
  newAccountId  String   @unique @map("new_account_id")
  accountType   String   @map("account_type")  // GUEST | REGISTERED
  migratedAt    DateTime @default(now())

  @@index([legacyUuid])
  @@index([newAccountId])
}
```

```typescript
// migration-phase1.ts - 为现有用户生成新ID

import { ulid } from 'ulid';

async function phase1_generateNewIds(prisma: PrismaService) {
  const batchSize = 1000;
  let processed = 0;

  // 获取所有未迁移的用户
  const users = await prisma.user.findMany({
    where: { newAccountId: null },
    select: { id: true, accountType: true, createdAt: true },
    take: batchSize,
  });

  for (const user of users) {
    // 根据账号类型生成新ID
    const prefix = user.accountType === 'GUEST' ? 'g' : 'r';

    // 使用原创建时间生成 ULID，保持时间顺序
    const newId = prefix + ulid(user.createdAt.getTime());

    await prisma.$transaction([
      // 更新用户
      prisma.user.update({
        where: { id: user.id },
        data: { newAccountId: newId },
      }),
      // 记录映射
      prisma.accountIdMapping.create({
        data: {
          legacyUuid: user.id,
          newAccountId: newId,
          accountType: user.accountType,
        },
      }),
    ]);

    processed++;
  }

  console.log(`Phase 1: Migrated ${processed} users`);
}
```

#### 阶段2: 双写阶段

```typescript
// users.service.ts - 双写模式

@Injectable()
export class UsersService {
  /**
   * 查找用户 - 支持新旧ID
   */
  async findById(id: string) {
    // 检测ID格式
    const isNewFormat = this.accountIdService.isValidId(id);

    return this.prisma.user.findFirst({
      where: isNewFormat
        ? { newAccountId: id }
        : { id },
    });
  }

  /**
   * 创建用户 - 同时生成新旧ID
   */
  async create(dto: CreateUserDto) {
    const isGuest = !dto.appleId && !dto.googleId;
    const newAccountId = isGuest
      ? this.accountIdService.generateGuestId()
      : this.accountIdService.generateRegisteredId();

    return this.prisma.user.create({
      data: {
        ...dto,
        newAccountId,
      },
    });
  }
}

// 中间件: 自动转换ID
@Injectable()
export class AccountIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 在响应中同时返回新旧ID
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.id && body?.newAccountId) {
        // 逐步切换: 优先返回新ID
        body.accountId = body.newAccountId;
        body.legacyId = body.id;
      }
      return originalJson(body);
    };
    next();
  }
}
```

#### 阶段3: 切换阶段

```sql
-- 切换主键（需要在低峰期执行）

-- 1. 添加新的主键约束
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("new_account_id");

-- 2. 重命名字段
ALTER TABLE "User" RENAME COLUMN "id" TO "legacy_uuid";
ALTER TABLE "User" RENAME COLUMN "new_account_id" TO "id";

-- 3. 更新外键引用（示例: UserBook 表）
ALTER TABLE "UserBook" ADD COLUMN "user_id_new" VARCHAR(27);

UPDATE "UserBook" ub
SET "user_id_new" = u."id"
FROM "User" u
WHERE ub."user_id" = u."legacy_uuid";

ALTER TABLE "UserBook" DROP CONSTRAINT "UserBook_userId_fkey";
ALTER TABLE "UserBook" DROP COLUMN "user_id";
ALTER TABLE "UserBook" RENAME COLUMN "user_id_new" TO "user_id";

ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_userId_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id");

-- 4. 更新索引
CREATE INDEX "User_legacy_uuid_idx" ON "User"("legacy_uuid");
```

#### 阶段4: 清理阶段

```typescript
// 清理脚本 - 确认无问题后执行

async function phase4_cleanup(prisma: PrismaService) {
  // 1. 检查是否还有对旧ID的引用
  const oldIdReferences = await checkOldIdReferences();
  if (oldIdReferences > 0) {
    throw new Error(`Still ${oldIdReferences} references to old IDs`);
  }

  // 2. 删除映射表
  await prisma.accountIdMapping.deleteMany({});

  // 3. 删除 legacy_uuid 字段 (通过 migration)
  // prisma migrate 会自动处理

  console.log('Phase 4: Cleanup completed');
}
```

### 12.4 影响范围

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Impact Analysis                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  数据库表（需要更新外键）:                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • UserBook (user_id)                                                        │
│  • UserVocabulary (user_id)                                                  │
│  • DailyStats (user_id)                                                      │
│  • ReadingSession (user_id)                                                  │
│  • AIInteraction (user_id)                                                   │
│  • Subscription (user_id)                                                    │
│  • Device (user_id)                                                          │
│  • AuthorChatSession (user_id)                                              │
│  • AnnualReport (user_id)                                                    │
│  • UserHighlight (user_id)                                                   │
│  • ShareLog (user_id)                                                        │
│  • AccountDeletionLog (user_id)                                              │
│  • RefreshToken (user_id)                                                    │
│  • ErrorLog (user_id)                                                        │
│  • RuntimeLog (user_id)                                                      │
│  • CrashReport (user_id)                                                     │
│                                                                              │
│  代码变更:                                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Backend: JWT payload.sub 格式变更                                         │
│  • iOS: Keychain 存储的 accountId 格式变更                                   │
│  • Web: localStorage 存储的 accountId 格式变更                               │
│  • API 响应中 id 字段格式变更                                                │
│                                                                              │
│  第三方服务:                                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Sentry: user.id 格式变更                                                  │
│  • RevenueCat: app_user_id 格式变更                                          │
│  • Analytics: user_id 格式变更                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.5 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **外键更新失败** | 数据不一致 | 事务包裹，失败回滚 |
| **客户端缓存旧ID** | 认证失败 | 双ID支持期2周 |
| **第三方服务关联断裂** | 数据丢失 | 保留 legacy_uuid 映射 |
| **迁移耗时过长** | 性能影响 | 分批次执行，低峰期 |
| **回滚困难** | 业务中断 | 保留完整映射表 |

### 12.6 迁移时间表

| 阶段 | 时间 | 里程碑 | 负责人 |
|------|------|--------|--------|
| **准备** | Week 1 | Schema 变更，生成新ID | Backend |
| **双写** | Week 2-3 | API 双ID支持，客户端更新 | Full Stack |
| **切换** | Week 4 | 主键切换，外键更新 | Backend + DBA |
| **清理** | Week 5 | 移除旧代码，清理映射表 | Backend |
| **监控** | Week 6+ | 持续监控，处理遗留问题 | SRE |

### 12.7 回滚计划

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Rollback Strategy                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  如果迁移失败，按以下步骤回滚:                                               │
│                                                                              │
│  1. 阶段1-2 回滚（低风险）:                                                  │
│     • 直接忽略 newAccountId 字段                                             │
│     • 删除 newAccountId 列                                                   │
│     • 删除 AccountIdMapping 表                                               │
│                                                                              │
│  2. 阶段3 回滚（需要停机）:                                                  │
│     • 使用 AccountIdMapping 恢复原 id                                       │
│     • 回滚 schema 变更                                                       │
│     • 恢复外键引用                                                           │
│                                                                              │
│  3. 阶段4 无法回滚:                                                          │
│     • 确保阶段4清理前经过充分验证                                            │
│     • 至少保留映射表30天                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.8 执行前 Checklist

- [ ] 完整数据库备份
- [ ] 验证 AccountIdMapping 表数据完整
- [ ] 客户端发布新版本支持双ID
- [ ] 第三方服务迁移计划确认
- [ ] 监控告警配置
- [ ] 回滚脚本测试通过
- [ ] 维护窗口通知用户
- [ ] DBA review 迁移 SQL

---

### 12.9 实施进度

| 阶段 | 状态 | 完成日期 | 说明 |
|------|------|----------|------|
| **Phase 4.1 准备阶段** | ✅ 完成 | 2025-12-28 | Schema 变更 + 迁移脚本已创建 |
| **Phase 4.2 双写阶段** | ✅ 完成 | 2025-12-28 | API 支持新旧 ID 查询 |
| **Phase 4.3 切换阶段** | ✅ 脚本完成 | 2025-12-28 | 主键切换，外键更新 (待执行) |
| **Phase 4.4 清理阶段** | ✅ 脚本完成 | 2025-12-28 | 移除旧代码，清理映射表 (待执行) |

#### Phase 4.1 完成项
- [x] Prisma Schema: 添加 `newAccountId` 字段到 User 模型
- [x] Prisma Schema: 添加 `AccountIdMapping` 模型
- [x] SQL Migration: `20251228120000_phase4_new_account_id`
- [x] 数据迁移脚本: `apps/backend/scripts/migrate-account-ids.ts`

#### Phase 4.2 完成项
- [x] `UsersService.findById()` - 支持新旧ID格式查询
- [x] `UsersService.create()` - 创建用户时同时生成 newAccountId
- [x] `UsersService.createGuest()` - 创建游客时同时生成 newAccountId
- [x] `UsersService.upgradeToRegistered()` - 升级时生成新的正式账号ID
- [x] `UsersService.getProfile()` - 返回 accountId 和 legacyId
- [x] `UsersService.getNewAccountId()` - ID格式转换辅助方法
- [x] `UsersService.getLegacyUuid()` - ID格式转换辅助方法
- [x] `UsersService.resolveUserId()` - 通用ID解析方法
- [x] `GET /users/me/account-id` - 新增API端点获取双格式ID

#### Phase 4.3 完成项 (脚本已创建，待执行)
- [x] 预迁移验证脚本: `apps/backend/scripts/phase4-3-pre-migration.ts`
  - 验证所有用户已有 newAccountId
  - 验证 AccountIdMapping 表数据完整
  - 检查孤儿记录和重复ID
  - 可选自动修复 (--fix)
- [x] SQL迁移脚本: `20251228130000_phase4_3_primary_key_switch`
  - 添加新列到所有关联表
  - 填充新ID值
  - 切换主键约束
  - 更新所有外键
  - 保留 legacy_uuid 用于回滚
- [x] 回滚脚本: `apps/backend/scripts/phase4-3-rollback.sql`
  - 完整恢复到 Phase 4.2 状态
- [x] Prisma Schema 参考: `schema.phase4.3.prisma`

**执行 Phase 4.3 的步骤:**
1. 运行预迁移验证: `npx ts-node scripts/phase4-3-pre-migration.ts`
2. 备份数据库
3. 进入维护模式
4. 运行迁移: `pnpm prisma migrate deploy`
5. 更新 Prisma Schema 为新格式
6. 运行 `pnpm prisma generate`
7. 验证应用正常
8. 退出维护模式

---

#### Phase 4.4 完成项 (脚本已创建，待执行)
- [x] SQL清理迁移: `20251228140000_phase4_4_cleanup`
  - 删除所有 legacy_uuid 相关列
  - 删除 AccountIdMapping 表
  - 验证清理完成
- [x] 最终 Prisma Schema 参考: `schema.phase4.4.final.prisma`
- [x] 清理后的 UsersService 参考: `users.service.phase4.4.ts`
  - 移除双ID支持代码
  - 简化 findById（只使用新格式）
  - 移除 getNewAccountId/getLegacyUuid 方法
  - 移除 resolveUserId 方法

**执行 Phase 4.4 的步骤:**
1. 确保 Phase 4.3 已成功执行并验证2周无问题
2. 备份数据库
3. 进入维护模式
4. 运行迁移: `pnpm prisma migrate deploy`
5. 使用 `schema.phase4.4.final.prisma` 更新 Prisma Schema
6. 使用 `users.service.phase4.4.ts` 更新 UsersService
7. 移除 `GET /users/me/account-id` 端点中的 legacyId 字段
8. 运行 `pnpm prisma generate`
9. 验证应用正常
10. 退出维护模式

---

**Phase 4 Status**: ✅ 脚本完成 (Phase 4.1-4.4 脚本全部完成，待数据库执行)
