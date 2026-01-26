# iOS阅读器引擎

> ⭐ **核心模块** - 这是产品最重要的技术组件

### 15.1 阅读器架构总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     iOS Reader Engine Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      ReaderViewController                        │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │                   ReaderContainerView                    │    │    │
│  │  │  ┌────────────┐  ┌────────────────────┐  ┌────────────┐ │    │    │
│  │  │  │  Chapter   │  │   PageViewController  │  │  Chapter │ │    │    │
│  │  │  │  List      │  │   (翻页容器)          │  │  Info    │ │    │    │
│  │  │  │  (侧边栏)  │  │  ┌────────────────┐  │  │  (右侧)  │ │    │    │
│  │  │  │            │  │  │  PageView      │  │  │          │ │    │    │
│  │  │  │            │  │  │  (WKWebView)   │  │  │          │ │    │    │
│  │  │  │            │  │  └────────────────┘  │  │          │ │    │    │
│  │  │  └────────────┘  └────────────────────┘  └────────────┘ │    │    │
│  │  │                                                          │    │    │
│  │  │  ┌──────────────────────────────────────────────────────┐│    │    │
│  │  │  │              ReaderToolbar                           ││    │    │
│  │  │  │  [目录] [设置] [AI助手] [书签] [进度条]              ││    │    │
│  │  │  └──────────────────────────────────────────────────────┘│    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  支撑层：                                                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │EPUBParser  │ │PageLayout  │ │TextSelector│ │ProgressSync│           │
│  │EPUB解析    │ │分页引擎    │ │文本选择    │ │ 进度同步   │           │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ThemeEngine │ │FontManager │ │AIBridge    │ │OfflineCache│           │
│  │主题引擎    │ │字体管理    │ │AI交互桥接  │ │ 离线缓存   │           │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.2 EPUB解析引擎

```swift
// Sources/Reader/Core/EPUBParser.swift

import Foundation
import ZIPFoundation
import SwiftSoup

/// EPUB 文件解析器
final class EPUBParser {

    // MARK: - Types

    struct ParsedEPUB {
        let metadata: EPUBMetadata
        let spine: [SpineItem]
        let toc: [TOCItem]
        let resources: [String: Data]
        let baseURL: URL
    }

    struct EPUBMetadata {
        let title: String
        let author: String
        let language: String
        let identifier: String
        let description: String?
        let coverImagePath: String?
        let subjects: [String]
    }

    struct SpineItem {
        let id: String
        let href: String
        let mediaType: String
        let linear: Bool
    }

    struct TOCItem {
        let title: String
        let href: String
        let children: [TOCItem]
        let playOrder: Int
    }

    // MARK: - Parsing

    /// 解析 EPUB 文件
    func parse(url: URL) async throws -> ParsedEPUB {
        // 1. 解压到临时目录
        let tempDir = try await unzipEPUB(url)

        // 2. 解析 container.xml 获取 rootfile 路径
        let containerPath = tempDir.appendingPathComponent("META-INF/container.xml")
        let rootfilePath = try parseContainer(containerPath)

        // 3. 解析 content.opf (Package Document)
        let opfURL = tempDir.appendingPathComponent(rootfilePath)
        let opfDir = opfURL.deletingLastPathComponent()
        let (metadata, manifest, spine) = try parseOPF(opfURL)

        // 4. 解析目录 (NCX 或 Navigation Document)
        let toc = try parseTOC(manifest: manifest, baseDir: opfDir)

        // 5. 加载资源
        let resources = try loadResources(manifest: manifest, baseDir: opfDir)

        return ParsedEPUB(
            metadata: metadata,
            spine: spine,
            toc: toc,
            resources: resources,
            baseURL: opfDir
        )
    }

    /// 解析 OPF 文件
    private func parseOPF(_ url: URL) throws -> (EPUBMetadata, [String: ManifestItem], [SpineItem]) {
        let data = try Data(contentsOf: url)
        let doc = try SwiftSoup.parse(String(data: data, encoding: .utf8)!)

        // 解析 metadata
        let metadataEl = try doc.select("metadata").first()!
        let metadata = EPUBMetadata(
            title: try metadataEl.select("dc|title, title").first()?.text() ?? "Unknown",
            author: try metadataEl.select("dc|creator, creator").first()?.text() ?? "Unknown",
            language: try metadataEl.select("dc|language, language").first()?.text() ?? "en",
            identifier: try metadataEl.select("dc|identifier, identifier").first()?.text() ?? "",
            description: try metadataEl.select("dc|description, description").first()?.text(),
            coverImagePath: try findCoverImage(doc),
            subjects: try metadataEl.select("dc|subject, subject").array().map { try $0.text() }
        )

        // 解析 manifest
        var manifest: [String: ManifestItem] = [:]
        for item in try doc.select("manifest item").array() {
            let id = try item.attr("id")
            manifest[id] = ManifestItem(
                id: id,
                href: try item.attr("href"),
                mediaType: try item.attr("media-type")
            )
        }

        // 解析 spine
        var spine: [SpineItem] = []
        for itemref in try doc.select("spine itemref").array() {
            let idref = try itemref.attr("idref")
            guard let manifestItem = manifest[idref] else { continue }
            spine.append(SpineItem(
                id: idref,
                href: manifestItem.href,
                mediaType: manifestItem.mediaType,
                linear: try itemref.attr("linear") != "no"
            ))
        }

        return (metadata, manifest, spine)
    }

    /// 解析目录
    private func parseTOC(manifest: [String: ManifestItem], baseDir: URL) throws -> [TOCItem] {
        // 优先使用 EPUB3 Navigation Document
        if let navItem = manifest.values.first(where: { $0.mediaType == "application/xhtml+xml" && $0.href.contains("nav") }) {
            return try parseNavigationDocument(baseDir.appendingPathComponent(navItem.href))
        }

        // 回退到 NCX
        if let ncxItem = manifest.values.first(where: { $0.mediaType == "application/x-dtbncx+xml" }) {
            return try parseNCX(baseDir.appendingPathComponent(ncxItem.href))
        }

        return []
    }
}
```

