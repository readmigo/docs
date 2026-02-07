# Localization Migration Plan

> 从双字段模式迁移到统一 translations 表

---

## 1. 当前状态分析

### 1.1 需要迁移的表

| 表名 | 当前字段 | 目标 | 优先级 |
|------|----------|------|--------|
| discover_tabs | name, name_en | name (English) + translations | P0 |
| categories | name, name_en | name (English) + translations | P0 |
| medals | name_zh, name_en, description_zh, description_en, design_story, design_story_en | name, description, design_story (English) + translations | P1 |
| book_lists | name, name_en, subtitle, description | name, subtitle, description (English) + translations | P1 |
| faq_categories | (待确认) | 同上 | P2 |
| faqs | (待确认) | 同上 | P2 |

### 1.2 已使用 translations 表的实体

| Entity Type | 状态 | 说明 |
|-------------|------|------|
| book | ✅ 已实现 | title, author, description |
| author | ✅ 已实现 | name, bio |
| genre | ✅ 已实现 | name |
| quote | ⚠️ 部分 | text |

### 1.3 translations 表索引状态

```
✅ translations_entity_type_entity_id_field_name_locale_key (UNIQUE)
✅ translations_entity_type_entity_id_idx
✅ translations_entity_type_entity_id_locale_idx
✅ translations_locale_idx
✅ translations_source_idx
```

---

## 2. 迁移执行计划

