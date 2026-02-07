# Search 模块

> 搜索功能系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 书籍搜索 | 标题、作者、ISBN 搜索 | P0 |
| 分类搜索结果 | 作者/书籍/语录分组展示 | P0 |
| 搜索历史 | 最近搜索记录 | P0 |
| 热门搜索 | 平台热搜词汇 | P1 |
| 自动补全 | 输入时实时建议 | P1 |
| 书内全文搜索 | 阅读器内容搜索 | P1 |
| 高级筛选 | 类型、难度、语言筛选 | P1 |
| 拼音搜索 | 支持拼音搜索中文 | P2 |
| 别名搜索 | 作者中英文名互搜 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 搜索栏 | Compose TextField | 自定义组件 | Cmd+K 弹窗 |
| 本地搜索 | Room FTS | SQLite FTS5 | IndexedDB |
| 远程搜索 | Retrofit | Axios + React Query | Server Actions |
| 防抖 | Flow debounce | lodash.debounce | use-debounce |
| 状态管理 | StateFlow | Zustand | Zustand |

---

## 2. 数据模型

---

## 3. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/search` | GET | 统一搜索 |
| `/search/suggestions` | GET | 搜索建议 |
| `/search/popular` | GET | 热门搜索 |
| `/search/trending` | GET | 今日热搜 |
| `/search/content/{bookId}` | GET | 书内全文搜索 |

### 请求参数

---

## 4. Android 实现

### 4.1 搜索历史管理

### 4.2 ViewModel

### 4.3 搜索历史 UI

### 4.4 分类搜索结果 UI

---

## 5. React Native 实现

### 5.1 Zustand Store

### 5.2 搜索 Hook

### 5.3 搜索栏组件

---

## 6. Web 实现

### 6.1 Server Actions

### 6.2 搜索弹窗

### 6.3 搜索 Hook

---

## 7. 书内全文搜索

### React Native / Web 实现

---

## 8. 本地化

---

## 9. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `search_query` | 执行搜索 | query, results_count |
| `search_suggestion_selected` | 选择建议 | suggestion, type |
| `search_history_selected` | 选择历史 | query |
| `search_popular_selected` | 选择热门搜索 | query, rank |
| `search_result_clicked` | 点击搜索结果 | type, item_id |
| `search_history_cleared` | 清除历史 | - |
| `search_filter_applied` | 应用筛选 | filters |

---

## 10. 导出

---

*最后更新: 2025-12-28*
