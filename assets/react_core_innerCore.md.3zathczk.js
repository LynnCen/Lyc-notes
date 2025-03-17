import{_ as r}from"./chunks/core-packages.c2850581.FW-IKf5s.js";import{_ as p,c as t,o,a8 as a}from"./chunks/framework.B1-gFi6y.js";const m=JSON.parse('{"title":"内核关系","description":"","frontmatter":{},"headers":[],"relativePath":"react/core/innerCore.md","filePath":"react/core/innerCore.md","lastUpdated":1714991119000}'),c={name:"react/core/innerCore.md"};function i(n,e,d,s,b,l){return o(),t("div",null,e[0]||(e[0]=[a('<h1 id="内核关系" tabindex="-1">内核关系 <a class="header-anchor" href="#内核关系" aria-label="Permalink to &quot;内核关系&quot;">​</a></h1><h2 id="工作循环" tabindex="-1">工作循环 <a class="header-anchor" href="#工作循环" aria-label="Permalink to &quot;工作循环&quot;">​</a></h2><p><img src="'+r+'" alt="alt text"></p><p>工作循环分为<code>fiber构造循环</code>和<code>任务调度循环</code></p><p><strong>fiber构造循环</strong></p><p><code>fiber构造循环</code>以树为数据结构, 用于控制fiber树的构造，从上至下执行<code>深度优先遍历（DFS）</code></p><p><strong>任务调度循环</strong></p><p>任务调度循环是以二叉堆为数据结构(详见react 算法之堆排序), 循环执行堆的顶点, 直到堆被清空.它需要循环调用, 控制所有任务(task)的调度.</p><p>任务调度循环的逻辑偏向宏观, 它调度的是每一个任务(task), 而不关心这个任务具体是干什么的(甚至可以将Scheduler包脱离react使用), 具体任务其实就是执行回调函数<code>performSyncWorkOnRoot</code>或<code>performConcurrentWorkOnRoot</code>.</p><p>在理解这个工作循环之前，先提出一个问题</p><p>JSX渲染成真实DOM的过程是什么？</p><p><strong>初次渲染</strong></p><p>1、JSX 是 <code>React.createElement()</code> 的语法糖</p><p>2、React.createElement()接收3个参数：type(原生DOM类型)、config(配置属性)、children(子项内容)</p><p>3、React.createElement()最终返回一个 ReactElement 实例</p><p>4、在创建 ReactElement 实例过程中，内部定义了一个特殊变量 $$typeof，类型为 Symbol，由于 JSON 不支持 Symbol，这样 React 内部可以通过 $$typeof 来判判断并杜绝通过 JSON 动态生成的对象，以避免 XSS 攻击。</p><p>5、最终所有的 ReactElement 构成了 虚拟 DOM 树</p><p>6、React 最终将虚拟 DOM 转化为真实DOM，并渲染到网页中</p><p>7、所谓虚拟 DOM 是我们平时的称呼，真正对应的是 Fiber 架构。</p><p>8、虚拟 DOM 仅仅是 Fiber 架构的其中一种含义</p><p>9、Fiber 架构另外 2 层含义是：针对协调器的具体工作方式描述、动态工作单元(需要更新的状态和副作用)</p><p>10、为了践行 快速响应机制，React 内部使用 双缓存机制，会创建 2 份“虚拟DOM”</p><p>11、当然更加准确的说法是 2 个根节点 RootFiber，也就是 2 个 Fiber 树</p><p>12、这 2 个 Fiber 树分别是：当前 Fiber 树(current Fiber)、内存进程中的 Fiber 树(workInProgress Fiber树)</p><p>13、这 2 个 Fiber 树的内容对比过程，其实就是 React Diff 算法</p><p>14、这 2 个 Fiber 树在后续的每一次更新渲染过程中，会经历一次互换身份</p><p>15、所谓互换身份其实就是修改 FiberRootNode.current 的指向，被指向的那个就是“当前 Fiber 树”，另外一个就变为“内存进程中的 Fiber 树”。</p><p>16、当首次创建整个项目时，先创建整个项目的顶节点 FiberRootNode，然后创建上面提到的 2 个 Fiber 树</p><p>17、此时 2 个 Fiber 树都是空白的，假设我们暂时称呼这 2 个 Fiber 树分别为 A、B</p><p>18、FiberRootNode.current 首先指向空白的 A</p><p>19、然后再采用深度优先遍历方式，从 App 开始不断创建各个层级的节点内容，并将节点内容赋值给 B</p><p>20、这个过程其实就是 JSX 转化为虚拟 DOM 的过程</p><p>21、当 B 内容填充完成后 FiberRootNode.current 此时改为指向 B</p><p>22、并且把 B 的内容转化为真实 DOM，渲染到网页中，至此 首次渲染结束</p><p>23、首次渲染不使用 Diff 算法</p><p><strong>更新阶段</strong></p><p>24、当发生数据状态变化后，会引发更新渲染</p><p>25、Fiber 会基于 B 创建 1 个新的根节点 RootFiber ，我们称呼为 C</p><p>26、当然也可以理解成 并没有创建 C，所谓 C 只不过是将原来的 A 重新调整为空白的 RootFiber</p><p>27、B 和 C 每一层都有一个 alternate 属性来互相指向对方相同的层</p><p>28、Fiber 重新从 App 开始，不断遍历各个层级的节点内容，并将内容写入到 C 中</p><p>29、当 C 内容填充完成后，通过 C 各个层的 alternate 属性来与 B 中对应的层内容做对比，也就是 Diff 运算</p><p>30、Diff 算法有一个最基本原则是：若某一层的顶层不同，则不会继续往下层再做对比，跳出并去做其他平级层的对比</p><p>31、最终得出究竟有哪些虚拟 DOM 节点需要更新，同时将 FiberRootNode.current 指向 C</p><p>32、将这些更新重新渲染到真实DOM中，并执行副作用</p><p>33、至此更新渲染结束，之后再次发生的更新渲染，重复上述过程。</p>',46)]))}const _=p(c,[["render",i]]);export{m as __pageData,_ as default};
