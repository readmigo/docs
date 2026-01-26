# React Native 设计系统实现规范

> 本文档定义 Readmigo React Native 客户端的设计系统实现，确保与 iOS/Android 原生客户端和品牌规范保持一致。

## 1. 概述

### 1.1 设计原则

遵循共享设计系统 (`docs/design/design-system.md`) 的四大原则：
- **专注阅读 (Reading First)** - 界面干净简洁，不干扰阅读
- **AI 无处不在但不突兀 (Ambient AI)** - AI 功能融入自然交互
- **渐进式学习 (Progressive Learning)** - 难度循序渐进，成长可视化
- **全球化设计 (Global Design)** - 支持多语言，文化中性设计

### 1.2 技术栈

| 组件 | 技术选型 |
|------|----------|
| UI 框架 | React Native + Expo SDK 52+ |
| 主题系统 | 自定义 Theme Provider |
| 图标 | @expo/vector-icons (MaterialCommunityIcons) |
| 动画 | Reanimated 3 + Gesture Handler |
| 字体 | expo-font + Google Fonts |

---

## 2. 主题配置

### 2.1 品牌色定义

```typescript
// src/theme/colors.ts

// ============================================
// Brand Colors (来自 design-system.md)
// ============================================

export const BrandColors = {
  // Primary: #2D5A7B - 深蓝色 (知识、可信赖)
  primary: '#2D5A7B',
  primaryLight: '#5A87A8',
  primaryDark: '#1E3D52',

  // Secondary: #64B5A0 - 青绿色 (成长、活力)
  secondary: '#64B5A0',
  secondaryLight: '#95E7D2',
  secondaryDark: '#358472',

  // Accent/Tertiary: #FFB347 - 暖橙色 (AI、智能)
  accent: '#FFB347',
  accentLight: '#FFE599',
  accentDark: '#CC8A1A',

  // Background: #FAFAF8 - 米白色 (阅读舒适)
  background: '#FAFAF8',
  backgroundDark: '#1A1A1A',

  // Text: #1C1C1E - 深灰色 (清晰可读)
  text: '#1C1C1E',
  textLight: '#E5E5E5',
} as const;

// ============================================
// Semantic Colors
// ============================================

export const SemanticColors = {
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#E53935',
  info: '#2196F3',
} as const;

// ============================================
// Reader Theme Colors
// ============================================

export const ReaderColors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
  },
  dark: {
    background: '#1A1A1A',
    text: '#E0E0E0',
  },
  sepia: {
    background: '#F5E6D3',
    text: '#5D4037',
  },
} as const;

export type ReaderTheme = keyof typeof ReaderColors;
```

### 2.2 Light Theme

```typescript
// src/theme/lightTheme.ts

import { BrandColors, SemanticColors } from './colors';

export const lightTheme = {
  dark: false,
  colors: {
    // Primary
    primary: BrandColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: `${BrandColors.primaryLight}4D`, // 30% opacity
    onPrimaryContainer: BrandColors.primaryDark,

    // Secondary
    secondary: BrandColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: `${BrandColors.secondaryLight}4D`,
    onSecondaryContainer: BrandColors.secondaryDark,

    // Tertiary (AI/Accent)
    tertiary: BrandColors.accent,
    onTertiary: '#000000',
    tertiaryContainer: `${BrandColors.accentLight}4D`,
    onTertiaryContainer: BrandColors.accentDark,

    // Background & Surface
    background: BrandColors.background,
    onBackground: BrandColors.text,
    surface: '#FFFFFF',
    onSurface: BrandColors.text,
    surfaceVariant: '#F0F0EE',
    onSurfaceVariant: '#49454F',

    // Outline
    outline: '#CAC4D0',
    outlineVariant: '#E7E0EC',

    // Error
    error: SemanticColors.error,
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',

    // Inverse
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: BrandColors.primaryLight,

    // Semantic
    success: SemanticColors.success,
    warning: SemanticColors.warning,
    info: SemanticColors.info,

    // Scrim
    scrim: 'rgba(0, 0, 0, 0.32)',

    // Card
    card: '#FFFFFF',
    cardBorder: '#E0E0E0',

    // Text
    textPrimary: BrandColors.text,
    textSecondary: '#666666',
    textDisabled: '#9E9E9E',
  },
};

export type Theme = typeof lightTheme;
```

