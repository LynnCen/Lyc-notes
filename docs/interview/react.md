### useMemo 和 useCallBack 的区别？

useMemo 用于缓存计算结果,返回值为组件或者对象，useCallback 用于缓存回调函数。它们都可以在某些情况下提高组件的性能

### 普通的工具函数和 hook 的区别？

hook 能够让在不使用 class 的情况下，使用 class 的一些特性，例如，副作用，状态管理等
工具函数能够在任何场景下使用， hook 只能在函数组件内使用，并且遵循 hook 的使用原则，不能在循环、条件语句或子函数中调用等

### 讲一下 useSetState 的封装过程

setState 的功能
接受一个对象，指定更新某个特殊的属性 state
接受一个函数，函数的返回值更新 state

```ts
const newSetState = useCallback<ReturnSetStateFn<T>>((state, cb) => {
  let newState = state
  setState((prevState: T) => {
    executeCb.current = cb
    if (isFunction(state) && typeof state === 'function') {
      newState = state(prevState)
    }
    return { ...prevState, ...newState }
  })
}, [])
```

第二个参数接受一个回调函数，在更新完 state 后执行

```ts
useEffect(() => {
  const { current: cb } = executeCb
  if (typeof cb === 'function') isFunction(cb) && cb()
}, [executeCb.current])
```

### react 类组件和函数组件的区别

- **语法**：类组件使用 ES6 class 语法，而函数组件是普通的 JavaScript 函数。
- **状态管理**：类组件使用 this.state 和 this.setState 进行状态管理，而函数组件使用 useState Hook 来添加状态。
- **生命周期**：类组件有完整的生命周期方法（如 componentDidMount、componentDidUpdate 等），而函数组件使用 useEffect Hook 来模拟生命周期行为。

总的来说，随着 React Hooks 的引入，函数组件已经成为编写大多数 React 组件的首选方式，因为它们更简洁、易于理解，并且可以使用 Hooks 提供的功能。但类组件仍然是 React 中的一部分，并且在某些情况下仍然很有用。

##### useEffect 和 useLayouteffect 的区别？

**useEffect**

1. **异步执行**：`useEffect` 中的副作用代码是异步执行的，不会阻塞浏览器渲染。
2. **延迟执行**：`useEffect` 中的副作用代码会在浏览器完成绘制之后才执行，因此可能会导致页面先渲染显示，然后再更新。
3. **适用性**：适合大多数副作用操作，比如数据获取、订阅事件、DOM 操作等。

```
jsxCopy CodeuseEffect(() => {
  // 副作用代码
}, [dependency]);
```

**useLayoutEffect**

1. **同步执行**：`useLayoutEffect` 中的副作用代码是同步执行的，会在 DOM 更新之前执行。
2. **立即执行**：`useLayoutEffect` 中的副作用代码会在浏览器进行布局（layout）和绘制（painting）之前执行，可以在更新前立即处理。
3. **适用性**：适合需要在更新之前立即执行的副作用操作，比如 DOM 计算、样式计算等。

```
jsxCopy CodeuseLayoutEffect(() => {
  // 副作用代码
}, [dependency]);
```

### react 中的生命周期函数

1.Mounting 阶段
**constructor()**: 这是 React 组件的构造函数，它会在组件被创建的时候调用一次。可以在这个函数中初始化 state、绑定事件处理函数等操作。
**static getDerivedStateFromProps(props,state)**: 这个函数会在组件被挂载之前调用，并且每次组件收到新的 props 时都会调用。它可以根据新的 props 计算出新的 state，并返回一个对象更新 state，或者返回 null 表示不更新 state。
React 中的 getDerivedStateFromProps()是一个静态方法，可以在组件每次渲染前调用。它的入参是组件的 props 和 state，返回值是一个对象，用于更新组件的 state。

具体来说，getDerivedStateFromProps()有两个参数：

props：组件的 props，即从父组件传递下来的属性。这是一个普通的 JavaScript 对象，包含了组件的所有属性。

state：组件的当前状态。这是一个普通的 JavaScript 对象，包含了组件内部需要维护的状态。

getDerivedStateFromProps()的返回值应该是一个对象，用于更新组件的 state。如果返回 null，则不更新组件的 state。在更新组件的 state 之前，React 会自动调用 render()方法来重新渲染组件。

