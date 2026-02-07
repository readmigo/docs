# CText (中国哲学书电子化计划) 数据盘点

> 从产品和运营角度，梳理 CText 经典古籍数据及其对 Readmigo 的价值

---

## 1. 概述

| 项目 | 描述 |
|------|------|
| **网站** | https://ctext.org |
| **定位** | 中国古代哲学文献电子化项目 |
| **内容类型** | 儒家、道家、法家、兵家、墨家等经典 |
| **数据规模** | 数千部古籍，核心经典 12+ 部 |
| **API** | 官方 REST API（需认证） |
| **许可协议** | 学术用途免费，商业用途需授权 |

### 核心特点

| 优势 | 劣势 |
|------|------|
| 专业学术校对，质量极高 | API 需要认证 |
| 原文+注释+翻译对照 | 商业使用需授权 |
| 结构化章节数据 | 无 EPUB 格式 |
| 官方 API 支持 | 请求速率限制 |
| 覆盖核心经典 | 书籍数量有限 |

---

### 2.1 儒家经典

| 书名 | 英文名 | 作者 | 朝代 | URN |
|------|--------|------|------|-----|
| 论语 | The Analects | 孔子及其弟子 | 春秋 | `ctp:analects` |
| 孟子 | Mencius | 孟子及其弟子 | 战国 | `ctp:mengzi` |
| 大学 | The Great Learning | 曾子 | 战国 | `ctp:daxue` |
| 中庸 | The Doctrine of the Mean | 子思 | 战国 | `ctp:zhongyong` |
| 荀子 | Xunzi | 荀子 | 战国 | `ctp:xunzi` |

### 2.2 道家经典

| 书名 | 英文名 | 作者 | 朝代 | URN |
|------|--------|------|------|-----|
| 道德经 | Tao Te Ching | 老子 | 春秋 | `ctp:dao-de-jing` |
| 庄子 | Zhuangzi | 庄子及其后学 | 战国 | `ctp:zhuangzi` |
| 列子 | Liezi | 列御寇 | 战国 | `ctp:liezi` |

### 2.3 其他学派

| 书名 | 英文名 | 作者 | 朝代 | 学派 | URN |
|------|--------|------|------|------|-----|
| 孙子兵法 | The Art of War | 孙武 | 春秋 | 兵家 | `ctp:art-of-war` |
| 韩非子 | Han Feizi | 韩非 | 战国 | 法家 | `ctp:hanfeizi` |
| 墨子 | Mozi | 墨子及其弟子 | 战国 | 墨家 | `ctp:mozi` |

### 2.4 史书

| 书名 | 英文名 | 作者 | 朝代 | URN |
|------|--------|------|------|-----|
| 史记 | Records of the Grand Historian | 司马迁 | 西汉 | `ctp:shiji` |

---

### 3.2 认证方式

CText API 支持三种认证方式：

| 方式 | 参数 | 说明 |
|------|------|------|
| **API Key** | `apikey={key}` | 从 https://ctext.org/tools/subscribe 申请 |
| **用户密码** | `user={user}&pass={pass}` | 账号登录 |
| **无认证** | - | 仅限特定 IP 或有限访问 |

---

### 4.2 请求限制

| 限制项 | 说明 |
|--------|------|
| **请求间隔** | 建议 3 秒以上 |
| **日请求量** | 取决于 API 订阅级别 |
| **认证要求** | 无认证可能返回 HTML 错误页 |

---

### 5.1 与 Readmigo 需求对照

| Readmigo 字段 | 数据来源 | 说明 |
|---------------|----------|------|
| `title` | 预定义列表 | 中文书名 |
| `author` | 预定义列表 | 作者名 |
| `description` | 自动生成 | 基于书名、作者、朝代生成 |
| `language` | 固定值 `zh` | - |
| `genres` | 预定义分类 | 儒家/道家/兵家等 |
| `subjects` | 自动添加 | `[分类, '古籍', '经典']` |
| `dynasty` | 预定义列表 | 朝代信息 |
| `difficultyScore` | 难度分析 | 1-10 分 |
| `hskLevel` | 难度分析 | 1-6 级 |
| `characterCount` | 统计计算 | 汉字总数 |
| `chapterCount` | API 解析 | 章节数量 |
| `epubUrl` | R2 上传 | 纯文本 URL |
| `source` | 固定值 | `CTEXT` |
| `sourceId` | URN | 如 `ctp:analects` |
| `sourceUrl` | 构建 | `ctext.org/{urn_path}` |

---

### 6.1 学派分类

| 学派 | 代表著作 | 特点 |
|------|----------|------|
| **儒家** | 论语、孟子、大学、中庸 | 仁义礼智、修身齐家 |
| **道家** | 道德经、庄子、列子 | 道法自然、无为而治 |
| **法家** | 韩非子 | 法术势、中央集权 |
| **兵家** | 孙子兵法 | 军事战略、谋略智慧 |
| **墨家** | 墨子 | 兼爱非攻、节用尚同 |
| **史书** | 史记 | 纪传体通史 |

---

### 7.1 代码位置

| 文件 | 说明 |
|------|------|
| `scripts/book-ingestion/sources/ctext.ts` | 主导入脚本 |
| `scripts/book-ingestion/processors/chinese-difficulty-analyzer.js` | 中文难度分析 |
| `scripts/book-ingestion/processors/text-converter.js` | 繁简转换 |

---

### 8.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 返回 HTML 而非 JSON | 未认证或认证失败 | 检查 API Key 配置 |
| 请求被限流 | 请求过于频繁 | 增加请求间隔到 3-5 秒 |
| 章节内容为空 | 部分章节无 fulltext | 跳过空章节 |
| 编码问题 | 原文为繁体 | 使用 TextConverter 转换 |

### 8.2 API 认证申请

1. 访问 https://ctext.org/tools/subscribe
2. 注册账号并申请 API 访问权限
3. 获取 API Key 后配置到 `.env`

---

## 9. 与其他数据源对比

| 对比项 | CText | Gutenberg ZH | WikiSource ZH |
|--------|-------|--------------|---------------|
| **专业度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **数量** | 12+ 核心 | 200+ | 10+ |
| **格式** | API JSON | EPUB | Wiki 标记 |
| **认证** | 需要 | 不需要 | 不需要 |
| **特色** | 哲学经典 | 覆盖面广 | 四大名著 |
| **学术价值** | 极高 | 中等 | 高 |

---

## 10. 参考资源

- [CText 官网](https://ctext.org/)
- [CText API 文档](https://ctext.org/tools/api)
- [CText API 订阅](https://ctext.org/tools/subscribe)
- [CText 使用条款](https://ctext.org/faq/terms)

---

*最后更新: 2025-12-28*
