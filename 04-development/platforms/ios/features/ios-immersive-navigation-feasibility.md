# iOS 书籍详情页沉浸式导航方案

## 方案对比评估

### iOS 版本市场份额 (2025年数据)

```
┌────────────────────────────────────────────────────────────┐
│                    iOS 版本分布                             │
├────────────────────────────────────────────────────────────┤
│  iOS 18.x  ████████████████████████████████████  ~70%      │
│  iOS 17.x  ████████                              ~15%      │
│  iOS 16.x  █████                                 ~10%      │
│  iOS 15-   ███                                   ~5%       │
│  iOS 26    █                                     ~新发布    │
└────────────────────────────────────────────────────────────┘
```

| iOS 版本 | 市场份额 | 覆盖用户 |
| -------- | -------- | -------- |
| iOS 18+ | ~82-88% | 绝大多数活跃用户 |
| iOS 17+ | ~95%+ | 几乎全部用户 |
| iOS 26 | 新发布 | 早期采用者 (~10-15%) |

> 数据来源: [Statcounter](https://gs.statcounter.com/ios-version-market-share/), [TelemetryDeck](https://telemetrydeck.com/survey/apple/iOS/majorSystemVersions/), [Apple Developer](https://developer.apple.com/support/app-store/)

---

## 方案 A: iOS 18+ onScrollGeometryChange (推荐)

### 优势

| 特性 | 说明 |
| ---- | ---- |
| 用户覆盖 | 82-88% 活跃用户 |
| 稳定性 | 已发布1年+，API成熟稳定 |
| 文档完善 | 大量教程和最佳实践 |
| 无第三方依赖 | 原生 API |

### 劣势

- 需要手动实现毛玻璃效果
- 不会自动获得 iOS 26 的新设计语言

---

## 方案 B: iOS 26 Liquid Glass

### 什么是 Liquid Glass

iOS 26 (WWDC 2025) 引入的全新设计语言，是 iOS 7 以来最大的视觉革新：

```
┌─────────────────────────────────────────────────────────┐
│                    Liquid Glass 特性                    │
├─────────────────────────────────────────────────────────┤
│  • 动态半透明材质，自动适应底层内容                        │
│  • 导航栏/工具栏自动继承 Glass 效果                       │
│  • 滚动时自动触发 Scroll Edge Effect (模糊渐变)          │
│  • Tab Bar 滚动时自动最小化                              │
│  • 系统级过渡动画 (Morph Effect)                         │
└─────────────────────────────────────────────────────────┘
```

### 核心 API

```swift
// 1. Scroll Edge Effect 控制
.scrollEdgeEffectStyle(.soft, for: .top)    // 柔和模糊
.scrollEdgeEffectStyle(.hard, for: .bottom) // 硬边缘

// 2. Glass Effect
.glassEffect(.regular)
.glassEffect(.prominent)

// 3. Tab Bar 最小化
TabView { }
    .tabBarMinimizeBehavior(.onScrollDown)

// 4. 导航过渡动画
.navigationTransition(.zoom(sourceID: id, in: namespace))
```

### 优势

| 特性 | 说明 |
| ---- | ---- |
| 零代码适配 | 使用标准 NavigationStack 自动获得效果 |
| 系统一致性 | 与系统 App 视觉完全一致 |
| 未来主流 | 1-2年后将成为主流设计 |
| 自动深浅色 | Glass 材质自动适应内容 |

### 劣势

| 问题 | 影响 |
| ---- | ---- |
| 用户覆盖极低 | 当前仅 ~10-15% 早期采用者 |
| API 不稳定 | Beta 阶段可能有变动 |
| 需要 Xcode 17 | 开发环境要求更高 |

---

## 综合评估矩阵

| 评估维度 | iOS 18 方案 | iOS 26 Liquid Glass |
| -------- | ----------- | ------------------- |
| 用户覆盖 | ⭐⭐⭐⭐⭐ 82%+ | ⭐ ~15% |
| 实现复杂度 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 极简 |
| 视觉效果 | ⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 顶级 |
| API 稳定性 | ⭐⭐⭐⭐⭐ 成熟 | ⭐⭐⭐ Beta |
| 未来兼容 | ⭐⭐⭐ 需升级 | ⭐⭐⭐⭐⭐ 原生 |
| 开发成本 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 低 |

---

## 推荐策略: 渐进式适配

```
┌─────────────────────────────────────────────────────────────┐
│                      推荐实现策略                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   if #available(iOS 26, *) {                                │
│       // 使用原生 Liquid Glass (零代码)                      │
│       standardNavigationStack                               │
│   } else if #available(iOS 18, *) {                         │
│       // 使用 onScrollGeometryChange 自定义实现              │
│       ios18ImmersiveContent                                 │
│   } else {                                                  │
│       // iOS 17 及以下：标准导航栏                            │
│       fallbackContent                                       │
│   }                                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 实现优先级

| 阶段 | 目标 | 用户覆盖 |
| ---- | ---- | -------- |
| Phase 1 | iOS 18+ onScrollGeometryChange | 82%+ |
| Phase 2 | iOS 26 Liquid Glass 适配 | +15% |
| Phase 3 | iOS 17 降级方案 (可选) | +10% |

---

## 最终建议

### 当前推荐: iOS 18+ 方案

**理由**:

1. **用户覆盖**: 82-88% 活跃用户
2. **ROI 最优**: 实现成本 vs 用户覆盖比最佳
3. **API 成熟**: 无需担心 Breaking Changes
4. **可升级**: 未来可平滑过渡到 iOS 26

### iOS 26 Liquid Glass 时机

建议在以下条件满足时启用:

- iOS 26 市场份额 > 50% (预计 2026 Q3)
- 或产品定位为高端用户 (愿意承担低覆盖风险)

---

## 参考资料

- [Grow on iOS 26 - Liquid Glass Adaptation](https://fatbobman.com/en/posts/grow-on-ios26)
- [Apple Liquid Glass Documentation](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)
- [WWDC25: Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/)
- [iOS Version Market Share - Statcounter](https://gs.statcounter.com/ios-version-market-share/)
- [iOS Adoption Rates - Business of Apps](https://www.businessofapps.com/data/ios-version-adoption-rates/)
