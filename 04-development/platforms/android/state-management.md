# Android 状态管理

> ViewModel + StateFlow + MVI 模式

---

## 1. 状态管理概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    状态管理层级                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  应用级状态                                                      │
│  ├── 用户会话                    UserSessionManager             │
│  ├── 主题设置                    ThemeManager                   │
│  └── 网络状态                    NetworkMonitor                 │
│                                                                  │
│  功能级状态                                                      │
│  ├── 阅读器状态                  ReaderViewModel                │
│  ├── 书架状态                    LibraryViewModel               │
│  └── 学习状态                    LearningViewModel              │
│                                                                  │
│  UI 组件状态                                                     │
│  ├── 表单状态                    remember { }                   │
│  ├── 动画状态                    animateXAsState                │
│  └── 滚动状态                    rememberLazyListState         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. MVI 状态模式

### 2.1 核心组件

| 组件 | 职责 |
|------|------|
| State | 完整 UI 状态表示 |
| Intent/Action | 用户意图/操作 |
| SideEffect | 一次性事件 |
| Reducer | 状态转换逻辑 |

### 2.2 状态流转

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVI 单向数据流                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│      ┌─────────┐                                                │
│      │  User   │                                                │
│      └────┬────┘                                                │
│           │ Intent (点击、输入)                                  │
│           ▼                                                      │
│      ┌─────────┐        ┌─────────┐                            │
│      │ Screen  │───────▶│ Action  │                            │
│      └─────────┘        └────┬────┘                            │
│           ▲                  │                                  │
│           │                  ▼                                  │
│           │            ┌─────────┐        ┌─────────┐          │
│           │            │ViewModel│───────▶│ UseCase │          │
│           │            └────┬────┘        └────┬────┘          │
│           │                 │                  │                │
│           │                 │◀─────────────────┘                │
│           │                 │ Result                            │
│           │                 ▼                                   │
│           │            ┌─────────┐                              │
│           │            │ Reducer │                              │
│           │            └────┬────┘                              │
│           │                 │                                   │
│           │                 ▼                                   │
│      ┌────┴────┐       ┌─────────┐                             │
│      │  State  │◀──────│StateFlow│                             │
│      └─────────┘       └─────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. ViewModel 设计

### 3.1 基础 ViewModel 结构

```
┌─────────────────────────────────────────────────────────────────┐
│                    ViewModel 组成                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BaseViewModel                                                  │
│  ├── _uiState: MutableStateFlow<UiState>                       │
│  ├── uiState: StateFlow<UiState>                               │
│  ├── _sideEffect: Channel<SideEffect>                          │
│  ├── sideEffect: Flow<SideEffect>                              │
│  └── onAction(action: Action)                                  │
│                                                                  │
│  具体 ViewModel                                                  │
│  ├── 继承 BaseViewModel                                         │
│  ├── 注入 UseCase                                               │
│  ├── 定义 State sealed class                                   │
│  ├── 定义 Action sealed class                                  │
│  └── 定义 SideEffect sealed class                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 状态定义模式

| 模式 | 说明 |
|------|------|
| sealed class | 有限状态集合 |
| data class | 具体状态数据 |
| object | 单例状态 (如 Loading) |

---

## 4. StateFlow 使用

### 4.1 Flow 类型选择

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flow 类型对比                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  StateFlow                                                      │
│  ├── 用途: UI 状态                                              │
│  ├── 特点: 有初始值，重放最新值                                  │
│  └── 场景: UiState                                              │
│                                                                  │
│  SharedFlow                                                     │
│  ├── 用途: 事件流                                               │
│  ├── 特点: 可配置重放数量                                        │
│  └── 场景: 多订阅者事件                                         │
│                                                                  │
│  Channel                                                        │
│  ├── 用途: 一次性事件                                           │
│  ├── 特点: 每个事件只消费一次                                    │
│  └── 场景: SideEffect (导航、Toast)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 生命周期感知

| API | 说明 |
|-----|------|
| collectAsStateWithLifecycle | 自动管理生命周期 |
| repeatOnLifecycle | 手动控制收集 |
| flowWithLifecycle | Flow 扩展 |

---

## 5. Compose 状态

### 5.1 状态 API

```
┌─────────────────────────────────────────────────────────────────┐
│                    Compose 状态 API                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  remember                                                       │
│  └── 在重组间保持状态                                            │
│                                                                  │
│  rememberSaveable                                               │
│  └── 配置变更后恢复状态                                          │
│                                                                  │
│  mutableStateOf                                                 │
│  └── 创建可观察状态                                              │
│                                                                  │
│  derivedStateOf                                                 │
│  └── 派生计算状态                                                │
│                                                                  │
│  snapshotFlow                                                   │
│  └── 状态转换为 Flow                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 状态提升

