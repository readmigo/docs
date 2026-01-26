# Discover Tab Book Display Styles Design

## Overview

This document defines the standardized book cover display styles for the iOS Discover tab. Each style has fixed dimensions and specific display elements to ensure visual consistency across the app.

## Problem Statement

Current issues:
1. Book cover dimensions are inconsistent across different sections
2. Grid layouts (3 books per row) have variable cover sizes depending on content
3. No clear mapping between list types and display styles
4. Display elements (title, author, difficulty badge, etc.) vary inconsistently

## Design Principles

1. **Fixed Dimensions**: Each style has exact pixel dimensions for covers
2. **Aspect Ratio**: All book covers maintain 2:3 aspect ratio (standard book proportion)
3. **Style-Data Binding**: Each `BookListType` maps to a specific display style
4. **Consistent Elements**: Each style defines which metadata elements to show

---

## Display Styles

### Style 0: `featuredBanner` - Full-Width Featured Banner

**Use Case**: Spotlight book, daily pick, special promotion, new release highlight

**Dimensions**:
| Element | Size |
|---------|------|
| Banner Width | Full screen width (100%) |
| Banner Height | 200pt |
| Cover Width | 100pt |
| Cover Height | 150pt |

**Layout**: Horizontal - cover on left, content on right

**Display Elements**:
- Book cover (left side, with shadow)
- Featured tag/badge (e.g., "Today's Pick", "New Release", "Staff Favorite")
- Title (large, 2 lines max)
- Author name
- Short description (2 lines max)
- Difficulty badge
- CTA button ("Read Now" or "Add to Library")

**Visual Style**:
- Full-width card with gradient background
- Background: Dynamic gradient based on cover dominant color, or themed gradient
- Shadow: `radius: 12, opacity: 0.2`
- Corner radius: 16pt
- Cover shadow: `radius: 8, opacity: 0.3`
- Padding: 20pt all sides

**Bound to BookListType**:
- Special promotion (manually curated)
- Daily pick feature
- New release spotlight

**ASCII Layout**:
```
┌──────────────────────────────────────────────────┐
│  ┌─────────┐                                     │
│  │         │  ⭐ Today's Pick                    │
│  │  Cover  │  ─────────────────                  │
│  │ 100×150 │  Book Title Here                    │
│  │         │  by Author Name                     │
│  │         │  Short description text...          │
│  └─────────┘  [Easy] [Read Now →]                │
│              ░░░░░░░░ gradient bg ░░░░░░░░       │
└──────────────────────────────────────────────────┘
```

---

### Style 1: `heroCarousel` - Hero Banner Style

**Use Case**: Main featured promotion, AI personalized recommendations

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 140pt |
| Cover Height | 210pt |
| Card Total Width | 280pt |
| Card Total Height | 260pt |

**Display Elements**:
- Book cover (large)
- Title (2 lines max)
- Author name
- Difficulty badge
- Rating stars (if available)
- "AI Recommended" tag (if applicable)

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 8, opacity: 0.15`
- Corner radius: 12pt
- Spacing between cards: 20pt
- Background: subtle gradient overlay on cover

**Bound to BookListType**:
- `personalized` (For You)
- `aiFeatured` (AI Featured)
- `aiRecommended` (AI Recommended)

**ASCII Layout**:
```
← Horizontal Scroll →
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────
│             │ │             │ │             │ │
│   ┌─────┐   │ │   ┌─────┐   │ │   ┌─────┐   │ │
│   │     │   │ │   │     │   │ │   │     │   │ │
│   │Cover│   │ │   │Cover│   │ │   │Cover│   │ │
│   │140× │   │ │   │140× │   │ │   │140× │   │ │
│   │ 210 │   │ │   │ 210 │   │ │   │ 210 │   │ │
│   │     │   │ │   │     │   │ │   │     │   │ │
│   └─────┘   │ │   └─────┘   │ │   └─────┘   │ │
│  Book Title │ │  Book Title │ │  Book Title │ │
│  by Author  │ │  by Author  │ │  by Author  │ │
│  ★★★★☆ [B1] │ │  ★★★★★ [A2] │ │  ★★★☆☆ [B2] │ │
│ 🤖 AI Pick  │ │             │ │ 🤖 AI Pick  │ │
└─────────────┘ └─────────────┘ └─────────────┘ └────
    280pt           280pt           280pt
```

---

### Style 2: `standardCarousel` - Standard Horizontal Scroll

**Use Case**: Editor's picks, curated lists, recommendations

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 100pt |
| Cover Height | 150pt |
| Card Total Width | 100pt |
| Card Total Height | 200pt |

**Display Elements**:
- Book cover
- Title (2 lines max)
- Author name (1 line)

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 4, opacity: 0.1`
- Corner radius: 8pt
- Spacing between cards: 12pt

