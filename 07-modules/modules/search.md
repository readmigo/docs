# Search 模块

> 搜索功能系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 书籍搜索 | 标题、作者、ISBN 搜索 | P0 |
| 分类搜索结果 | 作者/书籍/语录分组展示 | P0 |
| 搜索历史 | 最近搜索记录 | P0 |
| 热门搜索 | 平台热搜词汇 | P1 |
| 自动补全 | 输入时实时建议 | P1 |
| 书内全文搜索 | 阅读器内容搜索 | P1 |
| 高级筛选 | 类型、难度、语言筛选 | P1 |
| 拼音搜索 | 支持拼音搜索中文 | P2 |
| 别名搜索 | 作者中英文名互搜 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 搜索栏 | Compose TextField | 自定义组件 | Cmd+K 弹窗 |
| 本地搜索 | Room FTS | SQLite FTS5 | IndexedDB |
| 远程搜索 | Retrofit | Axios + React Query | Server Actions |
| 防抖 | Flow debounce | lodash.debounce | use-debounce |
| 状态管理 | StateFlow | Zustand | Zustand |

---

## 2. 数据模型

```typescript
// 搜索类型
type SearchType = 'all' | 'books' | 'authors' | 'users' | 'content';

// 搜索查询
interface SearchQuery {
  query: string;
  type?: SearchType;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

// 搜索筛选
interface SearchFilters {
  genres?: string[];
  difficulty?: DifficultyLevel[];
  language?: string[];
  hasAudiobook?: boolean;
  isFree?: boolean;
  minRating?: number;
  sortBy?: SearchSortOption;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type SearchSortOption = 'relevance' | 'newest' | 'popular' | 'rating';

// 统一搜索结果
interface UnifiedSearchResult {
  query: string;
  results: SearchResults;
}

interface SearchResults {
  authors: SearchSection<AuthorSearchResult>;
  books: SearchSection<BookSearchResult>;
  quotes: SearchSection<QuoteSearchResult>;
}

interface SearchSection<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// 书籍搜索结果
interface BookSearchResult {
  type: 'book';
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    category?: string;
    rating?: number;
    difficulty?: DifficultyLevel;
    hasAudiobook?: boolean;
    isInLibrary: boolean;
  };
  highlight?: {
    title?: string;
    author?: string;
  };
}

// 作者搜索结果
interface AuthorSearchResult {
  type: 'author';
  author: {
    id: string;
    name: string;
    nameZh?: string;
    bookCount: number;
    avatarUrl?: string;
  };
}

// 语录搜索结果
interface QuoteSearchResult {
  type: 'quote';
  quote: {
    id: string;
    text: string;
    bookId: string;
    bookTitle: string;
  };
}

// 搜索建议
interface SearchSuggestion {
  type: 'history' | 'trending' | 'autocomplete' | 'book' | 'author';
  text: string;
  icon?: string;
  metadata?: Record<string, any>;
}

// 搜索历史
interface SearchHistory {
  id: string;
  query: string;
  type: SearchType;
  timestamp: Date;
}

// 热门搜索
interface PopularSearch {
  term: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// 书内搜索结果
interface InBookSearchResult {
  cfi: string;
  chapter: string;
  chapterIndex: number;
  excerpt: string;
  matchStart: number;
  matchEnd: number;
}
```

---

## 3. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/search` | GET | 统一搜索 |
| `/search/suggestions` | GET | 搜索建议 |
| `/search/popular` | GET | 热门搜索 |
| `/search/trending` | GET | 今日热搜 |
| `/search/content/{bookId}` | GET | 书内全文搜索 |

### 请求参数

```typescript
// GET /search
interface SearchParams {
  q: string;              // 搜索关键词
  type?: SearchType;      // 搜索类型
  limit?: number;         // 每类结果数量
  page?: number;          // 分页
  // 筛选条件
  genres?: string[];
  difficulty?: string[];
  hasAudiobook?: boolean;
  isFree?: boolean;
  minRating?: number;
}
```

---

## 4. Android 实现

### 4.1 搜索历史管理

```kotlin
@Singleton
class SearchHistoryManager @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    companion object {
        private val SEARCH_HISTORY_KEY = stringSetPreferencesKey("search_history")
        private const val MAX_HISTORY_SIZE = 20
    }

    val searchHistory: Flow<List<String>> = dataStore.data.map { preferences ->
        preferences[SEARCH_HISTORY_KEY]?.toList() ?: emptyList()
    }

    suspend fun addSearch(query: String) {
        dataStore.edit { preferences ->
            val currentHistory = preferences[SEARCH_HISTORY_KEY]?.toMutableSet() ?: mutableSetOf()
            currentHistory.remove(query)
            val newHistory = listOf(query) + currentHistory.take(MAX_HISTORY_SIZE - 1)
            preferences[SEARCH_HISTORY_KEY] = newHistory.toSet()
        }
    }

    suspend fun clearHistory() {
        dataStore.edit { preferences ->
            preferences.remove(SEARCH_HISTORY_KEY)
        }
    }
}
```

