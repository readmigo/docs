# 交互设计规范

### 18.1 手势交互系统

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Gesture Interaction System                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  阅读界面手势                                                            │
│  ══════════════                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │   ┌─────────────────────────────────────────────────────────┐   │    │
│  │   │                                                         │   │    │
│  │   │  ← 左滑    │  中心点击   │  右滑 →                      │   │    │
│  │   │  上一页    │  显示菜单   │  下一页                      │   │    │
│  │   │           │             │                              │   │    │
│  │   │  ───────────────────────────────────────────────────   │   │    │
│  │   │                                                         │   │    │
│  │   │  双指缩放   →  调整字体大小 (0.8x - 2.0x)               │   │    │
│  │   │  长按文字   →  进入选择模式                             │   │    │
│  │   │  双击单词   →  快速查词                                 │   │    │
│  │   │  三指下滑   →  快速返回书架                             │   │    │
│  │   │                                                         │   │    │
│  │   └─────────────────────────────────────────────────────────┘   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  手势识别参数                                                            │
│  ══════════════                                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  手势类型          参数                    阈值                 │    │
│  │  ────────────────────────────────────────────────────────────   │    │
│  │  Tap               单点触摸                < 200ms              │    │
│  │  Long Press        持续触摸                > 500ms              │    │
│  │  Swipe             水平移动                > 50pt, < 300ms      │    │
│  │  Pinch             双指距离变化            > 20pt               │    │
│  │  Double Tap        连续两次点击            < 300ms间隔          │    │
│  │  Pan               拖动                    任意距离             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 18.2 文字选择交互

```swift
// 文字选择状态机
enum TextSelectionState {
    case idle                    // 无选择
    case selecting               // 正在选择中
    case selected                // 已选择完成
    case menuVisible             // 菜单已显示
    case aiProcessing            // AI处理中
}

class TextSelectionStateMachine {
    private var currentState: TextSelectionState = .idle

    // 状态转换规则
    func transition(event: SelectionEvent) -> TextSelectionState {
        switch (currentState, event) {
        case (.idle, .longPress):
            return .selecting
        case (.idle, .doubleTap):
            return .selected  // 快速选择单词
        case (.selecting, .dragMove):
            return .selecting
        case (.selecting, .dragEnd):
            return .selected
        case (.selected, .tapOutside):
            return .idle
        case (.selected, .menuAction):
            return .menuVisible
        case (.menuVisible, .aiAction):
            return .aiProcessing
        case (.aiProcessing, .aiComplete):
            return .menuVisible
        default:
            return currentState
        }
    }
}

// 选择菜单配置
struct SelectionMenuConfig {
    static let menuItems: [MenuItem] = [
        MenuItem(icon: "book.fill", title: "查词", action: .lookup),
        MenuItem(icon: "doc.on.doc", title: "复制", action: .copy),
        MenuItem(icon: "highlighter", title: "高亮", action: .highlight),
        MenuItem(icon: "note.text", title: "笔记", action: .note),
        MenuItem(icon: "waveform", title: "朗读", action: .speak),
        MenuItem(icon: "brain", title: "AI解析", action: .aiAnalyze)
    ]

    // 菜单布局
    static let menuHeight: CGFloat = 44
    static let menuPadding: CGFloat = 8
    static let menuCornerRadius: CGFloat = 12
    static let menuShadowRadius: CGFloat = 8

    // 菜单位置策略
    static func calculatePosition(
        selectionRect: CGRect,
        containerBounds: CGRect
    ) -> CGPoint {
        let preferredY = selectionRect.minY - menuHeight - 8

        // 如果上方空间不足，显示在下方
        if preferredY < containerBounds.minY + 44 {
            return CGPoint(
                x: selectionRect.midX,
                y: selectionRect.maxY + 8
            )
        }

        return CGPoint(
            x: selectionRect.midX,
            y: preferredY
        )
    }
}
```

