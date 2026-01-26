# Project Gutenberg 发现页设计

## 概述

本文档定义 ReadMigo 发现页（Discovery Tab）的数据结构和展示规范，基于 Project Gutenberg 官方数据。

---

## 页面结构

```
┌────────────────────────────────────────────────────────────┐
│  🔍 Search Bar                                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Section 1: Hero Banner (编辑精选)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📖 Featured Book of the Week                        │  │
│  │     Pride and Prejudice                              │  │
│  │     by Jane Austen                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Section 2: Trending Now (热门榜单)                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                       │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │  ───►                 │
│  └────┘ └────┘ └────┘ └────┘ └────┘                       │
│                                                            │
│  Section 3: Categories (分类入口)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Fiction  │ │Mystery  │ │Sci-Fi   │ │Romance  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Horror   │ │Adventure│ │Children │ │Philosophy│         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                            │
│  Section 4: Popular Authors (热门作者)                      │
│  ○ Shakespeare  ○ Dickens  ○ Austen  ○ Twain              │
│                                                            │
│  Section 5: Audio Books (有声书)                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                              │
│  │ 🎙 │ │ 🎙 │ │ 🤖 │ │ 🎙 │  ───►                        │
│  └────┘ └────┘ └────┘ └────┘                              │
│                                                            │
│  Section 6: New Arrivals (新书上架)                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                              │
│  │NEW │ │NEW │ │NEW │ │NEW │  ───►                        │
│  └────┘ └────┘ └────┘ └────┘                              │
│                                                            │
│  Section 7: Curated Collections (编辑精选集)                │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ Harvard Classics │ │ Best Books Ever  │                │
│  └──────────────────┘ └──────────────────┘                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Section 1: Hero Banner (编辑精选)

### 用途
首屏视觉焦点，突出单本精选书籍

### 数据来源
编辑手动配置 + 热门书籍轮换

### 数据结构

```typescript
interface HeroBanner {
  type: 'featured_book' | 'collection' | 'author' | 'event';
  book?: {
    id: number;
    title: string;
    author: string;
    coverUrl: string;
    tagline: string;      // 如 "The Gothic Masterpiece"
  };
  backgroundColor: string;
  textColor: string;
  validFrom: Date;
  validTo: Date;
}
```

### 运营策略

| 时间节点 | 推荐内容 |
|----------|----------|
| 圣诞节 | A Christmas Carol |
| 情人节 | Pride and Prejudice, Romeo and Juliet |
| 万圣节 | Frankenstein, Dracula |
| 世界读书日 | Best Books Ever 合集 |
| 作家诞辰 | 对应作家作品 |

---

## Section 2: Trending Now (热门榜单)

### 用途
展示当前最受欢迎的书籍

### 数据来源
Gutendex API `sort=popular`

### 数据结构

```typescript
interface TrendingSection {
  title: "Trending Now" | "热门阅读";
  books: TrendingBook[];
  refreshInterval: "daily";
}

