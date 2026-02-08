# iOS TTS 详细设计方案

> 基于 AVSpeechSynthesizer 的段落级 TTS 朗读系统，为 Readmigo 所有书籍提供即时语音朗读能力

---

## 一、现状分析

### 已有基础设施

| 组件 | 文件 | 状态 | 说明 |
|------|------|------|------|
| TTS 引擎 | `Core/Services/TTSEngine.swift` | 已实现 | AVSpeechSynthesizer + 句子拆分 + 锁屏控制 |
| TTS 数据模型 | `Core/Models/TTS.swift` | 已实现 | Settings, State, Voice, Progress 等 |
| TTS 控制面板 | `Features/Reader/TTSControlView.swift` | 已实现 | 播放/暂停/跳转/倍速/睡眠定时器/声音选择 |
| 阅读器集成 | `Features/Reader/EnhancedReaderView.swift` | 已实现 | startTTS() 触发朗读 |
| 后端纯文本 API | `GET /books/{id}/chapters/{cid}/text` | 已上线 | 返回段落级纯文本数组 |
| 翻译段落数据 | `GET /books/{id}/chapters/{cid}/translations/{locale}/paragraphs` | 已上线 | original 字段 = 纯文本 |
| 音频会话 | AVAudioSession | 已配置 | `.playback` + `.spokenAudio` |
| 后台播放 | Info.plist | 已配置 | `UIBackgroundModes: audio` |
| 锁屏控制 | MPRemoteCommandCenter | 已配置 | 播放/暂停/跳转 |

### 核心问题

```
当前调用链（有缺陷）：

EnhancedReaderView.startTTS()
        │
        ▼
content.htmlContent ─── 原始 HTML ───→ TTSEngine.speak(text:)
                                              │
                                              ▼
                                    NSLinguisticTagger 句子拆分
                                              │
                                              ▼
                                    AVSpeechSynthesizer ← 可能朗读 HTML 标签
```

| 问题 | 影响 | 严重程度 |
|------|------|---------|
| HTML 原始内容直接传入 TTS | 标签可能被朗读 / 文本解析错误 | 高 |
| 无段落结构感知 | 全文扁平化为句子流，无法按段落导航 | 中 |
| 进度只按字符估算 | 时间预估不准确 | 低 |
| 无跨章自动续播 | 章末停止，需手动切换 | 中 |
| WebView 高亮未联动 | TTS 朗读位置与阅读器显示不同步 | 中 |

---

## 二、目标架构

### 整体数据流

```
┌──────────────────────────────────────────────────────────────────┐
│                         数据源层                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  优先级 1          优先级 2              优先级 3                  │
│  ──────────       ──────────           ──────────                │
│  离线缓存          /text API             HTML → 纯文本            │
│  (已缓存的         (后端段落级            (本地 HTML               │
│   纯文本段落)       纯文本接口)            标签剥离)               │
│      │                │                     │                    │
│      └────────┬───────┘─────────────────────┘                    │
│               ▼                                                  │
│     ChapterTextProvider                                          │
│     (统一文本供应层)                                               │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ [ChapterParagraph] 段落数组
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      TTS 引擎层                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TTSEngine (重构)                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ 段落管理器    │───→│ 句子拆分器   │───→│ AVSpeech    │          │
│  │ (段落导航     │    │ (NSLinguistic│    │ Synthesizer │          │
│  │  跨章续播)    │    │  Tagger)     │    │ (朗读执行)   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│         │                                      │                 │
│         ▼                                      ▼                 │
│  ┌─────────────┐                       ┌─────────────┐          │
│  │ 进度追踪器   │                       │ 锁屏控制    │           │
│  │ (段落+句子   │                       │ (MPRemote    │          │
│  │  双级进度)   │                       │  Command)    │          │
│  └─────────────┘                       └─────────────┘          │
│                                                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ onParagraphChange / onSentenceChange
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                        UI 层                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EnhancedReaderView                     TTSControlView           │
│  ┌─────────────────┐                   ┌─────────────────┐      │
│  │ WebView 段落高亮  │ ←── 同步 ──→    │ 播放控制面板      │      │
│  │ (JS Bridge 通信) │                   │ (段落+句子导航)   │      │
│  └─────────────────┘                   └─────────────────┘      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 三、核心模块设计

### 3.1 ChapterTextProvider（文本供应层）

**职责**：为 TTS 提供纯文本段落数据，屏蔽数据来源差异

```
获取纯文本段落的决策流程：

