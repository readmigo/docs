# Android 设计系统实现规范

> 本文档定义 Readmigo Android 客户端的设计系统实现，确保与 iOS 客户端和品牌规范保持一致。

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
| UI 框架 | Jetpack Compose |
| 主题系统 | Material 3 (Material You) |
| 图标 | Material Symbols |
| 字体 | Google Fonts (Roboto / Noto) |

---

## 2. Material 3 主题配置

### 2.1 品牌色映射

将品牌色映射到 Material 3 Color Roles：

```kotlin
// ui/theme/Color.kt

package com.readmigo.app.ui.theme

import androidx.compose.ui.graphics.Color

// ============================================
// Brand Colors (来自 design-system.md)
// ============================================

// Primary: #2D5A7B - 深蓝色 (知识、可信赖)
val BrandPrimary = Color(0xFF2D5A7B)
val BrandPrimaryLight = Color(0xFF5A87A8)
val BrandPrimaryDark = Color(0xFF1E3D52)

// Secondary: #64B5A0 - 青绿色 (成长、活力)
val BrandSecondary = Color(0xFF64B5A0)
val BrandSecondaryLight = Color(0xFF95E7D2)
val BrandSecondaryDark = Color(0xFF358472)

// Accent/Tertiary: #FFB347 - 暖橙色 (AI、智能)
val BrandAccent = Color(0xFFFFB347)
val BrandAccentLight = Color(0xFFFFE599)
val BrandAccentDark = Color(0xFFCC8A1A)

// Background: #FAFAF8 - 米白色 (阅读舒适)
val BrandBackground = Color(0xFFFAFAF8)
val BrandBackgroundDark = Color(0xFF1A1A1A)

// Text: #1C1C1E - 深灰色 (清晰可读)
val BrandText = Color(0xFF1C1C1E)
val BrandTextLight = Color(0xFFE5E5E5)

// ============================================
// Semantic Colors
// ============================================

val Success = Color(0xFF4CAF50)
val Warning = Color(0xFFFFC107)
val Error = Color(0xFFE53935)
val Info = Color(0xFF2196F3)

// ============================================
// Reader Theme Colors
// ============================================

object ReaderColors {
    // Light Theme
    val LightBackground = Color(0xFFFFFFFF)
    val LightText = Color(0xFF000000)

    // Dark Theme
    val DarkBackground = Color(0xFF1A1A1A)
    val DarkText = Color(0xFFE0E0E0)

    // Sepia Theme
    val SepiaBackground = Color(0xFFF5E6D3)
    val SepiaText = Color(0xFF5D4037)
}
```

### 2.2 Light Color Scheme

```kotlin
// ui/theme/Theme.kt

package com.readmigo.app.ui.theme

import androidx.compose.material3.lightColorScheme

val LightColorScheme = lightColorScheme(
    // Primary
    primary = BrandPrimary,
    onPrimary = Color.White,
    primaryContainer = BrandPrimaryLight.copy(alpha = 0.3f),
    onPrimaryContainer = BrandPrimaryDark,

    // Secondary
    secondary = BrandSecondary,
    onSecondary = Color.White,
    secondaryContainer = BrandSecondaryLight.copy(alpha = 0.3f),
    onSecondaryContainer = BrandSecondaryDark,

    // Tertiary (AI/Accent)
    tertiary = BrandAccent,
    onTertiary = Color.Black,
    tertiaryContainer = BrandAccentLight.copy(alpha = 0.3f),
    onTertiaryContainer = BrandAccentDark,

    // Background & Surface
    background = BrandBackground,
    onBackground = BrandText,
    surface = Color.White,
    onSurface = BrandText,
    surfaceVariant = Color(0xFFF0F0EE),
    onSurfaceVariant = Color(0xFF49454F),

    // Outline
    outline = Color(0xFFCAC4D0),
    outlineVariant = Color(0xFFE7E0EC),

    // Error
    error = Error,
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),

    // Inverse
    inverseSurface = Color(0xFF313033),
    inverseOnSurface = Color(0xFFF4EFF4),
    inversePrimary = BrandPrimaryLight,

    // Scrim
    scrim = Color.Black.copy(alpha = 0.32f)
)
```

### 2.3 Dark Color Scheme

