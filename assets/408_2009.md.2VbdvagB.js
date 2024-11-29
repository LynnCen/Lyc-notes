import{_ as a,c as e,o as t,aa as o}from"./chunks/framework.CAVwB9kQ.js";const b=JSON.parse('{"title":"2009年408真题","description":"","frontmatter":{},"headers":[],"relativePath":"408/2009.md","filePath":"408/2009.md","lastUpdated":1732873601000}'),p={name:"408/2009.md"},r=o('<h1 id="_2009年408真题" tabindex="-1">2009年408真题 <a class="header-anchor" href="#_2009年408真题" aria-label="Permalink to &quot;2009年408真题&quot;">​</a></h1><h2 id="_1-完全二叉树结点分析" tabindex="-1">1. 完全二叉树结点分析 <a class="header-anchor" href="#_1-完全二叉树结点分析" aria-label="Permalink to &quot;1. 完全二叉树结点分析&quot;">​</a></h2><p>结点总数 = 边数 + 1 = 各节点度数之和</p><h2 id="_2-无向连通图的特性" tabindex="-1">2. 无向连通图的特性 <a class="header-anchor" href="#_2-无向连通图的特性" aria-label="Permalink to &quot;2. 无向连通图的特性&quot;">​</a></h2><p>无向图的度等于顶点数 * 2</p><p>边数大于顶点个数-1 错误 边数 =2 顶点数 = 3</p><p>不存在度为1的顶点</p><h2 id="_3-m阶b树和b-树的区别" tabindex="-1">3. m阶B树和B+树的区别 <a class="header-anchor" href="#_3-m阶b树和b-树的区别" aria-label="Permalink to &quot;3. m阶B树和B+树的区别&quot;">​</a></h2><p>叶子结点</p><p>b树：所有叶子结点都处于同一层</p><p>b+数：叶子结点包含所有关键字信息，起到索引的作用，并且通过链接指针连起来</p><h2 id="_4-插入排序" tabindex="-1">4. 插入排序 <a class="header-anchor" href="#_4-插入排序" aria-label="Permalink to &quot;4. 插入排序&quot;">​</a></h2><p>直接插入，折半插入</p><p>希尔排序，每趟不可确定一个元素的最终位置</p><h2 id="_5-浮点数的运算" tabindex="-1">5. 浮点数的运算 <a class="header-anchor" href="#_5-浮点数的运算" aria-label="Permalink to &quot;5. 浮点数的运算&quot;">​</a></h2><p>对阶 （小阶向大阶看齐）阶码相等</p><p>尾数加减（注意隐含位）</p><p>尾数规格化（左归右归）</p><p>尾数舍入（丢失精度）不影响结果是否溢出</p><p>溢出判断</p><h2 id="_6-相对寻址" tabindex="-1">6. 相对寻址 <a class="header-anchor" href="#_6-相对寻址" aria-label="Permalink to &quot;6. 相对寻址&quot;">​</a></h2><p>PC + ‘1’ + 偏移量（补码）</p><h2 id="_7-外部中断和内部中断" tabindex="-1">7. 外部中断和内部中断 <a class="header-anchor" href="#_7-外部中断和内部中断" aria-label="Permalink to &quot;7. 外部中断和内部中断&quot;">​</a></h2><p>故障，异常，中断</p><h2 id="_8-数据传输速率" tabindex="-1">8. 数据传输速率 <a class="header-anchor" href="#_8-数据传输速率" aria-label="Permalink to &quot;8. 数据传输速率&quot;">​</a></h2><p>奈奎斯特定理：</p><p>极限码元传输速率为 2W（波特率） W为信道频率带宽 V表示码元的离散点平数</p><p>理想情况极限数据传输速率 = 2W log2V （b/s）</p><p>香农定理：</p><p>信道极限数据传输速率 = Wlog2(1 + S/N)</p><p>信噪比 = 10 log10(S/N)</p><p>最大速率需要对比是否为理想信道 算出奈式准则下的速率和香农速率 综合对比</p><h2 id="_9-ftp" tabindex="-1">9. FTP <a class="header-anchor" href="#_9-ftp" aria-label="Permalink to &quot;9. FTP&quot;">​</a></h2><p>基于TCP</p><p>控制链接21，在整个会话期间保持打开（持久）</p><p>数据链接 20（非持久）</p><h2 id="_10-指令执行" tabindex="-1">10. 指令执行 <a class="header-anchor" href="#_10-指令执行" aria-label="Permalink to &quot;10. 指令执行&quot;">​</a></h2><blockquote><p>ADD (R1), R0 功能为将 (R0) + ((R1)) 结果存入 (R1) 功能描述：将寄存器R0中的内容与寄存器R1中的内容所指主存单元相加，并将结果存入寄存器R1所指的主存单元中 | 时钟 | 功能 | 有效控制信号 | | C1 | MAR &lt;- (PC)| PCout,MARin | | C2 | MDR &lt;- M(MAR), PC &lt;- (PC) + 1| MDRin,MemR,PC+1 | | C3 | IR&lt;-(MDR)| MDRout,IRin | | C4 | 指令译码| | | C5 | MAR &lt;- (R1) | R1out,MARin | | C6 | MDR &lt;- M(MAR)| MARout,MDRin.MemR | | C7 | A &lt;- (MDR) | MDRout,Ain | | C8 | ALU &lt;- (A) + (R0) | Aout,R0out,ALUin | | C9 | AC &lt;- ALU | ALUout,ACin | | C10 | MDR &lt;- (AC)| ACout,MARin | | C11 | M(MAR) &lt;- (MDR) | MDRout,MemW |</p></blockquote><h2 id="_11-io控制方式" tabindex="-1">11. IO控制方式 <a class="header-anchor" href="#_11-io控制方式" aria-label="Permalink to &quot;11. IO控制方式&quot;">​</a></h2><blockquote><p>CPU用于该IO控制方式的IO时间占整个CPU时间的百分比是多少?</p></blockquote><p>程序轮训方式：</p><p>中断方式：每秒钟产生多少次中断 * 处理中断所需时钟周期数 / 主频</p><p>DMA方式：每秒钟产生多少次DMA请求 * 处理DMA所需时钟周期数 / 主频</p><h2 id="_12-信号量" tabindex="-1">12. 信号量 <a class="header-anchor" href="#_12-信号量" aria-label="Permalink to &quot;12. 信号量&quot;">​</a></h2><p>缓冲区的访问 需要互斥mutex，缓冲区的容量empty = N</p><p>同步问题 p1 = 0，p2=0</p><h2 id="_13-路由表" tabindex="-1">13. 路由表 <a class="header-anchor" href="#_13-路由表" aria-label="Permalink to &quot;13. 路由表&quot;">​</a></h2><p>路由表结构：目的ip 子网掩码 下一跳ip 接口</p><p>域名服务器的子网掩码为255.255.255.255</p><p>默认路由目的ip：0.0.0.0 子网掩码：0.0.0.0</p>',50),l=[r];function i(h,n,d,_,c,s){return t(),e("div",null,l)}const R=a(p,[["render",i]]);export{b as __pageData,R as default};
