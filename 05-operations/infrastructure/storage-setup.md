# Cloudflare R2 Storage Setup Guide

> R2 对象存储配置指南

---

## 概述

Readmigo 使用 Cloudflare R2 存储:

| 内容类型 | 说明 |
|----------|------|
| Book EPUB files | 电子书文件 |
| Book cover images | 封面图片 |
| Chapter HTML content | 章节内容 |
| User-generated content | 明信片等 |

---

## 配置步骤

### Step 1: 创建 R2 Bucket

| 步骤 | 操作 |
|------|------|
| 1 | 登录 Cloudflare Dashboard |
| 2 | 导航到 R2 Object Storage |
| 3 | 点击 Create bucket |
| 4 | 输入 bucket 名称 |
| 5 | 选择区域 (可选) |

### Step 2: 创建 API Token

| 配置 | 值 |
|------|-----|
| Token name | readmigo-backend |
| Permissions | Object Read & Write |
| Bucket scope | 指定 bucket 名称 |

> 创建后立即复制 Access Key ID 和 Secret Access Key，之后无法再次查看。

### Step 3: 获取 Account ID

从 Cloudflare Dashboard URL 中获取 32 位 Account ID。

### Step 4: 配置自定义域名 (推荐)

| 配置 | 值 |
|------|-----|
| 域名 | cdn.readmigo.app |
| 用途 | 公开资源 CDN 访问 |

### Step 5: 配置环境变量

| 变量 | 说明 |
|------|------|
| R2_ACCOUNT_ID | Cloudflare Account ID |
| R2_ACCESS_KEY_ID | API Token Access Key |
| R2_SECRET_ACCESS_KEY | API Token Secret Key |
| R2_BUCKET_NAME | Bucket 名称 |
| R2_PUBLIC_URL | 公开访问 URL (cdn.readmigo.app) |

### Step 6: Fly.io Secrets 配置

在 Fly.io 中设置 R2 相关 secrets。

---

## 存储目录结构

| 路径 | 说明 |
|------|------|
| books/{bookId}/cover.jpg | 封面图片 |
| books/{bookId}/cover-thumb.jpg | 封面缩略图 |
| books/{bookId}/book.epub | EPUB 文件 |
| books/{bookId}/chapters/{chapterId}.html | 章节内容 |
| users/{userId}/avatar.jpg | 用户头像 |
| users/{userId}/postcards/{postcardId}.png | 用户明信片 |

---

## 生产检查清单

| 项目 | 状态 |
|------|------|
| R2 bucket 已创建 | |
| API token 已生成 | |
| 环境变量已配置到 Fly.io | |
| 自定义域名已配置 | |
| CORS 策略已设置 (如需) | |

---

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| Storage service not configured | 检查 R2 环境变量是否完整 |
| Access Denied | 验证 API token 权限和 bucket 名称 |
| Images not loading | 检查 R2_PUBLIC_URL 和 CORS 配置 |

---

*最后更新: 2026-02-07*
