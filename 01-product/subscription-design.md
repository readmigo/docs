# Readmigo Subscription System - Commercial Design Document

## Executive Summary

本文档定义了 Readmigo 应用商业级订阅系统的完整设计方案，包括定价策略、UI/UX 改进、功能差异化、以及实现规范。目标是打造一个可直接发布到 App Store 的专业订阅体验。

**已确认决策:**
- 简化为单一 Pro 层级，Premium 为未来预留
- Pro 定价: $7.99/月, $49.99/年
- 提供 7 天免费试用 (需绑定支付方式)
- Pro 包含离线阅读功能

---

## 1. 定价策略

### 1.1 市场调研基准

| 竞品 | 月费 | 年费 | 终身 |
|------|------|------|------|
| Duolingo Plus | $6.99-$13.99 | ~$84 | N/A |
| Babbel | $12.95-$17.95 | $83.40 | $299 |
| Rosetta Stone | $10-$15 | $131-$179 | $199-$399 |
| Busuu | $9.99 | $69.99 | $199.99 |

### 1.2 Readmigo 定价方案 (已确认)

#### Pro 层级 (唯一付费层级)

| 周期 | 价格 | 折算月费 | 节省 |
|------|------|----------|------|
| 月付 | **$7.99/月** | $7.99 | - |
| 年付 | **$49.99/年** | $4.17 | **48%** |

#### Premium 层级 (未来预留)

| 周期 | 价格 | 折算月费 | 节省 |
|------|------|----------|------|
| 月付 | $12.99/月 | $12.99 | - |
| 年付 | $79.99/年 | $6.67 | 49% |

> **注意**: Premium 层级当前不实现，仅作为未来扩展预留。代码结构需支持未来添加 Premium。

### 1.3 定价理由

1. **Pro $7.99/月** - 低于 Duolingo Plus ($13.99)，与 Babbel 入门价持平，吸引价格敏感用户
2. **年付 48% 折扣** - 高于行业平均 (33%)，强力激励长期订阅，提升 LTV
3. **无终身选项** - 确保持续收入，支持 AI 服务成本
4. **单一层级简化** - 降低用户决策成本，提高转化率

### 1.4 免费试用策略 (已确认)

| 方案 | 试用期 | 条件 |
|------|--------|------|
| Pro 年付 | **7 天免费试用** | 需绑定支付方式 |
| Pro 月付 | 无免费试用 | 直接付费 |

**免费试用规则:**
- 用户必须绑定 Apple ID 支付方式
- 试用期内可随时取消，不收费
- 试用结束后自动按年付价格 ($49.99) 扣费
- 每个 Apple ID 仅可享受一次免费试用

---

## 2. 功能层级定义 (已确认)

### 2.1 Free 层级 (免费用户)

| 功能 | 限制 | 说明 |
|------|------|------|
| 书籍访问 | **10 本** | 精选免费书籍 |
| AI 解释 | **5 次/天** | 单词解释、句子简化、段落翻译 |
| 词汇保存 | **50 个单词** | 达到上限后无法添加新词 |
| 复习功能 | 基础闪卡 | 无间隔重复算法 |
| 阅读统计 | ❌ | 不可用 |
| 离线阅读 | ❌ | 不可用 |
| 语音聊天 | ❌ | 不可用 |

### 2.2 Pro 层级 ($7.99/月 或 $49.99/年)

| 功能 | 说明 |
|------|------|
| 书籍访问 | **50 本书籍** |
| AI 解释 | **100 次/天** |
| 词汇保存 | **1000 个单词** |
| 间隔重复复习 | 智能复习算法 (SM-2) |
| 阅读统计 | 详细学习数据与趋势 |
| 离线阅读 | **支持下载** (最多 10 本) |
| 语音聊天 | **30 分钟/月** |
| 词汇导出 | 支持 CSV/Anki 导出 |
| AI 模型 | 标准 AI (GPT-3.5) |

### 2.3 Premium 层级 (未来预留)

