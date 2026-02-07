# Dashboard 运营数据文档索引

## 文档概览

本目录包含 Readmigo Dashboard 运营数据相关的所有设计文档。

---

## 核心文档

### 1. [运营数据需求文档](./operations-data-requirements.md) 🔥 重点

**用途**: P0优先级详细实现方案
**包含内容**:
- ✅ 阅读时长分析（书籍/用户/分类/时段 4个维度）
  - 完整的页面设计 wireframe
  - 6个 API 接口详细定义
  - SQL 查询示例
  - 性能优化方案
- ✅ 留存率分析（次日/7日/30日留存）
  - 数据库表设计
  - 定时任务计算逻辑
- ✅ 付费转化与收入分析
  - 商业化指标（ARPU/ARPPU/MRR/ARR）
- ✅ 14个工作日实施计划

**状态**: ✅ 已完成，待 review
**优先级**: P0（核心必须）
**预计工期**: 3周

---

### 2. [运营数据概览](./operations-data-overview.md)

**用途**: 全面梳理运营数据需求
**包含内容**:
- 11个数据维度全景图
- P0/P1/P2 优先级规划
- 数据可视化建议
- Dashboard 页面架构建议

**状态**: 参考文档
**优先级**: 全局规划

---

### 3. [运营数据统计系统设计](./operations-analytics-design.md)

**用途**: 已有的运营统计系统架构
**包含内容**:
- 数据采集架构
- 实时/定时聚合策略
- 已实现的指标体系

**状态**: ✅ 已实现（部分）
**关联页面**: `/operations`, `/performance`

---

## 快速导航

### 按功能模块

| 模块 | 文档 | 优先级 | 状态 |
|------|------|-------|------|
| 基础运营数据 | [operations-analytics-design.md](./operations-analytics-design.md) | P0 | ✅ 已实现 |
| **阅读时长分析** | [operations-data-requirements.md#42](./operations-data-requirements.md#42-阅读时长分析核心需求) | **P0** | 📝 待开发 |
| 留存率分析 | [operations-data-requirements.md#43](./operations-data-requirements.md#43-留存率分析) | P0 | 📝 待开发 |
| **订阅转化分析** | [operations-data-requirements.md#44](./operations-data-requirements.md#44-订阅转化与收入分析) | **P0** | 📝 待开发 |
| **用户画像统计** | [operations-data-requirements.md#45](./operations-data-requirements.md#45-用户画像统计) | **P0** | 📝 待开发 |
| 用户分层 | [operations-data-overview.md](./operations-data-overview.md) | P1 | 📋 规划中 |
| 内容完成率 | [operations-data-overview.md](./operations-data-overview.md) | P1 | 📋 规划中 |
| 功能使用率 | [operations-data-overview.md](./operations-data-overview.md) | P1 | 📋 规划中 |
| 渠道分析 | [operations-data-overview.md](./operations-data-overview.md) | P1 | 📋 规划中 |

### 按优先级

#### P0 优先级（核心必须，4周）
1. ✅ 基础运营数据（已实现）
2. 🔥 [阅读时长分析](./operations-data-requirements.md#42-阅读时长分析核心需求)
3. 📊 [留存率分析](./operations-data-requirements.md#43-留存率分析)
4. 💰 [订阅转化分析](./operations-data-requirements.md#44-订阅转化与收入分析)
5. 🎯 [用户画像统计](./operations-data-requirements.md#45-用户画像统计)

#### P1 优先级（重要增强，4周）
详见 [operations-data-overview.md](./operations-data-overview.md)

#### P2 优先级（优化增强，6周）
详见 [operations-data-overview.md](./operations-data-overview.md)

---

## 技术栈

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL (Neon Cloud)
- **ORM**: Prisma
- **缓存**: Redis
- **定时任务**: node-cron

### 前端
- **框架**: React + React Admin
- **图表库**: Recharts
- **UI**: Material-UI
- **状态管理**: React Admin Data Provider

---

## 数据源

### 核心表
- `users` - 用户表（需新增画像字段：gender, birthDate, country, region, city）
- `reading_sessions` - 阅读会话记录
- `user_books` - 用户书籍关系
- `orders` - 订单数据
- `operations_daily_stats` - 每日运营统计（预计算）
- `operations_monthly_stats` - 每月运营统计（预计算）
- `user_retention` - 用户留存数据（待新增）
- `user_demographics_stats` - 用户画像统计（预计算，待新增）

### 数据更新频率
- 实时数据：5分钟缓存
- 当日数据：5分钟缓存
- 历史数据：1小时缓存
- 预计算数据：每日凌晨2-4点更新

---

## 开发流程

### 1. 需求确认
阅读 [operations-data-requirements.md](./operations-data-requirements.md)，确认需求和优先级。

### 5. 测试验证
- 功能测试
- 性能测试（大数据量）
- 数据准确性验证

---

## 性能优化

### 缓存策略
- 使用 Redis 缓存热点查询
- 当日数据：5分钟 TTL
- 历史数据：1小时 TTL

### 预计算
- 定时任务每日计算前一天数据
- 存储到汇总表，降低实时查询压力

---

## 数据可视化

### 图表库
- **Recharts**: 折线图、柱状图、饼图、漏斗图
- **react-calendar-heatmap**: 热力图
- **MUI Table**: 数据表格

---

## 监控告警

### 关键指标告警
- DAU 下降 > 20%
- 付费转化率下降 > 15%
- API 错误率 > 1%
- 查询超时 > 5s

### 告警渠道
- Dashboard 红色标识
- 邮件通知
- 钉钉/飞书（待配置）

---

## 权限管理

| 角色 | 查看权限 | 导出权限 | 说明 |
|------|---------|---------|------|
| SuperAdmin | 所有数据 | ✅ | 超级管理员 |
| Operations | 运营数据 | ✅ | 运营人员 |
| Finance | 付费数据 | ✅ | 财务人员 |
| Support | 基础数据 | ❌ | 客服人员 |

---

## 常见问题

### Q: 为什么阅读时长统计有延迟？
A: 当日数据有5分钟缓存，历史数据通过预计算提升性能。

### Q: 如何导出数据？
A: 点击页面右上角的"导出"按钮，支持导出为 CSV/Excel。

### Q: 数据准确性如何保证？
A: 所有统计基于 `reading_sessions` 表的真实数据，且有自动化测试验证。

### Q: 大数据量下性能如何？
A: 通过索引优化、预计算、缓存等策略，确保查询响应在 500ms 内。

---

## 相关链接

- [Dashboard Platform](./dashboard-platform.md) - Dashboard 整体架构
- [API Design](../../../03-architecture/api/api-design.md) - API 设计规范
- [Database Schema](../../../../packages/database/prisma/schema.prisma) - 数据库设计

---

## 更新日志

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-01-11 | 创建文档索引 | - |
| v1.0 | 2026-01-11 | 完成 P0 优先级详细设计 | - |

---

**下一步行动**: 请 review [operations-data-requirements.md](./operations-data-requirements.md) 中的 P0 优先级设计，确认后即可开始开发。
