# Readmigo 书籍导入系统设计文档

> Version: 1.2.0
> Status: Implementation Complete (Core + Batch Management)
> Author: System Architect
> Last Updated: 2025-12-27

---

## 1. 概述

### 1.1 设计目标

构建一个**可扩展、多源、自动化**的书籍导入系统，支撑 Readmigo 的内容运营需求：

- **多源支持**: 支持 Standard Ebooks、Project Gutenberg、中文古籍等多个公版书源
- **多环境隔离**: 本地、Staging、Production 环境独立配置，数据隔离
- **批量导入**: 支持海量书籍的批量导入，带进度追踪和断点续传
- **自动处理**: EPUB 解析、封面提取、难度分析、分类标注自动化
- **质量控制**: 导入前预检、去重机制、错误处理和回滚

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| **幂等性** | 重复导入同一书籍不会产生重复数据 |
| **可追溯** | 每本书记录来源、导入时间、导入批次 |
| **可回滚** | 支持按批次回滚导入的书籍 |
| **渐进式** | 支持增量导入，只导入新书籍 |
| **环境隔离** | 不同环境使用独立的数据库和存储 |

### 1.3 在系统中的定位

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Readmigo Content Pipeline                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                     External Book Sources                            ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ││
│  │  │  Standard    │ │   Project    │ │    CTEXT     │ │ Wikisource ││
│  │  │  Ebooks      │ │  Gutenberg   │ │  (古典文献)   │ │    (ZH)    ││
│  │  │  ~1,000本    │ │  ~70,000本   │ │              │ │            ││
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ ││
│  └─────────┼────────────────┼────────────────┼───────────────┼────────┘│
│            └────────────────┼────────────────┼───────────────┘          │
│                             ▼                ▼                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    ★ Book Import System ★                           ││
│  │                                                                      ││
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           ││
│  │   │  Source  │  │   EPUB   │  │ Difficulty│  │  Cover   │           ││
│  │   │  Fetcher │─▶│  Parser  │─▶│ Analyzer │─▶│ Processor│           ││
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘           ││
│  │         │              │              │              │              ││
│  │         ▼              ▼              ▼              ▼              ││
│  │   ┌─────────────────────────────────────────────────────────────┐  ││
│  │   │                  Import Pipeline Manager                     │  ││
│  │   │  • 任务调度  • 进度追踪  • 错误处理  • 批次管理              │  ││
│  │   └──────────────────────────┬──────────────────────────────────┘  ││
│  └──────────────────────────────│──────────────────────────────────────┘│
│                                 │                                        │
│            ┌────────────────────┼────────────────────┐                  │
│            ▼                    ▼                    ▼                  │
│     ┌─────────────┐      ┌─────────────┐      ┌─────────────┐          │
│     │ PostgreSQL  │      │ Cloudflare  │      │    Redis    │          │
│     │   (Books)   │      │  R2 (Files) │      │   (Queue)   │          │
│     └─────────────┘      └─────────────┘      └─────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Book Import System Architecture                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      CLI / Script Layer                            │  │
│  │                                                                    │  │
│  │   book-import.sh                                                   │  │
│  │   ├── --env=local|staging|production                              │  │
│  │   ├── --source=standard|gutenberg|chinese|all                     │  │
│  │   ├── --limit=N                                                   │  │
│  │   └── --dry-run                                                   │  │
│  │                                                                    │  │
│  └────────────────────────────┬──────────────────────────────────────┘  │
│                               │                                          │
│                               ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Source Adapters Layer                         │  │
│  │                                                                    │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │
│  │   │  Standard   │  │  Gutenberg  │  │   Chinese   │              │  │
│  │   │  Ebooks     │  │   Adapter   │  │   Sources   │              │  │
│  │   │  Adapter    │  │             │  │   Adapter   │              │  │
│  │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │  │
│  │          │                │                │                      │  │
│  │          └────────────────┼────────────────┘                      │  │
│  │                           │                                        │  │
│  │   Interface: BookSourceAdapter                                    │  │
│  │   ├── fetchBookList(): BookMeta[]                                 │  │
│  │   ├── fetchBookContent(id): EPUB                                  │  │
│  │   └── fetchCover(id): Buffer                                      │  │
│  │                                                                    │  │
│  └───────────────────────────┬───────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Processing Layer                              │  │
│  │                                                                    │  │
│  │   ┌─────────────────────────────────────────────────────────────┐ │  │
│  │   │                   Import Pipeline                            │ │  │
│  │   │                                                              │ │  │
│  │   │   1. Fetch    2. Parse     3. Analyze    4. Upload          │ │  │
│  │   │   ┌─────┐    ┌─────┐      ┌─────┐       ┌─────┐            │ │  │
│  │   │   │ Get │───▶│EPUB │───▶  │Diff │───▶   │ R2  │            │ │  │
│  │   │   │Meta │    │Parse│      │Score│       │Store│            │ │  │
│  │   │   └─────┘    └─────┘      └─────┘       └─────┘            │ │  │
│  │   │      │           │            │             │               │ │  │
│  │   │      ▼           ▼            ▼             ▼               │ │  │
│  │   │   ┌─────┐    ┌─────┐      ┌─────┐       ┌─────┐            │ │  │
│  │   │   │Dedup│    │Clean│      │CEFR │       │Thumb│            │ │  │
│  │   │   │Check│    │ HTML│      │Level│       │ Gen │            │ │  │
│  │   │   └─────┘    └─────┘      └─────┘       └─────┘            │ │  │
│  │   │                                                              │ │  │
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                    │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │   │ EPUB Parser  │  │  Difficulty  │  │    Cover     │           │  │
│  │   │              │  │   Analyzer   │  │   Processor  │           │  │
│  │   │ • Metadata   │  │              │  │              │           │  │
│  │   │ • Chapters   │  │ • Flesch     │  │ • Download   │           │  │
│  │   │ • Content    │  │ • Syllables  │  │ • Resize     │           │  │
│  │   │ • ToC        │  │ • CEFR Map   │  │ • Compress   │           │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │                                                                    │  │
│  └───────────────────────────┬───────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Storage Layer                                 │  │
│  │                                                                    │  │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │  │
│  │   │   PostgreSQL     │  │  Cloudflare R2   │  │     Redis      │ │  │
│  │   │                  │  │                  │  │                │ │  │
│  │   │  • Book          │  │  • EPUB Files    │  │  • Job Queue   │ │  │
│  │   │  • Chapter       │  │  • Cover Images  │  │  • Progress    │ │  │
│  │   │  • Author        │  │  • Thumbnails    │  │  • Dedup Cache │ │  │
│  │   │  • ImportBatch   │  │                  │  │                │ │  │
│  │   └──────────────────┘  └──────────────────┘  └────────────────┘ │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 多环境架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Multi-Environment Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Environment Configuration                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│   │     LOCAL       │  │     STAGING     │  │   PRODUCTION    │        │
│   │                 │  │                 │  │                 │        │
│   │ DB: localhost   │  │ DB: staging-db  │  │ DB: prod-db     │        │
│   │     :5432       │  │     .readmigo   │  │     .readmigo   │        │
│   │                 │  │     .com:5432   │  │     .com:5432   │        │
│   │ R2: readmigo    │  │ R2: readmigo    │  │ R2: readmigo    │        │
│   │     -dev        │  │     -staging    │  │     -prod       │        │
│   │                 │  │                 │  │                 │        │
│   │ 用途:           │  │ 用途:           │  │ 用途:           │        │
│   │ • 本地开发      │  │ • 预发布测试    │  │ • 真实用户      │        │
│   │ • 功能测试      │  │ • 数据验证      │  │ • 正式数据      │        │
│   │ • 快速迭代      │  │ • 性能测试      │  │ • 需审批        │        │
│   │                 │  │                 │  │                 │        │
│   │ 权限: 开发者    │  │ 权限: 运营+开发 │  │ 权限: 仅管理员  │        │
│   │                 │  │                 │  │                 │        │
│   │ 确认: 无        │  │ 确认: 单次      │  │ 确认: 二次      │        │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                          │
│   环境变量配置:                                                          │
│   ├── .env.local         (本地环境，默认)                               │
│   ├── .env.staging       (Staging 环境)                                 │
│   └── .env.production    (生产环境，敏感信息通过 secrets 管理)           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据源设计

