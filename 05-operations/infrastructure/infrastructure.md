# 基础设施

### 8.1 部署架构

```mermaid
graph TD
    subgraph MVP["MVP阶段 (成本优先) - 月成本估算: $25-60"]
        CF["Cloudflare<br>DNS管理 / DDoS防护<br>SSL/TLS / 边缘缓存"]
        CF --> RAILWAY

        subgraph RAILWAY["Railway / Render"]
            NEST["NestJS App<br>(Web Service)<br>$5-20/月"]
            PG["PostgreSQL<br>(Database)<br>$7-20/月"]
            RD["Redis<br>(Cache)<br>$5-10/月"]
        end

        R2["Cloudflare R2<br>EPUB文件存储 / 封面图片<br>免出口费用 / 前10GB免费"]
    end

    subgraph SCALE["扩展阶段 (规模化)"]
        subgraph AWS["AWS / GCP"]
            ALB["ALB<br>负载均衡"] --> ECS["ECS<br>容器服务<br>(多实例)"]
            RDS["RDS<br>PostgreSQL<br>(主从)"]
            EC["Elasticache<br>Redis<br>(集群)"]
            S3["S3<br>文件存储"]
            CFNT["CloudFront<br>CDN"]
            CW["CloudWatch<br>监控"]
        end
    end
```

### 8.2 CI/CD流程

```mermaid
graph LR
    subgraph GHA["GitHub Actions Workflow"]
        PUSH["Push<br>main / develop"] --> BUILD["Build<br>Lint / Type Check"]
        BUILD --> TEST["Test<br>Unit / E2E"]
        TEST --> DEPLOY["Deploy<br>Staging / Prod"]
    end

    subgraph IOS["iOS发布流程"]
        TAG["Tag<br>v1.0.0"] --> ARCHIVE["Build<br>Archive"]
        ARCHIVE --> TF["TestFlight<br>Beta"]
        TF --> APPSTORE["App Store<br>Review"]
    end
```

**分支策略：**
- main: 生产环境
- develop: 开发环境
- feature/*: 功能分支
- hotfix/*: 紧急修复

### 8.3 监控告警

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Monitoring & Alerting                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  监控指标                                                                │
│  ══════════                                                              │
│                                                                         │
│  应用层：                                                                │
│  • API响应时间 (P50, P95, P99)                                          │
│  • 请求成功率                                                           │
│  • 错误率和错误类型分布                                                 │
│  • 活跃用户数 (DAU, MAU)                                                │
│                                                                         │
│  AI服务：                                                                │
│  • AI调用量和成功率                                                     │
│  • AI响应延迟                                                           │
│  • 每小时/每日成本                                                      │
│  • 缓存命中率                                                           │
│                                                                         │
│  基础设施：                                                              │
│  • CPU/内存使用率                                                       │
│  • 数据库连接数                                                         │
│  • Redis内存使用                                                        │
│  • 磁盘使用率                                                           │
│                                                                         │
│  告警规则                                                                │
│  ══════════                                                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  级别    触发条件                        通知方式               │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  P0     服务不可用 > 1分钟              电话 + Slack + Email    │    │
│  │  P1     错误率 > 5% 持续5分钟           Slack + Email           │    │
│  │  P2     API延迟P95 > 3s                 Slack                   │    │
│  │  P3     AI成本超日预算                   Slack                   │    │
│  │  P4     磁盘使用 > 80%                   Email                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  工具选择                                                                │
│  ══════════                                                              │
│  • MVP: Sentry (错误追踪) + Uptime Robot (可用性)                       │
│  • 扩展: Datadog / Grafana + Prometheus                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

