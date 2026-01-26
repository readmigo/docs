# 阅读器模块文档

> Readmigo 阅读器引擎相关文档

---

## 文档索引

### 核心架构
- [阅读器架构](./architecture.md) - 核心阅读引擎设计
- [阅读器引擎](./reader-engine.md) - WebView 渲染引擎实现

### 格式与渲染
- [格式支持](./format-support.md) - 支持的电子书格式
- [渲染引擎](./rendering-engine.md) - 多格式渲染引擎设计
- [竞品分析](../../00-market/competitive/reader-apps.md) - 与商业阅读器对比

### 交互与体验
- [翻页动画](./page-turning.md) - 物理级翻页动画系统
- [字体管理](./font-management.md) - 超级字体管理系统

### 功能规划
- [高级功能路线图](./advanced-features-roadmap.md) - 完整功能规划与实现细节

---

## 实现状态

| 功能 | 状态 | 文档 |
|------|------|------|
| EPUB2/3 渲染 | ✅ 已实现 | [渲染引擎](./rendering-engine.md) |
| 基础翻页 | ✅ 已实现 | [翻页动画](./page-turning.md) |
| 字体调整 | ✅ 已实现 | [字体管理](./font-management.md) |
| PDF 支持 | ⏳ 规划中 | [格式支持](./format-support.md) |
| 物理翻页 | ⏳ 规划中 | [翻页动画](./page-turning.md) |
| 用户字体导入 | ⏳ 规划中 | [字体管理](./font-management.md) |
| 离线阅读 | ⏳ 规划中 | [高级功能](./advanced-features-roadmap.md) |
| 批注系统 | ⏳ 规划中 | [高级功能](./advanced-features-roadmap.md) |

---

## 代码位置

### iOS 客户端
- `ios/Readmigo/Features/Reader/` - 阅读器功能
  - `ReaderView.swift` - 阅读器主视图
  - `ReaderViewModel.swift` - 阅读器逻辑
  - `EPUBParser.swift` - EPUB 解析
  - `ChapterRenderer.swift` - 章节渲染

### 后端服务
- `apps/backend/src/modules/books/` - 书籍服务
- `apps/backend/src/modules/reading-progress/` - 阅读进度

---

*最后更新: 2025-12-28*
