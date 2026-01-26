# Readmigo 后端文档

> NestJS 后端服务 - 文档与代码对应关系

---

## 1. 文档盘点总览

```
┌─────────────────────────────────────────────────────────────────┐
│                    后端文档覆盖率分析                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  代码模块: 36 个                                                 │
│  数据模型: 87 个                                                 │
│  API 端点: 200+ 个                                              │
│                                                                  │
│  文档覆盖                                                        │
│  ├── 已有文档的模块: 36/36 (100%)  ✅                           │
│  ├── 后端专属文档:   docs/04-development/backend/modules/ (10个) │
│  └── 通用模块文档:   docs/07-modules/modules/ (24个)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 模块与文档对应表

### 2.1 核心服务模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| auth | `modules/auth/` | `modules/auth.md`, `account/system-design.md` | ✅ 完整 |
| users | `modules/users/` | `modules/users.md`, `account/` | ✅ 完整 |
| devices | `modules/devices/` | `backend/modules/devices.md` | ✅ 完整 |
| subscriptions | `modules/subscriptions/` | `modules/subscriptions.md` | ✅ 完整 |

### 2.2 内容与阅读模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| books | `modules/books/` | `modules/books.md` | ✅ 完整 |
| categories | `modules/categories/` | `backend/modules/categories.md` | ✅ 完整 |
| booklists | `modules/booklists/` | `backend/modules/booklists.md` | ✅ 完整 |
| reading | `modules/reading/` | `modules/reading.md` | ✅ 完整 |
| annotations | `modules/annotations/` | `modules/annotations.md` | ✅ 完整 |
| import | `modules/import/` | `infrastructure/book-import-system.md` | ✅ 完整 |

### 2.3 学习系统模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| vocabulary | `modules/vocabulary/` | `modules/vocabulary.md`, `learning/` | ✅ 完整 |
| characters | `modules/characters/` | `features/character-relationship-map-design.md` | ✅ 完整 |
| timeline | `modules/timeline/` | `features/story-timeline-design.md` | ✅ 完整 |
| annual-report | `modules/annual-report/` | `features/annual-reading-report-design.md` | ✅ 完整 |
| medals | `modules/medals/` | `features/medal-system-design.md` | ✅ 完整 |
| badges | `modules/badges/` | `backend/modules/badges.md` | ✅ 完整 |

### 2.4 AI 服务模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| ai | `modules/ai/` | `ai/ai-services-architecture.md`, `modules/ai.md` | ✅ 完整 |
| author-chat | `modules/author-chat/` | `features/author-chat-design.md` | ✅ 完整 |
| recommendation | `modules/recommendation/` | `modules/recommendation.md` | ✅ 完整 |

### 2.5 有声书模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| audiobooks | `modules/audiobooks/` | `audiobook/`, `modules/audiobook.md` | ✅ 完整 |

### 2.6 社区功能模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| agora | `modules/agora/` | `agora/`, `modules/social.md` | ✅ 完整 |
| quotes | `modules/quotes/` | `features/quotes-system-design.md` | ✅ 完整 |
| postcards | `modules/postcards/` | `features/postcards-system-design.md` | ✅ 完整 |
| authors | `modules/authors/` | `author/` | ✅ 完整 |

### 2.7 消息与支持模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| messages | `modules/messages/` | `modules/messaging.md` | ✅ 完整 |
| support | `modules/support/` | `features/customer-support-system-design.md` | ✅ 完整 |

### 2.8 运营与管理模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| admin | `modules/admin/` | `modules/admin.md` | ✅ 完整 |
| analytics | `modules/analytics/` | `modules/analytics.md` | ✅ 完整 |
| search | `modules/search/` | `modules/search.md` | ✅ 完整 |

### 2.9 基础设施模块

| 模块 | 代码路径 | 现有文档 | 状态 |
|------|----------|----------|------|
| config | `modules/config/` | `backend/modules/config.md` | ✅ 完整 |
| health | `modules/health/` | `backend/modules/health.md` | ✅ 完整 |
| logs | `modules/logs/` | `infrastructure/logging-and-crash-collection.md` | ✅ 完整 |
| jobs | `modules/jobs/` | `backend/modules/jobs.md` | ✅ 完整 |
| sync | `modules/sync/` | `backend/modules/sync.md` | ✅ 完整 |
| tracking | `modules/tracking/` | `backend/modules/tracking.md` | ✅ 完整 |
| version | `modules/version/` | `backend/modules/version.md` | ✅ 完整 |

---

## 3. 后端专属模块文档

### 3.1 docs/04-development/backend/modules/ 目录 (10个)

```
┌─────────────────────────────────────────────────────────────────┐
│                    后端模块文档 (已完成)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  核心功能                                                        │
│  ├── devices.md       设备管理与跨设备同步                       │
│  ├── sync.md          数据同步机制                               │
│  └── config.md        功能开关与环境配置                         │
│                                                                  │
│  业务功能                                                        │
│  ├── categories.md    书籍分类系统                               │
│  ├── booklists.md     书单与 AI 推荐                            │
│  └── badges.md        徽章成就系统                               │
│                                                                  │
│  运维相关                                                        │
│  ├── jobs.md          后台任务 (BullMQ)                         │
│  ├── tracking.md      用户行为追踪                               │
│  ├── health.md        健康检查端点                               │
│  └── version.md       版本管理                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 待更新的现有文档

