# Android 设计系统实现规范

> 本文档定义 Readmigo Android 客户端的设计系统实现，确保与 iOS 客户端和品牌规范保持一致。

## 1. 概述

### 1.1 设计原则

遵循共享设计系统 (`docs/02-design/design-system.md`) 的四大原则：
- **专注阅读 (Reading First)** - 界面干净简洁，不干扰阅读
- **AI 无处不在但不突兀 (Ambient AI)** - AI 功能融入自然交互
- **渐进式学习 (Progressive Learning)** - 难度循序渐进，成长可视化
- **全球化设计 (Global Design)** - 支持多语言，文化中性设计

### 1.2 技术栈

| 组件 | 技术选型 |
|------|----------|
| UI 框架 | Jetpack Compose |
| 主题系统 | Material 3 (Material You) |
| 图标 | Material Symbols |
| 字体 | Google Fonts (Roboto / Noto) |

---

## 2. Material 3 主题配置

### 2.1 品牌色映射

将品牌色映射到 Material 3 Color Roles：

---

## 3. Typography 字体系统

### 3.1 字体映射

| 用途 | iOS | Android |
|------|-----|---------|
| 界面字体 | SF Pro | Roboto (系统默认) |
| 阅读字体 | Georgia, Palatino, Charter | Noto Serif, Roboto Serif, Literata |
| 代码字体 | SF Mono | JetBrains Mono |

---

## 4. Shape 形状系统

---

## 5. Adaptive Icon 自适应图标

### 5.1 图标尺寸规范

| 密度 | 目录 | 尺寸 (dp) | 尺寸 (px) |
|------|------|-----------|-----------|
| mdpi | mipmap-mdpi | 48 | 48×48 |
| hdpi | mipmap-hdpi | 48 | 72×72 |
| xhdpi | mipmap-xhdpi | 48 | 96×96 |
| xxhdpi | mipmap-xxhdpi | 48 | 144×144 |
| xxxhdpi | mipmap-xxxhdpi | 48 | 192×192 |

### 5.3 图标资源结构

```
res/
├── mipmap-mdpi/
│   ├── ic_launcher.webp          # 48×48
│   └── ic_launcher_round.webp    # 48×48
├── mipmap-hdpi/
│   ├── ic_launcher.webp          # 72×72
│   └── ic_launcher_round.webp    # 72×72
├── mipmap-xhdpi/
│   ├── ic_launcher.webp          # 96×96
│   └── ic_launcher_round.webp    # 96×96
├── mipmap-xxhdpi/
│   ├── ic_launcher.webp          # 144×144
│   └── ic_launcher_round.webp    # 144×144
├── mipmap-xxxhdpi/
│   ├── ic_launcher.webp          # 192×192
│   └── ic_launcher_round.webp    # 192×192
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml           # Adaptive icon
│   └── ic_launcher_round.xml     # Adaptive icon (round)
└── drawable/
    ├── ic_launcher_background.xml  # 背景层 (品牌色 #2D5A7B)
    ├── ic_launcher_foreground.xml  # 前景层 (Logo)
    └── ic_launcher_monochrome.xml  # 单色图标 (Android 13+)
```

---

## 6. Splash Screen 启动画面

---

## 7. 颜色资源文件

---

## 8. 动效规范

### 8.1 动画时长

| 动画类型 | 时长 | 曲线 |
|----------|------|------|
| 翻页动画 | 300ms | EaseInOut |
| 工具栏显隐 | 250ms | EaseOut |
| AI 面板弹出 | 300ms | Spring (damping 0.8) |
| 选择菜单 | 200ms | EaseOut |
| 页面切换 | 300ms | FastOutSlowIn |

---

## 9. 触觉反馈

---

## 10. 设计资源转换

### 10.1 从 SVG 转换图标

使用 Android Studio 的 Vector Asset 工具：

1. 右键 `res/drawable` → New → Vector Asset
2. 选择 Local file (SVG)
3. 导入 `design/assets/icons/` 中的 SVG 文件
4. 调整尺寸和颜色

### 10.2 资源映射

| 源文件 | 目标位置 |
|--------|----------|
| `design/assets/icons/logo-mark.svg` | `res/drawable/ic_logo_mark.xml` |
| `design/assets/icons/logo-horizontal.svg` | `res/drawable/ic_logo_horizontal.xml` |
| `design/assets/icons/splash-background.svg` | `res/drawable/splash_background.xml` |
| `design/assets/icons/onboarding/*.svg` | `res/drawable/ic_onboarding_*.xml` |

---

## 11. Play Store 素材规范

| 素材类型 | 尺寸 | 格式 | 说明 |
|----------|------|------|------|
| 高分辨率图标 | 512×512 | PNG | Play Store 图标 |
| 功能图 | 1024×500 | PNG/JPG | 商店顶部横幅 |
| 手机截图 | 1080×1920 - 1080×2340 | PNG/JPG | 最少2张，最多8张 |
| 7英寸平板截图 | 1200×1920 | PNG/JPG | 可选 |
| 10英寸平板截图 | 1920×1200 | PNG/JPG | 可选 |
| 预览视频 | 1080p | MP4 | 可选，30-120秒 |

---

## 12. 与 iOS 对齐检查清单

| 项目 | iOS | Android | 状态 |
|------|-----|---------|------|
| 品牌色 | ✅ 统一 | ✅ Material 3 映射 | ✅ |
| 深色模式 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | ✅ |
| 字体系统 | SF Pro | Roboto | ✅ 对应 |
| 阅读字体 | Georgia/Palatino/Charter | NotoSerif/Literata/RobotoSerif | ✅ |
| App Icon | SF Symbols 风格 | Adaptive Icon | ✅ |
| Splash Screen | Launch Storyboard | Splash Screen API | ✅ |
| 动画曲线 | iOS 标准 | Material Motion | ✅ 对应 |
| 触觉反馈 | Haptic Engine | Vibrator | ✅ 对应 |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-12-26 | 1.0.0 | 初始版本 |
