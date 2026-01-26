# Readmigo 文档重新组织方案

> 创建日期: 2026-01-07
> 状态: ✅ 已执行（2026-01-08）
> 目标: 按职能和使用场景重新组织文档结构，提高查找效率

---

## 一、当前问题分析

### 1.1 主要问题

| 问题类型 | 描述 | 影响 |
|---------|------|------|
| **文档分散** | 部署相关文档分散在 `deployment/`、`infrastructure/`、`backend/` 等多处 | 查找困难 |
| **重复目录** | `rn/` 和 `react-native/` 同时存在；`release/` 和 `releases/` 功能重叠 | 容易混淆 |
| **职能混杂** | `infrastructure/` 包含了部署、监控、性能等多种类型文档 | 不够聚焦 |
| **缺少分类** | 没有明确区分"开发文档"、"运维文档"、"产品文档" | 角色定位不清 |

### 1.2 具体案例

**案例1: 环境配置文档分散**
```
deployment/environments.md           # 环境概览
infrastructure/environments-overview.md  # 又一个环境概览
infrastructure/be-environment-overview.md  # 后端环境概览
infrastructure/be-environment-configs.md  # 后端环境配置
infrastructure/be-environment-operations.md  # 后端环境操作
infrastructure/be-environment-isolation-design.md  # 后端环境隔离设计
```
→ 6个文档讲同一个主题，应该整合或建立清晰的层级关系

**案例2: 部署文档分散**
```
deployment/environments.md          # 环境信息
backend/services/fly-io.md          # Fly.io 部署
backend/digital-ocean-droplet.md    # Droplet 使用
infrastructure/workers-deployment.md  # Workers 部署
dashboard/deployment.md              # Dashboard 部署
web/deployment-guide.md              # Web 部署
```
→ 部署文档散落在5个不同目录

**案例3: 重复目录**
```
rn/ (13个文件，完整的文档结构)
react-native/ (3个文件，早期规划文档)
```
→ 内容重复，需要合并

---

## 二、整理原则

### 2.1 按使用者角色分组

| 角色 | 目录 | 包含内容 |
|-----|------|---------|
| **产品经理** | `product/` | PRD、roadmap、用户研究 |
| **设计师** | `design/` | 设计系统、交互设计 |
| **后端开发** | `backend/` | API、数据库、服务架构 |
| **前端开发** | `ios/`, `android/`, `web/`, `rn/` | 平台特定开发文档 |
| **运维工程师** | `operations/` | 部署、监控、故障处理 |
| **内容运营** | `content/` | 内容策略、数据源 |

### 2.2 按文档类型分组

| 类型 | 特征 | 示例 |
|-----|------|------|
| **概念设计** | What & Why | 功能设计、系统架构 |
| **操作指南** | How to | 部署步骤、开发setup |
| **参考文档** | Reference | API文档、配置说明 |
| **记录文档** | History | 发布记录、决策记录 |

### 2.3 避免重复和分散

- 一个主题只有一个主文档
- 相关文档建立清晰的层级关系
- 使用 README.md 作为目录索引

---

## 三、新的文档结构

### 3.1 顶层目录规划

