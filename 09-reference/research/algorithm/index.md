# 算法模块文档

> Readmigo 推荐算法、排序算法相关文档

---

## 模块概述

Algorithm 模块包含 Readmigo 的各种算法实现：

- **书籍推荐**: 个性化书籍推荐
- **排序算法**: 书籍排序和榜单生成
- **难度分级**: 书籍难度自动评估

---

## 文档索引

| 文档 | 说明 | 状态 |
|------|------|------|
| [book-ranking-algorithm.md](./book-ranking-algorithm.md) | 书籍排序算法设计 | ✅ 80% |
| [book-ranking-implementation.md](./book-ranking-implementation.md) | 排序算法实现设计 | ✅ 100% |

---

## 实现状态

### 书籍排序算法
| 功能 | 状态 | 说明 |
|------|------|------|
| 算法设计 | ✅ 已完成 | 8个评分维度 |
| 后端实现 | ✅ 已完成 | RecommendationModule |
| 定时任务 | ✅ 已完成 | 每日更新排序 |
| API接口 | ✅ 已完成 | 推荐接口已上线 |

### 评分维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 下载量 | 25% | Gutenberg 下载数据 |
| 评分 | 20% | 用户评分 |
| 经典度 | 15% | 是否经典名著 |
| 新鲜度 | 10% | 最近添加/更新 |
| 完整度 | 10% | 元数据完整性 |
| 可读性 | 10% | 难度评估 |
| 互动量 | 5% | 收藏/评论数 |
| 编辑推荐 | 5% | 人工推荐权重 |

---

## 代码位置

### 后端服务
- `apps/backend/src/modules/recommendation/` - 推荐服务
  - `recommendation.service.ts` - 推荐逻辑
  - `ranking.service.ts` - 排序算法
  - `recommendation.controller.ts` - API接口

### 定时任务
- `apps/backend/src/jobs/` - 定时任务
  - `update-rankings.job.ts` - 排名更新任务

---

*最后更新: 2025-12-27*
