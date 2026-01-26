# 后端架构

### 4.1 模块划分

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     NestJS 后端模块架构                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  src/                                                                   │
│  ├── main.ts                   # 应用入口                               │
│  ├── app.module.ts             # 根模块                                 │
│  │                                                                      │
│  ├── common/                   # 公共模块                               │
│  │   ├── decorators/           # 自定义装饰器                           │
│  │   ├── filters/              # 异常过滤器                             │
│  │   ├── guards/               # 认证守卫                               │
│  │   ├── interceptors/         # 拦截器                                 │
│  │   ├── pipes/                # 管道                                   │
│  │   └── utils/                # 工具函数                               │
│  │                                                                      │
│  ├── modules/                                                           │
│  │   ├── admin/                # 管理后台模块                           │
│  │   │   ├── admin.module.ts                                            │
│  │   │   ├── admin.controller.ts                                        │
│  │   │   └── admin.service.ts                                           │
│  │   │                                                                  │
│  │   ├── ai/                   # AI服务模块 (扩展版)                    │
│  │   │   ├── ai.module.ts                                               │
│  │   │   ├── ai.controller.ts                                           │
│  │   │   ├── ai.service.ts                                              │
│  │   │   ├── ai-extended.service.ts    # 扩展AI服务 (22+端点)           │
│  │   │   ├── ai-router.service.ts      # AI模型路由                     │
│  │   │   ├── providers/                                                 │
│  │   │   │   ├── deepseek.provider.ts                                   │
│  │   │   │   ├── openai.provider.ts                                     │
│  │   │   │   └── anthropic.provider.ts                                  │
│  │   │   └── dto/                                                       │
│  │   │                                                                  │
│  │   ├── analytics/            # 分析模块                               │
│  │   │   ├── analytics.module.ts                                        │
│  │   │   ├── analytics.controller.ts                                    │
│  │   │   └── analytics.service.ts                                       │
│  │   │                                                                  │
│  │   ├── auth/                 # 认证模块                               │
│  │   │   ├── auth.module.ts                                             │
│  │   │   ├── auth.controller.ts                                         │
│  │   │   ├── auth.service.ts                                            │
│  │   │   ├── strategies/       # Passport策略                           │
│  │   │   │   ├── jwt.strategy.ts                                        │
│  │   │   │   ├── apple.strategy.ts                                      │
│  │   │   │   └── google.strategy.ts                                     │
│  │   │   └── dto/                                                       │
│  │   │                                                                  │
│  │   ├── badges/               # 徽章成就模块 (新增)                    │
│  │   │   ├── badges.module.ts                                           │
│  │   │   ├── badges.controller.ts                                       │
│  │   │   └── badges.service.ts                                          │
│  │   │                                                                  │
│  │   ├── booklists/            # 书单排行模块 (新增)                    │
│  │   │   ├── booklists.module.ts                                        │
│  │   │   ├── booklists.controller.ts                                    │
│  │   │   └── booklists.service.ts                                       │
│  │   │                                                                  │
│  │   ├── books/                # 书籍模块                               │
│  │   │   ├── books.module.ts                                            │
│  │   │   ├── books.controller.ts                                        │
│  │   │   ├── books.service.ts                                           │
│  │   │   ├── entities/                                                  │
│  │   │   │   ├── book.entity.ts                                         │
│  │   │   │   └── chapter.entity.ts                                      │
│  │   │   └── dto/                                                       │
│  │   │                                                                  │
│  │   ├── logs/                 # 客户端日志模块 (新增)                  │
│  │   │   ├── logs.module.ts                                             │
│  │   │   ├── logs.controller.ts                                         │
│  │   │   └── logs.service.ts                                            │
│  │   │                                                                  │
│  │   ├── reading/              # 阅读模块 (扩展版)                      │
│  │   │   ├── reading.module.ts                                          │
│  │   │   ├── reading.controller.ts                                      │
│  │   │   ├── reading.service.ts                                         │
│  │   │   └── entities/                                                  │
│  │   │       └── reading-progress.entity.ts                             │
│  │   │                                                                  │
│  │   ├── subscriptions/        # 订阅模块                               │
│  │   │   ├── subscriptions.module.ts                                    │
│  │   │   ├── subscriptions.controller.ts                                │
│  │   │   ├── subscriptions.service.ts                                   │
│  │   │   ├── apple-iap.service.ts      # Apple内购                      │
│  │   │   └── entities/                                                  │
│  │   │       └── subscription.entity.ts                                 │
│  │   │                                                                  │
│  │   ├── tracking/             # 用户活动追踪模块 (新增)                │
│  │   │   ├── tracking.module.ts                                         │
│  │   │   ├── tracking.controller.ts                                     │
│  │   │   └── tracking.service.ts                                        │
│  │   │                                                                  │
│  │   ├── users/                # 用户模块 (扩展版)                      │
│  │   │   ├── users.module.ts                                            │
│  │   │   ├── users.controller.ts                                        │
│  │   │   ├── users.service.ts                                           │
│  │   │   ├── entities/                                                  │
│  │   │   │   └── user.entity.ts                                         │
│  │   │   └── dto/                                                       │
│  │   │                                                                  │
│  │   ├── vocabulary/           # 词汇模块 (扩展版)                      │
│  │   │   ├── vocabulary.module.ts                                       │
│  │   │   ├── vocabulary.controller.ts                                   │
│  │   │   ├── vocabulary.service.ts      # 含SM-2间隔重复算法            │
│  │   │   └── entities/                                                  │
│  │   │       ├── word.entity.ts                                         │
│  │   │       └── user-word.entity.ts                                    │
│  │   │                                                                  │
│  │   ├── quotes/               # 金句/名言模块 (新增)                   │
│  │   │   ├── quotes.module.ts                                           │
│  │   │   ├── quotes.controller.ts                                       │
│  │   │   └── quotes.service.ts                                          │
│  │   │                                                                  │
│  │   └── postcards/            # 明信片模块 (新增)                      │
│  │       ├── postcards.module.ts                                        │
│  │       ├── postcards.controller.ts                                    │
│  │       └── postcards.service.ts                                       │
│  │                                                                      │
│  └── config/                   # 配置                                   │
│      ├── database.config.ts                                             │
│      ├── redis.config.ts                                                │
│      └── ai.config.ts                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 核心服务设计

