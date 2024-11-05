import{_ as p,c as l,o as t,aa as o}from"./chunks/framework.CAVwB9kQ.js";const A=JSON.parse('{"title":"强化","description":"","frontmatter":{},"headers":[],"relativePath":"组成原理/强化.md","filePath":"组成原理/强化.md","lastUpdated":1730802803000}'),a={name:"组成原理/强化.md"},i=o('<h1 id="强化" tabindex="-1">强化 <a class="header-anchor" href="#强化" aria-label="Permalink to &quot;强化&quot;">​</a></h1><h2 id="第一章" tabindex="-1">第一章 <a class="header-anchor" href="#第一章" aria-label="Permalink to &quot;第一章&quot;">​</a></h2><p><strong>1. 翻译程序、解释程序、汇编程序、编译程序的区别和联系是什么?</strong></p><p>翻译程序有两种:一种是编译程序，它将高级语言源程序一次全部翻译成目标程序，只要源程序不变，就无须重新翻译。 另一种是解释程序，它将源程序的 一条语句翻译成对应的机器目标代码，并立即执行，然后翻译下一条源程序语句并执行，直至所有源程序语句全部被翻译并执行 完。所以解释程序的执行过程是翻译一句执行一句，并且不会生成目标程序。</p><p>汇编程序也是 一种语言翻译程序，它把汇编语言源程序翻译为机器语言程序。</p><p>编译程序与汇编程序的区别:若源语言是诸如C、C++、Java等“高级语言”，而目标语言是 诸如汇编语言或机器语言之类的 “ 低级语言”，则这样的一 个翻译程序称为编译程序。若源语言 是汇 编语言，而目标语言是机器语言，则这样的一 个翻译程序称为汇编程序。</p><p><strong>2. 字长、机器字长、指令字长、存储字长的区别和联系</strong></p><p>字长是指CPU内部用于整数运算的数据通路的宽度，因此字长等于CPU内部用于整数运算的运算器位数和通用寄存器宽度。</p><p>指令字长：一个指令字中包含的二进制代码的位数（半字长指令、双字长指令）</p><p>存储字长：一个存储单元存储的二进制代码的位数</p><p><strong>3. 性能指标</strong></p><p>时钟周期：CPU工作的最小时间单元</p><p>主频 = 1/时钟周期</p><p>CPI：一条指令所需要的时钟周期数</p><p>IPS：每秒执行多少条指令 IPS = 主频 / 平均CPI</p><p>MIPS：每秒执行多少百万条指令 = 主频/ (CPI x 10^6)</p><p>MIPS 百万 10^6 GIPS 十亿 10^9 TIPS 万亿 10^12 PIPS 千万亿 10^15 亿亿10^16</p><p>执行时间 = 指令条数 x CPI / 主频</p><ol start="4"><li>程序员可见寄存器和不可见寄存器</li></ol><p>可见寄存器：通用寄存器组、程序状态字寄存器PSW、程序计数器PC、累加寄存器ACC、栈指针SP</p><p>不可见：指令寄存器IR、暂存寄存器DR、MAR、MDR</p><h2 id="第二章" tabindex="-1">第二章 <a class="header-anchor" href="#第二章" aria-label="Permalink to &quot;第二章&quot;">​</a></h2><ol><li>二进制、八进制和十六进制相互转换</li></ol><p>常见的二进制和十进制数：</p><ul><li>(2^{10} = 1024) ⚠️</li><li>(2^{11} = 2048)</li><li>(2^{12} = 4096)</li><li>(2^{13} = 8192)</li><li>(2^{14} = 16,384)</li><li>(2^{15} = 32,768)</li><li>(2^{16} = 65,536) ⚠️</li><li>(2^{17} = 131,072)</li><li>(2^{18} = 262,144)</li><li>(2^{19} = 524,288)</li><li>(2^{20} = 1,048,576)</li></ul><p>注意带小数的计算：整数部分除基取余法，小数部分乘基取整法上左下右</p><ol start="2"><li>原码、补码、反码、移码</li></ol><p>表示范围（对称性）、0表示（是否唯一）、相互转换</p><p>原码表示范围：-(2^n -1) ~ (2^n -1)，关于原点对称</p><p>0表示有+0和-0之分，不唯一，一般用来表示真值</p><p>补码表示范围：-(2^n) ~ (2^n - 1)，不对称，比原码多一个-2^n</p><p>0表示唯一</p><p>反码表示范围：了解 各位取反</p><p>移码：真值+ 偏置值，0表示唯一</p><p>原码转补码：正数相同，负数原码按位取反末位+1，或者从右往左数第一个1，后续的1都改为0</p><ol start="3"><li>无符号整数和有符号整数的转换</li></ol><p>采用补码表示</p><p>char、short、int、long的位数</p><p>char默认是无符号数，其他默认带符号数，相互类型转换</p><p>大转小（截断），小转大（补位-&gt; 零拓展和符号拓展）</p><ol start="4"><li>运算器部件和加法器的组成</li></ol><p>ALU、移位器、状态寄存器（PSW）、通用寄存器</p><ol start="5"><li>逻辑移位和算术移位</li></ol><p>各自的移位规则？</p><p>带符号数和无符号数分别采用哪种移位？</p><p>移位操作的溢出判断和精度丢失问题</p><ol start="6"><li>加减运算</li></ol><p>注意题目中给的是真值还是机器数（可能为补码）</p><p>减法变加法</p><ol start="7"><li>溢出判断</li></ol><p>溢出的前提：符号相同相加、符号相异相减、</p><p>溢出判断的3种方法：一位符号位、双符号位、</p><ol start="8"><li>OF、SF、ZF、CF所表示的含义</li></ol><p>OF：溢出标志，对无符号数无意义，用于<strong>有符号数</strong>的溢出判断 OF = Cn 异或 Cn-1 符号位进位和最高数位进位异或</p><p>CF：进位标志，对有符号数无意义，用于<strong>无符号数</strong>的溢出判断 CF = Sub 异或 Cout</p><p>ZF：零标志位，均适用。</p><p>SF：符号位，对无符号数无意义</p><ol start="9"><li><p>无符号数和有符号数加减运算后CF和OF的值</p></li><li><p>乘除法运算 error❌</p></li></ol><p>乘法实现原理</p><p>乘法指令溢出判断</p><ol start="11"><li>浮点数的表示格式</li></ol><p>符号 + 尾数 + 基数^阶数</p><p>上溢和下溢判断</p><ol start="12"><li>浮点数的规格化</li></ol><p>左归：尾数左移，阶码-1</p><p>右归：尾数右移，阶码+1</p><ol start="13"><li>IEEE754标准</li></ol><p>单精度浮点数格式（32位）：1一位符号位，8位阶码，23位尾数（最高位隐含1所以拓展到24位）</p><p>双精度浮点数格式（64位）：一位符号位，11位阶码，52位尾数</p><p>阶码使用移码e表示（真值+偏置值127） 1～254，真值范围-126 ～ 127</p><p>单精度最小值和最大值</p><p>1.0 x 2^-126 1.111111... x 2^127 = (2-2^-23) x 2^127</p><p>阶码全0全1的含义（正零、负零、正无穷、负无穷）</p><p>0.23个11如何表示？ 2-2^-23</p><p>非规格化数的满足条件：阶码全0 尾数不为0</p><p>非规格化正数和负数：尾数 x 2^-126</p><ol start="14"><li>浮点数的加减运算</li></ol><p>对阶 （小阶向大阶看齐）阶码相等</p><p>尾数加减（注意隐含位）</p><p>尾数规格化（左归右归）</p><p>尾数舍入（丢失精度）不影响结果是否溢出</p><p>溢出判断</p><ol start="15"><li>类型转换后数值变化</li></ol><p>int转float：float所表示的范围比int大得多，所以float能表示int，但float23位尾数不能表示int32位尾数，存在精度丢失。</p><p>int转double或 float转double：double所表示的范围以及尾数精度都要比int和float所表示的大，故能完全表示</p><p>double转float：float所表示的范围更小，故可能发生溢出和精度丢失</p><p>float或者double转int：大范围转小范围存在溢出截断和精度丢失</p><ol start="16"><li>数据的大端小端存储</li></ol><p>大端方式：先高字节，再低字节</p><p>小端方式：先低字节，再高字节</p><ol start="17"><li>对齐方式</li></ol><p>边界对齐：</p><p>边界不对齐：</p><h2 id="第三章" tabindex="-1">第三章 <a class="header-anchor" href="#第三章" aria-label="Permalink to &quot;第三章&quot;">​</a></h2><ol><li>随机存储器RAM、只读ROM</li></ol><p>存取方式、读写方式、断电后信息是否可保存（易失性）</p><ol start="2"><li>SRAM和DRAM的原理</li></ol><p>六晶体MOS管，栅极电容（定期充电也就是刷新）</p><p>DRAM需要读后再生和定期刷新，集中刷新、分散刷新、异步刷新，行列地址分两次送，</p><ol start="3"><li>DSRAM容量计算</li></ol><p>地址线复用技术：行地址和列地址通过相同的引脚分先后两次输入，地址引脚线可减少一半</p><p>按行刷新，故行列尽可能相同，行数 &lt;= 列数</p><ol start="4"><li>存储体、存储阵列，多模块存储器的关系是什么</li></ol><p>层次关系：存储体是一个总的概念，而存储阵列和多模块存储器是存储体的具体实现形式。存储阵列可以包含多个存储体（如多个硬盘），而多模块存储器则是通过将多个内存模块组合在一起来提高性能。</p><p>协同作用：在实际应用中，多模块存储器可以作为存储体的一部分，通过存储阵列的方式来优化性能和可靠性。比如，一个服务器可能使用多模块的内存与硬盘阵列相结合，以满足高性能和数据安全的需求。</p><ol start="5"><li>多模块存储器</li></ol><p>高位交叉编址：地址的高位部分决定了数据存储在哪个模块</p><p>低位交叉编址：地址的低位部分决定了数据存储在哪个模块</p><p>每隔1/m个存储周期启动各模块，</p><p>访存冲突分析，对同一个模块的访问出现在一个周期内，则会出现冲突</p><ol start="6"><li>CPU和主存的链接</li></ol><p>地址线、数据线、片选控制线或线选控制线</p><ol start="7"><li>主存容量的扩充</li></ol><p>4M x 8位</p><p>字扩展（高），位拓展（宽），字位同时拓展</p><p>故需要增加额外的线：选择存储芯片，进行片选</p><p>线选法：每个片一个线来控制是否选中 为0选中 其余为1 4片则需要4根线</p><p>译码片选法：2^n 个信号 （n为高位 用于产生片选信号）</p><p>地址范围、容量的计算以及对应关系</p><p>地址范围计算 0000 0000 ～ 0003 FFFF的地址范围大小</p><p>确定某地址 在哪块芯片</p><p>设按字节编址，2Kx4位 组成8kx8位 确定0B1FH的芯片最小地址</p><p>题目并未给出地址范围 但组成8Kx8位 按字节编址 每两块并联组成2Kx8位 可以确定寻址的范围 2^13</p><p>13位地址 2位确定哪一组芯片 1一位确定哪一块芯片 剩余10位为芯片内地址</p><p>第一组：0000 0000 0000 0000 ～ 0000 0111 1111 1111 = 0000H～07FFH</p><p>第二组：0000 1000 0000 0000 ～ 0000 1111 1111 1111 = 0800H ～ 0FFFH</p><p>第三组：0001 0000 0000 0000 ～ 0001 0111 1111 1111 = 1000H ～ 17FFH</p><p>第四组：0001 1000 0000 0000 ～ 0001 1111 1111 1111 = 1800H ～ 1FFFH</p><p>0B1F = 0000 1011 0001 1111 0000 1 位于第2组 最小地址为0800H</p><p>错误解法：未确定地址位数，直接将高地址2位默认为组号</p><ol start="8"><li>磁盘存储器的组成和性能指标</li></ol><p>驱动器 控制器 磁道 盘面 扇区</p><p>道密度、位密度、面密度</p><ol start="9"><li>存取时间的计算</li></ol><p>过程：先移动磁头道指定磁道上，确定盘面，最后旋转到指定扇区，最后读取数据</p><p>地质结构：柱面号（磁道号）+ 盘面号 + 扇区号</p><p>t = 寻道时间 + 旋转时间 + 传输时间</p><p>转速和时间t的关系？</p><p>数据传输速率 = R（转速）* N（磁道的容量）</p><ol start="10"><li>高速缓存cache</li></ol><p>局部性原理：时间局部性和空间局部性（学会分析）</p><p>时间局部性：某个单元经常被访问</p><p>空间局部性：访问某个单元时，其相邻的其他单元也即将被访问</p><p>数据查找：</p><p>宏观：cache-&gt;内存-&gt;磁盘</p><p>微观：有物理地址根据cache映射关系解析地址，根据映射关系找到对应行或组，对比标记位找到指定单位，查看有效位，根据块内地址取出对应单元，若根据映射关系对比标记位时不匹配，则cache缺失，利用替换策略换入。</p><p>直接映射 标记 行号 块内地址</p><p>全相联：标记 块内</p><p>组相联：标记 组号 块内</p><p>地址映射:物理地址结构（先确定cache的映射关系）</p><p>替换策略：cache行已满，此时访问新的内存块，需要换入并将选中一个cache行换出</p><p>先进先出FIFO：本质上就是队列</p><p>最近最少使用LRU：确定cache行数 访问时从后往前看</p><p>最不常使用LFU</p><p>写入策略：执行一个写操作时，该单元已在cahhe中，写cache，还是同时写cahche和内存，如果写操作的对应单元不在caache中时，写对应的主存单元，针对是否将该单元掉入cache分为写分配和非写分配，写分配根据局部性原理会将该主存单元掉入cache中，非写分配不会掉入cache。</p><p>全写：同时写cache和内存</p><p>回写：只写cache</p><p>cache的基本工作原理和流程：利用局部性原理，将常访问的内存部分副本放在离CPU近的地方，以解决CPU和内存速度不匹配的问题，基本流程就是数据查找的过程，如上分析。</p><p>cache中存储的仅是内存中较活跃的副本</p><p>cache命中率的计算：命中的次数 / 访问总次数（注意区分读写次数）</p><p>CPU平均访存时间的计算：访存时间即为cache缺失转而访问内存所花费的时间，cache缺失率 x 访问总次数 x 单次访存时间</p><ol start="11"><li>cache和主存的映射方式</li></ol><p>直接相联（放入指定行）： 标记 行号 块内地址</p><p>全相联（随意放）：标记 块内</p><p>组相联（先分组 组内随意放）：标记 组号 块内</p><p>访问过程</p><p>比较器的个数：直接相联仅需要一个比较器、全相联每行都需要一个比较器，组相连行间仅设置一个比较器，组内根据组数设置对应组数个比较器。</p><p>计算cache地址结构的位数和总容量</p><p>cache行所存储的内容：有效位、标记位、替换位、脏位、数据</p><ol start="12"><li>cache中主存块的替换算法</li></ol><p>直接映射无需替换算法</p><p>常见的替换算法：算机算法（RAND）、FIFO（先进先出）、LRU（最近最少使用）、LFU（最不常用）</p><p>LRU替换位位数的计算：全相联（log2行数）、 组相连（log2组内数）</p><ol start="13"><li>一致性问题（回写位）</li></ol><p>cache写操作命中：全写法和回写法</p><p>cache写操作不命中：写分配法和非写分配法</p><ol start="14"><li>虚拟存储器</li></ol><p>虚拟地址和物理地址的转换</p><p>编译阶段：编译器将源代码转换为目标代码，生成相对地址（从0开始），但这些地址并不是真正的虚拟地址</p><p>链接阶段：链接器将多个目标文件合并，并处理外部引用。此时，仍然使用的是逻辑地址，而不是虚拟地址</p><p>装入阶段：在这一阶段，操作系统将程序加载到内存中，并为其分配虚拟地址空间。虚拟地址在此阶段被分配，并建立虚拟地址到物理地址的映射</p><p>虚拟地址是在装入阶段产生的</p><ol start="15"><li>页表虚拟存储器</li></ol><p>虚拟地址</p><p>普通：页号 页内地址</p><p>带页目录：页目录号 页号 页内地址</p><p>地址位数的计算：确定虚拟地址的位数，页的大小，是否带页目录</p><p>虚拟地址：页目录号 页号 页内偏移</p><p>物理地址：页框号 + 页内偏移</p><p>页目录项的组成 ：（隐藏页号）、有效位、修改位、替换位、存取权限位、页框号</p><p>页号是固定的 里面存放的页框号不固定 如存在页面替换算法 将某个页号的内容替换为其他页框号</p><p>带TLB的查找过程：根据</p><p>TLB的地址组成（TLB采用组相连或者全相连映射）：标记 组号 页内地址 / 标记 页内地址</p><p>TLB中的内容仅仅是页表的副本</p><p>cache和TLB中存放的都是page的副本</p><p>cache、TLB和page缺失组合分析：只要page未命中、其余均未命中</p><p>大题考数组的分页存储和缺页分析：<code>int A[1024][1024]</code> 确定数组A的起始地址，页的大小（4K），确定多少个数据占一页(4Bx1024 = 4K 1024个数据占一页)，数组A占两页，再分析TLB的大小和cache的大小，计算哪几块会被调入从而避免访存。</p><ol start="16"><li>段式虚拟存储器</li></ol><p>按程序逻辑分段</p><p>地址结构： 段号 段内地址</p><p>根据段表基址寄存器 + 段号 找到对应的段表项</p><p>段表项的内容： 段首地址 装入位 段长</p><p>段首地址 + 段内地址 = 物理地址</p><p>存在两个越界判断：1、找对应的段表项 2、根据段长判断段内地址是否超出该段</p><ol start="17"><li>段页式虚拟存储器</li></ol><p>先把程序逻辑分段 再把段分固定大小的页</p><p>虚拟地址 = 段号 页号 页内地址偏移</p><p>寻址过程：</p><p>根据段表基址寄存器 + 段号 找到对应的段表项（并判断是否越界）</p><p>取出该段表项中的页表地址 + 页号 = 页框号</p><p>页框号 + 页内偏移 = 物理地址</p><ol start="18"><li>CISC和RISC</li></ol><p>CISC复杂指令集，长度不等，采用微程序控制器，通用寄存器少</p><p>RISC精简指令集，长度固定，采用硬布线控制。通用寄存器多</p><p>CISC和RISC的对比</p><h2 id="第四章" tabindex="-1">第四章 <a class="header-anchor" href="#第四章" aria-label="Permalink to &quot;第四章&quot;">​</a></h2><p>CPU如何区分指令和数据的？:CPU在指令执行的不同阶段区分，例如取指、间址、</p><ol><li>指令地址的格式&amp;根据指令格式生成对应的机器码</li></ol><p>对应的机器码涉及到地址范围的采用补码形式！！！</p><p>地址位数和寻址范围：</p><p>| 操作码 | 地址 |</p><p>操作码用来标识<strong>进行何种操作</strong> 地址字段给出进行该操作所需要的<strong>数据</strong>等信息</p><ol start="2"><li>指令字长</li></ol><p>单字长 半字长 双字长指令（针对于机器字长）</p><ol start="3"><li>指令格式</li></ol><p>零地址：空操作、中断隐指令</p><p>一地址、二地址、三地址、四地址</p><p>根据各地址格式分析访存次数：访存次数需要确定寻址方式</p><ol start="4"><li>拓展指令格式和定长操作码</li></ol><p>定长操作码表明了系统可表示最大多少条指令2^n(n为高位)</p><p>采用可变操作码进行拓展指令格式</p><p>主要思想和计算机网络的子网划分一致，任何短码不不是长码的前缀</p><p>例如某指令系统需要15条三地址、15条2地址、15条1地址、16条0地址</p><p>从三地址开始设置操作码 因为三地址的操作码最短，15条需要</p><p>三地址：0000～1110</p><p>二地址：1111 0000 ～ 1111 1110</p><p>一地址：1111 1111 0000 ～ 1111 1111 1110</p><p>0地址： 1111 1111 1111 0000 ～ 1111 1111 1111 1111</p><p>零地址、一地址...对应子网号</p><ol start="5"><li>操作码类型</li></ol><p>数据传送、算术和逻辑运算、移位取反、转移等</p><blockquote><p>区分跳转指令、调用指令、返回指令、条件转移指令的区别</p></blockquote><p>详情看：指令</p><ol start="6"><li>指令的寻址方式（区分指令寻址和数据寻址）</li></ol><p>指令寻址：确定下一条待执行指令的地址</p><p>数据寻址：确定本条指令所需数据地址（解析地址码字段含义即数据寻址）</p><p>指令寻址 = 指令寻址 + 数据寻址</p><p>CPU执行一条指令都是根据PC中的内容取出该条指令的地址 从而进入取指阶段</p><ol start="7"><li>指令寻址(PC自增大小和编址方式、指令字长的关系)</li></ol><p>顺序寻址： PC+1（此处的1应为一条指令的长度 所以得确定编址方式 例如按字节编址 指令字长16 则pc+2）</p><p>跳跃寻址：使用转移指令实现，分为绝对转移（直接给出地址），相对转移（PC+偏移），目的都是修改pc的值，下一条指令的地址仍然由pc给出</p><ol start="8"><li>数据寻址</li></ol><blockquote><p>寻址特征的作用（区分操作码）</p></blockquote><p>计算操作数的地址，使用寻址特征字段来表示属于那种寻址方式。</p><p>| 操作码 | 寻址特征 ｜ 形式地址 |</p><p>隐含寻址：隐含操作数的地址 ADD 寻址特征 操作数（A）另一个操作数在ACC中</p><p>立即数寻址：A即为操作数本身 op 寻址特征 操作数本身A</p><p>直接寻址：A的操作的内存地址 需要访存1次 (A)</p><p>间接寻址：A给的操作数地址的地址 需要访存2次 ((A))</p><p>寄存器寻址：A给出的是寄存器的编号 寄存器内的内容即为操作数 访问寄存器不需要访存 reg(A)</p><p>寄存器间接寻址：A给出的是寄存器的编号 寄存器内的内容为操作数的地址 访问寄存器不需要访存 需要访存1次 mem(reg(A))</p><p>‼️ 相对寻址：pc + 相对偏移量（补码给出）（计算偏移量和目标地址） <code>pc + “1” + A</code> 广泛用于转移指令，有利于程序浮动</p><p>基址寻址：基址寄存器BR的内容 + A （基址寄存器的内容不变 由os指定 A可变 一般用于多道程序设计）</p><p>为什么可用于多道程序？因为程序一般会经过编译、链接、装入，装入过程中形成的逻辑地址，装入到内存中时，需要记录起始物理地址，一般用用一个通用寄存器作为基址寄存器存放该物理地址，进程的PCB中也可记录该寄存器，在多道程序并发中，可改变基址寄存器的值实现并发。</p><p>变址寻址：变址寄存器IX的内容 + A （变址寄存器的内容可变 由用户指定 A不变 一般用于循环和数组）</p><p>在数组访问中，变址寄存器设为数组的偏移量，形式地址为数组的首地址</p><p>相对、基址、变址称为偏移寻址</p><p>堆栈寻址：硬堆栈（寄存器）和软堆栈（内存）堆栈指针SP</p><ol start="9"><li>汇编指令</li></ol><p>常见的寄存器表示 E开头 EAX EBX</p><p>汇编指令的格式 AT&amp;T和Intel格式 （只需要掌握Intel）</p><p>不区分大小写</p><p>第一个为源操作数、第二个为目的操作数 从左到右</p><p>表示寄存器和立即数不需要加前缀</p><p>内存寻址<code>[x]</code> <code>[edx + eax*2 + 8]</code></p><p>指定数据长度b、w、l、（byte ptr word ptr dword ptr）</p><p>mov</p><p>push 将操作数压入内存的栈，ESP代表栈顶，入栈前，ESP先减“4”（栈的增长方向和内存地址增长方向相反）</p><p>pop指令 出栈 ESP +</p><p>add/sub指令</p><p>shl/shr 逻辑移位</p><p>jump 转移指令 IP（指定位置）</p><p>jcondition 条件转移指令</p><p>cmp/test指令</p><p>call/ret</p><p>选择语句的机器级表示 jump 跳转指令 cmp指令</p><p>循环语句的机器级表示 cmp jd</p><p>过程调用的机器级表示：（王道视频课二刷）</p><p>准备阶段 上一个栈的esp指针放入ebp中 完成清栈 指向栈底 方便获取入口参数</p><p>过程体</p><p>结束阶段</p>',291),e=[i];function c(r,s,n,h,d,P){return t(),l("div",null,e)}const F=p(a,[["render",c]]);export{A as __pageData,F as default};
