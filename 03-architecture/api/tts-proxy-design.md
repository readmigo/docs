# BE TTS 代理层设计方案

> 基于 [iOS TTS 实现文档](../ios-tts-implementation.md) 的后端改动方案
>
> 核心原则：**Provider 无感知切换 · 音频持久化 · 统一声音体系**

---

## 一、改动背景与目标

### 1.1 改动触发

iOS TTS 实现文档确定云端 TTS 走 BE 代理架构，带来以下 BE 必须改动：

| 必须项 | 现状 | 目标 |
|--------|------|------|
| 云端 TTS 音频持久化 | `TranslationTTSService` 返回 base64 data URL，临时数据 | 生成后写入 R2，返回 CDN URL，可缓存可离线 |
| TTS Provider 扩展 | 仅 OpenAI TTS (`tts-1`) | Azure Speech（主选）+ ElevenLabs（Premium）+ OpenAI（兜底） |
| Provider 无感知切换 | 无抽象层，OpenAI 直调 | 统一 voiceId 体系，客户端零感知切换 Provider |
| 订阅权限与用量追踪 | 无 TTS 用量记录 | 按订阅计划限流 + 成本追踪 |

### 1.2 可后置项

| 项目 | 理由 |
|------|------|
| TTS 听读进度同步 | 客户端先用 UserDefaults 本地存储 |
| 用户 TTS 偏好跨设备同步 | 客户端先本地存储，后续再做 |

### 1.3 设计目标

| 目标 | 量化指标 |
|------|---------|
| Provider 切换零客户端改动 | 新增/替换 Provider 只改 BE 配置 |
| 音频缓存命中率 | 同 voiceId + 同文本 → 100% 命中，零重复 API 调用 |
| 首次生成延迟 | Azure <1.5s / ElevenLabs <2s（含 R2 写入） |
| 缓存后响应延迟 | <200ms（R2 CDN 直出） |
| 成本可控 | 按用户等级限流，用量全链路追踪 |

---

## 二、TTS 代理层架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         iOS Client                                  │
│                                                                     │
│  POST /tts/generate                                                 │
│  { text, voiceId, speed }                                           │
│          │                                                          │
│          │  只认 Readmigo voiceId                                    │
│          │  不知道也不关心后面是哪个 Provider                          │
│          │                                                          │
└──────────┼──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BE TTS 代理层                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Layer 1: Guard & Validation                                   │  │
│  │  ├── JWT 认证                                                  │  │
│  │  ├── Feature Flag 校验 (@RequireFeature(Features.TTS))         │  │
│  │  ├── 订阅权限校验（voiceId 是否对应用户等级）                     │  │
│  │  └── 用量限额校验（月度字符数/分钟数）                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Layer 2: Cache Lookup                                         │  │
│  │  ├── 计算 cacheKey = hash(text + voiceId + speed)              │  │
│  │  ├── 查 Redis 元数据 → 命中则返回 R2 CDN URL（<200ms）          │  │
│  │  └── 未命中 → 进入 Layer 3                                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Layer 3: Voice Router                                         │  │
│  │  ├── 查 voiceId → provider mapping                             │  │
│  │  │   ├── rm-azure-* → AzureSpeechAdapter                      │  │
│  │  │   ├── rm-eleven-* → ElevenLabsAdapter                      │  │
│  │  │   └── rm-openai-* → OpenAIAdapter                          │  │
│  │  └── 注入 provider-native voiceId + 配置                       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Layer 4: Provider Adapter (统一接口)                           │  │
│  │  ├── synthesize(text, nativeVoiceId, speed, format)            │  │
│  │  ├── 返回: audioBuffer + metadata (duration, wordTimestamps)   │  │
│  │  └── 失败: 抛出 ProviderError → 触发 Layer 5 降级              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Layer 5: Persistence & Response                               │  │
│  │  ├── 音频写入 R2 → 获取 CDN URL                                │  │
│  │  ├── 元数据写入 Redis（cacheKey → R2 path, duration, etc.）     │  │
│  │  ├── 用量记录写入 DB（异步，不阻塞响应）                         │  │
│  │  └── 返回: { audioUrl, duration, wordTimestamps? }             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                          │                                           │
│                          │  降级链（Layer 5 兜底）                    │
│                          │  Azure 失败 → ElevenLabs → OpenAI        │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Cloudflare R2│
                    │ CDN 分发     │
                    └──────────────┘
