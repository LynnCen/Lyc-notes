import{_ as a,c as i,o as n,a8 as p}from"./chunks/framework.B1-gFi6y.js";const t="/Lyc-notes/assets/2013-%E5%88%86%E7%BB%84.vSgfZNa6.png",e="/Lyc-notes/assets/2013_44.oanrW0Vs.png",E=JSON.parse('{"title":"2013","description":"","frontmatter":{},"headers":[],"relativePath":"408/2013.md","filePath":"408/2013.md","lastUpdated":1732777664000}'),l={name:"408/2013.md"};function h(r,s,o,d,k,c){return n(),i("div",null,s[0]||(s[0]=[p('<h1 id="_2013" tabindex="-1">2013 <a class="header-anchor" href="#_2013" aria-label="Permalink to &quot;2013&quot;">​</a></h1><h2 id="_1-合并两个升序链表为m-n的降序链表" tabindex="-1">1. 合并两个升序链表为m+n的降序链表 <a class="header-anchor" href="#_1-合并两个升序链表为m-n的降序链表" aria-label="Permalink to &quot;1. 合并两个升序链表为m+n的降序链表&quot;">​</a></h2><p>利用空间换时间：遍历链表<code>max{m,n}</code>，输出到一个空数组当中，再对该数组遍历，输出到新链表中。最大时间复杂度<code>max{m,n}</code></p><h2 id="_2-带权路径长度-️" tabindex="-1">2. 带权路径长度(‼️) <a class="header-anchor" href="#_2-带权路径长度-️" aria-label="Permalink to &quot;2. 带权路径长度(‼️)&quot;">​</a></h2><p>各结点权值x路径长度 求和 = 带权路径长度</p><p>带权路径长度最小即为哈夫曼树，每次从最小的权值开始构造</p><p>三叉树{2,3,4,5,6,7}构造哈夫曼树</p><p>（1）构造一个空结点0，分别与2，3相加的新结点权值 = 5 ，集合<code>{4,5,5,6,7}</code></p><p>（2）4,5,5构造新结点 = 14，集合<code>{6，7，14}</code></p><p>（3）6+7+14 = 27</p><p>故带权路径长度 = <code>(2+3)*3 + (4+5)*2 + (6+7)*1</code> = 46</p><h2 id="_3-关键路径缩短工期" tabindex="-1">3. <a href="/Lyc-notes/dataStructure/chapter6#关键路径">关键路径缩短工期</a> <a class="header-anchor" href="#_3-关键路径缩短工期" aria-label="Permalink to &quot;3. [关键路径缩短工期](/dataStructure/chapter6#关键路径)&quot;">​</a></h2><p>关键路径不唯一，故需要缩短所有关键路径上共有的活动才能减少关键路径上的工期</p><p>关键路径<code>{b、d、c、g}、{b、d、e、h}、{b、f、h}</code></p><p>只有缩短f、d才能缩短工程工期</p><h2 id="_4-b树和b-树结点数和根结点的区别" tabindex="-1">4. <a href="/Lyc-notes/dataStructure/chapter7#b-树的基本概念">B树和B+树结点数和根结点的区别</a> <a class="header-anchor" href="#_4-b树和b-树结点数和根结点的区别" aria-label="Permalink to &quot;4. [B树和B+树结点数和根结点的区别](/dataStructure/chapter7#b-树的基本概念)&quot;">​</a></h2><p>B树的根节点 <code>1~m-1</code>，非根节点<code>（m/2）向上取整-1 &lt;= xxx &lt;= m-1</code></p><p>B+数的根节点 <code>2~m</code>，非根节点<code>（m/2）向上取整 &lt;= &lt;= m</code></p><p><strong>高度为2的5阶b树，关键字最少为</strong></p><p>非根节点数：5/2向上取整 -1 = 2，根节点1，故总数 = 1 + 2 + 2 = 5</p><h2 id="_5-mips" tabindex="-1">5. <a href="/Lyc-notes/组成原理/强化">MIPS</a> <a class="header-anchor" href="#_5-mips" aria-label="Permalink to &quot;5. [MIPS](/组成原理/强化)&quot;">​</a></h2><p>主频理解为每秒钟有多少个时钟周期，CPI表示每条指令需要多少个时钟周期</p><p>IPS(每秒钟执行多少条指令) = 主频 / CPI （将主频按照每条指令所需的时钟周期分割，即可得到每秒执行多少条指令）</p><p>MIPS = 主频 / (CPI x 10^6)</p><h2 id="_6-ieee浮点数格式-补码的表示范围-️" tabindex="-1">6. IEEE浮点数格式&amp;补码的表示范围（‼️） <a class="header-anchor" href="#_6-ieee浮点数格式-补码的表示范围-️" aria-label="Permalink to &quot;6. IEEE浮点数格式&amp;补码的表示范围（‼️）&quot;">​</a></h2><p><a href="/Lyc-notes/组成原理/强化#_13-ieee754标准">IEEE单精度浮点数格式</a>：1位符号位 + 8位阶码 + 23位尾数</p><p>注意偏置值位127，真值 = 阶码 - 偏置值</p><p>补码的表示范围：-2^n-1 ~ 2^n-1 -1(例如n为8位，可表示-2^7~2^7 -1 = -128 ~ 127)</p><h2 id="_7-指令流水线的吞吐率" tabindex="-1">7. 指令流水线的吞吐率 <a class="header-anchor" href="#_7-指令流水线的吞吐率" aria-label="Permalink to &quot;7. 指令流水线的吞吐率&quot;">​</a></h2><p><strong>CPU主频1.03GHz，采用四级指令流水线，每个流水段的执行需要一个时钟周期，假定CPU执行100条指令，执行过程中没有发生任何阻塞，流水线的吞吐率？</strong></p><p>流水线的吞吐率 = 执行指令数 / 执行时间？</p><p>执行时间 = 99 + 4 = 103个时钟周期</p><p>吞吐率 = 100条指令 / （103x(1/主频)） = 100x1.03GHz / 103 = 1x10^9条指令/秒</p><h2 id="_8-设备和控制器-io接口-之间互连的接口标准" tabindex="-1">8. 设备和控制器（IO接口）之间互连的接口标准 <a class="header-anchor" href="#_8-设备和控制器-io接口-之间互连的接口标准" aria-label="Permalink to &quot;8. 设备和控制器（IO接口）之间互连的接口标准&quot;">​</a></h2><p><strong>USB</strong>是一 种连接外部设备的 I/0 总线标准， 属于设备总线， 是设备和设备控制器之间的接口。</p><p><strong>PCI、AGP、PCI-E</strong>作为计算机系统的局部总线标准，通常用来连接主存 、网卡、视频卡等。</p><h2 id="_9-海明码" tabindex="-1">9. 海明码 <a class="header-anchor" href="#_9-海明码" aria-label="Permalink to &quot;9. 海明码&quot;">​</a></h2><p>设校验位的位数为k, 数据位的位数为n, 海明码能纠正一位错应满足下述关系: 2^k &gt; n+k+1。 n=8, 当k=4时，2^4 (=16)&gt;8+4+I (=13), 符合要求，故校验位至少是4位。</p><h2 id="_10-提高raid可靠性" tabindex="-1">10. 提高<a href="/Lyc-notes/组成原理/chapter3#磁盘阵列">RAID</a>可靠性 <a class="header-anchor" href="#_10-提高raid可靠性" aria-label="Permalink to &quot;10. 提高[RAID](/组成原理/chapter3#磁盘阵列)可靠性&quot;">​</a></h2><p>RAIDO方案是无冗余和无校验的磁盘阵列， 而RAID1～5方案均是加入了**冗余(镜像)或校验（奇偶校验和海明码）**的磁盘阵列。</p><p><strong>条带化技术</strong>就是一种自动地将I/O的负载均衡到多个物理磁盘上的技术， 条带化技术就是将一块连续的数据分成很多小部分并把它们分别存储到不同磁盘上去。 这就能使多个进程同时访问数据的多个不同部分但不会造成磁盘冲突， 而且在需要对这种数据进行顺序访问的时候可以获得最大程度上的1/0并行能力， 从而获得非常好的性能。</p><p>chache机制是利用局部性原理减少访存次数，提高运行速率。</p><p>故能够提高RAID 可靠性的措施主要是对磁盘进行镜像处理和奇偶校验， 其余选项不符合条件。</p><h2 id="_11-磁盘读取时间-转速-️" tabindex="-1">11. <a href="/Lyc-notes/408/2010#_22-磁盘">磁盘读取时间</a>（转速‼️） <a class="header-anchor" href="#_11-磁盘读取时间-转速-️" aria-label="Permalink to &quot;11. [磁盘读取时间](/408/2010#_22-磁盘)（转速‼️）&quot;">​</a></h2><p>t = 寻道时间 + 旋转时间 + 读取时间</p><p><strong>转速和旋转时间的关系：10000rpm = 60 x 1000 / 10000 = 6ms （1s = 1000ms）</strong></p><p>平均旋转时间 = 6ms/2 = 3ms</p><p>读取时间 = 4KB / 20MB/s = 0.2ms</p><p>总时间 = 3ms + 6ms + 0.2ms + 0.2ms = 9.4ms</p><h2 id="_12-io方式和dma方式" tabindex="-1">12. <a href="/Lyc-notes/组成原理/chapter7#i-o-方式">IO方式和DMA方式</a> <a class="header-anchor" href="#_12-io方式和dma方式" aria-label="Permalink to &quot;12. [IO方式和DMA方式](/组成原理/chapter7#i-o-方式)&quot;">​</a></h2><p>IO中断方式请求的是CPU处理时间，在指令周期的中断周期（指令执行结束之后）响应，数据传送通过软件（中断处理程序）完成。</p><p><strong><a href="/Lyc-notes/408/2012#_13-io子系统层次">IO处理过程层次</a></strong></p><p><strong><a href="/Lyc-notes/组成原理/chapter6#总线事务">总线事务</a></strong>:从请求总线到完成总线使用的操作序列称为总线事务，它是在一个总线周期中发生的一系列活动。典型的总线事务包括请求操作、仲裁操作、地址传输、数据传输和总线释放</p><h2 id="_13-删除文件的过程" tabindex="-1">13. <a href="/Lyc-notes/os/强化#_45-文件删除的过程-链接计数器的变化">删除文件的过程</a> <a class="header-anchor" href="#_13-删除文件的过程" aria-label="Permalink to &quot;13. [删除文件的过程](/os/强化#_45-文件删除的过程-链接计数器的变化)&quot;">​</a></h2><p>删除文件并不会删除所在目录，因为此目录下可能存在别的文件。</p><h2 id="_14-文件数据块组织方式的优缺点" tabindex="-1">14. <a href="/Lyc-notes/os/chapter4#文件的物理结构">文件数据块组织方式的优缺点</a> <a class="header-anchor" href="#_14-文件数据块组织方式的优缺点" aria-label="Permalink to &quot;14. [文件数据块组织方式的优缺点](/os/chapter4#文件的物理结构)&quot;">​</a></h2><p>分清楚文件物理结构和逻辑结构的关系</p><h2 id="_15-计算磁盘的柱面号、磁头号、扇区号的程序" tabindex="-1">15. 计算磁盘的柱面号、磁头号、扇区号的程序 <a class="header-anchor" href="#_15-计算磁盘的柱面号、磁头号、扇区号的程序" aria-label="Permalink to &quot;15. 计算磁盘的柱面号、磁头号、扇区号的程序&quot;">​</a></h2><p>由设备驱动程序完成</p><p><a href="/Lyc-notes/408/2010#_22-磁盘">磁盘地址解析</a></p><h2 id="_16-操作系统的加载" tabindex="-1">16. 操作系统的加载 <a class="header-anchor" href="#_16-操作系统的加载" aria-label="Permalink to &quot;16. 操作系统的加载&quot;">​</a></h2><p><strong><a href="/Lyc-notes/os/chapter5#_1-磁盘初始化">磁盘初始化</a></strong></p><p><strong>第一阶段：BIOS：</strong></p><ol><li><p>BIOS：开机程序被刷入ROM芯片，计算机通电后，第一件事就是读取它。这块芯片里的程序叫做&quot;基本輸出輸入系統&quot;（Basic Input/Output System），简称为BIOS。</p></li><li><p>硬件自检：BIOS程序首先检查，计算机硬件能否满足运行的基本条件，这叫做&quot;硬件自检&quot;（Power-On Self-Test）。如果硬件出现问题，主板会发出不同含义的蜂鸣，启动中止。如果没有问题，屏幕就会显示出CPU、内存、硬盘等信息。</p></li><li><p>启动顺序：硬件自检完成后，BIOS把控制权转交给下一阶段的启动程序。这时，BIOS需要知道，&quot;下一阶段的启动程序&quot;具体存放在哪一个设备。也就是说，BIOS需要有一个外部储存设备的排序，排在前面的设备就是优先转交控制权的设备。这种排序叫做&quot;启动顺序&quot;（Boot Sequence）。</p></li></ol><p><strong>第二阶段：主引导记录</strong></p><p>BIOS按照&quot;启动顺序&quot;，把控制权转交给排在第一位的储存设备。这时，计算机读取该设备的第一个扇区，也就是读取最前面的512个字节。</p><ol><li><p>主引导记录的结构：&quot;主引导记录&quot;只有512个字节，放不了太多东西。它的主要作用是，告诉计算机到硬盘的哪一个位置去找操作系统。</p></li><li><p>分区表：硬盘分区有很多好处。考虑到每个区可以安装不同的操作系统，&quot;主引导记录&quot;因此必须知道将控制权转交给哪个区。</p></li></ol><p><strong>第三阶段：硬盘启动</strong></p><p>计算机的控制权就要转交给硬盘的某个分区了，这里又分成三种情况。</p><ol><li><p>卷引导记录：告诉计算机，操作系统在这个分区里的位置。然后，计算机就会加载操作系统了</p></li><li><p>扩展分区和逻辑分区</p></li><li><p>启动管理器：在这种情况下，计算机读取&quot;主引导记录&quot;前面446字节的机器码之后，不再把控制权转交给某一个分区，而是运行事先安装的&quot;启动管理器&quot;（boot loader），由用户选择启动哪一个操作系统。</p></li></ol><p><strong>第四阶段：操作系统</strong></p><p>控制权转交给操作系统后，操作系统的内核首先被载入内存。</p><h2 id="_17-死锁-银行家算法" tabindex="-1">17. <a href="/Lyc-notes/os/chapter2#死锁">死锁</a>-银行家算法 <a class="header-anchor" href="#_17-死锁-银行家算法" aria-label="Permalink to &quot;17. [死锁](/os/chapter2#死锁)-银行家算法&quot;">​</a></h2><p>死锁产生的四个必要条件：</p><ul><li>互斥条件</li><li>不可剥夺</li><li>请求保持 进程至少保持了一个资源 但又请求一个新的资源请求，该资源被其他进程占有</li><li>循环等待</li></ul><p>破坏死锁产生的必要条件是预防死锁的方法。</p><p>银行家算法属于避免死锁（事先预防策略），需要事先知道所有资源的请求，处于安全状态时，此时必然没有死锁，若处于不安全状态，可能会出现死锁。</p><h2 id="_18-osi模型" tabindex="-1">18. OSI模型 <a class="header-anchor" href="#_18-osi模型" aria-label="Permalink to &quot;18. OSI模型&quot;">​</a></h2><p>OSI模型属于七层模型，物理层、数据链路层、网络层、传输层、会话层、表示层、应用层</p><p>TCP/IP模型属于四层模型，网络接口层、网际层、传输层、应用层</p><p>五层模型：物理层、数据链路层、网络层、传输层、应用层</p><h2 id="_19-曼彻斯特编码" tabindex="-1">19. 曼彻斯特编码 <a class="header-anchor" href="#_19-曼彻斯特编码" aria-label="Permalink to &quot;19. 曼彻斯特编码&quot;">​</a></h2><p>归零编码：高1 低0 （后半个码元都需要跳变为中间 作为同步时序）</p><p>非归零：高1 低0 不跳变</p><p>反向非归零：后一个为0跳变 为1不变</p><p>曼彻斯特：高低为1 低高为0 重点‼️</p><p>差分曼彻斯特：为1 延用前面信号后半个码元 为0 与前面信号后半个码元相反 重点‼️</p><h2 id="_20-分组交换和报文交换时延计算" tabindex="-1">20. 分组交换和报文交换时延计算 <a class="header-anchor" href="#_20-分组交换和报文交换时延计算" aria-label="Permalink to &quot;20. 分组交换和报文交换时延计算&quot;">​</a></h2><p><img src="'+t+`" alt="alt text"></p><p>报文交换：发送一个报文t=8Mb/10Mb/s = 800ms 经过一个路由器 故t = 1600ms</p><p>分组交换采用流水线形式发送：800个分组，两个流水段，一个分组的发送时延 = 1ms，故t= 799x1 + 2x1 = 801ms</p><h2 id="_21-hdlc协议组帧" tabindex="-1">21. HDLC协议组帧 <a class="header-anchor" href="#_21-hdlc协议组帧" aria-label="Permalink to &quot;21. HDLC协议组帧&quot;">​</a></h2><p>组帧遇到连续的5个1就插入0，</p><p>拆解：遇到连续的5个1就删除后面一个0</p><h2 id="_22-直通转发时延" tabindex="-1">22. 直通转发时延 <a class="header-anchor" href="#_22-直通转发时延" aria-label="Permalink to &quot;22. 直通转发时延&quot;">​</a></h2><p>直通交换在输入端口检测到 一 个数据帧时，检查帧首部， 获取帧的目的地址，启动内部的动态查找表转换成相应的输出端口， 在输入与输出交叉处接通，把数据帧直通到相应的端口， 实现交换功能。 直通交换方式只检查帧的目的地址， 共6B,</p><p>所以最短的传输延迟 = 6Bx8 / 100Mb/s = 0.48us</p><p>最短mac帧64B</p><h2 id="_23-找主元素" tabindex="-1">23. 找主元素 <a class="header-anchor" href="#_23-找主元素" aria-label="Permalink to &quot;23. 找主元素&quot;">​</a></h2><p><strong>A={0,5,5,3,5,7,5,5}，则5为主元素，又如A={0,5,5,3,5,1,5,7}，则A中没有主元素，假设A中的n个元素保存在一维数组，若存在主元素，则输出该元素，否则输出-1</strong></p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 开辟一个与A同样大小的数组B，初始值为0，依次遍历A中的元素，A[i]的值对应B的下标，B[A[i]]++，然后遍历B找出大于B[i]&gt;n/2的值，然后输出i即为主元素。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findMainEL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> A</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">[]</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> length </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">n</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[n];</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  bool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> main </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> -</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n;i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">    B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">A</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i]]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n;i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">B</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[i]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(n</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)){</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     main </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> main;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 时间复杂度O(n),空间复杂度O(n)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="_24-平均查找长度" tabindex="-1">24. 平均查找长度 <a class="header-anchor" href="#_24-平均查找长度" aria-label="Permalink to &quot;24. 平均查找长度&quot;">​</a></h2><div class="text-[20px] font-medium leading-8">(10分) 设包含4个数据元素的集合S={ &quot;do&quot;, &quot;for&quot;, &quot;repeat&quot;, &quot;while&quot; ),各元素 的查找概率依次为p1=0.35， p2=0.15， p3=0.15， p4=0.35，将S保存在一个长度为4的顺序表中，采用折半查找法，查找成功时的平均查找长度为2.2。请回答：</div><p><strong>（1）若采用顺序存储结构保存S，且要求平均查找长度更短，则元素应如何排列？应使用何种查找方法？查找成功时的平均查找长度是多少？</strong></p><p><code>平均查找长度 = 查找次数 / 总长度 （默认查找概率相同）</code></p><p><code>求和符号n Σ Pi Ci （概率不同）</code></p><p>利用哈夫曼树原理，概率为对应权值，因此概率高的应该排列在最前方，<code>{&quot;do&quot;,&quot;while&quot;,&quot;for&quot;,&quot;repeat&quot;}</code></p><p>平均查找长度 = 0.35 x 1 + 0.35 x 2 + 0.15 x 3 + 0.15 x 4 = 2.1</p><p><strong>（2）若采用链式存储结构保存S，且要求平均查找长度更短，则元素应如何排列？应使用何种查找方法？查找成功时的平均查找长度是多少？</strong></p><p>和（1）问相同，将概率高的排列在最前方，概率低的排列在后面。</p><p>采用顺序查找</p><p>平均查找长度 = 0.35 x 1 + 0.35 x 2 + 0.15 x 3 + 0.15 x 4 = 2.1</p><h2 id="_25-cache-突发总线事务传送-️" tabindex="-1">25. cache&amp;突发总线事务传送‼️ <a class="header-anchor" href="#_25-cache-突发总线事务传送-️" aria-label="Permalink to &quot;25. cache&amp;突发总线事务传送‼️&quot;">​</a></h2><div class="text-[18px] font-bold leading-8"> 43.(9分)某32位计算机，CPU主频为800MHz,Cache命中时的CPI为4，Cache块大小为32字节；主存采用8体交叉存储方式，每个体的存储字长为32位、存储周期为40ns；存储器总线宽度为32位，总线时钟频率为200MHz，支持突发传送总线事务。每次读突发传送总线事务的过程包括：送首地址和命令、存储器准备数据、传送数据。每次突发传送32字节，传送地址或32位数据均需要一个总线时钟周期。请回答下列问题，要求给出理由或计算过程。 </div><p><strong>（1）CPU和总线的时钟周期各为多少？总线的带宽（即最大数据传输率）为多少？</strong></p><p>CPU时钟周期 = 1/主频 = 1 / 800MHz = 1.25ns</p><p>总线时钟周期 = 1/总线时钟频率 = 1 / 200MHz = 0.5ns</p><p>总线最大数据传输率 = 传输数据 / 时间 = 4B x 总线时钟频率 = 800MB/s</p><p><strong>（2）Cache缺失时，需要用几个读突发传送总线事务来完成一个主存块的读取？（3）存储器总线完成一次读突发传送总线事务所需的时间是多少？</strong></p><p>cache缺失时，cache块大小32B，需要访问主存中调入32B，每次突发传送32B，一个读突发传送总线事务</p><p>传送地址需要一个总线时钟周期0.5ns</p><p>因为采用8体交叉存储方式，存储周期40ns，启动一个体需要40ns，40ns/8=5ns，故每个5ns启动一个体工作，采用流水线形式，每个存储体字长32位4B，读取32B刚好需要读取8个存储体，读取一个体的数据再传送数据5ns，形成8个流水段，第一个流水段40+5 = 45ns，其余7个流水段只需要5ns传送数据 7x5ns = 35ns。总时间 = 5ns（传送地址） + 45ns（第一个体启动和传送数据）+ 35ns（其余7个体的传送） = 85ns</p><p><strong>（4）若程序BP执行过程中，共执行了100条指令，平均每条指令需进行1.2次访存，Cache缺失率为5%，不考虑替换等开销，则BP的CPU执行时间是多少？</strong></p><p>100条执行执行所需要时间 = 100 * CPI * 时钟周期 = 100 x 4 x 1.25ns = 500ns</p><p>指令执行过程中cache缺失时间 = 100 * 5% * 1.2 * 85ns（需要一次突发传送） = 510ns</p><p>BP的CPU执行时间 = 500ns + 510ns = 1010ns</p><h2 id="_26-指令格式-偏移寻址" tabindex="-1">26. 指令格式&amp;偏移寻址&amp; <a class="header-anchor" href="#_26-指令格式-偏移寻址" aria-label="Permalink to &quot;26. 指令格式&amp;偏移寻址&amp;&quot;">​</a></h2><p><strong>44.（14分）某计算机采用16位定长指令字格式，其CPU中有一个标志寄存器，其中包含进位/借位标志CF、零标志ZF和符号标志NF。假定为该机设计了条件转移指令，其格式如下：</strong></p><table tabindex="0"><thead><tr><th>15 - 11</th><th>10</th><th>9</th><th>8</th><th>7 - 0</th></tr></thead><tbody><tr><td>00000</td><td>C</td><td>Z</td><td>N</td><td>OFFSET</td></tr></tbody></table><p><strong>其中，00000为操作码OP；C、Z和N分别为CF、ZF和NF的对应检测位，某检测位为1时表示需检测对应标志位，需检测的标志位中只要有一个为1就转移，否则不转移。例如，若C=1，Z=0，N=1，则需检测CF和NF的值，当CF=1或NF=1时发生转移；OFFSET是相对偏移量，用补码表示。转移执行时，转移目标地址为<code>（PC）+2+2×OFFSET</code>；顺序执行时，下条指令地址为<code>（PC）+2</code>。请回答下列问题。</strong></p><p><strong>（1）该计算机存储器按字节编址还是按字编址？该条件转移指令向后（反向）最多可跳转多少条指令？</strong></p><p>采用16位定长指令格式，下条指令地址为<code>(PC)+2</code>，可知采用按字节编址</p><p>偏移量OFFSET采用补码表示，8位补码可表示的范围为-2^7 - 2^7 -1 = -128 ~ 127</p><p><strong>（2）某条件转移指令的地址为200CH，指令内容如下图所示，若该指令执行时CF=0，ZF=0，NF=1，则该指令执行后PC的值是多少？若该指令执行时CF=1，ZF=0，NF=0，则该指令执行后PC的值又是多少？请给出计算过程。</strong></p><table tabindex="0"><thead><tr><th>15 - 11</th><th>10</th><th>9</th><th>8</th><th>7 - 0</th></tr></thead><tbody><tr><td>00000</td><td>0</td><td>1</td><td>1</td><td>11100011</td></tr></tbody></table><p>NF=1，对应的NF为也为1，根据题目可知需要下条指令需要转移故 PC = 200CH + 2 + 2*(11100011)补（不能使用化为二进制算 因为补码和200CH运算需要进行符号拓展）</p><p>11100011 = E3H = FFE3H（符号拓展 ），乘2需要左移一位 = FFC6H</p><p>PC = 200CH + 2 + FFC6H = 1FD4H</p><p>CF-1，对应的CF为0，故不偏移，PC = PC + 2 = 200EH</p><p><strong>（3）实现“无符号数比较小于等于时转移”功能的指令中，C、Z和N应各是什么？</strong></p><p>无符号数CF为和ZF才生效</p><p>无符号数小于等于 a-b&lt;=0，CF = 1 或者ZF = 1，NF =0</p><p><strong>（4）以下是该指令对应的数据通路示意图，要求给出图中部件①～③的名称或功能说明。</strong></p><p><img src="`+e+`" alt="alt text"></p><p>部件1️⃣用于存放当前指令，不难得出为指令寄存器; 多路选择器 根据符号标志C/Z/N来决定下一条指令的地址是PC+2还是PC+2+2xOFFSET, 故多路选择器左边线上的结果应该是PC+2+2xOFFSET。 根据运算的先后顺序以及与PC+2的连接， 部件2️⃣用于左移一位实现乘2, 为移位寄存器。部件3️⃣用于PC+2和2xOFFSET相加，为加法器。</p><h2 id="_27-分页管理" tabindex="-1">27.分页管理 <a class="header-anchor" href="#_27-分页管理" aria-label="Permalink to &quot;27.分页管理&quot;">​</a></h2><p><strong>46.（8分）某计算机主存按字节编址，逻辑地址和物理地址都是32位，页表项大小为4字节。请回答下列问题。</strong></p><p><strong>（1）若使用一级页表的分页存储管理方式，逻辑地址结构如下：</strong></p><p>| 页号(20位) | 页内偏移量（12位）|</p><p><strong>则页的大小是多少字节？页表最大占用多少字节？</strong></p><p>页内偏移量12位，页的大小为4KB</p><p>页号20位，页表的大小为2^20 * 4B = 4MB</p><p><strong>（2）若使用二级页表的分页存储管理方式，逻辑地址结构如下：</strong></p><p>| 页目录号(10位) | 页表索引(10位) | 页内偏移量(12) |</p><p><strong>设逻辑地址为LA，请分别给出其对应的页目录号和页表索引的表达式。</strong></p><p>页目录号 = ((unsigned int)(LA)&gt;&gt;22) &amp; 0x3FF （从 LA 中提取出特定的 10 位字段。具体来说，它提取的是 LA 的最高 10 位（经过右移 22 位后的位置），并通过按位与操作将其余位清零。）</p><p>页表索引 = ((unsigned int)(LA)&gt;&gt;12) &amp; 0x3FF（从 LA 中提取出特定的 10 位字段。具体来说，它提取的是 LA 的中间部分（经过右移 12 位后的位置），并通过按位与操作将其余位清）</p><p><strong>（3）采用（1）中的分页存储管理方式，一个代码段起始逻辑地址为00008000H，其长度为8KB，被装载到从物理地址00900000H开始的连续主存空间中。页表从主存00200000H开始的物理地址处连续存放，如下图所示（地址大小自下向上递增）。请计算出该代码段对应的两个页表项的物理地址、这两个页表项中的页框号以及代码页面2的起始物理地址。</strong></p><div class="language-text vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>页表</span></span>
<span class="line"><span></span></span>
<span class="line"><span>物理地址2 页框号2          ——&gt; 物理地址3   代码页面2</span></span>
<span class="line"><span>物理地址1 页框号1          ——&gt; 0090 0000H 代码页面1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>0020 0000H页表起始地址</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>代码段起始逻辑地址0000 8000H，长度为8K，可知起始页号为0000 8H，8K/4K=2,故占两页，每个页表项占4B，8*4B = 32B，又因为按字节编址，所以：</p><p>物理地址1 = 0020 0000H + 0000 0020H（32） = 0020 0020H</p><p>物理地址2 = 0020 0000H + 0000 0024H（36） = 0020 0024H</p><p>物理地址3 = 0091 0000H</p><p>页框号1 = 0090H</p><p>页框号2 = 0091H</p>`,165)]))}const u=a(l,[["render",h]]);export{E as __pageData,u as default};
