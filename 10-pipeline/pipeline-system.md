# Readmigo 生产流水线系统

> 可扩展的自动化处理流水线集合 | 数据同步 | 内容处理 | 发布管理

---

## 一、流水线系统总览

```mermaid
flowchart TD
    subgraph ENTRY["流水线选择入口"]
        P001["P001<br>Debug→Stg 同步"]
        P002["P002<br>金句生成"]
        P003["P003<br>(待扩展)"]
        P00X["P00X<br>(待扩展)"]
    end

    P001 --> ENGINE
    P002 --> ENGINE
    P003 --> ENGINE
    P00X --> ENGINE

    subgraph ENGINE["流水线执行引擎"]
        IV["输入验证"] --> SD["阶段调度"] --> PT["进度追踪"] --> ER["错误恢复"] --> RR["结果报告"]
    end
```

### 1.1 流水线注册表

| 编号 | 流水线名称 | 描述 | 状态 | 文档链接 |
|------|-----------|------|------|----------|
| **P001** | Debug→Staging 同步 | 书单同步到 Staging 环境 | ✅ 可用 | [详细文档](./P001-debug-staging-sync.md) |
| **P002** | 金句数据生成 | 从公开渠道采集/生成作者金句 | ✅ 可用 | [详细文档](./P002-generate-quotes.md) |
| P003 | 待定义 | - | ⏳ 规划中 | - |
| **P004** | 全栈发版流水线 | iOS/Android/Backend/Web 统一发版 | ✅ 可用 | [详细文档](./P004-fullstack-release.md) |

### 1.2 运行环境

所有流水线均运行在 **Digital Ocean Droplet 服务器**上：

| 特性 | 说明 |
|------|------|
| 运行位置 | Droplet 服务器 |
| 会话管理 | tmux/screen 持久会话 |
| 执行时长 | 支持长时间运行 (数小时-数天) |
| 断点续传 | 支持检查点机制 |
| 进度监控 | 实时日志 + 状态查询 |

### 1.3 通用流水线结构

```mermaid
flowchart LR
    S1["Stage 1<br>输入验证"] --> S2["Stage 2<br>处理阶段"] --> S3["Stage 3<br>处理阶段"] --> SN["Stage N<br>处理阶段"] --> DONE["完成报告"]

    S1 --> LOG["执行日志 & 状态追踪"]
    S2 --> LOG
    S3 --> LOG
    SN --> LOG
```

---

## 二、如何添加新流水线

### 2.1 添加步骤

```mermaid
flowchart LR
    DEF["需求定义<br>- 确定输入<br>- 定义阶段<br>- 预期输出"] --> DOC["文档编写<br>- 创建文档<br>- 定义流程<br>- 可视化图"]
    DOC --> IMPL["脚本实现<br>- 开发脚本<br>- 测试验证"]
    IMPL --> REG["注册上线<br>- 更新注册表<br>- 更新入口"]
```

### 2.2 文档模板

每个流水线需要包含以下部分：

| 章节 | 必需 | 描述 |
|------|:----:|------|
| 概述 | ✅ | 流水线目的和使用场景 |
| 输入规范 | ✅ | 输入格式、来源、验证规则 |
| 阶段定义 | ✅ | 每个处理阶段的详细说明 |
| 输出规范 | ✅ | 输出格式、目标位置 |
| 执行命令 | ✅ | 如何启动流水线 |
| 错误处理 | ✅ | 常见错误和恢复方案 |
| 依赖关系 | ⭕ | 与其他流水线的关系 |

---

## 三、流水线命名规范

| 组成部分 | 格式 | 示例 |
|----------|------|------|
| 编号前缀 | P + 三位数字 | P001, P002, P100 |
| 名称 | 简洁描述性 | Debug→Staging 同步 |
| 文件名 | 编号-短横线名称 | P001-debug-staging-sync.md |

---

## 四、规划中的流水线

> 以下流水线计划逐步实现

| 编号 | 名称 | 预计用途 | 优先级 |
|------|------|----------|:------:|
| P003 | 封面生成流水线 | 批量生成/处理书籍封面 | 高 |
| P005 | 音频处理流水线 | 有声书音频转码和分段 | 中 |
| P006 | 翻译同步流水线 | 多语言内容同步 | 中 |
| P007 | 数据清洗流水线 | 重复检测和数据修复 | 低 |

---

## 五、相关文档索引

| 文档 | 描述 |
|------|------|
| [P001-debug-staging-sync.md](./P001-debug-staging-sync.md) | Debug→Staging 同步流水线详细设计 |
| [P002-generate-quotes.md](./P002-generate-quotes.md) | 金句数据生成流水线详细设计 |
| [P004-fullstack-release.md](./P004-fullstack-release.md) | 全栈发版流水线详细设计 |
| [../releases/release-history.md](../releases/release-history.md) | 版本发布历史与功能快照 |
| [../infrastructure/data-sync-and-release-workflow.md](../infrastructure/data-sync-and-release-workflow.md) | 数据同步与发布工作流程 |
| [../infrastructure/debug-staging-setup-plan.md](../infrastructure/debug-staging-setup-plan.md) | Debug/Staging 环境搭建计划 |

