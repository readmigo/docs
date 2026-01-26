# Readmigo 社交媒体与手机号绑定设计文档

> Version: 1.0.0
> Status: Draft - Pending Review
> Author: System Architect
> Date: 2025-12-23

---

## 1. 概述

### 1.1 设计目标

构建一个灵活、安全的多身份绑定系统，支持：

| 目标 | 说明 |
|------|------|
| **多登录方式** | 支持 Apple、Google、微信、手机号等多种登录 |
| **身份聚合** | 同一用户可绑定多个社交账号和手机号 |
| **无缝切换** | 用户可使用任意已绑定方式登录同一账号 |
| **安全验证** | 绑定过程需要严格的身份验证 |
| **解绑支持** | 支持解除绑定，但需保留至少一种登录方式 |
| **隐私保护** | 符合各平台隐私政策和法规要求 |

### 1.2 支持的身份提供者

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Supported Identity Providers                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     First-Party (高优先级)                          │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │    │
│  │  │   Apple     │  │   Google    │  │   Phone     │                 │    │
│  │  │   Sign In   │  │   Sign In   │  │   Number    │                 │    │
│  │  │             │  │             │  │             │                 │    │
│  │  │  iOS 必选   │  │  跨平台     │  │  中国市场   │                 │    │
│  │  │  App Store  │  │  Android    │  │  SMS验证    │                 │    │
│  │  │  政策要求   │  │  用户首选   │  │  实名要求   │                 │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Third-Party (中优先级)                          │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │    │
│  │  │   WeChat    │  │   Weibo     │  │   QQ        │                 │    │
│  │  │             │  │             │  │             │                 │    │
│  │  │  中国市场   │  │  中国市场   │  │  中国市场   │                 │    │
│  │  │  10亿+ 用户 │  │  社交分享   │  │  年轻用户   │                 │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Future (低优先级 - 预留)                        │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │    │
│  │  │   Email     │  │   Facebook  │  │   Twitter/X │                 │    │
│  │  │   Password  │  │             │  │             │                 │    │
│  │  │             │  │  海外市场   │  │  海外市场   │                 │    │
│  │  │  传统方式   │  │             │  │             │                 │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 市场策略

| 市场 | 主要登录方式 | 备选方式 |
|------|-------------|---------|
| **中国大陆** | 手机号 + 微信 | Apple (iOS)、QQ |
| **港澳台** | Apple + Google | 手机号 |
| **国际市场** | Apple + Google | Email |

---

## 2. 数据模型设计

### 2.1 核心实体关系

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Identity Binding ERD                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌──────────────────┐                               │
│                          │     Account      │                               │
│                          │                  │                               │
│                          │  usr_reg_xxx     │                               │
│                          │                  │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
│                                   │ 1:N                                      │
│                                   │                                          │
│                          ┌────────▼─────────┐                               │
│                          │    Identity      │                               │
│                          │                  │                               │
│                          │ provider         │                               │
│                          │ providerId       │                               │
│                          │ isPrimary        │                               │
│                          │ isVerified       │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
│              ┌────────────────────┼────────────────────┐                    │
│              │                    │                    │                    │
│              ▼                    ▼                    ▼                    │
│    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐          │
│    │  AppleIdentity   │ │  PhoneIdentity   │ │  WeChatIdentity  │          │
│    │                  │ │                  │ │                  │          │
│    │  Apple User ID   │ │  +86 138****8888 │ │  OpenID / UnionID│          │
│    │  email (隐藏)    │ │  verified: true  │ │  nickname        │          │
│    └──────────────────┘ └──────────────────┘ └──────────────────┘          │
│                                                                              │
│                          ┌──────────────────┐                               │
│                          │ VerificationLog  │                               │
│                          │                  │                               │
│                          │ SMS发送记录       │                               │
│                          │ 验证尝试记录      │                               │
│                          │ 安全审计         │                               │
│                          └──────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Prisma Schema

```prisma
// ============================================
// schema.prisma - Identity Binding Models
// ============================================

// 身份提供者枚举
enum IdentityProvider {
  APPLE
  GOOGLE
  WECHAT
  WEIBO
  QQ
  PHONE
  EMAIL    // 预留
}

// 验证状态枚举
enum VerificationStatus {
  PENDING     // 待验证
  VERIFIED    // 已验证
  EXPIRED     // 验证过期
  FAILED      // 验证失败
}

// ============================================
// Identity - 统一身份模型
// ============================================
model Identity {
  id              String           @id @default(uuid())
  accountId       String
  account         Account          @relation(fields: [accountId], references: [id], onDelete: Cascade)

  provider        IdentityProvider
  providerId      String            // 提供者返回的唯一ID
  providerData    Json?             // 提供者返回的原始数据

  // 通用字段
  email           String?           // 从提供者获取的邮箱（可能隐藏）
  displayName     String?           // 显示名称
  avatarUrl       String?           // 头像URL

  // 手机号专用字段
  phoneNumber     String?           // 完整手机号 (E.164格式: +8613812345678)
  phoneCountry    String?           // 国家代码 (CN, US, etc.)
  phoneMasked     String?           // 脱敏显示 (+86 138****5678)

  // 状态
  isPrimary       Boolean           @default(false)
  isVerified      Boolean           @default(false)
  verifiedAt      DateTime?

  // Token 管理（OAuth类型）
  accessToken     String?           // 加密存储
  refreshToken    String?           // 加密存储
  tokenExpiresAt  DateTime?

  // 审计字段
  lastUsedAt      DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  unboundAt       DateTime?         // 解绑时间（软删除）

  // 验证记录
  verifications   VerificationRecord[]

  @@unique([provider, providerId])
  @@unique([provider, phoneNumber]) // 同一手机号只能绑定一个账号
  @@index([accountId])
  @@index([provider])
  @@index([phoneNumber])
}

// ============================================
// VerificationRecord - 验证记录
// ============================================
model VerificationRecord {
  id              String             @id @default(uuid())
  identityId      String?
  identity        Identity?          @relation(fields: [identityId], references: [id])

  // 验证目标
  targetType      VerificationType   // PHONE, EMAIL
  targetValue     String             // 手机号或邮箱

  // 验证码
  code            String             // 加密存储
  codeExpiresAt   DateTime

  // 状态
  status          VerificationStatus @default(PENDING)
  attemptCount    Int                @default(0)
  maxAttempts     Int                @default(5)

  // 上下文
  purpose         VerificationPurpose // BIND, LOGIN, UNBIND
  ipAddress       String?
  userAgent       String?
  deviceId        String?

  // 时间戳
  createdAt       DateTime           @default(now())
  verifiedAt      DateTime?
  expiredAt       DateTime?

  @@index([targetValue, status])
  @@index([createdAt])
}

enum VerificationType {
  PHONE
  EMAIL
}

enum VerificationPurpose {
  BIND        // 绑定新身份
  LOGIN       // 登录验证
  UNBIND      // 解除绑定
  CHANGE      // 更换绑定
}

// ============================================
// BindingHistory - 绑定历史记录
// ============================================
model BindingHistory {
  id              String            @id @default(uuid())
  accountId       String
  provider        IdentityProvider
  providerId      String

  action          BindingAction
  previousState   Json?             // 变更前状态
  newState        Json?             // 变更后状态

  // 上下文
  ipAddress       String?
  userAgent       String?
  deviceId        String?
  reason          String?           // 解绑原因

  createdAt       DateTime          @default(now())

  @@index([accountId])
  @@index([createdAt])
}

enum BindingAction {
  BIND          // 绑定
  UNBIND        // 解绑
  SET_PRIMARY   // 设为主要
  VERIFY        // 验证完成
  REFRESH_TOKEN // Token刷新
}
```