请求章节纯文本
      │
      ▼
离线缓存中有？ ──── 是 ──→ 返回缓存段落数据
      │
      │ 否
      ▼
网络可用？ ──── 否 ──→ 本地 HTML 剥离（降级方案）
      │
      │ 是
      ▼
调用 /text API ──→ 解析响应 ──→ 缓存到本地 ──→ 返回段落数据
```

#### API 响应结构

| 字段 | 类型 | 说明 |
|------|------|------|
| chapterId | String | 章节 ID |
| title | String | 章节标题 |
| paragraphs | Array | 段落数组 |
| paragraphs[].index | Int | 段落索引 (0-based) |
| paragraphs[].text | String | 纯文本内容 |

#### 缓存策略

| 维度 | 策略 |
|------|------|
| 存储位置 | App Documents/tts-cache/{bookId}/{chapterId}.json |
| 缓存粒度 | 按章节整体缓存 |
| 过期策略 | 不过期（纯文本内容不变），App 更新时可选清理 |
| 预加载 | 朗读当前章节时，预加载下一章纯文本 |
| 离线模式 | 用户下载书籍时同步缓存所有章节纯文本 |

---

### 3.2 TTSEngine 重构（引擎层）

#### 段落级架构

```
当前架构（扁平句子流）：        目标架构（段落 → 句子 二级结构）：

Sentence 0                     Paragraph 0
Sentence 1                       ├── Sentence 0
Sentence 2                       ├── Sentence 1
Sentence 3                       └── Sentence 2
Sentence 4                     Paragraph 1
Sentence 5                       ├── Sentence 3
...                               ├── Sentence 4
                                  └── Sentence 5
                               Paragraph 2
                                 ├── Sentence 6
                                 └── Sentence 7
                               ...
```

#### 状态模型

```
TTSPlaybackState:

┌───────┐    speak()    ┌─────────┐   文本就绪   ┌─────────┐
│ idle  │ ──────────→  │ loading │ ──────────→ │ playing │
└───────┘              └─────────┘             └────┬────┘
    ▲                                               │
    │                         pause()               │
    │                    ┌──────────────┐           │
    │                    │              ▼           │
    │               ┌─────────┐   ┌─────────┐     │
    │     stop()    │ playing │   │ paused  │     │
    │  ◄────────── │         │ ◄─│         │     │
    │               └─────────┘   └─────────┘     │
    │                    resume()                   │
    │                                               │
    │          章节结束 + 有下一章                     │
    │               ┌───────────────────────┘       │
    │               ▼                               │
    │        ┌──────────────┐                       │
    └─────── │ loadingNext  │ ── 加载下一章文本       │
      无下一章 └──────────────┘                       │
                    │                               │
                    └── 就绪 ──→ 自动续播 ───────────┘
```

#### 进度模型

| 字段 | 类型 | 说明 |
|------|------|------|
| currentParagraphIndex | Int | 当前段落索引 |
| currentSentenceIndex | Int | 当前段落内句子索引 |
| totalParagraphs | Int | 章节总段落数 |
| currentParagraphSentenceCount | Int | 当前段落句子总数 |
| globalSentenceIndex | Int | 全局句子索引（跨段落） |
| totalSentences | Int | 章节总句子数 |
| chapterProgressPercent | Double | 章节进度百分比 |
| estimatedTimeRemaining | TimeInterval | 估算剩余时间 |

---

### 3.3 跨章自动续播

```
章节结束处理流程：

当前章节最后一个句子朗读完毕
        │
        ▼
阅读模式 = continuous？
  │                 │
  │ 是              │ 否 (chapter 模式)
  ▼                 ▼