```kotlin
val DarkColorScheme = darkColorScheme(
    // Primary
    primary = BrandPrimaryLight,
    onPrimary = BrandPrimaryDark,
    primaryContainer = BrandPrimary,
    onPrimaryContainer = BrandPrimaryLight,

    // Secondary
    secondary = BrandSecondaryLight,
    onSecondary = BrandSecondaryDark,
    secondaryContainer = BrandSecondary,
    onSecondaryContainer = BrandSecondaryLight,

    // Tertiary (AI/Accent)
    tertiary = BrandAccentLight,
    onTertiary = BrandAccentDark,
    tertiaryContainer = BrandAccent,
    onTertiaryContainer = BrandAccentLight,

    // Background & Surface
    background = BrandBackgroundDark,
    onBackground = BrandTextLight,
    surface = Color(0xFF1C1C1E),
    onSurface = BrandTextLight,
    surfaceVariant = Color(0xFF2C2C2E),
    onSurfaceVariant = Color(0xFFCAC4D0),

    // Outline
    outline = Color(0xFF938F99),
    outlineVariant = Color(0xFF49454F),

    // Error
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),

    // Inverse
    inverseSurface = Color(0xFFE6E1E5),
    inverseOnSurface = Color(0xFF313033),
    inversePrimary = BrandPrimary,

    // Scrim
    scrim = Color.Black.copy(alpha = 0.5f)
)
```

### 2.4 Theme Composable

```kotlin
// ui/theme/ReadmigoTheme.kt

package com.readmigo.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

enum class ThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

@Composable
fun ReadmigoTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    // 是否使用 Dynamic Color (Android 12+)
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val darkTheme = when (themeMode) {
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    val colorScheme = when {
        // Dynamic Color 仅在 Android 12+ 可用
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // 设置状态栏颜色
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.surface.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ReadmigoTypography,
        shapes = ReadmigoShapes,
        content = content
    )
}
```

---

## 3. Typography 字体系统

### 3.1 字体映射

| 用途 | iOS | Android |
|------|-----|---------|
| 界面字体 | SF Pro | Roboto (系统默认) |
| 阅读字体 | Georgia, Palatino, Charter | Noto Serif, Roboto Serif, Literata |
| 代码字体 | SF Mono | JetBrains Mono |

### 3.2 Typography 定义

```kotlin
// ui/theme/Typography.kt

package com.readmigo.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.readmigo.app.R

// 阅读字体 - 可选
val NotoSerifFamily = FontFamily(
    Font(R.font.noto_serif_regular, FontWeight.Normal),
    Font(R.font.noto_serif_medium, FontWeight.Medium),
    Font(R.font.noto_serif_bold, FontWeight.Bold)
)

val LiterataFamily = FontFamily(
    Font(R.font.literata_regular, FontWeight.Normal),
    Font(R.font.literata_medium, FontWeight.Medium),
    Font(R.font.literata_bold, FontWeight.Bold)
)

// 界面 Typography
val ReadmigoTypography = Typography(
    // Display
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    displayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 45.sp,
        lineHeight = 52.sp
    ),
    displaySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp,
        lineHeight = 44.sp
    ),

    // Headline
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 32.sp,
        lineHeight = 40.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 28.sp,
        lineHeight = 36.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 32.sp
    ),

    // Title
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 22.sp,
        lineHeight = 28.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),

    // Body
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    ),

    // Label
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)
```

### 3.3 阅读器字体配置

```kotlin
// ui/theme/ReaderTypography.kt

package com.readmigo.app.ui.theme

import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp

enum class ReaderFont(
    val displayName: String,
    val fontFamily: FontFamily
) {
    SYSTEM("系统默认", FontFamily.Default),
    NOTO_SERIF("Noto Serif", NotoSerifFamily),
    LITERATA("Literata", LiterataFamily),
    ROBOTO_SERIF("Roboto Serif", FontFamily.Serif)
}

data class ReaderTypographySettings(
    val font: ReaderFont = ReaderFont.SYSTEM,
    val fontSize: Int = 18, // sp
    val lineSpacing: Float = 1.5f,
    val paragraphSpacing: Int = 16 // dp
) {
    val fontSizeSp get() = fontSize.sp
    val lineHeightSp get() = (fontSize * lineSpacing).sp
}
```

---

## 4. Shape 形状系统

