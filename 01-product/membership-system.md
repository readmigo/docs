# Readmigo 会员体系完整设计

> 版本: 1.2
> 最后更新: 2024-12-24
> 状态: ✅ 已完成 - 全栈实现 (后端 Guards + iOS FeatureGate + Trial + Admin APIs)

## 目录

1. [概述](#1-概述)
2. [订阅状态机设计](#2-订阅状态机设计)
3. [试用期处理](#3-试用期处理)
4. [订阅生命周期管理](#4-订阅生命周期管理)
5. [客服取消与退款](#5-客服取消与退款)
6. [全栈权限控制架构](#6-全栈权限控制架构)
7. [数据模型设计](#7-数据模型设计)
8. [API 设计](#8-api-设计)
9. [行业最佳实践参考](#9-行业最佳实践参考)

---

## 1. 概述

### 1.1 会员层级定义

| 层级 | 定价 | 定位 |
|------|------|------|
| **Free** | $0 | 体验用户，有功能限制 |
| **Pro** | $7.99/月 或 $49.99/年 | 核心付费用户 |
| **Premium** | $12.99/月 或 $79.99/年 | 高级用户（预留） |

### 1.2 订阅来源

```
┌─────────────────────────────────────────────────────────┐
│                    订阅渠道                              │
├─────────────────────────────────────────────────────────┤
│  Apple App Store (StoreKit 2)  │  主要渠道              │
│  Google Play Billing           │  Android 预留          │
│  Stripe (Web)                  │  Web 端预留            │
│  Promo Code                    │  运营活动              │
│  Admin Grant                   │  客服手动授权          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 订阅状态机设计

### 2.1 状态定义

```typescript
enum SubscriptionStatus {
  // 基础状态
  NONE = 'NONE',                    // 从未订阅（纯免费用户）

  // 试用相关
  TRIAL = 'TRIAL',                  // 试用期内
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',  // 试用已过期（未转化）

  // 正式订阅
  ACTIVE = 'ACTIVE',                // 订阅有效

  // 过渡状态
  GRACE_PERIOD = 'GRACE_PERIOD',    // 宽限期（支付失败后）
  BILLING_RETRY = 'BILLING_RETRY',  // Apple 正在重试扣款

  // 终止状态
  EXPIRED = 'EXPIRED',              // 已过期（未续订）
  CANCELLED = 'CANCELLED',          // 用户主动取消
  REFUNDED = 'REFUNDED',            // 已退款
  REVOKED = 'REVOKED',              // 被撤销（欺诈等）

  // 特殊状态
  PAUSED = 'PAUSED',                // 暂停（部分平台支持）
  PROMO = 'PROMO',                  // 促销/赠送
}
```

### 2.2 状态流转图

```
                                    ┌─────────────────┐
                                    │     NONE        │
                                    │  (纯免费用户)    │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
          ┌─────────────────┐     ┌─────────────────┐      ┌─────────────────┐
          │     TRIAL       │     │     ACTIVE      │      │     PROMO       │
          │   (7天试用)      │     │  (直接购买月付)   │      │    (促销赠送)    │
          └────────┬────────┘     └────────┬────────┘      └────────┬────────┘
                   │                       │                        │
      ┌────────────┼────────────┐          │                        │
      │            │            │          │                        │
      ▼            ▼            ▼          ▼                        ▼
┌───────────┐ ┌─────────┐ ┌─────────────────────────────────────────────────┐
│TRIAL_     │ │ ACTIVE  │ │                   ACTIVE                        │
│EXPIRED    │ │(试用转化)│ │                  (正式订阅中)                     │
└───────────┘ └─────────┘ └────────────────────────┬────────────────────────┘
                                                   │
                          ┌────────────────────────┼────────────────────────┐
                          │                        │                        │
                          ▼                        ▼                        ▼
                ┌─────────────────┐     ┌─────────────────┐      ┌─────────────────┐
                │  GRACE_PERIOD   │     │   CANCELLED     │      │    EXPIRED      │
                │   (16天宽限期)   │     │  (用户主动取消)   │      │  (到期未续订)   │
                └────────┬────────┘     └────────┬────────┘      └─────────────────┘
                         │                       │
            ┌────────────┼────────────┐          │
            │            │            │          │
            ▼            ▼            ▼          ▼
      ┌─────────┐ ┌───────────┐ ┌─────────────────────────────┐
      │ ACTIVE  │ │ EXPIRED   │ │      REFUNDED / REVOKED     │
      │(恢复成功)│ │(宽限期结束) │ │      (退款 / 撤销)           │
      └─────────┘ └───────────┘ └─────────────────────────────┘
```

### 2.3 状态转换规则表

| 当前状态 | 触发事件 | 目标状态 | 说明 |
|---------|---------|---------|------|
| NONE | 开始试用 | TRIAL | 仅年付提供试用 |
| NONE | 直接购买 | ACTIVE | 月付无试用 |
| NONE | 获得促销 | PROMO | 运营活动赠送 |
| TRIAL | 试用到期+转化 | ACTIVE | 自动扣款成功 |
| TRIAL | 试用到期+取消 | TRIAL_EXPIRED | 用户取消试用 |
| TRIAL | 提前购买 | ACTIVE | 试用期内主动购买 |
| ACTIVE | 自动续订成功 | ACTIVE | 保持有效 |
| ACTIVE | 支付失败 | GRACE_PERIOD | 进入16天宽限期 |
| ACTIVE | 用户取消续订 | CANCELLED | 仍可用至期末 |
| ACTIVE | 请求退款 | REFUNDED | 立即失效 |
| GRACE_PERIOD | 支付恢复 | ACTIVE | 恢复订阅 |
| GRACE_PERIOD | 宽限期结束 | EXPIRED | 订阅终止 |
| CANCELLED | 到期日到达 | EXPIRED | 正式过期 |
| CANCELLED | 重新订阅 | ACTIVE | 恢复订阅 |
| EXPIRED | 重新订阅 | ACTIVE/TRIAL | 允许重新订阅 |

---

## 3. 试用期处理

### 3.1 试用期规则

```typescript
interface TrialConfig {
  // 试用期时长
  durationDays: 7;

  // 适用条件
  eligibility: {
    onlyNewUsers: true;           // 仅新用户
    onlyYearlyPlan: true;         // 仅年付计划
    requirePaymentMethod: true;   // 需绑定支付方式
    maxTrialsPerDevice: 1;        // 每设备最多1次
    maxTrialsPerAccount: 1;       // 每账户最多1次
  };

  // 试用期功能
  features: {
    fullAccess: true;             // 完整功能访问
    showCountdown: true;          // 显示倒计时
    reminderDays: [3, 1, 0];      // 提醒时机
  };
}
```

### 3.2 试用资格判断

```typescript
// 后端服务
class TrialEligibilityService {
  async checkEligibility(userId: string, deviceId: string): Promise<TrialEligibility> {
    const checks = await Promise.all([
      this.hasUsedTrialBefore(userId),
      this.hasDeviceUsedTrial(deviceId),
      this.hasActiveSubscription(userId),
      this.hasPreviousSubscription(userId),
    ]);

    const [usedByUser, usedByDevice, hasActive, hadPrevious] = checks;

    if (usedByUser) {
      return { eligible: false, reason: 'TRIAL_ALREADY_USED' };
    }
    if (usedByDevice) {
      return { eligible: false, reason: 'DEVICE_TRIAL_USED' };
    }
    if (hasActive) {
      return { eligible: false, reason: 'ALREADY_SUBSCRIBED' };
    }
    if (hadPrevious) {
      return { eligible: false, reason: 'PREVIOUS_SUBSCRIBER' };
    }

    return { eligible: true };
  }
}
```

### 3.3 试用期提醒策略

```typescript
// 推送通知策略
const trialReminders = [
  {
    trigger: 'trial_day_4',           // 试用第4天
    title: '您的试用还剩3天',
    body: '继续探索 Readmigo 的全部功能',
    deeplink: 'readmigo://subscription',
  },
  {
    trigger: 'trial_day_6',           // 试用第6天
    title: '明天试用即将结束',
    body: '订阅 Pro 享受无限阅读',
    deeplink: 'readmigo://subscription',
  },
  {
    trigger: 'trial_day_7',           // 试用最后一天
    title: '试用今天结束',
    body: '立即订阅，继续您的学习之旅',
    deeplink: 'readmigo://subscription',
  },
  {
    trigger: 'trial_expired_day_1',   // 试用过期后第1天
    title: '您的试用已结束',
    body: '订阅解锁全部功能',
    deeplink: 'readmigo://subscription',
  },
];
```

### 3.4 试用期 UI 处理

```swift
// iOS 客户端
struct TrialBanner: View {
  let trialStatus: TrialStatus

  var body: some View {
    switch trialStatus {
    case .active(let daysRemaining):
      HStack {
        Image(systemName: "clock")
        Text("试用剩余 \(daysRemaining) 天")
        Spacer()
        Button("立即订阅") { showPaywall() }
      }
      .background(Color.blue.opacity(0.1))

    case .expiringSoon(let hours):
      HStack {
        Image(systemName: "exclamationmark.triangle")
        Text("试用将在 \(hours) 小时后结束")
        Spacer()
        Button("订阅") { showPaywall() }
      }
      .background(Color.orange.opacity(0.1))

    case .expired:
      // 不显示 banner，直接弹出 paywall
      EmptyView()
    }
  }
}
```

---

## 4. 订阅生命周期管理

### 4.1 自动续订流程

```
                    订阅到期前 24 小时
                           │
                           ▼
              ┌────────────────────────┐
              │  Apple 尝试自动扣款      │
              └───────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
     ┌─────────────┐            ┌─────────────┐
     │  扣款成功    │            │  扣款失败     │
     └──────┬──────┘            └──────┬──────┘
            │                          │
            ▼                          ▼
     ┌─────────────┐            ┌─────────────┐
     │ 发送 Server  │            │  进入宽限期  │
     │ Notification│            │ (16天)      │
     └──────┬──────┘            └──────┬──────┘
            │                          │
            ▼                          │
     ┌─────────────┐                   │
     │  更新订阅    │                   │
     │  expiresAt  │                   │
     └─────────────┘                   │
                                       │
              ┌────────────────────────┴─────────────────────────┐
              │                        │                         │
              ▼                        ▼                         ▼
       ┌─────────────┐         ┌─────────────┐          ┌─────────────┐
       │ 用户更新     │         │ Apple 重试   │          │  宽限期结束   │
       │ 支付方式     │         │  扣款成功     │          │  订阅过期    │
       └──────┬──────┘         └──────┬──────┘          └──────┬──────┘
              │                       │                        │
              └───────────────────────┘                        │
                          │                                    │
                          ▼                                    ▼
                   ┌─────────────┐                     ┌─────────────┐
                   │ 恢复 ACTIVE  │                     │  EXPIRED    │
                   └─────────────┘                     └─────────────┘
```

### 4.2 Apple Server-to-Server Notifications (V2)

```typescript
// 需要处理的通知类型
enum AppleNotificationType {
  // 订阅生命周期
  SUBSCRIBED = 'SUBSCRIBED',                    // 新订阅
  DID_RENEW = 'DID_RENEW',                      // 续订成功
  DID_CHANGE_RENEWAL_STATUS = 'DID_CHANGE_RENEWAL_STATUS', // 续订状态变化
  DID_CHANGE_RENEWAL_PREF = 'DID_CHANGE_RENEWAL_PREF',     // 续订偏好变化

  // 问题处理
  DID_FAIL_TO_RENEW = 'DID_FAIL_TO_RENEW',      // 续订失败
  GRACE_PERIOD_EXPIRED = 'GRACE_PERIOD_EXPIRED', // 宽限期过期

  // 退款相关
  REFUND = 'REFUND',                            // 退款
  REFUND_DECLINED = 'REFUND_DECLINED',          // 退款被拒
  REFUND_REVERSED = 'REFUND_REVERSED',          // 退款撤销

  // 其他
  EXPIRED = 'EXPIRED',                          // 过期
  REVOKE = 'REVOKE',                            // 撤销
  CONSUMPTION_REQUEST = 'CONSUMPTION_REQUEST',  // 消费信息请求
}

// Webhook 处理
@Post('/webhooks/apple')
async handleAppleNotification(@Body() payload: AppleNotificationPayload) {
  const notification = await this.verifyAndDecode(payload.signedPayload);

  switch (notification.notificationType) {
    case 'SUBSCRIBED':
      await this.handleNewSubscription(notification);
      break;

    case 'DID_RENEW':
      await this.handleRenewal(notification);
      break;

    case 'DID_FAIL_TO_RENEW':
      await this.handleRenewalFailure(notification);
      break;

    case 'GRACE_PERIOD_EXPIRED':
      await this.handleGracePeriodExpired(notification);
      break;

    case 'REFUND':
      await this.handleRefund(notification);
      break;

    case 'REVOKE':
      await this.handleRevocation(notification);
      break;

    // ... 其他处理
  }
}
```

### 4.3 到期处理策略

```typescript
// 定时任务：检查即将到期的订阅
@Cron('0 0 * * *') // 每天执行
async checkExpiringSubscriptions() {
  // 1. 找出3天内到期且未设置取消的订阅（提醒）
  const expiringSoon = await this.findExpiringSubscriptions(3);
  for (const sub of expiringSoon) {
    await this.sendExpirationReminder(sub);
  }

  // 2. 找出已取消续订、即将到期的订阅
  const cancelledExpiring = await this.findCancelledExpiringSubscriptions(7);
  for (const sub of cancelledExpiring) {
    await this.sendWinbackOffer(sub);
  }

  // 3. 清理已过期超过30天的订阅数据（可选）
  await this.cleanupExpiredSubscriptions(30);
}

// 过期后的处理
async handleSubscriptionExpired(subscription: Subscription) {
  // 1. 更新状态
  await this.updateStatus(subscription.id, SubscriptionStatus.EXPIRED);

  // 2. 降级用户权限
  await this.downgradeToFree(subscription.userId);

  // 3. 记录事件
  await this.logSubscriptionEvent({
    type: 'EXPIRED',
    subscriptionId: subscription.id,
    userId: subscription.userId,
    previousPlan: subscription.planType,
  });

  // 4. 发送挽回邮件
  await this.sendWinbackEmail(subscription.userId, {
    offer: '返回订阅享 20% 折扣',
    validDays: 7,
  });
}
```

### 4.4 续订激励策略

```typescript
// 续订用户的激励
const renewalIncentives = {
  // 连续订阅奖励
  streakRewards: [
    { months: 3, reward: { type: 'EXTRA_DAYS', value: 7 } },      // 3个月送7天
    { months: 6, reward: { type: 'EXTRA_DAYS', value: 14 } },     // 6个月送14天
    { months: 12, reward: { type: 'DISCOUNT', value: 10 } },      // 年度用户10%折扣
  ],

  // 年付转化激励
  yearlyUpgrade: {
    discountPercent: 48,  // 年付比月付节省48%
    bonusDays: 7,         // 额外赠送7天
  },
};
```

---

## 5. 客服取消与退款

### 5.1 取消订阅的类型

```typescript
enum CancellationType {
  // 用户自助取消
  USER_CANCELLED_RENEWAL = 'USER_CANCELLED_RENEWAL', // 取消自动续订
  USER_CANCELLED_TRIAL = 'USER_CANCELLED_TRIAL',     // 取消试用

  // 客服介入
  CS_CANCELLED_REQUEST = 'CS_CANCELLED_REQUEST',     // 用户请求客服取消
  CS_CANCELLED_ISSUE = 'CS_CANCELLED_ISSUE',         // 问题导致取消

  // 系统取消
  SYSTEM_PAYMENT_FAILED = 'SYSTEM_PAYMENT_FAILED',   // 支付失败取消
  SYSTEM_FRAUD = 'SYSTEM_FRAUD',                     // 欺诈检测取消
}
```

### 5.2 客服取消流程

```
用户联系客服请求取消
        │
        ▼
┌───────────────────┐
│  客服验证身份     │
│  (邮箱/订单号)    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  了解取消原因     │
│  尝试挽留         │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐ ┌─────────────────┐
│ 挽留成功 │ │  确认取消       │
│ 结束    │ └────────┬────────┘
└─────────┘          │
                     ▼
          ┌───────────────────┐
          │  判断取消类型     │
          └─────────┬─────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌───────────┐
│立即取消  │  │到期取消    │  │ 退款取消   │
│(问题用户)│  │(正常取消)  │  │(满足条件)  │
└────┬────┘  └─────┬─────┘  └─────┬─────┘
     │             │              │
     ▼             ▼              ▼
┌─────────┐  ┌───────────┐  ┌───────────┐
│更新状态  │  │设置auto    │  │ 发起退款   │
│CANCELLED│  │renewal=off │  │ 请求      │
└────┬────┘  └─────┬─────┘  └─────┬─────┘
     │             │              │
     └─────────────┴──────────────┘
                   │
                   ▼
          ┌───────────────────┐
          │  发送确认邮件     │
          │  记录工单         │
          └───────────────────┘
```

### 5.3 退款政策

```typescript
interface RefundPolicy {
  // Apple 主导的退款（我们被通知）
  appleRefund: {
    process: 'Apple 直接处理，我们收到 Webhook 通知',
    action: '立即撤销订阅权限',
    appeal: '可通过 App Store Connect 申诉',
  };

  // 我们主导的退款（代客户申请）
  proactiveRefund: {
    eligibility: {
      withinDays: 14,             // 购买后14天内
      usageLimit: '使用AI功能<20次', // 使用量限制
      maxRefundsPerUser: 1,        // 每用户最多1次
    },
    process: [
      '1. 客服验证退款资格',
      '2. 通过 App Store Connect API 发起退款',
      '3. 等待 Apple 处理',
      '4. 收到 Webhook 确认',
      '5. 更新用户状态',
    ],
  };

  // 特殊情况处理
  specialCases: {
    technicalIssue: '如因我方技术问题导致，全额退款',
    duplicateCharge: '重复扣款，全额退款',
    unauthorizedPurchase: '未授权购买，全额退款',
    partialPeriod: '使用不足半周期，按比例退款',
  };
}
```

### 5.4 退款处理服务

```typescript
@Injectable()
export class RefundService {
  async processRefundRequest(
    userId: string,
    request: RefundRequest,
    adminId: string,
  ): Promise<RefundResult> {
    // 1. 验证退款资格
    const eligibility = await this.checkRefundEligibility(userId, request);
    if (!eligibility.eligible) {
      return { success: false, reason: eligibility.reason };
    }

    // 2. 记录退款请求
    const refundRecord = await this.createRefundRecord({
      userId,
      subscriptionId: request.subscriptionId,
      reason: request.reason,
      adminId,
      status: 'PENDING',
    });

    // 3. 发起 Apple 退款（如果适用）
    if (request.initiateAppleRefund) {
      const appleResult = await this.appleService.requestRefund(
        request.originalTransactionId,
      );
      if (!appleResult.success) {
        return { success: false, reason: 'APPLE_REFUND_FAILED' };
      }
    }

    // 4. 更新订阅状态
    await this.subscriptionService.updateStatus(
      request.subscriptionId,
      SubscriptionStatus.REFUNDED,
    );

    // 5. 降级用户权限
    await this.permissionService.downgradeToFree(userId);

    // 6. 发送确认
    await this.notificationService.sendRefundConfirmation(userId);

    return { success: true, refundId: refundRecord.id };
  }

  private async checkRefundEligibility(userId: string, request: RefundRequest) {
    const subscription = await this.subscriptionService.findByUser(userId);

    // 检查时间限制
    const purchaseDate = new Date(subscription.startedAt);
    const daysSincePurchase = differenceInDays(new Date(), purchaseDate);
    if (daysSincePurchase > 14) {
      return { eligible: false, reason: 'OUTSIDE_REFUND_WINDOW' };
    }

    // 检查使用量
    const usage = await this.usageService.getUserUsage(userId);
    if (usage.aiCalls > 20) {
      return { eligible: false, reason: 'EXCESSIVE_USAGE' };
    }

    // 检查历史退款
    const previousRefunds = await this.getRefundHistory(userId);
    if (previousRefunds.length > 0) {
      return { eligible: false, reason: 'PREVIOUS_REFUND_EXISTS' };
    }

    return { eligible: true };
  }
}
```

### 5.5 取消原因追踪

```typescript
enum CancellationReason {
  // 价格相关
  TOO_EXPENSIVE = 'TOO_EXPENSIVE',
  NOT_WORTH_THE_PRICE = 'NOT_WORTH_THE_PRICE',

  // 功能相关
  MISSING_FEATURES = 'MISSING_FEATURES',
  NOT_WHAT_I_EXPECTED = 'NOT_WHAT_I_EXPECTED',
  FOUND_BETTER_ALTERNATIVE = 'FOUND_BETTER_ALTERNATIVE',

  // 使用相关
  NOT_USING_ENOUGH = 'NOT_USING_ENOUGH',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',

  // 其他
  TEMPORARY_PAUSE = 'TEMPORARY_PAUSE',
  ACCOUNT_ISSUE = 'ACCOUNT_ISSUE',
  OTHER = 'OTHER',
}

// 取消时收集反馈
interface CancellationSurvey {
  primaryReason: CancellationReason;
  additionalFeedback?: string;
  wouldResubscribeIf?: string;
  satisfactionScore?: 1 | 2 | 3 | 4 | 5;
}
```

---

## 6. 全栈权限控制架构

### 6.1 权限检查架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  UI 层：根据权限显示/隐藏功能入口，显示升级提示                     │   │
│  │  SubscriptionManager: 本地缓存订阅状态，定时同步                    │   │
│  │  FeatureGate: 功能访问前的本地检查                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────┬────────────────────────────────┘
                                         │
                                         │ API Request + JWT
                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API 网关层                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  AuthGuard: 验证 JWT，提取用户身份                                  │   │
│  │  SubscriptionGuard: 检查订阅状态和层级                              │   │
│  │  RateLimitGuard: 根据层级应用不同限流策略                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────┬────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              业务服务层                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  FeatureGateService: 细粒度功能权限判断                             │   │
│  │  UsageLimitService: 使用量检查和计数                                │   │
│  │  SubscriptionService: 订阅状态管理                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────┬────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              数据层                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  User: 用户基本信息                                                 │   │
│  │  Subscription: 订阅信息                                            │   │
│  │  UsageRecord: 使用量记录                                           │   │
│  │  FeatureConfig: 功能配置（可动态调整）                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 功能权限矩阵

```typescript
// 功能定义
enum Feature {
  // 书籍访问
  BOOK_ACCESS_FREE = 'BOOK_ACCESS_FREE',       // 免费书籍
  BOOK_ACCESS_PREMIUM = 'BOOK_ACCESS_PREMIUM', // 付费书籍

  // AI 功能
  AI_WORD_EXPLAIN = 'AI_WORD_EXPLAIN',         // 单词解释
  AI_SENTENCE_EXPLAIN = 'AI_SENTENCE_EXPLAIN', // 句子解释
  AI_SUMMARY = 'AI_SUMMARY',                   // 内容总结
  AI_ADVANCED = 'AI_ADVANCED',                 // 高级 AI（GPT-4 级别）

  // 语音功能
  VOICE_CHAT = 'VOICE_CHAT',                   // 语音聊天
  VIDEO_CHAT = 'VIDEO_CHAT',                   // 视频聊天

  // 词汇功能
  VOCABULARY_SAVE = 'VOCABULARY_SAVE',         // 保存词汇
  VOCABULARY_EXPORT = 'VOCABULARY_EXPORT',     // 导出词汇
  SPACED_REPETITION = 'SPACED_REPETITION',     // 间隔重复

  // 阅读功能
  OFFLINE_READING = 'OFFLINE_READING',         // 离线阅读
  READING_STATS = 'READING_STATS',             // 阅读统计
  READING_GOALS = 'READING_GOALS',             // 阅读目标

  // 社交功能
  POSTCARD_BASIC = 'POSTCARD_BASIC',           // 基础明信片
  POSTCARD_PREMIUM = 'POSTCARD_PREMIUM',       // 高级明信片模板
  AGORA_COMMENT = 'AGORA_COMMENT',             // 广场评论
}

// 权限配置
const featurePermissions: Record<Feature, FeatureConfig> = {
  [Feature.BOOK_ACCESS_FREE]: {
    free: { allowed: true },
    pro: { allowed: true },
    premium: { allowed: true },
  },

  [Feature.BOOK_ACCESS_PREMIUM]: {
    free: { allowed: true, limit: 10 },         // 免费用户可看10本
    pro: { allowed: true },
    premium: { allowed: true },
  },

  [Feature.AI_WORD_EXPLAIN]: {
    free: { allowed: true, dailyLimit: 5 },
    pro: { allowed: true },
    premium: { allowed: true },
  },

  [Feature.AI_ADVANCED]: {
    free: { allowed: false },
    pro: { allowed: false },
    premium: { allowed: true },
  },

  [Feature.VOICE_CHAT]: {
    free: { allowed: false },
    pro: { allowed: true, monthlyLimit: 30 },   // 30分钟/月
    premium: { allowed: true },
  },

  [Feature.VIDEO_CHAT]: {
    free: { allowed: false },
    pro: { allowed: false },
    premium: { allowed: true },
  },

  [Feature.VOCABULARY_SAVE]: {
    free: { allowed: true, limit: 50 },
    pro: { allowed: true },
    premium: { allowed: true },
  },

  [Feature.OFFLINE_READING]: {
    free: { allowed: false },
    pro: { allowed: true, limit: 10 },
    premium: { allowed: true },
  },

  // ... 其他功能配置
};
```

### 6.3 后端 Guard 实现

```typescript
// 订阅层级 Guard
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<PlanType[]>(
      'requiredTier',
      context.getHandler(),
    );

    if (!requiredTier) {
      return true; // 无订阅要求
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const subscription = await this.subscriptionService.getStatus(userId);

    // 检查状态是否有效
    if (!this.isValidStatus(subscription.status)) {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_INACTIVE',
        message: '您的订阅已失效',
        upgradeUrl: '/subscription',
      });
    }

    // 检查层级是否满足
    if (!this.tierSatisfied(subscription.planType, requiredTier)) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_TIER',
        message: `此功能需要 ${requiredTier.join('/')} 订阅`,
        currentTier: subscription.planType,
        requiredTier,
        upgradeUrl: '/subscription',
      });
    }

    return true;
  }

  private isValidStatus(status: SubscriptionStatus): boolean {
    return [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIAL,
      SubscriptionStatus.GRACE_PERIOD,
      SubscriptionStatus.PROMO,
    ].includes(status);
  }

  private tierSatisfied(current: PlanType, required: PlanType[]): boolean {
    const tierHierarchy = [PlanType.FREE, PlanType.PRO, PlanType.PREMIUM];
    const currentIndex = tierHierarchy.indexOf(current);
    return required.some(r => tierHierarchy.indexOf(r) <= currentIndex);
  }
}

// 使用量限制 Guard
@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usageLimitService: UsageLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<Feature>('feature', context.getHandler());

    if (!feature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const canUse = await this.usageLimitService.checkAndIncrement(userId, feature);

    if (!canUse.allowed) {
      throw new ForbiddenException({
        code: 'USAGE_LIMIT_EXCEEDED',
        message: canUse.message,
        feature,
        limit: canUse.limit,
        used: canUse.used,
        resetAt: canUse.resetAt,
        upgradeUrl: '/subscription',
      });
    }

    return true;
  }
}

// 装饰器
export const RequireTier = (...tiers: PlanType[]) =>
  SetMetadata('requiredTier', tiers);

export const TrackUsage = (feature: Feature) =>
  SetMetadata('feature', feature);

// 使用示例
@Controller('ai')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard, UsageLimitGuard)
export class AIController {

  @Post('explain/word')
  @TrackUsage(Feature.AI_WORD_EXPLAIN)
  async explainWord(@Body() dto: ExplainWordDto) {
    // 所有用户可用，但有每日限制
  }

  @Post('explain/advanced')
  @RequireTier(PlanType.PREMIUM)
  async advancedExplain(@Body() dto: AdvancedExplainDto) {
    // 仅 Premium 用户
  }

  @Post('voice-chat')
  @RequireTier(PlanType.PRO, PlanType.PREMIUM)
  @TrackUsage(Feature.VOICE_CHAT)
  async voiceChat(@Body() dto: VoiceChatDto) {
    // Pro+ 用户，有月度限制
  }
}
```

### 6.4 iOS 客户端权限检查

```swift
// SubscriptionManager.swift
@MainActor
class SubscriptionManager: ObservableObject {
    static let shared = SubscriptionManager()

    @Published private(set) var status: SubscriptionStatus = .free
    @Published private(set) var planType: PlanType = .free
    @Published private(set) var expiresAt: Date?
    @Published private(set) var isTrialing: Bool = false
    @Published private(set) var trialEndsAt: Date?

    // 使用量追踪
    @Published private(set) var aiCallsToday: Int = 0
    @Published private(set) var vocabularyCount: Int = 0
    @Published private(set) var offlineBookCount: Int = 0
    @Published private(set) var voiceChatMinutesThisMonth: Int = 0

    // 功能检查
    func canAccess(_ feature: Feature) -> FeatureAccessResult {
        switch feature {
        case .aiExplanation:
            return checkAIAccess()
        case .vocabularySaving:
            return checkVocabularyAccess()
        case .offlineReading:
            return checkOfflineAccess()
        case .voiceChat:
            return checkVoiceChatAccess()
        case .videoChat:
            return planType == .premium ? .allowed : .restricted(
                reason: .tierRequired(.premium),
                upgradeMessage: "升级到 Premium 解锁视频对话"
            )
        default:
            return .allowed
        }
    }

    private func checkAIAccess() -> FeatureAccessResult {
        guard planType == .free else { return .allowed }

        let remaining = max(0, FeatureLimits.freeAICallsPerDay - aiCallsToday)
        if remaining > 0 {
            return .allowedWithLimit(remaining: remaining, limit: FeatureLimits.freeAICallsPerDay)
        } else {
            return .restricted(
                reason: .dailyLimitReached,
                upgradeMessage: "今日 AI 解释次数已用完，升级 Pro 享受无限次数"
            )
        }
    }

    // 同步订阅状态
    func syncWithServer() async throws {
        let response = try await APIClient.shared.getSubscriptionStatus()

        await MainActor.run {
            self.status = response.status
            self.planType = response.planType
            self.expiresAt = response.expiresAt
            self.isTrialing = response.isTrialing
            self.trialEndsAt = response.trialEndsAt

            // 同步使用量
            self.aiCallsToday = response.usage.aiCallsToday
            self.vocabularyCount = response.usage.vocabularyCount
            self.offlineBookCount = response.usage.offlineBookCount
            self.voiceChatMinutesThisMonth = response.usage.voiceChatMinutesThisMonth
        }
    }
}

// FeatureGate 视图修饰器
struct FeatureGate: ViewModifier {
    let feature: Feature
    @ObservedObject var subscription = SubscriptionManager.shared
    @State private var showUpgradeSheet = false

    func body(content: Content) -> some View {
        let access = subscription.canAccess(feature)

        Group {
            switch access {
            case .allowed:
                content

            case .allowedWithLimit(let remaining, let limit):
                content
                    .overlay(alignment: .topTrailing) {
                        UsageBadge(remaining: remaining, limit: limit)
                    }

            case .restricted(_, _, let message):
                content
                    .disabled(true)
                    .opacity(0.5)
                    .overlay {
                        LockedOverlay(message: message) {
                            showUpgradeSheet = true
                        }
                    }
            }
        }
        .sheet(isPresented: $showUpgradeSheet) {
            PaywallView(feature: feature)
        }
    }
}

// 使用示例
struct AIExplainButton: View {
    var body: some View {
        Button("AI 解释") {
            // action
        }
        .modifier(FeatureGate(feature: .aiExplanation))
    }
}
```

### 6.5 Dashboard 权限管理

```typescript
// Dashboard 中手动调整用户订阅（客服使用）
// apps/dashboard/src/pages/users/[id]/subscription.tsx

const SubscriptionManagement: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: subscription, refetch } = useGetOne('subscriptions', { id: userId });
  const [update] = useUpdate();

  // 手动延长订阅
  const handleExtend = async (days: number, reason: string) => {
    await update('subscriptions', {
      id: userId,
      data: {
        action: 'EXTEND',
        days,
        reason,
      },
    });
    refetch();
  };

  // 手动升级/降级
  const handleChangeTier = async (newTier: PlanType, reason: string) => {
    await update('subscriptions', {
      id: userId,
      data: {
        action: 'CHANGE_TIER',
        newTier,
        reason,
      },
    });
    refetch();
  };

  // 手动授予订阅（免费赠送）
  const handleGrant = async (tier: PlanType, days: number, reason: string) => {
    await update('subscriptions', {
      id: userId,
      data: {
        action: 'GRANT',
        tier,
        days,
        reason,
      },
    });
    refetch();
  };

  // 撤销订阅
  const handleRevoke = async (reason: string) => {
    await update('subscriptions', {
      id: userId,
      data: {
        action: 'REVOKE',
        reason,
      },
    });
    refetch();
  };

  return (
    <Card>
      <CardHeader title="订阅管理" />
      <CardContent>
        {/* 当前状态 */}
        <SubscriptionStatusDisplay subscription={subscription} />

        {/* 管理操作 */}
        <Box mt={2}>
          <ExtendSubscriptionDialog onConfirm={handleExtend} />
          <ChangeTierDialog onConfirm={handleChangeTier} />
          <GrantSubscriptionDialog onConfirm={handleGrant} />
          <RevokeSubscriptionDialog onConfirm={handleRevoke} />
        </Box>

        {/* 操作历史 */}
        <SubscriptionHistory userId={userId} />
      </CardContent>
    </Card>
  );
};
```

### 6.6 权限变更事件追踪

```typescript
// 所有权限相关变更都需要记录
interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  userId: string;

  eventType: SubscriptionEventType;
  previousState: {
    planType: PlanType;
    status: SubscriptionStatus;
    expiresAt: Date;
  };
  newState: {
    planType: PlanType;
    status: SubscriptionStatus;
    expiresAt: Date;
  };

  // 变更来源
  source: 'APPLE_WEBHOOK' | 'USER_ACTION' | 'ADMIN_ACTION' | 'SYSTEM';
  sourceDetails?: {
    appleNotificationType?: string;
    adminId?: string;
    reason?: string;
  };

  createdAt: Date;
}

