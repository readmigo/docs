/**
 * 将文档目录的 Markdown 文档编译成 EPUB 电子书
 *
 * 用法: pnpm epub
 */

import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import epub from 'epub-gen-memory'

const ROOT_DIR = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'dist')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'readmigo-docs.epub')

// 目录名称映射
const CATEGORY_NAMES: Record<string, string> = {
  '00-market': '市场',
  '01-product': '产品',
  '02-design': '设计',
  '03-architecture': '架构',
  '04-development': '开发',
  '05-operations': '运维',
  '06-content': '内容',
  '07-modules': '模块',
  '08-releases': '发布',
  '09-reference': '参考',
  '10-pipeline': '流水线',
  '99-research': '研究',
  plans: '计划',
}

interface Chapter {
  title: string
  content: string // HTML content
  filename?: string
}

/**
 * 递归读取目录中的所有 Markdown 文件
 */
function readMarkdownFiles(dir: string, prefix = ''): { path: string; title: string; content: string }[] {
  const files: { path: string; title: string; content: string }[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    // README 优先
    if (a.name === 'README.md') return -1
    if (b.name === 'README.md') return 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // 跳过隐藏目录和特定目录
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'scripts' || entry.name === 'dist') {
        continue
      }

      const subFiles = readMarkdownFiles(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name)
      files.push(...subFiles)
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : entry.name.replace('.md', '')

      files.push({
        path: prefix ? `${prefix}/${entry.name}` : entry.name,
        title,
        content,
      })
    }
  }

  return files
}

/**
 * 将 Markdown 转换为 HTML
 */
function markdownToHtml(markdown: string): string {
  // 简单处理：移除 YAML frontmatter
  const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---\n*/m, '')
  return marked(withoutFrontmatter) as string
}

/**
 * 生成 EPUB
 */
async function generateEpub() {
  console.log('📚 开始生成 EPUB...')

  // 读取所有 Markdown 文件
  const allFiles = readMarkdownFiles(ROOT_DIR)
  console.log(`📄 找到 ${allFiles.length} 个 Markdown 文件`)

  // 按目录分组
  const chapters: Chapter[] = []

  // 添加首页
  const indexFile = allFiles.find((f) => f.path === 'index.md')
  if (indexFile) {
    chapters.push({
      title: '首页',
      content: markdownToHtml(indexFile.content),
      filename: 'index',
    })
  }

  // 按顶级目录分组
  const topDirs = [...new Set(allFiles.filter((f) => f.path.includes('/')).map((f) => f.path.split('/')[0]))]

  for (const dir of topDirs.sort()) {
    const categoryName = CATEGORY_NAMES[dir] || dir
    const categoryFiles = allFiles.filter((f) => f.path.startsWith(`${dir}/`))

    if (categoryFiles.length === 0) continue

    // 创建目录章节
    let categoryContent = `<h1>${categoryName}</h1>\n`

    // 添加 README 内容（如果有）
    const readme = categoryFiles.find((f) => f.path === `${dir}/README.md`)
    if (readme) {
      categoryContent += markdownToHtml(readme.content.replace(/^#\s+.+\n/, ''))
    }

    // 添加子文件列表
    const subFiles = categoryFiles.filter((f) => f.path !== `${dir}/README.md`)
    if (subFiles.length > 0) {
      categoryContent += '<h2>本章内容</h2><ul>'
      for (const file of subFiles.slice(0, 50)) {
        // 限制数量避免过长
        categoryContent += `<li>${file.title}</li>`
      }
      if (subFiles.length > 50) {
        categoryContent += `<li>... 还有 ${subFiles.length - 50} 个文档</li>`
      }
      categoryContent += '</ul>'
    }

    chapters.push({
      title: categoryName,
      content: categoryContent,
      filename: dir,
    })

    // 为重要目录添加子章节
    if (['03-architecture', '04-development', '07-modules'].includes(dir)) {
      for (const file of subFiles.slice(0, 10)) {
        // 每个目录最多 10 个子章节
        chapters.push({
          title: `${categoryName} - ${file.title}`,
          content: markdownToHtml(file.content),
          filename: file.path.replace(/\//g, '-').replace('.md', ''),
        })
      }
    }
  }

  console.log(`📖 生成 ${chapters.length} 个章节`)

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 生成 EPUB
  const buffer = await epub(
    {
      title: 'Readmigo 项目文档',
      author: 'Readmigo Team',
      publisher: 'Readmigo',
      description: 'Readmigo 项目完整文档集，包含市场、产品、设计、架构、开发、运维等全部文档',
      lang: 'zh-CN',
      tocTitle: '目录',
      date: new Date().toISOString().split('T')[0],
    },
    chapters,
  )

  fs.writeFileSync(OUTPUT_FILE, buffer)

  console.log(`✅ EPUB 生成完成: ${OUTPUT_FILE}`)
  console.log(`📊 文件大小: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)
}

// 运行
generateEpub().catch(console.error)
