# 开源电子书工具复用分析报告

> 基于代码库深度分析，针对 Readmigo 业务场景的复用决策

## 目录

1. [分析范围](#1-分析范围)
2. [Standard Ebooks 项目](#2-standard-ebooks-项目)
3. [Project Gutenberg 项目](#3-project-gutenberg-项目)
4. [其他工具项目](#4-其他工具项目)
5. [复用决策矩阵](#5-复用决策矩阵)
6. [Readmigo Pipeline 设计建议](#6-readmigo-pipeline-设计建议)

---

## 1. 分析范围

### 1.1 代码库位置

```
/tmp/ebook-tools/
├── standard-ebooks/
│   ├── tools/      # 40+ CLI 命令的 Python 工具集
│   ├── web/        # 网站 + 阅读器 CSS
│   └── manual/     # 排版规范手册
├── project-gutenberg/
│   ├── ebookmaker/ # PG 官方转换工具
│   ├── libgutenberg/  # 共享库 (元数据、数据库)
│   └── ebookconverter/ # 批量转换编排器
└── other-tools/
    ├── epub.js/    # JS 阅读器引擎
    └── ebook-fonts/ # 电子书字体
```

### 1.2 决策维度

| 维度 | 权重 | 说明 |
|-----|------|------|
| 复用最大化 | ⭐⭐⭐⭐⭐ | 书籍处理、排版、Pipeline 能力 |
| 手机平台友好 | ⭐⭐⭐⭐⭐ | 专注手机屏幕显示正确和完美 |
| PG 源文件处理 | ⭐⭐⭐⭐ | 主要书籍来源是 Project Gutenberg |
| 段落级操作 | ⭐⭐⭐⭐ | 支持双击段落展示翻译结果 |
| TTS/音文同步 | ⭐⭐⭐ | 支持 TTS 阅读和音文同步 |

### 1.3 业务流程映射

```
流程1: 多来源文件 → 清洗 → 规范化 → 段落级翻译 → 手机展示 → 双击段落展示翻译
流程2: 多来源文件 → 清洗 → 规范化 → 手机展示 → TTS阅读 → 音文同步
```

---

## 2. Standard Ebooks 项目

### 2.1 tools/ - 核心工具集

| 工具 | 用途 | 复用价值 |
|-----|------|---------|
| `typogrify` | 智能标点转换 | ⭐⭐⭐⭐⭐ |
| `clean` | XML/CSS 格式化 | ⭐⭐⭐⭐ |
| `semanticate` | 语义化标注 | ⭐⭐⭐ |
| `hyphenate` | 软连字符插入 | ⭐⭐⭐⭐ |
| `create-draft` | PG 导入+清洗 | ⭐⭐⭐⭐⭐ |
| `build` | EPUB 构建 | ⭐⭐ |
| `lint` | 质量检查 | ⭐⭐ |

#### 2.1.1 Typography 模块 (typography.py)

**高复用价值** - 可直接移植为 TypeScript

```
转换规则:
├── 直引号 → 弯引号 (smartypants)
├── -- → — (em dash)
├── ... → … (ellipsis)
├── 1/4 → ¼ (fractions)
├── Mr. + space → Mr. + NO_BREAK_SPACE
├── 'tis → 'tis (contractions)
└── ` → ' (PG backtick fix)

Unicode 常量:
├── WORD_JOINER = \u2060 (防止 em-dash 前断行)
├── HAIR_SPACE = \u200a (引号间隙)
├── NO_BREAK_SPACE = \u00a0 (缩写后不断行)
└── SHY_HYPHEN = \u00ad (软连字符)
```

#### 2.1.2 PG Boilerplate 清洗 (create_draft.py)

**高复用价值** - PG 源文件处理核心

```python
# 新版 PG HTML 结构
//section[contains(@class, 'pg-boilerplate')]

# 旧版 PG HTML 结构
//*[re:test(text(), '\\*\\*\\*\\s*START OF')]
//*[re:test(text(), 'End of (the )?Project Gutenberg')]

# Producer 信息提取
r"Produced by|Credits\s*:\s*"
```

### 2.2 web/ - CSS 样式

| 文件 | 用途 | 手机适配价值 |
|-----|------|------------|
| `core.css` | 基础排版 (4593行) | ⭐⭐⭐ |
| `web.css` | 阅读器样式 | ⭐⭐⭐⭐ |
| `se.css` | EPUB 样式 | ⭐⭐⭐⭐ |

**关键 CSS 规则**:
- 行宽: `max-width: 55ch` (最佳阅读宽度)
- 行高: `line-height: 1.4`
- 首行缩进: `text-indent: 1em` (非首段)
- 诗歌悬挂缩进: `padding-left: 1em; text-indent: -1em`

### 2.3 manual/ - 排版规范

**参考价值** - 用于制定 Readmigo 内容规范

| 章节 | 内容 |
|-----|------|
| 7-high-level-structural-patterns | 章节结构规范 |
| 8-typography | 排版规则 |
| 10-art-and-images | 图片规范 |

---

## 3. Project Gutenberg 项目

### 3.1 ebookmaker/ - 官方转换工具

**架构**:
```
Input (HTML/TXT/RST)
    ↓
ParserFactory → 格式检测 + 解析
    ↓
Spider → 依赖收集 (图片等)
    ↓
HTMLParser → 清洗 + 规范化
    ↓
WriterFactory → 多格式输出
```

#### 3.1.1 HTML 清洗模块 (HTMLParser.py)

**高复用价值** - 841 行全面的 HTML 清洗

| 功能 | 说明 |
|-----|------|
| 编码检测 | XML声明 → meta → cchardet → UTF-8 → Windows-1252 |
| 废弃元素替换 | `<font>` → `<span>`, `<center>` → `<div>` |
| 属性规范化 | `align` → CSS, `bgcolor` → CSS |
| ID 修复 | 非法字符移除, 重复 ID 处理 |
| 链接验证 | 内部链接存在性检查 |
| Alt 文本 | 不当 alt 检测 + 标记 |

#### 3.1.2 Boilerplate 清洗 (boilerplate.py)

**高复用价值** - BeautifulSoup 实现，容错性强

```python
# Header 标记
"START OF THIS PROJECT GUTENBERG"

# Footer 标记
"END OF THIS PROJECT GUTENBERG"
"*** END OF THE PROJECT GUTENBERG EBOOK"

# 德语变体
"Ende dieses Projekt Gutenberg"
```

#### 3.1.3 纯文本解析 (GutenbergTextParser.py)

**中等复用价值** - 700+ 行启发式文本结构检测

- 段落类型检测 (标题、诗歌、引用、居中)
- 缩进模式分析
- 押韵检测 (可选)

### 3.2 libgutenberg/ - 共享库

#### 3.2.1 元数据模块 (DublinCore.py)

**中等复用价值** - Dublin Core 标准实现

```
DublinCore {
  title, subtitle, alt_title
  authors: [{name, birthdate, deathdate, role}]
  languages: [Language]
  subjects: [LCSH]
  release_date, update_date
  encoding, downloads
}
```

#### 3.2.2 全局常量 (GutenbergGlobals.py)

**高复用价值** - 可直接使用的常量

| 常量 | 说明 |
|-----|------|
| `NSMAP` | 35+ XML 命名空间 |
| `NONFILINGS` | 标题排序忽略词 (The, A, Der...) |
| `ROLES` | 50+ MARC 关系码 |

#### 3.2.3 文件路径工具 (GutenbergFiles.py)

**中等复用价值**

- `archive_dir(12345)` → `"1/2/3/4/12345"`
- `guess_filetype(filename)` → 类型推断
- `get_compression(filename)` → 压缩格式检测

---

## 4. 其他工具项目

### 4.1 epub.js - JS 阅读器引擎

#### 4.1.1 分页算法

**高参考价值** - CSS Multi-Column 实现

```javascript
// 核心 CSS
column-width: ${pageWidth}px
column-gap: ${gap}px
column-axis: horizontal
column-fill: auto

// 页数计算
spreads = Math.ceil(totalLength / pageLength)
pages = spreads * divisor  // divisor=2 for double-page
```

#### 4.1.2 触摸处理 (snap.js)

**高参考价值** - 滑动翻页实现

```javascript
// 滑动检测
velocity > 0.2 && distance > 10px → 翻页
duration: 80ms (easeInCubic)

// 被动事件监听 (性能优化)
{ passive: true }
```

#### 4.1.3 CFI 定位 (epubcfi.js)

**中等参考价值** - 精确位置标识

```
epubcfi(/6/4[chap01]!/4[body]/10[para],/2/1:1,/3:4)
         ↑spine    ↑element path    ↑character offset
```

#### 4.1.4 文本选择 (contents.js)

**高参考价值** - 双击段落交互基础

```javascript
// 选择变更监听
selectionchange + 250ms debounce
→ getSelection()
→ Range → CFI
```

### 4.2 ebook-fonts - 阅读字体

**中等复用价值**

| 字体 | 特点 |
|-----|------|
| EB Garamond | 经典衬线，适合长文阅读 |
| Literata | Google 设计，专为屏幕 |
| Modified line-height | 针对电子阅读优化 |

---

## 5. 复用决策矩阵

### 5.1 按功能模块

| 功能 | 首选来源 | 备选 | 复用方式 |
|-----|---------|------|---------|
| **PG Boilerplate 清洗** | SE create_draft | PG boilerplate.py | 移植正则 |
| **智能标点** | SE typography.py | Pandoc | 移植为 TS |
| **HTML 清洗** | PG HTMLParser | SE formatting | 参考逻辑 |
| **CSS 排版** | SE web.css | epub.js | 直接使用 |
| **分页算法** | epub.js | 自研 | 参考实现 |
| **触摸翻页** | epub.js snap.js | 自研 | 参考实现 |
| **文本选择** | epub.js contents.js | 自研 | 参考实现 |
| **元数据** | PG DublinCore | SE | 参考结构 |
| **软连字符** | SE hyphenate | Hypher | 使用库 |

### 5.2 按业务流程

#### 流程1: 段落级翻译展示

```
┌─────────────────────────────────────────────────────────────┐
│ 多来源文件                                                   │
│   ↓                                                         │
│ SE create_draft (PG清洗) + PG HTMLParser (通用清洗)          │
│   ↓                                                         │
│ SE typography.py (标点规范化)                                │
│   ↓                                                         │
│ 段落标记 (<p data-paragraph-id="...">)                       │
│   ↓                                                         │
│ epub.js 分页 + 触摸                                          │
│   ↓                                                         │
│ 双击监听 → 段落ID → 翻译API → 弹窗展示                        │
└─────────────────────────────────────────────────────────────┘
```

#### 流程2: TTS 音文同步

```
┌─────────────────────────────────────────────────────────────┐
│ 多来源文件                                                   │
│   ↓                                                         │
│ SE create_draft + PG HTMLParser                              │
│   ↓                                                         │
│ SE typography.py + SE hyphenate (断词)                       │
│   ↓                                                         │
│ 句子/段落标记 (<span data-sentence-id="...">)                │
│   ↓                                                         │
│ epub.js 分页 + CFI 定位                                      │
│   ↓                                                         │
│ TTS API → 时间戳 → CFI 映射 → 高亮同步                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 优先级排序

| 优先级 | 模块 | 来源 | 工作量 |
|-------|------|------|-------|
| P0 | PG Boilerplate 清洗 | SE + PG | 2天 |
| P0 | 智能标点转换 | SE typography | 3天 |
| P0 | HTML 基础清洗 | PG HTMLParser | 2天 |
| P1 | CSS 排版样式 | SE CSS | 1天 |
| P1 | 分页算法 | epub.js 参考 | 3天 |
| P1 | 段落ID标记 | 自研 | 1天 |
| P2 | 触摸翻页 | epub.js 参考 | 2天 |
| P2 | 文本选择/双击 | epub.js 参考 | 2天 |
| P2 | 软连字符 | SE/Hypher | 1天 |
| P3 | TTS 时间戳映射 | 自研 | 3天 |
| P3 | CFI 定位 | epub.js 参考 | 2天 |

---

## 6. Readmigo Pipeline 设计建议

### 6.1 推荐架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Readmigo Content Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Source  │───→│  Clean   │───→│ Normalize│              │
│  │  Loader  │    │  Module  │    │  Module  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       ↓               ↓               ↓                     │
│  ┌──────────────────────────────────────────┐              │
│  │           Unified XHTML Output            │              │
│  │  - 段落ID: <p data-pid="ch1-p3">          │              │
│  │  - 句子ID: <span data-sid="ch1-s15">      │              │
│  │  - 规范标点、软连字符                       │              │
│  └──────────────────────────────────────────┘              │
│                         ↓                                   │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   iOS Reader    │  │ Android Reader  │                 │
│  │  (Swift/WKWeb)  │  │ (Kotlin/WebView)│                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 模块职责

| 模块 | 职责 | 技术来源 |
|-----|------|---------|
| **SourceLoader** | 下载、解压、格式检测 | PG libgutenberg |
| **CleanModule** | Boilerplate移除、废弃标签替换 | SE + PG |
| **NormalizeModule** | 标点规范、编码统一、ID注入 | SE typography |
| **ReaderEngine** | 分页、触摸、选择、TTS同步 | epub.js 参考 |

### 6.3 TypeScript 移植清单

```typescript
// 从 SE typography.py 移植
export const UNICODE = {
  WORD_JOINER: '\u2060',
  HAIR_SPACE: '\u200a',
  NO_BREAK_SPACE: '\u00a0',
  SHY_HYPHEN: '\u00ad',
  EM_DASH: '\u2014',
  EN_DASH: '\u2013',
  ELLIPSIS: '\u2026',
};

// 从 SE create_draft.py 移植
export const PG_BOILERPLATE = {
  NEW_STRUCTURE: 'section.pg-boilerplate',
  OLD_START: /\*\*\*\s*START OF (THIS|THE) PROJECT GUTENBERG/i,
  OLD_END: /End of (the )?Project Gutenberg/i,
};

// 从 PG HTMLParser.py 移植
export const DEPRECATED_ELEMENTS = [
  'font', 'center', 'blink', 'marquee', 'strike', 'big', 'small'
];
```

### 6.4 手机优先考虑

| 考虑点 | 解决方案 |
|-------|---------|
| 屏幕宽度 | CSS `max-width: 100vw`, 无横向滚动 |
| 触摸翻页 | 左右滑动 + 点击边缘翻页 |
| 双击交互 | 段落双击 → 翻译弹窗 |
| 字体大小 | 动态缩放，最小 16px |
| 夜间模式 | CSS 变量切换 |
| 性能 | 被动事件监听，虚拟化长列表 |

---

## 附录: 代码库统计

| 项目 | 文件数 | 代码行数 | 语言 |
|-----|-------|---------|-----|
| SE tools | 50+ | ~15,000 | Python |
| SE web | 100+ | ~10,000 | PHP/CSS |
| SE manual | 30+ | ~5,000 | RST |
| PG ebookmaker | 30+ | ~8,000 | Python |
| PG libgutenberg | 15 | ~4,500 | Python |
| epub.js | 50+ | ~8,000 | JavaScript |

---

*报告生成时间: 2026-01-26*
*代码分析范围: /tmp/ebook-tools/*
