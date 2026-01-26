# 书籍列表推荐算法设计文档

> Book Ranking & Recommendation Algorithm - 打造极具吸引力的发现页体验

---

## 1. 概述

### 1.1 设计目标

构建一套智能的书籍推荐排序算法，确保用户打开发现页时：
- 看到最符合个人兴趣的书籍
- 发现高质量、高人气的优质内容
- 获得新鲜感和探索欲
- 产生强烈的阅读动机

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| **个性化优先** | 用户偏好权重最高，千人千面 |
| **质量为王** | 优质内容应获得更多曝光 |
| **热度加成** | 近期热门内容获得时效性加分 |
| **多样性保障** | 避免信息茧房，保持探索空间 |
| **新书推荐** | 新上架优质书籍获得冷启动扶持 |

---

## 2. 整体架构

### 2.1 优先级层级

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           发现页书籍列表                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Level 0 (最高优先级)                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Dashboard 编辑精选书单                          │ │
│  │   - 运营人员手动配置                                                 │ │
│  │   - 支持排序权重                                                     │ │
│  │   - 支持时间窗口控制                                                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Level 1 (次高优先级)                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     AI 个性化推荐书单                               │ │
│  │   - 基于用户画像                                                     │ │
│  │   - 基于阅读历史                                                     │ │
│  │   - 基于相似用户                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Level 2 (算法排序)                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     书库综合排序                                     │ │
│  │   - 书籍质量分 + 热度分 + 个性化分 + 多样性分 + 新鲜度分            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 最终得分公式

```
FinalScore = W₀ × DashboardBoost
           + W₁ × AIRecommendBoost
           + W₂ × BookQualityScore
           + W₃ × PopularityScore
           + W₄ × PersonalizationScore
           + W₅ × AuthorPopularityScore
           + W₆ × FreshnessScore
           + W₇ × DiversityScore
           + W₈ × EngagementScore
```

**权重配置（可动态调整）：**

| 权重 | 参数名 | 默认值 | 说明 |
|------|--------|--------|------|
| W₀ | DashboardBoost | 10000 | Dashboard书单置顶 |
| W₁ | AIRecommendBoost | 5000 | AI推荐书单优先 |
| W₂ | BookQualityScore | 0.25 | 书籍质量权重 |
| W₃ | PopularityScore | 0.20 | 热度权重 |
| W₄ | PersonalizationScore | 0.25 | 个性化权重 |
| W₅ | AuthorPopularityScore | 0.10 | 作者热度权重 |
| W₆ | FreshnessScore | 0.08 | 新鲜度权重 |
| W₇ | DiversityScore | 0.07 | 多样性权重 |
| W₈ | EngagementScore | 0.05 | 参与度权重 |

---

## 3. Level 0：Dashboard 编辑精选

### 3.1 功能说明

运营人员通过 Dashboard 手动配置的书单，享有最高展示优先级。

### 3.2 数据模型

```typescript
interface DashboardBookList {
  id: string;
  name: string;                    // 书单名称
  description: string;             // 书单描述
  books: DashboardBookItem[];      // 书籍列表
  priority: number;                // 书单优先级 (1-100)
  startTime: Date;                 // 生效开始时间
  endTime: Date;                   // 生效结束时间
  targetUserSegments: string[];    // 目标用户群 (新用户/老用户/付费用户等)
  displayPosition: 'top' | 'banner' | 'section'; // 展示位置
  status: 'draft' | 'active' | 'expired';
}

interface DashboardBookItem {
  bookId: string;
  sortOrder: number;               // 在书单内的排序
  displayStyle: 'cover' | 'card' | 'hero'; // 展示样式
  customCover?: string;            // 自定义封面
  customDescription?: string;      // 自定义描述
}
```

### 3.3 优先级计算

```typescript
function getDashboardBoost(book: Book, user: User): number {
  const dashboardLists = getDashboardListsForUser(user);

  for (const list of dashboardLists) {
    const item = list.books.find(b => b.bookId === book.id);
    if (item) {
      // 基础加成 + 书单优先级 + 书单内排序
      return 10000 + (list.priority * 100) + (100 - item.sortOrder);
    }
  }

  return 0;
}
```

---

## 4. Level 1：AI 个性化推荐

### 4.1 推荐策略

AI 推荐基于多种策略的混合：

| 策略 | 权重 | 说明 |
|------|------|------|
| 协同过滤 | 30% | 相似用户喜欢的书 |
| 内容推荐 | 30% | 相似内容的书 |
| 知识图谱 | 20% | 关联作者/主题的书 |
| 探索推荐 | 10% | 跨类别新鲜推荐 |
| 热门趋势 | 10% | 近期热门书籍 |

### 4.2 AI 推荐分计算（6个维度）

```typescript
interface AIRecommendScore {
  // 维度1: 用户-书籍相似度 (基于Embedding)
  userBookSimilarity: number;      // 0-1

  // 维度2: 阅读历史关联度
  readingHistoryRelevance: number; // 0-1

  // 维度3: 用户偏好匹配度
  preferenceMatch: number;         // 0-1

  // 维度4: 相似用户推荐度
  collaborativeScore: number;      // 0-1

  // 维度5: 知识图谱关联度
  knowledgeGraphScore: number;     // 0-1

  // 维度6: 探索多样性分
  explorationScore: number;        // 0-1
}

function calculateAIRecommendBoost(scores: AIRecommendScore): number {
  const weights = {
    userBookSimilarity: 0.25,
    readingHistoryRelevance: 0.20,
    preferenceMatch: 0.20,
    collaborativeScore: 0.15,
    knowledgeGraphScore: 0.10,
    explorationScore: 0.10
  };

  const totalScore =
    scores.userBookSimilarity * weights.userBookSimilarity +
    scores.readingHistoryRelevance * weights.readingHistoryRelevance +
    scores.preferenceMatch * weights.preferenceMatch +
    scores.collaborativeScore * weights.collaborativeScore +
    scores.knowledgeGraphScore * weights.knowledgeGraphScore +
    scores.explorationScore * weights.explorationScore;

  // 转换为0-5000的分数区间
  return totalScore * 5000;
}
```

