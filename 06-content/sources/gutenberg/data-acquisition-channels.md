## 概述

本文档从产品和运营角度，全面盘点 Project Gutenberg 官方渠道可获取的数据资源，评估其对 ReadMigo 产品的价值和必要性。

---

## 官方数据获取渠道总览

| 渠道 | 类型 | 更新频率 | 访问方式 | 产品价值 |
|------|------|----------|----------|----------|
| **OPDS Feed** | 结构化数据 | 实时 | HTTP/XML | ⭐⭐⭐⭐⭐ |
| **RSS Feed** | 增量更新 | 每日 | HTTP/XML | ⭐⭐⭐⭐ |
| **RDF Catalog** | 完整目录 | 每日 | 下载/解压 | ⭐⭐⭐⭐⭐ |
| **MARC Records** | 图书馆格式 | 定期 | 第三方托管 | ⭐⭐ |
| **网页数据** | 排行榜/统计 | 实时 | 网页抓取 | ⭐⭐⭐⭐ |
| **镜像服务** | 完整内容 | 实时同步 | rsync | ⭐⭐⭐ |

---

## 第三方 API 方案

由于官方无 API，社区提供了多个第三方方案：

### Gutendex（推荐）

| 项目 | 描述 |
|------|------|
| **网站** | https://gutendex.com |
| **GitHub** | github.com/garethbjohnson/gutendex |
| **类型** | 开源 Django 应用，可自托管 |
| **特点** | 无需 API Key，免费使用 |

#### 查询参数

| 参数 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `search` | string | 搜索标题/作者 | `?search=dickens` |
| `languages` | string | 语言过滤（逗号分隔） | `?languages=en,fr` |
| `topic` | string | 主题/分类过滤 | `?topic=children` |
| `sort` | string | 排序方式 | `popular` / `ascending` / `descending` |
| `author_year_start` | int | 作者出生年起始 | `?author_year_start=1800` |
| `author_year_end` | int | 作者出生年结束 | `?author_year_end=1900` |
| `copyright` | string | 版权状态 | `true` / `false` / `null` |
| `ids` | string | 指定多个ID | `?ids=11,84,1342` |
| `mime_type` | string | 文件格式过滤 | `?mime_type=text/html` |

---

#### 数据规模

| 指标 | 数量 | 说明 |
|------|------|------|
| 电子书总量 | **76,000+** | 持续增长 |
| 英语书籍 | ~55,000 | 占比约 72% |
| 中文书籍 | ~2,000 | 主要是古典文学 |
| 其他语言 | ~19,000 | 60+ 语言 |
| 每日新增 | 10-50 本 | 由志愿者校对完成 |

---

#### 可获取的元数据字段

| 字段 | 来源 | 产品价值 | 必要性 |
|------|------|----------|--------|
| **书籍 ID** | OPDS/RDF | 唯一标识符 | ✅ 必须 |
| **标题** | OPDS/RDF | 展示、搜索 | ✅ 必须 |
| **作者** | OPDS/RDF | 展示、筛选、推荐 | ✅ 必须 |
| **作者生卒年** | RDF | 作者页面、历史背景 | ⭐ 推荐 |
| **语言** | OPDS/RDF | 筛选、语言学习功能 | ✅ 必须 |
| **主题/分类** | RDF | 分类浏览、推荐 | ✅ 必须 |
| **书架分类** | RDF | 精细分类 | ⭐ 推荐 |
| **下载量** | OPDS/网页 | 热门排行、冷启动推荐 | ✅ 必须 |
| **发布日期** | OPDS/RDF | 新书栏目 | ⭐ 推荐 |
| **版权状态** | RDF | 合规检查 | ✅ 必须 |
| **可用格式** | OPDS/RDF | 下载选项 | ⭐ 推荐 |

#### RDF Catalog (完整元数据)

**RDF 提供的额外信息:**
- 详细的 Dublin Core 元数据
- 完整的 Subject 和 Bookshelf 标签
- 所有可用文件格式及 URL
- 贡献者信息 (translator, editor 等)

---

#### 数据质量评估

| 指标 | 情况 | 说明 |
|------|------|------|
| 覆盖率 | ~60-70% | 部分老书籍无封面 |
| 图片质量 | 中等 | 适合移动端展示 |
| 尺寸规格 | 固定 | medium ~300px, small ~150px |
| 格式 | JPEG | 兼容性好 |

#### 产品建议

| 场景 | 建议方案 |
|------|----------|
| 有官方封面 | 直接使用官方图片 |
| 无官方封面 | 生成占位封面 (书名+作者) |
| 高质量需求 | 对接 Open Library Covers API 补充 |

---

#### 官方排行榜页面

| 排行榜 | URL | 时间维度 | 产品价值 |
|--------|-----|----------|----------|
| Top 100 书籍 | `/browse/scores/top` | 昨日/7天/30天 | ⭐⭐⭐⭐⭐ |
| Top 100 作者 | `/browse/scores/top` | 昨日/7天/30天 | ⭐⭐⭐⭐⭐ |
| Top 1000 书籍 | `/browse/scores/top1000.php` | 30天 | ⭐⭐⭐⭐ |
| 语言排行榜 | `/browse/scores/top-{lang}.php` | 30天 | ⭐⭐⭐ |

