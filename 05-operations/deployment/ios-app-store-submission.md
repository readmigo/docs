# iOS App Store 提交指南

## 前置条件检查 ✅

- [x] 后端 API 已部署 (readmigo-v1)
- [x] DNS 配置完成 (v1.api.readmigo.app)
- [x] SSL 证书已颁发
- [x] iOS 版本号: 1.0.0
- [x] Bundle ID: com.readmigo.app

---

## 步骤 1: 在 Xcode 中打开项目

```bash
open ios/Readmigo.xcodeproj
```

或手动打开：
- 双击 `ios/Readmigo/Readmigo.xcodeproj`

---

## 步骤 2: 选择 Generic iOS Device

在 Xcode 顶部工具栏：
1. 点击设备选择器（左侧）
2. 选择 **Any iOS Device (arm64)**

```
┌─────────────────────────────────────┐
│ Readmigo > Any iOS Device (arm64)  │ ← 选择这个
└─────────────────────────────────────┘
```

---

## 步骤 3: 检查签名配置

1. 左侧选择 **Readmigo** 项目
2. 选择 **Readmigo** Target
3. 选择 **Signing & Capabilities** 标签

确认配置：
```
Team: (你的 Apple Developer 团队)
Bundle Identifier: com.readmigo.app
Signing Certificate: Apple Distribution
Provisioning Profile: Xcode Managed Profile
```

**重要**: 如果看到签名错误，点击 "Try Again" 或 "Download Manual Profiles"

---

## 步骤 4: 更新版本号（已完成 ✅）

在 **General** 标签下确认：
- **Version**: 1.0.0
- **Build**: 1

---

## 步骤 5: Archive

1. 顶部菜单栏：**Product** → **Archive**
2. 等待构建完成（约 3-5 分钟）
3. 构建成功后，会自动打开 **Organizer** 窗口

---

## 步骤 6: Organizer 窗口操作

在 Organizer 中你会看到：

```
┌────────────────────────────────────────────────────┐
│ Archives                                           │
├────────────────────────────────────────────────────┤
│ Readmigo                    Today, 9:50 PM         │
│ Version 1.0.0 (1)                                  │
│                                                    │
│ [Distribute App]  [Validate App]  [Show in Finder]│
└────────────────────────────────────────────────────┘
```

### 6.1 验证 App（可选但推荐）

1. 点击 **Validate App**
2. 选择 **App Store Connect**
3. 点击 **Next**
4. 选择 Distribution Certificate 和 Provisioning Profile
5. 点击 **Validate**
6. 等待验证完成（约 1-2 分钟）

如果验证通过，继续下一步。

### 6.2 上传到 App Store Connect

1. 点击 **Distribute App**
2. 选择 **App Store Connect**
3. 点击 **Next**
4. 选择 **Upload**
5. 点击 **Next**
6. 保持默认选项（Strip Swift symbols, Upload symbols 都勾选）
7. 点击 **Next**
8. 确认签名，点击 **Upload**
9. 等待上传完成（约 5-10 分钟，取决于网络速度）

上传成功会看到：
```
✅ Upload Successful
The app was successfully uploaded to App Store Connect.
```

---

## 步骤 7: App Store Connect 配置

### 7.1 登录 App Store Connect

1. 访问 https://appstoreconnect.apple.com/
2. 登录你的 Apple Developer 账号
3. 点击 **My Apps**

### 7.2 创建或选择 App

#### 如果是新 App：

1. 点击 **+** 按钮
2. 选择 **New App**
3. 填写信息：
   - **Platforms**: iOS
   - **Name**: Readmigo
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.readmigo.app
   - **SKU**: readmigo-ios-app
   - **User Access**: Full Access
4. 点击 **Create**

#### 如果 App 已存在：

1. 找到并点击 **Readmigo**

### 7.3 填写 App 信息

#### App Information（应用信息）

```
Name: Readmigo
Subtitle: Interactive English Learning
Privacy Policy URL: https://readmigo.app/privacy
Category:
  Primary: Education
  Secondary: Books
```

#### Pricing and Availability（价格和可用性）

```
Price: Free
Availability: All countries
```

#### App Privacy（应用隐私）

需要声明数据收集类型（根据实际情况）：
- User IDs
- Email Addresses
- Reading Progress
- Device IDs (for analytics)

### 7.4 准备提交

1. 左侧点击 **Version 1.0.0**
2. 等待构建处理完成（上传后约 30 分钟）

### 7.5 填写版本信息

#### What's New in This Version

```
Welcome to Readmigo! 🎉

Features:
• Interactive English reading with instant translations
• AI-powered conversations with book authors
• Smart vocabulary building system
• Personalized reading recommendations
• Progress tracking and reading statistics
• Dark mode support

Start your English learning journey today!
```

#### Description