### 2.3 Dark Theme

```typescript
// src/theme/darkTheme.ts

import { BrandColors, SemanticColors } from './colors';
import type { Theme } from './lightTheme';

export const darkTheme: Theme = {
  dark: true,
  colors: {
    // Primary
    primary: BrandColors.primaryLight,
    onPrimary: BrandColors.primaryDark,
    primaryContainer: BrandColors.primary,
    onPrimaryContainer: BrandColors.primaryLight,

    // Secondary
    secondary: BrandColors.secondaryLight,
    onSecondary: BrandColors.secondaryDark,
    secondaryContainer: BrandColors.secondary,
    onSecondaryContainer: BrandColors.secondaryLight,

    // Tertiary (AI/Accent)
    tertiary: BrandColors.accentLight,
    onTertiary: BrandColors.accentDark,
    tertiaryContainer: BrandColors.accent,
    onTertiaryContainer: BrandColors.accentLight,

    // Background & Surface
    background: BrandColors.backgroundDark,
    onBackground: BrandColors.textLight,
    surface: '#1C1C1E',
    onSurface: BrandColors.textLight,
    surfaceVariant: '#2C2C2E',
    onSurfaceVariant: '#CAC4D0',

    // Outline
    outline: '#938F99',
    outlineVariant: '#49454F',

    // Error
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',

    // Inverse
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: BrandColors.primary,

    // Semantic
    success: '#81C784',
    warning: '#FFD54F',
    info: '#64B5F6',

    // Scrim
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Card
    card: '#2C2C2E',
    cardBorder: '#3C3C3E',

    // Text
    textPrimary: BrandColors.textLight,
    textSecondary: '#AAAAAA',
    textDisabled: '#666666',
  },
};
```

### 2.4 Theme Provider

```typescript
// src/theme/ThemeProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, type Theme } from './lightTheme';
import { darkTheme } from './darkTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
}

export function ThemeProvider({
  children,
  themeMode = 'system',
  onThemeModeChange,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode: onThemeModeChange || (() => {}),
      isDark,
    }),
    [theme, themeMode, onThemeModeChange, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for accessing colors directly
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}
```

### 2.5 Theme Store (Zustand)

```typescript
// src/stores/themeStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 3. Typography 字体系统

### 3.1 字体映射

| 用途 | iOS | Android | React Native |
|------|-----|---------|--------------|
| 界面字体 | SF Pro | Roboto | System (Platform default) |
| 阅读字体 | Georgia, Palatino | Noto Serif, Literata | Google Fonts |
| 代码字体 | SF Mono | JetBrains Mono | SpaceMono |

### 3.2 字体加载

```typescript
// src/theme/fonts.ts

import * as Font from 'expo-font';

export const fontAssets = {
  // 阅读字体
  'NotoSerif-Regular': require('@/assets/fonts/NotoSerif-Regular.ttf'),
  'NotoSerif-Medium': require('@/assets/fonts/NotoSerif-Medium.ttf'),
  'NotoSerif-Bold': require('@/assets/fonts/NotoSerif-Bold.ttf'),
  'Literata-Regular': require('@/assets/fonts/Literata-Regular.ttf'),
  'Literata-Medium': require('@/assets/fonts/Literata-Medium.ttf'),
  'Literata-Bold': require('@/assets/fonts/Literata-Bold.ttf'),
  // 代码字体
  'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
};

export async function loadFonts() {
  await Font.loadAsync(fontAssets);
}

