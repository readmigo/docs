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

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Readmigo Medal System                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    1. 阅读里程碑系列 (Reading Milestones)           │  │
│  │    基于累计阅读时长解锁，共 15 枚                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    2. 阅读连续系列 (Reading Streaks)                │  │
│  │    基于连续阅读天数解锁，共 12 枚                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    3. 词汇大师系列 (Vocabulary Master)              │  │
│  │    基于学习词汇量解锁，共 10 枚                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    4. 书籍征服系列 (Book Conqueror)                  │  │
│  │    基于完成书籍数量解锁，共 12 枚                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    5. 文学流派系列 (Literary Genres)                │  │
│  │    基于阅读特定类型书籍解锁，共 10 枚                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    6. 时间旅人系列 (Time Traveler)                   │  │
│  │    基于特殊时间阅读解锁，共 8 枚                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    7. 文化探索系列 (Cultural Explorer)              │  │
│  │    基于阅读特定文化背景作品解锁，共 8 枚                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    8. 限定版系列 (Limited Edition)                   │  │
│  │    节日活动、周年纪念等限时获取，持续增加                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    9. 传奇系列 (Legendary)                           │  │
│  │    极难获取的终极荣誉，共 5 枚                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│                         总计: 80+ 枚核心勋章                              │
│                         + 限定版持续扩充                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 勋章稀有度等级

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Medal Rarity Tiers                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐  │
│   │ COMMON  │   │ UNCOMMON│   │  RARE   │   │  EPIC   │   │LEGENDARY│  │
│   │  普通    │   │  稀有   │   │  珍稀   │   │  史诗   │   │  传奇   │  │
│   │         │   │         │   │         │   │         │   │         │  │
│   │  铜质   │   │  银质   │   │  金质   │   │  白金   │   │  钻石   │  │
│   │  30%    │   │  25%    │   │  25%    │   │  15%    │   │   5%    │  │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘  │
│                                                                          │
│   视觉特征:                                                              │
│   • COMMON:    铜色金属质感，轻微反光                                    │
│   • UNCOMMON:  银色金属质感，柔和光泽                                    │
│   • RARE:      金色金属质感，明亮高光                                    │
│   • EPIC:      白金+渐变色，动态光晕效果                                 │
│   • LEGENDARY: 钻石切面+彩虹折射，粒子特效                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

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

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      3D Medal Visual Design System                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  设计关键词:                                                             │
│  • 金属质感 (Metallic Finish)                                           │
│  • 光线反射 (Light Reflection)                                          │
│  • 深度立体 (Depth & Dimension)                                         │
│  • 收藏价值 (Collectible Value)                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │       ┌──────────────────────────────────────┐                  │    │
│  │       │                                      │                  │    │
│  │       │    ╔═══════════════════════════╗    │   3D 勋章结构:   │    │
│  │       │    ║   High Specular Highlight ║    │                  │    │
│  │       │    ║         高光区域          ║    │   1. 外环边框    │    │
│  │       │    ║                           ║    │   2. 主体浮雕    │    │
│  │       │    ║    ╔═════════════════╗   ║    │   3. 中心图案    │    │
│  │       │    ║    ║  Center Emblem  ║   ║    │   4. 环境反射    │    │
│  │       │    ║    ║    中心图案     ║   ║    │   5. 动态粒子    │    │
│  │       │    ║    ╚═════════════════╝   ║    │      (高级别)    │    │
│  │       │    ║                           ║    │                  │    │
│  │       │    ║    Metallic Reflection    ║    │                  │    │
│  │       │    ║       金属反射           ║    │                  │    │
│  │       │    ╚═══════════════════════════╝    │                  │    │
│  │       │                                      │                  │    │
│  │       └──────────────────────────────────────┘                  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 材质规格

