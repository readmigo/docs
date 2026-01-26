# WikiSource 中文 数据盘点

> 从产品和运营角度，梳理维基文库中文公版书数据及其对 Readmigo 的价值

---

## 1. 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://zh.wikisource.org |
| **定位** | 维基媒体基金会的自由内容图书馆（中文版） |
| **内容类型** | 四大名著、近现代文学、古典小说 |
| **API** | MediaWiki API（公开免费） |
| **许可协议** | CC BY-SA 3.0 |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 完全免费、无需认证 | 格式为 Wikitext 需转换 |
| 社区校对质量高 | 章节 URL 规则复杂 |
| MediaWiki API 标准 | 部分书籍章节不完整 |
| 四大名著完整版 | 无封面图片 |
| 持续更新维护 | 需要繁简转换 |

### 对 Readmigo 的价值

```
✅ 四大名著完整章节内容
✅ 近现代文学（鲁迅等）
✅ 社区校对质量保证
✅ 免费 API 无需认证
✅ 可与 Gutenberg ZH 互补
```

---

## 2. 推荐书目

### 2.1 四大名著

| 书名 | 作者 | 章节数 | 页面标题 |
|------|------|--------|----------|
| 红楼梦 | 曹雪芹 | 120 回 | `紅樓夢` |
| 西游记 | 吴承恩 | 100 回 | `西遊記` |
| 三国演义 | 罗贯中 | 120 回 | `三國演義` |
| 水浒传 | 施耐庵 | 120 回 | `水滸傳 (120回本)` |

### 2.2 近现代文学

| 书名 | 作者 | 类型 | 页面标题 |
|------|------|------|----------|
| 呐喊 | 鲁迅 | 小说集 | `吶喊` |
| 彷徨 | 鲁迅 | 小说集 | `彷徨` |
| 朝花夕拾 | 鲁迅 | 散文集 | `朝花夕拾` |

### 2.3 其他古典

| 书名 | 作者 | 页面标题 |
|------|------|----------|
| 聊斋志异 | 蒲松龄 | `聊齋志異` |
| 儒林外史 | 吴敬梓 | `儒林外史` |
| 镜花缘 | 李汝珍 | `鏡花緣` |

---

## 3. MediaWiki API

### 3.1 API 端点

```
Base URL: https://zh.wikisource.org/w/api.php
```

### 3.2 获取页面内容

```bash
# 获取页面 Wikitext 内容
curl "https://zh.wikisource.org/w/api.php?action=query&prop=revisions&titles=紅樓夢&rvprop=content&rvslots=main&format=json&formatversion=2"
```

### 3.3 API 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `action` | 操作类型 | `query` |
| `prop` | 属性 | `revisions` |
| `titles` | 页面标题 | `紅樓夢` |
| `rvprop` | 修订属性 | `content` |
| `rvslots` | 内容槽 | `main` |
| `format` | 响应格式 | `json` |
| `formatversion` | 格式版本 | `2` |

### 3.4 获取分类成员

```bash
# 获取分类下的页面列表
curl "https://zh.wikisource.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:四大名著&cmlimit=50&cmtype=page&format=json"
```

### 3.5 API 响应示例

```json
{
  "query": {
    "pages": [
      {
        "pageid": 12345,
        "ns": 0,
        "title": "紅樓夢/第001回",
        "revisions": [
          {
            "slots": {
              "main": {
                "content": "{{header\n|title=紅樓夢\n|chapter=第一回\n}}\n\n甄士隱夢幻識通靈　賈雨村風塵懷閨秀\n\n..."
              }
            }
          }
        ]
      }
    ]
  }
}
```

---

## 4. 章节 URL 模式

### 4.1 四大名著章节格式

维基文库中文版使用三位数字格式：

```
# 红楼梦第一回
https://zh.wikisource.org/wiki/紅樓夢/第001回

# 西游记第五十回
https://zh.wikisource.org/wiki/西遊記/第050回

# 三国演义第一百二十回
https://zh.wikisource.org/wiki/三國演義/第120回
```

### 4.2 章节号格式化

```typescript
// 格式化为三位数字
function formatChapterNumber(n: number): string {
  return n.toString().padStart(3, '0');
}

// 示例
formatChapterNumber(1)   // "001"
formatChapterNumber(50)  // "050"
formatChapterNumber(120) // "120"
```

---

## 5. 数据处理流程

### 5.1 导入流程

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 遍历推荐书籍列表                                     │
│  └── 使用 RECOMMENDED_BOOKS 数组                             │
│                                                             │
│  Step 2: 判断书籍类型                                         │
│  ├── 有章节模式 → fetchBookWithChapters()                    │
│  └── 单页书籍 → fetchSinglePageBook()                        │
│                                                             │
│  Step 3: 逐章获取内容                                         │
│  └── 调用 MediaWiki API                                      │
│  └── 请求间隔 2 秒                                           │
│                                                             │
│  Step 4: Wikitext 清理                                       │
│  └── 移除模板 {{...}}                                        │
│  └── 移除链接 [[...]]                                        │
│  └── 移除 HTML 标签                                          │
│  └── 移除格式标记                                            │
│                                                             │
│  Step 5: 文本处理                                            │
│  └── 繁体转简体                                              │
│  └── 中文难度分析                                            │
│                                                             │
│  Step 6: 上传到 R2                                           │
│  └── 纯文本格式: books/wikisource-zh/{slug}.txt              │
│                                                             │
│  Step 7: 存入数据库                                           │
│  └── source: WIKISOURCE_ZH                                  │
│  └── 创建 Book 和 Chapter 记录                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Wikitext 清理规则

