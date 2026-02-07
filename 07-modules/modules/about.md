# About 模块

> 关于页面系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 应用信息展示 | 版本号、构建号、设备信息 | P0 |
| 版本检查 | 检查更新并跳转应用商店 | P0 |
| 法律文档 | 隐私政策、服务条款、用户协议 | P0 |
| 联系我们 | 邮箱、电话、社交媒体 | P0 |
| 反馈入口 | 评价应用、问题反馈 | P1 |
| 开源许可 | 第三方库许可证展示 | P1 |
| 更新日志 | 版本历史记录 | P2 |
| 致谢 | 团队与贡献者致谢 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 版本信息 | BuildConfig | expo-application | 环境变量 |
| 外部链接 | Intent | expo-linking | window.open |
| 邮件 | Intent.ACTION_SEND | expo-mail-composer | mailto: |
| 应用评分 | In-App Review | App Store/Play Store | 外链 |
| 更新检查 | Play Core | App Store Connect | N/A |

---

## 2. 数据模型

---

## 3. 页面结构

```
┌─────────────────────────────────┐
│         ← About                 │  TopAppBar
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
│  ├─ Email                  ▶   │
│  ├─ Phone                  ▶   │
│  └─ Social Media           ▶   │
├─────────────────────────────────┤
│  Legal Section                  │
│  ├─ Privacy Policy         ▶   │
│  ├─ Terms of Service       ▶   │
│  └─ User Agreement         ▶   │
├─────────────────────────────────┤
│  Feedback Section               │
│  ├─ Rate App               ▶   │
│  └─ Report a Problem       ▶   │
├─────────────────────────────────┤
│  More Section                   │
│  ├─ Changelog              ▶   │
│  ├─ Open Source Licenses   ▶   │
│  └─ Acknowledgments        ▶   │
├─────────────────────────────────┤
│                                 │
│  © 2024-2025 Readmigo          │  Footer
│  Made with ❤️ for readers       │
│                                 │
└─────────────────────────────────┘
```

---

## 4. 配置数据

### 社交链接

### 法律文档

### 联系方式

---

## 5. Android 实现

### 5.1 文件结构

```
features/about/
├── ui/
│   ├── AboutScreen.kt
│   ├── AppInfoHeader.kt
│   ├── VersionSection.kt
│   ├── ContactSection.kt
│   ├── SocialMediaListScreen.kt
│   ├── LegalSection.kt
│   ├── FeedbackSection.kt
│   ├── OpenSourceLicensesScreen.kt
│   ├── ChangelogScreen.kt
│   └── AcknowledgmentsScreen.kt
├── data/
│   ├── model/
│   │   ├── AppInfo.kt
│   │   └── OpenSourceLicense.kt
│   └── repository/
│       └── AboutRepository.kt
└── viewmodel/
    └── AboutViewModel.kt
```

### 5.2 AppInfo 获取

### 5.3 AboutViewModel

### 5.4 社交媒体跳转

---

## 6. React Native 实现

### 6.1 应用信息获取

### 6.2 AboutScreen

### 6.3 ChangelogScreen

---

## 7. Web 实现

### 7.1 应用信息 Hook

### 7.2 AboutPage

### 7.3 更新日志组件

### 7.4 致谢组件

---

## 8. 本地化

---

## 9. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `about_viewed` | 进入关于页面 | - |
| `check_update_tapped` | 点击检查更新 | - |
| `rate_app_tapped` | 点击评分 | - |
| `report_problem_tapped` | 点击报告问题 | - |
| `privacy_policy_tapped` | 点击隐私政策 | - |
| `terms_tapped` | 点击服务条款 | - |
| `social_media_tapped` | 点击社交媒体 | platform |
| `changelog_viewed` | 查看更新日志 | - |
| `licenses_viewed` | 查看开源许可 | - |

---

## 10. 导出

---

*最后更新: 2025-12-28*
