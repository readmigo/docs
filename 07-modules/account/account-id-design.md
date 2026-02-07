# Readmigo 账号ID格式设计文档

> Version: 2.0.0
> Status: Draft - Pending Review
> Author: System Architect
> Date: 2025-12-23

---

## 1. 概述

### 1.1 设计目标

账号ID是全栈系统的**核心标识符**，用于：

| 用途 | 说明 |
|------|------|
| **日志关联** | API日志、BE日志、FE日志、Client日志统一搜索 |
| **崩溃追踪** | Sentry中通过账号ID定位用户相关崩溃 |
| **Dashboard查询** | 账单、阅读时长、反馈、建议、阅读数据、书籍等 |
| **数据分析** | 用户行为分析、转化漏斗、留存分析 |
| **客服支持** | 快速定位用户问题和历史记录 |

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **精简高效** | 最短格式，节省带宽和存储 |
| **类型可识别** | 首字符区分账号类型 |
| **全局唯一** | 无需协调，分布式生成 |
| **时间有序** | 支持按创建时间排序 |
| **全栈一致** | 从Client到DB使用同一ID |

---

## 2. 账号ID格式

### 2.1 格式规范

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Account ID Format (v2)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  格式: {type}{ulid}                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │   g01HV6BGKCPG3M8QDJX9Y7CJ5ZA                                       │    │
│  │   │└────────────────────────────┘                                   │    │
│  │   │              │                                                   │    │
│  │   │              └── ULID (26 chars): 时间戳 + 随机数               │    │
│  │   │                                                                  │    │
│  │   └── 类型前缀 (1 char): g=游客, r=正式, s=系统                     │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  示例:                                                                       │
│  • 游客账号:   g01HV6BGKCPG3M8QDJX9Y7CJ5ZA  (27 chars)                     │
│  • 正式账号:   r01HV6BGKCPG3M8QDJX9Y7CJ5ZB  (27 chars)                     │
│  • 系统账号:   s01HV6BGKCPG3M8QDJX9Y7CJ5ZC  (27 chars)                     │
│                                                                              │
│  对比旧方案:                                                                 │
│  • 旧: usr_guest_01HV6BGKCPG3M8QDJX9Y7CJ5ZA (37 chars)                     │
│  • 新: g01HV6BGKCPG3M8QDJX9Y7CJ5ZA          (27 chars)                     │
│  • 节省: 10 chars/ID = 27% 带宽节省                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 类型前缀定义

| 前缀 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `g` | Guest | 游客账号 | `g01HV6BGKCPG3M8QDJX9Y7CJ5ZA` |
| `r` | Registered | 正式注册账号 | `r01HV6BGKCPG3M8QDJX9Y7CJ5ZB` |
| `s` | System | 系统账号（自动化任务） | `s01HV6BGKCPG3M8QDJX9Y7CJ5ZC` |
| `d` | Deleted | 已注销账号（预留） | `d01HV6BGKCPG3M8QDJX9Y7CJ5ZD` |

### 2.3 ID 验证正则

### 2.4 容量规划

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Capacity Analysis                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ULID 容量:                                                                 │
│  • 时间戳: 48 bits = 可用至 10889 年                                       │
│  • 随机数: 80 bits = 每毫秒 1.21 × 10^24 个唯一ID                          │
│                                                                              │
│  10年用户增长预估:                                                          │
│  ────────────────────────────────────────────────────────────────────────   │
│  Year 1:   1M 用户    → ULID 完全满足                                      │
│  Year 5:   100M 用户  → ULID 完全满足                                      │
│  Year 10:  1B 用户    → ULID 完全满足                                      │
│                                                                              │
│  带宽节省估算 (按日活 100K, 每用户 50 次 API 调用):                        │
│  • 旧方案: 37 chars × 50 × 100K = 185 MB/天                                │
│  • 新方案: 27 chars × 50 × 100K = 135 MB/天                                │
│  • 节省: 50 MB/天 = 27%                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 全链路追踪设计

