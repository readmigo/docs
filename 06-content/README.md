# 06-content

内容运营与内容数据体系文档：内容策略、分类系统、书单规划、数据源管理。

> 📊 **文档数量**: 30+ 个文件

---

## 内容规模

| 来源 | 数量 | 类型 |
|------|------|------|
| Standard Ebooks | 1,000+ | 高质量电子书 |
| Project Gutenberg | 76,000+ | 公版电子书 |
| LibriVox | 20,000+ | 免费有声书 |

---

## 核心策略文档

| 文档 | 描述 |
|------|------|
| [content-data-strategy.md](./content-data-strategy.md) | 三层数据架构、主要资源、运营分发策略 |
| [classification-system.md](./classification-system.md) | 12层级分类体系（12主类→子类→标签） |
| [content-processing.md](./content-processing.md) | EPUB清洗、元数据提取、AI增强 |
| [multilingual-management.md](./multilingual-management.md) | 中英文书籍差异化管理 |

---

## 书单与上线计划

| 阶段 | 目标 | 文档 |
|------|------|------|
| **Phase 1** | 1,000本电子书 + 500本有声书 | [staging-phase1-booklist.md](./staging-phase1-booklist.md) |
| **Phase 2** | 扩展到5,000本 + 中文试点 | [staging-phase2-booklist.md](./staging-phase2-booklist.md) |
| **Phase 3** | 10,000+ 多语言库 | [staging-phase3-booklist.md](./staging-phase3-booklist.md) |
| **策略** | 上架原则与配额分配 | [staging-launch-strategy.md](./staging-launch-strategy.md) |

---

## 数据来源

### P0 核心来源
| 来源 | 文档 |
|------|------|
| Standard Ebooks | [sources/standard-ebooks/](./sources/standard-ebooks/) |
| Project Gutenberg | [sources/gutenberg/](./sources/gutenberg/) |
| LibriVox | [sources/librivox/](./sources/librivox/) |

### 其他来源
- [Internet Archive](./sources/internet-archive/)
- [Open Library](./sources/open-library/)
- [中文哲学书(ctext)](./sources/ctext/)

---

## 验证报告

| 文档 | 描述 |
|------|------|
| [validation/batch-enrichment-script-analysis.md](./validation/batch-enrichment-script-analysis.md) | 批量增强脚本分析（节省70%数据库空间） |
| [validation/young-pilgrim-r2-validation.md](./validation/young-pilgrim-r2-validation.md) | R2解析完整性校验报告 |

---

## 快速导航

- **了解策略**: content-data-strategy.md
- **选书参考**: staging-launch-strategy.md → staging-phase1-booklist.md
- **技术实现**: classification-system.md → content-processing.md
- **数据来源**: sources/README.md

