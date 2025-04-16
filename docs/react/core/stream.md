# React 流式渲染与选择性注水详解

## 一、背景：传统 SSR 的局限性

在深入流式渲染之前，我们先回顾一下传统的服务器端渲染（Server-Side Rendering, SSR）及其面临的挑战。

### 1. 什么是传统 SSR？

传统 SSR 的核心思想是在服务器端将 React 组件渲染成 HTML 字符串，然后将这个 HTML 发送给浏览器。浏览器接收到 HTML 后可以立即显示页面内容，即使用户的 JavaScript 还没有下载或执行。这对于提升**首次内容绘制 (FCP)** 和**搜索引擎优化 (SEO)** 非常有利。

### 2. 传统 SSR 的"瀑布流"瓶颈

尽管 SSR 能让用户更快看到内容，但传统的 React SSR 流程存在一个固有的"瀑布流"问题，主要体现在以下几个步骤 [\[1\]](https://github.com/reactwg/react-18/discussions/37)：

1.  **数据获取 (Server)**：服务器需要等待**整个应用**所需的所有数据都获取完毕。
2.  **HTML 渲染 (Server)**：服务器将**整个应用**渲染成一个完整的 HTML 字符串。
3.  **代码加载 (Client)**：浏览器下载**整个应用**所需的 JavaScript 代码（React 库 + 应用代码）。
4.  **注水 (Hydration) (Client)**：浏览器执行 JavaScript 代码，将事件监听器和交互逻辑附加到服务器生成的**整个应用**的 HTML 上，使其变得可交互。

![传统 SSR 流程](https://camo.githubusercontent.com/9940d500dbf0d3724068af8b6e658a14b43c9080cf8b4cec4112f1b2ca0e2272/68747470733a2f2f717569702e636f6d2f626c6f622f5963474141416b314234322f39656b30786570614f5a653842764679503244652d773f613d6131796c464577695264317a79476353464a4451676856726161375839334c6c726134303732794c49724d61)
_（图片来源：[React 18 Working Group Discussion #37](https://github.com/reactwg/react-18/discussions/37)）_

这里的关键问题是"**整个应用**"：

*   **All-or-Nothing 数据获取**：如果应用中任何一个数据请求很慢，都会阻塞整个页面的 HTML 生成。
*   **All-or-Nothing HTML 渲染**：服务器必须等待整个应用渲染完成才能发送 HTML。
*   **All-or-Nothing 代码加载**：浏览器必须下载完所有 JavaScript 才能开始注水。
*   **All-or-Nothing 注水**：React 必须一次性为整个应用注水，如果任何一部分代码或逻辑复杂，都会拖慢整个页面的可交互时间 (TTI)。

这导致即使页面的大部分内容很快准备好了，用户也必须等待最慢的部分完成后才能看到或与之交互。

## 二、React 18+ 的新架构：流式 SSR 与选择性注水

为了解决传统 SSR 的瓶颈，React 18 引入了全新的并发渲染架构，其核心是**流式 SSR (Streaming SSR)** 和**选择性注水 (Selective Hydration)**，并与 `<Suspense>` 组件紧密结合 [\[1\]](https://github.com/reactwg/react-18/discussions/37)。

### 1. 流式 SSR (Streaming SSR)

流式 SSR 允许你在服务器上**边渲染边发送** HTML 片段到浏览器，而不是等待整个页面渲染完成。

**核心思想**：

*   **尽早发送 HTML Shell**：服务器不再需要等待所有数据和渲染完成，而是先发送页面的基本骨架（Shell），包括那些不需要异步数据的部分。
*   **利用 `<Suspense>` 解耦**：将应用中需要异步加载数据或代码的部分用 `<Suspense>` 包裹起来。在服务器端，当遇到 `<Suspense>` 边界且其内容尚未准备好时，React 会先发送其 `fallback` UI（通常是加载状态指示器）对应的 HTML。
*   **流式注入内容**：一旦 `<Suspense>` 包裹的内容（包括数据和代码）在服务器端准备就绪，React 会通过同一个流（stream）将这部分内容的 HTML 和一个内联的 `<script>` 标签发送到浏览器。这个脚本负责将 HTML 精确地插入到之前 `fallback` 的位置。

![流式 SSR 过程](https://camo.githubusercontent.com/cbaa6f4d2c5395c4e4e3ca736d98f5dc492f693d67c6c73b852baddd226d5f92/68747470733a2f2f717569702e636f6d2f626c6f622f5963474141416b314234322f534f76496e4f2d73625973566d5166334159372d52413f613d675a6461346957316f5061434668644e36414f48695a396255644e78715373547a7a42326c32686b744a3061)
_（图片来源：[React 18 Working Group Discussion #37](https://github.com/reactwg/react-18/discussions/37)）_

**优势**：

*   **更快的 TTFB (Time to First Byte)**：浏览器能更快地接收到初始 HTML。
*   **更快的 FCP (First Contentful Paint)**：用户能更快地看到页面的主要结构和非异步内容。
*   **更快的 LCP (Largest Contentful Paint)**：关键内容（如果不在 Suspense 边界内或其数据很快可用）可以更快地绘制。
*   **不受慢速数据拖累**：应用中某个慢速的数据请求不会阻塞其他快速部分的 HTML 发送。

### 2. 选择性注水 (Selective Hydration)

选择性注水与流式 SSR 相辅相成，它允许浏览器在接收到 HTML 片段和对应的 JavaScript 代码后，**逐步地、非阻塞地**对页面的不同部分进行注水，而不是像以前那样必须一次性完成整个页面的注水。

**核心思想**：

*   **独立注水单元**：`<Suspense>` 边界不仅定义了流式渲染的单元，也定义了选择性注水的单元。每个 `<Suspense>` 包裹的内容可以独立于应用的其他部分进行注水。
*   **代码分割集成**：当使用 `React.lazy()` 进行代码分割时，React 会自动等待组件代码加载完成后再尝试对其 `<Suspense>` 边界进行注水，并且这不会阻塞其他部分的注水。
*   **中断与恢复**：注水过程是可中断的。如果在注水过程中发生更高优先级的任务（如用户交互），React 会暂停当前的注水，优先处理用户事件，稍后再恢复注水。
*   **优先级注水**：React 会根据用户交互来动态提升注水的优先级。例如，如果用户点击了某个尚未完成注水的 `<Suspense>` 区域，React 会优先为这个区域进行注水，使其尽快变得可交互。

![选择性注水](https://camo.githubusercontent.com/b433615733974db344b793492137f86a2edfb32c878ed03d47fc365e8c8fc46c/68747470733a2f2f717569702e636f6d2f626c6f622f5963474141416b314234322f715377594e765a58514856423970704e7045344659673f613d6c3150774c4844306b664a61495971474930646a53567173574a345544324c516134764f6a6f4b7249785161)
_（图片来源：[React 18 Working Group Discussion #37](https://github.com/reactwg/react-18/discussions/37)）_

**优势**：

*   **更快的 TTI (Time to Interactive)**：用户可以更早地与页面的关键部分进行交互，即使某些次要部分或代码仍在加载/注水。
*   **更好的用户体验**：即使在慢速网络或低端设备上，页面也能更快地响应用户输入，避免长时间冻结。
*   **主线程解冻**：将冗长的注水过程分解成小块，穿插在事件循环中执行，避免长时间阻塞主线程。

## 三、实现原理与底层机制

### 1. `renderToPipeableStream` 与 `renderToReadableStream`

React 18 提供了新的服务端渲染 API 来支持流式渲染：

*   **`renderToPipeableStream` (Node.js 环境)**：
    *   设计用于 Node.js 后端。
    *   返回一个可管道化 (pipeable) 的流，可以将其 pipe 到 HTTP 响应流 (`response`)。
    *   提供了 `onShellReady`、`onShellError`、`onAllReady`、`onError` 等回调来控制流的发送时机和处理错误。
    *   **`onShellReady`**: 当初始 Shell（`Suspense` fallback 之外的部分）渲染完成后触发，此时可以将流 pipe 到响应中，让浏览器尽早接收 HTML。
    *   **`onAllReady`**: 当所有内容（包括所有 `Suspense` 边界内的异步内容）都渲染完成时触发。这对于需要完整 HTML 的爬虫或静态生成场景很有用。
    *   **底层**：利用 Node.js 的 `stream.Readable` 和 `stream.Writable` 接口，以及 HTTP 的 **Chunked Transfer Encoding** 机制，将渲染产生的 HTML 片段逐步发送给客户端。

    ```javascript
    // server/render.js (简化示例)
    import { renderToPipeableStream } from 'react-dom/server';
    import App from '../src/App';
    
    let didError = false;
    const stream = renderToPipeableStream(<App />, {
      onShellReady() {
        // Shell 准备好了，开始发送 HTML
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-type', 'text/html');
        stream.pipe(res);
      },
      onShellError(error) {
        // Shell 渲染出错，发送错误状态码
        console.error(error);
        res.statusCode = 500;
        res.send('<h1>Something went wrong</h1>'); 
      },
      onAllReady() {
        // 整个页面（包括 Suspense 内容）都渲染完了
        // 如果是爬虫请求，可以在这里结束响应
        // 对于普通用户，流已经 pipe 到 res 了，这里通常不需要做什么
      },
      onError(error) {
        didError = true;
        console.error(error);
      }
    });
    ```

*   **`renderToReadableStream` (Web Streams / Edge Runtimes)**：
    *   设计用于支持 Web Streams API 的现代 Edge 运行时环境（如 Cloudflare Workers, Deno, Vercel Edge Functions）。
    *   返回一个 `ReadableStream`。
    *   通常与 `Response` 对象结合使用。
    *   **底层**：基于标准的 Web Streams API (`ReadableStream`, `WritableStream`)。

### 2. `<Suspense>` 的角色

`<Suspense>` 是这一切的核心协调者：

*   **服务器端**：
    *   当 React 渲染到 `<Suspense>` 边界时，如果其内部组件需要挂起（例如，等待数据加载或 `React.lazy` 组件的代码加载），React 不会等待。
    *   它会立即渲染 `fallback` prop 指定的 UI，并记录下来"这里需要稍后插入真实内容"。
    *   当挂起的操作完成后，React 会在后台渲染真实内容，并将对应的 HTML 和一个 JavaScript 调用（用于替换 fallback）发送到流中。
*   **客户端**：
    *   浏览器接收到包含 fallback 的初始 HTML 并显示。
    *   当包含真实内容的 HTML 片段和替换脚本通过流到达时，浏览器执行脚本，将真实内容无缝插入 DOM。
    *   JavaScript 代码加载后，React 会进行选择性注水。`<Suspense>` 边界内的内容作为一个独立的单元进行注水。如果它在初始加载时显示了 fallback，那么它的注水会被推迟，直到其代码和内容都准备好。

### 3. 选择性注水的内部机制

*   **事件捕获与优先级**：在页面完成注水之前，React 会在根节点捕获所有事件。当事件发生时，React 知道用户正在与哪个组件交互。
*   **优先注水**：如果用户交互发生在一个尚未注水的区域，React 会记录这个事件，并**同步地、优先地**为该区域及其父级 `<Suspense>` 边界进行注水。注水完成后，React 会重新派发（replay）被捕获的事件，确保交互逻辑正确执行。
*   **后台注水**：对于没有用户交互的 `<Suspense>` 边界，React 会在浏览器的空闲时间（利用 `requestIdleCallback` 或类似机制）以较低优先级进行注水，避免阻塞主线程。
*   **中断与恢复**：注水过程被设计为可以被更高优先级的任务（如用户输入处理或优先注水）中断。React 会将工作分解成小单元，执行一部分后检查是否有更高优先级的任务，如果有则让出主线程，稍后再恢复执行。这依赖于 React 内部的并发调度器 (Scheduler)。

### 4. HTML 结构与内联脚本

流式渲染生成的 HTML 包含一些特殊的标记和内联脚本：

*   **Fallback HTML**: 初始发送的 HTML 包含 Suspense 的 `fallback` 内容，通常带有隐藏的标记或特定 ID。
    ```html
    <div id="comments-fallback">Loading comments...</div>
    <div id="comments-container" style="display:none"></div> 
    ```
*   **内联脚本**: 当 Suspense 内容准备好后，服务器发送包含真实 HTML 和替换脚本的片段。
    ```html
    <template id="comments-html">
      <!-- Comments 真实 HTML 内容 -->
      <div>Comment 1</div>
      <div>Comment 2</div>
    </template>
    <script>
      // 简单示意，实际脚本更复杂
      var container = document.getElementById('comments-container');
      var template = document.getElementById('comments-html');
      container.innerHTML = template.innerHTML;
      container.style.display = '';
      document.getElementById('comments-fallback').style.display = 'none';
      // 可能还包含用于注水的数据或指令
    </script>
    ```
*   **注水数据**: 可能包含序列化的数据，用于客户端注水时恢复状态或避免重复请求。

## 四、React 19 的优化与演进

React 19 在 React 18 建立的并发渲染和流式架构基础上，进一步引入了多项优化和新特性，使得流式渲染更加强大和易用。

### 1. Server Components (RSC) 的深度融合

虽然 Server Components 在 React 18 中已有实验性支持，但在 React 19 中它们成为了构建流式应用的核心部分（尤其是在 Next.js 等框架中）。

*   **天生流式友好**：Server Components 在服务器上执行，可以直接访问数据源（数据库、API 等），并将渲染结果（可以是 HTML 或特殊指令）流式传输到客户端。它们不需要注水，因为它们没有客户端交互逻辑。
*   **与 `<Suspense>` 结合**：Server Components 可以自然地与 `<Suspense>` 结合。如果一个 Server Component 需要异步获取数据，可以将其包裹在 `<Suspense>` 中。服务器会先发送 fallback，数据准备好后再流式发送该组件的渲染结果。
*   **减少客户端负载**：将非交互式组件移到服务器执行，显著减少了发送到客户端的 JavaScript 代码量，加快了代码加载和注水过程。

### 2. Actions (Server Actions)

Actions 简化了客户端与服务器之间的数据交互，特别是在表单提交和数据变更场景下，与流式渲染结合得很好。

*   **表单的流式处理**：使用 Actions，表单提交可以在不阻塞客户端导航的情况下在服务器上处理。服务器处理 Action 后，可以流式返回更新后的 UI 部分，或者指示客户端进行状态更新。
*   **乐观更新 (Optimistic Updates)**：结合 `useOptimistic` Hook，可以在 Action 发送到服务器并等待响应期间，立即在客户端显示一个预期的最终状态，等服务器确认后再更新为实际状态。这在流式更新的场景下提供了更平滑的交互体验。

### 3. 改进的资源加载 (`<link>`, `<style>`, `<script>`)

React 19 对资源加载进行了重大改进，使其与 Suspense 和流式渲染更好地集成：

*   **Suspense 感知**：React 现在能够理解 `<link rel="stylesheet">` 和异步 `<script>` 何时加载完成。如果一个组件在 `<Suspense>` 边界内渲染了这些标签，React 会等待对应的资源（如 CSS）加载完成后，再显示该组件，而不是显示 fallback 后因为样式未加载而出现布局抖动 (CLS)。
*   **资源去重**：React 会自动对渲染过程中出现的相同资源（如同一份 CSS 或 JS）进行去重，确保只加载一次。
*   **流式资源注入**：即使资源是在 `<Suspense>` 边界内或由 Server Component 渲染的，React 也能确保它们被正确地、流式地注入到 HTML 的 `<head>` 中。

### 4. Document Metadata 支持 (`<title>`, `<meta>`)

React 19 内置了对文档元数据（`title`, `meta` 标签）的支持。

*   **内置组件**：可以直接在任何组件（包括 Server Components）中渲染 `<title>` 和 `<meta>` 标签。
*   **自动提升与去重**：React 会自动将这些标签提升到文档的 `<head>` 中，并处理重复标签（例如，确保只有一个 `<title>`)。
*   **流式友好**：即使元数据标签在 `<Suspense>` 边界内渲染，React 也能确保它们最终正确出现在 `<head>` 中，解决了之前需要 Helmet 等库且在流式场景下可能出现问题的痛点。

### 5. `useOptimistic` Hook

如前所述，`useOptimistic` 允许在异步操作（如 Server Action）期间提供即时的 UI 反馈，这对于保持流式更新时的用户体验至关重要。

### 6. 错误处理改进

React 19 改进了服务器端渲染和服务端组件中的错误处理机制，使其与流式传输和恢复更加协调。

## 五、收益总结

采用 React 流式渲染与选择性注水架构带来了显著的好处：

*   **用户感知性能提升**：
    *   **更快的首屏可见时间 (FCP, LCP)**：用户能更快看到内容。
    *   **更快的可交互时间 (TTI)**：用户能更快地与页面交互。
*   **更好的资源利用**：
    *   **服务器**：无需等待最慢的数据，可以更早开始发送响应，减少空闲等待。
    *   **客户端**：分解注水任务，避免长时间阻塞主线程；按需加载代码和数据。
*   **提升开发体验**：
    *   `<Suspense>` 提供了一种声明式的方式来处理加载状态。
    *   `React.lazy` 与 SSR 无缝集成。
    *   Server Components 和 Actions 简化了数据获取和变更逻辑。
*   **更好的容错性**：即使应用的某个部分出错或数据加载失败，也不会完全阻塞整个页面的渲染和交互。

## 六、注意事项与权衡

*   **SEO**：虽然流式传输的 HTML 包含了所有内容，但搜索引擎爬虫对这种动态注入内容的理解程度仍在发展中。Googlebot 通常能较好地处理，但对于其他爬虫，可能仍需考虑使用 `onAllReady` 回调提供完整 HTML，或采用动态渲染 (Dynamic Rendering) 策略，即为爬虫提供一个完全渲染好的非流式版本 [\[1\]](https://github.com/reactwg/react-18/discussions/37)。React 19 的资源和元数据加载改进有助于提升 SEO 兼容性。
*   **缓存**：流式响应的缓存策略比单个 HTML 文件更复杂。通常需要依赖 HTTP 缓存头（如 `Cache-Control`）并可能需要 CDN 支持 Edge Side Includes (ESI) 或类似的片段缓存技术。
*   **实现复杂度**：虽然 React 本身提供了 API，但手动实现完整的流式 SSR 和数据管理可能比较复杂。使用像 Next.js、Remix 这样的元框架可以极大地简化这个过程，它们内置了对流式渲染、数据获取、代码分割等的最佳实践。
*   **监控与调试**：流式应用的监控和调试可能需要新的工具和方法来跟踪分布在服务器和客户端的异步操作。

## 七、总结

React 18 和 19 带来的流式渲染与选择性注水是服务器端渲染领域的一次重大革新。通过将应用分解为独立的单元，并利用 `<Suspense>`、并发特性以及 React 19 的 Server Components、Actions 和资源加载优化，React 能够显著提升应用的感知性能和真实性能，为用户提供更快、更流畅的体验。虽然直接使用底层 API 可能有一定复杂度，但现代 React 框架已经将这些能力整合其中，使得开发者能够更容易地享受到流式渲染带来的好处。

**参考资料:**

*   [\[1\]](https://github.com/reactwg/react-18/discussions/37) New Suspense SSR Architecture in React 18 - React 18 Working Group Discussion