### 15.3 分页渲染引擎

```swift
// Sources/Reader/Core/PageLayoutEngine.swift

import UIKit
import WebKit

/// 分页布局引擎
final class PageLayoutEngine: NSObject {

    // MARK: - Configuration

    struct LayoutConfig {
        var pageWidth: CGFloat
        var pageHeight: CGFloat
        var horizontalMargin: CGFloat = 24
        var verticalMargin: CGFloat = 40
        var columnGap: CGFloat = 20
        var fontSize: CGFloat = 18
        var lineHeight: CGFloat = 1.6
        var fontFamily: String = "Georgia"
        var textAlign: String = "justify"
        var theme: ReaderTheme = .light
    }

    // MARK: - Properties

    private var webView: WKWebView!
    private var config: LayoutConfig
    private var currentChapterHTML: String = ""
    private var totalPages: Int = 0
    private var currentPage: Int = 0

    // MARK: - Pagination

    /// 计算章节总页数
    func calculatePages(html: String, config: LayoutConfig) async -> Int {
        self.config = config
        self.currentChapterHTML = html

        // 注入分页 CSS
        let styledHTML = injectPaginationStyles(html: html, config: config)

        // 加载到 WebView 并计算页数
        return await withCheckedContinuation { continuation in
            webView.loadHTMLString(styledHTML, baseURL: nil)

            // WebView 加载完成后计算页数
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.webView.evaluateJavaScript("Math.ceil(document.body.scrollWidth / \(config.pageWidth))") { result, error in
                    let pages = (result as? Int) ?? 1
                    self.totalPages = pages
                    continuation.resume(returning: pages)
                }
            }
        }
    }

    /// 生成分页 CSS
    private func injectPaginationStyles(html: String, config: LayoutConfig) -> String {
        let contentWidth = config.pageWidth - (config.horizontalMargin * 2)
        let contentHeight = config.pageHeight - (config.verticalMargin * 2)

        let css = """
        <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            height: 100%;
        }

        body {
            height: \(contentHeight)px;
            width: auto;
            margin: \(config.verticalMargin)px \(config.horizontalMargin)px;

            /* 多列布局实现分页 */
            column-width: \(contentWidth)px;
            column-gap: \(config.columnGap)px;
            column-fill: auto;

            /* 文字样式 */
            font-family: '\(config.fontFamily)', serif;
            font-size: \(config.fontSize)px;
            line-height: \(config.lineHeight);
            text-align: \(config.textAlign);

            /* 主题颜色 */
            color: \(config.theme.textColor.hexString);
            background-color: \(config.theme.backgroundColor.hexString);

            /* 防止内容溢出 */
            overflow: hidden;

            /* 优化文字渲染 */
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }

        /* 段落样式 */
        p {
            margin-bottom: 1em;
            text-indent: 2em;
            orphans: 2;
            widows: 2;
        }

        /* 章节标题 */
        h1, h2, h3 {
            break-after: avoid;
            margin-top: 1em;
            margin-bottom: 0.5em;
            text-indent: 0;
        }

        /* 图片适配 */
        img {
            max-width: 100%;
            max-height: \(contentHeight * 0.8)px;
            object-fit: contain;
        }

        /* 防止元素跨页断开 */
        blockquote, pre, figure {
            break-inside: avoid;
        }

        /* 选中文本样式 */
        ::selection {
            background-color: \(config.theme.selectionColor.hexString);
        }
        </style>
        """

        // 在 <head> 中注入 CSS
        if let headRange = html.range(of: "</head>") {
            var modifiedHTML = html
            modifiedHTML.insert(contentsOf: css, at: headRange.lowerBound)
            return modifiedHTML
        }

        return "<html><head>\(css)</head><body>\(html)</body></html>"
    }

    /// 滚动到指定页面
    func scrollToPage(_ page: Int) {
        let offset = CGFloat(page) * config.pageWidth
        webView.evaluateJavaScript("window.scrollTo(\(offset), 0)")
        currentPage = page
    }
}
```

