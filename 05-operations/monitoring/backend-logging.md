# 后端运行日志规范

## 1. 概述

### 1.1 目标
- 在关键功能点添加详细的运行日志，方便本地调试和线上问题定位
- 统一日志格式和级别定义
- 实现日志云端收集，支持查询和分析

### 1.2 现有基础设施

| 组件 | 后端 (NestJS) |
|------|---------------|
| 日志工具 | NestJS Logger + LogsService |
| 云端收集 | **Axiom** (全部日志) + Sentry (错误告警) |
| 数据库存储 | RuntimeLog 表 (ERROR/FATAL 备份) |
| 异步队列 | Bull Queue (批量写入) |

### 1.3 当前问题
- 运行日志覆盖不全，很多关键业务流程没有日志
- 缺少请求链路追踪（correlation ID）
- 日志级别使用不一致

---

## 2. 日志级别定义

| 级别 | 用途 | 示例 |
|------|------|------|
| **DEBUG** | 详细诊断信息，仅本地开发使用 | 缓存命中/未命中、解码过程 |
| **INFO** | 关键业务流程节点 | 用户登录成功、开始阅读、完成章节 |
| **WARNING** | 非致命异常，需要关注 | 网络重试、降级处理、数据不一致 |
| **ERROR** | 错误但可恢复 | API 调用失败、解码错误 |
| **FATAL** | 严重错误，影响核心功能 | 认证失败、数据库连接断开 |

**云端收集策略：**

| 环境 | 收集级别 | 说明 |
|------|----------|------|
| Development | DEBUG 及以上 | 全量收集，便于调试 |
| Staging | DEBUG 及以上 | 全量收集，模拟生产 |
| Production | INFO 及以上 | 默认策略，保证性能 |
| Production (调试模式) | DEBUG 及以上 | 临时开启，限时 1 小时 |

- 日志保留时间：10 天自动清理
- DEBUG 采样：生产环境可配置 1-10% 采样率

---

## 3. 需要增强日志的关键功能点

#### 认证模块 (Auth)
```
位置: apps/backend/src/modules/auth/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 用户登录 | INFO | `[Auth] User login: userId={id}, method={apple/email}` |
| Token 刷新 | DEBUG | `[Auth] Token refresh: userId={id}` |
| 登录失败 | WARNING | `[Auth] Login failed: email={email}, reason={reason}` |
| Token 无效 | WARNING | `[Auth] Invalid token: reason={expired/malformed}` |

#### 书籍模块 (Books)
```
位置: apps/backend/src/modules/books/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 获取书籍列表 | DEBUG | `[Books] Fetching books: language={lang}, page={page}` |
| 获取书籍详情 | INFO | `[Books] Get book detail: bookId={id}, userId={userId}` |
| 获取章节内容 | INFO | `[Books] Get chapter: bookId={id}, chapterNum={num}` |
| 书籍搜索 | DEBUG | `[Books] Search: query={q}, results={count}` |

#### 阅读模块 (Reading)
```
位置: apps/backend/src/modules/reading/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 创建阅读会话 | INFO | `[Reading] Session start: userId={id}, bookId={id}` |
| 更新阅读进度 | DEBUG | `[Reading] Progress update: sessionId={id}, progress={pct}%` |
| 完成章节 | INFO | `[Reading] Chapter completed: userId={id}, bookId={id}, chapter={num}` |
| 完成书籍 | INFO | `[Reading] Book completed: userId={id}, bookId={id}` |

#### AI 模块 (AI)
```
位置: apps/backend/src/modules/ai/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 单词解释请求 | INFO | `[AI] Word explain: word={word}, provider={openai/claude}` |
| 句子简化请求 | INFO | `[AI] Sentence simplify: length={chars}, provider={provider}` |
| 段落翻译请求 | INFO | `[AI] Paragraph translate: length={chars}, targetLang={lang}` |
| Provider 切换 | WARNING | `[AI] Provider fallback: from={p1} to={p2}, reason={reason}` |
| AI 请求失败 | ERROR | `[AI] Request failed: type={type}, error={msg}` |

#### 词汇模块 (Vocabulary)
```
位置: apps/backend/src/modules/vocabulary/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 保存单词 | INFO | `[Vocabulary] Word saved: userId={id}, word={word}` |
| 删除单词 | INFO | `[Vocabulary] Word deleted: userId={id}, word={word}` |
| 获取词汇列表 | DEBUG | `[Vocabulary] Fetch list: userId={id}, count={count}` |

#### 学习模块 (Learning)
```
位置: apps/backend/src/modules/learning/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 开始复习 | INFO | `[Learning] Review start: userId={id}, wordCount={count}` |
| 提交答案 | DEBUG | `[Learning] Answer submitted: wordId={id}, correct={bool}` |
| 复习完成 | INFO | `[Learning] Review completed: userId={id}, accuracy={pct}%` |