| 文档 | 问题 | 建议 |
|------|------|------|
| `api/database-design.md` | 模型数量不匹配 (文档60+ vs 实际87) | 更新模型列表 |
| `api/backend-architecture.md` | 模块结构过时 | 同步最新模块 |

---

## 4. 数据库模型清单 (87个)

### 4.1 按领域分组

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prisma Models (87)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户域 (4)                                                      │
│  User, AccountDeletionLog, AccountIdMapping, Device              │
│                                                                  │
│  订阅域 (4)                                                      │
│  Subscription, Order, Transaction, RefundRequest                 │
│                                                                  │
│  书籍域 (11)                                                     │
│  Book, Chapter, BookScore, BookStats, BookDailyStats,           │
│  UserBook, ImportBatch, Category, BookCategory,                 │
│  DiscoverTab, BookList, BookListItem                            │
│                                                                  │
│  阅读域 (5)                                                      │
│  ReadingSession, Highlight, Annotation, Bookmark, Translation    │
│                                                                  │
│  词汇域 (4)                                                      │
│  Vocabulary, UserVocabulary, ReviewRecord, SupportedLocale       │
│                                                                  │
│  AI 域 (3)                                                       │
│  AIInteraction, DailyStats, FeatureFlag                         │
│                                                                  │
│  作者域 (10)                                                     │
│  Author, AuthorTimelineEvent, AuthorQuote, UserFavoriteAuthor,  │
│  AuthorInfluence, AuthorDomainContribution,                     │
│  AuthorHistoricalContext, AuthorChatSession, AuthorChatMessage  │
│                                                                  │
│  角色域 (5)                                                      │
│  BookCharacter, CharacterRelationship, BookCharacterGraph,      │
│  CharacterContribution                                          │
│                                                                  │
│  时间线域 (3)                                                    │
│  StoryEvent, EventConnection, TimelineConfig                    │
│                                                                  │
│  金句域 (2)                                                      │
│  Quote, QuoteLike                                                │
│                                                                  │
│  明信片域 (2)                                                    │
│  PostcardTemplate, Postcard                                      │
│                                                                  │
│  社区域 (7)                                                      │
│  AgoraPost, AgoraPostMedia, AgoraPostLike, AgoraComment,        │
│  AgoraCommentLike, AgoraBlock, AgoraReport                      │
│                                                                  │
│  消息域 (7)                                                      │
│  MessageThread, Message, MessageAttachment, MessageRating,      │
│  FAQCategory, FAQ, QuickReplyTemplate                           │
│                                                                  │
│  年报域 (5)                                                      │
│  AnnualReport, UserRankingSnapshot, UserHighlight,              │
│  ShareLog, AnnualReportShare                                    │
│                                                                  │
│  有声书域 (3)                                                    │
│  Audiobook, AudiobookChapter, UserAudiobookProgress             │
│                                                                  │
│  徽章域 (4)                                                      │
│  Medal, UserMedal, MedalProgress, MedalGlobalStats              │
│                                                                  │
│  日志域 (4)                                                      │
│  CrashReport, ErrorLog, ApplicationLog, RuntimeLog              │
│                                                                  │
│  任务域 (2)                                                      │
│  BackgroundJob, BatchOperation                                   │
│                                                                  │
│  支持域 (6)                                                      │
│  Feedback, FeedbackAttachment, Ticket, TicketMessage,           │
│  TicketHistory, TicketAttachment                                │
│                                                                  │
│  管理域 (1)                                                      │
│  Admin                                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 公共模块 (common/)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Common Utilities                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  apps/backend/src/common/                                        │
│  ├── decorators/          自定义装饰器                           │
│  ├── filters/             异常过滤器                             │
│  ├── guards/              认证守卫                               │
│  ├── interceptors/        拦截器                                 │
│  ├── middleware/          中间件                                 │
│  ├── prisma/              Prisma 服务                           │
│  ├── redis/               Redis 服务                            │
│  ├── storage/             R2 存储服务                           │
│  ├── i18n/                国际化                                 │
│  ├── localization/        本地化                                 │
│  ├── sentry/              错误监控                               │
│  └── services/            通用服务                               │
│                                                                  │
│  文档状态: 🔴 无专门文档                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 文档目录结构

### 6.1 现有后端相关文档分布