interface TrendingBook {
  rank: number;           // 1-20
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  downloadCount: number;
  trend: 'up' | 'down' | 'stable';  // 与上周对比
}
```

### Top 20 热门书籍数据

| 排名 | 书名 | 作者 | 下载量 |
|------|------|------|--------|
| 1 | Frankenstein | Mary Shelley | 303,668 |
| 2 | Moby Dick | Herman Melville | 119,658 |
| 3 | Pride and Prejudice | Jane Austen | 85,862 |
| 4 | The King in Yellow | Robert W. Chambers | 77,816 |
| 5 | Romeo and Juliet | Shakespeare | 73,678 |
| 6 | Dr. Jekyll and Mr. Hyde | R.L. Stevenson | 66,198 |
| 7 | Alice's Adventures in Wonderland | Lewis Carroll | 63,687 |
| 8 | The Complete Works of Shakespeare | Shakespeare | 57,637 |
| 9 | A Room with a View | E.M. Forster | 53,757 |
| 10 | Dracula | Bram Stoker | 46,309 |
| 11 | The Blue Castle | L.M. Montgomery | 45,022 |
| 12 | Crime and Punishment | Dostoyevsky | 43,493 |
| 13 | Jane Eyre | Charlotte Brontë | 43,410 |
| 14 | The Adventures of Ferdinand Count Fathom | T. Smollett | 40,286 |
| 15 | The Picture of Dorian Gray | Oscar Wilde | 40,087 |
| 16 | Twenty Years After | Alexandre Dumas | 39,501 |
| 17 | A Christmas Carol | Charles Dickens | 38,570 |
| 18 | A Tale of Two Cities | Charles Dickens | 32,071 |
| 19 | Adventures of Sherlock Holmes | Conan Doyle | 30,632 |
| 20 | Adventures of Huckleberry Finn | Mark Twain | 30,534 |

---

## Section 3: Categories (分类入口)

### 用途
快速进入各类别书籍

### 数据来源
预定义分类 + Gutendex `topic` 查询

### 数据结构

```typescript
interface Category {
  id: string;
  name: string;
  nameCN: string;
  icon: string;
  color: string;
  query: string;           // Gutendex API 查询参数
  bookCount: number;
  featuredBooks: number[]; // 精选书籍 ID
}
```

### 主要分类配置

| 分类 | 中文 | 图标 | API Query | 书籍数 | 代表作品 |
|------|------|------|-----------|--------|----------|
| fiction | 小说 | 📚 | `topic=fiction` | 15,000+ | Pride and Prejudice |
| mystery | 悬疑推理 | 🔍 | `topic=detective,mystery` | 3,000+ | Sherlock Holmes |
| sci-fi | 科幻 | 🚀 | `topic=science fiction` | 2,500+ | Frankenstein |
| romance | 爱情 | 💕 | `topic=romance` | 3,007 | Jane Eyre |
| horror | 恐怖 | 👻 | `topic=horror,gothic` | 1,500+ | Dracula |
| adventure | 冒险 | ⛵ | `topic=adventure` | 8,923 | Treasure Island |
| children | 儿童 | 🧒 | `topic=children` | 5,000+ | Alice in Wonderland |
| philosophy | 哲学 | 🤔 | `topic=philosophy` | 2,000+ | The Republic |
| classics | 经典文学 | 🏛️ | `topic=best books ever` | 500+ | Moby Dick |
| poetry | 诗歌 | 🎭 | `topic=poetry` | 3,000+ | Shakespeare's Sonnets |
| history | 历史 | 📜 | `topic=history` | 4,000+ | The Art of War |
| biography | 传记 | 👤 | `topic=biography` | 2,500+ | Autobiography of Benjamin Franklin |

---

## Section 4: Popular Authors (热门作者)

### 用途
以作者为入口引导阅读

### 数据来源
PG Top 100 Authors

### 数据结构

```typescript
interface AuthorCard {
  name: string;
  displayName: string;
  birthYear: number;
  deathYear: number;
  avatarUrl: string;       // 作家画像
  nationality: string;
  era: string;             // Victorian, Romantic, etc.
  totalDownloads: number;
  bookCount: number;
  topBooks: number[];      // Top 3 书籍 ID
  tags: string[];          // ["Classic", "British", "Romance"]
}
```

### Top 20 热门作者数据

| 排名 | 作者 | 年代 | 总下载量 | 代表作 |
|------|------|------|----------|--------|
| 1 | William Shakespeare | 1564-1616 | 81,845 | Romeo and Juliet, Hamlet |
| 2 | Charles Dickens | 1812-1870 | 92,682 | A Christmas Carol, Oliver Twist |
| 3 | Mary Shelley | 1797-1851 | 68,975 | Frankenstein |
| 4 | Mark Twain | 1835-1910 | 60,189 | Huckleberry Finn, Tom Sawyer |
| 5 | Jane Austen | 1775-1817 | 46,956 | Pride and Prejudice, Emma |
| 6 | Arthur Conan Doyle | 1859-1930 | 45,000+ | Sherlock Holmes Series |
| 7 | Oscar Wilde | 1854-1900 | 27,434 | Dorian Gray, Importance of Being Earnest |
| 8 | H.G. Wells | 1866-1946 | 114,749 | Time Machine, War of the Worlds |
| 9 | Edgar Allan Poe | 1809-1849 | 35,000+ | The Raven, Tales of Mystery |
| 10 | Jules Verne | 1828-1905 | 25,000+ | 20,000 Leagues, Around the World |
| 11 | Bram Stoker | 1847-1912 | 46,309 | Dracula |
| 12 | Lewis Carroll | 1832-1898 | 63,687 | Alice in Wonderland |
| 13 | Charlotte Brontë | 1816-1855 | 43,410 | Jane Eyre |
| 14 | Alexandre Dumas | 1802-1870 | 78,000+ | Count of Monte Cristo, Three Musketeers |
| 15 | L.M. Montgomery | 1874-1942 | 131,197 | Anne of Green Gables |
| 16 | L. Frank Baum | 1856-1919 | 125,330 | Wizard of Oz |
| 17 | Fyodor Dostoyevsky | 1821-1881 | 48,482 | Crime and Punishment |
| 18 | Herman Melville | 1819-1891 | 119,658 | Moby Dick |
| 19 | Robert Louis Stevenson | 1850-1894 | 85,753 | Treasure Island, Jekyll & Hyde |
| 20 | G.K. Chesterton | 1874-1936 | 92,157 | Father Brown Stories |

---

## Section 5: Audio Books (有声书)

### 用途
推广有声书功能，增加使用场景

### 数据来源
LibriVox API + Microsoft AI Audiobooks

### 数据结构

```typescript
interface AudioBookSection {
  humanRead: AudioBook[];   // LibriVox 人声
  aiGenerated: AudioBook[]; // Microsoft AI
}

