# Readmigo Android Client 实现方案

## 1. 概述

### 1.1 目标
开发功能与 iOS 客户端 **100% 对齐** 的 Android 原生应用，确保用户在两个平台获得一致的 AI 原生阅读体验。

### 1.2 产品定位
AI 原生英语原版书阅读学习应用，核心理念："Read any book. AI has your back."

### 1.3 开发周期
预计 **6-8 周**（基于路线图 Phase 3B）

---

## 2. 技术选型

### 2.1 开发环境
| 项目 | 配置 |
|------|------|
| **语言** | Kotlin 1.9+ |
| **UI 框架** | Jetpack Compose (100%) |
| **最低 SDK** | Android 8.0 (API 26) |
| **目标 SDK** | Android 14 (API 34) |
| **IDE** | Android Studio Hedgehog+ |
| **构建工具** | Gradle 8.x + Kotlin DSL |

### 2.2 架构模式
```
┌─────────────────────────────────────────────────────────────────┐
│                    MVVM + Clean Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   UI Layer  │ ←→ │  ViewModel  │ ←→ │  Use Cases  │          │
│  │  (Compose)  │    │   (State)   │    │  (Business) │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                              ↓                    │
│                      ┌─────────────────────────────────┐         │
│                      │       Repository Layer          │         │
│                      └─────────────────────────────────┘         │
│                           ↓                  ↓                    │
│            ┌─────────────────┐    ┌─────────────────┐            │
│            │   Remote Data   │    │   Local Data    │            │
│            │   (Retrofit)    │    │   (Room/Proto)  │            │
│            └─────────────────┘    └─────────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 核心依赖库

#### 2.3.1 Jetpack 组件
```kotlin
// build.gradle.kts (libs.versions.toml 管理版本)
dependencies {
    // Compose BOM
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    // Room (本地数据库)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // DataStore (键值存储)
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // WorkManager (后台任务)
    implementation("androidx.work:work-runtime-ktx:2.9.0")
}
```

#### 2.3.2 网络与序列化
```kotlin
dependencies {
    // Retrofit + OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")

    // SSE 流式响应 (AI)
    implementation("com.squareup.okhttp3:okhttp-sse:4.12.0")
}
```

#### 2.3.3 图片加载
```kotlin
dependencies {
    // Coil (Compose 优化)
    implementation("io.coil-kt:coil-compose:2.5.0")
}
```

#### 2.3.4 依赖注入
```kotlin
dependencies {
    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    ksp("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
}
```

#### 2.3.5 EPUB 阅读器
```kotlin
dependencies {
    // Foliate-Android (EPUB 渲染)
    implementation("com.github.nicebooks:foliate-android:0.5.0")
    // 或自建 WebView 方案
}
```

#### 2.3.6 音频播放
```kotlin
dependencies {
    // Media3 (有声书播放)
    implementation("androidx.media3:media3-exoplayer:1.2.1")
    implementation("androidx.media3:media3-ui:1.2.1")
    implementation("androidx.media3:media3-session:1.2.1")
}
```

#### 2.3.7 认证与支付
```kotlin
dependencies {
    // Google Sign-In
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    // Credential Manager (新API)
    implementation("androidx.credentials:credentials:1.3.0-alpha01")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0-alpha01")

    // Google Play Billing
    implementation("com.android.billingclient:billing-ktx:6.1.0")
}
```

---

## 3. iOS 功能对齐清单

### 3.1 模块对照表

| iOS 模块 | Android 对应 | 页面数 | 优先级 | 实现难度 |
|----------|-------------|--------|--------|----------|
| **Auth** | auth | 3 | P0 | ⭐⭐ |
| **Onboarding** | onboarding | 6 | P0 | ⭐⭐ |
| **Library** | library | 5 | P0 | ⭐⭐ |
| **Reader** | reader | 9 | P0 | ⭐⭐⭐⭐⭐ |
| **AI** | ai | 77 | P0 | ⭐⭐⭐⭐ |
| **Learning** | learning | 3 | P0 | ⭐⭐⭐ |
| **Audiobook** | audiobook | 5 | P1 | ⭐⭐⭐⭐ |
| **Agora** | agora | 3 | P1 | ⭐⭐ |
| **Authors** | authors | 5 | P1 | ⭐⭐⭐ |
| **Quotes** | quotes | 3 | P1 | ⭐⭐ |
| **Postcards** | postcards | 3 | P1 | ⭐⭐ |
| **Badges** | badges | 2 | P2 | ⭐⭐ |
| **Settings** | settings | 4 | P2 | ⭐⭐ |
| **Subscriptions** | subscriptions | 2 | P1 | ⭐⭐⭐ |
| **Search** | search | 2 | P1 | ⭐⭐ |
| **Offline** | offline | 2 | P2 | ⭐⭐⭐ |
| **Analytics** | analytics | 3 | P2 | ⭐⭐ |
| **Bookmarks** | bookmarks | 2 | P2 | ⭐⭐ |

**总计: 119+ 页面**

### 3.2 核心功能对齐清单

#### 3.2.1 阅读器功能 (Reader) ⭐⭐⭐ 最核心

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| WKWebView EPUB 渲染 | WebView + 自定义 Bridge | ⏳ |
| 文本选择与高亮 | WebView JavaScript Interface | ⏳ |
| 翻页动画 (横向/纵向) | ViewPager2 + Compose Animation | ⏳ |
| 阅读进度同步 | CFI 标准 + API 同步 | ⏳ |
| 阅读时长追踪 (静默) | WorkManager + Foreground Service | ⏳ |
| 主题切换 (亮/暗/护眼) | Compose Theme + WebView CSS 注入 | ⏳ |
| 字体/字号/行距调整 | JavaScript CSS 变量控制 | ⏳ |
| 章节目录 (TOC) | BottomSheet + LazyColumn | ⏳ |
| 书签管理 | Room 数据库 + UI | ⏳ |
| 人物关系图 | Compose Canvas + Graph 布局 | ⏳ |
| 故事时间线 | LazyColumn Timeline UI | ⏳ |
| TTS 朗读 | Android TTS + Media3 | ⏳ |
| 沉浸式阅读模式 | 全屏 + 手势导航隐藏 | ⏳ |
| 专注模式 | Timer + 勿扰模式集成 | ⏳ |

#### 3.2.2 AI 助手功能 ⭐⭐⭐ 核心

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| 流式文本输出 | SSE + StateFlow | ⏳ |
| 选词解释 (上下文感知) | API 调用 + BottomSheet | ⏳ |
| 句子简化 | API 调用 + 对比显示 | ⏳ |
| 段落翻译 | API 调用 + 并行显示 | ⏳ |
| 内容问答 | 对话式 UI + 上下文管理 | ⏳ |
| 语法解析 | API + 结构化展示 | ⏳ |
| 人物分析 | API + 人物卡片 UI | ⏳ |
| 情节分析 | API + 时间线 UI | ⏳ |
| 章节摘要 (自动) | 后台触发 + 通知 | ⏳ |
| AI 主动干预 (困难检测) | 阅读行为分析 + 弹窗 | ⏳ |
| AI 缓存 | Room + LRU 策略 | ⏳ |
| 77 个 AI 页面 | 模块化 Compose 组件 | ⏳ |

#### 3.2.3 有声书功能

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| Whispersync 文字同步 | Media3 + 时间戳映射 | ⏳ |
| 播放速度调节 (0.5x-2.0x) | ExoPlayer setSpeed() | ⏳ |
| 后台播放 | MediaSessionService | ⏳ |
| 锁屏控制 | MediaSession + Notification | ⏳ |
| 双语模式 | 并行文本 + 同步高亮 | ⏳ |
| 跟读模式 | SpeechRecognizer + 评分 | ⏳ |
| 学习模式 | 词汇预览 + 重点标记 | ⏳ |
| CarPlay 支持 | Android Auto 集成 | ⏳ |

#### 3.2.4 生词本与复习

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| 自动添加生词 | 查词后自动入库 | ⏳ |
| SM-2 间隔重复算法 | Kotlin 实现 + Room 调度 | ⏳ |
| 复习卡片 UI | Compose Card + 手势 | ⏳ |
| 词汇掌握度追踪 | 多维度评分系统 | ⏳ |
| 复习提醒推送 | WorkManager + FCM | ⏳ |
| 遗忘曲线可视化 | Compose Canvas 图表 | ⏳ |

#### 3.2.5 认证与订阅

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| Sign in with Apple | Credential Manager | ⏳ |
| Google Sign-In | Play Services Auth | ⏳ |
| JWT Token 管理 | DataStore + 自动刷新 | ⏳ |
| App Store IAP | Google Play Billing | ⏳ |
| 订阅状态同步 | BillingClient + API 校验 | ⏳ |
| 付费墙 UI | Compose Paywall 组件 | ⏳ |

#### 3.2.6 离线功能

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| 书籍离线下载 | DownloadManager + Room | ⏳ |
| 离线阅读 | 本地 EPUB 缓存 | ⏳ |
| 离线 AI 缓存 | 预缓存常用响应 | ⏳ |
| 离线数据同步 | WorkManager 队列 | ⏳ |

#### 3.2.7 社交功能

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| Agora 社区动态 | Feed UI + API | ⏳ |
| 发帖/评论 | 编辑器 + 上传 | ⏳ |
| 作者对话 (文字/语音/视频) | WebRTC 或 Agora SDK | ⏳ |
| 金句收藏 | Room + 分享 | ⏳ |
| 明信片生成 | Canvas 绘制 + 分享 | ⏳ |

#### 3.2.8 其他功能

| iOS 功能 | Android 实现方案 | 状态 |
|----------|-----------------|------|
| 勋章系统 | 数据驱动 + 动画展示 | ⏳ |
| 年度报告 | 多页报告 + 分享 | ⏳ |
| Dark Mode | Material 3 动态主题 | ⏳ |
| 多语言 | strings.xml + 动态切换 | ⏳ |
| 强制更新 | Play Core Library | ⏳ |
| 日志收集 | Timber + Sentry | ⏳ |
| 崩溃追踪 | Firebase Crashlytics | ⏳ |

---

## 4. 项目结构

```
android/Readmigo/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/com/readmigo/app/
│   │   │   │   ├── ReadmigoApp.kt              # Application 入口
│   │   │   │   ├── MainActivity.kt             # 主 Activity
│   │   │   │   │
│   │   │   │   ├── core/                       # 核心基础设施
│   │   │   │   │   ├── di/                     # Hilt 依赖注入
│   │   │   │   │   │   ├── NetworkModule.kt
│   │   │   │   │   │   ├── DatabaseModule.kt
│   │   │   │   │   │   └── RepositoryModule.kt
│   │   │   │   │   │
│   │   │   │   │   ├── network/                # 网络层
│   │   │   │   │   │   ├── ApiClient.kt
│   │   │   │   │   │   ├── ApiEndpoints.kt
│   │   │   │   │   │   ├── AuthInterceptor.kt
│   │   │   │   │   │   └── SSEService.kt       # AI 流式响应
│   │   │   │   │   │
│   │   │   │   │   ├── database/               # 本地数据库
│   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   ├── dao/
│   │   │   │   │   │   │   ├── BookDao.kt
│   │   │   │   │   │   │   ├── VocabularyDao.kt
│   │   │   │   │   │   │   ├── ReadingProgressDao.kt
│   │   │   │   │   │   │   └── AICacheDao.kt
│   │   │   │   │   │   └── entities/
│   │   │   │   │   │       ├── BookEntity.kt
│   │   │   │   │   │       ├── VocabularyEntity.kt
│   │   │   │   │   │       └── ...
│   │   │   │   │   │
│   │   │   │   │   ├── datastore/              # 键值存储
│   │   │   │   │   │   ├── UserPreferences.kt
│   │   │   │   │   │   └── ReaderSettings.kt
│   │   │   │   │   │
│   │   │   │   │   ├── service/                # 后台服务
│   │   │   │   │   │   ├── ReadingTimeTracker.kt
│   │   │   │   │   │   ├── AudiobookService.kt
│   │   │   │   │   │   └── SyncWorker.kt
│   │   │   │   │   │
│   │   │   │   │   └── util/                   # 工具类
│   │   │   │   │       ├── Extensions.kt
│   │   │   │   │       └── SafeJson.kt
│   │   │   │   │
│   │   │   │   ├── domain/                     # 领域层
│   │   │   │   │   ├── model/                  # 领域模型
│   │   │   │   │   │   ├── Book.kt
│   │   │   │   │   │   ├── User.kt
│   │   │   │   │   │   ├── Vocabulary.kt
│   │   │   │   │   │   ├── Author.kt
│   │   │   │   │   │   ├── Quote.kt
│   │   │   │   │   │   ├── Postcard.kt
│   │   │   │   │   │   ├── Badge.kt
│   │   │   │   │   │   ├── Audiobook.kt
│   │   │   │   │   │   ├── AgoraPost.kt
│   │   │   │   │   │   ├── AuthorChat.kt
│   │   │   │   │   │   ├── Reading.kt
│   │   │   │   │   │   ├── Subscription.kt
│   │   │   │   │   │   ├── Timeline.kt
│   │   │   │   │   │   ├── Character.kt
│   │   │   │   │   │   ├── AI.kt
│   │   │   │   │   │   └── Analytics.kt
│   │   │   │   │   │
│   │   │   │   │   ├── repository/             # Repository 接口
│   │   │   │   │   │   ├── BookRepository.kt
│   │   │   │   │   │   ├── UserRepository.kt
│   │   │   │   │   │   ├── AIRepository.kt
│   │   │   │   │   │   └── ...
│   │   │   │   │   │
│   │   │   │   │   └── usecase/                # 用例
│   │   │   │   │       ├── GetBooksUseCase.kt
│   │   │   │   │       ├── ExplainWordUseCase.kt
│   │   │   │   │       └── ...
│   │   │   │   │
│   │   │   │   ├── data/                       # 数据层
│   │   │   │   │   ├── repository/             # Repository 实现
│   │   │   │   │   │   ├── BookRepositoryImpl.kt
│   │   │   │   │   │   ├── UserRepositoryImpl.kt
│   │   │   │   │   │   └── ...
│   │   │   │   │   │
│   │   │   │   │   ├── remote/                 # 远程数据源
│   │   │   │   │   │   ├── dto/                # DTO
│   │   │   │   │   │   └── api/                # API 接口
│   │   │   │   │   │
│   │   │   │   │   └── local/                  # 本地数据源
│   │   │   │   │       └── mapper/             # Entity 映射
│   │   │   │   │
│   │   │   │   ├── ui/                         # UI 层
│   │   │   │   │   ├── theme/                  # 主题系统
│   │   │   │   │   │   ├── Theme.kt
│   │   │   │   │   │   ├── Color.kt
│   │   │   │   │   │   ├── Type.kt
│   │   │   │   │   │   └── BrandColors.kt
│   │   │   │   │   │
│   │   │   │   │   ├── components/             # 通用组件
│   │   │   │   │   │   ├── BookCover.kt
│   │   │   │   │   │   ├── LoadingIndicator.kt
│   │   │   │   │   │   ├── ErrorView.kt
│   │   │   │   │   │   ├── TypewriterText.kt
│   │   │   │   │   │   ├── FlowLayout.kt
│   │   │   │   │   │   └── ElegantRefresh.kt
│   │   │   │   │   │
│   │   │   │   │   └── navigation/             # 导航
│   │   │   │   │       ├── NavGraph.kt
│   │   │   │   │       └── Routes.kt
│   │   │   │   │
│   │   │   │   └── features/                   # 功能模块 (按业务划分)
│   │   │   │       │
│   │   │   │       ├── auth/                   # 认证模块
│   │   │   │       │   ├── AuthScreen.kt
│   │   │   │       │   ├── AuthViewModel.kt
│   │   │   │       │   ├── LoginPromptScreen.kt
│   │   │   │       │   └── AuthManager.kt
│   │   │   │       │
│   │   │   │       ├── onboarding/             # 新用户引导
│   │   │   │       │   ├── OnboardingScreen.kt
│   │   │   │       │   ├── WelcomeStepScreen.kt
│   │   │   │       │   ├── LevelAssessmentScreen.kt
│   │   │   │       │   ├── GoalSettingScreen.kt
│   │   │   │       │   ├── InterestsScreen.kt
│   │   │   │       │   └── OnboardingViewModel.kt
│   │   │   │       │
│   │   │   │       ├── library/                # 书架模块
│   │   │   │       │   ├── LibraryScreen.kt
│   │   │   │       │   ├── LibraryViewModel.kt
│   │   │   │       │   ├── BookDetailScreen.kt
│   │   │   │       │   ├── BookDetailViewModel.kt
│   │   │   │       │   ├── BrowseBooksScreen.kt
│   │   │   │       │   ├── DiscoverScreen.kt
│   │   │   │       │   └── components/
│   │   │   │       │       ├── BookCoverView.kt
│   │   │   │       │       ├── FeaturedBannerCard.kt
│   │   │   │       │       ├── HeroBookCard.kt
│   │   │   │       │       ├── StandardBookCard.kt
│   │   │   │       │       └── RankedBookCard.kt
│   │   │   │       │
│   │   │   │       ├── reader/                 # 阅读器模块 ⭐⭐⭐
│   │   │   │       │   ├── ReaderScreen.kt
│   │   │   │       │   ├── ReaderViewModel.kt
│   │   │   │       │   ├── ReaderWebView.kt        # WebView 阅读器
│   │   │   │       │   ├── ReaderBridge.kt         # JS Bridge
│   │   │   │       │   ├── ReaderSettingsSheet.kt
│   │   │   │       │   ├── EnhancedReaderScreen.kt
│   │   │   │       │   ├── UltimateReaderScreen.kt
│   │   │   │       │   ├── CharacterMapScreen.kt
│   │   │   │       │   ├── StoryTimelineScreen.kt
│   │   │   │       │   ├── TTSControlPanel.kt
│   │   │   │       │   └── components/
│   │   │   │       │       ├── PageTurnAnimations.kt
│   │   │   │       │       ├── ReadingStatsOverlay.kt
│   │   │   │       │       ├── ReadingProgressBar.kt
│   │   │   │       │       ├── ImmersiveReaderMode.kt
│   │   │   │       │       ├── FocusModeView.kt
│   │   │   │       │       └── TextSelectionMenu.kt
│   │   │   │       │
│   │   │   │       ├── ai/                     # AI 交互模块 ⭐⭐⭐
│   │   │   │       │   ├── AIService.kt
│   │   │   │       │   ├── AIStreamingService.kt
│   │   │   │       │   ├── AICacheService.kt
│   │   │   │       │   ├── AIInteractionPanel.kt
│   │   │   │       │   ├── viewmodels/
│   │   │   │       │   │   ├── AIAssistantViewModel.kt
│   │   │   │       │   │   ├── AIBookAnalysisViewModel.kt
│   │   │   │       │   │   ├── AIReaderViewModel.kt
│   │   │   │       │   │   ├── AIProfileViewModel.kt
│   │   │   │       │   │   └── AIVocabularyViewModel.kt
│   │   │   │       │   ├── components/
│   │   │   │       │   │   ├── AIStreamingText.kt
│   │   │   │       │   │   ├── AILoadingView.kt
│   │   │   │       │   │   ├── AIErrorView.kt
│   │   │   │       │   │   ├── AIActionBar.kt
│   │   │   │       │   │   └── AICoachAvatar.kt
│   │   │   │       │   └── screens/                 # 77 个 AI 页面
│   │   │   │       │       ├── bookdetail/          # 书籍详情 AI (12)
│   │   │   │       │       │   ├── AIAuthorScreen.kt
│   │   │   │       │       │   ├── AIBookSummaryScreen.kt
│   │   │   │       │       │   ├── AICoverAnalysisScreen.kt
│   │   │   │       │       │   ├── AIBookQAScreen.kt
│   │   │   │       │       │   ├── AISimilarBooksScreen.kt
│   │   │   │       │       │   ├── AIDifficultyDetailScreen.kt
│   │   │   │       │       │   ├── AIReadingGuideScreen.kt
│   │   │   │       │       │   ├── AIKeyVocabPreviewScreen.kt
│   │   │   │       │       │   ├── AIThemeAnalysisScreen.kt
│   │   │   │       │       │   ├── AIHistoricalContextScreen.kt
│   │   │   │       │       │   ├── AIReadingTimeEstimateScreen.kt
│   │   │   │       │       │   └── AIContentWarningScreen.kt
│   │   │   │       │       ├── reader/              # 阅读器 AI (20)
│   │   │   │       │       │   ├── AIWordExplainSheet.kt
│   │   │   │       │       │   ├── AISentenceSimplifySheet.kt
│   │   │   │       │       │   ├── AIParagraphTranslateSheet.kt
│   │   │   │       │       │   ├── AIParagraphSummarySheet.kt
│   │   │   │       │       │   ├── AIGrammarExplainSheet.kt
│   │   │   │       │       │   ├── AIContextQASheet.kt
│   │   │   │       │       │   ├── AIChapterSummarySheet.kt
│   │   │   │       │       │   ├── AICharacterAnalysisSheet.kt
│   │   │   │       │       │   ├── AIPlotAnalysisSheet.kt
│   │   │   │       │       │   ├── AIReadingCoachSheet.kt
│   │   │   │       │       │   ├── AIComprehensionCheckSheet.kt
│   │   │   │       │       │   ├── AICulturalNoteSheet.kt
│   │   │   │       │       │   ├── AIWritingStyleSheet.kt
│   │   │   │       │       │   ├── AIEmotionAnalysisSheet.kt
│   │   │   │       │       │   └── ...
│   │   │   │       │       ├── vocabulary/          # 词汇 AI (10)
│   │   │   │       │       ├── profile/             # 个人中心 AI (15)
│   │   │   │       │       ├── discover/            # 发现 AI (8)
│   │   │   │       │       ├── audiobook/           # 有声书 AI (5)
│   │   │   │       │       ├── social/              # 社交 AI (4)
│   │   │   │       │       └── settings/            # 设置 AI (3)
│   │   │   │       │
│   │   │   │       ├── learning/               # 学习模块 (生词本+复习)
│   │   │   │       │   ├── LearningScreen.kt
│   │   │   │       │   ├── VocabularyScreen.kt
│   │   │   │       │   ├── VocabularyViewModel.kt
│   │   │   │       │   ├── ReviewSessionScreen.kt
│   │   │   │       │   └── VocabularyManager.kt
│   │   │   │       │
│   │   │   │       ├── audiobook/              # 有声书模块
│   │   │   │       │   ├── AudiobookScreen.kt
│   │   │   │       │   ├── AudiobookViewModel.kt
│   │   │   │       │   ├── AudioPlayerService.kt
│   │   │   │       │   ├── WhispersyncManager.kt
│   │   │   │       │   ├── BilingualModeScreen.kt
│   │   │   │       │   ├── FollowAlongScreen.kt
│   │   │   │       │   └── StudyModeScreen.kt
│   │   │   │       │
│   │   │   │       ├── agora/                  # 城邦社区模块
│   │   │   │       │   ├── AgoraScreen.kt
│   │   │   │       │   ├── AgoraViewModel.kt
│   │   │   │       │   ├── CreatePostScreen.kt
│   │   │   │       │   └── components/
│   │   │   │       │       ├── AgoraPostCard.kt
│   │   │   │       │       └── AuthorAvatarView.kt
│   │   │   │       │
│   │   │   │       ├── authors/                # 作者模块
│   │   │   │       │   ├── AuthorProfileScreen.kt
│   │   │   │       │   ├── AuthorChatScreen.kt
│   │   │   │       │   ├── VoiceChatScreen.kt
│   │   │   │       │   ├── VideoChatScreen.kt
│   │   │   │       │   └── AuthorManager.kt
│   │   │   │       │
│   │   │   │       ├── quotes/                 # 金句模块
│   │   │   │       │   ├── QuotesScreen.kt
│   │   │   │       │   ├── QuoteCardView.kt
│   │   │   │       │   ├── QuoteDetailScreen.kt
│   │   │   │       │   └── QuotesManager.kt
│   │   │   │       │
│   │   │   │       ├── postcards/              # 明信片模块
│   │   │   │       │   ├── PostcardEditorScreen.kt
│   │   │   │       │   ├── PostcardPreviewScreen.kt
│   │   │   │       │   ├── TemplatePickerScreen.kt
│   │   │   │       │   └── PostcardsManager.kt
│   │   │   │       │
│   │   │   │       ├── badges/                 # 勋章模块
│   │   │   │       │   ├── BadgesScreen.kt
│   │   │   │       │   ├── BadgeDetailScreen.kt
│   │   │   │       │   └── BadgesManager.kt
│   │   │   │       │
│   │   │   │       ├── booklists/              # 榜单模块
│   │   │   │       │   ├── BookListsScreen.kt
│   │   │   │       │   ├── BookListDetailScreen.kt
│   │   │   │       │   ├── CategoriesScreen.kt
│   │   │   │       │   └── BookListsManager.kt
│   │   │   │       │
│   │   │   │       ├── search/                 # 搜索模块
│   │   │   │       │   ├── SearchScreen.kt
│   │   │   │       │   ├── SearchViewModel.kt
│   │   │   │       │   └── SearchHistoryManager.kt
│   │   │   │       │
│   │   │   │       ├── profile/                # 个人中心模块
│   │   │   │       │   ├── MeScreen.kt
│   │   │   │       │   ├── ProfileScreen.kt
│   │   │   │       │   └── AccountSettingsScreen.kt
│   │   │   │       │
│   │   │   │       ├── settings/               # 设置模块
│   │   │   │       │   ├── SettingsScreen.kt
│   │   │   │       │   └── LanguageSettingsScreen.kt
│   │   │   │       │
│   │   │   │       ├── subscriptions/          # 订阅模块
│   │   │   │       │   ├── SubscriptionScreen.kt
│   │   │   │       │   ├── PaywallScreen.kt
│   │   │   │       │   ├── RestorePurchasesScreen.kt
│   │   │   │       │   └── BillingManager.kt
│   │   │   │       │
│   │   │   │       ├── offline/                # 离线模块
│   │   │   │       │   ├── OfflineDownloadsScreen.kt
│   │   │   │       │   ├── OfflineSettingsScreen.kt
│   │   │   │       │   └── OfflineManager.kt
│   │   │   │       │
│   │   │   │       ├── analytics/              # 分析统计模块
│   │   │   │       │   ├── StatsScreen.kt
│   │   │   │       │   ├── ReadingTrendView.kt
│   │   │   │       │   ├── VocabularyProgressView.kt
│   │   │   │       │   └── AnalyticsManager.kt
│   │   │   │       │
│   │   │   │       ├── bookmarks/              # 书签模块
│   │   │   │       │   ├── BookmarksScreen.kt
│   │   │   │       │   └── BookmarkManager.kt
│   │   │   │       │
│   │   │   │       ├── annualreport/           # 年度报告模块
│   │   │   │       │   ├── AnnualReportScreen.kt
│   │   │   │       │   └── ReportPages/
│   │   │   │       │
│   │   │   │       ├── messaging/              # 消息模块
│   │   │   │       │   ├── MessagesScreen.kt
│   │   │   │       │   └── NotificationManager.kt
│   │   │   │       │
│   │   │   │       ├── version/                # 版本更新模块
│   │   │   │       │   ├── ForceUpdateScreen.kt
│   │   │   │       │   └── VersionManager.kt
│   │   │   │       │
│   │   │   │       └── about/                  # 关于模块
│   │   │   │           ├── AboutScreen.kt
│   │   │   │           ├── ChangelogScreen.kt
│   │   │   │           └── LicensesScreen.kt
│   │   │   │
│   │   │   └── res/
│   │   │       ├── values/
│   │   │       │   ├── strings.xml
│   │   │       │   ├── colors.xml
│   │   │       │   └── themes.xml
│   │   │       ├── values-zh/
│   │   │       │   └── strings.xml
│   │   │       └── ...
│   │   │
│   │   └── androidTest/
│   │
│   └── build.gradle.kts
│
├── gradle/
│   └── libs.versions.toml              # 版本目录
│
├── settings.gradle.kts
└── build.gradle.kts
```

---

## 5. 核心模块设计

### 5.1 阅读器引擎 (最核心)

#### 5.1.1 WebView EPUB 渲染方案

```kotlin
// ReaderWebView.kt
@Composable
fun ReaderWebView(
    epubContent: String,
    viewModel: ReaderViewModel,
    onTextSelected: (SelectedText) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                }
                addJavascriptInterface(
                    ReaderBridge(viewModel, onTextSelected),
                    "AndroidBridge"
                )
                loadDataWithBaseURL(
                    "file:///android_asset/reader/",
                    epubContent,
                    "text/html",
                    "UTF-8",
                    null
                )
            }
        },
        modifier = modifier
    )
}

