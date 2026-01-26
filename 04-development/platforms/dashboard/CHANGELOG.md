# Dashboard 运营数据需求变更日志

## [v1.2] - 2026-01-11

### 重大变更 🔄

#### 4.4 订阅转化与收入分析 - 重写以匹配订阅制业务模式

**问题**: 原 4.4 节"付费转化与收入分析"基于单次付费模型设计，与项目实际的订阅制（月度/季度/年度会员）不符。

**解决方案**: 完全重写该节，聚焦订阅制 SaaS 指标体系。

**变更内容**:

1. **标题变更**
   - 旧: "付费转化与收入分析"
   - 新: "订阅转化与收入分析"

2. **核心指标体系重构**（4.4.2）
   - 移除: ARPU/ARPPU/单次付费相关指标
   - 新增: MRR/ARR/流失率/续费率/LTV/CAC/Quick Ratio 等 25+ 个订阅制指标
   - 详细说明各指标的健康标准和业务意义

3. **页面设计更新**（4.4.3）
   - 新增: MRR 趋势堆叠面积图（显示新增/扩展/流失/净增 MRR）
   - 新增: 订阅类型分布（月度/季度/年度/试用）
   - 新增: 订阅健康度指标表格
   - 新增: LTV 分析卡片组
   - 调整: 转化漏斗改为订阅转化流程（注册→试用→付费）

4. **API 设计重构**（4.4.4）
   - 重新设计 7 个 API 接口，完全聚焦订阅制指标：
     - `/subscription/overview` - 订阅概览
     - `/subscription/mrr-trend` - MRR 趋势
     - `/subscription/plan-distribution` - 订阅类型分布
     - `/subscription/conversion-funnel` - 订阅转化漏斗
     - `/subscription/health-metrics` - 订阅健康度指标
     - `/subscription/activity` - 订阅动态
     - `/subscription/ltv-analysis` - LTV 分析

5. **数据库查询完全重写**（4.4.5，原为 4.4.4）
   - 修复: 章节编号从重复的 4.4.4 改为 4.4.5
   - 新增 6 个复杂 SQL 查询：
     1. 计算 MRR（月度经常性收入）
     2. 计算 MRR 变化（新增/流失/扩展/降级）
     3. 计算流失率和续费率
     4. 订阅转化漏斗查询
     5. LTV（用户生命周期价值）计算
     6. 订阅健康度指标查询（Quick Ratio/Net MRR Retention/健康度评分）
   - 所有查询基于 `subscriptions` 表，正确处理 MONTHLY/QUARTERLY/YEARLY 三种订阅类型

6. **新增性能优化章节**（4.4.6）
   - 8 个索引设计（覆盖 status/period/plan_type 等关键字段）
   - 缓存策略（5-60 分钟分级缓存）
   - 可选的 `subscription_daily_stats` 预计算表设计
   - 定时任务计划

7. **新增实施计划章节**（4.4.7）
   - 3 天实施计划（数据库准备 → 后端开发 → 前端开发）
   - 详细的任务清单（checkbox 格式）

**技术亮点**:
- 完整的订阅制 SaaS 指标体系（符合行业标准）
- 复杂的 MRR 计算逻辑（支持新增/流失/扩展/降级四种变化）
- 健康度评分算法（Quick Ratio、Churn Rate、Net MRR Retention、LTV/CAC 四维度综合评分）
- 生产级 SQL 查询（使用 CTE、窗口函数、复杂 JOIN）

**影响范围**:
- 文档: `operations-data-requirements.md` 第 4.4 节（约 450 行）
- 后端: 需新增 `SubscriptionAnalyticsService` 和 7 个 API 接口
- 前端: 需新增 `/subscription-analytics` 页面和多个图表组件
- 数据库: 需创建 8 个索引，可选创建预计算表

---

## [v1.1] - 2026-01-11

### 新增 ✨

#### 用户画像统计功能（P0 优先级）

**背景**: 为支持精准运营和市场分析，新增用户性别、年龄、地区统计功能。

**包含内容**:

1. **数据库字段**
   - 在 User 表新增字段：
     - `gender`: 性别（枚举：MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY/UNKNOWN）
     - `birthDate`: 出生日期
     - `country`: 国家
     - `region`: 省份/州
     - `city`: 城市
     - `timezone`: 时区
     - `profileSource`: 数据来源（USER_INPUT/DEVICE/INFERRED）
     - `profileConsent`: 用户同意使用画像数据
   - 新增枚举类型：Gender
   - 新增统计表：user_demographics_stats（预计算）

2. **API 接口**（5个）
   - `GET /api/v1/admin/demographics/overview` - 用户画像概览
   - `GET /api/v1/admin/demographics/gender` - 性别分析
   - `GET /api/v1/admin/demographics/age` - 年龄分析
   - `GET /api/v1/admin/demographics/location` - 地区分析
   - `GET /api/v1/admin/demographics/cross-analysis` - 交叉分析

3. **Dashboard 页面**
   - 新增页面：`/user-demographics`
   - 组件：
     - 性别分布饼图
     - 年龄段分布柱状图
     - 地区分布地图/表格
     - 性别×年龄交叉分析
     - 各维度付费率和阅读偏好分析

4. **数据指标**
   - **性别维度**: 分布、活跃度、付费率、阅读偏好
   - **年龄维度**: 6个年龄段分布、活跃度、付费率、阅读偏好
   - **地区维度**: 国家/省份/城市分布、活跃度、付费率

5. **技术亮点**
   - 完整的 SQL 查询示例（4个复杂查询）
   - 性能优化：7个索引 + 预计算 + 缓存策略
   - 隐私合规：GDPR、数据安全、用户同意机制
   - 数据推断：支持通过设备/行为推断用户画像

**实施计划**: 6个工作日
- Day 1: 数据库准备
- Day 2-3: 后端开发
- Day 4-5: 前端开发
- Day 6: 测试与发布

**相关文档**:
- [4.5 用户画像统计](./operations-data-requirements.md#45-用户画像统计)
- [数据库迁移文件](./migrations/add-user-demographics-fields.sql)

### 变更 📝

#### P0 优先级调整
- **总工期**: 3周 → **4周**（新增用户画像统计需要 6 天）
- **新增第5项**: 用户画像统计

**更新后的 P0 优先级**:
1. ✅ 基础运营数据（已有）
2. 🔥 阅读时长分析（5天）
3. 📊 留存率分析（4天）
4. 💰 付费转化分析（3天）
5. 🎯 **用户画像统计（6天）** ← 新增
6. 集成与发布（2天）

#### 技术架构更新
- **后端**: 新增 `demographics` 模块
- **前端**: 新增 `demographics` 页面和 4个组件
- **数据库**: 新增 8个字段 + 1个枚举 + 1个统计表

#### 数据源更新
- `users` 表：新增画像字段
- `user_demographics_stats` 表：预计算数据

---

## [v1.0] - 2026-01-11

### 初始版本 🎉

完成 P0 优先级详细设计：
1. ✅ 基础运营数据（已实现）
2. 阅读时长分析（4个维度）
3. 留存率分析
4. 付费转化与收入分析

**文档结构**:
- `operations-data-requirements.md` - P0 详细实现方案
- `operations-data-overview.md` - 全局数据需求概览
- `operations-README.md` - 文档索引导航

---

## 待办事项 📋

### P0 实施（4周）
- [ ] 阶段1: 阅读时长分析（5天）
- [ ] 阶段2: 留存率分析（4天）
- [ ] 阶段3: 付费转化分析（3天）
- [ ] 阶段4: 用户画像统计（6天）
- [ ] 阶段5: 集成与发布（2天）

### P1 规划（待细化）
- [ ] 用户分层管理
- [ ] 内容完成率分析
- [ ] 功能使用率统计
- [ ] 渠道效果分析

### P2 规划（待细化）
- [ ] 推荐效果分析
- [ ] 运营活动追踪
- [ ] A/B测试结果
- [ ] 用户反馈趋势

---

## 文档索引

- 📖 [文档导航](./operations-README.md)
- 🔥 [P0 详细方案](./operations-data-requirements.md)
- 📊 [全局概览](./operations-data-overview.md)
- 🗄️ [数据库迁移](./migrations/)