---

## 3. 身份绑定流程

### 3.1 手机号绑定流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Phone Number Binding Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Client                  Backend                 SMS Service   Database     │
│      │                       │                        │            │         │
│      │  1. POST /auth/phone/send-code                │            │         │
│      │   { phone: "+8613812345678" }                 │            │         │
│      │─────────────────────►│                        │            │         │
│      │                      │                        │            │         │
│      │                      │  2. 验证手机号格式      │            │         │
│      │                      │     检查绑定状态        │            │         │
│      │                      │     检查发送频率限制    │            │         │
│      │                      │────────────────────────────────────►│         │
│      │                      │                        │            │         │
│      │                      │  3. 生成6位验证码       │            │         │
│      │                      │     有效期5分钟         │            │         │
│      │                      │────────────────────────────────────►│         │
│      │                      │                        │            │         │
│      │                      │  4. 发送短信            │            │         │
│      │                      │────────────────────────►│            │         │
│      │                      │                        │            │         │
│      │  5. { success, expiresIn: 300 }              │            │         │
│      │◄─────────────────────│                        │            │         │
│      │                      │                        │            │         │
│      │  6. POST /auth/phone/verify                   │            │         │
│      │   { phone, code: "123456" }                   │            │         │
│      │─────────────────────►│                        │            │         │
│      │                      │                        │            │         │
│      │                      │  7. 验证码校验          │            │         │
│      │                      │────────────────────────────────────►│         │
│      │                      │                        │            │         │
│      │                      │  8. 创建/更新 Identity  │            │         │
│      │                      │────────────────────────────────────►│         │
│      │                      │                        │            │         │
│      │                      │  9. 记录绑定历史        │            │         │
│      │                      │────────────────────────────────────►│         │
│      │                      │                        │            │         │
│      │  10. { success, identity }                    │            │         │
│      │◄─────────────────────│                        │            │         │
│      │                      │                        │            │         │
│                                                                              │
│  Rate Limiting:                                                              │
│  • 同一手机号: 60秒内1条, 24小时内10条                                       │
│  • 同一IP: 1小时内20条                                                       │
│  • 同一设备: 1小时内10条                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 微信绑定流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WeChat Binding Flow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   App              WeChat SDK         Backend          WeChat API            │
│    │                   │                 │                  │                │
│    │  1. 点击微信绑定   │                 │                  │                │
│    │──────────────────►│                 │                  │                │
│    │                   │                 │                  │                │
│    │                   │  2. 调起微信授权  │                  │                │
│    │                   │  (scope: snsapi_userinfo)          │                │
│    │                   │─────────────────────────────────────►               │
│    │                   │                 │                  │                │
│    │                   │  3. 用户在微信中授权                 │                │
│    │                   │◄─────────────────────────────────────               │
│    │                   │                 │                  │                │
│    │  4. 回调: code    │                 │                  │                │
│    │◄──────────────────│                 │                  │                │
│    │                   │                 │                  │                │
│    │  5. POST /auth/wechat/bind         │                  │                │
│    │   { code: "xxx" }                  │                  │                │
│    │────────────────────────────────────►                  │                │
│    │                   │                 │                  │                │
│    │                   │                 │  6. 换取 access_token             │
│    │                   │                 │─────────────────►│                │
│    │                   │                 │                  │                │
│    │                   │                 │  7. 获取用户信息  │                │
│    │                   │                 │   (openid, unionid, nickname)    │
│    │                   │                 │◄─────────────────│                │
│    │                   │                 │                  │                │
│    │                   │                 │  8. 检查 unionid 是否已绑定       │
│    │                   │                 │                  │                │
│    │                   │                 │  9. 创建 Identity │                │
│    │                   │                 │                  │                │
│    │  10. { success, identity }         │                  │                │
│    │◄────────────────────────────────────                  │                │
│    │                   │                 │                  │                │
│                                                                              │
│  微信特殊处理:                                                               │
│  • 使用 UnionID 作为 providerId（跨应用统一）                                │
│  • 存储 OpenID 用于消息推送                                                  │
│  • 处理用户取消授权场景                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Apple/Google 绑定流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Apple/Google Binding Flow                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   App                 AuthServices          Backend          Provider API    │
│    │                      │                    │                  │          │
│    │  1. 发起绑定请求      │                    │                  │          │
│    │─────────────────────►│                    │                  │          │
│    │                      │                    │                  │          │
│    │                      │  2. 系统授权弹窗    │                  │          │
│    │                      │  (Face ID/指纹)    │                  │          │
│    │                      │                    │                  │          │
│    │  3. 授权成功          │                    │                  │          │
│    │   identityToken      │                    │                  │          │
│    │   authorizationCode  │                    │                  │          │
│    │◄─────────────────────│                    │                  │          │
│    │                      │                    │                  │          │
│    │  4. POST /auth/apple/bind (或 /google/bind)                 │          │
│    │   { identityToken, authorizationCode }    │                  │          │
│    │───────────────────────────────────────────►                  │          │
│    │                      │                    │                  │          │
│    │                      │                    │  5. 验证 Token   │          │
│    │                      │                    │─────────────────►│          │
│    │                      │                    │                  │          │
│    │                      │                    │  6. 获取用户信息  │          │
│    │                      │                    │◄─────────────────│          │
│    │                      │                    │                  │          │
│    │                      │                    │  7. 检查身份是否已存在      │
│    │                      │                    │     - 已存在且属于当前账号: OK  │
│    │                      │                    │     - 已存在且属于其他账号: 提示合并│
│    │                      │                    │     - 不存在: 创建新 Identity  │
│    │                      │                    │                  │          │
│    │  8. { success, identity, needMerge? }     │                  │          │
│    │◄───────────────────────────────────────────                  │          │
│    │                      │                    │                  │          │
│                                                                              │
│  Apple Sign In 特殊处理:                                                     │
│  • 首次授权时获取 email，后续可能隐藏                                        │
│  • 使用 userIdentifier 作为 providerId                                      │
│  • 需要处理 Apple 的 privaterelay 邮箱                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 解除绑定流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Unbinding Flow                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Client                            Backend                     Database     │
│      │                                 │                            │        │
│      │  1. DELETE /auth/identity/:id    │                            │        │
│      │─────────────────────────────────►│                            │        │
│      │                                 │                            │        │
│      │                                 │  2. 检查业务规则:           │        │
│      │                                 │     a) 是否是最后一个身份?  │        │
│      │                                 │     b) 是否是主要登录方式?  │        │
│      │                                 │     c) 是否需要二次验证?    │        │
│      │                                 │                            │        │
│      │  3. 如果需要验证               │                            │        │
│      │     { requireVerification: true }                            │        │
│      │◄─────────────────────────────────│                            │        │
│      │                                 │                            │        │
│      │  4. 用户完成验证 (另一个身份)    │                            │        │
│      │─────────────────────────────────►│                            │        │
│      │                                 │                            │        │
│      │                                 │  5. 软删除 Identity        │        │
│      │                                 │     设置 unboundAt         │        │
│      │                                 │─────────────────────────────►       │
│      │                                 │                            │        │
│      │                                 │  6. 记录解绑历史           │        │
│      │                                 │─────────────────────────────►       │
│      │                                 │                            │        │
│      │                                 │  7. 如果解绑的是主要身份    │        │
│      │                                 │     自动设置新的主要身份   │        │
│      │                                 │─────────────────────────────►       │
│      │                                 │                            │        │
│      │  8. { success }                 │                            │        │
│      │◄─────────────────────────────────│                            │        │
│      │                                 │                            │        │
│                                                                              │
│  解绑规则:                                                                   │
│  • 必须保留至少一个已验证的登录方式                                          │
│  • 解绑主要身份需要验证另一个身份                                            │
│  • 解绑后30天内可恢复                                                        │
│  • 30天后永久删除                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 服务层实现