### 3.1 支持的书籍来源

| 来源 | 类型 | 数量 | 语言 | 特点 |
|------|------|------|------|------|
| Standard Ebooks | 公版书 | ~1,000 | 英语 | 高质量排版、精校文本 |
| Project Gutenberg | 公版书 | ~70,000 | 多语言 | 数量最大、覆盖广 |
| Gutenberg-ZH | 公版书 | ~500 | 中文 | 中文经典文学 |
| CTEXT | 古籍 | ~10,000 | 古文 | 中国古典文献 |
| Wikisource-ZH | 维基文库 | ~5,000 | 中文 | 现代中文作品 |

### 3.2 数据源适配器接口

```typescript
// types/book-source.ts

export interface BookSourceAdapter {
  /** 数据源唯一标识 */
  readonly sourceId: BookSource;

  /** 数据源名称 */
  readonly sourceName: string;

  /** 支持的语言 */
  readonly supportedLanguages: string[];

  /**
   * 获取书籍列表 (元数据)
   * @param options 分页和筛选选项
   * @returns 书籍元数据列表
   */
  fetchBookList(options?: FetchOptions): AsyncGenerator<BookMetadata>;

  /**
   * 获取单本书籍的 EPUB 内容
   * @param sourceBookId 数据源中的书籍ID
   * @returns EPUB 文件 Buffer
   */
  fetchBookContent(sourceBookId: string): Promise<Buffer>;

  /**
   * 获取书籍封面
   * @param sourceBookId 数据源中的书籍ID
   * @returns 封面图片 Buffer
   */
  fetchCover(sourceBookId: string): Promise<Buffer | null>;

  /**
   * 检查书籍是否已存在 (去重)
   * @param metadata 书籍元数据
   * @returns 是否已导入
   */
  checkExists(metadata: BookMetadata): Promise<boolean>;
}

export interface BookMetadata {
  sourceId: BookSource;
  sourceBookId: string;
  sourceUrl: string;

  title: string;
  author: string;
  authorBirthYear?: number;
  authorDeathYear?: number;

  language: string;
  languageVariant?: string;  // zh-Hans, zh-Hant, en-US, en-GB

  description?: string;
  subjects: string[];
  genres: string[];

  publishedYear?: number;
  wordCount?: number;
  pageCount?: number;

  coverUrl?: string;
  epubUrl: string;

  license?: string;
  rights?: string;
}

export interface FetchOptions {
  limit?: number;
  offset?: number;
  language?: string;
  afterDate?: Date;  // 增量导入: 只获取此日期之后更新的
}

export enum BookSource {
  STANDARD_EBOOKS = 'STANDARD_EBOOKS',
  GUTENBERG = 'GUTENBERG',
  GUTENBERG_ZH = 'GUTENBERG_ZH',
  CTEXT = 'CTEXT',
  WIKISOURCE_ZH = 'WIKISOURCE_ZH',
  USER_UPLOAD = 'USER_UPLOAD',
}
```

### 3.3 Standard Ebooks 适配器实现