```

### 2.2 层间职责隔离

| Layer | 职责 | 不做什么 |
|:-----:|------|---------|
| 1 Guard | 认证、鉴权、限流 | 不做业务逻辑 |
| 2 Cache | 缓存查找与命中 | 不做生成 |
| 3 Router | voiceId 路由到 Provider | 不做 API 调用 |
| 4 Adapter | 调用 Provider API | 不做存储、不做鉴权 |
| 5 Persist | R2 写入、Redis 写入、用量记录 | 不做 Provider 调用 |

---

## 三、统一声音体系

### 3.1 Readmigo VoiceId 设计

客户端永远只认 Readmigo 自己的 voiceId，格式：`rm-{provider}-{name}`

| Readmigo voiceId | Provider | 原生 voiceId | 性别 | 口音 | 订阅等级 |
|------------------|----------|-------------|:----:|:----:|:-------:|
| `rm-azure-jenny` | Azure Speech | en-US-JennyNeural | 女 | 美式 | PRO |
| `rm-azure-guy` | Azure Speech | en-US-GuyNeural | 男 | 美式 | PRO |
| `rm-azure-sonia` | Azure Speech | en-GB-SoniaNeural | 女 | 英式 | PRO |
| `rm-azure-ryan` | Azure Speech | en-GB-RyanNeural | 男 | 英式 | PRO |
| `rm-azure-natasha` | Azure Speech | en-AU-NatashaNeural | 女 | 澳式 | PRO |
| `rm-azure-william` | Azure Speech | en-AU-WilliamNeural | 男 | 澳式 | PRO |
| `rm-eleven-rachel` | ElevenLabs | Rachel | 女 | 美式 | PREMIUM |
| `rm-eleven-adam` | ElevenLabs | Adam | 男 | 美式 | PREMIUM |
| `rm-eleven-charlotte` | ElevenLabs | Charlotte | 女 | 英式 | PREMIUM |
| `rm-openai-nova` | OpenAI | nova | 女 | 美式 | PRO |
| `rm-openai-onyx` | OpenAI | onyx | 男 | 美式 | PRO |

> 映射表存储在 DB 或配置文件中，BE 重启即可加载新声音，零客户端改动。

### 3.2 VoiceId 映射表结构

```
VoiceMapping
├── rmVoiceId: String       // "rm-azure-jenny" (PK)
├── provider: String        // "azure" | "elevenlabs" | "openai"
├── nativeVoiceId: String   // "en-US-JennyNeural"
├── displayName: String     // "Jenny"
├── gender: String          // "female" | "male"
├── accent: String          // "us" | "gb" | "au"
├── language: String        // "en"
├── quality: String         // "standard" | "hd" | "premium"
├── minPlan: String         // "PRO" | "PREMIUM"
├── enabled: Boolean        // 可随时下线某声音
├── sortOrder: Int          // 列表排序
└── sampleAudioUrl: String  // R2 预生成的试听音频 URL
```

### 3.3 无感知切换场景

| 场景 | BE 操作 | 客户端感知 |
|------|--------|:--------:|
| 全局替换 Provider | 修改映射表中 `rm-azure-jenny` 的 provider 和 nativeVoiceId | 无 |
| 新增声音 | 插入新行到映射表，`/tts/voices` 接口自动返回 | 客户端刷新列表即可 |
| 下线声音 | `enabled = false`，已缓存音频仍可用 | 声音列表不再展示 |
| A/B 测试 | Router 层按 userId % N 分流到不同 Provider | 无 |
| Provider 故障降级 | Adapter 层抛错 → Router 自动选降级 Provider | 无（音质可能略有差异） |
| 价格优化 | 将部分 Azure HD 声音切到 Azure Standard | 无（音质微调） |

---

## 四、TTS Provider Adapter

### 4.1 统一接口

| 方法 | 参数 | 返回 |
|------|------|------|
| `synthesize()` | text, nativeVoiceId, speed, format | `TTSResult { audioBuffer, duration, wordTimestamps?, format }` |
| `getVoices()` | — | Provider 支持的声音列表 |
| `healthCheck()` | — | Provider 可用状态 |

### 4.2 Azure Speech Adapter

| 配置项 | 值 | 说明 |
|--------|------|------|
| API 类型 | Speech SDK (WebSocket) | 低延迟流式 |
| 输出格式 | audio-24khz-48kbitrate-mono-opus | 高质量低带宽 |
| 持久化格式 | 转码为 MP3 128kbps | 兼容性最佳 |
| SSML 支持 | ✅ 完整 | 控制停顿、语速、发音 |
| 单词时间戳 | ✅ word boundary event | 驱动客户端单词高亮 |
| 超时 | 10s | 超时触发降级 |

**SSML 增强规则**：

| 场景 | SSML 处理 |
|------|----------|
| 句间停顿 | `<break time="200ms"/>` |
| 段间停顿 | `<break time="500ms"/>` |
| 缩写发音 | `<say-as interpret-as="characters">Mr.</say-as>` |
| 数字发音 | `<say-as interpret-as="cardinal">2020</say-as>` |
| 语速控制 | `<prosody rate="{speed}">` |

### 4.3 ElevenLabs Adapter

| 配置项 | 值 | 说明 |
|--------|------|------|
| API 类型 | REST (HTTP chunked streaming) | 流式 |
| 输出格式 | mp3_44100_128 | 高质量 MP3 |
| 时间戳 | ✅ alignment API | 需二次请求获取 |
| 超时 | 15s | ElevenLabs 延迟较高 |
| 限流 | 按套餐并发数 | 需排队机制 |

### 4.4 OpenAI Adapter（兜底）

| 配置项 | 值 | 说明 |
|--------|------|------|
| API 类型 | REST (HTTP streaming) | 现有实现 |
| 模型 | tts-1 (速度优先) / tts-1-hd (质量优先) | 按用户等级选择 |
| 输出格式 | MP3 | 直接可用 |
| 时间戳 | ❌ 不支持 | 降级时无单词高亮 |
| 超时 | 10s | 超时无进一步降级 |

### 4.5 Provider 能力矩阵

| 能力 | Azure | ElevenLabs | OpenAI |
|------|:-----:|:----------:|:------:|
| 音质 | ★★★★☆ | ★★★★★ | ★★★★☆ |
| 延迟 | ~300ms | ~500ms | ~1000ms |
| 单词时间戳 | ✅ | ✅ | ❌ |
| SSML | ✅ 完整 | ⚠️ 有限 | ❌ |
| 流式 | ✅ WebSocket | ✅ HTTP | ✅ HTTP |
| 成本 (1M chars) | $4-$16 | $3-$30 | $15 |

---

## 五、R2 音频持久化

### 5.1 存储路径设计

```
R2 Bucket
└── books/
    └── {bookId}/
        └── tts/
            └── {voiceId}/
                └── {speed}/
                    └── {chapterId}/
                        ├── p{index}.mp3           ← 段落音频
                        └── p{index}_meta.json     ← 元数据（duration, provider, timestamps）
