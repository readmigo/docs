# Readmigo 用户身份与权限系统技术方案

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.0 |
| 创建日期 | 2025-12-21 |
| 状态 | 待审核 |

---

## 1. 概述

### 1.1 目标

建立完整的用户身份与权限控制系统，确保：
1. 不同层级用户获得对应的功能和资源访问权限
2. 权限控制在前端和后端双重验证
3. 超出限制时提供友好的升级引导
4. 系统具备良好的扩展性以支持未来 Premium 层级

### 1.2 用户层级定义

| 层级 | 定价 | 状态 |
|------|------|------|
| **Free** | 免费 | 当前实现 |
| **Pro** | $7.99/月 或 $49.99/年 | 当前实现 |
| **Premium** | 预留 | 未来扩展 |

---

## 2. 用户身份与权限矩阵

### 2.1 完整权限矩阵

| 功能模块 | 功能点 | Free | Pro | Premium (预留) |
|----------|--------|------|-----|----------------|
| **书籍访问** | 免费书籍阅读 | ✅ 10本 | ✅ 全部 | ✅ 全部 |
| | Pro书籍阅读 | ❌ | ✅ 全部 | ✅ 全部 |
| | 书籍搜索 | ✅ | ✅ | ✅ |
| | 阅读进度同步 | ✅ | ✅ | ✅ |
| **AI 功能** | 单词解释 | ✅ 5次/天 | ✅ 无限 | ✅ 无限 |
| | 句子简化 | ✅ 5次/天 | ✅ 无限 | ✅ 无限 |
| | 段落翻译 | ✅ 5次/天 | ✅ 无限 | ✅ 无限 |
| | 语法分析 | ❌ | ✅ | ✅ |
| | AI 模型 | GPT-3.5 | GPT-3.5 | GPT-4/Claude |
| **词汇学习** | 保存单词 | ✅ 50个 | ✅ 无限 | ✅ 无限 |
| | 间隔重复复习 | ❌ | ✅ | ✅ |
| | 词汇导出 | ❌ | ✅ | ✅ |
| **离线功能** | 书籍下载 | ❌ | ✅ | ✅ |
| | 离线阅读 | ❌ | ✅ | ✅ |
| | 下载数量 | - | 10本 | 无限 |
| **阅读统计** | 基础统计 | ✅ | ✅ | ✅ |
| | 详细报告 | ❌ | ✅ | ✅ |
| | 学习趋势 | ❌ | ✅ | ✅ |
| **社交功能** | 明信片模板 | 基础3个 | 全部 | 全部 |
| | 社区浏览 | ✅ | ✅ | ✅ |
| | 社区发帖 | ✅ | ✅ | ✅ |
| **AI 对话** | 语音聊天 | ❌ | ✅ 30分钟/月 | ✅ 无限 |
| | 视频聊天 | ❌ | ❌ | ✅ |
| **客服支持** | 邮件支持 | ✅ | ✅ | ✅ |
| | 优先响应 | ❌ | ❌ | ✅ 24小时内 |
| **其他** | 徽章系统 | 基础徽章 | 全部徽章 | 全部徽章 |
| | 新功能抢先 | ❌ | ❌ | ✅ |

### 2.2 限制数值定义

```swift
// FeatureLimits.swift

struct FeatureLimits {
    // AI 使用限制
    static let freeAICallsPerDay = 5
    static let proAICallsPerDay = Int.max  // 无限

    // 词汇限制
    static let freeVocabularyLimit = 50
    static let proVocabularyLimit = Int.max  // 无限

    // 书籍限制
    static let freeBooksLimit = 10
    static let proBooksLimit = Int.max  // 全部

    // 离线下载限制
    static let freeOfflineLimit = 0
    static let proOfflineLimit = 10
    static let premiumOfflineLimit = Int.max  // 无限

    // 语音聊天限制 (分钟/月)
    static let freeVoiceChatMinutes = 0
    static let proVoiceChatMinutes = 30
    static let premiumVoiceChatMinutes = Int.max  // 无限

    // 明信片模板
    static let freeTemplatesCount = 3
}
```

---

## 3. 技术架构

### 3.1 权限检查架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         iOS App                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Feature    │───▶│  FeatureGate │───▶│ Subscription │       │
│  │    Views     │    │   Service    │    │   Manager    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Paywall    │    │    Usage     │    │   StoreKit   │       │
│  │    View      │    │   Tracker    │    │   Manager    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                                    │
└─────────────────────────────│────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Subscription │    │    Usage     │    │   Feature    │       │
│  │   Service    │    │   Service    │    │    Flags     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         └───────────────────┼────────────────────┘               │
│                             ▼                                    │
│                    ┌──────────────┐                              │
│                    │   Database   │                              │
│                    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 核心组件

#### 3.2.1 FeatureGate Service (新增)

负责集中管理所有功能的权限检查。

