# Library Tab 数据流梳理文档

## 概述

Library Tab 是用户个人书库页面，展示用户添加到个人库的书籍，支持按阅读状态过滤。

---

## 1. Library Tab 什么时候有数据

### 数据加载时机

| 触发条件 | 说明 |
|----------|------|
| 首次打开 Library Tab | 通过 `.task` 修饰符触发 `fetchUserLibrary()` |
| 下拉刷新 | 通过 `elegantRefreshable` 触发重新获取 |
| 添加/移除书籍后 | 操作完成后自动调用 `fetchUserLibrary()` 刷新 |

### 数据条件

- **登录用户**: 从 API `/reading/library` 获取用户书库数据
- **游客模式**: 书库为空（`userBooks.isEmpty == true`）

### 加载逻辑（LibraryView.swift）

```swift
.task {
    if libraryManager.userBooks.isEmpty {
        await libraryManager.fetchUserLibrary()
    }
}

.elegantRefreshable {
    await libraryManager.fetchUserLibrary()
}
```

---

## 2. 子 Tab（过滤器）什么时候有数据

Library Tab 有 4 个过滤标签：

| 过滤器 | 筛选条件 | 什么时候有数据 |
|--------|----------|----------------|
| **All** | 无筛选 | 只要 `userBooks` 不为空就有数据 |
| **Reading** | `status == .reading` | 有书籍状态为"正在阅读" |
| **Want to Read** | `status == .wantToRead` | 有书籍状态为"想读" |
| **Completed** | `status == .completed` | 有书籍状态为"已完成" |

### 状态枚举定义

```swift
enum BookStatus: String, Codable {
    case wantToRead = "want_to_read"  // 想读
    case reading = "reading"           // 正在阅读
    case completed = "completed"       // 已完成
}
```

### 过滤逻辑

```swift
var filteredBooks: [UserBook] {
    switch selectedFilter {
    case .all:
        return userBooks
    case .reading:
        return userBooks.filter { $0.status == .reading }
    case .wantToRead:
        return userBooks.filter { $0.status == .wantToRead }
    case .completed:
        return userBooks.filter { $0.status == .completed }
    }
}
```

### Continue Reading 区域

- 位于页面顶部
- 显示条件：存在 `status == .reading` 的书籍
- 横向滚动展示，显示阅读进度百分比

---

## 3. 本地缓存机制

### 缓存层级架构

Library Tab 使用**三层缓存系统**：

| 层级 | 类型 | 容量 | 说明 |
|------|------|------|------|
| L1 | HTTP URLCache | 内存 20MB / 磁盘 100MB | 系统级 HTTP 响应缓存 |
| L2 | ResponseCacheService | 内存（最多 100 条） | 应用级 TTL 响应缓存 |
| L3 | Kingfisher 图片缓存 | 内存 50MB / 磁盘 200MB | 书籍封面图片缓存 |

### 缓存服务（ResponseCacheService）

```swift
struct CachedResponse {
    let data: Data          // 缓存的数据
    let timestamp: Date     // 缓存时间
    let ttl: TimeInterval   // 生存时间

    var isExpired: Bool {
        Date().timeIntervalSince(timestamp) > ttl
    }
}
```

### 缓存键规则

```swift
static func userLibraryKey() -> String { "user_library" }
static func bookDetailKey(_ bookId: String) -> String { "book_detail_\(bookId)" }
static func booksListKey(page: Int, limit: Int, search: String?) -> String
```

---

## 4. 数据更新时机

| 场景 | 触发方式 | 说明 |
|------|----------|------|
| 首次进入 Library Tab | 自动 | `userBooks.isEmpty` 时触发 |
| 下拉刷新 | 用户操作 | 强制重新获取最新数据 |
| 添加书籍到库 | 自动 | `addToLibrary()` 后调用 `fetchUserLibrary()` |
| 从库移除书籍 | 本地同步 | 直接从 `userBooks` 数组移除，无需重新请求 |
| 缓存过期 | 自动 | 5 分钟 TTL 过期后重新请求 |

### 添加书籍操作

```swift
func addToLibrary(bookId: String) async throws {
    let _: UserBook = try await APIClient.shared.request(
        endpoint: APIEndpoints.addToLibrary(bookId),
        method: .post
    )
    await fetchUserLibrary()  // 刷新整个书库
}
```

### 移除书籍操作

```swift
func removeFromLibrary(bookId: String) async throws {
    let _: EmptyResponse = try await APIClient.shared.request(
        endpoint: APIEndpoints.removeFromLibrary(bookId),
        method: .delete
    )
    userBooks.removeAll { $0.book.id == bookId }  // 本地同步删除
}
```

---

## 5. 缓存过期策略

### TTL（生存时间）配置

| 数据类型 | TTL | 时间 |
|----------|-----|------|
| **userLibrary** | 300 秒 | **5 分钟** |
| bookList | 900 秒 | 15 分钟 |
| bookDetail | 3600 秒 | 1 小时 |
| recommendations | 3600 秒 | 1 小时 |
| categories | 86400 秒 | 24 小时 |
| search | 300 秒 | 5 分钟 |
| author | 3600 秒 | 1 小时 |