### 15.4 文本选择与AI交互

```swift
// Sources/Reader/Core/TextSelectionHandler.swift

import WebKit

/// 文本选择处理器
final class TextSelectionHandler: NSObject {

    // MARK: - Types

    struct SelectedText {
        let text: String
        let range: NSRange
        let context: TextContext
        let rect: CGRect            // 选中区域位置
    }

    struct TextContext {
        let before: String          // 前100字符
        let after: String           // 后100字符
        let sentence: String        // 所在句子
        let paragraph: String       // 所在段落
        let chapterTitle: String
    }

    enum SelectionAction {
        case explain                // AI解释
        case simplify               // 简化句子
        case translate              // 翻译
        case addToVocabulary        // 添加到生词本
        case copy                   // 复制
        case highlight              // 高亮标记
    }

    // MARK: - Properties

    weak var delegate: TextSelectionDelegate?
    private weak var webView: WKWebView?

    // MARK: - JavaScript Bridge

    /// 注入文本选择处理脚本
    func injectSelectionScript(into webView: WKWebView) {
        self.webView = webView

        let script = """
        (function() {
            // 监听选择变化
            document.addEventListener('selectionchange', function() {
                const selection = window.getSelection();
                if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const selectedText = selection.toString();

                    // 获取上下文
                    const context = getSelectionContext(range);

                    // 发送到 Native
                    window.webkit.messageHandlers.textSelection.postMessage({
                        text: selectedText,
                        rect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        context: context
                    });
                }
            });

            // 获取选择上下文
            function getSelectionContext(range) {
                const container = range.commonAncestorContainer;
                const textNode = container.nodeType === Node.TEXT_NODE ? container : container.firstChild;

                // 获取段落
                let paragraph = container;
                while (paragraph && paragraph.nodeName !== 'P' && paragraph.nodeName !== 'DIV') {
                    paragraph = paragraph.parentNode;
                }
                const paragraphText = paragraph ? paragraph.textContent : '';

                // 获取前后文本
                const fullText = textNode ? textNode.textContent : '';
                const offset = range.startOffset;
                const before = fullText.substring(Math.max(0, offset - 100), offset);
                const after = fullText.substring(range.endOffset, range.endOffset + 100);

                // 获取所在句子
                const sentence = extractSentence(fullText, offset);

                return {
                    before: before,
                    after: after,
                    sentence: sentence,
                    paragraph: paragraphText.substring(0, 500)
                };
            }

            // 提取句子
            function extractSentence(text, offset) {
                const sentenceEnders = /[.!?。！？]/g;
                let start = 0;
                let end = text.length;

                // 找句子开始
                for (let i = offset; i >= 0; i--) {
                    if (sentenceEnders.test(text[i])) {
                        start = i + 1;
                        break;
                    }
                }

                // 找句子结束
                for (let i = offset; i < text.length; i++) {
                    if (sentenceEnders.test(text[i])) {
                        end = i + 1;
                        break;
                    }
                }

                return text.substring(start, end).trim();
            }
        })();
        """

        let userScript = WKUserScript(
            source: script,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        webView.configuration.userContentController.addUserScript(userScript)
        webView.configuration.userContentController.add(self, name: "textSelection")
    }

    /// 显示操作菜单
    func showActionMenu(for selection: SelectedText, at rect: CGRect) {
        let actions: [(SelectionAction, String, String)] = [
            (.explain, "Explain", "lightbulb"),
            (.simplify, "Simplify", "text.badge.minus"),
            (.translate, "Translate", "globe"),
            (.addToVocabulary, "Save Word", "plus.circle"),
            (.highlight, "Highlight", "highlighter"),
        ]

        // 显示自定义菜单
        delegate?.showSelectionMenu(
            actions: actions,
            selection: selection,
            anchorRect: rect
        )
    }
}

// MARK: - WKScriptMessageHandler

extension TextSelectionHandler: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "textSelection",
              let body = message.body as? [String: Any],
              let text = body["text"] as? String,
              let rectDict = body["rect"] as? [String: CGFloat],
              let contextDict = body["context"] as? [String: String] else {
            return
        }

        let selection = SelectedText(
            text: text,
            range: NSRange(),
            context: TextContext(
                before: contextDict["before"] ?? "",
                after: contextDict["after"] ?? "",
                sentence: contextDict["sentence"] ?? "",
                paragraph: contextDict["paragraph"] ?? "",
                chapterTitle: ""
            ),
            rect: CGRect(
                x: rectDict["x"] ?? 0,
                y: rectDict["y"] ?? 0,
                width: rectDict["width"] ?? 0,
                height: rectDict["height"] ?? 0
            )
        )

        delegate?.didSelectText(selection)
    }
}
```