```typescript
// sources/standard-ebooks.ts

import { BookSourceAdapter, BookMetadata, BookSource, FetchOptions } from '../types';

export class StandardEbooksAdapter implements BookSourceAdapter {
  readonly sourceId = BookSource.STANDARD_EBOOKS;
  readonly sourceName = 'Standard Ebooks';
  readonly supportedLanguages = ['en'];

  private readonly baseUrl = 'https://standardebooks.org';
  private readonly opdsUrl = 'https://standardebooks.org/opds';

  async *fetchBookList(options?: FetchOptions): AsyncGenerator<BookMetadata> {
    // 使用 OPDS feed 获取书籍列表
    const response = await fetch(`${this.opdsUrl}/all`);
    const xml = await response.text();
    const entries = this.parseOPDS(xml);

    let count = 0;
    for (const entry of entries) {
      if (options?.limit && count >= options.limit) break;

      const metadata = this.entryToMetadata(entry);

      // 增量检查
      if (options?.afterDate && metadata.publishedYear) {
        const bookDate = new Date(metadata.publishedYear, 0, 1);
        if (bookDate < options.afterDate) continue;
      }

      yield metadata;
      count++;
    }
  }

  async fetchBookContent(sourceBookId: string): Promise<Buffer> {
    // Standard Ebooks 的 URL 格式: /ebooks/{author}/{title}
    const epubUrl = `${this.baseUrl}/ebooks/${sourceBookId}/downloads/${this.getEpubFilename(sourceBookId)}`;

    const response = await fetch(epubUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch EPUB: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async fetchCover(sourceBookId: string): Promise<Buffer | null> {
    const coverUrl = `${this.baseUrl}/ebooks/${sourceBookId}/cover.jpg`;

    try {
      const response = await fetch(coverUrl);
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }

  async checkExists(metadata: BookMetadata): Promise<boolean> {
    // 通过 sourceId + sourceBookId 查询数据库
    const existing = await prisma.book.findFirst({
      where: {
        source: this.sourceId,
        sourceId: metadata.sourceBookId,
      },
    });
    return !!existing;
  }

  private parseOPDS(xml: string): OPDSEntry[] {
    // 解析 OPDS XML...
    // 返回书籍条目列表
  }

  private entryToMetadata(entry: OPDSEntry): BookMetadata {
    return {
      sourceId: this.sourceId,
      sourceBookId: entry.id,
      sourceUrl: entry.link,
      title: entry.title,
      author: entry.author,
      language: 'en',
      description: entry.summary,
      subjects: entry.subjects || [],
      genres: this.mapSubjectsToGenres(entry.subjects),
      epubUrl: entry.epubLink,
      coverUrl: entry.coverLink,
    };
  }

  private getEpubFilename(sourceBookId: string): string {
    // 生成 EPUB 文件名
    const slug = sourceBookId.replace(/\//g, '_');
    return `${slug}.epub`;
  }

  private mapSubjectsToGenres(subjects: string[]): string[] {
    // 将 Standard Ebooks 的 subjects 映射到内部分类
    const genreMap: Record<string, string> = {
      'Fiction': 'fiction',
      'Science Fiction': 'sci-fi',
      'Mystery': 'mystery',
      // ...
    };

    return subjects
      .map(s => genreMap[s])
      .filter(Boolean);
  }
}
```

### 3.4 Project Gutenberg 适配器

```typescript
// sources/gutenberg.ts

export class GutenbergAdapter implements BookSourceAdapter {
  readonly sourceId = BookSource.GUTENBERG;
  readonly sourceName = 'Project Gutenberg';
  readonly supportedLanguages = ['en', 'de', 'fr', 'es', 'it', 'pt', 'zh'];

  private readonly catalogUrl = 'https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2';
  private readonly mirrorUrl = 'https://www.gutenberg.org/ebooks';

  async *fetchBookList(options?: FetchOptions): AsyncGenerator<BookMetadata> {
    // Gutenberg 使用 RDF 目录
    // 1. 下载 RDF 目录压缩包
    // 2. 解压并解析每本书的 RDF 文件
    // 3. 转换为 BookMetadata

    const catalog = await this.loadCatalog();

    let count = 0;
    for (const rdf of catalog) {
      if (options?.limit && count >= options.limit) break;

      // 语言筛选
      if (options?.language && rdf.language !== options.language) continue;

      // 只导入有 EPUB 格式的书籍
      if (!rdf.hasEpub) continue;

      yield this.rdfToMetadata(rdf);
      count++;
    }
  }

  async fetchBookContent(sourceBookId: string): Promise<Buffer> {
    // Gutenberg EPUB URL 格式: /ebooks/{id}.epub.images
    const epubUrl = `${this.mirrorUrl}/${sourceBookId}.epub.images`;

    const response = await fetch(epubUrl);
    if (!response.ok) {
      // 尝试无图片版本
      const fallbackUrl = `${this.mirrorUrl}/${sourceBookId}.epub.noimages`;
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        throw new Error(`Failed to fetch EPUB: ${response.status}`);
      }
      return Buffer.from(await fallbackResponse.arrayBuffer());
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async fetchCover(sourceBookId: string): Promise<Buffer | null> {
    const coverUrl = `${this.mirrorUrl}/${sourceBookId}/cover.medium.jpg`;

    try {
      const response = await fetch(coverUrl);
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }
}
```

---

## 4. 导入流水线设计

