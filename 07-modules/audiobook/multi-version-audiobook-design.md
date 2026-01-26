# 多版本有声书技术方案

## Executive Summary

本文档定义了 Readmigo 支持同一本书多个有声书版本的完整技术方案，允许用户选择自己喜欢的朗读版本。

**背景**: LibriVox 热门作品通常有多个朗读版本（如《傲慢与偏见》有6个版本），不同版本在朗读者、时长、风格上各有特色。

**目标**: 让用户能够浏览、比较、选择和切换同一本书的不同有声书版本。

---

## 1. 需求分析

### 1.1 多版本作品示例

| 书名 | 版本数 | 版本差异 |
|------|--------|----------|
| Pride and Prejudice | 6+ | 独唱版/多人戏剧版/不同朗读者 |
| A Christmas Carol | 5+ | 不同时长/朗读风格 |
| Alice in Wonderland | 4+ | 儿童版/成人版 |
| Frankenstein | 4+ | 不同朗读者/音质 |
| Sherlock Holmes | 10+ | 各故事独立录制 |

### 1.2 用户场景

```
场景一: 版本发现
────────────────────────────────────────────────────────────
用户正在浏览《傲慢与偏见》，发现有多个有声书版本可选
→ 需要: 版本列表展示、版本对比信息

场景二: 版本选择
────────────────────────────────────────────────────────────
用户想选择女声独唱版本，而非多人戏剧版
→ 需要: 朗读者信息、版本类型标签、试听功能

场景三: 版本切换
────────────────────────────────────────────────────────────
用户听了一半发现不喜欢当前版本，想换一个
→ 需要: 版本切换、进度独立保存

场景四: 版本偏好
────────────────────────────────────────────────────────────
用户偏好某个朗读者，希望优先显示该朗读者的版本
→ 需要: 用户偏好设置、智能推荐
```

### 1.3 功能需求

| 优先级 | 功能 | 说明 |
|--------|------|------|
| **P0** | 版本列表展示 | 显示同一本书的所有有声书版本 |
| **P0** | 版本详情对比 | 时长、朗读者、评分等信息 |
| **P0** | 版本选择切换 | 用户选择并切换版本 |
| **P1** | 版本试听 | 每个版本30秒试听 |
| **P1** | 独立进度追踪 | 每个版本独立保存播放进度 |
| **P2** | 用户偏好 | 记住用户偏好的朗读者/版本类型 |
| **P2** | 智能推荐 | 根据偏好推荐默认版本 |

---

## 2. 数据模型设计

### 2.1 当前模型分析

```
当前关系 (1:1)
────────────────────────────────────────────────────────────

Book ──────────────── Audiobook
  │                      │
  │ bookId (optional)    │
  └──────────────────────┘

问题:
• 一本书只能关联一个有声书
• 无法存储同一本书的多个版本
• 用户无法选择不同版本
```

### 2.2 新模型设计

```
新关系 (1:N)
────────────────────────────────────────────────────────────

Book ──────────┬───── Audiobook (Version 1)
               │         │
               │         ├── versionLabel: "Karen Savage版"
               │         ├── versionType: SOLO
               │         └── isDefault: true
               │
               ├───── Audiobook (Version 2)
               │         │
               │         ├── versionLabel: "戏剧版"
               │         ├── versionType: DRAMATIC
               │         └── isDefault: false
               │
               └───── Audiobook (Version 3)
                         │
                         ├── versionLabel: "Elizabeth Klett版"
                         ├── versionType: SOLO
                         └── isDefault: false
```

### 2.3 Schema 变更

