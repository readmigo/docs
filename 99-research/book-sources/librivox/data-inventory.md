# LibriVox 官方渠道数据盘点

> 从产品和运营角度，梳理 LibriVox 有声书数据及其对 Readmigo 的价值

---

## 1. LibriVox 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://librivox.org |
| **定位** | 免费公共领域有声书志愿者朗读项目 |
| **录音数量** | 20,000+ 录音（截至 2024年12月） |
| **成立时间** | 2005年 |
| **关联项目** | Project Gutenberg（文本来源）、Internet Archive（音频托管） |
| **运营模式** | 志愿者项目 |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 完全免费、无版权限制 | 朗读质量参差不齐 |
| 有官方 API | 大部分为英语 |
| 与 PG 书籍关联 | 录音风格不统一 |
| 多种音频格式 | 部分录音有背景噪音 |
| 持续更新 | 无专业后期制作 |

### 对 Readmigo 的价值

```
✅ 可为公版书提供免费有声书版本
✅ 听力+阅读结合，增强学习体验
✅ 与 Project Gutenberg 书籍天然关联
✅ 可作为"跟读"、"听读"功能的素材
```

---

## 2. 官方 API

### 2.1 API 端点

```
Base URL: https://librivox.org/api/feed/audiobooks
```

### 2.2 查询方式

支持两种 URL 风格：

```
# 方式1: 查询参数
https://librivox.org/api/feed/audiobooks/?id=52

# 方式2: RESTful 路径
https://librivox.org/api/feed/audiobooks/id/52
```

### 2.3 查询参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | int | 有声书 ID | `?id=52` |
| `title` | string | 标题搜索（支持 ^ 前缀匹配） | `?title=^pride` |
| `author` | string | 作者搜索 | `?author=Shakespeare` |
| `genre` | string | 类型过滤 | `?genre=plays` |
| `since` | int | UNIX 时间戳，获取此后新增 | `?since=1704067200` |
| `limit` | int | 返回数量（默认 50） | `?limit=100` |
| `offset` | int | 分页偏移（默认 0） | `?offset=50` |
| `format` | string | 响应格式 | `?format=json` |
| `extended` | int | 1=返回完整数据 | `?extended=1` |
| `fields` | string | 指定返回字段 | `?fields={id,title,authors}` |

### 2.4 响应格式

支持的响应格式：

| 格式 | 参数值 | 说明 |
|------|--------|------|
| **XML** | 默认 | 默认格式 |
| **JSON** | `format=json` | 推荐使用 |
| **JSONP** | `format=jsonp` | 跨域调用 |
| **PHP Array** | `format=php` | PHP 序列化 |

### 2.5 API 响应字段

#### 基础响应（默认）

```json
{
  "books": [
    {
      "id": "52",
      "title": "Pride and Prejudice",
      "description": "...",
      "url_text_source": "http://www.gutenberg.org/etext/1342",
      "language": "English",
      "copyright_year": "1813",
      "num_sections": "61",
      "url_rss": "https://librivox.org/rss/52",
      "url_zip_file": "https://www.archive.org/download/...",
      "url_project": "https://librivox.org/pride-and-prejudice/",
      "url_librivox": "https://librivox.org/pride-and-prejudice/",
      "url_iarchive": "https://archive.org/details/...",
      "totaltime": "11:45:35",
      "totaltimesecs": 42335,
      "authors": [
        {
          "id": "41",
          "first_name": "Jane",
          "last_name": "Austen",
          "dob": "1775",
          "dod": "1817"
        }
      ],
      "genres": [
        {
          "id": "12",
          "name": "Romance"
        }
      ]
    }
  ]
}
```

#### 扩展响应（extended=1）

额外包含章节/分段信息：

```json
{
  "sections": [
    {
      "id": "1234",
      "section_number": "1",
      "title": "Chapter 1",
      "listen_url": "https://www.archive.org/download/.../chapter01.mp3",
      "language": "English",
      "playtime": "00:12:34",
      "file_name": "prideandprejudice_01_austen.mp3",
      "readers": [
        {
          "reader_id": "123",
          "display_name": "John Smith"
        }
      ]
    }
  ]
}
```

### 2.6 API 示例

