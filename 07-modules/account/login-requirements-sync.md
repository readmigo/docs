# 登录需求同步文档

> Version: 1.0
> Date: 2025-12-26
> Status: Current

本文档整合了登录需求分析结果，并与代码实现进行比对，记录差异和待实现项。

---

## 1. API 登录需求矩阵

### 1.1 不需要登录的公开 API

| 模块 | API | 设计状态 | 实现状态 | 备注 |
|------|-----|----------|----------|------|
| **Books** | `GET /books` | 公开 | ✅ 已实现 | 书籍列表 |
| | `GET /books/:id` | 公开 | ✅ 已实现 | 书籍详情 |
| | `GET /books/genres` | 公开 | ✅ 已实现 | 书籍分类 |
| | `GET /books/:id/content/:chapterId` | 公开 | ✅ 已实现 | 章节内容（试读） |
| | `GET /books/:id/chapters/batch` | 公开 | ✅ 已实现 | 批量章节 |
| **Authors** | `GET /authors` | 公开 | ✅ 已实现 | 作者列表 |
| | `GET /authors/:id` | 公开 | ✅ 已实现 | 作者详情 |
| | `GET /authors/search` | 公开 | ✅ 已实现 | 作者搜索 |
| | `GET /authors/:id/related` | 公开 | ✅ 已实现 | 相关作者 |
| **Quotes** | `GET /quotes` | 公开 | ✅ 已实现 | 引言列表 |
| | `GET /quotes/daily` | 公开 | ✅ 已实现 | 每日引言 |
| | `GET /quotes/random` | 公开 | ✅ 已实现 | 随机引言 |
| | `GET /quotes/trending` | 公开 | ✅ 已实现 | 热门引言 |
| | `GET /quotes/:id` | 公开 | ✅ 已实现 | 引言详情 |
| | `GET /quotes/tags` | 公开 | ✅ 已实现 | 标签列表 |
| | `GET /quotes/book/:bookId` | 公开 | ✅ 已实现 | 书籍引言 |
| | `GET /quotes/author/:author` | 公开 | ✅ 已实现 | 作者引言 |
| **BookLists** | `GET /booklists` | 公开 | ✅ 已实现 | 书单列表 |
| | `GET /booklists/:id` | 公开 | ✅ 已实现 | 书单详情 |
| | `GET /booklists/types` | 公开 | ✅ 已实现 | 书单类型 |
| **Categories** | `GET /categories` | 公开 | ✅ 已实现 | 分类树 |
| | `GET /categories/:id/books` | 公开 | ✅ 已实现 | 分类书籍 |
| **Search** | `GET /search` | 公开 | ✅ 已实现 | 统一搜索 |
| | `GET /search/suggestions` | 公开 | ✅ 已实现 | 搜索建议 |
| | `GET /search/popular` | 公开 | ✅ 已实现 | 热门搜索 |
| | `GET /search/trending` | 公开 | ✅ 已实现 | 趋势搜索 |
| **Auth** | `POST /auth/apple` | 公开 | ✅ 已实现 | Apple 登录 |
| | `POST /auth/google` | 公开 | ✅ 已实现 | Google 登录 |
| | `POST /auth/refresh` | 公开 | ✅ 已实现 | Token 刷新 |
| | `POST /auth/guest` | 公开 | ✅ 已实现 | Guest 账户创建 |
| | `POST /auth/upgrade` | JWT | ✅ 已实现 | Guest 升级为正式账户 |
| | `POST /auth/logout` | JWT | ✅ 已实现 | 登出（支持 continueAsGuest） |

### 1.2 需要登录的 API（JWT Required）

