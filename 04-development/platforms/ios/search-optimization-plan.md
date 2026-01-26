# 搜索功能优化实施文档

> 创建日期: 2025-12-24
> 当前状态: ✅ 100% 完成
> 最后更新: 2025-12-24

## ✅ 已完成 (2025-12-24)

### P0 完成项目
- ✅ 创建 SearchModule (后端统一搜索API)
- ✅ 搜索历史 UI (已存在于 DiscoverView)
- ✅ 添加统一搜索模型和 API 客户端 (iOS)
- ✅ 分类搜索结果展示 (作者/书籍/名言)
- ✅ 热门搜索功能

### P1 完成项目
- ✅ 自动补全建议 UI (SearchSuggestionsView)
- ✅ 300ms debounce 防抖
- ✅ 建议图标颜色区分 (作者紫色/书籍蓝色/热门橙色)
- ✅ 新增本地化字符串 (search.loadingSuggestions等)

### P2 完成项目
- ✅ 数据库 schema 增加拼音字段 (nameZhPinyin, titlePinyin)
- ✅ 数据库迁移脚本 (20251224_add_pinyin_search_fields)
- ✅ 拼音生成脚本 (generate-pinyin.ts + pinyin-pro库)
- ✅ 搜索服务支持拼音匹配 (searchAuthors, searchBooks, getSuggestions)

### P3 完成项目 (热门搜索)
- ✅ Redis sorted set 记录搜索词频
- ✅ GET /search/popular API 端点
- ✅ GET /search/trending API 端点 (今日热搜)
- ✅ PopularSearchesSection UI 组件
- ✅ 排名颜色区分 (Top3: 红/橙/黄)
- ✅ 默认热门搜索兜底数据

### 额外完成: 作者别名搜索 (English UX Enhancement)
- ✅ 数据库 schema 增加 aliases 字段 (String[])
- ✅ 数据库迁移 + GIN 索引优化
- ✅ 搜索服务支持别名匹配
- ✅ 50+ 经典作者别名数据脚本
  - 笔名搜索: "Mark Twain" ↔ "Samuel Clemens"
  - 名字变体: "Dostoevsky" ↔ "Dostoyevsky"
  - 常见拼写错误: "Shakespear" → "Shakespeare"

### 额外完成: 高级搜索优化 (English UX Enhancement)
- ✅ **Fuzzy Matching (pg_trgm)**
  - PostgreSQL pg_trgm 扩展启用
  - Trigram GIN 索引 (authors.name, books.title, books.author)
  - similarity() 函数实现模糊匹配 (threshold: 0.3)
  - 支持拼写错误容忍: "Shakespeer" → "Shakespeare"
- ✅ **Smart Ranking System**
  - 精确匹配: 100分
  - 前缀匹配: 80分
  - 包含匹配: 60分
  - 别名匹配: 50分
  - 拼音匹配: 45分
  - 模糊匹配: similarity * 40分
- ✅ **Article Handling (冠词处理)**
  - title_normalized 字段 (数据库触发器自动填充)
  - 去除 "The", "A", "An" 冠词匹配
  - 示例: "Brothers Karamazov" → "The Brothers Karamazov"

### 新增文件
- `apps/backend/src/modules/search/dto/index.ts`
- `apps/backend/src/modules/search/search.service.ts`
- `apps/backend/src/modules/search/search.controller.ts`
- `apps/backend/src/modules/search/search.module.ts`
- `ios/Readmigo/Core/Network/APIClient+Search.swift`
- `packages/database/scripts/generate-pinyin.ts`
- `packages/database/scripts/populate-author-aliases.ts`
- `packages/database/prisma/migrations/20251224_add_pinyin_search_fields/migration.sql`
- `packages/database/prisma/migrations/20251224_add_author_aliases/migration.sql`
- `packages/database/prisma/migrations/20251224_enable_pg_trgm/migration.sql`

### 修改文件
- `apps/backend/src/common/redis/redis.service.ts` (添加sorted set方法)
- `apps/backend/src/app.module.ts` (注册SearchModule)
- `ios/Readmigo/Core/Models/Search.swift` (添加统一搜索类型)
- `ios/Readmigo/Features/Library/DiscoverView.swift` (集成分类结果)

---

## 一、现状分析

### 1.1 已完成功能

