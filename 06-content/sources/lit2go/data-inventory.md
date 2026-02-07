# Lit2Go 数据盘点

> 从产品和运营角度，梳理 Lit2Go 教育有声书资源及其对 Readmigo 的价值

---

## 1. Lit2Go 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://etc.usf.edu/lit2go/ |
| **定位** | K-12 教育有声书平台 |
| **数据量** | 234 本书，5000+ 音频段落 |
| **运营方** | 佛罗里达大学教育技术中心 (FCIT) |
| **目标用户** | K-12 教师和学生 |
| **API** | ❌ 无官方 API |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 专业朗读质量 | 数量有限 (234本) |
| 阅读级别标注 | 无官方 API |
| 教育场景设计 | 商业使用需确认 |
| 配套 PDF 文本 | 部分内容与 LibriVox 重叠 |
| 学习活动材料 | - |

---

### 2.1 总体规模

| 指标 | 数量 |
|------|------|
| **书籍总数** | 234 本 |
| **音频段落** | 5,000+ |
| **作者数量** | 100+ |
| **分类数量** | 10+ |

### 2.2 分类统计

| 分类 | 说明 | 代表作品 |
|------|------|----------|
| **Classic Literature** | 经典文学 | Dickens, Austen, Shakespeare |
| **Children's Literature** | 儿童文学 | Peter Pan, Wizard of Oz |
| **Adventure & Fantasy** | 冒险奇幻 | Jules Verne, H.G. Wells |
| **African-American Literature** | 非裔美国文学 | Frederick Douglass, W.E.B. Du Bois |
| **Poetry Collections** | 诗歌选集 | 各类诗歌 |
| **Short Story Anthologies** | 短篇小说集 | 多作者选集 |
| **Educational Texts** | 教育文本 | 数学、逻辑教材 |
| **Historical & Documentary** | 历史文献 | 自传、演讲 |
| **Science Fiction** | 科幻 | Wells, Verne |
| **Florida-Themed** | 佛罗里达主题 | 地方文学 |

### 2.3 阅读级别分布

Lit2Go 使用 Flesch-Kincaid 阅读级别指数：

| 级别范围 | 适合年级 | 内容示例 |
|----------|----------|----------|
| **1-3** | 小学低年级 | 简单童话、寓言 |
| **4-6** | 小学高年级 | 儿童文学、冒险故事 |
| **7-9** | 初中 | 经典小说、短篇 |
| **10-12** | 高中 | 复杂文学、哲学 |
| **13+** | 大学/成人 | 学术文本、专业内容 |

---

### 3.1 音频质量

| 特点 | 说明 |
|------|------|
| **朗读者** | 专业录制 |
| **音质** | 稳定、清晰 |
| **格式** | MP3 |
| **对比 LibriVox** | 质量更稳定、无背景噪音 |

### 3.2 配套材料

| 材料 | 说明 |
|------|------|
| **PDF 文本** | 完整书籍文本 |
| **学习活动** | 课堂活动建议 |
| **摘要** | 内容摘要 |
| **引用信息** | 学术引用格式 |
| **时长** | 播放时长 |
| **字数** | 段落字数 |

### 3.3 元数据

每本书/每段落提供：

| 字段 | 说明 |
|------|------|
| **标题** | 书籍/段落标题 |
| **作者** | 作者信息 |
| **阅读级别** | Flesch-Kincaid 指数 |
| **时长** | 音频播放时长 |
| **字数** | 文本字数 |
| **分类** | 类型分类 |
| **集合** | 所属专题集合 |

---

### 4.1 经典文学

| 书籍 | 作者 | 阅读级别 |
|------|------|----------|
| Pride and Prejudice | Jane Austen | 10+ |
| A Tale of Two Cities | Charles Dickens | 10+ |
| The Adventures of Tom Sawyer | Mark Twain | 7-9 |
| Frankenstein | Mary Shelley | 10+ |
| Dracula | Bram Stoker | 9+ |

### 4.2 儿童文学