### 4.2 ViewModel

```kotlin
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val searchRepository: SearchRepository,
    private val historyManager: SearchHistoryManager
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _suggestions = MutableStateFlow<List<SearchSuggestion>>(emptyList())
    val suggestions: StateFlow<List<SearchSuggestion>> = _suggestions.asStateFlow()

    private val _results = MutableStateFlow<UnifiedSearchResult?>(null)
    val results: StateFlow<UnifiedSearchResult?> = _results.asStateFlow()

    private var suggestionJob: Job? = null

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query

        suggestionJob?.cancel()

        if (query.length < 2) {
            _suggestions.value = emptyList()
            return
        }

        suggestionJob = viewModelScope.launch {
            delay(300) // 300ms debounce
            try {
                _suggestions.value = searchRepository.getSuggestions(query)
            } catch (e: Exception) {
                _suggestions.value = emptyList()
            }
        }
    }

    fun search(query: String) {
        viewModelScope.launch {
            historyManager.addSearch(query)
            _results.value = searchRepository.search(query)
        }
    }
}
```

### 4.3 搜索历史 UI

```kotlin
@Composable
fun SearchHistorySection(
    recentSearches: List<String>,
    onSelect: (String) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.padding(horizontal = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(R.string.search_recent),
                style = MaterialTheme.typography.titleMedium
            )
            TextButton(onClick = onClear) {
                Text(stringResource(R.string.search_clear))
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            recentSearches.take(10).forEach { term ->
                SearchHistoryChip(term = term, onClick = { onSelect(term) })
            }
        }
    }
}
```

### 4.4 分类搜索结果 UI

```kotlin
@Composable
fun CategorizedSearchResults(
    result: UnifiedSearchResult,
    onAuthorClick: (Author) -> Unit,
    onBookClick: (Book) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 作者结果
        if (result.results.authors.items.isNotEmpty()) {
            item {
                SearchCategorySection(
                    title = stringResource(R.string.search_category_authors),
                    icon = Icons.Filled.Person,
                    count = result.results.authors.total
                )
            }
            items(result.results.authors.items) { author ->
                AuthorSearchRow(author = author, onClick = { onAuthorClick(author) })
            }
        }

        // 书籍结果
        if (result.results.books.items.isNotEmpty()) {
            item {
                SearchCategorySection(
                    title = stringResource(R.string.search_category_books),
                    icon = Icons.Filled.MenuBook,
                    count = result.results.books.total
                )
            }
            items(result.results.books.items) { book ->
                BookSearchRow(book = book, onClick = { onBookClick(book) })
            }
        }
    }
}
```

---

## 5. React Native 实现

### 5.1 Zustand Store

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchState {
  query: string;
  type: SearchType;
  filters: SearchFilters;
  results: UnifiedSearchResult | null;
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  isLoading: boolean;
  isSearchActive: boolean;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setType: (type: SearchType) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setResults: (results: UnifiedSearchResult | null) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  addToHistory: (query: string, type: SearchType) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  setSearchActive: (active: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    immer((set) => ({
      query: '',
      type: 'all',
      filters: {},
      results: null,
      suggestions: [],
      history: [],
      isLoading: false,
      isSearchActive: false,

      setQuery: (query) => set((state) => { state.query = query; }),
      setType: (type) => set((state) => { state.type = type; }),
      setFilters: (filters) => set((state) => {
        state.filters = { ...state.filters, ...filters };
      }),
      setResults: (results) => set((state) => { state.results = results; }),
      setSuggestions: (suggestions) => set((state) => { state.suggestions = suggestions; }),

      addToHistory: (query, type) => set((state) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        state.history = state.history.filter(h => h.query !== trimmed);
        state.history.unshift({
          id: Date.now().toString(),
          query: trimmed,
          type,
          timestamp: new Date(),
        });
        if (state.history.length > 20) {
          state.history = state.history.slice(0, 20);
        }
      }),

      removeFromHistory: (id) => set((state) => {
        state.history = state.history.filter(h => h.id !== id);
      }),

      clearHistory: () => set((state) => { state.history = []; }),
      setSearchActive: (active) => set((state) => { state.isSearchActive = active; }),
      reset: () => set((state) => {
        state.query = '';
        state.results = null;
        state.suggestions = [];
        state.isSearchActive = false;
      }),
    })),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
```

### 5.2 搜索 Hook

```typescript
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

export function useSearch() {
  const { query, type, filters, setResults, addToHistory } = useSearchStore();

  const searchQuery = useInfiniteQuery({
    queryKey: ['search', query, type, filters],
    queryFn: async ({ pageParam = 1 }) => {
      return searchService.search({ query, type, filters, page: pageParam });
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    enabled: query.trim().length >= 2,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (searchQuery.data?.pages) {
      const allItems = searchQuery.data.pages.flatMap(p => p.items);
      setResults({ query, results: { ...allItems } });
    }
  }, [searchQuery.data]);

  const search = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery, type);
    }
  }, [addToHistory, type]);

  return { ...searchQuery, search };
}

