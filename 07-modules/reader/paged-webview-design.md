# Paged WebView Reader Design

## Overview

将阅读器统一为 WKWebView 渲染，支持 4 种翻页方式，实现一致的文本选择和 AI 功能体验。

## Reading Modes (4 Types Only)

| Mode | Description | Implementation |
|------|-------------|----------------|
| **仿真翻页** | 3D 翻页效果，模拟真实书页翻转 | CSS 3D Transform + JS |
| **左右滑动** | 水平滑动切换页面 | CSS Transform + JS |
| **上下滚动** | 连续垂直滚动（当前滚动模式） | Native scroll |
| **自动翻页** | 定时自动翻到下一页 | Timer + 左右滑动 |

**删除以下模式：**
- ~~fade（淡入淡出）~~
- ~~flip（翻转）~~
- ~~none（无动画）~~
- ~~垂直翻页~~

## Current vs Proposed

| Feature | Current | Proposed |
|---------|---------|----------|
| Scroll Mode | WKWebView | WKWebView (unchanged) |
| Paged Mode | SwiftUI Text | WKWebView |
| Text Selection | Different behavior | Unified |
| AI Features | Only in scroll | Both modes |
| Reading Modes | 7+ options | 4 options |

## Architecture

### Unified WebReaderView

```
ReaderView
    └── WebReaderView (UIViewRepresentable)
            ├── readingMode: ReadingMode
            │     ├── .curlPage        // 仿真翻页
            │     ├── .horizontalSlide // 左右滑动
            │     └── .verticalScroll  // 上下滚动
            ├── autoPageEnabled: Bool   // 自动翻页开关（独立设置）
            ├── autoPageInterval: TimeInterval
            ├── WKWebView
            └── Coordinator
```

### ReadingMode Enum (Simplified)

```swift
enum ReadingMode: String, CaseIterable, Codable {
    case curlPage = "curl"           // 仿真翻页
    case horizontalSlide = "slide"   // 左右滑动
    case verticalScroll = "scroll"   // 上下滚动

    var localizedName: String {
        switch self {
        case .curlPage: return "仿真翻页"
        case .horizontalSlide: return "左右滑动"
        case .verticalScroll: return "上下滚动"
        }
    }

    var isPaged: Bool {
        self != .verticalScroll
    }

    var supportsAutoPage: Bool {
        self != .verticalScroll  // 上下滚动不支持自动翻页
    }
}
```

### Auto Page Settings (Separate)

```swift
// In ThemeManager
@Published var autoPageEnabled: Bool = false
@Published var autoPageInterval: TimeInterval = 60 // seconds (15, 30, 60)
```

### Files to Delete/Simplify

```
DELETE:
- PagedReaderView.swift
- PageTurnAnimationModifier (in PagedReaderView)

SIMPLIFY:
- ThemeManager: Remove PageTurnStyle, PageSwipeDirection enums
- ReaderSettingsView: Simplify to 4 reading modes
```

## Implementation Details

### 1. 仿真翻页 (Curl Page)

CSS 3D 翻页效果：

```css
.page {
    transform-style: preserve-3d;
    transition: transform 0.6s ease-in-out;
}

.page.turning {
    transform: rotateY(-180deg);
    transform-origin: left center;
}

.page .front, .page .back {
    backface-visibility: hidden;
}

.page .back {
    transform: rotateY(180deg);
}
```

```javascript
function curlPageTurn(direction) {
    const currentPage = document.querySelector('.page.current');
    const nextPage = document.querySelector('.page.next');

    currentPage.classList.add('turning');

    setTimeout(() => {
        currentPage.classList.remove('current', 'turning');
        nextPage.classList.add('current');
        updatePageState();
    }, 600);
}
```

### 2. 左右滑动 (Horizontal Slide)

```css
.pages-container {
    display: flex;
    transition: transform 0.3s ease-out;
}

.page {
    flex: 0 0 100vw;
    min-width: 100vw;
}
```

```javascript
function slideTo(pageIndex) {
    const container = document.querySelector('.pages-container');
    const offset = pageIndex * window.innerWidth;
    container.style.transform = `translateX(-${offset}px)`;
}
```

### 3. 上下滚动 (Vertical Scroll)

```css
.scroll-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
```

```javascript
// Existing scroll tracking logic
window.addEventListener('scroll', function() {
    const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    webkit.messageHandlers.scroll.postMessage({ progress: progress });
});
```

