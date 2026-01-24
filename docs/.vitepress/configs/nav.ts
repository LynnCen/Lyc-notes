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
            activeMatch: 'frontend/javascript/basic/',
            link: 'frontend/javascript/basic/你不知道的js'
          },
          {
            text: 'Javascript进阶',
            activeMatch: 'frontend/javascript/Advance/',
            link: 'frontend/javascript/Advance/executionContext'
          },
          {
            text: 'Typescript',
            activeMatch: '/frontend/typescript/',
            link: '/frontend/typescript/记录'
          },
        ]
      },
      {
        text:'Framework',
        items: [
          {
            text: 'React',
            activeMatch: '/frontend/react/',
            link: 'frontend/react/core/intro'
          },
          {
            text: 'Vue',
            activeMatch: '/frontend/vue/',
            link: 'frontend/vue/basic'
          }
        ]
      },
      {
        text: 'Engineering',
        items: [
          {
            text: 'WebPack',
            activeMatch: '/frontend/webpack/',
            link: 'frontend/webpack/performance'
          },
          {
            text: 'Node',
            activeMatch: '/frontend/node/',
            link: 'frontend/node/packages'
          },
          {
            text: 'Git',
            activeMatch: '/frontend/git/',
            link: 'frontend/git/basic'
          }
        ],
      },
      {
        text:'浏览器',
        items: [
          {
            text: '浏览器原理',
            activeMatch: '/frontend/browser/',
            link: '/frontend/browser/Chrome架构'
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
            link: '/fundamentals/computer-organization/chapter1'
          }
        ]
      },
      {
        text: '数据结构',
        items: [
          {
            text: '数据结构基础',
            link: '/fundamentals/data-structures/chapter1'
          },
          {
            text: '课后习题',
            link: '/fundamentals/data-structures/chapter1_ex'
          }
        ]

      },
      {
        text: '操作系统OS',
        items: [
          {
            text: '操作系统基础',
            link: '/fundamentals/operating-systems/chapter1',
          }
        ]
      },
      {
        text: '计算机网络',
        items: [
          {
            text: '计算机网络基础',
            link: '/fundamentals/computer-networks/chapter1',
          }
        ]
      },
      {
        text: '408',
        items: [
          {
            text: '408真题',
            link: '/fundamentals/exam-408/2009',
          }
        ]
      },
      {
        text: '设计模式',
        link: '/frontend/design-patterns/index'
      }

    ],
  },
  {
    text: 'AI',
    items: [
      {
        text: 'MCP',
        items: [
          {
            text: 'BrowserTools MCP',
            link: '/ai/mcp/browserTools'
          },
          {
            text: 'Figma Dev Mode MCP',
            link: '/ai/mcp/figma'
          }
        ]
      },
      {
        text: 'Dify',
        items: [
          {
            text: 'Dify',
            link: '/ai/Dify/index'
          }
        ]
      },
      {
        text:'Posts',
        items: [
          {
            text: 'LLM',
            link: '/ai/posts/llm'
          }
        ]
      }
    ]
  },
  {
    text: 'SoftExame',
    items: [
      {
        text: '软考-软件设计师',
        link: '/certifications/software-exam/软件设计师/index'
      },
      {
        text:'软考-系统架构设计师',
        link:'/certifications/software-exam/架构师/index'
      }
    ]
  },
  {
    text: 'Interview',
    activeMatch: '/interview/',
    link: '/interview/js'
  },
]
