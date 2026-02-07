# DNS 配置与网络服务

> 域名架构、DNS 配置、Fly.io 应用映射

---

## 域名架构

| 子域名 | 用途 | 托管平台 | 说明 |
|--------|------|----------|------|
| readmigo.app | 官网主页 | Cloudflare Pages | Next.js Static |
| dashboard.readmigo.app | 管理后台 | Cloudflare Pages | React / Vite |
| cdn.readmigo.app | CDN 资源分发 | Cloudflare R2 | 书籍封面、EPUB |
| readmigo-api.fly.dev | API 后端 | Fly.io | NestJS |

---

## Cloudflare DNS 记录

| 记录类型 | 名称 | 目标 | 代理状态 |
|----------|------|------|----------|
| CNAME | @ (根域) | Cloudflare Pages | Proxied |
| CNAME | dashboard | Cloudflare Pages | Proxied |
| R2 | cdn | readmigo-production | Proxied |

> API 使用 Fly.io 默认域名 readmigo-api.fly.dev，不通过 Cloudflare 代理。

---

## Fly.io 应用

| App 名称 | 域名 | 状态 |
|----------|------|------|
| readmigo-api | readmigo-api.fly.dev | 运行中 |

> SSL 证书由 Fly.io 自动管理 (Let's Encrypt)。

---

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| API 无法访问 | Fly.io 实例未运行 | 检查 `fly status` |
| CDN 资源 404 | R2 bucket 路径错误 | 检查 R2 对象路径 |
| DNS 解析失败 | Cloudflare 配置错误 | 检查 DNS 记录 |
| SSL 证书错误 | 证书未绑定 | `fly certs list` 检查 |

---

*最后更新: 2026-02-07*
