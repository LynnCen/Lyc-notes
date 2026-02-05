import{_ as n,c as a,o as p,a7 as e}from"./chunks/framework.BQb8NfN9.js";const u=JSON.parse('{"title":"03 - 编辑器基座","description":"","frontmatter":{},"headers":[],"relativePath":"work/gd/AI+智能设计编辑器架构文档/03-编辑器基座.md","filePath":"work/gd/AI+智能设计编辑器架构文档/03-编辑器基座.md","lastUpdated":1770085732000}'),l={name:"work/gd/AI+智能设计编辑器架构文档/03-编辑器基座.md"};function i(r,s,t,c,d,b){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="_03-编辑器基座" tabindex="-1">03 - 编辑器基座 <a class="header-anchor" href="#_03-编辑器基座" aria-label="Permalink to &quot;03 - 编辑器基座&quot;">​</a></h1><blockquote><p><strong>导航</strong>：<a href="./README">📚 返回总目录</a> | <a href="./02-整体架构设计">⬅️ 上一篇：整体架构设计</a> | <a href="./04-扩展插件系统">➡️ 下一篇：扩展插件系统</a></p><p><strong>所属</strong>：AI+ 智能设计编辑器架构文档</p></blockquote><hr><h2 id="_3-1-基座的设计哲学" tabindex="-1">3.1 基座的设计哲学 <a class="header-anchor" href="#_3-1-基座的设计哲学" aria-label="Permalink to &quot;3.1 基座的设计哲学&quot;">​</a></h2><p><strong>核心思想</strong>：把复杂的初始化流程封装成一行代码。</p><div class="language-javascript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 应用层只需要这一行！</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> installDesign</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, config);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p><strong>背后发生了什么？</strong>（7步标准化流程）</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>第1步：环境初始化</span></span>
<span class="line"><span>  ├─ 设置 API 域名（国内/国外）</span></span>
<span class="line"><span>  ├─ 注入环境变量（HOME_PAGE, REGION...）</span></span>
<span class="line"><span>  └─ 配置 OSS/CDN</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第2步：API 服务初始化</span></span>
<span class="line"><span>  ├─ 创建 HTTP 客户端</span></span>
<span class="line"><span>  ├─ 配置拦截器（鉴权、错误处理）</span></span>
<span class="line"><span>  └─ 注册业务 API（用户、模板、AI...）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第3步：权限系统初始化</span></span>
<span class="line"><span>  ├─ 加载权限配置</span></span>
<span class="line"><span>  ├─ 初始化权限控制器</span></span>
<span class="line"><span>  └─ 设置功能开关（哪些能力可用）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第4步：创建 Vue 应用</span></span>
<span class="line"><span>  ├─ 创建 Vue 实例</span></span>
<span class="line"><span>  ├─ 注册 Pinia（状态管理）</span></span>
<span class="line"><span>  ├─ 注册 Router（路由）</span></span>
<span class="line"><span>  └─ 注册全局组件</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第5步：插件注册</span></span>
<span class="line"><span>  ├─ 加载扩展配置（extensionConfig）</span></span>
<span class="line"><span>  ├─ 依次注册每个插件</span></span>
<span class="line"><span>  └─ 调用插件的 register 钩子</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第6步：日志服务初始化</span></span>
<span class="line"><span>  ├─ 配置日志上报（SLS）</span></span>
<span class="line"><span>  ├─ 设置错误监控</span></span>
<span class="line"><span>  └─ 初始化埋点系统</span></span>
<span class="line"><span></span></span>
<span class="line"><span>第7步：编辑器挂载</span></span>
<span class="line"><span>  ├─ 渲染编辑器组件</span></span>
<span class="line"><span>  ├─ 初始化画布</span></span>
<span class="line"><span>  ├─ 触发 mounted 生命周期</span></span>
<span class="line"><span>  └─ 完成启动 ✅</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br></div></div><p><strong>为什么这样设计？</strong></p><ul><li>保证初始化顺序（有些服务依赖其他服务）</li><li>统一错误处理（任一步失败都能优雅降级）</li><li>便于扩展（新增服务只需插入对应步骤）</li></ul><hr><h2 id="_3-2-国内版-vs-国际版-多租户架构实践" tabindex="-1">3.2 国内版 vs 国际版 - 多租户架构实践 <a class="header-anchor" href="#_3-2-国内版-vs-国际版-多租户架构实践" aria-label="Permalink to &quot;3.2 国内版 vs 国际版 - 多租户架构实践&quot;">​</a></h2><p>两个版本<strong>共享 95% 的代码</strong>，只有这些地方不同：</p><table tabindex="0"><thead><tr><th>差异维度</th><th>design-ai-plus (国内)</th><th>insmind-ai-plus (国际)</th><th>实现方式</th></tr></thead><tbody><tr><td><strong>登录</strong></td><td>手机号 + 短信验证码</td><td>Google OAuth 2.0</td><td>配置 <code>env.LOGIN_TYPE</code></td></tr><tr><td><strong>API</strong></td><td><a href="https://api.huaban.com" target="_blank" rel="noreferrer">https://api.huaban.com</a></td><td><a href="https://api.insmind.com" target="_blank" rel="noreferrer">https://api.insmind.com</a></td><td>配置 <code>env.API_BASE_URL</code></td></tr><tr><td><strong>存储</strong></td><td>阿里云 OSS</td><td>AWS S3</td><td>配置 <code>env.STORAGE_TYPE</code></td></tr><tr><td><strong>CDN</strong></td><td>国内 CDN</td><td>Cloudflare</td><td>配置 <code>env.CDN_DOMAIN</code></td></tr><tr><td><strong>AI服务</strong></td><td>国内部署模型</td><td>海外部署模型</td><td>配置 <code>env.AI_SERVICE_URL</code></td></tr><tr><td><strong>支付</strong></td><td>支付宝 + 微信支付</td><td>Stripe</td><td>配置 <code>env.PAYMENT_TYPE</code></td></tr><tr><td><strong>语言</strong></td><td>中文优先</td><td>英文优先</td><td>配置 <code>env.DEFAULT_LOCALE</code></td></tr></tbody></table><p><strong>多租户架构的关键</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>核心原则：通过配置驱动差异，而不是代码分支</span></span>
<span class="line"><span></span></span>
<span class="line"><span>错误示范：</span></span>
<span class="line"><span>  if (isChina) {</span></span>
<span class="line"><span>    useAlipay();</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    useStripe();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>正确做法：</span></span>
<span class="line"><span>  const PaymentProvider = config.paymentType; // 动态注入</span></span>
<span class="line"><span>  PaymentProvider.pay(amount);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p><strong>配置管理</strong>：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/apps/design-ai-plus/src/configs/</span></span>
<span class="line"><span>  ├── env.ts          ← 环境配置（API域名、登录方式...）</span></span>
<span class="line"><span>  ├── apis.ts         ← API端点配置</span></span>
<span class="line"><span>  └── extensions.ts   ← 插件配置（哪些插件启用）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/apps/insmind-ai-plus/src/configs/</span></span>
<span class="line"><span>  ├── env.ts          ← 不同的环境配置</span></span>
<span class="line"><span>  ├── apis.ts         ← 不同的API端点</span></span>
<span class="line"><span>  └── extensions.ts   ← 不同的插件配置</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><hr><blockquote><p><strong>下一步</strong>：了解 <a href="./04-扩展插件系统">扩展插件系统</a> 如何支持灵活扩展。</p></blockquote>`,20)]))}const m=n(l,[["render",i]]);export{u as __pageData,m as default};
