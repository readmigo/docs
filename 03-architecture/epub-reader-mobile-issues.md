# EPUB 阅读器手机屏幕适配问题清单

## 概述

基于书籍 `61280.epub` (The Young Pilgrim) 和 V1 处理方案的分析，梳理阅读器需要解决的手机屏幕适配重点问题。

---

## 问题总览

| 问题类型 | 严重程度 | V1 状态 | V2 需处理 |
|----------|----------|---------|-----------|
| 图片高度溢出/被削 | 🔴 严重 | 未处理 | ✅ |
| Drop Cap 首字下沉失效 | 🟠 中等 | 未处理 | ✅ |
| 跨章节链接失效 | 🟠 中等 | 未处理 | ✅ |
| CSS 样式类丢失 | 🟠 中等 | 未处理 | ✅ |
| 表格高度溢出/被削 | 🟠 中等 | 未处理 | ✅ |
| 边距百分比不适配 | 🟡 轻微 | 未处理 | ✅ |
| 字体样式丢失 | 🟡 轻微 | 未处理 | ✅ |
| **分页文字被削** | 🔴 严重 | 阅读器Bug | ✅ |
| **章节未新页起始** | 🟠 中等 | 阅读器Bug | ✅ |
| **封面页留白过多** | 🟠 中等 | V1 + 阅读器 | ✅ |
| **封面图片未独占一页** | 🔴 严重 | BE解析Bug | ✅ |
| **Project Gutenberg 协议重复** | 🟠 中等 | BE解析Bug | ✅ |
| **Dropcap 导致第一页稀疏** | 🟠 中等 | 阅读器Bug | ✅ |
| **章节标题重复显示** | 🟠 中等 | 阅读器Bug | ✅ |
| **Dropcap 图片尺寸过大** | 🟡 轻微 | 阅读器Bug | ✅ |

---

## 问题 1：图片高度溢出/被削

### 问题表现

在分页阅读模式下，图片高度超出页面可视区域，底部被裁切显示不全。

### 原始 EPUB 代码

```html
<div class="figcenter" style="width: 400px;" id="illus1">
    <img alt="" src="8003346023949050646_illus1.jpg"/>
    <p class="caption">MR. EWART AND MARK.</p>
</div>
```

### 手机上的问题

```
┌─────────────────────────────┐
│  Page 1                     │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │                     │    │
│  │      图片           │    │
│  │    (高度超出)       │    │
│  │                     │    │
│  ├─────────────────────┼────┤ ← overflow:hidden 裁切线
│  │   被削掉的部分      │    │
│  └─────────────────────┘    │
│  图片说明文字也被削         │
└─────────────────────────────┘
```

### 根本原因

1. **图片原始尺寸过大**：EPUB 中的插图可能是高分辨率图片
2. **分页容器 overflow:hidden**：超出页面高度的内容直接被裁切
3. **图片未设置最大高度**：阅读器注入的 CSS 只限制了 `max-width: 100%`，未限制高度

### V2 解决方案

```
图片样式优化：
├─ max-width: 100%
├─ max-height: 80vh        ← 限制最大高度为视口的 80%
├─ height: auto
├─ width: auto
└─ object-fit: contain     ← 保持比例缩放
```

### 分页算法优化

```
图片分页处理：
├─ 检测图片高度是否超过 pageHeight
├─ 如超出，强制将图片单独放一页
├─ 设置图片 max-height: pageHeight - margin
└─ 确保图片及其说明文字不被分割
```

---

## 问题 2：Drop Cap 首字下沉失效

### 问题表现

原书每章开头有精美的首字母图片装饰，V1 处理后完全失效。

### 原始 EPUB 结构

```html
<!-- HTML 结构 -->
<div>
    <img alt="" class="dropcap" src="dropcap-i.jpg"/>
</div>
<p class="dropcap">It may perhaps be necessary...</p>
```

