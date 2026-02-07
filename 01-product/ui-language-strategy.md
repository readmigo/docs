# Readmigo UI 语言策略文档

> 适用阶段：Phase 1 (Q1-Q2 2025) - AI Reader
> 目标市场：中国大陆（简体中文为主）、日本、韩国
> 实施状态：✅ 已完成 (P0-P3)

## 一、核心设计原则

### 1.1 语言分层模型

基于用户画像和产品定位，采用**两层语言模型**：


### 1.2 核心规则

| 元素类型 | 语言策略 | 说明 |
|---------|---------|------|
| **书名** | 跟随系统语言 | 中文系统显示中文书名，英文系统显示英文书名 |
| **作者名** | 跟随系统语言 | 中文系统显示中文作者名，英文系统显示英文作者名 |
| **书籍简介** | 跟随系统语言 | 中文系统显示中文简介，英文系统显示英文简介 |
| **系统 UI** | 跟随系统语言 | 导航、按钮、提示、标签等 |
| **阅读器正文** | **纯英文** | 学习素材，保持原著内容 |

### 1.3 设计依据

| 用户画像 | 语言需求 | 设计响应 |
|---------|---------|---------|
| 英语学习者（主力用户） | 母语浏览 + 英文阅读 | 应用层跟随系统语言，阅读层纯英文 |
| 文学爱好者 | 快速识别书籍 | 书名作者跟随系统语言，降低认知负担 |
| 备考用户 | 高效学习 | 元数据本地化，内容保持英文 |
| 国际用户 | 英文界面 | 系统语言切换后自动适配 |

## 二、各页面语言策略详细设计

### 2.1 Tab Bar 底部导航

**状态**：✅ 已完成
**文件**：`ios/Readmigo/App/ContentView.swift`


**本地化字符串**：
| Key | zh-Hans | zh-Hant | en |
|-----|---------|---------|-----|
| tab.library | 书架 | 書架 | Library |
| tab.discover | 发现 | 發現 | Discover |
| tab.audiobook | 听书 | 聽書 | Listen |
| tab.agora | 城邦 | 城邦 | Agora |
| tab.me | 我的 | 我的 | Me |

---

### 2.2 发现页 (Discover Tab) - 书籍列表

**设计原则**：所有元素跟随系统语言

#### 2.2.1 BookFeedCard 书籍卡片

**中文系统下**：

**英文系统下**：

**实现策略**：

| 元素 | 显示语言 | 实现方式 |
|-----|---------|---------|
| 书名 | 跟随系统语言 | `book.localizedTitle` |
| 作者 | 跟随系统语言 | `book.localizedAuthor` |
| 难度标签 | 跟随系统语言 | `difficulty.easy.localized` |
| 字数 | 跟随系统语言 | 本地化格式 |
| 分类标签 | 跟随系统语言 | `genre.localized` |

**数据模型扩展**：

#### 2.2.2 搜索功能

| 元素 | 语言策略 |
|-----|---------|
| 搜索框占位符 | 跟随系统语言 |
| 热门搜索 | 跟随系统语言（返回本地化搜索词） |
| 搜索历史 | 用户输入原文 |
| 搜索结果标题 | 跟随系统语言 |
| 无结果提示 | 跟随系统语言 |

---

### 2.3 书籍详情页 (Book Detail)

**设计原则**：元数据跟随系统语言，章节标题保持英文

**中文系统下**：

**英文系统下**：

**策略总结**：

| 元素 | 语言策略 | 说明 |
|-----|---------|------|
| 书名 | 跟随系统语言 | `book.localizedTitle` |
| 作者名 | 跟随系统语言 | `book.localizedAuthor` |
| 操作按钮 | 跟随系统语言 | UI 本地化 |
| 书籍简介 | 跟随系统语言 | `book.localizedDescription` |
| 元数据标签 | 跟随系统语言 | 难度、字数、分类 |
| 章节标题 | **英文** | 保持原著结构，与阅读内容一致 |

---

### 2.4 作者详情页 (Author Profile)

**设计原则**：元数据跟随系统语言，语录保持英文原文（学习素材）

**中文系统下**：

**英文系统下**：

**策略**：