enum SubscriptionEventType {
  CREATED = 'CREATED',
  UPGRADED = 'UPGRADED',
  DOWNGRADED = 'DOWNGRADED',
  RENEWED = 'RENEWED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
  REVOKED = 'REVOKED',
  EXTENDED = 'EXTENDED',
  GRANTED = 'GRANTED',
  TRIAL_STARTED = 'TRIAL_STARTED',
  TRIAL_CONVERTED = 'TRIAL_CONVERTED',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  GRACE_PERIOD_STARTED = 'GRACE_PERIOD_STARTED',
  GRACE_PERIOD_ENDED = 'GRACE_PERIOD_ENDED',
}
```

---

## 7. 数据模型设计

### 7.1 完整 Subscription 模型

```prisma
// packages/database/prisma/schema.prisma

model Subscription {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 订阅核心信息
  planType PlanType           @default(FREE)
  status   SubscriptionStatus @default(NONE)
  source   SubscriptionSource @default(NONE)

  // 时间信息
  startedAt   DateTime?
  expiresAt   DateTime?
  cancelledAt DateTime?

  // 试用信息
  trialStartedAt DateTime?
  trialEndsAt    DateTime?
  trialUsed      Boolean @default(false)

  // Apple IAP 信息
  appleOriginalTransactionId String?
  appleProductId             String?
  appleEnvironment           AppleEnvironment?
  appleAutoRenewStatus       Boolean?
  appleAutoRenewProductId    String?

  // 宽限期信息
  gracePeriodStartedAt DateTime?
  gracePeriodEndsAt    DateTime?

  // 取消信息
  cancellationReason   CancellationReason?
  cancellationFeedback String?

  // 促销/手动授权信息
  grantedBy      String?   // Admin user ID
  grantReason    String?
  grantExpiresAt DateTime?

  // 元数据
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联
  events SubscriptionEvent[]

  @@index([status])
  @@index([expiresAt])
  @@index([appleOriginalTransactionId])
}

