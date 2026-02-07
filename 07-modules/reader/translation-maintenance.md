# 翻译内容维护文档

## 概述

本文档记录了 Readmigo 项目中所有需要翻译的内容类型、支持的语言和翻译覆盖情况。

## 支持的语言

### 源语言（Source Language）
- **英文（English）**: `en`

### 目标语言（Target Languages）
- **简体中文（Simplified Chinese）**: `zh-Hans`
- **繁体中文（Traditional Chinese）**: `zh-Hant`

## 需要翻译的内容类型

### 1. 书籍（Books）

#### 1.1 书籍标题（title）
- **Entity Type**: `book`
- **Field Name**: `title`
- **数据量**: 1,277 本活跃书籍
- **翻译状态**: ✅ 100% 完成（1,423 条翻译，包含历史数据）
- **示例**:
  - EN: "Pride and Prejudice"
  - zh-Hans: "傲慢与偏见"
  - zh-Hant: "傲慢與偏見"

#### 1.2 书籍简介（description）
- **Entity Type**: `book`
- **Field Name**: `description`
- **数据量**: 1,277 本书有简介
- **翻译状态**: 🔄 进行中（56.6% 完成，698 条待翻译）
- **翻译方法**:
  - 先翻译为简体中文（zh-Hans）
  - 使用工具转换为繁体中文（zh-Hant）
- **示例**:
  - EN: "A timeless love story set in 19th century England..."
  - zh-Hans: "一个发生在19世纪英格兰的永恒爱情故事..."
  - zh-Hant: "一個發生在19世紀英格蘭的永恆愛情故事..."

### 2. 作者（Authors）

#### 2.1 作者姓名（name）
- **Entity Type**: `author`
- **Field Name**: `name`
- **数据量**: 578 位作者
- **翻译状态**: ✅ 100% 完成（578 条翻译）
- **示例**:
  - EN: "William Shakespeare"
  - zh-Hans: "威廉·莎士比亚"
  - zh-Hant: "威廉·莎士比亞"

### 3. 体裁/类型（Genres）

#### 3.1 体裁名称（name）
- **Entity Type**: `genre`
- **Field Name**: `name`
- **Entity ID**: 使用体裁名称本身作为 ID（如 "Short Stories"）
- **数据量**: 31 个不同的体裁
- **翻译状态**: ✅ 100% 完成（55 条翻译，包含大小写变体）
- **注意事项**:
  - 体裁名称存储在 `books.genres` 字段（数组类型）
  - 存在大小写变体（如 "Fiction" 和 "fiction"）
- **示例**:
  - EN: "Short Stories"
  - zh-Hans: "短篇小说"
  - zh-Hant: "短篇小說"

  - EN: "Science Fiction"
  - zh-Hans: "科幻"
  - zh-Hant: "科幻"

### 4. 分类（Categories）

#### 4.1 分类名称（name）
- **Entity Type**: `category`
- **Field Name**: `name`
- **数据量**: 10 个分类
- **翻译状态**: ℹ️ 分类名称本身已是中文，无需翻译
- **注意事项**:
  - `category.name` 字段已存储中文名称
  - `category.slug` 字段存储英文 slug
- **数据结构**:
  ```
  { name: "冒险", slug: "adventure" }
  { name: "哲学", slug: "philosophy" }
  { name: "奇幻", slug: "fantasy" }
  { name: "恐怖", slug: "horror" }
  { name: "悬疑", slug: "mystery" }
  { name: "戏剧", slug: "drama" }
  { name: "浪漫", slug: "romance" }
  { name: "诗歌", slug: "poetry" }
  { name: "经典文学", slug: "classics" }
  { name: "小说", slug: "fiction" }
  ```

## 数据库结构

### Translation 表结构

## 翻译工作流程

### 新增内容翻译流程

1. **书籍导入时**
   - 创建英文 `title` 和 `description`
   - 触发翻译脚本生成 zh-Hans 和 zh-Hant 翻译
   - 在 `translations` 表中创建相应记录

2. **作者添加时**
   - 创建英文 `name`
   - 翻译为 zh-Hans 和 zh-Hant
   - 在 `translations` 表中创建记录

3. **体裁添加时**
   - 在 `books.genres` 数组中添加英文体裁名
   - 在 `translations` 表中添加对应翻译
   - entityId 使用体裁名称本身

### 简繁转换规则

- **简体 → 繁体**: 使用字符映射表或 opencc 工具
- **常用字符映射**:
  ```
  为→為, 国→國, 发→發, 会→會, 来→來, 个→個
  们→們, 这→這, 说→說, 对→對, 开→開, 关→關
  时→時, 过→過, 没→沒, 现→現, 应→應, 义→義
  长→長, 经→經, 门→門, 问→問, 当→當, 从→從
  ...
  ```

## 翻译覆盖统计

| 内容类型 | 总数 | zh-Hans | zh-Hant | 覆盖率 | 状态 |
|---------|------|---------|---------|--------|------|
| 书籍标题 | 1,277 | 1,423 | 1,423 | 111.4% | ✅ 完成 |
| 书籍简介 | 1,277 | 723 | 723 | 56.6% | 🔄 进行中 |
| 作者姓名 | 578 | 578 | 578 | 100% | ✅ 完成 |
| 体裁名称 | 31 | 55 | 55 | 100% | ✅ 完成 |
| 分类名称 | 10 | - | - | - | ℹ️ 已是中文 |

## 相关脚本

### 翻译脚本
- `scripts/ensure-translation-coverage.ts` - 确保翻译覆盖（已弃用，使用手动翻译）
- `scripts/temp-get-missing.ts` - 查询缺失翻译（临时脚本）

### 数据库查询

#### 查询缺失翻译的书籍标题

#### 插入翻译

## 注意事项

1. **翻译质量**
   - 书名翻译应使用通用译名
   - 作者名应使用标准译名
   - 体裁翻译应简洁明了

2. **数据一致性**
   - 使用 `upsert` 操作避免重复
   - 确保 entityId 正确对应
   - 保持 source 和 status 字段的准确性

3. **性能考虑**
   - 简介翻译量大，建议分批处理
   - 每批处理 10-15 条记录
   - 简体翻译后批量转换繁体

4. **新增语言支持**
   - 如需添加其他语言，需要：
     - 更新 locale 枚举
     - 创建相应翻译记录
     - 更新前端语言选择器

## 更新记录

- **2026-02-03**:
  - ✅ 完成书籍标题翻译（1,423 条）
  - ✅ 完成作者姓名翻译（578 条）
  - ✅ 完成体裁名称翻译（55 条）
  - 🔄 开始书籍简介翻译（698 条待完成）
  - 📄 创建翻译维护文档
