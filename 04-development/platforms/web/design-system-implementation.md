# Web 设计系统实现规范

> 本文档定义 Readmigo Web 客户端的设计系统实现，确保与 iOS/Android 原生客户端和品牌规范保持一致。

## 1. 概述

### 1.1 设计原则

遵循共享设计系统 (`docs/02-design/design-system.md`) 的四大原则：
- **专注阅读 (Reading First)** - 界面干净简洁，不干扰阅读
- **AI 无处不在但不突兀 (Ambient AI)** - AI 功能融入自然交互
- **渐进式学习 (Progressive Learning)** - 难度循序渐进，成长可视化
- **全球化设计 (Global Design)** - 支持多语言，文化中性设计

### 1.2 技术栈

| 组件 | 技术选型 |
|------|----------|
| UI 框架 | Next.js 14+ App Router |
| 样式系统 | Tailwind CSS 3.4+ |
| 组件库 | shadcn/ui |
| 图标库 | Lucide React |
| 动画 | Framer Motion |
| 字体 | next/font + Google Fonts |

---

## 2. Tailwind 配置

### 2.1 tailwind.config.ts

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // ============================================
      // 品牌色 (来自 design-system.md)
      // ============================================
      colors: {
        // Brand Colors
        brand: {
          primary: {
            DEFAULT: 'hsl(var(--brand-primary))',
            light: 'hsl(var(--brand-primary-light))',
            dark: 'hsl(var(--brand-primary-dark))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--brand-secondary))',
            light: 'hsl(var(--brand-secondary-light))',
            dark: 'hsl(var(--brand-secondary-dark))',
          },
          accent: {
            DEFAULT: 'hsl(var(--brand-accent))',
            light: 'hsl(var(--brand-accent-light))',
            dark: 'hsl(var(--brand-accent-dark))',
          },
        },
        // shadcn/ui semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Semantic colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        // Reader colors
        reader: {
          light: {
            bg: 'hsl(var(--reader-light-bg))',
            text: 'hsl(var(--reader-light-text))',
          },
          dark: {
            bg: 'hsl(var(--reader-dark-bg))',
            text: 'hsl(var(--reader-dark-text))',
          },
          sepia: {
            bg: 'hsl(var(--reader-sepia-bg))',
            text: 'hsl(var(--reader-sepia-text))',
          },
        },
      },

      // ============================================
      // 圆角
      // ============================================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        book: '4px', // 书籍封面
      },

      // ============================================
      // 字体
      // ============================================
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        serif: ['var(--font-serif)', ...fontFamily.serif],
        mono: ['var(--font-mono)', ...fontFamily.mono],
        reader: ['var(--font-reader)', ...fontFamily.serif],
      },

      // ============================================
      // 间距
      // ============================================
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ============================================
      // 动画
      // ============================================
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-to-bottom': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(100%)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-out-to-bottom': 'slide-out-to-bottom 0.2s ease-in',
        'fade-in': 'fade-in 0.25s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        shimmer: 'shimmer 2s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        sparkle: 'sparkle 1.5s ease-in-out infinite',
      },

      // ============================================
      // 阴影
      // ============================================
      boxShadow: {
        'book': '0 4px 8px -2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'ai-panel': '0 -4px 20px -2px rgb(0 0 0 / 0.15)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### 2.2 CSS 变量 (globals.css)

```css
/* src/app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ============================================ */
    /* Brand Colors (HSL values) */
    /* ============================================ */

    /* Primary: #2D5A7B - 深蓝色 (知识、可信赖) */
    --brand-primary: 204 45% 33%;
    --brand-primary-light: 204 35% 50%;
    --brand-primary-dark: 204 55% 22%;

    /* Secondary: #64B5A0 - 青绿色 (成长、活力) */
    --brand-secondary: 165 38% 55%;
    --brand-secondary-light: 165 50% 70%;
    --brand-secondary-dark: 165 45% 36%;

    /* Accent: #FFB347 - 暖橙色 (AI、智能) */
    --brand-accent: 35 100% 64%;
    --brand-accent-light: 45 100% 76%;
    --brand-accent-dark: 35 80% 45%;

    /* ============================================ */
    /* Light Theme */
    /* ============================================ */

    --background: 40 20% 98%; /* #FAFAF8 米白色 */
    --foreground: 240 6% 12%; /* #1C1C1E 深灰色 */

    --card: 0 0% 100%;
    --card-foreground: 240 6% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 240 6% 12%;

    --primary: 204 45% 33%;
    --primary-foreground: 0 0% 100%;

    --secondary: 165 38% 55%;
    --secondary-foreground: 0 0% 100%;

    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;

    --accent: 35 100% 64%;
    --accent-foreground: 0 0% 0%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 204 45% 33%;

    --radius: 0.75rem;

    /* Semantic Colors */
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 45 93% 47%;
    --warning-foreground: 0 0% 0%;
    --info: 211 96% 51%;
    --info-foreground: 0 0% 100%;

    /* Reader Colors */
    --reader-light-bg: 0 0% 100%;
    --reader-light-text: 0 0% 0%;
    --reader-dark-bg: 0 0% 10%;
    --reader-dark-text: 0 0% 88%;
    --reader-sepia-bg: 32 41% 91%;
    --reader-sepia-text: 16 47% 29%;
  }

  .dark {
    /* ============================================ */
    /* Dark Theme */
    /* ============================================ */

    --background: 0 0% 10%; /* #1A1A1A */
    --foreground: 0 0% 90%; /* #E5E5E5 */

    --card: 240 4% 11%;
    --card-foreground: 0 0% 90%;

    --popover: 240 4% 11%;
    --popover-foreground: 0 0% 90%;

    --primary: 204 35% 60%;
    --primary-foreground: 204 55% 22%;

    --secondary: 165 45% 60%;
    --secondary-foreground: 165 45% 20%;

    --muted: 240 4% 16%;
    --muted-foreground: 240 5% 65%;

    --accent: 45 100% 76%;
    --accent-foreground: 35 80% 20%;

    --destructive: 0 63% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 240 4% 20%;
    --input: 240 4% 20%;
    --ring: 204 35% 60%;

    /* Semantic Colors (Dark) */
    --success: 142 50% 55%;
    --success-foreground: 0 0% 100%;
    --warning: 45 80% 60%;
    --warning-foreground: 0 0% 0%;
    --info: 211 80% 60%;
    --info-foreground: 0 0% 100%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* ============================================ */
/* Reader Theme Classes */
/* ============================================ */

.reader-light {
  --reader-bg: var(--reader-light-bg);
  --reader-text: var(--reader-light-text);
}

.reader-dark {
  --reader-bg: var(--reader-dark-bg);
  --reader-text: var(--reader-dark-text);
}

.reader-sepia {
  --reader-bg: var(--reader-sepia-bg);
  --reader-text: var(--reader-sepia-text);
}

.reader-content {
  background-color: hsl(var(--reader-bg));
  color: hsl(var(--reader-text));
}

/* ============================================ */
/* Typography Utilities */
/* ============================================ */

.text-balance {
  text-wrap: balance;
}

/* Prose customization for reader */
.prose-reader {
  --tw-prose-body: hsl(var(--reader-text));
  --tw-prose-headings: hsl(var(--reader-text));
  --tw-prose-links: hsl(var(--brand-primary));
}

/* ============================================ */
/* Skeleton Loading */
/* ============================================ */

.skeleton {
  @apply animate-pulse bg-muted rounded-md;
}

.skeleton-shimmer {
  @apply relative overflow-hidden;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  @apply animate-shimmer;
}
```

---

## 3. 主题系统

### 3.1 Theme Provider

```typescript
// src/providers/ThemeProvider.tsx

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 3.2 Theme Hook

```typescript
// src/hooks/useTheme.ts

import { useTheme as useNextTheme } from 'next-themes';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();

  return {
    theme: theme as ThemeMode,
    setTheme: (mode: ThemeMode) => setTheme(mode),
    systemTheme,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    isDark: resolvedTheme === 'dark',
  };
}
```

### 3.3 Theme Toggle Component

```typescript
// src/components/ui/ThemeToggle.tsx

