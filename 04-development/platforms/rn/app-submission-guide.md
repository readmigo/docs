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

### 1.2 安装 EAS CLI

```bash
# 全局安装 EAS CLI
npm install -g eas-cli

# 登录 Expo
eas login

# 验证登录状态
eas whoami
```

### 1.3 项目配置检查

```bash
# 检查 app.json/app.config.js 配置
cat app.json

# 确保以下字段已配置
# - name
# - slug
# - version
# - ios.bundleIdentifier
# - android.package
```

---

## 2. EAS 配置

### 2.1 初始化 EAS

```bash
# 在项目根目录运行
eas build:configure
```

### 2.2 eas.json 配置

```json
// eas.json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 2.3 app.json 完整配置

```json
// app.json
{
  "expo": {
    "name": "Readmigo",
    "slug": "readmigo",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "scheme": "readmigo",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2D5A7B"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "bundleIdentifier": "com.readmigo.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Used to scan book barcodes",
        "NSMicrophoneUsageDescription": "Used for speech-to-text features",
        "NSSpeechRecognitionUsageDescription": "Used for voice commands",
        "UIBackgroundModes": ["audio"],
        "ITSAppUsesNonExemptEncryption": false
      },
      "config": {
        "usesNonExemptEncryption": false
      },
      "entitlements": {
        "aps-environment": "production"
      }
    },
    "android": {
      "package": "com.readmigo.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/adaptive-icon-background.png",
        "monochromeImage": "./assets/adaptive-icon-monochrome.png"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.RECORD_AUDIO",
        "android.permission.VIBRATE"
      ],
      "blockedPermissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      [
        "expo-av",
        {
          "microphonePermission": "Allow Readmigo to access your microphone for speech features."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2D5A7B"
        }
      ],
      [
        "react-native-purchases",
        {
          "ios": {
            "enableSubscriberAttributes": true
          }
        }
      ]
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "owner": "readmigo"
  }
}
```

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

### 3.2 iOS 构建

```bash
# 构建 iOS 生产版本
eas build --platform ios --profile production

# 查看构建状态
eas build:list

# 下载构建产物（可选）
eas build:download --platform ios
```

### 3.3 iOS 凭证管理

```bash
# 让 EAS 自动管理凭证（推荐）
eas credentials

# 手动配置凭证
eas credentials --platform ios

# 选项：
# 1. Let Expo manage all credentials (推荐)
# 2. Provide or import your own credentials
```

### 3.4 提交到 App Store

```bash
# 自动提交到 App Store Connect
eas submit --platform ios --profile production

# 或手动提交
# 1. 从 EAS 下载 .ipa 文件
# 2. 使用 Transporter 上传
```

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

### 4.2 Android 构建

```bash
# 构建 Android 生产版本 (AAB)
eas build --platform android --profile production

# 构建 APK（用于测试）
eas build --platform android --profile preview

# 查看构建状态
eas build:list --platform android
```

### 4.3 Android 签名密钥

```bash
# 让 EAS 管理签名（推荐）
# 首次构建时会自动生成密钥

# 查看密钥信息
eas credentials --platform android

# 下载密钥（备份）
eas credentials --platform android
# 选择 "Download a keystore"
```

### 4.4 提交到 Google Play

```bash
# 自动提交到 Play Console
eas submit --platform android --profile production

# 指定轨道
eas submit --platform android --profile production --track internal
# 可选轨道: internal, alpha, beta, production
```

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

### 5.1 RevenueCat 设置

```bash
# 安装 RevenueCat
npx expo install react-native-purchases
```

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

### 5.4 RevenueCat 配置

```typescript
// src/services/purchases.ts

import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEYS = {
  ios: 'appl_xxxxxxxxxxxx',
  android: 'goog_xxxxxxxxxxxx',
};

export async function initializePurchases(userId?: string) {
  const apiKey = Platform.select(REVENUECAT_API_KEYS);

  if (!apiKey) {
    console.warn('RevenueCat API key not found');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  await Purchases.configure({
    apiKey,
    appUserID: userId,
  });
}
```

---

## 6. 环境变量配置

### 6.1 创建 .env 文件

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.readmigo.app
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxx
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 6.2 EAS 环境变量

```bash
# 设置 EAS 环境变量
eas secret:create --name SENTRY_AUTH_TOKEN --value "your-token"
eas secret:create --name GOOGLE_SERVICE_ACCOUNT --value "$(cat google-service-account.json)"

# 查看已设置的变量
eas secret:list
```

### 6.3 app.config.js 动态配置

```javascript
// app.config.js
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
```

---

## 7. OTA 更新配置

### 7.1 EAS Update 配置

```json
// eas.json 添加 update 配置
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

### 7.2 发布 OTA 更新

```bash
# 发布更新到 production 频道
eas update --channel production --message "Bug fixes and improvements"

# 发布更新到 preview 频道
eas update --channel preview --message "Testing new features"

# 查看更新历史
eas update:list
```

### 7.3 app.json 更新配置

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 30000,
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

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

### 8.2 自动版本递增

```json
// eas.json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 8.3 手动更新版本

```bash
# 更新 app.json 中的版本
# version: "1.0.0" -> "1.1.0"
# ios.buildNumber: "1" -> "2"
# android.versionCode: 1 -> 2

# 使用 npm version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
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

```bash
# === EAS Build ===
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile production
eas build:list
eas build:cancel

# === EAS Submit ===
eas submit --platform ios
eas submit --platform android
eas submit --platform all

# === EAS Update ===
eas update --channel production
eas update:list
eas update:rollback

# === EAS Credentials ===
eas credentials --platform ios
eas credentials --platform android

# === EAS Secrets ===
eas secret:create --name KEY --value "value"
eas secret:list
eas secret:delete KEY

# === 本地开发 ===
npx expo start
npx expo start --clear
npx expo run:ios
npx expo run:android
```

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
```bash
eas update:rollback --channel production
```

### Q5: 订阅测试账号如何设置？

**A**:
- iOS: App Store Connect → 沙盒测试员
- Android: Play Console → 许可测试

---

## 12. 相关文档

- [client-implementation-plan.md](./client-implementation-plan.md) - 客户端实现计划
- [design-system-implementation.md](./design-system-implementation.md) - 设计系统实现
- [modules/README.md](./modules/README.md) - 模块规范总览

---

**最后更新**: 2024-12-26
**文档版本**: 1.0
