# 本地文件导入功能技术方案

## 一、行业调研与竞品分析

### 1.1 主流阅读App本地导入功能对比

| 功能维度 | 微信读书 | 掌阅 iReader | 多看阅读 | Kindle App |
|---------|---------|-------------|---------|-----------|
| **支持格式** | TXT, EPUB, PDF, DOC/DOCX, MOBI, AZW3 | TXT, EPUB, PDF, MOBI | TXT, EPUB, PDF | MOBI, AZW3, PDF |
| **导入方式** | 网页上传、微信传书、本地文件 | WiFi传书、微信传书、网盘导入 | 本地文件、WiFi传书 | Send to Kindle、USB |
| **目录识别** | 部分支持 | 自动断章、目录识别 | 支持 | 支持 |
| **PDF处理** | 基础阅读 | 裁边、重排、去水印、智能分页 | 一般 | 基础阅读 |
| **TXT处理** | 基础 | 自动断章、自动排版、目录生成 | 一般 | 不支持 |
| **付费策略** | 会员可用TTS朗读导入书籍 | 免费功能 | 免费功能 | 免费功能 |
| **云同步** | 支持（私密） | 支持 | 支持 | Amazon云同步 |

### 1.2 行业最佳实践总结

**格式支持优先级**（根据用户需求排序）:
1. **EPUB** - 最流行的电子书格式，开放标准，结构化最好
2. **TXT** - 最简单，用户自制书籍常用
3. **PDF** - 扫描版和学术文献常用
4. **MOBI/AZW3** - Kindle 格式，存量用户需求
5. **DOC/DOCX** - Office 文档转换需求

**核心功能要求**:
- 多种导入方式（本地选择、WiFi传书、云盘导入）
- 自动元数据提取（书名、作者、封面）
- 目录/章节智能识别
- 阅读进度同步
- 书籍管理（删除、移动、分类）

### 1.3 商业模式分析

常见付费策略:
1. **会员订阅制** - 本地导入作为会员专属功能
2. **功能增值** - 导入免费，高级功能（AI解读、TTS）付费
3. **容量限制** - 免费用户限制导入数量或总容量
4. **格式限制** - 基础格式免费，复杂格式（PDF重排）付费

**推荐策略**: 本地导入作为 **PRO/PREMIUM 会员专属功能**，与现有订阅体系对齐。

---

## 二、现有系统架构分析

### 2.1 技术栈

```
Backend:  NestJS 10 + Prisma + PostgreSQL 15 + Redis 7
Storage:  Cloudflare R2 (S3 兼容)
iOS:      SwiftUI + iOS 17+
解析库:   AdmZip + JSDOM + xml2js (Node.js)
```

### 2.2 现有相关能力

| 能力 | 位置 | 状态 |
|-----|------|------|
| EPUB 解析 | `scripts/book-ingestion/processors/epub-parser.ts` | 完整 |
| 文件存储 | `src/common/storage/storage.service.ts` | 完整 |
| 预签名URL上传 | `StorageService.getSignedUploadUrl()` | 已实现 |
| 书籍数据模型 | `Book`, `Chapter`, `UserBook` | 完整 |
| 订阅验证 | `SubscriptionsService` | 完整 |
| 用户书籍关联 | `UserBook` 模型 | 完整 |

### 2.3 数据模型扩展需求

现有 `Book` 模型已有 `source` 字段支持 `USER_UPLOAD`，但需要扩展:
- 添加用户上传书籍的所有者关系
- 支持私有书籍（仅上传者可见）
- 导入状态跟踪

---

## 三、功能需求规格

### 3.1 MVP 功能范围

**Phase 1 - 核心功能**:
- [x] EPUB 文件导入
- [x] 自动提取元数据（书名、作者、封面）
- [x] 自动解析章节目录
- [x] 与现有阅读器无缝集成
- [x] 付费权限校验（PRO/PREMIUM）
- [x] 导入进度展示
- [x] 错误处理和反馈

**Phase 2 - 增强功能**:
- [ ] TXT 文件导入（自动断章）
- [ ] PDF 文件导入（基础支持）
- [ ] WiFi 传书功能
- [ ] 云盘导入（iCloud）
- [ ] 批量导入

**Phase 3 - 高级功能**:
- [ ] PDF 重排和优化
- [x] MOBI/AZW3 格式支持（已实现 `scripts/book-ingestion/processors/mobi-parser.ts`）
- [ ] 书籍格式转换
- [ ] 书籍去重检测

### 3.2 权限要求