```

**路径示例**：

```
books/abc123/tts/rm-azure-jenny/1.0/ch001/p0.mp3
books/abc123/tts/rm-azure-jenny/1.0/ch001/p0_meta.json
books/abc123/tts/rm-azure-jenny/1.0/ch001/p1.mp3
```

**设计理由**：

| 决策 | 理由 |
|------|------|
| `books/{bookId}/` 为根 | 与现有 R2 路径规范一致（cover、chapters、translations 均以此为根） |
| 按 voiceId + speed 分目录 | 同书同声音同倍速 = 全用户共享缓存，路径确定性保证跨用户命中 |
| 按段落拆分存储 | 单段落粒度，支持逐段生成和缓存，未命中段落不影响已缓存段落 |
| meta.json 分离存储 | 元数据小，读取快，不需要下载音频就能获取 duration 和时间戳 |
| 删书可批量清理 | `deleteByPrefix('books/{bookId}/tts/')` 即可清除该书全部 TTS 文件 |

> CacheKey（SHA256）仍用于 Redis 快速查找，value 指向上述 R2 路径。Redis 为热缓存层，R2 路径为持久存储层。

### 5.2 CacheKey 计算

```
cacheKey = SHA256( normalize(text) + voiceId + speed )

normalize(text):
├── 去除首尾空白
├── 合并连续空白为单个空格
├── 统一引号为标准 ASCII 引号
└── 小写化（TTS 不区分大小写）
```

### 5.3 缓存生命周期

| 类型 | 有效期 | 淘汰策略 |
|------|--------|---------|
| Redis 元数据 | 90 天 | TTL 自动过期 |
| R2 音频文件 | 180 天 | R2 Lifecycle Rule 自动清理 |
| 热门书籍音频 | 永久 | 标记为 permanent，不淘汰 |

### 5.4 缓存命中率预估

| 场景 | 命中率 | 说明 |
|------|:------:|------|
| 同用户重听同一章 | 100% | cacheKey 完全一致 |
| 不同用户听同一书同一声音 | 100% | cacheKey 按文本+声音计算，不含 userId |
| 同用户换声音 | 0% | voiceId 变更，cacheKey 不同 |
| 同用户换倍速 | 0% | speed 变更，cacheKey 不同 |

> 热门书籍（Top 50）被多人收听时，缓存收益最大。

---

## 六、新增 API 端点

### 6.1 TTS 端点

| 端点 | 方法 | 说明 | 鉴权 |
|------|------|------|:----:|
| `/tts/generate` | POST | 生成 TTS 音频 | JWT + Feature + Plan |
| `/tts/generate/batch` | POST | 批量生成（整章） | JWT + Feature + Plan |
| `/tts/voices` | GET | 获取可用声音列表 | JWT |
| `/tts/voices/:voiceId/sample` | GET | 获取声音试听音频 | JWT |
| `/tts/usage` | GET | 获取当前月用量 | JWT |

### 6.2 端点详细设计

#### POST /tts/generate

**请求**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| text | String | ✅ | 待合成文本（单段落，最大 5000 chars） |
| voiceId | String | ✅ | Readmigo voiceId（如 `rm-azure-jenny`） |
| speed | Float | ❌ | 语速 0.5-3.0，默认 1.0 |
| includeTimestamps | Boolean | ❌ | 是否返回单词时间戳，默认 false |

**响应**：

| 字段 | 类型 | 说明 |
|------|------|------|
| audioUrl | String | R2 CDN URL（可直接播放/下载） |
| duration | Float | 音频时长（秒） |
| cached | Boolean | 是否命中缓存 |
| wordTimestamps | Object[]? | 单词时间戳数组（当 includeTimestamps=true 且 Provider 支持时） |
| wordTimestamps[].word | String | 单词文本 |
| wordTimestamps[].startTime | Float | 开始时间（秒） |
| wordTimestamps[].endTime | Float | 结束时间（秒） |

**错误码**：

| HTTP | 错误 | 说明 |
|:----:|------|------|
| 400 | TEXT_TOO_LONG | 文本超过 5000 字符 |
| 403 | VOICE_NOT_ALLOWED | 声音不在用户订阅等级范围内 |
| 429 | TTS_QUOTA_EXCEEDED | 月度用量超限 |
| 503 | TTS_PROVIDER_UNAVAILABLE | 所有 Provider 均不可用 |

#### POST /tts/generate/batch

**请求**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| bookId | String | ✅ | 书籍 ID |
| chapterId | String | ✅ | 章节 ID |
| voiceId | String | ✅ | Readmigo voiceId |
| speed | Float | ❌ | 语速，默认 1.0 |
| includeTimestamps | Boolean | ❌ | 默认 true |

**响应**：

| 字段 | 类型 | 说明 |
|------|------|------|
| paragraphs | Object[] | 各段落音频结果 |
| paragraphs[].index | Int | 段落索引 |
| paragraphs[].audioUrl | String | R2 CDN URL |
| paragraphs[].duration | Float | 时长（秒） |
| paragraphs[].cached | Boolean | 是否命中缓存 |
| paragraphs[].wordTimestamps | Object[]? | 时间戳 |
| totalDuration | Float | 全章总时长 |
| cachedCount | Int | 命中缓存段落数 |
| generatedCount | Int | 新生成段落数 |

**实现策略**：

```
POST /tts/generate/batch
     │
     ▼
