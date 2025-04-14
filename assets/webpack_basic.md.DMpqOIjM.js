import{_ as a,c as i,o as n,a8 as e}from"./chunks/framework.B1-gFi6y.js";const E=JSON.parse('{"title":"WebPack基础篇","description":"","frontmatter":{},"headers":[],"relativePath":"webpack/basic.md","filePath":"webpack/basic.md","lastUpdated":1744605486000}'),p={name:"webpack/basic.md"};function l(t,s,r,h,k,d){return n(),i("div",null,s[0]||(s[0]=[e(`<h1 id="webpack基础篇" tabindex="-1">WebPack基础篇 <a class="header-anchor" href="#webpack基础篇" aria-label="Permalink to &quot;WebPack基础篇&quot;">​</a></h1><p>《学习 Webpack5 之路》</p><ul><li>基础篇</li><li>实践篇</li><li>优化篇</li></ul><p>依赖的 webpack 版本信息如下：</p><ul><li>webpack-cli@4.7.2</li><li>webpack@5.46.0</li></ul><h2 id="一、webpack-是什么" tabindex="-1">一、Webpack 是什么 <a class="header-anchor" href="#一、webpack-是什么" aria-label="Permalink to &quot;一、Webpack 是什么&quot;">​</a></h2><p>引入 <a href="https://webpack.js.org/" target="_blank" rel="noreferrer">webpack 官网</a>介绍：</p><blockquote><p>本质上，webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler) 。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph) ，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle</p></blockquote><p><a href="https://webpack.js.org/" target="_blank" rel="noreferrer">webpack 官网</a>图： <img src="https://cdn.nlark.com/yuque/0/2022/png/207857/1659410664888-e14e6db0-2a69-4780-9d9f-3312f64f6bb3.png#averageHue=%23364148&amp;clientId=u9fc13adf-45ea-4&amp;from=paste&amp;height=335&amp;id=u5d21775c&amp;originHeight=670&amp;originWidth=1450&amp;originalType=binary&amp;ratio=1&amp;rotation=0&amp;showTitle=false&amp;size=289123&amp;status=done&amp;style=none&amp;taskId=u4d3ffdbc-b6d9-4804-9411-4fa1a078eaa&amp;title=&amp;width=725" alt="image.png"> 在图中我们可以看到，webpack 将左侧错综复杂的各自不同类型文件的模板依赖关系，包括 .js、.hbs、.cjs、.sass、.jpg、.png 等类型文件，打包成 .js、.css、.jpg、.png 4 种类型的静态资源。</p><p>简单来说，webpack 就是一个静态资源打包工具，负责将项目中依赖的各个模块，打包成一个或多个文件。</p><h2 id="二、为什么选择-webpack" tabindex="-1">二、为什么选择 Webpack <a class="header-anchor" href="#二、为什么选择-webpack" aria-label="Permalink to &quot;二、为什么选择 Webpack&quot;">​</a></h2><p><em>本文不进行其他打包工具和 webpack 的优劣对比，仅介绍 webpack 能为开发者做的工作。</em></p><h3 id="_1-模块化开发" tabindex="-1">1. 模块化开发 <a class="header-anchor" href="#_1-模块化开发" aria-label="Permalink to &quot;1. 模块化开发&quot;">​</a></h3><p>在没有各个 webpack 搭建的脚手架（create-react-app、vue-cli 等等）之前，我们通过在 HTML5 文件里引入一个 Javascript 文件来进行开发，这就可能导致并行请求数量过多、存在重复代码等问题。</p><p>而通过 webpack，<strong>我们可以使用 import、require 来进行模块化开发</strong>。</p><p><strong>在 webpack 中一切皆模块</strong>，js、css、图片、字体都是模块，而且支持静态解析、按需打包、动态加载、代码分离等功能，帮助我们优化代码，提升性能。</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { Hello } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./hello.js&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;./assets/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MyImage </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;./assets/img.jpg&#39;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h3 id="_2-新语法" tabindex="-1">2. 新语法 <a class="header-anchor" href="#_2-新语法" aria-label="Permalink to &quot;2. 新语法&quot;">​</a></h3><p>Javascript、CSS 的语法规范在不断更新，但是浏览器的兼容性却不能同步的更新，开发者可以通过 webpack 预处理器进行编译，<strong>自由的使用 JS、CSS 等语言的新语法</strong>。</p><p>webpack 使用 <a href="https://webpack.docschina.org/concepts/loaders" target="_blank" rel="noreferrer">loader</a>对文件进行预处理。你可以构建包括 JavaScript 在内的任何静态资源，如 Less、Sass、ES6、TypeScript。</p><p>通过预处理器将 TypeScript 编译成 JavaScript、SCSS 编译成 CSS、ES6 编译成 ES5 等。</p><p>开发者还可以使用 Node.js 轻松编写自己的 loader。</p><p>常用预处理器：</p><ul><li><a href="https://webpack.docschina.org/loaders/babel-loader" target="_blank" rel="noreferrer">babel-loader</a>使用 <a href="https://babeljs.io/" target="_blank" rel="noreferrer">Babel</a>加载 ES2015+ 代码并将其转换为 ES5；</li><li><a href="https://webpack.docschina.org/loaders/less-loader" target="_blank" rel="noreferrer">less-loader</a>加载并编译 LESS 文件；</li><li><a href="https://webpack.docschina.org/loaders/sass-loader" target="_blank" rel="noreferrer">sass-loader</a>加载并编译 SASS/SCSS 文件；</li><li><a href="https://webpack.docschina.org/loaders/postcss-loader" target="_blank" rel="noreferrer">postcss-loader</a>使用 <a href="http://postcss.org/" target="_blank" rel="noreferrer">PostCSS</a>加载并转换 CSS/SSS 文件。</li></ul><h3 id="_3-主流框架脚手架" tabindex="-1">3. 主流框架脚手架 <a class="header-anchor" href="#_3-主流框架脚手架" aria-label="Permalink to &quot;3. 主流框架脚手架&quot;">​</a></h3><p>Vue 脚手架 vue-cli、React 脚手架 creact-react-app、Taro 脚手架 taro-cli 都是使用 webpack，开发者掌握 webpack 后，可以自由配置脚手架，根据项目需要，调整 webpack 配置，以提高项目性能。</p><h3 id="_4-其他" tabindex="-1">4. 其他 <a class="header-anchor" href="#_4-其他" aria-label="Permalink to &quot;4. 其他&quot;">​</a></h3><p>webpack 除了让开发者能够拥有【<strong>模块化开发+新语言+新框架</strong>】的开发体验。 还有<strong>以下优点：</strong></p><ul><li>拥有依赖管理、动态打包、代码分离、按需加载、代码压缩、静态资源压缩、缓存等配置；</li><li>webpack 扩展性强，插件机制完善，开发者可自定义插件、loader；</li><li>webpack 社区庞大，更新速度快，轮子丰富；</li></ul><p>如使用 ant-design 搭建的中后台项目，ant-desgin 提供了 webpack 定制主题的相关文档，较其他打包工具定制起来就简单很多，易上手。</p><p>因为 webpack 的这些优点，大部分的大型项目会选择 webpack 进行项目构建。</p><h2 id="三、webpack-的基本概念介绍" tabindex="-1">三、Webpack 的基本概念介绍 <a class="header-anchor" href="#三、webpack-的基本概念介绍" aria-label="Permalink to &quot;三、Webpack 的基本概念介绍&quot;">​</a></h2><h3 id="_1-dependency-graph-依赖图" tabindex="-1">1. dependency graph（依赖图） <a class="header-anchor" href="#_1-dependency-graph-依赖图" aria-label="Permalink to &quot;1. dependency graph（依赖图）&quot;">​</a></h3><p>上文有提到，当 webpack 处理应用程序时，它会递归地构建一个_依赖关系图(dependency graph)_，那么依赖关系图是什么呢？</p><p>依赖图指的就是文件和文件直接的依赖关系，如上文引入过的图： <img src="https://cdn.nlark.com/yuque/0/2022/png/207857/1659410655985-5f6f8eaa-1067-49c8-a2cf-d42b1a51fee3.png#averageHue=%23374249&amp;clientId=u9fc13adf-45ea-4&amp;from=paste&amp;height=322&amp;id=u91785d3c&amp;originHeight=644&amp;originWidth=1434&amp;originalType=binary&amp;ratio=1&amp;rotation=0&amp;showTitle=false&amp;size=285029&amp;status=done&amp;style=none&amp;taskId=u1c07a61a-9c24-4041-bd53-e5e69a576df&amp;title=&amp;width=717" alt="image.png"></p><p>webpack 通过依赖关系图可以获取非代码资源，如 images 或 web 字体等。并会把它们作为 <em>依赖</em> 提供给应用程序。</p><p>每个模块都可以<strong>明确表述它自身的依赖</strong>，在打包时可根据依赖进行打包，避免打包未使用的模块。</p><h3 id="_2-entry-入口" tabindex="-1">2. entry（入口） <a class="header-anchor" href="#_2-entry-入口" aria-label="Permalink to &quot;2. entry（入口）&quot;">​</a></h3><p>入口是指依赖关系图的开始，从入口开始寻找依赖，打包构建。</p><p>webpack 允许一个或多个入口配置。</p><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {   entry: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;index.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, };</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="_3-output-输出" tabindex="-1">3. output（输出） <a class="header-anchor" href="#_3-output-输出" aria-label="Permalink to &quot;3. output（输出）&quot;">​</a></h3><p>输出则是用于配置 webpack 构建打包的出口，如打包的位置，打包的文件名等等。</p><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  output: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    path: path.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">resolve</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(__dirname, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dist&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    filename: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dawei-webpack.bundle.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h3 id="_4-loader" tabindex="-1">4. loader <a class="header-anchor" href="#_4-loader" aria-label="Permalink to &quot;4. loader&quot;">​</a></h3><p>webpack 自带 JavaScript 和 JSON 文件的打包构建能力，无需格外配置。</p><p>而其他类型的文件，如 CSS、TypeScript，则需要安装 loader 来进行处理。</p><p><strong>loader</strong> 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 <a href="https://webpack.docschina.org/concepts/modules" target="_blank" rel="noreferrer">模块</a>，以供应用程序使用，以及被添加到依赖图中。</p><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  module: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    rules: [{ test:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">txt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, use: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;raw-loader&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h3 id="_5-plugin-插件" tabindex="-1">5. plugin（插件） <a class="header-anchor" href="#_5-plugin-插件" aria-label="Permalink to &quot;5. plugin（插件）&quot;">​</a></h3><p>插件则是用于扩展 webpack 的能力，常见的插件有：</p><ul><li><a href="https://www.npmjs.com/package/progress-bar-webpack-plugin" target="_blank" rel="noreferrer">ProgressBarPlugin</a>：编译进度条；</li><li><a href="https://www.npmjs.com/package/webpack-bundle-analyzer" target="_blank" rel="noreferrer">BundleAnalyzerPlugin</a>：打包体积分析；</li><li><a href="https://webpack.docschina.org/plugins/mini-css-extract-plugin/" target="_blank" rel="noreferrer">MiniCssExtractPlugin</a>：提取 CSS 到独立 bundle 文件。</li></ul><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> HtmlWebpackPlugin</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> require</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;html-webpack-plugin&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 通过 npm 安装</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugins: [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HtmlWebpackPlugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ template: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;./src/index.html&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>插件丰富，开发者社区同样提供了大量插件，也使得 webpack 的可用功能更加多样。</p><h3 id="_6-mode-模式" tabindex="-1">6. mode（模式） <a class="header-anchor" href="#_6-mode-模式" aria-label="Permalink to &quot;6. mode（模式）&quot;">​</a></h3><p>webpack5 提供了模式选择，包括开发模式、生产模式、空模式，并对不同模式做了对应的内置优化。可通过配置模式让项目性能更优。</p><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {   mode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;development&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, };</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="_7-resolve-解析" tabindex="-1">7. resolve（解析） <a class="header-anchor" href="#_7-resolve-解析" aria-label="Permalink to &quot;7. resolve（解析）&quot;">​</a></h3><p>resolve 用于设置模块如何解析，常用配置如下：</p><ul><li>alias：配置别名，简化模块引入；</li><li>extensions：在引入模块时可不带后缀；</li><li>symlinks：用于配置 npm link 是否生效，禁用可提升编译速度。</li></ul><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    resolve: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        extensions: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.jsx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.tsx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.json&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.d.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        alias: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          &#39;@&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: paths.src,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        symlinks: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h3 id="_8-optimization-优化" tabindex="-1">8. optimization（优化） <a class="header-anchor" href="#_8-optimization-优化" aria-label="Permalink to &quot;8. optimization（优化）&quot;">​</a></h3><p>optimization 用于自定义 webpack 的内置优化配置，一般用于生产模式提升性能，常用配置项如下：</p><ul><li>minimize：是否需要压缩 bundle；</li><li>minimizer：配置压缩工具，如 TerserPlugin、OptimizeCSSAssetsPlugin；</li><li>splitChunks：拆分 bundle；</li><li>runtimeChunk：是否需要将所有生成 chunk 之间共享的运行时文件拆分出来。</li></ul><p>配置示例如下：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  optimization: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    minimizer: [</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 在 webpack@5 中，你可以使用 \`...\` 语法来扩展现有的 minimizer（即 \`terser-webpack-plugin\`），将下一行取消注释</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // \`...\`,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CssMinimizerPlugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    splitChunks: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // include all types of chunks</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      chunks: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;all&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 重复打包问题</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      cacheGroups:{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        vendors:{ </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//node_modules里的代码</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          test:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">[</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold;">\\\\</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">/]</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">node_modules</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">[</span><span style="--shiki-light:#22863A;--shiki-light-font-weight:bold;--shiki-dark:#85E89D;--shiki-dark-font-weight:bold;">\\\\</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">/]</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          chunks: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;all&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;vendors&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//chunks name</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          priority: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//优先级</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          enforce: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>以上对 webpack 的基本概念做了简单的介绍，为后续实践篇做准备。</p><p>本文源码： <a href="https://gitee.com/sohucw/webpack-demo-v0" target="_blank" rel="noreferrer">webpack Demo0</a></p>`,74)]))}const o=a(p,[["render",l]]);export{E as __pageData,o as default};
