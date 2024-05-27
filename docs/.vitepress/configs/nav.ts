import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'Javascript',
    items: [
      {
        text: 'Javascript基础',
        items: [
        ]
      },
      {
        text: 'Javascript进阶',
        activeMatch: 'Javascript/Advance/',
        link: 'Javascript/Advance/executionContext'
      }
    ],
  },
  {
    text: 'Typescript',
    activeMatch: '/docs/',
    link: '/docs/hello'
  },
  {
    text: 'ComputerBasics',
    items: [
      {
        text: '计算机组成原理',
        items: [
        ]
      },
      {
        text: '数据结构',
        items: [
          {
            text: '数据结构基础',
            link: '/dataStructure/chapter1'
          }
        ]

      },
      {
        text: '操作系统OS',
        items: [
          {
            text: '操作系统基础',
            link: '/os/chapter1',
          }
        ]
      },
      {
        text: '计算机网络',
        items: [
        ]
      },

    ],
  },
  {
    text: 'Frameworks',
    items: [
      {
        text: 'React',
        activeMatch: '/react/',
        link: 'react/core/basic'
      },
      {
        text: 'Vue',
        link: 'Vue/basic'
      }
    ],
  },
  {
    text: 'Engineering',
    items: [
      {
        text: 'WebPack',
        activeMatch: '/webpack/',
        link: 'webpack/performance'
      },
      {
        text: 'Vite',
        items: [

        ]
      }
    ],
  },

  {
    text: 'Interview',
    activeMatch: '/interview/',
    link: '/interview/js'
  },
]
