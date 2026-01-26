# 运营数据收集实现方案

## 概述

本文档详细说明如何实现运营监控所需的数据收集功能，重点解决以下两个关键缺失：

1. **用户活跃时间追踪** (`lastActiveAt`) - 支持 DAU/MAU/留存分析
2. **用户画像数据收集** (性别/年龄/地理位置) - 支持 Demographics 分析

**预计总工期：** 10-12 天
**优先级：** P0（紧急）
**影响范围：** 后端 + iOS + Web + React Native + Android

---

## 目录

- [一、问题分析](#一问题分析)
- [二、解决方案架构](#二解决方案架构)
- [三、后端实现](#三后端实现)
- [四、iOS 客户端实现](#四ios-客户端实现)
- [五、Web 客户端实现](#五web-客户端实现)
- [六、React Native 客户端实现](#六react-native-客户端实现)
- [七、Android 客户端实现](#七android-客户端实现)
- [八、数据库优化](#八数据库优化)
- [九、测试方案](#九测试方案)
- [十、部署计划](#十部署计划)
- [十一、监控与验证](#十一监控与验证)

---

## 一、问题分析

### 1.1 当前状态

| 数据类型 | 数据库表 | 后端API | iOS | Web | RN | Android | 影响 |
|---------|---------|---------|-----|-----|----|---------|----- |
| 阅读会话 | ✅ reading_sessions | ✅ | ✅ | ✅ | 🟡 | ❓ | - |
| 用户活跃时间 | ✅ users.last_active_at | 🟡 方法存在 | ❌ | ❌ | ❌ | ❌ | ❗ DAU/MAU 不准确 |
| 用户画像 | ✅ user_profiles | ❌ | ❌ | ❌ | ❌ | ❌ | ❗ Demographics 无数据 |

### 1.2 影响评估

**用户活跃时间缺失的影响：**
- ❌ Operations Overview 的 DAU/MAU 统计不准确
- ❌ Retention Analysis 的留存率计算有偏差
- ❌ 无法识别"僵尸用户"和"活跃用户"
- ❌ 运营活动效果无法精准评估

**用户画像数据缺失的影响：**
- ❌ Demographics 页面完全无数据
- ❌ 无法进行用户分层和精准营销
- ❌ 内容推荐缺少用户特征支持
- ❌ 商业化策略缺少数据支撑

### 1.3 数据收集原则

1. **隐私优先** - 所有数据收集需用户明确同意
2. **最小化原则** - 只收集必要的数据
3. **透明度** - 明确告知用户数据用途
4. **可选性** - 用户可以选择不提供某些信息
5. **安全性** - 数据传输和存储加密

---

## 二、解决方案架构

### 2.1 整体数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据收集架构图                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  客户端层                     API层                数据层        │
│  ─────────                   ─────                ─────        │
│                                                                 │
│  ┌──────────┐                                                   │
│  │ iOS App  │─┐                                                 │
│  └──────────┘ │                                                 │
│  ┌──────────┐ │            ┌──────────────┐                    │
│  │ Web App  │─┼──────────► │ Activity API │──────┐            │
│  └──────────┘ │            └──────────────┘      │            │
│  ┌──────────┐ │               (每5分钟/          │            │
│  │ RN App   │─┤                前台事件)         │            │
│  └──────────┘ │                                   ▼            │
│  ┌──────────┐ │                            ┌──────────────┐    │
│  │ Android  │─┘                            │   users      │    │
│  └──────────┘                              │ .last_active │    │
│                                            └──────────────┘    │
│       │                                                        │
│       │ (用户主动填写)                                         │
│       │                                                        │
│       ▼                                                        │
│  ┌──────────┐              ┌──────────────┐                   │
│  │ Settings │──────────────► │ Profile API │──────┐           │
│  │   Form   │              └──────────────┘      │           │
│  └──────────┘                                    ▼           │
│                                            ┌──────────────┐   │
│                                            │user_profiles │   │
│                                            │ • gender     │   │
│                                            │ • birth_year │   │
│                                            │ • country    │   │
│                                            │ • region     │   │
│                                            │ • city       │   │
│                                            └──────────────┘   │
│                                                                │
│  定时任务 (Cron Jobs)                                          │
│  ────────────────────                                         │
│  每日 02:00 AM                                                 │
│      │                                                         │
│      ▼                                                         │
│  ┌──────────────────┐                                         │
│  │ Calculate DAU    │────► operations_daily_stats             │
│  │ Calculate MAU    │────► operations_monthly_stats           │
│  │ Retention Rates  │────► user_retention                     │
│  │ Demographics     │────► (聚合查询)                         │
│  └──────────────────┘                                         │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 技术方案概览

| 组件 | 技术栈 | 关键功能 |
|------|--------|---------|
| **后端API** | NestJS + Prisma | 接收活跃心跳、保存用户画像 |
| **iOS客户端** | Swift + URLSession | 前台事件触发、设置表单 |
| **Web客户端** | React + TanStack Query | 页面活跃检测、设置表单 |
| **RN客户端** | React Native + AppState | 状态变化触发、设置表单 |
| **Android客户端** | Kotlin + Retrofit | 生命周期触发、设置表单 |
| **数据库** | PostgreSQL + 索引优化 | 高效查询活跃用户 |
| **缓存** | Redis | 防抖、降低数据库压力 |

---

## 三、后端实现

### 3.1 API 端点设计

#### 3.1.1 用户活跃时间更新

**端点：** `PATCH /api/v1/users/me/activity`

**请求：**
```typescript
// 无请求体，使用JWT自动识别用户
```

**响应：**
```typescript
{
  "success": true,
  "lastActiveAt": "2026-01-11T10:30:00Z"
}
```

**实现：**

```typescript
// apps/backend/src/modules/users/users.controller.ts

import { Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/activity')
  async updateActivity(@CurrentUser() user: User) {
    const updatedUser = await this.usersService.updateLastActive(user.id);
    return {
      success: true,
      lastActiveAt: updatedUser.lastActiveAt,
    };
  }
}
```

**Service 优化：**

```typescript
// apps/backend/src/modules/users/users.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 更新用户最后活跃时间
   * 使用Redis防抖，避免频繁写数据库
   */
  async updateLastActive(userId: string): Promise<User> {
    const cacheKey = `user:last-active:${userId}`;

    // 检查Redis缓存，如果5分钟内已更新则跳过
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Skip updateLastActive for user ${userId} (cached)`);
      return this.prisma.user.findUnique({ where: { id: userId } });
    }

    // 更新数据库
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    // 设置5分钟缓存，防止频繁更新
    await this.redis.set(cacheKey, '1', 300); // 300秒 = 5分钟

    this.logger.log(`Updated lastActiveAt for user ${userId}`);
    return user;
  }
}
```

---

#### 3.1.2 用户画像更新

**端点：** `PATCH /api/v1/users/me/profile`

**请求：**
```typescript
{
  "gender": "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
  "birthYear": 1990,
  "country": "China",
  "region": "Beijing",
  "city": "Beijing",
  "timezone": "Asia/Shanghai",
  "profileConsent": true
}
```

**响应：**
```typescript
{
  "success": true,
  "profile": {
    "gender": "MALE",
    "birthYear": 1990,
    "country": "China",
    "region": "Beijing",
    "city": "Beijing",
    "age": 36,
    "profileCompleteness": 100
  }
}
```

**DTO 定义：**

```typescript
// apps/backend/src/modules/users/dto/update-profile.dto.ts

import { IsEnum, IsInt, IsString, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  profileConsent?: boolean;
}
```

**Controller 实现：**

```typescript
// apps/backend/src/modules/users/users.controller.ts

@Patch('me/profile')
async updateProfile(
  @CurrentUser() user: User,
  @Body() dto: UpdateProfileDto,
) {
  const profile = await this.usersService.updateProfile(user.id, dto);

  return {
    success: true,
    profile: {
      gender: profile.gender,
      birthYear: profile.birthYear,
      country: profile.country,
      region: profile.region,
      city: profile.city,
      age: profile.birthYear ? new Date().getFullYear() - profile.birthYear : null,
      profileCompleteness: this.calculateProfileCompleteness(profile),
    },
  };
}

private calculateProfileCompleteness(profile: UserProfile): number {
  const fields = ['gender', 'birthYear', 'country', 'region', 'city'];
  const filledFields = fields.filter(field => profile[field] != null);
  return Math.round((filledFields.length / fields.length) * 100);
}
```

**Service 实现：**

```typescript
// apps/backend/src/modules/users/users.service.ts

async updateProfile(
  userId: string,
  dto: UpdateProfileDto,
): Promise<UserProfile> {
  // 检查用户是否已有 profile
  const existingProfile = await this.prisma.userProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    // 更新现有 profile
    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...dto,
        profileSource: 'SELF_REPORTED',
        updatedAt: new Date(),
      },
    });
  } else {
    // 创建新 profile
    return this.prisma.userProfile.create({
      data: {
        userId,
        ...dto,
        profileSource: 'SELF_REPORTED',
      },
    });
  }
}
```

---

#### 3.1.3 获取用户画像

**端点：** `GET /api/v1/users/me/profile`

**响应：**
```typescript
{
  "profile": {
    "gender": "MALE",
    "birthYear": 1990,
    "country": "China",
    "region": "Beijing",
    "city": "Beijing",
    "timezone": "Asia/Shanghai",
    "age": 36,
    "profileCompleteness": 100,
    "profileConsent": true
  }
}
```

**实现：**

```typescript
// apps/backend/src/modules/users/users.controller.ts

@Get('me/profile')
async getProfile(@CurrentUser() user: User) {
  const profile = await this.usersService.getProfile(user.id);

  if (!profile) {
    return { profile: null };
  }

  return {
    profile: {
      gender: profile.gender,
      birthYear: profile.birthYear,
      country: profile.country,
      region: profile.region,
      city: profile.city,
      timezone: profile.timezone,
      age: profile.birthYear ? new Date().getFullYear() - profile.birthYear : null,
      profileCompleteness: this.calculateProfileCompleteness(profile),
      profileConsent: profile.profileConsent,
    },
  };
}
```

```typescript
// apps/backend/src/modules/users/users.service.ts

async getProfile(userId: string): Promise<UserProfile | null> {
  return this.prisma.userProfile.findUnique({
    where: { userId },
  });
}
```

---

### 3.2 中间件实现（可选，用于自动更新活跃时间）

如果希望在用户访问任何需要认证的端点时自动更新活跃时间，可以使用中间件：

```typescript
// apps/backend/src/common/middleware/activity-tracker.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class ActivityTrackerMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 如果请求包含用户信息（已认证）
    if (req.user && req.user.id) {
      // 异步更新活跃时间，不阻塞请求
      this.usersService.updateLastActive(req.user.id).catch(err => {
        console.error('Failed to update lastActiveAt:', err);
      });
    }
    next();
  }
}
```

**注册中间件：**

```typescript
// apps/backend/src/app.module.ts

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ActivityTrackerMiddleware } from './common/middleware/activity-tracker.middleware';

