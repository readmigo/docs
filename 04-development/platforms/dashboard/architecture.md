# Dashboard 架构设计

## 整体架构

```mermaid
graph TD
    subgraph Presentation["表现层 (Presentation)"]
        Layout["CustomLayout<br>布局容器"]
        AppBar["CustomAppBar<br>顶部导航"]
        Menu["CustomMenu<br>侧边菜单"]
        Pages["页面组件 (Pages)<br>Dashboard | Books | Users | Orders | AI Stats | ..."]
    end
    subgraph State["状态层 (State Management)"]
        EnvCtx["EnvironmentCtx<br>环境上下文"]
        LangCtx["ContentLangCtx<br>内容语言上下文"]
        RAState["React Admin State<br>内置状态管理"]
    end
    subgraph Services["服务层 (Services)"]
        Auth["authProvider<br>认证服务"]
        Data["dataProvider<br>数据服务"]
        Flags["featureFlagsServ<br>功能开关服务"]
    end
    subgraph Network["网络层 (Network)"]
        API["Fetch API → REST API (NestJS Backend)"]
    end
    Presentation --> State
    State --> Services
    Services --> Network
```

## 技术栈详情

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           技术栈版本                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  核心框架                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  react                    18.3.1       前端框架                              │
│  typescript               5.6.x        类型系统                              │
│  react-router-dom         7.11.0       路由管理                              │
│                                                                             │
│  Admin 框架                                                                  │
│  ─────────────────────────────────────────────────────────────────          │
│  react-admin              5.3.0        Admin框架核心                         │
│  ra-data-simple-rest      5.3.0        REST数据提供者                        │
│  ra-i18n-polyglot         5.3.0        国际化支持                            │
│                                                                             │
│  UI 组件                                                                     │
│  ─────────────────────────────────────────────────────────────────          │
│  @mui/material            6.1.0        Material UI组件库                     │
│  @mui/icons-material      6.1.0        Material图标库                        │
│  @emotion/react           11.13.0      CSS-in-JS样式                         │
│  @emotion/styled          11.13.0      样式组件                              │
│                                                                             │
│  数据可视化                                                                  │
│  ─────────────────────────────────────────────────────────────────          │
│  recharts                 2.13.0       图表库                                │
│                                                                             │
│  国际化                                                                      │
│  ─────────────────────────────────────────────────────────────────          │
│  ra-language-chinese      2.0.10       中文语言包                            │
│  ra-language-english      5.0.0        英文语言包                            │
│                                                                             │
│  构建工具                                                                    │
│  ─────────────────────────────────────────────────────────────────          │
│  vite                     5.4.0        构建工具                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 数据流架构

```mermaid
graph LR
    User["用户操作"] --> RA["React Admin<br>组件"]
    RA --> DP["dataProvider<br>数据服务"]
    DP --> API["REST API<br>后端"]
    API --> State["状态更新"]
    State --> UIUpdate["UI 更新"]
    UIUpdate --> User
```

| 步骤 | 说明 |
|------|------|
| 1 | 用户在页面组件中触发操作 (列表加载/创建/编辑/删除) |
| 2 | React Admin 调用 dataProvider 对应方法 |
| 3 | dataProvider 构建请求 (添加认证头、环境URL、内容语言) |
| 4 | Fetch API 发送 REST 请求到后端 |
| 5 | 后端返回响应数据 |
| 6 | dataProvider 转换响应格式 |
| 7 | React Admin 更新内部状态缓存 |
| 8 | 组件根据新状态重新渲染 |

## 环境切换架构

```mermaid
graph TD
    subgraph Selector["EnvironmentSelector 组件"]
        Local["Local<br>(警告色)"]
        Debug["Debug<br>(警告色)"]
        Staging["Staging<br>(信息色)"]
        Prod["Production<br>(成功色)"]
    end
    Prod --> Confirm["生产环境确认对话框<br>'确定切换到生产环境?'"]
    Selector --> Context["EnvironmentContext<br>(状态 | localStorage | CustomEvent)"]
    Context --> DP["dataProvider<br>baseUrl = environments[env].apiUrl"]
```

| 环境 | API URL |
|------|---------|
| local | http://localhost:3000/api/v1/admin |
| debug | https://readmigo-debug.fly.dev/api/v1/admin |
| staging | https://staging-api.readmigo.com/api/v1/admin |
| production | https://api.readmigo.com/api/v1/admin |

## 内容语言过滤架构

