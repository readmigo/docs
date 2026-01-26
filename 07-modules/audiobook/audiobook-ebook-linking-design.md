# Audiobook-eBook Linking & Highlight Sync Design

## 1. Background & Goals

### Current Status
| Metric | Count |
|--------|-------|
| Total Audiobooks | 119 |
| Total eBooks | 95 |
| Already Linked | 19 |
| **Need Linking** | **100** |

### Goals
1. **自动关联**：将有声书与对应的电子书进行匹配
2. **高亮同步**：在阅读电子书时，高亮显示当前音频播放的内容（Sentence Sync）

---

## 2. Part 1: Audiobook-eBook Matching

### 2.1 Current Matching Mechanism

现有导入脚本 `scripts/book-ingestion/sources/librivox.ts` 通过 LibriVox 的 `url_text_source` 字段提取 Gutenberg ID：

```typescript
// 示例 URL patterns:
// http://www.gutenberg.org/etext/1342 -> 1342
// https://www.gutenberg.org/ebooks/1342 -> 1342
```

**问题**：很多有声书没有 Gutenberg 链接，或者链接格式不标准。

### 2.2 Proposed Matching Strategy

采用 **多层匹配策略**，按优先级从高到低：

| 层级 | 策略 | 准确度 | 覆盖率 |
|------|------|--------|--------|
| L1 | Gutenberg ID 精确匹配 | 100% | ~20% |
| L2 | Title + Author 精确匹配 | 95% | ~40% |
| L3 | Title 模糊匹配 + Author 首字母 | 80% | ~30% |
| L4 | Title 关键词匹配 (人工审核) | 60% | ~10% |

#### L2: Title + Author Matching

```typescript
// 标准化函数
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')  // 移除冠词
    .replace(/[^\w\s]/g, '')          // 移除标点
    .replace(/\s+/g, ' ')             // 合并空格
    .trim();
}

function normalizeAuthor(author: string): string {
  return author
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .sort()  // 姓名顺序可能不同
    .join(' ');
}
```

#### L3: Fuzzy Matching

使用 Levenshtein distance 或 trigram 相似度：

```sql
-- PostgreSQL trigram similarity
SELECT b.id, b.title,
       similarity(b.title_normalized, 'pride and prejudice') as score
FROM books b
WHERE similarity(b.title_normalized, 'pride and prejudice') > 0.6
ORDER BY score DESC
LIMIT 5;
```

### 2.3 Implementation: Matching Script

```
packages/database/scripts/match-audiobooks.ts
```

```typescript
interface MatchResult {
  audiobookId: string;
  audiobookTitle: string;
  matchedBookId: string | null;
  matchedBookTitle: string | null;
  matchLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'NONE';
  confidence: number;
  needsReview: boolean;
}

async function matchAudiobooks(): Promise<MatchResult[]> {
  // 1. 获取所有未关联的有声书
  const unlinkedAudiobooks = await prisma.audiobook.findMany({
    where: { bookId: null }
  });

  const results: MatchResult[] = [];

  for (const audiobook of unlinkedAudiobooks) {
    // L1: Gutenberg ID
    let match = await matchByGutenbergId(audiobook);

    // L2: Exact Title + Author
    if (!match) {
      match = await matchByTitleAuthor(audiobook);
    }

    // L3: Fuzzy Title
    if (!match) {
      match = await matchByFuzzyTitle(audiobook);
    }

    results.push(match);
  }

  return results;
}
```

### 2.4 Database Changes

为提高匹配效率，添加 normalized 字段：

```prisma
model Book {
  // ... existing fields
  titleNormalized String? @map("title_normalized") @db.VarChar(500)
  authorNormalized String? @map("author_normalized") @db.VarChar(255)
}

model Audiobook {
  // ... existing fields
  titleNormalized String? @map("title_normalized") @db.VarChar(500)
  authorNormalized String? @map("author_normalized") @db.VarChar(255)
}
```

```sql
-- Add pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX books_title_trgm_idx ON books USING GIN (title_normalized gin_trgm_ops);
```

---