```bash
# 获取所有有声书（分页）
curl "https://librivox.org/api/feed/audiobooks/?limit=50&offset=0&format=json"

# 搜索标题
curl "https://librivox.org/api/feed/audiobooks/title/^pride?format=json"

# 搜索作者
curl "https://librivox.org/api/feed/audiobooks/author/Shakespeare?format=json"

# 获取单本详情
curl "https://librivox.org/api/feed/audiobooks/?id=52&extended=1&format=json"

# 获取指定日期后的新书
curl "https://librivox.org/api/feed/audiobooks/?since=1704067200&format=json"

# 按类型过滤
curl "https://librivox.org/api/feed/audiobooks/?genre=plays&format=json"
```

---

## 3. 音频文件托管

### 3.1 Internet Archive 托管

所有 LibriVox 音频文件托管在 Internet Archive：

```
音频集合: https://archive.org/details/librivoxaudio
单本地址: https://archive.org/details/{identifier}
```

### 3.2 音频格式

每章通常提供以下格式：

| 格式 | 码率 | 说明 |
|------|------|------|
| **MP3 64kbps** | 64 Kbps | 体积小，适合流媒体 |
| **MP3 128kbps** | 128 Kbps | 较好音质 |
| **MP3 VBR** | 可变 | 新项目使用 |
| **Ogg Vorbis** | 可变 | 开源格式（旧项目） |

### 3.3 批量下载

每本有声书提供 ZIP 打包下载：

```
ZIP 下载 URL: 从 API 响应的 url_zip_file 获取
```

### 3.4 通过 Internet Archive API 访问

```bash
# 获取元数据
curl "https://archive.org/metadata/{identifier}"

# 列出所有文件
curl "https://archive.org/metadata/{identifier}/files"

# 直接下载文件
https://archive.org/download/{identifier}/{filename}
```

---

## 4. 数据字段映射

### 4.1 与 Readmigo 需求对照

| Readmigo 需求 | LibriVox 字段 | 可用性 |
|---------------|---------------|--------|
| 有声书标题 | `title` | ✅ 直接可用 |
| 作者 | `authors` | ✅ 直接可用 |
| 描述 | `description` | ✅ 直接可用 |
| 时长 | `totaltime` / `totaltimesecs` | ✅ 直接可用 |
| 章节列表 | `sections` (extended=1) | ✅ 需要扩展请求 |
| 音频 URL | `listen_url` | ✅ 直接可用 |
| 语言 | `language` | ✅ 直接可用 |
| 类型 | `genres` | ✅ 直接可用 |
| 关联电子书 | `url_text_source` | ✅ 可关联 PG |
| RSS 订阅 | `url_rss` | ✅ 播客订阅 |

### 4.2 关联 Project Gutenberg

LibriVox 响应中的 `url_text_source` 通常指向 Project Gutenberg：

```json
{
  "url_text_source": "http://www.gutenberg.org/etext/1342"
}
```

可通过解析 URL 提取 PG ID：`1342`

---

## 5. 分类体系

### 5.1 主要类型 (Genres)

| Genre | 说明 |
|-------|------|
| Action & Adventure | 动作冒险 |
| Biography & Autobiography | 传记自传 |
| Children's Fiction | 儿童小说 |
| Classics (Antiquity) | 古典（古代） |
| Comedy | 喜剧 |
| Detective Fiction | 侦探小说 |
| Dramatic Readings | 戏剧朗读 |
| Essays & Short Works | 散文短篇 |
| Fairy Tales | 童话 |
| Fantasy | 奇幻 |
| General Fiction | 一般小说 |
| Historical Fiction | 历史小说 |
| Horror & Supernatural | 恐怖超自然 |
| Humor | 幽默 |
| Literary Fiction | 文学小说 |
| Myths, Legends & Fairy Tales | 神话传说 |
| Nature & Animal Fiction | 自然动物 |
| Philosophy | 哲学 |
| Plays | 戏剧 |
| Poetry | 诗歌 |
| Religion | 宗教 |
| Romance | 浪漫 |
| Science Fiction | 科幻 |
| Short Stories | 短篇故事 |
| Travel & Geography | 旅行地理 |
| War & Military | 战争军事 |
| Westerns | 西部小说 |

### 5.2 语言分布

| 语言 | 占比（估计） |
|------|-------------|
| English | ~85% |
| German | ~5% |
| French | ~3% |
| Spanish | ~2% |
| 其他 | ~5% |

