# Dashboard 配置管理

## 配置文件概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         配置文件                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  文件                     说明                                               │
│  ─────────────────────────────────────────────────────────────────          │
│  package.json             依赖和脚本配置                                     │
│  vite.config.ts           Vite 构建配置                                     │
│  tsconfig.json            TypeScript 配置                                   │
│  vercel.json              Vercel 部署配置                                   │
│  .env                     环境变量模板                                       │
│  .env.local               本地环境变量                                       │
│  src/config/environments.ts  环境配置                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Vite 配置

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         vite.config.ts                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  import { defineConfig } from 'vite'                                        │
│  import react from '@vitejs/plugin-react'                                   │
│                                                                             │
│  export default defineConfig({                                              │
│    plugins: [react()],                                                      │
│    server: {                                                                │
│      port: 3001,                                                            │
│      proxy: {                                                               │
│        '/api': {                                                            │
│          target: 'http://localhost:3000',                                   │
│          changeOrigin: true,                                                │
│        },                                                                   │
│      },                                                                     │
│    },                                                                       │
│  })                                                                         │
│                                                                             │
│  配置说明:                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  plugins        启用 React 插件 (JSX, Fast Refresh)                         │
│  server.port    开发服务器端口 3001                                         │
│  server.proxy   API 代理到本地后端 3000                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## TypeScript 配置

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         tsconfig.json                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  {                                                                          │
│    "compilerOptions": {                                                     │
│      "target": "ES2020",                                                    │
│      "useDefineForClassFields": true,                                       │
│      "lib": ["ES2020", "DOM", "DOM.Iterable"],                              │
│      "module": "ESNext",                                                    │
│      "skipLibCheck": true,                                                  │
│                                                                             │
│      "moduleResolution": "bundler",                                         │
│      "allowImportingTsExtensions": true,                                    │
│      "resolveJsonModule": true,                                             │
│      "isolatedModules": true,                                               │
│      "noEmit": true,                                                        │
│      "jsx": "react-jsx",                                                    │
│                                                                             │
│      "strict": true,                                                        │
│      "noUnusedLocals": true,                                                │
│      "noUnusedParameters": true,                                            │
│      "noFallthroughCasesInSwitch": true                                     │
│    },                                                                       │
│    "include": ["src"],                                                      │
│    "references": [{ "path": "./tsconfig.node.json" }]                       │
│  }                                                                          │
│                                                                             │
│  重要配置:                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  strict            启用严格类型检查                                         │
│  noUnusedLocals    禁止未使用的局部变量                                     │
│  jsx               使用 react-jsx 转换                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 环境配置

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         src/config/environments.ts                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  export type Environment = 'local' | 'debug' | 'staging' | 'production';    │
│                                                                             │
│  export interface EnvironmentConfig {                                       │
│    name: string;                                                            │
│    apiUrl: string;                                                          │
│    color: 'warning' | 'info' | 'success';                                   │
│    requireConfirmation?: boolean;                                           │
│  }                                                                          │
│                                                                             │
│  export const environments: Record<Environment, EnvironmentConfig> = {      │
│    local: {                                                                 │
│      name: 'Local',                                                         │
│      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',       │
│      color: 'warning',                                                      │
│    },                                                                       │
│    debug: {                                                                 │
│      name: 'Debug',                                                         │
│      apiUrl: import.meta.env.VITE_DEBUG_API_URL,                            │
│      color: 'warning',                                                      │
│    },                                                                       │
│    staging: {                                                               │
│      name: 'Staging',                                                       │
│      apiUrl: import.meta.env.VITE_STAGING_API_URL,                          │
│      color: 'info',                                                         │
│    },                                                                       │
│    production: {                                                            │
│      name: 'Production',                                                    │
│      apiUrl: import.meta.env.VITE_PRODUCTION_API_URL,                       │
│      color: 'success',                                                      │
│      requireConfirmation: true,                                             │
│    },                                                                       │
│  };                                                                         │
│                                                                             │
│  export const contentFilters = {                                            │
│    all: 'All Languages',                                                    │
│    en: 'English Only',                                                      │
│    zh: 'Chinese Only',                                                      │
│  };                                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 环境变量

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         环境变量配置                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  .env (模板):                                                                │
│  ─────────────────────────────────────────────────────────────────          │
│  VITE_AUTH_DISABLED=false                                                   │
│  VITE_API_URL=http://localhost:3000                                         │
│  VITE_DEBUG_API_URL=https://readmigo-debug.fly.dev                          │
│  VITE_STAGING_API_URL=https://staging-api.readmigo.com                      │
│  VITE_PRODUCTION_API_URL=https://api.readmigo.com                           │
│                                                                             │
│  .env.local (本地开发):                                                      │
│  ─────────────────────────────────────────────────────────────────          │
│  VITE_AUTH_DISABLED=true                                                    │
│  VITE_API_URL=http://localhost:3000                                         │
│                                                                             │
│  变量说明:                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  变量名                    说明                                              │
│  VITE_AUTH_DISABLED        true 跳过登录，使用 Mock Admin                   │
│  VITE_API_URL              本地开发 API 地址                                │
│  VITE_DEBUG_API_URL        Debug 环境 API 地址                              │
│  VITE_STAGING_API_URL      Staging 环境 API 地址                            │
│  VITE_PRODUCTION_API_URL   生产环境 API 地址                                │
│                                                                             │
│  注意:                                                                       │
│  ─────────────────────────────────────────────────────────────────          │
│  • 所有 Vite 环境变量必须以 VITE_ 前缀                                      │
│  • 通过 import.meta.env.VITE_* 访问                                         │
│  • .env.local 不应提交到版本控制                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Vercel 部署配置

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         vercel.json                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  {                                                                          │
│    "buildCommand": "npm run build",                                         │
│    "outputDirectory": "dist",                                               │
│    "framework": "vite",                                                     │
│    "rewrites": [                                                            │
│      { "source": "/(.*)", "destination": "/index.html" }                    │
│    ]                                                                        │
│  }                                                                          │
│                                                                             │
│  配置说明:                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  buildCommand       构建命令                                                │
│  outputDirectory    构建输出目录                                            │
│  framework          框架类型                                                │
│  rewrites           SPA 路由重写规则                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 依赖管理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         核心依赖                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  运行时依赖 (dependencies):                                                  │
│  ─────────────────────────────────────────────────────────────────          │
│  react                    ^18.3.1      React 核心                           │
│  react-dom                ^18.3.1      React DOM                            │
│  react-router-dom         ^7.11.0      路由                                 │
│  react-admin              ^5.3.0       Admin 框架                           │
│  ra-data-simple-rest      ^5.3.0       REST 数据提供者                      │
│  ra-i18n-polyglot         ^5.3.0       i18n 支持                            │
│  @mui/material            ^6.1.0       UI 组件                              │
│  @mui/icons-material      ^6.1.0       图标                                 │
│  @emotion/react           ^11.13.0     CSS-in-JS                            │
│  @emotion/styled          ^11.13.0     样式组件                             │
│  recharts                 ^2.13.0      图表                                 │
│                                                                             │
│  开发依赖 (devDependencies):                                                 │
│  ─────────────────────────────────────────────────────────────────          │
│  typescript               ^5.6.x       TypeScript                           │
│  vite                     ^5.4.0       构建工具                             │
│  @vitejs/plugin-react     ^4.x         Vite React 插件                      │
│  @types/react             ^18.x        React 类型                           │
│  eslint                   ^8.x         代码检查                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 本地存储键

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         localStorage 配置                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Key                         说明                   默认值                   │
│  ─────────────────────────────────────────────────────────────────          │
│  adminToken                  JWT 认证令牌           -                        │
│  adminUser                   用户信息 JSON          -                        │
│  locale                      UI 语言偏好           浏览器语言                │
│  dashboard_environment       当前环境              local                     │
│  contentLanguage             内容语言过滤          all                       │
│                                                                             │
│  清除本地存储:                                                               │
│  ─────────────────────────────────────────────────────────────────          │
│  // 登出时清除认证相关                                                       │
│  localStorage.removeItem('adminToken');                                     │
│  localStorage.removeItem('adminUser');                                      │
│                                                                             │
│  // 重置所有设置                                                             │
│  localStorage.clear();                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
