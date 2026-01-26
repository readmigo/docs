# V1.0 Staging 环境实施执行计划

> Foundation MVP 发布准备 | 电子书 + 作者 | 无有声书

---

## 一、实施目标

### 1.1 V1.0 版本范围

```
┌─────────────────────────────────────────────────────────────────┐
│                      V1.0 Foundation MVP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ✅ 包含 (V1.0)                    ❌ 不包含 (V2.0+)            │
│   ─────────────────                 ────────────────             │
│   • 电子书: 300 本                  • 有声书                     │
│   • 作者: 100 位                    • 音频播放器                 │
│   • EPUB 阅读器                     • 边读边听                   │
│   • 高亮/书签                       • 热词标注                   │
│   • AI 查词翻译                     • 段落解析                   │
│   • 阅读进度同步                    • 内容导入                   │
│   • 用户登录 (Apple/Google)         • 社区功能                   │
│                                                                   │
│   平台: iOS Only                                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Staging 环境数据目标

| 内容类型 | 数量 | 来源 | 说明 |
|----------|------|------|------|
| **电子书** | 300 本 | Debug 环境 (Standard Ebooks) | 严格按书单 |
| **作者** | 100 位 | Debug 环境 | 与电子书关联 |
| **章节** | ~5,000 章 | EPUB 解析 | 自动提取 |
| **有声书** | 0 本 | - | V1.0 不含 |

---

## 二、前置条件检查

### 2.1 环境检查清单

```
┌─────────────────────────────────────────────────────────────────┐
│                      前置条件检查                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  □ Debug 环境 (数据源)                                           │
│    □ Neon PostgreSQL 可访问                                      │
│    □ R2 readmigo-debug bucket 有数据                            │
│    □ 书单中的 300 本书已导入                                     │
│    □ 书单中的 100 位作者已导入                                   │
│                                                                   │
│  □ Staging 环境 (目标)                                           │
│    □ Neon PostgreSQL staging 库已创建                           │
│    □ R2 readmigo-staging bucket 已创建                          │
│    □ Fly.io readmigo-staging app 已部署                         │
│    □ Upstash Redis staging 已配置                               │
│                                                                   │
│  □ Droplet (执行环境)                                            │
│    □ SSH 可访问 mcloud88.com                                     │
│    □ ~/scripts/config/.env.debug 已配置                         │
│    □ ~/scripts/config/.env.staging 已配置                       │
│    □ 代码已更新到最新                                            │
│                                                                   │
│  □ iOS 客户端                                                    │
│    □ Staging API 配置已切换                                      │
│    □ 有声书 Tab 已隐藏                                           │
│    □ TestFlight 准备就绪                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据源验证 SQL (Debug 环境)

```sql
-- 在 Debug 数据库执行，验证源数据是否充足

-- 电子书数量 (需要 >= 300)
SELECT COUNT(*) as total_ebooks FROM books WHERE source = 'standard_ebooks';

-- 作者数量 (需要 >= 100)
SELECT COUNT(*) as total_authors FROM authors;

-- 章节数量
SELECT COUNT(*) as total_chapters FROM chapters;

-- EPUB 文件检查 (抽样)
SELECT id, title, epub_url FROM books
WHERE epub_url IS NOT NULL
LIMIT 10;

-- 封面图检查 (抽样)
SELECT id, title, cover_url FROM books
WHERE cover_url IS NOT NULL
LIMIT 10;
```

---

## 三、实施步骤

### 3.1 执行流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                      V1.0 Staging 实施流程                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Phase 1: 环境准备 (T-0)                                         │
│  ───────────────────────                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ 配置检查 │───►│ DB 迁移  │───►│ 系统配置  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│       │                                │                         │
│       ▼                                ▼                         │
│  验证环境变量              feature_flags, medals,                │
│  验证连接性               postcard_templates 等                   │
│                                                                   │
│  Phase 2: 数据同步 (T+30min)                                     │
│  ─────────────────────────────                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ 同步作者 │───►│ 同步电子书│───►│ 同步R2文件│                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│     100位          300本          EPUB+封面                      │
│     ~5min          ~30min          ~30min                        │
│                                                                   │
│  Phase 3: 验证部署 (T+90min)                                     │
│  ─────────────────────────────                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ 数据验证 │───►│ API 测试 │───►│ iOS 测试  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
│   SQL 检查        端点测试      TestFlight                       │
│                                                                   │
│  Phase 4: Manifest 发布 (T+120min)                               │
│  ─────────────────────────────────                               │
│  ┌──────────┐    ┌──────────┐                                   │
│  │上传v1.json│───►│ 验证完成 │                                   │
│  └──────────┘    └──────────┘                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Phase 1: 环境准备

