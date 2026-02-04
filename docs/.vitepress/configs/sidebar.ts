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
  '/ai/mcp/': [
    {
      text: 'MCP 协议',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: 'BrowserTools MCP', link: '/ai/mcp/browserTools' },
        { text: 'Cursor MCP', link: '/ai/mcp/cursor-mcp' },
        { text: 'Figma MCP', link: '/ai/mcp/figma' }
      ]
    }
  ],
  '/ai/Dify/': [
    {
      text: 'Dify 平台',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: 'Dify 介绍', link: '/ai/Dify/index' }
      ]
    }
  ],
  '/ai/sam/': [
    {
      text: 'SAM 图像分割',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: 'SAM 概述', link: '/ai/sam/' },
        { text: 'SAM 主体选择深度解析', link: '/ai/sam/SAM主体选择深度解析' }
      ]
    }
  ],
  '/ai/机器学习/': [
    {
      text: '机器学习',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: '逻辑回归', link: '/ai/机器学习/逻辑回归' },
        { text: '其他机器学习方法', link: '/ai/机器学习/其他机器学习方法' }
      ]
    }
  ],
  '/ai/深度学习/': [
    {
      text: '深度学习',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: '卷积神经网络基础', link: '/ai/深度学习/卷积神经网络基础' }
      ]
    }
  ],
  '/ai/posts/': [
    {
      text: 'LLM 基础',
      items: [
        { text: '← 返回 AI 模块', link: '/ai/' },
        { text: 'AI 基础', link: '/ai/posts/ai' },
        { text: 'LLM 概述', link: '/ai/posts/LLM' }
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
  // CV 模块 - 图形与渲染
  '/cv/计算机图形学原理/': [
    {
      text: '计算机图形学原理',
      items: [
        { text: '← 返回图形模块', link: '/cv/' },
        { text: '教学大纲', link: '/cv/计算机图形学原理/00-教学大纲与目录' },
        { text: '图形学概述', link: '/cv/计算机图形学原理/01-图形学概述' },
        { text: '向量与线性代数', link: '/cv/计算机图形学原理/02-向量与线性代数基础' },
        { text: '矩阵与变换', link: '/cv/计算机图形学原理/03-矩阵与变换' },
        { text: '齐次坐标与投影', link: '/cv/计算机图形学原理/04-齐次坐标与投影' },
        { text: '2D 图形绘制算法', link: '/cv/计算机图形学原理/05-2D图形绘制算法' },
        { text: '曲线与曲面', link: '/cv/计算机图形学原理/06-曲线与曲面' },
        { text: '几何建模基础', link: '/cv/计算机图形学原理/07-几何建模基础' },
        { text: '可见性与遮挡', link: '/cv/计算机图形学原理/08-可见性与遮挡' },
        { text: '光照与着色模型', link: '/cv/计算机图形学原理/09-光照与着色模型' },
        { text: '纹理映射', link: '/cv/计算机图形学原理/10-纹理映射' },
        { text: '碰撞检测算法', link: '/cv/计算机图形学原理/11-碰撞检测算法' },
        { text: '空间索引与加速', link: '/cv/计算机图形学原理/12-空间索引与加速结构' },
        { text: '图像处理基础', link: '/cv/计算机图形学原理/13-图像处理基础' },
        { text: '颜色科学', link: '/cv/计算机图形学原理/14-颜色科学' },
        { text: '前沿技术', link: '/cv/计算机图形学原理/15-前沿技术与发展方向' }
      ]
    }
  ],
  '/cv/Canvas2D基础/': [
    {
      text: 'Canvas2D 基础',
      items: [
        { text: '← 返回图形模块', link: '/cv/' },
        { text: '教学大纲', link: '/cv/Canvas2D基础/00-教学大纲与目录' },
        { text: 'Canvas 元素与环境', link: '/cv/Canvas2D基础/01-Canvas元素与绑制环境' },
        { text: '基础图形绑制', link: '/cv/Canvas2D基础/02-基础图形绑制' },
        { text: '路径与贝塞尔曲线', link: '/cv/Canvas2D基础/03-路径与贝塞尔曲线' },
        { text: '样式与颜色系统', link: '/cv/Canvas2D基础/04-样式与颜色系统' },
        { text: '变换与坐标系统', link: '/cv/Canvas2D基础/05-变换与坐标系统' },
        { text: '图像与像素操作', link: '/cv/Canvas2D基础/06-图像与像素操作' },
        { text: '合成与混合模式', link: '/cv/Canvas2D基础/07-合成与混合模式' },
        { text: '文本渲染', link: '/cv/Canvas2D基础/08-文本渲染' },
        { text: '动画与帧循环', link: '/cv/Canvas2D基础/09-动画与帧循环' },
        { text: '离屏渲染与优化', link: '/cv/Canvas2D基础/10-离屏渲染与性能优化' },
        { text: '实战案例', link: '/cv/Canvas2D基础/11-实战案例与最佳实践' }
      ]
    }
  ],
  '/cv/WebGL基础/': [
    {
      text: 'WebGL 基础',
      items: [
        { text: '← 返回图形模块', link: '/cv/' },
        { text: '教学大纲', link: '/cv/WebGL基础/00-教学大纲与目录' },
        { text: 'WebGL 概述与搭建', link: '/cv/WebGL基础/01-WebGL概述与环境搭建' },
        { text: '渲染管线详解', link: '/cv/WebGL基础/02-渲染管线详解' },
        { text: '着色器与 GLSL', link: '/cv/WebGL基础/03-着色器与GLSL' },
        { text: '缓冲区与顶点数据', link: '/cv/WebGL基础/04-缓冲区与顶点数据' },
        { text: '纹理与采样', link: '/cv/WebGL基础/05-纹理与采样' },
        { text: '矩阵变换与相机', link: '/cv/WebGL基础/06-矩阵变换与相机' },
        { text: '光照与材质', link: '/cv/WebGL基础/07-光照与材质' },
        { text: '帧缓冲与离屏', link: '/cv/WebGL基础/08-帧缓冲与离屏渲染' },
        { text: '混合与深度测试', link: '/cv/WebGL基础/09-混合与深度测试' },
        { text: 'WebGL2 新特性', link: '/cv/WebGL基础/10-WebGL2新特性' },
        { text: '性能优化与调试', link: '/cv/WebGL基础/11-性能优化与调试' },
        { text: '实战案例集', link: '/cv/WebGL基础/12-实战案例集' }
      ]
    }
  ],
  '/cv/PixiJS实战/': [
    {
      text: 'PixiJS 实战',
      items: [
        { text: '← 返回图形模块', link: '/cv/' },
        { text: '教学大纲', link: '/cv/PixiJS实战/00-教学大纲与目录' },
        { text: '快速入门', link: '/cv/PixiJS实战/01-PixiJS概述与快速入门' },
        { text: 'Application 与渲染器', link: '/cv/PixiJS实战/02-Application与渲染器' },
        { text: '显示对象体系', link: '/cv/PixiJS实战/03-显示对象体系' },
        { text: 'Container 与场景图', link: '/cv/PixiJS实战/04-Container容器与场景图' },
        { text: 'Sprite 与纹理', link: '/cv/PixiJS实战/05-Sprite精灵与纹理' },
        { text: 'Graphics 图形', link: '/cv/PixiJS实战/06-Graphics图形绘制' },
        { text: 'Text 文本', link: '/cv/PixiJS实战/07-Text文本渲染' },
        { text: 'Transform 变换', link: '/cv/PixiJS实战/08-Transform变换系统' },
        { text: '交互与事件', link: '/cv/PixiJS实战/09-交互与事件系统' },
        { text: '资源加载', link: '/cv/PixiJS实战/10-纹理管理与资源加载' },
        { text: '滤镜与特效', link: '/cv/PixiJS实战/11-滤镜与特效' },
        { text: '遮罩与混合', link: '/cv/PixiJS实战/12-遮罩与混合模式' },
        { text: 'Ticker 与动画', link: '/cv/PixiJS实战/13-Ticker与动画' },
        { text: '性能优化', link: '/cv/PixiJS实战/14-性能优化实践' },
        { text: '高级特性', link: '/cv/PixiJS实战/15-高级特性与扩展' }
      ]
    }
  ],
  '/cv/无限画布/': [
    {
      text: '无限画布',
      items: [
        { text: '← 返回图形模块', link: '/cv/' },
        { text: '教学大纲', link: '/cv/无限画布/00-教学大纲与目录' },
        { text: '代码路径与模块', link: '/cv/无限画布/01-代码路径与模块映射' },
        { text: '基础概念与选型', link: '/cv/无限画布/02-基础概念与技术选型' },
        { text: '坐标系统与变换', link: '/cv/无限画布/03-坐标系统与矩阵变换' },
        { text: 'Viewport 视口', link: '/cv/无限画布/04-Viewport视口管理' },
        { text: 'VmEngine 引擎', link: '/cv/无限画布/05-VmEngine视图模型引擎' },
        { text: '元素生命周期', link: '/cv/无限画布/06-元素生命周期与渲染' },
        { text: '事件与碰撞检测', link: '/cv/无限画布/07-事件系统与碰撞检测' },
        { text: '手势与交互', link: '/cv/无限画布/08-手势与交互处理' },
        { text: '插件系统', link: '/cv/无限画布/09-插件系统架构' },
        { text: '性能优化', link: '/cv/无限画布/10-性能优化策略' },
        { text: '导出与截图', link: '/cv/无限画布/11-导出与截图' },
        { text: '总结与实践', link: '/cv/无限画布/12-总结与最佳实践' }
      ]
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
