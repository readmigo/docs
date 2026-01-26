# Readmigo Web App 设计规划

> Desktop-First Web Application Design Strategy

---

## 1. 设计背景与目标

### 1.1 桌面用户特征

根据用户画像数据，电脑用户具有以下特征：

| 特征 | 数据 |
|------|------|
| 用户占比 | 10%（学习和研究场景） |
| 主要场景 | 学习、研究、深度阅读、长时间使用 |
| 典型用户 | 备考生、研究人员、专业学习者 |
| 使用时长 | 单次 1-3 小时（最长连续使用） |
| 设备特点 | 大屏幕、键盘鼠标、多任务环境 |

### 1.2 Web App 定位

```
核心定位：专业学习与深度阅读的"工作站"

├── 专业性：满足深度学习、研究、备考需求
├── 效率：多窗口、快捷键、批量操作
├── 协作性：云同步、数据导出、分享功能
└── 跨平台：任何设备、任何浏览器均可访问
```

### 1.3 技术栈概览

```
当前技术栈：
├── Framework: Next.js 16 (App Router)
├── UI: Radix UI + Tailwind CSS
├── State: Zustand
├── Data Fetching: TanStack Query
├── Auth: NextAuth.js
├── EPUB: epub.js
└── PWA: next-pwa
```

---

## 2. Web 平台独有优势

### 2.1 大屏空间利用

| 屏幕分辨率 | 用户占比 | 设计策略 |
|------------|----------|----------|
| 1920×1080 (FHD) | 65% | 主力适配 |
| 2560×1440 (2K) | 20% | 增强布局 |
| 3840×2160 (4K) | 10% | 超宽布局 |
| 1366×768 | 5% | 紧凑布局 |

### 2.2 可利用的浏览器能力

```
浏览器 API 利用：
├── Web Workers（后台处理）
├── IndexedDB（离线存储）
├── Web Speech API（TTS/STT）
├── Clipboard API（复制粘贴）
├── File System Access API（文件导入导出）
├── Notifications API（提醒通知）
├── Picture-in-Picture（画中画）
└── Media Session API（媒体控制）
```

---

## 3. 核心设计方案

### 3.1 响应式布局架构

#### 3.1.1 布局断点设计

```typescript
// 布局断点
const breakpoints = {
  sm: '640px',   // 手机横屏/小平板
  md: '768px',   // 平板竖屏
  lg: '1024px',  // 平板横屏/小笔记本
  xl: '1280px',  // 标准桌面
  '2xl': '1536px', // 大屏桌面
  '3xl': '1920px', // 超大屏
}
```

#### 3.1.2 主布局架构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: Logo | Navigation | Search | User Menu                     │
├───────────┬─────────────────────────────────────────────────────────┤
│           │                                                         │
│  Sidebar  │                    Main Content                         │
│           │                                                         │
│  [Home]   │  ┌─────────────────────────────────────────────────┐   │
│  [Library]│  │                                                 │   │
│  [Learn]  │  │              Dynamic Content Area               │   │
│  [Vocab]  │  │                                                 │   │
│  [Stats]  │  └─────────────────────────────────────────────────┘   │
│           │                                                         │
│  ─────────│                                                         │
│  [Settings]                                                         │
│           │                                                         │
└───────────┴─────────────────────────────────────────────────────────┘
```

### 3.2 阅读器设计

#### 3.2.1 标准阅读视图

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back    Chapter 5: The Ministry of Truth         ☰  ⚙️  ☾      │
├───────────┬─────────────────────────────────────────┬───────────────┤
│           │                                         │               │
│  目录      │           阅读内容区域                  │   AI 面板     │
│           │                                         │               │
│  Part I   │    ┌─────────────────────────────┐     │  ┌─────────┐  │
│  ├─Ch.1   │    │                             │     │  │ 选中词汇 │  │
│  ├─Ch.2   │    │   The Ministry of Truth     │     │  │         │  │
│  ├─Ch.3   │    │   — Minitrue, in Newspeak   │     │  │ ministry│  │
│  ├─Ch.4   │    │   — was startlingly...      │     │  │ /ˈmɪn.  │  │
│  └─Ch.5●  │    │                             │     │  │ ɪ.stri/ │  │
│           │    │   [选中文本高亮]             │     │  │         │  │
│  Part II  │    │                             │     │  │ n. 部门  │  │
│  ├─Ch.6   │    └─────────────────────────────┘     │  │         │  │
│  ├─Ch.7   │                                         │  │ [收藏]  │  │
│  ...      │         ← Page 42 / 312 →              │  └─────────┘  │
│           │                                         │               │
│  [书签]   │    ████████████████░░░░░░░░░░░░  45%   │  [深入提问]   │
│  [笔记]   │                                         │               │
│  [高亮]   │                                         │               │
│           │                                         │               │
└───────────┴─────────────────────────────────────────┴───────────────┘
```

#### 3.2.2 专注阅读模式

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                     [退出专注模式]   │
│                                                                     │
│                                                                     │
│                                                                     │
│                    ┌─────────────────────────────┐                  │
│                    │                             │                  │
│                    │   Chapter 5                 │                  │
│                    │                             │                  │
│                    │   The Ministry of Truth     │                  │
│                    │   — Minitrue, in Newspeak   │                  │
│                    │   — was startlingly         │                  │
│                    │   different from any        │                  │
│                    │   other object in sight.    │                  │
│                    │                             │                  │
│                    │                             │                  │
│                    └─────────────────────────────┘                  │
│                                                                     │
│                                                                     │
│                         ← 42 / 312 →                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

