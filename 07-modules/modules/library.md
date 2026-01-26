# Library 模块

> 书架与书籍管理 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 书架展示 | 用户已添加的书籍 | P0 |
| 发现页 | 浏览和发现新书 | P0 |
| 书籍详情 | 书籍信息与 AI 功能入口 | P0 |
| 榜单浏览 | 各类推荐榜单 | P1 |
| 分类浏览 | 按分类浏览书籍 | P1 |
| 阅读进度 | 继续阅读、进度同步 | P0 |
| 书籍搜索 | 搜索书名、作者 | P1 |
| 离线下载 | 下载书籍供离线阅读 | P1 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 书籍列表 | LazyVerticalGrid | FlashList | Virtual Grid |
| 书籍详情 | Compose | React Native | SSR + Client |
| 状态管理 | StateFlow | Zustand | Zustand |
| 数据获取 | Retrofit + Room | React Query | React Query |
| 离线缓存 | Room DB | FileSystem | Service Worker |
| 动画效果 | Compose Animation | Reanimated | CSS/Framer |

---

## 2. 数据模型

```typescript
// 书籍基本信息
interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  difficulty: DifficultyLevel;  // 1-5
  language: string;
  genres: string[];
  pageCount: number;
  wordCount: number;
  estimatedReadingTime: number;  // 分钟
  publishedYear?: number;
  isbn?: string;
  rating?: number;
  ratingCount?: number;
  isPublicDomain: boolean;
  hasAudiobook: boolean;
  source: 'gutenberg' | 'standard-ebooks' | 'internet-archive';
  createdAt: string;
}

// 书籍详情
interface BookDetail {
  book: Book;
  chapters: Chapter[];
  readingProgress?: ReadingProgress;
  isInLibrary: boolean;
  relatedBooks: Book[];
  aiAnalysis?: BookAIAnalysis;
  userMatch?: UserMatchScore;
}

// 章节
interface Chapter {
  id: string;
  bookId: string;
  index: number;
  title: string;
  wordCount: number;
  estimatedTime: number;
}

// 阅读进度
interface ReadingProgress {
  bookId: string;
  chapterId: string;
  cfi?: string;           // EPUB 位置标识
  progress: number;       // 0-100
  lastReadAt: string;
  totalReadingTime: number;  // 秒
}

// 用户书架中的书籍
interface UserBook {
  id: string;
  bookId: string;
  book: Book;
  status: 'reading' | 'finished' | 'want-to-read';
  progress: number;
  currentCfi?: string;
  currentChapter?: number;
  startedAt?: string;
  finishedAt?: string;
  lastReadAt: string;
  totalReadingTime: number;
  wordsLearned: number;
}

// 书籍列表/榜单
interface BookList {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  bookCount: number;
  type: BookListType;
  updatedAt: string;
}

type BookListType =
  | 'curated'      // 编辑精选
  | 'trending'     // 热门
  | 'new_arrival'  // 新书
  | 'by_genre'     // 按类型
  | 'by_level'     // 按难度
  | 'seasonal';    // 季节推荐

// 发现页数据
interface DiscoverData {
  featuredBooks: Book[];
  trendingBooks: Book[];
  newArrivals: Book[];
  recommendedForYou: Book[];
  bookLists: BookList[];
  categories: Category[];
}

// 分类
interface Category {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  bookCount: number;
}

// AI 分析
interface BookAIAnalysis {
  themes: string[];
  readingLevel: string;
  vocabularyDensity: number;
  contentWarnings?: string[];
}

// 用户匹配度
interface UserMatchScore {
  score: number;  // 0-100
  reasons: string[];
  estimatedNewWords: number;
}

// 难度等级
type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// 排序选项
type SortOrder = 'recent' | 'title' | 'author' | 'progress' | 'added_date';

// 筛选选项
interface LibraryFilters {
  category?: string;
  difficulty?: DifficultyLevel[];
  status?: UserBook['status'];
  sortBy?: SortOrder;
}
```

---

## 3. API 接口

