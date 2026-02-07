# React Native 应用发布指南

> 使用 Expo EAS Build 构建并发布 Readmigo React Native 应用到 App Store 和 Google Play Store

**生成时间**: 2024-12-26
**项目**: Readmigo React Native App
**版本**: 1.0.0
**技术栈**: Expo SDK 52+ / EAS Build

---

## 1. 前置准备

### 1.1 账号要求

| 平台 | 账号类型 | 费用 | 注册链接 |
|------|----------|------|----------|
| Apple | Apple Developer Program | $99/年 | [developer.apple.com](https://developer.apple.com/programs/) |
| Google | Google Play Developer | $25 (一次性) | [play.google.com/console](https://play.google.com/console) |
| Expo | Expo Account | 免费 | [expo.dev](https://expo.dev/signup) |

---

## 2. EAS 配置

---

## 3. iOS 发布流程

### 3.1 Apple Developer 配置

#### 3.1.1 App Store Connect 创建 App

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 点击 **"我的 App"** → **"+"** → **"新建 App"**
3. 填写信息：

| 字段 | 填写内容 |
|------|----------|
| 平台 | iOS |
| 名称 | Readmigo - AI English Reading |
| 主要语言 | 英语(美国) |
| 套装 ID | com.readmigo.app |
| SKU | readmigo-ios |
| 用户访问权限 | 完全访问权限 |

#### 3.1.2 配置 App 信息

**App 信息页面填写**：

| 字段 | 填写内容 |
|------|----------|
| 名称 | Readmigo - AI English Reading |
| 副标题 | Read any book. AI has your back. |
| 类别 | 教育 |
| 次要类别 | 图书 |
| 内容版权 | 拥有或已获得授权 |
| 年龄分级 | 4+ |

### 3.5 App Store 商品详情

#### 截图要求

| 设备 | 尺寸 | 必需 |
|------|------|------|
| iPhone 6.7" | 1290×2796 | 是 |
| iPhone 6.5" | 1242×2688 | 是 |
| iPhone 5.5" | 1242×2208 | 否 |
| iPad Pro 12.9" | 2048×2732 | 如支持平板 |
| iPad Pro 11" | 1668×2388 | 如支持平板 |

#### 描述文本

**简短描述 (30字符)**：
```
AI-powered English reading
```

**关键词 (100字符)**：
```
english,reading,books,vocabulary,learning,ai,language,classic,literature,flashcards
```

**完整描述**：
```
Readmigo - AI-Powered English Reading & Learning

"Read any book. AI has your back."

Transform your English reading experience with Readmigo, the AI-native reading app designed for English learners worldwide.

EXTENSIVE LIBRARY
• 200+ public domain classics from renowned authors
• Shakespeare, Jane Austen, Charles Dickens, and more
• Carefully curated reading lists for all levels

AI-POWERED LEARNING
• Tap any word for instant, context-aware definitions
• Simplify complex sentences with one tap
• Translate passages to your native language
• AI adapts explanations to your level

IMMERSIVE READING
• Beautiful, customizable reader interface
• Multiple themes including dark mode
• Text-to-speech with natural voices
• Reading progress sync across devices

VOCABULARY MASTERY
• Save words while reading
• Spaced repetition flashcards (SM-2 algorithm)
• Track your vocabulary growth

SUBSCRIPTION OPTIONS:
• Free: Limited AI interactions, core reading features
• Premium: Unlimited AI, all features, priority support

Terms: https://readmigo.app/terms
Privacy: https://readmigo.app/privacy
```

#### App 隐私

| 数据类型 | 收集 | 关联用户 | 追踪 |
|----------|------|----------|------|
| 联系信息 (Email) | 是 | 是 | 否 |
| 标识符 (User ID) | 是 | 是 | 否 |
| 使用数据 | 是 | 是 | 否 |
| 购买记录 | 是 | 是 | 否 |

### 3.6 App 审核信息

**演示账号**：

| 字段 | 填写内容 |
|------|----------|
| 用户名 | test@readmigo.app |
| 密码 | [测试密码] |

**审核备注**：
```
Demo account has Premium subscription activated for testing all features.

App requires network connection for:
- User authentication
- Book content loading
- AI-powered features
- Reading progress sync

The app does NOT use any encryption beyond HTTPS for data transmission.
```

---

## 4. Android 发布流程

### 4.1 Google Play Console 配置

#### 4.1.1 创建应用

1. 登录 [Google Play Console](https://play.google.com/console)
2. 点击 **"创建应用"**
3. 填写信息：

| 字段 | 填写内容 |
|------|----------|
| 应用名称 | Readmigo |
| 默认语言 | 英语(美国) |
| 应用或游戏 | 应用 |
| 免费或付费 | 免费 |

#### 4.1.2 Google 服务账号密钥

为自动提交配置服务账号：

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建项目或选择现有项目
3. 启用 **Google Play Android Developer API**
4. 创建服务账号：
   - IAM & Admin → Service Accounts → Create
   - 授予 "Service Account User" 角色
5. 创建密钥（JSON 格式）
6. 下载并保存为 `google-service-account.json`
7. 在 Play Console 邀请服务账号：
   - 用户和权限 → 邀请新用户
   - 输入服务账号邮箱
   - 授予 "发布管理员" 权限

### 4.5 Play Store 商品详情

#### 应用内容政策

| 项目 | 配置 |
|------|------|
| 应用访问权限 | 部分功能受限（需登录） |
| 广告 | 否 |
| 内容分级 | 3+/Everyone |
| 目标受众 | 18+ |
| 数据安全 | 见下表 |

#### 数据安全声明

| 数据类型 | 收集 | 分享 | 用途 |
|----------|------|------|------|
| Email | 是 | 否 | 账号管理 |
| User ID | 是 | 否 | 应用功能 |
| 购买记录 | 是 | 否 | 订阅管理 |
| 应用互动 | 是 | 否 | 分析改进 |
| 设备 ID | 是 | 否 | 分析 |

#### 商品详情

**简短说明 (80字符)**：
```
Read English books with AI assistance. Learn vocabulary effortlessly.
```

**完整说明**：
```
Readmigo - AI-Powered English Reading & Learning

"Read any book. AI has your back."

Transform your English reading experience with Readmigo, the AI-native reading app designed for English learners worldwide.

📚 EXTENSIVE LIBRARY
• 200+ public domain classics from renowned authors
• Shakespeare, Jane Austen, Charles Dickens, and more
• Carefully curated reading lists for all levels

🤖 AI-POWERED LEARNING
• Tap any word for instant, context-aware definitions
• Simplify complex sentences with one tap
• Translate passages to your native language
• AI adapts explanations to your level

📖 IMMERSIVE READING
• Beautiful, customizable reader interface
• Multiple themes including dark mode
• Text-to-speech with natural voices
• Reading progress sync across devices

📝 VOCABULARY MASTERY
• Save words while reading
• Spaced repetition flashcards (SM-2 algorithm)
• Track your vocabulary growth

📊 TRACK YOUR PROGRESS
• Reading statistics and trends
• Vocabulary growth charts
• Reading streaks and achievements

SUBSCRIPTION OPTIONS:
• Free: Limited AI interactions, core reading features
• Premium: Unlimited AI, all features, priority support

Terms: https://readmigo.app/terms
Privacy: https://readmigo.app/privacy
```

---

## 5. 应用内购配置 (RevenueCat)

### 5.2 iOS 产品配置

在 App Store Connect → 我的 App → App 内购买项目：

**产品 1: 月度订阅**

| 字段 | 值 |
|------|------|
| 参考名称 | Premium Monthly |
| 产品 ID | premium_monthly |
| 订阅时长 | 1 个月 |
| 价格 | $6.99 |

**产品 2: 年度订阅**

| 字段 | 值 |
|------|------|
| 参考名称 | Premium Annual |
| 产品 ID | premium_annual |
| 订阅时长 | 1 年 |
| 价格 | $49.99 |

### 5.3 Android 产品配置

在 Play Console → 创收 → 产品 → 订阅：

**产品 1: 月度订阅**

| 字段 | 值 |
|------|------|
| 产品 ID | premium_monthly |
| 名称 | Premium Monthly |
| 续订周期 | 1 个月 |
| 价格 | $6.99 |

**产品 2: 年度订阅**

| 字段 | 值 |
|------|------|
| 产品 ID | premium_annual |
| 名称 | Premium Annual |
| 续订周期 | 1 年 |
| 价格 | $49.99 |

---

## 6. 环境变量配置

---

## 7. OTA 更新配置

---

## 8. 版本管理

### 8.1 语义化版本

```
版本格式: MAJOR.MINOR.PATCH

MAJOR: 不兼容的 API 变更
MINOR: 向后兼容的功能新增
PATCH: 向后兼容的 bug 修复

示例:
1.0.0 - 初始发布
1.0.1 - Bug 修复
1.1.0 - 新增功能
2.0.0 - 重大更新
```

---

## 9. 发布检查清单

### 9.1 构建前检查

- [ ] 代码已合并到 main 分支
- [ ] 所有测试通过
- [ ] TypeScript 无编译错误
- [ ] ESLint 无严重警告
- [ ] app.json 版本号已更新
- [ ] 更新日志已编写

### 9.2 iOS 检查

- [ ] Bundle ID 已在 Apple Developer 注册
- [ ] App Store Connect 应用已创建
- [ ] 截图已准备（所有必需尺寸）
- [ ] App 描述已填写
- [ ] 隐私政策 URL 可访问
- [ ] App 隐私问卷已完成
- [ ] 审核信息（演示账号）已准备

### 9.3 Android 检查

- [ ] Package name 已在 Play Console 注册
- [ ] 应用已创建
- [ ] 截图已准备
- [ ] 商品详情已填写
- [ ] 数据安全声明已完成
- [ ] 内容分级问卷已提交
- [ ] 测试账号信息已填写

### 9.4 发布后检查

- [ ] 应用可在商店搜索到
- [ ] 下载安装正常
- [ ] 登录功能正常
- [ ] 核心功能正常
- [ ] 订阅购买正常
- [ ] 崩溃监控已启用

---

## 10. 常用命令速查

---

## 11. 常见问题

### Q1: EAS Build 失败怎么办？

**A**:
1. 查看构建日志：`eas build:view`
2. 常见问题：
   - 依赖版本冲突：检查 package.json
   - 原生模块问题：检查 expo-doctor
   - 凭证问题：`eas credentials`

### Q2: iOS 审核被拒怎么办？

**A**:
1. 仔细阅读拒绝理由
2. 常见原因：
   - 崩溃或 bug
   - 功能不完整
   - 元数据问题
   - 隐私问题
3. 修复后重新提交

### Q3: Android 审核需要多长时间？

**A**:
- 新应用：1-3 天
- 更新：几小时到 1 天
- 如有敏感内容可能更长

### Q4: 如何回滚 OTA 更新？

**A**:

### Q5: 订阅测试账号如何设置？

**A**:
- iOS: App Store Connect → 沙盒测试员
- Android: Play Console → 许可测试

---

## 12. 相关文档

- [client-implementation-plan.md](./client-implementation-plan.md) - 客户端实现计划
- [design-system-implementation.md](./design-system-implementation.md) - 设计系统实现
- [modules/README.md](./modules/) - 模块规范总览

---

**最后更新**: 2024-12-26
**文档版本**: 1.0
