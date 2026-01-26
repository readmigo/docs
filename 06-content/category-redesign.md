# Category System Redesign - Full Stack

## 1. Problem Statement

### Current Issues

1. **BrowseBooksView displays Chinese categories** - The current implementation shows categories with Chinese names, which violates the rule that only dashboard can display Chinese content.

2. **Multi-level categories displayed simultaneously** - Current UI shows all levels at once, but categories have hierarchical constraints:
   - A user should first see Level 0 (root) categories
   - Only after selecting a Level 0 category should they see its Level 1 children
   - Only after selecting a Level 1 category should they see its Level 2 children

3. **No language-based content separation** - There's no clean way to separate English vs Chinese content at the category level.

### Future Requirements

- Chinese content will be added as a **Level 0 category** (e.g., "Chinese Content" / "中文内容")
- Under this L0 category, L1 will be genres like: History, Literature, Fiction, etc.
- L2 and beyond will be more specific sub-genres
- The hierarchical structure remains the same for both English and Chinese content

---

## 2. Data Model Redesign

### 2.1 Category Table Changes

```sql
-- Current schema (no changes needed to structure)
Category {
  id          UUID PRIMARY KEY
  name        VARCHAR(100)       -- Chinese name (for dashboard/admin)
  nameEn      VARCHAR(100)       -- English name (for client apps)
  slug        VARCHAR(100) UNIQUE
  description TEXT
  parentId    UUID REFERENCES Category(id)
  level       INT DEFAULT 0      -- 0=root, 1=secondary, 2=tertiary
  language    VARCHAR(10) DEFAULT 'en'  -- CHANGE: Default to 'en' instead of 'all'
  system      VARCHAR(20) DEFAULT 'modern'
  iconUrl     VARCHAR(500)
  coverUrl    VARCHAR(500)
  sortOrder   INT DEFAULT 0
  isActive    BOOLEAN DEFAULT true
  bookCount   INT DEFAULT 0
  createdAt   TIMESTAMP
  updatedAt   TIMESTAMP
}
```

### 2.2 New Field Semantics

| Field | Purpose | Values |
|-------|---------|--------|
| `language` | Content language filter | `'en'` (English), `'zh'` (Chinese), `'all'` (both) |
| `level` | Hierarchy depth | 0 = Root, 1 = Secondary, 2 = Tertiary |
| `parentId` | Parent category reference | NULL for root categories |

### 2.3 Category Hierarchy Example

```
Level 0 (Root)                Level 1              Level 2
─────────────────────────────────────────────────────────────
Fiction (en)          ──────► Mystery      ──────► Cozy Mystery
                              Thriller             Hard-boiled
                              Romance              Police Procedural

Non-Fiction (en)      ──────► History      ──────► Ancient History
                              Science              Modern History
                              Biography

Chinese Content (zh)  ──────► 历史         ──────► 古代史
                              文学                  现代史
                              哲学
```

---

## 3. API Redesign

### 3.1 Endpoint Changes

#### GET `/categories/root` - Get Root Categories
```typescript
// Query Parameters
interface RootCategoriesQuery {
  language?: 'en' | 'zh' | 'all';  // Default: 'en' for clients, 'all' for dashboard
}

// Response
interface RootCategoriesResponse {
  categories: CategoryDto[];
}
```

#### GET `/categories/:id/children` - Get Children of Category
```typescript
// No change to parameters, but enforce that:
// - Only returns direct children (level = parent.level + 1)
// - Only returns active categories
// - Ordered by sortOrder

// Response
interface ChildrenResponse {
  parent: CategoryDto;
  children: CategoryDto[];
}
```

#### GET `/categories/tree` - Get Full Tree (Dashboard Only)
```typescript
// Query Parameters
interface TreeQuery {
  language?: 'en' | 'zh' | 'all';  // Default: 'all' for dashboard
  maxDepth?: number;               // Optional: limit depth
}

// Response - unchanged but filtered by language
interface TreeResponse {
  categories: CategoryWithChildrenDto[];
}
```

#### GET `/categories/:id/books` - Get Books in Category
```typescript
// Query Parameters (existing)
interface CategoryBooksQuery {
  page?: number;
  limit?: number;
  includeSubcategories?: boolean;  // Whether to include books from child categories
  minDifficulty?: number;
  maxDifficulty?: number;
  sortBy?: 'title' | 'createdAt' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}
```

### 3.2 New Endpoint: Cascading Category Selection

#### GET `/categories/cascade` - Get Category Path
```typescript
// Get the current selection path and available options at each level

// Query Parameters
interface CascadeQuery {
  language?: 'en' | 'zh';          // Required for client, default 'en'
  selectedIds?: string[];          // Array of selected category IDs in order [L0, L1, L2]
}

// Response
interface CascadeResponse {
  levels: CascadeLevel[];
  selectedPath: CategoryDto[];     // Full path of selected categories
  currentBooks?: {                 // Books at deepest selected level
    total: number;
    preview: BookDto[];            // First few books
  };
}

interface CascadeLevel {
  level: number;                   // 0, 1, 2
  categories: CategoryDto[];       // Available categories at this level
  selectedId?: string;             // Currently selected category ID
  isSelectable: boolean;           // False if parent not selected yet
}
```

**Example Response:**
```json
{
  "levels": [
    {
      "level": 0,
      "categories": [
        { "id": "fiction-id", "nameEn": "Fiction", "bookCount": 150 },
        { "id": "nonfiction-id", "nameEn": "Non-Fiction", "bookCount": 80 }
      ],
      "selectedId": "fiction-id",
      "isSelectable": true
    },
    {
      "level": 1,
      "categories": [
        { "id": "mystery-id", "nameEn": "Mystery", "bookCount": 45 },
        { "id": "thriller-id", "nameEn": "Thriller", "bookCount": 30 }
      ],
      "selectedId": null,
      "isSelectable": true
    },
    {
      "level": 2,
      "categories": [],
      "selectedId": null,
      "isSelectable": false
    }
  ],
  "selectedPath": [
    { "id": "fiction-id", "nameEn": "Fiction", "level": 0 }
  ],
  "currentBooks": {
    "total": 150,
    "preview": [...]
  }
}
```

---

## 4. Backend Implementation

### 4.1 Service Changes

```typescript
// categories.service.ts

@Injectable()
export class CategoriesService {

  // NEW: Get root categories filtered by language
  async getRootCategories(language: 'en' | 'zh' | 'all' = 'en'): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = {
      parentId: null,
      isActive: true,
    };

    if (language !== 'all') {
      where.language = language;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  // NEW: Cascade selection endpoint
  async getCascade(
    language: 'en' | 'zh',
    selectedIds: string[] = []
  ): Promise<CascadeResponse> {
    const levels: CascadeLevel[] = [];
    const selectedPath: Category[] = [];

    // Level 0 - Root categories
    const rootCategories = await this.getRootCategories(language);
    const selectedL0Id = selectedIds[0];
    const selectedL0 = selectedL0Id
      ? rootCategories.find(c => c.id === selectedL0Id)
      : null;

    levels.push({
      level: 0,
      categories: rootCategories,
      selectedId: selectedL0?.id,
      isSelectable: true,
    });

    if (selectedL0) {
      selectedPath.push(selectedL0);

      // Level 1 - Children of selected L0
      const l1Categories = await this.getChildren(selectedL0.id);
      const selectedL1Id = selectedIds[1];
      const selectedL1 = selectedL1Id
        ? l1Categories.find(c => c.id === selectedL1Id)
        : null;

      levels.push({
        level: 1,
        categories: l1Categories,
        selectedId: selectedL1?.id,
        isSelectable: true,
      });

      if (selectedL1) {
        selectedPath.push(selectedL1);

        // Level 2 - Children of selected L1
        const l2Categories = await this.getChildren(selectedL1.id);
        const selectedL2Id = selectedIds[2];
        const selectedL2 = selectedL2Id
          ? l2Categories.find(c => c.id === selectedL2Id)
          : null;

        levels.push({
          level: 2,
          categories: l2Categories,
          selectedId: selectedL2?.id,
          isSelectable: true,
        });

        if (selectedL2) {
          selectedPath.push(selectedL2);
        }
      } else {
        levels.push({
          level: 2,
          categories: [],
          selectedId: null,
          isSelectable: false,  // Cannot select L2 without L1
        });
      }
    } else {
      // No L0 selected - L1 and L2 not selectable
      levels.push({
        level: 1,
        categories: [],
        selectedId: null,
        isSelectable: false,
      });
      levels.push({
        level: 2,
        categories: [],
        selectedId: null,
        isSelectable: false,
      });
    }

    // Get books for deepest selected category
    const deepestCategory = selectedPath[selectedPath.length - 1];
    let currentBooks = null;

    if (deepestCategory) {
      const books = await this.getCategoryBooks(deepestCategory.id, {
        page: 1,
        limit: 6,
        includeSubcategories: true,
      });
      currentBooks = {
        total: books.total,
        preview: books.items,
      };
    }

    return { levels, selectedPath, currentBooks };
  }
}
```