### 4.1 导入流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Book Import Pipeline                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. FETCH PHASE (获取阶段)                                              │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   Source Adapter                                                 │   │
│   │        │                                                         │   │
│   │        ▼                                                         │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐                     │   │
│   │   │  Fetch  │───▶│  Dedup  │───▶│  Queue  │                     │   │
│   │   │  Meta   │    │  Check  │    │  Book   │                     │   │
│   │   └─────────┘    └─────────┘    └─────────┘                     │   │
│   │                       │                                          │   │
│   │                       ▼                                          │   │
│   │                  Skip if exists                                  │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│   2. DOWNLOAD PHASE (下载阶段)                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐                     │   │
│   │   │Download │───▶│Download │───▶│  Temp   │                     │   │
│   │   │  EPUB   │    │  Cover  │    │ Storage │                     │   │
│   │   └─────────┘    └─────────┘    └─────────┘                     │   │
│   │        │              │                                          │   │
│   │        ▼              ▼                                          │   │
│   │   Retry on        Generate                                       │   │
│   │   failure        placeholder                                     │   │
│   │                  if missing                                      │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│   3. PARSE PHASE (解析阶段)                                              │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │   │
│   │   │  Parse  │───▶│ Extract │───▶│  Clean  │───▶│ Extract │     │   │
│   │   │  EPUB   │    │ Chapters│    │  HTML   │    │   ToC   │     │   │
│   │   └─────────┘    └─────────┘    └─────────┘    └─────────┘     │   │
│   │        │              │              │              │           │   │
│   │        ▼              ▼              ▼              ▼           │   │
│   │   Metadata      Chapter[]       Clean Text      Navigation      │   │
│   │   validation    extraction      content         structure       │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│   4. ANALYZE PHASE (分析阶段)                                            │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │   │
│   │   │ Count   │───▶│ Flesch  │───▶│  CEFR   │───▶│  Auto   │     │   │
│   │   │ Words   │    │  Score  │    │  Level  │    │Category │     │   │
│   │   └─────────┘    └─────────┘    └─────────┘    └─────────┘     │   │
│   │        │              │              │              │           │   │
│   │        ▼              ▼              ▼              ▼           │   │
│   │   wordCount    difficultyScore  cefrLevel    categories[]       │   │
│   │   charCount       (0-100)        (A1-C2)                        │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│   5. UPLOAD PHASE (上传阶段)                                             │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐                     │   │
│   │   │ Upload  │───▶│ Upload  │───▶│Generate │                     │   │
│   │   │  EPUB   │    │  Cover  │    │ Thumb   │                     │   │
│   │   └─────────┘    └─────────┘    └─────────┘                     │   │
│   │        │              │              │                           │   │
│   │        ▼              ▼              ▼                           │   │
│   │   R2: /books/    R2: /covers/   R2: /thumbs/                    │   │
│   │   {id}.epub      {id}.jpg       {id}.jpg                        │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│   6. SAVE PHASE (保存阶段)                                               │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │   │
│   │   │ Create  │───▶│ Create  │───▶│  Link   │───▶│  Log    │     │   │
│   │   │  Book   │    │Chapters │    │Category │    │ Import  │     │   │
│   │   └─────────┘    └─────────┘    └─────────┘    └─────────┘     │   │
│   │        │              │              │              │           │   │
│   │        ▼              ▼              ▼              ▼           │   │
│   │   PostgreSQL    PostgreSQL    BookCategory    ImportLog         │   │
│   │   Book table    Chapter tbl   join table                        │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 导入任务管理

```typescript
// pipeline/import-manager.ts

export interface ImportBatch {
  id: string;
  source: BookSource;
  environment: Environment;

  status: ImportStatus;
  startedAt: Date;
  completedAt?: Date;

  totalBooks: number;
  processedBooks: number;
  successBooks: number;
  failedBooks: number;
  skippedBooks: number;  // 已存在的

  errors: ImportError[];

  createdBy?: string;
}

export interface ImportProgress {
  batchId: string;
  current: number;
  total: number;
  currentBook?: string;
  phase: ImportPhase;
  eta?: number;  // 预计剩余秒数
}

export enum ImportStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ImportPhase {
  FETCHING = 'FETCHING',
  DOWNLOADING = 'DOWNLOADING',
  PARSING = 'PARSING',
  ANALYZING = 'ANALYZING',
  UPLOADING = 'UPLOADING',
  SAVING = 'SAVING',
}

export class ImportManager {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private storage: StorageService,
  ) {}

  /**
   * 开始导入批次
   */
  async startBatch(options: StartBatchOptions): Promise<ImportBatch> {
    const batch: ImportBatch = {
      id: ulid(),
      source: options.source,
      environment: options.environment,
      status: ImportStatus.RUNNING,
      startedAt: new Date(),
      totalBooks: 0,
      processedBooks: 0,
      successBooks: 0,
      failedBooks: 0,
      skippedBooks: 0,
      errors: [],
    };

    // 保存批次信息
    await this.saveBatch(batch);

    // 获取数据源适配器
    const adapter = this.getAdapter(options.source);

    // 开始导入
    try {
      for await (const metadata of adapter.fetchBookList(options)) {
        batch.totalBooks++;

        // 更新进度
        await this.updateProgress(batch.id, {
          current: batch.processedBooks,
          total: batch.totalBooks,
          currentBook: metadata.title,
          phase: ImportPhase.FETCHING,
        });

        try {
          // 检查是否已存在
          if (await adapter.checkExists(metadata)) {
            batch.skippedBooks++;
            batch.processedBooks++;
            continue;
          }

          // 执行导入流水线
          await this.importBook(metadata, adapter, batch);
          batch.successBooks++;

        } catch (error) {
          batch.failedBooks++;
          batch.errors.push({
            bookId: metadata.sourceBookId,
            title: metadata.title,
            error: error.message,
            phase: this.currentPhase,
          });

          // 检查是否应该停止
          if (batch.failedBooks > options.maxErrors) {
            throw new Error('Too many errors, stopping import');
          }
        }

        batch.processedBooks++;
        await this.saveBatch(batch);

        // 检查是否达到限制
        if (options.limit && batch.processedBooks >= options.limit) {
          break;
        }
      }

      batch.status = ImportStatus.COMPLETED;
      batch.completedAt = new Date();

    } catch (error) {
      batch.status = ImportStatus.FAILED;
      batch.errors.push({
        error: error.message,
        phase: 'BATCH',
      });
    }

    await this.saveBatch(batch);
    return batch;
  }

  /**
   * 导入单本书籍
   */
  private async importBook(
    metadata: BookMetadata,
    adapter: BookSourceAdapter,
    batch: ImportBatch,
  ): Promise<void> {
    // 1. 下载 EPUB
    this.currentPhase = ImportPhase.DOWNLOADING;
    const epubBuffer = await adapter.fetchBookContent(metadata.sourceBookId);
    const coverBuffer = await adapter.fetchCover(metadata.sourceBookId);

    // 2. 解析 EPUB
    this.currentPhase = ImportPhase.PARSING;
    const parsed = await this.epubParser.parse(epubBuffer);

    // 3. 分析难度
    this.currentPhase = ImportPhase.ANALYZING;
    const analysis = await this.difficultyAnalyzer.analyze(parsed.content, metadata.language);

    // 4. 上传文件
    this.currentPhase = ImportPhase.UPLOADING;
    const bookId = ulid();
    const epubUrl = await this.storage.upload(`books/${bookId}.epub`, epubBuffer);
    const coverUrl = coverBuffer
      ? await this.uploadCover(bookId, coverBuffer)
      : null;

    // 5. 保存到数据库
    this.currentPhase = ImportPhase.SAVING;
    await this.prisma.$transaction(async (tx) => {
      // 创建书籍
      const book = await tx.book.create({
        data: {
          id: bookId,
          title: metadata.title,
          author: metadata.author,
          description: metadata.description,
          language: metadata.language,
          languageVariant: metadata.languageVariant,

          source: metadata.sourceId,
          sourceId: metadata.sourceBookId,
          sourceUrl: metadata.sourceUrl,

          epubUrl,
          coverUrl,
          coverThumbUrl: coverUrl ? this.getThumbUrl(coverUrl) : null,

          wordCount: analysis.wordCount,
          characterCount: analysis.characterCount,
          difficultyScore: analysis.difficultyScore,
          fleschScore: analysis.fleschScore,
          cefrLevel: analysis.cefrLevel,

          subjects: metadata.subjects,
          genres: metadata.genres,

          status: 'PENDING',  // 待审核
          importBatchId: batch.id,
        },
      });

      // 创建章节
      for (const chapter of parsed.chapters) {
        await tx.chapter.create({
          data: {
            bookId: book.id,
            order: chapter.order,
            title: chapter.title,
            href: chapter.href,
            content: chapter.content,
            wordCount: chapter.wordCount,
          },
        });
      }

      // 关联分类
      if (metadata.genres.length > 0) {
        await this.linkCategories(tx, book.id, metadata.genres);
      }
    });
  }

  /**
   * 上传封面并生成缩略图
   */
  private async uploadCover(bookId: string, coverBuffer: Buffer): Promise<string> {
    // 处理封面图片
    const processed = await sharp(coverBuffer)
      .resize(400, 600, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    // 生成缩略图
    const thumb = await sharp(coverBuffer)
      .resize(120, 180, { fit: 'cover' })
      .jpeg({ quality: 75 })
      .toBuffer();

    // 上传
    const coverUrl = await this.storage.upload(`covers/${bookId}.jpg`, processed);
    await this.storage.upload(`thumbs/${bookId}.jpg`, thumb);

    return coverUrl;
  }

  /**
   * 获取导入进度
   */
  async getProgress(batchId: string): Promise<ImportProgress | null> {
    const data = await this.redis.hgetall(`import:progress:${batchId}`);
    if (!data) return null;

    return {
      batchId,
      current: parseInt(data.current || '0'),
      total: parseInt(data.total || '0'),
      currentBook: data.currentBook,
      phase: data.phase as ImportPhase,
      eta: data.eta ? parseInt(data.eta) : undefined,
    };
  }

  /**
   * 暂停导入
   */
  async pauseBatch(batchId: string): Promise<void> {
    // 设置暂停标志
    await this.redis.set(`import:pause:${batchId}`, '1');
  }

  /**
   * 回滚批次
   */
  async rollbackBatch(batchId: string): Promise<void> {
    const batch = await this.getBatch(batchId);
    if (!batch) throw new Error('Batch not found');

    // 获取该批次导入的书籍
    const books = await this.prisma.book.findMany({
      where: { importBatchId: batchId },
      select: { id: true, epubUrl: true, coverUrl: true },
    });

    // 删除文件
    for (const book of books) {
      await this.storage.delete(book.epubUrl);
      if (book.coverUrl) {
        await this.storage.delete(book.coverUrl);
        await this.storage.delete(this.getThumbUrl(book.coverUrl));
      }
    }

    // 删除数据库记录
    await this.prisma.$transaction([
      this.prisma.chapter.deleteMany({ where: { book: { importBatchId: batchId } } }),
      this.prisma.bookCategory.deleteMany({ where: { book: { importBatchId: batchId } } }),
      this.prisma.book.deleteMany({ where: { importBatchId: batchId } }),
    ]);

    // 更新批次状态
    await this.updateBatchStatus(batchId, ImportStatus.CANCELLED);
  }
}
```

