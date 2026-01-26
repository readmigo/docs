# Readmigo 环境配置

## 环境总览

Readmigo 项目包含 4 个独立环境，每个环境有完全隔离的基础设施。

| 环境 | 用途 | Backend 位置 | 访问方式 |
|------|------|-------------|----------|
| **Local** | 本地开发调试 | 开发电脑 (localhost:3000) | `pnpm dev` |
| **Debugging** | 远程开发调试 | Fly.io (Tokyo nrt) | `fly deploy --app readmigo-debug` |
| **Staging** | 预发布测试 | Fly.io (Tokyo nrt) | `fly deploy --app readmigo-staging` |
| **Production** | 正式生产环境 | Fly.io (Tokyo nrt) | `fly deploy --app readmigo-api` |

---

## Local Environment (本地开发)

开发者在本地机器上运行，用于日常开发和调试。

### Backend API
- **运行位置**: 开发电脑 (macOS)
- **端口**: 3000 (默认)
- **启动方式**:
  ```bash
  cd /Users/HONGBGU/Documents/readmigo/apps/backend
  pnpm dev
  ```
- **访问地址**: `http://localhost:3000`

### Database
- **类型**: PostgreSQL (Homebrew)
- **运行位置**: 本地 (localhost:5432)
- **数据库名**: `readmigo_debug`
- **配置文件**: `.env` 或 `.env.debug`
- **连接**: `postgresql://HONGBGU@localhost:5432/readmigo_debug`

### Redis
- **运行位置**: 本地 (localhost:6379)
- **Database**: 1 (DB 1)
- **配置**: `redis://localhost:6379/1`

### File Storage
- **类型**: Cloudflare R2
- **Bucket**: `readmigo-debug`
- **Access Key**: `0437017c5061a5574674a15a2f8e56a4`
- **CDN URL**: `https://pub-6ef0c5766370445e99232156ecf1a35e.r2.dev`

### iOS 客户端
- **运行方式**: Xcode Simulator 或真机调试
- **Bundle ID**: `com.readmigo.app.dev`
- **API 地址**: `http://localhost:3000`

---

## Debugging Environment (远程调试)

部署在 Fly.io 上的远程开发环境，用于团队协作调试。

### Backend API
- **运行位置**: Fly.io (Tokyo - nrt)
- **App 名称**: `readmigo-debug`
- **部署方式**:
  ```bash
  cd /Users/HONGBGU/Documents/readmigo
  fly deploy --app readmigo-debug --config fly.debugging.toml
  ```
- **访问地址**: `https://debug-api.readmigo.app`
- **配置**: Fly.io Secrets (`.env.debugging` 作为参考)

### Database
- **类型**: Neon PostgreSQL
- **区域**: ap-southeast-1 (Singapore)
- **端点**: `ep-debug-xxx` (独立实例)
- **数据库名**: neondb
- **特点**: 独立的调试数据，可以自由测试

### Redis
- **类型**: Upstash Redis
- **实例**: `fly-readmigo-debug-redis` (独立实例)
- **端点**: `fly-readmigo-debug-redis.upstash.io:6379`

### File Storage
- **类型**: Cloudflare R2
- **Bucket**: `readmigo-debug`
- **Account ID**: cbda5dcfa2fa6852a5d58673de8cd1e8
- **Access Key**: `0437017c5061a5574674a15a2f8e56a4`
- **CDN URL**: `https://pub-6ef0c5766370445e99232156ecf1a35e.r2.dev`

### iOS 客户端
- **Bundle ID**: `com.readmigo.app.dev`
- **访问方式**: TestFlight (Debug Track) 或本地编译
- **API 地址**: 配置的 Fly.io 域名

---

## Staging Environment (预发布测试)

部署在 Fly.io 上，用于 QA 测试和最终验证。

### Backend API
- **运行位置**: Fly.io (Tokyo - nrt)
- **App 名称**: `readmigo-staging`
- **部署方式**:
  ```bash
  cd /Users/HONGBGU/Documents/readmigo
  fly deploy --app readmigo-staging --config fly.staging.toml
  ```
