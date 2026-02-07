# Google Play Console 配置操作指南

> 详细的 Google Play Console 配置步骤，包括截图和具体填写内容

**生成时间**: 2024-12-26
**项目**: Readmigo Android App
**版本**: 1.0.0 (Version Code 1)
**Package Name**: com.readmigo.app

---

## 📋 准备工作清单

在开始之前，请确保你已经准备好：

- [ ] Google Play 开发者账号已激活（$25 一次性费用已支付）
- [ ] 登录 [Google Play Console](https://play.google.com/console)
- [ ] 浏览器：推荐使用 Chrome 最新版本
- [ ] 准备好签名密钥（Keystore）

---

## 第一步：创建应用

### 1.1 访问 Play Console

1. 登录 [Google Play Console](https://play.google.com/console)
2. 在首页点击 **"创建应用"** 按钮

### 1.2 填写应用详情

在创建应用对话框中填写：

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| **应用名称** | `Readmigo` | 在 Play 商店显示的名称 |
| **默认语言** | `英语(美国) - en-US` | 主要语言 |
| **应用或游戏** | ☑️ 应用 | 选择"应用" |
| **免费或付费** | ☑️ 免费 | 选择"免费"（应用内购买单独配置） |

### 1.3 声明

勾选以下声明：

- [ ] ☑️ 我确认此应用符合 [开发者计划政策](https://play.google.com/about/developer-content-policy/)
- [ ] ☑️ 我接受 [开发者分发协议](https://play.google.com/about/developer-distribution-agreement.html)

### 1.4 点击创建应用

点击右下角的 **"创建应用"** 按钮。

---

## 第二步：设置应用 - 信息中心任务

创建应用后会进入信息中心，需要完成以下任务才能发布：

```
┌─────────────────────────────────────────────────────────────┐
│                    设置您的应用                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  应用访问权限                    [   开始   ]               │
│  广告                           [   开始   ]               │
│  内容分级                        [   开始   ]               │
│  目标受众群体                    [   开始   ]               │
│  新闻应用                        [   开始   ]               │
│  COVID-19 接触者追踪应用和状态应用 [   开始   ]               │
│  数据安全                        [   开始   ]               │
│  政府应用                        [   开始   ]               │
│  金融功能                        [   开始   ]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 应用访问权限

**路径**: 政策 → 应用内容 → 应用访问权限

选择访问方式：

| 选项 | 是否选择 | 说明 |
|------|---------|------|
| **所有功能都无需特殊访问权限** | ⭕ | - |
| **全部或部分功能受到限制** | ☑️ | Readmigo 需要登录才能使用完整功能 |

填写说明：

**受限功能说明**:
```
Some features require user sign-in:
- Vocabulary saving and flashcards
- Reading progress sync
- AI-powered features (with subscription)
- Personalized recommendations

Users can browse the book library without signing in.
```

**测试账号**:
| 字段 | 填写内容 |
|------|---------|
| 用户名 | `test@readmigo.app` |
| 密码 | `[测试密码]` |

**其他说明**:
```
The demo account has Premium subscription activated for testing all features.
```

点击 **"保存"**。

### 2.2 广告

**路径**: 政策 → 应用内容 → 广告

| 问题 | 回答 |
|------|------|
| 您的应用是否包含广告？ | ☑️ **否** |

点击 **"保存"**。

### 2.3 内容分级

**路径**: 政策 → 应用内容 → 内容分级

1. 点击 **"开始问卷调查"**
2. 输入电子邮件地址：`dev@readmigo.app`
3. 选择类别：**实用工具、生产力、通讯及其他**

回答问卷（所有问题选择"否"）：

| 问题 | 回答 |
|------|------|
| 是否包含暴力内容？ | 否 |
| 是否包含色情内容？ | 否 |
| 是否涉及受管制物品？ | 否 |
| 是否包含粗俗用语？ | 否 |
| 是否包含用户生成的内容？ | 否 |
| 是否允许用户互动/通讯？ | 否 |
| 是否分享用户位置？ | 否 |
| 是否包含数字商品购买？ | 是 |
| 是否包含模拟赌博？ | 否 |

4. 点击 **"保存"** → **"提交"**
5. 预期评级结果：### 2.4 目标受众群体

**路径**: 政策 → 应用内容 → 目标受众群体和内容

| 问题 | 选择 |
|------|------|
| 目标年龄段 | ☑️ 18 岁及以上 |

> 注意：选择 18+ 可以避免额外的儿童隐私合规要求（COPPA）

点击 **"保存"** → **面向儿童设计的功能**:
| 问题 | 回答 |
|------|------|
| 是否包含面向儿童设计的功能？ | ☑️ 否 |

点击 **"保存"**。

### 2.5 新闻应用

**路径**: 政策 → 应用内容 → 新闻应用

| 问题 | 回答 |
|------|------|
| 是否为新闻应用？ | ☑️ 否 |

点击 **"保存"**。

### 2.6 COVID-19 接触者追踪

**路径**: 政策 → 应用内容 → COVID-19 接触者追踪应用和状态应用

| 问题 | 回答 |
|------|------|
| 是否为 COVID-19 相关应用？ | ☑️ 否 |

点击 **"保存"**。

### 2.7 数据安全

**路径**: 政策 → 应用内容 → 数据安全

这是非常重要的部分，需要准确声明数据收集情况。

#### 概览

| 问题 | 回答 |
|------|------|
| 是否收集或分享任何必需的用户数据类型？ | ☑️ 是 |
| 是否加密传输所有收集的用户数据？ | ☑️ 是 |
| 是否提供删除数据的方式？ | ☑️ 是 |

#### 数据类型

**个人信息**:

| 数据类型 | 收集 | 分享 | 用途 |
|----------|------|------|------|
| **姓名** | ☑️ 是 | ❌ 否 | 应用功能、账号管理 |
| **电子邮件地址** | ☑️ 是 | ❌ 否 | 应用功能、账号管理 |
| **用户 ID** | ☑️ 是 | ❌ 否 | 应用功能、分析 |

**财务信息**:

| 数据类型 | 收集 | 分享 | 用途 |
|----------|------|------|------|
| **购买记录** | ☑️ 是 | ❌ 否 | 应用功能 |

**应用活动**:

| 数据类型 | 收集 | 分享 | 用途 |
|----------|------|------|------|
| **应用互动** | ☑️ 是 | ❌ 否 | 分析、应用功能 |
| **应用内搜索记录** | ☑️ 是 | ❌ 否 | 应用功能 |
| **其他用户生成的内容** | ☑️ 是 | ❌ 否 | 应用功能（词汇、笔记） |

**设备或其他 ID**:

| 数据类型 | 收集 | 分享 | 用途 |
|----------|------|------|------|
| **设备或其他 ID** | ☑️ 是 | ❌ 否 | 分析 |

#### 数据处理详情

对于每种数据类型，填写：

| 字段 | 选择 |
|------|------|
| 是否为用户选择性提供？ | 是（账号信息除外） |
| 处理是否为临时性？ | 否 |
| 是否使用加密传输？ | 是 |
| 用户能否请求删除？ | 是 |

#### 隐私政策

| 字段 | 填写内容 |
|------|---------|
| **隐私政策网址** | `https://readmigo.app/privacy` |

点击 **"保存"** → **"提交"**。

### 2.8 政府应用

**路径**: 政策 → 应用内容 → 政府应用

| 问题 | 回答 |
|------|------|
| 是否为政府应用？ | ☑️ 否 |

点击 **"保存"**。

### 2.9 金融功能

**路径**: 政策 → 应用内容 → 金融功能

| 问题 | 回答 |
|------|------|
| 是否提供金融产品和服务？ | ☑️ 否 |

点击 **"保存"**。

---

## 第三步：商品详情

### 3.1 主要商品详情

**路径**: 发展 → 商品详情 → 主要商品详情

#### 应用详情

| 字段 | 填写内容 |
|------|---------|
| **应用名称** | `Readmigo - AI English Reading` |
| **简短说明** (80字符) | `Read English books with AI assistance. Learn vocabulary effortlessly.` |

#### 完整说明

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

### 3.2 图片素材

#### 应用图标

| 要求 | 规格 |
|------|------|
| 尺寸 | 512 × 512 像素 |
| 格式 | PNG（32 位，含 alpha 通道） |
| 文件大小 | 最大 1 MB |

#### 置顶大图 (Feature Graphic)

| 要求 | 规格 |
|------|------|
| 尺寸 | 1024 × 500 像素 |
| 格式 | PNG 或 JPG |
| 用途 | Play 商店顶部横幅 |

设计建议：
- 使用品牌色 `#2D5A7B` 作为背景
- 包含 Logo 和 Tagline "Read any book. AI has your back."
- 简洁明了，避免过多文字

#### 手机截图

| 要求 | 规格 |
|------|------|
| 尺寸 | 最小 320px，最大 3840px（长边）|
| 推荐 | 1080 × 1920 或 1080 × 2340 |
| 数量 | 最少 2 张，最多 8 张 |
| 格式 | PNG 或 JPG |

**建议截图内容** (6张):

1. **首页/书架** - 展示书籍库和继续阅读
2. **书籍详情** - 展示 AI 匹配度和难度评级
3. **阅读器** - 展示优雅的阅读界面
4. **AI 解释** - 展示点击单词获取 AI 解释
5. **词汇本** - 展示单词卡片和复习功能
6. **学习进度** - 展示统计和成就

#### 7 英寸平板截图 (可选)

| 要求 | 规格 |
|------|------|
| 尺寸 | 最小 320px，最大 3840px |
| 推荐 | 1200 × 1920 |
| 数量 | 最多 8 张 |

#### 10 英寸平板截图 (可选)

| 要求 | 规格 |
|------|------|
| 尺寸 | 最小 320px，最大 3840px |
| 推荐 | 1920 × 1200 |
| 数量 | 最多 8 张 |

### 3.3 视频 (可选)

| 字段 | 填写内容 |
|------|---------|
| **YouTube 视频链接** | (如有预告片可填写) |

点击 **"保存"**。

---

## 第四步：商品详情本地化

### 4.1 添加简体中文翻译

**路径**: 发展 → 商品详情 → 翻译 → 管理翻译

1. 点击 **"添加语言"**
2. 选择 **"中文（简体）"**

填写中文商品详情：

| 字段 | 填写内容 |
|------|---------|
| **应用名称** | `Readmigo - AI英语阅读` |
| **简短说明** | `AI智能辅助英语原版书阅读，轻松积累词汇` |

**完整说明**:

```
Readmigo - AI 原生英语阅读学习应用

"阅读任何书籍，AI 为你保驾护航"

使用 Readmigo 开启全新的英语阅读体验。这是一款专为全球英语学习者打造的 AI 原生阅读应用，让你在阅读经典文学的同时，借助智能 AI 助手轻松理解每个单词、句子和故事。

📚 海量书库
• 200+ 公版经典名著
• 莎士比亚、简·奥斯汀、狄更斯等大师作品
• 精心策划的分级书单
• 定期更新新书

🤖 AI 智能辅助
• 点击任意单词即刻获取语境释义
• 一键简化复杂句子
• 即时翻译段落
• 与 AI 探讨故事和角色
• AI 根据你的水平调整解释

📖 沉浸式阅读
• 精美可定制的阅读界面
• 多主题支持（含深色模式）
• 可调节字体和字号
• 自然语音朗读
• 跨设备同步阅读进度

📝 词汇精通
• 阅读时随时保存生词
• 间隔重复记忆卡片（SM-2 算法）
• 追踪词汇增长
• 优化记忆的复习模式

📊 进度追踪
• 阅读统计和趋势
• 词汇增长图表
• 阅读连续天数和成就
• 个性化阅读洞察

订阅选项：
• Readmigo 免费版：有限 AI 互动，核心阅读功能
• Readmigo 高级版：无限 AI 功能，全部特性，优先支持

立即开启你的英语阅读之旅，用 Readmigo 发现英语阅读的乐趣！

使用条款：https://readmigo.app/terms
隐私政策：https://readmigo.app/privacy
```

### 4.2 添加繁体中文翻译

重复上述步骤，选择 **"中文（繁体）"**。

---

## 第五步：应用类别

**路径**: 发展 → 商品详情 → 应用类别

| 字段 | 选择 |
|------|------|
| **应用类型** | 应用 |
| **类别** | 教育 |
| **标签** | 阅读、学习、书籍、词汇、英语 |

点击 **"保存"**。

---

## 第六步：联系方式

**路径**: 发展 → 商品详情 → 商品详情联系方式

| 字段 | 填写内容 |
|------|---------|
| **电子邮件地址** | `support@readmigo.app` |
| **电话号码** | (可选) |
| **网站** | `https://readmigo.app` |

点击 **"保存"**。

---

## 第七步：配置应用内购买 (订阅)

### 7.1 创建订阅

**路径**: 创收 → 产品 → 订阅

1. 点击 **"创建订阅"**
2. 填写订阅信息

#### 订阅 1: 月度订阅

| 字段 | 填写内容 |
|------|---------|
| **产品 ID** | `premium_monthly` |
| **名称** | `Readmigo Premium Monthly` |

**基础方案**:

| 字段 | 填写内容 |
|------|---------|
| **基础方案 ID** | `premium-monthly-base` |
| **标签** | 月度 |
| **自动续订** | 开启 |
| **续订周期** | 1 个月 |
| **价格** | $6.99 USD |

**本地化**:

| 语言 | 名称 | 说明 |
|------|------|------|
| 英语 | Premium Monthly | Unlimited AI features, ad-free reading |
| 中文(简体) | 高级版月订阅 | 无限 AI 功能，无广告阅读 |

#### 订阅 2: 年度订阅

| 字段 | 填写内容 |
|------|---------|
| **产品 ID** | `premium_annual` |
| **名称** | `Readmigo Premium Annual` |

**基础方案**:

| 字段 | 填写内容 |
|------|---------|
| **基础方案 ID** | `premium-annual-base` |
| **标签** | 年度 |
| **自动续订** | 开启 |
| **续订周期** | 1 年 |
| **价格** | $49.99 USD (节省 40%) |

### 7.2 订阅组

将两个订阅添加到同一订阅组：

| 字段 | 填写内容 |
|------|---------|
| **订阅组名称** | `Readmigo Premium` |
| **订阅** | premium_monthly, premium_annual |

---

## 第八步：测试轨道配置

### 8.1 内部测试

**路径**: 测试 → 内部测试

1. 点击 **"创建版本"**
2. 上传 AAB 文件
3. 填写版本说明

**版本说明**:
```
Internal testing build v1.0.0

Features:
- Book library with 200+ classics
- AI-powered word explanations
- Vocabulary flashcards
- Reading progress sync
```

4. 添加测试人员邮箱

### 8.2 封闭式测试 (Alpha)

**路径**: 测试 → 封闭式测试 → 管理轨道

创建测试轨道用于小范围测试。

### 8.3 开放式测试 (Beta)

**路径**: 测试 → 开放式测试

在正式发布前进行公开测试。

---

## 第九步：正式版发布

### 9.1 创建正式版本

**路径**: 正式版 → 创建版本

1. **上传 AAB 文件**
   - 确保使用 Play App Signing
   - AAB 文件由 Android Studio 生成

2. **版本代码和名称**
   | 字段 | 填写内容 |
   |------|---------|
   | 版本代码 | `1` (自动读取) |
   | 版本名称 | `1.0.0` |

3. **版本说明**

```
Version 1.0.0 - Initial Release

Welcome to Readmigo!

• 200+ classic books from public domain
• AI-powered word explanations and sentence simplification
• Context-aware translation
• Vocabulary saving with spaced repetition flashcards
• Beautiful reading themes with dark mode support
• Text-to-speech with natural voices
• Reading progress sync across devices
• Sign in with Google for secure authentication

Start your English reading journey today!
```

### 9.2 发布国家/地区

**路径**: 正式版 → 国家/地区

选择发布地区：

- ☑️ 所有国家/地区（推荐）

或选择特定地区：
- ☑️ 中国大陆
- ☑️ 美国
- ☑️ 台湾
- ☑️ 香港
- ☑️ 等...

### 9.3 审核并发布

1. 点击 **"审核版本"**
2. 检查所有警告和错误
3. 点击 **"开始发布正式版"**

---

## 第十步：Play App Signing

### 10.1 启用 Play App Signing

**路径**: 设置 → 应用完整性

1. 选择 **"让 Google 管理并保护您的应用签名密钥（推荐）"**
2. 上传上传密钥

---

## 📝 配置完成检查清单

### 政策合规

- [ ] 应用访问权限已配置（含测试账号）
- [ ] 广告声明已完成（无广告）
- [ ] 内容分级问卷已提交（3+/Everyone）
- [ ] 目标受众群体已选择（18+）
- [ ] 数据安全声明已完成
- [ ] 隐私政策 URL 已填写且可访问

### 商品详情

- [ ] 应用名称和说明已填写（英文）
- [ ] 中文本地化已完成
- [ ] 应用图标已上传（512×512）
- [ ] 置顶大图已上传（1024×500）
- [ ] 手机截图已上传（至少 2 张）
- [ ] 类别已选择（教育）
- [ ] 联系方式已填写

### 订阅产品

- [ ] 月度订阅已创建（$6.99）
- [ ] 年度订阅已创建（$49.99）
- [ ] 订阅组已配置
- [ ] 本地化价格已设置

### 发布

- [ ] AAB 文件已上传
- [ ] Play App Signing 已启用
- [ ] 版本说明已填写
- [ ] 发布国家/地区已选择

---

## ⚠️ 常见问题

### Q1: 如何获取 AAB 文件？

**A**: 在 Android Studio 中：
1. 菜单 → Build → Generate Signed Bundle / APK
2. 选择 Android App Bundle
3. 选择或创建 Keystore
4. 选择 release 变体
5. 完成后在 `app/release/` 目录找到 `.aab` 文件

### Q2: 数据安全声明填错了怎么办？

**A**: 可以随时修改并重新提交。但要确保声明与实际数据收集行为一致，否则可能导致应用被下架。

### Q3: 内容分级显示不同地区评级不同？

**A**: 这是正常的。不同地区有不同的分级系统（如美国 ESRB、欧洲 PEGI、日本 CERO 等），Google 会根据问卷答案自动计算各地区评级。

### Q4: 订阅价格如何设置其他货币？

**A**: 在订阅详情页面，点击"管理价格"可以为每个国家/地区设置本地货币价格。Google 也提供"自动转换价格"选项。

### Q5: 审核需要多长时间？

**A**: 新应用通常需要 1-3 天。如果内容复杂或有敏感内容，可能需要更长时间。更新版本通常几小时到 1 天内完成审核。

### Q6: 测试账号必须是 Gmail 吗？

**A**: 应用访问权限中的测试账号可以是任何邮箱。但如果使用 Google Sign-In，测试人员需要用添加到测试者列表的 Google 账号。

---

## 🎯 下一步

配置完 Google Play Console 基础信息后，继续进行：

1. ✅ **准备应用截图** - 使用模拟器截取核心功能截图
2. ✅ **生成 AAB 文件** - Android Studio 构建发布版本
3. ✅ **内部测试** - 先进行内部测试确保功能正常
4. ✅ **封闭测试** - 邀请小范围用户测试
5. ✅ **提交正式版** - 完成所有配置后提交审核

---

## 相关文档

- [play-store-submission.md](./play-store-submission.md) - Play Store 提交指南
- [design-system-implementation.md](./design-system-implementation.md) - 设计系统实现

---

**最后更新**: 2024-12-26
**文档版本**: 1.0
