# iOS 开发环境配置

> Xcode + Swift Package Manager + 开发工具

---

## 1. 环境要求

```
┌─────────────────────────────────────────────────────────────────┐
│                    开发环境要求                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  硬件要求                                                        │
│  ├── Mac (Apple Silicon 或 Intel)                              │
│  ├── 内存: 16GB+ (推荐 32GB)                                    │
│  ├── 存储: 256GB+ 可用空间                                      │
│  └── 显示器: 1920x1080+                                         │
│                                                                  │
│  软件要求                                                        │
│  ├── macOS: Sonoma 14.0+                                        │
│  ├── Xcode: 15.0+                                               │
│  ├── Swift: 5.9+                                                │
│  ├── iOS SDK: 17.0+                                             │
│  └── Git: 2.40+                                                 │
│                                                                  │
│  推荐工具                                                        │
│  ├── Homebrew                                                   │
│  ├── Bundler                                                    │
│  ├── Fastlane                                                   │
│  └── SwiftLint                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Xcode 配置

### 2.1 Xcode 安装

| 安装方式 | 说明 |
|----------|------|
| App Store | 官方稳定版 |
| Apple Developer | 下载特定版本 |
| xcodes CLI | 版本管理工具 |

### 2.2 Xcode 设置

```
┌─────────────────────────────────────────────────────────────────┐
│                    Xcode 推荐配置                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  General                                                        │
│  ├── Show build times                                          │
│  └── Continue building after errors                            │
│                                                                  │
│  Text Editing                                                   │
│  ├── Show line numbers                                         │
│  ├── Show code folding ribbon                                  │
│  ├── Automatically trim trailing whitespace                   │
│  └── Including whitespace-only lines                           │
│                                                                  │
│  Indentation                                                    │
│  ├── Prefer indent using: Spaces                               │
│  ├── Tab width: 4                                              │
│  └── Indent width: 4                                           │
│                                                                  │
│  Behaviors                                                      │
│  ├── Build Starts: Show navigator                              │
│  ├── Build Fails: Play sound                                   │
│  └── Testing Fails: Show issue navigator                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 项目配置

### 3.1 项目结构

```
ios/
├── Readmigo.xcodeproj            # Xcode 项目文件
├── Readmigo.xcworkspace          # 工作区 (如使用 CocoaPods)
├── Readmigo/                     # 主应用代码
│   ├── App/                      # 应用入口
│   ├── Core/                     # 核心模块
│   ├── Features/                 # 功能模块
│   └── Resources/                # 资源文件
├── ReadmigoTests/                # 单元测试
├── ReadmigoUITests/              # UI 测试
├── Packages/                     # 本地 Swift Packages
├── fastlane/                     # Fastlane 配置
└── scripts/                      # 脚本文件
```

### 3.2 Build Settings

| 设置 | Debug | Release |
|------|-------|---------|
| Optimization Level | None | Fastest, Smallest |
| Swift Compilation Mode | Incremental | Whole Module |
| Enable Testability | Yes | No |
| Debug Information | DWARF with dSYM | DWARF with dSYM |

---

## 4. 依赖管理

### 4.1 Swift Package Manager

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPM 依赖管理                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  添加依赖                                                        │
│  ├── File → Add Package Dependencies                           │
│  ├── 输入 Package URL                                           │
│  ├── 选择版本规则                                                │
│  └── 选择目标 Target                                            │
│                                                                  │
│  版本规则                                                        │
│  ├── Up to Next Major      1.0.0 ..< 2.0.0                     │
│  ├── Up to Next Minor      1.0.0 ..< 1.1.0                     │
│  ├── Exact Version         1.0.0                               │
│  └── Branch / Commit       main / abc123                       │
│                                                                  │
│  本地 Package                                                    │
│  ├── 拖入 Xcode                                                 │
│  └── 或在 Package.swift 使用 path:                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 核心依赖

| 依赖 | 用途 |
|------|------|
| Alamofire | 网络请求 |
| Kingfisher | 图片加载 |
| SwiftUIX | SwiftUI 扩展 |
| KeychainAccess | Keychain 访问 |
| Firebase | 分析/崩溃 |

---

## 5. 代码规范

### 5.1 SwiftLint 配置

