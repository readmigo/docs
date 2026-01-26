# 多语言书籍差异化管理设计

## 1. 背景与目标

### 1.1 问题陈述

当前 Readmigo 平台主要服务英文书籍阅读，但中英文书籍在以下维度存在显著差异：

| 维度 | 英文书籍 | 中文书籍 |
|------|---------|---------|
| 目标用户 | 英语学习者（ESL） | 中文阅读爱好者、国学研究者 |
| 核心价值 | 词汇学习、阅读能力提升 | 古典文化传承、深度阅读 |
| 内容来源 | Gutenberg、Standard Ebooks | 中国哲学书电子化、维基文库中文、书格 |
| 分类体系 | 西方文学分类（小说、非虚构等） | 传统四部分类（经史子集）或现代分类 |
| 辅助功能 | 词汇难度、Flesch 评分 | 拼音标注、古文注释、繁简转换 |

### 1.2 设计目标

1. **统一数据模型**：在同一数据库中管理中英文书籍，避免数据孤岛
2. **差异化展示**：根据语言提供不同的分类、筛选和展示逻辑
3. **可扩展性**：支持未来添加更多语言（日文、韩文等）
4. **运营独立**：允许独立运营中英文内容，互不影响

---

## 2. 数据模型设计

### 2.1 Book 表扩展

```prisma
model Book {
  // 现有字段...

  // 语言相关
  language          String    @default("en")     // 主要语言: en, zh, ja, ko
  languageVariant   String?                       // 语言变体: zh-Hans, zh-Hant, en-US, en-GB

  // 中文书籍专属
  pinyinEnabled     Boolean   @default(false)    // 是否支持拼音标注
  hasAnnotations    Boolean   @default(false)    // 是否有古文注释
  dynasty           String?                       // 朝代（中文古籍）
  originalScript    String?                       // 原文字体: traditional, simplified

  // 难度评估（扩展）
  difficultyScore   Float?                        // 通用难度分（0-100）
  hskLevel          Int?                          // HSK 等级（中文）1-6
  cefrLevel         String?                       // CEFR 等级（英文）A1-C2

  // 分类（多对多）
  categories        BookCategory[]
}
```

### 2.2 Category 表设计

```prisma
model Category {
  id          String   @id @default(uuid())

  // 基本信息
  name        String                              // 英文名称
  nameZh      String?                             // 中文名称
  slug        String   @unique                    // URL 标识符
  description String?

  // 层级结构
  parentId    String?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")

  // 分类体系
  language    String   @default("all")            // 适用语言: all, en, zh
  system      String   @default("modern")         // 分类体系: modern, traditional（四部分类）

  // 显示
  iconName    String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  books       BookCategory[]
}
```

### 2.3 Source 枚举扩展

```prisma
enum BookSource {
  // 英文来源
  STANDARD_EBOOKS
  GUTENBERG
  INTERNET_ARCHIVE

  // 中文来源
  CTEXT              // 中国哲学书电子化计划
  WIKISOURCE_ZH      // 维基文库中文
  SHUGE              // 书格（古籍影印）
  GUTENBERG_ZH       // Gutenberg 中文部分

  // 通用
  USER_UPLOAD
}
```

---

## 3. 分类体系设计

### 3.1 英文分类（现代分类）

```
Fiction（虚构类）
├── Literary Fiction（文学小说）
├── Mystery & Thriller（悬疑惊悚）
├── Science Fiction（科幻）
├── Fantasy（奇幻）
├── Romance（浪漫）
├── Historical Fiction（历史小说）
└── Short Stories（短篇小说）

Non-Fiction（非虚构类）
├── Biography & Memoir（传记回忆录）
├── History（历史）
├── Philosophy（哲学）
├── Science & Nature（科学自然）
├── Politics & Society（政治社会）
└── Self-Help（自我提升）

Children & Young Adult（儿童青少年）
├── Picture Books（绘本）
├── Middle Grade（中年级）
└── Young Adult（青少年）

Poetry & Drama（诗歌戏剧）
├── Poetry Collections（诗集）
└── Plays（戏剧）
```

