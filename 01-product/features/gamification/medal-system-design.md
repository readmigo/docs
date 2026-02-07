# Readmigo 勋章体系设计文档

> Version: 1.0.0
> Status: Draft - Pending Review
> Author: System Architect
> Date: 2025-12-23

---

## 1. 概述

### 1.1 设计目标

设计一套以**阅读时长为核心驱动**的勋章激励体系，通过：
- 丰富多样的勋章种类激发用户持续阅读
- 融入文化深度与品牌特色增强用户认同感
- 高品质 3D 金属质感视觉呈现提升收藏价值
- 社交分享机制促进自然传播

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| **阅读驱动** | 以阅读时长为核心衡量标准，所有勋章获取均需阅读积累 |
| **层次分明** | 勋章分级清晰，从入门到珍稀形成明确的成长阶梯 |
| **文化底蕴** | 融入中西方文学、历史、哲学元素，提升文化价值 |
| **视觉震撼** | 3D 金属质感、光线效果、动态展示，打造收藏级体验 |
| **账号绑定** | 勋章永久归属用户账号，跨设备同步，不会丢失 |

---

## 2. 勋章体系架构

### 2.1 勋章分类结构


### 2.2 勋章稀有度等级


---

## 3. 勋章详细设计

### 3.1 阅读里程碑系列 (Reading Milestones)

> 核心驱动指标：累计阅读时长

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 初心萌芽 | First Sprout | 累计阅读 1 小时 | COMMON | 嫩芽破土图案 |
| 2 | 书海初航 | First Voyage | 累计阅读 5 小时 | COMMON | 小船扬帆图案 |
| 3 | 晨曦微光 | Dawn Light | 累计阅读 10 小时 | COMMON | 日出光线图案 |
| 4 | 求知若渴 | Thirst for Knowledge | 累计阅读 25 小时 | UNCOMMON | 古泉流水图案 |
| 5 | 书卷气华 | Bookish Elegance | 累计阅读 50 小时 | UNCOMMON | 展开的书卷 |
| 6 | 百日炼心 | Century Heart | 累计阅读 100 小时 | RARE | 炼金术符号 |
| 7 | 学海无涯 | Boundless Sea | 累计阅读 200 小时 | RARE | 深海珍珠图案 |
| 8 | 博览群书 | Well-Read Scholar | 累计阅读 365 小时 | RARE | 古希腊柱廊 |
| 9 | 千里之行 | Thousand Miles | 累计阅读 500 小时 | EPIC | 丝绸之路图案 |
| 10 | 学富五车 | Five Carts of Books | 累计阅读 1000 小时 | EPIC | 中式书架马车 |
| 11 | 穿越时空 | Time Transcender | 累计阅读 1500 小时 | EPIC | 时钟齿轮图案 |
| 12 | 文曲星辉 | Star of Literature | 累计阅读 2000 小时 | LEGENDARY | 北斗七星图案 |
| 13 | 藏书万卷 | Ten Thousand Scrolls | 累计阅读 3000 小时 | LEGENDARY | 万卷书楼图案 |
| 14 | 博古通今 | Master of Ages | 累计阅读 5000 小时 | LEGENDARY | 时间沙漏图案 |
| 15 | 阅读之王 | King of Reading | 累计阅读 10000 小时 | LEGENDARY | 皇冠宝座图案 |

### 3.2 阅读连续系列 (Reading Streaks)

> 核心驱动指标：连续阅读天数（每天至少阅读 15 分钟）

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 三日新晖 | Three Days Rising | 连续阅读 3 天 | COMMON | 三道光芒 |
| 2 | 一周坚持 | Week Warrior | 连续阅读 7 天 | COMMON | 七芒星图案 |
| 3 | 半月修行 | Half Moon Path | 连续阅读 15 天 | UNCOMMON | 半月图案 |
| 4 | 月轮圆满 | Full Moon Mastery | 连续阅读 30 天 | UNCOMMON | 满月图案 |
| 5 | 四季如一 | Four Seasons | 连续阅读 90 天 | RARE | 四季轮回图案 |
| 6 | 半年不辍 | Half Year Journey | 连续阅读 180 天 | RARE | 六角星图案 |
| 7 | 年轮印记 | Annual Ring | 连续阅读 365 天 | EPIC | 年轮截面图案 |
| 8 | 铁杵磨针 | Iron Will | 连续阅读 500 天 | EPIC | 铁杵成针典故 |
| 9 | 千日修炼 | Thousand Days | 连续阅读 1000 天 | LEGENDARY | 莲花盛开图案 |
| 10 | 五年如一 | Five Years Strong | 连续阅读 1825 天 | LEGENDARY | 五行元素图案 |
| 11 | 十年树人 | Decade of Growth | 连续阅读 3650 天 | LEGENDARY | 参天大树图案 |
| 12 | 永恒读者 | Eternal Reader | 终身会员+3年连续 | LEGENDARY | 永恒符号∞ |