### 4.2 Controller Changes

```typescript
// categories.controller.ts

@Controller('categories')
export class CategoriesController {

  @Get('root')
  async getRootCategories(
    @Query('language') language: 'en' | 'zh' | 'all' = 'en'
  ) {
    return this.categoriesService.getRootCategories(language);
  }

  @Get('cascade')
  async getCascade(
    @Query('language') language: 'en' | 'zh' = 'en',
    @Query('selectedIds') selectedIdsParam?: string
  ) {
    const selectedIds = selectedIdsParam
      ? selectedIdsParam.split(',').filter(Boolean)
      : [];
    return this.categoriesService.getCascade(language, selectedIds);
  }
}
```

---

## 5. iOS Client Implementation

### 5.1 New Models

```swift
// CascadeCategory.swift

struct CascadeLevel: Codable {
    let level: Int
    let categories: [Category]
    let selectedId: String?
    let isSelectable: Bool
}

struct CascadeResponse: Codable {
    let levels: [CascadeLevel]
    let selectedPath: [Category]
    let currentBooks: CascadeBooksPreview?
}

struct CascadeBooksPreview: Codable {
    let total: Int
    let preview: [Book]
}
```

### 5.2 Updated BookListsManager

```swift
// BookListsManager.swift

@MainActor
class BookListsManager: ObservableObject {
    // Cascade state
    @Published var cascadeLevels: [CascadeLevel] = []
    @Published var selectedCategoryPath: [Category] = []
    @Published var currentCategoryBooks: CascadeBooksPreview?

    // Selection state
    @Published var selectedLevel0Id: String?
    @Published var selectedLevel1Id: String?
    @Published var selectedLevel2Id: String?

    func fetchCascadeCategories() async {
        let selectedIds = [selectedLevel0Id, selectedLevel1Id, selectedLevel2Id]
            .compactMap { $0 }
            .joined(separator: ",")

        let endpoint = "/categories/cascade?language=en&selectedIds=\(selectedIds)"

        do {
            let response: CascadeResponse = try await apiClient.get(endpoint)
            self.cascadeLevels = response.levels
            self.selectedCategoryPath = response.selectedPath
            self.currentCategoryBooks = response.currentBooks
        } catch {
            print("Failed to fetch cascade categories: \(error)")
        }
    }

    func selectCategory(at level: Int, categoryId: String?) {
        switch level {
        case 0:
            selectedLevel0Id = categoryId
            selectedLevel1Id = nil  // Reset child selections
            selectedLevel2Id = nil
        case 1:
            selectedLevel1Id = categoryId
            selectedLevel2Id = nil  // Reset child selection
        case 2:
            selectedLevel2Id = categoryId
        default:
            break
        }

        Task {
            await fetchCascadeCategories()
        }
    }

    func clearSelection() {
        selectedLevel0Id = nil
        selectedLevel1Id = nil
        selectedLevel2Id = nil
        Task {
            await fetchCascadeCategories()
        }
    }
}
```

### 5.3 New BrowseBooksView Design

```swift
// BrowseBooksView.swift

struct BrowseBooksView: View {
    @StateObject private var manager = BookListsManager()

    var body: some View {
        VStack(spacing: 0) {
            // Category Cascade Selector
            CategoryCascadeSelector(
                levels: manager.cascadeLevels,
                onSelect: { level, categoryId in
                    manager.selectCategory(at: level, categoryId: categoryId)
                }
            )

            Divider()

            // Selected Path Breadcrumb
            if !manager.selectedCategoryPath.isEmpty {
                CategoryBreadcrumb(
                    path: manager.selectedCategoryPath,
                    onTapLevel: { level in
                        manager.selectCategory(at: level, categoryId: nil)
                    }
                )
            }

            // Books Grid
            if let books = manager.currentCategoryBooks {
                BooksGridView(
                    total: books.total,
                    books: books.preview,
                    onLoadMore: { /* pagination */ }
                )
            } else {
                // Empty state - prompt to select category
                CategorySelectionPrompt()
            }
        }
        .task {
            await manager.fetchCascadeCategories()
        }
    }
}

// MARK: - Category Cascade Selector

struct CategoryCascadeSelector: View {
    let levels: [CascadeLevel]
    let onSelect: (Int, String?) -> Void

    var body: some View {
        VStack(spacing: 12) {
            ForEach(levels, id: \.level) { level in
                if level.isSelectable && !level.categories.isEmpty {
                    CategoryLevelRow(
                        level: level,
                        onSelect: { categoryId in
                            onSelect(level.level, categoryId)
                        }
                    )
                }
            }
        }
        .padding()
    }
}

struct CategoryLevelRow: View {
    let level: CascadeLevel
    let onSelect: (String?) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Level Header
            Text(levelTitle)
                .font(.caption)
                .foregroundColor(.secondary)

            // Category Chips (Horizontal Scroll)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    // "All" option to clear selection at this level
                    CategoryChip(
                        title: "All",
                        isSelected: level.selectedId == nil,
                        onTap: { onSelect(nil) }
                    )

                    ForEach(level.categories) { category in
                        CategoryChip(
                            title: category.displayName,
                            bookCount: category.bookCount,
                            isSelected: category.id == level.selectedId,
                            onTap: { onSelect(category.id) }
                        )
                    }
                }
            }
        }
    }

    var levelTitle: String {
        switch level.level {
        case 0: return "Category"
        case 1: return "Sub-category"
        case 2: return "Genre"
        default: return "Level \(level.level)"
        }
    }
}

struct CategoryChip: View {
    let title: String
    var bookCount: Int? = nil
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 4) {
                Text(title)
                if let count = bookCount {
                    Text("(\(count))")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? Color.accentColor : Color.gray.opacity(0.15))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(16)
        }
    }
}
```

---

## 6. Dashboard Changes

### 6.1 Category List - Show Both Names

The dashboard should continue to show both Chinese and English names, as it's the only place where Chinese content is visible.

```tsx
// pages/categories/index.tsx

// No major changes needed - dashboard already shows both names
// Ensure the tree view and CRUD operations work with the new language field

const CategoryNameField = ({ record }: { record: Category }) => {
  const indent = record.level * 24;
  return (
    <span style={{ marginLeft: indent }}>
      {record.name}
      {record.nameEn && record.nameEn !== record.name && (
        <span style={{ color: '#888', marginLeft: 8 }}>
          ({record.nameEn})
        </span>
      )}
    </span>
  );
};
```

### 6.2 Category Form - Language Field

```tsx
// Add language selector to category create/edit forms

const LANGUAGE_CHOICES = [
  { id: 'en', name: 'English Content' },
  { id: 'zh', name: 'Chinese Content (中文)' },
  { id: 'all', name: 'All Languages' },
];

// In CategoryCreate/CategoryEdit
<SelectInput
  source="language"
  choices={LANGUAGE_CHOICES}
  defaultValue="en"
  helperText="Which language content does this category contain?"
/>
```

---

## 7. Database Migration

### 7.1 Migration Script

```sql
-- Migration: Update category language defaults

-- Step 1: Update existing categories to have proper language values
-- Assuming all existing categories are English content
UPDATE "Category"
SET language = 'en'
WHERE language = 'all' OR language IS NULL;

-- Step 2: Set default for new categories
ALTER TABLE "Category"
ALTER COLUMN language SET DEFAULT 'en';
```

### 7.2 Prisma Schema Update

```prisma
// schema.prisma

model Category {
  // ... existing fields ...

  language   String   @default("en") @db.VarChar(10)  // Changed from 'all' to 'en'

  // ... rest of model ...
}
```

---

## 8. UI/UX Flow

### 8.1 Browse Books - Category Selection Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Browse Books                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Category:  [All] [Fiction✓] [Non-Fiction] [Self-Help]     │
│                                                             │
│  Sub-category: [All] [Mystery] [Thriller✓] [Romance]       │
│                                                             │
│  Genre: [All] [Psychological] [Legal] [Spy✓]               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📍 Fiction › Thriller › Spy                    Clear All   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Showing 24 books                                           │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Book   │  │  Book   │  │  Book   │  │  Book   │       │
│  │  Cover  │  │  Cover  │  │  Cover  │  │  Cover  │       │
│  │         │  │         │  │         │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│   Title 1      Title 2      Title 3      Title 4          │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Book   │  │  Book   │  │  Book   │  │  Book   │       │
│  │  Cover  │  │  Cover  │  │  Cover  │  │  Cover  │       │
│  │         │  │         │  │         │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│   Title 5      Title 6      Title 7      Title 8          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Interaction Rules

1. **Initial State**: Only Level 0 (root) categories are shown
2. **Select L0**: Level 1 categories appear, showing only children of selected L0
3. **Select L1**: Level 2 categories appear, showing only children of selected L1
4. **Clear Selection**: Clicking "All" at any level clears that level and all levels below
5. **Breadcrumb**: Shows current path, clickable to jump back to any level

### 8.3 Future Chinese Content Support

When Chinese content is added:

