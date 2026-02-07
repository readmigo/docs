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

### 2.2 New Field Semantics

| Field | Purpose | Values |
|-------|---------|--------|
| `language` | Content language filter | `'en'` (English), `'zh'` (Chinese), `'all'` (both) |
| `level` | Hierarchy depth | 0 = Root, 1 = Secondary, 2 = Tertiary |
| `parentId` | Parent category reference | NULL for root categories |

---

#### GET `/categories/cascade` - Get Category Path

**Example Response:**

---

### 6.1 Category List - Show Both Names

The dashboard should continue to show both Chinese and English names, as it's the only place where Chinese content is visible.

---

### 8.2 Interaction Rules

1. **Initial State**: Only Level 0 (root) categories are shown
2. **Select L0**: Level 1 categories appear, showing only children of selected L0
3. **Select L1**: Level 2 categories appear, showing only children of selected L1
4. **Clear Selection**: Clicking "All" at any level clears that level and all levels below
5. **Breadcrumb**: Shows current path, clickable to jump back to any level

### 8.3 Future Chinese Content Support

When Chinese content is added:

---

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

### GET `/categories/cascade?language=en`

Initial state (nothing selected):

### GET `/categories/cascade?language=en&selectedIds=uuid-1`

After selecting "Fiction" (L0):

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

### 12.1 Design Goals

| Goal | Description |
| ---- | ----------- |
| **Single Source of Truth** | One configuration controls the entire stack |
| **Zero Code Change** | Toggle Chinese content without deployment |
| **Ops-Friendly** | Dashboard toggle for non-technical operators |
| **Gradual Rollout** | Can enable per-category or per-user-segment |
| **Audit Trail** | Track when and who enabled/disabled |

### 12.2 Configuration Model

**Feature Flag Entry:**

#### Client Config Endpoint

**Example Response (Chinese disabled):**

**Example Response (Chinese enabled):**

### 12.8 Gradual Rollout Options

The feature flag value supports several rollout strategies:

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

### 13.1 Overview

Three fully isolated environments with independent data, configurations, and feature flags:

| Environment | Purpose | Data | Feature Flags | Access |
| ----------- | ------- | ---- | ------------- | ------ |
| **Local** | Development | Debug Snapshot | All enabled | Developer only |
| **Staging** | QA/UAT testing | Test data (copy of prod structure) | Configurable | Team + Beta testers |
| **Production** | Live users | Real user data | Conservative | All users |

### 13.7 System Configuration Initialization

> ⚠️ **注意**: 此脚本仅用于初始化系统配置（Feature Flags），不得用于业务数据。所有业务数据必须从真实数据源生成。

### 13.9 Testing Strategy Per Environment

| Test Type | Local | Staging | Production |
| --------- | ----- | ------- | ---------- |
| Unit Tests | ✅ All | ✅ All | - |
| Integration Tests | ✅ Full | ✅ Full | - |
| E2E Tests | ✅ Full | ✅ Full | ✅ Smoke only |
| Load Tests | - | ✅ Full | - |
| Feature Flag Tests | ✅ All ON | ✅ Configured | ✅ Read-only verify |

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

### Implementation Priority

| Phase | Scope | Deliverables |
| ----- | ----- | ------------ |
| **Phase 1** | Backend Core | FeatureFlag model, EnvironmentService, /config/client endpoint |
| **Phase 2** | Dashboard | Environment selector, Flag management, Chinese content panel |
| **Phase 3** | iOS Client | EnvironmentManager, AppConfigManager, Debug switcher |
| **Phase 4** | Category Cascade | /categories/cascade endpoint, iOS cascade UI |
| **Phase 5** | Infrastructure | Staging environment setup, CI/CD pipeline |
| **Phase 6** | Testing | E2E tests per environment, load tests on staging |
