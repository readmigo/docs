# Staging 环境数据填充计划 (Debug → Staging 同步)

> 目标：从 Debug 环境同步指定书单到 Staging 环境

---

## 1. 数据同步流程

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Debug → Staging 数据同步流程                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  数据源 (Debug 环境)                    目标 (Staging 环境)                      │
│  ├── Neon PostgreSQL (debug)     ──→   Neon PostgreSQL (staging)               │
│  │   └── books, chapters, authors      └── 同结构表                             │
│  │                                                                              │
│  └── Cloudflare R2 (debug)       ──→   Cloudflare R2 (staging)                 │
│      ├── EPUB 文件                      ├── EPUB 文件                           │
│      ├── 音频文件                       ├── 音频文件                            │
│      └── 封面图片                       └── 封面图片                            │
│                                                                                  │
│  执行位置: Droplet (mcloud88.com)                                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 同步内容 (严格按照书单)

### 2.0 执行约束 (重要)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              严格执行规则                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ✅ 必须遵守                                                                    │
│  ├── 严格按照书单执行同步，不允许超出书单范围                                   │
│  ├── 仅同步书单中列出的 300 电子书 + 150 有声书 + 100 作者                     │
│  └── 书单是唯一数据来源，不得自行添加其他内容                                   │
│                                                                                  │
│  ⚠️ 缺失处理                                                                    │
│  ├── 如果 Debug 中缺少书单中的某本书/有声书/作者                               │
│  │   └── 记录到缺失日志 (missing-items.log)                                    │
│  │   └── 继续同步其他内容，不中断流程                                          │
│  │   └── 等待下次 Debug 导入后再次尝试                                         │
│  │                                                                              │
│  └── 缺失日志格式:                                                             │
│      [2025-12-31 10:00:00] MISSING ebook: "Ulysses" by James Joyce             │
│      [2025-12-31 10:00:01] MISSING audiobook: "Pride and Prejudice"            │
│      [2025-12-31 10:00:02] MISSING author: "Franz Kafka"                       │
│                                                                                  │
│  ❌ 禁止行为                                                                    │
│  ├── 不允许同步书单以外的任何书籍                                               │
│  ├── 不允许跳过缺失记录直接报告成功                                             │
│  └── 不允许修改书单内容                                                         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 书单来源

| 文件 | 路径 |
|------|------|
| Phase 1 详细书单 | `docs/06-content/staging-phase1-booklist.md` |

### 2.2 同步数量统计

| 内容类型 | 数量 | 来源 |
|----------|------|------|
| 电子书 (Ebooks) | 300 本 | Standard Ebooks (Debug) |
| 有声书 (Audiobooks) | 150 本 | LibriVox (Debug) |
| 作者 (Authors) | 100 位 | Debug 作者表 |

### 2.3 电子书分类明细

| 分类 | 数量 | 说明 |
|------|------|------|
| P0 多榜单重叠作品 | 50 | 入选 3+ 权威榜单 |
| P0 LibriVox 超热门 | 50 | 播放量 500万+ |
| P1 Jane Austen 全集 | 7 | 作者全集 |
| P1 Charles Dickens 精选 | 20 | 作者精选 |
| P1 Sherlock Holmes 全集 | 15 | 系列全集 |
| P1 Shakespeare 戏剧精选 | 20 | 戏剧精选 |
| P1 Mark Twain 精选 | 15 | 作者精选 |
| P1 俄国文学经典 | 15 | 地区经典 |
| P1 法国文学经典 | 15 | 地区经典 |
| P1 科幻/奇幻经典 | 20 | 类型经典 |
| P1 哲学/思想经典 | 20 | 类型经典 |
| P1 冒险/儿童经典 | 25 | 类型经典 |
| 剩余补充书目 | 28 | 补充内容 |
| **总计** | **300** | |

### 2.4 有声书分类明细

| 分类 | 数量 | 说明 |
|------|------|------|
| Tier 1 超级热门 | 50 | 播放量 500万+ |
| Tier 1 榜单匹配 | 50 | 对应 P0 电子书 |
| 作家全集补充 | 50 | 补充作家作品 |
| **总计** | **150** | |