```prisma
// packages/database/prisma/schema.prisma

// 新增: 有声书版本类型枚举
enum AudiobookVersionType {
  SOLO          // 独唱版 - 单人朗读全书
  DRAMATIC      // 戏剧版 - 多人分角色朗读
  ABRIDGED      // 删节版 - 精简版本
  UNABRIDGED    // 完整版 - 未删节
  CHILDRENS     // 儿童版 - 适合儿童的朗读风格
}

model Audiobook {
  // ... 现有字段保持不变 ...

  // 新增: 版本相关字段
  versionLabel     String?               // 版本标签，如 "Karen Savage版"
  versionType      AudiobookVersionType  @default(SOLO)
  versionNumber    Int                   @default(1)  // 版本序号
  isDefault        Boolean               @default(false) // 是否为默认版本

  // 新增: 朗读者详情 (多人朗读时)
  readers          Json?                 // [{ name, role, chapters }]

  // 新增: 版本特色标签
  features         String[]              // ["女声", "英式口音", "高音质"]

  // 现有索引更新
  @@unique([source, sourceId])
  @@index([bookId])

  // 新增: 版本排序索引
  @@index([bookId, isDefault])
  @@index([bookId, versionNumber])
}

// 更新: 用户有声书进度 (已支持多版本)
model UserAudiobookProgress {
  // 现有结构已支持 (userId, audiobookId) 复合唯一
  // 不同版本的进度天然独立
}

// 新增: 用户版本偏好
model UserAudiobookPreference {
  id                String   @id @default(uuid())
  userId            String

  // 偏好设置
  preferredReaders  String[] // 偏好的朗读者名单
  preferredType     AudiobookVersionType? // 偏好的版本类型
  preferSolo        Boolean  @default(true) // 偏好独唱版
  preferFemale      Boolean? // 偏好女声 (null=无偏好)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])

  @@unique([userId])
}
```

### 2.4 数据迁移策略

```
迁移步骤
────────────────────────────────────────────────────────────

Step 1: 添加新字段 (向后兼容)
├── 添加 versionLabel, versionType, versionNumber, isDefault
├── 设置默认值确保现有数据有效
└── 现有有声书自动标记为 isDefault: true

Step 2: 数据补充
├── 识别同一 bookId 的多个有声书
├── 根据 narrator 字段生成 versionLabel
├── 根据 totalDuration 推断版本类型
└── 设置 versionNumber 排序

Step 3: 导入新版本
├── 从 LibriVox 获取同一 Gutenberg ID 的所有录音
├── 按匹配规则关联到同一 Book
└── 自动设置版本信息
```

---

## 3. API 设计

### 3.1 端点变更

| 端点 | 变更 | 说明 |
|------|------|------|
| `GET /audiobooks/book/:bookId` | 修改返回类型 | 返回版本列表而非单个 |
| `GET /audiobooks/:id/versions` | 新增 | 获取同一书籍的所有版本 |
| `POST /audiobooks/:id/set-default` | 新增 | 用户设置默认版本 |
| `GET /users/me/audiobook-preferences` | 新增 | 获取用户偏好 |
| `PUT /users/me/audiobook-preferences` | 新增 | 更新用户偏好 |

### 3.2 接口详细设计

#### 获取书籍的有声书版本列表

```
GET /audiobooks/book/:bookId/versions

Response:
{
  "bookId": "uuid",
  "bookTitle": "Pride and Prejudice",
  "totalVersions": 6,
  "defaultVersionId": "uuid",
  "versions": [
    {
      "id": "uuid",
      "versionLabel": "Karen Savage版",
      "versionType": "SOLO",
      "versionNumber": 1,
      "isDefault": true,
      "narrator": "Karen Savage",
      "totalDuration": 43200,  // 12小时
      "formattedDuration": "12小时",
      "features": ["女声", "美式口音", "高音质"],
      "avgRating": 4.8,
      "numReviews": 1234,
      "archiveDownloads": 2500000,
      "coverUrl": "...",
      "previewUrl": "..."  // 30秒试听URL
    },
    {
      "id": "uuid",
      "versionLabel": "戏剧版",
      "versionType": "DRAMATIC",
      "versionNumber": 2,
      "isDefault": false,
      "narrator": "多人朗读",
      "readers": [
        { "name": "Actor A", "role": "Elizabeth" },
        { "name": "Actor B", "role": "Darcy" }
      ],
      "totalDuration": 39600,  // 11小时
      "formattedDuration": "11小时",
      "features": ["多人演绎", "戏剧风格"],
      "avgRating": 4.5,
      "numReviews": 567
    }
    // ... more versions
  ]
}
```

#### 获取单个有声书 (包含版本信息)

