# 用户年度阅读报告功能设计

> 状态：已规划 | 创建日期：2024-12-24 | 版本：v1.0

## 概述

实现一个用户年度阅读报告功能，聚合用户全年阅读数据，生成个性化的年度盘点报告，支持分享。

## 功能模块

### 1. 阅读总览
- 今年阅读的书籍数量和列表
- 总阅读时长、总页数
- 完读率（已完成/已开始）

### 2. 高光时刻
- 阅读时间最长的一天
- 深夜阅读最晚的一天（22:00-05:00）
- 划线/笔记最多的一天
- 城邦评论最多的一天
- 城邦发帖最多的一天
- 客服反馈最多的一天
- 首次付费订阅的一天

### 3. 社交对比
- 阅读时长超过 X% 的用户
- 读书量超过 X% 的用户
- 词汇量超过 X% 的用户

### 4. 行为偏好
- 阅读时段偏好（早起型/夜猫子型/灵活型）
- 阅读类型偏好（最常读的书籍分类）
- AI 使用偏好（最常用的 AI 功能）
- 平均阅读时长
- 偏好阅读日期（周末/工作日）

### 5. 个性化输出
- 个性化称号/徽章
- AI 生成的年度总结文案
- 可分享的报告卡片

---

## 数据库设计

### 新增表

#### 1. AnnualReport（年度报告主表）

```prisma
model AnnualReport {
  id          String       @id @default(uuid()) @db.Uuid
  userId      String       @map("user_id") @db.Uuid
  year        Int          @db.SmallInt
  status      ReportStatus @default(PENDING)
  generatedAt DateTime?    @map("generated_at")

  // JSONB 存储各项数据
  readingOverview Json @map("reading_overview") @db.JsonB
  highlights      Json @db.JsonB
  socialRanking   Json @map("social_ranking") @db.JsonB
  preferences     Json @db.JsonB
  personalization Json @db.JsonB

  shareCardUrl String? @map("share_card_url")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, year])
  @@index([year, status])
  @@map("annual_reports")
}

enum ReportStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
}
```

#### 2. UserRankingSnapshot（排名快照）

```prisma
model UserRankingSnapshot {
  id          String      @id @default(uuid()) @db.Uuid
  year        Int         @db.SmallInt
  rankingType RankingType @map("ranking_type")
  percentiles Json        @db.JsonB  // p10-p99 阈值
  calculatedAt DateTime   @map("calculated_at")
  createdAt    DateTime   @default(now())

  @@unique([year, rankingType])
  @@index([year])
  @@map("user_ranking_snapshots")
}

enum RankingType {
  READING_MINUTES
  BOOKS_READ
  VOCABULARY_COUNT
}
```

#### 3. UserHighlight（划线/笔记）

```prisma
model UserHighlight {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  userBookId   String   @map("user_book_id") @db.Uuid
  selectedText String   @map("selected_text") @db.Text
  note         String?  @db.Text
  color        String?  @db.VarChar(20)
  cfi          String   @db.VarChar(500)
  chapterRef   String?  @map("chapter_ref") @db.VarChar(255)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user     User     @relation(fields: [userId], references: [id])
  userBook UserBook @relation(fields: [userBookId], references: [id])

  @@index([userId, createdAt])
  @@index([userBookId])
  @@map("user_highlights")
}
```

#### 4. ShareLog（分享日志）

```prisma
model ShareLog {
  id          String           @id @default(uuid()) @db.Uuid
  userId      String           @map("user_id") @db.Uuid
  contentType ShareContentType @map("content_type")
  contentId   String           @map("content_id") @db.Uuid
  platform    String           @db.VarChar(50)
  createdAt   DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@map("share_logs")
}

enum ShareContentType {
  POSTCARD
  QUOTE
  BOOK
  AGORA_POST
  ANNUAL_REPORT
}
```

#### 5. AnnualReportShare（年度报告分享页面）