export const FontFamilies = {
  system: undefined, // 使用系统默认字体
  notoSerif: 'NotoSerif-Regular',
  notoSerifMedium: 'NotoSerif-Medium',
  notoSerifBold: 'NotoSerif-Bold',
  literata: 'Literata-Regular',
  literataMedium: 'Literata-Medium',
  literataBold: 'Literata-Bold',
  mono: 'SpaceMono-Regular',
} as const;
```

### 3.3 Typography 定义

```typescript
// src/theme/typography.ts

import { Platform, TextStyle } from 'react-native';

// 基础字体大小
const fontSizes = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 45,
  '8xl': 57,
} as const;

// 行高
const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// 字重
const fontWeights: Record<string, TextStyle['fontWeight']> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const typography = {
  // Display - 大标题
  displayLarge: {
    fontSize: fontSizes['8xl'],
    lineHeight: fontSizes['8xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.25,
  } as TextStyle,
  displayMedium: {
    fontSize: fontSizes['7xl'],
    lineHeight: fontSizes['7xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
  } as TextStyle,
  displaySmall: {
    fontSize: fontSizes['6xl'],
    lineHeight: fontSizes['6xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
  } as TextStyle,

  // Headline - 标题
  headlineLarge: {
    fontSize: fontSizes['5xl'],
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    fontWeight: fontWeights.semibold,
  } as TextStyle,
  headlineMedium: {
    fontSize: fontSizes['4xl'],
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    fontWeight: fontWeights.semibold,
  } as TextStyle,
  headlineSmall: {
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    fontWeight: fontWeights.semibold,
  } as TextStyle,

  // Title - 副标题
  titleLarge: {
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeights.normal,
    fontWeight: fontWeights.medium,
  } as TextStyle,
  titleMedium: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.15,
  } as TextStyle,
  titleSmall: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  } as TextStyle,

  // Body - 正文
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: fontSizes.lg * lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: 0.5,
  } as TextStyle,
  bodyMedium: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: 0.25,
  } as TextStyle,
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.normal,
    letterSpacing: 0.4,
  } as TextStyle,

  // Label - 标签
  labelLarge: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  } as TextStyle,
  labelMedium: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  } as TextStyle,
  labelSmall: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.5,
  } as TextStyle,
};

export type TypographyVariant = keyof typeof typography;
```

### 3.4 阅读器字体配置

```typescript
// src/theme/readerTypography.ts

import { FontFamilies } from './fonts';

export type ReaderFontFamily = 'system' | 'notoSerif' | 'literata';

export interface ReaderTypographySettings {
  fontFamily: ReaderFontFamily;
  fontSize: number; // 14-28
  lineSpacing: number; // 1.2-2.0
  paragraphSpacing: number; // 8-24
}

export const defaultReaderTypography: ReaderTypographySettings = {
  fontFamily: 'system',
  fontSize: 18,
  lineSpacing: 1.6,
  paragraphSpacing: 16,
};

export function getReaderFontFamily(font: ReaderFontFamily): string | undefined {
  switch (font) {
    case 'notoSerif':
      return FontFamilies.notoSerif;
    case 'literata':
      return FontFamilies.literata;
    default:
      return undefined;
  }
}

export const readerFontOptions: { label: string; value: ReaderFontFamily }[] = [
  { label: '系统默认', value: 'system' },
  { label: 'Noto Serif', value: 'notoSerif' },
  { label: 'Literata', value: 'literata' },
];
```

---

## 4. Spacing & Layout

### 4.1 间距系统

```typescript
// src/theme/spacing.ts

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export type Spacing = keyof typeof spacing;
```

### 4.2 圆角系统

```typescript
// src/theme/shapes.ts

export const borderRadius = {
  none: 0,
  xs: 4,   // 标签、徽章
  sm: 8,   // 按钮、输入框
  md: 12,  // 卡片
  lg: 16,  // 对话框、底部表单
  xl: 24,  // 全屏表单
  full: 9999, // 圆形/胶囊
} as const;

// 特殊形状
export const shapes = {
  // 书籍封面
  bookCover: borderRadius.xs,

  // 底部 Sheet
  bottomSheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // AI 面板
  aiPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  // 胶囊形状
  capsule: borderRadius.full,
} as const;

