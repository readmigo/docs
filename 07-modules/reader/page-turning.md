# 物理级翻页动画系统

> 目标: 实现业界最逼真的翻页动画，包含物理模拟、光影效果、声音反馈

---

## 架构概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PageTurnEngine                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         PhysicsSimulator                                 ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        ││
│  │  │ 纸张刚度   │  │ 重力模拟   │  │ 惯性系统   │  │ 弹性形变   │        ││
│  │  │ Stiffness  │  │ Gravity    │  │ Inertia    │  │ Elasticity │        ││
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         RenderingPipeline                                ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        ││
│  │  │ 页面网格   │  │ 光影计算   │  │ 纹理映射   │  │ 阴影投射   │        ││
│  │  │ PageMesh   │  │ Lighting   │  │ Texture    │  │ Shadow     │        ││
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         FeedbackSystem                                   ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                         ││
│  │  │ 触觉反馈   │  │ 翻页声效   │  │ 纸张纹理   │                         ││
│  │  │ Haptic     │  │ Sound      │  │ Texture    │                         ││
│  │  └────────────┘  └────────────┘  └────────────┘                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 翻页模式全集

```swift
enum PageTurnMode: String, CaseIterable, Codable {
    // 基础模式
    case scroll = "scroll"              // 垂直滚动
    case slide = "slide"                // 左右滑动
    case fade = "fade"                  // 淡入淡出
    case none = "none"                  // 无动画

    // 高级模式（超越竞品）
    case pageCurl = "page_curl"         // 3D 卷曲
    case realistic = "realistic"        // 物理仿真（独创）
    case flip = "flip"                  // 3D 翻转
    case cover = "cover"                // 封面翻转
    case accordion = "accordion"        // 手风琴
    case cube = "cube"                  // 3D 立方体

    var displayName: String {
        switch self {
        case .scroll: return "垂直滚动"
        case .slide: return "左右滑动"
        case .fade: return "淡入淡出"
        case .none: return "无动画"
        case .pageCurl: return "3D 卷页"
        case .realistic: return "真实翻页"
        case .flip: return "3D 翻转"
        case .cover: return "封面翻转"
        case .accordion: return "手风琴"
        case .cube: return "3D 立方体"
        }
    }

    var hasPhysics: Bool {
        switch self {
        case .pageCurl, .realistic, .flip: return true
        default: return false
        }
    }

    var hasSound: Bool {
        switch self {
        case .pageCurl, .realistic: return true
        default: return false
        }
    }
}
```

---

## 物理仿真翻页引擎

> 独创功能：真实物理模拟

```swift
class RealisticPageTurnEngine: ObservableObject {
    // 物理参数
    @Published var paperStiffness: CGFloat = 0.8      // 纸张刚度 (0-1)
    @Published var pageWeight: CGFloat = 0.5          // 页面重量
    @Published var airResistance: CGFloat = 0.3       // 空气阻力
    @Published var gravity: CGFloat = 9.8             // 重力加速度

    // 状态
    @Published var currentProgress: CGFloat = 0       // 翻页进度 (0-1)
    @Published var velocity: CGFloat = 0              // 当前速度
    @Published var isAnimating: Bool = false

    // 网格数据
    private var meshPoints: [[CGPoint]] = []          // 页面网格点
    private let meshResolution = 20                   // 网格精度

    func updatePhysics(deltaTime: TimeInterval) {
        // 1. 计算重力影响
        let gravityForce = gravity * pageWeight * sin(currentProgress * .pi / 2)

        // 2. 计算空气阻力
        let dragForce = -airResistance * velocity * abs(velocity)

        // 3. 计算纸张恢复力（刚度）
        let restoreForce = paperStiffness * (currentProgress > 0.5 ? (1 - currentProgress) : -currentProgress)

        // 4. 总力和加速度
        let totalForce = gravityForce + dragForce + restoreForce
        let acceleration = totalForce / pageWeight

        // 5. 更新速度和位置
        velocity += acceleration * CGFloat(deltaTime)
        currentProgress += velocity * CGFloat(deltaTime)
    }
}
```

---

## 3D 渲染管线

使用 Metal 着色器实现逼真的光影效果：

```swift
class Page3DRenderer {
    // 光照参数
    var lightPosition: SIMD3<Float> = [0, 0, 100]
    var ambientLight: Float = 0.3
    var diffuseLight: Float = 0.7
    var specularLight: Float = 0.5

    // 页面着色器 - Phong 光照模型
    // - 环境光
    // - 漫反射
    // - 镜面高光
}
```

---

## 翻页声效系统

```swift
class PageTurnSoundEngine {
    enum SoundType: String {
        case pageTurnSoft = "page_turn_soft"     // 柔和音
        case pageTurnCrisp = "page_turn_crisp"   // 清脆音
        case pageTurnThick = "page_turn_thick"   // 厚重音
        case pageRustle = "page_rustle"          // 沙沙声
        case bookOpen = "book_open"
        case bookClose = "book_close"
    }

    /// 根据翻页速度选择音效
    func playPageTurnSound(velocity: CGFloat) {
        if abs(velocity) > 2.0 {
            playSound(.pageTurnCrisp)  // 快速翻页 - 清脆音
        } else if abs(velocity) > 0.5 {
            playSound(.pageTurnSoft)   // 正常翻页 - 柔和音
        } else {
            playSound(.pageRustle)     // 慢速翻页 - 沙沙声
        }
    }

    /// 实时纸张摩擦声（跟随手指）
    func playRealtimeRustle(intensity: CGFloat)
}
```

---

## 触觉反馈系统

```swift
class PageTurnHapticEngine {
    /// 翻页完成触觉 - 模拟纸张翻转的触感
    func playPageTurnHaptic() {
        let events = [
            // 开始接触
            CHHapticEvent(eventType: .hapticTransient, relativeTime: 0),
            // 翻转中
            CHHapticEvent(eventType: .hapticContinuous, relativeTime: 0.05, duration: 0.15),
            // 落下
            CHHapticEvent(eventType: .hapticTransient, relativeTime: 0.2)
        ]
        // 播放触觉模式
    }

    /// 实时触觉反馈（跟随手指拖动）
    func playDragHaptic(progress: CGFloat)
}
```

---

## 翻页设置

```swift
struct PageTurnSettings: Codable {
    var mode: PageTurnMode = .realistic
    var enableSound: Bool = true
    var enableHaptic: Bool = true
    var soundVolume: Float = 0.7
    var animationSpeed: CGFloat = 1.0       // 0.5 - 2.0
    var paperStiffness: CGFloat = 0.8       // 纸张硬度
    var enableShadow: Bool = true
    var enableLighting: Bool = true
}
```

---

## 相关文档

- [渲染引擎](./rendering-engine.md) - 多格式渲染引擎设计
- [字体管理](./font-management.md) - 超级字体管理系统
- [阅读器架构](./architecture.md) - 核心架构设计

---

*最后更新: 2025-12-26*