'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={theme === option.value ? 'bg-accent' : ''}
          >
            {option.icon}
            <span className="ml-2">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 3.4 Theme Store (Zustand)

```typescript
// src/stores/themeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ReaderTheme = 'light' | 'dark' | 'sepia';

interface ThemeState {
  // App theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Reader theme (independent of app theme)
  readerTheme: ReaderTheme;
  setReaderTheme: (theme: ReaderTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      readerTheme: 'light',
      setReaderTheme: (theme) => set({ readerTheme: theme }),
    }),
    {
      name: 'readmigo-theme',
    }
  )
);
```

---

## 4. Typography 字体系统

### 4.1 字体配置

```typescript
// src/app/fonts.ts

import { Inter, Noto_Serif, JetBrains_Mono, Literata } from 'next/font/google';
import localFont from 'next/font/local';

// 界面字体
export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// 阅读字体 - Noto Serif (多语言支持)
export const fontSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '700'],
});

// 阅读字体 - Literata (优美西文)
export const fontLiterata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
  weight: ['400', '500', '700'],
});

// 代码字体
export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// 合并字体变量
export const fontVariables = [
  fontSans.variable,
  fontSerif.variable,
  fontLiterata.variable,
  fontMono.variable,
].join(' ');
```

### 4.2 Typography 组件