---

## 5. Level 2：书籍综合排序算法

### 5.1 书籍质量分（BookQualityScore）

**6个评分维度：**

```typescript
interface BookQualityMetrics {
  // 维度1: 权威评分
  rating: number;                  // 用户评分 1-5
  ratingCount: number;             // 评分人数
  ratingConfidence: number;        // 评分置信度 (基于评分人数)

  // 维度2: 知名度
  isClassic: boolean;              // 是否经典名著
  isAwardWinner: boolean;          // 是否获奖作品
  authorReputation: number;        // 作者知名度 0-100

  // 维度3: 内容质量
  editorialScore: number;          // 编辑评分 (运营打分) 0-10
  contentCompletion: number;       // 内容完整度 0-1

  // 维度4: 专业认可
  expertReviews: number;           // 专家/媒体评论数
  citationCount: number;           // 被引用/推荐次数

  // 维度5: 版本质量
  formatQuality: number;           // 格式质量 (排版/无错字) 0-1
  hasEnhancements: boolean;        // 是否有注释/导读等增值

  // 维度6: 时间验证
  publicationAge: number;          // 出版年限
  sustainedPopularity: number;     // 持续热度 (老书但仍热门)
}

function calculateBookQualityScore(metrics: BookQualityMetrics): number {
  // 评分置信度加权
  const ratingConfidence = Math.min(1, Math.log10(metrics.ratingCount + 1) / 3);
  const adjustedRating = (metrics.rating - 3) * ratingConfidence + 3;
  const ratingScore = (adjustedRating - 1) / 4;  // 归一化到 0-1

  // 知名度分数
  let reputationScore = 0;
  if (metrics.isClassic) reputationScore += 0.4;
  if (metrics.isAwardWinner) reputationScore += 0.3;
  reputationScore += (metrics.authorReputation / 100) * 0.3;

  // 内容质量分数
  const contentScore = (metrics.editorialScore / 10) * 0.6 +
                       metrics.contentCompletion * 0.4;

  // 专业认可分数
  const expertScore = Math.min(1, Math.log10(metrics.expertReviews + 1) / 2) * 0.6 +
                      Math.min(1, Math.log10(metrics.citationCount + 1) / 2) * 0.4;

  // 版本质量分数
  const formatScore = metrics.formatQuality * 0.7 +
                      (metrics.hasEnhancements ? 0.3 : 0);

  // 时间验证分数 (老书+持续热门 = 高分)
  const ageBonus = metrics.publicationAge > 20 ? 0.3 : metrics.publicationAge / 67;
  const timeScore = ageBonus * 0.4 + metrics.sustainedPopularity * 0.6;

  // 加权汇总
  const weights = {
    rating: 0.25,
    reputation: 0.20,
    content: 0.20,
    expert: 0.15,
    format: 0.10,
    time: 0.10
  };

  return ratingScore * weights.rating +
         reputationScore * weights.reputation +
         contentScore * weights.content +
         expertScore * weights.expert +
         formatScore * weights.format +
         timeScore * weights.time;
}
```

### 5.2 热度分（PopularityScore）

**8个热度维度：**

```typescript
interface PopularityMetrics {
  // 维度1: 浏览量
  viewCount: number;               // 总浏览量
  viewCountRecent: number;         // 近7天浏览量
  uniqueViewers: number;           // 独立访客数

  // 维度2: 收藏量
  bookshelfCount: number;          // 加入书架次数
  wishlistCount: number;           // 加入想读次数

  // 维度3: 阅读量
  readStartCount: number;          // 开始阅读人数
  readCompleteCount: number;       // 完读人数
  completionRate: number;          // 完读率

  // 维度4: 互动量
  highlightCount: number;          // 划线总次数
  noteCount: number;               // 笔记/想法总数
  commentCount: number;            // 评论数

  // 维度5: 分享量
  shareCount: number;              // 分享次数
  quoteShareCount: number;         // 金句分享次数

  // 维度6: 评分活跃度
  ratingVelocity: number;          // 近期评分速度

  // 维度7: 搜索热度
  searchCount: number;             // 被搜索次数
  searchClickRate: number;         // 搜索点击率

  // 维度8: 关联服务使用
  authorProfileClicks: number;     // 点击作者主页次数
  aiChatCount: number;             // AI对话次数
  voiceListenCount: number;        // 语音朗读次数
}

function calculatePopularityScore(metrics: PopularityMetrics): number {
  // 浏览热度 (对数归一化)
  const viewScore = (
    Math.log10(metrics.viewCount + 1) / 6 * 0.4 +
    Math.log10(metrics.viewCountRecent + 1) / 4 * 0.4 +
    Math.log10(metrics.uniqueViewers + 1) / 5 * 0.2
  );

  // 收藏热度
  const collectScore = (
    Math.log10(metrics.bookshelfCount + 1) / 5 * 0.6 +
    Math.log10(metrics.wishlistCount + 1) / 4 * 0.4
  );

  // 阅读热度
  const readScore = (
    Math.log10(metrics.readStartCount + 1) / 5 * 0.3 +
    Math.log10(metrics.readCompleteCount + 1) / 4 * 0.4 +
    metrics.completionRate * 0.3
  );

  // 互动热度
  const interactionScore = (
    Math.log10(metrics.highlightCount + 1) / 5 * 0.35 +
    Math.log10(metrics.noteCount + 1) / 4 * 0.35 +
    Math.log10(metrics.commentCount + 1) / 4 * 0.30
  );

  // 分享热度
  const shareScore = (
    Math.log10(metrics.shareCount + 1) / 4 * 0.5 +
    Math.log10(metrics.quoteShareCount + 1) / 3 * 0.5
  );

  // 评分活跃度
  const ratingActivityScore = Math.min(1, metrics.ratingVelocity / 10);

  // 搜索热度
  const searchScore = (
    Math.log10(metrics.searchCount + 1) / 4 * 0.6 +
    metrics.searchClickRate * 0.4
  );

  // 关联服务热度
  const serviceScore = (
    Math.log10(metrics.authorProfileClicks + 1) / 3 * 0.4 +
    Math.log10(metrics.aiChatCount + 1) / 3 * 0.3 +
    Math.log10(metrics.voiceListenCount + 1) / 3 * 0.3
  );

  // 加权汇总
  const weights = {
    view: 0.15,
    collect: 0.15,
    read: 0.20,
    interaction: 0.20,
    share: 0.10,
    ratingActivity: 0.05,
    search: 0.08,
    service: 0.07
  };

  return Math.min(1,
    viewScore * weights.view +
    collectScore * weights.collect +
    readScore * weights.read +
    interactionScore * weights.interaction +
    shareScore * weights.share +
    ratingActivityScore * weights.ratingActivity +
    searchScore * weights.search +
    serviceScore * weights.service
  );
}
```