有下一章？        停止播放
  │
  │ 是
  ▼
state = loadingNext
        │
        ▼
ChapterTextProvider.fetch(nextChapter)
        │
        ├── 成功 ──→ 更新段落数据 → 重置索引 → 继续朗读
        │              │
        │              ▼
        │           通知 ReaderView 切换章节
        │           (onChapterAdvance 回调)
        │
        └── 失败 ──→ 显示错误 → 停止播放
```

#### 章节切换通知

| 回调 | 触发时机 | 用途 |
|------|---------|------|
| onChapterAdvance(newChapterId) | 自动跳转到下一章 | ReaderView 切换页面 |
| onChapterEnd() | 当前章节结束（不续播时） | UI 更新状态 |
| onBookEnd() | 全书最后一章结束 | 显示完成提示 |

---

### 3.4 WebView 同步高亮

```
TTS 与 WebView 的双向同步：

┌────────────┐                         ┌────────────────┐
│ TTSEngine  │                         │ WebView (HTML) │
│            │                         │                │
│ 段落 2     │ ── onParagraphChange ──→│ scrollTo(p[2]) │
│ 句子 1     │    (paragraphIndex: 2)  │ highlight(p[2])│
│            │                         │                │
│            │ ◄── JS: tapParagraph ── │ 用户点击段落 3  │
│            │    (paragraphIndex: 3)  │                │
│ 跳转到段落3│                         │                │
└────────────┘                         └────────────────┘
```

#### HTML 段落标识

| 需求 | 方案 |
|------|------|
| 段落定位 | HTML 中每个 `<p>` 标签已有序号，可通过 `document.querySelectorAll('p')` 索引 |
| 高亮样式 | 注入 CSS class `.tts-active` 到当前段落 |
| 滚动跟随 | `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` |
| 点击跳转 | 段落点击事件通过 JS Bridge 传递 `paragraphIndex` 给 Swift |

#### JS Bridge 消息协议

| 方向 | 消息类型 | 参数 | 说明 |
|------|---------|------|------|
| Swift → JS | highlightParagraph | { index: Int } | 高亮指定段落 |
| Swift → JS | clearHighlight | {} | 清除所有高亮 |
| Swift → JS | scrollToParagraph | { index: Int, animated: Bool } | 滚动到段落 |
| JS → Swift | paragraphTapped | { index: Int } | 用户点击段落 |
| JS → Swift | visibleParagraphs | { first: Int, last: Int } | 可见段落范围 |

---

## 四、UI/UX 设计

### 4.1 TTS 入口

```
阅读器顶部工具栏：

┌──────────────────────────────────────────────────┐
│  ←    Chapter Title              🎧  📖  ⋯      │
│                                  ↑               │
│                           TTS/音频 按钮           │
│                           (耳机图标)              │
└──────────────────────────────────────────────────┘

点击后的行为决策：

🎧 按钮点击
      │
      ▼
该书有精品有声书？ ──── 是 ──→ 显示选择面板
      │                        ├── 精品音频（推荐）
      │ 否                     └── 系统 TTS
      ▼
直接启动 TTS 朗读
```

### 4.2 TTS 控制面板（重构）

```
最小化状态：
┌──────────────────────────────────────────────────┐
│  "He felt the rain on his face..." ▷    ▶  ✕    │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░ 42%                      │
└──────────────────────────────────────────────────┘

展开状态：
┌──────────────────────────────────────────────────┐
│  ─── (拖动手柄)                              ✕  │
│                                                  │
│  "He felt the rain on his face as he             │
│   walked through the darkened streets."          │
│                                                  │
│  段落 3 / 42    句子 2 / 5                       │
│                                                  │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░  7%              │
│  1:23                              -18:45        │
│                                                  │
│     ⏪15   ◀   ▶ ⏸   ▶   ⏩15                    │
│                                                  │
│  速度  ─────●──────────── 1.0x                   │
│                                                  │
│  🎤 声音   🌙 定时   📝 高亮   ¶ 段落   ⚙ 设置   │
└──────────────────────────────────────────────────┘
```

#### 新增控件：段落导航

| 控件 | 操作 | 说明 |
|------|------|------|
| ¶ 段落导航 | 长按 ◀/▶ | 按段落跳转（短按仍为句子跳转） |
| 段落列表 | 点击 ¶ 图标 | 展开段落目录，显示每段首句预览 |
| 进度指示 | 段落 X / Y | 段落级进度 + 句子级进度双重显示 |

---

### 4.3 阅读器内高亮效果

```
正常阅读状态：                    TTS 朗读状态：

