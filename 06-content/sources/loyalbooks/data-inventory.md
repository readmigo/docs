# LoyalBooks 数据盘点

> 从产品和运营角度，梳理 LoyalBooks 有声书数据及其对 Readmigo 的价值

---

## 1. LoyalBooks 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://www.loyalbooks.com |
| **定位** | 免费公共领域有声书和电子书聚合平台 |
| **英语有声书数量** | 12,129 本 |
| **Sitemap 总条目** | ~35,783 |
| **语言支持** | 29+ 种语言 |
| **内容来源** | LibriVox（音频）+ Project Gutenberg（电子书） |
| **运营模式** | 聚合分发 |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 有声书+电子书一站式 | 无官方 API |
| 有 Top 100 热门榜单 | 内容与 LibriVox/PG 重叠 |
| 分类清晰（40+ 分类） | 部分页面 URL 不规范 |
| 公共领域，可商用 | 需爬取获取数据 |
| 已有现成下载脚本 | 音频质量参差不齐 |

---

### 2.1 总体规模

| 指标 | 数量 |
|------|------|
| **Sitemap 总条目** | ~35,783 |
| **英语有声书** | 12,129 |
| **官方宣称** | 7,000+ 有声书+电子书 |
| **语言种类** | 29+ 种 |
| **分类数量** | 40+ 种 |

### 2.2 题材分类统计

| 分类 | 估算数量 | 产品适配度 |
|------|----------|------------|
| **Fiction (小说)** | ~2,670 | ⭐⭐⭐⭐⭐ 核心阅读 |
| **Literature (文学)** | ~1,800 | ⭐⭐⭐⭐⭐ 核心阅读 |
| **Non-fiction (非虚构)** | ~1,500 | ⭐⭐⭐⭐ 知识学习 |
| **History (历史)** | ~1,110 | ⭐⭐⭐⭐ 知识学习 |
| **Poetry (诗歌)** | ~1,050 | ⭐⭐⭐ 语言学习 |
| **Adventure (冒险)** | ~780 | ⭐⭐⭐⭐⭐ 趣味阅读 |
| **Biography (传记)** | ~630 | ⭐⭐⭐⭐ 人物故事 |
| **Children (儿童)** | ~570 | ⭐⭐⭐⭐⭐ 入门阅读 |
| **Romance (浪漫)** | ~480 | ⭐⭐⭐⭐ 情感故事 |
| **Mystery (悬疑)** | ~420 | ⭐⭐⭐⭐⭐ 趣味阅读 |
| **Humor (幽默)** | ~390 | ⭐⭐⭐ 轻松阅读 |
| **Philosophy (哲学)** | ~270 | ⭐⭐⭐ 深度阅读 |
| **Fantasy (奇幻)** | ~240 | ⭐⭐⭐⭐⭐ 趣味阅读 |

### 2.3 语言分布

| 语言 | 说明 |
|------|------|
| **English** | 12,129 本（主力） |
| Chinese | 有少量 |
| French | 有 |
| German | 有 |
| Spanish | 有 |
| Japanese | 有 |
| 其他 20+ 语言 | 各有内容 |

---

### 3.2 Top 100 榜单（部分）

| 排名 | 书籍 | 作者 |
|------|------|------|
| 1 | Pride and Prejudice | Jane Austen |
| 2 | Moby Dick | Herman Melville |
| 3 | Adventures of Huckleberry Finn | Mark Twain |
| 4 | Alice's Adventures in Wonderland | Lewis Carroll |
| 5 | Adventures of Tom Sawyer | Mark Twain |
| 6 | The Swiss Family Robinson | Johann David Wyss |
| 7 | Jane Eyre | Charlotte Brontë |
| 8 | Aesop's Fables | Aesop |
| 9 | The Count of Monte Cristo | Alexandre Dumas |
| 10 | The Art of War | Sun Tzu |
| 11 | Great Expectations | Charles Dickens |
| 12 | Anne of Green Gables | L.M. Montgomery |
| 13 | The Return of Sherlock Holmes | Arthur Conan Doyle |
| 14 | Treasure Island | Robert Louis Stevenson |
| 15 | Dracula | Bram Stoker |
| 16 | Uncle Tom's Cabin | Harriet Beecher Stowe |
| 17 | Emma | Jane Austen |
| 18 | Sense and Sensibility | Jane Austen |
| 19 | The Odyssey | Homer |
| 20 | Andersen's Fairy Tales | Hans Christian Andersen |
| 21 | The Decameron | Giovanni Boccaccio |
| 22 | Romeo and Juliet | William Shakespeare |
| ... | ... | ... |

---

### 4.2 推荐导入策略

| 阶段 | 导入榜单 | 书籍数量 | 覆盖需求 |
|------|----------|----------|----------|
| **Phase 1** | Top 100 + Fiction Top 100 + Literature Top 100 | ~300 | 核心内容 |
| **Phase 2** | + Adventure/Mystery/Children/History 各 Top 50 | ~500 | 扩展分类 |
| **Phase 3** | + 剩余分类 + 完整库 | ~5000+ | 长尾内容 |

---

### 5.1 版权期限对比