---

## 5. 难度分析系统

### 5.1 英文难度分析

```typescript
// processors/difficulty-analyzer.ts

export interface DifficultyAnalysis {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  syllableCount: number;

  averageWordLength: number;
  averageSentenceLength: number;
  averageSyllablesPerWord: number;

  fleschReadingEase: number;    // 0-100, 越高越易读
  fleschKincaidGrade: number;   // 美国年级水平
  difficultyScore: number;       // 0-100, 标准化难度分数
  cefrLevel: CEFRLevel;          // A1-C2
}

export class EnglishDifficultyAnalyzer {
  /**
   * 分析文本难度
   */
  analyze(text: string): DifficultyAnalysis {
    const words = this.tokenizeWords(text);
    const sentences = this.tokenizeSentences(text);
    const syllables = words.map(w => this.countSyllables(w));

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const syllableCount = syllables.reduce((a, b) => a + b, 0);
    const characterCount = text.replace(/\s/g, '').length;

    const avgWordLength = characterCount / wordCount;
    const avgSentenceLength = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;

    // Flesch Reading Ease
    const fleschReadingEase = 206.835
      - (1.015 * avgSentenceLength)
      - (84.6 * avgSyllablesPerWord);

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * avgSentenceLength)
      + (11.8 * avgSyllablesPerWord)
      - 15.59;

    // 标准化难度分数 (0-100)
    const difficultyScore = this.normalizeDifficulty(fleschReadingEase);

    // 映射到 CEFR 等级
    const cefrLevel = this.mapToCEFR(fleschReadingEase, avgWordLength);

    return {
      wordCount,
      characterCount,
      sentenceCount,
      syllableCount,
      averageWordLength: avgWordLength,
      averageSentenceLength: avgSentenceLength,
      averageSyllablesPerWord: avgSyllablesPerWord,
      fleschReadingEase,
      fleschKincaidGrade,
      difficultyScore,
      cefrLevel,
    };
  }

  /**
   * 计算音节数
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    // 基于元音计数的简化算法
    const vowels = word.match(/[aeiouy]+/g) || [];
    let count = vowels.length;

    // 调整规则
    if (word.endsWith('e') && !word.endsWith('le')) count--;
    if (word.endsWith('es') || word.endsWith('ed')) count--;
    if (count === 0) count = 1;

    return count;
  }

  /**
   * 标准化难度分数
   */
  private normalizeDifficulty(fleschScore: number): number {
    // Flesch 0-30 (很难) -> 难度 70-100
    // Flesch 30-50 (难) -> 难度 50-70
    // Flesch 50-60 (中等偏难) -> 难度 40-50
    // Flesch 60-70 (标准) -> 难度 30-40
    // Flesch 70-80 (较易) -> 难度 20-30
    // Flesch 80-90 (易) -> 难度 10-20
    // Flesch 90-100 (很易) -> 难度 0-10

    const clamped = Math.max(0, Math.min(100, fleschScore));
    return Math.round(100 - clamped);
  }

  /**
   * 映射到 CEFR 等级
   */
  private mapToCEFR(fleschScore: number, avgWordLength: number): CEFRLevel {
    // 综合考虑可读性和词汇复杂度
    if (fleschScore >= 90) return 'A1';
    if (fleschScore >= 80) return 'A2';
    if (fleschScore >= 70) return 'B1';
    if (fleschScore >= 60) return 'B2';
    if (fleschScore >= 50) return 'C1';
    return 'C2';
  }
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
```

