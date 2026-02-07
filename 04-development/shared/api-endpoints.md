# API 端点参考

## 概述

- 基础 URL: https://readmigo-api.fly.dev/api/v1
- Debug URL: https://readmigo-api-debugging.fly.dev/api/v1
- 所有端点均以 /api/v1 为前缀

## 认证模块 (/auth)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /auth/register | POST | 邮箱注册新用户 | 无需 |
| /auth/login | POST | 邮箱密码登录 | 无需 |
| /auth/apple | POST | Apple Sign In 登录 | 无需 |
| /auth/google | POST | Google Sign In 登录 | 无需 |
| /auth/guest | POST | 访客登录 (基于设备 ID) | 无需 |
| /auth/refresh | POST | 刷新 Access Token | 无需 |
| /auth/upgrade | POST | 访客升级为正式账户 | Bearer Token |
| /auth/logout | POST | 登出 | Bearer Token |
| /auth/forgot-password | POST | 请求密码重置邮件 | 无需 |
| /auth/reset-password | POST | 使用 Token 重置密码 | 无需 |
| /auth/verify-email | POST | 验证邮箱 | 无需 |
| /auth/resend-verification | POST | 重发验证邮件 | 无需 |

## 书籍模块 (/books)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /books | GET | 获取书籍列表 (分页、筛选) | 无需 |
| /books/genres | GET | 获取所有分类标签 | 无需 |
| /books/recommendations | GET | 获取个性化推荐 | Bearer Token |
| /books/import | POST | 导入书籍 (Admin) | Bearer Token |
| /books/:id | GET | 获取书籍详情 | 无需 |
| /books/:id/context | GET | 获取书籍背景 (创作背景、历史) | 无需 |
| /books/:id/reading-guide | GET | 获取阅读指南 | 无需 |
| /books/:id/search | GET | 书内搜索 | 无需 |
| /books/:id/content/:chapterId | GET | 获取章节内容 | 无需 |
| /books/:id/chapters/batch | GET | 批量下载章节 (离线阅读) | 无需 |
| /books/:id/audio | GET | 获取有声书信息 | Bearer Token |

### 章节翻译端点

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /books/:id/chapters/:cid/translations/available | GET | 查询可用翻译语言 | 无需 |
| /books/:id/chapters/:cid/translations/:locale/metadata | GET | 翻译元数据 | 无需 |
| /books/:id/chapters/:cid/translations/:locale/paragraphs/:idx | GET | 单段落翻译 | 无需 |
| /books/:id/chapters/:cid/translations/:locale/paragraphs?indices=0,1,2 | GET | 批量翻译 (max 100) | 无需 |

支持的翻译 locale: zh-Hans, zh-Hant, es, hi, ar, pt, ja, ko, fr, de

## 分类模块 (/categories)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /categories | GET | 获取分类列表 | 无需 |
| /categories/tree | GET | 获取分类树 | 无需 |
| /categories/root | GET | 获取根分类 | 无需 |
| /categories/cascade | GET | 获取级联分类 | 无需 |
| /categories/:id | GET | 获取分类详情 | 无需 |
| /categories/slug/:slug | GET | 通过 slug 获取分类 | 无需 |
| /categories/:id/children | GET | 获取子分类 | 无需 |
| /categories/:id/books | GET | 获取分类下的书籍 | 无需 |

## 搜索模块 (/search)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /search | GET | 搜索书籍 | 无需 |
| /search/suggestions | GET | 搜索建议 | 无需 |
| /search/popular | GET | 热门搜索 | 无需 |
| /search/trending | GET | 趋势搜索 | 无需 |

## 书单模块 (/booklists)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /booklists | GET | 获取书单列表 | 无需 |
| /booklists/types | GET | 获取书单类型 | 无需 |
| /booklists/ai-personalized | GET | 获取 AI 个性化书单 | Bearer Token |
| /booklists/:id | GET | 获取书单详情 | 无需 |

## 词汇模块 (/vocabulary)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /vocabulary | GET | 获取用户词汇列表 | Bearer Token |
| /vocabulary | POST | 添加新词汇 | Bearer Token |
| /vocabulary/:id | PATCH | 更新词汇 | Bearer Token |
| /vocabulary/:id | DELETE | 删除词汇 | Bearer Token |
| /vocabulary/review | GET | 获取待复习词汇 | Bearer Token |
| /vocabulary/:id/review | POST | 提交单个复习结果 | Bearer Token |
| /vocabulary/review/batch | POST | 批量提交复习结果 | Bearer Token |
| /vocabulary/stats | GET | 获取词汇统计 | Bearer Token |
| /vocabulary/auto-batch | POST | 自动批量添加词汇 | Bearer Token |