### 3.1 账号ID作为统一标识

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Account ID: Cross-System Correlation                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           Account ID: r01HV6BGK...                          │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         │                          │                          │             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐       │
│  │   Client    │           │   Backend   │           │  Dashboard  │       │
│  │    Logs     │           │    Logs     │           │   Queries   │       │
│  │             │           │             │           │             │       │
│  │ • Sentry    │           │ • API Logs  │           │ • 账单      │       │
│  │ • Analytics │           │ • Error Log │           │ • 阅读时长  │       │
│  │ • Crashlytics│          │ • Audit Log │           │ • 反馈建议  │       │
│  └─────────────┘           └─────────────┘           │ • 阅读数据  │       │
│                                                       │ • 书籍列表  │       │
│                                                       └─────────────┘       │
│                                                                              │
│  搜索示例:                                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Sentry:    account_id:r01HV6BGKCPG3M8QDJX9Y7CJ5ZB                       │
│  • ELK:       accountId:"r01HV6BGKCPG3M8QDJX9Y7CJ5ZB"                      │
│  • Dashboard: /admin/users/r01HV6BGKCPG3M8QDJX9Y7CJ5ZB                     │
│  • SQL:       WHERE account_id = 'r01HV6BGKCPG3M8QDJX9Y7CJ5ZB'             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 日志格式规范

### 3.3 Sentry 集成

### 3.4 Dashboard 数据关联

---

## 4. ID 生成服务

### 4.1 TypeScript 实现

### 4.2 iOS Swift 实现

---

## 5. 账号注销设计

### 5.1 注销流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Account Deletion Flow                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   用户请求注销                                                               │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────┐                                                           │
│   │ 身份验证    │  重新登录验证身份                                          │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │ 冷静期确认  │  告知 30 天冷静期，可撤销                                  │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐     ┌─────────────────────────────────────────┐          │
│   │ 立即执行    │────►│ 1. 状态改为 PENDING_DELETION             │          │
│   │ (软删除)    │     │ 2. 清除敏感数据（密码、Token）           │          │
│   └──────┬──────┘     │ 3. 发送确认邮件                          │          │
│          │            │ 4. 记录注销日志                          │          │
│          │            └─────────────────────────────────────────┘          │
│          ▼                                                                   │
│   ┌─────────────┐                                                           │
│   │ 30天冷静期  │  用户可随时取消注销，恢复账号                              │
│   └──────┬──────┘                                                           │
│          │                                                                   │
│          ▼                                                                   │
│   ┌─────────────┐     ┌─────────────────────────────────────────┐          │
│   │ 定时任务    │────►│ 1. 状态改为 DELETED                       │          │
│   │ (硬删除)    │     │ 2. ID前缀改为 d (dxxx)                   │          │
│   └─────────────┘     │ 3. 删除个人数据 (GDPR)                   │          │
│                       │ 4. 保留匿名化统计数据                     │          │
│                       │ 5. 保留交易记录 (法规要求)                │          │
│                       └─────────────────────────────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 数据处理策略

### 5.3 注销 API

### 5.4 Prisma Schema 更新

---

## 6. 数据库设计

### 6.1 Schema 更新

### 6.2 查询优化

---

## 7. 账号升级流程

### 7.1 游客升级为正式账号

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Guest to Registered Upgrade                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  原账号: g01HV6BGKCPG3M8QDJX9Y7CJ5ZA (游客)                                 │
│                     │                                                        │
│                     │ 绑定 Apple ID / Google / 手机号                        │
│                     ▼                                                        │
│  新账号: r01HV6BGKF5N6P7QRSTUVWX8YZA (正式)                                 │
│                                                                              │
│  处理流程:                                                                   │
│  1. 生成新的正式账号ID (rxxx)                                               │
│  2. 迁移游客数据到新账号                                                    │
│  3. 游客账号状态改为 MERGED                                                 │
│  4. 建立 AccountBinding 关联记录                                            │
│                                                                              │
│  为什么不复用ID?                                                            │
│  • 通过ID即可永久区分账号来源（游客转化 vs 直接注册）                        │
│  • 便于分析用户转化漏斗                                                     │
│  • 保留完整审计轨迹                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. API 请求规范

### 8.1 请求头

### 8.2 JWT Token

---

## 9. 监控与运维

### 9.1 关键指标

### 9.2 日志搜索示例

---

## 10. 实施计划

### Phase 1: ID 格式实现 (优先级: 高)

- [ ] 实现 AccountIdService (BE + iOS)
- [ ] 更新账号创建流程
- [ ] 添加 ID 验证中间件

