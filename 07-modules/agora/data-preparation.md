# 城邦功能 - 数据准备指南

## 一、作者头像准备

### 1.1 数据来源

头像数据从多个公开渠道自动获取，按优先级：

| 优先级 | 来源 | 说明 | 覆盖率 |
|:-----:|-----|------|:------:|
| 1 | Wikidata | 通过P18属性获取Wikimedia Commons图片 | 最高 |
| 2 | Wikipedia | 通过pageimages API获取条目缩略图 | 高 |
| 3 | Open Library | 通过作者OLID获取 | 中等 |
| 4 | Library of Congress | 艺术类肖像图片 | 补充 |
| 5 | Internet Archive | 使用书籍封面作为备选 | 兜底 |

### 1.2 获取流程

```
┌─────────────────────────────────────────────────────────────┐
│                    头像获取流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Wikidata │───▶│ Wikipedia│───▶│OpenLibrary│             │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  ┌──────────────────────────────────────────┐              │
│  │            找到图片？                      │              │
│  └──────────────────┬───────────────────────┘              │
│          是 ▼              │ 否                            │
│  ┌──────────────┐    ┌─────▼─────┐                         │
│  │ 下载并验证   │    │ 尝试LoC/  │                         │
│  │ (>1KB,格式)  │    │ Archive   │                         │
│  └──────┬───────┘    └───────────┘                         │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │ 上传到 R2    │                                          │
│  │ CDN存储      │                                          │
│  └──────┬───────┘                                          │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │ 更新数据库   │                                          │
│  │ avatar_url   │                                          │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 脚本命令

| 命令 | 脚本位置 | 功能 |
|-----|---------|------|
| analyze | `scripts/author-avatars.ts` | 分析当前头像覆盖率 |
| migrate | `scripts/author-avatars.ts` | 从Wikimedia迁移到R2 |
| enrich | `scripts/author-avatars.ts` | 为缺失头像的作者获取数据 |
| fix | `packages/database/scripts/fix-author-avatars.ts` | 修复占位符头像 |

### 1.4 存储规格

| 项目 | 规格 |
|-----|------|
| 存储位置 | Cloudflare R2 |
| 路径格式 | `authors/{authorId}/avatar.{ext}` |
| CDN域名 | `cdn.readmigo.com` |
| 缓存时间 | 1年 (max-age=31536000) |
| 支持格式 | PNG, JPG, GIF, WebP |
| 最小文件 | 1KB |

### 1.5 客户端展示

```
┌─────────────────────────────────────────────┐
│              头像展示逻辑                    │
├─────────────────────────────────────────────┤
│                                             │
│    有 avatarUrl?                            │
│         │                                   │
│    是 ──┴── 否                              │
│    │        │                               │
│    ▼        ▼                               │
│ ┌──────┐  ┌──────────────────────┐         │
│ │远程  │  │ 显示首字母占位符       │         │
│ │图片  │  │ (8种预定义颜色)       │         │
│ │加载  │  │                       │         │
│ └──────┘  └──────────────────────┘         │
│                                             │
│ iOS: Kingfisher库                           │
│ 占位符: 作者名首字母 + hash颜色选择          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 二、金句数据准备

### 2.1 数据来源

**主脚本 `generate-quotes.ts`（按优先级）：**

| 优先级 | 来源 | 类型 | 数量/作者 | 说明 |
|:-----:|-----|------|:---------:|------|
| 1 | Goodreads | Web Scraping | 15+ | 社区投票，质量最高 |
| 2 | BrainyQuote | Web Scraping | 12+ | 策展名言 |
| 3 | Wikiquote | 公开API | 10+ | 维基百科风格策展 |
| 4 | Gutenberg | AI提取 | 5-8 | 需要ANTHROPIC_API_KEY |
| 5 | AI生成 | Claude API | 8-10 | 备用方案，需要API Key |

**辅助脚本 `import-agora-posts.ts`：**

| 来源 | 类型 | 数量 | 说明 |
|-----|------|:----:|------|
| API Ninjas | REST API | ~100/批 | 需要API_NINJAS_KEY |
| ZenQuotes | REST API | ~1500总 | 免费，无需API Key |
| Type.fit | REST API | ~1600总 | 免费，无需API Key |

**中文数据源（待实现）：**

| 优先级 | 来源 | 类型 | 说明 |
|:-----:|-----|------|------|
| 1 | 中文维基语录 | 公开API | API与英文一致，数据质量高 |

**备选源（暂不实现）：**