### 3.3 词汇大师系列 (Vocabulary Master)

> 核心驱动指标：累计学习词汇量（需要有阅读时长门槛）

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 字斟句酌 | Word by Word | 学习 100 词 + 5h阅读 | COMMON | 放大镜字母 |
| 2 | 词海拾贝 | Pearl Picker | 学习 500 词 + 15h阅读 | COMMON | 贝壳珍珠图案 |
| 3 | 积少成多 | Accumulation | 学习 1000 词 + 30h阅读 | UNCOMMON | 沙漏沙粒图案 |
| 4 | 词藻华丽 | Eloquent | 学习 2500 词 + 60h阅读 | UNCOMMON | 华丽羽毛笔 |
| 5 | 出口成章 | Fluent Speech | 学习 5000 词 + 100h阅读 | RARE | 古籍书页图案 |
| 6 | 词汇宝库 | Word Treasury | 学习 7500 词 + 150h阅读 | RARE | 宝箱打开图案 |
| 7 | 学贯中西 | East Meets West | 学习 10000 词 + 200h阅读 | EPIC | 中西融合图案 |
| 8 | 词典编者 | Lexicographer | 学习 15000 词 + 300h阅读 | EPIC | 词典书脊图案 |
| 9 | 语言学家 | Linguist | 学习 20000 词 + 500h阅读 | LEGENDARY | 巴别塔图案 |
| 10 | 词汇之神 | Word Deity | 学习 30000 词 + 1000h阅读 | LEGENDARY | 神圣文字光环 |

### 3.4 书籍征服系列 (Book Conqueror)

> 核心驱动指标：完成书籍数量（需完整阅读）

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 第一本书 | First Book | 完成 1 本书 | COMMON | 单本书籍图案 |
| 2 | 小有所成 | Early Progress | 完成 5 本书 | COMMON | 五本书架图案 |
| 3 | 初露锋芒 | Emerging Talent | 完成 10 本书 | UNCOMMON | 书山阶梯图案 |
| 4 | 藏书一架 | One Shelf | 完成 25 本书 | UNCOMMON | 满载书架图案 |
| 5 | 读书破万卷 | Breaking Through | 完成 50 本书 | RARE | 卷轴堆叠图案 |
| 6 | 书香门第 | Literary Household | 完成 100 本书 | RARE | 书香世家门楼 |
| 7 | 私人图书馆 | Private Library | 完成 150 本书 | EPIC | 图书馆内景 |
| 8 | 阅尽千卷 | Thousand Volumes | 完成 200 本书 | EPIC | 千卷书海图案 |
| 9 | 收藏家 | Book Collector | 完成 300 本书 | LEGENDARY | 收藏馆图案 |
| 10 | 书山有路 | Path Through Books | 完成 500 本书 | LEGENDARY | 书山攀登图案 |
| 11 | 文学巨匠 | Literary Giant | 完成 750 本书 | LEGENDARY | 巨人肩膀图案 |
| 12 | 藏书阁主 | Library Master | 完成 1000 本书 | LEGENDARY | 皇家藏书阁 |

### 3.5 文学流派系列 (Literary Genres)