```swift
// FeatureGateService.swift

import Foundation

@MainActor
class FeatureGateService: ObservableObject {
    static let shared = FeatureGateService()

    private let subscriptionManager = SubscriptionManager.shared
    private let usageTracker = UsageTracker.shared

    // MARK: - Feature Access Checks

    /// 检查是否可以访问指定书籍
    func canAccessBook(_ book: Book) -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        // Pro 用户可以访问所有书籍
        if tier == .pro || tier == .premium {
            return .allowed
        }

        // Free 用户只能访问免费书籍
        if book.isFree {
            return .allowed
        }

        return .restricted(reason: .requiresSubscription,
                          feature: .bookAccess,
                          upgradeMessage: "Upgrade to Pro to access all 200+ books")
    }

    /// 检查是否可以使用 AI 功能
    func canUseAI() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        // Pro/Premium 无限制
        if tier == .pro || tier == .premium {
            return .allowed
        }

        // Free 用户检查每日限制
        let todayUsage = usageTracker.aiCallsToday
        if todayUsage >= FeatureLimits.freeAICallsPerDay {
            return .restricted(reason: .dailyLimitReached,
                             feature: .aiExplanation,
                             upgradeMessage: "You've used all 5 AI explanations today. Upgrade to Pro for unlimited access.")
        }

        return .allowedWithLimit(remaining: FeatureLimits.freeAICallsPerDay - todayUsage,
                                 limit: FeatureLimits.freeAICallsPerDay)
    }

    /// 检查是否可以保存词汇
    func canSaveVocabulary() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .pro || tier == .premium {
            return .allowed
        }

        let currentCount = usageTracker.vocabularyCount
        if currentCount >= FeatureLimits.freeVocabularyLimit {
            return .restricted(reason: .limitReached,
                             feature: .vocabularySaving,
                             upgradeMessage: "You've reached the 50 word limit. Upgrade to Pro for unlimited vocabulary.")
        }

        return .allowedWithLimit(remaining: FeatureLimits.freeVocabularyLimit - currentCount,
                                 limit: FeatureLimits.freeVocabularyLimit)
    }

    /// 检查是否可以下载离线内容
    func canDownloadOffline() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .free {
            return .restricted(reason: .requiresSubscription,
                             feature: .offlineReading,
                             upgradeMessage: "Offline reading is a Pro feature. Upgrade to download books.")
        }

        let downloadedCount = usageTracker.offlineDownloadCount
        let limit = tier == .premium ? FeatureLimits.premiumOfflineLimit : FeatureLimits.proOfflineLimit

        if downloadedCount >= limit && limit != Int.max {
            return .restricted(reason: .limitReached,
                             feature: .offlineReading,
                             upgradeMessage: "You've reached the download limit of \(limit) books.")
        }

        return .allowed
    }

    /// 检查是否可以使用间隔重复
    func canUseSpacedRepetition() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .free {
            return .restricted(reason: .requiresSubscription,
                             feature: .spacedRepetition,
                             upgradeMessage: "Spaced repetition is a Pro feature. Upgrade to unlock smart review.")
        }

        return .allowed
    }

    /// 检查是否可以使用语音聊天
    func canUseVoiceChat() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .free {
            return .restricted(reason: .requiresSubscription,
                             feature: .voiceChat,
                             upgradeMessage: "Voice chat is a Pro feature. Upgrade to practice speaking.")
        }

        if tier == .pro {
            let usedMinutes = usageTracker.voiceChatMinutesThisMonth
            let remaining = FeatureLimits.proVoiceChatMinutes - usedMinutes

            if remaining <= 0 {
                return .restricted(reason: .monthlyLimitReached,
                                 feature: .voiceChat,
                                 upgradeMessage: "You've used all 30 minutes this month. Upgrade to Premium for unlimited voice chat.")
            }

            return .allowedWithLimit(remaining: remaining, limit: FeatureLimits.proVoiceChatMinutes)
        }

        // Premium: 无限制
        return .allowed
    }

    /// 检查是否可以使用视频聊天
    func canUseVideoChat() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier != .premium {
            return .restricted(reason: .requiresSubscription,
                             feature: .videoChat,
                             upgradeMessage: "Video chat is a Premium feature. Upgrade to unlock face-to-face practice.")
        }

        return .allowed
    }

    /// 检查是否可以使用高级 AI 模型
    func canUseAdvancedAI() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier != .premium {
            return .restricted(reason: .requiresSubscription,
                             feature: .advancedAI,
                             upgradeMessage: "Advanced AI (GPT-4, Claude) is a Premium feature.")
        }

        return .allowed
    }

    /// 检查明信片模板访问
    func canAccessTemplate(_ template: PostcardTemplate) -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if !template.isPremium {
            return .allowed
        }

        if tier == .pro || tier == .premium {
            return .allowed
        }

        return .restricted(reason: .requiresSubscription,
                         feature: .premiumTemplates,
                         upgradeMessage: "This template requires Pro subscription.")
    }

    /// 检查是否可以查看详细统计
    func canViewDetailedStats() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .free {
            return .restricted(reason: .requiresSubscription,
                             feature: .detailedStats,
                             upgradeMessage: "Detailed reading statistics is a Pro feature.")
        }

        return .allowed
    }

    /// 检查是否可以导出词汇
    func canExportVocabulary() -> FeatureAccessResult {
        let tier = subscriptionManager.currentTier

        if tier == .free {
            return .restricted(reason: .requiresSubscription,
                             feature: .vocabularyExport,
                             upgradeMessage: "Vocabulary export is a Pro feature.")
        }

        return .allowed
    }
}

// MARK: - Supporting Types

enum FeatureAccessResult {
    case allowed
    case allowedWithLimit(remaining: Int, limit: Int)
    case restricted(reason: RestrictionReason, feature: Feature, upgradeMessage: String)

    var isAllowed: Bool {
        switch self {
        case .allowed, .allowedWithLimit:
            return true
        case .restricted:
            return false
        }
    }
}

enum RestrictionReason {
    case requiresSubscription
    case dailyLimitReached
    case monthlyLimitReached
    case limitReached
}

enum Feature: String, CaseIterable {
    case bookAccess = "book_access"
    case aiExplanation = "ai_explanation"
    case vocabularySaving = "vocabulary_saving"
    case offlineReading = "offline_reading"
    case spacedRepetition = "spaced_repetition"
    case voiceChat = "voice_chat"
    case videoChat = "video_chat"
    case advancedAI = "advanced_ai"
    case premiumTemplates = "premium_templates"
    case detailedStats = "detailed_stats"
    case vocabularyExport = "vocabulary_export"

    var displayName: String {
        switch self {
        case .bookAccess: return "Book Access"
        case .aiExplanation: return "AI Explanations"
        case .vocabularySaving: return "Vocabulary Saving"
        case .offlineReading: return "Offline Reading"
        case .spacedRepetition: return "Spaced Repetition"
        case .voiceChat: return "Voice Chat"
        case .videoChat: return "Video Chat"
        case .advancedAI: return "Advanced AI"
        case .premiumTemplates: return "Premium Templates"
        case .detailedStats: return "Detailed Statistics"
        case .vocabularyExport: return "Vocabulary Export"
        }
    }
}
```