从 ChapterTextProvider 获取 paragraphs[]
     │
     ▼
对每个 paragraph 计算 cacheKey
     │
     ├── 命中缓存 → 直接返回 R2 URL（并行查 Redis）
     │
     └── 未命中 → 加入生成队列
                    │
                    ▼
              并发生成（最多 5 个并行）
              使用 Promise.allSettled
                    │
                    ├── 成功 → 写入 R2 + Redis
                    └── 失败 → 单段落标记错误，不影响其他段落
```

#### GET /tts/voices

**响应**：

| 字段 | 类型 | 说明 |
|------|------|------|
| voices | Object[] | 声音列表 |
| voices[].voiceId | String | Readmigo voiceId |
| voices[].displayName | String | 显示名 |
| voices[].gender | String | female / male |
| voices[].accent | String | us / gb / au |
| voices[].quality | String | standard / hd / premium |
| voices[].minPlan | String | PRO / PREMIUM |
| voices[].sampleUrl | String | 试听音频 URL |
| voices[].available | Boolean | 当前用户是否可用（基于订阅） |

#### GET /tts/usage

**响应**：

| 字段 | 类型 | 说明 |
|------|------|------|
| currentMonth | String | "2026-02" |
| charactersUsed | Int | 本月已使用字符数 |
| charactersLimit | Int | 本月限额（-1 = 无限） |
| minutesGenerated | Float | 本月已生成音频分钟数 |
| estimatedCost | Float | 本月预估成本（内部追踪） |

---

## 七、订阅权限与用量追踪

### 7.1 TTS 权限矩阵

| 维度 | FREE | PRO | PREMIUM |
|------|:----:|:---:|:-------:|
| 系统 TTS（客户端本地） | ✅ 不限 | ✅ 不限 | ✅ 不限 |
| 云端 TTS | ❌ | ✅ | ✅ |
| 可用声音 | — | Azure 全部 + OpenAI 全部 | 全部（含 ElevenLabs） |
| 月度字符数限额 | 0 | 2,000,000 (~13 章) | 无限 |
| 单词时间戳 | — | ✅ | ✅ |
| 批量生成（整章） | — | ✅ | ✅ |

> 2,000,000 字符 ≈ 333,000 词 ≈ ~13 章（按每章 25,000 词估算），约 4-5 小时音频。

### 7.2 用量追踪流程

```
TTS 请求到达
     │
     ▼