| 功能 | 说明 |
|------|------|
| **包含所有 Pro 功能** | - |
| 高级 AI 模型 | GPT-4o / Claude Sonnet |
| 语音聊天 | 无限时长 |
| 视频聊天 | 与 AI 角色视频对话 |
| 离线下载 | 无限制 |
| 优先客服支持 | 24 小时内响应 |
| 新功能抢先体验 | Beta 功能访问 |

---

## 3. UI/UX 设计

### 3.1 订阅状态页面 (SubscriptionStatusView)

#### 设计图 - Free 用户

```
┌─────────────────────────────────────────┐
│              Subscription               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  👤  Current Plan               │   │
│  │      ────────────               │   │
│  │      Free                       │   │
│  │                                 │   │
│  │      Limited Access             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ╔═════════════════════════════════╗   │
│  ║  ✨ Upgrade to Pro              ║   │
│  ║     ─────────────────           ║   │
│  ║     Unlock your full potential  ║   │
│  ║                                 ║   │
│  ║     [Shimmer Animation]         ║   │
│  ╚═════════════════════════════════╝   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔄 Restore Purchases           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ═══════════════════════════════════   │
│                                         │
│  YOUR FEATURES                          │
│  ─────────────────────────────────      │
│                                         │
│  ✅ Access to 10 free books            │
│  ─────────────────────────────────      │
│  ░░░░░░░░░░ 3/10 books read            │
│                                         │
│  ✅ Basic AI explanations              │
│  ─────────────────────────────────      │
│  ░░░░░░░░░░ 2/5 used today             │
│                                         │
│  ✅ Vocabulary saving                  │
│  ─────────────────────────────────      │
│  ░░░░░░░░░░ 23/50 words saved          │
│                                         │
│  ─────────────────────────────────      │
│  UPGRADE TO UNLOCK                      │
│  ─────────────────────────────────      │
│                                         │
│  🔒 Access to 50 books                 │
│  🔒 100 AI explanations/day            │
│  🔒 1000 vocabulary words              │
│  🔒 Smart spaced repetition            │
│  🔒 Offline reading                    │
│  🔒 Reading statistics                 │
│  🔒 Voice chat with AI                 │
│                                         │
│  ═══════════════════════════════════   │
│                                         │
│  NEED HELP?                             │
│  ─────────────────────────────────      │
│                                         │
│  ❓ FAQ                          >      │
│  ✉️  Contact Support             >      │
│  📄 Terms of Service             >      │
│  🔒 Privacy Policy               >      │
│                                         │
└─────────────────────────────────────────┘
```

#### 设计图 - Pro 用户

