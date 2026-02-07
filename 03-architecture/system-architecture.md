### 2.1 整体架构

```mermaid
graph TD
    subgraph UserLayer["用户端"]
        iOS[iOS App] ~~~ Android[Android App] ~~~ Web[Web App] ~~~ RN["RN (未来)"]
    end

    subgraph GW["API Gateway"]
        Gateway["负载均衡 · 速率限制 · 认证验证 · SSL终止 · 请求路由 · 日志记录"]
    end

    iOS -->|HTTPS/WSS| Gateway
    Android -->|HTTPS/WSS| Gateway
    Web -->|HTTPS/WSS| Gateway
    RN -->|HTTPS/WSS| Gateway

    subgraph Backend["后端服务 NestJS - 17个模块"]
        Auth["Auth Module<br>登录注册 · OAuth<br>JWT管理 · 权限控制"] ~~~ Content["Content Module<br>书籍管理 · 章节管理<br>书单排行 · 搜索推荐"] ~~~ Learning["Learning Module<br>进度追踪 · 词汇管理<br>复习系统 · 统计分析"] ~~~ AIGw["AI Gateway 22+端点<br>模型路由 · 缓存控制<br>深度分析 · 对话AI"]
        Tracking["Tracking<br>事件追踪 · 进度统计"] ~~~ Booklists["Booklists<br>书单列表 · 排行榜"] ~~~ Badges["Badges<br>徽章定义 · 成就进度"] ~~~ Logs["Logs<br>客户端日志 · 崩溃报告"]
        Quotes["Quotes<br>书中金句 · 作者名言"] ~~~ Postcards["Postcards<br>模板管理 · 生成分享"] ~~~ Authors["Authors<br>作者管理 · AI人格"] ~~~ AIChat["AI Chat<br>文字 · 语音 · 视频"]
        Auth ~~~ Tracking ~~~ Quotes
    end

    Gateway --> Backend

    subgraph Storage["数据存储"]
        PG["PostgreSQL<br>用户数据 · 书籍元数据<br>学习进度 · 词汇数据 · 订阅信息"] ~~~ Redis["Redis<br>Session · AI响应缓存<br>热门书籍缓存 · 速率限制"] ~~~ ObjStore["Object Storage<br>EPUB文件 · 封面图片<br>用户上传 · 静态资源"]
    end

    Backend --> Storage

    subgraph AILayer["AI 服务层"]
        Router["AI Router 智能路由<br>任务类型选模型 · 成本质量平衡 · 自动降级重试"]
        DeepSeek["DeepSeek 主力<br>词汇解释 · 句子简化 · 基础问答"] ~~~ GPT["GPT-4o mini 备选<br>词汇解释 · 句子简化 · 基础问答"] ~~~ Claude["Claude 高级<br>深度分析 · 文学鉴赏 · 复杂问答"]
        Router --> DeepSeek
        Router --> GPT
        Router --> Claude
    end

    Storage --> AILayer
```

### 2.2 数据流图

```mermaid
flowchart TD
    A[用户点击单词] --> B[客户端请求解释]
    B --> C[本地词典查询]
    C --> D{命中?}
    D -->|Yes| E[返回本地释义]
    D -->|No| F[请求后端 API]
    F --> G[Redis 缓存检查]
    G --> H{命中?}
    H -->|Yes| I[返回缓存结果]
    H -->|No| J[AI Router 调用 AI]
    J --> K[保存缓存 + 返回结果]
```

---
