# 书架数据同步 V2: 云同步

## 概述

V2 版本实现完整的云同步策略，支持多设备同步和实时进度更新。

---

## 核心原则

| 场景 | 处理方式 |
|-----|---------|
| 游客 → 登录 | 本地数据上传合并到云端 |
| 登录 → 退出 | 云端数据转存到本地 |
| 账户A → 账户B | 不隔离，合并内容 |
| 多设备 | 退出阅读器时同步进度 |

---

## 新增 API

| 接口 | 方法 | 描述 |
|-----|------|------|
| `/api/reading-progress` | GET | 获取用户所有阅读进度 |
| `/api/reading-progress/sync` | POST | 批量同步阅读进度 |

---

## 合并策略

| 冲突场景 | 处理方式 |
|---------|---------|
| 同一本书进度冲突 | 取 `lastReadAt` 较新的 |

---

## 关键文件

| 文件 | 路径 |
|------|------|
| BrowsingHistoryManager | `ios/Readmigo/Core/Services/BrowsingHistoryManager.swift` |
| ReadingProgressStore | `ios/Readmigo/Core/Services/ReadingProgressStore.swift` |
| FavoritesManager | `ios/Readmigo/Core/Services/FavoritesManager.swift` |
| EnhancedReaderView | `ios/Readmigo/Features/Reader/EnhancedReaderView.swift` |
| AuthManager | `ios/Readmigo/Core/Auth/AuthManager.swift` |