```css
/* 0.css 中的样式 */
p.dropcap {
    text-indent: 0
}
p.dropcap:first-letter {
    color: transparent;      /* 隐藏文本首字母 */
    visibility: hidden;
    margin-left: -0.9em
}
img.dropcap {
    margin: -1em 0 0 0       /* 图片定位 */
}

/* 媒体查询：特定条件下切换显示方式 */
@media all {
    img.dropcap {
        display: none        /* 隐藏图片 */
    }
    p.dropcap:first-letter {
        color: inherit;      /* 显示文本首字母 */
        visibility: visible;
        margin-left: 0
    }
}
```

### 设计意图

```
┌────────────────────────────────────────────────────────┐
│  出版商设计的双模式 Drop Cap                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  模式 A (图片装饰)           模式 B (纯文本)             │
│  ┌──────────────────┐       ┌──────────────────┐       │
│  │ ┌───┐            │       │                  │       │
│  │ │ I │ t may      │       │ I t may perhaps  │       │
│  │ │   │ perhaps    │       │   be necessary   │       │
│  │ └───┘ be neces   │       │                  │       │
│  │       sary...    │       │                  │       │
│  └──────────────────┘       └──────────────────┘       │
│    (图片首字母)               (CSS首字母放大)            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### V1 处理后的问题

```html
<!-- V1 删除了 <link> 和 <style>，CSS 样式全部丢失 -->
<div>
    <img alt="" class="dropcap" src="https://cdn.../dropcap-i.jpg"/>
</div>
<p class="dropcap">It may perhaps be necessary...</p>
```

```
V1 显示效果：
┌──────────────────────────────┐
│                              │
│  ┌───────────────────────┐   │
│  │                       │   │  ← 图片单独占一行
│  │     dropcap-i.jpg     │   │     (无定位样式)
│  │                       │   │
│  └───────────────────────┘   │
│                              │
│  It may perhaps be           │  ← 文本正常显示
│  necessary to give a         │     (无首字母效果)
│  brief explanation...        │
│                              │
└──────────────────────────────┘
```

### V2 解决方案

```
保留 CSS 样式：
├─ 保留 <style> 内联样式标签
├─ 上传外部 CSS 文件到 R2
├─ 替换 <link href="0.css"> 为 CDN 路径
└─ 媒体查询正常生效，自动切换显示模式
```

---

## 问题 3：跨章节链接失效

### 问题表现

目录页和正文中的章节跳转链接点击无响应。

### 原始 EPUB 代码

```html
<!-- 目录表格 -->
<table summary="Contents">
    <tr>
        <td>I.</td>
        <td>THE PILGRIM'S CALL,</td>
        <td><a href="6385840510768433121_61280-h-0.htm.html#CHAPTER_I"
               class="pginternal">13</a></td>
    </tr>
    <tr>
        <td>II.</td>
        <td>DIFFICULTIES ON SETTING OUT,</td>
        <td><a href="6385840510768433121_61280-h-1.htm.html#CHAPTER_II"
               class="pginternal">25</a></td>
    </tr>
</table>

<!-- 正文中的页码引用 -->
<p class="caption right">
    <a href="6385840510768433121_61280-h-1.htm.html#Page_22"
       class="pginternal"><i>Page 22.</i></a>
</p>
```

### V1 处理后的问题

```
┌─────────────────────────────────────────────────────────┐
│  原始链接                                                │
│  href="6385840510768433121_61280-h-1.htm.html#CHAPTER_II"│
├─────────────────────────────────────────────────────────┤
│  V1 未处理，链接指向不存在的本地文件                       │
│  点击后：无响应 / 404 错误                               │
└─────────────────────────────────────────────────────────┘
```

### 链接类型分析

| 链接类型 | 示例 | 处理方式 |
|----------|------|----------|
| 同章节锚点 | `#footnote1` | 保留，WebView 内跳转 |
| 跨章节链接 | `chapter2.html#section` | 转换为 APP 导航协议 |
| 外部链接 | `https://...` | 保留，系统浏览器打开 |

### V2 解决方案

