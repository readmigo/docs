# Readmigo 人物关系图功能设计文档

> Version: 1.0.0
> Status: Draft
> Author: System Architect
> Date: 2025-12-27

---

## 1. 概述

### 1.1 功能目标

为每本书提供**可视化的人物关系图**，帮助读者：
- 快速理解书中人物之间的复杂关系
- 在阅读过程中随时查阅人物信息
- 避免因人物众多而产生的阅读困惑
- 增强对故事情节的理解和记忆

### 1.2 核心价值

| 价值点 | 说明 |
|--------|------|
| **阅读辅助** | 帮助读者厘清复杂的人物关系网络 |
| **记忆强化** | 通过可视化方式加深人物印象 |
| **沉浸体验** | 随时可查，不打断阅读节奏 |
| **AI 驱动** | 自动生成，持续优化 |

---

## 2. 功能架构

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Character Relationship Map System                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      1. 数据生成层 (AI Generation)                  │  │
│  │    • 书籍内容分析                                                   │  │
│  │    • 人物识别与提取                                                 │  │
│  │    • 关系推断与分类                                                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      2. 数据存储层 (Database)                       │  │
│  │    • 人物信息表                                                     │  │
│  │    • 关系定义表                                                     │  │
│  │    • 书籍关联表                                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      3. API 服务层 (Backend)                        │  │
│  │    • 人物查询接口                                                   │  │
│  │    • 关系图数据接口                                                 │  │
│  │    • 缓存管理                                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      4. 客户端展示层 (iOS/Web)                      │  │
│  │    • 关系图可视化组件                                               │  │
│  │    • 人物卡片详情                                                   │  │
│  │    • 交互手势支持                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 关系类型定义

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Relationship Types                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   FAMILY    │  │   ROMANCE   │  │   FRIEND    │  │    ENEMY    │    │
│  │    家庭     │  │    爱情     │  │    友谊     │  │    敌对     │    │
│  │             │  │             │  │             │  │             │    │
│  │  • 父母     │  │  • 恋人     │  │  • 朋友     │  │  • 对手     │    │
│  │  • 子女     │  │  • 配偶     │  │  • 知己     │  │  • 仇人     │    │
│  │  • 兄弟姐妹 │  │  • 前任     │  │  • 同伴     │  │  • 竞争者   │    │
│  │  • 亲戚     │  │  • 暗恋     │  │  • 盟友     │  │  • 背叛者   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  HIERARCHY  │  │   SOCIAL    │  │  MYSTERIOUS │  │   DYNAMIC   │    │
│  │    从属     │  │    社交     │  │    神秘     │  │    动态     │    │
│  │             │  │             │  │             │  │             │    │
│  │  • 主仆     │  │  • 同事     │  │  • 未知     │  │  • 变化中   │    │
│  │  • 师徒     │  │  • 邻居     │  │  • 隐藏     │  │  • 待揭示   │    │
│  │  • 上下级   │  │  • 同学     │  │  • 伪装     │  │  • 复杂     │    │
│  │  • 君臣     │  │  • 合作者   │  │  • 秘密     │  │  • 多重     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型设计

### 3.1 Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

// 书籍人物表
model BookCharacter {
  id                String              @id @default(uuid())

  // 关联书籍
  bookId            String
  book              Book                @relation(fields: [bookId], references: [id], onDelete: Cascade)

  // 基本信息
  name              String              // 人物名称
  nameAliases       String[]            // 别名/昵称
  description       String?             // 人物简介
  role              CharacterRole       // 角色类型
  importance        Int                 @default(5)  // 重要性 1-10

  // 外观特征
  appearance        String?             // 外貌描述
  avatarUrl         String?             // AI 生成的头像

  // 身份信息
  title             String?             // 头衔/职位
  affiliation       String?             // 所属组织/阵营

  // 首次出现
  firstAppearance   String?             // 首次出现章节

  // 元数据
  metadata          Json?               // 扩展信息

  // 时间戳
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // 关系 - 作为主体
  relationshipsFrom CharacterRelationship[] @relation("FromCharacter")
  // 关系 - 作为对象
  relationshipsTo   CharacterRelationship[] @relation("ToCharacter")

  @@unique([bookId, name])
  @@index([bookId])
  @@index([role])
  @@index([importance])
}

// 人物关系表
model CharacterRelationship {
  id                String              @id @default(uuid())

  // 关系双方
  fromCharacterId   String
  fromCharacter     BookCharacter       @relation("FromCharacter", fields: [fromCharacterId], references: [id], onDelete: Cascade)

  toCharacterId     String
  toCharacter       BookCharacter       @relation("ToCharacter", fields: [toCharacterId], references: [id], onDelete: Cascade)

  // 关系信息
  type              RelationshipType    // 关系类型
  subType           String?             // 细分类型
  description       String?             // 关系描述

  // 关系属性
  strength          Int                 @default(5)  // 关系强度 1-10
  sentiment         RelationshipSentiment @default(NEUTRAL)  // 情感倾向
  isBidirectional   Boolean             @default(true)  // 是否双向

  // 时间信息
  startChapter      String?             // 关系开始章节
  endChapter        String?             // 关系结束章节（如有变化）

  // 剧透控制
  spoilerLevel      Int                 @default(0)  // 剧透等级 0-3

  // 元数据
  metadata          Json?

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@unique([fromCharacterId, toCharacterId, type])
  @@index([fromCharacterId])
  @@index([toCharacterId])
  @@index([type])
}

// 枚举定义
enum CharacterRole {
  PROTAGONIST       // 主角
  ANTAGONIST        // 反派
  DEUTERAGONIST     // 第二主角
  SUPPORTING        // 配角
  MINOR             // 次要角色
  MENTIONED         // 仅提及
}

enum RelationshipType {
  FAMILY            // 家庭
  ROMANCE           // 爱情
  FRIEND            // 友谊
  ENEMY             // 敌对
  HIERARCHY         // 从属
  SOCIAL            // 社交
  MYSTERIOUS        // 神秘
  DYNAMIC           // 动态变化
}

enum RelationshipSentiment {
  POSITIVE          // 正面
  NEGATIVE          // 负面
  NEUTRAL           // 中性
  COMPLEX           // 复杂
}
```

### 3.2 关系图数据结构

```typescript
// CharacterGraph.ts - 关系图数据结构

