# Readmigo React Native Client 实现方案

## 1. 概述

### 1.1 目标
开发功能与 iOS/Android 原生客户端 **100% 对齐** 的 React Native 跨平台应用，使用单一代码库同时支持 iOS 和 Android 平台。

### 1.2 产品定位
AI 原生英语原版书阅读学习应用，核心理念："Read any book. AI has your back."

### 1.3 技术选型理由

| 方案 | 优势 | 劣势 | 选择 |
|------|------|------|------|
| **Expo (Managed)** | 开发效率高、OTA 更新、丰富生态 | 部分原生功能受限 | ✅ 推荐 |
| Bare React Native | 完全控制原生代码 | 配置复杂、维护成本高 | - |
| Expo (Bare) | 兼顾灵活性和便利性 | 仍需处理原生配置 | 备选 |

---

## 2. 技术选型

### 2.1 开发环境

| 项目 | 配置 |
|------|------|
| **框架** | Expo SDK 52+ |
| **语言** | TypeScript 5.x |
| **运行时** | React Native 0.76+ (New Architecture) |
| **最低 iOS** | iOS 15.0 |
| **最低 Android** | Android 8.0 (API 26) |
| **包管理** | pnpm / yarn |
| **IDE** | VS Code + Expo Tools |

### 2.2 架构模式

```
┌─────────────────────────────────────────────────────────────────┐
│              Feature-First + Clean Architecture                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Screens   │ ←→ │   Stores    │ ←→ │  Services   │         │
│  │  (UI Layer) │    │  (Zustand)  │    │  (API/DB)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↓                  ↓                  ↓                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Components  │    │   Hooks     │    │   Utils     │         │
│  │  (Shared)   │    │  (Custom)   │    │  (Helpers)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 项目结构

```
readmigo-rn/
├── app/                          # Expo Router 页面
│   ├── (auth)/                   # 认证相关页面
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/                   # 主 Tab 导航
│   │   ├── library.tsx
│   │   ├── discover.tsx
│   │   ├── learn.tsx
│   │   └── profile.tsx
│   ├── book/
│   │   ├── [id].tsx              # 书籍详情
│   │   └── reader.tsx            # 阅读器
│   ├── _layout.tsx               # 根布局
│   └── index.tsx                 # 入口
│
├── src/
│   ├── features/                 # 功能模块
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── library/
│   │   ├── reader/
│   │   ├── ai/
│   │   ├── learning/
│   │   ├── audiobook/
│   │   ├── subscriptions/
│   │   ├── social/
│   │   ├── settings/
│   │   ├── search/
│   │   ├── messaging/
│   │   └── about/
│   │
│   ├── components/               # 共享组件
│   │   ├── ui/                   # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/               # 布局组件
│   │   └── feedback/             # 反馈组件
│   │
│   ├── hooks/                    # 全局 Hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useNetwork.ts
│   │
│   ├── stores/                   # 全局状态
│   │   ├── authStore.ts
│   │   ├── settingsStore.ts
│   │   └── index.ts
│   │
│   ├── services/                 # API 服务
│   │   ├── api/
│   │   │   ├── client.ts         # Axios 实例
│   │   │   ├── auth.ts
│   │   │   ├── books.ts
│   │   │   └── ai.ts
│   │   ├── storage/              # 本地存储
│   │   └── notifications/        # 推送通知
│   │
│   ├── utils/                    # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── theme/                    # 主题配置
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── i18n/                     # 国际化
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   ├── zh-Hans.json
│   │   │   └── zh-Hant.json
│   │   └── index.ts
│   │
│   └── types/                    # 全局类型
│       ├── api.ts
│       ├── navigation.ts
│       └── index.ts
│
├── assets/                       # 静态资源
│   ├── images/
│   ├── fonts/
│   └── animations/
│
├── app.json                      # Expo 配置
├── eas.json                      # EAS Build 配置
├── babel.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. 核心依赖库

### 3.1 Expo 核心

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-splash-screen": "~0.29.0",
    "expo-font": "~13.0.0",
    "expo-image": "~2.0.0",
    "expo-constants": "~17.0.0",
    "expo-device": "~7.0.0",
    "expo-application": "~6.0.0",
    "expo-linking": "~7.0.0",
    "expo-web-browser": "~14.0.0",
    "expo-haptics": "~14.0.0",
    "expo-localization": "~16.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-file-system": "~18.0.0",
    "expo-av": "~15.0.0",
    "expo-notifications": "~0.29.0",
    "expo-updates": "~0.26.0"
  }
}
```

### 3.2 导航

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "react-native-screens": "~4.0.0",
    "react-native-safe-area-context": "~4.12.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0"
  }
}
```

