# AI 交互数据缓存策略设计文档

## 1. 目标

- **成本优化**: 减少重复 AI 调用，降低 API 费用
- **响应速度**: 缓存命中时毫秒级响应，提升用户体验
- **用户体验**: 即使数据来自缓存，UI 仍展示「生成中」动效，保持交互一致性

---

## 2. AI 交互场景盘点

### 2.1 核心场景 (ai.service.ts)

| 场景 | 端点 | 输入 | 缓存状态 | 命中率预估 |
|-----|-----|-----|---------|----------|
| **词义解释** | `POST /ai/explain` | word + sentence + englishLevel | ✅ 已缓存 (调整至90d) | 中 (30-40%) |
| **句子简化** | `POST /ai/simplify` | sentence + englishLevel | ✅ 已缓存 (调整至90d) | 中 (25-35%) |
| **段落翻译** | `POST /ai/translate` | paragraph + targetLanguage | ✅ 已缓存 (调整至90d) | 低-中 (20-30%) |
| **内容问答** | `POST /ai/qa` | question + context | ❌ 不缓存 | - (开放式问题) |

### 2.2 扩展场景 (ai-extended.service.ts)

#### 书籍分析模块

| 场景 | 缓存状态 | 推荐 TTL | 可跨用户 | 优先级 |
|-----|---------|---------|---------|--------|
| **书籍摘要** | ✅ 已缓存 (调整至180d) | 180d | ✅ | - |
| **作者信息** | ✅ 已缓存 (调整至365d) | 365d | ✅ | - |
| **相似书籍推荐** | ❌ 待实现 | 90d | ✅ | P1 |
| **难度分析** | ❌ 待实现 | 180d | ✅ | P2 |
| **阅读指南** | ❌ 待实现 | 90d | ✅ | P1 |
| **主题分析** | ❌ 待实现 | 180d | ✅ | P2 |

#### 阅读辅助模块

| 场景 | 缓存状态 | 推荐 TTL | 可跨用户 | 优先级 |
|-----|---------|---------|---------|--------|
| **章节摘要** | ❌ 待实现 | 180d | ✅ | P0 |
| **角色分析** | ❌ 待实现 | 180d | ✅ | P1 |
| **情节分析** | ❌ 待实现 | 180d | ✅ | P2 |
| **语法解释** | ❌ 待实现 | 90d | ✅ | P1 |
| **文化背景** | ❌ 待实现 | 90d | ✅ | P2 |
| **写作风格** | ❌ 待实现 | 365d | ✅ | P3 |
| **理解力检查** | ❌ 待实现 | 90d | ⚠️ 需考虑 | P2 |

#### 词汇模块

| 场景 | 缓存状态 | 推荐 TTL | 可跨用户 | 优先级 |
|-----|---------|---------|---------|--------|
| **词汇上下文** | ✅ 已缓存 (调整至90d) | 90d | ✅ | - |
| **词汇关联** | ✅ 已缓存 (调整至90d) | 90d | ✅ | - |
| **词族分析** | ✅ 已缓存 (调整至365d) | 365d | ✅ | - |
| **记忆技巧** | ❌ 待实现 | 90d | ⚠️ 按语言 | P2 |

#### 个性化模块 (不推荐缓存)

| 场景 | 原因 |
|-----|-----|
| 学习报告 | 依赖用户实时数据 |
| 学习计划 | 高度个性化 |
| 薄弱点分析 | 用户进度差异大 |
| 每日推荐 | 需实时个性化 |
| 心情推荐 | 非常个性化 |
| 书评生成 | 用户观点不同 |

---

## 3. 缓存架构设计

### 3.1 缓存层级

```
┌─────────────────────────────────────────────────────────────┐
│                        iOS Client                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Local Cache (UserDefaults/DB)            │  │
│  │   - 用户私有数据 (解释过的单词、翻译的段落)              │  │
│  │   - TTL: 7-30 天                                       │  │
│  │   - 容量限制: 50MB                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Redis Cache                         │  │
│  │   - 全局共享数据 (书籍摘要、作者信息、章节摘要)          │  │
│  │   - TTL: 1-90 天 (按场景)                              │  │
│  │   - 跨用户复用                                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI Providers                            │
│         DeepSeek / OpenAI / Anthropic                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 缓存键设计规范

```
ai:<version>:<category>:<sub-category>:<params>