```kotlin
// ui/theme/Shape.kt

package com.readmigo.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val ReadmigoShapes = Shapes(
    // 超小圆角 - 标签、徽章
    extraSmall = RoundedCornerShape(4.dp),

    // 小圆角 - 按钮、输入框
    small = RoundedCornerShape(8.dp),

    // 中等圆角 - 卡片
    medium = RoundedCornerShape(12.dp),

    // 大圆角 - 对话框、底部表单
    large = RoundedCornerShape(16.dp),

    // 超大圆角 - 全屏表单
    extraLarge = RoundedCornerShape(24.dp)
)

// 特殊形状
object ReadmigoSpecialShapes {
    // 书籍封面圆角
    val BookCover = RoundedCornerShape(4.dp)

    // 底部 Sheet
    val BottomSheet = RoundedCornerShape(
        topStart = 24.dp,
        topEnd = 24.dp,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )

    // AI 面板
    val AIPanel = RoundedCornerShape(
        topStart = 20.dp,
        topEnd = 20.dp,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )

    // 胶囊形状
    val Capsule = RoundedCornerShape(50)
}
```

---

## 5. Adaptive Icon 自适应图标

### 5.1 图标尺寸规范

| 密度 | 目录 | 尺寸 (dp) | 尺寸 (px) |
|------|------|-----------|-----------|
| mdpi | mipmap-mdpi | 48 | 48×48 |
| hdpi | mipmap-hdpi | 48 | 72×72 |
| xhdpi | mipmap-xhdpi | 48 | 96×96 |
| xxhdpi | mipmap-xxhdpi | 48 | 144×144 |
| xxxhdpi | mipmap-xxxhdpi | 48 | 192×192 |

### 5.2 Adaptive Icon 配置

```xml
<!-- res/mipmap-anydpi-v26/ic_launcher.xml -->
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
    <monochrome android:drawable="@drawable/ic_launcher_monochrome"/>
</adaptive-icon>
```

### 5.3 图标资源结构

```
res/
├── mipmap-mdpi/
│   ├── ic_launcher.webp          # 48×48
│   └── ic_launcher_round.webp    # 48×48
├── mipmap-hdpi/
│   ├── ic_launcher.webp          # 72×72
│   └── ic_launcher_round.webp    # 72×72
├── mipmap-xhdpi/
│   ├── ic_launcher.webp          # 96×96
│   └── ic_launcher_round.webp    # 96×96
├── mipmap-xxhdpi/
│   ├── ic_launcher.webp          # 144×144
│   └── ic_launcher_round.webp    # 144×144
├── mipmap-xxxhdpi/
│   ├── ic_launcher.webp          # 192×192
│   └── ic_launcher_round.webp    # 192×192
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml           # Adaptive icon
│   └── ic_launcher_round.xml     # Adaptive icon (round)
└── drawable/
    ├── ic_launcher_background.xml  # 背景层 (品牌色 #2D5A7B)
    ├── ic_launcher_foreground.xml  # 前景层 (Logo)
    └── ic_launcher_monochrome.xml  # 单色图标 (Android 13+)
```

### 5.4 Foreground/Background 实现

```xml
<!-- res/drawable/ic_launcher_background.xml -->
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#2D5A7B"
        android:pathData="M0,0h108v108H0z"/>
</vector>
```

```xml
<!-- res/drawable/ic_launcher_foreground.xml -->
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- 从 design/assets/icons/logo-mark-white.svg 转换 -->
    <!-- Safe zone: 内部 66dp 区域 (边距 21dp) -->
    <group
        android:translateX="21"
        android:translateY="21">
        <!-- Logo path data here -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="..."/>
    </group>
</vector>
```

---

## 6. Splash Screen 启动画面

### 6.1 Android 12+ Splash Screen API

```xml
<!-- res/values/themes.xml -->
<resources>
    <!-- 启动主题 -->
    <style name="Theme.Readmigo.Splash" parent="Theme.SplashScreen">
        <!-- 背景色 -->
        <item name="windowSplashScreenBackground">#2D5A7B</item>

        <!-- 中心图标 (Adaptive Icon 或 AnimatedVectorDrawable) -->
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash_animated</item>

        <!-- 图标背景 (可选，用于圆形遮罩) -->
        <item name="windowSplashScreenIconBackgroundColor">#2D5A7B</item>

        <!-- 动画时长 -->
        <item name="windowSplashScreenAnimationDuration">1000</item>

        <!-- 退出后的主题 -->
        <item name="postSplashScreenTheme">@style/Theme.Readmigo</item>
    </style>

    <!-- 应用主题 -->
    <style name="Theme.Readmigo" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/brand_primary</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/brand_secondary</item>
        <item name="colorTertiary">@color/brand_accent</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
    </style>
</resources>
```

### 6.2 Splash Screen 动画

