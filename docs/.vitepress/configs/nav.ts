import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'WebFront',
    items: [
      {
        text: '前端基础',
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
        ]
      },
      {
        text:'Framework',
        items: [
          {
            text: 'React',
            activeMatch: '/react/',
            link: 'react/core/intro'
          },
          {
            text: 'Vue',
            activeMatch: '/Vue/',
            link: 'Vue/basic'
          }
        ]
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
            text: 'Node',
            activeMatch: '/node/',
            link: 'node/packages'
          },
          {
            text: 'Vite',
            activeMatch: '/vite/',
            link: 'vite/basic'
          },
          {
            text: 'Git',
            activeMatch: '/git/',
            link: 'git/basic'
          }
        ],
      },
      {
        text:'浏览器',
        items: [
          {
            text: '浏览器原理',
            activeMatch: '/browser/',
            link: '/browser/Chrome架构'
          }
        ]
      },
  
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
          },
          {
            text: '课后习题',
            link: '/dataStructure/chapter1_ex'
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
          {
            text: '计算机网络基础',
            link: '/计网/chapter1',
          }
        ]
      },
      {
        text: '408',
        items: [
          {
            text: '408真题',
            link: '/408/2009',
          }
        ]
      },

    ],
  },
  {
    text: 'SoftExame',
    items: [
      {
        text: '软考-软件设计师',
        link: '/softExame/index'
      }
    ]
  },
  {
    text: 'Interview',
    activeMatch: '/interview/',
    link: '/interview/js'
  },
]
