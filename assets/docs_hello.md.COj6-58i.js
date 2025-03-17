import{_ as d,C as l,c as n,o as h,a8 as r,G as a,w as s,a as i}from"./chunks/framework.B1-gFi6y.js";const y=JSON.parse('{"title":"Hello","description":"","frontmatter":{},"headers":[],"relativePath":"docs/hello.md","filePath":"docs/hello.md","lastUpdated":1712800653000}'),o={name:"docs/hello.md"};function p(k,t,c,g,u,b){const e=l("f-button");return h(),n("div",null,[t[5]||(t[5]=r(`<h1 id="hello" tabindex="-1">Hello <a class="header-anchor" href="#hello" aria-label="Permalink to &quot;Hello&quot;">​</a></h1><h2 id="前言" tabindex="-1">前言 <a class="header-anchor" href="#前言" aria-label="Permalink to &quot;前言&quot;">​</a></h2><p>在这里编写你的内容吧</p><p>示例代码</p><div class="language-ts vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getType</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">target</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">prototype</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.toString.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">call</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(target)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="官方资源" tabindex="-1">官方资源 <a class="header-anchor" href="#官方资源" aria-label="Permalink to &quot;官方资源&quot;">​</a></h2><ul><li><a href="https://vitepress.vuejs.org" target="_blank" rel="noreferrer">vitepress 文档</a></li><li><a href="https://github.com/vuejs/vitepress" target="_blank" rel="noreferrer">仓库地址</a></li></ul><h2 id="组件库使用" tabindex="-1">组件库使用 <a class="header-anchor" href="#组件库使用" aria-label="Permalink to &quot;组件库使用&quot;">​</a></h2><p>以 <a href="https://github.com/FightingDesign/fighting-design" target="_blank" rel="noreferrer">Fighting Design</a> 为演示</p>`,9)),a(e,{type:"primary"},{default:s(()=>t[0]||(t[0]=[i("主要按钮")])),_:1}),a(e,{type:"success",ripples:""},{default:s(()=>t[1]||(t[1]=[i("涟漪效果")])),_:1}),a(e,{type:"warning",ripples:""},{default:s(()=>t[2]||(t[2]=[i("点我试试")])),_:1}),a(e,{type:"danger",ripples:"",simple:""},{default:s(()=>t[3]||(t[3]=[i("看看我")])),_:1}),a(e,{type:"success",text:"",ripples:"","ripples-color":"green"},{default:s(()=>t[4]||(t[4]=[i(" 自定义涟漪颜色 ")])),_:1}),t[6]||(t[6]=r('<h2 id="贡献者" tabindex="-1">贡献者 <a class="header-anchor" href="#贡献者" aria-label="Permalink to &quot;贡献者&quot;">​</a></h2><p>该仓库由 <a href="https://github.com/Tyh2001" target="_blank" rel="noreferrer">Tyh2001</a> 提供。</p><h2 id="静态资源" tabindex="-1">静态资源 <a class="header-anchor" href="#静态资源" aria-label="Permalink to &quot;静态资源&quot;">​</a></h2><h2 id="表格示例" tabindex="-1">表格示例 <a class="header-anchor" href="#表格示例" aria-label="Permalink to &quot;表格示例&quot;">​</a></h2><table tabindex="0"><thead><tr><th>参数</th><th>说明</th><th>类型</th><th>可选值</th><th>默认值</th></tr></thead><tbody><tr><td><code>type</code></td><td>类型</td><td>string</td><td><code>default</code> <code>primary</code> <code>success</code> <code>danger</code> <code>warning</code></td><td>default</td></tr><tr><td><code>font-size</code></td><td>副标题文字大小</td><td>string / number</td><td>——</td><td>15px</td></tr><tr><td><code>title-size</code></td><td>主标题文字大小</td><td>string / number</td><td>——</td><td>17px</td></tr><tr><td><code>bold</code></td><td>文字是否以粗体显示</td><td>boolean</td><td>——</td><td>false</td></tr><tr><td><code>center</code></td><td>是否居中</td><td>boolean</td><td>——</td><td>false</td></tr></tbody></table>',5))])}const m=d(o,[["render",p]]);export{y as __pageData,m as default};
