# iOS i18n (国际化) 全面支持设计方案

## 1. 现状分析

### 1.1 现有基础设施

| 项目 | 状态 |
|------|------|
| 本地化文件 | `Localizable.xcstrings` (xcstrings 格式, iOS 16+) |
| 源语言 | English (en) |
| 目标语言 | 简体中文 (zh-Hans), 繁体中文 (zh-Hant) |
| LocalizationManager | 已实现，支持语言切换和用户偏好 |
| 已定义的 Key | 45 个 |
| 已本地化文件 | 1 个 (AuthError.swift) |

### 1.2 硬编码字符串统计

| 类别 | 数量 | 示例 |
|------|------|------|
| Navigation Titles | ~61 | `.navigationTitle("Settings")` |
| Button Labels | ~88 | `Button("Sign in with Google")` |
| Text/Label 内容 | ~538+ | `Text("Continue Reading")` |
| Section Headers | ~30+ | `Section("Pitch")` |
| Alert Messages | ~50+ | `Alert(title: "Delete?")` |
| Error Messages | ~30+ | `"Network connection failed"` |
| Loading/Status | ~40+ | `"AI Analyzing Characters..."` |
| **总计** | **~900+** | - |

### 1.3 需要修改的文件

**共 66 个文件**，按模块分布：

```
Features/
├── Reader/          # 12 files - 最多硬编码字符串
│   ├── ReaderView.swift
│   ├── ReaderSettingsView.swift
│   ├── TTSControlView.swift
│   ├── CharacterMapView.swift
│   ├── StoryTimelineView.swift
│   └── ...
├── Library/         # 8 files
│   ├── LibraryView.swift
│   ├── BookDetailView.swift
│   ├── BrowseBooksView.swift
│   └── ...
├── Profile/         # 6 files
├── Auth/            # 4 files
├── Agora/           # 5 files
├── Me/              # 4 files
├── Settings/        # 5 files
├── Quotes/          # 3 files
├── Bookmarks/       # 3 files
├── Postcards/       # 3 files
└── ...

UI/Components/       # 8 files
Core/                # 5 files
```

---

## 2. 设计方案

### 2.1 技术方案

采用 **Apple 官方 String Catalog** 方案 (iOS 16+)：

```swift
// 使用方式
Text("reader.settings.title")  // SwiftUI 自动查找 Localizable.xcstrings

// 或者使用 String(localized:) API
let title = String(localized: "reader.settings.title")
```

**优势**：
- Xcode 原生支持，可视化编辑翻译
- 支持 pluralization 和 device variations
- 编译时检查 key 是否存在
- 与 SwiftUI 深度集成

### 2.2 Key 命名规范

采用层级结构命名：

```
{module}.{feature}.{component}.{element}
```

**示例**：

| Key | 英文 | 中文 |
|-----|------|------|
| `reader.settings.title` | Settings | 设置 |
| `reader.settings.speed` | Speed | 语速 |
| `reader.settings.voice` | Voice | 发音人 |
| `reader.tts.highlight` | Highlight | 高亮 |
| `library.tab.title` | Library | 书架 |
| `library.section.continueReading` | Continue Reading | 继续阅读 |
| `auth.button.signInGoogle` | Sign in with Google | 使用 Google 登录 |
| `auth.button.browseAsGuest` | Browse without signing in | 免登录浏览 |
| `common.button.cancel` | Cancel | 取消 |
| `common.button.confirm` | Confirm | 确认 |
| `common.button.delete` | Delete | 删除 |
| `error.network` | Network error | 网络错误 |
| `error.generic` | Something went wrong | 出错了 |

### 2.3 模块化 Key 分类

```
common.*           # 通用词汇 (Cancel, OK, Delete, etc.)
error.*            # 错误消息
alert.*            # Alert 标题和消息
nav.*              # 导航相关
tab.*              # Tab Bar 标签
auth.*             # 登录注册
reader.*           # 阅读器
library.*          # 书架
discover.*         # 发现页
profile.*          # 个人主页
settings.*         # 设置
agora.*            # Agora 社区
quotes.*           # 语录
bookmarks.*        # 书签
postcards.*        # 明信片
vocabulary.*       # 词汇表
subscription.*     # 订阅
```

---

## 3. 实施计划

### Phase 1: 基础设施完善

**目标**: 建立标准化的 i18n 工具和模式

| 任务 | 描述 |
|------|------|
| 1.1 | 创建 String Extension 简化使用 |
| 1.2 | 更新 LocalizationManager 添加调试模式 |
| 1.3 | 创建 i18n Key 常量文件 (可选) |
| 1.4 | 设置 Xcode 导出/导入翻译工作流 |

