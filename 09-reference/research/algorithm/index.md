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
| 算法设计 | ✅ 已完成 | 质量分 + 热度分 + 新鲜度分 |
| 后端实现 | ✅ 已完成 | RecommendationModule |
| 定时任务 | ✅ 已完成 | 评分更新 + 缓存刷新 |
| API接口 | ✅ 已完成 | 推荐接口已上线 |

### 评分维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 质量分 (QualityScore) | 35% | 内容质量评估 |
| 热度分 (PopularityScore) | 50% | 用户互动热度 |
| 新鲜度分 (FreshnessScore) | 15% | 最近添加/更新 |

---

## 代码位置

### 后端服务
- `src/modules/recommendation/` - 推荐服务
  - `recommendation.service.ts` - 推荐逻辑
  - `recommendation.controller.ts` - API 接口
  - `services/score-calculator.ts` - 评分计算器
  - `services/book-score.service.ts` - 书籍评分服务
  - `services/book-stats.service.ts` - 统计收集服务
  - `services/discover-cache.service.ts` - 发现页缓存

### 定时任务
- `src/modules/recommendation/jobs/` - 定时任务
  - `update-book-scores.job.ts` - 评分更新任务
  - `refresh-discover-cache.job.ts` - 缓存刷新任务

---

*最后更新: 2025-12-27*