需要注意的是，getDerivedStateFromProps()方法仅仅在组件的 props 变化时会被调用。如果组件的 state 发生变化，它并不会被调用。如果需要在组件 state 变化时进行处理，可以使用 componentDidUpdate()生命周期方法。
**render()**: 这个函数是 React 组件必须实现的函数，它会在组件被挂载时调用，并且每次组件的 props 或 state 发生变化时都会被调用。它负责返回要渲染的 React 元素。
**componentDidMount()**: 这个函数会在组件被挂载后调用，只会调用一次。可以在这个函数中进行一些异步操作，比如发送网络请求等。

extra：
**componentWillMount()**: 这个函数会在组件被挂载之前调用，它只会调用一次。可以在这个函数中进行一些准备工作，比如设置定时器等。

2.Updating 阶段
**static getDerivedStateFromProps()**: 这个函数会在组件收到新的 props 时调用，在 Mounting 阶段也会调用。它可以根据新的 props 计算出新的 state，并返回一个对象更新 state，或者返回 null 表示不更新 state。

**shouldComponentUpdate(nextProps，nextState)**: 这个函数会在组件收到新的 props 或 state 时调用，用于判断组件是否需要更新。可以根据新的 props 和 state 来返 ���true 或 false，以控制组件是否进行更新。默认情况下，React 组件会在每次 props 或 state 变化时进行更新。

**render()**: 这个函数会在组件更新时调用，它负责返回要渲染的 React 元素。

**componentDidUpdate()**: 这个函数会在组件更新后调用，可以在这个函数中进行一些操作，比如更新 DOM 等。

extra：
**componentWillReceiveProps(nextProps)**:这个函数会在组件收到新的 props 时调用，可以在这个函数中根据新的 props 来更新 state 或进行其他操作。
**componentWillUpdate(nextProps, nextState)**: 这个函数会在组件更新之前调用，可以在这个函数中进行一些准备工作，比如保存一些当前组件的状态等。但是，由于它的使用场景比较有限，而且容易引起一些问题，所以 React 16.3 版本之后已经将这个函数标记为过时(deprecated)。可以使用**getSnapshotBeforeUpdate()**函数代替。
**componentDidCatch(error, info)**: 这个函数会在组件的子组件中抛出异常时调用，并且只会在生产环境中调用。可以在这个函数中记录错误信息、发送错误日志等操作，以便快速定位和解决问题。

3.Unmounting 阶段
**componentWillUnmount()**: 这个函数会在组件被卸载之前调用，可以在这个函数中进行一些清理操作，比如取消网络请求、销毁定时器等。
React 生命周期函数可以帮助我们在不同的时间点对组件进行操作，以及控制组件的渲染和更新。理解和掌握这些生命周期函数，可以让我们写出更加高效、稳定的 React 组件。

extra：
componentDidCatch(error, info): 这个函数会在组件的子组件中抛出异常时调用，并且只会在生产环境中调用。可以在这个函数中记录错误信息、发送错误日志等操作，以便快速定位和解决问题。

新增：
**static getDerivedStateFromError(error)**: 这个函数会在组件的子组件中抛出异常时调用，并且会在开发环境和生产环境中都调用。可以在这个函数 ��� 根据异常返回一个新的 state，表示组件的更新状态。

**getSnapshotBeforeUpdate(prevProps, prevState)**: 这个函数会在组件更新之前调用，并且会在 render()函数之后，真正更新 DOM 之前调用。可以在这个函数中获取当前 DOM 的一些信息，比如滚动条的位置等，并将这些信息返回，以便在组件更新后恢复这些信息。

### React 如何避免重复渲染

**1.shouldComponentUpdate**：这个方法会在组件更新之前调用。可以在这个方法中根据新的 props 和 state 值，自定义判断组件是否需要重新渲染。如果判断不需要重新渲染，就可以返回 false，从而避免重复渲染。

**2.PureComponent**：这是一个优化过的 React 组件，它会自动帮我们判断是否需要重新渲染。在使用 PureComponent 的时候，只需要让组件继承它，就可以避免一些不必要的重复渲染。

**3.React.memo**：这是一个高阶组件，它可以用来包裹函数组件，从而避免不必要的重复渲染。React.memo 会对组件的 props 进行浅比较，如果 props 没有变化，就不会重新渲染组件。
`export default memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name && prevProps.age === nextProps.age;
});`
使用 key 属性：在使用列表渲染的时候，可以为每个项设置一个唯一的 key 值。这样，当列表发生变化的时候，React 就可以 �� 重复项，避免重复渲染。

