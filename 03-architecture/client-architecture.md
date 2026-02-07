# 客户端架构

### 3.1 多端策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          多端开发策略                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Phase 1: iOS优先                                                       │
│  ═══════════════                                                        │
│  • 原生 Swift + SwiftUI                                                 │
│  • 最佳性能和体验                                                       │
│  • App Store 首发                                                       │
│                                                                         │
│  Phase 2: Web版本                                                       │
│  ═══════════════                                                        │
│  • React + Next.js                                                      │
│  • 响应式设计                                                           │
│  • SEO友好                                                              │
│                                                                         │
│  Phase 3: Android                                                       │
│  ═══════════════                                                        │
│  方案A: 原生 Kotlin + Compose (推荐)                                    │
│  方案B: React Native (如果资源有限)                                     │
│                                                                         │
│  Phase 4: 跨平台优化 (可选)                                             │
│  ═══════════════════════════                                            │
│  • 考虑 Flutter 重写                                                    │
│  • 或 React Native 统一                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 iOS客户端架构

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        V1["Views (SwiftUI)<br>Reader / AIChat"]
        V2["Views (SwiftUI)<br>Library / Search"]
        V3["Views (SwiftUI)<br>Learn / Review"]
        V4["Views (SwiftUI)<br>Profile / Settings"]
        VM["ViewModels<br>ReaderVM / LibraryVM / LearningVM<br>ProfileVM / AIVM / SearchVM"]
        V1 & V2 & V3 & V4 --> VM
    end

    subgraph Domain["Domain Layer"]
        UC["Use Cases<br>ReadBook / ExplainText / SyncProgress<br>ReviewWords / GetRecommendations / TrackLearning"]
        Entities["Entities<br>Book / Chapter / Word / User / Progress"]
    end

    subgraph Data["Data Layer"]
        Repo["Repositories<br>BookRepo / UserRepo<br>AIRepo / WordRepo"]
        Net["Network Service<br>REST API / WebSocket / Download"]
        Local["Local Storage<br>CoreData / UserDefaults<br>FileManager / Keychain"]
    end

    Presentation --> Domain --> Data
```

### 3.3 iOS核心模块

#### 3.3.1 EPUB阅读器引擎

```mermaid
graph TB
    EP["EPUBParser<br>解析EPUB文件结构<br>提取元数据、目录、内容<br>处理CSS样式"]
    CR["ContentRenderer<br>WKWebView渲染HTML内容<br>自定义字体、主题、间距<br>JavaScript桥接交互"]
    TS["TextSelector<br>文本选择检测<br>获取选中文字和上下文<br>触发AI解释"]
    PT["ProgressTracker<br>阅读位置追踪<br>阅读时长统计<br>云端同步"]

    EP --> CR --> TS --> PT
```

#### 3.3.2 离线支持设计

```mermaid
graph LR
    subgraph Local["本地存储"]
        CD["CoreData<br>用户数据 / 阅读进度<br>生词本 / 学习记录"]
        FM["FileManager<br>EPUB文件 / 封面图片"]
        Dict["本地词典 (SQLite)<br>离线查词 / 基础释义"]
    end

    subgraph Cloud["云端同步"]
        API["后端API<br>用户数据 / 阅读进度<br>生词本 / 学习记录"]
        OBJ["Object Storage<br>EPUB文件 / 封面图片"]
        AI["AI服务 (在线)<br>AI解释 / 深度分析"]
    end

    CD <-->|"增量同步"| API
    FM <-->|"按需下载"| OBJ
    Dict -->|"网络可用时"| AI
```

**同步策略**:
- 冲突解决：Last-Write-Wins + 版本向量
- 增量同步：只同步变更数据
- 后台同步：利用iOS Background Tasks
- 离线队列：记录离线操作，上线后重放

### 3.4 Web客户端架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Web App Architecture                             │
│                          (Next.js + React)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  项目结构：                                                              │
│  ─────────                                                              │
│  src/                                                                   │
│  ├── app/                      # Next.js App Router                     │
│  │   ├── (auth)/               # 认证相关页面                           │
│  │   │   ├── login/                                                     │
│  │   │   └── register/                                                  │
│  │   ├── (main)/               # 主要功能页面                           │
│  │   │   ├── library/          # 书库                                   │
│  │   │   ├── reader/[bookId]/  # 阅读器                                 │
│  │   │   ├── learn/            # 学习中心                               │
│  │   │   └── profile/          # 个人中心                               │
│  │   └── api/                  # API Routes (BFF层)                     │
│  │                                                                      │
│  ├── components/               # 通用组件                               │
│  │   ├── ui/                   # 基础UI组件                             │
│  │   ├── reader/               # 阅读器组件                             │
│  │   ├── ai/                   # AI交互组件                             │
│  │   └── learning/             # 学习组件                               │
│  │                                                                      │
│  ├── hooks/                    # 自定义Hooks                            │
│  │   ├── useReader.ts                                                   │
│  │   ├── useAI.ts                                                       │
│  │   └── useLearning.ts                                                 │
│  │                                                                      │
│  ├── stores/                   # 状态管理 (Zustand)                     │
│  │   ├── readerStore.ts                                                 │
│  │   ├── userStore.ts                                                   │
│  │   └── learningStore.ts                                               │
│  │                                                                      │
│  ├── services/                 # API服务                                │
│  │   ├── api.ts                # API客户端                              │
│  │   ├── bookService.ts                                                 │
│  │   └── aiService.ts                                                   │
│  │                                                                      │
│  └── lib/                      # 工具库                                 │
│      ├── epub/                 # EPUB解析                               │
│      └── utils/                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 共享代码策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          跨端共享策略                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  可共享部分                       平台特定部分                           │
│  ────────────                     ────────────                           │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐                │
│  │  API Schema         │         │  UI组件             │                │
│  │  (OpenAPI/TypeSpec) │         │  • iOS: SwiftUI     │                │
│  │                     │         │  • Web: React       │                │
│  │  • 自动生成类型     │         │  • Android: Compose │                │
│  │  • 接口定义统一     │         │                     │                │
│  └─────────────────────┘         └─────────────────────┘                │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐                │
│  │  业务逻辑           │         │  原生能力           │                │
│  │  (可选: KMM/WASM)   │         │  • 文件系统         │                │
│  │                     │         │  • 推送通知         │                │
│  │  • 数据模型         │         │  • 内购支付         │                │
│  │  • 验证规则         │         │  • 系统集成         │                │
│  └─────────────────────┘         └─────────────────────┘                │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐                │
│  │  设计系统           │         │  存储实现           │                │
│  │  (Design Tokens)    │         │  • iOS: CoreData    │                │
│  │                     │         │  • Web: IndexedDB   │                │
│  │  • 颜色             │         │  • Android: Room    │                │
│  │  • 字体             │         │                     │                │
│  │  • 间距             │         │                     │                │
│  └─────────────────────┘         └─────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