```
GET /audiobooks/:id

Response (扩展):
{
  // ... 现有字段 ...

  // 新增版本信息
  "versionInfo": {
    "versionLabel": "Karen Savage版",
    "versionType": "SOLO",
    "versionNumber": 1,
    "isDefault": true,
    "features": ["女声", "美式口音"],
    "totalVersions": 6,  // 该书共有几个版本
    "otherVersionsPreview": [  // 其他版本预览
      { "id": "uuid", "label": "戏剧版", "narrator": "多人" },
      { "id": "uuid", "label": "Elizabeth Klett版", "narrator": "Elizabeth Klett" }
    ]
  }
}
```

#### 用户设置默认版本

```
POST /audiobooks/:id/set-default

Request:
{
  "bookId": "uuid"  // 将此版本设为该书的用户默认版本
}

Response:
{
  "success": true,
  "message": "已将此版本设为默认"
}
```

### 3.3 DTO 定义

```typescript
// apps/backend/src/modules/audiobooks/dto/audiobook-version.dto.ts

export class AudiobookVersionDto {
  id: string;
  versionLabel: string;
  versionType: AudiobookVersionType;
  versionNumber: number;
  isDefault: boolean;
  narrator: string;
  readers?: ReaderDto[];
  totalDuration: number;
  formattedDuration: string;
  features: string[];
  avgRating?: number;
  numReviews?: number;
  archiveDownloads?: number;
  coverUrl?: string;
  previewUrl?: string;
}

export class BookAudiobookVersionsDto {
  bookId: string;
  bookTitle: string;
  totalVersions: number;
  defaultVersionId?: string;
  versions: AudiobookVersionDto[];
}

export class ReaderDto {
  name: string;
  role?: string;
  chapters?: number[];
}

export class AudiobookVersionInfoDto {
  versionLabel: string;
  versionType: AudiobookVersionType;
  versionNumber: number;
  isDefault: boolean;
  features: string[];
  totalVersions: number;
  otherVersionsPreview: OtherVersionPreviewDto[];
}

export class OtherVersionPreviewDto {
  id: string;
  label: string;
  narrator: string;
}
```

---

## 4. iOS 客户端设计

### 4.1 数据模型更新

```swift
// ios/Readmigo/Core/Models/Audiobook.swift

// 新增: 版本类型枚举
enum AudiobookVersionType: String, Codable {
    case solo = "SOLO"
    case dramatic = "DRAMATIC"
    case abridged = "ABRIDGED"
    case unabridged = "UNABRIDGED"
    case childrens = "CHILDRENS"

    var displayName: String {
        switch self {
        case .solo: return "独唱版"
        case .dramatic: return "戏剧版"
        case .abridged: return "删节版"
        case .unabridged: return "完整版"
        case .childrens: return "儿童版"
        }
    }
}

// 新增: 版本信息结构
struct AudiobookVersionInfo: Codable {
    let versionLabel: String
    let versionType: AudiobookVersionType
    let versionNumber: Int
    let isDefault: Bool
    let features: [String]
    let totalVersions: Int
    let otherVersionsPreview: [OtherVersionPreview]
}

struct OtherVersionPreview: Codable, Identifiable {
    let id: String
    let label: String
    let narrator: String
}

// 新增: 版本列表项
struct AudiobookVersion: Codable, Identifiable {
    let id: String
    let versionLabel: String
    let versionType: AudiobookVersionType
    let versionNumber: Int
    let isDefault: Bool
    let narrator: String
    let readers: [AudiobookReader]?
    let totalDuration: Int
    let features: [String]
    let avgRating: Double?
    let numReviews: Int?
    let archiveDownloads: Int?
    let coverUrl: String?
    let previewUrl: String?

    var formattedDuration: String {
        let hours = totalDuration / 3600
        let minutes = (totalDuration % 3600) / 60
        if hours > 0 {
            return "\(hours)小时\(minutes > 0 ? "\(minutes)分" : "")"
        }
        return "\(minutes)分钟"
    }
}

struct AudiobookReader: Codable {
    let name: String
    let role: String?
    let chapters: [Int]?
}

// 新增: 书籍版本列表响应
struct BookAudiobookVersions: Codable {
    let bookId: String
    let bookTitle: String
    let totalVersions: Int
    let defaultVersionId: String?
    let versions: [AudiobookVersion]
}

// 扩展现有 Audiobook 模型
extension Audiobook {
    var versionInfo: AudiobookVersionInfo? // 新增可选字段
}
```

