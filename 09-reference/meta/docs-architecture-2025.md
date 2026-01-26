# Readmigo 项目文档架构

> 最后更新: 2025-12-31
> 文档总数: 217 | 模块: 41 | 完成度: ~85%

---

## 📐 文档架构总览

本文档按照从战略到执行、从愿景到实施的层次结构组织，帮助团队从全局到细节理解项目。

```
┌─────────────────────────────────────────────────────────────────┐
│  层次 1: 愿景与使命                                               │
│  └─ 产品定位、目标、价值主张                                        │
├─────────────────────────────────────────────────────────────────┤
│  层次 2: 市场与资源                                               │
│  ├─ 可行性评估与市场调研                                           │
│  ├─ 目标用户画像                                                  │
│  ├─ 书籍来源（公共领域数据源）                                      │
│  └─ 运营资源与策略                                                │
├─────────────────────────────────────────────────────────────────┤
│  层次 3: 产品设计                                                 │
│  ├─ 产品需求文档 (PRD)                                            │
│  ├─ 功能规划                                                     │
│  └─ 设计系统                                                     │
├─────────────────────────────────────────────────────────────────┤
│  层次 4: 功能模块                                                 │
│  ├─ 核心模块（阅读器、账号、内容）                                   │
│  ├─ 社区模块（广场、作者、评论）                                     │
│  └─ 扩展模块（AI、算法、特色功能）                                   │
├─────────────────────────────────────────────────────────────────┤
│  层次 5: 技术实施                                                 │
│  ├─ 技术架构（API、数据库、缓存）                                   │
│  ├─ 基础设施（日志、监控、环境隔离）                                 │
│  ├─ 客户端开发（iOS）                                             │
│  └─ 管理后台                                                     │
├─────────────────────────────────────────────────────────────────┤
│  层次 6: 发布上线                                                 │
│  ├─ App Store 提交                                               │
│  ├─ 国际化与本地化                                                │
│  └─ 法律合规                                                     │
├─────────────────────────────────────────────────────────────────┤
│  层次 7: 商业运营                                                 │
│  ├─ 订阅系统                                                     │
│  ├─ 会员体系                                                     │
│  └─ 客户支持                                                     │
├─────────────────────────────────────────────────────────────────┤
│  层次 8: 持续迭代                                                 │
│  ├─ 版本管理                                                     │
│  └─ 升级策略                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 层次 1: 愿景与使命

### 产品定位

**ReadMigo = 最佳经典阅读体验 + 智能语言学习**

"Read Classics. Learn Languages. Zero Cost for Content."

### 核心价值主张

| 维度 | 价值 |
|------|------|
| **内容优势** | 76,000+ 免费经典书籍（Project Gutenberg） |
| **体验优势** | 现代化 UI/UX，优于现有 Gutenberg 客户端 |
| **学习优势** | 双语对照、词汇学习、难度分级 |
| **成本优势** | 核心内容零成本，公共领域无版权费 |

### 相关文档
- 📄 [产品需求文档 (PRD)](product/prd.md) - 完整的产品愿景和功能规划

---

## 🔍 层次 2: 市场与资源

### 2.1 市场调研与可行性

| 文档 | 内容 | 状态 |
|------|------|------|
| [feasibility-assessment.md](product/feasibility-assessment.md) | 技术、市场、商业可行性全面评估 | ✅ 已完成 |
| [commercial-viability.md](sources/gutenberg/commercial-viability.md) | Gutenberg 商业化法律分析 | ✅ 已完成 |
| [partnership-strategy.md](sources/gutenberg/partnership-strategy.md) | 成为官方客户端的路径 | ✅ 已完成 |

**核心结论**:
- ✅ 法律可行性: 完全合法，无版权障碍
- ✅ 技术可行性: 数据源稳定，API 可用
- ✅ 商业可行性: Freemium 模式成熟，有成功案例

### 2.2 目标用户

| 用户群体 | 特征 | 需求 |
|----------|------|------|
| **语言学习者** | 英语学习者，希望通过阅读提升 | 双语对照、词汇学习、难度分级 |
| **经典文学爱好者** | 喜欢经典文学，追求阅读品质 | 高质量排版、无广告、沉浸式体验 |
| **学生群体** | 需要阅读经典文学作品 | 免费访问、学习辅助、笔记功能 |
| **通勤阅读者** | 利用碎片时间阅读 | 有声书、离线下载、进度同步 |

### 2.3 书籍来源（公共领域数据源）

**📁 详细文档**: [sources/](sources/) 文件夹

#### 主要来源概览

| 来源 | 网址 | 特点 | 主要格式 |
|------|------|------|----------|
| **Project Gutenberg** | gutenberg.org | 最大免费电子书库，76,000+ 书籍 | EPUB, TXT, HTML |
| **Standard Ebooks** | standardebooks.org | 高质量排版，现代化格式 | EPUB3 |
| **Internet Archive** | archive.org | 扫描书籍、借阅服务 | PDF, EPUB, DJVU |
| **HathiTrust** | hathitrust.org | 学术图书馆联盟 | PDF |
| **Wikisource** | wikisource.org | 维基百科姊妹项目 | HTML, EPUB |
| **Feedbooks** | feedbooks.com | 公版书 + 原创内容 | EPUB, PDF |
| **ManyBooks** | manybooks.net | 多格式下载 | EPUB, MOBI, PDF |
| **LibriVox** | librivox.org | 有声书（志愿者朗读） | MP3, OGG |

#### 数据源详情

| 数据源 | 规模 | 质量 | 用途 | 文档 |
|--------|------|------|------|------|
| **Project Gutenberg** | 76,000+ | 中 | 主要书源 | [9个文档](sources/gutenberg/) |
| **Standard Ebooks** | 1,000+ | 高 | 高质量补充 | [data-inventory.md](sources/standard-ebooks/data-inventory.md) |
| **LibriVox** | 20,648+ | 人声 | 有声书 | [data-inventory.md](sources/librivox/data-inventory.md) |
| **Internet Archive** | 30M+ | 不一 | 元数据补充 | [data-inventory.md](sources/internet-archive/data-inventory.md) |
| **Learn Out Loud** | 12,000+ | 中高 | 教育有声书 | [data-inventory.md](sources/learnoutloud/data-inventory.md) |
| **ThoughtAudio** | ~100 | 高 | 哲学经典有声书 | [data-inventory.md](sources/thoughtaudio/data-inventory.md) |
| **视频来源** | - | 不一 | 英语学习视频 | [data-inventory.md](sources/video/data-inventory.md) |

**Project Gutenberg 文档结构**:
```
sources/gutenberg/
├── technical-research.md           # API、分类、排行榜
├── data-acquisition-channels.md    # OPDS/RSS/RDF、Gutendex
├── commercial-viability.md         # 法律分析、商业模式
├── partnership-strategy.md         # 官方合作路径
├── product-enhancement-strategy.md # 差异化定位、增长策略
├── discovery-page-design.md        # Discovery Tab 设计
├── other-pages-design.md           # Library/Browse/Author
├── operation-strategy.md           # 内容日历、节日营销
└── technical-implementation.md     # API 封装、缓存、同步
```

### 2.4 数据来源声明

> **重要说明**: 本项目的所有元数据均来自公开渠道获取，非 AI 生成。

#### 头像生成

通过以下公开数据源按优先级获取：

| 数据源 | API | 说明 |
|--------|-----|------|
| **Wikidata** | `wikidata.org/w/api.php` | 主要来源，通过 P18 属性获取图片 |
| **Wikipedia** | `en.wikipedia.org/w/api.php` | 第二选择，pageimages 接口 |
| **Open Library** | `openlibrary.org/search/authors.json` | 第三选择，covers.openlibrary.org |
| **Library of Congress** | `loc.gov/search/` | 第四选择，版画和照片收藏 |
| **Internet Archive** | `archive.org/advancedsearch.php` | 最后备选 |

#### 作者信息

通过以下公开数据源获取：

| 数据源 | 获取内容 |
|--------|----------|
| **Wikidata** | Wikidata ID、结构化数据 |
| **Wikipedia** | 传记信息、出生/死亡日期、国籍 |
| **Open Library** | 作者关联书籍信息 |

#### 书籍信息

通过以下公共领域数据源获取：

| 数据源 | URL | 内容类型 |
|--------|-----|----------|
| **Project Gutenberg** | `gutenberg.org/ebooks/search.opds/` | 英文公共领域书籍 (76,000+) |
| **Standard Ebooks** | `standardebooks.org/ebooks` | 高质量公共领域书籍 (1,000+) |
| **LibriVox** | `librivox.org/api/feed/audiobooks` | 有声书音频和元数据 |
| **CText** | `ctext.org/tools/api` | 中文古籍 (中国哲学书电子化计划) |
| **Chinese Wikisource** | `zh.wikisource.org/w/api.php` | 中文维基文库 |

#### 书籍封面

通过以下公开 API 按优先级获取：

| 数据源 | API | 说明 |
|--------|-----|------|
| **Google Books** | `googleapis.com/books/v1/volumes` | 主要来源，多尺寸支持 |
| **Open Library** | `covers.openlibrary.org/b/id/{id}-L.jpg` | 第二选择 |
| **Standard Ebooks** | og:image meta 标签 | 内置高质量封面 |
| **Internet Archive** | `archive.org/services/get-item-image.php` | 有声书封面 |

#### 电子书下载源

通过以下公共领域平台下载 EPUB 文件：

| 数据源 | 下载 URL 模式 | 说明 |
|--------|---------------|------|
| **Project Gutenberg** | `gutenberg.org/ebooks/{id}.epub3.images` | 英文公版书，优先 epub3 带图版 |
| **Project Gutenberg** | `gutenberg.org/cache/epub/{id}/pg{id}.epub` | 备选下载地址 |
| **Standard Ebooks** | `standardebooks.org/ebooks/{slug}/downloads/{slug}.epub` | 高质量精排版 EPUB |
| **Gutenberg 中文** | `gutenberg.org/ebooks/{id}.epub.images` | 200+ 本中文古籍 |

下载后统一上传至 Cloudflare R2 存储：`epubs/{source}/{id}.epub`

#### 有声书下载源

通过以下公共领域平台获取音频文件：

| 数据源 | API | 说明 |
|--------|-----|------|
| **LibriVox** | `librivox.org/api/feed/audiobooks` | 公版有声书 API，返回章节 `listen_url` |
| **Internet Archive** | `archive.org/download/{id}/` | LibriVox 音频托管源 |

音频文件格式：MP3/OGG，上传至 R2：`audiobooks/audio/{id}/{chapter}.mp3`

### 2.5 运营资源与策略

| 文档 | 内容 | 状态 |
|------|------|------|
| [operation-strategy.md](sources/gutenberg/operation-strategy.md) | 内容更新日历、个性化推荐、节日营销 | ✅ 已完成 |
| [product-enhancement-strategy.md](sources/gutenberg/product-enhancement-strategy.md) | 用户增长、社区建设、增长飞轮 | ✅ 已完成 |
| [data-generation-plan.md](ai/data-generation-plan.md) | AI 生成内容数据规划 | 🚧 进行中 |

### 2.6 竞品分析

集中管理所有竞品对比分析文档，按维度分类整理：

| 文档 | 内容 | 状态 |
|------|------|------|
| [README.md](competitive/README.md) | 竞品分析索引 | ✅ 已完成 |
| [reader-apps.md](competitive/reader-apps.md) | 阅读器产品对比（Apple Books、Kindle、微信读书等） | ✅ 已完成 |
| [technical-solutions.md](competitive/technical-solutions.md) | 技术方案对比（排版引擎、渲染方案） | ✅ 已完成 |
| [data-sources.md](competitive/data-sources.md) | 数据源对比（Feedbooks、ManyBooks、WikiSource 等） | ✅ 已完成 |

---

## 🎨 层次 3: 产品设计

### 3.1 产品需求文档

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [prd.md](product/prd.md) | ✅ | 90% | 产品需求文档 - 核心功能已定义 |
| [discovery-page-design.md](sources/gutenberg/discovery-page-design.md) | ✅ | 100% | Discovery Tab 7个 Section 完整设计 |
| [other-pages-design.md](sources/gutenberg/other-pages-design.md) | ✅ | 100% | Library/Browse/Author/Detail/Search |

### 3.2 设计系统

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [design-system.md](design/design-system.md) | 🚧 | 70% | 设计系统规范 - 基础组件完成 |
| [book-display-styles.md](design/book-display-styles.md) | 🚧 | 60% | 书籍展示样式 - 7种样式定义 |
| [排版引擎对比](competitive/technical-solutions.md) | ✅ | 100% | 排版引擎对比 - 已移至竞品分析目录 |
| [typography-research.md](design/typography-research.md) | ✅ | 100% | 专业排版研究 |

### 3.3 内容分类体系

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [classification-system.md](content/classification-system.md) | ✅ | 90% | 分类系统 - 已实现 |
| [category-redesign.md](content/category-redesign.md) | 🚧 | 60% | 分类重构 - 进行中 |

---

## 🧩 层次 4: 功能模块

### 4.1 核心模块

#### 📖 阅读器 (95% | ✅ 基本完成)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [README.md](reader/README.md) | ✅ | 100% | 阅读器模块索引 |
| [architecture.md](reader/architecture.md) | ✅ | 95% | 阅读器核心架构 |
| [format-support.md](reader/format-support.md) | ✅ | 100% | 电子书格式支持 |
| [竞品分析](competitive/reader-apps.md) | ✅ | 100% | 阅读器竞品分析 - 已移至竞品分析目录 |
| [rendering-engine.md](reader/rendering-engine.md) | ✅ | 100% | 多格式渲染引擎 |
| [page-turning.md](reader/page-turning.md) | ✅ | 100% | 翻页动画系统 |
| [font-management.md](reader/font-management.md) | ✅ | 100% | 字体管理系统 |
| [advanced-features-roadmap.md](reader/advanced-features-roadmap.md) | 🚧 | 40% | 高级功能路线图 |
| [paged-webview-design.md](reader/paged-webview-design.md) | ✅ | 90% | 分页 WebView |
| [epub-architecture.md](reader/epub-architecture.md) | ✅ | 90% | EPUB 架构 |
| [format-support.md](reader/format-support.md) | ✅ | 100% | 格式支持 (含详细技术分析) |
| [library-tab-data-flow.md](reader/library-tab-data-flow.md) | ✅ | 85% | 图书馆数据流 |
| [local-import.md](reader/local-import.md) | ✅ | 100% | 本地导入 - iOS已实现 |

**实施状态**:
- ✅ WebView 阅读器核心功能完成
- ✅ EPUB 解析和渲染完成
- ✅ 划线、笔记、书签功能完成
- ✅ 本地导入功能已完成（iOS客户端）

#### 👤 账号系统 (85% | 🚧 进行中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [system-design.md](account/system-design.md) | ✅ | 90% | 账号系统设计 |
| [user-permissions-spec.md](account/user-permissions-spec.md) | ✅ | 80% | 权限系统 |
| [account-id-design.md](account/account-id-design.md) | ✅ | 85% | 账号ID设计 - Phase 1-3 完成 |
| [social-binding-design.md](account/social-binding-design.md) | 📝 | 10% | 社交绑定 |

**实施状态**:
- ✅ 用户注册/登录已完成
- ✅ JWT 认证已实现
- ✅ AccountIdService 已实现（Backend + iOS）
- ✅ 账号注销 API 已实现（30天冷静期）
- ✅ 冷静期定时任务已配置（每日凌晨2点）
- ✅ Sentry accountId 关联已完成
- 📝 Phase 4 数据迁移设计已完成

#### 📚 内容管理 (40% | 📝 数据准备中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [discover-search.md](content/discover-search.md) | 🚧 | 85% | 搜索功能 - 统一搜索+分类+自动补全 |
| [multilingual-management.md](content/multilingual-management.md) | 🚧 | 50% | 多语言管理 |
| [public-domain-categories.md](content/public-domain-categories.md) | 📝 | 30% | 公版书分类 |
| [staging-phase1-booklist.md](content/staging-phase1-booklist.md) | ✅ | 100% | Phase 1 核心书单（300电子书+150有声书） |
| [staging-phase2-booklist.md](content/staging-phase2-booklist.md) | ✅ | 100% | Phase 2 扩展书单 |
| [staging-phase3-booklist.md](content/staging-phase3-booklist.md) | ✅ | 100% | Phase 3 规模化书单 |

**其他内容类别文档** (位于 `content/book-categories/`):
- [natural-sciences-books.md](content/book-categories/natural-sciences-books.md) - 自然科学书籍
- [open-source-tech-books.md](content/book-categories/open-source-tech-books.md) - 技术书籍
- [arts-music-design-books.md](content/book-categories/arts-music-design-books.md) - 艺术类书籍
- [social-sciences-books.md](content/book-categories/social-sciences-books.md) - 社会科学书籍
- [business-economics-books.md](content/book-categories/business-economics-books.md) - 商业经济书籍
- [ancient-book-scans.md](content/book-categories/ancient-book-scans.md) - 古籍扫描

#### 📚 学习系统 (70% | 🚧 进行中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [README.md](learning/README.md) | ✅ | 100% | 学习模块索引 |

**实施状态**:
- ✅ 生词本功能完成
- ✅ SM-2 间隔重复算法实现
- 🚧 复习卡片 UI 优化中

#### 🎧 有声书系统 (70% | 🚧 进行中)

**📁 模块索引**: [audiobook/README.md](audiobook/README.md)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [audiobook-design-v2.md](audiobook/audiobook-design-v2.md) | 🚧 | 进行中 | 有声书功能设计 V2 |
| [audiobook-ebook-linking-design.md](audiobook/audiobook-ebook-linking-design.md) | 📝 | 规划中 | 有声书-电子书关联 |
| [multi-version-audiobook-design.md](audiobook/multi-version-audiobook-design.md) | ✅ | 100% | 多版本有声书技术设计 |
| [read-along-highlight-research.md](audiobook/read-along-highlight-research.md) | 📝 | 调研中 | 跟读高亮功能研究 |

**实施状态**:
- ✅ iOS AudiobookPlayerView 播放器完成
- ✅ 章节列表和进度显示完成
- ✅ 播放控制（播放/暂停/跳转/倍速）完成
- ✅ 后台播放和锁屏控制完成
- 📝 有声书-电子书同步阅读规划中

### 4.2 社区模块

#### 🎭 社区广场 (60% | 🚧 进行中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [feature-design.md](agora/feature-design.md) | ✅ | 80% | Agora 功能设计 |
| [comment.md](agora/comment.md) | 🚧 | 60% | 评论功能 |
| [data-preparation.md](agora/data-preparation.md) | 📝 | 40% | 数据准备 |

#### ✍️ 作者系统 (90% | ✅ 基本完成)

**📁 模块索引**: [author/README.md](author/README.md)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [profile.md](author/profile.md) | ✅ | 90% | 作者主页 - iOS UI + 聊天验证完成 |
| [book-relationship.md](author/book-relationship.md) | ✅ | 90% | 作者-书籍关系 |
| [enrichment-design.md](author/enrichment-design.md) | 🚧 | 进行中 | 作者数据丰富化设计 |
| [data-sources-comparison.md](author/data-sources-comparison.md) | ✅ | 已完成 | 作者数据源对比 |

**实施状态**:
- ✅ iOS AuthorProfileView 完整实现
- ✅ 文字/语音/视频聊天验证完成
- ✅ Top 20 作者数据填充完成
- 🚧 作者头像 AI 生成方案设计中

### 4.3 扩展模块

#### 🤖 AI 功能 (80% | 🚧 进行中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [cache-strategy.md](ai/cache-strategy.md) | ✅ | 90% | AI 缓存策略 |
| [data-generation-plan.md](ai/data-generation-plan.md) | 🚧 | 70% | 数据生成 |

**实施状态**:
- ✅ AI 查词功能已实现
- ✅ AI 解释句子功能已实现
- ✅ AI 缓存系统已实现

#### 📐 算法系统 (80% | ✅ 基本完成)

**📁 模块索引**: [algorithm/README.md](algorithm/README.md)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [book-ranking-algorithm.md](algorithm/book-ranking-algorithm.md) | ✅ | 80% | 书籍推荐算法 |
| [book-ranking-implementation.md](algorithm/book-ranking-implementation.md) | ✅ | 100% | 实现设计文档 |

**实施状态**:
- ✅ 算法设计完成（8个评分维度）
- ✅ 后端 RecommendationModule 已实现
- ✅ 定时任务已配置

#### 🎖️ 特色功能 (60% | 🚧 进行中)

**📁 模块索引**: [features/README.md](features/README.md)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [quotes-system-design.md](features/quotes-system-design.md) | ✅ | 100% | 金句系统 - 后端已实现 |
| [postcards-system-design.md](features/postcards-system-design.md) | ✅ | 100% | 明信片系统 - 后端已实现 |
| [author-chat-design.md](features/author-chat-design.md) | ✅ | 100% | 作者对话 - 后端已实现 |
| [customer-support-system-design.md](features/customer-support-system-design.md) | ✅ | 90% | 客服系统 - 设计完成 |
| [story-timeline-design.md](features/story-timeline-design.md) | 📝 | 设计中 | 故事时间线可视化 |
| [character-relationship-map-design.md](features/character-relationship-map-design.md) | 📝 | 设计中 | 人物关系图可视化 |
| [intensive-reading-design.md](features/intensive-reading-design.md) | 📝 | 设计中 | 外文精读模块 |
| [medal-system-design.md](features/medal-system-design.md) | 📝 | 30% | 勋章系统 |
| [annual-reading-report-design.md](features/annual-reading-report-design.md) | 📝 | 规划中 | 年度阅读报告 |
| [account-membership-relationship.md](features/account-membership-relationship.md) | 🚧 | 50% | 账号会员关系 |

**实施状态**:
- ✅ 金句系统后端已实现（12个API）
- ✅ 明信片系统后端已实现（10个API，8个模板）
- ✅ 作者对话系统后端已实现（含流式响应）
- ✅ 客服系统设计完成
- 📝 故事时间线、人物关系图、外文精读设计中
- 📝 勋章系统规划中

---

## 🛠️ 层次 5: 技术实施

### 5.1 技术架构

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [backend-architecture.md](api/backend-architecture.md) | ✅ | 90% | 后端架构文档 |
| [tech-stack.md](architecture/tech-stack.md) | ✅ | 100% | 技术栈选型 |
| [technical-implementation.md](sources/gutenberg/technical-implementation.md) | ✅ | 100% | API 封装、缓存、同步 |

**技术栈**:
- 后端: NestJS + Prisma + PostgreSQL
- 客户端: Swift + SwiftUI
- 缓存: Redis
- 存储: Cloudflare R2
- AI: Claude API

### 5.2 基础设施

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [be-environment-isolation-design.md](infrastructure/be-environment-isolation-design.md) | ✅ | 90% | 环境隔离 - dev/staging/prod |
| [cloudflare-r2-setup.md](infrastructure/cloudflare-r2-setup.md) | ✅ | 100% | R2 对象存储 |
| [logging-and-crash-collection.md](infrastructure/logging-and-crash-collection.md) | 🚧 | 60% | 日志收集 |
| [runtime-logging-design.md](infrastructure/runtime-logging-design.md) | 🚧 | 70% | 运行时日志 |
| [environment-content-design.md](infrastructure/environment-content-design.md) | 🚧 | 50% | 环境内容设计 |
| [book-import-system.md](infrastructure/book-import-system.md) | 📝 | 30% | 书籍导入系统 |
| [reading-duration-system.md](infrastructure/reading-duration-system.md) | 📝 | 40% | 阅读时长统计 |

### 5.3 客户端开发

#### 📱 iOS 客户端 (85% | 🚧 进行中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [client-spec.md](ios/client-spec.md) | ✅ | 95% | iOS 客户端技术规范 |
| [login-design.md](ios/login-design.md) | ✅ | 100% | 登录功能设计 |
| [guest-mode-plan.md](ios/guest-mode-plan.md) | ✅ | 100% | 访客模式 |
| [i18n-design.md](ios/i18n-design.md) | ✅ | 94% | 国际化 - 886/941 keys |
| [about-module-design.md](ios/about-module-design.md) | ✅ | 90% | 关于页面 |
| [logging-enhancement-design.md](ios/logging-enhancement-design.md) | ✅ | 100% | 日志增强设计 - 已完全实现 |
| [offline-support.md](ios/offline-support.md) | 🚧 | 70% | 离线支持设计 - 核心功能已实现 |
| [in-app-messaging-design.md](ios/in-app-messaging-design.md) | ✅ | 100% | 应用内消息 - 已完全实现 |
| [user-book-import-status.md](ios/user-book-import-status.md) | ✅ | 100% | 用户导入电子书 - 已完全实现 |

#### 🤖 Android 客户端 (35% | 🚧 开发中)

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [client-implementation-plan.md](android/client-implementation-plan.md) | ✅ | 100% | Android 客户端实现方案 - 100% 对齐 iOS |

**代码统计**: 162 个 Kotlin 文件 | ~27,000 行代码 | 14 个测试文件

**技术栈**: Kotlin + Jetpack Compose + MVVM + Clean Architecture + Hilt DI

**P0 核心模块**:

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 认证 (Auth) | 85% | ✅ Google 登录、JWT 管理、Token 刷新 |
| 引导流程 (Onboarding) | 80% | ✅ 4步引导页面完整 |
| 图书馆/浏览 | 75% | ✅ 列表、详情、分类、发现页面 |
| 阅读器 (Reader) | 50% | ⚠️ 基础框架有，EPUB.js 未集成 |
| AI 助手 | 40% | ⚠️ 仅4个基础功能，77个AI页面未实现 |
| 词汇学习 | 60% | ✅ 词汇本、复习功能基本完成 |

**P1/P2 模块**:

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 有声书 (Audiobook) | 0% | ❌ 完全未实现 |
| 社交功能 (Agora/社区) | 0% | ❌ 完全未实现 |
| 统计分析 | 50% | ⚠️ 基础仪表盘完成 |
| 订阅/支付 | 0% | ❌ Google Play Billing 未接入 |
| 设置 | 40% | ⚠️ 基础页面有 |
| 徽章成就 | 60% | ✅ 基础功能完成 |
| 离线支持 | 45% | ⚠️ 同步队列有，内容缓存未完成 |
| 书签 | 70% | ✅ CRUD 完成 |
| 搜索 | 0% | ❌ 未实现 |

**🚨 关键缺失功能**:
1. **AI SSE 流式响应** - 代码中完全没有实现
2. **EPUB 渲染引擎** - 只有 WebView 包装器，EPUB.js 未集成
3. **77 个 AI 专用页面** - 只有 4 个基础 AI 操作
4. **有声书播放** - Media3/ExoPlayer 未集成
5. **文本-音频同步 (Whispersync)** - 未实现
6. **Google Play 支付** - 0% 完成

**剩余工作**: 约 4-6 周 | 与 iOS 功能对等预计: 9-12 周

### 5.4 管理后台

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [spec.md](dashboard/spec.md) | ✅ | 90% | Dashboard 技术规范 |
| [refactoring-plan.md](dashboard/refactoring-plan.md) | 🚧 | 60% | 重构计划 |
| [agora-design.md](dashboard/agora-design.md) | 📝 | 40% | Agora Dashboard |

**实施状态**:
- ✅ 书籍/用户/榜单/分类/作者/金句管理已完成
- 🚧 数据分析仪表盘优化中

---

## 🚀 层次 6: 发布上线

### 6.1 App Store 提交

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [app-store-submission.md](ios/app-store-submission.md) | 🚧 | 60% | App Store 提交 - 测试中 |

### 6.2 国际化

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [i18n-design.md](ios/i18n-design.md) | ✅ | 94% | 国际化 - 翻译基本完成 |

**进度**: 886/941 keys 已翻译 (94.2%)

### 6.3 法律合规

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [privacy-policy.md](legal/privacy-policy.md) | ✅ | 100% | 隐私政策（英文） |
| [privacy-policy-zh.md](legal/privacy-policy-zh.md) | ✅ | 100% | 隐私政策（中文） |
| [terms-of-service.md](legal/terms-of-service.md) | ✅ | 100% | 服务条款（英文） |
| [terms-of-service-zh.md](legal/terms-of-service-zh.md) | ✅ | 100% | 服务条款（中文） |

---

## 💰 层次 7: 商业运营

### 7.1 订阅系统

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [subscription-design.md](product/subscription-design.md) | ✅ | 95% | 订阅系统 - 后端/iOS/Webhook 已完成 |

**实施状态**:
- ✅ Apple IAP 集成完成
- ✅ Webhook 处理器完成
- ✅ PaywallView 已实现
- 🚧 等待 App Store Connect 配置

### 7.2 会员系统

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [membership-system.md](product/membership-system.md) | ✅ | 100% | 会员系统 - 全栈实现已完成 |

**实施状态**:
- ✅ 后端 Guards (SubscriptionGuard, UsageLimitGuard)
- ✅ iOS FeatureGate 已实现
- ✅ Trial Service (试用管理)
- ✅ Admin APIs (订阅管理)

### 7.3 客户支持

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [customer-support-system-design.md](features/customer-support-system-design.md) | ✅ | 90% | 客服系统 - 设计完成，含工单/订单/反馈/CSAT |

---

## 🔄 层次 8: 持续迭代

### 8.1 版本管理

| 文档 | 状态 | 进度 | 说明 |
|------|------|------|------|
| [version-management-design.md](version-control/version-management-design.md) | ✅ | 100% | 版本管理 - 已实现 semantic versioning |

**实施状态**:
- ✅ 语义化版本管理已实现
- ✅ iOS/Backend 版本同步机制已建立
- ✅ version.json 配置完成

### 8.2 升级策略

包含在版本管理文档中，支持：
- 强制更新
- 可选更新
- 功能开关

---

## 📊 整体进度统计

### 按层次分类

| 层次 | 完成度 | 状态 |
|------|--------|------|
| 1. 愿景与使命 | 100% | ✅ 已完成 |
| 2. 市场与资源 | 90% | ✅ 基本完成 |
| 3. 产品设计 | 85% | 🚧 进行中 |
| 4. 功能模块 | 70% | 🚧 进行中 |
| 5. 技术实施 | 80% | 🚧 进行中 |
| 6. 发布上线 | 75% | 🚧 进行中 |
| 7. 商业运营 | 95% | ✅ 基本完成 |
| 8. 持续迭代 | 100% | ✅ 已完成 |

### 按模块分类

| 模块 | 文档数 | 完成度 | 状态 |
|------|--------|--------|------|
| 📖 数据源 | 27 | 100% | ✅ 已整理 |
| 📱 iOS 客户端 | 10 | 85% | 🚧 进行中 |
| 🤖 Android 客户端 | 1 | 35% | 🚧 开发中 |
| 📖 阅读器 | 13 | 95% | ✅ 基本完成 |
| 🎧 有声书 | 5 | 70% | 🚧 进行中 |
| 💰 商业化 | 2 | 95% | ✅ 基本完成 |
| 🔌 API 架构 | 1 | 90% | ✅ 基本完成 |
| 🏗️ 基础设施 | 7 | 70% | 🚧 进行中 |
| 👤 账号系统 | 4 | 85% | 🚧 进行中 |
| 📚 内容管理 | 14 | 60% | 🚧 进行中 |
| 🎭 社区广场 | 3 | 60% | 🚧 进行中 |
| ✍️ 作者系统 | 5 | 90% | ✅ 基本完成 |
| 🤖 AI 功能 | 2 | 80% | 🚧 进行中 |
| 📐 算法系统 | 3 | 80% | ✅ 基本完成 |
| 🎨 设计系统 | 5 | 60% | 🚧 进行中 |
| 📊 管理后台 | 3 | 80% | ✅ 基本完成 |
| 🎖️ 特色功能 | 10 | 60% | 🚧 进行中 |
| 🆚 竞品分析 | 4 | 100% | ✅ 已完成 |
| ⚖️ 法律文档 | 4 | 100% | ✅ 已完成 |
| 🔖 版本管理 | 1 | 100% | ✅ 已完成 |

**总计**: 217 文档 | 后端模块覆盖率: 85% | 整体完成度: ~85%

---

## 🚦 第一版本发布决策清单

> **关键决策**: 29 个 | **P0 决策**: 21 个 | **已完成**: 2 个

**📄 详细文档**: [v1-release-decisions.md](product/v1-release-decisions.md)

### 快速概览

| 模块 | 进度 | 决策数 | 优先级 | 状态 | 本周行动 |
|------|------|--------|--------|------|----------|
| **会员订阅** | 95% | 2 | P0 | 🟡 待决策 | Week 3 定价策略 |
| **环境隔离** | 90% | 3 | P0 | 🟡 待决策 | Week 3 部署方案 |
| **账号体系** | 70% | 4 | P0 | 🔴 需决策 | Week 2 登录方式 |
| **日志+Crash** | 60% | 5 | P0 | 🔴 需决策 | **Week 1 工具选择** |
| **Dashboard** | 80% | 3 | P1 | 🟡 待决策 | Week 4 功能收尾 |
| **客户端** | 85% | 4 | P0 | 🟡 待决策 | Week 2 功能边界 |
| **书库内容** | 40% | 6 | P0 | 🔴 需决策 | **Week 1 导入策略** |
| **作者数据** | 90% | 2 | P1 | 🟢 基本就绪 | Week 4 数据补充 |

### 🚨 本周最紧急的 3 件事

1. **决策 4.1-4.2** - 选择日志/Crash 工具 (建议: Sentry)
2. **决策 7.1-7.6** - 确定书库导入策略 (Top 100 + Standard Ebooks)
3. **立即执行** - 启动 Gutenberg Top 100 数据抓取脚本

### 📋 4周时间线

- **Week 1**: 🔴 日志工具 + 书库策略 + 数据抓取
- **Week 2**: 🟡 账号体系 + 客户端边界 + 日志集成
- **Week 3**: 🟡 订阅定价 + 环境部署 + 书库完成
- **Week 4**: ✅ Dashboard + 作者数据 + Feature Freeze

---

## 🎯 下一步行动计划

### P0 - 紧急重要（本周）
1. ✅ 完成阅读器性能优化
2. ✅ 完成订阅支付系统集成
3. 🚧 完成 App Store 提交准备
4. ✅ 实现基础推荐算法

### P1 - 重要（本月）
1. ✅ 完善会员权益系统
2. ✅ 作者主页功能
3. ✅ 实现本地书籍导入（iOS客户端）
4. ✅ 优化搜索功能
5. 📝 补充内容数据

### P2 - 计划中（下个月）
1. 📝 勋章系统开发
2. 📝 社区功能完善
3. 📝 客服系统规划
4. 📝 多语言内容扩充

---

## 🔄 最近更新

### 2025-12-31 (文档盘点与整理)
- ✅ **文档全面盘点**
  - 更新文档总数：197+ → 217
  - 更新模块数：31 → 41
  - 更新完成度：~80% → ~85%
- ✅ **新增数据源文档**
  - 添加 [Learn Out Loud 数据盘点](sources/learnoutloud/data-inventory.md) - 教育有声书资源
  - 添加 [ThoughtAudio 数据盘点](sources/thoughtaudio/data-inventory.md) - 哲学经典有声书
  - 添加 [视频来源数据盘点](sources/video/data-inventory.md) - 英语学习视频资源
- ✅ **新增内容策略文档**
  - 添加 [Phase 1 核心书单](content/staging-phase1-booklist.md) - 300电子书+150有声书
  - 添加 [Phase 2 扩展书单](content/staging-phase2-booklist.md)
  - 添加 [Phase 3 规模化书单](content/staging-phase3-booklist.md)
- ✅ **新增有声书技术文档**
  - 添加 [多版本有声书设计](audiobook/multi-version-audiobook-design.md)
  - 添加 [跟读高亮研究](audiobook/read-along-highlight-research.md)
- ✅ **更新模块进度**
  - 有声书系统：60% → 70%
  - 内容管理：40% → 60%

### 2025-12-28 (文档全面Review与重构)
- ✅ **代码库与文档对齐分析**
  - 分析 37 个后端模块，识别文档覆盖情况
  - 分析 31 个 iOS 功能模块，确认文档完整性
  - 分析 21 个 iOS Core Services，识别新增 FontManager
- ✅ **新增特色功能文档**
  - 新增 `features/quotes-system-design.md` - 金句系统设计（后端已实现）
  - 新增 `features/postcards-system-design.md` - 明信片系统设计（后端已实现）
  - 新增 `features/author-chat-design.md` - 作者对话系统设计（后端已实现）
- ✅ **补充设计文档索引**
  - 添加 `story-timeline-design.md` 到特色功能表格
  - 添加 `character-relationship-map-design.md` 到特色功能表格
  - 添加 `intensive-reading-design.md` 到特色功能表格
- ✅ **更新 features/README.md**
  - 添加已实现功能分类（金句、明信片、作者对话）
  - 添加规划中功能分类（时间线、人物图、精读）
  - 更新代码位置索引（后端模块路径）
- ✅ **更新特色功能进度**: 30% → 60%

### 2025-12-28 (文档Review与更新)
- ✅ **docs-restructure-plan.md 已完成**
  - 4个根目录文件移动到子目录 ✅
  - 4个模块README索引已创建 ✅
  - 标记重构计划为已完成状态
- ✅ **后端模块文档覆盖率分析**
  - 34个后端模块，29个已有文档 (85%)
  - 识别待补充文档：quotes, postcards, author-chat, booklists
- ✅ **更新文档统计**
  - 总文件数：197+ markdown文件
  - 总目录数：31个子目录
  - 更新完成度：~80%

### 2025-12-28 (文档重构)
- ✅ **book-formats-analysis.md 重构**
  - 删除 `reader/book-formats-analysis.md`（违反单文件单话题原则）
  - 将"公版书主要来源"表格 merge 到 `readme.md` 2.3 节
  - 将格式详细技术分析 merge 到 `reader/format-support.md`
  - 更新相关文档链接

### 2025-12-27 (用户书籍导入)
- ✅ **iOS用户书籍导入功能完成**
  - 新增 `Features/Import/` 模块
    - `Models/ImportJob.swift` - 导入任务模型
    - `Models/ImportQuota.swift` - 配额模型
    - `Services/ImportService.swift` - API调用服务
    - `Services/FileUploadService.swift` - 预签名URL上传服务
    - `ViewModels/ImportViewModel.swift` - 导入状态管理
    - `Views/ImportEntryView.swift` - 导入入口和方法选择
    - `Views/ImportProgressView.swift` - 导入进度展示
  - 更新 `APIEndpoints.swift` 添加导入相关端点
  - 在 `LibraryView` 添加导入按钮
  - 添加40+本地化键值（支持中英文）
  - 更新 `user-book-import-status.md`: 10% → 100%
  - 更新阅读器模块进度: 90% → 95%

### 2025-12-27 (续)
- ✅ **账号注销系统实现**
  - 实现账号注销 API（30天冷静期）
    - POST `/users/me/deletion` - 发起注销
    - DELETE `/users/me/deletion` - 取消注销
    - GET `/users/me/deletion/status` - 查询状态
  - 实现冷静期定时任务 `@Cron(EVERY_DAY_AT_2AM)`
  - 实现 GDPR 合规删除逻辑 `permanentlyDeleteAccount()`
  - 配置 Sentry accountId 关联 `SentryService.setAccountContext()`
  - 更新 `account-id-design.md` 进度: 60% → 85%
  - 新增 Phase 4 数据迁移设计文档（双写+渐进迁移方案）
  - 更新账号系统整体进度: 75% → 85%

### 2025-12-27
- ✅ **Android 客户端完成度评估**
  - 基于代码分析更新完成度: 0% → 35%
  - 实际代码统计: 162 个 Kotlin 文件, ~27,000 行代码
  - 核心模块完成情况: 认证 85%, 引导 80%, 图书馆 75%, 阅读器 50%
  - 关键缺失: AI 流式响应、有声书、订阅支付、社交功能
- ✅ **客服系统设计完成**
  - 完善 `customer-support-system-design.md` 进度: 20% → 90%
  - 新增详细实施计划（5个阶段，含验收标准）
  - 新增实施进度追踪章节
  - 新增完整 FAQ 自动回复库（12个常见问题模板）
  - 新增 CSAT 客户满意度调查设计
  - 新增邮件模板示例（反馈确认、满意度调查）
  - 新增技术依赖说明
- ✅ **账号系统实现**
  - 实现 `AccountIdService` (Backend) - `apps/backend/src/common/services/account-id.service.ts`
  - 实现 `AccountIdService` (iOS) - `ios/Readmigo/Core/Services/AccountIdService.swift`
  - 更新 Prisma Schema: 添加 `AccountStatus`, `DeletionAction` 枚举和 `AccountDeletionLog` 模型
  - 集成 AccountIdService 到 UsersService
  - 更新 `account-id-design.md` 进度: 20% → 60%
- ✅ **文档结构优化**
  - 移动 `author-enrichment-design.md` → `author/enrichment-design.md`
  - 移动 `author-data-sources-comparison.md` → `author/data-sources-comparison.md`
  - 移动 `ios-logging-enhancement-design.md` → `ios/logging-enhancement-design.md`
  - 移动 `ios-offline-support.md` → `ios/offline-support.md`
- ✅ **新增模块索引**
  - 新增: `author/README.md` - 作者模块索引
  - 新增: `audiobook/README.md` - 有声书模块索引
  - 新增: `features/README.md` - 特色功能模块索引
  - 新增: `algorithm/README.md` - 算法模块索引
- ✅ **文档统计更新**
  - 更新文档总数: 80+ → 100+
  - 更新模块数: 16 → 18
  - 更新完成度: ~75% → ~78%

### 2025-12-26
- ✅ **阅读器文档重构**
  - 拆分 `reader/advanced-features-roadmap.md` (6000+行) 为独立主题文档
  - 新增: `format-support.md` - 电子书格式支持
  - 新增: `competitive-analysis.md` - 竞品分析
  - 新增: `rendering-engine.md` - 多格式渲染引擎
  - 新增: `page-turning.md` - 翻页动画系统
  - 新增: `font-management.md` - 字体管理系统
  - 新增: `reader/README.md` - 阅读器模块索引
- ✅ **学习模块文档**
  - 新增: `learning/README.md` - 学习模块索引（生词本、复习系统）
- ✅ **内容分类整理**
  - 创建 `content/book-categories/` 子目录
  - 移动书籍分类文档到子目录
- ✅ **断链修复**
  - 修复 `architecture/README.md` 中的断链
  - 删除过时的 R2 迁移报告和清理计划
- ✅ **文档结构优化**
  - 统一 `sources/` 目录命名规范：中文文件名改为英文 kebab-case
  - 移动根目录散落文件到合适目录（tech-stack→architecture, roadmap→product 等）
  - 拆分 `reader/architecture.md` (6800+行) 为核心架构和高级功能路线图
  - 删除重复文件 `design/account-system-design.md`
  - 删除片段文件 `infrastructure/logging.md`
  - 更新所有文档链接引用

### 2025-12-25
- ✅ **重新设计文档架构**
  - 创建8层架构体系：愿景→市场→产品→模块→技术→发布→运营→迭代
  - 按战略到执行的层次重组所有文档
  - 添加清晰的文档导航和进度统计
- ✅ **文档整理完成**
  - 创建 `sources/` 文件夹，重新组织公共领域数据源文档
  - 拆分超大文件为主题文件（单文件单话题）
  - 合并重复文件，消除冗余

### 2025-12-24
- ✅ 作者系统完成到90%
- ✅ 会员权益系统全栈完成
- ✅ 书籍推荐算法后端实现
- ✅ Apple Webhook 处理器完成

---

## 📝 文档使用指南

### 快速导航

0. **快速入门** → [QUICK-START.md](QUICK-START.md) - 技术栈、依赖服务、产品特点一览
1. **了解产品愿景** → [产品需求文档](product/prd.md)
2. **评估可行性** → [可行性评估](product/feasibility-assessment.md)
3. **了解数据源** → [sources/](sources/)
4. **设计产品功能** → [发现页设计](sources/gutenberg/discovery-page-design.md)
5. **技术实现** → [后端架构](api/backend-architecture.md)
6. **发布上线** → [App Store 提交](ios/app-store-submission.md)

### 文档命名规范

- 文件名使用小写字母和连字符（kebab-case）
- 文件名统一使用英文，确保跨平台兼容
- 每个文档需包含实施进度章节
- 文档更新时需同步更新本 README

---

## 🤝 贡献指南

### 添加新文档
1. 确定文档所属层次和模块
2. 选择合适的文件夹
3. 使用规范的文件命名
4. 在文档末尾添加实施进度章节
5. 更新本 README 的相应部分

### 更新进度
1. 在文档中更新实施进度百分比
2. 更新本 README 中的进度表格
3. 在"最近更新"章节记录变更

---

*最后更新: 2025-12-31 (文档盘点与整理)*