```
docs/
├── api/                           # API 核心文档
│   ├── api-design.md              # RESTful API 设计规范
│   ├── backend-architecture.md    # NestJS 模块架构
│   └── database-design.md         # PostgreSQL 数据模型
│
├── backend/                       # 后端专属文档 (本目录)
│   └── README.md                  # 后端文档中心
│
├── infrastructure/                # 基础设施
│   ├── be-environment-*.md        # 环境配置 (4个文件)
│   ├── book-import-system.md      # 导入系统
│   ├── logging-and-crash-collection.md
│   └── ...
│
├── ai/                            # AI 服务
│   ├── ai-services-architecture.md
│   └── cache-strategy.md
│
├── modules/                       # 模块文档 (24个)
│   ├── auth.md
│   ├── books.md
│   ├── users.md
│   └── ...
│
├── features/                      # 功能设计 (12个)
│   ├── medal-system-design.md
│   ├── character-relationship-map-design.md
│   └── ...
│
├── account/                       # 账户系统 (5个)
│   ├── system-design.md
│   └── ...
│
├── author/                        # 作者系统 (5个)
├── audiobook/                     # 有声书 (5个)
├── agora/                         # 社区 (3个)
└── learning/                      # 学习系统 (2个)
```

### 6.2 当前后端文档结构

```
docs/04-development/backend/
├── README.md                      # 后端文档中心 (本文档)
│
├── data-flow.md                   # 后端数据流详解 ✅
├── translation-performance-optimization.md
│
├── localization/                  # 本地化
├── subscriptions/                 # 订阅
└── modules/                       # 后端专属模块文档 (10个) ✅
    ├── devices.md                 # 设备管理
    ├── sync.md                    # 数据同步
    ├── config.md                  # 功能开关与环境
    ├── categories.md              # 分类系统
    ├── booklists.md               # 书单系统
    ├── badges.md                  # 徽章系统
    ├── jobs.md                    # 后台任务
    ├── tracking.md                # 行为追踪
    ├── health.md                  # 健康检查
    └── version.md                 # 版本检查
```

---

## 7. 文档维护

### 7.1 已完成工作 ✅

| 阶段 | 内容 | 状态 |
|------|------|------|
| 第一阶段 | 核心模块文档 (devices, sync, config) | ✅ 完成 |
| 第二阶段 | 业务模块文档 (categories, booklists, badges) | ✅ 完成 |
| 第三阶段 | 运维模块文档 (jobs, tracking, health, version) | ✅ 完成 |

### 7.2 后续维护

| 文档 | 更新内容 |
|------|----------|
| database-design.md | 更新为 87 个模型 |
| backend-architecture.md | 同步 36 个模块 |

---

## 8. 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| Runtime | Node.js | 20 LTS |
| Framework | NestJS | 10.4 |
| Language | TypeScript | 5.6 |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 15 (Neon) |
| Cache | Redis | 7 (Upstash) |
| Storage | Cloudflare R2 | - |
| Deployment | Fly.io | - |
| Monitoring | Sentry | - |

---

## 9. 相关文档链接

### 9.1 核心架构文档

| 类别 | 文档 |
|------|------|
| API 设计 | [api-design.md](../../03-architecture/api/api-design.md) |
| 模块架构 | [backend-architecture.md](../../03-architecture/api/backend-architecture.md) |
| 数据库设计 | [database-design.md](../../03-architecture/api/database-design.md) |
| 环境配置 | [environments.md](../../05-operations/deployment/environments.md) |
| AI 架构 | [ai-services-architecture.md](../../07-modules/ai/ai-services-architecture.md) |
| 全栈架构 | [03-architecture/README.md](../../03-architecture/) |

### 9.2 基础设施文档

| 类别 | 文档 |
|------|------|
| DO 主机信息 | [droplet.md](../../05-operations/deployment/services/droplet.md) |
| 数据库架构 | [database.md](../../05-operations/infrastructure/database.md) |
| R2 存储 | [cloudflare-r2.md](../../05-operations/infrastructure/cloudflare-r2.md) |
| 数据流 | [data-flow.md](./data-flow.md) |

### 9.3 网络服务文档

| 服务 | 文档 | 说明 |
|------|------|------|
| Fly.io | [fly-io.md](../../05-operations/deployment/services/fly-io.md) | 边缘部署平台 |
| Neon | [neon.md](../../05-operations/deployment/services/neon.md) | Serverless PostgreSQL |
| Upstash | [upstash.md](../../05-operations/deployment/services/upstash.md) | Serverless Redis |
| Cloudflare | [cloudflare.md](../../05-operations/deployment/services/cloudflare.md) | CDN/DNS/R2/Pages |
| Sentry | [sentry.md](../../05-operations/monitoring/sentry.md) | 错误监控平台 |

---

*最后更新: 2025-12-31*