```swift
// MedalMaterial.swift - 勋章材质定义

struct MedalMaterial {

    // COMMON - 铜质
    static let copper = MaterialSpec(
        baseColor: Color(hex: "#B87333"),
        metallicness: 0.85,
        roughness: 0.35,
        specularIntensity: 0.6,
        environmentReflection: 0.3,
        normalMapIntensity: 0.8
    )

    // UNCOMMON - 银质
    static let silver = MaterialSpec(
        baseColor: Color(hex: "#C0C0C0"),
        metallicness: 0.95,
        roughness: 0.15,
        specularIntensity: 0.9,
        environmentReflection: 0.5,
        normalMapIntensity: 0.7
    )

    // RARE - 金质
    static let gold = MaterialSpec(
        baseColor: Color(hex: "#FFD700"),
        metallicness: 1.0,
        roughness: 0.1,
        specularIntensity: 1.0,
        environmentReflection: 0.7,
        normalMapIntensity: 0.6
    )

    // EPIC - 白金渐变
    static let platinum = MaterialSpec(
        baseColor: Color(hex: "#E5E4E2"),
        metallicness: 1.0,
        roughness: 0.05,
        specularIntensity: 1.2,
        environmentReflection: 0.85,
        normalMapIntensity: 0.5,
        gradientOverlay: [
            Color(hex: "#E5E4E2"),
            Color(hex: "#9B5DE5"),
            Color(hex: "#00BBF9")
        ]
    )

    // LEGENDARY - 钻石折射
    static let diamond = MaterialSpec(
        baseColor: Color(hex: "#B9F2FF"),
        metallicness: 1.0,
        roughness: 0.0,
        specularIntensity: 1.5,
        environmentReflection: 1.0,
        normalMapIntensity: 0.3,
        refractionIndex: 2.42,  // 钻石折射率
        rainbowDispersion: true,
        particleEffect: .sparkle
    )
}

struct MaterialSpec {
    let baseColor: Color
    let metallicness: Float      // 0-1 金属度
    let roughness: Float         // 0-1 粗糙度
    let specularIntensity: Float // 高光强度
    let environmentReflection: Float // 环境反射
    let normalMapIntensity: Float    // 法线贴图强度
    var gradientOverlay: [Color]? = nil
    var refractionIndex: Float? = nil
    var rainbowDispersion: Bool = false
    var particleEffect: ParticleEffect? = nil
}

enum ParticleEffect {
    case sparkle    // 闪烁
    case glow       // 光晕
    case fire       // 火焰
    case stars      // 星尘
}
```

### 4.3 光照系统

```swift
// MedalLighting.swift - 勋章光照系统

struct MedalLightingEnvironment {

    // 主光源 - 模拟自然光
    static let keyLight = Light(
        type: .directional,
        color: Color(hex: "#FFF8E7"),  // 暖白光
        intensity: 1.0,
        position: Vector3(x: 1, y: 1, z: 0.5),
        castShadow: true
    )

    // 补光 - 填充阴影
    static let fillLight = Light(
        type: .directional,
        color: Color(hex: "#E3F2FD"),  // 冷蓝光
        intensity: 0.4,
        position: Vector3(x: -0.5, y: 0.5, z: 0.3),
        castShadow: false
    )

    // 边缘光 - 突出轮廓
    static let rimLight = Light(
        type: .directional,
        color: Color.white,
        intensity: 0.6,
        position: Vector3(x: 0, y: -0.3, z: -1),
        castShadow: false
    )

    // 环境光 - HDRI 环境贴图
    static let environmentMap = HDRIEnvironment(
        name: "studio_small_08",
        intensity: 0.8,
        rotation: 0
    )

    // 动态光照 - 用于展示动画
    static func animatedKeyLight(progress: Float) -> Light {
        let angle = progress * Float.pi * 2
        return Light(
            type: .directional,
            color: Color(hex: "#FFF8E7"),
            intensity: 1.0 + sin(angle) * 0.1,
            position: Vector3(
                x: cos(angle) * 1.2,
                y: 1.0,
                z: sin(angle) * 0.5
            ),
            castShadow: true
        )
    }
}
```

### 4.4 动画效果

```swift
// MedalAnimation.swift - 勋章动画系统

enum MedalAnimationType {
    case idle           // 静态展示时的微小浮动
    case unlock         // 解锁时的特效
    case showcase       // 详情页展示
    case share          // 分享时的特效
}

struct MedalAnimationConfig {

    // 静态悬浮动画
    static let idleAnimation = Animation(
        rotationY: FloatAnimation(
            from: -5,
            to: 5,
            duration: 3.0,
            easing: .easeInOut,
            repeatMode: .reverse
        ),
        floatY: FloatAnimation(
            from: 0,
            to: 10,
            duration: 2.0,
            easing: .easeInOut,
            repeatMode: .reverse
        ),
        specularShift: FloatAnimation(
            from: 0,
            to: 360,
            duration: 8.0,
            easing: .linear,
            repeatMode: .loop
        )
    )

    // 解锁动画序列
    static let unlockAnimation = AnimationSequence([
        // 阶段1: 从远处飞入
        AnimationPhase(
            duration: 0.5,
            scale: FloatAnimation(from: 0.1, to: 1.2, easing: .easeOut),
            opacity: FloatAnimation(from: 0, to: 1, easing: .easeOut),
            positionZ: FloatAnimation(from: -500, to: 0, easing: .easeOut)
        ),
        // 阶段2: 弹性缩放
        AnimationPhase(
            duration: 0.3,
            scale: FloatAnimation(from: 1.2, to: 0.95, easing: .easeInOut)
        ),
        // 阶段3: 稳定
        AnimationPhase(
            duration: 0.2,
            scale: FloatAnimation(from: 0.95, to: 1.0, easing: .easeOut)
        ),
        // 阶段4: 粒子爆发 (EPIC/LEGENDARY)
        AnimationPhase(
            duration: 1.0,
            particleEmit: ParticleConfig(
                type: .confetti,
                count: 50,
                spread: 360,
                colors: [.gold, .silver, .white]
            )
        )
    ])

    // 展示动画 - 用于详情页
    static let showcaseAnimation = Animation(
        rotationY: FloatAnimation(
            from: 0,
            to: 360,
            duration: 10.0,
            easing: .linear,
            repeatMode: .loop
        ),
        tiltX: FloatAnimation(
            from: -15,
            to: 15,
            duration: 5.0,
            easing: .easeInOut,
            repeatMode: .reverse
        )
    )

    // LEGENDARY 专属粒子效果
    static let legendaryParticles = ParticleSystemConfig(
        type: .sparkle,
        emissionRate: 10,
        lifetime: 2.0,
        size: FloatRange(min: 2, max: 6),
        color: [.gold, .white, Color(hex: "#FFD700")],
        velocity: Vector3Range(
            min: Vector3(x: -20, y: 10, z: -20),
            max: Vector3(x: 20, y: 30, z: 20)
        ),
        gravity: Vector3(x: 0, y: -5, z: 0),
        blendMode: .additive
    )
}
```

