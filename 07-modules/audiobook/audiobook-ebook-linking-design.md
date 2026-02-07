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

#### L3: Fuzzy Matching

使用 Levenshtein distance 或 trigram 相似度：

### 2.3 Implementation: Matching Script

```
packages/database/scripts/match-audiobooks.ts
```

### 2.4 Database Changes

为提高匹配效率，添加 normalized 字段：

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

#### 3.4.3 SyncedReaderView

### 3.5 Backend: Timestamp Generation Pipeline

#### 3.5.1 New Endpoint

#### 3.5.2 Timestamp Generation Service

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

### 5.2 Get Chapter Timestamps

```
GET /api/audiobooks/:id/chapters/:chapterNumber/timestamps
```

Response:

### 5.3 Sync Position Conversion

```
POST /api/sync/convert/to-reading
```

Request:

Response:

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

**server.py** (`infrastructure/whisper/server.py`):

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

### 8.3 Text Alignment Algorithm

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

### 9.2 iOS Offline Download Flow

### 9.3 HighlightSyncManager Update

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
