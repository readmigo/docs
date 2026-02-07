# React Native 设计系统实现规范

> 本文档定义 Readmigo React Native 客户端的设计系统实现，确保与 iOS/Android 原生客户端和品牌规范保持一致。

## 1. 概述

### 1.1 设计原则

遵循共享设计系统 (`docs/design/design-system.md`) 的四大原则：
- **专注阅读 (Reading First)** - 界面干净简洁，不干扰阅读
- **AI 无处不在但不突兀 (Ambient AI)** - AI 功能融入自然交互
- **渐进式学习 (Progressive Learning)** - 难度循序渐进，成长可视化
- **全球化设计 (Global Design)** - 支持多语言，文化中性设计

### 1.2 技术栈

| 组件 | 技术选型 |
|------|----------|
| UI 框架 | React Native + Expo SDK 52+ |
| 主题系统 | 自定义 Theme Provider |
| 图标 | @expo/vector-icons (MaterialCommunityIcons) |
| 动画 | Reanimated 3 + Gesture Handler |
| 字体 | expo-font + Google Fonts |

---

## 2. 主题配置

---

## 3. Typography 字体系统

### 3.1 字体映射

| 用途 | iOS | Android | React Native |
|------|-----|---------|--------------|
| 界面字体 | SF Pro | Roboto | System (Platform default) |
| 阅读字体 | Georgia, Palatino | Noto Serif, Literata | Google Fonts |
| 代码字体 | SF Mono | JetBrains Mono | SpaceMono |

---

## 4. Spacing & Layout

---

## 5. 图标系统

---

## 6. App Icon 配置

### 6.2 图标资源规范

| 资源 | 尺寸 | 用途 |
|------|------|------|
| `icon.png` | 1024×1024 | 通用图标 |
| `icon-ios.png` | 1024×1024 | iOS App Store |
| `adaptive-icon-foreground.png` | 1024×1024 | Android 前景 (108dp safe zone) |
| `adaptive-icon-background.png` | 1024×1024 | Android 背景 |
| `adaptive-icon-monochrome.png` | 1024×1024 | Android 13+ 单色 |
| `splash.png` | 1284×2778 | 启动画面 |
| `favicon.png` | 48×48 | Web favicon |

---

## 7. Splash Screen 启动画面

---

## 8. 动效规范

---

## 9. 触觉反馈

---

## 10. 基础 UI 组件

---

## 11. App Store / Play Store 素材规范

### 11.1 截图规格

| 设备 | 尺寸 | 数量 |
|------|------|------|
| iPhone 6.7" | 1290×2796 | 4-10 |
| iPhone 6.5" | 1242×2688 | 4-10 |
| iPhone 5.5" | 1242×2208 | 4-10 |
| iPad Pro 12.9" | 2048×2732 | 4-10 |
| Android Phone | 1080×1920 - 1080×2340 | 4-8 |
| Android Tablet 7" | 1200×1920 | 4-8 |
| Android Tablet 10" | 1920×1200 | 4-8 |

### 11.2 图标规格

| 平台 | 尺寸 | 格式 |
|------|------|------|
| App Store | 1024×1024 | PNG (无透明) |
| Play Store | 512×512 | PNG |

### 11.3 功能图/横幅

| 平台 | 尺寸 | 格式 |
|------|------|------|
| Play Store Feature Graphic | 1024×500 | PNG/JPG |

---

## 12. 与 iOS/Android 对齐检查清单

| 项目 | iOS | Android | React Native | 状态 |
|------|-----|---------|--------------|------|
| 品牌色 | ✅ 统一 | ✅ Material 3 | ✅ 自定义 Theme | ✅ |
| 深色模式 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | Light/Dark/Sepia | ✅ |
| 字体系统 | SF Pro | Roboto | 系统默认 | ✅ |
| 阅读字体 | Georgia/Palatino | NotoSerif/Literata | NotoSerif/Literata | ✅ |
| App Icon | Asset Catalog | Adaptive Icon | Expo Config | ✅ |
| Splash Screen | Launch Storyboard | Splash Screen API | expo-splash-screen | ✅ |
| 动画曲线 | iOS 标准 | Material Motion | Reanimated 3 | ✅ |
| 触觉反馈 | Haptic Engine | Vibrator | expo-haptics | ✅ |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-12-26 | 1.0.0 | 初始版本 |