**Bound to BookListType**:
- `editorsPick` (Editor's Pick)
- `celebrity` (Celebrity Picks)
- `collection` (Collection)

**ASCII Layout**:
```
← Horizontal Scroll →
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────
│         │ │         │ │         │ │         │ │
│  Cover  │ │  Cover  │ │  Cover  │ │  Cover  │ │
│ 100×150 │ │ 100×150 │ │ 100×150 │ │ 100×150 │ │
│         │ │         │ │         │ │         │ │
│         │ │         │ │         │ │         │ │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └────
Book Title  Book Title  Book Title  Book Title
by Author   by Author   by Author   by Author
   100pt       100pt       100pt       100pt
```

---

### Style 3: `rankedCarousel` - Ranked List with Numbers

**Use Case**: Top rankings, bestsellers, annual best

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 90pt |
| Cover Height | 135pt |
| Card Total Width | 110pt |
| Card Total Height | 200pt |

**Display Elements**:
- Rank number (large, overlay on left edge)
- Book cover
- Title (2 lines max)
- Author name (1 line)
- Rating/score badge

**Visual Style**:
- Horizontal scroll
- Shadow: `radius: 4, opacity: 0.1`
- Corner radius: 8pt
- Spacing between cards: 16pt

**Rank Number Styling**:
| Rank | Color | Style |
|------|-------|-------|
| 1st | Gold (#FFD700) | Bold 36pt, glow effect, crown icon optional |
| 2nd | Silver (#C0C0C0) | Bold 32pt, subtle glow |
| 3rd | Bronze (#CD7F32) | Bold 32pt, subtle glow |
| 4th+ | Gray (#8E8E93) | Bold 28pt, no glow |

**Rank Badge Position**: Overlaid on bottom-left corner of cover, extending 8pt outside

**Bound to BookListType**:
- `ranking` (Top Ranked)
- `annualBest` (Best of the Year)

**ASCII Layout**:
```
← Horizontal Scroll →
  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌────
  │         │   │         │   │         │   │
  │  Cover  │   │  Cover  │   │  Cover  │   │
  │  90×135 │   │  90×135 │   │  90×135 │   │
  │         │   │         │   │         │   │
┌─┴─┐       │ ┌─┴─┐       │ ┌─┴─┐       │ ┌─┴─┐
│ 1 │───────┘ │ 2 │───────┘ │ 3 │───────┘ │ 4 │
└───┘ 🥇      └───┘ 🥈      └───┘🥉       └───┘
 Gold        Silver       Bronze        Gray
Book Title   Book Title   Book Title   Book Ti
★★★★★ 4.8   ★★★★☆ 4.5   ★★★★☆ 4.3   ★★★☆☆
  110pt        110pt        110pt        110pt
```

---

### Style 4: `compactGrid` - 3-Column Grid

**Use Case**: All books browsing, category books, search results grid

**Dimensions** (calculated from screen width):
| Element | Size |
|---------|------|
| Cover Width | `(screenWidth - 48) / 3` ≈ 109pt on iPhone 14 |
| Cover Height | `coverWidth * 1.5` ≈ 164pt |
| Card Total Height | Cover + 50pt (text area) |

**Display Elements**:
- Book cover (fixed aspect ratio 2:3)
- Title (2 lines max, centered)
- Difficulty badge (small, optional)

**Visual Style**:
- LazyVGrid with 3 columns
- Column spacing: 12pt
- Row spacing: 16pt
- Corner radius: 6pt
- No shadow

**Bound to BookListType**:
- Used for "All Books" section
- Category book listings
- Search results (alternative view)

**ASCII Layout**:
```
┌───────────────────────────────────────────┐
│                                           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │         │ │         │ │         │      │
│ │  Cover  │ │  Cover  │ │  Cover  │      │
│ │  109×   │ │  109×   │ │  109×   │      │
│ │   164   │ │   164   │ │   164   │      │
│ │         │ │         │ │         │      │
│ └─────────┘ └─────────┘ └─────────┘      │
│ Book Title  Book Title  Book Title       │
│ 2 lines...  2 lines...  2 lines...       │
│   [Easy]      [B1]       [B2]            │
│                                           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │         │ │         │ │         │      │
│ │  Cover  │ │  Cover  │ │  Cover  │      │
│ │  109×   │ │  109×   │ │  109×   │      │
│ │   164   │ │   164   │ │   164   │      │
│ │         │ │         │ │         │      │
│ └─────────┘ └─────────┘ └─────────┘      │
│ Book Title  Book Title  Book Title       │
│                                           │
└───────────────────────────────────────────┘
     Col 1       Col 2       Col 3
     ←──────── 12pt gap ────────→
```

---

### Style 5: `universityGrid` - Academic 2-Column Grid

**Use Case**: University reading lists, educational content

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | `(screenWidth - 36) / 2` ≈ 170pt on iPhone 14 |
| Cover Height | `coverWidth * 1.5` = 255pt |
| Card Total Height | Cover + 70pt (text area) |

**Display Elements**:
- Book cover (larger)
- Title (2 lines max)
- Author name
- Difficulty level indicator (progress bar style)
- University/course tag (if available)

**Visual Style**:
- LazyVGrid with 2 columns
- Column spacing: 12pt
- Row spacing: 20pt
- Corner radius: 10pt
- Subtle shadow

**Bound to BookListType**:
- `university` (University Reads)

**ASCII Layout**:
```
┌─────────────────────────────────────────────┐
│                                             │
│ ┌───────────────┐ ┌───────────────┐        │
│ │               │ │               │        │
│ │     Cover     │ │     Cover     │        │
│ │    170×255    │ │    170×255    │        │
│ │               │ │               │        │
│ │               │ │               │        │
│ │               │ │               │        │
│ └───────────────┘ └───────────────┘        │
│ Pride & Prejudice  1984                     │
│ by Jane Austen     by George Orwell        │
│ ████████░░ B1      ██████████ B2           │
│ 🎓 Harvard Reading 🎓 MIT Classics          │
│                                             │
│ ┌───────────────┐ ┌───────────────┐        │
│ │               │ │               │        │
│ │     Cover     │ │     Cover     │        │
│ │    170×255    │ │    170×255    │        │
│ │               │ │               │        │
│ └───────────────┘ └───────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
      Col 1              Col 2
      ←────── 12pt gap ──────→
```

---

### Style 6: `listRow` - Horizontal List Row

**Use Case**: Search results, reading history, compact lists

**Dimensions**:
| Element | Size |
|---------|------|
| Cover Width | 60pt |
| Cover Height | 90pt |
| Row Height | 110pt |

**Display Elements**:
- Book cover (left)
- Title (right, 2 lines max)
- Author name
- Difficulty badge
- Chevron indicator
- Optional: progress indicator, date added

**Visual Style**:
- Vertical list layout
- Full width rows
- Corner radius: 6pt on cover
- Divider between rows
- Row padding: 12pt vertical

**Bound to**:
- Search results (default)
- Reading history
- Compact list views

**ASCII Layout**:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│ ┌───────┐  Pride and Prejudice              >  │
│ │       │  by Jane Austen                      │
│ │ Cover │  [Easy] ████████░░ 80%               │
│ │ 60×90 │  Added: Dec 15, 2025                 │
│ └───────┘                                       │
│─────────────────────────────────────────────────│
│ ┌───────┐  The Great Gatsby                 >  │
│ │       │  by F. Scott Fitzgerald              │
│ │ Cover │  [Medium] ██████░░░░ 60%             │
│ │ 60×90 │  Added: Dec 10, 2025                 │
│ └───────┘                                       │
│─────────────────────────────────────────────────│
│ ┌───────┐  1984                             >  │
│ │       │  by George Orwell                    │
│ │ Cover │  [B2]                                │
│ │ 60×90 │  Added: Dec 5, 2025                  │
│ └───────┘                                       │
│                                                 │
└─────────────────────────────────────────────────┘
  ↑ Full width rows, 110pt height each
```

---

## Style-to-BookListType Mapping

| BookListType | Primary Style | Secondary Style | Notes |
|--------------|---------------|-----------------|-------|
| `personalized` | `heroCarousel` | - | AI-driven recommendations |
| `aiFeatured` | `featuredBanner` | `heroCarousel` | Single spotlight book |
| `aiRecommended` | `heroCarousel` | `standardCarousel` | AI picks carousel |
| `editorsPick` | `standardCarousel` | `compactGrid` | Curated selections |
| `celebrity` | `standardCarousel` | - | Celebrity recommendations |
| `collection` | `standardCarousel` | `compactGrid` | Themed collections |
| `ranking` | `rankedCarousel` | - | With rank numbers 1-3 gold/silver/bronze |
| `annualBest` | `rankedCarousel` | - | Yearly best with ranks |
| `university` | `universityGrid` | - | 2-column academic layout |
| *(Daily Pick)* | `featuredBanner` | - | Single book spotlight |
| *(New Release)* | `featuredBanner` | - | New book promotion |

---

## Discover Tab Section Layout

```
┌──────────────────────────────────────────┐
│  Search Bar                              │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Today's Pick           │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  ⭐ Today's Pick         │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Easy] [Read Now →]     │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [heroCarousel] Recommended for You      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  140×210│ │  140×210│ │  140×210│ →  │
│  │         │ │         │ │         │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│   Title      Title       Title          │
│   Author     Author      Author         │
│   ★★★★☆     ★★★★★      ★★★☆☆          │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [standardCarousel] Editor's Pick        │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────   │
│  │100×150│ │100×150│ │100×150│ │        │
│  └───────┘ └───────┘ └───────┘ └────   │
│   Title     Title     Title             │
│   Author    Author    Author            │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [rankedCarousel] Top Ranked             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────   │
│ 1│90×135 │2│90×135 │3│90×135 │4│        │
│  └───────┘ └───────┘ └───────┘ └────   │
│   Title     Title     Title             │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Categories              [See All →]     │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ 📖  │ │ 💡  │ │ 🔬  │               │
│  │Name │ │Name │ │Name │               │
│  └─────┘ └─────┘ └─────┘               │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ 💻  │ │ 📊  │ │ 🎨  │               │
│  └─────┘ └─────┘ └─────┘               │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  ═══════════ Infinite Scroll ═══════════ │
│  (Below sections load more on scroll)    │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Staff Favorite         │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  💝 Staff Favorite       │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Medium] [Read Now →]   │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Hidden Gem             │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  💎 Hidden Gem           │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Easy] [Read Now →]     │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Classic Must-Read      │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  📚 Classic Must-Read    │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Advanced] [Read Now →] │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Quick Read             │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  ⚡ Quick Read           │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Easy] [Read Now →]     │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│           ⏳ Loading more...             │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [featuredBanner] Vocabulary Builder     │
│  ┌────────────────────────────────────┐  │
│  │ ┌───────┐                          │  │
│  │ │ Cover │  📝 Vocabulary Builder   │  │
│  │ │100×150│  Book Title              │  │
│  │ │       │  by Author               │  │
│  │ └───────┘  [Medium] [Read Now →]   │  │
│  │        ░░░ gradient bg ░░░         │  │
│  └────────────────────────────────────┘  │
│                                          │
│              ... more ...                │
│                                          │
└──────────────────────────────────────────┘