- **访问地址**: `https://staging-api.readmigo.app`
- **配置**: Fly.io Secrets (`.env.staging` 作为参考)
- **最后部署**: Jan 5 2026 05:31

### Database
- **类型**: Neon PostgreSQL
- **区域**: ap-southeast-1 (Singapore)
- **端点**: `ep-shy-cloud-a1depd3i-pooler`
- **数据库名**: neondb
- **连接**: `postgresql://neondb_owner:***@ep-shy-cloud-a1depd3i.ap-southeast-1.aws.neon.tech/neondb`
- **特点**: 独立的测试数据，接近生产环境配置

### Redis
- **类型**: Upstash Redis
- **实例**: `fly-readmigo-staging-redis`
- **端点**: `fly-readmigo-staging-redis.upstash.io:6379`
- **连接**: `redis://default:***@fly-readmigo-staging-redis.upstash.io:6379`

### File Storage
- **类型**: Cloudflare R2
- **Bucket**: `readmigo-staging`
- **Account ID**: cbda5dcfa2fa6852a5d58673de8cd1e8
- **Access Key**: `8de919a7b9808448f9b4027c2cf89369`
- **CDN URL**: `https://pub-6ef0c5766370445e99232156ecf1a35e.r2.dev`

### iOS 客户端
- **Bundle ID**: `com.readmigo.app.dev`
- **分发方式**: TestFlight (Staging Track)
- **API 地址**: Staging Fly.io 域名

---

## Production Environment (生产环境)

正式生产环境，服务真实用户。

### Backend API
- **运行位置**: Fly.io (Tokyo - nrt)
- **App 名称**: `readmigo-api`
- **域名**: `api.readmigo.app`
- **部署方式**:
  ```bash
  cd /Users/HONGBGU/Documents/readmigo
  fly deploy --app readmigo-api
  ```
- **配置**: `fly.toml` + Fly.io Secrets (`.env.production` 作为参考)
- **自动扩容**: 1+ machines (auto start/stop)
- **内存**: 512MB per machine
- **健康检查**: `/api/v1/health`
- **最后部署**: 刚刚部署

### Database
- **类型**: Neon PostgreSQL
- **区域**: ap-southeast-1 (Singapore)
- **端点**: `ep-solitary-brook-a121882g-pooler`
- **数据库名**: neondb
- **连接**: `postgresql://neondb_owner:***@ep-solitary-brook-a121882g-pooler.ap-southeast-1.aws.neon.tech/neondb`
- **特点**:
  - Production 级别的性能和可靠性
  - 包含 2000+ 条翻译数据
  - 完整的用户数据和内容

### Redis
- **类型**: Upstash Redis
- **实例**: `fly-readmigo-production-redis`
- **端点**: `fly-readmigo-production-redis.upstash.io:6379`
- **连接**: `redis://default:***@fly-readmigo-production-redis.upstash.io:6379`
- **特点**: 用于缓存、会话存储

### File Storage
- **类型**: Cloudflare R2
- **Bucket**: `readmigo-production`
- **Account ID**: cbda5dcfa2fa6852a5d58673de8cd1e8
- **Access Key**: `c1a4d5d8ff15819eda875b2a87ef0984`
- **CDN URL**: `https://cdn.readmigo.app`
- **内容**:
  - 书籍封面
  - 作者头像
  - 用户上传的文件

### iOS 客户端
- **Bundle ID**: `com.readmigo.app`
- **分发方式**: App Store
- **API 地址**: `https://api.readmigo.app`

---

## 基础设施对比表

### Backend (Fly.io)

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|-----------|
| **App 名称** | - | readmigo-debug | readmigo-staging | readmigo-api |
| **运行位置** | localhost | Fly.io (nrt) | Fly.io (nrt) | Fly.io (nrt) |
| **域名** | localhost:3000 | debug-api.readmigo.app | staging-api.readmigo.app | api.readmigo.app |
| **内存** | - | 512MB | 512MB | 512MB |
| **Machines** | - | 1+ (auto) | 1+ (auto) | 1+ (auto) |

