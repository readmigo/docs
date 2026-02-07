# Internet Archive / Open Library 官方渠道数据盘点

> 从产品和运营角度，梳理 Internet Archive 和 Open Library 可用数据及其对 Readmigo 的价值

---

### 1.1 Internet Archive

| 项目 | 描述 |
|------|------|
| **网站** | https://archive.org |
| **定位** | 非营利数字图书馆，保存网页、书籍、音视频等 |
| **数字化书籍** | 3000万+ 本 |
| **成立时间** | 1996年 |
| **运营模式** | 非营利组织 |

### 1.2 Open Library

| 项目 | 描述 |
|------|------|
| **网站** | https://openlibrary.org |
| **定位** | "为每本已出版的书创建一个网页" |
| **目录规模** | 2000万+ editions，600万+ authors |
| **关系** | Internet Archive 的图书馆项目 |
| **特点** | 完整的图书元数据库 + 借阅系统 |

### 1.3 数据类型

| 类型 | 说明 | 对 Readmigo 价值 |
|------|------|-----------------|
| **公共领域书籍** | 可免费下载 EPUB/PDF | ⭐⭐⭐ 核心内容来源 |
| **借阅书籍** | 需登录借阅，有 DRM | ❌ 无法直接使用 |
| **元数据** | 丰富的书籍/作者信息 | ⭐⭐⭐ 补充书籍数据 |

---

### 2.2 标识符系统

| 标识符 | 格式 | 示例 |
|--------|------|------|
| **OLID (Work)** | OL + 数字 + W | `OL27258W` |
| **OLID (Edition)** | OL + 数字 + M | `OL7353617M` |
| **OLID (Author)** | OL + 数字 + A | `OL33421A` |
| **ISBN** | 10位或13位 | `9780141301136` |
| **OCLC** | OCLC 编号 | `ocn123456789` |
| **LCCN** | 国会图书馆编号 | `2020001234` |

---

### 3.1 API 概览

| API | 用途 | URL |
|-----|------|-----|
| **Search API** | 搜索书籍、作者 | `/search.json` |
| **Books API** | 按标识符查询 | `/api/books` |
| **Works API** | 获取作品详情 | `/works/{olid}.json` |
| **Editions API** | 获取版本详情 | `/books/{olid}.json` |
| **Authors API** | 获取作者信息 | `/authors/{olid}.json` |
| **Covers API** | 获取封面图 | `covers.openlibrary.org` |
| **Read API** | 检查可读性 | `/api/volumes/brief/` |

#### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | Work ID |
| `title` | string | 标题 |
| `authors` | array | 作者列表（关联 author key） |
| `description` | string/object | 书籍描述 |
| `subjects` | array | 主题分类 |
| `subject_places` | array | 地点主题 |
| `subject_times` | array | 时代主题 |
| `subject_people` | array | 人物主题 |
| `first_publish_date` | string | 首次出版日期 |
| `covers` | array | 封面 ID 列表 |

#### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | Edition ID |
| `title` | string | 版本标题 |
| `publishers` | array | 出版商 |
| `publish_date` | string | 出版日期 |
| `number_of_pages` | int | 页数 |
| `isbn_10` | array | ISBN-10 |
| `isbn_13` | array | ISBN-13 |
| `languages` | array | 语言（关联 language key） |
| `covers` | array | 封面 ID |
| `works` | array | 关联的 Work |
| `ocaid` | string | Internet Archive ID |

#### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | Author ID |
| `name` | string | 作者名 |
| `personal_name` | string | 个人名 |
| `alternate_names` | array | 别名 |
| `bio` | string/object | 简介 |
| `birth_date` | string | 出生日期 |
| `death_date` | string | 去世日期 |
| `wikipedia` | string | Wikipedia 链接 |
| `photos` | array | 照片 ID |

### 3.7 Read API（Partner API）

检查书籍是否可在线阅读：

---

### 4.1 Data Dumps

> ⚠️ **重要**：不要使用 API 进行批量下载，这会影响服务稳定性。请使用官方数据转储。

| 转储类型 | 文件名模式 | 大小（压缩） |
|----------|-----------|-------------|
| **Works** | `ol_dump_works_*.txt.gz` | ~10GB |
| **Editions** | `ol_dump_editions_*.txt.gz` | ~15GB |
| **Authors** | `ol_dump_authors_*.txt.gz` | ~2GB |
| **All** | `ol_dump_*.txt.gz` | ~45GB |

**下载地址**：https://openlibrary.org/developers/dumps

**历史存档**：https://archive.org/details/ol_exports?sort=-publicdate

### 4.2 数据格式

Tab 分隔的文本文件：

### 4.3 处理工具推荐

