# WebPack性能优化
<link rel="stylesheet" type="text/css" href="styles.css" ></link>

## 加快打包速度
### 使用`speed-measure-webpack-plugin`插件测量打包速度
使用 <a class='no-underline' href='https://github.com/stephencookdev/speed-measure-webpack-plugin' >`speed-measure-webpack-plugin`</a> 插件可以测量各个**插件**和 **loader**所花费的时间，量化打包速度，对比前后的信息，判断优化效果。
```js
//webpack.config.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
    //...webpack配置，不用在写 module.exports
}

module.exports = smp.wrap(config);
```
### 缩小文件的搜索范围
**作用：**
1. **提高构建速度**：通过缩小模块搜索的范围，Webpack 可以更快地找到所需的模块文件，从而提高构建的速度。默认情况下，Webpack会在项目根目录下的 `node_modules`目录以及`webpack.config.js` 文件所在目录下搜索模块，但是这个范围可能会很大，特别是在大型项目中，通过设置搜索范围可以避免不必要的遍历和查找，加快构建速度。

2. **减少不必要的查找**：在开发过程中，经常会引入各种第三方库或者自定义模块，如果不设置搜索范围，Webpack 可能会在很多目录下进行模块查找，导致效率低下。通过设置搜索范围，可以减少不必要的查找，提高开发效率。

3. **避免命名冲突**：在多个模块目录下可能存在相同名称的模块，设置搜索范围可以明确告诉 Webpack 哪些目录下的模块优先级更高，避免命名冲突问题。


*配置`include/exclude`、`resolve.modules`、`resolve.mainFields`、 `alias` 、`noParse` 、`extensions`*
- *`include/exclude`*
  

  在使用 `Loader` 时可以通过 `test`、 `include` 、 `exclude` 三个配置项来命中 `Loader` 要应用规则的文件。 为了尽可能少的让文件被 `Loader` 处理，可以通过 `include` 去命中只有哪些文件需要被处理。
<br/>

  `exclude` 指定要排除的文件，`include` 指定要包含的文件。`exclude` 的优先级高于 `include`，在 `include` 和 `exclude` 中使用绝对路径数组，尽量避免 `exclude`，更倾向于使用 include。

```js
const path = require('path');
module.exports = {
  module: {
    rules: [
      {
        // 如果项目源码中只有 js 文件就不要写成 /\.jsx?$/，提升正则表达式性能
        test: /\.js$/,
        // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
        use: ['babel-loader?cacheDirectory'],
        // 只对项目根目录下的 src 目录中的文件采用 babel-loader
        include: path.resolve(__dirname, 'src'),
      },
    ]
  },
};
```
- 
## 减少打包体积
