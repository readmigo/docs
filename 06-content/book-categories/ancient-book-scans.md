# 高清古籍影印模块设计

## 1. 概述

### 1.1 目标
创建独立的古籍影印阅读模块，以高清图片形式展示古籍原貌，保留原书的版式、字体、批注等历史价值。

### 1.2 与现有文本阅读的区别

| 特性 | 文本阅读 | 古籍影印 |
|------|----------|----------|
| 内容形式 | 纯文字 | 高清图片 |
| 交互方式 | 选词查词、标注 | 缩放、翻页 |
| 适用场景 | 语言学习 | 鉴赏、研究 |
| 数据来源 | 维基文库、Gutenberg | 书格、国图、哈佛燕京 |
| 存储需求 | 文本 (~1MB/书) | 图片 (~100-500MB/书) |

---

## 2. 数据模型设计

### 2.1 新增 ScanBook 表

```prisma
model ScanBook {
  id              String    @id @default(uuid())

  // 基本信息
  title           String                    // 书名
  titleOriginal   String?                   // 原题名（古籍封面题名）
  author          String?                   // 作者
  dynasty         String?                   // 朝代
  publishYear     String?                   // 刊刻年代

  // 分类
  category        String                    // 分类：经/史/子/集
  subjects        String[]                  // 主题标签

  // 描述
  description     String?                   // 简介
  colophon        String?                   // 版本信息/牌记

  // 图片资源
  coverUrl        String?                   // 封面图
  thumbUrl        String?                   // 缩略图
  pageCount       Int       @default(0)     // 总页数

  // 来源
  source          ScanSource                // 来源平台
  sourceId        String?                   // 来源ID
  sourceUrl       String?                   // 原始链接
  license         String?                   // 版权/许可

  // 状态
  status          BookStatus @default(PENDING)

  // 时间戳
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // 关联
  pages           ScanPage[]

  @@unique([source, sourceId])
  @@index([dynasty])
  @@index([category])
}

model ScanPage {
  id              String    @id @default(uuid())

  bookId          String
  book            ScanBook  @relation(fields: [bookId], references: [id], onDelete: Cascade)

  pageNumber      Int                       // 页码
  imageUrl        String                    // 原图 URL
  thumbUrl        String?                   // 缩略图 URL

  // 图片尺寸
  width           Int?
  height          Int?

  // OCR 文本（可选，用于搜索）
  ocrText         String?

  @@unique([bookId, pageNumber])
  @@index([bookId])
}

enum ScanSource {
  SHUGE           // 书格 (shuge.org)
  NLC             // 国家图书馆
  HARVARD_YENCHING // 哈佛燕京图书馆
  WASEDA          // 早稻田大学
  INTERNET_ARCHIVE // Internet Archive
}
```

---

## 3. 数据来源

### 3.1 推荐来源：书格 (shuge.org)

书格是优质的古籍影印资源站，特点：
- 高清扫描（300+ DPI）
- 公有领域，无版权问题
- 分类清晰，元数据完整
- 支持批量下载

### 3.2 首批 10 本示例书籍

| 序号 | 书名 | 朝代 | 分类 | 页数 | 来源 |
|------|------|------|------|------|------|
| 1 | 芥子园画传 | 清 | 艺术 | ~200 | 书格 |
| 2 | 三才图会 | 明 | 类书 | ~300 | 书格 |
| 3 | 本草纲目 | 明 | 医学 | ~400 | 书格 |
| 4 | 天工开物 | 明 | 工艺 | ~150 | 书格 |
| 5 | 永乐大典残卷 | 明 | 类书 | ~100 | 书格 |
| 6 | 十竹斋书画谱 | 明 | 艺术 | ~180 | 书格 |
| 7 | 海错图 | 清 | 博物 | ~60 | 书格 |
| 8 | 山海经图说 | 清 | 神话 | ~80 | 书格 |
| 9 | 点石斋画报 | 清 | 画报 | ~200 | 书格 |
| 10 | 营造法式 | 宋 | 建筑 | ~150 | 书格 |

---

## 4. UI/UX 设计

### 4.1 浏览页面

```
┌─────────────────────────────────────────────────┐
│  古籍影印                          [筛选] [搜索]│
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  [封面]  │ │  [封面]  │ │  [封面]  │           │
│  │         │ │         │ │         │           │
│  │芥子园画传│ │ 三才图会 │ │ 本草纲目 │           │
│  │  清代   │ │  明代   │ │  明代   │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  [封面]  │ │  [封面]  │ │  [封面]  │           │
│  │         │ │         │ │         │           │
│  │ 天工开物 │ │十竹斋画谱│ │  海错图  │           │
│  │  明代   │ │  明代   │ │  清代   │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 阅读器界面

```
┌─────────────────────────────────────────────────┐
│ ← 芥子园画传                    1/200   ⋮      │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│         ┌───────────────────────┐              │
│         │                       │              │
│         │                       │              │
│         │    [高清古籍页面]      │              │
│         │                       │              │
│         │                       │              │
│         │                       │              │
│         └───────────────────────┘              │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│     ◀◀      ◀     ●●●●○○○○○○      ▶     ▶▶     │
│                   页面导航                      │
└─────────────────────────────────────────────────┘