model SubscriptionEvent {
  id             String @id @default(uuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])

  eventType      SubscriptionEventType
  previousPlan   PlanType?
  previousStatus SubscriptionStatus?
  newPlan        PlanType?
  newStatus      SubscriptionStatus?

  source         EventSource
  sourceId       String?    // Apple notification ID / Admin ID
  sourceDetails  Json?

  createdAt      DateTime @default(now())

  @@index([subscriptionId])
  @@index([createdAt])
}

model UsageRecord {
  id        String @id @default(uuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  feature   String
  count     Int    @default(0)

  // 重置周期
  periodType PeriodType  // DAILY, MONTHLY, TOTAL
  periodKey  String      // e.g., "2024-12-15" for daily, "2024-12" for monthly

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, feature, periodType, periodKey])
  @@index([userId])
}

model TrialRecord {
  id        String @id @default(uuid())
  userId    String
  deviceId  String

  startedAt    DateTime
  endsAt       DateTime
  convertedAt  DateTime?
  cancelledAt  DateTime?

  productId    String

  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([deviceId])
}

// 枚举
enum PlanType {
  FREE
  PRO
  PREMIUM
}

enum SubscriptionStatus {
  NONE
  TRIAL
  TRIAL_EXPIRED
  ACTIVE
  GRACE_PERIOD
  BILLING_RETRY
  EXPIRED
  CANCELLED
  REFUNDED
  REVOKED
  PAUSED
  PROMO
}

