# DNS配置与域名架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DNS Configuration & Domain Architecture               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  域名架构设计                                                            │
│  ════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  api.readmigo.app                                               │    │
│  │  ─────────────────                                               │    │
│  │  • 用途: Dashboard管理后台 API                                  │    │
│  │  • 应用: readmigo-api (fly.io)                                  │    │
│  │  • IP: 66.241.124.55                                            │    │
│  │  • 访问者: 管理员                                               │    │
│  │                                                                  │    │
│  │  v1.api.readmigo.app                                            │    │
│  │  ────────────────────                                            │    │
│  │  • 用途: 移动客户端 API (iOS/Android/Web)                       │    │
│  │  • 应用: readmigo-v1 (fly.io)                                   │    │
│  │  • IP: 66.241.124.49                                            │    │
│  │  • 访问者: 所有移动端用户                                       │    │
│  │                                                                  │    │
│  │  v2.api.readmigo.app (未来)                                     │    │
│  │  ────────────────────────                                        │    │
│  │  • 用途: 预留给未来的API版本迁移                                │    │
│  │  • 用途: 支持API版本共存和灰度升级                              │    │
│  │                                                                  │    │
│  │  dashboard.readmigo.app                                         │    │
│  │  ───────────────────────                                         │    │
│  │  • 用途: 管理后台前端                                           │    │
│  │  • 托管: Vercel                                                 │    │
│  │  • 连接: api.readmigo.app                                       │    │
│  │                                                                  │    │
│  │  cdn.readmigo.app                                               │    │
│  │  ─────────────────                                               │    │
│  │  • 用途: 静态资源CDN (书籍封面、EPUB文件等)                     │    │
│  │  • 服务: Cloudflare R2                                          │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Cloudflare DNS配置                                                     │
│  ═══════════════════════                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  记录类型  名称         目标                     代理状态      │    │
│  │  ──────────────────────────────────────────────────────────────  │    │
│  │  CNAME     api         readmigo-api.fly.dev     DNS only       │    │
│  │  A         v1.api      66.241.124.49            DNS only       │    │
│  │  AAAA      v1.api      2a09:8280:1::c3:4703:0   DNS only       │    │
│  │  CNAME     dashboard   xxx.vercel-dns.com       Proxied        │    │
│  │  R2        cdn         readmigo-production      Proxied        │    │
│  │                                                                  │    │
│  │  注意:                                                           │    │
│  │  • API域名使用 DNS only (灰色云朵) 确保直连                     │    │
│  │  • Proxied (橙色云朵) 启用Cloudflare CDN加速                    │    │
│  │  • fly.io app自动管理SSL证书                                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  版本隔离策略                                                            │
│  ════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  方案A: 按版本隔离 (当前采用)                                   │    │
│  │  ────────────────────────                                        │    │
│  │                                                                  │    │
│  │  api.readmigo.app       → readmigo-api    (主生产环境)         │    │
│  │  v1.api.readmigo.app    → readmigo-v1     (客户端版本)         │    │
│  │  v2.api.readmigo.app    → readmigo-api-v2 (未来版本)           │    │
│  │                                                                  │    │
│  │  优势:                                                           │    │
│  │  • 不同版本完全隔离，互不影响                                   │    │
│  │  • 支持长期维护多个API版本                                      │    │
│  │  • 客户端升级可以逐步迁移                                       │    │
│  │                                                                  │    │
│  │  使用场景:                                                       │    │
│  │  • 移动App需要向后兼容旧版本                                    │    │
│  │  • API有Breaking Changes时平滑过渡                              │    │
│  │  • A/B测试不同的后端实现                                        │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  管理员账号配置                                                          │
│  ══════════════════                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  Dashboard登录                                                   │    │
│  │  ──────────────                                                  │    │
│  │  URL:      https://dashboard.readmigo.app                       │    │
│  │  API:      https://api.readmigo.app                             │    │
│  │  Email:    logan676@163.com                                     │    │
│  │  Password: Readmigo@2026                                        │    │
│  │                                                                  │    │
│  │  认证机制:                                                       │    │
│  │  • 临时方案: 硬编码凭证 (开发/测试用)                           │    │
│  │  • 生产方案: 环境变量 ADMIN_EMAIL + ADMIN_PASSWORD_HASH        │    │
│  │                                                                  │    │
│  │  安全配置:                                                       │    │
│  │  • JWT Token有效期: 24小时                                      │    │
│  │  • 访问限制: 仅限管理员IP (可选)                                │    │
│  │  • 2FA: 未启用 (可选功能)                                       │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Fly.io应用映射                                                          │
│  ═══════════════════                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  App名称        域名                  IP              状态      │    │
│  │  ──────────────────────────────────────────────────────────────  │    │
│  │  readmigo-api   api.readmigo.app     66.241.124.55   运行中    │    │
│  │  readmigo-v1    v1.api.readmigo.app  66.241.124.49   运行中    │    │
│  │  readmigo-debug debug-api...         (未配置DNS)     暂停      │    │
│  │  readmigo-staging staging-api...     (未配置DNS)     暂停      │    │
│  │                                                                  │    │
│  │  SSL证书管理:                                                    │    │
│  │  • fly.io自动申请和续期Let's Encrypt证书                         │    │
│  │  • 证书绑定到具体的fly.io app                                    │    │
│  │  • 一个域名只能绑定到一个app                                     │    │
│  │  • 使用 fly certs list -a <app> 查看证书状态                    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  故障排查记录                                                            │
│  ════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  问题: 管理员无法登录 (2026-01-12)                              │    │
│  │  ────────────────────────────────────                            │    │
│  │                                                                  │    │
│  │  现象:                                                           │    │
│  │  • Dashboard返回 "Admin authentication not configured"          │    │
│  │  • 多次部署后错误信息不变                                       │    │
│  │  • 新代码未生效                                                 │    │
│  │                                                                  │    │
│  │  根本原因:                                                       │    │
│  │  1. DNS配置: api.readmigo.app → v1.api.readmigo.app (CNAME)    │    │
│  │  2. v1.api指向错误的fly.io app (readmigo-v1: 66.241.124.49)    │    │
│  │  3. 两个app都有api.readmigo.app的SSL证书导致路由冲突            │    │
│  │  4. 流量被路由到旧代码的app                                     │    │
│  │                                                                  │    │
│  │  解决方案:                                                       │    │
│  │  1. 从readmigo-v1删除api.readmigo.app的SSL证书                  │    │
│  │  2. 修改Cloudflare DNS: api → readmigo-api.fly.dev (CNAME)     │    │
│  │  3. 修复fly.production.toml删除冲突的[[services]]配置           │    │
│  │  4. 保持v1.api继续指向readmigo-v1供客户端使用                   │    │
│  │                                                                  │    │
│  │  预防措施:                                                       │    │
│  │  • 一个域名只能有一个SSL证书绑定                                │    │
│  │  • 使用CNAME直接指向fly.io app域名                              │    │
│  │  • 避免在fly.toml中同时使用http_service和[[services]]           │    │
│  │  • 部署后验证DNS解析和实际访问是否一致                          │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  运维命令参考                                                            │
│  ════════════════                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  # 查看DNS解析                                                   │    │
│  │  dig +short api.readmigo.app                                    │    │
│  │  dig +short v1.api.readmigo.app                                 │    │
│  │                                                                  │    │
│  │  # 查看fly.io app状态                                           │    │
│  │  fly status -a readmigo-api                                     │    │
│  │  fly status -a readmigo-v1                                      │    │
│  │                                                                  │    │
│  │  # 查看和管理SSL证书                                            │    │
│  │  fly certs list -a readmigo-api                                 │    │
│  │  fly certs show api.readmigo.app -a readmigo-api                │    │
│  │  fly certs add api.readmigo.app -a readmigo-api                 │    │
│  │  fly certs remove api.readmigo.app -a readmigo-api -y           │    │
│  │                                                                  │    │
│  │  # 查看应用日志                                                  │    │
│  │  fly logs -a readmigo-api                                       │    │
│  │  fly logs -a readmigo-api --machine <machine-id>                │    │
│  │                                                                  │    │
│  │  # 测试API连接                                                   │    │
│  │  curl https://api.readmigo.app/api/v1/health                    │    │
│  │  curl https://v1.api.readmigo.app/api/v1/health                 │    │
│  │                                                                  │    │
│  │  # 测试管理员登录                                                │    │
│  │  curl -X POST https://api.readmigo.app/api/v1/admin/auth/login \│    │
│  │    -H "Content-Type: application/json" \                        │    │
│  │    -d '{"email":"logan676@163.com","password":"Readmigo@2026"}' │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
