# Readmigo Google Play Store 上架指南

> 详细的 Android Google Play 上架流程和材料准备清单

---

## 目录

1. [前置准备](#1-前置准备)
2. [Google Play Console 配置](#2-google-play-console-配置)
3. [应用信息填写](#3-应用信息填写)
4. [隐私与合规](#4-隐私与合规)
5. [应用截图与素材](#5-应用截图与素材)
6. [应用内购买配置](#6-应用内购买配置)
7. [Google Sign-In 配置](#7-google-sign-in-配置)
8. [构建与上传](#8-构建与上传)
9. [审核注意事项](#9-审核注意事项)
10. [上架后运营](#10-上架后运营)

---

## 1. 前置准备

### 1.1 开发者账号

| 项目 | 要求 | 状态 |
|------|------|------|
| Google Play Developer Account | 已注册并激活 ($25 一次性费用) | ☐ |
| 身份验证 | 已完成身份验证 | ☐ |
| 付款资料 | 已设置收款账户 (Google Payments) | ☐ |
| 双重认证 | Google 账号已开启 | ☐ |

### 1.2 签名配置

```bash
# 所需签名
├── Upload Key (上传密钥) - 用于签署上传的 AAB
├── App Signing Key (应用签名密钥) - 由 Google Play 管理
└── Release Keystore 备份 - 安全保存

# 使用 Play App Signing
# Google Play 会管理应用签名密钥，开发者使用上传密钥
```

### 1.3 技术要求检查

| 检查项 | Readmigo 状态 | 备注 |
|--------|---------------|------|
| 最低 Android 版本 | Android 8.0 (API 26) | ✅ |
| 目标 SDK 版本 | Android 14 (API 34) | ✅ |
| 支持架构 | arm64-v8a, armeabi-v7a | ✅ |
| 64 位支持 | 必须支持 | ✅ |
| AAB 格式 | 使用 Android App Bundle | ✅ |
| 深色模式适配 | 需确认 | ☐ |
| 无崩溃 | 需测试验证 | ☐ |

---

## 2. Google Play Console 配置

### 2.1 创建应用

1. 登录 [Google Play Console](https://play.google.com/console)
2. 点击 **Create app**
3. 填写基本信息：

| 字段 | 值 |
|------|-----|
| App name | Readmigo - AI English Reading |
| Default language | English (en-US) |
| App or game | App |
| Free or paid | Free (with in-app purchases) |

### 2.2 设置应用访问权限

在 **Policy** → **App access** 中配置：

| 选项 | 选择 |
|------|------|
| All functionality available without restrictions | ✅ (游客模式可浏览) |
| Some functionality restricted | ☐ |
| All or some functionality restricted | ☐ |

### 2.3 广告声明

| 问题 | 回答 |
|------|------|
| Does your app contain ads? | No |

---

## 3. 应用信息填写

### 3.1 商品详情 (Store Listing)

**英文版本（主语言）：**

**Short description (80 字符):**
```
AI-powered English reading app. Read classics with instant word help.
```

**Full description (4000 字符):**
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

**中文版本（本地化）：**

**简短说明：**
```
AI 英文阅读学习应用，200+ 经典名著，AI 即时解词释义。
```

**完整说明：**
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

使用条款：https://readmigo.app/terms
隐私政策：https://readmigo.app/privacy
```

### 3.2 分类

| 字段 | 值 |
|------|-----|
| Application type | Application |
| Category | Education |
| Tags | Education, Books & Reference |
| Content rating | Everyone |

### 3.3 联系方式

| 字段 | 值 |
|------|-----|
| Email | support@readmigo.app |
| Phone | +86 400-XXX-XXXX (可选) |
| Website | https://readmigo.app |

---

## 4. 隐私与合规

### 4.1 数据安全 (Data Safety)

在 **Policy** → **App content** → **Data safety** 中配置：

**数据收集声明：**

| 数据类型 | 收集 | 共享 | 用途 |
|---------|------|------|------|
| Email address | ✅ | ❌ | 账户管理 |
| User IDs | ✅ | ❌ | 账户管理 |
| Name | ✅ | ❌ | 账户管理 |
| Purchase history | ✅ | ❌ | 订阅管理 |
| App interactions | ✅ | ❌ | 分析、个性化 |
| Crash logs | ✅ | ❌ | 应用稳定性 |
| Performance data | ✅ | ❌ | 应用性能 |

**安全措施：**
- [x] Data is encrypted in transit
- [x] You can request that data be deleted

### 4.2 隐私政策

| 字段 | 值 |
|------|-----|
| Privacy policy URL | https://readmigo.app/privacy |

### 4.3 内容分级 (Content Rating)

完成 IARC 问卷：

| 问题类别 | 回答 |
|---------|------|
| 暴力内容 | 无 |
| 性内容 | 无 |
| 语言 | 无粗俗语言 |
| 受控物质 | 无 |
| 用户生成内容 | 无/有限 |
| 位置共享 | 无 |
| 数字商品购买 | 是（订阅） |

预期评级：**Everyone (所有人)**

### 4.4 目标受众

| 字段 | 值 |
|------|-----|
| Target age group | 13 岁及以上 |
| Designed for children | 否 |

### 4.5 广告声明

| 字段 | 值 |
|------|-----|
| Contains ads | 否 |

---

## 5. 应用截图与素材

### 5.1 图标要求

| 类型 | 尺寸 | 格式 | 要求 |
|------|------|------|------|
| App icon | 512 × 512 px | PNG (32-bit) | 无透明背景 |

### 5.2 特征图 (Feature Graphic)

| 类型 | 尺寸 | 格式 |
|------|------|------|
| Feature graphic | 1024 × 500 px | PNG or JPEG |

### 5.3 截图要求

**手机截图：**

| 设备类型 | 尺寸 | 数量 |
|---------|------|------|
| Phone | 最小 320px，最大 3840px | 2-8 张 |
| 推荐尺寸 | 1080 × 1920 px (16:9) 或 1080 × 2400 px (9:20) | - |

**平板截图（可选）：**

| 设备类型 | 尺寸 | 数量 |
|---------|------|------|
| 7" Tablet | 最小 320px，最大 3840px | 最多 8 张 |
| 10" Tablet | 最小 320px，最大 3840px | 最多 8 张 |

### 5.4 截图内容规划

**截图 1 - 首页/书库**
- 展示书库界面
- 标题: "200+ Classic Books"
- 副标题: "Curated for every level"

**截图 2 - 阅读界面**
- 展示优美的阅读界面
- 标题: "Beautiful Reading"
- 副标题: "Customize your experience"

**截图 3 - AI 单词解释**
- 展示 AI 解释功能
- 标题: "AI Explains Every Word"
- 副标题: "Context-aware definitions"

**截图 4 - AI 句子简化**
- 展示长难句简化
- 标题: "Simplify Complex Text"
- 副标题: "AI makes reading easy"

**截图 5 - 词汇学习**
- 展示词汇本和复习
- 标题: "Master Vocabulary"
- 副标题: "Spaced repetition that works"

**截图 6 - 学习统计**
- 展示进度和统计
- 标题: "Track Your Growth"
- 副标题: "Stats, streaks, insights"

### 5.5 宣传视频（可选）

| 规格 | 要求 |
|------|------|
| 格式 | YouTube URL |
| 时长 | 30 秒 - 2 分钟 |
| 内容 | 展示核心功能 |

---

## 6. 应用内购买配置

### 6.1 Google Play Billing 设置

在 **Monetize** → **Products** → **Subscriptions** 中创建：

**产品 1: 月度订阅**

| 字段 | 值 |
|------|-----|
| Product ID | premium_monthly |
| Name | Premium Monthly |
| Description | Unlimited AI interactions, all features |
| Billing period | Monthly |
| Price | $6.99 |
| Grace period | 7 days |
| Free trial | 7 days (可选) |

**产品 2: 年度订阅**

| 字段 | 值 |
|------|-----|
| Product ID | premium_annual |
| Name | Premium Annual |
| Description | Unlimited AI, save 40% compared to monthly |
| Billing period | Yearly |
| Price | $49.99 |
| Grace period | 14 days |
| Free trial | 7 days (可选) |

### 6.2 订阅设置

**Base plans (基础方案):**
- 配置不同地区的价格
- 设置介绍性优惠（可选）

**Offers (优惠):**
- 首次订阅折扣
- 升级优惠

### 6.3 价格本地化

| 地区 | 月度价格 | 年度价格 |
|------|---------|---------|
| 美国 | $6.99 | $49.99 |
| 中国 | ¥48 | ¥348 |
| 欧洲 | €6.99 | €49.99 |
| 日本 | ¥980 | ¥6,800 |

### 6.4 License Testing

在 **Setup** → **License testing** 中添加测试账号：

```
test1@gmail.com
test2@gmail.com
```

测试账号可以免费订阅和测试购买流程。

---

## 7. Google Sign-In 配置

### 7.1 Google Cloud Console 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建或选择项目
3. 启用 **Google Sign-In API**

### 7.2 OAuth 2.0 配置

**创建 OAuth 客户端 ID：**

| 类型 | 用途 |
|------|------|
| Android | 应用内登录 |
| Web application | 后端验证 |

**Android 客户端配置：**

| 字段 | 值 |
|------|-----|
| Name | Readmigo Android |
| Package name | com.readmigo.app |
| SHA-1 fingerprint | [从 keystore 获取] |

获取 SHA-1:
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### 7.3 代码配置

```kotlin
// build.gradle
implementation("com.google.android.gms:play-services-auth:20.7.0")

// 获取 Web Client ID 用于后端验证
val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken(getString(R.string.web_client_id))
    .requestEmail()
    .build()
```

---

## 8. 构建与上传

### 8.1 构建配置

**build.gradle.kts (app):**

```kotlin
android {
    namespace = "com.readmigo.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.readmigo.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

### 8.2 签名配置

**创建 keystore:**

```bash
keytool -genkey -v -keystore readmigo-release.keystore \
  -alias readmigo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**signing.properties (勿提交到 Git):**

```properties
storeFile=../readmigo-release.keystore
storePassword=your_store_password
keyAlias=readmigo
keyPassword=your_key_password
```

### 8.3 构建 AAB

```bash
# 使用 Gradle
./gradlew bundleRelease

# 输出位置
# app/build/outputs/bundle/release/app-release.aab
```

### 8.4 上传到 Google Play

**方式 1: Play Console 网页**
1. **Production** → **Create new release**
2. 上传 AAB 文件
3. 填写版本说明
4. 点击 **Review release**
5. 点击 **Start rollout to Production**

**方式 2: Google Play Developer API**

使用 CI/CD 自动化上传（如 Fastlane）。

### 8.5 发布轨道

| 轨道 | 用途 | 审核时间 |
|------|------|---------|
| Internal testing | 内部测试，最多 100 人 | 即时 |
| Closed testing | 受邀测试，无人数限制 | 即时 |
| Open testing | 公开测试 | 几小时 |
| Production | 正式发布 | 几小时到几天 |

**推荐流程:**
1. Internal testing → 内部验证
2. Closed testing → 小范围测试
3. Open testing → 收集反馈（可选）
4. Production → 正式发布

---

## 9. 审核注意事项

### 9.1 常见拒审原因及规避

**1. 政策违规**

| 风险点 | 规避措施 |
|--------|---------|
| 隐私政策缺失 | 确保隐私政策 URL 可访问 |
| 数据收集未披露 | 完整填写 Data Safety |
| 权限使用未说明 | 添加权限使用说明 |

**2. 功能问题**

| 风险点 | 规避措施 |
|--------|---------|
| 崩溃 | 充分测试所有路径 |
| ANR (应用无响应) | 避免主线程阻塞 |
| 未完成功能 | 移除占位功能 |

**3. 内容问题**

| 风险点 | 规避措施 |
|--------|---------|
| 版权问题 | 仅使用公版书籍 |
| 误导性描述 | 描述与功能一致 |
| 年龄评级错误 | 正确填写问卷 |

**4. 付款相关**

| 风险点 | 规避措施 |
|--------|---------|
| 使用第三方支付 | 仅使用 Google Play Billing |
| 订阅条款不清 | 明确显示价格和周期 |
| 缺少取消说明 | 提供取消订阅入口 |

### 9.2 权限说明

在 strings.xml 中添加权限说明：

```xml
<!-- 网络权限 -->
<!-- 无需额外说明 -->

<!-- 如需其他权限，添加说明 -->
<string name="permission_rationale_storage">
    需要存储权限以保存离线书籍
</string>
```

### 9.3 版本说明 (Release Notes)

```
Version 1.0.0 - Initial Release

• 200+ classic books from public domain
• AI-powered word explanations
• Sentence simplification
• Translation feature
• Vocabulary saving with spaced repetition
• Beautiful reading themes
• Text-to-speech support
• Reading progress sync
• Google Sign-In
```

### 9.4 测试步骤文档

提供给审核团队的测试说明：

```
TEST INSTRUCTIONS FOR REVIEWERS

ABOUT THE APP:
Readmigo is an AI-powered English reading and learning app.

KEY FEATURES TO TEST:
1. Sign in with Google
2. Browse book library (200+ books)
3. Open a book and start reading
4. Tap any word for AI explanation
5. Long press a sentence for simplification
6. Save words to vocabulary
7. Review vocabulary flashcards
8. Subscribe to Premium (use test card)

SUBSCRIPTION:
- Monthly: $6.99
- Annual: $49.99
- Free tier includes limited AI
- Premium unlocks unlimited AI

CONTENT SOURCE:
All books are public domain from:
- Project Gutenberg
- Standard Ebooks
- Internet Archive

PRIVACY:
Full privacy policy: https://readmigo.app/privacy
```

---

## 10. 上架后运营

### 10.1 监控指标

| 指标 | 数据来源 | 关注点 |
|------|---------|--------|
| 安装量 | Play Console | 日安装趋势 |
| 卸载率 | Play Console | 保持 < 5% |
| 崩溃率 | Play Console / Firebase | 保持 < 1% |
| ANR 率 | Play Console | 保持 < 0.5% |
| 评分 | Play Console | 保持 > 4.5 |
| 评价 | Play Console | 及时回复 |
| 订阅转化 | Play Console | 免费→付费 |
| 留存率 | Firebase Analytics | D1, D7, D30 |

### 10.2 Android Vitals

保持健康的 Android Vitals 指标：

| 指标 | 目标 | 影响 |
|------|------|------|
| 崩溃率 | < 1.09% | 影响排名 |
| ANR 率 | < 0.47% | 影响排名 |
| 过度唤醒 | 低 | 电池优化 |
| 唤醒锁 | 低 | 电池优化 |

### 10.3 评分与评价管理

- [ ] 实现应用内评分请求 (In-App Review API)
- [ ] 设置评分请求时机（完成首本书等）
- [ ] 定期回复用户评价
- [ ] 负面评价及时跟进

**In-App Review API 使用：**

```kotlin
val manager = ReviewManagerFactory.create(context)
val request = manager.requestReviewFlow()
request.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val reviewInfo = task.result
        manager.launchReviewFlow(activity, reviewInfo)
    }
}
```

### 10.4 ASO 优化

**持续优化项：**
1. 监控关键词排名
2. A/B 测试不同截图
3. 优化短描述和完整描述
4. 分析竞品策略

### 10.5 版本迭代

| 版本 | 重点功能 | 目标 |
|------|---------|------|
| 1.1 | Bug 修复、性能优化 | 稳定性 |
| 1.2 | 离线阅读增强 | 用户体验 |
| 1.3 | 社交功能 | 增长 |
| 2.0 | 重大功能更新 | 突破 |

---

## 附录 A: 检查清单

### 上架前检查清单

**开发者账号**
- [ ] Google Play Developer 账号已激活
- [ ] 付款资料已配置
- [ ] 签名密钥已创建并备份

**Play Console**
- [ ] 应用已创建
- [ ] 商品详情已填写（所有语言）
- [ ] 截图已上传
- [ ] 隐私政策 URL 可访问
- [ ] Data Safety 已配置
- [ ] 内容分级已完成
- [ ] 目标受众已设置

**订阅**
- [ ] 订阅产品已创建
- [ ] 价格已配置（所有地区）
- [ ] 测试账号已添加

**构建**
- [ ] Release 配置无警告
- [ ] 所有功能测试通过
- [ ] 无崩溃
- [ ] 性能符合预期
- [ ] AAB 已上传

---

## 附录 B: 收入入账与税务

### B.1 付款设置

1. 访问 **Setup** → **Payments profile**
2. 填写公司/个人信息
3. 添加银行账户信息

### B.2 分成比例

| 情况 | Google 抽成 | 开发者收入 |
|------|-----------|-----------|
| 标准分成 | 30% | 70% |
| 订阅第一年 | 15% | 85% |
| 年收入 < $1M | 15% | 85% |

### B.3 付款周期

| 项目 | 说明 |
|------|------|
| 结算周期 | 每月 |
| 付款日期 | 次月 15 日左右 |
| 最低付款金额 | $100 USD |

### B.4 税务信息

在 **Setup** → **Payments profile** → **Manage tax info** 中填写：

- W-8BEN (个人) 或 W-8BEN-E (企业)
- 选择适用的税收协定

---

## 附录 C: 常用链接

| 资源 | 链接 |
|------|------|
| Google Play Console | https://play.google.com/console |
| Google Cloud Console | https://console.cloud.google.com |
| Play 政策中心 | https://play.google.com/about/developer-content-policy/ |
| Material Design | https://m3.material.io |
| Android Developers | https://developer.android.com |
| Google Play Billing | https://developer.android.com/google/play/billing |

---

*文档版本: 1.0*
*最后更新: 2025-12-26*
