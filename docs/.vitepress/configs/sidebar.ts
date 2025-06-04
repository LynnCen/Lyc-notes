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
  '/Vue/': [
    {
      text: 'Vue学习规划',
      link: '/Vue/schudle'
    },
    {
      text: 'Vue基础',
      items: [
        {
          text: '响应式系统',
          link: '/Vue/basic/reactivity'
        },
        {
          text: '模板语法与指令',
          link: '/Vue/basic/template'
        },
        {
          text: '组件通信',
          link: '/Vue/basic/component-communication'
        },
        {
          text: 'Composition API',
          link: '/Vue/basic/composition-api'
        }
      ]
    },
    {
      text: 'Vue进阶',
      items: [
        {
          text:'hooks',
          link: '/Vue/advanced/hooks'
        },
        {
          text:'自定义指令',
          link: '/Vue/advanced/directive'
        },
        {
          text: '动画',
          link: '/Vue/advanced/animation'
        },
        {
          text:'性能优化',
          link: '/Vue/advanced/performance'
        },
        {
          text: '项目架构设计',
          link: '/Vue/advanced/architecture'
        }
      ]
    },
    {
      text: 'Vue 生态篇',
      items: [
        {
          text: 'Vue Router',
          link: '/Vue/ecosystem/router'
        },
        {
          text: 'Pinia状态管理',
          link: '/Vue/ecosystem/pinia'
        },
        {
          text: '构建工具',
          link: '/Vue/ecosystem/build'
        },
        {
          text: 'Vue Devtools',
          link: '/Vue/ecosystem/devtools'
        },
        {
          text: 'UI库',
          link: '/Vue/ecosystem/ui'
        },
        {
          text: '测试',
          link: '/Vue/ecosystem/test'
        },
        
      ]
    },
    {
      text: 'Vue原理',
      items: [
        {
          text: '深入响应式系统',
          link: '/Vue/principle/reactivity'
        },
        {
          text: '编译器原理',
          link: '/Vue/principle/compiler'
        },
      ]
    }
  ],
  '/typescript/': [
    {
      text: 'TypeScript',
      link: '/typescript/记录'
    },
    {
      text: 'TypeScript进阶',
      link: '/typescript/advance'
    },
    {
      text: 'Class',
      link: '/typescript/class'
    },
  ],
  '/react/': [
    {
      text: 'React源码详解',
      items: [
        {
          text: '第一篇 React运行全流程',
          link: '/react/core/intro'
        },
        {
          text: '第二篇 JSX 是如何转换为 React.createElement',
          link: '/react/core/createElement'
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
      link: '/project/index',
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
    {
      text: '2016真题',
      link: '/408/2016'
    },
    {
      text: '2017真题',
      link: '/408/2017'
    },
    {
      text: '2018真题',
      link: '/408/2018'
    },
    {
      text: '2019真题',
      link: '/408/2019'
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
      text: 'WebPack',
      items: [
        {
          text: '基础篇',
          link: '/webpack/basic'
        },
        {
          text: '实战篇',
          link: '/webpack/practice'
        },
        {
          text: '优化篇',
          link: '/webpack/optimization'
        },
        {
          text: '原理篇',
          link: '/webpack/principle'
        },
        {
          text: '性能优化',
          link: '/webpack/performance'
        },
      ]
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
      text: '计算机网络基础',
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
    },
    {
      text: 'HTTPS',
      link: '/计网/https'
    },
    {
      text: 'WebSocket',
      link: '/计网/webSocket'
    },
  ],
  '/project/': [
    {
      text: '项目总结',
      link: '/project/index'
    },
    {
      text: 'TMM',
      link: '/project/tmm',
      items: [
        {
          text: 'TMM模块重构与架构设计',
          link: '/project/tmm/architecture'
        },
        {
          text: '本地化搜索引擎实现',
          link: '/project/tmm/local_search'
        },
        {
          text: '@功能的高效实现',
          link: '/project/tmm/mention'
        },
        {
          text: 'ELectron大文件分片上传、断点续传、并行上传',
          link: '/project/tmm/partFileUpload'
        },
        {
          text: 'TMM性能优化',
          link: '/project/tmm/performance_optimization'
        },
        {
          text: '基于RBAC模型的群组权限体系设计与实现',
          link: '/project/tmm/RBAC'
        },
        {
          text: '基于AWS和Node流式大文件下载',
          link: '/project/tmm/resources_manner'
        }
      ]
    }
  ],
  '/algorithm/': [
    {
      text: '退避算法',
      link: '/algorithm/退避算法'
    },
    {
      text: 'LRU算法',
      link: '/algorithm/LRU'
    },
  ],
  '/softExame/': [
    {
      text: '软考-软件设计师',
      link: '/softExame/index'
    },
    {
      text: '时间规划',
      link: '/softExame/schedule'
    },
    {
      text: '软件工程',
      link: '/softExame/软件工程'
    },
    {
      text: '面向对象',
      link: '/softExame/面向对象'
    },
    {
      text: '数据库',
      link: '/softExame/database'
    },
    {

    }
  ],
  // '/posts/': [
  //   {
  //     text: '数据预加载',
  //     link: '/posts/dataPreFetch'
  //   },
  //   {
  //     text: 'rpx 适配',
  //     link: '/posts/rpxTovw'
  //   },
  //   {
  //     text: 'SSG骨架屏',
  //     link: '/posts/skelon'
  //   },
  //   {
  //     text: 'unocss插件',
  //     link: '/posts/uno-css-jp'
  //   },
  //   {
  //     text: 'Web实时通信技术对比',
  //     link: '/posts/communicationMechanisms'
  //   },
  //   {
  //     text: '埋点',
  //     link: '/posts/埋点'
  //   },
  //   {
  //     text: '前端性能优化',
  //     link: '/posts/性能优化'
  //   },
  //   {
  //     text: '前端渲染模式',
  //     link: '/posts/renderMode'
  //   }
  // ],
}
