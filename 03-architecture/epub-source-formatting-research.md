# EPUB 源格式差异研究报告

## 调研目标

分析 Standard Ebooks 与 Project Gutenberg 两种 EPUB 来源的格式差异，制定统一的精排版处理方案。

---

## 一、EPUB 结构对比

### 1.1 文件组织结构

```
Standard Ebooks                          Project Gutenberg
├── mimetype                             ├── mimetype
├── META-INF/                            ├── META-INF/
│   └── container.xml                    │   └── container.xml
├── epub/                                └── OEBPS/
│   ├── content.opf                          ├── *.css
│   ├── css/                                 ├── *_cover.jpg
│   │   ├── core.css                         ├── *_*.jpg (大量图片)
│   │   ├── local.css                        ├── *_*.htm.html (多章合并)
│   │   └── se.css                           ├── pgepub.css
│   ├── images/                              └── wrap0000.html
│   │   ├── cover.jpg
│   │   ├── titlepage.png
│   │   └── logo.png
│   └── text/
│       ├── chapter-1.xhtml
│       ├── chapter-2.xhtml
│       └── ... (每章独立文件)
```

### 1.2 关键差异

| 维度 | Standard Ebooks | Project Gutenberg |
|------|-----------------|-------------------|
| **文件命名** | 语义化 (`chapter-1.xhtml`) | 随机前缀 (`7082629484074162170_1342-h-0.htm.html`) |
| **章节组织** | 每章独立文件 | 多章合并在一个文件 |
| **CSS 架构** | 分层设计 (core/local/se) | 单一 CSS + pgepub.css |
| **图片命名** | 语义化 (`cover.jpg`) | 随机前缀 (`5642883813897609249_cover.jpg`) |
| **boilerplate** | 无 | 包含版权声明、元数据 |

---

## 二、HTML 结构对比

### 2.1 Standard Ebooks 章节结构

```html
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      lang="en-GB"
      epub:prefix="z3998: http://www.daisy.org/z3998/2012/vocab/structure/">
  <head>
    <title>I</title>
    <link href="../css/core.css" rel="stylesheet"/>
    <link href="../css/local.css" rel="stylesheet"/>
  </head>
  <body epub:type="bodymatter z3998:fiction">
    <section id="chapter-1" role="doc-chapter" epub:type="chapter">
      <h2 epub:type="ordinal z3998:roman">I</h2>
      <p>It is a truth universally acknowledged...</p>
    </section>
  </body>
</html>
```

**特点：**
- EPUB 3.0 语义属性 (`epub:type`, `role`)
- 干净的段落结构，无冗余标签
- 标题使用 `<abbr>` 处理缩写
- 无装饰性元素

### 2.2 Project Gutenberg 章节结构

```html
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <title>Pride and prejudice | Project Gutenberg</title>
  <link href="0.css" rel="stylesheet"/>
  <link href="pgepub.css" rel="stylesheet"/>
  <meta name="generator" content="Ebookmaker 0.13.8"/>
</head>
<body class="x-ebookmaker x-ebookmaker-2">
  <!-- Gutenberg Boilerplate -->
  <div class="pg-boilerplate pgheader" id="pg-header">
    <h2>The Project Gutenberg eBook of Pride and Prejudice</h2>
    <div>This ebook is for the use of anyone anywhere...</div>
    <div id="pg-start-separator">
      <span>*** START OF THE PROJECT GUTENBERG EBOOK ***</span>
    </div>
  </div>

  <!-- 章节内容 -->
  <h2 id="Chapter_I">
    <img src="*_i_030.jpg"/>  <!-- 装饰图片 -->
    Chapter I.
  </h2>
  <p class="nind">
    <span class="letra">I</span>T is a truth...  <!-- Drop Cap -->
  </p>
</body>
</html>
```

**特点：**
- XHTML 1.1 声明
- 包含 Gutenberg 版权声明 boilerplate
- 章节标题内嵌装饰图片
- 使用 Drop Cap (`<span class="letra">`)
- 大量 Gutenberg 专用 class (`pg-boilerplate`, `pgheader`, `nind`, `letra`)

---

## 三、CSS 样式对比

### 3.1 Standard Ebooks CSS

```css
/* core.css - 排版基础 */
body {
    font-variant-numeric: oldstyle-nums;
    hyphens: auto;
    text-wrap: pretty;
}

p {
    margin: 0;
    text-indent: 1em;
}

h1, h2, h3, h4, h5, h6 {
    break-after: avoid;
    page-break-after: avoid;
    break-inside: avoid;
    font-variant: small-caps;
    hyphens: none;
    margin: 3em 0;
    text-align: center;
}

hr {
    border: none;
    border-top: 1px solid;
    width: 25%;
    margin: 1.5em auto;
}
```

**设计特点：**
- 使用 CSS 断页控制 (`break-after`, `page-break-after`)
- 老式数字 (`font-variant-numeric: oldstyle-nums`)
- 自动断字 (`hyphens: auto`)
- 美化文本换行 (`text-wrap: pretty`)
- 小型大写字母标题 (`font-variant: small-caps`)

### 3.2 Project Gutenberg CSS

```css
/* 0.css - 基础样式 */
body {
    margin-left: 4%;
    margin-right: 6%;
}

p {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
    text-align: justify;
    text-indent: 4%;
}

.letra {
    font-size: 250%;
    margin-top: -1%;
}

.figcenter {
    margin: 3% auto;
    text-align: center;
}

/* pgepub.css - 阅读器兼容 */
h2 {
    page-break-before: always;
}

#pg-header {
    page-break-after: always;
}
```