特性：
├── 最大化阅读区域
├── 鼠标移入边缘显示导航
├── 键盘快捷键控制
├── 点击词汇弹出轻量解释
└── ESC 退出专注模式
```

#### 3.2.3 双栏对照模式（研究场景）

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back    Pride and Prejudice - Chapter 1     对照模式 ☰  ⚙️  ☾   │
├─────────────────────────────────┬───────────────────────────────────┤
│                                 │                                   │
│         原文 (English)          │         译文 (中文)               │
│                                 │                                   │
│   It is a truth universally    │   这是一条举世公认的真理：        │
│   acknowledged, that a single  │   凡是有钱的单身汉，              │
│   man in possession of a good  │   必定想要娶位太太。              │
│   fortune, must be in want     │                                   │
│   of a wife.                   │                                   │
│                                 │                                   │
│   However little known the     │   这条真理深入人心，              │
│   feelings or views of such    │   以至于每逢这样的单身汉          │
│   a man may be on his first    │   新搬到一个地方，                │
│   entering a neighbourhood,    │   四邻八舍的人家尽管              │
│   this truth is so well fixed  │   对他的性情见识                  │
│   in the minds of the          │   一无所知...                     │
│   surrounding families...      │                                   │
│                                 │                                   │
├─────────────────────────────────┴───────────────────────────────────┤
│  同步滚动: ● ON    译文来源: AI 翻译    [显示原文注释]              │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 AI 辅助交互设计

#### 3.3.1 智能面板设计

```
┌─────────────────────────────┐
│  AI Assistant          [×] │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ 📖 Selected Text     │   │
│  │                     │   │
│  │ "the Ministry of    │   │
│  │  Truth"             │   │
│  └─────────────────────┘   │
│                             │
│  ─────── 分析 ───────       │
│                             │
│  📝 词汇解释                │
│  ministry: 部; 政府部门     │
│                             │
│  📚 语境分析                │
│  在《1984》中，Ministry    │
│  of Truth 是负责宣传和     │
│  篡改历史的政府部门...     │
│                             │
│  🔗 相关概念                │
│  • Newspeak (新语)         │
│  • Doublethink (双重思想)  │
│  • Big Brother (老大哥)    │
│                             │
│  ─────── 操作 ───────       │
│                             │
│  [添加到词汇本] [创建笔记] │
│                             │
│  ─────── 深入学习 ───────   │
│                             │
│  💬 向 AI 提问              │
│  ┌─────────────────────┐   │
│  │ 输入你的问题...      │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### 3.3.2 快速查词弹窗

鼠标悬停或选中时的轻量级交互：

```
                        ┌─────────────────────────┐
                        │ ministry               │
                        │ /ˈmɪn.ɪ.stri/          │
                        │                        │
                        │ n. 部; 政府部门         │
                        │                        │
                        │ [收藏] [更多] [朗读]   │
                        └─────────────────────────┘
                                   │
"The Ministry of Truth — Minitrue..."
              ⬆
        [悬停/选中]
```

#### 3.3.3 AI 对话窗口

独立的对话窗口，支持深度学习讨论：