示例:
ai:v1:word:explain:{word}:{sentenceHash}:{level}
ai:v1:book:summary:{bookId}:{length}
ai:v1:chapter:summary:{bookId}:{chapterId}
ai:v1:vocab:family:{word}
```

**设计原则**:
- `version`: 当 prompt 更新时递增版本号，自动失效旧缓存
- `category`: 功能分类 (word/book/chapter/vocab 等)
- `sentenceHash`: 长文本使用 SHA256 前16位，避免 key 过长
- 所有参数 lowercase 化，确保一致性

### 3.3 缓存 TTL 策略

> **设计原则**: 本项目处理的是公版书，书籍内容在数年内不会变化，因此可以使用较长的 TTL 以最大化缓存收益。

| 内容类型 | TTL | 示例 |
|---------|-----|-----|
| **永久级** | 365 天 | 作者信息、词族、写作风格 |
| **书籍级** | 180 天 | 书籍摘要、章节摘要、主题分析、角色分析、情节分析 |
| **内容级** | 90 天 | 词义解释、语法解释、文化背景、阅读指南、相似推荐 |
| **翻译级** | 90 天 | 段落翻译、句子简化 |
| **不缓存** | - | 开放式问答、个性化推荐、学习报告 |

**TTL 延长的理由**:
- 公版书内容固定，不存在版本更新问题
- 同一单词在同一句子中的解释不会随时间变化
- 书籍的主题、角色、情节分析是确定性的
- 只有 prompt 升级时才需要刷新缓存 (通过版本号控制)

---

## 4. iOS 端缓存实现

### 4.1 本地缓存管理器

```swift
// AICacheManager.swift

final class AICacheManager {
    static let shared = AICacheManager()

    private let db: any Database  // SQLite via GRDB
    private let maxCacheSize: Int = 50 * 1024 * 1024  // 50MB

    struct CacheEntry: Codable {
        let key: String
        let content: String
        let createdAt: Date
        let expiresAt: Date
        let sizeBytes: Int
    }

    /// 查询缓存
    func get(key: String) async -> String? {
        guard let entry = try? await db.read({ db in
            try CacheEntry.fetchOne(db, key: key)
        }) else { return nil }

        if entry.expiresAt < Date() {
            Task { await delete(key: key) }
            return nil
        }
        return entry.content
    }

    /// 写入缓存
    func set(key: String, content: String, ttl: TimeInterval) async {
        let entry = CacheEntry(
            key: key,
            content: content,
            createdAt: Date(),
            expiresAt: Date().addingTimeInterval(ttl),
            sizeBytes: content.utf8.count
        )
        try? await db.write { db in
            try entry.save(db)
        }
        await enforceMaxSize()
    }

    /// LRU 淘汰
    private func enforceMaxSize() async {
        // 按 createdAt 升序删除，直到低于容量限制
    }
}
```

### 4.2 缓存键生成

```swift
// AICacheKeys.swift

enum AICacheKeys {
    private static let version = "v1"

    static func wordExplain(word: String, sentence: String, level: String) -> String {
        let sentenceHash = sentence.sha256().prefix(16)
        return "ai:\(version):word:explain:\(word.lowercased()):\(sentenceHash):\(level)"
    }

    static func simplify(sentence: String, level: String) -> String {
        let hash = sentence.sha256().prefix(16)
        return "ai:\(version):sentence:simplify:\(hash):\(level)"
    }

    static func translate(paragraph: String, language: String) -> String {
        let hash = paragraph.sha256().prefix(16)
        return "ai:\(version):paragraph:translate:\(hash):\(language)"
    }

    static func chapterSummary(bookId: String, chapterId: String) -> String {
        return "ai:\(version):chapter:summary:\(bookId):\(chapterId)"
    }
}
```

### 4.3 带缓存的 AI 服务

```swift
// AIService+Cache.swift

extension AIService {

    /// 带缓存的词义解释
    func explainWordWithCache(
        word: String,
        sentence: String,
        level: String
    ) async throws -> (content: String, fromCache: Bool) {
        let cacheKey = AICacheKeys.wordExplain(word: word, sentence: sentence, level: level)

        // 1. 检查本地缓存
        if let cached = await AICacheManager.shared.get(key: cacheKey) {
            return (cached, true)
        }

        // 2. 调用 API (后端会检查 Redis 缓存)
        let response = try await explainWord(word: word, sentence: sentence)

        // 3. 写入本地缓存
        await AICacheManager.shared.set(
            key: cacheKey,
            content: response.content,
            ttl: 90 * 24 * 3600  // 90 天 (公版书内容固定)
        )

        return (response.content, false)
    }
}
```

---

## 5. 打字机动效设计

### 5.1 设计目标

无论数据来自缓存还是实时生成，用户看到的交互体验应该一致：
- 显示「生成中」状态
- 文字逐字符/逐词显示
- 自然的延迟感

### 5.2 实现方案

```swift
// TypewriterTextView.swift