#### Step 1.1: SSH 登录 Droplet

```bash
# 登录 Droplet
ssh readmigo@mcloud88.com

# 使用 screen 保持会话
screen -S v1-staging
```

#### Step 1.2: 更新代码

```bash
cd ~/projects/readmigo
git fetch origin
git checkout main
git pull
pnpm install
```

#### Step 1.3: 验证环境配置

```bash
# 检查环境变量文件
cat ~/scripts/config/.env.staging

# 必须包含:
# - STAGING_DATABASE_URL
# - STAGING_R2_BUCKET
# - DEBUG_DATABASE_URL
# - DEBUG_R2_BUCKET
# - R2_ENDPOINT
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
```

#### Step 1.4: 数据库迁移

```bash
# 加载 Staging 环境变量
export $(cat ~/scripts/config/.env.staging | xargs)

# 切换到 database 包
cd ~/projects/readmigo/packages/database

# 执行迁移
pnpm prisma migrate deploy

# 验证 schema
pnpm prisma db pull --print
```

#### Step 1.5: 系统配置初始化

> ⚠️ 仅限 Feature Flags 等系统配置，禁止业务数据

```bash
# 初始化系统配置 (仅限 feature_flags, medals 等)
pnpm prisma db seed

# 验证初始化结果
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM feature_flags;"
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM medals;"
```

### 3.3 Phase 2: 数据同步

#### Step 2.1: 同步作者 (100 位)

```bash
cd ~/projects/readmigo/scripts/book-ingestion

# 同步作者
npx tsx sync-to-staging.ts authors

# 预计时间: 5-10 分钟
# 输出示例:
# [INFO] 开始同步作者...
# [INFO] 书单作者数: 100
# [INFO] Debug 中找到: 98
# [WARN] 缺失: 2 (详见 /var/log/readmigo/staging-sync/missing-authors.log)
# [INFO] 同步完成: 98/100
```

#### Step 2.2: 同步电子书 (300 本)

```bash
# 同步电子书 (含章节)
npx tsx sync-to-staging.ts ebooks

# 预计时间: 30-45 分钟
# 输出示例:
# [INFO] 开始同步电子书...
# [INFO] 书单电子书数: 300
# [INFO] Debug 中找到: 285
# [WARN] 缺失: 15 (详见 /var/log/readmigo/staging-sync/missing-ebooks.log)
# [INFO] 同步电子书记录: 285
# [INFO] 同步章节记录: 4,500
# [INFO] 同步完成: 285/300
```

#### Step 2.3: 同步 R2 文件

```bash
# 同步 EPUB 和封面文件
npx tsx sync-to-staging.ts files

# 预计时间: 20-30 分钟
# 输出示例:
# [INFO] 开始同步 R2 文件...
# [INFO] EPUB 文件: 285
# [INFO] 封面文件: 285 (原图) + 285 (缩略图)
# [INFO] 作者头像: 98
# [INFO] 总传输: ~200MB
# [INFO] 同步完成
```

### 3.4 Phase 3: 验证部署

#### Step 3.1: 数据验证

```bash
# 连接 Staging 数据库
psql $STAGING_DATABASE_URL

-- 验证电子书数量
SELECT COUNT(*) as ebook_count FROM books;

-- 验证作者数量
SELECT COUNT(*) as author_count FROM authors;

-- 验证章节数量
SELECT COUNT(*) as chapter_count FROM chapters;

-- 验证书籍-作者关联
SELECT
  b.title,
  a.name as author_name
FROM books b
JOIN book_authors ba ON b.id = ba.book_id
JOIN authors a ON a.id = ba.author_id
LIMIT 10;
```

