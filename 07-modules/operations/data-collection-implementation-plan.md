# 运营数据收集实现方案

## 概述

本文档详细说明如何实现运营监控所需的数据收集功能，重点解决以下两个关键缺失：

1. **用户活跃时间追踪** (`lastActiveAt`) - 支持 DAU/MAU/留存分析
2. **用户画像数据收集** (性别/年龄/地理位置) - 支持 Demographics 分析

**预计总工期：** 10-12 天
**优先级：** P0（紧急）
**影响范围：** 后端 + iOS + Web + React Native + Android

---

## 目录

- [一、问题分析](#一问题分析)
- [二、解决方案架构](#二解决方案架构)
- [三、后端实现](#三后端实现)
- [四、iOS 客户端实现](#四ios-客户端实现)
- [五、Web 客户端实现](#五web-客户端实现)
- [六、React Native 客户端实现](#六react-native-客户端实现)
- [七、Android 客户端实现](#七android-客户端实现)
- [八、数据库优化](#八数据库优化)
- [九、测试方案](#九测试方案)
- [十、部署计划](#十部署计划)
- [十一、监控与验证](#十一监控与验证)

---

## 一、问题分析

### 1.1 当前状态

| 数据类型 | 数据库表 | 后端API | iOS | Web | RN | Android | 影响 |
|---------|---------|---------|-----|-----|----|---------|----- |
| 阅读会话 | ✅ reading_sessions | ✅ | ✅ | ✅ | 🟡 | ❓ | - |
| 用户活跃时间 | ✅ users.last_active_at | 🟡 方法存在 | ❌ | ❌ | ❌ | ❌ | ❗ DAU/MAU 不准确 |
| 用户画像 | ✅ user_profiles | ❌ | ❌ | ❌ | ❌ | ❌ | ❗ Demographics 无数据 |

### 1.2 影响评估

**用户活跃时间缺失的影响：**
- ❌ Operations Overview 的 DAU/MAU 统计不准确
- ❌ Retention Analysis 的留存率计算有偏差
- ❌ 无法识别"僵尸用户"和"活跃用户"
- ❌ 运营活动效果无法精准评估

**用户画像数据缺失的影响：**
- ❌ Demographics 页面完全无数据
- ❌ 无法进行用户分层和精准营销
- ❌ 内容推荐缺少用户特征支持
- ❌ 商业化策略缺少数据支撑

### 1.3 数据收集原则

1. **隐私优先** - 所有数据收集需用户明确同意
2. **最小化原则** - 只收集必要的数据
3. **透明度** - 明确告知用户数据用途
4. **可选性** - 用户可以选择不提供某些信息
5. **安全性** - 数据传输和存储加密

---

## 二、解决方案架构

### 2.1 整体数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据收集架构图                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  客户端层                     API层                数据层        │
│  ─────────                   ─────                ─────        │
│                                                                 │
│  ┌──────────┐                                                   │
│  │ iOS App  │─┐                                                 │
│  └──────────┘ │                                                 │
│  ┌──────────┐ │            ┌──────────────┐                    │
│  │ Web App  │─┼──────────► │ Activity API │──────┐            │
│  └──────────┘ │            └──────────────┘      │            │
│  ┌──────────┐ │               (每5分钟/          │            │
│  │ RN App   │─┤                前台事件)         │            │
│  └──────────┘ │                                   ▼            │
│  ┌──────────┐ │                            ┌──────────────┐    │
│  │ Android  │─┘                            │   users      │    │
│  └──────────┘                              │ .last_active │    │
│                                            └──────────────┘    │
│       │                                                        │
│       │ (用户主动填写)                                         │
│       │                                                        │
│       ▼                                                        │
│  ┌──────────┐              ┌──────────────┐                   │
│  │ Settings │──────────────► │ Profile API │──────┐           │
│  │   Form   │              └──────────────┘      │           │
│  └──────────┘                                    ▼           │
│                                            ┌──────────────┐   │
│                                            │user_profiles │   │
│                                            │ • gender     │   │
│                                            │ • birth_year │   │
│                                            │ • country    │   │
│                                            │ • region     │   │
│                                            │ • city       │   │
│                                            └──────────────┘   │
│                                                                │
│  定时任务 (Cron Jobs)                                          │
│  ────────────────────                                         │
│  每日 02:00 AM                                                 │
│      │                                                         │
│      ▼                                                         │
│  ┌──────────────────┐                                         │
│  │ Calculate DAU    │────► operations_daily_stats             │
│  │ Calculate MAU    │────► operations_monthly_stats           │
│  │ Retention Rates  │────► user_retention                     │
│  │ Demographics     │────► (聚合查询)                         │
│  └──────────────────┘                                         │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 技术方案概览

| 组件 | 技术栈 | 关键功能 |
|------|--------|---------|
| **后端API** | NestJS + Prisma | 接收活跃心跳、保存用户画像 |
| **iOS客户端** | Swift + URLSession | 前台事件触发、设置表单 |
| **Web客户端** | React + TanStack Query | 页面活跃检测、设置表单 |
| **RN客户端** | React Native + AppState | 状态变化触发、设置表单 |
| **Android客户端** | Kotlin + Retrofit | 生命周期触发、设置表单 |
| **数据库** | PostgreSQL + 索引优化 | 高效查询活跃用户 |
| **缓存** | Redis | 防抖、降低数据库压力 |

---

## 三、后端实现

### 3.1 API 端点设计

#### 3.1.1 用户活跃时间更新

**端点：** `PATCH /api/v1/users/me/activity`

**请求：**

**响应：**

**实现：**

**Service 优化：**

---

#### 3.1.2 用户画像更新

**端点：** `PATCH /api/v1/users/me/profile`

**请求：**

**响应：**

**DTO 定义：**

**Controller 实现：**

**Service 实现：**

---

#### 3.1.3 获取用户画像

**端点：** `GET /api/v1/users/me/profile`

**响应：**

**实现：**

---

### 3.2 中间件实现（可选，用于自动更新活跃时间）

如果希望在用户访问任何需要认证的端点时自动更新活跃时间，可以使用中间件：

**注册中间件：**

**⚠️ 注意：** 使用中间件会在每次请求时触发更新，但由于有 Redis 防抖（5分钟），实际数据库写入频率是可控的。

---

### 3.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `src/modules/users/users.controller.ts` | API 端点定义 |
| `src/modules/users/users.service.ts` | 业务逻辑实现 |
| `src/modules/users/dto/update-profile.dto.ts` | DTO 定义 |
| `src/common/middleware/activity-tracker.middleware.ts` | 活跃时间中间件（可选） |

---

## 四、iOS 客户端实现

### 4.1 用户活跃时间追踪

#### 4.1.1 API Client 扩展

**文件：** `ios/Readmigo/Network/APIClient.swift`

#### 4.1.2 应用生命周期集成

**文件：** `ios/Readmigo/ReadmigoApp.swift`

#### 4.1.3 定时心跳（可选，用于长时间使用场景）

**文件：** `ios/Readmigo/Services/ActivityTracker.swift`

---

### 4.2 用户画像数据收集

#### 4.2.1 Profile 数据模型

**文件：** `ios/Readmigo/Models/UserProfile.swift`

#### 4.2.2 API Client 扩展

**文件：** `ios/Readmigo/Network/APIClient.swift`

#### 4.2.3 设置页面 - Profile 表单

**文件：** `ios/Readmigo/Features/Settings/ProfileEditView.swift`

#### 4.2.4 集成到设置页面

**文件：** `ios/Readmigo/Features/Settings/SettingsView.swift`

---

### 4.3 本地化支持

**文件：** `ios/Readmigo/Localizable.xcstrings`

---

### 4.4 文件位置总结

| 文件 | 功能 |
|------|------|
| `ios/Readmigo/Network/APIClient.swift` | API 请求方法 |
| `ios/Readmigo/ReadmigoApp.swift` | 应用生命周期集成 |
| `ios/Readmigo/Services/ActivityTracker.swift` | 定时心跳追踪 |
| `ios/Readmigo/Models/UserProfile.swift` | 数据模型定义 |
| `ios/Readmigo/Features/Settings/ProfileEditView.swift` | Profile 编辑表单 |
| `ios/Readmigo/Features/Settings/SettingsView.swift` | 设置页面集成 |
| `ios/Readmigo/Localizable.xcstrings` | 本地化字符串 |

---

## 五、Web 客户端实现

### 5.1 用户活跃时间追踪

#### 5.1.1 API Client 扩展

**文件：** `apps/web/src/lib/api-client.ts`

#### 5.1.2 Activity Tracker Hook

**文件：** `apps/web/src/hooks/useActivityTracker.ts`

#### 5.1.3 集成到根组件

**文件：** `apps/web/src/app/layout.tsx`

---

### 5.2 用户画像数据收集

#### 5.2.1 Profile 表单组件

**文件：** `apps/web/src/features/settings/components/ProfileForm.tsx`

#### 5.2.2 集成到设置页面

**文件：** `apps/web/src/app/settings/profile/page.tsx`

---

### 5.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `apps/web/src/lib/api-client.ts` | API 请求方法 |
| `apps/web/src/hooks/useActivityTracker.ts` | Activity 追踪 Hook |
| `apps/web/src/app/layout.tsx` | 根组件集成 |
| `apps/web/src/features/settings/components/ProfileForm.tsx` | Profile 表单组件 |
| `apps/web/src/app/settings/profile/page.tsx` | Profile 页面路由 |

---

## 六、React Native 客户端实现

### 6.1 用户活跃时间追踪

#### 6.1.1 API Client 扩展

**文件：** `apps/mobile/src/services/api/users.ts`

#### 6.1.2 Activity Tracker Hook

**文件：** `apps/mobile/src/hooks/useActivityTracker.ts`

#### 6.1.3 集成到根组件

**文件：** `apps/mobile/src/app/_layout.tsx`

---

### 6.2 用户画像数据收集

#### 6.2.1 Profile 表单组件

**文件：** `apps/mobile/src/features/settings/screens/ProfileEditScreen.tsx`

#### 6.2.2 集成到设置页面导航

**文件：** `apps/mobile/src/features/settings/screens/SettingsScreen.tsx`

---

### 6.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `apps/mobile/src/services/api/users.ts` | API 请求方法 |
| `apps/mobile/src/hooks/useActivityTracker.ts` | Activity 追踪 Hook |
| `apps/mobile/src/app/_layout.tsx` | 根组件集成 |
| `apps/mobile/src/features/settings/screens/ProfileEditScreen.tsx` | Profile 表单页面 |
| `apps/mobile/src/features/settings/screens/SettingsScreen.tsx` | 设置页面集成 |

---

## 七、Android 客户端实现

### 7.1 用户活跃时间追踪

#### 7.1.1 API Service 扩展

**文件：** `android/app/src/main/java/com/readmigo/data/network/ApiService.kt`

#### 7.1.2 Activity Tracker

**文件：** `android/app/src/main/java/com/readmigo/utils/ActivityTracker.kt`

#### 7.1.3 集成到 Application

**文件：** `android/app/src/main/java/com/readmigo/ReadmigoApplication.kt`

---

### 7.2 用户画像数据收集

#### 7.2.1 Profile ViewModel

**文件：** `android/app/src/main/java/com/readmigo/features/settings/ProfileViewModel.kt`

#### 7.2.2 Profile 编辑界面

**文件：** `android/app/src/main/java/com/readmigo/features/settings/ProfileEditScreen.kt`

---

### 7.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `android/app/src/main/java/com/readmigo/data/network/ApiService.kt` | API 接口定义 |
| `android/app/src/main/java/com/readmigo/utils/ActivityTracker.kt` | Activity 追踪器 |
| `android/app/src/main/java/com/readmigo/ReadmigoApplication.kt` | Application 集成 |
| `android/app/src/main/java/com/readmigo/features/settings/ProfileViewModel.kt` | ViewModel |
| `android/app/src/main/java/com/readmigo/features/settings/ProfileEditScreen.kt` | Profile 编辑界面 |

---

## 八、数据库优化

### 8.1 索引优化

为了支持高效的 DAU/MAU 查询，需要在 `users.last_active_at` 字段上添加索引：

**文件：** `packages/database/prisma/schema.prisma`

**迁移文件：** `packages/database/prisma/migrations/20260112_add_last_active_at_index/migration.sql`

### 8.2 复合索引优化（用于渠道分析）

如果需要按渠道分析活跃用户，可以添加复合索引：

---

## 九、测试方案

### 9.1 后端 API 测试

**文件：** `src/modules/users/__tests__/users.controller.spec.ts`

---

### 9.2 客户端集成测试

#### iOS 测试

**文件：** `ios/ReadmigoTests/ActivityTrackerTests.swift`

---

### 9.3 端到端测试场景

| 测试场景 | 预期结果 |
|---------|---------|
| 用户登录后打开应用 | `lastActiveAt` 更新为当前时间 |
| 应用在前台停留10分钟 | `lastActiveAt` 至少更新2次（5分钟间隔） |
| 应用进入后台再返回前台 | `lastActiveAt` 更新 |
| 用户完善 Profile 并保存 | `user_profiles` 表插入/更新数据 |
| Profile 完成度达到100% | 触发赠送7天会员 |
| 未同意数据收集 | 无法保存 Profile |

---

## 十、部署计划

### 10.1 部署阶段

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| **阶段1** | 后端 API 开发 + 数据库迁移 | 2天 |
| **阶段2** | iOS 客户端实现 | 2天 |
| **阶段3** | Web 客户端实现 | 1天 |
| **阶段4** | React Native 客户端实现 | 1天 |
| **阶段5** | Android 客户端实现 | 2天 |
| **阶段6** | 测试 + Bug 修复 | 2天 |
| **阶段7** | 生产部署 + 监控 | 1天 |

**总计：** 10-12 天

---

### 10.2 部署步骤

#### Step 1: 后端部署

#### Step 2: 客户端部署

**iOS:**

**Web:**

**React Native:**

**Android:**

---

### 10.3 灰度发布策略

| 阶段 | 用户比例 | 监控指标 | 持续时间 |
|------|---------|---------|---------|
| 阶段1 | 5% | 错误率、API 成功率 | 1天 |
| 阶段2 | 25% | DAU 数据准确性 | 2天 |
| 阶段3 | 50% | 用户画像数据收集率 | 2天 |
| 阶段4 | 100% | 全量监控 | - |

**回滚条件：**
- 错误率 > 1%
- API 成功率 < 99%
- 用户投诉激增

---

## 十一、监控与验证

### 11.1 关键监控指标

| 指标 | 数据源 | 阈值 | 告警 |
|------|--------|------|------|
| Activity API 成功率 | Fly.io logs | > 99% | < 99% 告警 |
| Profile API 成功率 | Fly.io logs | > 99% | < 99% 告警 |
| `lastActiveAt` 更新率 | Database | > 90% DAU | < 90% 告警 |
| Profile 完成率 | Database | 逐步提升 | 持续监控 |
| Redis 缓存命中率 | Redis metrics | > 80% | < 80% 告警 |

---

### 11.2 数据验证查询

**验证 lastActiveAt 更新：**

**验证 Profile 数据：**

---

### 11.3 Sentry 监控配置

**后端错误追踪：**

**客户端错误追踪：**

---

## 十二、总结

### 完成后的效果

1. ✅ **DAU/MAU 统计准确** - 每次用户打开应用时更新 lastActiveAt
2. ✅ **用户留存分析可靠** - 基于准确的活跃时间计算留存率
3. ✅ **用户画像数据完整** - 收集性别、年龄、地理位置信息
4. ✅ **Demographics 页面有数据** - 展示用户分布和趋势
5. ✅ **用户激励机制** - 完善 Profile 赠送7天会员

### 关键成功因素

- **Redis 防抖** - 避免频繁更新数据库，降低负载
- **静默失败** - 数据上报失败不影响用户体验
- **隐私保护** - 明确告知用户数据用途，可选退出
- **渐进式发布** - 灰度发布确保稳定性
- **全平台覆盖** - iOS、Web、React Native、Android 全部实现

### 后续优化方向

1. **地理位置自动识别** - 使用 IP 地址自动填充国家/地区
2. **Profile 完成度奖励** - 完善不同字段给予不同奖励
3. **数据分析深化** - 基于用户画像优化推荐算法
4. **A/B 测试** - 测试不同激励方式对完成率的影响

---

**文档版本：** v1.0
**最后更新：** 2026-01-11
**作者：** Readmigo 开发团队