### 5.2 中文难度分析

```typescript
// processors/chinese-difficulty-analyzer.ts

export class ChineseDifficultyAnalyzer {
  private jieba: NodeJieba;
  private hskVocab: Map<string, number>;  // 词 -> HSK等级 (1-6)

  constructor() {
    this.jieba = require('nodejieba');
    this.hskVocab = this.loadHSKVocabulary();
  }

  analyze(text: string): ChineseDifficultyAnalysis {
    // 分词
    const words = this.jieba.cut(text);
    const characters = text.replace(/\s/g, '').split('');

    // 统计
    const wordCount = words.length;
    const characterCount = characters.length;
    const uniqueCharacters = new Set(characters).size;

    // HSK 等级分析
    const hskDistribution = this.analyzeHSKDistribution(words);
    const averageHSK = this.calculateAverageHSK(hskDistribution);

    // 句子复杂度
    const sentences = this.splitSentences(text);
    const avgSentenceLength = characterCount / sentences.length;

    // 难度分数
    const difficultyScore = this.calculateDifficulty(
      averageHSK,
      avgSentenceLength,
      uniqueCharacters / characterCount,
    );

    // HSK 等级
    const hskLevel = this.mapToHSK(difficultyScore);

    return {
      wordCount,
      characterCount,
      uniqueCharacters,
      sentenceCount: sentences.length,
      averageSentenceLength: avgSentenceLength,
      hskDistribution,
      averageHSK,
      difficultyScore,
      hskLevel,
    };
  }

  private analyzeHSKDistribution(words: string[]): Record<number, number> {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

    for (const word of words) {
      const level = this.hskVocab.get(word) || 7;  // 7 = 超纲
      distribution[level]++;
    }

    return distribution;
  }

  private calculateAverageHSK(distribution: Record<number, number>): number {
    let total = 0;
    let count = 0;

    for (const [level, num] of Object.entries(distribution)) {
      total += parseInt(level) * num;
      count += num;
    }

    return count > 0 ? total / count : 1;
  }

  private mapToHSK(difficultyScore: number): number {
    if (difficultyScore <= 15) return 1;
    if (difficultyScore <= 30) return 2;
    if (difficultyScore <= 45) return 3;
    if (difficultyScore <= 60) return 4;
    if (difficultyScore <= 75) return 5;
    if (difficultyScore <= 90) return 6;
    return 7;  // 超纲/古文
  }
}
```

---

## 6. CLI 脚本设计

### 6.1 主脚本结构

```bash
scripts/
├── book-import.sh           # 主入口脚本 (Shell)
├── book-ingestion/          # TypeScript 导入代码
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                 # 默认配置
│   ├── .env.local           # 本地环境
│   ├── .env.staging         # Staging 环境
│   ├── .env.production      # 生产环境
│   │
│   ├── pipeline.ts          # 导入流水线入口
│   ├── pipeline-chinese.ts  # 中文书籍导入
│   │
│   ├── sources/             # 数据源适配器
│   │   ├── standard-ebooks.ts
│   │   ├── gutenberg.ts
│   │   ├── gutenberg-zh.ts
│   │   ├── ctext.ts
│   │   └── wikisource-zh.ts
│   │
│   ├── processors/          # 处理器
│   │   ├── epub-parser.ts
│   │   ├── html-cleaner.ts
│   │   ├── difficulty-analyzer.ts
│   │   ├── chinese-difficulty-analyzer.ts
│   │   └── cover-processor.ts
│   │
│   └── utils/
│       ├── storage.ts
│       ├── logger.ts
│       └── progress.ts
```

### 6.2 环境配置文件

```env
# .env.local

# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/readmigo?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=readmigo-dev
R2_PUBLIC_URL=https://cdn-dev.readmigo.app

# 导入配置
IMPORT_BATCH_SIZE=100
IMPORT_CONCURRENCY=5
IMPORT_RETRY_COUNT=3
IMPORT_TIMEOUT=30000

# 日志
LOG_LEVEL=debug
LOG_FILE=.logs/book-import.log
```

```env
# .env.production (敏感信息通过 CI/CD secrets 注入)

# 数据库
DATABASE_URL=${PROD_DATABASE_URL}

# Redis
REDIS_URL=${PROD_REDIS_URL}

# Cloudflare R2
R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
R2_BUCKET_NAME=readmigo-prod
R2_PUBLIC_URL=https://cdn.readmigo.app

# 导入配置 (生产环境更保守)
IMPORT_BATCH_SIZE=50
IMPORT_CONCURRENCY=3
IMPORT_RETRY_COUNT=5
IMPORT_TIMEOUT=60000

# 日志
LOG_LEVEL=info
```

### 6.3 使用示例

