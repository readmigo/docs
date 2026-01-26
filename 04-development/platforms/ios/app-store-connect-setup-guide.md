# App Store Connect 配置操作指南

> 详细的App Store Connect配置步骤，包括截图和具体填写内容

**生成时间**: 2025-12-25
**最后更新**: 2025-12-27
**项目**: Readmigo iOS App
**版本**: 1.0.0 (Build 1)
**Bundle ID**: com.readmigo.app

---

## 🎯 实现状态总览

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| **App 基础配置** | ✅ 已完成 | Bundle ID, 版本号, Build number 已配置 |
| **应用内购买 (IAP)** | ✅ 已完成 | StoreKit 2 集成, 2个订阅产品 |
| **Sign in with Apple** | ✅ 已完成 | AuthenticationServices 完整实现 |
| **推送通知** | ⚠️ 部分完成 | 后端基础设施就绪，APNs 注册代码待完善 |
| **App Groups** | ❌ 未实现 | 仅配置了 Sign in with Apple entitlement |
| **版本管理** | ✅ 已完成 | 服务端版本检查，强制更新功能 |
| **CarPlay 支持** | ✅ 已完成 | 完整的 CarPlay 场景管理和音频播放 |
| **订阅管理 UI** | ✅ 已完成 | Paywall、状态页、恢复购买功能 |
| **功能门控** | ✅ 已完成 | 基于订阅等级的完整访问控制 |
| **崩溃上报** | ✅ 已完成 | Sentry 集成 |
| **设备管理** | ✅ 已完成 | 多设备支持，设备数量限制 (2台) |

---

## 📋 准备工作清单

在开始之前，请确保你已经准备好：