```
┌─────────────────────────────────────────────────────────────────────┐
│  💬 AI 学习助手                                      [最小化] [×]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🙋 User:                                                     │   │
│  │                                                             │   │
│  │ 能解释一下 "doublethink" 这个概念吗？                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🤖 AI:                                                       │   │
│  │                                                             │   │
│  │ Doublethink（双重思想）是乔治·奥威尔在《1984》中创造的       │   │
│  │ 概念，指的是同时持有两种相互矛盾的信念，并且都接受的能力。   │   │
│  │                                                             │   │
│  │ 在小说中，这是大洋国公民必须掌握的心理技巧：                 │   │
│  │                                                             │   │
│  │ 1. **同时相信两个矛盾的事实**                               │   │
│  │    例如：战争即和平，自由即奴役                             │   │
│  │                                                             │   │
│  │ 2. **有意识地欺骗自己**                                     │   │
│  │    同时又对欺骗行为保持"真诚"的信念                         │   │
│  │                                                             │   │
│  │ 书中第2章第9节有详细描述...                                 │   │
│  │                                                             │   │
│  │ [跳转到相关章节] [保存为笔记]                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 输入消息...                                          [发送] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  建议问题: [这和现实社会有什么关联？] [有哪些类似的文学作品？]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 学习中心设计

#### 3.4.1 词汇学习仪表盘

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Vocabulary Dashboard                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ 总词汇量    │  │ 待复习     │  │ 已掌握     │  │ 今日新增    │    │
│  │            │  │            │  │            │  │            │    │
│  │   2,341    │  │     47     │  │   1,892    │  │    +23     │    │
│  │  词汇      │  │   词汇     │  │   词汇     │  │   词汇     │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │  📊 词汇增长趋势                                                ││
│  │                                                                ││
│  │   300 ┤                                            ╭──●        ││
│  │   200 ┤                              ╭──●──────────╯            ││
│  │   100 ┤       ╭──●──────●──────●────╯                          ││
│  │     0 ┼───●───╯                                                ││
│  │       └─────┴─────┴─────┴─────┴─────┴─────┴─────┘              ││
│  │         Mon   Tue   Wed   Thu   Fri   Sat   Sun                ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────┐  ┌────────────────────────────┐
│  │  🎯 今日复习任务                 │  │  📖 词汇来源分布           │
│  │                                 │  │                            │
│  │  待复习: 47 个词汇              │  │  1984          ███████ 45%│
│  │  预计时间: 15 分钟              │  │  P&P           ████    25%│
│  │                                 │  │  Gatsby        ███     18%│
│  │  [开始复习]                     │  │  其他          ██      12%│
│  │                                 │  │                            │
│  └─────────────────────────────────┘  └────────────────────────────┘
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.4.2 复习卡片界面

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 Review Session                                    12 / 47       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    ┌─────────────────────────────┐                  │
│                    │                             │                  │
│                    │         propaganda          │                  │
│                    │                             │                  │
│                    │       /ˌprɒpəˈɡændə/        │                  │
│                    │                             │                  │
│                    │       🔊 [播放发音]          │                  │
│                    │                             │                  │
│                    └─────────────────────────────┘                  │
│                                                                     │
│                         [显示答案] 或按 Space                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📍 来源: 1984, Chapter 3                                    │   │
│  │                                                             │   │
│  │  "The Ministry of Truth — Minitrue, in Newspeak — was       │   │
│  │   concerned with news, entertainment, education and the     │   │
│  │   fine arts."                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                    │
│  │ 忘记了  │  │ 困难   │  │ 一般   │  │ 简单   │                    │
│  │   1    │  │   2    │  │   3    │  │   4    │                    │
│  └────────┘  └────────┘  └────────┘  └────────┘                    │
│                                                                     │
│  进度: ████████████░░░░░░░░░░░░░░░░░░░░░░  25%                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 书库管理设计

#### 3.5.1 网格视图

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 My Library                             🔍 搜索    ☰ ▦   筛选 ▼ │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  正在阅读                                                    [更多] │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│  │            │  │            │  │            │                    │
│  │   [封面]   │  │   [封面]   │  │   [封面]   │                    │
│  │            │  │            │  │            │                    │
│  │  ████75%   │  │  ███45%    │  │  ██12%     │                    │
│  ├────────────┤  ├────────────┤  ├────────────┤                    │
│  │ 1984       │  │ Pride &    │  │ The Great  │                    │
│  │ G. Orwell  │  │ Prejudice  │  │ Gatsby     │                    │
│  └────────────┘  └────────────┘  └────────────┘                    │
│                                                                     │
│  想要阅读                                                    [更多] │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │            │  │            │  │            │  │            │    │
│  │   [封面]   │  │   [封面]   │  │   [封面]   │  │   [封面]   │    │
│  │            │  │            │  │            │  │            │    │
│  ├────────────┤  ├────────────┤  ├────────────┤  ├────────────┤    │
│  │ Jane Eyre  │  │ Wuthering  │  │ Moby Dick  │  │ Dracula    │    │
│  │ C. Brontë  │  │ Heights    │  │ H.Melville │  │ B. Stoker  │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│                                                                     │
│  已完成 (3)                                                  [更多] │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│  │   [封面]   │  │   [封面]   │  │   [封面]   │                    │
│  │  ✓ 完成   │  │  ✓ 完成   │  │  ✓ 完成   │                    │
│  └────────────┘  └────────────┘  └────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.5.2 列表视图

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 My Library                             🔍 搜索    ☰ ▦   筛选 ▼ │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  书名                      作者          进度      难度      操作   │
│  ─────────────────────────────────────────────────────────────────  │
│  📖 1984                   George Orwell  75%      ████░    [继续] │
│  📖 Pride and Prejudice    Jane Austen    45%      ███░░    [继续] │
│  📖 The Great Gatsby       F.S.Fitzgerald 12%      ███░░    [继续] │
│  ─────────────────────────────────────────────────────────────────  │
│  📚 Jane Eyre              Charlotte B.   0%       ████░    [开始] │
│  📚 Wuthering Heights      Emily Brontë   0%       ████░    [开始] │
│  📚 Moby Dick              H. Melville    0%       █████    [开始] │
│  ─────────────────────────────────────────────────────────────────  │
│  ✓ Animal Farm            George Orwell  100%     ███░░    [重读] │
│  ✓ The Old Man and the Sea E. Hemingway  100%     ██░░░    [重读] │
│                                                                     │
│  共 8 本书    正在阅读 3    想读 3    已完成 2                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.6 数据统计面板

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Learning Analytics                                 本月 ▼       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     阅读时间趋势                              │   │
│  │                                                             │   │
│  │  4h ┤                                                       │   │
│  │  3h ┤                    ╭─●                               │   │
│  │  2h ┤      ╭─●─╮    ╭──●─╯  ╲╭──●                         │   │
│  │  1h ┤  ╭──●─╯   ╲──●─╯       ╲──╯ ╲──●                    │   │
│  │   0 ┼──╯                                                   │   │
│  │     └────┴────┴────┴────┴────┴────┴────┘                   │   │
│  │       1    5    10   15   20   25   30                     │   │
│  │                                                             │   │
│  │  本月总计: 42.5 小时    日均: 1.4 小时    最长: 3.2 小时    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────┐  ┌─────────────────────────────────┐ │
│  │  📖 阅读成就              │  │  🏆 学习里程碑                   │ │
│  │                          │  │                                 │ │
│  │  已完成书籍: 5 本        │  │  ✓ 完成首本书籍                 │ │
│  │  阅读页数: 2,341 页      │  │  ✓ 连续阅读 7 天                │ │
│  │  阅读时长: 156 小时      │  │  ✓ 词汇量突破 1000              │ │
│  │  阅读速度: 15 页/小时    │  │  ○ 完成 10 本书 (5/10)         │ │
│  │                          │  │  ○ 词汇量突破 5000 (2341/5000) │ │
│  └──────────────────────────┘  └─────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📈 词汇掌握分析                                             │   │
│  │                                                             │   │
│  │  熟练 ████████████████████████████████████  1,892 (81%)    │   │
│  │  学习中 ████████                              402 (17%)     │   │
│  │  待复习 ██                                     47 (2%)      │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. 特色功能规划

### 4.1 键盘快捷键系统

| 快捷键 | 全局功能 |
|--------|----------|
| `Cmd/Ctrl + K` | 全局搜索 |
| `Cmd/Ctrl + B` | 打开书库 |
| `Cmd/Ctrl + L` | 打开学习中心 |
| `Cmd/Ctrl + ,` | 打开设置 |

| 快捷键 | 阅读器功能 |
|--------|------------|
| `Space` / `PageDown` | 下一页 |
| `Shift + Space` / `PageUp` | 上一页 |
| `←` | 上一章 |
| `→` | 下一章 |
| `F` | 进入专注模式 |
| `Esc` | 退出专注模式 |
| `Cmd/Ctrl + F` | 搜索内容 |
| `Cmd/Ctrl + D` | 添加书签 |
| `Cmd/Ctrl + N` | 添加笔记 |
| `T` | 切换目录 |
| `A` | 切换 AI 面板 |
| `+` / `-` | 调整字体大小 |

| 快捷键 | 复习功能 |
|--------|----------|
| `1` | 忘记了 |
| `2` | 困难 |
| `3` | 一般 |
| `4` | 简单 |
| `Space` | 显示答案 |
| `R` | 播放发音 |

### 4.2 PWA 离线支持

```
离线功能矩阵：

