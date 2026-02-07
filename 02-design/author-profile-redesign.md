# 作者主页重新设计方案

## 当前问题分析

### 信息冗余

**问题**：
- 文学流派、历史时期、主要体裁在"作者信息"和"文明地图-文学坐标"中重复出现
- 影响网络占用大量屏幕空间，信息密度低
- 写作风格独立成一个模块，与作者信息分离，不够紧凑
- 整体信息层次不清晰

---

## 新设计方案

### 整体布局结构


---

## 模块详细设计

### 1. Hero Header (保持不变)
- 作者头像（带时代渐变背景）
- 作者名（大写字母）
- 粉丝数
- 关注按钮

### 2. 文学档案 (Literary Profile) - **新合并模块**

将原有的"作者信息"、"写作风格"、"文明地图"三个模块合并为一个统一的"文学档案"卡片。

#### 结构设计


#### 设计原则

| 原则 | 说明 |
|------|------|
| 单一入口 | 所有关于"作者是谁"的信息集中在一个模块 |
| 渐进展示 | 从基本信息到深度信息，由简到繁 |
| 去重 | 删除文学坐标、体裁、主题在多处的重复展示 |
| 紧凑布局 | 使用列表式而非卡片式展示写作风格 |

### 3. 影响网络 - **隐藏**

根据需求，影响网络模块将被隐藏。原因：
- 占用大量屏幕空间
- 信息与"相关作者"模块有重叠
- 普通用户关注度较低

### 4. 其他模块顺序调整

| 序号 | 模块 | 说明 |
|------|------|------|
| 1 | Hero Header | 头像、名字、关注 |
| 2 | **文学档案** | 合并后的新模块 |
| 3 | 名言名句 | 作者经典语录 |
| 4 | 关于作者 | 作者简介 (bio) |
| 5 | 代表作品 | 标签形式展示 |
| 6 | 生平与著作 | 时间线 |
| 7 | 阅读挑战 | 读完全部作品挑战 |
| 8 | 著作列表 | 水平滚动书籍 |
| 9 | 相关作者 | 同时代/风格相似作者 |

---

## 视觉设计规范

### 文学档案卡片样式


### 写作风格列表样式


---

## 实现变更清单

### 删除的组件
- `LiteraryPositionCard` (CivilizationMapSection.swift)
- `InfluenceNetworkCard` (CivilizationMapSection.swift)
- `InfluenceSectionRow` (CivilizationMapSection.swift)
- `AuthorLinkCard` (CivilizationMapSection.swift)
- `writingStyleSection` 中的卡片网格布局

### 修改的组件
- `authorInfoSection` → 重命名为 `literaryProfileSection`
- 合并原有三个模块的内容到新模块

### 新增的组件
- `LiteraryProfileCard` - 新的合并模块视图
- `WritingStyleListItem` - 列表式写作风格项

### 保留的组件
- `CrossDomainCard` - 移入文学档案
- `HistoricalContextCard` - 移入文学档案

---

## 本地化需求

### 需要本地化的数据库字段

| 实体 | 字段 | 说明 |
|------|------|------|
| Author | bio | 作者传记 |
| Author | writingStyle | 写作风格描述 |
| AuthorTimelineEvent | title | 时间线事件标题 |
| AuthorTimelineEvent | description | 时间线事件描述 |
| AuthorQuote | text | 名言文本 |
| AuthorQuote | source | 名言出处 |
| DomainPosition | domain | 领域名称 |
| DomainPosition | contributions | 贡献列表 |
| CivilizationHistoricalEvent | title | 历史事件标题 |

### 本地化优先级


---

## 待确认事项

1. **写作风格展示数量**: 是否限制最多展示 3-4 个？
2. **跨领域贡献**: 如果为空是否完全隐藏整个子模块？
3. **历史背景**: 最多展示几条事件？
4. **相关作者数据来源**: 隐藏影响网络后，是否保留 API 中的 influences 数据用于计算相关作者？