### 4.5 UI 展示组件

```swift
// MedalView.swift - 勋章展示视图

import SwiftUI
import SceneKit

struct MedalView3D: View {
    let medal: Medal
    let size: MedalSize
    @State private var scene: SCNScene?

    enum MedalSize {
        case small      // 40pt - 列表项
        case medium     // 80pt - 网格
        case large      // 160pt - 详情展示
        case showcase   // 全屏展示
    }

    var body: some View {
        ZStack {
            if let scene = scene {
                SceneView(
                    scene: scene,
                    options: [.autoenablesDefaultLighting, .allowsCameraControl],
                    preferredFramesPerSecond: 60
                )
                .frame(width: frameSize.width, height: frameSize.height)
            } else {
                // 加载中的占位图
                MedalPlaceholder(medal: medal, size: size)
            }

            // LEGENDARY 稀有度的外发光效果
            if medal.rarity == .legendary {
                RadialGradient(
                    gradient: Gradient(colors: [
                        Color.yellow.opacity(0.3),
                        Color.clear
                    ]),
                    center: .center,
                    startRadius: frameSize.width * 0.3,
                    endRadius: frameSize.width * 0.6
                )
                .allowsHitTesting(false)
            }
        }
        .onAppear {
            loadScene()
        }
    }

    private var frameSize: CGSize {
        switch size {
        case .small: return CGSize(width: 40, height: 40)
        case .medium: return CGSize(width: 80, height: 80)
        case .large: return CGSize(width: 160, height: 160)
        case .showcase: return CGSize(width: 300, height: 300)
        }
    }

    private func loadScene() {
        Task {
            scene = await MedalSceneLoader.load(medal: medal)
        }
    }
}

// 勋章网格展示
struct MedalGridView: View {
    let medals: [Medal]
    let columns = [GridItem(.adaptive(minimum: 80, maximum: 100))]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(medals) { medal in
                    MedalGridItem(medal: medal)
                }
            }
            .padding()
        }
    }
}

struct MedalGridItem: View {
    let medal: Medal
    @State private var showDetail = false

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                MedalView3D(medal: medal, size: .medium)

                if !medal.isUnlocked {
                    // 未解锁遮罩
                    Circle()
                        .fill(Color.black.opacity(0.6))
                        .frame(width: 80, height: 80)

                    Image(systemName: "lock.fill")
                        .foregroundColor(.white)
                        .font(.title2)
                }
            }

            Text(medal.name)
                .font(.caption)
                .lineLimit(1)
                .foregroundColor(medal.isUnlocked ? .primary : .secondary)
        }
        .onTapGesture {
            showDetail = true
        }
        .sheet(isPresented: $showDetail) {
            MedalDetailView(medal: medal)
        }
    }
}

// 勋章详情页
struct MedalDetailView: View {
    let medal: Medal
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 3D 展示区
                    MedalView3D(medal: medal, size: .showcase)
                        .frame(height: 300)

                    // 勋章信息
                    VStack(spacing: 16) {
                        // 名称和稀有度
                        HStack {
                            Text(medal.name)
                                .font(.title)
                                .fontWeight(.bold)

                            RarityBadge(rarity: medal.rarity)
                        }

                        // 英文名
                        Text(medal.englishName)
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        Divider()

                        // 解锁条件
                        VStack(alignment: .leading, spacing: 8) {
                            Text("解锁条件")
                                .font(.headline)

                            Text(medal.unlockDescription)
                                .foregroundColor(.secondary)

                            if !medal.isUnlocked {
                                ProgressView(value: medal.progress)
                                    .tint(medal.rarity.color)

                                Text(medal.progressDescription)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        Divider()

                        // 设计理念
                        VStack(alignment: .leading, spacing: 8) {
                            Text("设计理念")
                                .font(.headline)

                            Text(medal.designStory)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        if medal.isUnlocked {
                            Divider()

                            // 获得时间
                            HStack {
                                Image(systemName: "calendar")
                                Text("获得于 \(medal.unlockedAt?.formatted() ?? "")")
                            }
                            .font(.caption)
                            .foregroundColor(.secondary)

                            // 分享按钮
                            ShareMedalButton(medal: medal)
                        }
                    }
                    .padding()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") { dismiss() }
                }
            }
        }
    }
}

struct RarityBadge: View {
    let rarity: MedalRarity

    var body: some View {
        Text(rarity.displayName)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(rarity.color)
            .cornerRadius(4)
    }
}
```