```
┌─────────────────────────────────────────┐
│              Subscription               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⭐ Current Plan      [Active]  │   │
│  │      ────────────               │   │
│  │      Pro                        │   │
│  │                                 │   │
│  │  ─────────────────────────      │   │
│  │  📅 Jan 15, 2026    🔄 Yearly   │   │
│  │     Renews             Billing  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  SUBSCRIPTION DETAILS           │   │
│  │  ─────────────────────────      │   │
│  │                                 │   │
│  │  📅 Started      Jan 15, 2025   │   │
│  │  🔄 Next Billing Jan 15, 2026   │   │
│  │  💳 Auto-Renew   On             │   │
│  │  🆔 Transaction  8a2f3d...      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⚙️  Manage Subscription         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ═══════════════════════════════════   │
│                                         │
│  YOUR PRO FEATURES                      │
│  ─────────────────────────────────      │
│                                         │
│  ✅ Access to 50 books                 │
│  ✅ 100 AI explanations/day            │
│  ✅ 1000 vocabulary words              │
│  ✅ Smart spaced repetition            │
│  ✅ Offline reading (10 books)         │
│  ✅ Detailed reading statistics        │
│  ✅ Voice chat (30 min/month)          │
│  ✅ Vocabulary export                  │
│                                         │
│  ═══════════════════════════════════   │
│                                         │
│  NEED HELP?                             │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 订阅购买页面 (PaywallView)

#### 设计图

```
┌─────────────────────────────────────────┐
│  Go Pro                      [Close]    │
│                                         │
│              ✨✨✨                       │
│                                         │
│         Unlock Your                     │
│       Full Potential                    │
│                                         │
│    Get unlimited access to all features │
│                                         │
│  ─────────────────────────────────      │
│   Join 50,000+ language learners        │
│        ⭐⭐⭐⭐⭐ 4.8 on App Store       │
│  ─────────────────────────────────      │
│                                         │
│  ✅ Access to 50 books                 │
│  ✅ 100 AI explanations/day            │
│  ✅ 1000 vocabulary words              │
│  ✅ Smart spaced repetition            │
│  ✅ Offline reading                    │
│  ✅ Detailed reading statistics        │
│  ✅ Voice chat with AI tutors          │
│                                         │
│  ╔═════════════════════════════════╗   │
│  ║  🏆 BEST VALUE                   ║   │
│  ║  ─────────────────────────      ║   │
│  ║  Yearly            $49.99/year  ║   │
│  ║  ─────────────────────────      ║   │
│  ║  $4.17/month · Save 48%     ✓   ║   │
│  ║                                 ║   │
│  ║  🎁 Includes 7-day free trial   ║   │
│  ╚═════════════════════════════════╝   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Monthly          $7.99/month   │   │
│  │  ─────────────────────────      │   │
│  │  Billed monthly             ○   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ╔═════════════════════════════════╗   │
│  ║                                 ║   │
│  ║   🎁 Start 7-Day Free Trial     ║   │
│  ║                                 ║   │
│  ║   Then $49.99/year              ║   │
│  ║                                 ║   │
│  ╚═════════════════════════════════╝   │
│                                         │
│       🔄 Restore Purchases              │
│                                         │
│  ─────────────────────────────────      │
│  By subscribing, you agree to our       │
│  Terms of Use and Privacy Policy.       │
│                                         │
│  After your free trial ends, you will   │
│  be charged $49.99/year unless you      │
│  cancel at least 24 hours before the    │
│  trial ends. Subscription automatically │
│  renews unless canceled.                │
│  ─────────────────────────────────      │
│                                         │
└─────────────────────────────────────────┘
```

### 3.3 设计规范

#### 颜色系统

```swift
// SubscriptionColors.swift

extension Color {
    // Pro 品牌色 - 渐变
    static let proGradientStart = Color(hex: "7C3AED") // 紫色
    static let proGradientEnd = Color(hex: "EC4899")   // 粉色

    // 功能色
    static let savingsBadge = Color(hex: "10B981")     // 绿色
    static let bestValueBadge = Color(hex: "F59E0B")   // 金色
    static let freeTrialBadge = Color(hex: "8B5CF6")   // 浅紫色

    // 状态色
    static let activeStatus = Color(hex: "10B981")     // 绿色
    static let expiredStatus = Color(hex: "EF4444")    // 红色
    static let warningStatus = Color(hex: "F59E0B")    // 橙色

    // 进度条
    static let progressFull = Color(hex: "10B981")
    static let progressMedium = Color(hex: "F59E0B")
    static let progressLow = Color(hex: "EF4444")
}
```

#### 图标规范

| 元素 | SF Symbol | 用途 |
|------|-----------|------|
| Pro 图标 | `star.circle.fill` | Pro 用户标识 |
| Free 图标 | `person.circle` | Free 用户标识 |
| 功能可用 | `checkmark.circle.fill` | 绿色 |
| 功能锁定 | `lock.circle` | 灰色 |
| 最佳价值 | `trophy.fill` | 金色 |
| 免费试用 | `gift.fill` | 紫色 |
| 恢复购买 | `arrow.clockwise` | 蓝色 |
| 节省 | `percent` | 绿色 |

#### 动画规范

| 动画 | 时长 | 类型 | 用途 |
|------|------|------|------|
| Shimmer | 1.5s | 循环 | 升级按钮 |
| 选中反馈 | 0.3s | Spring | 选项卡切换 |
| 按钮按压 | 0.1s | Scale 0.95 | 所有按钮 |
| 进度更新 | 0.5s | EaseOut | 进度条 |

---

## 4. 技术实现

### 4.1 StoreKit 产品配置

#### Product IDs

```
com.readmigo.pro.monthly      -> $7.99/month (无试用)
com.readmigo.pro.yearly       -> $49.99/year (7天试用)
```

#### App Store Connect 配置

**订阅组: "Readmigo Pro"**
- 组标识符: `readmigo_pro`
- 显示名称: Readmigo Pro

**产品配置:**

| Product ID | 显示名称 | 价格 | 试用 |
|------------|----------|------|------|
| `com.readmigo.pro.monthly` | Pro Monthly | $7.99 | 无 |
| `com.readmigo.pro.yearly` | Pro Yearly | $49.99 | 7天免费 |

**介绍性优惠 (Introductory Offer):**
- 类型: 免费试用 (Free Trial)
- 时长: 7 天
- 仅适用于: `com.readmigo.pro.yearly`
- 资格: 每个 Apple ID 仅限一次

### 4.2 关键代码更新

#### SubscriptionTier 枚举更新

```swift
// Subscription.swift

