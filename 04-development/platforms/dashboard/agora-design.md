# 城邦 (Agora) Dashboard Management Design

## Overview

城邦 (Agora) is Readmigo's social reading community where classic literary authors "share" quotes and wisdom. This document details the dashboard management system for Agora.

---

## Current State Analysis

### Existing Features (iOS Client)

**Location:** `ios/Readmigo/Features/Agora/`

1. **Social Feed**
   - Infinite scrolling posts from simulated authors
   - Each post contains: author info, quote, engagement metrics

2. **User Interactions**
   - Like/unlike posts
   - Comment with replies
   - Share posts
   - Block authors
   - Hide individual posts

3. **Data Model**
   ```swift
   struct AgoraPost {
       let id: String
       let author: Author
       let quote: Quote
       let simulatedPostTime: Date
       var likeCount: Int
       var commentCount: Int
       var shareCount: Int
       var isLiked: Bool
       var isBookmarked: Bool
       var comments: [Comment]?
   }
   ```

### Existing Backend

**Location:** `apps/backend/src/modules/agora/`

- `agora.service.ts`: Post fetching, commenting, liking, blocking
- `agora.controller.ts`: API endpoints
- Posts are generated from quotes + author data

---

## Dashboard Requirements

### 1. Post Management

#### 1.1 Post List View

**Features:**
- List all Agora posts with pagination
- Show post content, author, engagement metrics
- Filter by:
  - Author
  - Date range
  - Engagement level (high/medium/low)
  - Status (active/hidden/flagged)
- Sort by:
  - Date (newest/oldest)
  - Likes
  - Comments
  - Total engagement

**Columns:**
| Column | Description |
|--------|-------------|
| ID | Post identifier |
| Author | Author name with avatar |
| Quote Preview | First 100 chars of quote |
| Source | Book/work source |
| Likes | Like count |
| Comments | Comment count |
| Shares | Share count |
| Status | Active/Hidden/Flagged |
| Created | Post creation date |
| Actions | View/Edit/Hide/Delete |

#### 1.2 Post Detail View

**Features:**
- Full quote text with formatting
- Author information
- Source book/work link
- Engagement metrics with charts
- Comment list with moderation actions
- Post history (edits, status changes)

#### 1.3 Post Creation

**Manual Post Generation:**
- Select author from dropdown
- Select quote from author's quotes (or create new)
- Set post date (can be past/future for scheduling)
- Preview before publishing

**Bulk Generation:**
- Generate multiple posts from selected authors
- Auto-distribute post times
- Preview batch before publishing

### 2. Content Moderation

#### 2.1 Moderation Queue

**Features:**
- View flagged/reported content
- User reports with reasons
- Quick action buttons (approve/reject/hide)
- Ban user option for repeat offenders

**Report Reasons:**
- Inappropriate content
- Spam
- Incorrect attribution
- Other (with text)

#### 2.2 Comment Moderation

**Features:**
- List all comments with filters
- Bulk approve/reject
- Auto-flag keywords (configurable)
- User ban management

#### 2.3 Blocked Content Management

**Features:**
- View globally blocked authors
- View hidden posts
- Restore hidden content
- User block patterns analysis

### 3. Author Configuration

#### 3.1 Posting Authors

Not all authors should "post" in Agora. Configure which authors participate.

**Settings per Author:**
- Enable/disable Agora posting
- Post frequency (daily/weekly/monthly)
- Quote selection criteria
- Featured status (always show at top)

#### 3.2 Author Simulation Settings

- Posting style/tone guidelines
- Engagement simulation parameters
- Response time to comments (simulated)

### 4. Analytics Dashboard

#### 4.1 Overview Metrics

**Key Metrics:**
- Daily Active Users (DAU) in Agora
- Total posts viewed
- Total interactions (likes + comments + shares)
- User retention rate
- Average session duration

**Charts:**
- Daily/weekly/monthly engagement trends
- Interaction breakdown (pie chart)
- Peak usage times (heatmap)

#### 4.2 Post Analytics

**Per-Post Metrics:**
- View count
- Engagement rate
- Comment sentiment analysis
- Share destinations

**Aggregated Insights:**
- Most engaging posts
- Best performing authors
- Optimal posting times
- Quote length vs engagement correlation

#### 4.3 User Analytics

