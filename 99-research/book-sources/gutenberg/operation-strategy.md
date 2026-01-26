# Project Gutenberg 运营分发策略

## 概述

本文档定义基于 Project Gutenberg 数据的内容运营策略，包括更新频率、个性化推荐和节日营销。

---

## 内容更新日历

| 频率 | 内容类型 | 数据来源 |
|------|----------|----------|
| 实时 | 搜索结果 | Gutendex API |
| 每日 | Trending 排行 | PG Top 100 |
| 每日 | New Arrivals | RSS Feed |
| 每周 | Featured Banner | 编辑配置 |
| 每周 | Author Spotlight | 编辑精选 |
| 每月 | Curated Collections | 编辑策划 |
| 季度 | Category 重组 | 数据分析 |

---

## 个性化推荐策略

### 推荐算法层级

```
Level 1: 冷启动 (新用户)
├── 展示全局热门 (PG 下载量)
├── 引导选择兴趣分类
└── 推荐入门级经典

Level 2: 行为驱动 (活跃用户)
├── 基于阅读历史的相似推荐
├── 基于收藏/评分的偏好匹配
├── 同作者/同类别推荐
└── "完成 X 的读者也读了"

Level 3: 深度个性化 (高活跃用户)
├── 阅读难度匹配
├── 阅读时长偏好
├── 主题兴趣图谱
└── 社交推荐 (如有)
```

---

## 节日运营日历

| 日期 | 节日/事件 | 推荐主题 | 精选书籍 |
|------|-----------|----------|----------|
| 1/1 | 新年 | New Year's Resolutions | 励志经典 |
| 2/14 | 情人节 | Love Stories | Pride and Prejudice, Romeo and Juliet |
| 3/8 | 妇女节 | Women Writers | Jane Austen, Mary Shelley, Charlotte Brontë |
| 4/23 | 世界读书日 | Best Books Ever | Harvard Classics |
| 4/23 | 莎士比亚诞辰 | Shakespeare | Complete Works |
| 7/4 | 美国独立日 | American Classics | Mark Twain, Edgar Allan Poe |
| 10/31 | 万圣节 | Horror & Gothic | Frankenstein, Dracula, Poe |
| 11月 | 感恩节 | Gratitude & Family | Little Women |
| 12/25 | 圣诞节 | Christmas Stories | A Christmas Carol |

---

## 作者诞辰运营

| 日期 | 作者 | 推荐作品 |
|------|------|----------|
| 1/27 | Lewis Carroll (1832) | Alice in Wonderland |
| 2/7 | Charles Dickens (1812) | A Christmas Carol, Oliver Twist |
| 4/23 | William Shakespeare (1564) | Complete Works |
| 6/25 | George Orwell (1903) | 1984, Animal Farm |
| 7/4 | Nathaniel Hawthorne (1804) | The Scarlet Letter |
| 8/30 | Mary Shelley (1797) | Frankenstein |
| 10/16 | Oscar Wilde (1854) | The Picture of Dorian Gray |
| 11/30 | Mark Twain (1835) | Huckleberry Finn, Tom Sawyer |
| 12/16 | Jane Austen (1775) | Pride and Prejudice |

---

*文档更新日期: 2024-12-25*