interface CharacterNode {
  id: string;
  name: string;
  aliases: string[];
  role: CharacterRole;
  importance: number;  // 决定节点大小
  avatarUrl?: string;
  description?: string;
  position?: {         // 可选的固定位置
    x: number;
    y: number;
  };
}

interface RelationshipEdge {
  id: string;
  source: string;      // fromCharacterId
  target: string;      // toCharacterId
  type: RelationshipType;
  subType?: string;
  label: string;       // 显示的关系标签
  strength: number;    // 决定连线粗细
  sentiment: RelationshipSentiment;
  isBidirectional: boolean;
  spoilerLevel: number;
}

interface CharacterGraph {
  bookId: string;
  nodes: CharacterNode[];
  edges: RelationshipEdge[];
  metadata: {
    totalCharacters: number;
    mainCharacters: number;
    lastUpdated: string;
  };
}
```

---

## 4. API 设计

### 4.1 接口定义

```typescript
// Character Relationship API Endpoints

// GET /api/v1/books/:bookId/characters
// 获取书籍所有人物
interface GetCharactersResponse {
  characters: BookCharacter[];
  total: number;
}

// GET /api/v1/books/:bookId/character-graph
// 获取人物关系图数据
interface GetCharacterGraphRequest {
  bookId: string;
  spoilerLevel?: number;  // 控制剧透显示级别
  readProgress?: number;  // 阅读进度，只显示已出现的人物
}

interface GetCharacterGraphResponse {
  graph: CharacterGraph;
  filters: {
    roles: CharacterRole[];
    relationshipTypes: RelationshipType[];
  };
}

// GET /api/v1/books/:bookId/characters/:characterId
// 获取人物详情
interface GetCharacterDetailResponse {
  character: BookCharacter;
  relationships: {
    related: BookCharacter;
    relationship: CharacterRelationship;
  }[];
  appearances: {
    chapter: string;
    context: string;
  }[];
}

// GET /api/v1/books/:bookId/characters/:characterId/relationships
// 获取人物的所有关系
interface GetCharacterRelationshipsResponse {
  characterId: string;
  relationships: {
    character: BookCharacter;
    relation: CharacterRelationship;
    direction: 'from' | 'to' | 'both';
  }[];
}
```

### 4.2 服务实现

```typescript
// CharacterService.ts

@Injectable()
export class CharacterService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  // 获取书籍人物关系图
  async getCharacterGraph(
    bookId: string,
    options: { spoilerLevel?: number; readProgress?: number } = {},
  ): Promise<CharacterGraph> {
    const cacheKey = `character-graph:${bookId}:${options.spoilerLevel ?? 0}`;

    // 尝试从缓存获取
    const cached = await this.cacheService.get<CharacterGraph>(cacheKey);
    if (cached) return cached;

    // 获取人物
    const characters = await this.prisma.bookCharacter.findMany({
      where: { bookId },
      orderBy: { importance: 'desc' },
    });

    // 获取关系
    const relationships = await this.prisma.characterRelationship.findMany({
      where: {
        fromCharacter: { bookId },
        spoilerLevel: { lte: options.spoilerLevel ?? 3 },
      },
      include: {
        fromCharacter: true,
        toCharacter: true,
      },
    });

    // 构建图数据
    const graph: CharacterGraph = {
      bookId,
      nodes: characters.map(char => ({
        id: char.id,
        name: char.name,
        aliases: char.nameAliases,
        role: char.role as CharacterRole,
        importance: char.importance,
        avatarUrl: char.avatarUrl ?? undefined,
        description: char.description ?? undefined,
      })),
      edges: relationships.map(rel => ({
        id: rel.id,
        source: rel.fromCharacterId,
        target: rel.toCharacterId,
        type: rel.type as RelationshipType,
        subType: rel.subType ?? undefined,
        label: this.getRelationshipLabel(rel),
        strength: rel.strength,
        sentiment: rel.sentiment as RelationshipSentiment,
        isBidirectional: rel.isBidirectional,
        spoilerLevel: rel.spoilerLevel,
      })),
      metadata: {
        totalCharacters: characters.length,
        mainCharacters: characters.filter(c =>
          ['PROTAGONIST', 'ANTAGONIST', 'DEUTERAGONIST'].includes(c.role)
        ).length,
        lastUpdated: new Date().toISOString(),
      },
    };

    // 缓存结果
    await this.cacheService.set(cacheKey, graph, 3600); // 1小时缓存

    return graph;
  }

  // 生成关系标签
  private getRelationshipLabel(rel: CharacterRelationship): string {
    const labels: Record<string, string> = {
      FAMILY: '家人',
      ROMANCE: '恋人',
      FRIEND: '朋友',
      ENEMY: '敌人',
      HIERARCHY: '从属',
      SOCIAL: '认识',
      MYSTERIOUS: '???',
      DYNAMIC: '复杂',
    };

    return rel.subType || labels[rel.type] || rel.type;
  }
}
```

---

## 5. iOS 客户端实现

### 5.1 数据模型

```swift
// CharacterModels.swift

import Foundation

struct BookCharacter: Identifiable, Codable {
    let id: String
    let name: String
    let aliases: [String]
    let role: CharacterRole
    let importance: Int
    let avatarUrl: String?
    let description: String?
    let title: String?
    let affiliation: String?

    var displayName: String {
        if let title = title {
            return "\(title) \(name)"
        }
        return name
    }
}

struct CharacterRelationship: Identifiable, Codable {
    let id: String
    let sourceId: String
    let targetId: String
    let type: RelationshipType
    let subType: String?
    let label: String
    let strength: Int
    let sentiment: RelationshipSentiment
    let isBidirectional: Bool
    let spoilerLevel: Int
}

struct CharacterGraph: Codable {
    let bookId: String
    let nodes: [CharacterNode]
    let edges: [RelationshipEdge]
    let metadata: GraphMetadata
}

enum CharacterRole: String, Codable, CaseIterable {
    case protagonist = "PROTAGONIST"
    case antagonist = "ANTAGONIST"
    case deuteragonist = "DEUTERAGONIST"
    case supporting = "SUPPORTING"
    case minor = "MINOR"
    case mentioned = "MENTIONED"

    var displayName: String {
        switch self {
        case .protagonist: return "主角"
        case .antagonist: return "反派"
        case .deuteragonist: return "重要角色"
        case .supporting: return "配角"
        case .minor: return "次要角色"
        case .mentioned: return "提及"
        }
    }

