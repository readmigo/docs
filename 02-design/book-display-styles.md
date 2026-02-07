# Discover Tab Book Display Styles Design

## Overview

This document defines the standardized book cover display styles for the iOS Discover tab. Each style has fixed dimensions and specific display elements to ensure visual consistency across the app.

## Problem Statement

Current issues:
1. Book cover dimensions are inconsistent across different sections
2. Grid layouts (3 books per row) have variable cover sizes depending on content
3. No clear mapping between list types and display styles
4. Display elements (title, author, difficulty badge, etc.) vary inconsistently

## Design Principles

1. **Fixed Dimensions**: Each style has exact pixel dimensions for covers
2. **Aspect Ratio**: All book covers maintain 2:3 aspect ratio (standard book proportion)
3. **Style-Data Binding**: Each `BookListType` maps to a specific display style
4. **Consistent Elements**: Each style defines which metadata elements to show

---

## Display Styles

### Style 0: `featuredBanner` - Full-Width Featured Banner

**Use Case**: Spotlight book, daily pick, special promotion, new release highlight

**Dimensions**:
| Element | Size |
|---------|------|
| Banner Width | Full screen width (100%) |
| Banner Height | 200pt |
| Cover Width | 100pt |
| Cover Height | 150pt |

**Layout**: Horizontal - cover on left, content on right

**Display Elements**:
- Book cover (left side, with shadow)
- Featured tag/badge (e.g., "Today's Pick", "New Release", "Staff Favorite")
- Title (large, 2 lines max)
- Author name
- Short description (2 lines max)
- Difficulty badge
- CTA button ("Read Now" or "Add to Library")

**Visual Style**:
- Full-width card with gradient background
- Background: Dynamic gradient based on cover dominant color, or themed gradient
- Shadow: `radius: 12, opacity: 0.2`
- Corner radius: 16pt
- Cover shadow: `radius: 8, opacity: 0.3`
- Padding: 20pt all sides

**Bound to BookListType**:
- Special promotion (manually curated)
- Daily pick feature
- New release spotlight

**ASCII Layout**:

---

### Style 1: `heroCarousel` - Hero Banner Style

**Use Case**: Main featured promotion, AI personalized recommendations

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 140pt |
| Cover Height | 210pt |
| Card Total Width | 280pt |
| Card Total Height | 260pt |

**Display Elements**:
- Book cover (large)
- Title (2 lines max)
- Author name
- Difficulty badge
- Rating stars (if available)
- "AI Recommended" tag (if applicable)

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 8, opacity: 0.15`
- Corner radius: 12pt
- Spacing between cards: 20pt
- Background: subtle gradient overlay on cover

**Bound to BookListType**:
- `personalized` (For You)
- `aiFeatured` (AI Featured)
- `aiRecommended` (AI Recommended)

**ASCII Layout**:

---

### Style 2: `standardCarousel` - Standard Horizontal Scroll

**Use Case**: Editor's picks, curated lists, recommendations

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 100pt |
| Cover Height | 150pt |
| Card Total Width | 100pt |
| Card Total Height | 200pt |

**Display Elements**:
- Book cover
- Title (2 lines max)
- Author name (1 line)

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 4, opacity: 0.1`
- Corner radius: 8pt
- Spacing between cards: 12pt

