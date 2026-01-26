# 行为追踪模块 (Tracking)

> 用户行为追踪、阅读统计、AI 交互记录

---

## 1. 模块概述

```
┌─────────────────────────────────────────────────────────────────┐
│                        行为追踪模块                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  追踪类型                                                        │
│  ├── Reading         阅读行为                                   │
│  ├── AI              AI 交互                                    │
│  ├── Comprehension   理解度检测                                 │
│  └── Vocabulary      词汇学习                                   │
│                                                                  │
│  数据用途                                                        │
│  ├── 用户分析        行为分析、用户画像                          │
│  ├── 产品优化        功能使用分析                                │
│  ├── AI 推荐         个性化推荐依据                              │
│  └── 年度报告        数据聚合展示                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### TrackingEvent 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户 ID |
| deviceId | String? | 设备 ID |
| eventType | Enum | 事件类型 |
| eventName | String | 事件名称 |
| properties | JSON | 事件属性 |
| sessionId | String? | 会话 ID |
| timestamp | DateTime | 事件时间 |
| createdAt | DateTime | 入库时间 |

### DailyStats 表结构 (聚合统计)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户 ID |
| date | Date | 统计日期 |
| readingMinutes | Int | 阅读时长 (分钟) |
| pagesRead | Int | 阅读页数 |
| wordsLearned | Int | 学习单词数 |
| aiInteractions | Int | AI 交互次数 |
| booksStarted | Int | 开始阅读书籍数 |
| booksCompleted | Int | 完成书籍数 |

---

## 3. 事件类型

### 3.1 阅读事件 (Reading)

| 事件名 | 说明 | 属性 |
|--------|------|------|
| reading_start | 开始阅读 | bookId, chapterIndex |
| reading_end | 结束阅读 | bookId, duration, pagesRead |
| page_turn | 翻页 | bookId, pageIndex, direction |
| chapter_complete | 完成章节 | bookId, chapterIndex |
| book_complete | 完成书籍 | bookId, totalDuration |
| bookmark_add | 添加书签 | bookId, position |

### 3.2 AI 交互事件 (AI)

| 事件名 | 说明 | 属性 |
|--------|------|------|
| ai_word_lookup | 查词 | word, bookId, context |
| ai_sentence_explain | 句子解释 | sentence, bookId |
| ai_translate | 翻译 | text, targetLang |
| ai_chat | AI 对话 | question, bookId |
| ai_summary | 获取摘要 | bookId, chapterIndex |

### 3.3 理解度事件 (Comprehension)

| 事件名 | 说明 | 属性 |
|--------|------|------|
| quiz_start | 开始测试 | bookId, quizType |
| quiz_answer | 答题 | questionId, isCorrect |
| quiz_complete | 完成测试 | bookId, score |

### 3.4 词汇事件 (Vocabulary)

| 事件名 | 说明 | 属性 |
|--------|------|------|
| word_add | 添加生词 | word, bookId |
| word_review | 复习单词 | word, result |
| word_master | 掌握单词 | word |

---

## 4. API 端点

### 追踪端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /tracking/event | 上报单个事件 |
| POST | /tracking/batch | 批量上报事件 |

### 统计端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /tracking/stats/daily | 获取每日统计 |
| GET | /tracking/stats/weekly | 获取周统计 |
| GET | /tracking/stats/monthly | 获取月统计 |
| GET | /tracking/stats/year/:year | 获取年度统计 |

### 请求/响应结构

#### TrackEventDto (请求)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventType | string | Y | 事件类型 |
| eventName | string | Y | 事件名称 |
| properties | object | N | 事件属性 |
| sessionId | string | N | 会话 ID |
| timestamp | number | N | 客户端时间戳 |

#### DailyStatsDto (响应)

| 字段 | 类型 | 说明 |
|------|------|------|
| date | string | 日期 |
| readingMinutes | number | 阅读时长 |
| pagesRead | number | 阅读页数 |
| wordsLearned | number | 学习单词数 |
| aiInteractions | number | AI 交互次数 |

---

## 5. 核心功能

### 5.1 事件上报流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    事件上报流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  客户端                         服务端                           │
│     │                              │                            │
│     │  POST /tracking/event        │                            │
│     │  { eventType, eventName,     │                            │
│     │    properties, timestamp }   │                            │
│     │ ───────────────────────────> │                            │
│     │                              │                            │
│     │                         1. 验证事件格式                    │
│     │                              │                            │
│     │                         2. 补充服务端信息                  │
│     │                            (userId, deviceId, serverTime)  │
│     │                              │                            │
│     │                         3. 写入 TrackingEvent             │
│     │                              │                            │
│     │                         4. 更新 DailyStats (异步)         │
│     │                              │                            │
│     │  { success: true }           │                            │
│     │ <─────────────────────────── │                            │
│     │                              │                            │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 批量上报

```
┌─────────────────────────────────────────────────────────────────┐
│                    批量上报策略                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  客户端本地队列                                                  │
│       │                                                          │
│       ├── 队列大小 >= 10 个事件                                  │
│       │       └── 触发上报                                       │
│       │                                                          │
│       ├── 距上次上报 >= 30 秒                                    │
│       │       └── 触发上报                                       │
│       │                                                          │
│       ├── App 即将进入后台                                       │
│       │       └── 立即上报                                       │
│       │                                                          │
│       └── 网络恢复                                               │
│               └── 上报离线期间积累的事件                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 每日统计聚合

