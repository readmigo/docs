# Audiobook Highlight Sync Pipeline

## 概述

本文档描述了 Readmigo 有声书高亮同步功能的完整数据处理流程。该功能允许用户在听有声书时，电子书文本实时高亮显示当前朗读的句子和单词。

### 核心目标

- 实现有声书音频与电子书文本的精确同步
- 支持句子级和单词级高亮
- 支持离线使用（预生成时间戳）
- 自动化批量处理

---

## 数据模型

### 数据库表关系

```
┌──────────────┐      ┌──────────────┐      ┌────────────────────┐
│    books     │──1:N─│   chapters   │──1:1─│ audiobook_chapters │
└──────────────┘      └──────────────┘      └────────────────────┘
       │                                              │
       │                                              N
       1                                              │
       │              ┌──────────────┐                │
       └──────────────│  audiobooks  │────────────────┘
                      └──────────────┘
```

### 关键表结构

#### `books` 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR | 书名 |
| epub_url | VARCHAR | EPUB 文件 URL (R2 存储) |

#### `chapters` 表 (电子书章节)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| book_id | UUID | 关联的书籍 |
| order | INTEGER | 章节顺序 |
| title | VARCHAR | 章节标题 |
| href | VARCHAR | EPUB 内部路径 |
| **content** | TEXT | **章节纯文本内容** (需要提取) |
| html_content | TEXT | 章节 HTML 内容 |
| word_count | INTEGER | 字数统计 |

#### `audiobooks` 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | VARCHAR | 有声书标题 |
| **book_id** | UUID | **关联的电子书** (需要匹配) |
| language | VARCHAR | 语言代码 |
| status | ENUM | 状态 (ACTIVE/INACTIVE) |

#### `audiobook_chapters` 表 (有声书章节)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| audiobook_id | UUID | 关联的有声书 |
| **book_chapter_id** | UUID | **关联的电子书章节** (需要匹配) |
| chapter_number | INTEGER | 章节编号 |
| title | VARCHAR | 章节标题 |
| audio_url | VARCHAR | 音频文件 URL |
| duration | INTEGER | 时长(秒) |
| **timestamps** | JSONB | **时间戳数据** (需要生成) |

---

## 完整工作流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            HIGHLIGHT SYNC PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Step 1     │───▶│   Step 2     │───▶│   Step 3     │───▶│  Step 4   │  │
│  │  EPUB 内容   │    │ 有声书-电子书 │    │  章节级别    │    │ 时间戳   │  │
│  │    提取      │    │    匹配      │    │    匹配      │    │   生成    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘  │
│         │                   │                   │                   │        │
│         ▼                   ▼                   ▼                   ▼        │
│  chapters.content    audiobooks.book_id   audiobook_chapters   timestamps   │
│                                           .book_chapter_id      (JSONB)     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: EPUB 内容提取

### 目标
从 R2 存储的 EPUB 文件中提取每个章节的纯文本内容，填充到 `chapters.content` 字段。

### 输入
- `books.epub_url`: EPUB 文件的 R2 URL
- `chapters` 表记录（已存在，但 `content` 为空）

### 输出
- `chapters.content`: 章节纯文本内容
- `chapters.html_content`: 章节 HTML 内容（可选）
- `chapters.word_count`: 字数统计

### 处理逻辑

```typescript
async function extractEpubContent(bookId: string) {
  // 1. 获取书籍的 EPUB URL
  const book = await prisma.books.findUnique({
    where: { id: bookId },
    include: { chapters: true }
  });

  // 2. 下载 EPUB 文件
  const epubBuffer = await downloadFromR2(book.epub_url);

  // 3. 解析 EPUB (使用 epub.js 或 unzipper + xml2js)
  const epub = await parseEpub(epubBuffer);

  // 4. 遍历章节，匹配并提取内容
  for (const chapter of book.chapters) {
    // 根据 chapter.href 找到对应的 EPUB section
    const htmlContent = epub.getSection(chapter.href);

    // 提取纯文本 (去除 HTML 标签)
    const textContent = stripHtml(htmlContent);

    // 5. 更新数据库
    await prisma.chapters.update({
      where: { id: chapter.id },
      data: {
        content: textContent,
        html_content: htmlContent,
        word_count: countWords(textContent)
      }
    });
  }
}
```

### 需要的脚本
- `scripts/epub-extraction/extract-all.ts` - 批量处理所有书籍

### 当前状态
| 指标 | 值 |
|------|------|
| 总章节数 | 4,255 |
| 已提取内容 | 0 |
| 完成率 | 0% |

---

## Step 2: 有声书与电子书匹配

### 目标
将有声书 (audiobooks) 与对应的电子书 (books) 建立关联。

### 输入
- `audiobooks` 表（`book_id` 为空）
- `books` 表