    var color: Color {
        switch self {
        case .protagonist: return .blue
        case .antagonist: return .red
        case .deuteragonist: return .purple
        case .supporting: return .green
        case .minor: return .gray
        case .mentioned: return .secondary
        }
    }
}

enum RelationshipType: String, Codable, CaseIterable {
    case family = "FAMILY"
    case romance = "ROMANCE"
    case friend = "FRIEND"
    case enemy = "ENEMY"
    case hierarchy = "HIERARCHY"
    case social = "SOCIAL"
    case mysterious = "MYSTERIOUS"
    case dynamic = "DYNAMIC"

    var color: Color {
        switch self {
        case .family: return .orange
        case .romance: return .pink
        case .friend: return .green
        case .enemy: return .red
        case .hierarchy: return .purple
        case .social: return .blue
        case .mysterious: return .gray
        case .dynamic: return .yellow
        }
    }

    var icon: String {
        switch self {
        case .family: return "house.fill"
        case .romance: return "heart.fill"
        case .friend: return "person.2.fill"
        case .enemy: return "bolt.fill"
        case .hierarchy: return "arrow.up.arrow.down"
        case .social: return "bubble.left.and.bubble.right.fill"
        case .mysterious: return "questionmark.circle.fill"
        case .dynamic: return "arrow.triangle.2.circlepath"
        }
    }
}
```

### 5.2 关系图视图组件

```swift
// CharacterGraphView.swift

import SwiftUI

struct CharacterGraphView: View {
    let bookId: String
    @StateObject private var viewModel = CharacterGraphViewModel()
    @State private var selectedCharacter: BookCharacter?
    @State private var scale: CGFloat = 1.0
    @State private var offset: CGSize = .zero

    var body: some View {
        ZStack {
            // 背景
            Color.black.opacity(0.95)
                .ignoresSafeArea()

            if viewModel.isLoading {
                ProgressView()
                    .tint(.white)
            } else if let graph = viewModel.graph {
                // 关系图画布
                GraphCanvas(
                    graph: graph,
                    selectedCharacter: $selectedCharacter,
                    scale: $scale,
                    offset: $offset
                )
                .gesture(
                    MagnificationGesture()
                        .onChanged { value in
                            scale = min(max(value, 0.5), 3.0)
                        }
                )
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            offset = value.translation
                        }
                )
            }

            // 顶部工具栏
            VStack {
                HStack {
                    // 筛选按钮
                    FilterButton(viewModel: viewModel)

                    Spacer()

                    // 缩放控制
                    ZoomControls(scale: $scale)
                }
                .padding()

                Spacer()
            }

            // 图例
            VStack {
                Spacer()
                LegendView()
                    .padding()
            }
        }
        .sheet(item: $selectedCharacter) { character in
            CharacterDetailSheet(character: character, bookId: bookId)
        }
        .onAppear {
            viewModel.loadGraph(bookId: bookId)
        }
    }
}

// 关系图画布
struct GraphCanvas: View {
    let graph: CharacterGraph
    @Binding var selectedCharacter: BookCharacter?
    @Binding var scale: CGFloat
    @Binding var offset: CGSize

    var body: some View {
        GeometryReader { geometry in
            let center = CGPoint(x: geometry.size.width / 2, y: geometry.size.height / 2)

            ZStack {
                // 绘制关系连线
                ForEach(graph.edges, id: \.id) { edge in
                    if let sourceNode = findNode(edge.source),
                       let targetNode = findNode(edge.target) {
                        RelationshipLine(
                            from: nodePosition(sourceNode, center: center, count: graph.nodes.count),
                            to: nodePosition(targetNode, center: center, count: graph.nodes.count),
                            edge: edge
                        )
                    }
                }

                // 绘制人物节点
                ForEach(graph.nodes, id: \.id) { node in
                    CharacterNode(
                        character: node,
                        isSelected: selectedCharacter?.id == node.id
                    )
                    .position(nodePosition(node, center: center, count: graph.nodes.count))
                    .onTapGesture {
                        selectedCharacter = nodeToCharacter(node)
                    }
                }
            }
            .scaleEffect(scale)
            .offset(offset)
        }
    }

    private func findNode(_ id: String) -> CharacterNode? {
        graph.nodes.first { $0.id == id }
    }

    private func nodePosition(_ node: CharacterNode, center: CGPoint, count: Int) -> CGPoint {
        // 使用力导向布局算法计算位置
        // 简化版：按重要性分层环形布局
        let index = graph.nodes.firstIndex { $0.id == node.id } ?? 0
        let layer = getLayer(importance: node.importance)
        let radius = CGFloat(layer) * 100 + 50
        let angle = CGFloat(index) * (2 * .pi / CGFloat(count))

        return CGPoint(
            x: center.x + radius * cos(angle),
            y: center.y + radius * sin(angle)
        )
    }

    private func getLayer(importance: Int) -> Int {
        switch importance {
        case 8...10: return 0  // 核心人物在中心
        case 5...7: return 1   // 重要人物第一圈
        case 3...4: return 2   // 配角第二圈
        default: return 3      // 次要角色外圈
        }
    }
}

// 人物节点
struct CharacterNode: View {
    let character: CharacterNode
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 4) {
            // 头像
            ZStack {
                Circle()
                    .fill(character.role.color.opacity(0.3))
                    .frame(width: nodeSize, height: nodeSize)

                if let avatarUrl = character.avatarUrl {
                    AsyncImage(url: URL(string: avatarUrl)) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Text(String(character.name.prefix(1)))
                            .font(.system(size: nodeSize * 0.4, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .frame(width: nodeSize - 8, height: nodeSize - 8)
                    .clipShape(Circle())
                } else {
                    Text(String(character.name.prefix(1)))
                        .font(.system(size: nodeSize * 0.4, weight: .bold))
                        .foregroundColor(.white)
                }

                // 选中边框
                if isSelected {
                    Circle()
                        .stroke(Color.white, lineWidth: 3)
                        .frame(width: nodeSize + 4, height: nodeSize + 4)
                }
            }

            // 名称
            Text(character.name)
                .font(.caption)
                .foregroundColor(.white)
                .lineLimit(1)
        }
    }

    private var nodeSize: CGFloat {
        // 根据重要性调整节点大小
        CGFloat(30 + character.importance * 5)
    }
}

