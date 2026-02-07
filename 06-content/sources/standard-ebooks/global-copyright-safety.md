# Standard Ebooks 全球版权安全评估

> Readmigo 商业使用 SE 内容的版权合规分析与全球安全书单

---

## 一、评估背景

| 项目 | 内容 |
|------|------|
| 评估日期 | 2026-01-27 |
| 评估目的 | 确认 SE 书籍用于商业产品的版权风险 |
| 产品性质 | Readmigo - 商业盈利产品 |
| 目标市场 | 全球 (iOS/Android App Store) |

---

### 2.2 内容来源

| 组成部分 | 版权状态 | 说明 |
|----------|----------|------|
| 原文文本 | 美国公共领域 | 出版于 1930 年前 |
| SE 排版/CSS | CC0 | SE 自有工作 |
| SE 封面设计 | CC0 | SE 自有工作 |
| 翻译文本 | 需逐一核实 | 原作公共领域 ≠ 翻译公共领域 |

---

### 3.2 风险示例

| 作者 | 去世年份 | 美国 | 欧盟/日本 | 中国 |
|------|----------|:----:|:---------:|:----:|
| Charles Dickens | 1870 | ✅ | ✅ | ✅ |
| F. Scott Fitzgerald | 1940 | ✅ | ✅ | ✅ |
| George Orwell | 1950 | ✅ | ✅ | ✅ |
| Virginia Woolf | 1941 | ✅ | ✅ | ✅ |
| Agatha Christie | 1976 | ✅ | ❌ | ✅ |
| Ernest Hemingway | 1961 | ✅ | ❌ | ❌ |
| Aldous Huxley | 1963 | ✅ | ❌ | ❌ |

---

### 4.2 安全书籍 Top 作者

| 排名 | 作者 | 书籍数 | 去世年份 |
|:----:|------|:------:|:--------:|
| 1 | William Shakespeare | 39 | 1616 |
| 2 | Edgar Rice Burroughs | 24 | 1950 |
| 3 | Anthony Trollope | 22 | 1882 |
| 4 | Edgar Wallace | 19 | 1932 |
| 5 | Jules Verne | 19 | 1905 |
| 6 | Honoré de Balzac | 17 | 1850 |
| 7 | George Bernard Shaw | 16 | 1950 |
| 8 | Charles Dickens | 14 | 1870 |
| 9 | H. G. Wells | 14 | 1946 |
| 10 | Joseph Conrad | 13 | 1924 |

### 4.3 不安全作者（需排除）

| 作者 | 去世年份 | 书籍数 | 风险地区 |
|------|:--------:|:------:|----------|
| Agatha Christie | 1976 | 12 | 欧盟、日本 |
| P. G. Wodehouse | 1975 | 8 | 欧盟、日本 |
| Aldous Huxley | 1963 | 4 | 欧盟、日本、中国 |
| C. S. Lewis | 1963 | 3 | 欧盟、日本、中国 |
| Andre Norton | 2005 | 10 | 全球（除美国） |
| Isaac Asimov | 1992 | 5 | 全球（除美国） |

---

### 5.1 生成文件

| 文件 | 位置 | 说明 |
|------|------|------|
| 全球安全书单 | `api/data/booklists/global-safe-books.json` | 858 本完整列表 |
| 作者数据库 | `api/data/booklists/author-death-years.json` | 392 位作者信息 |
| SE 完整目录 | `api/data/booklists/standard-ebooks-catalog.json` | 1373 本全目录 |

---

### 6.2 推荐实施方案

| 阶段 | 行动 | 说明 |
|------|------|------|
| V2.0 | 使用方案 A | 仅导入 858 本全球安全书籍 |
| 后续 | 补充验证 | 逐步验证 332 本待确认书籍 |
| 扩展 | 按需添加 | 根据用户需求评估方案 B |

### 6.3 技术实现

**当前流程:**

```mermaid
flowchart LR
    A["SE 网站"] --> B["下载全部"] --> C["导入数据库"]
```

**调整后流程:**

```mermaid
flowchart LR
    A["SE 网站"] --> B["对比安全书单"]
    B --> C["过滤"]
    C --> D["导入数据库"]
    E["global-safe-books.json"] --> B
```

**过滤逻辑:**

---

## 八、相关文档

| 文档 | 说明 |
|------|------|
| [SE 数据盘点](./data-inventory.md) | SE 内容详细统计 |
| [SE vs EPUB 3 对比](./se-vs-epub3-comparison.md) | 格式技术对比 |
| [V2.0 发布计划](../../../08-releases/roadmap/v2-fullstack-release-plan.md) | 版本发布规划 |
| [数据清洗记录](../../../10-pipeline/execution-logs/P006-v2-data-cleanup.md) | 导入执行日志 |

---

## 九、参考来源

- [Standard Ebooks - About](https://standardebooks.org/about)
- [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- [Cornell Copyright Term](https://copyright.cornell.edu/publicdomain)
- [Public Domain Day 2024](https://copyrightlately.com/public-domain-day-2024/)

---

*文档创建日期: 2026-01-27*