完全离线：
├── 已下载书籍阅读
├── 词汇复习（本地数据）
├── 笔记查看和编辑
└── 阅读进度记录

需要网络：
├── AI 辅助功能
├── 书籍下载
├── 云端同步
└── 社区功能
```

### 4.3 数据导出功能

```
导出格式支持：

词汇数据：
├── CSV（Excel 兼容）
├── Anki 卡片格式
├── JSON（开发者）
└── PDF（打印）

笔记数据：
├── Markdown
├── Notion 导入格式
├── PDF
└── HTML

阅读统计：
├── PDF 报告
└── PNG 图片（社交分享）
```

### 4.4 多窗口支持

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  Readmigo - Reader  │     │  Readmigo - Vocab   │
│                     │     │                     │
│  [阅读 1984]        │     │  [词汇复习]         │
│                     │     │                     │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘

        主窗口                    独立窗口

支持场景：
├── 阅读时同时复习词汇
├── 对比阅读两本书
├── 阅读时查看笔记
└── 画中画听有声书
```

### 4.5 浏览器扩展集成

```
Chrome/Firefox 扩展功能：

├── 网页划词翻译 + 收藏到 Readmigo
├── 网页文章导入阅读器
├── 快速访问词汇本
└── 阅读提醒通知
```

---

## 5. 交互设计规范

### 5.1 鼠标交互

| 操作 | 效果 |
|------|------|
| 单击词汇 | 显示快速释义弹窗 |
| 双击词汇 | 选中词汇 + 详细面板 |
| 三击 | 选中整个段落 |
| 右键菜单 | 上下文操作菜单 |
| 滚轮 | 滚动页面 |
| Ctrl + 滚轮 | 缩放字体 |
| 拖拽选择 | 选中文本范围 |

### 5.2 触控支持（触屏笔记本）

| 手势 | 效果 |
|------|------|
| 单指滑动 | 翻页 |
| 双指捏合 | 缩放 |
| 长按 | 选中文本 |
| 双击 | 查词 |

### 5.3 辅助功能

```
无障碍支持：

├── 完整键盘导航
├── 屏幕阅读器兼容 (ARIA)
├── 高对比度模式
├── 字体大小调整（14px - 32px）
├── 行间距调整
├── 阅读尺（减少视觉干扰）
└── 减少动画选项
```

---

## 6. 性能优化策略

### 6.1 加载性能

```
优化措施：

1. 代码分割
   ├── 路由级别懒加载
   ├── 组件动态导入
   └── 第三方库按需加载

2. 资源优化
   ├── 图片 WebP/AVIF 格式
   ├── 字体子集化
   └── CSS 压缩

3. 缓存策略
   ├── Service Worker 缓存
   ├── API 响应缓存
   └── 静态资源 CDN

4. 预加载
   ├── 预取相邻章节
   ├── 预加载常用资源
   └── DNS 预解析
```

