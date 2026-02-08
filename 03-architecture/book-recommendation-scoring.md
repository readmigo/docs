# Book Recommendation Scoring System

## Overview

Readmigo bookstore uses a multi-dimensional scoring algorithm to rank books for the discovery/recommendation page. Scores are pre-calculated and cached for performance.

## Final Score Formula

```
finalScore = rating x 0.35 + quality x 0.25 + popularity x 0.30 + freshness x 0.10
```

Books are sorted by `finalScore DESC`, then `createdAt DESC` as tiebreaker.

## Score Dimensions

### 1. Rating Score (weight: 35%) - Highest Priority

Community ratings from Goodreads and Douban. Takes the higher normalized value.

| Source | Raw Range | Normalization |
|--------|-----------|---------------|
| Goodreads | 1-5 | (rating - 1) / 4 |
| Douban | 1-10 | (rating - 1) / 9 |

Books without any rating get 0 for this dimension.

### 2. Quality Score (weight: 25%)

Measures intrinsic book quality based on metadata and reading outcomes.

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Classic / Award Winner | 30% | isClassic +0.6, isAwardWinner +0.4 (max 1.0) |
| Editorial Score | 30% | editorialScore / 10 (default 0.5 if null) |
| Completion Rate | 25% | readCompleteCount / readStartCount |
| Reading Depth | 15% | avg reading time (60%) + highlight density (40%) |

### 3. Popularity Score (weight: 30%)

Measures user engagement and trending signals.

| Factor | Weight | Calculation |
|--------|--------|-------------|
| View Heat | 20% | log10(totalViews) x 0.6 + log10(recentViews) x 0.4 |
| Collection Heat | 20% | log10(bookshelfCount) |
| Reading Heat | 30% | log10(readStarts) x 0.4 + log10(completes) x 0.3 + log10(minutes) x 0.3 |
| Interaction Heat | 20% | log10(highlights) x 0.5 + log10(aiInteractions) x 0.5 |
| Growth Trend | 10% | recent7dViews / totalViews (normalized by 0.2 threshold) |

All values use log-normalization: `min(1, log10(value + 1) / maxLog)`

### 4. Freshness Score (weight: 10%)

Time-decay function based on book creation date.

```
Days 0-30:   1.0 -> 0.5  (linear decay)
Days 30-90:  0.5 -> 0.1  (linear decay)
Days 90+:    0.1          (floor)
```

## Score Update Schedule

| Trigger | Frequency | Scope |
|---------|-----------|-------|
| Hourly cron | Every hour | All active books |
| Daily recalculation | 02:00 UTC daily | All active books (full recalc) |
| Manual trigger | On demand | All or specific books |

## Data Flow

```
BookDailyStats + BookStats + Book metadata
        |
        v
  BookScoreService.getBookMetrics()
        |
        v
  ScoreCalculator.calculateAllScores()
        |
        v
  BookScore table (upsert)
        |
        v
  DiscoverCacheService.buildBooksCache()
        |
        v
  Redis cache -> API response
```

## Cache Architecture

```
DiscoverCacheService
  |
  +-- Tabs cache:  discover:tabs:{locale}
  |     TTL: configurable
  |
  +-- Books cache: discover:books:{categoryId|all}:{locale}
        TTL: configurable
        Contains: pre-sorted BookWithScore[] + total + generatedAt
```

Client-side filtering applied on top of cached results:
1. Exclude user's already-read books
2. Difficulty filtering based on user's English level

## Known Issues

### Douban ratings not yet populated

Douban ratings have 0% coverage (0/1326 books). Future work: batch-import Douban ratings for Chinese locale users.

## Source Files

| File | Description |
|------|-------------|
| `src/modules/recommendation/services/score-calculator.ts` | Core scoring algorithms |
| `src/modules/recommendation/services/book-score.service.ts` | Metrics collection + score persistence |
| `src/modules/recommendation/services/discover-cache.service.ts` | Cache building + localization |
| `src/modules/recommendation/jobs/update-book-scores.job.ts` | Cron job scheduling |
| `src/modules/recommendation/recommendation.service.ts` | API layer + personalization filters |

## Rating Data Coverage

| Source | Books with rating | Coverage |
|--------|------------------|----------|
| Goodreads | 1174 / 1326 | 88.5% |
| Douban | 0 / 1326 | 0% |
| Neither | 152 / 1326 | 11.5% |

Goodreads rating range: 2.14 - 4.89 (avg 3.82)