| 用户类型 | 导入权限 | 容量限制 | 功能限制 |
|---------|---------|---------|---------|
| FREE | 不可用 | - | 引导升级 |
| PRO | 可用 | 50本 / 500MB | 基础AI功能 |
| PREMIUM | 可用 | 200本 / 2GB | 全部AI功能 |

### 3.3 用户旅程

```
1. 用户点击「导入」按钮
   ↓
2. 权限检查
   ├─ FREE用户 → 显示升级弹窗
   └─ PRO/PREMIUM → 继续
   ↓
3. 选择导入方式
   ├─ 从文件选择
   ├─ 从iCloud导入
   └─ WiFi传书
   ↓
4. 文件上传（显示进度）
   ↓
5. 后端处理（显示解析中）
   ├─ 格式验证
   ├─ 元数据提取
   ├─ 章节解析
   └─ 封面提取
   ↓
6. 处理完成
   ├─ 成功 → 进入书籍详情页
   └─ 失败 → 显示错误信息
```

---

## 四、技术架构设计

### 4.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         iOS Client                               │
├─────────────────────────────────────────────────────────────────┤
│  ImportView     │  FilePickerView  │  ImportProgressView        │
│      ↓                  ↓                    ↓                  │
│  ImportManager (handles file selection, upload, status)         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
├─────────────────────────────────────────────────────────────────┤
│  POST /user-books/import/initiate  →  获取预签名URL             │
│  POST /user-books/import/complete  →  确认上传完成，触发处理    │
│  GET  /user-books/import/:id/status → 查询处理状态              │
│  GET  /user-books                   →  获取用户导入的书籍列表    │
│  DELETE /user-books/:id             →  删除用户导入的书籍        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │ Cloudflare│    │ PostgreSQL│   │ Redis Queue  │
    │    R2     │    │  Database │   │  (BullMQ)    │
    └──────────┘    └──────────┘    └──────────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │  Book Processing   │
                 │      Worker        │
                 ├────────────────────┤
                 │ • EPUB Parser      │
                 │ • TXT Parser       │
                 │ • PDF Parser       │
                 │ • Cover Extractor  │
                 │ • Chapter Splitter │
                 │ • Difficulty Calc  │
                 └────────────────────┘
```

### 4.2 上传流程（Presigned URL 模式）

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  iOS App  │     │  Backend  │     │    R2     │     │  Worker   │
└─────┬─────┘     └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
      │                 │                 │                 │
      │ 1. Initiate     │                 │                 │
      │────────────────>│                 │                 │
      │                 │                 │                 │
      │ 2. Presigned URL│                 │                 │
      │<────────────────│                 │                 │
      │                 │                 │                 │
      │ 3. Direct Upload│                 │                 │
      │─────────────────────────────────>│                 │
      │                 │                 │                 │
      │ 4. Upload Done  │                 │                 │
      │<─────────────────────────────────│                 │
      │                 │                 │                 │
      │ 5. Complete     │                 │                 │
      │────────────────>│                 │                 │
      │                 │ 6. Queue Job    │                 │
      │                 │────────────────────────────────>│
      │ 7. Job ID       │                 │                 │
      │<────────────────│                 │                 │
      │                 │                 │                 │
      │ 8. Poll Status  │                 │                 │
      │────────────────>│                 │                 │
      │                 │                 │ 9. Process      │
      │                 │                 │<────────────────│
      │                 │                 │                 │
      │ 10. Status Done │                 │                 │
      │<────────────────│                 │                 │
```

### 4.3 安全考虑

1. **Presigned URL 安全**
   - URL 有效期: 10分钟
   - 强制 Content-Type 匹配
   - 文件大小限制通过前端和后端双重校验
   - MD5 校验确保完整性

2. **文件安全**
   - 文件类型白名单验证
   - Magic bytes 校验（防止伪造扩展名）
   - 上传隔离目录 `user-uploads/{userId}/{uploadId}/`
   - 处理后迁移到正式目录 `books/{bookId}/`

3. **权限控制**
   - 用户只能访问自己导入的书籍
   - 订阅状态实时校验
   - 导入配额检查

---

## 五、数据库设计

### 5.1 新增表: UserImportedBook

### 5.2 新增表: ImportJob

### 5.3 现有表扩展

### 5.4 用户配额表

---

## 六、API 设计

### 6.1 导入相关 API

#### 6.1.1 发起导入

```http
POST /api/user-books/import/initiate

Request:
{
  "filename": "my-book.epub",
  "fileSize": 2048576,  // bytes
  "contentType": "application/epub+zip",
  "md5": "abc123..."   // optional, for integrity check
}

Response:
{
  "jobId": "uuid",
  "uploadUrl": "https://r2.../presigned-url",
  "uploadKey": "user-uploads/{userId}/{jobId}/my-book.epub",
  "expiresIn": 600  // seconds
}

Errors:
- 403: 无订阅权限
- 400: 文件格式不支持
- 400: 超出容量限制
```