```bash
# 1. 本地环境 - 导入 Standard Ebooks 前 100 本
./scripts/book-import.sh --standard --limit=100

# 2. 本地环境 - 导入所有 Gutenberg 英文书
./scripts/book-import.sh --gutenberg

# 3. Staging 环境 - 预览导入 (不实际写入)
./scripts/book-import.sh --env=staging --all --dry-run

# 4. Staging 环境 - 导入中文书籍
./scripts/book-import.sh --env=staging --chinese

# 5. 生产环境 - 导入 (需二次确认)
./scripts/book-import.sh --env=production --standard

# 6. 查看当前统计
./scripts/book-import.sh --stats

# 7. 查看导入历史
./scripts/book-import.sh --history

# 8. 回滚最近一次导入
./scripts/book-import.sh --rollback --batch-id=xxx
```

---

## 7. 数据模型

### 7.1 Prisma Schema 扩展

```prisma
// 导入批次记录
model ImportBatch {
  id              String        @id @default(uuid())

  source          BookSource
  environment     String        @default("local")

  status          ImportStatus  @default(PENDING)
  startedAt       DateTime      @default(now())
  completedAt     DateTime?

  totalBooks      Int           @default(0)
  processedBooks  Int           @default(0)
  successBooks    Int           @default(0)
  failedBooks     Int           @default(0)
  skippedBooks    Int           @default(0)

  errors          Json?         // ImportError[]

  createdBy       String?
  notes           String?

  books           Book[]

  @@index([source, status])
  @@index([startedAt])
  @@map("import_batches")
}

enum ImportStatus {
  PENDING
  RUNNING
  PAUSED
  COMPLETED
  FAILED
  CANCELLED
}

// Book 表扩展字段
model Book {
  // ... 现有字段

  // 导入来源
  source          BookSource?
  sourceId        String?       @map("source_id")
  sourceUrl       String?       @map("source_url")

  // 导入批次
  importBatchId   String?       @map("import_batch_id")
  importBatch     ImportBatch?  @relation(fields: [importBatchId], references: [id])
  importedAt      DateTime?     @map("imported_at")

  // 去重索引
  @@unique([source, sourceId])
  @@index([importBatchId])
}

enum BookSource {
  STANDARD_EBOOKS
  GUTENBERG
  GUTENBERG_ZH
  CTEXT
  WIKISOURCE_ZH
  USER_UPLOAD
}
```

---

## 8. 监控与告警

### 8.1 导入监控指标

```typescript
// 监控指标
interface ImportMetrics {
  // 性能指标
  booksPerMinute: number;
  averageProcessTime: number;  // ms per book
  downloadSpeed: number;       // bytes/s
  uploadSpeed: number;         // bytes/s

  // 质量指标
  successRate: number;         // 成功率
  duplicateRate: number;       // 重复率
  errorRate: number;           // 错误率

  // 资源指标
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

// 告警规则
const alertRules = [
  {
    name: 'high_error_rate',
    condition: 'errorRate > 10%',
    severity: 'warning',
    action: 'pause_import',
  },
  {
    name: 'very_high_error_rate',
    condition: 'errorRate > 25%',
    severity: 'critical',
    action: 'stop_import_and_notify',
  },
  {
    name: 'slow_import',
    condition: 'booksPerMinute < 5',
    severity: 'warning',
    action: 'notify_ops',
  },
];
```

### 8.2 日志格式

```typescript
// 导入日志格式
interface ImportLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  batchId: string;
  phase: ImportPhase;
  bookId?: string;
  bookTitle?: string;
  message: string;
  details?: any;
  duration?: number;
}

// 日志示例
// 2025-01-15 10:30:00 [INFO] [batch-123] [DOWNLOADING] Downloading "Pride and Prejudice"...
// 2025-01-15 10:30:05 [INFO] [batch-123] [PARSING] Parsing EPUB (245KB)...
// 2025-01-15 10:30:08 [INFO] [batch-123] [ANALYZING] Difficulty: 45, CEFR: B1
// 2025-01-15 10:30:10 [INFO] [batch-123] [SAVING] Saved book-456 with 32 chapters
```

---

## 9. 安全考虑

### 9.1 环境隔离

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Security Boundaries                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   LOCAL                    STAGING                  PRODUCTION          │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐      │
│   │ 开发者机器   │         │ 内部服务器   │         │ 云服务器     │      │
│   │             │         │             │         │             │      │
│   │ ✅ 无限制   │ ──X──▶ │ ✅ VPN访问  │ ──X──▶ │ ✅ 需审批   │      │
│   │             │         │ ✅ 日志记录 │         │ ✅ MFA验证  │      │
│   │             │         │             │         │ ✅ 审计日志 │      │
│   └─────────────┘         └─────────────┘         └─────────────┘      │
│                                                                          │
│   防护措施:                                                              │
│   ├── 环境变量不含敏感信息 (通过 secrets 注入)                            │
│   ├── 生产环境需要 2FA 和明确授权                                        │
│   ├── 所有导入操作记录到审计日志                                         │
│   ├── 支持批次回滚                                                       │
│   └── 自动备份导入前的数据库快照                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 访问控制

```typescript
// 环境访问控制
const environmentAccess: Record<Environment, AccessControl> = {
  local: {
    requiredRole: 'developer',
    requiresApproval: false,
    requiresMFA: false,
    maxBatchSize: Infinity,
  },
  staging: {
    requiredRole: 'developer',
    requiresApproval: false,
    requiresMFA: false,
    maxBatchSize: 10000,
  },
  production: {
    requiredRole: 'admin',
    requiresApproval: true,
    requiresMFA: true,
    maxBatchSize: 1000,
    requiresBackup: true,
  },
};
```

---

## 10. 实施计划

### Phase 1: 基础框架 ✅ COMPLETED

- [x] CLI 脚本框架搭建 (`pipeline.ts`, `pipeline-chinese.ts`)
- [x] 环境配置管理 (`.env` 文件)
- [x] 数据库 Schema 扩展 (Book, Chapter, Author 模型)
- [x] 日志系统 (console 日志)

### Phase 2: 核心导入 ✅ COMPLETED

- [x] Standard Ebooks 适配器 (`sources/standard-ebooks.ts`)
- [x] EPUB 解析器 (`processors/epub-parser.ts`)
- [x] 封面处理器 (integrated in adapter)
- [x] R2 存储集成 (EPUB, covers, thumbnails)