export function useSearchSuggestions() {
  const { query, setSuggestions, history } = useSearchStore();

  const debouncedFetch = useRef(
    debounce(async (q: string) => {
      if (q.length < 2) {
        const historySuggestions = history.slice(0, 5).map(h => ({
          type: 'history' as const,
          text: h.query,
          icon: 'time-outline',
        }));
        setSuggestions(historySuggestions);
        return;
      }

      const suggestions = await searchService.getSuggestions(q);
      setSuggestions(suggestions);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedFetch(query);
  }, [query]);
}
```

### 5.3 搜索栏组件

```typescript
export function SearchBar({ onFocus, onCancel }: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const { query, setQuery, reset } = useSearchStore();
  const cancelWidth = useSharedValue(0);

  const handleFocus = () => {
    cancelWidth.value = withTiming(60, { duration: 200 });
    onFocus?.();
  };

  const handleCancel = () => {
    cancelWidth.value = withTiming(0, { duration: 200 });
    inputRef.current?.blur();
    reset();
    onCancel?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="搜索书籍、作者..."
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </Pressable>
        )}
      </View>

      <Animated.View style={[styles.cancelContainer, cancelAnimatedStyle]}>
        <Pressable onPress={handleCancel}>
          <Text style={styles.cancelText}>取消</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
```

---

## 6. Web 实现

### 6.1 Server Actions

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function search(params: SearchQuery): Promise<SearchResults> {
  const { query, type = 'all', filters = {}, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const results: SearchResults = {
    books: { items: [], total: 0, hasMore: false },
    authors: { items: [], total: 0, hasMore: false },
    quotes: { items: [], total: 0, hasMore: false },
  };

  // 搜索书籍
  if (type === 'all' || type === 'books') {
    const books = await searchBooks(query, filters, offset, limit);
    results.books = books;
  }

  // 搜索作者
  if (type === 'all' || type === 'authors') {
    const authors = await searchAuthors(query, offset, limit);
    results.authors = authors;
  }

  return results;
}

async function searchBooks(
  query: string,
  filters: SearchFilters,
  offset: number,
  limit: number
): Promise<SearchSection<BookSearchResult>> {
  const where: any = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { author: { contains: query, mode: 'insensitive' } },
    ],
  };

  if (filters?.genres?.length) {
    where.genres = { hasSome: filters.genres };
  }
  if (filters?.difficulty?.length) {
    where.difficulty = { in: filters.difficulty };
  }
  if (filters?.hasAudiobook !== undefined) {
    where.hasAudiobook = filters.hasAudiobook;
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, skip: offset, take: limit, orderBy: { rating: 'desc' } }),
    prisma.book.count({ where }),
  ]);

  return {
    items: books.map((book) => ({
      type: 'book',
      book: { id: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl, rating: book.rating, isInLibrary: false },
    })),
    total,
    hasMore: offset + limit < total,
  };
}

export async function getSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];

  const [books, authors] = await Promise.all([
    prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, title: true, author: true },
    }),
    prisma.book.groupBy({
      by: ['author'],
      where: { author: { contains: query, mode: 'insensitive' } },
      take: 3,
    }),
  ]);

  const suggestions: SearchSuggestion[] = [];

  books.forEach((book) => {
    suggestions.push({
      type: 'book',
      text: book.title,
      metadata: { id: book.id, author: book.author },
    });
  });

  authors.forEach((a) => {
    suggestions.push({
      type: 'author',
      text: a.author,
    });
  });

  return suggestions;
}
```

### 6.2 搜索弹窗

```tsx
'use client';

export function SearchDialog() {
  const { isDialogOpen, openDialog, closeDialog } = useSearchStore();
  const { query, results, suggestions, setQuery, search, selectSuggestion } = useSearch();

  // 全局快捷键 Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openDialog();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDialog]);

  return (
    <>
      <button onClick={openDialog} className="flex items-center gap-2 px-3 py-2 rounded-lg border">
        <span className="text-muted-foreground">搜索...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 text-xs border rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl p-0">
          <div className="p-4 border-b">
            <SearchInput value={query} onChange={setQuery} onSubmit={search} autoFocus />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {query ? (
              suggestions.length > 0 && !results ? (
                <SearchSuggestions suggestions={suggestions} onSelect={selectSuggestion} />
              ) : (
                <SearchResults />
              )
            ) : (
              <SearchHistory />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 6.3 搜索 Hook

```typescript
'use client';

import { useDebouncedCallback } from 'use-debounce';

export function useSearch() {
  const {
    query, type, filters, results, suggestions,
    setQuery, setResults, setSuggestions, addToHistory, reset
  } = useSearchStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const results = await search({ query, type, filters });
      setResults(results);
      addToHistory(query, type);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Search failed:', err);
      }
    }
  }, [query, type, filters]);

  const fetchSuggestions = useDebouncedCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const suggestions = await getSuggestions(q);
    setSuggestions(suggestions);
  }, 200);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  return { query, results, suggestions, setQuery, search: doSearch, reset };
}
```

---

## 7. 书内全文搜索

### React Native / Web 实现

```typescript
export function useBookSearch(bookId: string, rendition: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InBookSearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchBook = useCallback(async (searchQuery: string) => {
    if (!rendition || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const book = rendition.book;
      const searchResults: InBookSearchResult[] = [];

      for (let i = 0; i < book.spine.length; i++) {
        const section = book.spine.get(i);
        const doc = await section.load(book.load.bind(book));
        const text = doc.body.textContent || '';

        let match;
        const regex = new RegExp(escapeRegex(searchQuery), 'gi');

        while ((match = regex.exec(text)) !== null) {
          const start = Math.max(0, match.index - 50);
          const end = Math.min(text.length, match.index + match[0].length + 50);

          searchResults.push({
            cfi: section.cfiFromElement(doc.body),
            chapter: section.href,
            chapterIndex: i,
            excerpt: `...${text.slice(start, end)}...`,
            matchStart: match.index - start,
            matchEnd: match.index - start + match[0].length,
          });
        }
      }

      setResults(searchResults);
      setCurrentIndex(searchResults.length > 0 ? 0 : -1);
    } finally {
      setIsSearching(false);
    }
  }, [rendition]);

  const goToResult = useCallback((index: number) => {
    if (index >= 0 && index < results.length) {
      setCurrentIndex(index);
      rendition?.display(results[index].cfi);
    }
  }, [results, rendition]);

  const nextResult = () => currentIndex < results.length - 1 && goToResult(currentIndex + 1);
  const prevResult = () => currentIndex > 0 && goToResult(currentIndex - 1);

  return { query, setQuery, results, isSearching, currentIndex, search: searchBook, goToResult, nextResult, prevResult };
}
```

---

## 8. 本地化

```xml
<!-- Android strings.xml -->
<resources>
    <string name="search_hint">搜索书籍、作者…</string>
    <string name="search_recent">最近搜索</string>
    <string name="search_clear">清除</string>
    <string name="search_popular">热门搜索</string>
    <string name="search_trending">今日热搜</string>
    <string name="search_no_results">未找到相关结果</string>
    <string name="search_category_authors">作者</string>
    <string name="search_category_books">书籍</string>
    <string name="search_category_quotes">名言</string>
    <string name="search_more_authors">查看更多作者</string>
    <string name="search_more_books">查看更多书籍</string>
</resources>
```

---

## 9. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `search_query` | 执行搜索 | query, results_count |
| `search_suggestion_selected` | 选择建议 | suggestion, type |
| `search_history_selected` | 选择历史 | query |
| `search_popular_selected` | 选择热门搜索 | query, rank |
| `search_result_clicked` | 点击搜索结果 | type, item_id |
| `search_history_cleared` | 清除历史 | - |
| `search_filter_applied` | 应用筛选 | filters |

---

## 10. 导出

```typescript
// src/features/search/index.ts
export { SearchDialog } from './components/search-dialog';
export { SearchBar } from './components/search-bar';
export { SearchResults } from './components/search-results';
export { SearchHistory } from './components/search-history';
export { SearchFilters } from './components/search-filters';

export { useSearch, useSearchSuggestions, useTrendingSearches } from './hooks/use-search';
export { useBookSearch } from './hooks/use-book-search';

export { useSearchStore } from './stores/search-store';

export type {
  SearchQuery,
  SearchResults,
  SearchFilters,
  SearchSuggestion,
  SearchHistory,
  BookSearchResult,
  AuthorSearchResult,
  InBookSearchResult,
} from './types';
```

---

*最后更新: 2025-12-28*
