# 05-operations

运维侧完整文档库：部署、环境、监控、基础设施与操作手册。

> 📊 **文档数量**: 48 个文件

---

## 目录结构

| 子目录 | 说明 | 文件数 |
|--------|------|--------|
| [deployment/](./deployment/README.md) | 部署与环境管理 | 25+ |
| [infrastructure/](./infrastructure/README.md) | 基础设施（数据库、存储、域名） | 7 |
| [monitoring/](./monitoring/README.md) | 监控与可观测性 | 8 |
| [runbooks/](./runbooks/README.md) | 操作手册 | 2 |
| [automation/](./automation/) | 自动化与工作流 | 2 |

---

## 环境架构（4层）

| 环境 | 用途 | API域名 |
|------|------|---------|
| **Local** | 本地开发 | localhost:3000 |
| **Debugging** | 功能调试 | debug-api.readmigo.app |
| **Staging** | 预发布测试 | staging-api.readmigo.app |
| **Production** | 生产环境 | api.readmigo.app |

---

## 核心服务

| 服务 | 供应商 | 区域 |
|------|--------|------|
| **计算** | Fly.io | Tokyo |
| **数据库** | Neon PostgreSQL | Tokyo |
| **缓存** | Upstash Redis | Tokyo |
| **存储** | Cloudflare R2 | Global |
| **监控** | Sentry | - |
| **DNS/CDN** | Cloudflare | Global |

---

## 关键文档

### 部署
| 文档 | 描述 |
|------|------|
| [environments.md](./deployment/environments.md) | 4层环境完整配置 |
| [cicd-configuration-plan.md](./deployment/cicd-configuration-plan.md) | CI/CD + 零停机部署 |
| [ios-app-store-submission.md](./deployment/ios-app-store-submission.md) | iOS发布流程 |

### 基础设施
| 文档 | 描述 |
|------|------|
| [database.md](./infrastructure/database.md) | Neon PostgreSQL（87+模型） |
| [cloudflare-r2.md](./infrastructure/cloudflare-r2.md) | R2对象存储使用指南 |

### 监控
| 文档 | 描述 |
|------|------|
| [performance-optimization.md](./monitoring/performance-optimization.md) | 性能优化计划 |
| [100k-dau-performance-plan.md](./monitoring/100k-dau-performance-plan.md) | 10万DAU扩展计划 |

---

## 快速导航

- **环境配置**: deployment/environments.md
- **CI/CD**: deployment/cicd-configuration-plan.md
- **数据库**: infrastructure/database.md
- **性能**: monitoring/performance-optimization.md