// 关系连线
struct RelationshipLine: View {
    let from: CGPoint
    let to: CGPoint
    let edge: RelationshipEdge

    var body: some View {
        ZStack {
            // 连线
            Path { path in
                path.move(to: from)
                path.addLine(to: to)
            }
            .stroke(
                edge.type.color,
                style: StrokeStyle(
                    lineWidth: CGFloat(edge.strength) / 2,
                    dash: edge.sentiment == .negative ? [5, 5] : []
                )
            )

            // 关系标签
            Text(edge.label)
                .font(.system(size: 10))
                .foregroundColor(edge.type.color)
                .padding(.horizontal, 4)
                .padding(.vertical, 2)
                .background(Color.black.opacity(0.7))
                .cornerRadius(4)
                .position(midPoint)
        }
    }

    private var midPoint: CGPoint {
        CGPoint(
            x: (from.x + to.x) / 2,
            y: (from.y + to.y) / 2
        )
    }
}
```

### 5.3 人物详情卡片

```swift
// CharacterDetailSheet.swift

import SwiftUI

struct CharacterDetailSheet: View {
    let character: BookCharacter
    let bookId: String
    @StateObject private var viewModel = CharacterDetailViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // 头像和基本信息
                    CharacterHeader(character: character)

                    // 人物简介
                    if let description = character.description {
                        SectionCard(title: "简介") {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }

                    // 人物关系
                    if !viewModel.relationships.isEmpty {
                        SectionCard(title: "人物关系") {
                            LazyVStack(spacing: 12) {
                                ForEach(viewModel.relationships, id: \.character.id) { item in
                                    RelationshipRow(
                                        character: item.character,
                                        relationship: item.relationship
                                    )
                                }
                            }
                        }
                    }

                    // 首次出现
                    if let firstAppearance = character.firstAppearance {
                        SectionCard(title: "首次出现") {
                            HStack {
                                Image(systemName: "book.pages")
                                Text(firstAppearance)
                            }
                            .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(character.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") { dismiss() }
                }
            }
        }
        .onAppear {
            viewModel.loadRelationships(characterId: character.id, bookId: bookId)
        }
    }
}

struct CharacterHeader: View {
    let character: BookCharacter

    var body: some View {
        VStack(spacing: 12) {
            // 头像
            ZStack {
                Circle()
                    .fill(character.role.color.opacity(0.2))
                    .frame(width: 100, height: 100)

                if let avatarUrl = character.avatarUrl,
                   let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Text(String(character.name.prefix(1)))
                            .font(.largeTitle)
                            .fontWeight(.bold)
                    }
                    .frame(width: 90, height: 90)
                    .clipShape(Circle())
                } else {
                    Text(String(character.name.prefix(1)))
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(character.role.color)
                }
            }

            // 名称
            Text(character.displayName)
                .font(.title2)
                .fontWeight(.bold)

            // 别名
            if !character.aliases.isEmpty {
                Text("别名: \(character.aliases.joined(separator: ", "))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // 角色标签
            HStack(spacing: 8) {
                RoleTag(role: character.role)

                if let affiliation = character.affiliation {
                    Tag(text: affiliation, color: .blue)
                }
            }
        }
    }
}

struct RelationshipRow: View {
    let character: BookCharacter
    let relationship: CharacterRelationship

    var body: some View {
        HStack(spacing: 12) {
            // 小头像
            Circle()
                .fill(character.role.color.opacity(0.3))
                .frame(width: 40, height: 40)
                .overlay(
                    Text(String(character.name.prefix(1)))
                        .font(.caption)
                        .fontWeight(.bold)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(character.name)
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 4) {
                    Image(systemName: relationship.type.icon)
                        .font(.caption)
                    Text(relationship.label)
                        .font(.caption)
                }
                .foregroundColor(relationship.type.color)
            }

            Spacer()

            // 关系强度指示
            RelationshipStrengthIndicator(strength: relationship.strength)
        }
        .padding(.vertical, 8)
    }
}
```

---

## 6. AI 数据生成

### 6.1 人物提取 Prompt

```typescript
// CharacterExtractionPrompt.ts

const EXTRACTION_PROMPT = `
你是一个专业的文学分析助手。请分析以下书籍内容，提取所有出现的人物及其关系。

## 任务要求

1. **人物提取**
   - 识别所有有名字的人物
   - 标记人物的角色类型（主角/反派/配角等）
   - 提取人物的基本信息（身份、外貌、性格特点）
   - 记录人物的别名或昵称

2. **关系识别**
   - 识别人物之间的所有关系
   - 标记关系类型（家庭/爱情/友谊/敌对等）
   - 描述关系的具体内容
   - 标记关系的情感倾向（正面/负面/中性）

3. **剧透控制**
   - 为每个关系标记剧透级别（0-3）
   - 0: 基本信息，无剧透
   - 1: 轻微剧透
   - 2: 中度剧透
   - 3: 重大剧透

## 输出格式

\`\`\`json
{
  "characters": [
    {
      "name": "人物名称",
      "aliases": ["别名1", "别名2"],
      "role": "PROTAGONIST|ANTAGONIST|SUPPORTING|MINOR",
      "importance": 1-10,
      "description": "人物简介",
      "title": "头衔/职位",
      "affiliation": "所属组织",
      "appearance": "外貌描述",
      "firstAppearance": "首次出现章节"
    }
  ],
  "relationships": [
    {
      "from": "人物A名称",
      "to": "人物B名称",
      "type": "FAMILY|ROMANCE|FRIEND|ENEMY|HIERARCHY|SOCIAL|MYSTERIOUS",
      "subType": "具体关系（如：父子、师徒）",
      "description": "关系描述",
      "strength": 1-10,
      "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|COMPLEX",
      "isBidirectional": true|false,
      "spoilerLevel": 0-3
    }
  ]
}
\`\`\`

## 书籍内容

{{BOOK_CONTENT}}
`;
```

### 6.2 数据生成服务

```typescript
// CharacterGenerationService.ts