### 3.2 中文分类

#### 方案 A：传统四部分类（适合古籍）

```
经部（Classics）
├── 易类（I Ching Studies）
├── 书类（Book of Documents）
├── 诗类（Book of Songs）
├── 礼类（Rites）
├── 春秋类（Spring and Autumn）
├── 孝经类（Classic of Filial Piety）
├── 四书类（Four Books）
├── 乐类（Music）
└── 小学类（Philology）

史部（History）
├── 正史类（Official Histories）
├── 编年类（Annals）
├── 纪事本末类（Historical Events）
├── 别史类（Unofficial Histories）
├── 杂史类（Miscellaneous Histories）
├── 诏令奏议类（Imperial Edicts）
├── 传记类（Biographies）
├── 地理类（Geography）
└── 目录类（Bibliographies）

子部（Philosophy）
├── 儒家类（Confucianism）
├── 道家类（Taoism）
├── 法家类（Legalism）
├── 兵家类（Military Strategy）
├── 医家类（Medicine）
├── 农家类（Agriculture）
├── 天文算法类（Astronomy & Math）
├── 术数类（Divination）
├── 艺术类（Arts）
├── 类书类（Encyclopedias）
└── 小说家类（Fiction）

集部（Literature）
├── 楚辞类（Chu Ci）
├── 别集类（Individual Collections）
├── 总集类（Anthologies）
├── 诗文评类（Literary Criticism）
└── 词曲类（Ci Poetry & Drama）
```

#### 方案 B：现代中文分类（适合现代文学）

```
文学（Literature）
├── 古典文学（Classical Literature）
├── 现代文学（Modern Literature）
├── 当代文学（Contemporary Literature）
├── 诗词（Poetry）
└── 戏剧（Drama）

历史（History）
├── 中国古代史（Ancient China）
├── 中国近现代史（Modern China）
└── 世界历史（World History）

哲学思想（Philosophy）
├── 儒学（Confucianism）
├── 道学（Taoism）
├── 佛学（Buddhism）
└── 现代哲学（Modern Philosophy）

社会科学（Social Sciences）
├── 政治（Politics）
├── 经济（Economics）
└── 社会学（Sociology）

自然科学（Natural Sciences）
├── 中医（Traditional Medicine）
├── 天文地理（Astronomy & Geography）
└── 农学（Agriculture）
```

### 3.3 推荐方案

**采用混合模式**：
- 英文书籍：使用现代分类
- 中文古籍：使用传统四部分类
- 中文现代书籍：使用现代中文分类

通过 `Category.system` 字段区分：
- `modern`：现代分类体系
- `traditional`：传统四部分类

---

## 4. Dashboard 管理设计

### 4.1 语言切换器

在 Dashboard 顶部添加语言/市场切换器：

```
┌─────────────────────────────────────────────────────┐
│  📚 Readmigo Admin    [English ▼] [中文 ▼]  [All ▼]│
├─────────────────────────────────────────────────────┤
│  Books | Categories | Users | ...                   │
└─────────────────────────────────────────────────────┘
```

选择后，整个 Dashboard 会：
1. 过滤显示对应语言的书籍
2. 显示对应语言的分类体系
3. 显示对应语言的数据源选项

### 4.2 书籍列表增强

```
┌──────────────────────────────────────────────────────────────────┐
│ Books                                        [+ Add Book]        │
├──────────────────────────────────────────────────────────────────┤
│ Search: [____________]  Language: [All ▼]  Source: [All ▼]      │
├──────────────────────────────────────────────────────────────────┤
│ Cover │ Title          │ Author    │ Lang │ Difficulty │ Status │
├───────┼────────────────┼───────────┼──────┼────────────┼────────┤
│ [img] │ Pride & Prej...│ Austen    │ 🇬🇧  │ ████░ 65   │ Active │
│ [img] │ 论语           │ 孔子      │ 🇨🇳  │ ███░░ HSK5 │ Active │
│ [img] │ Peter Pan      │ Barrie    │ 🇬🇧  │ ███░░ 45   │ Active │
│ [img] │ 道德经         │ 老子      │ 🇨🇳  │ ████░ HSK6 │ Active │
└───────┴────────────────┴───────────┴──────┴────────────┴────────┘
```