```
Readmigo revolutionizes English learning through interactive reading.

KEY FEATURES:

📚 Interactive Reading
• Extensive library of classic and contemporary books
• Instant word translations and definitions
• Context-aware learning
• Adjustable reading speed and difficulty

🤖 AI Author Chat
• Discuss books with AI versions of famous authors
• Practice conversation skills
• Get personalized reading recommendations

📊 Smart Progress Tracking
• Monitor your vocabulary growth
• Track reading statistics
• Set and achieve reading goals

🎯 Personalized Learning
• Content tailored to your level
• Adaptive difficulty progression
• Focus on your interests

Perfect for:
• English learners of all levels
• Book lovers
• Students preparing for exams
• Anyone wanting to improve their English

Download Readmigo and transform your English learning experience!
```

#### Keywords

```
english learning, reading, books, vocabulary, education, language, esl, translation, interactive reading, ai chat
```

#### Screenshots

需要准备（如果还没有）：
- iPhone 6.7" (iPhone 15 Pro Max) - 至少 3 张
- iPhone 6.5" (iPhone 14 Plus) - 至少 3 张
- iPad Pro 12.9" - 至少 3 张（如果支持 iPad）

**截图内容建议**：
1. 主界面 / 书库
2. 阅读界面 / 翻译功能
3. AI 对话界面
4. 进度统计界面
5. 词汇学习界面

#### App Preview（可选）

如果有宣传视频，上传。

### 7.6 Build 选择

在 **Build** 部分：
1. 点击 **+** 或 **Select a build**
2. 选择刚上传的 **1.0.0 (1)**
3. 点击 **Done**

### 7.7 测试信息

#### App Review Information

```
First Name: (你的名字)
Last Name: (你的姓氏)
Phone: (你的电话)
Email: (你的邮箱)

Notes:
To test the app, please use the following test account:
Email: test@readmigo.app
Password: TestAccount123!

The app requires internet connection to function properly.
Main features include reading books, translating words, and chatting with AI authors.
```

#### Test Account (如果需要登录)

```
Username: test@readmigo.app
Password: TestAccount123!
```

---

## 步骤 8: 提交审核

1. 检查所有必填项都已完成 ✅
2. 滚动到页面顶部
3. 点击 **Add for Review**
4. 回答导出合规性问题：
   - Does your app use encryption? **No** (如果没有额外加密)
5. 点击 **Submit for Review**

提交后你会看到：
```
✅ Waiting for Review
We'll let you know when your app is ready for review.
```

---

## 步骤 9: 审核时间线

```
Timeline:
└─ Preparing for Review: 1-2 hours
   └─ Waiting for Review: 1-3 days
      └─ In Review: 1-3 days
         ├─ Approved ✅
         │  └─ Ready for Sale
         │
         └─ Rejected ❌
            └─ 修复问题 → 重新提交
```

---

## 常见问题

### Q1: Archive 失败，提示签名错误

**解决方案**:
1. 打开 Xcode → Preferences → Accounts
2. 选择你的 Apple ID
3. 点击 **Download Manual Profiles**
4. 重新 Archive

### Q2: 验证失败，提示 Missing Compliance

**解决方案**:
在 Info.plist 中添加：
```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

### Q3: 截图尺寸不对

**要求的尺寸**:
- iPhone 6.7": 1290 x 2796 pixels
- iPhone 6.5": 1284 x 2778 pixels
- iPad Pro 12.9": 2048 x 2732 pixels

### Q4: App 被拒，常见原因

1. **功能不完整**: 确保所有功能都可用
2. **登录问题**: 提供有效的测试账号
3. **隐私问题**: 正确填写隐私声明
4. **UI 问题**: 界面需要符合 Apple 设计规范
5. **内容问题**: 书籍内容需要有版权或公有领域

---

## 快速检查清单

在提交前确认：

- [ ] 版本号正确 (1.0.0)
- [ ] Bundle ID 正确 (com.readmigo.app)
- [ ] 所有签名配置正确
- [ ] App 在真机上测试通过
- [ ] 所有必需的截图已上传
- [ ] App 描述完整
- [ ] 隐私政策 URL 可访问
- [ ] 测试账号有效
- [ ] 后端 API 正常运行 (v1.api.readmigo.app)

---

## 后续步骤

审核通过后：

1. **发布 App**:
   - 手动发布: 点击 "Release this version"
   - 自动发布: 设置自动发布

2. **监控指标**:
   - App Store Connect → Analytics
   - 下载量
   - Crash 报告
   - 用户评价

3. **准备更新**:
   - 收集用户反馈
   - 修复 Bug
   - 规划 v1.1 或 v2

---

## 联系方式

如有问题：
- Apple Developer 支持: https://developer.apple.com/support/
- App Store Connect 帮助: https://help.apple.com/app-store-connect/

---

**祝提交顺利！🚀**
