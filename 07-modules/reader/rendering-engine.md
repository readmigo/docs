# 多格式渲染引擎

> 目标: 支持业界最全的电子书格式，远超 Kindle 的格式支持

---

## 架构概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UniversalBookEngine                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         FormatDetector                                   ││
│  │  自动检测文件格式（魔数检测 + 扩展名 + 内容分析）                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         格式解析器矩阵                                    ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ││
│  │  │EPUBParser │ │ PDFParser │ │ TXTParser │ │MOBIParser │ │ CBZParser │ ││
│  │  │(主力引擎)  │ │(PDFKit+   │ │(智能排版)  │ │(兼容Kindle)│ │(漫画优化) │ ││
│  │  │           │ │ 自研渲染) │ │           │ │           │ │           │ ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ││
│  │  │ FB2Parser │ │HTMLParser │ │ RTFParser │ │DOCXParser │ │ AZWParser │ ││
│  │  │(俄语书籍) │ │(网页书籍) │ │(富文本)   │ │(Office)   │ │(Amazon)   │ ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    UnifiedContentModel                                   ││
│  │  统一的内容模型：章节 + 段落 + 样式 + 媒体 + 元数据                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         渲染引擎选择器                                    ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            ││
│  │  │ WKWebView      │  │ PDFRenderer    │  │ ImageRenderer  │            ││
│  │  │ (流式内容)     │  │ (固定版式)     │  │ (漫画/图片书)  │            ││
│  │  └────────────────┘  └────────────────┘  └────────────────┘            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 支持格式详情

| 格式 | 优先级 | 渲染方式 | 特色功能 | 竞品对比 |
|------|--------|----------|----------|----------|
| **EPUB3** | P0 | WKWebView | 完整 EPUB3 支持，音视频、交互式内容 | ✅ 超越 Apple Books |
| **EPUB2** | P0 | WKWebView | 向后兼容，自动升级渲染 | ✅ 完全支持 |
| **PDF** | P0 | PDFKit + 自研 | 重排模式、夜间模式、批注 | ✅ 超越 Kindle |
| **TXT** | P0 | WKWebView | 智能分章、段落识别、编码检测 | ✅ 超越所有竞品 |
| **MOBI** | P1 | 转换 + WKWebView | 完美兼容 Kindle 书籍 | ✅ 独有功能 |
| **AZW/AZW3** | P1 | 转换 + WKWebView | Amazon 格式支持 | ✅ 独有功能 |
| **CBZ/CBR** | P1 | ImageRenderer | 漫画优化，双页模式 | ✅ 超越专业漫画App |
| **FB2** | P2 | 转换 + WKWebView | 俄语书籍支持 | ✅ 独有功能 |
| **HTML** | P2 | WKWebView | 网页书籍，自动清洁 | ✅ 完全支持 |
| **RTF** | P2 | 转换 + WKWebView | 富文本支持 | ✅ 独有功能 |
| **DOCX** | P3 | 转换 + WKWebView | Office 文档阅读 | ✅ 独有功能 |

---

## 核心数据模型

```swift
// MARK: - 通用书籍格式

enum BookFormat: String, Codable, CaseIterable {
    case epub3 = "epub3"
    case epub2 = "epub2"
    case pdf = "pdf"
    case txt = "txt"
    case mobi = "mobi"
    case azw = "azw"
    case azw3 = "azw3"
    case cbz = "cbz"
    case cbr = "cbr"
    case fb2 = "fb2"
    case html = "html"
    case rtf = "rtf"
    case docx = "docx"

    var displayName: String {
        switch self {
        case .epub3: return "EPUB 3"
        case .epub2: return "EPUB 2"
        case .pdf: return "PDF"
        case .txt: return "纯文本"
        case .mobi: return "Mobi"
        case .azw, .azw3: return "Kindle"
        case .cbz, .cbr: return "漫画"
        case .fb2: return "FictionBook"
        case .html: return "网页"
        case .rtf: return "富文本"
        case .docx: return "Word"
        }
    }

    var supportsReflow: Bool {
        switch self {
        case .pdf, .cbz, .cbr: return false
        default: return true
        }
    }

    var supportsAnnotation: Bool { true }
    var supportsTTS: Bool { true }
    var supportsSearch: Bool { true }
}
```

---

## 格式检测器

```swift
class FormatDetector {
    static func detect(from url: URL) async throws -> BookFormat {
        // 1. 检查文件扩展名
        let ext = url.pathExtension.lowercased()

        // 2. 读取文件魔数 (前 8 字节)
        let handle = try FileHandle(forReadingFrom: url)
        let magicBytes = try handle.read(upToCount: 8)
        try handle.close()

        // 3. 魔数检测
        if let magic = magicBytes {
            // ZIP 格式 (EPUB, CBZ, DOCX)
            if magic.starts(with: [0x50, 0x4B, 0x03, 0x04]) {
                return try await detectZipBasedFormat(url: url)
            }
            // PDF
            if magic.starts(with: [0x25, 0x50, 0x44, 0x46]) { // %PDF
                return .pdf
            }
            // RAR (CBR)
            if magic.starts(with: [0x52, 0x61, 0x72, 0x21]) { // Rar!
                return .cbr
            }
        }

        // 4. 扩展名回退
        switch ext {
        case "epub": return .epub3
        case "pdf": return .pdf
        case "txt": return .txt
        case "mobi": return .mobi
        case "azw": return .azw
        case "azw3": return .azw3
        case "cbz": return .cbz
        case "cbr": return .cbr
        case "fb2": return .fb2
        case "html", "htm": return .html
        case "rtf": return .rtf
        case "docx": return .docx
        default: throw FormatError.unsupportedFormat
        }
    }
}

enum FormatError: Error {
    case unsupportedFormat
    case corruptedFile
    case missingContent
    case conversionFailed
}
```