```
┌─────────────────────────────────────────────────────────────┐
│  Category:  [All] [Fiction] [Non-Fiction] [中文内容✓]       │
├─────────────────────────────────────────────────────────────┤
│  Sub-category: [All] [历史✓] [文学] [哲学] [小说]           │
├─────────────────────────────────────────────────────────────┤
│  Genre: [All] [古代史] [现代史✓] [近代史]                   │
├─────────────────────────────────────────────────────────────┤
│  📍 中文内容 › 历史 › 现代史                    Clear All   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Checklist

### Phase 1: Backend & Database
- [ ] Update Prisma schema (language default)
- [ ] Run migration to update existing categories
- [ ] Add `/categories/cascade` endpoint
- [ ] Update `/categories/root` to accept language filter
- [ ] Update caching keys to include language
- [ ] Add unit tests for cascade logic

### Phase 2: Dashboard
- [ ] Add language selector to category forms
- [ ] Update category list to show language column
- [ ] Add filter by language in list view
- [ ] Validate parent-child language consistency

### Phase 3: iOS Client
- [ ] Add CascadeResponse models
- [ ] Update BookListsManager with cascade logic
- [ ] Implement CategoryCascadeSelector component
- [ ] Implement CategoryBreadcrumb component
- [ ] Replace current BrowseBooksView with new design
- [ ] Add localization for level labels
- [ ] Test cascading selection behavior

### Phase 4: Testing & Validation
- [ ] Test category cascade with real data
- [ ] Verify no Chinese categories appear in client
- [ ] Test book filtering at each level
- [ ] Performance test with large category trees
- [ ] Test cache invalidation on category updates

---

## 10. API Response Examples

### GET `/categories/cascade?language=en`

Initial state (nothing selected):

```json
{
  "levels": [
    {
      "level": 0,
      "categories": [
        { "id": "uuid-1", "nameEn": "Fiction", "slug": "fiction", "bookCount": 150, "level": 0 },
        { "id": "uuid-2", "nameEn": "Non-Fiction", "slug": "non-fiction", "bookCount": 80, "level": 0 },
        { "id": "uuid-3", "nameEn": "Self-Help", "slug": "self-help", "bookCount": 45, "level": 0 }
      ],
      "selectedId": null,
      "isSelectable": true
    },
    {
      "level": 1,
      "categories": [],
      "selectedId": null,
      "isSelectable": false
    },
    {
      "level": 2,
      "categories": [],
      "selectedId": null,
      "isSelectable": false
    }
  ],
  "selectedPath": [],
  "currentBooks": null
}
```

### GET `/categories/cascade?language=en&selectedIds=uuid-1`

After selecting "Fiction" (L0):

```json
{
  "levels": [
    {
      "level": 0,
      "categories": [
        { "id": "uuid-1", "nameEn": "Fiction", "slug": "fiction", "bookCount": 150, "level": 0 },
        { "id": "uuid-2", "nameEn": "Non-Fiction", "slug": "non-fiction", "bookCount": 80, "level": 0 },
        { "id": "uuid-3", "nameEn": "Self-Help", "slug": "self-help", "bookCount": 45, "level": 0 }
      ],
      "selectedId": "uuid-1",
      "isSelectable": true
    },
    {
      "level": 1,
      "categories": [
        { "id": "uuid-11", "nameEn": "Mystery", "slug": "mystery", "bookCount": 45, "level": 1 },
        { "id": "uuid-12", "nameEn": "Thriller", "slug": "thriller", "bookCount": 30, "level": 1 },
        { "id": "uuid-13", "nameEn": "Romance", "slug": "romance", "bookCount": 40, "level": 1 },
        { "id": "uuid-14", "nameEn": "Science Fiction", "slug": "sci-fi", "bookCount": 35, "level": 1 }
      ],
      "selectedId": null,
      "isSelectable": true
    },
    {
      "level": 2,
      "categories": [],
      "selectedId": null,
      "isSelectable": false
    }
  ],
  "selectedPath": [
    { "id": "uuid-1", "nameEn": "Fiction", "slug": "fiction", "level": 0 }
  ],
  "currentBooks": {
    "total": 150,
    "preview": [
      { "id": "book-1", "title": "The Great Mystery", "coverUrl": "..." },
      { "id": "book-2", "title": "Thrilling Adventure", "coverUrl": "..." }
    ]
  }
}
```

---

## 11. Open Questions

1. **Should L0 selection be required?** Or can users see all books without selecting any category?
   - Recommendation: Allow "All" at L0 to show all English books

2. **How to handle categories with no books?** Hide them or show with 0 count?
   - Recommendation: Show with 0 count, let user decide

3. **Should book count include subcategories?**
   - Current: Yes, `includeSubcategories: true` by default
   - Recommendation: Keep this behavior, update counts recursively

4. **Cache invalidation strategy when categories change?**
   - Current: 1-hour TTL
   - Recommendation: Add webhook/event to invalidate on category CRUD

---

## 12. Chinese Content Feature Flag System

### 12.1 Design Goals

| Goal | Description |
| ---- | ----------- |
| **Single Source of Truth** | One configuration controls the entire stack |
| **Zero Code Change** | Toggle Chinese content without deployment |
| **Ops-Friendly** | Dashboard toggle for non-technical operators |
| **Gradual Rollout** | Can enable per-category or per-user-segment |
| **Audit Trail** | Track when and who enabled/disabled |

### 12.2 Configuration Model

```prisma
// schema.prisma

model FeatureFlag {
  id          String   @id @default(uuid())
  key         String   @unique @db.VarChar(100)
  value       Json     // Flexible value storage
  description String?  @db.Text
  isEnabled   Boolean  @default(false)

  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  updatedBy   String?  @db.VarChar(100)  // Admin user ID
}
```

**Feature Flag Entry:**

```json
{
  "key": "chinese_content",
  "isEnabled": false,
  "value": {
    "allowedLanguages": ["en"],
    "enabledCategoryIds": [],
    "enabledForUserIds": [],
    "enabledForBetaUsers": false,
    "message": {
      "en": "Chinese content coming soon!",
      "zh": "中文内容即将上线！"
    }
  },
  "description": "Controls visibility of Chinese content across all platforms"
}
```

### 12.3 Backend Implementation

#### Feature Flag Service

```typescript
// modules/feature-flags/feature-flags.service.ts

@Injectable()
export class FeatureFlagsService {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  constructor(private prisma: PrismaService) {}

  async getFlag(key: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (flag) {
      this.cache.set(key, {
        value: flag,
        expiry: Date.now() + this.CACHE_TTL,
      });
    }

    return flag;
  }

  async isChineseContentEnabled(userId?: string): Promise<boolean> {
    const flag = await this.getFlag('chinese_content');
    if (!flag || !flag.isEnabled) return false;

    const config = flag.value as ChineseContentConfig;

    // Check if enabled for specific user
    if (userId && config.enabledForUserIds?.includes(userId)) {
      return true;
    }

    // Check if globally enabled
    return config.allowedLanguages?.includes('zh') ?? false;
  }

  async getAllowedLanguages(userId?: string): Promise<string[]> {
    const flag = await this.getFlag('chinese_content');

    if (!flag || !flag.isEnabled) {
      return ['en']; // Default: English only
    }

    const config = flag.value as ChineseContentConfig;
    return config.allowedLanguages ?? ['en'];
  }

  // Dashboard method to update flag
  async updateFlag(
    key: string,
    updates: Partial<FeatureFlag>,
    adminUserId: string
  ): Promise<FeatureFlag> {
    const result = await this.prisma.featureFlag.update({
      where: { key },
      data: {
        ...updates,
        updatedBy: adminUserId,
      },
    });

    // Invalidate cache
    this.cache.delete(key);

    // Emit event for real-time updates (optional)
    this.eventEmitter.emit('feature-flag.updated', { key, value: result });

    return result;
  }
}

