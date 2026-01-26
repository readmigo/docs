# EPUB 阅读器手机屏幕适配问题清单 (第二批)

## 概述

基于 Content Studio 调试过程中新发现的阅读器问题，持续补充的问题清单。

---

## 问题总览

| 问题类型 | 严重程度 | 状态 |
|----------|----------|------|
| 章节标题重复显示 | 🟠 中等 | ✅ |
| Dropcap 图片尺寸过大 | 🟡 轻微 | ✅ |
| 空段落导致空白页 | 🟠 中等 | ✅ |
| 超大元素处理（标题单独占页 + 内容截断） | 🔴 严重 | ✅ |
| HR 单独成页 | 🟡 轻微 | ✅ |
| 图片未居中显示 | 🟠 中等 | ✅ |
| Dropcap 分页导致空白页 | 🟠 中等 | ✅ |
| 单词中断分页 | 🟠 中等 | ✅ |
| Dropcap 段落拆分后的孤立文本 | 🟠 中等 | ✅ |
| 孤立文本被 overflow:hidden 裁切 | 🔴 严重 | ⚠️ 被问题11取代 |
| MERGE 方案死循环 → ORPHAN PREVENTION | 🔴 严重 | ✅ |
| Dropcap 首字符重复显示 | 🟠 中等 | ✅ |
| EPUB 章节解析丢失 | 🔴 严重 | ✅ |
| Cover 章节自动添加问题 | 🟠 中等 | ✅ |
| Project Gutenberg 版权信息残留 | 🟠 中等 | ✅ |
| 图片标题 (caption) 字体过大且未居中 | 🟡 轻微 | ✅ |

---

## 问题 1：章节标题重复显示 (阅读器 Bug)

### 问题表现

某些章节页面顶部出现两个相同或相似的标题，例如：
- H1 显示 "Preface"（阅读器模板注入的章节标题）
- H2 显示 "Preface."（EPUB 原始内容中的标题）

```
┌─────────────────────────────┐
│                             │
│     Preface                 │  ← H1 (模板注入)
│                             │
│     Preface.                │  ← H2 (EPUB 原始内容)
│                             │
│  The following pages...     │
│                             │
└─────────────────────────────┘
```

### 根本原因

```
阅读器 HTML 生成流程：
├─ 模板添加 H1 章节标题 (chapterTitle)
├─ 插入 EPUB 章节原始 HTML 内容
│   └─ 原始内容中已有 H2 标题
└─ 结果：H1 + H2 两个标题重复显示
```

EPUB 原始内容结构：
```html
<h2>Preface.</h2>
<p>The following pages contain...</p>
```

阅读器模板生成：
```html
<h1 class="chapter-title">Preface</h1>
<!-- EPUB 原始内容 -->
<h2>Preface.</h2>
<p>The following pages contain...</p>
```

### 问题分析

| 来源 | 标签 | 内容 | 说明 |
|------|------|------|------|
| 模板 | H1 | Preface | 从章节元数据获取 |
| EPUB | H2 | Preface. | 原始内容中的标题 |

两者文本内容相同（忽略标点），导致视觉上重复。

### V2 解决方案

```
标题去重逻辑：
├─ 获取章节标题 (chapterTitle)
├─ 标准化处理：转小写、移除非字母数字字符
├─ 使用正则匹配 HTML 中的 H2 标签
├─ 对每个 H2 提取文本内容并标准化
├─ 若 H2 文本 === 章节标题，则移除该 H2
└─ 保留不匹配的 H2 标签
```

### 修复代码

```javascript
// reader-template.ts

// 移除与章节标题重复的 H2 标签
let processedHtml = html;
if (chapterTitle) {
    // 标准化章节标题：小写 + 仅保留字母数字
    const normalizedChapterTitle = chapterTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    // 匹配所有 H2 标签，检查内容是否与章节标题相同
    // 使用 [\s\S]*? 替代 .*? 以匹配包括换行符的所有字符
    processedHtml = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (match, content) => {
        // 移除 HTML 标签，标准化内容
        const normalizedContent = content
            .replace(/<[^>]*>/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        if (normalizedContent === normalizedChapterTitle) {
            return ''; // 移除重复的 H2
        }
        return match; // 保留不重复的 H2
    });
}

const contentHtml = coverHtml + processedHtml;
```

### 正则表达式说明

| 模式 | 说明 |
|------|------|
| `.*?` | 匹配任意字符（不含换行符），非贪婪 |
| `[\s\S]*?` | 匹配任意字符（含换行符），非贪婪 |

H2 内容可能包含 `<br/>` 或换行符：
```html
<h2>CHAPTER I.<br/><span>THE PILGRIM'S CALL.</span></h2>
```
使用 `[\s\S]*?` 可正确匹配跨行内容。

### 标准化处理说明

| 原始文本 | 标准化后 | 说明 |
|----------|----------|------|
| "Preface" | "preface" | H1 章节标题 |
| "Preface." | "preface" | H2 原始标题，移除标点 |
| "CHAPTER I." | "chapteri" | 大小写 + 标点统一 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 标题重复 | 模板 H1 + EPUB H2 | 检测并移除重复的 H2 |
| 文本差异 | 标点、大小写不同 | 标准化后比较 |
| H2 嵌套标签 | H2 内可能有 span 等 | 先移除 HTML 标签再比较 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 2：Dropcap 图片尺寸过大 (阅读器 Bug)

### 问题表现

Dropcap（首字下沉装饰图片）在手机屏幕上显示过大，占用过多空间，影响阅读体验。

```
修改前 (3em)：              修改后 (2em)：
┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │
│  ███            │        │  ██             │
│  ███ It may     │        │  ██ It may per- │
│  ███ perhaps    │        │  haps be neces- │
│      be neces-  │        │  sary to give a │
│      sary...    │        │  brief explana- │
│                 │        │  tion of the... │
└─────────────────┘        └─────────────────┘
  图片占3行高度               图片占2行高度
```

### 根本原因

CSS 中 dropcap 图片尺寸设置过大：

```css
/* 原始设置 */
img.dropcap {
    max-width: 3em;   /* 约 54px @ 18px 字号 */
    max-height: 3em;
}
```

在手机小屏幕上，3em 的首字母图片占用空间过大。

### 问题分析

| 尺寸 | 像素值 (18px字号) | 占用行数 | 视觉效果 |
|------|-------------------|----------|----------|
| 3em | ~54px | 3行 | 过大，影响阅读 |
| 2em | ~36px | 2行 | 适中，平衡装饰与阅读 |
| 1.5em | ~27px | 1.5行 | 较小，装饰效果减弱 |

### V2 解决方案

```
尺寸调整：
├─ max-width: 3em → 2em (原来的 2/3)
├─ max-height: 3em → 2em
└─ margin: 0.3em → 0.2em (等比缩小间距)
```

### 修复代码

```css
/* reader-template.ts */

/* Dropcap images - decorative capital letters */
img.dropcap {
    display: inline;
    float: left;
    max-width: 2em;      /* 原 3em，缩小为 2/3 */
    max-height: 2em;     /* 原 3em，缩小为 2/3 */
    width: auto;
    height: auto;
    margin: 0 0.2em 0.05em 0;  /* 原 0.3em，等比缩小 */
    vertical-align: top;
}
```

### 关键理解

| 概念 | 说明 |
|------|------|
| CSS `max-height` | 控制 dropcap 图片的**实际视觉高度** |
| JS `estimatedHeight` | 控制分页算法中的**高度估算**（何时换页） |
| 两者独立 | 修改 estimatedHeight 不会改变视觉显示 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 图片视觉过大 | CSS max-height 设置过大 | 缩小 max-height/max-width |
| 修改 JS 无效果 | 混淆了分页参数与 CSS 样式 | 区分两者职责 |
| 尺寸选择 | 主观美观判断 | 测试多个值，选择平衡点 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 3：空段落导致空白页 (阅读器 Bug)

### 问题表现

分页后某些页面完全空白，无任何内容显示。