```
跨章节链接处理流程：
┌─────────────────────────────────────────────────────────┐
│  原始链接                                                │
│  href="6385840510768433121_61280-h-1.htm.html#CHAPTER_II"│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  1. 解析文件名：6385840510768433121_61280-h-1.htm.html   │
│  2. 查找对应章节 ID (通过 manifest 映射)                  │
│  3. 提取锚点：#CHAPTER_II                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  转换后链接                                              │
│  href="readmigo://chapter/{chapterId}#CHAPTER_II"       │
│  data-chapter-order="2"                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 问题 4：CSS 样式类丢失

### 问题表现

出版商定义的排版样式全部丢失，页面显示为无格式纯文本。

### 受影响的样式类

| 样式类 | 原始效果 | V1 效果 |
|--------|----------|---------|
| `.titlepage` | 标题页居中、大字体、上边距 | 左对齐普通段落 |
| `.chapter` | 章节引言缩进、小字体 | 普通段落 |
| `.figcenter` | 图片居中、自动边距 | 左对齐 |
| `.caption` | 图片说明居中、小字体 | 普通段落 |
| `.smcap` | 小型大写字母 | 普通文本 |
| `.poetry` | 诗歌缩进、行距 | 普通段落 |
| `.epitaph` | 墓志铭居中、行距1.8 | 普通段落 |

### 原始 CSS 定义 (0.css)

```css
.titlepage {
    text-align: center;
    margin-top: 3em;
    text-indent: 0
}

.chapter {
    margin: 1.5em 10%
}
.chapter p {
    padding-left: 2em;
    text-indent: -2em;
    font-size: 90%
}

.figcenter {
    margin: auto;
    text-align: center
}

.caption {
    text-align: center;
    margin-bottom: 1em;
    font-size: 90%;
    text-indent: 0
}

.smcap {
    font-variant: small-caps;
    font-style: normal
}
```

### V1 vs V2 显示对比

```
┌─────────────────────────────────────────────────────────────┐
│  V1 显示效果 (无样式)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  THE                                                        │
│  Young Pilgrim.                                             │
│  A Tale                                                     │
│  ILLUSTRATIVE OF "THE PILGRIM'S PROGRESS."                  │
│  BY                                                         │
│  A. L. O. E.,                                               │
│                                                             │
│  (全部左对齐，无格式)                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  V2 显示效果 (保留样式)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                          THE                                │
│                    YOUNG PILGRIM.                           │
│                                                             │
│                        A Tale                               │
│      ILLUSTRATIVE OF "THE PILGRIM'S PROGRESS."              │
│                                                             │
│                          BY                                 │
│                      A. L. O. E.,                           │
│                                                             │
│  (居中对齐，小型大写字母，层次分明)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 问题 5：表格高度溢出/被削

### 问题表现

在分页阅读模式下，目录表格或其他表格高度超出页面，底部行被裁切显示不全。

### 原始 EPUB 代码

```html
<table summary="Contents">
    <tr>
        <td class="tdr">I.</td>
        <td>THE PILGRIM'S CALL,</td>
        <td class="tdpg"><a href="...">13</a></td>
    </tr>
    <!-- 20+ 行目录项 -->
</table>
```

### 手机上的问题

```
┌─────────────────────────────┐
│  Contents Page              │
│                             │
│  I.   THE PILGRIM'S CALL  13│
│  II.  DIFFICULTIES...     25│
│  III. MAN'S WAY OF WORKS  33│
│  IV.  GOD'S GIFT OF GRACE 44│
│  V.   THE INTERPRETER'S   52│
│  VI.  THE SHINING LIGHT   62│
│  VII. THE WICKET GATE     68│
│  VIII.THE CROSS           79│
│  IX.  THE HILL DIFFICULTY─ ─│ ← overflow:hidden 裁切线
│  X.   [被削掉]               │
│  XI.  [被削掉]               │
└─────────────────────────────┘
```

### 根本原因

1. **表格作为单一元素处理**：分页算法将整个 `<table>` 视为一个不可分割的元素
2. **表格高度超出页面**：长目录表格无法放入单页
3. **overflow:hidden 裁切**：超出部分直接被隐藏

### V2 解决方案

```
方案 A：表格拆分分页
├─ 检测表格高度是否超过 pageHeight
├─ 如超出，按行拆分表格
├─ 每页显示 N 行，确保不超出页面高度
└─ 保持表头在每页重复（如有）

方案 B：表格滚动容器
├─ 超高表格包裹在可滚动容器中
├─ .table-wrapper { max-height: 80vh; overflow-y: auto }
└─ 用户可在页内滚动查看完整表格

方案 C：分页算法优化
├─ 将 TABLE 从 atomicTags 列表移除
├─ 允许分页算法拆分 <tr> 行
├─ 每个 <tr> 作为独立元素参与分页计算
└─ 确保行不被水平裁切
```