**4.useCallback、useMemo**：这两个钩子函数可以用来缓存函数和计算结果，从而避免不必要的重复渲染。

### react 中常用的 hook 有哪些

状态 hook：useState、useReducer
带副作用 hook：useEffect、useLayoutEffect、useRef、useCallback、useMemo、useImperativeHandle
所谓“副作用”，是指在组件渲染过程中执行的除了更新组件 UI 以外的操作，比如数据获取、订阅、手动修改 DOM 等。

### 什么情况下需要自己封装 hooks？

共享逻辑、复杂状态逻辑、副作用封装、抽象组件逻辑

### react 合成事件

React 通过事件委托来管理所有事件，统一绑定到顶层容器上，然后根据实际触发事件的元素来调用相应的事件处理函数。这样可以减少内存消耗和提高性能。

React 为开发者提供了一整套合成事件，包括鼠标事件、键盘事件、表单事件等，使用方式与原生事件类似。通过这些合成事件，开发者可以更方便地处理用户交互，并且不必担心跨浏览器的兼容性问题。

**核心原理：**

1. **事件委托**：React 使用事件委托的方式来管理所有事件。所有事件都被绑定到顶层容器上，而不是直接绑定到每个具体的 DOM 元素上。这样可以减少事件处理程序的数量，提高性能。7
2. **事件池**：React 使用事件池来重用事件对象，避免频繁创建和销毁事件对象带来的性能开销。当事件被触发时，React 会从事件池中获取一个事件对象，并在事件处理完成后将其归还给事件池。
3. **合成事件对象**：React 封装了原生事件对象，提供了统一的跨浏览器接口。合成事件对象包含了与原生事件对象相似的属性和方法，但也有一些额外的特性，比如可以通过 `stopPropagation` 和 `preventDefault` 来控制事件传播和默认行为。
4. **事件处理优化**：React 对事件处理进行了优化，采用批量更新和合并更新的方式来减少不必要的渲染。在事件处理过程中，React 会将多个状态更新合并为一个更新，然后再统一执行更新操作，减少渲染次数，提高性能。

总的来说，React 合成事件系统的核心原理是利用事件委托、事件池、合成事件对象和事件处理优化来统一管理和处理事件，提高性能、简化代码编写，并保证跨浏览器的兼容性。这些特性使得 React 在处理用户交互时更加高效和可靠。

### fiber 机制

时间片轮转 作业调度优先级
React Fiber 是 React 16 引入的一种新的协调机制，用于实现 React 的异步渲染和增量渲染，从而提高 React 的性能和交互效果。

在 React Fiber 中，React 将任务分为两个优先级：高优先级任务和低优先级任务。React 会优先执行高优先级任务，如果高优先级任务执行完毕后还有时间，才会执行低优先级任务。这种方式可以保证在有限的时间内完成尽可能多的任务，从而提高 React 的响应速度和交互效果。

React Fiber 的核心是 Fiber 节点，每个 Fiber 节点代表一个组件或 DOM 节点，包含了组件的状态、属性、子节点等信息。在 React Fiber 中，React 会将组件渲染成一棵 Fiber 树，遍历 Fiber 树来执行组件的更新和渲染，每次遍历的时间片称为一个“工作单元”（Unit of Work）。

React Fiber 的渲染过程分为两个阶段：Reconciliation 阶段和 Commit 阶段。

Reconciliation 阶段用于计算组件的更新和创建 Fiber 节点，它包括四个子阶段：Begin、Progress、Hydration 和 Complete。在 Begin 和 Progress 阶段，React 会遍历 Fiber 树，创建或更新 Fiber 节点，并将 Fiber 节点添加到工作队列中；在 Hydration 阶段，React 会将实际 DOM 和虚拟 DOM 进行比对，确定哪些 DOM 节点可以被复用；在 Complete 阶段，React 会将所有的更新操作打包成一棵 Fiber 树，准备进入 Commit 阶段。

Commit 阶段用于将 Fiber 树渲染到实际 DOM 上，它包括两个子阶段：Preparation 和 Mutation。在 Preparation 阶段，React 会准备好所有的 DOM 节点和样式等信息；在 Mutation 阶段，React 会将 Fiber 树中所有变化的节点更新到实际 DOM 上，从而完成页面的渲染。