@Module({
  // ... imports
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActivityTrackerMiddleware)
      .forRoutes('*'); // 应用于所有路由
  }
}
```

**⚠️ 注意：** 使用中间件会在每次请求时触发更新，但由于有 Redis 防抖（5分钟），实际数据库写入频率是可控的。

---

### 3.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `apps/backend/src/modules/users/users.controller.ts` | API 端点定义 |
| `apps/backend/src/modules/users/users.service.ts` | 业务逻辑实现 |
| `apps/backend/src/modules/users/dto/update-profile.dto.ts` | DTO 定义 |
| `apps/backend/src/common/middleware/activity-tracker.middleware.ts` | 活跃时间中间件（可选） |

---

## 四、iOS 客户端实现

### 4.1 用户活跃时间追踪

#### 4.1.1 API Client 扩展

**文件：** `ios/Readmigo/Network/APIClient.swift`

```swift
// 添加新的端点定义
extension APIEndpoints {
    static let updateActivity = "/users/me/activity"
    static let updateProfile = "/users/me/profile"
    static let getProfile = "/users/me/profile"
}

// 添加新的请求方法
extension APIClient {
    /// 更新用户活跃时间
    func updateUserActivity() async throws {
        let url = baseURL.appendingPathComponent(APIEndpoints.updateActivity)

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        print("✅ Updated user activity")
    }
}
```

#### 4.1.2 应用生命周期集成

**文件：** `ios/Readmigo/ReadmigoApp.swift`

```swift
import SwiftUI

@main
struct ReadmigoApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onReceive(NotificationCenter.default.publisher(
                    for: UIApplication.willEnterForegroundNotification
                )) { _ in
                    // 应用进入前台时更新活跃时间
                    Task {
                        await updateUserActivity()
                    }
                }
                .onReceive(NotificationCenter.default.publisher(
                    for: UIApplication.didBecomeActiveNotification
                )) { _ in
                    // 应用变为活跃状态时更新
                    Task {
                        await updateUserActivity()
                    }
                }
        }
    }

    private func updateUserActivity() async {
        // 只有已登录用户才更新
        guard appState.isAuthenticated else { return }

        do {
            try await APIClient.shared.updateUserActivity()
        } catch {
            print("⚠️ Failed to update activity: \(error)")
            // 静默失败，不影响用户体验
        }
    }
}
```

#### 4.1.3 定时心跳（可选，用于长时间使用场景）

**文件：** `ios/Readmigo/Services/ActivityTracker.swift`

```swift
import Foundation
import Combine

/// 用户活跃时间追踪器
class ActivityTracker: ObservableObject {
    static let shared = ActivityTracker()

    private var timer: Timer?
    private let updateInterval: TimeInterval = 5 * 60 // 5分钟

    private init() {}

    /// 开始追踪
    func startTracking() {
        // 停止已有的定时器
        stopTracking()

        // 立即更新一次
        Task {
            await updateActivity()
        }

        // 启动定时器，每5分钟更新一次
        timer = Timer.scheduledTimer(
            withTimeInterval: updateInterval,
            repeats: true
        ) { [weak self] _ in
            Task {
                await self?.updateActivity()
            }
        }
    }

    /// 停止追踪
    func stopTracking() {
        timer?.invalidate()
        timer = nil
    }

