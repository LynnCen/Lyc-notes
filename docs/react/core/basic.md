# 核心概念

## 核心包结构

1. **react**

> react基础包，提供创建react组件（`React.createElement`）、状态管理（`useState`）、生命周期（`useEffect`）等必要函数，开发过程中的使用的api主要都来自这个包。


2. **react-dom**

> web 应用的**渲染器**，主要作用是将 React 组件转换为 DOM 节点，并渲染在浏览器上。在 React 18 中，更推荐使用的渲染 api 是 `createRoot.render`，在 concurrent 模式（并发模式）下性能更好。