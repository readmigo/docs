# 07-modules

功能模块与系统设计文档（跨平台）。

## 与 01-product 的重叠关系（刻意的）

同一主题通常会在两个视角同时出现：

- `01-product/`：产品视角（What/Why）— 需求、范围、交互与优先级
- `07-modules/`：模块视角（How/Constraints）— 数据模型、API、跨端实现边界

原则：**允许重叠，但避免重复粘贴**；在两侧互相链接，保持单点事实来源。

- [模块总览](./modules/)
- [Reader](./reader/)
- [Audiobook](./audiobook/)
- [Learning](./learning/)
- [Author](./author/)
- [AI](./ai/ai-services-architecture.md)
- [Account](./account/system-design.md)
- [Agora](./agora/feature-design.md)

## 产品功能入口（对应到 01-product）

| 模块/主题 | 产品文档（01-product） | 模块文档（07-modules） |
|---|---|---|
| Social（金句/明信片/作者对话等） | `../01-product/features/social/` | [social.md](./modules/social.md) |
| Gamification（勋章/年度报告） | `../01-product/features/gamification/` | [reading.md](./modules/reading.md) |
| Reading Enhancement（人物关系/时间线/精读等） | `../01-product/features/reading-enhancement/` | [reader.md](./modules/reader.md) |
| Account（账号/会员关系） | [account-membership-relationship.md](../01-product/features/account/account-membership-relationship.md) | [account/system-design.md](./account/system-design.md) |
| Subscriptions（订阅） | [subscription-design.md](../01-product/subscription-design.md) | [subscriptions.md](./modules/subscriptions.md) |