#### 3.2.2 UsageTracker (新增)

追踪用户使用情况。

```swift
// UsageTracker.swift

import Foundation

@MainActor
class UsageTracker: ObservableObject {
    static let shared = UsageTracker()

    // MARK: - Published Properties

    @Published private(set) var aiCallsToday: Int = 0
    @Published private(set) var vocabularyCount: Int = 0
    @Published private(set) var offlineDownloadCount: Int = 0
    @Published private(set) var voiceChatMinutesThisMonth: Int = 0

    // MARK: - Storage Keys

    private let aiCallsKey = "usage_ai_calls"
    private let aiCallsDateKey = "usage_ai_calls_date"
    private let voiceChatKey = "usage_voice_chat"
    private let voiceChatMonthKey = "usage_voice_chat_month"

    // MARK: - Init

    private init() {
        loadUsage()
    }

    // MARK: - Load Usage

    func loadUsage() {
        // 加载 AI 调用次数 (检查是否是今天)
        let savedDate = UserDefaults.standard.string(forKey: aiCallsDateKey) ?? ""
        let today = dateString(from: Date())

        if savedDate == today {
            aiCallsToday = UserDefaults.standard.integer(forKey: aiCallsKey)
        } else {
            // 新的一天，重置计数
            aiCallsToday = 0
            UserDefaults.standard.set(today, forKey: aiCallsDateKey)
            UserDefaults.standard.set(0, forKey: aiCallsKey)
        }

        // 加载语音聊天分钟数 (检查是否是本月)
        let savedMonth = UserDefaults.standard.string(forKey: voiceChatMonthKey) ?? ""
        let currentMonth = monthString(from: Date())

        if savedMonth == currentMonth {
            voiceChatMinutesThisMonth = UserDefaults.standard.integer(forKey: voiceChatKey)
        } else {
            // 新的月份，重置计数
            voiceChatMinutesThisMonth = 0
            UserDefaults.standard.set(currentMonth, forKey: voiceChatMonthKey)
            UserDefaults.standard.set(0, forKey: voiceChatKey)
        }
    }

    // MARK: - Sync from Server

    func syncFromServer() async {
        do {
            let response: UsageResponse = try await APIClient.shared.request(
                endpoint: "/usage/current"
            )

            await MainActor.run {
                self.aiCallsToday = response.aiCallsToday
                self.vocabularyCount = response.vocabularyCount
                self.offlineDownloadCount = response.offlineDownloadCount
                self.voiceChatMinutesThisMonth = response.voiceChatMinutesThisMonth
            }
        } catch {
            print("Failed to sync usage: \(error)")
        }
    }

    // MARK: - Record Usage

    func recordAICall() {
        aiCallsToday += 1
        UserDefaults.standard.set(aiCallsToday, forKey: aiCallsKey)

        // 异步同步到服务器
        Task {
            try? await APIClient.shared.request(
                endpoint: "/usage/ai",
                method: .post
            ) as EmptyResponse
        }
    }

    func recordVoiceChatMinutes(_ minutes: Int) {
        voiceChatMinutesThisMonth += minutes
        UserDefaults.standard.set(voiceChatMinutesThisMonth, forKey: voiceChatKey)

        Task {
            try? await APIClient.shared.request(
                endpoint: "/usage/voice-chat",
                method: .post,
                body: ["minutes": minutes]
            ) as EmptyResponse
        }
    }

    func updateVocabularyCount(_ count: Int) {
        vocabularyCount = count
    }

    func updateOfflineDownloadCount(_ count: Int) {
        offlineDownloadCount = count
    }

    // MARK: - Helpers

    private func dateString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func monthString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        return formatter.string(from: date)
    }
}

// MARK: - Response Types

struct UsageResponse: Codable {
    let aiCallsToday: Int
    let vocabularyCount: Int
    let offlineDownloadCount: Int
    let voiceChatMinutesThisMonth: Int
}

struct EmptyResponse: Codable {}
```

#### 3.2.3 FeatureLimit View Modifier (新增)

用于在 UI 中显示使用限制的修饰器。