// ReaderBridge.kt - JavaScript 桥接
class ReaderBridge(
    private val viewModel: ReaderViewModel,
    private val onTextSelected: (SelectedText) -> Unit
) {
    @JavascriptInterface
    fun onTextSelected(json: String) {
        val selectedText = Json.decodeFromString<SelectedText>(json)
        onTextSelected(selectedText)
        // 静默记录
        viewModel.trackTextSelection(selectedText)
    }

    @JavascriptInterface
    fun onPageChanged(cfi: String, progress: Float) {
        viewModel.updateProgress(cfi, progress)
    }

    @JavascriptInterface
    fun onChapterChanged(chapterId: String) {
        viewModel.onChapterChanged(chapterId)
    }
}

// SelectedText.kt
@Serializable
data class SelectedText(
    val text: String,
    val sentence: String?,
    val paragraph: String?,
    val cfi: String,
    val chapterId: String
)
```

#### 5.1.2 阅读时长追踪 (静默)

```kotlin
// ReadingTimeTracker.kt
class ReadingTimeTracker @Inject constructor(
    private val repository: ReadingRepository
) {
    private var sessionStartTime: Instant? = null
    private var activeReadingTime: Duration = Duration.ZERO
    private var lastActiveTime: Instant? = null
    private val idleThreshold = 30.seconds

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var idleCheckJob: Job? = null

    fun startTracking(bookId: String, chapterId: String) {
        sessionStartTime = Clock.System.now()
        lastActiveTime = sessionStartTime
        startIdleCheck()
    }

    fun stopTracking(): ReadingSessionData {
        idleCheckJob?.cancel()
        val data = ReadingSessionData(
            bookId = currentBookId,
            chapterId = currentChapterId,
            duration = activeReadingTime,
            startTime = sessionStartTime,
            endTime = Clock.System.now()
        )
        // 异步上报
        scope.launch { repository.saveSession(data) }
        return data
    }

    fun recordActivity() {
        val now = Clock.System.now()
        lastActiveTime?.let { last ->
            val gap = now - last
            if (gap <= idleThreshold) {
                activeReadingTime += gap
            }
        }
        lastActiveTime = now
    }

    private fun startIdleCheck() {
        idleCheckJob = scope.launch {
            while (isActive) {
                delay(5.seconds)
                // 检查是否空闲
            }
        }
    }
}
```

### 5.2 AI 流式响应

```kotlin
// AIStreamingService.kt
class AIStreamingService @Inject constructor(
    private val okHttpClient: OkHttpClient
) {
    fun streamExplain(
        word: String,
        context: String
    ): Flow<AIStreamChunk> = callbackFlow {
        val request = Request.Builder()
            .url("${BASE_URL}/ai/explain/stream")
            .post(buildRequestBody(word, context))
            .build()

        val sseListener = object : EventSourceListener() {
            override fun onEvent(
                eventSource: EventSource,
                id: String?,
                type: String?,
                data: String
            ) {
                val chunk = Json.decodeFromString<AIStreamChunk>(data)
                trySend(chunk)
            }

            override fun onClosed(eventSource: EventSource) {
                close()
            }

            override fun onFailure(
                eventSource: EventSource,
                t: Throwable?,
                response: Response?
            ) {
                close(t ?: Exception("SSE failed"))
            }
        }

        val eventSource = EventSources.createFactory(okHttpClient)
            .newEventSource(request, sseListener)

        awaitClose { eventSource.cancel() }
    }
}

