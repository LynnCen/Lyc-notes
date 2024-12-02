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
  '/react/': [
    {
      text: 'React源码',
      items: [
        {
          text: '核心概念',
          link: '/react/core/basic'
        }, {
          text: '设计理念',
          link: '/react/core/设计理念'
        },
        {
          text: '内核关系',
          link: '/react/core/innerCore'
        },
        {
          text: '基本数据结构',
          link: '/react/core/baseStruct'
        }
      ]
    },
    {
      text: 'React实践',
      items: [
        {
          text: '思考',
          link: '/react/record/thinking'
        },
        {
          text: '自定义Hooks',
          link: '/react/customHook/hooks'
        },
        {
          text: 'React with TS',
          link: '/react/utils/type'
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
    {
      text: '笔试题',
      link: '/interview/coding',
    },
  ],
  '/os/': [
    {
      text: '操作系统基础',
      items: [
        {
          text: '第一章 操作系统引论',
          link: '/os/chapter1'
        },
        {
          text: '第二章 进程与线程',
          link: '/os/chapter2'
        },
        {
          text: '第三章 内存管理',
          link: '/os/chapter3'
        },
        {
          text: '第四章 文件管理',
          link: '/os/chapter4'
        },
        {
          text: '第五章 磁盘和固态硬盘',
          link: '/os/chapter5'
        },
        {
          text: '强化',
          link: '/os/强化'
        },
      ]
    }
  ],

  '/408/': [
    {
      text: '2009真题',
      link: '/408/2009'
    },
    {
      text: '2010真题',
      link: '/408/2010'
    },
    {
      text: '2011真题',
      link: '/408/2011'
    },
    {
      text: '2012真题',
      link: '/408/2012'
    },
    {
      text: '2013真题',
      link: '/408/2013'
    },
    {
      text: '2014真题',
      link: '/408/2014'
    },
    {
      text: '2015真题',
      link: '/408/2015'
    },
  ],
  '计网': [
    {
      text: '强化',
      link: '/计网/强化'
    },
  ],

  '/dataStructure/': [
    {
      text: '数据结构',
      items: [
        {
          text: '第一章 绪论',
          link: '/dataStructure/chapter1'
        },
        {
          text: '第二章 线性表',
          link: '/dataStructure/chapter2'
        },
        {
          text: '第三章 栈、队列和数组',
          link: '/dataStructure/chapter3'
        },
        {
          text: '第四章 串',
          link: '/dataStructure/chapter4'
        },
        {
          text: '第五章 树与二叉树',
          link: '/dataStructure/chapter5'
        },
        {
          text: '第六章 图',
          link: '/dataStructure/chapter6'
        },
        {
          text: '第七章 查找',
          link: '/dataStructure/chapter7'
        },
        {
          text: '第八章 排序',
          link: '/dataStructure/chapter8'
        }
      ]

    }, {
      text: '课后习题',
      items: [
        {
          text: '第一章 绪论',
          link: '/dataStructure/chapter1_ex'
        },
        {
          text: '第二章 线性表',
          link: '/dataStructure/chapter2_ex'
        },
        {
          text: '强化',
          link: '/dataStructure/强化'
        }

      ]
    }
  ],
  '/组成原理/': [
    {
      text: '计算机组成原理',
      items: [
        {
          text: '第一章 计算机系统概述',
          link: '/组成原理/chapter1'
        },
        {
          text: '第二章 数据的表示和运算',
          link: '/组成原理/chapter2'
        },
        {
          text: '第三章 存储系统',
          link: '/组成原理/chapter3'
        },
        {
          text: '第四章 指令系统',
          link: '/组成原理/chapter4'
        },
        {
          text: '第五章 中央处理器',
          link: '/组成原理/chapter5'
        },
        {
          text: '第六章 总线',
          link: '/组成原理/chapter6'
        },
        {
          text: '第七章 输入/输出系统',
          link: '/组成原理/chapter7'
        },
        {
          text: '强化',
          link: '/组成原理/强化'
        },
      ]
    }
  ],
  '/webpack/': [
    {
      text: 'WebPack性能优化',
      link: '/webpack/performance'
    },
    {
      text: '原子化Css',
      link: '/webpack/unocss'
    },
  ],
  '/browser/': [
    {
      text: '宏观视角下的浏览器',
      items: [
        {
          text: 'Chorme架构',
          link: '/browser/Chrome架构'
        },
        {
          text: 'TCP协议',
          link: '/browser/TCP协议'
        },
        {
          text: 'HTTP协议',
          link: '/browser/HTTP'
        },
        {
          text: '导航流程',
          link: '/browser/导航流程'
        },
        {
          text: '渲染流程（上）',
          link: '/browser/renderfirst'
        },
        {
          text: '渲染流程（下）',
          link: '/browser/rendersec'
        },
      ]
    },

    {
      text: 'Javascript中的执行机制',
      items: [
        {
          text: '变量提升',
          link: '/browser/变量提升'
        },
        {
          text: '调用栈',
          link: '/browser/调用栈'
        },
        {
          text: '块级作用域',
          link: '/browser/块级作用域'
        },
        {
          text: '作用域链和闭包',
          link: '/browser/作用域链和闭包'
        },
        {
          text: 'This',
          link: '/browser/this'
        },
      ]
    },
    {
      text: 'V8工作原理',
      items: [
        {
          text: '栈空间和堆空间',
          link: '/browser/栈和堆'
        },
        {
          text: '垃圾回收',
          link: '/browser/垃圾回收'
        },
        {
          text: '编译器和解释器',
          link: '/browser/编译器和解释器'
        },
      ]
    },
    {
      text: '浏览器中的页面循环系统',
      items: [
        {
          text: '消息队列和事件循环',
          link: '/browser/消息队列和事件循环'
        },
        {
          text: 'setTimeout 是如何实现的？',
          link: '/browser/setTimeout如何实现'
        },
        {
          text: 'XMLHttpRequest 是怎么实现的？',
          link: '/browser/XMLHttpRequest'
        },
        {
          text: '宏任务和微任务',
          link: '/browser/宏任务和微任务'
        },
        {
          text: 'Promise',
          link: '/browser/Promise'
        },
        {
          text: 'async/await',
          link: '/browser/async&await'
        },
      ]
    },
    {
      text: '浏览器中的页面',
      items: [
        {
          text: 'Chrome开发者工具',
          link: '/browser/Chrome开发者工具'
        },
        {
          text: 'DOM树',
          link: '/browser/DOM树'
        },
        {
          text: '渲染流水线',
          link: '/browser/渲染流水线'
        },
        {
          text: '分层和合成机制',
          link: '/browser/分层和合成'
        },
        {
          text: '页面性能',
          link: '/browser/页面性能'
        },
        {
          text: '虚拟DOM',
          link: '/browser/虚拟DOM'
        },
        {
          text: '渐进式网页应用PWA',
          link: '/browser/渐进式网页应用PWA'
        },
      ]
    },
    {
      text: '浏览器中的网络',
      items: [
        {
          text: 'HTTP1',
          link: '/browser/HTTP1'
        },
        {
          text: 'HTTP2',
          link: '/browser/HTTP2'
        },
        {
          text: 'HTTP3',
          link: '/browser/HTTP3'
        }
      ]
    },
    {
      text: "浏览器安全",
      items: [
        {
          text: '同源策略',
          link: '/browser/同源策略'
        },
        {
          text: '跨站脚本攻击XSS',
          link: '/browser/跨站脚本攻击XSS'
        },
        {
          text: 'CSRF攻击',
          link: '/browser/CSRF攻击'
        },
        {
          text: '安全沙箱',
          link: '/browser/安全沙箱'
        },
        {
          text: 'HTTPS',
          link: '/browser/HTTPS'
        },
      ]
    },
    {
      text: '浏览上下文组',
      link: '/browser/浏览上下文组'
    },
    {
      text: '任务调度',
      link: '/browser/任务调度'
    },
    {
      text: '加载阶段性能',
      link: '/browser/加载阶段性能'
    },
    {
      text: 'Performance',
      link: '/browser/Performance'
    },
    {
      text: 'Performance中的Main指标',
      link: '/browser/Performance中的Main指标'
    },
  ],
  '/计网/': [
    {
      text: '计算机组成原理',
      items: [
        {
          text: '第一章 计算机网络体系结构',
          link: '/计网/chapter1'
        },
        {
          text: '第二章 物理层',
          link: '/计网/chapter2'
        },
        {
          text: '第三章 数据链路层',
          link: '/计网/chapter3'
        },
      ]
    }
  ]
}