@Injectable()
export class CharacterGenerationService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async generateCharacterData(bookId: string): Promise<void> {
    // 获取书籍内容
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: true },
    });

    if (!book) throw new NotFoundException('Book not found');

    // 分章节提取人物
    const allCharacters: Map<string, any> = new Map();
    const allRelationships: any[] = [];

    for (const chapter of book.chapters) {
      const result = await this.aiService.analyze(
        EXTRACTION_PROMPT.replace('{{BOOK_CONTENT}}', chapter.content),
      );

      // 合并人物数据
      for (const char of result.characters) {
        if (allCharacters.has(char.name)) {
          // 更新现有人物信息
          const existing = allCharacters.get(char.name);
          existing.importance = Math.max(existing.importance, char.importance);
          if (char.description && !existing.description) {
            existing.description = char.description;
          }
        } else {
          allCharacters.set(char.name, char);
        }
      }

      // 收集关系
      allRelationships.push(...result.relationships);
    }

    // 保存到数据库
    await this.saveCharacterData(bookId, allCharacters, allRelationships);
  }

  private async saveCharacterData(
    bookId: string,
    characters: Map<string, any>,
    relationships: any[],
  ): Promise<void> {
    // 使用事务保存
    await this.prisma.$transaction(async (tx) => {
      // 清除旧数据
      await tx.characterRelationship.deleteMany({
        where: { fromCharacter: { bookId } },
      });
      await tx.bookCharacter.deleteMany({
        where: { bookId },
      });

      // 保存人物
      const charIdMap = new Map<string, string>();
      for (const [name, data] of characters) {
        const char = await tx.bookCharacter.create({
          data: {
            bookId,
            name: data.name,
            nameAliases: data.aliases || [],
            role: data.role,
            importance: data.importance,
            description: data.description,
            title: data.title,
            affiliation: data.affiliation,
            appearance: data.appearance,
            firstAppearance: data.firstAppearance,
          },
        });
        charIdMap.set(name, char.id);
      }

      // 保存关系
      for (const rel of relationships) {
        const fromId = charIdMap.get(rel.from);
        const toId = charIdMap.get(rel.to);

        if (fromId && toId) {
          await tx.characterRelationship.create({
            data: {
              fromCharacterId: fromId,
              toCharacterId: toId,
              type: rel.type,
              subType: rel.subType,
              description: rel.description,
              strength: rel.strength,
              sentiment: rel.sentiment,
              isBidirectional: rel.isBidirectional,
              spoilerLevel: rel.spoilerLevel,
            },
          });
        }
      }
    });
  }
}
```

---

## 7. 实施计划

### Phase 1: 数据层 (第1周)
- [ ] 数据库 Schema 设计与迁移
- [ ] 基础 API 实现
- [ ] 人物和关系的 CRUD 操作

### Phase 2: AI 生成 (第2周)
- [ ] 人物提取 Prompt 优化
- [ ] AI 服务集成
- [ ] 批量数据生成任务

### Phase 3: 客户端展示 (第3周)
- [ ] 关系图可视化组件
- [ ] 人物详情卡片
- [ ] 手势交互支持

### Phase 4: 优化完善 (第4周)
- [ ] 布局算法优化
- [ ] 性能优化（大量节点）
- [ ] 剧透控制功能

---

## 8. 待确认事项

1. **头像生成**: 是否需要为人物生成 AI 头像？
2. **多语言**: 是否支持中英文双语人物名？
3. **用户编辑**: 是否允许用户编辑/补充人物信息？
4. **阅读进度联动**: 是否根据阅读进度逐步显示人物？
5. **分享功能**: 是否支持分享人物关系图？

---

**Document Status**: Draft
**Next Steps**: 请 review 后提出修改意见

---

## 9. 非 AI 实现方案

> 本节探讨在完全不使用 AI 的情况下如何实现人物关系图功能

### 9.1 方案概览

| 方案 | 成本 | 数据质量 | 覆盖范围 | 可扩展性 | 推荐度 |
|------|------|----------|----------|----------|--------|
| **Wikidata/DBpedia** | 低 | 高（经人工审核） | 中（仅知名书籍） | 高 | ⭐⭐⭐⭐ |
| **BookNLP (NLP工具)** | 中 | 中 | 高（任意书籍） | 中 | ⭐⭐⭐ |
| **人工编辑策划** | 高 | 最高 | 低 | 低 | ⭐⭐ |
| **众包社区** | 中 | 中-高 | 中 | 中 | ⭐⭐⭐ |
| **混合方案** | 中-高 | 高 | 高 | 高 | ⭐⭐⭐⭐⭐ |

---

### 9.2 方案一：Wikidata/DBpedia 结构化数据

#### 9.2.1 原理说明

Wikidata 和 DBpedia 是两个大规模的开放知识图谱，包含了大量书籍和虚构人物的结构化数据：

- **Wikidata P674 属性（characters）**：表示"出现在该作品中的角色"
- **Wikidata P1441 属性（present in work）**：反向属性，表示"该角色出现在哪些作品中"
- **DBpedia**：从 Wikipedia 信息框自动提取的结构化数据，包含超过 23,000 本书籍

#### 9.2.2 数据可用性

```
已有数据覆盖：
├── 经典文学作品（覆盖率高）
│   ├── 《悲惨世界》→ Cosette, Jean Valjean, Javert...
│   ├── 《指环王》→ Gandalf, Frodo, Aragorn...
│   └── 《白鲸记》→ Captain Ahab, Ishmael...
├── 当代畅销书（覆盖率中等）
│   └── 部分有 Wikipedia 条目的作品
└── 网络文学/小众作品（几乎无覆盖）
```

#### 9.2.3 SPARQL 查询示例

```sparql
# 查询某本书的所有角色
SELECT ?character ?characterLabel ?description
WHERE {
  wd:Q180736 wdt:P674 ?character.  # Q180736 = 《指环王》
  OPTIONAL { ?character schema:description ?description. FILTER(LANG(?description) = "zh") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
}

# 查询角色之间的关系
SELECT ?char1 ?char1Label ?relation ?relationLabel ?char2 ?char2Label
WHERE {
  wd:Q180736 wdt:P674 ?char1.
  wd:Q180736 wdt:P674 ?char2.
  ?char1 ?relation ?char2.
  FILTER(?char1 != ?char2)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
}
```

#### 9.2.4 实现架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Wikidata Integration Architecture                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────┐       ┌───────────────────┐                      │
│  │   书籍 ISBN/标题   │──────▶│  Wikidata Lookup  │                      │
│  └───────────────────┘       │   (Q-ID 匹配)      │                      │
│                              └─────────┬─────────┘                      │
│                                        │                                 │
│                                        ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SPARQL Query Service                          │   │
│  │    https://query.wikidata.org/sparql                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                        │                                 │
│                                        ▼                                 │
│  ┌───────────────────┐       ┌───────────────────┐                      │
│  │   Character Data  │       │  Relationship     │                      │
│  │   - 名称/别名      │       │  - 家庭关系        │                      │
│  │   - 描述          │       │  - 社会关系        │                      │
│  │   - 头像 URL      │       │  - P22/P25 父母   │                      │
│  └───────────────────┘       └───────────────────┘                      │
│                                        │                                 │
│                                        ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 本地数据库缓存 (减少API调用)                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 9.2.5 代码实现

```typescript
// WikidataCharacterService.ts

interface WikidataCharacter {
  qid: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface WikidataRelationship {
  fromQid: string;
  toQid: string;
  propertyId: string;
  propertyLabel: string;
}

@Injectable()
export class WikidataCharacterService {
  private readonly SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

  // 通过书籍标题/ISBN 获取 Wikidata Q-ID
  async findBookQid(title: string, isbn?: string): Promise<string | null> {
    const query = `
      SELECT ?book WHERE {
        ?book wdt:P31 wd:Q7725634.  # instance of literary work
        { ?book rdfs:label "${title}"@zh. }
        UNION
        { ?book rdfs:label "${title}"@en. }
        ${isbn ? `UNION { ?book wdt:P212 "${isbn}". }` : ''}
      }
      LIMIT 1
    `;
    const result = await this.executeSparql(query);
    return result[0]?.book?.value?.split('/').pop() || null;
  }

  // 获取书籍的所有角色
  async getBookCharacters(bookQid: string): Promise<WikidataCharacter[]> {
    const query = `
      SELECT ?character ?characterLabel ?description ?image WHERE {
        wd:${bookQid} wdt:P674 ?character.
        OPTIONAL {
          ?character schema:description ?description.
          FILTER(LANG(?description) = "zh" || LANG(?description) = "en")
        }
        OPTIONAL { ?character wdt:P18 ?image. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
      }
    `;

    const results = await this.executeSparql(query);
    return results.map(r => ({
      qid: r.character.value.split('/').pop(),
      name: r.characterLabel.value,
      description: r.description?.value,
      imageUrl: r.image?.value,
    }));
  }

  // 获取角色之间的关系
  async getCharacterRelationships(characterQids: string[]): Promise<WikidataRelationship[]> {
    const qidList = characterQids.map(q => `wd:${q}`).join(' ');
    const relationshipProperties = [
      'P22',   // father
      'P25',   // mother
      'P26',   // spouse
      'P40',   // child
      'P3373', // sibling
      'P451',  // partner
      'P1038', // relative
    ];

    const query = `
      SELECT ?char1 ?char2 ?prop ?propLabel WHERE {
        VALUES ?char1 { ${qidList} }
        VALUES ?char2 { ${qidList} }
        VALUES ?prop { ${relationshipProperties.map(p => `wdt:${p}`).join(' ')} }
        ?char1 ?prop ?char2.
        FILTER(?char1 != ?char2)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
      }
    `;

    const results = await this.executeSparql(query);
    return results.map(r => ({
      fromQid: r.char1.value.split('/').pop(),
      toQid: r.char2.value.split('/').pop(),
      propertyId: r.prop.value.split('/').pop(),
      propertyLabel: r.propLabel.value,
    }));
  }

  private async executeSparql(query: string): Promise<any[]> {
    const response = await fetch(this.SPARQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
      },
      body: `query=${encodeURIComponent(query)}`,
    });

    const data = await response.json();
    return data.results.bindings;
  }
}
```

#### 9.2.6 优缺点分析

| 优点 | 缺点 |
|------|------|
| ✅ 数据质量高，经人工审核 | ❌ 仅覆盖知名书籍 |
| ✅ 完全免费，开放数据 | ❌ 中文网文/小众书籍无数据 |
| ✅ 结构化关系数据丰富 | ❌ 更新可能滞后 |
| ✅ 支持多语言 | ❌ 需要 ISBN/标题精确匹配 |
| ✅ SPARQL 查询灵活 | ❌ API 调用有频率限制 |

---

### 9.3 方案二：BookNLP（传统 NLP 工具）

#### 9.3.1 工具介绍

[BookNLP](https://github.com/booknlp/booknlp) 是专为书籍长文本设计的 NLP 流水线，由 David Bamman 开发，不使用大语言模型，而是基于传统机器学习方法：

- **命名实体识别 (NER)**：识别人名、地名、组织名等
- **共指消解 (Coreference Resolution)**：将 "Tom"、"Tom Sawyer"、"Mr. Sawyer" 关联为同一人物
- **引语归属 (Quote Attribution)**：识别对话属于哪个角色
- **角色性别推断**：基于代词使用推断角色性别

#### 9.3.2 技术原理

```
BookNLP 技术栈（非 AI/LLM）：
├── spaCy - 词性标注、依存解析
├── 条件随机场 (CRF) - 命名实体识别
├── 规则 + 机器学习 - 共指消解
└── 训练数据: LitBank (19-20世纪英文小说标注数据)
```

#### 9.3.3 输出数据格式

```json
// BookNLP 输出的角色信息 (.book 文件)
{
  "characters": [
    {
      "id": "ELIZABETH_BENNET",
      "names": ["Elizabeth", "Lizzy", "Miss Bennet", "Miss Elizabeth"],
      "count": 847,
      "gender": "female",
      "agent_actions": ["said", "thought", "walked", "replied"],
      "patient_actions": ["was told", "was asked"]
    }
  ]
}
```

#### 9.3.4 集成实现

```typescript
// BookNLPService.ts - 通过子进程调用 Python BookNLP