---

## 6. 数据获取策略

### 6.1 初始导入

```
┌─────────────────────────────────────────────────────────────┐
│  目标：建立 LibriVox 有声书数据库                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: 全量获取目录                                        │
│  └── 分页遍历 API: ?limit=50&offset={n}&format=json          │
│                                                             │
│  Step 2: 过滤英语有声书                                      │
│  └── 筛选 language = "English"                              │
│                                                             │
│  Step 3: 获取详细章节信息                                     │
│  └── 对每本书请求 ?id={id}&extended=1                        │
│                                                             │
│  Step 4: 关联 Project Gutenberg                              │
│  └── 解析 url_text_source 提取 PG ID                         │
│  └── 建立 Book -> Audiobook 关联                             │
│                                                             │
│  Step 5: 存储音频 URL                                        │
│  └── 存储 IA download URL（不下载实际文件）                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 增量更新

```bash
# 使用 since 参数获取新增有声书
curl "https://librivox.org/api/feed/audiobooks/?since={last_sync_timestamp}&format=json"
```

### 6.3 数据同步频率

| 数据类型 | 建议频率 |
|----------|----------|
| 新增有声书 | 每日 |
| 全量同步 | 每月 |

---

## 7. 技术注意事项

### 7.1 API 限制

- 默认返回 50 条
- 最大 limit 值未明确文档化，建议不超过 500
- 无明确速率限制，建议 1 请求/秒

### 7.2 已知问题

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| extended=1 返回格式问题 | 可能以 section 数量为 key | 需要额外处理 |
| 临时 URL | 部分 listen_url 为临时地址 | 使用 IA 永久 URL |
| 部分书籍无 PG 关联 | url_text_source 可能为空 | 通过标题/作者匹配 |

### 7.3 音频播放

音频可直接流式播放：

```html
<audio src="https://archive.org/download/{identifier}/{filename}.mp3" controls>
</audio>
```

---

## 8. 与 Readmigo 集成建议

### 8.1 功能场景

| 功能 | 说明 |
|------|------|
| **听读模式** | 同步显示文本 + 播放音频 |
| **跟读练习** | 用户跟随朗读，AI 评分 |
| **磨耳朵** | 纯听力训练 |
| **睡前故事** | 定时播放章节 |

### 8.2 数据模型建议

```prisma
model Audiobook {
  id            String   @id
  bookId        String?  @map("book_id")  // 关联 Book
  book          Book?    @relation(fields: [bookId], references: [id])

  title         String
  description   String?
  totalDuration Int      // 总时长（秒）
  language      String
  librivoxId    String   @unique @map("librivox_id")
  librivoxUrl   String   @map("librivox_url")
  archiveUrl    String   @map("archive_url")
  zipUrl        String?  @map("zip_url")
  rssUrl        String?  @map("rss_url")

  chapters      AudiobookChapter[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AudiobookChapter {
  id            String     @id
  audiobookId   String     @map("audiobook_id")
  audiobook     Audiobook  @relation(fields: [audiobookId], references: [id])

  chapterNumber Int        @map("chapter_number")
  title         String
  duration      Int        // 时长（秒）
  audioUrl      String     @map("audio_url")
  readerName    String?    @map("reader_name")

  @@index([audiobookId, chapterNumber])
}
```

### 8.3 推荐优先级

```
Phase 1: 关联已有书籍
├── 为 Standard Ebooks 书籍匹配 LibriVox 有声书
├── 为 Project Gutenberg 热门书籍匹配
└── 约 1000-2000 本可匹配

Phase 2: 功能实现
├── 基础播放功能
├── 章节导航
└── 播放进度记录

Phase 3: 高级功能
├── 听读同步（需要时间戳对齐）
├── 跟读评分
└── 离线下载
```

---

## 9. 参考资源

- [LibriVox 官网](https://librivox.org/)
- [LibriVox API 文档](https://librivox.org/api/info)
- [LibriVox @ Internet Archive](https://archive.org/details/librivoxaudio)
- [LibriVox Wiki](https://wiki.librivox.org/)
- [LibriVox GitHub](https://github.com/LibriVox/librivox-catalog)
- [LibriVox Forum API 讨论](https://forum.librivox.org/viewtopic.php?t=44129)

---

*文档更新日期: 2024-12-24*
