# 核心概念

## 核心包结构

1. **react**

   > react基础包，提供创建react组件（`React.createElement`）、状态管理（`useState`）、生命周期（`useEffect`）等必要函数，开发过程中的使用的api主要都来自这个包。


2. **react-dom**

   > web 应用的**渲染器**，是 react 与 web 平台连接的桥梁(可以在浏览器和 nodejs 环境中使用)，将`react-reconciler`中的运行结果输出到 web 界面上，主要作用是将 React 组件转换为 DOM 节点，并渲染在浏览器上。在 React 18 中，更推荐使用的渲染 api 是 `createRoot.render`，在 concurrent 模式（并发模式）下性能更好。

3. **react-reconciler**

   > react 的核心包（**构造器**），通过实现协调算法（`diff 算法`）管理 react 应用状态的输入和结果的输出，构造fiber树， 将输入信号最终转换成输出信号传递给**渲染器**（`react-dom`）。主要功能作用：
   > - 接受状态输入(`scheduleUpdateOnFiber`)，将fiber树生成逻辑封装到一个回调函数中(涉及fiber树形结构, fiber.updateQueue队列, 调和算法等)
   > - 把此回调函数(`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`)送入`scheduler`进行调度
   > - 回调函数执行完成后获取到更新结果，交给**渲染器**（`react-dom`）渲染到页面上

4. **scheduler**
   
   >调度机制的核心实现(**调度器**)，接收**react-reconciler**传入的回调函数任务，并管理这些任务的优先级和执行顺序。
   > - 核心任务就是执行回调(回调函数由`react-reconciler`提供)
   > - 控制由`react-reconciler`送入的回调函数的执行时机, 在concurrent模式下可以实现任务分片, 实现可中断渲染(concurrent模式下才有此特性)