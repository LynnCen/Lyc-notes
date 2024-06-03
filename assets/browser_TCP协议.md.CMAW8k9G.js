import{_ as a,c as e,o as t,aa as r}from"./chunks/framework.CAVwB9kQ.js";const T=JSON.parse('{"title":"TCP 协议：如何保证页面文件能被完整送达浏览器？","description":"","frontmatter":{},"headers":[],"relativePath":"browser/TCP协议.md","filePath":"browser/TCP协议.md","lastUpdated":1717407459000}'),o={name:"browser/TCP协议.md"},s=r('<h1 id="tcp-协议-如何保证页面文件能被完整送达浏览器" tabindex="-1">TCP 协议：如何保证页面文件能被完整送达浏览器？ <a class="header-anchor" href="#tcp-协议-如何保证页面文件能被完整送达浏览器" aria-label="Permalink to &quot;TCP 协议：如何保证页面文件能被完整送达浏览器？&quot;">​</a></h1><p>在衡量 Web 页面性能的时候有一个重要的指标叫<code>“FP（First Paint）”</code>，是指从页面加载到首次开始绘制的时长。这个指标直接影响了用户的跳出率，更快的页面响应意味着更多的<code>PV</code>、更高的参与度，以及更高的转化率。那什么影响 FP 指标呢？其中一个重要的因素是网络加载速度。</p><p>要想优化 Web 页面的加载速度，你需要对网络有充分的了解。而理解网络的关键是要对网络协议有深刻的认识，不管你是使用 HTTP，还是使用 WebSocket，它们都是基于 TCP/IP 的，如果你对这些原理有足够了解，也就清楚如何去优化 Web 性能，或者能更轻松地定位 Web 问题了。此外，TCP/IP 的设计思想还有助于拓宽你的知识边界，从而在整体上提升你对项目的理解和解决问题的能力。</p><h2 id="一个数据包的-旅程" tabindex="-1">一个数据包的“旅程” <a class="header-anchor" href="#一个数据包的-旅程" aria-label="Permalink to &quot;一个数据包的“旅程”&quot;">​</a></h2><p>下面我将分别从<strong>数据包如何送达主机</strong> <strong>主机如何将数据包转交给应用</strong>和<strong>数据是如何被完整地送达应用程序</strong>这三个角度来为你讲述数据的传输过程。</p><p>互联网，实际上是一套理念和协议组成的体系架构。其中，协议是一套众所周知的规则和标准，如果各方都同意使用，那么它们之间的通信将变得毫无障碍。</p><h4 id="ip-把数据包送达目的主机" tabindex="-1">IP：把数据包送达目的主机 <a class="header-anchor" href="#ip-把数据包送达目的主机" aria-label="Permalink to &quot;IP：把数据包送达目的主机&quot;">​</a></h4><h4 id="udp-把数据包送达应用程序" tabindex="-1">UDP：把数据包送达应用程序 <a class="header-anchor" href="#udp-把数据包送达应用程序" aria-label="Permalink to &quot;UDP：把数据包送达应用程序&quot;">​</a></h4><h4 id="tcp-把数据完整地送达应用程序" tabindex="-1">TCP：把数据完整地送达应用程序 <a class="header-anchor" href="#tcp-把数据完整地送达应用程序" aria-label="Permalink to &quot;TCP：把数据完整地送达应用程序&quot;">​</a></h4>',9),n=[s];function c(i,d,h,P,l,_){return t(),e("div",null,n)}const b=a(o,[["render",c]]);export{T as __pageData,b as default};
