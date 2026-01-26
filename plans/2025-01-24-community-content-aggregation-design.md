# 资讯聚合社区设计文档

## 概述

为 Readmigo Web 端新增资讯聚合社区功能，融合内容浏览与英语学习，提供全球化、无版权风险的资讯服务。

## 功能定位

- **内容浏览**：获取科技、商业、文化、文学资讯
- **英语学习**：生词标注、阅读历史追踪
- **社区功能**：关注/订阅、分享

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    资讯社区 - 整体架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  内容采集层   │ →  │  内容处理层   │ →  │  内容展示层   │      │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤      │
│  │ • RSS抓取    │    │ • 版权分级    │    │ • 分类浏览    │      │
│  │ • API调用    │    │ • AI摘要生成  │    │ • 订阅Feed   │      │
│  │ • 用户投稿    │    │ • 难度评估    │    │ • 阅读器     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │  学习功能层   │    │  社区功能层   │                          │
│  ├──────────────┤    ├──────────────┤                          │
│  │ • 生词标注    │    │ • 关注/订阅   │                          │
│  │ • 阅读历史    │    │ • 分享        │                          │
│  └──────────────┘    └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 内容源规划

### 分类

| 分类 | 说明 |
|------|------|
| 科技 | AI、编程、产品、创业 |
| 商业 | 财经、商业分析 |
| 文化 | 深度文章、社会文化 |
| 文学 | 短篇、散文、经典文学 |

### 内容源

| 分类 | 内容源 | 协议 | 展示方式 |
|------|--------|------|----------|
| 科技 | Hacker News API | 公开链接 | 摘要+跳转 |
| 科技 | arXiv | CC协议 | 全文+学习功能 |
| 科技 | Dev.to RSS | CC协议 | 全文+学习功能 |
| 商业 | Reuters RSS | 需跳转 | 摘要+跳转 |
| 文化 | Wikipedia Featured | CC协议 | 全文+学习功能 |
| 文化 | BBC Learning English | 教育用途 | 摘要+跳转 |
| 文学 | Project Gutenberg | 公共领域 | 全文+学习功能 |
| 文学 | Standard Ebooks | 公共领域 | 全文+学习功能 |

### 版权处理

```
内容进入 → 检查来源协议
           ├─ CC/公共领域 → 存储全文 → 支持站内阅读+学习功能
           └─ 其他协议 → 仅存标题+AI摘要+原文链接 → 跳转阅读
```

## 数据模型

### ContentSource（内容源）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | String | 源名称 |
| type | Enum | rss / api / user_submit |
| url | String | 源地址 |
| category | Enum | tech / business / culture / literature |
| license | Enum | cc / public_domain / educational / redirect_only |
| fetchInterval | Int | 抓取间隔(分钟) |
| isActive | Boolean | 是否启用 |

### Article（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| sourceId | UUID | 外键，关联ContentSource |
| title | String | 标题 |
| summary | String | 摘要(AI生成或原文截取) |
| content | Text | 全文(仅CC/公共领域) |
| originalUrl | String | 原文链接 |
| imageUrl | String | 封面图 |
| license | Enum | 版权协议 |
| category | Enum | 分类 |
| publishedAt | DateTime | 发布时间 |
| createdAt | DateTime | 入库时间 |

### Subscription（订阅）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 外键，关联User |
| targetType | Enum | source / category / topic |
| targetId | String | 订阅目标ID |
| createdAt | DateTime | 订阅时间 |

### ReadingHistory（阅读历史）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 外键，关联User |
| articleId | UUID | 外键，关联Article |
| progress | Int | 阅读进度(0-100) |
| lastReadAt | DateTime | 最后阅读时间 |
| createdAt | DateTime | 首次阅读时间 |

## 页面设计

### 路由规划

| 路由 | 页面 | 说明 |
|------|------|------|
| /community | 社区首页 | 推荐流、分类入口 |
| /community/tech | 科技分类 | 科技文章列表 |
| /community/business | 商业分类 | 商业文章列表 |
| /community/culture | 文化分类 | 文化文章列表 |
| /community/literature | 文学分类 | 文学文章列表 |
| /community/article/[id] | 文章详情 | 阅读页面 |
| /community/subscriptions | 我的订阅 | 订阅管理 |
| /community/history | 阅读历史 | 历史记录 |

### 页面组件

```
社区首页
├── Header (分类Tab: 全部/科技/商业/文化/文学)
├── ArticleList
│   └── ArticleCard
│       ├── 封面图
│       ├── 标题
│       ├── 摘要
│       ├── 来源 + 时间
│       └── 订阅/分享按钮
└── Sidebar (可选)
    ├── 热门话题
    └── 推荐订阅

文章详情页
├── ArticleHeader
│   ├── 标题
│   ├── 来源 + 时间
│   └── 分享按钮
├── ArticleContent (支持生词标注)
│   └── 全文内容 或 摘要+跳转按钮
└── ReadingProgress (进度条)
```

## 学习功能

### 生词标注

- 复用现有词典系统
- 点击单词显示释义、发音
- 可收藏到词汇本

### 阅读历史

- 自动记录阅读进度
- 支持继续阅读
- 历史记录页面展示

## 多Agent协作

### Phase 1: 产品设计
- **Product Manager**: PRD、用户故事
- **UX Designer**: 页面原型、交互流程

### Phase 2: 后端开发
- **Backend Developer**: API设计、RSS抓取服务
- **Database Engineer**: 数据模型、迁移脚本

### Phase 3: 前端开发
- **Web Developer**: 页面组件、路由

### Phase 4: 内容运营
- **Content Curator**: 内容源配置、版权分级

### Phase 5: 质量保障
- **Test Engineer**: 功能测试
- **Code Reviewer**: 代码审查

## 技术实现

### 后端

- NestJS 模块: `CommunityModule`
- RSS解析: `rss-parser` 库
- 定时任务: `@nestjs/schedule`
- AI摘要: 调用 OpenAI API

### 前端

- Next.js App Router
- 组件库: 复用现有UI组件
- 状态管理: React Query

## 实施计划

| 阶段 | 任务 | 产出 |
|------|------|------|
| 1 | 数据模型设计 | Prisma Schema |
| 2 | 后端API开发 | CRUD + RSS抓取 |
| 3 | 前端页面开发 | 社区页面 |
| 4 | 学习功能集成 | 生词标注 |
| 5 | 内容源配置 | 初始数据 |
| 6 | 测试上线 | 发布 |