---

## 问题 6：边距百分比不适配

### 问题表现

CSS 中使用百分比边距，在手机上可能过大或过小。

### 原始 CSS

```css
body {
    margin-left: 10%;
    margin-right: 10%
}

.chapter {
    margin: 1.5em 10%
}

hr {
    width: 65%;
    margin-left: 17.5%;
    margin-right: 17.5%
}
```

### 手机适配分析

| 屏幕宽度 | 10% 边距 | 实际内容区 |
|----------|----------|------------|
| 桌面 1024px | 102px | 820px |
| 平板 768px | 77px | 614px |
| 手机 375px | 37px | 301px |

```
手机上 10% 边距效果：
┌─────────────────────────────┐
│ ← 37px →│ 内容 │← 37px → │
│          301px             │
└─────────────────────────────┘

实际阅读体验：边距适中，可接受
```

### V2 处理建议

```
百分比边距处理策略：
├─ 保留原始百分比样式（已自适应）
├─ 考虑注入最小边距保护：body { min-width: 280px }
└─ 不需要强制转换
```

---

## 问题 7：字体样式丢失

### 问题表现

字体大小变化、字体变体等样式丢失。

### 原始 CSS

```css
.larger {
    font-size: 150%
}

.smaller {
    font-size: 80%
}

.smcap {
    font-variant: small-caps;
    font-style: normal
}

.chapter p {
    font-size: 90%
}

.caption {
    font-size: 90%
}
```

### V1 问题

```
V1 删除 CSS 后所有文字同一大小：
├─ 标题与正文无区分
├─ 图片说明与正文无区分
├─ 小型大写字母效果丢失
└─ 视觉层次感消失
```

---

## V2 处理优先级

| 优先级 | 问题 | 处理方式 |
|--------|------|----------|
| P0 | 图片固定宽度溢出 | 优化内联样式 |
| P0 | CSS 样式类丢失 | 保留 `<style>`，上传外部 CSS |
| P1 | Drop Cap 失效 | 依赖 CSS 保留 |
| P1 | 跨章节链接失效 | 转换为 APP 导航协议 |
| P2 | 表格布局溢出 | 注入保护样式 |
| P3 | 边距百分比 | 观察，必要时调整 |
| P3 | 字体样式丢失 | 依赖 CSS 保留 |

---

## 阅读器注入的基础 CSS

建议在 V2 中阅读器注入以下基础保护样式：

```css
/* 阅读器基础保护样式 */

/* 防止图片溢出 */
img {
    max-width: 100%;
    height: auto;
}

/* 防止表格溢出 */
table {
    max-width: 100%;
}

/* 表格容器可滚动 */
.table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

/* SVG 自适应 */
svg {
    max-width: 100%;
    height: auto;
}

/* 防止预格式化文本溢出 */
pre, code {
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* 确保视口正确 */
html {
    -webkit-text-size-adjust: 100%;
}
```

---

## 问题 8：分页模式文字被削 (阅读器 Bug)

### 问题表现

在分页阅读模式下，页面底部的文字被水平裁切，只显示上半部分。

### 根本原因

`ReaderContentView.swift` 中分页模式的 CSS 设置了双重 `overflow: hidden`：

```css
/* 第 818-825 行 */
.page {
    height: 100vh;
    overflow: hidden;     /* ← 超出部分直接裁切 */
}

.page-content {
    height: 100%;
    overflow: hidden;     /* ← 双重裁切 */
}
```

分页算法计算页面可用高度：

```javascript
/* 第 1496 行 */
const pageHeight = window.innerHeight - 90; // 50px top + 40px bottom
```

### 问题机制