struct TypewriterTextView: View {
    let fullText: String
    let fromCache: Bool

    @State private var displayedText = ""
    @State private var isComplete = false

    // 缓存数据使用更快的速度，但仍有打字效果
    private var charDelay: TimeInterval {
        fromCache ? 0.008 : 0.015  // 缓存: 8ms/字符, 实时: 15ms/字符
    }

    var body: some View {
        VStack(alignment: .leading) {
            Text(displayedText)
                .font(.body)

            if !isComplete {
                TypingIndicator()
                    .transition(.opacity)
            }
        }
        .task {
            await animateText()
        }
    }

    private func animateText() async {
        // 缓存数据延迟 200-400ms 再开始，模拟"处理中"
        if fromCache {
            try? await Task.sleep(nanoseconds: UInt64.random(in: 200_000_000...400_000_000))
        }

        for char in fullText {
            displayedText.append(char)
            try? await Task.sleep(nanoseconds: UInt64(charDelay * 1_000_000_000))
        }

        withAnimation {
            isComplete = true
        }
    }
}

// 打字指示器 (三个跳动的点)
struct TypingIndicator: View {
    @State private var animating = false

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3) { i in
                Circle()
                    .fill(Color.secondary)
                    .frame(width: 6, height: 6)
                    .offset(y: animating ? -4 : 0)
                    .animation(
                        .easeInOut(duration: 0.4)
                        .repeatForever()
                        .delay(Double(i) * 0.15),
                        value: animating
                    )
            }
        }
        .onAppear { animating = true }
    }
}
```

### 5.3 集成到 AIInteractionPanel

```swift
// AIInteractionPanel.swift (修改)

struct AIInteractionPanel: View {
    @State private var responseText = ""
    @State private var isLoading = false
    @State private var fromCache = false

    var body: some View {
        VStack {
            if isLoading {
                LoadingView()
            } else if !responseText.isEmpty {
                TypewriterTextView(
                    fullText: responseText,
                    fromCache: fromCache
                )
            }
        }
    }

    private func explain(word: String, sentence: String) async {
        isLoading = true

        do {
            let (content, cached) = try await AIService.shared.explainWordWithCache(
                word: word,
                sentence: sentence,
                level: userLevel
            )

            isLoading = false
            fromCache = cached
            responseText = content

        } catch {
            isLoading = false
            // handle error
        }
    }
}
```

### 5.4 动效参数调优

| 数据来源 | 初始延迟 | 字符间隔 | 预计 100 字耗时 |
|---------|---------|---------|---------------|
| 缓存 | 200-400ms | 8ms | ~1s |
| 实时 API | 0 | 15ms (+ 网络延迟) | ~1.5s + 网络 |

**用户感知**: 缓存数据约 1 秒完成，实时数据约 2-3 秒完成，差异自然且不影响体验。

---

## 6. 后端缓存增强

### 6.1 新增缓存的场景

在 `ai-extended.service.ts` 中为以下场景添加缓存:

```typescript
// 章节摘要 - P0 优先级
async getChapterSummary(dto: ChapterSummaryDto): Promise<AIExtendedResponse> {
  const cacheKey = `ai:v1:chapter:summary:${dto.bookId}:${dto.chapterId}`;

  const cached = await this.cacheManager.get<string>(cacheKey);
  if (cached) {
    return { content: cached, fromCache: true };
  }

  const result = await this.generateChapterSummary(dto);
  await this.cacheManager.set(cacheKey, result.content, 180 * 24 * 3600); // 180 天 (公版书内容固定)

  return { ...result, fromCache: false };
}
```

### 6.2 缓存响应标记

API 响应中增加 `fromCache` 字段，供客户端调整动效:

```typescript
interface AIResponse {
  content: string;
  model?: string;
  usage?: TokenUsage;
  fromCache?: boolean;  // 新增
}
```

### 6.3 缓存失效策略

```typescript
// 书籍内容更新时清除相关缓存
async onBookContentUpdated(bookId: string) {
  const pattern = `ai:*:*:${bookId}:*`;
  await this.cacheManager.deleteByPattern(pattern);
}