```
修复前 (7页)：              修复后 (6页)：
┌─────────────────┐        ┌─────────────────┐
│  第2页内容...   │        │  第2页内容...   │
└─────────────────┘        └─────────────────┘
┌─────────────────┐        ┌─────────────────┐
│                 │        │  第3页内容...   │
│   (空白页)      │        │  (原第4页)      │
│                 │        │                 │
└─────────────────┘        └─────────────────┘
     第3/7页                    第3/6页
```

### 根本原因

```
分页流程分析：
├─ 元素 [3]：长段落 (h: 473)，超过页高，强制换页
├─ 新页面开始，累计高度重置为 0
├─ 元素 [4]：空段落 <p></p> (h: 0-12)
│   └─ 空段落被添加到新页面内容中
│   └─ 但几乎无高度，页面视觉为空
└─ 元素 [5]：下一段落触发又一次换页
```

EPUB 原始内容中存在空段落（可能是格式化用途）：
```html
<p>长文本内容...</p>
<p></p>  <!-- 空段落 -->
<p>下一段内容...</p>
```

### 问题分析

| 元素 | 高度 | 累计 | 结果 |
|------|------|------|------|
| [3] 长段落 | 473 | 0→473 | 超过页高，强制换页 |
| [4] 空段落 | 0-12 | 0→12 | 添加到新页，但无视觉内容 |
| [5] 下一段 | 876 | 0→876 | 又换页，第3页只有空段落 |

### V2 解决方案

```
空元素跳过逻辑：
├─ 检测空段落：tagName === 'P' && !textContent.trim() && height < 20
├─ 完全跳过：不添加到任何页面内容
└─ 效果：空段落不占用页面空间
```

### 修复代码

```javascript
// reader-template.ts - 分页循环中

// Skip empty elements (whitespace-only paragraphs that would create blank pages)
const textContent = (el.textContent || '').trim();
const isEmptyElement = el.tagName === 'P' && !textContent && el.offsetHeight < 20;
if (isEmptyElement) {
    console.log('%c  [EMPTY P SKIP]', 'color: #9b59b6;', idx, '| h:', el.offsetHeight, '| skipping empty paragraph completely');
    // Completely skip - don't add to any page content
    return;
}
```

### 判断条件说明

| 条件 | 用途 |
|------|------|
| `el.tagName === 'P'` | 仅处理段落元素 |
| `!textContent.trim()` | 文本内容为空或仅空白 |
| `el.offsetHeight < 20` | 高度极小（排除有样式的空段落） |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 空白页 | 空段落单独占据一页 | 完全跳过空段落 |
| 之前方案无效 | 仅不计算高度但仍添加 HTML | 改为完全不添加 |
| 条件过严/过宽 | 误删有用元素或漏删空元素 | 三重条件判断 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 4：超大元素处理 (阅读器 Bug)

### 问题表现

1. **标题单独占页**：某些章节（如 Contents、List of Illustrations）第一页只显示标题，内容区域空白
2. **内容被截断**：超大元素（如 TABLE 2170px）超过页高（460px），内容丢失

```
修复前：                     修复后：
┌─────────────────┐        ┌─────────────────┐
│    Contents     │        │    Contents     │
│                 │        │  I. Chapter 1   │
│   (空白/截断)   │        │  II. Chapter 2  │
│                 │        │  III. ...       │
└─────────────────┘        └─────────────────┘
     第1/2页                    第1/8页
     (内容丢失)                 (完整分页)
```

### 根本原因

```
分页流程分析：
├─ 元素 [0]：H1 标题 (h: 82)
│   └─ H1 添加到 currentPageContent
├─ 元素 [1]：TABLE (h: 2170)
│   └─ 超大元素触发 FORCE NEW PAGE
│   └─ 先将 currentPageContent（只有 H1）保存为第 1 页
│   └─ TABLE 单独成为第 2 页
│   └─ 但 TABLE 高度 2170px > 页高 460px
│   └─ overflow: hidden 导致内容被截断
└─ 结果：第 1 页只有标题，第 2 页 TABLE 内容丢失
```

### V2 解决方案

```
超大元素分类处理：
├─ 封面图片 (isCoverImage)：保持原逻辑，单独一页
├─ 超大表格 (TABLE)：按行分割到多页，每页保留表头
├─ 超大图片 (IMG)：添加 fit-to-page class 缩放适应
├─ 其他超大元素：按子元素分割到多页
└─ 标题保护：若当前内容仅有标题，则与超大元素合并
```

### 修复代码

**CSS 新增：**
```css
/* Fit tall images to page */
img.fit-to-page {
    max-height: calc(100vh - 56px);
    width: auto;
    object-fit: contain;
}
```

**JavaScript 分页逻辑：**
```javascript
// 处理超大元素
if (isTallElement) {
    // 检测并保留标题
    const onlyContainsHeading = currentPageContent &&
        /^<h[1-6][^>]*>[\\s\\S]*<\\/h[1-6]>$/i.test(currentPageContent.trim());
    const headingToKeep = onlyContainsHeading ? currentPageContent : '';

    if (el.tagName === 'TABLE') {
        // 按行分割表格
        const rows = el.querySelectorAll('tr');
        const thead = el.querySelector('thead');
        const theadHTML = thead ? thead.outerHTML : '';

        let tablePageContent = headingToKeep + '<table>' + theadHTML + '<tbody>';
        let tablePageHeight = thead ? thead.offsetHeight : 0;

        rows.forEach((row) => {
            if (tablePageHeight + row.offsetHeight > pageHeight) {
                // 输出当前表格页，开始新页
                pages.push(tablePageContent + '</tbody></table>');
                tablePageContent = '<table>' + theadHTML + '<tbody>';
                tablePageHeight = thead ? thead.offsetHeight : 0;
            }
            tablePageContent += row.outerHTML;
            tablePageHeight += row.offsetHeight;
        });

        // 最后一页
        if (tablePageContent !== '<table>' + theadHTML + '<tbody>') {
            pages.push(tablePageContent + '</tbody></table>');
        }
    } else if (el.tagName === 'IMG') {
        // 图片缩放
        el.classList.add('fit-to-page');
        pages.push(headingToKeep + el.outerHTML);
    } else {
        // 其他元素按子元素分割
        // ... (详见源码)
    }
}
```

### 测试结果

| 章节 | 修复前 | 修复后 | 内容 |
|------|--------|--------|------|
| Contents | 2页（截断） | 8页 | 28章目录完整 |
| List of Illustrations | 2页（截断） | 8页 | 27条插图完整 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 标题单独占页 | 超大元素触发换页 | 检测并合并标题 |
| 内容被截断 | overflow: hidden | 按类型分割/缩放 |
| 表格断裂 | 整体超过页高 | 按行分割，保留表头 |
| 图片过大 | 高度超过页高 | CSS 缩放适应 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 5：HR 单独成页 (阅读器 Bug)

### 问题表现

分页后某些页面只显示一条水平分隔线（HR），无其他内容。

```
修复前 (3页)：              修复后 (2页)：
┌─────────────────┐        ┌─────────────────┐
│  第1页内容...   │        │  第1页内容...   │
│  ...            │        │  ...            │
└─────────────────┘        └─────────────────┘
┌─────────────────┐        ┌─────────────────┐
│  第2页内容...   │        │  第2页内容...   │
│  ...            │        │  ───────────    │
└─────────────────┘        │  (HR 合并到此)  │
┌─────────────────┐        └─────────────────┘
│  ───────────    │             第2/2页
│  (只有 HR)      │
│                 │
└─────────────────┘
     第3/3页
```

### 根本原因

```
分页流程分析：
├─ 页面 1：内容分页完成
├─ 页面 2：内容分页完成
├─ 剩余内容：仅有 <hr> 元素
│   └─ 被单独推入新页面
│   └─ 但 HR 视觉高度极小
└─ 结果：第 3 页几乎空白，只有一条线
```

EPUB 原始内容中，HR 通常用于章节内的分隔：
```html
<p>最后一段内容...</p>
<hr/>
```

当上一个段落正好填满页面时，HR 被推到下一页，形成近空白页。

### 问题分析

| 场景 | HR 位置 | 结果 |
|------|---------|------|
| 上段未满 | 同页 | 正常 |
| 上段刚满 | 新页 | 只有 HR 的空白页 |
| 章节末尾 | 新页 | 更明显的空白页 |

