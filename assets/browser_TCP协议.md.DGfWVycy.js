import{_ as A,C as d,c as p,o as s,a8 as a,b as t,j as c,w as n,a as o,G as i,a9 as l}from"./chunks/framework.B1-gFi6y.js";const _=JSON.parse('{"title":"详解 TCP 协议 (Transmission Control Protocol) 🌐","description":"","frontmatter":{},"headers":[],"relativePath":"browser/TCP协议.md","filePath":"browser/TCP协议.md","lastUpdated":1743496729000}'),g={name:"browser/TCP协议.md"};function C(S,e,m,u,T,b){const r=d("Mermaid");return s(),p("div",null,[e[7]||(e[7]=a('<h1 id="详解-tcp-协议-transmission-control-protocol-🌐" tabindex="-1">详解 TCP 协议 (Transmission Control Protocol) 🌐 <a class="header-anchor" href="#详解-tcp-协议-transmission-control-protocol-🌐" aria-label="Permalink to &quot;详解 TCP 协议 (Transmission Control Protocol) 🌐&quot;">​</a></h1><p>在衡量 Web 页面性能的时候有一个重要的指标叫<code>“FP（First Paint）”</code>，是指从页面加载到首次开始绘制的时长。这个指标直接影响了用户的跳出率，更快的页面响应意味着更多的<code>PV</code>、更高的参与度，以及更高的转化率。那什么影响 FP 指标呢？其中一个重要的因素是网络加载速度。</p><p>要想优化 Web 页面的加载速度，你需要对网络有充分的了解。而理解网络的关键是要对网络协议有深刻的认识，不管你是使用 HTTP，还是使用 WebSocket，它们都是基于 TCP/IP 的，如果你对这些原理有足够了解，也就清楚如何去优化 Web 性能，或者能更轻松地定位 Web 问题了。此外，TCP/IP 的设计思想还有助于拓宽你的知识边界，从而在整体上提升你对项目的理解和解决问题的能力。</p><p>TCP (Transmission Control Protocol) 是互联网协议栈 (TCP/IP Suite) 中<strong>传输层 (Transport Layer)</strong> 的核心协议之一。它的主要目标是在不可靠的 IP 网络之上，为应用程序提供<strong>可靠的、面向连接的、基于字节流</strong>的通信服务。</p><p>想象一下，您在网上购物提交订单信息，或者下载一个大文件。您希望所有信息都完整无误、按顺序到达，TCP 就是保证这一点的关键协议。</p><p>下面我们分解 TCP 的关键机制：</p><hr><h2 id="_1-面向连接-connection-oriented-🤝" tabindex="-1">1. 面向连接 (Connection-Oriented) 🤝 <a class="header-anchor" href="#_1-面向连接-connection-oriented-🤝" aria-label="Permalink to &quot;1. 面向连接 (Connection-Oriented) 🤝&quot;">​</a></h2><p>在实际数据传输之前，TCP 需要在通信双方（客户端和服务器）之间建立一个<strong>逻辑连接</strong>。这个过程被称为<strong>三次握手 (Three-Way Handshake)</strong>。</p><ul><li><strong>🎯 目的:</strong><ul><li>确认双方都有发送和接收数据的能力。</li><li>同步双方的初始序列号 (Initial Sequence Numbers, ISN)，这对后续的数据排序和确认至关重要。</li><li>交换一些连接参数，如最大报文段长度 (Maximum Segment Size, MSS)。</li></ul></li><li><strong>🔄 过程:</strong><ol><li><strong>SYN (Synchronize):</strong> 客户端选择一个初始序列号 <code>client_isn</code>，并向服务器发送一个 TCP 报文段 (Segment)，其中 <code>SYN</code> 标志位被设为 1，序列号字段 (Sequence Number) 为 <code>client_isn</code>。客户端状态变为 <code>SYN_SENT</code>。</li><li><strong>SYN-ACK (Synchronize-Acknowledgement):</strong> 服务器收到 <code>SYN</code> 后，如果同意建立连接，会回复一个报文段。这个报文段的 <code>SYN</code> 标志位和 <code>ACK</code> (Acknowledgement) 标志位都设为 1。序列号字段是服务器选择的初始序列号 <code>server_isn</code>，确认号字段 (Acknowledgement Number) 是 <code>client_isn + 1</code> (表示期望收到客户端的下一个字节序号)。服务器状态变为 <code>SYN_RCVD</code>。</li><li><strong>ACK (Acknowledgement):</strong> 客户端收到服务器的 <code>SYN-ACK</code> 后，发送一个确认报文段。该报文段 <code>ACK</code> 标志位设为 1，序列号是 <code>client_isn + 1</code>，确认号是 <code>server_isn + 1</code>。客户端状态变为 <code>ESTABLISHED</code>，服务器收到此 <code>ACK</code> 后也进入 <code>ESTABLISHED</code> 状态。</li></ol></li><li><strong>💡 实际应用:</strong> 当您在浏览器输入网址按回车，或者运行一个网络应用发起连接时，底层就会执行这个三次握手。如果握手失败（比如服务器不在线或端口未监听），您会收到连接错误。</li></ul>',10)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-76",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20Client%0A%20%20%20%20participant%20Server%0A%0A%20%20%20%20Client-%3E%3EServer%3A%20SYN%20(Seq%3Dclient_isn)%0A%20%20%20%20Note%20right%20of%20Server%3A%20Server%20enters%20SYN_RCVD%20state%0A%20%20%20%20Server-%3E%3EClient%3A%20SYN%2BACK%20(Seq%3Dserver_isn%2C%20Ack%3Dclient_isn%20%2B%201)%0A%20%20%20%20Note%20left%20of%20Client%3A%20Client%20enters%20ESTABLISHED%20state%0A%20%20%20%20Client-%3E%3EServer%3A%20ACK%20(Seq%3Dclient_isn%20%2B%201%2C%20Ack%3Dserver_isn%20%2B%201)%0A%20%20%20%20Note%20right%20of%20Server%3A%20Server%20enters%20ESTABLISHED%20state%0A"})]),fallback:n(()=>e[0]||(e[0]=[o(" Loading... ")])),_:1})),e[8]||(e[8]=a(`<hr><h2 id="_2-数据分段与封装-segmentation-📦" tabindex="-1">2. 数据分段与封装 (Segmentation) 📦 <a class="header-anchor" href="#_2-数据分段与封装-segmentation-📦" aria-label="Permalink to &quot;2. 数据分段与封装 (Segmentation) 📦&quot;">​</a></h2><p>应用程序（如 HTTP, FTP）产生的数据通常很大，而底层网络（如以太网）对能够传输的数据包大小有限制（MTU - Maximum Transmission Unit）。TCP 负责将应用程序的<strong>字节流 (Byte Stream)</strong> 数据分割成适合在 IP 网络中传输的、大小合理的<strong>报文段 (Segment)</strong>。</p><ul><li><strong>⚙️ 过程:</strong><ul><li>TCP 从应用程序缓冲区读取数据流。</li><li>根据路径 MTU 协商出的 MSS (Maximum Segment Size，通常是 MTU 减去 IP 和 TCP 头部大小)，将数据切割成块。</li><li>为每个数据块添加 TCP 头部，形成 TCP 报文段。</li><li>将 TCP 报文段交给 IP 层，IP 层再添加 IP 头部形成 IP 数据报 (Datagram) 进行发送。</li></ul></li><li><strong>💡 实际应用:</strong> 下载一个 10MB 的文件时，应用程序将整个文件数据交给 TCP。TCP 不会一次性发送 10MB，而是将其切分成数千个小的 TCP 报文段（每个通常约 1400 多字节），然后逐个交给 IP 层发送。</li></ul><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>         │TCP层分段处理   │ → 根据MSS(最大段大小)分割大数据└───────────────────┘</span></span>
<span class="line"><span>                          ↙↘</span></span>
<span class="line"><span>         ┌───────────────────┐┌───────────────────┐</span></span>
<span class="line"><span>         │  数据块1 + TCP头部 │  │  数据块2 + TCP头部 │ → 添加序号、确认号、控制位等</span></span>
<span class="line"><span>         │   (TCP段1/1460B)│  │   (TCP段2/1460B)  │</span></span>
<span class="line"><span>         └───────────────────┘  └───────────────────┘↓↓</span></span>
<span class="line"><span>         ┌───────────────────┐┌───────────────────┐</span></span>
<span class="line"><span>         │  TCP段1 + IP头部  │  │  TCP段2 + IP头部│ → 添加源IP、目标IP等</span></span>
<span class="line"><span>         │    (IP数据报1)    │  │    (IP数据报2)    │</span></span>
<span class="line"><span>         └───────────────────┘└───────────────────┘↓↓</span></span>
<span class="line"><span>         ┌───────────────────────────────────────────┐</span></span>
<span class="line"><span>         │数据链路层处理 (以太网、WiFi等)        │ → MTU约1500字节限制</span></span>
<span class="line"><span>         └───────────────────────────────────────────┘ ↓↓</span></span>
<span class="line"><span>         ┌───────────────────┐┌───────────────────┐</span></span>
<span class="line"><span>         │帧头+IP数据报1+帧尾│  │帧头+IP数据报2+帧尾│ → 添加MAC地址、校验和等</span></span>
<span class="line"><span>         │     (帧1)        │  │(帧2)        │</span></span>
<span class="line"><span>         └───────────────────┘  └───────────────────┘</span></span>
<span class="line"><span>                 ↓                       ↓┌───────────────────────────────────────────┐</span></span>
<span class="line"><span>         │              物理网络传输                 │ →电信号、光信号或无线电波</span></span>
<span class="line"><span>         └───────────────────────────────────────────┘</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><hr><h2 id="_3-序列号与确认号-sequencing-and-acknowledgement-✅-可靠性的基石" tabindex="-1">3. 序列号与确认号 (Sequencing and Acknowledgement) ✅ - 可靠性的基石 <a class="header-anchor" href="#_3-序列号与确认号-sequencing-and-acknowledgement-✅-可靠性的基石" aria-label="Permalink to &quot;3. 序列号与确认号 (Sequencing and Acknowledgement) ✅ - 可靠性的基石&quot;">​</a></h2><p>TCP 提供可靠传输的核心机制依赖于序列号和确认号。</p><ul><li><strong>🔢 序列号 (Sequence Number):</strong><ul><li>TCP 将发送的数据看作一个连续的字节流。在建立连接时，双方会各自选择一个初始序列号 (ISN)。</li><li>每个 TCP 报文段头部中的<strong>序列号</strong>字段，指的是该报文段所携带的<strong>数据部分的第一个字节</strong>在整个字节流中的编号。</li><li><strong>作用:</strong><ul><li>接收方可以根据序列号对乱序到达的报文段进行<strong>重新排序</strong>。</li><li>接收方可以检测到丢失的报文段（序号不连续）。</li><li>用于处理重复的报文段（序列号相同）。</li></ul></li></ul></li><li><strong>👍 确认号 (Acknowledgement Number, ACK Number):</strong><ul><li>当接收方成功收到数据后，会向发送方发送一个确认 (ACK) 报文段（<code>ACK</code> 标志位设为 1）。</li><li>头部中的<strong>确认号</strong>字段的值表示<strong>期望收到的下一个字节的序列号</strong>。这隐含地确认了该序号之前的所有字节都已经成功接收。这被称为<strong>累积确认 (Cumulative ACK)</strong>。</li><li><strong>作用:</strong> 告知发送方哪些数据已经安全到达，发送方可以据此清理其发送缓冲区中的已确认数据。</li></ul></li><li><strong>💡 实际应用:</strong> 您发送一条长消息 &quot;Hello, World!&quot;。TCP 可能将其分成两个段：Segment 1 (Seq=1000) 含 &quot;Hello, &quot;，Segment 2 (Seq=1007) 含 &quot;World!&quot;。接收方收到 Segment 1 后，可能回复一个 ACK 段，Ack Number=1007 (表示 1000 到 1006 都收到了，期待 1007)。收到 Segment 2 后，回复 ACK 段，Ack Number=1013 (表示 1007 到 1012 都收到了，期待 1013)。如果 Segment 1 丢失，接收方只会收到 Segment 2，它会持续发送 Ack Number=1000 的 ACK，提示发送方 Segment 1 (从 1000 开始的数据) 还没到。</li></ul>`,9)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-194",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20Sender%0A%20%20%20%20participant%20Receiver%0A%0A%20%20%20%20Note%20over%20Sender%2CReceiver%3A%20Sending%20%22Hello%2C%20World!%22%20(Seq%20starts%20at%201000)%0A%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%201%20(Seq%3D1000%2C%20Data%3D%22Hello%2C%20%22)%0A%20%20%20%20Note%20over%20Receiver%3A%20Segment%201%20received%20correctly.%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D1007)%20%20%2F%2F%20Confirms%20bytes%20up%20to%201006%2C%20expects%201007%20next.%0A%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%202%20(Seq%3D1007%2C%20Data%3D%22World!%22)%0A%20%20%20%20Note%20over%20Receiver%3A%20Segment%202%20received%20correctly.%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D1013)%20%20%2F%2F%20Confirms%20bytes%20up%20to%201012%2C%20expects%201013%20next.%0A"})]),fallback:n(()=>e[1]||(e[1]=[o(" Loading... ")])),_:1})),e[9]||(e[9]=a('<hr><h2 id="_4-超时重传-timeout-retransmission-⏱️-可靠性的保障" tabindex="-1">4. 超时重传 (Timeout Retransmission) ⏱️ - 可靠性的保障 <a class="header-anchor" href="#_4-超时重传-timeout-retransmission-⏱️-可靠性的保障" aria-label="Permalink to &quot;4. 超时重传 (Timeout Retransmission) ⏱️ - 可靠性的保障&quot;">​</a></h2><p>IP 网络本身是不可靠的，数据报可能会丢失、损坏或延迟。TCP 通过超时重传机制来处理数据丢失。</p><ul><li><strong>🔄 过程:</strong><ol><li>发送方每发送一个报文段，就启动一个<strong>重传计时器 (Retransmission Timer)</strong>。</li><li>如果在计时器超时之前收到了对该报文段的确认 (ACK)，则取消计时器。</li><li>如果在计时器超时后仍未收到确认，发送方就<strong>假定</strong>该报文段（或其 ACK）在网络中丢失了。</li><li>发送方<strong>重新发送</strong>该报文段，并设置一个新的、通常更长的超时时间（<strong>指数退避 - Exponential Backoff</strong>）。</li></ol></li><li><strong>⏳ 超时时间计算 (RTO - Retransmission Timeout):</strong> RTO 的设置至关重要。太短会导致不必要的重传，浪费带宽；太长会使连接在丢包时响应缓慢。TCP 动态地估算 RTO，它基于对<strong>往返时间 (Round-Trip Time, RTT)</strong> 的测量及其变化（抖动）。常用算法如 Jacobson/Karels 算法，考虑了 RTT 的平滑平均值 (SRTT) 和 RTT 的方差 (RTTVAR)。</li><li><strong>💡 实际应用:</strong> 网络暂时拥堵导致您发送的一个数据段丢失。发送方等待了一小段时间（RTO）后没收到 ACK，就会重新发送这个数据段。如果网络持续不好，RTO 会逐渐变长，避免频繁重传加剧拥塞。</li></ul>',4)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-241",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20Sender%0A%20%20%20%20participant%20Receiver%0A%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%20(Seq%3DN%2C%20Data%3D...)%0A%20%20%20%20activate%20Sender%0A%20%20%20%20Note%20right%20of%20Sender%3A%20Start%20Retransmission%20Timer%20(RTO)%20for%20Seq%3DN%0A%20%20%20%20deactivate%20Sender%0A%0A%20%20%20%20Note%20over%20Sender%2CReceiver%3A%20Segment%20(Seq%3DN)%20or%20its%20ACK%20is%20lost...%0A%0A%20%20%20%20loop%20Wait%20for%20RTO%0A%20%20%20%20%20%20%20%20critical%20Timer%20Expires%0A%20%20%20%20%20%20%20%20%20%20%20%20Note%20right%20of%20Sender%3A%20RTO%20timer%20for%20Seq%3DN%20expired!%0A%20%20%20%20%20%20%20%20%20%20%20%20Sender-%3E%3EReceiver%3A%20**Retransmit**%20Segment%20(Seq%3DN%2C%20Data%3D...)%0A%20%20%20%20%20%20%20%20%20%20%20%20activate%20Sender%0A%20%20%20%20%20%20%20%20%20%20%20%20Note%20right%20of%20Sender%3A%20Restart%20Timer%20(RTO%2C%20likely%20longer)%20for%20Seq%3DN%0A%20%20%20%20%20%20%20%20%20%20%20%20deactivate%20Sender%0A%20%20%20%20%20%20%20%20end%0A%20%20%20%20end%0A%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3DN%20%2B%20length)%20%2F%2F%20Assuming%20retransmitted%20segment%20arrives%0A%20%20%20%20activate%20Sender%0A%20%20%20%20Note%20right%20of%20Sender%3A%20Received%20ACK%20for%20Seq%3DN.%20Cancel%20Timer.%0A%20%20%20%20deactivate%20Sender%0A%0A"})]),fallback:n(()=>e[2]||(e[2]=[o(" Loading... ")])),_:1})),e[10]||(e[10]=a('<hr><h2 id="_5-快速重传-fast-retransmit-🚀-可靠性的优化" tabindex="-1">5. 快速重传 (Fast Retransmit) 🚀 - 可靠性的优化 <a class="header-anchor" href="#_5-快速重传-fast-retransmit-🚀-可靠性的优化" aria-label="Permalink to &quot;5. 快速重传 (Fast Retransmit) 🚀 - 可靠性的优化&quot;">​</a></h2><p>超时重传机制在等待 RTO 时可能比较慢。快速重传是一种更快的丢包检测和恢复机制。</p><ul><li><strong>🔄 过程:</strong><ol><li>当发送方收到<strong>三个或以上</strong>的<strong>重复确认 (Duplicate ACKs)</strong> 时，即连续收到多个 ACK 号相同的确认报文段。</li><li>这通常意味着，接收方收到了该 ACK 号之后的一些乱序报文段，但 ACK 号指示的那个报文段尚未到达。</li><li>发送方不等 RTO 超时，<strong>立即重传</strong>那个被认为丢失的报文段 (ACK 号指示的那个段)。</li></ol></li><li><strong>💡 实际应用:</strong> 发送方连续发送了 Segment 1, 2, 3, 4, 5。如果 Segment 2 丢失，但 3, 4, 5 都到达了。接收方收到 1 后发 Ack=Seq(2)；收到 3 时，发现 2 没到，继续发 Ack=Seq(2) (重复 ACK 1)；收到 4 时，发现 2 没到，继续发 Ack=Seq(2) (重复 ACK 2)；收到 5 时，发现 2 没到，继续发 Ack=Seq(2) (重复 ACK 3)。当发送方收到第 3 个 Ack=Seq(2) 的重复 ACK 时，不等计时器到期，立刻重传 Segment 2。</li></ul>',4)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-278",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20Sender%0A%20%20%20%20participant%20Receiver%0A%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%201%20(Seq%3D100)%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%202%20(Seq%3D200)%20--%20Lost%20X%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%203%20(Seq%3D300)%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Segment%204%20(Seq%3D400)%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Receives%20Segment%201%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D200)%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Receives%20Segment%203%20(out%20of%20order)%0A%20%20%20%20Receiver-%3E%3ESender%3A%20**Duplicate%20ACK**%20(Ack%3D200)%20%2F%2F%20Still%20needs%20Seq%3D200%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Receives%20Segment%204%20(out%20of%20order)%0A%20%20%20%20Receiver-%3E%3ESender%3A%20**Duplicate%20ACK**%20(Ack%3D200)%20%2F%2F%20Still%20needs%20Seq%3D200%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Receives%20another%20segment%20(e.g.%205)%20or%20internal%20event%0A%20%20%20%20Receiver-%3E%3ESender%3A%20**Duplicate%20ACK**%20(Ack%3D200)%20%2F%2F%203rd%20Duplicate%20ACK!%0A%0A%20%20%20%20Note%20over%20Sender%3A%20Receives%203rd%20Duplicate%20ACK%20for%20200%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20**Fast%20Retransmit**%20Segment%202%20(Seq%3D200)%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Receives%20missing%20Segment%202%2C%20buffers%203%20%26%204%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D500)%20%2F%2F%20Cumulative%20ACK%20for%20Segments%201%2C%202%2C%203%2C%204%0A"})]),fallback:n(()=>e[3]||(e[3]=[o(" Loading... ")])),_:1})),e[11]||(e[11]=a('<hr><h2 id="_6-流量控制-flow-control-🚰-防止淹没接收方" tabindex="-1">6. 流量控制 (Flow Control) 🚰 - 防止淹没接收方 <a class="header-anchor" href="#_6-流量控制-flow-control-🚰-防止淹没接收方" aria-label="Permalink to &quot;6. 流量控制 (Flow Control) 🚰 - 防止淹没接收方&quot;">​</a></h2><p>发送方的数据发送速率可能远超接收方的处理速率，导致接收方缓冲区溢出而丢弃数据。流量控制机制确保发送方不会发送超过接收方处理能力的数据量。</p><ul><li><strong>🔧 机制:</strong> <strong>滑动窗口 (Sliding Window)</strong><ul><li>接收方在 TCP 头部中使用<strong>窗口大小 (Window Size)</strong> 字段，告知发送方自己当前还有多少可用的<strong>接收缓冲区空间</strong> (Receive Window, <code>rwnd</code>)。</li><li>发送方维护一个<strong>发送窗口</strong>，其大小不能超过接收方通告的 <code>rwnd</code>。发送窗口定义了发送方可以发送但尚未收到确认的数据量上限。</li><li>当接收方处理完数据，缓冲区释放空间后，它会在后续的 ACK 报文段中通告一个更大的 <code>rwnd</code>，允许发送方发送更多数据。窗口随数据的发送和确认而“滑动”。</li></ul></li><li><strong>⚠️ 零窗口问题:</strong> 如果接收方通告 <code>rwnd=0</code>，发送方会停止发送数据（除了特殊的“窗口探测”报文）。发送方会周期性发送小的探测报文，以查询接收方的窗口是否已经重新打开。</li><li><strong>💡 实际应用:</strong> 您在用一个老旧电脑下载大文件，您的电脑处理数据的速度（如写入磁盘）跟不上网络下载速度。TCP 的流量控制会让服务器（发送方）根据您的电脑（接收方）通告的窗口大小放慢发送速度，避免您的电脑因缓冲区满而丢弃数据，从而减少不必要的重传。</li></ul>',4)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-320",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20Sender%0A%20%20%20%20participant%20Receiver%0A%0A%20%20%20%20Note%20over%20Sender%2CReceiver%3A%20Initial%20Receiver%20Window%20(rwnd)%20%3D%203000%20bytes%0A%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Data%20(1000%20bytes%2C%20Seq%3D1)%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Data%20(1000%20bytes%2C%20Seq%3D1001)%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Data%20(1000%20bytes%2C%20Seq%3D2001)%0A%20%20%20%20Note%20left%20of%20Sender%3A%20Sent%203000%20bytes.%20Reached%20Receiver's%20advertised%20window.%20Stop%20sending.%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Processes%20first%201000%20bytes%20(1-1000).%20Buffer%20space%20increases.%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D1001%2C%20Window%3D2000)%20%2F%2F%20Confirms%20data%2C%20Updates%20window%20size%0A%0A%20%20%20%20Note%20left%20of%20Sender%3A%20Received%20ACK%3D1001.%20Effective%20Window%20%3D%201001%20%2B%202000%20%3D%203001.%20Highest%20byte%20sent%20%3D%203000.%20Still%20cannot%20send%20more.%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Processes%20next%201000%20bytes%20(1001-2000).%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D2001%2C%20Window%3D2000)%0A%0A%20%20%20%20Note%20left%20of%20Sender%3A%20Received%20ACK%3D2001.%20Effective%20Window%20%3D%202001%20%2B%202000%20%3D%204001.%20Highest%20byte%20sent%20%3D%203000.%20Can%20send%201001%20bytes.%0A%20%20%20%20Sender-%3E%3EReceiver%3A%20Data%20(1000%20bytes%2C%20Seq%3D3001)%20%2F%2F%20Sends%20more%20data%20as%20window%20allows%0A%0A%20%20%20%20Note%20over%20Receiver%3A%20Processes%20next%201000%20bytes%20(2001-3000).%20More%20buffer%20frees%20up.%0A%20%20%20%20Receiver-%3E%3ESender%3A%20ACK%20(Ack%3D3001%2C%20Window%3D3000)%20%2F%2F%20Window%20opens%20up%20further%0A%0A"})]),fallback:n(()=>e[4]||(e[4]=[o(" Loading... ")])),_:1})),e[12]||(e[12]=a('<hr><h2 id="_7-拥塞控制-congestion-control-🚦-防止淹没网络" tabindex="-1">7. 拥塞控制 (Congestion Control) 🚦 - 防止淹没网络 <a class="header-anchor" href="#_7-拥塞控制-congestion-control-🚦-防止淹没网络" aria-label="Permalink to &quot;7. 拥塞控制 (Congestion Control) 🚦 - 防止淹没网络&quot;">​</a></h2><p>流量控制关心的是点对点的速率匹配，而拥塞控制关心的是整个<strong>网络</strong>的承载能力。当过多数据注入网络，超出路由器处理能力或链路容量时，就会发生<strong>网络拥塞</strong>，导致大量丢包和延迟增加。TCP 的拥塞控制旨在避免这种情况，并适应网络当前的拥塞状况。</p><ul><li><strong>🔧 机制:</strong> TCP 通过维护一个<strong>拥塞窗口 (Congestion Window, <code>cwnd</code>)</strong> 来实现拥塞控制。<code>cwnd</code> 是一个发送方内部的状态变量，代表了根据网络拥塞程度估计出的、可以向网络发送的数据量。</li><li><strong>实际发送窗口:</strong> 发送方实际能发送的未确认数据量是 <code>min(cwnd, rwnd)</code>。</li><li><strong>拥塞控制算法 (以经典的 TCP Reno 为例):</strong><ol><li><strong>慢启动 (Slow Start):</strong> 连接建立初期或检测到严重拥塞（超时）后，<code>cwnd</code> 通常设为 1 个 MSS。每收到一个 ACK，<code>cwnd</code> 增加 1 个 MSS（指数增长，<code>cwnd</code> 大约每 RTT 翻倍）。目标是快速找到网络的可用带宽。</li><li><strong>拥塞避免 (Congestion Avoidance):</strong> 当 <code>cwnd</code> 达到一个<strong>慢启动阈值 (Slow Start Threshold, <code>ssthresh</code>)</strong> 后，增长方式变为线性（加性增、AIMD 的 A 部分）。每经过一个 RTT（收到对一个窗口数据的确认），<code>cwnd</code> 增加 1 个 MSS。目标是温和地探测更多带宽，避免过快导致拥塞。</li><li><strong>拥塞检测:</strong> TCP 主要通过两种方式推断网络拥塞： <ul><li><strong>RTO 超时:</strong> 表明可能发生了较严重的拥塞。</li><li><strong>收到 3 个重复 ACK:</strong> 表明可能发生了轻微拥塞（个别丢包）。</li></ul></li><li><strong>拥塞处理:</strong><ul><li><strong>检测到超时:</strong> 将 <code>ssthresh</code> 设为当前 <code>cwnd</code> 的一半，并将 <code>cwnd</code> 重置为 1 MSS，重新进入<strong>慢启动</strong>阶段。这是非常激烈的反应。</li><li><strong>检测到 3 个重复 ACK (触发快速重传):</strong> 执行<strong>快速恢复 (Fast Recovery)</strong> 算法。将 <code>ssthresh</code> 设为当前 <code>cwnd</code> 的一半，并将 <code>cwnd</code> 也减半（乘性减、AIMD 的 MD 部分）。然后，不是进入慢启动，而是直接进入<strong>拥塞避免</strong>（或是在 Fast Recovery 阶段临时增加 cwnd 以便发送新数据，直到收到丢失段的 ACK 后再真正进入拥塞避免）。这种反应相对温和。</li></ul></li></ol></li><li><strong>✨ 现代拥塞控制算法:</strong> TCP Reno 只是基础。现代操作系统使用更高级的算法，如 CUBIC (Linux 默认), BBR (Google 开发) 等，它们在高速、高延迟（长肥）网络等场景下表现更好。</li><li><strong>💡 实际应用:</strong> 您开始下载文件时，下载速度可能很快（慢启动）。当网络接近饱和或出现丢包时，速度会降下来（进入拥塞避免或因拥塞处理而降低 <code>cwnd</code>），然后逐渐尝试恢复。这就是您在下载时看到速度波动的原因之一，TCP 在不断地调整发送速率以适应网络状况。</li></ul>',4)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-401",class:"mermaid",graph:"flowchart%20TD%0A%20%20%20%20Start(%5B%E8%BF%9E%E6%8E%A5%E5%BC%80%E5%A7%8B%5D)%20--%3E%20SS%0A%20%20%20%20%0A%20%20%20%20SS%5B%22%E6%85%A2%E5%90%AF%E5%8A%A8%20(Slow%20Start)%3Cbr%3Ecwnd%20%3D%201MSS%3Cbr%3E%E6%8C%87%E6%95%B0%E5%A2%9E%E9%95%BF%3A%20%E6%AF%8FACK%2C%20cwnd%20%2B%3D%201MSS%22%5D%20--%3E%7C%22cwnd%E2%89%A5%20ssthresh%22%7C%20CA%0A%20%20%20%20SS%20--%3E%7C%22%E8%B6%85%E6%97%B6%22%7C%20TO%0A%20%20%20%20SS%20--%3E%7C%223%E4%B8%AA%E9%87%8D%E5%A4%8DACK%22%7C%20FR%0A%20%20%20%20%0A%20%20%20%20CA%5B%22%E6%8B%A5%E5%A1%9E%E9%81%BF%E5%85%8D%20(Congestion%20Avoidance)%3Cbr%3E%E7%BA%BF%E6%80%A7%E5%A2%9E%E9%95%BF%3A%20%E6%AF%8FRTT%2C%20cwnd%20%2B%3D%201MSS%22%5D%20--%3E%7C%22%E8%B6%85%E6%97%B6%22%7C%20TO%0A%20%20%20%20CA%20--%3E%7C%223%E4%B8%AA%E9%87%8D%E5%A4%8DACK%22%7C%20FR%0A%20%20%20%20%0A%20%20%20%20TO%5B%22%E8%B6%85%E6%97%B6%E5%A4%84%E7%90%86%3Cbr%3Essthresh%20%3D%20cwnd%2F2%3Cbr%3Ecwnd%20%3D1MSS%22%5D%20--%3E%20SSFR%5B%22%E5%BF%AB%E9%80%9F%E6%81%A2%E5%A4%8D(Fast%20Recovery)%3Cbr%3Essthresh%20%3D%20cwnd%2F2%3Cbr%3Ecwnd%20%3D%20cwnd%2F2%22%5D%20--%3E%20CA%0A%20%20%20%20%0A%20%20%20%20classDef%20default%20fill%3A%23f9f9f9%2Cstroke%3A%23333%2Cstroke-width%3A1px%0A%20%20%20%20classDef%20state%20fill%3A%23b5e48c%2Cstroke%3A%23333%0A%20%20%20%20classDef%20event%20fill%3A%23f8ad9d%2Cstroke%3A%23333%0A%20%20%20%20%0A%20%20%20%20class%20SS%2CCA%20state%0A%20%20%20%20class%20TO%2CFR%20event%0A%0A"})]),fallback:n(()=>e[5]||(e[5]=[o(" Loading... ")])),_:1})),e[13]||(e[13]=a(`<div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cwnd</span></span>
<span class="line"><span>  ^</span></span>
<span class="line"><span>  |   /\\                </span></span>
<span class="line"><span>  |/  \\               /\\</span></span>
<span class="line"><span>  |                 /    \\             /\\</span></span>
<span class="line"><span>  |                /      \\           /    \\</span></span>
<span class="line"><span>  |               /\\         /      \\___</span></span>
<span class="line"><span>  |              /\\_______/</span></span>
<span class="line"><span>  |             /</span></span>
<span class="line"><span>  |            /</span></span>
<span class="line"><span>  |           /</span></span>
<span class="line"><span>  |         _/</span></span>
<span class="line"><span>  |       _/</span></span>
<span class="line"><span>  |     _/</span></span>
<span class="line"><span>  |   _/</span></span>
<span class="line"><span>  | _/</span></span>
<span class="line"><span>  +-----------------------------------------&gt; 时间|    |       ||      |      |慢启动 拥塞避免  3DUP拥塞避免   超时    慢启动</span></span>
<span class="line"><span>                  ACK</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><hr><h2 id="_8-可靠性总结-✅" tabindex="-1">8. 可靠性总结 ✅ <a class="header-anchor" href="#_8-可靠性总结-✅" aria-label="Permalink to &quot;8. 可靠性总结 ✅&quot;">​</a></h2><p>TCP 通过以下机制协同工作，提供可靠的数据传输：</p><ul><li><strong>数据分段与排序:</strong> 使用序列号确保数据按正确顺序组装。</li><li><strong>确认机制:</strong> ACK 告知发送方数据已收到。</li><li><strong>超时重传:</strong> 处理数据段或 ACK 的丢失。</li><li><strong>快速重传:</strong> 更快地处理个别数据段丢失。</li><li><strong>校验和 (Checksum):</strong> TCP 和 IP 头部都有校验和字段，用于检测数据在传输过程中是否发生比特错误（损坏）。如果校验和不匹配，该报文段会被丢弃（然后可能触发重传）。</li><li><strong>流量控制:</strong> 防止接收方被淹没。</li><li><strong>拥塞控制:</strong> 防止网络被淹没。</li></ul><hr><h2 id="_9-连接终止-connection-termination-👋" tabindex="-1">9. 连接终止 (Connection Termination) 👋 <a class="header-anchor" href="#_9-连接终止-connection-termination-👋" aria-label="Permalink to &quot;9. 连接终止 (Connection Termination) 👋&quot;">​</a></h2><p>当数据传输完成，需要关闭连接时，TCP 使用<strong>四次挥手 (Four-Way Handshake)</strong>。</p><ul><li><strong>🔄 过程:</strong> (假设 A 发起关闭) <ol><li><strong>FIN (Finish):</strong> A 发送一个 <code>FIN</code> 报文段，表示 A 没有更多数据要发送了。A 进入 <code>FIN_WAIT_1</code> 状态。</li><li><strong>ACK:</strong> B 收到 <code>FIN</code> 后，发送一个 <code>ACK</code> 报文段确认收到 A 的 <code>FIN</code>。B 进入 <code>CLOSE_WAIT</code> 状态。A 收到 ACK 后进入 <code>FIN_WAIT_2</code> 状态。此时，连接处于<strong>半关闭 (Half-Close)</strong> 状态，A 不能再发送数据，但 B 可能还有数据要发送给 A。</li><li><strong>FIN:</strong> 当 B 也没有数据要发送时，B 发送一个 <code>FIN</code> 报文段给 A。B 进入 <code>LAST_ACK</code> 状态。</li><li><strong>ACK:</strong> A 收到 B 的 <code>FIN</code> 后，发送一个 <code>ACK</code> 确认。A 进入 <code>TIME_WAIT</code> 状态。B 收到这个 <code>ACK</code> 后，关闭连接，进入 <code>CLOSED</code> 状态。</li></ol></li><li><strong>⏳ TIME_WAIT 状态:</strong> A 在发送最后一个 <code>ACK</code> 后，会等待一段时间（通常是 2*MSL，Maximum Segment Lifetime，报文段最大生存时间），然后才进入 <code>CLOSED</code> 状态。目的是确保最后一个 <code>ACK</code> 能到达 B（如果 <code>ACK</code> 丢失，B 会重发 <code>FIN</code>，A 必须能响应），并防止本次连接中延迟的报文段干扰到后续可能使用相同端口号的新连接。</li></ul>`,9)),(s(),t(l,null,{default:n(()=>[i(r,{id:"mermaid-488",class:"mermaid",graph:"sequenceDiagram%0A%20%20%20%20participant%20A%20(Initiator)%0A%20%20%20%20participant%20B%0A%0A%20%20%20%20Note%20over%20A%2CB%3A%20Data%20transfer%20is%20complete.%20A%20initiates%20close.%0A%0A%20%20%20%20A-%3E%3EB%3A%20FIN%20(Seq%3Du)%0A%20%20%20%20Note%20left%20of%20A%3A%20A%20enters%20FIN_WAIT_1%0A%20%20%20%20Note%20right%20of%20B%3A%20B%20receives%20FIN%2C%20enters%20CLOSE_WAIT%0A%20%20%20%20B-%3E%3EA%3A%20ACK%20(Ack%3Du%2B1)%0A%20%20%20%20Note%20left%20of%20A%3A%20A%20receives%20ACK%2C%20enters%20FIN_WAIT_2%0A%0A%20%20%20%20Note%20over%20B%3A%20B%20finishes%20any%20remaining%20data%20transmission...%0A%20%20%20%20Note%20over%20B%3A%20B%20is%20ready%20to%20close.%0A%20%20%20%20B-%3E%3EA%3A%20FIN%20(Seq%3Dv)%0A%20%20%20%20Note%20right%20of%20B%3A%20B%20enters%20LAST_ACK%0A%20%20%20%20Note%20left%20of%20A%3A%20A%20receives%20FIN%2C%20enters%20TIME_WAIT%0A%20%20%20%20A-%3E%3EB%3A%20ACK%20(Ack%3Dv%2B1)%0A%20%20%20%20Note%20right%20of%20B%3A%20B%20receives%20ACK%2C%20enters%20CLOSED%0A%20%20%20%20Note%20left%20of%20A%3A%20A%20waits%20for%202*MSL%20in%20TIME_WAIT%20state%2C%20then%20enters%20CLOSED%0A%0A"})]),fallback:n(()=>e[6]||(e[6]=[o(" Loading... ")])),_:1})),e[14]||(e[14]=c("hr",null,null,-1)),e[15]||(e[15]=c("p",null,[c("strong",null,"总结:")],-1)),e[16]||(e[16]=c("p",null,"TCP 是一个复杂但极其重要的协议。它通过三次握手建立连接，使用序列号和确认号进行数据排序和确认，通过超时重传和快速重传处理丢包，利用滑动窗口进行流量控制，并通过慢启动、拥塞避免、快速恢复等机制进行拥塞控制，最后通过四次挥手断开连接。所有这些机制协同工作，使得应用程序开发者可以在不可靠的 IP 网络上构建可靠的应用，而不必亲自处理网络传输中的各种复杂问题。在实际应用中，TCP 的性能和行为（如速度波动、连接延迟）直接受到这些内部机制以及当前网络状况的影响。",-1))])}const v=A(g,[["render",C]]);export{_ as __pageData,v as default};