┌──────────────────┐            ┌──────────────────┐
│                  │            │                  │
│ He felt the rain │            │ He felt the rain │
│ on his face as   │            │ on his face as   │  ← 普通段落
│ he walked.       │            │ he walked.       │
│                  │            │                  │
│ The streets were │            │ ┌──────────────┐ │
│ dark and empty.  │            │ │The streets   │ │  ← 当前段落
│ No one else was  │            │ │were dark and │ │     高亮背景
│ out at this hour.│            │ │empty. No one │ │     + 左侧彩条
│                  │            │ │else was out  │ │
│ He thought about │            │ │at this hour. │ │
│ what had led him │            │ └──────────────┘ │
│ to this point.   │            │                  │
│                  │            │ He thought about │
└──────────────────┘            │ what had led him │  ← 普通段落
                                │ to this point.   │
                                │                  │
                                └──────────────────┘
```

---

## 五、离线支持

### 下载流程

```
用户下载书籍时的 TTS 预缓存：

用户点击「下载」
      │
      ▼
OfflineManager.downloadBook()
      │
      ├── 下载章节 HTML 内容 (已有)
      │
      ├── 下载章节纯文本 (新增)
      │     │
      │     └── 对每个章节调用 /text API
      │         结果缓存到 tts-cache/{bookId}/{chapterId}.json
      │
      └── 下载封面 (已有)
```

### 缓存层级

```
App Documents/
├── offline-books/           ← 已有：离线书籍 HTML
│   └── {bookId}/
│       └── {chapterId}.html
│
├── tts-cache/               ← 新增：TTS 纯文本缓存
│   └── {bookId}/
│       └── {chapterId}.json  (段落数组)
│
└── audio-cache/             ← 已有：有声书音频缓存
    └── {audiobookId}/
        └── {chapterId}.mp3
```

---

## 六、翻译系统复用

### 数据复用关系

```
翻译系统的段落数据结构：

GET /books/{id}/chapters/{cid}/translations/{locale}/paragraphs

Response:
{
  paragraphs: [
    { index: 0, original: "纯文本...",  translation: "翻译..." },
    { index: 1, original: "纯文本...",  translation: "翻译..." },
    ...
  ]
}

         original 字段  ═══  /text API 的 paragraphs[].text
         (已验证 100% 一致)
```

### 复用策略

| 场景 | 文本来源 | 说明 |
|------|---------|------|
| 有翻译缓存的章节 | 翻译 JSON 的 `original` 字段 | 零额外网络开销 |
| 无翻译但有网络 | `/text` API | 专用纯文本接口 |
| 完全离线 | 本地 TTS 缓存 / HTML 降级剥离 | 离线兜底 |

```
ChapterTextProvider 文本获取优先级：

1. tts-cache 本地缓存
      │ miss
      ▼
2. 翻译缓存中的 original 字段（如果该章节已有翻译缓存）
      │ miss
      ▼
3. /text API 请求
      │ fail
      ▼
4. 本地 HTML 内容 → 正则剥离标签（降级方案）
```

---

## 七、与精品有声书的衔接

### Phase 1 → Phase 4 过渡

```
用户点击 🎧 按钮：

该书有精品有声书？
  │
  ├── 是 ──→ 音频源选择面板
  │           ┌─────────────────────────┐
  │           │ 🎵 精品音频 (推荐)       │  ← AudiobookPlayer
  │           │    真人朗读 · 3h 25min   │
  │           │                         │
  │           │ 🤖 系统朗读              │  ← TTSEngine
  │           │    AI 语音 · 可调速度     │
  │           └─────────────────────────┘
  │
  └── 否 ──→ 直接启动 TTS（当前方案）
               将来有精品音频后自动切换为选择面板