```
┌─────────────────────────────────────────────────┐
│  Page 1                                         │
│                                                 │
│  This is paragraph text that continues to      │
│  the next line. The measurement says this      │
│  element is 60px, but with line-height it's    │
│  actually 62px. The last line gets ──────────  │ ← overflow:hidden 裁切
├─────────────────────────────────────────────────┤
│  Page 2                                         │
│  ─────clipped because the height calculation   │ ← 文字上半被削
│  didn't account for sub-pixel rendering...     │
└─────────────────────────────────────────────────┘
```

### 导致原因分析

| 原因 | 说明 |
|------|------|
| 行高误差 | `offsetHeight` 不含行高溢出部分 |
| 子像素渲染 | 浏览器实际渲染高度可能有 0.5-1px 差异 |
| margin collapse | 相邻元素的 margin 合并计算不准确 |
| 字体 metrics | 不同字体的 ascender/descender 高度不同 |

### 修复方案

```
方案 A：增加安全边距
├─ 计算 pageHeight 时额外减去 5-10px 安全边距
└─ const pageHeight = window.innerHeight - 90 - 10;

方案 B：改用 CSS Columns 分页
├─ 使用 CSS multi-column 布局自动分页
├─ column-width: 100vw
├─ column-gap: 0
└─ 浏览器自动处理断行，不会裁切文字

方案 C：行对齐分页
├─ 计算每页能容纳的完整行数
├─ pageHeight = Math.floor(availableHeight / lineHeight) * lineHeight
└─ 确保分页边界在行间隙处
```

---

## 问题 9：章节未新页起始 (阅读器 Bug)

### 问题表现

新章节的内容显示在上一章最后一页的下方，而不是从新的一页开始。

### 期望行为

```
┌─────────────────────────────────────────────────┐
│  Chapter 1 - Page 5 (最后一页)                   │
│                                                 │
│  ...end of chapter one.                         │
│                                                 │
│  [页面底部留白]                                  │
│                                                 │
└─────────────────────────────────────────────────┘
                      ↓ 翻页
┌─────────────────────────────────────────────────┐
│  Chapter 2 - Page 1 (新页起始)                   │
│                                                 │
│  CHAPTER TWO                                    │
│                                                 │
│  It was a dark and stormy night...             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 实际问题

```
┌─────────────────────────────────────────────────┐
│  Chapter 1 - Page 5                             │
│                                                 │
│  ...end of chapter one.                         │
│                                                 │
│  CHAPTER TWO              ← 章节2显示在这里！    │
│                                                 │
│  It was a dark...                               │
└─────────────────────────────────────────────────┘
```

### 根本原因

阅读器的 `PagedWebViewContainer.swift` 在章节切换时，可能存在以下问题：

1. **章节预加载合并显示**
   - 预加载的下一章内容被错误地追加到当前章节

2. **章节边界检测问题**
   - 到达章节末尾时，没有正确触发章节切换

3. **WebView 复用问题**
   - 新章节加载时，旧内容未完全清除

### 修复方案

```
方案 A：确保章节独立渲染
├─ 每个章节使用独立的 WebView 实例
├─ 章节切换时完全替换 WebView
└─ 不复用 WebView 内容

方案 B：章节边界强制分页
├─ 在 generatePagedContent() 中
├─ 章节开始标记处强制新页
└─ CSS: h1, h2.chapter { page-break-before: always }

方案 C：章节内容隔离
├─ 每次只加载单个章节内容
├─ 章节导航时完全重新加载
└─ 禁用章节内容合并
```

---

## 阅读器问题总结

| 问题 | 严重程度 | 来源 | 修复难度 |
|------|----------|------|----------|
| 分页文字被削 | 🔴 严重 | CSS overflow:hidden + 高度计算误差 | 中 |
| 章节未新页起始 | 🟠 中等 | 章节切换/预加载逻辑 | 中 |
| 封面页留白过多 | 🟠 中等 | CSS 样式丢失 + 阅读器 padding | 中 |
| 封面图片未独占一页 | 🔴 严重 | BE解析未分离封面章节 | 中 |

---

## 问题 10：封面页留白过多

### 问题表现

书籍封面图片没有全屏显示，上下左右留白过多，视觉效果差。

### 原始 EPUB 封面结构

```html
<!-- wrap0000.html -->
<body>
    <div style="text-align: center">
        <img src="cover.jpg" alt="" class="x-ebookmaker-cover" />
    </div>
