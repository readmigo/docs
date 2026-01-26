# Timezone Handling Design

## Overview

本文档定义 Readmigo 全栈时区处理规范，确保：
- 服务全球用户
- 数据统计准确
- Bug 排查高效

---

## Design Principles

### Core Rule: UTC Everywhere, Local Display

```
┌─────────────────────────────────────────────────────────────────┐
│                        GOLDEN RULE                               │
│                                                                  │
│   Storage & Transmission: Always UTC                            │
│   Display & User Input: Convert to/from User's Local Time       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why UTC?

| Aspect | UTC Approach | Local Time Approach |
|--------|--------------|---------------------|
| Storage consistency | Single source of truth | Ambiguous during DST |
| Cross-timezone queries | Simple range queries | Complex conversions |
| Data aggregation | Direct comparison | Requires normalization |
| Debug tracing | One timeline | Multiple timelines |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   iOS/Android/Web Client                                                 │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  User sees: "2026-01-13 09:45 (Beijing Time)"               │       │
│   │  User inputs: Local time picker                              │       │
│   │  Sends to API: ISO 8601 UTC "2026-01-13T01:45:00.000Z"      │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                              │                                           │
│                              ▼                                           │
│   Backend API                                                            │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  Receives: UTC timestamp                                     │       │
│   │  Processes: UTC only (setUTCHours, getUTCDate, etc.)        │       │
│   │  Logs: UTC with ISO 8601 format                              │       │
│   │  Returns: UTC timestamp                                      │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                              │                                           │
│                              ▼                                           │
│   Database (PostgreSQL)                                                  │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  Column type: TIMESTAMP WITH TIME ZONE                       │       │
│   │  Storage: UTC (always)                                       │       │
│   │  Queries: UTC boundaries                                     │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Standards

### 1. Database Layer

#### Schema Definition (Prisma)

```prisma
model User {
  id           String    @id @default(uuid())
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  lastActiveAt DateTime? @map("last_active_at")

  @@map("users")
}
```

#### PostgreSQL Storage

| Column Type | Storage | Recommendation |
|-------------|---------|----------------|
| `TIMESTAMP WITH TIME ZONE` | UTC internally | **Use this** |
| `TIMESTAMP WITHOUT TIME ZONE` | No timezone info | Avoid |
| `DATE` | Date only (no time) | For date-only fields |

#### Query Examples

```sql
-- Correct: Query today's data (UTC)
SELECT * FROM users
WHERE last_active_at >= '2026-01-13T00:00:00Z'
  AND last_active_at < '2026-01-14T00:00:00Z';

-- Wrong: Using server local time
SELECT * FROM users
WHERE last_active_at >= CURRENT_DATE;  -- Depends on server timezone
```

---

### 2. Backend Layer (Node.js/NestJS)

#### Date Boundary Calculations

```typescript
// ✅ CORRECT: Use UTC methods
function getTodayUTCBoundaries(): { start: Date; end: Date } {
  const now = new Date();

  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

// ❌ WRONG: Using local timezone methods
function getTodayBoundaries(): { start: Date; end: Date } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);  // Server timezone dependent!
  // ...
}
```

#### UTC Method Reference

| Local Method | UTC Equivalent | Usage |
|--------------|----------------|-------|
| `getDate()` | `getUTCDate()` | Day of month |
| `getMonth()` | `getUTCMonth()` | Month (0-11) |
| `getFullYear()` | `getUTCFullYear()` | Year |
| `getHours()` | `getUTCHours()` | Hour |
| `setDate()` | `setUTCDate()` | Set day |
| `setMonth()` | `setUTCMonth()` | Set month |
| `setFullYear()` | `setUTCFullYear()` | Set year |
| `setHours()` | `setUTCHours()` | Set hour |

#### Creating Timestamps

```typescript
// ✅ CORRECT: new Date() returns UTC internally
const now = new Date();  // OK - represents current moment in UTC

// ✅ CORRECT: ISO string parsing
const timestamp = new Date('2026-01-13T01:45:00.000Z');

