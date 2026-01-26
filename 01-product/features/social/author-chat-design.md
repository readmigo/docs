# 作者对话系统设计文档

> 模块名称: Author Chat Module
> 状态: ✅ 后端已实现
> 优先级: P1

---

## 1. 功能概述

作者对话系统允许用户与历史上的著名作者进行 AI 驱动的对话，通过角色扮演的方式深入了解作者的思想和作品。

### 1.1 核心功能

| 功能 | 说明 | 状态 |
|------|------|------|
| 创建会话 | 与指定作者开始对话 | ✅ 已实现 |
| 会话管理 | 查看、删除历史会话 | ✅ 已实现 |
| 发送消息 | 向作者发送问题 | ✅ 已实现 |
| 流式响应 | 实时流式返回 AI 回复 | ✅ 已实现 |
| 消息评分 | 对 AI 回复进行评分 | ✅ 已实现 |
| 语音对话 | 语音输入/输出 | 🚧 开发中 |
| 视频对话 | 视频形式的作者对话 | 🚧 开发中 |

### 1.2 AI 模型

- **模型**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **温度**: 0.8（增加创意和个性化）
- **最大 Token**: 1024

---

## 2. 数据模型

### 2.1 AuthorChatSession 会话

```typescript
interface ChatSession {
  id: string;              // 会话ID
  userId: string;          // 用户ID
  authorId: string;        // 作者ID
  title: string;           // 会话标题
  messageCount: number;    // 消息数量
  totalTokens: number;     // 总消耗 Token
  isActive: boolean;       // 是否激活
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
}
```

### 2.2 AuthorChatMessage 消息

```typescript
interface ChatMessage {
  id: string;              // 消息ID
  sessionId: string;       // 会话ID
  role: 'USER' | 'ASSISTANT';  // 角色
  content: string;         // 内容
  inputTokens?: number;    // 输入 Token（AI 回复）
  outputTokens?: number;   // 输出 Token（AI 回复）
  userRating?: number;     // 用户评分（1-5）
  createdAt: Date;         // 创建时间
}
```

### 2.3 作者人格数据

从 Author 表获取以下信息构建人格：

| 字段 | 说明 |
|------|------|
| name | 作者英文名 |
| nameZh | 作者中文名 |
| bio | 作者简介 |
| era | 时代背景 |
| nationality | 国籍 |
| birthPlace | 出生地 |
| writingStyle | 写作风格 |
| famousWorks | 代表作品 |
| literaryPeriod | 文学时期 |
| aiPersonaPrompt | 自定义人格提示词 |

---

## 3. API 接口

### 3.1 会话管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/author-chat/sessions` | 创建新会话 |
| GET | `/author-chat/sessions` | 获取会话列表 |
| GET | `/author-chat/sessions/:id` | 获取会话详情（含消息） |
| DELETE | `/author-chat/sessions/:id` | 删除会话 |

### 3.2 消息交互

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/author-chat/sessions/:id/messages` | 发送消息 |
| POST | `/author-chat/sessions/:id/stream` | 流式发送消息（SSE） |
| POST | `/author-chat/messages/:id/rate` | 评价消息 |

### 3.3 请求/响应示例

**创建会话**
```json
POST /author-chat/sessions
{
  "authorId": "author-123",
  "title": "Chat with Jane Austen"
}
```

**发送消息**
```json
POST /author-chat/sessions/:id/messages
{
  "content": "What inspired you to write Pride and Prejudice?"
}
```

**响应**
```json
{
  "userMessage": {
    "id": "msg-1",
    "role": "USER",
    "content": "What inspired you to write Pride and Prejudice?",
    "createdAt": "2025-12-28T10:00:00Z"
  },
  "assistantMessage": {
    "id": "msg-2",
    "role": "ASSISTANT",
    "content": "My dear friend, the inspiration for Pride and Prejudice...",
    "createdAt": "2025-12-28T10:00:01Z"
  }
}
```

---

## 4. 人格构建

### 4.1 System Prompt 结构

```typescript
buildAuthorPersonaPrompt({
  name,          // 作者名
  nameZh,        // 中文名
  bio,           // 传记
  era,           // 时代
  nationality,   // 国籍
  birthPlace,    // 出生地
  writingStyle,  // 写作风格
  famousWorks,   // 代表作
  literaryPeriod,// 文学时期
  aiPersonaPrompt,// 自定义提示
})
```

### 4.2 对话上下文

- 保留最近 20 条消息作为上下文
- 包含用户消息和 AI 回复
- 支持分页加载历史消息

---

## 5. 代码位置

| 文件 | 说明 |
|------|------|
| `apps/backend/src/modules/author-chat/author-chat.module.ts` | 模块定义 |
| `apps/backend/src/modules/author-chat/author-chat.service.ts` | 业务逻辑 |
| `apps/backend/src/modules/author-chat/author-chat.controller.ts` | API 控制器 |
| `apps/backend/src/modules/author-chat/prompts/author-persona.ts` | 人格提示词 |
| `apps/backend/src/modules/author-chat/dto/` | DTO 定义 |
| `apps/backend/src/modules/author-chat/voice/` | 语音功能 |
| `apps/backend/src/modules/author-chat/video/` | 视频功能 |

---

## 6. 实施状态

### 6.1 后端

| 功能 | 状态 | 说明 |
|------|------|------|
| 会话 CRUD | ✅ 已完成 | 创建/查询/删除 |
| 消息发送 | ✅ 已完成 | 同步和流式 |
| AI 调用 | ✅ 已完成 | Claude 3.5 Sonnet |
| 人格系统 | ✅ 已完成 | 动态构建提示词 |
| Token 统计 | ✅ 已完成 | 记录消耗 |
| 消息评分 | ✅ 已完成 | 1-5 分评价 |
| 运行时日志 | ✅ 已完成 | 完整日志记录 |
| 语音对话 | 🚧 开发中 | voice/ 目录 |
| 视频对话 | 🚧 开发中 | video/ 目录 |

### 6.2 客户端

| 平台 | 状态 | 说明 |
|------|------|------|
| iOS | ✅ 已实现 | AuthorProfileView 中的聊天入口 |
| Web | 📝 待实现 | - |
| Android | 📝 待实现 | - |

---

## 7. 后续规划

### P1 - 语音对话
- [ ] 语音转文字（Whisper）
- [ ] 文字转语音（TTS）
- [ ] 作者特色语音合成

### P2 - 视频对话
- [ ] 作者 Avatar 动画
- [ ] 口型同步
- [ ] 表情生成

### P3 - 功能增强
- [ ] 多作者群聊
- [ ] 作者推荐对话话题
- [ ] 对话导出为文章
- [ ] 对话分享功能

### P4 - 优化
- [ ] 响应缓存（常见问题）
- [ ] 人格微调（基于评分反馈）
- [ ] 多语言人格支持

---

## 8. 与其他模块关联

| 模块 | 关联说明 |
|------|----------|
| Authors | 获取作者信息构建人格 |
| AI | 使用 Anthropic Provider |
| Logs | 运行时日志记录 |
| Redis | 会话缓存 |

---

## 9. 使用限制

| 用户类型 | 限制 |
|----------|------|
| 免费用户 | 每日 5 次对话 |
| Premium | 无限制 |

*注：具体限制规则待与会员系统整合*

---

*最后更新: 2025-12-28*