## 3. Part 2: Highlight Sync (Sentence-Level Synchronization)

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        iOS App                              │
├──────────────────────────┬──────────────────────────────────┤
│    AudioPlayer           │       ReaderView                 │
│                          │                                  │
│  ┌──────────────────┐    │    ┌──────────────────────────┐  │
│  │ Current Time: 45s│────┼───▶│ Highlighted Sentence     │  │
│  │ Chapter: 3       │    │    │ "It was the best of..."  │  │
│  └──────────────────┘    │    └──────────────────────────┘  │
│                          │                                  │
└──────────────────────────┴──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Sync Data Source                          │
├─────────────────────────────────────────────────────────────┤
│  AudiobookChapter.timestamps (JSON)                          │
│  [                                                           │
│    { time: 0,    charOffset: 0,    text: "It was the..." }, │
│    { time: 3.5,  charOffset: 45,   text: "best of times," },│
│    { time: 6.2,  charOffset: 75,   text: "it was the..." }, │
│    ...                                                       │
│  ]                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Timestamp Generation Strategy

#### Option A: AI-based Forced Alignment (Recommended)

使用 **Whisper** 或 **Gentle** 进行强制对齐：

```typescript
interface TimestampEntry {
  time: number;       // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  charOffset: number; // 在章节文本中的字符偏移
  charEnd: number;    // 结束字符偏移
  text: string;       // 句子/短语文本
  confidence: number; // 置信度 0-1
}
```

**Workflow**:
1. 下载音频章节 (MP3)
2. 获取电子书章节文本
3. 调用 Whisper API with word-level timestamps
4. 将 Whisper 输出与原文对齐
5. 存储到 `AudiobookChapter.timestamps`

#### Option B: Pre-computed from LibriVox

部分 LibriVox 项目提供 sync files：
- 检查 Internet Archive 是否有 `.sync` 或 `.json` 时间戳文件
- 解析并转换为我们的格式

### 3.3 Data Model: Timestamps JSON Schema

```typescript
// AudiobookChapter.timestamps 字段结构
interface ChapterTimestamps {
  version: 1;
  generatedAt: string;      // ISO date
  method: 'whisper' | 'gentle' | 'manual' | 'librivox';
  language: string;
  segments: TimestampSegment[];
}

interface TimestampSegment {
  id: number;
  startTime: number;        // seconds
  endTime: number;          // seconds
  text: string;             // The spoken text
  charStart: number;        // Character offset in chapter content
  charEnd: number;          // Character end offset
  confidence: number;       // 0-1
  words?: WordTimestamp[];  // Optional word-level detail
}

interface WordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
}
```

### 3.4 iOS Implementation

#### 3.4.1 New Files

```
ios/Readmigo/Features/Audiobook/HighlightSync/
├── HighlightSyncManager.swift    // 核心同步逻辑
├── SyncedReaderView.swift        // 带高亮的阅读器
└── Models/
    └── TimestampModels.swift     // 时间戳数据模型
```

#### 3.4.2 HighlightSyncManager

```swift
@MainActor
class HighlightSyncManager: ObservableObject {
    // Current highlight range in the text
    @Published var highlightRange: NSRange?
    @Published var currentSegment: TimestampSegment?

    private var timestamps: ChapterTimestamps?
    private var audioPlayer: AudiobookPlayer
    private var updateTimer: Timer?

    init(audioPlayer: AudiobookPlayer) {
        self.audioPlayer = audioPlayer
        setupPlaybackObserver()
    }

    func loadTimestamps(for chapter: AudiobookChapter) async {
        // Fetch timestamps from API or local cache
        guard let timestampData = chapter.timestamps else { return }
        self.timestamps = try? JSONDecoder().decode(
            ChapterTimestamps.self,
            from: timestampData
        )
    }

    private func setupPlaybackObserver() {
        // 每 100ms 更新一次高亮位置
        updateTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            self.updateHighlight()
        }
    }

    private func updateHighlight() {
        guard let timestamps = timestamps else { return }

        let currentTime = audioPlayer.currentTime

        // Binary search for current segment
        if let segment = findSegment(at: currentTime) {
            self.currentSegment = segment
            self.highlightRange = NSRange(
                location: segment.charStart,
                length: segment.charEnd - segment.charStart
            )
        }
    }

    private func findSegment(at time: Double) -> TimestampSegment? {
        // Binary search implementation
        timestamps?.segments.first { segment in
            time >= segment.startTime && time < segment.endTime
        }
    }

    // 点击文本跳转到对应音频位置
    func seekToText(at charOffset: Int) {
        guard let segment = timestamps?.segments.first(where: {
            charOffset >= $0.charStart && charOffset < $0.charEnd
        }) else { return }

        audioPlayer.seek(to: segment.startTime)
    }
}
```

