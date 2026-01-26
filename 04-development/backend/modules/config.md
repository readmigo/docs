# 配置模块 (Config)

> 功能开关、环境检测、动态配置

---

## 1. 模块概述

```
┌─────────────────────────────────────────────────────────────────┐
│                        配置模块                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  子模块                                                          │
│  ├── FeatureFlagsService    功能开关管理                         │
│  └── EnvironmentService     环境检测                             │
│                                                                  │
│  核心能力                                                        │
│  ├── 按环境控制功能开关                                          │
│  ├── 实时更新无需重启                                            │
│  ├── 语言白名单控制                                              │
│  └── 运营配置管理                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 环境体系

### 2.1 四层环境

| 环境 | 标识 | 用途 |
|------|------|------|
| local | `local` | 本地开发 |
| debug | `debug` | 远程调试 |
| staging | `staging` | 预发布测试 |
| production | `production` | 生产环境 |

### 2.2 环境检测逻辑

```
┌─────────────────────────────────────────────────────────────────┐
│                    环境检测流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  读取 process.env.ENVIRONMENT                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ENVIRONMENT 值       →    返回环境                       │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  'local'              →    Environment.Local             │    │
│  │  'debug'              →    Environment.Debug             │    │
│  │  'staging'            →    Environment.Staging           │    │
│  │  'production'         →    Environment.Production        │    │
│  │  其他/未设置          →    回退检测 NODE_ENV             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  回退检测:                                                       │
│  ├── NODE_ENV=development → Local                               │
│  └── NODE_ENV=production  → Production                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 功能开关 (Feature Flags)

### 3.1 数据模型

#### FeatureFlag 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| key | String | 功能标识 (环境前缀) |
| name | String | 功能名称 |
| description | String? | 功能描述 |
| isEnabled | Boolean | 是否启用 |
| metadata | JSON? | 扩展配置 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 3.2 Key 命名规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    功能开关 Key 格式                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  格式: {environment}:{feature_name}                             │
│                                                                  │
│  示例:                                                           │
│  ├── local:audiobook_streaming                                  │
│  ├── debug:audiobook_streaming                                  │
│  ├── staging:audiobook_streaming                                │
│  └── production:audiobook_streaming                             │
│                                                                  │
│  全局 Key (所有环境共享):                                        │
│  └── global:maintenance_mode                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 预置功能开关

| Key | 说明 | 默认状态 |
|-----|------|----------|
| audiobook_streaming | 有声书流式播放 | staging+: ON |
| ai_chat | AI 对话功能 | all: ON |
| character_graph | 角色关系图 | production: ON |
| annual_report | 年度报告 | production: ON |
| push_notifications | 推送通知 | staging+: ON |
| new_reader_engine | 新阅读引擎 | debug+: ON |

---

## 4. API 端点

### 管理端点 (需 Admin 权限)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /config/flags | 获取所有功能开关 |
| GET | /config/flags/:key | 获取单个开关 |
| POST | /config/flags | 创建功能开关 |
| PATCH | /config/flags/:key | 更新功能开关 |
| DELETE | /config/flags/:key | 删除功能开关 |
| POST | /config/flags/:key/copy | 复制到其他环境 |

### 客户端端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /config/client | 获取客户端配置 |
| GET | /config/languages | 获取允许的语言列表 |

### ClientConfigDto (响应)

| 字段 | 类型 | 说明 |
|------|------|------|
| environment | string | 当前环境 |
| features | Record<string, boolean> | 功能开关状态 |
| allowedLanguages | string[] | 允许的语言 |
| maintenance | MaintenanceDto? | 维护信息 |

---

## 5. 核心功能

### 5.1 功能开关查询

```
┌─────────────────────────────────────────────────────────────────┐
│                    isEnabled 查询流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  isEnabled('audiobook_streaming')                               │
│       │                                                          │
│       ▼                                                          │
│  1. 获取当前环境 (e.g., 'staging')                               │
│       │                                                          │
│       ▼                                                          │
│  2. 构建环境 Key: 'staging:audiobook_streaming'                 │
│       │                                                          │
│       ▼                                                          │
│  3. 查询 Redis 缓存                                              │
│       │                                                          │
│       ├── 命中 → 返回缓存值                                      │
│       │                                                          │
│       └── 未命中 → 查询数据库                                    │
│               │                                                  │
│               ├── 存在 → 缓存并返回                              │
│               │                                                  │
│               └── 不存在 → 返回 false (默认关闭)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 跨环境复制

```
┌─────────────────────────────────────────────────────────────────┐
│                    copyFlagToEnvironment                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  copyFlagToEnvironment('audiobook_streaming', 'staging', 'prod')│
│       │                                                          │
│       ▼                                                          │
│  1. 读取源: staging:audiobook_streaming                         │
│       │                                                          │
│       ▼                                                          │
│  2. 创建/更新目标: production:audiobook_streaming               │
│       │                                                          │
│       ▼                                                          │
│  3. 复制 isEnabled 和 metadata                                  │
│       │                                                          │
│       ▼                                                          │
│  4. 清除缓存                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 语言白名单

| 方法 | 说明 |
|------|------|
| getAllowedLanguages() | 获取当前环境允许的语言列表 |
| isLanguageAllowed(lang) | 检查语言是否允许 |

默认允许语言: `['en', 'zh']`

---

## 6. 缓存策略

| 数据类型 | 缓存 Key | TTL | 说明 |
|----------|----------|-----|------|
| 功能开关 | `ff:{env}:{key}` | 5 分钟 | 单个开关 |
| 客户端配置 | `config:client:{env}` | 1 分钟 | 聚合配置 |
| 语言列表 | `config:languages:{env}` | 10 分钟 | 语言白名单 |

### 缓存失效

| 触发条件 | 操作 |
|----------|------|
| 更新功能开关 | 删除对应 Key 缓存 |
| 删除功能开关 | 删除对应 Key 缓存 |
| 跨环境复制 | 删除目标环境缓存 |

---

## 7. 使用场景

### 7.1 灰度发布

```
┌─────────────────────────────────────────────────────────────────┐
│                    灰度发布流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. debug 环境开启 → 内部测试                                    │
│       │                                                          │
│       ▼                                                          │
│  2. staging 环境开启 → QA 测试                                   │
│       │                                                          │
│       ▼                                                          │
│  3. production 环境开启 → 全量上线                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 紧急回滚

| 步骤 | 操作 |
|------|------|
| 1 | 关闭 production 环境的问题功能开关 |
| 2 | 缓存自动失效 (5分钟内) |
| 3 | 客户端下次请求获取新状态 |

---

## 8. 相关文档

| 文档 | 说明 |
|------|------|
| [be-environment-overview.md](../../infrastructure/be-environment-overview.md) | 环境隔离概述 |
| [be-environment-configs.md](../../infrastructure/be-environment-configs.md) | 环境配置详情 |

---

*最后更新: 2025-12-31*