### 2.5 作者分类明细

| 分类 | 数量 | 说明 |
|------|------|------|
| 文学巨匠 - 必选 | 30 | Shakespeare, Dickens, Austen... |
| 经典作家 - 高优先 | 40 | Homer, Plato, Tolstoy... |
| 类型代表作家 | 30 | Lewis Carroll, Lovecraft... |
| **总计** | **100** | |

---

## 3. 环境配置

### 3.1 现有环境 (已就绪)

| 环境 | 组件 | 配置 |
|------|------|------|
| **Debug** | Neon PostgreSQL | `ep-xxx.ap-southeast-1.aws.neon.tech` |
| | Cloudflare R2 | `readmigo-debug` bucket |
| **Staging** | Neon PostgreSQL | `ep-shy-cloud-a1depd3i.ap-southeast-1.aws.neon.tech` |
| | Cloudflare R2 | `readmigo-staging` bucket |
| | Upstash Redis | `fly-readmigo-staging-redis.upstash.io` |
| | Fly.io App | `readmigo-staging` |

### 3.2 Droplet 配置

| 项目 | 配置 |
|------|------|
| 服务器 | mcloud88.com (159.65.143.131) |
| 配置 | 8GB RAM / 4 vCPU / 50GB SSD |
| Debug 环境变量 | `~/scripts/config/.env.debug` |
| Staging 环境变量 | `~/scripts/config/.env.staging` (新增) |

---

## 4. 执行计划

### 4.1 阶段一：环境准备

```
1. 创建 Staging 环境配置文件
   └── Droplet: ~/scripts/config/.env.staging
   └── 包含: DATABASE_URL, R2 凭证, Redis URL

2. 创建同步脚本
   ├── sync-books-to-staging.sh        # 主同步脚本
   ├── sync-audiobooks-to-staging.sh   # 有声书同步
   └── sync-authors-to-staging.sh      # 作者同步

3. 运行数据库迁移
   └── 确保 Staging 数据库 schema 与 Debug 一致
```

### 4.2 阶段二：基础数据填充

```
Step 1: 系统配置初始化 (仅限 Feature Flags 等)
        └── 填充: feature_flags, postcard_templates, medals, discover_tabs
        └── ⚠️ 禁止添加业务数据
        └── 预计: 1-2 分钟

Step 2: 同步电子书 (300 本)
        └── 从 Debug 查询书单中的书籍
        └── 复制记录到 Staging 数据库
        └── 复制 EPUB/封面到 Staging R2
        └── 预计: 30-45 分钟

Step 3: 同步有声书 (150 本)
        └── 从 Debug 查询匹配的有声书
        └── 复制记录到 Staging 数据库
        └── 复制音频元数据 (URL 保持不变)
        └── 预计: 15-20 分钟

Step 4: 同步作者 (100 位)
        └── 从 Debug 查询书单涉及的作者
        └── 复制作者记录到 Staging 数据库
        └── 预计: 5-10 分钟
```

---

## 5. 同步脚本设计

### 5.1 脚本结构

```
/home/readmigo/scripts/
├── jobs/
│   ├── import-standard-ebooks-debug.sh     # 现有 - Debug 导入
│   ├── sync-books-to-staging.sh            # 新增 - 电子书同步
│   ├── sync-audiobooks-to-staging.sh       # 新增 - 有声书同步
│   ├── sync-authors-to-staging.sh          # 新增 - 作者同步
│   └── init-staging-config.sh              # 新增 - 系统配置初始化
│
└── config/
    ├── .env.debug                          # 现有
    └── .env.staging                        # 新增
```

### 5.2 同步逻辑流程