手势操作：
- 左右滑动: 翻页
- 双指缩放: 放大/缩小
- 双击: 100%/适应屏幕切换
- 长按: 保存图片
```

### 4.3 筛选器

```
┌─────────────────────────────────────────────────┐
│ 筛选                                      [重置]│
├─────────────────────────────────────────────────┤
│                                                 │
│ 朝代                                            │
│ [宋] [元] [明] [清] [民国]                      │
│                                                 │
│ 分类                                            │
│ [经部] [史部] [子部] [集部] [艺术] [科技]       │
│                                                 │
│ 来源                                            │
│ [书格] [国图] [哈佛燕京]                        │
│                                                 │
│                              [应用筛选]         │
└─────────────────────────────────────────────────┘
```

---

## 5. 技术实现

### 5.1 图片存储策略

```
R2 存储结构：
scans/
├── {source}/
│   └── {book-id}/
│       ├── cover.jpg          # 封面
│       ├── thumb.jpg          # 列表缩略图
│       └── pages/
│           ├── 001.jpg        # 原图
│           ├── 001_thumb.jpg  # 页面缩略图
│           ├── 002.jpg
│           └── ...
```

### 5.2 图片优化

| 类型 | 尺寸 | 格式 | 用途 |
|------|------|------|------|
| 原图 | 原始尺寸 | JPEG 90% | 放大查看 |
| 阅读图 | 1200px 宽 | JPEG 80% | 正常阅读 |
| 缩略图 | 300px 宽 | JPEG 60% | 页面导航 |
| 封面 | 400px 宽 | JPEG 80% | 书籍列表 |

### 5.3 性能优化

1. **懒加载**: 只加载可视区域 ±2 页
2. **预加载**: 用户翻页时预加载下一页
3. **缓存**: 使用 Kingfisher 缓存已查看页面
4. **渐进加载**: 先显示缩略图，再加载高清图

---

## 6. API 设计

### 6.1 书籍列表

```typescript
GET /api/v1/scan-books
Query: {
  dynasty?: string;
  category?: string;
  source?: ScanSource;
  page?: number;
  limit?: number;
}

Response: {
  items: ScanBook[];
  total: number;
  page: number;
  totalPages: number;
}
```

### 6.2 书籍详情

```typescript
GET /api/v1/scan-books/:id

Response: {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  description: string;
  pageCount: number;
  coverUrl: string;
  pages: {
    pageNumber: number;
    thumbUrl: string;
  }[];
}
```

### 6.3 页面图片

```typescript
GET /api/v1/scan-books/:id/pages/:pageNumber

Response: {
  pageNumber: number;
  imageUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  prevPage: number | null;
  nextPage: number | null;
}
```

---

## 7. 实施计划

### Phase 1: 数据层 (1天)
- [ ] 创建 Prisma schema
- [ ] 数据库迁移
- [ ] 创建书格爬虫脚本
- [ ] 导入 10 本示例书籍

### Phase 2: 后端 API (1天)
- [ ] 实现书籍列表 API
- [ ] 实现书籍详情 API
- [ ] 实现页面图片 API
- [ ] 添加筛选和分页

### Phase 3: iOS 客户端 (2-3天)
- [ ] 创建古籍浏览页面
- [ ] 实现图片阅读器
- [ ] 添加手势操作
- [ ] 实现页面导航
- [ ] 性能优化

---

## 8. 开放问题

### 8.1 是否需要 OCR？
- **选项 A**: 不需要，纯图片浏览
- **选项 B**: 可选，用于全文搜索
- **建议**: Phase 1 不需要，后续可添加

### 8.2 离线阅读？
- **选项 A**: 仅在线
- **选项 B**: 支持下载整本
- **建议**: Phase 1 在线，后续添加下载

### 8.3 与文本阅读模块的关系？
- **选项 A**: 完全独立的 Tab/入口
- **选项 B**: 同一书籍提供两种阅读模式
- **建议**: 独立入口，作为"古籍鉴赏"功能

---

## 9. 决策检查清单

请确认以下决策：

- [ ] **数据模型**: ScanBook/ScanPage 设计是否合适？
- [ ] **示例书籍**: 10 本书的选择是否合适？
- [ ] **UI 设计**: 浏览页和阅读器布局是否满足需求？
- [ ] **图片策略**: 多分辨率策略是否合理？
- [ ] **入口位置**: 独立 Tab 还是子功能？

---

*文档版本: v1.0*
*创建日期: 2025-12-20*
