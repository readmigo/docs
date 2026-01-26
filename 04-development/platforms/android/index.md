# Android 平台文档中心

> Kotlin + Jetpack Compose + Clean Architecture

---

## 1. 平台概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    Android 平台技术栈                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  语言与框架                                                      │
│  ├── Kotlin 2.0             主开发语言                          │
│  ├── Jetpack Compose        声明式 UI                           │
│  ├── Coroutines + Flow      异步处理                            │
│  └── Hilt                   依赖注入                            │
│                                                                  │
│  架构组件                                                        │
│  ├── Clean Architecture     分层架构                            │
│  ├── ViewModel              UI 状态管理                         │
│  ├── Room                   本地数据库                          │
│  └── DataStore              键值存储                            │
│                                                                  │
│  网络与数据                                                      │
│  ├── Retrofit + OkHttp      网络请求                            │
│  ├── Kotlin Serialization   JSON 序列化                         │
│  └── Coil                   图片加载                            │
│                                                                  │
│  阅读器                                                          │
│  ├── Foliate (EPUB)         EPUB 解析渲染                       │
│  ├── PdfRenderer            PDF 渲染                            │
│  └── Custom (TXT/MOBI)      自研解析器                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 代码库结构

```
android/app/src/main/java/com/readmigo/
├── app/                         # Application 配置
│   ├── ReadmigoApp.kt
│   └── di/                      # Hilt 模块
│
├── core/                        # 核心模块
│   ├── common/                  # 公共工具
│   ├── data/                    # 数据层基础
│   ├── domain/                  # 领域层基础
│   ├── network/                 # 网络配置
│   └── ui/                      # UI 基础组件
│
├── feature/                     # 功能模块 (8 个)
│   ├── auth/                    # 认证
│   ├── library/                 # 书架
│   ├── reader/                  # 阅读器
│   ├── ai/                      # AI 功能
│   ├── learning/                # 学习
│   ├── audiobook/               # 有声书
│   ├── settings/                # 设置
│   └── explore/                 # 探索
│
└── navigation/                  # 导航配置
    └── NavGraph.kt
```

---

## 3. 功能模块矩阵

| 模块 | 功能 | 文档 |
|------|------|------|
| reader | EPUB/PDF 阅读 | [features/reader.md](./features/reader.md) |
| ai | 查词、翻译、问答 | [features/ai.md](./features/ai.md) |
| library | 书架管理 | [features/library.md](./features/library.md) |
| learning | 词汇学习 | [features/learning.md](./features/learning.md) |
| audiobook | 有声书/TTS | [features/audiobook.md](./features/audiobook.md) |
| auth | 登录注册 | [features/auth.md](./features/auth.md) |
| settings | 应用设置 | [features/settings.md](./features/settings.md) |
| explore | 书籍探索 | [features/explore.md](./features/explore.md) |

---

## 4. 核心文档索引

### 4.1 架构与设计

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 应用架构设计 |
| [state-management.md](./state-management.md) | 状态管理方案 |
| [design-system.md](./design-system.md) | 设计系统实现 |

### 4.2 开发与测试

| 文档 | 说明 |
|------|------|
| [development-setup.md](./development-setup.md) | 开发环境搭建 |
| [testing.md](./testing.md) | 测试策略 |
| [error-handling.md](./error-handling.md) | 错误处理规范 |

### 4.3 性能与优化

| 文档 | 说明 |
|------|------|
| [performance.md](./performance.md) | 性能优化方案 |
| [offline.md](./offline.md) | 离线功能实现 |

### 4.4 发布与运维

| 文档 | 说明 |
|------|------|
| [release-process.md](./release-process.md) | 发布流程 |
| [play-console.md](./play-console.md) | Play Console 配置 |
| [monitoring.md](./monitoring.md) | 监控与告警 |

---

## 5. SDK 版本要求

| 配置 | 值 |
|------|-----|
| minSdk | 26 (Android 8.0) |
| targetSdk | 34 (Android 14) |
| compileSdk | 34 |
| Kotlin | 2.0.x |
| Compose BOM | 2024.x |
| AGP | 8.5.x |

---

## 6. 代码统计

| 指标 | 数量 |
|------|------|
| Kotlin 文件 | 178 |
| 测试文件 | 89 |
| 功能模块 | 8 |
| Compose 组件 | 50+ |
| 页面/屏幕 | 20+ |

---

## 7. 构建与运行

```
┌─────────────────────────────────────────────────────────────────┐
│                    开发命令                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  构建                                                            │
│  ├── ./gradlew assembleDebug         Debug APK                  │
│  ├── ./gradlew assembleRelease       Release APK                │
│  └── ./gradlew bundleRelease         Release AAB                │
│                                                                  │
│  测试                                                            │
│  ├── ./gradlew test                  单元测试                   │
│  ├── ./gradlew connectedAndroidTest  UI 测试                    │
│  └── ./gradlew lintDebug             Lint 检查                  │
│                                                                  │
│  发布                                                            │
│  └── fastlane deploy                 发布到 Play Store          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 发布信息

| 环境 | Package Name | 说明 |
|------|--------------|------|
| 生产 | com.readmigo | Play Store |
| 测试 | com.readmigo.beta | 内部测试 |
| 开发 | com.readmigo.dev | 开发调试 |

---

## 9. 相关文档

| 类别 | 文档 |
|------|------|
| 全局架构 | [architecture/client-architecture.md](../architecture/client-architecture.md) |
| 设计系统 | [design/design-system.md](../design/design-system.md) |
| API 规范 | [api/api-design.md](../api/api-design.md) |
| 跨平台共享 | [shared/README.md](../shared/) |

---

*最后更新: 2025-12-31*