```typescript
// src/components/ui/Typography.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const typographyVariants = cva('', {
  variants: {
    variant: {
      // Display
      displayLarge: 'text-[57px] leading-[64px] font-bold tracking-tight',
      displayMedium: 'text-[45px] leading-[52px] font-bold',
      displaySmall: 'text-[36px] leading-[44px] font-bold',

      // Headline
      headlineLarge: 'text-[32px] leading-[40px] font-semibold',
      headlineMedium: 'text-[28px] leading-[36px] font-semibold',
      headlineSmall: 'text-[24px] leading-[32px] font-semibold',

      // Title
      titleLarge: 'text-[20px] leading-[28px] font-medium',
      titleMedium: 'text-[16px] leading-[24px] font-medium tracking-[0.15px]',
      titleSmall: 'text-[14px] leading-[20px] font-medium tracking-[0.1px]',

      // Body
      bodyLarge: 'text-[16px] leading-[24px] font-normal tracking-[0.5px]',
      bodyMedium: 'text-[14px] leading-[20px] font-normal tracking-[0.25px]',
      bodySmall: 'text-[12px] leading-[16px] font-normal tracking-[0.4px]',

      // Label
      labelLarge: 'text-[14px] leading-[20px] font-medium tracking-[0.1px]',
      labelMedium: 'text-[12px] leading-[16px] font-medium tracking-[0.5px]',
      labelSmall: 'text-[11px] leading-[16px] font-medium tracking-[0.5px]',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary',
      destructive: 'text-destructive',
      accent: 'text-accent',
    },
  },
  defaultVariants: {
    variant: 'bodyMedium',
    color: 'default',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const elementMap: Record<string, React.ElementType> = {
  displayLarge: 'h1',
  displayMedium: 'h1',
  displaySmall: 'h1',
  headlineLarge: 'h2',
  headlineMedium: 'h3',
  headlineSmall: 'h4',
  titleLarge: 'h5',
  titleMedium: 'h6',
  titleSmall: 'h6',
  bodyLarge: 'p',
  bodyMedium: 'p',
  bodySmall: 'p',
  labelLarge: 'span',
  labelMedium: 'span',
  labelSmall: 'span',
};

export function Typography({
  className,
  variant,
  color,
  as,
  ...props
}: TypographyProps) {
  const Component = as || elementMap[variant || 'bodyMedium'] || 'p';

  return (
    <Component
      className={cn(typographyVariants({ variant, color, className }))}
      {...props}
    />
  );
}
```

### 4.3 阅读器字体配置

```typescript
// src/lib/reader-fonts.ts

export type ReaderFontFamily = 'system' | 'notoSerif' | 'literata' | 'georgia';

export interface ReaderTypographySettings {
  fontFamily: ReaderFontFamily;
  fontSize: number; // 14-28
  lineHeight: number; // 1.4-2.0
  paragraphSpacing: number; // 8-24
  textAlign: 'left' | 'justify';
}

export const defaultReaderTypography: ReaderTypographySettings = {
  fontFamily: 'system',
  fontSize: 18,
  lineHeight: 1.6,
  paragraphSpacing: 16,
  textAlign: 'left',
};

export const readerFontOptions: { label: string; value: ReaderFontFamily; css: string }[] = [
  { label: 'System', value: 'system', css: 'system-ui, sans-serif' },
  { label: 'Noto Serif', value: 'notoSerif', css: 'var(--font-serif), Georgia, serif' },
  { label: 'Literata', value: 'literata', css: 'var(--font-literata), Georgia, serif' },
  { label: 'Georgia', value: 'georgia', css: 'Georgia, serif' },
];

export function getReaderFontCSS(font: ReaderFontFamily): string {
  const option = readerFontOptions.find((o) => o.value === font);
  return option?.css || 'system-ui, sans-serif';
}

export function getReaderStyles(settings: ReaderTypographySettings): React.CSSProperties {
  return {
    fontFamily: getReaderFontCSS(settings.fontFamily),
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    '--paragraph-spacing': `${settings.paragraphSpacing}px`,
  } as React.CSSProperties;
}
```

