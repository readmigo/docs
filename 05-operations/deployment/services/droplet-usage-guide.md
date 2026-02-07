# Readmigo Job Server 使用指南

> Digital Ocean Droplet 快速使用文档 - 专用于运行自动化任务

---

## 服务器信息

| 项目 | 值 |
|------|-----|
| 服务器名称 | Readmigo Job Server |
| 主机名 | mcloud88.com |
| IP 地址 | 159.65.143.131 |
| 地区 | 新加坡 (Singapore) |
| 配置 | 8GB RAM, 4 vCPU, 50GB SSD |
| 费用 | $48/月 |
| 用途 | 自动化任务、定时导入、批处理 |

### 账户信息

| 项目 | 值 |
|------|-----|
| 管理员账户 | root |
| 工作账户 | readmigo (推荐使用) |
| SSH 端口 | 22 |
| 认证方式 | SSH 密钥 |

### 环境信息

| 项目 | 值 |
|------|-----|
| 操作系统 | Ubuntu 24.04 LTS |
| Node.js | 20.x |
| 包管理器 | pnpm 9.x |
| 进程管理 | PM2 |

### 运行中的服务

| 服务 | 端口 | 说明 |
|------|------|------|
| SSH | 22 | 远程登录服务 |
| Cron | - | 定时任务服务 (每周自动导入) |
| Nginx | 80 | Web 服务器 |
| x-ui | 2053, 2096 | VPN 管理面板 (请勿修改) |
| Xray | 443 | 代理服务核心 (请勿修改) |

> 服务器同时运行 VPN/代理服务，Readmigo 任务使用 readmigo 用户，与其他服务隔离。

---

## 连接到服务器

| 方式 | 命令 |
|------|------|
| 域名 (推荐) | `ssh readmigo@mcloud88.com` |
| IP 地址 | `ssh readmigo@159.65.143.131` |
| Root 用户 | `ssh root@mcloud88.com` |

---

## 快速操作

### 检查任务状态

运行 `bash ~/scripts/utils/check-imports.sh` 查看最近导入任务状态和日志摘要。

### 运行任务

| 任务 | 命令 | 耗时 |
|------|------|------|
| 测试导入 (10本) | `bash ~/scripts/jobs/test-import-standard-ebooks.sh` | 约 2 分钟 |
| 完整导入 (全部) | `bash ~/scripts/jobs/import-standard-ebooks-debug.sh` | 约 30-60 分钟 |

### 查看日志

| 操作 | 命令 |
|------|------|
| 查看所有日志 | `ls -lt /var/log/readmigo/imports/` |
| 查看最新日志 | `cat $(ls -t /var/log/readmigo/imports/*.log \| head -1)` |
| 实时监控进度 | `tail -f /var/log/readmigo/imports/*.log` (Ctrl+C 退出) |

---

## 定时任务

### 当前配置

| 任务 | Cron 表达式 | 执行时间 |
|------|------------|----------|
| Standard Ebooks 完整导入 | `0 0 * * 0` | 每周日 00:00 UTC (08:00 北京) |

查看 Cron 配置: `crontab -l`

---

## 服务器监控

### 监控工具

| 方式 | 用途 | 访问 |
|------|------|------|
| DigitalOcean 控制面板 | CPU/内存/带宽图表 | https://cloud.digitalocean.com |
| 服务器监控脚本 | 本地系统状态 | `bash ~/scripts/utils/server-monitor.sh` |
| PM2 监控 | Node.js 进程状态 | `pm2 monit` 或 `pm2 list` |

### 常用监控命令

| 命令 | 功能 |
|------|------|
| `htop` | 实时进程和资源监控 |
| `df -h` | 磁盘使用情况 |
| `free -h` | 内存使用情况 |

---

## 任务脚本说明

### 测试导入脚本

| 项目 | 值 |
|------|-----|
| 文件 | `~/scripts/jobs/test-import-standard-ebooks.sh` |
| 功能 | 导入前 10 本 Standard Ebooks 书籍 |
| 耗时 | 约 2 分钟 |
| 日志 | `/var/log/readmigo/imports/test-import-YYYYMMDD-HHMMSS.log` |

### 完整导入脚本

| 项目 | 值 |
|------|-----|
| 文件 | `~/scripts/jobs/import-standard-ebooks-debug.sh` |
| 功能 | 导入所有 Standard Ebooks 书籍 |
| 耗时 | 约 30-60 分钟 |
| 日志 | `/var/log/readmigo/imports/import-standard-ebooks-YYYYMMDD-HHMMSS.log` |

### 状态检查脚本

| 项目 | 值 |
|------|-----|
| 文件 | `~/scripts/utils/check-imports.sh` |
| 功能 | 显示最近的导入任务状态和日志摘要 |

---

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 无法连接服务器 | 网络问题/服务器关机 | 检查 DigitalOcean 控制台 |
| 任务运行失败 | 环境变量/数据库连接 | 查看最新日志，检查 .env.debug |
| 磁盘空间不足 | 旧日志积累 | 清理 30 天前的日志 |
| Cron 未执行 | 服务状态/路径问题 | 检查 cron 服务状态，手动测试脚本 |

---

## 最佳实践

**运行任务前:**
- 运行 check-imports.sh 查看当前状态
- 确认没有正在运行的任务
- 检查磁盘空间是否充足

**运行任务时:**
- 长时间任务使用 screen/tmux 或 PM2
- 使用 tail -f 实时监控进度

**定期维护:**
- 每月清理 30 天前的日志
- 每季度更新系统和依赖

---

## 安全提醒

- 不要分享 SSH 私钥
- 不要提交 .env.debug 到 Git
- 不要使用 root 用户运行任务
- 不要修改其他服务 (Nginx/x-ui/Xray)
- 仅操作 `/home/readmigo/` 目录

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [droplet.md](./droplet.md) | 服务器详细信息 |
| [automation-server-setup.md](./automation-server-setup.md) | 完整配置指南 |

---

*最后更新: 2026-02-07*
