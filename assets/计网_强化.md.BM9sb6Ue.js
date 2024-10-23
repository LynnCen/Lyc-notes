import{_ as p,c as l,o as t,aa as o}from"./chunks/framework.CAVwB9kQ.js";const d=JSON.parse('{"title":"强化","description":"","frontmatter":{},"headers":[],"relativePath":"计网/强化.md","filePath":"计网/强化.md","lastUpdated":1729583044000}'),i={name:"计网/强化.md"},a=o(`<h1 id="强化" tabindex="-1">强化 <a class="header-anchor" href="#强化" aria-label="Permalink to &quot;强化&quot;">​</a></h1><h2 id="第一章-计算机网络体系结构" tabindex="-1">第一章 计算机网络体系结构 <a class="header-anchor" href="#第一章-计算机网络体系结构" aria-label="Permalink to &quot;第一章 计算机网络体系结构&quot;">​</a></h2><ol><li><p>电路交换、报文交换和分组交换优缺点</p></li><li><p>报文交换和分组交换在存储转发中数据传输时间的计算</p></li></ol><p>传输时延 = 发送时延 + 传播时延 + 处理时延 + 排队时延</p><p>流水线传输时延 = k段链路的传输时间 + 前n-1个分组的发送时延 + 最后一个分组在k段链路中的发送时延 = k段链路的传播时延 + k个流水段 * 单个流水段时间r + （分组个数 - 1） * 单个流水段时间r = kd + kr + (m-1)*r</p><ol start="3"><li>性能指标</li></ol><p>速率的单位换算：kb/s k=10^3 -&gt; Mb/s M=10^6 -&gt; Gb/s G=10^9</p><p>存储容量：K=2^10 M=2^20 G=2^30</p><p>时间的换算：1s = 10^3ms = 10^6us = 10^9ns</p><p>带宽表示速率 表示最高数据传输速率 b/s</p><p>时延：发送时延、传播时延（信道长度/ 电磁波传播速率）、处理时延、 排队时延</p><p>时延带宽积 = 传输时延 x 信道带宽 表示发送了多少比特</p><p>往返时延RTT</p><p>信道利用率 = 有数据通过时间 / 总时间</p><ol start="4"><li>7层模型osi、tcpip4层模型和5层模型</li></ol><p>各层的功能、协议</p><p>osi:</p><p>物理层：定义物理接口协议，传输比特流</p><p>数据链路层：传输单位帧、封装成帧，可靠传输、差错控制、流量控制 SDLC、HDLC、PPP、STP和帧中继</p><p>网络层：传输单位数据报，路由选择、流量控制、拥塞控制、差错控制和网际互联 IP、IPX、ICMP、ARP、RARP、RIP、OSPF 提供无连接和面向连接</p><p>传输层：端到端通信，流量控制、差错控制、服务质量】数据传输管理 TCP、UDP 提供面向连接</p><p>会话层：建立同步，会话建立和管理</p><p>表示层：交换信息表示的方式</p><p>应用层：用户和网络的接口 FTP、HTTP、SMTP</p><p>tcp/ip</p><p>网络接口层（物理层和数据链路层）</p><p>网际层 支持无连接</p><p>传输层 无连接和面向连接</p><p>应用层</p><ol start="5"><li>协议（同步的定义）</li></ol><p>语法、语义、时序（同步）</p><ol start="6"><li>码元、（码元传输速率）波特率、（信息传输速率）比特率</li></ol><p>一个码元携带n比特的信息量 波特率为M 比特率为nB</p><p>四相位相移键控（QPSK）中，一个码元可以表示2个比特。</p><ol start="7"><li>奈奎斯特定理（无噪声，理想情况）和香农定理（有噪声）</li></ol><p>奈奎斯特定理：</p><p>极限码元传输速率为 2W（波特率） W为信道频率带宽 V表示码元的离散点平数</p><p>理想情况极限数据传输速率 = 2W log2V （b/s）</p><p>香农定理：</p><p>信道极限数据传输速率 = Wlog2(1 + S/N)</p><p>信噪比 = 10 log10(S/N)</p><p>最大速率需要对比是否为理想信道 算出奈式准则下的速率和香农速率 综合对比</p><ol start="8"><li>数字数据转为数字信号</li></ol><p>归零编码：高1 低0 （后半个码元都需要跳变为中间 作为同步时序）</p><p>非归零：高1 低0 不跳变</p><p>反向非归零：后一个为0跳变 为1不变</p><p>曼彻斯特：高低为1 低高为0 重点！！！</p><p>差分曼彻斯特：为1 延用前面信号后半个码元 为0 与前面信号后半个码元相反 重点！！！</p><ol start="9"><li>采用调幅调相是比特的位数 比特率和波特率的转换</li></ol><p>log2V B波特率 = Blog2V</p><ol start="10"><li>物理层的接口特性</li></ol><p>机械特性（接线器的形状等）、电气特性（电压的范围）、功能特性（电平电压的意义）、过程特性（事件出现的顺序）</p><ol start="11"><li>物理层传输介质</li></ol><p>双绞线</p><p>同轴电缆</p><p>光纤</p><p>无线传输</p><ol start="12"><li>物理层的设备</li></ol><p>中继器（数字信号）</p><p>放大器（模拟信号）</p><p>集线器（多端口中继器）</p><ol start="13"><li>数据链路层的功能</li></ol><p>封装成帧、透明传输、差错控制</p><ol start="14"><li>组帧</li></ol><p>字符计数</p><p>字符填充</p><p>零比特填充</p><ol start="15"><li>差错控制</li></ol><p>区分谁能检错或纠错</p><p>奇偶校验</p><p>CRC</p><p>海明吗</p><p>违规编码</p><ol start="16"><li>流量控制和可靠传输</li></ol><p>流量控制：</p><p>本质上是控制发送方的速率</p><p>区分发送窗口和接受窗口的大小</p><p>停止-等待</p><p>后退N帧</p><p>选择重传</p><p>可靠：</p><p>可靠传输依靠的是编号和对编号的确认</p><p>确认方式是逐个确认还是累计确认</p><p>停等协议（S-W）</p><p>连续ARQ协议：后退N帧协议、选择重传协议</p><p>后退N帧协议</p><p>选择重传协议</p><ol start="17"><li>信道利用率分析</li></ol><p>信道利用率的计算公式</p><p>各协议信道利用率的性能分析</p><ol start="18"><li><p>介质访问控制的作用</p></li><li><p>信道划分介质访问控制有哪些</p></li><li><p>码分复用中数据分离的计算</p></li></ol><p>不同向量内积为0 相互正交</p><ol start="21"><li>随机访问介质访问控制有哪些</li></ol><p>纯ALOHA协议</p><p>时隙ALOHA</p><p>CSMA协议：1坚持、非坚持、p坚持</p><p>CSMA/CD协议：</p><p>最短帧长的计算：</p><p>二进制指数退避算法：</p><p>CSMA/CA协议：帧间间隔有哪些？SIFS 、PIFS、DIFS</p><p>预约信道的方法：等待最长帧DIFS、发送RTS请求帧，目的站返回CTS并广播CTS，等待SIFS后，传送数据</p><ol start="22"><li><p>CSMA/CD与CSMA/CA的区别</p></li><li><p>以太网mac协议提供的服务类型</p></li></ol><p>有无连接以及是否可靠</p><p>使用曼彻斯特</p><ol start="24"><li><p>网络适配器和IO接口的关系</p></li><li><p>以太网MAC地址的长度、广播帧的格式和帧地址格式</p></li></ol><p>数据：46～1500</p><p>首部目的地址、源地址和类型包含14B</p><p>尾部FCS校验位4B，校验首部和数据，不校验前导码</p><p>以太网帧必须满足64B，不符合数据部分需要填充</p><ol start="26"><li>802.11局域网的MAC帧前三个地址的含义</li></ol><p>来自AP 去往AP的区别</p><pre><code>     地址1（接收地址）  地址2（发送地址）  地址3
</code></pre><p>来自AP 目的地址 AP地址 源地址 去往AP AP地址 源地址 目的地址</p><ol start="27"><li>数据链路层设备</li></ol><p>以太网交换机直通方式和存储转发方式时延的分析</p><p>直通方式时延很小，根据目的MAC地址直接转发</p><p>存储转发：需要缓存到高速缓存中，对数据进行校验在转发</p><p>交换机的自学习过程：</p><p>集线器和交换机连接网段的区别</p><p>交换机隔离冲突域，但不隔离广播域，集线器都不隔离</p><ol start="28"><li>冲突域和广播域</li></ol><p>冲突域是指在同一网段中，任何两个设备尝试同时发送数据可能会发生冲突</p><p>处理冲突的方案：CSMA/CD协议、全双工以太网、交换机和VLAN、令牌环</p><p>广播域：指在同一网络中，广播帧能够被接收的所有设备的范围。广播是一种数据包，目标是网络中的所有设备。</p><h2 id="第二章-网络层" tabindex="-1">第二章 网络层 <a class="header-anchor" href="#第二章-网络层" aria-label="Permalink to &quot;第二章 网络层&quot;">​</a></h2>`,125),r=[a];function s(e,n,P,c,S,_){return t(),l("div",null,r)}const C=p(i,[["render",s]]);export{d as __pageData,C as default};