export type BorderRadius = keyof typeof borderRadius;
```

### 4.3 阴影系统

```typescript
// src/theme/shadows.ts

import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {} as ViewStyle,

  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }) as ViewStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }) as ViewStyle,

  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }) as ViewStyle,

  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: {
      elevation: 16,
    },
  }) as ViewStyle,
};

export type Shadow = keyof typeof shadows;
```

---

## 5. 图标系统

### 5.1 图标库配置

```typescript
// src/components/Icon.tsx

import React from 'react';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { useColors } from '@/theme/ThemeProvider';

type IconLibrary = 'material' | 'ionicons' | 'feather';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

export function Icon({
  name,
  size = 24,
  color,
  library = 'material',
}: IconProps) {
  const colors = useColors();
  const iconColor = color || colors.onSurface;

  switch (library) {
    case 'ionicons':
      return <Ionicons name={name as any} size={size} color={iconColor} />;
    case 'feather':
      return <Feather name={name as any} size={size} color={iconColor} />;
    default:
      return (
        <MaterialCommunityIcons
          name={name as any}
          size={size}
          color={iconColor}
        />
      );
  }
}
```

### 5.2 常用图标映射

```typescript
// src/theme/icons.ts

export const AppIcons = {
  // 导航
  home: 'home',
  library: 'book-multiple',
  discover: 'compass',
  profile: 'account-circle',
  settings: 'cog',

  // 阅读
  bookmark: 'bookmark',
  bookmarkOutline: 'bookmark-outline',
  highlight: 'marker',
  note: 'note-text',

  // AI 功能
  translate: 'translate',
  sparkle: 'shimmer',
  brain: 'head-lightbulb',

  // 操作
  play: 'play',
  pause: 'pause',
  share: 'share-variant',
  search: 'magnify',
  close: 'close',
  back: 'arrow-left',
  more: 'dots-vertical',

  // 学习
  vocabulary: 'book-alphabet',
  flashcard: 'cards',
  streak: 'fire',

  // 状态
  check: 'check',
  error: 'alert-circle',
  info: 'information',
  warning: 'alert',
} as const;

export type AppIcon = keyof typeof AppIcons;
```

---

## 6. App Icon 配置

### 6.1 Expo 配置

```json
// app.json
{
  "expo": {
    "name": "Readmigo",
    "slug": "readmigo",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2D5A7B"
    },
    "ios": {
      "bundleIdentifier": "com.readmigo.app",
      "supportsTablet": true,
      "icon": "./assets/icon-ios.png"
    },
    "android": {
      "package": "com.readmigo.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/adaptive-icon-background.png",
        "monochromeImage": "./assets/adaptive-icon-monochrome.png"
      }
    }
  }
}
```

### 6.2 图标资源规范

| 资源 | 尺寸 | 用途 |
|------|------|------|
| `icon.png` | 1024×1024 | 通用图标 |
| `icon-ios.png` | 1024×1024 | iOS App Store |
| `adaptive-icon-foreground.png` | 1024×1024 | Android 前景 (108dp safe zone) |
| `adaptive-icon-background.png` | 1024×1024 | Android 背景 |
| `adaptive-icon-monochrome.png` | 1024×1024 | Android 13+ 单色 |
| `splash.png` | 1284×2778 | 启动画面 |
| `favicon.png` | 48×48 | Web favicon |

---

## 7. Splash Screen 启动画面

### 7.1 expo-splash-screen 配置

```typescript
// app/_layout.tsx

import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { fontAssets } from '@/theme/fonts';