| 工具 | 用途 |
|------|------|
| **DuckDB** | 快速查询大型 JSON 数据 |
| **PostgreSQL** | 导入后建立索引查询 |
| **openlibrary-client** | Python 客户端库 |

---

### 5.1 公共领域书籍

Internet Archive 托管大量公共领域书籍，可直接下载：

### 5.2 文件格式

每本书通常提供多种格式：

| 格式 | 文件后缀 | 说明 |
|------|----------|------|
| **EPUB** | `_epub.epub` | 标准电子书格式 |
| **PDF** | `.pdf` | 扫描版 PDF |
| **Kindle** | `_kindle.mobi` | Kindle 格式 |
| **Text** | `_djvu.txt` | 纯文本 |
| **DAISY** | `_daisy.zip` | 无障碍格式 |

#### 响应字段

| 字段 | 说明 |
|------|------|
| `metadata.title` | 标题 |
| `metadata.creator` | 作者 |
| `metadata.description` | 描述 |
| `metadata.subject` | 主题 |
| `metadata.language` | 语言 |
| `metadata.date` | 出版日期 |
| `metadata.publisher` | 出版商 |
| `files` | 可下载文件列表 |

---

### 6.1 数据字段映射

| Readmigo 字段 | Open Library 来源 | 可用性 |
|---------------|-------------------|--------|
| `title` | Work/Edition: `title` | ✅ 直接可用 |
| `author` | Authors API: `name` | ✅ 直接可用 |
| `description` | Work: `description` | ✅ 大部分有 |
| `language` | Edition: `languages` | ✅ 直接可用 |
| `subjects` | Work: `subjects` | ✅ 丰富 |
| `genres` | 从 subjects 映射 | ⚠️ 需要转换 |
| `epubUrl` | IA: `files` | ⚠️ 仅公共领域 |
| `coverUrl` | Covers API | ✅ 丰富 |
| `wordCount` | 无 | ❌ 需自行处理 |
| `publishedAt` | Work: `first_publish_date` | ✅ 有原始出版日期 |
| `sourceId` | OLID | ✅ 直接可用 |
| `isbn` | Edition: `isbn_10/13` | ✅ 有 |

### 6.2 Open Library 独特价值

| 数据 | 价值 |
|------|------|
| **原始出版日期** | PG 没有，OL 有 |
| **丰富的书籍描述** | 补充 PG/SE 缺失的简介 |
| **作者详细信息** | 生卒日期、简介、照片 |
| **多版本信息** | 追踪不同版本和翻译 |
| **ISBN 关联** | 便于去重和关联外部数据 |
| **高质量封面** | 补充封面缺失的书籍 |

---

### 7.3 速率限制

| 服务 | 限制 |
|------|------|
| Open Library API | 无官方限制，建议 1 req/sec |
| Internet Archive API | 无官方限制，建议 1 req/sec |
| Covers API | 无限制 |
| Data Dumps | 无限制（推荐用种子下载） |

---

### 8.1 借阅书籍（Lending Library）

> ⚠️ **Readmigo 不能使用借阅书籍**

- 借阅书籍有 DRM 保护
- 需要用户登录 IA 账号
- 2024年法院判决对 IA 借阅模式不利
- 部分书籍已下架

### 8.2 公共领域书籍

✅ **可自由使用**

- 1928年前出版的美国作品
- 明确标记为 `public domain` 的书籍
- 可下载、修改、商用

### 8.3 判断方法

通过 Read API 检查 `status` 字段：
- `full access` - 公共领域，可下载
- `borrow available` - 需借阅
- `borrow unavailable` - 借阅中

---

## 9. 与其他数据源对比

| 维度 | Open Library | Project Gutenberg | Standard Ebooks |
|------|--------------|-------------------|-----------------|
| **元数据丰富度** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **书籍描述** | 大部分有 | 无 | 详细 |
| **原始出版日期** | ✅ | ❌ | ❌ |
| **作者信息** | 详细 | 基础 | 基础 |
| **封面质量** | 高 | 中等 | 高 |
| **EPUB 质量** | 参差不齐 | 参差不齐 | 高 |
| **API** | 官方 REST | 第三方 | Feed only |
| **书籍数量** | 2000万+ 元数据 | 76,000+ | ~1,000 |

---

## 10. 参考资源

- [Open Library API 文档](https://openlibrary.org/developers/api)
- [Open Library Data Dumps](https://openlibrary.org/developers/dumps)
- [Internet Archive Metadata API](https://archive.org/developers/metadata-schema/)
- [Internet Archive Search API](https://archive.org/advancedsearch.php)
- [openlibrary-client (Python)](https://github.com/internetarchive/openlibrary-client)
- [Open Library GitHub](https://github.com/internetarchive/openlibrary)

---

*文档更新日期: 2024-12-24*
