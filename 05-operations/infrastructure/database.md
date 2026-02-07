# 数据库架构详解

> Neon PostgreSQL - Readmigo 核心数据存储

---

## 1. 数据库概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  服务商        Neon (Serverless PostgreSQL)                     │
│  版本          PostgreSQL 15                                    │
│  区域          ap-southeast-1 (新加坡)                          │
│                                                                  │
│  特性                                                            │
│  ├── Serverless 架构 - 按需自动扩缩容                           │
│  ├── 分支功能 - 数据库版本管理                                  │
│  ├── 连接池 - 内置 PgBouncer                                   │
│  └── 自动备份 - 时间点恢复                                      │
│                                                                  │
│  ORM          Prisma 6.x                                        │
│  连接方式      Pooled Connection (推荐)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 多环境数据库架构

```mermaid
graph TB
    A["Production Database<br>真实用户数据<br>完整备份策略<br>高可用配置"] -->|"数据同步"| B["Staging Database<br>匿名化数据快照<br>每周同步更新<br>预发布验证"]
    A --> C["Debug Database<br>功能调试测试<br>按需数据同步<br>开发团队专用"]
    B --> D["Local Database<br>本地 Docker<br>种子数据<br>快速迭代"]
```

### 2.1 环境配置

| 环境 | 数据库实例 | 连接方式 | 数据特点 |
|------|-----------|----------|----------|
| Production | Neon 主实例 | Pooled | 真实用户数据 |
| Staging | Neon 独立实例 | Pooled | 生产数据快照 (匿名化) |
| Debug | Neon 独立实例 | Pooled | 测试数据 |
| Local | Docker PostgreSQL | Direct | 种子数据 |

---

## 3. 数据模型总览

### 3.1 模型统计

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prisma Models (87+)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户域 (6)                                                      │
│  ├── User                  用户主表                             │
│  ├── Device                设备信息                             │
│  ├── AccountDeletionLog    注销日志                             │
│  ├── AccountIdMapping      账号ID映射                           │
│  ├── Subscription          订阅信息                             │
│  └── Order                 订单记录                             │
│                                                                  │
│  书籍域 (12)                                                     │
│  ├── Book                  书籍主表                             │
│  ├── Chapter               章节内容                             │
│  ├── BookScore             书籍评分                             │
│  ├── BookStats             书籍统计                             │
│  ├── BookDailyStats        每日统计                             │
│  ├── UserBook              用户书架                             │
│  ├── ImportBatch           导入批次                             │
│  ├── Category              分类                                 │
│  ├── BookCategory          书籍分类关联                         │
│  ├── DiscoverTab           发现页Tab                            │
│  ├── BookList              书单                                 │
│  └── BookListItem          书单条目                             │
│                                                                  │
│  阅读域 (6)                                                      │
│  ├── ReadingSession        阅读会话                             │
│  ├── Highlight             高亮划线                             │
│  ├── Annotation            批注                                 │
│  ├── Bookmark              书签                                 │
│  ├── Translation           翻译记录                             │
│  └── DailyStats            每日学习统计                         │
│                                                                  │
│  词汇域 (4)                                                      │
│  ├── Vocabulary            全局词库                             │
│  ├── UserVocabulary        用户生词本                           │
│  ├── ReviewRecord          复习记录                             │
│  └── SupportedLocale       支持的语言                           │
│                                                                  │
│  AI 域 (3)                                                       │
│  ├── AIInteraction         AI交互记录                           │
│  ├── FeatureFlag           功能开关                             │
│  └── Config                系统配置                             │
│                                                                  │
│  作者域 (9)                                                      │
│  ├── Author                作者主表                             │
│  ├── AuthorTimelineEvent   作者时间线                           │
│  ├── AuthorQuote           作者名言                             │
│  ├── UserFavoriteAuthor    用户收藏作者                         │
│  ├── AuthorInfluence       作者影响力                           │
│  ├── AuthorDomainContribution  领域贡献                        │
│  ├── AuthorHistoricalContext   历史背景                        │
│  ├── AuthorChatSession     AI对话会话                           │
│  └── AuthorChatMessage     AI对话消息                           │
│                                                                  │
│  角色域 (4)                                                      │
│  ├── BookCharacter         书籍人物                             │
│  ├── CharacterRelationship 人物关系                             │
│  ├── BookCharacterGraph    人物关系图                           │
│  └── CharacterContribution 用户贡献                             │
│                                                                  │
│  时间线域 (3)                                                    │
│  ├── StoryEvent            故事事件                             │
│  ├── EventConnection       事件关联                             │
│  └── TimelineConfig        时间线配置                           │
│                                                                  │
│  社区域 (9)                                                      │
│  ├── Quote / QuoteLike     金句系统                             │
│  ├── PostcardTemplate      明信片模板                           │
│  ├── Postcard              用户明信片                           │
│  ├── AgoraPost             城邦帖子                             │
│  ├── AgoraPostMedia        帖子媒体                             │
│  ├── AgoraPostLike         帖子点赞                             │
│  ├── AgoraComment          帖子评论                             │
│  ├── AgoraCommentLike      评论点赞                             │
│  └── AgoraBlock/Report     屏蔽举报                             │
│                                                                  │
│  有声书域 (3)                                                    │
│  ├── Audiobook             有声书主表                           │
│  ├── AudiobookChapter      有声书章节                           │
│  └── UserAudiobookProgress 用户收听进度                         │
│                                                                  │
│  年报域 (5)                                                      │
│  ├── AnnualReport          年度报告                             │
│  ├── UserRankingSnapshot   用户排名快照                         │
│  ├── UserHighlight         用户亮点                             │
│  ├── ShareLog              分享日志                             │
│  └── AnnualReportShare     年报分享                             │
│                                                                  │
│  徽章域 (4)                                                      │
│  ├── Medal                 勋章定义                             │
│  ├── UserMedal             用户勋章                             │
│  ├── MedalProgress         获取进度                             │
│  └── MedalGlobalStats      全局统计                             │
│                                                                  │
│  客服域 (8)                                                      │
│  ├── Feedback              用户反馈                             │
│  ├── FeedbackAttachment    反馈附件                             │
│  ├── Ticket                工单                                 │
│  ├── TicketMessage         工单消息                             │
│  ├── TicketHistory         工单历史                             │
│  ├── TicketAttachment      工单附件                             │
│  ├── FAQCategory           FAQ分类                              │
│  └── FAQ                   FAQ条目                              │
│                                                                  │
│  日志域 (4)                                                      │
│  ├── CrashReport           崩溃报告                             │
│  ├── ErrorLog              错误日志                             │
│  ├── ApplicationLog        应用日志                             │
│  └── RuntimeLog            运行时日志                           │
│                                                                  │
│  任务域 (2)                                                      │
│  ├── BackgroundJob         后台任务                             │
│  └── BatchOperation        批量操作                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

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