</body>
```

```css
/* pgepub.css */
img.x-ebookmaker-cover {
    max-width: 100%
}
```

### 期望效果 vs 实际效果

```
期望效果（全屏封面）              实际效果（留白过多）
┌─────────────────────┐          ┌─────────────────────┐
│                     │          │  ← padding-top 60px │
│                     │          ├─────────────────────┤
│  ┌───────────────┐  │          │  ← padding 20px     │
│  │               │  │          │  ┌───────────────┐  │
│  │               │  │          │  │               │  │
│  │    COVER      │  │          │  │    COVER      │  │
│  │    IMAGE      │  │          │  │    IMAGE      │  │
│  │               │  │          │  │               │  │
│  │               │  │          │  └───────────────┘  │
│  └───────────────┘  │          │                     │
│                     │          │  ← padding-bottom   │
│                     │          │                     │
└─────────────────────┘          └─────────────────────┘
```

### 根本原因

1. **阅读器 body padding**
   ```css
   /* ReaderContentView.swift 第 242-245 行 */
   body {
       padding: 20px;
       padding-top: 60px;
       padding-bottom: 100px;
   }
   ```

2. **V1 删除封面居中样式**
   - 删除 `<style>` 和 `<link>` 后，`text-align: center` 等样式丢失

3. **图片未设置填充模式**
   - 封面图片没有 `object-fit: cover` 或 `height: 100vh`

### 修复方案

```
方案 A：封面页特殊处理（推荐）
├─ 检测封面页（第一章/cover 类名）
├─ 移除 body padding
├─ 设置图片 width: 100vw; height: 100vh; object-fit: contain
└─ 背景色设置为图片主色调

方案 B：CSS 覆盖
├─ 注入封面专用样式
├─ .x-ebookmaker-cover {
│      width: 100vw;
│      height: 100vh;
│      object-fit: contain;
│      position: fixed;
│      top: 0; left: 0;
│  }
└─ 封面页 body { padding: 0; margin: 0; }

方案 C：V2 保留原始样式
├─ 保留 EPUB 中的 <style> 和 <link>
├─ 出版商的封面样式自动生效
└─ 阅读器检测封面页减少 padding
```

---

## 问题 11：封面图片未独占一页 (BE 解析 Bug)

### 问题表现

封面图片没有单独占一页，而是和后续的章节标题、正文内容混合显示在第一页。且第一页内容超出屏幕高度，下一页却没有接着显示余下的部分。

### 期望效果 vs 实际效果

```
期望效果                              实际效果
┌─────────────────────┐              ┌─────────────────────┐
│  Page 1             │              │  Page 1             │
│                     │              │  ┌───────────────┐  │
│  ┌───────────────┐  │              │  │    COVER      │  │
│  │               │  │              │  │    IMAGE      │  │
│  │    COVER      │  │              │  └───────────────┘  │
│  │    IMAGE      │  │              │                     │
│  │               │  │              │  CHAPTER I.         │
│  └───────────────┘  │              │                     │
│                     │              │  THE MOTHER'S P...  │
│                     │              ├─────────────────────┤ ← 内容被裁切
└─────────────────────┘              │  [被削掉的部分]       │
         ↓ 翻页                      └─────────────────────┘
┌─────────────────────┐                       ↓ 翻页
│  Page 2             │              ┌─────────────────────┐
│                     │              │  Page 2             │
│  CHAPTER I.         │              │                     │
│                     │              │  [与上一页不衔接]     │
│  THE MOTHER'S P...  │              │                     │
│                     │              └─────────────────────┘
└─────────────────────┘
```

### 根本原因

**后端 EPUB 解析时未正确分离封面章节**

从日志可以看到，封面图片和第一章内容被合并在同一个章节 HTML 中：

```html
<img src="...img-1.jpg" class="x-ebookmaker-cover"> <h1>CHAPTER I.</h1> <p>THE MOTHER'S P...
```

正确的 EPUB 解析应该：
1. **识别封面文件**：EPUB 的 OPF 文件通常在 `<guide>` 或 `<metadata>` 中标记封面
2. **封面作为独立章节**：封面应该是一个单独的章节，只包含封面图片
3. **正文章节分离**：第一章从 `CHAPTER I` 开始，不应包含封面

### 修复方案

```
方案 A：后端解析修复（推荐）
├─ 解析 EPUB 时识别封面标记
│   ├─ OPF guide 中的 type="cover"
│   ├─ OPF metadata 中的 cover-image
│   └─ HTML 中的 class="x-ebookmaker-cover"
├─ 将封面作为独立章节存储
└─ 确保正文章节不包含封面内容