```swift
// FeatureLimitModifier.swift

import SwiftUI

struct FeatureLimitModifier: ViewModifier {
    let feature: Feature
    let showUpgradeOnRestriction: Bool

    @StateObject private var featureGate = FeatureGateService.shared
    @State private var showPaywall = false

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .topTrailing) {
                limitBadge
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
    }

    @ViewBuilder
    private var limitBadge: some View {
        let result = checkAccess()

        switch result {
        case .allowedWithLimit(let remaining, let limit):
            UsageBadge(remaining: remaining, limit: limit)
                .padding(8)

        case .restricted:
            Button(action: { showPaywall = true }) {
                Image(systemName: "lock.fill")
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(6)
                    .background(Color.orange)
                    .clipShape(Circle())
            }
            .padding(8)

        case .allowed:
            EmptyView()
        }
    }

    private func checkAccess() -> FeatureAccessResult {
        switch feature {
        case .aiExplanation:
            return featureGate.canUseAI()
        case .vocabularySaving:
            return featureGate.canSaveVocabulary()
        case .voiceChat:
            return featureGate.canUseVoiceChat()
        default:
            return .allowed
        }
    }
}

struct UsageBadge: View {
    let remaining: Int
    let limit: Int

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "flame.fill")
                .font(.caption2)
            Text("\(remaining)/\(limit)")
                .font(.caption2)
                .fontWeight(.medium)
        }
        .foregroundColor(badgeColor)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(badgeColor.opacity(0.15))
        .cornerRadius(8)
    }

    private var badgeColor: Color {
        let percentage = Double(remaining) / Double(limit)
        if percentage <= 0.2 {
            return .red
        } else if percentage <= 0.5 {
            return .orange
        } else {
            return .green
        }
    }
}

extension View {
    func featureLimit(_ feature: Feature, showUpgradeOnRestriction: Bool = true) -> some View {
        modifier(FeatureLimitModifier(feature: feature, showUpgradeOnRestriction: showUpgradeOnRestriction))
    }
}
```

---

## 4. 各功能模块实现

### 4.1 书籍访问控制

#### 4.1.1 Book 模型更新

```swift
// Book.swift 更新

struct Book: Identifiable, Codable {
    let id: String
    let title: String
    let author: String
    // ... 其他字段

    // 新增字段
    let accessTier: BookAccessTier
    let isFree: Bool

    enum BookAccessTier: String, Codable {
        case free = "FREE"
        case pro = "PRO"
        case premium = "PREMIUM"
    }
}
```

#### 4.1.2 BookDetailView 权限检查

```swift
// BookDetailView.swift 更新

struct BookDetailView: View {
    let book: Book

    @StateObject private var featureGate = FeatureGateService.shared
    @State private var showPaywall = false

    var body: some View {
        ScrollView {
            // 书籍信息展示
            BookInfoSection(book: book)

            // 根据权限显示不同内容
            switch featureGate.canAccessBook(book) {
            case .allowed, .allowedWithLimit:
                // 可以访问 - 显示完整内容
                BookContentSection(book: book)
                StartReadingButton(book: book)

            case .restricted(_, _, let message):
                // 无法访问 - 显示升级提示
                LockedBookOverlay(
                    book: book,
                    message: message,
                    onUpgrade: { showPaywall = true }
                )
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }
}

struct LockedBookOverlay: View {
    let book: Book
    let message: String
    let onUpgrade: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            // 模糊预览
            BookPreviewBlurred(book: book)

            // 锁定提示
            VStack(spacing: 12) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.secondary)

                Text("Pro Content")
                    .font(.headline)

                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)

                Button(action: onUpgrade) {
                    HStack {
                        Image(systemName: "sparkles")
                        Text("Upgrade to Pro")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .padding()
        }
    }
}
```

### 4.2 AI 功能权限控制

#### 4.2.1 AIService 更新

```swift
// AIService.swift 更新

class AIService: ObservableObject {
    static let shared = AIService()

    private let featureGate = FeatureGateService.shared
    private let usageTracker = UsageTracker.shared

    // MARK: - AI 解释功能

    func explainWord(_ word: String, context: String) async throws -> AIExplanation {
        // 检查权限
        let accessResult = await featureGate.canUseAI()

        switch accessResult {
        case .restricted(_, _, let message):
            throw AIError.limitReached(message)

        case .allowed, .allowedWithLimit:
            // 执行 AI 调用
            let result = try await performAICall(
                endpoint: "/ai/explain",
                body: ["word": word, "context": context]
            )

            // 记录使用
            await usageTracker.recordAICall()

            return result
        }
    }

    func simplifySentence(_ sentence: String) async throws -> String {
        let accessResult = await featureGate.canUseAI()

        switch accessResult {
        case .restricted(_, _, let message):
            throw AIError.limitReached(message)

        case .allowed, .allowedWithLimit:
            let result: SimplifyResponse = try await APIClient.shared.request(
                endpoint: "/ai/simplify",
                method: .post,
                body: ["sentence": sentence]
            )

            await usageTracker.recordAICall()

            return result.simplified
        }
    }

    // ... 其他 AI 方法类似
}

enum AIError: Error, LocalizedError {
    case limitReached(String)
    case networkError(String)

    var errorDescription: String? {
        switch self {
        case .limitReached(let message):
            return message
        case .networkError(let message):
            return message
        }
    }
}
```

#### 4.2.2 AI 使用限制 UI

```swift
// AIUsageBanner.swift

struct AIUsageBanner: View {
    @StateObject private var featureGate = FeatureGateService.shared
    @StateObject private var usageTracker = UsageTracker.shared
    @State private var showPaywall = false

    var body: some View {
        let result = featureGate.canUseAI()

        switch result {
        case .allowedWithLimit(let remaining, let limit):
            HStack {
                Image(systemName: remaining <= 1 ? "exclamationmark.triangle.fill" : "sparkles")
                    .foregroundColor(remaining <= 1 ? .orange : .accentColor)

                Text("\(remaining) of \(limit) AI explanations remaining today")
                    .font(.caption)

                Spacer()

                if remaining <= 2 {
                    Button("Upgrade") {
                        showPaywall = true
                    }
                    .font(.caption)
                    .fontWeight(.semibold)
                }
            }
            .padding(12)
            .background(remaining <= 1 ? Color.orange.opacity(0.1) : Color.accentColor.opacity(0.1))
            .cornerRadius(8)
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }

        case .restricted(_, _, let message):
            HStack {
                Image(systemName: "lock.fill")
                    .foregroundColor(.red)

                Text(message)
                    .font(.caption)

                Spacer()

                Button("Upgrade") {
                    showPaywall = true
                }
                .font(.caption)
                .fontWeight(.semibold)
            }
            .padding(12)
            .background(Color.red.opacity(0.1))
            .cornerRadius(8)
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }

        case .allowed:
            EmptyView()
        }
    }
}
```

