# 即时双语心流模式 (Instant Bilingual Flow)

> 零延迟获取翻译，多种阅读模式切换，从"翻译阅读"过渡到"英文直觉"

## 功能概述

| 项目 | 说明 |
|------|------|
| 目标平台 | iOS 优先 (React Native/Expo) |
| 数据依赖 | 全部 200+ 本书 |
| 核心价值 | 阅读速度提升 30%，追踪翻译依赖度评估进步 |

---

## 四种阅读模式

| 模式 | 描述 | 数据源 | 适用场景 |
|------|------|--------|----------|
| **纯英文** | 原文显示 | EPUB原文 | 沉浸式练习 |
| **按需翻译** | 长按段落显示中文 | 缓存/AI实时 | 日常阅读 (推荐) |
| **段落交替** | 英文段落下方显示中文 | 预加载 | 精读学习 |
| **逐句对照** | 中英并排显示 | 预加载 | 翻译学习 |

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        iOS App                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                               │
│  │ readerStore │  │ settingsStore│                              │
│  │ • mode      │  │ • readingMode│                              │
│  │ • transCache│  │              │                              │
│  └──────┬──────┘  └──────┬──────┘                               │
│         │                │                                       │
│         ▼                ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   AdaptiveReader                          │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │              EPUBReader (WebView)                   │   │  │
│  │  │  • Mode-based Rendering                            │   │  │
│  │  │  • Long-press Detection                            │   │  │
│  │  │  • Paragraph Interleave                            │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────┐  ┌────────────────────────────┐   │  │
│  │  │ ReadingModeSelector│  │ TranslationPanel           │   │  │
│  │  └────────────────────┘  └────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                 │
│  POST /reader/translate ── 翻译段落(带缓存)                       │
│  GET /reader/translations/:bookId/:order ── 批量获取缓存翻译      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 翻译数据源策略

