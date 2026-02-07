# 潜在数据源综合分析

> 除核心数据源外的其他潜在公版书/有声书来源调研

---

### 1.1 已有核心数据源

| 数据源 | 类型 | 状态 | 文档 |
|--------|------|------|------|
| **Standard Ebooks** | 电子书 | ✅ 已集成 | `docs/06-content/sources/standard-ebooks/` |
| **Project Gutenberg** | 电子书 | ✅ 已集成 | `docs/06-content/sources/gutenberg/` |
| **LibriVox** | 有声书 | ✅ 已集成 | `docs/06-content/sources/librivox/` |
| **LoyalBooks** | 有声书聚合 | ✅ 已集成 | `docs/06-content/sources/loyalbooks/` |
| **Internet Archive** | 综合 | ✅ 已集成 | `docs/06-content/sources/internet-archive/` |

---

### 2.1 Open Library（元数据）⭐⭐⭐⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | https://openlibrary.org |
| **定位** | 开放图书馆，书籍元数据平台 |
| **数据量** | 3000万+ 书籍记录 |
| **运营方** | Internet Archive |
| **API** | ✅ 完整 RESTful API |

#### 可用 API

| API | 用途 | 说明 |
|-----|------|------|
| **Books API** | 书籍详情 | 按 ISBN/OLID 查询 |
| **Search API** | 搜索 | 标题、作者、主题搜索 |
| **Covers API** | 封面图片 | 多尺寸封面下载 |
| **Authors API** | 作者信息 | 作者详情和作品列表 |
| **Subjects API** | 主题分类 | 按主题浏览 |

#### 使用限制

| 限制 | 说明 |
|------|------|
| **速率限制** | 高频调用需设置 User-Agent |
| **批量下载** | 禁止通过 API 批量下载，需使用月度数据转储 |
| **封面引用** | 公开页面需使用 covers.openlibrary.org |

---

### 2.2 Lit2Go（教育有声书）⭐⭐⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | https://etc.usf.edu/lit2go/ |
| **定位** | K-12 教育有声书平台 |
| **数据量** | 234 本书，5000+ 音频段落 |
| **运营方** | 佛罗里达大学教育技术中心 |
| **API** | ❌ 无（需爬取） |

#### 内容特点

| 特点 | 说明 |
|------|------|
| **阅读级别** | 提供 Flesch-Kincaid 阅读级别 |
| **教育设计** | 专为课堂教学设计 |
| **配套材料** | 含 PDF 文本、学习活动 |
| **朗读质量** | 专业朗读，质量稳定 |

#### 分类体系

| 分类 | 内容示例 |
|------|----------|
| **Classic Literature** | Dickens, Austen, Shakespeare |
| **Children's Literature** | Peter Pan, Wizard of Oz |
| **Adventure & Fantasy** | Jules Verne, H.G. Wells |
| **African-American Literature** | Frederick Douglass, W.E.B. Du Bois |
| **Poetry Collections** | 各类诗歌选集 |
| **Educational Texts** | 数学、逻辑等教材 |

#### 版权状态

| 项目 | 状态 |
|------|------|
| **内容来源** | 公共领域作品 |
| **朗读版权** | 需确认许可证 |
| **商业使用** | 需联系 USF 确认 |

---

### 2.3 Learn Out Loud（教育内容）⭐⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | https://www.learnoutloud.com |
| **定位** | 教育音视频内容平台 |
| **免费有声书** | 4,000+ |
| **总目录** | 50,000+ |
| **API** | ❌ 无 |

#### 内容分类

| 分类 | 说明 |
|------|------|
| **Philosophy** | 哲学经典 |
| **Biography** | 人物传记 |
| **Literature** | 文学作品 |
| **Science** | 科学内容 |
| **Religion** | 宗教哲学 |
| **Business** | 商业管理 |
| **Kids** | 儿童内容 (2000+) |

---

### 2.4 ThoughtAudio（哲学经典）⭐⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | thoughtaudio.com |
| **定位** | 哲学和经典文学有声书 |
| **数据量** | ~100 本 |
| **API** | ❌ 无 |

#### 内容特点

| 特点 | 说明 |
|------|------|
| **专注领域** | 哲学、经典文学 |
| **代表作品** | The Call of the Wild, Siddhartha, Metamorphosis |
| **格式** | MP3 下载 + 在线播放 |
| **配套** | 部分有 PDF 文本 |

---

### 3.1 Digitalbook.io（聚合平台）⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | https://www.digitalbook.io |
| **原名** | Librophile |
| **定位** | 公版书聚合平台 |
| **数据量** | 100,000+ 标题 |

---

### 3.2 Maria Lectrix（宗教文学）⭐⭐