| 元素 | 语言策略 | 说明 |
|-----|---------|------|
| 作者姓名 | 跟随系统语言 | `author.localizedName` |
| 生卒年代 | 数字 + 本地化国籍 | "1775-1817 · 英国/British" |
| 作者简介 | 跟随系统语言 | `author.localizedBio` |
| 时间线事件 | 跟随系统语言 | `event.localizedTitle` |
| 经典语录 | **英文原文** | 学习素材，保持原著 |
| 语录来源 | 跟随系统语言 | 书名本地化 |
| 写作风格 | 跟随系统语言 | 帮助理解 |

---

### 2.5 阅读器页面 (Reader View)

**设计原则**：**纯英文阅读环境**（核心学习场景）+ UI 跟随系统语言


**策略**：

| 元素 | 语言策略 | 理由 |
|-----|---------|------|
| 正文内容 | **纯英文** | 核心学习素材 |
| 章节标题 | **纯英文** | 保持原著结构 |
| 工具栏按钮 | 跟随系统语言 | UI 层 |
| 生词释义 | 跟随系统语言 | 中文系统显示中文释义 |
| AI 对话 | 跟随系统语言 | 用户可自选对话语言 |
| 翻译功能 | 跟随系统语言 | 翻译结果显示为用户母语 |

---

### 2.6 有声书页面 (Audiobook)

**设计原则**：元数据跟随系统语言，朗读内容纯英文

**中文系统下**：

| 元素 | 语言策略 |
|-----|---------|
| 书名 | 跟随系统语言 |
| 章节名 | 英文（与阅读器一致） |
| 朗读内容 | **纯英文** |
| 同步文本 | **纯英文** |
| UI 按钮 | 跟随系统语言 |

---

### 2.7 城邦社区 (Agora)

**设计原则**：系统 UI 跟随系统语言，UGC 内容保持用户原始输入


| 元素 | 语言策略 |
|-----|---------|
| 导航标题 | 跟随系统语言 |
| 用户帖子 | 用户原始输入 |
| 引用书籍名 | 跟随系统语言 |
| 交互按钮 | 跟随系统语言 |

---

### 2.8 个人中心 (Me Tab)

**设计原则**：全部跟随系统语言

| 模块 | 语言策略 |
|-----|---------|
| 用户信息 | 跟随系统语言 |
| 阅读统计 | 跟随系统语言 |
| 生词本 | 词条英文，释义跟随系统语言 |
| 设置选项 | 跟随系统语言 |
| 会员中心 | 跟随系统语言 |
| 帮助与反馈 | 跟随系统语言 |

---

## 三、数据模型实现

> 状态：✅ 已完成
> 文件：`ios/Readmigo/Core/Models/Book.swift`, `ios/Readmigo/Core/Models/Author.swift`

### 3.1 本地化工具类


### 3.2 Book Model 实现（含缺失翻译日志）


### 3.3 Author Model 实现（含缺失翻译日志）


### 3.4 日志分类支持


### 3.5 难度等级本地化


**本地化字符串**：
| Key | zh-Hans | zh-Hant | en |
|-----|---------|---------|-----|
| difficulty.unknown | 未知 | 未知 | Unknown |
| difficulty.easy | 初级 | 初級 | Easy |
| difficulty.medium | 中级 | 中級 | Medium |
| difficulty.challenging | 挑战 | 挑戰 | Challenging |
| difficulty.advanced | 进阶 | 進階 | Advanced |

---

## 四、Phase 1 实施优先级

### P0 - 基础设施 ✅ 已完成

1. **✅ 添加 LocaleHelper 工具类**
   - 创建统一的语言环境检测逻辑
   - 文件: `ios/Readmigo/Core/Models/Book.swift`

2. **✅ Tab Bar 完全本地化**
   - 修复硬编码字符串
   - 统一使用 `.localized` 扩展
   - 文件: `ios/Readmigo/App/ContentView.swift`

3. **✅ Book Model 扩展**
   - 添加 `titleZh`, `authorZh`, `descriptionZh` 字段
   - 添加 `localizedTitle`, `localizedAuthor`, `localizedDescription` 计算属性
   - 添加缺失翻译日志记录
   - 文件: `ios/Readmigo/Core/Models/Book.swift`

4. **✅ Author Model 扩展**
   - 添加 `localizedName`, `localizedBio` 计算属性
   - 添加缺失翻译日志记录
   - 文件: `ios/Readmigo/Core/Models/Author.swift`

5. **✅ 日志分类支持**
   - 添加 `LogCategory.localization`
   - 文件: `ios/Readmigo/Core/Models/Log.swift`

