# EPUB 解析增强方案

## 一、背景

原有 EPUB 解析存在以下问题：
1. 图片未上传到 R2，客户端无法显示
2. 章节按 spine 顺序分割，多章节合并在一个文件时无法正确分割
3. HTML 中图片路径为相对路径，未转换为可访问的 URL
4. 章节内容存储在数据库，影响性能和成本

## 二、解决方案

### 2.1 处理流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  下载 EPUB  │ -> │  提取图片   │ -> │ Hash 去重   │ -> │  上传到 R2  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                v
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  保存数据库 │ <- │ 上传章节 R2 │ <- │ 替换图片路径│ <- │ 按锚点分章  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2.2 修改的文件

| 文件 | 修改内容 |
|-----|---------|
| `book-enrichment.service.ts` | 图片提取上传、Hash 去重、TOC 解析、锚点分章、路径替换、章节上传 R2 |
| `import.controller.ts` | 添加 `force` 查询参数 |
| `dto/index.ts` | 添加 `force` 属性到 DTO |
| `schema.prisma` | Chapter 模型新增 `contentUrl` 字段 |

### 2.3 新增方法

| 方法名 | 功能 |
|-------|------|
| `extractAndUploadImages()` | 提取图片、计算 Hash 去重、上传到 R2 |
| `getImage()` | 从 EPUB 获取图片 Buffer |
| `getChapterRaw()` | 按 href 获取章节原始 HTML |
| `replaceImagePaths()` | 替换 HTML 中图片路径为 R2 URL |
| `parseToc()` | 解析 TOC 结构 |
| `extractChapterContentByAnchor()` | 按锚点提取章节内容 |
| `extractChaptersByFlow()` | 降级方案：按 spine 顺序提取 |

## 三、存储结构

```
books/{bookId}/
├── cover.jpg              # 封面原图
├── cover_thumb.jpg        # 封面缩略图 (300px)
├── images/                # 书籍内嵌图片（规范化命名）
│   ├── img-1.jpg          # 按上传顺序编号
│   ├── img-2.jpg
│   ├── img-3.png
│   └── ...
└── chapters/              # 章节 HTML（新增）
    ├── chapter-1.html     # 图片路径已替换为 R2 URL
    ├── chapter-2.html
    └── ...
```

### 3.1 图片命名规范

| 原始文件名 | 规范化后 |
|-----------|---------|
| `8003346023949050646_cover.jpg` | `img-1.jpg` |
| `8003346023949050646_illus1.jpg` | `img-2.jpg` |
| `dropcap-i.jpg` | `img-3.jpg` |

## 四、图片去重机制

### 4.1 去重流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  读取图片   │ -> │ 计算 MD5    │ -> │ 检查 Hash   │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                         ┌───────────────────┴───────────────────┐
                         v                                       v
                   ┌───────────┐                           ┌───────────┐
                   │ Hash 存在 │                           │ Hash 不存在│
                   │ 复用 URL  │                           │ 上传到 R2  │
                   └───────────┘                           └───────────┘
```

### 4.2 去重效果

| 场景 | 优化前 | 优化后 |
|-----|-------|-------|
| 相同内容不同文件名 | 多次上传 | 只上传一次 |
| HTML 引用 | 不同 URL | 同一 URL |
| 客户端缓存 | 多次下载 | 一次下载 |
| 存储空间 | 有重复 | 无重复 |

## 五、API 变更

### 5.1 单本书丰富化

**Endpoint:** POST /api/v1/admin/import/enrich/:bookId

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| force | boolean | false | 强制重新处理（删除现有章节后重新解析） |

### 5.2 批量丰富化

**Endpoint:** POST /api/v1/admin/import/enrich

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| source | string | STANDARD_EBOOKS | 书籍来源 |
| limit | number | 50 | 最大处理数量 |
| skipEnriched | boolean | true | 跳过已处理的书籍 |
| delayMs | number | 500 | 请求间隔（毫秒） |
| force | boolean | false | 强制重新处理 |

## 六、章节分割策略

### 6.1 基于 TOC 的分割

```
┌────────────────────────────────────────────────────────────┐
│ TOC (epub.toc)                                             │
├────────────────────────────────────────────────────────────┤
│ Chapter I   -> file-0.xhtml#CHAPTER_I                      │
│ Chapter II  -> file-1.xhtml#CHAPTER_II                     │
│ Chapter III -> file-1.xhtml#CHAPTER_III  <- 同一文件多锚点 │
│ Chapter IV  -> file-1.xhtml#CHAPTER_IV                     │
│ Chapter V   -> file-2.xhtml#CHAPTER_V                      │
└────────────────────────────────────────────────────────────┘
```

### 6.2 锚点分割逻辑

1. 解析 href 获取文件名和锚点 ID
2. 缓存文件内容避免重复获取
3. 从锚点元素开始，收集内容直到下一个 TOC 锚点
4. 如果没有锚点，使用整个文件内容

### 6.3 降级策略

当 TOC 为空时，使用 `epub.flow`（spine 顺序）作为降级方案。

## 七、图片路径替换

### 7.1 支持的标签

| 标签 | 属性 | 示例 |
|-----|------|------|
| `<img>` | src | `<img src="illus1.jpg">` |
| `<image>` | xlink:href | `<image xlink:href="cover.jpg">` |
| `<image>` | href | `<image href="cover.jpg">` |

### 7.2 匹配逻辑

1. 优先匹配完整路径
2. 其次匹配文件名（去除目录前缀）

## 八、数据库变更

### 8.1 Chapter 模型新增字段

| 字段 | 类型 | 说明 |
|-----|------|------|
| contentUrl | String? | R2 URL，指向章节 HTML 文件 |

### 8.2 存储策略

| 字段 | 存储位置 | 用途 |
|-----|---------|------|
| htmlContent | 数据库 | 向后兼容、全文搜索 |
| contentUrl | R2 | CDN 加速访问 |

## 九、测试验证

### 9.1 验证步骤

1. 导入书籍元数据
2. 调用丰富化接口处理 EPUB
3. 检查 R2 中图片是否正确上传
4. 检查数据库中章节数量是否与 TOC 一致
5. 在 iOS 客户端验证图片显示

### 9.2 验证要点

| 检查项 | 预期结果 |
|-------|---------|
| 图片数量 | 与 EPUB manifest 中唯一图片数量一致 |
| 图片去重 | 日志显示 "X duplicates skipped" |
| 章节数量 | 与 TOC 条目数量一致 |
| 图片路径 | htmlContent 中为 R2 URL |
| contentUrl | 指向 R2 章节文件 |
| 客户端显示 | 封面和内嵌图片正常显示 |

### 9.3 测试案例：The Young Pilgrim

| 项目 | 结果 |
|-----|------|
| 书籍 ID | 24cf5cbf-9e54-4284-bd2d-d700f70c429c |
| 来源 | Project Gutenberg (#61280) |
| 唯一图片 | 38 张（1 封面 + 27 插图 + 10 首字母装饰） |
| 去重结果 | 0 duplicates skipped |
| 章节数量 | 30 章 |

## 十、相关提交

| 日期 | Commit | 描述 |
|-----|--------|------|
| 2026-01-10 | `5a1b59a` | feat(backend): enhance EPUB parsing with image upload and TOC-based chapters |
| 2026-01-10 | `d7c362a` | feat(backend): add content hash deduplication for EPUB images |