#### 社区模块 (Agora)
```
位置: apps/backend/src/modules/agora/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 发布帖子 | INFO | `[Agora] Post created: userId={id}, postId={id}` |
| 发表评论 | INFO | `[Agora] Comment added: userId={id}, postId={id}` |
| 点赞 | DEBUG | `[Agora] Like: userId={id}, targetType={post/comment}, targetId={id}` |
| 删除帖子 | INFO | `[Agora] Post deleted: userId={id}, postId={id}` |

#### 订阅模块 (Subscriptions)
```
位置: apps/backend/src/modules/subscriptions/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 验证收据 | INFO | `[Subscription] Verify receipt: userId={id}, productId={id}` |
| 订阅激活 | INFO | `[Subscription] Activated: userId={id}, plan={plan}, expiresAt={date}` |
| 订阅过期 | WARNING | `[Subscription] Expired: userId={id}, plan={plan}` |
| 验证失败 | ERROR | `[Subscription] Verification failed: userId={id}, error={msg}` |

#### 作者聊天模块 (Author-Chat)
```
位置: apps/backend/src/modules/author-chat/
```
| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 开始对话 | INFO | `[AuthorChat] Session start: userId={id}, authorId={id}` |
| 发送消息 | DEBUG | `[AuthorChat] Message sent: sessionId={id}, length={chars}` |
| 语音转文字 | DEBUG | `[AuthorChat] STT: duration={sec}s, provider={whisper}` |
| 文字转语音 | DEBUG | `[AuthorChat] TTS: length={chars}, provider={elevenlabs}` |
| 对话结束 | INFO | `[AuthorChat] Session end: sessionId={id}, messageCount={count}` |

---

## 4. 云端日志收集架构

### 4.1 数据流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────▶│ Bull Queue  │────▶│ Processor   │────▶│   Axiom     │
│ LogsService │     │  (Buffer)   │     │             │     │ (全部日志)  │
└─────────────┘     └─────────────┘     └──────┬──────┘     └─────────────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                         ▼                     ▼                     ▼
                   ┌──────────┐         ┌──────────┐         ┌──────────┐
                   │ Database │         │  Sentry  │         │ Database │
                   │ (回退)   │         │ (告警)   │         │(ERROR备份)│
                   └──────────┘         └──────────┘         └──────────┘
```

**说明：**
- 正常情况：日志发送到 Axiom（500GB/月免费，30天保留）
- Axiom 故障时：回退到数据库存储
- ERROR/FATAL：始终备份到数据库，便于快速查询

### 4.2 数据库表设计

扩展现有 `ApplicationLog` 表或新建 `RuntimeLog` 表：

```prisma
model RuntimeLog {
  id            String   @id @default(cuid())

  // 基础信息
  level         String   // DEBUG, INFO, WARNING, ERROR, FATAL
  category      String   // Auth, Books, Reading, AI, etc.
  message       String

  // 追踪信息
  correlationId String?  // 请求链路追踪 ID
  userId        String?
  sessionId     String?  // 阅读会话或应用会话 ID

  // 来源信息
  source        String   // backend, ios, android, web
  component     String   // 模块名称 (AuthService, BooksService, etc.)

  // 上下文
  metadata      Json?    // 额外的结构化数据

  // 客户端设备信息 (客户端上报时使用)
  deviceModel   String?
  osVersion     String?
  appVersion    String?
  buildNumber   String?

  // 时间
  timestamp     DateTime // 日志产生时间 (客户端时间)
  createdAt     DateTime @default(now()) // 入库时间

  @@index([userId, createdAt])
  @@index([correlationId])
  @@index([level, category])
  @@index([source, createdAt])
}
```

### 4.3 API 设计

#### 批量上报日志 (客户端使用)
```
POST /logs/runtime/batch