import { spawn } from 'child_process';
import * as fs from 'fs';

interface BookNLPCharacter {
  id: string;
  names: string[];
  count: number;
  gender: 'male' | 'female' | 'unknown';
}

@Injectable()
export class BookNLPService {
  private readonly BOOKNLP_PATH = '/path/to/booknlp/env/bin/python';

  async extractCharacters(bookText: string, bookId: string): Promise<BookNLPCharacter[]> {
    // 1. 将书籍文本写入临时文件
    const inputPath = `/tmp/booknlp_input_${bookId}.txt`;
    const outputDir = `/tmp/booknlp_output_${bookId}`;

    await fs.promises.writeFile(inputPath, bookText);
    await fs.promises.mkdir(outputDir, { recursive: true });

    // 2. 调用 BookNLP
    await this.runBookNLP(inputPath, outputDir, bookId);

    // 3. 解析输出
    const entitiesPath = `${outputDir}/${bookId}.book`;
    const entitiesData = await fs.promises.readFile(entitiesPath, 'utf-8');

    return this.parseBookNLPOutput(entitiesData);
  }

  private runBookNLP(inputPath: string, outputDir: string, bookId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.BOOKNLP_PATH, [
        '-m', 'booknlp.booknlp',
        '--input-file', inputPath,
        '--output-directory', outputDir,
        '--book-id', bookId,
        '--model', 'small'  // 或 'big' 需要 GPU
      ]);