```
docs/
├── README.md                    # 总索引
├── QUICK-START.md              # 快速开始
│
├── 01-product/                  # 产品文档
│   ├── README.md
│   ├── prd.md
│   ├── roadmap.md
│   ├── user-research/
│   └── features/                # 功能设计 (来自 features/)
│       ├── README.md
│       ├── social/              # 社交功能
│       │   ├── quotes-system-design.md
│       │   ├── postcards-system-design.md
│       │   └── author-chat-design.md
│       ├── gamification/        # 游戏化
│       │   ├── medal-system-design.md
│       │   └── annual-reading-report-design.md
│       ├── reading-enhancement/ # 阅读增强
│       │   ├── character-relationship-map-design.md
│       │   ├── story-timeline-design.md
│       │   ├── intensive-reading-design.md
│       │   ├── reading-guide-design.md
│       │   └── book-context-module.md
│       ├── account/             # 账号相关
│       │   └── account-membership-relationship.md
│       └── support/             # 客户支持
│           └── customer-support-system-design.md
│
├── 02-design/                   # 设计文档
│   ├── README.md
│   ├── design-system.md
│   └── interaction-design.md
│
├── 03-architecture/             # 架构文档
│   ├── README.md
│   ├── system-architecture.md
│   ├── backend/
│   ├── frontend/
│   └── data/
│
├── 04-development/              # 开发文档
│   ├── README.md
│   ├── backend/                 # 后端开发
│   │   ├── README.md
│   │   ├── api/
│   │   ├── database/
│   │   ├── modules/
│   │   ├── services/
│   │   └── localization/        # 本地化 (来自 features/)
│   │       ├── author-profile-localization.md
│   │       └── instant-bilingual-flow.md
│   ├── platforms/               # 平台开发
│   │   ├── ios/
│   │   │   └── features/        # iOS特定功能 (来自 features/)
│   │   │       ├── author-profile-immersive.md
│   │   │       ├── ios-immersive-navigation-feasibility.md
│   │   │       └── guest-feedback-push-notification.md
│   │   ├── android/
│   │   ├── web/
│   │   ├── rn/                  # React Native (合并 rn/ 和 react-native/)
│   │   └── dashboard/
│   └── shared/                  # 共享组件
│
├── 05-operations/               # 运维文档 (新建)
│   ├── README.md
│   ├── deployment/              # 部署
│   │   ├── README.md
│   │   ├── environments.md      # 环境总览
│   │   ├── services/            # 第三方服务
│   │   │   ├── fly-io.md
│   │   │   ├── droplet.md
│   │   │   ├── neon.md
│   │   │   ├── upstash.md
│   │   │   └── cloudflare.md
│   │   ├── environment-setup/   # 环境搭建
│   │   └── environment-operations/  # 环境操作
│   ├── monitoring/              # 监控
│   │   ├── README.md
│   │   ├── logging.md
│   │   ├── performance.md
│   │   └── alerting.md
│   ├── infrastructure/          # 基础设施
│   │   ├── README.md
│   │   ├── database.md
│   │   ├── storage.md
│   │   ├── cdn.md
│   │   └── network.md
│   └── runbooks/                # 操作手册
│       ├── incident-response.md
│       └── maintenance.md
│
├── 06-content/                  # 内容运营
│   ├── README.md
│   ├── strategy/
│   ├── sources/
│   ├── localization/
│   └── book-readiness-preview.md  # 来自 features/
│
├── 07-modules/                  # 功能模块 (保留，核心模块)
│   ├── README.md
│   ├── reader/
│   ├── audiobook/
│   ├── learning/
│   ├── author/
│   └── ai/
│
├── 08-releases/                 # 发布管理 (合并 release/ + releases/)
│   ├── README.md
│   ├── roadmap/                 # 版本规划
│   │   ├── complete-version-roadmap.md
│   │   ├── v1-release-plan.md
│   │   └── version-roadmap-v3-v5.md
│   ├── history/                 # 发布历史
│   │   └── release-history.md
│   └── notes/                   # 发布说明
│       └── v1.0.0.md
│
├── 09-reference/                # 参考文档
│   ├── legal/                   # 法律文档
│   ├── competitive/             # 竞品分析
│   └── research/                # 技术研究
│       └── story-timeline-non-ai-research.md  # 来自 features/
```

### 3.2 关键变化说明

#### 变化1: 拆分 `features/` 目录 ⭐

**当前状态**: `features/` 包含20个文档，混合了产品设计、技术实现、研究文档

**拆分方案**:

```
features/ (20个文档) → 按性质分配到4个位置：

1. product/features/ (14个产品功能设计)
   ├── social/
   │   ├── quotes-system-design.md
   │   ├── postcards-system-design.md
   │   └── author-chat-design.md
   ├── gamification/
   │   ├── medal-system-design.md
   │   └── annual-reading-report-design.md
   ├── reading-enhancement/
   │   ├── character-relationship-map-design.md
   │   ├── story-timeline-design.md
   │   ├── intensive-reading-design.md
   │   ├── reading-guide-design.md
   │   └── book-context-module.md
   ├── account/
   │   └── account-membership-relationship.md
   └── support/
       └── customer-support-system-design.md

2. development/backend/localization/ (2个本地化文档)
   ├── author-profile-localization.md
   └── instant-bilingual-flow.md

3. development/platforms/ios/features/ (3个iOS特定文档)
   ├── author-profile-immersive.md
   ├── ios-immersive-navigation-feasibility.md
   └── guest-feedback-push-notification.md

4. reference/research/ (1个研究文档)
   └── story-timeline-non-ai-research.md
```

