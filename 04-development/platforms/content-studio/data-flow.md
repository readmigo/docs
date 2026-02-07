# 数据流与系统集成

## Content Studio 在整体流程中的位置

```mermaid
flowchart TD
    A["EPUB 文件"] --> B["Pipeline (EPUB 解析)<br>解压 EPUB / 解析元数据<br>提取章节内容 / 基础 HTML 清理"]
    B -->|"原始解析结果"| C["Content Studio"]
    subgraph C["Content Studio"]
        C1["自动应用已学规则"] --> C2["人工校正 & 修复"]
        C2 --> C3["质量审核 & 发布"]
        C2 --> C4["学习系统<br>模式识别 / 规则生成 / 置信度计算"]
        C4 --> C1
    end
    C -->|"校正后的内容"| D["Readmigo 数据库<br>books / chapters<br>content_corrections / correction_rules"]
    D --> E["用户端 APP<br>(iOS / Android)"]
```

## 数据流详解

### 输入数据

| 来源 | 数据类型 | 说明 |
|------|----------|------|
| Pipeline | 原始 HTML | 经过初步解析的章节内容 |
| Pipeline | 书籍元数据 | 标题、作者、封面等 |
| 数据库 | 校正规则 | 已积累的自动校正规则 |
| 数据库 | 学习模式 | 从历史校正中学习到的模式 |

### 输出数据

| 目标 | 数据类型 | 说明 |
|------|----------|------|
| 数据库 | 校正后 HTML | 经过人工校正的章节内容 |
| 数据库 | 校正日志 | 每次校正操作的详细记录 |
| 数据库 | 新规则 | 从学习模式转化的规则 |

## 数据库表关系

```mermaid
flowchart TD
    A["books<br>id, title, content_status"] --> C["content_corrections<br>id, book_id, chapter_id<br>fix_type, before_html, after_html<br>status, rule_id"]
    B["chapters<br>book_id, original_html<br>corrected_html"] --> C
    A --- B
    C -->|"聚合分析"| D["learned_patterns<br>pattern_hash, action_type<br>selector_pattern, occurrences<br>confidence, status"]
    D --> E["correction_rules<br>id, name, selector<br>action_type, source<br>confidence, is_active"]
```

## 状态流转

### 书籍内容状态

```mermaid
flowchart TD
    A["pending<br>待处理"] -->|"Pipeline 解析完成"| B["auto_fixed<br>已自动修复"]
    B -->|"进入 Content Studio"| C["in_review<br>审核中"]
    C -->|"人工校正完成"| D["approved<br>已批准"]
    D -->|"发布"| E["published<br>已发布"]
```

### 修复项状态

```mermaid
flowchart TD
    A1["auto_applied<br>(自动应用)"] --> B["人工审核决策"]
    A2["pending_confirm<br>(待确认)"] --> B
    A3["suggestion<br>(建议)"] --> B
    B --> C1["confirmed<br>(已确认)"]
    B --> C2["reverted<br>(已回滚)"]
    B --> C3["rejected<br>(已拒绝)"]
```
