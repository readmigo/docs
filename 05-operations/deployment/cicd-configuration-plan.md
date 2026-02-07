# CI/CD 配置

## 当前架构

Readmigo 采用 2 环境架构 (Local + Production)，CI/CD 由 GitHub Actions 自动完成。

---

## GitHub Actions 工作流

| 工作流 | 文件 | 触发条件 | 用途 |
|--------|------|----------|------|
| CI | `.github/workflows/ci.yml` | push/PR to main | Lint + Build |
| Deploy | `.github/workflows/deploy.yml` | CI 成功 (main) | 部署到 Fly.io |
| CodeQL | `.github/workflows/codeql.yml` | 定期 | 安全扫描 |

---

## 部署流程

```mermaid
graph TD
    A["Push to main"] --> B["CI Workflow<br>Lint & Build"]
    B -->|success| C["Deploy Workflow<br>flyctl deploy --remote-only"]
    C --> D["Fly.io Production<br>(readmigo-api)"]
    D --> E["Release Command<br>prisma migrate deploy"]
    E --> F["Health Check<br>/api/v1/health"]
```

---

## CI 流程详情

CI 是单个 Job "Lint & Build"，包含以下步骤:

| 步骤 | 说明 |
|------|------|
| Checkout | 检出代码 |
| Setup pnpm v9 | 安装包管理器 |
| Setup Node 20 | 安装 Node.js |
| Install | 安装依赖 |
| Generate Prisma | 生成 Prisma Client |
| Build workspace packages | 构建 @readmigo/database, @readmigo/shared |
| Lint | 运行 ESLint |
| Build | 构建后端应用 |

> 注: 测试步骤因 CI 内存限制已移除。

---

## Deploy 流程详情

Deploy 工作流在 CI 成功后自动触发:

| 步骤 | 说明 |
|------|------|
| Checkout | 检出代码 |
| Setup flyctl | 安装 Fly.io CLI |
| Deploy | `flyctl deploy --remote-only` |

部署使用项目根目录的 `fly.toml` (唯一的 Fly 配置文件)。

---

## 零停机部署

```mermaid
graph TD
    subgraph phase1["阶段 1: 部署新版本"]
        LB1["Load Balancer"] -->|100% 流量| V1_1["旧实例 (v1)"]
        LB1 -.->|启动中...| V2_1["新实例 (v2)"]
    end
    subgraph phase2["阶段 2: 健康检查通过"]
        LB2["Load Balancer"] -->|50% 流量| V1_2["旧实例 (v1)"]
        LB2 -->|50% 流量| V2_2["新实例 (v2)<br>Health Check Passed"]
    end
    subgraph phase3["阶段 3: 切换完成"]
        V1_3["旧实例 (v1) - 停止"] -.- X["X"]
        LB3["Load Balancer"] -->|100% 流量| V2_3["新实例 (v2)"]
    end
    phase1 --> phase2 --> phase3
```

关键配置:
- 部署策略: rolling
- min_machines_running = 1 (始终保持至少 1 个实例运行)
- Release command 自动执行数据库迁移

---

## 数据库迁移安全策略

| 迁移类型 | 风险等级 | 安全模式 |
|----------|----------|----------|
| 添加可空字段 | 低 | 直接迁移 |
| 添加非空字段 | 中 | 先添加可空 + 默认值，后续版本设非空 |
| 删除字段 | 高 | 版本 N 停止使用，版本 N+1 删除 |
| 重命名字段 | 高 | 三步: 添加新字段 -> 迁移数据 -> 删除旧字段 |
| 修改字段类型 | 高 | 创建新字段，逐步迁移 |

---

## GitHub Secrets

| Secret 名称 | 用途 |
|-------------|------|
| `FLY_API_TOKEN` | Fly.io 部署 Token |

---

*最后更新: 2026-02-07*