### 4.1 身份绑定服务

```typescript
// ============================================
// identity-binding.service.ts
// ============================================

import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityProvider, VerificationPurpose } from '@prisma/client';

@Injectable()
export class IdentityBindingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly encryptionService: EncryptionService,
    private readonly appleAuthService: AppleAuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly wechatAuthService: WeChatAuthService,
  ) {}

  // ============================================
  // 手机号绑定
  // ============================================

  /**
   * 发送手机验证码
   */
  async sendPhoneVerificationCode(
    accountId: string,
    phoneNumber: string,
    purpose: VerificationPurpose = 'BIND',
  ): Promise<{ expiresIn: number }> {
    // 1. 验证手机号格式
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    if (!this.isValidPhoneNumber(normalizedPhone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // 2. 检查手机号是否已被其他账号绑定
    if (purpose === 'BIND') {
      const existingIdentity = await this.prisma.identity.findFirst({
        where: {
          provider: 'PHONE',
          phoneNumber: normalizedPhone,
          unboundAt: null,
        },
      });

      if (existingIdentity && existingIdentity.accountId !== accountId) {
        throw new ConflictException('Phone number already bound to another account');
      }
    }

    // 3. 检查发送频率限制
    await this.checkRateLimit(normalizedPhone, accountId);

    // 4. 生成验证码
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟

    // 5. 保存验证记录
    await this.prisma.verificationRecord.create({
      data: {
        targetType: 'PHONE',
        targetValue: normalizedPhone,
        code: await this.encryptionService.hash(code),
        codeExpiresAt: expiresAt,
        purpose,
        status: 'PENDING',
      },
    });

    // 6. 发送短信
    await this.smsService.sendVerificationCode(normalizedPhone, code);

    return { expiresIn: 300 };
  }

  /**
   * 验证手机号并绑定
   */
  async verifyAndBindPhone(
    accountId: string,
    phoneNumber: string,
    code: string,
  ): Promise<Identity> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // 1. 查找有效的验证记录
    const verification = await this.prisma.verificationRecord.findFirst({
      where: {
        targetValue: normalizedPhone,
        status: 'PENDING',
        codeExpiresAt: { gt: new Date() },
        attemptCount: { lt: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Verification code expired or not found');
    }

    // 2. 验证码校验
    const isValid = await this.encryptionService.verify(code, verification.code);

    if (!isValid) {
      // 增加尝试次数
      await this.prisma.verificationRecord.update({
        where: { id: verification.id },
        data: { attemptCount: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }

    // 3. 更新验证状态
    await this.prisma.verificationRecord.update({
      where: { id: verification.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    // 4. 创建或更新 Identity
    const identity = await this.prisma.identity.upsert({
      where: {
        provider_phoneNumber: {
          provider: 'PHONE',
          phoneNumber: normalizedPhone,
        },
      },
      create: {
        accountId,
        provider: 'PHONE',
        providerId: normalizedPhone, // 手机号作为 providerId
        phoneNumber: normalizedPhone,
        phoneCountry: this.extractCountryCode(normalizedPhone),
        phoneMasked: this.maskPhoneNumber(normalizedPhone),
        isVerified: true,
        verifiedAt: new Date(),
        isPrimary: await this.shouldBePrimary(accountId),
      },
      update: {
        accountId,
        isVerified: true,
        verifiedAt: new Date(),
        unboundAt: null, // 清除解绑标记（如果有）
      },
    });

    // 5. 记录绑定历史
    await this.recordBindingHistory(accountId, 'PHONE', normalizedPhone, 'BIND');

    return identity;
  }

  // ============================================
  // Apple Sign In 绑定
  // ============================================

  /**
   * 绑定 Apple ID
   */
  async bindApple(
    accountId: string,
    identityToken: string,
    authorizationCode: string,
    fullName?: string,
  ): Promise<{ identity: Identity; needMerge: boolean; existingAccountId?: string }> {
    // 1. 验证 Apple Identity Token
    const appleUser = await this.appleAuthService.verifyIdentityToken(identityToken);

    // 2. 检查 Apple ID 是否已绑定
    const existingIdentity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider: 'APPLE',
          providerId: appleUser.sub,
        },
      },
      include: { account: true },
    });

    if (existingIdentity && existingIdentity.accountId !== accountId) {
      // Apple ID 已绑定到其他账号，需要合并
      return {
        identity: existingIdentity,
        needMerge: true,
        existingAccountId: existingIdentity.accountId,
      };
    }

    // 3. 获取 Refresh Token (可选，用于服务端验证)
    let tokens = null;
    if (authorizationCode) {
      tokens = await this.appleAuthService.getTokens(authorizationCode);
    }

    // 4. 创建或更新 Identity
    const identity = await this.prisma.identity.upsert({
      where: {
        provider_providerId: {
          provider: 'APPLE',
          providerId: appleUser.sub,
        },
      },
      create: {
        accountId,
        provider: 'APPLE',
        providerId: appleUser.sub,
        email: appleUser.email,
        displayName: fullName || appleUser.email?.split('@')[0],
        isVerified: appleUser.email_verified,
        verifiedAt: appleUser.email_verified ? new Date() : null,
        isPrimary: await this.shouldBePrimary(accountId),
        accessToken: tokens?.access_token
          ? await this.encryptionService.encrypt(tokens.access_token)
          : null,
        refreshToken: tokens?.refresh_token
          ? await this.encryptionService.encrypt(tokens.refresh_token)
          : null,
        tokenExpiresAt: tokens?.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        providerData: appleUser,
      },
      update: {
        email: appleUser.email || undefined,
        displayName: fullName || undefined,
        isVerified: appleUser.email_verified,
        verifiedAt: appleUser.email_verified ? new Date() : undefined,
        unboundAt: null,
        accessToken: tokens?.access_token
          ? await this.encryptionService.encrypt(tokens.access_token)
          : undefined,
        refreshToken: tokens?.refresh_token
          ? await this.encryptionService.encrypt(tokens.refresh_token)
          : undefined,
      },
    });

    // 5. 记录绑定历史
    await this.recordBindingHistory(accountId, 'APPLE', appleUser.sub, 'BIND');

    return { identity, needMerge: false };
  }

  // ============================================
  // 微信绑定
  // ============================================

  /**
   * 绑定微信
   */
  async bindWeChat(
    accountId: string,
    code: string,
  ): Promise<{ identity: Identity; needMerge: boolean; existingAccountId?: string }> {
    // 1. 使用 code 换取 access_token
    const tokenResult = await this.wechatAuthService.getAccessToken(code);

    // 2. 获取用户信息
    const userInfo = await this.wechatAuthService.getUserInfo(
      tokenResult.access_token,
      tokenResult.openid,
    );

    // 使用 unionid 作为 providerId（跨应用统一）
    const providerId = userInfo.unionid || userInfo.openid;

    // 3. 检查是否已绑定
    const existingIdentity = await this.prisma.identity.findUnique({
      where: {
        provider_providerId: {
          provider: 'WECHAT',
          providerId,
        },
      },
      include: { account: true },
    });

    if (existingIdentity && existingIdentity.accountId !== accountId) {
      return {
        identity: existingIdentity,
        needMerge: true,
        existingAccountId: existingIdentity.accountId,
      };
    }

    // 4. 创建或更新 Identity
    const identity = await this.prisma.identity.upsert({
      where: {
        provider_providerId: {
          provider: 'WECHAT',
          providerId,
        },
      },
      create: {
        accountId,
        provider: 'WECHAT',
        providerId,
        displayName: userInfo.nickname,
        avatarUrl: userInfo.headimgurl,
        isVerified: true,
        verifiedAt: new Date(),
        isPrimary: await this.shouldBePrimary(accountId),
        accessToken: await this.encryptionService.encrypt(tokenResult.access_token),
        refreshToken: await this.encryptionService.encrypt(tokenResult.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokenResult.expires_in * 1000),
        providerData: {
          openid: userInfo.openid,
          unionid: userInfo.unionid,
          sex: userInfo.sex,
          province: userInfo.province,
          city: userInfo.city,
          country: userInfo.country,
        },
      },
      update: {
        displayName: userInfo.nickname,
        avatarUrl: userInfo.headimgurl,
        unboundAt: null,
        accessToken: await this.encryptionService.encrypt(tokenResult.access_token),
        refreshToken: await this.encryptionService.encrypt(tokenResult.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokenResult.expires_in * 1000),
      },
    });

    // 5. 记录绑定历史
    await this.recordBindingHistory(accountId, 'WECHAT', providerId, 'BIND');

    return { identity, needMerge: false };
  }

  // ============================================
  // 解除绑定
  // ============================================

  /**
   * 解除身份绑定
   */
  async unbindIdentity(
    accountId: string,
    identityId: string,
    verificationToken?: string,
  ): Promise<void> {
    // 1. 获取身份信息
    const identity = await this.prisma.identity.findFirst({
      where: {
        id: identityId,
        accountId,
        unboundAt: null,
      },
    });

    if (!identity) {
      throw new BadRequestException('Identity not found');
    }

    // 2. 检查是否是最后一个身份
    const remainingIdentities = await this.prisma.identity.count({
      where: {
        accountId,
        unboundAt: null,
        isVerified: true,
        id: { not: identityId },
      },
    });

    if (remainingIdentities === 0) {
      throw new BadRequestException('Cannot unbind the last login method');
    }

    // 3. 如果是主要身份，需要验证
    if (identity.isPrimary && !verificationToken) {
      throw new BadRequestException('Verification required to unbind primary identity');
    }

    // 4. 验证 token（如果提供）
    if (verificationToken) {
      await this.verifyUnbindToken(accountId, verificationToken);
    }

    // 5. 软删除
    await this.prisma.identity.update({
      where: { id: identityId },
      data: {
        unboundAt: new Date(),
        isPrimary: false,
      },
    });

    // 6. 如果解绑的是主要身份，自动设置新的主要身份
    if (identity.isPrimary) {
      const newPrimary = await this.prisma.identity.findFirst({
        where: {
          accountId,
          unboundAt: null,
          isVerified: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (newPrimary) {
        await this.prisma.identity.update({
          where: { id: newPrimary.id },
          data: { isPrimary: true },
        });
      }
    }

    // 7. 记录历史
    await this.recordBindingHistory(
      accountId,
      identity.provider,
      identity.providerId,
      'UNBIND',
    );
  }

  // ============================================
  // 辅助方法
  // ============================================

  private normalizePhoneNumber(phone: string): string {
    // 移除所有非数字字符，保留 +
    let normalized = phone.replace(/[^\d+]/g, '');

    // 确保以 + 开头
    if (!normalized.startsWith('+')) {
      // 假设中国号码
      if (normalized.startsWith('86')) {
        normalized = '+' + normalized;
      } else {
        normalized = '+86' + normalized;
      }
    }

    return normalized;
  }

  private isValidPhoneNumber(phone: string): boolean {
    // E.164 格式验证
    const e164Pattern = /^\+[1-9]\d{6,14}$/;
    return e164Pattern.test(phone);
  }

  private maskPhoneNumber(phone: string): string {
    // +8613812345678 -> +86 138****5678
    if (phone.startsWith('+86')) {
      const local = phone.slice(3);
      return `+86 ${local.slice(0, 3)}****${local.slice(-4)}`;
    }
    // 其他国家通用处理
    const countryCode = phone.match(/^\+\d{1,3}/)?.[0] || '';
    const local = phone.slice(countryCode.length);
    return `${countryCode} ${local.slice(0, 2)}****${local.slice(-2)}`;
  }

  private extractCountryCode(phone: string): string {
    const match = phone.match(/^\+(\d{1,3})/);
    if (!match) return 'UNKNOWN';

    const code = match[1];
    const countryMap: Record<string, string> = {
      '86': 'CN',
      '1': 'US',
      '852': 'HK',
      '853': 'MO',
      '886': 'TW',
      '81': 'JP',
      '82': 'KR',
      '44': 'GB',
    };

    return countryMap[code] || 'OTHER';
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async shouldBePrimary(accountId: string): Promise<boolean> {
    const existingCount = await this.prisma.identity.count({
      where: { accountId, unboundAt: null },
    });
    return existingCount === 0;
  }

  private async checkRateLimit(phone: string, accountId: string): Promise<void> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 检查1分钟内是否已发送
    const recentCount = await this.prisma.verificationRecord.count({
      where: {
        targetValue: phone,
        createdAt: { gt: oneMinuteAgo },
      },
    });

    if (recentCount > 0) {
      throw new BadRequestException('Please wait 60 seconds before requesting a new code');
    }

    // 检查24小时内发送次数
    const dailyCount = await this.prisma.verificationRecord.count({
      where: {
        targetValue: phone,
        createdAt: { gt: oneDayAgo },
      },
    });

    if (dailyCount >= 10) {
      throw new BadRequestException('Daily verification limit exceeded');
    }
  }

  private async recordBindingHistory(
    accountId: string,
    provider: IdentityProvider,
    providerId: string,
    action: BindingAction,
  ): Promise<void> {
    await this.prisma.bindingHistory.create({
      data: {
        accountId,
        provider,
        providerId,
        action,
      },
    });
  }
}
```