// AI ViewModel 使用示例
class AIAssistantViewModel @HiltViewModel constructor(
    private val streamingService: AIStreamingService,
    private val vocabularyRepository: VocabularyRepository
) : ViewModel() {

    private val _streamingText = MutableStateFlow("")
    val streamingText: StateFlow<String> = _streamingText.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun explainWord(word: String, context: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _streamingText.value = ""

            streamingService.streamExplain(word, context)
                .catch { e -> /* 错误处理 */ }
                .collect { chunk ->
                    _streamingText.value += chunk.text
                }

            // 自动添加到生词本
            vocabularyRepository.autoAdd(
                word = word,
                context = context,
                explanation = _streamingText.value
            )

            _isLoading.value = false
        }
    }
}
```

### 5.3 有声书播放

```kotlin
// AudioPlayerService.kt
@AndroidEntryPoint
class AudioPlayerService : MediaSessionService() {

    private var mediaSession: MediaSession? = null
    private lateinit var player: ExoPlayer

    @Inject
    lateinit var whispersyncManager: WhispersyncManager

    override fun onCreate() {
        super.onCreate()
        player = ExoPlayer.Builder(this).build()

        player.addListener(object : Player.Listener {
            override fun onPositionDiscontinuity(
                oldPosition: Player.PositionInfo,
                newPosition: Player.PositionInfo,
                reason: Int
            ) {
                // 同步文字高亮
                whispersyncManager.updateHighlight(newPosition.positionMs)
            }
        })

        mediaSession = MediaSession.Builder(this, player).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = mediaSession

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
        }
        super.onDestroy()
    }
}