### Database (Neon PostgreSQL)

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|-----------|
| **类型** | Homebrew | Neon | Neon | Neon |
| **端点** | localhost:5432 | ep-debug-xxx | ep-shy-cloud-a1depd3i | ep-solitary-brook-a121882g |
| **数据库名** | readmigo_debug | neondb | neondb | neondb |
| **区域** | - | ap-southeast-1 | ap-southeast-1 | ap-southeast-1 |
| **数据隔离** | ✅ | ✅ | ✅ | ✅ |

### Redis (Upstash)

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|-----------|
| **类型** | Local | Upstash | Upstash | Upstash |
| **实例** | localhost:6379 | fly-readmigo-debug-redis | fly-readmigo-staging-redis | fly-readmigo-production-redis |
| **Database** | DB 1 | DB 0 | DB 0 | DB 0 |
| **数据隔离** | ✅ | ✅ | ✅ | ✅ |

### File Storage (Cloudflare R2)

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|-----------|
| **Bucket** | readmigo-debug | readmigo-debug | readmigo-staging | readmigo-production |
| **CDN** | pub-xxx.r2.dev | pub-xxx.r2.dev | pub-xxx.r2.dev | cdn.readmigo.app |
| **Account** | cbda5...cd1e8 | cbda5...cd1e8 | cbda5...cd1e8 | cbda5...cd1e8 |
| **数据隔离** | ✅ | ✅ | ✅ | ✅ |

### iOS 客户端

| 配置项 | Local | Debugging | Staging | Production |
|--------|-------|-----------|---------|-----------|
| **Bundle ID** | .dev | .dev | .dev | com.readmigo.app |
| **分发方式** | Xcode | TestFlight | TestFlight | App Store |
| **API 地址** | localhost:3000 | debug-api.readmigo.app | staging-api.readmigo.app | api.readmigo.app |

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

### Debugging 部署
```bash
# 1. 在本地项目目录
cd /Users/HONGBGU/Documents/readmigo

# 2. 确保代码已提交
git add .
git commit -m "debug: your changes"
git push origin main

# 3. 部署到 Fly.io Debugging
fly deploy --app readmigo-debug --config fly.debugging.toml

# 4. 检查部署状态
fly status --app readmigo-debug

# 5. 查看日志
fly logs --app readmigo-debug
```

### Staging 部署
```bash
# 1. 在本地项目目录
cd /Users/HONGBGU/Documents/readmigo

# 2. 确保代码已提交
git add .
git commit -m "feat: your feature"
git push origin main

# 3. 部署到 Fly.io Staging
fly deploy --app readmigo-staging --config fly.staging.toml

# 4. 检查部署状态
fly status --app readmigo-staging

# 5. 查看日志
fly logs --app readmigo-staging
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
| Local | `/Users/HONGBGU/Documents/readmigo/apps/backend/.env` | 本地文件 |
| Debugging | `/Users/HONGBGU/Documents/readmigo/apps/backend/.env.debugging` | Fly.io Secrets |
| Staging | `/Users/HONGBGU/Documents/readmigo/apps/backend/.env.staging` | Fly.io Secrets |
| Production | `/Users/HONGBGU/Documents/readmigo/apps/backend/.env.production` | Fly.io Secrets |

### 设置 Fly.io Secrets

```bash
# Debugging 环境
fly secrets set DATABASE_URL="postgresql://..." --app readmigo-debug
fly secrets set REDIS_URL="redis://..." --app readmigo-debug
fly secrets set R2_ACCESS_KEY_ID="..." --app readmigo-debug
fly secrets set R2_SECRET_ACCESS_KEY="..." --app readmigo-debug

# Staging 环境
fly secrets set DATABASE_URL="postgresql://..." --app readmigo-staging
fly secrets set REDIS_URL="redis://..." --app readmigo-staging
fly secrets set R2_ACCESS_KEY_ID="..." --app readmigo-staging
fly secrets set R2_SECRET_ACCESS_KEY="..." --app readmigo-staging

