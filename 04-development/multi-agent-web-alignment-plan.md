# 多Agent协作方案：Web端对齐iOS功能

## 项目背景

### 当前状态对比

```
┌─────────────────────────────────────────────────────────────────────┐
│                        功能完成度对比                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  iOS (300+ 文件, 33模块)              Web (当前状态)                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 85%      │
│                                                                     │
│  核心阅读器    ████████████           核心阅读器    ████████████     │
│  有声书        ████████████           有声书        ████████████     │
│  书库管理      ████████████           书库管理      ██████████░░     │
│  学习系统      ████████████           学习系统      ████████░░░░     │
│  社区(Agora)   ████████████           社区(Agora)   ░░░░░░░░░░░░     │
│  消息系统      ████████████           消息系统      ░░░░░░░░░░░░     │
│  年度报告      ████████████           年度报告      ░░░░░░░░░░░░     │
│  勋章成就      ████████████           勋章成就      ░░░░░░░░░░░░     │
│  明信片        ████████████           明信片        ░░░░░░░░░░░░     │
│  作者专区      ████████████           作者专区      ████░░░░░░░░     │
│  订阅管理      ████████████           订阅管理      ░░░░░░░░░░░░     │
│  离线管理      ████████████           离线管理      ████████░░░░     │
│  设备管理      ████████████           设备管理      ░░░░░░░░░░░░     │
│  CarPlay       ████████████           N/A                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 关键差距

| 类别 | iOS | Web | 差距 |
|------|-----|-----|------|
| **功能模块** | 33个 | ~10个 | 23个待开发 |
| **API对接** | 完整 | Mock为主 | 需要全量对接 |
| **社交功能** | Agora+消息 | 无 | 完全缺失 |
| **激励系统** | 勋章+成就 | 无 | 完全缺失 |
| **商业化** | 订阅+IAP | 无 | 完全缺失 |

---

## 多Agent协作架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Orchestrator (编排器)                          │
│                    负责任务分配、进度追踪、冲突解决                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   Architect   │       │   Analyzer    │       │   Reviewer    │
│   架构师       │       │   分析师       │       │   审查员       │
│               │       │               │       │               │
│ • 设计模块架构 │       │ • 分析iOS代码  │       │ • 代码审查     │
│ • 定义接口契约 │       │ • 提取业务逻辑 │       │ • 一致性检查   │
│ • 技术选型     │       │ • 生成规格文档 │       │ • 质量把关     │
└───────────────┘       └───────────────┘       └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  Frontend Dev │       │   API Dev     │       │   Test Dev    │
│  前端开发      │       │   API开发      │       │   测试开发     │
│               │       │               │       │               │
│ • React组件   │       │ • API Route   │       │ • 单元测试     │
│ • Zustand状态 │       │ • 数据获取Hook │       │ • E2E测试     │
│ • UI实现      │       │ • 类型定义     │       │ • 覆盖率      │
└───────────────┘       └───────────────┘       └───────────────┘
```

### Agent职责定义

#### 1. Orchestrator (编排器) - 主控制器

```yaml
职责:
  - 解析用户需求，拆分为具体任务
  - 分配任务给专业Agent
  - 追踪进度，处理依赖关系
  - 解决Agent间冲突
  - 汇总结果，输出报告

触发条件:
  - 用户发起功能开发请求
  - Agent完成任务需要下一步指令
  - 出现阻塞或冲突

输出:
  - 任务分配清单
  - 进度报告
  - 冲突解决方案
```

#### 2. Analyzer (iOS分析师)

```yaml
职责:
  - 分析iOS对应模块的实现
  - 提取业务逻辑和数据模型
  - 识别API端点和参数
  - 生成功能规格文档

输入:
  - iOS模块路径
  - 功能名称

输出:
  - 业务逻辑描述
  - 数据模型定义
  - API契约
  - UI/UX规格
```

#### 3. Architect (Web架构师)

```yaml
职责:
  - 基于iOS分析结果设计Web架构
  - 定义组件结构和状态管理
  - 规划文件组织
  - 确定技术实现方案

输入:
  - Analyzer输出的规格文档
  - 现有Web架构约束

输出:
  - 组件架构图
  - 文件结构规划
  - 接口定义
  - 实现步骤
```

#### 4. Frontend Dev (前端开发)

```yaml
职责:
  - 实现React组件
  - 实现Zustand状态管理
  - 实现UI交互
  - 遵循现有代码风格

输入:
  - Architect输出的架构设计
  - 组件规格

输出:
  - React组件代码
  - Store定义
  - 样式实现
```

