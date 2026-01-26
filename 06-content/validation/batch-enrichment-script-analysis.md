# batch-enrichment-standalone.ts 脚本分析报告

**分析时间**: 2026-01-11
**更新时间**: 2026-01-11（架构优化：客户端直接从 R2 获取内容）
**脚本路径**: `packages/database/scripts/batch-enrichment-standalone.ts`

---

## 1. 新架构概述

### 架构变更

| 对比项 | 旧架构 | 新架构 |
|--------|--------|--------|
| 章节内容存储 | 数据库 htmlContent | R2 |
| API 返回 | htmlContent 全文 | contentUrl (R2 URL) |
| 客户端获取 | 从 API 响应 | 从 R2 CDN 直接获取 |
| 数据库存储 | ~384 MB | ~0.1 MB (仅 URL) |

### 新数据流

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    batch-enrichment-standalone.ts 新流程                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. 下载 EPUB 文件                                                           │
│     ↓                                                                        │
│  2. 解析 EPUB → 提取章节内容和图片                                            │
│     ↓                                                                        │
│  3. 上传图片到 R2 → `books/{bookId}/images/img-N.jpg`                        │
│     ↓                                                                        │
│  4. 上传章节到 R2 → `books/{bookId}/chapters/{chapterId}.html` ← ✓ 被使用    │
│     ↓                                                                        │
│  5. 创建数据库记录 → 存储 contentUrl（引用 R2）                               │
│     ↓                                                                        │
│  6. 客户端请求 → API 返回 contentUrl → 客户端从 R2 CDN 获取内容              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 存储优化效果

| 存储位置 | 旧架构 | 新架构 | 节省 |
|----------|--------|--------|------|
| 数据库 content | ~183 MB | 0 | ~183 MB |
| 数据库 htmlContent | ~201 MB | 0 | ~201 MB |
| 数据库 contentUrl | ~0.1 MB | ~0.1 MB | 0 |
| R2 chapters | ~163 MB | ~163 MB | 0 |
| **总计** | ~547 MB | ~163 MB | **~384 MB (70%)** |

---

## 2. 修改清单

### 2.1 batch-enrichment-standalone.ts

**位置**: line 1011-1022

**修改前:**
```typescript
await tx.chapter.create({
  data: {
    bookId: book.id,
    order: chapter.order,
    title: chapter.title,
    href: chapter.href,
    content: chapter.content,      // ← 移除
    htmlContent: chapter.htmlContent,  // ← 移除
    contentUrl,
    wordCount: chapter.wordCount,
  },
});
```

**修改后:**
```typescript
await tx.chapter.create({
  data: {
    bookId: book.id,
    order: chapter.order,
    title: chapter.title,
    href: chapter.href,
    contentUrl,                    // ✓ 保留，指向 R2
    wordCount: chapter.wordCount,
  },
});
```

### 2.2 books.service.ts

**位置**: line 357-415

**修改前:**
```typescript
select: {
  id: true,
  title: true,
  content: true,
  htmlContent: true,  // ← 返回数据库内容
  wordCount: true,
}
```

**修改后:**
```typescript
select: {
  id: true,
  title: true,
  contentUrl: true,   // ✓ 返回 R2 URL
  wordCount: true,
}
```

### 2.3 iOS 客户端

**文件**: `ios/Readmigo/Core/Models/Book.swift`

```swift
struct ChapterContent: Codable, Identifiable {
    let id: String
    let title: String
    let order: Int
    let contentUrl: String  // ← 新增
    let wordCount: Int
    let previousChapterId: String?
    let nextChapterId: String?

    // htmlContent 现在从 contentUrl 获取
}
```

**文件**: `ios/Readmigo/Features/Reader/ReaderViewModel.swift`

```swift
// 从 API 获取 contentUrl 后，从 R2 获取实际内容
let chapterMeta: ChapterContent = try await APIClient.shared.request(endpoint: endpoint)
let htmlContent = try await fetchFromR2(url: chapterMeta.contentUrl)
```

### 2.4 Android 客户端

**文件**: `android/.../dto/ReaderDto.kt`

```kotlin
data class ChapterContentDto(
    @Json(name = "id") val id: String,
    @Json(name = "content_url") val contentUrl: String,  // ← 新增
    @Json(name = "word_count") val wordCount: Int,
)
```

**文件**: `android/.../data/ReaderRepository.kt`

```kotlin
// 从 API 获取 contentUrl 后，从 R2 获取实际内容
val meta = apiService.getChapterContent(bookId, chapterIndex)
val htmlContent = httpClient.get(meta.contentUrl).body<String>()
```

---

## 3. 客户端请求流程

### iOS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ReaderViewModel.loadChapter()                                              │
│     ↓                                                                       │
│  API: GET /books/{bookId}/content/{chapterId}                              │
│     ↓                                                                       │
│  Response: { id, title, contentUrl, wordCount, ... }                       │
│     ↓                                                                       │
│  Fetch: GET contentUrl (R2 CDN)                                            │
│     ↓                                                                       │
│  Response: HTML content                                                     │
│     ↓                                                                       │
│  ReaderContentView 渲染 HTML                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Android

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ReaderRepository.getChapterContent()                                       │
│     ↓                                                                       │
│  API: GET /books/{bookId}/chapters/{index}/content                         │
│     ↓                                                                       │
│  Response: { id, contentUrl, wordCount, ... }                              │
│     ↓                                                                       │
│  Fetch: GET contentUrl (R2 CDN)                                            │
│     ↓                                                                       │
│  Response: HTML content                                                     │
│     ↓                                                                       │
│  ReaderWebView 渲染 HTML                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 新架构优势

| 优势 | 说明 |
|------|------|
| **数据库减负** | 节省 ~384 MB 存储空间 (70%) |
| **CDN 加速** | Cloudflare R2 全球边缘节点缓存 |
| **API 减负** | API 只返回元数据，不传输大文件 |
| **免费带宽** | R2 免费出站流量 |
| **并行获取** | 客户端可同时预加载多个章节 |

---

## 5. 相关文件

| 文件 | 说明 |
|------|------|
| `packages/database/scripts/batch-enrichment-standalone.ts` | 批处理脚本 |
| `apps/backend/src/modules/books/books.service.ts` | 后端 API |
| `ios/Readmigo/Core/Models/Book.swift` | iOS 数据模型 |
| `ios/Readmigo/Features/Reader/ReaderViewModel.swift` | iOS 阅读器 ViewModel |
| `android/.../dto/ReaderDto.kt` | Android DTO |
| `android/.../data/ReaderRepository.kt` | Android Repository |
