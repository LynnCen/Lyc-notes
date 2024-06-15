import{_ as s,c as a,o as n,aa as i}from"./chunks/framework.CAVwB9kQ.js";const e="/Lyc-notes/assets/unocss%E6%8F%92%E4%BB%B6.Qw36qh_U.png",g=JSON.parse('{"title":"unocss","description":"","frontmatter":{},"headers":[],"relativePath":"webpack/unocss.md","filePath":"webpack/unocss.md","lastUpdated":1716793116000}'),p={name:"webpack/unocss.md"},t=i(`<h1 id="unocss" tabindex="-1">unocss <a class="header-anchor" href="#unocss" aria-label="Permalink to &quot;unocss&quot;">​</a></h1><p>文档： <a href="https://unocss.nodejs.cn/#google_vignette" target="_blank" rel="noreferrer">https://unocss.nodejs.cn/#google_vignette</a></p><p>参考</p><ul><li><a href="https://antfu.me/posts/reimagine-atomic-css-zh" target="_blank" rel="noreferrer">https://antfu.me/posts/reimagine-atomic-css-zh</a></li></ul><p>原子化 CSS 是一种 CSS 写法，它将 CSS 样式拆分成一个个独立的样式，每个样式只包含一个属性，比如：</p><div class="language-css vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* 原子化 CSS */</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.mt-10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  margin-top</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>通过原子化 CSS 能力，可以方便地支持响应式布局，以及减少 CSS 文件体积。</p><h2 id="配置-unocss-vscode-插件" tabindex="-1">配置 unocss vscode 插件 <a class="header-anchor" href="#配置-unocss-vscode-插件" aria-label="Permalink to &quot;配置 unocss vscode 插件&quot;">​</a></h2><p>安装<code>UnoCSS</code></p><p>在<code>setting.json</code>中加入以下</p><div class="language-json vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;editor.quickSuggestions&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;other&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;comments&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;strings&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;unocss.root&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>预览效果：</p><p><img src="`+e+'" alt="alt text"></p><h2 id="rpx-to-vw-vh" tabindex="-1">rpx to vw vh <a class="header-anchor" href="#rpx-to-vw-vh" aria-label="Permalink to &quot;rpx to vw vh&quot;">​</a></h2><p>ice.js 原生支持 rpx 单位。在无线端中，阿里巴巴集团标准统一使用 rpx 作为响应式长度单位。你可以直接在样式文件中使用 rpx，不需要担心转换的问题。</p><ul><li>rpx（responsive pixel），可以根据屏幕宽度进行自适应。规定屏幕宽为 750rpx。以 iPhone6 为例，屏幕宽度为 375px，共有 750 个物理像素，则 750rpx = 375px = 750 物理像素，1rpx = 0.5px = 1 物理像素。</li></ul><p>在浏览器中，ice.js 会将 rpx 会转换为 vw 进行渲染，其转换关系为：750rpx = 100vw，即 1rpx = 1/7.5vw，保留 5 位小数。小程序由于天然支持 rpx 单位，因此可以直接使用并且 ice.js 不会将其转换为 vw。</p>',17),l=[t];function r(h,o,c,k,d,u){return n(),a("div",null,l)}const b=s(p,[["render",r]]);export{g as __pageData,b as default};