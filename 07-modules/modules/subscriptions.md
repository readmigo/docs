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

```typescript
// 订阅计划
interface SubscriptionPlan {
  id: string;
  productId: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  priceValue: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  hasTrial: boolean;
  trialDuration?: string;
  savingsPercentage?: number;
}

// 订阅状态
interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: Date | null;
  purchasedAt: Date | null;
  willRenew: boolean;
  isInTrial: boolean;
  isInGracePeriod: boolean;
  isCancelled: boolean;
  entitlements: Entitlement[];
}

// 权益
interface Entitlement {
  id: string;
  name: string;
  isActive: boolean;
}

type EntitlementType =
  | 'premium'
  | 'unlimited_ai'
  | 'offline_access'
  | 'audiobooks'
  | 'ad_free';

// 购买结果
interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: {
    code: 'cancelled' | 'payment_failed' | 'product_unavailable' | 'network_error' | 'unknown';
    message: string;
  };
}

// 免费用户限制
interface UsageLimits {
  aiQueriesDaily: number;
  aiQueriesRemaining: number;
  booksDownloaded: number;
  maxDownloads: number;
  vocabularyWords: number;
  maxVocabulary: number;
}
```

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

```kotlin
@Singleton
class BillingClientWrapper @Inject constructor(
    private val context: Context
) {
    private var billingClient: BillingClient? = null
    private val _products = MutableStateFlow<List<ProductDetails>>(emptyList())
    val products: StateFlow<List<ProductDetails>> = _products.asStateFlow()

    private val _purchaseResult = MutableSharedFlow<PurchaseResult>()
    val purchaseResult: SharedFlow<PurchaseResult> = _purchaseResult.asSharedFlow()

    fun initialize() {
        billingClient = BillingClient.newBuilder(context)
            .setListener { billingResult, purchases ->
                handlePurchasesUpdated(billingResult, purchases)
            }
            .enablePendingPurchases()
            .build()
        connect()
    }

    suspend fun launchPurchaseFlow(activity: Activity, productDetails: ProductDetails): BillingResult {
        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(
                listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .setOfferToken(productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken ?: "")
                        .build()
                )
            )
            .build()
        return billingClient?.launchBillingFlow(activity, flowParams)
            ?: BillingResult.newBuilder().setResponseCode(BillingClient.BillingResponseCode.SERVICE_DISCONNECTED).build()
    }

    fun queryPurchases() { /* 查询已有购买 */ }
}
```

### 4.2 订阅管理器

```kotlin
@Singleton
class SubscriptionManager @Inject constructor(
    private val billingClientWrapper: BillingClientWrapper,
    private val receiptValidator: ReceiptValidator
) {
    private val _state = MutableStateFlow(SubscriptionState())
    val state: StateFlow<SubscriptionState> = _state.asStateFlow()

    val isPremium: Boolean
        get() = _state.value.isPremium

    fun isFeatureAvailable(feature: PremiumFeature): Boolean = isPremium
}

enum class PremiumFeature {
    UNLIMITED_AI_EXPLANATIONS,
    ADVANCED_VOCABULARY,
    OFFLINE_READING,
    AUDIOBOOK_ACCESS,
    AD_FREE
}
```

---

## 5. React Native 实现

### 5.1 RevenueCat 服务

```typescript
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

export async function initializePurchases(userId?: string): Promise<void> {
  const apiKey = Platform.OS === 'ios'
    ? 'appl_xxxxxxxxxxxx'
    : 'goog_xxxxxxxxxxxx';
  await Purchases.configure({ apiKey });
  if (userId) await Purchases.logIn(userId);
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages.map(packageToSubscriptionPlan) ?? [];
}

export async function purchaseSubscription(plan: SubscriptionPlan): Promise<PurchaseResult> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      p => p.product.identifier === plan.productId
    );
    if (!pkg) return { success: false, error: { code: 'product_unavailable', message: 'Product not found' } };

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, productId: plan.productId, transactionId: customerInfo.originalAppUserId };
  } catch (error) {
    if (error.code === 'PURCHASE_CANCELLED_ERROR') {
      return { success: false, error: { code: 'cancelled', message: 'Purchase cancelled' } };
    }
    return { success: false, error: { code: 'unknown', message: error.message } };
  }
}

export async function restorePurchases(): Promise<SubscriptionStatus> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfoToSubscriptionStatus(customerInfo);
}
```

### 5.2 Zustand Store

```typescript
export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    immer((set, get) => ({
      status: null,
      plans: [],
      usageLimits: { aiQueriesDaily: 10, aiQueriesRemaining: 10, booksDownloaded: 0, maxDownloads: 3, vocabularyWords: 0, maxVocabulary: 100 },
      purchaseInProgress: false,

      hasEntitlement: (type) => get().status?.entitlements.some(e => e.id === type && e.isActive) ?? false,
      canUseAI: () => get().status?.isPremium || get().usageLimits.aiQueriesRemaining > 0,
    })),
    { name: 'subscription-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

---

## 6. Web 实现

### 6.1 Stripe 配置

```typescript
import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const getStripe = () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

### 6.2 Server Actions

```typescript
'use server';

export async function createCheckoutSession(priceId: string, promoCode?: string): Promise<{ url: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: await getOrCreateCustomer(session.user.id),
    mode: 'subscription',
    payment_method_types: ['card', 'alipay', 'wechat_pay'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
    allow_promotion_codes: true,
  });

  return { url: checkoutSession.url! };
}

export async function createPortalSession(): Promise<{ url: string } | { error: string }> {
  const customerId = await getStripeCustomerId(session.user.id);
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=subscription`,
  });
  return { url: portalSession.url };
}
```

### 6.3 Webhook 处理

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

## 7. Premium 功能列表

```typescript
const PREMIUM_FEATURES = [
  { id: 'unlimited_ai', name: '无限 AI 查询', description: '随时随地获取智能解答' },
  { id: 'advanced_vocabulary', name: '高级词汇功能', description: '词根词源、例句生成' },
  { id: 'offline_reading', name: '离线阅读', description: '下载书籍随时阅读' },
  { id: 'audiobooks', name: '有声书', description: '沉浸式听读体验' },
  { id: 'ad_free', name: '无广告', description: '纯净阅读体验' },
];
```

---

*最后更新: 2025-12-28*
