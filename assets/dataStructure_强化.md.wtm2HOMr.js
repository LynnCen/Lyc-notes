import{_ as a,c as p,o as s,aa as i}from"./chunks/framework.CAVwB9kQ.js";const E=JSON.parse('{"title":"数据结构强化","description":"","frontmatter":{},"headers":[],"relativePath":"dataStructure/强化.md","filePath":"dataStructure/强化.md","lastUpdated":1729583044000}'),n={name:"dataStructure/强化.md"},l=i(`<h1 id="数据结构强化" tabindex="-1">数据结构强化 <a class="header-anchor" href="#数据结构强化" aria-label="Permalink to &quot;数据结构强化&quot;">​</a></h1><h2 id="第一章" tabindex="-1">第一章 <a class="header-anchor" href="#第一章" aria-label="Permalink to &quot;第一章&quot;">​</a></h2><p><strong>时间复杂度和空间复杂度的计算</strong></p><p><strong>时间复杂度</strong>：一个语句在算法中被重复执行的<strong>次数</strong></p><p>常见形式：</p><p>1️⃣ 阶乘n!：1<em>2</em>...*n ，时间复杂度O(n)</p><p>2️⃣ 单个循环++：O(n)</p><p>3️⃣ 单个循环i*2: O(logn)</p><p>4️⃣ 双循环i与j无关联：O(n^2)</p><p>5️⃣ 双循环i与j关联：计算总次数</p><p>无论哪种形式 穷举各层的执行次数即可</p><h2 id="第二章-线性表" tabindex="-1">第二章 线性表 <a class="header-anchor" href="#第二章-线性表" aria-label="Permalink to &quot;第二章 线性表&quot;">​</a></h2><p>大题算法题的重点！首选暴力解</p><h3 id="线性表-顺序表示" tabindex="-1">线性表（顺序表示） <a class="header-anchor" href="#线性表-顺序表示" aria-label="Permalink to &quot;线性表（顺序表示）&quot;">​</a></h3><p>线性表的数据结构定义</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MaxSize</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 50</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 动态分配</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typeof </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ElemType </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">data;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MaxSize, length;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}SqList;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 静态分配</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typeof </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ElemType </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[MaxSize];</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> length;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}Sqlist</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>插入：插入i位置 i之后的元素依次后移一个位置，从后表尾开始遍历直到i的位置</p><p>删除：删除第i个位置元素，后续元素前移一个位置 和查找</p><p>位序和数组下标的区别：位序从1开始，数组下标从0开始</p><p>带头节点和不带头节点的区别：带头节点方便操作</p><h3 id="链式表示" tabindex="-1">链式表示 <a class="header-anchor" href="#链式表示" aria-label="Permalink to &quot;链式表示&quot;">​</a></h3><p>单链表的定义</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typeof </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LNode{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ElemType data;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LNode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}LNode,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">LinkList</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>双链表的定义</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typeof </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DLNode{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ELemType data;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DLNode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">next,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">prior;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}DLNode,</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">DLinkList</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>循环单链表：单链表的最后一个元素的指针值指向首元素</p><p>带头节点循环单链表如何判空？<code>head-&gt;next = head</code></p><p>循环双链表：尾节点的next指针指向首节点 首节点的prior指向尾节点</p><p>静态链表：数组的下标作为指针</p><p>基本操作：插入、删除和查找</p><h2 id="第三章-栈和队列" tabindex="-1">第三章 栈和队列 <a class="header-anchor" href="#第三章-栈和队列" aria-label="Permalink to &quot;第三章 栈和队列&quot;">​</a></h2><p>选择题和应用题</p><h3 id="栈" tabindex="-1">栈 <a class="header-anchor" href="#栈" aria-label="Permalink to &quot;栈&quot;">​</a></h3><p>栈的基本概念 LIFO</p><p>栈的顺序存储数据结构</p><div class="language-c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#define</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Maxsize</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typeof </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">struct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  Elemtype </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[Maxsize];</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> top;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}SqStack</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>栈的基本操作：</p><p>入栈先++ 再入栈(因为top指向栈顶元素，故需先将top++再使用top)</p><p>出栈先弹出栈顶元素，后--</p><p>栈满和栈空判断</p><p>共享栈（判断栈满）：栈底在两端，栈顶往中间靠</p><p>栈的链式存储数据结构：栈顶元素在表头，所有操作都在表头进行</p><h3 id="队列" tabindex="-1">队列 <a class="header-anchor" href="#队列" aria-label="Permalink to &quot;队列&quot;">​</a></h3><p>基本概念（FIFO）</p><p>队列的顺序存储数据结构</p><p>入队：先送值到队尾元素，再将队尾指针加1 rear++</p><p>出队：先取队尾元素，再将队头指针++</p><p>判断队空和队满（什么是假溢出）</p><p>循环队列（解决假溢出）</p><p>循环队列判断队空：<code>Q.front == Q.rear</code></p><p>循环队列判断队满的三种方式 <code>(Q.rear+1)% MaxSize == Q.front</code></p><p>循环队列入队：<code>Q.rear = (Q.rear + 1)% MaxSize</code></p><p>循环队列出队：<code>Q.front == (Q.front + 1)% MaxSize</code></p><p>队列的链式存储（带头节点和不带头节点）</p><p>双端队列</p><h3 id="栈和队列的应用" tabindex="-1">栈和队列的应用 <a class="header-anchor" href="#栈和队列的应用" aria-label="Permalink to &quot;栈和队列的应用&quot;">​</a></h3><p>栈在括号匹配中的应用</p><p>栈在表达式求值中的应用（计算栈的深度和栈中元素）区分操作符和操作数</p><p>中缀转后缀、后缀表达式求值</p><p>栈在递归中的应用</p><p>队列在层次遍历中的应用</p><p>队列在计算机系统中的应用（buffer、就绪队列、阻塞队列）</p><h2 id="数组和特殊矩阵" tabindex="-1">数组和特殊矩阵 <a class="header-anchor" href="#数组和特殊矩阵" aria-label="Permalink to &quot;数组和特殊矩阵&quot;">​</a></h2><p>特殊矩阵的压缩存储</p><p>按行或列优先存储，计算下标（不用背公式，直接穷举），注意区分下标从0还是从1开始</p><p>三角矩阵和三对角矩阵存储</p><p>稀疏矩阵的存储：三元组（行标i，列标j，值a；还需要保存稀疏矩阵的行数、列数和非零元素的个数），十字链表存储</p><h2 id="第四章-串" tabindex="-1">第四章 串 <a class="header-anchor" href="#第四章-串" aria-label="Permalink to &quot;第四章 串&quot;">​</a></h2><p>简单模式匹配算法 需要后退次数 时间复杂度O(mn)</p><p>KMP算法： 先计算部分比配值，再将其右移再加1，得到next数组，时间复杂度O(m+n),主串不回退</p><p>求nextval数组（复杂）如何记忆？</p><h2 id="第五章-树与二叉树" tabindex="-1">第五章 树与二叉树 <a class="header-anchor" href="#第五章-树与二叉树" aria-label="Permalink to &quot;第五章 树与二叉树&quot;">​</a></h2><p>考点：树的基本概念、二叉树的定义和基本特征、二叉树的顺序存储结构和链式存储结构、二叉树的遍历、线索二叉树构造、树的存储结构、森林与二叉树的转换、树和森林的遍历、树与二叉树的应用（哈夫曼树、哈夫曼编码、并查集）</p><h3 id="树的基本概念" tabindex="-1">树的基本概念 <a class="header-anchor" href="#树的基本概念" aria-label="Permalink to &quot;树的基本概念&quot;">​</a></h3><p>结点树n = 分支数 + 1 = n1 + 2n2 + ... + 1 = n0 + n1 + n2 + ...</p><p>分支数 = 树中各结点的度之和</p><p>树的最大高度（满m叉树）和最小高度（上1下m）</p><h3 id="二叉树的概念" tabindex="-1">二叉树的概念 <a class="header-anchor" href="#二叉树的概念" aria-label="Permalink to &quot;二叉树的概念&quot;">​</a></h3><p>满二叉树的定义、结点总数、各层的结点数</p><p>完全二叉树定义、高度、叶子结点出现的情况、</p><p>二叉排序树</p><p>平衡二叉树</p><p>正则二叉树</p><p>结点总数 = n0 + n1 + n2 n0 = n2 + 1</p><h3 id="二叉树的存储结构" tabindex="-1">二叉树的存储结构 <a class="header-anchor" href="#二叉树的存储结构" aria-label="Permalink to &quot;二叉树的存储结构&quot;">​</a></h3><p>顺序存储：按照层次遍历的顺序依次填入，如果该节点为空则使用0补位（注意下标位置）。</p><p>链式存储（空链域的个数n+1）</p><h3 id="二叉树的遍历" tabindex="-1">二叉树的遍历 <a class="header-anchor" href="#二叉树的遍历" aria-label="Permalink to &quot;二叉树的遍历&quot;">​</a></h3><p>先序遍历（根左右）</p><p>中序遍历（左根右）</p><p>后序遍历（左右根）</p><p>层次遍历（从根开始从左至右扫描，需要使用队列）</p><p>中 + 其余三种遍历中任意一种 即可唯一确定一棵树</p><p>如果无中 则无法唯一确定一棵树</p><p>递归和非递归的转换（利用栈）</p><h3 id="线索二叉树" tabindex="-1">线索二叉树 <a class="header-anchor" href="#线索二叉树" aria-label="Permalink to &quot;线索二叉树&quot;">​</a></h3><p>线索二叉树的数据结构 ltag和rtag的含义 0表示孩子 1表示前驱或者后继</p><p>使用二叉树遍历算法的到遍历序列 按照序列前后关系确定线索指针</p><h2 id="树和森林" tabindex="-1">树和森林 <a class="header-anchor" href="#树和森林" aria-label="Permalink to &quot;树和森林&quot;">​</a></h2><h3 id="树的存储结构" tabindex="-1">树的存储结构 <a class="header-anchor" href="#树的存储结构" aria-label="Permalink to &quot;树的存储结构&quot;">​</a></h3><ol><li>双亲表示法</li></ol><p>数据结构定义：items：存储值的data，双亲在数组中的下标。双亲即为item[];</p><p>可以很快找到一个结点的双亲，</p><p>但是求一个结点的孩子则需要遍历整个结构 ⚠️</p><ol><li>孩子表示法</li></ol><p>数组存放所有元素item，item：存放数据data，一个链表（表示该结点的孩子）</p><p>解决双亲表示法找孩子节点需要遍历整个结构，故使用一个链表来存储孩子节点</p><p>但是找一个结点的双亲很困难，需要遍历整个结构中的链表，寻找该结点在哪个结点的孩子链表中出现过</p><ol start="3"><li>孩子兄弟表示法（二叉树表示法）</li></ol><p>数据data，左孩子指针，右孩子指针</p><p>实现树与二叉树的转换，便于查找结点的孩子，找双亲困难</p><h3 id="树、森林、二叉树的转换" tabindex="-1">树、森林、二叉树的转换 <a class="header-anchor" href="#树、森林、二叉树的转换" aria-label="Permalink to &quot;树、森林、二叉树的转换&quot;">​</a></h3><p>左孩子右兄弟</p><h3 id="森林和树的遍历" tabindex="-1">森林和树的遍历 <a class="header-anchor" href="#森林和树的遍历" aria-label="Permalink to &quot;森林和树的遍历&quot;">​</a></h3><p>先序和二叉树相同</p><p>树的后根和二叉树的中序遍历相同</p><p>森林中和二叉的中相同</p><h2 id="树和二叉树的应用" tabindex="-1">树和二叉树的应用 <a class="header-anchor" href="#树和二叉树的应用" aria-label="Permalink to &quot;树和二叉树的应用&quot;">​</a></h2><h3 id="哈夫曼树" tabindex="-1">哈夫曼树 <a class="header-anchor" href="#哈夫曼树" aria-label="Permalink to &quot;哈夫曼树&quot;">​</a></h3><ol><li>定义</li></ol><p>路径、路径长度、权值、带权路径长度、WPL（哈夫曼树、最优二叉树）</p><ol start="2"><li>哈夫曼树的构造</li></ol><p>取最小的两个节点的权值相加，将相加之后的权值加入原数据，依次重复</p><ol start="3"><li>哈夫曼树的性质</li></ol><p>1️⃣、每个结点在哈夫曼树中都是叶子结点。</p><p>2️⃣ 新增n-1个结点，哈夫曼树的总结点数为2n-1</p><p>3️⃣ 不存在度为1的结点</p><ol start="4"><li>哈夫曼编码、前缀编码</li></ol><p>任何编码都不是另一个编码的前缀，前缀编码</p><p>左0右1或者左1右0</p><p>哈夫曼树并不唯一，但是WPL唯一</p><p>加权平均长度 = WPL / 权值之和</p><h3 id="并查集" tabindex="-1">并查集 <a class="header-anchor" href="#并查集" aria-label="Permalink to &quot;并查集&quot;">​</a></h3><p>数组下标为个结点的编号，对应的值为其双亲的下标</p><p>优化：小树合并到大树</p><h2 id="第六章-图" tabindex="-1">第六章 图 <a class="header-anchor" href="#第六章-图" aria-label="Permalink to &quot;第六章 图&quot;">​</a></h2><p>掌握图的基本概念、存储结构、遍历、应用</p><h3 id="基本概念" tabindex="-1">基本概念 <a class="header-anchor" href="#基本概念" aria-label="Permalink to &quot;基本概念&quot;">​</a></h3><p>顶点集、边集</p><p>有向图</p><p>无向图</p><p>简单图：不存在重复的边，自己到自己（仅讨论简单图）</p><p>多重图：与简单图相反</p><p>完全图：n(n-1)/2条边（无向图）、n(n-1)条变（有向图）</p><p>子图：</p><p>连通：存在路径</p><p>极大连通子图（连通分量）</p><p>强连通图、强连通分量</p><p>生成树、生成森林</p><p>顶点的度、入度和出度：无向图的度 = 边数的*2 、 有向图的度 = 入度 + 出度</p><p>边的权值和网</p><p>稠密图和稀疏图：</p><p>路径：顶点序列</p><p>路径长度：边数</p><p>回路：</p><h3 id="图的存储及基本操作" tabindex="-1">图的存储及基本操作 <a class="header-anchor" href="#图的存储及基本操作" aria-label="Permalink to &quot;图的存储及基本操作&quot;">​</a></h3><ol><li>邻接矩阵法</li></ol><p>数据结构定义：边表，顶点表</p><p>顶点的度的计算：对矩阵按行遍历非0元素的个数，得到出度，按列遍历，得到入度</p><p>优点：查看两个顶点是否相联很容易O(1)<code>A[i][j]</code></p><p>缺点：确定边的个数，需要遍历矩阵中1的个数</p><p>A^n[i][j]的含义：表示顶点i到顶点j的长度为n的路径的数目</p><p>适合稠密图</p><ol start="2"><li>邻接表法</li></ol><p>数据结构定义：数组存储顶点表（数据、指向第一个弧的的指针），边表（链表）</p><p>适用于稀疏图</p><p>找一个点相邻的边（容易 遍历该点的邻接表）</p><p>确定两个顶点间是否存在边（遍历该点的邻接表）</p><p>求某个顶点的度 只需计算该点边表结点的个数（无向图）</p><p>对于有向图 求某个点的度 出度遍历该点的边表 入度则需要遍历整个邻接表</p><p>邻接表不唯一</p><ol start="3"><li>十字链表</li></ol><p>有向图</p><p>解决邻接表存储有向图计算出度需要遍历整个邻接表，因此十字链表很容易求得顶点的出度和入度</p><p>数据结构：弧结点包含 弧尾 弧头 弧头相同的下一结点 弧尾相同的下一结点</p><p>弧头相同的结点属于一个链表 弧尾相同的结点属于一个链表</p><p>十字链表表示唯一确定一个图</p><ol start="4"><li>邻接多重表</li></ol><p>无向图</p><p>解决邻接表无向图求两个顶点间是否存在边和对边执行删除等操作时，需要分辨在两个顶点的边表中遍历</p><h3 id="图的遍历" tabindex="-1">图的遍历 <a class="header-anchor" href="#图的遍历" aria-label="Permalink to &quot;图的遍历&quot;">​</a></h3><ol><li>广度优先遍历（BFS）</li></ol><p>与二叉树的层序遍历一致</p><p>复杂度分析：</p><p>邻接表：空间O(V) 时间O(V+E)</p><p>邻接矩阵:空间O(V) 时间O(V^2)</p><p>广度优先生成树 唯一性的判定</p><ol start="2"><li>深度优先遍历</li></ol><p>与二叉树的 先序遍历一致</p><p>复杂度分析：</p><p>递归栈：空间复杂度O(V)</p><p>邻接矩阵：O(V^2)</p><p>邻接表：O(V+E)</p><p>深度优先生成树和生成森领</p><h3 id="图的应用" tabindex="-1">图的应用 <a class="header-anchor" href="#图的应用" aria-label="Permalink to &quot;图的应用&quot;">​</a></h3><ol><li>最小生成树</li></ol><p>唯一性的判断 是否有相同权值的边</p><p>Prim算法：</p><p>取相邻不重复的最小权值的边加入</p><p>时间复杂度：O(V^2) 不依赖于E 适合边稠密图</p><p>Kruskal算法：</p><p>按照权值递增次序选择合适的边来构造</p><p>时间复杂度O(ElogE)，不依赖于V，适合边稀疏而顶点多的图</p><ol start="2"><li>最短路径</li></ol><p>Dijkstra算法求解单源最短路径：</p><p>每轮确定一个最近的点作为中转点，判断以该点到达其余点的路径是否比上一轮更小，若更小则更新。</p><p>三个辅助数组：final[]、dist[]、path[]</p><p>不适合带负权值的图</p><p>时间复杂度O(V^2)</p><p>Floyd求解各点之间的最短路径问题：</p><p>图中的各个顶点轮流称为中间结点 判断以此结点为中转到其余结点的权值是否更小 是的话就更新 否则不更新</p><p>时间复杂度O(V^3)</p><p>适合带负权值的图</p><ol start="3"><li><p>有向无环图描述表达式</p></li><li><p>拓扑排序</p></li></ol><p>AOV网（有向无环图）</p><p>是对有向无环图的一种排序，可用于判断是否存在回路</p><p>每次选择入度为0的结点，并消去与之相连的边，直到当前图中不存在无前驱的结点为止。</p><p>可利用DFS实现拓扑排序，利用结束时间从大到小排列（父结点的结束时间大于孩子结点的结束时间）</p><p>存在性和唯一性的判断：</p><p>各个点仅有唯一的前驱或后继，拓扑排序唯一，否则不唯一</p><p>邻接矩阵存储 若为三角矩阵，则存在拓扑排序，反之不一定</p><ol start="5"><li>关键路径</li></ol><p>AOE网（带权有向无环图）</p><p>事件的最早发生时间Vk</p><p>事件的最晚发生时间V</p><h2 id="第七章-查找" tabindex="-1">第七章 查找 <a class="header-anchor" href="#第七章-查找" aria-label="Permalink to &quot;第七章 查找&quot;">​</a></h2><p>平均查找长度 = 查找的总次数 / 查找表的长度</p><h3 id="顺序查找和折半查找" tabindex="-1">顺序查找和折半查找 <a class="header-anchor" href="#顺序查找和折半查找" aria-label="Permalink to &quot;顺序查找和折半查找&quot;">​</a></h3><p>顺序查找哨兵的作用</p><p>平均查找长度和平均失败查找长度分析</p><p>折半查找的代码（熟悉掌握），模拟查找过程和查找次数（成功和失败）查找树</p><p>分块查找：先分块，块内无序（顺序查找），块间有序（第一块的最大小于第二块的所有）</p><h3 id="树形查找" tabindex="-1">树形查找 <a class="header-anchor" href="#树形查找" aria-label="Permalink to &quot;树形查找&quot;">​</a></h3><ol><li>二叉排序树</li></ol><p>左 &lt; 根 &lt; 右</p><p>中序遍历为递增有序序列</p><p>二叉排序树的构造、插入和删除</p><p>删除后填补，利用中序遍历序列中删除该结点的后一个结点填补</p><p>查找效率分析</p><p>二叉排序树并不唯一</p><ol start="2"><li>平衡二叉树</li></ol><p>左右子树高度之差（平衡因子）不超过1</p><p>插入以及调整操作过程：LL、RR、LR、RL</p><p>每次调整的都是最小不平衡子树</p><p>构造平衡二叉树的过程、删除过程以及查找过程</p><p>查找过程与二叉排序树相同</p><p>平均查找效率为树的高度（log2n）</p><ol start="3"><li>B树和B+树</li></ol><p>B树的定义和特点</p><p>关键字个数：<code>[m/2]-1 &lt;= n &lt;= m-1</code>（注意区分根结点最少1）</p><p>叶子结点代表查找失败</p><p>树的高度（磁盘存取次数） 关键字最多和关键字最少树的高度推导公式</p><p>B树的插入和删除（分裂和合并策略）</p><p>B+树的定义和特点</p><p>关键字个数<code>[m/2] &lt;= n &lt;=m</code> (注意区分根结点最少2)</p><p>叶子结点包含全部关键字信息（非叶结点仅起索引作用）</p><p>B+树和B树的区别！</p><p>从关键字个数 根结点 叶子结点分析 关键字对应树的个数</p><ol start="4"><li>散列表（hash）</li></ol><p>散列表的概念：散列函数、冲突、散列表</p><p><strong>散列函数的构造：</strong></p><p>直接定址法</p><p>除留余数法 选质数p</p><p>数字分析法</p><p>平方取中法</p><p><strong>解决冲突的方法：</strong></p><p>开放定址法：（H(key) + di）% m</p><p>对于增量d的取值采用以下方法：</p><p>线性探测法：1，2，... m-1，顺序的查看表中的下一个单元（存在堆积现象）</p><p>平方探测法：1^2，2^2...k^2</p><p>双散列法：第一个散列函数得到的地址发生冲突时，则利用第二个散列函数计算该关键字的地址增量。</p><p>伪随机序列法：增量为随机序列</p><p>开放定址法的删除操作采用软删除（逻辑删除）</p><p>拉链法：将产生冲突的同义词使用一个链表存储起来（适合经常插入和删除）</p><p><strong>散列表查找性能分析：</strong></p><p>查找成功 = 各关键字查找次数之和 / 关键字个数 （⚠️ 不是散列表的长度）</p><p>查找失败 = 各关键字查找失败次数之和 / 表长（要模以的数字）</p><p>⚠️：假设质数为7 那么饿只有可能在0-6 依次计算0-6间各数查找失败的情况的次数 当下一个位置为空即为查找失败</p><p><a href="https://blog.csdn.net/cj151525/article/details/109435869" target="_blank" rel="noreferrer">https://blog.csdn.net/cj151525/article/details/109435869</a></p><p>影响散列表查找效率的因素：散列函数、处理冲突的方法和装填因子</p><p>装填因子：表中记录数n / 散列表的长度m</p><h2 id="第八章-排序" tabindex="-1">第八章 排序 <a class="header-anchor" href="#第八章-排序" aria-label="Permalink to &quot;第八章 排序&quot;">​</a></h2><p>外部排序（王道视频课二刷）</p><p>增加归并段 从而减少归并趟数 进而减少IO次数，但增加归并段后，内部归并时间也会增加，因此引入败者树（完全二叉树）</p><p>减少初始归并段也能减少归并趟数，置换-选择排序（生成初始归并段）得到的初始归并段长度不等，</p><h2 id="遗留问题" tabindex="-1">遗留问题 <a class="header-anchor" href="#遗留问题" aria-label="Permalink to &quot;遗留问题&quot;">​</a></h2><ol><li><p>特殊矩阵下标推导</p></li><li><p>next数组和nextval数组</p></li><li><p>并查集</p></li><li><p>关键路径计算</p></li><li><p>散列表</p></li><li><p>红黑树</p></li><li><p>外部排序</p></li></ol>`,287),e=[l];function t(r,h,o,d,k,c){return s(),p("div",null,e)}const u=a(n,[["render",t]]);export{E as __pageData,u as default};