### 3.3 状态管理

```json
{
  "dependencies": {
    "zustand": "^5.0.0",
    "immer": "^10.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-persist-client": "^5.0.0"
  }
}
```

### 3.4 网络请求

```json
{
  "dependencies": {
    "axios": "^1.7.0",
    "react-native-sse": "^1.2.0"
  }
}
```

### 3.5 UI 组件

```json
{
  "dependencies": {
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "@gorhom/bottom-sheet": "^5.0.0",
    "react-native-svg": "~15.8.0",
    "lottie-react-native": "^7.0.0",
    "@shopify/flash-list": "^1.7.0",
    "react-native-toast-message": "^2.2.0"
  }
}
```

### 3.6 阅读器

```json
{
  "dependencies": {
    "react-native-webview": "~13.12.0",
    "epubjs": "^0.3.93",
    "@nicebooks/epub-parser": "^1.0.0"
  }
}
```

### 3.7 认证与支付

```json
{
  "dependencies": {
    "expo-auth-session": "~6.0.0",
    "expo-apple-authentication": "~7.0.0",
    "@react-native-google-signin/google-signin": "^13.0.0",
    "react-native-purchases": "^8.0.0"
  }
}
```

### 3.8 国际化

```json
{
  "dependencies": {
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "intl-pluralrules": "^2.0.0"
  }
}
```

### 3.9 本地存储

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "~2.1.0",
    "expo-sqlite": "~15.0.0",
    "drizzle-orm": "^0.35.0"
  }
}
```

### 3.10 开发工具

```json
{
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.6.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "@testing-library/react-native": "^12.0.0",
    "jest": "^29.0.0",
    "jest-expo": "~52.0.0"
  }
}
```

---

## 4. 状态管理架构

### 4.1 Zustand Store 设计

```typescript
// src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuestMode: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  enterGuestMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      isGuestMode: false,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          state.isGuestMode = false;
        }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.isGuestMode = false;
        }),

      enterGuestMode: () =>
        set((state) => {
          state.isGuestMode = true;
          state.isAuthenticated = false;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 4.2 Settings Store

```typescript
// src/stores/settingsStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ReaderTheme = 'light' | 'dark' | 'sepia';
type Language = 'en' | 'zh-Hans' | 'zh-Hant';

interface SettingsState {
  // App Settings
  themeMode: ThemeMode;
  language: Language;
  notificationsEnabled: boolean;

  // Reader Settings
  readerTheme: ReaderTheme;
  fontSize: number;
  fontFamily: string;
  lineSpacing: number;
  textAlignment: 'left' | 'justify';

  // Learning Settings
  dailyGoal: number;
  reminderTime: string | null;
}

interface SettingsActions {
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setReaderSettings: (settings: Partial<SettingsState>) => void;
  setDailyGoal: (goal: number) => void;
  toggleNotifications: () => void;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  themeMode: 'system',
  language: 'en',
  notificationsEnabled: true,
  readerTheme: 'light',
  fontSize: 18,
  fontFamily: 'system',
  lineSpacing: 1.6,
  textAlignment: 'left',
  dailyGoal: 20,
  reminderTime: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setLanguage: (lang) => set({ language: lang }),

      setReaderSettings: (settings) => set((state) => ({ ...state, ...settings })),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 4.3 React Query 配置

```typescript
// src/services/queryClient.ts

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_CACHE',
});
```

---

## 5. API 服务层

### 5.1 Axios Client

```typescript
// src/services/api/client.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.readmigo.app';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    const { language } = useSettingsStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers['Accept-Language'] = language;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens, logout } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 5.2 API Hooks (React Query)