### V2 解决方案

```
尾部 HR 合并逻辑：
├─ 分页循环结束后检测 currentPageContent
├─ 判断是否仅包含 HR：/^<hr[^>]*\/?>\s*$/i
├─ 若仅有 HR 且存在前页
│   └─ 合并到上一页末尾
│   └─ 清空 currentPageContent
└─ 否则正常推入新页
```

### 修复代码

```javascript
// reader-template.ts - 分页循环结束后

// If remaining content is only HR, merge with last page instead of creating new page
if (currentPageContent) {
    const isOnlyHR = /^<hr[^>]*\/?>\s*$/i.test(currentPageContent.trim());
    if (isOnlyHR && pages.length > 0) {
        console.log('%c[Pagination] Merging trailing HR with last page', 'color: #9b59b6;');
        pages[pages.length - 1] += currentPageContent;
        currentPageContent = '';
    } else {
        pages.push(currentPageContent);
    }
}
```

### 正则表达式说明

| 模式 | 说明 |
|------|------|
| `^` | 字符串开头 |
| `<hr` | 匹配 hr 标签开始 |
| `[^>]*` | 匹配任意属性 |
| `\/?>` | 匹配自闭合或普通闭合 |
| `\s*$` | 允许尾部空白 |

可匹配：`<hr>`, `<hr/>`, `<hr class="separator"/>` 等。

### 测试结果

| 章节 | 修复前 | 修复后 |
|------|--------|--------|
| List of Illustrations | 3页（第3页只有HR） | 2页（HR 在第2页末尾） |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| HR 单独占页 | 分页边界刚好在 HR 前 | 检测并合并到上一页 |
| 检测条件 | 需精确匹配仅 HR 情况 | 正则表达式判断 |
| 合并时机 | 分页循环结束后 | 在 push 前检测 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 6：图片未居中显示 (阅读器 Bug)

### 问题表现

EPUB 内容中的图片没有居中显示，偏向左侧或超出视口。

```
修复前：                     修复后：
┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │
│  ████           │        │     ████        │
│  ████           │        │     ████        │
│  (图片偏左)     │        │   (图片居中)    │
│                 │        │                 │
│  文字内容...    │        │  文字内容...    │
│                 │        │                 │
└─────────────────┘        └─────────────────┘
```

### 根本原因

```
HTML 结构分析：
├─ 阅读器 CSS 定义了 figure 元素的样式
│   └─ figure { text-align: center; ... }
├─ EPUB 原始内容使用 <div class="figcenter"> 包裹图片
│   └─ <div class="figcenter" style="width: 400px;">
│       <img src="..." />
│   </div>
├─ 问题 1：CSS 中没有定义 .figcenter 类的样式
├─ 问题 2：内联 style="width: 400px" 超出视口宽度 (240px)
└─ 结果：图片容器溢出，无法正确居中
```

EPUB 原始内容结构（含内联样式）：
```html
<div class="figcenter" style="width: 400px;">
    <img src="images/illustration.jpg" alt="..." />
</div>
```

视口宽度仅 240px，但 figcenter 被设为 400px，导致溢出。

### 问题分析

| 检查项 | 修复前 | 修复后 |
|--------|--------|--------|
| `.figcenter` CSS | ❌ 未定义 | ✅ 已定义 |
| `computedWidth` | 400px (溢出) | 240px (适应) |
| `max-width` | none | 100% |
| 图片位置 | 偏左 | 居中 |

### V2 解决方案

```
添加 figcenter 类样式：
├─ 复制 figure 元素的居中样式
├─ 应用到 .figcenter 类
├─ 使用 text-align: center 使内部图片居中
└─ 关键：使用 !important 覆盖内联宽度样式
    ├─ max-width: 100% !important
    └─ width: auto !important
```

### 修复代码

```css
/* reader-template.ts */

/* EPUB figcenter class - used for centered figures */
/* Override inline width styles from EPUB content */
.figcenter {
    margin: 1.5em 0;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
    max-width: 100% !important;
    width: auto !important;
}
```

### CSS 属性说明

| 属性 | 用途 |
|------|------|
| `margin: 1.5em 0` | 上下间距，与其他内容分隔 |
| `text-align: center` | 使内部行内/行内块元素（如 img）居中 |
| `break-inside: avoid` | 避免在此元素内部分页（现代浏览器） |
| `page-break-inside: avoid` | 避免分页（兼容旧浏览器） |
| `max-width: 100% !important` | 强制覆盖内联 width，限制最大宽度 |
| `width: auto !important` | 强制覆盖内联 width，自动计算宽度 |

### 调试过程

| 步骤 | 操作 | 发现 |
|------|------|------|
| 1 | 添加红色边框到 img | 图片有边框，但容器不明 |
| 2 | 添加蓝色边框到 figure | 无边框显示 |
| 3 | 添加绿色边框到 .figcenter | 边框显示，确认使用 figcenter |
| 4 | 检查 CSS | 缺少 .figcenter 类定义 |
| 5 | 添加 .figcenter 样式 | 问题依然存在 |
| 6 | 检查计算样式 | 发现内联 width: 400px 溢出 |
| 7 | 添加 !important 覆盖 | 问题修复 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 图片不居中 | EPUB 使用 figcenter 类而非 figure 元素 | 添加 .figcenter CSS 类 |
| 样式不生效 | CSS 选择器不匹配 HTML 结构 | 调试边框定位问题 |
| 内联样式覆盖 | EPUB 内联 style 优先级高于 CSS | 使用 !important |
| 容器溢出 | 内联 width: 400px > 视口 240px | max-width: 100% 限制 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-24) |
| iOS 阅读器 | ✅ 已同步 (2026-01-24) |

---

## 问题 7：Dropcap 分页导致空白页 (阅读器 Bug)

### 问题表现

Preface 章节第一页只显示标题 "Preface"，下方大段空白。Dropcap 内容被推到第二页，且第二页只显示少量剩余文本。

```
修复前 (11页)：              修复后 (10页)：
┌─────────────────┐        ┌─────────────────┐
│    Preface      │        │    Preface      │
│                 │        │  [D] It may per-│
│   (大段空白)    │        │  haps be neces- │
│                 │        │  sary to...and  │
│                 │        │  it is only     │
└─────────────────┘        └─────────────────┘
     第1/11页                    第1/10页
┌─────────────────┐        ┌─────────────────┐
│  perused as an  │        │  perused as an  │
│  amusing tale.  │        │  amusing tale.  │
│                 │        │  I would offer  │
│   (大段空白)    │        │  my humble work │
│                 │        │  as a kind of   │
│                 │        │  translation... │
└─────────────────┘        └─────────────────┘
     第2/11页                    第2/10页
```

### 根本原因

```
分页流程分析：
├─ 元素 [0]：H1 标题 "Preface" (h: 82)
│   └─ 添加到 currentPageContent，currentHeight = 82
├─ 元素 [1]：Dropcap div + p.dropcap (估算 h: 415)
│   └─ 检测到 dropcap 组
│   └─ 计算可用高度：468 - 82 - 20 = 366
│   └─ 415 > 366，触发 dropcap 分割
│   └─ 第一页：标题 + dropcap 图 + 部分文本
│   └─ 剩余文本设为新 currentPageContent
├─ 元素 [3]：下一段落 (h: 473)
│   └─ 检测为 TALL ELEMENT (> 80% 页高)
│   └─ BUG：将 currentPageContent（剩余文本）单独推入新页
│   └─ 导致第二页只有 "perused as an amusing tale."
└─ 结果：页面利用率低，多一页
```

### 问题分析

| 阶段 | currentPageContent | currentHeight | 问题 |
|------|-------------------|---------------|------|
| Dropcap 分割后 | 剩余文本 | 0 | 高度未测量 |
| Tall element 检测 | 剩余文本 | 0 | 被识别为独立内容 |
| Tall element 处理 | - | - | 单独推入新页 |

核心问题：Dropcap 分割后设置 `currentHeight = 0`，但实际剩余文本有高度。当下一个元素是 Tall element 时，原有内容被单独推入新页，而非与 Tall element 合并。

### V2 解决方案

