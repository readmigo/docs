# Book-Author Relationship Design

## Overview

This document outlines the design for adding `authorId` to the Book table to establish a proper relationship between books and authors.

## Current State

### Database Schema

```
Book table:
- author: String (plain text, e.g., "O. Henry", "Jane Austen")

Author table:
- id: UUID
- name: String
- nameZh: String?
- ... (other fields)
```

### Problems

1. **No direct relationship**: Books store author as plain text, not linked to Author table
2. **Inconsistent naming**: Book.author may be "O. Henry" while Author.name is "O Henry" or "Henry, O."
3. **Search dependency**: iOS must search by name to find author profile, which is unreliable
4. **Data duplication**: Author name stored in both tables without referential integrity
5. **Multiple authors**: No clean way to handle books with multiple authors

## Proposed Solution

### Phase 1: Single Author Support

Add `authorId` field to Book table with optional foreign key to Author table.

#### Database Changes

```prisma
model Book {
  id        String  @id @default(uuid()) @db.Uuid
  title     String  @db.VarChar(500)
  author    String  @db.VarChar(255)  // Keep for backward compatibility
  authorId  String? @map("author_id") @db.Uuid  // New field
  authorRef Author? @relation(fields: [authorId], references: [id])

  // ... other fields
}

model Author {
  id    String @id @default(uuid()) @db.Uuid
  name  String @db.VarChar(255)
  books Book[] // New relation

  // ... other fields
}
```

#### API Changes

**BookDto (Response)**
```typescript
export class BookDto {
  id: string;
  title: string;
  author: string;      // Keep for display
  authorId?: string;   // New field
  // ... other fields
}
```

**Endpoints affected:**
- `GET /books` - Include authorId in response
- `GET /books/:id` - Include authorId in response
- `GET /reading/library` - Include authorId in response

#### iOS Changes

**Book Model**
```swift
struct Book: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let author: String      // Keep for display
    let authorId: String?   // New field
    // ... other fields
}
```

**Navigation Logic**
```swift
// In BookDetailView
if let authorId = book.authorId {
    // Direct navigation to author profile
    AuthorProfileView(authorId: authorId)
} else {
    // Fallback to current search-based approach
    AuthorProfileLoaderView(authorName: book.author)
}
```

### Phase 2: Multiple Authors Support (Future)

For books with multiple authors, create a junction table:

```prisma
model BookAuthor {
  id       String @id @default(uuid()) @db.Uuid
  bookId   String @map("book_id") @db.Uuid
  book     Book   @relation(fields: [bookId], references: [id])
  authorId String @map("author_id") @db.Uuid
  author   Author @relation(fields: [authorId], references: [id])

  isPrimary Boolean @default(false) @map("is_primary")
  role      String? @db.VarChar(50)  // e.g., "author", "translator", "editor"
  sortOrder Int     @default(0) @map("sort_order")

  @@unique([bookId, authorId])
  @@map("book_authors")
}
```

## Migration Strategy

### Step 1: Add Column (Non-breaking)

```sql
ALTER TABLE books ADD COLUMN author_id UUID;
ALTER TABLE books ADD CONSTRAINT fk_books_author
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL;
CREATE INDEX idx_books_author_id ON books(author_id);
```

### Step 2: Data Migration Script

```typescript
async function migrateBookAuthors() {
  const books = await prisma.book.findMany({
    where: { authorId: null }
  });

  for (const book of books) {
    // Try exact match first
    let author = await prisma.author.findFirst({
      where: { name: { equals: book.author, mode: 'insensitive' } }
    });

    // Try fuzzy match if not found
    if (!author) {
      author = await prisma.author.findFirst({
        where: { name: { contains: book.author, mode: 'insensitive' } }
      });
    }

    if (author) {
      await prisma.book.update({
        where: { id: book.id },
        data: { authorId: author.id }
      });
      console.log(`Linked: ${book.title} -> ${author.name}`);
    } else {
      console.log(`No match: ${book.title} (${book.author})`);
    }
  }
}
```

### Step 3: Update Backend API

1. Update BookDto to include `authorId`
2. Update book service to populate `authorId` in responses
3. Deploy backend changes

### Step 4: Update iOS App

1. Add `authorId` to Book model
2. Update navigation logic to use `authorId` when available
3. Release app update

### Step 5: Cleanup (Optional, Future)

After sufficient adoption:
- Make `authorId` required for new books
- Consider deprecating `author` string field

## Rollout Plan

| Phase | Task | Duration | Risk |
|-------|------|----------|------|
| 1 | Add database column & index | 1 day | Low |
| 2 | Run migration script | 1 day | Low |
| 3 | Update backend API | 1 day | Low |
| 4 | Update iOS app | 1 day | Low |
| 5 | Monitor & verify | 1 week | Low |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration fails to match some books | Medium | Keep `author` string as fallback, manual review of unmatched |
| Author not in database | Low | Create authors on-demand or use fallback view |
| Breaking existing API clients | High | `authorId` is optional, `author` string preserved |
| iOS crash on missing field | Medium | Make `authorId` optional in model |

## Success Metrics

1. **Coverage**: % of books with valid `authorId` (target: >90%)
2. **Navigation success**: % of author profile navigations that succeed (target: >95%)
3. **Error reduction**: Decrease in "Author not found" errors

## Open Questions

1. Should we auto-create Author records for unmatched book authors?
2. How to handle author name variations (e.g., "Mark Twain" vs "Samuel Clemens")?
3. Should we add `authorId` requirement for new book imports?

## Timeline

- **Week 1**: Review & approve design
- **Week 2**: Implement database changes & migration
- **Week 3**: Update backend API
- **Week 4**: Update iOS app & release