interface ChineseContentConfig {
  allowedLanguages: string[];
  enabledCategoryIds: string[];
  enabledForUserIds: string[];
  enabledForBetaUsers: boolean;
  message: {
    en: string;
    zh: string;
  };
}
```

#### Integrate with Categories Service

```typescript
// categories.service.ts

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private featureFlags: FeatureFlagsService,
  ) {}

  async getRootCategories(
    requestedLanguage?: string,
    userId?: string
  ): Promise<Category[]> {
    // Get allowed languages from feature flag
    const allowedLanguages = await this.featureFlags.getAllowedLanguages(userId);

    // Override requested language if not allowed
    let language = requestedLanguage;
    if (language === 'zh' && !allowedLanguages.includes('zh')) {
      language = 'en'; // Fallback to English
    }
    if (language === 'all') {
      // For 'all', filter to only allowed languages
      language = allowedLanguages.length === 1 ? allowedLanguages[0] : 'all';
    }

    const where: Prisma.CategoryWhereInput = {
      parentId: null,
      isActive: true,
    };

    if (language !== 'all') {
      where.language = language;
    } else {
      where.language = { in: allowedLanguages };
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Similar changes for getCascade, getTree, etc.
}
```

### 12.4 API Response Enhancement

#### Client Config Endpoint

```typescript
// GET /config/client
// Returns client-specific configuration including feature flags

interface ClientConfigResponse {
  features: {
    chineseContent: {
      enabled: boolean;
      allowedLanguages: string[];
      comingSoonMessage?: string;
    };
    // Other feature flags...
  };
  version: string;
}
```

**Example Response (Chinese disabled):**

```json
{
  "features": {
    "chineseContent": {
      "enabled": false,
      "allowedLanguages": ["en"],
      "comingSoonMessage": "Chinese content coming soon!"
    }
  },
  "version": "1.0.0"
}
```

**Example Response (Chinese enabled):**

```json
{
  "features": {
    "chineseContent": {
      "enabled": true,
      "allowedLanguages": ["en", "zh"]
    }
  },
  "version": "1.0.0"
}
```

### 12.5 iOS Client Implementation

#### App Configuration Manager

```swift
// Core/Config/AppConfigManager.swift

@MainActor
class AppConfigManager: ObservableObject {
    static let shared = AppConfigManager()

    @Published var chineseContentEnabled: Bool = false
    @Published var allowedLanguages: [String] = ["en"]
    @Published var chineseComingSoonMessage: String?

    private var configCache: ClientConfig?
    private var lastFetch: Date?
    private let cacheTimeout: TimeInterval = 300 // 5 minutes

    func fetchConfig() async {
        // Use cached if fresh
        if let lastFetch, Date().timeIntervalSince(lastFetch) < cacheTimeout {
            return
        }

        do {
            let config: ClientConfig = try await apiClient.get("/config/client")
            self.configCache = config
            self.lastFetch = Date()

            // Update published properties
            self.chineseContentEnabled = config.features.chineseContent.enabled
            self.allowedLanguages = config.features.chineseContent.allowedLanguages
            self.chineseComingSoonMessage = config.features.chineseContent.comingSoonMessage
        } catch {
            print("Failed to fetch config: \(error)")
        }
    }

    var canShowChineseContent: Bool {
        allowedLanguages.contains("zh")
    }
}

// Usage in BrowseBooksView
struct BrowseBooksView: View {
    @StateObject private var config = AppConfigManager.shared

    var availableLanguageFilter: String {
        // Only allow languages that are enabled
        config.canShowChineseContent ? "all" : "en"
    }
}
```

#### Language Selection Guard

```swift
// In any view that might show language selection
struct LanguageFilterView: View {
    @StateObject private var config = AppConfigManager.shared
    @Binding var selectedLanguage: String

    var body: some View {
        Picker("Language", selection: $selectedLanguage) {
            Text("English").tag("en")

            if config.canShowChineseContent {
                Text("Chinese").tag("zh")
            }
        }
    }
}
```

### 12.6 Dashboard Implementation

#### Feature Flags Management Page

```tsx
// pages/feature-flags/ChineseContentToggle.tsx

import { useState, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { Switch, Card, Alert, Typography, Space, Button } from 'antd';

export const ChineseContentToggle = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [flag, setFlag] = useState<FeatureFlag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlag();
  }, []);

  const loadFlag = async () => {
    const { data } = await dataProvider.getOne('feature-flags', {
      id: 'chinese_content'
    });
    setFlag(data);
    setLoading(false);
  };

  const toggleEnabled = async (enabled: boolean) => {
    setLoading(true);
    try {
      await dataProvider.update('feature-flags', {
        id: 'chinese_content',
        data: {
          isEnabled: enabled,
          value: {
            ...flag.value,
            allowedLanguages: enabled ? ['en', 'zh'] : ['en'],
          },
        },
        previousData: flag,
      });
      notify('Chinese content ' + (enabled ? 'enabled' : 'disabled'), { type: 'success' });
      loadFlag();
    } catch (error) {
      notify('Failed to update', { type: 'error' });
    }
    setLoading(false);
  };

  if (loading) return <Spin />;

  return (
    <Card title="Chinese Content Settings">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Main Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={5}>Enable Chinese Content</Typography.Title>
            <Typography.Text type="secondary">
              When enabled, Chinese categories and books will be visible to all users
            </Typography.Text>
          </div>
          <Switch
            checked={flag?.isEnabled && flag?.value?.allowedLanguages?.includes('zh')}
            onChange={toggleEnabled}
            loading={loading}
          />
        </div>

        {/* Status Indicator */}
        <Alert
          type={flag?.isEnabled ? 'success' : 'warning'}
          message={flag?.isEnabled
            ? 'Chinese content is LIVE for all users'
            : 'Chinese content is HIDDEN from client apps'}
          description={flag?.isEnabled
            ? 'Users can browse Chinese categories and books'
            : 'Only visible in this dashboard for content management'}
        />

        {/* Coming Soon Message (when disabled) */}
        {!flag?.isEnabled && (
          <div>
            <Typography.Text strong>Coming Soon Message:</Typography.Text>
            <Input.TextArea
              value={flag?.value?.message?.en}
              onChange={(e) => {
                // Update message
              }}
              placeholder="Message shown to users when they try to access Chinese content"
            />
          </div>
        )}

        {/* Last Updated */}
        <Typography.Text type="secondary">
          Last updated: {flag?.updatedAt} by {flag?.updatedBy || 'System'}
        </Typography.Text>
      </Space>
    </Card>
  );
};
```

### 12.7 Full Stack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FEATURE FLAG FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐                                                      │
│   │  Dashboard   │                                                      │
│   │  Admin Panel │                                                      │
│   └──────┬───────┘                                                      │
│          │ Toggle Chinese Content                                       │
│          ▼                                                              │
│   ┌──────────────────────────────────────────┐                         │
│   │         FeatureFlag Table                │                         │
│   │  ┌────────────────────────────────────┐  │                         │
│   │  │ key: "chinese_content"             │  │                         │
│   │  │ isEnabled: false ──────────────────┼──┼──► Single Source        │
│   │  │ value: { allowedLanguages: ["en"] }│  │     of Truth            │
│   │  └────────────────────────────────────┘  │                         │
│   └──────────────────────────────────────────┘                         │
│                     │                                                   │
│                     │ Query on every request (cached 1 min)            │
│                     ▼                                                   │
│   ┌──────────────────────────────────────────┐                         │
│   │         Backend API                       │                         │
│   │  ┌────────────────────────────────────┐  │                         │
│   │  │ GET /categories/cascade?lang=zh    │  │                         │
│   │  │   → Check feature flag             │  │                         │
│   │  │   → zh not in allowedLanguages     │  │                         │
│   │  │   → Fallback to lang=en            │  │                         │
│   │  └────────────────────────────────────┘  │                         │
│   │                                          │                         │
│   │  ┌────────────────────────────────────┐  │                         │
│   │  │ GET /config/client                 │  │                         │
│   │  │   → Return feature flag status     │──┼──► iOS fetches on       │
│   │  │   → chineseContent.enabled: false  │  │     app launch          │
│   │  └────────────────────────────────────┘  │                         │
│   └──────────────────────────────────────────┘                         │
│                     │                                                   │
│                     ▼                                                   │
│   ┌──────────────────────────────────────────┐                         │
│   │         iOS Client                        │                         │
│   │  ┌────────────────────────────────────┐  │                         │
│   │  │ AppConfigManager                   │  │                         │
│   │  │   canShowChineseContent: false     │  │                         │
│   │  │                                    │  │                         │
│   │  │ BrowseBooksView                    │  │                         │
│   │  │   → Only shows English categories  │  │                         │
│   │  │   → No Chinese language option     │  │                         │
│   │  └────────────────────────────────────┘  │                         │
│   └──────────────────────────────────────────┘                         │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│   WHEN READY TO ENABLE:                                                 │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   Dashboard Admin → Toggle ON → DB Updated → Cache Invalidated          │
│                                     │                                   │
│                                     ▼                                   │
│   Next API request → New flag value → Chinese content visible           │
│   iOS config refresh (5 min) → UI updates → Chinese options appear      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.8 Gradual Rollout Options

The feature flag value supports several rollout strategies:

```json
{
  "key": "chinese_content",
  "isEnabled": true,
  "value": {
    // Strategy 1: Language-based (current)
    "allowedLanguages": ["en"],  // Add "zh" to enable

    // Strategy 2: Category-based (partial rollout)
    "enabledCategoryIds": [
      "uuid-history",
      "uuid-literature"
    ],  // Only these Chinese categories visible

    // Strategy 3: User-based (beta testing)
    "enabledForUserIds": [
      "user-123",
      "user-456"
    ],  // Only these users see Chinese content

    // Strategy 4: Beta flag
    "enabledForBetaUsers": true,  // Users with isBeta=true see it

    // Strategy 5: Percentage rollout (future)
    "rolloutPercentage": 10  // 10% of users see it
  }
}
```

### 12.9 Implementation Checklist for Feature Flag

#### Phase 1: Database & Backend

- [ ] Add `FeatureFlag` model to Prisma schema
- [ ] Initialize `chinese_content` feature flag (system config only)
- [ ] Implement `FeatureFlagsService`
- [ ] Create `/config/client` endpoint
- [ ] Integrate flag check into `CategoriesService`
- [ ] Add caching with invalidation

#### Phase 2: Dashboard

- [ ] Create Feature Flags management page
- [ ] Add Chinese Content toggle card
- [ ] Show audit trail (who changed, when)
- [ ] Add confirmation dialog for enable/disable

#### Phase 3: iOS Client

- [ ] Implement `AppConfigManager`
- [ ] Fetch config on app launch
- [ ] Guard language selection UI
- [ ] Show "coming soon" message if disabled
- [ ] Periodic config refresh

#### Phase 4: Testing

- [ ] Test flag toggle in dashboard
- [ ] Verify API respects flag
- [ ] Test iOS with flag on/off
- [ ] Test cache invalidation
- [ ] Load test with flag checks

---

## 13. Environment Isolation Strategy

### 13.1 Overview

Three fully isolated environments with independent data, configurations, and feature flags:

| Environment | Purpose | Data | Feature Flags | Access |
| ----------- | ------- | ---- | ------------- | ------ |
| **Local** | Development | Debug Snapshot | All enabled | Developer only |
| **Staging** | QA/UAT testing | Test data (copy of prod structure) | Configurable | Team + Beta testers |
| **Production** | Live users | Real user data | Conservative | All users |

### 13.2 Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENVIRONMENT ISOLATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   LOCAL (Development)                                                       │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │  PostgreSQL │  │   Redis     │  │   Backend   │                        │
│   │  :5432      │  │   :6379     │  │   :3000     │                        │
│   │  (Docker)   │  │   (Docker)  │  │   (npm dev) │                        │
│   └─────────────┘  └─────────────┘  └─────────────┘                        │
│         │                │                │                                 │
│         └────────────────┴────────────────┘                                 │
│                          │                                                  │
│                    localhost:3000                                           │
│                          │                                                  │
│   ┌─────────────┐  ┌─────────────┐                                         │
│   │  Dashboard  │  │  iOS Sim    │                                         │
│   │  :5173      │  │  (Xcode)    │                                         │
│   └─────────────┘  └─────────────┘                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   STAGING (UAT)                                                             │
│   ┌─────────────────────────────────────────────────────────┐              │
│   │                    AWS / Cloud                           │              │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │              │
│   │  │  RDS        │  │ ElastiCache │  │    ECS      │     │              │
│   │  │  PostgreSQL │  │   Redis     │  │   Backend   │     │              │
│   │  │  staging-db │  │  staging    │  │  staging    │     │              │
│   │  └─────────────┘  └─────────────┘  └─────────────┘     │              │
│   └─────────────────────────────────────────────────────────┘              │
│                          │                                                  │
│                api-staging.readmigo.app                                     │
│                          │                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │  Dashboard  │  │  iOS App    │  │  TestFlight │                        │
│   │  staging    │  │  (Staging)  │  │   Testers   │                        │
│   └─────────────┘  └─────────────┘  └─────────────┘                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PRODUCTION                                                                │
│   ┌─────────────────────────────────────────────────────────┐              │
│   │                    AWS / Cloud                           │              │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │              │
│   │  │  RDS        │  │ ElastiCache │  │    ECS      │     │              │
│   │  │  PostgreSQL │  │   Redis     │  │   Backend   │     │              │
│   │  │  prod-db    │  │  prod       │  │  prod       │     │              │
│   │  └─────────────┘  └─────────────┘  └─────────────┘     │              │
│   └─────────────────────────────────────────────────────────┘              │
│                          │                                                  │
│                   api.readmigo.app                                          │
│                          │                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │  Dashboard  │  │  iOS App    │  │  App Store  │                        │
│   │  prod       │  │  (Release)  │  │   Users     │                        │
│   └─────────────┘  └─────────────┘  └─────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 13.3 Configuration Management

#### 13.3.1 Backend Environment Variables

```bash
# .env.local (Development)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/readmigo_dev
REDIS_URL=redis://localhost:6379
API_BASE_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:5173
ENV_NAME=local
FEATURE_FLAGS_OVERRIDE=true  # Allow all features in dev

