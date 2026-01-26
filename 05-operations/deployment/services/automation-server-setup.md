# Readmigo 自动化任务服务器配置指南

> Digital Ocean Droplet 配置文档 - 专用于长时间运行的批处理任务和定时任务

**文档版本**: v1.0
**创建日期**: 2025-12-26
**适用环境**: Debug / Staging / Production

---

## 目录

1. [背景与评估](#1-背景与评估)
2. [方案选择](#2-方案选择)
3. [Digital Ocean Droplet 配置](#3-digital-ocean-droplet-配置)
4. [Standard Ebooks 导入任务配置](#4-standard-ebooks-导入任务配置)
5. [监控与维护](#5-监控与维护)
6. [故障排查](#6-故障排查)
7. [附录](#7-附录)
8. [实施记录](#8-实施记录-2025-12-26)

---

## 1. 背景与评估

### 1.1 需求分析

**当前问题**:
- Debug 环境缺少 Standard Ebooks 的书籍数据
- 需要全量抓取 Standard Ebooks（约 1000+ 本书）
- 后续 Staging 和 Production 环境也需要相同操作
- 未来会有更多类似的长时间运行批处理任务

**任务特点**:
- ⏱️ **耗时长**: 每本书间隔 1.5 秒 + 下载解析时间 ≈ 25-60 分钟
- 💾 **资源密集**: 下载 EPUB、解析内容、难度分析、上传 R2、创建章节
- 🔄 **可中断恢复**: 支持 `skipExisting` 机制，断点续传
- 🌐 **稳定网络**: 需要下载大量 EPUB 文件

### 1.2 现有基础设施盘点

| 基础设施 | 用途 | 资源配置 | 运行时限制 | 月度成本 | 适用性 |
|---------|------|---------|-----------|---------|--------|
| **GitHub Actions** | CI/CD、定时任务 | 2-core CPU, 7GB RAM | **6小时超时** | 免费 | ❌ 不适合 |
| **Fly.io API** | 生产环境后端 | 1 shared CPU, 512MB | 无限制 | ~$10-20 | ⚠️ 资源紧张 |
| **Fly.io Workers** | BullMQ 后台任务 | 1 shared CPU, 512MB | 无限制 | ~$5-10 | ⚠️ 业务冲突 |
| **Fly.io Staging** | 预发布环境 | 1 shared CPU, 1GB | 无限制 | ~$10 | ⚠️ 不建议 |
| **Digital Ocean Droplet** | 专用任务服务器 | 8GB/4vCPU | 无限制 | $48 | ✅ **推荐** |

### 1.3 方案对比分析

#### 方案 A: GitHub Actions ❌ 不推荐

**优点**:
- ✓ 免费（public repo）
- ✓ 已有定时任务基础设施
- ✓ 容易配置 cron
- ✓ 与代码库紧密集成

**缺点**:
- ✗ **6 小时超时限制**（全量抓取可能超时）
- ✗ 并发任务数量限制
- ✗ 不适合长时间运行的任务
- ✗ 调试不便

**适用场景**: 短时间任务（< 1 小时），如现有的 `db-sync`

---

#### 方案 B: Fly.io Workers 扩容 ⚠️ 有限推荐

**优点**:
- ✓ 已部署，无需额外配置
- ✓ 与现有架构统一
- ✓ 可访问生产 Redis 和数据库

**缺点**:
- ✗ 资源有限（512MB RAM）
- ✗ 与业务任务共享资源可能冲突
- ✗ 需要修改代码添加导入队列
- ✗ Fly.io 按使用量计费，成本可能更高

**适用场景**: 短期一次性任务，与现有业务逻辑紧密相关的任务

---

#### 方案 C: Digital Ocean Droplet ✅ **强烈推荐**

**优点**:
- ✓ **专用资源**，不影响生产环境
- ✓ **可长时间运行**（无超时限制）
- ✓ **配置灵活**（可选 2GB/4GB/8GB 内存）
- ✓ **成本可控**（$6-12/月，固定价格）
- ✓ 适合批处理和定时任务
- ✓ 可运行多个环境的导入任务
- ✓ 易于监控和调试
- ✓ 后续可扩展为专门的 Job Server

**缺点**:
- ✗ 需要初始配置（约 1 小时）
- ✗ 需要维护服务器安全更新

**适用场景**:
- ✓ 长时间运行的批处理任务
- ✓ 定时自动化任务
- ✓ 多环境数据同步
- ✓ 未来的其他自动化任务

---

## 2. 方案选择

### 2.1 推荐架构

```
┌─────────────────────────────────────────────────────┐
│     Digital Ocean Droplet (Job Server)              │
│  Ubuntu 24.04 LTS • 8GB RAM • 4 vCPU • 50GB SSD    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Cron Jobs (定时任务)                         │  │
│  │  ├─ 0 2 * * 0  → import-standard-ebooks.sh   │  │
│  │  ├─ 0 3 * * 1  → import-gutenberg.sh         │  │
│  │  ├─ 0 4 * * *  → sync-data-to-staging.sh     │  │
│  │  └─ 0 5 * * 6  → enrich-author-data.sh       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services                                     │  │
│  │  ├─ Node.js 20 (运行导入脚本)                 │  │
│  │  ├─ PostgreSQL Client (连接远程数据库)       │  │
│  │  ├─ PM2 (进程管理与监控)                      │  │
│  │  └─ Logrotate (日志管理)                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Logs & Monitoring                            │  │
│  │  ├─ /var/log/readmigo/imports/               │  │
│  │  ├─ /var/log/readmigo/cron/                  │  │
│  │  └─ PM2 Dashboard (可选)                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
           │                    │                  │
           │                    │                  │
           ▼                    ▼                  ▼
    ┌──────────┐        ┌──────────┐      ┌──────────┐
    │  Neon    │        │ Fly.io   │      │ Cloudflare│
    │   DB     │        │  Redis   │      │    R2     │
    │ (Debug/  │        │ (Queue)  │      │ (Storage) │
    │ Staging/ │        │          │      │           │
    │  Prod)   │        │          │      │           │
    └──────────┘        └──────────┘      └──────────┘
```

### 2.2 成本对比（月度）

| 方案 | 基础成本 | 资源限制 | 扩展性 | 维护成本 | 总评分 |
|------|---------|---------|--------|---------|--------|
| GitHub Actions | $0 | 6小时超时 | ⭐⭐ | 低 | 5/10 |
| Fly.io Workers | $5-15 | 按使用量 | ⭐⭐⭐ | 低 | 6/10 |
| **DO Droplet** | **$48** | **无限制** | **⭐⭐⭐⭐⭐** | **中** | **9/10** |

### 2.3 长期任务规划

使用 **Digital Ocean Droplet** 后，可以逐步迁移以下任务：

```yaml
近期（1个月内）:
  ✓ Standard Ebooks 全量导入（debug/staging/prod）
  ✓ Gutenberg 书籍导入
  ✓ LibriVox 有声书导入
  ✓ 数据库定时同步任务

中期（3个月内）:
  ✓ 书籍元数据 enrichment 批处理
  ✓ 作者数据批量生成
  ✓ CEFR 难度评估批处理
  ✓ 封面图片优化和 CDN 同步

长期（6个月+）:
  ✓ 推荐系统数据预处理
  ✓ 年度报告数据生成
  ✓ 数据备份和归档
  ✓ 性能测试和压力测试
```

---

## 3. Digital Ocean Droplet 配置

### 3.1 创建 Droplet

#### 步骤 1: 登录 Digital Ocean

访问: https://cloud.digitalocean.com/

#### 步骤 2: 创建 Droplet

1. 点击 **Create** → **Droplets**

2. **选择配置**:
   ```
   Distribution: Ubuntu 24.04 LTS (推荐)
   Plan: Basic
   CPU Options: Regular
   Size:
     - $48/month: 8 GB RAM / 4 vCPU / 50 GB SSD (当前配置)
     - $96/month: 16 GB RAM / 8 vCPU / 80 GB SSD (未来扩容选项)
   ```

3. **选择数据中心区域**:
   ```
   推荐: Singapore (新加坡)
   原因:
     - 距离中国近，延迟低
     - 与 Fly.io (nrt 东京) 区域接近
     - 稳定性好
   ```

4. **SSH 密钥配置**:
   ```bash
   # 本地生成 SSH 密钥（如果没有）
   ssh-keygen -t ed25519 -C "readmigo-job-server" -f ~/.ssh/readmigo_job_server

   # 复制公钥
   cat ~/.ssh/readmigo_job_server.pub
   ```

   在 Digital Ocean 界面:
   - 点击 **New SSH Key**
   - 粘贴公钥内容
   - 命名: `readmigo-job-server`

5. **Droplet 设置**:
   ```
   Hostname: readmigo-job-server
   Tags: readmigo, production, job-server
   ```

6. 点击 **Create Droplet** 等待创建完成（约 1 分钟）

#### 步骤 3: 记录 IP 地址

创建完成后，记录 Droplet 的公网 IP 地址:
```
示例: 159.89.XXX.XXX
```

---

### 3.2 基础环境配置

#### 步骤 1: SSH 连接到服务器

```bash
# 添加 SSH 密钥到 ssh-agent
ssh-add ~/.ssh/readmigo_job_server

# 连接到服务器（替换为你的 IP）
ssh root@159.89.XXX.XXX

# 如果遇到 host key verification 提示，输入 yes
```

#### 步骤 2: 系统更新

```bash
# 更新软件包列表
apt update

# 升级所有软件包
apt upgrade -y

# 安装基础工具
apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  build-essential \
  software-properties-common \
  ufw \
  fail2ban \
  unattended-upgrades
```

#### 步骤 3: 配置防火墙

```bash
# 允许 SSH 连接
ufw allow 22/tcp

# 启用防火墙
ufw --force enable

# 查看防火墙状态
ufw status
```

**预期输出**:
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
22/tcp (v6)                ALLOW       Anywhere (v6)
```

#### 步骤 4: 配置 Fail2ban（防止暴力破解）

```bash
# 启动 Fail2ban 服务
systemctl enable fail2ban
systemctl start fail2ban

# 查看状态
systemctl status fail2ban
```

#### 步骤 5: 配置自动安全更新

```bash
# 编辑配置文件
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# 启用自动更新
dpkg-reconfigure -plow unattended-upgrades
# 选择 Yes
```

---

### 3.3 安装开发环境

#### 步骤 1: 安装 Node.js 20 LTS

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 安装 Node.js
apt install -y nodejs

# 验证安装
node --version  # 应该输出 v20.x.x
npm --version   # 应该输出 10.x.x
```

#### 步骤 2: 安装 pnpm

```bash
# 安装 pnpm
npm install -g pnpm@9

# 验证安装
pnpm --version  # 应该输出 9.x.x
```

#### 步骤 3: 安装 PM2（进程管理器）

```bash
# 安装 PM2
npm install -g pm2

# 设置开机启动
pm2 startup systemd
# 执行输出的命令

# 验证安装
pm2 --version
```

#### 步骤 4: 安装 PostgreSQL 客户端（用于连接远程数据库）

```bash
# 安装 PostgreSQL 客户端
apt install -y postgresql-client

# 验证安装
psql --version  # 应该输出 PostgreSQL 16.x
```

---

### 3.4 创建专用用户（安全最佳实践）

```bash
# 创建 readmigo 用户
useradd -m -s /bin/bash readmigo

# 设置密码（可选，使用 SSH 密钥更安全）
# passwd readmigo

# 添加到 sudo 组（可选）
usermod -aG sudo readmigo

# 配置 SSH 密钥
mkdir -p /home/readmigo/.ssh
cp /root/.ssh/authorized_keys /home/readmigo/.ssh/
chown -R readmigo:readmigo /home/readmigo/.ssh
chmod 700 /home/readmigo/.ssh
chmod 600 /home/readmigo/.ssh/authorized_keys

# 切换到 readmigo 用户
su - readmigo
```

---

### 3.5 部署 Readmigo 项目

#### 步骤 1: 克隆代码仓库

```bash
# 确保当前是 readmigo 用户
whoami  # 应该输出 readmigo

# 创建项目目录
mkdir -p /home/readmigo/projects
cd /home/readmigo/projects

# 克隆仓库
git clone https://github.com/YOUR_USERNAME/readmigo.git
cd readmigo

# 检查分支
git branch -a
git checkout main
```

#### 步骤 2: 安装依赖

```bash
# 安装项目依赖
pnpm install --frozen-lockfile

# 生成 Prisma Client
pnpm db:generate
```

**预期输出**:
```
✔ Installation complete
✔ Generated Prisma Client
```

#### 步骤 3: 配置环境变量

```bash
# 创建环境变量目录
mkdir -p /home/readmigo/projects/readmigo/env

# 创建 Debug 环境配置
cat > /home/readmigo/projects/readmigo/env/.env.debug << 'EOF'
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/readmigo_debug"

# Redis (Fly.io)
REDIS_URL="redis://HOST:PORT"

# Cloudflare R2
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="readmigo-debug"
R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"

# AI Services (可选，如果需要 enrichment)
DEEPSEEK_API_KEY="your_deepseek_key"
OPENAI_API_KEY="your_openai_key"
ANTHROPIC_API_KEY="your_anthropic_key"

# Environment
NODE_ENV="production"
EOF

# 设置权限
chmod 600 /home/readmigo/projects/readmigo/env/.env.debug
```

**📝 注意**: 需要从你的项目获取真实的环境变量值

#### 步骤 4: 测试数据库连接

```bash
# 使用 psql 测试连接
psql "$DATABASE_URL" -c "SELECT version();"
```

**预期输出**: 显示 PostgreSQL 版本信息

---

### 3.6 配置日志系统

#### 步骤 1: 创建日志目录

```bash
# 切换到 root 用户
exit  # 退出 readmigo 用户

# 创建日志目录
mkdir -p /var/log/readmigo/{imports,cron,errors}
chown -R readmigo:readmigo /var/log/readmigo
chmod 755 /var/log/readmigo
```

#### 步骤 2: 配置日志轮转

```bash
# 创建 logrotate 配置
cat > /etc/logrotate.d/readmigo << 'EOF'
/var/log/readmigo/*/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 readmigo readmigo
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF

# 测试配置
logrotate -d /etc/logrotate.d/readmigo
```

---

## 4. Standard Ebooks 导入任务配置

### 4.1 创建导入脚本

#### 步骤 1: 创建脚本目录

```bash
# 切换到 readmigo 用户
su - readmigo

# 创建脚本目录
mkdir -p /home/readmigo/scripts/jobs
cd /home/readmigo/scripts/jobs
```

#### 步骤 2: 创建 Standard Ebooks 导入脚本

```bash
cat > import-standard-ebooks-debug.sh << 'EOF'
#!/bin/bash
#
# Standard Ebooks 全量导入脚本 (Debug 环境)
# 用途: 从 Standard Ebooks 抓取所有书籍并导入到 Debug 数据库
# 定时任务: 每周日凌晨 2 点运行

set -e  # 遇到错误立即退出

# 配置
PROJECT_DIR="/home/readmigo/projects/readmigo"
ENV_FILE="$PROJECT_DIR/env/.env.debug"
LOG_DIR="/var/log/readmigo/imports"
LOG_FILE="$LOG_DIR/standard-ebooks-debug-$(date +%Y%m%d-%H%M%S).log"

# 创建日志文件
touch "$LOG_FILE"
echo "=== Standard Ebooks Import Started at $(date) ===" >> "$LOG_FILE"

# 切换到项目目录
cd "$PROJECT_DIR"

# 加载环境变量
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# 执行导入
echo "Starting import from Standard Ebooks..." >> "$LOG_FILE"
pnpm tsx scripts/book-ingestion/sources/standard-ebooks.ts \
  2>&1 | tee -a "$LOG_FILE"

# 检查退出状态
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "=== Import completed successfully at $(date) ===" >> "$LOG_FILE"
else
  echo "=== Import failed with exit code $EXIT_CODE at $(date) ===" >> "$LOG_FILE"
  # 可选: 发送告警通知
  # curl -X POST "YOUR_WEBHOOK_URL" -d "Standard Ebooks import failed"
fi

# 清理旧日志（保留最近 30 天）
find "$LOG_DIR" -name "standard-ebooks-debug-*.log" -mtime +30 -delete

exit $EXIT_CODE
EOF

# 设置执行权限
chmod +x import-standard-ebooks-debug.sh
```

#### 步骤 3: 创建测试导入脚本（少量数据）

```bash
cat > test-import-standard-ebooks.sh << 'EOF'
#!/bin/bash
#
# Standard Ebooks 测试导入脚本
# 用途: 仅导入 10 本书用于测试

set -e

PROJECT_DIR="/home/readmigo/projects/readmigo"
ENV_FILE="$PROJECT_DIR/env/.env.debug"
LOG_DIR="/var/log/readmigo/imports"
LOG_FILE="$LOG_DIR/test-import-$(date +%Y%m%d-%H%M%S).log"

touch "$LOG_FILE"
echo "=== Test Import Started at $(date) ===" >> "$LOG_FILE"

cd "$PROJECT_DIR"
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# 导入前 10 本书
echo "Importing first 10 books for testing..." >> "$LOG_FILE"
pnpm tsx scripts/book-ingestion/sources/standard-ebooks.ts 10 1 \
  2>&1 | tee -a "$LOG_FILE"

echo "=== Test Import Completed at $(date) ===" >> "$LOG_FILE"
EOF

chmod +x test-import-standard-ebooks.sh
```

### 4.2 手动测试运行

#### 步骤 1: 运行测试导入

```bash
# 切换到脚本目录
cd /home/readmigo/scripts/jobs

# 运行测试导入（10 本书）
./test-import-standard-ebooks.sh
```

**预期输出**:
```
=== Test Import Started at Thu Dec 26 02:00:00 UTC 2025 ===
Fetching catalog page 1...
Found 48 books on page 1

[1/10] Processing: jane-austen/pride-and-prejudice
    Title: Pride and Prejudice
    Author: Jane Austen
    Downloading EPUB...
    Parsing EPUB...
    Analyzing difficulty...
    Uploading EPUB to R2...
    Uploading cover to R2...
    Saving to database...
    Done: 61 chapters, difficulty 6/10

[2/10] Processing: ...
...

=== Test Import Completed at Thu Dec 26 02:15:23 UTC 2025 ===
```

#### 步骤 2: 验证导入结果

```bash
# 连接到数据库查询
export $(cat /home/readmigo/projects/readmigo/env/.env.debug | grep DATABASE_URL | xargs)

psql "$DATABASE_URL" -c "
  SELECT COUNT(*) as total_books,
         COUNT(DISTINCT author) as total_authors
  FROM books
  WHERE source = 'STANDARD_EBOOKS';
"
```

**预期输出**:
```
 total_books | total_authors
-------------+---------------
          10 |             8
```

#### 步骤 3: 查看日志

```bash
# 查看最新日志
ls -lht /var/log/readmigo/imports/ | head -5

# 查看日志内容
tail -50 /var/log/readmigo/imports/test-import-*.log
```

### 4.3 配置定时任务（Cron）

#### 步骤 1: 编辑 crontab

```bash
# 编辑 crontab
crontab -e
```

#### 步骤 2: 添加定时任务

在打开的编辑器中添加以下内容:

```bash
# Readmigo 自动化任务
# 环境变量
SHELL=/bin/bash
PATH=/home/readmigo/.nvm/versions/node/v20.18.0/bin:/usr/local/bin:/usr/bin:/bin

# Standard Ebooks 全量导入 - 每周日凌晨 2 点 (北京时间 10:00)
0 2 * * 0 /home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh >> /var/log/readmigo/cron/cron.log 2>&1

# Gutenberg 书籍导入 - 每周一凌晨 3 点 (预留，暂未启用)
# 0 3 * * 1 /home/readmigo/scripts/jobs/import-gutenberg.sh >> /var/log/readmigo/cron/cron.log 2>&1

# LibriVox 有声书导入 - 每周二凌晨 3 点 (预留，暂未启用)
# 0 3 * * 2 /home/readmigo/scripts/jobs/import-librivox.sh >> /var/log/readmigo/cron/cron.log 2>&1

# 清理旧日志 - 每天凌晨 4 点
0 4 * * * find /var/log/readmigo -name "*.log" -mtime +30 -delete

# 健康检查 - 每小时
0 * * * * curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/YOUR_CHECK_ID || echo "Health check failed"
```

保存并退出（vim: `:wq`）

#### 步骤 3: 验证 crontab

```bash
# 查看已配置的定时任务
crontab -l

# 检查 cron 服务状态
sudo systemctl status cron
```

#### 步骤 4: 创建 cron 日志目录

```bash
# 切换到 root
exit

# 创建 cron 日志目录
mkdir -p /var/log/readmigo/cron
chown readmigo:readmigo /var/log/readmigo/cron

# 切换回 readmigo 用户
su - readmigo
```

### 4.4 手动触发全量导入（首次运行）

#### 步骤 1: 使用 PM2 运行（推荐）

```bash
# 使用 PM2 在后台运行，可以断开 SSH 连接
cd /home/readmigo/scripts/jobs

pm2 start import-standard-ebooks-debug.sh \
  --name "standard-ebooks-import-debug" \
  --log /var/log/readmigo/imports/pm2-import.log

# 查看运行状态
pm2 status

# 查看实时日志
pm2 logs standard-ebooks-import-debug

# 查看日志（最近 100 行）
pm2 logs standard-ebooks-import-debug --lines 100
```

#### 步骤 2: 监控进度

```bash
# 方式 A: 查看 PM2 日志
pm2 logs standard-ebooks-import-debug --lines 50

# 方式 B: 查看文件日志
tail -f /var/log/readmigo/imports/standard-ebooks-debug-*.log

# 方式 C: 查看数据库进度
watch -n 30 "psql \"$DATABASE_URL\" -c 'SELECT COUNT(*) FROM books WHERE source = '\''STANDARD_EBOOKS'\'';'"
```

#### 步骤 3: 任务完成后

```bash
# 停止 PM2 任务
pm2 stop standard-ebooks-import-debug

# 删除 PM2 任务
pm2 delete standard-ebooks-import-debug

# 保存 PM2 配置
pm2 save
```

---

## 5. 监控与维护

### 5.1 PM2 监控配置

#### 配置 PM2 Ecosystem

```bash
cd /home/readmigo/projects/readmigo

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'standard-ebooks-import-debug',
      script: '/home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh',
      interpreter: '/bin/bash',
      cron_restart: '0 2 * * 0',  // 每周日凌晨 2 点
      autorestart: false,
      max_memory_restart: '1G',
      error_file: '/var/log/readmigo/imports/pm2-error.log',
      out_file: '/var/log/readmigo/imports/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
EOF
```

### 5.2 系统资源监控

#### 安装监控工具

```bash
# 切换到 root
exit

# 安装 htop（交互式进程查看器）
apt install -y htop

# 安装 iotop（磁盘 I/O 监控）
apt install -y iotop

# 安装 nethogs（网络流量监控）
apt install -y nethogs
```

#### 查看系统资源

```bash
# 实时查看进程
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看磁盘 I/O
iotop -o

# 查看网络流量
nethogs
```

### 5.3 日志管理

#### 查看日志脚本

```bash
cat > /home/readmigo/scripts/view-logs.sh << 'EOF'
#!/bin/bash
# 日志查看工具

echo "=== Readmigo 日志查看工具 ==="
echo ""
echo "1) 导入日志（最近 5 个文件）"
echo "2) Cron 日志"
echo "3) PM2 日志"
echo "4) 错误日志"
echo "5) 实时监控最新导入"
echo "q) 退出"
echo ""
read -p "请选择: " choice

case $choice in
  1)
    ls -lht /var/log/readmigo/imports/*.log | head -5
    read -p "查看哪个文件？(输入文件名): " filename
    tail -100 "/var/log/readmigo/imports/$filename"
    ;;
  2)
    tail -100 /var/log/readmigo/cron/cron.log
    ;;
  3)
    pm2 logs --lines 100
    ;;
  4)
    tail -100 /var/log/readmigo/errors/*.log
    ;;
  5)
    tail -f /var/log/readmigo/imports/standard-ebooks-debug-*.log
    ;;
  q)
    exit 0
    ;;
  *)
    echo "无效选择"
    ;;
esac
EOF

chmod +x /home/readmigo/scripts/view-logs.sh
```

### 5.4 健康检查

#### 配置 Healthchecks.io（可选）

```bash
# 注册 Healthchecks.io 账号
# https://healthchecks.io

# 创建健康检查脚本
cat > /home/readmigo/scripts/health-check.sh << 'EOF'
#!/bin/bash
# 健康检查脚本

HEALTHCHECK_URL="https://hc-ping.com/YOUR_CHECK_ID"

# 检查项目
check_database() {
  export $(cat /home/readmigo/projects/readmigo/env/.env.debug | grep DATABASE_URL | xargs)
  psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1
  return $?
}

check_disk_space() {
  USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ "$USAGE" -gt 80 ]; then
    return 1
  fi
  return 0
}

# 执行检查
if check_database && check_disk_space; then
  curl -fsS -m 10 --retry 5 "$HEALTHCHECK_URL" > /dev/null
  exit 0
else
  curl -fsS -m 10 --retry 5 "$HEALTHCHECK_URL/fail" > /dev/null
  exit 1
fi
EOF

chmod +x /home/readmigo/scripts/health-check.sh
```

### 5.5 告警通知（可选）

#### 配置 Slack Webhook

```bash
cat > /home/readmigo/scripts/notify-slack.sh << 'EOF'
#!/bin/bash
# Slack 通知脚本

SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
MESSAGE="$1"

curl -X POST "$SLACK_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"[Readmigo Job Server] $MESSAGE\"}"
EOF

chmod +x /home/readmigo/scripts/notify-slack.sh
```

在导入脚本中添加通知:

```bash
# 在 import-standard-ebooks-debug.sh 的错误处理部分添加
/home/readmigo/scripts/notify-slack.sh "❌ Standard Ebooks import failed with exit code $EXIT_CODE"

# 在成功完成部分添加
/home/readmigo/scripts/notify-slack.sh "✅ Standard Ebooks import completed successfully"
```

---

## 6. 故障排查

### 6.1 常见问题

#### 问题 1: SSH 连接失败

**症状**:
```
ssh: connect to host 159.89.XXX.XXX port 22: Connection refused
```

**解决方案**:
```bash
# 1. 检查 Droplet 是否运行
# 在 Digital Ocean 控制台查看 Droplet 状态

# 2. 检查防火墙规则
# 在服务器上（通过 Digital Ocean Console）:
sudo ufw status

# 3. 重启 SSH 服务
sudo systemctl restart ssh
```

---

#### 问题 2: 数据库连接失败

**症状**:
```
Error: P1001: Can't reach database server at 'xxx.neon.tech:5432'
```

**解决方案**:
```bash
# 1. 检查网络连接
ping your-db-host.neon.tech

# 2. 测试数据库连接
psql "$DATABASE_URL" -c "SELECT 1;"

# 3. 检查环境变量
echo $DATABASE_URL

# 4. 检查 Neon 数据库防火墙设置
# 确保 Droplet IP 地址在白名单中
```

---

#### 问题 3: R2 上传失败

**症状**:
```
Error: Failed to upload to R2: AccessDenied
```

**解决方案**:
```bash
# 1. 检查 R2 凭证
echo $R2_ACCESS_KEY_ID
echo $R2_SECRET_ACCESS_KEY
echo $R2_BUCKET_NAME

# 2. 测试 R2 连接（使用 AWS CLI）
apt install -y awscli
aws s3 ls --endpoint-url=$R2_ENDPOINT s3://$R2_BUCKET_NAME

# 3. 验证 R2 bucket 权限
# 在 Cloudflare Dashboard 检查 bucket 权限
```

---

#### 问题 4: 导入脚本运行缓慢

**诊断**:
```bash
# 1. 检查 CPU 使用率
htop

# 2. 检查网络速度
curl -o /dev/null https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/pride-and-prejudice.epub

# 3. 检查磁盘 I/O
iotop -o

# 4. 检查内存使用
free -h
```

**优化建议**:
```bash
# 如果资源不足，考虑升级 Droplet
# 当前配置: $48/month: 4 vCPU, 8GB RAM（性能优秀）
# $24/month: 2 vCPU, 4GB RAM（适合大规模导入）
```

---

#### 问题 5: Cron 任务未运行

**诊断**:
```bash
# 1. 检查 cron 服务
sudo systemctl status cron

# 2. 查看 cron 日志
grep CRON /var/log/syslog | tail -20

# 3. 验证 crontab
crontab -l

# 4. 手动运行脚本测试
/home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh
```

**常见原因**:
- PATH 环境变量未正确设置
- 脚本权限问题（需要 +x）
- 文件路径错误

---

### 6.2 日志分析

#### 查找错误日志

```bash
# 查找所有错误
grep -i error /var/log/readmigo/imports/*.log

# 查找失败的导入
grep -i "failed" /var/log/readmigo/imports/*.log

# 统计成功导入的书籍数量
grep "Done:" /var/log/readmigo/imports/standard-ebooks-*.log | wc -l

# 查找特定错误类型
grep -i "timeout\|connection refused\|access denied" /var/log/readmigo/imports/*.log
```

#### 分析导入进度

```bash
# 创建进度分析脚本
cat > /home/readmigo/scripts/analyze-progress.sh << 'EOF'
#!/bin/bash

LOG_FILE=$(ls -t /var/log/readmigo/imports/standard-ebooks-debug-*.log | head -1)

echo "=== 导入进度分析 ==="
echo "日志文件: $LOG_FILE"
echo ""

TOTAL=$(grep -c "Processing:" "$LOG_FILE" || echo "0")
SUCCESS=$(grep -c "Done:" "$LOG_FILE" || echo "0")
FAILED=$(grep -c "Error:" "$LOG_FILE" || echo "0")

echo "总计处理: $TOTAL"
echo "成功导入: $SUCCESS"
echo "失败: $FAILED"
echo ""

if [ "$TOTAL" -gt 0 ]; then
  PROGRESS=$(( SUCCESS * 100 / TOTAL ))
  echo "进度: $PROGRESS%"
fi

echo ""
echo "最近 5 条日志:"
tail -5 "$LOG_FILE"
EOF

chmod +x /home/readmigo/scripts/analyze-progress.sh
```

---

### 6.3 数据验证

#### 验证导入数据质量

```bash
# 创建数据验证脚本
cat > /home/readmigo/scripts/validate-data.sh << 'EOF'
#!/bin/bash

export $(cat /home/readmigo/projects/readmigo/env/.env.debug | grep DATABASE_URL | xargs)

echo "=== 数据质量验证 ==="
echo ""

# 1. 统计书籍数量
echo "📚 书籍统计:"
psql "$DATABASE_URL" -c "
  SELECT
    source,
    COUNT(*) as total,
    COUNT(DISTINCT author) as authors,
    SUM(chapter_count) as chapters
  FROM books
  GROUP BY source;
"

echo ""

# 2. 检查缺失数据
echo "⚠️ 缺失数据检查:"
psql "$DATABASE_URL" -c "
  SELECT
    'Missing cover' as issue,
    COUNT(*) as count
  FROM books
  WHERE cover_url IS NULL AND source = 'STANDARD_EBOOKS'
  UNION ALL
  SELECT
    'Missing description',
    COUNT(*)
  FROM books
  WHERE description IS NULL AND source = 'STANDARD_EBOOKS'
  UNION ALL
  SELECT
    'No chapters',
    COUNT(*)
  FROM books
  WHERE chapter_count = 0 AND source = 'STANDARD_EBOOKS';
"

echo ""

# 3. 检查重复数据
echo "🔍 重复数据检查:"
psql "$DATABASE_URL" -c "
  SELECT
    source_id,
    COUNT(*) as duplicates
  FROM books
  WHERE source = 'STANDARD_EBOOKS'
  GROUP BY source_id
  HAVING COUNT(*) > 1;
"

echo ""
echo "✅ 验证完成"
EOF

chmod +x /home/readmigo/scripts/validate-data.sh
```

---

## 7. 附录

### 7.1 快速命令参考

#### SSH 连接

```bash
# 连接到服务器
ssh readmigo@159.89.XXX.XXX

# 使用指定密钥
ssh -i ~/.ssh/readmigo_job_server readmigo@159.89.XXX.XXX
```

#### 项目管理

```bash
# 更新代码
cd /home/readmigo/projects/readmigo
git pull origin main
pnpm install

# 重新生成 Prisma Client
pnpm db:generate

# 查看项目状态
git status
git log --oneline -10
```

#### PM2 管理

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs

# 重启进程
pm2 restart <name>

# 停止进程
pm2 stop <name>

# 删除进程
pm2 delete <name>

# 保存配置
pm2 save

# 开机启动
pm2 startup
```

#### Cron 管理

```bash
# 编辑定时任务
crontab -e

# 查看定时任务
crontab -l

# 查看 cron 日志
grep CRON /var/log/syslog | tail -20
```

#### 日志查看

```bash
# 查看导入日志
tail -f /var/log/readmigo/imports/standard-ebooks-debug-*.log

# 查看最近的日志文件
ls -lht /var/log/readmigo/imports/ | head -10

# 搜索错误
grep -i error /var/log/readmigo/imports/*.log
```

#### 系统监控

```bash
# 查看 CPU 和内存
htop

# 查看磁盘使用
df -h

# 查看内存
free -h

# 查看网络连接
netstat -tunlp

# 查看进程
ps aux | grep node
```

---

### 7.2 环境变量清单

#### Debug 环境 (`.env.debug`)

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/readmigo_debug"

# Redis
REDIS_URL="redis://HOST:PORT"
REDIS_HOST="HOST"
REDIS_PORT="PORT"

# Cloudflare R2
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="readmigo-debug"
R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"

# AI Services (optional)
DEEPSEEK_API_KEY="your_deepseek_key"
OPENAI_API_KEY="your_openai_key"
ANTHROPIC_API_KEY="your_anthropic_key"

# Environment
NODE_ENV="production"
```

#### Staging 环境 (`.env.staging`)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/readmigo_staging"
R2_BUCKET_NAME="readmigo-staging"
# ... 其他配置同上
```

#### Production 环境 (`.env.production`)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/readmigo"
R2_BUCKET_NAME="readmigo"
# ... 其他配置同上
```

---

### 7.3 目录结构

```
/home/readmigo/
├── projects/
│   └── readmigo/                    # 项目代码
│       ├── apps/
│       ├── packages/
│       ├── scripts/
│       └── env/
│           ├── .env.debug           # Debug 环境变量
│           ├── .env.staging         # Staging 环境变量
│           └── .env.production      # Production 环境变量
├── scripts/
│   ├── jobs/                        # 自动化任务脚本
│   │   ├── import-standard-ebooks-debug.sh
│   │   ├── import-gutenberg.sh
│   │   └── import-librivox.sh
│   ├── view-logs.sh                 # 日志查看工具
│   ├── health-check.sh              # 健康检查
│   ├── notify-slack.sh              # Slack 通知
│   ├── analyze-progress.sh          # 进度分析
│   └── validate-data.sh             # 数据验证
└── .pm2/                            # PM2 配置

/var/log/readmigo/
├── imports/                         # 导入日志
│   ├── standard-ebooks-debug-20251226-020000.log
│   ├── pm2-import.log
│   └── pm2-error.log
├── cron/                            # Cron 日志
│   └── cron.log
└── errors/                          # 错误日志
```

---

### 7.4 定时任务时间表

| 任务 | 时间 (UTC) | 时间 (北京) | 频率 | 环境 | 状态 |
|------|-----------|------------|------|------|------|
| Standard Ebooks 导入 | 0 2 * * 0 | 10:00 周日 | 每周 | Debug | ✅ 启用 |
| Gutenberg 导入 | 0 3 * * 1 | 11:00 周一 | 每周 | Debug | 🔲 预留 |
| LibriVox 导入 | 0 3 * * 2 | 11:00 周二 | 每周 | Debug | 🔲 预留 |
| 数据同步 | 0 4 * * * | 12:00 每天 | 每天 | Staging | 🔲 预留 |
| 日志清理 | 0 4 * * * | 12:00 每天 | 每天 | 所有 | ✅ 启用 |
| 健康检查 | 0 * * * * | 每小时 | 每小时 | 所有 | 🔲 可选 |

---

### 7.5 安全检查清单

- [x] SSH 密钥认证已配置
- [x] 禁用 root 密码登录
- [x] UFW 防火墙已启用
- [x] Fail2ban 已配置
- [x] 自动安全更新已启用
- [ ] 定期备份（建议配置）
- [ ] SSL/TLS 证书（如需 HTTPS 访问）
- [ ] 监控告警（可选）

---

### 7.6 成本估算

#### 月度成本明细

| 项目 | 配置 | 月度成本 | 备注 |
|------|------|---------|------|
| **Digital Ocean Droplet** | 8GB RAM / 4 vCPU | **$48** | 当前配置 |
| **Digital Ocean Droplet** | 16GB RAM / 8 vCPU | **$96** | 高性能版 |
| **流量费用** | 前 5TB 免费 | **$0** | 通常不超出 |
| **Snapshot 备份** | 1 次/周 | **~$1** | 可选 |

**当前配置**: $48/月 Droplet（8GB/4vCPU）
**总计**: **约 $48-49/月**

#### 与其他方案对比

| 方案 | 月度成本 | 资源限制 | 维护成本 | 推荐度 |
|------|---------|---------|---------|--------|
| GitHub Actions | $0 | 6小时超时 | 低 | ⭐⭐ |
| Fly.io Workers | $5-20 | 按使用量 | 低 | ⭐⭐⭐ |
| **DO Droplet** | **$48** | **无限制** | **中** | **⭐⭐⭐⭐⭐** |

---

### 7.7 下一步计划

#### Phase 1: 完成 Debug 环境 (当前)
- [x] Droplet 创建和基础配置
- [x] Standard Ebooks 导入脚本
- [ ] 运行首次全量导入
- [ ] 数据验证

#### Phase 2: 扩展到 Staging 环境 (1-2 周)
- [ ] 配置 Staging 环境变量
- [ ] 创建 Staging 导入脚本
- [ ] 配置定时同步

#### Phase 3: 扩展到 Production 环境 (2-4 周)
- [ ] 配置 Production 环境变量
- [ ] 创建 Production 导入脚本
- [ ] 配置备份策略

#### Phase 4: 添加更多数据源 (持续)
- [ ] Gutenberg 书籍导入
- [ ] LibriVox 有声书导入
- [ ] 其他数据源

#### Phase 5: 监控和优化 (持续)
- [ ] 配置告警通知
- [ ] 性能优化
- [ ] 成本优化

---

## 总结

本文档提供了完整的 Digital Ocean Droplet 配置指南，用于运行 Readmigo 项目的自动化任务。

**关键要点**:
1. ✅ **专用服务器**: 不影响生产环境，资源独立
2. ✅ **性能充足**: $48/月, 8GB/4vCPU 配置支持并行任务
3. ✅ **无时间限制**: 适合长时间运行的批处理任务
4. ✅ **易于扩展**: 可承载更多自动化任务
5. ✅ **完善的监控**: 日志、告警、健康检查

**下一步**:
1. 按照 [3.1](#31-创建-droplet) 创建 Droplet
2. 按照 [3.2](#32-基础环境配置) 配置基础环境
3. 按照 [4.2](#42-手动测试运行) 运行测试导入
4. 按照 [4.4](#44-手动触发全量导入首次运行) 运行全量导入
5. 查看 [5. 监控与维护](#5-监控与维护) 配置监控

---

**文档维护**:
- 创建: 2025-12-26
- 更新: 2025-12-26
- 作者: Readmigo Team
- 版本: v1.1 (已完成 Debug 环境首次配置)

**相关文档**:
- [Book Import System](../../../04-development/pipeline/book-import-system.md)
- [CI/CD Configuration](../cicd-configuration-plan.md)
- [Environment Content Design](../environment-operations/environment-content-design.md)
- [Data Sync Workflow](../environment-operations/data-sync.md)

---

## 8. 实施记录 (2025-12-26)

### 8.1 实际配置过程

**配置完成时间**: 2025-12-26
**服务器**: mcloud88.com (Digital Ocean, Singapore)
**配置**: $48/月, 8GB RAM / 4 vCPU (已升级)
**首次测试**: ✅ 成功导入 10 本书

### 8.2 遇到的问题与解决方案

#### 问题 1: 网络连接超时

**现象**:
```
Fatal error: TypeError: fetch failed
[cause]: AggregateError [ETIMEDOUT]
```

**分析**:
- 初次运行时出现网络超时错误
- curl 测试可以正常访问 standardebooks.org
- Node.js fetch 在后续测试中可以正常工作

**解决方案**:
- 临时网络抖动，重试后成功
- 建议脚本中添加重试机制

---

#### 问题 2: 环境变量未正确传递

**现象**:
```
error: Environment variable not found: DATABASE_URL.
```

**原因分析**:
1. .env.debug 文件包含注释行（以 # 开头）
2. 使用 `env $(cat .env.debug | xargs)` 会将注释作为参数传递
3. 导致 env 命令错误：`env: '#': No such file or directory`

**解决方案**:
在脚本中过滤注释和空行：
```bash
export $(grep -v "^#" "$ENV_FILE" | grep -v "^$" | xargs)
```

---

#### 问题 3: zipfile 原生模块编译失败

**现象**:
```
error /home/readmigo/projects/readmigo/node_modules/.pnpm/zipfile@0.5.5/node_modules/zipfile: Command failed.
```

**分析**:
- zipfile 是可选依赖
- 不影响 Standard Ebooks 导入功能（不需要 zipfile）

**解决方案**:
- 忽略该错误
- 未来如需要可以安装编译工具链：`apt-get install build-essential python3-dev`

---

### 8.3 成功运行记录

**测试运行** (2025-12-26 04:26-04:28 UTC):
- 导入书籍: 10 本
- 运行时间: 约 2 分钟
- 成功率: 100% (10/10)
- 日志文件: `/var/log/readmigo/imports/test-import-20251226-042644.log`

**导入的书籍示例**:
1. The Lone Wolf - Louis Joseph Vance (41 chapters, difficulty 5/10)
2. The Law and the Lady - Wilkie Collins (93 chapters, difficulty 6/10)
3. Futility - William Gerhardie (45 chapters, difficulty 7/10)
4. The Powerhouse - John Buchan (16 chapters, difficulty 5/10)
5. Payment Deferred - C. S. Forester (20 chapters, difficulty 4/10)
...以及其他 5 本书

**验证结果**:
- ✅ 所有书籍成功保存到 Neon 数据库
- ✅ EPUB 文件成功上传到 Cloudflare R2
- ✅ 封面和缩略图成功上传到 R2
- ✅ 章节内容正确解析和保存
- ✅ 难度分析正常运行

---

### 8.4 关键配置文件

#### 环境变量 (.env.debug)
位置: `/home/readmigo/projects/readmigo/.env.debug`
```bash
DATABASE_URL="postgresql://neondb_owner:***@ep-small-queen-a1du4xmc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
R2_BUCKET_NAME="readmigo-debug"
R2_ENDPOINT="https://cbda5dcfa2fa6852a5d58673de8cd1e8.r2.cloudflarestorage.com"
# ... 其他配置
```

#### Cron 定时任务
```bash
# 每周日 00:00 UTC (周一 08:00 SGT)
0 0 * * 0 /home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh
```

#### 邮件通知配置
- SMTP: smtp.163.com:465 (163邮箱)
- 收件人: logan676@163.com
- 状态: **已禁用** - Digital Ocean 封禁所有 SMTP 端口（25/465/587）
- 替代方案: 查看日志文件监控任务状态
- 监控脚本: `~/scripts/utils/check-imports.sh`

---

### 8.5 运维建议

1. **日志管理**:
   - 定期清理 `/var/log/readmigo/imports/` 中的旧日志
   - 建议保留最近 30 天的日志
   ```bash
   find /var/log/readmigo/imports/ -name "*.log" -mtime +30 -delete
   ```

2. **监控检查**:
   - 检查 cron 任务执行: `grep CRON /var/log/syslog | grep readmigo`
   - 查看最新日志: `ls -lt /var/log/readmigo/imports/ | head -5`
   - 检查数据库书籍数量: 通过 Dashboard 查看

3. **手动触发导入**:
   ```bash
   # SSH 到服务器
   ssh readmigo@mcloud88.com

   # 检查导入状态
   bash ~/scripts/utils/check-imports.sh

   # 测试导入 (10 本书)
   bash ~/scripts/jobs/test-import-standard-ebooks.sh

   # 完整导入 (所有书籍)
   bash ~/scripts/jobs/import-standard-ebooks-debug.sh

   # 实时监控导入进度
   tail -f /var/log/readmigo/imports/*.log
   ```

4. **更新代码**:
   ```bash
   ssh readmigo@mcloud88.com
   cd ~/projects/readmigo
   git pull
   pnpm install
   pnpm --filter @readmigo/database generate
   ```

---

### 8.6 邮件通知问题与解决方案

**问题**: Digital Ocean 默认封禁所有 SMTP 端口（25/465/587）以防止垃圾邮件

**尝试过的方案**:
- ✗ ssmtp + 163邮箱: Network unreachable（端口被封）
- ✗ msmtp + 163邮箱: Network unreachable（端口被封）
- ✗ SendGrid: 注册失败

**当前方案**: 暂时禁用邮件通知，使用日志文件监控
- 监控脚本: `bash ~/scripts/utils/check-imports.sh`
- 查看日志: `ls -lt /var/log/readmigo/imports/`
- 实时监控: `tail -f /var/log/readmigo/imports/*.log`

**未来解决方案**:
1. 提交 Digital Ocean 工单请求解除 SMTP 端口限制（推荐）
2. 使用 Resend.com 等第三方邮件 API 服务

---

### 8.7 下一步计划

- [x] 配置 Digital Ocean Droplet 并完成首次测试
- [x] 测试导入成功（10本书）
- [x] 配置 Cron 定时任务
- [ ] 等待首次定时任务执行（下周日 00:00 UTC）
- [ ] （可选）提交工单解除 SMTP 端口限制
- [ ] 为 Staging 环境配置类似的导入任务
- [ ] 为 Production 环境配置类似的导入任务
- [ ] 添加其他书源的定时导入（Gutenberg 等）

---

如有问题或建议，请联系项目维护者。