| 功能 | 位置 | 说明 |
|------|------|------|
| 基础搜索 UI | `DiscoverView.swift` | 搜索栏 + 结果列表 |
| 书籍搜索 API | `GET /books?search=` | 标题/作者模糊匹配 |
| 阅读器内搜索 | `SearchView.swift` | 关键词/语义/正则搜索 |
| 搜索历史存储 | `SearchHistoryManager.swift` | UserDefaults 持久化 |

### 1.2 待完成功能

| 功能 | 优先级 | 复杂度 | 说明 |
|------|--------|--------|------|
| 搜索历史 UI | P0 | 低 | 显示最近搜索记录 |
| 分类结果展示 | P0 | 中 | 作者/书籍/语录分开展示 |
| 热门搜索 | P1 | 中 | 展示热搜词汇 |
| 自动补全建议 | P1 | 中 | 输入时实时建议 |
| 拼音搜索 | P2 | 高 | 支持拼音搜索中文内容 |
| 多语言别名 | P2 | 中 | 作者中英文名互搜 |

---

## 二、技术方案

### 2.1 P0: 搜索历史 UI

**目标**: 在搜索框下方显示最近搜索记录

**iOS 实现**:

```swift
// DiscoverView.swift 新增
struct SearchHistorySection: View {
    @ObservedObject var historyManager: SearchHistoryManager
    let onSelect: (String) -> Void
    let onClear: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近搜索")
                    .font(.headline)
                Spacer()
                Button("清除") { onClear() }
                    .foregroundColor(.secondary)
            }

            FlowLayout(spacing: 8) {
                ForEach(historyManager.recentSearches.prefix(10), id: \.self) { term in
                    SearchHistoryChip(term: term) {
                        onSelect(term)
                    }
                }
            }
        }
        .padding(.horizontal)
    }
}

struct SearchHistoryChip: View {
    let term: String
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(term)
                .font(.subheadline)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(.systemGray6))
                .cornerRadius(16)
        }
        .buttonStyle(.plain)
    }
}
```

**文件修改**:
- `ios/Readmigo/Features/Discover/DiscoverView.swift`
- `ios/Readmigo/Core/Services/SearchHistoryManager.swift` (添加清除方法)

**展示逻辑**:
```
┌─────────────────────────────────────┐
│  🔍 搜索书籍、作者...              │
├─────────────────────────────────────┤
│  最近搜索                    [清除] │
│  ┌────┐ ┌──────┐ ┌────────┐        │
│  │ 傲慢 │ │ 简·奥斯汀│ │ 悲惨世界 │        │
│  └────┘ └──────┘ └────────┘        │
│  ┌──────┐ ┌────┐                   │
│  │ 莎士比亚│ │ 1984│                   │
│  └──────┘ └────┘                   │
├─────────────────────────────────────┤
│  热门分类 / 推荐书籍...            │
└─────────────────────────────────────┘
```

---

### 2.2 P0: 分类搜索结果

**目标**: 搜索结果按类型分组显示（作者、书籍、语录）

**后端 API 新增**:

```typescript
// apps/backend/src/modules/search/search.controller.ts (新建)

@Controller('search')
@ApiTags('search')
export class SearchController {
  constructor(
    private booksService: BooksService,
    private authorsService: AuthorsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Unified search across all content types' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 5,
  ): Promise<UnifiedSearchResult> {
    const [authors, books, quotes] = await Promise.all([
      this.authorsService.searchAuthors(query, limit),
      this.booksService.searchBooks(query, limit),
      this.searchQuotes(query, limit),
    ]);

    return {
      query,
      results: {
        authors: {
          items: authors,
          total: authors.length,
          hasMore: authors.length >= limit,
        },
        books: {
          items: books,
          total: books.length,
          hasMore: books.length >= limit,
        },
        quotes: {
          items: quotes,
          total: quotes.length,
          hasMore: quotes.length >= limit,
        },
      },
    };
  }
}

// 响应类型定义
interface UnifiedSearchResult {
  query: string;
  results: {
    authors: SearchResultSection<Author>;
    books: SearchResultSection<Book>;
    quotes: SearchResultSection<Quote>;
  };
}

interface SearchResultSection<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
```

**iOS 实现**:

