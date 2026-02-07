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

---

### 2.2 查询方式

支持两种 URL 风格：

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

#### 扩展响应（extended=1）

额外包含章节/分段信息：

---

### 3.1 Internet Archive 托管

所有 LibriVox 音频文件托管在 Internet Archive：

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

---

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

可通过解析 URL 提取 PG ID：`1342`

---

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

### 6.3 数据同步频率

| 数据类型 | 建议频率 |
|----------|----------|
| 新增有声书 | 每日 |
| 全量同步 | 每月 |

---

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

---

### 8.1 功能场景

| 功能 | 说明 |
|------|------|
| **听读模式** | 同步显示文本 + 播放音频 |
| **跟读练习** | 用户跟随朗读，AI 评分 |
| **磨耳朵** | 纯听力训练 |
| **睡前故事** | 定时播放章节 |

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
