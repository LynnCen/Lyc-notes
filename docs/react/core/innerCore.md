# 内核关系

## 工作循环
![alt text](../img/core-packages.c2850581.png)

工作循环分为`fiber构造循环`和`任务调度循环`


**fiber构造循环**

`fiber构造循环`以树为数据结构, 用于控制fiber树的构造，从上至下执行`深度优先遍历（DFS）`



**任务调度循环**

任务调度循环是以二叉堆为数据结构(详见react 算法之堆排序), 循环执行堆的顶点, 直到堆被清空.它需要循环调用, 控制所有任务(task)的调度.

任务调度循环的逻辑偏向宏观, 它调度的是每一个任务(task), 而不关心这个任务具体是干什么的(甚至可以将Scheduler包脱离react使用), 具体任务其实就是执行回调函数`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`.



## 基本数据结构

### JSX & ReactElement

`jsx` 并不是什么模板语言，而是语法糖，react 会使用 `React.createElement` 将 `jsx` 转换为 `ReactElement` 对象。

React.createElement()接收3个参数：`type(原生DOM类型)`、`config(配置属性)`、`children(子项内容)`

例如:

```js
<div className="banner">
    <p> 
        hello world
    </p>
</div>

React.createElement('div', {'className': 'banner'}, React.createElement('p', null, 'hello world'))
```

`ReactElement`对象的数据结构如下:
```js
export type ReactElement = {|
  // 用于辨别ReactElement对象
  $typeof: any,

  // 内部属性
  type: any, // 表明其种类 type属性决定了节点的种类 它的值可以是字符串(代表div,span等 dom 节点), 函数(代表function, class等节点), 或者 react 内部定义的节点类型(portal,context,fragment等)
//   在reconciler阶段, 会根据 type 执行不同的逻辑(在 fiber 构建阶段详细解读).
// 如 type 是一个字符串类型, 则直接使用.
// 如 type 是一个ReactComponent类型, 则会调用其 render 方法获取子节点.
// 如 type 是一个function类型,则会调用该方法获取子节点
  key: any, // key属性在reconciler阶段会用到, 目前只需要知道所有的ReactElement对象都有 key 属性
  ref: any,
  props: any,

  // ReactFiber 记录创建本对象的Fiber节点, 还未与Fiber树关联之前, 该属性为null
  _owner: any,

  // __DEV__ dev环境下的一些额外信息, 如文件路径, 文件名, 行列信息等
  _store: {validated: boolean, ...},
  _self: React$Element<any>,
  _shadowChildren: any,
  _source: Source,
|};

```



### Fiber

Fiber 对象是 Fiber 架构中的基础。Fiber 对象在内存中描述了用户编写的界面，react 会使用 fiber 对象进行 diff 并将 diff 结果应用到真实 dom 上。因此 fiber 对象在 react 中其着虚拟 DOM的作用。

```ts
// 一个Fiber对象代表一个即将渲染或者已经渲染的组件(ReactElement), 一个组件可能对应两个fiber(current和WorkInProgress)
export type Fiber = {

  tag: WorkTag, // 表示 fiber 的类型

  key: null | string, // 从 ReactElement 获取的 key


  elementType: any, // 从 ReactElement 获取的 type

  type: any, // 从 ReactElement 获取的 type
 
  stateNode: any, 

  return: Fiber | null, // 该 fiber 的父节点

  child: Fiber | null, // 该 fiber 的第一个子节点
  sibling: Fiber | null, // 该 fiber 的第一个兄弟节点
  index: number, // 


  ref:
    | null
    | (((handle: mixed) => void) & {_stringRef: ?string, ...})
    | RefObject, // fiber 关联的 ref

  pendingProps: any, // // 从`ReactElement`对象传入的 props. 用于和`fiber.memoizedProps`比较可以得出属性是否变动
  memoizedProps: any, // 上一次生成子节点时用到的属性, 生成子节点之后保持在内存中

  // A queue of state updates and callbacks.
  updateQueue: mixed, // 存储state更新的队列, 当前节点的state改动之后, 都会创建一个update对象添加到这个队列中.

  // The state used to create the output
  memoizedState: any, // 用于输出的state, 最终渲染所使用的state

  // Dependencies (contexts, events) for this fiber, if it has any
  dependencies: Dependencies | null, // // 该fiber节点所依赖的(contexts, events)等

  mode: TypeOfMode, // // 二进制位Bitfield,继承至父节点,影响本fiber节点及其子树中所有节点. 与react应用的运行模式有关(有ConcurrentMode, BlockingMode, NoMode等选项).

//  // Effect 副作用相关
  flags: Flags, // 标志位
  subtreeFlags: Flags,  //替代16.x版本中的 firstEffect, nextEffect. 当设置了 enableNewReconciler=true才会启用
  deletions: Array<Fiber> | null,  // 存储将要被删除的子节点. 当设置了 enableNewReconciler=true才会启用


  nextEffect: Fiber | null,  // 单向链表, 指向下一个有副作用的fiber节点
  firstEffect: Fiber | null,// 指向副作用链表中的第一个fiber节点
  lastEffect: Fiber | null, // 指向副作用链表中的最后一个fiber节点

  // 优先级相关
  lanes: Lanes,// 本fiber节点的优先级 车道模型
  childLanes: Lanes, // 子节点的优先级

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null, // 指向内存中的另一个fiber, 每个被更新过fiber节点在内存中都是成对出现(current和workInProgress)



  // 性能统计相关(开启enableProfilerTimer后才会统计)
  // react-dev-tool会根据这些时间统计来评估性能
  // Time spent rendering this Fiber and its descendants for the current update.
  // This tells us how well the tree makes use of sCU for memoization.
  // It is reset to 0 each time we render and only updated when we don't bailout.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualDuration?: number,  // 本次更新过程, 本节点以及子树所消耗的总时间

  // If the Fiber is currently active in the "render" phase,
  // This marks the time at which the work began.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualStartTime?: number, // 标记本fiber节点开始构建的时间

  // Duration of the most recent render time for this Fiber.
  // This value is not updated when we bailout for memoization purposes.
  // This field is only set when the enableProfilerTimer flag is enabled.
  selfBaseDuration?: number,// 用于最近一次生成本fiber节点所消耗的时间

  // Sum of base times for all descendants of this Fiber.
  // This value bubbles up during the "complete" phase.
  // This field is only set when the enableProfilerTimer flag is enabled.
  treeBaseDuration?: number,// 生成子树所消耗的时间的总和

};
```