查询 Redis: tts:usage:{userId}:{month}
     │
     ├── 已超限 → 返回 429 TTS_QUOTA_EXCEEDED
     │
     └── 未超限 → 执行生成
                    │
                    ▼
              生成完成后
                    │
                    ├── Redis INCRBY tts:usage:{userId}:{month} {charCount}
                    │   TTL = 当月剩余秒数 + 7 天（容错）
                    │
                    └── 异步写入 DB TTSUsage 表（不阻塞响应）
```

### 7.3 限流策略

| 限流维度 | FREE | PRO | PREMIUM |
|---------|:----:|:---:|:-------:|
| 月度字符数 | 0 | 2M | 无限 |
| 单次请求最大文本 | — | 5,000 chars | 5,000 chars |
| 批量生成并发数 | — | 3 | 5 |
| QPS（每用户） | — | 10 | 20 |

---

## 八、数据模型变更

### 8.1 新增模型

#### TTSVoiceMapping（声音映射表）

| 字段 | 类型 | 说明 |
|------|------|------|
| rmVoiceId | String (PK) | `rm-azure-jenny` |
| provider | String | `azure` / `elevenlabs` / `openai` |
| nativeVoiceId | String | Provider 原生声音 ID |
| displayName | String | 显示名 "Jenny" |
| gender | String | `female` / `male` |
| accent | String | `us` / `gb` / `au` |
| language | String | `en` |
| quality | String | `standard` / `hd` / `premium` |
| minPlan | PlanType | `PRO` / `PREMIUM` |
| enabled | Boolean | 是否启用 |
| sortOrder | Int | 列表排序 |
| sampleAudioUrl | String? | 试听音频 R2 URL |
| config | Json? | Provider 特定配置（SSML 模板等） |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |

#### TTSAudioCache（音频缓存索引）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (PK) | UUID |
| cacheKey | String (Unique) | SHA256(text + voiceId + speed) |
| rmVoiceId | String | 声音 ID |
| provider | String | 实际使用的 Provider |
| r2Path | String | R2 存储路径（如 `books/{bookId}/tts/{voiceId}/{speed}/{chapterId}/p{index}.mp3`） |
| cdnUrl | String | CDN 访问 URL |
| duration | Float | 音频时长（秒） |
| charCount | Int | 文本字符数 |
| hasTimestamps | Boolean | 是否有单词时间戳 |
| timestampsPath | String? | 时间戳 JSON 的 R2 路径 |
| permanent | Boolean | 是否永久保留 |
| accessCount | Int | 访问次数（追踪热度） |
| lastAccessedAt | DateTime | 最后访问时间 |
| createdAt | DateTime | — |

索引：`cacheKey` (Unique), `lastAccessedAt` (淘汰用), `permanent`

#### TTSUsage（用量记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (PK) | UUID |
| userId | String (FK) | 用户 ID |
| month | String | "2026-02"（分区键） |
| rmVoiceId | String | 声音 ID |
| provider | String | 实际 Provider |
| charCount | Int | 本次字符数 |
| duration | Float | 本次音频时长 |
| cached | Boolean | 是否命中缓存 |
| estimatedCost | Float | 预估 API 成本（美元） |
| bookId | String? | 关联书籍（可选） |
| chapterId | String? | 关联章节（可选） |
| createdAt | DateTime | — |

索引：`userId + month` (用量统计), `provider + month` (成本分析), `createdAt`

### 8.2 现有模型无需改动

| 模型 | 理由 |
|------|------|
| User | TTS 偏好后置，暂不加字段 |
| Subscription | 现有 planType (FREE/PRO/PREMIUM) 足够做权限判断 |
| Audiobook / AudiobookChapter | 精品有声书模块独立，不受影响 |
| Chapter | 已有 `/chapters/:id/text` 端点，文本获取无需改动 |

---

## 九、降级与容错

### 9.1 Provider 降级链

```
请求生成 TTS
     │
     ▼