#### 3.4.3 SyncedReaderView

```swift
struct SyncedReaderView: View {
    @ObservedObject var syncManager: HighlightSyncManager
    let chapterContent: String

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                HighlightedTextView(
                    text: chapterContent,
                    highlightRange: syncManager.highlightRange,
                    onTap: { charOffset in
                        syncManager.seekToText(at: charOffset)
                    }
                )
            }
            .onChange(of: syncManager.currentSegment?.id) { segmentId in
                // 自动滚动到当前高亮位置
                if let segmentId = segmentId {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        proxy.scrollTo(segmentId, anchor: .center)
                    }
                }
            }
        }
    }
}
```

### 3.5 Backend: Timestamp Generation Pipeline

#### 3.5.1 New Endpoint

```typescript
// apps/backend/src/modules/audiobooks/audiobooks.controller.ts

@Post(':id/generate-timestamps')
async generateTimestamps(
  @Param('id') audiobookId: string,
  @Query('chapterNumber') chapterNumber?: number
) {
  return this.timestampService.generateForAudiobook(audiobookId, chapterNumber);
}

@Get(':id/chapters/:chapterNumber/timestamps')
async getTimestamps(
  @Param('id') audiobookId: string,
  @Param('chapterNumber') chapterNumber: number
) {
  return this.audiobooksService.getChapterTimestamps(audiobookId, chapterNumber);
}
```

#### 3.5.2 Timestamp Generation Service

```typescript
// apps/backend/src/modules/audiobooks/timestamp.service.ts

@Injectable()
export class TimestampService {
  async generateForChapter(
    audiobook: Audiobook,
    chapter: AudiobookChapter,
    bookChapter: Chapter
  ): Promise<ChapterTimestamps> {

    // 1. Download audio file
    const audioBuffer = await this.downloadAudio(chapter.audioUrl);

    // 2. Get chapter text
    const chapterText = bookChapter.content;

    // 3. Call Whisper API with word timestamps
    const whisperResult = await this.whisperService.transcribe(audioBuffer, {
      language: audiobook.language,
      word_timestamps: true,
      response_format: 'verbose_json'
    });

    // 4. Align whisper output with original text
    const alignedSegments = await this.alignWithText(
      whisperResult.segments,
      chapterText
    );

    // 5. Build timestamps object
    const timestamps: ChapterTimestamps = {
      version: 1,
      generatedAt: new Date().toISOString(),
      method: 'whisper',
      language: audiobook.language,
      segments: alignedSegments
    };

    // 6. Save to database
    await this.prisma.audiobookChapter.update({
      where: { id: chapter.id },
      data: { timestamps }
    });

    return timestamps;
  }

  private async alignWithText(
    whisperSegments: WhisperSegment[],
    originalText: string
  ): Promise<TimestampSegment[]> {
    // 使用 diff 算法将 Whisper 输出与原文对齐
    // 处理 Whisper 可能的转录差异
    // ...
  }
}
```

---

## 4. Implementation Phases

### Phase 1: Audiobook Matching (Week 1)

| Task | Priority | Effort |
|------|----------|--------|
| Add normalized fields migration | P0 | 2h |
| Implement matching script | P0 | 4h |
| Run matching & manual review | P0 | 2h |
| Update librivox.ts to use new matching | P1 | 2h |

**Deliverable**: 100 个未关联有声书完成匹配

### Phase 2: Timestamp Infrastructure (Week 2)

| Task | Priority | Effort |
|------|----------|--------|
| Create TimestampService | P0 | 4h |
| Integrate Whisper API | P0 | 4h |
| Text alignment algorithm | P0 | 6h |
| API endpoints | P1 | 2h |