enum SubscriptionSource {
  NONE
  APPLE_IAP
  GOOGLE_PLAY
  STRIPE
  PROMO_CODE
  ADMIN_GRANT
}

enum AppleEnvironment {
  SANDBOX
  PRODUCTION
}

enum CancellationReason {
  TOO_EXPENSIVE
  NOT_WORTH_THE_PRICE
  MISSING_FEATURES
  NOT_WHAT_I_EXPECTED
  FOUND_BETTER_ALTERNATIVE
  NOT_USING_ENOUGH
  TECHNICAL_ISSUES
  TEMPORARY_PAUSE
  ACCOUNT_ISSUE
  OTHER
}

enum SubscriptionEventType {
  CREATED
  UPGRADED
  DOWNGRADED
  RENEWED
  CANCELLED
  EXPIRED
  REFUNDED
  REVOKED
  EXTENDED
  GRANTED
  TRIAL_STARTED
  TRIAL_CONVERTED
  TRIAL_EXPIRED
  GRACE_PERIOD_STARTED
  GRACE_PERIOD_ENDED
}

enum EventSource {
  APPLE_WEBHOOK
  GOOGLE_WEBHOOK
  STRIPE_WEBHOOK
  USER_ACTION
  ADMIN_ACTION
  SYSTEM
}

