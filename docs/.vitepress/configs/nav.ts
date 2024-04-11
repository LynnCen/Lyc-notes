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
        items: [
          {
            text: '调用堆栈',
            activeMatch: '/Javascript/Javascript进阶/',
            link: 'Javascript/Javascript进阶/执行上下文和执行栈'
          }
        ]
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
        ]
      },
      {
        text: '操作系统OS',
        items: [
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
    text: 'Engineering',
    items: [
      {
        text: 'WebPack',
        items: [
        ]
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
