import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
    '/Javascript/': [
      {
        text: 'JS引擎',
        link: 'Javascript/Advance/execution'
    },
        {
            text: '调用堆栈',
            items: [
                {
                    text: '执行上下文和执行栈',
                    link: 'Javascript/Advance/executionContext'
                },
                {
                  text: '执行上下文栈和变量对象',
                  link: 'Javascript/Advance/executionStack'
              }
            ]
        }
    ],
    '/react/':[
      {
        text:'React源码',
        items:[
          {
            text:'核心概念',
            link:'/react/core/basic'
          },
          {
            text:'内核关系',
            link:'/react/core/innerCore'
          },
          {
            text:'基本数据结构',
            link:'/react/core/baseStruct'
          }
        ]
      }
    ],
    '/interview/': [
        {
            text: 'HTML',
            link: '/interview/html',
        },
        {
            text: 'CSS',
            link: '/interview/css',
        },
        {
            text: 'Javascript',
            link: '/interview/js',
        },
        {
            text: 'React',
            link: '/interview/react',
        },
        {
            text: 'Typescript',
            link: '/interview/typescript',
        },
        {
            text: 'WebPack',
            link: '/interview/webpack',
        },
        {
            text: '浏览器',
            link: '/interview/browser',
        },
        {
            text: '网络',
            link: '/interview/network',
        },
        {
          text: '项目总结',
          link: '/project',
      },
    ]
}
