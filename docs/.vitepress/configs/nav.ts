import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
  // 前端技术栈
  {
    text: 'Frontend',
    activeMatch: '/frontend/',
    items: [
      {
        text: '概览',
        link: '/frontend/'
      },
      {
        text: '框架',
        items: [
          { text: 'React', link: '/frontend/react/customHook/hooks' },
          { text: 'Vue', link: '/frontend/vue/schudle' }
        ]
      },
      {
        text: '语言',
        items: [
          { text: 'TypeScript', link: '/frontend/typescript/记录' },
          { text: 'JavaScript', link: '/frontend/javascript/Advance/executionContext' }
        ]
      },
      {
        text: '浏览器 & 工程化',
        items: [
          { text: '浏览器原理', link: '/frontend/browser/Chrome架构' },
          { text: 'Webpack', link: '/frontend/webpack/basic' },
          { text: 'Git', link: '/frontend/git/basic' }
        ]
      }
    ]
  },

  // 图形与渲染
  {
    text: 'Graphics',
    activeMatch: '/cv/',
    items: [
      {
        text: '概览',
        link: '/cv/'
      },
      {
        text: '理论基础',
        items: [
          { text: '图形学原理', link: '/cv/计算机图形学原理/00-教学大纲与目录' }
        ]
      },
      {
        text: '渲染技术',
        items: [
          { text: 'Canvas2D', link: '/cv/Canvas2D基础/00-教学大纲与目录' },
          { text: 'WebGL', link: '/cv/WebGL基础/00-教学大纲与目录' },
          { text: 'PixiJS', link: '/cv/PixiJS实战/00-教学大纲与目录' }
        ]
      },
      {
        text: '应用实战',
        items: [
          { text: '无限画布', link: '/cv/无限画布/00-教学大纲与目录' }
        ]
      }
    ]
  },

  // AI & Agent
  {
    text: 'AI',
    activeMatch: '/ai/',
    items: [
      {
        text: '概览',
        link: '/ai/'
      },
      {
        text: 'AI 工程',
        items: [
          { text: 'MCP 协议', link: '/ai/mcp/browserTools' },
          { text: 'Dify 平台', link: '/ai/Dify/' },
          { text: 'LLM 基础', link: '/ai/posts/LLM' }
        ]
      },
      {
        text: '机器学习',
        items: [
          { text: '机器学习', link: '/ai/机器学习/逻辑回归' },
          { text: '深度学习', link: '/ai/深度学习/卷积神经网络基础' },
          { text: 'SAM', link: '/ai/sam/' }
        ]
      }
    ]
  },

  // 计算机基础
  {
    text: 'CS Basics',
    activeMatch: '/fundamentals/|/design-patterns/',
    items: [
      {
        text: '计算机基础',
        items: [
          { text: '数据结构', link: '/fundamentals/data-structures/chapter1' },
          { text: '操作系统', link: '/fundamentals/operating-systems/chapter1' },
          { text: '计算机网络', link: '/fundamentals/computer-networks/chapter1' },
          { text: '计算机组成', link: '/fundamentals/computer-organization/chapter1' }
        ]
      },
      {
        text: '设计模式',
        items: [
          { text: '设计模式概览', link: '/design-patterns/' },
          { text: '408 真题', link: '/fundamentals/exam-408/2009' }
        ]
      },
      {
        text: '算法',
        items: [
          { text: 'LeetCode', link: '/algorithms/leetcode' },
          { text: 'LRU 算法', link: '/algorithms/LRU' }
        ]
      }
    ]
  },

  // 技术博客
  {
    text: 'Blog',
    activeMatch: '/blog/',
    link: '/blog/'
  },

  // 更多
  {
    text: 'More',
    items: [
      {
        text: '开源项目',
        items: [
          { text: '项目列表', link: '/open-source/' },
          { text: 'GitLab MCP', link: 'https://github.com/LynnCen/gitlab-mcp' },
          { text: 'LynKit', link: 'https://lynncen.github.io/LynKit/' }
        ]
      },
      {
        text: '软考',
        items: [
          { text: '系统架构师', link: '/software-exam/架构师/README' },
          { text: '软件设计师', link: '/software-exam/软件设计师/README' }
        ]
      },
      {
        text: '其他',
        items: [
          { text: '面试题库', link: '/interview/js' },
          { text: '工作文档', link: '/work/gd/业务介绍' },
          { text: '关于我', link: '/about/about' }
        ]
      }
    ]
  }
]
