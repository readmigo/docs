# Debug/Staging 云端测试环境搭建执行计划

> 本文档基于 `docs/05-operations/deployment/environment-operations/isolation-design.md` 编写

## 概述

根据环境隔离设计文档，搭建云端 **Debugging** 和 **Staging** 环境。

**环境架构：**
- **Local**: 本地开发（Docker + 本地服务）
- **Debugging**: 云端调试环境（Fly.io + Neon + Upstash）
- **Staging**: 云端预发布环境（Fly.io + Neon + Upstash）
- **Production**: 云端生产环境（已有）

## 当前状态

| 环境 | 部署位置 | 状态 | 访问地址 |
|------|----------|------|----------|
| Local | 本地 | 已配置 | http://localhost:3000 |
| Debugging | Fly.io | **待创建** | https://debug-api.readmigo.app |
| Staging | Fly.io | **待创建** | https://staging-api.readmigo.app |
| Production | Fly.io | 已有 | https://api.readmigo.app |

## 第一阶段：Debugging 环境搭建

### 步骤 1: 创建云端基础设施

#### 1.1 Neon PostgreSQL (Debugging)

```bash
# 登录 Neon Console: https://console.neon.tech
# 创建新项目: readmigo-debugging
# 获取连接字符串
```

#### 1.2 Upstash Redis (Debugging)

```bash
# 登录 Upstash Console: https://console.upstash.com
# 创建新 Redis 实例: readmigo-redis-debugging
# 获取连接字符串
```

#### 1.3 Cloudflare R2 Bucket (Debugging)

```bash
# 登录 Cloudflare Dashboard
# 创建新 Bucket: readmigo-debug
# 配置公开访问或自定义域名
```

### 步骤 2: 创建 Fly.io 应用

```bash
# 创建 debugging 应用
fly apps create readmigo-debug

# 创建 fly.debugging.toml 配置文件
```

**文件**: `fly.debugging.toml`

```toml
app = "readmigo-debug"
primary_region = "nrt"  # Tokyo

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "development"
  ENVIRONMENT = "debugging"
  PORT = "8080"
  LOG_LEVEL = "debug"
  SENTRY_ENVIRONMENT = "debugging"
  DEBUG_MODE_ENABLED = "true"
  DEFAULT_CHINESE_CONTENT = "true"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### 步骤 3: 配置 Fly Secrets

```bash
# 数据库
fly secrets set DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/readmigo_debug?sslmode=require" --app readmigo-debug

# Redis
fly secrets set REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379" --app readmigo-debug

# JWT
fly secrets set JWT_SECRET="debugging-secure-secret-64-chars-minimum-xxxxxxxxxxxxxxxx" --app readmigo-debug
fly secrets set JWT_REFRESH_SECRET="debugging-refresh-secret-64-chars-minimum-xxxxxxxxxxxxxxx" --app readmigo-debug

# R2 Storage
fly secrets set R2_ACCOUNT_ID="xxx" --app readmigo-debug
fly secrets set R2_ACCESS_KEY_ID="xxx" --app readmigo-debug
fly secrets set R2_SECRET_ACCESS_KEY="xxx" --app readmigo-debug
fly secrets set R2_BUCKET_NAME="readmigo-debug" --app readmigo-debug
fly secrets set R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com" --app readmigo-debug
fly secrets set R2_PUBLIC_URL="https://debug-assets.readmigo.app" --app readmigo-debug

# AI Services
fly secrets set DEEPSEEK_API_KEY="sk-xxx" --app readmigo-debug

# Sentry
fly secrets set SENTRY_DSN="https://xxx@sentry.io/xxx" --app readmigo-debug

# Client Validation
fly secrets set ALLOWED_BUNDLE_IDS="com.readmigo.app.dev,com.readmigo.app.debug" --app readmigo-debug
```

### 步骤 4: 配置自定义域名

```bash
# 添加证书
fly certs create debug-api.readmigo.app --app readmigo-debug

# 在 DNS 提供商添加 CNAME 记录
# debug-api.readmigo.app -> readmigo-debug.fly.dev
```

### 步骤 5: 部署

```bash
# 部署到 debugging 环境
fly deploy --config fly.debugging.toml

# 验证部署
curl https://debug-api.readmigo.app/api/v1/health
```

### 步骤 6: 数据库初始化

```bash
# 运行数据库迁移
fly ssh console --app readmigo-debug -C "npx prisma migrate deploy"

# 或通过本地连接远程数据库
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 第二阶段：Staging 环境搭建

### 步骤 1: 创建云端基础设施

#### 1.1 Neon PostgreSQL (Staging)

```bash
# 创建新项目: readmigo-staging
```

#### 1.2 Upstash Redis (Staging)

```bash
# 创建新实例: readmigo-redis-staging
```

#### 1.3 Cloudflare R2 Bucket (Staging)

```bash
# 创建新 Bucket: readmigo-staging
```

### 步骤 2: 创建 Fly.io 应用

**文件**: `fly.staging.toml`

```toml
app = "readmigo-staging"
primary_region = "nrt"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  ENVIRONMENT = "staging"
  PORT = "8080"
  LOG_LEVEL = "info"
  SENTRY_ENVIRONMENT = "staging"
  DEBUG_MODE_ENABLED = "false"
  DEFAULT_CHINESE_CONTENT = "false"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 1024
```

### 步骤 3-6: 同 Debugging 环境配置

（配置 secrets、域名、部署、数据库迁移）

---

## 环境对照表

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|------------|
| 部署位置 | 本地 | Fly.io | Fly.io | Fly.io |
| NODE_ENV | development | development | production | production |
| ENVIRONMENT | local | debugging | staging | production |
| 数据库 | 本地 Docker | Neon (独立) | Neon (独立) | Neon (独立) |
| Redis | 本地 Docker | Upstash (独立) | Upstash (独立) | Upstash (独立) |
| R2 Bucket | 共用/MinIO | readmigo-debug | readmigo-staging | readmigo-production |
| 域名 | localhost:3000 | debug-api.readmigo.app | staging-api.readmigo.app | api.readmigo.app |
| LOG_LEVEL | debug | debug | info | warn |
| DEBUG_MODE | true | true | false | false |
| 副本数 | 1 | 1 | 1-2 | 2-3 |

## 验证清单

### Debugging 环境
- [ ] Neon 数据库创建完成
- [ ] Upstash Redis 创建完成
- [ ] R2 Bucket 创建完成
- [ ] Fly.io 应用创建完成
- [ ] Secrets 配置完成
- [ ] 域名配置完成 (debug-api.readmigo.app)
- [ ] 部署成功
- [ ] Health check 通过
- [ ] 数据库迁移完成

### Staging 环境
- [ ] Neon 数据库创建完成
- [ ] Upstash Redis 创建完成
- [ ] R2 Bucket 创建完成
- [ ] Fly.io 应用创建完成
- [ ] Secrets 配置完成
- [ ] 域名配置完成 (staging-api.readmigo.app)
- [ ] 部署成功
- [ ] Health check 通过
- [ ] 数据库迁移完成

## 后续工作

1. **CI/CD 配置**: GitHub Actions 自动部署到 Debugging/Staging
2. **数据同步脚本**: Production → Debugging/Staging 的匿名化数据同步
3. **iOS 客户端**: 添加环境切换功能
4. **Dashboard**: 添加环境切换功能

---

请 review 以上执行计划，确认后开始实施。