### 5.3 个性化分（PersonalizationScore）

**7个个性化维度：**

```typescript
interface PersonalizationMetrics {
  // 维度1: 类别偏好匹配
  categoryMatch: number;           // 用户偏好类别匹配度 0-1
  subCategoryMatch: number;        // 子类别匹配度

  // 维度2: 难度偏好匹配
  difficultyMatch: number;         // 阅读难度匹配度 0-1

  // 维度3: 篇幅偏好匹配
  lengthMatch: number;             // 字数/篇幅匹配度 0-1

  // 维度4: 作者偏好匹配
  authorPreferenceMatch: number;   // 是否是用户喜欢的作者
  similarAuthorMatch: number;      // 是否是相似作者

  // 维度5: 写作风格偏好
  styleMatch: number;              // 写作风格匹配度
  eraMatch: number;                // 时代偏好匹配度

  // 维度6: 语言偏好
  languageMatch: number;           // 语言匹配度
  translationQuality: number;      // 译本质量偏好

  // 维度7: 阅读历史关联
  readHistorySimilarity: number;   // 与阅读历史的相似度
  previousBookInSeries: boolean;   // 是否是系列的下一本
}

function calculatePersonalizationScore(
  metrics: PersonalizationMetrics,
  userProfile: UserProfile
): number {
  // 类别匹配分
  const categoryScore =
    metrics.categoryMatch * 0.7 +
    metrics.subCategoryMatch * 0.3;

  // 难度匹配分 (高斯分布，完美匹配=1)
  const difficultyScore = metrics.difficultyMatch;

  // 篇幅匹配分
  const lengthScore = metrics.lengthMatch;

  // 作者偏好分
  const authorScore =
    metrics.authorPreferenceMatch * 0.7 +
    metrics.similarAuthorMatch * 0.3;

  // 风格偏好分
  const styleScore =
    metrics.styleMatch * 0.6 +
    metrics.eraMatch * 0.4;

  // 语言偏好分
  const languageScore =
    metrics.languageMatch * 0.8 +
    metrics.translationQuality * 0.2;

  // 阅读历史关联分
  let historyScore = metrics.readHistorySimilarity;
  if (metrics.previousBookInSeries) {
    historyScore = Math.max(historyScore, 0.9); // 系列书优先
  }

  // 加权汇总
  const weights = {
    category: 0.25,
    difficulty: 0.12,
    length: 0.08,
    author: 0.20,
    style: 0.12,
    language: 0.08,
    history: 0.15
  };

  return categoryScore * weights.category +
         difficultyScore * weights.difficulty +
         lengthScore * weights.length +
         authorScore * weights.author +
         styleScore * weights.style +
         languageScore * weights.language +
         historyScore * weights.history;
}
```

### 5.4 作者热度分（AuthorPopularityScore）

**7个作者热度维度：**

