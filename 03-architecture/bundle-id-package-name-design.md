# Bundle ID / Package Name 设计规范

> 跨平台应用标识符设计方案，考虑iOS、Android及未来扩展

**创建时间**: 2025-12-25
**版本**: 1.0
**状态**: ✅ 已定稿

---

## 📋 目录

1. [设计原则](#设计原则)
2. [当前方案](#当前方案)
3. [包名结构](#包名结构)
4. [未来扩展方案](#未来扩展方案)
5. [各平台配置](#各平台配置)
6. [域名所有权验证](#域名所有权验证)

---

## 设计原则

### 1. 统一性
- iOS Bundle ID 和 Android Package Name 保持一致
- 便于用户识别和跨平台迁移
- 统一的品牌标识

### 2. 可扩展性
- 预留未来产品线扩展空间
- 支持不同市场和地区版本
- 支持不同设备类型（手机、平板、桌面）

### 3. 符合规范
- 遵循Apple Bundle ID规范
- 遵循Android Package Name规范
- 反向域名表示法（Reverse Domain Name Notation）

### 4. 简洁明了
- 避免过于复杂的命名
- 易于记忆和输入
- 语义清晰

---

## 当前方案

### 主应用标识符

| 平台 | 标识符 | 用途 |
|------|--------|------|
| **iOS** | `com.readmigo.app` | iOS主应用 |
| **Android** | `com.readmigo.app` | Android主应用 |
| **Web** | `https://readmigo.app` | Web应用 |

### 选择理由

✅ **优势**：
- 跨平台一致性强
- 简洁易记
- `.app` 后缀明确表明是应用程序
- 与域名 `readmigo.app` 完美匹配

⚠️ **考虑**：
- `.app` 可能让人误以为只有一个版本
- 未来如需多版本需要新的命名策略

---

## 包名结构

### 标准格式

```
com.readmigo.<product>.<variant>
│   │        │        │
│   │        │        └─ 变体（可选）：beta, dev, staging
│   │        └─ 产品标识：app, lite, pro, kids
│   └─ 公司/品牌名
└─ 顶级域名
```

### 示例

```
com.readmigo.app              # 主应用（推荐）
com.readmigo.app.beta         # 测试版（可选）
com.readmigo.app.dev          # 开发版（可选）
```

---

## 未来扩展方案

### 场景1：轻量版本

如果未来推出轻量版（功能精简、包体积更小）：

| 平台 | 包名 | 说明 |
|------|------|------|
| iOS | `com.readmigo.lite` | Readmigo Lite |
| Android | `com.readmigo.lite` | Readmigo Lite |

**App名称**：Readmigo Lite

### 场景2：专业版本

如果采用双版本策略（免费版+专业版）：

| 版本 | iOS Bundle ID | Android Package Name | App名称 |
|------|---------------|---------------------|---------|
| 免费版 | `com.readmigo.app` | `com.readmigo.app` | Readmigo |
| 专业版 | `com.readmigo.pro` | `com.readmigo.pro` | Readmigo Pro |

**注**：当前采用单一应用+IAP订阅模式，不推荐此方案。

### 场景3：儿童版本

如果推出专为儿童设计的版本：

| 平台 | 包名 | 说明 |
|------|------|------|
| iOS | `com.readmigo.kids` | Readmigo Kids |
| Android | `com.readmigo.kids` | Readmigo Kids |

**特点**：
- 年龄评级更严格
- 内容过滤
- 家长控制

### 场景4：地区特定版本

如果需要针对特定地区的版本（例如中国大陆）：

| 地区 | iOS Bundle ID | Android Package Name | 说明 |
|------|---------------|---------------------|------|
| 国际版 | `com.readmigo.app` | `com.readmigo.app` | 全球市场 |
| 中国版 | `com.readmigo.app.cn` | `com.readmigo.app.cn` | 中国大陆 |

**用途**：
- 符合当地法规要求
- 使用本地化服务（如支付宝、微信支付）
- 内容审核适配

### 场景5：平板专版

如果推出iPad/Android平板专用版本：

| 设备 | iOS Bundle ID | Android Package Name | 说明 |
|------|---------------|---------------------|------|
| 手机版 | `com.readmigo.app` | `com.readmigo.app` | 通用版 |
| 平板版 | `com.readmigo.tablet` | `com.readmigo.tablet` | 平板优化版 |

**注**：当前采用自适应设计，不推荐单独平板版。

### 场景6：测试和开发版本

内部测试和开发使用的包名：

| 环境 | iOS Bundle ID | Android Package Name | 用途 |
|------|---------------|---------------------|------|
| 生产环境 | `com.readmigo.app` | `com.readmigo.app` | 正式版 |
| Beta测试 | `com.readmigo.app.beta` | `com.readmigo.app.beta` | 公开测试 |
| 开发环境 | `com.readmigo.app.dev` | `com.readmigo.app.dev` | 内部开发 |

**优势**：
- 可以在同一设备安装多个版本
- 不影响生产环境数据
- 便于测试

---

## 各平台配置

### iOS配置

#### 1. Xcode项目配置

```xml
<!-- Info.plist -->
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
```

#### 2. Build Settings

```
PRODUCT_BUNDLE_IDENTIFIER = com.readmigo.app
```

#### 3. Apple Developer Portal

1. 登录 [Apple Developer Portal](https://developer.apple.com/account)
2. Certificates, Identifiers & Profiles → Identifiers
3. 创建App ID：
   - Description: Readmigo
   - Bundle ID: `com.readmigo.app`
   - Capabilities:
     - ✅ Sign in with Apple
     - ✅ Push Notifications
     - ✅ In-App Purchase
     - ✅ Associated Domains (如需Universal Links)

#### 4. App Store Connect

- Bundle ID: `com.readmigo.app`
- SKU: `readmigo-ios-001`
- Apple ID: (自动生成)

---

### Android配置

#### 1. build.gradle配置

```gradle
// app/build.gradle
android {
    namespace 'com.readmigo.app'

    defaultConfig {
        applicationId "com.readmigo.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            applicationIdSuffix ""
        }
        beta {
            applicationIdSuffix ".beta"
        }
        debug {
            applicationIdSuffix ".dev"
        }
    }
}
```

#### 2. AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.readmigo.app">

    <application
        android:label="Readmigo"
        ...>
    </application>
</manifest>
```

#### 3. Google Play Console

- Package name: `com.readmigo.app`
- App name: Readmigo - AI English Reading
- 无法修改：包名一旦发布不可更改

---

### Web配置

#### 1. PWA Manifest

```json
{
  "name": "Readmigo - AI English Reading",
  "short_name": "Readmigo",
  "id": "com.readmigo.app",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5"
}
```

#### 2. Deep Links / Universal Links

| 平台 | 链接格式 |
|------|---------|
| Web | `https://readmigo.app/book/123` |
| iOS | `readmigo://book/123` (Custom URL Scheme) |
| iOS | `https://readmigo.app/book/123` (Universal Link) |
| Android | `readmigo://book/123` (Custom URL Scheme) |
| Android | `https://readmigo.app/book/123` (App Link) |

---

## 域名所有权验证

### 为什么需要验证？

- 使用 `com.readmigo.*` 需要拥有 `readmigo.app` 或 `readmigo.app` 域名
- Apple和Google会验证域名所有权
- 防止品牌仿冒

### Apple验证

#### Sign in with Apple
需要配置域名验证：
1. 创建Service ID
2. 配置域名：`readmigo.app`
3. 下载验证文件到: `https://readmigo.app/.well-known/apple-app-site-association`

#### Universal Links
需要配置AASA文件：
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.readmigo.app",
        "paths": ["*"]
      }
    ]
  }
}
```

### Google验证

#### Play App Signing
- 验证域名所有权
- 配置Digital Asset Links

#### App Links
创建 `assetlinks.json`：
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.readmigo.app",
    "sha256_cert_fingerprints": ["..."]
  }
}]
```

托管在: `https://readmigo.app/.well-known/assetlinks.json`

---

## 包名命名规范总结

### ✅ 推荐做法

1. **主应用使用简单明确的包名**
   ```
   com.readmigo.app
   ```

2. **测试版本使用后缀**
   ```
   com.readmigo.app.beta
   com.readmigo.app.dev
   ```

3. **不同产品使用不同前缀**
   ```
   com.readmigo.lite    # 轻量版
   com.readmigo.kids    # 儿童版
   ```

4. **地区版本使用地区代码**
   ```
   com.readmigo.app.cn  # 中国版
   com.readmigo.app.jp  # 日本版
   ```

### ❌ 避免做法

1. **过于复杂的命名**
   ```
   com.readmigo.app.mobile.android.production  # 太复杂
   ```

2. **使用数字版本号**
   ```
   com.readmigo.app2    # 不推荐
   com.readmigo.appv2   # 不推荐
   ```

3. **使用下划线**
   ```
   com.readmigo.app_beta    # 应该用点号
   ```

4. **随意改变包名**
   - Android包名发布后无法更改
   - iOS可以改但会失去所有用户数据
   - 务必一开始就确定

---

## 实施计划

### 当前阶段（v1.0）

| 平台 | 包名/Bundle ID | 状态 |
|------|---------------|------|
| iOS | `com.readmigo.app` | ✅ 已配置 |
| Android | `com.readmigo.app` | 📝 待实施 |
| Web | `readmigo.app` | ✅ 已部署 |

### 短期计划（v1.x）

- [ ] 配置iOS Universal Links
- [ ] 配置Android App Links
- [ ] 设置测试环境包名 `.beta`

### 长期考虑（v2.0+）

- [ ] 评估是否需要Lite版本
- [ ] 评估是否需要儿童版本
- [ ] 评估是否需要地区特定版本

---

## 检查清单

### iOS发布前

- [ ] Bundle ID已在Apple Developer注册
- [ ] App Store Connect中Bundle ID正确
- [ ] Xcode项目中Bundle ID一致
- [ ] Sign in with Apple配置完成
- [ ] Universal Links配置（如需要）

### Android发布前

- [ ] Package Name格式正确（全小写，无下划线）
- [ ] build.gradle配置正确
- [ ] Google Play Console中包名唯一
- [ ] App Links配置（如需要）
- [ ] 签名证书已生成

### 域名验证

- [ ] 拥有readmigo.app域名
- [ ] Apple验证文件已上传
- [ ] Google验证文件已上传
- [ ] HTTPS证书有效

---

## 参考资料

### Apple文档
- [Bundle ID官方文档](https://developer.apple.com/documentation/appstoreconnectapi/bundle_ids)
- [Universal Links配置](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)

### Google文档
- [Package Name指南](https://developer.android.com/studio/build/configure-app-module#set-application-id)
- [App Links配置](https://developer.android.com/training/app-links)

### 命名规范
- [Reverse Domain Name Notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)

---

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0 | 2025-12-25 | 初始版本，确定跨平台包名方案 |

---

**文档维护者**: Readmigo Team
**最后更新**: 2025-12-25
**下次审查**: 2026-06-25