```
两处修复：
1. Dropcap 分割逻辑
   ├─ 当标题 + dropcap 超过页高时，智能分割文本
   ├─ 第一页保留：标题 + dropcap 图 + 能容纳的文本
   └─ 剩余文本传递到下一轮处理

2. Tall element 处理逻辑
   ├─ 检测 currentPageContent 是否有内容但 currentHeight = 0
   ├─ 若是，测量实际高度
   ├─ 若内容高度 < 25% 页高，与 Tall element 合并
   └─ 否则才单独推入新页
```

### 核心修改点

**1. Dropcap 分割算法：**
- 将 dropcap 段落按 token 分割
- 逐个添加 token 直到超过可用高度
- 将前半部分与标题合并成第一页
- 剩余部分传递到下一轮

**2. Tall element 合并逻辑：**
- 检测 currentHeight = 0 但有内容的情况
- 动态测量内容实际高度
- 若内容高度 < 页高 25%，与 tall element 首页合并
- 否则单独成页

### 测试结果

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| Preface 总页数 | 11 | 10 |
| 第一页内容 | 仅标题 | 标题 + dropcap + 文本 |
| 第二页内容 | 仅剩余文本 | 剩余文本 + 后续段落 |
| 空白浪费 | 高 | 无 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 标题单独占页 | Dropcap 分割后剩余文本被单独处理 | 合并到 tall element 第一页 |
| currentHeight = 0 | 分割后未测量剩余高度 | 在 tall element 处理时补测 |
| 页面利用率低 | 小内容被推入独立页 | 检测并合并小内容 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-24) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 8：单词中断分页 (阅读器 Bug)

### 问题表现

单词在页面边界被截断成两部分，例如 "solemn" 被分为 "s" 和 "olemn"，段落间出现异常空白间隙，导致文字流动不连续。

```
修复前 (分页错误)：         修复后 (完整单词)：
┌─────────────────┐        ┌─────────────────┐
│  ...it was so   │        │  ...it was      │
│  s               │        │  solemn and     │
│  olemn and      │        │  imposing that  │
│  imposing that  │        │  everyone fell  │
│                 │        │  silent.        │
└─────────────────┘        └─────────────────┘
     第N/M页                    第N/M页
  (单词截断)                (完整单词)
```

### 根本原因

```
分页流程分析：
├─ Token 处理：将段落按空白字符分割成单个 token
├─ 高度计算：逐个 token 添加到当前页，直到超过页高
├─ BUG：当新 token 导致超高时，直接将该 token 移到下一页
│   └─ 没有检查该 token 是否为完整单词
│   └─ 没有检查是否在单词中间
├─ 结果：若某行末尾无法放下完整单词，单词被截断
└─ 例：页面还剩 30px 空间，但单词 "solemn" 需要 120px
    └─ 阅读器将第一个 token "solemn" 移到下一页
    └─ 但实际上在 HTML 中可能已被分割
```

### 问题分析

| 场景 | Token 宽度 | 可用空间 | 结果 |
|------|-----------|---------|------|
| 单词完整 | 120px | 150px | 正常，单词在同页 |
| 单词完整 | 120px | 80px | 移到下一页（正确） |
| 单词截断 | 120px | 80px | 仅部分移动，导致截断 |

根本原因是分页算法在高度超限时，没有考虑文本单词的完整性。

### V2 解决方案

```
单词边界回溯逻辑：
├─ 检测到非空白 token 会导致超高时
├─ 在该 token 对应的 HTML 文本中查找最后一个空白字符
├─ 回溯到该空白位置
├─ 将空白前的文本保留在当前页
├─ 将空白后的文本（包括该 token）移到下一页
└─ 结果：完整单词不会被截断
```

关键步骤：
1. 识别导致超高的 token
2. 在原始 HTML 段落中定位该 token 位置
3. 查找前面最后一个空白字符（正则 `/\s/` 的最后一次出现）
4. 从空白处分割，保留前半部分在当前页
5. 将后半部分及后续内容移到下一页

### 修复代码

```javascript
// reader-template.ts - 分页循环中处理文本元素

// 当检测到高度超限时
if (currentHeight + elementHeight > pageHeight) {
    // 如果是 P 标签，尝试单词边界回溯
    if (el.tagName === 'P') {
        const textContent = el.textContent || '';
        const tokens = textContent.split(/\s+/);

        // 找到导致超高的 token
        let accumulatedHeight = 0;
        let splitTokenIndex = -1;

        tokens.forEach((token, idx) => {
            if (accumulatedHeight + tokenHeights[idx] > availableHeight) {
                if (splitTokenIndex === -1) {
                    splitTokenIndex = idx;
                }
            } else {
                accumulatedHeight += tokenHeights[idx];
            }
        });

        if (splitTokenIndex > 0) {
            // 在原始 HTML 中查找最后一个空白字符的位置
            const beforeTokens = tokens.slice(0, splitTokenIndex).join(' ');
            const lastSpaceInBefore = beforeTokens.lastIndexOf(/\s/);

            // 回溯到最后一个空白处分割
            const splitPoint = lastSpaceInBefore > 0
                ? lastSpaceInBefore
                : beforeTokens.length;

            // 分割文本
            const part1 = textContent.substring(0, splitPoint);
            const part2 = textContent.substring(splitPoint).trim();

            // 第一页：保留前半部分
            const p1 = document.createElement('p');
            p1.textContent = part1;
            pages.push(p1.outerHTML);

            // 后续：剩余部分作为新元素处理
            const p2 = document.createElement('p');
            p2.textContent = part2;
            currentPageContent = p2.outerHTML;
            currentHeight = 0;
        }
    }
}
```

### 关键理解

| 概念 | 说明 |
|------|------|
| Token | 按空白字符分割的文本单位，如 "solemn" 是一个 token |
| 单词边界 | 单词前后的空白字符（空格、换行等） |
| 回溯 | 当 token 超高时，回到前一个单词边界，保留完整单词 |
| 文本分割 | 在空白处分割，而非在 token 中间分割 |

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | 页面剩余高度不足以容纳完整单词时 |
| 影响范围 | 所有 EPUB 文本分页，尤其是长词汇或小屏幕 |
| 修复原理 | Token 回溯到单词边界而非直接移动 |
| 性能影响 | 略有增加（需额外字符扫描），但可忽略 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 9：Dropcap 段落拆分后的孤立文本 (阅读器 Bug)

### 问题表现

当 dropcap 段落需要拆分时，如果第一页使用了约 91.5% 的空间（如 428.4/468px），剩余约 39.6px。如果第二部分只有 58px（如"perused as an amusing tale."），理论上应该回填到第一页，但因为 safetyMargin 被重复扣除，导致 remainingSpace 只有约 19.6px，无法容纳第二部分。结果：第一页底部出现明显空白，而第二页只显示一小段孤立的文本。

```
修复前 (页面利用率低)：         修复后 (紧凑合理)：
┌─────────────────┐        ┌─────────────────┐
│  [D] It may per-│        │  [D] It may per-│
│  haps be neces- │        │  haps be neces- │
│  sary to...     │        │  sary to...     │
│  ...and it is   │        │  ...and it is   │
│  only fitting   │        │  only fitting   │
│  that...        │        │  that...        │
│   (空白)        │        │  perused as an  │
│                 │        │  amusing tale.  │
└─────────────────┘        └─────────────────┘
     第1/N页                      第1/M页
┌─────────────────┐        ┌─────────────────┐
│  perused as an  │        │  Next content   │
│  amusing tale.  │        │  ...            │
│   (孤立文本)    │        │                 │
│                 │        │                 │
└─────────────────┘        └─────────────────┘
     第2/N页                      第2/M页
  (内容孤立)                   (自然分页)
```

### 根本原因

```
Dropcap 分割与回填流程分析：
├─ 第一页状态：currentHeight = 428.4px，remainingSpace = 39.6px
├─ Dropcap 段落测量：
│   └─ part1（第一页部分）+ dropcap 图 = 415px
│   └─ part2（剩余文本）= 58px
├─ 回填计算 (BUG)：
│   └─ availableForDropcap = pageHeight - safetyMargin = 468 - 20 = 448px
│   └─ remainingSpace = availableForDropcap - currentHeight = 448 - 428.4 = 19.6px
│   └─ BUG：在 availableForDropcap 中已扣除过 safetyMargin
│   └─ 结果：safetyMargin 被扣除了两次
├─ 判断：58 > 19.6，无法回填，part2 单独成页
└─ 问题：第一页底部浪费 39.6px 空间，part2 成为孤立文本页
```