# .env.staging
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@staging-db.xxx.rds.amazonaws.com:5432/readmigo
REDIS_URL=redis://staging-redis.xxx.cache.amazonaws.com:6379
API_BASE_URL=https://api-staging.readmigo.app
DASHBOARD_URL=https://dashboard-staging.readmigo.app
ENV_NAME=staging
FEATURE_FLAGS_OVERRIDE=false

# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.xxx.rds.amazonaws.com:5432/readmigo
REDIS_URL=redis://prod-redis.xxx.cache.amazonaws.com:6379
API_BASE_URL=https://api.readmigo.app
DASHBOARD_URL=https://dashboard.readmigo.app
ENV_NAME=production
FEATURE_FLAGS_OVERRIDE=false
```

#### 13.3.2 Environment-Aware Feature Flag Model

```prisma
// schema.prisma - Updated FeatureFlag model

model FeatureFlag {
  id          String   @id @default(uuid())
  key         String   @db.VarChar(100)
  environment String   @db.VarChar(20)  // 'local', 'staging', 'production'
  value       Json
  description String?  @db.Text
  isEnabled   Boolean  @default(false)

  // Audit fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  updatedBy   String?  @db.VarChar(100)

  @@unique([key, environment])  // Unique per environment
  @@index([environment])
}
```

#### 13.3.3 Feature Flag Per Environment

```json
// Local environment - All features enabled for development
{
  "key": "chinese_content",
  "environment": "local",
  "isEnabled": true,
  "value": {
    "allowedLanguages": ["en", "zh"],
    "enabledCategoryIds": [],
    "enabledForUserIds": [],
    "enabledForBetaUsers": true
  }
}

// Staging environment - Test with beta users
{
  "key": "chinese_content",
  "environment": "staging",
  "isEnabled": true,
  "value": {
    "allowedLanguages": ["en", "zh"],
    "enabledCategoryIds": [],
    "enabledForUserIds": [],
    "enabledForBetaUsers": true
  }
}

// Production environment - Conservative, disabled
{
  "key": "chinese_content",
  "environment": "production",
  "isEnabled": false,
  "value": {
    "allowedLanguages": ["en"],
    "enabledCategoryIds": [],
    "enabledForUserIds": [],
    "enabledForBetaUsers": false,
    "message": {
      "en": "Chinese content coming soon!",
      "zh": "中文内容即将上线！"
    }
  }
}
```

### 13.4 Backend Implementation

#### 13.4.1 Environment Service

```typescript
// modules/config/environment.service.ts

export type Environment = 'local' | 'staging' | 'production';

@Injectable()
export class EnvironmentService {
  private readonly env: Environment;

  constructor(private configService: ConfigService) {
    this.env = this.resolveEnvironment();
  }

  private resolveEnvironment(): Environment {
    const envName = this.configService.get<string>('ENV_NAME');
    if (envName && ['local', 'staging', 'production'].includes(envName)) {
      return envName as Environment;
    }

    const nodeEnv = this.configService.get<string>('NODE_ENV');
    switch (nodeEnv) {
      case 'development': return 'local';
      case 'staging': return 'staging';
      case 'production': return 'production';
      default: return 'local';
    }
  }

  get current(): Environment {
    return this.env;
  }

  get isLocal(): boolean {
    return this.env === 'local';
  }

  get isStaging(): boolean {
    return this.env === 'staging';
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }

  get allowFeatureFlagOverride(): boolean {
    return this.configService.get<boolean>('FEATURE_FLAGS_OVERRIDE', false);
  }
}
```

#### 13.4.2 Updated Feature Flag Service

```typescript
// modules/feature-flags/feature-flags.service.ts

