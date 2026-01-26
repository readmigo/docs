# Google Books API 参考文档

> 用于补充书籍封面图和元数据的外部 API 来源

---

## 1. 概述

| 项目 | 描述 |
|------|------|
| **API 地址** | https://www.googleapis.com/books/v1 |
| **官方文档** | https://developers.google.com/books |
| **认证方式** | API Key（公开数据）或 OAuth 2.0（用户数据） |
| **费用** | 免费（有配额限制） |
| **主要用途** | 获取书籍封面图、元数据补充 |

### 1.1 对 Readmigo 的价值

| 用途 | 价值评级 | 说明 |
|------|----------|------|
| **封面图获取** | ⭐⭐⭐⭐ | 多种尺寸可选，覆盖广泛 |
| **元数据补充** | ⭐⭐⭐ | 书名、作者、ISBN、描述等 |
| **书籍搜索** | ⭐⭐⭐ | 支持 ISBN、标题、作者搜索 |
| **全文内容** | ❌ | 受版权限制，大部分无法获取 |

---

## 2. 封面图 API

### 2.1 获取方式

封面图通过 `volumeInfo.imageLinks` 字段返回：

```
GET https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}&key={API_KEY}
```

### 2.2 可用尺寸

| 字段 | 大约宽度 | 推荐用途 |
|------|----------|----------|
| `smallThumbnail` | ~80px | 列表缩略图 |
| `thumbnail` | ~128px | 默认缩略图 |
| `small` | ~300px | 卡片展示 |
| `medium` | ~575px | 详情页中等尺寸 |
| `large` | ~800px | 详情页大图 |
| `extraLarge` | ~1280px | 高清展示 |

> ⚠️ 并非所有书籍都有全部尺寸，部分书籍仅有 `smallThumbnail` 和 `thumbnail`

### 2.3 响应示例

```json
{
  "items": [
    {
      "id": "zyTCAlFPjgYC",
      "volumeInfo": {
        "title": "The Google Story",
        "authors": ["David A. Vise"],
        "imageLinks": {
          "smallThumbnail": "http://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=5",
          "thumbnail": "http://books.google.com/books/content?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=1"
        }
      }
    }
  ]
}
```

### 2.4 获取更大尺寸的技巧

修改返回 URL 中的 `zoom` 参数可获取不同尺寸：

| zoom 值 | 效果 |
|---------|------|
| `zoom=0` | 最大尺寸（如果可用） |
| `zoom=1` | 默认缩略图 |
| `zoom=2` | 小尺寸 |
| `zoom=5` | 最小缩略图 |

### 2.5 注意事项

- 返回的图片 URL 默认是 **HTTP**，建议替换为 **HTTPS**
- 图片 URL 包含过期参数，建议缓存图片本身而非 URL
- 部分书籍可能无封面图（`imageLinks` 字段缺失）

---

## 3. 搜索 API

### 3.1 基本搜索

```
GET https://www.googleapis.com/books/v1/volumes?q={query}&key={API_KEY}
```

### 3.2 搜索参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `q` | 搜索关键词 | `q=harry+potter` |
| `q=intitle:` | 按标题搜索 | `q=intitle:pride+prejudice` |
| `q=inauthor:` | 按作者搜索 | `q=inauthor:jane+austen` |
| `q=isbn:` | 按 ISBN 搜索 | `q=isbn:9780134685991` |
| `q=subject:` | 按主题搜索 | `q=subject:fiction` |
| `startIndex` | 分页起始（从0开始） | `startIndex=10` |
| `maxResults` | 每页数量（默认10，最大40） | `maxResults=20` |
| `filter` | 过滤条件 | `filter=free-ebooks` |
| `langRestrict` | 语言限制 | `langRestrict=en` |

### 3.3 过滤选项

| filter 值 | 说明 |
|-----------|------|
| `partial` | 部分预览可用 |
| `full` | 完整预览可用 |
| `free-ebooks` | 免费电子书 |
| `paid-ebooks` | 付费电子书 |
| `ebooks` | 所有电子书 |

---

## 4. 元数据字段

### 4.1 volumeInfo 字段映射

| Google Books 字段 | Readmigo 字段 | 可用性 |
|-------------------|---------------|--------|
| `title` | `title` | ✅ 总是有 |
| `authors` | `author` | ✅ 大部分有 |
| `description` | `description` | ⚠️ 部分有 |
| `publishedDate` | `publishedAt` | ✅ 大部分有 |
| `pageCount` | - | ⚠️ 部分有 |
| `categories` | `genres` | ⚠️ 需映射 |
| `language` | `language` | ✅ 有 |
| `industryIdentifiers` | `isbn` | ✅ 有 ISBN-10/13 |
| `imageLinks` | `coverUrl` | ✅ 大部分有 |

### 4.2 industryIdentifiers 示例

```json
{
  "industryIdentifiers": [
    { "type": "ISBN_10", "identifier": "0134685997" },
    { "type": "ISBN_13", "identifier": "9780134685991" }
  ]
}
```

---

## 5. 与 Readmigo 集成策略

### 5.1 封面图补充流程

```
┌─────────────────────────────────────────────────────────────┐
│  场景：书籍缺少封面图                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: 优先使用 ISBN 查询                                   │
│  └── GET /volumes?q=isbn:{isbn13}                           │
│                                                             │
│  Step 2: 无 ISBN 时用标题+作者查询                            │
│  └── GET /volumes?q=intitle:{title}+inauthor:{author}       │
│                                                             │
│  Step 3: 提取封面 URL                                        │
│  └── items[0].volumeInfo.imageLinks.thumbnail               │
│  └── 替换 http:// 为 https://                               │
│  └── 修改 zoom=0 获取更大尺寸                                 │
│                                                             │
│  Step 4: 下载并上传到 R2                                      │
│  └── 避免直接引用 Google URL（可能过期）                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 推荐使用优先级

封面图来源优先级：

```
1. 书籍自带封面（EPUB 内嵌）
2. Standard Ebooks 封面
3. Open Library Covers API
4. Google Books API ← 作为补充来源
5. 生成默认封面
```

---

## 6. API 配额与限制

| 限制类型 | 免费配额 |
|----------|----------|
| 每日请求数 | 1,000 次（可申请提升） |
| 每秒请求数 | 建议 1-2 次 |
| 单次最大结果 | 40 条 |

### 6.1 获取 API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目或选择现有项目
3. 启用 Books API
4. 创建 API Key（凭据 → 创建凭据 → API 密钥）
5. 建议限制 Key 的使用范围（仅 Books API）

---

## 7. 与其他封面来源对比

| 来源 | 覆盖范围 | 图片质量 | API 稳定性 | 限制 |
|------|----------|----------|------------|------|
| **Google Books** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 需 API Key |
| **Open Library** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 无限制 |
| **EPUB 内嵌** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | - | 仅自有书籍 |
| **Standard Ebooks** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 书籍数量少 |

---

## 8. 参考资源

- [Google Books API 官方文档](https://developers.google.com/books/docs/v1/using)
- [Volume 资源参考](https://developers.google.com/books/docs/v1/reference/volumes)
- [Dynamic Links](https://developers.google.com/books/docs/dynamic-links)
- [Google Cloud Console](https://console.cloud.google.com/)

---

*文档创建日期: 2025-01-04*
