# Settings 模块

> 应用设置系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 页面 | 功能 | 优先级 |
|------|------|--------|
| 设置主页 | 设置入口与分组 | P0 |
| 阅读设置 | 字体、主题、行距 | P0 |
| 账户设置 | 个人信息管理 | P0 |
| 通知设置 | 提醒与推送 | P1 |
| 离线管理 | 下载内容管理 | P1 |
| 语言设置 | 界面与学习语言 | P1 |
| 隐私设置 | 数据与分析 | P2 |
| 数据同步 | 云端同步管理 | P2 |
| 关于页面 | 版本与法律信息 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 配置存储 | DataStore Preferences | AsyncStorage/MMKV | Zustand + localStorage |
| 加密存储 | EncryptedSharedPreferences | SecureStore | N/A |
| 文件管理 | File API + WorkManager | expo-file-system | IndexedDB |
| 通知 | FCM | expo-notifications | Notification API |
| 生物识别 | BiometricPrompt | expo-local-authentication | Web Authentication API |

---

## 2. 数据模型

```typescript
// 应用设置
interface UserSettings {
  reading: ReadingSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
  sync: SyncSettings;
  language: string;
  region: string;
}

// 阅读器设置
interface ReadingSettings {
  theme: 'light' | 'dark' | 'sepia' | 'amoled';
  fontFamily: string;
  fontSize: number;              // 12-32
  lineHeight: number;            // 1.2-2.5
  textAlign: 'left' | 'justify';
  margins: { horizontal: number; vertical: number };
  brightness: number;            // 0-1
  keepScreenOn: boolean;
  pageMode: 'scroll' | 'paginated';
  pageAnimation: 'slide' | 'curl' | 'fade' | 'none';
  autoSaveProgress: boolean;
}

// 通知设置
interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;    // HH:mm
  reviewReminder: boolean;
  reviewReminderTime: string;
  newBookAlerts: boolean;
  progressUpdates: boolean;
}

// 隐私设置
interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  syncReadingProgress: boolean;
  biometricLock: boolean;
}

// 显示设置
interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  reducedMotion: boolean;
}

// 同步设置
interface SyncSettings {
  autoSync: boolean;
  syncOnWifiOnly: boolean;
  syncProgress: boolean;
  syncVocabulary: boolean;
  syncHighlights: boolean;
  lastSyncAt?: number;
}

// 存储统计
interface StorageStats {
  totalSize: number;
  booksSize: number;
  audiobooksSize: number;
  cacheSize: number;
}

// 账户信息
interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'google' | 'apple' | 'email';
  isPremium: boolean;
  createdAt: number;
}
```

---

## 3. Android 实现

### 3.1 Settings Manager

```kotlin
@Singleton
class SettingsManager @Inject constructor(
    private val dataStore: DataStore<Preferences>
) {
    private object Keys {
        val FONT_SIZE = intPreferencesKey("font_size")
        val FONT_FAMILY = stringPreferencesKey("font_family")
        val LINE_SPACING = floatPreferencesKey("line_spacing")
        val THEME = stringPreferencesKey("theme")
        val READER_THEME = stringPreferencesKey("reader_theme")
        val KEEP_SCREEN_ON = booleanPreferencesKey("keep_screen_on")
        val DAILY_REMINDER_ENABLED = booleanPreferencesKey("daily_reminder_enabled")
        val DAILY_REMINDER_TIME = stringPreferencesKey("daily_reminder_time")
        val AUTO_DOWNLOAD_WIFI = booleanPreferencesKey("auto_download_wifi")
        val ANALYTICS_ENABLED = booleanPreferencesKey("analytics_enabled")
    }

    val settings: Flow<AppSettings> = dataStore.data.map { prefs ->
        AppSettings(
            fontSize = prefs[Keys.FONT_SIZE] ?: 18,
            fontFamily = prefs[Keys.FONT_FAMILY] ?: "system",
            lineSpacing = prefs[Keys.LINE_SPACING] ?: 1.5f,
            theme = AppTheme.valueOf(prefs[Keys.THEME] ?: "SYSTEM"),
            readerTheme = ReaderTheme.valueOf(prefs[Keys.READER_THEME] ?: "LIGHT"),
            keepScreenOn = prefs[Keys.KEEP_SCREEN_ON] ?: true,
            dailyReminderEnabled = prefs[Keys.DAILY_REMINDER_ENABLED] ?: true,
            dailyReminderTime = prefs[Keys.DAILY_REMINDER_TIME] ?: "20:00",
            autoDownloadOnWifi = prefs[Keys.AUTO_DOWNLOAD_WIFI] ?: true,
            analyticsEnabled = prefs[Keys.ANALYTICS_ENABLED] ?: true
        )
    }

    suspend fun updateFontSize(size: Int) {
        dataStore.edit { it[Keys.FONT_SIZE] = size }
    }

    suspend fun updateTheme(theme: AppTheme) {
        dataStore.edit { it[Keys.THEME] = theme.name }
    }
}

enum class AppTheme { LIGHT, DARK, SYSTEM }
enum class ReaderTheme(val backgroundColor: Long, val textColor: Long) {
    LIGHT(0xFFFFFFFF, 0xFF000000),
    DARK(0xFF1A1A1A, 0xFFE0E0E0),
    SEPIA(0xFFF5E6D3, 0xFF5D4037)
}
```

### 3.2 离线管理器