**String Extension 示例**：

```swift
extension String {
    var localized: String {
        String(localized: String.LocalizationValue(self))
    }

    func localized(with arguments: CVarArg...) -> String {
        String(format: self.localized, arguments: arguments)
    }
}

// 使用
Text("reader.settings.title".localized)
```

### Phase 2: 核心功能本地化 (高优先级)

| 模块 | 文件数 | 预估字符串 | 优先级 |
|------|--------|------------|--------|
| Auth | 4 | ~30 | P0 |
| Library | 8 | ~80 | P0 |
| Reader | 12 | ~200 | P0 |
| Tab Bar & Navigation | - | ~20 | P0 |
| Error Messages | 5 | ~40 | P0 |

### Phase 3: 扩展功能本地化 (中优先级)

| 模块 | 文件数 | 预估字符串 | 优先级 |
|------|--------|------------|--------|
| Profile | 6 | ~60 | P1 |
| Settings | 5 | ~50 | P1 |
| Discover | 5 | ~60 | P1 |
| Me | 4 | ~40 | P1 |

### Phase 4: 其他功能本地化 (低优先级)

| 模块 | 文件数 | 预估字符串 | 优先级 |
|------|--------|------------|--------|
| Agora | 5 | ~80 | P2 |
| Quotes | 3 | ~30 | P2 |
| Bookmarks | 3 | ~25 | P2 |
| Postcards | 3 | ~25 | P2 |
| Vocabulary | 4 | ~40 | P2 |
| Subscription/Paywall | 3 | ~30 | P2 |

### Phase 5: 翻译与测试

| 任务 | 描述 |
|------|------|
| 5.1 | 导出 XLIFF 文件供翻译 |
| 5.2 | 完成简体中文翻译 |
| 5.3 | 完成繁体中文翻译 |
| 5.4 | 各语言 UI 测试 (文字截断、布局问题) |
| 5.5 | RTL 语言预留 (如需支持阿拉伯语等) |

---

## 4. 具体文件修改示例

### 4.1 Before (ReaderSettingsView.swift)

```swift
struct ReaderSettingsView: View {
    var body: some View {
        List {
            Section("Speed") {
                Slider(value: $speed, in: 0.5...2.0)
                Text("Current: \(speed, specifier: "%.1f")x")
            }

            Section("Voice") {
                Picker("Select Voice", selection: $selectedVoice) {
                    ForEach(voices) { voice in
                        Text(voice.name)
                    }
                }
            }
        }
        .navigationTitle("Settings")
    }
}
```

### 4.2 After (ReaderSettingsView.swift)

```swift
struct ReaderSettingsView: View {
    var body: some View {
        List {
            Section("reader.settings.speed") {
                Slider(value: $speed, in: 0.5...2.0)
                Text("reader.settings.currentSpeed \(speed, specifier: "%.1f")")
            }

            Section("reader.settings.voice") {
                Picker("reader.settings.selectVoice", selection: $selectedVoice) {
                    ForEach(voices) { voice in
                        Text(voice.name) // 保持动态内容不变
                    }
                }
            }
        }
        .navigationTitle("reader.settings.title")
    }
}
```

### 4.3 Localizable.xcstrings 结构

```json
{
  "sourceLanguage": "en",
  "strings": {
    "reader.settings.title": {
      "localizations": {
        "en": { "stringUnit": { "state": "translated", "value": "Settings" } },
        "zh-Hans": { "stringUnit": { "state": "translated", "value": "设置" } },
        "zh-Hant": { "stringUnit": { "state": "translated", "value": "設定" } }
      }
    },
    "reader.settings.speed": {
      "localizations": {
        "en": { "stringUnit": { "state": "translated", "value": "Speed" } },
        "zh-Hans": { "stringUnit": { "state": "translated", "value": "语速" } },
        "zh-Hant": { "stringUnit": { "state": "translated", "value": "語速" } }
      }
    }
  }
}
```

---

## 5. 注意事项

### 5.1 不需要本地化的内容

- 动态数据 (书名、作者名、用户名等)
- 数字、日期 (使用 `NumberFormatter` / `DateFormatter`)
- 图标和 SF Symbols
- 第三方 SDK 内置文案

### 5.2 特殊处理

| 场景 | 处理方式 |
|------|---------|
| 带参数的字符串 | 使用 `String(localized:)` with interpolation |
| 复数形式 | 使用 xcstrings 的 plural 支持 |
| 设备适配 | 使用 xcstrings 的 device variations |
| 长文本截断 | UI 测试时检查各语言显示 |