```
┌────────────────────────────────────────────────────────────────────────┐
│                          电子书同步流程                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. 读取书单 (staging-phase1-booklist.md)                              │
│     └── 解析 300 本电子书的标题列表                                    │
│     └── 生成标题匹配列表 (精确匹配)                                    │
│                                                                         │
│  2. 查询 Debug 数据库                                                  │
│     └── SELECT * FROM books WHERE title IN (书单列表)                  │
│     └── 获取关联: chapters, book_categories                            │
│     ⚠️ 对比书单，记录缺失项到 missing-items.log                        │
│                                                                         │
│  3. 写入 Staging 数据库 (仅限找到的书籍)                               │
│     └── INSERT INTO books ... ON CONFLICT DO UPDATE                    │
│     └── INSERT INTO chapters ...                                       │
│     └── INSERT INTO book_categories ...                                │
│                                                                         │
│  4. 同步 R2 文件 (仅限找到的书籍)                                      │
│     └── 复制 EPUB: debug-bucket/epubs/* → staging-bucket/epubs/*      │
│     └── 复制封面: debug-bucket/covers/* → staging-bucket/covers/*     │
│                                                                         │
│  5. 生成同步报告                                                       │
│     └── 成功: X 本                                                     │
│     └── 缺失: Y 本 (详见 missing-items.log)                            │
│     └── 完成率: X / 300                                                │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3 缺失日志结构

```
/var/log/readmigo/staging-sync/
├── sync-20251231-100000.log          # 主同步日志
├── missing-ebooks.log                 # 缺失的电子书列表
├── missing-audiobooks.log             # 缺失的有声书列表
└── missing-authors.log                # 缺失的作者列表
```

**缺失日志示例 (missing-ebooks.log):**
```
# 缺失电子书列表 - 等待下次 Debug 导入后重试
# 生成时间: 2025-12-31 10:00:00
# 书单总数: 300 | 已同步: 285 | 缺失: 15

[MISSING] "Ulysses" by James Joyce - 未在 Debug 中找到
[MISSING] "The Sound and the Fury" by William Faulkner - 未在 Debug 中找到
...
```

---

## 6. 执行命令

### 6.1 首次完整同步

```bash
# SSH 到 Droplet
ssh readmigo@mcloud88.com

# 1. 更新代码
cd ~/projects/readmigo && git pull && pnpm install

# 2. 运行数据库迁移 (Staging)
source ~/scripts/config/.env.staging
cd packages/database && pnpm prisma migrate deploy

# 3. 初始化系统配置 (仅限 Feature Flags 等，禁止业务数据)
pnpm prisma db seed

# 4. 运行同步 (使用 screen 保持会话)
screen -S staging-sync

# 4.1 同步电子书 (~30-45分钟)
bash ~/scripts/jobs/sync-books-to-staging.sh

# 4.2 同步有声书 (~15-20分钟)
bash ~/scripts/jobs/sync-audiobooks-to-staging.sh

# 4.3 同步作者 (~5-10分钟)
bash ~/scripts/jobs/sync-authors-to-staging.sh
```

### 6.2 增量更新 (后续)

```bash
# 仅同步新增/更新的内容
bash ~/scripts/jobs/sync-books-to-staging.sh --incremental
```

---

## 7. 验证检查

### 7.1 数据验证 SQL

```sql
-- Staging 数据库执行

-- 检查电子书数量 (目标: 300，允许 < 300 如有缺失)
SELECT COUNT(*) as ebook_count FROM books WHERE type = 'ebook';

-- 检查有声书数量 (目标: 150，允许 < 150 如有缺失)
SELECT COUNT(*) as audiobook_count FROM audiobooks;

-- 检查作者数量 (目标: 100，允许 < 100 如有缺失)
SELECT COUNT(*) as author_count FROM authors;

-- 检查章节数量
SELECT COUNT(*) as chapter_count FROM chapters;

-- 检查系统配置
SELECT COUNT(*) FROM feature_flags;
SELECT COUNT(*) FROM medals;
SELECT COUNT(*) FROM postcard_templates;
```

### 7.2 缺失项检查 (重要)

```bash
# 查看缺失日志
cat /var/log/readmigo/staging-sync/missing-ebooks.log
cat /var/log/readmigo/staging-sync/missing-audiobooks.log
cat /var/log/readmigo/staging-sync/missing-authors.log