Tap "See All" → Navigate to BrowseBooksView (full book grid with filters)
```

## Dashboard Configuration

The dashboard should allow configuring `displayStyle` for each BookList:

```typescript
interface BookListConfig {
  id: string;
  title: string;
  type: BookListType;
  displayStyle: DisplayStyle;  // Maps to iOS display style
  maxDisplayCount: number;     // How many books to show
  showRank: boolean;           // For rankedCarousel
  showDifficulty: boolean;     // Show difficulty badge
  showAuthor: boolean;         // Show author name
  showRating: boolean;         // Show rating stars
}

enum DisplayStyle {
  FEATURED_BANNER = 'FEATURED_BANNER',     // featuredBanner - full-width spotlight
  HERO_CAROUSEL = 'HERO_CAROUSEL',         // heroCarousel - large cards
  STANDARD_CAROUSEL = 'STANDARD_CAROUSEL', // standardCarousel - medium cards
  RANKED_CAROUSEL = 'RANKED_CAROUSEL',     // rankedCarousel - with rank numbers
  COMPACT_GRID = 'COMPACT_GRID',           // compactGrid - 3 columns
  UNIVERSITY_GRID = 'UNIVERSITY_GRID',     // universityGrid - 2 columns
  LIST_ROW = 'LIST_ROW',                   // listRow - horizontal rows
}
```

---

## iOS Implementation Components

### New Components to Create

1. **`BookCoverView`** - Unified cover component with fixed dimensions
2. **`FeaturedBannerCard`** - For featuredBanner style (full-width spotlight)
3. **`HeroBookCard`** - For heroCarousel style
4. **`StandardBookCard`** - For standardCarousel style
5. **`RankedBookCard`** - For rankedCarousel style with rank number
6. **`GridBookCard`** - For compactGrid style
7. **`UniversityBookCard`** - For universityGrid style
8. **`BookRowView`** - For listRow style

### Reusable Subcomponents

1. **`DifficultyBadge`** - Already exists
2. **`RatingStars`** - Star rating display
3. **`RankBadge`** - Large rank number overlay
4. **`AIRecommendedTag`** - Sparkles + "AI" tag

---

## Placeholder Styles

When cover image is unavailable:

| Style | Placeholder |
|-------|-------------|
| featuredBanner | Themed gradient + large book icon + title overlay |
| heroCarousel | Gradient + large book icon + title text |
| standardCarousel | Gray rounded rect + book icon |
| rankedCarousel | Gray rounded rect + book icon |
| compactGrid | Gray rounded rect + book icon |
| universityGrid | Gradient + book icon + category hint |
| listRow | Gray rounded rect + book icon |

**Gradient Colors by Genre** (for placeholders):
- Fiction: Blue → Purple
- Classic: Gold → Brown
- Romance: Pink → Red
- Mystery: Gray → Black
- Science Fiction: Cyan → Blue
- Fantasy: Purple → Pink
- Non-fiction: Green → Teal
- Default: Gray → Blue

---

## Accessibility

- All cover images have alt text: "{Book Title} by {Author}"
- Touch targets minimum 44×44pt
- VoiceOver announces: title, author, difficulty, rank (if applicable)
- High contrast mode: 1px border around covers

---

## Performance Considerations

1. Use `LazyVGrid` and `LazyHStack` for large lists
2. Implement image caching (AsyncImage with cache)
3. Prefetch images for carousel items
4. Fixed dimensions allow for efficient cell reuse

---

## Next Steps

1. [x] Review and approve this design document
2. [ ] Update `BookListDisplayStyle` enum in iOS model
3. [ ] Create unified `BookCoverView` component
4. [ ] Implement each card style component:
   - [ ] `FeaturedBannerCard`
   - [ ] `HeroBookCard`
   - [ ] `StandardBookCard`
   - [ ] `RankedBookCard` (with gold/silver/bronze styling)
   - [ ] `GridBookCard`
   - [ ] `UniversityBookCard`
   - [ ] `BookRowView`
5. [ ] Update `DiscoverView` to use new components
6. [ ] Add displayStyle configuration in dashboard
7. [ ] Test on multiple device sizes

---

## 榜单类型详细设计

> 与 [书籍推荐算法](../algorithm/book-ranking-algorithm.md) 配合使用

### 榜单分类体系

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              发现页榜单体系                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Level 0: 运营精选区                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  Today's    │ │   Staff     │ │   New       │ │  Special    │   │   │
│  │  │    Pick     │ │  Favorite   │ │  Release    │ │  Event      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Level 1: AI 个性化推荐                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  For You    │ │   Based on  │ │   Similar   │ │  Explore    │   │   │
│  │  │  (AI Pick)  │ │   History   │ │   Readers   │ │   New       │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Level 2: 实时榜单区                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │   热门榜    │ │   飙升榜    │ │   口碑榜    │ │   完读榜    │   │   │
│  │  │   (Hot)     │ │  (Trending) │ │  (Top Rated)│ │ (Completion)│   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Level 3: 主题榜单区                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  名校书单   │ │  名人推荐   │ │  经典必读   │ │  年度榜单   │   │   │
│  │  │(University) │ │ (Celebrity) │ │  (Classic)  │ │(Annual Best)│   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Level 4: 场景榜单区                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │   快速阅读  │ │   深度阅读  │ │   入门推荐  │ │   进阶挑战  │   │   │
│  │  │ (Quick Read)│ │ (Deep Dive) │ │ (Beginner)  │ │ (Challenge) │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 榜单类型详解

#### 1. 运营精选榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 数据来源 |
|---------|---------|---------|---------|---------|
| 今日推荐 | `TODAYS_PICK` | `featuredBanner` | 每日 | 运营配置 |
| 编辑精选 | `STAFF_FAVORITE` | `featuredBanner` | 每周 | 运营配置 |
| 新书上架 | `NEW_RELEASE` | `featuredBanner` | 实时 | 上架时间 |
| 活动专题 | `SPECIAL_EVENT` | `featuredBanner` | 活动期间 | 运营配置 |
| 隐藏好书 | `HIDDEN_GEM` | `featuredBanner` | 每周 | 算法+运营 |

**Today's Pick 设计规格：**

```
┌────────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░ 动态渐变背景 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                     │
│  ┌─────────────┐                                                   │
│  │             │   ⭐ Today's Pick                                 │
│  │             │   ────────────────────                            │
│  │   封面图     │   《Pride and Prejudice》                         │
│  │  100 × 150  │   by Jane Austen                                  │
│  │             │                                                   │
│  │             │   "A timeless tale of love, class, and the       │
│  │             │    misjudgments that come from first             │
│  │             │    impressions..."                                │
│  └─────────────┘                                                   │
│                                                                     │
│  [Easy]  [Classic]  [Romance]           [📖 Start Reading]         │
│                                                                     │
│  💡 Why this book: "Perfect for improving your vocabulary         │
│     while enjoying a classic romance story"                        │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**设计要素：**