### 3.1 书籍 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/books` | GET | 获取书籍列表 (分页) |
| `/books/{id}` | GET | 获取书籍详情 |
| `/books/{id}/chapters` | GET | 获取章节列表 |
| `/books/search` | GET | 搜索书籍 |
| `/books/recommended` | GET | 获取推荐书籍 |
| `/discover` | GET | 获取发现页数据 |
| `/booklists` | GET | 获取书单列表 |
| `/booklists/{id}` | GET | 获取书单详情 |
| `/categories` | GET | 获取分类列表 |
| `/categories/{id}/books` | GET | 获取分类下书籍 |

### 3.2 用户书架 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/user/library` | GET | 获取用户书架 |
| `/user/library` | POST | 添加到书架 |
| `/user/library/{bookId}` | DELETE | 从书架移除 |
| `/user/library/{bookId}/progress` | PUT | 更新阅读进度 |
| `/user/library/{bookId}/status` | PUT | 更新阅读状态 |
| `/user/library/continue-reading` | GET | 获取继续阅读列表 |
| `/user/reading-sessions` | POST | 记录阅读会话 |

---

## 4. Android 实现

### 4.1 数据流架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Library 模块数据流                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Remote Data                               │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │   │
│   │   │ Books API │  │BookLists  │  │Categories │  │ Discover  │   │   │
│   │   │           │  │  API      │  │   API     │  │   API     │   │   │
│   │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │   │
│   └─────────┼──────────────┼──────────────┼──────────────┼──────────┘   │
│             │              │              │              │               │
│             └──────────────┴──────────────┴──────────────┘               │
│                                    │                                     │
│                                    ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      BookRepository                              │   │
│   │  ┌─────────────────────────────────────────────────────────┐    │   │
│   │  │  • getBooks()          • getBookDetail()                │    │   │
│   │  │  • getBookLists()      • addToLibrary()                 │    │   │
│   │  │  • getCategories()     • removeFromLibrary()            │    │   │
│   │  │  • searchBooks()       • getLibraryBooks()              │    │   │
│   │  └─────────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│             ┌──────────────────────┼──────────────────────┐              │
│             ▼                      ▼                      ▼              │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│   │  Local Cache    │    │  Memory Cache   │    │   UI State      │     │
│   │  (Room DB)      │    │  (in-memory)    │    │   (StateFlow)   │     │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Repository

```kotlin
@Singleton
class BookRepositoryImpl @Inject constructor(
    private val bookApi: BookApi,
    private val bookDao: BookDao,
    private val libraryDao: LibraryDao,
    private val progressDao: ReadingProgressDao
) : BookRepository {

    private val discoverCache = MutableStateFlow<DiscoverData?>(null)
    private val bookDetailCache = mutableMapOf<String, BookDetail>()

    override fun getLibraryBooks(): Flow<List<Book>> {
        return libraryDao.getLibraryBooks()
            .map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun getDiscoverData(forceRefresh: Boolean): Result<DiscoverData> {
        if (!forceRefresh && discoverCache.value != null) {
            return Result.success(discoverCache.value!!)
        }

        return try {
            val response = bookApi.getDiscoverData()
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!.toDomain()
                discoverCache.value = data
                bookDao.insertAll(data.allBooks().map { it.toEntity() })
                Result.success(data)
            } else {
                loadDiscoverFromLocal()?.let { Result.success(it) }
                    ?: Result.failure(Exception("Failed to load discover data"))
            }
        } catch (e: Exception) {
            loadDiscoverFromLocal()?.let { Result.success(it) }
                ?: Result.failure(e)
        }
    }

    override suspend fun addToLibrary(bookId: String): Result<Unit> {
        return try {
            val response = bookApi.addToLibrary(bookId)
            if (response.isSuccessful) {
                libraryDao.addToLibrary(LibraryEntry(bookId, Clock.System.now()))
                bookDetailCache[bookId]?.let {
                    bookDetailCache[bookId] = it.copy(isInLibrary = true)
                }
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to add to library"))
            }
        } catch (e: Exception) {
            // 离线时也允许添加
            libraryDao.addToLibrary(LibraryEntry(bookId, Clock.System.now()))
            Result.success(Unit)
        }
    }
}
```

