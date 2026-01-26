# Readmigo Job Server 使用指南

> Digital Ocean Droplet 快速使用文档 - 专用于运行自动化任务

**文档版本**: v1.1
**更新日期**: 2026-01-06
**目标用户**: 开发者、运维人员

---

## 📌 服务器信息

### 基本信息
```
服务器名称:  Readmigo Job Server
主机名:      mcloud88.com
IP 地址:     159.65.143.131
地区:        新加坡 (Singapore)
配置:        8GB RAM, 4 vCPU, 50GB SSD
费用:        $48/月
用途:        自动化任务、定时导入、批处理
```

### 账户信息
```
管理员账户:  root
工作账户:    readmigo (推荐使用)
SSH 端口:    22
认证方式:    SSH 密钥
```

### 环境信息
```
操作系统:    Ubuntu 24.04 LTS
Node.js:     20.x
包管理器:    pnpm 9.x
进程管理:    PM2
```

### 资源配额

| 资源 | 配额 | 计费说明 |
|------|------|----------|
| 带宽（出站） | 5 TB/月 | 仅计出站流量，超出 $0.01/GB |
| 带宽（入站） | 无限制 | 免费 |
| 磁盘空间 | 50 GB | 固定配额 |
| 内存 | 8 GB | 固定配额 |
| vCPU | 4 核 | 固定配额 |
| 月费用 | $48 | 固定费用 |

> **注意**: DigitalOcean Monitoring API 采样精度较低，建议通过服务器本地统计或控制面板查看准确流量数据。

### 监控工具

| 监控方式 | 用途 | 访问方式 |
|----------|------|----------|
| DigitalOcean 控制面板 | 查看 CPU/内存/带宽图表 | https://cloud.digitalocean.com → Droplets → Graphs |
| 服务器监控脚本 | 本地实时查看系统状态 | `bash ~/scripts/utils/server-monitor.sh` |
| PM2 监控 | 查看 Node.js 进程状态 | `pm2 monit` 或 `pm2 list` |

### 运行中的服务

**核心服务**:
- ✅ **SSH** (端口 22) - 远程登录服务
- ✅ **Cron** - 定时任务服务（负责每周自动导入）
- ✅ **Nginx** (端口 80) - Web 服务器

**代理服务** (已存在，请勿修改):
- ⚠️ **x-ui** (端口 2053, 2096) - Xray 管理面板
- ⚠️ **Xray** (端口 443) - 代理服务核心
- 🔒 这些服务与 Readmigo 任务无关，是服务器的其他用途

**监控服务**:
- ℹ️ **DigitalOcean Agent** - DO 官方监控
- ℹ️ **rsyslog** - 系统日志

⚠️ **重要提醒**:
- 服务器同时运行 VPN/代理服务，请勿修改相关配置
- Readmigo 任务使用 `readmigo` 用户，与其他服务隔离
- 仅操作 `/home/readmigo/` 目录下的文件

---

## 🔌 连接到服务器

### 方法 1: 使用域名（推荐）
```bash
ssh readmigo@mcloud88.com
```

### 方法 2: 使用 IP 地址
```bash
ssh readmigo@159.65.143.131
```

### 方法 3: Root 用户登录（管理任务）
```bash
ssh root@mcloud88.com
```

### 首次连接
如果首次连接，系统会要求确认主机密钥：
```
The authenticity of host 'mcloud88.com (159.65.143.131)' can't be established.
ED25519 key fingerprint is SHA256:xxxx...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```
输入 `yes` 并回车。

---

## 📂 项目结构

```
/home/readmigo/
├── projects/
│   └── readmigo/              # Readmigo 主项目
│       ├── apps/
│       ├── packages/
│       ├── scripts/
│       │   └── book-ingestion/  # 书籍导入脚本
│       ├── .env.debug          # Debug 环境变量
│       └── package.json
│
└── scripts/
    ├── jobs/                   # 任务脚本
    │   ├── test-import-standard-ebooks.sh      # 测试导入（10本）
    │   └── import-standard-ebooks-debug.sh     # 完整导入
    │
    └── utils/                  # 工具脚本
        └── check-imports.sh    # 检查导入状态
```

### 日志目录
```
/var/log/readmigo/
└── imports/                    # 导入任务日志
    ├── test-import-20251226-042644.log
    ├── import-standard-ebooks-20251226-120000.log
    └── ...
```

---

## 🚀 快速开始

### 1. 连接到服务器
```bash
ssh readmigo@mcloud88.com
```

### 2. 检查任务状态
```bash
bash ~/scripts/utils/check-imports.sh
```

输出示例：
```
=== Readmigo Import Status ===

📋 Recent import logs:
  /var/log/readmigo/imports/test-import-20251226-042644.log (Dec 26 04:28)

📄 Latest log: test-import-20251226-042644.log

✓ Status: SUCCESS
  Books imported: 10

=== Cron Schedule ===
0 0 * * 0 /home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh

=== Quick Actions ===
  Run test import:  bash ~/scripts/jobs/test-import-standard-ebooks.sh
  Run full import:  bash ~/scripts/jobs/import-standard-ebooks-debug.sh
  View all logs:    ls -lt /var/log/readmigo/imports/
```

