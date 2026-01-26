# Project Gutenberg 调研文档

## 概述

[Project Gutenberg](https://www.gutenberg.org/) 是全球最古老的数字图书馆，拥有超过 **76,000+ 本免费电子书**，主要为公共领域作品。本产品的主要书籍来源来自此网站。

---

## 1. API 与客户端

### 官方支持情况

**Project Gutenberg 没有官方 API**。官网仅提供以下数据获取方式：

| 方式 | 描述 | URL |
|------|------|-----|
| RSS Feed | 每日更新的新书列表 | `http://www.gutenberg.org/cache/epub/feeds/today.rss` |
| OPDS Feed | 机器可读的图书发现协议 | `https://www.gutenberg.org/ebooks/search.opds/` |
| RDF Catalog | 完整目录的 XML/RDF 元数据 | `https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2` |
| MARC Records | 图书馆标准格式的元数据 | 通过 Free Ebook Foundation 提供 |

### 第三方 API 方案

| API | 描述 | 特点 | URL |
|-----|------|------|-----|
| **Gutendex** | 最流行的开源方案 | Django 实现、无需 API Key、可自托管 | [gutendex.com](https://gutendex.com/) |
| **gutenberg_api** | RESTful API | 需自托管 | [GitHub](https://github.com/GnikDroy/gutenberg_api) |
| **RapidAPI 版本** | 商业 API | 付费、响应快 (<200ms) | [RapidAPI](https://rapidapi.com/rabahdjebbes6-VpFXFzqdF1R/api/project-gutenberg-api) |

### 推荐方案：Gutendex API

```
Base URL: https://gutendex.com/
```

#### 主要端点

| 端点 | 描述 |
|------|------|
| `/books` | 获取书籍列表（分页，每页32本） |
| `/books/<id>` | 获取单本书籍详情 |

#### 查询参数

| 参数 | 描述 | 示例 |
|------|------|------|
| `search` | 搜索标题/作者 | `?search=dickens` |
| `languages` | 按语言过滤 | `?languages=en,fr` |
| `topic` | 按主题/分类过滤 | `?topic=children` |
| `sort` | 排序方式 | `popular` (默认) / `ascending` / `descending` |
| `author_year_start/end` | 按作者年代过滤 | `?author_year_start=1800&author_year_end=1900` |
| `copyright` | 版权状态 | `true` / `false` / `null` |
| `ids` | 指定多个ID | `?ids=11,84,1342` |
| `mime_type` | 文件格式 | `?mime_type=text/html` |

#### 响应数据结构

```json
{
  "count": 72345,
  "next": "https://gutendex.com/books/?page=2",
  "previous": null,
  "results": [
    {
      "id": 84,
      "title": "Frankenstein; Or, The Modern Prometheus",
      "authors": [
        {
          "name": "Shelley, Mary Wollstonecraft",
          "birth_year": 1797,
          "death_year": 1851
        }
      ],
      "subjects": ["Frankenstein's monster (Fictitious character) -- Fiction"],
      "bookshelves": ["Gothic Fiction", "Science Fiction"],
      "languages": ["en"],
      "copyright": false,
      "media_type": "Text",
      "formats": {
        "application/epub+zip": "https://...",
        "text/html": "https://..."
      },
      "download_count": 116037
    }
  ]
}
```

---

## 2. 分类体系 (Bookshelves)

Project Gutenberg 使用 **Bookshelves** 来组织书籍，由志愿者手工策划。

### 主要分类

| 大类 | 子分类 |
|------|--------|
| **Fiction** | Adventure, Fantasy, Horror, Western, Historical, Gothic, Romantic, General Fiction |
| **Children's Content** | Fiction, Literature, Picture Books, Mythology/Fairy Tales, Verse, Religion, Instructional |
| **Crime** | Detective and Mystery Fiction, Crime Nonfiction |
| **Science** | Astronomy, Biology, Botany, Chemistry, Ecology, Geology, Mathematics, Physics, Zoology |
| **Social Sciences** | Anarchism, Racism, Slavery, Sociology, Suffrage, Transportation |
| **Countries** | Africa, Argentina, Australia, Canada, France, Germany, Greece, India, Italy, UK, USA |
| **Technology** | Cookbooks, Crafts, Engineering, Manufacturing, Woodwork |
| **Arts** | Music, Poetry, Plays, Drama |
| **Other** | Philosophy, Religion, Biography, Travel, Reference, Wars, Law, Education |

### 对应 Discover Tab 的分类建议

```
推荐分类映射:
├── Popular Now (热门)     → Gutendex sort=popular
├── Categories (类别)
│   ├── Fiction           → topic=fiction
│   ├── Mystery           → topic=detective OR topic=mystery
│   ├── Romance           → topic=romance
│   ├── Sci-Fi            → topic=science fiction
│   ├── Fantasy           → topic=fantasy OR topic=fairy tales
│   ├── Horror            → topic=horror OR topic=gothic
│   ├── Adventure         → topic=adventure
│   ├── Children's        → topic=children
│   └── Classics          → topic=best books ever listings
├── Popular Authors (热门作者)  → 通过 Top 100 Authors 获取
└── Audio Books (有声书)   → LibriVox 或 AI 生成有声书
```

---

## 3. 热门排行榜

### Top 100 页面

| 类型 | URL | 时间范围 |
|------|-----|----------|
| Top 100 EBooks | `/browse/scores/top` | Yesterday / 7 days / 30 days |
| Top 100 Authors | `/browse/scores/top` | Yesterday / 7 days / 30 days |
| Top 1000 EBooks | `/browse/scores/top1000.php` | 30 days |
| 多语言 Top 100 | `/browse/scores/top-{lang}.php` | en, de, fr, es, etc. |

### 当前热门作者 (30天下载量)

| 排名 | 作者 | 下载量 |
|------|------|--------|
| 1 | T. Smollett (Tobias) | 136,942 |
| 2 | L. M. Montgomery | 131,197 |
| 3 | L. Frank Baum | 125,330 |
| 4 | H. G. Wells | 114,749 |
| 5 | Robert W. Chambers | 99,919 |
| 6 | G. K. Chesterton | 92,157 |
| 7 | E. M. Forster | 75,988 |
| 8 | P. G. Wodehouse | 52,543 |
| 9 | F. Scott Fitzgerald | 49,574 |
| 10 | Jane Austen | ~45,000 |

### 当前热门书籍

| 书名 | 作者 | 下载量 |
|------|------|--------|
| Frankenstein | Mary Shelley | 116,037 |
| Moby Dick | Herman Melville | 116,037 |
| Pride and Prejudice | Jane Austen | 83,788 |
| A Christmas Carol | Charles Dickens | 68,002 |
| Alice's Adventures in Wonderland | Lewis Carroll | 61,688 |
| Middlemarch | George Eliot | 53,665 |
| Crime and Punishment | Fyodor Dostoyevsky | 48,482 |

---

## 4. 有声书 (Audio Books)

### 数据来源

| 来源 | 描述 | 数量 |
|------|------|------|
| **LibriVox** | 人声朗读，志愿者录制 | 20,648+ |
| **Microsoft AI 有声书** | AI 生成的有声书 | ~5,000 |

### LibriVox

- 网站: [librivox.org](https://librivox.org/)
- 与 Project Gutenberg 紧密关联，文本来源于 Gutenberg
- 音频托管在 Internet Archive
- Project Gutenberg 的书籍页面会显示对应的 LibriVox 链接

### AI 生成有声书

2023年，Project Gutenberg 与 Microsoft 和 MIT 合作推出 Open Audiobook Collection：
- 使用 Azure AI Services 生成
- 分发渠道：Project Gutenberg、Spotify、Apple Podcasts、Google Podcasts
- 提供 MP3 格式下载

### 有声书 API 访问

Gutenberg 提供有声书分类浏览：
```
https://www.gutenberg.org/browse/categories/1  (Human-read Audio Books)
```

---

## 5. 数据同步方案

### 方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **OPDS Feed** | 实时搜索 | 标准协议、实时性好 | 速度较慢 |
| **Gutendex API** | 常规使用 | 简单易用、支持排序 | 第三方维护 |
| **rsync Mirror** | 完整镜像 | 最完整、可离线 | 存储需求大 (~200GB) |
| **RSS Feed** | 每日更新 | 轻量级 | 仅新书 |

### 当前项目实现

项目已在 `scripts/book-ingestion/sources/gutenberg.ts` 中实现：
- 使用 OPDS Feed 获取热门书籍 (`sort_order=downloads`)
- 支持 `popular` 和 `recommended` 两种模式
- 自动下载 EPUB 和封面图片
- 解析元数据存入数据库

---

## 6. Discover Tab 实现建议

### 页面结构

```
Discover
├── 🔥 Trending Now
│   └── API: gutendex.com/books?sort=popular&limit=20
│
├── 📚 Categories
│   ├── Fiction → ?topic=fiction
│   ├── Mystery & Detective → ?topic=detective
│   ├── Romance → ?topic=romance
│   ├── Science Fiction → ?topic=science fiction
│   ├── Fantasy → ?topic=fantasy
│   ├── Horror → ?topic=gothic
│   ├── Adventure → ?topic=adventure
│   ├── Children's → ?topic=children
│   ├── Classics → ?topic=best books ever listings
│   └── Poetry → ?topic=poetry
│
├── ✍️ Popular Authors
│   └── 从 Top 100 Authors 页面抓取或预设列表
│
└── 🎧 Audio Books
    ├── LibriVox Human-read
    └── AI-generated Audiobooks
```

### 数据更新频率

| 数据类型 | 建议更新频率 |
|----------|--------------|
| Trending/Popular | 每日 |
| Categories | 每周 |
| Author Rankings | 每周 |
| New Releases | 每日 (RSS) |

---

## 7. 技术实现注意事项

### 速率限制

Project Gutenberg 对自动化访问有严格限制：
- 同一 IP 每天下载超过 100 个文件会被标记为机器人
- 建议请求间隔: 2+ 秒
- 推荐使用 Gutendex API 而非直接爬取

### 封面图片

```
中等尺寸: https://www.gutenberg.org/cache/epub/{id}/pg{id}.cover.medium.jpg
小尺寸:   https://www.gutenberg.org/cache/epub/{id}/pg{id}.cover.small.jpg
```

### EPUB 下载优先级

1. `https://www.gutenberg.org/ebooks/{id}.epub3.images` (EPUB3 带图)
2. `https://www.gutenberg.org/ebooks/{id}.epub.images` (EPUB 带图)
3. `https://www.gutenberg.org/ebooks/{id}.epub.noimages` (EPUB 无图)
4. `https://www.gutenberg.org/cache/epub/{id}/pg{id}.epub` (缓存版本)

---

## 8. 资源链接

- [Project Gutenberg 官网](https://www.gutenberg.org/)
- [Gutendex API 文档](https://gutendex.com/)
- [LibriVox 有声书](https://librivox.org/)
- [Top 100 排行榜](https://www.gutenberg.org/browse/scores/top)
- [Bookshelves 分类](https://www.gutenberg.org/ebooks/bookshelf/)
- [OPDS Feed](https://www.gutenberg.org/ebooks/search.opds/)
- [Robot Access Policy](https://www.gutenberg.org/policy/robot_access.html)
- [Mirroring Guide](https://www.gutenberg.org/help/mirroring.html)

---

*文档更新日期: 2024-12-24*