// WhispersyncManager.kt
class WhispersyncManager @Inject constructor() {

    private val _currentTextRange = MutableStateFlow<TextRange?>(null)
    val currentTextRange: StateFlow<TextRange?> = _currentTextRange.asStateFlow()

    private var syncData: AudioSyncData? = null

    fun loadSyncData(data: AudioSyncData) {
        syncData = data
    }

    fun updateHighlight(positionMs: Long) {
        syncData?.segments?.find { segment ->
            positionMs >= segment.audioStartMs && positionMs < segment.audioEndMs
        }?.let { segment ->
            _currentTextRange.value = segment.textRange
        }
    }

    fun seekToText(textPosition: String): Long? {
        return syncData?.segments?.find { it.textRange.contains(textPosition) }?.audioStartMs
    }
}
```

### 5.4 SM-2 复习算法

```kotlin
// SM2Algorithm.kt
object SM2Algorithm {

    data class ReviewResult(
        val nextReviewDate: Instant,
        val newInterval: Int,
        val newEaseFactor: Float,
        val newRepetition: Int
    )

    /**
     * 计算下次复习时间
     * @param quality 0-5 评分 (0=完全忘记, 5=轻松记住)
     * @param repetition 当前重复次数
     * @param easeFactor 难度因子 (默认2.5)
     * @param interval 当前间隔天数
     */
    fun calculate(
        quality: Int,
        repetition: Int,
        easeFactor: Float,
        interval: Int
    ): ReviewResult {
        val newEaseFactor = maxOf(
            1.3f,
            easeFactor + (0.1f - (5 - quality) * (0.08f + (5 - quality) * 0.02f))
        )

        return if (quality < 3) {
            // 忘记了，重新开始
            ReviewResult(
                nextReviewDate = Clock.System.now() + 1.days,
                newInterval = 1,
                newEaseFactor = newEaseFactor,
                newRepetition = 0
            )
        } else {
            val newInterval = when (repetition) {
                0 -> 1
                1 -> 6
                else -> (interval * newEaseFactor).toInt()
            }
            ReviewResult(
                nextReviewDate = Clock.System.now() + newInterval.days,
                newInterval = newInterval,
                newEaseFactor = newEaseFactor,
                newRepetition = repetition + 1
            )
        }
    }
}

