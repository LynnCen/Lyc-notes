import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'WebFront',
    items: [
      {
        text: 'Javascript基础',
        activeMatch: 'Javascript/basic/',
        link: 'Javascript/basic/你不知道的js'
      },
      {
        text: 'Javascript进阶',
        activeMatch: 'Javascript/Advance/',
        link: 'Javascript/Advance/executionContext'
      },
      {
        text: 'Typescript',
        activeMatch: '/typescript/',
        link: '/typescript/记录'
      },
      {
        text: '浏览器原理',
        activeMatch: '/browser/',
        link: '/browser/Chrome架构'
      }
    ],
  },
  {
    text: 'ComputerBasics',
    items: [
      {
        text: '计算机组成原理',
        items: [
          {
            text: '计算机组成原理基础',
            link: '/组成原理/chapter1'
          }
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