```prisma
model AnnualReportShare {
  id             String    @id @default(uuid()) @db.Uuid
  shareId        String    @unique @map("share_id") @db.VarChar(16)
  annualReportId String    @map("annual_report_id") @db.Uuid
  userId         String    @map("user_id") @db.Uuid
  year           Int       @db.SmallInt

  // 分享页面数据快照
  snapshotData   Json      @map("snapshot_data") @db.JsonB

  // 访问统计
  viewCount      Int       @default(0) @map("view_count")

  isActive       Boolean   @default(true) @map("is_active")
  expiresAt      DateTime? @map("expires_at")
  createdAt      DateTime  @default(now())

  user         User         @relation(fields: [userId], references: [id])
  annualReport AnnualReport @relation(fields: [annualReportId], references: [id])

  @@index([shareId])
  @@index([userId, year])
  @@map("annual_report_shares")
}
```

---

## API 设计

### 端点列表

| 方法 | 路径 | 说明 | 认证 |
|-----|------|-----|------|
| GET | `/api/v1/annual-report/:year` | 获取年度报告（无则触发生成） | 需要 |
| GET | `/api/v1/annual-report/:year/status` | 查询生成状态 | 需要 |
| GET | `/api/v1/annual-report/history` | 获取历史年份列表 | 需要 |
| POST | `/api/v1/annual-report/:year/regenerate` | 触发重新生成 | 需要 |
| POST | `/api/v1/annual-report/:year/share-page` | 生成分享页面 | 需要 |
| POST | `/api/v1/annual-report/:year/share` | 记录分享行为 | 需要 |
| GET | `/share/annual-report/:shareId` | 公开分享页面 | 不需要 |

### 响应结构

```typescript
// 年度报告完整响应
interface AnnualReportDto {
  id: string;
  year: number;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  generatedAt: Date | null;

  readingOverview: {
    totalBooks: number;
    finishedBooks: number;
    totalReadingMinutes: number;
    totalPages: number;
    completionRate: number;
    booksDetail: {
      bookId: string;
      title: string;
      coverUrl: string | null;
      author: string;
      finishedAt: Date | null;
      progressPercent: number;
    }[];
  };

  highlights: {
    longestReadingDay: { date: string; value: number } | null;
    latestReadingNight: { date: string; value: number; context?: string } | null;
    mostNotesDay: { date: string; value: number } | null;
    mostCommentsDay: { date: string; value: number } | null;
    mostAgoraPostsDay: { date: string; value: number } | null;
    mostSupportMessagesDay: { date: string; value: number } | null;
    firstSubscriptionDay: { date: string; planType: string } | null;
  };

  socialRanking: {
    readingTimePercentile: number;
    booksReadPercentile: number;
    vocabularyPercentile: number;
    calculatedAt: Date;
  };

  preferences: {
    readingTimePreference: ReadingTimePreference;
    favoriteGenres: { genre: string; count: number; percentage: number }[];
    aiUsagePreference: { type: string; count: number; percentage: number }[];
    averageSessionLength: number;
    preferredReadingDays: string[];
  };

  personalization: {
    badges: string[];
    title: string;
    summary: string;
    summaryLocalized: Record<string, string>;
  };

  shareCardUrl: string | null;
}

enum ReadingTimePreference {
  EARLY_BIRD = 'EARLY_BIRD',      // 5:00-9:00
  MORNING = 'MORNING',            // 9:00-12:00
  AFTERNOON = 'AFTERNOON',        // 12:00-18:00
  EVENING = 'EVENING',            // 18:00-22:00
  NIGHT_OWL = 'NIGHT_OWL',        // 22:00-5:00
  FLEXIBLE = 'FLEXIBLE',          // 无明显偏好
}

// 状态查询响应
interface ReportStatusDto {
  status: ReportStatus;
  progress?: number;  // 0-100
  estimatedCompletion?: Date;
  error?: string;
}

// 历史年份响应
interface ReportHistoryDto {
  years: {
    year: number;
    status: ReportStatus;
    generatedAt: Date | null;
  }[];
}

// 分享页面响应
interface SharePageDto {
  shareId: string;
  url: string;
}
```

---

## 缓存策略