### 15.5 AI交互桥接

```swift
// Sources/Reader/AI/AIBridgeService.swift

import Foundation

/// AI服务桥接
final class AIBridgeService {

    // MARK: - Types

    enum AITask {
        case explainWord(word: String, context: String)
        case explainSentence(sentence: String, context: String)
        case simplifySentence(sentence: String)
        case translateText(text: String, targetLanguage: String)
        case askQuestion(question: String, bookContext: String)
    }

    struct AIResponse {
        let content: String
        let cached: Bool
        let model: String
        let latencyMs: Int
    }

    // MARK: - Properties

    private let apiClient: APIClient
    private let cache: AIResponseCache
    private let localDictionary: LocalDictionaryService

    // MARK: - Public Methods

    /// 执行AI任务
    func execute(_ task: AITask) async throws -> AIResponse {
        // 1. 检查本地词典 (词汇解释)
        if case .explainWord(let word, _) = task {
            if let localResult = localDictionary.lookup(word) {
                return AIResponse(
                    content: localResult.formatted,
                    cached: true,
                    model: "local_dictionary",
                    latencyMs: 0
                )
            }
        }

        // 2. 检查缓存
        let cacheKey = generateCacheKey(task)
        if let cachedResponse = cache.get(cacheKey) {
            return AIResponse(
                content: cachedResponse,
                cached: true,
                model: "cache",
                latencyMs: 0
            )
        }

        // 3. 调用远程API
        let startTime = Date()
        let response = try await callRemoteAI(task)
        let latency = Int(Date().timeIntervalSince(startTime) * 1000)

        // 4. 缓存响应
        cache.set(cacheKey, value: response.content, ttl: 7 * 24 * 3600) // 7天

        return AIResponse(
            content: response.content,
            cached: false,
            model: response.model,
            latencyMs: latency
        )
    }

    /// 调用远程AI API
    private func callRemoteAI(_ task: AITask) async throws -> (content: String, model: String) {
        let request = buildRequest(task)
        let response: AIAPIResponse = try await apiClient.post("/api/v1/ai/\(task.endpoint)", body: request)
        return (response.content, response.model)
    }

    /// 构建请求
    private func buildRequest(_ task: AITask) -> [String: Any] {
        switch task {
        case .explainWord(let word, let context):
            return [
                "type": "word",
                "text": word,
                "context": context
            ]
        case .explainSentence(let sentence, let context):
            return [
                "type": "sentence",
                "text": sentence,
                "context": context
            ]
        case .simplifySentence(let sentence):
            return [
                "sentence": sentence
            ]
        case .translateText(let text, let targetLanguage):
            return [
                "text": text,
                "targetLanguage": targetLanguage
            ]
        case .askQuestion(let question, let bookContext):
            return [
                "question": question,
                "context": bookContext
            ]
        }
    }
}

// MARK: - AI Response Cache

final class AIResponseCache {
    private let cache = NSCache<NSString, CacheEntry>()
    private let fileManager = FileManager.default
    private let cacheDirectory: URL

    class CacheEntry: NSObject {
        let value: String
        let expiry: Date

        init(value: String, ttl: TimeInterval) {
            self.value = value
            self.expiry = Date().addingTimeInterval(ttl)
        }

        var isExpired: Bool {
            Date() > expiry
        }
    }

    init() {
        cacheDirectory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("AICache")
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }

    func get(_ key: String) -> String? {
        // 内存缓存
        if let entry = cache.object(forKey: key as NSString), !entry.isExpired {
            return entry.value
        }

        // 磁盘缓存
        let fileURL = cacheDirectory.appendingPathComponent(key.sha256)
        if let data = try? Data(contentsOf: fileURL),
           let entry = try? JSONDecoder().decode(DiskCacheEntry.self, from: data),
           !entry.isExpired {
            // 提升到内存缓存
            cache.setObject(CacheEntry(value: entry.value, ttl: entry.remainingTTL), forKey: key as NSString)
            return entry.value
        }

        return nil
    }

    func set(_ key: String, value: String, ttl: TimeInterval) {
        // 内存缓存
        cache.setObject(CacheEntry(value: value, ttl: ttl), forKey: key as NSString)

        // 磁盘缓存
        let entry = DiskCacheEntry(value: value, expiry: Date().addingTimeInterval(ttl))
        if let data = try? JSONEncoder().encode(entry) {
            let fileURL = cacheDirectory.appendingPathComponent(key.sha256)
            try? data.write(to: fileURL)
        }
    }
}
```