**Metrics:**
- Most active users
- Comment quality scores
- Block patterns
- User journey through Agora

### 5. Configuration Settings

#### 5.1 Feature Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Agora Enabled | Master toggle for Agora feature | true |
| Daily Post Limit | Max new posts per day | 10 |
| Comment Approval | Require approval for comments | false |
| Auto-Flag Keywords | Keywords triggering auto-moderation | [] |
| Min Quote Length | Minimum quote length for posts | 50 |
| Max Quote Length | Maximum quote length for posts | 500 |

#### 5.2 Engagement Simulation

| Setting | Description | Default |
|---------|-------------|---------|
| Base Likes | Minimum likes for new posts | 10 |
| Like Variance | Random variance for likes | 0.3 |
| Comment Rate | Probability of simulated comments | 0.1 |
| Share Rate | Probability of simulated shares | 0.05 |

#### 5.3 Content Guidelines

- Prohibited content list
- Required attributions
- Language requirements
- Formatting rules

---

## Database Schema Changes

### New Tables

```prisma
model AgoraPost {
  id              String   @id @default(cuid())
  authorId        String
  quoteId         String
  content         String   // Full quote text
  sourceText      String?  // Book/work title

  status          AgoraPostStatus @default(ACTIVE)
  scheduledAt     DateTime?       // For scheduled posts
  publishedAt     DateTime @default(now())

  likeCount       Int      @default(0)
  commentCount    Int      @default(0)
  shareCount      Int      @default(0)
  viewCount       Int      @default(0)

  isFeatured      Boolean  @default(false)
  featuredUntil   DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  author          Author   @relation(fields: [authorId], references: [id])
  quote           Quote    @relation(fields: [quoteId], references: [id])
  comments        AgoraComment[]
  likes           AgoraLike[]
  reports         AgoraReport[]
}

enum AgoraPostStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  HIDDEN
  FLAGGED
  DELETED
}

model AgoraComment {
  id          String   @id @default(cuid())
  postId      String
  userId      String
  parentId    String?  // For replies
  content     String

  status      CommentStatus @default(ACTIVE)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  post        AgoraPost     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id])
  parent      AgoraComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies     AgoraComment[] @relation("CommentReplies")
}

enum CommentStatus {
  ACTIVE
  HIDDEN
  FLAGGED
  DELETED
}

model AgoraLike {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post      AgoraPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id])

  @@unique([postId, userId])
}

model AgoraReport {
  id          String   @id @default(cuid())
  postId      String?
  commentId   String?
  reporterId  String
  reason      ReportReason
  description String?

  status      ReportStatus @default(PENDING)
  resolvedBy  String?
  resolvedAt  DateTime?
  resolution  String?

  createdAt   DateTime @default(now())

  post        AgoraPost? @relation(fields: [postId], references: [id])
  reporter    User       @relation(fields: [reporterId], references: [id])
}

enum ReportReason {
  INAPPROPRIATE
  SPAM
  WRONG_ATTRIBUTION
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}

model AgoraSettings {
  id                  String   @id @default(cuid())
  key                 String   @unique
  value               Json
  updatedAt           DateTime @updatedAt
}

model AgoraAuthorConfig {
  id              String   @id @default(cuid())
  authorId        String   @unique
  isEnabled       Boolean  @default(true)
  postFrequency   String   @default("DAILY") // DAILY, WEEKLY, MONTHLY
  isFeatured      Boolean  @default(false)
  lastPostAt      DateTime?

  author          Author   @relation(fields: [authorId], references: [id])
}
```

---

## Backend API Endpoints

### Admin Endpoints (Dashboard)

```typescript
// Posts
GET    /admin/agora/posts          // List all posts with filters
GET    /admin/agora/posts/:id      // Get post details
POST   /admin/agora/posts          // Create new post
PATCH  /admin/agora/posts/:id      // Update post
DELETE /admin/agora/posts/:id      // Delete post
POST   /admin/agora/posts/generate // Bulk generate posts

// Comments
GET    /admin/agora/comments       // List all comments
PATCH  /admin/agora/comments/:id   // Update comment status
DELETE /admin/agora/comments/:id   // Delete comment

// Moderation
GET    /admin/agora/reports        // List reports
PATCH  /admin/agora/reports/:id    // Resolve report

// Analytics
GET    /admin/agora/analytics/overview    // Overview metrics
GET    /admin/agora/analytics/posts       // Post analytics
GET    /admin/agora/analytics/users       // User analytics
GET    /admin/agora/analytics/trends      // Trend data

// Settings
GET    /admin/agora/settings       // Get all settings
PATCH  /admin/agora/settings       // Update settings

// Author Config
GET    /admin/agora/authors        // List author configs
PATCH  /admin/agora/authors/:id    // Update author config
```

