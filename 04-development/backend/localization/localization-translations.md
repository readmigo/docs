# Localization Translations System

> Multi-language content delivery for Discover, Agora, Audiobooks & More

---

## 1. Overview

### 1.1 Design Principles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Unified Localization Architecture                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Principle 1: English as Source of Truth                        │    │
│  │  ════════════════════════════════════                            │    │
│  │  All original data stored in English fields                     │    │
│  │  e.g., book.title = "Pride and Prejudice"                       │    │
│  │        discoverTab.name = "For You"  (English!)                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Principle 2: Single Translation Table                          │    │
│  │  ══════════════════════════════════                              │    │
│  │  ALL translations stored in `translations` table                │    │
│  │  No more dual-field pattern (name/nameEn)                       │    │
│  │  Scales to 10+ languages without schema changes                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Principle 3: Fallback to English                               │    │
│  │  ═════════════════════════════════                               │    │
│  │  Any locale → en (direct fallback)                              │    │
│  │  zh-Hans → en, zh-Hant → en, ja → en, ko → en                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Current vs Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Architecture Migration                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CURRENT STATE (Mixed Approach)                                         │
│  ═══════════════════════════════                                         │
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Dual-Field      │    │ Translation     │                            │
│  │ (name/nameEn)   │    │ Table           │                            │
│  ├─────────────────┤    ├─────────────────┤                            │
│  │ DiscoverTab     │    │ Book            │                            │
│  │ Category        │    │ Author          │                            │
│  │ BookList        │    │ Genre           │                            │
│  │ FAQCategory     │    │ Quote           │                            │
│  │ FAQ             │    │ AuthorQuote     │                            │
│  │ Medal           │    │ ...             │                            │
│  └─────────────────┘    └─────────────────┘                            │
│         ↓                                                               │
│  Only supports 2 languages!                                             │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                          │
│  TARGET STATE (Unified Approach)                                        │
│  ════════════════════════════════                                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    translations table                            │    │
│  │                                                                  │    │
│  │  Supports ALL entities:                                         │    │
│  │  ├── discoverTab (name)                                         │    │
│  │  ├── category (name, description)                               │    │
│  │  ├── bookList (name, subtitle, description)                     │    │
│  │  ├── faqCategory (name, description)                            │    │
│  │  ├── faq (question, answer)                                     │    │
│  │  ├── medal (name, description, designStory)                     │    │
│  │  ├── audiobook (title, description)                             │    │
│  │  ├── book (title, author, description)                          │    │
│  │  ├── author (name, bio)                                         │    │
│  │  ├── genre (name)                                               │    │
│  │  └── ... (any future entity)                                    │    │
│  │                                                                  │    │
│  │  Supports 10+ languages:                                        │    │
│  │  en, zh-Hans, zh-Hant, ja, ko, es, fr, de, pt, ar, ru, id       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Localization Architecture                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌─────────────────┐     ┌──────────────────────┐  │
│  │   Client     │────▶│   API Server    │────▶│   translations       │  │
│  │ Accept-Lang  │     │  LocalizeSvc    │     │      table           │  │
│  └──────────────┘     └─────────────────┘     └──────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│                       ┌─────────────────┐                               │
│                       │   Redis Cache   │                               │
│                       │ discover:v2:*   │                               │
│                       │ agora:posts:*   │                               │
│                       └─────────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Design Principles

| Principle | Description |
|-----------|-------------|
| English as Source | All original data stored in English |
| Translation Table | Separate table for all localized content |
| Fallback Chain | Missing translation falls back to parent locale |
| Pre-computed Cache | Localized data cached per locale for performance |

---

## 2. Database Schema

### 2.1 Translations Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated primary key |
| entity_type | VARCHAR(50) | Entity type identifier (e.g., 'book', 'author') |
| entity_id | VARCHAR(100) | Entity UUID or slug |
| field_name | VARCHAR(50) | Field to translate (e.g., 'title', 'name') |
| locale | VARCHAR(10) | Target locale code (e.g., 'zh-Hans') |
| value | TEXT | Translated content |
| source | VARCHAR(20) | Translation source (default: 'manual') |
| status | VARCHAR(20) | Publication status (default: 'published') |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| created_by | UUID | Translator user ID |

**Unique constraint:** (entity_type, entity_id, field_name, locale)

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| idx_translations_entity | entity_type, entity_id | Entity lookup |
| idx_translations_locale | entity_type, entity_id, locale | Locale-specific lookup |
| idx_translations_locale_only | locale | Locale scan |
| idx_translations_source | source | Source filtering |

### 2.2 Supported Locales Table

| Column | Type | Description |
|--------|------|-------------|
| locale | VARCHAR(10) (PK) | Locale code |
| name | VARCHAR(50) | Display name (e.g., 'Simplified Chinese') |
| native_name | VARCHAR(50) | Native name (e.g., '简体中文') |
| is_rtl | BOOLEAN | Right-to-left flag (for Arabic) |
| fallback_locale | VARCHAR(10) | Fallback language |
| is_active | BOOLEAN | Active flag |
| sort_order | INT | Display order |

---

## 3. Supported Locales

### 3.1 Active Locales (P0)

| Locale | Name | Native Name | Fallback |
|--------|------|-------------|----------|
| en | English | English | - |
| zh-Hans | Simplified Chinese | 简体中文 | en |
| zh-Hant | Traditional Chinese | 繁體中文 | en |

### 3.2 Planned Locales (P1)

| Locale | Name | Native Name | Fallback | RTL |
|--------|------|-------------|----------|-----|
| ja | Japanese | 日本語 | en | No |
| ko | Korean | 한국어 | en | No |
| es | Spanish | Español | en | No |
| fr | French | Français | en | No |
| de | German | Deutsch | en | No |
| pt | Portuguese | Português | en | No |
| ru | Russian | Русский | en | No |
| id | Indonesian | Bahasa Indonesia | en | No |
| ar | Arabic | العربية | en | Yes |