# Production 环境
fly secrets set DATABASE_URL="postgresql://..." --app readmigo-api
fly secrets set REDIS_URL="redis://..." --app readmigo-api
fly secrets set R2_ACCESS_KEY_ID="..." --app readmigo-api
fly secrets set R2_SECRET_ACCESS_KEY="..." --app readmigo-api
```

### 查看 Secrets

```bash
fly secrets list --app readmigo-debug
fly secrets list --app readmigo-staging
fly secrets list --app readmigo-api
```

---

## Fly.io 管理命令

### 查看应用状态

```bash
# 列出所有应用
fly apps list

# 查看特定应用状态
fly status --app readmigo-debug
fly status --app readmigo-staging
fly status --app readmigo-api
```

### 查看日志

```bash
# 实时日志
fly logs --app readmigo-api

# 查看最近的日志
fly logs --app readmigo-staging --lines 100
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

#### 检查数据库连接

```bash
# 通过日志查看数据库端点
fly logs --app readmigo-api | grep "ep-"

# 端点识别：
# ep-shy-cloud-a1depd3i -> Staging
# ep-solitary-brook-a121882g -> Production
```

#### 检查健康状态

```bash
# Debugging
curl https://debug-api.readmigo.app/api/v1/health

# Staging
curl https://staging-api.readmigo.app/api/v1/health

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

#### 4. 查看环境变量

```bash
# 查看已设置的 secrets
fly secrets list --app readmigo-api

# 不要在日志中输出敏感信息
```

---

## 重要提醒

⚠️ **完全隔离的环境**
- 每个环境（Debugging、Staging、Production）都有：
  - 独立的 Fly.io app
  - 独立的 Neon PostgreSQL 数据库
  - 独立的 Upstash Redis 实例
  - 独立的 Cloudflare R2 bucket
- 数据绝对不会跨环境混淆

⚠️ **Droplet 服务器 (mcloud88.com) 仅用于 Job Server**
- Droplet 服务器**仅用于**运行后台定时任务（Job Server）
- 所有环境（Debugging/Staging/Production）的 Backend API 都运行在 Fly.io
- 所有环境的数据库都运行在 Neon PostgreSQL

⚠️ **Production 数据库保护**
- Production 数据库包含 2000+ 条翻译记录和真实用户数据
- 绝对不要在其他环境使用 Production 的 `DATABASE_URL`
- 不要在 Staging 运行破坏性的数据库操作

⚠️ **R2 Bucket 隔离**
- Debug: `readmigo-debug`
- Staging: `readmigo-staging`
- Production: `readmigo-production`
- 文件不会跨环境访问

⚠️ **iOS Bundle ID**
- Development/Debug/Staging: `com.readmigo.app.dev`
- Production: `com.readmigo.app`
- 确保客户端连接到正确的 API 端点

---

## Fly.io 区域 (Region)

所有环境都部署在**东京 (nrt)** 区域，以提供最佳的亚洲用户延迟。

```bash
# 查看区域
fly regions list --app readmigo-api

# 添加备份区域（可选）
fly regions add hkg --app readmigo-api  # 香港
fly regions add sin --app readmigo-api  # 新加坡
```

---

## 监控和告警

### Sentry 集成

所有环境都已集成 Sentry 进行错误追踪：

- **DSN**: `https://da4d6433eade645ae5952a56305dc011@o4510539308400640.ingest.us.sentry.io/4510565280186368`
- **环境标识**:
  - Debugging: `SENTRY_ENVIRONMENT=debugging`
  - Staging: `SENTRY_ENVIRONMENT=staging`
  - Production: `SENTRY_ENVIRONMENT=production`

### Fly.io 监控

```bash
# 查看应用指标
fly dashboard --app readmigo-api

# 在浏览器中打开监控面板
https://fly.io/apps/readmigo-api/monitoring
```