### Phase 3: 难度分析 ✅ COMPLETED

- [x] 英文难度分析器 (`processors/difficulty-analyzer.ts`)
- [x] Flesch Reading Ease & Flesch-Kincaid Grade
- [x] 1-10 难度等级映射
- [x] 中文难度分析器 (`processors/chinese-difficulty-analyzer.ts`)

### Phase 4: 扩展数据源 ✅ MOSTLY COMPLETED

- [x] Project Gutenberg 适配器 (`sources/gutenberg.ts`)
- [x] Gutenberg-ZH 中文适配器 (`sources/gutenberg-zh.ts`)
- [x] LibriVox 有声书适配器 (`sources/librivox.ts`)
- [ ] CTEXT 古籍数据源 (框架已建立)
- [ ] Wikisource-ZH 数据源 (框架已建立)

### Phase 5: 运维功能 🚧 IN PROGRESS

- [ ] 批次管理和回滚功能 (设计完成，待实现)
- [ ] 监控和告警系统
- [ ] Dashboard 集成

---

## 11. 待确认事项

1. **导入审核流程**: 导入的书籍是否需要人工审核才能上架？
2. **封面缺失处理**: 无封面书籍是否自动生成占位图？
3. **分类映射规则**: 各数据源的分类如何统一映射？
4. **增量导入频率**: 是否需要定时任务自动拉取新书？
5. **存储成本**: R2 存储的预算和清理策略？

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.3 | ✅ 运维完成 | **95%** | 2025-12-28 | 核心导入+批次管理+监控告警+Dashboard完成 |

### 已完成 ✅

**架构与设计**
- [x] 系统整体架构设计
- [x] 多环境隔离架构设计（Local/Staging/Production）
- [x] 数据源适配器接口设计
- [x] 导入流水线6个阶段设计
- [x] Prisma Schema (Book, Chapter, Author 模型)

**核心导入功能**
- [x] CLI 脚本主入口 (`pipeline.ts`, `pipeline-chinese.ts`)
- [x] EPUB 解析器 (`processors/epub-parser.ts`) - JSDOM + AdmZip
- [x] HTML 清理器 (`processors/html-cleaner.ts`)
- [x] Cloudflare R2 存储集成 (EPUB, covers, thumbnails)

**难度分析**
- [x] 英文难度分析器 (`processors/difficulty-analyzer.ts`)
  - Flesch Reading Ease
  - Flesch-Kincaid Grade Level
  - 1-10 难度等级映射
- [x] 中文难度分析器 (`processors/chinese-difficulty-analyzer.ts`)
  - HSK 词汇等级分析
  - 句子复杂度分析

**数据源适配器**
- [x] Standard Ebooks (`sources/standard-ebooks.ts`) - Web scraping 实现
- [x] Project Gutenberg (`sources/gutenberg.ts`) - 完整实现
- [x] Gutenberg-ZH (`sources/gutenberg-zh.ts`) - 中文书籍
- [x] LibriVox (`sources/librivox.ts`) - 有声书源

**辅助脚本**
- [x] 封面更新脚本 (`standard-ebooks-update-covers.ts`, `gutenberg-update-covers.ts`)
- [x] 作者导入 (`import-authors.ts`, `import-top100-authors.ts`)
- [x] 作者去重 (`deduplicate-authors.ts`)
- [x] 有声书 R2 同步 (`sync-audiobook-r2.ts`)
- [x] EPUB 下载修复脚本 (`download-missing-epubs.ts`, `fix-single-book.ts`)

**中文数据源适配器** (已完成)
- [x] CTEXT 古籍数据源 (`sources/ctext.ts`) - CText API 集成，含 12 部核心古籍
- [x] Wikisource-ZH 数据源 (`sources/wikisource-zh.ts`) - MediaWiki API 集成，含四大名著等

**批次管理功能** (已完成)
- [x] ImportBatch 批次管理数据库模型 (Prisma schema)
- [x] 批次导入历史查询 API (`GET /admin/import/batches`)
- [x] 批次统计信息 API (`GET /admin/import/batches/stats`)
- [x] 批次回滚功能 (`DELETE /admin/import/batches/:id/rollback`)
- [x] 批次状态管理 (start/complete/cancel)

**监控告警功能** (已完成)
- [x] 导入监控服务 (`import-monitoring.service.ts`)
- [x] 导入指标 API (`GET /admin/import/monitoring/metrics`)
- [x] 告警规则引擎 (`GET /admin/import/monitoring/alerts`)
- [x] 健康状态 API (`GET /admin/import/monitoring/health`)
- [x] 活动摘要 API (`GET /admin/import/monitoring/activity`)
- [x] Dashboard 监控面板 (Import Batches > Monitoring tab)

### 待开发 📝

**运维功能**
- [x] 导入监控和告警 (Metrics, Alerts, Health Status API)
- [x] Dashboard 书籍管理界面集成 (Import Batch Management + Monitoring UI)

**增强功能**
- [x] 增量导入 API (`GET /admin/import/incremental`, `GET /admin/import/should-import`)
- [ ] 并发控制 (IMPORT_CONCURRENCY)
- [ ] 断点续传
- [ ] CEFR 等级自动映射
- [ ] 自动分类标注

### 依赖项状态

| 依赖 | 状态 | 说明 |
|------|------|------|
| Cloudflare R2 | ✅ | 已配置，用于存储 EPUB 和封面 |
| PostgreSQL | ✅ | 已部署，存储书籍元数据 |
| Prisma ORM | ✅ | 已配置，数据库访问层 |
| Redis | 📝 | 可选，用于任务队列 |
| Dashboard | 📝 | 待开发，书籍管理界面 |

### 技术债务

| 项目 | 优先级 | 说明 |
|------|--------|------|
| 增量导入 | 中 | 支持只导入新书籍 |
| 并发控制 | 低 | 控制同时处理的书籍数量 |
| 断点续传 | 低 | 导入中断后恢复 |
| 导入测试 | 中 | 添加单元测试和集成测试 |
