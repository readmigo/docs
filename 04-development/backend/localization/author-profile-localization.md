# 作者详情页本地化审计

## 数据统计

| 类别 | 总数 | 已本地化 | 未本地化 |
|------|------|----------|----------|
| UI 文本 | 38 | 38 | 0 |
| 动态数据 | 12 | 12 | 0 |

---

## 已本地化的 UI 文本

### 导航和标题
| Key | 用途 |
|-----|------|
| `author.title` | 导航栏标题 |
| `author.notFound` | 作者未找到提示 |
| `common.loading` | 加载中提示 |

### 头部区域
| Key | 用途 |
|-----|------|
| `author.followersCount` | 粉丝数量（格式化） |
| `author.like` | 关注按钮（未关注状态） |
| `author.liked` | 关注按钮（已关注状态） |

### 文学档案 Section
| Key | 用途 |
|-----|------|
| `author.literaryProfile` | Section 标题 |
| `author.era` | 时代标签 |
| `author.nationality` | 国籍标签 |
| `author.birthPlace` | 出生地标签 |
| `author.works` | 作品数量标签 |
| `civilizationMap.literaryPosition` | 文学地位小标题 |
| `civilizationMap.literaryMovement` | 文学运动标签 |
| `author.literaryPeriod` | 文学时期标签 |
| `civilizationMap.primaryGenres` | 主要体裁小标题 |
| `civilizationMap.themes` | 主题小标题 |
| `civilizationMap.crossDomain` | 跨领域贡献小标题 |
| `civilizationMap.historicalContext` | 历史背景小标题 |

### 名言 Section
| Key | 用途 |
|-----|------|
| `author.famousQuotes` | Section 标题 |
| `author.quotesCount` | 名言数量（格式化） |

### 简介 Section
| Key | 用途 |
|-----|------|
| `author.aboutTitle` | Section 标题 |
| `button.readMore` | 展开按钮 |
| `button.readLess` | 收起按钮 |

### 代表作 Section
| Key | 用途 |
|-----|------|
| `author.majorWorks` | Section 标题 |

### 时间线 Section
| Key | 用途 |
|-----|------|
| `author.lifeAndWorks` | Section 标题 |

### 阅读挑战 Section
| Key | 用途 |
|-----|------|
| `author.readingChallenge` | Section 标题 |
| `author.challengeComplete` | 完成徽章 |
| `author.readAllBooks` | 阅读所有书籍提示（格式化） |
| `author.unlockBadgeHint` | 解锁徽章提示 |
| `author.allBooksRead` | 已读完所有书籍提示 |

### 作品列表 Section
| Key | 用途 |
|-----|------|
| `author.worksBy` | Section 标题（格式化） |
| `button.viewAll` | 查看全部按钮 |
| `author.booksBy` | 全部作品页标题（格式化） |

### 相关作者 Section
| Key | 用途 |
|-----|------|
| `author.relatedAuthors` | Section 标题 |
| `author.similarEraStyle` | 副标题 |
| `author.booksCountSmall` | 书籍数量（格式化） |

### 时代名称
| Key | 用途 |
|-----|------|
| `authorEra.classical` | 古典时期 |
| `authorEra.romanticism` | 浪漫主义时期 |
| `authorEra.victorian` | 维多利亚时期 |
| `authorEra.modern` | 现代时期 |
| `authorEra.contemporary` | 当代 |

---

## 动态数据（来自 API）

这些数据由服务端返回，已支持多语言：

| 数据 | Model 属性 | 本地化方式 |
|------|------------|------------|
| 作者名 | `author.localizedName` | API 返回 name/nameZh |
| 简介 | `author.bio` | API 返回 bio/bioZh |
| 时代 | `author.era` | 直接显示（如 "1775-1817"） |
| 国籍 | `author.nationality` | API 返回本地化值 |
| 出生地 | `author.birthPlace` | API 返回本地化值 |
| 文学时期 | `author.literaryPeriod` | API 返回本地化值 |
| 名言文本 | `quote.text` | API 返回本地化值 |
| 名言来源 | `quote.source` | API 返回本地化值 |
| 代表作 | `author.famousWorks` | API 返回本地化值 |
| 时间线标题 | `event.localizedTitle` | API 返回 title/titleZh |
| 时间线描述 | `event.localizedDescription` | API 返回 description/descriptionZh |
| 书籍标题 | `book.localizedTitle` | API 返回 title/titleZh |

---

## 枚举值本地化

### DomainSignificance（领域重要性）
| 值 | 已本地化 |
|----|----------|
| `major` | ✅ `civilizationMap.significance.major` |
| `moderate` | ✅ `civilizationMap.significance.moderate` |
| `minor` | ✅ `civilizationMap.significance.minor` |

### HistoricalEventCategory（历史事件类别）
| 值 | 已本地化 |
|----|----------|
| `war` | ✅ `civilizationMap.eventCategory.war` |
| `revolution` | ✅ `civilizationMap.eventCategory.revolution` |
| `cultural` | ✅ `civilizationMap.eventCategory.cultural` |
| `political` | ✅ `civilizationMap.eventCategory.political` |
| `scientific` | ✅ `civilizationMap.eventCategory.scientific` |

### TimelineCategory（时间线类别）
| 值 | Model 中处理 |
|----|--------------|
| `birth` | 使用图标，无文本 |
| `education` | 使用图标，无文本 |
| `work` | 使用图标，无文本 |
| `majorEvent` | 使用图标，无文本 |
| `award` | 使用图标，无文本 |
| `death` | 使用图标，无文本 |

---

## 硬编码文本

以下文本在代码中硬编码，但不需要本地化：

| 文本 | 位置 | 原因 |
|------|------|------|
| `"Wikipedia"` | bioSection | 品牌名，全球通用 |
| `"❝"` | quoteItemView | Unicode 符号 |
| `"—"` | relatedAuthorCard | 占位符，不是文字 |

---

## 结论

**作者详情页本地化状态：100% 完成**

所有需要本地化的 UI 文本都已经添加了对应的本地化 Key，动态数据通过 API 返回本地化内容。

---

## 本地化文件位置

```
ios/Readmigo/Localizable.xcstrings
```

支持语言：
- English (en)
- 简体中文 (zh-Hans)
- 繁體中文 (zh-Hant)
