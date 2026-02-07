# Cloudflare R2 存储详解

> 对象存储服务 - Readmigo 文件资源管理

---

## 1. 服务概览

| 项目 | 值 |
|------|-----|
| 服务商 | Cloudflare R2 (S3 兼容) |
| 协议 | S3 API |
| 存储费用 | $0.015/GB/月 |
| Class A 操作 (写) | $4.50/百万次 |
| Class B 操作 (读) | $0.36/百万次 |
| 出站流量 | 免费 |

核心特性:

| 特性 | 说明 |
|------|------|
| S3 兼容 API | 标准接口 |
| 零出站费用 | 降低成本 |
| 全球边缘分发 | 低延迟访问 |
| 自定义域名 | cdn.readmigo.app |

---

## 2. Bucket 配置

| Bucket | 用途 | 说明 |
|--------|------|------|
| readmigo-production | 生产环境 | 真实用户数据和书籍资源 |
| readmigo-dev | 开发环境 | 本地开发测试 |

---

## 3. 存储目录结构

| 路径 | 说明 |
|------|------|
| books/{bookId}/cover.jpg | 原始封面 |
| books/{bookId}/cover-thumb.jpg | 封面缩略图 |
| books/{bookId}/book.epub | EPUB 文件 |
| books/{bookId}/chapters/{chapterId}.html | 章节 HTML |
| books/{bookId}/translations/{locale}/chapters/{chapterId}.json | 章节翻译 |
| users/{userId}/avatar.jpg | 用户头像 |
| users/{userId}/postcards/{postcardId}.png | 用户明信片 |

---

## 4. 访问方式

| 访问方式 | 域名 | 用途 |
|----------|------|------|
| 公开 CDN | cdn.readmigo.app | 封面、EPUB 等公开资源 |
| S3 API | 通过环境变量配置 | 后端上传/管理 |

---

## 5. 环境变量

| 变量 | 说明 |
|------|------|
| R2_ACCOUNT_ID | Cloudflare Account ID |
| R2_ACCESS_KEY_ID | API Token Access Key |
| R2_SECRET_ACCESS_KEY | API Token Secret Key |
| R2_BUCKET_NAME | Bucket 名称 |
| R2_PUBLIC_URL | 公开访问 URL |

---

## 6. 成本估算

| 指标 | 当前估算 |
|------|----------|
| 存储量 | ~10GB |
| 月存储费用 | ~$0.15 |
| 月操作费用 | ~$0.41 |

---

## 7. 相关文档

| 文档 | 说明 |
|------|------|
| [storage-setup.md](./storage-setup.md) | R2 配置步骤指南 |
| [cloudflare.md](../deployment/services/cloudflare.md) | Cloudflare 服务总览 |

---

*最后更新: 2026-02-07*