enum SubscriptionTier: String, Codable, CaseIterable {
    case free = "FREE"
    case pro = "PRO"
    case premium = "PREMIUM"  // 预留，当前不使用

    var displayName: String {
        switch self {
        case .free: return "Free"
        case .pro: return "Pro"
        case .premium: return "Premium"
        }
    }

    var features: [FeatureItem] {
        switch self {
        case .free:
            return [
                FeatureItem(name: "Access to 10 free books", icon: "book.fill", available: true),
                FeatureItem(name: "Basic AI explanations (5/day)", icon: "brain", available: true),
                FeatureItem(name: "Vocabulary saving (50 words)", icon: "text.book.closed", available: true),
            ]
        case .pro:
            return [
                FeatureItem(name: "Access to 50 books", icon: "books.vertical.fill", available: true),
                FeatureItem(name: "100 AI explanations/day", icon: "brain", available: true),
                FeatureItem(name: "1000 vocabulary words", icon: "text.book.closed", available: true),
                FeatureItem(name: "Smart spaced repetition", icon: "arrow.triangle.2.circlepath", available: true),
                FeatureItem(name: "Offline reading", icon: "arrow.down.circle.fill", available: true),
                FeatureItem(name: "Detailed reading statistics", icon: "chart.bar.fill", available: true),
                FeatureItem(name: "Voice chat with AI (30 min/month)", icon: "waveform", available: true),
                FeatureItem(name: "Vocabulary export", icon: "square.and.arrow.up", available: true),
            ]
        case .premium:
            return SubscriptionTier.pro.features + [
                FeatureItem(name: "Advanced AI (GPT-4, Claude)", icon: "sparkles", available: true),
                FeatureItem(name: "Unlimited voice chat", icon: "waveform.circle.fill", available: true),
                FeatureItem(name: "Video chat with AI", icon: "video.fill", available: true),
                FeatureItem(name: "Priority support", icon: "star.fill", available: true),
            ]
        }
    }

    var lockedFeatures: [FeatureItem] {
        switch self {
        case .free:
            return SubscriptionTier.pro.features
        case .pro:
            return [] // Pro 用户无锁定功能 (Premium 预留)
        case .premium:
            return []
        }
    }
}

struct FeatureItem: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let available: Bool
}
```

#### SubscriptionManager 更新

```swift
// SubscriptionManager.swift

@MainActor
class SubscriptionManager: ObservableObject {
    static let shared = SubscriptionManager()

    // 仅使用 Pro 产品
    private let productIds = [
        "com.readmigo.pro.monthly",
        "com.readmigo.pro.yearly"
    ]

    // 计算属性
    var proProducts: [SubscriptionProduct] {
        products.map { mapToSubscriptionProduct($0, tier: .pro) }
    }

    var yearlyProduct: SubscriptionProduct? {
        proProducts.first { $0.period == .yearly }
    }

    var monthlyProduct: SubscriptionProduct? {
        proProducts.first { $0.period == .monthly }
    }

    var hasFreeTrial: Bool {
        yearlyProduct?.hasFreeTrial ?? false
    }

    var freeTrialDays: Int {
        yearlyProduct?.freeTrialDays ?? 0
    }

