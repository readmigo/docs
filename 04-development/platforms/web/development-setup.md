# Web 开发环境搭建

> Next.js 16 + pnpm + VS Code 开发配置

---

## 1. 环境要求

### 1.1 必需软件

| 软件 | 版本 | 说明 |
|------|------|------|
| Node.js | 20 LTS | 运行时环境 |
| pnpm | 9.x | 包管理器 |
| Git | 2.x+ | 版本控制 |
| VS Code | 最新 | 推荐编辑器 |

### 1.2 推荐软件

| 软件 | 用途 |
|------|------|
| nvm | Node.js 版本管理 |
| Docker | 本地服务运行 |
| Postman | API 调试 |

---

## 2. 项目初始化

### 2.1 克隆与安装

```
┌─────────────────────────────────────────────────────────────────┐
│                    项目初始化流程                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: 克隆仓库                                                │
│  └── git clone <repo-url> readmigo                              │
│                                                                  │
│  Step 2: 进入项目目录                                            │
│  └── cd readmigo                                                │
│                                                                  │
│  Step 3: 安装依赖                                                │
│  └── pnpm install                                               │
│                                                                  │
│  Step 4: 复制环境变量                                            │
│  └── cp apps/web/.env.example apps/web/.env.local              │
│                                                                  │
│  Step 5: 启动开发服务器                                          │
│  └── pnpm --filter web dev                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 环境变量配置

| 变量 | 说明 | 示例值 |
|------|------|--------|
| NEXT_PUBLIC_API_URL | API 地址 | http://localhost:8080 |
| NEXT_PUBLIC_APP_URL | 应用地址 | http://localhost:3001 |
| NEXTAUTH_SECRET | 认证密钥 | 随机字符串 |
| NEXTAUTH_URL | NextAuth URL | http://localhost:3001 |
| DATABASE_URL | 数据库连接 | postgresql://... |

---

## 3. VS Code 配置

### 3.1 推荐扩展

| 扩展 | ID | 用途 |
|------|-----|------|
| ESLint | dbaeumer.vscode-eslint | 代码检查 |
| Prettier | esbenp.prettier-vscode | 代码格式化 |
| Tailwind CSS IntelliSense | bradlc.vscode-tailwindcss | CSS 提示 |
| TypeScript Importer | pmneo.tsimporter | 自动导入 |
| Error Lens | usernamehw.errorlens | 内联错误显示 |
| GitLens | eamodio.gitlens | Git 增强 |
| Playwright Test | ms-playwright.playwright | E2E 测试 |

### 3.2 工作区设置

```
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code 设置                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  编辑器设置                                                      │
│  ├── formatOnSave: true                                         │
│  ├── defaultFormatter: esbenp.prettier-vscode                  │
│  ├── codeActionsOnSave: source.fixAll.eslint                   │
│  └── tabSize: 2                                                 │
│                                                                  │
│  TypeScript 设置                                                 │
│  ├── typescript.preferences.importModuleSpecifier: non-relative │
│  └── typescript.updateImportsOnFileMove.enabled: always        │
│                                                                  │
│  Tailwind 设置                                                  │
│  └── tailwindCSS.experimental.classRegex: [...]                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 开发命令

### 4.1 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm --filter web dev` | 启动开发服务器 |
| `pnpm --filter web build` | 构建生产版本 |
| `pnpm --filter web start` | 启动生产服务器 |
| `pnpm --filter web lint` | 运行 ESLint |
| `pnpm --filter web test` | 运行单元测试 |
| `pnpm --filter web test:e2e` | 运行 E2E 测试 |

### 4.2 Monorepo 命令

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monorepo 命令示例                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  单包操作                                                        │
│  ├── pnpm --filter web <command>                               │
│  ├── pnpm --filter @readmigo/ui <command>                      │
│  └── pnpm --filter @readmigo/shared <command>                  │
│                                                                  │
│  多包操作                                                        │
│  ├── pnpm -r <command>                    # 所有包              │
│  └── pnpm --filter "web..." <command>     # web 及其依赖       │
│                                                                  │
│  依赖管理                                                        │
│  ├── pnpm add <pkg> --filter web          # 添加依赖           │
│  └── pnpm update -r                       # 更新所有依赖        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 本地服务

