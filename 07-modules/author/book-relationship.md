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

#### API Changes

**BookDto (Response)**

**Endpoints affected:**
- `GET /books` - Include authorId in response
- `GET /books/:id` - Include authorId in response
- `GET /reading/library` - Include authorId in response

#### iOS Changes

**Book Model**

**Navigation Logic**

### Phase 2: Multiple Authors Support (Future)

For books with multiple authors, create a junction table:

## Migration Strategy

### Step 1: Add Column (Non-breaking)

### Step 2: Data Migration Script

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
