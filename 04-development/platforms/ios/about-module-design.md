# iOS App 关于模块设计文档

## 1. 概述

### 1.1 背景

关于模块是用户了解应用信息、获取帮助和进行法律声明查阅的重要入口。当前实现过于简单（仅显示硬编码版本号和两个链接），需要完善为一个功能完整、信息丰富的模块。

### 1.2 目标

- 提供完整的应用信息展示
- 集成版本管理系统，支持动态版本检查
- 提供完善的法律文档入口
- 支持用户反馈和问题报告
- 展示开源许可和致谢信息
- 支持三种语言（English、简体中文、繁體中文）

### 1.3 入口位置

```
Me Tab → Support Section → About
```

## 2. 功能需求

### 2.1 核心功能

| 功能 | 优先级 | 描述 |
|------|--------|------|
| 应用信息展示 | P0 | 版本号、构建号、设备信息 |
| 版本检查 | P0 | 检查更新并跳转 App Store |
| 法律文档 | P0 | 隐私政策、服务条款、用户协议 |
| 联系我们 | P0 | 站内信、邮箱、电话、社交媒体 |
| 反馈入口 | P1 | 评价应用、问题反馈 |
| 开源许可 | P1 | 第三方库许可证展示 |
| 致谢 | P2 | 团队与贡献者致谢 |
| 更新日志 | P2 | 版本历史记录 |

### 2.2 用户故事

1. **作为用户**，我想查看当前应用版本，以便确认是否需要更新
2. **作为用户**，我想一键检查更新，以便获取最新功能
3. **作为用户**，我想查看隐私政策，以便了解数据使用方式
4. **作为用户**，我想给应用评分，以便表达我的使用体验
5. **作为用户**，我想报告问题，以便获得技术支持
6. **作为用户**，我想通过多种方式联系官方，以便获得帮助或合作
7. **作为用户**，我想发送站内信，以便直接与官方沟通而无需离开应用
8. **作为用户**，我想关注官方社交媒体，以便获取最新动态

## 3. UI 设计

### 3.1 页面结构

```
┌─────────────────────────────────┐
│         ← About                 │  Navigation Bar
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │      [App Icon]         │    │  App Header
│  │       Readmigo          │    │
│  │    "Read. Learn. Grow"  │    │  (Slogan)
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Version Info Section           │
│  ├─ Version          1.0.0     │
│  ├─ Build            1         │
│  └─ [Check for Updates]    ▶   │
├─────────────────────────────────┤
│  Contact Us Section             │
│  ├─ Send Message (站内信)   ▶   │
│  ├─ Email              ▶   │
│  ├─ Phone              ▶   │
│  └─ Social Media           ▶   │
├─────────────────────────────────┤
│  Legal Section                  │
│  ├─ Privacy Policy         ▶   │
│  ├─ Terms of Service       ▶   │
│  └─ User Agreement         ▶   │
├─────────────────────────────────┤
│  Feedback Section               │
│  ├─ Rate on App Store      ▶   │
│  └─ Report a Problem       ▶   │
├─────────────────────────────────┤
│  More Section                   │
│  ├─ Open Source Licenses   ▶   │
│  ├─ Changelog              ▶   │
│  └─ Acknowledgments        ▶   │
├─────────────────────────────────┤
│                                 │
│  © 2024-2025 Readmigo          │  Footer
│  Made with ❤️ for readers       │
│                                 │
└─────────────────────────────────┘
```

### 3.2 App Header 设计

```swift
// App 图标 + 名称 + 标语
VStack(spacing: 12) {
    Image("AppIcon")
        .resizable()
        .frame(width: 80, height: 80)
        .cornerRadius(18)
        .shadow(radius: 4)

    Text("Readmigo")
        .font(.title)
        .fontWeight(.bold)

    Text("about.slogan".localized)  // "Read. Learn. Grow."
        .font(.subheadline)
        .foregroundColor(.secondary)
}
.padding(.vertical, 24)
```

### 3.3 版本信息区块

| 字段 | 来源 | 示例 |
|------|------|------|
| 版本号 | `CFBundleShortVersionString` | 1.0.0 |
| 构建号 | `CFBundleVersion` | 1 |
| 检查更新 | `VersionManager.checkVersion()` | 按钮 |

**交互设计：**
- 点击"检查更新"显示 loading 状态
- 有更新时显示"新版本可用"提示，点击跳转 App Store
- 已是最新版时显示"已是最新版本"提示

