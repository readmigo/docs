# 特色功能文档

> Readmigo 特色功能模块相关文档

---

## 模块概述

Features 模块包含 Readmigo 的各种特色功能：

- **金句收藏**: 经典名句收藏与分享
- **明信片分享**: 将金句制作成精美图片
- **作者对话**: AI 驱动的作者角色扮演对话
- **勋章系统**: 阅读成就、学习徽章
- **年度阅读报告**: 年度阅读数据总结
- **客户支持**: 用户反馈、客服系统
- **人物关系图**: 书籍人物可视化关系网络
- **故事时间线**: 故事事件时间脉络可视化
- **外文精读**: 经典英文原文深度阅读

---

## 文档索引（按模块分类）

### Social

| 文档 | 说明 | 对应模块/系统文档 |
|------|------|---|
| [quotes-system-design.md](./social/quotes-system-design.md) | 金句系统设计 | [social.md](../../07-modules/modules/social.md) |
| [postcards-system-design.md](./social/postcards-system-design.md) | 明信片系统设计 | [social.md](../../07-modules/modules/social.md) |
| [author-chat-design.md](./social/author-chat-design.md) | 作者对话系统设计 | [social.md](../../07-modules/modules/social.md) |

### Gamification

| 文档 | 说明 | 对应模块/系统文档 |
|------|------|---|
| [medal-system-design.md](./gamification/medal-system-design.md) | 勋章系统设计 | [reading.md](../../07-modules/modules/reading.md) |
| [annual-reading-report-design.md](./gamification/annual-reading-report-design.md) | 年度阅读报告设计 | [analytics.md](../../07-modules/modules/analytics.md) |

### Reading Enhancement

| 文档 | 说明 | 对应模块/系统文档 |
|------|------|---|
| [character-relationship-map-design.md](./reading-enhancement/character-relationship-map-design.md) | 人物关系图设计 | [reader.md](../../07-modules/modules/reader.md) |
| [story-timeline-design.md](./reading-enhancement/story-timeline-design.md) | 故事时间线设计 | [reader.md](../../07-modules/modules/reader.md) |
| [intensive-reading-design.md](./reading-enhancement/intensive-reading-design.md) | 外文精读模块设计 | [reader.md](../../07-modules/modules/reader.md) |
| [reading-guide-design.md](./reading-enhancement/reading-guide-design.md) | 阅读指南设计 | [reader.md](../../07-modules/modules/reader.md) |
| [book-context-module.md](./reading-enhancement/book-context-module.md) | 书籍上下文模块 | [reader.md](../../07-modules/modules/reader.md) |

### Account

| 文档 | 说明 | 对应模块/系统文档 |
|------|------|---|
| [account-membership-relationship.md](./account/account-membership-relationship.md) | 账号会员关系 | [account/system-design.md](../../07-modules/account/system-design.md) |

### Support

| 文档 | 说明 | 对应模块/系统文档 |
|------|------|---|
| [customer-support-system-design.md](./support/customer-support-system-design.md) | 客服系统设计 | [messaging.md](../../07-modules/modules/messaging.md) |

---

## 相关文档（已拆分到其他目录）

- 本地化：`docs/04-development/backend/localization/`
- iOS 特定：`docs/04-development/platforms/ios/features/`
- 研究：`docs/09-reference/research/`

--- 

## 实现状态

### 勋章系统
| 功能 | 状态 | 说明 |
|------|------|------|
| 勋章定义 | 📝 设计中 | 勋章类型和获取条件 |
| 勋章展示 | 📝 规划中 | 用户勋章墙 |
| 获取逻辑 | 📝 规划中 | 自动触发和手动领取 |

### 年度阅读报告
| 功能 | 状态 | 说明 |
|------|------|------|
| 数据统计 | 📝 规划中 | 年度阅读数据汇总 |
| 报告生成 | 📝 规划中 | 可视化报告 |
| 分享功能 | 📝 规划中 | 社交分享 |

### 客户支持
| 功能 | 状态 | 说明 |
|------|------|------|
| 反馈入口 | 📝 规划中 | 应用内反馈 |
| 工单系统 | 📝 规划中 | 问题跟踪 |
| FAQ | 📝 规划中 | 常见问题 |

### 人物关系图
| 功能 | 状态 | 说明 |
|------|------|------|
| 人物提取 | 📝 设计中 | AI 自动提取书籍人物 |
| 关系识别 | 📝 设计中 | 识别人物间关系类型 |
| 可视化展示 | 📝 设计中 | 关系图交互展示 |
| 人物详情 | 📝 设计中 | 人物卡片信息 |

### 故事时间线
| 功能 | 状态 | 说明 |
|------|------|------|
| 事件提取 | 📝 设计中 | AI 提取关键事件 |
| 时间排序 | 📝 设计中 | 故事时间/叙事时间 |
| 时间线展示 | 📝 设计中 | 可视化时间线组件 |
| 章节跳转 | 📝 设计中 | 从事件跳转阅读 |

### 外文精读
| 功能 | 状态 | 说明 |
|------|------|------|
| 文章库 | 📝 设计中 | 经典文章收录 (已规划 5 篇) |
| 阅读界面 | 📝 规划中 | 沉浸式阅读体验 |
| 词汇整合 | 📝 规划中 | 与生词本系统打通 |
| 背景资料 | 📝 规划中 | 作者、时代背景介绍 |

---

## 代码位置

### 后端服务（已实现）
- `apps/backend/src/modules/quotes/` - 金句服务 ✅
- `apps/backend/src/modules/postcards/` - 明信片服务 ✅
- `apps/backend/src/modules/author-chat/` - 作者对话服务 ✅
- `apps/backend/src/modules/support/` - 客户支持服务 ✅

### 后端服务（待开发）
- `apps/backend/src/modules/badges/` - 勋章服务
- `apps/backend/src/modules/medals/` - 成就勋章服务
- `apps/backend/src/modules/annual-report/` - 年度报告服务
- `apps/backend/src/modules/characters/` - 人物关系服务

### iOS 客户端
- `ios/Readmigo/Features/Badges/` - 勋章功能
- `ios/Readmigo/Features/Stats/` - 统计功能
- `ios/Readmigo/Features/Settings/` - 反馈入口
- `ios/Readmigo/Features/AuthorChat/` - 作者对话（待开发）

---

*最后更新: 2025-12-28*
