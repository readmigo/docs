## 概述

本文档评估基于 Project Gutenberg 数据（书籍内容、排行榜、流行度等）构建商业化 App 的法律可行性与商业模式。

---

### 核心结论

| 使用方式 | 是否可行 | 费用 |
|----------|----------|------|
| 使用公共领域书籍内容 | ✅ **完全可行** | 免费 |
| 商业销售/订阅 | ✅ **完全可行** | 免费（不用商标时） |
| 使用 "Project Gutenberg" 商标 | ⚠️ 需付费 | 毛利润的 20% |
| 移除 PG 标识后使用 | ✅ **完全可行** | 免费 |

#### 商标使用规则

| 场景 | 规则 |
|------|------|
| 非商业使用 | 无需许可 |
| 商业使用 + 使用 PG 商标 | 支付毛利润的 20% 作为版税 |
| 商业使用 + 不使用 PG 商标 | **无需支付任何费用** |
| 引用/致谢 PG 作为来源 | 无需许可，包括商业用途 |

#### 受版权保护的作品

> ⚠️ **注意**: 约有数千本书仍受版权保护，每本书的页头会明确标注。使用前需确认版权状态。

---

### 模式对比

| 模式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Freemium 订阅** | 稳定收入、高 LTV | 需持续提供价值 | ⭐⭐⭐⭐⭐ |
| **一次性付费** | 简单直接 | 收入不可持续 | ⭐⭐⭐ |
| **广告模式** | 低门槛 | 影响阅读体验 | ⭐⭐ |
| **增值服务** | 不影响核心体验 | 需开发额外功能 | ⭐⭐⭐⭐ |

---

### 阅读类 App

| App | 模式 | 定价 |
|-----|------|------|
| Kindle Unlimited | 订阅 | $11.99/月 |
| Scribd | 订阅 | $12.99/月 |
| Audible | 订阅 | $14.95/月 |
| Gutenberg Project (iOS) | 一次性 | $6 |

### 语言学习类 App

| App | 模式 | 定价 |
|-----|------|------|
| Beelinguapp | Freemium | 免费 / $6.99月 / $59.99年 |
| Prismatext | 订阅 | 月付/半年付 + 积分制 |
| Readlang | Freemium | 免费 / Premium 订阅 |
| Drops | Freemium | $13/月 / $69.99/年 / $159.99终身 |

---

### 书籍内容

| 数据类型 | 获取方式 | 更新频率 |
|----------|----------|----------|
| 书籍文本 (EPUB) | 下载并处理后存储 | 按需 |
| 元数据 | Gutendex API 或 OPDS | 每日/每周 |
| 封面图片 | PG 缓存服务器 | 按需 |
| 有声书 | LibriVox / Microsoft AI | 按需 |

### 排行榜与运营数据

| 数据类型 | 来源 | 使用方式 |
|----------|------|----------|
| 热门书籍 Top 100 | PG 官网 / Gutendex | Discover 页面展示 |
| 热门作者 | PG 官网 | 作者推荐模块 |
| 下载量 | Gutendex API | 排序和推荐依据 |
| 新书更新 | RSS Feed | 「新书」栏目 |
| 分类数据 | Bookshelves | 分类浏览 |

---

### 必须遵守

| 要求 | 说明 |
|------|------|
| 版权确认 | 使用前确认每本书的版权状态 |
| 受版权作品 | 不得商业使用 PG 中仍受保护的作品 |
| 不得虚假宣传 | 不能谎称是「官方」App |
| 数据归属 | 建议注明内容来源 |

### 潜在风险

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 误用受版权作品 | 中 | 建立版权检查流程 |
| PG 社区负面反馈 | 低 | 透明运营，贡献社区 |
| 商标侵权指控 | 低 | 不使用 PG 商标 |
| 竞品复制 | 中 | 持续创新，建立壁垒 |

### 道德考量

虽然法律上允许商业使用，但 PG 社区对「直接贩卖志愿者劳动成果」存在一些争议：

> "Gutenberg contributors have questioned the appropriateness of directly
> and commercially reusing content that has been formatted by volunteers."

**建议做法**：
1. 在 App 内宣传 PG 使命和志愿者贡献
2. 提供便捷的 PG 捐赠入口
3. 考虑将部分收益捐赠给 PG 基金会
4. 如可能，贡献技术或内容回馈社区

---

### 商业化可行性评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 法律可行性 | ⭐⭐⭐⭐⭐ | 完全合法，无障碍 |
| 内容成本 | ⭐⭐⭐⭐⭐ | 核心内容零成本 |
| 市场空间 | ⭐⭐⭐⭐ | 有竞品但差异化空间大 |
| 商业模式 | ⭐⭐⭐⭐ | Freemium 模式成熟 |
| 道德风险 | ⭐⭐⭐ | 需平衡商业与社区期望 |

### 核心结论

**✅ 商业化使用 Project Gutenberg 数据是完全可行且合法的。**

关键成功因素：
1. **不使用 PG 商标** → 避免 20% 版税
2. **增值而非搬运** → 提供独特价值而非简单复制
3. **尊重社区** → 透明运营，适当回馈
4. **差异化竞争** → 通过体验和功能建立壁垒

---

## 参考链接

- [Project Gutenberg License](https://www.gutenberg.org/policy/license.html)
- [Project Gutenberg Permission How-To](https://www.gutenberg.org/policy/permission.html)
- [Project Gutenberg Terms of Use](https://www.gutenberg.org/policy/terms_of_use.html)
- [Quora: Commercial Use of Project Gutenberg](https://www.quora.com/Can-I-use-books-from-Project-Gutenberg-for-commercial-purposes)

---

*文档更新日期: 2024-12-24*