```typescript
interface AuthorPopularityMetrics {
  // 维度1: 作者主页访问
  profileViewCount: number;        // 主页访问次数
  profileViewRecent: number;       // 近7天访问次数

  // 维度2: 作者知名度
  isHistoricalFigure: boolean;     // 是否历史名人
  totalBookCount: number;          // 作品总数
  averageBookRating: number;       // 作品平均评分

  // 维度3: AI对话热度
  chatSessionCount: number;        // AI对话会话数
  voiceChatCount: number;          // 语音对话次数
  videoChatCount: number;          // 视频对话次数

  // 维度4: 金句热度
  quoteCollectionCount: number;    // 金句被收藏次数
  quoteShareCount: number;         // 金句被分享次数
  quoteLikeCount: number;          // 金句被点赞次数

  // 维度5: 跨书籍阅读
  multiBookReaders: number;        // 读过多本书的用户数
  authorFollowers: number;         // 关注作者的用户数

  // 维度6: 社交传播
  authorMentionCount: number;      // 被提及次数
  authorShareCount: number;        // 作者页被分享次数

  // 维度7: 时代趋势
  trendingScore: number;           // 近期热度上升趋势 0-1
}

function calculateAuthorPopularityScore(metrics: AuthorPopularityMetrics): number {
  // 主页访问分
  const profileScore = (
    Math.log10(metrics.profileViewCount + 1) / 5 * 0.5 +
    Math.log10(metrics.profileViewRecent + 1) / 3 * 0.5
  );

  // 知名度分
  let reputationScore = 0;
  if (metrics.isHistoricalFigure) reputationScore += 0.4;
  reputationScore += Math.min(0.3, metrics.totalBookCount / 50);
  reputationScore += (metrics.averageBookRating - 3) / 2 * 0.3;

  // AI对话热度分
  const chatScore = (
    Math.log10(metrics.chatSessionCount + 1) / 4 * 0.5 +
    Math.log10(metrics.voiceChatCount + 1) / 3 * 0.3 +
    Math.log10(metrics.videoChatCount + 1) / 2 * 0.2
  );

  // 金句热度分
  const quoteScore = (
    Math.log10(metrics.quoteCollectionCount + 1) / 4 * 0.4 +
    Math.log10(metrics.quoteShareCount + 1) / 3 * 0.35 +
    Math.log10(metrics.quoteLikeCount + 1) / 4 * 0.25
  );

  // 跨书籍阅读分
  const loyaltyScore = (
    Math.log10(metrics.multiBookReaders + 1) / 4 * 0.6 +
    Math.log10(metrics.authorFollowers + 1) / 4 * 0.4
  );

  // 社交传播分
  const socialScore = (
    Math.log10(metrics.authorMentionCount + 1) / 3 * 0.5 +
    Math.log10(metrics.authorShareCount + 1) / 3 * 0.5
  );

  // 趋势分
  const trendScore = metrics.trendingScore;

  // 加权汇总
  const weights = {
    profile: 0.20,
    reputation: 0.20,
    chat: 0.15,
    quote: 0.15,
    loyalty: 0.12,
    social: 0.10,
    trend: 0.08
  };

  return Math.min(1,
    profileScore * weights.profile +
    reputationScore * weights.reputation +
    chatScore * weights.chat +
    quoteScore * weights.quote +
    loyaltyScore * weights.loyalty +
    socialScore * weights.social +
    trendScore * weights.trend
  );
}
```

### 5.5 新鲜度分（FreshnessScore）

**5个新鲜度维度：**

```typescript
interface FreshnessMetrics {
  // 维度1: 上架时间
  publishedAt: Date;               // 上架日期
  daysSincePublish: number;        // 上架天数

  // 维度2: 更新活跃度
  lastUpdatedAt: Date;             // 最后更新时间
  updateCount: number;             // 更新次数

  // 维度3: 新书质量信号
  earlyRatingCount: number;        // 早期评分数
  earlyRatingAverage: number;      // 早期评分均值

  // 维度4: 发现率
  impressionToClickRate: number;   // 曝光点击率
  clickToReadRate: number;         // 点击阅读转化率

  // 维度5: 编辑推荐
  isEditorialPick: boolean;        // 是否编辑精选
  editorialBoostEndTime: Date;     // 推荐期限
}

function calculateFreshnessScore(metrics: FreshnessMetrics): number {
  // 新书加成 (30天内线性衰减)
  const newBookBoost = Math.max(0, 1 - metrics.daysSincePublish / 30);

  // 更新活跃度分
  const daysSinceUpdate = Math.floor(
    (Date.now() - metrics.lastUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const updateScore = Math.max(0, 1 - daysSinceUpdate / 90) * 0.5 +
                      Math.min(0.5, metrics.updateCount / 10);

  // 新书质量信号分 (早期好评 = 高分)
  let earlyQualityScore = 0;
  if (metrics.daysSincePublish < 14 && metrics.earlyRatingCount >= 5) {
    earlyQualityScore = (metrics.earlyRatingAverage - 3) / 2;
  }

  // 发现率分
  const discoveryScore =
    metrics.impressionToClickRate * 0.4 +
    metrics.clickToReadRate * 0.6;

  // 编辑推荐加成
  let editorialScore = 0;
  if (metrics.isEditorialPick &&
      metrics.editorialBoostEndTime > new Date()) {
    editorialScore = 1.0;
  }

  // 加权汇总
  const weights = {
    newBook: 0.30,
    update: 0.15,
    earlyQuality: 0.20,
    discovery: 0.20,
    editorial: 0.15
  };

  return Math.min(1,
    newBookBoost * weights.newBook +
    updateScore * weights.update +
    earlyQualityScore * weights.earlyQuality +
    discoveryScore * weights.discovery +
    editorialScore * weights.editorial
  );
}
```

### 5.6 多样性分（DiversityScore）

**5个多样性维度：**