### 4.2 UI 组件设计

```
版本选择器 UI 架构
────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│  AudiobookVersionSelectorView                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  当前版本: Karen Savage版 (独唱版)                    │   │
│  │  [切换版本 ▼]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  展开后:                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ✓ Karen Savage版                              │  │   │
│  │  │   独唱版 · 12小时 · ⭐4.8                      │  │   │
│  │  │   [女声] [美式口音] [高音质]                   │  │   │
│  │  │   [▶ 试听]                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │   戏剧版                                       │  │   │
│  │  │   多人朗读 · 11小时 · ⭐4.5                    │  │   │
│  │  │   [多人演绎] [戏剧风格]                        │  │   │
│  │  │   [▶ 试听]                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │   Elizabeth Klett版                           │  │   │
│  │  │   独唱版 · 11.5小时 · ⭐4.6                    │  │   │
│  │  │   [女声] [英式口音]                            │  │   │
│  │  │   [▶ 试听]                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 SwiftUI 视图实现

```swift
// ios/Readmigo/Features/Audiobook/Views/AudiobookVersionSelectorView.swift

struct AudiobookVersionSelectorView: View {
    let bookId: String
    @Binding var selectedVersionId: String?

    @StateObject private var viewModel = AudiobookVersionSelectorViewModel()
    @State private var isExpanded = false
    @State private var previewingVersionId: String?

