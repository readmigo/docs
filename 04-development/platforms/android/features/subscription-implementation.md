# Android 订阅系统技术实现

## 系统概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         订阅系统全链路架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                 │
│  │ Android App │◄────►│   Backend   │◄────►│  Dashboard  │                 │
│  │ Billing Lib │      │   NestJS    │      │ React Admin │                 │
│  └──────┬──────┘      └──────┬──────┘      └─────────────┘                 │
│         │                    │                                              │
│         ▼                    ▼                                              │
│  ┌─────────────┐      ┌─────────────┐                                      │
│  │ Google Play │─────►│ Google Play │                                      │
│  │   Console   │      │ Developer   │                                      │
│  │             │      │     API     │                                      │
│  └─────────────┘      └─────────────┘                                      │
│                              │                                              │
│                              ▼                                              │
│                       ┌─────────────┐                                      │
│                       │  RTDN 通知  │                                      │
│                       │ (Pub/Sub)   │                                      │
│                       └─────────────┘                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 实现状态

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         当前实现进度                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  功能模块                      状态        说明                             │
│  ─────────────────────────────────────────────────────────────────         │
│  数据模型定义                  ✅ 完成     SubscriptionInfo, SubscriptionPlan│
│  DTO 映射                      ✅ 完成     SubscriptionInfoDto              │
│  Repository 模式               ✅ 完成     ProfileRepository 订阅转换       │
│  Google Play Billing Library   ⏳ 待接入   需添加依赖                        │
│  BillingClient 初始化          ⏳ 待实现   需创建 BillingManager            │
│  产品查询                      ⏳ 待实现   queryProductDetailsAsync        │
│  购买流程                      ⏳ 待实现   launchBillingFlow               │
│  购买验证                      ⏳ 待实现   后端 token 验证                   │
│  购买确认                      ⏳ 待实现   acknowledgePurchase             │
│  恢复购买                      ⏳ 待实现   queryPurchasesAsync             │
│  功能门禁                      ⏳ 待实现   FeatureGateService              │
│  付费墙 UI                     ⏳ 待实现   PaywallScreen                    │
│  用量追踪                      ⏳ 待实现   UsageTracker                     │
│                                                                             │
│  后端支持                      ✅ 已就绪   与 iOS 共用后端接口               │
│  Dashboard 管理                ✅ 已就绪   与 iOS 共用管理界面               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 订阅产品定义

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         订阅产品配置                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Product ID                        Plan      Period    Trial               │
│  ─────────────────────────────────────────────────────────────────         │
│  com.readmigo.pro.monthly          PRO       Monthly   -                   │
│  com.readmigo.pro.yearly           PRO       Yearly    7 days              │
│  com.readmigo.premium.monthly      PREMIUM   Monthly   -                   │
│  com.readmigo.premium.yearly       PREMIUM   Yearly    7 days              │
│                                                                             │
│  订阅层级:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  FREE        免费用户 (默认)                                                │
│  PRO         专业版订阅                                                     │
│  PREMIUM     高级版订阅                                                     │
│                                                                             │
│  订阅状态 (SubscriptionStatus):                                             │
│  ─────────────────────────────────────────────────────────────────         │
│  ACTIVE          有效订阅中                                                 │
│  EXPIRED         已过期                                                     │
│  CANCELLED       已取消 (到期前仍可用)                                       │
│  GRACE_PERIOD    宽限期 (续费失败，等待重试)                                 │
│  ON_HOLD         账户暂停 (付款问题)                                        │
│  PAUSED          用户暂停订阅                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 功能权限矩阵

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         功能权限配置                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  功能                    FREE          PRO           PREMIUM                │
│  ─────────────────────────────────────────────────────────────────         │
│  AI 单词解释             5次/天        100次/天       无限制                 │
│  AI 文章总结             禁用          50次/天        无限制                 │
│  高级AI (GPT-4/Claude)   禁用          禁用           开放                  │
│  语音对话                禁用          30分钟/月       无限制                │
│  视频对话                禁用          禁用           开放                  │
│  词汇保存数量            50个          1000个         无限制                │
│  间隔重复学习            禁用          开放           开放                  │
│  离线书籍下载            0本           10本           无限制                │
│  阅读统计                禁用          开放           开放                  │
│  词汇导出                禁用          开放           开放                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第一部分: 现有实现