      process.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`BookNLP exited with code ${code}`));
      });
    });
  }

  private parseBookNLPOutput(data: string): BookNLPCharacter[] {
    // 解析 BookNLP 输出格式
    // ...实现解析逻辑
    return [];
  }
}
```

#### 9.3.5 关系提取（需要额外处理）

BookNLP 本身不直接输出人物关系，需要通过以下方式推断：

```typescript
// 基于共现分析推断关系
async inferRelationshipsFromCooccurrence(
  characters: BookNLPCharacter[],
  bookText: string
): Promise<InferredRelationship[]> {
  const relationships: InferredRelationship[] = [];
  const sentences = this.splitIntoSentences(bookText);

  // 构建共现矩阵
  const cooccurrenceMatrix = new Map<string, Map<string, number>>();

  for (const sentence of sentences) {
    const presentChars = characters.filter(c =>
      c.names.some(name => sentence.includes(name))
    );

    // 同一句子中出现的角色可能有关系
    for (let i = 0; i < presentChars.length; i++) {
      for (let j = i + 1; j < presentChars.length; j++) {
        this.incrementCooccurrence(cooccurrenceMatrix, presentChars[i].id, presentChars[j].id);
      }
    }
  }

  // 基于共现频率推断关系强度
  for (const [char1, relations] of cooccurrenceMatrix) {
    for (const [char2, count] of relations) {
      if (count > 5) {  // 阈值
        relationships.push({
          from: char1,
          to: char2,
          strength: Math.min(count / 10, 10),
          type: 'SOCIAL',  // 默认为社交关系
        });
      }
    }
  }

  return relationships;
}

// 基于对话分析推断关系
async inferRelationshipsFromDialogue(
  quotes: BookNLPQuote[]
): Promise<InferredRelationship[]> {
  // 分析对话模式推断关系
  // 如：A 经常对 B 说话 → A 和 B 关系密切
  // ...
}
```

#### 9.3.6 优缺点分析

| 优点 | 缺点 |
|------|------|
| ✅ 可处理任意书籍文本 | ❌ 仅支持英文（有法语版本） |
| ✅ 不依赖外部 API | ❌ 关系推断不直接，需要额外处理 |
| ✅ 开源免费 | ❌ 需要服务器运行 Python |
| ✅ 共指消解效果好 | ❌ 处理速度较慢（一本书约 5-10 分钟） |
| ✅ 可本地部署 | ❌ 准确率约 88-90%，有误识别 |

---

### 9.4 方案三：人工编辑策划

#### 9.4.1 工作流程

```
人工编辑工作流：
├── 1. 选书阶段
│   ├── 优先处理热门/付费书籍
│   └── 建立优先级队列
├── 2. 信息收集
│   ├── 阅读原著/使用阅读笔记
│   ├── 参考 SparkNotes/LitCharts 等资源
│   └── 查阅 Wikipedia/百度百科
├── 3. 数据录入
│   ├── 使用后台管理系统
│   ├── 填写人物信息表单
│   └── 标注人物关系
├── 4. 质量审核
│   ├── 编辑交叉审核
│   └── 专家抽查
└── 5. 发布上线
```

#### 9.4.2 后台管理界面设计

```typescript
// 人物编辑表单字段
interface CharacterEditForm {
  // 基本信息
  name: string;
  aliases: string[];
  role: CharacterRole;
  importance: number;

  // 描述信息
  description: string;        // 简介
  appearance: string;         // 外貌
  personality: string;        // 性格

  // 关系
  relationships: {
    targetCharacterId: string;
    type: RelationshipType;
    subType: string;          // 如：父子、师徒
    description: string;
    spoilerLevel: number;
  }[];

  // 剧透控制
  firstAppearanceChapter: string;
  majorEvents: {
    chapter: string;
    event: string;
    spoilerLevel: number;
  }[];
}
```

#### 9.4.3 成本估算

| 项目 | 时间/本书 | 成本/本书 |
|------|----------|----------|
| 简单书籍（<10人物） | 0.5-1 小时 | ¥50-100 |
| 中等书籍（10-30人物） | 2-4 小时 | ¥200-400 |
| 复杂书籍（>30人物） | 6-10 小时 | ¥600-1000 |

#### 9.4.4 优缺点分析

| 优点 | 缺点 |
|------|------|
| ✅ 数据质量最高 | ❌ 成本高，难以规模化 |
| ✅ 可处理任何语言/类型书籍 | ❌ 速度慢 |
| ✅ 关系标注精准 | ❌ 需要专业编辑团队 |
| ✅ 可控制剧透级别 | ❌ 人力资源有限 |

---

### 9.5 方案四：众包社区

#### 9.5.1 借鉴案例

- **Wookieepedia**：星球大战粉丝维基，包含详细角色关系
- **Fandom Wikis**：各类作品的粉丝维基
- **豆瓣读书**：用户评论中包含角色讨论

#### 9.5.2 实现方式

```
用户贡献系统：
├── 1. 激励机制
│   ├── 积分奖励
│   ├── 贡献者徽章
│   └── 会员权益
├── 2. 贡献入口
│   ├── 阅读页面 "补充人物" 按钮
│   ├── 人物页面 "编辑" 功能
│   └── 关系图 "添加关系" 功能
├── 3. 审核机制
│   ├── 社区投票
│   ├── 可信用户直接通过
│   └── 管理员最终审核
└── 4. 版本控制
    ├── 编辑历史
    └── 回滚功能