**分类依据**:
- **产品设计** (What & Why) → `product/features/`
- **技术实现** (How) → `development/`
- **研究文档** (Research) → `reference/research/`

#### 变化2: 新建 `operations/` 目录

**目的**: 集中所有运维相关文档

**整合内容**:
```
operations/
├── deployment/                   # 来自 deployment/, infrastructure/, backend/
│   ├── environments.md           ← deployment/environments.md (保留)
│   ├── fly-io.md                 ← backend/services/fly-io.md
│   ├── droplet.md                ← backend/digital-ocean-droplet.md
│   └── ...
├── monitoring/                   # 来自 infrastructure/
│   ├── logging.md                ← infrastructure/logging-and-crash-collection.md
│   ├── performance.md            ← infrastructure/performance-monitoring-design.md
│   └── ...
└── infrastructure/               # 来自 infrastructure/
    ├── database.md               ← backend/database.md + backend/services/neon.md
    ├── storage.md                ← backend/cloudflare-r2.md
    └── ...
```

#### 变化3: 合并 `rn/` 和 `react-native/`

```
# 保留
development/platforms/rn/        ← 来自 rn/

# 合并（仍在维护）
development/platforms/rn/        ← 来自 react-native/ (早期规划文档)
```

#### 变化4: 合并 `release/` 和 `releases/`

```
releases/
├── roadmap/                     ← 来自 release/ (规划文档)
│   ├── complete-version-roadmap.md
│   └── ...
├── history/                     ← 来自 releases/ (历史记录)
│   └── release-history.md
└── notes/                       ← 来自 release/notes/
    └── v1.0.0.md
```

#### 变化5: 整合环境文档

**当前状态**: 6个文档分散在不同位置

**整合后**:
```
operations/deployment/
├── README.md                                # 部署总索引
├── environments.md                          # 环境总览 (主文档)
├── environment-setup/                       # 环境搭建
│   ├── local-setup.md                       ← 整合自多个文档
│   ├── debug-staging-setup.md               ← infrastructure/debug-staging-setup-plan.md
│   └── production-setup.md
└── environment-operations/                  # 环境操作
    ├── data-sync.md                         ← infrastructure/data-sync-and-release-workflow.md
    ├── environment-integrity-check.md       ← pipeline/P003-environment-integrity-check.md
    └── isolation-design.md                  ← infrastructure/be-environment-isolation-design.md
```

#### 变化6: 重组 `backend/` 目录

**当前问题**: `backend/` 既有开发文档又有运维文档

**整合后**:
```
# 开发相关 → development/backend/
development/backend/
├── api/
├── database/                    # 数据库设计
├── modules/
└── services/                    # 后端服务模块

# 运维相关 → operations/
operations/deployment/
└── services/                    # 第三方服务部署
    ├── fly-io.md
    ├── neon.md
    ├── upstash.md
    └── cloudflare.md
```

---

## 四、执行计划

### 阶段1: 创建新目录结构 (1小时)

```bash
# 1. 创建新的顶层目录
mkdir -p docs/05-operations/{deployment,monitoring,infrastructure,runbooks}
mkdir -p docs/05-operations/deployment/{environment-setup,environment-operations,platforms}
mkdir -p docs/08-releases/{roadmap,history,notes}
mkdir -p docs/04-development/{backend,platforms,shared}

# 2. 创建 README.md
touch docs/05-operations/README.md
touch docs/05-operations/deployment/README.md
touch docs/08-releases/README.md
```

### 阶段2: 移动和合并文档 (3-4小时)

#### 2.1 拆分 features/ 目录

