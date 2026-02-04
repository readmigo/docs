# 书籍翻译工作流程

## 概述

本文档说明如何使用翻译工具批量翻译书籍章节。

## 翻译方案对比

| 方案 | 成本 | 质量 | 速度 | 适用场景 |
|------|------|------|------|----------|
| **DeepL API** | $20/百万字符 | ⭐⭐⭐⭐⭐ | 快 | 推荐用于文学作品 |
| **OpenAI GPT-4** | $30/百万token | ⭐⭐⭐⭐ | 中 | 可自定义翻译风格 |
| **Google Translate** | $20/百万字符 | ⭐⭐⭐ | 最快 | 大批量快速翻译 |
| **手动翻译** | 免费 | ⭐⭐⭐⭐⭐ | 最慢 | 小规模/高质量需求 |

## 费用估算

《The Jungle》翻译成本：
- 总词数：~150,000词 (~750,000字符)
- DeepL成本：~$15
- OpenAI成本：~$22-30
- 预计时间：2-3小时（API限速）

## 工作流程

### 1. 准备工作

获取翻译API密钥：

**DeepL (推荐)**
```bash
# 注册：https://www.deepl.com/pro-api
# 免费额度：500,000字符/月
export TRANSLATION_PROVIDER=deepl
export TRANSLATION_API_KEY=your-deepl-api-key
```

**OpenAI**
```bash
# 注册：https://platform.openai.com/api-keys
export TRANSLATION_PROVIDER=openai
export TRANSLATION_API_KEY=your-openai-api-key
```

### 2. 批量翻译章节

```bash
# 翻译第1-10章
npx ts-node src/scripts/batch-translate-chapters.ts 1 10

# 翻译第11-20章
npx ts-node src/scripts/batch-translate-chapters.ts 11 20

# 翻译第21-31章
npx ts-node src/scripts/batch-translate-chapters.ts 21 31
```

### 3. 审查翻译质量

翻译结果保存在 `temp-translations/{bookId}/` 目录：

```bash
# 查看翻译文件
ls -lh temp-translations/35539402-b171-44ea-ba27-a1ca306ee302/

# 检查第一个章节
cat temp-translations/35539402-b171-44ea-ba27-a1ca306ee302/chapter-5.json | jq '.paragraphs[0]'
```

**质量检查清单：**
- [ ] 段落数量正确
- [ ] 翻译完整（无截断）
- [ ] 专有名词保持一致
- [ ] 语句通顺流畅
- [ ] 保留原文风格

### 4. 上传翻译到R2

```bash
# 设置R2环境变量
export R2_ACCOUNT_ID=cbda5dcfa2fa6852a5d58673de8cd1e8
export R2_ACCESS_KEY_ID=c1a4d5d8ff15819eda875b2a87ef0984
export R2_SECRET_ACCESS_KEY=a43adf93c15d01ebcf095103a2d549078fb8b408255b6f68b19db3370aecd15b
export R2_BUCKET_NAME=readmigo-production
export R2_PUBLIC_URL=https://cdn.readmigo.app

# 批量上传所有翻译
for file in temp-translations/35539402-b171-44ea-ba27-a1ca306ee302/*.json; do
  echo "Uploading $file..."
  npx ts-node src/scripts/upload-translation.ts "$file"
done
```

### 5. 验证API

```bash
BOOK_ID=35539402-b171-44ea-ba27-a1ca306ee302
CHAPTER_ID=32f4913d-6389-4590-aba8-863360927165

# 测试元信息
curl "https://readmigo-api.fly.dev/books/$BOOK_ID/chapters/$CHAPTER_ID/translations/zh-Hans/metadata"

# 测试段落翻译
curl "https://readmigo-api.fly.dev/books/$BOOK_ID/chapters/$CHAPTER_ID/translations/zh-Hans/paragraphs/0"
```

## 批量上传脚本

创建自动化上传脚本：

```bash
#!/bin/bash
# upload-all-translations.sh

BOOK_ID="35539402-b171-44ea-ba27-a1ca306ee302"
TRANSLATION_DIR="temp-translations/$BOOK_ID"

export R2_ACCOUNT_ID=cbda5dcfa2fa6852a5d58673de8cd1e8
export R2_ACCESS_KEY_ID=c1a4d5d8ff15819eda875b2a87ef0984
export R2_SECRET_ACCESS_KEY=a43adf93c15d01ebcf095103a2d549078fb8b408255b6f68b19db3370aecd15b
export R2_BUCKET_NAME=readmigo-production
export R2_PUBLIC_URL=https://cdn.readmigo.app

count=0
success=0
failed=0

for file in "$TRANSLATION_DIR"/*.json; do
  if [ -f "$file" ]; then
    echo "[$((++count))] Uploading $(basename $file)..."
    if npx ts-node src/scripts/upload-translation.ts "$file"; then
      ((success++))
      echo "✓ Success"
    else
      ((failed++))
      echo "✗ Failed"
    fi
    echo ""
  fi
done

echo "=================================="
echo "Upload Summary:"
echo "  Total: $count"
echo "  Success: $success"
echo "  Failed: $failed"
echo "=================================="
```

## 故障排除

### API限速

如果遇到限速错误，增加请求间隔：

```typescript
// 在 batch-translate-chapters.ts 中调整
await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒间隔
```

### 翻译质量问题

对于特定章节，可以使用更高质量的模型：

```bash
# 使用 GPT-4 重新翻译第5章
TRANSLATION_PROVIDER=openai \
TRANSLATION_API_KEY=your-key \
npx ts-node src/scripts/batch-translate-chapters.ts 5 5
```

### 内存不足

处理超长章节时可能遇到内存限制：

```bash
NODE_OPTIONS="--max-old-space-size=4096" npx ts-node src/scripts/batch-translate-chapters.ts 1 31
```

## 高级用法

### 自定义翻译提示词

编辑 `batch-translate-chapters.ts` 中的系统提示：

```typescript
{
  role: 'system',
  content: '你是一位专业的文学翻译家。请将以下英文段落翻译成简体中文，保持原文的文学风格和情感。注意保留人名地名的原文。',
}
```

### 并行处理

```bash
# 同时运行多个批次
npx ts-node src/scripts/batch-translate-chapters.ts 1 10 &
npx ts-node src/scripts/batch-translate-chapters.ts 11 20 &
npx ts-node src/scripts/batch-translate-chapters.ts 21 31 &
wait
```

## 进度跟踪

查看已翻译章节：

```sql
-- 连接到数据库
psql $DATABASE_URL

-- 查询翻译进度
SELECT
  c.order,
  c.title,
  c.word_count,
  ct.locale,
  ct.paragraph_count,
  ct.status,
  ct.translated_at
FROM chapters c
LEFT JOIN chapter_translations ct ON c.id = ct.chapter_id
WHERE c.book_id = '35539402-b171-44ea-ba27-a1ca306ee302'
  AND c.word_count > 500
ORDER BY c.order;
```

## 下一步

完成翻译后：
1. 通知iOS团队API已就绪
2. 提供测试章节ID和API文档
3. 协助集成段落长按翻译功能
