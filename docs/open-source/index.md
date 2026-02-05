# 开源项目

构建赋能开发者的工具，持续为开源社区贡献力量。

<MProjectShowcase :projects="[
  {
    name: 'GitLab MCP',
    icon: '🤖',
    desc: 'MCP（Model Context Protocol）服务器，为 AI 助手提供 GitLab 集成能力。支持智能代码审查、Merge Request 管理、仓库文件探索和 Pipeline 状态监控。让 AI 助手能够直接与 GitLab 交互，提升开发效率。',
    features: ['AI 智能代码审查', 'Merge Request 管理', '仓库文件探索', 'Pipeline 状态监控', '多项目支持', 'Token 认证'],
    links: { github: 'https://github.com/LynnCen/gitlab-mcp' },
    tags: ['MCP', 'AI', 'GitLab', 'Code Review']
  },
  {
    name: 'LynKit',
    icon: '⚛️',
    desc: '现代化 React 组件生态系统，包含四个核心包：@lynkit/ui 提供精美的 UI 组件，@lynkit/hooks 提供常用自定义 Hooks，@lynkit/utils 提供通用工具函数，@lynkit/icons 提供图标组件库。完整的 TypeScript 支持和详细文档。',
    features: ['React UI 组件库', '自定义 Hooks 集合', '通用工具函数', '图标组件库', 'TypeScript 支持', '完整文档'],
    links: { docs: 'https://lynncen.github.io/LynKit/', github: 'https://github.com/LynnCen/LynKit' },
    tags: ['React', 'Hooks', 'UI', 'TypeScript']
  },
  {
    name: 'TransLink i18n',
    icon: '🌍',
    desc: '前端国际化 CLI 解决方案。基于 AST 智能提取代码中的文案，集成 AI 翻译能力实现自动翻译，支持增量更新避免重复翻译。同时支持 React 和 Vue 项目，通过简单的配置即可快速集成。',
    features: ['AST 智能文案提取', 'AI 翻译集成', '增量更新支持', 'React/Vue 支持', '命令行工具', '配置灵活'],
    links: { github: 'https://github.com/LynnCen/translink-i18n' },
    tags: ['i18n', 'CLI', 'AST', 'AI']
  },
  {
    name: 'Picto',
    icon: '🎨',
    desc: '自动化图标管理 CLI 工具。支持从 Figma 自动同步图标，内置 SVG 优化，可生成多框架（React、Vue 等）的图标组件。支持 Tree-shaking，批量处理和配置化管理，让图标管理更加高效。',
    features: ['Figma 图标同步', 'SVG 自动优化', '多框架组件生成', 'Tree-shaking 支持', '批量处理', '配置化管理'],
    links: { github: 'https://github.com/LynnCen/picto' },
    tags: ['Icons', 'Figma', 'SVG', 'CLI']
  }
]" />