---

## 5. 数据模型设计

### 5.1 Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

// 勋章定义表
model MedalDefinition {
  id                String          @id @default(uuid())
  code              String          @unique  // 唯一标识，如 "READING_MILESTONE_1"

  // 基本信息
  nameZh            String          // 中文名
  nameEn            String          // 英文名
  descriptionZh     String          // 中文描述
  descriptionEn     String          // 英文描述

  // 分类
  category          MedalCategory
  rarity            MedalRarity

  // 解锁条件
  unlockType        UnlockType
  unlockThreshold   Int             // 解锁阈值
  unlockConditions  Json?           // 复杂条件的 JSON 表达

  // 视觉资源
  iconUrl           String          // 2D 图标
  model3dUrl        String?         // 3D 模型文件路径
  materialPreset    String          // 材质预设名称

  // 设计故事
  designStory       String?

  // 排序和状态
  displayOrder      Int             @default(0)
  isActive          Boolean         @default(true)
  isLimited         Boolean         @default(false)  // 是否限定版
  limitedStartAt    DateTime?
  limitedEndAt      DateTime?

  // 时间戳
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // 关联
  userMedals        UserMedal[]

  @@index([category])
  @@index([rarity])
  @@index([isActive])
}

// 用户勋章表 (勋章发放到用户名下)
model UserMedal {
  id                String          @id @default(uuid())

  userId            String
  user              Account         @relation(fields: [userId], references: [id], onDelete: Cascade)

  medalId           String
  medal             MedalDefinition @relation(fields: [medalId], references: [id])

  // 解锁信息
  unlockedAt        DateTime        @default(now())
  unlockedValue     Int?            // 解锁时的具体值（如阅读时长）

  // 展示设置
  isDisplayed       Boolean         @default(false)  // 是否在个人主页展示
  displayOrder      Int?            // 展示排序

  // 元数据
  metadata          Json?           // 额外信息

  createdAt         DateTime        @default(now())

  @@unique([userId, medalId])  // 每用户每勋章只能有一个
  @@index([userId])
  @@index([medalId])
  @@index([unlockedAt])
}

// 勋章进度表 (追踪用户解锁进度)
model MedalProgress {
  id                String          @id @default(uuid())

  userId            String
  user              Account         @relation(fields: [userId], references: [id], onDelete: Cascade)

  medalCode         String          // 勋章代码
  currentValue      Int             @default(0)  // 当前进度值
  lastUpdatedAt     DateTime        @default(now())

  @@unique([userId, medalCode])
  @@index([userId])
}

// 枚举定义
enum MedalCategory {
  READING_MILESTONE     // 阅读里程碑
  READING_STREAK        // 阅读连续
  VOCABULARY_MASTER     // 词汇大师
  BOOK_CONQUEROR        // 书籍征服
  LITERARY_GENRE        // 文学流派
  TIME_TRAVELER         // 时间旅人
  CULTURAL_EXPLORER     // 文化探索
  LIMITED_EDITION       // 限定版
  LEGENDARY             // 传奇
}

enum MedalRarity {
  COMMON        // 普通
  UNCOMMON      // 稀有
  RARE          // 珍稀
  EPIC          // 史诗
  LEGENDARY     // 传奇
}

enum UnlockType {
  READING_DURATION      // 累计阅读时长
  READING_STREAK        // 连续阅读天数
  VOCABULARY_COUNT      // 词汇量
  BOOK_COMPLETED        // 完成书籍数
  GENRE_READING         // 特定类型阅读时长
  TIME_BASED            // 特定时间阅读
  CULTURAL_READING      // 文化类阅读
  COMPOSITE             // 复合条件
  MANUAL                // 手动发放（活动等）
}
```

### 5.2 API 设计

```typescript
// Medal API Endpoints

// GET /api/v1/medals
// 获取所有勋章定义
interface GetMedalsResponse {
  medals: MedalDefinition[];
  categories: MedalCategory[];
}