方案 B：客户端补救措施（已实现）
├─ 检测封面图片（class 含 cover 或 x-ebookmaker-cover）
│   └─ 强制作为单独一页，不与其他元素合并
├─ 超高元素（>80% 页面高度）单独分页
└─ 防止第一页内容溢出
```

### 代码修改位置

`ios/Readmigo/Features/Reader/ReaderContentView.swift` 第 1647-1689 行的分页逻辑

---

## 问题 12：Project Gutenberg 协议内容重复显示 (BE 解析 Bug)

### 问题表现

每一章都会重复显示 The Project Gutenberg 的协议/声明内容，而不是只在书籍开头或结尾显示一次。

### 影响书籍

| 书名 | 来源 |
|------|------|
| The Lance of Kanana: A story of Arabia | Project Gutenberg |

### 期望效果 vs 实际效果

```
期望效果                              实际效果
┌─────────────────────┐              ┌─────────────────────┐
│  Chapter 1          │              │  Chapter 1          │
│                     │              │                     │
│  [正文内容]          │              │  [Project Gutenberg │
│                     │              │   License Text]     │
│                     │              │                     │
└─────────────────────┘              │  [正文内容]          │
         ↓                           └─────────────────────┘
┌─────────────────────┐                       ↓
│  Chapter 2          │              ┌─────────────────────┐
│                     │              │  Chapter 2          │
│  [正文内容]          │              │                     │
│                     │              │  [Project Gutenberg │
│                     │              │   License Text]     │ ← 重复！
└─────────────────────┘              │                     │
                                     │  [正文内容]          │
                                     └─────────────────────┘
```

### 根本原因

**后端 EPUB 解析时未过滤 Project Gutenberg 的协议内容**

Project Gutenberg 的 EPUB 文件通常在每个 HTML 文件中都包含协议声明，后端解析时应该：
1. 识别并移除 Project Gutenberg 的 header/footer 协议内容
2. 只保留书籍正文内容

### 修复方案

```
后端解析修复：
├─ 识别 Project Gutenberg 协议文本特征
│   ├─ "The Project Gutenberg" 开头的段落
│   ├─ "www.gutenberg.org" 链接
│   ├─ License/Terms of Use 相关内容
│   └─ "This eBook is for the use of anyone" 等标识文本
├─ 在章节内容提取时过滤这些协议内容
└─ 确保每章只包含书籍正文
```

### 责任归属

| 组件 | 责任 |
|------|------|
| BE 解析 | 🔴 需修复 - 过滤 Project Gutenberg 协议内容 |
| iOS 阅读器 | ⚪ 无需修改 |

---

## 问题 13：Dropcap 图片导致第一页内容稀疏 (阅读器 Bug)

### 问题表现

章节第一页只显示章节标题、小标题和 dropcap 装饰图片，真正的段落内容被推到下一页，导致第一页内容稀疏、留白过多。

### 影响书籍

| 书名 | 章节 |
|------|------|
| The Young Pilgrim | Preface |

### 期望效果 vs 实际效果

```
期望效果                              实际效果
┌─────────────────────────────┐      ┌─────────────────────────────┐
│  Preface                    │      │  Preface                    │
│                             │      │                             │
│  Preface.                   │      │  Preface.                   │
│  ┌───┐                      │      │  ┌───┐                      │
│  │ I │ t may perhaps be     │      │  │ I │                      │
│  │   │ necessary to give    │      │  └───┘                      │
│  └───┘ a brief explanation  │      │                             │
│  of the object of this      │      │  [大片空白]                  │
│  little work...             │      │                             │
│                             │      │                     1 / 8   │
└─────────────────────────────┘      └─────────────────────────────┘
                                              ↓ 翻页
                                     ┌─────────────────────────────┐
                                     │  It may perhaps be          │
                                     │  necessary to give a brief  │
                                     │  explanation of the object  │
                                     │  of this little work...     │
                                     │                             │
                                     │                     2 / 8   │
                                     └─────────────────────────────┘