关键缺陷：
- 重复扣除 safetyMargin：在计算 availableForDropcap 和 remainingSpace 时分别扣除
- 缺乏容忍度：即使只差几个像素（如 39.6 > 19.6），也不允许回填小文本

### 问题分析

| 指标 | 值 | 说明 |
|------|-----|------|
| 页面总高度 | 468px | iPhone 视口高度 |
| 第一页已用 | 428.4px | 91.5% 页面高度 |
| 第一页剩余 | 39.6px | 理论可用空间 |
| 第二部分高度 | 58px | 孤立文本高度 |
| safetyMargin | 20px | 安全边距 |
| availableForDropcap | 448px | 468 - 20（第一次扣除） |
| 错误的 remainingSpace | 19.6px | 448 - 428.4（第二次扣除）|
| 正确的 remainingSpace | 39.6px | 468 - 428.4（不重复扣除） |

结果判断：
- 错误逻辑：58 > 19.6，无法回填，part2 单独成页
- 正确逻辑：58 > 39.6，仍无法精确回填，但可引入容忍度机制

### V2 解决方案

```
两层修复：

1. 修复 remainingSpace 计算
   ├─ 不再重复扣除 safetyMargin
   ├─ remainingSpace = pageHeight - currentPageHeight
   └─ safetyMargin 仅在检测"是否需要分页"时使用

2. 引入"孤立文本容忍度"机制
   ├─ orphanThreshold = 80px（小于 80px 的文本视为孤立文本）
   ├─ overflowTolerance = 25px（允许孤立文本多占用 25px）
   ├─ 判断：若 secondPartHeight <= orphanThreshold
   │   └─ effectiveRemaining = remainingSpace + overflowTolerance
   │   └─ 允许孤立文本略微超出剩余空间
   └─ 视觉效果：第一页略微紧凑比第二页孤立一小段文本看起来更好
```

原理：
- 孤立文本（orphan text）是指仅占据很小空间的文本片段
- 将这些小文本强行推到下一页会造成页面利用率低、视觉割裂
- 允许小文本略微溢出第一页能改善整体阅读体验
- 容忍度值选择基于视觉测试：25px 略微紧凑但不影响可读性

### 修复代码

```javascript
// reader-template.ts - Dropcap 分割与回填逻辑

// 修复 1：不再重复扣除 safetyMargin
const remainingSpace = pageHeight - page1UsedHeight;
// 不使用 availableForDropcap，直接用 pageHeight

// 修复 2：孤立文本容忍度机制
const orphanThreshold = 80;          // px，小于此值的文本视为孤立
const overflowTolerance = 25;        // px，允许孤立文本多占用的空间

const isOrphanText = secondPartHeight <= orphanThreshold;
const effectiveRemaining = isOrphanText
    ? remainingSpace + overflowTolerance
    : remainingSpace;

if (secondPartHeight <= effectiveRemaining && effectiveRemaining > 0) {
    // 回填成功：第二部分附加到第一页末尾
    pages[pages.length - 1] += secondPartP.outerHTML;
    console.log(
        '%c[Dropcap Refill Success]',
        'color: #27ae60;',
        'orphan text (', secondPartHeight, 'px) added to page 1'
    );
} else {
    // 回填失败：第二部分单独成页
    currentPageContent = secondPartP.outerHTML;
    console.log(
        '%c[Dropcap Overflow]',
        'color: #e74c3c;',
        'orphan text (', secondPartHeight, 'px) exceeds limit, creating new page'
    );
}
```

### 参数选择说明

| 参数 | 值 | 调整空间 | 说明 |
|------|-----|---------|------|
| orphanThreshold | 80px | 60-100px | 判断孤立文本的阈值，越大越容易触发容忍度 |
| overflowTolerance | 25px | 15-35px | 容忍度大小，越大越容易回填，但页面越紧凑 |

测试建议：
- 若孤立文本仍频繁单独成页，增加 overflowTolerance（如 35px）
- 若页面显示过于紧凑，减少 overflowTolerance（如 15px）
- orphanThreshold 一般无需调整，除非内容类型特殊

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | Dropcap 段落拆分时第二部分很小但刚好超出剩余空间 |
| 影响范围 | 所有带 dropcap 的长段落，尤其是多段分割情况 |
| 修复原理 | 移除重复扣除 safetyMargin + 对小文本块增加容忍度 |
| 关键洞察 | 不同于硬性换页，某些情况下允许略微超限能改善用户体验 |
| 后续应用 | 可用于其他孤立内容场景，如单行标题、短列表等 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 10：孤立文本被 overflow:hidden 裁切 (阅读器 Bug)

### 问题表现

问题 9 的修复方案（overflow tolerance）引入了新问题：当孤立文本通过 `+=` 追加到第一页时，由于页面容器设置了 `overflow: hidden`，超出部分被裁切，导致文本消失不见。

```
修复前 (文本消失)：              修复后 (文本合并显示)：
┌─────────────────┐            ┌─────────────────┐
│  [D] It may per-│            │  [D] It may per-│
│  haps be neces- │            │  haps be neces- │
│  sary to...     │            │  sary to...     │
│  ...and it is   │            │  ...and it is   │
│  only fitting   │            │  only perused   │
│  that...        │            │  as an amusing  │
│  (文本被裁切)   │            │  tale.          │
└─────────────────┘            └─────────────────┘
  "perused as an                 文本完整显示
  amusing tale."
  消失不见
```

### 根本原因

```
问题 9 的修复方案存在缺陷：
├─ 原方案：将 secondPartP.outerHTML 追加到 pages[n]
│   └─ pages[n] += secondPartP.outerHTML
│   └─ 结果：创建一个独立的 <p> 元素
├─ 页面容器样式：overflow: hidden
│   └─ 任何超出容器高度的内容被裁切
├─ 实际情况：
│   └─ 第一页内容高度 428.4px + 孤立文本 58px = 486.4px
│   └─ 页面高度 468px
│   └─ 超出 18.4px 被裁切
└─ 结果：孤立文本虽然在 DOM 中存在，但视觉上不可见
```

关键缺陷：
- 追加独立 `<p>` 元素会导致总高度超出页面高度
- CSS `overflow: hidden` 会裁切超出部分
- 用户看到的效果是文本"消失"

### V2 解决方案

```
改进方案：MERGE 而非 APPEND
├─ 检测孤立文本（secondPartHeight <= orphanThreshold）
├─ 不再追加独立 <p> 元素
├─ 将孤立文本 MERGE 到第一页最后一个段落的 innerHTML 中
│   └─ 找到 lastIndexOf('</p>')
│   └─ 在 </p> 前插入孤立文本
│   └─ 结果：文本自然回流，不增加额外元素高度
└─ 视觉效果：段落文本连续显示，无裁切
```

原理：
- 将文本插入现有段落而非创建新段落
- 浏览器会自动重新计算行内文本布局
- 文本可以在段落内自然换行，不受 overflow:hidden 影响

### 修复代码

```javascript
// reader-template.ts - Dropcap 孤立文本处理

const orphanThreshold = 80; // px，小于此值的文本视为孤立
const isOrphanText = secondPartHeight <= orphanThreshold;

if (isOrphanText && remainingSpace > 0) {
    // MERGE：将文本合并到第一页最后一个段落
    // 而非 APPEND 独立的 <p> 元素
    console.log('%c      → MERGING orphan text back into first paragraph', 'color: #27ae60;');

    const pageContent = pages[pages.length - 1];
    const lastPCloseIndex = pageContent.lastIndexOf('</p>');

    if (lastPCloseIndex !== -1) {
        // 在 </p> 标签前插入孤立文本
        const mergedContent = pageContent.slice(0, lastPCloseIndex)
            + ' ' + remainingText  // 孤立文本内容
            + pageContent.slice(lastPCloseIndex);
        pages[pages.length - 1] = mergedContent;
        currentPageContent = '';
        currentHeight = 0;
    } else {
        // Fallback: 保留到下一页
        currentPageContent = secondPartP.outerHTML;
        currentHeight = secondPartHeight;
    }
} else if (secondPartHeight <= remainingSpace && remainingSpace > 0) {
    // 非孤立文本且空间足够 - 追加独立段落
    pages[pages.length - 1] += secondPartP.outerHTML;
    currentPageContent = '';
    currentHeight = 0;
} else {
    // 空间不足 - 保留到下一页
    currentPageContent = secondPartP.outerHTML;
    currentHeight = secondPartHeight;
}
```