enum PeriodType {
  DAILY
  MONTHLY
  TOTAL
}
```

### 7.2 使用量追踪设计

```typescript
// UsageLimitService
@Injectable()
export class UsageLimitService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async checkAndIncrement(
    userId: string,
    feature: Feature,
  ): Promise<UsageCheckResult> {
    const subscription = await this.subscriptionService.getStatus(userId);
    const config = featurePermissions[feature][subscription.planType];

    // 无限制
    if (!config.dailyLimit && !config.monthlyLimit && !config.limit) {
      return { allowed: true };
    }

    // 确定周期
    const periodType = config.dailyLimit ? 'DAILY' : config.monthlyLimit ? 'MONTHLY' : 'TOTAL';
    const periodKey = this.getPeriodKey(periodType);
    const limit = config.dailyLimit || config.monthlyLimit || config.limit;

    // 获取或创建使用记录
    const usage = await this.prisma.usageRecord.upsert({
      where: {
        userId_feature_periodType_periodKey: {
          userId,
          feature,
          periodType,
          periodKey,
        },
      },
      update: {},
      create: {
        userId,
        feature,
        periodType,
        periodKey,
        count: 0,
      },
    });

    // 检查限制
    if (usage.count >= limit) {
      return {
        allowed: false,
        message: this.getLimitMessage(feature, periodType),
        limit,
        used: usage.count,
        resetAt: this.getResetTime(periodType),
      };
    }

    // 增加计数
    await this.prisma.usageRecord.update({
      where: { id: usage.id },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      limit,
      used: usage.count + 1,
      remaining: limit - usage.count - 1,
    };
  }

  private getPeriodKey(periodType: PeriodType): string {
    const now = new Date();
    switch (periodType) {
      case 'DAILY':
        return format(now, 'yyyy-MM-dd');
      case 'MONTHLY':
        return format(now, 'yyyy-MM');
      case 'TOTAL':
        return 'TOTAL';
    }
  }

  private getResetTime(periodType: PeriodType): Date | null {
    const now = new Date();
    switch (periodType) {
      case 'DAILY':
        return startOfTomorrow();
      case 'MONTHLY':
        return startOfMonth(addMonths(now, 1));
      case 'TOTAL':
        return null; // 永不重置
    }
  }
}
```

---

## 8. API 设计

### 8.1 订阅 API

```typescript
// GET /api/subscriptions/status
interface SubscriptionStatusResponse {
  // 基本信息
  planType: PlanType;
  status: SubscriptionStatus;
  source: SubscriptionSource;

