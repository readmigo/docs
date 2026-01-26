# About 模块

> 关于页面系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 应用信息展示 | 版本号、构建号、设备信息 | P0 |
| 版本检查 | 检查更新并跳转应用商店 | P0 |
| 法律文档 | 隐私政策、服务条款、用户协议 | P0 |
| 联系我们 | 邮箱、电话、社交媒体 | P0 |
| 反馈入口 | 评价应用、问题反馈 | P1 |
| 开源许可 | 第三方库许可证展示 | P1 |
| 更新日志 | 版本历史记录 | P2 |
| 致谢 | 团队与贡献者致谢 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 版本信息 | BuildConfig | expo-application | 环境变量 |
| 外部链接 | Intent | expo-linking | window.open |
| 邮件 | Intent.ACTION_SEND | expo-mail-composer | mailto: |
| 应用评分 | In-App Review | App Store/Play Store | 外链 |
| 更新检查 | Play Core | App Store Connect | N/A |

---

## 2. 数据模型

```typescript
// 应用信息
interface AppInfo {
  name: string;
  version: string;
  buildNumber: string;
  bundleId: string;
  environment: 'development' | 'staging' | 'production';
}

// 设备信息
interface DeviceInfo {
  model: string;
  osVersion: string;
  language: string;
}

// 更新日志条目
interface ChangelogEntry {
  version: string;
  date: string;
  changes: ChangeItem[];
}

interface ChangeItem {
  type: 'feature' | 'fix' | 'improvement' | 'breaking';
  description: string;
}

// 法律文档
interface LegalDocument {
  id: string;
  title: string;
  url: string;
  lastUpdated?: string;
}

// 开源许可证
interface OpenSourceLicense {
  name: string;
  version?: string;
  licenseType: LicenseType;
  projectUrl?: string;
  licenseText?: string;
}

type LicenseType = 'MIT' | 'Apache-2.0' | 'BSD-3-Clause' | 'GPL-3.0' | 'Custom';

// 社交链接
interface SocialLink {
  platform: SocialPlatform;
  handle: string;
  url: string;
  appIntent?: string;
  icon: string;
}

type SocialPlatform =
  | 'website'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'discord'
  | 'weibo'
  | 'wechat'
  | 'github';

// 更新检查结果
type UpdateCheckResult =
  | { type: 'upToDate' }
  | { type: 'available'; version: string }
  | { type: 'error'; message: string };
```

---

## 3. 页面结构

```
┌─────────────────────────────────┐
│         ← About                 │  TopAppBar
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │      [App Icon]         │    │  App Header
│  │       Readmigo          │    │
│  │    "Read. Learn. Grow"  │    │  (Slogan)
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Version Info Section           │
│  ├─ Version          1.0.0     │
│  ├─ Build            1         │
│  └─ [Check for Updates]    ▶   │
├─────────────────────────────────┤
│  Contact Us Section             │
│  ├─ Email                  ▶   │
│  ├─ Phone                  ▶   │
│  └─ Social Media           ▶   │
├─────────────────────────────────┤
│  Legal Section                  │
│  ├─ Privacy Policy         ▶   │
│  ├─ Terms of Service       ▶   │
│  └─ User Agreement         ▶   │
├─────────────────────────────────┤
│  Feedback Section               │
│  ├─ Rate App               ▶   │
│  └─ Report a Problem       ▶   │
├─────────────────────────────────┤
│  More Section                   │
│  ├─ Changelog              ▶   │
│  ├─ Open Source Licenses   ▶   │
│  └─ Acknowledgments        ▶   │
├─────────────────────────────────┤
│                                 │
│  © 2024-2025 Readmigo          │  Footer
│  Made with ❤️ for readers       │
│                                 │
└─────────────────────────────────┘
```

---

## 4. 配置数据

### 社交链接

```typescript
const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'website',
    handle: 'readmigo.app',
    url: 'https://readmigo.app',
    icon: 'globe-outline',
  },
  {
    platform: 'twitter',
    handle: '@ReadmigoApp',
    url: 'https://x.com/ReadmigoApp',
    appIntent: 'twitter://',
    icon: 'logo-twitter',
  },
  {
    platform: 'instagram',
    handle: '@readmigo.app',
    url: 'https://instagram.com/readmigo.app',
    appIntent: 'instagram://',
    icon: 'logo-instagram',
  },
  {
    platform: 'github',
    handle: 'readmigo',
    url: 'https://github.com/readmigo',
    icon: 'logo-github',
  },
  {
    platform: 'discord',
    handle: 'Readmigo Community',
    url: 'https://discord.gg/readmigo',
    appIntent: 'discord://',
    icon: 'logo-discord',
  },
];
```