### 4.2 SMS 服务

```typescript
// ============================================
// sms.service.ts
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 支持多个 SMS 提供商
interface SmsProvider {
  name: string;
  send(phoneNumber: string, message: string): Promise<boolean>;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly providers: SmsProvider[] = [];
  private readonly templates: Record<string, Record<string, string>>;

  constructor(private configService: ConfigService) {
    // 初始化 SMS 提供商（按优先级排序）
    this.providers = [
      new AliyunSmsProvider(configService),
      new TencentSmsProvider(configService),
      new TwilioSmsProvider(configService), // 国际备选
    ];

    // 短信模板
    this.templates = {
      verification: {
        'zh-CN': '【Readmigo】您的验证码是 {code}，5分钟内有效。请勿泄露给他人。',
        'en': '[Readmigo] Your verification code is {code}. Valid for 5 minutes.',
      },
    };
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string,
    locale: string = 'zh-CN',
  ): Promise<void> {
    const template = this.templates.verification[locale] || this.templates.verification['en'];
    const message = template.replace('{code}', code);

    // 选择合适的提供商
    const provider = this.selectProvider(phoneNumber);

    try {
      const success = await provider.send(phoneNumber, message);
      if (!success) {
        throw new Error('SMS send failed');
      }

      this.logger.log(`Verification code sent to ${this.maskPhone(phoneNumber)}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);

      // 尝试备用提供商
      for (const fallback of this.providers) {
        if (fallback.name !== provider.name) {
          try {
            await fallback.send(phoneNumber, message);
            return;
          } catch {
            continue;
          }
        }
      }

      throw new Error('All SMS providers failed');
    }
  }

  private selectProvider(phoneNumber: string): SmsProvider {
    // 中国号码优先使用阿里云
    if (phoneNumber.startsWith('+86')) {
      return this.providers.find(p => p.name === 'aliyun') || this.providers[0];
    }
    // 国际号码使用 Twilio
    return this.providers.find(p => p.name === 'twilio') || this.providers[0];
  }

  private maskPhone(phone: string): string {
    return phone.slice(0, 6) + '****' + phone.slice(-4);
  }
}