| 元素 | 规格 |
|------|------|
| 推荐理由 | 1-2句话，说明为什么推荐这本书 |
| 背景渐变 | 根据封面主色调动态生成 |
| CTA按钮 | 主色调填充，圆角8pt |
| 标签 | 最多显示3个，胶囊样式 |

---

#### 2. AI 个性化推荐榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 算法依据 |
|---------|---------|---------|---------|---------|
| 为你推荐 | `FOR_YOU` | `heroCarousel` | 实时 | 用户画像 + 协同过滤 |
| 基于阅读历史 | `BASED_ON_HISTORY` | `standardCarousel` | 每日 | 内容相似度 |
| 相似读者在读 | `SIMILAR_READERS` | `standardCarousel` | 每日 | 协同过滤 |
| 探索新领域 | `EXPLORE_NEW` | `standardCarousel` | 每周 | 多样性算法 |

**For You 设计规格：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  🤖 Recommended for You                               [Refresh 🔄]      │
│  Based on your reading preferences                                       │
│                                                                          │
│  ← Horizontal Scroll →                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │              │ │              │ │              │ │              │   │
│  │   ┌──────┐   │ │   ┌──────┐   │ │   ┌──────┐   │ │   ┌──────┐   │   │
│  │   │      │   │ │   │      │   │ │   │      │   │ │   │      │   │   │
│  │   │ Cover│   │ │   │ Cover│   │ │   │ Cover│   │ │   │ Cover│   │   │
│  │   │140×  │   │ │   │140×  │   │ │   │140×  │   │ │   │140×  │   │   │
│  │   │ 210  │   │ │   │ 210  │   │ │   │ 210  │   │ │   │ 210  │   │   │
│  │   │      │   │ │   │      │   │ │   │      │   │ │   │      │   │   │
│  │   └──────┘   │ │   └──────┘   │ │   └──────┘   │ │   └──────┘   │   │
│  │              │ │              │ │              │ │              │   │
│  │  Book Title  │ │  Book Title  │ │  Book Title  │ │  Book Title  │   │
│  │  by Author   │ │  by Author   │ │  by Author   │ │  by Author   │   │
│  │  ★★★★★ 4.8   │ │  ★★★★☆ 4.5   │ │  ★★★★★ 4.9   │ │  ★★★★☆ 4.6   │   │
│  │  [Medium]    │ │  [Easy]      │ │  [Hard]      │ │  [Medium]    │   │
│  │              │ │              │ │              │ │              │   │
│  │  🤖 95% Match│ │  🤖 92% Match│ │  🤖 89% Match│ │  🤖 87% Match│   │
│  │              │ │              │ │              │ │              │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**AI 推荐特殊元素：**