---

## 5. 间距与布局

### 5.1 间距系统

```typescript
// src/lib/spacing.ts

export const spacing = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  '4xl': '2.5rem', // 40px
  '5xl': '3rem',   // 48px
  '6xl': '4rem',   // 64px
} as const;

export type Spacing = keyof typeof spacing;
```

### 5.2 响应式断点

```typescript
// src/lib/breakpoints.ts

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// 常用布局宽度
export const layoutWidths = {
  reader: '65ch',      // 阅读最佳宽度
  content: '720px',    // 内容区域
  wide: '1200px',      // 宽内容
  full: '100%',        // 全宽
} as const;
```

### 5.3 Layout 组件

```typescript
// src/components/layout/Container.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-2xl',     // 672px
  md: 'max-w-4xl',     // 896px
  lg: 'max-w-6xl',     // 1152px
  xl: 'max-w-7xl',     // 1280px
  full: 'max-w-full',
};

export function Container({
  size = 'lg',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

## 6. 图标系统

### 6.1 图标组件

```typescript
// src/components/ui/Icon.tsx

import * as React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({ icon: IconComponent, className, ...props }: IconProps) {
  return <IconComponent className={cn('h-5 w-5', className)} {...props} />;
}
```

### 6.2 应用图标映射

```typescript
// src/lib/icons.ts

import {
  Home,
  BookOpen,
  Compass,
  User,
  Settings,
  Bookmark,
  BookMarked,
  Highlighter,
  StickyNote,
  Languages,
  Sparkles,
  Brain,
  Play,
  Pause,
  Share2,
  Search,
  X,
  ArrowLeft,
  MoreVertical,
  BookA,
  CreditCard,
  Flame,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Star,
  Heart,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

export const AppIcons = {
  // Navigation
  home: Home,
  library: BookOpen,
  discover: Compass,
  profile: User,
  settings: Settings,

  // Reading
  bookmark: Bookmark,
  bookmarkFilled: BookMarked,
  highlight: Highlighter,
  note: StickyNote,

  // AI Features
  translate: Languages,
  sparkle: Sparkles,
  brain: Brain,

  // Actions
  play: Play,
  pause: Pause,
  share: Share2,
  search: Search,
  close: X,
  back: ArrowLeft,
  more: MoreVertical,

  // Learning
  vocabulary: BookA,
  flashcard: CreditCard,
  streak: Flame,

  // Status
  check: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,

  // Theme
  moon: Moon,
  sun: Sun,
  system: Monitor,

  // Audio
  volumeOn: Volume2,
  volumeOff: VolumeX,

  // Navigation arrows
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,

  // Common actions
  plus: Plus,
  minus: Minus,
  star: Star,
  heart: Heart,
  download: Download,
  upload: Upload,
  delete: Trash2,
  edit: Edit,
  copy: Copy,
  externalLink: ExternalLink,
  loader: Loader2,
} as const satisfies Record<string, LucideIcon>;

export type AppIcon = keyof typeof AppIcons;
```

---

## 7. 动效系统

### 7.1 Framer Motion 变体

```typescript
// src/lib/animations.ts

import { Variants, Transition } from 'framer-motion';

// ============================================
// 动画时长与曲线
// ============================================

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const;

export const easings = {
  standard: [0.4, 0, 0.2, 1],
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15],
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
  spring: { type: 'spring', damping: 15, stiffness: 150 },
} as const;

// ============================================
// 通用动画变体
// ============================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideInFromBottomVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ============================================
// 特定场景动画
// ============================================

// AI 面板
export const aiPanelVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: easings.spring,
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: durations.fast },
  },
};

