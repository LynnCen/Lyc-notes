import{_ as a,c as t,o as e,aa as s}from"./chunks/framework.CAVwB9kQ.js";const i="/Lyc-notes/assets/TCP%E5%92%8CHTTP%E7%9A%84%E5%85%B3%E7%B3%BB.BtUa3F8d.png",o="/Lyc-notes/assets/http%E8%AF%B7%E6%B1%82%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F.A93XdeQ9.png",r="/Lyc-notes/assets/%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%93%8D%E5%BA%94%E7%9A%84%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F.NfCfrVhS.png",l="/Lyc-notes/assets/%E9%87%8D%E5%AE%9A%E5%90%91.CEO0u0o2.png",n="/Lyc-notes/assets/%E8%B5%84%E6%BA%90%E7%BC%93%E5%AD%98.KPhcvxRH.png",p="/Lyc-notes/assets/HTTP%E8%AF%B7%E6%B1%82%E6%B5%81%E7%A8%8B.BF1e3bma.png",E=JSON.parse('{"title":"HTTP 请求流程","description":"","frontmatter":{},"headers":[],"relativePath":"browser/HTTP.md","filePath":"browser/HTTP.md","lastUpdated":1717488651000}'),h={name:"browser/HTTP.md"},c=s('<h1 id="http-请求流程" tabindex="-1">HTTP 请求流程 <a class="header-anchor" href="#http-请求流程" aria-label="Permalink to &quot;HTTP 请求流程&quot;">​</a></h1><h2 id="浏览器端发起-http-请求流程" tabindex="-1">浏览器端发起 HTTP 请求流程 <a class="header-anchor" href="#浏览器端发起-http-请求流程" aria-label="Permalink to &quot;浏览器端发起 HTTP 请求流程&quot;">​</a></h2><h4 id="构建请求" tabindex="-1">构建请求 <a class="header-anchor" href="#构建请求" aria-label="Permalink to &quot;构建请求&quot;">​</a></h4><p>首先，浏览器构建请求行信息（如下所示），构建好后，浏览器准备发起网络请求。</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">GET</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">index.html </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">HTTP1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h4 id="查找缓存" tabindex="-1">查找缓存 <a class="header-anchor" href="#查找缓存" aria-label="Permalink to &quot;查找缓存&quot;">​</a></h4><p>在真正发起网络请求之前，浏览器会先在浏览器缓存中查询是否有要请求的文件。其中，<strong>浏览器缓存是一种在本地保存资源副本，以供下次请求时直接使用的技术</strong>。</p><p>当浏览器发现请求的资源已经在浏览器缓存中存有副本，它会拦截请求，返回该资源的副本，并直接结束请求，而不会再去源服务器重新下载。这样做的好处有：</p><ul><li>缓解服务器端压力，提升性能（获取资源的耗时更短了）</li><li>对于网站来说，缓存是实现快速资源加载的重要组成部分 当然，如果缓存查找失败，就会进入网络请求过程了。</li></ul><h4 id="准备-ip-地址和端口" tabindex="-1">准备 IP 地址和端口 <a class="header-anchor" href="#准备-ip-地址和端口" aria-label="Permalink to &quot;准备 IP 地址和端口&quot;">​</a></h4><p>浏览器使用<strong>HTTP 协议作为应用层协议</strong>，用来封装请求的文本信息；并使用<strong>TCP/IP 作传输层协议</strong>将它发到网络上，所以在 HTTP 工作开始之前，浏览器需要通过 TCP 与服务器建立连接。也就是说<strong>HTTP 的内容是通过 TCP 的传输数据阶段来实现的</strong>，你可以结合下图更好地理解这二者的关系。</p><p><img src="'+i+'" alt="alt text"></p><ul><li>HTTP 网络请求的第一步是做什么呢？结合上图看，<strong>是和服务器建立 TCP 连接</strong>。</li><li>获取建立连接的信息，<strong>需要准备 IP 地址和端口号</strong>。</li><li>利用<strong>URL 地址来获取 IP 和端口信息</strong>，URL 域名映射为 IP 的系统就叫做“<strong>域名系统</strong>”，简称<strong>DNS</strong></li></ul><p><strong>第一步浏览器会请求 DNS 返回域名对应的 IP</strong>。当然浏览器还提供了 DNS 数据缓存服务，如果某个域名已经解析过了，那么浏览器会缓存解析的结果，以供下次查询时直接使用，这样也会减少一次网络请求。</p><p>拿到 IP 之后，接下来就需要获取端口号了。通常情况下，如果 URL 没有特别指明端口号，那么 HTTP 协议默认是 80 端口。</p><h4 id="等待-tcp-队列" tabindex="-1">等待 TCP 队列 <a class="header-anchor" href="#等待-tcp-队列" aria-label="Permalink to &quot;等待 TCP 队列&quot;">​</a></h4><p>现在已经把端口和 IP 地址都准备好了，那么下一步是不是可以建立 TCP 连接了呢？</p><p>答案依然是“不行”。Chrome 有个机制，同一个域名同时最多只能建立 6 个 TCP 连接，如果在同一个域名下同时有 10 个请求发生，那么其中 4 个请求会进入排队等待状态，直至进行中的请求完成。</p><p>当然，如果当前请求数量少于 6，会直接进入下一步，建立 TCP 连接。</p><h4 id="建立-tcp-连接" tabindex="-1">建立 TCP 连接 <a class="header-anchor" href="#建立-tcp-连接" aria-label="Permalink to &quot;建立 TCP 连接&quot;">​</a></h4><p>排队等待结束之后，终于可以快乐地和服务器握手了，在 HTTP 工作开始之前，浏览器通过 TCP 与服务器建立连接。</p><h4 id="发送-http-请求" tabindex="-1">发送 HTTP 请求 <a class="header-anchor" href="#发送-http-请求" aria-label="Permalink to &quot;发送 HTTP 请求&quot;">​</a></h4><p>一旦建立了 TCP 连接，浏览器就可以和服务器进行通信了。而 HTTP 中的数据正是在这个通信过程中传输的。</p><p><img src="'+o+'" alt="alt text"></p><p>发送<strong>请求行</strong>，就是告诉服务器浏览器需要什么资源，最常用的请求方法是 Get。比如，直接在浏览器地址栏键入极客时间的域名（time.geekbang.org），这就是告诉服务器要 Get 它的首页资源。</p><p>另外一个常用的请求方法是 POST，它用于发送一些数据给服务器，比如登录一个网站，就需要通过 POST 方法把用户信息发送给服务器。如果使用 POST 方法，那么浏览器还要准备数据给服务器，这里准备的数据是通过请求体来发送。</p><p>在浏览器发送请求行命令之后，还要以请求头形式发送其他一些信息，把浏览器的一些基础信息告诉服务器。比如包含了浏览器所使用的操作系统、浏览器内核等信息，以及当前请求的域名信息、浏览器端的 Cookie 信息，等等。</p><h2 id="服务器端处理-http-请求流程" tabindex="-1">服务器端处理 HTTP 请求流程 <a class="header-anchor" href="#服务器端处理-http-请求流程" aria-label="Permalink to &quot;服务器端处理 HTTP 请求流程&quot;">​</a></h2><h4 id="返回请求" tabindex="-1">返回请求 <a class="header-anchor" href="#返回请求" aria-label="Permalink to &quot;返回请求&quot;">​</a></h4><p><img src="'+r+'" alt="alt text"></p><p>首先服务器会返回响应行，包括协议版本和状态码。</p><p>但并不是所有的请求都可以被服务器处理的，那么一些无法处理或者处理出错的信息，怎么办呢？服务器会通过请求行的状态码来告诉浏览器它的处理结果，比如：</p><ul><li>最常用的状态码是 200，表示处理成功；</li><li>如果没有找到页面，则会返回 404。</li></ul><p>随后，正如浏览器会随同请求发送请求头一样，服务器也会随同响应向浏览器发送<strong>响应头</strong>。响应头包含了服务器自身的一些信息，比如服务器生成返回数据的时间、返回的数据类型（JSON、HTML、流媒体等类型），以及服务器要在客户端保存的 Cookie 等信息。</p><p>发送完响应头后，服务器就可以继续发送响应体的数据，通常，响应体就包含了 HTML 的实际内容。</p><h4 id="断开连接" tabindex="-1">断开连接 <a class="header-anchor" href="#断开连接" aria-label="Permalink to &quot;断开连接&quot;">​</a></h4><p>通常情况下，一旦服务器向客户端返回了请求数据，它就要关闭 TCP 连接。不过如果浏览器或者服务器在其头信息中加入了：</p><div class="language-js vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Connection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: Keep </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Alive</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>那么 TCP 连接在发送后将仍然保持打开状态，这样浏览器就可以继续通过同一个 TCP 连接发送请求。<strong>保持 TCP 连接可以省去下次请求时需要建立连接的时间，提升资源加载速度</strong>。比如，一个 Web 页面中内嵌的图片就都来自同一个 Web 站点，如果初始化了一个持久连接，你就可以复用该连接，以请求其他资源，而不需要重新再建立新的 TCP 连接。</p><h4 id="重定向" tabindex="-1">重定向 <a class="header-anchor" href="#重定向" aria-label="Permalink to &quot;重定向&quot;">​</a></h4><p><img src="'+l+'" alt="alt text"></p><p>响应行返回的状态码是 301，状态 301 就是告诉浏览器，我需要重定向到另外一个网址，而需要重定向的网址正是包含在响应头的 Location 字段中，接下来，浏览器获取 Location 字段中的地址，并使用该地址重新导航，这就是一个完整重定向的执行流程。</p><h2 id="为什么很多站点第二次打开速度会很快" tabindex="-1">为什么很多站点第二次打开速度会很快？ <a class="header-anchor" href="#为什么很多站点第二次打开速度会很快" aria-label="Permalink to &quot;为什么很多站点第二次打开速度会很快？&quot;">​</a></h2><p>如果第二次页面打开很快，主要原因是第一次加载页面过程中，缓存了一些耗时的数据。</p><p><strong>DNS 缓存</strong>和<strong>页面资源缓存</strong>这两块数据是会被浏览器缓存的。</p><p><img src="'+n+'" alt="alt text"></p><p>当服务器返回 HTTP 响应头给浏览器时，浏览器是<strong>通过响应头中的 Cache-Control 字段来设置是否缓存该资源</strong>。</p><p>通常，我们还需要为这个资源设置一个缓存过期时长，而这个时长是通过 Cache-Control 中的 Max-age 参数来设置的，比如上图设置的缓存过期时间是 2000 秒。<code>Cache-Control:Max-age=2000</code></p><p>这也就意味着，在该缓存资源还未过期的情况下, 如果再次请求该资源，会直接返回缓存中的资源给浏览器。</p><p>但如果缓存过期了，浏览器则会继续发起网络请求，并且在 HTTP 请求头中带上：<code>If-None-Match:&quot;4f80f-13c-3a1xb12a&quot;</code></p><p>服务器收到请求头后，会根据 If-None-Match 的值来判断请求的资源是否有更新。</p><ul><li>如果没有更新，就返回 304 状态码，相当于服务器告诉浏览器：“这个缓存可以继续使用，这次就不重复发送数据给你了。”</li><li>如果资源有更新，服务器就直接返回最新资源给浏览器。</li></ul><p>详细查看：<a href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching" target="_blank" rel="noreferrer">https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching</a></p><p>简要来说，很多网站第二次访问能够秒开，是因为这些网站把很多资源都缓存在了本地，浏览器缓存直接使用本地副本来回应请求，而不会产生真实的网络请求，从而节省了时间。同时，DNS 数据也被浏览器缓存了，这又省去了 DNS 查询环节。</p><h2 id="登录状态是如何保持的" tabindex="-1">登录状态是如何保持的？ <a class="header-anchor" href="#登录状态是如何保持的" aria-label="Permalink to &quot;登录状态是如何保持的？&quot;">​</a></h2><ul><li><p>用户打开登录页面，在登录框里填入用户名和密码，点击确定按钮。点击按钮会触发页面脚本生成用户登录信息，然后调用 POST 方法提交用户登录信息给服务器。</p></li><li><p>服务器接收到浏览器提交的信息之后，查询后台，验证用户登录信息是否正确，如果正确的话，会生成一段表示用户身份的字符串，并把该字符串写到响应头的 Set-Cookie 字段里，如下所示，然后把响应头发送给浏览器。<code>Set-Cookie: UID=3431uad;</code></p></li><li><p>浏览器在接收到服务器的响应头后，开始解析响应头，如果遇到响应头里含有 Set-Cookie 字段的情况，浏览器就会把这个字段信息保存到本地。比如把<code>UID=3431uad</code>保持到本地。</p></li><li><p>当用户再次访问时，浏览器会发起 HTTP 请求，但在发起请求之前，浏览器会读取之前保存的 Cookie 数据，并把数据写进请求头里的 Cookie 字段里（如下所示），然后浏览器再将请求头发送给服务器。<code>Cookie: UID=3431uad;</code></p></li><li><p>服务器在收到 HTTP 请求头数据之后，就会查找请求头里面的“Cookie”字段信息，当查找到包含 UID=3431uad 的信息时，服务器查询后台，并判断该用户是已登录状态，然后生成含有该用户信息的页面数据，并把生成的数据发送给浏览器。</p></li><li><p>浏览器在接收到该含有当前用户的页面数据后，就可以正确展示用户登录的状态信息了。</p></li></ul><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p><img src="'+p+'" alt="alt text"></p>',58),d=[c];function T(P,g,u,k,C,b){return e(),t("div",null,d)}const _=a(h,[["render",T]]);export{E as __pageData,_ as default};
