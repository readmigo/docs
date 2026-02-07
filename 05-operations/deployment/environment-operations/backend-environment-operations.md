# Backend 环境运维手册

> 此文档已过时。文档描述的四环境运维操作 (Local/Debugging/Staging/Production) 基于已废弃的架构。
>
> 当前架构已简化为两环境 (Local + Production)。
>
> 请参阅:
> - [environments.md](../environments.md) - 当前环境配置
> - [fly-io.md](../services/fly-io.md) - Fly.io 部署与运维

---

## 当前有效的运维命令

### 部署

| 命令 | 说明 |
|------|------|
| `fly deploy` | 部署到 Production (通常由 GitHub Actions 自动执行) |
| `fly status` | 查看部署状态 |
| `fly logs` | 查看实时日志 |

### 数据库

| 命令 | 说明 |
|------|------|
| `pnpm db:migrate:dev --name migration_name` | 本地开发迁移 |
| `pnpm db:migrate:deploy` | 部署迁移 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:studio` | 数据库 Studio |

### 故障恢复

| 操作 | 说明 |
|------|------|
| 服务回滚 | Fly.io 控制面板或 GitHub Actions 重新部署 |
| 数据库恢复 | Neon Console 时间点恢复 (创建新分支) |

---

*最后更新: 2026-02-07*
