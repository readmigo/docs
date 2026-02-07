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

### 问题表现

在分页阅读模式下，图片高度超出页面可视区域，底部被裁切显示不全。

### 根本原因

1. **图片原始尺寸过大**：EPUB 中的插图可能是高分辨率图片
2. **分页容器 overflow:hidden**：超出页面高度的内容直接被裁切
3. **图片未设置最大高度**：阅读器注入的 CSS 只限制了 `max-width: 100%`，未限制高度

---

### 问题表现

原书每章开头有精美的首字母图片装饰，V1 处理后完全失效。

---

### 问题表现

目录页和正文中的章节跳转链接点击无响应。

### 链接类型分析

| 链接类型 | 示例 | 处理方式 |
|----------|------|----------|
| 同章节锚点 | `#footnote1` | 保留，WebView 内跳转 |
| 跨章节链接 | `chapter2.html#section` | 转换为 APP 导航协议 |
| 外部链接 | `https://...` | 保留，系统浏览器打开 |

---

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

---

### 问题表现

在分页阅读模式下，目录表格或其他表格高度超出页面，底部行被裁切显示不全。

### 根本原因

1. **表格作为单一元素处理**：分页算法将整个 `<table>` 视为一个不可分割的元素
2. **表格高度超出页面**：长目录表格无法放入单页
3. **overflow:hidden 裁切**：超出部分直接被隐藏

---

### 问题表现

CSS 中使用百分比边距，在手机上可能过大或过小。

### 手机适配分析

| 屏幕宽度 | 10% 边距 | 实际内容区 |
|----------|----------|------------|
| 桌面 1024px | 102px | 820px |
| 平板 768px | 77px | 614px |
| 手机 375px | 37px | 301px |

---

### 问题表现

字体大小变化、字体变体等样式丢失。

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

---

### 问题表现

在分页阅读模式下，页面底部的文字被水平裁切，只显示上半部分。

### 根本原因

`ReaderContentView.swift` 中分页模式的 CSS 设置了双重 `overflow: hidden`：

分页算法计算页面可用高度：

### 导致原因分析

| 原因 | 说明 |
|------|------|
| 行高误差 | `offsetHeight` 不含行高溢出部分 |
| 子像素渲染 | 浏览器实际渲染高度可能有 0.5-1px 差异 |
| margin collapse | 相邻元素的 margin 合并计算不准确 |
| 字体 metrics | 不同字体的 ascender/descender 高度不同 |

---

### 问题表现

新章节的内容显示在上一章最后一页的下方，而不是从新的一页开始。

### 根本原因

阅读器的 `PagedWebViewContainer.swift` 在章节切换时，可能存在以下问题：

1. **章节预加载合并显示**
   - 预加载的下一章内容被错误地追加到当前章节

2. **章节边界检测问题**
   - 到达章节末尾时，没有正确触发章节切换

3. **WebView 复用问题**
   - 新章节加载时，旧内容未完全清除

---

## 阅读器问题总结

| 问题 | 严重程度 | 来源 | 修复难度 |
|------|----------|------|----------|
| 分页文字被削 | 🔴 严重 | CSS overflow:hidden + 高度计算误差 | 中 |
| 章节未新页起始 | 🟠 中等 | 章节切换/预加载逻辑 | 中 |
| 封面页留白过多 | 🟠 中等 | CSS 样式丢失 + 阅读器 padding | 中 |
| 封面图片未独占一页 | 🔴 严重 | BE解析未分离封面章节 | 中 |

---

### 问题表现

书籍封面图片没有全屏显示，上下左右留白过多，视觉效果差。

### 根本原因

1. **阅读器 body padding**

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
html
<img src="...img-1.jpg" class="x-ebookmaker-cover"> <h1>CHAPTER I.</h1> <p>THE MOTHER'S P...

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

后端解析修复：
├─ 识别 Project Gutenberg 协议文本特征
│   ├─ "The Project Gutenberg" 开头的段落
│   ├─ "www.gutenberg.org" 链接
│   ├─ License/Terms of Use 相关内容
│   └─ "This eBook is for the use of anyone" 等标识文本
├─ 在章节内容提取时过滤这些协议内容
└─ 确保每章只包含书籍正文

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
javascript
// 原分页逻辑：每个元素都计算高度
elements.forEach((el, idx) => {
    const elHeight = el.offsetHeight + marginTop + marginBottom;
    // dropcap 图片被计算了高度，导致页面"看起来"已满
    // 但实际上 dropcap 是 float 元素，不占块级空间
});

将 dropcap div + p.dropcap 作为组合处理：
├─ 检测 div 内包含 img.dropcap
├─ 查找紧随其后的 p.dropcap 元素
├─ 将两者作为一组添加到当前页面
├─ 使用估算高度（20px）替代实际测量
└─ 通过 skipIndices Set 跳过已处理的 p.dropcap
javascript
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

┌─────────────────────────────┐
│                             │
│     Preface                 │  ← H1 (模板注入)
│                             │
│     Preface.                │  ← H2 (EPUB 原始内容)
│                             │
│  The following pages...     │
│                             │
└─────────────────────────────┘

阅读器 HTML 生成流程：
├─ 模板添加 H1 章节标题 (chapterTitle)
├─ 插入 EPUB 章节原始 HTML 内容
│   └─ 原始内容中已有 H2 标题
└─ 结果：H1 + H2 两个标题重复显示
html
<h2>Preface.</h2>
<p>The following pages contain...</p>
html
<h1 class="chapter-title">Preface</h1>
<!-- EPUB 原始内容 -->
<h2>Preface.</h2>
<p>The following pages contain...</p>

标题去重逻辑：
├─ 获取章节标题 (chapterTitle)
├─ 标准化处理：转小写、移除非字母数字字符
├─ 使用正则匹配 HTML 中的 H2 标签
├─ 对每个 H2 提取文本内容并标准化
├─ 若 H2 文本 === 章节标题，则移除该 H2
└─ 保留不匹配的 H2 标签
javascript
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
css
/* 原始设置 */
img.dropcap {
    max-width: 3em;   /* 约 54px @ 18px 字号 */
    max-height: 3em;
}

尺寸调整：
├─ max-width: 3em → 2em (原来的 2/3)
├─ max-height: 3em → 2em
└─ margin: 0.3em → 0.2em (等比缩小间距)
css
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