```typescript
interface DiversityContext {
  // 维度1: 类别多样性
  recentCategories: string[];      // 用户最近浏览的类别
  currentCategory: string;         // 当前书籍类别

  // 维度2: 作者多样性
  recentAuthors: string[];         // 用户最近浏览的作者
  currentAuthor: string;           // 当前书籍作者

  // 维度3: 时代多样性
  recentEras: string[];            // 用户最近浏览的时代
  currentEra: string;              // 当前书籍时代

  // 维度4: 难度多样性
  recentDifficulties: number[];    // 用户最近浏览的难度
  currentDifficulty: number;       // 当前书籍难度

  // 维度5: 语言/地区多样性
  recentRegions: string[];         // 用户最近浏览的地区
  currentRegion: string;           // 当前书籍地区
}

function calculateDiversityScore(
  context: DiversityContext,
  sessionPosition: number          // 当前在列表中的位置
): number {
  // 类别多样性：如果最近没看过这个类别，加分
  const categoryDiversity = context.recentCategories.includes(context.currentCategory)
    ? 0 : 1;

  // 作者多样性
  const authorDiversity = context.recentAuthors.includes(context.currentAuthor)
    ? 0 : 1;

  // 时代多样性
  const eraDiversity = context.recentEras.includes(context.currentEra)
    ? 0 : 1;

  // 难度多样性：与最近浏览的平均难度差异
  const avgDifficulty = context.recentDifficulties.reduce((a, b) => a + b, 0) /
                        context.recentDifficulties.length;
  const difficultyDiversity = Math.min(1,
    Math.abs(context.currentDifficulty - avgDifficulty) / 3
  );

  // 地区多样性
  const regionDiversity = context.recentRegions.includes(context.currentRegion)
    ? 0 : 1;

  // 加权汇总
  const weights = {
    category: 0.30,
    author: 0.25,
    era: 0.20,
    difficulty: 0.10,
    region: 0.15
  };

  const diversityScore =
    categoryDiversity * weights.category +
    authorDiversity * weights.author +
    eraDiversity * weights.era +
    difficultyDiversity * weights.difficulty +
    regionDiversity * weights.region;

  // 位置衰减：列表后面位置多样性更重要
  const positionWeight = Math.min(1, sessionPosition / 20);

  return diversityScore * (0.3 + 0.7 * positionWeight);
}
```

### 5.7 参与度分（EngagementScore）

**6个参与度预测维度：**

```typescript
interface EngagementPrediction {
  // 维度1: 预期停留时间
  predictedReadTime: number;       // 预测阅读时长(分钟)

  // 维度2: 预期完读率
  predictedCompletionRate: number; // 预测完读概率 0-1

  // 维度3: 预期互动率
  predictedInteractionRate: number; // 预测互动概率 0-1

  // 维度4: 预期分享率
  predictedShareRate: number;      // 预测分享概率 0-1

  // 维度5: 预期复购/续读
  predictedReturnRate: number;     // 预测回访概率 0-1

  // 维度6: 预期付费转化
  predictedConversionRate: number; // 预测付费转化率 0-1
}

function calculateEngagementScore(prediction: EngagementPrediction): number {
  const weights = {
    readTime: 0.20,
    completion: 0.25,
    interaction: 0.20,
    share: 0.15,
    returnRate: 0.10,
    conversion: 0.10
  };

  // 阅读时长归一化 (30分钟为满分)
  const readTimeScore = Math.min(1, prediction.predictedReadTime / 30);

  return readTimeScore * weights.readTime +
         prediction.predictedCompletionRate * weights.completion +
         prediction.predictedInteractionRate * weights.interaction +
         prediction.predictedShareRate * weights.share +
         prediction.predictedReturnRate * weights.returnRate +
         prediction.predictedConversionRate * weights.conversion;
}
```

---

## 6. 行业最佳实践参考

### 6.1 参考产品分析

| 产品 | 核心策略 | 可借鉴点 |
|------|----------|----------|
| **微信读书** | 社交关系链 + 阅读时长激励 | 好友在读、本周阅读榜 |
| **Kindle** | 基于购买历史的协同过滤 | "购买此书的人也买了" |
| **豆瓣读书** | UGC评分+书评驱动 | 高质量书评置顶 |
| **得到** | 专家背书+体系化内容 | 课程关联、名师推荐 |
| **网易蜗牛** | 每天免费阅读时长+领读人 | 时间限制创造稀缺感 |
| **Goodreads** | 社区书单+阅读挑战 | 年度阅读目标、书单 |
| **Apple Books** | 编辑精选+本地化榜单 | 地区特色推荐 |
| **Audible** | 语音内容+系列推荐 | 一键购买系列后续 |

### 6.2 额外补充维度

基于行业实践，补充以下计算维度：

#### 6.2.1 社交热度分（SocialHeatScore）

```typescript
interface SocialHeatMetrics {
  // 维度1: 好友阅读
  friendsReading: number;          // 正在读的好友数
  friendsCompleted: number;        // 已读完的好友数
  friendsRated: number;            // 已评分的好友数

  // 维度2: 社区讨论
  discussionCount: number;         // 讨论帖数量
  activeDiscussions: number;       // 活跃讨论数

  // 维度3: 社交分享
  socialMentions: number;          // 社交媒体提及
  viralCoefficient: number;        // 病毒传播系数

  // 维度4: 意见领袖影响
  influencerReads: number;         // KOL阅读数
  influencerRecommends: number;    // KOL推荐数

  // 维度5: 书单收录
  publicListCount: number;         // 被公开书单收录次数
  listQuality: number;             // 书单质量加权
}

function calculateSocialHeatScore(metrics: SocialHeatMetrics): number {
  const friendScore = (
    Math.log10(metrics.friendsReading + 1) / 2 * 0.4 +
    Math.log10(metrics.friendsCompleted + 1) / 2 * 0.35 +
    Math.log10(metrics.friendsRated + 1) / 2 * 0.25
  );

  const discussionScore = (
    Math.log10(metrics.discussionCount + 1) / 3 * 0.5 +
    Math.log10(metrics.activeDiscussions + 1) / 2 * 0.5
  );

  const viralScore = (
    Math.log10(metrics.socialMentions + 1) / 4 * 0.6 +
    Math.min(1, metrics.viralCoefficient) * 0.4
  );

  const influencerScore = (
    Math.log10(metrics.influencerReads + 1) / 2 * 0.4 +
    Math.log10(metrics.influencerRecommends + 1) / 2 * 0.6
  );

  const listScore = (
    Math.log10(metrics.publicListCount + 1) / 3 * 0.6 +
    metrics.listQuality * 0.4
  );

  return Math.min(1,
    friendScore * 0.25 +
    discussionScore * 0.20 +
    viralScore * 0.20 +
    influencerScore * 0.15 +
    listScore * 0.20
  );
}
```