// GET /api/v1/medals/user
// 获取用户勋章（含进度）
interface GetUserMedalsResponse {
  unlocked: UserMedal[];
  progress: MedalProgress[];
  stats: {
    totalUnlocked: number;
    totalMedals: number;
    byRarity: Record<MedalRarity, number>;
    byCategory: Record<MedalCategory, number>;
  };
}

// GET /api/v1/medals/:medalId
// 获取勋章详情
interface GetMedalDetailResponse {
  medal: MedalDefinition;
  userStatus: {
    isUnlocked: boolean;
    unlockedAt?: string;
    progress?: {
      current: number;
      target: number;
      percentage: number;
    };
  };
  globalStats: {
    totalUnlocked: number;  // 全站已解锁人数
    unlockRate: number;     // 解锁率
  };
}

// POST /api/v1/medals/check
// 检查并解锁勋章（由后端事件触发或定时任务调用）
interface CheckMedalsRequest {
  userId: string;
  triggerEvent?: string;  // 触发事件类型
}

interface CheckMedalsResponse {
  newlyUnlocked: UserMedal[];
  updatedProgress: MedalProgress[];
}

// PUT /api/v1/medals/display
// 设置展示勋章
interface SetDisplayMedalsRequest {
  medalIds: string[];  // 最多展示 5 枚
}

// POST /api/v1/medals/:medalId/share
// 生成分享图片
interface ShareMedalRequest {
  medalId: string;
  format: 'image' | 'video';
}

interface ShareMedalResponse {
  shareUrl: string;
  imageUrl: string;
}
```

### 5.3 勋章解锁服务

```typescript
// MedalUnlockService.ts

@Injectable()
export class MedalUnlockService {
  constructor(
    private prisma: PrismaService,
    private readingService: ReadingDurationService,
    private notificationService: NotificationService,
  ) {}

  // 检查并解锁勋章
  async checkAndUnlock(userId: string, triggerEvent?: string): Promise<UnlockResult> {
    const newlyUnlocked: UserMedal[] = [];
    const updatedProgress: MedalProgress[] = [];

    // 获取用户当前数据
    const userData = await this.getUserMetrics(userId);

    // 获取所有未解锁的活动勋章
    const unlockedMedalIds = await this.getUnlockedMedalIds(userId);
    const availableMedals = await this.getAvailableMedals(unlockedMedalIds);

    for (const medal of availableMedals) {
      const checkResult = await this.checkMedalCondition(medal, userData);

      if (checkResult.isUnlocked) {
        // 解锁勋章
        const userMedal = await this.unlockMedal(userId, medal, checkResult.value);
        newlyUnlocked.push(userMedal);

        // 发送通知
        await this.notificationService.sendMedalUnlocked(userId, medal);
      } else {
        // 更新进度
        const progress = await this.updateProgress(userId, medal.code, checkResult.value);
        updatedProgress.push(progress);
      }
    }

    return { newlyUnlocked, updatedProgress };
  }

  // 获取用户指标数据
  private async getUserMetrics(userId: string): Promise<UserMetrics> {
    const [
      readingDuration,
      readingStreak,
      vocabularyCount,
      completedBooks,
      genreStats,
      timeStats,
    ] = await Promise.all([
      this.readingService.getTotalDuration(userId),
      this.readingService.getCurrentStreak(userId),
      this.prisma.userVocabulary.count({ where: { userId } }),
      this.prisma.userBook.count({ where: { userId, completedAt: { not: null } } }),
      this.getGenreReadingStats(userId),
      this.getTimeReadingStats(userId),
    ]);

    return {
      readingDuration,
      readingStreak,
      vocabularyCount,
      completedBooks,
      genreStats,
      timeStats,
    };
  }

  // 检查勋章条件
  private async checkMedalCondition(
    medal: MedalDefinition,
    userData: UserMetrics,
  ): Promise<{ isUnlocked: boolean; value: number }> {
    switch (medal.unlockType) {
      case 'READING_DURATION':
        return {
          isUnlocked: userData.readingDuration >= medal.unlockThreshold,
          value: userData.readingDuration,
        };

      case 'READING_STREAK':
        return {
          isUnlocked: userData.readingStreak >= medal.unlockThreshold,
          value: userData.readingStreak,
        };

      case 'VOCABULARY_COUNT':
        // 词汇勋章还需要检查阅读时长门槛
        const conditions = medal.unlockConditions as VocabularyCondition;
        return {
          isUnlocked:
            userData.vocabularyCount >= medal.unlockThreshold &&
            userData.readingDuration >= (conditions?.minReadingDuration || 0),
          value: userData.vocabularyCount,
        };

      case 'BOOK_COMPLETED':
        return {
          isUnlocked: userData.completedBooks >= medal.unlockThreshold,
          value: userData.completedBooks,
        };

      case 'GENRE_READING':
        const genreConditions = medal.unlockConditions as GenreCondition;
        const genreDuration = userData.genreStats[genreConditions.genre] || 0;
        return {
          isUnlocked: genreDuration >= medal.unlockThreshold,
          value: genreDuration,
        };

      case 'TIME_BASED':
        const timeConditions = medal.unlockConditions as TimeCondition;
        const timeDuration = this.getTimePeriodReading(
          userData.timeStats,
          timeConditions.period,
        );
        return {
          isUnlocked: timeDuration >= medal.unlockThreshold,
          value: timeDuration,
        };

      case 'COMPOSITE':
        return this.checkCompositeCondition(medal, userData);

      default:
        return { isUnlocked: false, value: 0 };
    }
  }