interface AudioBook {
  bookId: number;
  title: string;
  author: string;
  narrator: string;        // 朗读者或 "AI Generated"
  duration: number;        // 分钟
  audioType: 'human' | 'ai';
  audioUrl: string;
  coverUrl: string;
}
```

### 推荐有声书 (LibriVox 人声)

| 书名 | 作者 | 朗读者 | 时长 |
|------|------|--------|------|
| Pride and Prejudice | Jane Austen | Karen Savage | 11h 35m |
| Frankenstein | Mary Shelley | Various | 8h 23m |
| Dracula | Bram Stoker | Various | 16h 45m |
| Alice in Wonderland | Lewis Carroll | Various | 2h 45m |
| Sherlock Holmes | Conan Doyle | Various | 9h 15m |
| A Christmas Carol | Charles Dickens | Various | 3h 12m |
| The Time Machine | H.G. Wells | Various | 3h 45m |
| Treasure Island | R.L. Stevenson | Various | 7h 20m |

---

## Section 6: New Arrivals (新书上架)

### 用途
展示最新添加的书籍

### 数据来源
PG RSS Feed (`today.rss`)

### 数据结构

```typescript
interface NewArrivalsSection {
  title: "New Arrivals" | "新书上架";
  books: NewBook[];
  lastUpdated: Date;
}

interface NewBook {
  id: number;
  title: string;
  author: string;
  addedDate: Date;
  coverUrl: string;
  isNew: boolean;  // 7天内为 true
}
```

### API 端点
`https://www.gutenberg.org/cache/epub/feeds/today.rss`

---

## Section 7: Curated Collections (编辑精选集)

### 用途
高质量主题书单，提升内容发现

### 数据结构

```typescript
interface Collection {
  id: string;
  title: string;
  titleCN: string;
  description: string;
  coverImage: string;
  bookIds: number[];
  bookCount: number;
  curatedBy: 'editor' | 'gutenberg' | 'community';
}
```

### 预设精选集

| 集合名称 | 描述 | 书籍数 | 来源 |
|----------|------|--------|------|
| **Best Books Ever** | 史上最佳书籍 | 100+ | PG 官方 Bookshelf |
| **Harvard Classics** | 哈佛经典丛书 | 50 | PG 官方 Bookshelf |
| **Nobel Prize Winners** | 诺贝尔文学奖获奖作品 | 30+ | 编辑精选 |
| **British Classics** | 英国经典文学 | 50+ | 编辑精选 |
| **American Literature** | 美国文学精选 | 50+ | 编辑精选 |
| **Victorian Era** | 维多利亚时代文学 | 40+ | 编辑精选 |
| **Gothic Horror** | 哥特恐怖小说 | 25+ | 编辑精选 |
| **Women Writers** | 女性作家作品 | 50+ | 编辑精选 |
| **Short Stories** | 短篇小说精选 | 100+ | PG 官方 |
| **1001 Books to Read** | 死前必读1001本 | 100+ | 编辑精选 |

---

*文档更新日期: 2024-12-25*
