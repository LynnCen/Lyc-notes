import type { NavLink } from '../.vitepress/theme/types'

type NavData = {
  title: string
  items: NavLink[]
}

export const data: NavData[] = [
  {
    title: '前端杂记',
    items: [
      {
        icon: '📡',
        title: 'HTTP、WebSocket、SSE、长短轮询',
        desc: '现代Web实时通信技术全景对比：HTTP、WebSocket、SSE、长短轮询',
        link: '/posts/communicationMechanisms',
      },
      {
        icon: '⚡',
        title: '数据预加载实现',
        desc: '前端数据预加载实现',
        link: '/posts/dataPreFetch',
      },
      {
        icon: '🔄',
        title: 'IM多端一致性',
        desc: '在即时通讯（IM）系统中，用户通常会在多个终端（手机、平板、电脑）同时登录，这就带来了会话状态（如置顶、静音、未读计数等）如何在多端保持一致的问题。本文将从分布式系统的CAP理论出发，探讨IM场景下的多端一致性解决方案，并提供基于TypeScript和IndexedDB的实现代码。',
        link: '/posts/IM多端一致性',
      },
      {
        icon: '🎨',
        title: '现代前端渲染模式',
        desc: '本文将详细介绍现代前端框架中的三种主要渲染模式:CSR(客户端渲染)、SSR(服务端渲染)和SSG(静态站点生成),分析它们各自的优缺点和适用场景。',
        link: '/posts/renderMode',
      },
      {
        icon: '📱',
        title: 'rpx 转换为 vw/vh 的完整指南',
        desc: '在移动端开发中,rpx(responsive pixel)是一个常用的响应式单位。本文将详细介绍如何将rpx转换为vw/vh,以实现更好的跨设备适配。',
        link: '/posts/rpxTovw',
      },
      {
        icon: '💀',
        title: 'SSG骨架屏',
        desc: '流程：首屏加载骨架屏，等待接口请求完成后展示真实DOM。本文介绍了SSG骨架屏的实现原理和具体实现方案。',
        link: '/posts/skelon',
      },
      {
        icon: '🎯',
        title: 'UnoCSS插件',
        desc: '本文介绍了原子化CSS的概念以及UnoCSS的使用方法,并提供了一个自定义UnoCSS插件的实现示例,用于支持rpx单位和常用样式类。',
        link: '/posts/uno-css-jp',
      },
    ],
  },
  {
    title: 'IM实时通讯系统',
    items: [
      {
        icon: '',
        title: 'IM即时通讯系统核心模块框架设计',
        desc: '基于关注点分离原则，将聊天模块重构为五层架构',
        link: '/project/tmm/architecture',
      },
      {
        icon: '',
        title: 'ELectron大文件分片上传、断点续传、并行上传',
        desc: '基于 AWS S3 实现大文件分片上传、断点续传、并行上传功能,包括文件分片、上传进度跟踪、失败重试等核心功能',
        link: '/project/tmm/partFileUpload',
      },
      {
        icon: '',
        title: 'IM性能优化',
        desc: '通过虚拟列表、消息分页加载、图片懒加载等技术优化IM系统性能,重点解决大量消息渲染和滚动卡顿问题',
        link: '/project/tmm/performance_optimization',
      },
      {
        icon: '',
        title: '本地化搜索引擎实现',
        desc: '基于 IndexedDB、位运算和 Web Worker 构建高效的本地搜索引擎',
        link: '/project/tmm/local_search',
      },
      {
        icon: '',
        title: '基于RBAC模型的群组权限体系设计与实现',
        desc: '基于RBAC权限模型设计群组权限体系,实现多级群组结构、动态权限变更、批量权限操作等功能',
        link: '/project/tmm/RBAC',
      },
      {
        icon: '',
        title: '基于AWS和Node流式大文件下载',
        desc: '使用Node流式传输和AWS S3实现大文件下载,通过背压控制机制保证内存使用效率',
        link: '/project/tmm/resources_manner',
      },
    ],
  },
  {
    title: '实时视频&AI会话',
    items: [
      {
        icon: '',
        title: '实时视频通信系统架构设计',
        desc: '',
        link: '/project/platform/video-architecture',
      },
      {
        icon: '',
        title: 'AI智能客服系统设计',
        desc: '',
        link: '/project/platform/ai-service',
      },
    ],
  },
]