```

### 统一播放体验

| 特性 | TTS (Phase 1) | 精品音频 (Phase 4) |
|------|--------------|-------------------|
| 锁屏控制 | MPRemoteCommandCenter | MPRemoteCommandCenter |
| 进度记忆 | 段落+句子索引 | 时间戳 |
| 睡眠定时器 | 章末 / 时间 | 章末 / 时间 |
| 倍速播放 | 0.5x - 2.0x | 0.5x - 3.5x |
| 后台播放 | 支持 | 支持 |
| 高亮同步 | 段落级（实时） | 段落级（时间戳对齐） |
| 离线 | 需预缓存文本 | 需预下载音频 |
| 覆盖率 | 100% 所有书籍 | 制作完成的书籍 |

---

## 八、实施计划

### 任务分解

```
Phase 1.1: 文本供应层（修复核心问题）
├── 新建 ChapterTextProvider
├── 对接 /text API
├── 添加本地缓存
├── HTML 降级剥离（离线兜底）
└── 验证：The Jungle 各章节纯文本正确

Phase 1.2: 引擎段落化重构
├── TTSEngine 支持段落数组输入
├── 段落 → 句子 二级导航
├── 进度追踪升级（段落级）
├── 跨章自动续播
└── 验证：段落切换 + 跨章播放正常

Phase 1.3: WebView 同步高亮
├── 注入 TTS 高亮 CSS
├── JS Bridge: highlightParagraph / scrollToParagraph
├── JS Bridge: paragraphTapped（点击跳转）
├── 自动滚动跟随
└── 验证：朗读时段落高亮 + 滚动同步

Phase 1.4: UI 升级
├── TTSControlView 增加段落导航
├── 段落进度显示
├── 段落目录（可选）
└── 验证：控制面板交互完整

Phase 1.5: 离线与预加载
├── OfflineManager 集成 TTS 缓存
├── 下一章预加载逻辑
├── 翻译缓存 original 字段复用
└── 验证：飞行模式下 TTS 正常工作
```

### 优先级排序

| 优先级 | 任务 | 原因 |
|--------|------|------|
| P0 | Phase 1.1 文本供应层 | 修复 HTML 标签被朗读的核心问题 |
| P0 | Phase 1.2 引擎段落化 | TTS 基础体验 |
| P1 | Phase 1.3 WebView 同步 | 视觉反馈提升体验 |
| P1 | Phase 1.4 UI 升级 | 段落导航 |
| P2 | Phase 1.5 离线预加载 | 离线场景 |

### 依赖关系

```
Phase 1.1 (文本供应层)
      │
      ▼
Phase 1.2 (引擎段落化) ──→ Phase 1.4 (UI 升级)
      │
      ▼
Phase 1.3 (WebView 同步)
      │
      ▼
Phase 1.5 (离线预加载)
```

---

## 九、技术决策记录

| 决策 | 选择 | 替代方案 | 理由 |
|------|------|---------|------|
| TTS 引擎 | AVSpeechSynthesizer (系统) | OpenAI TTS API | 零成本、零延迟、离线可用、Phase 1 目标是验证需求 |
| 文本来源 | /text API + 缓存 | 客户端 HTML 解析 | 服务端解析更准确、跨平台一致、翻译系统可复用 |
| 句子拆分 | NSLinguisticTagger | 正则表达式 | 系统级 NLP，对英文效果好 |
| 高亮方案 | CSS class + JS Bridge | 自定义渲染 | 最小改动，复用现有 WebView |
| 缓存格式 | JSON (段落数组) | SQLite / CoreData | 简单、可读、与 API 响应一致 |
| 预加载策略 | 朗读时预加载下一章 | 全书预加载 | 平衡网络使用与响应速度 |

---

*最后更新：2026-02-08*
