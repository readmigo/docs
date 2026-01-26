# 模块文档

> 跨平台模块技术方案文档

本目录包含 Readmigo 所有功能模块的统一技术文档。每个模块文档涵盖 Android、React Native 和 Web 三个平台的实现。

---

## 模块清单

| 模块 | 说明 | 优先级 |
|------|------|--------|
| [auth](./auth.md) | 认证与登录系统 | P0 |
| [onboarding](./onboarding.md) | 新用户引导流程 | P0 |
| [library](./library.md) | 书架与书籍管理 | P0 |
| [reader](./reader.md) | 阅读器核心模块 | P0 |
| [ai](./ai.md) | AI 辅助功能 | P0 |
| [learning](./learning.md) | 学习与生词本 | P1 |
| [audiobook](./audiobook.md) | 有声书功能 | P1 |
| [subscriptions](./subscriptions.md) | 订阅与支付 | P0 |
| [social](./social.md) | 社交功能 | P2 |
| [settings](./settings.md) | 设置模块 | P1 |
| [search](./search.md) | 搜索功能 | P1 |
| [messaging](./messaging.md) | 消息通知 | P2 |
| [guest-mode](./guest-mode.md) | 访客模式 | P1 |
| [i18n](./i18n.md) | 国际化 | P1 |
| [about](./about.md) | 关于页面 | P2 |

---

## 平台技术栈

### Android

| 技术 | 用途 |
|------|------|
| Kotlin | 主要开发语言 |
| Jetpack Compose | UI 框架 |
| Hilt | 依赖注入 |
| Retrofit | 网络请求 |
| Room | 本地数据库 |
| DataStore | 键值存储 |
| EncryptedSharedPreferences | 安全存储 |

### React Native

| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言 |
| Expo | 开发框架 |
| Zustand | 状态管理 |
| React Query | 数据获取 |
| expo-secure-store | 安全存储 |
| expo-router | 路由导航 |

### Web

| 技术 | 用途 |
|------|------|
| TypeScript | 主要开发语言 |
| Next.js 15 | 全栈框架 |
| NextAuth.js v5 | 认证 |
| Zustand | 状态管理 |
| React Query | 数据获取 |
| Tailwind CSS | 样式 |
| shadcn/ui | UI 组件库 |

---

## 文档结构

每个模块文档遵循以下结构：

1. **概述** - 功能范围和优先级
2. **数据模型** - 共享的类型定义
3. **API 接口** - 后端 API 规范
4. **Android 实现** - Kotlin/Compose 代码
5. **React Native 实现** - Expo/TypeScript 代码
6. **Web 实现** - Next.js/TypeScript 代码
7. **测试** - 各平台测试用例
8. **安全考虑** - 安全相关注意事项

---

*最后更新: 2025-12-28*
