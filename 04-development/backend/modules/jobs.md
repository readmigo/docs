# 后台任务模块 (Jobs)

> BullMQ 任务队列、异步处理、批量操作

---

## 1. 模块概述

```
┌─────────────────────────────────────────────────────────────────┐
│                        后台任务模块                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  技术栈                                                          │
│  ├── BullMQ          任务队列库                                  │
│  ├── Redis           队列存储                                    │
│  └── Worker          任务处理器                                  │
│                                                                  │
│  任务队列 (4 个)                                                 │
│  ├── AUTHOR_DATA     作者数据处理                               │
│  ├── BOOK_DATA       书籍数据处理                               │
│  ├── QUOTE_DATA      金句数据处理                               │
│  └── BATCH_ORCHESTRATOR  批量任务编排                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 队列架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    BullMQ 任务队列架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   API Request                                                   │
│       │                                                          │
│       ▼                                                          │
│   JobsService.addJob()                                          │
│       │                                                          │
│       ▼                                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      Redis                               │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│   │  │ AUTHOR_DATA │  │ BOOK_DATA   │  │ QUOTE_DATA  │      │   │
│   │  │   Queue     │  │   Queue     │  │   Queue     │      │   │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │   │
│   │         │                │                │              │   │
│   └─────────┼────────────────┼────────────────┼──────────────┘   │
│             │                │                │                  │
│             ▼                ▼                ▼                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │   Worker    │  │   Worker    │  │   Worker    │             │
│   │ (Author)    │  │  (Book)     │  │  (Quote)    │             │
│   └─────────────┘  └─────────────┘  └─────────────┘             │
│             │                │                │                  │
│             ▼                ▼                ▼                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   AI Services                            │   │
│   │         DeepSeek / OpenAI / Anthropic                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 任务类型

### 3.1 AUTHOR_DATA 队列

| 任务类型 | 说明 | AI 模型 |
|----------|------|---------|
| GENERATE_PERSONA | 生成作者人设 | DeepSeek |
| GENERATE_BIO | 生成作者传记 | DeepSeek |
| GENERATE_TIMELINE | 生成作者年表 | DeepSeek |
| ENRICH_FROM_WIKIDATA | Wikidata 数据增强 | - |
| FETCH_AVATAR | 获取作者头像 | - |

### 3.2 BOOK_DATA 队列

| 任务类型 | 说明 | AI 模型 |
|----------|------|---------|
| GENERATE_SUMMARY | 生成书籍简介 | DeepSeek |
| GENERATE_CEFR | 评估 CEFR 难度 | DeepSeek |
| EXTRACT_CHARACTERS | 提取角色信息 | Claude |
| GENERATE_CHINESE_TITLE | 生成中文书名 | Qwen |
| PROCESS_EPUB | 处理 EPUB 文件 | - |

### 3.3 QUOTE_DATA 队列

| 任务类型 | 说明 | AI 模型 |
|----------|------|---------|
| EXTRACT_QUOTES | 提取书籍金句 | DeepSeek |
| TRANSLATE_QUOTE | 翻译金句 | Qwen |
| CATEGORIZE_QUOTE | 金句分类 | DeepSeek |

### 3.4 BATCH_ORCHESTRATOR 队列

| 任务类型 | 说明 | 包含子任务 |
|----------|------|------------|
| BATCH_IMPORT_BOOKS | 批量导入书籍 | PROCESS_EPUB × N |
| BATCH_ENRICH_AUTHORS | 批量增强作者 | GENERATE_PERSONA × N |
| BATCH_GENERATE_CEFR | 批量 CEFR | GENERATE_CEFR × N |

---

## 4. 数据模型

### Job 表结构 (任务记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| queueName | String | 队列名 |
| jobType | String | 任务类型 |
| status | Enum | 状态 |
| payload | JSON | 任务参数 |
| result | JSON? | 执行结果 |
| error | String? | 错误信息 |
| attempts | Int | 已尝试次数 |
| maxAttempts | Int | 最大尝试次数 |
| priority | Int | 优先级 |
| progress | Int | 进度 (0-100) |
| createdAt | DateTime | 创建时间 |
| startedAt | DateTime? | 开始时间 |
| completedAt | DateTime? | 完成时间 |

### 任务状态流转

```
┌─────────────────────────────────────────────────────────────────┐
│                    任务状态流转                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │ PENDING  │  等待执行                                         │
│  └────┬─────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                   │
│  │ RUNNING  │  执行中                                           │
│  └────┬─────┘                                                   │
│       │                                                          │
│       ├────────────────────┬────────────────────┐               │
│       ▼                    ▼                    ▼               │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐          │
│  │COMPLETED │        │  FAILED  │        │ RETRYING │          │
│  └──────────┘        └──────────┘        └────┬─────┘          │
│      成功                失败                   │                │
│                          ↑                    │                │
│                          └────────────────────┘                │
│                            超过最大重试次数                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. API 端点