### 对比：APPEND vs MERGE

| 方式 | 操作 | DOM 结构 | 高度影响 | 视觉效果 |
|------|------|---------|---------|---------|
| APPEND | `+=secondPartP.outerHTML` | 新增 `<p>` 元素 | 增加元素高度 | 可能被裁切 |
| MERGE | 插入到现有 `</p>` 前 | 文本合并到段落 | 文本自然回流 | 完整显示 |

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | 孤立文本通过 APPEND 方式追加导致总高度超出页面 |
| 影响范围 | 所有使用 overflow tolerance 回填的孤立文本 |
| 修复原理 | 将文本 MERGE 到现有段落而非 APPEND 新元素 |
| 关键洞察 | DOM 结构影响布局计算，合并文本比追加元素更安全 |
| CSS 注意 | overflow:hidden 会裁切溢出内容，需要避免元素级溢出 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ⚠️ 已被问题 11 的方案取代 |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 11：MERGE 方案仍导致裁切（死循环问题）(阅读器 Bug)

### 问题表现

问题 10 的 MERGE 修复方案仍然存在问题：将孤立文本合并到段落内部后，文本自然回流导致段落高度增加，最后一行仍然被 `overflow: hidden` 裁切。

```
死循环分析：

方案 1: APPEND 独立 <p>           方案 2: MERGE 到段落
┌─────────────────┐              ┌─────────────────┐
│  [D] It may...  │              │  [D] It may...  │
│  ...allegory    │              │  ...allegory    │
│  which it       │              │  which it       │
│─────────────────│              │  contains; and  │  ← 合并文本
│  <p>contains... │ ← 新元素     │  thus its...    │
│  </p>           │   被裁切     │  [最后行被裁切] │  ← 仍然裁切
└─────────────────┘              └─────────────────┘
  元素级溢出                        文本级溢出
  → 整个元素被裁切                   → 最后几行被裁切
```

两种方案都无法解决问题，形成死循环：
- APPEND：增加独立元素 → 元素级溢出 → 被裁切
- MERGE：合并到段落 → 段落高度增加 → 文本级溢出 → 被裁切

### 根本原因

```
问题本质：贪婪分页算法

分页算法流程：
├─ 第一页尽可能填充内容（~91.5% 利用率）
│   └─ 目标：最大化每页内容
├─ 导致第二页只剩少量孤立文本（58px）
├─ 事后尝试回填孤立文本
│   ├─ APPEND：元素级溢出
│   └─ MERGE：文本级溢出
└─ 无论哪种方式，总高度都超出容器高度

核心问题：
├─ 算法过于"贪婪"，导致孤立文本产生
├─ 事后修复无法解决，因为空间已经不足
└─ 需要从源头预防，而非事后补救
```

### V2 解决方案：ORPHAN PREVENTION

```
新策略：预防胜于补救

传统方案（事后补救）：                新方案（源头预防）：
分页 → 产生孤立 → 尝试回填 → 失败    分页前检测 → 调整分割点 → 无孤立

实现原理：
├─ 分割段落前，先测量第二部分高度
├─ 如果第二部分 < 100px（孤立阈值）
│   └─ 回退分割点，让更多内容移到第二页
│   └─ 最多回退 30 个 token
├─ 结果：第一页留出更多空白，但第二页内容充足
└─ 牺牲第一页利用率，换取内容完整性
```

对比：

| 指标 | 事后补救 | 源头预防 |
|------|----------|----------|
| 第一页利用率 | ~91.5% (428.4px) | ~79% (370.4px) |
| 第二页高度 | 58px (孤立) | 115px (正常) |
| 裁切风险 | 高 | 无 |

### 修复代码

```javascript
// reader-template.ts - ORPHAN PREVENTION 实现

// 分割前测量第二部分高度
const measureP = document.createElement('p');
measureP.style.cssText = 'position: absolute; left: -9999px; width: ' + pageWidth + 'px; visibility: hidden;';
document.body.appendChild(measureP);

let remainingTokens = tokens.slice(splitIndex);
measureP.innerHTML = remainingTokens.join('').trim();
let secondPartHeight = measureP.offsetHeight;

// ORPHAN PREVENTION: 如果第二部分太小，回退分割点
const orphanThreshold = 100; // 最小高度阈值 (px)
const maxBacktrack = 30;     // 最大回退 token 数
let backtrackCount = 0;
let adjustedSplitIndex = splitIndex;

while (secondPartHeight < orphanThreshold && backtrackCount < maxBacktrack && adjustedSplitIndex > 10) {
    adjustedSplitIndex--;

    // 跳过空白和 HTML 标签
    while (adjustedSplitIndex > 0 &&
           (/^\s+$/.test(tokens[adjustedSplitIndex]) || /^<[^>]+>$/.test(tokens[adjustedSplitIndex]))) {
        adjustedSplitIndex--;
    }

    // 重新测量
    remainingTokens = tokens.slice(adjustedSplitIndex);
    measureP.innerHTML = remainingTokens.join('').trim();
    secondPartHeight = measureP.offsetHeight;
    backtrackCount++;
}

if (backtrackCount > 0) {
    console.log('%c      → ORPHAN PREVENTION: split point moved back', 'color: #9b59b6;',
                'tokens:', backtrackCount, 'newSecondH:', secondPartHeight);
    splitIndex = adjustedSplitIndex;
    currentText = tokens.slice(0, adjustedSplitIndex).join('');
}

document.body.removeChild(measureP);
```

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | 贪婪分页导致孤立文本，事后补救均失败 |
| 影响范围 | 所有 Dropcap 段落拆分场景 |
| 修复原理 | 预防优于补救，在分割时调整分割点 |
| 关键洞察 | 牺牲页面利用率换取内容完整性是正确权衡 |
| 设计思想 | 从源头解决问题，而非事后打补丁 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-24) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 12：Dropcap 首字符重复显示 (阅读器 Bug)

### 问题表现

当段落有 dropcap 装饰图片时，首字母同时出现在 dropcap 图片和段落文本中，导致视觉重复。

```
┌─────────────────────────────┐
│                             │
│  [I] It may perhaps be...   │  ← "I" 出现两次
│   ↑                ↑        │
│ dropcap图片    段落文本      │
│                             │
└─────────────────────────────┘
```

### 根本原因

```
后端生成的 HTML 结构：
<p class="dropcap">
  <img class="dropcap" src="dropcap-i.png" />
  It may perhaps be...  ← 文本仍包含首字母 "I"
</p>

问题链：
├─ Dropcap 图片显示装饰性首字母
├─ 段落文本未移除对应首字符
└─ 导致同一字符视觉上重复
```

### V2 解决方案

```
使用 CSS ::first-letter 伪元素隐藏段落首字符

策略：
├─ 不修改 HTML 结构
├─ 通过 CSS 让首字符视觉上不可见
└─ 多属性组合确保完全隐藏

优点：
├─ 纯 CSS 方案，无 JavaScript 开销
├─ 不影响 DOM 结构
└─ 跨主题兼容（light/sepia/dark）
```

### 修复代码

```css
/* Hide first character when dropcap image is present to prevent duplication */
p.dropcap::first-letter {
    opacity: 0;
    font-size: 0;
    width: 0;
    margin: 0;
    padding: 0;
}
```

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | 任何包含 dropcap 图片的段落 |
| 影响范围 | 所有带 dropcap 的章节开头 |
| 修复原理 | CSS 隐藏首字符，避免与 dropcap 图片重复 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-24) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 13：EPUB 章节解析丢失 (后端 Bug)