// 阿里云 SMS 提供商
class AliyunSmsProvider implements SmsProvider {
  name = 'aliyun';

  constructor(private config: ConfigService) {}

  async send(phoneNumber: string, message: string): Promise<boolean> {
    // 阿里云 SMS API 调用
    // 实际实现需要使用 @alicloud/dysmsapi20170525
    return true;
  }
}

// 腾讯云 SMS 提供商
class TencentSmsProvider implements SmsProvider {
  name = 'tencent';

  constructor(private config: ConfigService) {}

  async send(phoneNumber: string, message: string): Promise<boolean> {
    // 腾讯云 SMS API 调用
    return true;
  }
}

// Twilio SMS 提供商（国际）
class TwilioSmsProvider implements SmsProvider {
  name = 'twilio';

  constructor(private config: ConfigService) {}

  async send(phoneNumber: string, message: string): Promise<boolean> {
    // Twilio API 调用
    return true;
  }
}
```

---

## 5. iOS 客户端实现

### 5.1 身份管理视图

```swift
// ============================================
// LinkedAccountsView.swift
// ============================================

import SwiftUI

struct LinkedAccountsView: View {
    @StateObject private var viewModel = LinkedAccountsViewModel()
    @State private var showBindSheet = false
    @State private var selectedProviderToUnbind: IdentityProvider?

    var body: some View {
        List {
            Section {
                ForEach(viewModel.identities) { identity in
                    IdentityRowView(
                        identity: identity,
                        onUnbind: {
                            selectedProviderToUnbind = identity.provider
                        }
                    )
                }
            } header: {
                Text("已绑定账号")
            } footer: {
                Text("至少需要保留一种登录方式")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Section {
                ForEach(viewModel.availableProviders, id: \.self) { provider in
                    Button {
                        viewModel.startBinding(provider: provider)
                    } label: {
                        HStack {
                            Image(provider.iconName)
                                .resizable()
                                .frame(width: 24, height: 24)
                            Text("绑定\(provider.displayName)")
                            Spacer()
                            Image(systemName: "plus.circle")
                                .foregroundColor(.accentColor)
                        }
                    }
                }
            } header: {
                Text("添加登录方式")
            }
        }
        .navigationTitle("账号绑定")
        .sheet(isPresented: $viewModel.showPhoneBinding) {
            PhoneBindingSheet(viewModel: viewModel)
        }
        .alert("解除绑定", isPresented: .constant(selectedProviderToUnbind != nil)) {
            Button("取消", role: .cancel) {
                selectedProviderToUnbind = nil
            }
            Button("确认解绑", role: .destructive) {
                if let provider = selectedProviderToUnbind {
                    viewModel.unbind(provider: provider)
                }
                selectedProviderToUnbind = nil
            }
        } message: {
            if let provider = selectedProviderToUnbind {
                Text("确定要解除\(provider.displayName)的绑定吗？解除后将无法使用该方式登录。")
            }
        }
        .onAppear {
            viewModel.loadIdentities()
        }
    }
}

struct IdentityRowView: View {
    let identity: LinkedIdentity
    let onUnbind: () -> Void

    var body: some View {
        HStack {
            Image(identity.provider.iconName)
                .resizable()
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(identity.displayName)
                        .font(.body)

                    if identity.isPrimary {
                        Text("主要")
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(4)
                    }
                }

                Text(identity.maskedIdentifier)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if identity.isVerified {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(.green)
            }

            Button {
                onUnbind()
            } label: {
                Image(systemName: "minus.circle")
                    .foregroundColor(.red)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 4)
    }
}
```

### 5.2 手机号绑定视图

```swift
// ============================================
// PhoneBindingSheet.swift
// ============================================

import SwiftUI

struct PhoneBindingSheet: View {
    @ObservedObject var viewModel: LinkedAccountsViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var phoneNumber = ""
    @State private var verificationCode = ""
    @State private var countdown = 0
    @State private var isCodeSent = false

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // 手机号输入
                VStack(alignment: .leading, spacing: 8) {
                    Text("手机号")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        Text("+86")
                            .padding(.horizontal, 12)
                            .padding(.vertical, 10)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)

                        TextField("请输入手机号", text: $phoneNumber)
                            .keyboardType(.phonePad)
                            .textContentType(.telephoneNumber)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                }

                // 验证码输入
                if isCodeSent {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("验证码")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        HStack {
                            TextField("6位验证码", text: $verificationCode)
                                .keyboardType(.numberPad)
                                .textContentType(.oneTimeCode)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)

                            Button {
                                sendCode()
                            } label: {
                                Text(countdown > 0 ? "\(countdown)s" : "重新发送")
                                    .frame(width: 80)
                            }
                            .disabled(countdown > 0)
                            .buttonStyle(.bordered)
                        }
                    }
                }

                Spacer()

                // 操作按钮
                if isCodeSent {
                    Button {
                        Task {
                            await viewModel.verifyAndBindPhone(
                                phoneNumber: "+86\(phoneNumber)",
                                code: verificationCode
                            )
                            dismiss()
                        }
                    } label: {
                        Text("确认绑定")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(verificationCode.count != 6)
                } else {
                    Button {
                        sendCode()
                    } label: {
                        Text("获取验证码")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!isValidPhoneNumber)
                }
            }
            .padding()
            .navigationTitle("绑定手机号")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
            }
            .onReceive(timer) { _ in
                if countdown > 0 {
                    countdown -= 1
                }
            }
        }
    }

    private var isValidPhoneNumber: Bool {
        let pattern = "^1[3-9]\\d{9}$"
        return phoneNumber.range(of: pattern, options: .regularExpression) != nil
    }

    private func sendCode() {
        Task {
            do {
                try await viewModel.sendPhoneVerificationCode(phoneNumber: "+86\(phoneNumber)")
                isCodeSent = true
                countdown = 60
            } catch {
                // 处理错误
            }
        }
    }
}
```

### 5.3 第三方登录绑定

```swift
// ============================================
// SocialBindingService.swift
// ============================================

import AuthenticationServices
import GoogleSignIn

@MainActor
class SocialBindingService: ObservableObject {
    private let apiClient: APIClient

    init(apiClient: APIClient = .shared) {
        self.apiClient = apiClient
    }

    // MARK: - Apple Sign In Binding