| 国家/地区 | 版权期限 | 2025年公版标准 |
|-----------|----------|----------------|
| **美国** | 作者去世后70年 或 1929年前出版 | 1954年前去世的作者 |
| **中国** | 作者去世后50年 | 1974年前去世的作者 |
| **欧盟** | 作者去世后70年 | 1954年前去世的作者 |
| **日本** | 作者去世后70年 | 1954年前去世的作者 |

### 5.3 风险矩阵

| 风险类型 | 风险等级 | 说明 | 应对措施 |
|----------|----------|------|----------|
| **美国版权** | ✅ 低 | 1929年前出版作品已公版 | 确认出版年份 |
| **中国版权** | ✅ 低 | 期限更短(50年)，大部分经典已公版 | 确认作者去世时间 |
| **跨境差异** | ⚠️ 中 | 某些国家期限不同 | 针对目标市场逐一确认 |
| **翻译版权** | ⚠️ 中 | 翻译版本有独立版权 | 仅使用原文，不用翻译 |
| **商标侵权** | ⚠️ 中 | PG商标不能商用 | 移除所有PG标识 |
| **封面版权** | ⚠️ 中 | 现代封面可能有版权 | 使用原始封面或自制 |
| **录音版权** | ✅ 低 | LibriVox明确放弃 | 无需额外处理 |

### 5.4 Top 100 经典作家版权状态

| 作者 | 去世年份 | 美国 | 中国 | 状态 |
|------|----------|------|------|------|
| Jane Austen | 1817 | ✅ | ✅ | 安全 |
| Charles Dickens | 1870 | ✅ | ✅ | 安全 |
| Mark Twain | 1910 | ✅ | ✅ | 安全 |
| Shakespeare | 1616 | ✅ | ✅ | 安全 |
| Homer | 古代 | ✅ | ✅ | 安全 |
| Edgar Allan Poe | 1849 | ✅ | ✅ | 安全 |
| Leo Tolstoy | 1910 | ✅ | ✅ | 安全 |
| Bram Stoker | 1912 | ✅ | ✅ | 安全 |
| H.G. Wells | 1946 | ✅ | ✅ | 安全 |
| Jules Verne | 1905 | ✅ | ✅ | 安全 |
| Arthur Conan Doyle | 1930 | ✅ | ✅ | 安全 |
| F. Scott Fitzgerald | 1940 | ✅ | ✅ | 安全 |

### 5.6 法律风险结论

| 评估项 | 结论 |
|--------|------|
| **整体风险** | ✅ **低风险** |
| **Top 100 榜单** | ✅ 全部安全（经典作家均已超过版权期限） |
| **中国市场** | ✅ 安全（50年期限更宽松） |
| **商业使用** | ✅ 允许（LibriVox明确授权，PG移除商标后可用） |
| **需要注意** | ⚠️ 1950年后去世的作者、翻译版本、现代封面 |

---

### 6.1 现有脚本

项目已有 LoyalBooks 下载脚本：

### 6.2 脚本功能

| 功能 | 说明 |
|------|------|
| **Sitemap 解析** | 从 sitemap.xml 获取全部书籍 URL (~35,783) |
| **有声书筛选** | 过滤有 Archive.org 音频的书籍 |
| **音频下载** | 下载 MP3 章节到本地/R2 |
| **封面下载** | 下载书籍封面 |
| **元数据提取** | 提取标题、作者、描述、分类等 |
| **数据库同步** | 同步到 audiobooks + audiobook_chapters 表 |
| **断点续传** | 支持 resume，保存进度 |

---

## 7. 与其他数据源对比

| 来源 | 电子书 | 有声书 | 质量 | API | 推荐用途 |
|------|--------|--------|------|-----|----------|
| **Standard Ebooks** | 700+ | ❌ | ⭐⭐⭐⭐⭐ | ✅ | 电子书首选 |
| **Project Gutenberg** | 70,000+ | ❌ | ⭐⭐⭐ | ✅ | 大量扩展 |
| **LibriVox** | ❌ | 20,000+ | ⭐⭐⭐ | ✅ | 有声书首选 |
| **LoyalBooks** | 有 | 12,000+ | ⭐⭐⭐ | ❌ | 有声书便捷入口 |

---

### 8.1 导入优先级

| 优先级 | 内容 | 数量 | 价值 |
|--------|------|------|------|
| **P0** | Top 100 榜单书籍 | 100 | 最高热度、用户认知度高 |
| **P1** | Fiction + Literature 精选 | ~500 | 核心阅读内容 |
| **P2** | 经典作家全集 | ~200 | Jane Austen, Dickens, Twain 等 |
| **P3** | 完整英语有声书库 | 12,000+ | 长尾内容 |

---

## 9. 参考资源

- [LoyalBooks 官网](https://www.loyalbooks.com/)
- [LoyalBooks Top 100](https://www.loyalbooks.com/Top_100)
- [LoyalBooks About](https://www.loyalbooks.com/about)
- [LibriVox Public Domain Policy](https://librivox.org/pages/public-domain/)
- [Project Gutenberg License](https://www.gutenberg.org/policy/license.html)
- [2025 Public Domain Entry](https://publicdomainreview.org/features/entering-the-public-domain/2025/)
- [Copyright Duration by Country](https://en.wikipedia.org/wiki/List_of_copyright_duration_by_country)

---

*文档更新日期: 2025-12-30*