```
┌─────────────────────────────────────────────────────────────────┐
│                    SwiftLint 配置                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  安装                                                            │
│  brew install swiftlint                                        │
│                                                                  │
│  Xcode 集成                                                      │
│  Build Phases → New Run Script Phase                           │
│  if which swiftlint > /dev/null; then                          │
│      swiftlint                                                  │
│  fi                                                             │
│                                                                  │
│  .swiftlint.yml 配置示例                                        │
│  ├── disabled_rules                                            │
│  │   ├── trailing_whitespace                                   │
│  │   └── line_length                                           │
│  │                                                              │
│  ├── opt_in_rules                                              │
│  │   ├── empty_count                                           │
│  │   ├── explicit_init                                         │
│  │   └── closure_spacing                                       │
│  │                                                              │
│  ├── excluded                                                  │
│  │   ├── Pods                                                  │
│  │   └── Generated                                             │
│  │                                                              │
│  └── line_length: 120                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 代码格式化

| 工具 | 用途 |
|------|------|
| SwiftFormat | 代码格式化 |
| SwiftLint | 代码规范检查 |
| Periphery | 未使用代码检测 |

---

## 6. 签名配置

### 6.1 证书管理

```
┌─────────────────────────────────────────────────────────────────┐
│                    签名配置                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  证书类型                                                        │
│  ├── Apple Development                                         │
│  │   └── 开发调试用                                              │
│  │                                                              │
│  └── Apple Distribution                                        │
│      └── App Store / TestFlight 发布用                         │
│                                                                  │
│  Provisioning Profile                                          │
│  ├── iOS App Development                                       │
│  │   └── 开发调试                                                │
│  │                                                              │
│  ├── Ad Hoc                                                    │
│  │   └── 内部分发                                                │
│  │                                                              │
│  └── App Store                                                 │
│      └── 正式发布                                                │
│                                                                  │
│  自动签名                                                        │
│  ├── Signing & Capabilities                                    │
│  ├── ☑ Automatically manage signing                           │
│  └── 选择 Team                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Fastlane Match

| 功能 | 说明 |
|------|------|
| match development | 同步开发证书 |
| match appstore | 同步发布证书 |
| match nuke | 清除所有证书 |

---

## 7. Scheme 配置

### 7.1 Build Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                    构建配置                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Debug                                                          │
│  ├── 编译优化: None                                             │
│  ├── 调试信息: Full                                             │
│  ├── 环境: Development                                         │
│  └── API: 开发服务器                                            │
│                                                                  │
│  Staging                                                        │
│  ├── 编译优化: Optimized                                        │
│  ├── 调试信息: Limited                                          │
│  ├── 环境: Staging                                              │
│  └── API: 测试服务器                                            │
│                                                                  │
│  Release                                                        │
│  ├── 编译优化: Fastest, Smallest                                │
│  ├── 调试信息: dSYM                                             │
│  ├── 环境: Production                                          │
│  └── API: 生产服务器                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 环境变量

| 变量 | Debug | Release |
|------|-------|---------|
| API_BASE_URL | dev.api.readmigo.com | api.readmigo.com |
| ENABLE_LOGGING | true | false |
| ANALYTICS_ENABLED | false | true |

---

## 8. 调试工具

### 8.1 Xcode 调试

