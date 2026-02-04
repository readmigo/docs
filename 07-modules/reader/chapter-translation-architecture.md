# 章节翻译功能架构

## 整体数据流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              iOS Client                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────┐     │
│  │ 阅读器界面   │───▶│ 长按段落触发  │───▶│ 调用翻译API获取单段翻译      │     │
│  └─────────────┘    └──────────────┘    └─────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP Request
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Backend API (NestJS)                                 │
│                         readmigo-api.fly.dev                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ books.controller.ts                                                     │ │
│  │  GET /api/v1/books/:id/chapters/:chapterId/translations/:locale/metadata│ │
│  │  GET /api/v1/books/:id/chapters/:chapterId/translations/:locale/        │ │
│  │      paragraphs/:index                                                  │ │
│  │  GET /api/v1/books/:id/chapters/:chapterId/translations/:locale/        │ │
│  │      paragraphs?indices=0,1,2                                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ books.service.ts                                                        │ │
│  │  - getChapterTranslationMetadata() → 查询DB获取元数据                    │ │
│  │  - getParagraphTranslation() → 从R2获取JSON，返回指定段落               │ │
│  │  - getTranslationFromR2() → 私有方法，下载并解析翻译JSON                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                           │
          ▼ Prisma ORM                                ▼ S3 SDK
┌─────────────────────────┐              ┌─────────────────────────────────────┐
│   PostgreSQL (Neon)     │              │        Cloudflare R2                │
│   db-production         │              │   cdn.readmigo.app                  │
├─────────────────────────┤              ├─────────────────────────────────────┤
│ chapter_translations    │              │ 翻译JSON文件存储结构:                │
│ ┌─────────────────────┐ │              │                                     │
│ │ id                  │ │              │ books/                              │
│ │ chapter_id (FK)     │─┼──────┐       │   └── {bookId}/                     │
│ │ locale              │ │      │       │       └── translations/             │
│ │ content_url ────────┼─┼──────┼──────▶│           └── zh-Hans/              │
│ │ paragraph_count     │ │      │       │               └── chapters/         │
│ │ source              │ │      │       │                   └── {chapterId}.json
│ │ status              │ │      │       │                                     │
│ │ translated_at       │ │      │       │                                     │
│ └─────────────────────┘ │      │       │                                     │
│                         │      │       │                                     │
│ chapters                │      │       │                                     │
│ ┌─────────────────────┐ │      │       │                                     │
│ │ id ◀────────────────┼─┼──────┘       │                                     │
│ │ book_id (FK)        │ │              │                                     │
│ │ title               │ │              │                                     │
│ │ order               │ │              │                                     │
│ │ content_v2_url      │ │              │                                     │
│ │ word_count          │ │              │                                     │
│ └─────────────────────┘ │              │                                     │
└─────────────────────────┘              └─────────────────────────────────────┘
```

## 组件关系

| 组件 | 说明 | 位置 |
|------|------|------|
| **Chapter (章节)** | 原始英文章节内容 | R2: `books/{bookId}/chapters/{chapterId}.html` |
| **ChapterTranslation (翻译记录)** | 翻译元数据索引 | PostgreSQL: `chapter_translations` 表 |
| **Translation JSON (翻译文件)** | 实际翻译内容 | R2: `books/{bookId}/translations/{locale}/chapters/{chapterId}.json` |
| **API** | 懒加载翻译服务 | Backend: `books.controller.ts` + `books.service.ts` |
| **Client** | iOS阅读器 | 长按段落时调用API |

## 数据关系

```
Book (1) ───────┬───────▶ (N) Chapter
                │              │
                │              │ 1:N
                │              ▼
                │         ChapterTranslation
                │              │
                │              │ content_url
                │              ▼
                └────────▶ R2 Translation JSON
                              │
                              │ paragraphs[]
                              ▼
                         段落级翻译数据
