import{_ as i,c as a,o as t,a8 as n}from"./chunks/framework.B1-gFi6y.js";const p="/Lyc-notes/assets/%E5%AD%98%E5%82%A8%E5%9E%8BXSS%E6%94%BB%E5%87%BB.CjTqGr55.png",l="/Lyc-notes/assets/FM%E6%BC%8F%E6%B4%9E%E6%9C%8D%E5%8A%A1%E5%99%A8.9eFHQe2h.png",h="/Lyc-notes/assets/%E7%94%A8%E6%88%B7%E6%89%93%E5%BC%80%E4%BA%86%E5%90%AB%E6%9C%89%E6%81%B6%E6%84%8F%E8%84%9A%E6%9C%AC%E7%9A%84%E9%A1%B5%E9%9D%A2.izQjmfRt.png",e="/Lyc-notes/assets/%E5%B0%86Cookie%E7%AD%89%E6%95%B0%E6%8D%AE%E4%B8%8A%E4%BC%A0%E5%88%B0%E9%BB%91%E5%AE%A2%E6%9C%8D%E5%8A%A1%E5%99%A8.B-Te3Fi3.png",k="/Lyc-notes/assets/%E6%AD%A3%E5%B8%B8%E6%89%93%E5%BC%80%E9%A1%B5%E9%9D%A2.B9mKjWRL.png",r="/Lyc-notes/assets/%E5%8F%8D%E5%B0%84%E5%9E%8BXSS%E6%94%BB%E5%87%BB.CCUqXw73.png",E="/Lyc-notes/assets/HttpOnly%E6%BC%94%E7%A4%BA.CdptsteK.png",F=JSON.parse('{"title":"跨站脚本攻击（XSS）：为什么 Cookie 中有 HttpOnly 属性？","description":"","frontmatter":{},"headers":[],"relativePath":"browser/跨站脚本攻击XSS.md","filePath":"browser/跨站脚本攻击XSS.md","lastUpdated":1721888606000}'),d={name:"browser/跨站脚本攻击XSS.md"};function o(g,s,c,y,S,b){return t(),a("div",null,s[0]||(s[0]=[n('<h1 id="跨站脚本攻击-xss-为什么-cookie-中有-httponly-属性" tabindex="-1">跨站脚本攻击（XSS）：为什么 Cookie 中有 HttpOnly 属性？ <a class="header-anchor" href="#跨站脚本攻击-xss-为什么-cookie-中有-httponly-属性" aria-label="Permalink to &quot;跨站脚本攻击（XSS）：为什么 Cookie 中有 HttpOnly 属性？&quot;">​</a></h1><p>通过上篇文章的介绍，我们知道了同源策略可以隔离各个站点之间的 DOM 交互、页面数据和网络通信，虽然严格的同源策略会带来更多的安全，但是也束缚了 Web。这就需要在安全和自由之间找到一个平衡点，所以我们默认页面中可以引用任意第三方资源，然后又引入 CSP 策略来加以限制；默认 XMLHttpRequest 和 Fetch 不能跨站请求资源，然后又通过 CORS 策略来支持其跨域。</p><p>不过支持页面中的第三方资源引用和 CORS 也带来了很多安全问题，其中最典型的就是 XSS 攻击。</p><h2 id="什么是-xss-攻击" tabindex="-1">什么是 XSS 攻击 <a class="header-anchor" href="#什么是-xss-攻击" aria-label="Permalink to &quot;什么是 XSS 攻击&quot;">​</a></h2><p>XSS 全称是<strong>Cross Site Scripting</strong>，为了与“CSS”区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。</p><p>最开始的时候，这种攻击是通过跨域来实现的，所以叫“跨域脚本”。但是发展到现在，往 HTML 文件中注入恶意代码的方式越来越多了，所以是否跨域注入脚本已经不是唯一的注入手段了，但是 XSS 这个名字却一直保留至今。</p><p>当页面被注入了恶意 JavaScript 脚本时，浏览器无法区分这些脚本是被恶意注入的还是正常的页面内容，所以恶意注入 JavaScript 脚本也拥有所有的脚本权限。下面我们就来看看，如果页面被注入了恶意 JavaScript 脚本，恶意脚本都能做哪些事情。</p><ul><li><strong>可以窃取 Cookie 信息</strong>。恶意 JavaScript 可以通过“document.cookie”获取 Cookie 信息，然后通过 XMLHttpRequest 或者 Fetch 加上 CORS 功能将数据发送给恶意服务器；恶意服务器拿到用户的 Cookie 信息之后，就可以在其他电脑上模拟用户的登录，然后进行转账等操作。</li><li><strong>可以监听用户行为</strong>。恶意 JavaScript 可以使用“addEventListener”接口来监听键盘事件，比如可以获取用户输入的信用卡等信息，将其发送到恶意服务器。黑客掌握了这些信息之后，又可以做很多违法的事情。</li><li>可以通过<strong>修改 DOM</strong>伪造假的登录窗口，用来欺骗用户输入用户名和密码等信息。</li><li>还可以在页面内生成浮窗广告，这些广告会严重地影响用户体验。</li></ul><p>除了以上几种情况外，恶意脚本还能做很多其他的事情，这里就不一一介绍了。总之，如果让页面插入了恶意脚本，那么就相当于把我们页面的隐私数据和行为完全暴露给黑客了。</p><h2 id="恶意脚本是怎么注入的" tabindex="-1">恶意脚本是怎么注入的 <a class="header-anchor" href="#恶意脚本是怎么注入的" aria-label="Permalink to &quot;恶意脚本是怎么注入的&quot;">​</a></h2><p>现在我们知道了页面中被注入恶意的 JavaScript 脚本是一件非常危险的事情，所以网站开发者会尽可能地避免页面中被注入恶意脚本。要想避免站点被注入恶意脚本，就要知道有哪些常见的注入方式。通常情况下，主要有<strong>存储型 XSS 攻击、反射型 XSS 攻击和基于 DOM</strong>的 XSS 攻击三种方式来注入恶意脚本。</p><h3 id="存储型-xss-攻击" tabindex="-1">存储型 XSS 攻击 <a class="header-anchor" href="#存储型-xss-攻击" aria-label="Permalink to &quot;存储型 XSS 攻击&quot;">​</a></h3><p>我们先来看看存储型 XSS 攻击是怎么向 HTML 文件中注入恶意脚本的，你可以参考下图：</p><p><img src="'+p+'" alt="alt text"></p><p>通过上图，我们可以看出存储型 XSS 攻击大致需要经过如下步骤：</p><ul><li>首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中；</li><li>然后用户向网站请求包含了恶意 JavaScript 脚本的页面；</li><li>当用户浏览该页面的时候，恶意脚本就会将用户的 Cookie 信息等数据上传到服务器。</li></ul><p>下面我们来看个例子，2015 年喜马拉雅就被曝出了存储型 XSS 漏洞。起因是在用户设置专辑名称时，服务器对关键字过滤不严格，比如可以将专辑名称设置为一段 JavaScript，如下图所示：</p><p><img src="'+l+'" alt="alt text"></p><p>黑客将恶意代码存储到漏洞服务器上</p><p>当黑客将专辑名称设置为一段 JavaScript 代码并提交时，喜马拉雅的服务器会保存该段 JavaScript 代码到数据库中。然后当用户打开黑客设置的专辑时，这段代码就会在用户的页面里执行（如下图），这样就可以获取用户的 Cookie 等数据信息。</p><p><img src="'+h+'" alt="alt text"></p><p>当用户打开黑客设置的专辑页面时，服务器也会将这段恶意 JavaScript 代码返回给用户，因此这段恶意脚本就在用户的页面中执行了。</p><p>恶意脚本可以通过 XMLHttpRequest 或者 Fetch 将用户的 Cookie 数据上传到黑客的服务器，如下图所示：</p><p><img src="'+e+`" alt="alt text"></p><p>黑客拿到了用户 Cookie 信息之后，就可以利用 Cookie 信息在其他机器上登录该用户的账号（如下图），并利用用户账号进行一些恶意操作。</p><p>以上就是存储型 XSS 攻击的一个典型案例，这是乌云网在 2015 年曝出来的，虽然乌云网由于某些原因被关停了，但是你依然可以通过这个站点来查看乌云网的一些备份信息。</p><h3 id="反射型-xss-攻击" tabindex="-1">反射型 XSS 攻击 <a class="header-anchor" href="#反射型-xss-攻击" aria-label="Permalink to &quot;反射型 XSS 攻击&quot;">​</a></h3><p>在一个反射型 XSS 攻击过程中，恶意 JavaScript 脚本属于用户发送给网站请求中的一部分，随后网站又把恶意 JavaScript 脚本返回给用户。当恶意 JavaScript 脚本在用户页面中被执行时，黑客就可以利用该脚本做一些恶意操作。</p><p>这样讲有点抽象，下面我们结合一个简单的 Node 服务程序来看看什么是反射型 XSS。首先我们使用 Node 来搭建一个简单的页面环境，搭建好的服务代码如下所示：</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> express </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> require</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;express&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> router </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> express.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Router</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/* GET home page. */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">router.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">req</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">res</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">next</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  res.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;index&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { title: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Express&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, xss: req.query.xss })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> router</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><div class="language-html vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;!</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">DOCTYPE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> html</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">html</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">head</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">title</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">%= title %&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">title</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">link</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> rel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;stylesheet&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> href</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/stylesheets/style.css&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">head</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">h1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">%= title %&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">h1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;Welcome to </span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">%= title %&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">p</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">%- xss %&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">html</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>上面这两段代码，第一段是路由，第二段是视图，作用是将 URL 中 xss 参数的内容显示在页面。我们可以在本地演示下，比如打开<code>http://localhost:3000/?xss=123</code>这个链接，这样在页面中展示就是“123”了（如下图），是正常的，没有问题的。</p><p><img src="`+k+'" alt="alt text"></p><p>但当打开<code>http://localhost:3000/?xss=&lt;script&gt;alert(&#39;你被xss攻击了&#39;)&lt;/script&gt;</code>这段 URL 时，其结果如下图所示：</p><p><img src="'+r+'" alt="alt text"></p><p>通过这个操作，我们会发现用户将一段含有恶意代码的请求提交给 Web 服务器，Web 服务器接收到请求时，又将恶意代码反射给了浏览器端，这就是反射型 XSS 攻击。在现实生活中，黑客经常会通过 QQ 群或者邮件等渠道诱导用户去点击这些恶意链接，所以对于一些链接我们一定要慎之又慎。</p><p>另外需要注意的是，Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地方。</p><h3 id="基于-dom-的-xss-攻击" tabindex="-1">基于 DOM 的 XSS 攻击 <a class="header-anchor" href="#基于-dom-的-xss-攻击" aria-label="Permalink to &quot;基于 DOM 的 XSS 攻击&quot;">​</a></h3><p>基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。具体来讲，黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。</p><h2 id="如何阻止-xss-攻击" tabindex="-1">如何阻止 XSS 攻击 <a class="header-anchor" href="#如何阻止-xss-攻击" aria-label="Permalink to &quot;如何阻止 XSS 攻击&quot;">​</a></h2><p>我们知道存储型 XSS 攻击和反射型 XSS 攻击都是需要经过 Web 服务器来处理的，因此可以认为这两种类型的漏洞是服务端的安全漏洞。而基于 DOM 的 XSS 攻击全部都是在浏览器端完成的，因此基于 DOM 的 XSS 攻击是属于前端的安全漏洞。</p><p>但无论是何种类型的 XSS 攻击，它们都有一个共同点，那就是首先往浏览器中注入恶意脚本，然后再通过恶意脚本将用户信息发送至黑客部署的恶意服务器上。</p><p>所以要阻止 XSS 攻击，我们可以通过阻止恶意 JavaScript 脚本的注入和恶意消息的发送来实现。</p><p>接下来我们就来看看一些常用的阻止 XSS 攻击的策略。</p><h3 id="服务器对输入脚本进行过滤或转码" tabindex="-1">服务器对输入脚本进行过滤或转码 <a class="header-anchor" href="#服务器对输入脚本进行过滤或转码" aria-label="Permalink to &quot;服务器对输入脚本进行过滤或转码&quot;">​</a></h3><p>不管是反射型还是存储型 XSS 攻击，我们都可以在服务器端将一些关键的字符进行转码，比如最典型的：</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">code</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;alert(&#39;你被xss攻击了&#39;)&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>这段代码过滤后，只留下了： <code>code:</code></p><p>这样，当用户再次请求该页面时，由于<code>&lt;script&gt;</code>标签的内容都被过滤了，所以这段脚本在客户端是不可能被执行的。</p><p>除了过滤之外，服务器还可以对这些内容进行转码，还是上面那段代码，经过转码之后，效果如下所示：</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">code</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lt;script</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">alert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">39</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;你被xss攻击了</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">#</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">39</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">script</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>经过转码之后的内容，如<code>&lt;script&gt;</code>标签被转换为&lt;script&gt;，因此即使这段脚本返回给页面，页面也不会执行这段脚本。</p><h3 id="充分利用-csp" tabindex="-1">充分利用 CSP <a class="header-anchor" href="#充分利用-csp" aria-label="Permalink to &quot;充分利用 CSP&quot;">​</a></h3><p>虽然在服务器端执行过滤或者转码可以阻止 XSS 攻击的发生，但完全依靠服务器端依然是不够的，我们还需要把 CSP 等策略充分地利用起来，以降低 XSS 攻击带来的风险和后果。</p><p>实施严格的 CSP 可以有效地防范 XSS 攻击，具体来讲 CSP 有如下几个功能：</p><ul><li>限制加载其他域下的资源文件，这样即使黑客插入了一个 JavaScript 文件，这个 JavaScript 文件也是无法被加载的；</li><li>禁止向第三方域提交数据，这样用户数据也不会外泄；</li><li>禁止执行内联脚本和未授权的脚本；</li><li>还提供了上报机制，这样可以帮助我们尽快发现有哪些 XSS 攻击，以便尽快修复问题。</li></ul><p>因此，利用好 CSP 能够有效降低 XSS 攻击的概率。</p><h3 id="使用-httponly-属性" tabindex="-1">使用 HttpOnly 属性 <a class="header-anchor" href="#使用-httponly-属性" aria-label="Permalink to &quot;使用 HttpOnly 属性&quot;">​</a></h3><p>由于很多 XSS 攻击都是来盗用 Cookie 的，因此还可以通过使用 HttpOnly 属性来保护我们 Cookie 的安全。</p><p>通常服务器可以将某些 Cookie 设置为 HttpOnly 标志，HttpOnly 是服务器通过 HTTP 响应头来设置的，下面是打开 Google 时，HTTP 响应头中的一段：</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">set</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cookie</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">NID</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">189</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">M8q2FtWbsR8RlcldPVt7qkrqR38LmFY9jUxkKo3</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">4Bi6Qu_ocNOat7nkYZUTzolHjFnwBw0izgsATSI7TZyiiiaV94qGh</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">BzEYsNVa7TZmjAYTxYTOM9L_</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">0CN9ipL6cXi8l6</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">z41asXtm2uEwcOC5oh9djkffOMhWqQrlnCtOI; expires</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Sat, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Apr</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2020</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 06</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">52</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">22</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> GMT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; path</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; domain</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.google.com; HttpOnly</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>我们可以看到，set-cookie 属性值最后使用了 HttpOnly 来标记该 Cookie。顾名思义，使用 HttpOnly 标记的 Cookie 只能使用在 HTTP 请求过程中，所以无法通过 JavaScript 来读取这段 Cookie。我们还可以通过 Chrome 开发者工具来查看哪些 Cookie 被标记了 HttpOnly，如下图： <img src="'+E+'" alt="alt text"></p><p>从图中可以看出，NID 这个 Cookie 的 HttpOlny 属性是被勾选上的，所以 NID 的内容是无法通过 document.cookie 是来读取的。</p><p>由于 JavaScript 无法读取设置了 HttpOnly 的 Cookie 数据，所以即使页面被注入了恶意 JavaScript 脚本，也是无法获取到设置了 HttpOnly 的数据。因此一些比较重要的数据我们建议设置 HttpOnly 标志。</p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>XSS 攻击就是黑客往页面中注入恶意脚本，然后将页面的一些重要数据上传到恶意服务器。常见的三种 XSS 攻击模式是存储型 XSS 攻击、反射型 XSS 攻击和基于 DOM 的 XSS 攻击。</p><p>这三种攻击方式的共同点是都需要往用户的页面中注入恶意脚本，然后再通过恶意脚本将用户数据上传到黑客的恶意服务器上。而三者的不同点在于注入的方式不一样，有通过服务器漏洞来进行注入的，还有在客户端直接注入的。</p><p>针对这些 XSS 攻击，主要有三种防范策略，第一种是通过服务器对输入的内容进行过滤或者转码，第二种是充分利用好 CSP，第三种是使用 HttpOnly 来保护重要的 Cookie 信息。</p><p>当然除了以上策略之外，我们还可以通过添加验证码防止脚本冒充用户提交危险操作。而对于一些不受信任的输入，还可以限制其输入长度，这样可以增大 XSS 攻击的难度。</p><h2 id="思考" tabindex="-1">思考 <a class="header-anchor" href="#思考" aria-label="Permalink to &quot;思考&quot;">​</a></h2><p>你认为前端开发者对 XSS 攻击应该负多大责任？</p>',71)]))}const m=i(d,[["render",o]]);export{F as __pageData,m as default};