#### 6.1.2 确认上传完成

```http
POST /api/user-books/import/complete

Request:
{
  "jobId": "uuid"
}

Response:
{
  "jobId": "uuid",
  "status": "PROCESSING"
}
```

#### 6.1.3 查询处理状态

```http
GET /api/user-books/import/{jobId}/status

Response:
{
  "jobId": "uuid",
  "status": "PROCESSING",
  "progress": 45,
  "book": null  // 处理完成后包含书籍信息
}

// 处理完成时:
{
  "jobId": "uuid",
  "status": "COMPLETED",
  "progress": 100,
  "book": {
    "id": "uuid",
    "title": "解析出的书名",
    "author": "作者",
    "coverUrl": "...",
    "chapterCount": 12,
    "wordCount": 45000
  }
}

// 处理失败时:
{
  "jobId": "uuid",
  "status": "FAILED",
  "progress": 0,
  "errorMessage": "无法解析EPUB文件：文件格式损坏"
}
```

#### 6.1.4 获取用户导入的书籍

```http
GET /api/user-books?source=imported&page=1&limit=20

Response:
{
  "items": [
    {
      "id": "uuid",
      "book": {
        "id": "uuid",
        "title": "书名",
        "author": "作者",
        "coverUrl": "...",
        "wordCount": 45000,
        "chapterCount": 12
      },
      "importedAt": "2024-01-15T10:30:00Z",
      "originalFilename": "my-book.epub",
      "fileSize": 2048576
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

#### 6.1.5 删除导入的书籍

```http
DELETE /api/user-books/imported/{bookId}

Response:
{
  "success": true
}

// 会同时删除:
// - Book 记录
// - Chapter 记录
// - R2 存储的文件
// - UserImportedBook 记录
// - 更新用户存储配额
```

### 6.2 配额查询 API

```http
GET /api/user-books/quota

Response:
{
  "used": {
    "bookCount": 12,
    "totalSizeBytes": 52428800
  },
  "limit": {
    "bookCount": 50,
    "totalSizeBytes": 524288000
  },
  "available": {
    "bookCount": 38,
    "totalSizeBytes": 471859200
  }
}
```

---

## 七、iOS 客户端设计

### 7.1 模块结构

```
Features/Import/
├── Views/
│   ├── ImportEntryView.swift       # 导入入口（书架页面的+按钮）
│   ├── ImportMethodSheet.swift     # 导入方式选择
│   ├── FilePickerView.swift        # 文件选择器
│   ├── ImportProgressView.swift    # 导入进度展示
│   ├── ImportResultView.swift      # 导入结果
│   └── ImportQuotaView.swift       # 配额展示
├── ViewModels/
│   └── ImportViewModel.swift       # 导入逻辑
├── Services/
│   ├── ImportService.swift         # API 调用
│   └── FileUploadService.swift     # 文件上传（presigned URL）
└── Models/
    ├── ImportJob.swift             # 导入任务模型
    └── ImportQuota.swift           # 配额模型
```

### 7.2 核心代码示例

#### ImportViewModel.swift

#### FileUploadService.swift

### 7.3 UI 设计规范

#### 导入入口
- 书架页面右上角「+」按钮
- 点击显示底部弹窗选择导入方式

#### 导入进度
- 全屏 overlay 显示
- 环形进度条 + 百分比
- 阶段文案：「正在上传...」→「正在解析...」→「正在处理章节...」
- 支持取消

#### 错误处理
- 友好的错误提示
- 常见错误的解决建议
- 支持重试

---

## 八、后端实现设计

### 8.1 模块结构

```
src/modules/user-books/
├── user-books.module.ts
├── user-books.controller.ts
├── user-books.service.ts
├── dto/
│   ├── initiate-import.dto.ts
│   ├── complete-import.dto.ts
│   └── import-status.dto.ts
├── guards/
│   └── import-permission.guard.ts
└── processors/
    ├── epub-processor.ts
    ├── txt-processor.ts
    └── pdf-processor.ts (Phase 2)