### 输出
- `audiobooks.book_id`: 指向匹配的电子书

### 匹配策略

```typescript
function matchAudiobookToBook(audiobook: Audiobook, books: Book[]): Book | null {
  // 1. 标准化标题 (移除副标题、版本号等)
  const normalizedAudioTitle = normalizeTitle(audiobook.title);

  // 2. 精确匹配
  const exactMatch = books.find(b =>
    normalizeTitle(b.title) === normalizedAudioTitle
  );
  if (exactMatch) return exactMatch;

  // 3. 模糊匹配 (Levenshtein distance < threshold)
  const fuzzyMatch = books.find(b =>
    levenshtein(normalizeTitle(b.title), normalizedAudioTitle) < 3
  );
  if (fuzzyMatch) return fuzzyMatch;

  // 4. 作者 + 部分标题匹配
  // ...

  return null;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(version \d+\)/gi, '')  // 移除版本号
    .replace(/by .+$/i, '')             // 移除作者部分
    .replace(/[^\w\s]/g, '')            // 移除标点
    .trim();
}
```

### 需要的脚本
- `scripts/matching/match-audiobooks.ts` - 有声书匹配

### 当前状态
| 指标 | 值 |
|------|------|
| 总有声书数 | 119 |
| 已匹配 | 21 |
| 完成率 | 17.6% |

---

## Step 3: 章节级别匹配

### 目标
将有声书的各章节与电子书的对应章节建立关联。

### 输入
- `audiobook_chapters`（`book_chapter_id` 为空）
- `chapters`（属于已匹配的 book）

### 输出
- `audiobook_chapters.book_chapter_id`: 指向匹配的电子书章节

### 匹配策略

```typescript
async function matchChapters(audiobookId: string) {
  const audiobook = await prisma.audiobooks.findUnique({
    where: { id: audiobookId },
    include: {
      chapters: { orderBy: { chapter_number: 'asc' } },
      book: { include: { chapters: { orderBy: { order: 'asc' } } } }
    }
  });

  if (!audiobook.book) throw new Error('Audiobook not linked to book');

  const bookChapters = audiobook.book.chapters;

  for (const audioChapter of audiobook.chapters) {
    // 策略 1: 按顺序匹配 (如果章节数相同)
    if (audiobook.chapters.length === bookChapters.length) {
      const match = bookChapters[audioChapter.chapter_number - 1];
      if (match) {
        await linkChapter(audioChapter.id, match.id);
        continue;
      }
    }

    // 策略 2: 标题匹配
    const titleMatch = bookChapters.find(bc =>
      normalizeChapterTitle(bc.title) === normalizeChapterTitle(audioChapter.title)
    );
    if (titleMatch) {
      await linkChapter(audioChapter.id, titleMatch.id);
      continue;
    }

    // 策略 3: 章节号提取匹配
    const audioNum = extractChapterNumber(audioChapter.title);
    const bookMatch = bookChapters.find(bc =>
      extractChapterNumber(bc.title) === audioNum
    );
    if (bookMatch) {
      await linkChapter(audioChapter.id, bookMatch.id);
    }
  }
}
```

### 特殊情况处理

| 情况 | 处理方式 |
|------|----------|
| 章节数量不匹配 | 使用标题/章节号匹配 |
| 有声书包含引言/致谢 | 跳过无对应内容的章节 |
| 电子书章节拆分更细 | 一个音频章节可能对应多个文本章节 |

### 需要的脚本
- `scripts/matching/match-chapters.ts` - 章节级别匹配

### 当前状态
| 指标 | 值 |
|------|------|
| 已链接有声书的总章节 | ~1,200 (估算) |
| 已匹配章节 | 0 |
| 完成率 | 0% |

---

## Step 4: 时间戳生成

### 目标
使用 Whisper ASR 将有声书音频转录，并与电子书文本对齐，生成精确到单词级别的时间戳。

### 输入
- `audiobook_chapters.audio_url`: 音频文件 URL
- `chapters.content`: 章节文本内容
- `audiobook_chapters.book_chapter_id`: 必须已关联

### 输出
- `audiobook_chapters.timestamps`: JSONB 时间戳数据

### Timestamps 数据结构

```typescript
interface ChapterTimestamps {
  version: 1;
  generatedAt: string;              // ISO 8601 日期
  method: 'whisper';                // 生成方法
  language: string;                 // 语言代码
  duration: number;                 // 总时长(秒)
  segments: TimestampSegment[];     // 分段列表
}

interface TimestampSegment {
  id: number;                       // 段落 ID
  startTime: number;                // 开始时间(秒)
  endTime: number;                  // 结束时间(秒)
  text: string;                     // 对应的原文文本
  charStart: number;                // 在 content 中的起始字符位置
  charEnd: number;                  // 在 content 中的结束字符位置
  confidence: number;               // 对齐置信度 (0-1)
  words?: WordTimestamp[];          // 单词级时间戳
}

interface WordTimestamp {
  word: string;                     // 单词
  startTime: number;                // 开始时间(秒)
  endTime: number;                  // 结束时间(秒)
  charStart: number;                // 字符位置
  charEnd: number;                  // 字符位置
}
```