| 层级 | 状态类型 |
|------|----------|
| Composable 内部 | UI 交互状态 |
| Screen 级别 | 页面状态 |
| ViewModel | 业务状态 |
| 全局单例 | 应用状态 |

---

## 6. 全局状态管理

### 6.1 Hilt 单例

```
┌─────────────────────────────────────────────────────────────────┐
│                    全局状态管理                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UserSessionManager (@Singleton)                                │
│  ├── currentUser: StateFlow<User?>                             │
│  ├── isLoggedIn: StateFlow<Boolean>                            │
│  ├── login(credentials)                                        │
│  └── logout()                                                  │
│                                                                  │
│  ThemeManager (@Singleton)                                      │
│  ├── isDarkMode: StateFlow<Boolean>                            │
│  ├── themeConfig: StateFlow<ThemeConfig>                       │
│  └── setDarkMode(enabled)                                      │
│                                                                  │
│  NetworkMonitor (@Singleton)                                    │
│  ├── isOnline: StateFlow<Boolean>                              │
│  └── networkType: StateFlow<NetworkType>                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 DataStore 持久化

| 类型 | 用途 |
|------|------|
| Preferences DataStore | 简单键值对 |
| Proto DataStore | 类型安全的复杂数据 |

---

## 7. 阅读器状态

### 7.1 状态结构

```
┌─────────────────────────────────────────────────────────────────┐
│                    ReaderState 结构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ReaderUiState                                                  │
│  ├── bookInfo: BookInfo?                                       │
│  ├── currentChapter: Chapter?                                  │
│  ├── currentPage: Int                                          │
│  ├── totalPages: Int                                           │
│  ├── progress: Float                                           │
│  ├── isLoading: Boolean                                        │
│  └── error: ReaderError?                                       │
│                                                                  │
│  ReaderSettings                                                 │
│  ├── fontSize: Int                                             │
│  ├── fontFamily: FontFamily                                    │
│  ├── lineSpacing: Float                                        │
│  ├── theme: ReaderTheme                                        │
│  └── scrollMode: Boolean                                       │
│                                                                  │
│  SelectionState                                                 │
│  ├── selectedText: String?                                     │
│  ├── selectionBounds: Rect?                                    │
│  └── showToolbar: Boolean                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 阅读器 Action

| Action | 说明 |
|--------|------|
| LoadBook | 加载书籍 |
| NavigateToChapter | 跳转章节 |
| NextPage | 下一页 |
| PrevPage | 上一页 |
| UpdateSettings | 更新设置 |
| SelectText | 选中文本 |

---

## 8. 状态恢复

### 8.1 SavedStateHandle

```
┌─────────────────────────────────────────────────────────────────┐
│                    状态恢复机制                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SavedStateHandle                                               │
│  ├── 自动保存/恢复                                               │
│  ├── 进程死亡后恢复                                              │
│  └── 导航参数传递                                                │
│                                                                  │
│  支持类型                                                        │
│  ├── 基本类型                                                    │
│  ├── String                                                     │
│  ├── Parcelable                                                 │
│  └── Serializable                                               │
│                                                                  │
│  获取方式                                                        │
│  ├── get<T>(key)                                               │
│  ├── getStateFlow(key, default)                                │
│  └── saveable delegate                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 恢复策略

| 场景 | 方案 |
|------|------|
| 配置变更 | ViewModel 存活 |
| 进程死亡 | SavedStateHandle |
| 应用重启 | DataStore 持久化 |

---

## 9. 最佳实践

### 9.1 状态设计原则

```
┌─────────────────────────────────────────────────────────────────┐
│                    状态设计原则                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  单一数据源                                                      │
│  └── 每个数据只有一个权威来源                                     │
│                                                                  │
│  不可变状态                                                      │
│  └── 使用 data class copy() 更新                                │
│                                                                  │
│  状态最小化                                                      │
│  └── 只保存必要数据，派生数据用 derivedStateOf                   │
│                                                                  │
│  状态隔离                                                        │
│  └── 不同功能的状态相互独立                                       │
│                                                                  │
│  避免状态冗余                                                    │
│  └── 不重复存储相同数据                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 常见问题

| 问题 | 解决方案 |
|------|----------|
| 状态丢失 | 使用 SavedStateHandle |
| 重复请求 | 使用 stateIn(WhileSubscribed) |
| 内存泄漏 | 使用 viewModelScope |
| 状态不同步 | 单一数据源原则 |

---

## 10. 相关文档

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 架构设计 |
| [performance.md](./performance.md) | 性能优化 |
| [testing.md](./testing.md) | 测试策略 |

---

*最后更新: 2025-12-31*