// VocabularyManager.kt
class VocabularyManager @Inject constructor(
    private val vocabularyDao: VocabularyDao
) {
    suspend fun submitReview(wordId: String, quality: Int) {
        val word = vocabularyDao.getById(wordId) ?: return

        val result = SM2Algorithm.calculate(
            quality = quality,
            repetition = word.repetition,
            easeFactor = word.easeFactor,
            interval = word.interval
        )

        vocabularyDao.update(
            word.copy(
                nextReviewDate = result.nextReviewDate,
                interval = result.newInterval,
                easeFactor = result.newEaseFactor,
                repetition = result.newRepetition,
                lastReviewedAt = Clock.System.now()
            )
        )
    }

    suspend fun getWordsForReview(): List<VocabularyEntity> {
        val now = Clock.System.now()
        return vocabularyDao.getWordsNeedingReview(now)
    }
}
```

### 5.5 Google Play Billing

```kotlin
// BillingManager.kt
@Singleton
class BillingManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val subscriptionRepository: SubscriptionRepository
) {
    private val billingClient = BillingClient.newBuilder(context)
        .setListener { billingResult, purchases ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                purchases?.forEach { purchase ->
                    handlePurchase(purchase)
                }
            }
        }
        .enablePendingPurchases()
        .build()

    private val _subscriptionStatus = MutableStateFlow<SubscriptionStatus>(SubscriptionStatus.Free)
    val subscriptionStatus: StateFlow<SubscriptionStatus> = _subscriptionStatus.asStateFlow()

    suspend fun queryProducts(): List<ProductDetails> {
        return suspendCoroutine { cont ->
            val queryProductDetailsParams = QueryProductDetailsParams.newBuilder()
                .setProductList(
                    listOf(
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId("readmigo_pro_monthly")
                            .setProductType(BillingClient.ProductType.SUBS)
                            .build(),
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId("readmigo_premium_yearly")
                            .setProductType(BillingClient.ProductType.SUBS)
                            .build()
                    )
                )
                .build()

            billingClient.queryProductDetailsAsync(queryProductDetailsParams) { result, products ->
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    cont.resume(products)
                } else {
                    cont.resumeWithException(Exception("Query failed: ${result.debugMessage}"))
                }
            }
        }
    }

    suspend fun launchPurchaseFlow(activity: Activity, productDetails: ProductDetails) {
        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(
                listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(productDetails)
                        .setOfferToken(productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken ?: "")
                        .build()
                )
            )
            .build()

        billingClient.launchBillingFlow(activity, billingFlowParams)
    }

    private fun handlePurchase(purchase: Purchase) {
        CoroutineScope(Dispatchers.IO).launch {
            // 验证购买
            val verified = subscriptionRepository.verifyPurchase(
                purchaseToken = purchase.purchaseToken,
                productId = purchase.products.firstOrNull() ?: ""
            )

            if (verified && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                if (!purchase.isAcknowledged) {
                    acknowledgePurchase(purchase)
                }
                _subscriptionStatus.value = SubscriptionStatus.Pro
            }
        }
    }

    private suspend fun acknowledgePurchase(purchase: Purchase) {
        val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()

        billingClient.acknowledgePurchase(acknowledgePurchaseParams) { result ->
            if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                // 处理错误
            }
        }
    }
}
```

---

## 6. API 对接

### 6.1 API 端点列表 (与 iOS 完全一致)

所有 API 端点与 iOS 客户端使用相同的后端服务，参考 iOS 文档的 API 章节：

- **认证 API**: `/auth/apple`, `/auth/google`, `/auth/refresh`
- **用户 API**: `/users/me`, `/users/me/assessment`, `/users/me/badges`
- **书籍 API**: `/books`, `/books/:id`, `/books/:id/content/:chapterId`
- **榜单 API**: `/booklists`, `/booklists/:id`, `/categories`
- **阅读 API**: `/reading/library`, `/reading/progress/:bookId`
- **AI API**: `/ai/explain`, `/ai/simplify`, `/ai/translate`, `/ai/qa`, 及 30+ 个 AI 端点
- **词汇 API**: `/vocabulary`, `/vocabulary/review`
- **数据追踪 API**: `/tracking/reading`, `/tracking/ai`
- **勋章 API**: `/badges`, `/badges/user`
- **订阅 API**: `/subscriptions/status`, `/subscriptions/verify`
- **作者 API**: `/authors`, `/authors/:id/chat`
- **金句 API**: `/quotes`, `/quotes/daily`
- **明信片 API**: `/postcards/templates`, `/postcards`
- **城邦 API**: `/agora/feed`, `/agora/posts`

### 6.2 Retrofit 接口定义示例

```kotlin
// ApiEndpoints.kt
interface ApiEndpoints {

