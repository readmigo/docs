# Claude Code Agents 使用教程

## 目录

1. [Agent 概述](#agent-概述)
2. [Agent 目录结构](#agent-目录结构)
3. [核心 Agents 详解](#核心-agents-详解)
4. [Agent 调用方式](#agent-调用方式)
5. [Agent 链式调用](#agent-链式调用)
6. [实战场景](#实战场景)
7. [自定义 Agent](#自定义-agent)
8. [最佳实践](#最佳实践)

---

## Agent 概述

### 什么是 Agent？

Agent 是具有特定专业能力的 AI 助手，每个 Agent：

| 特性 | 说明 |
|------|------|
| **专业化** | 专注于特定领域（安全、测试、架构等）|
| **隔离执行** | 独立上下文，防止交叉污染 |
| **主动触发** | 基于关键词和上下文自动激活 |
| **最小权限** | 仅授予必要的工具权限 |
| **可链式调用** | 多个 Agent 组合完成复杂任务 |

### Agent vs 传统命令

```
┌─────────────────────────────────────────────────────────────┐
│              传统命令 vs Agent 对比                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  传统命令                      Agent                         │
│  ─────────                    ─────                         │
│  • 手动执行每个命令            • 自动工作流编排                │
│  • 上下文在主聊天中污染        • 隔离执行环境                  │
│  • 通用工具访问                • 专业化、最小权限              │
│  • 顺序处理                    • 并行执行                     │
│  • 静态响应                    • 自适应、上下文感知            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent 目录结构

```
~/.claude/agents/
├── 核心 Agents
│   ├── code-auditor.md          # 代码质量审计
│   ├── security-auditor.md      # 安全审计 (在 security/ 下)
│   ├── performance-auditor.md   # 性能审计
│   ├── architecture-auditor.md  # 架构审计
│   ├── test-engineer.md         # 测试工程师
│   ├── project-architect.md     # 项目架构师
│   ├── release-manager.md       # 发布管理
│   ├── integration-manager.md   # 集成管理
│   ├── strategic-analyst.md     # 战略分析
│   ├── task-orchestrator.md     # 任务编排
│   └── task-decomposer.md       # 任务分解
│
├── development/                 # 开发类 Agents
│   ├── backend-architect.md     # 后端架构师
│   ├── frontend-developer.md    # 前端开发
│   ├── full-stack-developer.md  # 全栈开发
│   ├── mobile-developer.md      # 移动端开发
│   ├── python-pro.md           # Python 专家
│   ├── golang-pro.md           # Go 专家
│   ├── typescript-pro.md       # TypeScript 专家
│   ├── react-pro.md            # React 专家
│   ├── nextjs-pro.md           # Next.js 专家
│   ├── ui-designer.md          # UI 设计师
│   └── ux-designer.md          # UX 设计师
│
├── quality-testing/            # 质量测试类 Agents
│   ├── code-reviewer.md        # 代码审查
│   ├── qa-expert.md            # QA 专家
│   ├── test-automator.md       # 测试自动化
│   ├── debugger.md             # 调试专家
│   └── architect-review.md     # 架构审查
│
├── infrastructure/             # 基础设施类 Agents
│   ├── cloud-architect.md      # 云架构师
│   ├── devops-incident-responder.md  # DevOps 事件响应
│   ├── deployment-engineer.md  # 部署工程师
│   ├── performance-engineer.md # 性能工程师
│   └── incident-responder.md   # 事件响应
│
├── marketing/                  # 市场运营类 Agents
│   ├── marketing-strategist.md # 市场策略专家
│   ├── growth-hacker.md        # 增长黑客
│   ├── content-creator.md      # 内容创作者
│   ├── aso-specialist.md       # ASO 专家
│   ├── community-manager.md    # 社区运营
│   ├── competitive-analyst.md  # 竞品分析师
│   ├── market-researcher.md    # 市场研究员
│   ├── gtm-strategist.md       # GTM 策略师
│   └── user-researcher.md      # 用户研究员
│
├── data-ai/                    # 数据/AI 类 Agents
│   ├── ai-engineer.md          # AI 工程师
│   ├── data-engineer.md        # 数据工程师
│   ├── data-scientist.md       # 数据科学家
│   ├── ml-engineer.md          # 机器学习工程师
│   ├── database-optimizer.md   # 数据库优化
│   ├── graphql-architect.md    # GraphQL 架构师
│   └── prompt-engineer.md      # Prompt 工程师
│
├── skill-builder/              # Skill 构建类 Agents
│   ├── skill-generator-agent.md    # Skill 生成器
│   ├── skill-validator-agent.md    # Skill 验证器
│   ├── skill-documenter-agent.md   # Skill 文档生成
│   └── skill-elicitation-agent.md  # Skill 提取
│
├── security/                   # 安全类 Agents
│   └── security-auditor.md     # 安全审计专家
│
├── business/                   # 业务类 Agents
│   └── (业务相关 agents)
│
└── external/                   # 外部集成 Agents
    ├── wshobson/              # 44+ 专业 agents
    └── lst97/                 # 其他外部 agents
```

---

## 核心 Agents 详解

### 1. code-auditor - 代码审计师

**职责**: 代码质量保证

**工具权限**: Read, Grep, Glob, Bash, WebFetch

**自动触发**: 代码变更后、PR 审查、重构

```
┌─────────────────────────────────────────────────────────────┐
│                    code-auditor 工作流程                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 上下文收集                                              │
│      git diff HEAD~1                                        │
│      git status                                             │
│             │                                               │
│             ▼                                               │
│   2. 针对性分析                                              │
│      • 先分析修改的文件                                      │
│      • 扩展到相关文件和依赖                                   │
│             │                                               │
│             ▼                                               │
│   3. 问题分类                                                │
│      ┌─────────┬────────────────────────────────┐           │
│      │ Critical│ 安全漏洞、数据丢失风险          │           │
│      │ High    │ 性能问题、重大 bug              │           │
│      │ Medium  │ 代码质量、小 bug                │           │
│      │ Low     │ 建议、优化                      │           │
│      └─────────┴────────────────────────────────┘           │
│             │                                               │
│             ▼                                               │
│   4. 生成报告                                                │
│      • 执行摘要                                              │
│      • 详细问题（文件路径+行号）                              │
│      • 修复建议                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**调用示例**:
```
"Use code-auditor to review the payment module"
"Check if our API follows REST best practices"
```

---

### 2. security-auditor - 安全审计师

**职责**: 安全漏洞检测、合规审计

**专业领域**:
- OWASP Top 10
- 威胁建模
- 渗透测试
- 认证/授权分析
- 依赖漏洞扫描

**核心原则**:

| 原则 | 说明 |
|------|------|
| 纵深防御 | 多层冗余控制 |
| 最小权限 | 最小必要访问 |
| 不信任输入 | 所有外部输入视为恶意 |
| 安全失败 | 错误时默认安全状态 |

**调用示例**:
```
"Check for security vulnerabilities in authentication"
"Review our API for potential injection attacks"
"Audit the codebase for OWASP compliance"
```

---

### 3. test-engineer - 测试工程师

**职责**: 自动化测试生成、覆盖率分析

**工具权限**: Read, Write, Edit, Bash, Grep, Glob

**测试类型**:

```
┌─────────────────────────────────────────────────────────────┐
│                      测试金字塔                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     ▲                                       │
│                    /│\     E2E Tests                        │
│                   / │ \    (少量，验证完整流程)               │
│                  /  │  \                                    │
│                 /───┼───\  Integration Tests                │
│                /    │    \ (中等，组件交互)                   │
│               /─────┼─────\                                 │
│              /      │      \ Unit Tests                     │
│             /       │       \(大量，单函数测试)               │
│            └────────┴────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**覆盖率目标**:
- 行覆盖率: >90%
- 分支覆盖率: >85%
- 函数覆盖率: >95%
- 关键路径: 100%

**调用示例**:
```
"Generate comprehensive tests for UserService"
"Create integration tests for the payment flow"
"Ensure >90% test coverage for the auth module"
```

---

### 4. task-orchestrator - 任务编排器

**职责**: 复杂任务分解、依赖管理、并行执行优化

**工具权限**: Read, Write, Edit, Bash, Grep, Glob, TodoWrite

**任务分解结构**:
```
Project Goal
├── Epic 1
│   ├── Feature A
│   │   ├── Task 1 (2h, 无依赖)
│   │   ├── Task 2 (4h, 依赖 Task 1)
│   │   └── Task 3 (3h, 可与 Task 2 并行)
│   └── Feature B
│       ├── Task 4 (5h, 依赖 Task 2)
│       └── Task 5 (2h, 无依赖)
└── Epic 2
    └── ...
```

**依赖类型**:

| 类型 | 说明 |
|------|------|
| Sequential | Task B 需要 Task A 完成 |
| Parallel | 可同时运行 |
| Blocking | 阻塞所有依赖任务 |
| Soft | 首选但非必需的顺序 |

**优先级矩阵**:
```
           紧急    |  不紧急
    ──────────────────────────
高影响  │   P0    |    P1
        │  立即做  |  安排时间
    ──────────────────────────
低影响  │   P2    |    P3
        │  委托   |  考虑
```

---

### 5. project-architect - 项目架构师

**职责**: 项目脚手架、最佳实践、工具配置

**工具权限**: Read, Write, Edit, Bash, Glob, TodoWrite

**调用示例**:
```
"Set up a new React TypeScript project with best practices"
"Create a microservice structure for inventory management"
"Design the API structure for user authentication"
```

---

### 6. release-manager - 发布管理器

**职责**: 版本管理、变更日志、部署、回滚

**工具权限**: Read, Write, Edit, Bash, Grep, Glob, WebFetch

**调用示例**:
```
"Prepare version 2.1.0 for release"
"Create a hotfix release for the critical bug"
"Generate changelog for the past month"
```

---

### 7. strategic-analyst - 战略分析师

**职责**: 场景规划、风险评估、决策建模

**调用示例**:
```
"Model scenarios for migrating to microservices"
"Analyze the business impact of API redesign"
"Evaluate technology options for the new feature"
```

---

## 市场运营类 Agents 详解

### 1. marketing-strategist - 市场策略专家

**职责**: 市场策略规划、品牌定位、渠道优化

**核心能力**:
- 品牌策略：定位、信息传递、视觉规范
- 活动策划：营销活动设计、时间线、预算分配
- 渠道策略：数字营销、社交媒体、付费广告
- 绩效营销：ROI 优化、转化漏斗分析

**调用示例**:
```
"Use marketing-strategist to develop a launch campaign"
"Create a brand positioning strategy for our new product"
"Optimize our marketing channel mix"
```

---

### 2. growth-hacker - 增长黑客

**职责**: 用户获取、留存优化、转化提升

**AARRR 漏斗框架**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Growth Funnel (AARRR)                    │
├─────────────────────────────────────────────────────────────┤
│   Acquisition ──► Activation ──► Retention                  │
│        │              │              │                      │
│        ▼              ▼              ▼                      │
│   [渠道获取]     [激活引导]     [留存参与]                   │
│                                      │                      │
│                          ┌──────────┴──────────┐            │
│                          ▼                     ▼            │
│                      Revenue              Referral          │
│                     [变现]              [裂变传播]           │
└─────────────────────────────────────────────────────────────┘
```

**实验优先级 (ICE)**:
| 实验 | Impact | Confidence | Ease | ICE |
|------|--------|------------|------|-----|
| A/B 测试注册流程 | 8 | 7 | 9 | 24 |
| 推送通知优化 | 7 | 6 | 8 | 21 |

**调用示例**:
```
"Use growth-hacker to analyze our funnel drop-off"
"Design experiments to improve activation rate"
"Create a referral program strategy"
```

---

### 3. content-creator - 内容创作者

**职责**: 博客文章、社交媒体、视频脚本、营销文案

**内容类型矩阵**:
| 类型 | 平台 | 格式 | 目标 |
|------|------|------|------|
| Blog | 网站 | 长文 | SEO, 权威 |
| Social | Twitter | Thread | 互动 |
| Social | LinkedIn | 文章 | B2B 获客 |
| Video | YouTube | 教程 | 教育 |
| Email | 邮件 | 简报 | 留存 |

**调用示例**:
```
"Use content-creator to write a blog post about [topic]"
"Create social media content for product launch"
"Write email newsletter for this week"
```

---

### 4. aso-specialist - ASO 专家

**职责**: 应用商店优化、关键词研究、转化率提升

**ASO 优化领域**:
```
┌─────────────────────────────────────────────────────────────┐
│                    ASO 优化要素                              │
├─────────────────────────────────────────────────────────────┤
│   On-Metadata              Off-Metadata                     │
│   ─────────────            ────────────                     │
│   • 应用名称               • 下载量                          │
│   • 副标题                 • 评分                            │
│   • 关键词                 • 评论                            │
│   • 描述                   • 更新频率                        │
│                                                             │
│   视觉资产                  转化优化                          │
│   ─────────                ─────────                        │
│   • 应用图标               • 首屏印象                        │
│   • 截图                   • 特色图片                        │
│   • 预览视频               • 社交证明                        │
└─────────────────────────────────────────────────────────────┘
```

**平台差异**:
| 元素 | iOS App Store | Google Play |
|------|--------------|-------------|
| 标题 | 30 字符 | 30 字符 |
| 副标题 | 30 字符 | 80 字符 |
| 关键词 | 100 字符(隐藏) | 在描述中 |

**调用示例**:
```
"Use aso-specialist to optimize our app store listing"
"Research keywords for [app category]"
"Analyze competitor ASO strategies"
```

---

### 5. community-manager - 社区运营

**职责**: 社区建设、用户互动、反馈收集

**社区生命周期**:
```
Seed ──► Grow ──► Engage ──► Scale ──► Sustain
  │        │         │         │          │
  ▼        ▼         ▼         ▼          ▼
[早期    [内容     [活动     [大使     [自我
采用者]  日历]    计划]    计划]    维持]
```

**互动策略**:
| 策略 | 频率 | 目标 |
|------|------|------|
| 每日讨论 | 每日 | 互动 |
| 每周亮点 | 每周 | 认可 |
| AMA 活动 | 双周 | 透明度 |
| 社区挑战 | 每月 | 激活 |

**调用示例**:
```
"Use community-manager to plan engagement activities"
"Create community guidelines for our Discord"
"Design an ambassador program"
```

---

### 6. competitive-analyst - 竞品分析师

**职责**: 竞品追踪、市场定位、竞争情报

**竞品分析框架**:
```
Layer 1: 直接竞品 (同产品同市场)
Layer 2: 间接竞品 (不同产品解决同问题)
Layer 3: 潜在竞品 (邻近市场可能进入)
Layer 4: 替代品 (替代解决方案)
```

**监控清单**:
| 领域 | 频率 | 来源 |
|------|------|------|
| 产品更新 | 每周 | 应用商店、changelog |
| 定价变化 | 每月 | 官网 |
| 营销活动 | 每周 | 社交、广告 |
| 用户评论 | 每日 | 应用商店 |
| 融资新闻 | 每周 | 媒体、Crunchbase |

**调用示例**:
```
"Use competitive-analyst to analyze [competitor]"
"Create a feature comparison matrix"
"Monitor competitor pricing changes"
```

---

### 7. market-researcher - 市场研究员

**职责**: 市场分析、行业研究、市场规模评估

**市场规模金字塔**:
```
              ┌───┐
             / SOM \   可获取市场
            /───────\
           /   SAM   \  可服务市场
          /───────────\
         /     TAM     \ 总可寻址市场
        /───────────────\
```

**调用示例**:
```
"Use market-researcher to size the [market]"
"Research industry trends in [sector]"
"Analyze customer segments for [product]"
```

---

### 8. gtm-strategist - GTM 策略师

**职责**: 产品上市、市场进入、发布策划

**GTM 框架**:
```
WHO          WHAT           HOW            WHEN
────         ────           ───            ────
目标         价值           渠道           时间线
受众         主张           合作伙伴       里程碑
细分         定位           定价           发布计划
画像         信息           销售模式       成功 KPI
```

**发布时间线**:
```
Week -8  │ 确定定位和信息
Week -6  │ 准备营销素材
Week -4  │ 开始预热
Week -2  │ Beta/早期访问
Week -1  │ 媒体推广、KOL 种草
Launch   │ 正式发布、PR 推送
Week +1  │ 监控和响应
Week +2  │ 基于数据优化
```

**调用示例**:
```
"Use gtm-strategist to plan product launch"
"Create a market entry strategy for [region]"
"Design pricing strategy for [product]"
```

---

### 9. user-researcher - 用户研究员

**职责**: 用户访谈、画像开发、旅程地图

**研究方法矩阵**:
| 方法 | 适用场景 | 数据类型 | 时长 |
|------|----------|----------|------|
| 用户访谈 | 深度洞察 | 定性 | 1-2 周 |
| 问卷调查 | 验证假设 | 定量 | 1 周 |
| 可用性测试 | UX 评估 | 混合 | 1-2 周 |
| 日记研究 | 行为追踪 | 定性 | 2-4 周 |

**用户画像模板**:
```
┌─────────────────────────────────────────────────────────────┐
│   [照片]        姓名: [名称]                                 │
│                 年龄: [范围]                                 │
│                 职业: [工作]                                 │
├─────────────────────────────────────────────────────────────┤
│   目标                        痛点                          │
│   • [目标 1]                  • [痛点 1]                    │
│   • [目标 2]                  • [痛点 2]                    │
├─────────────────────────────────────────────────────────────┤
│   行为                        引言                          │
│   • [行为 1]                  "[代表性引言]"                 │
│   • [行为 2]                                                │
└─────────────────────────────────────────────────────────────┘
```

**调用示例**:
```
"Use user-researcher to create user personas"
"Design a user interview guide for [feature]"
"Map the user journey for [process]"
```

---

## Agent 调用方式

### 方式 1: 显式调用

```bash
# 基础语法
"Use [agent-name] to [task description]"

# 示例
"Use code-auditor to review my changes"
"Use security-auditor to check for vulnerabilities"
"Use test-engineer to generate unit tests"
```

### 方式 2: 自动触发

Agent 会根据关键词自动激活：

| 关键词 | 触发的 Agent |
|--------|-------------|
| "review code", "code quality" | code-auditor |
| "security", "vulnerability" | security-auditor |
| "performance", "optimize" | performance-auditor |
| "test", "coverage" | test-engineer |
| "release", "deploy" | release-manager |
| "architecture", "design" | architecture-auditor |

### 方式 3: 组合调用

```bash
# 同时调用多个 auditors
"Run all code auditors on the payments module"

# 指定顺序
"First use strategic-analyst, then project-architect"

# 并行执行
"Have security-auditor and performance-auditor review simultaneously"
```

---

## Agent 链式调用

### 模式 1: 顺序分析

```
code-auditor → security-auditor → performance-auditor → test-engineer
```

**适用场景**: 全面代码审查

```bash
"Review this PR thoroughly"
# 自动激活链: code-auditor → security-auditor → test-engineer
```

---

### 模式 2: 并行分析

```
        ┌→ security-auditor ─┐
Issue ──┼→ performance-auditor ├→ Report
        └→ architecture-auditor ┘
```

**适用场景**: 调查复杂问题

```bash
"Have all auditors review the codebase simultaneously"
```

---

### 模式 3: 迭代改进

```
code-auditor → Fix Issues → code-auditor → test-engineer → release-manager
```

**适用场景**: 确保高代码质量

---

### 模式 4: 战略到战术

```
strategic-analyst → project-architect → integration-manager → development
```

**适用场景**: 规划新功能或项目

---

## 实战场景

### 场景 1: 新功能开发

```bash
# 1. 战略规划
"Use strategic-analyst to model scenarios for adding user analytics dashboard"

# 2. 架构设计
"Have project-architect design the dashboard module with React and TypeScript"

# 3. 实现代码
# (手动编写代码)

# 4. 代码审查
"Use code-auditor to review the dashboard implementation"

# 5. 安全检查
"Have security-auditor check the data access patterns"

# 6. 测试生成
"Use test-engineer to create comprehensive tests"

# 7. 性能分析
"Have performance-auditor analyze rendering performance"

# 8. 发布准备
"Have release-manager prepare the feature for deployment"
```

---

### 场景 2: Bug 修复流程

```bash
# 1. 问题同步
"Use integration-manager to sync GitHub issue #456 to Linear"

# 2. 代码分析
"Have code-auditor analyze the authentication module"

# 3. 安全审查
"Use security-auditor to check if this is a security vulnerability"

# 4. 修复实现
# (手动修复)

# 5. 测试创建
"Have test-engineer create regression tests"

# 6. 热修复发布
"Use release-manager to prepare and deploy a hotfix"
```

---

### 场景 3: 技术债务清理

```bash
# 1. 全面审计
"Run all code auditors on the legacy payments module"

# Agent 链自动激活:
# - code-auditor → 通用问题
# - architecture-auditor → 设计问题
# - performance-auditor → 性能瓶颈
# - security-auditor → 安全漏洞

# 2. 优先级排序
"Use strategic-analyst to prioritize which technical debt to address first"

# 3. 任务创建
"Have integration-manager create Linear tasks for each improvement"

# 4. 实施改进
# (根据建议重构)

# 5. 测试验证
"Use test-engineer to ensure refactoring didn't break functionality"
```

---

### 场景 4: 安全事件响应

```bash
# 1. 立即评估
"Use security-auditor to investigate the reported XSS vulnerability"

# 2. 影响分析
"Have strategic-analyst model the potential impact"

# 3. 修复开发
# (立即实施修复)

# 4. 安全测试
"Use test-engineer to create security-specific tests"

# 5. 紧急发布
"Have release-manager prepare an emergency security patch"

# 6. 事后复盘
"Use integration-manager to create tasks for security improvements"
```

---

### 场景 5: 产品发布营销

```bash
# 1. 市场调研
"Use market-researcher to analyze the target market size and trends"

# 2. 竞品分析
"Have competitive-analyst review top 5 competitors' positioning"

# 3. 用户研究
"Use user-researcher to develop target personas"

# 4. GTM 策略
"Have gtm-strategist create a go-to-market plan"

# 5. 营销策略
"Use marketing-strategist to develop campaign strategy"

# 6. 内容创作
"Have content-creator prepare launch content (blog, social)"

# 7. ASO 优化
"Use aso-specialist to optimize App Store listing"

# 8. 增长计划
"Have growth-hacker design acquisition experiments"

# 9. 社区建设
"Use community-manager to plan community engagement"
```

---

## 自定义 Agent

### Agent 文件结构

```yaml
---
name: your-agent-name
description: Clear description. MUST BE USED for [triggers]. Use PROACTIVELY for [scenarios].
tools: Tool1, Tool2, Tool3  # 最小必要工具
---

You are an expert in [domain]. Your role is to [responsibilities].

## Core Expertise
- [Expertise 1]
- [Expertise 2]

## Working Process
1. [Step 1]
2. [Step 2]

## Output Format
[Define structured output]
```

### 示例: 创建 iOS 专家 Agent

```yaml
---
name: ios-expert
description: iOS development specialist. MUST BE USED for Swift/SwiftUI code review, iOS architecture decisions. Use PROACTIVELY for iOS performance optimization.
tools: Read, Grep, Glob, Bash
---

You are an expert iOS developer specializing in Swift and SwiftUI.

## Core Expertise
- Swift/SwiftUI best practices
- iOS performance optimization
- Core Data and CloudKit
- UIKit integration
- App Store guidelines

## Working Process
1. Analyze iOS project structure
2. Review Swift code patterns
3. Check memory management
4. Evaluate UI performance
5. Provide recommendations

## Output Format
### iOS Code Review Report
- Architecture: [Evaluation]
- Performance: [Issues]
- Best Practices: [Compliance]
- Recommendations: [List]
```

### 创建 Agent 的最佳实践

| 原则 | 说明 |
|------|------|
| **单一职责** | 一个 Agent，一个领域 |
| **明确触发** | 使用 "MUST BE USED" 和 "PROACTIVELY" |
| **最小工具** | 仅授予必要权限 |
| **结构化输出** | 定义一致的输出格式 |

---

## 最佳实践

### Agent 选择指南

| 任务类型 | 推荐 Agent |
|----------|-----------|
| 代码质量检查 | code-auditor |
| 安全漏洞扫描 | security-auditor |
| 性能优化 | performance-auditor |
| 架构评审 | architecture-auditor |
| 测试生成 | test-engineer |
| 项目设置 | project-architect |
| 发布管理 | release-manager |
| 复杂任务分解 | task-orchestrator |
| 战略决策 | strategic-analyst |
| 市场策略规划 | marketing-strategist |
| 用户增长分析 | growth-hacker |
| 内容创作 | content-creator |
| 应用商店优化 | aso-specialist |
| 社区运营 | community-manager |
| 竞品分析 | competitive-analyst |
| 市场调研 | market-researcher |
| 产品上市策略 | gtm-strategist |
| 用户研究 | user-researcher |

### 效率提升技巧

```
┌─────────────────────────────────────────────────────────────┐
│                     效率提升技巧                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 批量操作                                                 │
│     "Run all auditors on the module"                        │
│     而不是单独调用每个 auditor                               │
│                                                             │
│  2. 上下文共享                                               │
│     "Based on code-auditor's findings, have security-       │
│      auditor focus on the authentication issues"            │
│                                                             │
│  3. 显式链式调用                                             │
│     "First strategic-analyst, then project-architect,       │
│      finally test-engineer"                                 │
│                                                             │
│  4. 并行执行                                                 │
│     "Have security and performance auditors review          │
│      simultaneously"                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 常见错误避免

| 错误 | 正确做法 |
|------|----------|
| 跳过代码审查 | 任何代码变更后使用 code-auditor |
| 忽略安全检查 | 涉及认证/数据时使用 security-auditor |
| 手写所有测试 | 让 test-engineer 生成基础测试 |
| 直接发布 | 使用 release-manager 准备发布 |
| 盲目重构 | 先用 architecture-auditor 分析 |

---

## Agent 能力矩阵

| Agent | Read | Write | Edit | Bash | MCP | WebFetch | 主要职责 |
|-------|------|-------|------|------|-----|----------|----------|
| code-auditor | Y | - | - | Y | - | Y | 代码质量 |
| security-auditor | Y | Y | Y | Y | Y | Y | 安全审计 |
| performance-auditor | Y | - | - | Y | - | - | 性能优化 |
| architecture-auditor | Y | - | - | Y | - | - | 架构评审 |
| test-engineer | Y | Y | Y | Y | - | - | 测试生成 |
| project-architect | Y | Y | Y | Y | - | - | 项目设置 |
| task-orchestrator | Y | Y | Y | Y | - | - | 任务编排 |
| release-manager | Y | Y | Y | Y | - | Y | 发布管理 |
| strategic-analyst | Y | Y | - | Y | Y | Y | 战略分析 |
| integration-manager | Y | Y | - | Y | Y | Y | 集成管理 |
| marketing-strategist | Y | Y | - | - | - | Y | 市场策略 |
| growth-hacker | Y | Y | - | - | - | Y | 用户增长 |
| content-creator | Y | Y | Y | - | - | - | 内容创作 |
| aso-specialist | Y | Y | - | - | - | Y | ASO优化 |
| community-manager | Y | Y | - | - | - | - | 社区运营 |
| competitive-analyst | Y | Y | - | - | - | Y | 竞品分析 |
| market-researcher | Y | Y | - | - | - | Y | 市场调研 |
| gtm-strategist | Y | Y | - | - | - | Y | 产品上市 |
| user-researcher | Y | Y | - | - | - | Y | 用户研究 |

---

## 快速参考

### 常用调用短语

```bash
# 代码审查
"Review my code"
"Check code quality"

# 安全检查
"Check for security issues"
"Audit for vulnerabilities"

# 性能优化
"Optimize performance"
"Find bottlenecks"

# 测试生成
"Generate tests"
"Ensure test coverage"

# 发布准备
"Prepare release"
"Deploy hotfix"

# 架构评审
"Review architecture"
"Design the system"

# 任务管理
"Break down this task"
"Plan the implementation"
```

### Agent 链快速参考

```bash
# PR 审查链
code-auditor → security-auditor → test-engineer

# 新功能开发链
strategic-analyst → project-architect → test-engineer → release-manager

# Bug 修复链
code-auditor → fix → test-engineer → release-manager

# 全面审计链
code-auditor + security-auditor + performance-auditor + architecture-auditor
```

---

*文档位置: `docs/09-reference/agents-guide.md`*
*最后更新: 2026-01-24*