    // ... 其他实现
}
```

### 4.3 本地化文案

#### en.json

```json
{
  "subscription.title": "Subscription",
  "subscription.goPro": "Go Pro",
  "subscription.unlockPotential": "Unlock Your Full Potential",
  "subscription.unlimitedAccess": "Get unlimited access to all features",
  "subscription.socialProof": "Join %@ language learners",
  "subscription.rating": "%@ on App Store",

  "subscription.currentPlan": "Current Plan",
  "subscription.limitedAccess": "Limited Access",
  "subscription.fullAccess": "Full Access",

  "subscription.pro": "Pro",
  "subscription.bestValue": "BEST VALUE",
  "subscription.mostPopular": "Most Popular",

  "subscription.monthly": "Monthly",
  "subscription.yearly": "Yearly",
  "subscription.perMonth": "%@/month",
  "subscription.perYear": "%@/year",
  "subscription.billedMonthly": "Billed monthly",
  "subscription.save": "Save %@%%",

  "subscription.startFreeTrial": "Start %d-Day Free Trial",
  "subscription.includesFreeTrial": "Includes %d-day free trial",
  "subscription.thenPrice": "Then %@",
  "subscription.subscribeNow": "Subscribe Now",
  "subscription.restorePurchases": "Restore Purchases",
  "subscription.manageSubscription": "Manage Subscription",

  "subscription.termsOfUse": "Terms of Use",
  "subscription.privacyPolicy": "Privacy Policy",

  "subscription.trialLegalNotice": "After your free trial ends, you will be charged %@ unless you cancel at least 24 hours before the trial ends. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.",

  "subscription.legalNotice": "Payment will be charged to your Apple ID account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions in your App Store account settings.",

  "subscription.yourFeatures": "Your Features",
  "subscription.proFeatures": "Your Pro Features",
  "subscription.upgradeToUnlock": "Upgrade to Unlock",
  "subscription.needHelp": "Need Help?",

  "subscription.upgradeToPro": "Upgrade to Pro",
  "subscription.unlockFullPotential": "Unlock your full potential"
}
```

#### zh-Hans.json

```json
{
  "subscription.title": "订阅",
  "subscription.goPro": "升级 Pro",
  "subscription.unlockPotential": "解锁全部潜能",
  "subscription.unlimitedAccess": "无限访问所有功能",
  "subscription.socialProof": "加入 %@ 名语言学习者",
  "subscription.rating": "App Store 评分 %@",

  "subscription.currentPlan": "当前方案",
  "subscription.limitedAccess": "受限访问",
  "subscription.fullAccess": "完整访问",

  "subscription.pro": "Pro",
  "subscription.bestValue": "超值推荐",
  "subscription.mostPopular": "最受欢迎",

  "subscription.monthly": "月付",
  "subscription.yearly": "年付",
  "subscription.perMonth": "%@/月",
  "subscription.perYear": "%@/年",
  "subscription.billedMonthly": "按月计费",
  "subscription.save": "节省 %@%%",

  "subscription.startFreeTrial": "开始 %d 天免费试用",
  "subscription.includesFreeTrial": "包含 %d 天免费试用",
  "subscription.thenPrice": "之后 %@",
  "subscription.subscribeNow": "立即订阅",
  "subscription.restorePurchases": "恢复购买",
  "subscription.manageSubscription": "管理订阅",

  "subscription.termsOfUse": "使用条款",
  "subscription.privacyPolicy": "隐私政策",

  "subscription.trialLegalNotice": "免费试用结束后，除非您在试用结束前至少 24 小时取消，否则将按 %@ 收费。订阅将自动续订，除非在当前周期结束前至少 24 小时取消。",

  "subscription.legalNotice": "付款将从您的 Apple ID 账户扣除。订阅将自动续订，除非在当前周期结束前至少 24 小时取消。您可以在 App Store 账户设置中管理和取消订阅。",

  "subscription.yourFeatures": "您的功能",
  "subscription.proFeatures": "您的 Pro 功能",
  "subscription.upgradeToUnlock": "升级解锁",
  "subscription.needHelp": "需要帮助？",

  "subscription.upgradeToPro": "升级到 Pro",
  "subscription.unlockFullPotential": "解锁您的全部潜能"
}
```

---

## 5. App Store 合规

### 5.1 必需元素检查清单

- [x] 清晰显示订阅价格
- [x] 显示订阅周期 (月/年)
- [x] 显示免费试用期限 (7天)
- [x] 显示试用后价格
- [x] 显示自动续订条款
- [x] 提供恢复购买功能
- [x] 链接到使用条款
- [x] 链接到隐私政策
- [x] 说明如何取消订阅

### 5.2 必需法律文案

**免费试用披露 (年付方案):**

> "After your free trial ends, you will be charged $49.99/year unless you cancel at least 24 hours before the trial ends. Subscription automatically renews unless canceled at least 24 hours before the end of the current period."

**标准订阅披露 (月付方案):**

> "Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase."

---

## 6. 分析事件

### 6.1 关键事件

| 事件名称 | 触发时机 | 参数 |
|----------|----------|------|
| `paywall_viewed` | 打开付费墙 | source |
| `period_selected` | 选择周期 | period (monthly/yearly) |
| `purchase_initiated` | 点击订阅按钮 | period, price, has_trial |
| `purchase_completed` | 购买成功 | period, price, transaction_id |
| `purchase_failed` | 购买失败 | period, error |
| `purchase_cancelled` | 用户取消 | period |
| `trial_started` | 开始免费试用 | trial_days |
| `restore_initiated` | 点击恢复购买 | - |
| `restore_completed` | 恢复成功 | restored_tier |
| `limit_reached` | 达到使用限制 | feature, limit |
| `upgrade_prompt_shown` | 显示升级提示 | feature, source |

### 6.2 关键指标 KPI

| 指标 | 描述 | 目标 |
|------|------|------|
| 付费墙转化率 | 展示 → 购买 | > 5% |
| 试用转化率 | 试用开始 → 付费 | > 60% |
| 年付占比 | 年付用户 / 总付费用户 | > 70% |
| 续订率 | 到期后续订比例 | > 85% |
| ARPU | 平均每用户收入 | > $3/月 |

---

## 7. 实现计划

### Phase 1 - 核心功能 ✅ 已完成

1. [x] 更新 SubscriptionTier 模型 (移除 Premium 相关 UI)
2. [x] 更新 PaywallView (单一 Pro 层级)
3. [x] 更新 SubscriptionStatusView (使用量进度条)
4. [x] 添加 7 天免费试用支持
5. [x] 实现 Shimmer 动画效果
6. [x] 更新本地化文案

### Phase 2 - 权限系统 ✅ 已完成

1. [x] 实现 FeatureGateService
2. [x] 实现 UsageTracker
3. [x] 集成到所有功能模块
4. [ ] 添加单元测试

### Phase 3 - Webhook 与集成 ✅ 已完成

1. [x] 后端 Apple Webhook 处理 (`/webhooks/apple`)
2. [x] 处理订阅生命周期事件 (DID_RENEW, EXPIRED, REFUND 等)
3. [x] 宽限期处理 (GRACE_PERIOD)
4. [x] 续订状态变更处理

### Phase 4 - 测试与发布 (进行中)

1. [ ] App Store Connect 产品配置
2. [ ] Sandbox 测试
3. [ ] TestFlight 测试
4. [ ] 提交审核

---

## 8. 待办清单

- [x] 确认定价: Pro $7.99/月, $49.99/年
- [x] 确认层级: 简化为单一 Pro
- [x] 确认试用: 7天免费试用 (年付)
- [x] 确认功能: Pro 包含离线阅读
- [x] 后端 API 实现 (SubscriptionsService)
- [x] iOS 代码实现 (SubscriptionManager, PaywallView)
- [x] Apple Webhook 处理器
- [x] FeatureGateService 实现
- [x] UsageTracker 实现
- [x] Shimmer 动画效果
- [x] 本地化文案集成
- [ ] App Store Connect 配置
- [ ] 测试验证
- [ ] 提交审核

---

*文档版本: 2.2*
*创建日期: 2025-12-21*
*最后更新: 2025-12-24*
*状态: 后端已实现，iOS 已完成，Webhook 已实现，待 App Store Connect 配置*