> 核心驱动指标：在特定类型阅读达到一定时长

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 古典之心 | Classical Heart | 经典文学阅读 50h | UNCOMMON | 古希腊桂冠 |
| 2 | 科幻探索者 | Sci-Fi Explorer | 科幻小说阅读 50h | UNCOMMON | 星际飞船图案 |
| 3 | 悬疑侦探 | Mystery Detective | 悬疑推理阅读 50h | UNCOMMON | 放大镜+脚印 |
| 4 | 奇幻旅人 | Fantasy Traveler | 奇幻小说阅读 50h | UNCOMMON | 魔法权杖图案 |
| 5 | 历史行者 | History Walker | 历史类阅读 50h | RARE | 历史沙漏图案 |
| 6 | 哲学思考者 | Philosopher | 哲学类阅读 50h | RARE | 思想者雕塑 |
| 7 | 诗意灵魂 | Poetic Soul | 诗歌阅读 30h | RARE | 羽毛墨水瓶 |
| 8 | 商业领袖 | Business Mind | 商业类阅读 50h | RARE | 商业图表上升 |
| 9 | 科学先锋 | Science Pioneer | 科学类阅读 50h | EPIC | 原子模型图案 |
| 10 | 全能读者 | All-Genre Master | 完成所有流派勋章 | LEGENDARY | 彩虹书架图案 |

### 3.6 时间旅人系列 (Time Traveler)

> 核心驱动指标：在特殊时间段阅读

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 晨读者 | Early Bird | 累计早晨(5-8点)阅读 50h | UNCOMMON | 晨曦公鸡图案 |
| 2 | 夜读者 | Night Owl | 累计夜间(22-2点)阅读 50h | UNCOMMON | 猫头鹰月亮图案 |
| 3 | 周末战士 | Weekend Warrior | 累计周末阅读 100h | UNCOMMON | 周末休闲图案 |
| 4 | 通勤达人 | Commute Reader | 累计工作日早晚阅读 100h | RARE | 地铁书籍图案 |
| 5 | 假期充电 | Holiday Scholar | 节假日阅读 8h+ | RARE | 节日礼物图案 |
| 6 | 深夜书虫 | Midnight Bookworm | 午夜(0点)正在阅读 10次 | RARE | 午夜钟楼图案 |
| 7 | 全天候读者 | 24/7 Reader | 在一天中每个小时都有阅读记录 | EPIC | 24小时钟表 |
| 8 | 时间主宰 | Time Master | 获得所有时间系列勋章 | LEGENDARY | 时空漩涡图案 |

### 3.7 文化探索系列 (Cultural Explorer)

> 核心驱动指标：阅读不同文化背景的作品

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 东方智慧 | Eastern Wisdom | 中国文学作品阅读 30h | UNCOMMON | 中式祥云图案 |
| 2 | 英伦风情 | British Elegance | 英国文学作品阅读 30h | UNCOMMON | 大本钟图案 |
| 3 | 美国精神 | American Spirit | 美国文学作品阅读 30h | UNCOMMON | 自由女神图案 |
| 4 | 欧陆经典 | Continental Classics | 欧洲大陆文学阅读 30h | RARE | 艾菲尔铁塔图案 |
| 5 | 俄罗斯灵魂 | Russian Soul | 俄罗斯文学阅读 30h | RARE | 洋葱头教堂图案 |
| 6 | 日本物语 | Japanese Tales | 日本文学阅读 30h | RARE | 樱花富士山图案 |
| 7 | 拉美魔幻 | Latin Magic | 拉美文学阅读 30h | EPIC | 魔幻现实主义风格 |
| 8 | 世界公民 | World Citizen | 获得所有文化系列勋章 | LEGENDARY | 地球村图案 |

### 3.8 限定版系列 (Limited Edition)

> 核心驱动指标：在特定活动期间完成指定阅读任务

| 序号 | 勋章名称 | 英文名 | 获取方式 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 新年新篇章 | New Year Chapter | 新年活动完成 | RARE | 烟花书卷图案 |
| 2 | 世界读书日 | World Book Day | 4.23读书日活动 | RARE | 联合国书籍标志 |
| 3 | 七夕鹊桥 | Qixi Bridge | 七夕节阅读活动 | RARE | 鹊桥书信图案 |
| 4 | 中秋圆月 | Mid-Autumn Moon | 中秋节阅读活动 | RARE | 月饼书卷图案 |
| 5 | 感恩之书 | Thanksgiving Book | 感恩节阅读活动 | RARE | 感恩书籍图案 |
| 6 | 圣诞阅读 | Christmas Reading | 圣诞节阅读活动 | RARE | 圣诞树书籍装饰 |
| 7 | 周年庆典 | Anniversary Special | 产品周年庆活动 | EPIC | Readmigo周年标志 |
| 8 | 创始会员 | Founding Member | 早期注册用户专属 | LEGENDARY | 创始徽章图案 |

