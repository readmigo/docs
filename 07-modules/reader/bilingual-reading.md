# 双语阅读功能实现原理

## 概述

双语阅读功能为用户提供中英文对照阅读体验，支持一键切换语言、点击词汇查看释义。所有数据（翻译、分词、词汇释义）均为预处理下发，无需实时网络请求。

---

## 功能特性

| 特性 | 说明 |
| ---- | ---- |
| 双语段落 | 每个段落同时包含英文和中文版本 |
| 语言切换 | 一键切换全文显示语言，默认英文 |
| 预分词 | 段落文本已按词组/单词预先分割 |
| 词汇弹窗 | 点击任意词组显示释义卡片 |
| 离线可用 | 所有数据预下发，无需网络请求 |

---

## 整体架构

```mermaid
flowchart TD
    subgraph 服务端预处理
        CONTENT[原始英文内容] --> TRANSLATE[机器翻译]
        TRANSLATE --> ZH[中文译文]
        CONTENT --> TOKENIZE[分词处理]
        TOKENIZE --> TOKENS[词组列表]
        TOKENS --> DICT[词典匹配]
        DICT --> VOCAB[词汇释义]
    end

    subgraph 数据下发
        ZH --> PARA[段落数据包]
        TOKENS --> PARA
        VOCAB --> PARA
        PARA --> CLIENT[客户端]
    end

    subgraph 客户端渲染
        CLIENT --> RENDER[渲染引擎]
        RENDER --> DISPLAY[页面显示]
        DISPLAY --> INTERACT[用户交互]
    end
```

---

## 数据结构设计

### 章节数据结构

```mermaid
flowchart TD
    CHAPTER[Chapter] --> PARAGRAPHS[paragraphs 数组]
    PARAGRAPHS --> PARA1[Paragraph 1]
    PARAGRAPHS --> PARA2[Paragraph 2]
    PARAGRAPHS --> PARAN[Paragraph N]

    PARA1 --> EN[en: 英文内容]
    PARA1 --> ZH[zh: 中文内容]
    PARA1 --> TOKENS[tokens: 分词数组]

    EN --> EN_TOKENS[英文分词列表]
    ZH --> ZH_TEXT[中文文本]
    TOKENS --> TOKEN1[Token 1]
    TOKENS --> TOKEN2[Token 2]
```

### 段落数据模型

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | String | 段落唯一标识 |
| en | TokenizedContent | 英文内容（含分词） |
| zh | String | 中文译文 |
| type | Enum | 段落类型（正文/标题/引用等） |

### 分词内容结构（TokenizedContent）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| raw | String | 原始文本 |
| tokens | Token[] | 分词后的词组数组 |

### 词组数据模型（Token）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | String | 词组唯一标识 |
| text | String | 词组文本 |
| start | Number | 在原文中的起始位置 |
| end | Number | 在原文中的结束位置 |
| type | Enum | 类型（word/phrase/punctuation） |
| vocab_id | String | 关联词汇表 ID（可选） |

### 词汇释义数据模型（Vocabulary）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | String | 词汇唯一标识 |
| word | String | 词汇原形 |
| phonetic | String | 音标 |
| audio_url | String | 发音音频（预缓存） |
| definitions | Definition[] | 释义列表 |
| examples | Example[] | 例句列表 |

### 释义数据模型（Definition）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| pos | String | 词性（n./v./adj. 等） |
| en | String | 英文释义 |
| zh | String | 中文释义 |

---

## 数据层级关系

```mermaid
erDiagram
    CHAPTER ||--o{ PARAGRAPH : contains
    PARAGRAPH ||--|| TOKENIZED_EN : has
    PARAGRAPH ||--|| ZH_TEXT : has
    TOKENIZED_EN ||--o{ TOKEN : contains
    TOKEN ||--o| VOCABULARY : references
    VOCABULARY ||--o{ DEFINITION : has
    VOCABULARY ||--o{ EXAMPLE : has

    CHAPTER {
        string id
        string title
        int order
    }

    PARAGRAPH {
        string id
        string type
        int order
    }

    TOKENIZED_EN {
        string raw
    }

    TOKEN {
        string id
        string text
        int start
        int end
        string type
    }

    VOCABULARY {
        string id
        string word
        string phonetic
        string audio_url
    }

    DEFINITION {
        string pos
        string en
        string zh
    }
```

---

## 语言切换机制

### 切换流程

```mermaid
flowchart TD
    INIT[页面初始化] --> DEFAULT[默认显示英文]
    DEFAULT --> RENDER_EN[渲染英文分词内容]

    USER[用户点击切换按钮] --> CHECK{当前语言?}
    CHECK --> |英文| SWITCH_ZH[切换到中文]
    CHECK --> |中文| SWITCH_EN[切换到英文]

    SWITCH_ZH --> HIDE_EN[隐藏英文层]
    HIDE_EN --> SHOW_ZH[显示中文层]
    SHOW_ZH --> UPDATE[更新按钮状态]

    SWITCH_EN --> HIDE_ZH[隐藏中文层]
    HIDE_ZH --> SHOW_EN[显示英文层]
    SHOW_EN --> UPDATE
```