  // 解锁勋章
  private async unlockMedal(
    userId: string,
    medal: MedalDefinition,
    value: number,
  ): Promise<UserMedal> {
    return this.prisma.userMedal.create({
      data: {
        userId,
        medalId: medal.id,
        unlockedValue: value,
        metadata: {
          unlockedBy: 'system',
          timestamp: new Date().toISOString(),
        },
      },
      include: {
        medal: true,
      },
    });
  }

  // 更新进度
  private async updateProgress(
    userId: string,
    medalCode: string,
    currentValue: number,
  ): Promise<MedalProgress> {
    return this.prisma.medalProgress.upsert({
      where: {
        userId_medalCode: { userId, medalCode },
      },
      update: {
        currentValue,
        lastUpdatedAt: new Date(),
      },
      create: {
        userId,
        medalCode,
        currentValue,
      },
    });
  }
}
```

---

## 6. 与阅读时长系统的集成

### 6.1 事件触发机制

```typescript
// ReadingEventEmitter.ts

@Injectable()
export class ReadingEventEmitter {
  constructor(
    private medalService: MedalUnlockService,
    private eventEmitter: EventEmitter2,
  ) {}

  // 阅读会话结束时触发
  async onReadingSessionEnd(session: ReadingSession): Promise<void> {
    await this.eventEmitter.emit('reading.session.end', {
      userId: session.userId,
      duration: session.duration,
      bookId: session.bookId,
      timestamp: new Date(),
    });

    // 检查阅读相关勋章
    await this.medalService.checkAndUnlock(session.userId, 'READING_SESSION_END');
  }

  // 书籍完成时触发
  async onBookCompleted(userId: string, bookId: string): Promise<void> {
    await this.eventEmitter.emit('book.completed', {
      userId,
      bookId,
      timestamp: new Date(),
    });

    await this.medalService.checkAndUnlock(userId, 'BOOK_COMPLETED');
  }

  // 词汇保存时触发
  async onVocabularySaved(userId: string, count: number): Promise<void> {
    await this.eventEmitter.emit('vocabulary.saved', {
      userId,
      count,
      timestamp: new Date(),
    });

    await this.medalService.checkAndUnlock(userId, 'VOCABULARY_SAVED');
  }

  // 连续天数更新时触发
  async onStreakUpdated(userId: string, streakDays: number): Promise<void> {
    await this.eventEmitter.emit('streak.updated', {
      userId,
      streakDays,
      timestamp: new Date(),
    });

    await this.medalService.checkAndUnlock(userId, 'STREAK_UPDATED');
  }
}
```

### 6.2 定时任务检查

```typescript
// MedalCronService.ts

@Injectable()
export class MedalCronService {
  constructor(
    private medalService: MedalUnlockService,
    private prisma: PrismaService,
  ) {}

  // 每天凌晨检查连续阅读勋章
  @Cron('0 0 * * *')
  async checkDailyMedals(): Promise<void> {
    const activeUsers = await this.prisma.account.findMany({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天内活跃
        },
      },
      select: { id: true },
    });

    for (const user of activeUsers) {
      await this.medalService.checkAndUnlock(user.id, 'DAILY_CHECK');
    }
  }

  // 每月1号检查月度勋章
  @Cron('0 0 1 * *')
  async checkMonthlyMedals(): Promise<void> {
    // 检查上个月的时间相关勋章
    const activeUsers = await this.prisma.account.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    for (const user of activeUsers) {
      await this.medalService.checkAndUnlock(user.id, 'MONTHLY_CHECK');
    }
  }
}
```

---

## 7. iOS 客户端实现

### 7.1 数据模型

```swift
// Medal.swift

import Foundation

struct Medal: Identifiable, Codable {
    let id: String
    let code: String
    let nameZh: String
    let nameEn: String
    let descriptionZh: String
    let descriptionEn: String
    let category: MedalCategory
    let rarity: MedalRarity
    let unlockType: UnlockType
    let unlockThreshold: Int
    let iconUrl: String
    let model3dUrl: String?
    let materialPreset: String
    let designStory: String?