| 模块 | API | Guard | 备注 |
|------|-----|-------|------|
| **Books** | `GET /books/recommendations` | JWT | 个性化推荐 |
| | `POST /books` | JWT | 创建书籍 (Admin) |
| | `PATCH /books/:id` | JWT | 更新书籍 (Admin) |
| | `GET /books/:id/audio` | JWT | 有声书信息 |
| | `POST /books/import` | JWT | 导入书籍 |
| **Authors** | `GET /authors/following` | JWT | 关注的作者 |
| | `GET /authors/:id/reading-progress` | JWT | 阅读进度 |
| | `POST /authors/:id/follow` | JWT | 关注作者 |
| | `DELETE /authors/:id/follow` | JWT | 取消关注 |
| **Quotes** | `GET /quotes/favorites` | JWT | 收藏引言 |
| | `POST /quotes/:id/like` | JWT | 点赞引言 |
| | `DELETE /quotes/:id/like` | JWT | 取消点赞 |
| **BookLists** | `GET /booklists/ai-personalized` | JWT | AI 个性化书单 |
| **Reading** | 全部端点 | JWT | 阅读会话管理 |
| **Vocabulary** | 全部端点 | JWT + Sub + Usage | 词汇管理 |
| **AI** | 全部端点 | JWT + Sub + Usage | AI 功能 |
| **Sync** | 全部端点 | JWT | 进度同步 |
| **Subscriptions** | 全部端点 | JWT | 订阅管理 |
| **Author-Chat** | 全部端点 | JWT + Sub + Usage | 作者对话 |
| **Messages** | 全部端点 | JWT | 消息系统 |
| **Postcards** | 大部分端点 | JWT | 明信片功能 |
| **Analytics** | 全部端点 | JWT | 分析数据 |
| **Tracking** | 全部端点 | JWT | 追踪数据 |
| **Badges** | 部分端点 | JWT | 徽章系统 |
| **Users** | 全部端点 | JWT | 用户信息 |
| **Audiobooks** | 部分端点 | JWT | 有声书播放 |
| **Logs** | 部分端点 | JWT | 日志记录 |
| **Config** | 部分端点 | JWT | 配置管理 |
| **Annual-Report** | 全部端点 | JWT | 年度报告 |
| **Agora** | 大部分端点 | JWT | 社区功能 |

---

## 2. 设计与实现差异

### 2.1 重大差异

| 项目 | 设计文档 | 实际代码 | 状态 |
|------|----------|----------|------|
| **Guest 账户 API** | `POST /auth/guest` 在 `system-design.md` 规划 | ✅ 已实现 | 完成 |
| **账户类型** | `Account` 表支持 `GUEST` 类型 | ✅ User 表扩展 accountType 字段 | 完成 |
| **设备绑定** | `Device` 表和设备历史 | ✅ Device 表已实现 | 完成 |
| **账户升级** | `AccountBinding` 表支持游客升级 | ✅ 自关联实现（boundToId 字段） | 完成 |
| **数据迁移** | Guest 升级时的数据迁移服务 | ✅ migrateGuestData 方法已实现 | 完成 |

### 2.2 已实现且符合设计

| 项目 | 说明 |
|------|------|
| Apple/Google 登录 | 完全实现 |
| JWT Token 管理 | 完全实现 |
| 订阅系统 | 完全实现 |
| 权限守卫 | `SubscriptionGuard`, `UsageLimitGuard` 已实现 |
| 使用量限制 | 后端已实现 |
| 公开 API | 书籍、作者、引言、搜索等只读 API 均已公开 |

### 2.3 客户端状态

| 平台 | Guest 模式 | 说明 |
|------|------------|------|
| iOS | 规划中 | `docs/04-development/platforms/ios/guest-mode-plan.md` |
| Android | 规划中 | `docs/07-modules/modules/guest-mode.md` |

---

## 3. 登录场景总结

### 3.1 完全不需要登录（只读）

```
用户可以：
├── 浏览书籍列表和详情
├── 浏览作者列表和详情
├── 查看每日名言
├── 搜索书籍/作者
├── 浏览书单和分类
├── 试读章节内容
└── 查看热门/趋势内容
```

### 3.2 需要登录（写入/个性化）

```
用户必须登录才能：
├── 保存书籍到书架
├── 记录阅读进度
├── 添加书签/高亮/笔记
├── 保存词汇
├── 使用 AI 功能
├── 点赞/收藏引言
├── 关注作者
├── 获取个性化推荐
├── 同步数据到云端
└── 进行订阅购买
```

