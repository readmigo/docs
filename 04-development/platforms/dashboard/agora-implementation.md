# Agora Dashboard 实现规格

> 本文档是 `agora-design.md` 的技术实现补充，包含具体的 API 设计、数据结构和代码示例。

## 一、现状分析

### 已有数据库表

| 表名 | 说明 |
|------|------|
| `agora_posts` | 帖子（作者帖/用户帖）|
| `agora_comments` | 评论 |
| `agora_post_likes` | 帖子点赞 |
| `agora_comment_likes` | 评论点赞 |
| `agora_blocks` | 用户屏蔽 |
| `agora_reports` | 举报 |
| `agora_post_media` | 媒体附件 |

### 已有 Admin API

| 端点 | 说明 |
|------|------|
| `GET /admin/agora/stats` | 基础统计 |
| `POST /admin/agora/seed` | 种子数据 |
| `POST /admin/agora/cache/rebuild` | 重建缓存 |

### 需新建数据库表

| 表名 | 说明 |
|------|------|
| `agora_author_configs` | 作者配置 |
| `agora_settings` | 全局设置 |

---

## 二、Backend API 设计

### 2.1 帖子管理

#### GET /admin/agora/posts

**Query Parameters:**

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 (默认 1) |
| perPage | number | 每页数量 (默认 25) |
| sort | string | 排序字段 |
| order | 'ASC'/'DESC' | 排序方向 |
| filter | object | 筛选条件 |

**Filter 参数:**

```typescript
interface PostFilter {
  authorId?: string;
  postType?: 'AUTHOR' | 'USER';
  isActive?: boolean;
  dateFrom?: string;  // ISO date
  dateTo?: string;
  minLikes?: number;
  search?: string;
}
```

**Response:**

```typescript
{
  data: AgoraPost[];
  total: number;
  page: number;
  perPage: number;
}
```

#### GET /admin/agora/posts/:id

**Response:** 完整帖子详情 + 评论列表 + 统计

#### POST /admin/agora/posts

**Body:**

```typescript
{
  authorId: string;
  quoteId: string;
  simulatedPostTime?: string;  // ISO date, 默认当前时间
}
```

#### PATCH /admin/agora/posts/:id

**Body:**

```typescript
{
  isActive?: boolean;
  isFeatured?: boolean;
}
```

#### DELETE /admin/agora/posts/:id

软删除，设置 `isActive = false`

#### POST /admin/agora/posts/generate

**Body:**

```typescript
{
  authorIds: string[];  // 作者 ID 列表
  count: number;        // 每个作者生成数量
  dateFrom?: string;    // 日期范围开始
  dateTo?: string;      // 日期范围结束
}
```

---

### 2.2 评论管理

#### GET /admin/agora/comments

**Filter 参数:**

```typescript
{
  postId?: string;
  userId?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
```

#### PATCH /admin/agora/comments/:id

**Body:**

```typescript
{
  isActive: boolean;
}
```

#### DELETE /admin/agora/comments/:id

---

### 2.3 举报管理

#### GET /admin/agora/reports

**Filter 参数:**

```typescript
{
  status?: 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  reason?: string;
}
```

默认按 `PENDING` 优先排序

#### PATCH /admin/agora/reports/:id

**Body:**

```typescript
{
  status: 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  resolution?: string;  // 处理说明
}
```

#### POST /admin/agora/reports/:id/action

**Body:**

```typescript
{
  action: 'HIDE_POST' | 'DELETE_POST' | 'DISMISS';
  notes?: string;
}
```

---

### 2.4 作者配置

#### GET /admin/agora/author-configs

返回所有作者的 Agora 配置（含未配置的作者）

#### PATCH /admin/agora/author-configs/:authorId

**Body:**

```typescript
{
  isEnabled?: boolean;
  postFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  isFeatured?: boolean;
}
```

---

### 2.5 数据分析

#### GET /admin/agora/analytics/overview

**Response:**

```typescript
{
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  postsToday: number;
  pendingReports: number;
  trends: {
    posts: { value: number; change: number };  // 7天环比
    engagement: { value: number; change: number };
  };
}
```

#### GET /admin/agora/analytics/posts

**Query:** `?limit=10&sort=likeCount`

**Response:** 热门帖子列表

#### GET /admin/agora/analytics/trends

**Query:** `?days=30`

**Response:**

```typescript
{
  dates: string[];
  posts: number[];
  likes: number[];
  comments: number[];
}
```

---

### 2.6 设置

#### GET /admin/agora/settings

**Response:**

```typescript
{
  agoraEnabled: boolean;
  dailyPostLimit: number;
  commentApproval: boolean;
  autoFlagKeywords: string[];
}
```

#### PATCH /admin/agora/settings

**Body:** 同上，部分更新

---

## 三、数据库迁移

### AgoraAuthorConfig

```prisma
model AgoraAuthorConfig {
  id            String    @id @default(uuid()) @db.Uuid
  authorId      String    @unique @map("author_id") @db.Uuid
  author        Author    @relation(fields: [authorId], references: [id], onDelete: Cascade)

  isEnabled     Boolean   @default(true) @map("is_enabled")
  postFrequency String    @default("DAILY") @map("post_frequency")
  isFeatured    Boolean   @default(false) @map("is_featured")
  lastPostAt    DateTime? @map("last_post_at")

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("agora_author_configs")
}
```

### AgoraSettings

```prisma
model AgoraSettings {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique @db.VarChar(100)
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("agora_settings")
}
```

---

## 四、Dashboard 文件结构

```
apps/dashboard/src/pages/agora/
├── index.tsx                    # 导出
├── PostList.tsx                 # 帖子列表
├── PostShow.tsx                 # 帖子详情
├── PostCreate.tsx               # 创建帖子
├── PostEdit.tsx                 # 编辑帖子
├── CommentList.tsx              # 评论列表
├── ReportList.tsx               # 举报队列
├── AuthorConfigList.tsx         # 作者配置
├── AnalyticsPage.tsx            # 数据分析
├── SettingsPage.tsx             # 设置
└── components/
    ├── PostStatusChip.tsx       # 状态标签
    ├── EngagementStats.tsx      # 互动统计
    ├── ModerationActions.tsx    # 审核按钮
    ├── EngagementChart.tsx      # 趋势图
    └── MetricCard.tsx           # KPI 卡片
```

---

## 五、Backend 文件结构

```
apps/backend/src/modules/admin/agora/
├── agora-admin.module.ts
├── agora-admin.controller.ts
├── agora-admin.service.ts
└── dto/
    ├── index.ts
    ├── post-query.dto.ts
    ├── create-post.dto.ts
    ├── update-post.dto.ts
    ├── generate-posts.dto.ts
    ├── comment-query.dto.ts
    ├── report-action.dto.ts
    ├── author-config.dto.ts
    └── settings.dto.ts
```

---

## 六、App.tsx 注册

```tsx
import { PostList, PostShow, PostCreate, PostEdit } from './pages/agora';
import { CommentList } from './pages/agora';
import { ReportList } from './pages/agora';
import { AuthorConfigList } from './pages/agora';
import { AnalyticsPage, SettingsPage } from './pages/agora';

// Resources
<Resource
  name="agora/posts"
  list={PostList}
  show={PostShow}
  create={PostCreate}
  edit={PostEdit}
  icon={ForumIcon}
/>
<Resource name="agora/comments" list={CommentList} icon={CommentIcon} />
<Resource name="agora/reports" list={ReportList} icon={FlagIcon} />
<Resource name="agora/author-configs" list={AuthorConfigList} icon={PersonIcon} />

// Custom Routes
<CustomRoutes>
  <Route path="/agora/analytics" element={<AnalyticsPage />} />
  <Route path="/agora/settings" element={<SettingsPage />} />
</CustomRoutes>
```

---

## 七、i18n 翻译键

### en.ts