### 4.3 Library Screen

```kotlin
@Composable
fun LibraryScreen(
    onBookClick: (String) -> Unit,
    onDiscoverClick: () -> Unit,
    viewModel: LibraryViewModel = hiltViewModel()
) {
    val books by viewModel.libraryBooks.collectAsStateWithLifecycle()
    val sortOrder by viewModel.sortOrder.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("我的书架") },
                actions = {
                    SortMenu(sortOrder, onSortChange = viewModel::setSortOrder)
                }
            )
        }
    ) { padding ->
        when {
            books.isEmpty() -> {
                EmptyLibraryView(onDiscoverClick = onDiscoverClick)
            }
            else -> {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 120.dp),
                    contentPadding = PaddingValues(16.dp),
                    modifier = Modifier.padding(padding)
                ) {
                    items(books, key = { it.id }) { book ->
                        LibraryBookCard(
                            book = book,
                            onClick = { onBookClick(book.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LibraryBookCard(book: LibraryBook, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .width(120.dp)
    ) {
        Box {
            AsyncImage(
                model = book.coverUrl,
                contentDescription = book.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(2f / 3f)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )

            if (book.progress > 0) {
                LinearProgressIndicator(
                    progress = { book.progress },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height(4.dp)
                )
            }
        }

        Text(
            text = book.title,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 2
        )
        Text(
            text = book.author,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
```

### 4.4 本地数据库

```kotlin
@Dao
interface BookDao {
    @Query("SELECT * FROM books WHERE id = :bookId")
    suspend fun getById(bookId: String): BookEntity?

    @Query("SELECT * FROM books ORDER BY updatedAt DESC LIMIT :limit")
    suspend fun getRecent(limit: Int): List<BookEntity>

    @Query("SELECT * FROM books WHERE title LIKE :query OR author LIKE :query")
    suspend fun search(query: String): List<BookEntity>

    @Upsert
    suspend fun insertOrUpdate(book: BookEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(books: List<BookEntity>)
}

@Dao
interface LibraryDao {
    @Query("""
        SELECT b.*, l.addedAt, p.progress, p.lastReadAt
        FROM library_entries l
        INNER JOIN books b ON b.id = l.bookId
        LEFT JOIN reading_progress p ON p.bookId = b.id
        ORDER BY l.addedAt DESC
    """)
    fun getLibraryBooks(): Flow<List<LibraryBookEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM library_entries WHERE bookId = :bookId)")
    suspend fun isInLibrary(bookId: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addToLibrary(entry: LibraryEntry)

    @Query("DELETE FROM library_entries WHERE bookId = :bookId")
    suspend fun removeFromLibrary(bookId: String)
}

@Entity(tableName = "books")
data class BookEntity(
    @PrimaryKey val id: String,
    val title: String,
    val author: String,
    val coverUrl: String,
    val description: String,
    val difficulty: Int,
    val language: String,
    val genres: String,  // JSON 数组
    val pageCount: Int,
    val wordCount: Int,
    val estimatedReadingTime: Int,
    val publishedYear: Int?,
    val isbn: String?,
    val rating: Float?,
    val ratingCount: Int?,
    val isPublicDomain: Boolean,
    val hasAudiobook: Boolean,
    val createdAt: Long,
    val updatedAt: Long = System.currentTimeMillis()
)
```

---

## 5. React Native 实现

### 5.1 Zustand Store

```typescript
// src/features/library/stores/libraryStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface LibraryState {
  currentBook: UserBook | null;
  filters: LibraryFilters;
  isRefreshing: boolean;
  selectedBookId: string | null;
}

interface LibraryActions {
  setCurrentBook: (book: UserBook | null) => void;
  setFilters: (filters: Partial<LibraryFilters>) => void;
  resetFilters: () => void;
  setRefreshing: (refreshing: boolean) => void;
  selectBook: (bookId: string | null) => void;
}

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  immer((set) => ({
    currentBook: null,
    filters: { sortBy: 'recent' },
    isRefreshing: false,
    selectedBookId: null,

    setCurrentBook: (book) => set((state) => { state.currentBook = book; }),
    setFilters: (filters) => set((state) => {
      state.filters = { ...state.filters, ...filters };
    }),
    resetFilters: () => set((state) => { state.filters = { sortBy: 'recent' }; }),
    setRefreshing: (refreshing) => set((state) => { state.isRefreshing = refreshing; }),
    selectBook: (bookId) => set((state) => { state.selectedBookId = bookId; }),
  }))
);
```