```

### 根本原因

分页算法将 dropcap 图片作为独立块级元素计算高度，但实际上 dropcap 是 `float: left` 的内联元素，应该与后续段落文字一起流动显示。

```javascript
// 原分页逻辑：每个元素都计算高度
elements.forEach((el, idx) => {
    const elHeight = el.offsetHeight + marginTop + marginBottom;
    // dropcap 图片被计算了高度，导致页面"看起来"已满
    // 但实际上 dropcap 是 float 元素，不占块级空间
});
```

### 修复方案

```
将 dropcap div + p.dropcap 作为组合处理：
├─ 检测 div 内包含 img.dropcap
├─ 查找紧随其后的 p.dropcap 元素
├─ 将两者作为一组添加到当前页面
├─ 使用估算高度（20px）替代实际测量
└─ 通过 skipIndices Set 跳过已处理的 p.dropcap
```

### 问题分析过程

1. **初次尝试**：只跳过 dropcap 图片高度计算
   - 结果：失败，p.dropcap 段落仍被单独计算，高度过大导致分页

2. **二次尝试**：将 dropcap div 和 p.dropcap 一起测量
   - 方法：创建临时容器，将两个元素放入测量组合高度
   - 结果：失败，测量出 415px（实际只需约 120px）
   - 原因：CSS `float: left` 在临时测量容器中不生效

3. **最终方案**：使用估算高度替代测量
   - 原理：dropcap 是 float 元素，实际不占用块级高度
   - 使用较小估算值（20px）让 dropcap 组合与后续内容一起填充页面
   - 只在页面几乎满时才触发分页，否则直接添加

### 修复代码

```javascript
// reader-template.ts 分页算法
const skipIndices = new Set();

elements.forEach((el, idx) => {
    // Skip if already processed as part of dropcap group
    if (skipIndices.has(idx)) return;

    // Handle dropcap div + p.dropcap as a group
    const isDropcapDiv = el.tagName === 'DIV' &&
                         el.querySelector &&
                         el.querySelector('img.dropcap');
    if (isDropcapDiv) {
        // Find the next p.dropcap element
        let nextDropcapP = null;
        let nextDropcapPIdx = -1;
        for (let i = idx + 1; i < elements.length; i++) {
            const nextEl = elements[i];
            if (nextEl.tagName === 'P' && nextEl.className.includes('dropcap')) {
                nextDropcapP = nextEl;
                nextDropcapPIdx = i;
                break;
            }
        }

        if (nextDropcapP) {
            skipIndices.add(nextDropcapPIdx);
            const estimatedHeight = 20; // CSS float 无法准确测量，使用小值

            if (currentPageContent && currentHeight > pageHeight - estimatedHeight) {
                pages.push(currentPageContent);
                currentPageContent = '';
                currentHeight = 0;
            }

            currentPageContent += el.outerHTML + nextDropcapP.outerHTML;
            currentHeight += estimatedHeight;
            return;
        }
    }
    // ... 其余元素正常计算高度
});
```

### 经验总结

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| DOM 测量不准确 | CSS float 在离线容器中不生效 | 使用估算高度替代测量 |
| 元素被分开处理 | 分页算法逐元素遍历 | 检测关联元素，作为组合处理 |
| p.dropcap 重复处理 | forEach 无法跳过后续元素 | 使用 Set 记录已处理索引 |

### 修复状态

| 组件 | 状态 |
|------|------|
| Content Studio | ✅ 已修复 (2026-01-23) |
| iOS 阅读器 | 🔴 待同步 |

---

## 问题 14：章节标题重复显示 (阅读器 Bug)

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
    processedHtml = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, content) => {
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

## 问题 15：Dropcap 图片尺寸过大 (阅读器 Bug)

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

## 相关文档

- [EPUB内容版本方案对比](./epub-content-versions-comparison.md)