### Phase 1: DiscoverTab + Category (P0)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Phase 1: 核心 UI 实体迁移                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Step 1.1: 数据迁移脚本                                                  │
│  ═══════════════════════                                                 │
│                                                                          │
│  -- discover_tabs: 插入中文翻译                                          │
│  INSERT INTO translations (entity_type, entity_id, field_name,          │
│                            locale, value, source, status)               │
│  SELECT 'discoverTab', id::text, 'name', 'zh-Hans', name,              │
│         'migration', 'published'                                        │
│  FROM discover_tabs                                                     │
│  ON CONFLICT DO NOTHING;                                                │
│                                                                          │
│  -- discover_tabs: 更新源字段为英文                                      │
│  UPDATE discover_tabs SET name = name_en;                               │
│                                                                          │
│  -- discover_tabs: 删除 name_en 列                                       │
│  ALTER TABLE discover_tabs DROP COLUMN name_en;                         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Step 1.2: 更新 Prisma Schema                                            │
│  ════════════════════════════                                            │
│                                                                          │
│  model DiscoverTab {                                                     │
│    ...                                                                   │
│    name String @db.VarChar(50)  // English only, 删除 nameEn            │
│    ...                                                                   │
│  }                                                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Step 1.3: 更新 LocalizationService                                      │
│  ═══════════════════════════════════                                     │
│                                                                          │
│  LOCALIZABLE_FIELDS = {                                                  │
│    ...existing...                                                        │
│    discoverTab: ['name'],           // 新增                              │
│    category: ['name', 'description'], // 新增                            │
│  }                                                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Step 1.4: 更新 DiscoverCacheService                                     │
│  ════════════════════════════════════                                    │
│                                                                          │
│  Before:                                                                 │
│  name: isChinese ? tab.name : tab.nameEn                                │
│                                                                          │
│  After:                                                                  │
│  const localizedTabs = await localizationService.localizeEntities(      │
│    tabs, 'discoverTab', 'id', locale                                    │
│  );                                                                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Step 1.5: 刷新缓存                                                      │
│  ═════════════════                                                       │
│                                                                          │
│  POST /api/v1/recommendation/cache/refresh                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Medal 迁移 (P1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Phase 2: 勋章系统迁移                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Medal 当前字段:                                                         │
│  ├── name_zh, name_en                                                   │
│  ├── description_zh, description_en                                     │
│  └── design_story, design_story_en                                      │
│                                                                          │
│  迁移步骤:                                                               │
│  1. 插入中文翻译到 translations 表                                       │
│  2. 重命名 name_en → name, description_en → description                 │
│  3. 删除 _zh 和 _en 后缀列                                               │
│  4. 更新 Prisma schema                                                  │
│  5. 更新 MedalService 使用 LocalizationService                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: BookList, FAQ 迁移 (P2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Phase 3: 其他实体迁移                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BookList:                                                               │
│  ├── name, name_en → name (English) + translations                     │
│  ├── subtitle → subtitle (English) + translations                       │
│  └── description → description (English) + translations                 │
│                                                                          │
│  FAQ:                                                                    │
│  ├── question, question_en → question (English) + translations         │
│  └── answer, answer_en → answer (English) + translations               │
│                                                                          │
│  FAQCategory:                                                            │
│  └── name, name_en → name (English) + translations                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 代码修改清单

### 3.1 需要修改的文件

| 文件 | 修改内容 | Phase |
|------|----------|-------|
| `packages/database/prisma/schema.prisma` | 移除 nameEn 字段 | 1-3 |
| `apps/backend/src/common/localization/localization.service.ts` | 添加新 entityTypes | 1 |
| `apps/backend/src/modules/recommendation/jobs/refresh-discover-cache.job.ts` | 使用 LocalizationService | 1 |
| `apps/backend/src/modules/recommendation/recommendation.service.ts` | 更新 tabs 本地化 | 1 |
| `apps/backend/src/modules/medal/medal.service.ts` | 使用 LocalizationService | 2 |
| `apps/backend/src/modules/faq/faq.service.ts` | 使用 LocalizationService | 3 |

### 3.2 需要创建的迁移文件

| 迁移文件 | 内容 | Phase |
|----------|------|-------|
| 20260103_migrate_discover_tabs_to_translations | DiscoverTab 数据迁移 | 1 |
| 20260103_migrate_categories_to_translations | Category 数据迁移 | 1 |
| 20260104_migrate_medals_to_translations | Medal 数据迁移 | 2 |
| 20260105_migrate_faq_to_translations | FAQ/FAQCategory 数据迁移 | 3 |

迁移文件位于 `packages/database/prisma/migrations/` 目录下。

---

## 4. 验证检查清单

### 4.1 Phase 1 验证

- [ ] DiscoverTab 英文请求返回英文 name
- [ ] DiscoverTab zh-Hans 请求返回简体中文 name
- [ ] DiscoverTab zh-Hant 请求返回繁体中文 (或 fallback 到英文)
- [ ] Category 同上
- [ ] Redis 缓存正确生成各语言版本
- [ ] iOS App 显示正确

### 4.2 回滚方案

如果需要回滚 Phase 1:

1. 恢复 discover_tabs 表的 name_en 列
2. 将当前 name 值 (英文) 复制回 name_en
3. 从 translations 表恢复 zh-Hans 翻译值到 name 列
4. 对 categories 表执行同样操作

---

## 5. 时间线

| Phase | 内容 | 依赖 |
|-------|------|------|
| Phase 1a | 创建迁移脚本 | - |
| Phase 1b | 更新 LocalizationService | Phase 1a |
| Phase 1c | 更新 DiscoverCacheService | Phase 1b |
| Phase 1d | 测试 & 验证 | Phase 1c |
| Phase 2 | Medal 迁移 | Phase 1d |
| Phase 3 | FAQ/BookList 迁移 | Phase 2 |

---

## 6. 注意事项

### 6.1 不影响的部分

- Book, Author, Genre 已使用 translations 表，无需改动
- 翻译内容本身不受影响

### 6.2 风险点

| 风险 | 缓解措施 |
|------|----------|
| 数据丢失 | 先备份，迁移前后对比数据 |
| 缓存不一致 | 迁移后立即刷新所有缓存 |
| 线上故障 | 准备回滚脚本，低峰期执行 |

---

*Created: 2026-01-02*
