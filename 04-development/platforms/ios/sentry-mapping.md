# iOS Sentry Mapping 实现文档

## 概述

本文档描述 iOS 应用崩溃报告符号化（Symbolication）的实现方案，使 Sentry 崩溃报告能够显示源代码文件名、行号和函数名，而非内存地址。

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Build Pipeline                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │    Build     │───▶│   Archive    │───▶│   Generate   │               │
│  │  (Release)   │    │    .ipa      │    │    .dSYM     │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                  │                       │
│                                                  ▼                       │
│                                         ┌──────────────┐                │
│                                         │  Run Script  │                │
│                                         │ Build Phase  │                │
│                                         └──────────────┘                │
│                                                  │                       │
│                                                  ▼                       │
│  ┌──────────────┐                       ┌──────────────┐                │
│  │ ~/.sentryclirc │◀─── Auth Token ────▶│  sentry-cli  │                │
│  └──────────────┘                       └──────────────┘                │
│                                                  │                       │
└──────────────────────────────────────────────────│───────────────────────┘
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │    Sentry    │
                                          │    Server    │
                                          └──────────────┘
```

## 组件说明

### 1. 配置文件

| 文件 | 位置 | 用途 | Git 跟踪 |
|------|------|------|----------|
| `.sentryclirc` | `ios/` | 项目级配置（org, project） | ✅ 是 |
| `.sentryclirc` | `~/` | 用户级配置（auth token） | ❌ 否 |

### 2. Build Phase Script

| 属性 | 值 |
|------|-----|
| 名称 | Upload dSYM to Sentry |
| 触发条件 | Configuration = Release |
| 执行顺序 | 在 Resources phase 之后 |
| 依赖工具 | sentry-cli（自动安装） |

### 3. 认证流程

```
┌─────────────────────────────────────────────────────────┐
│                    Auth Token 查找顺序                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. 环境变量 SENTRY_AUTH_TOKEN                           │
│           │                                              │
│           ▼ (未设置)                                     │
│  2. ~/.sentryclirc [auth] token                         │
│           │                                              │
│           ▼ (未找到)                                     │
│  3. 跳过上传，输出警告                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 数据流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   App 崩溃   │────▶│  Sentry SDK │────▶│ Sentry 服务  │────▶│  符号化处理  │
│  (用户设备)  │     │  (捕获崩溃)  │     │  (接收报告)  │     │  (匹配dSYM) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │  可读堆栈   │
                                                            │ 文件:行号   │
                                                            │  函数名     │
                                                            └─────────────┘
```

## 文件清单

| 文件路径 | 类型 | 说明 |
|----------|------|------|
| `ios/.sentryclirc` | 配置 | Sentry CLI 项目配置 |
| `ios/Readmigo.xcodeproj/project.pbxproj` | 项目 | 包含 Build Phase Script |
| `~/.sentryclirc` | 配置 | 用户认证 Token（本地） |

## Sentry 配置参数

| 参数 | 值 | 说明 |
|------|-----|------|
| Organization | readmigo | Sentry 组织 |
| Project | ios | Sentry 项目 |
| DSN | 见 CrashTrackingService.swift | 数据源名称 |

## 构建配置

| 配置项 | Debug | Release |
|--------|-------|---------|
| DEBUG_INFORMATION_FORMAT | dwarf | dwarf-with-dsym |
| dSYM 生成 | ❌ | ✅ |
| dSYM 上传 | ❌ | ✅ |

## 验证方法

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | Archive 构建 | Build Log 显示 "Uploading dSYM files to Sentry..." |
| 2 | 检查 Sentry Dashboard | Settings → Debug Files 显示新上传的符号文件 |
| 3 | 触发测试崩溃 | 崩溃报告显示源代码文件名和行号 |

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| dSYM 未上传 | Auth Token 未配置 | 检查 ~/.sentryclirc 文件 |
| 堆栈仍显示地址 | dSYM UUID 不匹配 | 确保上传与 App 同一次构建的 dSYM |
| sentry-cli 未找到 | 首次构建 | 脚本会自动安装 |
| 上传失败 | 网络问题 | 检查网络连接，重新构建 |

## 相关文件

| 文件 | 用途 |
|------|------|
| `ios/Readmigo/Core/Services/CrashTrackingService.swift` | Sentry SDK 初始化 |
| `ios/Readmigo/App/ReadmigoApp.swift` | App 入口，调用 CrashTrackingService |