**设计特点：**
- 百分比边距（不适合手机）
- 两端对齐 (`text-align: justify`)
- Drop Cap 使用大字体实现 (`.letra`)
- 章节强制分页 (`page-break-before: always`)
- Gutenberg boilerplate 分页隔离

---

## 四、问题分类与影响

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

## 五、EPUB 源文件预处理方案

### 5.1 Gutenberg 书籍处理流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Gutenberg EPUB 预处理 Pipeline                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: Boilerplate 移除                                           │
│  ├─ 删除 .pg-boilerplate, #pg-header, #pg-footer                   │
│  ├─ 删除 "*** START OF THE PROJECT GUTENBERG EBOOK ***" 分隔线     │
│  └─ 保留纯文本内容                                                  │
│                                                                     │
│  Step 2: 章节拆分                                                   │
│  ├─ 解析 TOC (NCX/NAV)                                             │
│  ├─ 按 anchor ID 拆分单文件为多章节                                │
│  └─ 每章节独立存储                                                  │
│                                                                     │
│  Step 3: Drop Cap 标准化                                            │
│  ├─ 检测 img.dropcap + p.dropcap 组合                              │
│  ├─ 转换为统一 CSS first-letter 实现                               │
│  └─ 移除装饰图片（可选保留为配图）                                  │
│                                                                     │
│  Step 4: 样式清理                                                   │
│  ├─ 移除 Gutenberg 专用 class (nind, letra, blk, pginternal)       │
│  ├─ 转换百分比边距为固定值                                          │
│  └─ 保留语义化样式 (figcenter, caption)                            │
│                                                                     │
│  Step 5: 图片处理                                                   │
│  ├─ 重命名为语义化名称                                              │
│  ├─ 压缩优化 (max 1200px)                                          │
│  └─ 装饰图片分类（封面/插图/Drop Cap）                             │
│                                                                     │
│  Step 6: 添加封面章节                                               │
│  └─ 与 Standard Ebooks 处理一致                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Standard Ebooks 处理流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Standard Ebooks 预处理 Pipeline                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: 添加封面章节                                               │
│  ├─ 检测是否存在 Cover 章节                                        │
│  ├─ 提取 cover.jpg 创建独立 Cover 章节                             │
│  └─ 调整章节顺序 (Cover = order 1)                                 │
│                                                                     │
│  Step 2: 标题去重                                                   │
│  ├─ 比较章节 HTML 内 H2 与 TOC 标题                                │
│  └─ 移除重复标题                                                    │
│                                                                     │
│  Step 3: 样式保留                                                   │
│  └─ 保留 SE 语义化属性 (epub:type, role)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 六、阅读器端处理方案

### 6.1 CSS 样式注入

```css
/* 通用样式 - reader-template.ts */

/* 图片防溢出 */
img {
    max-width: 100%;
    max-height: 80vh;
    height: auto;
    width: auto;
    object-fit: contain;
}

/* Drop Cap 统一实现 */
p.dropcap::first-letter,
.chapter-content > p:first-of-type::first-letter {
    float: left;
    font-size: 3.5em;
    line-height: 0.8;
    padding-right: 0.1em;
    margin-top: 0.05em;
}

/* 隐藏 Gutenberg Drop Cap 图片 */
img.dropcap {
    display: none;
}

/* 封面全屏 */
img.cover, img.x-ebookmaker-cover {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: 0;
}

/* 图片居中 */
.figcenter, div.figcenter {
    text-align: center;
    margin: 1em auto;
}

/* 说明文字 */
.caption, .caption p {
    font-size: 0.85em;
    color: var(--text-secondary);
    text-align: center;
    margin-top: 0.5em;
}
```

### 6.2 分页算法优化

```
┌────────────────────────────────────────────────────────────────────┐
│                     分页算法关键改进                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. 内容扁平化                                                      │
│  ├─ 忽略容器元素 (section, div.wrapper)                           │
│  └─ 提取可见内容块 (p, h1-h6, img, table)                         │
│                                                                    │
│  2. 超长元素分割                                                    │
│  ├─ 检测元素高度 > pageHeight                                      │
│  ├─ 按单词边界分割长段落                                           │
│  └─ 确保句子完整，避免单词截断                                     │
│                                                                    │
│  3. 智能填充                                                        │
│  ├─ 尽量填满当前页剩余空间                                         │
│  ├─ 避免保守移动导致大段空白                                       │
│  └─ 孤行保护（页首/页尾至少 2 行）                                 │
│                                                                    │
│  4. 特殊元素处理                                                    │
│  ├─ 封面图片独占一页                                               │
│  ├─ 标题与首段保持同页                                             │
│  └─ 图片 + 说明文字不分离                                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 七、Apple Books 对标分析

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

### 7.2 需要改进的点

```
┌────────────────────────────────────────────────────────────────────┐
│                    向 Apple Books 对齐的改进点                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  优先级 1 (影响阅读体验)                                            │
│  ├─ 分页算法优化 - 消除内容截断和大段空白                          │
│  ├─ 边距动态调整 - 根据屏幕宽度计算最佳边距                        │
│  └─ 行高优化 - 使用 1.5x 比例                                      │
│                                                                    │
│  优先级 2 (提升体验)                                                │
│  ├─ 图片点击放大 - 查看高清原图                                    │
│  ├─ 翻页动画优化 - 更流畅的过渡效果                                │
│  └─ 字体选择 - 提供更多字体选项                                    │
│                                                                    │
│  优先级 3 (锦上添花)                                                │
│  ├─ 阅读进度同步 - 跨设备位置同步                                  │
│  ├─ 注释高亮 - 文本选择和标注                                      │
│  └─ 字典查词 - 长按查词功能                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 八、Standard Ebooks 是否完美？

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

## 九、实施建议

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

## 十、参考资料

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