---

## PDF 渲染引擎

> 独创功能：PDF 重排模式

```swift
class PDFReaderEngine: ObservableObject {
    @Published var document: PDFDocument?
    @Published var currentPage: Int = 0
    @Published var totalPages: Int = 0
    @Published var displayMode: PDFDisplayMode = .singlePage
    @Published var isReflowMode: Bool = false  // 重排模式（独创）

    /// 将 PDF 内容提取并重新排版，支持字体调整
    func enableReflowMode() async {
        guard let document = document else { return }

        var reflowedContent = ""

        for i in 0..<document.pageCount {
            guard let page = document.page(at: i) else { continue }
            let text = page.string ?? ""
            let structure = extractPageStructure(page)
            let paragraphs = intelligentParagraphDetection(text, structure: structure)
            reflowedContent += paragraphs.map { "<p>\($0)</p>" }.joined()
        }

        await MainActor.run {
            isReflowMode = true
            reflowedHTML = wrapInHTML(reflowedContent)
        }
    }
}

enum PDFDisplayMode: String, CaseIterable {
    case singlePage = "single"
    case doublePage = "double"
    case continuous = "continuous"
    case reflow = "reflow"  // 独创：PDF 重排模式
}
```

---

## TXT 智能渲染引擎

> 功能：智能编码检测、智能章节检测、智能段落格式化

```swift
class TXTReaderEngine: ObservableObject {
    @Published var chapters: [TXTChapter] = []
    @Published var encoding: String.Encoding = .utf8

    /// 智能编码检测
    func detectEncoding(data: Data) -> String.Encoding {
        // BOM 检测
        if data.starts(with: [0xEF, 0xBB, 0xBF]) { return .utf8 }
        if data.starts(with: [0xFF, 0xFE]) { return .utf16LittleEndian }
        if data.starts(with: [0xFE, 0xFF]) { return .utf16BigEndian }

        // 统计字符频率推断
        let encodingsToTry: [String.Encoding] = [
            .utf8, .gb_18030_2000, .big5, .japaneseEUC, .shiftJIS
        ]
        // ...
    }

    /// 智能章节检测
    func detectChapters(content: String) -> [TXTChapter] {
        let patterns = [
            #"^第[一二三四五六七八九十百千\d]+[章节卷集部篇回]\s*.{0,30}$"#,
            #"^Chapter\s+\d+.*$"#,
            #"^(序章|序言|前言|引子|楔子|尾声|后记|番外).*$"#,
            #"^(Prologue|Epilogue|Introduction|Preface).*$"#
        ]
        // ...
    }
}
```

---

## 漫画阅读引擎

> 功能：智能双页拼接、页面切割、条漫模式

```swift
class ComicReaderEngine: ObservableObject {
    @Published var pages: [ComicPage] = []
    @Published var currentPage: Int = 0
    @Published var readingDirection: ReadingDirection = .leftToRight
    @Published var displayMode: ComicDisplayMode = .fitWidth

    enum ReadingDirection: String, CaseIterable {
        case leftToRight = "ltr"   // 西方漫画
        case rightToLeft = "rtl"   // 日本漫画
    }

    enum ComicDisplayMode: String, CaseIterable {
        case fitWidth = "fit_width"
        case fitHeight = "fit_height"
        case fitScreen = "fit_screen"
        case doublePage = "double_page"
        case webtoon = "webtoon"  // 条漫模式
    }

    /// 智能双页拼接
    func createDoublePageSpread(leftPage: Int, rightPage: Int) -> UIImage?

    /// 智能页面切割（单图分割为双页）
    func splitWideImage(_ image: UIImage) -> (UIImage, UIImage)?

    /// 条漫模式（长图连续滚动）
    func enableWebtoonMode()
}
```

---

## 格式转换器

```swift
class FormatConverter {
    /// 将任意格式转换为统一的内部格式
    func convert(from url: URL, format: BookFormat) async throws -> UnifiedBook {
        switch format {
        case .epub3, .epub2:
            return try await parseEPUB(url)
        case .pdf:
            return try await parsePDF(url)
        case .txt:
            return try await parseTXT(url)
        case .mobi, .azw, .azw3:
            return try await convertMobiToEPUB(url)
        case .cbz, .cbr:
            return try await parseComic(url)
        case .fb2:
            return try await convertFB2ToEPUB(url)
        case .html:
            return try await parseHTML(url)
        case .rtf:
            return try await convertRTFToEPUB(url)
        case .docx:
            return try await convertDOCXToEPUB(url)
        }
    }
}

struct UnifiedBook {
    let id: String
    let title: String
    let author: String
    let format: BookFormat
    let chapters: [UnifiedChapter]
    let coverImage: Data?
    let metadata: [String: String]
}

struct UnifiedChapter: Identifiable {
    let id: String
    let title: String
    let content: String  // HTML 格式
    let order: Int
}
```

---

## 相关文档

- [格式支持](./format-support.md) - 支持的电子书格式
- [翻页动画](./page-turning.md) - 物理级翻页动画系统
- [字体管理](./font-management.md) - 超级字体管理系统
- [阅读器架构](./architecture.md) - 核心架构设计

---

*最后更新: 2025-12-26*
