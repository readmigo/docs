# 双语阅读管线执行报告

## 项目概述

| 项目 | 说明 |
|------|------|
| 目标 | 为 241 本公版英文书籍添加中文翻译，支持双语阅读 |
| 执行时间 | 2026-01-05 |
| 测试书籍 | The Count of Monte Cristo (基督山伯爵) |
| 执行环境 | DigitalOcean Droplet (4 核 / 8GB RAM) |

---

## 任务执行总览

| 序号 | 任务 | 状态 | 执行结果 |
|------|------|------|----------|
| 1 | 下载 ECDICT 数据到 Droplet | ✅ 完成 | 340 万词条词典已导入 |
| 2 | 编写导入脚本，导入词汇表 | ✅ 完成 | `import-ecdict.py` |
| 3 | 确定中文 EPUB 来源 | ✅ 完成 | 好读网站 + AI 翻译备选 |
| 4 | 编写 R2 上传脚本 | ✅ 完成 | 目录结构设计完成 |
| 5 | 完整处理 1 本书验证流程 | ✅ 完成 | 基督山伯爵 117 章处理完成 |
| 6 | 优化数据库写入性能 | ✅ 完成 | BatchWriter 批量写入 |
| 7 | 测试并行处理稳定性 | ✅ 完成 | 2 Worker 并行零错误 |

---

## 任务详情

### 任务 1: 下载 ECDICT 数据到 Droplet

| 项目 | 说明 |
|------|------|
| 数据源 | ECDICT (skywind3000/ECDICT) |
| 文件位置 | `~/data/ecdict/stardict.db` |
| 词条数量 | 3,402,564 |

**ECDICT 字段映射:**

| ECDICT 字段 | Vocabulary 字段 | 说明 |
|-------------|-----------------|------|
| word | word | 单词 |
| phonetic | phonetic | 音标 |
| pos | part_of_speech | 词性 |
| definition | definition | 英文释义 |
| translation | definition_zh | 中文释义 |
| bnc/frq | frequency_rank | 词频排名 |
| collins | cefr_level (推算) | CEFR 等级 |

---

### 任务 2: 编写导入脚本

| 项目 | 说明 |
|------|------|
| 脚本路径 | `packages/database/scripts/import-ecdict.py` |
| 导入速度 | ~9,000-15,000 词/秒 |
| 执行时间 | 4-6 分钟 |

**执行命令:**

```bash
cd ~/readmigo/packages/database
pm2 start 'source ~/readmigo/apps/nlp-service/venv/bin/activate && \
  DATABASE_URL="$DATABASE_URL" python3 scripts/import-ecdict.py' \
  --name ecdict-import --no-autorestart
```

---

### 任务 3: 确定中文 EPUB 来源

**来源方案对比:**

| 来源 | 覆盖率 | 质量 | 推荐度 |
|------|--------|------|--------|
| 好读 (haodoo.net) | ~800 本 | 高 | ★★★★★ |
| Gutenberg 中文版 | ~50 本 | 高 | ★★★ |
| AI 翻译 (DeepL/GPT-4) | 100% | 中等 | ★★★ |

**推荐策略:**

```
优先级 1: 好读/Gutenberg 现有译本 (~850 本)
优先级 2: AI 翻译补充 (剩余书籍)
优先级 3: 标记为"仅英文"
```

---

### 任务 4: 编写 R2 上传脚本

**目录结构设计:**

```
r2-production/
├── books/                    # 现有英文 EPUB
│   └── {book-id}/
│       └── book.epub
└── bilingual/                # 双语处理结果 (新增)
    └── {book-id}/
        ├── aligned.json      # 对齐结果
        ├── tokens.json       # 分词结果
        └── metadata.json     # 处理元数据
```

---

### 任务 5: 完整处理 1 本书验证流程

**测试书籍信息:**

| 属性 | 值 |
|------|-----|
| 书名 | The Count of Monte Cristo |
| Book ID | `99035bd3-fd24-413b-b794-69ef370f72b3` |
| 作者 | Alexandre Dumas |

**处理结果:**

| 指标 | 数值 |
|------|------|
| 章节数 | 117 |
| 段落数 | 14,679 |
| Token 数 | 588,600 |
| 词汇关联数 | 155,287 |
| 处理时间 | 60.6 分钟 |
| 平均对齐分数 | 0.67 |

**执行命令:**

```bash
cd ~/readmigo/packages/database/scripts/bilingual-pipeline
npx ts-node index.ts \
  --book-id 99035bd3-fd24-413b-b794-69ef370f72b3 \
  --en-epub ~/epubs/the_count_of_monte_cristo_en.epub \
  --zh-epub ~/epubs/the_count_of_monte_cristo_zh.epub \
  --use-semantic
```

---

### 任务 6: 优化数据库写入性能

**问题:** 原有逐条插入效率低，单章节写入需要 ~30 秒

**解决方案:** 创建 `BatchWriter` 批量写入器

| 文件 | 说明 |
|------|------|
| `batch-writer.ts` | 批量写入优化器 |

**优化效果:**

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 单章写入时间 | ~30s | ~2s | **15x** |
| 数据库往返次数 | 3N | ~3 | **大幅减少** |

**BatchWriter 核心特性:**

```
┌─────────────────────────────────────────────────────┐
│                 BatchWriter 架构                     │
└─────────────────────────────────────────────────────┘

1. 事务批量处理
   └── 使用 $transaction 确保数据一致性

2. 段落批量 upsert
   └── Promise.all 并行处理
   └── 批大小: 50 段落/批

3. Token 批量创建
   └── createMany 批量插入
   └── 批大小: 500 tokens/批

4. 超时保护
   └── 事务超时: 120 秒
   └── 最大等待: 10 秒
```

