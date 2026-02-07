# iOS 平台文档中心

> Swift + SwiftUI + MVVM + Clean Architecture

---

## 1. 平台概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    iOS 平台技术栈                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  语言与框架                                                      │
│  ├── Swift 5.9+            主开发语言                          │
│  ├── SwiftUI               声明式 UI                           │
│  ├── Combine               响应式编程                          │
│  └── Swift Concurrency     async/await                         │
│                                                                  │
│  架构组件                                                        │
│  ├── MVVM                  架构模式                            │
│  ├── SwiftData/CoreData   本地数据库                          │
│  ├── Keychain              安全存储                            │
│  └── UserDefaults          偏好设置                            │
│                                                                  │
│  网络与数据                                                      │
│  ├── URLSession            网络请求                            │
│  ├── Codable               JSON 序列化                         │
│  └── Kingfisher/SDWebImage 图片加载                            │
│                                                                  │
│  阅读器                                                          │
│  ├── Custom EPUB Engine    EPUB 解析渲染                       │
│  ├── PDFKit                PDF 渲染                            │
│  ├── AVFoundation          TTS 语音                            │
│  └── WebKit                HTML 渲染                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 代码库结构

```
ios/Readmigo/
├── App/                        # 应用入口
│   ├── ReadmigoApp.swift
│   └── AppDelegate.swift
│
├── Core/                       # 核心模块
│   ├── Components/             # 公共组件
│   ├── Config/                 # 配置管理
│   ├── Localization/           # 国际化
│   ├── Models/                 # 数据模型
│   ├── Network/                # 网络层
│   ├── Services/               # 核心服务
│   ├── Storage/                # 存储管理
│   ├── UI/                     # 基础 UI 组件
│   └── Utils/                  # 工具函数
│
├── Features/                   # 功能模块
│   ├── About/                  # 关于
│   ├── Agora/                  # 社区
│   ├── AI/                     # AI 功能
│   ├── Analytics/              # 数据分析
│   ├── AnnualReport/           # 年度报告
│   ├── Audiobook/              # 有声书
│   ├── Auth/                   # 认证
│   ├── Authors/                # 作者
│   ├── Badges/                 # 成就
│   ├── BookLists/              # 书单
│   ├── Bookmarks/              # 书签
│   ├── CarPlay/                # CarPlay
│   ├── Devices/                # 设备管理
│   ├── Help/                   # 帮助中心
│   ├── Import/                 # 书籍导入
│   ├── Learning/               # 学习
│   ├── Library/                # 书架
│   ├── Me/                     # 个人页面
│   ├── Medals/                 # 勋章
│   ├── Messaging/              # 消息
│   ├── Offline/                # 离线功能
│   ├── Onboarding/             # 引导
│   ├── Postcards/              # 明信片
│   ├── Profile/                # 个人资料
│   ├── Quotes/                 # 名言
│   ├── Reader/                 # 阅读器
│   ├── Search/                 # 搜索
│   ├── Settings/               # 设置
│   ├── Subscriptions/          # 订阅
│   └── Version/                # 版本管理
│
└── Resources/                  # 资源文件
    ├── Assets.xcassets
    └── Localizable.strings
```

---

## 3. 功能模块矩阵

| 模块 | 功能 | 文档 |
|------|------|------|
| Reader | EPUB/PDF 阅读 | [reader-engine.md](./reader-engine.md) |
| AI | 查词、翻译、问答 | [features/ai.md](./features/ai.md) |
| Library | 书架管理 | [features/library.md](./features/library.md) |
| Learning | 词汇学习 | [features/learning.md](./features/learning.md) |
| Audiobook | 有声书 | [features/audiobook.md](./features/audiobook.md) |
| Auth | 登录注册 | [login-design.md](./login-design.md) |
| Settings | 应用设置 | [features/settings.md](./features/settings.md) |
| Subscriptions | 订阅管理 | [features/subscription-implementation.md](./features/subscription-implementation.md) |

---

## 4. 核心文档索引

### 4.1 架构与设计

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 应用架构设计 |
| [client-spec.md](./client-spec.md) | 客户端规范 |
| [advanced-reader-design.md](./advanced-reader-design.md) | 高级阅读器设计 |

### 4.2 功能设计

| 文档 | 说明 |
|------|------|
| [reader-engine.md](./reader-engine.md) | 阅读器引擎 |
| [login-design.md](./login-design.md) | 登录设计 |
| [offline-support.md](./offline-support.md) | 离线支持 |
| [i18n-design.md](./i18n-design.md) | 国际化设计 |

### 4.3 阅读器功能

| 文档 | 说明 |
|------|------|
| [reader-features/basic-reader-features.md](./reader-features/basic-reader-features.md) | 基础阅读功能 |
| [reader-features/smart-reading-system.md](./reader-features/smart-reading-system.md) | 智能阅读系统 |
| [reader-features/annotation-highlighting-system.md](./reader-features/annotation-highlighting-system.md) | 标注高亮系统 |

### 4.4 发布与运维

| 文档 | 说明 |
|------|------|
| [app-store-submission.md](./app-store-submission.md) | App Store 提交 |
| [app-store-connect-setup-guide.md](./app-store-connect-setup-guide.md) | App Store Connect 配置 |

---

## 5. SDK 版本要求

| 配置 | 值 |
|------|-----|
| iOS 最低版本 | 16.0 |
| Xcode | 15.0+ |
| Swift | 5.9+ |
| SwiftUI | 4.0+ |

---

## 6. 代码统计

| 指标 | 数量 |
|------|------|
| Swift 文件 | 290+ |
| 功能模块 | 30 |
| SwiftUI 视图 | 115+ |

---

## 7. 构建与运行

```
┌─────────────────────────────────────────────────────────────────┐
│                    开发命令                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Xcode 构建                                                      │
│  ├── Cmd + B               构建项目                            │
│  ├── Cmd + R               运行项目                            │
│  └── Cmd + U               运行测试                            │
│                                                                  │
│  命令行构建                                                      │
│  ├── xcodebuild build      构建                                │
│  ├── xcodebuild test       测试                                │
│  └── xcodebuild archive    归档                                │
│                                                                  │
│  Fastlane                                                       │
│  ├── fastlane beta         发布 TestFlight                    │
│  └── fastlane release      发布 App Store                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 发布信息

| 环境 | Bundle ID | 说明 |
|------|-----------|------|
| 生产 | com.readmigo.app | App Store |
| 测试 | com.readmigo.app.beta | TestFlight |
| 开发 | com.readmigo.app.dev | 开发调试 |

---

## 9. 设备支持

| 设备 | 支持 |
|------|------|
| iPhone | iOS 16.0+ |
| iPad | iPadOS 16.0+ |
| Mac (Catalyst) | 计划中 |
| CarPlay | 有声书功能 |

---

## 10. 相关文档

| 类别 | 文档 |
|------|------|
| 全局架构 | [architecture/client-architecture.md](../architecture/client-architecture.md) |
| 设计系统 | [design/design-system.md](../design/design-system.md) |
| API 规范 | [api/api-design.md](../api/api-design.md) |
| 跨平台共享 | [shared/README.md](../shared/) |

---

*最后更新: 2025-12-31*