// Prompt 版本更新时，新版本号自动生效，旧版本自然过期
const CACHE_VERSION = 'v1';  // 升级时改为 v2
```

---

## 7. 监控与指标

### 7.1 关键指标

| 指标 | 描述 | 告警阈值 |
|-----|-----|---------|
| `ai_cache_hit_rate` | 缓存命中率 | < 20% (需排查) |
| `ai_cache_size_bytes` | 缓存占用空间 | > 80% 容量 |
| `ai_api_latency_p99` | API 响应延迟 | > 5s |
| `ai_api_error_rate` | API 错误率 | > 5% |

### 7.2 日志记录

```typescript
this.logger.log({
  event: 'ai_request',
  type: 'word_explain',
  cacheHit: true,
  latencyMs: 2,
  userId: 'xxx',
  word: 'serendipity',
});
```

---

## 8. 实施计划

### Phase 1: 基础设施 (1周)

- [ ] iOS 端 `AICacheManager` 实现 (SQLite 存储)
- [ ] 缓存键生成工具 `AICacheKeys`
- [ ] 后端响应增加 `fromCache` 字段

### Phase 2: 核心场景 (1周)

- [ ] 词义解释、句子简化、段落翻译 - 客户端缓存
- [ ] 章节摘要 - 后端缓存 (P0)
- [ ] 打字机动效组件 `TypewriterTextView`

### Phase 3: 扩展场景 (1周)

- [ ] 相似书籍、阅读指南 - 后端缓存 (P1)
- [ ] 语法解释、角色分析 - 后端缓存 (P1)
- [ ] 记忆技巧 - 按语言缓存 (P2)

### Phase 4: 监控优化 (持续)

- [ ] 缓存命中率监控
- [ ] 容量告警
- [ ] TTL 参数调优

---

## 9. 成本收益分析

### 假设条件
- MAU: 10,000
- AI 调用/用户/月: 30 次
- 平均成本/调用: ¥0.05

### 预期收益

| 项目 | 当前 | 优化后 |
|-----|-----|-------|
| 总 AI 调用/月 | 300,000 | 180,000 |
| 缓存命中率 | ~20% | ~40% |
| API 成本/月 | ¥15,000 | ¥9,000 |
| **节省** | - | **¥6,000/月** |

### 用户体验提升
- 缓存命中响应: 100-300ms (vs 当前 1-3s)
- 打字机动效使体验一致，用户无感知差异

---

## 10. 待讨论问题

1. **本地缓存容量**: 50MB 是否合适? 是否需要用户可配置?

2. **打字机速度**: 缓存数据 8ms/字符 vs 实时 15ms/字符，是否自然?

3. **缓存版本管理**: Prompt 更新频率如何? 是否需要后台强制刷新机制?

4. **个性化场景**: 学习报告等是否需要短期缓存 (如 1 小时)?

5. **离线支持**: 是否考虑完全离线时使用本地缓存?

---

## 附录: 缓存场景完整列表

| 场景 | 缓存层 | TTL | 优先级 | 状态 |
|-----|-------|-----|--------|-----|
| 词义解释 | 客户端 + Redis | 90d | - | ✅ 已有 (需调整TTL) |
| 句子简化 | 客户端 + Redis | 90d | - | ✅ 已有 (需调整TTL) |
| 段落翻译 | 客户端 + Redis | 90d | - | ✅ 已有 (需调整TTL) |
| 内容问答 | 不缓存 | - | - | - |
| 书籍摘要 | Redis | 180d | - | ✅ 已有 (需调整TTL) |
| 作者信息 | Redis | 365d | - | ✅ 已有 (需调整TTL) |
| 章节摘要 | Redis | 180d | P0 | ⏳ 待实现 |
| 相似书籍 | Redis | 90d | P1 | ⏳ 待实现 |
| 阅读指南 | Redis | 90d | P1 | ⏳ 待实现 |
| 角色分析 | Redis | 180d | P1 | ⏳ 待实现 |
| 语法解释 | Redis | 90d | P1 | ⏳ 待实现 |
| 难度分析 | Redis | 180d | P2 | ⏳ 待实现 |
| 主题分析 | Redis | 180d | P2 | ⏳ 待实现 |
| 文化背景 | Redis | 90d | P2 | ⏳ 待实现 |
| 理解检查 | Redis | 90d | P2 | ⏳ 待实现 |
| 记忆技巧 | Redis | 90d | P2 | ⏳ 待实现 |
| 情节分析 | Redis | 180d | P2 | ⏳ 待实现 |
| 写作风格 | Redis | 365d | P3 | ⏳ 待实现 |
| 词汇上下文 | Redis | 90d | - | ✅ 已有 (需调整TTL) |
| 词汇关联 | Redis | 90d | - | ✅ 已有 (需调整TTL) |
| 词族分析 | Redis | 365d | - | ✅ 已有 (需调整TTL) |