```
┌─────────────────────────────────────────────────────────────────┐
│                    DailyStats 更新流程                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  事件入库                                                        │
│       │                                                          │
│       ▼                                                          │
│  判断事件类型                                                    │
│       │                                                          │
│       ├── reading_end                                           │
│       │       └── DailyStats.readingMinutes += duration         │
│       │           DailyStats.pagesRead += pagesRead             │
│       │                                                          │
│       ├── word_add                                              │
│       │       └── DailyStats.wordsLearned += 1                  │
│       │                                                          │
│       ├── ai_*                                                  │
│       │       └── DailyStats.aiInteractions += 1                │
│       │                                                          │
│       ├── reading_start (new book)                              │
│       │       └── DailyStats.booksStarted += 1                  │
│       │                                                          │
│       └── book_complete                                         │
│               └── DailyStats.booksCompleted += 1                │
│                                                                  │
│  使用 UPSERT 确保幂等                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 数据聚合

### 6.1 周/月统计

| 统计项 | 计算方式 |
|--------|----------|
| 周阅读时长 | SUM(readingMinutes) WHERE date IN week |
| 月阅读书籍 | COUNT(DISTINCT bookId) WHERE month |
| 平均每日时长 | SUM(readingMinutes) / activeDays |

### 6.2 年度统计

```
┌─────────────────────────────────────────────────────────────────┐
│                    年度统计结构                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  YearlyStatsDto                                                 │
│  ├── totalReadingHours      年度总阅读时长                       │
│  ├── totalBooksCompleted    年度完成书籍数                       │
│  ├── totalWordsLearned      年度学习单词数                       │
│  ├── totalPages             年度阅读页数                         │
│  ├── activeDays             活跃天数                             │
│  ├── longestStreak          最长连续阅读天数                     │
│  ├── favoriteCategory       最爱分类                             │
│  ├── favoriteAuthor         最爱作者                             │
│  ├── monthlyBreakdown       月度分布                             │
│  └── topBooks               阅读时长 Top 5 书籍                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 隐私与合规

### 7.1 数据保留策略

| 数据类型 | 保留期限 | 说明 |
|----------|----------|------|
| 原始事件 | 90 天 | 详细行为数据 |
| 每日聚合 | 3 年 | 统计数据 |
| 年度报告 | 永久 | 用户可见 |

### 7.2 数据脱敏

| 场景 | 处理方式 |
|------|----------|
| 分析导出 | 移除 userId, deviceId |
| 日志打印 | 仅打印事件类型, 不打印属性 |

---

## 8. 性能优化

| 优化项 | 策略 |
|--------|------|
| 批量写入 | 批量事件一次性入库 |
| 异步聚合 | DailyStats 更新异步执行 |
| 索引 | (userId, timestamp), (userId, date) |
| 分区 | 按月分区 TrackingEvent 表 |

---

## 9. 相关文档

| 文档 | 说明 |
|------|------|
| [annual-report.md](annual-report.md) | 年度报告 |
| [badges.md](badges.md) | 徽章系统 |
| [analytics.md](../../api/analytics.md) | 数据分析 |

---

*最后更新: 2025-12-31*
