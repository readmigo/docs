# Readmigo 环境配置

## 环境总览

Readmigo 项目采用 **2 环境架构**：Local + Production。

| 环境 | 用途 | Backend 位置 | 访问方式 |
|------|------|-------------|----------|
| **Local** | 本地开发调试 | 开发电脑 (localhost:3000) | `pnpm dev` |
| **Production** | 正式生产环境 | Fly.io (Tokyo nrt) | `fly deploy --app readmigo-api` |

> ⚠️ **历史说明**: 项目曾使用 4 环境架构 (Local/Debug/Staging/Production)，于 2026-01 简化为 2 环境。详见 [基础设施改造计划](../../plans/2026-01-26-infrastructure-overhaul.md)。

---

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          2 环境架构                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│        ┌─────────────────────┐          ┌─────────────────────┐        │
│        │       Local         │          │     Production      │        │
│        │                     │          │                     │        │
│        │   开发者本地环境     │    ───►  │    生产环境          │        │
│        │   localhost:3000    │   部署    │   api.readmigo.app  │        │
│        └──────────┬──────────┘          └──────────┬──────────┘        │
│                   │                                │                    │
│                   ▼                                ▼                    │
│        ┌─────────────────────┐          ┌─────────────────────┐        │
│        │  本地 PostgreSQL    │          │  Neon PostgreSQL    │        │
│        │  本地 Redis         │          │  Upstash Redis      │        │
│        │  R2 readmigo-dev    │          │  R2 readmigo-prod   │        │
│        └─────────────────────┘          └─────────────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Local Environment (本地开发)

开发者在本地机器上运行，用于日常开发和调试。

### Backend API

| 配置项 | 值 |
|--------|-----|
| 运行位置 | 开发电脑 (macOS) |
| 端口 | 3000 (默认) |
| 访问地址 | `http://localhost:3000` |

**启动方式:**
```bash
cd /Users/HONGBGU/Documents/readmigo/apps/backend
pnpm dev
```

### Database

| 配置项 | 值 |
|--------|-----|
| 类型 | PostgreSQL (Homebrew) |
| 运行位置 | localhost:5432 |
| 数据库名 | readmigo_local |
| 配置文件 | `.env` |

### Redis

| 配置项 | 值 |
|--------|-----|
| 运行位置 | localhost:6379 |
| Database | 0 |
| 配置 | `redis://localhost:6379/0` |

### File Storage

| 配置项 | 值 |
|--------|-----|
| 类型 | Cloudflare R2 |
| Bucket | readmigo-dev |
| CDN URL | `https://pub-xxx.r2.dev` |

### iOS 客户端

| 配置项 | 值 |
|--------|-----|
| 运行方式 | Xcode Simulator 或真机调试 |
| Bundle ID | com.readmigo.app.dev |
| API 地址 | http://localhost:3000 |

---

## Production Environment (生产环境)

正式生产环境，服务真实用户。

### Backend API

| 配置项 | 值 |
|--------|-----|
| 运行位置 | Fly.io (Tokyo - nrt) |
| App 名称 | readmigo-api |
| 域名 | api.readmigo.app |
| 配置 | fly.toml + Fly.io Secrets |
| 自动扩容 | 1+ machines (auto start/stop) |
| 内存 | 512MB per machine |
| 健康检查 | /api/v1/health |

**部署方式:**
```bash
cd /Users/HONGBGU/Documents/readmigo
fly deploy --app readmigo-api
```

### Database

| 配置项 | 值 |
|--------|-----|
| 类型 | Neon PostgreSQL |
| 区域 | ap-southeast-1 (Singapore) |
| 端点 | ep-solitary-brook-a121882g-pooler |
| 数据库名 | neondb |

### Redis

| 配置项 | 值 |
|--------|-----|
| 类型 | Upstash Redis |
| 实例 | fly-readmigo-production-redis |
| 端点 | fly-readmigo-production-redis.upstash.io:6379 |

### File Storage

| 配置项 | 值 |
|--------|-----|
| 类型 | Cloudflare R2 |
| Bucket | readmigo-production |
| CDN URL | https://cdn.readmigo.app |

### iOS 客户端

| 配置项 | 值 |
|--------|-----|
| Bundle ID | com.readmigo.app |
| 分发方式 | App Store |
| API 地址 | https://api.readmigo.app |

---

## 基础设施对比表

### Backend (Fly.io)

| 配置项 | Local | Production |
|--------|-------|-----------|
| App 名称 | - | readmigo-api |
| 运行位置 | localhost | Fly.io (nrt) |
| 域名 | localhost:3000 | api.readmigo.app |
| 内存 | - | 512MB |
| Machines | - | 1+ (auto) |

### Database (PostgreSQL)

