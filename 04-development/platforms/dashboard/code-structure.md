# Dashboard 代码结构

## 目录组织

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         目录结构                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  apps/dashboard/                                                            │
│  ├── src/                                                                   │
│  │   ├── App.tsx                    # 应用入口，资源注册                    │
│  │   ├── main.tsx                   # 入口文件，DOM挂载                     │
│  │   ├── theme.ts                   # MUI主题配置                           │
│  │   │                                                                      │
│  │   ├── services/                  # 核心服务                              │
│  │   │   ├── authProvider.ts        # 认证提供者                            │
│  │   │   ├── dataProvider.ts        # 数据提供者 (API集成)                  │
│  │   │   └── featureFlagsService.ts # 功能开关服务                          │
│  │   │                                                                      │
│  │   ├── contexts/                  # React Context                         │
│  │   │   ├── EnvironmentContext.tsx # 环境切换上下文                        │
│  │   │   ├── ContentLanguageContext.tsx # 内容语言上下文                    │
│  │   │   └── ContentContext.tsx     # 内容上下文                            │
│  │   │                                                                      │
│  │   ├── config/                    # 配置文件                              │
│  │   │   └── environments.ts        # 环境配置 (API URLs)                   │
│  │   │                                                                      │
│  │   ├── i18n/                      # 国际化                                │
│  │   │   ├── index.ts               # i18n提供者配置                        │
│  │   │   ├── en.ts                  # 英文翻译                              │
│  │   │   ├── zh-Hans.ts             # 简体中文翻译                          │
│  │   │   └── zh-Hant.ts             # 繁体中文翻译                          │
│  │   │                                                                      │
│  │   ├── components/                # 公共组件                              │
│  │   │   ├── CustomLayout.tsx       # 自定义布局                            │
│  │   │   ├── CustomAppBar.tsx       # 自定义顶部导航                        │
│  │   │   ├── CustomMenu.tsx         # 自定义侧边菜单                        │
│  │   │   ├── EnvironmentSelector.tsx # 环境选择器                           │
│  │   │   ├── ContentLanguageSwitch.tsx # 内容语言切换                       │
│  │   │   ├── ContentFilterSelector.tsx # 内容过滤选择器                     │
│  │   │   ├── EnvironmentContentSelector.tsx # 环境内容选择器                │
│  │   │   ├── LanguageSwitcher.tsx   # UI语言切换                            │
│  │   │   └── HelpButton.tsx         # 帮助按钮                              │
│  │   │                                                                      │
│  │   ├── pages/                     # 页面模块                              │
│  │   │   ├── Dashboard.tsx          # 首页仪表盘                            │
│  │   │   ├── books/                 # 书籍管理                              │
│  │   │   ├── authors/               # 作者管理                              │
│  │   │   ├── categories/            # 分类管理                              │
│  │   │   ├── booklists/             # 榜单管理                              │
│  │   │   ├── users/                 # 用户管理                              │
│  │   │   ├── quotes/                # 金句管理                              │
│  │   │   ├── postcards/             # 明信片管理                            │
│  │   │   ├── postcard-templates/    # 明信片模板                            │
│  │   │   ├── messages/              # 消息管理                              │
│  │   │   ├── feedback/              # 反馈管理                              │
│  │   │   ├── tickets/               # 工单管理                              │
│  │   │   ├── support/               # 支持仪表盘                            │
│  │   │   ├── orders/                # 订单管理                              │
│  │   │   ├── import-batches/        # 导入批次                              │
│  │   │   ├── feature-flags/         # 功能开关                              │
│  │   │   └── ai/                    # AI统计                                │
│  │   │                                                                      │
│  │   └── hooks/                     # 自定义Hooks                           │
│  │                                                                          │
│  ├── public/                        # 静态资源                              │
│  ├── dist/                          # 构建输出                              │
│  ├── package.json                   # 依赖配置                              │
│  ├── vite.config.ts                 # Vite配置                              │
│  ├── tsconfig.json                  # TypeScript配置                        │
│  ├── vercel.json                    # Vercel部署配置                        │
│  ├── .env                           # 环境变量                              │
│  └── .env.local                     # 本地环境变量                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 页面模块结构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       页面模块组织规范                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  每个资源模块遵循以下结构:                                                   │
│                                                                             │
│  pages/{resource}/                                                          │
│  ├── index.ts                       # 统一导出                              │
│  ├── {Resource}List.tsx             # 列表视图                              │
│  ├── {Resource}Show.tsx             # 详情视图                              │
│  ├── {Resource}Create.tsx           # 创建表单                              │
│  ├── {Resource}Edit.tsx             # 编辑表单                              │
│  └── components/                    # 模块专用组件                          │
│      └── ...                                                                │
│                                                                             │
│  示例: pages/books/                                                         │
│  ─────────────────────────────────────────────────────────────────          │
│  pages/books/                                                               │
│  ├── index.ts                                                               │
│  ├── BookList.tsx                   # 书籍列表                              │
│  ├── BookShow.tsx                   # 书籍详情                              │
│  ├── BookCreate.tsx                 # 创建书籍                              │
│  ├── BookEdit.tsx                   # 编辑书籍                              │
│  └── components/                                                            │
│      ├── BookFilter.tsx             # 书籍筛选器                            │
│      └── BookActions.tsx            # 书籍操作按钮                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心文件说明

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         核心文件                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  App.tsx                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  • 应用入口组件                                                              │
│  • 配置 React Admin 核心 providers                                          │
│  • 注册所有资源 (Resource)                                                   │
│  • 定义自定义路由                                                            │
│  • 包装 Context Providers                                                   │
│                                                                             │
│  theme.ts                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  • Material-UI 主题配置                                                     │
│  • 品牌色定义 (Primary: #7C8DF5)                                            │
│  • 渐变色配置 (#8BB9FF → #B9B3F5 → #F6B6E8)                                 │
│  • 组件样式覆盖                                                              │
│  • 字体配置 (Inter)                                                          │
│                                                                             │
│  services/authProvider.ts                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  • login(): 用户登录认证                                                    │
│  • logout(): 清除会话                                                       │
│  • checkAuth(): 验证 Token 有效性                                           │
│  • checkError(): 处理 401/403 错误                                          │
│  • getIdentity(): 获取当前用户信息                                          │
│  • getPermissions(): 获取用户权限                                           │
│                                                                             │
│  services/dataProvider.ts                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  • getList(): 获取资源列表                                                  │
│  • getOne(): 获取单个资源                                                   │
│  • create(): 创建资源                                                       │
│  • update(): 更新资源                                                       │
│  • delete(): 删除资源                                                       │
│  • getMany(): 批量获取资源                                                  │
│  • getManyReference(): 获取关联资源                                         │
│  • 请求头注入 (Authorization, X-Admin-Mode, X-Content-Filter)               │
│                                                                             │
│  config/environments.ts                                                     │
│  ─────────────────────────────────────────────────────────────────          │
│  • 环境配置定义                                                              │
│  • API URL 映射                                                              │
│  • 环境标识色配置                                                            │
│  • 内容过滤选项                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Context 架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Context 层次结构                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  <React.StrictMode>                                                         │
│    └── <EnvironmentProvider>              # 环境上下文                      │
│          └── <ContentLanguageProvider>    # 内容语言上下文                  │
│                └── <Admin>                # React Admin                     │
│                      └── <CustomLayout>   # 自定义布局                      │
│                            └── Pages...   # 页面组件                        │
│                                                                             │
│  EnvironmentContext                                                         │
│  ─────────────────────────────────────────────────────────────────          │
│  • 状态: environment ('local' | 'debug' | 'staging' | 'production')         │
│  • 方法: setEnvironment(env)                                                │
│  • 存储: localStorage.dashboard_environment                                 │
│  • 事件: CustomEvent('environment-changed')                                 │
│                                                                             │
│  ContentLanguageContext                                                     │
│  ─────────────────────────────────────────────────────────────────          │
│  • 状态: contentLanguage ('all' | 'en' | 'zh')                              │
│  • 方法: setContentLanguage(lang)                                           │
│  • 存储: localStorage.contentLanguage                                       │
│  • 事件: CustomEvent('content-language-changed')                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 文件命名规范

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         命名规范                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  组件文件                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  • PascalCase: BookList.tsx, UserShow.tsx                                   │
│  • 前缀表示资源: Book*, User*, Order*                                       │
│  • 后缀表示类型: *List, *Show, *Create, *Edit                               │
│                                                                             │
│  服务文件                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  • camelCase: authProvider.ts, dataProvider.ts                              │
│  • 后缀 Provider: 数据/认证提供者                                           │
│  • 后缀 Service: 业务服务                                                   │
│                                                                             │
│  上下文文件                                                                  │
│  ─────────────────────────────────────────────────────────────────          │
│  • PascalCase + Context: EnvironmentContext.tsx                             │
│  • 导出 Provider 和 useXxx Hook                                             │
│                                                                             │
│  配置文件                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  • camelCase: environments.ts, theme.ts                                     │
│                                                                             │
│  国际化文件                                                                  │
│  ─────────────────────────────────────────────────────────────────          │
│  • 语言代码: en.ts, zh-Hans.ts, zh-Hant.ts                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 导入路径规范

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         导入规范                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  导入顺序:                                                                   │
│  ─────────────────────────────────────────────────────────────────          │
│  1. React 和第三方库                                                         │
│  2. React Admin 组件                                                         │
│  3. MUI 组件                                                                 │
│  4. 本地 services                                                           │
│  5. 本地 contexts                                                           │
│  6. 本地 components                                                         │
│  7. 类型定义                                                                 │
│                                                                             │
│  示例:                                                                       │
│  ─────────────────────────────────────────────────────────────────          │
│  // 1. React 和第三方库                                                      │
│  import React from 'react';                                                 │
│  import { useNavigate } from 'react-router-dom';                            │
│                                                                             │
│  // 2. React Admin                                                          │
│  import { List, Datagrid, TextField, EditButton } from 'react-admin';       │
│                                                                             │
│  // 3. MUI                                                                  │
│  import { Box, Card, Typography } from '@mui/material';                     │
│                                                                             │
│  // 4. 本地 services                                                        │
│  import { dataProvider } from '../services/dataProvider';                   │
│                                                                             │
│  // 5. 本地 contexts                                                        │
│  import { useEnvironment } from '../contexts/EnvironmentContext';           │
│                                                                             │
│  // 6. 本地 components                                                      │
│  import { CustomAppBar } from '../components/CustomAppBar';                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
