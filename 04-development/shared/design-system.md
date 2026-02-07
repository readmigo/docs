# 设计系统规范

## 概述

核心元素: 品牌色彩、排版系统、间距系统、圆角与阴影、主题系统

## 品牌标识

### Logo

- 主 Logo: ReadMigo 字标 + 图标
- 图标: 渐变书本形状
- 最小尺寸: 24px (图标) / 80px (完整)
- 安全区域: Logo 周围 0.5x Logo 高度

### 品牌渐变

| 属性 | 值 |
|------|-----|
| 渐变色 | #8BB9FF (蓝) -> #B9B3F5 (紫) -> #F6B6E8 (粉) |
| 方向 | 135 度 (左上到右下) |
| 用途 | Logo、主按钮、重要 UI 元素 |

## 色彩系统

### 品牌色 (Brand Colors)

| 颜色名称 | Light Mode | Dark Mode |
|---------|-----------|----------|
| Brand Primary | #7C8DF5 | #8B9BFF |
| Brand Blue | #8BB9FF | #7AABFF |
| Brand Purple | #B9B3F5 | #A8A2E6 |
| Brand Pink | #F6B6E8 | #E5A5D7 |

### 强调色 (Accent Colors)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Accent Purple | #9A8CF2 | #ABA0FF | 次要操作 |
| Accent Pink | #F3A6DC | #FF9ED4 | 高亮强调 |
| Accent Blue | #A5C7FF | #8DB8FF | 链接信息 |
| Achievement Gold | #FFD36A | #FFCC4D | 成就徽章 |

### 语义色 (Semantic Colors)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Success | #6ED6A8 | #4AD98D | 成功状态 |
| Warning | #FFC26A | #FFB74D | 警告状态 |
| Error | #FF6B6B | #FF5E5E | 错误状态 |
| Info | #7BAAFF | #6B9AEF | 信息提示 |

### 灰度色 (Gray Scale)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Gray 50 | #FAFAFA | #18181B | 最浅背景 |
| Gray 100 | #F4F4F5 | #27272A | 卡片背景 |
| Gray 200 | #E4E4E7 | #3F3F46 | 分隔线 |
| Gray 300 | #D4D4D8 | #52525B | 边框 |
| Gray 400 | #A1A1AA | #71717A | 占位符 |
| Gray 500 | #71717A | #A1A1AA | 次要文本 |
| Gray 600 | #52525B | #D4D4D8 | 主要文本 |
| Gray 700 | #3F3F46 | #E4E4E7 | 标题 |
| Gray 800 | #27272A | #F4F4F5 | 强调文本 |
| Gray 900 | #18181B | #FAFAFA | 最深文本 |

## 背景色

### Light Mode

| 名称 | 色值 | 用途 |
|------|------|------|
| Background Primary | #FFFFFF | 主背景 |
| Background Secondary | #F8F9FA | 次级背景/卡片 |
| Background Tertiary | #F1F3F5 | 第三级背景 |
| Background Elevated | #FFFFFF | 浮层背景 |

### Dark Mode

| 名称 | 色值 | 用途 |
|------|------|------|
| Background Primary | #121212 | 主背景 |
| Background Secondary | #1E1E1E | 次级背景/卡片 |
| Background Tertiary | #2A2A2A | 第三级背景 |
| Background Elevated | #2D2D2D | 浮层背景 |

## 排版系统

### 字体家族

| 用途 | 字体 |
|------|------|
| 主要字体 | Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif |
| 等宽字体 | "SF Mono", Menlo, Monaco, Consolas, monospace |
| 阅读器字体 | Georgia, "Times New Roman", serif (可切换) |

### 字号系统

| 名称 | 尺寸 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Display | 34px | 40px | Bold | 大标题 |
| Title 1 | 28px | 34px | Bold | 页面标题 |
| Title 2 | 22px | 28px | SemiBold | 区块标题 |
| Title 3 | 20px | 25px | SemiBold | 卡片标题 |
| Headline | 17px | 22px | SemiBold | 列表标题 |
| Body | 17px | 22px | Regular | 正文 |
| Callout | 16px | 21px | Regular | 标注 |
| Subheadline | 15px | 20px | Regular | 副标题 |
| Footnote | 13px | 18px | Regular | 脚注 |
| Caption 1 | 12px | 16px | Regular | 说明文字 |
| Caption 2 | 11px | 13px | Regular | 辅助信息 |

### 字重

| 字重 | 值 | 用途 |
|------|-----|------|
| Regular | 400 | 正文、描述 |
| Medium | 500 | 强调文本 |
| SemiBold | 600 | 小标题 |
| Bold | 700 | 大标题、按钮 |

## 间距系统

### 基础间距 (4px 倍数)

| Token | 值 | 用途 |
|-------|-----|------|
| space-0 | 0px | 无间距 |
| space-1 | 4px | 最小间距 |
| space-2 | 8px | 紧凑间距 |
| space-3 | 12px | 小间距 |
| space-4 | 16px | 标准间距 |
| space-5 | 20px | 中等间距 |
| space-6 | 24px | 大间距 |
| space-8 | 32px | 区块间距 |
| space-10 | 40px | 页面间距 |
| space-12 | 48px | 大区块间距 |
| space-16 | 64px | 页面边距 |

