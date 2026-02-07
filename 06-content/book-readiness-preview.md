# 书籍难度预览 (Book Readiness Preview)

> "试试你是否适合读这本书" — 在开始阅读前，了解这本书的语言特点和挑战

## 功能概述

| 项目 | 说明 |
|------|------|
| 定位 | 阅读前的"小笔记"，而非考试测验 |
| 目标 | 帮助读者了解书籍难度，自行判断是否适合阅读 |
| 数据依赖 | 已处理的双语书籍 (当前7本，持续扩展) |
| 核心价值 | 降低选书盲目性，提升阅读完成率 |

---

### 模块一：核心词汇 (Key Vocabulary)

这本书的高频重点词汇，按主题/难度分组展示。

### 模块二：难句预览 (Complex Sentences)

展示书中的典型难句，帮助读者提前适应作者的写作风格。

### 模块三：语法特点 (Grammar Patterns)

这本书中常见的语法现象，特别是非现代英语的用法。

### 模块四：文化背景 (Cultural Context)

理解这本书需要的文化知识。

### 模块五：能力木桶图 (Skill Bucket Visualization)

用"木桶理论"展示阅读这本书需要的各项能力，帮助读者直观了解挑战在哪里。

> 木桶理论：一个木桶能装多少水，取决于最短的那块木板。

---

### 利用现有数据

| 数据源 | 用途 |
|--------|------|
| ParagraphToken | 词汇提取、词频统计 |
| Vocabulary (CEFR) | 难度分级 |
| BilingualParagraph | 难句提取、翻译对照 |

### 需要预处理的数据

| 数据项 | 处理方式 | 存储位置 |
|--------|----------|----------|
| 书籍词汇统计 | 离线处理，按书聚合 | BookReadinessData |
| 难句标注 | AI + 人工审核 | BookReadinessData |
| 语法特点 | AI 分析 + 规则提取 | BookReadinessData |
| 文化背景 | AI 生成 + 人工编辑 | BookReadinessData |
| 能力维度评估 | 规则计算 + AI辅助 | BookReadinessData |

---

### 新增表: BookReadinessData

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| bookId | UUID | 书籍ID (唯一) |
| totalWords | Int | 总词数 |
| uniqueWords | Int | 独特词汇数 |
| avgSentenceLength | Float | 平均句长 |
| maxSentenceLength | Int | 最长句子词数 |
| avgClauseDepth | Float | 平均从句嵌套深度 |
| keyVocabulary | JSON | 核心词汇列表 |
| vocabularyThemes | JSON | 主题词汇分组 |
| complexSentences | JSON | 难句列表 (含翻译和解析) |
| grammarPatterns | JSON | 语法特点 |
| culturalContext | JSON | 文化背景 |
| skillRequirements | JSON | 能力维度要求 (木桶图数据) |
| suggestedLevel | String | 建议等级 (如 B1-B2) |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**索引:** bookId 唯一

### skillRequirements JSON 结构

| 维度 | 字段 | 说明 |
|------|------|------|
| vocabulary | level, description | 词汇量要求 |
| grammar | level, description | 语法要求 |
| sentence | level, description | 句式要求 |
| culture | level, description | 文化背景要求 |
| overall | level, description | 整体难度 |
| shortestBoard | dimension | 最大挑战维度 |
| tip | text | 针对短板的建议 |

---

### GET `/books/:bookId/readiness`

获取书籍的难度预览数据。

**响应内容:**

| 字段 | 类型 | 说明 |
|------|------|------|
| keyVocabulary | Array | 核心词汇 (word, pos, meaning, frequency, level) |
| vocabularyThemes | Array | 主题词汇分组 |
| complexSentences | Array | 难句 (original, translation, analysis) |
| grammarPatterns | Array | 语法特点 (pattern, frequency, example, modernEquivalent) |
| culturalContext | Array | 文化背景 (topic, explanation, examples) |
| skillRequirements | Object | 能力维度要求 (木桶图数据) |
| suggestedLevel | String | 建议等级 |
| statistics | Object | 统计数据 (totalWords, uniqueWords, avgSentenceLength) |

---

### 触发时机

- 双语管线完成后自动触发
- 也可手动触发重新生成

---

### 新建文件

**后端:**

| 文件 | 描述 |
|------|------|
| `modules/readiness/readiness.module.ts` | Readiness 模块定义 |
| `modules/readiness/readiness.controller.ts` | API 端点 |
| `modules/readiness/readiness.service.ts` | 业务逻辑 |
| `modules/readiness/dto/book-readiness.dto.ts` | DTO 定义 |
| `scripts/generate-book-readiness.ts` | 预处理脚本 |

**移动端:**

| 文件 | 描述 |
|------|------|
| `app/book/[id]/readiness.tsx` | 主屏幕路由 |
| `features/readiness/components/BookReadinessScreen.tsx` | 主屏幕组件 |
| `features/readiness/components/SkillBucketChart.tsx` | 能力木桶图 |
| `features/readiness/components/KeyVocabularyList.tsx` | 核心词汇列表 |
| `features/readiness/components/ComplexSentenceCard.tsx` | 难句卡片 |
| `features/readiness/components/GrammarPatternCard.tsx` | 语法卡片 |
| `features/readiness/components/CulturalContextCard.tsx` | 文化背景卡片 |
| `features/readiness/hooks/useBookReadiness.ts` | 数据 Hook |
| `services/api/readiness.ts` | API 客户端 |

**数据库:**

| 文件 | 描述 |
|------|------|
| `prisma/migrations/xxx_add_book_readiness.sql` | 新表迁移 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `packages/database/prisma/schema.prisma` | 添加 BookReadinessData |
| `apps/backend/src/app.module.ts` | 注册 ReadinessModule |
| `apps/mobile/app/book/[id].tsx` | 添加入口卡片 |

---

### Phase 1: 基础设施
- [ ] 添加数据库表迁移
- [ ] 创建 `ReadinessModule`
- [ ] 实现基础 API 端点

### Phase 2: 数据处理
- [ ] 实现词汇统计脚本
- [ ] 实现句子分析脚本
- [ ] 实现 AI 语法/文化分析
- [ ] 实现能力维度评估算法
- [ ] 为现有7本书生成数据

### Phase 3: iOS 界面
- [ ] 创建主屏幕
- [ ] 实现能力木桶图组件
- [ ] 实现核心词汇列表
- [ ] 实现难句预览模块
- [ ] 实现语法/文化模块
- [ ] 集成到书籍详情页

---

## 设计原则
