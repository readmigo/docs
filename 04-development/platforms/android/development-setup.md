# Android 开发环境搭建

> Android Studio + Gradle + 开发配置

---

## 1. 环境要求

### 1.1 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| 操作系统 | macOS 10.14+ / Windows 10+ / Linux | macOS Ventura+ |
| 内存 | 8GB RAM | 16GB+ RAM |
| 磁盘空间 | 10GB 可用 | 50GB+ SSD |
| 屏幕分辨率 | 1280 x 800 | 1920 x 1080+ |

### 1.2 软件版本

```
┌─────────────────────────────────────────────────────────────────┐
│                    开发工具版本                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Android Studio                                                 │
│  └── Ladybug (2024.2.1) 或更新                                  │
│                                                                  │
│  JDK                                                            │
│  └── JDK 17 (Android Studio 内置)                              │
│                                                                  │
│  Android SDK                                                    │
│  ├── Platform: Android 14 (API 34)                             │
│  ├── Build Tools: 34.0.0                                       │
│  └── NDK: 26.x (如需原生代码)                                  │
│                                                                  │
│  Gradle                                                         │
│  └── 8.5+ (通过 Wrapper)                                       │
│                                                                  │
│  Kotlin                                                         │
│  └── 2.0.x                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 安装步骤

### 2.1 安装流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    安装流程                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 安装 Android Studio                                         │
│     └── https://developer.android.com/studio                   │
│                                                                  │
│  2. 首次启动配置向导                                             │
│     ├── 选择 Standard 安装                                      │
│     ├── 接受 License                                            │
│     └── 等待组件下载                                            │
│                                                                  │
│  3. 安装额外 SDK 组件                                            │
│     ├── SDK Manager → SDK Platforms                            │
│     │   └── Android 14 (API 34)                                │
│     │                                                          │
│     └── SDK Manager → SDK Tools                                │
│         ├── Android SDK Build-Tools 34                         │
│         ├── Android SDK Command-line Tools                     │
│         ├── Android Emulator                                   │
│         └── Android SDK Platform-Tools                         │
│                                                                  │
│  4. 配置 Android 模拟器                                          │
│     └── Device Manager → Create Device                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 环境变量 (可选)

| 变量 | 说明 | 示例值 (macOS) |
|------|------|----------------|
| ANDROID_HOME | SDK 路径 | ~/Library/Android/sdk |
| JAVA_HOME | JDK 路径 | /Applications/Android Studio.app/.../jbr |

---

## 3. 项目配置

### 3.1 克隆项目

```
┌─────────────────────────────────────────────────────────────────┐
│                    项目获取                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  克隆仓库                                                        │
│  └── git clone <repository-url>                                │
│                                                                  │
│  切换到 Android 目录                                            │
│  └── cd readmigo/android                                       │
│                                                                  │
│  打开项目                                                        │
│  └── Android Studio → Open → 选择 android 目录                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Gradle 同步

| 问题 | 解决方案 |
|------|----------|
| 同步失败 | File → Invalidate Caches |
| 版本冲突 | 检查 gradle-wrapper.properties |
| 依赖下载慢 | 配置国内镜像源 |

---

## 4. 构建变体

### 4.1 Build Variants

```
┌─────────────────────────────────────────────────────────────────┐
│                    构建变体                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Build Type                                                     │
│  ├── debug                                                     │
│  │   ├── 可调试                                                 │
│  │   ├── 无混淆                                                 │
│  │   └── Debug 签名                                            │
│  │                                                              │
│  └── release                                                   │
│      ├── 不可调试                                               │
│      ├── 启用混淆 (R8)                                         │
│      └── Release 签名                                          │
│                                                                  │
│  Product Flavor                                                 │
│  ├── dev                                                       │
│  │   ├── applicationIdSuffix: .dev                            │
│  │   └── 连接开发服务器                                         │
│  │                                                              │
│  ├── staging                                                   │
│  │   ├── applicationIdSuffix: .staging                        │
│  │   └── 连接测试服务器                                         │
│  │                                                              │
│  └── prod                                                      │
│      └── 连接生产服务器                                         │
│                                                                  │
│  常用组合                                                        │
│  ├── devDebug     开发调试                                      │
│  ├── stagingDebug 测试调试                                      │
│  └── prodRelease  生产发布                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 选择构建变体

| 步骤 | 操作 |
|------|------|
| 1 | View → Tool Windows → Build Variants |
| 2 | 选择 Active Build Variant |
| 3 | 等待 Gradle 同步 |

---

## 5. 本地配置

### 5.1 local.properties

```
┌─────────────────────────────────────────────────────────────────┐
│                    local.properties 配置                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  必须配置                                                        │
│  └── sdk.dir=/path/to/Android/sdk                              │
│                                                                  │
│  可选配置 (敏感信息)                                             │
│  ├── STORE_FILE=release.keystore                               │
│  ├── STORE_PASSWORD=xxx                                        │
│  ├── KEY_ALIAS=xxx                                             │
│  ├── KEY_PASSWORD=xxx                                          │
│  └── API_KEY=xxx                                               │
│                                                                  │
│  注意                                                            │
│  └── 此文件已加入 .gitignore，不会提交                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 环境配置文件

| 文件 | 说明 | Git 状态 |
|------|------|----------|
| local.properties | SDK 路径、密钥 | 忽略 |
| gradle.properties | Gradle 配置 | 提交 |
| keystore.properties | 签名配置 | 忽略 |

