# 后端架构

> NestJS 10.x + Prisma ORM + PostgreSQL

---

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | NestJS | 10.4 |
| 语言 | TypeScript | 5.6 |
| 运行时 | Node.js | 20 |
| ORM | Prisma | 5.x |
| 数据库 | PostgreSQL (Neon) | 15+ |
| 缓存 | Redis (Upstash) | 7 |
| 队列 | BullMQ | - |
| 部署 | Fly.io | - |

---

## 模块架构 (37+ 模块)

| 模块类别 | 模块 | 说明 |
|---------|------|------|
| **核心服务** | auth | Apple/Google OAuth + JWT 认证 |
| | users | 用户管理、账户体系 |
| | devices | 设备追踪、跨设备同步 |
| | subscriptions | 订阅管理 (Apple/Google IAP 验证) |
| **阅读与内容** | books | 书籍目录 (539+ 本) |
| | chapters | 章节内容 (R2 存储) |
| | reading | 阅读会话、进度追踪 |
| | bookmarks | 书签 |
| | import | 内容入库 |
| **学习系统** | vocabulary | 词汇学习 (SM-2 间隔重复算法) |
| | characters | 角色关系图谱 (Wikidata 融合) |
| | annual-report | 年度阅读报告 |
| | medal-system | 成就徽章系统 |
| **AI 服务** | ai | 多供应商 LLM 路由 (DeepSeek/OpenAI/Claude/Qwen) |
| | author-chat | 作者人设 AI 聊天 |
| **有声书** | audiobooks | LibriVox/Internet Archive 有声书 |
| **社区功能** | agora | 社区动态、评论、点赞 |
| | messages | FAQ、用户消息 |
| | recommendations | 内容推荐 |
| | postcards | 数字明信片 |
| **运营管理** | admin | 管理后台 |
| | analytics | 用户分析 |
| | logs | 日志系统 |
| | jobs | 后台任务 (BullMQ) |
| | search | 全文搜索 (pg_trgm) |

---

## AI 多供应商路由

| 任务类型 | 主供应商 | 备用供应商 | 成本 |
|----------|----------|------------|------|
| 单词解释 | DeepSeek | OpenAI | 低 |
| 句子简化 | DeepSeek | OpenAI | 低 |
| 段落翻译 | DeepSeek | OpenAI | 中 |
| 内容问答 | OpenAI | Anthropic Claude | 中 |
| 文学分析 | Claude 3.5 Sonnet | GPT-4 | 高 |
| 批量处理 | DeepSeek | - | 低 |
| 中文翻译 | Qwen (阿里) | DeepSeek | 低 |

路由策略:
- 按任务类型自动选择最优供应商
- 主供应商失败时自动降级到备用供应商
- 响应缓存 (Redis) 避免重复调用

---

## SM-2 间隔重复算法

| 参数 | 说明 |
|------|------|
| EF (Easiness Factor) | 记忆难度系数，初始值 2.5 |
| 评分标准 | 0-5 分 (0=完全遗忘, 5=完美记忆) |
| 间隔计算 | 第1次: 1天, 第2次: 6天, 之后: 前次间隔 * EF |
| EF 调整 | 基于评分动态调整，最低 1.3 |

---

## 关键文件路径

| 文件 | 说明 |
|------|------|
| src/modules/ | 功能模块目录 |
| src/common/ | 共享工具和装饰器 |
| src/main.ts | 应用入口 |
| prisma/schema.prisma | 数据库 Schema (60+ 模型) |

---