@Injectable()
export class FeatureFlagsService {
  private cache: Map<string, { value: FeatureFlag; expiry: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  constructor(
    private prisma: PrismaService,
    private envService: EnvironmentService,
  ) {}

  private getCacheKey(key: string): string {
    return `${this.envService.current}:${key}`;
  }

  async getFlag(key: string): Promise<FeatureFlag | null> {
    const cacheKey = this.getCacheKey(key);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    // Query by key AND environment
    const flag = await this.prisma.featureFlag.findUnique({
      where: {
        key_environment: {
          key,
          environment: this.envService.current,
        },
      },
    });

    if (flag) {
      this.cache.set(cacheKey, {
        value: flag,
        expiry: Date.now() + this.CACHE_TTL,
      });
    }

    return flag;
  }

  async getAllowedLanguages(userId?: string): Promise<string[]> {
    // In local dev, allow override to enable all features
    if (this.envService.allowFeatureFlagOverride) {
      return ['en', 'zh'];
    }

    const flag = await this.getFlag('chinese_content');
    if (!flag || !flag.isEnabled) {
      return ['en'];
    }

    const config = flag.value as ChineseContentConfig;
    return config.allowedLanguages ?? ['en'];
  }

  // Dashboard: Get flags for specific environment (admin use)
  async getFlagsForEnvironment(environment: Environment): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      where: { environment },
      orderBy: { key: 'asc' },
    });
  }

  // Dashboard: Update flag for specific environment
  async updateFlag(
    key: string,
    environment: Environment,
    updates: Partial<FeatureFlag>,
    adminUserId: string
  ): Promise<FeatureFlag> {
    const result = await this.prisma.featureFlag.update({
      where: {
        key_environment: { key, environment },
      },
      data: {
        ...updates,
        updatedBy: adminUserId,
      },
    });

    // Invalidate cache
    this.cache.delete(`${environment}:${key}`);

    return result;
  }

  // Copy flag configuration from one environment to another
  async copyFlagToEnvironment(
    key: string,
    fromEnv: Environment,
    toEnv: Environment,
    adminUserId: string
  ): Promise<FeatureFlag> {
    const sourceFlag = await this.prisma.featureFlag.findUnique({
      where: { key_environment: { key, environment: fromEnv } },
    });

    if (!sourceFlag) {
      throw new NotFoundException(`Flag ${key} not found in ${fromEnv}`);
    }

    return this.prisma.featureFlag.upsert({
      where: { key_environment: { key, environment: toEnv } },
      create: {
        key,
        environment: toEnv,
        value: sourceFlag.value,
        description: sourceFlag.description,
        isEnabled: sourceFlag.isEnabled,
        updatedBy: adminUserId,
      },
      update: {
        value: sourceFlag.value,
        isEnabled: sourceFlag.isEnabled,
        updatedBy: adminUserId,
      },
    });
  }
}
```

#### 13.4.3 Client Config Endpoint with Environment Info

```typescript
// modules/config/config.controller.ts

@Controller('config')
export class ConfigController {
  constructor(
    private featureFlagsService: FeatureFlagsService,
    private envService: EnvironmentService,
  ) {}

  @Get('client')
  async getClientConfig(@CurrentUser() user?: User): Promise<ClientConfigResponse> {
    const allowedLanguages = await this.featureFlagsService.getAllowedLanguages(user?.id);
    const chineseEnabled = allowedLanguages.includes('zh');

    return {
      environment: this.envService.current,
      version: process.env.APP_VERSION || '1.0.0',
      features: {
        chineseContent: {
          enabled: chineseEnabled,
          allowedLanguages,
          comingSoonMessage: chineseEnabled ? undefined : 'Chinese content coming soon!',
        },
      },
      endpoints: {
        api: process.env.API_BASE_URL,
        // Other service endpoints if needed
      },
    };
  }
}

interface ClientConfigResponse {
  environment: 'local' | 'staging' | 'production';
  version: string;
  features: {
    chineseContent: {
      enabled: boolean;
      allowedLanguages: string[];
      comingSoonMessage?: string;
    };
  };
  endpoints: {
    api: string;
  };
}
```

### 13.5 iOS Client Implementation

#### 13.5.1 Environment Configuration

```swift
// Core/Config/Environment.swift

enum AppEnvironment: String, CaseIterable {
    case local = "local"
    case staging = "staging"
    case production = "production"

    var apiBaseURL: String {
        switch self {
        case .local:
            return "http://localhost:3000"
        case .staging:
            return "https://api-staging.readmigo.app"
        case .production:
            return "https://api.readmigo.app"
        }
    }

    var displayName: String {
        switch self {
        case .local: return "Local Dev"
        case .staging: return "Staging"
        case .production: return "Production"
        }
    }

    var color: Color {
        switch self {
        case .local: return .orange
        case .staging: return .purple
        case .production: return .green
        }
    }
}
```

#### 13.5.2 Environment Manager

```swift
// Core/Config/EnvironmentManager.swift

@MainActor
class EnvironmentManager: ObservableObject {
    static let shared = EnvironmentManager()

    @AppStorage("selected_environment") private var storedEnvironment: String = ""
    @Published private(set) var current: AppEnvironment

    private init() {
        // Determine initial environment
        #if DEBUG
        // In debug builds, check stored preference or default to local
        if let stored = AppEnvironment(rawValue: storedEnvironment) {
            self.current = stored
        } else {
            self.current = .local
        }
        #else
        // Release builds always use production
        self.current = .production
        #endif
    }

    var canSwitchEnvironment: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    func switchEnvironment(to env: AppEnvironment) {
        guard canSwitchEnvironment else { return }

        self.current = env
        self.storedEnvironment = env.rawValue

        // Notify API client to update base URL
        NotificationCenter.default.post(
            name: .environmentDidChange,
            object: env
        )

        // Clear caches
        AppConfigManager.shared.clearCache()

        // Re-fetch config for new environment
        Task {
            await AppConfigManager.shared.fetchConfig()
        }
    }
}

extension Notification.Name {
    static let environmentDidChange = Notification.Name("environmentDidChange")
}
```

#### 13.5.3 API Client with Environment Support

```swift
// Core/Network/APIClient.swift

class APIClient {
    static let shared = APIClient()

    private var baseURL: String {
        EnvironmentManager.shared.current.apiBaseURL
    }

    init() {
        // Listen for environment changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(environmentDidChange),
            name: .environmentDidChange,
            object: nil
        )
    }

    @objc private func environmentDidChange(_ notification: Notification) {
        // Cancel pending requests, clear URL session cache, etc.
        URLSession.shared.reset { }
    }

    func get<T: Decodable>(_ endpoint: String) async throws -> T {
        let url = URL(string: "\(baseURL)\(endpoint)")!
        // ... rest of implementation
    }
}
```

#### 13.5.4 Debug Environment Switcher (Dev Builds Only)

```swift
// Features/Settings/EnvironmentSwitcherView.swift

#if DEBUG
struct EnvironmentSwitcherView: View {
    @StateObject private var envManager = EnvironmentManager.shared
    @State private var showConfirmation = false
    @State private var pendingEnvironment: AppEnvironment?

    var body: some View {
        Section("Developer Options") {
            // Current environment indicator
            HStack {
                Circle()
                    .fill(envManager.current.color)
                    .frame(width: 12, height: 12)
                Text("Environment")
                Spacer()
                Text(envManager.current.displayName)
                    .foregroundColor(.secondary)
            }

            // Environment picker
            Picker("Switch Environment", selection: Binding(
                get: { envManager.current },
                set: { newEnv in
                    if newEnv != envManager.current {
                        pendingEnvironment = newEnv
                        showConfirmation = true
                    }
                }
            )) {
                ForEach(AppEnvironment.allCases, id: \.self) { env in
                    HStack {
                        Circle()
                            .fill(env.color)
                            .frame(width: 8, height: 8)
                        Text(env.displayName)
                    }
                    .tag(env)
                }
            }

            // API URL display
            Text(envManager.current.apiBaseURL)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .alert("Switch Environment?", isPresented: $showConfirmation) {
            Button("Cancel", role: .cancel) {
                pendingEnvironment = nil
            }
            Button("Switch") {
                if let env = pendingEnvironment {
                    envManager.switchEnvironment(to: env)
                }
                pendingEnvironment = nil
            }
        } message: {
            Text("This will clear your cache and re-fetch all data from \(pendingEnvironment?.displayName ?? "").")
        }
    }
}
#endif
```

#### 13.5.5 Environment Badge in App

```swift
// Core/UI/EnvironmentBadge.swift

struct EnvironmentBadge: View {
    @StateObject private var envManager = EnvironmentManager.shared

    var body: some View {
        #if DEBUG
        if envManager.current != .production {
            Text(envManager.current.displayName.uppercased())
                .font(.caption2)
                .fontWeight(.bold)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(envManager.current.color)
                .foregroundColor(.white)
                .cornerRadius(4)
        }
        #endif
    }
}

// Usage in main navigation
struct MainTabView: View {
    var body: some View {
        TabView {
            // tabs...
        }
        .overlay(alignment: .topTrailing) {
            EnvironmentBadge()
                .padding()
        }
    }
}
```

### 13.6 Dashboard Implementation

#### 13.6.1 Environment Selector Component

```tsx
// components/EnvironmentSelector.tsx

import { useState } from 'react';
import { Select, Tag, Space, Typography } from 'antd';

type Environment = 'local' | 'staging' | 'production';

const ENV_CONFIG: Record<Environment, { color: string; label: string }> = {
  local: { color: 'orange', label: 'Local Dev' },
  staging: { color: 'purple', label: 'Staging' },
  production: { color: 'green', label: 'Production' },
};

interface EnvironmentSelectorProps {
  value: Environment;
  onChange: (env: Environment) => void;
  showWarning?: boolean;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  value,
  onChange,
  showWarning = true,
}) => {
  return (
    <Space direction="vertical" size="small">
      <Select
        value={value}
        onChange={onChange}
        style={{ width: 200 }}
        options={Object.entries(ENV_CONFIG).map(([env, config]) => ({
          value: env,
          label: (
            <Space>
              <Tag color={config.color}>{config.label}</Tag>
            </Space>
          ),
        }))}
      />
      {showWarning && value === 'production' && (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          ⚠️ Changes will affect live users immediately
        </Typography.Text>
      )}
    </Space>
  );
};
```

#### 13.6.2 Feature Flags Management Page

```tsx
// pages/feature-flags/index.tsx