Route 到主 Provider（基于 voiceId 映射）
     │
     ├── 成功 → 返回音频
     │
     └── 失败（超时/5xx/限流）
              │
              ▼
         降级到备选 Provider
              │
              ├── Azure 失败 → 尝试 OpenAI（同类声音）
              ├── ElevenLabs 失败 → 尝试 Azure（同类声音）
              └── OpenAI 失败 → 返回 503（所有 Provider 不可用）
              │
              ▼
         降级时的声音映射：
              │
              ├── rm-azure-jenny (女/美式)
              │   降级到 → rm-openai-nova (女/美式)
              │
              ├── rm-eleven-adam (男/美式)
              │   降级到 → rm-azure-guy (男/美式)
              │
              └── 匹配规则：同性别 → 同口音 → 同 Provider 其他声音
```

### 9.2 降级响应标记

降级发生时，响应中增加字段：

| 字段 | 说明 |
|------|------|
| `degraded: true` | 标记发生了降级 |
| `originalVoiceId` | 用户请求的原始声音 |
| `actualVoiceId` | 降级后实际使用的声音 |

> 客户端可选择展示轻提示："当前使用备用声音"，也可忽略。

### 9.3 超时与重试策略

| Provider | 首次超时 | 重试次数 | 重试间隔 | 降级触发 |
|----------|:-------:|:-------:|:-------:|:-------:|
| Azure | 10s | 1 次 | 1s | 第 2 次失败后 |
| ElevenLabs | 15s | 1 次 | 2s | 第 2 次失败后 |
| OpenAI | 10s | 1 次 | 1s | 第 2 次失败后（无进一步降级） |

### 9.4 熔断机制

| 指标 | 阈值 | 动作 |
|------|------|------|
| Provider 连续失败 | 5 次 | 熔断该 Provider 60 秒，期间直接走降级链 |
| Provider 错误率 | >30%（1 分钟窗口） | 熔断 120 秒 |
| 熔断恢复 | 半开状态放 10% 流量 | 成功率 >90% 则完全恢复 |

---

## 十、后续扩展（可后置）

以下功能当前不实现，预留扩展点：

### 10.1 TTS 听读进度同步

| 端点 | 方法 | 说明 | 依赖 |
|------|------|------|------|
| `/tts/progress/:bookId` | GET | 获取 TTS 听读进度 | 新增 UserTTSProgress 模型 |
| `/tts/progress/:bookId` | POST | 更新 TTS 听读进度 | 同上 |

> 可复用 `UserAudiobookProgress` 模型，扩展 `source` 字段区分 TTS 和精品音频。

### 10.2 用户 TTS 偏好同步

| 端点 | 方法 | 说明 | 依赖 |
|------|------|------|------|
| `/tts/settings` | GET | 获取用户 TTS 偏好 | 新增 UserTTSSettings 模型 |
| `/tts/settings` | PATCH | 更新用户 TTS 偏好 | 同上 |

### 10.3 预生成热门书籍

利用现有 BullMQ 后台任务：

```
定时任务（每日）
     │
     ▼
查询 Top 50 精品书单中尚未生成 TTS 缓存的章节
     │
     ▼
后台批量生成（低优先级，不占用用户实时额度）
     │
     ▼
结果：热门书籍首次听读即命中缓存，用户零等待
```

---

*创建日期：2026-02-08*
*关联文档：[iOS TTS 系统设计](../ios-tts-system-design.md) · [iOS TTS 实现文档](../ios-tts-implementation.md) · [后端架构](./backend-architecture.md) · [API 设计](./api-design.md)*