    // 认证
    @POST("auth/google")
    suspend fun signInWithGoogle(@Body request: GoogleAuthRequest): Response<AuthResponse>

    // 书籍
    @GET("books")
    suspend fun getBooks(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("genre") genre: String? = null,
        @Query("difficulty") difficulty: Int? = null
    ): Response<PaginatedResponse<Book>>

    @GET("books/{id}")
    suspend fun getBookDetail(@Path("id") bookId: String): Response<Book>

    @GET("books/{id}/content/{chapterId}")
    suspend fun getChapterContent(
        @Path("id") bookId: String,
        @Path("chapterId") chapterId: String
    ): Response<ChapterContent>

    // AI (流式响应使用 SSE)
    @POST("ai/explain")
    suspend fun explainWord(@Body request: ExplainRequest): Response<ExplainResponse>

    @POST("ai/simplify")
    suspend fun simplifySentence(@Body request: SimplifyRequest): Response<SimplifyResponse>

    @POST("ai/translate")
    suspend fun translateParagraph(@Body request: TranslateRequest): Response<TranslateResponse>

    // 词汇
    @GET("vocabulary")
    suspend fun getVocabulary(): Response<List<Vocabulary>>

    @POST("vocabulary")
    suspend fun addVocabulary(@Body request: AddVocabularyRequest): Response<Vocabulary>

