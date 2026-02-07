# Settings 模块

> 应用设置系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 页面 | 功能 | 优先级 |
|------|------|--------|
| 设置主页 | 设置入口与分组 | P0 |
| 阅读设置 | 字体、主题、行距 | P0 |
| 账户设置 | 个人信息管理 | P0 |
| 通知设置 | 提醒与推送 | P1 |
| 离线管理 | 下载内容管理 | P1 |
| 语言设置 | 界面与学习语言 | P1 |
| 隐私设置 | 数据与分析 | P2 |
| 数据同步 | 云端同步管理 | P2 |
| 关于页面 | 版本与法律信息 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 配置存储 | DataStore Preferences | AsyncStorage/MMKV | Zustand + localStorage |
| 加密存储 | EncryptedSharedPreferences | SecureStore | N/A |
| 文件管理 | File API + WorkManager | expo-file-system | IndexedDB |
| 通知 | FCM | expo-notifications | Notification API |
| 生物识别 | BiometricPrompt | expo-local-authentication | Web Authentication API |

---

## 2. 数据模型

---

## 3. Android 实现

### 3.1 Settings Manager

### 3.2 离线管理器

---

## 4. React Native 实现

### 4.1 Zustand Store

### 4.2 存储管理服务

---

## 5. Web 实现

### 5.1 Zustand Store

### 5.2 Server Actions

---

## 6. 设置分类

### 阅读设置

| 设置项 | 类型 | 默认值 | 范围 |
|--------|------|--------|------|
| 字体 | select | system | system/serif/sans-serif |
| 字号 | slider | 18 | 12-32 |
| 行距 | slider | 1.6 | 1.2-2.5 |
| 主题 | select | light | light/dark/sepia |
| 保持屏幕常亮 | switch | true | - |

### 通知设置

| 设置项 | 类型 | 默认值 |
|--------|------|--------|
| 每日阅读提醒 | switch | true |
| 提醒时间 | time | 20:00 |
| 复习提醒 | switch | true |
| 新书推荐 | switch | true |

### 隐私设置

| 设置项 | 类型 | 默认值 |
|--------|------|--------|
| 数据分析 | switch | true |
| 崩溃报告 | switch | true |
| 同步阅读进度 | switch | true |
| 生物识别锁定 | switch | false |

---

## 7. 工具函数

---

*最后更新: 2025-12-28*