### 5.1 用户相关

| 枚举 | 值 | 说明 |
|------|-----|------|
| **AccountType** | GUEST, REGISTERED | 账号类型 |
| **AccountStatus** | ACTIVE, SUSPENDED, MERGED, PENDING_DELETION, DELETED | 账号状态 |
| **EnglishLevel** | BEGINNER, INTERMEDIATE, ADVANCED | 英语水平 |
| **Platform** | IOS, ANDROID, WEB | 平台类型 |

### 5.2 订阅相关

| 枚举 | 值 | 说明 |
|------|-----|------|
| **PlanType** | FREE, PRO, PREMIUM | 订阅计划 |
| **SubscriptionStatus** | ACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD, TRIAL, TRIAL_EXPIRED | 订阅状态 |
| **SubscriptionSource** | NONE, APPLE_IAP, GOOGLE_PLAY, STRIPE, PROMO_CODE, ADMIN_GRANT | 订阅来源 |

### 5.3 书籍相关

| 枚举 | 值 | 说明 |
|------|-----|------|
| **BookSource** | STANDARD_EBOOKS, GUTENBERG, INTERNET_ARCHIVE, USER_UPLOAD, CTEXT, WIKISOURCE_ZH, GUTENBERG_ZH, SHUGE | 书籍来源 |
| **BookStatus** | PENDING, PROCESSING, ACTIVE, INACTIVE, ERROR | 书籍状态 |
| **ImportStatus** | PENDING, RUNNING, COMPLETED, FAILED, CANCELLED, ROLLED_BACK | 导入状态 |

---

## 6. 索引策略

### 6.1 核心表索引