| 配置项 | Local | Production |
|--------|-------|-----------|
| 类型 | Homebrew | Neon |
| 端点 | localhost:5432 | ep-solitary-brook-a121882g |
| 数据库名 | readmigo_local | neondb |
| 区域 | - | ap-southeast-1 |

### Redis

| 配置项 | Local | Production |
|--------|-------|-----------|
| 类型 | Local | Upstash |
| 实例 | localhost:6379 | fly-readmigo-production-redis |

### File Storage (Cloudflare R2)

| 配置项 | Local | Production |
|--------|-------|-----------|
| Bucket | readmigo-dev | readmigo-production |
| CDN | pub-xxx.r2.dev | cdn.readmigo.app |

### iOS 客户端

| 配置项 | Local | Production |
|--------|-------|-----------|
| Bundle ID | .dev | com.readmigo.app |
| 分发方式 | Xcode | App Store |
| API 地址 | localhost:3000 | api.readmigo.app |

---

## 部署流程

### Local 开发

```bash
# 1. 启动本地数据库（如果需要）
brew services start postgresql

# 2. 启动 backend
cd apps/backend
pnpm dev

# 3. 启动 iOS 客户端
open ios/Readmigo.xcworkspace
# 在 Xcode 中运行
```

### Production 部署

```bash
# 1. 在本地项目目录
cd /Users/HONGBGU/Documents/readmigo

# 2. 确保代码已充分测试
git status

# 3. 部署到 Fly.io Production
fly deploy --app readmigo-api

# 4. 检查部署状态
fly status --app readmigo-api

# 5. 查看日志
fly logs --app readmigo-api

# 6. 验证健康状态
curl https://api.readmigo.app/api/v1/health
```

---

## 环境变量配置

### 配置文件位置

| 环境 | 本地参考文件 | 实际配置位置 |
|------|-------------|-------------|
| Local | `.env` | 本地文件 |
| Production | `.env.production` | Fly.io Secrets |

### 设置 Fly.io Secrets

```bash
# Production 环境
fly secrets set DATABASE_URL="postgresql://..." --app readmigo-api
fly secrets set REDIS_URL="redis://..." --app readmigo-api
fly secrets set R2_ACCESS_KEY_ID="..." --app readmigo-api
fly secrets set R2_SECRET_ACCESS_KEY="..." --app readmigo-api
```

### 查看 Secrets

```bash
fly secrets list --app readmigo-api
```

---

## Fly.io 管理命令

### 查看应用状态

```bash
# 列出所有应用
fly apps list

# 查看应用状态
fly status --app readmigo-api
```

### 查看日志

```bash
# 实时日志
fly logs --app readmigo-api

# 查看最近的日志
fly logs --app readmigo-api --lines 100
```

### 扩容管理

```bash
# 增加实例
fly scale count 2 --app readmigo-api

# 调整内存
fly scale memory 1024 --app readmigo-api

# 查看当前配置
fly scale show --app readmigo-api
```

### SSH 连接

```bash
# SSH 到运行中的机器
fly ssh console --app readmigo-api

# 执行命令
fly ssh console --app readmigo-api -C "node -v"
```

---

## 故障排查

### 如何确认当前环境？

#### 检查 Fly.io App

```bash
# 列出所有应用及其状态
fly apps list

# 查看具体应用信息
fly status --app readmigo-api
```

#### 检查健康状态

```bash
# Production
curl https://api.readmigo.app/api/v1/health
```

### 常见问题

#### 1. 部署失败

```bash
# 查看详细日志
fly logs --app readmigo-api

# 检查构建日志
fly deploy --app readmigo-api --verbose
```

#### 2. 应用无法访问

```bash
# 检查机器状态
fly status --app readmigo-api

# 重启应用
fly apps restart readmigo-api

# 检查健康检查
fly checks list --app readmigo-api
```

#### 3. 数据库连接失败

```bash
# 测试数据库连接
fly ssh console --app readmigo-api
# 在容器内执行
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('OK'))"
```

---

## 重要提醒

⚠️ **完全隔离的环境**
- Local 和 Production 数据完全隔离
- 绝对不要在 Local 使用 Production 的 DATABASE_URL

⚠️ **Production 数据库保护**
- Production 数据库包含真实用户数据
- 不要运行破坏性的数据库操作

⚠️ **iOS Bundle ID**
- Development: `com.readmigo.app.dev`
- Production: `com.readmigo.app`
- 确保客户端连接到正确的 API 端点

---

## 监控和告警

### Sentry 集成

| 配置项 | 值 |
|--------|-----|
| DSN | https://xxx@o451xxx.ingest.us.sentry.io/xxx |
| 环境标识 | production |

### Fly.io 监控

```bash
# 查看应用指标
fly dashboard --app readmigo-api

# 在浏览器中打开监控面板
https://fly.io/apps/readmigo-api/monitoring
```

---

*最后更新: 2026-01-26*
