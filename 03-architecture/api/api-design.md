# Readmigo API 设计

> RESTful API 规范 | 基于 NestJS 10.x

---

## API 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/api/v1` |
| 认证方式 | JWT Bearer Token |
| 内容类型 | application/json |
| 日期格式 | ISO 8601 (UTC) |

---

## 核心 API 模块

### 认证 (Auth)

| 端点 | 方法 | 说明 |
|------|------|------|
| /auth/apple | POST | Apple Sign In |
| /auth/google | POST | Google Sign In |
| /auth/refresh | POST | 刷新 Token |
| /auth/logout | POST | 注销登录 |

### 用户 (Users)

| 端点 | 方法 | 说明 |
|------|------|------|
| /users/me | GET | 获取当前用户信息 |
| /users/me | PATCH | 更新用户信息 |
| /users/me/stats | GET | 获取用户统计数据 |

### 书籍 (Books)

| 端点 | 方法 | 说明 |
|------|------|------|
| /books | GET | 书籍列表 (分页、筛选) |
| /books/:id | GET | 书籍详情 |
| /books/:id/chapters | GET | 章节列表 |
| /books/:id/chapters/:chapterId | GET | 章节内容 |
| /books/:id/chapters/:chapterId/translations/:locale/paragraphs | GET | 批量段落翻译 |

### 用户书架 (User Books)

| 端点 | 方法 | 说明 |
|------|------|------|
| /user-books | GET | 用户书架列表 |
| /user-books | POST | 添加书籍到书架 |
| /user-books/:id | DELETE | 从书架移除 |

### 阅读 (Reading)

| 端点 | 方法 | 说明 |
|------|------|------|
| /reading/sessions | POST | 创建阅读会话 |
| /reading/sessions/:id | PATCH | 更新阅读进度 |
| /reading/sessions/:id/end | POST | 结束阅读会话 |

### 词汇 (Vocabulary)

| 端点 | 方法 | 说明 |
|------|------|------|
| /vocabulary | GET | 用户词汇列表 |
| /vocabulary | POST | 添加词汇 |
| /vocabulary/:id/review | POST | 提交复习结果 (SM-2) |
| /vocabulary/due | GET | 获取待复习词汇 |

### 有声书 (Audiobooks)

| 端点 | 方法 | 说明 |
|------|------|------|
| /audiobooks | GET | 有声书列表 |
| /audiobooks/:id | GET | 有声书详情 (含章节音频) |

### AI 服务

| 端点 | 方法 | 说明 |
|------|------|------|
| /ai/explain | POST | 单词/句子解释 |
| /ai/simplify | POST | 句子简化 |
| /ai/translate | POST | 段落翻译 |
| /ai/chat | POST | 内容问答 |

### 搜索 (Search)

| 端点 | 方法 | 说明 |
|------|------|------|
| /search | GET | 统一搜索 (书籍 + 作者) |
| /search/suggestions | GET | 搜索自动补全 |
| /search/popular | GET | 热门搜索 |

### 作者 (Authors)

| 端点 | 方法 | 说明 |
|------|------|------|
| /authors | GET | 作者列表 |
| /authors/:id | GET | 作者详情 |
| /authors/:id/books | GET | 作者书籍列表 |
| /authors/:id/chat | POST | 作者人设聊天 |

### 社区 (Agora)

| 端点 | 方法 | 说明 |
|------|------|------|
| /agora/posts | GET | 社区动态列表 |
| /agora/posts | POST | 发布动态 |
| /agora/posts/:id/like | POST | 点赞 |
| /agora/posts/:id/comments | GET/POST | 评论 |

---

## 通用规范

### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 (max 100) |
| sort | string | -createdAt | 排序字段 |

### 错误响应格式

| 字段 | 类型 | 说明 |
|------|------|------|
| statusCode | number | HTTP 状态码 |
| message | string | 错误描述 |
| error | string | 错误类型 |

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---