## 数据模型

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         现有数据模型                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  文件: features/profile/domain/models/ProfileModels.kt                      │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  data class SubscriptionInfo(                                   │        │
│  │      val plan: SubscriptionPlan,    // 订阅计划                  │        │
│  │      val expiresAt: Date?,          // 到期时间                  │        │
│  │      val isActive: Boolean          // 是否激活                  │        │
│  │  )                                                              │        │
│  │                                                                 │        │
│  │  enum class SubscriptionPlan {                                  │        │
│  │      FREE,                          // 免费                      │        │
│  │      PREMIUM,                       // 高级版                    │        │
│  │      LIFETIME                       // 终身                      │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  文件: features/profile/data/dto/ProfileDto.kt                              │
│  ─────────────────────────────────────────────────────────────────         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @JsonClass(generateAdapter = true)                             │        │
│  │  data class SubscriptionInfoDto(                                │        │
│  │      @Json(name = "plan")                                       │        │
│  │      val plan: String,                                          │        │
│  │                                                                 │        │
│  │      @Json(name = "expires_at")                                 │        │
│  │      val expiresAt: String?,                                    │        │
│  │                                                                 │        │
│  │      @Json(name = "is_active")                                  │        │
│  │      val isActive: Boolean                                      │        │
│  │  )                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Repository 层

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ProfileRepository                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  文件: features/profile/data/ProfileRepository.kt                           │
│                                                                             │
│  DTO 转换逻辑:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  private fun SubscriptionInfoDto.toDomain() = SubscriptionInfo( │        │
│  │      plan = when (plan.uppercase()) {                           │        │
│  │          "PREMIUM" -> SubscriptionPlan.PREMIUM                  │        │
│  │          "LIFETIME" -> SubscriptionPlan.LIFETIME                │        │
│  │          else -> SubscriptionPlan.FREE                          │        │
│  │      },                                                         │        │
│  │      expiresAt = expiresAt?.let { parseDate(it) },             │        │
│  │      isActive = isActive                                        │        │
│  │  )                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  当前限制:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  • getProfile() 中 subscription = null                                     │
│  • 订阅信息获取标记为 "Will be fetched separately if needed"               │
│  • 表明订阅功能待独立实现                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 用户 DTO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UserDto 订阅字段                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  文件: core/data/remote/dto/UserDto.kt                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @JsonClass(generateAdapter = true)                             │        │
│  │  data class UserDto(                                            │        │
│  │      @Json(name = "id") val id: String,                        │        │
│  │      @Json(name = "email") val email: String?,                 │        │
│  │      @Json(name = "display_name") val displayName: String?,    │        │
│  │      @Json(name = "avatar_url") val avatarUrl: String?,        │        │
│  │      @Json(name = "auth_provider") val authProvider: String,   │        │
│  │      @Json(name = "subscription_status")                        │        │
│  │          val subscriptionStatus: String,   // ← 订阅状态字段    │        │
│  │      // ... 其他字段                                             │        │
│  │  )                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  subscription_status 可能值:                                                │
│  ─────────────────────────────────────────────────────────────────         │
│  "FREE"           免费用户                                                  │
│  "ACTIVE"         活跃订阅                                                  │
│  "EXPIRED"        已过期                                                    │
│  "CANCELLED"      已取消                                                    │
│  "TRIAL"          试用期                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第二部分: Google Play Billing 集成设计

## 技术方案

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Google Play Billing Library 5.x                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  依赖配置 (libs.versions.toml):                                             │
│  ─────────────────────────────────────────────────────────────────         │
│  [versions]                                                                 │
│  billing = "6.1.0"                                                          │
│                                                                             │
│  [libraries]                                                                │
│  google-billing = { module = "com.android.billingclient:billing-ktx",      │
│                     version.ref = "billing" }                               │
│                                                                             │
│  build.gradle.kts:                                                          │
│  ─────────────────────────────────────────────────────────────────         │
│  dependencies {                                                             │
│      implementation(libs.google.billing)                                   │
│  }                                                                          │
│                                                                             │
│  核心类:                                                                     │
│  ─────────────────────────────────────────────────────────────────         │
│  BillingClient           计费客户端                                         │
│  ProductDetails          产品详情                                           │
│  Purchase                购买对象                                           │
│  BillingResult           操作结果                                           │
│  PurchasesUpdatedListener  购买更新监听                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 组件架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         客户端组件架构                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                    BillingManager                               │        │
│  │                    (单例, Hilt 注入)                             │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  StateFlow Properties:                                          │        │
│  │  • productDetails: List<ProductDetails>   可购买产品列表         │        │
│  │  • purchases: List<Purchase>              已购买列表             │        │
│  │  • subscriptionState: SubscriptionState   当前订阅状态           │        │
│  │  • isSubscribed: Boolean                  是否已订阅             │        │
│  │  • billingConnectionState: ConnectionState  连接状态            │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  Methods:                                                       │        │
│  │  • connect()                             建立连接                │        │
│  │  • queryProductDetails()                 查询产品                │        │
│  │  • launchPurchaseFlow(activity, product)  发起购买              │        │
│  │  • acknowledgePurchase(purchase)         确认购买                │        │
│  │  • queryPurchases()                      查询已购买              │        │
│  │  • refreshSubscriptionStatus()           刷新订阅状态            │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│          ┌───────────────────┼───────────────────┐                          │
│          ▼                   ▼                   ▼                          │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                 │
│  │FeatureGate   │   │ UsageTracker  │   │ ApiService    │                 │
│  │Service       │   │               │   │               │                 │
│  │功能门禁检查    │   │ 用量追踪      │   │ 后端通信      │                 │
│  └───────────────┘   └───────────────┘   └───────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## BillingClient 初始化

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BillingClient 设置                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @Singleton                                                     │        │
│  │  class BillingManager @Inject constructor(                      │        │
│  │      @ApplicationContext private val context: Context,          │        │
│  │      private val apiService: ApiService,                        │        │
│  │      private val scope: CoroutineScope                          │        │
│  │  ) : PurchasesUpdatedListener {                                 │        │
│  │                                                                 │        │
│  │      private val billingClient = BillingClient.newBuilder(context)       │
│  │          .setListener(this)                                     │        │
│  │          .enablePendingPurchases()                              │        │
│  │          .build()                                               │        │
│  │                                                                 │        │
│  │      private val _connectionState = MutableStateFlow(           │        │
│  │          ConnectionState.DISCONNECTED                           │        │
│  │      )                                                          │        │
│  │      val connectionState: StateFlow<ConnectionState> =          │        │
│  │          _connectionState.asStateFlow()                         │        │
│  │                                                                 │        │
│  │      fun connect() {                                            │        │
│  │          billingClient.startConnection(object : BillingClientStateListener {│
│  │              override fun onBillingSetupFinished(result: BillingResult) {│
│  │                  if (result.responseCode == BillingClient.BillingResponseCode.OK) {│
│  │                      _connectionState.value = ConnectionState.CONNECTED│
│  │                      queryProductDetails()                      │        │
│  │                      queryPurchases()                           │        │
│  │                  }                                              │        │
│  │              }                                                  │        │
│  │              override fun onBillingServiceDisconnected() {      │        │
│  │                  _connectionState.value = ConnectionState.DISCONNECTED│
│  │                  // 重试连接                                     │        │
│  │              }                                                  │        │
│  │          })                                                     │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  连接状态:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  DISCONNECTED    未连接                                                     │
│  CONNECTING      连接中                                                     │
│  CONNECTED       已连接                                                     │
│  ERROR           连接错误                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 产品查询

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         查询产品详情                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  private val productIds = listOf(                               │        │
│  │      "com.readmigo.pro.monthly",                                │        │
│  │      "com.readmigo.pro.yearly",                                 │        │
│  │      "com.readmigo.premium.monthly",                            │        │
│  │      "com.readmigo.premium.yearly"                              │        │
│  │  )                                                              │        │
│  │                                                                 │        │
│  │  suspend fun queryProductDetails() {                            │        │
│  │      val productList = productIds.map { productId ->            │        │
│  │          QueryProductDetailsParams.Product.newBuilder()         │        │
│  │              .setProductId(productId)                           │        │
│  │              .setProductType(                                   │        │
│  │                  BillingClient.ProductType.SUBS                 │        │
│  │              )                                                  │        │
│  │              .build()                                           │        │
│  │      }                                                          │        │
│  │                                                                 │        │
│  │      val params = QueryProductDetailsParams.newBuilder()        │        │
│  │          .setProductList(productList)                           │        │
│  │          .build()                                               │        │
│  │                                                                 │        │
│  │      billingClient.queryProductDetailsAsync(params) {           │        │
│  │          billingResult, productDetailsList ->                   │        │
│  │          if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {│
│  │              _productDetails.value = productDetailsList ?: emptyList()│
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  ProductDetails 包含:                                                       │
│  ─────────────────────────────────────────────────────────────────         │
│  • productId             产品 ID                                            │
│  • name                  产品名称                                           │
│  • description           产品描述                                           │
│  • subscriptionOfferDetails  订阅优惠详情 (价格、周期、试用)                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 购买流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         购买流程时序                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  用户        PaywallScreen   BillingManager    Google Play   Backend        │
│   │              │                 │                │           │           │
│   │──选择产品───►│                 │                │           │           │
│   │              │──launchPurchase()──────────────►│           │           │
│   │              │                 │                │           │           │
│   │              │◄────Google Play 购买界面────────│           │           │
│   │              │                 │                │           │           │
│   │──完成购买────│                 │                │           │           │
│   │              │                 │◄─onPurchasesUpdated()─────│           │
│   │              │                 │                │           │           │
│   │              │                 │──verifyWithBackend()─────►│           │
│   │              │                 │                │           │           │
│   │              │                 │◄────验证结果────────────────│           │
│   │              │                 │                │           │           │
│   │              │                 │──acknowledgePurchase()───►│           │
│   │              │                 │                │           │           │
│   │              │◄──更新状态──────│                │           │           │
│   │◄─显示成功────│                 │                │           │           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 发起购买

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         launchPurchaseFlow                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  suspend fun launchPurchaseFlow(                                │        │
│  │      activity: Activity,                                        │        │
│  │      productDetails: ProductDetails,                            │        │
│  │      offerToken: String                                         │        │
│  │  ): BillingResult {                                             │        │
│  │      val productDetailsParamsList = listOf(                     │        │
│  │          BillingFlowParams.ProductDetailsParams.newBuilder()    │        │
│  │              .setProductDetails(productDetails)                 │        │
│  │              .setOfferToken(offerToken)                         │        │
│  │              .build()                                           │        │
│  │      )                                                          │        │
│  │                                                                 │        │
│  │      val billingFlowParams = BillingFlowParams.newBuilder()     │        │
│  │          .setProductDetailsParamsList(productDetailsParamsList) │        │
│  │          .build()                                               │        │
│  │                                                                 │        │
│  │      return billingClient.launchBillingFlow(activity, billingFlowParams)│
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  响应码处理:                                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  OK                   购买流程已启动                                        │
│  USER_CANCELED        用户取消                                              │
│  SERVICE_UNAVAILABLE  服务不可用                                            │
│  BILLING_UNAVAILABLE  计费功能不可用                                        │
│  ITEM_UNAVAILABLE     商品不可用                                            │
│  DEVELOPER_ERROR      开发者配置错误                                        │
│  ITEM_ALREADY_OWNED   已拥有该商品                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 购买回调处理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PurchasesUpdatedListener                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  override fun onPurchasesUpdated(                               │        │
│  │      billingResult: BillingResult,                              │        │
│  │      purchases: List<Purchase>?                                 │        │
│  │  ) {                                                            │        │
│  │      when (billingResult.responseCode) {                        │        │
│  │          BillingClient.BillingResponseCode.OK -> {              │        │
│  │              purchases?.forEach { purchase ->                   │        │
│  │                  handlePurchase(purchase)                       │        │
│  │              }                                                  │        │
│  │          }                                                      │        │
│  │          BillingClient.BillingResponseCode.USER_CANCELED -> {   │        │
│  │              // 用户取消，不处理                                  │        │
│  │          }                                                      │        │
│  │          else -> {                                              │        │
│  │              // 记录错误                                          │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  │                                                                 │        │
│  │  private fun handlePurchase(purchase: Purchase) {               │        │
│  │      scope.launch {                                             │        │
│  │          when (purchase.purchaseState) {                        │        │
│  │              Purchase.PurchaseState.PURCHASED -> {              │        │
│  │                  // 1. 后端验证                                   │        │
│  │                  val verified = verifyWithBackend(purchase)     │        │
│  │                  if (verified) {                                │        │
│  │                      // 2. 确认购买                               │        │
│  │                      acknowledgePurchase(purchase)              │        │
│  │                      // 3. 更新订阅状态                           │        │
│  │                      refreshSubscriptionStatus()                │        │
│  │                  }                                              │        │
│  │              }                                                  │        │
│  │              Purchase.PurchaseState.PENDING -> {                │        │
│  │                  // 待处理 (延迟付款)                             │        │
│  │              }                                                  │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  Purchase.PurchaseState:                                                    │
│  ─────────────────────────────────────────────────────────────────         │
│  UNSPECIFIED_STATE    未指定                                                │
│  PURCHASED            已购买 (需要确认)                                     │
│  PENDING              待处理                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 购买验证

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         后端验证                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  private suspend fun verifyWithBackend(purchase: Purchase): Boolean {│   │
│  │      return try {                                               │        │
│  │          val request = VerifyPurchaseRequest(                   │        │
│  │              purchaseToken = purchase.purchaseToken,            │        │
│  │              productId = purchase.products.firstOrNull() ?: "", │        │
│  │              orderId = purchase.orderId ?: ""                   │        │
│  │          )                                                      │        │
│  │                                                                 │        │
│  │          val response = apiService.verifyGooglePurchase(request)│        │
│  │          response.isValid                                       │        │
│  │      } catch (e: Exception) {                                   │        │
│  │          false                                                  │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  验证请求:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  {                                                                          │
│    "purchaseToken": "<Google Play 购买令牌>",                               │
│    "productId": "com.readmigo.pro.yearly",                                 │
│    "orderId": "GPA.xxxx-xxxx-xxxx"                                         │
│  }                                                                          │
│                                                                             │
│  验证响应:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  {                                                                          │
│    "isValid": true,                                                         │
│    "subscription": {                                                        │
│      "planType": "PRO",                                                     │
│      "status": "ACTIVE",                                                    │
│      "expiresAt": "2025-12-31T23:59:59Z"                                   │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 购买确认

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         acknowledgePurchase                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  重要: 必须在 3 天内确认购买，否则 Google Play 会自动退款                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  private suspend fun acknowledgePurchase(purchase: Purchase) {  │        │
│  │      if (purchase.isAcknowledged) return                        │        │
│  │                                                                 │        │
│  │      val params = AcknowledgePurchaseParams.newBuilder()        │        │
│  │          .setPurchaseToken(purchase.purchaseToken)              │        │
│  │          .build()                                               │        │
│  │                                                                 │        │
│  │      billingClient.acknowledgePurchase(params) { billingResult ->│       │
│  │          if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {│
│  │              // 确认成功                                          │        │
│  │          } else {                                               │        │
│  │              // 记录错误，稍后重试                                 │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  确认时机:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  • 后端验证成功后立即确认                                                    │
│  • App 启动时检查未确认的购买                                               │
│  • 网络恢复后重试确认                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 恢复购买

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         查询已购买订阅                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  suspend fun queryPurchases() {                                 │        │
│  │      val params = QueryPurchasesParams.newBuilder()             │        │
│  │          .setProductType(BillingClient.ProductType.SUBS)        │        │
│  │          .build()                                               │        │
│  │                                                                 │        │
│  │      billingClient.queryPurchasesAsync(params) { billingResult, purchaseList ->│
│  │          if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {│
│  │              _purchases.value = purchaseList                    │        │
│  │                                                                 │        │
│  │              purchaseList.forEach { purchase ->                 │        │
│  │                  if (!purchase.isAcknowledged &&                │        │
│  │                      purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {│
│  │                      handlePurchase(purchase)                   │        │
│  │                  }                                              │        │
│  │              }                                                  │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  使用场景:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  • App 启动时                                                               │
│  • BillingClient 连接成功后                                                 │
│  • 用户点击"恢复购买"                                                        │
│  • 网络恢复后                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第三部分: Google Play 后台接入

## Google Play Developer API

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         服务端验证                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  API 端点:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  GET /androidpublisher/v3/applications/{packageName}/purchases/             │
│      subscriptions/{subscriptionId}/tokens/{token}                         │
│                                                                             │
│  认证方式:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  • Service Account (推荐)                                                   │
│  • Google Cloud Console 创建服务账号                                        │
│  • 下载 JSON 密钥文件                                                        │
│  • 环境变量: GOOGLE_PLAY_SERVICE_ACCOUNT                                   │
│                                                                             │
│  响应字段:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  {                                                                          │
│    "kind": "androidpublisher#subscriptionPurchase",                        │
│    "startTimeMillis": "1609459200000",       // 订阅开始时间                │
│    "expiryTimeMillis": "1640995200000",      // 到期时间                    │
│    "autoRenewing": true,                     // 是否自动续订                │
│    "priceCurrencyCode": "USD",               // 货币代码                    │
│    "priceAmountMicros": "9990000",           // 价格 (微单位)               │
│    "paymentState": 1,                        // 付款状态                    │
│    "cancelReason": 0,                        // 取消原因                    │
│    "userCancellationTimeMillis": null,       // 用户取消时间                │
│    "orderId": "GPA.xxx",                     // 订单 ID                     │
│    "linkedPurchaseToken": null,              // 关联令牌 (升级时)           │
│    "acknowledgementState": 1                 // 确认状态                    │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## RTDN (实时开发者通知)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Google Play 通知                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  配置步骤:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  1. 创建 Cloud Pub/Sub Topic                                                │
│  2. 创建 Subscription (Push 模式)                                           │
│  3. 配置 Webhook 端点: POST /webhooks/google                               │
│  4. 在 Google Play Console 配置 RTDN                                       │
│                                                                             │
│  通知类型 (notificationType):                                                │
│  ─────────────────────────────────────────────────────────────────         │
│  1   SUBSCRIPTION_RECOVERED      订阅恢复                                   │
│  2   SUBSCRIPTION_RENEWED        续订成功                                   │
│  3   SUBSCRIPTION_CANCELED       取消订阅                                   │
│  4   SUBSCRIPTION_PURCHASED      新购买                                     │
│  5   SUBSCRIPTION_ON_HOLD        账户暂停                                   │
│  6   SUBSCRIPTION_IN_GRACE_PERIOD  宽限期                                   │
│  7   SUBSCRIPTION_RESTARTED      重新激活                                   │
│  9   SUBSCRIPTION_PRICE_CHANGE_CONFIRMED  价格变更确认                      │
│  10  SUBSCRIPTION_DEFERRED       延迟订阅                                   │
│  11  SUBSCRIPTION_PAUSED         暂停订阅                                   │
│  12  SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED  暂停计划变更                      │
│  13  SUBSCRIPTION_REVOKED        撤销订阅                                   │
│  20  SUBSCRIPTION_EXPIRED        订阅过期                                   │
│                                                                             │
│  Webhook 负载:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  {                                                                          │
│    "message": {                                                             │
│      "data": "<base64 encoded JSON>",                                      │
│      "messageId": "xxx",                                                   │
│      "publishTime": "2024-12-31T12:00:00Z"                                 │
│    },                                                                       │
│    "subscription": "projects/xxx/subscriptions/xxx"                        │
│  }                                                                          │
│                                                                             │
│  解码后数据:                                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  {                                                                          │
│    "version": "1.0",                                                        │
│    "packageName": "com.readmigo.app",                                      │
│    "eventTimeMillis": "1704024000000",                                     │
│    "subscriptionNotification": {                                           │
│      "version": "1.0",                                                     │
│      "notificationType": 4,                                                │
│      "purchaseToken": "<purchase_token>",                                  │
│      "subscriptionId": "com.readmigo.pro.yearly"                           │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 后端 Webhook 处理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Webhook 端点                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  端点: POST /webhooks/google                                                │
│                                                                             │
│  处理逻辑:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  通知类型                处理方法                    操作                   │
│  ─────────────────────────────────────────────────────────────────         │
│  SUBSCRIPTION_PURCHASED  handlePurchase()          创建/更新订阅为 ACTIVE   │
│  SUBSCRIPTION_RENEWED    handleRenewal()           更新到期日，保持 ACTIVE  │
│  SUBSCRIPTION_CANCELED   handleCancellation()      标记为 CANCELLED        │
│  SUBSCRIPTION_ON_HOLD    handleOnHold()            标记为 ON_HOLD          │
│  SUBSCRIPTION_IN_GRACE_PERIOD  handleGracePeriod() 标记为 GRACE_PERIOD     │
│  SUBSCRIPTION_PAUSED     handlePaused()            标记为 PAUSED           │
│  SUBSCRIPTION_RESTARTED  handleRestart()           恢复为 ACTIVE           │
│  SUBSCRIPTION_REVOKED    handleRevoke()            立即撤销，设为 FREE      │
│  SUBSCRIPTION_EXPIRED    handleExpired()           标记为 EXPIRED          │
│                                                                             │
│  通用处理流程:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  1. 解码 Base64 消息                                                        │
│  2. 提取 purchaseToken 和 subscriptionId                                   │
│  3. 调用 Google API 获取完整订阅信息                                        │
│  4. 通过 purchaseToken 或 orderId 查找用户                                  │
│  5. 更新订阅状态                                                             │
│  6. 创建/更新订单记录                                                        │
│  7. 返回 HTTP 200 (必须)                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第四部分: 后端服务实现

## API 端点

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         订阅 API 端点                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  用户端点 (需要 JWT 认证):                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  GET  /subscriptions/status             获取当前订阅状态                    │
│  POST /subscriptions/verify/google      验证 Google Play 购买               │
│  POST /subscriptions/restore            恢复购买                            │
│  GET  /subscriptions/trial/eligibility  检查试用资格                        │
│  GET  /subscriptions/trial/status       获取试用状态                        │
│  POST /subscriptions/trial/start        开始试用                            │
│                                                                             │
│  Webhook 端点 (无认证):                                                      │
│  ─────────────────────────────────────────────────────────────────         │
│  POST /webhooks/google                  Google Play RTDN 通知               │
│                                                                             │
│  管理端点 (需要 Admin 权限):                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  与 iOS 共用管理端点                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 验证服务

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Google 购买验证                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  verifyGooglePurchase(userId, request):                                     │
│  ─────────────────────────────────────────────────────────────────         │
│  1. 调用 Google Play Developer API                                          │
│  2. 获取订阅详情 (expiryTimeMillis, autoRenewing, etc.)                    │
│  3. 验证 purchaseState 和 acknowledgementState                             │
│  4. 映射 productId → planType                                               │
│  5. 创建或更新 Subscription 记录                                            │
│     • source = GOOGLE_PLAY                                                  │
│     • googlePurchaseToken = purchaseToken                                  │
│     • googleOrderId = orderId                                               │
│  6. 创建 Order 和 Transaction 记录                                          │
│  7. 返回订阅状态                                                             │
│                                                                             │
│  Product ID 映射:                                                            │
│  ─────────────────────────────────────────────────────────────────         │
│  com.readmigo.pro.monthly      → PRO                                        │
│  com.readmigo.pro.yearly       → PRO                                        │
│  com.readmigo.premium.monthly  → PREMIUM                                    │
│  com.readmigo.premium.yearly   → PREMIUM                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 数据模型扩展

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Subscription 表 (扩展)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Google Play 相关字段:                                                       │
│  ─────────────────────────────────────────────────────────────────         │
│  字段                    类型           说明                                │
│  ─────────────────────────────────────────────────────────────────         │
│  googlePurchaseToken    String?        Google Play 购买令牌                 │
│  googleOrderId          String?        Google Play 订单 ID                  │
│  googleLinkedToken      String?        关联令牌 (升级/降级时)               │
│                                                                             │
│  source 枚举扩展:                                                            │
│  ─────────────────────────────────────────────────────────────────         │
│  NONE           无                                                          │
│  APPLE_IAP      Apple 应用内购买                                            │
│  GOOGLE_PLAY    Google Play 订阅   ← 新增                                   │
│  STRIPE         Stripe 网页支付                                             │
│  PROMO_CODE     促销码                                                      │
│  ADMIN_GRANT    管理员赠送                                                  │
│                                                                             │
│  Order 表 Google Play 字段:                                                  │
│  ─────────────────────────────────────────────────────────────────         │
│  googlePurchaseToken    String?        购买令牌                             │
│  googleOrderId          String?        订单 ID (GPA.xxx)                   │
│  googleEnvironment      ENUM?          TEST / PRODUCTION                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第五部分: UI 实现设计

## 付费墙界面

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PaywallScreen                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  ┌─────────────────────────────────────────────────────────┐    │        │
│  │  │           🎉 解锁 Readmigo Pro                          │    │        │
│  │  └─────────────────────────────────────────────────────────┘    │        │
│  │                                                                 │        │
│  │  ┌───────────────┐  ┌───────────────┐                          │        │
│  │  │    月度       │  │    年度 ✓     │  ← 周期选择器             │        │
│  │  │   ¥18/月     │  │   ¥128/年    │                          │        │
│  │  │              │  │  节省 40%     │                          │        │
│  │  └───────────────┘  └───────────────┘                          │        │
│  │                                                                 │        │
│  │  ┌─────────────────────────────────────────────────────────┐    │        │
│  │  │  ✓ 无限 AI 对话                                         │    │        │
│  │  │  ✓ 离线阅读                                             │    │        │
│  │  │  ✓ 高级学习功能                                         │    │        │
│  │  │  ✓ 无广告体验                                           │    │        │
│  │  └─────────────────────────────────────────────────────────┘    │        │
│  │                                                                 │        │
│  │  ┌─────────────────────────────────────────────────────────┐    │        │
│  │  │              🚀 开始 7 天免费试用                        │    │        │
│  │  │              (年度订阅)                                  │    │        │
│  │  └─────────────────────────────────────────────────────────┘    │        │
│  │                                                                 │        │
│  │  恢复购买 | 隐私政策 | 服务条款                                  │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  Compose 实现要点:                                                           │
│  ─────────────────────────────────────────────────────────────────         │
│  • LazyColumn 布局                                                          │
│  • ProductCard Composable 展示产品                                         │
│  • Button onClick 触发 launchPurchaseFlow                                  │
│  • CircularProgressIndicator 购买中状态                                    │
│  • 错误 Snackbar 提示                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 订阅状态界面

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SubscriptionStatusScreen                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  当前计划                                                       │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │                                                                 │        │
│  │  ┌─────────────────────────────────────────────────────────┐    │        │
│  │  │  👑 Readmigo Pro                              [ACTIVE]  │    │        │
│  │  │                                                         │    │        │
│  │  │  到期时间: 2025-12-31                                   │    │        │
│  │  │  自动续订: 开启                                         │    │        │
│  │  │  下次扣费: ¥128.00                                      │    │        │
│  │  └─────────────────────────────────────────────────────────┘    │        │
│  │                                                                 │        │
│  │  ┌─────────────────────────────────────────────────────────┐    │        │
│  │  │            在 Google Play 中管理订阅                     │    │        │
│  │  └─────────────────────────────────────────────────────────┘    │        │
│  │                                                                 │        │
│  │  订阅详情                                                       │        │
│  │  ─────────────────────────────────────────────────────────      │        │
│  │  订单 ID: GPA.3372-3254-5279-11234                             │        │
│  │  购买日期: 2024-12-31                                           │        │
│  │  订阅来源: Google Play                                          │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  管理订阅跳转:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  val intent = Intent(Intent.ACTION_VIEW)                                   │
│  intent.data = Uri.parse(                                                  │
│      "https://play.google.com/store/account/subscriptions" +               │
│      "?sku=${productId}&package=${packageName}"                            │
│  )                                                                          │
│  startActivity(intent)                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ViewModel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PaywallViewModel                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @HiltViewModel                                                 │        │
│  │  class PaywallViewModel @Inject constructor(                    │        │
│  │      private val billingManager: BillingManager,                │        │
│  │  ) : ViewModel() {                                              │        │
│  │                                                                 │        │
│  │      val productDetails = billingManager.productDetails         │        │
│  │      val subscriptionState = billingManager.subscriptionState   │        │
│  │      val connectionState = billingManager.connectionState       │        │
│  │                                                                 │        │
│  │      private val _uiState = MutableStateFlow(PaywallUiState())  │        │
│  │      val uiState: StateFlow<PaywallUiState> = _uiState          │        │
│  │                                                                 │        │
│  │      fun onProductSelected(product: ProductDetails) {           │        │
│  │          _uiState.update { it.copy(selectedProduct = product) } │        │
│  │      }                                                          │        │
│  │                                                                 │        │
│  │      fun onPurchaseClick(activity: Activity) {                  │        │
│  │          viewModelScope.launch {                                │        │
│  │              _uiState.update { it.copy(isPurchasing = true) }   │        │
│  │              val result = billingManager.launchPurchaseFlow(    │        │
│  │                  activity,                                      │        │
│  │                  uiState.value.selectedProduct!!,               │        │
│  │                  getOfferToken()                                │        │
│  │              )                                                  │        │
│  │              handlePurchaseResult(result)                       │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │                                                                 │        │
│  │      fun onRestorePurchases() {                                 │        │
│  │          viewModelScope.launch {                                │        │
│  │              billingManager.queryPurchases()                    │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  PaywallUiState:                                                            │
│  ─────────────────────────────────────────────────────────────────         │
│  data class PaywallUiState(                                                 │
│      val selectedProduct: ProductDetails? = null,                          │
│      val isPurchasing: Boolean = false,                                    │
│      val error: String? = null,                                            │
│      val purchaseSuccess: Boolean = false                                  │
│  )                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第六部分: 续订与取消

## 自动续订

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Google Play 自动续订                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  续订流程:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  Google Play   RTDN Webhook          Backend              App              │
│      │              │                    │                  │              │
│      │  到期前扣费  │                    │                  │              │
│      │──────────────                    │                  │              │
│      │              │                    │                  │              │
│      │  [扣费成功]  │                    │                  │              │
│      │──SUBSCRIPTION_RENEWED────────────►│                  │              │
│      │              │                    │──更新 expiresAt──               │
│      │              │                    │                  │              │
│      │  [扣费失败]  │                    │                  │              │
│      │──SUBSCRIPTION_IN_GRACE_PERIOD───►│                  │              │
│      │              │                    │──设为 GRACE_PERIOD              │
│      │              │                    │                  │              │
│      │  [宽限期结束]│                    │                  │              │
│      │──SUBSCRIPTION_EXPIRED───────────►│                  │              │
│      │              │                    │──设为 EXPIRED────               │
│                                                                             │
│  Google Play 特有状态:                                                       │
│  ─────────────────────────────────────────────────────────────────         │
│  ON_HOLD      账户暂停 (付款问题，最长 30 天)                                │
│  PAUSED       用户主动暂停 (最长 3 个月)                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 取消订阅

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         取消订阅流程                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  用户取消方式:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  1. Google Play Store > 订阅 > Readmigo > 取消订阅                          │
│  2. play.google.com/store/account/subscriptions                            │
│  3. App 内跳转到 Google Play 管理页面                                       │
│                                                                             │
│  取消后流程:                                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  User      Google Play     RTDN Webhook        Backend                     │
│    │            │                │                 │                       │
│    │──取消订阅──►│                │                 │                       │
│    │            │──SUBSCRIPTION_CANCELED──────────►│                       │
│    │            │                │                 │                       │
│    │            │                │     更新状态: CANCELLED                 │
│    │            │                │     autoRenewing: false                 │
│    │            │                │     保留 expiresAt 不变                 │
│    │            │                │                 │                       │
│    │◄───────────────────仍可使用到期日前──────────│                       │
│    │            │                │                 │                       │
│    │            │──SUBSCRIPTION_EXPIRED──────────►│                       │
│    │            │                │                 │──设为 FREE            │
│                                                                             │
│  关键点:                                                                     │
│  ─────────────────────────────────────────────────────────────────         │
│  • 取消 ≠ 立即失效                                                          │
│  • CANCELLED 状态仍可访问付费功能直到 expiresAt                             │
│  • 用户可随时在 Google Play 中重新订阅                                      │
│  • 重新订阅会收到 SUBSCRIPTION_RESTARTED 通知                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 升级与降级

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         订阅变更                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  升级 (PRO → PREMIUM):                                                      │
│  ─────────────────────────────────────────────────────────────────         │
│  • 使用 setSubscriptionUpdateParams() 配置升级                              │
│  • IMMEDIATE_WITH_TIME_PRORATION: 立即生效，按比例计费                      │
│  • linkedPurchaseToken 关联原购买                                           │
│  • 原订阅自动取消                                                            │
│                                                                             │
│  降级 (PREMIUM → PRO):                                                      │
│  ─────────────────────────────────────────────────────────────────         │
│  • DEFERRED: 当前周期结束后生效                                              │
│  • 不产生退款                                                                │
│                                                                             │
│  升级代码示例:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  val updateParams = BillingFlowParams.SubscriptionUpdateParams              │
│      .newBuilder()                                                          │
│      .setOldPurchaseToken(currentPurchaseToken)                            │
│      .setSubscriptionReplacementMode(                                       │
│          BillingFlowParams.SubscriptionReplacementMode                      │
│              .WITH_TIME_PRORATION                                           │
│      )                                                                      │
│      .build()                                                               │
│                                                                             │
│  val billingParams = BillingFlowParams.newBuilder()                         │
│      .setProductDetailsParamsList(productDetailsList)                       │
│      .setSubscriptionUpdateParams(updateParams)                             │
│      .build()                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第七部分: 功能门禁与用量追踪

## FeatureGateService

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         功能门禁服务                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @Singleton                                                     │        │
│  │  class FeatureGateService @Inject constructor(                  │        │
│  │      private val billingManager: BillingManager,                │        │
│  │      private val usageTracker: UsageTracker                     │        │
│  │  ) {                                                            │        │
│  │      fun checkAccess(feature: Feature): FeatureAccessResult {   │        │
│  │          val tier = billingManager.currentTier.value            │        │
│  │          val usage = usageTracker.currentUsage.value            │        │
│  │                                                                 │        │
│  │          // 检查功能是否在当前层级开放                            │        │
│  │          if (!feature.availableTiers.contains(tier)) {          │        │
│  │              return FeatureAccessResult.Restricted(             │        │
│  │                  reason = RestrictedReason.TIER_REQUIRED,       │        │
│  │                  requiredTier = feature.minTier                 │        │
│  │              )                                                  │        │
│  │          }                                                      │        │
│  │                                                                 │        │
│  │          // 检查用量限制                                          │        │
│  │          val limit = feature.limits[tier] ?: return FeatureAccessResult.Allowed│
│  │          if (usage.getUsage(feature) >= limit) {                │        │
│  │              return FeatureAccessResult.Restricted(             │        │
│  │                  reason = RestrictedReason.LIMIT_REACHED,       │        │
│  │                  currentUsage = usage.getUsage(feature),        │        │
│  │                  limit = limit                                  │        │
│  │              )                                                  │        │
│  │          }                                                      │        │
│  │                                                                 │        │
│  │          return FeatureAccessResult.Allowed                     │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  Feature 定义:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  enum class Feature {                                                       │
│      AI_WORD_EXPLAIN,     // AI 单词解释                                    │
│      AI_SUMMARY,          // AI 文章总结                                    │
│      ADVANCED_AI,         // 高级 AI (GPT-4/Claude)                         │
│      VOICE_CHAT,          // 语音对话                                       │
│      VIDEO_CHAT,          // 视频对话                                       │
│      VOCABULARY_SAVE,     // 词汇保存                                       │
│      SPACED_REPETITION,   // 间隔重复                                       │
│      OFFLINE_BOOKS,       // 离线书籍                                       │
│      READING_STATS,       // 阅读统计                                       │
│      VOCABULARY_EXPORT    // 词汇导出                                       │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## UsageTracker

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         用量追踪                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  @Singleton                                                     │        │
│  │  class UsageTracker @Inject constructor(                        │        │
│  │      private val dataStore: DataStore<Preferences>,             │        │
│  │      private val apiService: ApiService                         │        │
│  │  ) {                                                            │        │
│  │      private val _currentUsage = MutableStateFlow(Usage())      │        │
│  │      val currentUsage: StateFlow<Usage> = _currentUsage         │        │
│  │                                                                 │        │
│  │      // 记录使用                                                  │        │
│  │      suspend fun recordUsage(feature: Feature) {                │        │
│  │          _currentUsage.update { usage ->                        │        │
│  │              usage.increment(feature)                           │        │
│  │          }                                                      │        │
│  │          syncWithBackend()                                      │        │
│  │      }                                                          │        │
│  │                                                                 │        │
│  │      // 每日重置                                                  │        │
│  │      private fun checkDailyReset() {                            │        │
│  │          val lastResetDate = getLastResetDate()                 │        │
│  │          if (lastResetDate != today) {                          │        │
│  │              resetDailyUsage()                                  │        │
│  │          }                                                      │        │
│  │      }                                                          │        │
│  │                                                                 │        │
│  │      // 从后端同步                                                │        │
│  │      suspend fun syncFromBackend() {                            │        │
│  │          val response = apiService.getCurrentUsage()            │        │
│  │          _currentUsage.value = response.toUsage()               │        │
│  │      }                                                          │        │
│  │  }                                                              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  Usage 数据类:                                                               │
│  ─────────────────────────────────────────────────────────────────         │
│  data class Usage(                                                          │
│      val aiCallsToday: Int = 0,         // 今日 AI 调用                     │
│      val vocabularyCount: Int = 0,       // 词汇总数                        │
│      val offlineDownloads: Int = 0,      // 离线下载数                      │
│      val voiceChatMinutes: Int = 0,      // 本月语音分钟数                  │
│      val lastResetDate: LocalDate = LocalDate.now()                        │
│  )                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第八部分: 文件结构

## 目录组织

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Android 订阅模块文件结构                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  android/app/src/main/java/com/readmigo/app/                               │
│  ├── features/                                                              │
│  │   ├── billing/                        # 计费模块 (待创建)               │
│  │   │   ├── data/                                                         │
│  │   │   │   ├── BillingManager.kt       # 计费客户端管理                   │
│  │   │   │   └── dto/                                                      │
│  │   │   │       ├── VerifyPurchaseRequest.kt                              │
│  │   │   │       └── VerifyPurchaseResponse.kt                             │
│  │   │   ├── domain/                                                       │
│  │   │   │   ├── models/                                                   │
│  │   │   │   │   ├── SubscriptionState.kt                                  │
│  │   │   │   │   └── PurchaseResult.kt                                     │
│  │   │   │   ├── FeatureGateService.kt   # 功能门禁                         │
│  │   │   │   └── UsageTracker.kt         # 用量追踪                         │
│  │   │   └── ui/                                                           │
│  │   │       ├── PaywallScreen.kt        # 付费墙                           │
│  │   │       ├── PaywallViewModel.kt                                       │
│  │   │       ├── SubscriptionStatusScreen.kt  # 订阅状态                   │
│  │   │       └── components/                                               │
│  │   │           ├── ProductCard.kt                                        │
│  │   │           └── FeatureList.kt                                        │
│  │   │                                                                     │
│  │   └── profile/                        # 现有模块                         │
│  │       ├── domain/models/                                                │
│  │       │   └── ProfileModels.kt        # SubscriptionInfo (已有)         │
│  │       └── data/dto/                                                     │
│  │           └── ProfileDto.kt           # SubscriptionInfoDto (已有)      │
│  │                                                                         │
│  └── core/                                                                 │
│      └── data/remote/api/                                                  │
│          └── ApiService.kt               # 需添加订阅相关端点               │
│                                                                             │
│  后端文件 (已实现，与 iOS 共用):                                            │
│  ─────────────────────────────────────────────────────────────────         │
│  apps/backend/src/modules/subscriptions/                                   │
│  ├── subscriptions.controller.ts         # 用户端点                        │
│  ├── subscriptions.service.ts            # 核心服务                        │
│  ├── google-webhook.controller.ts        # Google RTDN (待创建)            │
│  ├── google-webhook.service.ts           # 通知处理 (待创建)               │
│  └── google-play.service.ts              # Google API 集成 (待创建)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 相关文档

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         参考文档                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Google 官方文档:                                                            │
│  ─────────────────────────────────────────────────────────────────         │
│  • Google Play Billing:                                                     │
│    developer.android.com/google/play/billing                               │
│  • 订阅专项指南:                                                             │
│    developer.android.com/google/play/billing/subscriptions                 │
│  • RTDN (实时通知):                                                          │
│    developer.android.com/google/play/billing/rtdn-reference                │
│  • 服务端验证:                                                               │
│    developers.google.com/android-publisher/api-ref/rest                    │
│                                                                             │
│  项目内文档:                                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  • docs/04-development/platforms/android/features/subscription-implementation.md (本文档) │
│  • docs/04-development/platforms/ios/features/subscription-implementation.md            │
│  • docs/04-development/shared/subscription-system.md                                   │
│  • docs/04-development/platforms/dashboard/features/orders.md                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 第九部分: 实施检查清单

## 开发任务清单

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Android 订阅实施任务                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  依赖配置:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 添加 Google Play Billing Library 依赖                                   │
│  ☐ 配置 ProGuard 规则 (如需要)                                              │
│                                                                             │
│  核心功能:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 创建 BillingManager 单例                                                │
│  ☐ 实现 BillingClient 连接管理                                             │
│  ☐ 实现 queryProductDetails()                                              │
│  ☐ 实现 launchPurchaseFlow()                                               │
│  ☐ 实现 PurchasesUpdatedListener                                           │
│  ☐ 实现 acknowledgePurchase()                                              │
│  ☐ 实现 queryPurchases() (恢复购买)                                        │
│                                                                             │
│  后端集成:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 添加 ApiService 订阅端点                                                │
│  ☐ 实现购买验证 API 调用                                                   │
│  ☐ 实现订阅状态刷新                                                         │
│                                                                             │
│  功能门禁:                                                                   │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 创建 FeatureGateService                                                 │
│  ☐ 创建 UsageTracker                                                       │
│  ☐ 集成到需要限制的功能入口                                                 │
│                                                                             │
│  UI 界面:                                                                    │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 创建 PaywallScreen                                                      │
│  ☐ 创建 PaywallViewModel                                                   │
│  ☐ 创建 SubscriptionStatusScreen                                           │
│  ☐ 添加导航路由                                                             │
│                                                                             │
│  后端服务 (如未完成):                                                        │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 创建 Google Play 购买验证服务                                           │
│  ☐ 创建 RTDN Webhook 控制器                                                │
│  ☐ 配置 Google Cloud Pub/Sub                                               │
│  ☐ 配置 Service Account                                                    │
│                                                                             │
│  测试:                                                                       │
│  ─────────────────────────────────────────────────────────────────         │
│  ☐ 使用测试产品进行购买测试                                                 │
│  ☐ 测试续订流程                                                             │
│  ☐ 测试取消流程                                                             │
│  ☐ 测试恢复购买                                                             │
│  ☐ 测试 Webhook 通知处理                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