### 3.4 联系我们区块

联系我们提供多种联系方式，方便用户根据需求选择最合适的沟通渠道。

#### 3.4.1 联系方式列表

| 联系方式 | 图标 | 操作 | 备注 |
|----------|------|------|------|
| 站内信 | `message.fill` | 进入站内信发送页面 | 需登录，详见 [站内信系统设计](./in-app-messaging-design.md) |
| 邮箱 | `envelope.fill` | 打开邮件客户端 / 复制邮箱 | support@readmigo.app |
| 电话 | `phone.fill` | 拨打电话 / 复制号码 | +86 400-XXX-XXXX |
| 社交媒体 | `link` | 进入社交媒体列表页 | 多平台账号 |

#### 3.4.2 联系我们主视图

```
┌─────────────────────────────────┐
│     Contact Us                  │  Section Header
├─────────────────────────────────┤
│  💬  Send Message           ▶   │  站内信（需登录）
├─────────────────────────────────┤
│  ✉️  Email                      │
│      support@readmigo.app   📋   │  点击复制 / 长按发送邮件
├─────────────────────────────────┤
│  📞  Phone                      │
│      +86 400-XXX-XXXX       📋   │  点击复制 / 长按拨打
├─────────────────────────────────┤
│  🔗  Social Media           ▶   │  进入社交媒体列表
└─────────────────────────────────┘
```

#### 3.4.3 社交媒体列表页

```
┌─────────────────────────────────┐
│       ← Social Media            │
├─────────────────────────────────┤
│  Official Accounts              │  Section Header
├─────────────────────────────────┤
│  [X图标] X (Twitter)            │
│          @ReadmigoApp       ▶   │  打开 X App / 网页
├─────────────────────────────────┤
│  [Instagram图标] Instagram      │
│          @readmigo.app      ▶   │  打开 Instagram
├─────────────────────────────────┤
│  [Facebook图标] Facebook        │
│          @ReadmigoApp       ▶   │  打开 Facebook App / 网页
├─────────────────────────────────┤
│  [YouTube图标] YouTube          │
│          @Readmigo          ▶   │  打开 YouTube App / 网页
├─────────────────────────────────┤
│  [TikTok图标] TikTok            │
│          @readmigo.app      ▶   │  打开 TikTok App / 网页
├─────────────────────────────────┤
│  [Discord图标] Discord          │
│          Readmigo Community ▶   │  打开 Discord 邀请链接
└─────────────────────────────────┘
```

#### 3.4.4 社交媒体配置

| 平台 | 账号/链接 | Deep Link | 回退 URL |
|------|-----------|-----------|----------|
| X (Twitter) | @ReadmigoApp | `twitter://user?screen_name=ReadmigoApp` | `https://x.com/ReadmigoApp` |
| Instagram | @readmigo.app | `instagram://user?username=readmigo.app` | `https://instagram.com/readmigo.app` |
| Facebook | @ReadmigoApp | `fb://profile/XXX` | `https://facebook.com/ReadmigoApp` |
| YouTube | @Readmigo | `youtube://www.youtube.com/@Readmigo` | `https://youtube.com/@Readmigo` |
| TikTok | @readmigo.app | `snssdk1233://user/profile/XXX` | `https://tiktok.com/@readmigo.app` |
| Discord | Readmigo Community | `discord://invite/XXX` | `https://discord.gg/XXX` |

#### 3.4.5 站内信入口设计

站内信是一个完整的独立功能模块，在关于页面仅提供入口：

```swift
// 站内信入口
Button(action: {
    if authManager.isAuthenticated {
        showInAppMessaging = true
    } else {
        showLoginPrompt = true
    }
}) {
    HStack {
        Label("contact.sendMessage".localized, systemImage: "message.fill")
        Spacer()
        if !authManager.isAuthenticated {
            Text("contact.loginRequired".localized)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        Image(systemName: "chevron.right")
            .foregroundColor(.secondary)
    }
}
```

> **注意**：站内信的完整功能设计请参考 [站内信与用户反馈系统设计文档](./in-app-messaging-design.md)

### 3.5 法律文档区块

| 文档 | URL | 展示方式 |
|------|-----|----------|
| 隐私政策 | `https://readmigo.app/privacy` | SafariView / WebView |
| 服务条款 | `https://readmigo.app/terms` | SafariView / WebView |
| 用户协议 | `https://readmigo.app/agreement` | SafariView / WebView |