| 项目 | 描述 |
|------|------|
| **网站** | marialectrix.wordpress.com |
| **定位** | 天主教/宗教有声书 |
| **内容** | 早期教父著作、圣人传记 |
| **托管** | Internet Archive |

---

### 4.1 Storynory（需授权）❌

| 项目 | 描述 |
|------|------|
| **网站** | https://www.storynory.com |
| **定位** | 儿童音频故事 |
| **数据量** | 900+ 故事 |
| **版权** | © Storynory Ltd |

### 4.2 Miette's Bedtime Story Podcast ❌

| 项目 | 描述 |
|------|------|
| **平台** | 播客 |
| **状态** | 已停更 |
| **内容** | 短篇小说朗读 |

### 4.3 其他已排除来源

| 来源 | 排除原因 |
|------|----------|
| **Feedbooks** | 已关闭 |
| **Adelaide University** | 已关闭 |
| **ManyBooks** | 无 API，与 PG 重叠 |
| **Faded Page** | 版权复杂，需法律评估 |

---

### 5.1 数据源对比矩阵

| 数据源 | 类型 | 数量 | API | 质量 | 独特性 | 商用 | 推荐度 |
|--------|------|------|-----|------|--------|------|--------|
| **Open Library** | 元数据 | 3000万+ | ✅ | ⭐⭐⭐⭐⭐ | 高 | ✅ | ⭐⭐⭐⭐⭐ |
| **Lit2Go** | 有声书 | 234 | ❌ | ⭐⭐⭐⭐⭐ | 高 | ⚠️ | ⭐⭐⭐⭐ |
| **Learn Out Loud** | 有声书 | 4000+ | ❌ | ⭐⭐⭐⭐ | 中 | ⚠️ | ⭐⭐⭐ |
| **ThoughtAudio** | 有声书 | ~100 | ❌ | ⭐⭐⭐⭐ | 中 | ✅ | ⭐⭐⭐ |
| **Digitalbook.io** | 聚合 | 10万+ | ❌ | ⭐⭐⭐ | 低 | ✅ | ⭐⭐ |
| **Maria Lectrix** | 有声书 | 有限 | ❌ | ⭐⭐⭐⭐ | 高 | ✅ | ⭐⭐ |
| **Storynory** | 儿童 | 900+ | ❌ | ⭐⭐⭐⭐ | 高 | ❌ | ❌ |

---

### 6.1 短期（Phase 1）

| 任务 | 说明 | 价值 |
|------|------|------|
| **集成 Open Library Covers API** | 为现有书籍补充封面 | 提升视觉体验 |
| **集成 Open Library Books API** | 补充书籍描述 | 丰富内容展示 |

### 6.2 中期（Phase 2）

| 任务 | 说明 | 价值 |
|------|------|------|
| **评估 Lit2Go 授权** | 联系 USF 确认商业使用 | 高质量分级内容 |
| **导入 Lit2Go 内容** | 如授权通过，导入有声书 | 阅读级别功能 |

### 6.3 长期（Phase 3）

| 任务 | 说明 | 价值 |
|------|------|------|
| **评估 Learn Out Loud** | 筛选高价值教育内容 | 扩充内容库 |
| **整合 ThoughtAudio** | 补充哲学经典 | 差异化内容 |

---

### 7.2 行动建议

| 优先级 | 行动 | 预期收益 |
|--------|------|----------|
| **立即** | 集成 Open Library 封面 API | 提升书籍展示效果 |
| **短期** | 集成 Open Library 描述 API | 丰富书籍信息 |
| **中期** | 联系 Lit2Go 确认授权 | 获取分级阅读内容 |
| **长期** | 评估其他教育类数据源 | 扩充内容生态 |

---

### API 文档

- [Open Library APIs](https://openlibrary.org/developers/api)
- [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)
- [Open Library Search API](https://openlibrary.org/dev/docs/api/search)

### 数据源网站

- [Lit2Go](https://etc.usf.edu/lit2go/)
- [Learn Out Loud](https://www.learnoutloud.com/Free-Audiobooks)
- [ThoughtAudio](https://thoughtaudio.com/)
- [Digitalbook.io](https://www.digitalbook.io/)
- [Maria Lectrix](https://marialectrix.wordpress.com/)

### 参考文章

- [Top 8 Sites for Free Public Domain Audiobook](https://www.epubor.com/public-domain-audiobook-site.html)
- [Free Audiobooks Online - Speechify](https://speechify.com/blog/free-audiobooks-online/)
- [1000 Free Audiobooks - Open Culture](https://www.openculture.com/freeaudiobooks)

---

*文档更新日期: 2025-12-30*