---

## 6. IDE 配置

### 6.1 推荐插件

```
┌─────────────────────────────────────────────────────────────────┐
│                    推荐插件                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  官方插件 (内置)                                                 │
│  ├── Kotlin                                                    │
│  ├── Android                                                   │
│  └── Gradle                                                    │
│                                                                  │
│  代码质量                                                        │
│  ├── Detekt               Kotlin 静态分析                       │
│  └── SonarLint            代码问题检测                          │
│                                                                  │
│  效率工具                                                        │
│  ├── Key Promoter X       快捷键提示                            │
│  ├── String Manipulation  字符串处理                            │
│  └── Rainbow Brackets     括号着色                              │
│                                                                  │
│  协作工具                                                        │
│  ├── GitToolBox           Git 增强                              │
│  └── Conventional Commit  提交规范                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 代码风格配置

| 配置项 | 位置 | 说明 |
|--------|------|------|
| ktlint | Settings → Editor → Code Style → Kotlin | 导入 ktlint 配置 |
| 缩进 | Editor → Code Style → Kotlin → Tabs and Indents | 4 spaces |
| 换行 | Editor → Code Style → Kotlin → Wrapping | 按团队规范 |

---

## 7. 运行与调试

### 7.1 运行配置

```
┌─────────────────────────────────────────────────────────────────┐
│                    运行方式                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  模拟器运行                                                      │
│  ├── Device Manager → 创建/启动模拟器                           │
│  ├── 选择目标设备                                                │
│  └── 点击 Run (Shift+F10)                                      │
│                                                                  │
│  真机运行                                                        │
│  ├── 开启开发者选项                                              │
│  ├── 启用 USB 调试                                              │
│  ├── USB 连接设备                                               │
│  └── 点击 Run                                                  │
│                                                                  │
│  无线调试 (Android 11+)                                         │
│  ├── 设置 → 开发者选项 → 无线调试                               │
│  ├── Pair Devices Using Wi-Fi                                  │
│  └── 配对码配对                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 调试工具

| 工具 | 用途 |
|------|------|
| Layout Inspector | UI 层级检查 |
| Database Inspector | 数据库查看 |
| Network Inspector | 网络请求查看 |
| Profiler | 性能分析 |

---

## 8. 常用命令

### 8.1 Gradle 命令

```
┌─────────────────────────────────────────────────────────────────┐
│                    Gradle 命令                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  构建                                                            │
│  ├── ./gradlew assembleDebug        构建 Debug APK             │
│  ├── ./gradlew assembleRelease      构建 Release APK           │
│  └── ./gradlew bundleRelease        构建 AAB                   │
│                                                                  │
│  测试                                                            │
│  ├── ./gradlew test                 运行单元测试               │
│  ├── ./gradlew connectedAndroidTest 运行 UI 测试               │
│  └── ./gradlew testDebugUnitTest    指定变体测试               │
│                                                                  │
│  检查                                                            │
│  ├── ./gradlew lintDebug            Lint 检查                  │
│  ├── ./gradlew detekt               Detekt 检查                │
│  └── ./gradlew ktlintCheck          ktlint 检查                │
│                                                                  │
│  清理                                                            │
│  ├── ./gradlew clean                清理构建                   │
│  └── ./gradlew cleanBuildCache      清理缓存                   │
│                                                                  │
│  依赖                                                            │
│  └── ./gradlew dependencies         查看依赖树                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 ADB 命令

| 命令 | 说明 |
|------|------|
| adb devices | 列出连接设备 |
| adb install app.apk | 安装 APK |
| adb logcat | 查看日志 |
| adb shell | 进入设备 Shell |

---

## 9. 问题排查

### 9.1 常见问题

```
┌─────────────────────────────────────────────────────────────────┐
│                    常见问题与解决                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Gradle 同步失败                                                 │
│  ├── 检查网络连接                                                │
│  ├── File → Invalidate Caches / Restart                        │
│  └── 删除 .gradle 目录重试                                      │
│                                                                  │
│  SDK 版本不匹配                                                  │
│  ├── SDK Manager 安装对应版本                                    │
│  └── 修改 build.gradle compileSdk                              │
│                                                                  │
│  模拟器启动失败                                                  │
│  ├── 启用硬件加速 (HAXM/Hyper-V)                               │
│  ├── 降低模拟器 RAM                                             │
│  └── 使用 x86_64 镜像                                          │
│                                                                  │
│  依赖冲突                                                        │
│  ├── ./gradlew dependencies 分析                               │
│  └── 使用 exclude 或 force 解决                                │
│                                                                  │
│  内存不足                                                        │
│  ├── 增加 gradle.properties 中 org.gradle.jvmargs             │
│  └── 关闭不必要的 IDE 功能                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 性能优化建议

| 建议 | 说明 |
|------|------|
| 启用 Gradle 缓存 | org.gradle.caching=true |
| 启用并行构建 | org.gradle.parallel=true |
| 增加 Gradle 内存 | org.gradle.jvmargs=-Xmx4g |
| 使用 Build Cache | 开启 Local + Remote Cache |

---

## 10. 相关文档

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 架构设计 |
| [testing.md](./testing.md) | 测试策略 |
| [release-process.md](./release-process.md) | 发布流程 |

---

*最后更新: 2025-12-31*
