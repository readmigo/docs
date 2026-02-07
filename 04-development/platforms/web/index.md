# Web 平台文档中心

> Next.js 16 + React 19 + TypeScript | PWA 阅读应用

---

## 1. 平台概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      Web 平台技术栈                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  框架与语言                                                      │
│  ├── Next.js 16.1          App Router + Server Components       │
│  ├── React 19.2            Server Actions + Suspense            │
│  ├── TypeScript 5.6        严格模式                              │
│  └── Node.js 20 LTS        运行时环境                            │
│                                                                  │
│  UI 与样式                                                       │
│  ├── Radix UI              23+ 无障碍组件                        │
│  ├── TailwindCSS 4         原子化 CSS                           │
│  ├── Framer Motion         动画库                               │
│  └── next-themes           暗色模式                              │
│                                                                  │
│  状态与数据                                                      │
│  ├── Zustand               全局状态管理                          │
│  ├── TanStack Query 5      服务端状态                            │
│  ├── React Hook Form       表单管理                              │
│  └── Zod                   数据验证                              │
│                                                                  │
│  阅读器                                                          │
│  ├── epubjs               EPUB 解析渲染                          │
│  ├── react-pdf            PDF 渲染                               │
│  ├── mobi-parser (自研)   MOBI 格式支持                          │
│  └── txt-parser (自研)    TXT 格式支持                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 代码库结构

```
web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证布局组
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                   # 主应用布局组
│   │   ├── audiobooks/
│   │   ├── author/[id]/
│   │   ├── book/[id]/
│   │   ├── community/
│   │   ├── explore/
│   │   ├── learn/
│   │   ├── library/
│   │   ├── papers/
│   │   ├── settings/
│   │   └── vocabulary/
│   ├── (reader)/                 # 阅读器布局组
│   │   └── read/[id]/
│   └── api/auth/[...nextauth]/   # NextAuth API
│
├── components/                   # 共享 UI 组件
│   ├── layout/                   # 布局组件
│   ├── shared/                   # 通用组件
│   └── ui/                       # Radix 封装 (23+)
│
├── features/                     # 功能模块 (9 个)
│   ├── ai/                       # AI 功能
│   ├── audiobook/                # 有声书
│   ├── auth/                     # 认证
│   ├── author/                   # 作者
│   ├── learning/                 # 学习
│   ├── library/                  # 书架
│   ├── offline/                  # 离线支持
│   ├── papers/                   # 学术论文
│   └── reader/                   # 阅读器
│
├── lib/                          # 工具库
│   ├── api/                      # API 客户端
│   └── hooks/                    # 通用 Hooks
│
├── styles/                       # 全局样式
└── types/                        # 类型定义
```

---

## 3. 功能模块矩阵

| 模块 | 功能 | 文档 |
|------|------|------|
| reader | EPUB/PDF/MOBI/TXT 阅读 | [reader.md](./features/reader.md) |
| ai | 查词、翻译、问答 | [ai.md](./features/ai.md) |
| library | 书架管理 | [library.md](./features/library.md) |
| learning | 词汇学习 | [learning.md](./features/learning.md) |
| audiobook | 有声书播放 | [audiobook.md](./features/audiobook.md) |
| author | 作者详情 | [author.md](./features/author.md) |
| auth | 登录注册 | [auth.md](./features/auth.md) |
| offline | PWA 离线 | [offline.md](./features/offline.md) |

---

## 4. 核心文档索引

### 4.1 架构与设计

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 前端架构设计 |
| [state-management.md](./state-management.md) | 状态管理方案 |
| [design-system-implementation.md](./design-system-implementation.md) | 设计系统实现 |

### 4.2 开发与测试

| 文档 | 说明 |
|------|------|
| [development-setup.md](./development-setup.md) | 开发环境搭建 |
| [testing.md](./testing.md) | 测试策略与实践 |
| [error-handling.md](./error-handling.md) | 错误处理规范 |

### 4.3 性能与优化

| 文档 | 说明 |
|------|------|
| [performance.md](./performance.md) | 性能优化方案 |
| [pwa.md](./pwa.md) | PWA 配置与缓存 |
| [seo.md](./seo.md) | SEO 优化 |

### 4.4 发布与运维

| 文档 | 说明 |
|------|------|
| [web-deployment.md](../../../05-operations/deployment/platforms/web-deployment.md) | Vercel 部署指南 |
| [monitoring.md](./monitoring.md) | 监控与告警 |

---

## 5. 代码统计

| 指标 | 数量 |
|------|------|
| TypeScript 文件 | 113 |
| 测试文件 | 242 |
| 功能模块 | 9 |
| UI 组件 | 23+ |
| 页面路由 | 15+ |

---

## 6. 部署信息

| 环境 | URL | 平台 |
|------|-----|------|
| 生产 | web.readmigo.app | Vercel |
| 预览 | preview.readmigo.app | Vercel |
| 开发 | localhost:3001 | 本地 |

---

## 7. 快速开始

---

## 8. 相关文档

| 类别 | 文档 |
|------|------|
| 全局架构 | [architecture/client-architecture.md](../architecture/client-architecture.md) |
| 设计系统 | [design/design-system.md](../design/design-system.md) |
| API 规范 | [api/api-design.md](../api/api-design.md) |
| 后端服务 | [backend/README.md](../backend/) |

---

*最后更新: 2025-12-31*