**Deliverable**: 可为任意章节生成时间戳

### Phase 3: iOS Highlight Sync (Week 3)

| Task | Priority | Effort |
|------|----------|--------|
| HighlightSyncManager | P0 | 4h |
| SyncedReaderView | P0 | 6h |
| Player integration | P0 | 4h |
| UI polish & testing | P1 | 4h |

**Deliverable**: 完整的听读同步体验

---

## 5. API Design

### 5.1 Get Audiobook with Timestamps

```
GET /api/audiobooks/:id
```

Response:
```json
{
  "id": "abc123",
  "title": "Pride and Prejudice",
  "bookId": "def456",
  "chapters": [
    {
      "id": "ch1",
      "chapterNumber": 1,
      "title": "Chapter 1",
      "duration": 1234,
      "audioUrl": "https://...",
      "hasTimestamps": true,
      "bookChapterId": "bc1"
    }
  ]
}
```

### 5.2 Get Chapter Timestamps

```
GET /api/audiobooks/:id/chapters/:chapterNumber/timestamps
```

Response:
```json
{
  "version": 1,
  "generatedAt": "2024-01-15T10:00:00Z",
  "method": "whisper",
  "segments": [
    {
      "id": 0,
      "startTime": 0.0,
      "endTime": 3.5,
      "text": "It is a truth universally acknowledged,",
      "charStart": 0,
      "charEnd": 39,
      "confidence": 0.95
    }
  ]
}
```

### 5.3 Sync Position Conversion

```
POST /api/sync/convert/to-reading
```

Request:
```json
{
  "audiobookId": "abc123",
  "chapterIndex": 2,
  "positionSeconds": 145
}
```

Response:
```json
{
  "bookId": "def456",
  "chapterIndex": 2,
  "charOffset": 2340,
  "chapterProgress": 0.35
}
```

---

## 6. Technical Decisions

| Question | Decision |
|----------|----------|
| Whisper API | **自建 Whisper 服务** |
| 生成时机 | **批量预生成** |
| 离线支持 | **需要** |

---

## 7. Self-hosted Whisper Service

### 7.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Whisper Service (Docker)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ FastAPI      │───▶│ Whisper      │───▶│ Output           │   │
│  │ Server       │    │ large-v3     │    │ JSON + Alignment │   │
│  └──────────────┘    └──────────────┘    └──────────────────┘   │
│         ▲                                                        │
│         │ HTTP                                                   │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────┴───────────────────────────────────────────────────────┐
│                    Backend (NestJS)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TimestampGenerationJob (Bull Queue)                       │   │
│  │ - Download audio from R2                                  │   │
│  │ - Call Whisper service                                    │   │
│  │ - Align with original text                                │   │
│  │ - Save to DB + Upload to R2                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Whisper Service Implementation

**Dockerfile** (`infrastructure/whisper/Dockerfile`):
```dockerfile
FROM nvidia/cuda:12.1-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

RUN pip3 install faster-whisper uvicorn fastapi python-multipart

WORKDIR /app
COPY server.py .

# Download model on build
RUN python3 -c "from faster_whisper import WhisperModel; WhisperModel('large-v3')"

EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**server.py** (`infrastructure/whisper/server.py`):
```python
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import json

app = FastAPI()
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = "en",
    word_timestamps: bool = True
):
    # Save uploaded file
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Transcribe with word-level timestamps
    segments, info = model.transcribe(
        tmp_path,
        language=language,
        word_timestamps=word_timestamps,
        vad_filter=True
    )

    result = {
        "language": info.language,
        "duration": info.duration,
        "segments": []
    }

    for segment in segments:
        seg_data = {
            "id": segment.id,
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip(),
            "words": []
        }
        if word_timestamps and segment.words:
            seg_data["words"] = [
                {"word": w.word, "start": w.start, "end": w.end, "probability": w.probability}
                for w in segment.words
            ]
        result["segments"].append(seg_data)

    return result