```typescript
// src/features/library/hooks/useBooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Book, BookDetail, UserBook } from '../types';

// 获取书籍列表
export function useBooks(params?: { category?: string; difficulty?: number }) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Book[] }>('/books', { params });
      return response.data.data;
    },
  });
}

// 获取书籍详情
export function useBookDetail(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: BookDetail }>(`/books/${bookId}`);
      return response.data.data;
    },
    enabled: !!bookId,
  });
}

// 获取用户书架
export function useUserLibrary() {
  return useQuery({
    queryKey: ['userLibrary'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserBook[] }>('/user/library');
      return response.data.data;
    },
  });
}

// 添加到书架
export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.post('/user/library', { bookId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    },
  });
}

// 更新阅读进度
export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      progress,
      cfi,
    }: {
      bookId: string;
      progress: number;
      cfi: string;
    }) => {
      const response = await apiClient.put(`/user/library/${bookId}/progress`, {
        progress,
        cfi,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}
```

---

## 6. 导航架构

### 6.1 Expo Router 配置

```typescript
// app/_layout.tsx

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { queryClient } from '@/services/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';

// 保持启动画面可见
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, navigationTheme } = useTheme();
  const isLoading = useAuthStore((state) => state.isLoading);

  const [fontsLoaded] = useFonts({
    'NotoSerif-Regular': require('@/assets/fonts/NotoSerif-Regular.ttf'),
    'NotoSerif-Bold': require('@/assets/fonts/NotoSerif-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={navigationTheme}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="book/[id]"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="book/reader"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                }}
              />
            </Stack>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

### 6.2 Tab 导航

```typescript
// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: '书架',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'library' : 'library-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'compass' : 'compass-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: '学习',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'school' : 'school-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 6.3 认证保护

```typescript
// app/(auth)/_layout.tsx

import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated, isGuestMode } = useAuthStore();

  // 已登录或访客模式直接跳转主页
  if (isAuthenticated || isGuestMode) {
    return <Redirect href="/(tabs)/library" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
```

---

## 7. 模块功能对照

### 7.1 模块优先级

| 优先级 | 模块 | 说明 | 状态 |
|--------|------|------|------|
| P0 | Auth | 认证授权 | 待实现 |
| P0 | Onboarding | 新用户引导 | 待实现 |
| P0 | Library | 书架管理 | 待实现 |
| P0 | Reader | 阅读器 | 待实现 |
| P0 | AI | AI 辅助功能 | 待实现 |
| P1 | Learning | 词汇学习 | 待实现 |
| P1 | Audiobook | 有声书 | 待实现 |
| P1 | Subscriptions | 订阅支付 | 待实现 |
| P1 | Settings | 应用设置 | 待实现 |
| P1 | Search | 搜索功能 | 待实现 |
| P2 | Social | 社交功能 | 待实现 |
| P2 | Messaging | 客服消息 | 待实现 |
| P2 | Guest Mode | 访客模式 | 待实现 |
| P2 | i18n | 国际化 | 待实现 |
| P2 | About | 关于页面 | 待实现 |

### 7.2 与原生平台对齐

| 功能 | iOS | Android | React Native |
|------|-----|---------|--------------|
| 登录方式 | Apple/Google | Google/Apple | expo-auth-session |
| 支付 | StoreKit 2 | Play Billing | RevenueCat |
| 推送 | APNs | FCM | expo-notifications |
| 阅读器 | WKWebView | WebView | react-native-webview |
| 数据库 | Core Data | Room | expo-sqlite + Drizzle |
| 键值存储 | Keychain | EncryptedSharedPreferences | expo-secure-store |
| 主题 | SwiftUI | Material 3 | 自定义 Theme |

---

## 8. 阅读器实现

### 8.1 WebView 阅读器

