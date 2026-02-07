# Learning 学习模块文档

> 生词本、复习系统、词汇管理相关文档

---

## 模块概述

Learning 模块是 Readmigo 的核心学习功能，包含：

- **生词本 (Vocabulary)**: 自动收集用户查询的单词
- **复习系统 (Review)**: 基于 SM-2 算法的间隔重复
- **词汇管理**: 单词分组、掌握度追踪

---

## 实现状态

### 后端模块
- ✅ `src/modules/vocabulary/` - 词汇管理服务

### iOS 客户端
- ✅ `ios/Readmigo/Features/Learning/` - 学习功能 UI
  - `LearningView.swift` - 学习主页
  - `VocabularyView.swift` - 生词本列表
  - `VocabularyManager.swift` - 词汇数据管理
  - `ReviewSessionView.swift` - 复习会话

---

## 核心功能

### 1. 自动添加生词

用户在阅读器中查询单词后，系统自动将其添加到生词本：

```
用户选中单词 → AI 解释 → 自动添加生词本 → 安排复习时间
```

### 2. SM-2 间隔重复算法

复习调度基于艾宾浩斯遗忘曲线：

| 复习反馈 | 下次复习间隔 |
|----------|-------------|
| 完全忘记 | 1 天 |
| 有些模糊 | 当前间隔 × 1.2 |
| 记得 | 当前间隔 × 2.5 |
| 轻松记住 | 当前间隔 × 3.0 |

### 3. 复习模式

- **卡片模式**: 显示单词，翻转显示释义
- **选择题**: 从多个选项中选择正确释义
- **填空题**: 根据上下文填写单词

---

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/vocabulary` | 获取生词列表 |
| POST | `/vocabulary` | 添加生词 |
| POST | `/vocabulary/auto-batch` | 批量自动添加 |
| GET | `/vocabulary/review` | 获取待复习单词 |
| POST | `/vocabulary/:id/review` | 提交复习结果 |
| GET | `/vocabulary/stats` | 词汇统计 |

---

## 相关文档

- [生词本详细设计](./vocabulary-design.md) - 完整功能设计文档
- [iOS 客户端规格](../ios/client-spec.md) - 完整客户端功能清单
- [AI 缓存策略](../ai/cache-strategy.md) - 词汇解释缓存
- [Android 实现方案](../android/client-implementation-plan.md) - Android 对应实现

---

*最后更新: 2025-12-26*