```xml
<!-- res/drawable/ic_splash_animated.xml -->
<?xml version="1.0" encoding="utf-8"?>
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:drawable="@drawable/ic_splash_logo">

    <target android:name="book">
        <aapt:attr name="android:animation">
            <objectAnimator
                android:propertyName="rotation"
                android:duration="800"
                android:valueFrom="-10"
                android:valueTo="0"
                android:valueType="floatType"
                android:interpolator="@android:interpolator/overshoot"/>
        </aapt:attr>
    </target>

    <target android:name="sparkle">
        <aapt:attr name="android:animation">
            <objectAnimator
                android:propertyName="alpha"
                android:duration="500"
                android:startOffset="400"
                android:valueFrom="0"
                android:valueTo="1"
                android:valueType="floatType"/>
        </aapt:attr>
    </target>
</animated-vector>
```

### 6.3 Activity 配置

```kotlin
// MainActivity.kt

package com.readmigo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.readmigo.app.ui.theme.ReadmigoTheme

class MainActivity : ComponentActivity() {

    private var keepSplashScreen = true

    override fun onCreate(savedInstanceState: Bundle?) {
        // 必须在 super.onCreate() 之前调用
        val splashScreen = installSplashScreen()

        super.onCreate(savedInstanceState)

        // 控制 Splash Screen 显示时长
        splashScreen.setKeepOnScreenCondition { keepSplashScreen }

        // 自定义退出动画
        splashScreen.setOnExitAnimationListener { splashScreenView ->
            splashScreenView.iconView?.animate()
                ?.scaleX(0f)
                ?.scaleY(0f)
                ?.alpha(0f)
                ?.setDuration(300)
                ?.withEndAction { splashScreenView.remove() }
                ?.start()
        }

        setContent {
            ReadmigoTheme {
                // 初始化完成后隐藏 Splash
                LaunchedEffect(Unit) {
                    // 等待必要的初始化
                    delay(500)
                    keepSplashScreen = false
                }

                ReadmigoApp()
            }
        }
    }
}
```

### 6.4 依赖配置

```kotlin
// build.gradle.kts (app)
dependencies {
    implementation("androidx.core:core-splashscreen:1.0.1")
}
```

---

## 7. 颜色资源文件

```xml
<!-- res/values/colors.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Brand Colors -->
    <color name="brand_primary">#2D5A7B</color>
    <color name="brand_primary_light">#5A87A8</color>
    <color name="brand_primary_dark">#1E3D52</color>

    <color name="brand_secondary">#64B5A0</color>
    <color name="brand_secondary_light">#95E7D2</color>
    <color name="brand_secondary_dark">#358472</color>

    <color name="brand_accent">#FFB347</color>
    <color name="brand_accent_light">#FFE599</color>
    <color name="brand_accent_dark">#CC8A1A</color>

    <color name="brand_background">#FAFAF8</color>
    <color name="brand_background_dark">#1A1A1A</color>

    <color name="brand_text">#1C1C1E</color>
    <color name="brand_text_light">#E5E5E5</color>

    <!-- Semantic Colors -->
    <color name="success">#4CAF50</color>
    <color name="warning">#FFC107</color>
    <color name="error">#E53935</color>
    <color name="info">#2196F3</color>

    <!-- Reader Theme Colors -->
    <color name="reader_light_bg">#FFFFFF</color>
    <color name="reader_light_text">#000000</color>
    <color name="reader_dark_bg">#1A1A1A</color>
    <color name="reader_dark_text">#E0E0E0</color>
    <color name="reader_sepia_bg">#F5E6D3</color>
    <color name="reader_sepia_text">#5D4037</color>
</resources>
```

---

## 8. 动效规范

### 8.1 动画时长

| 动画类型 | 时长 | 曲线 |
|----------|------|------|
| 翻页动画 | 300ms | EaseInOut |
| 工具栏显隐 | 250ms | EaseOut |
| AI 面板弹出 | 300ms | Spring (damping 0.8) |
| 选择菜单 | 200ms | EaseOut |
| 页面切换 | 300ms | FastOutSlowIn |

### 8.2 Compose 动画实现