| 元素 | 说明 | 规格 |
|------|------|------|
| 匹配度 | AI 计算的个性化匹配分数 | 百分比显示，> 85% 显示 |
| 刷新按钮 | 用户可手动刷新推荐 | 右上角图标按钮 |
| AI 标识 | 机器人图标 + "AI" 文字 | 卡片左上角 badge |
| 推荐理由 | 悬浮/长按显示推荐原因 | Tooltip 样式 |

---

#### 3. 实时榜单

| 榜单类型 | 英文标识 | 展示样式 | 更新频率 | 计算周期 | 核心指标 |
|---------|---------|---------|---------|---------|---------|
| 热门榜 | `HOT_RANKING` | `rankedCarousel` | 每小时 | 7天 | 阅读量 + 收藏量 |
| 飙升榜 | `TRENDING` | `rankedCarousel` | 每小时 | 24小时 | 增长率 |
| 口碑榜 | `TOP_RATED` | `rankedCarousel` | 每日 | 全时段 | 评分 × 评分数 |
| 完读榜 | `COMPLETION` | `rankedCarousel` | 每日 | 30天 | 完读人数 |
| 讨论榜 | `MOST_DISCUSSED` | `rankedCarousel` | 每日 | 7天 | 评论 + 笔记数 |
| 划线榜 | `MOST_HIGHLIGHTED` | `rankedCarousel` | 每日 | 30天 | 划线总数 |

**热门榜计算公式：**

```typescript
hotScore = (readCount × 0.3) +
           (bookshelfCount × 0.25) +
           (highlightCount × 0.15) +
           (noteCount × 0.15) +
           (shareCount × 0.15)

// 时间衰减因子
timeDecay = Math.exp(-daysSinceEvent / 7)
finalHotScore = hotScore × timeDecay
```

**飙升榜计算公式：**

```typescript
trendingScore = (today.readCount - yesterday.readCount) / (yesterday.readCount + 1)
               × Math.log10(today.readCount + 1)

// 新书加成
if (daysSincePublish < 7) {
  trendingScore *= 1.5
}
```

**排名榜单样式设计：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  🔥 Hot This Week                                    [See All →]        │
│  Updated 1 hour ago                                                      │
│                                                                          │
│  ← Horizontal Scroll →                                                   │
│                                                                          │
│    ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐       │
│    │           │   │           │   │           │   │           │       │
│    │   Cover   │   │   Cover   │   │   Cover   │   │   Cover   │       │
│    │  90×135   │   │  90×135   │   │  90×135   │   │  90×135   │       │
│    │           │   │           │   │           │   │           │       │
│ ┌──┴──┐       │ ┌──┴──┐       │ ┌──┴──┐       │ ┌──┴──┐       │       │
│ │  1  │───────┘ │  2  │───────┘ │  3  │───────┘ │  4  │───────┘       │
│ └─────┘         └─────┘         └─────┘         └─────┘               │
│   🥇              🥈              🥉                                    │
│  GOLD           SILVER         BRONZE           GRAY                   │
│                                                                          │
│  Book Title     Book Title     Book Title     Book Title               │
│  by Author      by Author      by Author      by Author                │
│                                                                          │
│  🔥 12.5K reads 🔥 10.2K reads 🔥 8.7K reads  🔥 7.1K reads            │
│  ↑ 156%         ↑ 89%          ↑ 67%          ↑ 45%                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**排名徽章样式：**