### 3. 运行任务

#### 测试导入（10本书，约2分钟）
```bash
bash ~/scripts/jobs/test-import-standard-ebooks.sh
```

#### 完整导入（所有书籍，约30-60分钟）
```bash
bash ~/scripts/jobs/import-standard-ebooks-debug.sh
```

### 4. 查看日志

#### 查看所有日志文件
```bash
ls -lt /var/log/readmigo/imports/
```

#### 查看最新日志
```bash
cat $(ls -t /var/log/readmigo/imports/*.log | head -1)
```

#### 实时监控任务进度
```bash
tail -f /var/log/readmigo/imports/*.log
```

退出监控：按 `Ctrl + C`

---

## ⏰ 定时任务

### 查看 Cron 配置
```bash
crontab -l
```

### 当前定时任务
```
# Standard Ebooks 完整导入 - 每周日 00:00 UTC (周一 08:00 SGT)
0 0 * * 0 /home/readmigo/scripts/jobs/import-standard-ebooks-debug.sh
```

### 检查 Cron 执行历史
```bash
grep CRON /var/log/syslog | grep readmigo | tail -20
```

---

## 📈 服务器监控

### 监控脚本

**脚本位置**: `~/scripts/utils/server-monitor.sh`

**源码位置**: `/scripts/server-monitor.sh`

### 功能概览

| 监控模块 | 显示内容 |
|----------|----------|
| 系统概览 | 主机名、运行时间、系统负载 |
| CPU 使用率 | 核心数、当前使用率（含进度条） |
| 内存使用 | 总量/已用/可用、使用率 |
| 磁盘使用 | 空间总量/已用/可用、使用率 |
| 网络流量 | 入站/出站流量、月度配额使用率 |
| PM2 进程 | 进程名称、状态、CPU、内存占用 |
| 服务状态 | SSH/Cron/Nginx/DO-Agent 运行状态 |
| 登录记录 | 最近 5 次 SSH 登录 |

### 使用方法

```bash
# 交互式监控面板
bash ~/scripts/utils/server-monitor.sh

# JSON 格式输出（便于程序解析）
bash ~/scripts/utils/server-monitor.sh --json
```

### 流量警告阈值

| 使用率 | 提示级别 |
|--------|----------|
| > 50% | 黄色注意 |
| > 80% | 红色警告 |

---

## 📊 常用操作

### 1. 查看系统资源
```bash
# 一键查看所有系统状态（推荐）
bash ~/scripts/utils/server-monitor.sh

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 和进程
top
# 退出: 按 q
```

### 2. 查看项目状态
```bash
# 进入项目目录
cd ~/projects/readmigo

# 查看 Git 状态
git status

# 查看当前分支
git branch

# 拉取最新代码
git pull
```

### 3. 更新依赖
```bash
cd ~/projects/readmigo

# 安装新依赖
pnpm install

# 重新生成 Prisma Client
pnpm --filter @readmigo/database generate
```

### 4. 环境变量
```bash
# 查看环境变量（隐藏敏感信息）
cat ~/projects/readmigo/.env.debug | grep -v "PASSWORD\|SECRET\|KEY" | grep "="

# 编辑环境变量（谨慎操作）
nano ~/projects/readmigo/.env.debug
# 保存: Ctrl+O, 回车
# 退出: Ctrl+X
```

### 5. 日志管理
```bash
# 查看最近5个日志文件
ls -lth /var/log/readmigo/imports/ | head -6

# 查看特定日志
cat /var/log/readmigo/imports/import-standard-ebooks-20251226-120000.log

# 搜索日志中的错误
grep -i error /var/log/readmigo/imports/*.log

# 查看日志最后100行
tail -100 /var/log/readmigo/imports/import-standard-ebooks-20251226-120000.log

# 清理30天前的旧日志
find /var/log/readmigo/imports/ -name "*.log" -mtime +30 -delete
```

---

## 🔧 故障排查

### 问题 1: 无法连接到服务器
```bash
# 检查网络连接
ping mcloud88.com

# 或 ping IP
ping 159.65.143.131

# 通过 Digital Ocean 控制台查看服务器状态
# https://cloud.digitalocean.com/
```

**可能原因**:
- 网络问题
- 服务器关机或重启中
- SSH 密钥配置问题

**解决方案**:
1. 检查本地网络
2. 登录 Digital Ocean 控制台查看 Droplet 状态
3. 如果服务器运行正常，检查 SSH 密钥配置

