# R2 文件版本管理策略

> 解决多版本间文件重复问题，以 V1→V2（新增有声书）为例

---

## 一、问题分析

### 1.1 简单方案的问题


### 1.2 V1 与 V2 的内容差异

| 内容类型 | V1 | V2 | 差异 |
|----------|-----|-----|------|
| 电子书 | 300 本 | 300 本 | 相同 |
| 作者 | 100 位 | 100 位 | 相同 |
| 封面图 | 300 张 | 300 张 | 相同 |
| 有声书 | 0 本 | 150 本 | **新增** |
| 音频文件 | 0 | ~15GB | **新增** |

---

## 二、推荐方案：共享存储 + 版本清单

### 2.1 核心思路

```mermaid
flowchart TD
    R2["R2 Bucket (readmigo) - 单一存储源<br>/epubs/ (所有版本共享)<br>/covers/ (所有版本共享)<br>/authors/ (所有版本共享)<br>/audiobooks/ (V2+ 使用)<br>/manifests/ (版本清单文件)"]
    A["iOS v1.0.x"]
    B["iOS v1.1.x"]
    C["iOS v2.0.x"]
    MA["读取 v1.0.0 manifest"]
    MB["读取 v1.1.0 manifest"]
    MC["读取 v2.0.0 manifest"]

    R2 --> A
    R2 --> B
    R2 --> C
    A --> MA
    B --> MB
    C --> MC
```

### 2.2 目录结构设计


### 2.3 版本清单文件结构


---

## 三、版本控制流程

### 3.1 数据流向

```mermaid
flowchart TD
    A["Debug 环境<br>readmigo-debug bucket<br>epubs/ (所有测试书籍)<br>audiobooks/ (所有测试音频)<br>无版本控制，自由添加/删除"]
    B["Staging 环境<br>readmigo-staging bucket<br>与 Production 结构相同<br>manifests/v1.0.0-rc1.json (候选版本)<br>验证通过后升级为 release"]
    C["Production 环境<br>readmigo bucket<br>manifests/v1.0.0.json (正式版本)<br>文件一旦写入，只增不删<br>通过 manifest 控制可见性"]

    A -- "sync-to-staging.ts<br>(按书单同步指定内容)" --> B
    B -- "promote-to-production.ts<br>(仅复制新增/变更文件)" --> C
```

### 3.2 客户端版本绑定

```mermaid
flowchart TD
    A["iOS App 启动"]
    B["GET /api/v1/version/check<br>Request: appVersion: 1.0.0, platform: ios"]
    C["服务端返回对应的 manifest 版本<br>manifestVersion: v1.0.0<br>manifestUrl: https://cdn.../manifests/v1.0.0.json<br>features: audiobooks: false"]
    D["客户端根据 manifest 决定：<br>- 可显示的书籍列表<br>- 是否显示有声书入口<br>- 文件访问路径"]

    A --> B --> C --> D
```

---

## 四、V1 → V2 升级推演（新增有声书）

### 4.1 升级前状态 (V1.0.0)

| 资源类型 | R2 文件 | 大小 | 状态 |
|----------|---------|------|------|
| EPUB 文件 | 300 个 | ~150MB | 已发布 |
| 书籍封面 | 300 张 | ~60MB | 已发布 |
| 作者头像 | 100 张 | ~20MB | 已发布 |
| 有声书音频 | 0 | 0 | 不存在 |
| **总计** | | **~230MB** | |

### 4.2 升级目标 (V2.0.0)

| 资源类型 | R2 文件 | 大小 | 变化 |
|----------|---------|------|------|
| EPUB 文件 | 300 个 | ~150MB | **复用** |
| 书籍封面 | 300 张 | ~60MB | **复用** |
| 作者头像 | 100 张 | ~20MB | **复用** |
| 有声书音频 | 150 本 × 10章 | ~15GB | **新增** |
| 有声书封面 | 150 张 | ~30MB | **新增** |
| **总计** | | **~15.26GB** | |

### 4.3 执行计划


### 4.4 文件同步详情


---

## 五、向后兼容保证

### 5.1 多版本客户端并存

```mermaid
flowchart TD
    R2["Production R2 + API"]
    V1["iOS 1.x"]
    V2["iOS 2.x"]
    M1["读取 manifest v1.0.0.json"]
    M2["读取 manifest v2.0.0.json"]
    C1["可访问内容:<br>300 电子书 / 100 作者 / 0 有声书<br>R2 文件: epubs/* covers/* authors/*"]
    C2["可访问内容:<br>300 电子书 / 100 作者 / 150 有声书<br>R2 文件: epubs/* covers/* authors/* audiobooks/*"]

    R2 --> V1
    R2 --> V2
    V1 --> M1 --> C1
    V2 --> M2 --> C2
```

### 5.2 API 版本映射

| 客户端版本 | API 版本 | Manifest 版本 | 有声书功能 |
|------------|----------|---------------|------------|
| iOS 1.0.x | /api/v1 | v1.0.0.json | 禁用 |
| iOS 1.1.x | /api/v1 | v1.1.0.json | 禁用 |
| iOS 2.0.x | /api/v1 | v2.0.0.json | 启用 |
| iOS 2.1.x | /api/v1 | v2.1.0.json | 启用 |

### 5.3 功能开关配置


---

## 六、文件修复与热更新

### 6.1 单文件修复流程

```mermaid
flowchart TD
    A["发现问题<br>book-042.epub 章节解析错误"]
    B["Debug 环境修复<br>修复 EPUB 文件<br>重新解析章节"]
    C["直接更新 Prod<br>覆盖 Production R2 的单个文件<br>epubs/hash.epub"]
    D["无需更新 manifest<br>文件引用的 key 不变<br>客户端自动获取新文件"]

    A --> B --> C -- "文件 key 不变，内容更新<br>CDN 缓存: 等待过期或手动 purge" --> D
```

### 6.2 批量更新与版本升级

| 场景 | 处理方式 | 是否需要新 manifest |
|------|----------|-------------------|
| 修复单个 EPUB | 直接覆盖文件 | 否 |
| 修复多个封面 | 直接覆盖文件 | 否 |
| 新增 50 本书 | 添加文件 + 更新 manifest | 是 (v1.1.0) |
| 新增有声书功能 | 添加文件 + 新 manifest | 是 (v2.0.0) |
| 删除某本书 | 更新 manifest 移除引用 | 是 |

---

## 七、存储成本优化

### 7.1 各版本存储占用

| 版本 | 新增内容 | 新增存储 | 累计存储 |
|------|----------|----------|----------|
| V1.0.0 | 300 电子书 + 100 作者 | ~230MB | ~230MB |
| V1.1.0 | +200 电子书 | ~150MB | ~380MB |
| V2.0.0 | +150 有声书 | ~15GB | ~15.4GB |
| V2.1.0 | +50 有声书 | ~5GB | ~20.4GB |

### 7.2 成本对比


### 7.3 月度成本估算

| 阶段 | 存储量 | 存储费用 | 出站流量 | 流量费用 | 总计 |
|------|--------|----------|----------|----------|------|
| V1 发布 | 1GB | $0.015 | 50GB | $0 | ~$0.02 |
| V2 发布 | 20GB | $0.30 | 500GB | $0 | ~$0.35 |
| V2 成熟 | 50GB | $0.75 | 2TB | $0 | ~$0.80 |

> R2 出站流量免费是核心优势

---

## 八、执行检查清单

### 8.1 V2 发布前检查


---

*文档版本: 1.0*
*创建日期: 2025-12-31*
*关联文档: v1-fullstack-release-plan.md*
