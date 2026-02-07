## 调研目标

分析 Standard Ebooks 与 Project Gutenberg 两种 EPUB 来源的格式差异，制定统一的精排版处理方案。

---

### 1.2 关键差异

| 维度 | Standard Ebooks | Project Gutenberg |
|------|-----------------|-------------------|
| **文件命名** | 语义化 (`chapter-1.xhtml`) | 随机前缀 (`7082629484074162170_1342-h-0.htm.html`) |
| **章节组织** | 每章独立文件 | 多章合并在一个文件 |
| **CSS 架构** | 分层设计 (core/local/se) | 单一 CSS + pgepub.css |
| **图片命名** | 语义化 (`cover.jpg`) | 随机前缀 (`5642883813897609249_cover.jpg`) |
| **boilerplate** | 无 | 包含版权声明、元数据 |

---

### 2.1 Standard Ebooks 章节结构

**特点：**
- EPUB 3.0 语义属性 (`epub:type`, `role`)
- 干净的段落结构，无冗余标签
- 标题使用 `<abbr>` 处理缩写
- 无装饰性元素

### 2.2 Project Gutenberg 章节结构

**特点：**
- XHTML 1.1 声明
- 包含 Gutenberg 版权声明 boilerplate
- 章节标题内嵌装饰图片
- 使用 Drop Cap (`<span class="letra">`)
- 大量 Gutenberg 专用 class (`pg-boilerplate`, `pgheader`, `nind`, `letra`)

---

### 3.1 Standard Ebooks CSS

**设计特点：**
- 使用 CSS 断页控制 (`break-after`, `page-break-after`)
- 老式数字 (`font-variant-numeric: oldstyle-nums`)
- 自动断字 (`hyphens: auto`)
- 美化文本换行 (`text-wrap: pretty`)
- 小型大写字母标题 (`font-variant: small-caps`)

### 3.2 Project Gutenberg CSS

**设计特点：**
- 百分比边距（不适合手机）
- 两端对齐 (`text-align: justify`)
- Drop Cap 使用大字体实现 (`.letra`)
- 章节强制分页 (`page-break-before: always`)
- Gutenberg boilerplate 分页隔离

---

### 4.1 Gutenberg 专有问题

| 问题 | 严重程度 | 原因 | 影响范围 |
|------|----------|------|---------|
| **Boilerplate 污染** | 高 | 版权声明混入正文 | 每本书首页 |
| **Drop Cap 失效** | 中 | 图片 + CSS 双模式实现 | 章节开头 |
| **章节解析困难** | 高 | 多章合并单文件 | 整本书 |
| **百分比边距** | 中 | 宽屏设计假设 | 全书排版 |
| **装饰图片** | 低 | 章节标题内嵌图片 | 章节标题 |

### 4.2 通用问题（两种来源都有）

| 问题 | 严重程度 | 原因 |
|------|----------|------|
| **图片溢出** | 高 | 原图尺寸 > 屏幕 |
| **分页文字截断** | 高 | 分页算法缺陷 |
| **大段空白** | 中 | 分页策略保守 |
| **标题保护** | 中 | 标题与内容分离 |
| **表格溢出** | 中 | 表格宽度 > 屏幕 |

### 4.3 Standard Ebooks 特有问题

| 问题 | 严重程度 | 原因 |
|------|----------|------|
| **缺少封面章节** | 中 | EPUB 结构未包含 Cover 章节 |
| **标题重复** | 低 | 章节标题与 TOC 标题重复 |

---

### 7.1 Apple Books 排版特点

| 特性 | Apple Books 实现 | 当前阅读器状态 |
|------|-----------------|---------------|
| **文本流动** | 内容自然流动，填满页面 | 部分实现（分页算法优化中） |
| **边距自适应** | 根据屏幕宽度动态调整 | 固定边距 |
| **行高比例** | 1.5x 字体大小 | 可配置 |
| **段落间距** | 0.5em | 0.2em |
| **首行缩进** | 1em | 1em |
| **图片处理** | 自动缩放 + 点击放大 | 自动缩放（无放大） |
| **字体选择** | 系统字体 + 自定义 | 可配置 |
| **深色模式** | 平滑过渡 | 已支持 |

---

### 8.1 Standard Ebooks 的优点

- 干净的 HTML 结构，无冗余标签
- 语义化标记 (EPUB 3.0)
- 专业的 CSS 排版规则
- 断页控制属性
- 统一的文件组织

### 8.2 Standard Ebooks 的不足

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| **无 Cover 章节** | EPUB 结构设计 | Pipeline 自动添加 |
| **标题可能重复** | TOC + 正文都有标题 | 渲染时去重 |
| **固定宽度假设** | 设计针对 e-ink 阅读器 | 阅读器覆盖样式 |
| **图片可能过大** | 原书高分辨率 | 阅读器限制尺寸 |

### 8.3 结论

Standard Ebooks 在源文件质量上明显优于 Gutenberg，但仍需阅读器端处理才能达到最佳手机显示效果。

---

### 9.1 短期优化 (Pipeline 改进)

| 任务 | 优先级 | 复杂度 |
|------|--------|--------|
| Gutenberg boilerplate 移除 | P0 | 低 |
| Drop Cap 标准化 | P1 | 中 |
| 封面章节自动添加 | P0 | 低 |
| 章节标题去重 | P1 | 低 |

### 9.2 中期优化 (阅读器改进)

| 任务 | 优先级 | 复杂度 |
|------|--------|--------|
| 分页算法重构 | P0 | 高 |
| CSS 样式统一 | P1 | 中 |
| 图片处理优化 | P1 | 中 |
| 边距自适应 | P2 | 中 |

### 9.3 长期优化 (Apple Books 对标)

| 任务 | 优先级 | 复杂度 |
|------|--------|--------|
| 图片点击放大 | P2 | 中 |
| 翻页动画优化 | P3 | 高 |
| 字体选择增强 | P3 | 中 |
| 阅读进度同步 | P3 | 高 |

---

### 已记录问题清单

| 文档 | 问题数量 | 主要内容 |
|------|----------|---------|
| `epub-reader-mobile-issues.md` | 15 | 图片溢出、Drop Cap、CSS 丢失等 |
| `epub-reader-mobile-issues2.md` | 16 | 分页算法、孤行保护、Gutenberg 版权等 |
| `epub-reader-mobile-issues3.md` | 2 | Cover 章节、内容截断 |

### 测试书籍

| 书籍 | 来源 | 主要测试点 |
|------|------|-----------|
| Pride and Prejudice | Standard Ebooks / Gutenberg | 对比测试 |
| The Young Pilgrim | Gutenberg | Drop Cap, 装饰图片 |
| The Picture of Dorian Gray | Standard Ebooks | 分页算法 |

---

*文档生成日期: 2026-01-25*