### 15.6 阅读进度与同步

```swift
// Sources/Reader/Core/ReadingProgressManager.swift

import Foundation
import Combine

/// 阅读进度管理器
final class ReadingProgressManager {

    // MARK: - Types

    struct ReadingPosition: Codable {
        let bookId: String
        let chapterIndex: Int
        let pageIndex: Int
        let cfi: String?            // EPUB CFI 定位符
        let percentage: Double       // 0.0 - 1.0
        let timestamp: Date
        let deviceId: String
    }

    // MARK: - Properties

    private let localStorage: LocalStorageService
    private let apiClient: APIClient
    private let syncQueue = DispatchQueue(label: "progress.sync")

    private var pendingSync: [ReadingPosition] = []
    private var syncTimer: Timer?
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Local Progress

    /// 保存本地进度
    func saveProgress(_ position: ReadingPosition) {
        // 1. 立即保存到本地
        localStorage.saveProgress(position)

        // 2. 加入同步队列
        syncQueue.async {
            self.pendingSync.append(position)
        }

        // 3. 延迟批量同步 (节省网络请求)
        scheduleSync()
    }

    /// 获取本地进度
    func getProgress(bookId: String) -> ReadingPosition? {
        localStorage.getProgress(bookId: bookId)
    }

    // MARK: - Cloud Sync

    /// 调度同步
    private func scheduleSync() {
        syncTimer?.invalidate()
        syncTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: false) { [weak self] _ in
            self?.performSync()
        }
    }

    /// 执行同步
    private func performSync() {
        syncQueue.async { [weak self] in
            guard let self = self, !self.pendingSync.isEmpty else { return }

            let positions = self.pendingSync
            self.pendingSync = []

            Task {
                do {
                    // 只同步最新的进度
                    let latestByBook = Dictionary(grouping: positions, by: { $0.bookId })
                        .mapValues { $0.max(by: { $0.timestamp < $1.timestamp })! }

                    try await self.apiClient.post("/api/v1/reading/progress/batch", body: [
                        "positions": Array(latestByBook.values)
                    ])
                } catch {
                    // 同步失败，重新加入队列
                    self.syncQueue.async {
                        self.pendingSync.append(contentsOf: positions)
                    }
                }
            }
        }
    }

    /// 从云端拉取进度
    func pullProgress(bookId: String) async throws -> ReadingPosition? {
        let response: ReadingPosition? = try await apiClient.get("/api/v1/reading/progress/\(bookId)")

        if let cloudPosition = response {
            // 比较本地和云端，取最新的
            if let localPosition = localStorage.getProgress(bookId: bookId) {
                if cloudPosition.timestamp > localPosition.timestamp {
                    localStorage.saveProgress(cloudPosition)
                    return cloudPosition
                } else {
                    return localPosition
                }
            }
            localStorage.saveProgress(cloudPosition)
            return cloudPosition
        }

        return localStorage.getProgress(bookId: bookId)
    }

    /// 全量同步 (App启动时)
    func fullSync() async throws {
        // 1. 获取所有本地进度
        let localProgresses = localStorage.getAllProgress()

        // 2. 获取云端进度
        let cloudProgresses: [ReadingPosition] = try await apiClient.get("/api/v1/reading/progress")

        // 3. 合并 (取最新)
        var merged: [String: ReadingPosition] = [:]

        for local in localProgresses {
            merged[local.bookId] = local
        }

        for cloud in cloudProgresses {
            if let existing = merged[cloud.bookId] {
                if cloud.timestamp > existing.timestamp {
                    merged[cloud.bookId] = cloud
                }
            } else {
                merged[cloud.bookId] = cloud
            }
        }

        // 4. 保存合并结果到本地
        for position in merged.values {
            localStorage.saveProgress(position)
        }

        // 5. 上传本地独有的进度
        let cloudBookIds = Set(cloudProgresses.map { $0.bookId })
        let localOnly = localProgresses.filter { !cloudBookIds.contains($0.bookId) }

        if !localOnly.isEmpty {
            try await apiClient.post("/api/v1/reading/progress/batch", body: [
                "positions": localOnly
            ])
        }
    }
}
```

