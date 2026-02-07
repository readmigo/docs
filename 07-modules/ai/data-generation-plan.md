# 数据生成方案

## 概述

本文档描述 Readmigo 产品中需要生成的相关数据、数据来源优先级和处理策略。

---

## 当前数据缺口

| 数据类型 | 总数 | 缺失数量 | 说明 |
|---------|------|---------|------|
| 书籍总数 | 539 | - | 338 英文书 + 201 中文书 |
| 书籍摘要 | - | 56 | 缺少 `description` 字段 |
| CEFR 等级 | - | 328 | 英文书缺少 `cefrLevel` |
| 作者总数 | 345 | - | 已从书籍中提取 |
| 作者简介 | - | 345 | 缺少 `bio` 字段 |
| 作者 Wikidata ID | - | 345 | 缺少 `wikidataId` |
| AI 人设 | - | 345 | 缺少 `aiPersonaPrompt` |
| 金句 | 0 | - | 暂未提取 |

---

## 数据生成方案

### 1. 书籍摘要 (description)

**目标:** 为 56 本缺少摘要的书籍生成描述

**数据源优先级:**

| 优先级 | 数据源 | 说明 | 成本 |
|-------|--------|------|------|
| 1 | **Open Library API** | 开源书籍数据库，包含数百万本书的元数据 | 免费 |
| 2 | **Google Books API** | Google 书籍数据库，描述质量较高 | 免费 (每日限额) |
| 3 | **DeepSeek AI** | 兜底方案，AI 生成摘要 | ~$0.001/次 |

**处理逻辑:**
```
1. 使用书籍标题和作者名查询 Open Library
2. 如果找到且有 description → 使用
3. 否则查询 Google Books
4. 如果找到且有 description → 使用
5. 否则调用 DeepSeek 生成
```

**预期结果:**
- Open Library 预计覆盖: ~60%
- Google Books 预计覆盖: ~20%
- DeepSeek AI 兜底: ~20%

---

### 2. CEFR 英语难度等级

**目标:** 为 328 本英文书籍评估 CEFR 等级

**数据源:**

| 数据源 | 说明 |
|--------|------|
| **DeepSeek AI** | **唯一来源** - 没有公开 API 提供 CEFR 评估 |

**CEFR 等级说明:**
- A1: 入门级 - 最简单的词汇和短句
- A2: 初级 - 基础日常用语
- B1: 中级 - 一般话题，标准表达
- B2: 中高级 - 复杂句子，丰富词汇
- C1: 高级 - 文学作品，隐含含义
- C2: 精通 - 古典/复杂文学

**评估依据:**
- 作者写作风格和时代
- 书籍类型和主题复杂度
- 词汇和语法复杂度

**成本估算:** 328 次 × $0.001 ≈ $0.33

---

### 3. 作者简介 (bio)

**目标:** 为 345 位作者生成简介

**数据源优先级:**

| 优先级 | 数据源 | 说明 | 成本 |
|-------|--------|------|------|
| 1 | **Wikidata API** | 维基数据，结构化的作者信息 | 免费 |
| 2 | **Wikipedia API** | 维基百科，更详细的传记 | 免费 |
| 3 | **DeepSeek AI** | 兜底方案 | ~$0.001/次 |

**可获取的数据:**
- `wikidataId`: Wikidata 实体 ID
- `bio`: 英文简介
- `bioZh`: 中文简介 (如有)
- `nameZh`: 中文名
- `era`: 生卒年 (如 "1775-1817")
- `nationality`: 国籍
- `birthPlace`: 出生地

**预期结果:**
- Wikidata 预计覆盖: ~70% (知名作家)
- DeepSeek AI 兜底: ~30% (不太知名的作家)

---

### 4. 作者 AI 人设 (aiPersonaPrompt)

**目标:** 为作者生成 AI 对话人设提示词

**数据源:**

| 数据源 | 说明 |
|--------|------|
| **DeepSeek AI** | **唯一来源** - 需要创意生成 |

**人设内容:**
- 使用第一人称
- 包含作者的性格特点
- 反映写作风格和时代背景
- 用于模拟作者与读者对话

**示例:**
```
You are Jane Austen, the celebrated English novelist of the Regency era.
You speak with wit and irony, often making subtle observations about
society and human nature. You value propriety but delight in gentle
satire of social pretensions...
```

**成本估算:** 345 次 × $0.002 ≈ $0.69

---

### 5. 作者时间线 (AuthorTimelineEvent)

**目标:** 为作者生成人生重要事件

**数据源优先级:**

| 优先级 | 数据源 | 说明 |
|-------|--------|------|
| 1 | **Wikidata API** | 可获取出生、死亡、主要作品发表年份 |
| 2 | **DeepSeek AI** | 补充更详细的事件 |

**事件类型:**
- BIRTH: 出生
- EDUCATION: 教育
- WORK: 重要作品
- MAJOR_EVENT: 重大事件
- AWARD: 获奖
- DEATH: 逝世

---

### 6. 作者名言 (AuthorQuote)

**目标:** 为作者收集/生成名言

**数据源优先级:**

| 优先级 | 数据源 | 说明 |
|-------|--------|------|
| 1 | **Wikiquote API** | 维基语录 |
| 2 | **书籍内容提取** | 从 EPUB 中提取 |
| 3 | **DeepSeek AI** | 兜底 (可能准确性较低) |

**暂不处理原因:** 名言需要高准确性，建议后续单独处理

---

## 处理顺序

```
1. 处理书籍摘要 (56 本)
   └─ Open Library → Google Books → DeepSeek

2. 处理 CEFR 等级 (328 本)
   └─ DeepSeek AI

3. 处理作者基础信息 (345 位)
   └─ Wikidata → DeepSeek

4. 生成作者 AI 人设 (345 位)
   └─ DeepSeek AI

5. [可选] 生成作者时间线
   └─ Wikidata + DeepSeek

6. [可选] 提取/生成作者名言
   └─ Wikiquote + 书籍内容
```

---

## 成本估算

| 任务 | API 调用次数 | 估算成本 |
|-----|-------------|---------|
| 书籍摘要 (AI 兜底) | ~15 次 | $0.015 |
| CEFR 等级 | 328 次 | $0.33 |
| 作者简介 (AI 兜底) | ~100 次 | $0.10 |
| 作者 AI 人设 | 345 次 | $0.69 |
| **总计** | ~790 次 | **~$1.14** |

---

## 处理时间估算

| 任务 | 预计时间 |
|-----|---------|
| 书籍摘要 | ~5 分钟 |
| CEFR 等级 | ~8 分钟 |
| 作者基础信息 | ~10 分钟 |
| 作者 AI 人设 | ~8 分钟 |
| **总计** | **~30 分钟** |

---

## 确认事项

请确认以下内容后再执行:

- [x] 同意使用 Open Library API 获取书籍摘要
- [x] 同意使用 Google Books API 获取书籍摘要
- [x] 同意使用 Wikidata API 获取作者信息
- [ ] 同意使用 DeepSeek AI 作为兜底生成方案
- [ ] 同意使用 DeepSeek AI 生成 CEFR 等级评估
- [ ] 同意使用 DeepSeek AI 生成作者 AI 人设
- [ ] 确认 DeepSeek API Key 有效

---

## 执行命令

确认后，使用以下命令执行:

