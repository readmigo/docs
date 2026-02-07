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

#### GET /admin/agora/posts/:id

**Response:** 完整帖子详情 + 评论列表 + 统计

#### DELETE /admin/agora/posts/:id

软删除，设置 `isActive = false`

#### POST /admin/agora/posts/generate

---

### 2.3 举报管理

#### GET /admin/agora/reports

**Filter 参数:**

默认按 `PENDING` 优先排序

#### POST /admin/agora/reports/:id/action

---

### 2.4 作者配置

#### GET /admin/agora/author-configs

返回所有作者的 Agora 配置（含未配置的作者）

#### PATCH /admin/agora/author-configs/:authorId

---

### 2.5 数据分析

#### GET /admin/agora/analytics/posts

**Query:** `?limit=10&sort=likeCount`

**Response:** 热门帖子列表

#### GET /admin/agora/analytics/trends

**Query:** `?days=30`

---

### 2.6 设置

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

---

## 七、i18n 翻译键

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