  // 时间
  startedAt: string | null;
  expiresAt: string | null;

  // 试用
  isTrialing: boolean;
  trialEndsAt: string | null;
  trialEligible: boolean;

  // 续订
  autoRenewEnabled: boolean;
  nextRenewalDate: string | null;

  // 宽限期
  inGracePeriod: boolean;
  gracePeriodEndsAt: string | null;

  // 功能和限制
  features: Record<Feature, boolean>;
  limits: {
    aiCallsDaily: number | null;
    vocabularyTotal: number | null;
    offlineBooks: number | null;
    voiceChatMinutesMonthly: number | null;
  };

  // 使用量
  usage: {
    aiCallsToday: number;
    vocabularyCount: number;
    offlineBookCount: number;
    voiceChatMinutesThisMonth: number;
  };
}

// POST /api/subscriptions/verify-apple
interface VerifyAppleRequest {
  transactionId: string;
  originalTransactionId: string;
}

// POST /api/subscriptions/restore
interface RestoreRequest {
  receipts: Array<{
    transactionId: string;
    originalTransactionId: string;
  }>;
}

// POST /api/subscriptions/check-trial-eligibility
interface TrialEligibilityRequest {
  productId: string;
  deviceId: string;
}

interface TrialEligibilityResponse {
  eligible: boolean;
  reason?: 'TRIAL_ALREADY_USED' | 'DEVICE_TRIAL_USED' | 'ALREADY_SUBSCRIBED' | 'PREVIOUS_SUBSCRIBER';
}