### Phase 2: 全链路追踪 (优先级: 高)

- [ ] 统一日志格式，必须包含 accountId
- [ ] 配置 Sentry 关联账号ID
- [ ] Dashboard 查询接口实现

### Phase 3: 账号注销 (优先级: 中)

- [ ] 注销 API 实现
- [ ] 冷静期定时任务
- [ ] GDPR 数据删除逻辑

---

## 11. 附录

### A. ID 示例

```
游客账号:    g01HV6BGKCPG3M8QDJX9Y7CJ5ZA
正式账号:    r01HV6BGKCPG3M8QDJX9Y7CJ5ZB
系统账号:    s01HV6BGKCPG3M8QDJX9Y7CJ5ZC
已删除账号:  d01HV6BGKCPG3M8QDJX9Y7CJ5ZD
```

### B. 带宽节省对比

| 方案 | ID长度 | 示例 | 节省 |
|------|--------|------|------|
| 旧方案 | 37 chars | `usr_guest_01HV6BGKCPG3M8...` | - |
| 新方案 | 27 chars | `g01HV6BGKCPG3M8...` | 27% |

---

**Document Status**: Ready for Review
**Next Steps**: 请 review 后提出修改意见

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 已规划 | 20% | 2025-12-23 | 设计文档完成，代码实现待开发 |
| v1.1 | 🚧 实施中 | 60% | 2025-12-27 | AccountIdService 已实现，Schema 已更新 |
| v1.2 | ✅ Phase 2-3 完成 | 85% | 2025-12-27 | 全链路追踪 + 账号注销 API 完成 |
| v1.3 | 🚧 Phase 4 实施中 | 92% | 2025-12-28 | Phase 4.1-4.2 完成 |
| v1.4 | ✅ Phase 4 脚本完成 | 100% | 2025-12-28 | Phase 4.1-4.4 脚本全部完成，待数据库执行 |

### 已完成 ✅
- [x] Account ID 格式设计（前缀 + ULID）
- [x] ID 类型前缀定义（g/r/s/d）
- [x] ULID 生成策略设计
- [x] 全链路追踪设计
- [x] 账号注销流程设计
- [x] 日志格式规范
- [x] 监控指标设计
- [x] **实现 AccountIdService (Backend)** - `src/common/services/account-id.service.ts`
  - [x] ID生成函数（generateGuestId, generateRegisteredId, generateSystemId）
  - [x] ID验证函数（isValidId）
  - [x] 类型解析函数（parseId, getType）
  - [x] 类型判断函数（isGuest, isRegistered, isSystem, isDeleted）
  - [x] 时间戳提取（getCreatedAt）
  - [x] 已注销标记（markAsDeleted）
- [x] **实现 AccountIdService (iOS)** - `ios/Readmigo/Core/Services/AccountIdService.swift`
  - [x] Swift版本的ID验证
  - [x] ID显示格式化
  - [x] ULID生成与解码
- [x] **更新 Prisma Schema** - `packages/database/prisma/schema.prisma`
  - [x] 添加 AccountStatus 枚举（ACTIVE, SUSPENDED, MERGED, PENDING_DELETION, DELETED）
  - [x] 添加 DeletionAction 枚举
  - [x] 添加 AccountDeletionLog 模型
  - [x] User 模型添加 status, scheduledDeletionAt, deletedAt, deletionReason 字段
- [x] **集成 AccountIdService 到 UsersService**
  - [x] 添加账号类型检查方法（isGuestAccount, isRegisteredAccount）
  - [x] 添加账号ID生成方法（generateGuestAccountId, generateRegisteredAccountId）
- [x] **Phase 2: 全链路追踪**
  - [x] 统一日志格式 - RuntimeLog 支持 accountId
  - [x] 配置 Sentry 关联 accountId - `SentryService.setAccountContext()`
  - [x] LogsService 支持 accountId 追踪