### 6.2 运行时性能

```
优化措施：

1. 渲染优化
   ├── 虚拟列表（长列表）
   ├── 防抖/节流（频繁操作）
   └── memo/useMemo（避免重渲染）

2. 内存管理
   ├── 章节懒加载
   ├── 图片按需加载
   └── 及时清理监听器

3. Web Worker
   ├── EPUB 解析
   ├── 搜索索引
   └── 数据处理
```

### 6.3 性能指标目标

| 指标 | 目标值 |
|------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| 首次加载大小 | < 500KB (gzip) |

---

## 7. 安全考虑

### 7.1 数据安全

```
安全措施：

├── HTTPS 强制
├── XSS 防护
├── CSRF 防护
├── 内容安全策略 (CSP)
├── 敏感数据加密存储
└── 安全的 Cookie 配置
```

### 7.2 用户隐私

```
隐私保护：

├── 最小数据收集原则
├── 本地优先存储
├── 明确的隐私政策
├── 数据导出/删除功能
└── GDPR/CCPA 合规
```

---

## 8. 实施路线图

### Phase 1: 基础功能完善（P0）

- [ ] 响应式布局优化
- [ ] 阅读器核心功能
- [ ] 词汇学习基础功能
- [ ] 用户认证系统
- [ ] 基础 PWA 支持

### Phase 2: 体验增强（P1）

- [ ] AI 辅助面板
- [ ] 快捷键系统
- [ ] 专注阅读模式
- [ ] 学习统计仪表盘
- [ ] 离线阅读支持

### Phase 3: 高级功能（P2）

- [ ] 双栏对照模式
- [ ] 数据导出功能
- [ ] 多窗口支持
- [ ] 浏览器扩展
- [ ] 高级搜索功能

### Phase 4: 生态扩展（P3）

- [ ] 社区功能
- [ ] 第三方集成
- [ ] API 开放
- [ ] 插件系统

---

## 9. 技术实现细节

### 9.1 组件架构

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关路由组
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/                   # 主应用路由组
│   │   ├── library/              # 书库
│   │   ├── reader/[bookId]/      # 阅读器
│   │   ├── vocabulary/           # 词汇中心
│   │   ├── stats/                # 学习统计
│   │   └── settings/             # 设置
│   ├── api/                      # API 路由
│   └── layout.tsx                # 根布局
├── components/
│   ├── ui/                       # 基础 UI 组件 (Radix)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   └── ...
│   ├── reader/                   # 阅读器组件
│   │   ├── ReaderContainer.tsx
│   │   ├── ReaderContent.tsx
│   │   ├── ReaderSidebar.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── AIPanel.tsx
│   │   ├── WordPopover.tsx
│   │   ├── FocusMode.tsx
│   │   └── DualColumnView.tsx
│   ├── vocabulary/               # 词汇组件
│   │   ├── VocabDashboard.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── WordList.tsx
│   │   └── VocabStats.tsx
│   ├── library/                  # 书库组件
│   │   ├── BookGrid.tsx
│   │   ├── BookList.tsx
│   │   ├── BookCard.tsx
│   │   └── ImportDialog.tsx
│   └── shared/                   # 共享组件
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── SearchDialog.tsx
│       └── KeyboardShortcuts.tsx
├── hooks/                        # 自定义 Hooks
│   ├── useKeyboardShortcuts.ts
│   ├── useReader.ts
│   ├── useVocabulary.ts
│   ├── useOffline.ts
│   └── useMediaSession.ts
├── stores/                       # Zustand 状态管理
│   ├── readerStore.ts
│   ├── vocabularyStore.ts
│   ├── settingsStore.ts
│   └── uiStore.ts
├── lib/                          # 工具库
│   ├── epub/                     # EPUB 处理
│   ├── ai/                       # AI 集成
│   ├── db/                       # IndexedDB 操作
│   └── sync/                     # 云端同步
└── types/                        # TypeScript 类型
```

### 9.2 状态管理设计

```typescript
// stores/readerStore.ts
interface ReaderState {
  // 书籍信息
  currentBook: Book | null;
  currentChapter: number;
  currentLocation: string;

  // 阅读设置
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';

  // 阅读模式
  viewMode: 'standard' | 'focus' | 'dual-column';
  showTOC: boolean;
  showAIPanel: boolean;

  // 选中状态
  selectedText: string | null;
  selectedWord: Word | null;

  // Actions
  setBook: (book: Book) => void;
  navigateTo: (location: string) => void;
  setFontSize: (size: number) => void;
  toggleFocusMode: () => void;
  // ...
}

// stores/vocabularyStore.ts
interface VocabularyState {
  // 词汇数据
  words: Word[];
  reviewQueue: Word[];

  // 复习状态
  currentReviewIndex: number;
  showAnswer: boolean;

  // 统计
  totalWords: number;
  masteredWords: number;
  learningWords: number;

  // Actions
  addWord: (word: Word) => void;
  reviewWord: (wordId: string, rating: 1 | 2 | 3 | 4) => void;
  getNextReviewWord: () => Word | null;
  // ...
}
```

### 9.3 EPUB 阅读器实现

```typescript
// lib/epub/reader.ts
import ePub, { Book, Rendition } from 'epubjs';