| 排名 | 颜色 | 图标 | 效果 |
|------|------|------|------|
| 1st | Gold #FFD700 | 👑 Crown | 发光效果 + 阴影 |
| 2nd | Silver #C0C0C0 | 🥈 Medal | 轻微发光 |
| 3rd | Bronze #CD7F32 | 🥉 Medal | 轻微发光 |
| 4th-10th | Gray #8E8E93 | 数字 | 无特效 |
| 11th+ | Light Gray | 数字 | 字体较小 |

**热度指示器样式：**

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  🔥 热度条设计                                   │
│                                                  │
│  ████████████████████░░░░░░  12.5K reads        │
│  ↑ 156% vs last week                            │
│                                                  │
│  颜色梯度:                                       │
│  - 超高热度 (Top 1%):  渐变红色 #FF4500 → #FF0000│
│  - 高热度 (Top 10%):   橙色 #FF8C00              │
│  - 中等热度 (Top 30%): 黄色 #FFD700              │
│  - 一般热度:           灰色 #8E8E93              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

#### 4. 主题榜单

| 榜单类型 | 英文标识 | 展示样式 | 特殊元素 |
|---------|---------|---------|---------|
| 名校书单 | `UNIVERSITY` | `universityGrid` | 学校徽章、课程标签 |
| 名人推荐 | `CELEBRITY` | `standardCarousel` | 名人头像、推荐语 |
| 经典必读 | `CLASSIC_MUST_READ` | `standardCarousel` | 时代标签、历史意义 |
| 年度榜单 | `ANNUAL_BEST` | `rankedCarousel` | 年份标签、获奖标识 |
| 诺贝尔文学奖 | `NOBEL_PRIZE` | `standardCarousel` | 获奖年份、国籍 |
| 普利策奖 | `PULITZER` | `standardCarousel` | 获奖类别、年份 |

**名校书单设计：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  🎓 University Reading Lists                                            │
│  Curated by top universities worldwide                                   │
│                                                                          │
│  ┌───────────────────────────┐  ┌───────────────────────────┐          │
│  │                           │  │                           │          │
│  │        ┌─────────┐        │  │        ┌─────────┐        │          │
│  │        │         │        │  │        │         │        │          │
│  │        │  Cover  │        │  │        │  Cover  │        │          │
│  │        │ 170×255 │        │  │        │ 170×255 │        │          │
│  │        │         │        │  │        │         │        │          │
│  │        │         │        │  │        │         │        │          │
│  │        └─────────┘        │  │        └─────────┘        │          │
│  │                           │  │                           │          │
│  │  Pride and Prejudice      │  │  1984                     │          │
│  │  by Jane Austen           │  │  by George Orwell         │          │
│  │                           │  │                           │          │
│  │  ████████░░░░ B1 Level    │  │  ██████████░░ B2 Level    │          │
│  │                           │  │                           │          │
│  │  🎓 Harvard              │  │  🎓 MIT                   │          │
│  │  English Literature 101   │  │  Political Science        │          │
│  │                           │  │                           │          │
│  └───────────────────────────┘  └───────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**名人推荐设计：**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ✨ Celebrity Picks                                  [See All →]        │
│  Books recommended by thought leaders                                    │
│                                                                          │
│  ← Horizontal Scroll →                                                   │
│                                                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│  │                 │ │                 │ │                 │           │
│  │   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │           │
│  │   │         │   │ │   │         │   │ │   │         │   │           │
│  │   │  Cover  │   │ │   │  Cover  │   │ │   │  Cover  │   │           │
│  │   │ 100×150 │   │ │   │ 100×150 │   │ │   │ 100×150 │   │           │
│  │   │         │   │ │   │         │   │ │   │         │   │           │
│  │   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │           │
│  │                 │ │                 │ │                 │           │
│  │  Book Title     │ │  Book Title     │ │  Book Title     │           │
│  │  by Author      │ │  by Author      │ │  by Author      │           │
│  │                 │ │                 │ │                 │           │
│  │  ┌───┐          │ │  ┌───┐          │ │  ┌───┐          │           │
│  │  │👤 │ Bill     │ │  │👤 │ Elon     │ │  │👤 │ Oprah    │           │
│  │  └───┘ Gates    │ │  └───┘ Musk     │ │  └───┘ Winfrey  │           │
│  │                 │ │                 │ │                 │           │
│  │  "This book     │ │  "Changed my    │ │  "One of my     │           │
│  │   changed..."   │ │   perspective"  │ │   favorites"    │           │
│  │                 │ │                 │ │                 │           │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### 5. 场景榜单

| 榜单类型 | 英文标识 | 展示样式 | 目标用户 | 特殊标签 |
|---------|---------|---------|---------|---------|
| 快速阅读 | `QUICK_READ` | `featuredBanner` | 忙碌用户 | 预估阅读时间 |
| 深度阅读 | `DEEP_DIVE` | `standardCarousel` | 重度用户 | 章节数、难度 |
| 入门推荐 | `BEGINNER_FRIENDLY` | `heroCarousel` | 新用户 | 词汇量提示 |
| 进阶挑战 | `CHALLENGE` | `standardCarousel` | 进阶用户 | 难度、挑战徽章 |
| 睡前阅读 | `BEDTIME` | `standardCarousel` | 睡前场景 | 阅读时长、放松标签 |
| 通勤必备 | `COMMUTE` | `standardCarousel` | 通勤场景 | 章节短小、可中断 |