| 书籍 | 作者 | 阅读级别 |
|------|------|----------|
| The Wonderful Wizard of Oz | L. Frank Baum | 6-8 |
| Peter Pan | J.M. Barrie | 7-9 |
| Alice's Adventures in Wonderland | Lewis Carroll | 7-9 |
| The Wind in the Willows | Kenneth Grahame | 8-10 |
| Aesop's Fables | Aesop | 4-6 |

### 4.3 冒险/科幻

| 书籍 | 作者 | 阅读级别 |
|------|------|----------|
| Twenty Thousand Leagues Under the Sea | Jules Verne | 9+ |
| The Time Machine | H.G. Wells | 9+ |
| Journey to the Center of the Earth | Jules Verne | 9+ |
| The Island of Doctor Moreau | H.G. Wells | 10+ |
| Treasure Island | Robert Louis Stevenson | 8-10 |

---

### 5.1 内容版权

| 项目 | 状态 |
|------|------|
| **原文内容** | 公共领域 |
| **音频录制** | USF 制作，需确认许可 |
| **PDF 文本** | USF 制作，需确认许可 |
| **学习材料** | USF 版权 |

### 5.3 法律风险评估

| 风险类型 | 等级 | 说明 |
|----------|------|------|
| **原文版权** | ✅ 低 | 公共领域 |
| **音频版权** | ⚠️ 中 | USF 制作，需授权 |
| **商业使用** | ⚠️ 中 | 需明确许可 |

---

### 6.2 技术注意事项

| 事项 | 说明 |
|------|------|
| **无 API** | 需要网页爬取 |
| **robots.txt** | 需遵守爬虫规则 |
| **速率限制** | 建议 1 请求/秒 |
| **User-Agent** | 设置合适的标识 |

---

### 7.1 功能场景

| 功能 | Lit2Go 数据 | 价值 |
|------|-------------|------|
| **分级阅读** | 阅读级别 | 核心功能支持 |
| **高质量有声书** | 音频文件 | 提升用户体验 |
| **听读同步** | PDF 文本 | 增强学习效果 |
| **入门推荐** | 分级内容 | 新用户引导 |

### 7.3 实施建议

| 阶段 | 任务 | 说明 |
|------|------|------|
| **前置** | 联系 USF 确认授权 | 必须步骤 |
| **Phase 1** | 导入精选 50 本 | 测试效果 |
| **Phase 2** | 导入全部 234 本 | 完整库 |
| **Phase 3** | 开发分级阅读功能 | 利用级别数据 |

---

## 8. 与其他数据源对比

| 对比项 | Lit2Go | LibriVox |
|--------|--------|----------|
| **数量** | 234 本 | 20,000+ |
| **朗读质量** | ⭐⭐⭐⭐⭐ 专业 | ⭐⭐⭐ 志愿者 |
| **阅读级别** | ✅ 有 | ❌ 无 |
| **配套文本** | ✅ PDF | ❌ 无 |
| **商业使用** | ⚠️ 需确认 | ✅ 公共领域 |
| **教育设计** | ✅ 专为教育 | ❌ 通用 |

---

### 官方网站

- [Lit2Go 主页](https://etc.usf.edu/lit2go/)
- [书籍列表](https://etc.usf.edu/lit2go/books/)
- [分类浏览](https://etc.usf.edu/lit2go/genres/)
- [阅读级别说明](https://etc.usf.edu/lit2go/readability/)

### 联系方式

- **机构**: Florida Center for Instructional Technology (FCIT)
- **大学**: University of South Florida
- **邮箱**: fcit@usf.edu

### 相关文章

- [How To Use Lit2Go Audiobooks in Your Classroom](https://fcit.usf.edu/how-to-use-lit2go-audiobooks-in-your-classroom/)
- [Lit2Go's 200 Free Audio Books - Open Culture](https://www.openculture.com/2012/05/lit2gos_200_free_and_teacher-friendly_audio_books_.html)

---

*文档更新日期: 2025-12-30*
