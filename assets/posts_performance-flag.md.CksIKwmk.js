import{_ as t,c as a,o as e,aa as o}from"./chunks/framework.CAVwB9kQ.js";const m=JSON.parse('{"title":"常见性能指标","description":"","frontmatter":{},"headers":[],"relativePath":"posts/performance-flag.md","filePath":"posts/performance-flag.md","lastUpdated":1738807071000}'),r={name:"posts/performance-flag.md"},n=o('<h1 id="常见性能指标" tabindex="-1">常见性能指标 <a class="header-anchor" href="#常见性能指标" aria-label="Permalink to &quot;常见性能指标&quot;">​</a></h1><p><strong>First Paint(FP)</strong>：在渲染进程确认要渲染当前的请求后，渲染进程会创建一个空白页面，我们把创建空白页面的这个时间点称为FP</p><p><strong>首次内容绘制 (FCP)</strong>：衡量从网页开始加载到网页内容的任何部分在屏幕上呈现的时间。（实验，字段）</p><p><strong>Largest Contentful Paint (LCP)</strong>：衡量从网页开始加载到屏幕上呈现最大的文本块或图片元素所用的时间。（实验，字段）</p><p><strong>Interaction to Next Paint (INP)</strong>：衡量与网页进行的每个点按、点击或键盘互动的延迟时间，并根据互动次数选择网页最差（或接近最长的互动延迟时间）作为单个代表性值，以描述网页的整体响应能力。（实验，字段）</p><p><strong>总阻塞时间 (TBT)</strong>：衡量 FCP 和 TTI 之间的总时长，在该时间段内，主线程处于阻塞状态的时长足以阻止输入响应。（实验）</p><p><strong>Cumulative Layout Shift (CLS)</strong>：衡量从网页开始加载到其生命周期状态变为隐藏期间发生的所有意外布局偏移的累计得分。（实验，字段）</p><p><strong>首字节时间 (TTFB)</strong>：衡量网络使用资源的第一个字节响应用户请求所需的时间。</p>',8),s=[n];function p(_,c,i,g,l,d){return e(),a("div",null,s)}const P=t(r,[["render",p]]);export{m as __pageData,P as default};