- [x] **Phase 3: 账号注销 API**
  - [x] 注销 API 实现 - `src/modules/users/users.controller.ts`
    - [x] POST /users/me/deletion（发起注销 - 30天冷静期）
    - [x] DELETE /users/me/deletion（取消注销）
    - [x] GET /users/me/deletion/status（查询注销状态）
  - [x] 冷静期定时任务 - `@Cron(EVERY_DAY_AT_2AM)`
    - [x] 每日凌晨2点检查 scheduledDeletionAt
    - [x] 自动执行到期账号的永久删除
  - [x] GDPR 数据删除逻辑 - `permanentlyDeleteAccount()`
    - [x] 删除用户所有关联数据
    - [x] 匿名化用户信息
    - [x] 记录删除审计日志

### 进行中 🚧
- [ ] 无

### 待开发 📝

**Phase 4: 数据迁移 (UUID → 新 ID 格式)**

详见下方《Phase 4 数据迁移设计》章节

### 依赖项
- ✅ Account 模型已存在
- ✅ ULID 库已安装 (`ulid@3.0.2`)
- ✅ AccountIdService 已实现（Backend + iOS）
- ✅ Prisma Schema 已更新
- ✅ Sentry 配置已完成 - `SentryService.setAccountContext()`
- ✅ RuntimeLog 日志系统已集成
- 📝 需要 Dashboard 管理界面

### 技术债务
- [x] ~~缺少 ID 格式性能测试~~ ✅ 2025-12-28 已完成
- 缺少大规模数据下的查询性能测试
- [x] ~~缺少账号注销的E2E测试~~ ✅ 2025-12-28 已完成
- [x] ~~日志搜索功能需要优化（建立索引）~~ ✅ 2025-12-28 GIN索引已添加
- 🚧 数据库迁移: Phase 4 实施中

---

## Phase 4: 数据迁移设计 (UUID → 新 ID 格式)

> **Status**: 🚧 实施中 (Phase 4.1 完成, Phase 4.2 进行中)
> **Priority**: 中（当前系统正常运行，但新格式有长期收益）
> **Risk Level**: 高（涉及主键变更）
> **Updated**: 2025-12-28

### 12.1 背景与目标

#### 当前状态
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Current State                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Database:                                                                   │
│  • User.id: UUID 格式 (36 chars)                                            │
│  • 示例: "550e8400-e29b-41d4-a716-446655440000"                             │
│                                                                              │
│  问题:                                                                       │
│  • 无法从 ID 判断账号类型（需查库）                                          │
│  • 无法从 ID 获取创建时间                                                    │
│  • 带宽占用相对较高                                                          │
│  • 日志搜索时无法直接识别账号类型                                            │
│                                                                              │
│  目标状态:                                                                   │
│  • User.id: 新格式 (27 chars)                                               │
│  • 示例: "g01HV6BGKCPG3M8QDJX9Y7CJ5ZA" (游客)                               │
│  • 示例: "r01HV6BGKCPG3M8QDJX9Y7CJ5ZB" (正式)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 迁移收益
| 收益 | 说明 |
|------|------|
| **类型可识别** | 从 ID 首字符即可判断账号类型 |
| **时间可提取** | ULID 内含时间戳，可提取创建时间 |
| **带宽节省** | 27 chars vs 36 chars = 25% 节省 |
| **日志友好** | 搜索 `g*` 即可找所有游客 |

### 12.2 迁移策略评估

#### 方案对比

| 方案 | 停机时间 | 复杂度 | 数据一致性 | 回滚难度 | 推荐度 |
|------|----------|--------|------------|----------|--------|
| **方案A: 双写+渐进迁移** | 无 | 高 | 高 | 中 | ⭐⭐⭐⭐ |
| **方案B: 维护窗口批量迁移** | 1-4小时 | 中 | 高 | 低 | ⭐⭐⭐ |
| **方案C: 保留双ID字段** | 无 | 低 | 中 | 高 | ⭐⭐ |