```bash
# 创建新的目录结构
mkdir -p docs/01-product/features/{social,gamification,reading-enhancement,account,support}
mkdir -p docs/04-development/backend/localization
mkdir -p docs/04-development/platforms/ios/features
mkdir -p docs/09-reference/research

# 移动产品功能设计文档到 product/features/
mv docs/features/quotes-system-design.md docs/01-product/features/social/
mv docs/features/postcards-system-design.md docs/01-product/features/social/
mv docs/features/author-chat-design.md docs/01-product/features/social/

mv docs/features/medal-system-design.md docs/01-product/features/gamification/
mv docs/features/annual-reading-report-design.md docs/01-product/features/gamification/

mv docs/features/character-relationship-map-design.md docs/01-product/features/reading-enhancement/
mv docs/features/story-timeline-design.md docs/01-product/features/reading-enhancement/
mv docs/features/intensive-reading-design.md docs/01-product/features/reading-enhancement/
mv docs/features/reading-guide-design.md docs/01-product/features/reading-enhancement/
mv docs/features/book-context-module.md docs/01-product/features/reading-enhancement/

mv docs/features/account-membership-relationship.md docs/01-product/features/account/

mv docs/features/customer-support-system-design.md docs/01-product/features/support/

# 移动本地化文档到 backend/localization/
mv docs/features/author-profile-localization.md docs/04-development/backend/localization/
mv docs/features/instant-bilingual-flow.md docs/04-development/backend/localization/

# 移动iOS特定文档到 platforms/ios/features/
mv docs/features/author-profile-immersive.md docs/04-development/platforms/ios/features/
mv docs/features/ios-immersive-navigation-feasibility.md docs/04-development/platforms/ios/features/
mv docs/features/guest-feedback-push-notification.md docs/04-development/platforms/ios/features/

# 移动研究文档到 reference/research/
mv docs/features/story-timeline-non-ai-research.md docs/09-reference/research/

# 移动内容相关文档
mv docs/features/book-readiness-preview.md docs/06-content/

# 移动 README 到 product/features/
mv docs/features/README.md docs/01-product/features/

# 删除空的 features/ 目录
rmdir docs/features
```

#### 2.2 部署文档整合

```bash
# 环境文档
mv docs/deployment/environments.md docs/05-operations/deployment/
mv docs/infrastructure/debug-staging-setup-plan.md docs/05-operations/deployment/environment-setup/
mv docs/infrastructure/be-environment-operations.md docs/05-operations/deployment/environment-operations/
mv docs/infrastructure/be-environment-isolation-design.md docs/05-operations/deployment/environment-operations/isolation-design.md

# 服务部署文档
mkdir -p docs/05-operations/deployment/services
mv docs/backend/services/fly-io.md docs/05-operations/deployment/services/
mv docs/backend/services/neon.md docs/05-operations/deployment/services/
mv docs/backend/services/upstash.md docs/05-operations/deployment/services/
mv docs/backend/services/cloudflare.md docs/05-operations/deployment/services/
mv docs/backend/digital-ocean-droplet.md docs/05-operations/deployment/services/droplet.md

# 平台部署文档
mv docs/dashboard/deployment.md docs/05-operations/deployment/platforms/dashboard-deployment.md
mv docs/web/deployment-guide.md docs/05-operations/deployment/platforms/web-deployment.md
mv docs/infrastructure/workers-deployment.md docs/05-operations/deployment/platforms/workers-deployment.md
```

#### 2.3 监控文档整合

```bash
mkdir -p docs/05-operations/monitoring
mv docs/infrastructure/logging-and-crash-collection.md docs/05-operations/monitoring/logging.md
mv docs/infrastructure/runtime-logging-design.md docs/05-operations/monitoring/backend-logging.md
mv docs/infrastructure/monitoring.md docs/05-operations/monitoring/
mv docs/infrastructure/performance-monitoring-design.md docs/05-operations/monitoring/performance.md
```

#### 2.4 基础设施文档整合

```bash
mv docs/infrastructure/cloudflare-r2-setup.md docs/05-operations/infrastructure/storage-setup.md
mv docs/infrastructure/domain-management.md docs/05-operations/infrastructure/
mv docs/infrastructure/network-services.md docs/05-operations/infrastructure/
```

#### 2.5 合并 React Native 文档

```bash
# 移动 rn/ 到新位置
mkdir -p docs/04-development/platforms/
mv docs/rn docs/04-development/platforms/

# 合并 react-native/（仍在维护）
mv docs/react-native/* docs/04-development/platforms/rn/
rmdir docs/react-native
```

#### 2.6 合并发布文档

