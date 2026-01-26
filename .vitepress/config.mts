import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

export default defineConfig({
  title: 'Readmigo Docs',
  description: 'Readmigo 项目文档中心',

  // 文档源目录（根目录）
  srcDir: '.',

  // 输出目录
  outDir: 'dist',

  // 主题配置
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '市场', link: '/00-market/' },
      { text: '产品', link: '/01-product/' },
      { text: '设计', link: '/02-design/' },
      { text: '架构', link: '/03-architecture/' },
      { text: '开发', link: '/04-development/' },
      { text: '运维', link: '/05-operations/' },
    ],

    // 使用 vitepress-sidebar 自动生成侧边栏
    sidebar: generateSidebar({
      documentRootPath: '.',
      collapseDepth: 2,
      useTitleFromFileHeading: true,
      useTitleFromFrontmatter: true,
      sortMenusByFrontmatterOrder: true,
      excludeFiles: ['README.md'],
      excludeFolders: ['node_modules', '.git', '.vitepress', 'scripts'],
      capitalizeFirst: true,
      hyphenToSpace: true,
      underscoreToSpace: true,
    }),

    // 搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/readmigo/docs' }
    ],

    // 页脚
    footer: {
      message: 'Readmigo 内部文档',
      copyright: 'Copyright © 2024-2026 Readmigo'
    },

    // 上次更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/readmigo/docs/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 大纲
    outline: {
      label: '页面导航',
      level: [2, 3]
    }
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Vue 配置 - 忽略自定义元素
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => {
          const customTags = ['ruby', 'rt', 'rp', 'kbd', 'samp', 'var', 'dfn', 'abbr', 'cite', 'q', 'ins', 'del', 'mark', 'time', 'meter', 'progress', 'data', 'bdi', 'bdo', 'wbr']
          return customTags.includes(tag.toLowerCase())
        }
      }
    }
  },

  // 最后更新时间
  lastUpdated: true,

  // 清理 URL
  cleanUrls: true,

  // 忽略死链接
  ignoreDeadLinks: true
})