```

### 7.3 Deployment

**Option A: Cloud GPU (Recommended for batch processing)**
- RunPod / Vast.ai: ~$0.20/hour for RTX 4090
- Process all 119 audiobooks in batch, then shut down

**Option B: Mac Mini M4 (Long-term)**
- Use `mlx-whisper` for Apple Silicon
- Slower but zero ongoing cost

### 7.4 Processing Time Estimate

| Model | Device | Real-time Factor | 1 hour audio |
|-------|--------|------------------|--------------|
| large-v3 | RTX 4090 | 0.05x | ~3 min |
| large-v3 | RTX 3080 | 0.1x | ~6 min |
| large-v3 | M2 Ultra | 0.15x | ~9 min |
| large-v3 | M4 Pro | 0.25x | ~15 min |

**Total for 119 audiobooks** (avg 5 hours each):
- RTX 4090: ~30 hours → ~$6 cloud cost
- M4 Pro: ~150 hours (run overnight for a week)

---

## 8. Batch Pre-generation Pipeline

### 8.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 Timestamp Generation Pipeline                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Queue All Chapters                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SELECT ac.* FROM audiobook_chapters ac                    │   │
│  │ JOIN audiobooks a ON ac.audiobook_id = a.id               │   │
│  │ WHERE a.book_id IS NOT NULL                               │   │
│  │   AND ac.timestamps IS NULL                               │   │
│  │   AND ac.book_chapter_id IS NOT NULL                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Step 2: Process Each Chapter                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ For each chapter:                                         │   │
│  │   1. Download audio from R2/LibriVox                      │   │
│  │   2. Get book chapter text from DB                        │   │
│  │   3. Call Whisper service                                 │   │
│  │   4. Align Whisper output with original text              │   │
│  │   5. Save timestamps to DB                                │   │
│  │   6. Upload timestamps JSON to R2 (for offline)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Step 3: Generate Offline Package                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ For each audiobook:                                       │   │
│  │   - Bundle all chapter timestamps into single JSON        │   │
│  │   - Upload to R2: /audiobooks/{id}/timestamps.json        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Implementation: Batch Script

```
scripts/timestamp-generation/generate-all.ts
```

```typescript
import { PrismaClient } from '@prisma/client';
import { WhisperClient } from './whisper-client';
import { TextAligner } from './text-aligner';
import { R2Client } from './r2-client';

const prisma = new PrismaClient();
const whisper = new WhisperClient(process.env.WHISPER_SERVICE_URL);
const aligner = new TextAligner();
const r2 = new R2Client();

interface GenerationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

async function generateTimestampsForAll(): Promise<GenerationStats> {
  const stats: GenerationStats = { total: 0, success: 0, failed: 0, skipped: 0 };

  // Get all linked audiobooks with chapters
  const audiobooks = await prisma.audiobook.findMany({
    where: {
      bookId: { not: null },
      status: 'ACTIVE'
    },
    include: {
      chapters: {
        orderBy: { chapterNumber: 'asc' }
      },
      book: {
        include: {
          chapters: true
        }
      }
    }
  });

  console.log(`Found ${audiobooks.length} linked audiobooks to process`);

  for (const audiobook of audiobooks) {
    console.log(`\n📚 Processing: ${audiobook.title}`);

    const allTimestamps: Record<number, ChapterTimestamps> = {};

    for (const chapter of audiobook.chapters) {
      stats.total++;

      // Skip if already has timestamps
      if (chapter.timestamps) {
        console.log(`  ⏭️  Chapter ${chapter.chapterNumber}: Already has timestamps`);
        stats.skipped++;
        allTimestamps[chapter.chapterNumber] = chapter.timestamps as ChapterTimestamps;
        continue;
      }

      // Find matching book chapter
      const bookChapter = audiobook.book?.chapters.find(
        bc => bc.id === chapter.bookChapterId
      );

      if (!bookChapter?.content) {
        console.log(`  ⚠️  Chapter ${chapter.chapterNumber}: No book chapter content`);
        stats.failed++;
        continue;
      }

      try {
        // Download audio
        console.log(`  ⬇️  Chapter ${chapter.chapterNumber}: Downloading audio...`);
        const audioBuffer = await downloadAudio(chapter.audioUrl);

        // Transcribe with Whisper
        console.log(`  🎤 Chapter ${chapter.chapterNumber}: Transcribing...`);
        const whisperResult = await whisper.transcribe(audioBuffer, {
          language: audiobook.language,
          wordTimestamps: true
        });

        // Align with original text
        console.log(`  🔗 Chapter ${chapter.chapterNumber}: Aligning...`);
        const segments = await aligner.align(
          whisperResult.segments,
          bookChapter.content
        );

        const timestamps: ChapterTimestamps = {
          version: 1,
          generatedAt: new Date().toISOString(),
          method: 'whisper',
          language: audiobook.language,
          segments
        };

        // Save to database
        await prisma.audiobookChapter.update({
          where: { id: chapter.id },
          data: { timestamps }
        });

        allTimestamps[chapter.chapterNumber] = timestamps;
        stats.success++;
        console.log(`  ✅ Chapter ${chapter.chapterNumber}: Done (${segments.length} segments)`);

      } catch (error) {
        console.error(`  ❌ Chapter ${chapter.chapterNumber}: Failed - ${error.message}`);
        stats.failed++;
      }
    }

    // Upload bundled timestamps for offline support
    if (Object.keys(allTimestamps).length > 0) {
      const bundlePath = `audiobooks/${audiobook.id}/timestamps.json`;
      await r2.upload(bundlePath, JSON.stringify(allTimestamps));
      console.log(`  📦 Uploaded offline bundle: ${bundlePath}`);
    }
  }

  return stats;
}

