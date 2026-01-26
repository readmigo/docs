# 用户自定义导入电子书 EPUB2/EPUB3 支持详细设计文档

> 文档版本: 1.0
> 创建日期: 2025-12-28
> 状态: 技术设计完成

---

## 目录

1. [概述](#1-概述)
2. [EPUB 格式规范](#2-epub-格式规范)
3. [EPUB2 vs EPUB3 技术差异](#3-epub2-vs-epub3-技术差异)
4. [文件结构详解](#4-文件结构详解)
5. [解析器架构设计](#5-解析器架构设计)
6. [元数据提取规范](#6-元数据提取规范)
7. [章节解析策略](#7-章节解析策略)
8. [封面提取算法](#8-封面提取算法)
9. [内容清洗与标准化](#9-内容清洗与标准化)
10. [兼容性处理策略](#10-兼容性处理策略)
11. [错误处理机制](#11-错误处理机制)
12. [安全考虑](#12-安全考虑)
13. [性能优化](#13-性能优化)
14. [测试策略](#14-测试策略)
15. [实现计划](#15-实现计划)
16. [附录](#16-附录)

---

## 1. 概述

### 1.1 背景

EPUB (Electronic Publication) 是国际数字出版论坛 (IDPF) 制定的开放电子书标准，现由 W3C 维护。EPUB 格式是 Readmigo 平台用户自定义导入电子书的首选格式，需要完整支持 EPUB2 和 EPUB3 两个主要版本。

### 1.2 设计目标

| 目标 | 描述 | 优先级 |
|------|------|--------|
| **格式兼容性** | 支持 95%+ 的 EPUB2/EPUB3 文件 | P0 |
| **元数据完整性** | 准确提取书名、作者、封面、目录 | P0 |
| **内容保真度** | 保留原书排版结构和样式 | P1 |
| **错误容错性** | 优雅处理非标准/损坏文件 | P1 |
| **处理性能** | 50MB 以下文件 30 秒内完成 | P2 |

### 1.3 系统边界

```
用户上传 EPUB → 格式验证 → 解压处理 → 元数据提取 → 章节解析 → 内容清洗 → 存储入库
```

**本文档范围**：
- EPUB 文件解析技术细节
- 元数据提取规范
- 章节内容处理
- 兼容性与容错策略

**不在本文档范围**：
- 文件上传流程（参见 `local-import.md`）
- 阅读器渲染（参见 `epub-architecture.md`）
- 用户界面设计

---

## 2. EPUB 格式规范

### 2.1 EPUB 标准版本历史

| 版本 | 发布时间 | 标准组织 | 核心特性 |
|------|---------|----------|---------|
| EPUB 2.0.1 | 2010.09 | IDPF | XHTML 1.1, CSS 2.1, NCX 目录 |
| EPUB 3.0 | 2011.10 | IDPF | HTML5, CSS3, JavaScript, Nav 目录 |
| EPUB 3.0.1 | 2014.06 | IDPF | 修复规范错误 |
| EPUB 3.1 | 2017.01 | IDPF/W3C | 移除遗留特性 |
| EPUB 3.2 | 2019.05 | W3C | 当前推荐标准 |
| EPUB 3.3 | 2023.05 | W3C | 最新标准 |

### 2.2 EPUB 文件本质

EPUB 文件本质上是一个 **ZIP 压缩包**，包含以下组件：

```
my-book.epub (ZIP Archive)
├── mimetype                    # MIME 类型声明 (必须为第一个文件，不压缩)
├── META-INF/
│   ├── container.xml           # 根文件定位器 (必需)
│   ├── encryption.xml          # DRM 加密信息 (可选)
│   ├── signatures.xml          # 数字签名 (可选)
│   └── rights.xml              # 权限信息 (可选)
└── OEBPS/ (或其他目录名)
    ├── content.opf             # 包文档 - 核心元数据和清单
    ├── toc.ncx                 # EPUB2 目录导航
    ├── nav.xhtml               # EPUB3 导航文档
    ├── cover.xhtml             # 封面页面
    ├── chapter01.xhtml         # 章节内容
    ├── chapter02.xhtml
    ├── ...
    ├── css/
    │   └── style.css           # 样式表
    └── images/
        ├── cover.jpg           # 封面图片
        └── figure01.png        # 内嵌图片
```

### 2.3 核心规范文件

| 文件 | EPUB2 | EPUB3 | 用途 |
|------|-------|-------|------|
| `mimetype` | 必需 | 必需 | 声明 MIME 类型 |
| `container.xml` | 必需 | 必需 | 指向 content.opf 位置 |
| `content.opf` | 必需 | 必需 | 包清单、元数据、书脊顺序 |
| `toc.ncx` | 必需 | 可选 | NCX 格式目录导航 |
| `nav.xhtml` | 不支持 | 必需 | XHTML 格式导航文档 |

---

## 3. EPUB2 vs EPUB3 技术差异

### 3.1 规范对比矩阵

| 特性维度 | EPUB2 | EPUB3 | 解析影响 |
|----------|-------|-------|---------|
| **内容格式** | XHTML 1.1 / DTBook | XHTML5 (HTML5 in XML) | 需要双模式 XML 解析 |
| **样式语言** | CSS 2.1 (子集) | CSS3 (完整) | 样式兼容性处理 |
| **脚本支持** | 不支持 | JavaScript (受限) | 安全过滤需求 |
| **目录格式** | NCX (XML) | NAV (XHTML) + NCX (兼容) | 双目录解析 |
| **媒体覆盖** | 不支持 | SMIL 音频同步 | 扩展功能 |
| **元数据** | Dublin Core 基础 | Dublin Core + DCTERMS | 增强提取 |
| **语义化** | 有限 | epub:type 属性 | 结构识别 |
| **文字方向** | 有限 | 完整 RTL/竖排支持 | 渲染适配 |

### 3.2 关键差异详解

#### 3.2.1 目录导航

**EPUB2 - NCX 格式 (toc.ncx)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:xxx"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>Book Title</text>
  </docTitle>
  <navMap>
    <navPoint id="ch01" playOrder="1">
      <navLabel>
        <text>Chapter 1: Introduction</text>
      </navLabel>
      <content src="chapter01.xhtml"/>
      <!-- 嵌套子章节 -->
      <navPoint id="ch01-01" playOrder="2">
        <navLabel>
          <text>1.1 Background</text>
        </navLabel>
        <content src="chapter01.xhtml#section1"/>
      </navPoint>
    </navPoint>
  </navMap>
</ncx>
```

**EPUB3 - NAV 格式 (nav.xhtml)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li>
        <a href="chapter01.xhtml">Chapter 1: Introduction</a>
        <ol>
          <li><a href="chapter01.xhtml#section1">1.1 Background</a></li>
        </ol>
      </li>
    </ol>
  </nav>

  <!-- 地标导航 (可选) -->
  <nav epub:type="landmarks">
    <h2>Guide</h2>
    <ol>
      <li><a epub:type="cover" href="cover.xhtml">Cover</a></li>
      <li><a epub:type="bodymatter" href="chapter01.xhtml">Start</a></li>
    </ol>
  </nav>
</body>
</html>
```

#### 3.2.2 元数据定义

**EPUB2 元数据 (content.opf)**

```xml
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
  <dc:title>Pride and Prejudice</dc:title>
  <dc:creator opf:role="aut" opf:file-as="Austen, Jane">Jane Austen</dc:creator>
  <dc:language>en</dc:language>
  <dc:identifier id="bookid" opf:scheme="ISBN">978-0-xxx</dc:identifier>
  <dc:date opf:event="publication">1813-01-28</dc:date>
  <dc:description>A classic novel...</dc:description>
  <dc:subject>Fiction</dc:subject>
  <dc:publisher>Publisher Name</dc:publisher>
  <meta name="cover" content="cover-image"/>
</metadata>
```

**EPUB3 元数据 (content.opf)**

```xml
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="pub-id">urn:uuid:A1B0D67E-xxx</dc:identifier>
  <dc:title id="title">Pride and Prejudice</dc:title>
  <meta refines="#title" property="title-type">main</meta>

  <dc:creator id="creator">Jane Austen</dc:creator>
  <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
  <meta refines="#creator" property="file-as">Austen, Jane</meta>

  <dc:language>en</dc:language>
  <dc:date>1813-01-28</dc:date>
  <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>

  <dc:description>A classic novel...</dc:description>
  <dc:subject>Fiction</dc:subject>

  <!-- EPUB3 封面声明方式 -->
  <meta name="cover" content="cover-image"/>
</metadata>
```

#### 3.2.3 Manifest 项目属性

**EPUB2 Manifest**

```xml
<manifest>
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg"/>
  <item id="ch01" href="chapter01.xhtml" media-type="application/xhtml+xml"/>
  <item id="css" href="css/style.css" media-type="text/css"/>
</manifest>
```

**EPUB3 Manifest (带 properties)**

```xml
<manifest>
  <!-- NAV 文档必须声明 properties="nav" -->
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>

  <!-- 封面图片使用 cover-image 属性 -->
  <item id="cover-img" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>

  <!-- NCX 可选用于向后兼容 -->
  <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>

  <!-- 数学公式内容 -->
  <item id="ch01" href="chapter01.xhtml" media-type="application/xhtml+xml" properties="mathml"/>

  <!-- SVG 内容 -->
  <item id="ch02" href="chapter02.xhtml" media-type="application/xhtml+xml" properties="svg"/>

  <!-- 脚本内容 -->
  <item id="interactive" href="interactive.xhtml" media-type="application/xhtml+xml" properties="scripted"/>
</manifest>
```

---

## 4. 文件结构详解

### 4.1 container.xml 规范

位置: `META-INF/container.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <!-- 主要 OPF 文件 -->
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>

    <!-- 可能存在多个 rendition (EPUB3 Multi-Rendition) -->
    <rootfile full-path="OEBPS-mobile/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
```

**解析要点**:
1. 必须读取第一个 `rootfile` 作为主包
2. `full-path` 是相对于 EPUB 根目录的路径
3. 需要处理不同的目录结构 (OEBPS, OPS, EPUB, 或根目录)

### 4.2 content.opf 完整结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf"
         version="3.0"
         unique-identifier="pub-id"
         prefix="rendition: http://www.idpf.org/vocab/rendition/#">

  <!-- 1. 元数据区 -->
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <!-- Dublin Core 元素 -->
    <dc:identifier id="pub-id">urn:uuid:xxx</dc:identifier>
    <dc:title>Book Title</dc:title>
    <dc:creator>Author Name</dc:creator>
    <dc:language>en</dc:language>
    <dc:description>Book description...</dc:description>
    <dc:publisher>Publisher</dc:publisher>
    <dc:date>2024-01-01</dc:date>
    <dc:subject>Fiction</dc:subject>
    <dc:rights>Public Domain</dc:rights>

    <!-- EPUB3 修改日期 (必需) -->
    <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>

    <!-- 封面声明 -->
    <meta name="cover" content="cover-image"/>

    <!-- EPUB3 精炼元数据 -->
    <meta refines="#creator" property="file-as">Name, Author</meta>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
  </metadata>

  <!-- 2. 资源清单 -->
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch01" href="chapter01.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch02" href="chapter02.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="css/style.css" media-type="text/css"/>
    <item id="font" href="fonts/serif.otf" media-type="font/otf"/>
  </manifest>

  <!-- 3. 书脊顺序 (阅读顺序) -->
  <spine toc="ncx">
    <itemref idref="cover" linear="no"/>
    <itemref idref="ch01"/>
    <itemref idref="ch02"/>
  </spine>

  <!-- 4. 导航指南 (EPUB2 遗留，EPUB3 废弃) -->
  <guide>
    <reference type="cover" title="Cover" href="cover.xhtml"/>
    <reference type="toc" title="Table of Contents" href="nav.xhtml"/>
    <reference type="text" title="Start" href="chapter01.xhtml"/>
  </guide>
</package>
```

### 4.3 常见目录结构变体

```
变体 1: Standard Ebooks 风格
├── META-INF/container.xml
├── mimetype
└── epub/
    ├── content.opf
    ├── toc.xhtml
    ├── text/
    │   ├── chapter-1.xhtml
    │   └── chapter-2.xhtml
    ├── css/
    └── images/

变体 2: Calibre 默认风格
├── META-INF/container.xml
├── mimetype
├── content.opf
├── toc.ncx
├── cover.jpeg
├── chapter1.html
└── stylesheet.css

变体 3: Sigil 默认风格
├── META-INF/container.xml
├── mimetype
└── OEBPS/
    ├── content.opf
    ├── toc.ncx
    ├── Text/
    ├── Styles/
    └── Images/

变体 4: InDesign 导出风格
├── META-INF/container.xml
├── mimetype
└── OPS/
    ├── package.opf
    ├── navigation.xhtml
    ├── content/
    └── assets/
```

---

## 5. 解析器架构设计

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EpubParser                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐          │
│  │  ZipExtractor  │   │ ContainerParser│   │   OpfParser    │          │
│  │                │──>│                │──>│                │          │
│  │  - AdmZip      │   │  - container   │   │  - metadata    │          │
│  │  - validation  │   │    .xml        │   │  - manifest    │          │
│  │  - streaming   │   │  - rootfile    │   │  - spine       │          │
│  └────────────────┘   └────────────────┘   └────────────────┘          │
│           │                                        │                    │
│           ▼                                        ▼                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐          │
│  │ MetadataExtract│   │  TocParser     │   │ ChapterParser  │          │
│  │                │   │                │   │                │          │
│  │  - DC elements │   │  - NCX (epub2) │   │  - XHTML parse │          │
│  │  - refines     │   │  - NAV (epub3) │   │  - content     │          │
│  │  - cover meta  │   │  - landmarks   │   │  - word count  │          │
│  └────────────────┘   └────────────────┘   └────────────────┘          │
│           │                   │                    │                    │
│           └───────────────────┴────────────────────┘                    │
│                               │                                         │
│                               ▼                                         │
│                     ┌────────────────┐                                  │
│                     │  CoverExtract  │                                  │
│                     │                │                                  │
│                     │  - meta cover  │                                  │
│                     │  - properties  │                                  │
│                     │  - fallback    │                                  │
│                     └────────────────┘                                  │
│                               │                                         │
│                               ▼                                         │
│                     ┌────────────────┐                                  │
│                     │   ParsedBook   │                                  │
│                     └────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 核心接口定义

```typescript
// 文件位置: scripts/book-ingestion/processors/epub-parser.ts

/**
 * 解析后的章节数据
 */
export interface ParsedChapter {
  /** 章节标题 */
  title: string;
  /** 章节顺序索引 (从 0 开始) */
  orderIndex: number;
  /** 章节内容 (纯文本，用于词数统计) */
  content: string;
  /** 章节 HTML 内容 (用于渲染) */
  htmlContent: string;
  /** 词数统计 */
  wordCount: number;
  /** 原始 href 引用 */
  href: string;
  /** 是否为主体内容 (区别于前言、附录等) */
  isBodyMatter?: boolean;
}

/**
 * 解析后的书籍数据
 */
export interface ParsedBook {
  /** 书名 */
  title: string;
  /** 作者 */
  author: string;
  /** 书籍描述 */
  description?: string;
  /** 语言代码 (ISO 639-1) */
  language: string;
  /** 出版年份 */
  publishedYear?: number;
  /** 章节列表 */
  chapters: ParsedChapter[];
  /** 封面图片数据 */
  coverImage?: Buffer;
  /** 封面 MIME 类型 */
  coverMimeType?: string;
  /** 总词数 */
  totalWordCount: number;
  /** EPUB 版本 (2 或 3) */
  epubVersion: 2 | 3;
  /** 主题/分类 */
  subjects?: string[];
  /** 出版商 */
  publisher?: string;
  /** ISBN */
  isbn?: string;
  /** 目录结构 (支持嵌套) */
  tableOfContents?: TocItem[];
}

/**
 * 目录项
 */
export interface TocItem {
  title: string;
  href: string;
  children?: TocItem[];
}

/**
 * EPUB 元数据
 */
export interface EpubMetadata {
  title: string;
  creator: string;
  description?: string;
  language: string;
  date?: string;
  subject?: string[];
  publisher?: string;
  identifier?: string;
  rights?: string;
}
```

### 5.3 版本检测逻辑

```typescript
class EpubParser {
  /**
   * 检测 EPUB 版本
   * @param opfContent content.opf 文件内容
   * @returns EPUB 版本号
   */
  private detectVersion(opfContent: string): 2 | 3 {
    // 方法 1: 检查 package 元素的 version 属性
    const versionMatch = opfContent.match(/version=["'](\d+\.\d+)["']/);
    if (versionMatch) {
      const version = parseFloat(versionMatch[1]);
      return version >= 3.0 ? 3 : 2;
    }

    // 方法 2: 检查命名空间
    if (opfContent.includes('http://www.idpf.org/2007/opf')) {
      // 检查是否有 EPUB3 特有元素
      if (opfContent.includes('properties="nav"') ||
          opfContent.includes('dcterms:modified')) {
        return 3;
      }
    }

    // 方法 3: 检查是否存在 nav.xhtml
    const hasNavXhtml = this.zip.getEntries().some(entry =>
      entry.entryName.endsWith('nav.xhtml') ||
      entry.entryName.endsWith('nav.html')
    );

    if (hasNavXhtml) {
      return 3;
    }

    // 默认为 EPUB2
    return 2;
  }
}
```

### 5.4 解析流程状态机

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          解析状态机                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [初始化]                                                               │
│      │                                                                   │
│      ▼                                                                   │
│   ┌───────────────┐                                                      │
│   │ VALIDATING    │──── 验证失败 ────> [ERROR: Invalid EPUB]            │
│   │ - mimetype    │                                                      │
│   │ - container   │                                                      │
│   └───────┬───────┘                                                      │
│           │ 验证通过                                                     │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ LOADING_OPF   │──── 加载失败 ────> [ERROR: Missing OPF]             │
│   │ - find opf    │                                                      │
│   │ - parse xml   │                                                      │
│   └───────┬───────┘                                                      │
│           │ 加载成功                                                     │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ PARSING_META  │──── 元数据不完整 ──> [WARN: 使用默认值]             │
│   │ - metadata    │                                                      │
│   │ - version     │                                                      │
│   └───────┬───────┘                                                      │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ BUILDING_TOC  │──── NCX/NAV 缺失 ──> [WARN: 使用 spine 顺序]        │
│   │ - ncx parse   │                                                      │
│   │ - nav parse   │                                                      │
│   └───────┬───────┘                                                      │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ LOADING_CHAPS │──── 部分章节失败 ──> [WARN: 跳过损坏章节]           │
│   │ - spine iter  │                                                      │
│   │ - content     │                                                      │
│   └───────┬───────┘                                                      │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ EXTRACT_COVER │──── 封面未找到 ──> [INFO: 生成默认封面]             │
│   │ - meta cover  │                                                      │
│   │ - properties  │                                                      │
│   │ - fallback    │                                                      │
│   └───────┬───────┘                                                      │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────┐                                                      │
│   │ COMPLETED     │                                                      │
│   └───────────────┘                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 元数据提取规范

### 6.1 元数据优先级策略

不同来源的元数据可能存在冲突，按以下优先级处理：

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 (最高) | EPUB3 refines | 精确定义的元数据 |
| 2 | Dublin Core 元素 | 标准元数据元素 |
| 3 | OPF meta 元素 | 扩展元数据 |
| 4 | 文件名推断 | 从文件名提取 |
| 5 (最低) | 默认值 | "Unknown Title" 等 |

### 6.2 元数据提取算法

```typescript
class MetadataExtractor {
  /**
   * 提取书名
   * 处理多标题情况 (主标题、副标题、系列名)
   */
  extractTitle(metadata: any): string {
    const titles = metadata['dc:title'];

    if (!titles) {
      return 'Unknown Title';
    }

    // 单一标题
    if (typeof titles === 'string') {
      return titles;
    }

    // 数组形式
    if (Array.isArray(titles)) {
      // EPUB3: 查找 title-type="main" 的标题
      const mainTitle = titles.find((t: any) => {
        const refines = this.findRefines(t, 'title-type');
        return refines === 'main';
      });

      if (mainTitle) {
        return this.extractTextContent(mainTitle);
      }

      // 返回第一个标题
      return this.extractTextContent(titles[0]);
    }

    return this.extractTextContent(titles);
  }

  /**
   * 提取作者
   * 处理多作者、角色区分 (作者、编辑、译者)
   */
  extractCreator(metadata: any): string {
    const creators = metadata['dc:creator'];

    if (!creators) {
      return 'Unknown Author';
    }

    const creatorList = Array.isArray(creators) ? creators : [creators];

    // 过滤出作者角色 (aut)
    const authors = creatorList.filter((c: any) => {
      // EPUB2: opf:role 属性
      if (c.$?.['opf:role'] === 'aut') return true;

      // EPUB3: refines 机制
      const role = this.findRefines(c, 'role');
      return !role || role === 'aut';
    });

    if (authors.length === 0) {
      // 如果没有明确的作者，使用第一个创建者
      return this.extractTextContent(creatorList[0]);
    }

    // 多作者用逗号分隔
    return authors
      .map(a => this.extractTextContent(a))
      .join(', ');
  }

  /**
   * 提取语言代码
   * 标准化为 ISO 639-1 格式
   */
  extractLanguage(metadata: any): string {
    const lang = metadata['dc:language'];

    if (!lang) {
      return 'en';
    }

    const langCode = this.extractTextContent(lang);

    // 标准化语言代码
    const languageMap: Record<string, string> = {
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en',
      'eng': 'en',
      'zh': 'zh',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
      'zho': 'zh',
      'chi': 'zh',
      'ja': 'ja',
      'jpn': 'ja',
      'ko': 'ko',
      'kor': 'ko',
    };

    return languageMap[langCode] || langCode.split('-')[0] || 'en';
  }

  /**
   * 提取出版日期并转换为年份
   */
  extractPublishedYear(metadata: any): number | undefined {
    const date = metadata['dc:date'];

    if (!date) {
      return undefined;
    }

    const dateStr = this.extractTextContent(date);

    // 尝试多种日期格式
    const patterns = [
      /^(\d{4})/,                    // 2024
      /^(\d{4})-\d{2}-\d{2}/,        // 2024-01-15
      /^(\d{4})\/\d{2}\/\d{2}/,      // 2024/01/15
      /(\d{4})$/,                     // ...1813
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        const year = parseInt(match[1], 10);
        if (year > 0 && year <= new Date().getFullYear() + 1) {
          return year;
        }
      }
    }

    return undefined;
  }

  /**
   * 辅助方法：查找 EPUB3 refines 属性
   */
  private findRefines(element: any, property: string): string | undefined {
    const id = element.$?.id || element.id;
    if (!id) return undefined;

    const meta = this.metadata.meta?.find((m: any) =>
      m.$?.refines === `#${id}` && m.$?.property === property
    );

    return meta?._ || meta;
  }

  /**
   * 辅助方法：提取元素文本内容
   */
  private extractTextContent(element: any): string {
    if (typeof element === 'string') {
      return element.trim();
    }
    return (element?._ || element?.['#text'] || element || '').toString().trim();
  }
}
```

### 6.3 主题/分类提取

```typescript
/**
 * 提取书籍主题和分类
 * 处理 BISAC, LCSH, 自定义分类等
 */
extractSubjects(metadata: any): string[] {
  const subjects = metadata['dc:subject'];

  if (!subjects) {
    return [];
  }

  const subjectList = Array.isArray(subjects) ? subjects : [subjects];

  return subjectList
    .map(s => this.extractTextContent(s))
    .filter(s => s.length > 0)
    // 去重
    .filter((s, i, arr) => arr.indexOf(s) === i)
    // 标准化分类名称
    .map(s => this.normalizeSubject(s));
}

/**
 * 标准化分类名称
 */
private normalizeSubject(subject: string): string {
  // 常见 BISAC 代码映射
  const bisacMap: Record<string, string> = {
    'FIC000000': 'Fiction',
    'FIC019000': 'Literary Fiction',
    'FIC028000': 'Romance',
    'FIC009000': 'Fantasy',
    'FIC028010': 'Science Fiction',
    'NON000000': 'Nonfiction',
    'BIO000000': 'Biography',
    'HIS000000': 'History',
  };

  if (bisacMap[subject]) {
    return bisacMap[subject];
  }

  // 移除 LCSH 前缀
  subject = subject.replace(/^lcsh:/i, '');

  // 首字母大写
  return subject
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

---

## 7. 章节解析策略

### 7.1 章节顺序确定

EPUB 的阅读顺序由 `<spine>` 元素定义：

```typescript
class ChapterParser {
  /**
   * 按 spine 顺序解析章节
   */
  async parseChaptersBySpine(): Promise<ParsedChapter[]> {
    const opf = await this.parseOpf();
    const manifest = this.buildManifest(opf);
    const spine = opf.package?.spine?.[0];

    if (!spine?.itemref) {
      throw new Error('Invalid EPUB: missing spine');
    }

    const chapters: ParsedChapter[] = [];
    let orderIndex = 0;

    for (const itemref of spine.itemref) {
      const idref = itemref.$?.idref;
      const linear = itemref.$?.linear !== 'no'; // 默认为 yes

      // 跳过非线性内容 (如封面页)
      if (!linear) {
        continue;
      }

      const manifestItem = manifest[idref];
      if (!manifestItem) {
        console.warn(`Spine references unknown item: ${idref}`);
        continue;
      }

      // 只处理 HTML 内容
      if (!manifestItem.mediaType.includes('html')) {
        continue;
      }

      try {
        const chapter = await this.parseChapter(manifestItem, orderIndex);

        // 跳过过短的章节 (可能是空白页或版权页)
        if (chapter.wordCount >= 50) {
          chapters.push(chapter);
          orderIndex++;
        }
      } catch (error) {
        console.warn(`Failed to parse chapter ${manifestItem.href}:`, error);
      }
    }

    return chapters;
  }
}
```

### 7.2 章节标题提取算法

```typescript
/**
 * 从 HTML 内容提取章节标题
 * 优先级: <title> < <h1> < <h2> < NCX/NAV 标题
 */
extractChapterTitle(
  html: string,
  href: string,
  tocTitles: Map<string, string>
): string {
  // 1. 首先查找 NCX/NAV 中的标题 (最可靠)
  const normalizedHref = this.normalizeHref(href);
  if (tocTitles.has(normalizedHref)) {
    return tocTitles.get(normalizedHref)!;
  }

  // 去掉锚点后再查找
  const hrefWithoutAnchor = normalizedHref.split('#')[0];
  if (tocTitles.has(hrefWithoutAnchor)) {
    return tocTitles.get(hrefWithoutAnchor)!;
  }

  // 2. 从 HTML 内容提取
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 尝试 H1
  const h1 = doc.querySelector('h1');
  if (h1?.textContent?.trim()) {
    return this.cleanTitle(h1.textContent);
  }

  // 尝试 H2
  const h2 = doc.querySelector('h2');
  if (h2?.textContent?.trim()) {
    return this.cleanTitle(h2.textContent);
  }

  // 尝试 EPUB3 语义化元素
  const chapterTitle = doc.querySelector('[epub\\:type="title"], .chapter-title');
  if (chapterTitle?.textContent?.trim()) {
    return this.cleanTitle(chapterTitle.textContent);
  }

  // 尝试 <title> 标签
  const title = doc.querySelector('title');
  if (title?.textContent?.trim()) {
    const titleText = this.cleanTitle(title.textContent);
    // 过滤掉可能是书名的标题
    if (!this.isProbablyBookTitle(titleText)) {
      return titleText;
    }
  }

  // 3. 从文件名推断
  const filename = href.split('/').pop()?.replace(/\.(x?html?|xml)$/i, '') || '';
  return this.humanizeFilename(filename);
}

/**
 * 清理标题文本
 */
private cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')           // 合并空白
    .replace(/^\d+\.\s*/, '')       // 移除开头数字编号
    .replace(/^Chapter\s+\d+:?\s*/i, '') // 移除 "Chapter X"
    .replace(/^第.+[章节卷]\s*/, '') // 移除中文章节前缀
    .trim();
}

/**
 * 将文件名转换为可读标题
 */
private humanizeFilename(filename: string): string {
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/chapter(\d+)/i, 'Chapter $1')
    .replace(/\b\w/g, c => c.toUpperCase());
}
```

### 7.3 章节内容处理

```typescript
/**
 * 解析单个章节
 */
async parseChapter(
  manifestItem: ManifestItem,
  orderIndex: number
): Promise<ParsedChapter> {
  const chapterPath = this.resolvePath(manifestItem.href);
  const chapterEntry = this.zip.getEntry(chapterPath);

  if (!chapterEntry) {
    throw new Error(`Chapter file not found: ${chapterPath}`);
  }

  const html = chapterEntry.getData().toString('utf-8');

  // 解析 HTML
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // 提取标题
  const title = this.extractChapterTitle(html, manifestItem.href, this.tocTitles);

  // 清理内容
  const cleanedHtml = this.cleanChapterContent(doc);

  // 提取纯文本用于词数统计
  const textContent = this.extractTextContent(doc);

  return {
    title,
    orderIndex,
    content: textContent,
    htmlContent: cleanedHtml,
    wordCount: this.countWords(textContent),
    href: manifestItem.href,
    isBodyMatter: this.isBodyMatter(manifestItem.href, manifestItem.properties),
  };
}

/**
 * 清理章节 HTML 内容
 */
cleanChapterContent(doc: Document): string {
  const body = doc.querySelector('body');
  if (!body) {
    return '';
  }

  // 移除不需要的元素
  const removeSelectors = [
    'script',                  // 脚本
    'style',                   // 内联样式
    'noscript',                // 无脚本内容
    'iframe',                  // 内嵌框架
    'object',                  // 对象
    'embed',                   // 嵌入内容
    'nav',                     // 导航
    '.pagebreak',              // 分页标记
    '.chapter-nav',            // 章节导航
    '[epub\\:type="pagebreak"]', // EPUB3 分页
  ];

  for (const selector of removeSelectors) {
    const elements = body.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  }

  // 处理图片路径
  const images = body.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      // 转换为相对于章节的路径
      img.setAttribute('data-original-src', src);
    }
  });

  // 获取清理后的 HTML
  let html = body.innerHTML;

  // 清理过多空白
  html = html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  return html;
}

/**
 * 判断是否为正文内容
 */
isBodyMatter(href: string, properties?: string): boolean {
  // 检查 EPUB3 属性
  if (properties) {
    if (properties.includes('bodymatter')) return true;
    if (properties.includes('frontmatter') || properties.includes('backmatter')) return false;
  }

  // 根据文件名推断
  const filename = href.toLowerCase();
  const frontMatterPatterns = [
    'cover', 'title', 'copyright', 'dedication', 'epigraph',
    'foreword', 'preface', 'introduction', 'prologue', 'halftitle',
    'front', 'about'
  ];
  const backMatterPatterns = [
    'appendix', 'afterword', 'epilogue', 'bibliography', 'glossary',
    'index', 'colophon', 'back', 'endnotes', 'footnotes'
  ];

  for (const pattern of frontMatterPatterns) {
    if (filename.includes(pattern)) return false;
  }
  for (const pattern of backMatterPatterns) {
    if (filename.includes(pattern)) return false;
  }

  return true;
}
```

### 7.4 词数统计

```typescript
/**
 * 统计词数
 * 支持英文和中文混合内容
 */
countWords(text: string): number {
  // 检测语言
  const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
  const hasSignificantChinese = chineseChars.length > text.length * 0.1;

  if (hasSignificantChinese) {
    // 中文: 按字符计数
    // 英文单词仍按单词计数
    const chineseCount = chineseChars.length;
    const nonChineseText = text.replace(/[\u4e00-\u9fff]/g, ' ');
    const englishWords = nonChineseText.split(/\s+/).filter(w => w.length > 0);
    return chineseCount + englishWords.length;
  } else {
    // 英文: 按空格分词
    return text
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }
}
```

---

## 8. 封面提取算法

### 8.1 封面识别策略

EPUB 封面的声明方式多种多样，需要多重策略：

```typescript
class CoverExtractor {
  /**
   * 提取封面图片
   * 按优先级尝试多种方法
   */
  async extractCover(): Promise<{buffer: Buffer; mimeType: string} | null> {
    // 策略 1: EPUB3 manifest properties="cover-image"
    const coverByProperties = await this.findCoverByProperties();
    if (coverByProperties) return coverByProperties;

    // 策略 2: EPUB2/3 metadata <meta name="cover">
    const coverByMeta = await this.findCoverByMeta();
    if (coverByMeta) return coverByMeta;

    // 策略 3: manifest 中 id 包含 "cover" 的图片
    const coverById = await this.findCoverById();
    if (coverById) return coverById;

    // 策略 4: 文件名包含 "cover" 的图片
    const coverByFilename = await this.findCoverByFilename();
    if (coverByFilename) return coverByFilename;

    // 策略 5: spine 第一项如果是封面页，提取其中的图片
    const coverFromFirstPage = await this.findCoverFromFirstPage();
    if (coverFromFirstPage) return coverFromFirstPage;

    // 策略 6: 所有图片中尺寸最大的 (启发式方法)
    const coverBySize = await this.findLargestImage();
    if (coverBySize) return coverBySize;

    return null;
  }

  /**
   * 策略 1: EPUB3 cover-image 属性
   */
  private async findCoverByProperties(): Promise<CoverResult | null> {
    const manifest = this.opf.package?.manifest?.[0]?.item || [];

    for (const item of manifest) {
      const properties = item.$?.properties;
      if (properties?.includes('cover-image')) {
        return this.loadImage(item.$?.href, item.$?.['media-type']);
      }
    }

    return null;
  }

  /**
   * 策略 2: metadata cover meta
   */
  private async findCoverByMeta(): Promise<CoverResult | null> {
    const metadata = this.opf.package?.metadata?.[0];
    const metas = metadata?.meta || [];

    // 查找 <meta name="cover" content="cover-id"/>
    const coverMeta = metas.find((m: any) =>
      m.$?.name === 'cover' ||
      m.$?.property === 'cover-image'
    );

    if (!coverMeta) return null;

    const coverId = coverMeta.$?.content || coverMeta._;
    if (!coverId) return null;

    // 在 manifest 中查找对应 id
    const manifest = this.opf.package?.manifest?.[0]?.item || [];
    const coverItem = manifest.find((item: any) => item.$?.id === coverId);

    if (coverItem) {
      return this.loadImage(coverItem.$?.href, coverItem.$?.['media-type']);
    }

    return null;
  }

  /**
   * 策略 3: id 包含 cover 的 manifest item
   */
  private async findCoverById(): Promise<CoverResult | null> {
    const manifest = this.opf.package?.manifest?.[0]?.item || [];

    const coverPatterns = [
      /^cover$/i,
      /^cover[-_]?image$/i,
      /^coverimage$/i,
      /^img-cover$/i,
    ];

    for (const item of manifest) {
      const id = item.$?.id || '';
      const mediaType = item.$?.['media-type'] || '';

      if (!mediaType.startsWith('image/')) continue;

      for (const pattern of coverPatterns) {
        if (pattern.test(id)) {
          return this.loadImage(item.$?.href, mediaType);
        }
      }
    }

    return null;
  }

  /**
   * 策略 4: 文件名包含 cover
   */
  private async findCoverByFilename(): Promise<CoverResult | null> {
    const manifest = this.opf.package?.manifest?.[0]?.item || [];

    for (const item of manifest) {
      const href = item.$?.href || '';
      const mediaType = item.$?.['media-type'] || '';

      if (!mediaType.startsWith('image/')) continue;

      const filename = href.split('/').pop()?.toLowerCase() || '';
      if (filename.includes('cover')) {
        return this.loadImage(href, mediaType);
      }
    }

    return null;
  }

  /**
   * 策略 5: 从第一个页面提取图片
   */
  private async findCoverFromFirstPage(): Promise<CoverResult | null> {
    const spine = this.opf.package?.spine?.[0];
    if (!spine?.itemref?.[0]) return null;

    const firstItemId = spine.itemref[0].$?.idref;
    const manifest = this.opf.package?.manifest?.[0]?.item || [];

    const firstItem = manifest.find((i: any) => i.$?.id === firstItemId);
    if (!firstItem) return null;

    const href = firstItem.$?.href;
    if (!href) return null;

    // 检查是否看起来像封面页
    const filename = href.toLowerCase();
    if (!filename.includes('cover') && !filename.includes('title')) {
      return null;
    }

    // 加载页面并提取图片
    const pagePath = this.resolvePath(href);
    const pageEntry = this.zip.getEntry(pagePath);
    if (!pageEntry) return null;

    const html = pageEntry.getData().toString('utf-8');
    const dom = new JSDOM(html);
    const img = dom.window.document.querySelector('img');

    if (img) {
      const imgSrc = img.getAttribute('src');
      if (imgSrc) {
        const imgPath = this.resolvePath(imgSrc, href);
        const imgEntry = this.zip.getEntry(imgPath);
        if (imgEntry) {
          return {
            buffer: imgEntry.getData(),
            mimeType: this.getMimeType(imgSrc),
          };
        }
      }
    }

    return null;
  }

  /**
   * 加载图片数据
   */
  private async loadImage(href: string, mediaType: string): Promise<CoverResult | null> {
    const imagePath = this.resolvePath(href);
    const imageEntry = this.zip.getEntry(imagePath);

    if (!imageEntry) return null;

    return {
      buffer: imageEntry.getData(),
      mimeType: mediaType || this.getMimeType(href),
    };
  }

  /**
   * 从文件扩展名推断 MIME 类型
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return mimeMap[ext || ''] || 'image/jpeg';
  }
}
```

### 8.2 封面图片处理

```typescript
/**
 * 处理封面图片
 * - 验证图片格式
 * - 生成缩略图
 * - 上传到存储
 */
async processCover(
  coverData: {buffer: Buffer; mimeType: string},
  bookId: string
): Promise<{coverUrl: string; coverThumbUrl: string}> {
  const sharp = await import('sharp');

  // 验证图片
  const metadata = await sharp.default(coverData.buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image data');
  }

  // 处理原图 (限制最大尺寸)
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 1800;

  let coverBuffer = coverData.buffer;
  let coverMimeType = coverData.mimeType;

  if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
    coverBuffer = await sharp.default(coverData.buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();
    coverMimeType = 'image/jpeg';
  }

  // 生成缩略图
  const thumbBuffer = await sharp.default(coverData.buffer)
    .resize(300, 450, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 上传到 R2
  const coverKey = `books/${bookId}/cover.${this.getExtension(coverMimeType)}`;
  const thumbKey = `books/${bookId}/cover_thumb.jpg`;

  await Promise.all([
    this.storage.put(coverKey, coverBuffer, coverMimeType),
    this.storage.put(thumbKey, thumbBuffer, 'image/jpeg'),
  ]);

  return {
    coverUrl: this.storage.getPublicUrl(coverKey),
    coverThumbUrl: this.storage.getPublicUrl(thumbKey),
  };
}
```

---

## 9. 内容清洗与标准化

### 9.1 HTML 清洗规则

```typescript
class ContentCleaner {
  /**
   * 清洗章节 HTML 内容
   */
  clean(html: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // 1. 移除危险元素
    this.removeDangerousElements(doc);

    // 2. 清理属性
    this.cleanAttributes(doc);

    // 3. 标准化结构
    this.normalizeStructure(doc);

    // 4. 处理图片
    this.processImages(doc);

    // 5. 清理空白
    return this.cleanWhitespace(doc.body?.innerHTML || '');
  }

  /**
   * 移除危险元素
   */
  private removeDangerousElements(doc: Document): void {
    const dangerousTags = [
      'script', 'style', 'link', 'meta', 'base',
      'iframe', 'frame', 'frameset',
      'object', 'embed', 'applet',
      'form', 'input', 'button', 'select', 'textarea',
      'noscript',
    ];

    for (const tag of dangerousTags) {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    }
  }

  /**
   * 清理危险属性
   */
  private cleanAttributes(doc: Document): void {
    const allElements = doc.querySelectorAll('*');

    // 危险属性黑名单
    const dangerousAttrs = [
      'onclick', 'onload', 'onerror', 'onmouseover',
      'onmouseout', 'onfocus', 'onblur', 'onsubmit',
      'onkeydown', 'onkeyup', 'onkeypress',
      'javascript:',
    ];

    // 允许的属性白名单
    const allowedAttrs = [
      'id', 'class', 'style', 'lang', 'dir',
      'href', 'src', 'alt', 'title',
      'epub:type', 'role', 'aria-label',
      'colspan', 'rowspan', 'scope',
      'data-original-src',
    ];

    allElements.forEach(el => {
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        const value = attr.value.toLowerCase();

        // 检查黑名单
        if (dangerousAttrs.some(d => name.startsWith(d) || value.includes(d))) {
          el.removeAttribute(attr.name);
          continue;
        }

        // 检查白名单
        if (!allowedAttrs.includes(name) && !name.startsWith('data-')) {
          el.removeAttribute(attr.name);
        }
      }
    });

    // 清理 style 属性中的危险内容
    const elementsWithStyle = doc.querySelectorAll('[style]');
    elementsWithStyle.forEach(el => {
      let style = el.getAttribute('style') || '';
      // 移除 expression(), url() (除了 background-image), javascript:
      style = style.replace(/expression\s*\([^)]*\)/gi, '');
      style = style.replace(/javascript:[^;"]*/gi, '');
      el.setAttribute('style', style);
    });
  }

  /**
   * 标准化结构
   */
  private normalizeStructure(doc: Document): void {
    // 将 <b> 转换为 <strong>
    doc.querySelectorAll('b').forEach(el => {
      const strong = doc.createElement('strong');
      strong.innerHTML = el.innerHTML;
      el.replaceWith(strong);
    });

    // 将 <i> 转换为 <em>
    doc.querySelectorAll('i').forEach(el => {
      const em = doc.createElement('em');
      em.innerHTML = el.innerHTML;
      el.replaceWith(em);
    });

    // 移除空段落
    doc.querySelectorAll('p, div, span').forEach(el => {
      if (!el.textContent?.trim() && !el.querySelector('img, svg')) {
        el.remove();
      }
    });
  }

  /**
   * 处理图片
   */
  private processImages(doc: Document): void {
    doc.querySelectorAll('img').forEach(img => {
      // 添加 loading="lazy"
      img.setAttribute('loading', 'lazy');

      // 确保有 alt 属性
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', '');
      }

      // 记录原始 src
      const src = img.getAttribute('src');
      if (src) {
        img.setAttribute('data-original-src', src);
      }
    });
  }

  /**
   * 清理空白
   */
  private cleanWhitespace(html: string): string {
    return html
      .replace(/[\t\r\n]+/g, ' ')     // 替换制表符和换行
      .replace(/\s{2,}/g, ' ')        // 合并多个空格
      .replace(/>\s+</g, '><')        // 移除标签间空白
      .replace(/^\s+|\s+$/g, '')      // 去除首尾空白
      .trim();
  }
}
```

### 9.2 CSS 处理

```typescript
class StyleProcessor {
  /**
   * 处理内嵌样式
   * 保留安全的排版样式
   */
  processInlineStyle(style: string): string {
    // 允许的 CSS 属性
    const allowedProperties = [
      // 文本样式
      'font-family', 'font-size', 'font-weight', 'font-style',
      'text-align', 'text-indent', 'text-decoration',
      'line-height', 'letter-spacing', 'word-spacing',
      'color', 'background-color',

      // 边距和间距
      'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
      'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',

      // 边框
      'border', 'border-width', 'border-style', 'border-color',

      // 显示
      'display', 'visibility',

      // 列表
      'list-style', 'list-style-type',

      // 尺寸
      'width', 'max-width', 'height', 'max-height',
    ];

    const properties = style.split(';');
    const cleanedProps: string[] = [];

    for (const prop of properties) {
      const [name, value] = prop.split(':').map(s => s.trim());
      if (name && value && allowedProperties.includes(name.toLowerCase())) {
        cleanedProps.push(`${name}: ${value}`);
      }
    }

    return cleanedProps.join('; ');
  }
}
```

---

## 10. 兼容性处理策略

### 10.1 常见问题处理矩阵

| 问题类型 | 检测方法 | 处理策略 |
|---------|---------|---------|
| 缺少 mimetype | 检查文件存在性 | 忽略，继续解析 |
| 无效 XML | 解析异常 | 尝试 HTML5 解析器 |
| 编码错误 | 乱码检测 | 尝试多种编码 |
| 相对路径错误 | 文件不存在 | 尝试多种路径组合 |
| 缺少 NCX/NAV | 文件不存在 | 使用 spine 顺序 |
| 元数据不完整 | 字段为空 | 使用默认值/推断 |
| 损坏的图片 | 解析异常 | 跳过图片 |
| 不支持的媒体 | 未知 MIME | 忽略资源 |

### 10.2 编码处理

```typescript
class EncodingHandler {
  /**
   * 检测并转换编码
   */
  detectAndDecode(buffer: Buffer): string {
    // 检查 BOM
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return buffer.slice(3).toString('utf-8');
    }
    if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
      return buffer.slice(2).toString('utf16be');
    }
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      return buffer.slice(2).toString('utf16le');
    }

    // 尝试 UTF-8
    try {
      const utf8 = buffer.toString('utf-8');
      // 检查是否有无效字符
      if (!utf8.includes('\uFFFD')) {
        return utf8;
      }
    } catch (e) {}

    // 尝试其他编码
    const encodings = ['latin1', 'cp1252', 'gb2312', 'gbk', 'big5'];
    for (const encoding of encodings) {
      try {
        const iconv = require('iconv-lite');
        const decoded = iconv.decode(buffer, encoding);
        // 简单的有效性检查
        if (!decoded.includes('\uFFFD') && decoded.length > 0) {
          return decoded;
        }
      } catch (e) {}
    }

    // 最后回退
    return buffer.toString('utf-8');
  }
}
```

### 10.3 路径解析容错

```typescript
class PathResolver {
  /**
   * 解析相对路径（带容错）
   */
  resolvePath(href: string, basePath?: string): string {
    // 移除 URL 编码
    href = decodeURIComponent(href);

    // 移除锚点
    href = href.split('#')[0];

    // 标准化路径分隔符
    href = href.replace(/\\/g, '/');

    // 如果是绝对路径
    if (href.startsWith('/')) {
      href = href.slice(1);
    }

    // 组合路径
    let fullPath: string;
    if (basePath) {
      const baseDir = path.dirname(basePath);
      fullPath = path.join(baseDir, href).replace(/\\/g, '/');
    } else if (this.basePath) {
      fullPath = path.join(this.basePath, href).replace(/\\/g, '/');
    } else {
      fullPath = href;
    }

    // 尝试查找文件
    if (this.zip.getEntry(fullPath)) {
      return fullPath;
    }

    // 容错：尝试不同的路径变体
    const variants = [
      fullPath,
      fullPath.toLowerCase(),
      fullPath.toUpperCase(),
      href,
      href.toLowerCase(),
      `OEBPS/${href}`,
      `OPS/${href}`,
      `epub/${href}`,
    ];

    for (const variant of variants) {
      if (this.zip.getEntry(variant)) {
        return variant;
      }
    }

    // 尝试模糊匹配
    const entries = this.zip.getEntries();
    const hrefBase = path.basename(href).toLowerCase();

    for (const entry of entries) {
      if (path.basename(entry.entryName).toLowerCase() === hrefBase) {
        return entry.entryName;
      }
    }

    return fullPath;
  }
}
```

### 10.4 XML 解析容错

```typescript
class XmlParser {
  /**
   * 解析 XML（带容错）
   */
  async parseXml(content: string): Promise<any> {
    // 1. 首先尝试标准 XML 解析
    try {
      return await parseStringPromise(content, {
        explicitArray: false,
        mergeAttrs: false,
        attrkey: '$',
        charkey: '_',
      });
    } catch (e) {}

    // 2. 清理常见问题后重试
    const cleaned = this.cleanXml(content);
    try {
      return await parseStringPromise(cleaned, {
        explicitArray: false,
        mergeAttrs: false,
        attrkey: '$',
        charkey: '_',
      });
    } catch (e) {}

    // 3. 使用宽松的 HTML5 解析器
    try {
      const dom = new JSDOM(content, { contentType: 'text/xml' });
      return this.domToObject(dom.window.document);
    } catch (e) {}

    // 4. 最后尝试 HTML 解析
    const dom = new JSDOM(content);
    return this.domToObject(dom.window.document);
  }

  /**
   * 清理常见的 XML 问题
   */
  private cleanXml(content: string): string {
    return content
      // 移除 BOM
      .replace(/^\uFEFF/, '')
      // 修复未转义的 &
      .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/gi, '&amp;')
      // 移除无效字符
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      // 修复自闭合标签
      .replace(/<(br|hr|img|meta|link)([^>]*[^/])>/gi, '<$1$2/>');
  }
}
```

---

## 11. 错误处理机制

### 11.1 错误分类

```typescript
enum EpubErrorCode {
  // 致命错误 (无法继续)
  INVALID_ZIP = 'INVALID_ZIP',
  MISSING_CONTAINER = 'MISSING_CONTAINER',
  MISSING_OPF = 'MISSING_OPF',
  INVALID_OPF = 'INVALID_OPF',
  NO_READABLE_CONTENT = 'NO_READABLE_CONTENT',

  // 严重错误 (降级处理)
  MISSING_METADATA = 'MISSING_METADATA',
  MISSING_TOC = 'MISSING_TOC',
  CORRUPT_CHAPTERS = 'CORRUPT_CHAPTERS',

  // 警告 (记录但继续)
  MISSING_COVER = 'MISSING_COVER',
  INVALID_ENCODING = 'INVALID_ENCODING',
  BROKEN_LINKS = 'BROKEN_LINKS',
  UNSUPPORTED_FEATURES = 'UNSUPPORTED_FEATURES',
}

interface EpubError {
  code: EpubErrorCode;
  message: string;
  details?: any;
  recoverable: boolean;
}

class EpubParseException extends Error {
  constructor(
    public readonly code: EpubErrorCode,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'EpubParseException';
  }
}
```

### 11.2 错误处理流程

```typescript
class EpubParser {
  private errors: EpubError[] = [];
  private warnings: EpubError[] = [];

  async parse(epubPath: string): Promise<ParsedBook> {
    try {
      // 1. 加载 ZIP
      this.zip = new AdmZip(epubPath);
    } catch (e) {
      throw new EpubParseException(
        EpubErrorCode.INVALID_ZIP,
        '无法打开EPUB文件，文件可能已损坏',
        { originalError: e }
      );
    }

    // 2. 查找 container.xml
    try {
      await this.findContentOpf();
    } catch (e) {
      throw new EpubParseException(
        EpubErrorCode.MISSING_CONTAINER,
        'EPUB结构无效，缺少必要的容器文件',
      );
    }

    // 3. 解析元数据 (可降级)
    let metadata: EpubMetadata;
    try {
      metadata = await this.parseMetadata();
    } catch (e) {
      this.addWarning(EpubErrorCode.MISSING_METADATA, '元数据解析失败，使用默认值');
      metadata = this.getDefaultMetadata();
    }

    // 4. 解析章节
    const chapters = await this.parseChapters();
    if (chapters.length === 0) {
      throw new EpubParseException(
        EpubErrorCode.NO_READABLE_CONTENT,
        '未找到可阅读的内容',
      );
    }

    // 5. 提取封面 (可降级)
    let cover: {buffer: Buffer; mimeType: string} | null = null;
    try {
      cover = await this.extractCover();
    } catch (e) {
      this.addWarning(EpubErrorCode.MISSING_COVER, '封面提取失败');
    }

    return {
      ...metadata,
      chapters,
      coverImage: cover?.buffer,
      coverMimeType: cover?.mimeType,
      totalWordCount: chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      parseErrors: this.errors,
      parseWarnings: this.warnings,
    };
  }

  private addWarning(code: EpubErrorCode, message: string): void {
    this.warnings.push({
      code,
      message,
      recoverable: true,
    });
  }
}
```

### 11.3 用户友好错误消息

```typescript
const ERROR_MESSAGES: Record<EpubErrorCode, { title: string; suggestion: string }> = {
  [EpubErrorCode.INVALID_ZIP]: {
    title: '文件损坏',
    suggestion: '请重新下载或选择其他EPUB文件',
  },
  [EpubErrorCode.MISSING_CONTAINER]: {
    title: 'EPUB格式无效',
    suggestion: '该文件不是有效的EPUB电子书',
  },
  [EpubErrorCode.MISSING_OPF]: {
    title: 'EPUB结构错误',
    suggestion: '电子书缺少关键的包文件',
  },
  [EpubErrorCode.NO_READABLE_CONTENT]: {
    title: '无法读取内容',
    suggestion: '电子书可能加密或格式不兼容',
  },
  [EpubErrorCode.MISSING_METADATA]: {
    title: '元数据缺失',
    suggestion: '书籍信息可能显示不完整',
  },
  [EpubErrorCode.MISSING_COVER]: {
    title: '封面未找到',
    suggestion: '将显示默认封面',
  },
};
```

---

## 12. 安全考虑

### 12.1 威胁模型

| 威胁 | 风险等级 | 缓解措施 |
|------|---------|---------|
| **恶意 JavaScript** | 高 | 移除所有脚本，不执行 JS |
| **XXE 攻击** | 高 | 禁用外部实体解析 |
| **路径遍历** | 高 | 验证路径不超出 EPUB 目录 |
| **ZIP 炸弹** | 中 | 限制解压大小和文件数 |
| **SSRF (SVG)** | 中 | 移除外部引用 |
| **CSS 注入** | 低 | 过滤危险 CSS 属性 |

### 12.2 安全配置

```typescript
const SECURITY_CONFIG = {
  // ZIP 解压限制
  zip: {
    maxFileSize: 100 * 1024 * 1024,      // 100MB
    maxFiles: 10000,                      // 最多 10000 个文件
    maxUncompressedSize: 500 * 1024 * 1024, // 解压后最大 500MB
  },

  // 单个文件限制
  file: {
    maxHtmlSize: 5 * 1024 * 1024,         // 单个 HTML 5MB
    maxImageSize: 20 * 1024 * 1024,       // 单个图片 20MB
  },

  // XML 解析配置
  xml: {
    disableExternalEntities: true,
    maxDepth: 100,
  },
};
```

### 12.3 路径安全验证

```typescript
/**
 * 验证路径安全性
 */
function isPathSafe(basePath: string, targetPath: string): boolean {
  const normalizedBase = path.normalize(basePath);
  const normalizedTarget = path.normalize(path.join(basePath, targetPath));

  // 检查目标路径是否在基础路径内
  return normalizedTarget.startsWith(normalizedBase);
}

/**
 * 安全的路径解析
 */
function safeResolvePath(href: string, basePath: string): string {
  // 移除协议前缀
  if (href.match(/^[a-z]+:/i)) {
    throw new Error('External references not allowed');
  }

  // 检查路径遍历
  if (href.includes('..') || href.includes('//')) {
    // 标准化路径
    const normalized = path.normalize(href);
    if (!isPathSafe(basePath, normalized)) {
      throw new Error('Path traversal detected');
    }
    return normalized;
  }

  return path.join(basePath, href);
}
```

### 12.4 DRM 检测

```typescript
/**
 * 检测 EPUB 是否有 DRM 保护
 */
function detectDRM(zip: AdmZip): boolean {
  // 检查 encryption.xml
  const encryptionEntry = zip.getEntry('META-INF/encryption.xml');
  if (encryptionEntry) {
    const content = encryptionEntry.getData().toString('utf-8');

    // Adobe ADEPT DRM
    if (content.includes('http://ns.adobe.com/adept')) {
      return true;
    }

    // Apple FairPlay DRM
    if (content.includes('http://www.apple.com/drm')) {
      return true;
    }

    // Other encryption
    if (content.includes('EncryptedData')) {
      return true;
    }
  }

  // 检查 rights.xml
  const rightsEntry = zip.getEntry('META-INF/rights.xml');
  if (rightsEntry) {
    return true;
  }

  return false;
}
```

---

## 13. 性能优化

### 13.1 内存优化

```typescript
class StreamingEpubParser {
  /**
   * 使用流式处理大文件
   */
  async parseStreaming(epubPath: string): Promise<ParsedBook> {
    // 使用流式读取 ZIP
    const fileStream = fs.createReadStream(epubPath);
    const unzipper = require('unzipper');

    // 只加载必要的文件到内存
    const essentialFiles = new Map<string, Buffer>();
    const chapterRefs: string[] = [];

    await new Promise((resolve, reject) => {
      fileStream
        .pipe(unzipper.Parse())
        .on('entry', async (entry: any) => {
          const fileName = entry.path;

          if (this.isEssentialFile(fileName)) {
            essentialFiles.set(fileName, await entry.buffer());
          } else if (this.isChapterFile(fileName)) {
            chapterRefs.push(fileName);
          } else {
            entry.autodrain();
          }
        })
        .on('finish', resolve)
        .on('error', reject);
    });

    // 解析元数据和目录
    const metadata = await this.parseMetadataFromBuffer(
      essentialFiles.get(this.opfPath)!
    );

    // 懒加载章节
    const chapters = await this.lazyParseChapters(epubPath, chapterRefs);

    return { ...metadata, chapters };
  }

  private isEssentialFile(path: string): boolean {
    return (
      path.endsWith('container.xml') ||
      path.endsWith('.opf') ||
      path.endsWith('.ncx') ||
      path.endsWith('nav.xhtml')
    );
  }
}
```

### 13.2 并行处理

```typescript
class ParallelChapterParser {
  /**
   * 并行解析多个章节
   */
  async parseChaptersParallel(
    zip: AdmZip,
    spineItems: string[],
    concurrency: number = 5
  ): Promise<ParsedChapter[]> {
    const results: ParsedChapter[] = [];
    const queue = [...spineItems];
    const processing = new Set<Promise<void>>();

    let orderIndex = 0;

    while (queue.length > 0 || processing.size > 0) {
      // 填充到并发上限
      while (queue.length > 0 && processing.size < concurrency) {
        const href = queue.shift()!;
        const currentIndex = orderIndex++;

        const promise = this.parseChapter(zip, href, currentIndex)
          .then(chapter => {
            if (chapter) {
              results.push(chapter);
            }
          })
          .finally(() => {
            processing.delete(promise);
          });

        processing.add(promise);
      }

      // 等待至少一个完成
      if (processing.size > 0) {
        await Promise.race(processing);
      }
    }

    // 按顺序排序
    return results.sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
```

### 13.3 缓存策略

```typescript
class ParseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 分钟

  /**
   * 基于文件哈希的缓存
   */
  async getOrParse(
    filePath: string,
    parser: () => Promise<ParsedBook>
  ): Promise<ParsedBook> {
    const hash = await this.computeHash(filePath);

    const cached = this.cache.get(hash);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const result = await parser();
    this.cache.set(hash, { data: result, timestamp: Date.now() });

    return result;
  }

  private async computeHash(filePath: string): Promise<string> {
    const crypto = await import('crypto');
    const fs = await import('fs');

    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
}
```

---

## 14. 测试策略

### 14.1 测试用例分类

```typescript
describe('EpubParser', () => {
  describe('EPUB2 Support', () => {
    it('should parse standard EPUB2 files', async () => {});
    it('should extract metadata from DC elements', async () => {});
    it('should parse NCX navigation', async () => {});
    it('should handle legacy OPF attributes', async () => {});
  });

  describe('EPUB3 Support', () => {
    it('should parse EPUB3 with NAV document', async () => {});
    it('should extract refined metadata', async () => {});
    it('should handle cover-image property', async () => {});
    it('should support EPUB3 semantic elements', async () => {});
  });

  describe('Cover Extraction', () => {
    it('should find cover by EPUB3 properties', async () => {});
    it('should find cover by meta element', async () => {});
    it('should find cover by manifest id', async () => {});
    it('should find cover by filename', async () => {});
    it('should extract cover from first page', async () => {});
    it('should generate placeholder when no cover', async () => {});
  });

  describe('Error Handling', () => {
    it('should reject invalid ZIP files', async () => {});
    it('should handle missing container.xml', async () => {});
    it('should gracefully handle missing metadata', async () => {});
    it('should skip corrupt chapters', async () => {});
    it('should detect DRM-protected files', async () => {});
  });

  describe('Encoding Support', () => {
    it('should detect UTF-8 with BOM', async () => {});
    it('should detect UTF-16', async () => {});
    it('should handle GBK encoded Chinese books', async () => {});
  });

  describe('Security', () => {
    it('should remove script elements', async () => {});
    it('should remove event handlers', async () => {});
    it('should prevent path traversal', async () => {});
    it('should limit file sizes', async () => {});
  });

  describe('Performance', () => {
    it('should parse 10MB EPUB within 5 seconds', async () => {});
    it('should handle 1000+ chapter books', async () => {});
  });
});
```

### 14.2 测试文件库

| 类别 | 测试文件 | 用途 |
|------|---------|------|
| **标准格式** | standard-epub2.epub | EPUB2 基准测试 |
| | standard-epub3.epub | EPUB3 基准测试 |
| | epub3-with-ncx.epub | EPUB3 + NCX 兼容 |
| **封面变体** | cover-by-meta.epub | meta 封面声明 |
| | cover-by-properties.epub | properties 封面 |
| | cover-in-page.epub | 嵌入页面封面 |
| | no-cover.epub | 无封面测试 |
| **编码** | utf8-bom.epub | UTF-8 BOM |
| | gbk-chinese.epub | GBK 中文 |
| | mixed-encoding.epub | 混合编码 |
| **边界情况** | large-book.epub | 大文件 (50MB+) |
| | many-chapters.epub | 多章节 (500+) |
| | nested-toc.epub | 多级目录 |
| | minimal.epub | 最小结构 |
| **异常情况** | corrupt-zip.epub | 损坏 ZIP |
| | missing-opf.epub | 缺少 OPF |
| | invalid-xml.epub | XML 格式错误 |
| | drm-protected.epub | DRM 保护 |

### 14.3 集成测试

```typescript
describe('Import Integration', () => {
  it('should complete full import workflow', async () => {
    // 1. 上传文件
    const uploadResult = await importService.initiateImport(userId, {
      filename: 'test.epub',
      fileSize: 1024000,
      contentType: 'application/epub+zip',
    });

    // 2. 模拟文件上传
    await storage.put(uploadResult.uploadKey, testEpubBuffer);

    // 3. 完成上传
    await importService.completeUpload(userId, uploadResult.jobId);

    // 4. 等待处理完成
    const result = await waitForJob(uploadResult.jobId, 30000);

    // 5. 验证结果
    expect(result.status).toBe('COMPLETED');
    expect(result.book).toBeDefined();
    expect(result.book.chapters.length).toBeGreaterThan(0);
  });
});
```

---

## 15. 实现计划

### 15.1 阶段划分

```
Phase 1: 核心解析能力 (已完成)
├── container.xml 解析
├── content.opf 解析
├── 基础元数据提取
├── spine 章节解析
├── NCX 目录解析
└── 基础封面提取

Phase 2: EPUB3 增强 (进行中)
├── NAV 导航文档支持
├── refined 元数据解析
├── cover-image 属性支持
├── 语义化元素识别
└── 多封面策略

Phase 3: 兼容性提升
├── 编码自动检测
├── XML 解析容错
├── 路径解析容错
├── 错误恢复机制
└── 性能优化

Phase 4: 高级功能
├── 流式处理大文件
├── 并行章节解析
├── 增量导入支持
└── 格式转换集成
```

### 15.2 代码位置

| 文件 | 描述 |
|------|------|
| `scripts/book-ingestion/processors/epub-parser.ts` | 核心解析器 |
| `scripts/book-ingestion/processors/html-cleaner.ts` | HTML 清洗 |
| `apps/backend/src/modules/import/book-enrichment.service.ts` | 导入服务 |
| `apps/backend/src/modules/user-books/user-books.service.ts` | 用户书籍服务 |

---

## 16. 附录

### 16.1 参考文档

- [EPUB 3.3 Specification (W3C)](https://www.w3.org/publishing/epub3/epub33/)
- [EPUB 2.0.1 Specification (IDPF Archive)](http://idpf.org/epub/201)
- [Dublin Core Metadata Element Set](https://www.dublincore.org/specifications/dublin-core/dces/)
- [EPUB Packages 3.3 (W3C)](https://www.w3.org/TR/epub-33/#sec-package-doc)
- [EPUB Content Documents 3.3 (W3C)](https://www.w3.org/TR/epub-33/#sec-contentdocs)

### 16.2 MIME 类型参考

| 文件类型 | MIME 类型 |
|---------|----------|
| EPUB | `application/epub+zip` |
| OPF | `application/oebps-package+xml` |
| NCX | `application/x-dtbncx+xml` |
| XHTML | `application/xhtml+xml` |
| CSS | `text/css` |
| JPEG | `image/jpeg` |
| PNG | `image/png` |
| GIF | `image/gif` |
| SVG | `image/svg+xml` |
| OTF Font | `font/otf` |
| WOFF Font | `font/woff` |

### 16.3 常见 EPUB 生成工具

| 工具 | 输出特点 | 兼容性 |
|------|---------|--------|
| Calibre | 标准 EPUB2/3，可配置 | 高 |
| Sigil | 标准 EPUB，OEBPS 结构 | 高 |
| Adobe InDesign | 复杂样式，OPS 结构 | 中 |
| Pandoc | 简洁 EPUB3 | 高 |
| iBooks Author | Apple 扩展特性 | 中 |
| Kindle Create | MOBI 优先，EPUB 导出 | 中 |
| Standard Ebooks | 高质量 EPUB3，epub 目录 | 高 |

---

*文档结束*