// 防止自动隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 预加载字体
        await Font.loadAsync(fontAssets);

        // 预加载其他资源
        // await Asset.loadAsync([...]);

        // 其他初始化工作
        // await initializeApp();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 渐隐隐藏 Splash Screen
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* App content */}
    </View>
  );
}
```

### 7.2 自定义动画 Splash

```typescript
// src/components/AnimatedSplash.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { BrandColors } from '@/theme/colors';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo 动画
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 200 })
    );
    logoOpacity.value = withTiming(1, { duration: 400 });

    // Sparkle 动画
    sparkleOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 300 })
    );

    // 淡出
    containerOpacity.value = withDelay(
      1200,
      withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Image
        source={require('@/assets/logo-white.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
      <Animated.Image
        source={require('@/assets/sparkle.png')}
        style={[styles.sparkle, sparkleStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BrandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logo: {
    width: 120,
    height: 120,
  },
  sparkle: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: '35%',
    right: '35%',
  },
});
```

---

## 8. 动效规范

### 8.1 动画时长与曲线

```typescript
// src/theme/animations.ts

import { Easing } from 'react-native-reanimated';

export const durations = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const easings = {
  // 标准曲线
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  // 强调曲线 - 进入
  emphasizedAccelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
  // 强调曲线 - 退出
  emphasizedDecelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
  // 弹性
  spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),
} as const;

// 动画预设
export const animationConfig = {
  // 翻页
  pageFlip: {
    duration: 300,
    easing: easings.standard,
  },
  // 工具栏显隐
  toolbar: {
    duration: 250,
    easing: easings.emphasizedDecelerate,
  },
  // AI 面板
  aiPanel: {
    damping: 15,
    stiffness: 150,
  },
  // 选择菜单
  menu: {
    duration: 200,
    easing: easings.emphasizedDecelerate,
  },
  // 页面切换
  screenTransition: {
    duration: 300,
    easing: easings.standard,
  },
};
```

### 8.2 Reanimated 动画 Hooks

```typescript
// src/hooks/useAnimations.ts

import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { animationConfig } from '@/theme/animations';

// 淡入淡出
export function useFadeAnimation(visible: boolean) {
  const opacity = useSharedValue(visible ? 1 : 0);

  const animate = () => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: animationConfig.toolbar.duration,
      easing: animationConfig.toolbar.easing,
    });
  };

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { style, animate };
}

// 滑入滑出
export function useSlideAnimation(
  visible: boolean,
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
) {
  const progress = useSharedValue(visible ? 1 : 0);

  const animate = () => {
    progress.value = withSpring(visible ? 1 : 0, animationConfig.aiPanel);
  };

  const style = useAnimatedStyle(() => {
    const translateMap = {
      up: { translateY: interpolate(progress.value, [0, 1], [100, 0]) },
      down: { translateY: interpolate(progress.value, [0, 1], [-100, 0]) },
      left: { translateX: interpolate(progress.value, [0, 1], [100, 0]) },
      right: { translateX: interpolate(progress.value, [0, 1], [-100, 0]) },
    };

    return {
      opacity: progress.value,
      transform: [translateMap[direction]],
    };
  });

  return { style, animate };
}

// 缩放动画
export function useScaleAnimation() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { style, onPressIn, onPressOut };
}
```

---

## 9. 触觉反馈

### 9.1 Haptics 模块

```typescript
// src/utils/haptics.ts

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  // 轻触反馈 - 翻页、选择
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // 中等反馈 - 确认操作
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  // 重度反馈 - 重要操作
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  // 成功反馈
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  // 警告反馈
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  // 错误反馈
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  // 选择反馈 - 选择器滚动
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  },
};
```

### 9.2 Haptics Hook

```typescript
// src/hooks/useHaptics.ts

