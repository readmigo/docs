# Project Gutenberg 技术实现

## 概述

本文档定义技术实现细节，包括 API 调用、数据缓存和同步策略。

---

## API 调用规范

### Gutendex Service 封装

```typescript
// Gutendex API 调用封装
class GutendexService {
  private baseUrl = 'https://gutendex.com';

  // 热门书籍
  async getPopularBooks(limit: number = 20): Promise<Book[]> {
    return this.fetch(`/books?sort=popular&page_size=${limit}`);
  }

  // 分类书籍
  async getBooksByCategory(topic: string, limit: number = 20): Promise<Book[]> {
    return this.fetch(`/books?topic=${topic}&sort=popular&page_size=${limit}`);
  }

  // 搜索
  async searchBooks(query: string): Promise<Book[]> {
    return this.fetch(`/books?search=${encodeURIComponent(query)}`);
  }

  // 作者书籍
  async getBooksByAuthor(author: string): Promise<Book[]> {
    return this.fetch(`/books?search=${encodeURIComponent(author)}&sort=popular`);
  }

  // 单本书籍详情
  async getBook(id: number): Promise<Book> {
    return this.fetch(`/books/${id}`);
  }
}
```

---

## 数据缓存策略

| 数据类型 | 缓存时间 | 存储位置 |
|----------|----------|----------|
| 热门排行 | 24 小时 | Redis |
| 分类列表 | 7 天 | Redis |
| 书籍详情 | 30 天 | 数据库 |
| 作者信息 | 30 天 | 数据库 |
| 搜索结果 | 1 小时 | Redis |
| 封面图片 | 永久 | R2/CDN |

---

## 数据同步任务

### 定时任务配置

```typescript
// 定时任务配置
const syncJobs = [
  {
    name: 'sync-trending',
    schedule: '0 2 * * *',  // 每天凌晨2点
    task: syncTrendingBooks
  },
  {
    name: 'sync-new-arrivals',
    schedule: '0 3 * * *',  // 每天凌晨3点
    task: syncNewArrivals
  },
  {
    name: 'sync-author-stats',
    schedule: '0 4 * * 0',  // 每周日凌晨4点
    task: syncAuthorStats
  },
  {
    name: 'sync-audiobooks',
    schedule: '0 5 * * 1',  // 每周一凌晨5点
    task: syncAudioBooks
  }
];
```

---

## 数据资产清单

### 静态配置数据

需要预先配置并存入数据库的数据：

- [ ] 分类层级结构 (CategoryTree)
- [ ] 热门作者列表 (Top 50 Authors)
- [ ] 编辑精选集 (10+ Collections)
- [ ] 节日运营日历
- [ ] 作者诞辰日历
- [ ] 作者头像/简介

### 动态同步数据

需要定期从 Gutenberg 同步的数据：

- [ ] 热门书籍排行 (每日)
- [ ] 新书列表 (每日)
- [ ] 下载量统计 (每日)
- [ ] 有声书目录 (每周)

### 用户生成数据

需要在产品中收集的数据：

- [ ] 阅读进度
- [ ] 用户评分
- [ ] 收藏/书签
- [ ] 阅读时长
- [ ] 搜索历史

---

*文档更新日期: 2024-12-25*