export class EpubReader {
  private book: Book;
  private rendition: Rendition;

  async loadBook(url: string | ArrayBuffer): Promise<void> {
    this.book = ePub(url);
    await this.book.ready;
  }

  render(element: HTMLElement, options: RenderOptions): void {
    this.rendition = this.book.renderTo(element, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: options.spread || 'none',
    });

    // 应用主题
    this.rendition.themes.register('custom', options.styles);
    this.rendition.themes.select('custom');

    // 注册事件
    this.setupEvents();
  }

  private setupEvents(): void {
    // 选中文本事件
    this.rendition.on('selected', (cfiRange: string, contents: Contents) => {
      const selection = contents.window.getSelection();
      const text = selection?.toString();
      if (text) {
        this.onTextSelected(text, cfiRange);
      }
    });

    // 点击词汇事件
    this.rendition.on('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SPAN' && target.dataset.word) {
        this.onWordClick(target.dataset.word);
      }
    });
  }

  // 词汇标注
  async annotateWords(vocabulary: string[]): Promise<void> {
    const contents = this.rendition.getContents();
    for (const content of contents) {
      const doc = content.document;
      const walker = doc.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT
      );

      // 遍历文本节点，标注词汇
      // ...
    }
  }
}
```

### 9.4 AI 辅助集成

```typescript
// lib/ai/assistant.ts
interface AIResponse {
  vocabulary?: VocabularyAnalysis;
  contextAnalysis?: ContextAnalysis;
  suggestions?: string[];
}

export class AIAssistant {
  async analyzeText(
    text: string,
    context: { bookTitle: string; chapter: string }
  ): Promise<AIResponse> {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context }),
    });

    return response.json();
  }

  async lookupWord(
    word: string,
    sentence: string,
    context: { bookTitle: string; chapter: string }
  ): Promise<VocabularyAnalysis> {
    const response = await fetch('/api/ai/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, sentence, context }),
    });

    return response.json();
  }

  async chat(
    message: string,
    history: ChatMessage[],
    context: BookContext
  ): Promise<string> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
    });

    const data = await response.json();
    return data.reply;
  }
}
```

### 9.5 离线存储方案

```typescript
// lib/db/indexedDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ReadmigoDBSchema extends DBSchema {
  books: {
    key: string;
    value: {
      id: string;
      title: string;
      author: string;
      cover: Blob;
      content: ArrayBuffer;
      metadata: BookMetadata;
    };
    indexes: { 'by-title': string };
  };

  vocabulary: {
    key: string;
    value: {
      id: string;
      word: string;
      definition: string;
      pronunciation: string;
      examples: string[];
      bookId: string;
      location: string;
      createdAt: number;
      nextReview: number;
      easeFactor: number;
      interval: number;
    };
    indexes: {
      'by-book': string;
      'by-next-review': number;
    };
  };

  progress: {
    key: string;
    value: {
      bookId: string;
      location: string;
      progress: number;
      lastRead: number;
    };
  };

  notes: {
    key: string;
    value: {
      id: string;
      bookId: string;
      location: string;
      content: string;
      type: 'highlight' | 'note' | 'bookmark';
      createdAt: number;
    };
    indexes: { 'by-book': string };
  };
}

export async function initDB(): Promise<IDBPDatabase<ReadmigoDBSchema>> {
  return openDB<ReadmigoDBSchema>('readmigo', 1, {
    upgrade(db) {
      // 创建 books store
      const bookStore = db.createObjectStore('books', { keyPath: 'id' });
      bookStore.createIndex('by-title', 'title');

      // 创建 vocabulary store
      const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
      vocabStore.createIndex('by-book', 'bookId');
      vocabStore.createIndex('by-next-review', 'nextReview');

      // 创建 progress store
      db.createObjectStore('progress', { keyPath: 'bookId' });

      // 创建 notes store
      const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
      noteStore.createIndex('by-book', 'bookId');
    },
  });
}
```

---

## 10. 移动端适配策略

### 10.1 响应式设计原则

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Desktop-First 但保证移动端可用性                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  桌面端 (≥1024px)                                                        │
│  ├── 完整功能体验                                                        │
│  ├── 多列布局                                                            │
│  ├── 快捷键支持                                                          │
│  └── 高级功能可用                                                        │
│                                                                          │
│  平板端 (768px - 1023px)                                                 │
│  ├── 侧边栏可折叠                                                        │
│  ├── AI 面板抽屉模式                                                     │
│  ├── 触控优化                                                            │
│  └── 大部分功能可用                                                      │
│                                                                          │
│  移动端 (<768px)                                                         │
│  ├── 基础阅读功能                                                        │
│  ├── 底部导航栏                                                          │
│  ├── 全屏阅读模式                                                        │
│  └── 引导下载原生 App                                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 10.2 移动端布局

```
移动端阅读器 (<768px)
┌─────────────────────────┐
│  ← 1984            ☰   │
├─────────────────────────┤
│                         │
│   Chapter 5            │
│                         │
│   The Ministry of      │
│   Truth — Minitrue,    │
│   in Newspeak — was    │
│   startlingly          │
│   different from any   │
│   other object in      │
│   sight...             │
│                         │
│                         │
│   [点击词汇弹出释义]    │
│                         │
├─────────────────────────┤
│  ◄   42/312   ►        │
│  ████████░░░░░░  45%   │
├─────────────────────────┤
│  🏠  📚  📖  📊  ⚙️   │
│  主页 书库 词汇 统计 设置│
└─────────────────────────┘
```

### 10.3 移动端功能限制

| 功能 | 桌面端 | 平板端 | 移动端 |
|------|--------|--------|--------|
| 标准阅读 | ✅ | ✅ | ✅ |
| 快速查词 | ✅ | ✅ | ✅ |
| AI 面板 | ✅ 侧边 | ✅ 抽屉 | ✅ 全屏 |
| 双栏对照 | ✅ | ❌ | ❌ |
| 专注模式 | ✅ | ✅ | ✅ |
| 快捷键 | ✅ | 部分 | ❌ |
| 多窗口 | ✅ | ❌ | ❌ |
| 数据导出 | ✅ | ✅ | 有限 |
| 词汇复习 | ✅ | ✅ | ✅ |
| 学习统计 | ✅ | ✅ | 简化 |

---

## 11. 国际化支持

### 11.1 多语言支持规划

```
支持语言（Phase 1）：
├── 🇨🇳 简体中文 (zh-CN) - 主要
├── 🇺🇸 English (en-US)
└── 🇹🇼 繁體中文 (zh-TW)