### 3.3 Locale Normalization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Locale Code Normalization                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Client Input              Normalized                                    │
│  ────────────              ──────────                                    │
│  zh, zh-CN, zh-SG    ───▶  zh-Hans                                      │
│  zh-TW, zh-HK, zh-MO ───▶  zh-Hant                                      │
│  en, en-US, en-GB    ───▶  en                                           │
│  ja, ja-JP           ───▶  ja                                           │
│  ko, ko-KR           ───▶  ko                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Fallback Chain

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Fallback Resolution                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  zh-Hans (简体中文)                                                      │
│     │                                                                    │
│     ├── Try: zh-Hans translation                                        │
│     │         ↓ (not found)                                             │
│     └── Use: en (original English content)                              │
│                                                                          │
│  zh-Hant (繁體中文)                                                      │
│     │                                                                    │
│     ├── Try: zh-Hant translation                                        │
│     │         ↓ (not found)                                             │
│     └── Use: en (original English content)                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  IMPORTANT: zh-Hant does NOT fallback to zh-Hans                │    │
│  │  繁體中文和简体中文是独立的翻译，互不依赖                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ja / ko / other                                                         │
│     │                                                                    │
│     ├── Try: locale translation                                         │
│     │         ↓ (not found)                                             │
│     └── Use: en (original English content)                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Entity Registry

### 4.1 All Localizable Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Complete Entity Type Registry                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Navigation & UI Entities                                                │
│  ════════════════════════                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ entityType     │ entityId │ fields              │ Source Table   │    │
│  ├────────────────┼──────────┼─────────────────────┼────────────────┤    │
│  │ discoverTab    │ UUID     │ name                │ discover_tabs  │    │
│  │ category       │ UUID     │ name, description   │ categories     │    │
│  │ faqCategory    │ UUID     │ name, description   │ faq_categories │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Content Entities                                                        │
│  ════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ entityType     │ entityId │ fields              │ Source Table   │    │
│  ├────────────────┼──────────┼─────────────────────┼────────────────┤    │
│  │ book           │ UUID     │ title, author,      │ books          │    │
│  │                │          │ description         │                │    │
│  │ author         │ UUID     │ name, bio           │ authors        │    │
│  │ genre          │ slug     │ name                │ (derived)      │    │
│  │ bookList       │ UUID     │ name, subtitle,     │ book_lists     │    │
│  │                │          │ description         │                │    │
│  │ quote          │ UUID     │ text                │ quotes         │    │
│  │ faq            │ UUID     │ question, answer    │ faqs           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Audiobook Entities                                                      │
│  ══════════════════                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ entityType     │ entityId │ fields              │ Source Table   │    │
│  ├────────────────┼──────────┼─────────────────────┼────────────────┤    │
│  │ audiobook      │ UUID     │ title, description  │ audiobooks     │    │
│  │ audiobookChapter│ UUID    │ title               │ audiobook_     │    │
│  │                │          │                     │ chapters       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Author Profile Entities                                                 │
│  ═══════════════════════                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ entityType              │ entityId │ fields         │ Source    │    │
│  ├─────────────────────────┼──────────┼────────────────┼───────────┤    │
│  │ authorTimelineEvent     │ UUID     │ title          │ author_   │    │
│  │                         │          │                │ timeline  │    │
│  │ authorQuote             │ UUID     │ text, source   │ author_   │    │
│  │                         │          │                │ quotes    │    │
│  │ authorInfluence         │ UUID     │ relationship   │ author_   │    │
│  │                         │          │                │ influences│    │
│  │ authorDomainContribution│ UUID     │ domain,        │ author_   │    │
│  │                         │          │ contributions  │ domain_   │    │
│  │ authorHistoricalContext │ UUID     │ title          │ author_   │    │
│  │                         │          │                │ historical│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Gamification Entities                                                   │
│  ═════════════════════                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ entityType     │ entityId │ fields              │ Source Table   │    │
│  ├────────────────┼──────────┼─────────────────────┼────────────────┤    │
│  │ medal          │ UUID     │ name, description,  │ medals         │    │
│  │                │          │ designStory         │                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Entity Fields Summary Table

| Entity Type | Entity ID | Localizable Fields | Notes |
|-------------|-----------|-------------------|-------|
| **discoverTab** | UUID | name | Tab labels in Discover |
| **category** | UUID | name, description | Category + subcategory |
| **bookList** | UUID | name, subtitle, description | Curated lists |
| **faqCategory** | UUID | name, description | FAQ section headers |
| **faq** | UUID | question, answer | Help content |
| **book** | UUID | title, author, description | Book metadata |
| **author** | UUID | name, bio | Author profile |
| **genre** | slug | name | Genre tags |
| **quote** | UUID | text | Quotes in Agora |
| **audiobook** | UUID | title, description | Audiobook metadata |
| **audiobookChapter** | UUID | title | Chapter names |
| **authorTimelineEvent** | UUID | title | Timeline events |
| **authorQuote** | UUID | text, source | Author quotes |
| **authorInfluence** | UUID | relationship | Influence descriptions |
| **authorDomainContribution** | UUID | domain, contributions | Domain work |
| **authorHistoricalContext** | UUID | title | Historical context |
| **medal** | UUID | name, description, designStory | Achievement badges |