```
┌─────────────────────────────────────────────────────────────────┐
│                    调试工具                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  断点                                                            │
│  ├── 行断点                                                      │
│  ├── 条件断点                                                    │
│  ├── 符号断点 (Symbolic)                                        │
│  └── 异常断点 (Exception)                                       │
│                                                                  │
│  LLDB 命令                                                       │
│  ├── po expression          打印对象                            │
│  ├── p expression           打印值                              │
│  ├── bt                     堆栈追踪                            │
│  ├── fr v                   当前帧变量                          │
│  └── expr expression        执行表达式                          │
│                                                                  │
│  View Debugger                                                  │
│  ├── Debug → View Debugging → Capture View Hierarchy          │
│  └── 3D 视图层级检查                                            │
│                                                                  │
│  Memory Graph                                                   │
│  ├── Debug → Capture Memory Graph                              │
│  └── 检测内存泄漏                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Instruments

| 工具 | 用途 |
|------|------|
| Time Profiler | CPU 性能分析 |
| Allocations | 内存分配 |
| Leaks | 内存泄漏 |
| Core Animation | 渲染性能 |
| Network | 网络分析 |

---

## 9. 模拟器配置

### 9.1 常用模拟器

```
┌─────────────────────────────────────────────────────────────────┐
│                    模拟器配置                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  主要测试设备                                                    │
│  ├── iPhone 15 Pro           最新旗舰                          │
│  ├── iPhone SE (3rd)         小屏设备                          │
│  ├── iPhone 15 Pro Max       大屏设备                          │
│  └── iPad Pro 12.9           平板设备                          │
│                                                                  │
│  模拟器功能                                                      │
│  ├── Device → Trigger Memory Warning                           │
│  ├── Features → Toggle Slow Animations                         │
│  ├── I/O → Keyboard → Connect Hardware Keyboard               │
│  └── Window → Stay On Top                                      │
│                                                                  │
│  命令行操作                                                      │
│  ├── xcrun simctl list                 列出设备                │
│  ├── xcrun simctl boot <device>        启动设备                │
│  ├── xcrun simctl shutdown all         关闭所有                │
│  └── xcrun simctl erase all            重置所有                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 真机调试

| 步骤 | 说明 |
|------|------|
| 连接设备 | USB 连接 iPhone/iPad |
| 信任设备 | 设备上信任此电脑 |
| 注册设备 | 添加到开发者账号 |
| 选择目标 | Xcode 选择设备运行 |

---

## 10. 常用脚本

### 10.1 开发脚本

```
┌─────────────────────────────────────────────────────────────────┐
│                    常用脚本                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  清理构建                                                        │
│  xcodebuild clean -workspace Readmigo.xcworkspace              │
│  rm -rf ~/Library/Developer/Xcode/DerivedData                  │
│                                                                  │
│  构建项目                                                        │
│  xcodebuild build \                                             │
│    -workspace Readmigo.xcworkspace \                           │
│    -scheme Readmigo \                                           │
│    -configuration Debug                                         │
│                                                                  │
│  运行测试                                                        │
│  xcodebuild test \                                              │
│    -workspace Readmigo.xcworkspace \                           │
│    -scheme Readmigo \                                           │
│    -destination 'platform=iOS Simulator,name=iPhone 15 Pro'    │
│                                                                  │
│  生成归档                                                        │
│  xcodebuild archive \                                           │
│    -workspace Readmigo.xcworkspace \                           │
│    -scheme Readmigo \                                           │
│    -archivePath build/Readmigo.xcarchive                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Fastlane 命令

| 命令 | 功能 |
|------|------|
| fastlane test | 运行测试 |
| fastlane beta | 发布 TestFlight |
| fastlane release | 发布 App Store |
| fastlane screenshots | 生成截图 |

---

## 11. 故障排查

### 11.1 常见问题

```
┌─────────────────────────────────────────────────────────────────┐
│                    常见问题解决                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  签名问题                                                        │
│  ├── 清理 DerivedData                                           │
│  ├── 重新登录开发者账号                                          │
│  ├── 刷新 Provisioning Profile                                 │
│  └── 检查 Bundle ID 匹配                                        │
│                                                                  │
│  依赖问题                                                        │
│  ├── File → Packages → Reset Package Caches                   │
│  ├── 删除 Package.resolved                                      │
│  └── 重新 Resolve Packages                                      │
│                                                                  │
│  编译问题                                                        │
│  ├── Product → Clean Build Folder                              │
│  ├── 清理 DerivedData                                           │
│  └── 重启 Xcode                                                 │
│                                                                  │
│  模拟器问题                                                      │
│  ├── 重置模拟器内容和设置                                        │
│  ├── xcrun simctl shutdown all                                 │
│  └── 重新安装模拟器运行时                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 清理命令

| 操作 | 命令 |
|------|------|
| 清理 DerivedData | `rm -rf ~/Library/Developer/Xcode/DerivedData` |
| 清理 SPM 缓存 | `rm -rf ~/Library/Caches/org.swift.swiftpm` |
| 重置模拟器 | `xcrun simctl erase all` |

---

## 12. 相关文档

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 架构设计 |
| [testing.md](./testing.md) | 测试策略 |
| [release-process.md](./release-process.md) | 发布流程 |

---

*最后更新: 2025-12-31*
