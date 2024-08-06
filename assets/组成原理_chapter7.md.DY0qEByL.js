import{_ as a,c as o,o as t,aa as l}from"./chunks/framework.CAVwB9kQ.js";const e="/Lyc-notes/assets/IO%E6%8E%A5%E5%8F%A3%E7%9A%84%E9%80%9A%E7%94%A8%E7%BB%93%E6%9E%84.DAtIoAv6.png",i="/Lyc-notes/assets/%E7%A8%8B%E5%BA%8F%E6%9F%A5%E8%AF%A2%E6%96%B9%E5%BC%8F%E6%B5%81%E7%A8%8B%E5%9B%BE.DWa6Ciwp.png",_=JSON.parse('{"title":"第 7 章 输入/输出系统","description":"","frontmatter":{},"headers":[],"relativePath":"组成原理/chapter7.md","filePath":"组成原理/chapter7.md","lastUpdated":1722936772000}'),r={name:"组成原理/chapter7.md"},p=l('<h1 id="第-7-章-输入-输出系统" tabindex="-1">第 7 章 输入/输出系统 <a class="header-anchor" href="#第-7-章-输入-输出系统" aria-label="Permalink to &quot;第 7 章 输入/输出系统&quot;">​</a></h1><h2 id="i-o-接口" tabindex="-1">I/O 接口 <a class="header-anchor" href="#i-o-接口" aria-label="Permalink to &quot;I/O 接口&quot;">​</a></h2><p>I/O 接口(也称 I/O 控制器)是主机和外设之间的交接界面，通过接口可以实现主机和外设之间的信息交换</p><h3 id="i-o-接口的功能" tabindex="-1">I/O 接口的功能 <a class="header-anchor" href="#i-o-接口的功能" aria-label="Permalink to &quot;I/O 接口的功能&quot;">​</a></h3><ol><li><p><strong>进行地址译码和设备选择</strong>。CPU 送来选择外设的地址码后，接口必须对地址进行译码以 产生设备选择信息，使主机能和指定外设交换信息。</p></li><li><p><strong>实现主机和外设的通信联络控制</strong>。解决主机与外设时序配合问题，协调不同 工作速度的 外设和主机之间交换信息，以保证整个计算机系统能统一、协调地工作。</p></li><li><p><strong>实现数据缓冲</strong>。CPU 与外设之间的速度往往不匹配，为消除速度差异，接口必须设置数 据缓冲寄存器，用于数据的暂存，以避免因速度不 一致而丢失数据。</p></li><li><p><strong>信号格式的转换</strong>。外设与主机两者的电平、数据格式都可能存在差异，接口应提供主机与外设的信号格式的转换功能，如电平转换、并/串或串/并转换、模/数或数/模转换等。</p></li><li><p><strong>传送控制命令和状态信息</strong>。CPU 要启动某外设时，通过接口中的命令寄存器向外设发出启动命令;外设准备就绪时，则将“准备好”状态信息送回接口中的状态寄存器，并反馈给 CPU。外设向 CPU 提出中断请求时，CPU 也应有相应的响应信号反馈给外设</p></li></ol><h3 id="i-o-接口的基本结构" tabindex="-1">I/O 接口的基本结构 <a class="header-anchor" href="#i-o-接口的基本结构" aria-label="Permalink to &quot;I/O 接口的基本结构&quot;">​</a></h3><blockquote><p>I/O 端口与 CPU 交换的内容</p></blockquote><p>I/O 接口在主机侧通过 1/O 总线与内存、CPU 相连。数据缓冲寄存器用来暂存与 CPU 或内存之间传送的数据信息，状态寄存器用来记录接口和设备的状态信息，控制寄存器用来保存 CPU 对外设的控制信息。状态寄存器和控制寄存器在传送方向上是相反的，在访问时间上也是错开的，因此可将它们合二为 一 <img src="'+e+'" alt="alt text"></p><blockquote><p>I/O 接口的数据线上传输的内容</p></blockquote><p>I/O 接口中的数据线传送的是<strong>读/写数据、状态信息、控制信息和中断类型号</strong>。地址线传送的是要访问 I/O 接口中的<strong>寄存器的地址</strong>。控制线传送的是<strong>读/ 写控制信号</strong>，以确认是读寄存器还是写寄存器，此外控制线还会传送<strong>中断请求和响应信号、仲裁信号和握手信号</strong>。</p><p>数据缓冲寄存器、状态/控制寄存器的访问操作是通过相应的指令来完成的，通常称这类指 令为 I/O 指令，I/O 指令只能在操作系统内核的底层 I/O 软件中使用，它们是一种特权指令。</p><h3 id="i-o-接口的类型" tabindex="-1">I/O 接口的类型 <a class="header-anchor" href="#i-o-接口的类型" aria-label="Permalink to &quot;I/O 接口的类型&quot;">​</a></h3><p>从不同的角度看，I/O 接口可以分为不同的类型。</p><ol><li><p>按数据传送方式(外设和接口 一侧)，可分 并行接口(一字节或 一个字的所有位同时传 送)和串行接口(一位 一位地有序传送)，接口要完成数据格式的转换。</p></li><li><p>按主机访问 I/ O 设备的控制方式，可分为程序查询接口、中断接口和 DMA 接口等。</p></li><li><p>按功能选择的灵活性，可分为可编程接口(通过编程改变接口功能)和不可编程接口。</p></li></ol><h3 id="i-o-端口及其编址" tabindex="-1">I/O 端口及其编址 <a class="header-anchor" href="#i-o-端口及其编址" aria-label="Permalink to &quot;I/O 端口及其编址&quot;">​</a></h3><p>I/O 端口是指 I/0 接口电路中可被 CPU 直接访问的寄存器，主要有数据端口、状态端口和控 制端口。</p><blockquote><p>端口和接口是两个不同的概念，端口是指接口电路中可以进行读/写的寄存器。</p></blockquote><p>I/O 端口要想能够被 CPU 访问，就必须要对各个端口进行编址，每个端口对应一个端口地址。而对 I/O 端口的编址方式有与存储器独立编址和统一编址两种。</p><ol><li>独立编址</li></ol><p>独立编址也称 I/O 映射方式，是指对所有的 I/O 端口单独进行编址。I/O 端口的地址空间与主存地址空间是两个独立的地址空间，它们的范围可以重叠，相同地址可能属于不同的地址空间。因此需设置专门的 I/O 指令来表明访问的是 I/O 地址空间，I/O 指令的地址码给出 1/O 端口号。</p><ol start="2"><li>统一编址</li></ol><p>统一编址也称存储器映射方式，是指把主存地址空间分出一部分给 I/O 端口进行编址，I/0 端口和主存单元在同一地址空间的不同分段中，根据地址范围就能区分访问的是 I/O 端口还是主存单元，因此无须设置专门的 I/O 指令，用统一的访存指令就可访问 1/O 端口。</p><h2 id="i-o-方式" tabindex="-1">I/O 方式 <a class="header-anchor" href="#i-o-方式" aria-label="Permalink to &quot;I/O 方式&quot;">​</a></h2><p>输入/输出系统实现主机与 I/O 设备之间的数据传送，可以采用不同的控制方式，各种方式在代价、性能、解决间题的着重点等方面各不相同，常用的 I/0 方式有程序查询、程序中断和 DMA 等，其中前两种方式更依赖于 CPU 中程序指令的执行</p><h3 id="程序查询方式" tabindex="-1">程序查询方式 <a class="header-anchor" href="#程序查询方式" aria-label="Permalink to &quot;程序查询方式&quot;">​</a></h3><p>程序查询方式的工作流程如下:</p><ol><li><p>CPU 执行初始化程序，并预置传送参数。</p></li><li><p>向 I/ O 接又发出命令字，启动 I O 设备。</p></li><li><p>从外设接又读取其状态信息。</p></li><li><p>CPU 周期或持续的查询设备状态，直到外设准备就绪。</p></li><li><p>传 送 一次 数 据 。</p></li><li><p>修改地址和计数器参数。</p></li><li><p>判断传送是否结束，若未结束转第 3 步，直到计数器为 0。</p></li></ol><p><img src="'+i+'" alt="alt text"></p><p>根据上述流程 4 中查询方式的不同，程序查询方式可分为如下两类。</p><ol><li><p>独占查询。一旦设备被启动，CPU 就一直持续查询接又状态，CPU 花费 100%的时间用 于 1/O 操作，此时外设和 CPU 完全串行工作。</p></li><li><p>定时查询。CPU 周期性地查询接又状态，每次总是等到条件满足才进行一个数据的传送， 传送完成后返回到用户程序。定时查询的时间间隔与设备的数据传输速率有关</p></li></ol><h3 id="程序中断方式" tabindex="-1">程序中断方式 <a class="header-anchor" href="#程序中断方式" aria-label="Permalink to &quot;程序中断方式&quot;">​</a></h3><h3 id="dma-方式" tabindex="-1">DMA 方式 <a class="header-anchor" href="#dma-方式" aria-label="Permalink to &quot;DMA 方式&quot;">​</a></h3>',32),s=[p];function n(h,c,d,I,O,P){return t(),o("div",null,s)}const b=a(r,[["render",n]]);export{_ as __pageData,b as default};