#### 6.2.2 时效热点分（TrendingScore）

```typescript
interface TrendingMetrics {
  // 维度1: 热度变化
  viewGrowthRate: number;          // 浏览量增长率 (周环比)
  ratingGrowthRate: number;        // 评分量增长率

  // 维度2: 热点事件关联
  newsRelevance: number;           // 与时事新闻关联度
  eventRelevance: number;          // 与热门事件关联度

  // 维度3: 季节性
  seasonalRelevance: number;       // 季节相关度 (如夏日清凉读物)
  holidayRelevance: number;        // 节日相关度

  // 维度4: 周期性热点
  anniversaryRelevance: number;    // 纪念日关联 (作者诞辰等)
  awardSeasonRelevance: number;    // 颁奖季关联

  // 维度5: 影视改编热度
  adaptationNews: boolean;         // 是否有影视改编新闻
  adaptationReleaseDate?: Date;    // 影视作品上映日期
}

function calculateTrendingScore(metrics: TrendingMetrics): number {
  // 热度变化分
  const growthScore = (
    Math.tanh(metrics.viewGrowthRate) * 0.6 +
    Math.tanh(metrics.ratingGrowthRate) * 0.4
  ) / 2 + 0.5; // 归一化到0-1

  // 热点事件分
  const eventScore = Math.max(
    metrics.newsRelevance,
    metrics.eventRelevance
  );

  // 季节性分
  const seasonScore = Math.max(
    metrics.seasonalRelevance,
    metrics.holidayRelevance
  );

  // 周期性热点分
  const periodicScore = Math.max(
    metrics.anniversaryRelevance,
    metrics.awardSeasonRelevance
  );

  // 影视改编分
  let adaptationScore = 0;
  if (metrics.adaptationNews) {
    adaptationScore = 0.5;
    if (metrics.adaptationReleaseDate) {
      const daysToRelease = Math.floor(
        (metrics.adaptationReleaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      // 上映前30天到上映后30天热度最高
      if (daysToRelease >= -30 && daysToRelease <= 30) {
        adaptationScore = 1.0;
      } else if (daysToRelease > 30 && daysToRelease <= 90) {
        adaptationScore = 0.7;
      }
    }
  }

  return Math.min(1,
    growthScore * 0.25 +
    eventScore * 0.20 +
    seasonScore * 0.15 +
    periodicScore * 0.15 +
    adaptationScore * 0.25
  );
}
```

#### 6.2.3 阅读挑战关联分（ChallengeScore）

```typescript
interface ChallengeMetrics {
  // 维度1: 用户阅读挑战匹配
  matchesUserChallenge: boolean;   // 是否匹配用户当前挑战
  challengeCategory: string;       // 挑战类别

  // 维度2: 全站挑战热度
  globalChallengeCount: number;    // 多少挑战包含此书
  challengeCompletions: number;    // 通过此书完成挑战的人数

  // 维度3: 系列完成进度
  isSeriesBook: boolean;           // 是否系列书籍
  userSeriesProgress: number;      // 用户系列进度 0-1

  // 维度4: 阅读目标匹配
  fitsYearlyGoal: boolean;         // 是否适合年度目标
  estimatedReadDays: number;       // 预估阅读天数

  // 维度5: 成就解锁关联
  unlocksAchievement: boolean;     // 阅读后可解锁成就
  achievementRarity: number;       // 成就稀有度 0-1
}

function calculateChallengeScore(
  metrics: ChallengeMetrics,
  userGoals: UserGoals
): number {
  // 用户挑战匹配分
  let userChallengeScore = metrics.matchesUserChallenge ? 1 : 0;

  // 全站挑战热度分
  const globalChallengeScore = (
    Math.log10(metrics.globalChallengeCount + 1) / 2 * 0.5 +
    Math.log10(metrics.challengeCompletions + 1) / 3 * 0.5
  );

  // 系列进度分 (接近完成系列时提升推荐)
  let seriesScore = 0;
  if (metrics.isSeriesBook && metrics.userSeriesProgress > 0.5) {
    seriesScore = metrics.userSeriesProgress;
  }

  // 年度目标匹配分
  let goalScore = 0;
  if (metrics.fitsYearlyGoal) {
    const remainingDays = daysUntilYearEnd();
    const booksNeeded = userGoals.yearlyTarget - userGoals.booksRead;
    if (booksNeeded > 0 && metrics.estimatedReadDays <= remainingDays / booksNeeded) {
      goalScore = 1;
    }
  }

  // 成就解锁分
  let achievementScore = 0;
  if (metrics.unlocksAchievement) {
    achievementScore = 0.5 + metrics.achievementRarity * 0.5;
  }

  return Math.min(1,
    userChallengeScore * 0.30 +
    globalChallengeScore * 0.20 +
    seriesScore * 0.20 +
    goalScore * 0.15 +
    achievementScore * 0.15
  );
}
```

---

## 7. 数据模型与存储

### 7.1 书籍扩展模型