    func bindApple() async throws -> LinkedIdentity {
        let credential = try await performAppleSignIn()

        guard let identityToken = credential.identityToken,
              let identityTokenString = String(data: identityToken, encoding: .utf8),
              let authorizationCode = credential.authorizationCode,
              let authCodeString = String(data: authorizationCode, encoding: .utf8) else {
            throw BindingError.invalidCredential
        }

        let fullName = [
            credential.fullName?.givenName,
            credential.fullName?.familyName
        ].compactMap { $0 }.joined(separator: " ")

        let response: BindAppleResponse = try await apiClient.post(
            "/auth/apple/bind",
            body: BindAppleRequest(
                identityToken: identityTokenString,
                authorizationCode: authCodeString,
                fullName: fullName.isEmpty ? nil : fullName
            )
        )

        if response.needMerge {
            throw BindingError.accountConflict(existingAccountId: response.existingAccountId)
        }

        return response.identity
    }

    private func performAppleSignIn() async throws -> ASAuthorizationAppleIDCredential {
        return try await withCheckedThrowingContinuation { continuation in
            let provider = ASAuthorizationAppleIDProvider()
            let request = provider.createRequest()
            request.requestedScopes = [.email, .fullName]

            let controller = ASAuthorizationController(authorizationRequests: [request])
            let delegate = AppleSignInDelegate(continuation: continuation)
            controller.delegate = delegate
            controller.presentationContextProvider = delegate
            controller.performRequests()

            // 保持 delegate 引用
            objc_setAssociatedObject(controller, "delegate", delegate, .OBJC_ASSOCIATION_RETAIN)
        }
    }

    // MARK: - Google Sign In Binding

    func bindGoogle(presenting viewController: UIViewController) async throws -> LinkedIdentity {
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: viewController)

        guard let idToken = result.user.idToken?.tokenString else {
            throw BindingError.invalidCredential
        }

        let response: BindGoogleResponse = try await apiClient.post(
            "/auth/google/bind",
            body: BindGoogleRequest(
                idToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )
        )

        if response.needMerge {
            throw BindingError.accountConflict(existingAccountId: response.existingAccountId)
        }

        return response.identity
    }

    // MARK: - WeChat Binding

    func bindWeChat() async throws -> LinkedIdentity {
        // 调用微信 SDK 进行授权
        let code = try await performWeChatAuth()

        let response: BindWeChatResponse = try await apiClient.post(
            "/auth/wechat/bind",
            body: BindWeChatRequest(code: code)
        )

        if response.needMerge {
            throw BindingError.accountConflict(existingAccountId: response.existingAccountId)
        }

        return response.identity
    }

    private func performWeChatAuth() async throws -> String {
        // 微信 SDK 授权逻辑
        // 需要集成 WechatOpenSDK
        fatalError("WeChat SDK integration required")
    }
}

// MARK: - Models

struct LinkedIdentity: Identifiable, Codable {
    let id: String
    let provider: IdentityProvider
    let displayName: String
    let maskedIdentifier: String
    let isPrimary: Bool
    let isVerified: Bool
    let createdAt: Date
}

enum IdentityProvider: String, Codable, CaseIterable {
    case apple = "APPLE"
    case google = "GOOGLE"
    case wechat = "WECHAT"
    case phone = "PHONE"

    var displayName: String {
        switch self {
        case .apple: return "Apple"
        case .google: return "Google"
        case .wechat: return "微信"
        case .phone: return "手机号"
        }
    }

    var iconName: String {
        switch self {
        case .apple: return "apple.logo"
        case .google: return "g.circle.fill"
        case .wechat: return "wechat.fill"
        case .phone: return "phone.fill"
        }
    }
}

enum BindingError: Error {
    case invalidCredential
    case accountConflict(existingAccountId: String?)
    case rateLimited
    case networkError(Error)
}
```

---

## 6. API 设计

### 6.1 手机号相关 API

```yaml
# 发送验证码
POST /api/v1/auth/phone/send-code
Request:
  {
    "phoneNumber": "+8613812345678",
    "purpose": "BIND" | "LOGIN" | "UNBIND"
  }
Response:
  {
    "success": true,
    "expiresIn": 300,
    "maskedPhone": "+86 138****5678"
  }
Errors:
  - 400: Invalid phone number format
  - 409: Phone number already bound to another account
  - 429: Rate limit exceeded

# 验证并绑定手机号
POST /api/v1/auth/phone/verify
Request:
  {
    "phoneNumber": "+8613812345678",
    "code": "123456"
  }
Response:
  {
    "success": true,
    "identity": {
      "id": "uuid",
      "provider": "PHONE",
      "displayName": "138****5678",
      "maskedIdentifier": "+86 138****5678",
      "isPrimary": false,
      "isVerified": true,
      "createdAt": "2025-12-23T10:00:00Z"
    }
  }
Errors:
  - 400: Invalid or expired verification code
  - 429: Too many attempts
```

### 6.2 Apple/Google 绑定 API

```yaml
# 绑定 Apple ID
POST /api/v1/auth/apple/bind
Request:
  {
    "identityToken": "string",
    "authorizationCode": "string",
    "fullName": "string"  # optional, 首次授权时提供
  }
Response:
  {
    "success": true,
    "identity": { ... },
    "needMerge": false
  }
# 如果需要合并:
  {
    "success": false,
    "needMerge": true,
    "existingAccountId": "usr_reg_xxx",
    "message": "This Apple ID is already linked to another account"
  }

# 绑定 Google
POST /api/v1/auth/google/bind
Request:
  {
    "idToken": "string",
    "accessToken": "string"
  }
Response: # 同上
```

### 6.3 微信绑定 API

```yaml
# 绑定微信
POST /api/v1/auth/wechat/bind
Request:
  {
    "code": "string"  # 微信授权 code
  }
Response:
  {
    "success": true,
    "identity": {
      "id": "uuid",
      "provider": "WECHAT",
      "displayName": "微信昵称",
      "avatarUrl": "https://...",
      "isPrimary": false,
      "isVerified": true,
      "createdAt": "2025-12-23T10:00:00Z"
    },
    "needMerge": false
  }