### 问题 2: 任务运行失败
```bash
# 1. 查看最新日志
cat $(ls -t /var/log/readmigo/imports/*.log | head -1) | tail -50

# 2. 检查环境变量
cd ~/projects/readmigo
cat .env.debug | grep DATABASE_URL

# 3. 测试数据库连接
cd ~/projects/readmigo
pnpm --filter @readmigo/database exec prisma db execute --stdin <<< "SELECT 1;"

# 4. 手动运行导入看详细错误
cd ~/projects/readmigo
pnpm --filter @readmigo/book-ingestion run ingest:standard 1 1
```

### 问题 3: 磁盘空间不足
```bash
# 查看磁盘使用
df -h

# 查找大文件
du -h /home/readmigo | sort -rh | head -20

# 清理 npm 缓存
pnpm store prune

# 清理旧日志
find /var/log/readmigo/imports/ -name "*.log" -mtime +30 -delete
```

### 问题 4: Cron 任务没有执行
```bash
# 检查 cron 服务状态
sudo systemctl status cron

# 查看 cron 日志
grep CRON /var/log/syslog | grep readmigo | tail -20

# 手动执行脚本测试
bash ~/scripts/jobs/import-standard-ebooks-debug.sh
```

---

## 📝 任务脚本说明

### 测试导入脚本
**文件**: `~/scripts/jobs/test-import-standard-ebooks.sh`

**功能**: 导入前10本 Standard Ebooks 书籍，用于快速测试

**执行时间**: 约 2 分钟

**日志文件**: `/var/log/readmigo/imports/test-import-YYYYMMDD-HHMMSS.log`

**使用场景**:
- 测试系统是否正常工作
- 验证环境变量配置
- 代码更新后的验证测试

### 完整导入脚本
**文件**: `~/scripts/jobs/import-standard-ebooks-debug.sh`

**功能**: 导入所有 Standard Ebooks 书籍（默认150本）

**执行时间**: 约 30-60 分钟

**日志文件**: `/var/log/readmigo/imports/import-standard-ebooks-YYYYMMDD-HHMMSS.log`

**使用场景**:
- 首次数据导入
- 定期更新书库（每周日自动运行）
- 手动补充缺失的书籍

### 状态检查脚本
**文件**: `~/scripts/utils/check-imports.sh`

**功能**: 显示最近的导入任务状态和日志摘要

**执行时间**: 瞬时

**使用场景**:
- 快速了解任务执行情况
- 查看最近的成功/失败状态
- 获取日志文件路径

---

## 🎯 最佳实践

### 1. 运行任务前
- ✅ 先运行 `check-imports.sh` 查看当前状态
- ✅ 确认没有正在运行的任务（避免冲突）
- ✅ 检查磁盘空间是否充足

### 2. 运行任务时
- ✅ 使用测试脚本验证环境（首次或更新后）
- ✅ 长时间任务建议使用 `screen` 或 `tmux`（防止断线）
- ✅ 可以使用 `tail -f` 实时监控进度

### 3. 任务完成后
- ✅ 检查日志确认成功状态
- ✅ 验证数据库中的数据
- ✅ 必要时清理旧日志释放空间

### 4. 定期维护
- ✅ 每月检查一次磁盘使用情况
- ✅ 每月清理30天前的日志
- ✅ 每季度更新系统和依赖

---

## 📞 联系方式

**问题反馈**: 如遇到问题，请联系项目维护者

**文档位置**: `/docs/05-operations/deployment/services/droplet-usage-guide.md`

**相关文档**:
- [服务器配置详细文档](./automation-server-setup.md)
- [故障排查指南](./automation-server-setup.md#6-故障排查)

---

## 🔐 安全提醒

⚠️ **重要安全事项**:

1. **不要分享 SSH 私钥** - 每个用户应使用自己的密钥
2. **不要提交敏感信息到 Git** - `.env.debug` 文件包含密钥
3. **定期更新系统** - 运行 `sudo apt update && sudo apt upgrade`
4. **不要使用 root 用户运行任务** - 使用 `readmigo` 用户
5. **备份重要数据** - 数据库在 Neon，R2 中有备份
6. **⚠️ 不要修改其他服务** - 服务器同时运行 VPN 服务，请勿修改 Nginx/x-ui/Xray 配置
7. **仅操作 Readmigo 相关文件** - 限制在 `/home/readmigo/` 目录

---

## 🚨 紧急联系

**Digital Ocean 控制台**: https://cloud.digitalocean.com/

**重启服务器**（万不得已时）:
```bash
# 通过 SSH
sudo reboot

# 或通过 Digital Ocean 控制台
# 1. 登录 https://cloud.digitalocean.com/
# 2. 找到 Droplet "Readmigo Job Server"
# 3. 点击 "Power" -> "Reboot"
```

**查看服务器状态**（无法 SSH 时）:
1. 登录 Digital Ocean 控制台
2. 查看 Droplet 的 "Graphs" 标签
3. 查看 CPU、内存、磁盘使用情况

---

**最后更新**: 2026-01-06
**文档版本**: v1.1
**维护者**: Readmigo Team
