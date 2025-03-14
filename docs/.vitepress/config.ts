import { basename } from 'node:path'
import { defineConfig } from 'vitepress'
import MarkdownPreview from 'vite-plugin-markdown-preview'
import { withMermaid } from "vitepress-plugin-mermaid";
import { head, nav, sidebar } from './configs'

const APP_BASE_PATH = basename(process.env.GITHUB_REPOSITORY || '')

export default withMermaid(defineConfig({
  outDir: '../dist',
  base: APP_BASE_PATH ? `/${APP_BASE_PATH}/` : '/',

  lang: 'zh-CN',
  title: '林岑LynnCenʘᴗʘ ',
  description: '林岑的成长之路，包含前端常用知识、源码阅读笔记、各种奇淫技巧、日常提效工具等',
  head,

  lastUpdated: true,
  cleanUrls: true,

  /* markdown 配置 */
  markdown: {
    lineNumbers: true,
  },

  /* 主题配置 */
  themeConfig: {
    i18nRouting: false,

    logo: '/LynnCenLogo.png',

    nav,
    sidebar,
    search: {
      provider: 'local'
    },
    /* 右侧大纲配置 */
    outline: {
      level: 'deep',
      label: '本页目录',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/LynnCen' }],

    footer: {
      message: '如有转载或 CV 的请标注本站原文地址',
      copyright: 'Copyright © 2024-present LynnCen',
    },

    darkModeSwitchLabel: '外观',
    returnToTopLabel: '返回顶部',
    lastUpdatedText: '上次更新',

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    visitor: {
      badgeId: 'LynnCen.Lyc-notes',
    },

    comment: {
      repo: 'LynnCen/Lyc-notes',
      repoId: 'R_kgDOLsOwUg',
      category: 'Announcements',
      categoryId: 'DIC_kwDOLsOwUs4CenzY',
    },
  },

  vite: {
    plugins: [MarkdownPreview()],
  },
})) 