// ❌ WRONG: Ambiguous local time string
const timestamp = new Date('2026-01-13 09:45:00');  // Which timezone?
```

#### API Response Format

```typescript
// ✅ CORRECT: Return ISO 8601 UTC format
{
  "createdAt": "2026-01-13T01:45:00.000Z",
  "lastActiveAt": "2026-01-13T01:45:00.000Z"
}

// ❌ WRONG: Return formatted local time
{
  "createdAt": "2026-01-13 09:45:00",
  "lastActiveAt": "Jan 13, 2026 9:45 AM"
}
```

---

### 3. Client Layer (iOS/Android/Web)

#### Receiving UTC, Displaying Local

```swift
// iOS Example
let utcDate = ISO8601DateFormatter().date(from: "2026-01-13T01:45:00.000Z")!

// Display in user's local timezone
let formatter = DateFormatter()
formatter.timeZone = TimeZone.current  // User's timezone
formatter.dateStyle = .medium
formatter.timeStyle = .short
let displayString = formatter.string(from: utcDate)
// Beijing timezone: "Jan 13, 2026 at 9:45 AM"
// New York timezone: "Jan 12, 2026 at 8:45 PM"
```

```typescript
// Web/React Example
const utcDate = new Date('2026-01-13T01:45:00.000Z');

// Display in user's local timezone
const displayString = utcDate.toLocaleString('en-US', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
});
```

#### Sending Local Input as UTC

```swift
// iOS: User picks local time, send as UTC
let localDate = datePicker.date  // User selected 9:45 AM Beijing time
let utcString = ISO8601DateFormatter().string(from: localDate)
// Sends: "2026-01-13T01:45:00.000Z"
```

---

### 4. Logging & Debugging

#### Log Format Standard

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LOG FORMAT                                       │
├────────────────────────────────────────────────────────────────────────┤
│  [2026-01-13T01:45:00.000Z] [correlationId] [level] message            │
│                                                                         │
│  Always include:                                                        │
│  - UTC timestamp in ISO 8601                                           │
│  - Correlation ID for request tracing                                  │
│  - User's timezone (when relevant)                                     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Example Log Entry

```json
{
  "timestamp": "2026-01-13T01:45:00.000Z",
  "correlationId": "abc-123-def",
  "level": "INFO",
  "message": "User activity updated",
  "context": {
    "userId": "user-456",
    "userTimezone": "Asia/Shanghai",
    "userLocalTime": "2026-01-13T09:45:00+08:00"
  }
}
```

---

## Debug & Troubleshooting

### Time Conversion Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                  TIMEZONE CONVERSION TABLE                       │
├─────────────────────────────────────────────────────────────────┤
│  UTC        │ Beijing (UTC+8) │ New York (UTC-5) │ London (UTC) │
├─────────────┼─────────────────┼──────────────────┼──────────────┤
│  00:00      │ 08:00           │ 19:00 (prev day) │ 00:00        │
│  06:00      │ 14:00           │ 01:00            │ 06:00        │
│  12:00      │ 20:00           │ 07:00            │ 12:00        │
│  18:00      │ 02:00 (next)    │ 13:00            │ 18:00        │
└─────────────┴─────────────────┴──────────────────┴──────────────┘

Note: Daylight Saving Time may affect offset by ±1 hour
```

### Debugging Checklist

When a user reports a time-related issue:

```
1. [ ] Get user's timezone
   └── Ask: "What timezone are you in?" or check device settings

2. [ ] Get user's reported time
   └── Ask: "What time did you see on your screen?"

3. [ ] Convert to UTC
   └── User time (Beijing 09:45) → UTC (01:45)

4. [ ] Query database with UTC
   └── SELECT * FROM table WHERE created_at = '2026-01-13T01:45:00Z'

5. [ ] Check server logs with UTC timestamp
   └── grep "2026-01-13T01:45" /var/log/app.log

6. [ ] Verify client-side conversion
   └── Is the client correctly converting UTC → local display?
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| DAU shows 0 but users are active | Using `setHours()` instead of `setUTCHours()` | Use UTC methods |
| Events appear on wrong day | Server timezone ≠ UTC | Set server to UTC or use UTC methods |
| User sees wrong time | Client not converting UTC to local | Add timezone conversion on display |
| "Yesterday" data missing | Date boundary off by hours | Use UTC midnight boundaries |

---

## Statistics & Analytics

### Daily Statistics Aggregation

```
┌─────────────────────────────────────────────────────────────────┐
│              DAILY STATS BOUNDARY (UTC)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Day N (UTC):                                                   │
│  Start: YYYY-MM-DDT00:00:00.000Z                                │
│  End:   YYYY-MM-(DD+1)T00:00:00.000Z (exclusive)                │
│                                                                  │
│  Example: "2026-01-13" (UTC)                                    │
│  Start: 2026-01-13T00:00:00.000Z                                │
│  End:   2026-01-14T00:00:00.000Z                                │
│                                                                  │
│  In Beijing time (UTC+8):                                       │
│  Start: 2026-01-13 08:00:00                                     │
│  End:   2026-01-14 08:00:00                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cron Job Scheduling

```typescript
// ✅ CORRECT: Cron runs at 1 AM UTC, processes previous UTC day
@Cron('0 1 * * *')  // 1:00 AM UTC daily
async calculateDailyStats() {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  // Process yesterday's UTC day
}
```

### User-Facing Reports

For user-facing time displays (e.g., "Your reading history"):

```typescript
// Convert UTC stats to user's local date for display
function formatUserDate(utcDate: Date, userTimezone: string): string {
  return utcDate.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

---

## Server Configuration

### Recommended Settings

```bash
# Server timezone should be UTC
TZ=UTC

# Node.js - force UTC
TZ=UTC node app.js

# Docker
ENV TZ=UTC

# fly.io (fly.toml)
[env]
  TZ = "UTC"
```

### Verification

```bash
# Check server timezone
date
# Expected: Mon Jan 13 01:45:00 UTC 2026

# Node.js check
node -e "console.log(new Date().toISOString())"
# Expected: 2026-01-13T01:45:00.000Z
```

---

## Code Review Checklist

When reviewing timezone-related code:

```
[ ] All date boundary calculations use UTC methods
    - setUTCHours() instead of setHours()
    - setUTCDate() instead of setDate()
    - getUTCFullYear() instead of getFullYear()

[ ] API responses use ISO 8601 UTC format
    - "2026-01-13T01:45:00.000Z" (with Z suffix)

[ ] Database queries use UTC boundaries
    - No CURRENT_DATE or NOW() without explicit UTC

[ ] Client displays convert UTC to local time
    - Using toLocaleString() with user's timezone

[ ] Logs include UTC timestamp
    - ISO 8601 format for searchability

[ ] User timezone is captured (when needed)
    - For personalized reports or debugging
```

---

## Migration Notes

### Fixing Existing Code

When migrating from local time to UTC:

1. **Audit** all `setHours()`, `getDate()`, etc. calls
2. **Replace** with UTC equivalents
3. **Test** with server in different timezones
4. **Verify** cron jobs produce consistent results

### Testing Timezone Handling

```typescript
// Unit test: Verify UTC boundary calculation
describe('getTodayUTCBoundaries', () => {
  it('should return UTC midnight boundaries', () => {
    // Mock: 2026-01-13T15:30:00Z
    jest.useFakeTimers().setSystemTime(new Date('2026-01-13T15:30:00Z'));

    const { start, end } = getTodayUTCBoundaries();

    expect(start.toISOString()).toBe('2026-01-13T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-01-14T00:00:00.000Z');
  });
});
```

---

## Summary

| Layer | Storage | Transmission | Display |
|-------|---------|--------------|---------|
| Database | UTC (TIMESTAMP WITH TIME ZONE) | - | - |
| Backend | UTC | ISO 8601 UTC | - |
| API | - | ISO 8601 UTC (`...Z`) | - |
| Client | UTC internally | ISO 8601 UTC | User's local time |
| Logs | UTC | - | - |

**Remember**: Store UTC, Transmit UTC, Display Local.