    @POST("vocabulary/auto-batch")
    suspend fun batchAddVocabulary(@Body request: BatchAddRequest): Response<Unit>

    @GET("vocabulary/review")
    suspend fun getReviewWords(): Response<List<Vocabulary>>

    @POST("vocabulary/{id}/review")
    suspend fun submitReview(
        @Path("id") wordId: String,
        @Body request: ReviewRequest
    ): Response<Unit>

    // 阅读进度
    @PATCH("reading/progress/{bookId}")
    suspend fun updateProgress(
        @Path("bookId") bookId: String,
        @Body request: ProgressRequest
    ): Response<Unit>

    @POST("reading/sessions")
    suspend fun saveReadingSession(@Body request: SessionRequest): Response<Unit>
}
```

---

## 7. 实施计划

### 7.1 开发阶段划分

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Android 开发计划 (6-8周)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Week 1-2: 基础架构与核心框架                                            │
│  ═══════════════════════════════                                        │
│  □ 项目初始化 (Kotlin + Compose)                                        │
│  □ Hilt 依赖注入配置                                                    │
│  □ 网络层 (Retrofit + OkHttp + SSE)                                     │
│  □ 本地数据库 (Room + DataStore)                                        │
│  □ 认证系统 (Google Sign-In + JWT)                                      │
│  □ 主题系统 (Material 3 动态主题)                                        │
│  □ 导航框架 (Navigation Compose)                                        │
│                                                                         │
│  Week 3-4: 阅读器核心 ⭐⭐⭐                                              │
│  ═══════════════════════════                                            │
│  □ WebView EPUB 渲染器                                                  │
│  □ JavaScript Bridge 实现                                               │
│  □ 文本选择与高亮                                                        │
│  □ 翻页控制与动画                                                        │
│  □ 阅读进度同步 (CFI)                                                   │
│  □ 阅读时长追踪 (后台静默)                                               │
│  □ 阅读器设置 (主题/字体/字号)                                           │
│  □ 章节目录 (TOC)                                                       │
│                                                                         │
│  Week 5-6: AI 功能 ⭐⭐⭐                                                 │
│  ═══════════════════════                                                │
│  □ AI 流式响应 (SSE)                                                    │
│  □ 选词解释 UI + 流式文本                                                │
│  □ 句子简化                                                             │
│  □ 段落翻译                                                             │
│  □ 内容问答                                                             │
│  □ 自动添加生词本                                                        │
│  □ AI 缓存策略                                                          │
│  □ 77 个 AI 页面 (模块化复用)                                            │
│                                                                         │
│  Week 7: 学习与有声书                                                    │
│  ═════════════════════                                                  │
│  □ 生词本功能                                                           │
│  □ SM-2 复习算法                                                        │
│  □ 复习卡片 UI                                                          │
│  □ 有声书播放 (Media3)                                                  │
│  □ Whispersync 文字同步                                                 │
│  □ 播放控制与通知                                                        │
│                                                                         │
│  Week 8: 完善与发布                                                      │
│  ═══════════════════                                                    │
│  □ Google Play Billing                                                  │
│  □ 订阅页面与付费墙                                                      │
│  □ 离线功能                                                             │
│  □ 勋章系统                                                             │
│  □ 社交功能 (Agora/作者/金句/明信片)                                     │
│  □ 性能优化                                                             │
│  □ 测试与 Bug 修复                                                      │
│  □ Google Play 上架准备                                                 │
│                                                                         │
│  交付物：                                                                │
│  • Google Play 正式版 APK                                               │
│  • 功能与 iOS 100% 对齐                                                 │
│  • 完整测试覆盖                                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 里程碑

| 里程碑 | 完成时间 | 交付物 |
|--------|---------|--------|
| **M1: 基础可运行** | Week 2 | 登录、书架、基础阅读 |
| **M2: 阅读器完整** | Week 4 | EPUB 渲染、文本选择、进度同步 |
| **M3: AI 集成** | Week 6 | 全部 AI 功能、流式响应 |
| **M4: 学习系统** | Week 7 | 生词本、复习、有声书 |
| **M5: 正式发布** | Week 8 | Google Play 上架 |

---

## 8. 技术难点与解决方案

### 8.1 EPUB 渲染与文本选择

**难点**: Android WebView 与 iOS WKWebView 行为差异

**解决方案**:
1. 使用相同的 EPUB.js 前端库确保一致性
2. 统一 JavaScript Bridge 接口定义
3. 处理 Android 特有的 WebView 配置 (如 allowFileAccess)
4. 使用 @JavascriptInterface 替代 iOS 的 WKScriptMessageHandler

### 8.2 AI 流式响应

**难点**: OkHttp SSE 与 Compose 状态管理结合

**解决方案**:
1. 使用 OkHttp EventSourceListener 接收 SSE 事件
2. 通过 callbackFlow 转换为 Kotlin Flow
3. 在 ViewModel 中使用 StateFlow 管理 UI 状态
4. 确保在主线程更新 Compose 状态

### 8.3 有声书后台播放

**难点**: Android 后台限制与 Media Session 兼容

**解决方案**:
1. 使用 Media3 MediaSessionService
2. 前台服务保证播放持续性
3. 正确处理音频焦点
4. 支持 Android Auto 集成

### 8.4 离线功能与数据同步

**难点**: 离线期间数据一致性

**解决方案**:
1. Room 数据库记录所有离线操作
2. WorkManager 管理同步队列
3. 使用乐观锁处理冲突
4. 网络恢复后自动同步

### 8.5 性能优化

**难点**: 大量 AI 页面的内存占用

**解决方案**:
1. 使用 Compose LazyColumn 延迟加载
2. 图片使用 Coil 的内存缓存策略
3. AI 响应使用 Room 磁盘缓存
4. 使用 Baseline Profiles 优化启动

---

## 9. 测试策略

### 9.1 单元测试

```kotlin
// ExampleTest.kt
@Test
fun `SM2Algorithm should reset on quality below 3`() {
    val result = SM2Algorithm.calculate(
        quality = 2,
        repetition = 5,
        easeFactor = 2.5f,
        interval = 30
    )

    assertEquals(0, result.newRepetition)
    assertEquals(1, result.newInterval)
}
```

### 9.2 UI 测试

```kotlin
// ReaderScreenTest.kt
@Test
fun testTextSelectionShowsAIMenu() {
    composeTestRule.setContent {
        ReaderScreen(bookId = "test-book")
    }

    // 模拟文本选择
    composeTestRule.onNodeWithTag("reader-webview")
        .performGesture { longClick() }

    // 验证 AI 菜单显示
    composeTestRule.onNodeWithText("Explain").assertIsDisplayed()
    composeTestRule.onNodeWithText("Simplify").assertIsDisplayed()
    composeTestRule.onNodeWithText("Translate").assertIsDisplayed()
}
```

### 9.3 集成测试

- API 请求/响应测试
- 数据库迁移测试
- 端到端用户流程测试

---

## 10. 发布检查清单

### 10.1 功能完整性

- [ ] 所有 119+ 页面实现完成
- [ ] 77 个 AI 页面全部可用
- [ ] 有声书播放与同步正常
- [ ] 生词本和复习系统完整
- [ ] 订阅购买流程顺畅
- [ ] 离线功能正常工作

### 10.2 质量保证

- [ ] 崩溃率 < 0.1%
- [ ] ANR 率 < 0.01%
- [ ] 启动时间 < 2s
- [ ] 内存无明显泄漏
- [ ] 适配 Android 8-14
- [ ] 横竖屏适配
- [ ] 深色模式完整支持

### 10.3 合规性

- [ ] Google Play 政策合规
- [ ] 隐私政策更新
- [ ] 权限最小化
- [ ] 敏感数据加密存储

### 10.4 发布材料

- [ ] 应用图标 (多分辨率)
- [ ] 功能截图 (手机+平板)
- [ ] 宣传视频
- [ ] 应用描述 (多语言)
- [ ] 更新日志

---

## 11. 附录

### 11.1 iOS vs Android 技术映射

| iOS | Android |
|-----|---------|
| SwiftUI | Jetpack Compose |
| WKWebView | WebView |
| AVFoundation | Media3 ExoPlayer |
| SwiftData | Room |
| Keychain | EncryptedSharedPreferences |
| UserDefaults | DataStore |
| StoreKit 2 | Google Play Billing |
| AuthenticationServices | Credential Manager |
| async/await | Kotlin Coroutines |
| Combine | Kotlin Flow |
| OSLog | Timber + Logcat |
| URLSession | OkHttp + Retrofit |

### 11.2 参考资源

**内部文档:**
- [Android 模块技术规格](./modules/) - 各核心模块的详细技术实现方案
- [iOS 客户端技术规格文档](../ios/client-spec.md)
- [产品需求文档](../product/prd.md)
- [后端 API 文档](../api/)

**外部文档:**
- [Jetpack Compose 官方文档](https://developer.android.com/jetpack/compose)
- [Media3 文档](https://developer.android.com/media/media3)
- [Google Play Billing](https://developer.android.com/google/play/billing)