#### Step 3.2: API 端点测试

```bash
# 健康检查
curl https://readmigo-staging.fly.dev/health

# 书籍列表
curl https://readmigo-staging.fly.dev/api/v1/books?limit=5 | jq

# 书籍详情
curl https://readmigo-staging.fly.dev/api/v1/books/{book-id} | jq

# 作者列表
curl https://readmigo-staging.fly.dev/api/v1/authors?limit=5 | jq

# 版本检查 (应该返回 V1.0 配置)
curl https://readmigo-staging.fly.dev/api/v1/version/check | jq
```

#### Step 3.3: R2 文件验证

```bash
# 检查 EPUB 文件可访问性 (抽样)
curl -I https://staging-cdn.readmigo.app/epubs/{book-id}.epub

# 检查封面图可访问性 (抽样)
curl -I https://staging-cdn.readmigo.app/covers/books/{book-id}.jpg
```

#### Step 3.4: iOS TestFlight 测试

```
□ 安装 TestFlight 最新 build
□ 启动应用，验证书库页面加载
□ 随机选择 3 本书打开阅读
□ 测试高亮功能
□ 测试 AI 查词
□ 验证有声书 Tab 已隐藏
□ 测试登录流程
```

### 3.5 Phase 4: Manifest 发布

#### Step 4.1: 创建 V1 Manifest

```bash
# 创建 manifest 文件
cat > /tmp/v1.json << 'EOF'
{
  "majorVersion": 1,
  "minVersionRequired": "1.0.0",
  "latestVersion": "1.0.0",
  "content": {
    "ebooks": { "count": 300, "enabled": true },
    "authors": { "count": 100, "enabled": true },
    "audiobooks": { "count": 0, "enabled": false }
  },
  "features": {
    "audiobooks": false,
    "smartReading": false,
    "contentImport": false,
    "community": false
  },
  "platforms": {
    "ios": {
      "minVersion": "1.0.0",
      "storeUrl": "https://apps.apple.com/app/readmigo/id..."
    }
  },
  "updatedAt": "2025-01-XX"
}
EOF
```

#### Step 4.2: 上传 Manifest 到 R2

```bash
# 使用 rclone 或 aws cli 上传
aws s3 cp /tmp/v1.json s3://readmigo-staging/manifests/v1.json \
  --endpoint-url $R2_ENDPOINT
```

#### Step 4.3: 验证 Manifest

```bash
curl https://staging-cdn.readmigo.app/manifests/v1.json | jq
```

---

## 四、验收标准

### 4.1 数据验收

| 检查项 | 期望值 | 允许偏差 | 验证方式 |
|--------|--------|----------|----------|
| 电子书数量 | 300 | ≥285 (95%) | SQL COUNT |
| 作者数量 | 100 | ≥95 (95%) | SQL COUNT |
| 章节数量 | ~5,000 | - | SQL COUNT |
| EPUB 文件 | 与电子书数一致 | 100% | R2 LIST |
| 封面图 | 与电子书数一致 | 100% | R2 LIST |

### 4.2 功能验收

| 检查项 | 验证方式 | 通过标准 |
|--------|----------|----------|
| 书籍列表 API | curl 测试 | 返回 200 + 数据 |
| 书籍详情 API | curl 测试 | 返回完整信息 |
| EPUB 下载 | curl 测试 | 返回 200 |
| iOS 书库加载 | TestFlight | 正常显示 |
| iOS 阅读器 | TestFlight | 可正常阅读 |
| 有声书 Tab | TestFlight | 不可见 |

### 4.3 缺失项处理