```
┌──────────────────────────────────────────────────────────────┐
│                    Translation Source Router                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Is Bilingual Book?                                          │
│       │                                                      │
│       ├── YES ──► 使用 BilingualParagraph.translatedText     │
│       │           (预对齐，高质量)                             │
│       │                                                      │
│       └── NO ───► 检查 TranslationCache                      │
│                       │                                      │
│                       ├── HIT ──► 返回缓存翻译               │
│                       │                                      │
│                       └── MISS ─► AI 翻译 + 存入缓存          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## UI 设计

### 模式切换器

```
┌─────────────────────────────────────────┐
│            阅读模式                      │
├─────────────────────────────────────────┤
│  ○ 纯英文        沉浸式阅读              │
│  ● 按需翻译      长按显示中文 (推荐)      │
│  ○ 段落交替      中英交替显示            │
│  ○ 逐句对照      并排对照学习            │
└─────────────────────────────────────────┘
```

### 按需翻译面板

```
┌─────────────────────────────────────────┐
│ 长按段落后弹出                           │
├─────────────────────────────────────────┤
│                                         │
│  The old house stood at the edge of    │
│  the forest, its windows dark and      │
│  shuttered against the autumn wind.    │
│                                         │
├─────────────────────────────────────────┤
│  那座老房子矗立在森林边缘，窗户紧闭，     │
│  遮挡着秋风。                            │
│                                         │
├─────────────────────────────────────────┤
│              [关闭]                      │
└─────────────────────────────────────────┘
```

### 段落交替模式

```
┌─────────────────────────────────────────┐
│ The old house stood at the edge of     │
│ the forest, its windows dark and       │
│ shuttered against the autumn wind.     │
├─────────────────────────────────────────┤
│ 那座老房子矗立在森林边缘，窗户紧闭，     │
│ 遮挡着秋风。                            │
├─────────────────────────────────────────┤
│ Sarah paused at the rusted gate,       │
│ memories flooding back unbidden.       │
├─────────────────────────────────────────┤
│ 莎拉在生锈的大门前停下脚步，            │
│ 记忆不由自主地涌上心头。                 │
└─────────────────────────────────────────┘
```

### 逐句对照模式

```
┌────────────────────┬────────────────────┐
│ The old house      │ 那座老房子矗立在    │
│ stood at the edge  │ 森林边缘，窗户紧闭，│
│ of the forest.     │ 遮挡着秋风。        │
├────────────────────┼────────────────────┤
│ Sarah paused at    │ 莎拉在生锈的大门前  │
│ the rusted gate.   │ 停下脚步。          │
└────────────────────┴────────────────────┘
```

---

## API 设计

### POST `/reader/translate`

翻译单个段落，优先返回缓存。

**请求参数:**
- bookId: 书籍ID
- chapterOrder: 章节序号
- paragraphIndex: 段落索引
- text: 原文内容
- textHash: 文本哈希 (SHA-256，用于缓存键)

**响应内容:**
- translation: 翻译结果
- fromCache: 是否来自缓存

### GET `/reader/translations/:bookId/:order`

批量获取章节所有段落的缓存翻译，用于段落交替/逐句对照模式预加载。

**响应内容:**
- translations: 段落翻译映射 (paragraphHash → translation)
- coverage: 缓存覆盖率百分比

---

## 数据库变更

### 新增表: TranslationCache

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| bookId | UUID | 书籍ID |
| chapterOrder | Int | 章节序号 |
| paragraphIndex | Int | 段落索引 |
| textHash | String(64) | 原文哈希 |
| originalText | Text | 原文 |
| translatedText | Text | 译文 |
| modelUsed | String(50) | 使用的AI模型 |
| createdAt | DateTime | 创建时间 |

**索引:** (bookId, textHash) 唯一, (bookId, chapterOrder)

### 新增表: ReadingModeUsage

用于追踪用户阅读模式使用情况，评估翻译依赖度。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID |
| bookId | UUID | 书籍ID |
| readingMode | Enum | 阅读模式 |
| translationsUsed | Int | 使用翻译次数 |
| startedAt | DateTime | 开始时间 |
| endedAt | DateTime | 结束时间 |

**阅读模式枚举:** PURE_ENGLISH, ON_DEMAND, PARAGRAPH_INTERLEAVED, SENTENCE_ALIGNED

---

## 性能优化

| 缓存层 | 数据 | TTL | 存储位置 |
|--------|------|-----|----------|
| Redis | AI翻译 | 90天 | 服务器 |
| PostgreSQL | 翻译缓存 | 永久 | 服务器 |
| 内存 | 章节翻译 | 会话期间 | 客户端 |

### 优化策略

1. **翻译预取**: 切换到段落交替/逐句对照模式时，后台预取整章翻译
2. **按需翻译缓存**: 用户长按翻译后自动缓存到服务器
3. **双语书籍优先**: 7本已处理书籍直接使用高质量预对齐翻译

---

## 文件清单

### 新建文件

**后端:**
| 文件 | 描述 |
|------|------|
| `modules/reader/dto/translate.dto.ts` | 翻译请求/响应 DTO |

**移动端:**
| 文件 | 描述 |
|------|------|
| `features/reader/components/ReadingModeSelector.tsx` | 模式切换 UI |
| `features/reader/components/TranslationPanel.tsx` | 按需翻译面板 |
| `features/reader/hooks/useTranslation.ts` | 翻译 Hook |

**数据库:**
| 文件 | 描述 |
|------|------|
| `packages/database/prisma/migrations/xxx_add_translation_cache.sql` | 新表迁移 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `packages/database/prisma/schema.prisma` | 添加 TranslationCache, ReadingModeUsage |
| `apps/backend/src/modules/reader/reader.service.ts` | 添加翻译逻辑 |
| `apps/backend/src/modules/reader/reader.controller.ts` | 添加翻译端点 |
| `apps/mobile/src/stores/settingsStore.ts` | 添加阅读模式设置 |
| `apps/mobile/src/features/reader/components/EPUBReader.tsx` | 集成模式渲染 |
| `apps/mobile/src/features/reader/components/ReaderControls.tsx` | 添加模式切换入口 |

---

## 实现计划

### Phase 1: 基础设施
- [ ] 添加 `TranslationCache` 表迁移
- [ ] 实现 `/reader/translate` 端点
- [ ] 扩展 `settingsStore` 添加阅读模式

### Phase 2: 纯英文 + 按需翻译
- [ ] 创建 `ReadingModeSelector` 组件
- [ ] 实现纯英文模式 (默认)
- [ ] 实现长按检测
- [ ] 创建 `TranslationPanel` 组件
- [ ] 实现按需翻译 (长按)

### Phase 3: 段落交替 + 逐句对照
- [ ] 实现 `/reader/translations/:bookId/:order` 端点
- [ ] 实现段落交替模式渲染
- [ ] 实现逐句对照模式渲染
- [ ] 翻译预加载优化

### Phase 4: 数据追踪
- [ ] 添加 `ReadingModeUsage` 表
- [ ] 实现模式使用追踪
- [ ] 翻译依赖度统计