### 语言状态管理

| 状态 | 值 | 说明 |
| ---- | -- | ---- |
| currentLanguage | 'en' / 'zh' | 当前显示语言 |
| defaultLanguage | 'en' | 默认语言（英文） |

### 切换按钮设计

```mermaid
flowchart LR
    subgraph 按钮状态
        BTN_EN[EN 高亮] --> |点击| BTN_ZH[中 高亮]
        BTN_ZH --> |点击| BTN_EN
    end

    subgraph 位置选项
        P1[顶部工具栏]
        P2[悬浮按钮]
        P3[底部导航]
    end
```

---

## 段落渲染机制

### 双层渲染结构

```mermaid
flowchart TD
    PARA[段落容器] --> EN_LAYER[英文层]
    PARA --> ZH_LAYER[中文层]

    EN_LAYER --> |visible| TOKENS[分词渲染]
    ZH_LAYER --> |hidden| TEXT[纯文本渲染]

    TOKENS --> T1[Token 1]
    TOKENS --> T2[Token 2]
    TOKENS --> TN[Token N]

    T1 --> |可点击| CLICK[点击事件]
```

### 渲染层级

| 层级 | 内容 | 默认状态 | 交互性 |
| ---- | ---- | -------- | ------ |
| 英文层 | 分词后的可点击文本 | 显示 | 支持点击查词 |
| 中文层 | 翻译文本 | 隐藏 | 纯展示 |

### 段落渲染流程

```mermaid
flowchart TD
    DATA[段落数据] --> CREATE[创建段落容器]

    CREATE --> EN_RENDER[渲染英文层]
    CREATE --> ZH_RENDER[渲染中文层]

    EN_RENDER --> LOOP[遍历 tokens]
    LOOP --> TOKEN_TYPE{token 类型?}

    TOKEN_TYPE --> |word/phrase| SPAN_CLICK[创建可点击元素]
    TOKEN_TYPE --> |punctuation| SPAN_TEXT[创建纯文本元素]

    SPAN_CLICK --> BIND[绑定点击事件]
    BIND --> APPEND_EN[添加到英文层]
    SPAN_TEXT --> APPEND_EN

    ZH_RENDER --> TEXT_NODE[创建文本节点]
    TEXT_NODE --> APPEND_ZH[添加到中文层]

    APPEND_EN --> STYLE[应用样式]
    APPEND_ZH --> STYLE
    STYLE --> DONE[渲染完成]
```

---

## 分词与词汇交互

### 分词预处理流程

```mermaid
flowchart TD
    subgraph 服务端处理
        RAW[原始英文文本] --> NLP[NLP 分词引擎]
        NLP --> SEGMENT[分词结果]
        SEGMENT --> CLASSIFY[词组分类]
        CLASSIFY --> MATCH[词典匹配]
        MATCH --> ENRICH[关联释义数据]
        ENRICH --> OUTPUT[输出分词数据]
    end

    subgraph 分词类型
        CLASSIFY --> W[单词 word]
        CLASSIFY --> P[词组 phrase]
        CLASSIFY --> S[标点 punctuation]
        CLASSIFY --> SP[空格 space]
    end
```

### 词组类型

| 类型 | 说明 | 可点击 | 示例 |
| ---- | ---- | ------ | ---- |
| word | 独立单词 | 是 | "beautiful" |
| phrase | 固定词组/短语 | 是 | "look forward to" |
| punctuation | 标点符号 | 否 | "." "," "!" |
| space | 空格 | 否 | " " |

### 点击查词流程

```mermaid
flowchart TD
    CLICK[用户点击词组] --> GET_ID[获取 token ID]
    GET_ID --> FIND[查找关联 vocab_id]

    FIND --> HAS{有词汇数据?}
    HAS --> |是| FETCH[获取词汇详情]
    HAS --> |否| BASIC[显示基本信息]

    FETCH --> POPUP[显示词汇弹窗]
    BASIC --> POPUP

    subgraph 弹窗内容
        POPUP --> WORD[词汇/词组]
        POPUP --> PHONETIC[音标]
        POPUP --> AUDIO[发音按钮]
        POPUP --> DEFS[释义列表]
        POPUP --> EXAMPLES[例句]
    end
```

### 词汇弹窗设计

```mermaid
flowchart TD
    subgraph 弹窗结构
        HEADER[头部: 词汇 + 音标 + 发音]
        BODY[主体: 释义列表]
        FOOTER[底部: 例句 + 操作按钮]
    end

    HEADER --> H1[词汇文本]
    HEADER --> H2[音标 /fəˈnetɪk/]
    HEADER --> H3[发音图标]

    BODY --> D1[n. 名词释义]
    BODY --> D2[v. 动词释义]
    BODY --> D3[adj. 形容词释义]

    FOOTER --> E1[例句 1]
    FOOTER --> E2[例句 2]
    FOOTER --> BTN[收藏/添加到生词本]
```

### 弹窗交互

