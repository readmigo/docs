# Web 设计系统实现规范

> 本文档定义 Readmigo Web 客户端的设计系统实现，确保与 iOS/Android 原生客户端和品牌规范保持一致。

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
| UI 框架 | Next.js 14+ App Router |
| 样式系统 | Tailwind CSS 3.4+ |
| 组件库 | shadcn/ui |
| 图标库 | Lucide React |
| 动画 | Framer Motion |
| 字体 | next/font + Google Fonts |

---

## 2. Tailwind 配置

---

## 3. 主题系统

---

## 4. Typography 字体系统

---

## 5. 间距与布局

---

## 6. 图标系统

---

## 7. 动效系统

---

## 8. 加载状态

---

## 9. 基础 UI 组件

---

## 10. 无障碍设计

---

## 11. 与 iOS/Android 对齐检查清单

| 项目 | iOS | Android | Web | 状态 |
|------|-----|---------|-----|------|
| 品牌色 | SwiftUI | Material 3 | CSS Variables | ✅ |
| 深色模式 | 系统跟随 | 系统跟随 | next-themes | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | CSS Classes | ✅ |
| 字体系统 | SF Pro | Roboto | Inter (next/font) | ✅ |
| 阅读字体 | Georgia/Palatino | NotoSerif/Literata | Google Fonts | ✅ |
| 图标 | SF Symbols | Material Icons | Lucide React | ✅ |
| 动画系统 | SwiftUI Animation | Jetpack Compose | Framer Motion | ✅ |
| 组件库 | SwiftUI | Material 3 | shadcn/ui | ✅ |
| 间距系统 | Design Token | Design Token | Tailwind | ✅ |
| 无障碍 | VoiceOver | TalkBack | ARIA + Focus | ✅ |

---

## 12. 文件结构

```
src/
├── app/
│   ├── globals.css          # CSS 变量和全局样式
│   ├── fonts.ts             # 字体配置
│   └── layout.tsx           # 根布局
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ...
│   │   ├── Typography.tsx   # 排版组件
│   │   ├── Icon.tsx         # 图标组件
│   │   ├── Skeleton.tsx     # 骨架屏
│   │   └── AnimatedPresence.tsx
│   └── layout/
│       └── Container.tsx
├── lib/
│   ├── utils.ts             # cn() 工具函数
│   ├── animations.ts        # 动画变体
│   ├── icons.ts             # 图标映射
│   ├── spacing.ts           # 间距常量
│   ├── reader-fonts.ts      # 阅读器字体
│   └── accessibility.ts     # 无障碍工具
├── hooks/
│   ├── useTheme.ts          # 主题 Hook
│   ├── useAnimations.ts     # 动画 Hook
│   └── useFocusManagement.ts
├── stores/
│   └── themeStore.ts        # 主题状态
├── providers/
│   └── ThemeProvider.tsx    # 主题 Provider
└── tailwind.config.ts       # Tailwind 配置
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-12-26 | 1.0.0 | 初始版本 |
