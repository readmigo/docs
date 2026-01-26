# Readmigo Dashboard 运营管理平台 - 功能规格文档

## 目录

1. [概述](#概述)
2. [技术架构](#技术架构)
3. [认证与权限](#认证与权限)
4. [模块详细设计](#模块详细设计)
   - [首页仪表盘](#1-首页仪表盘)
   - [书籍管理](#2-书籍管理)
   - [榜单管理](#3-榜单管理)
   - [用户管理](#4-用户管理)
   - [词汇管理](#5-词汇管理)
   - [AI服务监控](#6-ai服务监控)
   - [订阅管理](#7-订阅管理)
   - [数据分析](#8-数据分析)
   - [系统设置](#9-系统设置)
5. [API集成](#api集成)
6. [UI组件规范](#ui组件规范)

---

## 概述

Readmigo Dashboard 是一个功能完整的运营管理后台，用于管理 Readmigo AI英语阅读学习平台的所有核心业务。

### 核心目标

- **书籍内容管理**: 完整的书籍CRUD、章节管理、上下架控制
- **用户运营**: 用户查看、数据分析、问题处理
- **AI服务监控**: 使用量统计、成本追踪、配置管理
- **数据洞察**: 全面的业务数据分析和报表

### 目标用户

- 内容运营人员
- 产品经理
- 技术管理员
- 客服人员

---

## 技术架构

### 前端技术栈

```
Framework:     React 18 + TypeScript 5.x
Admin框架:     React Admin 5.x
UI组件库:      Material UI (MUI) 5.x
状态管理:      React Admin内置 + React Query
路由:          React Router 6.x
图表:          Recharts / Chart.js
表格:          React Admin DataGrid
表单:          React Hook Form (内置)
HTTP客户端:    Axios / Fetch
构建工具:      Vite
```

### 目录结构

```
apps/dashboard/
├── src/
│   ├── App.tsx                 # 应用入口 (Resource注册)
│   ├── main.tsx                # 入口文件
│   ├── theme.ts                # Material-UI主题配置
│   │
│   ├── services/               # 核心服务
│   │   ├── authProvider.ts     # 认证提供者
│   │   ├── dataProvider.ts     # 数据提供者 (API集成)
│   │   └── featureFlagsService.ts # 功能开关服务
│   │
│   ├── contexts/               # React Context
│   │   ├── ContentLanguageContext.tsx  # 内容语言过滤 (en/zh/all)
│   │   ├── EnvironmentContext.tsx      # 环境切换 (local/debug/staging/prod)
│   │   └── ContentContext.tsx
│   │
│   ├── config/                 # 配置
│   │   └── environments.ts     # 环境配置 (API URLs)
│   │
│   ├── i18n/                   # 国际化
│   │   ├── zh-Hans.ts          # 简体中文
│   │   ├── zh-Hant.ts          # 繁体中文
│   │   ├── en.ts               # 英文
│   │   └── index.ts
│   │
│   ├── components/             # 公共组件
│   │   ├── CustomAppBar.tsx    # 自定义顶栏
│   │   ├── CustomLayout.tsx    # 自定义布局
│   │   ├── CustomMenu.tsx      # 自定义菜单
│   │   ├── ContentLanguageSwitch.tsx   # 内容语言切换
│   │   ├── EnvironmentSelector.tsx     # 环境选择器
│   │   ├── LanguageSwitcher.tsx        # 界面语言切换
│   │   └── HelpButton.tsx
│   │
│   ├── pages/                  # 页面模块 (每个资源一个文件夹)
│   │   ├── dashboard/          # 首页仪表盘
│   │   ├── books/              # 书籍管理
│   │   ├── authors/            # 作者管理
│   │   ├── categories/         # 分类管理
│   │   ├── booklists/          # 榜单管理
│   │   ├── users/              # 用户管理
│   │   ├── quotes/             # 金句管理
│   │   ├── postcards/          # 明信片管理
│   │   ├── postcard-templates/ # 明信片模板
│   │   ├── messages/           # 消息管理
│   │   ├── feedback/           # 反馈管理
│   │   ├── tickets/            # 支持工单
│   │   ├── support/            # 支持仪表盘
│   │   ├── orders/             # 订单管理
│   │   ├── import-batches/     # 导入批次
│   │   ├── feature-flags/      # 功能开关
│   │   └── ai-stats/           # AI统计
│   │
│   └── hooks/                  # 自定义Hooks
│
├── public/
└── package.json
```

---

## 认证与权限

### 登录方式

1. **邮箱密码登录** (管理员账号)
2. **Google OAuth** (可选)

### 角色权限 (RBAC)

| 角色 | 权限范围 |
|------|----------|
| **Super Admin** | 所有功能，包括系统设置、管理员管理 |
| **Content Manager** | 书籍管理、词汇管理、内容审核 |
| **Operations** | 用户管理、订阅管理、数据分析 |
| **Viewer** | 只读权限，查看所有数据 |

### 权限矩阵

| 模块 | Super Admin | Content Manager | Operations | Viewer |
|------|-------------|-----------------|------------|--------|
| 首页仪表盘 | ✅ | ✅ | ✅ | ✅ |
| 书籍管理 - 查看 | ✅ | ✅ | ✅ | ✅ |
| 书籍管理 - 编辑 | ✅ | ✅ | ❌ | ❌ |
| 书籍管理 - 删除 | ✅ | ❌ | ❌ | ❌ |
| 用户管理 | ✅ | ❌ | ✅ | ✅ |
| AI服务监控 | ✅ | ✅ | ✅ | ✅ |
| 订阅管理 | ✅ | ❌ | ✅ | ✅ |
| 系统设置 | ✅ | ❌ | ❌ | ❌ |

---

## 模块详细设计

### 1. 首页仪表盘

**路由**: `/`

#### 1.1 核心指标卡片

| 指标 | 说明 | 数据源 |
|------|------|--------|
| 总用户数 | 注册用户总数 | `GET /admin/analytics/overview` |
| 活跃用户 (7天) | 过去7天有活动的用户 | 同上 |
| 总书籍数 | 已上架书籍数量 | 同上 |
| 今日阅读时长 | 今天所有用户阅读分钟数 | 同上 |
| 今日AI调用 | 今天AI接口调用次数 | 同上 |
| 今日新增用户 | 今天注册用户数 | 同上 |

#### 1.2 图表

**图表1: 用户增长趋势** (折线图)
- X轴: 日期 (最近30天)
- Y轴: 新增用户数
- 数据: `GET /admin/analytics/user-growth?days=30`

**图表2: 阅读活跃度** (面积图)
- X轴: 日期 (最近30天)
- Y轴: 阅读分钟数
- 数据: `GET /admin/analytics/reading-activity?days=30`

**图表3: AI使用量分布** (饼图)
- 分类: 查词、句子简化、段落翻译、问答
- 数据: `GET /admin/analytics/ai-usage`

**图表4: 热门书籍Top10** (横向条形图)
- Y轴: 书名
- X轴: 读者数量
- 数据: `GET /admin/analytics/top-books?limit=10`

#### 1.3 最近活动列表

显示最近的系统活动:
- 新书上架
- 新用户注册
- 订阅变更
- 异常告警

---

### 2. 书籍管理

**路由**: `/books`

这是Dashboard的核心功能模块，提供完整的书籍生命周期管理。

#### 2.1 书籍列表页

**路由**: `/books`

**功能特性**:

| 功能 | 描述 |
|------|------|
| 列表展示 | 分页表格，支持排序 |
| 搜索 | 按标题、作者搜索 |
| 筛选 | 按状态、来源、难度筛选 |
| 批量操作 | 批量上架、下架、删除 |
| 快捷操作 | 单行编辑、查看、删除按钮 |

**表格列定义**:

| 列名 | 字段 | 类型 | 可排序 | 说明 |
|------|------|------|--------|------|
| 封面 | `coverThumbUrl` | 图片 | ❌ | 60x80px缩略图 |
| 书名 | `title` | 文本链接 | ✅ | 点击进入详情 |
| 作者 | `author` | 文本 | ✅ | |
| 来源 | `source` | 标签 | ✅ | STANDARD_EBOOKS/GUTENBERG等 |
| 状态 | `status` | 状态标签 | ✅ | 颜色区分 |
| 难度 | `difficultyScore` | 进度条 | ✅ | 0-100分 |
| 章节数 | `chapterCount` | 数字 | ✅ | |
| 字数 | `wordCount` | 格式化数字 | ✅ | 如 "45.2K" |
| 读者数 | `readerCount` | 数字 | ✅ | 统计数据 |
| 创建时间 | `createdAt` | 日期 | ✅ | |
| 操作 | - | 按钮组 | ❌ | 编辑/查看/删除 |

**筛选器**:

```typescript
interface BookFilters {
  status?: 'PENDING' | 'PROCESSING' | 'ACTIVE' | 'INACTIVE' | 'ERROR';
  source?: 'STANDARD_EBOOKS' | 'GUTENBERG' | 'INTERNET_ARCHIVE' | 'USER_UPLOAD';
  minDifficulty?: number;
  maxDifficulty?: number;
  hasChapters?: boolean;
  search?: string;
}
```

**批量操作**:

- ✅ 批量上架 (设置status为ACTIVE)
- ✅ 批量下架 (设置status为INACTIVE)
- ✅ 批量删除 (需二次确认)
- ✅ 批量导出 (CSV/Excel)

#### 2.2 书籍详情/编辑页

**路由**: `/books/:id` (查看) 和 `/books/:id/edit` (编辑)

**页面布局**: 左右两栏

**左侧 - 基本信息表单**:

```typescript
interface BookFormData {
  // 基本信息
  title: string;              // 必填
  author: string;             // 必填
  description?: string;       // 富文本编辑器
  language: string;           // 默认 'en'

  // 分类
  subjects: string[];         // 多选标签
  genres: string[];           // 多选标签

  // 文件
  epubUrl: string;            // EPUB文件URL (只读/上传)
  coverUrl?: string;          // 封面URL (上传)
  coverThumbUrl?: string;     // 缩略图URL (自动生成)

  // 难度
  difficultyScore?: number;   // 0-100滑块
  fleschScore?: number;       // 自动计算，只读

  // 来源
  source: BookSource;
  sourceId?: string;
  sourceUrl?: string;

  // 状态
  status: BookStatus;
  publishedAt?: Date;
}
```

**右侧 - 章节管理**:

```typescript
interface ChapterData {
  id: string;
  order: number;
  title: string;
  href: string;
  wordCount?: number;
}
```

**章节列表功能**:
- 拖拽排序
- 编辑章节标题
- 查看章节内容预览
- 删除章节

**操作按钮**:

| 按钮 | 动作 | 条件 |
|------|------|------|
| 保存草稿 | 保存但不改变状态 | 始终可用 |
| 上架 | 设置status=ACTIVE | 需有章节 |
| 下架 | 设置status=INACTIVE | 当前为ACTIVE |
| 删除 | 删除书籍 | 需确认 |
| 重新处理 | 重新解析EPUB | status=ERROR时 |

#### 2.3 新增书籍页

**路由**: `/books/create`

**两种添加方式**:

**方式1: 上传EPUB文件**

```
上传流程:
1. 选择EPUB文件
2. 上传至R2存储
3. 后端解析EPUB
4. 自动提取: 标题、作者、章节、封面
5. 用户确认/编辑信息
6. 保存书籍
```

**方式2: 手动填写**

```
填写流程:
1. 输入EPUB URL (已在R2的文件)
2. 触发后端解析
3. 自动填充信息
4. 用户编辑完善
5. 保存书籍
```

**上传组件规格**:

```typescript
interface UploadConfig {
  accept: '.epub';
  maxSize: 50 * 1024 * 1024;  // 50MB
  endpoint: 'POST /admin/books/upload';
}
```

#### 2.4 书籍导入 (批量)

**路由**: `/books/import`

**导入来源**:

| 来源 | 说明 | 操作 |
|------|------|------|
| Standard Ebooks | 公版书高质量版本 | 触发后端爬虫任务 |
| Project Gutenberg | 海量公版书 | 触发后端爬虫任务 |
| Internet Archive | 更多公版资源 | 触发后端爬虫任务 |
| CSV导入 | 批量导入书籍元数据 | 上传CSV文件 |

**导入任务管理**:

```typescript
interface ImportTask {
  id: string;
  source: BookSource;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalBooks: number;
  processedBooks: number;
  successBooks: number;
  failedBooks: number;
  startedAt: Date;
  completedAt?: Date;
  errors: string[];
}
```

**导入任务列表**: 显示进行中和历史任务

---

### 3. 分类管理

**路由**: `/categories`

分类是书籍的基础组织结构，采用树形层级设计，支持多级子分类。

#### 3.1 分类体系设计

**一级分类 (Main Categories)**:

| 分类 | 英文 | 说明 |
|------|------|------|
| 小说 | Fiction | 虚构类文学作品 |
| 文学 | Literature | 经典文学、诗歌、散文 |
| 历史 | History | 历史类非虚构 |
| 传记 | Biography | 人物传记、回忆录 |
| 哲学 | Philosophy | 哲学思想类 |
| 科学 | Science | 科普、自然科学 |
| 社会 | Society | 社会学、政治、经济 |
| 心理 | Psychology | 心理学、自我成长 |
| 艺术 | Arts | 艺术、音乐、设计 |
| 儿童 | Children | 儿童文学、青少年读物 |

**二级分类示例**:

```
小说 (Fiction)
├── 经典小说 (Classic Fiction)
├── 当代小说 (Contemporary Fiction)
├── 科幻小说 (Science Fiction)
├── 奇幻小说 (Fantasy)
├── 悬疑推理 (Mystery & Thriller)
├── 浪漫爱情 (Romance)
├── 历史小说 (Historical Fiction)
└── 冒险小说 (Adventure)

文学 (Literature)
├── 世界文学 (World Literature)
├── 英美文学 (English & American Literature)
├── 诗歌 (Poetry)
├── 散文随笔 (Essays)
├── 戏剧 (Drama)
└── 短篇小说 (Short Stories)

传记 (Biography)
├── 政治人物 (Political Figures)
├── 科学家 (Scientists)
├── 艺术家 (Artists)
├── 作家 (Writers)
├── 企业家 (Entrepreneurs)
├── 历史人物 (Historical Figures)
└── 自传回忆录 (Autobiography & Memoir)
```

#### 3.2 分类管理页面

**路由**: `/categories`

**功能**:
- 树形结构展示所有分类
- 拖拽调整分类顺序和层级
- 添加/编辑/删除分类
- 查看分类下书籍数量
- 批量移动书籍到其他分类

**分类表单字段**:

```typescript
interface CategoryFormData {
  name: string;           // 中文名称
  nameEn: string;         // 英文名称
  slug: string;           // URL标识符 (如 fiction, sci-fi)
  parentId?: string;      // 父分类ID (可选)
  description?: string;   // 分类描述
  iconUrl?: string;       // 分类图标
  coverUrl?: string;      // 分类封面图
  sortOrder: number;      // 排序权重
  isActive: boolean;      // 是否启用
}
```

#### 3.3 分类数据模型

```prisma
model Category {
  id          String   @id @default(uuid()) @db.Uuid

  // 基本信息
  name        String   @db.VarChar(50)
  nameEn      String   @map("name_en") @db.VarChar(50)
  slug        String   @unique @db.VarChar(50)
  description String?  @db.Text

  // 层级关系
  parentId    String?  @map("parent_id") @db.Uuid
  parent      Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  level       Int      @default(0)  // 0=一级, 1=二级, 2=三级

  // 显示
  iconUrl     String?  @map("icon_url") @db.VarChar(500)
  coverUrl    String?  @map("cover_url") @db.VarChar(500)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")

  // 统计 (缓存)
  bookCount   Int      @default(0) @map("book_count")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 关联
  books       BookCategory[]

  @@index([parentId])
  @@index([slug])
  @@map("categories")
}

model BookCategory {
  id         String   @id @default(uuid()) @db.Uuid
  bookId     String   @map("book_id") @db.Uuid
  categoryId String   @map("category_id") @db.Uuid
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  isPrimary  Boolean  @default(false) @map("is_primary")  // 主分类

  createdAt  DateTime @default(now()) @map("created_at")

  @@unique([bookId, categoryId])
  @@index([categoryId])
  @@map("book_categories")
}
```

---

### 4. 榜单管理

**路由**: `/booklists`

榜单用于运营人员灵活配置书城的推荐内容，支持多种榜单类型。

#### 4.1 榜单类型

**1. 编辑精选 (EDITORS_PICK)**

| 榜单名称 | 说明 |
|----------|------|
| 本周编辑推荐 | 每周更新的精选书单 |
| 编辑最爱 | 编辑个人推荐 |
| 新书速递 | 新上架优质书籍 |
| 遗珠之选 | 被低估的优秀作品 |

**2. 年度书单 (ANNUAL_BEST)**

| 榜单名称 | 说明 |
|----------|------|
| 纽约时报年度好书 | NYT Best Books of the Year |
| Goodreads年度选择 | Goodreads Choice Awards |
| 亚马逊年度好书 | Amazon Best Books |
| 普利策奖作品 | Pulitzer Prize Winners |
| 布克奖作品 | Booker Prize Winners |
| 雨果奖作品 | Hugo Award Winners (科幻) |

**3. 名校书单 (UNIVERSITY)**

| 榜单名称 | 说明 |
|----------|------|
| 哈佛大学推荐 | Harvard Reading List |
| 耶鲁大学推荐 | Yale Required Reading |
| 牛津大学推荐 | Oxford Reading List |
| 剑桥大学推荐 | Cambridge Essentials |
| 斯坦福大学推荐 | Stanford Reading |
| 常春藤联盟必读 | Ivy League Classics |

**4. 名人书单 (CELEBRITY)**

| 榜单名称 | 说明 |
|----------|------|
| 比尔·盖茨推荐 | Bill Gates' Favorites |
| 奥普拉读书俱乐部 | Oprah's Book Club |
| 埃隆·马斯克推荐 | Elon Musk's Picks |
| 奥巴马年度书单 | Obama's Reading List |
| 马克·扎克伯格推荐 | Zuckerberg's Year of Books |
| 巴菲特推荐 | Warren Buffett's Favorites |

**5. 主题排行榜 (RANKING)**

| 榜单名称 | 数据来源 | 说明 |
|----------|----------|------|
| 热门阅读榜 | 阅读人数 | 最多人正在读 |
| 完读榜 | 完成人数 | 完读率最高 |
| 口碑榜 | 用户评分 | 评分最高 |
| 新书榜 | 上架时间 | 最新上架 |
| 难度挑战榜 | 难度分数 | 高难度书籍 |
| 入门推荐榜 | 难度分数 | 适合初学者 |

**6. 专题合集 (COLLECTION)**

| 专题名称 | 说明 |
|----------|------|
| 一生必读的100本书 | 经典文学精选 |
| 改变世界的思想 | 影响人类的重要著作 |
| 女性作家专题 | 优秀女性作家作品 |
| 黑人文学经典 | 非裔作家重要作品 |
| 反乌托邦小说 | 1984、美丽新世界等 |
| 侦探推理入门 | 经典侦探小说 |
| 科幻启蒙 | 科幻入门书单 |
| 维多利亚时代 | 维多利亚时期文学 |
| 战争与和平 | 战争题材作品 |
| 成长小说 | Coming-of-Age Stories |
| 短篇小说精选 | 适合碎片时间 |
| 30分钟速读 | 篇幅短小的经典 |

**7. AI推荐 (AI_RECOMMENDED)**

基于AI算法的通用推荐书单，由系统自动生成和更新。

| 榜单名称 | 说明 | 更新频率 |
|----------|------|----------|
| AI精选好书 | 综合评分、阅读量、完读率等多维度推荐 | 每日 |
| 本周AI热荐 | 基于近期用户行为趋势推荐 | 每周 |
| 口碑佳作 | AI分析用户评价和互动数据推荐 | 每周 |
| 冷门遗珠 | AI发现的被低估的优质书籍 | 每月 |

**8. 个性化推荐 (PERSONALIZED)**

结合用户阅读历史、词汇水平、学习偏好等量身定制的推荐书单。每个用户看到的内容不同。

| 推荐类型 | 说明 | 算法依据 |
|----------|------|----------|
| 为你推荐 | 综合个性化推荐 | 阅读历史、收藏、评分、停留时间 |
| 难度适配 | 匹配当前英语水平 | 用户等级、词汇掌握度、阅读速度 |
| 兴趣探索 | 基于阅读偏好拓展 | 分类偏好、作者偏好、主题偏好 |
| 进阶挑战 | 适度提升难度的推荐 | 当前水平 + 10-20%难度提升 |
| 相似推荐 | "读过X的人还读了" | 协同过滤算法 |

**9. AI特色书单 (AI_FEATURED)**

深度结合Readmigo产品特性的AI策划书单，突出AI辅助阅读的独特价值。

| 书单名称 | 说明 | 产品特性结合 |
|----------|------|--------------|
| 词汇扩展首选 | 词汇丰富度高，适合扩词 | AI即时查词、词汇本功能 |
| 口语表达宝库 | 对话丰富，适合学口语 | 句子朗读、发音练习 |
| 写作素材库 | 优美句式多，适合学写作 | 句子收藏、仿写练习 |
| 商务英语必读 | 商务场景和表达 | 专业词汇、场景对话 |
| 地道表达精选 | 习语和俚语丰富 | AI释义、文化背景解读 |
| 文学鉴赏入门 | 文学手法丰富 | AI文学分析功能 |
| 精读训练营 | 适合深度精读的书籍 | 段落翻译、内容问答 |
| 泛读快车道 | 适合快速阅读扩量 | 章节概要、速读模式 |
| 听读结合 | 适合听书学习 | 音频同步、跟读功能 |

#### 4.2 榜单列表页

**路由**: `/booklists`

**筛选器**:
- 榜单类型: 编辑精选/年度书单/名校书单/名人书单/排行榜/专题合集/AI推荐/个性化推荐/AI特色书单
- 状态: 已上线/未上线/定时发布
- 显示位置: 首页/发现页/分类页
- 是否AI生成: 是/否

**表格列**:

| 列名 | 字段 | 说明 |
|------|------|------|
| 封面 | - | 显示榜单封面或前3本书封面 |
| 榜单名称 | `name` | 支持中英文 |
| 类型 | `type` | 类型标签 |
| 书籍数量 | `_count.items` | |
| 显示位置 | `displayPosition` | |
| 排序 | `sortOrder` | |
| 状态 | `status` | |
| 更新时间 | `updatedAt` | |
| 操作 | - | 编辑/预览/复制/删除 |

#### 4.3 创建/编辑榜单页

**表单字段**:

```typescript
interface BookListFormData {
  // 基本信息
  name: string;              // 榜单名称
  nameEn?: string;           // 英文名称
  subtitle?: string;         // 副标题/简介
  description?: string;      // 详细描述 (Markdown)
  coverUrl?: string;         // 榜单封面图

  // 类型
  type: BookListType;

  // 显示配置
  displayPosition: DisplayPosition[];  // 可多选: HOME/DISCOVER/CATEGORY_PAGE
  sortOrder: number;
  displayStyle: 'CAROUSEL' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
  maxDisplayCount?: number;
  showRank?: boolean;        // 显示排名序号
  showDescription?: boolean; // 显示书籍推荐语

  // 状态
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED';
  scheduledAt?: Date;
  expiresAt?: Date;

  // 自动更新 (仅排行榜类型)
  autoUpdate?: boolean;
  updateFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  rankingCriteria?: 'READERS' | 'COMPLETION' | 'RATING' | 'NEWEST';

  // AI推荐配置 (AI_RECOMMENDED/PERSONALIZED/AI_FEATURED类型)
  isAiGenerated?: boolean;
  aiPrompt?: string;           // AI生成书单的prompt
  aiModel?: string;            // 使用的AI模型
  targetLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL';
  targetFeature?: 'VOCABULARY' | 'SPEAKING' | 'WRITING' | 'READING' | 'LISTENING' | 'ALL';
}

enum BookListType {
  EDITORS_PICK     // 编辑精选
  ANNUAL_BEST      // 年度书单
  UNIVERSITY       // 名校书单
  CELEBRITY        // 名人书单
  RANKING          // 主题排行榜
  COLLECTION       // 专题合集
  AI_RECOMMENDED   // AI推荐
  PERSONALIZED     // 个性化推荐
  AI_FEATURED      // AI特色书单
}
```

**书籍管理面板**:

- 左侧: 书籍搜索和筛选
  - 按标题/作者搜索
  - 按分类筛选
  - 按难度筛选
  - 按来源筛选
- 右侧: 已选书籍列表
  - 拖拽排序
  - 设置自定义推荐语
  - 批量操作

```typescript
interface BookListItem {
  id: string;
  bookListId: string;
  bookId: string;
  book?: Book;              // 关联的书籍信息
  sortOrder: number;
  customDescription?: string; // 编辑推荐语
  addedAt: Date;
  addedBy?: string;         // 添加人
}
```

#### 4.4 榜单数据模型

```prisma
model BookList {
  id          String   @id @default(uuid()) @db.Uuid

  // 基本信息
  name        String   @db.VarChar(100)
  nameEn      String?  @map("name_en") @db.VarChar(100)
  subtitle    String?  @db.VarChar(200)
  description String?  @db.Text
  coverUrl    String?  @map("cover_url") @db.VarChar(500)

  // 类型
  type        BookListType

  // 显示配置
  displayPositions String[]    @default([]) @map("display_positions")
  sortOrder       Int          @default(0) @map("sort_order")
  displayStyle    String       @default("HORIZONTAL") @map("display_style") @db.VarChar(20)
  maxDisplayCount Int?         @map("max_display_count")
  showRank        Boolean      @default(false) @map("show_rank")
  showDescription Boolean      @default(true) @map("show_description")

  // 自动更新配置 (排行榜)
  autoUpdate       Boolean  @default(false) @map("auto_update")
  updateFrequency  String?  @map("update_frequency") @db.VarChar(20)
  rankingCriteria  String?  @map("ranking_criteria") @db.VarChar(20)
  lastAutoUpdated  DateTime? @map("last_auto_updated")

  // AI推荐配置
  isAiGenerated    Boolean  @default(false) @map("is_ai_generated")
  aiPrompt         String?  @map("ai_prompt") @db.Text      // AI生成书单的prompt
  aiModel          String?  @map("ai_model") @db.VarChar(50) // 使用的AI模型
  targetLevel      String?  @map("target_level") @db.VarChar(20) // 目标英语等级
  targetFeature    String?  @map("target_feature") @db.VarChar(50) // 目标产品特性 (词汇/口语/写作等)

  // 状态
  status      BookListStatus @default(INACTIVE)
  scheduledAt DateTime?      @map("scheduled_at")
  expiresAt   DateTime?      @map("expires_at")

  // 时间戳
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by") @db.Uuid

  // 关联
  items BookListItem[]

  @@index([type, status])
  @@index([status, sortOrder])
  @@map("book_lists")
}

enum BookListType {
  EDITORS_PICK
  ANNUAL_BEST
  UNIVERSITY
  CELEBRITY
  RANKING
  COLLECTION
  AI_RECOMMENDED
  PERSONALIZED
  AI_FEATURED
}

enum BookListStatus {
  ACTIVE
  INACTIVE
  SCHEDULED
}

model BookListItem {
  id         String   @id @default(uuid()) @db.Uuid
  bookListId String   @map("book_list_id") @db.Uuid
  bookList   BookList @relation(fields: [bookListId], references: [id], onDelete: Cascade)
  bookId     String   @map("book_id") @db.Uuid

  sortOrder         Int     @default(0) @map("sort_order")
  customDescription String? @map("custom_description") @db.Text

  addedAt   DateTime @default(now()) @map("added_at")
  addedBy   String?  @map("added_by") @db.Uuid

  @@unique([bookListId, bookId])
  @@index([bookListId, sortOrder])
  @@map("book_list_items")
}
```

#### 4.5 API端点

```yaml
# 分类管理
GET    /api/v1/admin/categories              # 获取分类树
GET    /api/v1/admin/categories/:id          # 分类详情
POST   /api/v1/admin/categories              # 创建分类
PUT    /api/v1/admin/categories/:id          # 更新分类
DELETE /api/v1/admin/categories/:id          # 删除分类
PUT    /api/v1/admin/categories/reorder      # 重排序

# 书籍分类关联
POST   /api/v1/admin/books/:id/categories    # 设置书籍分类
GET    /api/v1/admin/categories/:id/books    # 获取分类下书籍

# 榜单CRUD
GET    /api/v1/admin/booklists              # 列表 (分页、筛选)
GET    /api/v1/admin/booklists/:id          # 详情 (含书籍列表)
POST   /api/v1/admin/booklists              # 创建
PUT    /api/v1/admin/booklists/:id          # 更新
DELETE /api/v1/admin/booklists/:id          # 删除

# 榜单书籍管理
GET    /api/v1/admin/booklists/:id/items    # 获取榜单书籍
POST   /api/v1/admin/booklists/:id/items    # 添加书籍 (支持批量)
DELETE /api/v1/admin/booklists/:id/items/:bookId  # 移除书籍
PUT    /api/v1/admin/booklists/:id/items/reorder  # 重排序

# 榜单操作
POST   /api/v1/admin/booklists/:id/publish   # 上线
POST   /api/v1/admin/booklists/:id/unpublish # 下线
POST   /api/v1/admin/booklists/:id/duplicate # 复制
POST   /api/v1/admin/booklists/:id/refresh   # 刷新排行榜数据

# 客户端API (公开)
GET    /api/v1/categories                    # 获取分类树
GET    /api/v1/categories/:slug/books        # 获取分类下书籍
GET    /api/v1/booklists                     # 获取活跃榜单
GET    /api/v1/booklists/:id                 # 获取榜单详情
```

---

### 4. 用户管理

**路由**: `/users`

#### 4.1 用户列表页

**表格列**:

| 列名 | 字段 | 说明 |
|------|------|------|
| 头像 | `avatarUrl` | 圆形头像 |
| 用户名 | `displayName` | |
| 邮箱 | `email` | |
| 登录方式 | `appleId`/`googleId` | Apple/Google图标 |
| 英语等级 | `englishLevel` | BEGINNER/INTERMEDIATE/ADVANCED |
| 注册时间 | `createdAt` | |
| 最后活跃 | `lastActiveAt` | |
| 订阅状态 | `subscription.status` | 标签显示 |
| 总阅读时长 | `totalReadingMinutes` | 格式化显示 |
| 操作 | - | 查看详情 |

**筛选器**:

- 订阅状态: FREE / PRO / PREMIUM
- 英语等级: BEGINNER / INTERMEDIATE / ADVANCED
- 注册时间范围
- 活跃状态: 活跃/休眠

#### 4.2 用户详情页

**路由**: `/users/:id`

**信息展示**:

**基本信息卡片**:
- 头像、用户名、邮箱
- 注册时间、最后活跃
- 登录方式
- 英语等级、每日目标

**订阅信息卡片**:
- 当前套餐
- 开始时间、到期时间
- 订阅状态

**学习统计卡片**:
- 总阅读时长
- 连续打卡天数
- 学习词汇数
- 完成书籍数

**阅读历史** (列表):
- 正在阅读的书籍
- 已完成的书籍
- 阅读进度

**词汇本** (列表):
- 词汇数量统计 (按状态)
- 最近学习的词汇

**操作**:
- 重置密码 (如适用)
- 调整订阅
- 禁用账号

---

### 4. 词汇管理

**路由**: `/vocabulary`

#### 4.1 全局词库

**路由**: `/vocabulary/global`

管理系统全局词库 (Vocabulary表)

**表格列**:

| 列名 | 字段 | 说明 |
|------|------|------|
| 单词 | `word` | |
| 音标 | `phonetic` | |
| 词性 | `partOfSpeech` | |
| 定义 | `definition` | 截断显示 |
| 简化定义 | `simpleDefinition` | |
| 词频排名 | `frequencyRank` | |
| 用户学习数 | `_count.userVocabulary` | 统计 |
| 来源 | `source` | |
| 操作 | - | 编辑/删除 |

**功能**:
- 搜索词汇
- 添加新词汇
- 编辑词汇释义
- 导入词汇 (CSV)
- 导出词汇

#### 4.2 用户词汇统计

**路由**: `/vocabulary/stats`

**统计图表**:
- 每日新学词汇趋势
- 词汇状态分布 (NEW/LEARNING/MASTERED)
- 复习完成率
- 热门学习词汇Top50

---

### 5. AI服务监控

**路由**: `/ai`

#### 5.1 使用量概览

**指标卡片**:

| 指标 | 说明 |
|------|------|
| 今日调用次数 | 所有AI接口调用总数 |
| 今日Token消耗 | 输入+输出Token总数 |
| 今日成本 (USD) | 估算成本 |
| 平均响应时间 | 毫秒 |
| 缓存命中率 | 百分比 |
| 错误率 | 百分比 |

**趋势图表**:
- 每日调用量趋势 (30天)
- 每日成本趋势 (30天)
- 响应时间分布

#### 5.2 按类型统计

**表格**:

| 交互类型 | 今日调用 | 总调用 | 平均耗时 | 今日成本 |
|----------|----------|--------|----------|----------|
| WORD_EXPLAIN | 1,234 | 45,678 | 320ms | $0.12 |
| SENTENCE_SIMPLIFY | 567 | 23,456 | 450ms | $0.08 |
| PARAGRAPH_TRANSLATE | 234 | 12,345 | 780ms | $0.15 |
| CONTENT_QA | 123 | 5,678 | 1200ms | $0.25 |
| CHAPTER_SUMMARY | 45 | 1,234 | 2500ms | $0.35 |
| LITERARY_ANALYSIS | 12 | 567 | 3500ms | $0.50 |

#### 5.3 模型使用统计

**表格**:

| 模型 | Provider | 调用次数 | Token消耗 | 成本 |
|------|----------|----------|-----------|------|
| deepseek-chat | DeepSeek | 15,000 | 2.5M | $0.50 |
| gpt-4o-mini | OpenAI | 3,000 | 800K | $0.35 |
| claude-3-haiku | Anthropic | 500 | 200K | $0.05 |

#### 5.4 AI配置管理

**路由**: `/ai/settings`

**配置项**:

```typescript
interface AIConfig {
  // Provider开关
  providers: {
    deepseek: { enabled: boolean; apiKey: string };
    openai: { enabled: boolean; apiKey: string };
    anthropic: { enabled: boolean; apiKey: string };
  };

  // 路由配置
  routing: {
    [key in AITaskType]: {
      primary: { provider: string; model: string };
      fallback: { provider: string; model: string };
    };
  };

  // 限制配置
  limits: {
    freeUserDailyLimit: number;
    proUserDailyLimit: number;
    premiumUserDailyLimit: number;
  };

  // 缓存配置
  cache: {
    enabled: boolean;
    ttlSeconds: number;
  };
}
```

---

### 6. 订阅管理

**路由**: `/subscriptions`

#### 6.1 订阅概览

**指标卡片**:
- 总订阅用户数
- PRO用户数
- PREMIUM用户数
- 本月新增订阅
- 本月取消订阅
- MRR (月度循环收入)

**图表**:
- 订阅用户增长趋势
- 订阅套餐分布饼图
- 流失率趋势

#### 6.2 订阅列表

**表格列**:

| 列名 | 字段 | 说明 |
|------|------|------|
| 用户 | `user.displayName` | 链接到用户详情 |
| 套餐 | `planType` | FREE/PRO/PREMIUM |
| 状态 | `status` | ACTIVE/EXPIRED/CANCELLED |
| 开始时间 | `startedAt` | |
| 到期时间 | `expiresAt` | |
| 交易ID | `originalTransactionId` | Apple IAP |
| 操作 | - | 查看/调整 |

#### 6.3 订阅配置

**套餐配置**:

```typescript
interface PlanConfig {
  FREE: {
    aiDailyLimit: number;      // 每日AI调用限制
    booksLimit: number;        // 书架容量
    features: string[];        // 功能列表
  };
  PRO: {
    price: number;             // 月价格 (USD)
    aiDailyLimit: number;
    booksLimit: number;
    features: string[];
  };
  PREMIUM: {
    price: number;
    aiDailyLimit: number;      // -1 = 无限
    booksLimit: number;        // -1 = 无限
    features: string[];
  };
}
```

---

### 7. 数据分析

**路由**: `/analytics`

#### 7.1 用户分析

**路由**: `/analytics/users`

**图表**:
- 用户注册趋势 (日/周/月)
- 用户留存率 (第1/7/30天)
- DAU/WAU/MAU趋势
- 用户活跃时段热力图

**用户漏斗**:
```
注册 → 添加第一本书 → 开始阅读 → 查词10次 → 连续阅读7天 → 订阅
```

#### 7.2 阅读分析

**路由**: `/analytics/reading`

**图表**:
- 每日总阅读时长
- 人均阅读时长
- 阅读完成率 (完成书籍/开始书籍)
- 热门阅读时段

**书籍表现**:
- 最受欢迎书籍Top20
- 完读率最高书籍
- 平均阅读时长/书籍
- 弃读率最高书籍

#### 7.3 学习分析

**路由**: `/analytics/learning`

**图表**:
- 每日学习词汇数
- 词汇掌握进度
- 复习完成率
- 遗忘曲线分析

#### 7.4 收入分析

**路由**: `/analytics/revenue`

**指标**:
- MRR (月度循环收入)
- ARR (年度循环收入)
- ARPU (每用户平均收入)
- LTV (用户生命周期价值)

**图表**:
- 收入趋势
- 订阅转化漏斗
- 套餐分布变化

---

### 8. 系统设置

**路由**: `/settings`

#### 8.1 管理员管理

**路由**: `/settings/admins`

**功能**:
- 管理员列表
- 添加管理员
- 设置角色权限
- 禁用/启用管理员
- 重置密码

#### 8.2 系统配置

**路由**: `/settings/system`

**配置项**:

```typescript
interface SystemConfig {
  // 应用配置
  app: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };

  // 存储配置
  storage: {
    r2BucketName: string;
    r2PublicUrl: string;
  };

  // 通知配置
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
  };
}
```

#### 8.3 操作日志

**路由**: `/settings/logs`

**日志列表**:

| 字段 | 说明 |
|------|------|
| 时间 | 操作时间 |
| 操作人 | 管理员名称 |
| 操作类型 | CREATE/UPDATE/DELETE |
| 资源类型 | BOOK/USER/SUBSCRIPTION等 |
| 资源ID | |
| 详情 | JSON格式变更内容 |
| IP地址 | |

---

## API集成

### Data Provider 实现

Dashboard使用React Admin的Data Provider模式与后端API集成。

```typescript
// src/dataProvider.ts
import { DataProvider } from 'react-admin';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider: DataProvider = {
  // 获取列表
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      page,
      limit: perPage,
      sortBy: field,
      sortOrder: order.toLowerCase(),
      ...params.filter,
    };

    const { data } = await apiClient.get(`/admin/${resource}`, { params: query });

    return {
      data: data.items,
      total: data.total,
    };
  },

  // 获取单个
  getOne: async (resource, params) => {
    const { data } = await apiClient.get(`/admin/${resource}/${params.id}`);
    return { data };
  },

  // 创建
  create: async (resource, params) => {
    const { data } = await apiClient.post(`/admin/${resource}`, params.data);
    return { data };
  },

  // 更新
  update: async (resource, params) => {
    const { data } = await apiClient.put(`/admin/${resource}/${params.id}`, params.data);
    return { data };
  },

  // 删除
  delete: async (resource, params) => {
    await apiClient.delete(`/admin/${resource}/${params.id}`);
    return { data: params.previousData };
  },

  // 批量删除
  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map(id => apiClient.delete(`/admin/${resource}/${id}`))
    );
    return { data: params.ids };
  },

  // 批量获取
  getMany: async (resource, params) => {
    const { data } = await apiClient.get(`/admin/${resource}`, {
      params: { ids: params.ids.join(',') },
    });
    return { data: data.items };
  },

  // 获取关联引用
  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { data } = await apiClient.get(`/admin/${resource}`, {
      params: {
        [params.target]: params.id,
        page,
        limit: perPage,
      },
    });
    return {
      data: data.items,
      total: data.total,
    };
  },
};
```

### 后端Admin API端点

需要在后端实现以下Admin API:

```yaml
# 书籍管理
GET    /api/v1/admin/books              # 列表 (分页、筛选、排序)
GET    /api/v1/admin/books/:id          # 详情
POST   /api/v1/admin/books              # 创建
PUT    /api/v1/admin/books/:id          # 更新
DELETE /api/v1/admin/books/:id          # 删除
POST   /api/v1/admin/books/upload       # 上传EPUB
POST   /api/v1/admin/books/:id/publish  # 上架
POST   /api/v1/admin/books/:id/unpublish # 下架
POST   /api/v1/admin/books/import       # 触发导入任务
GET    /api/v1/admin/books/import-tasks # 导入任务列表

# 章节管理
GET    /api/v1/admin/books/:bookId/chapters
POST   /api/v1/admin/books/:bookId/chapters
PUT    /api/v1/admin/books/:bookId/chapters/:id
DELETE /api/v1/admin/books/:bookId/chapters/:id
POST   /api/v1/admin/books/:bookId/chapters/reorder

# 榜单管理
GET    /api/v1/admin/booklists              # 列表 (分页、筛选)
GET    /api/v1/admin/booklists/:id          # 详情 (含书籍列表)
POST   /api/v1/admin/booklists              # 创建
PUT    /api/v1/admin/booklists/:id          # 更新
DELETE /api/v1/admin/booklists/:id          # 删除
GET    /api/v1/admin/booklists/:id/items    # 获取榜单书籍
POST   /api/v1/admin/booklists/:id/items    # 添加书籍
DELETE /api/v1/admin/booklists/:id/items/:bookId  # 移除书籍
PUT    /api/v1/admin/booklists/:id/items/reorder  # 重排序
POST   /api/v1/admin/booklists/:id/publish   # 上线
POST   /api/v1/admin/booklists/:id/unpublish # 下线
POST   /api/v1/admin/booklists/:id/duplicate # 复制

# 用户管理
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id
POST   /api/v1/admin/users/:id/disable
POST   /api/v1/admin/users/:id/enable

# 词汇管理
GET    /api/v1/admin/vocabulary
POST   /api/v1/admin/vocabulary
PUT    /api/v1/admin/vocabulary/:id
DELETE /api/v1/admin/vocabulary/:id
POST   /api/v1/admin/vocabulary/import

# AI监控
GET    /api/v1/admin/ai/stats
GET    /api/v1/admin/ai/usage
GET    /api/v1/admin/ai/config
PUT    /api/v1/admin/ai/config

# 订阅管理
GET    /api/v1/admin/subscriptions
GET    /api/v1/admin/subscriptions/:id
PUT    /api/v1/admin/subscriptions/:id

# 数据分析
GET    /api/v1/admin/analytics/overview
GET    /api/v1/admin/analytics/user-growth
GET    /api/v1/admin/analytics/reading-activity
GET    /api/v1/admin/analytics/ai-usage
GET    /api/v1/admin/analytics/top-books
GET    /api/v1/admin/analytics/revenue

# 系统设置
GET    /api/v1/admin/settings
PUT    /api/v1/admin/settings
GET    /api/v1/admin/admins
POST   /api/v1/admin/admins
PUT    /api/v1/admin/admins/:id
DELETE /api/v1/admin/admins/:id
GET    /api/v1/admin/logs
```

---

## UI组件规范

### 主题配色

```typescript
const theme = {
  palette: {
    primary: {
      main: '#1976d2',      // 主色 - 蓝色
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',      // 辅助色 - 紫色
    },
    success: {
      main: '#2e7d32',      // 成功 - 绿色
    },
    warning: {
      main: '#ed6c02',      // 警告 - 橙色
    },
    error: {
      main: '#d32f2f',      // 错误 - 红色
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
};
```

### 状态标签颜色

| 状态 | 颜色 | 使用场景 |
|------|------|----------|
| ACTIVE / SUCCESS | 绿色 #2e7d32 | 已上架、活跃、成功 |
| PENDING / WARNING | 橙色 #ed6c02 | 待处理、待审核 |
| INACTIVE / DISABLED | 灰色 #757575 | 已下架、禁用 |
| ERROR / FAILED | 红色 #d32f2f | 错误、失败 |
| PROCESSING | 蓝色 #1976d2 | 处理中 |

### 通用组件

**确认对话框**:
- 删除操作必须二次确认
- 显示将被删除的资源名称
- 红色确认按钮

**加载状态**:
- 表格加载: Skeleton占位
- 按钮加载: CircularProgress
- 页面加载: 全屏Loading

**错误处理**:
- API错误: Snackbar提示
- 表单验证: 字段下方错误信息
- 404: 专用404页面

**空状态**:
- 无数据时显示友好提示
- 提供创建/导入操作入口

---

## 开发进度

### Phase 1: 基础框架 ✅ 已完成

- [x] React Admin项目初始化
- [x] 认证系统 (登录/登出)
- [x] 基础Layout和导航
- [x] Data Provider实现
- [x] 国际化支持 (中/英/繁体)
- [x] 书籍列表页 (CRUD)

### Phase 2: 核心功能 ✅ 已完成

- [x] 书籍详情/编辑页
- [x] 书籍上架/下架
- [x] 榜单管理 (CRUD + 书籍选择 + 上架/下架/复制)
- [x] 分类管理 (CRUD + 排序)
- [x] 用户列表和详情
- [x] 作者管理 (列表/编辑/详情)

### Phase 3: 内容运营功能 ✅ 已完成

- [x] 首页仪表盘 (概览统计)
- [x] AI服务监控 (使用量统计)
- [x] 金句管理 (CRUD)
- [x] 明信片模板管理 (CRUD)
- [x] 明信片管理 (列表/查看/删除)

### Phase 4: 用户服务与运营 ✅ 已完成

- [x] 消息系统 (Messages/Threads) - 工单管理、回复模板、状态流转
- [x] 反馈管理 (Feedback) - 用户反馈收集、分类、状态追踪
- [x] 支持工单 (Tickets) - 支持票务系统
- [x] 支持仪表盘 (Support Dashboard) - SLA追踪、票务统计
- [x] 订单管理 (Orders) - 交易记录、退款追踪
- [x] 批量导入 (Import Batches) - 导入任务管理、进度监控

### Phase 5: 高级功能 ✅ 已完成

- [x] 功能开关管理 (Feature Flags) - 环境级别的功能开关
- [x] 环境切换 (Environment Switching) - local/debug/staging/production
- [x] 内容语言过滤 (Content Language Filter) - en/zh/all
- [x] 订阅管理 API - 延期/授予/撤销/升降级

### Phase 6: 待开发功能 (优先级: P2)

- [ ] 书籍上传功能 (EPUB)
- [ ] 章节管理
- [ ] 词汇管理
- [ ] 系统设置页面
- [ ] 操作日志查看页面
- [ ] 更详细的数据分析图表

---

## 当前已实现模块

### 已完成的 Dashboard 页面

| 模块 | 路由 | 功能 |
|------|------|------|
| 首页仪表盘 | `/` | 概览统计、热门书籍、周阅读活跃度图表 |
| 书籍管理 | `/books` | 列表、创建、编辑、查看、上架/下架、难度评分 |
| 作者管理 | `/authors` | 列表、编辑、查看、时间线事件、AI人设配置 |
| 榜单管理 | `/booklists` | 列表、创建、编辑、查看、书籍选择、复制、AI推荐配置 |
| 分类管理 | `/categories` | 列表、创建、编辑、层级结构、图标选择 |
| 用户管理 | `/users` | 列表、详情(多Tab)、阅读统计、词汇统计、账单信息 |
| 金句管理 | `/quotes` | 列表、创建、编辑、查看、标签管理 |
| 明信片模板 | `/postcard-templates` | 列表、创建、编辑、样式配置 |
| 明信片 | `/postcards` | 列表、查看、内容类型过滤 |
| AI监控 | `/ai-stats` | 使用量统计、Provider分布、日趋势图 |
| 消息管理 | `/messages` | 工单列表、对话视图、回复模板、状态管理 |
| 反馈管理 | `/feedback` | 反馈列表、分类筛选、状态流转、评分查看 |
| 支持工单 | `/tickets` | 工单列表、优先级管理、来源追踪 |
| 支持仪表盘 | `/support` | SLA统计、票务概览、收入追踪 |
| 订单管理 | `/orders` | 订单列表、状态筛选、退款追踪 |
| 导入批次 | `/import-batches` | 批次列表、进度监控、启动/取消/回滚操作 |
| 功能开关 | `/feature-flags` | 开关管理、环境配置、JSON值编辑、缓存管理 |

### 已完成的 Admin API

**总计: 93+ 个端点**

```yaml
# ═══════════════════════════════════════════════════════════════
# 书籍管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/books              ✅  # 书籍列表 (分页、筛选、排序)
GET    /admin/books/:id          ✅  # 书籍详情
POST   /admin/books              ✅  # 创建书籍
PUT    /admin/books/:id          ✅  # 更新书籍 (全量)
PATCH  /admin/books/:id          ✅  # 更新书籍 (部分)
DELETE /admin/books/:id          ✅  # 删除书籍
POST   /admin/books/:id/publish  ✅  # 上架
POST   /admin/books/:id/unpublish ✅ # 下架

# ═══════════════════════════════════════════════════════════════
# 作者管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/authors            ✅  # 作者列表
GET    /admin/authors/:id        ✅  # 作者详情
PUT    /admin/authors/:id        ✅  # 更新作者
PATCH  /admin/authors/:id        ✅  # 部分更新作者
GET    /admin/author-timeline-events ✅  # 作者时间线事件
GET    /admin/author-quotes      ✅  # 作者名言

# ═══════════════════════════════════════════════════════════════
# 用户管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/users              ✅  # 用户列表 (高级筛选)
GET    /admin/users/:id          ✅  # 用户详情
GET    /admin/users/:id/billing  ✅  # 用户账单信息
GET    /admin/users/:id/reading  ✅  # 用户阅读数据
GET    /admin/users/:id/vocabulary ✅ # 用户词汇数据
GET    /admin/users/:id/deletion-logs ✅ # 删除日志
GET    /admin/users/:id/account-graph ✅ # 账号关系图
GET    /admin/users/:id/export   ✅  # 导出用户数据 (GDPR)

# ═══════════════════════════════════════════════════════════════
# 账号删除管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/accounts/pending-deletion ✅ # 待删除用户列表
POST   /admin/accounts/:id/execute-deletion ✅ # 执行删除
POST   /admin/accounts/:id/cancel-deletion ✅ # 取消删除

# ═══════════════════════════════════════════════════════════════
# 订阅管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/subscriptions      ✅  # 订阅列表
GET    /admin/subscriptions/:userId ✅ # 用户订阅详情
POST   /admin/subscriptions/:userId/extend ✅ # 延长订阅
POST   /admin/subscriptions/:userId/grant ✅ # 授予订阅
POST   /admin/subscriptions/:userId/revoke ✅ # 撤销订阅
POST   /admin/subscriptions/:userId/change-tier ✅ # 变更套餐
GET    /admin/subscriptions/stats/overview ✅ # 订阅统计

# ═══════════════════════════════════════════════════════════════
# 订单/交易管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/transactions       ✅  # 订单列表 (筛选、分页)

# ═══════════════════════════════════════════════════════════════
# 分类管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/categories         ✅  # 分类树
GET    /admin/categories/:id     ✅  # 分类详情
POST   /admin/categories         ✅  # 创建分类
PUT    /admin/categories/:id     ✅  # 更新分类
DELETE /admin/categories/:id     ✅  # 删除分类
PUT    /admin/categories/reorder ✅  # 重排序

# ═══════════════════════════════════════════════════════════════
# 榜单管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/booklists          ✅  # 榜单列表
GET    /admin/booklists/:id      ✅  # 榜单详情
POST   /admin/booklists          ✅  # 创建榜单
PUT    /admin/booklists/:id      ✅  # 更新榜单
PATCH  /admin/booklists/:id      ✅  # 部分更新
DELETE /admin/booklists/:id      ✅  # 删除榜单
POST   /admin/booklists/:id/publish   ✅ # 上线
POST   /admin/booklists/:id/unpublish ✅ # 下线
POST   /admin/booklists/:id/duplicate ✅ # 复制
GET    /admin/booklists/:id/items     ✅ # 获取书籍
POST   /admin/booklists/:id/items     ✅ # 添加书籍
DELETE /admin/booklists/:id/items/:bookId ✅ # 移除书籍
PUT    /admin/booklists/:id/items/reorder ✅ # 重排序

# ═══════════════════════════════════════════════════════════════
# 金句管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/quotes             ✅  # 金句列表
GET    /admin/quotes/:id         ✅  # 金句详情
POST   /admin/quotes             ✅  # 创建金句
PUT    /admin/quotes/:id         ✅  # 更新金句
DELETE /admin/quotes/:id         ✅  # 删除金句

# ═══════════════════════════════════════════════════════════════
# 明信片管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/postcard-templates      ✅ # 模板列表
GET    /admin/postcard-templates/:id  ✅ # 模板详情
POST   /admin/postcard-templates      ✅ # 创建模板
PUT    /admin/postcard-templates/:id  ✅ # 更新模板
DELETE /admin/postcard-templates/:id  ✅ # 删除模板
GET    /admin/postcards               ✅ # 用户明信片列表
GET    /admin/postcards/:id           ✅ # 明信片详情
DELETE /admin/postcards/:id           ✅ # 删除明信片

# ═══════════════════════════════════════════════════════════════
# 消息系统
# ═══════════════════════════════════════════════════════════════
GET    /admin/messages/threads       ✅ # 消息线程列表
GET    /admin/messages/threads/:id   ✅ # 线程详情
POST   /admin/messages/threads/:id/reply ✅ # 回复消息
PATCH  /admin/messages/threads/:id/status ✅ # 更新状态
PATCH  /admin/messages/threads/:id/assign ✅ # 分配客服
GET    /admin/messages/stats         ✅ # 消息统计

# ═══════════════════════════════════════════════════════════════
# 导入批次管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/import/batches         ✅ # 批次列表
GET    /admin/import/batches/:id     ✅ # 批次详情
GET    /admin/import/batches/stats   ✅ # 批次统计
POST   /admin/import/batches/:id/start ✅ # 启动批次
POST   /admin/import/batches/:id/cancel ✅ # 取消批次
POST   /admin/import/batches/:id/complete ✅ # 完成批次
DELETE /admin/import/batches/:id/rollback ✅ # 回滚批次

# ═══════════════════════════════════════════════════════════════
# 数据分析
# ═══════════════════════════════════════════════════════════════
GET    /admin/analytics/overview     ✅ # 仪表盘概览
GET    /admin/analytics/top-books    ✅ # 热门书籍
GET    /admin/ai/stats               ✅ # AI使用统计
GET    /admin/support/dashboard      ✅ # 支持仪表盘

# ═══════════════════════════════════════════════════════════════
# Agora 社区管理
# ═══════════════════════════════════════════════════════════════
GET    /admin/agora/stats            ✅ # Agora统计
POST   /admin/agora/import           ✅ # 从真实数据源导入内容
```

---

## 系统架构与数据流设计

### 1. Dashboard 在全栈架构中的位置

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Readmigo 全栈架构数据流                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   iOS App   │     │  Web App    │     │  Dashboard  │     │  Jobs/Cron  │       │
│  │  (Client)   │     │  (Client)   │     │   (Admin)   │     │  (System)   │       │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘       │
│         │                   │                   │                   │              │
│         │ User API          │ User API          │ Admin API         │ Internal     │
│         │ /api/v1/*         │ /api/v1/*         │ /api/v1/admin/*   │ API          │
│         ▼                   ▼                   ▼                   ▼              │
│  ┌─────────────────────────────────────────────────────────────────────────┐       │
│  │                         NestJS Backend (API Gateway)                     │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │       │
│  │  │  Auth    │ │  Books   │ │  Admin   │ │ Analytics│ │  Jobs    │      │       │
│  │  │ Module   │ │  Module  │ │  Module  │ │  Module  │ │  Module  │      │       │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │       │
│  └──────────────────────────────┬───────────────────────────────────────────┘       │
│                                 │                                                   │
│         ┌───────────────────────┼───────────────────────┐                          │
│         ▼                       ▼                       ▼                          │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐                   │
│  │ PostgreSQL  │         │    Redis    │         │ Cloudflare  │                   │
│  │  (Primary)  │         │   (Cache)   │         │     R2      │                   │
│  └─────────────┘         └─────────────┘         └─────────────┘                   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐       │
│  │                         外部服务 (External Services)                      │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │       │
│  │  │ DeepSeek │ │  OpenAI  │ │Anthropic │ │  Sentry  │ │   ELK    │      │       │
│  │  │   (AI)   │ │   (AI)   │ │   (AI)   │ │ (Error)  │ │  (Logs)  │      │       │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │       │
│  └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Dashboard 的定位与职责边界

#### 2.1 核心定位

| 维度 | 定义 |
|------|------|
| **身份** | 内部运营管理工具 (B端) |
| **用户** | 运营人员、内容编辑、产品经理、技术管理员、客服 |
| **职责** | 内容管理、用户运营、数据分析、系统配置 |
| **边界** | 只能通过 Admin API 访问数据，不直连数据库 |

#### 2.2 职责划分原则

```
┌───────────────────────────────────────────────────────────────────┐
│                        Dashboard 职责边界                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ Dashboard 可以做的事情:                                        │
│  ├── 查看和管理内容 (书籍、榜单、分类、金句)                          │
│  ├── 查看用户信息 (只读，不直接修改敏感数据)                          │
│  ├── 配置系统参数 (AI路由、限额、功能开关)                            │
│  ├── 查看数据报表 (统计、分析、趋势)                                 │
│  ├── 执行运营操作 (上架/下架、调整排序)                               │
│  └── 查看日志和错误 (用于排查问题)                                   │
│                                                                   │
│  ❌ Dashboard 不能做的事情:                                         │
│  ├── 直接访问数据库 (必须通过 Admin API)                             │
│  ├── 修改用户密码/认证信息 (安全考虑)                                │
│  ├── 查看用户支付凭证原文 (隐私保护)                                 │
│  ├── 执行不可逆的批量删除 (需要审批流程)                              │
│  └── 修改系统核心配置 (需要代码部署)                                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 3. 功能模块数据流详解

#### 3.1 数据流图例说明

```
数据流方向:
  ──▶  同步请求/响应
  ──▷  异步任务
  ════  数据存储

操作类型:
  [R]  Read   读取
  [C]  Create 创建
  [U]  Update 更新
  [D]  Delete 删除
  [X]  Execute 执行
```

---

#### 3.2 首页仪表盘 (Dashboard Overview)

**数据流位置**: 只读聚合层 (Read-Only Aggregation Layer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        首页仪表盘数据流                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Dashboard UI                                                           │
│       │                                                                 │
│       │ GET /admin/analytics/overview                                   │
│       ▼                                                                 │
│  ┌─────────────┐                                                        │
│  │   Admin     │                                                        │
│  │  Controller │                                                        │
│  └──────┬──────┘                                                        │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │
│  │  Analytics  │────▶│   Prisma    │────▶│ PostgreSQL  │               │
│  │   Service   │     │    ORM      │     │  (聚合查询)  │               │
│  └─────────────┘     └─────────────┘     └─────────────┘               │
│         │                                       │                       │
│         │                                       ▼                       │
│         │                                ┌─────────────┐               │
│         │                                │  DailyStats │               │
│         │                                │    Table    │               │
│         │                                └─────────────┘               │
│         ▼                                                               │
│  ┌─────────────┐                                                        │
│  │    Redis    │  (缓存聚合结果，TTL: 5分钟)                             │
│  │    Cache    │                                                        │
│  └─────────────┘                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

数据来源表:
├── User (用户总数、新增用户、活跃用户)
├── Book (书籍总数、上架书籍数)
├── ReadingSession (阅读时长统计)
├── AIInteraction (AI调用统计)
├── Subscription (订阅用户数)
└── DailyStats (预聚合的每日统计)

操作类型: [R] 只读
数据影响: 无 (只读取，不修改任何数据)
权限要求: 所有角色可访问
```

| 指标 | 数据源表 | 查询类型 | 缓存策略 |
|------|----------|----------|----------|
| 总用户数 | `User` | COUNT | 5分钟 |
| 活跃用户(7天) | `User` | COUNT WHERE lastActiveAt > 7d | 5分钟 |
| 总书籍数 | `Book` | COUNT WHERE status=ACTIVE | 5分钟 |
| 今日阅读时长 | `ReadingSession` | SUM(duration) WHERE today | 1分钟 |
| 今日AI调用 | `AIInteraction` | COUNT WHERE today | 1分钟 |
| 今日新增用户 | `User` | COUNT WHERE createdAt=today | 1分钟 |

---

#### 3.3 书籍管理 (Books Management)

**数据流位置**: 核心内容管理层 (Core Content Management Layer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          书籍管理数据流                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    Dashboard 书籍管理页面                      │          │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │          │
│  │  │书籍列表 │ │创建书籍 │ │编辑书籍 │ │上架/下架│ │删除书籍 │ │          │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ │          │
│  └───────┼──────────┼──────────┼──────────┼──────────┼─────────┘          │
│          │          │          │          │          │                     │
│          │[R]       │[C]       │[U]       │[U]       │[D]                  │
│          ▼          ▼          ▼          ▼          ▼                     │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     Admin API (Admin Module)                     │       │
│  │                                                                  │       │
│  │  GET /books      POST /books   PUT /books/:id                   │       │
│  │  GET /books/:id                POST /books/:id/publish          │       │
│  │                                POST /books/:id/unpublish        │       │
│  │                                DELETE /books/:id                 │       │
│  └──────────────────────────┬──────────────────────────────────────┘       │
│                             │                                               │
│          ┌──────────────────┼──────────────────┐                           │
│          ▼                  ▼                  ▼                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │ PostgreSQL  │    │ Cloudflare  │    │    Redis    │                     │
│  │             │    │     R2      │    │   (Cache)   │                     │
│  │ ┌─────────┐ │    │             │    │             │                     │
│  │ │  Book   │ │    │ - EPUB文件  │    │ - 书籍列表  │                     │
│  │ │ Chapter │ │    │ - 封面图片  │    │ - 书籍详情  │                     │
│  │ │ Author  │ │    │ - 缩略图    │    │ - 热门书籍  │                     │
│  │ └─────────┘ │    │             │    │             │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**各操作数据影响详解**:

| 操作 | API | 影响的表 | 影响的缓存 | 副作用 |
|------|-----|----------|------------|--------|
| 查看列表 | `GET /books` | - | 读取缓存 | 无 |
| 查看详情 | `GET /books/:id` | - | 读取缓存 | 无 |
| 创建书籍 | `POST /books` | `Book`, `Chapter`, `BookCategory` | 清除列表缓存 | 触发EPUB解析Job |
| 编辑书籍 | `PUT /books/:id` | `Book`, `Chapter` | 清除详情+列表缓存 | 可能触发重新索引 |
| 上架 | `POST /books/:id/publish` | `Book.status` | 清除多处缓存 | 书籍对用户可见 |
| 下架 | `POST /books/:id/unpublish` | `Book.status` | 清除多处缓存 | 书籍对用户不可见 |
| 删除 | `DELETE /books/:id` | `Book`, `Chapter`, `BookCategory`, `BookListItem` | 清除所有相关缓存 | 级联删除关联数据 |

**数据影响矩阵**:

```
操作: 上架书籍 (POST /books/:id/publish)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

直接影响:
├── Book.status: INACTIVE → ACTIVE
├── Book.publishedAt: null → now()
└── Book.updatedAt: now()

缓存失效:
├── cache:book:{id}              (书籍详情)
├── cache:books:list:*           (所有书籍列表)
├── cache:category:{id}:books    (分类书籍)
└── cache:analytics:overview     (统计概览)

级联影响:
├── 用户搜索结果中出现该书籍
├── 分类页面显示该书籍
├── 榜单中该书籍变为可见
└── AI推荐池中加入该书籍
```

**权限要求**:

| 操作 | Super Admin | Content Manager | Operations | Viewer |
|------|-------------|-----------------|------------|--------|
| 查看列表 | ✅ | ✅ | ✅ | ✅ |
| 查看详情 | ✅ | ✅ | ✅ | ✅ |
| 创建书籍 | ✅ | ✅ | ❌ | ❌ |
| 编辑书籍 | ✅ | ✅ | ❌ | ❌ |
| 上架/下架 | ✅ | ✅ | ❌ | ❌ |
| 删除书籍 | ✅ | ❌ | ❌ | ❌ |

---

#### 3.4 榜单管理 (Booklist Management)

**数据流位置**: 内容编排层 (Content Curation Layer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          榜单管理数据流                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dashboard 榜单管理                                                          │
│       │                                                                     │
│       ├──[R] GET /booklists ─────────────────────────────┐                 │
│       ├──[C] POST /booklists ────────────────────────────┤                 │
│       ├──[U] PUT /booklists/:id ─────────────────────────┤                 │
│       ├──[U] POST /booklists/:id/publish ────────────────┤                 │
│       ├──[U] PUT /booklists/:id/items/reorder ───────────┤                 │
│       └──[D] DELETE /booklists/:id ──────────────────────┤                 │
│                                                          ▼                 │
│                                                   ┌─────────────┐          │
│                                                   │   Admin     │          │
│                                                   │   Module    │          │
│                                                   └──────┬──────┘          │
│                                                          │                 │
│                    ┌─────────────────────────────────────┼─────────────┐   │
│                    ▼                                     ▼             │   │
│             ┌─────────────┐                       ┌─────────────┐      │   │
│             │ PostgreSQL  │                       │    Redis    │      │   │
│             │             │                       │             │      │   │
│             │ ┌─────────┐ │                       │ 缓存Key:    │      │   │
│             │ │BookList │ │                       │ - booklists │      │   │
│             │ │BookList │ │                       │ - home:*    │      │   │
│             │ │  Item   │ │                       │ - discover  │      │   │
│             │ └─────────┘ │                       └─────────────┘      │   │
│             └─────────────┘                                            │   │
│                                                                        │   │
│  ┌────────────────────────────────────────────────────────────────┐   │   │
│  │                    客户端可见性影响                              │   │   │
│  │                                                                 │   │   │
│  │  榜单状态变更后，以下位置会受影响:                                │   │   │
│  │  ├── iOS App 首页推荐模块                                       │   │   │
│  │  ├── iOS App 发现页榜单区                                       │   │   │
│  │  ├── Web App 对应页面                                          │   │   │
│  │  └── API 响应结果                                               │   │   │
│  │                                                                 │   │   │
│  └────────────────────────────────────────────────────────────────┘   │   │
│                                                                        │   │
└────────────────────────────────────────────────────────────────────────┘   │
```

**榜单操作影响链**:

```
操作: 榜单上架 (POST /booklists/:id/publish)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 数据变更
   └── BookList.status: INACTIVE → ACTIVE

2. 缓存失效
   ├── cache:booklist:{id}
   ├── cache:booklists:active
   ├── cache:home:recommendations     (如果displayPosition包含HOME)
   └── cache:discover:booklists       (如果displayPosition包含DISCOVER)

3. 客户端影响
   ├── iOS App: 下次刷新首页/发现页时显示该榜单
   ├── Web App: 同上
   └── API: GET /booklists 返回结果包含该榜单

4. 业务影响
   └── 榜单内书籍曝光量增加 → 可能影响热门书籍统计
```

**权限要求**:

| 操作 | Super Admin | Content Manager | Operations | Viewer |
|------|-------------|-----------------|------------|--------|
| 查看榜单 | ✅ | ✅ | ✅ | ✅ |
| 创建榜单 | ✅ | ✅ | ❌ | ❌ |
| 编辑榜单 | ✅ | ✅ | ❌ | ❌ |
| 上架/下架 | ✅ | ✅ | ❌ | ❌ |
| 删除榜单 | ✅ | ❌ | ❌ | ❌ |
| 调整书籍排序 | ✅ | ✅ | ❌ | ❌ |

---

#### 3.5 用户管理 (User Management)

**数据流位置**: 用户数据查询层 (User Data Query Layer) - 以只读为主

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          用户管理数据流                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dashboard 用户管理                                                          │
│       │                                                                     │
│       ├──[R] GET /users ──────────────────────────────────┐                │
│       ├──[R] GET /users/:id ──────────────────────────────┤                │
│       ├──[R] GET /users/:id/reading-history ──────────────┤                │
│       ├──[R] GET /users/:id/vocabulary ───────────────────┤                │
│       └──[U] POST /users/:id/disable (受限) ──────────────┤                │
│                                                           ▼                │
│                                                    ┌─────────────┐         │
│                                                    │   Admin     │         │
│                                                    │   Module    │         │
│                                                    └──────┬──────┘         │
│                                                           │                │
│                                                           ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                        PostgreSQL                                │       │
│  │                                                                  │       │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │       │
│  │  │  User   │ │Subscrip │ │UserBook │ │Reading  │ │  User   │   │       │
│  │  │         │ │  tion   │ │         │ │ Session │ │Vocabulary│  │       │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │       │
│  │                                                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    数据可见性说明                                  │       │
│  │                                                                  │       │
│  │  ✅ Dashboard 可以看到:                                          │       │
│  │  ├── 用户基本信息 (头像、昵称、邮箱)                               │       │
│  │  ├── 学习统计 (阅读时长、词汇数、连续天数)                          │       │
│  │  ├── 订阅状态 (套餐类型、到期时间)                                  │       │
│  │  ├── 阅读历史 (书籍列表、进度)                                     │       │
│  │  └── 词汇本 (词汇数量、学习状态分布)                               │       │
│  │                                                                  │       │
│  │  ❌ Dashboard 不能看到:                                          │       │
│  │  ├── 用户密码 (不存储明文)                                        │       │
│  │  ├── OAuth Token (安全考虑)                                      │       │
│  │  ├── 支付凭证原文 (IAP Receipt)                                  │       │
│  │  └── 用户聊天/笔记内容 (隐私保护)                                  │       │
│  │                                                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**用户管理操作影响**:

| 操作 | 影响的表 | 影响范围 | 可逆性 |
|------|----------|----------|--------|
| 查看用户 | - | 无影响 | - |
| 禁用账号 | `User.status` | 用户无法登录 | ✅ 可恢复 |
| 调整订阅 | `Subscription` | 用户权益变更 | ✅ 可撤销 |
| 重置数据 | 多表 | 用户学习数据清空 | ❌ 不可逆 |

**与 accountId 的关联 (跨系统关联)**:

```
用户查询场景: 通过 accountId 关联所有系统数据
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

输入: accountId = r01HV6BGKCPG3M8QDJX9Y7CJ5ZA

Dashboard 查询链:
├── PostgreSQL: SELECT * FROM users WHERE id = {accountId}
├── ELK Logs: accountId:{accountId} AND level:error
├── Sentry: user.id:{accountId}
├── Analytics: user_events WHERE account_id = {accountId}
└── Billing: transactions WHERE account_id = {accountId}

输出: 该用户的完整画像
├── 基本信息 (Profile)
├── 订阅信息 (Subscription)
├── 阅读数据 (Reading Stats)
├── 错误日志 (Error Logs)
├── 崩溃记录 (Crash Reports)
└── 账单记录 (Billing History)
```

---

#### 3.6 AI 服务监控 (AI Service Monitoring)

**数据流位置**: 监控与分析层 (Monitoring & Analytics Layer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI 服务监控数据流                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dashboard AI监控                                                           │
│       │                                                                     │
│       ├──[R] GET /ai/stats ───────────────────────────────┐                │
│       ├──[R] GET /ai/usage ───────────────────────────────┤                │
│       ├──[R] GET /ai/config ──────────────────────────────┤                │
│       └──[U] PUT /ai/config (Super Admin only) ───────────┤                │
│                                                           ▼                │
│                                                    ┌─────────────┐         │
│                                                    │   Admin     │         │
│                                                    │   Module    │         │
│                                                    └──────┬──────┘         │
│                          ┌────────────────────────────────┼─────────┐      │
│                          ▼                                ▼         │      │
│                   ┌─────────────┐                  ┌─────────────┐  │      │
│                   │ PostgreSQL  │                  │   Redis     │  │      │
│                   │             │                  │             │  │      │
│                   │ AIInteract  │                  │ AI Config   │  │      │
│                   │   ion       │                  │ Rate Limit  │  │      │
│                   └─────────────┘                  └─────────────┘  │      │
│                                                                     │      │
│  ┌──────────────────────────────────────────────────────────────┐  │      │
│  │                    AI 服务调用流程                             │  │      │
│  │                                                               │  │      │
│  │  Client App                                                   │  │      │
│  │      │                                                        │  │      │
│  │      │ AI请求 (查词/翻译/问答)                                  │  │      │
│  │      ▼                                                        │  │      │
│  │  ┌─────────────┐                                              │  │      │
│  │  │    API      │                                              │  │      │
│  │  │  Gateway    │                                              │  │      │
│  │  └──────┬──────┘                                              │  │      │
│  │         │                                                     │  │      │
│  │         ▼                                                     │  │      │
│  │  ┌─────────────┐     ┌─────────────┐                         │  │      │
│  │  │    AI       │────▶│  DeepSeek   │                         │  │      │
│  │  │   Module    │     │   OpenAI    │                         │  │      │
│  │  │             │────▶│  Anthropic  │                         │  │      │
│  │  └──────┬──────┘     └─────────────┘                         │  │      │
│  │         │                                                     │  │      │
│  │         ▼ 记录                                                │  │      │
│  │  ┌─────────────┐                                              │  │      │
│  │  │AIInteraction│ ◀─── Dashboard 统计来源                      │  │      │
│  │  │   Table     │                                              │  │      │
│  │  └─────────────┘                                              │  │      │
│  │                                                               │  │      │
│  └──────────────────────────────────────────────────────────────┘  │      │
│                                                                     │      │
└─────────────────────────────────────────────────────────────────────┘      │
```

**AI 配置修改影响**:

```
操作: 修改 AI 路由配置 (PUT /ai/config)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

配置项示例:
{
  "routing": {
    "WORD_EXPLAIN": {
      "primary": { "provider": "deepseek", "model": "deepseek-chat" },
      "fallback": { "provider": "openai", "model": "gpt-4o-mini" }
    }
  },
  "limits": {
    "freeUserDailyLimit": 50,
    "proUserDailyLimit": 500
  }
}

影响范围:
├── 立即生效 (Redis Config 更新)
├── 所有新的 AI 请求使用新配置
├── 不影响正在进行的请求
└── 可能影响成本 (不同模型价格不同)

风险控制:
├── 仅 Super Admin 可操作
├── 配置变更记录到操作日志
└── 支持快速回滚
```

**权限要求**:

| 操作 | Super Admin | Content Manager | Operations | Viewer |
|------|-------------|-----------------|------------|--------|
| 查看统计 | ✅ | ✅ | ✅ | ✅ |
| 查看配置 | ✅ | ✅ | ✅ | ❌ |
| 修改配置 | ✅ | ❌ | ❌ | ❌ |

---

#### 3.7 订阅管理 (Subscription Management)

**数据流位置**: 业务运营层 (Business Operations Layer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         订阅管理数据流                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     订阅生命周期                                  │       │
│  │                                                                  │       │
│  │  用户侧 (iOS App)                    Dashboard 侧                │       │
│  │                                                                  │       │
│  │  ┌─────────┐                                                    │       │
│  │  │ 用户    │                                                    │       │
│  │  │ 购买    │                                                    │       │
│  │  └────┬────┘                                                    │       │
│  │       │                                                          │       │
│  │       ▼ IAP Receipt                                             │       │
│  │  ┌─────────┐      验证       ┌─────────┐                        │       │
│  │  │  App    │ ───────────────▶│  Apple  │                        │       │
│  │  │ Store   │                 │ Server  │                        │       │
│  │  │ Server  │ ◀───────────────│         │                        │       │
│  │  └────┬────┘      结果       └─────────┘                        │       │
│  │       │                                                          │       │
│  │       ▼ Webhook                                                  │       │
│  │  ┌─────────────┐                                                │       │
│  │  │   Backend   │                                                │       │
│  │  │ Subscription│                                                │       │
│  │  │   Module    │                                                │       │
│  │  └──────┬──────┘                                                │       │
│  │         │                                                        │       │
│  │         ▼ 写入                                                   │       │
│  │  ┌─────────────┐                           ┌─────────────┐      │       │
│  │  │ Subscription│ ◀─────────── 查询 ─────── │  Dashboard  │      │       │
│  │  │    Table    │                           │  订阅管理    │      │       │
│  │  └─────────────┘             (只读为主)     └─────────────┘      │       │
│  │                                                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Dashboard 可执行的操作 (受限):                                               │
│  ├── [R] 查看订阅列表和详情                                                  │
│  ├── [U] 延长订阅时间 (特殊情况，需审批)                                       │
│  ├── [U] 调整套餐 (升级/降级，不涉及退款)                                      │
│  └── [R] 查看订阅变更历史                                                    │
│                                                                             │
│  Dashboard 不能执行的操作:                                                    │
│  ├── 直接退款 (需通过 App Store Connect)                                     │
│  ├── 修改支付记录 (财务数据不可篡改)                                           │
│  └── 删除订阅记录 (审计要求)                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

#### 3.8 数据分析 (Analytics)

**数据流位置**: 数据聚合与可视化层 (Data Aggregation & Visualization Layer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         数据分析系统架构                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                            Dashboard Analytics                              │
│                                   │                                         │
│       ┌───────────────────────────┼───────────────────────────┐            │
│       ▼                           ▼                           ▼            │
│  ┌─────────┐               ┌─────────┐               ┌─────────┐           │
│  │用户分析 │               │阅读分析 │               │收入分析 │           │
│  └────┬────┘               └────┬────┘               └────┬────┘           │
│       │                         │                         │                │
│       ▼                         ▼                         ▼                │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                      Analytics Module                            │       │
│  │                                                                  │       │
│  │  数据来源:                                                        │       │
│  │  ├── 实时查询: PostgreSQL 聚合查询                                 │       │
│  │  ├── 预计算: DailyStats 表 (每日定时任务生成)                       │       │
│  │  └── 缓存: Redis (热点数据，TTL: 5-60分钟)                         │       │
│  │                                                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                   │                                         │
│       ┌───────────────────────────┼───────────────────────────┐            │
│       ▼                           ▼                           ▼            │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐       │
│  │ PostgreSQL  │           │    Redis    │           │    Jobs     │       │
│  │             │           │   (Cache)   │           │  (定时任务)  │       │
│  │ ┌─────────┐ │           │             │           │             │       │
│  │ │DailyStats│ │           │ analytics:* │           │ 每日凌晨    │       │
│  │ │User     │ │           │             │           │ 统计聚合    │       │
│  │ │Reading  │ │           │             │           │             │       │
│  │ │Session  │ │           │             │           │             │       │
│  │ └─────────┘ │           └─────────────┘           └─────────────┘       │
│  └─────────────┘                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

数据分析模块详情:

┌─────────────────────────────────────────────────────────────────────────────┐
│ 模块            │ 数据源                    │ 查询方式    │ 更新频率       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 用户增长趋势    │ DailyStats.newUsers       │ 预计算查询  │ 每日           │
│ DAU/MAU        │ DailyStats.activeUsers     │ 预计算查询  │ 每日           │
│ 用户留存       │ User + ReadingSession      │ 实时聚合    │ 请求时计算     │
│ 阅读时长       │ DailyStats.totalReading    │ 预计算查询  │ 每日           │
│ 热门书籍       │ ReadingSession + UserBook  │ 实时聚合    │ 缓存5分钟      │
│ AI使用量       │ AIInteraction              │ 实时聚合    │ 缓存1分钟      │
│ 收入统计       │ Subscription               │ 实时聚合    │ 缓存1小时      │
│ 转化漏斗       │ 多表关联                   │ 实时聚合    │ 请求时计算     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. 完整功能数据流汇总表

| 功能模块 | 操作类型 | 影响的数据表 | 缓存影响 | 客户端影响 | 权限等级 |
|----------|----------|--------------|----------|------------|----------|
| **首页仪表盘** | R | - | 读取 | - | All |
| **书籍-列表** | R | - | 读取 | - | All |
| **书籍-创建** | C | Book, Chapter, BookCategory | 清除列表 | 新书可搜索 | Content+ |
| **书籍-编辑** | U | Book, Chapter | 清除详情+列表 | 内容更新 | Content+ |
| **书籍-上架** | U | Book.status | 多处清除 | 书籍可见 | Content+ |
| **书籍-下架** | U | Book.status | 多处清除 | 书籍隐藏 | Content+ |
| **书籍-删除** | D | Book, Chapter, 关联表 | 全部清除 | 书籍消失 | Super |
| **榜单-列表** | R | - | 读取 | - | All |
| **榜单-创建** | C | BookList, BookListItem | 清除列表 | - | Content+ |
| **榜单-上架** | U | BookList.status | 首页/发现页 | 榜单显示 | Content+ |
| **榜单-排序** | U | BookListItem.sortOrder | 清除榜单 | 排序变化 | Content+ |
| **用户-查看** | R | - | - | - | Ops+ |
| **用户-禁用** | U | User.status | 清除用户缓存 | 无法登录 | Super |
| **AI-统计** | R | - | 读取 | - | All |
| **AI-配置** | U | Redis Config | 立即生效 | AI行为变化 | Super |
| **订阅-查看** | R | - | - | - | Ops+ |
| **订阅-调整** | U | Subscription | 用户缓存 | 权益变化 | Super |
| **分析-所有** | R | 多表聚合 | 读取 | - | All |
| **设置-管理员** | CUD | AdminUser | - | - | Super |
| **设置-系统** | U | SystemConfig (Redis) | 立即生效 | 全局影响 | Super |

---

### 5. 数据安全与审计

#### 5.1 操作日志设计

```typescript
interface AdminOperationLog {
  id: string;

  // 操作人
  adminId: string;
  adminName: string;
  adminRole: AdminRole;

  // 操作信息
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'CONFIG_CHANGE';
  resourceType: 'BOOK' | 'BOOKLIST' | 'USER' | 'SUBSCRIPTION' | 'AI_CONFIG' | 'SYSTEM';
  resourceId: string;
  resourceName: string;

  // 变更详情
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  // 请求信息
  ipAddress: string;
  userAgent: string;
  requestId: string;

  // 时间
  createdAt: Date;
}
```

#### 5.2 敏感操作审批流程

```
高风险操作列表:
├── 批量删除书籍 (>10本)
├── 修改 AI 限额配置
├── 调整用户订阅 (涉及金额)
├── 禁用用户账号
└── 修改系统核心配置

审批流程:
1. 操作者发起请求
2. 系统生成审批单
3. Super Admin 审批
4. 审批通过后执行
5. 记录完整操作日志
```

#### 5.3 数据备份与恢复

```
Dashboard 相关数据备份策略:

实时备份 (Streaming):
└── PostgreSQL WAL 日志 → 异地存储

定期备份:
├── 每日全量备份 (凌晨3点)
├── 每小时增量备份
└── 保留周期: 30天

恢复能力:
├── 任意时间点恢复 (PITR)
├── 单表恢复
└── 误删数据恢复 (软删除30天内)
```

---

### 6. 跨系统关联设计 (Cross-System Correlation)

Dashboard 作为运营中心，需要关联多个子系统的数据。核心关联字段是 `accountId`。

#### 6.1 accountId 跨系统关联架构

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        accountId 跨系统关联架构                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│                            accountId: r01HV6BGKCPG3M8QDJX9Y7CJ5ZA                   │
│                                          │                                          │
│         ┌────────────────────────────────┼────────────────────────────────┐        │
│         │                                │                                │        │
│         ▼                                ▼                                ▼        │
│  ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐   │
│  │ PostgreSQL  │                 │   Sentry    │                 │    ELK      │   │
│  │  (业务数据)  │                 │  (错误追踪)  │                 │   (日志)    │   │
│  └──────┬──────┘                 └──────┬──────┘                 └──────┬──────┘   │
│         │                               │                               │          │
│         │                               │                               │          │
│  ┌──────┴──────┐                 ┌──────┴──────┐                 ┌──────┴──────┐   │
│  │ 可查询数据   │                 │ 可查询数据   │                 │ 可查询数据   │   │
│  │             │                 │             │                 │             │   │
│  │ • User      │                 │ • Crashes   │                 │ • API Logs  │   │
│  │ • Subscript │                 │ • Errors    │                 │ • BE Logs   │   │
│  │ • Reading   │                 │ • Sessions  │                 │ • FE Logs   │   │
│  │ • Vocabulary│                 │ • Breadcrumb│                 │ • Client    │   │
│  │ • AI Usage  │                 │             │                 │   Logs      │   │
│  └─────────────┘                 └─────────────┘                 └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                        Dashboard 统一查询入口                                 │   │
│  │                                                                              │   │
│  │  输入: accountId                                                             │   │
│  │                                                                              │   │
│  │  输出:                                                                       │   │
│  │  ├── 用户画像 (Profile, Subscription, Stats)                                 │   │
│  │  ├── 行为数据 (Reading History, Vocabulary, AI Interactions)                │   │
│  │  ├── 问题诊断 (Errors, Crashes, Logs)                                       │   │
│  │  └── 账单信息 (Transactions, Receipts)                                      │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### 6.2 各系统 accountId 集成方式

| 系统 | 集成方式 | 查询示例 | Dashboard 展示 |
|------|----------|----------|----------------|
| **PostgreSQL** | User.id = accountId | `SELECT * FROM users WHERE id = ?` | 用户详情页 |
| **Sentry** | User Context | `user.id:{accountId}` | 错误列表Tab |
| **ELK** | Log Field | `accountId:{accountId}` | 日志查看器 |
| **Analytics** | Event Property | `account_id = ?` | 行为分析Tab |
| **Billing** | Transaction Field | `account_id = ?` | 账单Tab |

#### 6.3 用户详情页数据聚合

```typescript
// Dashboard 用户详情页数据结构
interface UserDetailView {
  // 基础信息 (PostgreSQL)
  profile: {
    id: string;                    // accountId
    displayName: string;
    email: string;
    avatarUrl: string;
    englishLevel: string;
    createdAt: Date;
    lastActiveAt: Date;
  };

  // 订阅信息 (PostgreSQL)
  subscription: {
    planType: 'FREE' | 'PRO' | 'PREMIUM';
    status: string;
    expiresAt: Date;
    originalTransactionId: string;
  };

  // 学习统计 (PostgreSQL - 聚合)
  stats: {
    totalReadingMinutes: number;
    totalBooksRead: number;
    totalVocabulary: number;
    currentStreak: number;
    aiCallsToday: number;
    aiCallsTotal: number;
  };

  // 阅读历史 (PostgreSQL)
  readingHistory: {
    currentBooks: UserBook[];
    completedBooks: UserBook[];
    recentSessions: ReadingSession[];
  };

  // 词汇统计 (PostgreSQL)
  vocabularyStats: {
    total: number;
    byStatus: {
      NEW: number;
      LEARNING: number;
      MASTERED: number;
    };
    recentWords: UserVocabulary[];
  };

  // 错误记录 (Sentry API)
  errors: {
    recentCrashes: SentryIssue[];
    totalCrashCount: number;
    lastCrashAt: Date;
  };

  // 操作日志 (ELK API)
  logs: {
    recentApiCalls: LogEntry[];
    recentErrors: LogEntry[];
  };

  // 账单记录 (PostgreSQL)
  billing: {
    transactions: Transaction[];
    totalSpent: number;
  };
}
```

#### 6.4 问题排查数据流

```
用户反馈问题排查流程:
━━━━━━━━━━━━━━━━━━━━━━━

1. 用户提交工单，包含 accountId
   │
   ▼
2. Dashboard 客服页面
   │
   ├── 自动加载用户画像 (PostgreSQL)
   │   └── 基本信息、订阅状态、学习数据
   │
   ├── 自动加载错误记录 (Sentry)
   │   └── 最近崩溃、异常堆栈
   │
   ├── 自动加载操作日志 (ELK)
   │   └── API调用记录、客户端日志
   │
   └── 聚合展示
       │
       ▼
3. 客服/技术人员分析
   │
   ├── 查看用户状态 → 判断是否账号问题
   ├── 查看订阅状态 → 判断是否权益问题
   ├── 查看错误日志 → 定位技术问题
   └── 查看操作日志 → 复现用户操作
   │
   ▼
4. 问题定位与处理
   │
   ├── 简单问题: 直接在 Dashboard 处理
   │   └── 调整订阅、重置数据等
   │
   └── 复杂问题: 创建技术工单
       └── 附带完整诊断信息
```

---

### 7. 客服工单系统数据流

#### 7.1 工单系统架构

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           客服工单系统数据流                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                          │
│  │   iOS App   │     │  Dashboard  │     │   Email     │                          │
│  │  (用户提交)  │     │ (客服处理)  │     │  (通知)     │                          │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                          │
│         │                   │                   │                                  │
│         ▼                   ▼                   ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐       │
│  │                         Backend API                                      │       │
│  │                                                                          │       │
│  │  POST /support/tickets              (用户创建工单)                        │       │
│  │  GET  /admin/support/tickets        (客服查看列表)                        │       │
│  │  GET  /admin/support/tickets/:id    (客服查看详情)                        │       │
│  │  PUT  /admin/support/tickets/:id    (客服更新工单)                        │       │
│  │  POST /admin/support/tickets/:id/reply (客服回复)                        │       │
│  │                                                                          │       │
│  └──────────────────────────┬───────────────────────────────────────────────┘       │
│                             │                                                       │
│                             ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐       │
│  │                        PostgreSQL                                        │       │
│  │                                                                          │       │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │       │
│  │  │ SupportTicket │  │ TicketMessage │  │ TicketAttach  │               │       │
│  │  │               │  │               │  │    ment       │               │       │
│  │  │ • id          │  │ • ticketId    │  │ • messageId   │               │       │
│  │  │ • accountId   │  │ • senderId    │  │ • fileUrl     │               │       │
│  │  │ • category    │  │ • content     │  │ • fileType    │               │       │
│  │  │ • priority    │  │ • isFromUser  │  │               │               │       │
│  │  │ • status      │  │ • createdAt   │  │               │               │       │
│  │  │ • assigneeId  │  │               │  │               │               │       │
│  │  └───────────────┘  └───────────────┘  └───────────────┘               │       │
│  │                                                                          │       │
│  └─────────────────────────────────────────────────────────────────────────┘       │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### 7.2 工单与用户数据关联

```
工单详情页数据聚合:
━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│                     工单详情页面布局                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │     工单信息          │  │         用户信息侧边栏           ││
│  │                      │  │                                  ││
│  │  工单号: #12345      │  │  accountId: r01HV6...           ││
│  │  状态: 处理中        │  │                                  ││
│  │  优先级: 高          │  │  ┌─────────────────────────────┐ ││
│  │  分类: 订阅问题      │  │  │ 用户画像                     │ ││
│  │  创建: 2024-01-15    │  │  │ 头像 用户名                  │ ││
│  │  负责人: 客服A       │  │  │ 会员: PRO                    │ ││
│  │                      │  │  │ 注册: 30天前                 │ ││
│  │  ────────────────    │  │  └─────────────────────────────┘ ││
│  │                      │  │                                  ││
│  │  对话记录:           │  │  ┌─────────────────────────────┐ ││
│  │                      │  │  │ 学习统计                     │ ││
│  │  [用户] 我的会员...  │  │  │ 阅读: 1234分钟              │ ││
│  │  [客服] 您好，我...  │  │  │ 词汇: 567个                  │ ││
│  │  [用户] 好的，谢谢   │  │  │ 连续: 15天                   │ ││
│  │                      │  │  └─────────────────────────────┘ ││
│  │  ────────────────    │  │                                  ││
│  │                      │  │  ┌─────────────────────────────┐ ││
│  │  [回复输入框]        │  │  │ 最近错误 (Sentry)            │ ││
│  │                      │  │  │ • 1小时前: NetworkError     │ ││
│  │                      │  │  │ • 2天前: CrashReport        │ ││
│  │                      │  │  └─────────────────────────────┘ ││
│  │                      │  │                                  ││
│  └──────────────────────┘  │  ┌─────────────────────────────┐ ││
│                            │  │ 操作按钮                     │ ││
│                            │  │ [查看完整日志] [调整订阅]    │ ││
│                            │  └─────────────────────────────┘ ││
│                            └──────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8. Dashboard 功能与数据流速查表

| 功能 | 数据流层级 | 主要数据源 | 写操作目标 | 缓存策略 | 跨系统关联 |
|------|-----------|-----------|------------|----------|-----------|
| 首页概览 | 只读聚合 | DailyStats, 多表COUNT | - | Redis 5min | - |
| 书籍列表 | 内容管理 | Book | - | Redis 5min | - |
| 书籍创建 | 内容管理 | - | Book, Chapter | 清除列表 | R2 (文件) |
| 书籍上架 | 内容管理 | - | Book.status | 清除多处 | 客户端可见性 |
| 榜单管理 | 内容编排 | BookList | BookList, Item | 清除首页/发现 | 客户端显示 |
| 用户查看 | 用户数据 | User, Subscription | - | - | Sentry, ELK |
| 用户禁用 | 用户数据 | - | User.status | 清除用户 | 登录系统 |
| AI统计 | 监控分析 | AIInteraction | - | Redis 1min | - |
| AI配置 | 系统配置 | Redis | Redis | 立即生效 | AI服务 |
| 订阅查看 | 业务运营 | Subscription | - | - | App Store |
| 数据分析 | 数据聚合 | 多表聚合 | - | Redis 5-60min | - |
| 客服工单 | 用户服务 | SupportTicket | SupportTicket | - | Sentry, ELK |
| 系统设置 | 系统配置 | Redis, AdminUser | 同左 | 立即生效 | - |
| 操作日志 | 审计 | AdminOperationLog | 自动写入 | - | - |

---

## 附录

### A. 环境变量

```env
# Dashboard环境变量 (.env)
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Readmigo Dashboard
```

### B. 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

### C. 参考文档

- [React Admin 官方文档](https://marmelab.com/react-admin/documentation.html)
- [Material UI 组件库](https://mui.com/material-ui/)
- [Recharts 图表库](https://recharts.org/)
