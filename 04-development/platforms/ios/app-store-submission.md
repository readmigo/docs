# Readmigo App Store 上架指南

> 详细的 iOS App Store 上架流程和材料准备清单

---

## 目录

1. [前置准备](#1-前置准备)
2. [App Store Connect 配置](#2-app-store-connect-配置)
3. [App 信息填写](#3-app-信息填写)
4. [隐私政策与合规](#4-隐私政策与合规)
5. [应用截图与预览](#5-应用截图与预览)
6. [应用内购买配置](#6-应用内购买配置)
7. [Sign in with Apple 配置](#7-sign-in-with-apple-配置)
8. [构建与上传](#8-构建与上传)
9. [审核注意事项](#9-审核注意事项)
10. [上架后运营](#10-上架后运营)

---

## 1. 前置准备

### 1.1 开发者账号

| 项目 | 要求 | 状态 |
|------|------|------|
| Apple Developer Program | 已注册并激活 ($99/年) | ☐ |
| 开发者身份验证 | 已完成 D-U-N-S 验证（企业）或个人验证 | ☐ |
| 双重认证 | Apple ID 已开启 | ☐ |
| 税务与银行信息 | 在 App Store Connect 中完成配置 | ☐ |

### 1.3 技术要求检查

| 检查项 | Readmigo 状态 | 备注 |
|--------|---------------|------|
| 最低 iOS 版本 | iOS 17.0 | ✅ |
| 支持架构 | arm64 | ✅ |
| 支持设备 | iPhone, iPad | ✅ |
| 屏幕方向 | 纵向 + 横向 | ✅ |
| 暗黑模式适配 | 需确认 | ☐ |
| 无崩溃 | 需测试验证 | ☐ |
| 无内存泄漏 | 需测试验证 | ☐ |

---

## 2. App Store Connect 配置

### 2.1 创建 App

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 点击 **My Apps** → **+** → **New App**
3. 填写基本信息：

| 字段 | 值 |
|------|-----|
| Platform | iOS |
| Name | Readmigo |
| Primary Language | English |
| Bundle ID | com.readmigo.app |
| SKU | readmigo-ios-001 |
| User Access | Full Access |

### 2.2 App 信息配置

在 **App Information** 页面配置：

| 字段 | 值 |
|------|-----|
| Name | Readmigo - AI English Reading |
| Subtitle | Read Books. AI Has Your Back. |
| Category | Education (Primary) |
| Secondary Category | Books |
| Content Rights | 使用公共版权内容 |
| Age Rating | 4+ |

---

## 3. App 信息填写

### 3.1 应用描述 (App Description)

**英文版本（主语言）：**

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

Terms of Use: [URL]
Privacy Policy: [URL]
```

**中文版本（本地化）：**

```
Readmigo - AI 英文阅读学习

"读任何书，AI 为你护航。"

Readmigo 是一款 AI 原生的英文阅读学习应用，专为全球英语学习者设计。在智能 AI 的帮助下，轻松阅读英文原著，理解每一个单词、每一个句子、每一个故事。

📚 海量经典书库
• 200+ 本公版经典名著
• 莎士比亚、简·奥斯汀、狄更斯等大师作品
• 精心策划的分级书单
• 持续更新优质内容

🤖 AI 智能辅助
• 点击任意单词，获取语境化释义
• 一键简化复杂长难句
• 段落翻译成母语
• 向 AI 提问故事内容和人物
• AI 根据你的水平调整解释

📖 沉浸式阅读体验
• 精美可定制的阅读界面
• 多种主题，支持深色模式
• 可调字体和字号
• 自然语音朗读
• 多设备进度同步

📝 词汇高效记忆
• 阅读时随手收藏生词
• SM-2 间隔重复记忆算法
• 追踪词汇量增长
• 智能复习提醒

📊 学习数据追踪
• 阅读统计与趋势分析
• 词汇增长图表
• 连续阅读打卡
• 个性化学习洞察

订阅方案：
• Readmigo 免费版：有限 AI 次数，核心阅读功能
• Readmigo 高级版：无限 AI 调用，全部功能，优先客服

立即开启你的英文阅读之旅！

使用条款：[URL]
隐私政策：[URL]
```

### 3.2 关键词 (Keywords)

**英文关键词（100 字符限制）：**
```
english learning,reading,books,AI,vocabulary,ebook,classic literature,learn english,reader,study
```

**中文关键词：**
```
英语学习,阅读,电子书,AI,词汇,英文原著,学英语,阅读器,背单词,经典名著
```

### 3.3 Promotional Text

```
🎄 Holiday Special: 50% off Premium annual subscription! Master English reading with AI assistance.
```

### 3.4 What's New (版本更新说明)

```
Version 1.0 - Initial Release

• 200+ classic books from public domain
• AI-powered word explanations
• Sentence simplification
• Translation feature
• Vocabulary saving with spaced repetition
• Beautiful reading themes
• Text-to-speech support
• Reading progress sync
• Sign in with Apple
```

### 3.5 Support Information

| 字段 | 值 |
|------|-----|
| Support URL | https://readmigo.app/support |
| Marketing URL | https://readmigo.app |
| Privacy Policy URL | https://readmigo.app/privacy |
| Terms of Service URL | https://readmigo.app/terms |

---

## 4. 隐私政策与合规

### 4.1 App Privacy Details

在 App Store Connect 中配置 App Privacy：

**Data Collection Declaration:**

| 数据类型 | 收集 | 用途 | 关联用户 |
|---------|------|------|---------|
| Email Address | ✅ | 账户功能 | ✅ |
| User ID | ✅ | 账户功能 | ✅ |
| Name | ✅ | 账户功能 | ✅ |
| Purchase History | ✅ | 订阅管理 | ✅ |
| Product Interaction | ✅ | 产品个性化、分析 | ✅ |
| Crash Data | ✅ | 应用功能改进 | ❌ |
| Performance Data | ✅ | 应用功能改进 | ❌ |

### 4.2 隐私政策模板

需在网站上发布隐私政策，包含以下内容：

```markdown
# Privacy Policy for Readmigo

Last Updated: [Date]

## 1. Information We Collect

### 1.1 Account Information
- Email address (from Sign in with Apple)
- Display name (optional)
- User preferences

### 1.2 Reading Data
- Books in your library
- Reading progress
- Saved vocabulary words
- AI interaction history

### 1.3 Usage Analytics
- App usage patterns
- Feature engagement
- Crash reports

## 2. How We Use Your Information

- Provide and improve our services
- Sync your reading progress
- Personalize AI responses
- Send important notifications
- Analyze app performance

## 3. Data Sharing

We do not sell your personal data. We may share data with:
- AI service providers (for processing requests)
- Analytics providers (anonymized)
- As required by law

## 4. Data Retention

- Account data: Until account deletion
- Reading progress: Synced and stored
- Vocabulary: Until user deletes

## 5. Your Rights

- Access your data
- Request data deletion
- Export your data
- Opt out of analytics

## 6. Children's Privacy

Readmigo is suitable for all ages but does not knowingly
collect data from children under 13.

## 7. Contact Us

Email: privacy@readmigo.app
```

### 4.3 App 内必要披露

在 App 中添加以下入口：
- [ ] 隐私政策链接（设置页面）
- [ ] 服务条款链接（设置页面）
- [ ] 订阅条款说明（付费页面）

---

## 5. 应用截图与预览

### 5.1 截图尺寸要求

| 设备 | 尺寸 (像素) | 必需 |
|------|------------|------|
| iPhone 6.7" | 1290 × 2796 | ✅ |
| iPhone 6.5" | 1284 × 2778 | ✅ |
| iPhone 5.5" | 1242 × 2208 | ✅ |
| iPad Pro 12.9" (6th) | 2048 × 2732 | ✅ |
| iPad Pro 12.9" (2nd) | 2048 × 2732 | ✅ |

### 5.2 截图内容规划

**截图 1 - 首页/书库**
- 展示书库界面
- 标题文案: "200+ Classic Books at Your Fingertips"
- 副标题: "Curated collections for every level"

**截图 2 - 阅读界面**
- 展示优美的阅读界面
- 标题文案: "Beautiful Reading Experience"
- 副标题: "Customize fonts, themes, and more"

**截图 3 - AI 单词解释**
- 展示点击单词获取 AI 解释
- 标题文案: "AI Explains Every Word"
- 副标题: "Context-aware definitions instantly"

**截图 4 - AI 句子简化**
- 展示长难句简化功能
- 标题文案: "Simplify Complex Sentences"
- 副标题: "AI makes hard text easy to understand"

**截图 5 - 词汇学习**
- 展示词汇本和复习界面
- 标题文案: "Master Vocabulary Forever"
- 副标题: "Spaced repetition that works"

**截图 6 - 学习统计**
- 展示进度和统计数据
- 标题文案: "Track Your Growth"
- 副标题: "Reading stats, streaks, and insights"

### 5.3 App Preview Video (可选)

| 规格 | 要求 |
|------|------|
| 时长 | 15-30 秒 |
| 格式 | MP4, MOV |
| 分辨率 | 与截图尺寸相同 |
| 帧率 | 30 fps |
| 音频 | 可选（建议配乐）|

**视频脚本建议：**
1. 打开 App → 进入书库
2. 选择一本书 → 开始阅读
3. 点击单词 → AI 解释弹出
4. 长按句子 → 句子简化
5. 收藏单词 → 词汇本
6. 结尾 Logo + 标语

---

## 6. 应用内购买配置

### 6.1 订阅产品配置

**产品 1: 月度订阅**

| 字段 | 值 |
|------|-----|
| Reference Name | Readmigo Premium Monthly |
| Product ID | com.readmigo.premium.monthly |
| Type | Auto-Renewable Subscription |
| Subscription Group | Readmigo Premium |
| Price | $6.99/month |
| Display Name | Premium Monthly |
| Description | Unlimited AI interactions, all features |

**产品 2: 年度订阅**

| 字段 | 值 |
|------|-----|
| Reference Name | Readmigo Premium Annual |
| Product ID | com.readmigo.premium.annual |
| Type | Auto-Renewable Subscription |
| Subscription Group | Readmigo Premium |
| Price | $49.99/year |
| Display Name | Premium Annual |
| Description | Unlimited AI, save 40% compared to monthly |

### 6.2 订阅本地化

为每个支持的地区配置：
- Display Name（显示名称）
- Description（描述）
- 价格（根据地区调整）

### 6.3 订阅审核信息

需要在 App Store Connect 提供：
- [ ] 免费试用期说明（如有）
- [ ] 订阅取消流程说明
- [ ] 订阅自动续订说明
- [ ] 审核用测试账号

### 6.4 App 内订阅 UI 要求

确保 App 内包含：
- [ ] 清晰的订阅价格显示
- [ ] 订阅周期说明
- [ ] 自动续订说明
- [ ] 隐私政策链接
- [ ] 服务条款链接
- [ ] 恢复购买按钮

---

## 7. Sign in with Apple 配置

### 7.1 Apple Developer 配置

1. **创建 App ID**
```
Identifier: com.readmigo.app
Capabilities: Sign in with Apple ✅
```

2. **创建 Services ID**（用于后端验证）
```
Identifier: com.readmigo.service
Domains: api.readmigo.app
Return URLs: https://api.readmigo.app/auth/apple/callback
```

3. **创建密钥 (Key)**
```
Key Name: Readmigo Sign in with Apple
Services: Sign in with Apple ✅
```

### 7.2 Xcode 配置

在 Xcode 中：
1. 选择 Target → Signing & Capabilities
2. 点击 + Capability
3. 添加 "Sign in with Apple"

### 7.3 Info.plist 配置

确保 Info.plist 包含必要配置（已在项目中配置）。

---

## 8. 构建与上传

### 8.1 Archive 配置

**Build Settings 检查清单：**

| 设置 | 值 |
|------|-----|
| iOS Deployment Target | iOS 17.0 |
| Build Active Architecture Only | No (Release) |
| Code Signing Identity | Apple Distribution |
| Provisioning Profile | App Store Distribution |
| Strip Debug Symbols | Yes |
| Enable Bitcode | No (iOS 不再需要) |

### 8.2 版本号管理

| 字段 | 当前值 | 说明 |
|------|--------|------|
| CFBundleShortVersionString | 1.0 | 用户可见版本号 |
| CFBundleVersion | 1 | 构建号，每次提交递增 |

### 8.4 上传到 App Store Connect

**方式 1: Xcode Organizer**
1. Window → Organizer
2. 选择 Archive → Distribute App
3. 选择 "App Store Connect"
4. 选择 "Upload"
5. 等待上传和处理

**方式 2: Transporter**
1. 导出 .ipa 文件
2. 使用 Transporter 应用上传

### 8.5 构建处理

上传后 Apple 会处理构建：
- 通常需要 15-30 分钟
- 会收到处理完成邮件
- 在 App Store Connect 的 TestFlight 中查看状态

---

## 9. 审核注意事项

### 9.1 常见拒审原因及规避

**1. 设计相关 (Guideline 4.0)**

| 风险点 | 规避措施 |
|--------|---------|
| 崩溃或严重 Bug | 充分测试所有功能路径 |
| 未完成的占位功能 | 移除所有 "Coming Soon" 按钮 |
| 使用私有 API | 仅使用公开 API |
| 性能问题 | 优化启动时间和响应速度 |

**2. 元数据相关 (Guideline 2.3)**

| 风险点 | 规避措施 |
|--------|---------|
| 截图不代表实际功能 | 使用真实 App 截图 |
| 误导性描述 | 描述与功能一致 |
| 关键词堆砌 | 使用相关关键词 |

**3. 内容相关 (Guideline 1.0)**

| 风险点 | 规避措施 |
|--------|---------|
| 版权问题 | 仅使用公版书籍 |
| UGC 内容 | 如有社区功能需要内容审核机制 |
| 年龄评级错误 | 正确填写年龄评级问卷 |

**4. 隐私相关 (Guideline 5.1)**

| 风险点 | 规避措施 |
|--------|---------|
| 缺少隐私政策 | 确保隐私政策 URL 可访问 |
| 数据收集未披露 | 在 App Privacy 中完整披露 |
| 权限使用未说明 | 在 Info.plist 中添加使用说明 |

**5. 登录相关 (Guideline 4.8)**

| 风险点 | 规避措施 |
|--------|---------|
| 仅第三方登录无 Apple 登录 | 已实现 Sign in with Apple ✅ |
| 登录后无法使用 | 提供测试账号 |

**6. 内购相关 (Guideline 3.1)**

| 风险点 | 规避措施 |
|--------|---------|
| 订阅条款不清晰 | 明确显示价格、周期、续订信息 |
| 缺少恢复购买 | 实现恢复购买功能 |
| 价格显示问题 | 使用 StoreKit 获取本地价格 |

### 9.2 审核信息填写

**App Review Information:**

| 字段 | 内容 |
|------|------|
| Contact First Name | [Your Name] |
| Contact Last Name | [Your Last Name] |
| Contact Phone | [Phone Number] |
| Contact Email | [Email] |
| Demo Account Username | test@readmigo.app |
| Demo Account Password | [Test Password] |
| Notes for Reviewer | See notes below |

**Review Notes 模板：**

```
Thank you for reviewing Readmigo!

ABOUT THE APP:
Readmigo is an AI-powered English reading and learning app.
Users can read public domain classic books with AI assistance
for word explanations, sentence simplification, and translation.

DEMO ACCOUNT:
Email: test@readmigo.app
Password: [password]

KEY FEATURES TO TEST:
1. Sign in with Apple
2. Browse book library
3. Open a book and read
4. Tap any word for AI explanation
5. Long press a sentence for simplification
6. Save words to vocabulary
7. Review vocabulary flashcards
8. In-app subscription purchase

SUBSCRIPTION:
- Monthly: $6.99
- Annual: $49.99 (Save 40%)
- Free tier includes limited AI interactions
- Subscription unlocks unlimited AI features

CONTENT SOURCE:
All books are from public domain sources:
- Project Gutenberg
- Standard Ebooks
- Internet Archive

AI SERVICES:
We use third-party AI APIs (DeepSeek, OpenAI) for:
- Word explanations
- Sentence simplification
- Translation
All AI processing is done server-side.

PRIVACY:
We collect minimal data necessary for the app:
- Apple ID for authentication
- Reading progress for sync
- Vocabulary for spaced repetition
Full privacy policy: https://readmigo.app/privacy

Please contact us if you have any questions!
```

### 9.3 加急审核 (Expedited Review)

如需加急审核，在 Contact Us 页面说明理由：
- 关键 Bug 修复
- 安全漏洞修复
- 时效性活动配合

---

## 10. 上架后运营

### 10.1 监控指标

| 指标 | 数据来源 | 关注点 |
|------|---------|--------|
| 下载量 | App Store Connect | 日下载趋势 |
| 崩溃率 | Xcode Organizer | 保持 < 1% |
| 评分 | App Store Connect | 保持 > 4.5 |
| 转化率 | App Analytics | 页面→下载转化 |
| 订阅转化 | App Store Connect | 免费→付费转化 |
| 留存率 | 自建分析 | D1, D7, D30 |

### 10.2 评分与评价管理

- [ ] 实现 App 内评分请求 (SKStoreReviewController)
- [ ] 设置评分请求时机（完成首本书、连续阅读 3 天等）
- [ ] 定期回复用户评价
- [ ] 负面评价及时跟进处理

### 10.3 ASO 优化

**持续优化项：**
1. 监控关键词排名
2. A/B 测试不同截图组合
3. 根据季节/节日更新 Promotional Text
4. 分析竞品关键词策略

### 10.4 版本迭代计划

| 版本 | 重点功能 | 目标 |
|------|---------|------|
| 1.1 | Bug 修复、性能优化 | 稳定性 |
| 1.2 | 离线阅读增强 | 用户体验 |
| 1.3 | 社交功能 | 增长 |
| 2.0 | 重大功能更新 | 突破 |

---

## 附录 A: 检查清单总览

### 上架前检查清单

**开发者账号**
- [ ] Apple Developer Program 已激活
- [ ] 税务和银行信息已配置
- [ ] 发布证书和配置文件有效

**App Store Connect**
- [ ] App 已创建
- [ ] 所有元数据已填写
- [ ] 截图已上传（所有必需尺寸）
- [ ] 隐私政策 URL 可访问
- [ ] App Privacy 已配置

**订阅**
- [ ] 订阅产品已创建
- [ ] 订阅价格已配置
- [ ] 订阅本地化已完成
- [ ] App 内订阅 UI 合规

**构建**
- [ ] Release 配置无警告
- [ ] 所有功能测试通过
- [ ] 无崩溃
- [ ] 性能符合预期
- [ ] 构建已上传并处理完成

**审核**
- [ ] 审核信息已填写
- [ ] 测试账号可用
- [ ] Review Notes 已准备

---

## 附录 B: 常用链接

| 资源 | 链接 |
|------|------|
| App Store Connect | https://appstoreconnect.apple.com |
| Apple Developer | https://developer.apple.com |
| App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ |
| Human Interface Guidelines | https://developer.apple.com/design/human-interface-guidelines/ |
| App Store Marketing Guidelines | https://developer.apple.com/app-store/marketing/guidelines/ |
| Resolution Center | https://appstoreconnect.apple.com/resolution |

---

## 附录 C: 时间线估算

| 阶段 | 预计所需 |
|------|---------|
| 材料准备（截图、描述、隐私政策） | 2-3 天 |
| App Store Connect 配置 | 1 天 |
| 内部测试与修复 | 3-5 天 |
| TestFlight 外部测试 | 3-7 天 |
| 提交审核 | 1 天 |
| Apple 审核 | 1-7 天（通常 24-48 小时）|
| 总计 | 约 2-3 周 |

---

## 附录 D: 收入入账与税务处理

### D.1 海外市场 vs 中国大陆市场

Apple 将中国大陆市场与其他市场分开运营，需要**不同的开发者账号**：

| 市场 | 开发者账号 | 运营主体 | 收款要求 |
|------|-----------|---------|---------|
| 海外市场 | Apple Developer Program (国际) | Apple Inc. | 境外银行账户 |
| 中国大陆 | Apple Developer Program (中国) | 苹果电脑贸易(上海)有限公司 | 中国大陆银行账户 |

**重要**: 如需同时上架海外和中国市场，需要注册**两个独立的开发者账号**。

---

### D.2 海外市场收入入账

#### D.2.1 账户类型选择

**个人开发者**
- 使用个人境外银行账户收款
- 需提供个人税务信息（W-8BEN 表格）
- 收入按个人所得税申报

**公司开发者**
- 使用公司境外银行账户收款
- 需提供公司税务信息（W-8BEN-E 表格）
- 收入按企业所得税申报

#### D.2.2 银行账户要求

Apple 支持的收款方式：

| 地区 | 支持的银行/方式 | 币种 |
|------|----------------|------|
| 美国 | 美国银行账户 (ACH) | USD |
| 欧洲 | 欧洲银行 (SEPA) | EUR |
| 英国 | 英国银行 (BACS) | GBP |
| 香港 | 香港银行账户 | HKD/USD |
| 新加坡 | 新加坡银行账户 | SGD |
| 其他 | 国际电汇 (Wire) | 当地币种 |

**推荐方案（中国开发者海外收款）**：

1. **香港银行账户**（推荐）
   - 开户门槛相对较低
   - 支持多币种
   - 便于结汇回国内
   - 推荐银行：汇丰、渣打、中银香港

2. **美国银行账户**
   - 通过 Payoneer/Wise 获取虚拟账户
   - 或开设美国银行账户（如 Mercury、BOA）

3. **新加坡银行账户**
   - 适合设立海外公司的情况

#### D.2.3 付款周期

| 项目 | 说明 |
|------|------|
| 结算周期 | 每月一次 |
| 结算日期 | 每月月末 |
| 付款日期 | 次月的前 7-10 个工作日 |
| 最低付款金额 | $10 USD（或等值当地货币）|
| 付款延迟 | 首次付款可能延迟 2-3 个月 |

**示例时间线**：
```
1月份销售收入
  ↓
1月31日 结算完成
  ↓
2月7-10日 Apple 发起付款
  ↓
2月10-15日 到账（视银行而定）
```

#### D.2.4 Apple 分成比例

| 情况 | Apple 抽成 | 开发者收入 |
|------|-----------|-----------|
| 标准分成 | 30% | 70% |
| 小型企业计划（年收入 < $1M）| 15% | 85% |
| 订阅第二年起 | 15% | 85% |

**小型企业计划申请**：
- 前一年收入低于 100 万美元
- 需在 App Store Connect 中申请
- 申请地址：App Store Connect → Agreements, Tax, and Banking → Small Business Program

---

### D.3 中国大陆市场收入入账

#### D.3.1 账户要求

| 开发者类型 | 银行账户要求 | 税务处理 |
|-----------|-------------|---------|
| 个人开发者 | 中国大陆银行借记卡 | Apple 代扣个人所得税 |
| 企业开发者 | 公司对公银行账户 | 企业自行申报增值税和所得税 |

#### D.3.2 税务处理

**个人开发者**：
- Apple 按"劳务报酬"代扣代缴个人所得税
- 税率：20%-40%（累进）
- 开发者收到的是税后收入

**企业开发者**：
- Apple 支付含税收入
- 企业需自行：
  - 开具增值税发票给 Apple
  - 申报缴纳增值税（6%）
  - 申报缴纳企业所得税（25%）

#### D.3.3 付款周期

与海外市场类似，每月结算一次，次月付款。

---

### D.4 税务合规指南

#### D.4.1 美国税务（海外市场必填）

所有非美国开发者需要填写 **W-8BEN**（个人）或 **W-8BEN-E**（企业）表格：

**W-8BEN 关键信息**：
```
Part I - Identification
- Name: [您的姓名]
- Country of citizenship: China
- Permanent residence address: [中国地址]

Part II - Claim of Tax Treaty Benefits
- Country: China
- Article and percentage: Article 12, 0%
（中美税收协定，特许权使用费预提税率为 0%）

Part III - Certification
- 签名和日期
```

**重要**：正确填写税收协定信息可避免 30% 的美国预提税。

#### D.4.2 中国税务申报

**海外收入申报**（个人）：
- 需在次年 3-6 月进行个人所得税年度汇算
- 海外收入需按"经营所得"或"特许权使用费"申报
- 可抵扣已在海外缴纳的税款

**企业海外收入**：
- 计入企业营业收入
- 正常申报企业所得税
- 境外已缴税款可申请抵免

#### D.4.3 外汇结汇

海外收入汇入境内需要结汇：

**个人结汇**：
- 年度便利化额度：5 万美元
- 超过额度需提供收入证明
- 建议保留 App Store Connect 收入报表

**企业结汇**：
- 需要提供贸易背景证明
- 提供 Apple 付款通知
- 开具相应发票

---

### D.5 收款账户设置步骤

#### D.5.1 App Store Connect 配置

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 进入 **Agreements, Tax, and Banking**
3. 完成以下配置：

**第一步：接受协议**
- 接受 Paid Applications Agreement
- 接受 Apple Developer Program License Agreement

**第二步：填写税务信息**
- 点击 "Set Up" → Tax Forms
- 选择适用的税务身份
- 填写 W-8BEN 或 W-8BEN-E

**第三步：添加银行信息**
- 点击 "Set Up" → Banking
- 填写银行账户信息：
  - Bank Name（银行名称）
  - Account Holder Name（账户名）
  - Account Number（账户号）
  - SWIFT Code / Routing Number
  - Bank Address（银行地址）

#### D.5.2 验证流程

1. 提交后 Apple 会进行验证
2. 可能需要 1-3 个工作日
3. 首次付款时会发送小额测试款项
4. 需在 App Store Connect 确认金额

---

### D.6 财务报表与对账

#### D.6.1 可用报表

| 报表类型 | 内容 | 位置 |
|---------|------|------|
| Financial Reports | 月度收入明细 | Payments and Financial Reports |
| Sales and Trends | 销售数据 | Sales and Trends |
| Proceeds | 实际到账金额 | Payments and Financial Reports |

#### D.6.2 报表下载

```
App Store Connect
  → Payments and Financial Reports
    → Monthly Financial Reports
      → 选择月份
        → Download
```

报表格式：CSV，包含：
- 各国/地区销售明细
- 货币转换
- Apple 抽成
- 净收入

#### D.6.3 对账要点

每月收到付款后核对：
- [ ] 付款金额与报表一致
- [ ] 汇率换算正确
- [ ] 抽成比例正确（15% 或 30%）
- [ ] 记录入账日期和金额

---

### D.7 常见问题

**Q1: 可以用国内银行账户收取海外市场收入吗？**

不可以。海外市场收入只能汇入境外银行账户（如香港、美国银行）。

**Q2: 如何申请小型企业计划？**

在 App Store Connect → Agreements, Tax, and Banking → Small Business Program 中申请。需要前一年收入低于 100 万美元。

**Q3: 收入需要开发票吗？**

- 海外市场：Apple 作为代理商，通常不需要开票给 Apple
- 中国市场：企业开发者需要向 Apple 中国开具增值税发票

**Q4: 如何处理退款？**

退款会在下个月的结算中扣除，体现在 Financial Reports 中。

**Q5: 收入可以提前拿到吗？**

不可以。Apple 有固定的付款周期，无法提前。

---

### D.8 推荐架构（同时上架两个市场）

```
┌─────────────────────────────────────────────────────────────┐
│                      Readmigo 上架架构                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   海外市场            │    │   中国大陆市场         │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ 开发者账号：           │    │ 开发者账号：           │      │
│  │ Apple Developer      │    │ Apple Developer      │      │
│  │ Program (国际)       │    │ Program (中国)       │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ Bundle ID:           │    │ Bundle ID:           │      │
│  │ com.readmigo.app     │    │ com.readmigo.app.cn  │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ 收款账户：            │    │ 收款账户：            │      │
│  │ 香港银行 / 美国银行   │    │ 中国大陆银行          │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ 价格：               │    │ 价格：               │      │
│  │ $6.99 / $49.99      │    │ ¥48 / ¥348          │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**建议**：
1. 优先上架海外市场（审核较快、流程简单）
2. 使用香港公司 + 香港银行收取海外收入
3. 中国市场根据用户需求再决定是否上架

---

*文档版本: 1.1*
*最后更新: 2024年*