在理解这个工作循环之前，先提出一个问题

 JSX渲染成真实DOM的过程是什么？


**初次渲染**

1、JSX 是 `React.createElement()` 的语法糖

2、React.createElement()接收3个参数：type(原生DOM类型)、config(配置属性)、children(子项内容)

3、React.createElement()最终返回一个 ReactElement 实例

4、在创建 ReactElement 实例过程中，内部定义了一个特殊变量 $$typeof，类型为 Symbol，由于 JSON 不支持 Symbol，这样 React 内部可以通过 $$typeof 来判判断并杜绝通过 JSON 动态生成的对象，以避免 XSS 攻击。

5、最终所有的 ReactElement 构成了 虚拟 DOM 树

6、React 最终将虚拟 DOM 转化为真实DOM，并渲染到网页中

7、所谓虚拟 DOM 是我们平时的称呼，真正对应的是 Fiber 架构。

8、虚拟 DOM 仅仅是 Fiber 架构的其中一种含义

9、Fiber 架构另外 2 层含义是：针对协调器的具体工作方式描述、动态工作单元(需要更新的状态和副作用)

10、为了践行 快速响应机制，React 内部使用 双缓存机制，会创建 2 份“虚拟DOM”

11、当然更加准确的说法是 2 个根节点 RootFiber，也就是 2 个 Fiber 树

12、这 2 个 Fiber 树分别是：当前 Fiber 树(current Fiber)、内存进程中的 Fiber 树(workInProgress Fiber树)

13、这 2 个 Fiber 树的内容对比过程，其实就是 React Diff 算法

14、这 2 个 Fiber 树在后续的每一次更新渲染过程中，会经历一次互换身份

15、所谓互换身份其实就是修改 FiberRootNode.current 的指向，被指向的那个就是“当前 Fiber 树”，另外一个就变为“内存进程中的 Fiber 树”。

16、当首次创建整个项目时，先创建整个项目的顶节点 FiberRootNode，然后创建上面提到的 2 个 Fiber 树

17、此时 2 个 Fiber 树都是空白的，假设我们暂时称呼这 2 个 Fiber 树分别为 A、B

18、FiberRootNode.current 首先指向空白的 A

19、然后再采用深度优先遍历方式，从 App 开始不断创建各个层级的节点内容，并将节点内容赋值给 B

20、这个过程其实就是 JSX 转化为虚拟 DOM 的过程

21、当 B 内容填充完成后 FiberRootNode.current 此时改为指向 B

22、并且把 B 的内容转化为真实 DOM，渲染到网页中，至此 首次渲染结束

23、首次渲染不使用 Diff 算法

**更新阶段**

24、当发生数据状态变化后，会引发更新渲染

25、Fiber 会基于 B 创建 1 个新的根节点 RootFiber ，我们称呼为 C

26、当然也可以理解成 并没有创建 C，所谓 C 只不过是将原来的 A 重新调整为空白的 RootFiber

27、B 和 C 每一层都有一个 alternate 属性来互相指向对方相同的层

28、Fiber 重新从 App 开始，不断遍历各个层级的节点内容，并将内容写入到 C 中

29、当 C 内容填充完成后，通过 C 各个层的 alternate 属性来与 B 中对应的层内容做对比，也就是 Diff 运算

30、Diff 算法有一个最基本原则是：若某一层的顶层不同，则不会继续往下层再做对比，跳出并去做其他平级层的对比

31、最终得出究竟有哪些虚拟 DOM 节点需要更新，同时将 FiberRootNode.current 指向 C

32、将这些更新重新渲染到真实DOM中，并执行副作用

33、至此更新渲染结束，之后再次发生的更新渲染，重复上述过程。