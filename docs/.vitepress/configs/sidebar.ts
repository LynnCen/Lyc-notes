import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
    '/Javascript/Javascript进阶/': [
        {
            text: '调用堆栈',
            items: [
                {
                    text: '执行上下文和执行栈',
                    link: 'Javascript/Javascript进阶/执行上下文和执行栈'
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


    ]
}
