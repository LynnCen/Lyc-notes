# Webpack 优化篇

## 二、优化效率工具

在优化开始之前，需要做一些准备工作。

安装以下 webpack 插件，帮助我们分析优化效率：

- [progress-bar-webpack-plugin](https://www.npmjs.com/package/progress-bar-webpack-plugin)：查看编译进度；
- [speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin)：查看编译速度；
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)：打包体积分析。
### 1. 编译进度条
一般来说，中型项目的首次编译时间为 5-20s，没个进度条等得多着急，通过 [progress-bar-webpack-plugin](https://www.npmjs.com/package/progress-bar-webpack-plugin)插件查看编译进度，方便我们掌握编译情况。
安装：
 
```javascript
npm i -D progress-bar-webpack-plugin
```
webpack.common.js 配置方式如下：
 
```javascript
const chalk = require('chalk')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
module.exports = {
  plugins: [
    // 进度条
    new ProgressBarPlugin({
        format: `  :msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`
      })
  ],
}
```
> 贴心的为进度百分比添加了加粗和绿色高亮态样式。

包含内容、进度条、进度百分比、消耗时间，进度条效果如下：![image.png](https://cdn.nlark.com/yuque/0/2024/png/207857/1717638392007-fd225235-4f90-419d-9557-af9661a526a9.png#averageHue=%23414939&clientId=u2e41d603-2066-4&from=paste&height=188&id=ua9410593&originHeight=338&originWidth=1482&originalType=binary&ratio=1.7999999523162842&rotation=0&showTitle=false&size=438510&status=done&style=none&taskId=u2c15ffe5-d653-4945-856d-c9a27481a38&title=&width=823.3333551442188)
###  2. 编译速度分析
优化 webpack 构建速度，首先需要知道是哪些插件、哪些 loader 耗时长，方便我们针对性的优化。
通过 [speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin)插件进行构建速度分析，可以看到各个 loader、plugin 的构建时长，后续可针对耗时 loader、plugin 进行优化。
安装：
 
```javascript
pnpm  add -D speed-measure-webpack-plugin
```
webpack.dev.js 配置方式如下：

```javascript
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
module.exports = smp.wrap({
  // ...webpack config...
})
```
包含各工具的构建耗时，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/207857/1717638417656-70a71f3e-794f-4bff-9ffd-d5e37b568f96.png#averageHue=%23233740&clientId=u2e41d603-2066-4&from=paste&height=262&id=ucc56b5bf&originHeight=946&originWidth=850&originalType=binary&ratio=1.7999999523162842&rotation=0&showTitle=false&size=773968&status=done&style=none&taskId=ubfea046e-e708-4928-bc5d-12ef5832754&title=&width=235.22225952148438)
### 3. 打包体积分析
同样，优化打包体积，也需要先分析各个 bundle 文件的占比大小，来进行针对优化。
使用 [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)查看打包后生成的 bundle 体积分析，将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式。帮助我们分析输出结果来检查模块在何处结束。
安装：
 
```javascript
pnpm add -D webpack-bundle-analyzer
```
webpack.prod.js 配置方式如下：
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  plugins: [
    // 打包体积分析
    new BundleAnalyzerPlugin()
  ],
}
```
包含各个 bundle 的体积分析，效果如下：![image.png](https://cdn.nlark.com/yuque/0/2024/png/207857/1717638449475-db06f0a7-7af7-4c8e-8b65-3cf8f2bc9f1b.png#averageHue=%23e4e2db&clientId=u2e41d603-2066-4&from=paste&height=458&id=u75e8999f&originHeight=824&originWidth=1822&originalType=binary&ratio=1.7999999523162842&rotation=0&showTitle=false&size=1117026&status=done&style=none&taskId=uda6e2632-3a51-4782-a5cc-7e51be34442&title=&width=1012.2222490369545)
## 三、优化开发体验

### 1. 自动更新
[自动更新](https://webpack.docschina.org/guides/development/#choosing-a-development-tool)指的是，在开发过程中，修改代码后，无需手动再次编译，可以自动编译代码更新编译后代码的功能。
webpack 提供了以下几种可选方式，实现自动更新功能：

1. webpack's [Watch Mode](https://webpack.docschina.org/configuration/watch/#watch)
2. [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
3. [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)

webpack 官方推荐的方式是 webpack-dev-server，在 学习 Webpack5 之路（实践篇）- DevServer 章节已经介绍了 [webpack-dev-server](https://github.com/webpack/webpack-dev-server)帮助我们在代码发生变化后自动编译代码实现**自动更新**的用法，在这里不重复赘述。
_这是针对开发环境的优化，修改 webpack.dev.js 配置。_
### 2. 热更新
[热更新](https://webpack.docschina.org/guides/hot-module-replacement/)指的是，在开发过程中，修改代码后，仅更新修改部分的内容，无需刷新整个页面。
#### 2.1 修改 webpack-dev-server 配置
使用 webpack 内置的 HMR 插件，更新 webpack-dev-server 配置。
webpack.dev.js 配置方式如下：
 
```javascript
module.export = {
    devServer: {
        contentBase: './dist',
        hot: true, // 热更新
      },
}
```
#### 2.2 引入 react-refresh-webpack-plugin
使用 [react-refresh-webpack-plugin](https://github.com/pmmmwh/react-refresh-webpack-plugin)热更新 react 组件。
安装：
```javascript
pnpm add -D @pmmmwh/react-refresh-webpack-plugin react-refresh
```
webpack.dev.js 配置方式如下：
 
```javascript
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
    ]
}
```
**遇到的问题：**
配置了 SpeedMeasurePlugin 后，热更新就无效了，会提示 runtime is undefined。![image.png](https://cdn.nlark.com/yuque/0/2024/png/207857/1717638517459-f581195f-559e-4468-adfa-56b4077553ad.png#averageHue=%23454543&clientId=u2e41d603-2066-4&from=paste&height=329&id=ue2acb8a7&originHeight=592&originWidth=1712&originalType=binary&ratio=1.7999999523162842&rotation=0&showTitle=false&size=288329&status=done&style=none&taskId=ue271136e-31f1-4048-97df-28eec2b0dd5&title=&width=951.1111363069517)
**解决方案：**
仅在分析构建速度时打开 SpeedMeasurePlugin 插件，这里我们先关闭 SpeedMeasurePlugin 的使用，来查看热更新效果。
**最终效果：**
更新 react 组件代码时，无需刷新页面，仅更新组件部分。
## 四、加快构建速度
### 1. 更新版本
#### 1.1 webpack 版本
使用最新的 webpack 版本，通过 webpack 自身的迭代优化，来加快构建速度。
这一点是非常有效的，如 webpack5 较于 webpack4，新增了持久化缓存、改进缓存算法等优化，webpack5 新特性可查看 [参考资料](https://zhuanlan.zhihu.com/p/56796027)。
#### 1.2 包管理工具版本
将 **Node.js** 、package 管理工具（例如 npm 或者 yarn）更新到最新版本，也有助于提高性能。较新的版本能够建立更高效的模块树以及提高解析速度。
本文依赖的版本信息如下：

- webpack@5.46.0
- node@18.15.0
- npm@6.14.8
### 2. 缓存
#### 2.1 cache
通过配置 [webpack 持久化缓存](https://webpack.docschina.org/configuration/cache/#root)cache: filesystem，来缓存生成的 webpack 模块和 chunk，改善构建速度。
简单来说，通过 cache: filesystem 可以将构建过程的 webpack 模板进行缓存，大幅提升二次构建速度、打包速度，当构建突然中断，二次进行构建时，可以直接从缓存中拉取，可提速 **90%** 左右。
webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
    cache: {
      type: 'filesystem', // 使用文件缓存
    },
}
```
引入缓存后，首次构建时间将增加 15%，二次构建时间将减少 90%，效果如下：![image.png](https://cdn.nlark.com/yuque/0/2024/png/207857/1717638549840-582f9283-89dc-480a-a2ef-8dea30418660.png#averageHue=%23263322&clientId=u2e41d603-2066-4&from=paste&height=484&id=uc13b2667&originHeight=872&originWidth=1738&originalType=binary&ratio=1.7999999523162842&rotation=0&showTitle=false&size=1216847&status=done&style=none&taskId=u943fd5e1-3558-41a1-94d2-56e1beaedab&title=&width=965.5555811340433)
#### 2.2 dll ❌
在 [webpack 官网构建性能](https://webpack.docschina.org/guides/build-performance/#dlls)中看到关于 dll 的介绍：
> dll 可以为更改不频繁的代码生成单独的编译结果。可以提高应用程序的编译速度。

一个辅助配置 dll 的插件 [autodll-webpack-plugin](https://github.com/asfktz/autodll-webpack-plugin)，结果上面直接写了 webpack5 开箱即用的持久缓存是比 dll 更优的解决方案。
所以，不用再配置 dll了，上面介绍的 cache 明显更香。
#### 2.3 cache-loader ❌
没错， [cache-loader](https://webpack.docschina.org/loaders/cache-loader/)也不需要引入了，上面的 cache 已经帮助我们缓存了。
### 3. 减少 loader、plugins
每个的 loader、plugin 都有其启动时间。尽量少地使用工具，将非必须的 loader、plugins 删除。
#### 3.1 指定 include
为 loader 指定 include，减少 loader 应用范围，仅应用于最少数量的必要模块，。
[webpack 构建性能文档](https://webpack.docschina.org/guides/build-performance/)
> rule.exclude 可以排除模块范围，也可用于减少 loader 应用范围.

webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
    rules: [
        {
            test: /\.(js|ts|jsx|tsx)$/,
            include: paths.appSrc,
            use: [
              {
                loader: 'esbuild-loader',
                options: {
                  loader: 'tsx',
                  target: 'es2015',
                },
              }
            ]
         }
    ]
}
```
定义 loader 的 include 后，构建时间将减少 12%，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659424860523-d54882a8-dbef-4a53-be92-d125e6588cde.png#averageHue=%239ea19a&clientId=u891d20e1-d07e-4&from=paste&height=539&id=ud74857fc&originHeight=1078&originWidth=1340&originalType=binary&ratio=1&rotation=0&showTitle=false&size=919873&status=done&style=none&taskId=uc754f0c6-f7b9-4927-ae60-716c561b72b&title=&width=670)
#### 3.2 管理资源
使用 [webpack 资源模块](https://webpack.docschina.org/guides/asset-modules/)(asset module) 代替旧的 assets loader（如 file-loader/url-loader/raw-loader 等），减少 loader 配置数量。
配置方式如下：
 
```javascript
module.exports = {
    rules: [
       {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        include: [
          paths.appSrc,
        ],
        type: 'asset/resource',
      },
    ]
}
```
引入资源模块后，构建时间将减少 7%，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439685332-f10f3c65-24ef-487f-8331-336c34a73c68.png#averageHue=%233a3939&clientId=u891d20e1-d07e-4&from=paste&height=316&id=u3050aaaa&originHeight=632&originWidth=801&originalType=binary&ratio=1&rotation=0&showTitle=false&size=185553&status=done&style=none&taskId=ud8204b67-263b-4665-9b31-3e4057510b1&title=&width=400.5)
### 4. 优化 resolve 配置
[resolve](https://webpack.docschina.org/configuration/resolve/#root)用来配置 webpack 如何解析模块，可通过优化 resolve 配置来覆盖默认配置项，减少解析范围。
#### 4.1 alias
alias 可以创建 import 或 require 的别名，用来简化模块引入。
 
```javascript
module.exports = {
    resolve: {
        alias: {
          '@': paths.appSrc, // @ 代表 src 路径
        },
    }
}
```
#### 4.2 extensions
extensions 表示需要解析的文件类型列表。
根据项目中的文件类型，定义 extensions，以覆盖 webpack 默认的 extensions，加快解析速度。
由于 webpack 的解析顺序是从左到右，因此要将使用频率高的文件类型放在左侧，如下我将 tsx 放在最左侧。
webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
    resolve: {
        extensions: ['.tsx', '.js'], // 因为我的项目只有这两种类型的文件，如果有其他类型，需要添加进去。
    }
}
```
#### 4.3 modules
modules 表示 webpack 解析模块时需要解析的目录。
指定目录可缩小 webpack 解析范围，加快构建速度。
 
```javascript
module.exports = {
    modules: [
      'node_modules',
       paths.appSrc,
    ]
}
```
#### 4.4 symlinks
如果项目不使用 symlinks（例如 npm link 或者 yarn link），可以设置 resolve.symlinks: false，减少解析工作量。
webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
    resolve: {
        symlinks: false,
    },
}
```
优化 resolve 配置后，构建时间将减少 1.5%，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439750675-b8e71b9f-e3a6-4d74-8f91-eeeeed99db8d.png#averageHue=%23424242&clientId=u891d20e1-d07e-4&from=paste&height=325&id=u811dceef&originHeight=650&originWidth=792&originalType=binary&ratio=1&rotation=0&showTitle=false&size=185872&status=done&style=none&taskId=uf9782137-3576-422e-8ab2-c62ef49d8d8&title=&width=396)
### 5. 多进程
上述可以看到 sass-loader 的构建时间有 1.56s，占据了整个构建过程的 60%，那么有没有方法来加快 sass-loader 的构建速度呢？
可以通过多进程来实现，试想将 sass-loader 放在一个独立的 worker 池中运行，就不会阻碍其他 loader 的构建了，可以大大加快构建速度。
#### 5.1 thread-loader
通过 [thread-loader](https://webpack.docschina.org/loaders/thread-loader/#root)将耗时的 loader 放在一个独立的 worker 池中运行，加快 loader 构建速度。
安装：
 
```javascript
npm i -D thread-loader
```
webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
    rules: [
        {
        test: /\.module\.(scss|sass)$/,
        include: paths.appSrc,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                  ],
                ],
              },
            },
          },
          {
            loader: 'thread-loader',
            options: {
              workerParallelJobs: 2
            }
          },
          'sass-loader',
        ].filter(Boolean),
      },
    ]
}
```
> [webpack 官网](https://webpack.docschina.org/guides/build-performance/#sass)提到 node-sass 中有个来自 Node.js 线程池的阻塞线程的 bug。 当使用 thread-loader 时，需要设置 workerParallelJobs: 2。

由于 thread-loader 引入后，需要 0.6s 左右的时间开启新的 node 进程，本项目代码量小，可见引入 thread-loader 后，构建时间反而增加了0.19s。
因此，我们应该仅在非常耗时的 loader 前引入 thread-loader。
效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439793824-fe614d87-e5ba-447f-9a1c-e0918f9092b6.png#averageHue=%23363535&clientId=u891d20e1-d07e-4&from=paste&height=322&id=uc625f757&originHeight=643&originWidth=792&originalType=binary&ratio=1&rotation=0&showTitle=false&size=187653&status=done&style=none&taskId=u70540d45-aa5a-4746-b8f0-7df0475bfdd&title=&width=396)
#### 5.2 happypack ❌
[happypack](https://github.com/amireh/happypack)同样是用来设置多线程，但是在 webpack5 就不要再使用 [happypack](https://github.com/amireh/happypack)了，官方也已经不再维护了，推荐使用上文介绍的 thread-loader。
### 6. 区分环境
在 学习 Webpack5 之路（实践篇）- 模式（mode） 章节已经介绍了 webpack 的不同模式的内置优化。
在开发过程中，切忌在开发环境使用生产环境才会用到的工具，如在开发环境下，应该排除 [fullhash]/[chunkhash]/[contenthash] 等工具。
同样，在生产环境，也应该避免使用开发环境才会用到的工具，如 webpack-dev-server 等插件。
## 7. 其他
### 7.1 devtool
不同的 devtool 设置，会导致性能差异。
在大多数情况下，最佳选择是 eval-cheap-module-source-map。
详细区分可至 [webpack devtool](https://webpack.docschina.org/configuration/devtool/)查看。
webpack.dev.js 配置方式如下：
 
```javascript
export.module = {
    devtool: 'eval-cheap-module-source-map',
}
```
#### 7.2 输出结果不携带路径信息
默认 webpack 会在输出的 bundle 中生成路径信息，将路径信息删除可小幅提升构建速度。
 
```javascript
module.exports = {
    output: {
        pathinfo: false,
      },
    };
}
```
## 四、减小打包体积
### 1. 代码压缩
体积优化第一步是压缩代码，通过 webpack 插件，将 JS、CSS 等文件进行压缩。
#### 1.1 JS 压缩
使用 [TerserWebpackPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin/)来压缩 JavaScript。
webpack5 自带最新的 terser-webpack-plugin，无需手动安装。
terser-webpack-plugin 默认开启了 parallel: true 配置，并发运行的默认数量： os.cpus().length - 1 ，本文配置的 parallel 数量为 4，使用多进程并发运行压缩以提高构建速度。
webpack.prod.js 配置方式如下：
 
```javascript
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    optimization: {
        minimizer: [
            new TerserPlugin({
              parallel: 4,
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
        ]
    }
}
```
体积减小 10%，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439842382-91b9e496-64d1-4f15-ba2d-382d166a2e71.png#averageHue=%23ebeaea&clientId=u891d20e1-d07e-4&from=paste&height=198&id=uf19f2ccb&originHeight=396&originWidth=862&originalType=binary&ratio=1&rotation=0&showTitle=false&size=79504&status=done&style=none&taskId=u7a85915a-8bf3-4222-891d-d0e09dfb75d&title=&width=431)
#### 1.1 ParallelUglifyPlugin ❌
你可能有听过 ParallelUglifyPlugin 插件，它可以帮助我们多进程压缩 JS，webpack5 的 TerserWebpackPlugin 默认就开启了多进程和缓存，无需再引入 ParallelUglifyPlugin。
#### 1.2 CSS 压缩
使用 [CssMinimizerWebpackPlugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/#root)压缩 CSS 文件。
> _和 _[optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin)_相比， _[css-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/#root)_在 source maps 和 assets 中使用查询字符串会更加准确，而且支持缓存和并发模式下运行。_

CssMinimizerWebpackPlugin 将在 Webpack 构建期间搜索 CSS 文件，优化、压缩 CSS。
安装：
 
```javascript
pnpm  add -D css-minimizer-webpack-plugin
```
webpack.prod.js 配置方式如下：
 
```javascript
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
          parallel: 4,
        }),
    ],
  }
}
```
由于 CSS 默认是放在 JS 文件中，因此本示例是基于下章节将 CSS 代码分离后的效果。
### 2. 代码分离
代码分离能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，可以缩短页面加载时间。
#### 2.1 抽离重复代码
[SplitChunksPlugin](https://webpack.docschina.org/plugins/split-chunks-plugin)插件开箱即用，可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。
webpack 将根据以下条件自动拆分 chunks：

- 新的 chunk 可以被共享，或者模块来自于 node_modules 文件夹；
- 新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）；
- 当按需加载 chunks 时，并行请求的最大数量小于或等于 30；
- 当加载初始化页面时，并发请求的最大数量小于或等于 30； 通过 splitChunks 把 react 等公共库抽离出来，不重复引入占用体积。
> 注意：切记不要为 cacheGroups 定义固定的 name，因为 cacheGroups.name 指定字符串或始终返回相同字符串的函数时，会将所有常见模块和 vendor 合并为一个 chunk。这会导致更大的初始下载量并减慢页面加载速度。

webpack.prod.js 配置方式如下：
 
```javascript
module.exports = {
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      // 重复打包问题
      cacheGroups:{
        vendors:{ // node_modules里的代码
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          // name: 'vendors', 一定不要定义固定的name
          priority: 10, // 优先级
          enforce: true 
        }
      }
    },
}
```
将公共的模块单独打包，不再重复引入，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439900568-7341ff68-ec46-453f-a258-4ea66132edbf.png#averageHue=%23e4e3e0&clientId=u891d20e1-d07e-4&from=paste&height=166&id=u7e4b907f&originHeight=332&originWidth=928&originalType=binary&ratio=1&rotation=0&showTitle=false&size=195918&status=done&style=none&taskId=u076f29d4-8805-4d93-a0d7-a78e5d2c22a&title=&width=464)
#### 2.2 CSS 文件分离
[MiniCssExtractPlugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin/)插件将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
安装：
 
```javascript
pnpm add -D mini-css-extract-plugin
```
webpack.common.js 配置方式如下：
 
```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
        {
        test: /\.module\.(scss|sass)$/,
        include: paths.appSrc,
        use: [
          'style-loader',
          isEnvProduction && MiniCssExtractPlugin.loader, // 仅生产环境
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                  ],
                ],
              },
            },
          },
          {
            loader: 'thread-loader',
            options: {
              workerParallelJobs: 2
            }
          },
          'sass-loader',
        ].filter(Boolean),
      },
    ]
  },
};
```
> 注意：MiniCssExtractPlugin.loader 要放在 style-loader 后面。

效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439930200-f01613b1-a6ba-483c-8587-e4a32d0f7fa3.png#averageHue=%23ececec&clientId=u891d20e1-d07e-4&from=paste&height=192&id=u1ac23a5c&originHeight=383&originWidth=475&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41921&status=done&style=none&taskId=u39e37280-9d53-42ab-a780-d0042ba7306&title=&width=237.5)
#### 2.3 最小化 entry chunk
通过配置 optimization.runtimeChunk = true，为运行时代码创建一个额外的 chunk，减少 entry chunk 体积，提高性能。
webpack.prod.js 配置方式如下：
 
```javascript
module.exports = {
    optimization: {
        runtimeChunk: true,
      },
    };
}
```
效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439938462-359dfcbd-45c5-4e1f-9359-1e24da026c1a.png#averageHue=%23f1f0f0&clientId=u891d20e1-d07e-4&from=paste&height=189&id=uc89e8c8c&originHeight=378&originWidth=494&originalType=binary&ratio=1&rotation=0&showTitle=false&size=66884&status=done&style=none&taskId=u4d9e2005-c8eb-42eb-a0f1-9112b391c39&title=&width=247)
### 3. Tree Shaking（摇树）
摇树，顾名思义，就是将枯黄的落叶摇下来，只留下树上活的叶子。枯黄的落叶代表项目中未引用的无用代码，活的树叶代表项目中实际用到的源码。
#### 3.1 JS
[JS Tree Shaking](https://webpack.docschina.org/guides/tree-shaking/)将 JavaScript 上下文中的未引用代码（Dead Code）移除，通过 package.json 的 "sideEffects" 属性作为标记，向 compiler 提供提示，表明项目中的哪些文件是 "pure(纯正 ES2015 模块)"，由此可以安全地删除文件中未使用的部分。
Dead Code 一般具有以下几个特征：

- 代码不会被执行，不可到达；
- 代码执行的结果不会被用到；
- 代码只会影响死变量（只写不读）。
##### 3.1.1 webpack5 sideEffects
通过 package.json 的 "sideEffects" 属性，来实现这种方式。
 
```javascript
{
  "name": "your-project",
  "sideEffects": false
}
```
需注意的是，当代码有副作用时，需要将 sideEffects 改为提供一个数组，添加有副作用代码的文件路径：
 
```javascript
{
  "name": "your-project",
  "sideEffects": ["./src/some-side-effectful-file.js"]
}
```
添加 TreeShaking 后，未引用的代码，将不会被打包，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659439980691-abf542f1-4df1-44da-a959-d50c7baecaf0.png#averageHue=%23395038&clientId=u891d20e1-d07e-4&from=paste&height=270&id=ud340cd44&originHeight=539&originWidth=1742&originalType=binary&ratio=1&rotation=0&showTitle=false&size=255278&status=done&style=none&taskId=ue0babde3-2a4c-4b70-9a26-faa7ce1bb41&title=&width=871)
##### 3.1.2 对组件库引用的优化
webpack5 sideEffects 只能清除无副作用的引用，而有副作用的引用则只能通过优化引用方式来进行 Tree Shaking。
**1. lodash**
类似 import { throttle } from 'lodash' 就属于有副作用的引用，会将整个 lodash 文件进行打包。
优化方式是使用 import { throttle } from 'lodash-es' 代替 import { throttle } from 'lodash'， [lodash-es](https://www.npmjs.com/package/lodash-es)将 [Lodash](https://lodash.com/)库导出为 [ES](http://www.ecma-international.org/ecma-262/6.0/)模块，支持基于 ES modules 的 tree shaking，实现按需引入。
**2. ant-design**
[ant-design](https://ant.design/docs/react/getting-started-cn)默认支持基于 ES modules 的 tree shaking，对于 js 部分，直接引入 import { Button } from 'antd' 就会有按需加载的效果。
假如项目中仅引入少部分组件，import { Button } from 'antd' 也属于有副作用，webpack不能把其他组件进行tree-shaking。这时可以**缩小引用范围**，将引入方式修改为 import { Button } from 'antd/lib/button' 来进一步优化。
#### 3.2 CSS
上述对 JS 代码做了 Tree Shaking 操作，同样，CSS 代码也需要摇摇树，打包时把没有用的 CSS 代码摇走，可以大幅减少打包后的 CSS 文件大小。
使用 [purgecss-webpack-plugin](https://github.com/FullHuman/purgecss/tree/main/packages/purgecss-webpack-plugin)对 CSS Tree Shaking。
安装：
 
```javascript
pnpm add purgecss-webpack-plugin -D
```
因为打包时 CSS 默认放在 JS 文件内，因此要结合 webpack 分离 CSS 文件插件 mini-css-extract-plugin 一起使用，先将 CSS 文件分离，再进行 CSS Tree Shaking。
webpack.prod.js 配置方式如下：
 
```javascript
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const paths = require('paths')

module.exports = {
  plugins: [
    // 打包体积分析
    new BundleAnalyzerPlugin(),
    // 提取 CSS
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    // CSS Tree Shaking
    new PurgeCSSPlugin({
      paths: glob.sync(`${paths.appSrc}/**/*`,  { nodir: true }),
    }),
  ]
}

```
上面为了测试 CSS 压缩效果，我引入了大量无效 CSS 代码，因此 Tree Shaking 效果也非常明显，效果如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659440013274-5b10b535-8a58-4d04-b2bd-b0f00276b606.png#averageHue=%23394d35&clientId=u891d20e1-d07e-4&from=paste&height=256&id=u56679dbb&originHeight=512&originWidth=1736&originalType=binary&ratio=1&rotation=0&showTitle=false&size=487857&status=done&style=none&taskId=u15e046ee-191d-4fe3-ada8-1c40f5e546b&title=&width=868)
### 3. CDN
上述是对 webpack 配置的优化，另一方面还可以通过 CDN 来减小打包体积。
> 这里引入 CDN 的首要目的为了减少打包体积，因此仅仅将一部分大的静态资源手动上传至 CDN，并修改本地引入路径。下文的加快加载速度，将介绍另一种 CDN 优化手段。

将大的静态资源上传至 CDN：

- 字体：压缩并上传至 CDN；
- 图片：压缩并上传至 CDN。
## 五、加快加载速度
### 1. 按需加载
通过 webpack 提供的 [import() 语法](https://webpack.docschina.org/api/module-methods/#import-1)[动态导入](https://webpack.docschina.org/guides/code-splitting/#dynamic-imports)功能进行代码分离，通过按需加载，大大提升网页加载速度。
使用方式如下：
 
```javascript
export default function App () {
    return (
        <div>
            hello react 111
            <Hello />
            <button onClick={() => import('lodash')}>加载lodash</button>
        </div>
    )
}
```
 

### 2. [浏览器缓存](https://webpack.docschina.org/guides/caching/)
浏览器缓存，就是进入某个网站后，加载的静态资源被浏览器缓存，再次进入该网站后，将直接拉取缓存资源，加快加载速度。
webpack 支持根据资源内容，创建 hash id，当资源内容发生变化时，将会创建新的 hash id。
配置 JS bundle hash，webpack.common.js 配置方式如下：
 
```javascript
module.exports = {
  // 输出
  output: {
    // 仅在生产环境添加 hash
    filename: ctx.isEnvProduction ? '[name].[contenthash].bundle.js' : '[name].bundle.js',
  },
}
```
配置 CSS bundle hash，webpack.prod.js 配置方式如下：
 
```javascript
module.exports = {
  plugins: [
    // 提取 CSS
    new MiniCssExtractPlugin({
      filename: "[hash].[name].css",
    }),
  ],
}
```
配置 optimization.moduleIds，让公共包 splitChunks 的 hash 不因为新的依赖而改变，减少非必要的 hash 变动，webpack.prod.js 配置方式如下：
 
```javascript
module.exports = {
  optimization: {
    moduleIds: 'deterministic',
  }
}
```
通过配置 contenthash/hash，浏览器缓存了未改动的文件，仅重新加载有改动的文件，大大加快加载速度。
### 3. CDN
将所有的静态资源，上传至 CDN，通过 CDN 加速来提升加载速度。
webpack.common.js 配置方式如下：
 
```javascript
export.modules = {
output: {
    publicPath: ctx.isEnvProduction ? 'https://test.com' : '', // CDN 域名
  },
}
```
## 六、优化前后对比
在仓库代码仅 webpack 配置不同的情况下，查看优化前后对比。
### 1. 构建速度
| **类型** | **首次构建** | **未修改内容二次构建** | **修改内容二次构建** |
| -------- | ------------ | ---------------------- | -------------------- |
| 优化前   | 2.7s         | 2.7s                   | 2.7s                 |
| 优化后   | 2.7s         | 0.5s                   | 0.3s                 |

![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659440080892-89ebec96-7eb7-48c9-82f0-55da3116cd9d.png#averageHue=%23585757&clientId=u891d20e1-d07e-4&from=paste&height=281&id=u231c43f4&originHeight=561&originWidth=916&originalType=binary&ratio=1&rotation=0&showTitle=false&size=235784&status=done&style=none&taskId=u025a9d0e-cc1c-4abb-a3e7-6c28161195f&title=&width=458)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659440090336-7f61994c-4ed2-4a0d-8478-738547765226.png#averageHue=%23929090&clientId=u891d20e1-d07e-4&from=paste&height=290&id=ud5ca78d2&originHeight=580&originWidth=939&originalType=binary&ratio=1&rotation=0&showTitle=false&size=167988&status=done&style=none&taskId=u87728d1f-42fc-4a36-bc11-2014d75916b&title=&width=469.5)
### 2. 打包体积
| **类型** | **体积大小** |
| -------- | ------------ |
| 优化前   | 250 kb       |
| 优化后   | 231 kb       |

![image.png](https://cdn.nlark.com/yuque/0/2022/png/207857/1659440100608-61cdbc21-c5b5-4fad-a291-8a28774bb410.png#averageHue=%23edecec&clientId=u891d20e1-d07e-4&from=paste&height=268&id=ub7ed653d&originHeight=536&originWidth=988&originalType=binary&ratio=1&rotation=0&showTitle=false&size=116570&status=done&style=none&taskId=u6a37849d-3812-48a6-a6c2-c4de3b3cfd3&title=&width=494)
## 七、总结
从上章节 **[优化前后对比]** 可知，在小型项目中，添加过多的优化配置，作用不大，反而会因为额外的 loader、plugin 增加构建时间。
在加快构建时间方面，作用最大的是配置 cache，可大大加快二次构建速度。
在减小打包体积方面，作用最大的是压缩代码、分离重复代码、Tree Shaking，可最大幅度减小打包体积。
在加快加载速度方面，按需加载、浏览器缓存、CDN 效果都很显著。
本文源码：

- [https://gitee.com/sohucw/webpack5-demo-before](https://gitee.com/sohucw/webpack5-demo-before)
- [https://gitee.com/sohucw/webpack5-demo-after](https://gitee.com/sohucw/webpack5-demo-after)

> webpack 打包优化并没有什么固定的模式，一般我们常见的优化就是拆包、分块、压缩等，并不是对每一个项目都适用，针对于特定项目，需要不断调试不断优化。

### 其他、优化搜索时间- 缩小文件搜索范围 减小不必要的编译工作
webpack 打包时，会从配置的 entry 触发，解析入口文件的导入语句，再递归的解析，在遇到导入语句时 webpack 会做两件事情：

- 根据导入语句去寻找对应的要导入的文件。例如 import from 'vue' 导入语句对应的文件是 ./node_modules/vue/vue.js，import from './util' 对应的文件是 ./util.js。
- 根据找到的要导入文件的后缀，使用配置中的 Loader 去处理文件。例如使用 ES6 开发的 JavaScript 文件需要使用 babel-loader 去处理。

以上两件事情虽然对于处理一个文件非常快，但是当项目大了以后文件量会变的非常多，这时候构建速度慢的问题就会暴露出来。 虽然以上两件事情无法避免，但需要尽量减少以上两件事情的发生，以提高速度。
接下来一一介绍可以优化它们的途径。
#### 1. 优化 loader 配置
使用 Loader 时可以通过 test 、 include 、 exclude 三个配置项来命中 Loader 要应用规则的文件
#### 2. 优化 resolve.module 配置
resolve.modules 用于配置 webpack 去哪些目录下寻找第三方模块，resolve.modules 的默认值是 ['node_modules'] ，含义是先去当前目录下的 ./node_modules 目录下去找想找的模块，如果没找到就去上一级目录 ../node_modules 中找，再没有就去 ../../node_modules 中找，以此类推。
#### 3. 优化 resolve.alias 配置
resolve.alias 配置项通过别名来把原导入路径映射成一个新的导入路径，减少耗时的递归解析操作。
#### 4. 优化 resolve.extensions 配置
在导入语句没带文件后缀时，webpack 会根据 resolve.extension 自动带上后缀后去尝试询问文件是否存在，所以在配置 resolve.extensions 应尽可能注意以下几点：

- resolve.extensions 列表要尽可能的小，不要把项目中不可能存在的情况写到后缀尝试列表中。
- 频率出现最高的文件后缀要优先放在最前面，以做到尽快的退出寻找过程。
- 在源码中写导入语句时，要尽可能的带上后缀，从而可以避免寻找过程。
#### 5. 优化 resolve.mainFields 配置
有一些第三方模块会针对不同环境提供几分代码。 例如分别提供采用 ES5 和 ES6 的2份代码，这2份代码的位置写在 package.json 文件里，如下：
```javascript
{   
	"jsnext:main": "es/index.js",// 采用 ES6 语法的代码入口文件   
	"main": "lib/index.js" // 采用 ES5 语法的代码入口文件 
} 
```
webpack 会根据 mainFields 的配置去决定优先采用那份代码，mainFields 默认如下：
mainFields: ['browser', 'main'] 
webpack 会按照数组里的顺序去 package.json 文件里寻找，只会使用找到的第一个。
假如你想优先采用 ES6 的那份代码，可以这样配置：
mainFields: ['jsnext:main', 'browser', 'main'] 
#### 6. 优化 module.noParse 配置
module.noParse 配置项可以让 Webpack 忽略对部分没采用模块化的文件的递归解析处理，这样做的好处是能提高构建性能。 原因是一些库，例如 jQuery 、ChartJS， 它们庞大又没有采用模块化标准，让 Webpack 去解析这些文件耗时又没有意义。
```javascript
// 编译代码的基础配置
module.exports = {
  // ...
  module: {
    // 项目中使用的 jquery 并没有采用模块化标准，webpack 忽略它
    noParse: /jquery/,
    rules: [
      {
        // 这里编译 js、jsx
        // 注意：如果项目源码中没有 jsx 文件就不要写 /\.jsx?$/，提升正则表达式性能
        test: /\.(js|jsx)$/,
        // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
        use: ['babel-loader?cacheDirectory'],
        // 排除 node_modules 目录下的文件
        // node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    // 设置模块导入规则，import/require时会直接在这些目录找文件
    // 可以指明存放第三方模块的绝对路径，以减少寻找
    modules: [
      path.resolve(`${project}/client/components`), 
      path.resolve('h5_commonr/components'), 
      'node_modules'
    ],
    // import导入时省略后缀
    // 注意：尽可能的减少后缀尝试的可能性
    extensions: ['.js', '.jsx', '.react.js', '.css', '.json'],
    // import导入时别名，减少耗时的递归解析操作
    alias: {
      '@compontents': path.resolve(`${project}/compontents`),
    }
  },
};
```
 以上就是所有和缩小文件搜索范围相关的构建性能优化了，在根据自己项目的需要去按照以上方法改造后，你的构建速度一定会有所提升。