# 统计缺失数量
wc -l /var/log/readmigo/staging-sync/missing-*.log
```

**缺失项处理流程:**
1. 检查缺失日志，确认哪些书单内容未同步
2. 等待下次 Debug 环境导入 (每周日 Standard Ebooks 更新)
3. 重新执行同步脚本，补充缺失内容

### 7.3 API 验证

```bash
# 测试 Staging API
curl https://staging-api.readmigo.app/health
curl https://staging-api.readmigo.app/api/v1/books?limit=10
curl https://staging-api.readmigo.app/api/v1/audiobooks?limit=10
curl https://staging-api.readmigo.app/api/v1/authors?limit=10
```

### 7.4 R2 文件验证

```bash
# 检查 EPUB 文件数量
# 检查封面图片数量
# 抽查文件可访问性
```

### 7.5 同步报告示例

```
========================================
    Staging 数据同步报告
    执行时间: 2025-12-31 10:00:00
========================================

电子书同步:
  - 书单数量: 300
  - 已同步:   285 ✅
  - 缺失:     15  ⚠️
  - 完成率:   95%

有声书同步:
  - 书单数量: 150
  - 已同步:   142 ✅
  - 缺失:     8   ⚠️
  - 完成率:   94.7%

作者同步:
  - 书单数量: 100
  - 已同步:   98  ✅
  - 缺失:     2   ⚠️
  - 完成率:   98%

缺失项日志: /var/log/readmigo/staging-sync/
下次重试: 等待 Debug 环境更新后执行
========================================
```

---

## 8. 时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 阶段一 | 环境准备 (脚本创建) | 30 分钟 |
| 阶段二-1 | 系统配置初始化 | 2 分钟 |
| 阶段二-2 | 电子书同步 (300本) | 30-45 分钟 |
| 阶段二-3 | 有声书同步 (150本) | 15-20 分钟 |
| 阶段二-4 | 作者同步 (100位) | 5-10 分钟 |
| **总计** | | **~1.5-2 小时** |

---

## 9. 风险与注意事项

| 风险 | 缓解措施 |
|------|----------|
| Debug 数据不完整 | 先验证 Debug 中是否包含书单所有内容 |
| R2 复制失败 | 支持重试和断点续传 |
| 数据库连接限制 | 使用连接池，批量操作 |
| 执行时间长 | 使用 screen/tmux 保持会话 |

---

## 10. 需要创建的文件清单

### 10.1 配置文件

| 文件 | 位置 | 说明 |
|------|------|------|
| `.env.staging` | Droplet: `~/scripts/config/` | Staging 环境变量 |

### 10.2 同步脚本

| 文件 | 位置 | 说明 |
|------|------|------|
| `sync-books-to-staging.sh` | Droplet: `~/scripts/jobs/` | 电子书同步主脚本 |
| `sync-audiobooks-to-staging.sh` | Droplet: `~/scripts/jobs/` | 有声书同步脚本 |
| `sync-authors-to-staging.sh` | Droplet: `~/scripts/jobs/` | 作者同步脚本 |
| `init-staging-config.sh` | Droplet: `~/scripts/jobs/` | 系统配置初始化脚本 |

### 10.3 TypeScript 同步模块 (可选)

| 文件 | 位置 | 说明 |
|------|------|------|
| `sync-to-staging.ts` | `scripts/book-ingestion/` | 同步逻辑实现 |

---

## 11. 相关文档

| 文档 | 说明 |
|------|------|
| [staging-phase1-booklist.md](../../06-content/staging-phase1-booklist.md) | 详细书单 |
| [droplet.md](../deployment/services/droplet.md) | Droplet 基础信息 |
| [droplet-usage-guide.md](../deployment/services/droplet-usage-guide.md) | Droplet 使用指南 |

---

*创建日期: 2025-12-31*
*方案: Debug → Staging 同步*
*书单版本: Phase 1 (300 电子书 + 150 有声书 + 100 作者)*