```

#### 9.5.3 数据模型扩展

```prisma
// 用户贡献相关模型
model CharacterContribution {
  id              String    @id @default(uuid())

  // 贡献类型
  type            ContributionType  // ADD_CHARACTER, EDIT_CHARACTER, ADD_RELATIONSHIP

  // 目标
  characterId     String?
  relationshipId  String?

  // 贡献内容
  data            Json

  // 审核状态
  status          ContributionStatus  // PENDING, APPROVED, REJECTED
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectReason    String?

  // 贡献者
  contributorId   String
  contributor     User      @relation(fields: [contributorId], references: [id])

  createdAt       DateTime  @default(now())
}

enum ContributionType {
  ADD_CHARACTER
  EDIT_CHARACTER
  ADD_RELATIONSHIP
  EDIT_RELATIONSHIP
}

enum ContributionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

### 9.6 推荐方案：混合策略

#### 9.6.1 分层数据来源

```
数据来源优先级：
┌─────────────────────────────────────────────────────────────────────────┐
│                         混合数据源架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  优先级 1: Wikidata/DBpedia                                              │
│  ├── 适用: 经典文学、知名当代作品                                          │
│  ├── 特点: 免费、高质量、结构化                                           │
│  └── 覆盖: ~5000+ 本知名书籍                                              │
│                                                                          │
│  优先级 2: 人工编辑精选                                                   │
│  ├── 适用: 热门付费书籍、独家内容                                          │
│  ├── 特点: 最高质量、完整关系                                             │
│  └── 覆盖: ~100-500 本精选书籍                                            │
│                                                                          │
│  优先级 3: BookNLP 自动提取                                               │
│  ├── 适用: 英文书籍、无其他数据源时                                        │
│  ├── 特点: 自动化、可扩展                                                 │
│  └── 覆盖: 所有英文书籍                                                   │
│                                                                          │
│  优先级 4: 用户众包                                                       │
│  ├── 适用: 补充和修正                                                     │
│  ├── 特点: 持续改进、社区参与                                             │
│  └── 覆盖: 长尾书籍                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 9.6.2 数据融合服务

```typescript
// CharacterDataFusionService.ts

@Injectable()
export class CharacterDataFusionService {
  constructor(
    private wikidataService: WikidataCharacterService,
    private bookNLPService: BookNLPService,
    private editorialService: EditorialCharacterService,
    private communityService: CommunityContributionService,
  ) {}

  async getCharacterGraph(bookId: string): Promise<CharacterGraph> {
    // 1. 检查是否有人工编辑的数据（最高优先级）
    const editorialData = await this.editorialService.getCharacters(bookId);
    if (editorialData && editorialData.isComplete) {
      return this.formatGraph(editorialData);
    }

    // 2. 尝试从 Wikidata 获取
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    const wikidataGraph = await this.wikidataService.getCharacterGraph(
      book.title,
      book.isbn
    );

    if (wikidataGraph && wikidataGraph.characters.length > 0) {
      // 合并社区贡献的补充数据
      return this.mergeWithCommunityData(wikidataGraph, bookId);
    }

    // 3. 使用 BookNLP 提取（仅英文）
    if (book.language === 'en') {
      const bookText = await this.getBookText(bookId);
      const nlpData = await this.bookNLPService.extractCharacters(bookText, bookId);
      return this.formatNLPGraph(nlpData);
    }

    // 4. 返回社区贡献的数据（如有）
    return this.communityService.getCharacterGraph(bookId);
  }

  private async mergeWithCommunityData(
    baseGraph: CharacterGraph,
    bookId: string
  ): Promise<CharacterGraph> {
    const communityAdditions = await this.communityService.getApprovedContributions(bookId);

    // 合并社区贡献的额外角色和关系
    for (const contribution of communityAdditions) {
      if (contribution.type === 'ADD_CHARACTER') {
        baseGraph.nodes.push(contribution.data);
      } else if (contribution.type === 'ADD_RELATIONSHIP') {
        baseGraph.edges.push(contribution.data);
      }
    }

    return baseGraph;
  }
}
```

#### 9.6.3 数据源标识

```typescript
// 在返回数据中标明数据来源，增加透明度
interface CharacterGraphWithSource extends CharacterGraph {
  dataSource: {
    primary: 'wikidata' | 'editorial' | 'booknlp' | 'community';
    contributors?: string[];  // 贡献者列表
    lastUpdated: string;
    reliability: 'high' | 'medium' | 'low';
  };
}
```

---

### 9.7 各方案对比总结

| 维度 | Wikidata | BookNLP | 人工编辑 | 众包 | 混合方案 |
|------|----------|---------|----------|------|----------|
| **覆盖范围** | 知名书籍 | 英文书籍 | 精选书籍 | 长尾书籍 | 全部书籍 |
| **数据质量** | 高 | 中 | 最高 | 中-高 | 高 |
| **关系完整度** | 中 | 低 | 高 | 中 | 高 |
| **中文支持** | 部分 | ❌ | ✅ | ✅ | ✅ |
| **成本** | 低 | 中 | 高 | 中 | 中 |
| **可扩展性** | 高 | 中 | 低 | 高 | 高 |
| **维护成本** | 低 | 中 | 高 | 中 | 中 |

---

### 9.8 实施建议

#### Phase 1: MVP（快速上线）
1. 集成 Wikidata API，覆盖经典/知名书籍
2. 人工编辑 Top 50 热门书籍
3. 支持用户反馈"数据不准确"

#### Phase 2: 扩展覆盖
1. 部署 BookNLP 服务处理英文书籍
2. 开放用户贡献功能
3. 建立审核流程

#### Phase 3: 持续优化
1. 根据用户贡献改进数据
2. 考虑接入 AI 辅助（可选）
3. 探索与出版社合作获取官方数据

---

### 9.9 相关资源链接

- [Wikidata SPARQL 教程](https://www.wikidata.org/wiki/Wikidata:SPARQL_tutorial)
- [Wikidata P674 (characters) 属性](https://www.wikidata.org/wiki/Property:P674)
- [BookNLP GitHub](https://github.com/booknlp/booknlp)
- [CMU Book Summary Dataset](https://www.cs.cmu.edu/~dbamman/booksummaries.html)
- [HTRC BookNLP Dataset](https://wiki.htrc.illinois.edu/display/COM/HTRC+BookNLP+Dataset+for+English-Language+Fiction)
- [Stanford NER](https://nlp.stanford.edu/software/CRF-NER.html)
- [DBpedia](http://dbpedia.org/)

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 📝 设计中 | 0% | 2025-12-27 | 设计文档完成 |