| 来源 | 原因 |
|-----|------|
| 豆瓣读书 | 划线笔记需登录，公开API已关闭 |
| 古诗文网 | GB2312编码，页面结构复杂，开发成本高 |

### 2.2 数据流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      金句数据处理流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Goodreads   │  │ BrainyQuote │  │  Wikiquote  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│                  ┌───────────────┐                              │
│                  │  并行获取     │                              │
│                  └───────┬───────┘                              │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────┐     │
│  │                   数据清理                              │     │
│  │  • 去重 (按文本内容)                                    │     │
│  │  • HTML标签移除                                         │     │
│  │  • 长度验证 (20-500字符)                                │     │
│  │  • HTML实体解码                                         │     │
│  └───────────────────────┬───────────────────────────────┘     │
│                          ▼                                      │
│                  ┌───────────────┐                              │
│                  │  data.json    │                              │
│                  └───────┬───────┘                              │
│                          ▼                                      │
│                  ┌───────────────┐                              │
│                  │  导入数据库   │                              │
│                  └───────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 数据结构

**Quote表字段：**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 主键 |
| text | TEXT | 金句原文 |
| source | ENUM | BOOK / AUTHOR |
| book_title | VARCHAR | 书籍标题 |
| author | VARCHAR(255) | 作者名 |
| author_id | UUID | 外键关联Author表 |
| chapter | VARCHAR(200) | 章节信息 |
| tags | TEXT[] | 标签数组 |
| like_count | INT | 点赞数 |
| share_count | INT | 分享数 |

### 2.4 标签分类

| 类别 | 标签 |
|-----|------|
| 主题 | love, wisdom, life, philosophy, motivation, humor, friendship, nature, art, society |
| 类型 | opening, ending, classic, irony, metaphor |

### 2.5 脚本命令

| 功能 | 脚本位置 | 说明 |
|-----|---------|------|
| 生成 | `scripts/agora-import/generate-quotes.ts` | 多源并行获取，支持--start/--limit参数 |
| 导入 | `scripts/agora-import/import.ts` | 从data.json导入到数据库 |
| API导入 | `packages/database/scripts/import-agora-posts.ts` | 从API直接导入数据 |

### 2.6 API端点

| 方法 | 路径 | 功能 |
|:---:|-----|------|
| GET | /quotes | 金句列表（支持筛选） |
| GET | /quotes/daily | 每日金句 |
| GET | /quotes/random | 随机金句 |
| GET | /quotes/trending | 热门金句 |
| GET | /quotes/tags | 可用标签列表 |
| GET | /quotes/:id | 金句详情 |
| POST | /quotes/:id/like | 点赞 |

---

## 三、快速启动清单

### 环境准备

| 环境变量 | 用途 |
|---------|------|
| DATABASE_URL | PostgreSQL连接 |
| R2_ACCESS_KEY_ID | Cloudflare R2 |
| R2_SECRET_ACCESS_KEY | Cloudflare R2 |
| R2_BUCKET_NAME | R2存储桶名 |

### 作者头像

- [ ] 运行 analyze 命令，检查当前头像覆盖率
- [ ] 运行 enrich 命令，为缺失头像的作者获取数据
- [ ] 验证头像在客户端正常显示

### 金句数据

- [ ] 运行 generate-quotes.ts 生成金句数据
- [ ] 检查 MISSING_QUOTES.md 是否有需要手动补充的作者
- [ ] 运行 import.ts 导入到数据库
- [ ] 验证API返回正确

### 验证检查

- [ ] iOS端Agora页面加载正常
- [ ] 头像显示正确（有图或首字母占位符）
- [ ] 金句内容展示完整
- [ ] 点赞/分享功能正常

---

## 附录：关键文件索引

| 功能 | 文件路径 |
|-----|---------|
| 头像获取脚本 | `scripts/author-avatars.ts` |
| 头像修复脚本 | `packages/database/scripts/fix-author-avatars.ts` |
| 作者数据充实 | `packages/database/scripts/enrich-authors-v2.ts` |
| 金句生成脚本 | `scripts/agora-import/generate-quotes.ts` |
| 金句导入脚本 | `scripts/agora-import/import.ts` |
| 数据库Schema | `packages/database/prisma/schema.prisma` |
| iOS头像组件 | `ios/Readmigo/Features/Agora/AuthorAvatarView.swift` |
| iOS作者模型 | `ios/Readmigo/Core/Models/Author.swift` |
| 后端金句服务 | `src/modules/quotes/quotes.service.ts` |