### 应用场景

**内边距 (Padding)**
- 按钮: 12px 16px (vertical horizontal)
- 卡片: 16px
- 列表项: 16px
- 页面: 16px (移动) / 24px (平板)

**外边距 (Margin)**
- 段落间: 16px
- 区块间: 24px
- 页面区块间: 32px

**间隙 (Gap)**
- 图标与文字: 8px
- 列表项间: 8px
- 网格项间: 16px

## 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| radius-none | 0px | 无圆角 |
| radius-sm | 4px | 小按钮、标签 |
| radius-md | 6px | 输入框、芯片 |
| radius-default | 8px | 按钮、小卡片 |
| radius-lg | 12px | 卡片、对话框 |
| radius-xl | 16px | 大卡片、模态框 |
| radius-2xl | 20px | 底部弹窗 |
| radius-full | 9999px | 圆形 (头像、徽章) |

## 阴影系统

### Light Mode 阴影

| 名称 | 值 | 用途 |
|------|-----|------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 微小阴影 |
| shadow | 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) | 标准阴影 |
| shadow-md | 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06) | 中等阴影 |
| shadow-lg | 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) | 大阴影 |
| shadow-xl | 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04) | 超大阴影 |

### Dark Mode 阴影

Dark 模式使用更深的背景区分层级，减少阴影使用。浮层使用 1px border 替代阴影。

## 主题系统

### 应用主题

| 主题 | 说明 |
|------|------|
| Light | 浅色主题 (默认) |
| Dark | 深色主题 |
| System | 跟随系统 |

### 阅读器主题

| 主题名称 | 背景色 | 文字色 | 用途 |
|---------|--------|--------|------|
| Light | #FFFFFF | #1A1A1A | 日间阅读 |
| Sepia | #F4ECD8 | #5C4B37 | 护眼模式 |
| Dark | #1A1A1A | #E0E0E0 | 夜间阅读 |
| Night | #000000 | #999999 | 纯黑模式 |

### 主题切换

切换方式:
- 设置页面手动切换
- 跟随系统自动切换
- 阅读器内独立切换

过渡效果: 300ms ease-in-out

## 图标系统

### 图标库

| 平台 | 图标库 |
|------|--------|
| iOS | SF Symbols |
| Android | Material Symbols |
| React Native | @expo/vector-icons |

### 图标尺寸

| 尺寸名称 | 像素 | 用途 |
|---------|------|------|
| xs | 12px | 行内小图标 |
| sm | 16px | 按钮内图标 |
| md | 20px | 列表图标 |
| default | 24px | 导航图标 (默认) |
| lg | 28px | Tab 图标 |
| xl | 32px | 空状态图标 |
| 2xl | 48px | 功能入口图标 |

### 图标风格

- 线框图标: 导航、列表、输入框
- 填充图标: 选中状态、强调操作

## 动效系统

### 时长

| 名称 | 时长 | 用途 |
|------|------|------|
| instant | 0ms | 无动画 |
| fast | 100ms | 微交互 (hover, focus) |
| normal | 200ms | 标准过渡 |
| slow | 300ms | 页面切换、模态框 |
| slower | 500ms | 复杂动画 |

### 缓动曲线

| 曲线 | 用途 |
|------|------|
| ease-out | 进入动画 (弹窗出现) |
| ease-in | 退出动画 (弹窗关闭) |
| ease-in-out | 状态变化 (主题切换) |
| spring | 弹性动画 (拖拽释放) |

### 常用动画

| 动画 | 描述 |
|------|------|
| Fade In/Out | 透明度 0 到 1 |
| Slide Up | 从底部滑入 |
| Scale | 从 0.95 缩放到 1 |
| Skeleton Pulse | 透明度 0.5 到 1 循环 |

## 组件规范

### 按钮 (Button)

**变体:**
- Primary: 品牌渐变背景，白色文字
- Secondary: 灰色背景，深色文字
- Outline: 边框，透明背景
- Ghost: 无边框无背景
- Destructive: 红色背景，危险操作

**尺寸:**

| 尺寸 | 高度 | 字号 |
|------|------|------|
| Small | 32px | 14px |
| Medium (默认) | 40px | 16px |
| Large | 48px | 17px |

### 卡片 (Card)

| 属性 | 值 |
|------|-----|
| 背景 | Background Secondary |
| 圆角 | 12px |
| 内边距 | 16px |
| 阴影 | shadow-sm (Light) / border (Dark) |

### 输入框 (Input)

| 属性 | 值 |
|------|-----|
| 高度 | 44px |
| 圆角 | 8px |
| 边框 | 1px Gray 300 |
| 聚焦边框 | Brand Primary |
| 内边距 | 12px 16px |

## 平台实现映射

| 平台 | 实现位置 |
|------|---------|
| iOS | /ios/ReadMigo/UI/Theme/ (BrandColors.swift, Typography.swift, Spacing.swift) |
| Android | /android/app/src/main/res/values/ (colors.xml, themes.xml, dimens.xml) |
| React Native | /apps/mobile/src/theme/ (colors.ts, typography.ts, spacing.ts) |