```
┌─────────────────────────────────────────────────────────────────┐
│                    索引设计策略                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User 表                                                        │
│  ├── @unique email                唯一索引                      │
│  ├── @unique appleId              唯一索引                      │
│  ├── @unique googleId             唯一索引                      │
│  ├── @unique newAccountId         唯一索引                      │
│  ├── @index deviceId              设备查询                      │
│  ├── @index accountType           账号类型筛选                  │
│  └── @index status                账号状态筛选                  │
│                                                                  │
│  Book 表                                                        │
│  ├── @unique [source, sourceId]   来源唯一约束                  │
│  ├── @index status                状态筛选                      │
│  ├── @index difficultyScore       难度排序                      │
│  ├── @index authorId              作者关联查询                  │
│  └── @index importBatchId         导入批次查询                  │
│                                                                  │
│  UserBook 表                                                    │
│  ├── @unique [userId, bookId]     用户-书籍唯一约束            │
│  └── @index [userId, status]      用户书架查询                  │
│                                                                  │
│  ReadingSession 表                                              │
│  └── @index [userId, startedAt]   用户阅读历史                  │
│                                                                  │
│  UserVocabulary 表                                              │
│  ├── @unique [userId, wordId]     用户-单词唯一约束            │
│  ├── @index [userId, status]      生词本查询                    │
│  └── @index [userId, nextReviewAt] 复习计划查询                 │
│                                                                  │
│  BookScore 表                                                   │
│  ├── @index [finalScore DESC]     最终评分排序                  │
│  ├── @index [qualityScore DESC]   质量分排序                    │
│  └── @index [popularityScore DESC] 热度排序                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 数据安全

### 7.1 敏感数据处理

| 数据类型 | 处理方式 | 说明 |
|----------|----------|------|
| 用户邮箱 | 加密存储 | AES-256 加密 |
| Apple ID | 哈希存储 | 单向哈希 |
| 设备 Token | 加密存储 | 推送通知用 |
| 支付信息 | 外部存储 | Apple/Google 托管 |

### 7.2 数据同步与匿名化

```mermaid
graph TB
    A["Production Database"] --> B["Data Export<br>(pg_dump)"]
    B --> C["Anonymizer Script<br>email → hash<br>displayName → fake<br>appleId → hash<br>deviceId → hash<br>排除订阅/支付表"]
    C --> D["Staging DB<br>(完整同步)"]
    C --> E["Debug DB<br>(部分同步)"]
```

---

## 8. 备份策略

### 8.1 Neon 自动备份

| 备份类型 | 频率 | 保留期 | 说明 |
|----------|------|--------|------|
| 时间点恢复 | 持续 | 7天 | 任意时间点恢复 |
| 每日快照 | 每日 | 30天 | 完整数据快照 |
| 分支备份 | 按需 | 无限 | 数据库分支功能 |

### 8.2 灾难恢复

- **RTO (恢复时间目标)**: < 1 小时
- **RPO (恢复点目标)**: < 5 分钟
- **跨区域复制**: 新加坡 → 东京 (规划中)

---

## 9. 连接配置

### 9.1 Prisma 配置

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prisma 连接配置                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DATABASE_URL 格式:                                              │
│  postgresql://{user}:{password}@{host}:{port}/{database}        │
│                                                                  │
│  推荐使用 Pooled 连接:                                          │
│  postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db       │
│                                                                  │
│  Direct 连接 (迁移用):                                          │
│  postgresql://user:pass@ep-xxx.region.neon.tech/db              │
│                                                                  │
│  连接参数:                                                       │
│  ├── sslmode=require        强制 SSL                            │
│  ├── connection_limit=10    连接池大小                          │
│  └── pool_timeout=10        连接超时                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 连接池配置

| 环境 | 连接数 | 超时时间 | 说明 |
|------|--------|----------|------|
| Production | 20 | 10s | 高并发支持 |
| Staging | 10 | 10s | 测试环境 |
| Debug | 5 | 10s | 开发调试 |
| Local | 5 | 30s | 本地开发 |

---

## 10. 性能优化

### 10.1 查询优化策略

```
┌─────────────────────────────────────────────────────────────────┐
│                    查询优化建议                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 使用 select 限制返回字段                                    │
│     prisma.user.findUnique({                                    │
│       where: { id },                                            │
│       select: { id: true, email: true }                         │
│     })                                                          │
│                                                                  │
│  2. 使用 include 而非多次查询                                   │
│     prisma.book.findUnique({                                    │
│       where: { id },                                            │
│       include: { chapters: true }                               │
│     })                                                          │
│                                                                  │
│  3. 批量操作使用 createMany/updateMany                          │
│     prisma.userVocabulary.createMany({                          │
│       data: words,                                              │
│       skipDuplicates: true                                      │
│     })                                                          │
│                                                                  │
│  4. 分页使用 cursor-based                                       │
│     prisma.book.findMany({                                      │
│       take: 20,                                                 │
│       cursor: { id: lastId },                                   │
│       orderBy: { createdAt: 'desc' }                           │
│     })                                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. 相关文档

| 文档 | 说明 |
|------|------|
| [database-design.md](../../03-architecture/api/database-design.md) | 数据库设计详细 SQL |
| [be-environment-overview.md](../deployment/be-environment-overview.md) | 环境隔离总览 |
| [be-environment-configs.md](../deployment/be-environment-configs.md) | 环境配置详情 |
| [cloudflare-r2.md](./cloudflare-r2.md) | R2 存储详解 |

---

*最后更新: 2025-12-31*