### 法律文档

```typescript
const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'privacy',
    title: '隐私政策',
    url: 'https://readmigo.app/privacy',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'terms',
    title: '服务条款',
    url: 'https://readmigo.app/terms',
    lastUpdated: '2024-12-01',
  },
  {
    id: 'agreement',
    title: '用户协议',
    url: 'https://readmigo.app/agreement',
    lastUpdated: '2024-12-01',
  },
];
```

### 联系方式

```typescript
const CONTACT_INFO = {
  email: 'support@readmigo.app',
  phone: '+86 400-XXX-XXXX',
  feedbackSubject: '[Readmigo Feedback] Issue Report',
};
```

---

## 5. Android 实现

### 5.1 文件结构

```
features/about/
├── ui/
│   ├── AboutScreen.kt
│   ├── AppInfoHeader.kt
│   ├── VersionSection.kt
│   ├── ContactSection.kt
│   ├── SocialMediaListScreen.kt
│   ├── LegalSection.kt
│   ├── FeedbackSection.kt
│   ├── OpenSourceLicensesScreen.kt
│   ├── ChangelogScreen.kt
│   └── AcknowledgmentsScreen.kt
├── data/
│   ├── model/
│   │   ├── AppInfo.kt
│   │   └── OpenSourceLicense.kt
│   └── repository/
│       └── AboutRepository.kt
└── viewmodel/
    └── AboutViewModel.kt
```

### 5.2 AppInfo 获取

```kotlin
data class AppInfo(
    val version: String,
    val build: String,
    val packageName: String
) {
    companion object {
        fun fromContext(context: Context): AppInfo {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            return AppInfo(
                version = packageInfo.versionName ?: "Unknown",
                build = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    packageInfo.longVersionCode.toString()
                } else {
                    @Suppress("DEPRECATION")
                    packageInfo.versionCode.toString()
                },
                packageName = context.packageName
            )
        }
    }
}

data class DeviceInfo(
    val model: String,
    val osVersion: String,
    val language: String
) {
    companion object {
        fun current(): DeviceInfo = DeviceInfo(
            model = "${Build.MANUFACTURER} ${Build.MODEL}",
            osVersion = "Android ${Build.VERSION.RELEASE}",
            language = Locale.getDefault().toLanguageTag()
        )
    }
}
```

### 5.3 AboutViewModel

```kotlin
@HiltViewModel
class AboutViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val versionRepository: VersionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AboutUiState())
    val uiState: StateFlow<AboutUiState> = _uiState.asStateFlow()

    val appInfo: AppInfo = AppInfo.fromContext(context)
    val deviceInfo: DeviceInfo = DeviceInfo.current()

    fun checkForUpdate() {
        viewModelScope.launch {
            _uiState.update { it.copy(isCheckingUpdate = true) }
            try {
                val result = versionRepository.checkVersion(force = true)
                _uiState.update {
                    it.copy(
                        isCheckingUpdate = false,
                        updateCheckResult = if (result.updateAvailable) {
                            UpdateCheckResult.Available(result.latestVersion)
                        } else {
                            UpdateCheckResult.UpToDate
                        }
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isCheckingUpdate = false,
                        updateCheckResult = UpdateCheckResult.Error(e.message ?: "Unknown error")
                    )
                }
            }
        }
    }

    fun openGooglePlay() {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("market://details?id=${context.packageName}")
            setPackage("com.android.vending")
        }
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val webIntent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://play.google.com/store/apps/details?id=${context.packageName}")
            }
            context.startActivity(webIntent)
        }
    }

    fun requestAppReview(activity: Activity) {
        val manager = ReviewManagerFactory.create(context)
        val request = manager.requestReviewFlow()
        request.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                manager.launchReviewFlow(activity, task.result)
            }
        }
    }
}
```

### 5.4 社交媒体跳转

```kotlin
object SocialMediaUtils {
    fun openSocialMedia(context: Context, account: SocialMediaAccount) {
        account.appIntent?.let { appIntent ->
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(appIntent))
                context.startActivity(intent)
                return
            } catch (e: ActivityNotFoundException) {
                // App 未安装，降级到网页
            }
        }
        val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(account.webUrl))
        context.startActivity(webIntent)
    }
}
```

