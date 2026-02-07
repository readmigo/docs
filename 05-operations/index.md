# 05-operations

运维侧文档库：部署、环境、监控、基础设施与操作手册。

---

## 目录结构

| 子目录 | 说明 |
|--------|------|
| [deployment/](./deployment/) | 部署与环境管理 |
| [infrastructure/](./infrastructure/) | 基础设施（数据库、存储、域名） |
| [monitoring/](./monitoring/) | 监控与可观测性 |
| [runbooks/](./runbooks/) | 操作手册 |
| [automation/](./automation/) | 自动化与工作流 |

---

## 环境架构（2层）

| 环境 | 用途 | API 地址 |
|------|------|----------|
| **Local** | 本地开发 | localhost:3000 |
| **Production** | 生产环境 | readmigo-api.fly.dev |

> 项目曾使用 4 环境架构 (Local/Debug/Staging/Production)，于 2026-01 简化为 2 环境。

---

## 核心服务

| 服务 | 供应商 | 区域 |
|------|--------|------|
| **计算** | Fly.io | Tokyo (nrt) |
| **数据库** | Neon PostgreSQL | Singapore |
| **缓存** | Upstash Redis | - |
| **存储** | Cloudflare R2 | Global |
| **CDN** | cdn.readmigo.app | Global |
| **监控** | Sentry | - |

---

## 关键文档

### 部署

| 文档 | 描述 |
|------|------|
| [environments.md](./deployment/environments.md) | 2 层环境完整配置 |
| [cicd-configuration-plan.md](./deployment/cicd-configuration-plan.md) | CI/CD 配置 |

### 基础设施

| 文档 | 描述 |
|------|------|
| [database.md](./infrastructure/database.md) | Neon PostgreSQL |
| [cloudflare-r2.md](./infrastructure/cloudflare-r2.md) | R2 对象存储 |

### 监控

| 文档 | 描述 |
|------|------|
| [performance-optimization.md](./monitoring/performance-optimization.md) | 性能优化计划 |

---

## 快速导航

- **环境配置**: deployment/environments.md
- **CI/CD**: deployment/cicd-configuration-plan.md
- **数据库**: infrastructure/database.md
- **性能**: monitoring/performance-optimization.md
