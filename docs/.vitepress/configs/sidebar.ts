import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
    '/Javascript/Javascript进阶/': [
        {
            text: '调用堆栈',
            items: [
                { text: '执行上下文和执行栈', link: 'Javascript/Javascript进阶/执行上下文和执行栈' }
            ]
        }
    ],
    '/docs/': [
        {
            text: '快速上手',
            link: '/docs/hello',
            items: [
                { text: 'hello', link: '/docs/hello' },
                { text: '欢迎使用', link: '/docs/welcome' }
            ]
        }
    ]
}
