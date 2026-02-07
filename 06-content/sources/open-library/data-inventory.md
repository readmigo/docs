# Open Library 数据盘点

> 从产品和运营角度，梳理 Open Library 元数据资源及其对 Readmigo 的价值

---

## 1. Open Library 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://openlibrary.org |
| **定位** | 开放图书馆，书籍元数据平台 |
| **数据量** | 3000万+ 书籍记录 |
| **运营方** | Internet Archive |
| **许可证** | GNU Affero GPL（代码）|
| **API** | ✅ 完整 RESTful API |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 数据量巨大（3000万+） | 禁止 API 批量下载 |
| 完整 RESTful API | 需设置 User-Agent |
| 高质量封面图片 | 部分书籍数据不完整 |
| 免费使用 | 速率限制 |
| 与 IA 生态整合 | - |

---

### 2.1 API 总览

| API | 用途 | 端点 |
|-----|------|------|
| **Books API** | 书籍详情 | `/api/books` |
| **Search API** | 搜索 | `/search.json` |
| **Covers API** | 封面图片 | `covers.openlibrary.org` |
| **Authors API** | 作者信息 | `/authors/{OLID}.json` |
| **Subjects API** | 主题分类 | `/subjects/{subject}.json` |
| **Works API** | 作品详情 | `/works/{OLID}.json` |
| **Editions API** | 版本详情 | `/books/{OLID}.json` |

#### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| **key** | 标识类型 | `isbn`, `olid`, `id` |
| **value** | 标识值 | `0451526538`, `OL7353617M` |
| **size** | 尺寸 | `S`, `M`, `L` |

#### 尺寸规格

| 尺寸 | 最大宽度 |
|------|----------|
| **S** | 小尺寸 |
| **M** | 中尺寸（推荐列表使用） |
| **L** | 大尺寸（推荐详情页使用） |

#### 查询参数

| 参数 | 说明 | 示例 |
|------|------|------|
| **bibkeys** | 书籍标识符 | `ISBN:0451526538` |
| **format** | 返回格式 | `json`, `javascript` |
| **jscmd** | 数据详细程度 | `data`, `details`, `viewapi` |

#### 支持的标识符类型

| 类型 | 格式 | 示例 |
|------|------|------|
| **ISBN 10** | `ISBN:xxxxxxxxxx` | `ISBN:0451526538` |
| **ISBN 13** | `ISBN:xxxxxxxxxxxxx` | `ISBN:9780451526533` |
| **OCLC** | `OCLC:xxxxxxxx` | `OCLC:36792831` |
| **LCCN** | `LCCN:xxxxxxxx` | `LCCN:93005405` |
| **OLID** | `OLID:OLxxxxxxM` | `OLID:OL7353617M` |

#### 响应字段（jscmd=data）

| 字段 | 说明 |
|------|------|
| **title** | 书名 |
| **authors** | 作者列表 |
| **publishers** | 出版商 |
| **publish_date** | 出版日期 |
| **number_of_pages** | 页数 |
| **subjects** | 主题分类 |
| **cover** | 封面 URL（small/medium/large） |
| **excerpts** | 摘录 |
| **links** | 相关链接 |

#### 查询参数

| 参数 | 说明 | 示例 |
|------|------|------|
| **q** | 通用搜索 | `q=the+lord+of+the+rings` |
| **title** | 标题搜索 | `title=pride+and+prejudice` |
| **author** | 作者搜索 | `author=jane+austen` |
| **subject** | 主题搜索 | `subject=fiction` |
| **limit** | 返回数量 | `limit=10` |
| **offset** | 分页偏移 | `offset=0` |
| **fields** | 指定返回字段 | `fields=title,author_name,cover_i` |

#### 响应字段

| 字段 | 说明 |
|------|------|
| **numFound** | 总结果数 |
| **docs** | 结果列表 |
| **docs[].title** | 书名 |
| **docs[].author_name** | 作者名 |
| **docs[].cover_i** | 封面 ID |
| **docs[].first_publish_year** | 首次出版年份 |
| **docs[].key** | Work OLID |

#### 响应字段

| 字段 | 说明 |
|------|------|
| **name** | 作者名 |
| **birth_date** | 出生日期 |
| **death_date** | 去世日期 |
| **bio** | 简介 |
| **photos** | 照片 ID 列表 |
| **links** | 相关链接 |

---

### 3.2 批量数据获取

Open Library 禁止通过 API 批量下载，但提供月度数据转储：

| 数据类型 | 说明 | 获取方式 |
|----------|------|----------|
| **Works dump** | 所有作品数据 | 月度转储下载 |
| **Authors dump** | 所有作者数据 | 月度转储下载 |
| **Editions dump** | 所有版本数据 | 月度转储下载 |

获取方式：联系 openlibrary@archive.org

---

### 4.1 速率限制

| 场景 | 要求 |
|------|------|
| **高频调用** | 必须设置 User-Agent Header |
| **批量下载** | 禁止，需使用数据转储 |
| **建议频率** | 1 请求/秒 |

### 4.2 归属要求

| 场景 | 要求 |
|------|------|
| **封面图片** | 公开页面需使用 covers.openlibrary.org |
| **归属链接** | 建议提供回链到 Open Library |

### 4.3 商业使用

| 项目 | 状态 |
|------|------|
| **API 使用** | ✅ 允许 |
| **数据使用** | ✅ 允许（遵守条款） |
| **封面图片** | ✅ 允许（建议回链） |
| **批量转售** | ⚠️ 需确认 |

---

### 5.1 功能场景

| 功能 | Open Library 数据 | 说明 |
|------|-------------------|------|
| **书籍详情页** | 封面(L)、描述、主题 | 丰富展示 |
| **书籍列表** | 封面(M) | 视觉吸引 |
| **作者页面** | 作者照片、简介、生卒年 | 完整信息 |
| **分类浏览** | 主题标签 | 多维度分类 |
| **搜索增强** | ISBN/OCLC 支持 | 精确匹配 |

### 5.3 实施优先级

| 阶段 | 任务 | 价值 |
|------|------|------|
| **Phase 1** | 集成 Covers API，补充书籍封面 | 提升视觉效果 |
| **Phase 1** | 集成 Books API，补充描述 | 丰富内容展示 |
| **Phase 2** | 集成 Authors API，补充作者信息 | 完整作者页面 |
| **Phase 2** | 集成 Subjects API，补充分类 | 多维度浏览 |
| **Phase 3** | 建立自动同步机制 | 数据保持最新 |

---

### 官方文档

- [Open Library APIs](https://openlibrary.org/developers/api)
- [Books API 文档](https://openlibrary.org/dev/docs/api/books)
- [Covers API 文档](https://openlibrary.org/dev/docs/api/covers)
- [Search API 文档](https://openlibrary.org/dev/docs/api/search)
- [Read API 文档](https://openlibrary.org/dev/docs/api/read)

### 数据转储

- [Open Library Data Dumps](https://openlibrary.org/developers/dumps)
- 联系邮箱: openlibrary@archive.org

### 社区资源

- [Open Library GitHub](https://github.com/internetarchive/openlibrary)
- [Open Library Blog](https://blog.openlibrary.org/)

---

*文档更新日期: 2025-12-30*