// POST /api/subscriptions/cancel
// (记录取消反馈，实际取消由 Apple 处理)
interface CancelFeedbackRequest {
  reason: CancellationReason;
  feedback?: string;
  wouldResubscribeIf?: string;
  satisfactionScore?: number;
}

// GET /api/subscriptions/history
interface SubscriptionHistoryResponse {
  events: Array<{
    eventType: SubscriptionEventType;
    previousPlan: PlanType | null;
    newPlan: PlanType | null;
    source: EventSource;
    createdAt: string;
  }>;
}
```

### 8.2 Dashboard 管理 API

```typescript
// GET /api/admin/subscriptions/:userId
// (获取用户订阅详情，包含完整历史)

// POST /api/admin/subscriptions/:userId/extend
interface AdminExtendRequest {
  days: number;
  reason: string;
}

// POST /api/admin/subscriptions/:userId/grant
interface AdminGrantRequest {
  planType: PlanType;
  durationDays: number;
  reason: string;
}

// POST /api/admin/subscriptions/:userId/revoke
interface AdminRevokeRequest {
  reason: string;
  notifyUser: boolean;
}

// POST /api/admin/subscriptions/:userId/change-tier
interface AdminChangeTierRequest {
  newPlanType: PlanType;
  reason: string;
  adjustExpiry: boolean; // 是否按比例调整到期时间
}