### 处理流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Download   │───▶│  Whisper    │───▶│   Text      │───▶│   Save to   │
│   Audio     │    │ Transcribe  │    │  Alignment  │    │   Database  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                   │                   │
     ▼                   ▼                   ▼                   ▼
  Buffer            WhisperResult      ChapterTimestamps      JSONB
  (~50MB)           (segments +        (with charStart/      (stored)
                     words)             charEnd)
```

### Whisper 服务

```yaml
# infrastructure/whisper/docker-compose.yml
services:
  whisper-cpu:
    environment:
      - WHISPER_MODEL=large-v3    # 生产环境
      - WHISPER_MODEL=base        # 开发/测试环境
      - WHISPER_DEVICE=cpu
      - WHISPER_COMPUTE_TYPE=int8
    ports:
      - "8000:8000"
```

**API 端点:**

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/transcribe` | POST | 音频转录（返回 word-level timestamps） |
| `/transcribe/align` | POST | 转录 + 与参考文本对齐 |

### 文本对齐算法

```typescript
class TextAligner {
  align(whisperSegments: WhisperSegment[], originalText: string): ChapterTimestamps {
    // 1. 标准化文本（小写、去标点、合并空格）
    const normalizedOriginal = this.normalize(originalText);

    // 2. 遍历 Whisper 转录段落
    for (const segment of whisperSegments) {
      // 3. 在原文中查找匹配位置
      const match = this.findMatch(normalizedOriginal, segment.text, searchStart);

      // 4. 映射回原始字符位置
      const charStart = this.mapToOriginal(match.start);
      const charEnd = this.mapToOriginal(match.end);

      // 5. 对齐单词级时间戳
      const words = this.alignWords(segment.words, originalText, charStart, charEnd);
    }
  }

  findMatch(haystack: string, needle: string, startFrom: number): MatchResult {
    // 策略 1: 精确匹配
    // 策略 2: 前缀匹配（前3个词）
    // 策略 3: 滑动窗口 + 相似度计算
  }
}
```

### 已有脚本
- `scripts/timestamp-generation/generate-all.ts` - 批量生成
- `scripts/timestamp-generation/whisper-client.ts` - Whisper 客户端
- `scripts/timestamp-generation/text-aligner.ts` - 文本对齐

### 当前状态
| 指标 | 值 |
|------|------|
| 可处理章节 | 0 (blocked by Step 1 & 3) |
| 已生成时间戳 | 0 |
| Whisper 服务 | Running (base model) |

---

## 依赖关系

```
Step 1 (EPUB 提取)  ─────────────────────────────────┐
                                                      ▼
Step 2 (有声书匹配) ──────▶ Step 3 (章节匹配) ──────▶ Step 4 (时间戳生成)
```

### 前置条件检查

| Step | 前置条件 |
|------|----------|
| Step 1 | `books.epub_url` 存在 |
| Step 2 | 无 |
| Step 3 | `audiobooks.book_id` 不为空 |
| Step 4 | `audiobook_chapters.book_chapter_id` 不为空 AND `chapters.content` 不为空 |

---

## 执行计划

### Phase 1: 数据准备

```bash
# 1. 提取 EPUB 内容
cd scripts/epub-extraction
npx tsx extract-all.ts --dry-run    # 预览
npx tsx extract-all.ts              # 执行

# 2. 有声书匹配（已部分完成）
cd scripts/matching
npx tsx match-audiobooks.ts --verbose

# 3. 章节匹配
npx tsx match-chapters.ts --dry-run
npx tsx match-chapters.ts
```

### Phase 2: 时间戳生成

```bash
# 启动 Whisper 服务
cd infrastructure/whisper
WHISPER_MODEL=large-v3 docker-compose --profile cpu up -d

# 生成时间戳
cd scripts/timestamp-generation
npx tsx generate-all.ts --dry-run    # 预览
npx tsx generate-all.ts --verbose    # 执行
```

### Phase 3: 验证

```bash
# 验证时间戳质量
npx tsx validate-timestamps.ts

# 检查覆盖率
psql -d readmigo_debug -c "
  SELECT
    COUNT(*) as total,
    COUNT(timestamps) as with_timestamps,
    ROUND(COUNT(timestamps)::numeric / COUNT(*) * 100, 2) as percentage
  FROM audiobook_chapters
  WHERE book_chapter_id IS NOT NULL;
"
```