```kotlin
@Singleton
class OfflineManager @Inject constructor(
    private val context: Context,
    private val workManager: WorkManager
) {
    private val _storageStats = MutableStateFlow(StorageStats(0, 0, 0, 0))
    val storageStats: StateFlow<StorageStats> = _storageStats.asStateFlow()

    suspend fun downloadBook(bookId: String) {
        val downloadWork = OneTimeWorkRequestBuilder<BookDownloadWorker>()
            .setInputData(workDataOf("bookId" to bookId))
            .setConstraints(Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresStorageNotLow(true)
                .build())
            .build()
        workManager.enqueueUniqueWork("download_book_$bookId", ExistingWorkPolicy.KEEP, downloadWork)
    }

    suspend fun clearCache() { /* 清理缓存 */ }
    suspend fun deleteOfflineBook(bookId: String) { /* 删除离线书籍 */ }
    fun refreshStorageStats() { /* 刷新存储统计 */ }
}
```

---

## 4. React Native 实现

### 4.1 Zustand Store

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultReaderSettings: ReadingSettings = {
  theme: 'light',
  fontFamily: 'System',
  fontSize: 18,
  lineHeight: 1.6,
  textAlign: 'left',
  margins: { horizontal: 24, vertical: 16 },
  brightness: 1,
  keepScreenOn: true,
  pageMode: 'scroll',
  pageAnimation: 'slide',
  autoSaveProgress: true,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    immer((set) => ({
      reader: defaultReaderSettings,
      notifications: { enabled: true, dailyReminder: true, dailyReminderTime: '20:00', reviewReminder: true, reviewReminderTime: '09:00', newBookAlerts: true, progressUpdates: false },
      privacy: { analyticsEnabled: true, crashReportsEnabled: true, syncReadingProgress: true, biometricLock: false },
      display: { theme: 'light', useSystemTheme: true, hapticFeedback: true, reducedMotion: false },
      language: 'zh-CN',

      updateReaderSettings: (settings) => set((state) => { state.reader = { ...state.reader, ...settings }; }),
      updateNotificationSettings: (settings) => set((state) => { state.notifications = { ...state.notifications, ...settings }; }),
      updatePrivacySettings: (settings) => set((state) => { state.privacy = { ...state.privacy, ...settings }; }),
      setAppTheme: (theme) => set((state) => { state.display.theme = theme; state.display.useSystemTheme = false; }),
      resetAllSettings: () => set(() => ({ reader: defaultReaderSettings, /* ... */ })),
    })),
    { name: 'settings-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### 4.2 存储管理服务

```typescript
import * as FileSystem from 'expo-file-system';

export async function getStorageInfo(): Promise<StorageInfo> {
  const downloadsDir = `${FileSystem.documentDirectory}downloads/`;
  const cacheDir = FileSystem.cacheDirectory;

  const [downloadsInfo, cacheInfo] = await Promise.all([
    getDirectorySize(downloadsDir),
    getDirectorySize(cacheDir),
  ]);

  return {
    totalSpace: 0,
    usedSpace: downloadsInfo.total + cacheInfo.total,
    downloads: { books: downloadsInfo.counts.epub || 0, audiobooks: downloadsInfo.counts.audio || 0, size: downloadsInfo.total },
    cache: { images: cacheInfo.counts.images || 0, other: cacheInfo.counts.other || 0 },
  };
}

export async function clearCache(): Promise<void> {
  await FileSystem.deleteAsync(FileSystem.cacheDirectory, { idempotent: true });
  await FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory, { intermediates: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
```

---

## 5. Web 实现

### 5.1 Zustand Store

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isDirty: false,

      updateReading: (updates) => set((state) => ({
        settings: { ...state.settings, reading: { ...state.settings.reading, ...updates } },
        isDirty: true,
      })),

      updateAppearance: (updates) => set((state) => ({
        settings: { ...state.settings, appearance: { ...state.settings.appearance, ...updates } },
        isDirty: true,
      })),

      resetSettings: () => set({ settings: defaultSettings, isDirty: true }),
    }),
    { name: 'settings-storage' }
  )
);
```

### 5.2 Server Actions

```typescript
'use server';

export async function syncSettings(settings: UserSettings) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, settings: settings as any },
    update: { settings: settings as any, updatedAt: new Date() },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  await prisma.$transaction([
    prisma.userBook.deleteMany({ where: { userId: session.user.id } }),
    prisma.vocabularyWord.deleteMany({ where: { userId: session.user.id } }),
    prisma.userSettings.deleteMany({ where: { userId: session.user.id } }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ]);

  return { success: true };
}

export async function exportUserData() {
  const session = await auth();
  const [user, books, vocabulary, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.userBook.findMany({ where: { userId: session.user.id } }),
    prisma.vocabularyWord.findMany({ where: { userId: session.user.id } }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
  ]);

  return { success: true, data: { user, books, vocabulary, settings, exportedAt: new Date().toISOString() } };
}
```

---

## 6. 设置分类

### 阅读设置

| 设置项 | 类型 | 默认值 | 范围 |
|--------|------|--------|------|
| 字体 | select | system | system/serif/sans-serif |
| 字号 | slider | 18 | 12-32 |
| 行距 | slider | 1.6 | 1.2-2.5 |
| 主题 | select | light | light/dark/sepia |
| 保持屏幕常亮 | switch | true | - |

### 通知设置

| 设置项 | 类型 | 默认值 |
|--------|------|--------|
| 每日阅读提醒 | switch | true |
| 提醒时间 | time | 20:00 |
| 复习提醒 | switch | true |
| 新书推荐 | switch | true |

### 隐私设置

| 设置项 | 类型 | 默认值 |
|--------|------|--------|
| 数据分析 | switch | true |
| 崩溃报告 | switch | true |
| 同步阅读进度 | switch | true |
| 生物识别锁定 | switch | false |

---

## 7. 工具函数

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'zh': '简体中文',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en': 'English',
    'ja': '日本語',
  };
  return names[code] || code;
}
```

---

*最后更新: 2025-12-28*