## 订阅模块 (/subscriptions)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /subscriptions/status | GET | 获取订阅状态 | Bearer Token |
| /subscriptions/verify | POST | 验证 Apple 收据 | Bearer Token |
| /subscriptions/restore | POST | 恢复 Apple 购买 | Bearer Token |
| /subscriptions/trial/eligibility | GET | 检查试用资格 | Bearer Token |
| /subscriptions/trial/status | GET | 获取试用状态 | Bearer Token |
| /subscriptions/trial/start | POST | 开始试用 | Bearer Token |
| /subscriptions/google/verify | POST | 验证 Google Play 购买 | Bearer Token |
| /subscriptions/google/restore | POST | 恢复 Google 购买 | Bearer Token |
| /subscriptions/google/acknowledge | POST | 确认 Google 购买 | Bearer Token |
| /subscriptions/stripe/create-checkout | POST | 创建 Stripe 结账 | Bearer Token |
| /subscriptions/stripe/create-portal | POST | 创建 Stripe 客户门户 | Bearer Token |
| /subscriptions/stripe/status | GET | 获取 Stripe 订阅状态 | Bearer Token |

## 设备模块 (/devices)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /devices | GET | 获取设备列表 | Bearer Token |
| /devices/stats | GET | 获取设备统计 | Bearer Token |
| /devices/check-logout | GET | 检查是否已远程登出 | Bearer Token |
| /devices/register | POST | 注册设备 | Bearer Token |
| /devices/:deviceId | PUT | 更新设备信息 | Bearer Token |
| /devices/:deviceId/logout | POST | 远程登出设备 | Bearer Token |
| /devices/logout-others | POST | 登出其他所有设备 | Bearer Token |
| /devices/:deviceId | DELETE | 删除设备 | Bearer Token |
| /devices/:deviceId/primary | POST | 设为主设备 | Bearer Token |

## 批注模块 (Annotations)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /highlights | POST | 创建高亮 | Bearer Token |
| /highlights | GET | 获取所有高亮 | Bearer Token |
| /highlights/:id | GET | 获取高亮详情 | Bearer Token |
| /highlights/:id | PATCH | 更新高亮 | Bearer Token |
| /highlights/:id | DELETE | 删除高亮 | Bearer Token |
| /books/:bookId/highlights | GET | 获取书籍的高亮 | Bearer Token |
| /annotations | POST | 创建批注 | Bearer Token |
| /annotations | GET | 获取所有批注 | Bearer Token |
| /annotations/:id | GET/PATCH/DELETE | 批注 CRUD | Bearer Token |
| /bookmarks | POST | 创建书签 | Bearer Token |
| /bookmarks | GET | 获取所有书签 | Bearer Token |
| /bookmarks/:id | DELETE | 删除书签 | Bearer Token |
| /books/:bookId/bookmarks | GET | 获取书籍书签 | Bearer Token |
| /annotations/sync | POST | 同步批注数据 | Bearer Token |

## 分析模块 (/analytics)

| Endpoint | Method | 描述 | 认证 |
|----------|--------|------|------|
| /analytics/overview | GET | 获取概览数据 | Bearer Token |
| /analytics/daily | GET | 获取每日统计 | Bearer Token |
| /analytics/reading-trend | GET | 获取阅读趋势 | Bearer Token |
| /analytics/vocabulary-progress | GET | 获取词汇进度 | Bearer Token |
| /analytics/reading-progress | GET | 获取阅读进度 | Bearer Token |

## 其他模块

| 模块 | 路径前缀 | 描述 |
|------|---------|------|
| 徽章 | /badges | 用户成就徽章系统 |
| 推荐 | /recommendation | 发现页推荐 |
| 有声书 | /audiobooks | 有声书播放 |
| 双语阅读 | /bilingual | 双语章节内容 |
| 作者聊天 | /author-chat | AI 作者聊天 (文字/语音/视频) |
| 名言 | /quotes | 书籍名言警句 |
| 城邦 | /agora | 社区帖子 |
| 明信片 | /postcards | 阅读明信片分享 |
| 健康检查 | /health | 服务健康状态 |
| 配置 | /config | 客户端配置与功能开关 |
| 消息 | /messages | 用户消息与 FAQ |