### 4.3 Page Coverage

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Pages & Required Translations                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Discover Page (发现页)                                                  │
│  ═════════════════════                                                   │
│  ├── Tabs: discoverTab.name                                             │
│  ├── Books: book.title, book.author, genre.name                         │
│  └── Categories: category.name                                          │
│                                                                          │
│  Agora Page (城邦)                                                       │
│  ════════════════                                                        │
│  ├── Author Posts: author.name, author.bio, quote.text                  │
│  └── Tabs: (if applicable) agoraTab.name                                │
│                                                                          │
│  Category Page (分类页)                                                  │
│  ═════════════════════                                                   │
│  ├── Category Header: category.name, category.description               │
│  ├── Subcategories: category.name (children)                            │
│  └── Books: book.title, book.author                                     │
│                                                                          │
│  Audiobook Page (有声书)                                                 │
│  ═════════════════════                                                   │
│  ├── Audiobook Info: audiobook.title, audiobook.description             │
│  ├── Chapters: audiobookChapter.title                                   │
│  └── Author: author.name                                                │
│                                                                          │
│  Author Profile (作者页)                                                 │
│  ═══════════════════════                                                 │
│  ├── Bio: author.name, author.bio                                       │
│  ├── Timeline: authorTimelineEvent.title                                │
│  ├── Quotes: authorQuote.text, authorQuote.source                       │
│  ├── Influences: authorInfluence.relationship                           │
│  └── Contributions: authorDomainContribution.domain/contributions       │
│                                                                          │
│  Book Lists (书单)                                                       │
│  ════════════════                                                        │
│  ├── List Header: bookList.name, bookList.subtitle, bookList.description│
│  └── Books: book.title, book.author                                     │
│                                                                          │
│  FAQ Page (帮助中心)                                                     │
│  ══════════════════                                                      │
│  ├── Categories: faqCategory.name, faqCategory.description              │
│  └── Items: faq.question, faq.answer                                    │
│                                                                          │
│  Medals/Achievements (勋章)                                              │
│  ═══════════════════════════                                             │
│  └── Medal Info: medal.name, medal.description, medal.designStory       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Discover Tab Localization

