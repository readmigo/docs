# Social 模块

> 社交功能系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 阅读分享 | 分享书评、进度、金句 | P0 |
| 书评系统 | 评分和书评发布 | P0 |
| 关注系统 | 关注与粉丝管理 | P0 |
| 动态流 | 好友阅读动态 | P1 |
| 排行榜 | 阅读数据排行 | P1 |
| 读书俱乐部 | 线上读书社群 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 分享 | Intent / ShareSheet | expo-sharing | Web Share API |
| 动态列表 | LazyColumn | FlashList | React Query |
| 状态管理 | StateFlow | Zustand | Zustand |
| 实时更新 | Firebase | WebSocket | SSE / WebSocket |
| 社交平台 | 原生 SDK | URL Scheme | URL Scheme |

---

## 2. 数据模型

---

## 3. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/reviews` | POST | 创建书评 |
| `/reviews/{bookId}` | GET | 获取书籍书评 |
| `/reviews/{id}/like` | POST | 点赞书评 |
| `/reviews/{id}/unlike` | DELETE | 取消点赞 |
| `/users/{id}/follow` | POST | 关注用户 |
| `/users/{id}/unfollow` | DELETE | 取消关注 |
| `/users/{id}/followers` | GET | 获取粉丝列表 |
| `/users/{id}/following` | GET | 获取关注列表 |
| `/activity/feed` | GET | 获取动态流 |
| `/leaderboard/{type}` | GET | 获取排行榜 |

---

## 4. Android 实现

### 4.1 ViewModel

### 4.2 分享功能

---

## 5. React Native 实现

### 5.1 Zustand Store

### 5.2 分享 Hook

### 5.3 书评组件

---

## 6. Web 实现

### 6.1 Server Actions

### 6.2 分享 Hook

### 6.3 书评 Hooks

---

## 7. UI 组件

### 分享弹窗 (Web)

### 排行榜 (Web)

---

## 8. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `review_submitted` | 提交书评 | book_id, rating |
| `review_liked` | 点赞书评 | review_id |
| `user_followed` | 关注用户 | target_user_id |
| `share_initiated` | 发起分享 | type, platform |
| `share_completed` | 分享完成 | type, platform |
| `activity_viewed` | 查看动态 | - |
| `leaderboard_viewed` | 查看排行榜 | type, period |

---

## 9. 导出

---

*最后更新: 2025-12-28*