```

## 数据库模型

### ChapterTranslation

```prisma
model ChapterTranslation {
  id             String   @id @default(uuid()) @db.Uuid
  chapterId      String   @map("chapter_id") @db.Uuid
  chapter        Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  locale         String   @db.VarChar(10)           // e.g., "zh-Hans"
  contentUrl     String   @map("content_url") @db.VarChar(500)
  paragraphCount Int      @map("paragraph_count")
  source         String   @default("manual") @db.VarChar(20)  // manual, deepl, niutrans
  status         String   @default("draft") @db.VarChar(20)   // draft, published
  translatedAt   DateTime? @map("translated_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@unique([chapterId, locale])
  @@map("chapter_translations")
}
```

## R2 存储结构

```
readmigo-production/
└── books/
    └── {bookId}/
        ├── chapters/
        │   └── {chapterId}.html          # 原始章节HTML
        └── translations/
            └── {locale}/                  # e.g., zh-Hans
                └── chapters/
                    └── {chapterId}.json   # 翻译JSON
```

## 翻译JSON格式

```json
{
  "version": "1.0",
  "chapterId": "32f4913d-6389-4590-aba8-863360927165",
  "locale": "zh-Hans",
  "paragraphs": [
    {
      "index": 0,
      "original": "It was four o'clock when the ceremony was over...",
      "translation": "仪式结束时已是下午四点..."
    },
    {
      "index": 1,
      "original": "This was unfortunate...",
      "translation": "这很不幸..."
    }
  ],
  "metadata": {
    "translatedAt": "2026-02-04T18:15:00Z",
    "source": "niutrans",
    "wordCount": 8427
  }
}
```

## API 端点

### 获取翻译元数据

```
GET /api/v1/books/:bookId/chapters/:chapterId/translations/:locale/metadata

Response:
{
  "chapterId": "32f4913d-6389-4590-aba8-863360927165",
  "locale": "zh-Hans",
  "paragraphCount": 43,
  "status": "published",
  "translatedAt": "2026-02-04T18:15:00Z"
}
```

### 获取单段翻译（懒加载）

```
GET /api/v1/books/:bookId/chapters/:chapterId/translations/:locale/paragraphs/:index

Response:
{
  "chapterId": "32f4913d-6389-4590-aba8-863360927165",
  "locale": "zh-Hans",
  "paragraphIndex": 0,
  "original": "It was four o'clock when the ceremony was over...",
  "translation": "仪式结束时已是下午四点..."
}
```

### 批量获取翻译

```
GET /api/v1/books/:bookId/chapters/:chapterId/translations/:locale/paragraphs?indices=0,1,2

Response:
[
  { "paragraphIndex": 0, "original": "...", "translation": "..." },
  { "paragraphIndex": 1, "original": "...", "translation": "..." },
  { "paragraphIndex": 2, "original": "...", "translation": "..." }
]
```

## 翻译工作流

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   提取段落    │────▶│   API翻译    │────▶│  保存JSON    │────▶│   上传R2     │
│              │     │  (Niutrans)  │     │              │     │  + 创建记录   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  translate-         batch-translate-      temp-translations/    upload-translation.ts
  chapter.ts         chapters.ts           {bookId}/
                                           chapter-{n}.json
```

## 相关文件

| 文件 | 用途 |
|------|------|
| `packages/database/prisma/schema.prisma` | ChapterTranslation 数据模型 |
| `src/modules/books/books.controller.ts` | 翻译API端点定义 |
| `src/modules/books/books.service.ts` | 翻译业务逻辑 |
| `src/scripts/batch-translate-chapters.ts` | 批量翻译脚本 |
| `src/scripts/upload-translation.ts` | 上传翻译到R2 |
| `docs/translation-workflow.md` | 翻译工作流程文档 |

## 支持的翻译服务

| 服务 | Provider值 | 免费额度 | 特点 |
|------|-----------|---------|------|
| 小牛翻译 | `niutrans` | 600万字符/月 | 性价比最高 |
| DeepL | `deepl` | 50万字符/月 | 翻译质量最佳 |
| OpenAI | `openai` | 无 | 可自定义风格 |
