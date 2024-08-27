import{_ as p,c as t,o as a,aa as o}from"./chunks/framework.CAVwB9kQ.js";const _=JSON.parse('{"title":"第 1章 计算机网络体系结构","description":"","frontmatter":{},"headers":[],"relativePath":"计网/chapter1.md","filePath":"计网/chapter1.md","lastUpdated":1724747825000}'),l={name:"计网/chapter1.md"},r=o('<h1 id="第-1章-计算机网络体系结构" tabindex="-1">第 1章 计算机网络体系结构 <a class="header-anchor" href="#第-1章-计算机网络体系结构" aria-label="Permalink to &quot;第 1章 计算机网络体系结构&quot;">​</a></h1><h2 id="计算机网络概述" tabindex="-1">计算机网络概述 <a class="header-anchor" href="#计算机网络概述" aria-label="Permalink to &quot;计算机网络概述&quot;">​</a></h2><h3 id="计算机网络的概念" tabindex="-1">计算机网络的概念 <a class="header-anchor" href="#计算机网络的概念" aria-label="Permalink to &quot;计算机网络的概念&quot;">​</a></h3><p>计算机网络是一个将众多分散的、自治的计算机系统，通过通信设备与线路连接 起来，由功能完善的软件实现资源共享和信息传递的系统。</p><p>计算机网络 (简称网络)由若干结点(node，或译为节点)和连接这些结点的链路 (link) 组成。</p><h3 id="计算机网络的组成" tabindex="-1">计算机网络的组成 <a class="header-anchor" href="#计算机网络的组成" aria-label="Permalink to &quot;计算机网络的组成&quot;">​</a></h3><ol><li><strong>从组成部分看</strong></li></ol><p>计算机网络主要由硬件、软件、协议 三大部分组成。</p><ol start="2"><li><strong>从工作方式看</strong></li></ol><p>计算机网络(这里主要指Internet，即互联网)可分为边缘部分和核心部分。边缘部分由所有连接到互联网上的供用户直接使用的主机组成，用来进行通信(如传输数据、音频或视频)和资源共享;核心部分由大量网络和连接这些网络的路由器组成，它为边缘部分提供连通性和交换服务。</p><ol start="3"><li><strong>从功能组成看</strong></li></ol><p>计算机网络由通信子网（下三层）和资源子网（上三层）组成。</p><h3 id="计算机网络的功能" tabindex="-1">计算机网络的功能 <a class="header-anchor" href="#计算机网络的功能" aria-label="Permalink to &quot;计算机网络的功能&quot;">​</a></h3><ol><li><p>数据通信</p></li><li><p>資源共享</p></li><li><p>分布式处理</p></li><li><p>提高可靠性</p></li><li><p>负载均衡</p></li></ol><h3 id="电路交换、报文交换与分组交换" tabindex="-1">电路交换、报文交换与分组交换 <a class="header-anchor" href="#电路交换、报文交换与分组交换" aria-label="Permalink to &quot;电路交换、报文交换与分组交换&quot;">​</a></h3><ol><li><strong>电路交换</strong></li></ol><p>电路交换分为三步:连接建立、数据传输和连接释放。 在进行数据传输前，两个结点之间必须先建立 一条专用 (双方独占)的物理通信路径 (由通信双 方之间的交换设备和链路逐段连接而成)，该路径可能经过许多中间结点。</p><p>优点：</p><p>1️⃣ 通信时延小。因为通信线路为通信双方专用，数据直达，所以传输时延非常小。</p><p>2️⃣ 有序传输。双方通信时按发送顺序传送数据，不存在失序问题。</p><p>3️⃣ 没有冲 突。不同的通信双方拥有不同的信道，不会出现争用物理信道的问题。</p><p>4️⃣ 适用范围广。电路交换既适用于传输模拟信号，又适用于传输数字信号。</p><p>5️⃣ 实时性强。通信双方之间的物理通路 一旦建立，双方就可随时通信。</p><p>6️⃣ 控制简单。电路交换的交换设备 (交换机等)及控制均较简单。</p><p>缺点：</p><p>1️⃣ 建立连接时间长。电路交换的平均连接建立时间对计算机通信来说太长。</p><p>2️⃣ 线路利用率低。物理通路被通信双方独占，即使线路空闲，也不能供其他用户使用。</p><p>3️⃣ 灵活性差。物理通路中的任何 一点出现故障，就必须重新拨号建立新的连接。</p><p>4️⃣ 难以规格化。不同类型、不同规格、不同速率的终端很难相互进行通信。</p><p>5️⃣ 难以实现差错控制。中间结点不具备存储和检验数据的能力，无法发现并纠正错误。</p><ol start="2"><li><strong>报文交换</strong></li></ol><p>数据交换的单位是报文，用户数据加上源地址、目的地址等信息后，后封装成报文(message)。报文交换采用存储转发技术，整个报文先传送到相邻的结点，全部存储后查找转发表，转发到下一个结点</p><p>优点：</p><p>1️⃣ 无须建立连接。通信前无须建立连接，没有建立连接时延，用户可随时发送报文。</p><p>2️⃣ 动态分配线路。交换设备存储整个报文后，选择一条合适的空闲线路，转发报文。</p><p>3️⃣ 线路可靠性高。若某条传输路径发生故障，则可重新选择另 一条路径传输数据。</p><p>4️⃣ 线路利用率高。报 文在哪段链路 上传送时才占用这段链路的通信资源。</p><p>5️⃣ 提供多目标服务。一 个报文可以同时发送给多个目的地址。</p><p>缺点：</p><p>1️⃣ 转发时延高。 交换结点要将报 文整体接收完后，才能查找转发表转发到下 一个结点。</p><p>2️⃣ 缓存开销大。报文的大小没有限制，这就要求交换结点拥有较大的缓存空间。</p><p>3️⃣ 错误处理低效。报文较长时，发生错误的概率相对更大，重传整个报文的代价也很大。</p><ol start="3"><li><strong>分组交换</strong></li></ol><p>分组交换也采用存储转发技术，但解决了报文交换中报文过长的问题。</p><p>优点：</p><p>1️⃣ 无建立时延。通信前无须建立连接，没有建立连接时延，用户可随时发送分组。</p><p>2️⃣ 线路利用率高。分组在哪段链路 上传送时才占用这段链路 的通信资源。相比采用电路交 换传送突发式的计算机数据，分组交换的通信线路利用率大大提高。</p><p>3️⃣ 简化了存储管理(相对于报文交换)。因为分组的长度固定，相应缓冲区的大小也固定， 在交换结点中存储器的管理通常被简化为对缓冲区的管理，相对比较容易。</p><p>4️⃣ 加速传输。分组是逐个传输的，可以使后 一个分组的存储操作与前 一个分组的转发操作并 行，这种流水线方式减少了报文的传输时间。此外，传输一个分组比传输 一次报文所需的 缓冲 区小得多，这样，因缓冲区不足而等待发送的概率及时间必然也少得多。</p><p>5️⃣ 减小 了出错概率和重发数据量。因为分组较短，其出错概 率必然减小，所以每次重发的 数据量也就大大减少，这样不仅提高了可靠性，而且减小了传输时延。</p><p>缺点：</p><p>1️⃣ 存在存储转发时延。尽管分组交换比报文交换的传输时延小，但相对于电路交换仍存在存储转发时延，且其结点交换机必须具有更强的处理能力。</p><p>2️⃣ 需要传输额外的信 息量。每 个小数据段都要加 上控制信息以构成 分组，这使得传送的信 息量增大了5%~~10% ，进而使得控制复杂，降低了通信效率，增大了处理的时延。</p><p>3️⃣ 当分组交换网采用数据报服务时，可能出现失序、丢失或重复分组的情况，分组到达目 的结点时，要对分组按编号进行排序等工作，而这些工作很麻烦。若采用虚电路服务， 则虽然没有失序问题，但有呼叫建立、数据传输和虚电路释放 三个过程</p><p><strong>流水线分组传输：传输m个分组需要的时间t = 3r + (m-1) x r</strong></p><h3 id="计算机网络的分类" tabindex="-1">计算机网络的分类 <a class="header-anchor" href="#计算机网络的分类" aria-label="Permalink to &quot;计算机网络的分类&quot;">​</a></h3><ol><li><strong>按分布范围分类</strong></li></ol><p>广域城网(WAN)、城域网(MAN)、局域网(LAN)、个人区域网(PAN)</p><ol start="2"><li><strong>按传输技术分类</strong></li></ol><p>1️⃣ 广播式网络。局域网基本上都采用广播 式通信技术，广域网中的无线、卫星通信网络也采用广播式通信技术。</p><p>2️⃣ 点对点网络</p><ol start="3"><li><strong>按拓扑结构分类</strong></li></ol><p>星形、总线形和环形网络多用于局域网，网状网络多用于广域网</p><p>1️⃣ 总线形网络。用单根传输线把计算机连接起来。优点是建网容易、增/减结点方便、节省 线路。缺点是重负载时通信效率不高、总线任意一处对故障敏感。</p><p>2️⃣ 星形网络。每个终端或计算机都以单独的线路与中央设备相连。中央设备一般是交换机 或路由器。优点是便 于集中控制和管理。缺点是成本高、中央设备对故障敏感。</p><p>3️⃣ 环形网络。所有计算机接又设备连接成一个环。环形网络最典型的例 子是令牌环局域网。 环既可以是单环， 又可以是双环，环中信号是单向传输的。</p><p>4️⃣ 网状网络。一般情况下，每个结点至少有两条路径与其他结点相连，多用在广域网中。 其有规则型和非规则型两种。优点是可靠性高 。缺点是控制复杂、线路成本高。</p><ol start="4"><li><strong>按使用者分类</strong></li></ol><p>公用网(PublicNetwork)、专用网(Private Network)</p><ol start="5"><li><strong>按传输介质分</strong></li></ol><p>传输介质可分为有线和无线两大类，因此网络可分为有线网络和无线网络。</p><h3 id="计算机网络的性能指标" tabindex="-1">计算机网络的性能指标 <a class="header-anchor" href="#计算机网络的性能指标" aria-label="Permalink to &quot;计算机网络的性能指标&quot;">​</a></h3><p>1️⃣ 速率(Speed)。指连接到网络上的结点在数字信道上传送数据的速率，也称数据传输速率、数据传输率、数据率或比特率，单位为b/s(比特/秒)或bit/s(有时也写为bps)。当数据率较高时，可用kb/s(k=10^3)、Mb/s(M=10^6)或Gb/s(G=10^9)表示。</p><p>2️⃣ 带宽(Bandwidth)。带宽原本表示通信线路允许通过的信号频率范围，单位是赫兹(Hz)。但在计算机网络中，带宽表示网络的通信线路所能传送数据的能力，是数字信道所能传送的“最高数据传输速率”的同义语，单位是比特/秒(b/s)</p><p>3️⃣ 吞吐量(Throughput)。指单位时间内通过某个网络(或信道、接又)的实际数据量。吞吐量常用在对实际网络的测量中，受网络带宽的限制。</p><p>4️⃣ 时延(Delay)。指数据(一个报文或分组)从网络(或链路)的一端传送到另一端所需的总时间，它由4部分构成:发送时延、传播时延、处理时延和排队时延。</p><ul><li>发送时延，也称传输时延。结点将分组的所有比特推向链路所需的时间，即从发送 分组的第 一个比特算起，到该分组的最后一个比特发送完毕所需的时间。</li></ul><p><strong>发送时延=分组长度/发送速率</strong></p><ul><li>传播时延。电磁波在信道(传输介质)中传播一定的距离所花的时间，即一个比特 从链路的一端传播到另一端所需的时间。</li></ul><p><strong>传播时延= 信道长度/电磁波在信道上的传播速率</strong></p><ul><li><p>处理时延。数据在交换结点为存储转发而进行的一些必要处理所花的时间。例如， 分析分组的首部、从分组中提取数据、差错检验或查找合适的路由等。</p></li><li><p>排队时延。分组在进入路由器后要先在输入队列 中排队等待处理。路由器确定转发 端又后，还要在输出队列中排队等待转发。这就产生了排队时延。</p></li></ul><p><strong>总时延=发送时延+传播时延+处理时延+排队时延</strong></p><p>5️⃣ 时延带宽积。指发送端发送的第一个比特即将到达终点时，发送端已发出了多少比特， 又称以比特为单位的链路长度，即<strong>时延带宽积= 传播时延x信道带宽</strong>。</p><p>6️⃣ 往返时延(Round-TripTime, RTT)。指从发送端发出 一个短分组，到发送端收到来自接 收端的确认(接收端收到数据后立即发送确认)总共经历的时延。</p><p>7️⃣ 信道利用率。用以指出某个信道有百分之多少的时间是有数据通过的</p><p><strong>信道利用率= 有数据通过时间/(有+无)数据通过时间</strong></p>',86),e=[r];function i(s,n,h,d,c,g){return a(),t("div",null,e)}const b=p(l,[["render",i]]);export{_ as __pageData,b as default};