```swift
// ios/Readmigo/Core/Models/Search.swift 新增

struct UnifiedSearchResult: Codable {
    let query: String
    let results: SearchResults

    struct SearchResults: Codable {
        let authors: SearchSection<Author>
        let books: SearchSection<Book>
        let quotes: SearchSection<Quote>
    }

    struct SearchSection<T: Codable>: Codable {
        let items: [T]
        let total: Int
        let hasMore: Bool
    }
}

// DiscoverView.swift 搜索结果展示
struct CategorizedSearchResults: View {
    let result: UnifiedSearchResult

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 20) {
                // 作者结果
                if !result.results.authors.items.isEmpty {
                    SearchCategorySection(
                        title: "作者",
                        icon: "person.fill"
                    ) {
                        ForEach(result.results.authors.items) { author in
                            AuthorSearchRow(author: author)
                        }
                        if result.results.authors.hasMore {
                            MoreButton(title: "查看更多作者")
                        }
                    }
                }

                // 书籍结果
                if !result.results.books.items.isEmpty {
                    SearchCategorySection(
                        title: "书籍",
                        icon: "book.fill"
                    ) {
                        ForEach(result.results.books.items) { book in
                            BookSearchRow(book: book)
                        }
                        if result.results.books.hasMore {
                            MoreButton(title: "查看更多书籍")
                        }
                    }
                }

                // 语录结果
                if !result.results.quotes.items.isEmpty {
                    SearchCategorySection(
                        title: "名言",
                        icon: "quote.bubble.fill"
                    ) {
                        ForEach(result.results.quotes.items) { quote in
                            QuoteSearchRow(quote: quote)
                        }
                    }
                }
            }
            .padding()
        }
    }
}
```

**UI 布局**:
```
┌─────────────────────────────────────┐
│  🔍 简·奥斯汀                    ✕  │
├─────────────────────────────────────┤
│  👤 作者 (1)                        │
│  ┌─────────────────────────────────┐│
│  │ [头像] Jane Austen              ││
│  │        简·奥斯汀 · 6部作品       ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  📚 书籍 (6)                        │
│  ┌─────────────────────────────────┐│
│  │ [封面] 傲慢与偏见                ││
│  │        简·奥斯汀                 ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ [封面] 理智与情感                ││
│  │        简·奥斯汀                 ││
│  └─────────────────────────────────┘│
│  > 查看更多书籍                     │
├─────────────────────────────────────┤
│  💬 名言 (3)                        │
│  ┌─────────────────────────────────┐│
│  │ "我要感谢你的是你让我认识到自己" ││
│  │  — 简·奥斯汀《傲慢与偏见》       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 2.3 P1: 热门搜索

**目标**: 展示平台热门搜索词汇

**后端实现**:

```typescript
// apps/backend/src/modules/search/search.service.ts

@Injectable()
export class SearchService {
  constructor(
    private redis: RedisService,
    private prisma: PrismaService,
  ) {}

  // 记录搜索词
  async recordSearch(query: string, userId?: string): Promise<void> {
    const key = 'search:popular';
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `search:popular:${today}`;

    await Promise.all([
      this.redis.zincrby(key, 1, query.toLowerCase()),
      this.redis.zincrby(dailyKey, 1, query.toLowerCase()),
      this.redis.expire(dailyKey, 86400 * 7), // 保留7天
    ]);
  }

  // 获取热门搜索
  async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    const results = await this.redis.zrevrange(
      'search:popular',
      0,
      limit - 1,
      'WITHSCORES'
    );

    return this.parseZRangeResults(results);
  }

  // 获取今日热搜
  async getTrendingSearches(limit: number = 10): Promise<PopularSearch[]> {
    const today = new Date().toISOString().split('T')[0];
    const results = await this.redis.zrevrange(
      `search:popular:${today}`,
      0,
      limit - 1,
      'WITHSCORES'
    );

    return this.parseZRangeResults(results);
  }
}

// API 端点
@Get('popular')
@ApiOperation({ summary: 'Get popular search terms' })
async getPopularSearches(
  @Query('limit') limit: number = 10,
): Promise<PopularSearch[]> {
  return this.searchService.getPopularSearches(limit);
}
```

**iOS 实现**:

```swift
// DiscoverView.swift

struct PopularSearchSection: View {
    let searches: [PopularSearch]
    let onSelect: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                Text("热门搜索")
                    .font(.headline)
            }

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(Array(searches.enumerated()), id: \.element.term) { index, search in
                    PopularSearchRow(
                        rank: index + 1,
                        search: search,
                        onTap: { onSelect(search.term) }
                    )
                }
            }
        }
        .padding(.horizontal)
    }
}