### 4. 自动翻页 (Auto Page)

基于左右滑动模式 + 定时器：

```javascript
let autoPageTimer = null;
let autoPageInterval = 30000; // 30 seconds default

function startAutoPage(interval) {
    autoPageInterval = interval;
    autoPageTimer = setInterval(() => {
        if (!goToNextPage()) {
            // Reached chapter end
            stopAutoPage();
            webkit.messageHandlers.navigation.postMessage({event: 'autoPageEnd'});
        }
    }, autoPageInterval);
}

function stopAutoPage() {
    if (autoPageTimer) {
        clearInterval(autoPageTimer);
        autoPageTimer = null;
    }
}
```

Swift 端控制：

```swift
// Auto page settings
@Published var autoPageEnabled: Bool = false
@Published var autoPageInterval: TimeInterval = 30 // seconds

func toggleAutoPage() {
    autoPageEnabled.toggle()
    if autoPageEnabled {
        webView.evaluateJavaScript("startAutoPage(\(autoPageInterval * 1000))")
    } else {
        webView.evaluateJavaScript("stopAutoPage()")
    }
}
```

## Message Handlers

| Handler | Direction | Purpose |
|---------|-----------|---------|
| `textSelection` | JS → Swift | Selected text + sentence |
| `tap` | JS → Swift | Tap for menu toggle |
| `scroll` | JS → Swift | Scroll progress (vertical scroll mode) |
| `pageChange` | JS → Swift | Page change (paged modes) |
| `navigation` | JS → Swift | Reach chapter start/end, auto page end |
| `log` | JS → Swift | Debug logging |

## UI: Reader Settings

简化后的阅读设置界面：

```
┌─────────────────────────────────┐
│ 阅读设置                         │
├─────────────────────────────────┤
│ 翻页方式                 [自动⏱]│  ← 自动翻页按钮在右上角
│ ┌───────┐ ┌───────┐ ┌───────┐  │
│ │ 仿真  │ │ 左右  │ │ 上下  │  │
│ │ 翻页  │ │ 滑动  │ │ 滚动  │  │
│ └───────┘ └───────┘ └───────┘  │
│                                 │
│ ┌─────────────────────────────┐ │  ← 仅当自动翻页开启时显示
│ │ 自动翻页间隔                 │ │
│ │ ○ 15秒  ○ 30秒  ● 60秒      │ │
│ └─────────────────────────────┘ │
│                                 │
│ 字体大小                         │
│ [━━━━━━━●━━━━━━━]               │
│                                 │
│ 字体                            │
│ [System ▼]                      │
│                                 │
│ 主题                            │
│ ○ 浅色  ○ 深色  ○ 护眼          │
└─────────────────────────────────┘
```

**自动翻页按钮说明：**
- 位于"翻页方式"标题右侧
- 点击切换自动翻页开/关
- 开启时显示计时器图标 ⏱ 和倒计时
- 仅在仿真翻页/左右滑动模式下可用（上下滚动模式禁用）

## Migration Plan

### Phase 1: Simplify Existing Code
1. Update `ReadingMode` enum to 4 options
2. Update `ThemeManager` - remove unused enums
3. Update `ReaderSettingsView` - simplify UI

### Phase 2: Create Unified WebReaderView
1. Extend `ReaderContentView` to support paged modes
2. Implement curl page animation
3. Implement horizontal slide
4. Implement auto page timer
5. Add page change message handler

### Phase 3: Integration
1. Update `ReaderView` to use unified component
2. Delete `PagedReaderView.swift`
3. Test all 4 modes

### Phase 4: Cleanup
1. Remove debug logs
2. Remove unused code

## Files Changed

| File | Action |
|------|--------|
| `ReaderContentView.swift` | Extend to support all 4 modes |
| `PagedReaderView.swift` | **DELETE** |
| `ThemeManager.swift` | Simplify - remove `PageTurnStyle`, `PageSwipeDirection` |
| `ReaderSettingsView.swift` | Simplify to 4 mode selection |
| `ReaderView.swift` | Update to use unified component |

## Timeline

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Simplify | 1 hour |
| Phase 2: WebReaderView | 3-4 hours |
| Phase 3: Integration | 1 hour |
| Phase 4: Cleanup | 30 min |
| **Total** | **5-6 hours** |