### 5.1 Two Localization Mechanisms

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Discover Tab 本地化机制                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  机制 1: 内联字段切换 (Inline Field Switching)                   │    │
│  │  适用于: DiscoverTab (Tab 标签本身)                              │    │
│  │                                                                  │    │
│  │  数据库字段:                                                     │    │
│  │  ├── name    = "推荐"     (中文)                                │    │
│  │  └── nameEn  = "For You"  (英文)                                │    │
│  │                                                                  │    │
│  │  代码逻辑:                                                       │    │
│  │  name: isChinese ? tab.name : tab.nameEn                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  机制 2: 翻译表查询 (Translation Table Lookup)                   │    │
│  │  适用于: Book, Author, Genre 等实体                              │    │
│  │                                                                  │    │
│  │  原始数据 (英文):                                                │    │
│  │  └── book.title = "Pride and Prejudice"                         │    │
│  │                                                                  │    │
│  │  翻译表:                                                         │    │
│  │  └── translations(book, book-id, title, zh-Hans) = "傲慢与偏见" │    │
│  │                                                                  │    │
│  │  代码逻辑:                                                       │    │
│  │  LocalizationService.localizeEntities(books, 'book', 'id', locale)   │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Complete Data Flow Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Example: iOS App 请求 Discover 页面 (zh-Hans)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: 客户端请求                                                      │
│  ════════════════════                                                    │
│  GET /api/v1/recommendation/discover/tabs                               │
│  Headers: Accept-Language: zh-Hans                                       │
│                                                                          │
│  Step 2: 中间件处理 (LocaleMiddleware)                                   │
│  ════════════════════════════════════                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Input:  Accept-Language: zh-Hans                               │    │
│  │  Output: req.localeContext = {                                  │    │
│  │            locale: 'zh-Hans',                                   │    │
│  │            fallbackChain: ['zh-Hans', 'en'],                    │    │
│  │            isRtl: false                                         │    │
│  │          }                                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 3: Controller 获取 locale                                          │
│  ═══════════════════════════════                                         │
│  @Get('discover/tabs')                                                   │
│  async getDiscoverTabs(@Locale() localeContext: LocaleContext) {        │
│    return this.recommendationService.getDiscoverTabs(localeContext.locale);│
│  }                                                                       │
│                                                                          │
│  Step 4: 检查 Redis 缓存                                                 │
│  ════════════════════════                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Cache Key: discover:v2:tabs:zh-Hans                            │    │
│  │                                                                  │    │
│  │  Cache HIT → 直接返回预计算的本地化数据                          │    │
│  │  Cache MISS → 执行 Step 5                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 5: 缓存未命中 - 实时查询 (Fallback)                                │
│  ════════════════════════════════════════                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  5a. 查询数据库                                                  │    │
│  │  SELECT * FROM discover_tabs WHERE is_active = true             │    │
│  │                                                                  │    │
│  │  返回:                                                           │    │
│  │  ┌────────────────────────────────────────────────────────────┐ │    │
│  │  │ id   │ slug      │ name     │ name_en   │ category_id     │ │    │
│  │  ├──────┼───────────┼──────────┼───────────┼─────────────────┤ │    │
│  │  │ 1    │ for-you   │ 推荐     │ For You   │ NULL            │ │    │
│  │  │ 2    │ fiction   │ 小说     │ Fiction   │ cat-fiction-id  │ │    │
│  │  │ 3    │ classics  │ 经典     │ Classics  │ cat-classics-id │ │    │
│  │  └────────────────────────────────────────────────────────────┘ │    │
│  │                                                                  │    │
│  │  5b. 应用内联字段切换                                            │    │
│  │  const isChinese = locale.startsWith('zh');  // true            │    │
│  │  name: isChinese ? tab.name : tab.nameEn                        │    │
│  │                                                                  │    │
│  │  结果:                                                           │    │
│  │  ┌────────────────────────────────────────────────────────────┐ │    │
│  │  │ { slug: 'for-you',  name: '推荐' }                         │ │    │
│  │  │ { slug: 'fiction',  name: '小说' }                         │ │    │
│  │  │ { slug: 'classics', name: '经典' }                         │ │    │
│  │  └────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 6: 返回响应                                                        │
│  ══════════════════                                                      │
│  Response Headers: Content-Language: zh-Hans                            │
│  Response Body:                                                          │
│  {                                                                       │
│    "tabs": [                                                            │
│      { "id": "1", "slug": "for-you", "name": "推荐", "nameEn": "For You" },│
│      { "id": "2", "slug": "fiction", "name": "小说", "nameEn": "Fiction" },│
│      { "id": "3", "slug": "classics", "name": "经典", "nameEn": "Classics" }│
│    ]                                                                     │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Books Localization Flow (使用翻译表)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Example: 获取 Discover 书籍列表 (zh-Hans)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1: 请求                                                            │
│  ═════════════                                                           │
│  GET /api/v1/recommendation/discover?categoryId=fiction                 │
│  Headers: Accept-Language: zh-Hans                                       │
│                                                                          │
│  Step 2: 查询原始数据 (英文)                                             │
│  ═══════════════════════════                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Database (books table):                                        │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │ id       │ title                  │ author       │ genres  │   │    │
│  │  ├──────────┼────────────────────────┼──────────────┼─────────┤   │    │
│  │  │ book-001 │ Pride and Prejudice    │ Jane Austen  │ [Romance,│   │    │
│  │  │          │                        │              │  Classic]│   │    │
│  │  │ book-002 │ Wuthering Heights      │ Emily Brontë │ [Gothic, │   │    │
│  │  │          │                        │              │  Romance]│   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 3: 调用 LocalizationService.localizeEntities()                     │
│  ════════════════════════════════════════════════════                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Query translations table:                                       │    │
│  │                                                                  │    │
│  │  SELECT entity_id, field_name, value                            │    │
│  │  FROM translations                                               │    │
│  │  WHERE entity_type = 'book'                                     │    │
│  │    AND entity_id IN ('book-001', 'book-002')                    │    │
│  │    AND field_name IN ('title', 'author')                        │    │
│  │    AND locale = 'zh-Hans'                                       │    │
│  │    AND status = 'published'                                     │    │
│  │                                                                  │    │
│  │  结果:                                                           │    │
│  │  ┌────────────────────────────────────────────────────────────┐ │    │
│  │  │ entity_id │ field_name │ value                             │ │    │
│  │  ├───────────┼────────────┼───────────────────────────────────┤ │    │
│  │  │ book-001  │ title      │ 傲慢与偏见                        │ │    │
│  │  │ book-001  │ author     │ 简·奥斯汀                         │ │    │
│  │  │ book-002  │ title      │ 呼啸山庄                          │ │    │
│  │  │ book-002  │ author     │ 艾米莉·勃朗特                     │ │    │
│  │  └────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 4: 本地化 Genres (单独查询)                                        │
│  ══════════════════════════════════                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Normalize: "Romance" → "romance", "Classic" → "classic"        │    │
│  │                                                                  │    │
│  │  SELECT entity_id, value FROM translations                      │    │
│  │  WHERE entity_type = 'genre'                                    │    │
│  │    AND entity_id IN ('romance', 'classic', 'gothic')            │    │
│  │    AND field_name = 'name'                                      │    │
│  │    AND locale = 'zh-Hans'                                       │    │
│  │                                                                  │    │
│  │  结果: { romance: '爱情', classic: '经典', gothic: '哥特' }      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 5: 合并本地化数据                                                  │
│  ════════════════════════                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Original:                     Localized:                        │    │
│  │  ────────────                  ────────────                      │    │
│  │  title: "Pride and Prejudice"  →  title: "傲慢与偏见"            │    │
│  │  author: "Jane Austen"         →  author: "简·奥斯汀"            │    │
│  │  genres: ["Romance", "Classic"] → genres: ["爱情", "经典"]       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 6: 返回响应                                                        │
│  ══════════════════                                                      │
│  {                                                                       │
│    "books": [                                                           │
│      {                                                                  │
│        "book": {                                                        │
│          "id": "book-001",                                             │
│          "title": "傲慢与偏见",                                         │
│          "author": "简·奥斯汀",                                         │
│          "genres": ["爱情", "经典"]                                     │
│        },                                                               │
│        "scores": { "final": 95, ... }                                  │
│      }                                                                  │
│    ]                                                                     │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Discover Tab Localization Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Cache Check                                                          │
│     ┌─────────────────┐                                                 │
│     │ Redis Cache     │  Key: discover:v2:tabs:zh-Hans                  │
│     │ (Pre-computed)  │  Key: discover:v2:books:all:zh-Hans             │
│     └────────┬────────┘                                                 │
│              │                                                           │
│              ▼ (cache hit)                                              │
│     ┌─────────────────┐                                                 │
│     │ Return Cached   │  Localized tabs + books                         │
│     │ Response        │  Response time: <10ms                           │
│     └─────────────────┘                                                 │
│                                                                          │
│  2. Cache Miss (Fallback)                                               │
│     ┌─────────────────┐                                                 │
│     │ Database Query  │  Fetch tabs + books                             │
│     └────────┬────────┘                                                 │
│              │                                                           │
│              ▼                                                           │
│     ┌─────────────────┐                                                 │
│     │ Localization    │  LocalizationService.localizeEntities()         │
│     │ Service         │  Query translations table                       │
│     └────────┬────────┘                                                 │
│              │                                                           │
│              ▼                                                           │
│     ┌─────────────────┐                                                 │
│     │ Response        │  Localized content                              │
│     └─────────────────┘                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Cached Content Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Cache Key Structure                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tabs Cache                                                              │
│  ──────────                                                              │
│  discover:v2:tabs:en                                                    │
│  discover:v2:tabs:zh-Hans                                               │
│  discover:v2:tabs:zh-Hant                                               │
│                                                                          │
│  Books Cache (by category)                                              │
│  ─────────────────────────                                              │
│  discover:v2:books:all:en           # All books (English)               │
│  discover:v2:books:all:zh-Hans      # All books (Simplified Chinese)    │
│  discover:v2:books:<categoryId>:en  # Category books (English)          │
│  discover:v2:books:<categoryId>:zh-Hans                                 │
│                                                                          │
│  TTL: 24 hours (safety fallback)                                        │
│  Refresh: Manual trigger or cron job                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Localized Fields per Entity

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Discover Content Localization                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Book Entity                                                             │
│  ├── title        "Pride and Prejudice" → "傲慢与偏见"                  │
│  ├── author       "Jane Austen" → "简·奥斯汀"                           │
│  └── description  "A novel about..." → "这是一部关于..."                │
│                                                                          │
│  Author Entity                                                           │
│  ├── name         "Jane Austen" → "简·奥斯汀"                           │
│  └── bio          "English novelist..." → "英国女性小说家..."            │
│                                                                          │
│  Genre Entity                                                            │
│  └── name         "Fiction" → "小说"                                    │
│                   "Romance" → "爱情"                                    │
│                   "Classic" → "经典"                                    │
│                                                                          │
│  Category Entity                                                         │
│  └── name         "Mystery & Thriller" → "悬疑与惊悚"                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Agora (城邦) Localization

### 6.1 Post Types

| Post Type | Localization | Description |
|-----------|--------------|-------------|
| AUTHOR | Yes | System posts with author + quote |
| USER | No | User-generated content |

### 6.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Agora Post Localization Flow                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Request: GET /api/v1/agora/posts?tab=authors                           │
│  Header: Accept-Language: zh-Hans                                        │
│                                                                          │
│  ┌─────────────────┐                                                    │
│  │ Fetch Posts     │  Database query for AUTHOR type posts              │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Extract Unique  │  Deduplicate authors & quotes                      │
│  │ Entities        │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ├──────────────────────┐                                      │
│           ▼                      ▼                                      │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Localize        │    │ Localize        │                            │
│  │ Authors         │    │ Quotes          │                            │
│  │ (name, bio)     │    │ (text)          │                            │
│  └────────┬────────┘    └────────┬────────┘                            │
│           │                      │                                      │
│           └──────────┬───────────┘                                      │
│                      ▼                                                   │
│           ┌─────────────────┐                                           │
│           │ Build Response  │  Merge localized content                  │
│           └─────────────────┘                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Response Behavior

When locale is zh-Hans, the Agora response returns localized author names, bios, and quote texts from the translations table. Fields without translations fall back to English.

---

## 7. Translation Sources

### 7.1 Source Types

| Source | Code | Description |
|--------|------|-------------|
| Manual | manual | Human translation |
| AI Generated | ai | AI-assisted translation |
| Douban | douban | Douban book database |
| Wikidata | wikidata | Wikidata entity |
| Wikipedia | wikipedia | Wikipedia content |
| OpenCC | opencc | Simplified → Traditional Chinese |

### 7.2 Translation Status

| Status | Description |
|--------|-------------|
| draft | Pending review |
| reviewed | Reviewed but not published |
| published | Active and visible |

---

## 8. Translation Coverage Requirements

### 8.1 Discover Tab Requirements

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Required Translations for Discover                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Priority 1: Tab Display                                                 │
│  ├── discoverTab.name (inline, not translation table)                   │
│  └── category.name                                                       │
│                                                                          │
│  Priority 2: Book Cards                                                  │
│  ├── book.title                                                          │
│  ├── book.author                                                         │
│  └── genre.name (all genres used by curated books)                      │
│                                                                          │
│  Priority 3: Author Info                                                 │
│  └── author.name                                                         │
│                                                                          │
│  Priority 4: Extended Content                                            │
│  ├── book.description                                                    │
│  └── author.bio                                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Agora Tab Requirements

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Required Translations for Agora                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AUTHOR Posts                                                            │
│  ├── author.name         (all authors with posts)                       │
│  ├── author.bio          (for author cards)                             │
│  └── quote.text          (all quotes in posts)                          │
│                                                                          │
│  USER Posts                                                              │
│  └── No translations needed (user-generated content)                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. API Reference

### 9.1 Locale Context Injection

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Request → Response Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Request Headers                                                         │
│  ───────────────                                                         │
│  Accept-Language: zh-Hans                                               │
│  X-Custom-Lang: zh-Hans (override)                                      │
│                                                                          │
│  Middleware Processing                                                   │
│  ────────────────────                                                    │
│  1. Parse Accept-Language header                                        │
│  2. Normalize locale code                                               │
│  3. Build fallback chain                                                │
│  4. Inject LocaleContext into request                                   │
│                                                                          │
│  Response Headers                                                        │
│  ────────────────                                                        │
│  Content-Language: zh-Hans                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Locale Context Structure

The LocaleContext object injected into each request contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| locale | string | Normalized locale code | 'zh-Hans' |
| fallbackChain | string[] | Ordered fallback chain | ['zh-Hans', 'en'] |
| isRtl | boolean | Right-to-left flag | false |

---

## 10. Cache Refresh Workflow

### 10.1 Manual Refresh

**Endpoint:** POST /api/v1/recommendation/cache/refresh

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| tabs | number | Number of locale caches refreshed |
| books | number | Number of book caches refreshed |
| duration | number | Time in milliseconds |

### 10.2 Refresh Triggers

| Trigger | Action |
|---------|--------|
| Translation update | Manual cache refresh required |
| New book added | Cache refresh on next cron |
| Category change | Manual cache refresh required |
| Cron (every 6h) | Automatic cache refresh |

---

## 11. Migration Plan: Unified Translation Architecture

### 11.1 Current Dual-Field Tables (Need Migration)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Tables Requiring Migration                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Table: discover_tabs                                                    │
│  ═══════════════════                                                     │
│  Current:                        Target:                                 │
│  ┌────────────────────────┐     ┌────────────────────────┐              │
│  │ name     │ "推荐"      │     │ name     │ "For You"   │  ← English   │
│  │ name_en  │ "For You"   │     │ (drop)   │             │              │
│  └────────────────────────┘     └────────────────────────┘              │
│                                                                          │
│  + translations table:                                                   │
│  (discoverTab, <id>, name, zh-Hans) = "推荐"                            │
│  (discoverTab, <id>, name, zh-Hant) = "推薦"                            │
│  (discoverTab, <id>, name, ja) = "おすすめ"                              │
│  (discoverTab, <id>, name, ko) = "추천"                                  │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: categories                                                       │
│  ═════════════════                                                       │
│  Current:                        Target:                                 │
│  ┌────────────────────────┐     ┌────────────────────────┐              │
│  │ name     │ "小说"      │     │ name     │ "Fiction"   │  ← English   │
│  │ name_en  │ "Fiction"   │     │ (drop)   │             │              │
│  └────────────────────────┘     └────────────────────────┘              │
│                                                                          │
│  + translations table:                                                   │
│  (category, <id>, name, zh-Hans) = "小说"                               │
│  (category, <id>, name, zh-Hant) = "小說"                               │
│  (category, <id>, name, ja) = "フィクション"                             │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: book_lists                                                       │
│  ═════════════════                                                       │
│  Current: name/name_en, subtitle, description                           │
│  Target: name (English), translations for other locales                 │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: faq_categories                                                   │
│  ═════════════════════                                                   │
│  Current: name/name_en, description                                     │
│  Target: name (English), translations for other locales                 │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: faqs                                                             │
│  ═══════════                                                             │
│  Current: question/question_en, answer/answer_en                        │
│  Target: question, answer (English), translations for other locales    │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: medals                                                           │
│  ═════════════                                                           │
│  Current: name_zh/name_en, description_zh/description_en,               │
│           design_story/design_story_en                                  │
│  Target: name, description, design_story (English),                     │
│          translations for other locales                                 │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Table: quotes                                                           │
│  ═════════════                                                           │
│  Current: text/text_en                                                  │
│  Target: text (English), translations for other locales                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Migration Steps

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Migration Execution Plan                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Phase 1: Add New Entity Types to LocalizationService                   │
│  ═════════════════════════════════════════════════════                   │
│  1. Update LOCALIZABLE_FIELDS constant:                                  │
│     discoverTab: ['name']                                               │
│     category: ['name', 'description']                                   │
│     bookList: ['name', 'subtitle', 'description']                       │
│     faqCategory: ['name', 'description']                                │
│     faq: ['question', 'answer']                                         │
│     medal: ['name', 'description', 'designStory']                       │
│     audiobook: ['title', 'description']                                 │
│                                                                          │
│  Phase 2: Data Migration Script                                          │
│  ══════════════════════════════                                          │
│  For each dual-field table:                                              │
│  1. Copy Chinese value (name) → translations table (zh-Hans)            │
│  2. Rename name_en → name (now English source)                          │
│  3. Drop name_en column                                                 │
│                                                                          │
│  Example SQL for discover_tabs:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  -- Step 1: Insert Chinese translations                         │    │
│  │  INSERT INTO translations (entity_type, entity_id, field_name,  │    │
│  │                            locale, value, status)               │    │
│  │  SELECT 'discoverTab', id, 'name', 'zh-Hans', name, 'published' │    │
│  │  FROM discover_tabs;                                            │    │
│  │                                                                  │    │
│  │  -- Step 2: Update name to English value                        │    │
│  │  UPDATE discover_tabs SET name = name_en;                       │    │
│  │                                                                  │    │
│  │  -- Step 3: Drop English column                                 │    │
│  │  ALTER TABLE discover_tabs DROP COLUMN name_en;                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Phase 3: Update Service Layer                                           │
│  ═════════════════════════════                                           │
│  Update buildTabsCache() in discover-cache.service.ts:                  │
│                                                                          │
│  Before:                                                                 │
│  name: isChinese ? tab.name : tab.nameEn                                │
│                                                                          │
│  After:                                                                  │
│  name: await localization.getTranslation(                               │
│    'discoverTab', tab.id, 'name', locale                                │
│  ) ?? tab.name                                                          │
│                                                                          │
│  Phase 4: Prisma Schema Update                                           │
│  ═════════════════════════════                                           │
│  Remove name_en, name_zh fields from affected models                    │
│  Keep only single English field                                         │
│                                                                          │
│  Phase 5: Cache Rebuild                                                  │
│  ═════════════════════                                                   │
│  Trigger full cache rebuild for all locales                             │
│  POST /api/v1/recommendation/cache/refresh                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Target Schema After Migration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Target Table Schemas                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  discover_tabs (After Migration)                                        │
│  ═══════════════════════════════                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Column      │ Type        │ Description                         │    │
│  ├─────────────┼─────────────┼─────────────────────────────────────┤    │
│  │ id          │ UUID        │ Primary key                         │    │
│  │ slug        │ VARCHAR(50) │ URL-safe identifier                 │    │
│  │ name        │ VARCHAR(50) │ English name (source of truth)      │    │
│  │ type        │ VARCHAR(20) │ Tab type                            │    │
│  │ category_id │ UUID        │ Linked category (optional)          │    │
│  │ icon        │ VARCHAR(50) │ Icon name                           │    │
│  │ sort_order  │ INT         │ Display order                       │    │
│  │ is_active   │ BOOLEAN     │ Visibility flag                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  categories (After Migration)                                            │
│  ════════════════════════════                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Column      │ Type        │ Description                         │    │
│  ├─────────────┼─────────────┼─────────────────────────────────────┤    │
│  │ id          │ UUID        │ Primary key                         │    │
│  │ slug        │ VARCHAR(50) │ URL-safe identifier                 │    │
│  │ name        │ VARCHAR(100)│ English name (source of truth)      │    │
│  │ description │ TEXT        │ English description (optional)      │    │
│  │ parent_id   │ UUID        │ Parent category (for hierarchy)     │    │
│  │ icon        │ VARCHAR(50) │ Icon name                           │    │
│  │ sort_order  │ INT         │ Display order                       │    │
│  │ is_active   │ BOOLEAN     │ Visibility flag                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  translations (Unchanged - Central Table)                                │
│  ════════════════════════════════════════                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Column      │ Type        │ Description                         │    │
│  ├─────────────┼─────────────┼─────────────────────────────────────┤    │
│  │ id          │ UUID        │ Primary key                         │    │
│  │ entity_type │ VARCHAR(50) │ discoverTab, category, book, etc.   │    │
│  │ entity_id   │ VARCHAR(100)│ UUID or slug of entity              │    │
│  │ field_name  │ VARCHAR(50) │ name, title, description, etc.      │    │
│  │ locale      │ VARCHAR(10) │ zh-Hans, zh-Hant, ja, ko, etc.      │    │
│  │ value       │ TEXT        │ Translated content                  │    │
│  │ source      │ VARCHAR(20) │ manual, ai, douban, etc.            │    │
│  │ status      │ VARCHAR(20) │ draft, reviewed, published          │    │
│  │ created_at  │ TIMESTAMP   │                                     │    │
│  │ updated_at  │ TIMESTAMP   │                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.4 Unified Data Flow After Migration

```
┌─────────────────────────────────────────────────────────────────────────┐
│           Unified Localization Flow (All Entities)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Request: GET /api/v1/recommendation/discover/tabs                      │
│  Header: Accept-Language: ja                                            │
│                                                                          │
│  Step 1: LocaleMiddleware                                                │
│  ════════════════════════                                                │
│  locale = 'ja', fallbackChain = ['ja', 'en']                            │
│                                                                          │
│  Step 2: Check Redis Cache                                               │
│  ═════════════════════════                                               │
│  Key: discover:v2:tabs:ja                                               │
│                                                                          │
│  Step 3: Cache Miss → Build Localized Data                               │
│  ═════════════════════════════════════════                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  3a. Query Source Table (English)                               │    │
│  │  SELECT id, name, slug FROM discover_tabs WHERE is_active=true  │    │
│  │                                                                  │    │
│  │  Result:                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐│    │
│  │  │ id       │ name      │ slug       │                        ││    │
│  │  ├──────────┼───────────┼────────────┤                        ││    │
│  │  │ tab-001  │ For You   │ for-you    │                        ││    │
│  │  │ tab-002  │ Fiction   │ fiction    │                        ││    │
│  │  │ tab-003  │ Classics  │ classics   │                        ││    │
│  │  └─────────────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  3b. Query Translations (Japanese)                              │    │
│  │  SELECT entity_id, value FROM translations                      │    │
│  │  WHERE entity_type = 'discoverTab'                              │    │
│  │    AND entity_id IN ('tab-001', 'tab-002', 'tab-003')           │    │
│  │    AND field_name = 'name'                                      │    │
│  │    AND locale = 'ja'                                            │    │
│  │    AND status = 'published'                                     │    │
│  │                                                                  │    │
│  │  Result:                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐│    │
│  │  │ entity_id │ value                                           ││    │
│  │  ├───────────┼─────────────────────────────────────────────────┤│    │
│  │  │ tab-001   │ おすすめ                                        ││    │
│  │  │ tab-002   │ フィクション                                     ││    │
│  │  │ tab-003   │ クラシック                                       ││    │
│  │  └─────────────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  3c. Merge & Apply Fallback                                     │    │
│  │  For each tab:                                                  │    │
│  │    name = translation[tab.id] ?? tab.name (English fallback)   │    │
│  │                                                                  │    │
│  │  Result:                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐│    │
│  │  │ { slug: 'for-you',  name: 'おすすめ' }                      ││    │
│  │  │ { slug: 'fiction',  name: 'フィクション' }                   ││    │
│  │  │ { slug: 'classics', name: 'クラシック' }                     ││    │
│  │  └─────────────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Step 4: Cache & Return                                                  │
│  ═════════════════════                                                   │
│  Store in Redis: discover:v2:tabs:ja                                    │
│  Return response with Content-Language: ja                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.5 Benefits of Unified Architecture

| Aspect | Before (Dual-Field) | After (Unified) |
|--------|---------------------|-----------------|
| **Languages** | 2 (Chinese + English) | Unlimited |
| **Schema Changes** | Required for each language | None |
| **Consistency** | Mixed approaches | Single pattern |
| **Maintenance** | Multiple code paths | One code path |
| **Translation Management** | Per-table | Centralized |
| **New Entity Support** | Add columns to table | Add entity type config |

---

## 12. Data Volume & Performance Estimation

### 12.1 Entity Counts (Large Scale: 100K Books + 10K Audiobooks)

| Entity Type | Count | Fields | Total Fields |
|-------------|-------|--------|--------------|
| books | 100,000 | title, author | 200,000 |
| authors | 30,000 | name, bio | 60,000 |
| audiobooks | 10,000 | title | 10,000 |
| audiobookChapters | 100,000 | title | 100,000 |
| authorTimelineEvents | 30,000 | title, description | 60,000 |
| authorQuotes | 30,000 | text | 30,000 |
| authorInfluences | 10,000 | description | 10,000 |
| authorDomainContributions | 10,000 | description | 10,000 |
| authorHistoricalContexts | 10,000 | content | 10,000 |
| quotes | 10,000 | text, source | 20,000 |
| genres | 100 | name | 100 |
| categories | 50 | name, description | 100 |
| discoverTabs | 20 | name | 20 |
| bookLists | 100 | name, subtitle, description | 200 |
| medals | 50 | name, description, designStory | 100 |
| faqs | 100 | question, answer | 200 |
| faqCategories | 20 | name | 20 |
| **TOTAL** | | | **510,740** |

### 12.2 Row Count by Language

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Translation Rows Estimation                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Formula: Total Fields × (N languages - 1)                              │
│  Note: English stored in source tables, not translations table          │
│                                                                          │
│  Languages │ Formula              │ Rows        │ Storage               │
│  ──────────┼──────────────────────┼─────────────┼─────────────────────  │
│  3 (now)   │ 510,740 × 2          │ 1,021,480   │ ~650 MB               │
│  5         │ 510,740 × 4          │ 2,042,960   │ ~1.3 GB               │
│  10        │ 510,740 × 9          │ 4,596,660   │ ~2.9 GB               │
│  15        │ 510,740 × 14         │ 7,150,360   │ ~4.6 GB               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.3 Query Performance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Performance at 5M Rows                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Query Type               │ Without Index │ With Index                  │
│  ─────────────────────────┼───────────────┼────────────────────────────│
│  Single entity lookup     │ 500ms         │ < 5ms                       │
│  Batch 20 entities        │ 2-3s          │ < 20ms                      │
│  Full locale scan         │ 10-30s        │ 100-500ms                   │
│                                                                          │
│  ⚠️  INDEX IS CRITICAL AT THIS SCALE                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.4 Required Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| idx_trans_lookup | entity_type, entity_id, locale | Primary lookup (most common query) |
| idx_trans_entity_locale | entity_type, locale | Batch check |
| idx_trans_unique | entity_type, entity_id, field_name, locale (UNIQUE) | Uniqueness constraint |

### 12.5 Partitioning Strategy (Recommended for 100K+ books)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Partition by entity_type                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CREATE TABLE translations (...)                                        │
│  PARTITION BY LIST (entity_type);                                       │
│                                                                          │
│  Partitions:                                                             │
│  ├── translations_books      → 'book' (~200K rows × N langs)            │
│  ├── translations_audiobooks → 'audiobook', 'audiobookChapter'          │
│  ├── translations_authors    → 'author', 'authorQuote', ...             │
│  └── translations_ui         → 'discoverTab', 'category', ...           │
│                                                                          │
│  Benefits:                                                               │
│  ✓ Query only scans relevant partition                                  │
│  ✓ Easier maintenance (VACUUM per partition)                            │
│  ✓ Extensible for future entity types                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.6 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Multi-Layer Cache                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │   Request    │────▶│    Redis     │────▶│  PostgreSQL  │            │
│  │ (locale=zh)  │     │  (L1 Cache)  │     │ translations │            │
│  └──────────────┘     └──────────────┘     └──────────────┘            │
│                              │                                          │
│                              ▼                                          │
│  Cache Key Format: trans:{type}:{id}:{locale}                          │
│                                                                          │
│  TTL Strategy:                                                          │
│  ├── Hot content (discover tabs, books): 1 hour                        │
│  ├── Book details: 24 hours                                             │
│  └── Static content (medals, faqs): 7 days                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.7 Bottleneck Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Real Bottlenecks (Not Database!)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. AI Translation API Cost                                             │
│     ├── 510,740 fields × 9 languages = 4.6M API calls                  │
│     ├── At $0.01/call = $46,000 (!)                                     │
│     └── Time: weeks/months for full translation                         │
│                                                                          │
│  2. Initial Data Loading                                                │
│     ├── Cold start: load 5GB data                                       │
│     └── Solution: Lazy loading + cache warming                          │
│                                                                          │
│  3. Cache Invalidation                                                  │
│     ├── 100K book update → massive cache refresh                        │
│     └── Solution: Event-driven incremental refresh                      │
│                                                                          │
│  ✓ Database query: NOT a bottleneck with proper indexes                 │
│  ✓ Storage cost: negligible (~$0.10/month for 5GB)                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.8 Scaling Recommendations

| Phase | Scale | Recommendations |
|-------|-------|-----------------|
| **Phase 1** | < 1K books | Single table, basic indexes, Redis cache |
| **Phase 2** | 1K - 10K books | Add composite indexes, batch translation pipeline, cache warming |
| **Phase 3** | 10K - 100K books | Partition by entity_type, read replicas, CDN for content |
| **Phase 4** | 100K+ books | Dedicated translation microservice, Elasticsearch, multi-region cache |

### 12.9 Translation Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Recommended: Translate on Demand                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✗ Bulk translate all 100K books upfront                                │
│    → Cost: $46,000+, Time: months                                       │
│                                                                          │
│  ✓ On-Demand Translation Strategy:                                      │
│    1. Pre-translate Top 1,000 popular books (hot content)               │
│    2. User request triggers translation → cache result                  │
│    3. Background job translates trending content                        │
│                                                                          │
│  Priority Order:                                                         │
│  ├── P0: Discover tabs, categories (UI elements) - ~200 fields          │
│  ├── P1: Top 1,000 books, featured authors - ~3,000 fields              │
│  ├── P2: Remaining curated books on-demand                              │
│  └── P3: Long-tail content (translate when accessed)                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Related Documents

| Document | Description |
|----------|-------------|
| [P005-staging-data-cleanup.md](../pipeline/P005-staging-data-cleanup.md) | Staging translation cleanup |
| [database.md](./database.md) | Database model overview |
| [database-design.md](../api/database-design.md) | Detailed SQL schema |

---

*Last Updated: 2026-01-02*