### 3.6 反馈区块

| 功能 | 实现方式 |
|------|----------|
| App Store 评分 | `SKStoreReviewController.requestReview()` 或跳转 App Store |
| 问题反馈 | 发送邮件至 support@readmigo.app 或通过站内信 |

**问题反馈邮件模板：**
```
收件人: support@readmigo.app
主题: [Readmigo Feedback] Issue Report

----- Device Info -----
App Version: 1.0.0 (Build 1)
iOS Version: 17.0
Device Model: iPhone 15 Pro
Language: zh-Hans

----- Description -----
(用户输入)
```

### 3.7 开源许可页面

列表展示所有使用的第三方库及其许可证：

```
┌─────────────────────────────────┐
│     ← Open Source Licenses      │
├─────────────────────────────────┤
│  Alamofire                  ▶   │
│  MIT License                    │
├─────────────────────────────────┤
│  Kingfisher                 ▶   │
│  MIT License                    │
├─────────────────────────────────┤
│  Sentry                     ▶   │
│  MIT License                    │
├─────────────────────────────────┤
│  ...                            │
└─────────────────────────────────┘
```

### 3.8 更新日志页面

```
┌─────────────────────────────────┐
│         ← Changelog             │
├─────────────────────────────────┤
│  Version 1.0.0                  │
│  December 2024                  │
│  ─────────────────────────────  │
│  • Initial release              │
│  • AI-powered vocabulary        │
│  • Epub reader support          │
│  • English/Chinese/Traditional  │
│    Chinese support              │
├─────────────────────────────────┤
│  (更多版本...)                   │
└─────────────────────────────────┘
```

## 4. 数据结构

### 4.1 应用信息模型

```swift
struct AppInfo {
    let version: String           // CFBundleShortVersionString
    let build: String             // CFBundleVersion
    let bundleIdentifier: String  // CFBundleIdentifier

    static var current: AppInfo {
        let info = Bundle.main.infoDictionary ?? [:]
        return AppInfo(
            version: info["CFBundleShortVersionString"] as? String ?? "Unknown",
            build: info["CFBundleVersion"] as? String ?? "Unknown",
            bundleIdentifier: Bundle.main.bundleIdentifier ?? "Unknown"
        )
    }
}
```

### 4.2 设备信息模型

```swift
struct DeviceInfo {
    let model: String        // iPhone 15 Pro
    let systemVersion: String // iOS 17.0
    let language: String      // zh-Hans

    static var current: DeviceInfo {
        DeviceInfo(
            model: UIDevice.current.modelName,  // 需要扩展获取友好名称
            systemVersion: "\(UIDevice.current.systemName) \(UIDevice.current.systemVersion)",
            language: Locale.current.language.languageCode?.identifier ?? "Unknown"
        )
    }
}
```

### 4.3 联系方式模型

```swift
struct ContactInfo {
    let email: String
    let phone: String
    let socialMedia: [SocialMediaAccount]
}

struct SocialMediaAccount: Identifiable {
    let id = UUID()
    let platform: SocialPlatform
    let handle: String           // @Readmigo
    let deepLink: String?        // App deep link
    let webUrl: String           // 网页回退链接
    let iconName: String         // SF Symbol 或自定义图标名
}

enum SocialPlatform: String, CaseIterable {
    case twitter = "X (Twitter)"
    case instagram = "Instagram"
    case facebook = "Facebook"
    case youtube = "YouTube"
    case tiktok = "TikTok"
    case discord = "Discord"

    var displayName: String {
        return self.rawValue
    }
}
```

### 4.4 开源许可模型

```swift
struct OpenSourceLicense: Identifiable {
    let id = UUID()
    let name: String          // 库名称
    let version: String?      // 版本号
    let license: LicenseType  // 许可证类型
    let url: URL?             // 项目地址
    let licenseText: String   // 许可证全文
}

enum LicenseType: String {
    case mit = "MIT License"
    case apache2 = "Apache License 2.0"
    case bsd3 = "BSD 3-Clause License"
    case gpl3 = "GPL v3"
    case custom = "Custom License"
}
```

### 4.5 更新日志模型

