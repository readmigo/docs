# 版本迁移指南

## 多版本共存架构

Readmigo 支持同时运行最多 **10 个主版本**，每个版本独立部署和维护。

## 架构概览

```
┌──────────────────────────────────────────────────────────────────┐
│                      多版本共存架构                               │
├────────┬──────────────────────┬────────────────┬─────────────────┤
│ 版本   │ 客户端版本           │ API 域名        │ Fly.io 应用     │
├────────┼──────────────────────┼────────────────┼─────────────────┤
│ V1     │ 1.0.0 - 1.99.99     │ v1.api.*       │ readmigo-v1     │
│ V2     │ 2.0.0 - 2.99.99     │ v2.api.*       │ readmigo-v2     │
│ V3     │ 3.0.0 - 3.99.99     │ v3.api.*       │ readmigo-v3     │
│ ...    │ ...                 │ ...            │ ...             │
│ V10    │ 10.0.0 - 10.99.99   │ v10.api.*      │ readmigo-v10    │
├────────┼──────────────────────┼────────────────┼─────────────────┤
│ 最新版 │ 自动跳转              │ api.*          │ CNAME → 最新版  │
└────────┴──────────────────────┴────────────────┴─────────────────┘

* = readmigo.app
```

## V1 → V2 迁移步骤

### 阶段 0: V1 部署（当前）

```bash
# 已完成
✅ readmigo-v1 部署
✅ Git 分支: release/v1
✅ iOS v1.x 客户端
✅ DNS: v1.api.readmigo.app → readmigo-v1
```

### 阶段 1: V2 开发准备

1. **创建 V2 分支**
   ```bash
   git checkout -b release/v2
   git tag v2.0.0
   ```

2. **更新版本号**
   ```bash
   # version.json
   {
     "version": "2.0.0",
     "buildNumber": 1
   }

   # iOS Info.plist
   CFBundleShortVersionString: 2.0.0
   ```

3. **创建 V2 配置文件**
   ```bash
   # 复制并修改
   cp fly.v1.toml fly.v2.toml

   # 修改 app 名称
   app = "readmigo-v2"

   # 修改环境变量
   API_VERSION = "v2"
   SENTRY_ENVIRONMENT = "production-v2"
   ```

4. **创建 V2 CI/CD**
   ```bash
   cp .github/workflows/deploy-v1.yml .github/workflows/deploy-v2.yml

   # 修改分支和应用名
   branches: [release/v2]
   app: readmigo-v2
   ```

### 阶段 2: V2 后端部署

1. **创建 Fly.io 应用**
   ```bash
   fly apps create readmigo-v2
   ```

2. **配置 Secrets**
   ```bash
   # 复制 V1 secrets 或使用独立配置
   fly secrets set \
     DATABASE_URL="..." \
     API_VERSION="v2" \
     -a readmigo-v2
   ```

3. **部署 V2**
   ```bash
   fly deploy -c fly.v2.toml
   ```

4. **健康检查**
   ```bash
   curl https://readmigo-v2.fly.dev/api/v2/health
   ```

### 阶段 3: DNS 配置

在 Cloudflare 添加 V2 域名：

| 类型 | 名称 | 目标 | 代理 | 说明 |
|------|------|------|------|------|
| A | v1.api | 66.241.124.49 | DNS only | V1 后端 |
| A | v2.api | (V2 新 IP) | DNS only | V2 后端 |
| CNAME | api | v2.api.readmigo.app | DNS only | 指向最新版 |

### 阶段 4: iOS V2 发布

1. **构建 V2 App**
   ```bash
   # 确保版本号是 2.0.0
   xcodebuild -project ios/Readmigo.xcodeproj \
              -scheme Readmigo \
              archive
   ```

2. **提交 App Store**
   - Version: 2.0.0
   - What's New: 列出 V2 新特性

3. **TestFlight 测试**
   - 验证 v2.api.readmigo.app 连接
   - 验证所有功能

### 阶段 5: V1 维护期

```
时间线：
  T+0: V2 发布到 App Store
  T+1周: 监控 V2 稳定性
  T+1月: V1 进入 maintenance 模式
  T+3月: V1 标记为 deprecated
  T+6月: V1 进入 sunset，强制升级
  T+9月: 关闭 readmigo-v1
```

