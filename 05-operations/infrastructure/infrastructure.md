# 基础设施

> Readmigo 基础设施架构与 CI/CD 流程

---

## 部署架构

```mermaid
graph TD
    CF["Cloudflare<br>DNS / CDN / R2 / Pages<br>DDoS 防护 / SSL"]
    CF --> FLY["Fly.io<br>readmigo-api<br>NRT (Tokyo)<br>shared-cpu-2x / 2GB"]
    CF --> R2["Cloudflare R2<br>EPUB / 封面 / 章节"]
    CF --> PAGES["Cloudflare Pages<br>官网 / Dashboard"]
    FLY --> NEON["Neon PostgreSQL<br>ap-southeast-1"]
    FLY --> REDIS["Upstash Redis<br>ap-southeast-1"]
```

---

## CI/CD 流程

```mermaid
graph LR
    PUSH["Push to main"] --> CI["GitHub Actions<br>Lint & Build"]
    CI --> DEPLOY["Deploy<br>flyctl deploy"]
    DEPLOY --> PROD["Production<br>readmigo-api.fly.dev"]
```

| Workflow | 触发条件 | 说明 |
|----------|----------|------|
| ci.yml | Push / PR | Lint & Build |
| deploy.yml | Push to main | flyctl deploy --remote-only |
| codeql.yml | 定期 | 代码安全扫描 |

---

## 监控告警

| 工具 | 用途 |
|------|------|
| Sentry | 错误追踪、性能监控 |
| Axiom | 日志收集 |
| Fly.io Dashboard | 资源监控 (CPU/内存) |

| 级别 | 触发条件 | 通知方式 |
|------|----------|----------|
| P0 | 服务不可用 > 1 分钟 | 立即通知 |
| P1 | 错误率 > 5% 持续 5 分钟 | 通知 |
| P2 | API 延迟 P95 > 3s | 告警 |

---

*最后更新: 2026-02-07*
