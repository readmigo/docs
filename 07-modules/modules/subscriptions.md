# Subscriptions 模块

> 订阅支付系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 付费墙 | 订阅计划展示与购买入口 | P0 |
| 应用内购买 | 订阅购买流程 | P0 |
| 订阅管理 | 查看/取消/恢复订阅 | P0 |
| 收据验证 | 服务端验证购买 | P0 |
| 权益管理 | Premium 功能控制 | P0 |
| 促销码 | 优惠码支持 | P1 |
| 账单历史 | 发票和支付记录 | P2 |

### 1.2 订阅方案

| 方案 | 产品 ID | 价格 | 功能 |
|------|---------|------|------|
| 月度订阅 | `com.readmigo.premium.monthly` | $9.99/月 | 全部高级功能 |
| 年度订阅 | `com.readmigo.premium.yearly` | $79.99/年 | 全部高级功能 + 2个月免费 |
| 终身会员 | `com.readmigo.premium.lifetime` | $199.99 | 永久解锁 |

### 1.3 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 支付系统 | Google Play Billing 6.x | RevenueCat | Stripe |
| 收据验证 | Google Play API | RevenueCat 服务端 | Stripe Webhooks |
| 状态管理 | StateFlow | Zustand | Zustand |
| 订阅管理 | Google Play 页面 | App Store/Play 设置 | Stripe Portal |

---

## 2. 数据模型

### SubscriptionPlan

| Field | Type | Description |
|-------|------|-------------|
| id | string | Plan UUID |
| productId | string | Store product identifier |
| name / description | string | Display info |
| features | string[] | Feature list |
| price / priceValue / currency | string/number | Pricing info |
| period | enum | monthly / yearly / lifetime |
| hasTrial | boolean | Trial availability |
| trialDuration | string (optional) | Trial length |
| savingsPercentage | number (optional) | Savings vs monthly |

### SubscriptionStatus

| Field | Type | Description |
|-------|------|-------------|
| isActive / isPremium | boolean | Active state |
| plan | SubscriptionPlan or null | Current plan |
| expiresAt / purchasedAt | Date or null | Key dates |
| willRenew / isInTrial / isInGracePeriod / isCancelled | boolean | State flags |
| entitlements | Entitlement[] | Active entitlements |

### EntitlementType

premium, unlimited_ai, offline_access, audiobooks, ad_free

### PurchaseResult

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Purchase outcome |
| productId / transactionId | string (optional) | Purchase details |
| error.code | enum (optional) | cancelled, payment_failed, product_unavailable, network_error, unknown |

### UsageLimits (免费用户)

| Limit | Description |
|-------|-------------|
| aiQueriesDaily / aiQueriesRemaining | Daily AI query quota |
| booksDownloaded / maxDownloads | Download quota |
| vocabularyWords / maxVocabulary | Vocabulary quota |

---

## 3. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/subscriptions/verify` | POST | 验证购买收据 |
| `/subscriptions/status` | GET | 获取订阅状态 |
| `/subscriptions/webhook` | POST | 处理支付平台回调 |
| `/subscriptions/portal` | POST | 创建管理入口 (Web) |

---

## 4. Android 实现

### 4.1 Billing Client 封装

Uses Google Play Billing Library 6.x. BillingClientWrapper manages connection, product queries, and purchase flow. Exposes products via StateFlow and purchaseResult via SharedFlow. Supports pending purchases.

### 4.2 订阅管理器

SubscriptionManager wraps BillingClientWrapper and ReceiptValidator. Exposes subscription state via StateFlow with isPremium convenience property and isFeatureAvailable check.

**Premium Features**: UNLIMITED_AI_EXPLANATIONS, ADVANCED_VOCABULARY, OFFLINE_READING, AUDIOBOOK_ACCESS, AD_FREE

---

## 5. React Native 实现

### 5.1 RevenueCat 服务

Uses RevenueCat SDK (react-native-purchases). Key functions:
- **initializePurchases**: Configure with platform-specific API key, log in user
- **getSubscriptionPlans**: Fetch current offerings and map to SubscriptionPlan
- **purchaseSubscription**: Find package by productId and execute purchase
- **restorePurchases**: Restore previous purchases

### 5.2 Zustand Store

Persisted store with immer middleware. State: status, plans, usageLimits, purchaseInProgress. Free tier defaults: 10 AI queries/day, 3 book downloads, 100 vocabulary words. Computed: hasEntitlement, canUseAI.

---

## 6. Web 实现

### 6.1 Stripe 配置

Server-side Stripe SDK for payment processing. Client-side loadStripe for checkout UI.

### 6.2 Server Actions

- **createCheckoutSession**: Creates Stripe checkout session with subscription mode. Supports card, Alipay, WeChat Pay. Allows promotion codes.
- **createPortalSession**: Creates Stripe billing portal for subscription management.

### 6.3 Webhook 处理

Handles Stripe webhook events:

| Event | Handler |
|-------|---------|
| checkout.session.completed | Activate subscription |
| customer.subscription.updated | Update subscription status |
| customer.subscription.deleted | Deactivate subscription |

---

## 7. Premium 功能列表

| ID | Name | Description |
|----|------|-------------|
| unlimited_ai | 无限 AI 查询 | 随时随地获取智能解答 |
| advanced_vocabulary | 高级词汇功能 | 词根词源、例句生成 |
| offline_reading | 离线阅读 | 下载书籍随时阅读 |
| audiobooks | 有声书 | 沉浸式听读体验 |
| ad_free | 无广告 | 纯净阅读体验 |

---

*最后更新: 2025-12-28*
