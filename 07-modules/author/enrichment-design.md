# Author Data Enrichment - Design Document

## Overview

This document outlines the approach for enriching author profile data in Readmigo. The goal is to transform author pages from simple name listings into rich, educational profiles that show the author's place in literary and world history.

---

## Phase 1: Basic Enrichment (COMPLETED)

### Status: Done

Successfully enriched 90+ authors with basic data from Wikidata + Wikipedia:

| Field | Coverage | Source |
|-------|----------|--------|
| `bio` | 95/109 (87%) | Wikipedia |
| `bioZh` | 95/109 (87%) | Chinese Wikipedia / Wikidata |
| `era` | 91/109 (83%) | Wikidata (P569/P570) |
| `nationality` | 90/109 (83%) | Wikidata (P27) |
| `birthPlace` | 88/109 (81%) | Wikidata (P19) |
| `avatarUrl` | 109/109 (100%) | R2/Wikidata Commons |
| `aiPersonaPrompt` | 95/109 (87%) | Generated |

### Script Location
```
packages/database/scripts/enrich-authors-v2.ts
```

---

## Phase 2: Extended Author Data (COMPLETED)

### Status: Done

Successfully enriched 140 authors with extended data from Wikidata:

| Field | Coverage | Source |
|-------|----------|--------|
| `nameZh` | 106/140 (75.7%) | Wikidata zh/zh-hans/zh-hant labels |
| `aliases` | 77/140 (55.0%) | Wikidata P742/P1559/aliases |
| `famousWorks` | 90/140 (64.3%) | Wikidata P800 |
| `literaryPeriod` | 61/140 (43.6%) | Wikidata P135 |
| `primaryGenres` | 29/140 (20.7%) | Wikidata P136 |

### Script Location

```
packages/database/scripts/enrich-authors-phase2.ts
```

### Usage

### Wikidata Properties Used

| Property | Description | Field |
|----------|-------------|-------|
| labels (zh/zh-hans/zh-hant) | Chinese name | `nameZh` |
| P742 | Pseudonym | `aliases` |
| P1559 | Name in native language | `aliases` |
| aliases (en) | Wikidata aliases | `aliases` |
| P800 | Notable work | `famousWorks` |
| P135 | Movement | `literaryPeriod` |
| P136 | Genre | `primaryGenres` |

### Literary Movement Mappings

The script includes predefined mappings for 30+ literary movements:

| Wikidata QID | Movement |
|--------------|----------|
| Q667661 | Romanticism |
| Q3766313 | Realism |
| Q37068 | Modernism |
| Q850990 | Postmodernism |
| Q170583 | Naturalism |
| Q7066 | Existentialism |
| Q756100 | Transcendentalism |
| Q193034 | Lost Generation |
| Q1282815 | Beat Generation |
| Q183272 | Magical Realism |
| ... | (and more) |

### Genre Mappings

The script includes predefined mappings for 30+ genres:

| Wikidata QID | Genre |
|--------------|-------|
| Q8261 | Novel |
| Q49084 | Short Story |
| Q482 | Poetry |
| Q25379 | Drama |
| Q1503443 | Science Fiction |
| Q1057172 | Fantasy |
| Q182015 | Horror Fiction |
| Q192881 | Dystopian Fiction |
| ... | (and more) |

---

## Phase 3: Author Quotes (COMPLETED)

### Status: Done

Successfully enriched authors with quotes from Wikiquote (English + Chinese):

| Metric | Value |
|--------|-------|
| Authors with quotes | 92/140 (65.7%) |
| Total quotes | 678 |
| Quotes with Chinese | 242/678 (35.7%) |

### Script Location

```
packages/database/scripts/enrich-authors-phase3-quotes.ts
```

### Usage

### Data Sources

| Source | Language | Coverage |
|--------|----------|----------|
| English Wikiquote | English | Primary source for quote text |
| Chinese Wikiquote | Chinese | Chinese translations (textZh) |

### Implementation Details

1. **Quote Count Sync**: Automatically syncs `author.quoteCount` from `AuthorQuote` records
2. **Wikiquote Fetching**: Fetches quotes from both English and Chinese Wikiquote APIs
3. **Deduplication**: Checks for existing quotes before creating new records
4. **Multi-language**: Stores both English text and Chinese translations

### Authors Without Quotes

Some authors don't have Wikiquote pages. For these, consider:
- Manual curation from other sources (Goodreads, BrainyQuote)
- AI-generated quotes (with proper attribution)

---

## Phase 4: Author Timeline Events (COMPLETED)

### Status: Done

Successfully enriched authors with timeline events from era field and Wikidata:

| Metric | Value |
|--------|-------|
| Authors with timeline | 57/140 (40.7%) |
| Total timeline events | 307 |
| WORK events | 143 |
| BIRTH events | 59 |
| DEATH events | 58 |
| AWARD events | 23 |
| EDUCATION events | 14 |
| MAJOR_EVENT events | 10 |

### Script Location

```
packages/database/scripts/enrich-authors-phase4-timeline.ts
```

### Usage

### Wikidata Properties Used

| Property | Description | Category |
|----------|-------------|----------|
| P569 | Date of birth | BIRTH |
| P19 | Place of birth | BIRTH |
| P570 | Date of death | DEATH |
| P20 | Place of death | DEATH |
| P69 | Educated at | EDUCATION |
| P800 | Notable work | WORK |
| P577 | Publication date | WORK |
| P166 | Award received | AWARD |
| P585 | Point in time | AWARD |

### Data Structure

### Data Sources

