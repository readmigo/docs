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

### Auto Page Settings (Separate)

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

### 2. 左右滑动 (Horizontal Slide)

### 3. 上下滚动 (Vertical Scroll)

### 4. 自动翻页 (Auto Page)

基于左右滑动模式 + 定时器：

Swift 端控制：

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
