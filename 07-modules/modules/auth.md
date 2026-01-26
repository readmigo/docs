# Auth 模块

> 认证与登录系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| Google 登录 | OAuth 2.0 登录 | P0 |
| Apple 登录 | Sign in with Apple | P0 |
| Email 登录 | 邮箱密码登录 (Web only) | P1 |
| JWT Token 管理 | 安全存储与自动刷新 | P0 |
| 登录状态持久化 | 记住登录状态 | P0 |
| 登出 | 清除本地数据 | P0 |
| 访客模式 | 无需登录浏览 | P1 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| Google 登录 | Credential Manager | @react-native-google-signin | NextAuth.js |
| Apple 登录 | WebView OAuth | expo-apple-authentication | NextAuth.js |
| Token 存储 | EncryptedSharedPreferences | expo-secure-store | Cookie/JWT |
| 状态管理 | StateFlow | Zustand | Zustand + NextAuth |

---

## 2. 数据模型

### 2.1 用户模型

```typescript
// 共享类型定义
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium';
  createdAt: string;
  profile?: UserProfile;
}

interface UserProfile {
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoal: 'casual' | 'regular' | 'intensive';
  interests: string[];
  dailyGoalMinutes: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

type AuthProvider = 'google' | 'apple' | 'email';
```

---

## 3. API 接口

### 3.1 认证端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/google` | POST | Google 登录 |
| `/auth/apple` | POST | Apple 登录 |
| `/auth/refresh` | POST | 刷新 Token |
| `/auth/session` | DELETE | 撤销会话 |
| `/users/me` | GET | 获取当前用户 |

### 3.2 请求/响应格式

```typescript
// Google 登录请求
interface GoogleAuthRequest {
  idToken: string;
  accessToken?: string;
}

// Apple 登录请求
interface AppleAuthRequest {
  identityToken: string;
  authorizationCode: string;
  user?: { email?: string; fullName?: string };
}

// 认证响应
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// 刷新 Token 请求
interface RefreshTokenRequest {
  refreshToken: string;
}
```

---

## 4. Android 实现

### 4.1 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ AuthScreen  │  │LoginPrompt  │  │ AccountLinkingScreen│  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼──────────────┘
          └────────────────┼────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ViewModel Layer                           │
│                 ┌────────────────────┐                       │
│                 │   AuthViewModel    │                       │
│                 └─────────┬──────────┘                       │
└───────────────────────────┼──────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   AuthRepository                        │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │ │
│  │  │   AuthApi    │ │ TokenManager │ │CredentialManager│ │ │
│  │  │  (Retrofit)  │ │  (DataStore) │ │ (Google/Apple) │  │ │
│  │  └──────────────┘ └──────────────┘ └────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Token Manager

```kotlin
// core/auth/TokenManager.kt
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context, "auth_prefs", masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    fun saveTokens(response: AuthResponse) { /* ... */ }
    fun getAccessToken(): String? = encryptedPrefs.getString(KEY_ACCESS_TOKEN, null)
    fun getRefreshToken(): String? = encryptedPrefs.getString(KEY_REFRESH_TOKEN, null)
    fun isTokenExpired(): Boolean { /* ... */ }
    fun clearTokens() { /* ... */ }
}
```

### 4.3 Google Sign-In

```kotlin
// features/auth/GoogleSignInHandler.kt
@Singleton
class GoogleSignInHandler @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun signIn(activityContext: Context): Result<GoogleAuthCredential> {
        val googleIdOption = GetGoogleIdOption.Builder()
            .setServerClientId(WEB_CLIENT_ID)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(true)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        val result = credentialManager.getCredential(activityContext, request)
        // Process credential...
    }
}
```

---

## 5. React Native 实现

### 5.1 依赖配置

```bash
npx expo install expo-apple-authentication expo-secure-store expo-auth-session
npm install @react-native-google-signin/google-signin
```

### 5.2 Zustand Store

```typescript
// src/features/auth/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      isGuestMode: false,
      error: null,

      setUser: (user) => set((state) => { state.user = user; state.isAuthenticated = true; }),
      setTokens: (tokens) => set((state) => { state.tokens = tokens; }),
      logout: async () => { /* ... */ },
      enterGuestMode: () => set((state) => { state.isGuestMode = true; }),
    })),
    { name: 'auth-storage', storage: createJSONStorage(() => secureStorage) }
  )
);
```

### 5.3 Apple Sign-In

```typescript
// src/features/auth/hooks/useAppleSignIn.ts
import * as AppleAuthentication from 'expo-apple-authentication';

export function useAppleSignIn() {
  const login = useLogin();

  const signIn = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    await login.mutateAsync({
      provider: 'apple',
      idToken: credential.identityToken!,
      authorizationCode: credential.authorizationCode!,
    });
  };

  return { signIn, isLoading: login.isPending, error: login.error };
}
```

---

## 6. Web 实现

### 6.1 NextAuth.js 配置

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.subscriptionTier = token.subscriptionTier as string;
      return session;
    },
  },
  pages: { signIn: '/login', newUser: '/onboarding' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
});
```

### 6.2 Server Actions

```typescript
// src/features/auth/actions/login.ts
'use server';

import { signIn } from '@/lib/auth';

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/library' });
}

export async function loginWithApple() {
  await signIn('apple', { redirectTo: '/library' });
}
```

---

## 7. 安全考虑

| 平台 | Token 存储 | 传输加密 | 自动刷新 |
|------|-----------|----------|----------|
| Android | EncryptedSharedPreferences (AES-256) | HTTPS + Certificate Pinning | 提前 5 分钟刷新 |
| React Native | expo-secure-store (Keychain/Keystore) | HTTPS | 请求失败时刷新 |
| Web | HttpOnly Cookie / JWT | HTTPS | NextAuth 自动处理 |

### 7.1 通用安全措施

1. **Token 有效期**: Access Token 7 天，Refresh Token 30 天
2. **401 处理**: 自动重试一次，失败则清除登录状态
3. **登出清理**: 清除所有本地存储的认证信息

---

## 8. 测试用例

```typescript
// 通用测试场景
describe('Auth Module', () => {
  it('should set user correctly after login', () => { /* ... */ });
  it('should handle guest mode', () => { /* ... */ });
  it('should clear user on logout', () => { /* ... */ });
  it('should refresh token when expired', () => { /* ... */ });
  it('should handle login cancellation', () => { /* ... */ });
});
```

---

*最后更新: 2025-12-28*
