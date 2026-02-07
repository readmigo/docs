# React Native 平台文档

## 概述

Readmigo React Native 应用使用 Expo + React Native 构建，为 iOS 和 Android 平台提供统一的移动端体验。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native | 0.81.5 |
| 开发平台 | Expo | ~54.0.30 |
| 路由 | Expo Router | ~6.0.21 |
| 状态管理 | Zustand | ^5.0.9 |
| 数据获取 | React Query | ^5.90.12 |
| 语言 | TypeScript | ~5.9.2 |

## 项目结构

```
mobile/
├── app/                    # Expo Router 路由
│   ├── (auth)/            # 认证相关页面
│   ├── (tabs)/            # 主 Tab 导航
│   └── book/              # 书籍详情/阅读器
├── src/
│   ├── components/        # 共享组件
│   ├── components/        # 共享组件 (feedback, layout, navigation, ui)
│   ├── features/          # 功能模块 (15 个)
│   ├── hooks/             # 自定义 Hooks
│   ├── i18n/              # 国际化
│   ├── services/          # API 服务 (api, notifications, storage)
│   ├── stores/            # Zustand 状态
│   ├── theme/             # 设计系统
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
└── assets/                # 静态资源
```

## 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Expo Router (File-based Navigation)                        │
│  ├── (auth)/ - Login, Onboarding                           │
│  ├── (tabs)/ - Library, Discover, Learn, Profile           │
│  └── book/   - Detail, Reader                              │
├─────────────────────────────────────────────────────────────┤
│                     Feature Modules                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │  Reader  │ │ Audiobook│ │ Learning │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   AI     │ │ Library  │ │Vocabulary│ │ Settings │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    State Management                          │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   Zustand Stores    │  │    React Query      │          │
│  │   (Client State)    │  │   (Server State)    │          │
│  └─────────────────────┘  └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      Services Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   API    │ │ Storage  │ │   i18n   │ │RevenueCat│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## 功能模块

| 模块 | 描述 | 状态 |
|------|------|------|
| About | 关于页面 | ✅ |
| Agora | 社区功能 | ✅ |
| AI | AI 解释/翻译 | ✅ |
| Auth | 用户认证（邮箱、Google、Apple） | ✅ |
| Audiobook | 有声书播放 | ✅ |
| Books | 书籍浏览 | ✅ |
| Learning | 学习统计 | ✅ |
| Library | 书库管理 | ✅ |
| Messaging | 消息系统 | ✅ |
| Reader | EPUB 阅读器 | ✅ |
| Search | 搜索功能 | ✅ |
| Settings | 应用设置 | ✅ |
| Social | 社交功能 | ✅ |
| Subscriptions | 订阅管理 | ✅ |
| Vocabulary | 词汇学习 | ✅ |

## 支持平台

| 平台 | 最低版本 | 状态 |
|------|----------|------|
| iOS | 13.0+ | ✅ |
| Android | API 21+ | ✅ |

## 文档索引

### 核心文档

- [架构设计](./architecture.md)
- [状态管理](./state-management.md)
- [导航系统](./navigation.md)
- [API 集成](./api-integration.md)
- [设计系统](./design-system.md)
- [设计系统实现](./design-system-implementation.md)
- [开发环境](./development-setup.md)
- [测试策略](./testing.md)
- [性能优化](./performance.md)
- [发布流程](./release-process.md)
- [App 提交指南](./app-submission-guide.md)
- [客户端实现计划](./client-implementation-plan.md)

### 功能文档

- [阅读器](./features/reader.md)
- [有声书](./features/audiobook.md)
- [书库管理](./features/library.md)
- [学习功能](./features/learning.md)
- [词汇学习](./features/vocabulary.md)
- [AI 功能](./features/ai.md)
- [认证系统](./features/auth.md)
- [设置](./features/settings.md)
- [发现页](./features/discover.md)
- [订阅系统](./features/subscriptions.md)

## 关键依赖

```
核心框架
├── react-native@0.81.5
├── expo@~54.0.30
├── expo-router@~6.0.21
└── typescript@~5.9.2

状态管理
├── zustand@^5.0.9
├── @tanstack/react-query@^5.90.12
└── immer@^11.1.0

导航
├── @react-navigation/native@^7.1.26
├── @react-navigation/bottom-tabs@^7.9.0
└── @react-navigation/native-stack@^7.9.0

UI 组件
├── @gorhom/bottom-sheet@^5.2.8
├── react-native-reanimated@~4.1.1
└── react-native-gesture-handler@~2.28.0

媒体
├── expo-av@~16.0.8
└── react-native-webview@13.15.0

存储
├── @react-native-async-storage/async-storage@2.2.0
└── expo-sqlite@~16.0.10

国际化
├── i18next@^25.7.3
└── react-i18next@^16.5.0
```