// Run
generateTimestampsForAll()
  .then(stats => {
    console.log('\n=== Generation Complete ===');
    console.log(`Total chapters: ${stats.total}`);
    console.log(`Success: ${stats.success}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped: ${stats.skipped}`);
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 8.3 Text Alignment Algorithm

```typescript
// scripts/timestamp-generation/text-aligner.ts

import { diffWords } from 'diff';

interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words: WhisperWord[];
}

export class TextAligner {
  /**
   * Align Whisper transcription with original book text
   * Returns segments with character offsets into original text
   */
  async align(
    whisperSegments: WhisperSegment[],
    originalText: string
  ): Promise<TimestampSegment[]> {
    const result: TimestampSegment[] = [];

    // Normalize original text
    const normalizedOriginal = this.normalizeForMatching(originalText);

    let searchStart = 0;

    for (const segment of whisperSegments) {
      const normalizedTranscript = this.normalizeForMatching(segment.text);

      // Find best match position in original text
      const matchResult = this.findBestMatch(
        normalizedOriginal,
        normalizedTranscript,
        searchStart
      );

      if (matchResult) {
        // Map back to original text positions
        const charStart = this.mapToOriginalPosition(
          originalText,
          normalizedOriginal,
          matchResult.start
        );
        const charEnd = this.mapToOriginalPosition(
          originalText,
          normalizedOriginal,
          matchResult.end
        );

        result.push({
          id: segment.id,
          startTime: segment.start,
          endTime: segment.end,
          text: originalText.substring(charStart, charEnd),
          charStart,
          charEnd,
          confidence: matchResult.confidence,
          words: this.alignWords(segment.words, originalText, charStart, charEnd)
        });

        searchStart = matchResult.end;
      }
    }

    return result;
  }

  private normalizeForMatching(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findBestMatch(
    haystack: string,
    needle: string,
    startFrom: number
  ): { start: number; end: number; confidence: number } | null {
    // Simple substring search with fuzzy fallback
    const searchArea = haystack.substring(startFrom);
    const index = searchArea.indexOf(needle);

    if (index !== -1) {
      return {
        start: startFrom + index,
        end: startFrom + index + needle.length,
        confidence: 1.0
      };
    }

    // Fuzzy match using sliding window
    const windowSize = needle.length;
    let bestMatch = { start: 0, end: 0, confidence: 0 };

    for (let i = 0; i < Math.min(searchArea.length - windowSize, 500); i++) {
      const window = searchArea.substring(i, i + windowSize);
      const similarity = this.calculateSimilarity(window, needle);

      if (similarity > bestMatch.confidence && similarity > 0.7) {
        bestMatch = {
          start: startFrom + i,
          end: startFrom + i + windowSize,
          confidence: similarity
        };
      }
    }

    return bestMatch.confidence > 0 ? bestMatch : null;
  }

  private calculateSimilarity(a: string, b: string): number {
    const changes = diffWords(a, b);
    const totalLength = Math.max(a.length, b.length);
    let matchedLength = 0;

    for (const change of changes) {
      if (!change.added && !change.removed) {
        matchedLength += change.value.length;
      }
    }

    return matchedLength / totalLength;
  }

  // ... additional helper methods
}
```

---

## 9. Offline Support

### 9.1 Data Structure on R2

```
audiobooks/
├── {audiobook-id}/
│   ├── cover.jpg
│   ├── timestamps.json          # All chapters bundled
│   └── audio/
│       ├── 001.mp3
│       ├── 002.mp3
│       └── ...
```

**timestamps.json** format:
```json
{
  "audiobookId": "abc123",
  "bookId": "def456",
  "generatedAt": "2024-01-15T10:00:00Z",
  "chapters": {
    "1": {
      "version": 1,
      "method": "whisper",
      "segments": [...]
    },
    "2": {
      "version": 1,
      "method": "whisper",
      "segments": [...]
    }
  }
}
```

### 9.2 iOS Offline Download Flow

```swift
// ios/Readmigo/Core/Services/OfflineManager.swift

extension OfflineManager {

    /// Download audiobook for offline use (including timestamps)
    func downloadAudiobook(_ audiobook: Audiobook) async throws {
        let audiobookDir = getAudiobookDirectory(audiobook.id)

        // 1. Download timestamps bundle
        let timestampsUrl = "\(R2_PUBLIC_URL)/audiobooks/\(audiobook.id)/timestamps.json"
        let timestampsData = try await downloadFile(from: timestampsUrl)
        try timestampsData.write(to: audiobookDir.appendingPathComponent("timestamps.json"))

        // 2. Download audio files
        for chapter in audiobook.chapters {
            let audioData = try await downloadFile(from: chapter.audioUrl)
            let fileName = String(format: "%03d.mp3", chapter.chapterNumber)
            try audioData.write(to: audiobookDir.appendingPathComponent(fileName))

            // Update progress
            await MainActor.run {
                downloadProgress = Double(chapter.chapterNumber) / Double(audiobook.chapters.count)
            }
        }

        // 3. Mark as downloaded
        await markAsDownloaded(audiobook.id)
    }

    /// Load timestamps from offline storage
    func loadOfflineTimestamps(for audiobookId: String) -> AudiobookTimestamps? {
        let path = getAudiobookDirectory(audiobookId)
            .appendingPathComponent("timestamps.json")

        guard let data = try? Data(contentsOf: path) else { return nil }
        return try? JSONDecoder().decode(AudiobookTimestamps.self, from: data)
    }
}
```

### 9.3 HighlightSyncManager Update

```swift
// Update to support offline timestamps

@MainActor
class HighlightSyncManager: ObservableObject {

    func loadTimestamps(for chapter: AudiobookChapter, audiobookId: String) async {
        // Try offline first
        if let offlineTimestamps = OfflineManager.shared.loadOfflineTimestamps(for: audiobookId),
           let chapterTimestamps = offlineTimestamps.chapters[chapter.chapterNumber] {
            self.timestamps = chapterTimestamps
            return
        }

        // Fall back to API
        do {
            let response: ChapterTimestamps = try await apiClient.request(
                endpoint: "/audiobooks/\(audiobookId)/chapters/\(chapter.chapterNumber)/timestamps"
            )
            self.timestamps = response
        } catch {
            print("[HighlightSync] Failed to load timestamps: \(error)")
        }
    }
}
```

---

## 10. Open Questions (Remaining)

1. **章节匹配**：有声书章节与电子书章节可能不完全对应，如何处理？
   - 有些有声书会合并多个短章节
   - 有些会拆分长章节

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Audiobook-eBook 匹配率 | > 80% |
| 时间戳生成成功率 | > 95% |
| 高亮同步延迟 | < 200ms |
| 用户满意度 (NPS) | > 8 |