struct PopularSearchRow: View {
    let rank: Int
    let search: PopularSearch
    let onTap: () -> Void

    var rankColor: Color {
        switch rank {
        case 1: return .red
        case 2: return .orange
        case 3: return .yellow
        default: return .gray
        }
    }

    var body: some View {
        Button(action: onTap) {
            HStack {
                Text("\(rank)")
                    .font(.caption.bold())
                    .foregroundColor(rankColor)
                    .frame(width: 20)
                Text(search.term)
                    .font(.subheadline)
                    .lineLimit(1)
                Spacer()
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}
```

---

### 2.4 P1: 自动补全建议

**目标**: 输入时实时显示搜索建议

**后端实现**:

```typescript
// apps/backend/src/modules/search/search.controller.ts

@Get('suggestions')
@ApiOperation({ summary: 'Get search suggestions' })
async getSuggestions(
  @Query('q') query: string,
  @Query('limit') limit: number = 5,
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  // 并行获取多种建议来源
  const [authors, books, popular] = await Promise.all([
    // 作者名匹配
    this.prisma.author.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { chineseName: { startsWith: query } },
        ],
      },
      select: { name: true, chineseName: true },
      take: limit,
    }),
    // 书名匹配
    this.prisma.book.findMany({
      where: { title: { startsWith: query, mode: 'insensitive' } },
      select: { title: true },
      take: limit,
    }),
    // 热门搜索匹配
    this.searchService.getMatchingPopularSearches(query, limit),
  ]);

  return this.mergeSuggestions(authors, books, popular);
}
```

**iOS 实现**:

```swift
// DiscoverViewModel.swift 新增

class DiscoverViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var suggestions: [SearchSuggestion] = []
    @Published var isLoadingSuggestions = false

    private var suggestionTask: Task<Void, Never>?

    func searchTextChanged(_ text: String) {
        suggestionTask?.cancel()

        guard text.count >= 2 else {
            suggestions = []
            return
        }

        suggestionTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000) // 300ms debounce
            guard !Task.isCancelled else { return }

            await fetchSuggestions(for: text)
        }
    }

    @MainActor
    private func fetchSuggestions(for query: String) async {
        isLoadingSuggestions = true
        defer { isLoadingSuggestions = false }

        do {
            suggestions = try await APIClient.shared.getSuggestions(query: query)
        } catch {
            suggestions = []
        }
    }
}

// UI 组件
struct SearchSuggestionsView: View {
    let suggestions: [SearchSuggestion]
    let onSelect: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(suggestions) { suggestion in
                Button {
                    onSelect(suggestion.text)
                } label: {
                    HStack {
                        Image(systemName: suggestion.icon)
                            .foregroundColor(.secondary)
                            .frame(width: 24)
                        Text(suggestion.text)
                        Spacer()
                        Image(systemName: "arrow.up.left")
                            .foregroundColor(.secondary)
                            .font(.caption)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 12)
                }
                .buttonStyle(.plain)

                Divider()
                    .padding(.leading, 48)
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 4)
    }
}
```

---

### 2.5 P2: 拼音搜索

**目标**: 支持用拼音搜索中文内容

**技术方案选项**:

| 方案 | 优点 | 缺点 |
|------|------|------|
| A. PostgreSQL pg_trgm | 原生支持，性能好 | 需要额外扩展 |
| B. 预生成拼音字段 | 简单可靠 | 增加存储，需迁移 |
| C. 应用层转换 | 灵活 | 性能差，不推荐 |

**推荐方案 B: 预生成拼音字段**

```prisma
// packages/database/prisma/schema.prisma

model Author {
  // 现有字段...
  namePinyin      String?   // "Jane Austen"
  chineseNamePinyin String? // "jian ao si ting"
}

model Book {
  // 现有字段...
  titlePinyin     String?   // "ao man yu pian jian"
}
```

```typescript
// packages/database/scripts/generate-pinyin.ts

import pinyin from 'pinyin';