---

## 6. React Native 实现

### 6.1 应用信息获取

```typescript
import * as Application from 'expo-application';

export async function getAppInfo(): Promise<AppInfo> {
  return {
    name: Application.applicationName || 'Readmigo',
    version: Application.nativeApplicationVersion || '1.0.0',
    buildNumber: Application.nativeBuildVersion || '1',
    bundleId: Application.applicationId || '',
    environment: __DEV__ ? 'development' : 'production',
  };
}
```

### 6.2 AboutScreen

```typescript
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import * as MailComposer from 'expo-mail-composer';

export function AboutScreen() {
  const router = useRouter();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    getAppInfo().then(setAppInfo);
  }, []);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const handleContactUs = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [CONTACT_EMAIL],
        subject: `Readmigo 反馈 (v${appInfo?.version})`,
        body: '\n\n---\n设备信息：\n' + JSON.stringify(appInfo, null, 2),
      });
    } else {
      Linking.openURL(`mailto:${CONTACT_EMAIL}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Logo 和版本 */}
        <View style={styles.header}>
          <Image source={require('@/assets/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>Readmigo</Text>
          <Text style={styles.tagline}>智能英语阅读助手</Text>
          {appInfo && (
            <Text style={styles.version}>
              版本 {appInfo.version} ({appInfo.buildNumber})
            </Text>
          )}
        </View>

        {/* 功能菜单 */}
        <View style={styles.section}>
          <MenuItem icon="newspaper-outline" title="更新日志" onPress={() => router.push('/about/changelog')} />
          <MenuItem icon="star-outline" title="给应用评分" onPress={handleRateApp} />
          <MenuItem icon="share-outline" title="分享给朋友" onPress={handleShare} />
        </View>

        {/* 法律文档 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>法律信息</Text>
          {LEGAL_DOCUMENTS.map((doc) => (
            <MenuItem
              key={doc.id}
              icon="document-text-outline"
              title={doc.title}
              onPress={() => handleOpenLink(doc.url)}
            />
          ))}
        </View>

        {/* 联系我们 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系我们</Text>
          <MenuItem icon="mail-outline" title="发送反馈" onPress={handleContactUs} />
        </View>

        {/* 社交链接 */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>关注我们</Text>
          <View style={styles.socialLinks}>
            {SOCIAL_LINKS.map((link) => (
              <Pressable key={link.platform} onPress={() => handleOpenLink(link.url)}>
                <Ionicons name={link.icon} size={24} color="#666" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* 版权信息 */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2024-2025 Readmigo</Text>
          <Text style={styles.madeWith}>Made with ❤️ in China</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### 6.3 ChangelogScreen

```typescript
export function ChangelogScreen() {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'feature': return { name: 'add-circle', color: '#43A047' };
      case 'improvement': return { name: 'arrow-up-circle', color: '#1E88E5' };
      case 'fix': return { name: 'build', color: '#FB8C00' };
      default: return { name: 'ellipse', color: '#999' };
    }
  };

  return (
    <ScrollView>
      {CHANGELOG.map((entry, index) => (
        <View key={entry.version} style={styles.versionEntry}>
          <View style={styles.versionHeader}>
            <Text style={styles.versionText}>v{entry.version}</Text>
            {index === 0 && <Badge>最新</Badge>}
            <Text style={styles.dateText}>{entry.date}</Text>
          </View>
          {entry.changes.map((change, i) => (
            <View key={i} style={styles.changeItem}>
              <Ionicons {...getChangeIcon(change.type)} size={18} />
              <Text>{change.description}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
```

---

## 7. Web 实现

### 7.1 应用信息 Hook

```typescript
'use client';

export function useAppInfo(): AppInfo {
  return useMemo(() => ({
    name: 'Readmigo',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    buildNumber: process.env.NEXT_PUBLIC_BUILD_NUMBER ?? '1',
    bundleId: 'app.readmigo.web',
    environment: (process.env.NEXT_PUBLIC_ENV ?? 'development') as AppInfo['environment'],
  }), []);
}
```

### 7.2 AboutPage

```tsx
export function AboutPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">关于 Readmigo</h1>

      <div className="space-y-8">
        <AppInfo />
        <Separator />
        <VersionInfo />
        <Separator />
        <Changelog />
        <Separator />
        <LegalLinks />
        <Separator />
        <Credits />
      </div>
    </div>
  );
}
```

### 7.3 更新日志组件

```tsx
export function Changelog() {
  const [expanded, setExpanded] = useState(false);
  const displayedLogs = expanded ? CHANGELOG : CHANGELOG.slice(0, 2);

  const typeColors = {
    feature: 'bg-green-100 text-green-800',
    fix: 'bg-red-100 text-red-800',
    improvement: 'bg-blue-100 text-blue-800',
    breaking: 'bg-orange-100 text-orange-800',
  };

  const typeLabels = {
    feature: '新功能',
    fix: '修复',
    improvement: '优化',
    breaking: '重大变更',
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">更新日志</h3>
      <div className="space-y-4">
        {displayedLogs.map((entry) => (
          <Card key={entry.version}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">v{entry.version}</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge className={typeColors[change.type]}>
                      {typeLabels[change.type]}
                    </Badge>
                    <span className="text-sm">{change.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      {CHANGELOG.length > 2 && (
        <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起' : '查看更多'}
        </Button>
      )}
    </section>
  );
}
```

### 7.4 致谢组件

```tsx
const CREDITS: CreditItem[] = [
  { name: 'Next.js', url: 'https://nextjs.org', license: 'MIT' },
  { name: 'React', url: 'https://react.dev', license: 'MIT' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com', license: 'MIT' },
  { name: 'EPUB.js', url: 'https://github.com/futurepress/epub.js', license: 'BSD-3-Clause' },
  { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs', license: 'MIT' },
];

export function Credits() {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">致谢</h3>
      <Card>
        <CardContent className="p-0 divide-y">
          {CREDITS.map((credit) => (
            <a
              key={credit.name}
              href={credit.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 hover:bg-muted"
            >
              <span className="font-medium">{credit.name}</span>
              <span className="text-xs text-muted-foreground">{credit.license}</span>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">特别感谢</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="https://www.gutenberg.org">Project Gutenberg</a> - 免费电子书资源</li>
            <li><a href="https://librivox.org">LibriVox</a> - 免费有声书资源</li>
            <li><a href="https://standardebooks.org">Standard Ebooks</a> - 高质量免费电子书</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
```

---

## 8. 本地化

```xml
<!-- Android strings.xml -->
<resources>
    <string name="about_title">About</string>
    <string name="about_slogan">Read. Learn. Grow.</string>
    <string name="about_version_info">Version Info</string>
    <string name="about_version">Version</string>
    <string name="about_build">Build</string>
    <string name="about_check_update">Check for Updates</string>
    <string name="about_up_to_date">You\'re up to date</string>
    <string name="about_legal">Legal</string>
    <string name="about_privacy_policy">Privacy Policy</string>
    <string name="about_terms_of_service">Terms of Service</string>
    <string name="about_rate_app">Rate on App Store</string>
    <string name="about_report_problem">Report a Problem</string>
    <string name="about_changelog">Changelog</string>
    <string name="about_open_source_licenses">Open Source Licenses</string>
    <string name="about_acknowledgments">Acknowledgments</string>
    <string name="about_copyright">© 2024–2025 Readmigo</string>
    <string name="about_made_with">Made with ❤️ for readers</string>
</resources>
```

---

## 9. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `about_viewed` | 进入关于页面 | - |
| `check_update_tapped` | 点击检查更新 | - |
| `rate_app_tapped` | 点击评分 | - |
| `report_problem_tapped` | 点击报告问题 | - |
| `privacy_policy_tapped` | 点击隐私政策 | - |
| `terms_tapped` | 点击服务条款 | - |
| `social_media_tapped` | 点击社交媒体 | platform |
| `changelog_viewed` | 查看更新日志 | - |
| `licenses_viewed` | 查看开源许可 | - |

---

## 10. 导出

```typescript
// src/features/about/index.ts
export { AboutScreen } from './components/AboutScreen';
export { ChangelogScreen } from './components/ChangelogScreen';
export { LicensesScreen } from './components/LicensesScreen';

export { getAppInfo, SOCIAL_LINKS, LEGAL_DOCUMENTS } from './config/appConfig';
export { CHANGELOG } from './data/changelog';

export type { AppInfo, ChangelogEntry, LegalDocument, SocialLink } from './types';
```

---

*最后更新: 2025-12-28*