**带参数示例**：

```swift
// xcstrings 中定义
"reader.progress": {
  "localizations": {
    "en": { "stringUnit": { "value": "Chapter %lld of %lld" } },
    "zh-Hans": { "stringUnit": { "value": "第 %lld 章，共 %lld 章" } }
  }
}

// 代码中使用
Text("reader.progress \(currentChapter) \(totalChapters)")
```

**复数形式示例**：

```swift
// xcstrings 中定义 (使用 stringsdict 或 xcstrings plural)
"library.bookCount": {
  "localizations": {
    "en": {
      "variations": {
        "plural": {
          "one": { "stringUnit": { "value": "%lld book" } },
          "other": { "stringUnit": { "value": "%lld books" } }
        }
      }
    }
  }
}
```

---

## 6. 验收标准

- [ ] 所有用户可见文本均已本地化
- [ ] 简体中文翻译完成率 100%
- [ ] 繁体中文翻译完成率 100%
- [ ] 切换语言后 UI 正确刷新
- [ ] 无文字截断或布局问题
- [ ] 错误消息正确显示对应语言

---

## 7. 后续扩展

- 支持更多语言 (日语、韩语等)
- 添加 RTL 语言支持 (阿拉伯语、希伯来语)
- 集成翻译管理平台 (Lokalise, Phrase 等)
- 添加 A/B 测试不同翻译版本

---

## 附录: 高优先级字符串清单

### Auth 模块

| Key | EN | ZH-Hans |
|-----|-----|---------|
| auth.welcome.title | AI-Powered English Learning Through Reading | AI 驱动的英语阅读学习 |
| auth.button.signInGoogle | Sign in with Google | 使用 Google 登录 |
| auth.button.signInApple | Sign in with Apple | 使用 Apple 登录 |
| auth.button.browseAsGuest | Browse without signing in | 免登录浏览 |

### Library 模块

| Key | EN | ZH-Hans |
|-----|-----|---------|
| library.section.continueReading | Continue Reading | 继续阅读 |
| library.section.myLibrary | My Library | 我的书架 |
| library.empty.title | Your library is empty | 书架空空如也 |
| library.empty.hint | Add books to start reading | 添加书籍开始阅读 |
| library.button.addToLibrary | Add to Library | 加入书架 |
| library.button.removeFromLibrary | Remove from Library | 从书架移除 |

### Reader 模块

| Key | EN | ZH-Hans |
|-----|-----|---------|
| reader.settings.title | Settings | 设置 |
| reader.settings.speed | Speed | 语速 |
| reader.settings.voice | Voice | 发音人 |
| reader.settings.highlight | Highlight | 高亮 |
| reader.tts.selectVoice | Select Voice | 选择发音人 |
| reader.characters.title | Characters | 人物 |
| reader.characters.analyzing | AI Analyzing Characters... | AI 正在分析人物... |
| reader.timeline.title | Story Timeline | 故事时间线 |

### Common

| Key | EN | ZH-Hans |
|-----|-----|---------|
| common.cancel | Cancel | 取消 |
| common.confirm | Confirm | 确认 |
| common.delete | Delete | 删除 |
| common.save | Save | 保存 |
| common.done | Done | 完成 |
| common.loading | Loading... | 加载中... |
| common.retry | Retry | 重试 |
| common.seeAll | See All | 查看全部 |

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | ✅ 完成 | 100% | 2025-12-27 | 翻译全部完成 |

### 已完成 ✅

- [x] LocalizationManager 基础设施搭建
- [x] 支持 English/简体中文/繁体中文 三种语言
- [x] String Extension `.localized` 实现
- [x] 语言切换功能实现
- [x] 用户语言偏好存储
- [x] Accept-Language Header 支持
- [x] 添加 333 个缺失翻译（2025-12-23）
- [x] 完成所有剩余翻译（2025-12-27）

### 翻译统计

| 指标 | 数量 |
|------|------|
| 总 Key 数量 | 1216 |
| zh-Hans 完成翻译 | 1216 |
| zh-Hant 完成翻译 | 1216 |
| 翻译完成率 | 100% |

### 进行中 🚧

- [ ] 验证所有 UI 界面语言显示正确
- [ ] 测试不同语言下的 UI 布局

### 待开发 📝

- [ ] 导出 XLIFF 供专业翻译审核
- [ ] 添加更多语言支持（日语、韩语等）
- [ ] RTL 语言支持准备
