# AI 模块

> AI 交互系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能类别 | 说明 | 实时性 |
|----------|------|--------|
| 选词解释 | 上下文感知的单词解释 | 流式 |
| 句子简化 | 复杂句改写为简单表达 | 流式 |
| 段落翻译 | 中英对照翻译 | 流式 |
| 语法解析 | 句子结构分析 | 流式 |
| 章节摘要 | 章节内容总结 | 预生成 |
| 人物分析 | 角色关系和发展 | 预生成 |
| 主题分析 | 书籍主题解读 | 预生成 |
| 问答对话 | 上下文相关问答 | 流式 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 流式响应 | OkHttp SSE | fetch + EventSource | fetch + EventSource |
| 缓存 | Room DB | AsyncStorage | IndexedDB |
| UI 更新 | StateFlow + Compose | Zustand + RN | Zustand + React |
| 打字机效果 | Compose Animation | Reanimated | CSS Animation |

---

## 2. 数据模型

### AIExplanation (选词解释结果)

| Field | Type | Description |
|-------|------|-------------|
| word | string | The word being explained |
| phonetic | string (optional) | Phonetic transcription |
| partOfSpeech | string | Part of speech |
| definition | string | Standard definition |
| contextMeaning | string | Meaning in current context |
| examples | string[] | Usage examples |
| synonyms | string[] | Synonyms |
| etymology | string (optional) | Word origin |
| mnemonics | string (optional) | Memory aid |
| difficulty | 1-5 | Difficulty level |

### AISentenceSimplification (句子简化结果)

| Field | Type | Description |
|-------|------|-------------|
| original | string | Original sentence |
| simplified | string | Simplified version |
| explanation | string | What changed and why |
| keyChanges | string[] | List of key changes |

### AITranslation (翻译结果)

| Field | Type | Description |
|-------|------|-------------|
| original | string | Original text |
| translation | string | Translated text |
| annotations | array | Annotation details for key phrases |

### AIContext (请求上下文)

| Field | Type | Description |
|-------|------|-------------|
| bookId | string | Source book |
| chapterId | string | Source chapter |
| selectedText | string | User-selected text |
| surroundingText | string | Surrounding context |
| userLevel | enum | beginner / intermediate / advanced |

### AIStreamResult (流式响应状态)

Possible states: loading, streaming (partial text), success (complete data), error (with message).

---

## 3. API 接口

### 3.1 流式接口 (SSE)

| 端点 | 方法 | 说明 |
|------|------|------|
| `/ai/explain/stream` | POST | 流式单词解释 |
| `/ai/simplify/stream` | POST | 流式句子简化 |
| `/ai/translate/stream` | POST | 流式翻译 |
| `/ai/qa/stream` | POST | 流式问答 |

### 3.2 预生成接口 (REST)

| 端点 | 方法 | 说明 |
|------|------|------|
| `/ai/books/{id}/summary` | GET | 书籍摘要 |
| `/ai/books/{id}/characters` | GET | 人物分析 |
| `/ai/books/{id}/themes` | GET | 主题分析 |
| `/ai/books/{id}/reading-guide` | GET | 阅读指南 |

---

## 4. 缓存策略

| 类型 | TTL | 策略 |
|------|-----|------|
| 选词解释 | 30天 | 按词 + 上下文哈希 |
| 句子简化 | 30天 | 按句缓存 |
| 翻译 | 30天 | 按段缓存 |
| 预生成内容 | 永久 | 按书籍 ID |

---

## 5. 打字机效果实现

Each platform implements character-by-character text reveal with ~10ms delay:

| Platform | Approach |
|----------|----------|
| Android (Compose) | LaunchedEffect + mutableState, iterating characters |
| React Native | useEffect + setInterval, incrementing slice index |
| Web | CSS animation or JavaScript interval |

---

## 6. 自动生词本集成

AI 解释完成后自动将单词添加到生词本：

1. 记录原文上下文
2. 保存 AI 解释
3. 关联书籍和章节
4. 标记难度等级

---

*最后更新: 2025-12-28*
