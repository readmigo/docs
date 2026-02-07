# EPUB 书籍架构设计文档

## 目录
1. [书籍来源概览](#1-书籍来源概览)
2. [EPUB 文件结构](#2-epub-文件结构)
3. [后端存储架构](#3-后端存储架构)
4. [API 接口设计](#4-api-接口设计)
5. [客户端实现](#5-客户端实现)
6. [完整数据流](#6-完整数据流)

---

## 1. 书籍来源概览

### 1.1 英文书籍来源

#### Standard Ebooks
| 属性 | 值 |
|------|-----|
| 来源网站 | https://standardebooks.org |
| 获取方式 | 网页爬虫 (HTML 解析) |
| 书籍格式 | EPUB (compatible 版本，排除 kepub/advanced) |
| 元数据字段 | title, author, description, genre, cover, thumbnail |
| 请求延迟 | 1500ms/请求 |
| 当前书籍数 | 282 本 |

**文件结构:**
```
downloads/standard-ebooks/
├── {author}_{title}.epub          # EPUB 原文件
└── (上传到 R2 后删除本地缓存)
```

#### Project Gutenberg (英文)
| 属性 | 值 |
|------|-----|
| 来源网站 | https://www.gutenberg.org |
| 获取方式 | 预定义书籍 ID 列表 |
| 书籍格式 | EPUB (多格式回退: epub3.images → epub.images → epub.noimages) |
| 元数据字段 | title, author, subjects, cover (medium/small) |
| 请求延迟 | 2000ms/书籍 |
| 推荐书籍数 | 50+ 经典名著 |

### 1.2 中文书籍来源

#### CText (中国哲学书电子化计划)
| 属性 | 值 |
|------|-----|
| 来源网站 | https://ctext.org |
| 获取方式 | CText API (XML/JSON) |
| 认证方式 | API Key 或用户名密码 |
| 书籍格式 | 纯文本 (非 EPUB) |
| 内容类型 | 13 部经典 (论语、孟子、道德经、孙子兵法等) |
| 请求延迟 | 3000ms/请求 |

**特殊处理:**
- 繁体转简体
- 统计汉字数量
- 标注朝代信息

#### Wikisource 中文 (维基文库)
| 属性 | 值 |
|------|-----|
| 来源网站 | https://zh.wikisource.org |
| 获取方式 | MediaWiki API |
| 书籍格式 | Wikitext → 纯文本 |
| 内容类型 | 四大名著、现代文学、散文等 |
| 请求延迟 | 2000ms/请求 |

#### Project Gutenberg (中文)
| 属性 | 值 |
|------|-----|
| 来源网站 | https://www.gutenberg.org |
| 获取方式 | 预定义书籍 ID 列表 |
| 书籍格式 | EPUB |
| 内容类型 | 200+ 中文经典 |
| 特殊处理 | HSK 等级分析、笔画统计 |

---

## 2. EPUB 文件结构

### 2.1 EPUB 标准结构

```
book.epub (ZIP 压缩包)
├── mimetype                           # 固定内容: application/epub+zip
├── META-INF/
│   └── container.xml                  # 指向 OPF 文件路径
├── OEBPS/                             # 或 EPUB/, content/ 等
│   ├── content.opf                    # 元数据 + 清单 + 阅读顺序
│   ├── toc.ncx                        # 目录导航 (EPUB 2)
│   ├── nav.xhtml                      # 目录导航 (EPUB 3)
│   ├── css/
│   │   └── styles.css                 # 样式文件
│   ├── images/
│   │   ├── cover.jpg                  # 封面图片
│   │   └── *.png/jpg/svg              # 插图
│   └── text/
│       ├── titlepage.xhtml            # 标题页
│       ├── chapter-1.xhtml            # 章节内容
│       ├── chapter-2.xhtml
│       └── ...
└── [其他资源文件]
```

### 2.2 关键文件解析

#### container.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
```

#### content.opf (核心元数据)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Pride and Prejudice</dc:title>
    <dc:creator>Jane Austen</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>A classic novel...</dc:description>
    <dc:date>1813-01-28</dc:date>
    <dc:subject>Fiction</dc:subject>
    <meta property="dcterms:modified">2023-01-01T00:00:00Z</meta>
  </metadata>

  <manifest>
    <item id="cover" href="images/cover.jpg" media-type="image/jpeg"/>
    <item id="ch1" href="text/chapter-1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="text/chapter-2.xhtml" media-type="application/xhtml+xml"/>
    <!-- ... -->
  </manifest>

  <spine>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
    <!-- 阅读顺序 -->
  </spine>
</package>
```

### 2.3 解析器实现 (EpubParser)

```typescript
// scripts/book-ingestion/processors/epub-parser.ts

interface ParsedBook {
  title: string;
  author: string;
  description: string;
  language: string;
  publishedYear: number;
  chapters: ParsedChapter[];
  coverImage: Buffer;
  coverMimeType: string;
  totalWordCount: number;
}

interface ParsedChapter {
  title: string;
  content: string;      // HTML 内容
  orderIndex: number;
  wordCount: number;
  href: string;         // EPUB 内部路径
}
```

**解析流程:**
1. 解压 ZIP → 读取 `META-INF/container.xml`
2. 定位 OPF 文件 → 解析 Dublin Core 元数据
3. 解析 manifest → 获取所有资源映射
4. 解析 spine → 获取章节阅读顺序
5. 遍历章节 → 使用 JSDOM 提取内容
6. 过滤短章节 (< 100 词)
7. 提取封面图片

---

## 3. 后端存储架构

### 3.1 数据库模型 (Prisma)

#### Book 表
```prisma
model Book {
  id                      String    @id @default(uuid())

  // 基础信息
  title                   String
  author                  String
  description             String?
  language                String    @default("en")
  languageVariant         String?   // zh-Hans, zh-Hant

  // 资源 URL (Cloudflare R2)
  epubUrl                 String?
  coverUrl                String?
  coverThumbUrl           String?

  // 统计信息
  wordCount               Int?
  chapterCount            Int?
  estimatedReadingMinutes Int?
  characterCount          Int?      // 中文专用

  // 难度分析
  difficultyScore         Float?    // 1-10 标准化分数
  fleschScore             Float?    // Flesch Reading Ease (英文)
  hskLevel                Int?      // HSK 等级 1-9 (中文)
  avgStrokeCount          Float?    // 平均笔画数 (中文)
  cefrLevel               String?   // CEFR A1-C2 (英文)

  // 来源追踪
  source                  BookSource
  sourceId                String?   // 原始 ID
  sourceUrl               String?   // 原始 URL

  // 分类
  subjects                String[]
  genres                  String[]
  dynasty                 String?   // 中文古籍朝代

  // 状态
  status                  BookStatus @default(PENDING)
  publishedAt             DateTime?
  createdAt               DateTime   @default(now())
  updatedAt               DateTime   @updatedAt

  // 关联
  chapters                Chapter[]
  userBooks               UserBook[]

  @@unique([source, sourceId])
}

enum BookSource {
  STANDARD_EBOOKS
  GUTENBERG
  GUTENBERG_ZH
  CTEXT
  WIKISOURCE_ZH
  SHUGE
  USER_UPLOAD
}

enum BookStatus {
  PENDING
  PROCESSING
  ACTIVE
  INACTIVE
  ERROR
}
```

#### Chapter 表
```prisma
model Chapter {
  id          String  @id @default(uuid())
  bookId      String
  book        Book    @relation(fields: [bookId], references: [id])

  order       Int                 // 章节顺序 (0-based)
  title       String
  href        String?             // EPUB 内部路径

  content     String?  @db.Text   // 纯文本内容
  htmlContent String?  @db.Text   // HTML 原始内容
  wordCount   Int?

  @@unique([bookId, order])
}
```

### 3.2 对象存储 (Cloudflare R2)

```
R2 Bucket: readmigo
├── epubs/
│   ├── standard-ebooks/
│   │   └── {author}_{title}.epub
│   ├── gutenberg/
│   │   └── {book-id}.epub
│   └── gutenberg-zh/
│       └── {book-id}.epub
│
├── covers/
│   ├── standard-ebooks/
│   │   ├── {author}_{title}.jpg
│   │   └── {author}_{title}-thumb.jpg
│   ├── gutenberg/
│   │   ├── {book-id}.jpg
│   │   └── {book-id}-thumb.jpg
│   └── gutenberg-zh/
│       └── {book-id}.jpg
│
└── books/
    ├── ctext/
    │   └── {urn}.txt
    └── wikisource-zh/
        └── {slug}.txt
```

**R2 配置:**
```typescript
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

### 3.3 缓存策略 (Redis)

| 缓存项 | Key 格式 | TTL |
|--------|----------|-----|
| 书籍详情 | `book:{bookId}` | 1 小时 |
| 章节内容 | `chapter:{bookId}:{chapterId}` | 1 小时 |
| 分类列表 | `genres:all` | 24 小时 |
| 主题列表 | `subjects:all` | 24 小时 |

---

## 4. API 接口设计

### 4.1 公开接口

#### 获取书籍列表
```
GET /api/v1/books

Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - language: string (en, zh)
  - genre: string
  - subject: string
  - minDifficulty: number (1-10)
  - maxDifficulty: number (1-10)
  - hskLevel: number (1-9, 中文)
  - cefrLevel: string (A1-C2, 英文)
  - dynasty: string (中文古籍)
  - search: string
  - sortBy: string (title, author, difficulty, createdAt)
  - sortOrder: asc | desc

Response:
{
  "items": [Book],
  "total": number,
  "page": number,
  "limit": number,
  "totalPages": number
}
```

#### 获取书籍详情
```
GET /api/v1/books/:id

Response:
{
  "id": "uuid",
  "title": "Pride and Prejudice",
  "author": "Jane Austen",
  "description": "...",
  "coverUrl": "https://r2.../covers/...",
  "coverThumbUrl": "https://r2.../covers/...-thumb.jpg",
  "wordCount": 120000,
  "chapterCount": 65,
  "difficultyScore": 45,
  "cefrLevel": "B2",
  "chapters": [
    {
      "id": "uuid",
      "title": "Chapter 1",
      "order": 0,
      "wordCount": 2000
    },
    ...
  ]
}
```

#### 获取章节内容
```
GET /api/v1/books/:bookId/content/:chapterId

Response:
{
  "id": "uuid",
  "bookId": "uuid",
  "title": "Chapter 1",
  "order": 0,
  "content": "It is a truth universally acknowledged...",
  "htmlContent": "<p>It is a truth universally acknowledged...</p>",
  "wordCount": 2000,
  "previousChapterId": null,
  "nextChapterId": "uuid-of-chapter-2"
}
```

#### 获取分类列表
```
GET /api/v1/books/genres

Response: ["Fiction", "Non-Fiction", "Science Fiction", ...]
```

### 4.2 认证接口 (JWT)

#### 获取个性化推荐
```
GET /api/v1/books/recommendations
Authorization: Bearer {token}

Response:
{
  "forYou": [Book],      // 基于用户等级
  "popular": [Book],     // 热门书籍
  "newArrivals": [Book]  // 新上架
}
```

### 4.3 移动端过滤逻辑

```typescript
// 识别移动客户端
const isMobileClient = req.headers['x-client-type'] === 'ios'
                    || req.headers['x-client-type'] === 'android';

// 中文内容过滤 (移动端暂不支持)
const CHINESE_LANGUAGES = ['zh', 'zh-Hans', 'zh-Hant', 'zh-CN', 'zh-TW'];
const CHINESE_SOURCES = ['CTEXT', 'WIKISOURCE_ZH', 'GUTENBERG_ZH', 'SHUGE'];

if (isMobileClient) {
  query.where.NOT = {
    OR: [
      { language: { in: CHINESE_LANGUAGES } },
      { source: { in: CHINESE_SOURCES } }
    ]
  };
}
```

---

## 5. 客户端实现

### 5.1 数据模型 (Swift)

```swift
// Book.swift
struct Book: Codable, Identifiable {
    let id: String
    let title: String
    let author: String
    let description: String?
    let coverUrl: String?
    let coverThumbUrl: String?
    let subjects: [String]?
    let genres: [String]
    let difficultyScore: Int?
    let fleschScore: Float?
    let wordCount: Int?
    let chapterCount: Int?
    let source: String
    let status: String
    let publishedAt: String?

    var displayCoverUrl: String? {
        coverThumbUrl ?? coverUrl
    }

    var difficultyLevel: DifficultyLevel {
        guard let score = difficultyScore else { return .medium }
        switch score {
        case 0..<30: return .easy
        case 30..<50: return .medium
        case 50..<70: return .challenging
        default: return .advanced
        }
    }
}

struct BookDetail: Codable {
    let book: Book
    let chapters: [Chapter]
    let userProgress: UserProgress?
}

struct Chapter: Codable, Identifiable {
    let id: String
    let title: String
    let order: Int
    let wordCount: Int?
}

struct ChapterContent: Codable {
    let id: String
    let title: String
    let order: Int
    let content: String       // 纯文本
    let htmlContent: String?  // HTML
    let wordCount: Int
    let previousChapterId: String?
    let nextChapterId: String?
}
```

### 5.2 阅读器架构

```
ReaderView (主容器)
├── ReaderContentView (WKWebView)
│   ├── HTML 内容渲染
│   ├── JavaScript 桥接
│   └── 文本选择处理
├── ReaderTopBar
│   ├── 关闭按钮
│   ├── 章节标题
│   ├── 章节列表按钮
│   └── 设置按钮
├── ReaderBottomBar
│   ├── 进度条
│   ├── 上一章/下一章
│   └── 章节信息
├── ChapterListView (Sheet)
├── ReaderSettingsView (Sheet)
│   ├── 主题切换
│   └── 字号调节
└── AIInteractionPanel
    └── 选中文本 AI 处理
```

### 5.3 内容渲染 (WKWebView)

```swift
// ReaderContentView.swift
class ReaderContentView: UIViewRepresentable {
    let content: ChapterContent
    let theme: ReaderTheme
    let fontSize: CGFloat

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.add(coordinator, name: "textSelection")
        config.userContentController.add(coordinator, name: "tap")
        config.userContentController.add(coordinator, name: "scroll")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let html = generateHTML(content: content, theme: theme, fontSize: fontSize)
        webView.loadHTMLString(html, baseURL: nil)
    }
}
```

### 5.4 HTML 模板

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg-color: ${theme.backgroundColor};
      --text-color: ${theme.textColor};
      --font-size: ${fontSize}px;
    }

    body {
      font-family: Georgia, 'Noto Serif SC', 'Songti SC', serif;
      font-size: var(--font-size);
      line-height: 1.8;
      color: var(--text-color);
      background: var(--bg-color);
      padding: 20px;
      text-align: justify;
      -webkit-font-smoothing: antialiased;
    }

    /* CJK 支持 */
    body:lang(zh) {
      text-spacing: ideograph-alpha;
      line-break: strict;
      word-break: break-all;
      hyphens: none;
    }

    h1.chapter-title {
      text-align: center;
      font-size: 1.4em;
      margin-bottom: 2em;
      text-indent: 0;
    }

    p {
      text-indent: 2em;
      margin: 1em 0;
    }

    p:first-of-type::first-letter {
      font-size: 1em;
      float: none;
    }

    blockquote {
      font-style: italic;
      border-left: 3px solid var(--text-color);
      padding-left: 1em;
      margin-left: 0;
      opacity: 0.8;
    }

    /* 用户标注颜色 */
    .highlight-yellow { background: rgba(255, 235, 59, 0.4); }
    .highlight-green { background: rgba(76, 175, 80, 0.4); }
    .highlight-blue { background: rgba(33, 150, 243, 0.4); }
    .highlight-pink { background: rgba(233, 30, 99, 0.4); }
    .highlight-purple { background: rgba(156, 39, 176, 0.4); }
  </style>
</head>
<body lang="${language}">
  <h1 class="chapter-title">${title}</h1>
  ${htmlContent}

  <script>
    // 文本选择处理
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        const sentence = getSentenceContext(range);
        window.webkit.messageHandlers.textSelection.postMessage({
          text: selection.toString(),
          sentence: sentence
        });
      }
    });

    // 点击处理
    document.addEventListener('click', (e) => {
      if (!window.getSelection().toString()) {
        window.webkit.messageHandlers.tap.postMessage({});
      }
    });

    // 滚动进度
    window.addEventListener('scroll', () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      window.webkit.messageHandlers.scroll.postMessage({ progress });
    });
  </script>
</body>
</html>
```

### 5.5 离线缓存

```swift
// ContentCache.swift
class ContentCache {
    static let shared = ContentCache()

    private let cacheDirectory: URL

    func saveChapterContent(_ content: ChapterContent, bookId: String) async throws {
        let key = "\(bookId)_\(content.id)"
        let data = try JSONEncoder().encode(content)
        let fileURL = cacheDirectory.appendingPathComponent(key)
        try data.write(to: fileURL)
    }

    func getChapterContent(bookId: String, chapterId: String) async -> ChapterContent? {
        let key = "\(bookId)_\(chapterId)"
        let fileURL = cacheDirectory.appendingPathComponent(key)
        guard let data = try? Data(contentsOf: fileURL) else { return nil }
        return try? JSONDecoder().decode(ChapterContent.self, from: data)
    }
}
```

---

## 6. 完整数据流

### 6.1 书籍导入流程

```mermaid
flowchart TD
    Source["书籍来源网站<br>(Standard Ebooks / Gutenberg)"] -->|"1. 爬取/API请求"| Meta["元数据提取<br>(title, author, description)"]
    Meta -->|"2. 下载 EPUB"| Local["本地临时存储<br>downloads/xxx/*.epub"]
    Local -->|"3. 解析 EPUB"| Parser["EpubParser<br>解压ZIP / 解析OPF / 提取章节 / 提取封面"]
    Parser -->|"4. 难度分析"| Analyzer["DifficultyAnalyzer<br>Flesch Score / 难度评分 1-10"]
    Analyzer -->|"5. 上传到 R2"| R2["Cloudflare R2<br>EPUB 文件 / 封面图片"]
    R2 -->|"6. 写入数据库"| DB["PostgreSQL<br>Book 记录 / Chapter 记录"]
```

### 6.2 阅读流程

```mermaid
flowchart TD
    Library["iOS 客户端<br>LibraryView"] -->|"1. GET /api/v1/books"| BookList["书籍列表展示<br>(封面、标题、难度等)"]
    BookList -->|"2. 用户选择书籍<br>GET /api/v1/books/:id"| Detail["BookDetailView<br>书籍信息 / 章节列表"]
    Detail -->|"3. 开始阅读<br>GET .../content/:chapterId"| ReaderV["ReaderView<br>加载章节内容 / WKWebView渲染"]
    ReaderV -->|"4. 用户交互"| Actions

    subgraph Actions["用户操作"]
        Scroll["滚动阅读"] --> Progress["更新进度<br>保存到服务器"]
        Select["选择文本"] --> AI["AI 面板<br>词汇查询"]
        Switch["切换章节"] --> NextCh["加载下一章"]
    end
```

### 6.3 缓存流程

```mermaid
flowchart TD
    Req["客户端请求章节"] --> LocalCheck{"检查本地缓存<br>(ContentCache)"}
    LocalCheck -->|"命中"| ReturnLocal["返回缓存"]
    LocalCheck -->|"未命中"| API["请求 API"]
    API --> RedisCheck{"检查 Redis 缓存<br>(服务端缓存)"}
    RedisCheck -->|"命中"| ReturnRedis["返回缓存"]
    RedisCheck -->|"未命中"| DB["查询数据库"]
    DB --> WriteRedis["写入 Redis<br>TTL: 1 小时"]
    WriteRedis --> ReturnClient["返回客户端 + 本地缓存"]
```

---

## 附录

### A. 难度评分算法

#### 英文 (Flesch-Kincaid)
```
Flesch Reading Ease = 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)

标准化分数 = (100 - FleschScore) / 10
```

| Flesch Score | 难度等级 | CEFR |
|--------------|---------|------|
| 90-100 | 非常简单 | A1 |
| 80-89 | 简单 | A2 |
| 70-79 | 较简单 | B1 |
| 60-69 | 标准 | B1-B2 |
| 50-59 | 较难 | B2 |
| 30-49 | 困难 | C1 |
| 0-29 | 非常困难 | C2 |

#### 中文 (孙汉银公式)
```
difficulty = -11.848 + 2.135×avgStrokes + 0.15×charsPerSentence +
             7.117×nonHSK3Ratio + 0.164×wordsPerSentence
```

| 难度分数 | HSK 等级 |
|---------|---------|
| 1-2 | HSK 1-2 |
| 3-4 | HSK 3 |
| 5-6 | HSK 4 |
| 7-8 | HSK 5 |
| 9-10 | HSK 6+ |

### B. 环境变量

```env
# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/readmigo

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=readmigo

# Redis
REDIS_URL=redis://localhost:6379

# CText API (可选)
CTEXT_API_KEY=xxx
```

### C. 相关文件索引

| 文件 | 描述 |
|------|------|
| `scripts/book-ingestion/sources/standard-ebooks.ts` | Standard Ebooks 爬虫 |
| `scripts/book-ingestion/sources/gutenberg.ts` | Gutenberg 英文导入 |
| `scripts/book-ingestion/sources/gutenberg-zh.ts` | Gutenberg 中文导入 |
| `scripts/book-ingestion/sources/ctext.ts` | CText 中文经典导入 |
| `scripts/book-ingestion/sources/wikisource-zh.ts` | 维基文库中文导入 |
| `scripts/book-ingestion/processors/epub-parser.ts` | EPUB 解析器 |
| `scripts/book-ingestion/processors/difficulty-analyzer.ts` | 英文难度分析 |
| `scripts/book-ingestion/processors/chinese-difficulty-analyzer.ts` | 中文难度分析 |
| `apps/backend/src/modules/books/books.controller.ts` | 书籍 API 控制器 |
| `apps/backend/src/modules/books/books.service.ts` | 书籍业务逻辑 |
| `ios/Readmigo/Features/Reader/ReaderView.swift` | iOS 阅读器主视图 |
| `ios/Readmigo/Features/Reader/ReaderViewModel.swift` | iOS 阅读器状态管理 |
| `ios/Readmigo/Features/Reader/ReaderContentView.swift` | iOS WebView 渲染 |
| `prisma/schema.prisma` | 数据库模型定义 |
