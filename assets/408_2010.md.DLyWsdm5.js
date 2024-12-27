import{_ as a,c as p,o as e,aa as l}from"./chunks/framework.CAVwB9kQ.js";const i="/Lyc-notes/assets/2010_22.O_OscpIW.png",_=JSON.parse('{"title":"2010年408真题","description":"","frontmatter":{},"headers":[],"relativePath":"408/2010.md","filePath":"408/2010.md","lastUpdated":1732621259000}'),s={name:"408/2010.md"},n=l(`<h1 id="_2010年408真题" tabindex="-1">2010年408真题 <a class="header-anchor" href="#_2010年408真题" aria-label="Permalink to &quot;2010年408真题&quot;">​</a></h1><h2 id="_1-线索二叉树的结构定义和图示" tabindex="-1">1. 线索二叉树的结构定义和图示 <a class="header-anchor" href="#_1-线索二叉树的结构定义和图示" aria-label="Permalink to &quot;1. 线索二叉树的结构定义和图示&quot;">​</a></h2><p>求前中后线索二叉树的步骤：</p><ul><li>求得前中后序遍历的序列</li><li>分配左右线索指针，left指向该节点序列的前一个元素，right指向该节点序列的后一个元素，首节点的left指针指向null</li></ul><h2 id="_2-树的结点数和叶子结点数计算" tabindex="-1">2. 树的结点数和叶子结点数计算 <a class="header-anchor" href="#_2-树的结点数和叶子结点数计算" aria-label="Permalink to &quot;2. 树的结点数和叶子结点数计算&quot;">​</a></h2><p>结点总数 = 分枝数 + 1（根结点） = 边数 + 1 = <code>1*度为1的结点个数 + 2*度为2的结点个数 + 3*度为3的结点个数....</code> + 1= 度为0的个数 + 度为1的个数 + 度为2的个数 + ...</p><p>20 * 4 + 10 * 3 + 1*2 + 10 *1 + 1= n0 + 10 + 1 + 10 + 20 =&gt; n0 = 82</p><h2 id="_3-完全图的边数" tabindex="-1">3. 完全图的边数 <a class="header-anchor" href="#_3-完全图的边数" aria-label="Permalink to &quot;3. 完全图的边数&quot;">​</a></h2><ul><li>有向图：n(n-1)/2</li><li>无向图：n(n-1)</li></ul><h2 id="_4-折半查找查找失败的最多比较次数" tabindex="-1">4. 折半查找查找失败的最多比较次数 <a class="header-anchor" href="#_4-折半查找查找失败的最多比较次数" aria-label="Permalink to &quot;4. 折半查找查找失败的最多比较次数&quot;">​</a></h2><p>查找失败的最多比较次数 = 树的高度 （不是树的高度+1 这里是比较次数） 折半查找判定树的特点：</p><ul><li>平衡性：是一个完全平衡二叉树</li><li>深度： log2n + 1</li><li>查找路径的判定</li></ul><h2 id="_5-快速排序的递归次数与什么有关" tabindex="-1">5. 快速排序的递归次数与什么有关？ <a class="header-anchor" href="#_5-快速排序的递归次数与什么有关" aria-label="Permalink to &quot;5. 快速排序的递归次数与什么有关？&quot;">​</a></h2><ul><li>与序列的初始排列有关</li><li>与分区的处理顺序无关</li></ul><h2 id="_6-补码乘法运算溢出判断" tabindex="-1">6. 补码乘法运算溢出判断 <a class="header-anchor" href="#_6-补码乘法运算溢出判断" aria-label="Permalink to &quot;6. 补码乘法运算溢出判断&quot;">​</a></h2><p>共2w位 前w为全0或者全1不溢出，否则溢出</p><p>同号相乘得到正数，判断前N位是否为全0 否则溢出</p><p>异号相乘得到负数，判断前N位是否位1，否则溢出</p><p>也可将补码转换为十进制数 计算乘法 判断该数是否在补码的表示范围内</p><h2 id="_7-c语言中的类型转换" tabindex="-1">7. c语言中的类型转换 <a class="header-anchor" href="#_7-c语言中的类型转换" aria-label="Permalink to &quot;7. c语言中的类型转换&quot;">​</a></h2><p>表示范围： int &lt; float &lt; double</p><p>int-&gt;float 存在精度丢失 不会溢出</p><p>float-&gt;int 存在溢出 不会精度丢失</p><p>int—&gt;double 均不会</p><p>float-&gt;double 均不会</p><h2 id="_8-ram和rom" tabindex="-1">8. RAM和ROM <a class="header-anchor" href="#_8-ram和rom" aria-label="Permalink to &quot;8. RAM和ROM&quot;">​</a></h2><ul><li>RAM是易失性存储器，所以需要刷新，ROM是非易失型存储器，不需要刷新</li><li>RAM和ROM都可采用随机存取方式访问</li><li>RAM速度 &gt; ROM</li><li>RAM可用于高速缓存</li></ul><h2 id="_9-程序员可见的寄存器" tabindex="-1">9. 程序员可见的寄存器 <a class="header-anchor" href="#_9-程序员可见的寄存器" aria-label="Permalink to &quot;9. 程序员可见的寄存器&quot;">​</a></h2><p>可见寄存器：通用寄存器组（基址和变址）、程序状态字寄存器PSW、程序计数器PC、累加寄存器ACC、栈指针SP、移位寄存器</p><p>不可见：指令寄存器IR、暂存寄存器DR、MAR、MDR</p><p>PSW中包含状态标志（CF、ZF、OF、SF）和控制标志（中断允许标志、陷阱），转移指令依赖状态标志，故程序员可见</p><p>CPU内部的寄存器有哪些？</p><p>运算器：ALU、暂存寄存器、累加寄存器、通用寄存器组、PSW、移位寄存器、</p><p>控制器：PC、指令寄存器、指令译码器、MAR、MDR和时序逻辑</p><h2 id="_10-造成指令流水线阻塞-冒险-的原因有哪些" tabindex="-1">10. 造成指令流水线阻塞（冒险）的原因有哪些？ <a class="header-anchor" href="#_10-造成指令流水线阻塞-冒险-的原因有哪些" aria-label="Permalink to &quot;10. 造成指令流水线阻塞（冒险）的原因有哪些？&quot;">​</a></h2><p>数据冒险（数据相关）、结构冒险（资源冲突）、控制冒险（条件转移）、</p><p>解决方案：插入空操作指令、暂停一个时钟周期、采用数据旁路（转发）</p><h2 id="_11-中断的过程" tabindex="-1">11. 中断的过程 <a class="header-anchor" href="#_11-中断的过程" aria-label="Permalink to &quot;11. 中断的过程&quot;">​</a></h2><p>单中断：</p><p>关中断-&gt; 保存断点(PC和PSW) -&gt; 中断服务程序寻址 -&gt; 保存现场 -&gt; 执行中断服务程序 -&gt; 恢复现场 -&gt; 开中断 -&gt; 中断返回</p><p>中断隐指令： 关中断-&gt; 保存断点(PC和PSW) -&gt; 中断服务程序寻址</p><p>中断服务程序： 保存现场 -&gt; 执行中断服务程序 -&gt; 恢复现场 -&gt; 开中断 -&gt; 中断返回</p><p>多重中断：</p><p>1️⃣ 关中断。</p><p>2️⃣ 保存断点（PC和PSW）。</p><p>3️⃣ 中断服务程序寻址。</p><p>4️⃣ 保存现场和屏蔽字。进入中断服务程序后首先要保存现场和中断屏蔽字，现场信息是指用户可见的工作寄存器的内容，它存放程序执行到断点处的现行值。</p><blockquote><p>现场和断点，这两类信息都不能被中断服务程序破坏。由于现场信息用指令可直接访问， 因此通常在中断服务程序中通过指令把它们保存到栈中，即由软件实现 。而断点信息由 CPU 在中断响应时自动保存到栈或指定的寄存器中，即由硬件实现。</p></blockquote><p>5️⃣ 开中断。允许更高级中断请求得到响应，以实现中断嵌套。</p><p>6️⃣ 执行中断服务程序。这是中断请求的目的。</p><p>7️⃣ 关中断。保证在恢复现场和屏蔽字时不被中断。</p><p>8️⃣ 恢复现场和屏蔽字。将现场和屏蔽字恢复到原来的状态。</p><p>9️⃣ 开中断、中断返回。中断服务程序的最后一条指令通常是一条中断返回指令，使其返回到原程序的断点处，以便 继续执行原程序。</p><p>1~3 由中断隐指令(硬件自动)完成: 4~ 9 由中断服务程序完成。</p><h2 id="_11-操作系统给应用程序提供哪些" tabindex="-1">11. 操作系统给应用程序提供哪些？ <a class="header-anchor" href="#_11-操作系统给应用程序提供哪些" aria-label="Permalink to &quot;11. 操作系统给应用程序提供哪些？&quot;">​</a></h2><p>系统调用</p><h2 id="_12-peterson算法-️" tabindex="-1">12. peterson算法（‼️） <a class="header-anchor" href="#_12-peterson算法-️" aria-label="Permalink to &quot;12. peterson算法（‼️）&quot;">​</a></h2><p>！！！</p><p>单标志法：交替进入临界区 需要由另外一个进程唤醒 若该进程不再进入临界区 则另一个也无法进入 违背空闲让进</p><p>双标志先检查：违背忙则等待</p><p>双标志后检查：违背空闲让进，会出现饥饿现象 违背有限等待</p><p>peterson算法：综合1和3的算法思想，使用flag[]解决互斥访问问题，利用turn解决饥饿问题 ，未遵循让权等待</p><p>硬件实现：</p><p>中断屏蔽方法 使用关中断 临界区 开中断</p><p>硬件指令 TestAndSet指令 使用ts给资源上锁 结束后 解锁</p><p>硬件指令 Swap</p><p>未遵循让权等待，会导致饥饿现象</p><p>互斥锁：使用硬件实现，存在忙等现象</p><p>信号量：PV操作</p><p>整型信号量 未遵循让权等待</p><p>记录型信号量 使用链表存储等待资源的进程 解决让权等待</p><h2 id="_13-最佳适应-动态分区分配算法" tabindex="-1">13. 最佳适应&amp;动态分区分配算法 <a class="header-anchor" href="#_13-最佳适应-动态分区分配算法" aria-label="Permalink to &quot;13. 最佳适应&amp;动态分区分配算法&quot;">​</a></h2><p>首次适应：按地址递增次序排列，顺序找第一个满足大小（性能最好）</p><p>邻近适应（循环首次适应）：从上次结束的位置继续往下查找</p><p>最佳适应：按照容量递增 顺序找到第一个满足大小 产生很多外部碎片</p><p>最坏适应：按照容量递减排列，找第一个最大</p><h2 id="_14-存储转发流水线" tabindex="-1">14. 存储转发流水线 <a class="header-anchor" href="#_14-存储转发流水线" aria-label="Permalink to &quot;14. 存储转发流水线&quot;">​</a></h2><p>流水线传输时延 = k段链路的传输时间 + 前n-1个分组的发送时延 + 最后一个分组在k段链路中的发送时延</p><pre><code>        =  k段链路的传播时延 + k个流水段 * 单个流水段时间r + （分组个数 - 1） * 单个流水段时间r = kd + kr + (m-1)*r
</code></pre><h2 id="_15-icmp报文的类型" tabindex="-1">15. ICMP报文的类型 <a class="header-anchor" href="#_15-icmp报文的类型" aria-label="Permalink to &quot;15. ICMP报文的类型&quot;">​</a></h2><p>ICMP差错报告报文：终点不可达、源点抑制、时间超过、参数问题、路由重定向</p><p>不发送差错报告报文的情况：</p><p>ICMP询问报文：:回送请求和回答报文、时间戳请求和回答报文、地址掩码请求 和回答报文、路由器询问和通告报文</p><p>ICMP的两个常见应用是分组网间探测PING(用来测试两台主机之间的连通性)和Traceroute(UNIX中的名字，在Windows中是Tracert，可以用来跟踪分组经过的路由)。其中PING使用了ICMP回送请求和回答报文，Traceroute(Tracert)使用了ICMP时间超过报文</p><h2 id="_16-dns解析发送请求数分析" tabindex="-1">16. DNS解析发送请求数分析 <a class="header-anchor" href="#_16-dns解析发送请求数分析" aria-label="Permalink to &quot;16. DNS解析发送请求数分析&quot;">​</a></h2><p>主机-&gt;本地域名 递归</p><p>本地域名-&gt; 其他域名服务器 可采用递归和迭代，递归只需发送DNS请求一次，迭代需要发送多次</p><h2 id="_17-索引文件最大文件长度计算" tabindex="-1">17. 索引文件最大文件长度计算 <a class="header-anchor" href="#_17-索引文件最大文件长度计算" aria-label="Permalink to &quot;17. 索引文件最大文件长度计算&quot;">​</a></h2><p>先确定磁盘索引块的大小、磁盘数据块的大小、索引项的大小、再确定索引文件中直接索引项的个数、一级间接索引的个数、二级间接索引的个数</p><p>例如：直接索引4个、一级2个、二级1个，索引项占4B，磁盘索引块和磁盘数据块均为256B。</p><p>4*256 + 256/4 * 2 *256 + 256/4 * *256/4 * 256</p><h2 id="_18-rip、ospf、bgp" tabindex="-1">18. RIP、OSPF、BGP <a class="header-anchor" href="#_18-rip、ospf、bgp" aria-label="Permalink to &quot;18. RIP、OSPF、BGP&quot;">​</a></h2><p>内部网关协议：RIP、OSPF</p><p>外部网关协议：BGP</p><p>RIP</p><ul><li>距离矢量路由协议，基于跳数，最大跳数为15</li><li>每隔30S广播路由表中的所有条目，仅与直连的路由器交换信息</li><li>好消息传的快，坏消息传的慢（慢收敛）</li><li>因为需要频繁的广播交换信息，故采用UDP协议，端口号为520</li></ul><p>OSPF</p><ul><li>链路状态路由协议。居于洪泛法，交换的是域内全部的路由信息</li><li>发送的消息是与本路由器相联的所有的链路状态</li><li>基于IP</li></ul><p>BGP</p><ul><li>基于TCP</li><li>与本结点相邻的路由器交换信息，首次交换整个路由表，非首次交换有变化的部分</li></ul><h2 id="_19-散列表" tabindex="-1">19. 散列表 <a class="header-anchor" href="#_19-散列表" aria-label="Permalink to &quot;19. 散列表&quot;">​</a></h2><p>1️⃣ 确定表长（一般可由装填因子得出或者题目直接给出）</p><p>2️⃣ 确定散列函数，常见的散列函数有直接定址法：y=kx+b，除留余数法h = key/p</p><p>3️⃣ 确定解决冲突的方法：</p><p>开放地址法（在散列函数的基础上增加增量d）：(h(key) + d)/p，d可线性增加，也可平方增加，或者增量由第二个散列函数得到</p><p>拉链法：将冲突的同义词使用一个链表存储</p><p>4️⃣ 查找成功的平均查找长度计算 = 序列中各元素查找成功的次数之和 / 关键字个数</p><p>查找失败 = （0～p-1）查找失败次数之和 / 质数p（要模以的数字）</p><p>关键字序列{7,8,30,11,18,9,14}散列存储到散列表中，散列表的存储空间从0开始的一维数组，散列函数H(key)=(key*3)mod7,处理冲突采用线性探测再散列，装填因子为0.7，使用md画出所构造的散列表，计算等概率情况下查找成功和查找失败的平均查找长度</p><p>+---+---+---+---+---+---+---+---+---+---+ | 7 |14| | 8 | |11|30 |18 | 9 | | +---+---+---+---+---+---+---+---+---+---+ 0 1 2 3 4 5 6 7 8 9</p><p>查找成功 = （1 + 2 + 1 + 1 + 1 + 3 + 3） / 7 = 12/7</p><p>查找失败 = （3 + 2 + 1 + 2 + 1 + 5 + 4）/7 = 18/7</p><h2 id="_20-指令格式分析和执行" tabindex="-1">20. 指令格式分析和执行 <a class="header-anchor" href="#_20-指令格式分析和执行" aria-label="Permalink to &quot;20. 指令格式分析和执行&quot;">​</a></h2><p>指令格式：op 寻址特征1 操作数1 寻址特征2 操作数2</p><p>指令系统的指令数由操作码OP字段确定2^op</p><p>通用寄存器的位数由寄存器寻址操作数的位数确定2^r</p><p>MAR的位数：主存地址空间大小M和编制方式字节or字 MB/rB</p><p>MDR的位数：等于指令的字长（单字长指令&amp;双字长指令）</p><p>转移指令的寻址范围：</p><ul><li>相对寻址常规情况下 (PC) + 1 + 偏移量（补码 表示范围-2^n-1 ~ 2^n-1 - 1）</li></ul><p>加法指令 是将源操作数和目的操作相加 写回到目的操作数地址中 分清楚(R1) 和 R1的区别</p><h2 id="_21-cache数组各项物理地址的寻址过程" tabindex="-1">21. cache数组各项物理地址的寻址过程 <a class="header-anchor" href="#_21-cache数组各项物理地址的寻址过程" aria-label="Permalink to &quot;21. cache数组各项物理地址的寻址过程&quot;">​</a></h2><p>cache映射方式：</p><p>直接映射 标记 行号 块内地址</p><p>全相联：标记 块内</p><p>组相联：标记 组号 块内</p><p>cache容量计算：标记位 + 有效位 + 替换位 + 一致位 + 数据</p><p>cache访问命中率计算 = 1 - 缺失率</p><p>缺失率计算 = 缺失次数 / 访问总次数（注意读写次数需要x2）</p><p>缺失次数分析：设cache行大小为64B，一个int数据占4B，数组<code>A[256][256]</code>，故一个cache行可存储16个int数据，每16个缺失一次，共访问2^16次，缺失次数 = 2^16 / 16</p><p>数组首地址320(十进制)分析：</p><ul><li>每16个一组 320 / 16 = 5，初始行在5行</li><li>320转为16进制 320 + 31x4</li></ul><h2 id="_22-磁盘" tabindex="-1">22. 磁盘 <a class="header-anchor" href="#_22-磁盘" aria-label="Permalink to &quot;22. 磁盘&quot;">​</a></h2><p>管理空闲磁盘盘：</p><ul><li>空闲表法（顺序存储），空闲盘块表的内容，第一个空闲盘块表，空闲盘块数</li><li>空闲链表法，盘块链和盘区链，盘区是将多个盘块合并为一个盘区</li><li>位示图，用二进制的一位表示一个盘块</li><li>成组链接法，空闲表和空闲链表不是大文件系统，将空闲盘块分组，记录每组的第一个盘块号和盘块数，组成链表</li></ul><p>磁盘调度算法</p><p>先来先服务算法</p><p>最短寻道时间优先算法</p><p>SCAN算法（类似于电梯算法）：确定当前磁头的位置，磁头移动的方向，一次访问从磁头的位置到最大磁头位置间的请求，然后调转磁头移动方向，重复上述过程。</p><p>C-SCAN算法:类似于SCAN算法，只是在到达最大磁头位置时，会回到起始位置0，继续扫描，消除两端访问</p><p>C-LOOK算法：不用到达最大磁头位置，而是当前访问的最大磁头位置后再逆转方向。</p><p>注意SCAN和C-SCAN都需要访问到<strong>磁道的最外层，而不是达到最大磁道请求后返回，C-LOOK与之相反，不需要到达最外层而是到达最大磁道请求后返回</strong></p><p>针对最大磁道数请求和最外层问题，真题中若出现了最外层即加入运算，若没出现则不考虑，默认达到最大磁道最大请求后返回</p><p>磁盘读数据所花时间 = 寻道时间 + 旋转时间 + 传输时间</p><p>寻道时间 = 启动磁头臂t + 常数k*移动磁道数</p><p>旋转时间：</p><ul><li>把扇区移动到磁头的下方（只和硬件有关）</li><li>平均旋转延迟 = 1/2 * 转数每秒</li></ul><p>传输时间 = 所需要读写的字节数 / 每秒转数 * 每扇区的字节数</p><ul><li>如果题目中给出的是读取一个扇区所需要的时间 = 磁盘转一圈的时间 / 一圈的扇区数</li></ul><p><img src="`+i+`" alt="alt text"></p><div class="language-md vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(1) 由题可知，可使用2KB内存空间使用位示图管理磁盘块状态，2KB = 2^14b = 16384b </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(2) 使用C-SCAN调度算法，题目为给出最大磁头位置，故到达最大请求位置后返回，以此访问120、30、50、90，共移动170个磁道数。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">寻道时间 = 170 * 1ms = 170ms</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">盘面转一圈的时间为：60S*1000/6000=10ms（1s = 1000ms）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">平均旋转延迟 = 10 / 2= 5ms</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">旋转时间 = 平均旋转延迟5ms * 读取4个盘片(旋转4次) = 20ms</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">读取一个扇区 = 转一圈的时间 / 100个扇区 = 10ms / 100 = 0.1ms</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">传输时间 = 读取一个扇区 * 4 = 0.4ms</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">总时间 = 寻道时间 + 旋转时间 + 传输时间 = 170ms + 20ms + 0.4ms = 190.4ms</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(3) 采用FCFS调度策略更高效，因为Flash半导体随机存储器的物理结构不需要考虑寻道时间和旋转时间，可直接利用IO请求序列调度</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h2 id="_23-页面替换算法" tabindex="-1">23. 页面替换算法 <a class="header-anchor" href="#_23-页面替换算法" aria-label="Permalink to &quot;23. 页面替换算法&quot;">​</a></h2><p>最久不使用算法（最佳置换算法OPT）：换出以后都不会使用的页面或者以后最久不使用的页面，根据集合向后看</p><p>先进先出（FIFO）：各个页面置换算法运行过程，按照先进先出策略进行，替换时，淘汰集合的第一个(队列的第一个) 会出现Belady现象 增大集合 缺页次数不减反增</p><p>最近最久未使用（LRU）：根据各页使用的集合向前看，</p><p><strong>时钟Clock算法：首次装入或访问 访问位为1，替换时选择0淘汰，并指向淘汰页的下一页</strong></p><p><strong>改进时钟clocl： 访问位0 修改位1 优先级 00、01、10、11</strong></p><p>先选00 再找01（同时修改访问位为0）</p><h2 id="_24-csma-cd" tabindex="-1">24. CSMA/CD <a class="header-anchor" href="#_24-csma-cd" aria-label="Permalink to &quot;24. CSMA/CD&quot;">​</a></h2><p>冲突最长时间 争用期 = 2 * t = RTT</p><p>冲突最短时间 = 单向传播时延</p><p>最短帧 = RTT * 数据传输速率</p><p>2进制指数规避算法 <code>[0,...,2^k - 1]， k = min[重传次数，10]</code></p><p>有效数据传输速率 = 发送数据 / 发送时延+ RTT + 确认时延</p>`,164),t=[n];function r(h,o,c,d,u,b){return e(),p("div",null,t)}const k=a(s,[["render",r]]);export{_ as __pageData,k as default};