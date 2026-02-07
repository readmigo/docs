# 10-pipeline

数据处理流水线文档：书籍导入、双语处理、自动化流水线与执行记录。

> **文档数量**: 16 个文件 (含 2 个已废弃)

---

## 目录结构

| 子目录 | 说明 | 文件数 |
|--------|------|--------|
| [bilingual/](./bilingual/) | 双语处理流水线 | 6 |
| [execution-logs/](./execution-logs/) | Pipeline 执行记录 | 6 |
| [design/](./design/) | 流水线设计文档 | 1 |
| [automation/](./automation/) | 环境自动化 | 1 |

---

## 核心文档

| 文档 | 描述 |
|------|------|
| [pipeline-system.md](./pipeline-system.md) | Pipeline 系统总览与架构 |
| [book-import-system.md](./book-import-system.md) | 书籍导入系统完整流程 |

---

## bilingual/ 双语处理

| 文档 | 描述 |
|------|------|
| [bilingual-batch-processing.md](./bilingual/bilingual-batch-processing.md) | 批量双语处理流程 |
| [bilingual-data-preprocessing.md](./bilingual/bilingual-data-preprocessing.md) | 双语数据预处理 |
| [bilingual-pipeline-execution-report.md](./bilingual/bilingual-pipeline-execution-report.md) | 双语流水线执行报告 |
| [bilingual-pipeline-storage-structure.md](./bilingual/bilingual-pipeline-storage-structure.md) | 双语存储结构设计 |
| [bilingual-semantic-alignment.md](./bilingual/bilingual-semantic-alignment.md) | 语义对齐算法 |
| [ai-translation-comparison.md](./bilingual/ai-translation-comparison.md) | AI 翻译服务对比 |

---

## execution-logs/ 执行记录

| 文档 | 描述 |
|------|------|
| ~~[P001-debug-staging-sync.md](./execution-logs/P001-debug-staging-sync.md)~~ | ~~Debug-Staging 数据同步~~ (已废弃 - Staging 环境已取消) |
| [P002-generate-quotes.md](./execution-logs/P002-generate-quotes.md) | 书籍引言生成 |
| [P003-environment-integrity-check.md](./execution-logs/P003-environment-integrity-check.md) | 环境完整性检查 |
| [P004-fullstack-release.md](./execution-logs/P004-fullstack-release.md) | 全栈发布流程 |
| ~~[P005-staging-data-cleanup.md](./execution-logs/P005-staging-data-cleanup.md)~~ | ~~Staging 数据清理~~ (已废弃 - Staging 环境已取消) |
| [P006-v2-data-cleanup.md](./execution-logs/P006-v2-data-cleanup.md) | V2.0 数据清洗（100% SE） |

---

## design/ 设计文档

| 文档 | 描述 |
|------|------|
| [highlight-sync-pipeline.md](./design/highlight-sync-pipeline.md) | 有声书高亮同步管道设计 |

---

## automation/ 自动化

| 文档 | 描述 |
|------|------|
| [environment-pipeline-design.md](./automation/environment-pipeline-design.md) | 环境自动化流水线设计 |

---

## 快速导航

- **系统总览**: pipeline-system.md
- **书籍导入**: book-import-system.md
- **双语处理**: bilingual/bilingual-batch-processing.md
- **执行记录**: execution-logs/