    var name: String {
        // 根据当前语言返回
        Locale.current.language.languageCode?.identifier == "zh" ? nameZh : nameEn
    }

    var description: String {
        Locale.current.language.languageCode?.identifier == "zh" ? descriptionZh : descriptionEn
    }
}

struct UserMedal: Identifiable, Codable {
    let id: String
    let medalId: String
    let medal: Medal
    let unlockedAt: Date
    let unlockedValue: Int?
    let isDisplayed: Bool
    let displayOrder: Int?
}

struct MedalProgress: Codable {
    let medalCode: String
    let currentValue: Int
    let targetValue: Int

    var percentage: Double {
        guard targetValue > 0 else { return 0 }
        return min(1.0, Double(currentValue) / Double(targetValue))
    }
}

enum MedalCategory: String, Codable, CaseIterable {
    case readingMilestone = "READING_MILESTONE"
    case readingStreak = "READING_STREAK"
    case vocabularyMaster = "VOCABULARY_MASTER"
    case bookConqueror = "BOOK_CONQUEROR"
    case literaryGenre = "LITERARY_GENRE"
    case timeTraveler = "TIME_TRAVELER"
    case culturalExplorer = "CULTURAL_EXPLORER"
    case limitedEdition = "LIMITED_EDITION"
    case legendary = "LEGENDARY"

    var displayName: String {
        switch self {
        case .readingMilestone: return "阅读里程碑"
        case .readingStreak: return "阅读连续"
        case .vocabularyMaster: return "词汇大师"
        case .bookConqueror: return "书籍征服"
        case .literaryGenre: return "文学流派"
        case .timeTraveler: return "时间旅人"
        case .culturalExplorer: return "文化探索"
        case .limitedEdition: return "限定版"
        case .legendary: return "传奇"
        }
    }

    var icon: String {
        switch self {
        case .readingMilestone: return "flag.fill"
        case .readingStreak: return "flame.fill"
        case .vocabularyMaster: return "text.book.closed.fill"
        case .bookConqueror: return "books.vertical.fill"
        case .literaryGenre: return "theatermasks.fill"
        case .timeTraveler: return "clock.fill"
        case .culturalExplorer: return "globe"
        case .limitedEdition: return "star.fill"
        case .legendary: return "crown.fill"
        }
    }
}

enum MedalRarity: String, Codable, CaseIterable {
    case common = "COMMON"
    case uncommon = "UNCOMMON"
    case rare = "RARE"
    case epic = "EPIC"
    case legendary = "LEGENDARY"

    var displayName: String {
        switch self {
        case .common: return "普通"
        case .uncommon: return "稀有"
        case .rare: return "珍稀"
        case .epic: return "史诗"
        case .legendary: return "传奇"
        }
    }

    var color: Color {
        switch self {
        case .common: return Color(hex: "#B87333")     // 铜色
        case .uncommon: return Color(hex: "#C0C0C0")   // 银色
        case .rare: return Color(hex: "#FFD700")       // 金色
        case .epic: return Color(hex: "#9B5DE5")       // 紫色
        case .legendary: return Color(hex: "#00BBF9")  // 钻石蓝
        }
    }
}
```

### 7.2 勋章管理器

```swift
// MedalManager.swift

import Foundation

@MainActor
class MedalManager: ObservableObject {
    static let shared = MedalManager()

    @Published var allMedals: [Medal] = []
    @Published var unlockedMedals: [UserMedal] = []
    @Published var progress: [String: MedalProgress] = [:]
    @Published var newlyUnlocked: [UserMedal] = []  // 新解锁的勋章（用于展示动画）

    @Published var isLoading = false

    // 统计
    var totalUnlocked: Int { unlockedMedals.count }
    var totalMedals: Int { allMedals.count }

    var unlockedByRarity: [MedalRarity: Int] {
        Dictionary(grouping: unlockedMedals, by: { $0.medal.rarity })
            .mapValues { $0.count }
    }

    var unlockedByCategory: [MedalCategory: Int] {
        Dictionary(grouping: unlockedMedals, by: { $0.medal.category })
            .mapValues { $0.count }
    }

    // MARK: - API

    func loadMedals() async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let medalsResponse: MedalsResponse = APIClient.shared.request(
                endpoint: "/medals"
            )
            async let userMedalsResponse: UserMedalsResponse = APIClient.shared.request(
                endpoint: "/medals/user"
            )

            let (medals, userMedals) = try await (medalsResponse, userMedalsResponse)

