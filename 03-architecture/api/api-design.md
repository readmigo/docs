# API设计

### 7.1 API规范

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Design Principles                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. RESTful设计                                                         │
│     • 资源导向的URL设计                                                 │
│     • 正确使用HTTP方法和状态码                                          │
│     • 一致的响应格式                                                    │
│                                                                         │
│  2. 版本管理                                                            │
│     • URL路径版本: /api/v1/...                                          │
│     • 向后兼容，重大变更升级版本                                        │
│                                                                         │
│  3. 认证方式                                                            │
│     • Bearer Token (JWT)                                                │
│     • Authorization: Bearer <token>                                     │
│                                                                         │
│  4. 响应格式                                                            │
│     成功响应:                                                           │
│     {                                                                   │
│       "success": true,                                                  │
│       "data": { ... },                                                  │
│       "meta": { "page": 1, "total": 100 }                               │
│     }                                                                   │
│                                                                         │
│     错误响应:                                                           │
│     {                                                                   │
│       "success": false,                                                 │
│       "error": {                                                        │
│         "code": "VALIDATION_ERROR",                                     │
│         "message": "Invalid email format",                              │
│         "details": { ... }                                              │
│       }                                                                 │
│     }                                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 核心API端点

```yaml
# ============================================================
# 认证相关 API
# ============================================================

POST /api/v1/auth/apple
  # Apple登录
  Request:
    identityToken: string    # Apple提供的identityToken
    authorizationCode: string
  Response:
    accessToken: string
    refreshToken: string
    user: User
    isNewUser: boolean

POST /api/v1/auth/google
  # Google登录
  Request:
    idToken: string
  Response:
    accessToken: string
    refreshToken: string
    user: User
    isNewUser: boolean

POST /api/v1/auth/refresh
  # 刷新Token
  Request:
    refreshToken: string
  Response:
    accessToken: string
    refreshToken: string

# ============================================================
# 用户相关 API
# ============================================================

GET /api/v1/users/me
  # 获取当前用户信息
  Response:
    user: User
    subscription: Subscription
    stats: UserStats

PATCH /api/v1/users/me
  # 更新用户信息
  Request:
    displayName?: string
    nativeLanguage?: string
    englishLevel?: string
    dailyGoalMinutes?: number
  Response:
    user: User

POST /api/v1/users/me/assessment
  # 提交水平测评
  Request:
    answers: AssessmentAnswer[]
  Response:
    level: string           # beginner/intermediate/advanced
    recommendedBooks: Book[]

# ============================================================
# 书籍相关 API
# ============================================================

GET /api/v1/books
  # 获取书籍列表
  Query:
    page?: number
    limit?: number
    difficulty?: string     # easy/medium/hard
    subjects?: string[]
    sort?: string           # popular/newest/difficulty
    search?: string
  Response:
    books: Book[]
    meta: { page, total, hasMore }

GET /api/v1/books/:bookId
  # 获取书籍详情
  Response:
    book: Book
    chapters: Chapter[]
    userProgress?: UserBookProgress

GET /api/v1/books/:bookId/content/:chapterId
  # 获取章节内容
  Response:
    chapter: Chapter
    content: string         # HTML内容
    vocabulary: Word[]      # 本章关键词汇

GET /api/v1/books/recommendations
  # 获取个性化推荐
  Response:
    recommendations: RecommendedBook[]
    # 每本书包含匹配度、推荐理由等

POST /api/v1/books/import
  # 导入书籍 (EPUB上传)
  Request:
    file: File (multipart)
  Response:
    book: Book
    processingStatus: string

# ============================================================
# 阅读相关 API
# ============================================================

GET /api/v1/reading/library
  # 获取用户书架
  Query:
    status?: string         # reading/want_to_read/finished
  Response:
    books: UserBook[]

POST /api/v1/reading/library/:bookId
  # 添加书籍到书架
  Request:
    status?: string
  Response:
    userBook: UserBook

PATCH /api/v1/reading/progress/:bookId
  # 更新阅读进度
  Request:
    currentChapter: number
    currentPosition: string  # EPUB CFI
    progressPercent: number
  Response:
    userBook: UserBook

POST /api/v1/reading/sessions
  # 创建阅读会话
  Request:
    bookId: string
    startPosition: string
  Response:
    sessionId: string

PATCH /api/v1/reading/sessions/:sessionId
  # 结束阅读会话
  Request:
    endPosition: string
    wordsLookedUp: number
    aiInteractions: number
  Response:
    session: ReadingSession
    dailyStats: DailyStats

# ============================================================
# AI服务 API (扩展版 - 22+端点)
# ============================================================

# --- 基础AI服务 ---

POST /api/v1/ai/explain
  # AI解释文本
  Request:
    text: string            # 要解释的文字
    context: string         # 上下文 (前后100字符)
    bookId?: string
    type: 'word' | 'sentence' | 'paragraph'
  Response:
    explanation: string
    partOfSpeech?: string
    examples?: string[]
    cached: boolean

POST /api/v1/ai/simplify
  # AI简化句子
  Request:
    sentence: string
    context: string
  Response:
    simplified: string
    explanation: string

POST /api/v1/ai/translate
  # AI翻译
  Request:
    text: string
    targetLanguage: string
  Response:
    translation: string

POST /api/v1/ai/ask
  # AI问答
  Request:
    question: string
    bookId?: string
    chapterId?: string
  Response:
    answer: string
    references?: string[]

POST /api/v1/ai/summarize
  # 生成摘要
  Request:
    bookId: string
    chapterId?: string
    type: 'chapter' | 'book'
  Response:
    summary: string

# --- 高级AI阅读辅助 (新增) ---

POST /api/v1/ai/reading/analyze-difficulty
  # 分析文本难度
  Request:
    text: string
    bookId?: string
  Response:
    difficultyScore: number
    difficultWords: string[]
    suggestions: string[]

POST /api/v1/ai/reading/key-vocabulary
  # 提取关键词汇
  Request:
    text: string
    chapterId?: string
    limit?: number
  Response:
    vocabulary: KeyWord[]

POST /api/v1/ai/reading/reading-guide
  # 生成阅读指南
  Request:
    bookId: string
    chapterId?: string
  Response:
    guide: ReadingGuide

POST /api/v1/ai/reading/comprehension-check
  # 阅读理解检查
  Request:
    bookId: string
    chapterId: string
  Response:
    questions: ComprehensionQuestion[]

# --- 深度文学分析 (付费功能) ---

POST /api/v1/ai/analysis/literary
  # 文学深度分析
  Request:
    bookId: string
    chapterId?: string
    aspectType: 'theme' | 'character' | 'style' | 'symbolism'
  Response:
    analysis: LiteraryAnalysis

POST /api/v1/ai/analysis/character
  # 人物分析
  Request:
    bookId: string
    characterName: string
  Response:
    character: CharacterAnalysis

POST /api/v1/ai/analysis/themes
  # 主题分析
  Request:
    bookId: string
  Response:
    themes: ThemeAnalysis[]

POST /api/v1/ai/analysis/writing-style
  # 写作风格分析
  Request:
    bookId: string
    sampleText?: string
  Response:
    styleAnalysis: WritingStyleAnalysis

# --- 语法学习功能 (新增) ---

POST /api/v1/ai/grammar/analyze
  # 语法分析
  Request:
    sentence: string
    context?: string
  Response:
    structure: GrammarStructure
    explanation: string

POST /api/v1/ai/grammar/similar-patterns
  # 相似句型
  Request:
    pattern: string
    bookId?: string
  Response:
    patterns: SimilarPattern[]

# --- 学习辅助功能 (新增) ---

POST /api/v1/ai/learning/word-associations
  # 词汇联想
  Request:
    word: string
  Response:
    associations: WordAssociation[]

POST /api/v1/ai/learning/context-examples
  # 语境示例
  Request:
    word: string
    count?: number
  Response:
    examples: ContextExample[]

POST /api/v1/ai/learning/pronunciation-tips
  # 发音技巧
  Request:
    word: string
  Response:
    tips: PronunciationTip

POST /api/v1/ai/learning/memory-aids
  # 记忆辅助
  Request:
    word: string
    context?: string
  Response:
    mnemonics: MemoryAid[]

# --- 对话式AI功能 (新增) ---

POST /api/v1/ai/chat/start
  # 开始AI对话
  Request:
    bookId?: string
    chapterId?: string
    topic?: string
  Response:
    sessionId: string
    greeting: string

POST /api/v1/ai/chat/message
  # 发送对话消息
  Request:
    sessionId: string
    message: string
  Response:
    reply: string
    suggestions?: string[]

POST /api/v1/ai/chat/history
  # 获取对话历史
  Query:
    sessionId: string
  Response:
    messages: ChatMessage[]

# ============================================================
# 词汇学习 API
# ============================================================

GET /api/v1/vocabulary
  # 获取用户生词本
  Query:
    status?: string         # new/learning/mastered
    bookId?: string
    page?: number
    limit?: number
  Response:
    words: UserWord[]
    meta: { page, total }

POST /api/v1/vocabulary
  # 添加生词
  Request:
    word: string
    context: string
    bookId?: string
  Response:
    userWord: UserWord

GET /api/v1/vocabulary/review
  # 获取待复习单词
  Query:
    limit?: number          # 默认20
  Response:
    words: ReviewWord[]
    totalDue: number

POST /api/v1/vocabulary/review
  # 提交复习结果
  Request:
    reviews: ReviewResult[]
    # [{ wordId, rating (0-5), responseTimeMs }]
  Response:
    updated: UserWord[]
    stats: { correct, wrong, newMastered }

# ============================================================
# 订阅相关 API
# ============================================================

GET /api/v1/subscription
  # 获取订阅状态
  Response:
    subscription: Subscription
    features: FeatureFlags

POST /api/v1/subscription/apple/verify
  # 验证Apple收据
  Request:
    receiptData: string
    transactionId: string
  Response:
    subscription: Subscription

POST /api/v1/subscription/apple/webhook
  # Apple服务器通知 (Server-to-Server)
  # 处理订阅状态变更

# ============================================================
# 统计分析 API
# ============================================================

GET /api/v1/stats/dashboard
  # 获取学习仪表盘
  Response:
    today: DailyStats
    streak: { current, longest }
    thisWeek: WeeklyStats
    thisMonth: MonthlyStats

GET /api/v1/stats/history
  # 获取历史统计
  Query:
    startDate: string
    endDate: string
    granularity: 'day' | 'week' | 'month'
  Response:
    stats: Stats[]

# ============================================================
# 书单排行 API (新增)
# ============================================================

GET /api/v1/booklists
  # 获取书单列表
  Query:
    type?: string           # featured/popular/new/category
  Response:
    booklists: BookList[]

GET /api/v1/booklists/:id
  # 获取书单详情
  Response:
    booklist: BookList
    books: Book[]

GET /api/v1/booklists/rankings
  # 获取排行榜
  Query:
    type: string            # popular/trending/top-rated
    period?: string         # week/month/all
    limit?: number
  Response:
    rankings: RankedBook[]

# ============================================================
# 徽章成就 API (新增)
# ============================================================

GET /api/v1/badges
  # 获取所有徽章
  Response:
    badges: Badge[]

GET /api/v1/badges/user
  # 获取用户已获得徽章
  Response:
    earned: UserBadge[]
    total: number

GET /api/v1/badges/progress
  # 获取徽章进度
  Response:
    progress: BadgeProgress[]

# ============================================================
# 用户活动追踪 API (新增)
# ============================================================

POST /api/v1/tracking/event
  # 记录用户事件
  Request:
    eventType: string       # page_view/book_open/word_lookup/etc
    properties?: object     # 事件属性
    timestamp?: string
  Response:
    success: boolean

POST /api/v1/tracking/batch
  # 批量提交事件
  Request:
    events: TrackingEvent[]
  Response:
    success: boolean
    processed: number

GET /api/v1/tracking/daily-progress
  # 获取每日进度
  Response:
    date: string
    readingMinutes: number
    wordsLearned: number
    goalProgress: number

# ============================================================
# 客户端日志 API (新增)
# ============================================================

POST /api/v1/logs
  # 提交单条日志
  Request:
    level: string           # debug/info/warn/error
    message: string
    context?: object
    deviceInfo?: DeviceInfo
  Response:
    success: boolean

POST /api/v1/logs/batch
  # 批量提交日志
  Request:
    logs: LogEntry[]
  Response:
    success: boolean
    received: number

POST /api/v1/logs/crash
  # 提交崩溃报告
  Request:
    crashReport: CrashReport
    deviceInfo: DeviceInfo
  Response:
    reportId: string

# ============================================================
# 离线同步 API (新增)
# ============================================================

POST /api/v1/sync/offline
  # 同步离线数据
  Request:
    sessions: OfflineSession[]
    progress: OfflineProgress[]
    vocabulary: OfflineVocabulary[]
  Response:
    synced: SyncResult
    conflicts: Conflict[]

POST /api/v1/vocabulary/batch
  # 批量添加生词 (自动采集)
  Request:
    bookId: string
    chapterId?: string
    words: BatchWord[]
  Response:
    added: number
    skipped: number
    errors: string[]

# ============================================================
# 金句/名言 API (新增)
# ============================================================

GET /api/v1/quotes
  # 获取金句列表
  Query:
    source?: string         # book/author
    bookId?: string
    author?: string
    tag?: string
    search?: string
    page?: number
    limit?: number
  Response:
    items: Quote[]
    total: number
    page: number
    totalPages: number

GET /api/v1/quotes/daily
  # 获取每日金句
  Response:
    quote: Quote

GET /api/v1/quotes/random
  # 获取随机金句
  Response:
    quote: Quote

GET /api/v1/quotes/trending
  # 获取热门金句
  Query:
    limit?: number
  Response:
    quotes: Quote[]

GET /api/v1/quotes/tags
  # 获取可用标签
  Response:
    tags: string[]

GET /api/v1/quotes/authors
  # 获取可用作者
  Response:
    authors: string[]

GET /api/v1/quotes/book/:bookId
  # 获取书籍金句
  Response:
    items: Quote[]

GET /api/v1/quotes/author/:author
  # 获取作者名言
  Response:
    items: Quote[]

GET /api/v1/quotes/favorites
  # 获取用户收藏金句
  Response:
    items: Quote[]

GET /api/v1/quotes/:id
  # 获取金句详情
  Response:
    quote: Quote

POST /api/v1/quotes/:id/like
  # 点赞金句
  Response:
    success: boolean
    liked: boolean

DELETE /api/v1/quotes/:id/like
  # 取消点赞
  Response:
    success: boolean
    liked: boolean

# ============================================================
# 明信片 API (新增)
# ============================================================

GET /api/v1/postcards/templates
  # 获取明信片模板
  Response:
    templates: PostcardTemplate[]

GET /api/v1/postcards/templates/:id
  # 获取模板详情
  Response:
    template: PostcardTemplate

GET /api/v1/postcards/public
  # 获取公开明信片
  Query:
    contentType?: string    # quote/highlight/custom
    page?: number
    limit?: number
  Response:
    items: Postcard[]
    total: number

GET /api/v1/postcards/mine
  # 获取用户明信片
  Query:
    contentType?: string
    isPublic?: boolean
    page?: number
    limit?: number
  Response:
    items: Postcard[]
    total: number

POST /api/v1/postcards
  # 创建明信片
  Request:
    templateId: string
    content: string
    contentType: string     # quote/highlight/custom
    sourceId?: string
    bookTitle?: string
    author?: string
    isPublic?: boolean
  Response:
    postcard: Postcard
    template: PostcardTemplate

GET /api/v1/postcards/:id
  # 获取明信片详情
  Response:
    postcard: Postcard
    template: PostcardTemplate

PUT /api/v1/postcards/:id
  # 更新明信片
  Request:
    templateId?: string
    content?: string
    isPublic?: boolean
  Response:
    postcard: Postcard

DELETE /api/v1/postcards/:id
  # 删除明信片
  Response:
    success: boolean

POST /api/v1/postcards/:id/share
  # 分享明信片
  Response:
    shareUrl: string
    shareCount: number

GET /api/v1/postcards/:id/image
  # 生成明信片图片
  Response:
    imageUrl: string
    width: number
    height: number

# ============================================================
# 作者 API (核心实体)
# ============================================================

GET /api/v1/authors
  # 获取作者列表
  Query:
    page?: number
    limit?: number
    era?: string            # classical/romantic/victorian/modern/contemporary
    genre?: string
    search?: string
    sort?: string           # name/bookCount/followers
  Response:
    authors: Author[]
    meta: { page, total, hasMore }

GET /api/v1/authors/:id
  # 获取作者详情
  Response:
    author: Author
    stats: {
      bookCount: number
      quoteCount: number
      followerCount: number
    }

GET /api/v1/authors/:id/books
  # 获取作者书籍
  Query:
    sort?: string           # difficulty/publishYear/title
  Response:
    books: Book[]

GET /api/v1/authors/:id/timeline
  # 获取作者时间线
  Response:
    events: TimelineEvent[]

GET /api/v1/authors/:id/quotes
  # 获取作者名言
  Query:
    page?: number
    limit?: number
  Response:
    quotes: Quote[]
    total: number

GET /api/v1/authors/:id/persona
  # 获取作者AI人格设定
  Response:
    persona: AuthorPersona

POST /api/v1/authors/:id/follow
  # 收藏作者
  Response:
    followed: boolean
    followerCount: number

DELETE /api/v1/authors/:id/follow
  # 取消收藏作者
  Response:
    followed: boolean
    followerCount: number

GET /api/v1/authors/favorites
  # 获取用户收藏的作者
  Response:
    authors: Author[]

GET /api/v1/authors/popular
  # 获取热门作者
  Query:
    limit?: number
  Response:
    authors: Author[]

# ============================================================
# AI作者对话 API (核心功能)
# ============================================================

POST /api/v1/chat/sessions
  # 创建对话会话
  Request:
    authorId: string
    mode?: string           # text/voice/video
  Response:
    session: ChatSession
    welcomeMessage: ChatMessage

GET /api/v1/chat/sessions
  # 获取用户对话会话列表
  Query:
    authorId?: string
    page?: number
    limit?: number
  Response:
    sessions: ChatSession[]
    total: number

GET /api/v1/chat/sessions/:id
  # 获取对话会话详情
  Response:
    session: ChatSession
    messages: ChatMessage[]

POST /api/v1/chat/sessions/:id/messages
  # 发送消息
  Request:
    content: string
    audioUrl?: string       # 语音消息
  Response:
    userMessage: ChatMessage
    authorResponse: ChatMessage

DELETE /api/v1/chat/sessions/:id
  # 删除对话会话
  Response:
    success: boolean

GET /api/v1/chat/usage
  # 获取AI对话使用量
  Response:
    daily: {
      textMessages: number
      voiceMinutes: number
      videoMinutes: number
    }
    limits: {
      textMessages: number
      voiceMinutes: number
      videoMinutes: number
    }

# ============================================================
# AI语音服务 API
# ============================================================

POST /api/v1/chat/voice/transcribe
  # 语音转文字
  Request:
    audioFile: File (multipart)
    language?: string
  Response:
    text: string
    duration: number

POST /api/v1/chat/voice/synthesize
  # 文字转语音
  Request:
    text: string
    authorId: string
  Response:
    audioUrl: string
    duration: number

# ============================================================
# AI视频服务 API
# ============================================================

POST /api/v1/chat/video/generate
  # 生成说话视频
  Request:
    text: string
    authorId: string
  Response:
    taskId: string
    status: string          # pending/processing/completed/failed

GET /api/v1/chat/video/:taskId/status
  # 获取视频生成状态
  Response:
    status: string
    progress?: number
    videoUrl?: string
    error?: string
```

### 7.3 WebSocket API

```yaml
# ============================================================
# WebSocket连接
# ============================================================

连接: wss://api.readmigo.app/ws
认证: 连接时携带JWT token

# ============================================================
# 实时同步事件
# ============================================================

# 客户端发送 - 阅读进度同步
{
  "type": "reading_progress",
  "data": {
    "bookId": "uuid",
    "position": "epubcfi(...)",
    "timestamp": 1234567890
  }
}

# 服务器推送 - 其他设备进度更新
{
  "type": "progress_updated",
  "data": {
    "bookId": "uuid",
    "position": "epubcfi(...)",
    "device": "iPad"
  }
}

# 服务器推送 - 复习提醒
{
  "type": "review_reminder",
  "data": {
    "wordsDue": 15,
    "message": "You have 15 words to review!"
  }
}
```

---