**快速阅读设计：**

```
┌────────────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░ 清新蓝绿渐变 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                     │
│  ┌─────────────┐                                                   │
│  │             │   ⚡ Quick Read                                   │
│  │             │   ────────────────────                            │
│  │   封面图     │   《The Old Man and the Sea》                     │
│  │  100 × 150  │   by Ernest Hemingway                             │
│  │             │                                                   │
│  │             │   📖 ~2 hours to complete                         │
│  │             │   📝 12 short chapters                            │
│  └─────────────┘   🎯 Perfect for busy schedules                   │
│                                                                     │
│  [Easy]  [Classic]  [Adventure]         [📖 Start Reading]         │
│                                                                     │
│  ⏱️ Average reading time: 1.5 hours                                │
│  👥 1,234 readers finished this week                               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

### 榜单样式与数据源映射

```typescript
// 榜单类型到展示样式的完整映射
const BOOKLIST_STYLE_MAP: Record<BookListType, DisplayStyleConfig> = {
  // Level 0: 运营精选
  TODAYS_PICK: {
    displayStyle: 'featuredBanner',
    showRank: false,
    showRecommendReason: true,
    showCTA: true,
    dataSource: 'manual',
    refreshInterval: 'daily'
  },
  STAFF_FAVORITE: {
    displayStyle: 'featuredBanner',
    showRank: false,
    showRecommendReason: true,
    showCTA: true,
    dataSource: 'manual',
    refreshInterval: 'weekly'
  },
  NEW_RELEASE: {
    displayStyle: 'featuredBanner',
    showRank: false,
    showNewBadge: true,
    showCTA: true,
    dataSource: 'auto',
    refreshInterval: 'realtime'
  },

  // Level 1: AI 推荐
  FOR_YOU: {
    displayStyle: 'heroCarousel',
    showRank: false,
    showMatchScore: true,
    showAIBadge: true,
    showRefreshButton: true,
    dataSource: 'ai',
    refreshInterval: 'realtime'
  },
  BASED_ON_HISTORY: {
    displayStyle: 'standardCarousel',
    showRank: false,
    showRelatedBook: true,
    dataSource: 'ai',
    refreshInterval: 'daily'
  },

  // Level 2: 实时榜单
  HOT_RANKING: {
    displayStyle: 'rankedCarousel',
    showRank: true,
    showHotIndicator: true,
    showGrowthRate: true,
    maxRank: 20,
    dataSource: 'algorithm',
    refreshInterval: 'hourly'
  },
  TRENDING: {
    displayStyle: 'rankedCarousel',
    showRank: true,
    showTrendArrow: true,
    showGrowthRate: true,
    maxRank: 10,
    dataSource: 'algorithm',
    refreshInterval: 'hourly'
  },
  TOP_RATED: {
    displayStyle: 'rankedCarousel',
    showRank: true,
    showRating: true,
    showRatingCount: true,
    maxRank: 20,
    dataSource: 'algorithm',
    refreshInterval: 'daily'
  },

  // Level 3: 主题榜单
  UNIVERSITY: {
    displayStyle: 'universityGrid',
    showRank: false,
    showUniversityBadge: true,
    showCourseName: true,
    dataSource: 'manual',
    refreshInterval: 'monthly'
  },
  CELEBRITY: {
    displayStyle: 'standardCarousel',
    showRank: false,
    showCelebrityAvatar: true,
    showQuote: true,
    dataSource: 'manual',
    refreshInterval: 'weekly'
  },

  // Level 4: 场景榜单
  QUICK_READ: {
    displayStyle: 'featuredBanner',
    showRank: false,
    showReadTime: true,
    showChapterCount: true,
    dataSource: 'algorithm',
    refreshInterval: 'weekly'
  }
};
```

---

### Dashboard 榜单配置界面

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  📋 榜单管理 - 创建新榜单                                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  基本信息                                                                │
│  ─────────                                                              │
│  榜单名称: [热门本周榜                    ]                              │
│  英文标识: [HOT_WEEKLY                    ]                              │
│  描述:     [本周最受欢迎的书籍            ]                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  榜单类型                                                                │
│  ─────────                                                              │
│  ○ 手动配置 (运营人工选书)                                               │
│  ● 算法生成 (自动计算排名)                                               │
│  ○ AI推荐 (个性化推荐)                                                   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  展示样式                           预览                                 │
│  ─────────                         ──────                               │
│  ○ featuredBanner (全宽横幅)       ┌─────────────┐                      │
│  ○ heroCarousel (大卡片轮播)       │   Preview   │                      │
│  ○ standardCarousel (标准轮播)     │    Area     │                      │
│  ● rankedCarousel (排名轮播)       └─────────────┘                      │
│  ○ compactGrid (3列网格)                                                │
│  ○ universityGrid (2列学术)                                             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  排名规则 (算法生成时)                                                    │
│  ─────────────────────                                                  │
│  主要指标: [阅读量          ▼]  权重: [30%]                             │
│  次要指标: [收藏量          ▼]  权重: [25%]                             │
│  辅助指标: [评分            ▼]  权重: [20%]                             │
│           [划线数          ▼]  权重: [15%]                             │
│           [分享数          ▼]  权重: [10%]                             │
│                                                                          │
│  时间范围: [近7天          ▼]                                           │
│  更新频率: [每小时          ▼]                                           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  展示配置                                                                │
│  ─────────                                                              │
│  ☑ 显示排名序号    ☑ 显示热度指标    ☑ 显示增长率                       │
│  ☐ 显示评分        ☐ 显示阅读量      ☐ 显示推荐理由                     │
│                                                                          │
│  最大显示数量: [20]    显示位置: [发现页 ▼]                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│                                     [取消]  [保存草稿]  [发布上线]       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 数据模型扩展

```prisma
model BookList {
  id              String   @id @default(uuid())
  name            String
  nameEn          String?  @map("name_en")
  description     String?
  coverUrl        String?  @map("cover_url")

  // 类型分类
  type            BookListType
  level           Int      @default(2)  // 0-4, 对应优先级层级

  // 展示配置
  displayStyle    DisplayStyle
  showRank        Boolean  @default(false)
  showHotIndicator Boolean @default(false) @map("show_hot_indicator")
  showGrowthRate  Boolean  @default(false) @map("show_growth_rate")
  showMatchScore  Boolean  @default(false) @map("show_match_score")
  showAIBadge     Boolean  @default(false) @map("show_ai_badge")
  showReadTime    Boolean  @default(false) @map("show_read_time")
  maxDisplayCount Int      @default(10) @map("max_display_count")

  // 算法配置
  dataSource      DataSource @default(MANUAL)
  rankingConfig   Json?      @map("ranking_config")
  // rankingConfig: { primaryMetric, secondaryMetric, timeRange, weights }

  refreshInterval RefreshInterval @default(DAILY)
  lastRefreshedAt DateTime?       @map("last_refreshed_at")

  // 展示位置和排序
  displayPositions String[] @map("display_positions")
  sortOrder       Int       @default(0) @map("sort_order")

  // 生效时间
  startTime       DateTime? @map("start_time")
  endTime         DateTime? @map("end_time")
  status          ListStatus @default(DRAFT)

  // 关联
  items           BookListItem[]

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([type, status])
  @@index([level, sortOrder])
}