**测试结果:**

| 章节 | 段落数 | Token 数 | 写入时间 |
|------|--------|----------|----------|
| Chapter 2 | 127 | 4,082 | 1,765ms |
| Chapter 3 | 114 | 3,392 | 1,482ms |
| Chapter 4 | 96 | 4,973 | 2,004ms |

---

### 任务 7: 测试并行处理稳定性

**测试配置:**

| 参数 | 值 |
|------|-----|
| Worker 数量 | 2 |
| 测试章节数 | 6 |
| 每 Worker 章节数 | 3 |

**测试结果:**

| Worker | 章节 | 段落数 | Token 数 | 时间 |
|--------|------|--------|----------|------|
| Worker 1 | 2, 3, 4 | 337 | 12,447 | 71.15s |
| Worker 2 | 5, 6, 7 | 331 | 15,280 | 87.05s |
| **总计** | **6** | **668** | **27,727** | **87.07s** |

**验证结果:**

| 检查项 | 结果 |
|--------|------|
| 错误数 | 0 |
| 成功状态 | YES |
| 数据一致性 | PASS |
| NLP 服务并发 | 无冲突 |
| 数据库并发写入 | 无冲突 |

**执行命令:**

```bash
cd ~/readmigo/packages/database/scripts/bilingual-pipeline
pm2 start ecosystem.config.js
```

---

## 关键文件清单

| 文件路径 | 说明 |
|----------|------|
| `packages/database/scripts/bilingual-pipeline/index.ts` | 管线主入口 |
| `packages/database/scripts/bilingual-pipeline/batch-writer.ts` | 批量写入优化器 |
| `packages/database/scripts/bilingual-pipeline/parallel-test.ts` | 并行处理测试 |
| `packages/database/scripts/bilingual-pipeline/semantic-aligner.ts` | 语义对齐器 |
| `packages/database/scripts/bilingual-pipeline/epub-parser.ts` | EPUB 解析器 |
| `packages/database/scripts/bilingual-pipeline/tokenizer.ts` | 分词器 |
| `packages/database/scripts/bilingual-pipeline/vocabulary-linker.ts` | 词汇关联器 |
| `packages/database/scripts/import-ecdict.py` | ECDICT 导入脚本 |
| `apps/nlp-service/main.py` | NLP 服务 |

---

## 性能基准

### 单书处理时间分解

| 阶段 | 时间 | 占比 |
|------|------|------|
| EPUB 解析 | 5s | 0.1% |
| 语义对齐 | 20min | 33% |
| 分词 (SpaCy) | 25min | 42% |
| 词汇关联 | 5min | 8% |
| 数据库写入 | 10min | 17% |
| **总计** | **~60min** | 100% |

### 批量处理预估

| 规模 | 串行时间 | 2 并行 | 3 并行 |
|------|----------|--------|--------|
| 10 本 | 10 小时 | 5 小时 | 3.3 小时 |
| 100 本 | 100 小时 | 50 小时 | 33 小时 |
| 241 本 | 241 小时 | 120 小时 | 80 小时 |

---

## 存储占用

### 单书数据 (基督山伯爵)

| 数据项 | 数量 | 存储大小 |
|--------|------|----------|
| BilingualParagraph | 14,679 | ~7.3 MB |
| ParagraphToken | 588,600 | ~47.1 MB |
| Vocabulary (关联) | ~8,500 | ~2.5 MB |
| **总计** | - | **~57 MB** |

### 规模预估

| 规模 | 数据库存储 | 月成本 (Neon) |
|------|------------|---------------|
| 241 本 | ~14 GB | ~$25 |
| 1,000 本 | ~57 GB | ~$50 |
| 10,000 本 | ~570 GB | ~$150 |

---

## 依赖服务状态

| 服务 | 端口 | 状态 | PM2 名称 |
|------|------|------|----------|
| NLP Service | 8001 | ✅ 运行中 | nlp-service |
| PostgreSQL | 5432 | ✅ Neon 托管 | - |
| R2 Storage | - | ✅ Cloudflare | - |

---

## 后续工作建议

### 短期

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 获取更多中文 EPUB | 高 | 从好读下载公版译本 |
| 繁简转换脚本 | 高 | 好读译本为繁体 |
| 批量处理脚本 | 中 | PM2 多 Worker 配置 |

### 中期

| 任务 | 优先级 | 说明 |
|------|--------|------|
| iOS 客户端集成 | 高 | 双语阅读 UI |
| API 缓存优化 | 中 | Redis 缓存热门书籍 |
| 低分章节复核 | 中 | 对齐分数 < 0.5 的章节 |

### 长期

| 任务 | 优先级 | 说明 |
|------|--------|------|
| AI 翻译补充 | 中 | 无现有译本的书籍 |
| 用户反馈机制 | 低 | 翻译质量反馈 |
| 10 万本扩展 | 低 | 需评估成本和来源 |

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [双语阅读系统架构](../architecture/bilingual-reading-system.md) | 完整架构设计 |
| [双语阅读数据预处理分析](./bilingual-data-preprocessing.md) | 数据结构设计 |
| [双语段落语义对齐实战指南](./bilingual-semantic-alignment.md) | 对齐算法详解 |
| [双语批量处理执行计划](./bilingual-batch-processing.md) | 批处理方案 |