- [x] Apple Developer账号已激活（$99/年已支付）
- [x] 登录 [App Store Connect](https://appstoreconnect.apple.com)
- [x] 浏览器：推荐使用Safari或Chrome最新版本

---

## 第一步：创建新App

### 1.1 访问My Apps
1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 点击顶部的 **"My Apps"** 按钮
3. 点击左上角的 **"+"** 按钮
4. 选择 **"New App"**

### 1.2 填写基本信息

在弹出的对话框中填写：

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| **Platforms** | ☑️ iOS | 只勾选iOS |
| **Name** | `Readmigo` | App在App Store显示的名称 |
| **Primary Language** | `English (U.S.)` | 主要语言 |
| **Bundle ID** | 从下拉菜单选择 `com.readmigo.app` | 必须与Xcode中的Bundle ID一致 |
| **SKU** | `readmigo-ios-001` | 用于内部跟踪的唯一标识符，不会在App Store显示。如将来有Android版本可用 `readmigo-android-001` |
| **User Access** | `Full Access` | 推荐选择Full Access，团队所有成员都可访问此App信息 |

### 1.3 点击Create
点击右下角的 **"Create"** 按钮创建App。

---

## 第二步：配置App信息

创建后会自动跳转到App页面，现在开始配置各项信息。

### 2.1 App Information（App信息）

在左侧导航栏选择 **"App Information"**，填写以下内容：

#### 基本信息

| 字段 | 填写内容 |
|------|---------|
| **Name** | `Readmigo - AI English Reading` |
| **Subtitle** | `Read Books. AI Has Your Back.` |

#### 分类

| 字段 | 选择内容 |
|------|---------|
| **Primary Category** | `Education` |
| **Secondary Category** | `Books` |

#### 内容权限

| 字段 | 选择内容 |
|------|---------|
| **Content Rights** | ☑️ `Contains, shows, or accesses third-party content` |

#### App Store图标

上传1024x1024的App图标（必需）：
- 格式：PNG或JPG
- 无alpha通道
- 无圆角（系统会自动添加）

### 2.2 Age Rating（年龄评级）

1. 点击 **"Edit"** 按钮
2. 回答评级问卷：

**所有问题都选择"None"或"No"**（因为Readmigo是纯阅读学习应用）：

- Cartoon or Fantasy Violence: **None**
- Realistic Violence: **None**
- Prolonged Graphic or Sadistic Realistic Violence: **No**
- Profanity or Crude Humor: **None**
- Mature/Suggestive Themes: **None**
- Horror/Fear Themes: **None**
- Medical/Treatment Information: **None**
- Alcohol, Tobacco, or Drug Use or References: **None**
- Simulated Gambling: **None**
- Sexual Content or Nudity: **None**
- Graphic Sexual Content and Nudity: **No**

3. 结果应该是：**4+**
4. 点击 **"Done"**

### 2.3 隐私政策URL

| 字段 | 填写内容 |
|------|---------|
| **Privacy Policy URL** | `https://readmigo.app/privacy` |

⚠️ **重要**：确保这个URL是可访问的！Apple审核时会检查。

---

## 第三步：准备版本信息

在左侧导航栏，点击 **"iOS App"** 下的版本号（应该会提示你创建新版本）。

### 3.1 创建新版本

1. 点击 **"+ Version or Platform"**
2. 选择 **"iOS"**
3. Version输入：`1.0`
4. 点击 **"Create"**

### 3.2 版本信息

#### App Store截图（暂时可以跳过，稍后准备好后上传）

需要准备以下尺寸：

| 设备类型 | 尺寸 | 数量要求 |
|---------|------|---------|
| 6.7" Display (iPhone 15 Pro Max) | 1290 × 2796 | 最少1张，最多10张 |
| 6.5" Display (iPhone 14 Plus) | 1284 × 2778 | 最少1张，最多10张 |
| iPad Pro (6th Gen) 12.9" | 2048 × 2732 | 最少1张，最多10张 |

建议准备6张截图，展示核心功能。

#### Description（应用描述）

使用以下英文描述：

```
Readmigo - AI-Powered English Reading & Learning

"Read any book. AI has your back."

Transform your English reading experience with Readmigo, the AI-native reading app designed for English learners worldwide. Read classic literature in English with intelligent AI assistance that helps you understand every word, sentence, and story.

📚 EXTENSIVE LIBRARY
• 200+ public domain classics from renowned authors
• Shakespeare, Jane Austen, Charles Dickens, and more
• Carefully curated reading lists for all levels
• New books added regularly

🤖 AI-POWERED LEARNING
• Tap any word for instant, context-aware definitions
• Simplify complex sentences with one tap
• Translate passages to your native language
• Ask questions about the story and characters
• AI adapts explanations to your level

📖 IMMERSIVE READING
• Beautiful, customizable reader interface
• Multiple themes including dark mode
• Adjustable fonts and text sizes
• Text-to-speech with natural voices
• Reading progress sync across devices

📝 VOCABULARY MASTERY
• Save words while reading
• Spaced repetition flashcards (SM-2 algorithm)
• Track your vocabulary growth
• Review sessions optimized for memory

📊 TRACK YOUR PROGRESS
• Reading statistics and trends
• Vocabulary growth charts
• Reading streaks and achievements
• Personalized reading insights

SUBSCRIPTION OPTIONS:
• Readmigo Free: Limited AI interactions, core reading features
• Readmigo Premium: Unlimited AI, all features, priority support

Start your English reading journey today. Download Readmigo and discover the joy of reading in English!

Terms of Use: https://readmigo.app/terms
Privacy Policy: https://readmigo.app/privacy
```

#### Keywords（关键词）

最多100个字符，用逗号分隔：

```
english learning,reading,books,AI,vocabulary,ebook,classic literature,learn english,reader,study
```

#### Promotional Text（促销文字，可选）

可以留空，或者填写季节性促销内容（可随时更新无需审核）

#### What's New（更新说明）

```
Version 1.0 - Initial Release

Welcome to Readmigo!

• 200+ classic books from public domain
• AI-powered word explanations and sentence simplification
• Context-aware translation
• Vocabulary saving with spaced repetition flashcards
• Beautiful reading themes with dark mode support
• Text-to-speech with natural voices
• Reading progress sync across devices
• Sign in with Apple for secure authentication

Start your English reading journey today!
```

#### Support URL

| 字段 | 填写内容 |
|------|---------|
| **Support URL** | `https://readmigo.app/support` |
| **Marketing URL** | `https://readmigo.app` |

---

## 第四步：配置构建（Build）

### 4.1 选择构建

在版本页面，找到 **"Build"** 部分：

1. 如果已经上传了构建，点击 **"Select a build before you submit your app"** 旁边的 **"+"**
2. 从列表中选择你的构建（版本1.0.0, Build 1）
3. 点击 **"Done"**

⚠️ **注意**：构建需要先通过Xcode上传，这部分我们会在后续步骤完成。

### 4.2 出口合规信息

选择构建后会提示填写出口合规信息：

**问题1**: Does your app use encryption?
- **回答**: `No`（除非使用了自定义加密，标准HTTPS不算）

---

## 第五步：联系信息

### 5.1 App Review Information

在版本页面底部，找到 **"App Review Information"**：

| 字段 | 填写内容 |
|------|---------|
| **Sign-in required** | ☑️ Yes |
| **First Name** | [你的名字] |
| **Last Name** | [你的姓氏] |
| **Phone Number** | [你的电话] |
| **Email** | [你的邮箱] |

### 5.2 Demo Account（测试账号）

⚠️ **非常重要**：提供可用的测试账号供审核人员使用

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| **Username** | `test@readmigo.app` | 或创建专门的测试账号 |
| **Password** | [设置密码] | 确保可以正常登录 |

### 5.3 Notes（审核备注）

```
Thank you for reviewing Readmigo!

ABOUT THE APP:
Readmigo is an AI-powered English reading and learning app. Users can read public domain classic books with AI assistance for word explanations, sentence simplification, and translation.

DEMO ACCOUNT:
Email: test@readmigo.app
Password: [your password]

FEATURES TO TEST:
1. Sign in with Apple (recommended) or use demo account
2. Browse the book library
3. Open any book and start reading
4. Tap any word to get AI explanation
5. Long press a sentence to simplify it
6. Save words to vocabulary
7. Review vocabulary with flashcards
8. Check subscription options (do not purchase)

CONTENT:
All books are from public domain sources including Project Gutenberg, Standard Ebooks, and Internet Archive.

AI SERVICES:
We use OpenAI and DeepSeek APIs for AI features. All processing is done server-side with proper API authentication.

SUBSCRIPTION:
- Free tier: Limited AI interactions
- Premium: Unlimited AI features
- Monthly: $6.99
- Annual: $49.99

Please let us know if you have any questions!
```

---

## 第六步：版本发布（Version Release）

在页面底部，选择发布选项：

- ☑️ **Automatically release this version**（推荐）
- ⭕ **Manually release this version**（如果想自己控制发布时间）

---

## 第七步：保存并提交准备

1. 点击右上角的 **"Save"** 按钮保存所有更改
2. 此时不要点击 **"Add for Review"**，因为还需要：
   - 上传截图
   - 配置应用内购买
   - 配置App Privacy
   - 上传构建

---

## 第八步：应用内购买配置 (IAP)

### 8.1 代码实现状态

应用内购买已在代码中完整实现，使用 **StoreKit 2**。

**核心文件:**
- `ios/Readmigo/Features/Subscriptions/SubscriptionManager.swift` - 订阅管理
- `ios/Readmigo/Core/Models/Subscription.swift` - 订阅模型和功能限制
- `ios/Readmigo/Features/Subscriptions/PaywallView.swift` - 付费墙 UI
- `ios/Readmigo/Features/Subscriptions/FeatureGateService.swift` - 功能门控

### 8.2 产品ID配置

在 App Store Connect 中创建以下订阅产品：

| Product ID | 类型 | 价格 | 说明 |
|------------|------|------|------|
| `com.readmigo.pro.monthly` | 自动续订订阅 | $6.99/月 | Pro 月度订阅 |
| `com.readmigo.pro.yearly` | 自动续订订阅 | $49.99/年 | Pro 年度订阅 (含7天免费试用) |

### 8.3 订阅等级与功能限制

代码中已实现的功能限制 (`Subscription.swift`):

| 功能 | Free | Pro | Premium (预留) |
|------|------|-----|----------------|
| 书籍访问 | 10本 | 无限制 | 无限制 |
| AI 调用/天 | 5次 | 无限制 | 无限制 |
| 词汇保存 | 50个 | 无限制 | 无限制 |
| 离线下载 | 0本 | 10本 | 无限制 |
| 语音聊天 | 0分钟 | 30分钟/月 | 无限制 |
| 间隔重复 | ❌ | ✅ | ✅ |
| 高级 AI | ❌ | ❌ | ✅ |

### 8.4 App Store Connect 配置步骤

1. 进入 **"Subscriptions"** 标签
2. 创建订阅组：**"Readmigo Pro"**
3. 添加两个订阅产品 (使用上述 Product ID)
4. 设置价格和本地化信息
5. 上传订阅图标 (1024x1024)

### 8.5 后端验证

代码已实现服务端收据验证:
- 验证端点: `POST /subscriptions/verify`
- 使用 App Store Server API 验证交易
- 支持购买恢复 (`AppStore.sync()`)

---

## 第九步：Sign in with Apple 配置

### 9.1 代码实现状态

Sign in with Apple 已完整实现。

**核心文件:**
- `ios/Readmigo/Features/Auth/AuthView.swift` - 登录 UI
- `ios/Readmigo/Features/Auth/AuthManager.swift` - 认证管理

### 9.2 Entitlements 配置

当前 `Readmigo.entitlements` 已配置:
```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

### 9.3 Apple Developer Portal 配置

确保在 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) 中:

1. 选择 App ID: `com.readmigo.app`
2. 在 Capabilities 中勾选 **"Sign in with Apple"**
3. 保存配置

### 9.4 后端配置

后端端点: `POST /auth/apple`

需要配置:
- Apple Services ID
- Apple Team ID
- Apple Private Key (用于 JWT 生成)

---

## 第十步：CarPlay 配置 (可选)

### 10.1 代码实现状态

CarPlay 支持已完整实现，用于有声书播放。

**核心文件:**
- `ios/Readmigo/Features/CarPlay/CarPlaySceneDelegate.swift`

### 10.2 Info.plist 配置

已配置 CarPlay 场景:
```xml
<key>UIApplicationSceneManifest</key>
<dict>
    <key>CPTemplateApplicationSceneSessionRoleApplication</key>
    <array>
        <dict>
            <key>UISceneClassName</key>
            <string>CPTemplateApplicationScene</string>
            <key>UISceneConfigurationName</key>
            <string>CarPlay</string>
            <key>UISceneDelegateClassName</key>
            <string>$(PRODUCT_MODULE_NAME).CarPlaySceneDelegate</string>
        </dict>
    </array>
</dict>
```

### 10.3 Apple Developer Portal 配置

如需启用 CarPlay:
1. 申请 CarPlay Entitlement (需要 Apple 批准)
2. 选择类别: **Audio** (有声书播放)
3. 添加 entitlement: `com.apple.developer.carplay-audio`

⚠️ **注意**: CarPlay 需要单独向 Apple 申请批准，审核周期约 2-4 周。

---

## 第十一步：推送通知配置

### 11.1 代码实现状态

推送通知 **部分实现**:
- ✅ 后端基础设施已就绪 (`DeviceManager.swift`)
- ✅ 设备注册 API: `POST /devices/register` (包含 pushToken)
- ❌ 缺少: APNs 设备 token 请求代码
- ❌ 缺少: `UNUserNotificationCenter` delegate 实现

### 11.2 待完成的代码

在 `AppDelegate` 或启动流程中添加:

```swift
// 请求推送权限
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
    if granted {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

// 处理 APNs token
func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    DeviceManager.shared.updatePushToken(token)
}
```

### 11.3 Apple Developer Portal 配置

1. 在 App ID Capabilities 中勾选 **"Push Notifications"**
2. 创建 APNs Key 或 APNs Certificate
3. 配置后端使用 APNs Key (推荐)

---

## 第十二步：版本管理与强制更新

### 12.1 代码实现状态

版本管理已完整实现。

**核心文件:**
- `ios/Readmigo/Core/Services/VersionManager.swift`

### 12.2 功能特性

- 服务端版本检查 (1小时缓存)
- 强制更新提示
- 可选更新提示
- 更新日志展示 (中英文)

### 12.3 App Store URL

⚠️ **待更新**: 当前使用占位符 URL:
```swift
// VersionManager.swift:183
private let appStoreURL = URL(string: "https://apps.apple.com/app/readmigo/id123456789")!
```

上架后需更新为实际的 App Store ID。

---

## 📝 配置完成检查清单

### App Store Connect 配置

- [x] App已创建，Bundle ID正确 (`com.readmigo.app`)
- [x] App名称、副标题已填写
- [x] 分类已选择（Education + Books）
- [x] 年龄评级为4+
- [ ] 隐私政策URL已填写且可访问 ⚠️ `https://readmigo.app/privacy` 目前无法访问
- [x] 版本1.0已创建
- [x] 应用描述已填写
- [x] 关键词已填写
- [x] Support URL已填写
- [ ] 联系信息已填写
- [ ] 测试账号已创建并可用
- [ ] 审核备注已填写
- [x] 版本发布选项已选择

### 代码实现检查

- [x] Bundle ID 配置 (`Info.plist`)
- [x] 版本号和 Build 号 (`Info.plist`)
- [x] Sign in with Apple (`AuthManager.swift`, `AuthView.swift`)
- [x] Sign in with Apple Entitlement (`Readmigo.entitlements`)
- [x] StoreKit 2 订阅实现 (`SubscriptionManager.swift`)
- [x] 订阅产品 ID 定义 (`com.readmigo.pro.monthly`, `com.readmigo.pro.yearly`)
- [x] 功能门控实现 (`FeatureGateService.swift`)
- [x] 付费墙 UI (`PaywallView.swift`)
- [x] 恢复购买功能 (`RestorePurchasesView.swift`)
- [x] 版本管理 (`VersionManager.swift`)
- [x] CarPlay 支持 (`CarPlaySceneDelegate.swift`)
- [x] 崩溃上报 Sentry (`CrashTrackingService.swift`)
- [x] 设备管理 (`DeviceManager.swift`)
- [ ] 推送通知注册 ⚠️ 需要添加 APNs 注册代码
- [ ] App Store URL 更新 ⚠️ `VersionManager.swift` 中使用占位符 ID

---

## ⚠️ 常见问题

### Q1: Bundle ID在下拉菜单中找不到？
**A**: 需要先在Apple Developer Portal创建App ID：
1. 访问 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. 点击 "+" 创建新的Identifier
3. 选择 "App IDs" → "App"
4. Description: Readmigo
5. Bundle ID: `com.readmigo.app`
6. Capabilities: 勾选 "Sign in with Apple"
7. 保存后回到App Store Connect刷新页面

### Q2: 隐私政策URL还没有准备好怎么办？
**A**: 必须先准备好隐私政策网页，否则无法提交审核。可以：
1. 使用GitHub Pages快速托管
2. 使用现有网站创建privacy页面
3. 确保URL可以公开访问

### Q3: 测试账号应该如何准备？
**A**: 在后端创建专门的测试账号：
1. 邮箱：test@readmigo.app
2. 密码：设置简单易记的密码（至少8位）
3. 确保账号有示例数据（已读书籍、词汇等）
4. 确保Premium功能可以访问（给测试账号Premium权限）

### Q4: 截图必须现在就上传吗？
**A**: 不是必须的。可以先完成其他配置，截图准备好后再上传。但提交审核前必须上传所有必需尺寸的截图。

---

## 🎯 下一步

配置完App Store Connect基础信息后，继续进行：

### App Store Connect 任务

| 步骤 | 状态 | 说明 |
|------|------|------|
| **准备应用截图** | ⏳ 待完成 | 使用模拟器截取6张核心功能截图 |
| **配置应用内购买** | ✅ 已完成 | 已创建 `com.readmigo.pro.monthly` 和 `com.readmigo.pro.yearly` |
| **配置App Privacy** | ⏳ 待完成 | 声明数据收集和使用情况 |
| **部署隐私政策页面** | ❌ 未完成 | `https://readmigo.app/privacy` 目前无法访问 |
| **创建测试账号** | ⏳ 待完成 | 需要创建 `test@readmigo.app` 测试账号 |
| **构建并上传** | ⏳ 待完成 | 使用Xcode Archive上传到App Store Connect |
| **提交审核** | ⏳ 待完成 | 完成所有配置后提交审核 |

### 代码任务 (上架前需完成)

| 步骤 | 优先级 | 说明 |
|------|--------|------|
| **完善推送通知** | P2 | 添加 APNs 注册代码和通知处理 |
| **更新 App Store URL** | P0 | 上架后更新 `VersionManager.swift` 中的 App Store ID |
| **CarPlay 申请** | P3 | 如需 CarPlay 功能，需向 Apple 申请 entitlement |

### 核心文件索引

| 功能 | 文件路径 |
|------|---------|
| **订阅管理** | `ios/Readmigo/Features/Subscriptions/SubscriptionManager.swift` |
| **功能门控** | `ios/Readmigo/Features/Subscriptions/FeatureGateService.swift` |
| **付费墙** | `ios/Readmigo/Features/Subscriptions/PaywallView.swift` |
| **Sign in with Apple** | `ios/Readmigo/Features/Auth/AuthManager.swift` |
| **版本管理** | `ios/Readmigo/Core/Services/VersionManager.swift` |
| **设备管理** | `ios/Readmigo/Features/Devices/DeviceManager.swift` |
| **CarPlay** | `ios/Readmigo/Features/CarPlay/CarPlaySceneDelegate.swift` |
| **崩溃上报** | `ios/Readmigo/Core/Services/CrashTrackingService.swift` |
| **Entitlements** | `ios/Readmigo/Readmigo.entitlements` |
| **Info.plist** | `ios/Readmigo/Info.plist` |

---

**最后更新**: 2025-12-27
**文档版本**: 1.2