```swift
struct ChangelogEntry: Identifiable {
    let id = UUID()
    let version: String
    let date: Date
    let changes: [LocalizedString]  // 支持多语言
}

struct LocalizedString {
    let en: String
    let zhHans: String
    let zhHant: String

    func localized(for locale: String) -> String {
        switch locale {
        case "zh-Hans": return zhHans
        case "zh-Hant": return zhHant
        default: return en
        }
    }
}
```

## 5. 本地化支持

### 5.1 新增本地化 Key

| Key | English | 简体中文 | 繁體中文 |
|-----|---------|----------|----------|
| `about.slogan` | Read. Learn. Grow. | 阅读·学习·成长 | 閱讀·學習·成長 |
| `about.buildNumber` | Build | 构建号 | 建置編號 |
| `about.checkUpdate` | Check for Updates | 检查更新 | 檢查更新 |
| `about.checking` | Checking... | 检查中... | 檢查中... |
| `about.upToDate` | You're up to date | 已是最新版本 | 已是最新版本 |
| `about.updateAvailable` | Update Available | 有新版本可用 | 有新版本可用 |
| `about.userAgreement` | User Agreement | 用户协议 | 使用者協議 |
| `about.rateApp` | Rate on App Store | 在 App Store 评分 | 在 App Store 評分 |
| `about.reportProblem` | Report a Problem | 报告问题 | 回報問題 |
| `about.openSourceLicenses` | Open Source Licenses | 开源许可 | 開源授權 |
| `about.changelog` | Changelog | 更新日志 | 更新日誌 |
| `about.acknowledgments` | Acknowledgments | 致谢 | 致謝 |
| `about.copyright` | © 2024-2025 Readmigo | © 2024-2025 Readmigo | © 2024-2025 Readmigo |
| `about.madeWith` | Made with ❤️ for readers | 为阅读者用心打造 | 為閱讀者用心打造 |
| `about.feedbackEmailSubject` | [Readmigo Feedback] Issue Report | [Readmigo 反馈] 问题报告 | [Readmigo 反饋] 問題回報 |
| `about.deviceInfo` | Device Info | 设备信息 | 裝置資訊 |
| `about.descriptionPlaceholder` | Please describe the issue... | 请描述您遇到的问题... | 請描述您遇到的問題... |

### 5.2 联系我们本地化 Key

| Key | English | 简体中文 | 繁體中文 |
|-----|---------|----------|----------|
| `contact.title` | Contact Us | 联系我们 | 聯繫我們 |
| `contact.sendMessage` | Send Message | 发送站内信 | 發送站內信 |
| `contact.loginRequired` | Login required | 需要登录 | 需要登入 |
| `contact.email` | Email | 邮箱 | 電子郵件 |
| `contact.phone` | Phone | 电话 | 電話 |
| `contact.socialMedia` | Social Media | 社交媒体 | 社群媒體 |
| `contact.copied` | Copied to clipboard | 已复制 | 已複製 |
| `contact.callPhone` | Call | 拨打电话 | 撥打電話 |
| `contact.copyNumber` | Copy Number | 复制号码 | 複製號碼 |
| `contact.sendEmail` | Send Email | 发送邮件 | 發送郵件 |
| `contact.copyEmail` | Copy Email | 复制邮箱 | 複製郵件地址 |
| `contact.officialAccounts` | Official Accounts | 官方账号 | 官方帳號 |

### 5.3 现有可复用 Key

以下 Key 已存在于 `Localizable.xcstrings`：
- `about.version`
- `about.privacyPolicy`
- `about.termsOfService`
- `support.about`

## 6. 实现细节

### 6.1 文件结构

```
ios/Readmigo/Features/About/
├── Views/
│   ├── AboutView.swift              # 主视图
│   ├── AppInfoHeaderView.swift      # App 信息头部组件
│   ├── VersionSectionView.swift     # 版本信息区块
│   ├── ContactSectionView.swift     # 联系我们区块
│   ├── SocialMediaListView.swift    # 社交媒体列表
│   ├── LegalSectionView.swift       # 法律文档区块
│   ├── FeedbackSectionView.swift    # 反馈区块
│   ├── OpenSourceLicensesView.swift # 开源许可列表
│   ├── LicenseDetailView.swift      # 许可证详情
│   ├── ChangelogView.swift          # 更新日志
│   └── AcknowledgmentsView.swift    # 致谢页面
├── Models/
│   ├── AppInfo.swift
│   ├── DeviceInfo.swift
│   ├── ContactInfo.swift            # 联系方式模型
│   ├── SocialMediaAccount.swift     # 社交媒体账号模型
│   └── OpenSourceLicense.swift
├── ViewModels/
│   └── AboutViewModel.swift         # ViewModel
└── Data/
    ├── ContactData.swift            # 联系方式配置数据
    ├── Licenses.swift               # 开源许可数据
    └── Changelog.swift              # 更新日志数据
```

