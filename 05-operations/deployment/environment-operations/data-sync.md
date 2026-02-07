# 数据同步与发布工作流程

> 此文档已过时。文档描述的多环境数据同步 (Production -> Staging -> Debugging -> Local) 基于已废弃的四环境架构。
>
> 当前架构已简化为两环境 (Local + Production)。
> - 代码部署: 推送到 main 分支自动部署到 Production (GitHub Actions + Fly.io)
> - 数据库迁移: Prisma migrate deploy (在部署流程中自动执行)
>
> 请参阅:
> - [environments.md](../environments.md) - 当前环境配置
> - [cicd-configuration-plan.md](../cicd-configuration-plan.md) - CI/CD 流程

---

*最后更新: 2026-02-07*