---

## Dashboard UI Components

### File Structure

```
apps/dashboard/src/pages/agora/
├── index.tsx                 # Agora dashboard home
├── PostList.tsx              # Post list view
├── PostShow.tsx              # Post detail view
├── PostCreate.tsx            # Create post form
├── PostEdit.tsx              # Edit post form
├── CommentList.tsx           # Comment management
├── ReportList.tsx            # Moderation queue
├── AuthorConfigList.tsx      # Author posting config
├── SettingsPage.tsx          # Agora settings
├── AnalyticsPage.tsx         # Analytics dashboard
└── components/
    ├── PostCard.tsx          # Post preview card
    ├── EngagementChart.tsx   # Engagement metrics chart
    ├── ModerationActions.tsx # Quick moderation buttons
    └── PostGenerator.tsx     # Bulk post generator
```

### i18n Translations

```typescript
// apps/dashboard/src/i18n/en.ts
agora: {
  name: 'Agora |||| Agora',
  posts: {
    name: 'Post |||| Posts',
    fields: {
      author: 'Author',
      content: 'Content',
      source: 'Source',
      likes: 'Likes',
      comments: 'Comments',
      shares: 'Shares',
      status: 'Status',
      publishedAt: 'Published',
    },
    status: {
      draft: 'Draft',
      scheduled: 'Scheduled',
      active: 'Active',
      hidden: 'Hidden',
      flagged: 'Flagged',
    },
    actions: {
      generate: 'Generate Posts',
      hide: 'Hide Post',
      feature: 'Feature Post',
    },
  },
  comments: {
    name: 'Comment |||| Comments',
    // ...
  },
  reports: {
    name: 'Report |||| Reports',
    // ...
  },
  settings: {
    name: 'Settings',
    // ...
  },
  analytics: {
    name: 'Analytics',
    // ...
  },
}

// apps/dashboard/src/i18n/zh-Hans.ts
agora: {
  name: '城邦',
  posts: {
    name: '帖子',
    fields: {
      author: '作者',
      content: '内容',
      source: '来源',
      likes: '点赞',
      comments: '评论',
      shares: '分享',
      status: '状态',
      publishedAt: '发布时间',
    },
    status: {
      draft: '草稿',
      scheduled: '已排期',
      active: '已发布',
      hidden: '已隐藏',
      flagged: '已标记',
    },
    actions: {
      generate: '生成帖子',
      hide: '隐藏帖子',
      feature: '置顶帖子',
    },
  },
  // ...
}
```

---

## Implementation Phases

### Phase 1: Core Post Management
1. Database schema migration
2. Backend CRUD endpoints for posts
3. Dashboard PostList and PostShow views
4. Basic post creation

### Phase 2: Comment & Moderation
1. Comment management endpoints
2. Report system implementation
3. Dashboard moderation views
4. Auto-flagging system

### Phase 3: Author Configuration
1. Author config model and endpoints
2. Dashboard author config views
3. Post scheduling system
4. Bulk post generation

### Phase 4: Analytics
1. Analytics data aggregation
2. Dashboard analytics views
3. Charts and visualizations
4. Export functionality

### Phase 5: Advanced Features
1. Engagement simulation tuning
2. AI-powered content suggestions
3. A/B testing framework
4. Performance optimization

---

## Security Considerations

1. **Admin Authentication**: All admin endpoints require admin role
2. **Rate Limiting**: Prevent bulk operations abuse
3. **Audit Logging**: Track all admin actions
4. **Content Validation**: Sanitize all user inputs
5. **Permission Levels**: Different access for different admin roles

---

## Success Metrics

1. **Efficiency**: Time to moderate content reduced by 50%
2. **Engagement**: User engagement in Agora increased by 20%
3. **Quality**: Reported content reduced by 30%
4. **Admin Satisfaction**: Dashboard usability score > 4/5