### 6.2 AboutViewModel

```swift
import SwiftUI
import StoreKit

@MainActor
class AboutViewModel: ObservableObject {
    @Published var isCheckingUpdate = false
    @Published var updateCheckResult: UpdateCheckResult?
    @Published var showMailComposer = false
    @Published var showMailError = false

    private let versionManager: VersionManager

    enum UpdateCheckResult {
        case upToDate
        case available(version: String)
        case error(String)
    }

    init(versionManager: VersionManager = .shared) {
        self.versionManager = versionManager
    }

    // 检查更新
    func checkForUpdate() async {
        isCheckingUpdate = true
        defer { isCheckingUpdate = false }

        do {
            await versionManager.checkVersion(force: true)

            if versionManager.updateAvailable {
                updateCheckResult = .available(version: versionManager.currentVersion)
            } else {
                updateCheckResult = .upToDate
            }
        } catch {
            updateCheckResult = .error(error.localizedDescription)
        }
    }

    // 请求应用评分
    func requestAppReview() {
        if let scene = UIApplication.shared.connectedScenes
            .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
    }

    // 打开 App Store
    func openAppStore() {
        versionManager.openAppStore()
    }

    // 构建反馈邮件内容
    func buildFeedbackEmailBody() -> String {
        let appInfo = AppInfo.current
        let deviceInfo = DeviceInfo.current

        return """

        ----- \("about.deviceInfo".localized) -----
        App Version: \(appInfo.version) (Build \(appInfo.build))
        \(deviceInfo.systemVersion)
        Device Model: \(deviceInfo.model)
        Language: \(deviceInfo.language)

        ----- Description -----

        """
    }
}
```

### 6.3 主视图实现

```swift
import SwiftUI

struct AboutView: View {
    @StateObject private var viewModel = AboutViewModel()
    @EnvironmentObject private var versionManager: VersionManager

    var body: some View {
        List {
            // App 信息头部
            Section {
                AppInfoHeaderView()
            }
            .listRowBackground(Color.clear)

            // 版本信息
            Section {
                VersionRow(
                    title: "about.version".localized,
                    value: AppInfo.current.version
                )
                VersionRow(
                    title: "about.buildNumber".localized,
                    value: AppInfo.current.build
                )
                CheckUpdateRow(viewModel: viewModel)
            }

            // 联系我们
            Section(header: Text("contact.title".localized)) {
                // 站内信入口
                Button(action: {
                    if authManager.isAuthenticated {
                        showInAppMessaging = true
                    } else {
                        showLoginPrompt = true
                    }
                }) {
                    HStack {
                        Label("contact.sendMessage".localized, systemImage: "message.fill")
                        Spacer()
                        if !authManager.isAuthenticated {
                            Text("contact.loginRequired".localized)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                }

                // 邮箱
                ContactRow(
                    icon: "envelope.fill",
                    title: "contact.email".localized,
                    value: ContactData.email,
                    onTap: { viewModel.handleEmailTap() },
                    onLongPress: { viewModel.copyToClipboard(ContactData.email) }
                )

                // 电话
                ContactRow(
                    icon: "phone.fill",
                    title: "contact.phone".localized,
                    value: ContactData.phone,
                    onTap: { viewModel.handlePhoneTap() },
                    onLongPress: { viewModel.copyToClipboard(ContactData.phone) }
                )

                // 社交媒体
                NavigationLink(destination: SocialMediaListView()) {
                    Label("contact.socialMedia".localized, systemImage: "link")
                }
            }

            // 法律文档
            Section(header: Text("Legal")) {
                SafariLink(
                    title: "about.privacyPolicy".localized,
                    url: URL(string: "https://readmigo.app/privacy")!
                )
                SafariLink(
                    title: "about.termsOfService".localized,
                    url: URL(string: "https://readmigo.app/terms")!
                )
                SafariLink(
                    title: "about.userAgreement".localized,
                    url: URL(string: "https://readmigo.app/agreement")!
                )
            }

            // 反馈
            Section(header: Text("Feedback")) {
                Button(action: { viewModel.requestAppReview() }) {
                    Label("about.rateApp".localized, systemImage: "star.fill")
                }

                Button(action: { viewModel.showMailComposer = true }) {
                    Label("about.reportProblem".localized, systemImage: "exclamationmark.bubble")
                }
            }

            // 更多
            Section {
                NavigationLink(destination: OpenSourceLicensesView()) {
                    Label("about.openSourceLicenses".localized, systemImage: "doc.text")
                }
                NavigationLink(destination: ChangelogView()) {
                    Label("about.changelog".localized, systemImage: "clock.arrow.circlepath")
                }
                NavigationLink(destination: AcknowledgmentsView()) {
                    Label("about.acknowledgments".localized, systemImage: "heart")
                }
            }

            // 页脚
            Section {
                FooterView()
            }
            .listRowBackground(Color.clear)
        }
        .navigationTitle("support.about".localized)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $viewModel.showMailComposer) {
            MailComposerView(
                recipient: "support@readmigo.app",
                subject: "about.feedbackEmailSubject".localized,
                body: viewModel.buildFeedbackEmailBody()
            )
        }
        .alert("Error", isPresented: $viewModel.showMailError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Mail app is not available. Please email us at support@readmigo.app")
        }
    }
}
```

