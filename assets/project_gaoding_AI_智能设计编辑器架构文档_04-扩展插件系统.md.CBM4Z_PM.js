import{_ as n,c as a,o as p,a8 as e}from"./chunks/framework.B1-gFi6y.js";const o=JSON.parse('{"title":"04 - 扩展插件系统","description":"","frontmatter":{},"headers":[],"relativePath":"project/gaoding/AI+智能设计编辑器架构文档/04-扩展插件系统.md","filePath":"project/gaoding/AI+智能设计编辑器架构文档/04-扩展插件系统.md","lastUpdated":1768402956000}'),i={name:"project/gaoding/AI+智能设计编辑器架构文档/04-扩展插件系统.md"};function l(r,s,t,c,b,d){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="_04-扩展插件系统" tabindex="-1">04 - 扩展插件系统 <a class="header-anchor" href="#_04-扩展插件系统" aria-label="Permalink to &quot;04 - 扩展插件系统&quot;">​</a></h1><blockquote><p><strong>导航</strong>：<a href="./README">📚 返回总目录</a> | <a href="./03-编辑器基座">⬅️ 上一篇：编辑器基座</a> | <a href="./05-无限画布渲染引擎">➡️ 下一篇：无限画布渲染引擎</a></p><p><strong>所属</strong>：AI+ 智能设计编辑器架构文档</p></blockquote><hr><h2 id="_4-1-为什么需要插件系统" tabindex="-1">4.1 为什么需要插件系统？ <a class="header-anchor" href="#_4-1-为什么需要插件系统" aria-label="Permalink to &quot;4.1 为什么需要插件系统？&quot;">​</a></h2><p><strong>场景痛点</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>产品需求不断变化：</span></span>
<span class="line"><span>  ├─ 今天要加 AI 绘图</span></span>
<span class="line"><span>  ├─ 明天要加视频生成</span></span>
<span class="line"><span>  ├─ 后天要加协同编辑</span></span>
<span class="line"><span>  └─ 每次都改核心代码？❌</span></span>
<span class="line"><span></span></span>
<span class="line"><span>如果没有插件系统：</span></span>
<span class="line"><span>  ├─ 核心代码越来越臃肿</span></span>
<span class="line"><span>  ├─ 功能耦合严重，改一处影响全局</span></span>
<span class="line"><span>  ├─ 无法按需加载，首屏体积爆炸</span></span>
<span class="line"><span>  └─ 团队协作困难，互相阻塞</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p><strong>插件化解决方案</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>编辑器核心（稳定）</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>通过插件系统扩展（灵活）</span></span>
<span class="line"><span>  ├─ AI 插件       ← 团队A开发</span></span>
<span class="line"><span>  ├─ 上传插件      ← 团队B开发</span></span>
<span class="line"><span>  ├─ 协同插件      ← 团队C开发</span></span>
<span class="line"><span>  └─ 自定义插件    ← 客户自己开发</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><hr><h2 id="_4-2-插件生命周期管理" tabindex="-1">4.2 插件生命周期管理 <a class="header-anchor" href="#_4-2-插件生命周期管理" aria-label="Permalink to &quot;4.2 插件生命周期管理&quot;">​</a></h2><p>插件从加载到销毁经历 <strong>5 个阶段</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  1️⃣ Load（加载）                                          │</span></span>
<span class="line"><span>│  ────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 解析插件配置（manifest）                               │</span></span>
<span class="line"><span>│  • 检查依赖关系                                           │</span></span>
<span class="line"><span>│  • 动态 import 插件代码                                   │</span></span>
<span class="line"><span>│  • 创建插件实例                                           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                          ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  2️⃣ Register（注册）                                      │</span></span>
<span class="line"><span>│  ────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 注册 Vue 组件                                          │</span></span>
<span class="line"><span>│  • 注册路由                                               │</span></span>
<span class="line"><span>│  • 注册全局指令/过滤器                                     │</span></span>
<span class="line"><span>│  • 注册编辑器命令                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                          ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  3️⃣ Bootstrap（启动）                                     │</span></span>
<span class="line"><span>│  ────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 初始化插件服务                                         │</span></span>
<span class="line"><span>│  • 建立网络连接                                           │</span></span>
<span class="line"><span>│  • 加载初始数据                                           │</span></span>
<span class="line"><span>│  • 注册事件监听                                           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                          ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  4️⃣ Run（运行）                                           │</span></span>
<span class="line"><span>│  ────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 插件功能正常工作                                        │</span></span>
<span class="line"><span>│  • 响应用户操作                                           │</span></span>
<span class="line"><span>│  • 与其他插件协作                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                          ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  5️⃣ Unmount（卸载）                                       │</span></span>
<span class="line"><span>│  ────────────────────────────────────────────────────   │</span></span>
<span class="line"><span>│  • 移除事件监听                                           │</span></span>
<span class="line"><span>│  • 清理定时器/连接                                        │</span></span>
<span class="line"><span>│  • 释放内存资源                                           │</span></span>
<span class="line"><span>│  • 注销组件和命令                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br></div></div><p><strong>关键设计</strong>：ExtensionManager 统一管理所有插件的生命周期。</p><hr><h2 id="_4-3-插件配置与加载机制" tabindex="-1">4.3 插件配置与加载机制 <a class="header-anchor" href="#_4-3-插件配置与加载机制" aria-label="Permalink to &quot;4.3 插件配置与加载机制&quot;">​</a></h2><p><strong>插件配置的三种方式</strong>：</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式1：直接传入对象</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineExtensionConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  manifest: { id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, version: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;1.0.0&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式2：异步加载（推荐，支持代码分割）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineExtensionConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@design/extension-ai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式3：带参数配置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defineExtensionConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">([</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;@design/extension-ai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { apiKey: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;xxx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, model: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;gpt-4&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 插件参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p><strong>按需加载策略</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>首屏必需插件（同步加载）：</span></span>
<span class="line"><span>  ├─ 基础编辑插件（选择、拖拽、缩放...）</span></span>
<span class="line"><span>  └─ AI 聊天插件（核心功能）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>懒加载插件（用户触发时加载）：</span></span>
<span class="line"><span>  ├─ 图像编辑插件 ← 点击&quot;AI改图&quot;时加载</span></span>
<span class="line"><span>  ├─ 批量设计插件 ← 打开批量面板时加载</span></span>
<span class="line"><span>  └─ 协同插件 ← 进入协作模式时加载</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><hr><h2 id="_4-4-典型插件分类与职责" tabindex="-1">4.4 典型插件分类与职责 <a class="header-anchor" href="#_4-4-典型插件分类与职责" aria-label="Permalink to &quot;4.4 典型插件分类与职责&quot;">​</a></h2><table tabindex="0"><thead><tr><th>类别</th><th>插件示例</th><th>核心职责</th></tr></thead><tbody><tr><td><strong>AI能力</strong></td><td>extension-ai</td><td>AI 图片/视频生成、智能编辑</td></tr><tr><td></td><td>extension-image-edit</td><td>改图、扩图、消除、抠图</td></tr><tr><td><strong>素材管理</strong></td><td>extension-upload</td><td>文件上传、素材管理</td></tr><tr><td></td><td>extension-material-importer</td><td>批量导入外部素材</td></tr><tr><td><strong>效率工具</strong></td><td>extension-batch-design</td><td>批量生成、数据填充</td></tr><tr><td></td><td>extension-auto-layout</td><td>智能布局、自动对齐</td></tr><tr><td><strong>协作</strong></td><td>extension-team-panel</td><td>团队管理、权限控制</td></tr><tr><td></td><td>extension-comment</td><td>评论、标注、审批</td></tr><tr><td><strong>UI增强</strong></td><td>extension-my-panel</td><td>我的作品、收藏、历史</td></tr><tr><td></td><td>extension-template-market</td><td>模板市场、灵感广场</td></tr></tbody></table><hr><blockquote><p><strong>下一步</strong>：了解 <a href="./05-无限画布渲染引擎">无限画布渲染引擎</a> 如何支撑万级元素流畅操作。</p></blockquote>`,24)]))}const u=n(i,[["render",l]]);export{o as __pageData,u as default};