// 工具栏
export const toolbarVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.fast, ease: easings.emphasizedDecelerate },
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.instant },
  },
};

// 选择菜单
export const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.fast, ease: easings.emphasizedDecelerate },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: durations.instant },
  },
};

// 列表项交错动画
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.fast },
  },
};

// 翻页动画
export const pageFlipVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.standard },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: durations.normal, ease: easings.standard },
  }),
};

// ============================================
// 过渡预设
// ============================================

export const transitions = {
  default: { duration: durations.normal, ease: easings.standard } as Transition,
  fast: { duration: durations.fast, ease: easings.standard } as Transition,
  slow: { duration: durations.slow, ease: easings.standard } as Transition,
  spring: easings.spring as Transition,
} as const;
```

### 7.2 动画 Hooks

```typescript
// src/hooks/useAnimations.ts

'use client';

import { useReducedMotion } from 'framer-motion';
import { durations, easings, transitions, fadeVariants } from '@/lib/animations';

export function useAnimations() {
  const shouldReduceMotion = useReducedMotion();

  // 如果用户偏好减少动画，返回简化版本
  if (shouldReduceMotion) {
    return {
      duration: 0,
      transition: { duration: 0 },
      variants: fadeVariants,
    };
  }

  return {
    duration: durations,
    transition: transitions,
    easings,
  };
}

// 按钮按压动画
export function useButtonAnimation() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {};
  }

  return {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
  };
}

// 悬停动画
export function useHoverAnimation() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {};
  }

  return {
    whileHover: { scale: 1.02 },
    transition: { duration: 0.2 },
  };
}
```

### 7.3 动画组件

```typescript
// src/components/ui/AnimatedPresence.tsx

'use client';

import * as React from 'react';
import { motion, AnimatePresence as FramerAnimatePresence, Variants } from 'framer-motion';
import { fadeVariants, slideUpVariants, scaleVariants, transitions } from '@/lib/animations';

interface AnimatedProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slideUp' | 'scale';
  delay?: number;
}

const variantMap: Record<string, Variants> = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  scale: scaleVariants,
};

export function Animated({
  children,
  className,
  variant = 'fade',
  delay = 0,
}: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variantMap[variant]}
      transition={{ ...transitions.default, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { FramerAnimatePresence as AnimatePresence };
```

---

## 8. 加载状态

### 8.1 Skeleton 组件

```typescript
// src/components/ui/Skeleton.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer';
}

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        variant === 'shimmer' ? 'skeleton-shimmer' : 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// 书籍卡片骨架
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-[2/3] w-full rounded-book" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// 列表项骨架
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// 段落骨架
export function ParagraphSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
```

### 8.2 Loading Spinner

```typescript
// src/components/ui/LoadingSpinner.tsx

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
}

// 全屏加载
export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// 内容区域加载
export function ContentLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
```

---

## 9. 基础 UI 组件

### 9.1 Button 扩展

```typescript
// src/components/ui/button-extended.tsx

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useButtonAnimation } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ExtendedButtonProps extends ButtonProps {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const MotionButton = motion(Button);

export function AnimatedButton({
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ExtendedButtonProps) {
  const buttonAnimation = useButtonAnimation();

  return (
    <MotionButton
      disabled={disabled || loading}
      className={cn(className)}
      {...buttonAnimation}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
    </MotionButton>
  );
}
```

### 9.2 Card 扩展

```typescript
// src/components/ui/card-extended.tsx

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHoverAnimation } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export function InteractiveCard({
  children,
  interactive = true,
  className,
  ...props
}: InteractiveCardProps) {
  const hoverAnimation = useHoverAnimation();

  if (!interactive) {
    return (
      <Card className={className} {...props}>
        {children}
      </Card>
    );
  }

  return (
    <motion.div {...hoverAnimation}>
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-card-hover',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

// 书籍卡片
export function BookCard({
  coverUrl,
  title,
  author,
  progress,
  onClick,
  className,
}: {
  coverUrl: string;
  title: string;
  author: string;
  progress?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <InteractiveCard
      onClick={onClick}
      className={cn('overflow-hidden p-0', className)}
    >
      <div className="aspect-[2/3] relative">
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover rounded-book"
        />
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="font-medium text-sm line-clamp-2">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{author}</p>
      </CardContent>
    </InteractiveCard>
  );
}
```

### 9.3 Toast 配置

```typescript
// src/components/ui/toast-config.tsx

import { toast, Toaster as SonnerToaster } from 'sonner';
import { Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast 配置组件
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'bg-card border-border shadow-lg',
          title: 'text-foreground font-medium',
          description: 'text-muted-foreground',
          success: 'border-success bg-success/10',
          error: 'border-destructive bg-destructive/10',
          warning: 'border-warning bg-warning/10',
          info: 'border-info bg-info/10',
        },
        duration: 3000,
      }}
    />
  );
}

