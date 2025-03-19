# uno-css-jp

> 什么是原子化CSS，UnoCSS又是什么，[重新构想原子化 CSS](/posts/reimagine-atomic-css.md)
> 
>参考 antfu.me https://antfu.me/posts/reimagine-atomic-css-zh
## uno-css插件

```ts
const presetTmgJP: any = {
  name: 'tmg-JP',
  rules: [
    // 外边距
    [/^mt-(\d+)$/, ([, value]) => ({ 'margin-top': `${value}rpx` })],
    [/^mr-(\d+)$/, ([, value]) => ({ 'margin-right': `${value}rpx` })],
    [/^mb-(\d+)$/, ([, value]) => ({ 'margin-bottom': `${value}rpx` })],
    [/^ml-(\d+)$/, ([, value]) => ({ 'margin-left': `${value}rpx` })],
    [/^m-(\d+)$/, ([, value]) => ({ margin: `${value}rpx` })],
    // 内边距
    [/^pt-(\d+)$/, ([, value]) => ({ 'padding-top': `${value}rpx` })],
    [/^pr-(\d+)$/, ([, value]) => ({ 'padding-right': `${value}rpx` })],
    [/^pb-(\d+)$/, ([, value]) => ({ 'padding-bottom': `${value}rpx` })],
    [/^pl-(\d+)$/, ([, value]) => ({ 'padding-left': `${value}rpx` })],
    [/^p-(\d+)$/, ([, value]) => ({ padding: `${value}rpx` })],
    // 边框
    ['border', { border: '2rpx solid #eee' }],
    ['border-solid', { 'border-style': 'solid' }],
    ['border-dashed', { 'border-style': 'dashed' }],
    ['border-gray', { 'border-color': '#eee' }],
    [/^border-(\d+)$/, ([, value]) => ({ 'border-width': `${value}rpx` })],
    // 圆角
    [/^rounded-(\d+)$/, ([, value]) => ({ 'border-radius': `${value}rpx` })],
    // position
    ['static', { position: 'static' }],
    ['fixed', { position: 'fixed' }],
    ['absolute', { position: 'absolute' }],
    ['relative', { position: 'relative' }],
    ['sticky', { position: 'sticky' }],
    // 背景色
    ['bg-gray', { 'background-color': '#F5F5F5' }],
    // 字体大小
    [/^text-(\d+)$/, ([, value]) => ({ 'font-size': `${value}rpx` })],
    // 字体颜色
    ['text-primary', { color: 'var(--color-brand-primary, #333)' }],
    ['text-green', { color: 'var(--color-function-1-1, #00b716)' }],
    ['text-blue', { color: 'var(--color-function-2-1, #3170EE)' }],
    ['text-red', { color: 'var(--color-function-3-1, #E35959)' }],
    ['text-orange', { color: 'var(--color-function-3-2, #ff8214)' }],
    // font weight
    ['font-thin', { 'font-weight': 100 }],
    ['font-extralight', { 'font-weight': 200 }],
    ['font-light', { 'font-weight': 300 }],
    ['font-normal', { 'font-weight': 400 }],
    ['font-medium', { 'font-weight': 500 }],
    ['font-semibold', { 'font-weight': 600 }],
    ['font-bold', { 'font-weight': 700 }],
    ['font-extrabold', { 'font-weight': 800 }],
    ['font-black', { 'font-weight': 900 }],
    // width
    ['w-full', { width: '100%' }],
    [/^w-(\d+)$/, ([, value]) => ({ width: `${value}rpx` })],
    // height
    ['h-full', { height: '100%' }],
    [/^h-(\d+)$/, ([, value]) => ({ height: `${value}rpx` })],
    // display
    ['block', { display: 'block' }],
    ['inline-block', { display: 'inline-block' }],
    ['flex', { display: 'flex' }],
    // Text Decoration
    ['underline', { 'text-decoration-line': 'underline' }],
    ['overline', { 'text-decoration-line': 'overline' }],
    ['line-through', { 'text-decoration-line': 'line-through' }],
    ['no-underline', { 'text-decoration-line': 'none' }],
    // flex style
    ['flex-row', { 'flex-direction': 'row' }],
    ['flex-row-reverse', { 'flex-direction': 'row-reverse' }],
    ['flex-col', { 'flex-direction': 'column' }],
    ['flex-col-reverse', { 'flex-direction': 'column-reverse' }],
    ['flex-wrap', { 'flex-wrap': 'wrap' }],
    ['flex-wrap-reverse', { 'flex-wrap': 'wrap-reverse' }],
    ['flex-nowrap', { 'flex-wrap': 'nowrap' }],
    ['justify-center', { 'justify-content': 'center' }],
    ['justify-start', { 'justify-content': 'flex-start' }],
    ['justify-end', { 'justify-content': 'flex-end' }],
    ['justify-between', { 'justify-content': 'space-between' }],
    ['justify-around', { 'justify-content': 'space-around' }],
    ['items-center', { 'align-items': 'center' }],
    ['items-start', { 'align-items': 'flex-start' }],
    ['items-end', { 'align-items': 'flex-end' }],
    ['self-start', { 'align-self': 'flex-start' }],
    ['self-end', { 'align-self': 'flex-end' }],
    ['self-center', { 'align-self': 'center' }],
    ['flex-1', { flex: '1 1 0%' }],
  ],
};

export default presetTmgJP;

```

## 配置ice.config.mts


```ts

// >>第一步<< 配置ice.config.mts
import Unocss from '@ice/plugin-unocss';
// JP移动站点预设配置
import presetJP from '@ali/odin-jp-api/lib/presets/preset-jp.js'

export default defineConfig(() => ({
  // ...
  plugins: [
    // ...
    Unocss({
      presets: [presetJP.default]
    })
  ],
  // ...
}))

```

## 组件使用

```tsx
// >>第二步<< 组件怎么写
const Component: FC = () => {

  return (
    // 自定义的css module
    <div className={styles.container}>
      // 预设样式里的数值类均已转换成rpx;色值类将优先跟随@ali/odin-ui的主题色
      // 以下等同于 padding-left: 7rpx;margin-top: 8rpx;color: var(--color-function-3-2, #ff8214) 
      <div className='pl-7 mt-8 text-12 text-orange'>文本</div>
    </div>
  );
};
```
