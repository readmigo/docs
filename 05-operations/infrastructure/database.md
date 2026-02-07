# 数据库架构详解

> Neon PostgreSQL - Readmigo 核心数据存储

---

## 1. 数据库概览

| 项目 | 值 |
|------|-----|
| 服务商 | Neon (Serverless PostgreSQL) |
| 版本 | PostgreSQL 15 |
| 区域 | ap-southeast-1 (新加坡) |
| ORM | Prisma 6.x |
| 连接方式 | Pooled Connection (推荐) |

核心特性:

| 特性 | 说明 |
|------|------|
| Serverless 架构 | 按需自动扩缩容 |
| 分支功能 | 数据库版本管理 |
| 连接池 | 内置 PgBouncer |
| 自动备份 | 时间点恢复 |

---

## 2. 环境配置

| 环境 | 数据库 | 连接方式 | 数据特点 |
|------|--------|----------|----------|
| Production | Neon 主实例 | Pooled | 真实用户数据 |
| Local | Docker PostgreSQL | Direct | 种子数据 |

---

## 3. 数据模型总览 (87+ Prisma Models)

| 域 | 模型数 | 主要模型 |
|----|--------|----------|
| 用户域 | 6 | User, Device, Subscription, Order |
| 书籍域 | 12 | Book, Chapter, BookScore, Category, DiscoverTab, BookList |
| 阅读域 | 6 | ReadingSession, Highlight, Annotation, Bookmark, Translation |
| 词汇域 | 4 | Vocabulary, UserVocabulary, ReviewRecord |
| AI 域 | 3 | AIInteraction, FeatureFlag, Config |
| 作者域 | 9 | Author, AuthorQuote, AuthorChatSession |
| 角色域 | 4 | BookCharacter, CharacterRelationship |
| 时间线域 | 3 | StoryEvent, EventConnection |
| 社区域 | 9 | Quote, Postcard, AgoraPost, AgoraComment |
| 有声书域 | 3 | Audiobook, AudiobookChapter |
| 年报域 | 5 | AnnualReport, UserRankingSnapshot |
| 徽章域 | 4 | Medal, UserMedal |
| 客服域 | 8 | Feedback, Ticket, FAQ |
| 日志域 | 4 | CrashReport, ErrorLog, ApplicationLog |
| 任务域 | 2 | BackgroundJob, BatchOperation |

---

## 4. 核心模型关系图

### 4.1 用户与书籍关系

```mermaid
graph TB
    User["User"] -->|"1:N"| UserBook["UserBook<br>(书架)"]
    Book["Book"] -->|"1:N"| Chapter["Chapter"]
    Chapter -->|"N:1"| UserBook
    UserBook -->|"1:N"| ReadingSession["ReadingSession<br>(阅读会话)"]
    User2["User"] -->|"1:N"| UserVocabulary["UserVocabulary<br>(生词本)"]
    UserVocabulary -->|"N:1"| Vocabulary["Vocabulary<br>(全局词库)"]
```

### 4.2 作者与内容关系

```mermaid
graph TB
    Author["Author"] --> TimelineEvents["Timeline Events"]
    Author --> Quotes["Quotes"]
    Author --> ChatSession["ChatSession<br>(AI对话)"]
    ChatSession --> ChatMessages["ChatMessages"]
    Author -->|"1:N"| Book["Book"]
    Book -->|"1:N"| BookCharacter["BookCharacter<br>(书中人物)"]
    BookCharacter -->|"N:N"| CharacterRelationship["CharacterRelationship<br>(人物关系)"]
```

---

## 5. 关键枚举类型

| 枚举 | 值 |
|------|-----|
| AccountType | GUEST, REGISTERED |
| AccountStatus | ACTIVE, SUSPENDED, MERGED, PENDING_DELETION, DELETED |
| PlanType | FREE, PRO, PREMIUM |
| SubscriptionStatus | ACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD, TRIAL, TRIAL_EXPIRED |
| BookSource | STANDARD_EBOOKS, GUTENBERG, INTERNET_ARCHIVE, USER_UPLOAD, CTEXT, WIKISOURCE_ZH, GUTENBERG_ZH, SHUGE |
| BookStatus | PENDING, PROCESSING, ACTIVE, INACTIVE, ERROR |
| ImportStatus | PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, ROLLED_BACK |

---

## 6. 索引策略

| 表 | 索引 | 类型 | 说明 |
|----|------|------|------|
| User | email | UNIQUE | 唯一索引 |
| User | appleId, googleId | UNIQUE | OAuth 唯一 |
| User | deviceId, accountType, status | INDEX | 查询筛选 |
| Book | [source, sourceId] | UNIQUE | 来源唯一约束 |
| Book | status, difficultyScore, authorId | INDEX | 查询排序 |
| UserBook | [userId, bookId] | UNIQUE | 用户-书籍唯一 |
| UserBook | [userId, status] | INDEX | 书架查询 |
| ReadingSession | [userId, startedAt] | INDEX | 阅读历史 |
| UserVocabulary | [userId, wordId] | UNIQUE | 生词唯一 |
| UserVocabulary | [userId, status], [userId, nextReviewAt] | INDEX | 复习查询 |
| BookScore | finalScore, qualityScore, popularityScore | INDEX DESC | 排序 |

---

## 7. 数据安全

| 数据类型 | 处理方式 | 说明 |
|----------|----------|------|
| 用户邮箱 | 加密存储 | AES-256 加密 |
| Apple ID | 哈希存储 | 单向哈希 |
| 设备 Token | 加密存储 | 推送通知用 |
| 支付信息 | 外部存储 | Apple/Google 托管 |

### 数据同步与匿名化

```mermaid
graph TB
    A["Production Database"] --> B["Data Export<br>(pg_dump)"]
    B --> C["Anonymizer Script<br>email -> hash<br>displayName -> fake<br>appleId -> hash<br>排除订阅/支付表"]
    C --> D["Local Dev DB"]
```

---

## 8. 备份策略

| 备份类型 | 频率 | 保留期 | 说明 |
|----------|------|--------|------|
| 时间点恢复 | 持续 | 7天 | 任意时间点恢复 |
| 每日快照 | 每日 | 30天 | 完整数据快照 |
| 分支备份 | 按需 | 无限 | Neon 分支功能 |

灾难恢复:

| 指标 | 目标 |
|------|------|
| RTO (恢复时间) | < 1 小时 |
| RPO (恢复点) | < 5 分钟 |

---

## 9. 连接配置

| 连接类型 | URL 格式 | 用途 |
|----------|----------|------|
| Pooled | postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db | 应用连接 (推荐) |
| Direct | postgresql://user:pass@ep-xxx.region.neon.tech/db | 迁移用 |

连接参数:

| 参数 | 值 | 说明 |
|------|-----|------|
| sslmode | require | 强制 SSL |
| connection_limit | 20 (Production) / 5 (Local) | 连接池大小 |
| pool_timeout | 10 | 连接超时 (秒) |

---

## 10. 相关文档

| 文档 | 说明 |
|------|------|
| [cloudflare-r2.md](./cloudflare-r2.md) | R2 存储详解 |
| [neon.md](../deployment/services/neon.md) | Neon 服务概览 |

---

*最后更新: 2026-02-07*