### P1 - 高优先级 ✅ 已完成

6. **✅ 书籍列表本地化展示**
   - BookFeedCard 使用 `book.localizedTitle`
   - BookRowView 使用 `book.localizedAuthor`
   - 文件: `ios/Readmigo/Features/Discover/Views/BookFeedCard.swift`

7. **✅ 难度标签本地化**
   - `DifficultyBadge` 使用本地化字符串
   - 添加 zh-Hans/zh-Hant 翻译
   - 文件: `ios/Readmigo/Core/Models/Book.swift`

8. **✅ 核心 UI 按钮本地化**
   - "开始阅读"、"加入书架"、"听书" 等
   - 搜索框、空状态提示
   - 文件: `ios/Readmigo/Localizable.xcstrings`

### P2 - 中优先级 ✅ 已完成

9. **✅ 作者页面本地化**
   - 使用 `author.localizedName`
   - 使用 `author.localizedBio`
   - Timeline 事件使用 `event.localizedTitle`
   - 文件: `ios/Readmigo/Core/Models/Author.swift`

10. **✅ 书籍详情页本地化**
    - 书名使用 `book.localizedTitle`
    - 描述使用 `book.localizedDescription`
    - 文件: `ios/Readmigo/Features/Library/BookDetailView.swift`

11. **✅ 分类标签本地化**
    - 添加 `GenreHelper` 工具类映射分类到本地化键
    - 前端使用 `book.localizedGenres` 和 `book.localizedFirstGenre`
    - 文件: `ios/Readmigo/Core/Models/Book.swift`

### P3 - 深度本地化 ✅ 已完成

12. **✅ 扩展 LocaleHelper 支持日韩语言**
    - 添加 `SupportedLanguage` 枚举 (english, chinese, japanese, korean)
    - 扩展 `LocaleHelper` 支持 `currentLanguage`, `isJapaneseLocale`, `isKoreanLocale`
    - 文件: `ios/Readmigo/Core/Models/Book.swift`

13. **✅ Book Model 添加日韩本地化字段**
    - 添加 `titleJa`, `authorJa`, `descriptionJa` 字段
    - 添加 `titleKo`, `authorKo`, `descriptionKo` 字段
    - 更新 `localizedTitle`, `localizedAuthor`, `localizedDescription` 使用 switch 语句
    - 文件: `ios/Readmigo/Core/Models/Book.swift`

14. **✅ Author Model 添加日韩本地化字段**
    - 添加 `nameJa`, `nameKo` 到 Author 结构体
    - 添加 `nameJa`, `nameKo`, `bioJa`, `bioKo` 到 AuthorDetail
    - 更新 `localizedName`, `localizedBio` 使用 switch 语句
    - 文件: `ios/Readmigo/Core/Models/Author.swift`

15. **✅ 添加日韩 UI 本地化字符串**
    - 难度等级: 上級/고급, 簡単/쉬움, 中級/보통, やや難しい/도전적, 不明/알 수 없음
    - 分类标签: 冒険/모험, ファンタジー/판타지, ミステリー/미스터리 等
    - 书籍状态: 読みたい/읽고 싶음, 読書中/읽는 중, 読了/완료
    - 文件: `ios/Readmigo/Localizable.xcstrings`

---

## 五、后端配合要求

> 状态：✅ 已完成
> 更新日期：2025-12-27

### 5.1 API 返回字段

后端 API 需返回以下本地化字段（✅ 已全部支持）：

| 接口 | 必须返回字段 | 状态 |
|-----|------------|------|
| `/books` | `titleZh`, `authorZh`, `descriptionZh`, `titleJa`, `authorJa`, `descriptionJa`, `titleKo`, `authorKo`, `descriptionKo` | ✅ 已支持 |
| `/books/:id` | `titleZh`, `authorZh`, `descriptionZh`, `titleJa`, `authorJa`, `descriptionJa`, `titleKo`, `authorKo`, `descriptionKo` | ✅ 已支持 |
| `/authors` | `nameZh`, `nameJa`, `nameKo` | ✅ 已支持 |
| `/authors/:id` | `nameZh`, `bioZh`, `nameJa`, `bioJa`, `nameKo`, `bioKo` | ✅ 已支持 |
| `/authors/:id` (timelineEvents) | `titleZh`, `titleJa`, `titleKo` | ✅ 已支持 |
| `/authors/:id` (quotes) | `textZh`, `sourceZh`, `textJa`, `sourceJa`, `textKo`, `sourceKo` | ✅ 已支持 |