```

### 6.4 身份管理 API

```yaml
# 获取已绑定身份列表
GET /api/v1/auth/identities
Response:
  {
    "identities": [
      {
        "id": "uuid",
        "provider": "APPLE",
        "displayName": "John Doe",
        "maskedIdentifier": "j***@privaterelay.appleid.com",
        "isPrimary": true,
        "isVerified": true,
        "lastUsedAt": "2025-12-23T10:00:00Z",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      {
        "id": "uuid",
        "provider": "PHONE",
        "displayName": "138****5678",
        "maskedIdentifier": "+86 138****5678",
        "isPrimary": false,
        "isVerified": true,
        "lastUsedAt": "2025-12-20T10:00:00Z",
        "createdAt": "2025-06-01T00:00:00Z"
      }
    ],
    "availableProviders": ["GOOGLE", "WECHAT"]
  }

# 解除绑定
DELETE /api/v1/auth/identities/:identityId
Request:
  {
    "verificationToken": "string"  # 可选，解绑主要身份时需要
  }
Response:
  {
    "success": true
  }
Errors:
  - 400: Cannot unbind the last login method
  - 401: Verification required

# 设置主要身份
PUT /api/v1/auth/identities/:identityId/primary
Response:
  {
    "success": true
  }
```

---

## 7. 安全设计

### 7.1 验证码安全

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Verification Code Security                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. 验证码生成                                                               │
│     ─────────────                                                            │
│     • 使用 crypto.randomInt() 生成 6 位数字                                 │
│     • 不使用可预测的算法（如时间戳）                                         │
│     • 验证码有效期 5 分钟                                                   │
│                                                                              │
│  2. 存储安全                                                                 │
│     ─────────────                                                            │
│     • 验证码使用 bcrypt 哈希后存储                                          │
│     • 不以明文形式记录日志                                                  │
│     • 验证成功后立即标记为已使用                                            │
│                                                                              │
│  3. 防暴力破解                                                               │
│     ─────────────                                                            │
│     • 单个验证码最多尝试 5 次                                               │
│     • 超过次数后验证码失效                                                  │
│     • 连续失败后增加冷却时间                                                │
│                                                                              │
│  4. 频率限制                                                                 │
│     ─────────────                                                            │
│     • 同一手机号: 60秒/1次, 24小时/10次                                     │
│     • 同一IP: 1小时/20次                                                    │
│     • 同一设备: 1小时/10次                                                  │
│                                                                              │
│  5. 防短信轰炸                                                               │
│     ─────────────                                                            │
│     • 前端图形验证码（频繁请求时）                                          │
│     • 后端异常行为检测                                                      │
│     • 黑名单机制                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 OAuth 安全

```typescript
// ============================================
// oauth-security.service.ts
// ============================================

@Injectable()
export class OAuthSecurityService {
  /**
   * 验证 Apple Identity Token
   */
  async verifyAppleIdentityToken(token: string): Promise<AppleTokenPayload> {
    // 1. 获取 Apple 公钥
    const keys = await this.fetchApplePublicKeys();

    // 2. 解码 token header 获取 kid
    const header = this.decodeJwtHeader(token);
    const key = keys.find(k => k.kid === header.kid);

    if (!key) {
      throw new UnauthorizedException('Invalid token: key not found');
    }

    // 3. 验证签名
    try {
      const payload = jwt.verify(token, this.jwkToPem(key), {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.configService.get('APPLE_CLIENT_ID'),
      }) as AppleTokenPayload;

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple identity token');
    }
  }

  /**
   * 验证 Google ID Token
   */
  async verifyGoogleIdToken(token: string): Promise<GoogleTokenPayload> {
    const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      return ticket.getPayload() as GoogleTokenPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }

  /**
   * 安全存储 OAuth Tokens
   */
  async securelyStoreTokens(
    identityId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const encryptedAccess = await this.encryptionService.encrypt(accessToken);
    const encryptedRefresh = refreshToken
      ? await this.encryptionService.encrypt(refreshToken)
      : null;

    await this.prisma.identity.update({
      where: { id: identityId },
      data: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
      },
    });
  }
}
```

### 7.3 绑定安全规则

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Binding Security Rules                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. 必须保留登录方式                                                         │
│     ─────────────────────                                                    │
│     • 账号必须至少保留一个已验证的登录方式                                   │
│     • 解绑最后一个身份时拒绝操作                                             │
│                                                                              │
│  2. 解绑主要身份需验证                                                       │
│     ─────────────────────                                                    │
│     • 解绑主要登录方式前，需通过另一种方式验证身份                           │
│     • 支持手机验证码或重新登录验证                                           │
│                                                                              │
│  3. 防止身份盗用                                                             │
│     ─────────────────────                                                    │
│     • 同一第三方身份只能绑定一个账号                                         │
│     • 发现冲突时提示用户选择合并或取消                                       │
│                                                                              │
│  4. 敏感操作日志                                                             │
│     ─────────────────────                                                    │
│     • 所有绑定/解绑操作记录完整日志                                          │
│     • 包含 IP、设备、时间等信息                                              │
│     • 异常操作触发告警                                                       │
│                                                                              │
│  5. 冷却期保护                                                               │
│     ─────────────────────                                                    │
│     • 解绑后 30 天内可恢复                                                  │
│     • 30 天后永久删除绑定信息                                               │
│     • 恢复需要重新验证身份                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. 异常处理

### 8.1 账号冲突处理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Account Conflict Handling                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  场景: 用户尝试绑定的社交账号已关联到另一个 Readmigo 账号                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   当前账号 (A)              已存在账号 (B)                          │    │
│  │   usr_reg_aaa               usr_reg_bbb                             │    │
│  │                                                                      │    │
│  │   ┌─────────────┐           ┌─────────────┐                        │    │
│  │   │ 手机号绑定  │           │ Apple ID    │                        │    │
│  │   │ 138****5678 │           │ xxx@icloud  │                        │    │
│  │   └─────────────┘           └─────────────┘                        │    │
│  │         │                          │                                │    │
│  │         │    用户尝试绑定          │                                │    │
│  │         │    同一个 Apple ID       │                                │    │
│  │         └──────────────────────────┘                                │    │
│  │                     │                                               │    │
│  │                     ▼                                               │    │
│  │   ┌──────────────────────────────────────────────────────────┐     │    │
│  │   │                   用户选择                                │     │    │
│  │   │                                                           │     │    │
│  │   │   1. 合并账号 (A ← B)                                    │     │    │
│  │   │      • 将 B 的数据迁移到 A                               │     │    │
│  │   │      • 解除 B 与 Apple ID 的绑定                         │     │    │
│  │   │      • 将 Apple ID 绑定到 A                              │     │    │
│  │   │      • 标记 B 为已合并                                   │     │    │
│  │   │                                                           │     │    │
│  │   │   2. 切换账号                                             │     │    │
│  │   │      • 登出当前账号 A                                    │     │    │
│  │   │      • 登录账号 B                                        │     │    │
│  │   │      • 保持两个账号独立                                  │     │    │
│  │   │                                                           │     │    │
│  │   │   3. 取消操作                                             │     │    │
│  │   │      • 不进行任何变更                                    │     │    │
│  │   │                                                           │     │    │
│  │   └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 错误码定义

```typescript
// ============================================
// binding-errors.ts
// ============================================

export enum BindingErrorCode {
  // 验证相关
  INVALID_PHONE_FORMAT = 'BINDING_001',
  VERIFICATION_CODE_EXPIRED = 'BINDING_002',
  VERIFICATION_CODE_INVALID = 'BINDING_003',
  VERIFICATION_ATTEMPTS_EXCEEDED = 'BINDING_004',

  // 绑定相关
  IDENTITY_ALREADY_BOUND = 'BINDING_010',
  IDENTITY_BOUND_TO_OTHER = 'BINDING_011',
  CANNOT_UNBIND_LAST_IDENTITY = 'BINDING_012',
  UNBIND_REQUIRES_VERIFICATION = 'BINDING_013',

  // OAuth 相关
  OAUTH_TOKEN_INVALID = 'BINDING_020',
  OAUTH_TOKEN_EXPIRED = 'BINDING_021',
  OAUTH_PROVIDER_ERROR = 'BINDING_022',

  // 频率限制
  RATE_LIMIT_SMS = 'BINDING_030',
  RATE_LIMIT_BIND = 'BINDING_031',

  // 系统错误
  SMS_SEND_FAILED = 'BINDING_040',
  INTERNAL_ERROR = 'BINDING_099',
}