async function generatePinyin() {
  const authors = await prisma.author.findMany({
    where: { chineseName: { not: null } },
  });

  for (const author of authors) {
    const pinyinResult = pinyin(author.chineseName, {
      style: pinyin.STYLE_NORMAL,
    }).flat().join(' ');

    await prisma.author.update({
      where: { id: author.id },
      data: { chineseNamePinyin: pinyinResult },
    });
  }
}
```

---

### 2.6 P2: 多语言别名

**目标**: 支持中英文名互搜（如搜"奥斯汀"找到"Jane Austen"）

**数据库设计**:

```prisma
model AuthorAlias {
  id        String   @id @default(cuid())
  authorId  String
  author    Author   @relation(fields: [authorId], references: [id])
  alias     String
  language  String   // "zh", "en", "ja", etc.
  isPrimary Boolean  @default(false)

  @@index([alias])
  @@index([authorId])
}
```

**搜索增强**:

```typescript
// 搜索时同时匹配别名
async searchAuthors(query: string, limit: number) {
  return this.prisma.author.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { chineseName: { contains: query } },
        { aliases: { some: { alias: { contains: query, mode: 'insensitive' } } } },
      ],
    },
    include: { aliases: true },
    take: limit,
  });
}
```

---

## 三、文件修改清单

### 3.1 后端文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `apps/backend/src/modules/search/search.module.ts` | 新建 | 搜索模块 |
| `apps/backend/src/modules/search/search.controller.ts` | 新建 | 统一搜索 API |
| `apps/backend/src/modules/search/search.service.ts` | 新建 | 搜索业务逻辑 |
| `apps/backend/src/modules/search/dto/` | 新建 | DTO 定义 |
| `apps/backend/src/app.module.ts` | 修改 | 注册 SearchModule |
| `packages/database/prisma/schema.prisma` | 修改 | 添加拼音字段(P2) |

### 3.2 iOS 文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `ios/Readmigo/Features/Discover/DiscoverView.swift` | 修改 | 集成搜索历史+分类结果 |
| `ios/Readmigo/Features/Discover/DiscoverViewModel.swift` | 新建 | 搜索状态管理 |
| `ios/Readmigo/Features/Discover/Components/SearchHistorySection.swift` | 新建 | 历史记录组件 |
| `ios/Readmigo/Features/Discover/Components/CategorizedSearchResults.swift` | 新建 | 分类结果组件 |
| `ios/Readmigo/Features/Discover/Components/PopularSearchSection.swift` | 新建 | 热门搜索组件 |
| `ios/Readmigo/Features/Discover/Components/SearchSuggestionsView.swift` | 新建 | 自动补全组件 |
| `ios/Readmigo/Core/Services/SearchHistoryManager.swift` | 修改 | 添加清除方法 |
| `ios/Readmigo/Core/Models/Search.swift` | 修改 | 添加新类型定义 |
| `ios/Readmigo/Core/Network/APIClient+Search.swift` | 新建 | 搜索 API 调用 |

---

## 四、API 规范

### 4.1 统一搜索

```
GET /api/search?q={query}&limit={limit}

Response:
{
  "query": "简·奥斯汀",
  "results": {
    "authors": {
      "items": [{ "id": "...", "name": "Jane Austen", ... }],
      "total": 1,
      "hasMore": false
    },
    "books": {
      "items": [{ "id": "...", "title": "傲慢与偏见", ... }],
      "total": 6,
      "hasMore": true
    },
    "quotes": {
      "items": [{ "id": "...", "content": "...", ... }],
      "total": 3,
      "hasMore": false
    }
  }
}
```

### 4.2 搜索建议

```
GET /api/search/suggestions?q={query}&limit={limit}

Response:
[
  { "text": "简·奥斯汀", "type": "author", "icon": "person.fill" },
  { "text": "简爱", "type": "book", "icon": "book.fill" },
  { "text": "简·奥斯汀作品集", "type": "popular", "icon": "flame.fill" }
]
```

### 4.3 热门搜索

```
GET /api/search/popular?limit={limit}

Response:
[
  { "term": "莎士比亚", "count": 1234 },
  { "term": "傲慢与偏见", "count": 987 },
  { "term": "1984", "count": 654 }
]
```

---

## 五、实施顺序

```
Phase 1 (P0) - 基础体验提升
├── Step 1: 创建 SearchModule (后端)
│   ├── search.module.ts
│   ├── search.controller.ts (统一搜索 API)
│   └── search.service.ts
│
├── Step 2: 搜索历史 UI (iOS)
│   ├── 修改 DiscoverView.swift
│   ├── 新建 SearchHistorySection.swift
│   └── 修改 SearchHistoryManager.swift
│
└── Step 3: 分类搜索结果 (iOS)
    ├── 新建 CategorizedSearchResults.swift
    ├── 新建 APIClient+Search.swift
    └── 更新 Search.swift 模型

