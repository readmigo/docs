# 公版书入库系统

### 13.1 内容来源与采集策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        公版书采集流程                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  数据源优先级                                                            │
│  ══════════════                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Priority 1: Standard Ebooks (首选)                              │    │
│  │  ─────────────────────────────────                              │    │
│  │  • 数量：700+ 本                                                 │    │
│  │  • 质量：专业排版，精校文字                                      │    │
│  │  • 格式：EPUB3，现代标准                                         │    │
│  │  • 封面：精美公版艺术封面                                        │    │
│  │  • 获取：Git仓库 / 直接下载                                      │    │
│  │  • URL: https://standardebooks.org                               │    │
│  │                                                                  │    │
│  │  适用场景：MVP首批内容，无需处理直接使用                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Priority 2: Project Gutenberg (主力扩展)                        │    │
│  │  ─────────────────────────────────────                          │    │
│  │  • 数量：70,000+ 本                                              │    │
│  │  • 质量：参差不齐，需筛选                                        │    │
│  │  • 格式：多种格式（EPUB/HTML/TXT）                               │    │
│  │  • API：Gutendex (https://gutendex.com)                          │    │
│  │  • 镜像：多个全球镜像站点                                        │    │
│  │                                                                  │    │
│  │  适用场景：Phase 2扩展到5000+书籍                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Priority 3: 其他来源 (补充)                                     │    │
│  │  ─────────────────────────────                                  │    │
│  │  • Internet Archive: 稀有书籍                                    │    │
│  │  • Feedbooks: 额外公版书                                         │    │
│  │  • ManyBooks: 格式化良好的版本                                   │    │
│  │                                                                  │    │
│  │  适用场景：特定书籍需求，填补空缺                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 自动化入库流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Book Ingestion Pipeline                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Source  │───▶│  Fetch   │───▶│ Process  │───▶│  Upload  │          │
│  │  Config  │    │  Books   │    │ Content  │    │  Cloud   │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│       │              │               │               │                  │
│       │              │               │               │                  │
│       ▼              ▼               ▼               ▼                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │ 定义来源 │    │ 下载EPUB │    │ 清洗内容 │    │ 上传R2   │          │
│  │ 筛选规则 │    │ 提取元数据│    │ 生成元数据│    │ 更新数据库│          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.3 入库脚本设计

```typescript
// scripts/book-ingestion/pipeline.ts

/**
 * 书籍入库管道配置
 */
interface IngestionConfig {
  source: 'standard_ebooks' | 'gutenberg' | 'internet_archive';
  filters: {
    languages: string[];      // ['en']
    minDownloads?: number;    // Gutenberg: 最低下载量
    subjects?: string[];      // 类型筛选
    excludeSubjects?: string[]; // 排除类型
  };
  processing: {
    cleanHtml: boolean;
    generateCover: boolean;
    extractToc: boolean;
    calculateDifficulty: boolean;
  };
  storage: {
    bucket: string;
    prefix: string;           // 'books/epub/'
  };
}

/**
 * Standard Ebooks 入库流程
 */
async function ingestStandardEbooks() {
  // 1. 克隆/更新 Standard Ebooks 仓库
  // git clone https://github.com/standardebooks/standardebooks.org.git

  // 2. 遍历所有书籍目录
  const booksDir = './standardebooks/ebooks';

  // 3. 处理每本书
  for (const bookDir of await readdir(booksDir)) {
    // 3.1 读取 content.opf 获取元数据
    const metadata = await parseOpf(`${bookDir}/src/epub/content.opf`);

    // 3.2 构建 EPUB 文件
    const epubPath = await buildEpub(bookDir);

    // 3.3 提取额外信息
    const bookInfo = {
      title: metadata.title,
      author: metadata.creator,
      description: metadata.description,
      subjects: metadata.subjects,
      wordCount: await countWords(bookDir),
      readingTime: calculateReadingTime(wordCount),
      difficulty: await calculateDifficulty(bookDir),

      // Standard Ebooks 特有
      coverArtist: metadata.coverArtist,
      transcriber: metadata.transcriber,
    };

    // 3.4 上传到云存储
    const epubUrl = await uploadToR2(epubPath, `books/epub/${bookInfo.slug}.epub`);
    const coverUrl = await uploadToR2(coverPath, `books/covers/${bookInfo.slug}.jpg`);

    // 3.5 写入数据库
    await prisma.book.upsert({
      where: { sourceId: `se_${bookInfo.slug}` },
      create: {
        ...bookInfo,
        epubUrl,
        coverUrl,
        source: 'standard_ebooks',
        sourceId: `se_${bookInfo.slug}`,
      },
      update: bookInfo,
    });
  }
}

/**
 * Project Gutenberg 入库流程
 */
async function ingestGutenberg(config: IngestionConfig) {
  // 1. 通过 Gutendex API 获取书籍列表
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://gutendex.com/books?languages=en&page=${page}`
    );
    const data = await response.json();

    for (const book of data.results) {
      // 2. 筛选条件
      if (book.download_count < config.filters.minDownloads) continue;
      if (hasExcludedSubject(book.subjects, config.filters.excludeSubjects)) continue;

      // 3. 下载 EPUB 文件
      const epubUrl = book.formats['application/epub+zip'];
      if (!epubUrl) continue;

      const epubBuffer = await downloadFile(epubUrl);

      // 4. 处理内容
      const processed = await processEpub(epubBuffer, {
        cleanHtml: true,
        removeLegalText: true,
        normalizeChapters: true,
      });

      // 5. 上传和入库
      const cloudUrl = await uploadToR2(processed.epub, `books/epub/pg_${book.id}.epub`);

      await prisma.book.create({
        data: {
          title: book.title,
          author: book.authors[0]?.name,
          subjects: book.subjects,
          bookshelves: book.bookshelves,
          epubUrl: cloudUrl,
          coverUrl: book.formats['image/jpeg'],
          source: 'gutenberg',
          sourceId: `pg_${book.id}`,
          downloadCount: book.download_count,
        },
      });
    }

    hasMore = data.next !== null;
    page++;

    // 速率限制
    await sleep(1000);
  }
}
```

### 13.4 云存储结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Cloudflare R2 存储结构                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  readmigo-content/                                                      │
│  │                                                                      │
│  ├── books/                                                             │
│  │   ├── epub/                      # EPUB文件                          │
│  │   │   ├── se_pride-and-prejudice.epub                               │
│  │   │   ├── se_great-gatsby.epub                                       │
│  │   │   ├── pg_84.epub             # Gutenberg ID                      │
│  │   │   └── ...                                                        │
│  │   │                                                                  │
│  │   ├── covers/                    # 封面图片                          │
│  │   │   ├── se_pride-and-prejudice.jpg                                │
│  │   │   ├── se_pride-and-prejudice_thumb.jpg   # 缩略图               │
│  │   │   └── ...                                                        │
│  │   │                                                                  │
│  │   └── metadata/                  # 预处理元数据                       │
│  │       ├── se_pride-and-prejudice.json                               │
│  │       └── ...                                                        │
│  │                                                                      │
│  ├── user-uploads/                  # 用户上传                          │
│  │   └── {user_id}/                                                     │
│  │       └── {book_id}.epub                                             │
│  │                                                                      │
│  └── assets/                        # 静态资源                          │
│      ├── fonts/                                                         │
│      └── default-covers/                                                │
│                                                                         │
│  访问策略：                                                              │
│  • books/ - 公开读取，CDN缓存                                           │
│  • user-uploads/ - 私有，签名URL访问                                    │
│  • assets/ - 公开读取，长期缓存                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.5 入库调度与监控

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        入库任务调度                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  定时任务                                                                │
│  ══════════                                                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  任务                    周期          说明                      │    │
│  │  ────────────────────────────────────────────────────────────   │    │
│  │  Standard Ebooks 同步    每周一        检查新增书籍              │    │
│  │  Gutenberg 热门同步      每月1日       同步下载量 Top 1000       │    │
│  │  封面优化                每周日        压缩/生成缩略图           │    │
│  │  元数据更新              每月15日      重新计算难度评分          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  监控指标                                                                │
│  ══════════                                                              │
│  • 入库成功/失败数量                                                    │
│  • 处理耗时                                                             │
│  • 存储空间使用                                                         │
│  • 重复书籍检测                                                         │
│                                                                         │
│  告警规则                                                                │
│  ══════════                                                              │
│  • 入库失败率 > 10% → 告警                                              │
│  • 存储空间 > 80% → 告警                                                │
│  • 单本处理时间 > 5分钟 → 记录                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 14. 公版书来源汇总

### 14.1 主要公版书平台

| 平台 | URL | 内容规模 | 特点 |
|------|-----|----------|------|
| **Project Gutenberg** | [gutenberg.org](https://www.gutenberg.org/) | 75,000+ 本 | 最大的公版电子书库，主要为英文作品 |
| **Standard Ebooks** | [standardebooks.org](https://standardebooks.org/) | 1,300+ 本 | 高质量排版，精校文字，EPUB3 格式 |
| **Internet Archive** | [archive.org](https://archive.org/) | 4700万+ 项目 | 包含书籍、音频、视频等多媒体资源 |
| **LibriVox** | [librivox.org](https://librivox.org/) | 20,000+ 有声书 | 公版书有声朗读，90+ 种语言 |
| **FadedPage** | [fadedpage.com](https://www.fadedpage.com/) | 8,000+ 本 | 加拿大公版书，含独特内容 |
| **Wikisource** | [wikisource.org](https://wikisource.org/) | 多语言 | 多语言公版原文，可用于对照 |
| **Digital Public Library of America** | [dp.la](https://dp.la/) | 6,300+ 本 | 美国图书馆联盟资源 |

### 14.2 开放教材平台 (OER)

| 平台 | URL | 特点 | 许可证 |
|------|-----|------|--------|
| **OpenStax** | [openstax.org](https://openstax.org/) | 50+ 本同行评审教材，莱斯大学出版 | CC BY 4.0 |
| **Open Textbook Library** | [open.umn.edu/opentextbooks](https://open.umn.edu/opentextbooks/) | 1,700+ 本教材目录 | 多种 CC 许可 |
| **LibreTexts** | [libretexts.org](https://libretexts.org/) | 多学科协作教材库 | CC BY-NC-SA |
| **OER Commons** | [oercommons.org](https://oercommons.org/) | 开放教育资源数字图书馆 | 多种许可 |
| **BCcampus OpenEd** | [open.bccampus.ca](https://open.bccampus.ca/) | 加拿大 BC 省开放教材 | CC 许可 |
| **GALILEO OER** | [oer.galileo.usg.edu](https://oer.galileo.usg.edu/) | 乔治亚大学系统开放资源 | CC 许可 |

### 14.3 专业领域资源

#### 自然科学
| 平台 | URL | 内容 |
|------|-----|------|
| **MIT OpenCourseWare** | [ocw.mit.edu](https://ocw.mit.edu/) | MIT 课程资料，物理、化学、生物等 |
| **OpenGeology.org** | [opengeology.org](https://opengeology.org/) | 地质学开放教材 |
| **ProbabilityCourse.com** | [probabilitycourse.com](https://www.probabilitycourse.com/) | 概率统计课程 |

#### 计算机科学与技术
| 平台 | URL | 内容 |
|------|-----|------|
| **GoalKicker Books** | [goalkicker.com](https://books.goalkicker.com/) | 50+ 本编程书籍，Stack Overflow 社区整理 |
| **EbookFoundation** | [github.com/EbookFoundation](https://github.com/EbookFoundation/free-programming-books) | 4,000+ 免费编程书籍，43 种语言 |
| **Green Tea Press** | [greenteapress.com](https://greenteapress.com/) | Think Python, Think Stats 等系列 |
| **Language Science Press** | [langsci-press.org](https://langsci-press.org/) | 277+ 本语言学开放获取书籍 |

#### 艺术与人文
| 平台 | URL | 内容 |
|------|-----|------|
| **Smarthistory** | [smarthistory.org](https://smarthistory.org/) | 艺术史多媒体教材 |
| **Getty Virtual Library** | [getty.edu/publications](https://www.getty.edu/publications/virtuallibrary/) | 300+ 本艺术书籍 |
| **Metropolitan Museum Publications** | [metmuseum.org](https://www.metmuseum.org/art/metpublications) | 大都会博物馆免费电子书 |

#### 商业与经济
| 平台 | URL | 内容 |
|------|-----|------|
| **CORE Econ** | [core-econ.org](https://www.core-econ.org/) | 现代经济学教材，500+ 大学使用 |
| **Online Library of Liberty** | [oll.libertyfund.org](https://oll.libertyfund.org/) | 古典经济学文献 |
| **Mises Institute** | [mises.org/library](https://mises.org/library) | 奥地利学派经济学 |

#### 宗教与哲学
| 平台 | URL | 内容 |
|------|-----|------|
| **Sacred Texts Archive** | [sacred-texts.com](https://sacred-texts.com/) | 1,700+ 宗教与灵性文本 |
| **Christian Classics Ethereal Library** | [ccel.org](https://www.ccel.org/) | 1,000+ 基督教神学著作 |
| **HolyBooks.com** | [holybooks.com](https://holybooks.com/) | 多宗教典籍 PDF |

#### 古籍影印
| 平台 | URL | 内容 |
|------|-----|------|
| **书格** | [shuge.org](https://www.shuge.org/) | 高清古籍影印，中国古籍 |
| **国家图书馆数字资源** | [nlc.cn](http://www.nlc.cn/) | 中国国家图书馆馆藏 |
| **哈佛燕京图书馆** | [harvard.edu](https://library.harvard.edu/libraries/harvard-yenching-library) | 东亚研究资料 |
| **早稻田大学图书馆** | [waseda.jp](https://www.wul.waseda.ac.jp/) | 日本古籍资源 |

### 14.4 许可证类型说明

| 许可证 | 全称 | 商业使用 | 修改 | 相同许可 |
|--------|------|----------|------|----------|
| **Public Domain** | 公有领域 | ✅ | ✅ | 无要求 |
| **CC BY** | 署名 | ✅ | ✅ | 无要求 |
| **CC BY-SA** | 署名-相同方式共享 | ✅ | ✅ | ✅ |
| **CC BY-NC** | 署名-非商业性使用 | ❌ | ✅ | 无要求 |
| **CC BY-NC-SA** | 署名-非商业性使用-相同方式共享 | ❌ | ✅ | ✅ |
| **CC BY-NC-ND** | 署名-非商业性使用-禁止演绎 | ❌ | ❌ | 无要求 |
| **MIT** | MIT 许可证 | ✅ | ✅ | 无要求 |
| **Apache 2.0** | Apache 许可证 2.0 | ✅ | ✅ | 无要求 |
| **GNU FDL** | GNU 自由文档许可证 | ✅ | ✅ | ✅ |

### 14.5 质量评估标准

| 评级 | 含义 |
|------|------|
| **Excellent** | 同行评审、广泛采用、定期更新 |
| **Very Good** | 教师评审、内容全面、可靠 |
| **Good** | 实用内容、可能范围较窄或更新较少 |
| **Historic Classic** | 历史经典著作，具有奠基性意义 |

### 14.6 格式可用性

大多数资源提供多种格式：
- **PDF** - 通用格式，固定版式
- **EPUB** - 可重排文字，适合电子阅读器
- **HTML** - 网页阅读，通常支持交互
- **MOBI** - Kindle 兼容格式
- **Plain Text** - 纯文本，最大兼容性

---