| 触发方式 | 行为 |
| -------- | ---- |
| 点击词组 | 显示弹窗 |
| 点击弹窗外部 | 关闭弹窗 |
| 点击发音图标 | 播放音频 |
| 点击收藏按钮 | 添加到生词本 |
| 滑动页面 | 关闭弹窗 |

---

## 数据下发策略

### 下发时机

```mermaid
flowchart TD
    OPEN[打开书籍] --> LOAD[加载书籍元数据]
    LOAD --> CHAPTER[获取章节列表]

    CHAPTER --> CURRENT[下载当前章节]
    CHAPTER --> PREFETCH[预加载相邻章节]

    CURRENT --> PARSE[解析章节数据]
    PARSE --> CACHE[缓存到本地]
    CACHE --> RENDER[渲染页面]

    PREFETCH --> NEXT[下一章节]
    PREFETCH --> PREV[上一章节]
```

### 数据包结构

| 组件 | 包含内容 | 说明 |
| ---- | -------- | ---- |
| 章节内容包 | 段落数组（含双语、分词） | 章节主体数据 |
| 词汇表包 | 该章节涉及的所有词汇释义 | 去重后的词汇数据 |
| 音频资源包 | 词汇发音音频文件 | 可选下载 |

### 缓存策略

```mermaid
flowchart LR
    REQUEST[请求章节] --> CHECK{本地缓存?}
    CHECK --> |命中| LOCAL[返回本地数据]
    CHECK --> |未命中| DOWNLOAD[下载数据]

    DOWNLOAD --> STORE[存入缓存]
    STORE --> LOCAL

    subgraph 缓存层级
        L1[内存缓存 - 当前章节]
        L2[磁盘缓存 - 最近章节]
        L3[数据库 - 已下载书籍]
    end
```

---

## 渲染性能优化

### 虚拟化渲染

```mermaid
flowchart TD
    CHAPTER[章节数据] --> VIEWPORT[可视区域检测]
    VIEWPORT --> VISIBLE[计算可见段落]
    VISIBLE --> RENDER[仅渲染可见内容]

    SCROLL[滚动事件] --> RECALC[重新计算可见区域]
    RECALC --> UPDATE[更新渲染内容]

    subgraph 缓冲区
        ABOVE[上方缓冲 2-3 段]
        CURRENT[当前可见区域]
        BELOW[下方缓冲 2-3 段]
    end
```

### 渲染优化策略

| 策略 | 说明 | 效果 |
| ---- | ---- | ---- |
| 懒加载 | 仅渲染可视区域段落 | 减少初始渲染时间 |
| 缓冲区 | 预渲染上下相邻段落 | 平滑滚动体验 |
| 复用 DOM | 滚动时复用段落容器 | 减少 DOM 操作 |
| 分批渲染 | 大章节分批次渲染 | 避免主线程阻塞 |

---

## 用户交互状态

### 状态管理

```mermaid
stateDiagram-v2
    [*] --> Idle: 初始化

    Idle --> Selecting: 长按/拖动
    Selecting --> Selected: 释放
    Selected --> Idle: 点击其他区域

    Idle --> WordPopup: 点击词组
    WordPopup --> Idle: 关闭弹窗
    WordPopup --> AudioPlaying: 点击发音
    AudioPlaying --> WordPopup: 播放完成

    Idle --> LanguageSwitch: 点击切换按钮
    LanguageSwitch --> Idle: 切换完成
```

### 状态定义

| 状态 | 说明 | 可执行操作 |
| ---- | ---- | ---------- |
| Idle | 空闲状态 | 点击词组、切换语言、滚动 |
| WordPopup | 词汇弹窗显示中 | 播放发音、收藏、关闭 |
| AudioPlaying | 音频播放中 | 停止播放 |
| LanguageSwitch | 语言切换动画中 | 等待完成 |

---

## 完整数据流

```mermaid
flowchart TD
    subgraph 服务端
        S1[原始内容] --> S2[翻译服务]
        S2 --> S3[分词服务]
        S3 --> S4[词典服务]
        S4 --> S5[数据打包]
    end

    subgraph 网络传输
        S5 --> N1[压缩传输]
        N1 --> N2[客户端接收]
    end

    subgraph 客户端
        N2 --> C1[解压解析]
        C1 --> C2[本地存储]
        C2 --> C3[渲染引擎]
        C3 --> C4[页面展示]
    end

    subgraph 用户交互
        C4 --> U1[切换语言]
        C4 --> U2[点击词组]
        U1 --> C3
        U2 --> C5[显示弹窗]
    end
```

---

## 总结

双语阅读功能的核心设计原则：

| 原则 | 实现方式 |
| ---- | -------- |
| 预处理优先 | 翻译、分词、词汇匹配全部服务端完成 |
| 离线可用 | 数据预下发并缓存，无需实时请求 |
| 即时响应 | 语言切换和词汇查询均为本地操作 |
| 性能优先 | 虚拟化渲染、DOM 复用、分批处理 |

```mermaid
flowchart LR
    DATA[预处理数据] --> CACHE[本地缓存]
    CACHE --> RENDER[即时渲染]
    RENDER --> INTERACT[流畅交互]
```