```mermaid
graph TD
    subgraph Switch["ContentLanguageSwitch 组件"]
        All["All<br>全部"]
        EN["EN<br>英文"]
        ZH["ZH<br>中文"]
    end
    Switch --> Context["ContentLanguageContext<br>(状态 | localStorage | CustomEvent)"]
    Context --> Headers["请求头注入<br>(Authorization | X-Admin-Mode | X-Content-Filter)"]
```

| 设计原则 | 说明 |
|----------|------|
| 一次选择 | 用户在全局设置中选择语言，无需每页选择 |
| 无混合内容 | 选择后所有页面只显示该语言内容 |
| 无单项选择 | 创建/编辑内容时无需选择语言 |
| 上下文感知 | 所有操作继承全局语言上下文 |

## React Admin 资源注册

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       资源注册架构 (App.tsx)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  <Admin                                                                     │
│    dataProvider={dataProvider}                                              │
│    authProvider={authProvider}                                              │
│    i18nProvider={i18nProvider}                                              │
│    layout={CustomLayout}                                                    │
│    theme={theme}                                                            │
│  >                                                                          │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │                        标准资源                                      │  │
│    │                                                                      │  │
│    │  Resource: books                                                     │  │
│    │    └── list, create, edit, show                                     │  │
│    │                                                                      │  │
│    │  Resource: authors                                                   │  │
│    │    └── list, edit, show                                             │  │
│    │                                                                      │  │
│    │  Resource: categories                                                │  │
│    │    └── list, create, edit                                           │  │
│    │                                                                      │  │
│    │  Resource: booklists                                                 │  │
│    │    └── list, create, edit, show                                     │  │
│    │                                                                      │  │
│    │  Resource: users                                                     │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: quotes                                                    │  │
│    │    └── list, create, edit, show                                     │  │
│    │                                                                      │  │
│    │  Resource: postcards                                                 │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: postcard-templates                                        │  │
│    │    └── list, create, edit                                           │  │
│    │                                                                      │  │
│    │  Resource: messages                                                  │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: feedback                                                  │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: admin/tickets                                             │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: admin/orders                                              │  │
│    │    └── list, show                                                   │  │
│    │                                                                      │  │
│    │  Resource: import/batches                                            │  │
│    │    └── list                                                         │  │
│    │                                                                      │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │                       自定义路由                                     │  │
│    │                                                                      │  │
│    │  Route: /                     → Dashboard                           │  │
│    │  Route: /ai-stats             → AIStats                             │  │
│    │  Route: /feature-flags        → FeatureFlagsList                    │  │
│    │  Route: /support-dashboard    → SupportDashboard                    │  │
│    │                                                                      │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  </Admin>                                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 认证流程

```mermaid
graph TD
    subgraph NormalLogin["正常登录流程"]
        Login["登录页面"] --> AuthProv["authProvider<br>login()"]
        AuthProv --> PostLogin["POST /login"]
        PostLogin --> Token["返回 Token + User"]
        Token --> Storage["localStorage<br>(adminToken: JWT, adminUser)"]
    end
```

```mermaid
graph TD
    subgraph DevMode["开发模式 (VITE_AUTH_DISABLED=true)"]
        Page["任意页面"] --> DevAuth["authProvider<br>login()"]
        DevAuth --> Mock["自动注入 Mock Admin<br>(id: dev-admin, roles: admin)"]
    end
```

```mermaid
graph TD
    subgraph TokenCheck["Token 验证流程"]
        Request["API 请求"] --> Check["检查 Token"]
        Check --> Valid{"Token 有效?"}
        Valid -->|"Yes"| Continue["继续请求"]
        Valid -->|"No"| Redirect["跳转登录页<br>清除存储"]
    end
```

## 构建与部署架构

```mermaid
graph LR
    subgraph LocalDev["本地开发"]
        Dev["npm run dev"] --> ViteDev["Vite Dev Server"] --> Local["localhost:3001<br>HMR + Proxy"]
    end
```

```mermaid
graph LR
    subgraph ProdBuild["生产构建"]
        Build["npm run build"] --> TSC["tsc 类型检查"] --> ViteBuild["Vite Build"] --> Dist["dist/ 静态资源"]
    end
```

```mermaid
graph LR
    subgraph Deploy["Vercel 部署"]
        Push["Git Push<br>(main分支)"] --> Vercel["Vercel CI/CD"] --> Site["dashboard.readmigo.com<br>SPA路由"]
    end
```
