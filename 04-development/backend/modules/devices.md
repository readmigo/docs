# 设备管理模块 (Devices)

> 多设备管理、登录状态控制、订阅级别限制

---

## 1. 模块概述

```
┌─────────────────────────────────────────────────────────────────┐
│                      设备管理模块                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  核心功能                                                        │
│  ├── 设备注册与绑定                                              │
│  ├── 多设备数量限制 (按订阅等级)                                  │
│  ├── 设备登出管理                                                │
│  ├── 主设备标记                                                  │
│  └── 设备活跃状态追踪                                            │
│                                                                  │
│  关联模块                                                        │
│  ├── auth (认证时注册设备)                                       │
│  ├── subscriptions (订阅等级决定设备上限)                         │
│  └── sync (跨设备同步)                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 设备数量限制

### 按订阅等级

| 订阅等级 | 设备上限 | 说明 |
|----------|----------|------|
| FREE | 2 | 免费用户 |
| BASIC | 3 | 基础订阅 |
| PREMIUM | 5 | 高级订阅 |
| UNLIMITED | 999 | 无限制 |

### 超限处理流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    设备注册流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  新设备请求注册                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                            │
│  │ 检查设备是否存在 │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│     ┌─────┴─────┐                                               │
│     │           │                                               │
│     ▼           ▼                                               │
│  已存在       新设备                                             │
│  (更新信息)      │                                               │
│                 ▼                                                │
│          ┌─────────────────┐                                    │
│          │ 检查设备数量限制 │                                    │
│          └────────┬────────┘                                    │
│                   │                                              │
│            ┌──────┴──────┐                                      │
│            │             │                                      │
│            ▼             ▼                                      │
│         未超限        已超限                                     │
│            │             │                                      │
│            ▼             ▼                                      │
│    loginAllowed:    loginAllowed:                               │
│    true             false                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### Device 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| deviceId | String | 设备唯一标识 (客户端生成) |
| userId | UUID? | 关联用户 (可为空) |
| platform | Enum | 平台: IOS, ANDROID, WEB |
| deviceModel | String? | 设备型号 |
| deviceName | String? | 设备名称 (用户可修改) |
| osVersion | String? | 系统版本 |
| appVersion | String? | 应用版本 |
| pushToken | String? | 推送令牌 |
| isPrimary | Boolean | 是否主设备 |
| isLoggedOut | Boolean | 是否已登出 |
| lastActiveAt | DateTime | 最后活跃时间 |
| createdAt | DateTime | 创建时间 |

---

## 4. API 端点

### 设备管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /devices/register | 注册设备 |
| GET | /devices | 获取用户设备列表 |
| GET | /devices/stats | 获取设备统计 |
| PATCH | /devices/:deviceId | 更新设备信息 |
| POST | /devices/:deviceId/logout | 登出指定设备 |
| POST | /devices/logout-others | 登出其他所有设备 |
| DELETE | /devices/:deviceId | 移除设备 |

### 返回结构

#### DeviceListDto

| 字段 | 类型 | 说明 |
|------|------|------|
| devices | DeviceDto[] | 设备列表 |
| totalDevices | number | 当前设备数 |
| maxDevices | number | 最大设备数 |
| canAddMore | boolean | 是否可添加更多 |

#### DeviceStatsDto

| 字段 | 类型 | 说明 |
|------|------|------|
| totalDevices | number | 设备总数 |
| byPlatform | Record | 按平台统计 |
| lastActiveDeviceId | string? | 最近活跃设备 |
| primaryDeviceId | string? | 主设备 ID |

---

## 5. 核心功能

### 5.1 设备注册

```
┌─────────────────────────────────────────────────────────────────┐
│                    registerDevice 流程                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  输入: CreateDeviceDto + userId                                  │
│       │                                                          │
│       ▼                                                          │
│  1. 查询设备是否已存在                                            │
│       │                                                          │
│       ▼                                                          │
│  2. 获取用户当前设备列表                                          │
│       │                                                          │
│       ▼                                                          │
│  3. 获取订阅等级对应的设备上限                                     │
│       │                                                          │
│       ▼                                                          │
│  4. 判断是否为新设备                                              │
│       │                                                          │
│       ├── 是新设备 + 已达上限 → 注册但 loginAllowed: false        │
│       │                                                          │
│       └── 未达上限 → 正常注册, loginAllowed: true                 │
│                                                                  │
│  5. 首个设备自动标记为主设备                                       │
│                                                                  │
│  输出: RegisterDeviceResponseDto                                 │
│        { device, isNew, loginAllowed, message? }                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 设备登出

| 操作 | 说明 | 影响字段 |
|------|------|----------|
| logoutDevice | 登出指定设备 | isLoggedOut=true, isPrimary=false, pushToken=null |
| logoutAllOtherDevices | 登出其他设备 | 同上 (排除当前设备) |
| removeDevice | 删除设备记录 | 数据库记录删除 |

### 5.3 主设备管理

- 首个注册设备自动成为主设备
- 设置新主设备时，旧主设备自动取消标记
- 主设备登出时，标记自动取消

---

## 6. 客户端集成

### iOS 实现位置

```
ios/Readmigo/Features/
└── Devices/
    ├── DevicesView.swift         设备列表页
    ├── DeviceRowView.swift       单设备行
    └── DeviceManager.swift       设备管理逻辑
```

### 设备标识生成

| 平台 | 生成方式 |
|------|----------|
| iOS | identifierForVendor (IDFV) |
| Android | Settings.Secure.ANDROID_ID |
| Web | localStorage UUID |

---

## 7. 安全考虑

| 场景 | 处理方式 |
|------|----------|
| 设备盗用 | 用户可远程登出其他设备 |
| 账号共享滥用 | 设备数量限制 |
| Token 泄露 | 登出时清除 pushToken |
| 跨设备授权 | 每个设备独立 JWT |

---

## 8. 相关文档

| 文档 | 说明 |
|------|------|
| [sync.md](sync.md) | 跨设备同步 |
| [subscriptions.md](../../modules/subscriptions.md) | 订阅管理 |
| [auth.md](../../api/auth.md) | 认证流程 |

---

*最后更新: 2025-12-31*