| Category | Wikidata Property |
|----------|-------------------|
| Birth | P569 |
| Death | P570 |
| Education | P69 (educated at) |
| Notable Works | P800 (with publication dates) |
| Awards | P166 (award received) |

---

## Phase 5: Civilization Map (COMPLETED)

### Status: Done

Successfully enriched authors with civilization map data from Wikidata:

| Metric | Value |
|--------|-------|
| Authors with literary movement | 61/140 (43.6%) |
| Authors with historical period | 98/140 (70.0%) |
| AuthorInfluence records | 67 |
| - PREDECESSOR relationships | 67 |

### Script Location

```
packages/database/scripts/enrich-authors-phase5-civilization.ts
```

### Usage

### Enrichment Sources

| Field | Source |
|-------|--------|
| `literaryMovement` | Derived from `literaryPeriod` (Phase 2) |
| `historicalPeriod` | Derived from era (birth/death years) |
| AuthorInfluence (PREDECESSOR) | Wikidata P737 (influenced by) |
| AuthorInfluence (PREDECESSOR) | Wikidata P738 (influenced - reverse) |
| AuthorInfluence (MENTOR) | Wikidata P1066 (student of) |
| AuthorInfluence (MENTOR) | Wikidata P802 (students - reverse) |

### Historical Period Mappings

| Year Range | Period |
|------------|--------|
| < 500 | Classical Antiquity |
| 500-1000 | Early Medieval |
| 1000-1300 | High Medieval |
| 1300-1500 | Late Medieval |
| 1500-1600 | Renaissance |
| 1600-1700 | Early Modern |
| 1700-1790 | Enlightenment |
| 1790-1850 | Romantic Era |
| 1850-1890 | Victorian Era |
| 1890-1920 | Edwardian Era |
| 1920-1945 | Interwar Period |
| 1945-1970 | Post-War Era |
| 1970-2000 | Late 20th Century |
| > 2000 | Contemporary |

### Concept

Show where an author fits in the broader context of world civilization and literary history. This helps users understand the author's significance and connections.

### 5.1 Literary Coordinates

### 5.2 World Context Map

For each author, show their position relative to:

| Dimension | Example (Mark Twain) |
|-----------|---------------------|
| **Literary Period** | American Realism (1850-1900) |
| **Contemporaries** | Henry James, Louisa May Alcott, Herman Melville |
| **Influenced By** | Charles Dickens, Cervantes |
| **Influenced** | Ernest Hemingway, William Faulkner |
| **Historical Context** | Civil War, Reconstruction, Gilded Age |
| **Cultural Movements** | Transcendentalism → Realism → Naturalism |

### 5.3 Visual Representation

```
                    WORLD LITERATURE TIMELINE

   1800        1850        1900        1950        2000
    |           |           |           |           |

BRITISH   [Dickens]----[Hardy]----[Woolf]----[Orwell]
                \
AMERICAN        [Twain]----[Hemingway]----[Steinbeck]
                  |              |
RUSSIAN    [Dostoevsky]----[Chekhov]----[Nabokov]

FRENCH     [Hugo]----[Zola]----[Camus]----[Sartre]
```

### 5.4 Wikidata Properties for Civilization Map

| Property | Description | Use |
|----------|-------------|-----|
| P135 | movement | Literary period/school |
| P737 | influenced by | Predecessors |
| P738 | influenced | Successors |
| P1066 | student of | Direct mentorship |
| P802 | students | Writers they taught |
| P551 | residence | Geographic context |
| P27 | country of citizenship | National literature |
| P106 | occupation | Beyond "writer" |

### 5.5 Implementation

---

## Database Schema (Current)

The Author model already includes all Phase 2 fields:

---

## Implementation Roadmap

| Phase | Task | Priority | Status |
|-------|------|----------|--------|
| 1 | Basic enrichment (bio, era, nationality) | High | DONE |
| 2.1 | Add nameZh (Chinese names) | High | DONE |
| 2.2 | Add famousWorks (notable works) | High | DONE |
| 2.3 | Add literaryPeriod | High | DONE |
| 2.4 | Add aliases (pen names, real names) | Medium | DONE |
| 2.5 | Add primaryGenres | Medium | DONE |
| 3.1 | Sync author quoteCount | High | DONE |
| 3.2 | Fetch quotes from Wikiquote | High | DONE |
| 3.3 | Add Chinese translations | Medium | PARTIAL |
| 4 | Generate timeline events | Medium | DONE |
| 5.1 | Add influence relationships | Medium | DONE |
| 5.2 | Add literary movement/historical period | Medium | DONE |
| 5.3 | Build civilization map UI | Medium | TODO |
| 5.4 | Add historical context | Low | TODO |

---

## Data Source Summary

| Data | Primary Source | Fallback |
|------|----------------|----------|
| Bio | Wikipedia | Wikidata description |
| Chinese name | Wikidata zh label | - |
| Era/Dates | Wikidata P569/P570 | Wikipedia parsing |
| Nationality | Wikidata P27 | - |
| Literary period | Wikidata P135 | AI classification |
| Famous works | Wikidata P800 | Open Library |
| Influences | Wikidata P737/P738 | - |
| Timeline | Wikidata claims | AI extraction |

---

## API Response Enhancement

Current author detail response needs to include:

---

*Document created: 2025-12-27*
*Last updated: 2025-12-28*
*Phase 1 completed: 2025-12-27*
*Phase 2 completed: 2025-12-28*
*Phase 3 completed: 2025-12-28*
*Phase 4 completed: 2025-12-28*
*Phase 5 completed: 2025-12-28*