```prisma
model Book {
  id                    String   @id @default(uuid())
  title                 String
  author                String
  authorId              String?

  // 基础元数据
  isbn                  String?
  publishedYear         Int?
  language              String?
  wordCount             Int?
  difficulty            Int?     // 1-5
  categories            String[]

  // 质量指标
  rating                Float    @default(0)
  ratingCount           Int      @default(0)
  isClassic             Boolean  @default(false)
  isAwardWinner         Boolean  @default(false)
  editorialScore        Float?

  // 热度指标
  viewCount             Int      @default(0)
  bookshelfCount        Int      @default(0)
  readStartCount        Int      @default(0)
  readCompleteCount     Int      @default(0)
  highlightCount        Int      @default(0)
  noteCount             Int      @default(0)
  commentCount          Int      @default(0)
  shareCount            Int      @default(0)

  // 计算分数 (定期更新)
  qualityScore          Float    @default(0)
  popularityScore       Float    @default(0)
  authorPopularityScore Float    @default(0)
  freshnessScore        Float    @default(0)
  trendingScore         Float    @default(0)
  socialHeatScore       Float    @default(0)

  // 时间戳
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  lastScoreUpdate       DateTime?

  // 关系
  authorProfile         Author?  @relation(fields: [authorId], references: [id])

  @@index([qualityScore])
  @@index([popularityScore])
  @@index([createdAt])
}

model BookDailyStats {
  id                    String   @id @default(uuid())
  bookId                String
  date                  DateTime

  // 每日指标
  viewCount             Int      @default(0)
  uniqueViewers         Int      @default(0)
  bookshelfAdds         Int      @default(0)
  readStarts            Int      @default(0)
  readCompletes         Int      @default(0)
  highlights            Int      @default(0)
  notes                 Int      @default(0)
  comments              Int      @default(0)
  shares                Int      @default(0)
  ratings               Int      @default(0)
  avgRating             Float?

  @@unique([bookId, date])
  @@index([date])
}
```

### 7.2 用户画像模型

```prisma
model UserProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique

  // 阅读偏好
  preferredCategories   Json     // { category: weight }
  preferredAuthors      Json     // { authorId: weight }
  preferredDifficulty   Float?   // 1-5
  preferredLength       String?  // short/medium/long
  preferredLanguages    String[]
  preferredEras         String[]

  // 阅读行为特征
  avgReadingSpeed       Float?   // 字/分钟
  avgSessionDuration    Float?   // 分钟
  preferredReadingTime  String?  // morning/afternoon/evening/night
  completionRate        Float?   // 历史完读率

  // 社交特征
  followingAuthors      String[]
  friendIds             String[]

  // Embedding
  userEmbedding         Float[]  // 用户向量表示

  updatedAt             DateTime @updatedAt
}

model UserReadingHistory {
  id                    String   @id @default(uuid())
  userId                String
  bookId                String

  status                String   // reading/completed/dropped
  progress              Float    // 0-1
  startedAt             DateTime
  completedAt           DateTime?
  totalReadingTime      Int      // 分钟
  highlightCount        Int      @default(0)
  noteCount             Int      @default(0)
  rating                Float?

  @@index([userId])
  @@index([bookId])
}
```

### 7.3 Dashboard 配置模型

```prisma
model DashboardBookList {
  id                    String   @id @default(uuid())
  name                  String
  description           String?

  priority              Int      @default(50)
  displayPosition       String   // top/banner/section
  displayStyle          String   // carousel/grid/list

  targetSegments        String[] // all/new_user/premium/region:cn
  startTime             DateTime
  endTime               DateTime
  status                String   @default("draft") // draft/active/expired

  books                 Json     // [{ bookId, sortOrder, customCover?, customDescription? }]

  createdBy             String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([status, startTime, endTime])
}
```

---

## 8. API 设计

### 8.1 发现页 API

```typescript
// GET /api/discover/books
interface DiscoverBooksRequest {
  page?: number;
  pageSize?: number;          // 默认 20
  categoryFilter?: string;    // 可选类别过滤
  sortBy?: 'recommended' | 'popular' | 'new' | 'rating';
  refreshToken?: string;      // 用于多样性刷新
}

interface DiscoverBooksResponse {
  books: BookWithScores[];
  page: number;
  totalPages: number;
  refreshToken: string;       // 下次请求用
}

interface BookWithScores {
  book: Book;
  scores: {
    final: number;
    quality: number;
    popularity: number;
    personalization: number;
    authorPopularity: number;
    freshness: number;
    diversity: number;
  };
  source: 'dashboard' | 'ai_recommend' | 'algorithm';
  sourceDetail?: string;      // 如 "编辑精选：春日读书季"
}
```

### 8.2 Dashboard 管理 API

```typescript
// POST /api/admin/dashboard/booklists
// PUT /api/admin/dashboard/booklists/:id
// DELETE /api/admin/dashboard/booklists/:id
// GET /api/admin/dashboard/booklists

interface CreateBookListRequest {
  name: string;
  description?: string;
  priority: number;
  displayPosition: 'top' | 'banner' | 'section';
  targetSegments: string[];
  startTime: string;
  endTime: string;
  books: {
    bookId: string;
    sortOrder: number;
    customCover?: string;
    customDescription?: string;
  }[];
}
```

### 8.3 分数更新 Job

```typescript
// 定时任务：每小时更新热度分数
async function updatePopularityScores() {
  const books = await prisma.book.findMany();

  for (const book of books) {
    const stats = await getBookStats(book.id);
    const popularityScore = calculatePopularityScore(stats);
    const trendingScore = calculateTrendingScore(stats);

    await prisma.book.update({
      where: { id: book.id },
      data: {
        popularityScore,
        trendingScore,
        lastScoreUpdate: new Date()
      }
    });
  }
}

// 定时任务：每天更新质量分数
async function updateQualityScores() {
  // ...
}
```

---

## 9. 算法调优与监控

### 9.1 A/B 测试框架

