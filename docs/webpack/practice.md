# Webpack 实战篇

## 一、基础配置

接下来一起配置一个基础的 Webpack 项目。该配置将支持以下功能：

- 分离开发环境、生产环境配置
- 模块化开发
- sourceMap 定位警告和错误
- 动态生成引入 bundle.js 的 HTML5 文件
- 实时编译
- 封装编译、打包命令

> 📑 想直接看配置的同学 → 本文源码地址：[webpack Demo0](https://gitee.com/sohucw/webpack-demo-v0)

### 1. 新建项目

新建一个空项目：

```bash
# 新建 webpack-demo 文件夹
mkdir webpack-demo 

# 进入 webpack-demo 目录
cd ./webpack-demo 

# 初始化项目 
npm init -y
```

新建 2 个 js 文件，并进行模块化开发：

```bash
# 进入项目目录
cd ./webpack-demo

# 创建 src 文件夹
mkdir src

# 创建 js文件
touch index.js
touch hello.js
```

在文件中添加内容：

```js
// hello.js
console.log('hello webpack')

// index.js
import './hello.js'
console.log('index')
```

项目结构如下：

```
- src
  - index.js
  - hello.js
- package.json
- node_modules
```

---

### 2. 安装

#### 2.1 安装 Node

Node 需要是**最新版本**，推荐使用 nvm 来管理 Node 版本。

> 💡 将 **Node.js** 更新到最新版本，能够显著提高构建性能。同样，将包管理工具（如 npm、yarn 或 pnpm）更新到最新版本，也有助于提高性能。较新的版本能够建立更高效的模块树以及提高解析速度。

- Node：[安装地址](https://nodejs.org/zh-cn/)
- nvm：[安装地址](http://nvm.sh/)

本文使用的版本信息：

- node v18.17.3
- npm v6.14.13

#### 2.2 安装 webpack

```bash
pnpm add webpack webpack-cli --save-dev
```

`webpack-cli` 提供了在命令行中运行 webpack 的能力，是必备的开发依赖。

---

### 3. 新建配置文件

**development(开发环境)** 和 **production(生产环境)** 这两个环境下的构建目标存在着巨大差异。为了让代码清晰简明，我们将为每个环境编写**彼此独立的 webpack 配置**。

```bash
# 进入项目目录
cd ./webpack-demo

# 创建 config 目录
mkdir config

# 进入 config 目录
cd ./config

# 创建通用环境配置文件
touch webpack.common.js

# 创建开发环境配置文件
touch webpack.dev.js

# 创建生产环境配置文件
touch webpack.prod.js
```

#### 3.1 webpack-merge

使用 webpack-merge 合并通用配置和特定环境配置，避免配置重复。

安装 webpack-merge：

```bash
pnpm add webpack-merge -D
# 或者
npm i webpack-merge -D
```

通用环境配置：

```js
// webpack.common.js 
module.exports = {} // 暂不添加配置 
```

开发环境配置：

```js
// webpack.dev.js
const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {}) // 暂不添加配置
```

生产环境配置：

```js
// webpack.prod.js
const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {}) // 暂不添加配置
```

项目结构如下：

```
- config
  - webpack.common.js
  - webpack.dev.js
  - webpack.prod.js
- src
  - index.js
  - hello.js
- package.json
- node_modules
```

---

### 4. 入口（entry）

**入口起点(entry point)** 指示 webpack 应该使用哪个模块，来作为构建其内部 [依赖图(dependency graph)](https://webpack.docschina.org/concepts/dependency-graph/)的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。

在本例中，使用 src/index.js 作为项目入口，webpack 以 src/index.js 为起点，查找所有依赖的模块。

修改 webpack.common.js：

```js
module.exports = {
  // 入口
  entry: {
    index: './src/index.js',
  },
}
```

> 💡 **多入口配置**：如果需要多入口配置，可以在 entry 对象中添加多个键值对，每个键作为 chunk name，每个值作为入口文件路径。

---

### 5. 输出（output)

**output** 属性告诉 webpack 在哪里输出它所创建的 _bundle_，以及如何命名这些文件。

生产环境的 output 需要通过 contenthash 值来区分版本和变动，可达到清缓存的效果，而**本地环境为了构建效率，则不引入 contenthash**。

新增 paths.js，封装路径方法：

```js
const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  resolveApp,
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appSrc: resolveApp('src'),
  appDist: resolveApp('dist'),
  appTsConfig: resolveApp('tsconfig.json'),
}
```

修改开发环境配置文件 `webpack.dev.js`：

```js
const paths = require('./paths');

module.exports = merge(common, {
  // 输出
  output: {
    // bundle 文件名称
    filename: '[name].bundle.js',
    
    // bundle 文件路径
    path: paths.appDist,
    
    // 编译前清除目录
    clean: true
  },
})
```

修改生产环境配置文件 `webpack.prod.js`：

```js
const paths = require('./paths');

module.exports = merge(common, {
  // 输出
  output: {
    // bundle 文件名称 【只有这里和开发环境不一样】
    filename: '[name].[contenthash].bundle.js',
    
    // bundle 文件路径
    path: paths.appDist,
    
    // 编译前清除目录
    clean: true
  },
})
```

上述 filename 的占位符解释如下：

- `[name]` - chunk name（例如 [name].js -> app.js）。如果 chunk 没有名称，则会使用其 id 作为名称
- `[contenthash]` - 输出文件内容的 md4-hash（例如 [contenthash].js -> 33asdfasd3333.js）

> 💡 **clean: true** 配置会在每次构建前清理 /dist 文件夹，是 webpack 5 新增的功能，替代了之前的 clean-webpack-plugin。

---

### 6. 模式（mode）

通过 mode 配置选项，告知 webpack 使用相应模式的内置优化。

| **选项**    | **描述**                                                     |
| ----------- | ------------------------------------------------------------ |
| development | 会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设置为 `development`。启用 `NamedChunksPlugin` 和 `NamedModulesPlugin`。 |
| production  | 会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设置为 `production`。启用 `FlagDependencyUsagePlugin`、`FlagIncludedChunksPlugin`、`ModuleConcatenationPlugin`、`NoEmitOnErrorsPlugin`、`TerserPlugin` 等，实现最小化 bundle 等优化。 |

修改开发环境配置文件 `webpack.dev.js`：

```js
module.exports = merge(common, {
  // 开发模式
  mode: 'development',
})
```

修改生产环境配置文件 `webpack.prod.js`：

```js
module.exports = merge(common, {
  // 生产模式
  mode: 'production',
})
```

> 💡 webpack 会根据 `mode` 自动应用不同的优化。例如，`production` 模式下会自动压缩代码，移除注释，并设置 `process.env.NODE_ENV` 为 `'production'`，便于第三方库进行条件编译。

---

### 7. Source Map

当 webpack 打包源代码时，可能会很难追踪到 error 和 warning 在源代码中的原始位置。为了更容易地追踪问题，JavaScript 提供了 [source maps](http://blog.teamtreehouse.com/introduction-source-maps) 功能，可以将编译后的代码映射回原始源代码。

修改开发环境配置文件 webpack.dev.js：

```js
module.exports = merge(common, {
  // 开发工具，开启 source map，编译调试
  devtool: 'eval-cheap-module-source-map',
})
```

source map 有许多 [可用选项](https://webpack.docschina.org/configuration/devtool)。本例选择的是 `eval-cheap-module-source-map`，它能够:

- 提供较快的构建速度
- 生成较详细的源代码映射
- 在大多数情况下有良好的调试体验

> 📝 注：为加快生产环境打包速度，生产环境通常不需要配置 devtool。如果需要在生产环境进行错误追踪，可以考虑使用 'source-map'，并配合错误监控服务。

完成上述配置后，可以通过以下命令打包编译：

```bash
npx webpack --config config/webpack.prod.js
```

编译后，会生成这样的目录结构：

![编译后的目录结构](https://cdn.nlark.com/yuque/0/2024/png/207857/1717637036916-5e5ae770-e3d8-464a-afdd-3e6b5f3ff06f.png)

---

### 8. HtmlWebpackPlugin

上面的命令执行后仅生成了 bundle.js，我们还需要一个 HTML5 文件，用来动态引入打包生成的 bundle 文件。

HtmlWebpackPlugin 插件可以生成一个 HTML5 文件，其中自动引入所有的 webpack 打包输出的资源文件。

安装：

```bash
npm install --save-dev html-webpack-plugin
```

修改通用环境配置文件 webpack.common.js：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    // 生成html，自动引入所有bundle
    new HtmlWebpackPlugin({
      title: 'Webpack App',
      // 更多可选配置:
      // template: paths.appHtml, // 使用自定义HTML模板
      // favicon: paths.appFavicon, // 添加favicon
      // minify: true, // 在生产环境下压缩HTML
    }),
  ],
}
```

重新执行 webpack 编译：

```bash
npx webpack --config config/webpack.prod.js
```

生成的目录结构如下：

![生成HTML文件后的目录结构](https://cdn.nlark.com/yuque/0/2024/png/207857/1717637081286-b98c08d7-0f58-4b2a-b18b-bb669bd6b7b1.png)

新生成了 index.html，动态引入了 bundle.js 文件：

```html
<!DOCTYPE html>
<html>
 <head>
  <meta charset="utf-8" />
  <title>Webpack App</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script defer="defer" src="index.468d741515bfc390d1ac.bundle.js"></script>
 </head>
 <body></body>
</html>
```

> 💡 **HtmlWebpackPlugin** 还支持多种模板引擎，可以通过 `template` 选项指定自定义的 HTML 模板，满足更复杂的页面需求。

---

### 9. DevServer

在每次编译代码时，手动运行命令很麻烦，[webpack-dev-server](https://github.com/webpack/webpack-dev-server) 可以帮助我们在代码发生变化后自动编译代码并刷新页面。

webpack-dev-server 提供了一个基本的 web server，并且具有以下特性：
- 实时重新加载（Live Reloading）
- 模块热替换（HMR）
- 路由历史记录回退（History API Fallback）
- HTTPS 支持
- 自动gzip压缩

安装：

```bash
npm install --save-dev webpack-dev-server
```

修改开发环境配置文件 webpack.dev.js：

```js
module.exports = merge(common, {
  devServer: {
    // 静态资源服务的目录
    static: './dist',
    // 启用热模块替换
    hot: true,
    // 在浏览器中打开
    open: true,
    // 端口
    port: 8080,
    // 启用gzip压缩
    compress: true,
    // 代理API请求
    // proxy: {
    //   '/api': 'http://localhost:3000',
    // },
  },
})
```

完成上述配置后，可以通过以下命令启动开发服务器：

```bash
npx webpack serve --config config/webpack.dev.js
```

效果如图：

![DevServer运行效果](https://cdn.nlark.com/yuque/0/2024/png/207857/1717637125928-a14534ae-3060-43e3-84c4-3ab7863f92f4.png)

---

### 10. 执行命令

上述配置文件完成后，我们可以优化 webpack 的实时编译、打包编译指令。

通过 cross-env 配置环境变量，区分开发环境和生产环境。

安装：

```bash
npm install --save-dev cross-env
```

修改 package.json：

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack serve --open --config config/webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config config/webpack.prod.js"
  }
}
```

现在可以运行简化的 webpack 指令：

- `npm run dev`：启动开发服务器
- `npm run build`：构建生产环境代码

以上我们完成了一个基于 webpack 编译的支持模块化开发的简单项目。

> 📑 源码地址：[webpack Demo0](https://gitee.com/sohucw/webpack-demo-v0)

---

## 二、进阶配置

本章节将继续完善配置，在上述配置基础上，用 Webpack 搭建一个 SASS + TS + React 的项目。

将支持以下功能：

- 加载图片
- 加载字体
- 加载 CSS
- 使用 SASS/LESS
- 使用 PostCSS，并自动为 CSS 规则添加前缀，解析最新的 CSS 语法
- 引入 CSS Modules 解决全局命名冲突问题
- 使用 React
- 使用 TypeScript

> 📑 想直接看配置的同学 → 本文源码地址：[webpack Demo1](https://gitee.com/sohucw/webpack-demo-v1)

---

### 1. 加载图片（Image）

在 webpack 5 中，可以使用内置的 [Asset Modules](https://webpack.docschina.org/guides/asset-modules/)，将图像混入我们的系统中。Asset Modules 是 webpack 5 新增的功能，它允许使用资源文件（字体，图标等）而无需配置额外的 loader。

修改通用环境配置文件 webpack.common.js：

```js
const paths = require('./paths');
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        include: paths.appSrc,
        type: 'asset/resource',
      },
    ],
  },
}
```

Asset Modules 的类型说明：
- `asset/resource` - 发送一个单独的文件并导出 URL（之前通过 file-loader 实现）
- `asset/inline` - 导出资源的 data URI（之前通过 url-loader 实现）
- `asset/source` - 导出资源的源代码（之前通过 raw-loader 实现）
- `asset` - 在导出单独文件和 data URI 之间自动选择（之前通过 url-loader + 资源大小限制实现）

> 💡 在实际开发中，可以考虑将大图片上传至 CDN，并通过 publicPath 配置引用，这样可以显著提高加载速度和减小构建包体积。

---

### 2. 加载字体（Font）

同样使用 Asset Modules 处理字体文件：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        include: [
          paths.appSrc,
        ],
        type: 'asset/resource',
      },
    ]
  }
}
```

> 💡 **字体优化建议**：
> 1. 考虑使用 Web Font 服务如 Google Fonts, Adobe Fonts 等
> 2. 使用字体子集化（subsetting）仅包含网站所需的字符
> 3. 使用现代的字体格式如 WOFF2，它具有更好的压缩率
> 4. 对于中文网站，考虑使用字体服务或将字体文件上传至CDN

---

### 3. 加载 CSS

为了在 JavaScript 模块中 import 一个 CSS 文件，需要安装并配置 [style-loader](https://webpack.docschina.org/loaders/style-loader) 和 [css-loader](https://webpack.docschina.org/loaders/css-loader)。

#### 3.1 style-loader

style-loader 用于将 CSS 插入到 DOM 中，通过创建 `<style>` 标签将 CSS 注入到 HTML 头部。

#### 3.2 css-loader

css-loader 对 `@import` 和 `url()` 进行处理，就像 JavaScript 解析 `import/require()` 一样，让 CSS 也能模块化开发。

#### 3.3 安装配置

安装 CSS 相关依赖：

```bash
npm install --save-dev style-loader css-loader
```

修改通用环境配置文件 webpack.common.js：

```js
const paths = require('./paths');
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        include: paths.appSrc,
        use: [
          // 将 JS 字符串生成为 style 节点
          'style-loader',
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
        ],
      },
    ]
  }
}
```

> 💡 **loader 执行顺序**：从右到左（或从下到上）执行。在上面的配置中，先执行 css-loader 解析 CSS 文件，然后 style-loader 将解析后的 CSS 内容注入到 DOM。

---

### 4. 使用 LESS/SASS

#### 4.1 CSS 预处理器

CSS 预处理器是一种专门的编程语言，用来为 CSS 增加一些编程特性（如变量、嵌套、混合、继承等）。主流的预处理器有：
- [LESS](https://lesscss.org/)
- [SASS/SCSS](https://sass-lang.com/)
- [Stylus](https://stylus-lang.com/)

#### 4.2 安装配置

**LESS 配置**

安装 less 相关依赖：

```bash
npm install --save-dev less-loader less 
```

修改通用环境配置文件 webpack.common.js：

```js
const paths = require('./paths');
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        include: paths.appSrc,
        use: [
          // 将 JS 字符串生成为 style 节点
          'style-loader',
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
          // 将 less 编译成 CSS
          'less-loader',
        ],
      },
    ]
  }
}
```

**SASS 配置**（可选）

如果你更喜欢使用 SASS/SCSS，安装相关依赖：

```bash
npm install --save-dev sass-loader sass
```

然后添加配置：

```js
{
  test: /\.(scss|sass)$/,
  include: paths.appSrc,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader',
  ],
}
```

> 💡 **预处理器选择建议**：
> - LESS: 语法更接近CSS，学习曲线低，适合简单项目
> - SASS: 功能更强大，适合复杂项目，尤其配合 Compass 等框架使用
> - 团队已有积累: 如果团队已经积累了某种预处理器的经验和代码库，建议继续使用

---

### 5. 使用 PostCSS

#### 5.1 PostCSS

[PostCSS](https://github.com/postcss/postcss) 是一个用 JavaScript 工具和插件转换 CSS 代码的工具。PostCSS 的主要功能：

- 自动为 CSS 规则添加浏览器前缀（Autoprefixer）
- 将最新的 CSS 语法转换成大多数浏览器兼容的语法
- 支持 CSS Modules，解决全局命名冲突问题
- 支持压缩和优化 CSS
- 提供代码检查功能

#### 5.2 postcss-loader

[postcss-loader](https://webpack.docschina.org/loaders/postcss-loader/) 使用 PostCSS 处理 CSS 的 loader。

#### 5.3 安装配置

安装 PostCSS 相关依赖：

```bash
npm install --save-dev postcss-loader postcss postcss-preset-env
```

修改通用环境配置文件 webpack.common.js，这里以配置 LESS + CSS Modules 为例：

```js
const paths = require('./paths');
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.less$/,
        include: paths.appSrc,
        use: [
          // 将 JS 字符串生成为 style 节点
          'style-loader',
          // 将 CSS 转化成 CommonJS 模块
          {
            loader: 'css-loader',
            options: {
              // 启用 CSS Modules
              modules: {
                // 自定义生成的类名格式
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
              importLoaders: 2,
              // importLoaders 说明:
              // 0 => 无 loader(默认)
              // 1 => postcss-loader
              // 2 => postcss-loader, less-loader
            },
          },
          // 使用 PostCSS 处理 CSS
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    // postcss-preset-env 包含 autoprefixer
                    'postcss-preset-env',
                    {
                      // 自定义选项
                      browsers: 'last 2 versions',
                    },
                  ],
                ],
              },
            },
          },
          // 将 Less 编译成 CSS
          'less-loader',
        ],
      },
      // 常规 LESS 文件（非 CSS Modules）
      {
        test: /\.less$/,
        include: paths.appSrc,
        exclude: /\.module\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
    ],
  },
}
```

> 💡 **CSS Modules 使用说明**：
> 1. 命名文件为 `*.module.less`（或 `.module.css`，`.module.scss` 等）
> 2. 导入方式：`import styles from './styles.module.less'`
> 3. 使用方式：`<div className={styles.className}></div>`
> 
> **为什么使用 CSS Modules?**
> - 解决全局命名冲突问题
> - 提高代码可维护性和模块化程度
> - 允许更安全地组合样式

---

### 6. 使用 React + TypeScript

为了让项目的配置灵活性更高，我们手动搭建 React 和 TypeScript 的配置，而不是使用 create-react-app。

#### 6.1 安装相关依赖

安装 React 相关：

```bash
npm i react react-dom @types/react @types/react-dom -D
```

安装 TypeScript 相关：

```bash
npm i -D typescript esbuild-loader
```

> 💡 为提高性能，这里使用了 esbuild-loader 替代传统的 ts-loader 或 babel-loader。esbuild-loader 基于 Go 语言开发的 esbuild，编译速度比传统工具快 10-100 倍。

#### 6.2 配置 webpack

修改通用环境配置文件 webpack.common.js：

```js
const paths = require('./paths');
module.exports = {
  resolve: {
    // 自动解析扩展名，引入模块时可以不带扩展名
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    // 设置别名，简化导入路径
    alias: {
      '@': paths.appSrc,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|jsx|tsx)$/,
        include: paths.appSrc,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx', // 处理 .tsx 文件
              target: 'es2016', // 编译目标
              // 启用 JSX 自动转换（React 17+）
              jsx: 'automatic',
            },
          }
        ]
      },
    ]
  }
}
```

#### 6.3 配置 TypeScript

[TypeScript](https://www.typescriptlang.org/) 是 JavaScript 的超集，为其增加了类型系统，可以编译为普通 JavaScript 代码。

新增 typescript 配置文件 tsconfig.json：

```json
{
  "compilerOptions": {
    "outDir": "./dist/",
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "module": "esnext",
    "target": "es5",
    "jsx": "react-jsx",
    "allowJs": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

> 💡 **tsconfig.json 中重要配置解释**：
> - `allowSyntheticDefaultImports`: 允许从没有设置默认导出的模块中导入默认值
> - `esModuleInterop`: 生成额外的 JavaScript 代码，以便更好地支持与非 ES 模块的互操作性
> - `jsx`: 指定 JSX 代码生成方式，"react-jsx" 用于 React 17+ 的新 JSX 转换
> - `paths`: 配置模块别名，与 webpack 的 alias 配置相对应
> - `strict`: 启用所有严格类型检查选项

---

## 常见问题与解决方案

### 1. TypeScript 导入默认模块问题

TypeScript 配置文件 tsconfig.json 需要加 `"allowSyntheticDefaultImports": true` 配置，否则会提示:
```
Module can only be default-imported using the 'allowSyntheticDefaultImports' flag
```

正确配置：

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

这两个配置的作用：
- `allowSyntheticDefaultImports`: 允许从没有设置默认导出的模块中导入默认值
- `esModuleInterop`: 生成额外的 JavaScript 代码，以便更好地支持与非 ES 模块的互操作性

如果不添加这些配置，则需要使用以下方式导入：
```ts
import * as React from 'react';
```
而不是：
```ts
import React from 'react';
```

### 2. tsx 和 jsx 混用问题

在 tsx 中引入 jsx 文件会产生编译错误：

![tsx和jsx混用错误](https://cdn.nlark.com/yuque/0/2024/png/207857/1717637581819-07d0b696-c20f-4dac-9021-fd58626290bf.png)

**解决方案**：
1. 统一使用 .tsx 扩展名（推荐）
2. 在 webpack 配置中设置 jsx 文件也使用 TypeScript 处理

```js
{
  test: /\.(tsx|ts|jsx|js)$/,
  include: paths.appSrc,
  use: [
    {
      loader: 'esbuild-loader',
      options: {
        loader: 'tsx',
        target: 'es2016',
      },
    }
  ]
}
```

---

## 总结

以上我们完成了一个基于 Webpack 的 React + TypeScript + LESS/SASS 项目配置，该配置包括：

- 基础构建配置：入口、输出、模式等
- 开发环境优化：Source Map、DevServer
- 资源处理：图片、字体、CSS、预处理器
- CSS 工程化：PostCSS、CSS Modules
- React 和 TypeScript 支持

这套配置可以作为中小型项目的起点，根据项目需求进一步扩展。如需构建更复杂的应用，可以考虑添加：

- 代码分割（Code Splitting）
- 懒加载（Lazy Loading）
- 缓存优化
- 构建性能优化
- 打包分析与优化

> 📑 源码地址：[webpack Demo1](https://gitee.com/sohucw/webpack-demo-v1)



