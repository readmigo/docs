# V3.0.0 段落级别翻译功能设计

## 功能概述

支持阅读器长按查看段落级别的翻译，翻译文案对应 locale。

## 测试书籍

| 属性 | 值 |
|------|-----|
| 书名 | The Communist Manifesto |
| ID | `af01f5fc-13bb-43b7-a71c-5bb4aa4a4852` |
| 字数 | 11,282 words |
| 章节 | 5章 (1封面 + 4正文) |

## 翻译优先级

1. English → Simplified Chinese (zh-Hans)
2. English → Traditional Chinese (zh-Hant)
3. English → Other languages

## 数据模型设计

### 方案对比

| 对比项 | 方案A (复用Translation表) | 方案B (新建ParagraphTranslation表) |
|--------|--------------------------|----------------------------------|
| 查询效率 | 需要解析entityId | 直接索引查询 |
| 数据完整性 | 无外键约束 | 有Chapter外键 |
| 原文变更检测 | 不支持 | 通过hash检测 |
| 批量查询 | 复杂 | 简单高效 |

### 推荐方案：方案B - 新建 ParagraphTranslation 表

```prisma
model ParagraphTranslation {
  id              String   @id @default(uuid())
  chapterId       String
  paragraphIndex  Int      // 段落在章节中的位置 (0-based)
  originalHash    String   // 原文MD5，用于检测原文变更
  locale          String   // zh-Hans, zh-Hant, etc.
  translatedText  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  chapter         Chapter  @relation(fields: [chapterId], references: [id])

  @@unique([chapterId, paragraphIndex, locale])
  @@index([chapterId, locale])
}
```

## 翻译流程

```
┌─────────────────────────────────────────────────────────┐
│                    翻译流程                              │
├─────────────────────────────────────────────────────────┤
│  1. 解析章节HTML → 提取所有<p>段落                        │
│  2. 为每个段落计算MD5 hash                               │
│  3. 调用翻译API (批量翻译)                               │
│  4. 存储到 ParagraphTranslation 表                       │
│  5. 阅读器长按时查询对应翻译                              │
└─────────────────────────────────────────────────────────┘
```

## API 设计

### 获取章节所有段落翻译

```
GET /chapters/:chapterId/paragraph-translations?locale=zh-Hans

Response:
[
  { "paragraphIndex": 0, "translatedText": "翻译文本" },
  { "paragraphIndex": 1, "translatedText": "翻译文本" },
  ...
]
```

### 获取单个段落翻译

```
GET /chapters/:chapterId/paragraph-translation/:index?locale=zh-Hans

Response:
{ "translatedText": "翻译文本" }
```

## 实施步骤

| 步骤 | 任务 | 说明 |
|------|------|------|
| 1 | 创建数据库模型 | 添加 ParagraphTranslation 表 |
| 2 | 创建翻译脚本 | 解析HTML、调用翻译API、存储结果 |
| 3 | 创建API端点 | 供阅读器查询段落翻译 |
| 4 | 测试验证 | 用共产党宣言测试 English→zh-Hans |

## 章节内容格式

章节HTML存储在R2，格式示例：

```html
<section epub:type="chapter">
  <h2>Chapter Title</h2>
  <p>First paragraph text...</p>
  <p>Second paragraph text...</p>
  ...
</section>
```

每个 `<p>` 标签对应一个可翻译的段落。