React Fiber 的优点是可以实现 React 的异步渲染和增量渲染，提高页面的性能和交互效果。它也为 React 的未来发展提供了更多的可能性，可以更好地适应复杂的业务场景和数据结构。

工作过程：

1. 构建 Fiber 树
   在 React 应用程序中，组件层级结构被转换为一个由 Fiber 对象组成的树形结构。每个 Fiber 对象代表着 React 中的一个组件、元素或者其他类型的可渲染单元。这些 Fiber 对象通过指针链接起来，形成了一个虚拟的 Fiber 树。

2. 启动渲染过程
   当需要更新 UI 时（例如，组件的状态或属性发生变化），React 会启动渲染过程。在渲染过程中，React 会根据组件的变化生成一颗新的 Fiber 树，这个过程称为协调。

3. 创建工作单元
   在协调过程中，React 会根据组件的变化创建一系列的工作单元，这些工作单元表示了需要进行的具体任务，例如更新组件、添加新组件或者删除组件等。每个工作单元都与一个 Fiber 对象相关联，并包含了更新该 Fiber 对象所需的信息。

4. 调度任务
   一旦创建了所有的工作单元，React Fiber 就会开始调度这些任务。调度的过程是根据任务的优先级和当前页面的渲染状态来确定的，这样可以确保高优先级的任务能够及时执行，并且不会阻塞页面的渲染。

5. 执行任务
   根据调度的结果，React Fiber 开始执行工作单元中的任务。在执行过程中，React Fiber 可能会根据需要中断任务的执行，并在稍后恢复执行，以确保其他任务能够及时执行。

6. 更新 DOM
   一旦所有的任务都执行完成，React Fiber 就会根据更新的结果来更新实际的 DOM。这个过程可能涉及到对 DOM 结构的添加、删除或者修改，以确保页面的显示与应用程序的状态保持一致。

7. 完成渲染
   最后，一旦所有的更新都已经应用到 DOM 中，React Fiber 渲染过程就完成了。此时，页面上显示的内容已经与 React 应用程序的状态保持一致，用户可以看到更新后的界面。

总的来说，React Fiber 通过将渲染过程分解为多个小任务，并且根据任务的优先级来调度执行这些任务，使得 React 能够更灵活地处理组件的更新，并且提高了页面的响应速度和流畅性

### diff 算法

React 的 diff 算法是虚拟 DOM（Virtual DOM）的核心算法之一，用于计算两个虚拟 DOM 树的差异（Diff）并将差异应用到实际 DOM 上，从而实现页面的高效更新。

React 的 diff 算法采用的是双端比较（Two-Ended Comparison）的策略，即同时从新虚拟 DOM 树和旧虚拟 DOM 树的根节点开始深度优先遍历，比较它们的节点类型、属性和子节点。如果发现两个节点不同，就停止比较，将旧节点及其子树全部删除，并用新节点及其子树替换它们。如果发现两个节点相同，就继续比较它们的子节点，直到全部比较完成。

React 的 diff 算法有以下优化：

对于同层级节点的比较，React 会根据节点的 key 属性进行优化。如果两个节点的 key 相同，则认为它们是同一节点，并将它们的差异递归到它们的子节点上；如果两个节点的 key 不同，则认为它们不是同一节点，并将它们及其子节点全部替换。

对于节点类型不同的比较，React 会直接将旧节点及其子树全部删除，并用新节点及其子树替换它们，从而避免不必要的比较。

对于相同类型的组件，React 会重用组件实例，不会重新创建组件实例，从而提高性能。

对于节点的移动操作，React 会采用最小化移动的策略，尽可能地减少节点的移动次数，从而提高性能。

总的来说，React 的 diff 算法是一种高效的算法，可以快速计算虚拟 DOM 树的差异，并将差异应用到实际 DOM 上，从而实现页面的高效更新。

### react 如何实现并发渲染？

通过一下关键技术实现：

- 任务调度器和优先级管理：
- 任务分割和时间切片
- 并发渲染和中断恢复
- 异步更新和批处理

### react 调和到一半的 fiber 树，此时有一个高优先级的任务，react 从中断位置调和还是清除掉调和到一半 fiber，重新重头开始调和？

根据当前工作特性和已完成的工作量而定
如果当前已调和的任务较多，react 倾向于继续当前调和，并不会抛弃已调和好的数据
