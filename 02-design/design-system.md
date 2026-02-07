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
| 方向 | Top Leading → Bottom Trailing (左上到右下) |
| 用途 | Logo、主按钮、重要 UI 元素 |

## 色彩系统

### 品牌色 (Brand Colors)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Brand Primary | #7C8DF5 | #8B9BFF | 按钮、选中态、强调 |
| Brand Blue (渐变起始) | #8BB9FF | #7AABFF | 渐变起点 |
| Brand Purple (渐变中间) | #B9B3F5 | #A8A2E6 | 渐变中点 |
| Brand Pink (渐变终止) | #F6B6E8 | #E5A5D7 | 渐变终点 |
| AccentColor (系统) | #A78BFA | #8B5CF6 | iOS 系统 Accent |

### 强调色 (Accent Colors)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Accent Purple | #9A8CF2 | #ABA0FF | 次要操作 |
| Accent Pink | #F3A6DC | #FF9ED4 | 高亮强调 |
| Accent Blue | #A5C7FF | #8DB8FF | 链接信息 |
| Achievement Gold | #FFD36A | #FFCC4D | 成就徽章 |

### 文字色 (Text Colors)

| 颜色名称 | Light Mode | Dark Mode | 用途 |
|---------|-----------|----------|------|
| Text Primary | #2D2E4A | #F5F5F7 | 主文字 |
| Text Secondary | #6B6F9C | #A1A1A6 | 次要文字 |
| Text Hint | #A3A6C8 | #636366 | 占位符/提示 |
| Text on Dark | #FFFFFF | #FFFFFF | 深色背景上的文字 |

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
| Background Light | #F7F8FD | 主背景 |
| Background Card | #FFFFFF | 卡片背景 |
| Background Subtle | #EEF0FA | 次级/微弱背景 |

### Dark Mode

| 名称 | 色值 | 用途 |
|------|------|------|
| Background Light | systemBackground | 主背景（跟随系统） |
| Background Card | secondarySystemBackground | 卡片背景（跟随系统） |
| Background Subtle | tertiarySystemBackground | 次级背景（跟随系统） |

> Dark Mode 下使用 iOS 系统背景色，自动适配 OLED 纯黑等系统设置。

## 排版系统

### 字体家族

| 用途 | 字体 |
|------|------|
| 主要字体 | Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif |
| 等宽字体 | "SF Mono", Menlo, Monaco, Consolas, monospace |
| 阅读器默认 | Georgia (可切换) |

### 阅读器可选字体

| 分类 | 字体 |
|------|------|
| 系统字体 | System、System Serif |
| 经典衬线 | Georgia、Palatino、Times New Roman、Baskerville |
| 无衬线 | Helvetica Neue、Avenir |
| 中文字体 | 苹方 (PingFang SC)、宋体 (Songti SC)、楷体 (Kaiti SC) |

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

### 阅读器字号

| 名称 | 尺寸 | 行高倍率 |
|------|------|----------|
| 较小 (medium) | 17px | 1.5 |
| 标准 (large) | 20px | 1.6 |
| 较大 (extraLarge) | 24px | 1.7 |
| 更大 (huge) | 28px | 1.8 |

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
| Light | 浅色主题 |
| Dark | 深色主题 |
| System | 跟随系统 (默认) |

### 阅读器主题

| 主题 | 背景色 | 文字色 | 次要文字色 | 高亮色 | 链接色 |
|------|--------|--------|-----------|--------|--------|
| Light | #FFFFFF | #000000 | 系统灰色 | 黄色 30% | #007AFF |
| Sepia | #FAF2E3 | #4D331A | #80664D | 橙色 30% | #0066CC |
| Dark | #1F1F1F | #D9D9D9 | #999999 | 蓝色 30% | #64B5F6 |

### 阅读器行距

| 名称 | 值 |
|------|-----|
| 紧凑 (compact) | 4px |
| 标准 (normal) | 8px |
| 宽松 (relaxed) | 12px |
| 超宽松 (extraRelaxed) | 16px |

### 阅读模式

| 模式 | 说明 |
|------|------|
| 仿真翻页 (curl) | 模拟真实翻页效果 |
| 左右滑动 (slide) | 水平滑动翻页 (默认) |
| 上下滚动 (scroll) | 连续滚动阅读 |

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
| 背景 | Background Card |
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

## 平台实现

| 平台 | 实现位置 |
|------|---------|
| iOS | Readmigo/UI/Themes/ (BrandColors.swift, ThemeManager.swift) |
| Android | app/src/main/res/values/ (colors.xml, themes.xml, dimens.xml) |
| React Native | apps/mobile/src/theme/ (colors.ts, typography.ts, spacing.ts) |