#### 5. API Dev (API开发)

```yaml
职责:
  - 实现API Route handlers
  - 实现数据获取Hooks
  - 定义TypeScript类型
  - 处理错误和加载状态

输入:
  - API契约定义
  - 后端API文档

输出:
  - API Routes
  - React Query Hooks
  - Type定义
```

#### 6. Reviewer (代码审查)

```yaml
职责:
  - 审查代码质量
  - 检查与iOS功能一致性
  - 验证类型安全
  - 确保代码风格一致

输入:
  - 开发完成的代码
  - iOS参考实现

输出:
  - 审查报告
  - 修改建议
  - 通过/拒绝决定
```

---

## 工作流程编排

### 单功能开发流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                    功能开发 Pipeline                                 │
└─────────────────────────────────────────────────────────────────────┘

Phase 1: 分析 (Analyzer)
━━━━━━━━━━━━━━━━━━━━━━━━━
     ┌─────────────┐
     │  iOS 模块   │
     │  源代码     │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │  Analyzer   │ ──→ spec.md (功能规格)
     │  Agent      │ ──→ api.md (API契约)
     └──────┬──────┘ ──→ models.ts (数据模型)
            │
            ▼

Phase 2: 设计 (Architect)
━━━━━━━━━━━━━━━━━━━━━━━━━
     ┌─────────────┐
     │  Architect  │ ──→ architecture.md
     │  Agent      │ ──→ components.md
     └──────┬──────┘ ──→ implementation-plan.md
            │
            ▼