import { useState, useEffect } from 'react';
import { Card, Table, Switch, Button, Space, Modal, message, Alert } from 'antd';
import { CopyOutlined, SyncOutlined } from '@ant-design/icons';
import { EnvironmentSelector } from '../../components/EnvironmentSelector';

type Environment = 'local' | 'staging' | 'production';

interface FeatureFlag {
  id: string;
  key: string;
  environment: Environment;
  isEnabled: boolean;
  value: any;
  updatedAt: string;
  updatedBy: string;
}

export const FeatureFlagsPage = () => {
  const [selectedEnv, setSelectedEnv] = useState<Environment>('staging');
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlags();
  }, [selectedEnv]);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/feature-flags?environment=${selectedEnv}`);
      const data = await response.json();
      setFlags(data);
    } catch (error) {
      message.error('Failed to load feature flags');
    }
    setLoading(false);
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    // Confirm for production
    if (selectedEnv === 'production') {
      Modal.confirm({
        title: 'Modify Production Flag?',
        content: (
          <div>
            <p>You are about to {flag.isEnabled ? 'disable' : 'enable'} <strong>{flag.key}</strong> in <strong>Production</strong>.</p>
            <p>This will affect all live users immediately.</p>
          </div>
        ),
        okText: 'Confirm',
        okType: 'danger',
        onOk: () => doToggle(flag),
      });
    } else {
      doToggle(flag);
    }
  };

  const doToggle = async (flag: FeatureFlag) => {
    try {
      await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !flag.isEnabled }),
      });
      message.success(`${flag.key} ${!flag.isEnabled ? 'enabled' : 'disabled'}`);
      loadFlags();
    } catch (error) {
      message.error('Failed to update flag');
    }
  };

  const copyToEnvironment = async (flag: FeatureFlag, targetEnv: Environment) => {
    const confirmMessage = targetEnv === 'production'
      ? 'This will copy the flag configuration to Production. Live users will be affected.'
      : `This will copy the flag configuration to ${targetEnv}.`;

    Modal.confirm({
      title: `Copy to ${targetEnv}?`,
      content: confirmMessage,
      onOk: async () => {
        try {
          await fetch(`/api/admin/feature-flags/${flag.key}/copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromEnvironment: selectedEnv,
              toEnvironment: targetEnv,
            }),
          });
          message.success(`Copied to ${targetEnv}`);
        } catch (error) {
          message.error('Failed to copy flag');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Flag Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Status',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: FeatureFlag) => (
        <Switch
          checked={enabled}
          onChange={() => toggleFlag(record)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FeatureFlag) => (
        <Space>
          {selectedEnv !== 'production' && (
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToEnvironment(record, 'production')}
            >
              Copy to Prod
            </Button>
          )}
          {selectedEnv === 'production' && (
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToEnvironment(record, 'staging')}
            >
              Copy to Staging
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Feature Flags"
      extra={
        <Space>
          <EnvironmentSelector value={selectedEnv} onChange={setSelectedEnv} />
          <Button icon={<SyncOutlined />} onClick={loadFlags}>
            Refresh
          </Button>
        </Space>
      }
    >
      {selectedEnv === 'production' && (
        <Alert
          message="Production Environment"
          description="Changes here will immediately affect all live users. Please be careful."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={flags}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};
```

#### 13.6.3 Chinese Content Control Panel

```tsx
// pages/feature-flags/ChineseContentPanel.tsx

import { useState, useEffect } from 'react';
import { Card, Switch, Alert, Typography, Space, Tabs, Tag, Descriptions, Timeline } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

type Environment = 'local' | 'staging' | 'production';

const ENV_CONFIG: Record<Environment, { color: string; label: string }> = {
  local: { color: 'orange', label: 'Local' },
  staging: { color: 'purple', label: 'Staging' },
  production: { color: 'green', label: 'Production' },
};

export const ChineseContentPanel = () => {
  const [flags, setFlags] = useState<Record<Environment, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllFlags();
  }, []);

  const loadAllFlags = async () => {
    setLoading(true);
    const environments: Environment[] = ['local', 'staging', 'production'];
    const results: Record<string, any> = {};

    for (const env of environments) {
      try {
        const response = await fetch(`/api/admin/feature-flags/chinese_content?environment=${env}`);
        results[env] = await response.json();
      } catch (error) {
        results[env] = null;
      }
    }

    setFlags(results);
    setLoading(false);
  };

  const toggleEnvironment = async (env: Environment, enabled: boolean) => {
    // Implementation similar to before, but environment-specific
  };

  const renderEnvironmentCard = (env: Environment) => {
    const flag = flags[env];
    const config = ENV_CONFIG[env];
    const isEnabled = flag?.isEnabled && flag?.value?.allowedLanguages?.includes('zh');

    return (
      <Card
        key={env}
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <Tag color={config.color}>{config.label}</Tag>
            {isEnabled ? (
              <Tag icon={<CheckCircleOutlined />} color="success">Chinese Enabled</Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="default">Chinese Disabled</Tag>
            )}
          </Space>
        }
        extra={
          <Switch
            checked={isEnabled}
            onChange={(checked) => toggleEnvironment(env, checked)}
            loading={loading}
          />
        }
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Allowed Languages">
            {flag?.value?.allowedLanguages?.join(', ') || 'en'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {flag?.updatedAt ? new Date(flag.updatedAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Updated By">
            {flag?.updatedBy || 'System'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  return (
    <div>
      <Typography.Title level={4}>Chinese Content Control</Typography.Title>
      <Typography.Paragraph type="secondary">
        Manage Chinese content visibility across all environments
      </Typography.Paragraph>

      {/* Environment Overview */}
      <Card title="Environment Status" style={{ marginBottom: 24 }}>
        <Space size="large">
          {(['local', 'staging', 'production'] as Environment[]).map(env => {
            const flag = flags[env];
            const isEnabled = flag?.isEnabled && flag?.value?.allowedLanguages?.includes('zh');
            return (
              <div key={env} style={{ textAlign: 'center' }}>
                <Tag color={ENV_CONFIG[env].color} style={{ marginBottom: 8 }}>
                  {ENV_CONFIG[env].label}
                </Tag>
                <div>
                  {isEnabled ? (
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
                  )}
                </div>
              </div>
            );
          })}
        </Space>
      </Card>

      {/* Promotion Flow */}
      <Card title="Recommended Promotion Flow" style={{ marginBottom: 24 }}>
        <Timeline
          items={[
            {
              color: 'orange',
              children: (
                <div>
                  <strong>1. Local Development</strong>
                  <p>Enable and test Chinese categories locally</p>
                </div>
              ),
            },
            {
              color: 'purple',
              children: (
                <div>
                  <strong>2. Staging/UAT</strong>
                  <p>Enable for QA team and beta testers via TestFlight</p>
                </div>
              ),
            },
            {
              color: 'green',
              children: (
                <div>
                  <strong>3. Production</strong>
                  <p>Enable for all users after QA approval</p>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Per-Environment Controls */}
      {renderEnvironmentCard('local')}
      {renderEnvironmentCard('staging')}
      {renderEnvironmentCard('production')}
    </div>
  );
};
```

### 13.7 System Configuration Initialization

> ⚠️ **注意**: 此脚本仅用于初始化系统配置（Feature Flags），不得用于业务数据。所有业务数据必须从真实数据源生成。

#### 13.7.1 Feature Flags Initialization Script

```typescript
// prisma/seed.ts - 仅限系统配置

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initFeatureFlags() {
  const environments = ['local', 'staging', 'production'] as const;

  for (const env of environments) {
    // Chinese content flag
    await prisma.featureFlag.upsert({
      where: {
        key_environment: {
          key: 'chinese_content',
          environment: env,
        },
      },
      update: {},
      create: {
        key: 'chinese_content',
        environment: env,
        description: 'Controls visibility of Chinese content',
        isEnabled: env === 'local', // Only enabled in local by default
        value: {
          allowedLanguages: env === 'local' ? ['en', 'zh'] : ['en'],
          enabledCategoryIds: [],
          enabledForUserIds: [],
          enabledForBetaUsers: env !== 'production',
          message: {
            en: 'Chinese content coming soon!',
            zh: '中文内容即将上线！',
          },
        },
      },
    });
  }
}

async function main() {
  await initFeatureFlags();
  // 仅限系统配置初始化，禁止添加业务数据
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 13.8 CI/CD Pipeline Considerations

```yaml
# .github/workflows/deploy.yml (example)

name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Determine Environment
        id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "api_url=https://api.readmigo.app" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "api_url=https://api-staging.readmigo.app" >> $GITHUB_OUTPUT
          fi

      - name: Deploy Backend
        env:
          ENV_NAME: ${{ steps.env.outputs.environment }}
          API_BASE_URL: ${{ steps.env.outputs.api_url }}
        run: |
          # Deploy to appropriate environment

      - name: Run Migrations
        env:
          DATABASE_URL: ${{ secrets[format('{0}_DATABASE_URL', steps.env.outputs.environment)] }}
        run: |
          npx prisma migrate deploy
```

### 13.9 Testing Strategy Per Environment

| Test Type | Local | Staging | Production |
| --------- | ----- | ------- | ---------- |
| Unit Tests | ✅ All | ✅ All | - |
| Integration Tests | ✅ Full | ✅ Full | - |
| E2E Tests | ✅ Full | ✅ Full | ✅ Smoke only |
| Load Tests | - | ✅ Full | - |
| Feature Flag Tests | ✅ All ON | ✅ Configured | ✅ Read-only verify |

### 13.10 Environment Isolation Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT ISOLATION MATRIX                         │
├─────────────┬─────────────────┬─────────────────┬─────────────────────┤
│ Component   │ Local           │ Staging         │ Production          │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Database    │ localhost:5432  │ staging-db.rds  │ prod-db.rds         │
│             │ (Docker)        │ (AWS RDS)       │ (AWS RDS)           │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Redis       │ localhost:6379  │ staging.cache   │ prod.cache          │
│             │ (Docker)        │ (ElastiCache)   │ (ElastiCache)       │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ API URL     │ localhost:3000  │ api-staging.*   │ api.*               │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Dashboard   │ localhost:5173  │ dashboard-stg.* │ dashboard.*         │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Feature     │ All enabled     │ Configurable    │ Conservative        │
│ Flags       │ (override=true) │ per flag        │ (default OFF)       │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ iOS Build   │ Xcode Simulator │ TestFlight      │ App Store           │
│             │ (Debug)         │ (Internal)      │ (Release)           │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Chinese     │ ✅ Enabled      │ ✅ Enabled      │ ❌ Disabled         │
│ Content     │ (for dev)       │ (for QA)        │ (until launch)      │
├─────────────┼─────────────────┼─────────────────┼─────────────────────┤
│ Env Switch  │ ✅ In-app       │ ✅ In-app       │ ❌ Locked           │
│ (iOS)       │ (Debug menu)    │ (Debug menu)    │ (Release build)     │
└─────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

### 13.11 Implementation Checklist for Environment Isolation

#### Phase 1: Infrastructure

- [ ] Set up staging database (RDS or equivalent)
- [ ] Set up staging Redis (ElastiCache or equivalent)
- [ ] Configure staging domain (api-staging.readmigo.app)
- [ ] Set up staging dashboard domain

#### Phase 2: Backend

- [ ] Add `environment` field to FeatureFlag model
- [ ] Update Prisma schema with unique constraint
- [ ] Implement EnvironmentService
- [ ] Update FeatureFlagsService for multi-environment
- [ ] Add `/config/client` endpoint with environment info
- [ ] Initialize environment-specific feature flags (system config only)

#### Phase 3: Dashboard

- [ ] Implement EnvironmentSelector component
- [ ] Update Feature Flags page with environment tabs
- [ ] Add "Copy to Environment" functionality
- [ ] Add production warning alerts
- [ ] Implement Chinese Content Control Panel

#### Phase 4: iOS Client

- [ ] Implement AppEnvironment enum
- [ ] Implement EnvironmentManager
- [ ] Update APIClient for environment switching
- [ ] Add debug-only EnvironmentSwitcherView
- [ ] Add EnvironmentBadge overlay
- [ ] Test environment switching flow

#### Phase 5: CI/CD

- [ ] Configure GitHub Actions for staging branch
- [ ] Set up environment-specific secrets
- [ ] Configure TestFlight for staging builds
- [ ] Add smoke tests for production

---

## 14. Summary

This redesign introduces three major systems:

### A. Cascading Category Selection

1. **Enforces hierarchy** - Users must select parent before seeing children
2. **Filters by language** - Clients only see English categories (default)
3. **Provides clean UX** - Progressive disclosure reduces cognitive load
4. **Supports future Chinese content** - Simply add L0 category "中文内容" with `language: 'zh'`
5. **Maintains backward compatibility** - Dashboard continues to see all content

Key changes:

- New `/categories/cascade` API endpoint
- iOS cascading selector UI component
- Dashboard language field for categories
- Default language changed from 'all' to 'en'

### B. Feature Flag System for Chinese Content

1. **Single Source of Truth** - One DB record per environment controls entire stack
2. **Zero Deployment** - Toggle via Dashboard without code changes
3. **Ops-Friendly** - Simple ON/OFF switch with audit trail
4. **Gradual Rollout** - Support for beta users, specific categories, percentage rollout
5. **Defense in Depth** - Both API and client enforce the flag

Key changes:

- New `FeatureFlag` table with `(key, environment)` unique constraint
- `FeatureFlagsService` integrated with Categories
- New `/config/client` endpoint for iOS config sync
- Dashboard Feature Flags management page with environment selector
- iOS `AppConfigManager` for runtime config

### C. Environment Isolation Strategy

1. **Complete Isolation** - Local/Staging/Production have independent databases, caches, and configs
2. **Independent Feature Flags** - Each environment has its own flag values
3. **Safe Promotion Flow** - Local → Staging → Production with explicit copy actions
4. **Developer Experience** - Debug builds can switch environments; Release locked to production
5. **Ops Safety** - Production changes require explicit confirmation

Key changes:

- `FeatureFlag` model with `environment` field
- `EnvironmentService` for backend environment detection
- Dashboard environment selector with production warnings
- iOS `EnvironmentManager` with debug-only switcher
- `EnvironmentBadge` overlay for non-production builds
- CI/CD pipeline with branch-based environment detection

### Full Release Flow for Chinese Content

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CHINESE CONTENT RELEASE FLOW                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  STEP 1: Local Development                                              │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Feature flag: chinese_content (local) = ENABLED                      │
│  • Developer tests Chinese categories in Xcode Simulator                │
│  • Dashboard (localhost) shows all Chinese content                      │
│                                                                         │
│                              ↓                                          │
│                                                                         │
│  STEP 2: Staging/UAT                                                    │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Dashboard: Copy flag from Local → Staging                            │
│  • Feature flag: chinese_content (staging) = ENABLED                    │
│  • QA team tests via TestFlight (Staging build)                         │
│  • Beta testers verify Chinese content                                  │
│                                                                         │
│                              ↓                                          │
│                                                                         │
│  STEP 3: Production Release                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Dashboard: Copy flag from Staging → Production (with confirmation)   │
│  • Feature flag: chinese_content (production) = ENABLED                 │
│  • All App Store users see Chinese content                              │
│  • No app update required - server-side toggle                          │
│                                                                         │
│                              ↓                                          │
│                                                                         │
│  ROLLBACK (if needed)                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Dashboard: Toggle OFF in Production                                  │
│  • Immediate effect (1 min API cache + 5 min client refresh)            │
│  • No deployment needed                                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                         DASHBOARD                                   │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│   │  │ Environment  │  │ Feature Flag │  │  Category    │             │    │
│   │  │  Selector    │  │   Toggle     │  │  Management  │             │    │
│   │  │ [Stg ▼]     │  │ [Chinese:ON] │  │  (All langs) │             │    │
│   │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                          BACKEND API                                │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│   │  │ Environment  │  │ FeatureFlag  │  │  Categories  │             │    │
│   │  │   Service    │→ │   Service    │→ │   Service    │             │    │
│   │  │ (detect env) │  │ (check flag) │  │ (filter lang)│             │    │
│   │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│              ┌─────────────────────┼─────────────────────┐                  │
│              ▼                     ▼                     ▼                  │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│   │   LOCAL DB       │  │   STAGING DB     │  │  PRODUCTION DB   │         │
│   │  FeatureFlag     │  │  FeatureFlag     │  │  FeatureFlag     │         │
│   │  (local, ON)     │  │  (staging, ON)   │  │  (prod, OFF)     │         │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                          iOS CLIENT                                 │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│   │  │ Environment  │  │   AppConfig  │  │   Category   │             │    │
│   │  │   Manager    │→ │   Manager    │→ │    View      │             │    │
│   │  │ (Debug only) │  │ (fetch flag) │  │ (cascade UI) │             │    │
│   │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│   │                                                                     │    │
│   │  Debug Build: [LOCAL ▼] [STAGING] [PROD]  Environment Badge        │    │
│   │  Release Build: Production only (locked)                           │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Implementation Priority

| Phase | Scope | Deliverables |
| ----- | ----- | ------------ |
| **Phase 1** | Backend Core | FeatureFlag model, EnvironmentService, /config/client endpoint |
| **Phase 2** | Dashboard | Environment selector, Flag management, Chinese content panel |
| **Phase 3** | iOS Client | EnvironmentManager, AppConfigManager, Debug switcher |
| **Phase 4** | Category Cascade | /categories/cascade endpoint, iOS cascade UI |
| **Phase 5** | Infrastructure | Staging environment setup, CI/CD pipeline |
| **Phase 6** | Testing | E2E tests per environment, load tests on staging |