```
┌─────────────────────────────────────────────────────────────┐
│                      缓存层级设计                            │
├─────────────────────────────────────────────────────────────┤
│ L1: Redis 热数据缓存                                         │
│     Key: annual_report:{userId}:{year}                      │
│     TTL: 24 小时                                            │
│     场景: 已完成报告的快速读取                                │
├─────────────────────────────────────────────────────────────┤
│ L2: PostgreSQL 持久化存储                                    │
│     Table: annual_reports                                   │
│     场景: 报告永久存储，支持历史年份查询                       │
├─────────────────────────────────────────────────────────────┤
│ L3: 排名快照缓存                                             │
│     Key: ranking_snapshot:{year}:{type}                     │
│     TTL: 7 天（每周日凌晨更新）                              │
│     场景: 全局排名百分位计算                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## iOS 客户端架构

### 目录结构

```
ios/Readmigo/Features/AnnualReport/
├── Models/
│   └── AnnualReport.swift
├── Managers/
│   └── AnnualReportManager.swift
├── Views/
│   ├── AnnualReportView.swift           // 主视图
│   ├── AnnualReportEntryCard.swift      // Me 页面入口卡片
│   └── Pages/
│       ├── CoverPageView.swift          // 封面页
│       ├── ReadingOverviewPageView.swift // 阅读总览页
│       ├── HighlightsPageView.swift     // 高光时刻页
│       ├── BooksPageView.swift          // 书籍列表页
│       ├── RankingPageView.swift        // 社交排名页
│       ├── PreferencesPageView.swift    // 行为偏好页
│       └── PersonalizationPageView.swift // 个性化总结页
└── Components/
    ├── StatCard.swift
    ├── HighlightCard.swift
    ├── RankingItem.swift
    └── ShareReportSheet.swift