### 6.4 集成 VersionManager

当前 `VersionManager` 已有以下能力，直接复用：

```swift
// 来自 VersionManager.swift
class VersionManager: ObservableObject {
    @Published var isChecking = false
    @Published var forceUpdateRequired = false
    @Published var updateAvailable = false
    @Published var currentVersion: String = ""
    @Published var releaseNotes: String = ""
    @Published var releaseNotesZh: String = ""
    @Published var storeUrl: String = ""

    var appVersion: String { /* 从 Bundle 获取 */ }
    var buildNumber: String { /* 从 Bundle 获取 */ }

    func checkVersion(force: Bool) async { /* 检查更新逻辑 */ }
    func openAppStore() { /* 打开 App Store */ }
    func localizedReleaseNotes(for locale: String) -> String { /* 本地化发布说明 */ }
}
```

## 7. 开源许可数据

### 7.1 需要展示的第三方库

| 库名 | 版本 | 许可证 | 用途 |
|------|------|--------|------|
| Alamofire | 5.x | MIT | 网络请求 |
| Kingfisher | 7.x | MIT | 图片加载缓存 |
| Sentry | 8.x | MIT | 崩溃追踪 |
| SwiftSoup | 2.x | MIT | HTML 解析 |
| KeychainAccess | 4.x | MIT | Keychain 存取 |
| GoogleSignIn | 7.x | Apache 2.0 | Google 登录 |

### 7.2 数据源文件

```swift
// Data/Licenses.swift
struct Licenses {
    static let all: [OpenSourceLicense] = [
        OpenSourceLicense(
            name: "Alamofire",
            version: "5.8.0",
            license: .mit,
            url: URL(string: "https://github.com/Alamofire/Alamofire"),
            licenseText: """
            MIT License

            Copyright (c) 2014-2024 Alamofire Software Foundation
            ...
            """
        ),
        // ... 其他库
    ]
}
```

## 8. 交互流程

### 8.1 检查更新流程

```
[用户点击"检查更新"]
         │
         ▼
[显示 Loading 状态]
         │
         ▼
[调用 VersionManager.checkVersion()]
         │
         ├─── 成功 ───┬─── 有更新 ─── [显示"有新版本可用"] ─── [用户点击] ─── [跳转 App Store]
         │            │
         │            └─── 无更新 ─── [显示"已是最新版本" (3秒后消失)]
         │
         └─── 失败 ─── [显示错误提示]
```

### 8.2 联系我们交互流程

#### 8.2.1 站内信流程

```
[用户点击"发送站内信"]
         │
         ▼
[检查登录状态]
         │
         ├─── 已登录 ─── [进入站内信发送页面]
         │                      │
         │                      ▼
         │              [选择消息类型/填写内容]
         │                      │
         │                      ▼
         │              [发送消息] ─── [显示发送成功]
         │
         └─── 未登录 ─── [显示登录提示弹窗]
                              │
                              ├─── 去登录 ─── [跳转登录页面]
                              │
                              └─── 取消 ─── [关闭弹窗]
```

#### 8.2.2 邮箱/电话交互