### 4.3 词汇保存权限控制

#### 4.3.1 VocabularyManager 更新

```swift
// VocabularyManager.swift 更新

class VocabularyManager: ObservableObject {
    static let shared = VocabularyManager()

    @Published var words: [VocabularyWord] = []

    private let featureGate = FeatureGateService.shared
    private let usageTracker = UsageTracker.shared

    // MARK: - Add Word

    func addWord(_ word: VocabularyWord) async throws {
        // 检查权限
        let accessResult = featureGate.canSaveVocabulary()

        switch accessResult {
        case .restricted(_, _, let message):
            throw VocabularyError.limitReached(message)

        case .allowed, .allowedWithLimit:
            // 添加单词
            let response: AddWordResponse = try await APIClient.shared.request(
                endpoint: "/vocabulary",
                method: .post,
                body: word
            )

            // 更新本地
            await MainActor.run {
                words.append(response.word)
                usageTracker.updateVocabularyCount(words.count)
            }
        }
    }

    // MARK: - Export Vocabulary

    func exportVocabulary(format: ExportFormat) async throws -> URL {
        // 检查导出权限
        let accessResult = featureGate.canExportVocabulary()

        switch accessResult {
        case .restricted(_, _, let message):
            throw VocabularyError.featureRestricted(message)

        case .allowed, .allowedWithLimit:
            // 执行导出
            return try await performExport(format: format)
        }
    }
}

enum VocabularyError: Error, LocalizedError {
    case limitReached(String)
    case featureRestricted(String)

    var errorDescription: String? {
        switch self {
        case .limitReached(let message), .featureRestricted(let message):
            return message
        }
    }
}
```

### 4.4 离线下载权限控制

#### 4.4.1 OfflineManager 更新

```swift
// OfflineManager.swift 更新

class OfflineManager: ObservableObject {
    static let shared = OfflineManager()

    @Published var downloadedBooks: [OfflineBook] = []
    @Published var downloadProgress: [String: Double] = [:]

    private let featureGate = FeatureGateService.shared
    private let usageTracker = UsageTracker.shared

    // MARK: - Download Book

    func downloadBook(_ book: Book) async throws {
        // 检查离线下载权限
        let accessResult = featureGate.canDownloadOffline()

        switch accessResult {
        case .restricted(_, _, let message):
            throw OfflineError.featureRestricted(message)

        case .allowed, .allowedWithLimit:
            // 执行下载
            try await performDownload(book)

            // 更新计数
            await MainActor.run {
                usageTracker.updateOfflineDownloadCount(downloadedBooks.count)
            }
        }
    }

    // MARK: - Check if can download

    func canDownload(_ book: Book) -> Bool {
        return featureGate.canDownloadOffline().isAllowed
    }
}

enum OfflineError: Error, LocalizedError {
    case featureRestricted(String)
    case downloadFailed(String)

    var errorDescription: String? {
        switch self {
        case .featureRestricted(let message), .downloadFailed(let message):
            return message
        }
    }
}
```

#### 4.4.2 下载按钮 UI

```swift
// DownloadButton.swift

struct DownloadButton: View {
    let book: Book

    @StateObject private var featureGate = FeatureGateService.shared
    @StateObject private var offlineManager = OfflineManager.shared
    @State private var showPaywall = false
    @State private var isDownloading = false

    var body: some View {
        let accessResult = featureGate.canDownloadOffline()

        Button(action: handleTap) {
            HStack {
                if isDownloading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                } else {
                    Image(systemName: buttonIcon)
                }
                Text(buttonText)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(buttonBackground)
            .foregroundColor(buttonForeground)
            .cornerRadius(12)
        }
        .disabled(isDownloading)
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }

    private var buttonIcon: String {
        switch featureGate.canDownloadOffline() {
        case .restricted:
            return "lock.fill"
        case .allowed, .allowedWithLimit:
            return offlineManager.downloadedBooks.contains(where: { $0.bookId == book.id })
                ? "checkmark.circle.fill"
                : "arrow.down.circle"
        }
    }

    private var buttonText: String {
        switch featureGate.canDownloadOffline() {
        case .restricted:
            return "Pro Feature"
        case .allowed, .allowedWithLimit:
            return offlineManager.downloadedBooks.contains(where: { $0.bookId == book.id })
                ? "Downloaded"
                : "Download for Offline"
        }
    }

    private var buttonBackground: Color {
        switch featureGate.canDownloadOffline() {
        case .restricted:
            return Color.secondary.opacity(0.2)
        case .allowed, .allowedWithLimit:
            return Color.accentColor
        }
    }

    private var buttonForeground: Color {
        switch featureGate.canDownloadOffline() {
        case .restricted:
            return .secondary
        case .allowed, .allowedWithLimit:
            return .white
        }
    }

    private func handleTap() {
        switch featureGate.canDownloadOffline() {
        case .restricted:
            showPaywall = true
        case .allowed, .allowedWithLimit:
            Task {
                isDownloading = true
                try? await offlineManager.downloadBook(book)
                isDownloading = false
            }
        }
    }
}
```

### 4.5 间隔重复权限控制