```

### 入口设计（Me 页面）

```swift
// Me 页面顶部添加年度报告入口卡片
AnnualReportEntryCard
├── 当年报告预览（缩略统计：书籍数、阅读时长、完成率）
├── "查看完整报告" 按钮
└── 历史年份选择器（Picker/Menu）
```

### 交互设计

- TabView 横向滑动切换页面（7页）
- 页面指示器显示当前位置
- 分享按钮生成 Web 分享页面 URL
- 使用 iOS 原生 ShareLink/UIActivityViewController 分享链接
- 支持年份选择器查看历史报告

---

## Web 分享页面

### 技术方案

- 前端：React 单页面（apps/admin 或独立项目）
- 路由：`/share/annual-report/:shareId`
- 数据：从 `AnnualReportShare.snapshotData` 读取
- 部署：与主站同域，便于 SEO

### 特性

- 无需登录即可访问
- 移动端优先设计
- 支持 OG 标签（Open Graph）用于社交媒体预览
- 访问量统计
- 可选过期时间

### OG 标签示例

```html
<meta property="og:title" content="我的2024年度阅读报告" />
<meta property="og:description" content="这一年，我读了30本书，累计阅读120小时..." />
<meta property="og:image" content="https://readmigo.app/og/annual-report/xxx.png" />
<meta property="og:url" content="https://readmigo.app/share/annual-report/xxx" />
```

---

## 实现步骤

### Phase 1: 基础设施

| 任务 | 优先级 | 状态 |
|-----|-------|------|
| 数据库迁移：新增 AnnualReport、UserRankingSnapshot 表 | P0 | 待开发 |
| 后端：创建 annual-report module | P0 | 待开发 |
| 后端：实现基础 API 端点 | P0 | 待开发 |
| 后端：实现数据聚合服务 | P0 | 待开发 |
| Redis 缓存策略 | P1 | 待开发 |

### Phase 2: 核心功能

| 任务 | 优先级 | 状态 |
|-----|-------|------|
| 阅读总览计算 | P0 | 待开发 |
| 高光时刻计算 | P0 | 待开发 |
| 社交排名计算（百分位） | P0 | 待开发 |
| 行为偏好分析 | P1 | 待开发 |
| 个性化标签生成 | P1 | 待开发 |
| Bull Queue 异步生成 | P1 | 待开发 |

### Phase 3: iOS 客户端

| 任务 | 优先级 | 状态 |
|-----|-------|------|
| 数据模型 + Manager | P0 | 待开发 |
| 主视图框架 + 页面导航 | P0 | 待开发 |
| 封面页 + 阅读总览页 | P0 | 待开发 |
| 高光时刻页 | P1 | 待开发 |
| 社交排名页 | P1 | 待开发 |
| 行为偏好页 | P1 | 待开发 |
| 个性化总结页 | P1 | 待开发 |
| Me 页面入口卡片 | P0 | 待开发 |
| 历史年份选择器 | P1 | 待开发 |

### Phase 4: Web 分享页面

| 任务 | 优先级 | 状态 |
|-----|-------|------|
| Web 分享页面路由 + 组件 | P1 | 待开发 |
| OG 标签（社交预览卡片） | P1 | 待开发 |
| 移动端适配 | P1 | 待开发 |
| 访问统计 | P2 | 待开发 |

### Phase 5: 增强功能

| 任务 | 优先级 | 状态 |
|-----|-------|------|
| 新增 UserHighlight 表 | P2 | 待开发 |
| 新增 ShareLog 表 | P2 | 待开发 |
| 国际化支持 | P2 | 待开发 |
| 报告预生成定时任务（12月20日开始） | P3 | 待开发 |

---

## 技术决策说明

### 1. JSONB 存储报告数据

**选择原因**：
- 报告结构可能随版本迭代变化，JSONB 允许向后兼容
- 单次查询获取完整报告，避免多表 JOIN
- PostgreSQL JSONB 支持索引和复杂查询

### 2. Bull Queue 异步生成

**选择原因**：
- 报告生成涉及大量聚合计算，可能耗时较长
- 自动处理生成失败的情况（重试机制）
- 支持前端显示生成进度

### 3. 百分位排名而非具体排名

**选择原因**：
- 保护用户隐私，只展示"超过 X% 的用户"
- 不提供排行榜功能，避免隐私泄露
- 更友好的用户体验

### 4. 分享页面数据快照

**选择原因**：
- 分享链接永久有效，即使原报告删除或更新
- 避免分享链接依赖用户登录状态
- 便于访问统计和分析

---

## 个性化标签/称号设计

### 基于阅读量

| 条件 | 徽章 | 称号 |
|-----|------|------|
| 阅读 >= 50 本 | READING_CHAMPION | 阅读冠军 |
| 阅读 >= 30 本 | BOOK_LOVER | 书籍爱好者 |
| 阅读 >= 10 本 | EAGER_READER | 热心读者 |
| 阅读 < 10 本 | READING_STARTER | 阅读新手 |

### 基于时间偏好

| 条件 | 徽章 | 称号 |
|-----|------|------|
| 主要 22:00-05:00 阅读 | NIGHT_OWL | 深夜书虫 |
| 主要 05:00-09:00 阅读 | EARLY_BIRD | 晨读达人 |
| 阅读时间均匀分布 | TIME_FLEXIBLE | 随时阅读者 |

### 基于完成率

| 条件 | 徽章 |
|-----|------|
| 完成率 >= 80% | PERFECTIONIST |
| 完成率 >= 50% | STEADY_READER |

### 基于 AI 使用

| 条件 | 徽章 |
|-----|------|
| AI 交互 >= 100 次 | AI_EXPLORER |
| 使用过所有 AI 功能 | AI_MASTER |

---

## 已确认事项

1. **入口位置**：Me 页面顶部，添加年度报告入口卡片
2. **历史报告**：支持查看往年年度报告
3. **分享方式**：
   - 生成 Web 页面，分享时分享页面 URL
   - 支持 iOS 原生分享组件
   - Web 页面可被任何人访问（无需登录）

## 待确认事项

1. **划线/笔记功能**：当前系统是否已有类似功能？如无需新增 UserHighlight 表
2. **推送策略**：是否需要在报告生成后推送通知用户？