支持语言（Phase 2）：
├── 🇯🇵 日本語 (ja-JP)
├── 🇰🇷 한국어 (ko-KR)
└── 🇪🇸 Español (es-ES)
```

### 11.2 i18n 实现方案

```typescript
// lib/i18n/config.ts
import { createI18nClient } from 'next-intl/client';

export const locales = ['zh-CN', 'en-US', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

// messages/zh-CN.json
{
  "common": {
    "search": "搜索",
    "settings": "设置",
    "save": "保存",
    "cancel": "取消"
  },
  "reader": {
    "tableOfContents": "目录",
    "bookmarks": "书签",
    "highlights": "高亮",
    "notes": "笔记",
    "focusMode": "专注模式",
    "exitFocusMode": "退出专注模式",
    "previousChapter": "上一章",
    "nextChapter": "下一章"
  },
  "vocabulary": {
    "dashboard": "词汇仪表盘",
    "totalWords": "总词汇量",
    "toReview": "待复习",
    "mastered": "已掌握",
    "newToday": "今日新增",
    "startReview": "开始复习",
    "showAnswer": "显示答案"
  },
  "library": {
    "myLibrary": "我的书库",
    "reading": "正在阅读",
    "wantToRead": "想要阅读",
    "finished": "已完成",
    "importBook": "导入书籍"
  }
}
```

### 11.3 RTL 支持预留

```css
/* 为未来 RTL 语言支持预留 */
[dir='rtl'] {
  .reader-sidebar {
    left: auto;
    right: 0;
  }

  .ai-panel {
    right: auto;
    left: 0;
  }

  .progress-bar {
    direction: rtl;
  }
}
```

---

## 12. 测试策略

### 12.1 测试类型

```
测试金字塔：
                    ┌───────┐
                    │  E2E  │  5%
                   ┌┴───────┴┐
                   │集成测试 │  15%
                  ┌┴─────────┴┐
                  │  单元测试  │  80%
                 └─────────────┘
```

### 12.2 单元测试

```typescript
// __tests__/components/reader/WordPopover.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WordPopover } from '@/components/reader/WordPopover';

describe('WordPopover', () => {
  const mockWord = {
    word: 'ministry',
    pronunciation: '/ˈmɪn.ɪ.stri/',
    definition: 'n. 部; 政府部门',
  };

  it('renders word and definition', () => {
    render(<WordPopover word={mockWord} />);

    expect(screen.getByText('ministry')).toBeInTheDocument();
    expect(screen.getByText('/ˈmɪn.ɪ.stri/')).toBeInTheDocument();
    expect(screen.getByText('n. 部; 政府部门')).toBeInTheDocument();
  });

  it('calls onSave when save button clicked', () => {
    const onSave = jest.fn();
    render(<WordPopover word={mockWord} onSave={onSave} />);

    fireEvent.click(screen.getByText('收藏'));
    expect(onSave).toHaveBeenCalledWith(mockWord);
  });
});

// __tests__/stores/vocabularyStore.test.ts
import { useVocabularyStore } from '@/stores/vocabularyStore';

describe('vocabularyStore', () => {
  beforeEach(() => {
    useVocabularyStore.getState().reset();
  });

  it('adds word to vocabulary', () => {
    const { addWord, words } = useVocabularyStore.getState();

    addWord({
      id: '1',
      word: 'test',
      definition: 'test definition',
    });

    expect(useVocabularyStore.getState().words).toHaveLength(1);
  });

  it('calculates next review date correctly', () => {
    const { addWord, reviewWord } = useVocabularyStore.getState();

    addWord({ id: '1', word: 'test' });
    reviewWord('1', 4); // Easy

    const word = useVocabularyStore.getState().words[0];
    expect(word.interval).toBeGreaterThan(1);
  });
});
```

### 12.3 集成测试

```typescript
// __tests__/integration/reader.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReaderPage } from '@/app/(main)/reader/[bookId]/page';

describe('Reader Integration', () => {
  it('loads book and displays content', async () => {
    render(<ReaderPage params={{ bookId: 'test-book' }} />);

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });
  });

  it('shows word popup on click', async () => {
    const user = userEvent.setup();
    render(<ReaderPage params={{ bookId: 'test-book' }} />);

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    const word = screen.getByText('ministry');
    await user.click(word);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
});
```

### 12.4 E2E 测试

```typescript
// e2e/reader.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reader/sample-book');
  });

  test('can navigate between chapters', async ({ page }) => {
    await expect(page.getByText('Chapter 1')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('Chapter 2')).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText('Chapter 1')).toBeVisible();
  });

  test('can enter focus mode', async ({ page }) => {
    await page.keyboard.press('f');
    await expect(page.locator('.focus-mode')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('.focus-mode')).not.toBeVisible();
  });

  test('can save vocabulary', async ({ page }) => {
    await page.click('text=ministry');
    await page.click('text=收藏');

    await page.goto('/vocabulary');
    await expect(page.getByText('ministry')).toBeVisible();
  });
});
```

### 12.5 性能测试

```typescript
// __tests__/performance/lighthouse.test.ts
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

