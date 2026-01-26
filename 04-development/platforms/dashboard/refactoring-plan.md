# Dashboard: Global Content Language Switch

### Goal
Dashboard should have a **global switch** to select content language (English/Chinese). Once selected, all operations work with that language's content only - no per-page selection needed.

### Design Principle
- **One-time selection**: User selects language once in global settings/header
- **No mixed content**: After selection, all pages only show content of that language
- **No per-item selection**: Creating/editing content doesn't require language selection
- **Context-aware**: All operations inherit the global language context

### Benefits

1. **Simpler UX**: No need to think about language for each operation
2. **No mistakes**: Can't accidentally mix content
3. **Cleaner UI**: No language tabs/filters on every page
4. **Consistent context**: All related data filtered together