### 18.3 页面转场动画

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Page Transition Animations                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  翻页动画模式                                                            │
│  ══════════════                                                          │
│                                                                         │
│  1. 平滑滑动 (默认)                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                              │
│  │ Page 1  │ → │ Transit │ → │ Page 2  │                              │
│  │         │    │  ████   │    │         │                              │
│  └─────────┘    └─────────┘    └─────────┘                              │
│  动画参数: duration=0.25s, curve=easeOut                                 │
│                                                                         │
│  2. 仿真翻页                                                             │
│  ┌─────────┐    ┌────┐        ┌─────────┐                              │
│  │ Page 1  │ → │  ◢ │ curl → │ Page 2  │                              │
│  │         │    │    │        │         │                              │
│  └─────────┘    └────┘        └─────────┘                              │
│  动画参数: duration=0.4s, curl radius=50pt                               │
│                                                                         │
│  3. 淡入淡出                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                              │
│  │ Page 1  │ → │ Fade   │ → │ Page 2  │                              │
│  │ α=1.0   │    │ α=0.5   │    │ α=1.0   │                              │
│  └─────────┘    └─────────┘    └─────────┘                              │
│  动画参数: duration=0.2s, curve=linear                                   │
│                                                                         │
│  4. 垂直滚动 (长文模式)                                                   │
│  ┌─────────┐                                                            │
│  │ Content │ ↕ 连续滚动，无页面边界                                     │
│  │ ......  │   惯性减速: decelerationRate=0.998                         │
│  └─────────┘                                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

```swift
// 翻页动画实现
class PageTransitionAnimator {

    enum TransitionStyle {
        case slide      // 平滑滑动
        case curl       // 仿真翻页
        case fade       // 淡入淡出
        case scroll     // 连续滚动
    }

    func animate(
        from currentPage: UIView,
        to nextPage: UIView,
        style: TransitionStyle,
        direction: Direction,
        completion: @escaping () -> Void
    ) {
        switch style {
        case .slide:
            slideTransition(from: currentPage, to: nextPage, direction: direction, completion: completion)
        case .curl:
            curlTransition(from: currentPage, to: nextPage, direction: direction, completion: completion)
        case .fade:
            fadeTransition(from: currentPage, to: nextPage, completion: completion)
        case .scroll:
            // 滚动模式不需要页面切换动画
            break
        }
    }

    private func slideTransition(
        from current: UIView,
        to next: UIView,
        direction: Direction,
        completion: @escaping () -> Void
    ) {
        let offset = current.bounds.width * (direction == .forward ? 1 : -1)
        next.transform = CGAffineTransform(translationX: offset, y: 0)
        next.alpha = 1

        UIView.animate(
            withDuration: 0.25,
            delay: 0,
            options: [.curveEaseOut],
            animations: {
                current.transform = CGAffineTransform(translationX: -offset, y: 0)
                next.transform = .identity
            },
            completion: { _ in
                current.transform = .identity
                completion()
            }
        )
    }

    private func curlTransition(
        from current: UIView,
        to next: UIView,
        direction: Direction,
        completion: @escaping () -> Void
    ) {
        let options: UIView.AnimationOptions = direction == .forward
            ? .transitionCurlUp
            : .transitionCurlDown

        UIView.transition(
            from: current,
            to: next,
            duration: 0.4,
            options: [options, .showHideTransitionViews],
            completion: { _ in completion() }
        )
    }

    private func fadeTransition(
        from current: UIView,
        to next: UIView,
        completion: @escaping () -> Void
    ) {
        next.alpha = 0

        UIView.animate(
            withDuration: 0.2,
            animations: {
                current.alpha = 0
                next.alpha = 1
            },
            completion: { _ in
                current.alpha = 1
                completion()
            }
        )
    }
}
```

### 18.4 AI交互反馈设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI Interaction Feedback                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AI响应加载状态                                                          │
│  ════════════════                                                        │
│                                                                         │
│  阶段1: 发起请求 (0-0.3s)                                                │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  ○ ○ ○   正在思考...                               │                 │
│  │  ↑                                                 │                 │
│  │  脉冲动画 (品牌色)                                  │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                         │
│  阶段2: 等待响应 (0.3s-2s)                                               │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  ●○○ → ○●○ → ○○● → ●○○                              │                 │
│  │  AI正在分析文本...                                  │                 │
│  │  ████████████░░░░░░░░░░░░  45%                     │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                         │
│  阶段3: 流式输出 (2s+)                                                   │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  这个句子的语法结构是...                            │                 │
│  │  ▮  (光标闪烁，逐字显示)                           │                 │
│  │                                                    │                 │
│  │  打字机效果: 30字/秒                               │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                         │
│  错误状态处理                                                            │
│  ══════════════                                                          │
│                                                                         │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  ⚠️ 网络连接失败                                   │                 │
│  │                                                    │                 │
│  │  请检查您的网络连接后重试                          │                 │
│  │                                                    │                 │
│  │  [使用离线词典]    [重试]                          │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                         │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  ⏱️ AI响应超时                                    │                 │
│  │                                                    │                 │
│  │  服务器繁忙，已切换到备用服务                      │                 │
│  │                                                    │                 │
│  │  [继续等待]    [使用简化解释]                      │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