    var body: some View {
        VStack(spacing: 0) {
            // 当前版本显示
            currentVersionHeader

            // 展开的版本列表
            if isExpanded {
                versionList
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
        .onAppear {
            viewModel.loadVersions(bookId: bookId)
        }
    }

    private var currentVersionHeader: some View {
        Button(action: { withAnimation { isExpanded.toggle() } }) {
            HStack {
                if let current = viewModel.currentVersion {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("当前版本: \(current.versionLabel)")
                            .font(.headline)
                        Text("\(current.versionType.displayName) · \(current.formattedDuration)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundColor(.secondary)
            }
            .padding()
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var versionList: some View {
        VStack(spacing: 8) {
            ForEach(viewModel.versions) { version in
                AudiobookVersionCard(
                    version: version,
                    isSelected: version.id == selectedVersionId,
                    isPreviewing: version.id == previewingVersionId,
                    onSelect: { selectVersion(version) },
                    onPreview: { togglePreview(version) }
                )
            }
        }
        .padding()
    }

    private func selectVersion(_ version: AudiobookVersion) {
        selectedVersionId = version.id
        isExpanded = false
        viewModel.setAsDefault(versionId: version.id, bookId: bookId)
    }

    private func togglePreview(_ version: AudiobookVersion) {
        if previewingVersionId == version.id {
            previewingVersionId = nil
            viewModel.stopPreview()
        } else {
            previewingVersionId = version.id
            viewModel.playPreview(version: version)
        }
    }
}

// 版本卡片组件
struct AudiobookVersionCard: View {
    let version: AudiobookVersion
    let isSelected: Bool
    let isPreviewing: Bool
    let onSelect: () -> Void
    let onPreview: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // 标题行
            HStack {
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                }
                Text(version.versionLabel)
                    .font(.headline)
                Spacer()
            }

            // 信息行
            HStack {
                Text(version.versionType.displayName)
                Text("·")
                Text(version.formattedDuration)
                if let rating = version.avgRating {
                    Text("·")
                    Label(String(format: "%.1f", rating), systemImage: "star.fill")
                        .foregroundColor(.orange)
                }
            }
            .font(.caption)
            .foregroundColor(.secondary)

            // 特色标签
            if !version.features.isEmpty {
                FlowLayout(spacing: 4) {
                    ForEach(version.features, id: \.self) { feature in
                        Text(feature)
                            .font(.caption2)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(4)
                    }
                }
            }

            // 试听按钮
            Button(action: onPreview) {
                Label(
                    isPreviewing ? "停止试听" : "试听",
                    systemImage: isPreviewing ? "stop.fill" : "play.fill"
                )
                .font(.caption)
            }
            .buttonStyle(.bordered)
        }
        .padding()
        .background(isSelected ? Color.blue.opacity(0.05) : Color(.secondarySystemBackground))
        .cornerRadius(8)
        .onTapGesture(perform: onSelect)
    }
}
```

### 4.4 ViewModel 实现

```swift
// ios/Readmigo/Features/Audiobook/ViewModels/AudiobookVersionSelectorViewModel.swift

@MainActor
class AudiobookVersionSelectorViewModel: ObservableObject {
    @Published var versions: [AudiobookVersion] = []
    @Published var currentVersion: AudiobookVersion?
    @Published var isLoading = false
    @Published var error: String?

    private let audiobookManager: AudiobookManager
    private let previewPlayer: AVPlayer?
    private var cancellables = Set<AnyCancellable>()

    init(audiobookManager: AudiobookManager = .shared) {
        self.audiobookManager = audiobookManager
        self.previewPlayer = AVPlayer()
    }

    func loadVersions(bookId: String) {
        isLoading = true

        Task {
            do {
                let response = try await audiobookManager.fetchBookVersions(bookId: bookId)
                self.versions = response.versions
                self.currentVersion = response.versions.first { $0.isDefault }
                    ?? response.versions.first
                self.isLoading = false
            } catch {
                self.error = error.localizedDescription
                self.isLoading = false
            }
        }
    }

    func setAsDefault(versionId: String, bookId: String) {
        Task {
            try? await audiobookManager.setDefaultVersion(
                versionId: versionId,
                bookId: bookId
            )
            // 更新本地状态
            currentVersion = versions.first { $0.id == versionId }
        }
    }

    func playPreview(version: AudiobookVersion) {
        guard let urlString = version.previewUrl,
              let url = URL(string: urlString) else { return }

        let playerItem = AVPlayerItem(url: url)
        previewPlayer?.replaceCurrentItem(with: playerItem)
        previewPlayer?.play()
    }

    func stopPreview() {
        previewPlayer?.pause()
        previewPlayer?.replaceCurrentItem(with: nil)
    }
}
```

---

## 5. 版本选择流程

### 5.1 用户流程图

```
用户版本选择流程
────────────────────────────────────────────────────────────

开始阅读书籍
    │
    ▼
┌─────────────────────┐
│  检查是否有有声书    │
└─────────────────────┘
    │
    ├── 无有声书 ────────────────────────────────────────┐
    │                                                    │
    ▼                                                    │
┌─────────────────────┐                                  │
│  检查版本数量        │                                  │
└─────────────────────┘                                  │
    │                                                    │
    ├── 单版本 ──────────────────────────┐              │
    │                                    │              │
    ▼                                    ▼              ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌───┐
│  显示多版本选择入口   │    │  直接使用该版本      │    │跳过│
└─────────────────────┘    └─────────────────────┘    └───┘
    │
    ▼
┌─────────────────────┐
│  用户查看版本列表    │
│  • 对比时长/评分     │
│  • 查看朗读者信息    │
│  • 试听30秒预览      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  选择版本           │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  开始播放           │
│  (进度独立保存)      │
└─────────────────────┘
```

### 5.2 版本切换流程

```
版本切换流程
────────────────────────────────────────────────────────────

正在播放版本A
    │
    ▼
┌─────────────────────┐
│  用户点击"切换版本"   │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  暂停当前播放        │
│  保存版本A进度       │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  显示版本列表        │
│  标记各版本进度状态   │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  用户选择版本B       │
└─────────────────────┘
    │
    ├── 版本B有历史进度 ──────────────────┐
    │                                    │
    ▼                                    ▼
┌─────────────────────┐    ┌─────────────────────┐
│  从头开始播放        │    │  询问是否继续播放    │
└─────────────────────┘    │  • 从上次位置继续    │
                           │  • 从头开始          │
                           └─────────────────────┘
                               │
                               ▼
                           ┌─────────────────────┐
                           │  恢复/开始播放版本B  │
                           └─────────────────────┘
```

---

## 6. 默认版本策略

### 6.1 默认版本选择算法

```
默认版本选择优先级
────────────────────────────────────────────────────────────

Priority 1: 用户设置的默认版本
    │
    └── 用户明确选择过 → 使用用户选择

Priority 2: 用户偏好匹配
    │
    ├── 匹配偏好朗读者 → 使用该版本
    ├── 匹配偏好类型 (独唱/戏剧) → 使用该版本
    └── 匹配性别偏好 → 使用该版本

Priority 3: 质量评分
    │
    ├── 评分最高的版本 (avgRating)
    └── 播放量最高的版本 (archiveDownloads)

Priority 4: 系统默认
    │
    └── isDefault: true 的版本 (导入时设置)

Fallback: 版本号最小的版本
```

### 6.2 偏好学习

```
用户偏好学习机制
────────────────────────────────────────────────────────────

显式偏好 (用户主动设置)
├── 设置页面选择偏好朗读者
├── 设置偏好版本类型
└── 设置声音性别偏好

隐式偏好 (行为学习)
├── 记录用户选择的版本类型频率
├── 记录用户完整听完的版本特征
├── 记录用户切换版本后的选择
└── 分析用户跳过的版本特征

偏好权重计算:
Score = 显式偏好 × 2 + 隐式偏好 × 1
```

---

## 7. 数据同步策略

### 7.1 LibriVox 多版本识别

```
LibriVox 多版本识别规则
────────────────────────────────────────────────────────────

规则1: 相同 url_text_source (Gutenberg ID)
├── 多条记录指向同一 Gutenberg 文本
└── 自动归为同一书籍的不同版本

规则2: 标题+作者匹配
├── 标准化后的 title 和 author 相同
├── 但 LibriVox ID 不同
└── 归为同一书籍的不同版本

版本标签生成规则:
├── 优先使用 reader 字段作为版本标签
├── 如果是 "group" 或 "collaborative":
│   └── 标记为 "戏剧版" 或 "多人朗读版"
├── 如果时长差异 > 30%:
│   └── 较短版本标记为 "删节版"
└── 根据 language 标记版本特性
```

### 7.2 同步脚本更新

```typescript
// scripts/sync-librivox-versions.ts

async function syncAudiobookVersions() {
  // 1. 获取所有有声书，按 bookId 分组
  const audiobooks = await prisma.audiobook.findMany({
    where: { bookId: { not: null } }
  });

  const groupedByBook = groupBy(audiobooks, 'bookId');

  // 2. 处理每组多版本
  for (const [bookId, versions] of Object.entries(groupedByBook)) {
    if (versions.length <= 1) continue;

    // 3. 为每个版本生成标签和排序
    const sortedVersions = versions.sort((a, b) =>
      (b.archiveDownloads || 0) - (a.archiveDownloads || 0)
    );

    for (let i = 0; i < sortedVersions.length; i++) {
      const version = sortedVersions[i];

      await prisma.audiobook.update({
        where: { id: version.id },
        data: {
          versionNumber: i + 1,
          versionLabel: generateVersionLabel(version),
          versionType: inferVersionType(version),
          isDefault: i === 0,  // 播放量最高的为默认
          features: extractFeatures(version)
        }
      });
    }
  }
}

function generateVersionLabel(audiobook: Audiobook): string {
  if (audiobook.narrator.toLowerCase().includes('group')) {
    return '戏剧版';
  }
  return `${audiobook.narrator}版`;
}

function inferVersionType(audiobook: Audiobook): AudiobookVersionType {
  const narrator = audiobook.narrator.toLowerCase();
  if (narrator.includes('group') || narrator.includes('dramatic')) {
    return 'DRAMATIC';
  }
  // 基于时长推断
  // ... 更多规则
  return 'SOLO';
}

function extractFeatures(audiobook: Audiobook): string[] {
  const features: string[] = [];

  // 分析朗读者名字推断性别
  // 分析语言/口音
  // 分析音质评分

  return features;
}
```

---

## 8. 缓存策略

### 8.1 后端缓存

```typescript
// 版本列表缓存
const CACHE_KEY_VERSIONS = (bookId: string) => `book:${bookId}:versions`;
const CACHE_TTL_VERSIONS = 3600; // 1小时

async getBookVersions(bookId: string): Promise<BookAudiobookVersionsDto> {
  const cacheKey = CACHE_KEY_VERSIONS(bookId);

  // 尝试从缓存获取
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 查询数据库
  const versions = await this.prisma.audiobook.findMany({
    where: { bookId },
    orderBy: [
      { isDefault: 'desc' },
      { versionNumber: 'asc' }
    ]
  });

  const result = this.mapToVersionsDto(versions, bookId);

  // 写入缓存
  await this.redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_VERSIONS);

  return result;
}
```

### 8.2 客户端缓存

```swift
// iOS 版本列表缓存
func fetchBookVersions(bookId: String) async throws -> BookAudiobookVersions {
    let cacheKey = "book_versions_\(bookId)"

    // 检查本地缓存
    if let cached: BookAudiobookVersions = cacheService.get(key: cacheKey) {
        return cached
    }

    // 网络请求
    let response: BookAudiobookVersions = try await networkService.get(
        path: "/audiobooks/book/\(bookId)/versions"
    )

    // 保存到缓存 (TTL: 1小时)
    cacheService.set(key: cacheKey, value: response, ttl: .bookList)

    return response
}
```

---

## 9. 上线计划

### 9.1 阶段划分

| 阶段 | 内容 | 依赖 |
|------|------|------|
| **Phase 1** | Schema 变更 + 数据迁移 | - |
| **Phase 2** | 后端 API 开发 | Phase 1 |
| **Phase 3** | iOS UI 开发 | Phase 2 |
| **Phase 4** | 版本数据导入 | Phase 1 |
| **Phase 5** | 用户偏好系统 | Phase 3 |

### 9.2 Phase 1 详细任务

| 任务 | 说明 |
|------|------|
| 1.1 | 添加新字段到 Prisma Schema |
| 1.2 | 生成并应用数据库迁移 |
| 1.3 | 为现有单版本有声书设置默认值 |
| 1.4 | 编写版本识别脚本 |
| 1.5 | 执行历史数据版本标记 |

### 9.3 Phase 2 详细任务

| 任务 | 说明 |
|------|------|
| 2.1 | 实现版本 DTO |
| 2.2 | 修改 getForBook 返回版本列表 |
| 2.3 | 实现 setDefaultVersion API |
| 2.4 | 添加版本缓存逻辑 |
| 2.5 | 编写 API 单元测试 |

### 9.4 Phase 3 详细任务

| 任务 | 说明 |
|------|------|
| 3.1 | 实现 Swift 数据模型 |
| 3.2 | 实现版本选择器 UI |
| 3.3 | 集成到播放器页面 |
| 3.4 | 实现版本切换逻辑 |
| 3.5 | 实现试听功能 |
| 3.6 | UI 测试和优化 |

---

## 10. 测试计划

### 10.1 单元测试

| 模块 | 测试点 |
|------|--------|
| **数据层** | 版本查询、默认版本逻辑、版本排序 |
| **API层** | 端点响应格式、权限校验、缓存失效 |
| **客户端** | ViewModel 状态管理、版本切换、进度保存 |

### 10.2 集成测试

| 场景 | 预期结果 |
|------|----------|
| 新用户首次播放多版本书籍 | 显示版本选择器，默认选中推荐版本 |
| 用户切换版本 | 新版本开始播放，旧版本进度保留 |
| 用户设置默认版本 | 下次进入该书籍自动使用设置版本 |
| 离线状态查看版本 | 显示缓存的版本列表 |

### 10.3 边界测试

| 场景 | 处理方式 |
|------|----------|
| 书籍只有一个版本 | 不显示版本选择器 |
| 版本被删除 | 自动切换到其他版本，提示用户 |
| 试听 URL 失效 | 禁用试听按钮，显示提示 |

---

## 参考资源

| 资源 | 说明 |
|------|------|
| [有声书设计 V2](./audiobook-design-v2.md) | 有声书功能整体设计 |
| [LibriVox 匹配分析](../sources/librivox/audiobook-matching-analysis.md) | 多版本作品统计 |
| [Prisma Schema](../../packages/database/prisma/schema.prisma) | 当前数据模型 |

---

*文档创建日期: 2025-12-30*
*状态: 技术方案初稿*