```typescript
interface ABTestConfig {
  testId: string;
  name: string;

  // 权重变体
  variants: {
    name: string;
    weights: Partial<ScoringWeights>;
    trafficPercent: number;
  }[];

  // 指标跟踪
  metrics: ('ctr' | 'read_time' | 'completion_rate' | 'rating' | 'retention')[];

  startTime: Date;
  endTime: Date;
}

// 示例：测试个性化权重
const personalizeTest: ABTestConfig = {
  testId: 'personalization_weight_v2',
  name: 'Personalization Weight Test',
  variants: [
    { name: 'control', weights: { personalization: 0.25 }, trafficPercent: 50 },
    { name: 'high_personalization', weights: { personalization: 0.35 }, trafficPercent: 50 }
  ],
  metrics: ['ctr', 'read_time', 'completion_rate'],
  startTime: new Date('2024-01-01'),
  endTime: new Date('2024-01-14')
};
```

### 9.2 监控指标

| 指标 | 说明 | 目标 |
|------|------|------|
| **发现页 CTR** | 曝光点击率 | > 15% |
| **首屏点击率** | 首屏书籍点击率 | > 25% |
| **阅读转化率** | 点击后开始阅读比例 | > 40% |
| **加架率** | 点击后加入书架比例 | > 20% |
| **平均滑动深度** | 用户平均浏览位置 | > 10本 |
| **多样性指数** | 点击书籍类别分散度 | > 0.6 |
| **新书曝光率** | 7天内新书曝光占比 | > 10% |

### 9.3 异常检测

```typescript
interface AnomalyDetection {
  // 热度突增检测 (可能刷量)
  detectUnusualPopularitySpike(bookId: string): Promise<boolean>;

  // 评分异常检测 (水军)
  detectRatingManipulation(bookId: string): Promise<boolean>;

  // 信息茧房检测 (推荐单一化)
  detectFilterBubble(userId: string): Promise<boolean>;
}
```

---

## 10. 实现路线图

### Phase 1: MVP (2周)

- [ ] 实现基础书籍质量分计算
- [ ] 实现基础热度分计算
- [ ] 完成 Dashboard 书单配置功能
- [ ] 发现页 API 基础实现

### Phase 2: 个性化 (2周)

- [ ] 用户画像收集与存储
- [ ] 实现个性化分计算
- [ ] 集成 AI 推荐模块
- [ ] 多样性算法实现

### Phase 3: 优化 (2周)

- [ ] 作者热度分计算
- [ ] 社交热度分计算
- [ ] 时效热点分计算
- [ ] A/B 测试框架

### Phase 4: 高级 (持续)

- [ ] 实时个性化推荐
- [ ] 深度学习排序模型
- [ ] 多目标优化
- [ ] 用户反馈闭环

---

## 11. 附录

### 11.1 归一化函数

```typescript
// 对数归一化 (适用于长尾分布数据)
function logNormalize(value: number, base: number = 10, max: number = 6): number {
  return Math.min(1, Math.log(value + 1) / Math.log(base) / max);
}

// 高斯归一化 (适用于偏好匹配)
function gaussianNormalize(
  value: number,
  target: number,
  sigma: number = 1
): number {
  return Math.exp(-Math.pow(value - target, 2) / (2 * sigma * sigma));
}

// Sigmoid 归一化 (适用于增长率)
function sigmoidNormalize(value: number, k: number = 1): number {
  return 1 / (1 + Math.exp(-k * value));
}
```

### 11.2 冷启动策略

| 场景 | 策略 |
|------|------|
| **新用户** | 展示编辑精选 + 全站热门 + 类别引导 |
| **新书籍** | 编辑冷启动扶持 + 相似书籍推荐位借流 |
| **新作者** | 基于作品内容的向量匹配推荐 |

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 设计中 | 0% | 2025-12-23 | 算法设计文档完成，代码实现待开发 |

### 已完成 ✅
- [x] 算法整体架构设计（三级优先级架构）
- [x] 8个评分维度设计文档
- [x] 每个维度包含5+影响因子
- [x] 数据模型设计（TypeScript接口 + Prisma Schema）
- [x] 行业最佳实践调研（8大平台）
- [x] A/B测试框架设计
- [x] 冷启动策略设计

### 进行中 🚧
- [ ] 等待用户行为数据收集系统完成

### 待开发 📝

**Phase 1: 基础排序 (2周)**
- [ ] BookScore 基础数据模型实现（Prisma）
- [ ] 实现基础书籍质量分计算
- [ ] 实现基础热度分计算
- [ ] 完成 Dashboard 书单配置功能
- [ ] 发现页 API 基础实现

**Phase 2: 个性化 (2周)**
- [ ] 用户画像收集与存储（UserPreference模型）
- [ ] 实现个性化分计算
- [ ] 集成 AI 推荐模块
- [ ] 多样性算法实现

**Phase 3: 优化 (2周)**
- [ ] 作者热度分计算
- [ ] 社交热度分计算（SocialHeatScore）
- [ ] 时效热点分计算（TrendingScore）
- [ ] A/B 测试框架实现

**Phase 4: 高级功能 (持续)**
- [ ] 实时个性化推荐
- [ ] 深度学习排序模型
- [ ] 多目标优化
- [ ] 用户反馈闭环

### 依赖项
- 📝 需要用户行为追踪系统（阅读时长、划线、笔记等）
- 📝 需要后台榜单管理界面（Dashboard配置）
- 📝 需要AI推荐服务集成
- 📝 需要用户画像存储设计

### 技术债务
- 算法冷启动阶段可使用简化版（仅质量分+热度分）
- 缺少实时计算性能测试
- 需要设计算法结果缓存策略

---

*文档版本: 1.0*
*创建日期: 2024-12*
*状态: 待 Review*