```swift
// AI响应流式显示
class StreamingTextView: UIView {

    private let textLabel = UILabel()
    private var displayLink: CADisplayLink?
    private var fullText: String = ""
    private var currentIndex: Int = 0
    private let charactersPerSecond: Double = 30

    func startStreaming(text: String) {
        fullText = text
        currentIndex = 0
        textLabel.text = ""

        displayLink = CADisplayLink(target: self, selector: #selector(updateText))
        displayLink?.add(to: .main, forMode: .common)
    }

    @objc private func updateText() {
        guard currentIndex < fullText.count else {
            displayLink?.invalidate()
            displayLink = nil
            onStreamingComplete?()
            return
        }

        let charactersToAdd = max(1, Int(charactersPerSecond / 60))
        let endIndex = min(currentIndex + charactersToAdd, fullText.count)
        let index = fullText.index(fullText.startIndex, offsetBy: endIndex)

        textLabel.text = String(fullText[..<index])
        currentIndex = endIndex

        // 触觉反馈 (可选，每句话结束时)
        if fullText[fullText.index(fullText.startIndex, offsetBy: max(0, endIndex - 1))] == "。" {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }
    }

    var onStreamingComplete: (() -> Void)?
}
```

### 18.5 微交互设计清单

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Micro-interaction Checklist                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  书架界面                                                                │
│  ──────────                                                              │
│  □ 书籍封面加载 → 从灰色占位图淡入                                       │
│  □ 下拉刷新 → 弹性动画 + 旋转图标                                        │
│  □ 书籍长按 → 放大1.05x + 显示操作菜单                                   │
│  □ 删除书籍 → 向左滑出 + 折叠消失                                        │
│  □ 切换排序 → 书籍位置重排动画                                           │
│  □ 搜索展开 → 输入框从顶部展开                                           │
│                                                                         │
│  阅读界面                                                                │
│  ──────────                                                              │
│  □ 打开书籍 → 封面展开过渡到阅读页                                       │
│  □ 翻页成功 → 轻微触觉反馈                                               │
│  □ 到达章节末 → 显示章节完成提示                                         │
│  □ 进度保存 → 底部短暂显示"已保存"                                       │
│  □ 字体调整 → 实时预览 + 滑块跟随                                        │
│  □ 主题切换 → 颜色平滑过渡 (0.3s)                                        │
│                                                                         │
│  AI功能                                                                  │
│  ────────                                                                │
│  □ 查词触发 → 选中文字高亮抖动                                           │
│  □ AI思考中 → 三点脉冲动画                                               │
│  □ 结果展示 → 卡片从下方滑入                                             │
│  □ 添加生词 → 单词飞入生词本图标                                         │
│  □ 发音播放 → 声波动画                                                   │
│                                                                         │
│  学习模块                                                                │
│  ──────────                                                              │
│  □ 卡片翻转 → 3D翻转动画                                                 │
│  □ 正确答案 → 绿色闪烁 + 成功音效                                        │
│  □ 错误答案 → 红色抖动 + 震动反馈                                        │
│  □ 完成复习 → 撒花/星星庆祝动画                                          │
│  □ 连胜达成 → 火焰图标 + 数字跳动                                        │
│                                                                         │
│  通用组件                                                                │
│  ──────────                                                              │
│  □ 按钮点击 → 缩放0.95 + 颜色变深                                        │
│  □ 开关切换 → 滑动 + 颜色渐变                                            │
│  □ 输入框聚焦 → 边框颜色变化                                             │
│  □ Toast显示 → 从顶部滑入 + 自动消失                                     │
│  □ 列表加载 → 骨架屏闪烁动画                                             │
│  □ 空状态 → 插图轻微浮动动画                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