```
[用户点击邮箱/电话行]
         │
         ├─── 短按 ─── [显示 Action Sheet]
         │                  │
         │                  ├─── 发送邮件/拨打电话
         │                  │
         │                  └─── 复制到剪贴板
         │
         └─── 长按 ─── [直接复制到剪贴板，显示 Toast 提示]
```

#### 8.2.3 社交媒体跳转

```
[用户点击社交媒体项]
         │
         ▼
[检查对应 App 是否安装]
         │
         ├─── 已安装 ─── [通过 Deep Link 打开 App]
         │
         └─── 未安装 ─── [打开网页版]
```

### 8.3 问题反馈流程

```
[用户点击"报告问题"]
         │
         ▼
[检查 Mail App 可用性]
         │
         ├─── 可用 ─── [打开 Mail Composer (预填设备信息)]
         │                      │
         │                      ▼
         │              [用户填写问题描述]
         │                      │
         │                      ▼
         │              [发送邮件]
         │
         └─── 不可用 ─── [显示提示: "请发送邮件至 support@readmigo.app"]
                              │
                              ▼
                        [复制邮箱地址到剪贴板]
```

## 9. 测试用例

### 9.1 单元测试

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| AppInfo 获取 | 获取应用版本信息 | 返回正确的 version 和 build |
| DeviceInfo 获取 | 获取设备信息 | 返回正确的 model 和 systemVersion |
| 本地化 Key | 检查所有 Key 是否有三语翻译 | 所有 Key 都有对应翻译 |
| 更新检查成功 | 模拟有更新场景 | updateCheckResult = .available |
| 更新检查无更新 | 模拟无更新场景 | updateCheckResult = .upToDate |

### 9.2 UI 测试

| 测试项 | 步骤 | 预期结果 |
|--------|------|----------|
| 页面展示 | 进入关于页面 | 所有区块正确展示 |
| 版本号显示 | 查看版本区块 | 显示动态版本号 |
| 联系我们展示 | 查看联系我们区块 | 显示所有联系方式 |
| 站内信入口（已登录） | 已登录状态点击站内信 | 进入站内信发送页面 |
| 站内信入口（未登录） | 未登录状态点击站内信 | 显示登录提示 |
| 邮箱复制 | 长按邮箱行 | 复制成功并显示 Toast |
| 电话拨打 | 点击电话行选择拨打 | 调起系统拨号 |
| 社交媒体列表 | 进入社交媒体页面 | 显示所有平台账号 |
| 隐私政策跳转 | 点击隐私政策 | 打开对应网页 |
| 评分功能 | 点击 App Store 评分 | 弹出系统评分弹窗 |
| 开源许可 | 进入开源许可页面 | 展示所有第三方库 |
| 多语言切换 | 切换语言后查看 | 所有文案正确切换 |

### 9.3 边界测试

| 测试项 | 场景 | 预期结果 |
|--------|------|----------|
| 无网络检查更新 | 断网状态点击检查更新 | 显示网络错误提示 |
| Mail App 不可用 | 设备无 Mail App | 显示备用提示并可复制邮箱 |
| 社交媒体 App 未安装 | 点击社交媒体项 | 降级到网页版 |
| 电话功能不可用 | iPad 等无电话设备 | 隐藏拨打选项，仅显示复制 |
| 深色模式 | 开启深色模式 | UI 正确适配 |
| 小屏设备 | iPhone SE 等小屏 | 布局正确无截断 |
| 大字体 | 开启辅助功能大字体 | 文字可读，布局适配 |

## 10. 时序与依赖

### 10.1 模块依赖

```
AboutView
    ├── VersionManager (已有)
    ├── LocalizationManager (已有)
    ├── ThemeManager (已有)
    ├── AuthManager (已有，用于站内信登录检查)
    └── 新增组件
        ├── AboutViewModel
        ├── AppInfo
        ├── DeviceInfo
        ├── ContactInfo / SocialMediaAccount
        ├── OpenSourceLicense
        ├── MailComposerView
        ├── SocialMediaListView
        └── InAppMessagingView (独立模块，详见站内信设计文档)
```

### 10.2 实现顺序建议

1. **Phase 1 - 基础完善**
   - 创建文件夹结构
   - 实现 AppInfo / DeviceInfo 模型
   - 重构 AboutView 主视图
   - 集成 VersionManager 动态版本