```typescript
// src/features/reader/components/ReaderWebView.tsx

import { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { useReaderStore } from '../stores/readerStore';

interface ReaderWebViewProps {
  bookUrl: string;
  initialCfi?: string;
  onTextSelected: (text: string, cfi: string) => void;
  onProgressChange: (progress: number, cfi: string) => void;
}

export function ReaderWebView({
  bookUrl,
  initialCfi,
  onTextSelected,
  onProgressChange,
}: ReaderWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const { fontSize, fontFamily, theme, lineSpacing } = useReaderStore();

  const injectedJavaScript = `
    (function() {
      // 初始化 EPUB.js 阅读器
      const book = ePub("${bookUrl}");
      const rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none"
      });

      // 应用设置
      rendition.themes.fontSize("${fontSize}px");
      rendition.themes.font("${fontFamily}");

      // 跳转到上次阅读位置
      ${initialCfi ? `rendition.display("${initialCfi}");` : 'rendition.display();'}

      // 监听翻页
      rendition.on("relocated", (location) => {
        const progress = book.locations.percentageFromCfi(location.start.cfi);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "progress",
          progress: progress,
          cfi: location.start.cfi
        }));
      });

      // 监听文字选择
      rendition.on("selected", (cfiRange, contents) => {
        const text = rendition.getRange(cfiRange).toString();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "textSelected",
          text: text,
          cfi: cfiRange
        }));
      });

      // 翻页函数
      window.nextPage = () => rendition.next();
      window.prevPage = () => rendition.prev();
      window.goToCfi = (cfi) => rendition.display(cfi);
    })();
    true;
  `;

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'textSelected':
          onTextSelected(data.text, data.cfi);
          break;
        case 'progress':
          onProgressChange(data.progress, data.cfi);
          break;
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  }, [onTextSelected, onProgressChange]);

  const nextPage = () => {
    webViewRef.current?.injectJavaScript('window.nextPage(); true;');
  };

  const prevPage = () => {
    webViewRef.current?.injectJavaScript('window.prevPage(); true;');
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'file:///android_asset/reader.html' }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

---

## 9. 构建与发布

### 9.1 EAS Build 配置

```json
// eas.json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 9.2 App 配置

```json
// app.json
{
  "expo": {
    "name": "Readmigo",
    "slug": "readmigo",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "readmigo",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2D5A7B"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.readmigo.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "用于扫描书籍条码",
        "NSPhotoLibraryUsageDescription": "用于上传头像"
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2D5A7B"
      },
      "package": "com.readmigo.app",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      "expo-font",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#2D5A7B"
        }
      ],
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#2D5A7B",
          "image": "./assets/splash-icon.png",
          "imageWidth": 200
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "apiUrl": "https://api.readmigo.app",
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 9.3 构建命令

```bash
# 开发构建
eas build --platform all --profile development

# 预览构建 (内部测试)
eas build --platform all --profile preview

# 生产构建
eas build --platform all --profile production

# 提交到应用商店
eas submit --platform ios --profile production
eas submit --platform android --profile production

# OTA 更新
eas update --branch production --message "Bug fixes"
```

---

## 10. 测试策略

### 10.1 单元测试

```typescript
// src/features/auth/__tests__/authStore.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuestMode: false,
    });
  });

  it('should set user and mark as authenticated', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        subscriptionTier: 'free',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('should clear state on logout', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        subscriptionTier: 'free',
      });
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### 10.2 组件测试

```typescript
// src/components/ui/__tests__/Button.test.tsx

import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} loading />
    );

    fireEvent.press(getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

---

## 11. 性能优化

### 11.1 列表优化

```typescript
// 使用 FlashList 替代 FlatList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={books}
  renderItem={({ item }) => <BookCard book={item} />}
  estimatedItemSize={200}
  keyExtractor={(item) => item.id}
/>
```

### 11.2 图片优化

```typescript
// 使用 expo-image 替代 Image
import { Image } from 'expo-image';

<Image
  source={{ uri: book.coverUrl }}
  style={styles.cover}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
/>
```

### 11.3 动画优化

```typescript
// 使用 Reanimated worklets
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(scale.value) }],
}));
```

---

## 12. 实现路线图

### Phase 1: 核心功能 (Week 1-3)
- [ ] 项目初始化和基础架构
- [ ] 认证模块 (Apple/Google Sign-In)
- [ ] 书架和书籍详情
- [ ] 基础阅读器

### Phase 2: AI 功能 (Week 4-5)
- [ ] AI 解释面板
- [ ] 句子简化
- [ ] 翻译功能
- [ ] 词汇保存

### Phase 3: 学习系统 (Week 6-7)
- [ ] 词汇本
- [ ] 闪卡复习
- [ ] 学习统计
- [ ] 每日目标

### Phase 4: 订阅与社交 (Week 8-9)
- [ ] RevenueCat 集成
- [ ] 订阅管理
- [ ] 社交功能
- [ ] 分享功能

### Phase 5: 优化与发布 (Week 10-11)
- [ ] 性能优化
- [ ] 有声书支持
- [ ] 多语言支持
- [ ] 应用商店提交

---

## 相关文档

- [modules/README.md](./modules/) - 模块规范目录
- [design-system-implementation.md](./design-system-implementation.md) - 设计系统实现
- [app-submission-guide.md](./app-submission-guide.md) - 应用商店提交指南

---

**最后更新**: 2024-12-26
**文档版本**: 1.0
