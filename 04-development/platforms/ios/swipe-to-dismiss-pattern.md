# Swipe to Dismiss Pattern

本文档描述了 iOS 端全屏模态视图的下滑关闭交互实现方式。

## 概述

当视图以 `.fullScreenCover` 方式呈现时，用户可以通过向下拖动手势关闭视图。这个交互模式被应用于：

- `BookDetailView` (书籍详情页)
- `AuthorProfileView` (作者详情页)
- `AudiobookPlayerView` (有声书播放页)

## 实现方式

### 1. 状态变量

```swift
// 拖动偏移量
@State private var dragOffset: CGFloat = 0

// 标记是否正在进行关闭拖拽
@State private var isDraggingToDismiss = false

// 触发关闭的阈值（像素）
private let dismissThreshold: CGFloat = 150
```

### 2. 视图结构

视图结构根据 `presentedAsFullScreen` 参数决定是否使用全屏模式：

```swift
var body: some View {
    Group {
        if presentedAsFullScreen {
            fullScreenContent  // 带手势返回的全屏模式
        } else {
            mainContent        // 普通导航模式
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}
```

全屏内容的具体实现：

```swift
@ViewBuilder
private var fullScreenContent: some View {
    GeometryReader { geometry in
        NavigationStack {
            mainContent
                .navigationTitle("标题")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "chevron.down")
                                .font(.body.weight(.semibold))
                                .foregroundColor(.primary)
                        }
                    }
                }
        }
        .frame(width: geometry.size.width, height: geometry.size.height)
        .background(Color(.systemBackground))
        .cornerRadius(dragOffset > 0 ? 20 : 0)  // 拖动时添加圆角
        .offset(y: dragOffset)                   // 跟随手指偏移
        .gesture(
            DragGesture()
                .onChanged { value in
                    if value.translation.height > 0 {
                        isDraggingToDismiss = true
                        let resistance: CGFloat = 0.6
                        dragOffset = value.translation.height * resistance
                    }
                }
                .onEnded { value in
                    if dragOffset > dismissThreshold {
                        withAnimation(.easeOut(duration: 0.25)) {
                            dragOffset = geometry.size.height
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                            dismiss()
                        }
                    } else {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            dragOffset = 0
                        }
                    }
                    isDraggingToDismiss = false
                }
        )
    }
    .ignoresSafeArea()
}
```

### 3. 初始化参数

`BookDetailView` 和 `AuthorProfileView` 都支持 `presentedAsFullScreen` 参数：

```swift
// BookDetailView
init(book: Book, presentedAsFullScreen: Bool = false) {
    self.book = book
    self.presentedAsFullScreen = presentedAsFullScreen
}

// AuthorProfileView
init(authorId: String, presentedAsFullScreen: Bool = false) {
    self.authorId = authorId
    self.presentedAsFullScreen = presentedAsFullScreen
}
```

### 4. 使用示例

```swift
// 作为全屏模态展示（带手势返回）
.fullScreenCover(isPresented: $showBookDetail) {
    BookDetailView(book: selectedBook, presentedAsFullScreen: true)
}

// 作为导航目标展示（使用系统返回手势）
NavigationLink {
    BookDetailView(book: book)  // presentedAsFullScreen 默认为 false
} label: {
    BookCard(book: book)
}
```

## 关键设计点

### 阻力系数 (Resistance)

使用 `0.6` 的阻力系数，让拖动时视图移动距离小于手指移动距离，产生"弹性"感觉：

```swift
dragOffset = value.translation.height * 0.6
```

### 圆角动画

拖动开始时添加圆角，视觉上暗示视图正在"脱离"：

```swift
.cornerRadius(dragOffset > 0 ? 20 : 0)
```

### 弹簧动画

弹回时使用弹簧动画，产生自然的物理效果：

```swift
.spring(response: 0.3, dampingFraction: 0.7)
```

- `response: 0.3` - 动画持续时间
- `dampingFraction: 0.7` - 阻尼系数，防止过度弹跳

### 关闭阈值

150pt 是经过测试的合理阈值：
- 足够大，避免误触发
- 足够小，用户轻松达到

## 三个视图的实现对比

### BookDetailView 实现特点

- 使用 `presentedAsFullScreen` 参数控制展示模式
- 全屏模式下导航栏左侧显示向下箭头按钮
- 背景色使用 `Color(.systemBackground)`
- 手势直接内联在 `.gesture()` 修饰符中

**代码位置**：`ios/Readmigo/Features/Library/BookDetailView.swift` 第74-123行

### AuthorProfileView 实现特点

- 与 BookDetailView 实现完全一致
- 同样使用 `presentedAsFullScreen` 参数
- 包含丰富的动画状态（头像、名称、标签等渐入动画）
- 背景色使用 `Color(.systemBackground)`

**代码位置**：`ios/Readmigo/Features/Authors/AuthorProfileView.swift` 第129-178行

### AudiobookPlayerView 实现特点

- **始终以全屏模式展示**，无需 `presentedAsFullScreen` 参数
- **使用 NavigationStack**（与文档描述不同）
- **导航栏样式**：使用 `.toolbarBackground(.hidden, for: .navigationBar)` 隐藏导航栏背景
- **关闭按钮**：`.primary` 颜色向下箭头，通过 toolbar 添加（与其他视图保持一致）
- **背景色**：`Color(.systemBackground)` 系统背景色（与其他视图保持一致）
- 手势实现与其他两个视图完全一致

**代码位置**：`ios/Readmigo/Features/Audiobook/AudiobookPlayerView.swift` 第17-125行

## 文档与实际实现的差异

> ⚠️ **重要**：以下是文档之前的描述与实际代码实现的差异，需要 review。

### AudiobookPlayerView 差异分析