**Bound to BookListType**:
- `editorsPick` (Editor's Pick)
- `celebrity` (Celebrity Picks)
- `collection` (Collection)

**ASCII Layout**:

---

### Style 3: `rankedCarousel` - Ranked List with Numbers

**Use Case**: Top rankings, bestsellers, annual best

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 90pt |
| Cover Height | 135pt |
| Card Total Width | 110pt |
| Card Total Height | 200pt |

**Display Elements**:
- Rank number (large, overlay on left edge)
- Book cover
- Title (2 lines max)
- Author name (1 line)
- Rating/score badge

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 4, opacity: 0.1`
- Corner radius: 8pt
- Spacing between cards: 16pt

**Rank Number Styling**:
| Rank | Color | Style |
|------|-------|-------|
| 1st | Gold (#FFD700) | Bold 36pt, glow effect, crown icon optional |
| 2nd | Silver (#C0C0C0) | Bold 32pt, subtle glow |
| 3rd | Bronze (#CD7F32) | Bold 32pt, subtle glow |
| 4th+ | Gray (#8E8E93) | Bold 28pt, no glow |

**Rank Badge Position**: Overlaid on bottom-left corner of cover, extending 8pt outside

**Bound to BookListType**:
- `ranking` (Top Ranked)
- `annualBest` (Best of the Year)

**ASCII Layout**:

---

### Style 4: `compactGrid` - 3-Column Grid

**Use Case**: All books browsing, category books, search results grid

**Dimensions** (calculated from screen width):
| Element | Size |
|---------|------|
| Cover Width | `(screenWidth - 48) / 3` ≈ 109pt on iPhone 14 |
| Cover Height | `coverWidth * 1.5` ≈ 164pt |
| Card Total Height | Cover + 50pt (text area) |

**Display Elements**:
- Book cover (fixed aspect ratio 2:3)
- Title (2 lines max, centered)
- Difficulty badge (small, optional)

**Visual Style**:
- LazyVGrid with 3 columns
- Column spacing: 12pt
- Row spacing: 16pt
- Corner radius: 6pt
- No shadow

**Bound to BookListType**:
- Used for "All Books" section
- Category book listings
- Search results (alternative view)

**ASCII Layout**:

---

### Style 5: `universityGrid` - Academic 2-Column Grid

**Use Case**: University reading lists, educational content

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | `(screenWidth - 36) / 2` ≈ 170pt on iPhone 14 |
| Cover Height | `coverWidth * 1.5` = 255pt |
| Card Total Height | Cover + 70pt (text area) |

**Display Elements**:
- Book cover (larger)
- Title (2 lines max)
- Author name
- Difficulty level indicator (progress bar style)
- University/course tag (if available)

**Visual Style**:
- LazyVGrid with 2 columns
- Column spacing: 12pt
- Row spacing: 20pt
- Corner radius: 10pt
- Subtle shadow

**Bound to BookListType**:
- `university` (University Reads)

**ASCII Layout**:

---

### Style 6: `listRow` - Horizontal List Row

**Use Case**: Search results, reading history, compact lists

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 60pt |
| Cover Height | 90pt |
| Row Height | 110pt |

**Display Elements**:
- Book cover (left)
- Title (right, 2 lines max)
- Author name
- Difficulty badge
- Chevron indicator
- Optional: progress indicator, date added

**Visual Style**:
- Vertical list layout
- Full width rows
- Corner radius: 6pt on cover
- Divider between rows
- Row padding: 12pt vertical

**Bound to**:
- Search results (default)
- Reading history
- Compact list views

**ASCII Layout**:

---

## Style-to-BookListType Mapping

| BookListType | Primary Style | Secondary Style | Notes |
|--------------|---------------|-----------------|-------|
| `personalized` | `heroCarousel` | - | AI-driven recommendations |
| `aiFeatured` | `featuredBanner` | `heroCarousel` | Single spotlight book |
| `aiRecommended` | `heroCarousel` | `standardCarousel` | AI picks carousel |
| `editorsPick` | `standardCarousel` | `compactGrid` | Curated selections |
| `celebrity` | `standardCarousel` | - | Celebrity recommendations |
| `collection` | `standardCarousel` | `compactGrid` | Themed collections |
| `ranking` | `rankedCarousel` | - | With rank numbers 1-3 gold/silver/bronze |
| `annualBest` | `rankedCarousel` | - | Yearly best with ranks |
| `university` | `universityGrid` | - | 2-column academic layout |
| *(Daily Pick)* | `featuredBanner` | - | Single book spotlight |
| *(New Release)* | `featuredBanner` | - | New book promotion |

---

## Discover Tab Section Layout


## Dashboard Configuration

The dashboard should allow configuring `displayStyle` for each BookList:


---

## iOS Implementation Components

### New Components to Create

1. **`BookCoverView`** - Unified cover component with fixed dimensions
2. **`FeaturedBannerCard`** - For featuredBanner style (full-width spotlight)
3. **`HeroBookCard`** - For heroCarousel style
4. **`StandardBookCard`** - For standardCarousel style
5. **`RankedBookCard`** - For rankedCarousel style with rank number
6. **`GridBookCard`** - For compactGrid style
7. **`UniversityBookCard`** - For universityGrid style
8. **`BookRowView`** - For listRow style

### Reusable Subcomponents

1. **`DifficultyBadge`** - Already exists
2. **`RatingStars`** - Star rating display
3. **`RankBadge`** - Large rank number overlay
4. **`AIRecommendedTag`** - Sparkles + "AI" tag

---

## Placeholder Styles

When cover image is unavailable:

| Style | Placeholder |
|-------|-------------|
| featuredBanner | Themed gradient + large book icon + title overlay |
| heroCarousel | Gradient + large book icon + title text |
| standardCarousel | Gray rounded rect + book icon |
| rankedCarousel | Gray rounded rect + book icon |
| compactGrid | Gray rounded rect + book icon |
| universityGrid | Gradient + book icon + category hint |
| listRow | Gray rounded rect + book icon |

**Gradient Colors by Genre** (for placeholders):
- Fiction: Blue → Purple
- Classic: Gold → Brown
- Romance: Pink → Red
- Mystery: Gray → Black
- Science Fiction: Cyan → Blue
- Fantasy: Purple → Pink
- Non-fiction: Green → Teal
- Default: Gray → Blue

---

## Accessibility

- All cover images have alt text: "{Book Title} by {Author}"
- Touch targets minimum 44×44pt
- VoiceOver announces: title, author, difficulty, rank (if applicable)
- High contrast mode: 1px border around covers

---

## Performance Considerations

1. Use `LazyVGrid` and `LazyHStack` for large lists
2. Implement image caching (AsyncImage with cache)
3. Prefetch images for carousel items
4. Fixed dimensions allow for efficient cell reuse

---

## Next Steps

1. [x] Review and approve this design document
2. [ ] Update `BookListDisplayStyle` enum in iOS model
3. [ ] Create unified `BookCoverView` component
4. [ ] Implement each card style component:
   - [ ] `FeaturedBannerCard`
   - [ ] `HeroBookCard`
   - [ ] `StandardBookCard`
   - [ ] `RankedBookCard` (with gold/silver/bronze styling)
   - [ ] `GridBookCard`
   - [ ] `UniversityBookCard`
   - [ ] `BookRowView`
5. [ ] Update `DiscoverView` to use new components
6. [ ] Add displayStyle configuration in dashboard
7. [ ] Test on multiple device sizes

---

## 榜单类型详细设计

> 与 [书籍推荐算法](../algorithm/book-ranking-algorithm.md) 配合使用

### 榜单分类体系


---

### 榜单类型详解

#### 1. 运营精选榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 数据来源 |
|---------|---------|---------|---------|---------|
| 今日推荐 | `TODAYS_PICK` | `featuredBanner` | 每日 | 运营配置 |
| 编辑精选 | `STAFF_FAVORITE` | `featuredBanner` | 每周 | 运营配置 |
| 新书上架 | `NEW_RELEASE` | `featuredBanner` | 实时 | 上架时间 |
| 活动专题 | `SPECIAL_EVENT` | `featuredBanner` | 活动期间 | 运营配置 |
| 隐藏好书 | `HIDDEN_GEM` | `featuredBanner` | 每周 | 算法+运营 |

**Today's Pick 设计规格：**


**设计要素：**

| 元素 | 规格 |
|------|------|
| 推荐理由 | 1-2句话，说明为什么推荐这本书 |
| 背景渐变 | 根据封面主色调动态生成 |
| CTA按钮 | 主色调填充，圆角8pt |
| 标签 | 最多显示3个，胶囊样式 |

---

#### 2. AI 个性化推荐榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 算法依据 |
|---------|---------|---------|---------|---------|
| 为你推荐 | `FOR_YOU` | `heroCarousel` | 实时 | 用户画像 + 协同过滤 |
| 基于阅读历史 | `BASED_ON_HISTORY` | `standardCarousel` | 每日 | 内容相似度 |
| 相似读者在读 | `SIMILAR_READERS` | `standardCarousel` | 每日 | 协同过滤 |
| 探索新领域 | `EXPLORE_NEW` | `standardCarousel` | 每周 | 多样性算法 |

**For You 设计规格：**


**AI 推荐特殊元素：**

| 元素 | 说明 | 规格 |
|------|------|------|
| 匹配度 | AI 计算的个性化匹配分数 | 百分比显示，> 85% 显示 |
| 刷新按钮 | 用户可手动刷新推荐 | 右上角图标按钮 |
| AI 标识 | 机器人图标 + "AI" 文字 | 卡片左上角 badge |
| 推荐理由 | 悬浮/长按显示推荐原因 | Tooltip 样式 |

---

#### 3. 实时榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 计算周期 | 核心指标 |
|---------|---------|---------|---------|---------|---------|
| 热门榜 | `HOT_RANKING` | `rankedCarousel` | 每小时 | 7天 | 阅读量 + 收藏量 |
| 飙升榜 | `TRENDING` | `rankedCarousel` | 每小时 | 24小时 | 增长率 |
| 口碑榜 | `TOP_RATED` | `rankedCarousel` | 每日 | 全时段 | 评分 × 评分数 |
| 完读榜 | `COMPLETION` | `rankedCarousel` | 每日 | 30天 | 完读人数 |
| 讨论榜 | `MOST_DISCUSSED` | `rankedCarousel` | 每日 | 7天 | 评论 + 笔记数 |
| 划线榜 | `MOST_HIGHLIGHTED` | `rankedCarousel` | 每日 | 30天 | 划线总数 |

**热门榜计算公式：**


**飙升榜计算公式：**


**排名榜单样式设计：**


**排名徽章样式：**

| 排名 | 颜色 | 图标 | 效果 |
|------|------|------|------|
| 1st | Gold #FFD700 | 👑 Crown | 发光效果 + 阴影 |
| 2nd | Silver #C0C0C0 | 🥈 Medal | 轻微发光 |
| 3rd | Bronze #CD7F32 | 🥉 Medal | 轻微发光 |
| 4th-10th | Gray #8E8E93 | 数字 | 无特效 |
| 11th+ | Light Gray | 数字 | 字体较小 |

**热度指示器样式：**


---

#### 4. 主题榜单

| 榜单类型 | 英文标识 | 展示样式 | 特殊元素 |
|---------|---------|---------|---------|
| 名校书单 | `UNIVERSITY` | `universityGrid` | 学校徽章、课程标签 |
| 名人推荐 | `CELEBRITY` | `standardCarousel` | 名人头像、推荐语 |
| 经典必读 | `CLASSIC_MUST_READ` | `standardCarousel` | 时代标签、历史意义 |
| 年度榜单 | `ANNUAL_BEST` | `rankedCarousel` | 年份标签、获奖标识 |
| 诺贝尔文学奖 | `NOBEL_PRIZE` | `standardCarousel` | 获奖年份、国籍 |
| 普利策奖 | `PULITZER` | `standardCarousel` | 获奖类别、年份 |

**名校书单设计：**


**名人推荐设计：**


---

#### 5. 场景榜单

| 榜单类型 | 英文标识 | 展示样式 | 目标用户 | 特殊标签 |
|---------|---------|---------|---------|---------|
| 快速阅读 | `QUICK_READ` | `featuredBanner` | 忙碌用户 | 预估阅读时间 |
| 深度阅读 | `DEEP_DIVE` | `standardCarousel` | 重度用户 | 章节数、难度 |
| 入门推荐 | `BEGINNER_FRIENDLY` | `heroCarousel` | 新用户 | 词汇量提示 |
| 进阶挑战 | `CHALLENGE` | `standardCarousel` | 进阶用户 | 难度、挑战徽章 |
| 睡前阅读 | `BEDTIME` | `standardCarousel` | 睡前场景 | 阅读时长、放松标签 |
| 通勤必备 | `COMMUTE` | `standardCarousel` | 通勤场景 | 章节短小、可中断 |

**快速阅读设计：**


---

### 榜单样式与数据源映射


---

### Dashboard 榜单配置界面


---

### 数据模型扩展


---

### 相关文档

- [书籍推荐算法设计](../algorithm/book-ranking-algorithm.md) - 详细的评分和排名算法
- [Dashboard 规格文档](../dashboard/spec.md) - 后台管理配置
- [发现页搜索功能](../content/discover-search.md) - 搜索相关设计

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-19 | Initial design document created |
| 2025-12-19 | Added `featuredBanner` style for full-width spotlight |
| 2025-12-19 | Added gold/silver/bronze styling for ranks 1-3 in `rankedCarousel` |
| 2025-12-21 | Merged Categories + All Books sections; added "See All" button linking to BrowseBooksView |
| 2025-12-21 | Added ASCII layout diagrams for all 7 display styles (Style 0-6) |
| 2025-12-23 | Added comprehensive booklist types design with 5 levels, algorithm integration, and dashboard config |

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 🚧 进行中 | 60% | 2025-12-23 | 7种展示样式已定义，部分实现完成 |

### 已完成 ✅
- [x] 7种书籍展示样式设计文档（Style 0-6）
- [x] 每种样式的固定尺寸规范
- [x] ASCII布局图示
- [x] 5级榜单分类体系设计
- [x] 20+榜单类型规格定义
- [x] Prisma数据模型扩展设计
- [x] 榜单排名算法公式
- [x] Dashboard配置界面设计

### 进行中 🚧
- [ ] iOS端书籍卡片组件实现
  - [x] 基础书籍卡片（BookCardView）
  - [ ] featuredBanner 完整实现
  - [ ] heroCarousel 完整实现
  - [ ] rankedCarousel 金银铜牌样式
  - [ ] compactGrid 样式完善
  - [ ] universityGrid 样式完善
- [ ] 榜单数据模型迁移（BookList扩展）

### 待开发 📝
- [ ] 后端BookList模型扩展实现
  - [ ] 添加level字段（0-4优先级）
  - [ ] 添加displayStyle枚举
  - [ ] 添加rankingConfig JSON字段
  - [ ] 添加refreshInterval字段
- [ ] 榜单排名算法实现
  - [ ] 热度榜算法（hotScore计算）
  - [ ] 新书榜算法（时间加权）
  - [ ] 经典榜算法（持续热度）
  - [ ] 分类榜算法
- [ ] Dashboard榜单配置界面
  - [ ] 榜单CRUD功能
  - [ ] 榜单类型选择器
  - [ ] 展示样式选择器
  - [ ] 排名规则配置
  - [ ] 刷新频率设置
- [ ] iOS端榜单渲染逻辑
  - [ ] 按displayStyle动态渲染
  - [ ] 排名徽章显示
  - [ ] 时间窗口过滤

### 依赖项
- 📝 需要书籍推荐算法实现（algorithm/book-ranking-algorithm.md）
- 📝 需要用户行为数据收集
- 🚧 需要Dashboard榜单管理功能

### 技术债务
- 部分展示样式在不同屏幕尺寸下的响应式适配待完善
- 榜单缓存策略未定义
- 实时榜单刷新机制未实现