Phase 3: 并行开发 (Frontend + API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ┌─────────────┐     ┌─────────────┐
     │  Frontend   │     │   API Dev   │
     │  Dev Agent  │     │   Agent     │
     └──────┬──────┘     └──────┬──────┘
            │                   │
            │   并行执行        │
            ▼                   ▼
     components/          lib/api/
     stores/              app/api/
            │                   │
            └─────────┬─────────┘
                      │
                      ▼

Phase 4: 审查 (Reviewer)
━━━━━━━━━━━━━━━━━━━━━━━━━
     ┌─────────────┐
     │  Reviewer   │ ──→ review-report.md
     │  Agent      │ ──→ 通过/修改/拒绝
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │  完成/迭代  │
     └─────────────┘
```

### 多功能并行流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                     多功能并行开发                                   │
└─────────────────────────────────────────────────────────────────────┘

时间 ──────────────────────────────────────────────────────────────→

功能A (社区Agora)
  │ [Analyzer] ─→ [Architect] ─→ [Frontend+API] ─→ [Reviewer] ─→ ✓
  │
功能B (消息系统)                    依赖A的API定义
  │              [Analyzer] ─→ [Architect] ─→ [Frontend+API] ─→ [Reviewer] ─→ ✓
  │
功能C (勋章成就)
  │ [Analyzer] ─→ [Architect] ─→ [Frontend+API] ─→ [Reviewer] ─→ ✓
  │
功能D (订阅管理)
  │ [Analyzer] ─→ [Architect] ─────────────────→ [Frontend+API] ─→ [Reviewer] ─→ ✓
                              (等待支付集成)
```

---

## 具体功能开发计划

### 优先级排序

```
┌─────────────────────────────────────────────────────────────────────┐
│  优先级  │  功能模块      │  依赖关系        │  预估复杂度           │
├──────────┼───────────────┼─────────────────┼─────────────────────────┤
│  P0      │  API全量对接   │  无             │  ████████░░ 高         │
│  P1      │  社区 Agora    │  API对接        │  ██████████ 很高       │
│  P1      │  消息系统      │  API对接        │  ████████░░ 高         │
│  P2      │  勋章成就      │  API对接        │  ██████░░░░ 中         │
│  P2      │  年度报告      │  阅读统计API    │  ██████░░░░ 中         │
│  P3      │  明信片        │  无             │  ████░░░░░░ 低         │
│  P3      │  订阅管理      │  支付集成       │  ████████░░ 高         │
│  P3      │  设备管理      │  认证系统       │  ████░░░░░░ 低         │
└──────────┴───────────────┴─────────────────┴─────────────────────────┘
```

### P0: API全量对接

**目标**: 将现有Mock数据替换为真实API调用

```
iOS API客户端参考:
  ios/Readmigo/Core/Network/APIClient.swift
  ios/Readmigo/Core/Network/APIEndpoints.swift

Web目标结构:
  apps/web/src/lib/api/
  ├── client.ts          # API基础客户端 (已有)
  ├── endpoints.ts       # 端点定义 (新增)
  ├── hooks/
  │   ├── use-library.ts    # 书库API (完善)
  │   ├── use-reader.ts     # 阅读器API (完善)
  │   ├── use-audiobook.ts  # 有声书API (完善)
  │   ├── use-learning.ts   # 学习API (完善)
  │   ├── use-agora.ts      # 社区API (新增)
  │   ├── use-messaging.ts  # 消息API (新增)
  │   └── use-badges.ts     # 勋章API (新增)
  └── types/
      └── index.ts       # 统一类型定义

Agent分配:
  • Analyzer: 提取iOS所有API端点
  • API Dev: 实现Web API Hooks
  • Reviewer: 验证API一致性
```

### P1: 社区 Agora

**iOS参考模块**: `ios/Readmigo/Features/Agora/`

```
iOS文件:
  • AgoraView.swift
  • AgoraPostDetailView.swift
  • AgoraCommentView.swift
  • AgoraPostCard.swift
  • AgoraFilters.swift
  • AgoraManager.swift

Web目标结构:
  apps/web/src/
  ├── app/(main)/agora/
  │   ├── page.tsx              # 社区首页
  │   └── [postId]/page.tsx     # 帖子详情
  ├── features/agora/
  │   ├── agora-store.ts        # 状态管理
  │   ├── post-card.tsx         # 帖子卡片
  │   ├── post-detail.tsx       # 帖子详情
  │   ├── comment-list.tsx      # 评论列表
  │   ├── comment-form.tsx      # 评论表单
  │   ├── agora-filters.tsx     # 过滤器
  │   └── use-agora.ts          # API Hook
  └── components/shared/
      └── user-avatar.tsx       # 用户头像

Agent工作流:
  1. Analyzer → 分析AgoraManager业务逻辑
  2. Architect → 设计React组件架构
  3. Frontend Dev → 实现组件 (并行)
  4. API Dev → 实现API Hooks (并行)
  5. Reviewer → 审查
```

### P1: 消息系统

**iOS参考模块**: `ios/Readmigo/Features/Messaging/`

```
iOS文件:
  • MessagingView.swift
  • ConversationListView.swift
  • MessageThreadView.swift
  • MessageComposer.swift
  • MessagingManager.swift
  (18个文件)

Web目标结构:
  apps/web/src/
  ├── app/(main)/messages/
  │   ├── page.tsx              # 消息列表
  │   └── [threadId]/page.tsx   # 对话详情
  ├── features/messaging/
  │   ├── messaging-store.ts    # 状态管理
  │   ├── conversation-list.tsx # 会话列表
  │   ├── message-thread.tsx    # 消息线程
  │   ├── message-bubble.tsx    # 消息气泡
  │   ├── message-composer.tsx  # 消息编辑器
  │   ├── unread-badge.tsx      # 未读标记
  │   └── use-messaging.ts      # API Hook
  └── lib/api/hooks/
      └── use-messaging.ts      # 消息API

功能点:
  • 三种消息类型 (Message/Feedback/Chat)
  • 实时更新 (WebSocket/SSE)
  • 未读计数
  • 消息搜索
```

### P2: 勋章成就系统

**iOS参考模块**: `ios/Readmigo/Features/Badges/` + `ios/Readmigo/Features/Medals/`

```
iOS文件:
  • BadgesView.swift
  • BadgeCard.swift
  • BadgeDetailView.swift
  • MedalsView.swift
  • MedalCard.swift
  (10个文件)

Web目标结构:
  apps/web/src/
  ├── app/(main)/achievements/
  │   └── page.tsx              # 成就页面
  ├── features/achievements/
  │   ├── achievements-store.ts
  │   ├── badge-grid.tsx
  │   ├── badge-card.tsx
  │   ├── badge-detail.tsx
  │   ├── medal-showcase.tsx
  │   ├── progress-tracker.tsx
  │   └── use-achievements.ts
```

### P2: 年度报告

**iOS参考模块**: `ios/Readmigo/Features/AnnualReport/`

```
iOS文件:
  • AnnualReportView.swift
  • ReportPageView.swift
  • StatisticsPage.swift
  • ShareReportView.swift
  (10个文件)

Web目标结构:
  apps/web/src/
  ├── app/(main)/annual-report/
  │   └── [year]/page.tsx
  ├── features/annual-report/
  │   ├── report-store.ts
  │   ├── report-page.tsx
  │   ├── statistics-card.tsx
  │   ├── reading-chart.tsx
  │   ├── share-dialog.tsx
  │   └── use-annual-report.ts
```

---

## Agent配置文件

### 目录结构

```
.claude/
├── CLAUDE.md                    # 现有项目指令
├── agents/                      # Agent定义 (新增)
│   ├── orchestrator.md          # 编排器
│   ├── ios-analyzer.md          # iOS分析师
│   ├── web-architect.md         # Web架构师
│   ├── frontend-dev.md          # 前端开发
│   ├── api-dev.md               # API开发
│   └── code-reviewer.md         # 代码审查
├── workflows/                   # 工作流定义 (新增)
│   ├── feature-alignment.md     # 功能对齐流程
│   └── parallel-dev.md          # 并行开发流程
└── commands/                    # 现有命令
    └── ...
```

### Agent: iOS Analyzer

```markdown
---
name: ios-analyzer
description: 分析iOS模块，提取业务逻辑和API规格
tools: [Read, Glob, Grep]
---

# iOS 分析师

## 职责
分析指定的iOS模块，输出：
1. 业务逻辑描述
2. 数据模型定义
3. API端点和参数
4. UI/UX规格

## 分析流程

### Step 1: 模块结构扫描
- 列出模块内所有文件
- 识别View、ViewModel、Manager、Model

### Step 2: 数据模型提取
- 找到相关的Model定义
- 转换为TypeScript类型

### Step 3: API端点分析
- 在APIClient和APIEndpoints中查找相关端点
- 记录请求方法、路径、参数、响应类型

### Step 4: 业务逻辑提取
- 分析Manager/ViewModel中的核心方法
- 记录状态管理逻辑
- 记录缓存策略

### Step 5: UI规格
- 分析View的布局结构
- 记录交互逻辑
- 截图参考（如果有）

## 输出模板

### {模块名} 功能规格

#### 数据模型
```typescript
// 从iOS Model转换
```

#### API端点
| 方法 | 路径 | 参数 | 响应 |
|------|------|------|------|

#### 业务逻辑
1. ...
2. ...

#### UI组件结构
- ...
```

### Agent: Web Architect

```markdown
---
name: web-architect
description: 基于iOS分析结果设计Web架构
tools: [Read, Glob, Grep]
---

# Web 架构师

## 职责
基于iOS分析结果，设计Web端实现架构

## 设计原则

### 技术栈约束
- React 19 + Next.js 16 (App Router)
- Zustand (状态管理)
- TanStack Query (服务端状态)
- Tailwind CSS + Radix UI
- TypeScript 严格模式

### 架构模式
- Feature-based 目录结构
- 组件与Hook分离
- Store集中管理
- API层抽象

## 输出模板

### {功能} 架构设计

#### 文件结构
```
apps/web/src/
├── app/(main)/{feature}/
├── features/{feature}/
└── lib/api/hooks/
```

#### 组件设计
| 组件 | 职责 | Props |
|------|------|-------|

#### 状态设计
```typescript
interface {Feature}State {
  // ...
}
```

#### 实现步骤
1. [ ] ...
2. [ ] ...
```

### Agent: Frontend Dev

```markdown
---
name: frontend-dev
description: 实现React组件和状态管理
tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# 前端开发

## 职责
根据架构设计实现React组件

## 代码规范

### 组件模式
- 优先使用函数组件
- 使用 'use client' 指令标记客户端组件
- Props使用TypeScript接口定义
- 使用Radix UI原语组件

### 状态管理
- 全局状态使用Zustand
- 服务端状态使用TanStack Query
- 本地状态使用useState/useReducer

### 样式
- 使用Tailwind CSS
- 使用cn()合并类名
- 响应式设计优先

## 实现检查清单
- [ ] 类型定义完整
- [ ] 加载状态处理
- [ ] 错误状态处理
- [ ] 响应式布局
- [ ] 无障碍支持
```

### Agent: API Dev

```markdown
---
name: api-dev
description: 实现API Routes和数据获取Hooks
tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# API 开发

## 职责
实现API层代码

## 代码规范

### API Hooks模式
```typescript
export function use{Resource}() {
  return useQuery({
    queryKey: ['{resource}'],
    queryFn: async () => {
      const response = await apiClient.get('/...');
      return response.data;
    },
  });
}
```

### 错误处理
- 统一错误类型
- Toast通知
- 重试逻辑

### 缓存策略
- staleTime配置
- 乐观更新
- 后台刷新
```

### Agent: Code Reviewer

```markdown
---
name: code-reviewer
description: 审查代码质量和iOS一致性
tools: [Read, Glob, Grep]
---

# 代码审查

## 审查维度

### 1. 功能一致性
- [ ] 与iOS功能完全对齐
- [ ] 数据模型一致
- [ ] 业务逻辑一致
- [ ] 边界情况处理

### 2. 代码质量
- [ ] TypeScript类型安全
- [ ] 无any类型
- [ ] 错误处理完整
- [ ] 性能考虑

### 3. 代码风格
- [ ] 符合项目规范
- [ ] 命名一致
- [ ] 注释适当
- [ ] 文件组织合理

### 4. 安全性
- [ ] 无XSS风险
- [ ] API调用安全
- [ ] 敏感数据处理

## 输出模板

### 审查报告

**功能**: {功能名}
**状态**: 通过 / 需修改 / 拒绝

#### 发现的问题
1. ...

#### 修改建议
1. ...

#### 一致性检查
| 检查项 | iOS | Web | 状态 |
|--------|-----|-----|------|
```

---

## 工作流定义

### Workflow: Feature Alignment

```markdown
---
name: feature-alignment
description: 单功能从iOS到Web的对齐流程
---

# 功能对齐工作流

## 触发
/align-feature {feature-name}

## 流程

### Phase 1: 分析
```
调用: ios-analyzer
输入: iOS模块路径
输出: spec.md, api.md, models.ts
```

### Phase 2: 设计
```
调用: web-architect
输入: Phase 1输出
输出: architecture.md, implementation-plan.md
```

### Phase 3: 实现 (并行)
```
并行调用:
  - frontend-dev (components, stores)
  - api-dev (hooks, routes)
```

### Phase 4: 审查
```
调用: code-reviewer
输入: Phase 3输出
输出: review-report.md
```

### Phase 5: 迭代或完成
```
如果审查通过: 完成
如果需修改: 返回Phase 3
```
```

---

## 使用示例

### 示例1: 对齐社区Agora功能

```bash
# 启动功能对齐
/align-feature agora

# Orchestrator分配任务
# → ios-analyzer: 分析 ios/Readmigo/Features/Agora/
# → 输出: docs/specs/agora-spec.md

# → web-architect: 设计架构
# → 输出: docs/architecture/agora-architecture.md

# → 并行开发
# → frontend-dev: 实现组件
# → api-dev: 实现API

# → code-reviewer: 审查
# → 输出: 审查报告
```

### 示例2: 批量对齐多个功能

```bash
# 并行启动多个功能
/align-features agora messaging badges

# Orchestrator会:
# 1. 分析依赖关系
# 2. 调度可并行的任务
# 3. 处理依赖任务的顺序
# 4. 汇总进度报告
```

---

## 实施路线图

```
Week 1-2: 基础设施
━━━━━━━━━━━━━━━━━━━━
• 配置Agent文件
• 配置Workflow文件
• P0: API全量对接

Week 3-4: P1功能
━━━━━━━━━━━━━━━━━━━━
• 社区 Agora (并行)
• 消息系统 (并行)

Week 5-6: P2功能
━━━━━━━━━━━━━━━━━━━━
• 勋章成就 (并行)
• 年度报告 (并行)

Week 7-8: P3功能 + 收尾
━━━━━━━━━━━━━━━━━━━━━━
• 明信片
• 订阅管理
• 设备管理
• 整体测试和优化
```

---

## 总结

### 核心价值

| 价值 | 说明 |
|------|------|
| **并行效率** | 多Agent同时工作，Frontend和API并行开发 |
| **一致性保证** | Analyzer确保从iOS提取准确规格 |
| **质量把关** | Reviewer层层审查，确保代码质量 |
| **可追溯** | 每个阶段都有文档输出 |

### 与现有系统整合

```
现有 .claude/ 结构
├── CLAUDE.md           ← 保持，增加Agent调用指令
├── commands/           ← 保持，增加/align-feature命令
├── agents/             ← 新增，6个专业Agent
└── workflows/          ← 新增，标准化工作流
```

### 下一步行动

1. **确认方案** - 审核本文档
2. **创建Agent文件** - 在.claude/agents/下创建6个Agent定义
3. **创建Workflow文件** - 在.claude/workflows/下创建工作流
4. **测试运行** - 选择一个小功能测试流程
5. **迭代优化** - 根据实际使用调整