| 项目 | 文档描述 | 实际实现 |
|------|---------|----------|
| 导航栏类型 | 自定义浮动按钮 | NavigationStack + toolbar（与其他视图一致） |
| Safe Area 处理 | 需要手动使用 UIKit 获取 | 使用 `.ignoresSafeArea()` 即可 |
| 关闭按钮位置 | 自定义浮动顶部栏 | 通过 toolbar 添加 |

### 删除的代码（实际不存在）

文档中描述的以下代码在实际实现中**不存在**：

```swift
// ❌ 实际代码中不存在此实现
private var topSafeAreaInset: CGFloat {
    UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .first?
        .windows
        .first { $0.isKeyWindow }?
        .safeAreaInsets.top ?? 47
}
```

### 实际的 AudiobookPlayerView 结构

```swift
var body: some View {
    GeometryReader { geometry in
        NavigationStack {
            ZStack {
                // 主要内容
                ScrollView {
                    // ...播放器 UI
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)  // 隐藏导航栏背景
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.down")
                            .font(.body.weight(.semibold))
                            .foregroundColor(.primary)  // 与其他视图保持一致
                    }
                }
                // ...其他 toolbar items
            }
        }
        .frame(width: geometry.size.width, height: geometry.size.height)
        .background(Color(.systemBackground))  // 系统背景色，与其他视图保持一致
        .cornerRadius(dragOffset > 0 ? 20 : 0)
        .offset(y: dragOffset)
        .gesture(/* 与其他视图相同的手势处理 */)
    }
    .ignoresSafeArea()
}
```

## 使用场景总结

| 场景 | 导航栏类型 | 背景色 | 关闭按钮颜色 |
|------|----------|--------|-------------|
| BookDetailView | NavigationStack + 隐藏背景的 toolbar | 系统背景 | `.primary` |
| AuthorProfileView | NavigationStack + 隐藏背景的 toolbar | 系统背景 | `.primary` |
| AudiobookPlayerView | NavigationStack + 隐藏背景的 toolbar | 系统背景 | `.primary` |

## 修改计划

### 已实现的功能：下滑手势返回 ✅

三个视图（`BookDetailView`、`AuthorProfileView`、`AudiobookPlayerView`）的**下滑手势返回功能已完全对齐**，使用相同的实现：

```swift
.gesture(
    DragGesture()
        .onChanged { value in
            if value.translation.height > 0 {
                isDraggingToDismiss = true
                let resistance: CGFloat = 0.6
                dragOffset = value.translation.height * resistance
            }
        }
        .onEnded { value in
            if dragOffset > dismissThreshold {  // dismissThreshold = 150
                withAnimation(.easeOut(duration: 0.25)) {
                    dragOffset = geometry.size.height
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                    dismiss()
                }
            } else {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    dragOffset = 0
                }
            }
            isDraggingToDismiss = false
        }
)
```

**核心参数一致性**：
| 参数 | 值 | 说明 |
|------|-----|------|
| resistance | 0.6 | 阻力系数，拖动有弹性感 |
| dismissThreshold | 150pt | 触发关闭的阈值 |
| 关闭动画 | easeOut(0.25s) | 滑出屏幕的动画 |
| 回弹动画 | spring(0.3, 0.7) | 未达阈值时的回弹效果 |

### 待修改：导航栏样式统一

#### 背景说明

当前 `BookDetailView` 和 `AuthorProfileView` 在全屏模式下使用默认的导航栏样式，导航栏有背景色，视觉上与页面内容有明显分隔。而 `AudiobookPlayerView` 使用了 `.toolbarBackground(.hidden, for: .navigationBar)` 隐藏导航栏背景，实现了沉浸式效果。

为了保持三个全屏视图的视觉一致性，需要统一使用隐藏背景的导航栏样式：

- **沉浸式体验**：隐藏导航栏背景后，页面内容可以延伸到顶部，特别是对于有头部背景图的页面（如书籍详情的封面区域、作者详情的头像区域）效果更佳
- **统一交互**：三个视图都支持下滑手势关闭，使用统一的导航栏样式可以让用户形成一致的操作预期
- **现代 iOS 设计**：隐藏背景的导航栏更符合 iOS 现代设计语言，提供更沉浸的阅读体验

#### 1. BookDetailView 和 AuthorProfileView 导航栏优化

将导航栏背景隐藏，使用透明效果，与 `AudiobookPlayerView` 对齐：

```swift
NavigationStack {
    mainContent
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)  // 新增：隐藏导航栏背景
        .toolbar {
            // ...
        }
}
```

#### 2. AudiobookPlayerView 关闭按钮对齐 ✅ 已完成

将关闭按钮颜色从 `.white` 改为 `.primary`，与其他视图保持一致：

```swift
// 修改前
Image(systemName: "chevron.down")
    .font(.body.weight(.semibold))
    .foregroundColor(.white)

// 修改后
Image(systemName: "chevron.down")
    .font(.body.weight(.semibold))
    .foregroundColor(.primary)
```

#### 3. AudiobookPlayerView 背景色统一

将背景色从黑色 + 封面模糊改为系统背景，与 `BookDetailView` 和 `AuthorProfileView` 保持一致：

```swift
// 修改前
.background(Color.black)

// 修改后
.background(Color(.systemBackground))
```

同时移除或调整沉浸式背景效果 `immersiveBackground`，使其与其他视图的视觉风格一致。

## 完整示例

参考文件：
- `ios/Readmigo/Features/Library/BookDetailView.swift` - 第74-123行
- `ios/Readmigo/Features/Authors/AuthorProfileView.swift` - 第129-178行
- `ios/Readmigo/Features/Audiobook/AudiobookPlayerView.swift` - 第17-125行