---

## 错误处理

### Step 1: EPUB 提取

| 错误 | 处理 |
|------|------|
| EPUB 下载失败 | 重试 3 次，记录错误日志 |
| EPUB 格式损坏 | 跳过，记录错误 |
| 章节 href 不匹配 | 尝试模糊匹配 |

### Step 4: 时间戳生成

| 错误 | 处理 |
|------|------|
| 音频下载失败 | 重试 3 次 |
| Whisper 服务不可用 | 退出并提示启动服务 |
| 对齐失败（confidence < 0.5） | 标记为低质量，仍保存 |
| 内存不足 | 分批处理长章节 |

---

## 监控与日志

### 生成统计

```typescript
interface GenerationStats {
  total: number;        // 总章节数
  success: number;      // 成功数
  failed: number;       // 失败数
  skipped: number;      // 跳过数（已有时间戳/无内容）
  errors: Array<{
    chapterId: string;
    error: string;
  }>;
}
```

### 日志输出示例

```
============================================================
  Timestamp Generation Pipeline
============================================================

📚 Found 21 linked audiobook(s) to process

──────────────────────────────────────────────────
📖 Pride and Prejudice
   37 chapters, Language: en
    ⬇️  Chapter 1: Downloading audio...
        Downloaded 12.34 MB
    🎤 Chapter 1: Transcribing with Whisper...
        Got 156 segments, duration: 423.5s
    🔗 Chapter 1: Aligning with book text...
        Aligned 152/156 segments (97.4%)
    ✅ Chapter 1: Done (156 segments)
    ...

   Summary: 35 success, 2 failed, 0 skipped

============================================================
  Generation Complete
============================================================
  Total chapters:   721
  Success:          698
  Failed:           12
  Skipped:          11
  Time elapsed:     45.3 minutes
============================================================
```

---

## iOS 客户端集成

### HighlightSyncManager

```swift
class HighlightSyncManager: ObservableObject {
    @Published var currentSegment: TimestampSegment?
    @Published var highlightRange: HighlightRange?
    @Published var wordHighlightRange: HighlightRange?

    func loadTimestamps(for chapterId: String) async {
        // 1. 尝试从本地缓存加载
        // 2. 如果没有，从 API 获取
        // 3. 解析并存储
    }

    func updatePosition(_ time: TimeInterval) {
        // 1. 二分查找当前 segment
        // 2. 更新 highlightRange
        // 3. 如果有 word-level，更新 wordHighlightRange
    }
}
```

### 离线支持

时间戳数据可预先打包上传到 R2：

```
R2_BUCKET/
└── audiobooks/
    └── {audiobook_id}/
        └── timestamps.json    # 所有章节的时间戳
```

---

## 待开发脚本清单

| 脚本 | 路径 | 状态 |
|------|------|------|
| EPUB 内容提取 | `scripts/epub-extraction/extract-all.ts` | 待开发 |
| 章节匹配 | `scripts/matching/match-chapters.ts` | 待开发 |
| 时间戳验证 | `scripts/timestamp-generation/validate-timestamps.ts` | 待开发 |
| 有声书匹配 | `scripts/matching/match-audiobooks.ts` | 已完成 (21/119) |
| 时间戳生成 | `scripts/timestamp-generation/generate-all.ts` | 已完成 |
| Whisper 服务 | `infrastructure/whisper/` | 已完成 |

---

## 附录

### A. 环境变量

```bash
# Database
DATABASE_URL=postgresql://user@localhost:5432/readmigo_debug

# R2 Storage (for EPUB download)
R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=readmigo-debug

# Whisper Service
WHISPER_SERVICE_URL=http://localhost:8000
```

### B. Whisper 模型选择

| 模型 | 大小 | 速度 | 准确率 | 推荐场景 |
|------|------|------|--------|----------|
| base | 74 MB | 最快 | 较低 | 开发测试 |
| small | 244 MB | 快 | 中等 | 快速验证 |
| medium | 769 MB | 中等 | 较高 | 平衡选择 |
| large-v3 | 3.1 GB | 慢 | 最高 | 生产环境 |

### C. 性能估算

| 场景 | 配置 | 处理速度 |
|------|------|----------|
| CPU (large-v3) | M1 Mac | ~0.5x 实时 |
| CPU (base) | M1 Mac | ~5x 实时 |
| GPU (large-v3) | RTX 3080 | ~10x 实时 |

**21 本已匹配有声书预估处理时间:**
- 平均每本: 10 小时音频
- CPU (large-v3): ~21 * 10 * 2 = 420 小时
- CPU (base): ~21 * 10 / 5 = 42 小时
- GPU (large-v3): ~21 * 10 / 10 = 21 小时
