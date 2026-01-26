# Android 设计系统

> Material Design 3 + Jetpack Compose + 自定义主题

---

## 1. 设计系统概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    设计系统架构                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Design Tokens                         │    │
│  │  颜色 │ 字体 │ 间距 │ 圆角 │ 阴影 │ 动画                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Theme Layer                           │    │
│  │  MaterialTheme │ ColorScheme │ Typography │ Shapes       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Component Layer                       │    │
│  │  Atoms │ Molecules │ Organisms │ Templates               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Screen Layer                          │    │
│  │  阅读器 │ 书架 │ 学习 │ 设置 │ 探索                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 颜色系统

### 2.1 Material 3 色彩方案

```
┌─────────────────────────────────────────────────────────────────┐
│                    颜色角色                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Primary                                                        │
│  ├── primary              主色调                                │
│  ├── onPrimary            主色调上的内容                        │
│  ├── primaryContainer     主色调容器                            │
│  └── onPrimaryContainer   主色调容器上的内容                    │
│                                                                  │
│  Secondary                                                      │
│  ├── secondary            次要色调                              │
│  ├── onSecondary          次要色调上的内容                      │
│  ├── secondaryContainer   次要色调容器                          │
│  └── onSecondaryContainer 次要色调容器上的内容                  │
│                                                                  │
│  Tertiary                                                       │
│  ├── tertiary             第三色调                              │
│  └── ...                                                       │
│                                                                  │
│  Error                                                          │
│  ├── error                错误色                                │
│  └── ...                                                       │
│                                                                  │
│  Surface                                                        │
│  ├── surface              表面色                                │
│  ├── surfaceVariant       表面色变体                            │
│  ├── onSurface            表面上的内容                          │
│  └── outline              边框色                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 品牌色值

| 角色 | 浅色模式 | 深色模式 |
|------|----------|----------|
| Primary | #2563EB | #60A5FA |
| Secondary | #7C3AED | #A78BFA |
| Tertiary | #059669 | #34D399 |
| Error | #DC2626 | #F87171 |
| Background | #FFFFFF | #121212 |

---

## 3. 字体系统

### 3.1 Typography 规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    字体层级                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Display                                                        │
│  ├── displayLarge      57sp / 64 line-height                   │
│  ├── displayMedium     45sp / 52 line-height                   │
│  └── displaySmall      36sp / 44 line-height                   │
│                                                                  │
│  Headline                                                       │
│  ├── headlineLarge     32sp / 40 line-height                   │
│  ├── headlineMedium    28sp / 36 line-height                   │
│  └── headlineSmall     24sp / 32 line-height                   │
│                                                                  │
│  Title                                                          │
│  ├── titleLarge        22sp / 28 line-height / Medium          │
│  ├── titleMedium       16sp / 24 line-height / Medium          │
│  └── titleSmall        14sp / 20 line-height / Medium          │
│                                                                  │
│  Body                                                           │
│  ├── bodyLarge         16sp / 24 line-height                   │
│  ├── bodyMedium        14sp / 20 line-height                   │
│  └── bodySmall         12sp / 16 line-height                   │
│                                                                  │
│  Label                                                          │
│  ├── labelLarge        14sp / 20 line-height / Medium          │
│  ├── labelMedium       12sp / 16 line-height / Medium          │
│  └── labelSmall        11sp / 16 line-height / Medium          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 阅读器字体

| 字体 | 用途 | 说明 |
|------|------|------|
| System Default | 默认 | 系统字体 |
| Noto Serif | 衬线 | 适合长文阅读 |
| Noto Sans | 无衬线 | 现代简洁 |
| Source Han | 中文 | 思源系列 |

---

## 4. 间距系统

### 4.1 间距规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    间距标尺 (4dp 基准)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Spacing                                                        │
│  ├── none         0dp                                          │
│  ├── extraSmall   4dp                                          │
│  ├── small        8dp                                          │
│  ├── medium       16dp                                         │
│  ├── large        24dp                                         │
│  ├── extraLarge   32dp                                         │
│  └── xxLarge      48dp                                         │
│                                                                  │
│  应用场景                                                        │
│  ├── 组件内部间距: small (8dp)                                  │
│  ├── 组件之间间距: medium (16dp)                                │
│  ├── 区块之间间距: large (24dp)                                 │
│  └── 页面边距: medium (16dp)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 屏幕边距

| 屏幕宽度 | 水平边距 |
|----------|----------|
| < 600dp | 16dp |
| 600-840dp | 24dp |
| > 840dp | 32dp |

---

## 5. 形状系统

### 5.1 圆角规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    形状定义                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Shapes                                                         │
│  ├── extraSmall      4dp    按钮等小元素                       │
│  ├── small           8dp    卡片、输入框                        │
│  ├── medium          12dp   对话框、底部表单                    │
│  ├── large           16dp   大型容器                            │
│  └── extraLarge      28dp   全屏对话框                          │
│                                                                  │
│  特殊形状                                                        │
│  ├── circle          50%    头像、图标按钮                      │
│  └── rounded         动态   根据内容高度                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 应用示例

| 组件 | 形状 |
|------|------|
| Button | extraSmall (4dp) |
| Card | small (8dp) |
| TextField | small (8dp) |
| BottomSheet | large (16dp top) |
| FAB | large (16dp) |

---

## 6. 组件库

### 6.1 Atomic Design 分层

```
┌─────────────────────────────────────────────────────────────────┐
│                    组件层级                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Atoms (原子)                                                    │
│  ├── ReadmigoButton                                            │
│  ├── ReadmigoText                                              │
│  ├── ReadmigoIcon                                              │
│  ├── ReadmigoImage                                             │
│  └── ReadmigoTextField                                         │
│                                                                  │
│  Molecules (分子)                                                │
│  ├── BookCover          封面 + 进度                             │
│  ├── VocabularyCard     单词卡片                                │
│  ├── SearchBar          搜索框                                  │
│  └── SettingsItem       设置项                                  │
│                                                                  │
│  Organisms (组织)                                                │
│  ├── BookGrid           书籍网格                                │
│  ├── ReaderToolbar      阅读器工具栏                            │
│  ├── AIPanel            AI 面板                                 │
│  └── LearningProgress   学习进度                                │
│                                                                  │
│  Templates (模板)                                                │
│  ├── SingleColumnLayout 单栏布局                                │
│  ├── TwoColumnLayout    双栏布局                                │
│  └── ReaderLayout       阅读器布局                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 核心组件