```

### 8.2 核心服务实现

#### user-books.service.ts

### 8.3 处理队列 Worker

---

## 九、iOS EPUB 解析方案

### 9.1 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|-----|------|------|-------|
| **服务端解析** | 统一处理、资源复用、易维护 | 需要网络、上传等待 | ★★★★★ |
| **客户端预解析** | 快速预览、减少上传 | 双端维护、处理能力弱 | ★★★☆☆ |
| **纯客户端** | 离线可用 | 无法与平台书籍统一 | ★★☆☆☆ |

**推荐方案**: 服务端解析为主，客户端仅做格式校验和预览。

### 9.2 客户端预处理（可选）

使用 [EPUBKit](https://github.com/witekbobrowski/EPUBKit) 做基础元数据提取:

---

## 十、文件格式处理规范

### 10.1 EPUB 处理

**现有能力**: 完整的 EPUB 2/3 解析支持（复用 `scripts/book-ingestion/processors/epub-parser.ts`）

**处理流程**:
1. 解压 ZIP 获取 container.xml
2. 解析 content.opf 获取元数据
3. 按 spine 顺序解析章节
4. 提取封面图片
5. 计算难度评分（Flesch/CEFR）
6. 上传到 R2 存储

### 10.2 TXT 处理（Phase 2）

**智能断章策略**:

### 10.3 PDF 处理（Phase 3）

**基础方案**: 使用 pdf.js 或 pdf-parse 提取文本

**增强方案**:
- 扫描版 PDF: OCR 处理（需要额外服务）
- 复杂排版: PDF.js 渲染预览

---

## 十一、测试策略

### 11.1 单元测试

### 11.2 集成测试

- 完整导入流程测试（上传 → 处理 → 阅读）
- 各格式文件的兼容性测试
- 权限和配额边界测试
- 并发导入测试

### 11.3 测试文件库

准备覆盖各种场景的测试文件:
- 标准 EPUB 2 文件
- 标准 EPUB 3 文件
- 无封面 EPUB
- 中文 EPUB
- 大文件 EPUB (>10MB)
- 损坏的 EPUB
- 各种编码的 TXT 文件

---

## 十二、监控与运维

### 12.1 关键指标

### 12.2 告警规则

- 导入成功率 < 95%
- 处理队列积压 > 100
- 单任务处理时间 > 5分钟
- 存储使用率 > 80%

### 12.3 日志记录

---

## 十三、实施计划

### Phase 1: MVP（EPUB 导入）

**工作项**:
1. 数据库迁移（新增表、扩展字段）
2. 后端 API 开发
3. 处理队列实现
4. iOS 导入模块开发
5. 权限和配额系统
6. 基础测试和上线

### Phase 2: TXT 支持 + 增强

**工作项**:
1. TXT 解析器开发
2. 智能断章优化
3. WiFi 传书功能
4. iCloud 导入支持

### Phase 3: PDF + 高级功能

**工作项**:
1. PDF 基础支持
2. PDF 重排功能
3. MOBI 格式支持
4. 书籍去重检测

---

## 十四、风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| EPUB 格式兼容性问题 | 部分书籍无法导入 | 完善错误处理，提供手动编辑入口 |
| 大文件处理超时 | 用户体验差 | 分片处理，进度反馈 |
| 存储成本增加 | 运营成本 | 设置合理配额，压缩存储 |
| 盗版内容 | 法律风险 | 明确用户协议，私有可见性 |
| 并发处理瓶颈 | 队列积压 | 水平扩展 Worker，优化处理逻辑 |

---

## 十五、参考资料

### 行业调研
- [阅读APP竞品分析：掌阅 VS 微信读书](https://www.woshipm.com/evaluating/3195063.html)
- [从出版书籍到网络文学，全方位多角度比较 11 款阅读应用](https://sspai.com/prime/story/zh-reading-apps-compared)
- [微信读书支持哪些格式](https://product.pconline.com.cn/itbk/sjtx/sjrj/1629/16291722.html)

### 技术参考
- [EPUBKit - Swift EPUB Parser](https://github.com/witekbobrowski/EPUBKit)
- [FolioReaderKit - Swift ePub Reader](https://github.com/FolioReader/FolioReaderKit)
- [EPUB 格式解析设计 - 七猫技术博客](https://tech.qimao.com/qian-xi-epub-ge-shi-ji-jie-xi-she-ji/)
- [使用预签名URL上传对象 - AWS文档](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Securing S3 Presigned URLs](https://www.amazonaws.cn/en/blog-selection/securing-amazon-s3-presigned-urls-for-serverless-applications/)

### 相关文档
- [epub-format-support.md](./epub-format-support.md) - EPUB2/EPUB3 格式支持详细设计
- [mobi-support-design.md](./mobi-support-design.md) - MOBI/AZW3 格式支持详细设计
- [book-formats-analysis.md](./book-formats-analysis.md) - 格式支持分析
- [epub-architecture.md](./epub-architecture.md) - EPUB 书籍架构
- [user-book-import-status.md](../ios/user-book-import-status.md) - iOS 客户端实现状态