### 3.9 传奇系列 (Legendary)

> 终极荣誉，需要长期坚持和全面成就

| 序号 | 勋章名称 | 英文名 | 解锁条件 | 稀有度 | 设计元素 |
|------|----------|--------|----------|--------|----------|
| 1 | 阅读传奇 | Reading Legend | 获得 50 枚其他勋章 | LEGENDARY | 传奇皇冠图案 |
| 2 | 文字炼金师 | Word Alchemist | 同时达到: 500h阅读+10000词+100本书 | LEGENDARY | 炼金术符文阵 |
| 3 | 书海之神 | God of Books | 累计阅读 5000h + 500本书 | LEGENDARY | 神圣光环书籍 |
| 4 | 永恒铭记 | Eternal Memory | Pro会员满5年+3000h阅读 | LEGENDARY | 永恒记忆晶体 |
| 5 | 完美主义者 | Perfectionist | 获得所有非限定勋章 | LEGENDARY | 完美多面体钻石 |

---

## 4. 3D 视觉设计规范

### 4.1 整体视觉风格


### 4.2 材质规格


### 4.3 光照系统


### 4.4 动画效果


### 4.5 UI 展示组件


---

## 5. 数据模型设计

### 5.1 Prisma Schema


### 5.2 API 设计


### 5.3 勋章解锁服务


---

## 6. 与阅读时长系统的集成

### 6.1 事件触发机制


### 6.2 定时任务检查


---

## 7. iOS 客户端实现

### 7.1 数据模型


### 7.2 勋章管理器


---

## 8. 社交分享功能

### 8.1 分享图生成


---

## 9. 实施计划

### Phase 1: 基础架构 (第1周)

- [ ] 数据库 Schema 设计与迁移
- [ ] 勋章定义数据初始化
- [ ] 基础 API 实现
- [ ] iOS 数据模型与管理器

### Phase 2: 解锁逻辑 (第2周)

- [ ] 勋章解锁服务实现
- [ ] 事件触发机制
- [ ] 与阅读时长系统集成
- [ ] 定时任务配置

### Phase 3: 3D 视觉 (第3-4周)

- [ ] 3D 模型制作（外包或使用生成工具）
- [ ] 材质系统实现
- [ ] SceneKit 渲染集成
- [ ] 动画效果实现

### Phase 4: UI 完善 (第5周)

- [ ] 勋章列表页面
- [ ] 勋章详情页面
- [ ] 解锁动画
- [ ] 个人主页展示

### Phase 5: 社交分享 (第6周)

- [ ] 分享图生成
- [ ] 分享视频生成
- [ ] 社交平台集成
- [ ] 深度链接支持

---

## 10. 待确认事项

1. **3D 资源制作**: 是否外包专业 3D 设计师，还是使用 AI 生成工具？
2. **勋章数量**: 初期上线是否全部 80+ 枚，还是分批次开放？
3. **限定版节奏**: 限定版勋章的活动频率和获取难度？
4. **会员专属**: 是否有会员专属勋章（Pro/Premium）？
5. **排行榜**: 是否需要勋章数量排行榜功能？

---

**Document Status**: Draft - Pending Review
**Next Steps**: 请 review 后提出修改意见

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 设计中 | 30% | 2025-12-23 | 设计文档完成，数据模型待实现 |
| v1.1 | 🚧 开发中 | 60% | 2025-12-27 | 后端服务层完成，事件监听集成完成 |

### 已完成 ✅
- [x] 勋章系统整体架构设计
- [x] 勋章分类体系设计（10个维度，80+勋章）
- [x] Prisma Schema 完整设计
  - [x] Medal 模型
  - [x] UserMedal 模型
  - [x] MedalTrigger 枚举