2. **Phase 2 - 联系我们模块**
   - 实现 ContactInfo / SocialMediaAccount 模型
   - 实现 ContactSectionView 区块
   - 实现 SocialMediaListView 社交媒体列表
   - 实现邮箱/电话的复制、拨打功能
   - 集成站内信入口（依赖站内信模块）

3. **Phase 3 - 反馈功能**
   - 实现 AboutViewModel
   - 添加检查更新功能
   - 实现问题反馈（MailComposer）
   - 添加 App Store 评分

4. **Phase 4 - 扩展内容**
   - 开源许可页面
   - 更新日志页面
   - 致谢页面

5. **Phase 5 - 本地化与测试**
   - 添加所有本地化 Key
   - 编写单元测试
   - 编写 UI 测试

## 11. 设计规范遵循

### 11.1 符合现有设计系统

- 使用 `BrandColors` 中定义的颜色
- 遵循现有 List + Section 的布局模式
- 使用 SF Symbols 图标
- 支持 Dark Mode
- 支持 Dynamic Type

### 11.2 一致性检查

| 项目 | 参考 | 状态 |
|------|------|------|
| 导航栏样式 | ProfileView | ✓ |
| 列表样式 | AccountSettingsView | ✓ |
| 按钮样式 | 现有 Button 组件 | ✓ |
| 颜色使用 | BrandColors | ✓ |
| 图标使用 | SF Symbols | ✓ |

## 12. 后续扩展

### 12.1 可选功能（P3）

- 分享应用功能
- 社交媒体链接（Twitter/X, Instagram）
- 开发者博客入口
- 调试信息查看（仅限测试版）

### 12.2 数据分析埋点

| 事件 | 描述 |
|------|------|
| `about_viewed` | 进入关于页面 |
| `check_update_tapped` | 点击检查更新 |
| `contact_message_tapped` | 点击发送站内信 |
| `contact_email_tapped` | 点击邮箱 |
| `contact_phone_tapped` | 点击电话 |
| `contact_social_viewed` | 进入社交媒体列表 |
| `contact_social_tapped` | 点击具体社交媒体（带 platform 参数） |
| `rate_app_tapped` | 点击评分 |
| `report_problem_tapped` | 点击报告问题 |
| `privacy_policy_tapped` | 点击隐私政策 |
| `terms_tapped` | 点击服务条款 |

---

## 附录

### A. 参考文档

- [iOS Client Spec](./client-spec.md)
- [Design System](../design/design-system.md)
- [i18n Design](./i18n-design.md)
- [站内信与用户反馈系统设计](./in-app-messaging-design.md)

### B. 相关文件路径

| 文件 | 路径 |
|------|------|
| 现有 AboutView | `ios/Readmigo/Features/Profile/ProfileView.swift:468-487` |
| VersionManager | `ios/Readmigo/Core/Services/VersionManager.swift` |
| LocalizationManager | `ios/Readmigo/Core/Localization/LocalizationManager.swift` |
| Localizable.xcstrings | `ios/Readmigo/Localizable.xcstrings` |
| BrandColors | `ios/Readmigo/UI/Themes/BrandColors.swift` |

### C. URL 与联系方式配置

| 用途 | 值 |
|------|-----|
| 隐私政策 | https://readmigo.app/privacy |
| 服务条款 | https://readmigo.app/terms |
| 用户协议 | https://readmigo.app/agreement |
| App Store | https://apps.apple.com/app/readmigo/id[APP_ID] |
| 支持邮箱 | support@readmigo.app |
| 客服电话 | +86 400-XXX-XXXX（待确定） |

### D. 社交媒体配置

| 平台 | 账号 | Deep Link | Web URL |
|------|------|-----------|---------|
| X (Twitter) | @ReadmigoApp | `twitter://user?screen_name=ReadmigoApp` | `https://x.com/ReadmigoApp` |
| Instagram | @readmigo.app | `instagram://user?username=readmigo.app` | `https://instagram.com/readmigo.app` |
| Facebook | @ReadmigoApp | `fb://profile/XXX` | `https://facebook.com/ReadmigoApp` |
| YouTube | @Readmigo | `youtube://www.youtube.com/@Readmigo` | `https://youtube.com/@Readmigo` |
| TikTok | @readmigo.app | `snssdk1233://user/profile/XXX` | `https://tiktok.com/@readmigo.app` |
| Discord | Readmigo Community | `discord://invite/XXX` | `https://discord.gg/XXX` |

> **注意**：以上社交媒体账号和链接需要在正式上线前确认并更新