```swift
// SpacedRepetitionView.swift

struct SpacedRepetitionView: View {
    @StateObject private var featureGate = FeatureGateService.shared
    @State private var showPaywall = false

    var body: some View {
        let accessResult = featureGate.canUseSpacedRepetition()

        switch accessResult {
        case .restricted(_, _, let message):
            FeatureLockedView(
                icon: "brain.head.profile",
                title: "Smart Review",
                message: message,
                onUpgrade: { showPaywall = true }
            )
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }

        case .allowed, .allowedWithLimit:
            SpacedRepetitionContentView()
        }
    }
}

struct FeatureLockedView: View {
    let icon: String
    let title: String
    let message: String
    let onUpgrade: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text(title)
                .font(.title2)
                .fontWeight(.bold)

            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button(action: onUpgrade) {
                HStack {
                    Image(systemName: "sparkles")
                    Text("Upgrade to Pro")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(
                    LinearGradient(
                        colors: [Color.purple, Color.pink],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .padding(.horizontal, 40)

            Spacer()
        }
    }
}
```

---

## 5. 后端 API 设计

### 5.1 权限验证中间件

```typescript
// middleware/subscriptionGuard.ts

import { Request, Response, NextFunction } from 'express';

export enum RequiredTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export function requireSubscription(minTier: RequiredTier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tierOrder = { FREE: 0, PRO: 1, PREMIUM: 2 };
    const userTierLevel = tierOrder[user.subscriptionTier] || 0;
    const requiredLevel = tierOrder[minTier];

    if (userTierLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Subscription required',
        requiredTier: minTier,
        currentTier: user.subscriptionTier,
        message: `This feature requires ${minTier} subscription`,
      });
    }

    next();
  };
}
```

### 5.2 使用限制中间件

```typescript
// middleware/usageLimit.ts

import { Request, Response, NextFunction } from 'express';
import { UsageService } from '../services/usage.service';

export function checkUsageLimit(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const usageService = new UsageService();

    const canUse = await usageService.checkLimit(user.id, feature);

    if (!canUse.allowed) {
      return res.status(429).json({
        error: 'Usage limit reached',
        feature,
        limit: canUse.limit,
        used: canUse.used,
        resetAt: canUse.resetAt,
        upgradeMessage: canUse.upgradeMessage,
      });
    }

    // 记录使用
    await usageService.recordUsage(user.id, feature);

    next();
  };
}
```

### 5.3 API 端点权限配置

```typescript
// routes/api.ts

import express from 'express';
import { requireSubscription, RequiredTier } from '../middleware/subscriptionGuard';
import { checkUsageLimit } from '../middleware/usageLimit';

const router = express.Router();

// 书籍 - 基于书籍的 accessTier 检查
router.get('/books/:id', booksController.getBook);
router.get('/books/:id/content', booksController.getBookContent); // 内部检查

// AI 功能 - Free 用户有每日限制
router.post('/ai/explain', checkUsageLimit('ai_calls'), aiController.explain);
router.post('/ai/simplify', checkUsageLimit('ai_calls'), aiController.simplify);
router.post('/ai/translate', checkUsageLimit('ai_calls'), aiController.translate);

// 高级 AI - 仅 Premium
router.post('/ai/advanced/explain',
  requireSubscription(RequiredTier.PREMIUM),
  aiController.advancedExplain
);

// 词汇 - Free 用户有数量限制
router.post('/vocabulary', checkUsageLimit('vocabulary'), vocabularyController.add);
router.get('/vocabulary/export',
  requireSubscription(RequiredTier.PRO),
  vocabularyController.export
);

// 离线 - Pro 以上
router.post('/books/:id/download',
  requireSubscription(RequiredTier.PRO),
  checkUsageLimit('offline_downloads'),
  offlineController.download
);

// 间隔重复 - Pro 以上
router.get('/spaced-repetition',
  requireSubscription(RequiredTier.PRO),
  spacedRepetitionController.getCards
);

// 语音聊天 - Pro 以上，有分钟限制
router.post('/voice-chat/session',
  requireSubscription(RequiredTier.PRO),
  checkUsageLimit('voice_chat'),
  voiceChatController.createSession
);

// 视频聊天 - Premium only
router.post('/video-chat/session',
  requireSubscription(RequiredTier.PREMIUM),
  videoChatController.createSession
);

// 使用情况查询
router.get('/usage/current', usageController.getCurrent);

export default router;
```

### 5.4 Usage Service