#### 推荐方案: A - 双写+渐进迁移

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    方案A: 双写+渐进迁移                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  阶段1: 准备 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 添加 newAccountId 字段（允许 NULL）                                │    │
│  │ • 为现有用户生成新ID并填充 newAccountId                              │    │
│  │ • 建立 oldId → newId 映射表                                          │    │
│  │ • 添加 newAccountId 索引                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段2: 双写 (2周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 所有写入同时更新 id 和 newAccountId                                 │    │
│  │ • API 同时支持新旧 ID 查询                                           │    │
│  │ • 监控新ID使用率                                                      │    │
│  │ • 更新客户端逐步使用新ID                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段3: 切换 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 将 newAccountId 设为主键                                           │    │
│  │ • 保留 legacyUuid 字段用于历史关联                                   │    │
│  │ • 更新所有外键引用                                                    │    │
│  │ • 删除 newAccountId 字段（合并到 id）                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  阶段4: 清理 (1周)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ • 移除对旧ID的支持                                                    │    │
│  │ • 删除 legacyUuid 字段                                                │    │
│  │ • 清理映射表                                                          │    │
│  │ • 更新文档                                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.3 详细迁移步骤

#### 阶段1: 准备阶段

#### 阶段2: 双写阶段

#### 阶段3: 切换阶段

#### 阶段4: 清理阶段

### 12.4 影响范围

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Impact Analysis                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  数据库表（需要更新外键）:                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • UserBook (user_id)                                                        │
│  • UserVocabulary (user_id)                                                  │
│  • DailyStats (user_id)                                                      │
│  • ReadingSession (user_id)                                                  │
│  • AIInteraction (user_id)                                                   │
│  • Subscription (user_id)                                                    │
│  • Device (user_id)                                                          │
│  • AuthorChatSession (user_id)                                              │
│  • AnnualReport (user_id)                                                    │
│  • UserHighlight (user_id)                                                   │
│  • ShareLog (user_id)                                                        │
│  • AccountDeletionLog (user_id)                                              │
│  • RefreshToken (user_id)                                                    │
│  • ErrorLog (user_id)                                                        │
│  • RuntimeLog (user_id)                                                      │
│  • CrashReport (user_id)                                                     │
│                                                                              │
│  代码变更:                                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Backend: JWT payload.sub 格式变更                                         │
│  • iOS: Keychain 存储的 accountId 格式变更                                   │
│  • Web: localStorage 存储的 accountId 格式变更                               │
│  • API 响应中 id 字段格式变更                                                │
│                                                                              │
│  第三方服务:                                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Sentry: user.id 格式变更                                                  │
│  • RevenueCat: app_user_id 格式变更                                          │
│  • Analytics: user_id 格式变更                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.5 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **外键更新失败** | 数据不一致 | 事务包裹，失败回滚 |
| **客户端缓存旧ID** | 认证失败 | 双ID支持期2周 |
| **第三方服务关联断裂** | 数据丢失 | 保留 legacy_uuid 映射 |
| **迁移耗时过长** | 性能影响 | 分批次执行，低峰期 |
| **回滚困难** | 业务中断 | 保留完整映射表 |

### 12.6 迁移时间表

| 阶段 | 时间 | 里程碑 | 负责人 |
|------|------|--------|--------|
| **准备** | Week 1 | Schema 变更，生成新ID | Backend |
| **双写** | Week 2-3 | API 双ID支持，客户端更新 | Full Stack |
| **切换** | Week 4 | 主键切换，外键更新 | Backend + DBA |
| **清理** | Week 5 | 移除旧代码，清理映射表 | Backend |
| **监控** | Week 6+ | 持续监控，处理遗留问题 | SRE |

### 12.7 回滚计划

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Rollback Strategy                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  如果迁移失败，按以下步骤回滚:                                               │
│                                                                              │
│  1. 阶段1-2 回滚（低风险）:                                                  │
│     • 直接忽略 newAccountId 字段                                             │
│     • 删除 newAccountId 列                                                   │
│     • 删除 AccountIdMapping 表                                               │
│                                                                              │
│  2. 阶段3 回滚（需要停机）:                                                  │
│     • 使用 AccountIdMapping 恢复原 id                                       │
│     • 回滚 schema 变更                                                       │
│     • 恢复外键引用                                                           │
│                                                                              │
│  3. 阶段4 无法回滚:                                                          │
│     • 确保阶段4清理前经过充分验证                                            │
│     • 至少保留映射表30天                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.8 执行前 Checklist

- [ ] 完整数据库备份
- [ ] 验证 AccountIdMapping 表数据完整
- [ ] 客户端发布新版本支持双ID
- [ ] 第三方服务迁移计划确认
- [ ] 监控告警配置
- [ ] 回滚脚本测试通过
- [ ] 维护窗口通知用户
- [ ] DBA review 迁移 SQL

---

### 12.9 实施进度

| 阶段 | 状态 | 完成日期 | 说明 |
|------|------|----------|------|
| **Phase 4.1 准备阶段** | ✅ 完成 | 2025-12-28 | Schema 变更 + 迁移脚本已创建 |
| **Phase 4.2 双写阶段** | ✅ 完成 | 2025-12-28 | API 支持新旧 ID 查询 |
| **Phase 4.3 切换阶段** | ✅ 脚本完成 | 2025-12-28 | 主键切换，外键更新 (待执行) |
| **Phase 4.4 清理阶段** | ✅ 脚本完成 | 2025-12-28 | 移除旧代码，清理映射表 (待执行) |

#### Phase 4.1 完成项
- [x] Prisma Schema: 添加 `newAccountId` 字段到 User 模型
- [x] Prisma Schema: 添加 `AccountIdMapping` 模型
- [x] SQL Migration: `20251228120000_phase4_new_account_id`
- [x] 数据迁移脚本: `apps/backend/scripts/migrate-account-ids.ts`

#### Phase 4.2 完成项
- [x] `UsersService.findById()` - 支持新旧ID格式查询
- [x] `UsersService.create()` - 创建用户时同时生成 newAccountId
- [x] `UsersService.createGuest()` - 创建游客时同时生成 newAccountId
- [x] `UsersService.upgradeToRegistered()` - 升级时生成新的正式账号ID
- [x] `UsersService.getProfile()` - 返回 accountId 和 legacyId
- [x] `UsersService.getNewAccountId()` - ID格式转换辅助方法
- [x] `UsersService.getLegacyUuid()` - ID格式转换辅助方法
- [x] `UsersService.resolveUserId()` - 通用ID解析方法
- [x] `GET /users/me/account-id` - 新增API端点获取双格式ID

#### Phase 4.3 完成项 (脚本已创建，待执行)
- [x] 预迁移验证脚本: `apps/backend/scripts/phase4-3-pre-migration.ts`
  - 验证所有用户已有 newAccountId
  - 验证 AccountIdMapping 表数据完整
  - 检查孤儿记录和重复ID
  - 可选自动修复 (--fix)
- [x] SQL迁移脚本: `20251228130000_phase4_3_primary_key_switch`
  - 添加新列到所有关联表
  - 填充新ID值
  - 切换主键约束
  - 更新所有外键
  - 保留 legacy_uuid 用于回滚
- [x] 回滚脚本: `apps/backend/scripts/phase4-3-rollback.sql`
  - 完整恢复到 Phase 4.2 状态
- [x] Prisma Schema 参考: `schema.phase4.3.prisma`

**执行 Phase 4.3 的步骤:**
1. 运行预迁移验证: `npx ts-node scripts/phase4-3-pre-migration.ts`
2. 备份数据库
3. 进入维护模式
4. 运行迁移: `pnpm prisma migrate deploy`
5. 更新 Prisma Schema 为新格式
6. 运行 `pnpm prisma generate`
7. 验证应用正常
8. 退出维护模式

---

#### Phase 4.4 完成项 (脚本已创建，待执行)
- [x] SQL清理迁移: `20251228140000_phase4_4_cleanup`
  - 删除所有 legacy_uuid 相关列
  - 删除 AccountIdMapping 表
  - 验证清理完成
- [x] 最终 Prisma Schema 参考: `schema.phase4.4.final.prisma`
- [x] 清理后的 UsersService 参考: `users.service.phase4.4.ts`
  - 移除双ID支持代码
  - 简化 findById（只使用新格式）
  - 移除 getNewAccountId/getLegacyUuid 方法
  - 移除 resolveUserId 方法

**执行 Phase 4.4 的步骤:**
1. 确保 Phase 4.3 已成功执行并验证2周无问题
2. 备份数据库
3. 进入维护模式
4. 运行迁移: `pnpm prisma migrate deploy`
5. 使用 `schema.phase4.4.final.prisma` 更新 Prisma Schema
6. 使用 `users.service.phase4.4.ts` 更新 UsersService
7. 移除 `GET /users/me/account-id` 端点中的 legacyId 字段
8. 运行 `pnpm prisma generate`
9. 验证应用正常
10. 退出维护模式

---

**Phase 4 Status**: ✅ 脚本完成 (Phase 4.1-4.4 脚本全部完成，待数据库执行)
