import{_ as n,c as a,o as p,a8 as e}from"./chunks/framework.n3V8RT1I.js";const o=JSON.parse('{"title":"05 - 无限画布渲染引擎","description":"","frontmatter":{},"headers":[],"relativePath":"project/gaoding/AI+智能设计编辑器架构文档/05-无限画布渲染引擎.md","filePath":"project/gaoding/AI+智能设计编辑器架构文档/05-无限画布渲染引擎.md","lastUpdated":1768921626000}'),l={name:"project/gaoding/AI+智能设计编辑器架构文档/05-无限画布渲染引擎.md"};function i(r,s,t,c,b,d){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="_05-无限画布渲染引擎" tabindex="-1">05 - 无限画布渲染引擎 <a class="header-anchor" href="#_05-无限画布渲染引擎" aria-label="Permalink to &quot;05 - 无限画布渲染引擎&quot;">​</a></h1><blockquote><p><strong>导航</strong>：<a href="./README">📚 返回总目录</a> | <a href="./04-扩展插件系统">⬅️ 上一篇：扩展插件系统</a> | <a href="./06-AI对话系统核心技术">➡️ 下一篇：AI对话系统核心技术</a></p><p><strong>所属</strong>：AI+ 智能设计编辑器架构文档</p></blockquote><hr><h2 id="_5-1-为什么需要-无限画布" tabindex="-1">5.1 为什么需要&quot;无限画布&quot;？ <a class="header-anchor" href="#_5-1-为什么需要-无限画布" aria-label="Permalink to &quot;5.1 为什么需要&quot;无限画布&quot;？&quot;">​</a></h2><p><strong>传统 DOM 渲染的瓶颈</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>场景：用户生成了 1000 张 AI 图片</span></span>
<span class="line"><span>  ├─ DOM 方案：创建 1000 个 &lt;img&gt; 元素</span></span>
<span class="line"><span>  ├─ 问题1：DOM 节点过多，浏览器卡顿</span></span>
<span class="line"><span>  ├─ 问题2：滚动和缩放性能差</span></span>
<span class="line"><span>  └─ 问题3：内存占用过高</span></span>
<span class="line"><span></span></span>
<span class="line"><span>结果：页面崩溃 💥</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p><strong>PixiJS (WebGL) 方案</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>同样 1000 张图片：</span></span>
<span class="line"><span>  ├─ 只创建可见区域的渲染对象（如 50 个）</span></span>
<span class="line"><span>  ├─ 其他对象按需创建/销毁</span></span>
<span class="line"><span>  ├─ WebGL 硬件加速，60fps 流畅</span></span>
<span class="line"><span>  └─ 支持无限滚动、缩放</span></span>
<span class="line"><span></span></span>
<span class="line"><span>结果：丝般顺滑 ✨</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><hr><h2 id="_5-2-渲染架构-三层结构" tabindex="-1">5.2 渲染架构 - 三层结构 <a class="header-anchor" href="#_5-2-渲染架构-三层结构" aria-label="Permalink to &quot;5.2 渲染架构 - 三层结构&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Surface（画布表面）                                    │</span></span>
<span class="line"><span>│  ─────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 最顶层管理者                                        │</span></span>
<span class="line"><span>│  • 协调下层组件工作                                    │</span></span>
<span class="line"><span>│  • 控制渲染循环（Ticker：16ms/帧）                     │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>              ↓              ↓              ↓</span></span>
<span class="line"><span>    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐</span></span>
<span class="line"><span>    │  Viewport   │  │ Processor   │  │ PluginSystem│</span></span>
<span class="line"><span>    │  (视口)      │  │  (处理器)    │  │  (插件)     │</span></span>
<span class="line"><span>    └─────────────┘  └─────────────┘  └─────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p><strong>各层职责</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1️⃣ Viewport（视口层）</span></span>
<span class="line"><span>  ├─ 管理相机（Camera）</span></span>
<span class="line"><span>  │   ├─ 缩放（Zoom）：0.1x ~ 10x</span></span>
<span class="line"><span>  │   ├─ 平移（Pan）：拖拽画布移动</span></span>
<span class="line"><span>  │   └─ 旋转（Rotate）：支持画布旋转</span></span>
<span class="line"><span>  ├─ 坐标转换</span></span>
<span class="line"><span>  │   ├─ 屏幕坐标 ⇄ 画布坐标</span></span>
<span class="line"><span>  │   └─ 处理鼠标/触摸事件的坐标映射</span></span>
<span class="line"><span>  └─ 碰撞检测</span></span>
<span class="line"><span>      └─ 判断点击是否命中元素</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2️⃣ Processor（处理器层）</span></span>
<span class="line"><span>  ├─ VmEngine（视图模型引擎）</span></span>
<span class="line"><span>  │   ├─ 数据模型 → PixiJS 渲染对象</span></span>
<span class="line"><span>  │   ├─ 虚拟化渲染（只渲染可见元素）</span></span>
<span class="line"><span>  │   └─ 增量更新（只更新变化部分）</span></span>
<span class="line"><span>  └─ EventBoundary（事件边界）</span></span>
<span class="line"><span>      └─ 事件分发和冒泡处理</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3️⃣ PluginSystem（插件层）</span></span>
<span class="line"><span>  ├─ BackgroundPlugin（背景）</span></span>
<span class="line"><span>  │   └─ 渲染背景色/图片/渐变</span></span>
<span class="line"><span>  ├─ GridPlugin（网格）</span></span>
<span class="line"><span>  │   └─ 显示辅助网格线</span></span>
<span class="line"><span>  ├─ SelectionPlugin（选择）</span></span>
<span class="line"><span>  │   └─ 选中框、控制点</span></span>
<span class="line"><span>  └─ GuidePlugin（参考线）</span></span>
<span class="line"><span>      └─ 对齐辅助线</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><hr><h2 id="_5-3-虚拟化渲染-核心优化" tabindex="-1">5.3 虚拟化渲染 - 核心优化 <a class="header-anchor" href="#_5-3-虚拟化渲染-核心优化" aria-label="Permalink to &quot;5.3 虚拟化渲染 - 核心优化&quot;">​</a></h2><p><strong>核心思想</strong>：只渲染用户能看到的，看不到的不渲染。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>全量渲染（慢）：</span></span>
<span class="line"><span>  画布上有 10000 个元素</span></span>
<span class="line"><span>  → 创建 10000 个 PixiJS 对象</span></span>
<span class="line"><span>  → 每帧都要处理 10000 个对象</span></span>
<span class="line"><span>  → 卡顿！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>虚拟化渲染（快）：</span></span>
<span class="line"><span>  画布上有 10000 个元素</span></span>
<span class="line"><span>  → 只创建视口内的 50 个对象</span></span>
<span class="line"><span>  → 滚动时动态换入/换出对象</span></span>
<span class="line"><span>  → 流畅！</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p><strong>实现机制</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>视口变化时（滚动/缩放）：</span></span>
<span class="line"><span>  1. 计算当前视口范围</span></span>
<span class="line"><span>  2. 找出视口内的元素列表</span></span>
<span class="line"><span>  3. 比对上次的列表：</span></span>
<span class="line"><span>     ├─ 新进入视口的 → 创建渲染对象</span></span>
<span class="line"><span>     ├─ 移出视口的 → 销毁渲染对象</span></span>
<span class="line"><span>     └─ 仍在视口的 → 更新位置/样式</span></span>
<span class="line"><span>  4. 渲染当前帧</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><hr><h2 id="_5-4-性能优化策略" tabindex="-1">5.4 性能优化策略 <a class="header-anchor" href="#_5-4-性能优化策略" aria-label="Permalink to &quot;5.4 性能优化策略&quot;">​</a></h2><table tabindex="0"><thead><tr><th>优化策略</th><th>具体实现</th><th>性能提升</th></tr></thead><tbody><tr><td><strong>虚拟化渲染</strong></td><td>只渲染视口内元素</td><td>降低 90% CPU 占用</td></tr><tr><td><strong>对象池复用</strong></td><td>复用 PixiJS 对象，避免频繁创建/销毁</td><td>减少 GC 压力 70%</td></tr><tr><td><strong>懒加载纹理</strong></td><td>图片进入视口才加载，支持渐进式加载</td><td>节省 80% 内存</td></tr><tr><td><strong>脏矩形检测</strong></td><td>只重绘变化区域，而不是全画布</td><td>提升 3x 渲染速度</td></tr><tr><td><strong>LOD分级</strong></td><td>缩小时显示低精度版本，放大时加载高清</td><td>优化缩放体验</td></tr><tr><td><strong>WebGL加速</strong></td><td>硬件加速，GPU并行计算</td><td>支持万级元素流畅</td></tr></tbody></table><hr><blockquote><p><strong>下一步</strong>：进入核心章节 <a href="./06-AI对话系统核心技术">AI对话框系统</a>，了解产品的灵魂功能。</p></blockquote>`,24)]))}const m=n(l,[["render",i]]);export{o as __pageData,m as default};