### 3.3 需要订阅（付费功能）

```
PRO 订阅功能：
├── 无限 AI 调用
├── 无限词汇保存
├── 间隔重复复习
├── 离线下载
├── 语音聊天 (30分钟/月)
└── 详细统计报告

PREMIUM 订阅功能：
├── 高级 AI (GPT-4/Claude)
├── 视频聊天
├── 无限语音聊天
└── 优先客服支持
```

---

## 4. 待实现项 (Implementation Gaps)

### 4.1 后端待实现

| 优先级 | 任务 | 相关文档 | 状态 |
|--------|------|----------|------|
| ~~P0~~ | ~~实现 `POST /auth/guest` API~~ | `system-design.md` | ✅ 完成 |
| ~~P0~~ | ~~添加 `Account` 类型扩展~~ | `system-design.md` | ✅ 完成 (accountType 字段) |
| ~~P1~~ | ~~实现 `POST /auth/upgrade` API~~ | `system-design.md` | ✅ 完成 |
| ~~P1~~ | ~~实现 `POST /auth/logout` 支持 `continueAsGuest`~~ | `system-design.md` | ✅ 完成 |
| ~~P1~~ | ~~实现数据迁移服务~~ | `system-design.md` | ✅ 完成 (migrateGuestData) |
| ~~P2~~ | ~~实现独立 Device 表和历史记录~~ | `system-design.md` | ✅ 完成 (Device 表已实现) |

### 4.2 客户端待实现

| 平台 | 任务 | 相关文档 |
|------|------|----------|
| iOS | 实现 Guest 模式状态管理 | `ios/guest-mode-plan.md` |
| iOS | 实现登录提示时机 | `login-necessity-analysis.md` |
| Android | 实现 Guest 模式状态管理 | `android/modules/guest-mode.md` |
| Android | 实现登录提示时机 | `login-necessity-analysis.md` |

---

## 5. 核心原则确认

### 5.1 登录必要性原则

```
简化公式：
├── 读 = 不需要登录
├── 写 = 需要登录
└── 付费 = 需要登录（为了可恢复性）
```

### 5.2 订阅必须绑定账户

技术上可以实现匿名订阅，但会导致：
- 卸载应用后无法恢复购买
- 换设备后订阅丢失
- 无法多设备共享订阅
- 客服无法协助处理

**决定：维持现有设计，订阅必须登录**

### 5.3 Guest 模式定位

Guest 不是"匿名账户"，而是"未认证状态的体验优化"：
- 允许用户先体验再注册
- 只能做只读操作
- 任何写入操作触发登录提示

---

## 6. 相关文档索引

| 文档 | 位置 | 说明 |
|------|------|------|
| 账户系统设计 | `docs/07-modules/account/system-design.md` | 完整账户体系设计 |
| 用户权限规格 | `docs/07-modules/account/user-permissions-spec.md` | 权限矩阵和实现 |
| 登录必要性分析 | `docs/03-architecture/login-necessity-analysis.md` | 登录场景分析 |
| iOS Guest 模式 | `docs/04-development/platforms/ios/guest-mode-plan.md` | iOS 实现计划 |
| Guest 模式（模块） | `docs/07-modules/modules/guest-mode.md` | 跨平台 Guest 模式定义 |
| iOS 登录设计 | `docs/04-development/platforms/ios/login-design.md` | iOS 登录页面设计 |
| Android Auth（平台） | `docs/04-development/platforms/android/features/auth.md` | Android 认证设计 |

---

## 7. 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-12-26 | 1.0 | 初始版本，整合登录需求分析和实现差异 |
| 2025-12-26 | 1.1 | 实现 Guest 账户 API，更新实现状态 |
| 2025-12-26 | 1.2 | 实现 logout with continueAsGuest |
| 2025-12-26 | 1.3 | 实现 Device 表和设备追踪 |

---

*Document Status: Active*
*Next Review: 客户端 Guest 模式实现后*