#### 可获取的统计数据

| 数据 | 获取方式 | 运营价值 |
|------|----------|----------|
| **全球下载量** | 排行榜页面/OPDS | 热门推荐的权威依据 |
| **每日下载量** | 排行榜页面差值 | 趋势分析、实时热门 |
| **作者热度** | 作者排行榜 | 作者推荐、IP 运营 |
| **语言分布** | 语言排行榜 | 本地化优先级参考 |

---

#### 主要分类映射

| Gutenberg 分类 | 产品分类建议 | 书籍数量估计 |
|----------------|--------------|--------------|
| Fiction | Fiction (小说) | 15,000+ |
| Adventure | Adventure (冒险) | 3,000+ |
| Detective Fiction | Mystery (悬疑) | 2,500+ |
| Science Fiction | Sci-Fi (科幻) | 2,000+ |
| Fantasy | Fantasy (奇幻) | 1,500+ |
| Gothic Fiction | Horror (恐怖) | 800+ |
| Love stories | Romance (浪漫) | 1,200+ |
| Children's Fiction | Children's (儿童) | 4,000+ |
| Poetry | Poetry (诗歌) | 5,000+ |
| Drama | Drama (戏剧) | 2,000+ |
| Philosophy | Philosophy (哲学) | 1,500+ |
| History | History (历史) | 8,000+ |
| Biography | Biography (传记) | 3,000+ |

---

#### 官方有声书来源

| 来源 | 数量 | 类型 | 产品价值 |
|------|------|------|----------|
| **LibriVox** | 20,648+ | 人声朗读 | ⭐⭐⭐⭐⭐ |
| **Microsoft AI** | ~5,000 | AI 合成 | ⭐⭐⭐⭐ |

---

#### RSS 数据字段

| 字段 | 内容 | 产品用途 |
|------|------|----------|
| `<title>` | 书名 | 新书展示 |
| `<link>` | 书籍页面 URL | 详情跳转 |
| `<description>` | 简介 | 预览展示 |
| `<pubDate>` | 发布时间 | 排序 |
| `<dc:creator>` | 作者 | 展示 |

---

### 数据源优先级

| 优先级 | 数据源 | 用途 | 频率 |
|--------|--------|------|------|
| P0 | OPDS Feed | 热门书籍、搜索 | 实时/每日 |
| P0 | EPUB 下载 | 阅读内容 | 按需 |
| P1 | RDF Catalog | 完整元数据同步 | 每周 |
| P1 | 排行榜页面 | 热门数据 | 每日 |
| P2 | RSS Feed | 新书更新 | 每日 |
| P2 | LibriVox API | 有声书 | 按需 |
| P3 | 封面图片 | 视觉展示 | 按需 |

---

### 速率限制与合规

| 规则 | 要求 | 建议实践 |
|------|------|----------|
| 请求频率 | 每日 <100 文件/IP | 批量下载时间隔 2+ 秒 |
| User-Agent | 标识为非浏览器时可能被限制 | 使用合理的 UA 标识 |
| 镜像同步 | 推荐使用 rsync | 大批量同步使用镜像 |
| 致谢要求 | 建议注明来源 | App 内标注 "Books from Project Gutenberg" |

---

### 核心数据清单

| 数据类型 | 来源 | 必要性 | 获取难度 | 当前状态 |
|----------|------|--------|----------|----------|
| EPUB 书籍内容 | 官方下载 | ✅ 必须 | 低 | ✅ 已实现 |
| 书籍元数据 | OPDS/RDF | ✅ 必须 | 低 | ✅ 已实现 |
| 封面图片 | 官方 URL | ✅ 必须 | 低 | ✅ 已实现 |
| 下载量/排行 | OPDS/网页 | ✅ 必须 | 低 | ✅ 已实现 |
| 分类标签 | RDF | ⭐ 推荐 | 中 | 🔄 部分 |
| 作者详细信息 | RDF | ⭐ 推荐 | 中 | ❌ 未实现 |
| 有声书链接 | LibriVox | ⭐ 推荐 | 中 | ❌ 未实现 |
| 新书更新 | RSS | ⭐ 推荐 | 低 | ❌ 未实现 |

---

## 参考链接

- [Project Gutenberg OPDS](https://www.gutenberg.org/ebooks/search.opds/)
- [Project Gutenberg RSS Feed](http://www.gutenberg.org/cache/epub/feeds/today.rss)
- [RDF Catalog Download](https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2)
- [LibriVox API](https://librivox.org/api/info)
- [Robot Access Policy](https://www.gutenberg.org/policy/robot_access.html)
- [Bookshelves 分类](https://www.gutenberg.org/ebooks/bookshelf/)

---

*文档更新日期: 2024-12-25*