// Toast 工具函数
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <Check className="h-4 w-4 text-success" />,
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="h-4 w-4 text-warning" />,
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4 text-info" />,
    });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};
```

---

## 10. 无障碍设计

### 10.1 焦点管理

```typescript
// src/hooks/useFocusManagement.ts

'use client';

import { useEffect, useRef } from 'react';

// 捕获焦点在元素内部
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

// 恢复焦点到触发元素
export function useRestoreFocus() {
  const triggerRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    triggerRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    triggerRef.current?.focus();
  };

  return { saveFocus, restoreFocus };
}
```

### 10.2 屏幕阅读器工具

```typescript
// src/components/ui/ScreenReaderOnly.tsx

import * as React from 'react';
import { cn } from '@/lib/utils';

// 仅屏幕阅读器可见
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  className,
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}) {
  return (
    <Component
      className={cn(
        'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
        '[clip:rect(0,0,0,0)]',
        className
      )}
    >
      {children}
    </Component>
  );
}

// 实时区域 - 用于动态内容通知
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
}: {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// 跳转到内容链接
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'absolute left-4 top-4 z-50 -translate-y-full rounded-md bg-primary px-4 py-2 text-primary-foreground',
        'focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring',
        'transition-transform'
      )}
    >
      Skip to main content
    </a>
  );
}
```

### 10.3 颜色对比度检查

```typescript
// src/lib/accessibility.ts

// 计算相对亮度
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// 计算对比度
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 检查是否符合 WCAG AA 标准
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// 检查是否符合 WCAG AAA 标准
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}
```

---

## 11. 与 iOS/Android 对齐检查清单

| 项目 | iOS | Android | Web | 状态 |
|------|-----|---------|-----|------|
| 品牌色 | SwiftUI | Material 3 | CSS Variables | ✅ |
| 深色模式 | 系统跟随 | 系统跟随 | next-themes | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | CSS Classes | ✅ |
| 字体系统 | SF Pro | Roboto | Inter (next/font) | ✅ |
| 阅读字体 | Georgia/Palatino | NotoSerif/Literata | Google Fonts | ✅ |
| 图标 | SF Symbols | Material Icons | Lucide React | ✅ |
| 动画系统 | SwiftUI Animation | Jetpack Compose | Framer Motion | ✅ |
| 组件库 | SwiftUI | Material 3 | shadcn/ui | ✅ |
| 间距系统 | Design Token | Design Token | Tailwind | ✅ |
| 无障碍 | VoiceOver | TalkBack | ARIA + Focus | ✅ |

---

## 12. 文件结构

```
src/
├── app/
│   ├── globals.css          # CSS 变量和全局样式
│   ├── fonts.ts             # 字体配置
│   └── layout.tsx           # 根布局
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ...
│   │   ├── Typography.tsx   # 排版组件
│   │   ├── Icon.tsx         # 图标组件
│   │   ├── Skeleton.tsx     # 骨架屏
│   │   └── AnimatedPresence.tsx
│   └── layout/
│       └── Container.tsx
├── lib/
│   ├── utils.ts             # cn() 工具函数
│   ├── animations.ts        # 动画变体
│   ├── icons.ts             # 图标映射
│   ├── spacing.ts           # 间距常量
│   ├── reader-fonts.ts      # 阅读器字体
│   └── accessibility.ts     # 无障碍工具
├── hooks/
│   ├── useTheme.ts          # 主题 Hook
│   ├── useAnimations.ts     # 动画 Hook
│   └── useFocusManagement.ts
├── stores/
│   └── themeStore.ts        # 主题状态
├── providers/
│   └── ThemeProvider.tsx    # 主题 Provider
└── tailwind.config.ts       # Tailwind 配置
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-12-26 | 1.0.0 | 初始版本 |