### 15.7 主题与字体系统

```swift
// Sources/Reader/Theme/ReaderThemeEngine.swift

import UIKit

/// 阅读器主题
enum ReaderTheme: String, CaseIterable, Codable {
    case light = "light"
    case sepia = "sepia"
    case dark = "dark"
    case black = "black"       // OLED优化

    var backgroundColor: UIColor {
        switch self {
        case .light: return UIColor(hex: "#FFFFFF")
        case .sepia: return UIColor(hex: "#F4ECD8")
        case .dark: return UIColor(hex: "#1C1C1E")
        case .black: return UIColor(hex: "#000000")
        }
    }

    var textColor: UIColor {
        switch self {
        case .light: return UIColor(hex: "#1C1C1E")
        case .sepia: return UIColor(hex: "#5B4636")
        case .dark: return UIColor(hex: "#E5E5E7")
        case .black: return UIColor(hex: "#FFFFFF")
        }
    }

    var selectionColor: UIColor {
        switch self {
        case .light, .sepia: return UIColor(hex: "#FFE066").withAlphaComponent(0.5)
        case .dark, .black: return UIColor(hex: "#3A7CA5").withAlphaComponent(0.5)
        }
    }

    var linkColor: UIColor {
        switch self {
        case .light, .sepia: return UIColor(hex: "#007AFF")
        case .dark, .black: return UIColor(hex: "#64D2FF")
        }
    }

    var statusBarStyle: UIStatusBarStyle {
        switch self {
        case .light, .sepia: return .darkContent
        case .dark, .black: return .lightContent
        }
    }
}

/// 字体管理器
final class ReaderFontManager {

    // MARK: - Types

    struct FontConfig: Codable {
        var family: FontFamily
        var size: CGFloat
        var lineHeight: CGFloat
        var letterSpacing: CGFloat

        static let `default` = FontConfig(
            family: .georgia,
            size: 18,
            lineHeight: 1.6,
            letterSpacing: 0
        )
    }

    enum FontFamily: String, CaseIterable, Codable {
        case system = "System"
        case georgia = "Georgia"
        case palatino = "Palatino"
        case times = "Times New Roman"
        case athelas = "Athelas"
        case charter = "Charter"
        case iowan = "Iowan Old Style"

        var cssName: String {
            switch self {
            case .system: return "-apple-system, BlinkMacSystemFont"
            case .georgia: return "Georgia, serif"
            case .palatino: return "Palatino, 'Palatino Linotype', serif"
            case .times: return "'Times New Roman', Times, serif"
            case .athelas: return "Athelas, serif"
            case .charter: return "Charter, serif"
            case .iowan: return "'Iowan Old Style', serif"
            }
        }

        var displayName: String {
            rawValue
        }
    }

    // MARK: - Font Size Presets

    static let fontSizeRange: ClosedRange<CGFloat> = 12...28
    static let fontSizeStep: CGFloat = 2

    // MARK: - Generate CSS

    func generateCSS(config: FontConfig, theme: ReaderTheme) -> String {
        """
        body {
            font-family: \(config.family.cssName);
            font-size: \(config.size)px;
            line-height: \(config.lineHeight);
            letter-spacing: \(config.letterSpacing)em;
            color: \(theme.textColor.hexString);
            background-color: \(theme.backgroundColor.hexString);
        }

        a {
            color: \(theme.linkColor.hexString);
        }

        ::selection {
            background-color: \(theme.selectionColor.hexString);
        }
        """
    }
}
```