### 5.1 服务依赖

| 服务 | 端口 | 说明 |
|------|------|------|
| Web 前端 | 3001 | Next.js 开发服务器 |
| API 后端 | 8080 | Go API 服务 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存服务 |

### 5.2 Docker Compose 服务

```
┌─────────────────────────────────────────────────────────────────┐
│                    本地服务启动                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  启动数据库服务                                                  │
│  └── docker-compose up -d postgres redis                        │
│                                                                  │
│  启动后端 API                                                    │
│  └── cd backend && go run cmd/api/main.go                       │
│                                                                  │
│  启动前端开发                                                    │
│  └── pnpm --filter web dev                                      │
│                                                                  │
│  一键启动所有                                                    │
│  └── pnpm dev                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 代码规范

### 6.1 ESLint 配置

| 规则集 | 说明 |
|--------|------|
| @next/next | Next.js 最佳实践 |
| @typescript-eslint | TypeScript 规则 |
| prettier | 格式化规则 |
| tailwindcss | Tailwind 类排序 |

### 6.2 Prettier 配置

| 选项 | 值 |
|------|-----|
| semi | false |
| singleQuote | true |
| tabWidth | 2 |
| trailingComma | es5 |
| printWidth | 100 |

### 6.3 Git Hooks

```
┌─────────────────────────────────────────────────────────────────┐
│                    Git Hooks (Husky)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  pre-commit                                                     │
│  ├── lint-staged                                                │
│  │   ├── ESLint 检查修改文件                                    │
│  │   └── Prettier 格式化                                        │
│  └── TypeScript 类型检查                                        │
│                                                                  │
│  commit-msg                                                     │
│  └── commitlint                                                 │
│      └── 检查提交消息格式                                        │
│                                                                  │
│  pre-push                                                       │
│  └── 运行测试                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 调试配置

### 7.1 VS Code 调试

| 配置 | 用途 |
|------|------|
| Next.js: debug server-side | 调试服务端代码 |
| Next.js: debug client-side | 调试客户端代码 |
| Next.js: debug full stack | 全栈调试 |

### 7.2 浏览器调试

```
┌─────────────────────────────────────────────────────────────────┐
│                    浏览器调试工具                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React DevTools                                                 │
│  ├── 组件树检查                                                  │
│  ├── Props/State 查看                                           │
│  └── Profiler 性能分析                                          │
│                                                                  │
│  Redux/Zustand DevTools                                         │
│  └── 状态变化追踪                                                │
│                                                                  │
│  TanStack Query DevTools                                        │
│  ├── 缓存状态查看                                                │
│  └── 手动触发重新获取                                            │
│                                                                  │
│  Network Tab                                                    │
│  ├── API 请求监控                                               │
│  └── 性能瀑布图                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. 常见问题

### 8.1 问题排查

| 问题 | 解决方案 |
|------|----------|
| 依赖安装失败 | 删除 node_modules 和 pnpm-lock.yaml 重新安装 |
| 端口占用 | 修改 .env.local 中的端口配置 |
| TypeScript 错误 | 重启 TS 服务器: Cmd+Shift+P > Restart TS Server |
| 热更新不生效 | 检查文件是否被监听，重启开发服务器 |
| ESLint 报错 | 运行 pnpm lint --fix |

### 8.2 性能优化

```
┌─────────────────────────────────────────────────────────────────┐
│                    开发体验优化                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  提升编译速度                                                    │
│  ├── 启用 SWC (默认)                                            │
│  ├── 使用 Turbopack (实验性)                                    │
│  │   └── pnpm dev --turbo                                       │
│  └── 增加 Node.js 内存                                          │
│      └── NODE_OPTIONS='--max-old-space-size=4096'              │
│                                                                  │
│  减少重新编译                                                    │
│  ├── 避免修改 tailwind.config.ts                               │
│  ├── 避免修改 tsconfig.json                                    │
│  └── 使用 path alias                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. 相关文档

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 前端架构 |
| [testing.md](./testing.md) | 测试策略 |
| [web-deployment.md](../../../05-operations/deployment/platforms/web-deployment.md) | 部署指南 |

---

*最后更新: 2025-12-31*