### 5.2 React Query Hooks

```typescript
// src/features/library/hooks/useBooks.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { booksApi, userLibraryApi } from '../services';

// 书籍列表 (无限滚动)
export function useBooks(filters?: LibraryFilters) {
  return useInfiniteQuery({
    queryKey: ['books', filters],
    queryFn: ({ pageParam = 1 }) =>
      booksApi.getBooks({
        page: pageParam,
        limit: 20,
        category: filters?.category,
        difficulty: filters?.difficulty,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// 书籍详情
export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksApi.getBookDetail(bookId),
    enabled: !!bookId,
  });
}

// 用户书架
export function useUserLibrary() {
  return useQuery({
    queryKey: ['userLibrary'],
    queryFn: userLibraryApi.getUserLibrary,
  });
}

// 继续阅读
export function useContinueReading() {
  return useQuery({
    queryKey: ['userLibrary', 'continue'],
    queryFn: userLibraryApi.getContinueReading,
  });
}

// 添加到书架
export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userLibraryApi.addToLibrary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    },
  });
}

// 更新阅读进度
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, ...data }: { bookId: string; progress: number; cfi: string }) =>
      userLibraryApi.updateProgress(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary', 'continue'] });
    },
  });
}
```

### 5.3 BookCard 组件

```typescript
// src/features/library/components/BookCard.tsx

import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';

interface BookCardProps {
  book: Book;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BookCard({ book, progress, size = 'medium', onPress }: BookCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const dimensions = {
    small: { width: 80, height: 120 },
    medium: { width: 100, height: 150 },
    large: { width: 140, height: 210 },
  }[size];

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, { width: dimensions.width }]}
      onPress={onPress}
      onPressIn={() => { scale.value = 0.95; }}
      onPressOut={() => { scale.value = 1; }}
    >
      <View style={[styles.coverContainer, { height: dimensions.height }]}>
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.cover}
          contentFit="cover"
        />

        {progress !== undefined && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
      <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  coverContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: { width: '100%', height: '100%' },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: { height: '100%', backgroundColor: '#007AFF' },
  title: { marginTop: 8, fontSize: 13, fontWeight: '500' },
  author: { marginTop: 2, fontSize: 11, opacity: 0.6 },
});
```

### 5.4 离线下载服务

```typescript
// src/features/library/services/downloadService.ts

import * as FileSystem from 'expo-file-system';

const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

export const downloadService = {
  downloadBook: async (
    book: Book,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const fileUri = `${BOOKS_DIR}${book.id}.epub`;

    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });

    const downloadResumable = FileSystem.createDownloadResumable(
      `https://api.readmigo.app/books/${book.id}/download`,
      fileUri,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress * 100);
      }
    );

    const result = await downloadResumable.downloadAsync();
    return result?.uri || fileUri;
  },

  isDownloaded: async (bookId: string): Promise<boolean> => {
    const fileUri = `${BOOKS_DIR}${bookId}.epub`;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  },

  getLocalPath: (bookId: string): string => {
    return `${BOOKS_DIR}${bookId}.epub`;
  },

  deleteBook: async (bookId: string): Promise<void> => {
    const fileUri = `${BOOKS_DIR}${bookId}.epub`;
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  },

  getStorageUsage: async (): Promise<number> => {
    let totalSize = 0;
    const files = await FileSystem.readDirectoryAsync(BOOKS_DIR);

    for (const file of files) {
      const info = await FileSystem.getInfoAsync(`${BOOKS_DIR}${file}`);
      if (info.exists && info.size) {
        totalSize += info.size;
      }
    }

    return totalSize;
  },
};
```

---

## 6. Web 实现

### 6.1 Zustand Store

```typescript
// src/features/library/stores/library-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LibraryState {
  viewMode: 'grid' | 'list';
  sortBy: SortOption;
  filterBy: FilterOption;
  searchQuery: string;
  currentBookId: string | null;
}