enum DisplayStyle {
  FEATURED_BANNER
  HERO_CAROUSEL
  STANDARD_CAROUSEL
  RANKED_CAROUSEL
  COMPACT_GRID
  UNIVERSITY_GRID
  LIST_ROW
}

enum DataSource {
  MANUAL      // 人工配置
  ALGORITHM   // 算法计算
  AI          // AI 推荐
}

enum RefreshInterval {
  REALTIME    // 实时
  HOURLY      // 每小时
  DAILY       // 每日
  WEEKLY      // 每周
  MONTHLY     // 每月
}
```

---

### 相关文档

- [书籍推荐算法设计](../algorithm/book-ranking-algorithm.md) - 详细的评分和排名算法
- [Dashboard 规格文档](../dashboard/spec.md) - 后台管理配置
- [发现页搜索功能](../content/discover-search.md) - 搜索相关设计

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-19 | Initial design document created |
| 2025-12-19 | Added `featuredBanner` style for full-width spotlight |
| 2025-12-19 | Added gold/silver/bronze styling for ranks 1-3 in `rankedCarousel` |
| 2025-12-21 | Merged Categories + All Books sections; added "See All" button linking to BrowseBooksView |
| 2025-12-21 | Added ASCII layout diagrams for all 7 display styles (Style 0-6) |
| 2025-12-23 | Added comprehensive booklist types design with 5 levels, algorithm integration, and dashboard config |

---

## 实施进度

| 版本 | 状态 | 完成度 | 更新日期 | 说明 |
|------|------|--------|----------|------|
| v1.0 | 🚧 进行中 | 60% | 2025-12-23 | 7种展示样式已定义，部分实现完成 |

### 已完成 ✅
- [x] 7种书籍展示样式设计文档（Style 0-6）
- [x] 每种样式的固定尺寸规范
- [x] ASCII布局图示
- [x] 5级榜单分类体系设计
- [x] 20+榜单类型规格定义
- [x] Prisma数据模型扩展设计
- [x] 榜单排名算法公式
- [x] Dashboard配置界面设计

### 进行中 🚧
- [ ] iOS端书籍卡片组件实现
  - [x] 基础书籍卡片（BookCardView）
  - [ ] featuredBanner 完整实现
  - [ ] heroCarousel 完整实现
  - [ ] rankedCarousel 金银铜牌样式
  - [ ] compactGrid 样式完善
  - [ ] universityGrid 样式完善
- [ ] 榜单数据模型迁移（BookList扩展）

### 待开发 📝
- [ ] 后端BookList模型扩展实现
  - [ ] 添加level字段（0-4优先级）
  - [ ] 添加displayStyle枚举
  - [ ] 添加rankingConfig JSON字段
  - [ ] 添加refreshInterval字段
- [ ] 榜单排名算法实现
  - [ ] 热度榜算法（hotScore计算）
  - [ ] 新书榜算法（时间加权）
  - [ ] 经典榜算法（持续热度）
  - [ ] 分类榜算法
- [ ] Dashboard榜单配置界面
  - [ ] 榜单CRUD功能
  - [ ] 榜单类型选择器
  - [ ] 展示样式选择器
  - [ ] 排名规则配置
  - [ ] 刷新频率设置
- [ ] iOS端榜单渲染逻辑
  - [ ] 按displayStyle动态渲染
  - [ ] 排名徽章显示
  - [ ] 时间窗口过滤

### 依赖项
- 📝 需要书籍推荐算法实现（algorithm/book-ranking-algorithm.md）
- 📝 需要用户行为数据收集
- 🚧 需要Dashboard榜单管理功能

### 技术债务
- 部分展示样式在不同屏幕尺寸下的响应式适配待完善
- 榜单缓存策略未定义
- 实时榜单刷新机制未实现
