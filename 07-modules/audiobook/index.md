# 有声书模块文档

> Readmigo 有声书功能相关文档

---

## 模块概述

Audiobook 模块提供有声书播放和管理功能，包含：

- **有声书播放**: 章节播放、进度控制、倍速调节
- **电子书关联**: 有声书与电子书同步阅读
- **LibriVox 集成**: 20,000+ 免费有声书资源

---

## 文档索引

| 文档 | 说明 | 状态 |
|------|------|------|
| [audiobook-design-v2.md](./audiobook-design-v2.md) | 有声书功能设计 V2 | 🚧 进行中 |
| [audiobook-ebook-linking-design.md](./audiobook-ebook-linking-design.md) | 有声书-电子书关联设计 | 📝 规划中 |

---

## 实现状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 有声书播放器 | ✅ 已实现 | iOS AudiobookPlayerView |
| 章节列表 | ✅ 已实现 | 章节选择与进度显示 |
| 播放控制 | ✅ 已实现 | 播放/暂停/跳转/倍速 |
| 后台播放 | ✅ 已实现 | 锁屏控制支持 |
| 有声书-电子书同步 | 📝 规划中 | 同步阅读位置 |
| 离线下载 | 📝 规划中 | 章节离线缓存 |

---

## 数据源

| 来源 | 规模 | 说明 |
|------|------|------|
| LibriVox | 20,648+ | 人声朗读，免费商用 |
| Gutenberg Audio | 关联 | 与电子书关联 |

详见：[LibriVox 数据清单](../sources/librivox/data-inventory.md)

---

## 代码位置

### iOS 客户端
- `ios/Readmigo/Features/Audiobook/` - 有声书功能
  - `AudiobookPlayerView.swift` - 播放器视图
  - `AudiobookViewModel.swift` - 播放逻辑
  - `AudioPlayerManager.swift` - 音频管理

### 后端服务
- `src/modules/audiobooks/` - 有声书服务

---

*最后更新: 2025-12-27*