interface LibraryActions {
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  setSearchQuery: (query: string) => void;
  setCurrentBook: (bookId: string | null) => void;
}

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      sortBy: 'recent',
      filterBy: 'all',
      searchQuery: '',
      currentBookId: null,

      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setFilterBy: (filterBy) => set({ filterBy }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setCurrentBook: (currentBookId) => set({ currentBookId }),
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
    }
  )
);
```

### 6.2 React Query Hooks

```typescript
// src/features/library/hooks/use-books.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// 获取书籍列表
export function useBooks(params?: BooksParams) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Book[]; total: number }>('/books', { params });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// SSR: 获取书籍详情
export async function getBookById(id: string): Promise<BookDetail | null> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/v1/books/${id}`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

// 客户端: 获取书籍详情
export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: BookDetail }>(`/books/${bookId}`);
      return response.data;
    },
    enabled: !!bookId,
    staleTime: 10 * 60 * 1000,
  });
}

// 用户书架
export function useUserLibrary() {
  return useQuery({
    queryKey: ['userLibrary'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserBook[] }>('/user/library');
      return response.data;
    },
  });
}

// 添加到书架
export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      return apiClient.post('/user/library', { bookId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    },
  });
}
```

### 6.3 BookCard 组件

```tsx
// src/features/library/components/book-card.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  userBook?: UserBook;
  className?: string;
}

const difficultyLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const difficultyColors = ['', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

export function BookCard({ book, userBook, className }: BookCardProps) {
  return (
    <Link href={`/book/${book.id}`}>
      <Card className={cn('group overflow-hidden transition-all hover:shadow-lg', className)}>
        <CardContent className="p-0">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <Badge className={cn('absolute left-2 top-2', difficultyColors[book.difficulty])}>
              {difficultyLabels[book.difficulty]}
            </Badge>
          </div>

          <div className="p-3">
            <h3 className="line-clamp-2 font-medium leading-tight">{book.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>

            {userBook && userBook.progress > 0 && (
              <div className="mt-2">
                <Progress value={userBook.progress} className="h-1" />
                <p className="mt-1 text-xs text-muted-foreground">{userBook.progress}% 已读</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### 6.4 书籍详情页 (SSR)

```tsx
// app/book/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookById } from '@/features/library/hooks/use-books';
import { BookDetail } from '@/features/library/components/book-detail';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBookById(params.id);

  if (!book) {
    return { title: 'Book Not Found' };
  }

  return {
    title: book.title,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      images: [book.coverUrl],
      type: 'book',
      authors: [book.author],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const book = await getBookById(params.id);

  if (!book) {
    notFound();
  }

  return <BookDetail book={book} />;
}
```

---

## 7. 测试用例

```typescript
describe('Library Module', () => {
  describe('useBooks', () => {
    it('should fetch books with pagination', async () => {
      const { result } = renderHook(() => useBooks(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.pages[0].data.length).toBeGreaterThan(0);
    });

    it('should filter books by category', async () => {
      const { result } = renderHook(
        () => useBooks({ category: 'fiction' }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useUserLibrary', () => {
    it('should fetch user library', async () => {
      const { result } = renderHook(() => useUserLibrary(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useAddToLibrary', () => {
    it('should add book to library', async () => {
      const { result } = renderHook(() => useAddToLibrary(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync('book-1');
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('BookCard', () => {
    it('renders book title and author', () => {
      render(<BookCard book={mockBook} />);

      expect(screen.getByText('Pride and Prejudice')).toBeInTheDocument();
      expect(screen.getByText('Jane Austen')).toBeInTheDocument();
    });

    it('shows progress when userBook is provided', () => {
      render(<BookCard book={mockBook} userBook={mockUserBook} />);

      expect(screen.getByText('45% 已读')).toBeInTheDocument();
    });
  });
});
```

---

*最后更新: 2025-12-28*