#### 4.2.1 AI服务网关

```typescript
// AI Router 设计 (扩展版)
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI Router Service                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  请求路由逻辑：                                                          │
│  ──────────────                                                          │
│                                                                         │
│  基础功能 (免费/付费用户均可使用):                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  TaskType         Model Selection        Cost/Quality           │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  WORD_EXPLAIN     → DeepSeek            低成本，够用             │    │
│  │  SENTENCE_SIMPLIFY→ DeepSeek            低成本，够用             │    │
│  │  PARAGRAPH_TRANS  → DeepSeek/GPT-4o-mini 中等成本               │    │
│  │  CONTENT_QA       → GPT-4o-mini         中等成本，质量好         │    │
│  │  CHAPTER_SUMMARY  → DeepSeek            低成本，批量预生成       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  高级AI阅读辅助 (新增):                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  DIFFICULTY_ANALYZE→ DeepSeek           文本难度分析             │    │
│  │  KEY_VOCABULARY   → DeepSeek            关键词汇提取             │    │
│  │  READING_GUIDE    → GPT-4o-mini         阅读指南生成             │    │
│  │  COMPREHENSION    → GPT-4o-mini         阅读理解检查             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  深度文学分析 (付费专属):                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  LITERARY_ANALYSIS→ Claude Sonnet       高成本，付费专属         │    │
│  │  CHARACTER_ANALYSIS→ Claude Sonnet      人物深度分析             │    │
│  │  THEME_ANALYSIS   → Claude Sonnet       主题分析                 │    │
│  │  WRITING_STYLE    → Claude Sonnet       写作风格分析             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  语法学习功能 (新增):                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  GRAMMAR_ANALYZE  → DeepSeek            语法结构分析             │    │
│  │  SIMILAR_PATTERNS → DeepSeek            相似句型查找             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  学习辅助功能 (新增):                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  WORD_ASSOCIATIONS→ DeepSeek            词汇联想                 │    │
│  │  CONTEXT_EXAMPLES → DeepSeek            语境示例                 │    │
│  │  PRONUNCIATION    → DeepSeek            发音技巧                 │    │
│  │  MEMORY_AIDS      → DeepSeek            记忆辅助                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  对话式AI (新增):                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CHAT_START       → GPT-4o-mini         开始AI对话               │    │
│  │  CHAT_MESSAGE     → GPT-4o-mini         对话消息处理             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  降级策略：                                                              │
│  ──────────                                                              │
│  DeepSeek失败 → GPT-4o-mini → Claude Haiku → 返回错误                   │
│                                                                         │
│  缓存策略：                                                              │
│  ──────────                                                              │
│  • 相同词汇+相同上下文 → 缓存命中                                       │
│  • 缓存Key: hash(word + context_snippet + task_type)                    │
│  • 缓存TTL: 7天 (基础查询), 30天 (深度分析)                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 4.2.2 间隔重复算法

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Spaced Repetition System                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  基于SM-2算法改进：                                                      │
│  ─────────────────                                                       │
│                                                                         │
│  输入：                                                                  │
│  • 用户对单词的评分 (0-5)                                               │
│    0: 完全不记得                                                        │
│    1: 错误，但看到答案后记起                                            │
│    2: 错误，但感觉熟悉                                                  │
│    3: 正确，但很困难                                                    │
│    4: 正确，有一点犹豫                                                  │
│    5: 完美记忆                                                          │
│                                                                         │
│  算法：                                                                  │
│  ─────                                                                   │
│  if (rating < 3) {                                                      │
│    // 重置到第一级                                                      │
│    repetition = 0                                                       │
│    interval = 1 day                                                     │
│  } else {                                                               │
│    // 增加间隔                                                          │
│    if (repetition == 0) interval = 1 day                                │
│    else if (repetition == 1) interval = 6 days                          │
│    else interval = interval * easeFactor                                │
│                                                                         │
│    repetition++                                                         │
│  }                                                                      │
│                                                                         │
│  // 调整简易度因子                                                       │
│  easeFactor = easeFactor + (0.1 - (5 - rating) * 0.08)                  │
│  easeFactor = max(1.3, easeFactor)                                      │
│                                                                         │
│  // 个性化调整（AI增强）                                                 │
│  ──────────────────────                                                  │
│  • 根据用户历史学习数据调整初始easeFactor                               │
│  • 考虑单词难度（基于用户群体数据）                                     │
│  • 考虑即将阅读的书籍中是否包含该词                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