export const BindingErrorMessages: Record<BindingErrorCode, string> = {
  [BindingErrorCode.INVALID_PHONE_FORMAT]: '手机号格式不正确',
  [BindingErrorCode.VERIFICATION_CODE_EXPIRED]: '验证码已过期，请重新获取',
  [BindingErrorCode.VERIFICATION_CODE_INVALID]: '验证码错误，请重新输入',
  [BindingErrorCode.VERIFICATION_ATTEMPTS_EXCEEDED]: '尝试次数过多，请稍后重试',

  [BindingErrorCode.IDENTITY_ALREADY_BOUND]: '该登录方式已绑定到当前账号',
  [BindingErrorCode.IDENTITY_BOUND_TO_OTHER]: '该登录方式已绑定到其他账号',
  [BindingErrorCode.CANNOT_UNBIND_LAST_IDENTITY]: '无法解除最后一种登录方式',
  [BindingErrorCode.UNBIND_REQUIRES_VERIFICATION]: '解除绑定需要身份验证',

  [BindingErrorCode.OAUTH_TOKEN_INVALID]: '授权令牌无效',
  [BindingErrorCode.OAUTH_TOKEN_EXPIRED]: '授权已过期，请重新授权',
  [BindingErrorCode.OAUTH_PROVIDER_ERROR]: '第三方服务暂时不可用',

  [BindingErrorCode.RATE_LIMIT_SMS]: '验证码发送过于频繁，请稍后再试',
  [BindingErrorCode.RATE_LIMIT_BIND]: '操作过于频繁，请稍后再试',

  [BindingErrorCode.SMS_SEND_FAILED]: '短信发送失败，请稍后重试',
  [BindingErrorCode.INTERNAL_ERROR]: '系统错误，请稍后重试',
};
```

---

## 9. 实施计划

### Phase 1: 基础绑定功能 (优先级: 高)

- [ ] 实现 Identity Binding Service
- [ ] 实现手机号验证码发送/验证
- [ ] 实现 Apple Sign In 绑定
- [ ] 实现 Google Sign In 绑定
- [ ] iOS 客户端绑定界面

### Phase 2: 微信与其他平台 (优先级: 中)

- [ ] 实现微信授权绑定
- [ ] 实现 QQ 授权绑定（预留）
- [ ] 实现微博授权绑定（预留）

### Phase 3: 安全与监控 (优先级: 高)

- [ ] 实现完整的频率限制
- [ ] 实现异常行为检测
- [ ] 添加绑定操作监控
- [ ] 完善日志记录

### Phase 4: 高级功能 (优先级: 低)

- [ ] 账号合并流程
- [ ] 解绑恢复功能
- [ ] 多设备同步通知

---

## 10. 开放问题

1. **微信 UnionID**: 是否需要申请微信开放平台的 UnionID 权限？
2. **短信服务商**: 国内使用阿里云还是腾讯云？
3. **邮箱登录**: 是否需要支持传统的邮箱密码登录？
4. **海外手机号**: 是否需要支持国际手机号验证？

---

## 11. 附录

### A. 各平台 SDK 集成文档

| 平台 | 文档链接 |
|------|---------|
| Apple Sign In | https://developer.apple.com/sign-in-with-apple/ |
| Google Sign In | https://developers.google.com/identity |
| 微信开放平台 | https://developers.weixin.qq.com/doc/oplatform/ |
| 阿里云 SMS | https://help.aliyun.com/product/44282.html |
| 腾讯云 SMS | https://cloud.tencent.com/product/sms |

### B. E.164 手机号格式

```
格式: +[国家代码][用户号码]

示例:
+8613812345678    (中国大陆)
+85212345678      (香港)
+886912345678     (台湾)
+14155551234      (美国)
+447123456789     (英国)
```

---

**Document Status**: Ready for Review
**Next Steps**: 请 review 后提出修改意见

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 已规划 | 10% | 2025-12-23 | 设计文档完成，代码实现待开发 |

### 已完成 ✅
- [x] 社交绑定系统整体架构设计
- [x] 5种身份类型支持设计（手机/Apple/Google/微信/邮箱）
- [x] Prisma Schema 设计
  - [x] AccountIdentity 模型
  - [x] IdentityType 枚举
- [x] 绑定流程设计（5个步骤）
- [x] 解绑流程设计
- [x] 手机号验证流程设计
- [x] OAuth集成设计（Apple/Google/微信）
- [x] 安全策略设计（频率限制/异常检测）
- [x] 错误处理设计

### 进行中 🚧
- [ ] 无

### 待开发 📝

**Phase 1: 基础绑定功能 (优先级: 高)**
- [ ] 实现 Identity Binding Service (Backend)
  - [ ] bindIdentity（绑定身份）
  - [ ] unbindIdentity（解绑身份）
  - [ ] checkDuplicate（重复检测）
  - [ ] validateBinding（绑定验证）
- [ ] 实现手机号验证
  - [ ] SMS 服务集成（阿里云/腾讯云）
  - [ ] 验证码生成和发送
  - [ ] 验证码验证
  - [ ] 验证码频率限制
- [ ] 实现 Apple Sign In 绑定
  - [ ] Apple OAuth 流程
  - [ ] identityToken 验证
  - [ ] 绑定状态管理
- [ ] 实现 Google Sign In 绑定
  - [ ] Google OAuth 流程
  - [ ] idToken 验证
  - [ ] 绑定状态管理
- [ ] iOS 客户端绑定界面
  - [ ] 账号设置页面
  - [ ] 手机号绑定界面
  - [ ] 社交账号绑定界面
  - [ ] 解绑确认弹窗

**Phase 2: 微信与其他平台 (优先级: 中)**
- [ ] 实现微信授权绑定
  - [ ] 微信 SDK 集成
  - [ ] UnionID 获取
  - [ ] 绑定流程
- [ ] 实现 QQ 授权绑定（预留）
- [ ] 实现微博授权绑定（预留）
- [ ] 邮箱绑定（如需要）
  - [ ] 邮箱验证码发送
  - [ ] 邮箱验证流程

**Phase 3: 安全与监控 (优先级: 高)**
- [ ] 实现频率限制
  - [ ] 验证码发送限制（60秒/次）
  - [ ] 绑定操作限制（5次/小时）
  - [ ] IP限制
- [ ] 实现异常行为检测
  - [ ] 批量绑定检测
  - [ ] 异常IP检测
  - [ ] 可疑行为告警
- [ ] 添加绑定操作监控
  - [ ] 绑定成功率监控
  - [ ] 验证码发送量监控
  - [ ] 错误率监控
- [ ] 完善日志记录
  - [ ] 绑定操作日志
  - [ ] 安全事件日志
  - [ ] 审计日志

**Phase 4: 高级功能 (优先级: 低)**
- [ ] 账号合并流程
  - [ ] 合并确认界面
  - [ ] 数据合并逻辑
  - [ ] 冲突解决策略
- [ ] 解绑恢复功能
  - [ ] 解绑冷静期（24小时）
  - [ ] 恢复请求处理
- [ ] 多设备同步通知
  - [ ] 绑定/解绑推送通知
  - [ ] 安全事件通知

### 依赖项
- ✅ Account 模型已存在
- ✅ Apple Sign In 已集成（登录功能）
- 📝 需要短信服务商（阿里云SMS/腾讯云SMS）
- 📝 需要微信开放平台账号（如需微信绑定）
- 📝 需要 Google Cloud Console 配置
- 📝 需要账号设置页面UI设计

### 技术债务
- 缺少账号合并的详细实现
- 缺少邮箱绑定的完整流程
- 缺少国际手机号支持
- 缺少绑定操作的E2E测试
- 验证码防刷机制需要加强