            self.allMedals = medals.medals
            self.unlockedMedals = userMedals.unlocked
            self.progress = Dictionary(
                uniqueKeysWithValues: userMedals.progress.map { ($0.medalCode, $0) }
            )
        } catch {
            print("Failed to load medals: \(error)")
        }
    }

    func checkForNewMedals() async {
        do {
            let response: CheckMedalsResponse = try await APIClient.shared.request(
                endpoint: "/medals/check",
                method: .post
            )

            if !response.newlyUnlocked.isEmpty {
                // 更新本地数据
                self.unlockedMedals.append(contentsOf: response.newlyUnlocked)

                // 触发新勋章展示
                self.newlyUnlocked = response.newlyUnlocked

                // 播放解锁动画
                await showUnlockAnimation(for: response.newlyUnlocked)
            }

            // 更新进度
            for progress in response.updatedProgress {
                self.progress[progress.medalCode] = progress
            }
        } catch {
            print("Failed to check medals: \(error)")
        }
    }

    func getMedal(by id: String) -> Medal? {
        allMedals.first { $0.id == id }
    }

    func isUnlocked(_ medalId: String) -> Bool {
        unlockedMedals.contains { $0.medalId == medalId }
    }

    func getProgress(for medalCode: String) -> MedalProgress? {
        progress[medalCode]
    }

    // MARK: - Display Settings

    func setDisplayedMedals(_ medalIds: [String]) async throws {
        let _: EmptyResponse = try await APIClient.shared.request(
            endpoint: "/medals/display",
            method: .put,
            body: ["medalIds": medalIds]
        )

        // 更新本地状态
        for i in unlockedMedals.indices {
            unlockedMedals[i] = UserMedal(
                id: unlockedMedals[i].id,
                medalId: unlockedMedals[i].medalId,
                medal: unlockedMedals[i].medal,
                unlockedAt: unlockedMedals[i].unlockedAt,
                unlockedValue: unlockedMedals[i].unlockedValue,
                isDisplayed: medalIds.contains(unlockedMedals[i].medalId),
                displayOrder: medalIds.firstIndex(of: unlockedMedals[i].medalId)
            )
        }
    }

    // MARK: - Animation

    private func showUnlockAnimation(for medals: [UserMedal]) async {
        for medal in medals {
            // 发送通知给 UI 层展示解锁动画
            NotificationCenter.default.post(
                name: .medalUnlocked,
                object: medal
            )

            // 等待动画完成
            try? await Task.sleep(nanoseconds: 2_000_000_000)
        }

        // 清空新解锁列表
        newlyUnlocked = []
    }
}

extension Notification.Name {
    static let medalUnlocked = Notification.Name("medalUnlocked")
}
```

---

## 8. 社交分享功能

### 8.1 分享图生成

```swift
// MedalShareGenerator.swift

import SwiftUI
import UIKit

class MedalShareGenerator {

    static func generateShareImage(for medal: Medal, userStats: UserStats) async -> UIImage? {
        let view = MedalShareCard(medal: medal, userStats: userStats)

        // 渲染为图片
        let renderer = await ImageRenderer(content: view)
        renderer.scale = 3.0  // 高清输出

        return await renderer.uiImage
    }

    static func generateShareVideo(for medal: Medal) async -> URL? {
        // 生成勋章旋转动画视频
        // 使用 AVFoundation 或 Metal 渲染
        // ...
        return nil
    }
}

struct MedalShareCard: View {
    let medal: Medal
    let userStats: UserStats

    var body: some View {
        VStack(spacing: 24) {
            // 顶部 Readmigo Logo
            HStack {
                Image("readmigo_logo")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 30)
                Spacer()
            }

            // 勋章 3D 展示
            MedalView3D(medal: medal, size: .large)
                .frame(height: 200)

            // 勋章信息
            VStack(spacing: 8) {
                Text(medal.name)
                    .font(.title)
                    .fontWeight(.bold)

                RarityBadge(rarity: medal.rarity)

                Text(medal.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Divider()

            // 用户阅读统计
            HStack(spacing: 20) {
                StatItem(
                    icon: "clock.fill",
                    value: formatDuration(userStats.totalReadingMinutes),
                    label: "阅读时长"
                )

                StatItem(
                    icon: "flame.fill",
                    value: "\(userStats.currentStreak)",
                    label: "连续天数"
                )

                StatItem(
                    icon: "book.fill",
                    value: "\(userStats.completedBooks)",
                    label: "完成书籍"
                )
            }

            // 邀请语
            Text("和我一起在 Readmigo 阅读成长")
                .font(.caption)
                .foregroundColor(.secondary)

            // 二维码
            QRCodeView(url: "https://readmigo.app/download")
                .frame(width: 80, height: 80)
        }
        .padding(32)
        .frame(width: 400)
        .background(
            LinearGradient(
                colors: [Color(hex: "#1a1a2e"), Color(hex: "#16213e")],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .foregroundColor(.white)
    }
}

struct StatItem: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.yellow)

            Text(value)
                .font(.headline)

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}
```

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