| 组件 | 变体 |
|------|------|
| Button | Filled, Outlined, Text, Tonal |
| Card | Elevated, Filled, Outlined |
| TextField | Filled, Outlined |
| BottomSheet | Standard, Modal |
| Dialog | Basic, Full-screen |

---

## 7. 深色模式

### 7.1 主题切换

```
┌─────────────────────────────────────────────────────────────────┐
│                    主题模式                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  模式                                                            │
│  ├── Light Mode        浅色模式                                 │
│  ├── Dark Mode         深色模式                                 │
│  └── System Default    跟随系统                                 │
│                                                                  │
│  Dynamic Color (Android 12+)                                   │
│  ├── 从壁纸提取主题色                                           │
│  └── 自动生成配色方案                                           │
│                                                                  │
│  实现方式                                                        │
│  ├── MaterialTheme                                              │
│  ├── dynamicLightColorScheme()                                 │
│  ├── dynamicDarkColorScheme()                                  │
│  └── isSystemInDarkTheme()                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 深色模式适配

| 项目 | 浅色 | 深色 |
|------|------|------|
| 背景 | #FFFFFF | #121212 |
| 表面 | #F5F5F5 | #1E1E1E |
| 文字 | #1A1A1A | #E5E5E5 |
| 图标 | #666666 | #A3A3A3 |

---

## 8. 阅读器主题

### 8.1 阅读器配色

```
┌─────────────────────────────────────────────────────────────────┐
│                    阅读器主题                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  默认主题                                                        │
│  └── 背景: #FFFFFF  文字: #1A1A1A                              │
│                                                                  │
│  护眼主题                                                        │
│  └── 背景: #F5F5DC  文字: #3D3D3D                              │
│                                                                  │
│  暗夜主题                                                        │
│  └── 背景: #1A1A1A  文字: #E5E5E5                              │
│                                                                  │
│  深黑主题                                                        │
│  └── 背景: #000000  文字: #CCCCCC                              │
│                                                                  │
│  自定义主题                                                      │
│  ├── 背景色选择器                                                │
│  └── 文字色选择器                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 阅读设置

| 设置 | 范围 | 默认值 |
|------|------|--------|
| 字号 | 12-32sp | 18sp |
| 行距 | 1.0-2.5 | 1.5 |
| 页边距 | 8-48dp | 16dp |
| 段间距 | 0-24dp | 8dp |

---

## 9. 动画系统

### 9.1 动画规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    动画规范                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  持续时间                                                        │
│  ├── short       150ms   简单状态变化                           │
│  ├── medium      300ms   中等复杂度                             │
│  └── long        500ms   复杂过渡                               │
│                                                                  │
│  缓动曲线                                                        │
│  ├── EaseOut           元素进入                                 │
│  ├── EaseIn            元素退出                                 │
│  ├── EaseInOut         元素移动                                 │
│  └── FastOutSlowIn     Material 标准                           │
│                                                                  │
│  常用动画                                                        │
│  ├── fadeIn/fadeOut    淡入淡出                                 │
│  ├── slideIn/slideOut  滑入滑出                                 │
│  ├── scaleIn/scaleOut  缩放                                     │
│  └── expandIn/shrinkOut 展开收缩                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 页面转场

| 转场类型 | 动画效果 |
|----------|----------|
| 前进导航 | slideInHorizontally + fadeIn |
| 后退导航 | slideOutHorizontally + fadeOut |
| 底部弹窗 | slideInVertically |
| 对话框 | scaleIn + fadeIn |

---

## 10. 相关文档

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 架构设计 |
| [performance.md](./performance.md) | 性能优化 |
| [../design/design-system.md](../design/design-system.md) | 全局设计系统 |

---

*最后更新: 2025-12-31*
