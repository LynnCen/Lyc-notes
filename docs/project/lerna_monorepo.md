# 基于lerna+dumi搭建多包管理实践

> https://github.com/MrXujiang/best-cps/tree/main

## Lerna是什么？

## 背景

> 在开发大型项目时, 我们通常会遇到同一工程依赖不同组件包, 同时不同的组件包之间还会相互依赖的问题, 那么如何管理组织这些依赖包就是一个迫在眉睫的问题.

现有方案：Multirepo（多仓库独立管理）和Monorepo（单一仓库统一管理）；

Monorepo 模式下, 我们需要将所有组件包放在同一个仓库中, 并且需要通过脚本来管理组件包的版本, 避免组件包之间的依赖冲突.它可以方便的管理具有多个包的 JavaScript 项目。同时对于组件包的开发者和维护者, 为了让团队其他成员更好的理解和使用我们开发的组件, 搭建组件文档和 demo 就显得格外重要.


总结：
- 大型项目统一管理包版本和依赖
- 能够高效低成本搭建组件文档
- 配置统一的eslint和代码提交规范

## Lerna的作用

<img src='https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/165f9e765a7547c2bfb7304c42cbb033~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp'/>

