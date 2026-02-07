## 核心问题

**问题**：EPUB 书籍在手机屏幕上的最佳、最完美显示方案是什么？

**答案**：采用 **CSS Multi-Column 分页 + Reflowable 排版 + 用户可控参数** 的组合方案。

---

### 1.1 分页技术：CSS Multi-Column Layout

**优势**：
- 浏览器原生支持，性能最佳
- 自动处理文本断行
- 支持 CSS break 属性控制分页点

**行业采用**：Apple Books、Kindle、Readium、epub.js 等主流阅读器均采用此方案。

### 1.2 开源标准：Readium CSS

[Readium CSS](https://github.com/readium/readium-css) 是 EPUB 阅读系统的参考样式表，被以下项目采用：
- Thorium Reader (桌面/Web)
- Zotero
- Vital Source
- Readium Mobile/Web SDK

---

### 2.1 字体与尺寸

| 参数 | 最佳值 | 说明 |
|------|--------|------|
| **字体单位** | `em` 或 `%` | 相对单位，允许用户缩放 |
| **基础字号** | 16px (1em) | 设备默认，用户可调 |
| **标题比例** | 1.3x - 2x | 相对正文字号 |
| **字体选择** | 系统字体 + 嵌入字体 | Georgia, Bookerly, Literata 等 |

### 2.2 行长与行高

| 参数 | 最佳值 | 说明 |
|------|--------|------|
| **行高** | 1.4 - 1.6 | 正文最佳阅读体验 |
| **段间距** | 0.5em - 1em | 段落视觉分隔 |
| **首行缩进** | 1em | 传统排版惯例 |

---

### 4.1 断字 (Hyphenation)

**说明**：
- 两端对齐配合断字可避免"河流"效果（单词间不均匀空白）
- 标题应禁用断字以保持完整性

### 4.2 文本对齐

| 对齐方式 | 适用场景 | 说明 |
|----------|----------|------|
| **左对齐** | 短屏幕、无断字支持 | 最安全的选择 |
| **两端对齐** | 配合断字使用 | 更正式，但需断字支持 |

---

### 5.2 可选高级设置

| 设置项 | 范围 | 默认值 |
|--------|------|--------|
| 边距宽度 | 窄/中/宽 | 中 |
| 文本对齐 | 左对齐/两端对齐 | 两端对齐 |
| 亮度 | 0-100% | 系统默认 |
| 页面过渡动画 | 开/关 | 开 |

---

## 七、与 Apple Books 对比

| 特性 | Apple Books | 最佳方案实现 |
|------|-------------|-------------|
| 分页技术 | CSS Multi-Column | ✅ 相同 |
| 用户字号控制 | ✅ | ✅ |
| 主题切换 | 4种 (白/黑/褐/护眼) | ✅ 相同 |
| 断字 | 自动 | ✅ |
| 孤行寡行控制 | ✅ | ✅ |
| 图片点击放大 | ✅ | 需额外实现 |
| 横屏双栏 | ✅ | 需额外实现 |
| 进度同步 | iCloud | 需后端支持 |

---

### 必须实现 (P0)

| 项目 | 实现方式 |
|------|---------|
| CSS Multi-Column 分页 | `column-width: 100vw; height: 100vh;` |
| 相对字号单位 | `font-size: 1em;` |
| 行高 1.4-1.6 | `line-height: 1.5;` |
| 孤行寡行控制 | `orphans: 2; widows: 2;` |
| 标题保护 | `break-after: avoid;` |
| 图片尺寸限制 | `max-height: 80vh;` |
| 用户字号设置 | CSS 变量 + 滑块 |
| 多主题支持 | CSS 变量切换 |

### 建议实现 (P1)

| 项目 | 说明 |
|------|------|
| 自动断字 | `hyphens: auto;` |
| 两端对齐 | `text-align: justify;` |
| 行间距设置 | 用户可调 |
| 字体选择 | 系统字体 + 嵌入字体 |

### 锦上添花 (P2)

| 项目 | 说明 |
|------|------|
| 图片点击放大 | 模态框查看原图 |
| 横屏双栏 | 平板/横屏优化 |
| 翻页动画 | 滑动/淡入淡出 |
| 进度云同步 | 跨设备阅读位置 |

---

## 参考资料

- [Readium CSS](https://github.com/readium/readium-css) - 行业标准参考实现
- [EPUB 3 Best Practices](https://www.oreilly.com/library/view/epub-3-best/9781449329129/) - O'Reilly 最佳实践指南
- [Apple Books Asset Guide](https://help.apple.com/itc/booksassetguide/) - Apple 官方规范
- [CSS Multi-Column Pagination](https://www.sitepoint.com/css3-columns-and-paged-reflowable-content/) - 技术实现参考
- [Friends of EPUB - BlitzTricks](https://friendsofepub.github.io/eBookTricks/) - CSS 技巧集合

---

*文档生成日期: 2026-01-25*