    private func updateActivity() async {
        do {
            try await APIClient.shared.updateUserActivity()
        } catch {
            print("⚠️ ActivityTracker: Failed to update - \(error)")
        }
    }
}

// 在 ReadmigoApp 中使用
.onAppear {
    ActivityTracker.shared.startTracking()
}
.onDisappear {
    ActivityTracker.shared.stopTracking()
}
```

---

### 4.2 用户画像数据收集

#### 4.2.1 Profile 数据模型

**文件：** `ios/Readmigo/Models/UserProfile.swift`

```swift
import Foundation

enum Gender: String, Codable, CaseIterable {
    case male = "MALE"
    case female = "FEMALE"
    case other = "OTHER"
    case preferNotToSay = "PREFER_NOT_TO_SAY"
    case unknown = "UNKNOWN"

    var displayName: String {
        switch self {
        case .male: return String(localized: "Male")
        case .female: return String(localized: "Female")
        case .other: return String(localized: "Other")
        case .preferNotToSay: return String(localized: "Prefer not to say")
        case .unknown: return String(localized: "Unknown")
        }
    }
}

struct UserProfile: Codable {
    let gender: Gender?
    let birthYear: Int?
    let country: String?
    let region: String?
    let city: String?
    let timezone: String?
    let age: Int?
    let profileCompleteness: Int
    let profileConsent: Bool
}

struct UpdateProfileRequest: Codable {
    let gender: Gender?
    let birthYear: Int?
    let country: String?
    let region: String?
    let city: String?
    let timezone: String?
    let profileConsent: Bool
}
```

#### 4.2.2 API Client 扩展

**文件：** `ios/Readmigo/Network/APIClient.swift`

```swift
extension APIClient {
    /// 获取用户画像
    func getUserProfile() async throws -> UserProfile? {
        let url = baseURL.appendingPathComponent(APIEndpoints.getProfile)

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        struct Response: Codable {
            let profile: UserProfile?
        }

        let decoded = try JSONDecoder().decode(Response.self, from: data)
        return decoded.profile
    }

    /// 更新用户画像
    func updateUserProfile(_ profileData: UpdateProfileRequest) async throws -> UserProfile {
        let url = baseURL.appendingPathComponent(APIEndpoints.updateProfile)

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(profileData)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError
        }

        struct Response: Codable {
            let success: Bool
            let profile: UserProfile
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let decoded = try decoder.decode(Response.self, from: data)

        return decoded.profile
    }
}
```

#### 4.2.3 设置页面 - Profile 表单

**文件：** `ios/Readmigo/Features/Settings/ProfileEditView.swift`

```swift
import SwiftUI

struct ProfileEditView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var profile: UserProfile?
    @State private var isLoading = true
    @State private var isSaving = false
    @State private var errorMessage: String?

    // 表单字段
    @State private var selectedGender: Gender = .unknown
    @State private var birthYear: String = ""
    @State private var country: String = ""
    @State private var region: String = ""
    @State private var city: String = ""
    @State private var hasConsent: Bool = false

    var body: some View {
        NavigationView {
            Form {
                // 隐私说明
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "lock.shield.fill")
                                .foregroundColor(.blue)
                            Text("Privacy Protection")
                                .font(.headline)
                        }
                        Text("Your data is used only for improving recommendations and app experience. We never share your personal information with third parties.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                // 性别选择
                Section(header: Text("Gender")) {
                    Picker("Gender", selection: $selectedGender) {
                        ForEach(Gender.allCases.filter { $0 != .unknown }, id: \.self) { gender in
                            Text(gender.displayName).tag(gender)
                        }
                    }
                    .pickerStyle(.menu)
                }

                // 出生年份
                Section(header: Text("Birth Year")) {
                    TextField("e.g., 1990", text: $birthYear)
                        .keyboardType(.numberPad)
                }

                // 地理位置
                Section(header: Text("Location")) {
                    TextField("Country", text: $country)
                    TextField("Region/State", text: $region)
                    TextField("City", text: $city)
                }

                // 同意条款
                Section {
                    Toggle(isOn: $hasConsent) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("I consent to data collection")
                                .font(.body)
                            Text("Help us improve your reading experience")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // 激励提示
                Section {
                    HStack {
                        Image(systemName: "gift.fill")
                            .foregroundColor(.orange)
                        Text("Complete your profile to get **7 days of Premium** for free!")
                            .font(.caption)
                    }
                    .padding(.vertical, 4)
                }

                // 错误提示
                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            await saveProfile()
                        }
                    }
                    .disabled(isSaving || !hasConsent)
                }
            }
            .task {
                await loadProfile()
            }
            .overlay {
                if isLoading {
                    ProgressView()
                }
            }
        }
    }

    private func loadProfile() async {
        isLoading = true
        defer { isLoading = false }

        do {
            profile = try await APIClient.shared.getUserProfile()

            // 填充表单
            if let profile {
                selectedGender = profile.gender ?? .unknown
                birthYear = profile.birthYear.map { String($0) } ?? ""
                country = profile.country ?? ""
                region = profile.region ?? ""
                city = profile.city ?? ""
                hasConsent = profile.profileConsent
            }
        } catch {
            errorMessage = "Failed to load profile: \(error.localizedDescription)"
        }
    }

    private func saveProfile() async {
        isSaving = true
        defer { isSaving = false }

        guard hasConsent else {
            errorMessage = "Please consent to data collection"
            return
        }

        // 验证出生年份
        let birthYearInt: Int?
        if !birthYear.isEmpty {
            guard let year = Int(birthYear), year >= 1900, year <= Calendar.current.component(.year, from: Date()) else {
                errorMessage = "Invalid birth year"
                return
            }
            birthYearInt = year
        } else {
            birthYearInt = nil
        }

        let updateRequest = UpdateProfileRequest(
            gender: selectedGender != .unknown ? selectedGender : nil,
            birthYear: birthYearInt,
            country: country.isEmpty ? nil : country,
            region: region.isEmpty ? nil : region,
            city: city.isEmpty ? nil : city,
            timezone: TimeZone.current.identifier,
            profileConsent: hasConsent
        )

        do {
            let updatedProfile = try await APIClient.shared.updateUserProfile(updateRequest)

            // 检查是否首次完善资料（达到100%）
            if updatedProfile.profileCompleteness == 100 && (profile?.profileCompleteness ?? 0) < 100 {
                // TODO: 触发赠送7天会员的逻辑
                print("🎉 Profile completed! Grant 7-day Premium access")
            }

            dismiss()
        } catch {
            errorMessage = "Failed to save: \(error.localizedDescription)"
        }
    }
}
```

#### 4.2.4 集成到设置页面

**文件：** `ios/Readmigo/Features/Settings/SettingsView.swift`

```swift
// 在 SettingsView 中添加 Profile 入口

