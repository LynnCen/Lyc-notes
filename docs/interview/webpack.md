### 讲一下 webpack 常用的属性 如何实现不将 react 和 antd 不打包

entry
output
loader
plugin

疑问点：
如何实现不将 react 和 antd 不打包
`externals`属性

```js
module.exports = {
  // ...
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
  },
}
```