import { useCallback } from 'react';
import { haptics } from '@/utils/haptics';
import { useSettingsStore } from '@/stores/settingsStore';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const trigger = useCallback(
    (type: keyof typeof haptics) => {
      if (hapticsEnabled) {
        haptics[type]();
      }
    },
    [hapticsEnabled]
  );

  return {
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    selection: () => trigger('selection'),
  };
}
```

---

## 10. 基础 UI 组件

### 10.1 Text 组件

```typescript
// src/components/ui/Text.tsx

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, TypographyVariant } from '@/theme/typography';
import { useColors } from '@/theme/ThemeProvider';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'bodyMedium',
  color,
  align,
  style,
  children,
  ...props
}: TextProps) {
  const colors = useColors();

  return (
    <RNText
      style={[
        typography[variant],
        { color: color || colors.textPrimary },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
```

### 10.2 Button 组件

```typescript
// src/components/ui/Button.tsx

import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from './Text';
import { useColors } from '@/theme/ThemeProvider';
import { useScaleAnimation } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { borderRadius, spacing } from '@/theme';

type ButtonVariant = 'filled' | 'outlined' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  variant = 'filled',
  size = 'md',
  loading = false,
  icon,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const haptics = useHaptics();
  const { style: animatedStyle, onPressIn, onPressOut } = useScaleAnimation();

  const handlePress = (e: any) => {
    haptics.light();
    onPress?.(e);
  };

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  };

  const variantStyles = {
    filled: {
      backgroundColor: disabled ? colors.surfaceVariant : colors.primary,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? colors.outline : colors.primary,
    },
    text: {
      backgroundColor: 'transparent',
    },
  };

  const textColor =
    variant === 'filled'
      ? colors.onPrimary
      : disabled
      ? colors.textDisabled
      : colors.primary;

  return (
    <AnimatedPressable
      style={[
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        animatedStyle,
      ]}
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            variant={size === 'sm' ? 'labelMedium' : 'labelLarge'}
            color={textColor}
            style={icon ? { marginLeft: spacing.sm } : undefined}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
});
```

### 10.3 Card 组件

```typescript
// src/components/ui/Card.tsx

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useColors } from '@/theme/ThemeProvider';
import { borderRadius, spacing, shadows } from '@/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
}

export function Card({
  variant = 'elevated',
  padding = 'lg',
  style,
  children,
  ...props
}: CardProps) {
  const colors = useColors();

  const variantStyles = {
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    filled: {
      backgroundColor: colors.surfaceVariant,
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        { padding: spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
  },
});
```

---

## 11. App Store / Play Store 素材规范

### 11.1 截图规格

| 设备 | 尺寸 | 数量 |
|------|------|------|
| iPhone 6.7" | 1290×2796 | 4-10 |
| iPhone 6.5" | 1242×2688 | 4-10 |
| iPhone 5.5" | 1242×2208 | 4-10 |
| iPad Pro 12.9" | 2048×2732 | 4-10 |
| Android Phone | 1080×1920 - 1080×2340 | 4-8 |
| Android Tablet 7" | 1200×1920 | 4-8 |
| Android Tablet 10" | 1920×1200 | 4-8 |

### 11.2 图标规格

| 平台 | 尺寸 | 格式 |
|------|------|------|
| App Store | 1024×1024 | PNG (无透明) |
| Play Store | 512×512 | PNG |

### 11.3 功能图/横幅

| 平台 | 尺寸 | 格式 |
|------|------|------|
| Play Store Feature Graphic | 1024×500 | PNG/JPG |

---

## 12. 与 iOS/Android 对齐检查清单

| 项目 | iOS | Android | React Native | 状态 |
|------|-----|---------|--------------|------|
| 品牌色 | ✅ 统一 | ✅ Material 3 | ✅ 自定义 Theme | ✅ |
| 深色模式 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | Light/Dark/Sepia | ✅ |
| 字体系统 | SF Pro | Roboto | 系统默认 | ✅ |
| 阅读字体 | Georgia/Palatino | NotoSerif/Literata | NotoSerif/Literata | ✅ |
| App Icon | Asset Catalog | Adaptive Icon | Expo Config | ✅ |
| Splash Screen | Launch Storyboard | Splash Screen API | expo-splash-screen | ✅ |
| 动画曲线 | iOS 标准 | Material Motion | Reanimated 3 | ✅ |
| 触觉反馈 | Haptic Engine | Vibrator | expo-haptics | ✅ |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-12-26 | 1.0.0 | 初始版本 |