Section(header: Text("Account")) {
    NavigationLink(destination: ProfileEditView()) {
        HStack {
            Image(systemName: "person.crop.circle.fill")
                .foregroundColor(.blue)
            VStack(alignment: .leading) {
                Text("Edit Profile")
                if let completeness = profileCompleteness, completeness < 100 {
                    Text("Complete your profile to unlock rewards")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }
            Spacer()
            if let completeness = profileCompleteness {
                Text("\(completeness)%")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}
```

---

### 4.3 本地化支持

**文件：** `ios/Readmigo/Localizable.xcstrings`

```json
{
  "Male": {
    "localizations": {
      "en": { "stringUnit": { "value": "Male" } },
      "zh-Hans": { "stringUnit": { "value": "男性" } }
    }
  },
  "Female": {
    "localizations": {
      "en": { "stringUnit": { "value": "Female" } },
      "zh-Hans": { "stringUnit": { "value": "女性" } }
    }
  },
  "Other": {
    "localizations": {
      "en": { "stringUnit": { "value": "Other" } },
      "zh-Hans": { "stringUnit": { "value": "其他" } }
    }
  },
  "Prefer not to say": {
    "localizations": {
      "en": { "stringUnit": { "value": "Prefer not to say" } },
      "zh-Hans": { "stringUnit": { "value": "不愿透露" } }
    }
  }
}
```

---

### 4.4 文件位置总结

| 文件 | 功能 |
|------|------|
| `ios/Readmigo/Network/APIClient.swift` | API 请求方法 |
| `ios/Readmigo/ReadmigoApp.swift` | 应用生命周期集成 |
| `ios/Readmigo/Services/ActivityTracker.swift` | 定时心跳追踪 |
| `ios/Readmigo/Models/UserProfile.swift` | 数据模型定义 |
| `ios/Readmigo/Features/Settings/ProfileEditView.swift` | Profile 编辑表单 |
| `ios/Readmigo/Features/Settings/SettingsView.swift` | 设置页面集成 |
| `ios/Readmigo/Localizable.xcstrings` | 本地化字符串 |

---

## 五、Web 客户端实现

### 5.1 用户活跃时间追踪

#### 5.1.1 API Client 扩展

**文件：** `apps/web/src/lib/api-client.ts`

```typescript
import { apiClient } from './api-client';

export const activityApi = {
  /**
   * 更新用户活跃时间
   */
  updateActivity: async (): Promise<{ success: boolean; lastActiveAt: string }> => {
    const response = await apiClient.patch('/users/me/activity');
    return response.data;
  },
};

export const profileApi = {
  /**
   * 获取用户画像
   */
  getProfile: async () => {
    const response = await apiClient.get('/users/me/profile');
    return response.data.profile;
  },

  /**
   * 更新用户画像
   */
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await apiClient.patch('/users/me/profile', data);
    return response.data.profile;
  },
};

export interface UpdateProfileRequest {
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  birthYear?: number;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  profileConsent?: boolean;
}

export interface UserProfile {
  gender: string | null;
  birthYear: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  age: number | null;
  profileCompleteness: number;
  profileConsent: boolean;
}
```

#### 5.1.2 Activity Tracker Hook

**文件：** `apps/web/src/hooks/useActivityTracker.ts`

```typescript
import { useEffect, useRef } from 'react';
import { activityApi } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * 自动追踪用户活跃时间
 *
 * 触发条件：
 * 1. 页面加载时立即触发一次
 * 2. 每5分钟触发一次
 * 3. 页面从隐藏变为可见时触发
 */
export function useActivityTracker() {
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const updateActivity = async () => {
    if (!isAuthenticated) return;

    // 防抖：距离上次更新不足5分钟则跳过
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    if (timeSinceLastUpdate < 5 * 60 * 1000) {
      console.log('⏭️ Skip activity update (too soon)');
      return;
    }

    try {
      await activityApi.updateActivity();
      lastUpdateRef.current = now;
      console.log('✅ Updated user activity');
    } catch (error) {
      console.error('⚠️ Failed to update activity:', error);
      // 静默失败，不影响用户体验
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // 清理定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 立即更新一次
    updateActivity();

    // 启动定时器，每5分钟更新一次
    intervalRef.current = setInterval(updateActivity, 5 * 60 * 1000);

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);
}
```

#### 5.1.3 集成到根组件

**文件：** `apps/web/src/app/layout.tsx`

```typescript
'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 自动追踪用户活跃时间
  useActivityTracker();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

### 5.2 用户画像数据收集

#### 5.2.1 Profile 表单组件

**文件：** `apps/web/src/features/settings/components/ProfileForm.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { profileApi, UpdateProfileRequest, UserProfile } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Gift } from 'lucide-react';

const profileSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  birthYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .or(z.literal(null)),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  profileConsent: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: undefined,
      birthYear: null,
      country: '',
      region: '',
      city: '',
      profileConsent: false,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileApi.getProfile();
      setProfile(data);

      if (data) {
        form.reset({
          gender: data.gender || undefined,
          birthYear: data.birthYear || null,
          country: data.country || '',
          region: data.region || '',
          city: data.city || '',
          profileConsent: data.profileConsent,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const updateData: UpdateProfileRequest = {
        gender: data.gender,
        birthYear: data.birthYear || undefined,
        country: data.country || undefined,
        region: data.region || undefined,
        city: data.city || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        profileConsent: data.profileConsent,
      };

      const updatedProfile = await profileApi.updateProfile(updateData);

      // 检查是否首次完善资料
      if (
        updatedProfile.profileCompleteness === 100 &&
        (profile?.profileCompleteness || 0) < 100
      ) {
        setSuccessMessage('🎉 Profile completed! You have unlocked 7 days of Premium!');
      } else {
        setSuccessMessage('✅ Profile updated successfully!');
      }

      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Edit Profile</h2>
        {profile && (
          <p className="text-sm text-muted-foreground">
            Profile Completeness: {profile.profileCompleteness}%
          </p>
        )}
      </div>

      {/* Privacy Notice */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your data is used only for improving recommendations and app experience. We never
          share your personal information with third parties.
        </AlertDescription>
      </Alert>

      {/* Incentive Banner */}
      {profile && profile.profileCompleteness < 100 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Gift className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Complete your profile to get 7 days of Premium for free!</strong>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birth Year */}
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1990"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., China" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region/State</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Beijing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Beijing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Consent */}
          <FormField
            control={form.control}
            name="profileConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I consent to data collection</FormLabel>
                  <FormDescription>
                    Help us improve your reading experience by sharing your profile
                    information.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSaving || !form.watch('profileConsent')}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

#### 5.2.2 集成到设置页面

**文件：** `apps/web/src/app/settings/profile/page.tsx`

```typescript
import { ProfileForm } from '@/features/settings/components/ProfileForm';

export default function ProfilePage() {
  return <ProfileForm />;
}
```

---

### 5.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `apps/web/src/lib/api-client.ts` | API 请求方法 |
| `apps/web/src/hooks/useActivityTracker.ts` | Activity 追踪 Hook |
| `apps/web/src/app/layout.tsx` | 根组件集成 |
| `apps/web/src/features/settings/components/ProfileForm.tsx` | Profile 表单组件 |
| `apps/web/src/app/settings/profile/page.tsx` | Profile 页面路由 |

---

## 六、React Native 客户端实现

### 6.1 用户活跃时间追踪

#### 6.1.1 API Client 扩展

**文件：** `apps/mobile/src/services/api/users.ts`

```typescript
import { apiClient } from './client';

export interface UpdateProfileRequest {
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  birthYear?: number;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  profileConsent?: boolean;
}

export interface UserProfile {
  gender: string | null;
  birthYear: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  age: number | null;
  profileCompleteness: number;
  profileConsent: boolean;
}

export const usersApi = {
  /**
   * 更新用户活跃时间
   */
  updateActivity: async (): Promise<{ success: boolean; lastActiveAt: string }> => {
    const response = await apiClient.patch('/users/me/activity');
    return response.data;
  },

  /**
   * 获取用户画像
   */
  getProfile: async (): Promise<UserProfile | null> => {
    const response = await apiClient.get('/users/me/profile');
    return response.data.profile;
  },

  /**
   * 更新用户画像
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch('/users/me/profile', data);
    return response.data.profile;
  },
};
```

#### 6.1.2 Activity Tracker Hook

**文件：** `apps/mobile/src/hooks/useActivityTracker.ts`

```typescript
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usersApi } from '@/services/api/users';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * 自动追踪用户活跃时间
 *
 * 触发条件：
 * 1. 应用启动时
 * 2. 应用从后台进入前台时
 * 3. 每5分钟触发一次
 */
export function useActivityTracker() {
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const updateActivity = async () => {
    if (!isAuthenticated) return;

    // 防抖：距离上次更新不足5分钟则跳过
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    if (timeSinceLastUpdate < 5 * 60 * 1000) {
      console.log('⏭️ Skip activity update (too soon)');
      return;
    }

    try {
      await usersApi.updateActivity();
      lastUpdateRef.current = now;
      console.log('✅ Updated user activity');
    } catch (error) {
      console.error('⚠️ Failed to update activity:', error);
      // 静默失败，不影响用户体验
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // 清理定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 立即更新一次
    updateActivity();

    // 启动定时器，每5分钟更新一次
    intervalRef.current = setInterval(updateActivity, 5 * 60 * 1000);

    // 监听应用状态变化
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // 从后台进入前台时触发更新
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        updateActivity();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [isAuthenticated]);
}
```

#### 6.1.3 集成到根组件

**文件：** `apps/mobile/src/app/_layout.tsx`

```typescript
import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function RootLayout() {
  // 自动追踪用户活跃时间
  useActivityTracker();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

---

### 6.2 用户画像数据收集

#### 6.2.1 Profile 表单组件

**文件：** `apps/mobile/src/features/settings/screens/ProfileEditScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { usersApi, UpdateProfileRequest, UserProfile } from '@/services/api/users';
import { Shield, Gift } from 'lucide-react-native';

export function ProfileEditScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 表单字段
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [birthYear, setBirthYear] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.getProfile();
      setProfile(data);

      if (data) {
        setGender(data.gender || undefined);
        setBirthYear(data.birthYear ? String(data.birthYear) : '');
        setCountry(data.country || '');
        setRegion(data.region || '');
        setCity(data.city || '');
        setHasConsent(data.profileConsent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!hasConsent) {
      Alert.alert('Error', 'Please consent to data collection');
      return;
    }

    // 验证出生年份
    let birthYearInt: number | undefined;
    if (birthYear) {
      const year = parseInt(birthYear);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        Alert.alert('Error', 'Invalid birth year');
        return;
      }
      birthYearInt = year;
    }

    setIsSaving(true);

    const updateData: UpdateProfileRequest = {
      gender: gender as any,
      birthYear: birthYearInt,
      country: country || undefined,
      region: region || undefined,
      city: city || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      profileConsent: hasConsent,
    };

    try {
      const updatedProfile = await usersApi.updateProfile(updateData);

      // 检查是否首次完善资料
      if (
        updatedProfile.profileCompleteness === 100 &&
        (profile?.profileCompleteness || 0) < 100
      ) {
        Alert.alert(
          '🎉 Congratulations!',
          'Profile completed! You have unlocked 7 days of Premium!',
        );
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }

      // 返回上一页
      // navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <Text className="text-2xl font-bold mb-2">Edit Profile</Text>
        {profile && (
          <Text className="text-sm text-gray-500 mb-4">
            Profile Completeness: {profile.profileCompleteness}%
          </Text>
        )}

        {/* Privacy Notice */}
        <View className="bg-blue-50 p-4 rounded-lg mb-4 flex-row">
          <Shield size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm text-blue-800 flex-1">
            Your data is used only for improving recommendations and app experience. We never
            share your personal information with third parties.
          </Text>
        </View>

        {/* Incentive Banner */}
        {profile && profile.profileCompleteness < 100 && (
          <View className="bg-orange-50 p-4 rounded-lg mb-4 flex-row">
            <Gift size={20} color="#ea580c" />
            <Text className="ml-2 text-sm text-orange-800 flex-1 font-semibold">
              Complete your profile to get 7 days of Premium for free!
            </Text>
          </View>
        )}

        {/* Gender */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Gender</Text>
          <Picker selectedValue={gender} onValueChange={setGender}>
            <Picker.Item label="Select gender" value={undefined} />
            <Picker.Item label="Male" value="MALE" />
            <Picker.Item label="Female" value="FEMALE" />
            <Picker.Item label="Other" value="OTHER" />
            <Picker.Item label="Prefer not to say" value="PREFER_NOT_TO_SAY" />
          </Picker>
        </View>

        {/* Birth Year */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Birth Year</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="e.g., 1990"
            keyboardType="number-pad"
            value={birthYear}
            onChangeText={setBirthYear}
          />
        </View>

        {/* Country */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Country</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="e.g., China"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        {/* Region */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">Region/State</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="e.g., Beijing"
            value={region}
            onChangeText={setRegion}
          />
        </View>

        {/* City */}
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2">City</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="e.g., Beijing"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Consent */}
        <View className="mb-6 border border-gray-300 rounded-lg p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="font-medium mb-1">I consent to data collection</Text>
              <Text className="text-sm text-gray-500">
                Help us improve your reading experience
              </Text>
            </View>
            <Switch value={hasConsent} onValueChange={setHasConsent} />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`p-4 rounded-lg ${
            isSaving || !hasConsent ? 'bg-gray-300' : 'bg-blue-600'
          }`}
          onPress={saveProfile}
          disabled={isSaving || !hasConsent}
        >
          <Text className="text-white text-center font-semibold">
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

#### 6.2.2 集成到设置页面导航

**文件：** `apps/mobile/src/features/settings/screens/SettingsScreen.tsx`

```typescript
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

// 在 SettingsScreen 中添加

<TouchableOpacity
  className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200"
  onPress={() => navigation.navigate('ProfileEdit')}
>
  <View className="flex-1">
    <Text className="font-medium">Edit Profile</Text>
    {profileCompleteness < 100 && (
      <Text className="text-sm text-orange-600">
        Complete your profile to unlock rewards
      </Text>
    )}
  </View>
  {profileCompleteness !== undefined && (
    <Text className="text-sm text-gray-500 mr-2">{profileCompleteness}%</Text>
  )}
  <ChevronRight size={20} color="#9ca3af" />
</TouchableOpacity>
```

---

### 6.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `apps/mobile/src/services/api/users.ts` | API 请求方法 |
| `apps/mobile/src/hooks/useActivityTracker.ts` | Activity 追踪 Hook |
| `apps/mobile/src/app/_layout.tsx` | 根组件集成 |
| `apps/mobile/src/features/settings/screens/ProfileEditScreen.tsx` | Profile 表单页面 |
| `apps/mobile/src/features/settings/screens/SettingsScreen.tsx` | 设置页面集成 |

---

## 七、Android 客户端实现

### 7.1 用户活跃时间追踪

#### 7.1.1 API Service 扩展

**文件：** `android/app/src/main/java/com/readmigo/data/network/ApiService.kt`

```kotlin
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Body

interface ApiService {
    // 现有端点...

    @PATCH("users/me/activity")
    suspend fun updateActivity(): Response<UpdateActivityResponse>

    @GET("users/me/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @PATCH("users/me/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ProfileResponse>
}

data class UpdateActivityResponse(
    val success: Boolean,
    val lastActiveAt: String
)

data class ProfileResponse(
    val profile: UserProfile?
)

data class UserProfile(
    val gender: String?,
    val birthYear: Int?,
    val country: String?,
    val region: String?,
    val city: String?,
    val timezone: String?,
    val age: Int?,
    val profileCompleteness: Int,
    val profileConsent: Boolean
)

data class UpdateProfileRequest(
    val gender: String?,
    val birthYear: Int?,
    val country: String?,
    val region: String?,
    val city: String?,
    val timezone: String?,
    val profileConsent: Boolean?
)
```

#### 7.1.2 Activity Tracker

**文件：** `android/app/src/main/java/com/readmigo/utils/ActivityTracker.kt`

```kotlin
package com.readmigo.utils

import android.content.Context
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.readmigo.data.network.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.isActive
import java.util.concurrent.TimeUnit

/**
 * 用户活跃时间追踪器
 */
class ActivityTracker(
    private val apiService: ApiService
) : LifecycleEventObserver {

    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private var updateJob: Job? = null
    private var lastUpdateTime = 0L
    private val updateInterval = TimeUnit.MINUTES.toMillis(5) // 5分钟

    init {
        // 监听应用生命周期
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
    }

    override fun onStateChanged(source: LifecycleOwner, event: Lifecycle.Event) {
        when (event) {
            Lifecycle.Event.ON_START -> {
                // 应用进入前台
                onAppForeground()
            }
            Lifecycle.Event.ON_STOP -> {
                // 应用进入后台
                onAppBackground()
            }
            else -> {}
        }
    }

    private fun onAppForeground() {
        // 立即更新一次
        updateActivity()

        // 启动定时任务，每5分钟更新一次
        updateJob = scope.launch {
            while (isActive) {
                delay(updateInterval)
                updateActivity()
            }
        }
    }

    private fun onAppBackground() {
        // 停止定时任务
        updateJob?.cancel()
        updateJob = null
    }

    private fun updateActivity() {
        // 防抖：距离上次更新不足5分钟则跳过
        val now = System.currentTimeMillis()
        if (now - lastUpdateTime < updateInterval) {
            android.util.Log.d("ActivityTracker", "⏭️ Skip update (too soon)")
            return
        }

        scope.launch {
            try {
                val response = apiService.updateActivity()
                if (response.isSuccessful) {
                    lastUpdateTime = now
                    android.util.Log.d("ActivityTracker", "✅ Updated user activity")
                } else {
                    android.util.Log.w("ActivityTracker", "⚠️ Failed: ${response.code()}")
                }
            } catch (e: Exception) {
                android.util.Log.e("ActivityTracker", "⚠️ Error updating activity", e)
            }
        }
    }
}
```

#### 7.1.3 集成到 Application

**文件：** `android/app/src/main/java/com/readmigo/ReadmigoApplication.kt`

```kotlin
package com.readmigo

import android.app.Application
import com.readmigo.data.network.ApiService
import com.readmigo.utils.ActivityTracker
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class ReadmigoApplication : Application() {

    @Inject
    lateinit var apiService: ApiService

    private lateinit var activityTracker: ActivityTracker

    override fun onCreate() {
        super.onCreate()

        // 初始化 Activity Tracker
        activityTracker = ActivityTracker(apiService)
    }
}
```

---

### 7.2 用户画像数据收集

#### 7.2.1 Profile ViewModel

**文件：** `android/app/src/main/java/com/readmigo/features/settings/ProfileViewModel.kt`

```kotlin
package com.readmigo.features.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.readmigo.data.network.ApiService
import com.readmigo.data.network.UpdateProfileRequest
import com.readmigo.data.network.UserProfile
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val profile: UserProfile?) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    private val _saveSuccess = MutableStateFlow(false)
    val saveSuccess: StateFlow<Boolean> = _saveSuccess.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading

            try {
                val response = apiService.getProfile()
                if (response.isSuccessful) {
                    _uiState.value = ProfileUiState.Success(response.body()?.profile)
                } else {
                    _uiState.value = ProfileUiState.Error("Failed to load profile")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun saveProfile(
        gender: String?,
        birthYear: Int?,
        country: String?,
        region: String?,
        city: String?,
        profileConsent: Boolean
    ) {
        viewModelScope.launch {
            try {
                val request = UpdateProfileRequest(
                    gender = gender,
                    birthYear = birthYear,
                    country = country?.ifBlank { null },
                    region = region?.ifBlank { null },
                    city = city?.ifBlank { null },
                    timezone = java.util.TimeZone.getDefault().id,
                    profileConsent = profileConsent
                )

                val response = apiService.updateProfile(request)
                if (response.isSuccessful) {
                    _saveSuccess.value = true
                    _uiState.value = ProfileUiState.Success(response.body()?.profile)
                } else {
                    _uiState.value = ProfileUiState.Error("Failed to save profile")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

#### 7.2.2 Profile 编辑界面

**文件：** `android/app/src/main/java/com/readmigo/features/settings/ProfileEditScreen.kt`

```kotlin
package com.readmigo.features.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileEditScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val saveSuccess by viewModel.saveSuccess.collectAsState()

    var gender by remember { mutableStateOf<String?>(null) }
    var birthYear by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var region by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var hasConsent by remember { mutableStateOf(false) }
    var showGenderPicker by remember { mutableStateOf(false) }

    // 加载 profile 数据
    LaunchedEffect(uiState) {
        if (uiState is ProfileUiState.Success) {
            val profile = (uiState as ProfileUiState.Success).profile
            profile?.let {
                gender = it.gender
                birthYear = it.birthYear?.toString() ?: ""
                country = it.country ?: ""
                region = it.region ?: ""
                city = it.city ?: ""
                hasConsent = it.profileConsent
            }
        }
    }

    // 保存成功后返回
    LaunchedEffect(saveSuccess) {
        if (saveSuccess) {
            onNavigateBack()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            viewModel.saveProfile(
                                gender = gender,
                                birthYear = birthYear.toIntOrNull(),
                                country = country,
                                region = region,
                                city = city,
                                profileConsent = hasConsent
                            )
                        },
                        enabled = hasConsent
                    ) {
                        Text("Save")
                    }
                }
            )
        }
    ) { padding ->
        when (uiState) {
            is ProfileUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is ProfileUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (uiState as ProfileUiState.Error).message,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
            is ProfileUiState.Success -> {
                val profile = (uiState as ProfileUiState.Success).profile

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Privacy Notice
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Your data is used only for improving recommendations and app experience. We never share your personal information with third parties.",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }

                    // Incentive Banner
                    if (profile != null && profile.profileCompleteness < 100) {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.tertiaryContainer
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Gift,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.tertiary
                                )
                                Text(
                                    text = "Complete your profile to get 7 days of Premium for free!",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Gender
                    OutlinedButton(
                        onClick = { showGenderPicker = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = when (gender) {
                                "MALE" -> "Male"
                                "FEMALE" -> "Female"
                                "OTHER" -> "Other"
                                "PREFER_NOT_TO_SAY" -> "Prefer not to say"
                                else -> "Select Gender"
                            }
                        )
                    }

                    // Birth Year
                    OutlinedTextField(
                        value = birthYear,
                        onValueChange = { birthYear = it },
                        label = { Text("Birth Year") },
                        placeholder = { Text("e.g., 1990") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Country
                    OutlinedTextField(
                        value = country,
                        onValueChange = { country = it },
                        label = { Text("Country") },
                        placeholder = { Text("e.g., China") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Region
                    OutlinedTextField(
                        value = region,
                        onValueChange = { region = it },
                        label = { Text("Region/State") },
                        placeholder = { Text("e.g., Beijing") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // City
                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City") },
                        placeholder = { Text("e.g., Beijing") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Consent
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "I consent to data collection",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Help us improve your reading experience",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = hasConsent,
                                onCheckedChange = { hasConsent = it }
                            )
                        }
                    }
                }
            }
        }
    }

    // Gender Picker Dialog
    if (showGenderPicker) {
        AlertDialog(
            onDismissRequest = { showGenderPicker = false },
            title = { Text("Select Gender") },
            text = {
                Column {
                    listOf(
                        "MALE" to "Male",
                        "FEMALE" to "Female",
                        "OTHER" to "Other",
                        "PREFER_NOT_TO_SAY" to "Prefer not to say"
                    ).forEach { (value, label) ->
                        TextButton(
                            onClick = {
                                gender = value
                                showGenderPicker = false
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(label)
                        }
                    }
                }
            },
            confirmButton = {}
        )
    }
}
```

---

### 7.3 文件位置总结

| 文件 | 功能 |
|------|------|
| `android/app/src/main/java/com/readmigo/data/network/ApiService.kt` | API 接口定义 |
| `android/app/src/main/java/com/readmigo/utils/ActivityTracker.kt` | Activity 追踪器 |
| `android/app/src/main/java/com/readmigo/ReadmigoApplication.kt` | Application 集成 |
| `android/app/src/main/java/com/readmigo/features/settings/ProfileViewModel.kt` | ViewModel |
| `android/app/src/main/java/com/readmigo/features/settings/ProfileEditScreen.kt` | Profile 编辑界面 |

---

## 八、数据库优化

### 8.1 索引优化

为了支持高效的 DAU/MAU 查询，需要在 `users.last_active_at` 字段上添加索引：

**文件：** `packages/database/prisma/schema.prisma`

```prisma
model User {
  id           String    @id @default(uuid()) @db.Uuid
  // ... 其他字段
  lastActiveAt DateTime? @map("last_active_at")
  // ... 其他字段

  @@index([lastActiveAt]) // 添加索引，优化活跃用户查询
  @@map("users")
}
```

**迁移文件：** `packages/database/prisma/migrations/20260112_add_last_active_at_index/migration.sql`

```sql
-- 为 last_active_at 字段添加索引
CREATE INDEX "users_last_active_at_idx" ON "users"("last_active_at");
```

### 8.2 复合索引优化（用于渠道分析）

如果需要按渠道分析活跃用户，可以添加复合索引：

```prisma
model User {
  id              String    @id @default(uuid()) @db.Uuid
  registrationSource String? @map("registration_source") @db.VarChar(50)
  lastActiveAt    DateTime? @map("last_active_at")

  @@index([registrationSource, lastActiveAt]) // 复合索引
  @@index([lastActiveAt]) // 单字段索引
  @@map("users")
}
```

---

## 九、测试方案

### 9.1 后端 API 测试

**文件：** `apps/backend/src/modules/users/__tests__/users.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from '@prisma/client';

describe('UsersController - Activity & Profile', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    lastActiveAt: new Date('2026-01-10'),
    // ... 其他字段
  };

  const mockUsersService = {
    updateLastActive: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('updateActivity', () => {
    it('should update user activity and return lastActiveAt', async () => {
      const updatedUser = { ...mockUser, lastActiveAt: new Date() };
      mockUsersService.updateLastActive.mockResolvedValue(updatedUser);

      const result = await controller.updateActivity(mockUser);

      expect(result.success).toBe(true);
      expect(result.lastActiveAt).toBeDefined();
      expect(mockUsersService.updateLastActive).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        userId: mockUser.id,
        gender: 'MALE',
        birthYear: 1990,
        country: 'China',
        profileConsent: true,
      };
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockUser);

      expect(result.profile).toBeDefined();
      expect(result.profile.gender).toBe('MALE');
      expect(result.profile.age).toBe(36); // 2026 - 1990
    });

    it('should return null if profile does not exist', async () => {
      mockUsersService.getProfile.mockResolvedValue(null);

      const result = await controller.getProfile(mockUser);

      expect(result.profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return updated data', async () => {
      const updateDto = {
        gender: 'FEMALE',
        birthYear: 1995,
        country: 'USA',
        profileConsent: true,
      };

      const updatedProfile = {
        userId: mockUser.id,
        ...updateDto,
      };
      mockUsersService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result.success).toBe(true);
      expect(result.profile.gender).toBe('FEMALE');
      expect(result.profile.age).toBe(31); // 2026 - 1995
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateDto);
    });
  });
});
```

---

### 9.2 客户端集成测试

#### iOS 测试

**文件：** `ios/ReadmigoTests/ActivityTrackerTests.swift`

```swift
import XCTest
@testable import Readmigo

class ActivityTrackerTests: XCTestCase {
    var tracker: ActivityTracker!

    override func setUp() {
        super.setUp()
        tracker = ActivityTracker.shared
    }

    func testStartTracking() {
        tracker.startTracking()
        // 验证定时器启动
        XCTAssertNotNil(tracker.timer)
    }

    func testStopTracking() {
        tracker.startTracking()
        tracker.stopTracking()
        // 验证定时器停止
        XCTAssertNil(tracker.timer)
    }

    func testUpdateActivityDebounce() async {
        // 首次更新应该成功
        await tracker.updateActivity()

        // 5分钟内的第二次更新应该被跳过
        await tracker.updateActivity()

        // 验证只调用了一次 API
        // (需要 mock APIClient)
    }
}
```

---

### 9.3 端到端测试场景

| 测试场景 | 预期结果 |
|---------|---------|
| 用户登录后打开应用 | `lastActiveAt` 更新为当前时间 |
| 应用在前台停留10分钟 | `lastActiveAt` 至少更新2次（5分钟间隔） |
| 应用进入后台再返回前台 | `lastActiveAt` 更新 |
| 用户完善 Profile 并保存 | `user_profiles` 表插入/更新数据 |
| Profile 完成度达到100% | 触发赠送7天会员 |
| 未同意数据收集 | 无法保存 Profile |

---

## 十、部署计划

### 10.1 部署阶段

| 阶段 | 任务 | 预计时间 |
|------|------|---------|
| **阶段1** | 后端 API 开发 + 数据库迁移 | 2天 |
| **阶段2** | iOS 客户端实现 | 2天 |
| **阶段3** | Web 客户端实现 | 1天 |
| **阶段4** | React Native 客户端实现 | 1天 |
| **阶段5** | Android 客户端实现 | 2天 |
| **阶段6** | 测试 + Bug 修复 | 2天 |
| **阶段7** | 生产部署 + 监控 | 1天 |

**总计：** 10-12 天

---

### 10.2 部署步骤

#### Step 1: 后端部署

```bash
# 1. 创建数据库迁移
cd packages/database
pnpm prisma migrate dev --name add_activity_and_profile_apis

# 2. 提交代码
git add .
git commit -m "feat(users): add activity tracking and profile management APIs"
git push

# 3. GitHub Actions 自动部署到 Fly.io
# 4. 验证迁移成功
flyctl ssh console --app readmigo-api
cd /app/packages/database && npx prisma migrate status
```

#### Step 2: 客户端部署

**iOS:**
```bash
# 1. 本地测试
cd ios
xcodebuild -scheme Readmigo -destination 'platform=iOS Simulator,name=iPhone 15' test

# 2. TestFlight 发布
# 在 Xcode 中 Archive 并上传到 App Store Connect

# 3. 增量发布（先 5% 用户）
```

**Web:**
```bash
# 1. 本地测试
cd apps/web
pnpm build

# 2. 部署到 Vercel
git push # 自动触发 Vercel 部署
```

**React Native:**
```bash
# 1. 更新 OTA
cd apps/mobile
eas update --branch production

# 2. 新版本发布（如果有原生代码变更）
eas build --platform all
```

**Android:**
```bash
# 1. 本地测试
cd android
./gradlew test

# 2. 发布到 Google Play（内部测试）
./gradlew bundleRelease
# 上传到 Google Play Console
```

---

### 10.3 灰度发布策略

| 阶段 | 用户比例 | 监控指标 | 持续时间 |
|------|---------|---------|---------|
| 阶段1 | 5% | 错误率、API 成功率 | 1天 |
| 阶段2 | 25% | DAU 数据准确性 | 2天 |
| 阶段3 | 50% | 用户画像数据收集率 | 2天 |
| 阶段4 | 100% | 全量监控 | - |

**回滚条件：**
- 错误率 > 1%
- API 成功率 < 99%
- 用户投诉激增

---

## 十一、监控与验证

### 11.1 关键监控指标

| 指标 | 数据源 | 阈值 | 告警 |
|------|--------|------|------|
| Activity API 成功率 | Fly.io logs | > 99% | < 99% 告警 |
| Profile API 成功率 | Fly.io logs | > 99% | < 99% 告警 |
| `lastActiveAt` 更新率 | Database | > 90% DAU | < 90% 告警 |
| Profile 完成率 | Database | 逐步提升 | 持续监控 |
| Redis 缓存命中率 | Redis metrics | > 80% | < 80% 告警 |

---

### 11.2 数据验证查询

**验证 lastActiveAt 更新：**

```sql
-- 查看今日活跃用户数（lastActiveAt 在过去24小时）
SELECT COUNT(*) as dau
FROM users
WHERE last_active_at >= NOW() - INTERVAL '24 hours';

-- 查看最近7天活跃用户数
SELECT COUNT(*) as wau
FROM users
WHERE last_active_at >= NOW() - INTERVAL '7 days';

-- 查看最近30天活跃用户数
SELECT COUNT(*) as mau
FROM users
WHERE last_active_at >= NOW() - INTERVAL '30 days';
```

**验证 Profile 数据：**

```sql
-- 查看 Profile 完成率分布
SELECT
  CASE
    WHEN gender IS NOT NULL AND birth_year IS NOT NULL AND country IS NOT NULL
         AND region IS NOT NULL AND city IS NOT NULL THEN '100%'
    WHEN gender IS NOT NULL OR birth_year IS NOT NULL OR country IS NOT NULL THEN '20-80%'
    ELSE '0%'
  END as completeness,
  COUNT(*) as user_count
FROM user_profiles
GROUP BY completeness;

-- 查看各性别用户数
SELECT gender, COUNT(*) as count
FROM user_profiles
GROUP BY gender;

-- 查看年龄分布
SELECT
  CASE
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year < 18 THEN 'Under 18'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 18 AND 24 THEN '18-24'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 25 AND 34 THEN '25-34'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 35 AND 44 THEN '35-44'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 45 AND 54 THEN '45-54'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year >= 55 THEN '55+'
    ELSE 'Unknown'
  END as age_range,
  COUNT(*) as count
FROM user_profiles
WHERE birth_year IS NOT NULL
GROUP BY age_range;
```

---

### 11.3 Sentry 监控配置

**后端错误追踪：**

```typescript
// apps/backend/src/modules/users/users.service.ts

import * as Sentry from '@sentry/node';

async updateLastActive(userId: string): Promise<User> {
  try {
    // ... 业务逻辑
  } catch (error) {
    Sentry.captureException(error, {
      tags: { module: 'users', action: 'updateLastActive' },
      user: { id: userId },
    });
    throw error;
  }
}
```

**客户端错误追踪：**

```swift
// iOS
import Sentry

func updateUserActivity() async {
    do {
        try await APIClient.shared.updateUserActivity()
    } catch {
        SentrySDK.capture(error: error) { scope in
            scope.setTag(value: "activity_tracker", key: "module")
        }
    }
}
```

---

## 十二、总结

### 完成后的效果

1. ✅ **DAU/MAU 统计准确** - 每次用户打开应用时更新 lastActiveAt
2. ✅ **用户留存分析可靠** - 基于准确的活跃时间计算留存率
3. ✅ **用户画像数据完整** - 收集性别、年龄、地理位置信息
4. ✅ **Demographics 页面有数据** - 展示用户分布和趋势
5. ✅ **用户激励机制** - 完善 Profile 赠送7天会员

### 关键成功因素

- **Redis 防抖** - 避免频繁更新数据库，降低负载
- **静默失败** - 数据上报失败不影响用户体验
- **隐私保护** - 明确告知用户数据用途，可选退出
- **渐进式发布** - 灰度发布确保稳定性
- **全平台覆盖** - iOS、Web、React Native、Android 全部实现

### 后续优化方向

1. **地理位置自动识别** - 使用 IP 地址自动填充国家/地区
2. **Profile 完成度奖励** - 完善不同字段给予不同奖励
3. **数据分析深化** - 基于用户画像优化推荐算法
4. **A/B 测试** - 测试不同激励方式对完成率的影响

---

**文档版本：** v1.0
**最后更新：** 2026-01-11
**作者：** Readmigo 开发团队
