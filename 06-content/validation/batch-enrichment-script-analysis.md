# batch-enrichment-standalone.ts 脚本分析报告

**分析时间**: 2026-01-11
**更新时间**: 2026-01-11（架构优化：客户端直接从 R2 获取内容）
**脚本路径**: `packages/database/scripts/batch-enrichment-standalone.ts`

---

### 架构变更

| 对比项 | 旧架构 | 新架构 |
|--------|--------|--------|
| 章节内容存储 | 数据库 htmlContent | R2 |
| API 返回 | htmlContent 全文 | contentUrl (R2 URL) |
| 客户端获取 | 从 API 响应 | 从 R2 CDN 直接获取 |
| 数据库存储 | ~384 MB | ~0.1 MB (仅 URL) |

### 存储优化效果

| 存储位置 | 旧架构 | 新架构 | 节省 |
|----------|--------|--------|------|
| 数据库 content | ~183 MB | 0 | ~183 MB |
| 数据库 htmlContent | ~201 MB | 0 | ~201 MB |
| 数据库 contentUrl | ~0.1 MB | ~0.1 MB | 0 |
| R2 chapters | ~163 MB | ~163 MB | 0 |
| **总计** | ~547 MB | ~163 MB | **~384 MB (70%)** |

---

### 2.1 batch-enrichment-standalone.ts

**位置**: line 1011-1022

**修改前:**

**修改后:**

### 2.2 books.service.ts

**位置**: line 357-415

**修改前:**

**修改后:**

### 2.3 iOS 客户端

**文件**: `ios/Readmigo/Core/Models/Book.swift`

**文件**: `ios/Readmigo/Features/Reader/ReaderViewModel.swift`

### 2.4 Android 客户端

**文件**: `android/.../dto/ReaderDto.kt`

**文件**: `android/.../data/ReaderRepository.kt`

---

## 4. 新架构优势

| 优势 | 说明 |
|------|------|
| **数据库减负** | 节省 ~384 MB 存储空间 (70%) |
| **CDN 加速** | Cloudflare R2 全球边缘节点缓存 |
| **API 减负** | API 只返回元数据，不传输大文件 |
| **免费带宽** | R2 免费出站流量 |
| **并行获取** | 客户端可同时预加载多个章节 |

---

## 5. 相关文件

| 文件 | 说明 |
|------|------|
| `packages/database/scripts/batch-enrichment-standalone.ts` | 批处理脚本 |
| `apps/backend/src/modules/books/books.service.ts` | 后端 API |
| `ios/Readmigo/Core/Models/Book.swift` | iOS 数据模型 |
| `ios/Readmigo/Features/Reader/ReaderViewModel.swift` | iOS 阅读器 ViewModel |
| `android/.../dto/ReaderDto.kt` | Android DTO |
| `android/.../data/ReaderRepository.kt` | Android Repository |