- [x] 解锁机制设计
- [x] 勋章等级设计（普通/稀有/史诗/传说/限定版）
- [x] 3D视觉设计方案（6种材质）
- [x] iOS UI组件设计
- [x] 社交分享设计
- [x] **勋章种子数据（70枚勋章配置）** - 包含9个类别
  - [x] 阅读里程碑系列 (15枚)
  - [x] 阅读连续系列 (12枚)
  - [x] 词汇大师系列 (10枚)
  - [x] 书籍征服系列 (12枚)
  - [x] 文学流派系列 (10枚)
  - [x] 时间旅人系列 (8枚)
  - [x] 文化探索系列 (8枚)
  - [x] 限定版系列 (8枚)
  - [x] 传奇系列 (5枚) - 含复合解锁条件
- [x] **后端服务层实现**
  - [x] MedalsService 完整实现
  - [x] MedalsController API 端点
  - [x] checkAndUnlockMedals() 解锁检查方法
- [x] **事件监听集成**
  - [x] ReadingService 阅读会话结束触发
  - [x] ReadingService 书籍完成触发
  - [x] VocabularyService 词汇添加触发

### 进行中 🚧
- [ ] iOS 客户端勋章UI实现
- [ ] 3D勋章模型资源准备

### 待开发 📝

**Phase 1: 基础架构 (第1周)** ✅ 已完成
- [x] 数据库 Schema 迁移
- [x] 勋章定义数据初始化（70枚）
- [x] 基础 API 实现
  - [x] GET /medals (获取所有勋章)
  - [x] GET /medals/:id (获取勋章详情)
  - [x] GET /users/:id/medals (用户勋章)
  - [x] POST /medals/check (手动触发勋章检查)
- [ ] iOS MedalManager 实现

**Phase 2: 解锁逻辑 (第2周)** ✅ 已完成
- [x] MedalUnlockService 实现
  - [x] 勋章解锁条件检查
  - [x] 进度计算
  - [x] 解锁事件触发
- [x] 事件监听器实现
  - [x] reading.session.end 监听 (ReadingService.checkMedalsAfterSession)
  - [x] book.completed 监听 (ReadingService.checkMedalsAfterBookComplete)
  - [x] vocabulary.word.learned 监听 (VocabularyService.checkMedalsAfterVocabularyAdd)
- [x] 与阅读时长系统集成
- [ ] 定时任务配置（每日检查）

**Phase 3: 3D 视觉 (第3-4周)**
- [ ] 3D 勋章模型制作（80+枚）
  - [ ] 基础几何模型
  - [ ] 纹理贴图
  - [ ] 6种材质系统（青铜/白银/黄金/白金/钻石/彩虹）
- [ ] SceneKit 渲染集成
  - [ ] 3D模型加载
  - [ ] 材质渲染
  - [ ] 光照系统
  - [ ] 相机控制
- [ ] 动画效果实现
  - [ ] 旋转动画
  - [ ] 解锁特效
  - [ ] 粒子效果

**Phase 4: UI 完善 (第5周)**
- [ ] iOS 界面实现
  - [ ] MedalsGridView (勋章陈列柜)
  - [ ] MedalDetailView (详情页)
  - [ ] MedalUnlockAnimation (解锁动画)
  - [ ] ProfileMedalsSection (个人主页展示)
- [ ] 进度指示器
- [ ] 过滤和排序

**Phase 5: 社交分享 (第6周)**
- [ ] 分享图生成（3D渲染 + 文字）
- [ ] 分享视频生成（可选）
- [ ] 社交平台集成
  - [ ] 微信分享
  - [ ] 系统分享
- [ ] 深度链接支持

### 依赖项
- 📝 需要阅读时长系统完成（监听阅读事件）
- 📝 需要词汇学习系统（监听单词学习事件）
- 📝 需要书籍完成统计（监听完成事件）
- 📝 需要专业3D设计师或AI生成工具
- 📝 需要勋章图标和3D模型资源

### 技术债务
- 3D模型文件大小优化（每个勋章应<500KB）
- SceneKit性能优化（低端设备）
- 缺少勋章排行榜功能
- 缺少勋章交易/赠送功能（未来可扩展）