### 管理端点 (Admin)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /jobs | 获取任务列表 |
| GET | /jobs/:id | 获取任务详情 |
| POST | /jobs | 创建任务 |
| POST | /jobs/:id/retry | 重试失败任务 |
| DELETE | /jobs/:id | 取消/删除任务 |
| GET | /jobs/queue/:name/stats | 队列统计 |
| POST | /jobs/queue/:name/pause | 暂停队列 |
| POST | /jobs/queue/:name/resume | 恢复队列 |
| POST | /jobs/queue/:name/clean | 清理完成任务 |

### 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| queue | string? | 队列名过滤 |
| status | string? | 状态过滤 |
| jobType | string? | 任务类型过滤 |
| page | number | 页码 |
| limit | number | 每页数量 |

---

## 6. 核心功能

### 6.1 任务添加

```
┌─────────────────────────────────────────────────────────────────┐
│                    addJob 流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JobsService.addJob(queue, type, payload, options)              │
│       │                                                          │
│       ▼                                                          │
│  1. 验证队列名和任务类型                                         │
│       │                                                          │
│       ▼                                                          │
│  2. 创建 Job 数据库记录 (status: PENDING)                       │
│       │                                                          │
│       ▼                                                          │
│  3. 添加到 BullMQ 队列                                          │
│     ├── jobId: 数据库 Job ID                                    │
│     ├── data: payload                                           │
│     ├── opts: { priority, attempts, delay, backoff }            │
│       │                                                          │
│       ▼                                                          │
│  4. 返回 Job ID                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 任务处理

```
┌─────────────────────────────────────────────────────────────────┐
│                    Worker 处理流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Worker 从队列获取任务                                           │
│       │                                                          │
│       ▼                                                          │
│  1. 更新 Job 状态为 RUNNING                                     │
│       │                                                          │
│       ▼                                                          │
│  2. 根据 jobType 分发到处理器                                   │
│     ├── GENERATE_PERSONA → AuthorPersonaProcessor               │
│     ├── GENERATE_SUMMARY → BookSummaryProcessor                 │
│     └── ...                                                     │
│       │                                                          │
│       ▼                                                          │
│  3. 执行具体处理逻辑                                             │
│     ├── 调用 AI 服务                                            │
│     ├── 更新数据库                                               │
│     └── 更新进度 (job.progress)                                 │
│       │                                                          │
│       ▼                                                          │
│  4. 处理结果                                                     │
│     ├── 成功 → 更新状态为 COMPLETED, 存储 result                │
│     └── 失败 → 更新状态为 FAILED/RETRYING, 存储 error           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 批量编排

```
┌─────────────────────────────────────────────────────────────────┐
│                    批量任务编排                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BATCH_IMPORT_BOOKS                                             │
│       │                                                          │
│       ▼                                                          │
│  1. 解析导入列表 (N 本书)                                        │
│       │                                                          │
│       ▼                                                          │
│  2. 创建 N 个子任务                                              │
│     ├── PROCESS_EPUB (book_1)                                   │
│     ├── PROCESS_EPUB (book_2)                                   │
│     └── ...                                                     │
│       │                                                          │
│       ▼                                                          │
│  3. 添加到 BOOK_DATA 队列                                       │
│       │                                                          │
│       ▼                                                          │
│  4. 监控子任务完成情况                                           │
│       │                                                          │
│       ▼                                                          │
│  5. 全部完成后更新批量任务状态                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 配置选项

### 7.1 队列配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| defaultJobOptions.attempts | 3 | 默认重试次数 |
| defaultJobOptions.backoff.type | 'exponential' | 重试策略 |
| defaultJobOptions.backoff.delay | 5000 | 初始延迟 (ms) |
| defaultJobOptions.removeOnComplete | 100 | 保留完成任务数 |
| defaultJobOptions.removeOnFail | 500 | 保留失败任务数 |

### 7.2 Worker 配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| concurrency | 5 | 并发数 |
| limiter.max | 10 | 限流最大数 |
| limiter.duration | 1000 | 限流时间窗口 (ms) |

---

## 8. 监控与运维

### 8.1 队列统计

| 指标 | 说明 |
|------|------|
| waiting | 等待中任务数 |
| active | 执行中任务数 |
| completed | 已完成任务数 |
| failed | 失败任务数 |
| delayed | 延迟任务数 |

### 8.2 告警规则

| 条件 | 级别 | 说明 |
|------|------|------|
| waiting > 1000 | Warning | 队列积压 |
| failed > 100 (1h) | Critical | 大量失败 |
| active = 0 && waiting > 0 | Error | Worker 停止 |

---

## 9. 相关文档

| 文档 | 说明 |
|------|------|
| [ai-services-architecture.md](../../ai/ai-services-architecture.md) | AI 服务架构 |
| [public-domain-books.md](../../content/public-domain-books.md) | 书籍入库 |

---

*最后更新: 2025-12-31*