```bash
mkdir -p docs/08-releases/{roadmap,history,notes}

# 移动规划文档
mv docs/release/complete-version-roadmap.md docs/08-releases/roadmap/
mv docs/release/version-roadmap-v3-v5.md docs/08-releases/roadmap/
mv docs/release/v1-fullstack-release-plan.md docs/08-releases/roadmap/
mv docs/release/v1-staging-execution-plan.md docs/08-releases/roadmap/
mv docs/release/r2-versioning-strategy.md docs/08-releases/roadmap/

# 移动发布历史
mv docs/releases/release-history.md docs/08-releases/history/

# 移动发布说明
mv docs/release/notes/* docs/08-releases/notes/

# 删除空目录
rmdir docs/release/notes
rmdir docs/release
rmdir docs/releases
```

### 阶段3: 删除或归档重复文档 (1小时)

```bash
# 迁移重复的环境文档（仍在使用）
mv docs/infrastructure/environments-overview.md docs/05-operations/deployment/environments-overview.md
mv docs/infrastructure/be-environment-overview.md docs/05-operations/deployment/be-environment-overview.md
mv docs/infrastructure/be-environment-configs.md docs/05-operations/deployment/be-environment-configs.md

# 删除空的 deployment/ 目录
rmdir docs/deployment
```

### 阶段4: 更新 README.md 和交叉引用 (1小时)

1. 更新主 `docs/README.md`
2. 为每个新目录创建 `README.md`
3. 更新文档内的相对链接

### 阶段5: 清理和验证 (30分钟)

```bash
# 验证所有文档都已移动
find docs/ -name "*.md" | wc -l

# 检查是否有失效链接
# (需要手动检查)

# 删除空目录
find docs/ -type d -empty -delete
```

---

## 五、预期效果

### 5.1 查找效率提升

| 场景 | 整理前 | 整理后 |
|------|--------|--------|
| 查找部署文档 | 需要查看 5 个目录 | 只需查看 `operations/deployment/` |
| 查找环境配置 | 6 个文档分散 | 集中在 `operations/deployment/` 有清晰层级 |
| 查找平台开发文档 | 散落在根目录 | 统一在 `development/platforms/` |
| 查找发布规划 | `release/` 和 `releases/` 混淆 | 统一在 `releases/` 按类型分组 |
| 查找产品功能设计 | `features/` 混合产品和技术文档 | `product/features/` 按功能分类 |
| 查找iOS特定功能 | 分散在 `features/` 和 `ios/` | 统一在 `development/platforms/ios/` |

### 5.2 目录数量优化

| 指标 | 整理前 | 整理后 | 变化 |
|------|--------|--------|------|
| 顶层目录数 | 40+ | ~15 | -60% |
| 重复目录 | 4 对 | 0 | -100% |
| 无 README 的目录 | ~10 | 0 | -100% |

---

## 六、风险和注意事项

### 6.1 风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 文档内链接失效 | 中 | 执行后逐个检查和更新 |
| 开发者习惯改变 | 低 | 保留旧位置的 README 指向新位置 |
| 可能丢失文件 | 高 | 先创建 git commit，确保可回滚 |

### 6.2 注意事项

1. **执行前务必 commit**: `git add -A && git commit -m "Before docs reorganization"`
2. **逐步执行**: 不要一次性移动所有文件，分阶段执行
3. **保留历史版本**: 不确定的文档先保留在更明确的分类目录中，不要直接删除
4. **更新团队**: 执行后通知团队新的文档结构

---

## 七、执行时间表

| 阶段 | 预计时间 | 建议执行时间 |
|------|---------|-------------|
| 阶段1: 创建目录 | 1小时 | 立即执行 |
| 阶段2: 移动文档 | 3-4小时 | 分3次执行 |
| 阶段3: 归档重复 | 1小时 | 与阶段2同时 |
| 阶段4: 更新索引 | 1.5小时 | 移动完成后 |
| 阶段5: 验证清理 | 0.5小时 | 最后执行 |
| **总计** | **7-8小时** | **分3-4天完成** |

---

## 八、后续维护

### 8.1 文档规范

1. 每个目录必须有 `README.md`
2. 新文档必须添加到对应目录的 `README.md` 索引中
3. 文档命名使用 `kebab-case.md`
4. 删除文档时同时更新索引

### 8.2 定期审查

- 每季度审查一次文档结构
- 及时归档过时文档
- 更新文档进度和状态

---

**状态**: 待用户确认后执行
