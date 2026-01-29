import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
  '/frontend/javascript/': [
    {
      text: 'JS引擎',
      link: 'frontend/javascript/Advance/execution'
    },
    {
      text: '调用堆栈',
      items: [
        {
          text: '执行上下文和执行栈',
          link: 'frontend/javascript/Advance/executionContext'
        },
        {
          text: '执行上下文栈和变量对象',
          link: 'frontend/javascript/Advance/executionStack'
        }
      ]
    }
  ],
  '/frontend/vue/': [
    {
      text: 'Vue学习规划',
      link: '/frontend/vue/schudle'
    },
    {
      text: 'Vue基础',
      items: [
        {
          text: '响应式系统',
          link: '/frontend/vue/basic/reactivity'
        },
        {
          text: '模板语法与指令',
          link: '/frontend/vue/basic/template'
        },
        {
          text: '组件通信',
          link: '/frontend/vue/basic/component-communication'
        },
        {
          text: 'Composition API',
          link: '/frontend/vue/basic/composition-api'
        }
      ]
    },
    {
      text: 'Vue进阶',
      items: [
        {
          text:'hooks',
          link: '/frontend/vue/advanced/hooks'
        },
        {
          text:'自定义指令',
          link: '/frontend/vue/advanced/directive'
        },
        {
          text: '动画',
          link: '/frontend/vue/advanced/animation'
        },
        {
          text:'性能优化',
          link: '/frontend/vue/advanced/performance'
        },
        {
          text: '项目架构设计',
          link: '/frontend/vue/advanced/architecture'
        }
      ]
    },
    {
      text: 'Vue 生态篇',
      items: [
        {
          text: 'Vue Router',
          link: '/frontend/vue/ecosystem/router'
        },
        {
          text: 'Pinia状态管理',
          link: '/frontend/vue/ecosystem/pinia'
        },
        {
          text: '构建工具',
          link: '/frontend/vue/ecosystem/build'
        },
        {
          text: 'Vue Devtools',
          link: '/frontend/vue/ecosystem/devtools'
        },
        {
          text: 'UI库',
          link: '/frontend/vue/ecosystem/ui'
        },
        {
          text: '测试',
          link: '/frontend/vue/ecosystem/test'
        },

      ]
    },
    {
      text: 'Vue原理',
      items: [
        {
          text: '深入响应式系统',
          link: '/frontend/vue/principle/reactivity'
        },
        {
          text: '编译器原理',
          link: '/frontend/vue/principle/compiler'
        },
      ]
    }
  ],
  '/frontend/typescript/': [
    {
      text: 'TypeScript',
      link: '/frontend/typescript/记录'
    },
    {
      text: 'TypeScript进阶',
      link: '/frontend/typescript/advance'
    },
    {
      text: 'Class',
      link: '/frontend/typescript/class'
    },
  ],
  '/frontend/react/': [
    {
      text: 'React实践',
      items: [
        {
          text: '思考',
          link: '/frontend/react/record/thinking'
        },
        {
          text: '自定义Hooks',
          link: '/frontend/react/customHook/hooks'
        },
        {
          text: 'React with TS',
          link: '/frontend/react/utils/type'
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
      link: '/blog/work-experience/index',
    },
    {
      text: '笔试题',
      link: '/interview/coding',
    },
  ],
  '/fundamentals/operating-systems/': [
    {
      text: '操作系统基础',
      items: [
        {
          text: '第一章 操作系统引论',
          link: '/fundamentals/operating-systems/chapter1'
        },
        {
          text: '第二章 进程与线程',
          link: '/fundamentals/operating-systems/chapter2'
        },
        {
          text: '第三章 内存管理',
          link: '/fundamentals/operating-systems/chapter3'
        },
        {
          text: '第四章 文件管理',
          link: '/fundamentals/operating-systems/chapter4'
        },
        {
          text: '第五章 磁盘和固态硬盘',
          link: '/fundamentals/operating-systems/chapter5'
        },
        {
          text: '强化',
          link: '/fundamentals/operating-systems/强化'
        },
      ]
    }
  ],

  '/fundamentals/exam-408/': [
    {
      text: '2009真题',
      link: '/fundamentals/exam-408/2009'
    },
    {
      text: '2010真题',
      link: '/fundamentals/exam-408/2010'
    },
    {
      text: '2011真题',
      link: '/fundamentals/exam-408/2011'
    },
    {
      text: '2012真题',
      link: '/fundamentals/exam-408/2012'
    },
    {
      text: '2013真题',
      link: '/fundamentals/exam-408/2013'
    },
    {
      text: '2014真题',
      link: '/fundamentals/exam-408/2014'
    },
    {
      text: '2015真题',
      link: '/fundamentals/exam-408/2015'
    },
    {
      text: '2016真题',
      link: '/fundamentals/exam-408/2016'
    },
    {
      text: '2017真题',
      link: '/fundamentals/exam-408/2017'
    },
    {
      text: '2018真题',
      link: '/fundamentals/exam-408/2018'
    },
    {
      text: '2019真题',
      link: '/fundamentals/exam-408/2019'
    },
  ],
  '/fundamentals/computer-networks/': [
    {
      text: '计算机网络基础',
      items: [
        {
          text: '第一章 计算机网络体系结构',
          link: '/fundamentals/computer-networks/chapter1'
        },
        {
          text: '第二章 物理层',
          link: '/fundamentals/computer-networks/chapter2'
        },
        {
          text: '第三章 数据链路层',
          link: '/fundamentals/computer-networks/chapter3'
        },
      ]
    },
    {
      text: 'HTTPS',
      link: '/fundamentals/computer-networks/https'
    },
    {
      text: 'WebSocket',
      link: '/fundamentals/computer-networks/webSocket'
    },
    {
      text: '强化',
      link: '/fundamentals/computer-networks/强化'
    },
  ],

  '/fundamentals/data-structures/': [
    {
      text: '数据结构',
      items: [
        {
          text: '第一章 绪论',
          link: '/fundamentals/data-structures/chapter1'
        },
        {
          text: '第二章 线性表',
          link: '/fundamentals/data-structures/chapter2'
        },
        {
          text: '第三章 栈、队列和数组',
          link: '/fundamentals/data-structures/chapter3'
        },
        {
          text: '第四章 串',
          link: '/fundamentals/data-structures/chapter4'
        },
        {
          text: '第五章 树与二叉树',
          link: '/fundamentals/data-structures/chapter5'
        },
        {
          text: '第六章 图',
          link: '/fundamentals/data-structures/chapter6'
        },
        {
          text: '第七章 查找',
          link: '/fundamentals/data-structures/chapter7'
        },
        {
          text: '第八章 排序',
          link: '/fundamentals/data-structures/chapter8'
        }
      ]

    }, {
      text: '课后习题',
      items: [
        {
          text: '第一章 绪论',
          link: '/fundamentals/data-structures/chapter1_ex'
        },
        {
          text: '第二章 线性表',
          link: '/fundamentals/data-structures/chapter2_ex'
        },
        {
          text: '强化',
          link: '/fundamentals/data-structures/强化'
        }

      ]
    }
  ],
  '/fundamentals/computer-organization/': [
    {
      text: '计算机组成原理',
      items: [
        {
          text: '第一章 计算机系统概述',
          link: '/fundamentals/computer-organization/chapter1'
        },
        {
          text: '第二章 数据的表示和运算',
          link: '/fundamentals/computer-organization/chapter2'
        },
        {
          text: '第三章 存储系统',
          link: '/fundamentals/computer-organization/chapter3'
        },
        {
          text: '第四章 指令系统',
          link: '/fundamentals/computer-organization/chapter4'
        },
        {
          text: '第五章 中央处理器',
          link: '/fundamentals/computer-organization/chapter5'
        },
        {
          text: '第六章 总线',
          link: '/fundamentals/computer-organization/chapter6'
        },
        {
          text: '第七章 输入/输出系统',
          link: '/fundamentals/computer-organization/chapter7'
        },
        {
          text: '强化',
          link: '/fundamentals/computer-organization/强化'
        },
      ]
    }
  ],
  '/frontend/webpack/': [
    {
      text: 'WebPack',
      items: [
        {
          text: '基础篇',
          link: '/frontend/webpack/basic'
        },
        {
          text: '实战篇',
          link: '/frontend/webpack/practice'
        },
        {
          text: '优化篇',
          link: '/frontend/webpack/optimization'
        },
        {
          text: '原理篇',
          link: '/frontend/webpack/principle'
        },
        {
          text: '性能优化',
          link: '/frontend/webpack/performance'
        },
      ]
    },

  ],
  '/frontend/browser/': [
    {
      text: '宏观视角下的浏览器',
      items: [
        {
          text: 'Chorme架构',
          link: '/frontend/browser/Chrome架构'
        },
        {
          text: 'TCP协议',
          link: '/frontend/browser/TCP协议'
        },
        {
          text: 'HTTP协议',
          link: '/frontend/browser/HTTP'
        },
        {
          text: '导航流程',
          link: '/frontend/browser/导航流程'
        },
        {
          text: '渲染流程（上）',
          link: '/frontend/browser/renderfirst'
        },
        {
          text: '渲染流程（下）',
          link: '/frontend/browser/rendersec'
        },
      ]
    },

    {
      text: 'Javascript中的执行机制',
      items: [
        {
          text: '变量提升',
          link: '/frontend/browser/变量提升'
        },
        {
          text: '调用栈',
          link: '/frontend/browser/调用栈'
        },
        {
          text: '块级作用域',
          link: '/frontend/browser/块级作用域'
        },
        {
          text: '作用域链和闭包',
          link: '/frontend/browser/作用域链和闭包'
        },
        {
          text: 'This',
          link: '/frontend/browser/this'
        },
      ]
    },
    {
      text: 'V8工作原理',
      items: [
        {
          text: '栈空间和堆空间',
          link: '/frontend/browser/栈和堆'
        },
        {
          text: '垃圾回收',
          link: '/frontend/browser/垃圾回收'
        },
        {
          text: '编译器和解释器',
          link: '/frontend/browser/编译器和解释器'
        },
      ]
    },
    {
      text: '浏览器中的页面循环系统',
      items: [
        {
          text: '消息队列和事件循环',
          link: '/frontend/browser/消息队列和事件循环'
        },
        {
          text: 'setTimeout 是如何实现的？',
          link: '/frontend/browser/setTimeout如何实现'
        },
        {
          text: 'XMLHttpRequest 是怎么实现的？',
          link: '/frontend/browser/XMLHttpRequest'
        },
        {
          text: '宏任务和微任务',
          link: '/frontend/browser/宏任务和微任务'
        },
        {
          text: 'Promise',
          link: '/frontend/browser/Promise'
        },
        {
          text: 'async/await',
          link: '/frontend/browser/async&await'
        },
      ]
    },
    {
      text: '浏览器中的页面',
      items: [
        {
          text: 'Chrome开发者工具',
          link: '/frontend/browser/Chrome开发者工具'
        },
        {
          text: 'DOM树',
          link: '/frontend/browser/DOM树'
        },
        {
          text: '渲染流水线',
          link: '/frontend/browser/渲染流水线'
        },
        {
          text: '分层和合成机制',
          link: '/frontend/browser/分层和合成'
        },
        {
          text: '页面性能',
          link: '/frontend/browser/页面性能'
        },
        {
          text: '虚拟DOM',
          link: '/frontend/browser/虚拟DOM'
        },
        {
          text: '渐进式网页应用PWA',
          link: '/frontend/browser/渐进式网页应用PWA'
        },
      ]
    },
    {
      text: '浏览器中的网络',
      items: [
        {
          text: 'HTTP1',
          link: '/frontend/browser/HTTP1'
        },
        {
          text: 'HTTP2',
          link: '/frontend/browser/HTTP2'
        },
        {
          text: 'HTTP3',
          link: '/frontend/browser/HTTP3'
        }
      ]
    },
    {
      text: "浏览器安全",
      items: [
        {
          text: '同源策略',
          link: '/frontend/browser/同源策略'
        },
        {
          text: '跨站脚本攻击XSS',
          link: '/frontend/browser/跨站脚本攻击XSS'
        },
        {
          text: 'CSRF攻击',
          link: '/frontend/browser/CSRF攻击'
        },
        {
          text: '安全沙箱',
          link: '/frontend/browser/安全沙箱'
        },
        {
          text: 'HTTPS',
          link: '/frontend/browser/HTTPS'
        },
      ]
    },
    {
      text: '浏览上下文组',
      link: '/frontend/browser/浏览上下文组'
    },
    {
      text: '任务调度',
      link: '/frontend/browser/任务调度'
    },
    {
      text: '加载阶段性能',
      link: '/frontend/browser/加载阶段性能'
    },
    {
      text: 'Performance',
      link: '/frontend/browser/Performance'
    },
    {
      text: 'Performance中的Main指标',
      link: '/frontend/browser/Performance中的Main指标'
    },
  ],
  '/blog/work-experience/': [
    {
      text: '项目总结',
      link: '/blog/work-experience/index'
    },
    {
      text: 'TMM',
      link: '/blog/work-experience/tmm',
      items: [
        {
          text: 'TMM模块重构与架构设计',
          link: '/blog/work-experience/tmm/architecture'
        },
        {
          text: '本地化搜索引擎实现',
          link: '/blog/work-experience/tmm/local_search'
        },
        {
          text: '@功能的高效实现',
          link: '/blog/work-experience/tmm/mention'
        },
        {
          text: 'ELectron大文件分片上传、断点续传、并行上传',
          link: '/blog/work-experience/tmm/partFileUpload'
        },
        {
          text: 'TMM性能优化',
          link: '/blog/work-experience/tmm/performance_optimization'
        },
        {
          text: '基于RBAC模型的群组权限体系设计与实现',
          link: '/blog/work-experience/tmm/RBAC'
        },
        {
          text: '基于AWS和Node流式大文件下载',
          link: '/blog/work-experience/tmm/resources_manner'
        }
      ]
    }
  ],
  '/fundamentals/algorithms/': [
    {
      text: '退避算法',
      link: '/fundamentals/algorithms/退避算法'
    },
    {
      text: 'LRU算法',
      link: '/fundamentals/algorithms/LRU'
    },
  ],
  '/certifications/software-exam/': [
    {
      text: '软考-软件设计师',
      link: '/certifications/software-exam/软件设计师/index'
    },
    {
      text: '软考-系统架构设计师',
      link: '/certifications/software-exam/架构师/01绪论'
    },
    {
      text: '时间规划',
      link: '/certifications/software-exam/软件设计师/schedule'
    },
    {
      text: '软件工程',
      link: '/certifications/software-exam/softExam/softwareEngineering'
    },
    {
      text: '面向对象',
      link: '/certifications/software-exam/面向对象'
    },
    {
      text: '数据库',
      link: '/certifications/software-exam/database'
    },
    {

    }
  ],
  '/ai/': [
    {
      text: 'AI',
      link: '/ai/index'
    },
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
          text: 'Dify介绍',
          link: '/ai/Dify/index'
        }
      ]
    }
  ],
  '/frontend/design-patterns/': [
    {
      text: '设计模式',
      link: '/frontend/design-patterns/index'
    },
    {
      text: '模版方法',
      link: '/frontend/design-patterns/模版方法'
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