```
┌─────────────────────────────────────────────────────────────────┐
│                      缺失项处理流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  如果同步后存在缺失项 (< 100% 完成率):                           │
│                                                                   │
│  1. 检查缺失日志                                                 │
│     cat /var/log/readmigo/staging-sync/missing-ebooks.log       │
│     cat /var/log/readmigo/staging-sync/missing-authors.log      │
│                                                                   │
│  2. 确认缺失原因                                                 │
│     □ Debug 环境未导入 → 等待下次导入                            │
│     □ 书名匹配问题 → 手动修正书单                                │
│     □ 数据损坏 → 重新导入                                        │
│                                                                   │
│  3. 决策                                                         │
│     • 缺失率 < 5%: 继续发布，后续补充                            │
│     • 缺失率 5-10%: 评估影响，决定是否延期                       │
│     • 缺失率 > 10%: 暂停发布，先解决数据问题                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 五、风险与回滚

### 5.1 风险识别

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Debug 数据不完整 | 同步失败 | 中 | 先验证源数据 |
| R2 传输失败 | 文件缺失 | 低 | 支持重试 |
| DB 迁移失败 | 无法启动 | 低 | 备份后迁移 |
| API 部署失败 | 服务不可用 | 低 | Fly.io 回滚 |

### 5.2 回滚方案

```bash
# 如果需要回滚 Staging 环境

# 1. 清空 Staging 数据库
psql $STAGING_DATABASE_URL -c "TRUNCATE books, chapters, authors, book_authors CASCADE;"

# 2. 清空 R2 Staging bucket
aws s3 rm s3://readmigo-staging/ --recursive --endpoint-url $R2_ENDPOINT

# 3. 重新部署 Fly.io (如需)
cd ~/projects/readmigo/apps/server
fly deploy --app readmigo-staging
```

---

## 六、时间估算

| 阶段 | 任务 | 预计时间 | 累计 |
|------|------|----------|------|
| Phase 1 | 环境准备 | 15 分钟 | 15 分钟 |
| Phase 2.1 | 同步作者 | 10 分钟 | 25 分钟 |
| Phase 2.2 | 同步电子书 | 40 分钟 | 65 分钟 |
| Phase 2.3 | 同步 R2 文件 | 30 分钟 | 95 分钟 |
| Phase 3 | 验证部署 | 30 分钟 | 125 分钟 |
| Phase 4 | Manifest 发布 | 10 分钟 | 135 分钟 |
| **总计** | | **~2.5 小时** | |

---

## 七、执行命令快速参考

```bash
# ============================================================
# V1.0 Staging 实施 - 快速命令参考
# ============================================================

# 0. SSH 登录
ssh readmigo@mcloud88.com
screen -S v1-staging

# 1. 更新代码
cd ~/projects/readmigo && git pull && pnpm install

# 2. 加载环境变量
export $(cat ~/scripts/config/.env.staging | xargs)

# 3. 数据库迁移 + 系统配置初始化 (仅限 feature_flags 等，禁止业务数据)
cd packages/database && pnpm prisma migrate deploy && pnpm prisma db seed

# 4. 同步数据
cd ~/projects/readmigo/scripts/book-ingestion
npx tsx sync-to-staging.ts authors
npx tsx sync-to-staging.ts ebooks
npx tsx sync-to-staging.ts files

# 5. 验证
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM books;"
curl https://readmigo-staging.fly.dev/api/v1/books?limit=5 | jq

# 6. 上传 Manifest
aws s3 cp /tmp/v1.json s3://readmigo-staging/manifests/v1.json --endpoint-url $R2_ENDPOINT
```

---

## 八、后续步骤 (V1.1+)

```
V1.0 发布后的迭代计划:

V1.1.0 - Reader+ (阅读器增强)
├── 执行相同的 Staging 同步流程
├── 无需新增数据
└── 更新客户端后发布 TestFlight

V1.2.0 - AI (AI功能优化)
├── 同上
└── 更新客户端后发布 TestFlight

...

V2.0.0 - Audio (有声书)
├── 需要同步有声书数据 (150本)
├── 需要上传音频元数据
├── 更新 Manifest v2.json
└── 发布 iOS + Android 客户端
```

---

## 九、相关文档

| 文档 | 说明 |
|------|------|
| [complete-version-roadmap.md](./complete-version-roadmap.md) | 完整版本路线图 |
| [staging-phase1-booklist.md](../content/staging-phase1-booklist.md) | Phase 1 详细书单 |
| [staging-data-population-plan.md](../backend/staging-data-population-plan.md) | 数据填充方案 |
| [r2-versioning-strategy.md](./r2-versioning-strategy.md) | R2 版本策略 |

---

*文档版本: 1.0*
*创建日期: 2025-12-31*
*状态: 待执行*