### 问题表现

书籍应有 31 章节，但解析后只有 23-30 章节。部分章节丢失，包括：
- 封面页 (Cover)
- Frontispiece 插图页 (如 "MR. EWART AND MARK.")
- 同一 XHTML 文件中的多个章节

```
原始 EPUB 结构：
├─ wrap0000.xhtml (Cover)
├─ chapter-0.xhtml
│   ├─ #illus1 (Frontispiece 插图)
│   ├─ #pgepubid00016 (THE YOUNG PILGRIM.)
│   └─ #CHAPTER_I (CHAPTER I)
├─ chapter-13.xhtml
│   ├─ #CHAPTER_XIV
│   ├─ #CHAPTER_XV
│   ├─ #CHAPTER_XVI
│   ├─ #CHAPTER_XVII
│   ├─ #CHAPTER_XVIII
│   ├─ #CHAPTER_XIX
│   └─ #CHAPTER_XX  ← 7个章节在同一文件！
└─ ...

解析结果：
├─ Flow-based: 24 个 XHTML 文件 → 23 章节 (丢失8+)
└─ TOC-based:  30 个 TOC 条目 → 31 章节 (正确)
```

### 根本原因

```
问题分析：
├─ epub-parser.service.ts 使用 epub.flow (XHTML 文件列表)
├─ 一个 XHTML 文件包含多个章节（通过 anchor 区分）
├─ Flow-based 解析把每个文件当作一个章节
└─ 导致同文件多章节被合并为一个

EPUB 结构对比：
┌──────────────────────────────────────────────────┐
│  epub.flow (物理文件)    epub.toc (逻辑章节)     │
├──────────────────────────────────────────────────┤
│  24 个 XHTML 文件        30 个 TOC 条目          │
│  chapter-13.xhtml  →     CHAPTER XIV            │
│                          CHAPTER XV             │
│                          CHAPTER XVI            │
│                          CHAPTER XVII           │
│                          CHAPTER XVIII          │
│                          CHAPTER XIX            │
│                          CHAPTER XX             │
└──────────────────────────────────────────────────┘

额外丢失：
├─ Cover 封面不在 TOC 中，需从 flow[0] 检测
└─ Frontispiece 插图不在 TOC 中，需额外检测
```

### V2 解决方案

```
新的解析策略优先级：
1. TOC-based (最可靠) ← 新增
2. Content-based (回退)
3. Flow-based (最后回退)

extractChaptersByTOC 算法：
├─ 1. 检测 Cover
│   ├─ 检查 flow[0] 是否为封面
│   └─ 如 TOC 无封面条目，添加 Cover 章节
├─ 2. 检测 Frontispiece
│   ├─ 检查第一个 TOC 条目是否有 anchor
│   ├─ 如有，说明 anchor 前有内容
│   └─ 从内容提取 figcaption 作为标题
├─ 3. 从 TOC 提取章节
│   ├─ 使用 tocItem.href (含 anchor)
│   └─ 通过 href → flow 映射获取内容
└─ 4. 过滤 License 章节
    └─ 跳过 Gutenberg、Colophon 等
```

### 修复代码

```typescript
// epub-parser.service.ts

// 新增 TOC-based 提取方法
private async extractChaptersByTOC(epub: any): Promise<ParsedChapter[]> {
  const toc = epub.toc || [];
  const flow = epub.flow || [];

  // 1. 添加封面
  if (flow[0]?.href?.includes('wrap')) {
    chapters.push({ title: 'Cover', href: flow[0].href, ... });
  }

  // 2. 检测 Frontispiece (插图页)
  if (firstTocHref.includes('#')) {
    // 第一个 TOC 有 anchor，说明前面有内容
    const captionMatch = content.match(/<p class="caption">([^<]+)<\/p>/i);
    chapters.push({ title: captionMatch[1], href: baseHref + '#illus1', ... });
  }

  // 3. 从 TOC 提取所有章节
  for (const tocItem of toc) {
    if (!isLicenseChapter(tocItem.title)) {
      chapters.push({ title: tocItem.title, href: tocItem.href, ... });
    }
  }
}

// 主函数优先使用 TOC
let chapters = await this.extractChaptersByTOC(epub);
if (chapters.length === 0) {
  chapters = await this.extractChaptersByContent(epub);
}
if (chapters.length === 0) {
  chapters = await this.extractChaptersByFlow(epub);
}
```

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | Gutenberg 等复杂 EPUB，同一文件含多章节 |
| 影响范围 | 所有使用 Flow-based 解析的书籍 |
| 修复原理 | TOC 是 EPUB 官方章节列表，比物理文件更可靠 |
| 关键洞察 | epub.toc (逻辑) 优于 epub.flow (物理) |
| 额外处理 | Cover 和 Frontispiece 需单独检测添加 |

### 修复状态

| 组件 | 状态 |
|------|------|
| epub-parser.service.ts | ✅ 已修复 (2026-01-24) |
| restore-chapters-from-toc.ts | ✅ 新增脚本 |

---

## 问题 14：Cover 章节自动添加问题 (后端 Bug)

### 问题表现

书籍章节列表中出现 "Cover" 章节，但该章节内容通常只有一张封面图片，不是实际阅读内容。用户在阅读时需要手动跳过。

```
章节列表：
├─ 1. Cover          ← 多余的封面章节
├─ 2. Preface
├─ 3. Chapter I
└─ ...
```

### 根本原因

```
EPUB 解析流程分析：
├─ extractChaptersByTOC() 方法
│   └─ 检测 flow[0] 是否为封面
│   └─ 自动添加 Cover 章节到章节列表
├─ 问题：
│   └─ 封面页不应作为独立章节
│   └─ 封面图片应在书籍封面展示，而非章节内容
└─ 结果：用户看到多余的 Cover 章节
```

### V2 解决方案

```
两处修改：

1. 移除自动添加 Cover 章节的代码
   ├─ 删除 extractChaptersByTOC() 中的 Cover 添加逻辑
   └─ 删除其他提取方法中类似代码

2. 添加 Cover 章节过滤
   ├─ isCoverChapter() 方法检测封面相关章节
   ├─ 在所有提取方法中过滤
   └─ 匹配标题和 href 关键字
```

### 修复代码

```typescript
// epub-parser.service.ts

// 新增封面检测方法
private isCoverChapter(title: string, href?: string): boolean {
  const lowerTitle = title.toLowerCase().trim();
  const lowerHref = (href || '').toLowerCase();

  // 封面标题匹配
  const coverTitles = ['cover', 'cover image', 'book cover', 'front cover', 'title page'];
  if (coverTitles.includes(lowerTitle)) {
    return true;
  }

  // href 路径匹配
  if (lowerHref.includes('cover') || lowerHref.includes('wrap')) {
    return true;
  }

  return false;
}

// 在提取章节时过滤
if (!this.isCoverChapter(chapter.title, chapter.href)) {
  chapters.push(chapter);
}
```

### 数据修复脚本

```bash
# 运行脚本删除现有 Cover 章节并重新编号
npx tsx apps/backend/src/scripts/remove-cover-chapters.ts
```

脚本功能：
- 查找所有标题为 "Cover" 的章节
- 删除这些章节
- 重新编号剩余章节 (order 字段)
- 更新书籍的 chapterCount

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | EPUB 文件包含封面页 (wrap*.xhtml) |
| 影响范围 | 所有 Gutenberg 和类似来源的 EPUB |
| 修复原理 | 过滤而非自动添加封面章节 |
| 关键洞察 | 封面图片应在书籍元数据中展示，不应作为章节 |

### 修复状态

| 组件 | 状态 |
|------|------|
| epub-parser.service.ts | ✅ 已修复 (2026-01-24) |
| remove-cover-chapters.ts | ✅ 新增脚本 |

---

## 问题 15：Project Gutenberg 版权信息残留 (后端 Bug)

### 问题表现

书籍章节开头和结尾包含 Project Gutenberg 的版权声明和法律信息，干扰正常阅读。