### 15.8 阅读器完整集成

```swift
// Sources/Reader/ReaderViewController.swift

import UIKit
import SwiftUI
import Combine

/// 阅读器主控制器
final class ReaderViewController: UIViewController {

    // MARK: - Properties

    private let viewModel: ReaderViewModel
    private var pageViewController: UIPageViewController!
    private var toolbarView: ReaderToolbarView!
    private var aiPanelView: AIPanelView!

    private var cancellables = Set<AnyCancellable>()

    // MARK: - Lifecycle

    init(book: Book, startPosition: ReadingPosition?) {
        self.viewModel = ReaderViewModel(book: book, startPosition: startPosition)
        super.init(nibName: nil, bundle: nil)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        bindViewModel()
        viewModel.loadBook()
    }

    // MARK: - Setup

    private func setupUI() {
        // 1. 隐藏导航栏
        navigationController?.setNavigationBarHidden(true, animated: false)

        // 2. 设置翻页容器
        pageViewController = UIPageViewController(
            transitionStyle: .pageCurl,  // 仿真翻页效果
            navigationOrientation: .horizontal,
            options: [.spineLocation: UIPageViewController.SpineLocation.min.rawValue]
        )
        pageViewController.delegate = self
        pageViewController.dataSource = self
        addChild(pageViewController)
        view.addSubview(pageViewController.view)
        pageViewController.didMove(toParent: self)

        // 3. 设置工具栏
        toolbarView = ReaderToolbarView()
        toolbarView.delegate = self
        view.addSubview(toolbarView)

        // 4. 设置AI面板
        aiPanelView = AIPanelView()
        aiPanelView.isHidden = true
        view.addSubview(aiPanelView)

        // 5. 添加手势
        setupGestures()

        // 6. 约束布局
        setupConstraints()
    }

    private func setupGestures() {
        // 点击中央区域显示/隐藏工具栏
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        view.addGestureRecognizer(tapGesture)
    }

    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        let location = gesture.location(in: view)
        let centerRect = CGRect(
            x: view.bounds.width * 0.3,
            y: view.bounds.height * 0.3,
            width: view.bounds.width * 0.4,
            height: view.bounds.height * 0.4
        )

        if centerRect.contains(location) {
            toggleToolbar()
        }
    }

    private func toggleToolbar() {
        UIView.animate(withDuration: 0.25) {
            self.toolbarView.alpha = self.toolbarView.alpha == 0 ? 1 : 0
        }
    }

    // MARK: - Binding

    private func bindViewModel() {
        // 书籍加载完成
        viewModel.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isLoading in
                self?.updateLoadingState(isLoading)
            }
            .store(in: &cancellables)

        // 页面变化
        viewModel.$currentPage
            .receive(on: DispatchQueue.main)
            .sink { [weak self] page in
                self?.toolbarView.updateProgress(
                    page: page,
                    total: self?.viewModel.totalPages ?? 1
                )
            }
            .store(in: &cancellables)

        // 主题变化
        viewModel.$theme
            .receive(on: DispatchQueue.main)
            .sink { [weak self] theme in
                self?.applyTheme(theme)
            }
            .store(in: &cancellables)

        // AI响应
        viewModel.$aiResponse
            .receive(on: DispatchQueue.main)
            .sink { [weak self] response in
                if let response = response {
                    self?.showAIPanel(with: response)
                }
            }
            .store(in: &cancellables)
    }

    // MARK: - Theme

    private func applyTheme(_ theme: ReaderTheme) {
        view.backgroundColor = theme.backgroundColor
        setNeedsStatusBarAppearanceUpdate()

        // 通知所有页面更新主题
        pageViewController.viewControllers?.forEach { vc in
            (vc as? PageContentViewController)?.applyTheme(theme)
        }
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        viewModel.theme.statusBarStyle
    }

    // MARK: - AI Panel

    private func showAIPanel(with response: AIResponse) {
        aiPanelView.configure(with: response)
        aiPanelView.isHidden = false

        UIView.animate(withDuration: 0.3) {
            self.aiPanelView.alpha = 1
        }
    }
}

// MARK: - UIPageViewControllerDataSource

extension ReaderViewController: UIPageViewControllerDataSource {
    func pageViewController(_ pageViewController: UIPageViewController, viewControllerBefore viewController: UIViewController) -> UIViewController? {
        guard let currentVC = viewController as? PageContentViewController,
              currentVC.pageIndex > 0 else {
            return nil
        }
        return createPageViewController(at: currentVC.pageIndex - 1)
    }

    func pageViewController(_ pageViewController: UIPageViewController, viewControllerAfter viewController: UIViewController) -> UIViewController? {
        guard let currentVC = viewController as? PageContentViewController,
              currentVC.pageIndex < viewModel.totalPages - 1 else {
            return nil
        }
        return createPageViewController(at: currentVC.pageIndex + 1)
    }

    private func createPageViewController(at index: Int) -> PageContentViewController {
        let vc = PageContentViewController()
        vc.pageIndex = index
        vc.configure(
            html: viewModel.getPageContent(at: index),
            theme: viewModel.theme,
            fontConfig: viewModel.fontConfig
        )
        vc.selectionDelegate = self
        return vc
    }
}

// MARK: - TextSelectionDelegate

extension ReaderViewController: TextSelectionDelegate {
    func didSelectText(_ selection: SelectedText) {
        // 显示操作菜单
        showSelectionMenu(for: selection)
    }

    func didRequestAI(action: SelectionAction, selection: SelectedText) {
        viewModel.requestAI(action: action, selection: selection)
    }
}
```

---

