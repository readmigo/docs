# 封面质量对比：Standard Ebooks vs Google Books

## 对比日期
2026-01-06

## 结论
**Standard Ebooks 封面质量更佳**，不采用 Google Books 封面替换方案。

## 对比样本

| 书籍 | Standard Ebooks | Google Books |
|------|-----------------|--------------|
| A Christmas Carol | [SE Cover](https://standardebooks.org/ebooks/charles-dickens/a-christmas-carol/downloads/cover.jpg) | [GB Cover](https://books.google.com/books/content?id=f8ANAAAAQAAJ&printsec=frontcover&img=1&source=gbs_api&zoom=0) |
| A Tale of Two Cities | [SE Cover](https://standardebooks.org/ebooks/charles-dickens/a-tale-of-two-cities/downloads/cover.jpg) | [GB Cover](https://books.google.com/books/content?id=5EIPAAAAQAAJ&printsec=frontcover&img=1&source=gbs_api&zoom=0) |
| A Little Princess | [SE Cover](https://standardebooks.org/ebooks/frances-hodgson-burnett/a-little-princess/downloads/cover.jpg) | [GB Cover](https://books.google.com/books/content?id=q6pqzgEACAAJ&printsec=frontcover&img=1&source=gbs_api&zoom=0) |
| Anna Karenina | [SE Cover](https://standardebooks.org/ebooks/leo-tolstoy/anna-karenina/constance-garnett/downloads/cover.jpg) | [GB Cover](https://books.google.com/books/content?id=YmhDLD9UsPQC&printsec=frontcover&img=1&source=gbs_api&zoom=0) |
| Alice's Adventures in Wonderland | [SE Cover](https://standardebooks.org/ebooks/lewis-carroll/alices-adventures-in-wonderland/downloads/cover.jpg) | [GB Cover](https://books.google.com/books/content?id=btIQAAAAYAAJ&printsec=frontcover&img=1&source=gbs_api&zoom=0) |

## 对比分析

### Standard Ebooks 优势
- 统一的艺术风格设计
- 高分辨率原创封面
- 专业的排版和配色
- 视觉一致性强

### Google Books 劣势
- 多为扫描版老旧封面
- 分辨率和质量参差不齐
- 风格不统一
- 部分封面有水印或损坏

## 技术备注

### Google Books API 尺寸参数
| zoom | 描述 |
|------|------|
| 0 | 最大尺寸 |
| 1 | ~300px (缩略图) |
| 2 | ~600px (中图) |

### 对比脚本
`scripts/book-ingestion/compare-google-covers.ts`

### 预留扩展路径
如未来需要使用 Google Books 封面，路径结构：
```
covers/google-books/{slug}.jpg
covers/google-books/{slug}-medium.jpg
covers/google-books/{slug}-thumb.jpg
```