```typescript
// services/usage.service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UsageCheckResult {
  allowed: boolean;
  limit: number;
  used: number;
  resetAt?: Date;
  upgradeMessage?: string;
}

const LIMITS = {
  FREE: {
    ai_calls: { daily: 5 },
    vocabulary: { total: 50 },
    offline_downloads: { total: 0 },
    voice_chat: { monthly: 0 },
  },
  PRO: {
    ai_calls: { daily: Infinity },
    vocabulary: { total: Infinity },
    offline_downloads: { total: 10 },
    voice_chat: { monthly: 30 }, // 30 minutes
  },
  PREMIUM: {
    ai_calls: { daily: Infinity },
    vocabulary: { total: Infinity },
    offline_downloads: { total: Infinity },
    voice_chat: { monthly: Infinity },
  },
};

export class UsageService {
  async checkLimit(userId: string, feature: string): Promise<UsageCheckResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const tier = user?.subscription?.tier || 'FREE';
    const limits = LIMITS[tier];
    const featureLimit = limits[feature];

    if (!featureLimit) {
      return { allowed: true, limit: Infinity, used: 0 };
    }

    // 检查每日限制
    if (featureLimit.daily !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usage = await prisma.usageLog.count({
        where: {
          userId,
          feature,
          createdAt: { gte: today },
        },
      });

      if (featureLimit.daily !== Infinity && usage >= featureLimit.daily) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
          allowed: false,
          limit: featureLimit.daily,
          used: usage,
          resetAt: tomorrow,
          upgradeMessage: `You've used all ${featureLimit.daily} ${feature.replace('_', ' ')} today. Upgrade to Pro for unlimited access.`,
        };
      }

      return { allowed: true, limit: featureLimit.daily, used: usage };
    }

    // 检查月度限制
    if (featureLimit.monthly !== undefined) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const usage = await prisma.usageLog.aggregate({
        where: {
          userId,
          feature,
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      });

      const used = usage._sum.amount || 0;

      if (featureLimit.monthly !== Infinity && used >= featureLimit.monthly) {
        const nextMonth = new Date(monthStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        return {
          allowed: false,
          limit: featureLimit.monthly,
          used,
          resetAt: nextMonth,
          upgradeMessage: `You've used all ${featureLimit.monthly} minutes this month.`,
        };
      }

      return { allowed: true, limit: featureLimit.monthly, used };
    }

    // 检查总量限制
    if (featureLimit.total !== undefined) {
      const count = await prisma.usageLog.count({
        where: { userId, feature },
      });

      if (featureLimit.total !== Infinity && count >= featureLimit.total) {
        return {
          allowed: false,
          limit: featureLimit.total,
          used: count,
          upgradeMessage: `You've reached the limit of ${featureLimit.total}. Upgrade to Pro for unlimited access.`,
        };
      }

      return { allowed: true, limit: featureLimit.total, used: count };
    }

    return { allowed: true, limit: Infinity, used: 0 };
  }

  async recordUsage(userId: string, feature: string, amount: number = 1): Promise<void> {
    await prisma.usageLog.create({
      data: {
        userId,
        feature,
        amount,
      },
    });
  }

  async getCurrentUsage(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [aiCallsToday, vocabularyCount, offlineCount, voiceChatMinutes] = await Promise.all([
      prisma.usageLog.count({
        where: { userId, feature: 'ai_calls', createdAt: { gte: today } },
      }),
      prisma.vocabulary.count({
        where: { userId },
      }),
      prisma.offlineDownload.count({
        where: { userId },
      }),
      prisma.usageLog.aggregate({
        where: { userId, feature: 'voice_chat', createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    return {
      aiCallsToday,
      vocabularyCount,
      offlineDownloadCount: offlineCount,
      voiceChatMinutesThisMonth: voiceChatMinutes._sum.amount || 0,
    };
  }
}
```

---

## 6. 数据库设计

### 6.1 用户订阅表

```sql
-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE, PRO, PREMIUM
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD
  product_id VARCHAR(100),
  original_transaction_id VARCHAR(100),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  will_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
```

### 6.2 使用量日志表

```sql
-- usage_logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  feature VARCHAR(50) NOT NULL, -- ai_calls, vocabulary, offline_downloads, voice_chat
  amount INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_feature ON usage_logs(user_id, feature);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_user_feature_date ON usage_logs(user_id, feature, created_at);
```

### 6.3 书籍访问层级

```sql
-- 更新 books 表
ALTER TABLE books ADD COLUMN access_tier VARCHAR(20) DEFAULT 'FREE';
ALTER TABLE books ADD COLUMN is_free BOOLEAN DEFAULT true;

-- 创建索引
CREATE INDEX idx_books_access_tier ON books(access_tier);
CREATE INDEX idx_books_is_free ON books(is_free);
```

---

## 7. 错误处理与用户体验

### 7.1 统一错误响应

```swift
// SubscriptionError.swift

enum SubscriptionError: Error {
    case requiresSubscription(tier: SubscriptionTier, feature: Feature, message: String)
    case usageLimitReached(feature: Feature, limit: Int, used: Int, resetAt: Date?, message: String)
    case networkError(String)

    var shouldShowPaywall: Bool {
        switch self {
        case .requiresSubscription, .usageLimitReached:
            return true
        case .networkError:
            return false
        }
    }
}
```

### 7.2 全局错误处理器

```swift
// SubscriptionErrorHandler.swift

class SubscriptionErrorHandler: ObservableObject {
    static let shared = SubscriptionErrorHandler()

    @Published var currentError: SubscriptionError?
    @Published var showPaywall = false

    func handle(_ error: Error) {
        if let subscriptionError = error as? SubscriptionError {
            currentError = subscriptionError
            if subscriptionError.shouldShowPaywall {
                showPaywall = true
            }
        }
    }
}
```

### 7.3 用户友好提示

| 场景 | 提示内容 | 操作 |
|------|----------|------|
| AI 调用达到限制 | "You've used all 5 AI explanations today" | 显示升级按钮 |
| 词汇保存达到限制 | "You've saved 50 words. Upgrade for unlimited" | 显示升级按钮 |
| 尝试访问 Pro 书籍 | "This book requires Pro subscription" | 显示书籍预览 + 升级按钮 |
| 尝试下载离线内容 | "Offline reading is a Pro feature" | 显示功能介绍 + 升级按钮 |
| 尝试使用间隔重复 | "Spaced repetition is a Pro feature" | 显示功能演示 + 升级按钮 |

---

## 8. 测试方案

### 8.1 单元测试

```swift
// FeatureGateTests.swift

import XCTest
@testable import Readmigo

class FeatureGateTests: XCTestCase {
    var featureGate: FeatureGateService!
    var mockSubscriptionManager: MockSubscriptionManager!
    var mockUsageTracker: MockUsageTracker!

    override func setUp() {
        mockSubscriptionManager = MockSubscriptionManager()
        mockUsageTracker = MockUsageTracker()
        featureGate = FeatureGateService(
            subscriptionManager: mockSubscriptionManager,
            usageTracker: mockUsageTracker
        )
    }

    // MARK: - AI Usage Tests

    func testFreeUserCanUseAI_WhenUnderLimit() {
        mockSubscriptionManager.currentTier = .free
        mockUsageTracker.aiCallsToday = 3

        let result = featureGate.canUseAI()

        XCTAssertTrue(result.isAllowed)
        if case .allowedWithLimit(let remaining, let limit) = result {
            XCTAssertEqual(remaining, 2)
            XCTAssertEqual(limit, 5)
        } else {
            XCTFail("Expected allowedWithLimit")
        }
    }

    func testFreeUserCannotUseAI_WhenAtLimit() {
        mockSubscriptionManager.currentTier = .free
        mockUsageTracker.aiCallsToday = 5

        let result = featureGate.canUseAI()

        XCTAssertFalse(result.isAllowed)
    }

    func testProUserCanAlwaysUseAI() {
        mockSubscriptionManager.currentTier = .pro
        mockUsageTracker.aiCallsToday = 1000

        let result = featureGate.canUseAI()

        XCTAssertTrue(result.isAllowed)
    }

    // MARK: - Book Access Tests

    func testFreeUserCanAccessFreeBook() {
        mockSubscriptionManager.currentTier = .free
        let freeBook = Book(id: "1", title: "Test", isFree: true, accessTier: .free)

        let result = featureGate.canAccessBook(freeBook)

        XCTAssertTrue(result.isAllowed)
    }

    func testFreeUserCannotAccessProBook() {
        mockSubscriptionManager.currentTier = .free
        let proBook = Book(id: "1", title: "Test", isFree: false, accessTier: .pro)

        let result = featureGate.canAccessBook(proBook)

        XCTAssertFalse(result.isAllowed)
    }

    // MARK: - Offline Tests

    func testFreeUserCannotDownloadOffline() {
        mockSubscriptionManager.currentTier = .free

        let result = featureGate.canDownloadOffline()

        XCTAssertFalse(result.isAllowed)
    }

    func testProUserCanDownloadOffline() {
        mockSubscriptionManager.currentTier = .pro
        mockUsageTracker.offlineDownloadCount = 5

        let result = featureGate.canDownloadOffline()

        XCTAssertTrue(result.isAllowed)
    }
}
```

### 8.2 集成测试

```swift
// SubscriptionIntegrationTests.swift

class SubscriptionIntegrationTests: XCTestCase {

    func testCompleteSubscriptionFlow() async throws {
        // 1. 创建免费用户
        let user = try await createTestUser(tier: .free)

        // 2. 验证免费限制
        for i in 1...5 {
            let result = try await AIService.shared.explainWord("test\(i)", context: "")
            XCTAssertNotNil(result)
        }

        // 3. 第 6 次应该失败
        do {
            _ = try await AIService.shared.explainWord("test6", context: "")
            XCTFail("Should throw limit error")
        } catch AIError.limitReached {
            // Expected
        }

        // 4. 升级到 Pro
        try await SubscriptionManager.shared.mockPurchase(tier: .pro)

        // 5. 验证无限制
        let result = try await AIService.shared.explainWord("test7", context: "")
        XCTAssertNotNil(result)
    }
}
```

---

## 9. 监控与分析

### 9.1 关键指标

| 指标 | 描述 | 告警阈值 |
|------|------|----------|
| `free_to_pro_conversion` | 免费转 Pro 转化率 | < 2% |
| `limit_hit_rate` | 用户触及限制比率 | > 50% |
| `paywall_show_rate` | 付费墙展示频率 | - |
| `paywall_conversion` | 付费墙转化率 | < 5% |
| `feature_usage_by_tier` | 各层级功能使用 | - |

### 9.2 事件追踪

```swift
// Analytics Events

enum AnalyticsEvent {
    case featureGateChecked(feature: String, tier: String, result: String)
    case limitReached(feature: String, tier: String, limit: Int)
    case paywallShown(trigger: String, feature: String)
    case paywallDismissed(trigger: String)
    case upgradeClicked(source: String, tier: String)
    case purchaseCompleted(tier: String, period: String, price: Decimal)
}
```

---

## 10. 实现优先级

### Phase 1 - 核心权限系统 (Week 1)

1. [x] 创建 FeatureGateService
2. [x] 创建 UsageTracker
3. [ ] 实现 AI 调用限制 (前端 + 后端)
4. [ ] 实现词汇保存限制
5. [ ] 实现书籍访问控制

### Phase 2 - 功能限制 (Week 2)

1. [ ] 实现离线下载限制
2. [ ] 实现间隔重复限制
3. [ ] 实现语音聊天限制
4. [ ] 更新所有相关 UI

### Phase 3 - 完善与测试 (Week 3)

1. [ ] 添加单元测试
2. [ ] 添加集成测试
3. [ ] 实现监控告警
4. [ ] 优化用户体验

---

## 11. 待确认事项

1. **AI 模型选择**: Free/Pro 用户是否都使用 GPT-3.5？
2. **语音聊天**: Pro 用户每月 30 分钟是否合适？
3. **离线下载**: Pro 用户 10 本下载限制是否合适？
4. **徽章系统**: 是否需要按层级限制徽章？

---

## 12. 审批签字

| 角色 | 姓名 | 日期 | 签字 |
|------|------|------|------|
| 产品负责人 | | | |
| 技术负责人 | | | |
| 后端负责人 | | | |
| iOS 负责人 | | | |

---

*文档版本: 1.0*
*创建日期: 2025-12-21*