describe('Performance', () => {
  it('meets Core Web Vitals thresholds', async () => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    const result = await lighthouse('http://localhost:3000', {
      port: chrome.port,
      onlyCategories: ['performance'],
    });

    const { lcp, fid, cls } = result.lhr.audits;

    expect(lcp.numericValue).toBeLessThan(2500); // < 2.5s
    expect(fid.numericValue).toBeLessThan(100);   // < 100ms
    expect(cls.numericValue).toBeLessThan(0.1);   // < 0.1

    await chrome.kill();
  });
});
```

---

## 13. 部署方案

### 13.1 部署架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         部署架构图                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ┌──────────────┐                                 │
│                        │   Cloudflare  │                                │
│                        │     CDN       │                                │
│                        └──────┬───────┘                                 │
│                               │                                         │
│              ┌────────────────┼────────────────┐                        │
│              │                │                │                        │
│              ▼                ▼                ▼                        │
│       ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│       │  Vercel  │     │ Supabase │     │ R2/S3    │                   │
│       │ (Next.js)│     │   (DB)   │     │ (Storage)│                   │
│       └──────────┘     └──────────┘     └──────────┘                   │
│              │                │                                         │
│              │                │                                         │
│              ▼                ▼                                         │
│       ┌───────────────────────────────┐                                │
│       │     Backend Services          │                                │
│       │  ├── Auth (Supabase Auth)    │                                │
│       │  ├── AI (OpenAI/Claude API)  │                                │
│       │  └── Sync (Real-time)        │                                │
│       └───────────────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 环境配置

```bash
# .env.production
# 应用配置
NEXT_PUBLIC_APP_URL=https://web.readmigo.com
NEXT_PUBLIC_API_URL=https://api.readmigo.com

# 数据库
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# 认证
NEXTAUTH_URL=https://web.readmigo.com
NEXTAUTH_SECRET=your-secret-key

# AI 服务
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# 存储
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=readmigo-books

# 分析
NEXT_PUBLIC_ANALYTICS_ID=...
```

### 13.3 CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy Web App

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
  pull_request:
    branches: [main]
    paths:
      - 'apps/web/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  deploy-preview:
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 13.4 监控与告警

```
监控体系：
├── 性能监控
│   ├── Vercel Analytics
│   ├── Web Vitals 追踪
│   └── 自定义性能指标
│
├── 错误监控
│   ├── Sentry
│   ├── 错误边界捕获
│   └── API 错误追踪
│
├── 用户行为
│   ├── Mixpanel / PostHog
│   ├── 功能使用统计
│   └── 转化漏斗分析
│
└── 基础设施
    ├── Vercel 状态监控
    ├── Supabase 健康检查
    └── Uptime Robot

告警配置：
├── 错误率 > 1% → Slack 告警
├── P95 延迟 > 3s → 邮件通知
├── 服务宕机 → 电话通知
└── 安全事件 → 即时响应
```

---

## 14. 设计原则总结

```
Readmigo Web App 设计原则

1. 效率优先（Efficiency First）
   → 键盘快捷键、批量操作、快速导航

2. 专业深度（Professional Depth）
   → 满足深度学习、研究、备考场景

3. 数据主权（Data Sovereignty）
   → 用户拥有数据、支持导出、隐私保护

4. 跨平台一致（Cross-platform Consistency）
   → 与移动端数据同步、体验一致

5. 渐进增强（Progressive Enhancement）
   → 基础功能无需 JS、高级功能逐步加载
```

---

## 15. 相关文档

- [产品可行性评估](../00-market/feasibility-assessment.md)
- [GTM 策略](../00-market/gtm-strategy.md)
- [会员系统设计](./membership-system.md)
- [产品演进策略](./product-evolution-strategy.md)
- [本地导入功能](./local-import.md)
- [EPUB 格式支持](./epub-format-support.md)

---

*文档版本: 2.0*
*创建日期: 2024-12-27*
*最后更新: 2025-12-28*
*状态: 规划中*