```typescript
agora: {
  posts: {
    name: 'Agora Post |||| Agora Posts',
    fields: {
      postType: 'Type',
      author: 'Author',
      quote: 'Quote',
      likeCount: 'Likes',
      commentCount: 'Comments',
      shareCount: 'Shares',
      isActive: 'Active',
      simulatedPostTime: 'Post Time',
    },
    filters: {
      postType: 'Post Type',
      dateRange: 'Date Range',
      minLikes: 'Min Likes',
    },
    actions: {
      hide: 'Hide',
      feature: 'Feature',
      generate: 'Generate Posts',
    },
  },
  comments: {
    name: 'Comment |||| Comments',
    fields: {
      content: 'Content',
      user: 'User',
      post: 'Post',
      isActive: 'Active',
      createdAt: 'Created At',
    },
  },
  reports: {
    name: 'Report |||| Reports',
    fields: {
      reason: 'Reason',
      status: 'Status',
      reporter: 'Reporter',
      createdAt: 'Reported At',
    },
    status: {
      pending: 'Pending',
      reviewed: 'Reviewed',
      actioned: 'Actioned',
      dismissed: 'Dismissed',
    },
    reasons: {
      inappropriate: 'Inappropriate',
      spam: 'Spam',
      wrongAttribution: 'Wrong Attribution',
      other: 'Other',
    },
  },
  authorConfigs: {
    name: 'Author Config |||| Author Configs',
    fields: {
      author: 'Author',
      isEnabled: 'Enabled',
      postFrequency: 'Frequency',
      isFeatured: 'Featured',
      lastPostAt: 'Last Post',
    },
    frequency: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
  },
  analytics: {
    name: 'Analytics',
    overview: 'Overview',
    totalPosts: 'Total Posts',
    totalComments: 'Total Comments',
    totalLikes: 'Total Likes',
    postsToday: 'Posts Today',
    pendingReports: 'Pending Reports',
    topPosts: 'Top Posts',
    trends: 'Trends',
  },
  settings: {
    name: 'Settings',
    agoraEnabled: 'Agora Enabled',
    dailyPostLimit: 'Daily Post Limit',
    commentApproval: 'Require Comment Approval',
    autoFlagKeywords: 'Auto-flag Keywords',
  },
}
```

### zh-Hans.ts

```typescript
agora: {
  posts: {
    name: '城邦帖子',
    fields: {
      postType: '类型',
      author: '作者',
      quote: '引用',
      likeCount: '点赞',
      commentCount: '评论',
      shareCount: '分享',
      isActive: '启用',
      simulatedPostTime: '发布时间',
    },
    filters: {
      postType: '帖子类型',
      dateRange: '日期范围',
      minLikes: '最少点赞',
    },
    actions: {
      hide: '隐藏',
      feature: '精选',
      generate: '生成帖子',
    },
  },
  comments: {
    name: '评论',
    fields: {
      content: '内容',
      user: '用户',
      post: '帖子',
      isActive: '启用',
      createdAt: '创建时间',
    },
  },
  reports: {
    name: '举报',
    fields: {
      reason: '原因',
      status: '状态',
      reporter: '举报人',
      createdAt: '举报时间',
    },
    status: {
      pending: '待处理',
      reviewed: '已审核',
      actioned: '已处理',
      dismissed: '已驳回',
    },
    reasons: {
      inappropriate: '不当内容',
      spam: '垃圾信息',
      wrongAttribution: '错误归属',
      other: '其他',
    },
  },
  authorConfigs: {
    name: '作者配置',
    fields: {
      author: '作者',
      isEnabled: '启用',
      postFrequency: '发帖频率',
      isFeatured: '精选',
      lastPostAt: '最后发帖',
    },
    frequency: {
      daily: '每日',
      weekly: '每周',
      monthly: '每月',
    },
  },
  analytics: {
    name: '数据分析',
    overview: '概览',
    totalPosts: '总帖子数',
    totalComments: '总评论数',
    totalLikes: '总点赞数',
    postsToday: '今日帖子',
    pendingReports: '待处理举报',
    topPosts: '热门帖子',
    trends: '趋势',
  },
  settings: {
    name: '设置',
    agoraEnabled: '启用城邦',
    dailyPostLimit: '每日帖子上限',
    commentApproval: '评论需审核',
    autoFlagKeywords: '自动标记关键词',
  },
}
```

---

## 八、实现阶段

| Phase | 内容 | 预计文件数 |
|-------|------|-----------|
| 1 | 帖子 CRUD | BE: 5, Dashboard: 5 |
| 2 | 评论 + 举报 | BE: 2, Dashboard: 3 |
| 3 | 作者配置 | DB: 1, BE: 1, Dashboard: 1 |
| 4 | 数据分析 | BE: 1, Dashboard: 4 |
| 5 | 设置 | DB: 1, BE: 1, Dashboard: 2 |

---

## 九、参考文件

| 用途 | 路径 |
|------|------|
| Admin API 模式 | `apps/backend/src/modules/admin/admin.controller.ts` |
| 现有 Agora 服务 | `apps/backend/src/modules/agora/agora.service.ts` |
| Dashboard 页面模式 | `apps/dashboard/src/pages/quotes/index.tsx` |
| 数据库 Schema | `packages/database/prisma/schema.prisma` |
