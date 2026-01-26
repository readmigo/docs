# Readmigo Docs

Readmigo 项目文档中心，使用 VitePress 构建。

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建静态站点
pnpm build

# 预览构建结果
pnpm preview

# 生成 EPUB 电子书
pnpm epub
```

## 目录结构

| 目录 | 内容 |
|------|------|
| `00-market` | 市场分析 |
| `01-product` | 产品文档 |
| `02-design` | 设计规范 |
| `03-architecture` | 架构设计 |
| `04-development` | 开发指南 |
| `05-operations` | 运维文档 |
| `06-content` | 内容管理 |
| `07-modules` | 模块文档 |
| `08-releases` | 发布记录 |
| `09-reference` | 参考资料 |
| `10-pipeline` | 流水线 |
| `99-research` | 研究归档 |

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。