Phase 2 (P1) - 智能搜索增强
├── Step 4: 热门搜索 (后端 + iOS)
│   ├── 添加 Redis 记录逻辑
│   ├── 添加 /search/popular API
│   └── 新建 PopularSearchSection.swift
│
└── Step 5: 自动补全 (后端 + iOS)
    ├── 添加 /search/suggestions API
    ├── 新建 DiscoverViewModel.swift
    └── 新建 SearchSuggestionsView.swift

Phase 3 (P2) - 多语言支持
├── Step 6: 拼音搜索
│   ├── 修改 schema.prisma
│   ├── 创建迁移脚本
│   └── 更新搜索逻辑
│
└── Step 7: 别名搜索
    ├── 创建 AuthorAlias 表
    ├── 填充别名数据
    └── 更新搜索逻辑
```

---

## 六、测试计划

### 6.1 单元测试

```typescript
// apps/backend/src/modules/search/search.service.spec.ts

describe('SearchService', () => {
  it('should search across all content types', async () => {
    const result = await service.search('奥斯汀');
    expect(result.results.authors.items).toHaveLength(1);
    expect(result.results.books.items.length).toBeGreaterThan(0);
  });

  it('should return suggestions for partial input', async () => {
    const suggestions = await service.getSuggestions('傲慢');
    expect(suggestions).toContainEqual(
      expect.objectContaining({ text: '傲慢与偏见' })
    );
  });

  it('should record and retrieve popular searches', async () => {
    await service.recordSearch('莎士比亚');
    const popular = await service.getPopularSearches(10);
    expect(popular).toContainEqual(
      expect.objectContaining({ term: '莎士比亚' })
    );
  });
});
```

### 6.2 集成测试

| 测试用例 | 预期结果 |
|----------|----------|
| 搜索"Jane Austen" | 返回作者 + 相关书籍 |
| 搜索"简·奥斯汀" | 同上（中文名匹配） |
| 搜索"傲慢" | 返回《傲慢与偏见》建议 |
| 搜索空字符串 | 显示热门搜索 + 历史记录 |
| 点击历史记录项 | 执行该搜索 |
| 清除历史记录 | 历史记录清空 |

### 6.3 性能指标

| 指标 | 目标值 |
|------|--------|
| 搜索响应时间 | < 200ms |
| 建议响应时间 | < 100ms |
| 热门搜索缓存 | 5分钟 TTL |

---

## 七、风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| Redis 不可用 | 降级为直接数据库查询，热门搜索使用静态列表 |
| 搜索性能差 | 添加数据库索引，使用 PostgreSQL 全文搜索 |
| 拼音库大小 | 使用轻量级 pinyin-pro 库 (~50KB) |

---

## 八、成功标准

### Phase 1 完成标准 ✅
- [x] 统一搜索 API 正常工作
- [x] 搜索历史在 UI 中显示
- [x] 搜索结果按类型分组展示
- [x] 点击历史/结果可正确导航
- [x] 热门搜索功能

### Phase 2 完成标准 ✅
- [x] 输入 2+ 字符显示建议 (自动补全)
- [x] 300ms debounce + 异步获取建议
- [x] 拼音搜索正常工作
- [x] 中英文名互搜正常

### Phase 3 完成标准 ✅
- [x] 热门搜索 API 和 UI
- [x] 今日热搜趋势
- [x] 作者别名搜索 (笔名、变体、拼写)

---

## 部署步骤

1. **应用数据库迁移** (包含 pg_trgm 扩展启用):
```bash
cd packages/database
npx prisma migrate deploy
# 或手动执行:
psql $DATABASE_URL -f prisma/migrations/20251224_enable_pg_trgm/migration.sql
```

2. **生成拼音数据**:
```bash
npx tsx scripts/generate-pinyin.ts
```

3. **填充作者别名**:
```bash
npx tsx scripts/populate-author-aliases.ts
```

**注意**: pg_trgm 迁移会自动:
- 启用 pg_trgm 扩展
- 创建 trigram GIN 索引
- 添加 title_normalized 字段
- 创建自动填充触发器
- 回填现有书籍的 normalized title

---

**✅ 搜索优化功能已全部完成！**