**版本生命周期管理**：

```typescript
// apps/backend/src/common/config/version.config.ts

export const VERSION_CONFIG: VersionInfo[] = [
  {
    version: 1,
    domain: 'v1.api.readmigo.app',
    flyApp: 'readmigo-v1',
    minClientVersion: '1.0.0',
    deprecated: false,        // T+0
    // deprecated: true,      // T+3月
    // status: 'sunset',      // T+6月
    // sunsetDate: '2027-XX-XX',
    status: 'active',
  },
  {
    version: 2,
    domain: 'v2.api.readmigo.app',
    flyApp: 'readmigo-v2',
    minClientVersion: '2.0.0',
    deprecated: false,
    status: 'active',
  },
];
```

## 版本生命周期状态

| 状态 | 说明 | 用户体验 | 操作 |
|------|------|---------|------|
| **active** | 当前活跃版本 | 正常使用 | 全功能支持 |
| **maintenance** | 维护模式 | 正常使用 | 仅关键 bug 修复 |
| **deprecated** | 已弃用 | 提示升级 | 显示"建议升级"横幅 |
| **sunset** | 即将下线 | 强制升级 | 返回 426 状态码 |

## 数据库策略

### 选项 1: 共享数据库（推荐启动阶段）
```
V1 + V2 → 同一个 Neon 数据库
- 优点: 简单，数据一致
- 缺点: 需要向后兼容迁移
```

### 选项 2: 独立数据库分支
```
V1 → db-v1 (Neon 分支)
V2 → db-v2 (Neon 分支)
- 优点: 完全隔离，可独立演进
- 缺点: 需要数据迁移工具
```

## 存储策略

### R2 存储
```
共享同一个 R2 桶: readmigo-production
- 文件路径按资源 ID 组织，版本无关
- 如需隔离: 使用不同的桶前缀
```

## 监控和告警

### 版本使用统计
```typescript
// 在后端记录版本使用情况
{
  "v1": {
    "activeUsers": 1000,
    "requests": 50000,
    "errorRate": 0.01
  },
  "v2": {
    "activeUsers": 500,
    "requests": 25000,
    "errorRate": 0.02
  }
}
```

### 升级率监控
```
目标:
- 2周内: 30% 用户升级到 V2
- 1月内: 60% 用户升级到 V2
- 3月内: 90% 用户升级到 V2
```

## 成本估算

```
每个版本成本:
- Fly.io: $5-20/月 (按使用量)
- Neon 分支: $0 (共享配额)
- 总计: 10 个版本 ≈ $50-200/月
```

## 回滚策略

如果 V2 出现重大问题：

```bash
# 1. DNS 快速切换
# 将 api.readmigo.app 指向 v1.api

# 2. 下架 V2 App
# 在 App Store Connect 移除 v2.x 版本

# 3. 修复 V2 bug
git checkout release/v2
# 修复...
fly deploy -c fly.v2.toml

# 4. 重新发布
# 提交修复后的 v2.x.x 到 App Store
```

## FAQ

### Q: 用户如何知道要升级？
A:
1. App Store 自动提示更新
2. App 内显示"新版本可用"横幅（deprecated 状态）
3. 强制升级弹窗（sunset 状态）

### Q: V1 用户可以一直使用吗？
A: 可以在维护期内使用，但最终会强制升级（通常 6-9 个月后）

### Q: 如何测试多版本共存？
A:
```bash
# 同时运行多个版本
fly logs -a readmigo-v1
fly logs -a readmigo-v2

# 测试不同客户端
curl -H "X-App-Version: 1.0.0" https://v1.api.readmigo.app/api/v1/health
curl -H "X-App-Version: 2.0.0" https://v2.api.readmigo.app/api/v2/health
```

### Q: 如何处理跨版本数据迁移？
A: 创建迁移脚本：
```typescript
// scripts/migrate-v1-to-v2.ts
// 1. 读取 V1 用户数据
// 2. 转换为 V2 格式
// 3. 写入 V2 数据库
```

## 下一步

- [ ] 完成 V1 DNS 配置
- [ ] 提交 V1 到 App Store
- [ ] 规划 V2 功能
- [ ] 准备 V2 开发环境