### 过期处理流程

1. 获取缓存时自动检查 `isExpired`
2. 过期数据自动删除，返回 `nil`
3. 返回 `nil` 后触发网络请求获取新数据
4. 提供 `cleanupExpired()` 方法手动清理过期数据
5. 缓存满时自动清理最老的 20% 条目

### 缓存清理接口

```swift
func invalidate(_ key: String)           // 清除单个缓存
func invalidatePrefix(_ prefix: String)  // 清除前缀匹配的缓存
func invalidateAll()                     // 清除全部缓存
func cleanupExpired()                    // 清理过期数据
```

---

## 6. 数据类型

### 6.1 UserBook（用户库书籍）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| book | Book | 书籍详情 |
| status | BookStatus | 阅读状态 |
| progress | Double | 阅读进度 (0-1) |
| currentChapterIndex | Int | 当前章节索引 |
| addedAt | Date | 添加时间 |
| lastReadAt | Date? | 最后阅读时间 |

### 6.2 Book（书籍基础信息）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 书籍 ID |
| title | String | 书名 |
| author | String | 作者 |
| description | String? | 描述 |
| coverUrl | String? | 封面 URL |
| coverThumbUrl | String? | 缩略图 URL |
| subjects | [String]? | 主题 |
| genres | [String] | 流派/类别 |
| difficultyScore | Double? | 难度分数 (0-100) |
| fleschScore | Double? | Flesch 可读性分数 |
| wordCount | Int? | 字数 |
| chapterCount | Int? | 章节数 |
| source | String? | 来源 |
| status | String? | 状态 |
| publishedAt | Date? | 出版时间 |
| createdAt | Date? | 创建时间 |

### 6.3 BookStatus（阅读状态枚举）

| 值 | API 值 | 说明 |
|----|--------|------|
| wantToRead | "want_to_read" | 想读 |
| reading | "reading" | 正在阅读 |
| completed | "completed" | 已完成 |

### 6.4 API 响应类型

```swift
// 用户书库响应
struct UserLibraryResponse: Codable {
    let books: [UserBook]
}
```

---

## 7. API 端点

| 功能 | 端点 | 方法 |
|------|------|------|
| 获取用户书库 | `/reading/library` | GET |
| 添加到书库 | `/reading/library/{bookId}` | POST |
| 从书库移除 | `/reading/library/{bookId}` | DELETE |

---

## 8. 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户打开 Library Tab                      │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   检查 userBooks.isEmpty                         │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                  是 ▼                 否 ▼
        ┌──────────────────┐    ┌──────────────────┐
        │ fetchUserLibrary │    │    直接显示 UI    │
        └────────┬─────────┘    └──────────────────┘
                 ▼
        ┌──────────────────┐
        │   检查 L2 缓存    │
        │ (ResponseCache)  │
        └────────┬─────────┘
                 ▼
        ┌────────┴────────┐
        │                 │
      命中 ▼            未命中 ▼
  ┌───────────┐    ┌───────────────┐
  │ 检查 TTL  │    │  API 请求      │
  │ (5分钟)   │    │/reading/library│
  └─────┬─────┘    └───────┬───────┘
        ▼                  ▼
  ┌─────┴─────┐      ┌───────────┐
  │           │      │ 更新缓存   │
过期 ▼       有效 ▼   └─────┬─────┘
┌───────┐  ┌──────┐        ▼
│API请求│  │返回   │  ┌───────────┐
└───────┘  │缓存   │  │ 更新      │
           └──────┘  │ userBooks │
                     └─────┬─────┘
                           ▼
              ┌────────────────────────┐
              │      UI 渲染更新        │
              │ • Continue Reading     │
              │ • Filter Tabs          │
              │ • Books Grid           │
              └────────────────────────┘
```

---

## 9. 关键文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| LibraryView | `ios/Readmigo/Features/Library/LibraryView.swift` | Library Tab 主视图 |
| LibraryManager | `ios/Readmigo/Features/Library/LibraryManager.swift` | 数据管理器 |
| Book Model | `ios/Readmigo/Core/Models/Book.swift` | 书籍数据模型 |
| ResponseCacheService | `ios/Readmigo/Core/Services/ResponseCacheService.swift` | 缓存服务 |
| APIClient | `ios/Readmigo/Core/Network/APIClient.swift` | 网络请求 |
| APIEndpoints | `ios/Readmigo/Core/Network/APIEndpoints.swift` | API 端点定义 |

---

## 10. 总结

| 维度 | 说明 |
|------|------|
| **数据来源** | API `/reading/library` |
| **缓存策略** | 三层缓存（HTTP + 响应缓存 + 图片缓存） |
| **缓存过期** | 用户书库 5 分钟 TTL |
| **更新触发** | 首次加载、下拉刷新、添加/删除操作 |
| **子 Tab 过滤** | 本地内存过滤，不触发网络请求 |
| **数据类型** | UserBook（包含 Book + 阅读状态 + 进度） |