### 4.3 分类管理

根据当前语言显示不同的分类树：

**英文模式**：
```
Categories (English)
├── Fiction
│   ├── Literary Fiction
│   ├── Mystery & Thriller
│   └── ...
└── Non-Fiction
    ├── Biography
    └── ...
```

**中文模式**：
```
分类 (中文)
├── 经部
│   ├── 易类
│   └── ...
├── 史部
├── 子部
└── 集部
```

---

## 5. API 设计

### 5.1 书籍查询 API

```typescript
// GET /api/v1/books
interface BookQueryParams {
  language?: 'en' | 'zh' | 'all';
  category?: string;          // category slug
  source?: BookSource;
  difficulty?: {
    min?: number;
    max?: number;
  };
  hskLevel?: number;          // 中文专用
  cefrLevel?: string;         // 英文专用
  dynasty?: string;           // 中文古籍专用
  page?: number;
  limit?: number;
}
```

### 5.2 分类查询 API

```typescript
// GET /api/v1/categories
interface CategoryQueryParams {
  language?: 'en' | 'zh' | 'all';
  system?: 'modern' | 'traditional';
  parentId?: string | null;   // null = 顶级分类
}
```

---

## 6. 实现计划

### Phase 1：数据模型扩展（1-2 天）

- [ ] 扩展 Book 表，添加语言相关字段
- [ ] 扩展 Category 表，添加分类体系字段
- [ ] 扩展 BookSource 枚举，添加中文来源
- [ ] 运行数据库迁移

### Phase 2：Dashboard 增强（2-3 天）

- [ ] 添加语言筛选器到书籍列表
- [ ] 根据语言显示不同的难度指标（HSK vs CEFR）
- [ ] 实现分类管理的语言切换
- [ ] 添加中文书籍专属字段编辑

### Phase 3：分类体系实现（1-2 天）

- [ ] 创建英文现代分类种子数据
- [ ] 创建中文四部分类种子数据
- [ ] 创建中文现代分类种子数据
- [ ] 实现分类树的 CRUD 操作

### Phase 4：内容导入工具（2-3 天）

- [ ] 实现 CTEXT（中国哲学书电子化）导入器
- [ ] 实现维基文库中文导入器
- [ ] 添加拼音标注工具集成
- [ ] 添加繁简转换功能

---

## 7. 开放问题

### 7.1 分类体系选择

**问题**：中文书籍是否同时支持传统四部分类和现代分类？

**选项**：
- A. 只支持一种，根据书籍类型自动选择
- B. 支持两种，允许用户切换
- C. 主要使用现代分类，传统分类作为标签

**建议**：选项 A，古籍使用传统分类，现代书籍使用现代分类

### 7.2 难度评估

**问题**：中文书籍如何评估难度？

**选项**：
- A. 使用 HSK 词汇覆盖率
- B. 自定义算法（字频、句长、古文比例）
- C. 人工标注

**建议**：组合使用，HSK 为主 + 古文复杂度系数

### 7.3 产品分离

**问题**：长期是否需要分离为独立产品？

**当前建议**：保持统一，通过语言筛选区分。如果用户群差异过大，未来可考虑：
- 独立域名（readmigo.app vs 阅友.com）
- 独立 App（Readmigo vs 阅友）
- 共享后端，独立前端

---

## 8. 决策检查清单

请 Review 并确认以下决策：

- [ ] **分类体系**：是否采用混合模式（英文现代 + 中文传统/现代）？
- [ ] **数据模型**：是否同意上述 Book 和 Category 表扩展？
- [ ] **中文来源**：优先接入哪些中文书籍来源？
- [ ] **难度评估**：中文书籍是否使用 HSK 等级？
- [ ] **实现优先级**：是否按照 Phase 1-4 顺序实施？

---

*文档版本: v1.0*
*创建日期: 2025-12-20*
*作者: Claude Code*