### 5.2 缺失翻译监控

前端会在以下情况记录日志：


**后端需要**：
1. 收集 `Localization` 分类的日志
2. 建立缺失翻译追踪看板
3. 定期补充缺失的中文翻译

### 5.3 翻译优先级

1. **高优先级**：热门书籍（阅读量前 100）
2. **中优先级**：新上架书籍
3. **低优先级**：长尾书籍

---

## 六、质量标准

### 6.1 一致性检查清单

- [ ] 所有 Tab 标签使用本地化字符串
- [ ] 所有按钮文本使用本地化字符串
- [ ] 书籍标题使用 `localizedTitle` 计算属性
- [ ] 作者姓名使用 `localizedAuthor` / `localizedName` 计算属性
- [ ] 书籍简介使用 `localizedDescription` 计算属性
- [ ] 难度标签全部本地化
- [ ] 空状态/错误提示全部本地化
- [ ] 阅读器正文保持纯英文

### 6.2 用户体验测试要点

1. **中文系统用户（主要场景）**
   - 书名、作者名是否显示中文？
   - UI 导航是否全部中文？
   - 阅读器正文是否保持英文？

2. **英文系统用户（次要场景）**
   - 书名、作者名是否显示英文？
   - UI 导航是否全部英文？
   - 切换系统语言后界面是否自动适配？

3. **缺失翻译场景**
   - 当 `titleZh` 为空时，是否正确回退到英文标题？
   - 当 `authorZh` 为空时，是否正确回退到英文作者名？

---

## 七、附录：本地化字符串参考

### 完整字符串表


---

**文档版本**：v1.4
**创建日期**：2025-12-27
**更新日期**：2025-12-27
**适用产品**：Readmigo iOS/Android
**目标阶段**：Phase 1 (Q1-Q2 2025)

---

## 更新日志

### v1.4 (2025-12-27)
- ✅ 完成后端全栈本地化支持
  - Prisma schema: 添加日韩本地化字段到 Book, Author, AuthorTimelineEvent, AuthorQuote
  - Books DTOs: 添加 `titleJa/Ko`, `authorJa/Ko`, `descriptionJa/Ko` 字段
  - Authors DTOs: 添加 `nameJa/Ko`, `bioJa/Ko`, `titleJa/Ko`, `textJa/Ko`, `sourceJa/Ko` 字段
  - Books Service: 更新 create/update 方法支持新字段
  - Authors Service: 更新所有返回 DTO 的方法包含新字段
  - 数据库迁移: 已同步至 PostgreSQL

### v1.3 (2025-12-27)
- ✅ 完成 P1-P3 全部本地化任务
  - P1: 书籍列表本地化、难度标签本地化、核心UI按钮本地化
  - P2: 作者页面本地化、书籍详情页本地化、分类标签本地化（GenreHelper）
  - P3: 日韩深度本地化支持
- ✅ 扩展 LocaleHelper 支持四种语言 (en/zh/ja/ko)
  - 添加 `SupportedLanguage` 枚举
  - 添加 `isJapaneseLocale`, `isKoreanLocale`, `requiresLocalization`
- ✅ Book Model 添加日韩本地化字段
  - `titleJa`, `authorJa`, `descriptionJa`
  - `titleKo`, `authorKo`, `descriptionKo`
- ✅ Author Model 添加日韩本地化字段
  - `nameJa`, `nameKo`, `bioJa`, `bioKo`
- ✅ 添加 40 条日韩 UI 翻译字符串
  - 难度等级、分类标签、书籍状态等
- 更新文档状态为"已完成"

### v1.2 (2025-12-27)
- ✅ 完成 P0 基础设施实现
  - LocaleHelper 工具类
  - Tab Bar 本地化
  - Book/Author Model 扩展
  - 日志分类支持
- 添加「后端配合要求」章节
- 添加缺失翻译日志格式说明
- 更新数据模型代码示例为实际实现版本

### v1.1 (2025-12-27)
- 简化语言策略：从"双语展示"改为"跟随系统语言"
- 更新核心规则：书名、作者名、简介均跟随系统语言
- 添加 LocaleHelper 工具类示例
- 更新数据模型扩展，添加 `localizedTitle`, `localizedAuthor` 等计算属性
- 更新质量标准检查清单