```
章节内容：
┌─────────────────────────────────────┐
│  The Project Gutenberg eBook of    │  ← 版权头
│  The Young Pilgrim                  │
│                                     │
│  This ebook is for the use of...   │  ← 法律声明
│  ─────────────────────────────────  │
│                                     │
│  MR. EWART AND MARK.               │  ← 实际内容开始
│  ...                                │
└─────────────────────────────────────┘
```

### 根本原因

```
HTML 内容分析：
├─ EPUB 原始 HTML 包含 Gutenberg 特定元素
│   ├─ <section class="pg-boilerplate">
│   ├─ <section id="pg-header">
│   ├─ <section id="pg-footer">
│   ├─ <div id="pg-start-separator">
│   └─ <div id="pg-end-separator">
├─ 问题：
│   └─ epub.getChapter() 返回原始 HTML
│   └─ 未清理 Gutenberg 特定内容
└─ 结果：版权信息显示在阅读内容中
```

### V2 解决方案

```
HTML 清理策略：
├─ 在 getChapterContent() 中调用清理方法
├─ 使用正则表达式移除 Gutenberg 元素
└─ 清理空行和多余换行
```

### 修复代码

```typescript
// epub-parser.service.ts

private cleanGutenbergBoilerplate(html: string): string {
  let cleaned = html;

  // 移除 pg-boilerplate sections (header and footer)
  cleaned = cleaned.replace(
    /<section[^>]*class="[^"]*pg-boilerplate[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
    '',
  );

  // 移除 pg-header section
  cleaned = cleaned.replace(
    /<section[^>]*id="pg-header"[^>]*>[\s\S]*?<\/section>/gi,
    '',
  );

  // 移除 pg-footer section
  cleaned = cleaned.replace(
    /<section[^>]*id="pg-footer"[^>]*>[\s\S]*?<\/section>/gi,
    '',
  );

  // 移除 start/end separators
  cleaned = cleaned.replace(
    /<div[^>]*id="pg-start-separator"[^>]*>[\s\S]*?<\/div>/gi,
    '',
  );
  cleaned = cleaned.replace(
    /<div[^>]*id="pg-end-separator"[^>]*>[\s\S]*?<\/div>/gi,
    '',
  );

  // 移除其他 gutenberg 相关元素
  cleaned = cleaned.replace(
    /<[^>]*(?:class|id)="[^"]*gutenberg[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
    '',
  );

  // 移除 license/copyright/colophon div
  cleaned = cleaned.replace(
    /<div[^>]*(?:class|id)="[^"]*(?:license|copyright|colophon)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    '',
  );

  // 清理空 div 和多余换行
  cleaned = cleaned.replace(/<div\s*\/>/gi, '');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

  return cleaned.trim();
}

// 在 getChapterContent 中调用
private async getChapterContent(epub: any, href: string): Promise<string> {
  // ... 获取原始 HTML
  const rawHtml = await this.getChapterRawContent(epub, href);
  return this.cleanGutenbergBoilerplate(rawHtml);
}
```

### 正则表达式说明

| 模式 | 匹配目标 |
|------|---------|
| `<section[^>]*class="[^"]*pg-boilerplate[^"]*"[^>]*>` | 带 pg-boilerplate class 的 section |
| `[\s\S]*?` | 任意字符（含换行），非贪婪匹配 |
| `<\/section>` | 闭合标签 |

### 数据修复脚本

```bash
# 运行脚本清理现有章节内容
npx tsx apps/backend/src/scripts/clean-gutenberg-boilerplate.ts
```

脚本功能：
- 查找包含 Gutenberg 标记的章节
- 清理 htmlContent 字段
- 仅更新实际变化的记录

### 经验总结

| 类型 | 内容 |
|------|------|
| 触发条件 | 导入 Project Gutenberg 来源的 EPUB |
| 影响范围 | 所有 Gutenberg EPUB 的章节内容 |
| 修复原理 | 在存储前清理 HTML 中的版权元素 |
| 关键洞察 | EPUB 原始内容需要清洗，不能直接存储 |

### 修复状态

| 组件 | 状态 |
|------|------|
| epub-parser.service.ts | ✅ 已修复 (2026-01-24) |
| clean-gutenberg-boilerplate.ts | ✅ 新增脚本 |

---

## 问题 16：图片标题 (caption) 字体过大且未居中 (阅读器 Bug)

### 问题表现

EPUB 内容中的图片标题（caption）显示字体过大，与正文相同，且没有居中对齐，影响视觉效果。

```
修复前：                     修复后：
┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │
│     ████        │        │     ████        │
│     ████        │        │     ████        │
│                 │        │                 │
│MR. EWART AND    │        │  MR. EWART AND  │
│MARK.            │        │      MARK.      │
│  (字体大,左对齐) │        │ (字体小,居中,斜体)│
│                 │        │                 │
└─────────────────┘        └─────────────────┘
```

### 根本原因

```
HTML 结构分析：
├─ 阅读器 CSS 定义了 figcaption 和 figure > p 的样式
│   └─ figcaption { font-size: 0.875em; text-align: center; ... }
│   └─ figure > p { font-size: 0.875em; text-align: center; ... }
├─ EPUB 原始内容使用 <p class="caption"> 包裹图片标题
│   └─ <div class="figcenter">
│       <img src="..." />
│       <p class="caption">MR. EWART AND MARK.</p>
│   </div>
├─ 问题：CSS 中没有定义 p.caption 或 .caption 类的样式
└─ 结果：图片标题使用默认段落样式，字体大且未居中
```

EPUB 原始内容结构：
```html
<div class="figcenter" style="width: 400px;">
    <img src="images/illustration.jpg" alt="..." />
    <p class="caption">MR. EWART AND MARK.</p>
</div>
```

### 问题分析

| 检查项 | 修复前 | 修复后 |
|--------|--------|--------|
| `p.caption` CSS | ❌ 未定义 | ✅ 已定义 |
| `font-size` | 1em (正文) | 0.875em (小字) |
| `text-align` | left | center |
| `font-style` | normal | italic |
| `color` | 正文色 | 次要文字色 |

### V2 解决方案

```
添加 caption 类样式：
├─ 复制 figcaption 元素的样式规则
├─ 应用到 p.caption 和 .caption 选择器
├─ 使用 font-size: 0.875em 缩小字体
├─ 使用 text-align: center 居中对齐
├─ 使用 font-style: italic 斜体显示
└─ 使用 var(--text-secondary) 次要颜色
```

### 修复代码

```css
/* reader-template.ts */

/* EPUB caption class - Gutenberg uses <p class="caption"> for image titles */
p.caption,
.caption {
    margin-top: 0.5em;
    font-size: 0.875em;
    color: var(--text-secondary);
    font-style: italic;
    font-weight: normal;
    text-indent: 0;
    text-align: center;
    line-height: 1.4;
}
```

### CSS 属性说明

| 属性 | 用途 |
|------|------|
| `margin-top: 0.5em` | 与图片保持适当间距 |
| `font-size: 0.875em` | 比正文小（约14px @ 16px基准） |
| `color: var(--text-secondary)` | 使用次要文字颜色，视觉层次分明 |
| `font-style: italic` | 斜体显示，区别于正文 |
| `font-weight: normal` | 正常粗细 |
| `text-indent: 0` | 取消首行缩进 |
| `text-align: center` | 居中对齐 |
| `line-height: 1.4` | 适当行高 |

### 调试过程

| 步骤 | 操作 | 发现 |
|------|------|------|
| 1 | 查看图片标题样式 | 字体过大，未居中 |
| 2 | 检查 HTML 结构 | 使用 `<p class="caption">` |
| 3 | 检查现有 CSS | 有 figcaption 样式，无 .caption |
| 4 | 查询数据库验证 | 确认 EPUB 使用 `p.caption` 结构 |
| 5 | 添加 .caption CSS | 问题修复 |

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 标题字体大 | CSS 选择器不匹配 | 添加 p.caption 选择器 |
| 标题未居中 | 无对应样式规则 | text-align: center |
| EPUB 结构多样 | 不同来源使用不同标签 | 覆盖常见结构 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-24) |
| iOS 阅读器 | 🔴 待同步 |

---

## 相关文档

- [EPUB阅读器问题清单(第一批)](./epub-reader-mobile-issues.md)
- [EPUB内容版本方案对比](./epub-content-versions-comparison.md)