```kotlin
// ui/animation/ReadmigoAnimations.kt

package com.readmigo.app.ui.animation

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.IntOffset

object ReadmigoAnimations {
    // AI 面板弹出动画
    val aiPanelEnterTransition: EnterTransition = slideInVertically(
        initialOffsetY = { it },
        animationSpec = spring(
            dampingRatio = 0.8f,
            stiffness = Spring.StiffnessMedium
        )
    ) + fadeIn(
        animationSpec = tween(300)
    )

    val aiPanelExitTransition: ExitTransition = slideOutVertically(
        targetOffsetY = { it },
        animationSpec = tween(250)
    ) + fadeOut(
        animationSpec = tween(200)
    )

    // 工具栏动画
    val toolbarEnterTransition: EnterTransition = fadeIn(
        animationSpec = tween(250)
    )

    val toolbarExitTransition: ExitTransition = fadeOut(
        animationSpec = tween(250)
    )

    // 页面切换
    val pageEnterTransition: EnterTransition = slideInHorizontally(
        initialOffsetX = { it },
        animationSpec = tween(300, easing = FastOutSlowInEasing)
    )

    val pageExitTransition: ExitTransition = slideOutHorizontally(
        targetOffsetX = { -it },
        animationSpec = tween(300, easing = FastOutSlowInEasing)
    )
}
```

---

## 9. 触觉反馈

```kotlin
// ui/haptics/HapticFeedback.kt

package com.readmigo.app.ui.haptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.HapticFeedbackConstants
import android.view.View

object ReadmigoHaptics {

    // 翻页成功
    fun pageFlip(view: View) {
        view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
    }

    // 保存成功
    fun success(context: Context) {
        vibrate(context, 50)
    }

    // 错误
    fun error(context: Context) {
        vibrate(context, longArrayOf(0, 50, 50, 50))
    }

    // 选择文字
    fun selection(view: View) {
        view.performHapticFeedback(HapticFeedbackConstants.TEXT_HANDLE_MOVE)
    }

    // 长按
    fun longPress(view: View) {
        view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
    }

    private fun vibrate(context: Context, duration: Long) {
        val vibrator = getVibrator(context)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(
                VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
            )
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(duration)
        }
    }

    private fun vibrate(context: Context, pattern: LongArray) {
        val vibrator = getVibrator(context)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(
                VibrationEffect.createWaveform(pattern, -1)
            )
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(pattern, -1)
        }
    }

    private fun getVibrator(context: Context): Vibrator? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }
}
```

---

## 10. 设计资源转换

### 10.1 从 SVG 转换图标

使用 Android Studio 的 Vector Asset 工具：

1. 右键 `res/drawable` → New → Vector Asset
2. 选择 Local file (SVG)
3. 导入 `design/assets/icons/` 中的 SVG 文件
4. 调整尺寸和颜色

### 10.2 资源映射

| 源文件 | 目标位置 |
|--------|----------|
| `design/assets/icons/logo-mark.svg` | `res/drawable/ic_logo_mark.xml` |
| `design/assets/icons/logo-horizontal.svg` | `res/drawable/ic_logo_horizontal.xml` |
| `design/assets/icons/splash-background.svg` | `res/drawable/splash_background.xml` |
| `design/assets/icons/onboarding/*.svg` | `res/drawable/ic_onboarding_*.xml` |

---

## 11. Play Store 素材规范

| 素材类型 | 尺寸 | 格式 | 说明 |
|----------|------|------|------|
| 高分辨率图标 | 512×512 | PNG | Play Store 图标 |
| 功能图 | 1024×500 | PNG/JPG | 商店顶部横幅 |
| 手机截图 | 1080×1920 - 1080×2340 | PNG/JPG | 最少2张，最多8张 |
| 7英寸平板截图 | 1200×1920 | PNG/JPG | 可选 |
| 10英寸平板截图 | 1920×1200 | PNG/JPG | 可选 |
| 预览视频 | 1080p | MP4 | 可选，30-120秒 |

---

## 12. 与 iOS 对齐检查清单

| 项目 | iOS | Android | 状态 |
|------|-----|---------|------|
| 品牌色 | ✅ 统一 | ✅ Material 3 映射 | ✅ |
| 深色模式 | ✅ 系统跟随 | ✅ 系统跟随 | ✅ |
| 阅读器主题 | Light/Dark/Sepia | Light/Dark/Sepia | ✅ |
| 字体系统 | SF Pro | Roboto | ✅ 对应 |
| 阅读字体 | Georgia/Palatino/Charter | NotoSerif/Literata/RobotoSerif | ✅ |
| App Icon | SF Symbols 风格 | Adaptive Icon | ✅ |
| Splash Screen | Launch Storyboard | Splash Screen API | ✅ |
| 动画曲线 | iOS 标准 | Material Motion | ✅ 对应 |
| 触觉反馈 | Haptic Engine | Vibrator | ✅ 对应 |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-12-26 | 1.0.0 | 初始版本 |