```typescript
function cleanWikitext(wikitext: string): string {
  let text = wikitext;

  // 移除模板 {{...}}
  text = text.replace(/\{\{[^}]*\}\}/g, '');

  // 移除链接，保留文字 [[链接|文字]] -> 文字
  text = text.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1');
  text = text.replace(/\[\[([^\]]*)\]\]/g, '$1');

  // 移除外部链接
  text = text.replace(/\[https?:\/\/[^\s\]]+ ([^\]]+)\]/g, '$1');

  // 移除分类和文件
  text = text.replace(/\[\[(?:Category|分类|File|文件):[^\]]*\]\]/gi, '');

  // 移除 HTML 标签
  text = text.replace(/<[^>]*>/g, '');

  // 移除格式标记
  text = text.replace(/'''([^']+)'''/g, '$1'); // 粗体
  text = text.replace(/''([^']+)''/g, '$1');   // 斜体

  return text.trim();
}
```

---

## 6. 数据字段映射

### 6.1 与 Readmigo 需求对照

| Readmigo 字段 | 数据来源 | 说明 |
|---------------|----------|------|
| `title` | 预定义列表 | 书名 |
| `author` | 预定义列表 | 作者名 |
| `description` | 预定义/自动生成 | 书籍描述 |
| `language` | 固定值 `zh` | - |
| `genres` | 预定义分类 | 古典小说/现代文学 |
| `subjects` | 自动添加 | `[分类, '中文文学']` |
| `difficultyScore` | 难度分析 | 1-10 分 |
| `hskLevel` | 难度分析 | 1-6 级 |
| `characterCount` | 统计计算 | 汉字总数 |
| `chapterCount` | 解析获取 | 章节数量 |
| `epubUrl` | R2 上传 | 纯文本 URL |
| `source` | 固定值 | `WIKISOURCE_ZH` |
| `sourceId` | URL 编码标题 | 如 `%E7%B4%85%E6%A8%93%E5%A4%A2` |
| `sourceUrl` | 构建 | `zh.wikisource.org/wiki/{title}` |

---

## 7. 实现状态

### 7.1 代码位置

| 文件 | 说明 |
|------|------|
| `scripts/book-ingestion/sources/wikisource-zh.ts` | 主导入脚本 |
| `scripts/book-ingestion/processors/chinese-difficulty-analyzer.js` | 中文难度分析 |
| `scripts/book-ingestion/processors/text-converter.js` | 繁简转换 |

### 7.2 运行方式

```bash
# 导入前 5 本书（四大名著 + 鲁迅）
npx tsx scripts/book-ingestion/sources/wikisource-zh.ts 5

# 导入全部推荐书籍
npx tsx scripts/book-ingestion/sources/wikisource-zh.ts 99
```

### 7.3 数据库枚举

```prisma
enum BookSource {
  WIKISOURCE_ZH  // 维基文库中文
  // ...
}
```

---

## 8. 技术注意事项

### 8.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 章节内容为空 | 页面不存在或格式变化 | 检查 URL 模式 |
| 内容太短 | 部分章节可能重定向 | 过滤 <100 字符的章节 |
| 繁体字符 | 维基文库使用繁体 | TextConverter 转换 |
| 连续章节失败 | 章节 URL 规则不一致 | 5 章后停止尝试 |

### 8.2 请求限制

| 限制项 | 说明 |
|--------|------|
| **请求间隔** | 建议 2 秒以上 |
| **并发请求** | 单线程顺序请求 |
| **User-Agent** | 建议设置合理的 UA |

---

## 9. 与其他数据源对比

| 对比项 | WikiSource ZH | Gutenberg ZH | CText |
|--------|---------------|--------------|-------|
| **四大名著** | ⭐⭐⭐⭐⭐ 完整 | ⭐⭐⭐⭐ 有 | ❌ 无 |
| **现代文学** | ⭐⭐⭐ 鲁迅等 | ⭐⭐⭐⭐ 较多 | ❌ 无 |
| **哲学经典** | ⭐⭐ 少量 | ⭐⭐⭐ 有 | ⭐⭐⭐⭐⭐ 专业 |
| **API** | ✅ 免费 | ❌ 无 | ⚠️ 需认证 |
| **格式** | Wikitext | EPUB | JSON |
| **封面** | ❌ 无 | ✅ 有 | ❌ 无 |

---

## 10. 参考资源

- [维基文库中文](https://zh.wikisource.org/)
- [MediaWiki API 文档](https://www.mediawiki.org/wiki/API:Main_page)
- [维基文库:四大名著](https://zh.wikisource.org/wiki/Category:四大名著)
- [维基文库:鲁迅](https://zh.wikisource.org/wiki/Author:鲁迅)

---

*最后更新: 2025-12-28*