Request Body:
{
  "logs": [
    {
      "level": "INFO",
      "category": "Reader",
      "message": "[Reader] Open book: bookId=123, title=Great Gatsby",
      "correlationId": "req-abc123",
      "sessionId": "sess-xyz789",
      "metadata": { "bookId": "123", "title": "Great Gatsby" },
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "deviceInfo": {
    "deviceModel": "iPhone 15",
    "osVersion": "17.2",
    "appVersion": "1.2.0",
    "buildNumber": "42"
  }
}

Response:
{
  "received": 10,
  "accepted": 10
}
```

### 4.4 请求链路追踪

1. **客户端**：每次请求生成 `X-Correlation-ID` header
2. **Backend**：从 header 读取或生成 correlation ID
3. **日志**：所有相关日志携带相同 correlation ID
4. **查询**：通过 correlation ID 串联前后端日志

```typescript
// Backend - Middleware
const correlationId = req.headers['x-correlation-id'] || generateId();
req.correlationId = correlationId;
```

---

## 5. 日志查询与分析

### 5.1 Admin API (可选，后续实现)

```
GET /admin/logs/runtime
  ?userId={userId}
  &correlationId={id}
  &level={INFO,WARNING,ERROR}
  &category={Auth,Books,Reading}
  &source={ios,backend}
  &from={timestamp}
  &to={timestamp}
  &limit=100
```

### 5.2 常用查询场景

| 场景 | 查询条件 |
|------|----------|
| 追踪单次请求 | `correlationId = xxx` |
| 用户问题排查 | `userId = xxx AND createdAt > 24h ago` |
| 功能异常监控 | `level IN (ERROR, FATAL) AND category = AI` |
| 版本问题分析 | `appVersion = 1.2.0 AND level = ERROR` |

---

## 6. 实现状态

### Phase 1: 后端日志基础设施 ✅ COMPLETED
- [x] 创建 `RuntimeLog` 数据库表 (`packages/database/prisma/schema.prisma`)
- [x] 创建日志服务方法 (`LogsService.submitRuntimeLogBatch`, `logRuntime`, `queryRuntimeLogs`, `getRuntimeLogStats`)
- [x] 创建批量日志上报 API (`POST /logs/runtime/batch`, `POST /logs/runtime/batch/anonymous`)
- [x] 创建日志查询 API (`GET /logs/runtime`)
- [x] 创建日志统计 API (`GET /logs/runtime/stats`)
- [x] 实现 10 天自动清理 cron job (`cleanupOldRuntimeLogs`)

### Phase 2: 追踪与分析 ✅ COMPLETED
- [x] 实现请求链路追踪 (Correlation ID middleware)
- [x] 创建日志查询 Admin API (`GET /logs/runtime`)
- [x] 日志保留策略 (10天自动清理)

### Phase 3: Axiom 外部日志服务 ✅ COMPLETED (2026-01-17)
- [x] 创建 AxiomService (`common/axiom/axiom.service.ts`)
- [x] 创建 AxiomModule (`common/axiom/axiom.module.ts`)
- [x] 修改 LogsProcessor 发送日志到 Axiom
- [x] 实现 Axiom 故障回退到数据库
- [x] ERROR/FATAL 日志备份到数据库
- [x] 配置生产环境 Axiom Token

---

## 7. 注意事项

### 7.1 性能考虑
- 日志写入使用异步队列，不阻塞主线程
- 批量上报减少网络请求次数
- 本地日志有容量限制，避免占用过多存储

### 7.2 隐私保护
- 不记录用户密码、token 等敏感信息
- 不记录完整的用户输入内容（仅记录长度）
- 日志中的 userId 用于问题排查，不与 PII 关联

### 7.3 日志规范
- 统一使用 `[Category] Message` 格式
- 使用结构化参数 `key={value}` 便于解析
- 避免在日志中使用中文（便于搜索和解析）

---

## 8. 已确认决策

| 决策项 | 确认结果 |
|--------|----------|
| 日志级别策略 | 生产环境默认 INFO 及以上，DEBUG 可临时开启或采样 |
| 日志保留时间 | Axiom 30 天，数据库 10 天 |
| 外部日志服务 | **Axiom** (500GB/月免费) |
| 关键功能点覆盖 | 确认全面 |
| Admin 查询 UI | 使用 Axiom Dashboard（无需自建） |
| 日志格式 | 结构化格式 |
| 日志安全 | HTTPS 传输，角色访问控制 |
| 告警机制 | 基于 ERROR 频率告警 |

---

**状态：后端基础设施已实现**

### 已实现的 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/logs/runtime/batch` | POST | 批量提交运行日志 (需认证) |
| `/logs/runtime/batch/anonymous` | POST | 批量提交运行日志 (无需认证) |
| `/logs/runtime` | GET | 查询运行日志 (支持多种过滤条件) |
| `/logs/runtime/stats` | GET | 获取运行日志统计 |
| `/logs/runtime/cleanup` | DELETE | 手动触发日志清理 |

### 下一步工作

1. 在缺少日志的后端模块中添加 LogsService 调用
2. 参考第9节审计结果，优先完善 P2 模块 (analytics, search)

---

## 9. 后端模块日志审计 (2026-01-16 更新)

### 9.1 审计概览

| 统计项 | 数值 |
|--------|------|
| 后端模块总数 | 41 个 |
| 服务文件总数 | 78 个 |
| 使用 LogsService | 21 个 (26.9%) |
| 仅使用 Logger | 34 个 (43.6%) |
| 无日志的服务 | 23 个 (29.5%) |

### 9.2 已实现日志的模块 ✅

#### 核心业务模块 (Critical)

| 模块 | 服务文件 | 日志类型 | 覆盖程度 |
|------|----------|----------|----------|
| auth | auth.service.ts | LogsService + RuntimeLogLevel | ✅ 完整 (含详细步骤日志) |
| ai | ai.service.ts, ai-extended.service.ts, ai-router.service.ts | LogsService | ✅ 完整 |
| subscriptions | subscriptions.service.ts, trial.service.ts, stripe.service.ts, google-play.service.ts, apple-webhook.service.ts | LogsService | ✅ 完整 |
| reading | reading.service.ts | LogsService | ✅ 完整 |
| books | books.service.ts | LogsService | ✅ 完整 |
| vocabulary | vocabulary.service.ts | LogsService | ✅ 完整 |
| author-chat | author-chat.service.ts, video-chat.service.ts, voice-chat.service.ts | LogsService | ✅ 完整 |
| audiobooks | audiobooks.service.ts | LogsService | ✅ 完整 (7个调用点) |

#### 管理后台模块 (Admin)

| 模块 | 服务文件 | 日志类型 |
|------|----------|----------|
| admin | admin-auth.service.ts, admin.service.ts | Logger |
| admin/demographics | demographics.service.ts, demographics-cron.service.ts | Logger |
| admin/operations | operations-cron.service.ts | Logger |
| admin/performance | performance.service.ts | Logger |
| admin/reading-stats | reading-stats.service.ts | Logger |
| admin/retention | retention.service.ts, retention-cron.service.ts | Logger |
| admin/translations | translations.service.ts | Logger |

#### 辅助功能模块

| 模块 | 服务文件 | 日志类型 |
|------|----------|----------|
| agora | agora.service.ts, agora-cache.service.ts | LogsService |
| characters | characters.service.ts, data-fusion.service.ts, wikidata.service.ts | Logger |
| config | environment.service.ts | Logger |
| import | book-enrichment.service.ts, import-monitoring.service.ts | Logger |
| jobs | jobs.service.ts | Logger |
| logs | logs.service.ts | Logger (核心日志基础设施) |
| mail | mail.service.ts | Logger |
| messages | messages.service.ts, guest-feedback.service.ts | LogsService |
| notifications | push-notification.service.ts | Logger |
| recommendation | recommendation.service.ts, book-score.service.ts, discover-cache.service.ts | LogsService |
| support | feedback.service.ts, tickets.service.ts, support-stats.service.ts | Logger |
| sync | sync.service.ts | LogsService |
| tracking | tracking.service.ts | LogsService |
| users | users.service.ts | Logger |
| version | version.service.ts, manifest.service.ts | Logger |

### 9.3 缺少 LogsService 日志的模块 ❌

#### 完全无日志 (14个)

| 模块 | 服务文件 | 优先级 | 说明 |
|------|----------|--------|------|
| analytics | analytics.service.ts | P2 | 数据分析，建议添加 |
| annotations | annotations.service.ts | P3 | 批注功能，低频使用 |
| authors | authors.service.ts | P3 | 作者模块 |
| badges | badges.service.ts | P3 | 徽章系统，低频使用 |
| bilingual | bilingual.service.ts | P3 | 双语功能 |
| booklists | booklists.service.ts | P3 | 书单功能，低频使用 |
| browsing-history | browsing-history.service.ts | P3 | 浏览历史，低频使用 |
| categories | categories.service.ts | P3 | 分类模块 |
| devices | devices.service.ts | P3 | 设备管理 |
| favorites | favorites.service.ts | P3 | 收藏功能，低频使用 |
| health | health.service.ts | P3 | 健康检查 |
| postcards | postcards.service.ts | P3 | 明信片功能，低频使用 |
| quotes | quotes.service.ts | P3 | 引用模块 |
| search | search.service.ts | P2 | 搜索功能，建议添加 |

#### 仅使用 Logger (未使用 LogsService)

| 模块 | 服务文件 | 说明 |
|------|----------|------|
| timeline | timeline.service.ts | 时间线功能，已有 Logger |
| annual-report | annual-report.service.ts | 年度报告，已有 Logger |
| medals | medals.service.ts | 勋章系统，已有 Logger |

**优先级说明：**
- P1: 核心业务，必须有日志 (已全部完成)
- P2: 重要功能，建议添加日志
- P3: 辅助功能，可选添加日志

---

## 10. 标准化日志规范

### 10.1 日志格式模板

```
[Category:SubCategory] Message
```

**示例：**
```
[Auth:Google] Sign In Started
[Auth:Apple] Token verification failed
[Reading:Session] Chapter completed
[AI:Translation] Request failed
```

### 10.2 简单操作日志模式

适用于单步操作（查询、更新、删除等）：

```typescript
// 开始
await this.logsService.logRuntime(
  RuntimeLogLevel.DEBUG,
  'Category',
  `[Category] Operation started`,
  { userId, component: 'ServiceName', metadata: { /* 相关参数 */ } },
);

// 成功
await this.logsService.logRuntime(
  RuntimeLogLevel.INFO,
  'Category',
  `[Category] Operation success`,
  { userId, component: 'ServiceName', metadata: { /* 结果 */ } },
);

// 失败
await this.logsService.logRuntime(
  RuntimeLogLevel.ERROR,
  'Category',
  `[Category] Operation failed: ${error.message}`,
  { userId, component: 'ServiceName', metadata: { error: error.message, errorName: error.name } },
);
```

### 10.3 复杂操作日志模式 (步骤式)

适用于多步操作（登录、支付、数据迁移等）：

```typescript
async complexOperation(params: Params): Promise<Result> {
  const startTime = Date.now();

  // ========== 开始标记 ==========
  await this.logsService.logRuntime(
    RuntimeLogLevel.DEBUG,
    'Category',
    `[Category:Operation] ========== Operation Started ==========`,
    {
      userId,
      component: 'ServiceName',
      metadata: {
        // 所有输入参数
        param1: params.param1,
        param2: params.param2,
        hasOptionalParam: !!params.optionalParam,
      },
    },
  );

  // ========== Step 1 ==========
  await this.logsService.logRuntime(
    RuntimeLogLevel.DEBUG,
    'Category',
    `[Category:Operation] Step 1: Description`,
    { userId, component: 'ServiceName' },
  );

  try {
    const step1Result = await this.step1();
    await this.logsService.logRuntime(
      RuntimeLogLevel.DEBUG,
      'Category',
      `[Category:Operation] Step 1 Success`,
      { userId, component: 'ServiceName', metadata: { /* step1 结果 */ } },
    );
  } catch (error) {
    await this.logsService.logRuntime(
      RuntimeLogLevel.ERROR,
      'Category',
      `[Category:Operation] Step 1 Failed: ${error.message}`,
      { userId, component: 'ServiceName', metadata: { error: error.message, errorName: error.name } },
    );
    throw error;
  }

  // ========== Step 2, 3, ... ==========
  // 重复上述模式

  // ========== 成功标记 ==========
  const duration = Date.now() - startTime;
  await this.logsService.logRuntime(
    RuntimeLogLevel.INFO,
    'Category',
    `[Category:Operation] ========== Operation Success ==========`,
    {
      userId,
      component: 'ServiceName',
      metadata: {
        durationMs: duration,
        // 关键结果
      },
    },
  );

  return result;
}
```

### 10.4 日志内容规范

#### 必须记录的信息

| 场景 | 必须记录 |
|------|----------|
| 用户操作 | userId, 操作类型, 目标资源ID |
| API 调用 | endpoint, method, statusCode, durationMs |
| 数据库操作 | 操作类型 (CRUD), 影响行数, 表名 |
| 外部服务调用 | provider, requestType, success/failure, durationMs |
| 认证操作 | method (google/apple/email), 成功/失败原因, userId |
| 支付操作 | productId, transactionId, amount, status |

#### 禁止记录的信息

| 类型 | 示例 |
|------|------|
| 密码 | password, secret |
| Token | accessToken, refreshToken, idToken (仅记录长度) |
| 完整内容 | 书籍内容、用户输入 (仅记录长度) |
| 敏感信息 | 信用卡号、身份证号 |

### 10.5 日志级别使用指南

```
┌─────────────────────────────────────────────────────────────────┐
│                      日志级别选择流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  操作是否成功？                                                  │
│       │                                                         │
│       ├── 是 ──▶ 是否是关键业务节点？                            │
│       │              │                                          │
│       │              ├── 是 ──▶ INFO (登录成功、支付完成等)       │
│       │              │                                          │
│       │              └── 否 ──▶ DEBUG (缓存命中、中间步骤等)      │
│       │                                                         │
│       └── 否 ──▶ 是否可恢复？                                    │
│                      │                                          │
│                      ├── 是 ──▶ 是否需要关注？                   │
│                      │              │                           │
│                      │              ├── 是 ──▶ WARNING          │
│                      │              │                           │
│                      │              └── 否 ──▶ DEBUG            │
│                      │                                          │
│                      └── 否 ──▶ 是否影响核心功能？               │
│                                     │                           │
│                                     ├── 是 ──▶ FATAL            │
│                                     │                           │
│                                     └── 否 ──▶ ERROR            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. 待添加日志的模块规划

### 11.1 P2 优先级模块

#### Analytics (analytics.service.ts)

| 操作 | 日志级别 | 日志内容 |
|------|----------|----------|
| 记录事件 | DEBUG | `[Analytics] Event tracked: type={type}, userId={id}` |
| 获取统计 | DEBUG | `[Analytics] Stats fetched: range={days}days` |
| 批量上报 | INFO | `[Analytics] Batch uploaded: count={count}` |

### 11.2 P3 优先级模块

根据需要逐步添加，遵循 10.2 简单操作日志模式即可。

---

## 12. 审计更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-01-15 | 初次完整审计，识别 9 个缺少日志的模块 |
| 2026-01-15 | Auth 模块添加完整步骤式日志 (Google, Apple, Email, Guest, Upgrade) |
| 2026-01-15 | 制定标准化日志规范 |
| 2026-01-16 | 二次审计：audiobooks 已实现日志；新增 9 个模块；更新统计数据 |
| 2026-01-16 | 补充业界最佳实践：日志策略、聚合告警、安全、性能可靠性、OpenTelemetry 规划 |
| 2026-01-17 | **集成 Axiom 外部日志服务**，替代数据库存储，降低成本 |

---

## 13. Axiom 日志服务 ✅ 已集成

### 13.1 服务概览

| 项目 | 值 |
|------|-----|
| 服务商 | [Axiom](https://axiom.co) |
| Dataset | `readmigo-logs` |
| 免费额度 | 500GB/月 |
| 保留时间 | 30 天 |
| Dashboard | https://app.axiom.co/datasets/readmigo-logs |

### 13.2 环境变量配置

```bash
# 生产环境已配置
AXIOM_ENABLED=true
AXIOM_TOKEN=xaat-xxx  # fly secrets
AXIOM_DATASET=readmigo-logs
```

### 13.3 常用查询 (APL)

```apl
// 最近 100 条日志
['readmigo-logs']
| sort by _time desc
| limit 100

// 查询错误日志
['readmigo-logs']
| where level == "ERROR" or level == "FATAL"
| sort by _time desc

// 按用户查询
['readmigo-logs']
| where userId == "user_xxx"
| sort by _time desc

// 按链路 ID 追踪
['readmigo-logs']
| where correlationId == "abc123"
| sort by _time asc

// 按模块统计错误
['readmigo-logs']
| where level == "ERROR"
| summarize count() by category
| order by count_ desc

// 最近 24 小时错误趋势
['readmigo-logs']
| where level == "ERROR"
| where _time > ago(24h)
| summarize count() by bin(_time, 1h)

// 按来源统计
['readmigo-logs']
| summarize count() by source
```

### 13.4 数据结构

每条日志包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `_time` | datetime | 日志时间 |
| `level` | string | DEBUG/INFO/WARNING/ERROR/FATAL |
| `category` | string | 模块名称 (Auth, Books, AI 等) |
| `message` | string | 日志消息 |
| `userId` | string | 用户 ID |
| `correlationId` | string | 请求链路 ID |
| `sessionId` | string | 会话 ID |
| `source` | string | 来源 (backend/ios) |
| `component` | string | 组件名称 |
| `metadata` | object | 额外数据 |
| `environment` | string | 环境 (production/staging) |
| `deviceModel` | string | 设备型号 (客户端) |
| `appVersion` | string | 应用版本 (客户端) |

### 13.5 故障回退

```
Axiom 正常 → 全部日志发送到 Axiom
Axiom 故障 → 自动回退到数据库存储
ERROR/FATAL → 始终备份到数据库 (快速查询)
```

### 13.6 成本对比

| 方案 | 月成本 | 存储 | 保留 |
|------|--------|------|------|
| 数据库 (Neon) | $0-25 | 有限 | 10 天 |
| **Axiom 免费版** | **$0** | **500GB** | **30 天** |

---

## 14. 生产环境日志级别策略

### 13.1 分环境策略

```
┌─────────────────────────────────────────────────────────────────┐
│                        日志收集策略                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Development │    │   Staging   │    │ Production  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│    DEBUG 全量         DEBUG 全量         INFO 默认              │
│                                               │                 │
│                                    ┌──────────┴──────────┐      │
│                                    │                     │      │
│                                    ▼                     ▼      │
│                              DEBUG 采样            DEBUG 临时   │
│                              (1-10%)              (限时1小时)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 动态日志级别

| 功能 | 说明 |
|------|------|
| 环境变量控制 | `LOG_LEVEL=DEBUG` 临时调整 |
| 用户级别调试 | 针对特定 userId 开启 DEBUG |
| 模块级别调试 | 针对特定 category 开启 DEBUG |
| 自动恢复 | 超时后自动恢复默认级别 |

### 13.3 DEBUG 采样配置

```typescript
// 环境变量配置
DEBUG_SAMPLING_RATE=0.01  // 1% 采样
DEBUG_ENABLED_USERS=user1,user2  // 特定用户全量
DEBUG_ENABLED_CATEGORIES=Auth,AI  // 特定模块全量
```

---

## 15. 日志聚合与告警

### 15.1 推荐架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        日志聚合架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐   │
│  │ Backend │────▶│ Database│────▶│ Exporter│────▶│ Grafana │   │
│  │         │     │RuntimeLog│    │ (Cron)  │     │  Loki   │   │
│  └─────────┘     └─────────┘     └─────────┘     └────┬────┘   │
│       │                                               │        │
│       │                                               ▼        │
│       │                                         ┌─────────┐    │
│       └────────────────────────────────────────▶│ Sentry  │    │
│                    (ERROR/FATAL)                └─────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Grafana Dashboard                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │ 日志量趋势 │  │ 错误分布 │  │ 模块热力图│  │ 用户追踪 │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 15.2 告警规则

| 告警名称 | 条件 | 级别 | 通知渠道 |
|----------|------|------|----------|
| 高错误率 | ERROR 数量 > 100/5min | Critical | Slack + Email |
| FATAL 错误 | 任意 FATAL 日志 | Critical | Slack + PagerDuty |
| 认证异常 | Auth ERROR > 50/5min | Warning | Slack |
| AI 服务降级 | AI Provider fallback > 10/5min | Warning | Slack |
| 支付异常 | Subscription ERROR > 5/5min | Critical | Slack + Email |

### 15.3 Dashboard 设计

| Panel | 类型 | 数据源 |
|-------|------|--------|
| 日志量时序图 | Time Series | `count by level, 5min interval` |
| 错误 Top 10 模块 | Bar Chart | `count where level=ERROR group by category` |
| 最近错误列表 | Table | `level IN (ERROR, FATAL) order by timestamp` |
| 用户活动追踪 | Logs | `userId={selected} order by timestamp` |
| 请求链路追踪 | Logs | `correlationId={selected} order by timestamp` |

---

## 16. 日志安全

### 16.1 访问控制

```
┌─────────────────────────────────────────────────────────────────┐
│                        日志访问权限                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   角色      │    可访问日志范围                              │
│  ├─────────────┼───────────────────────────────────────────────│
│  │ Developer   │    Development 环境全部                        │
│  │ QA          │    Staging 环境全部                            │
│  │ SRE         │    所有环境 (脱敏后)                            │
│  │ Admin       │    所有环境 (完整)                              │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 16.2 传输安全

| 层级 | 措施 |
|------|------|
| 客户端→服务端 | HTTPS/TLS 1.3 |
| 服务端→数据库 | SSL 加密连接 |
| 数据库存储 | 静态加密 (AES-256) |

### 16.3 数据脱敏

| 字段类型 | 脱敏规则 | 示例 |
|----------|----------|------|
| Email | 保留首尾 | `t***@***.com` |
| Token | 仅记录长度 | `token_length=128` |
| IP 地址 | 去除最后一段 | `192.168.1.xxx` |
| 设备 ID | Hash 处理 | `device_hash=abc123` |

### 16.4 审计日志

对日志系统本身的操作进行审计：

| 操作 | 记录内容 |
|------|----------|
| 查询日志 | 操作者、查询条件、时间 |
| 导出日志 | 操作者、数据范围、导出格式 |
| 删除日志 | 操作者、删除范围、原因 |
| 修改配置 | 操作者、变更前后值 |

---

## 17. 性能与可靠性

### 17.1 异步写入架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        异步日志写入                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐   │
│  │ 业务代码 │────▶│ 内存队列 │────▶│ 批量写入 │────▶│ Database│   │
│  └─────────┘     └────┬────┘     └────┬────┘     └─────────┘   │
│                       │               │                         │
│                       │               │                         │
│              队列满时降级        失败时重试                       │
│              (丢弃 DEBUG)       (最多 3 次)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 17.2 重试策略

| 参数 | 值 | 说明 |
|------|-----|------|
| 最大重试次数 | 3 | 超过后丢弃并告警 |
| 重试间隔 | 指数退避 | 1s → 2s → 4s |
| 队列大小 | 10000 条 | 超过后丢弃 DEBUG |
| 批量大小 | 100 条 | 每批写入数量 |
| 刷新间隔 | 5 秒 | 最大等待时间 |

### 17.3 本地日志轮转

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 单文件大小 | 100MB | 超过后轮转 |
| 保留文件数 | 5 | 最多保留 5 个历史文件 |
| 压缩 | gzip | 历史文件压缩 |
| 总大小上限 | 500MB | 超过后删除最旧文件 |

### 17.4 APM 性能指标

除业务日志外，建议收集以下性能指标：

| 指标 | 类型 | 说明 |
|------|------|------|
| `http_request_duration_seconds` | Histogram | 请求耗时分布 (P50/P95/P99) |
| `http_requests_total` | Counter | 请求总数 (按状态码) |
| `db_query_duration_seconds` | Histogram | 数据库查询耗时 |
| `external_api_duration_seconds` | Histogram | 外部 API 调用耗时 |
| `active_connections` | Gauge | 当前活跃连接数 |
| `memory_usage_bytes` | Gauge | 内存使用量 |

---

## 18. 未来规划：OpenTelemetry

### 18.1 统一可观测性架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenTelemetry 架构 (规划中)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Application                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Traces  │  │  Metrics │  │   Logs   │              │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │   │
│  │       │             │             │                     │   │
│  │       └─────────────┼─────────────┘                     │   │
│  │                     ▼                                   │   │
│  │            ┌─────────────────┐                          │   │
│  │            │ OTel SDK        │                          │   │
│  │            └────────┬────────┘                          │   │
│  └─────────────────────┼───────────────────────────────────┘   │
│                        ▼                                       │
│               ┌─────────────────┐                              │
│               │ OTel Collector  │                              │
│               └────────┬────────┘                              │
│                        │                                       │
│        ┌───────────────┼───────────────┐                       │
│        ▼               ▼               ▼                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│  │  Jaeger  │   │Prometheus│   │  Loki    │                   │
│  │ (Traces) │   │(Metrics) │   │ (Logs)   │                   │
│  └──────────┘   └──────────┘   └──────────┘                   │
│        │               │               │                       │
│        └───────────────┼───────────────┘                       │
│                        ▼                                       │
│               ┌─────────────────┐                              │
│               │    Grafana      │                              │
│               │  (Unified UI)   │                              │
│               └─────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 18.2 JSON 日志格式 (规划中)

当前格式:
```
[Auth] User login: userId=123, method=apple
```

目标格式:
```json
{
  "timestamp": "2026-01-16T10:30:00.123Z",
  "level": "INFO",
  "category": "Auth",
  "message": "User login",
  "traceId": "abc123def456",
  "spanId": "789xyz",
  "attributes": {
    "userId": "123",
    "method": "apple",
    "component": "AuthService"
  },
  "resource": {
    "service.name": "readmigo-backend",
    "service.version": "2.0.0",
    "deployment.environment": "production"
  }
}
```

### 18.3 迁移路线图

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 基础日志设施 (RuntimeLog) | ✅ 已完成 |
| Phase 2 | 链路追踪 (Correlation ID) | ✅ 已完成 |
| Phase 3 | JSON 格式输出 | 📋 规划中 |
| Phase 4 | OpenTelemetry SDK 集成 | 📋 规划中 |
| Phase 5 | Grafana 统一可观测性 | 📋 规划中 |

### 18.4 技术选型建议

| 组件 | 推荐方案 | 备选方案 |
|------|----------|----------|
| 日志收集 | Grafana Loki | ELK Stack |
| 链路追踪 | Jaeger | Zipkin |
| 指标监控 | Prometheus | InfluxDB |
| 可视化 | Grafana | Kibana |
| 告警 | Grafana Alerting | PagerDuty |
