# iOS客户端 - 用户自定义导入电子书支持情况

> 文档更新日期: 2025-12-28

## 核心结论

**用户自定义导入电子书功能iOS客户端已实现完成。**

---

## 1. 功能支持总览

| 功能维度 | 状态 | 说明 |
|---------|------|------|
| 后端API设计 | ✅ 完整 | 详见 `docs/reader/local-import.md` |
| 数据库模型 | ✅ 已设计 | `UserImportedBook`、`ImportJob` |
| EPUB解析器 | ✅ 后端就绪 | `scripts/book-ingestion/processors/epub-parser.ts` |
| MOBI/AZW3解析器 | ✅ 后端就绪 | `scripts/book-ingestion/processors/mobi-parser.ts` |
| **iOS导入入口** | ✅ 已实现 | `Features/Import/Views/ImportEntryView.swift` |
| **文件选择器** | ✅ 已实现 | UIDocumentPickerViewController 集成 |
| **文件上传** | ✅ 已实现 | 预签名URL上传 `FileUploadService.swift` |
| **导入进度展示** | ✅ 已实现 | `ImportProgressView.swift` |
| **配额显示** | ✅ 已实现 | `QuotaDisplayView` in `ImportEntryView.swift` |

---

## 2. 支持的电子书格式

| 格式 | 支持阶段 | 支持度 |
|-----|---------|-------|
| EPUB2/EPUB3 | Phase 1 (MVP) | ✅ 95% |
| TXT | Phase 1 | ✅ 支持 |
| PDF | Phase 1 | ✅ 支持 |
| MOBI/AZW3 | Phase 3 | ✅ 已实现 |

---

## 3. iOS端已实现的功能模块

```
Features/Import/
├── Views/
│   ├── ImportEntryView.swift       # 导入入口 (ImportButton, ImportSheetView)
│   └── ImportProgressView.swift    # 导入进度展示
├── ViewModels/
│   └── ImportViewModel.swift       # 导入状态管理
├── Models/
│   ├── ImportJob.swift             # 导入任务模型
│   └── ImportQuota.swift           # 配额模型
└── Services/
    ├── ImportService.swift         # API 调用
    └── FileUploadService.swift     # 预签名URL上传
```

---

## 4. 阅读器支持情况

### 阅读器已完全实现

阅读器模块完整且功能齐全：

| 功能 | 状态 | 文件位置 |
|-----|------|---------|
| WebView内容渲染 | ✅ | `Reader/ReaderContentView.swift` |
| 主题切换（亮/暗/棕） | ✅ | `Reader/ReaderSettingsView.swift` |
| 字号调节（14-28px） | ✅ | 同上 |
| 行高调节 | ✅ | 同上 |
| 字体选择 | ✅ | 同上 |
| 翻页模式（滚动/分页） | ✅ | 同上 |
| 章节列表 | ✅ | `Reader/ChapterListView.swift` |
| 阅读进度追踪 | ✅ | `Reader/ReaderViewModel.swift` |
| AI词汇解释 | ✅ | `Reader/AIInteractionPanel.swift` |
| 词汇本集成 | ✅ | 同上 |

### 导入书籍可复用相同阅读器

导入的书籍与发现页书籍使用**相同的 `Book` 数据模型**，因此：

- 排版体验**完全一致**
- 所有阅读器功能**均可使用**
- AI辅助功能**完全可用**

---

## 5. 与发现页书籍的对比

| 对比项 | 发现页书籍 | 导入书籍 |
|-------|-----------|----------|
| 阅读器 | ReaderView | 相同 ✅ |
| 排版支持 | 完整 | 相同 ✅ |
| AI功能 | 完整 | 相同 ✅ |
| 元数据 | 人工审核 | 自动提取 ⚠️ |
| 难度评分 | 预计算 | 自动计算 ⚠️ |
| 章节结构 | 编辑优化 | 自动解析 ⚠️ |

---

## 6. 导入流程

```
1. 权限检查 → FREE用户提示升级
2. 配额检查 → PRO: 50本/500MB, PREMIUM: 200本/2GB
3. 文件选择 → UIDocumentPickerViewController
4. 文件上传 → 预签名URL直传R2
5. 后端处理 → 格式验证/元数据提取/章节解析
6. 完成 → 进入书籍详情页
```

---

## 7. 已实现的API端点

iOS端已集成的API (`APIEndpoints.swift`):

```swift
// User Books (Import)
static let userBooks = "/user-books"
static let userBooksQuota = "/user-books/quota"
static let userBooksImportInitiate = "/user-books/import/initiate"
static let userBooksImportComplete = "/user-books/import/complete"
static func userBooksImportStatus(_ jobId: String) -> String { "/user-books/import/\(jobId)/status" }
static func userBooksImported(_ bookId: String) -> String { "/user-books/imported/\(bookId)" }
```

---

## 8. 总结

| 问题 | 回答 |
|-----|------|
| 能否导入电子书？ | ✅ 可以 |
| 能否在书架显示导入的书？ | ✅ 可以 |
| 导入的书能否正常阅读？ | ✅ 阅读器已就绪 |
| 排版是否正常？ | ✅ 与发现页一致 |

**实现状态：** iOS客户端 `Features/Import/` 模块已完成，包含文件选择、上传、进度展示等功能。

---

## 9. MOBI/AZW3 解析器实现

### 9.1 技术方案

采用 **Calibre 转换 + EPUB 解析** 的方案：

1. 使用 Calibre 的 `ebook-convert` 将 MOBI/AZW3 转换为 EPUB
2. 复用现有的 EPUB 解析器处理转换后的文件
3. 若 Calibre 不可用，回退到基础元数据提取

### 9.2 文件位置

```text
scripts/book-ingestion/processors/
├── epub-parser.ts      # EPUB 解析器（已有）
└── mobi-parser.ts      # MOBI/AZW3 解析器（新增）
```

### 9.3 iOS 客户端更新

**FileUploadService.swift** - 添加 MIME 类型：

```swift
case "azw", "azw3":
    return "application/vnd.amazon.ebook"
```

**ImportEntryView.swift** - 更新支持格式：

- 添加 MOBI/AZW3 格式徽章
- 更新文件选择器支持的类型

### 9.4 依赖要求

- **服务端**：需安装 Calibre (`ebook-convert` 命令)
  - Linux: `sudo apt-get install calibre`
  - macOS: `brew install calibre`
- **iOS**：无额外依赖

### 9.5 限制说明

- DRM 保护的书籍无法解析
- 无 Calibre 时仅支持基础元数据提取
- 转换过程可能需要较长时间（大文件）

---

## 相关文档

- [local-import.md](../reader/local-import.md) - 完整设计方案
- [epub-format-support.md](../reader/epub-format-support.md) - EPUB2/EPUB3 格式支持详细设计
- [mobi-support-design.md](../reader/mobi-support-design.md) - MOBI/AZW3 格式支持详细设计
- [book-formats-analysis.md](../reader/book-formats-analysis.md) - 格式支持分析
- [epub-architecture.md](../reader/epub-architecture.md) - EPUB架构