// GET /api/admin/subscriptions/stats
interface SubscriptionStatsResponse {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  premiumUsers: number;
  trialingUsers: number;
  churnRate: number;
  conversionRate: number;
  mrr: number; // Monthly Recurring Revenue
}
```

---

## 9. 行业最佳实践参考

### 9.1 参考的商业产品

| 产品 | 借鉴点 |
|------|--------|
| **Spotify** | 清晰的功能对比表、无缝的升级体验、家庭计划 |
| **Netflix** | 多层级定价、设备数量差异化、离线下载限制 |
| **Duolingo** | 每日限制的 Paywall 设计、连续学习激励 |
| **Notion** | 协作功能差异化、慷慨的免费层级 |
| **Headspace** | 试用期体验完整、取消前的挽留弹窗 |

### 9.2 关键最佳实践

#### 透明定价
```
✅ 清晰展示各层级差异
✅ 提前告知试用到期自动扣费
✅ 显示年付节省金额
✅ 无隐藏费用
```

#### Paywall 设计
```
✅ 在合适时机弹出（功能触发、使用达限）
✅ 强调价值而非限制
✅ 提供免费替代选项（如等待明天重置）
✅ 一键订阅流程
```

#### 取消流程
```
✅ 易于找到取消入口（Apple 规定）
✅ 展示取消后会失去什么
✅ 提供降级选项而非直接取消
✅ 收集取消反馈
✅ 发送挽回优惠
```

#### 宽限期处理
```
✅ 支付失败时保持功能可用
✅ 温和提醒更新支付方式
✅ 多次重试机会
✅ 宽限期结束前最后通知
```

### 9.3 合规要求

```typescript
// Apple App Store 要求
const appleCompliance = {
  // 必须使用 StoreKit
  useStoreKit: true,

  // 订阅信息透明
  showPriceWithTax: true,
  showRenewalTerms: true,

  // 取消途径
  provideManageSubscriptionLink: true,
  dontObstructCancellation: true,

  // 试用期
  clearTrialTerms: true,
  requirePaymentMethodForTrial: true,

  // 家庭共享
  supportFamilySharing: false, // 暂不支持
};

// GDPR / 隐私
const privacyCompliance = {
  // 订阅数据保留
  retainDataAfterCancellation: '30 days',

  // 用户请求
  allowDataExport: true,
  allowAccountDeletion: true,

  // 删除时处理
  deleteSubscriptionHistory: false, // 财务数据需保留
  anonymizeUsageData: true,
};
```

---

## 10. 实施计划

### 10.1 第一阶段：核心订阅流程 ✅ (已完成 - 2024-12)
- [x] 完善订阅状态机实现 ✅
- [x] 实现 Apple Server Notification V2 处理 ✅
- [x] 完善试用期逻辑 (TrialService) ✅
- [x] Dashboard 订阅管理基础功能 (AdminSubscriptionController) ✅

### 10.2 第二阶段：权限控制 ✅ (已完成 - 2024-12)
- [x] 实现后端 SubscriptionGuard ✅
- [x] 实现使用量追踪和限制 (UsageLimitService + UsageLimitGuard) ✅
- [x] 实现 @RequireTier() 和 @TrackUsage() 装饰器 ✅
- [x] 应用 Guards 到 AI 模块 ✅
- [x] 应用 Guards 到词汇模块 ✅
- [x] 应用 Guards 到语音聊天模块 ✅
- [x] 应用 Guards 到视频聊天模块 ✅
- [x] iOS 客户端 FeatureGate 实现 ✅
- [x] 功能 Paywall 设计 ✅

**已实现的后端权限控制:**
```
apps/backend/src/common/guards/
├── subscription.types.ts    # PlanType, Feature, FEATURE_PERMISSIONS
├── subscription.guard.ts    # SubscriptionGuard
├── usage-limit.guard.ts     # UsageLimitGuard
├── usage-limit.service.ts   # Redis-based usage tracking
├── guards.module.ts         # Global GuardsModule
└── index.ts

apps/backend/src/common/decorators/
├── subscription.decorator.ts  # @RequireTier(), @TrackUsage()
└── index.ts
```

### 10.3 第三阶段：客服支持
- [ ] Dashboard 订阅管理高级功能
- [ ] 退款处理流程
- [ ] 订阅事件历史查看
- [ ] 客服工单与订阅关联

### 10.4 第四阶段：运营优化
- [ ] 订阅分析报表
- [ ] 促销码系统
- [ ] A/B 测试 Paywall
- [ ] 自动挽回策略

---

## 附录 A：错误码定义

```typescript
enum SubscriptionErrorCode {
  // 订阅验证
  INVALID_RECEIPT = 'SUBSCRIPTION_001',
  RECEIPT_EXPIRED = 'SUBSCRIPTION_002',
  VERIFICATION_FAILED = 'SUBSCRIPTION_003',

  // 权限
  TIER_INSUFFICIENT = 'PERMISSION_001',
  SUBSCRIPTION_INACTIVE = 'PERMISSION_002',
  USAGE_LIMIT_EXCEEDED = 'PERMISSION_003',
  FEATURE_NOT_AVAILABLE = 'PERMISSION_004',

  // 试用
  TRIAL_NOT_ELIGIBLE = 'TRIAL_001',
  TRIAL_ALREADY_USED = 'TRIAL_002',
  DEVICE_TRIAL_USED = 'TRIAL_003',

  // 退款
  REFUND_NOT_ELIGIBLE = 'REFUND_001',
  REFUND_WINDOW_EXPIRED = 'REFUND_002',
  EXCESSIVE_USAGE = 'REFUND_003',

  // 管理
  ADMIN_ACTION_FAILED = 'ADMIN_001',
  INVALID_GRANT_PARAMS = 'ADMIN_002',
}
```

---

## 附录 B：监控指标

```typescript
// 关键业务指标
const subscriptionMetrics = {
  // 转化
  freeToTrialConversion: 'free_to_trial_rate',
  trialToPayingConversion: 'trial_to_paying_rate',
  monthlyToYearlyUpgrade: 'monthly_to_yearly_rate',

  // 留存
  subscriptionRetention: 'subscription_retention_rate',
  churnRate: 'churn_rate',
  reactivationRate: 'reactivation_rate',

  // 收入
  mrr: 'monthly_recurring_revenue',
  arr: 'annual_recurring_revenue',
  arpu: 'average_revenue_per_user',
  ltv: 'customer_lifetime_value',

  // 运营
  gracePeriodRecoveryRate: 'grace_period_recovery_rate',
  refundRate: 'refund_rate',
  supportTicketRate: 'support_ticket_rate',
};
```

---

*文档结束 - 请 Review 后反馈修改意见*
