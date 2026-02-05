# 第1章：Canvas 元素与绑制环境

## 1.1 章节概述

欢迎来到 Canvas 2D 图形编程的世界！在开始学习任何绑制技术之前，我们首先需要理解什么是 Canvas，以及如何正确地创建和配置它。这就像学习绘画之前，我们需要先准备好画布、颜料和画笔一样。

本章将带你从零开始，一步步理解 Canvas 的核心概念：

- **Canvas 的本质**：它是什么，为什么要使用它
- **Canvas 元素的创建**：如何在网页中添加画布
- **绑制上下文**：Canvas 真正的"画笔"是什么
- **坐标系统**：如何在画布上定位
- **高清屏适配**：让你的图形在任何设备上都清晰锐利
- **状态管理**：如何优雅地管理绘图状态

学完本章后，你将具备创建专业级 Canvas 应用的基础环境配置能力。

---

## 1.2 什么是 Canvas？

### 1.2.1 从一个比喻开始理解 Canvas

想象你面前有一张空白的画布（canvas 这个英文单词本身就是"画布"的意思）。在传统绘画中，你需要：

1. **画布**：提供一个可以作画的表面
2. **画笔和颜料**：用来实际绑制图形的工具
3. **你的双手和大脑**：控制画笔的移动和颜色的选择

HTML5 Canvas 的设计哲学与此完全相同：

| 传统绘画 | Canvas 编程 |
|---------|-------------|
| 画布 | `<canvas>` 元素 |
| 画笔和颜料 | 绑制上下文（Context） |
| 你的双手和大脑 | JavaScript 代码 |

这个类比非常重要，因为它帮助我们理解一个关键概念：**Canvas 元素本身只是一个容器，它并不具备任何绘图能力**。真正赋予绘图能力的是"绑制上下文"，我们稍后会详细讨论它。

### 1.2.2 Canvas 的技术定位

在理解 Canvas 的技术定位之前，让我们先回顾一下 Web 图形技术的发展历程。

**早期 Web 图形的困境**

在 HTML5 之前，如果你想在网页上显示动态图形，你的选择非常有限：

1. **静态图片（GIF/JPEG/PNG）**：只能显示预先制作好的图像，无法动态生成
2. **Flash**：功能强大，但需要安装插件，而且在移动设备上支持很差
3. **Java Applet**：同样需要插件，启动慢，用户体验差
4. **SVG**：矢量图形，但当时浏览器支持不完善

这些方案要么功能受限，要么依赖第三方插件。Web 开发者迫切需要一种原生的、高性能的图形解决方案。

**Canvas 的诞生**

2004 年，Apple 为了增强 Safari 浏览器中 Dashboard 小组件的功能，首次引入了 Canvas 技术。这个创新很快被其他浏览器厂商认可并采纳：

```
2004 年：Apple 在 Safari 中引入 Canvas
   ↓
2005 年：Firefox 1.5 支持 Canvas
   ↓
2006 年：Opera 9 支持 Canvas
   ↓
2011 年：IE9 开始原生支持 Canvas（之前需要使用 ExplorerCanvas 模拟）
   ↓
2014 年：HTML5 正式成为 W3C 推荐标准，Canvas 成为核心特性
   ↓
2015 年至今：OffscreenCanvas、WebGL 2.0 等新特性不断涌现
```

Canvas 的出现标志着 Web 平台真正具备了原生的高性能图形绘制能力，为后来的 Web 游戏、数据可视化、图像处理等应用奠定了基础。

### 1.2.3 Canvas 是位图技术

理解 Canvas 是一种**位图（Bitmap）**技术非常重要。什么是位图？

位图是由一个个像素点组成的图像。每个像素都有自己的颜色值。当你在 Canvas 上绘制一个圆形时，Canvas 实际上做的是：将圆形覆盖的所有像素点设置为相应的颜色值。

```
位图的工作原理（放大后看一个圆）：

□ □ □ ■ ■ ■ □ □ □
□ □ ■ ■ ■ ■ ■ □ □
□ ■ ■ ■ ■ ■ ■ ■ □
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
■ ■ ■ ■ ■ ■ ■ ■ ■
□ ■ ■ ■ ■ ■ ■ ■ □
□ □ ■ ■ ■ ■ ■ □ □
□ □ □ ■ ■ ■ □ □ □

每个 ■ 或 □ 都是一个像素点
```

这种位图特性带来了几个重要的影响：

**优点：**
- 绘制速度快，适合大量图形元素
- 适合像素级操作（如图像滤镜）
- 适合游戏和动画场景

**缺点：**
- 放大后会模糊（像素化）
- 绘制后无法直接选择或修改单个图形（没有 DOM 结构）
- 需要手动实现事件处理

**"绘制后就忘记"的模式**

Canvas 采用的是"即时模式"（Immediate Mode）渲染：一旦你绘制了一个图形，Canvas 就"忘记"了这个图形的存在。它只记住最终的像素结果。

```javascript
// 绘制一个红色圆形
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.fill();

// 此时 Canvas 已经"忘记"了这是一个圆形
// 它只知道这些像素现在是红色的
// 你无法通过任何 API 获取"刚才绘制的那个圆形"
```

这与 SVG 的"保留模式"（Retained Mode）形成鲜明对比。SVG 中的每个图形都是 DOM 元素，你可以随时选择、修改、添加事件监听器。

### 1.2.4 Canvas 与其他图形技术的对比

作为 Web 开发者，你可能会遇到多种图形技术的选择。让我们详细比较它们：

**Canvas 2D vs SVG**

这是最常见的对比。两者都可以绑制 2D 图形，但工作方式完全不同：

| 对比维度 | Canvas 2D | SVG |
|---------|-----------|-----|
| **渲染方式** | 位图（像素） | 矢量（数学描述） |
| **DOM 结构** | 无（只是一个元素） | 有（每个图形都是元素） |
| **事件处理** | 需要手动计算碰撞检测 | 原生支持（可直接绑定事件） |
| **动态修改** | 需要重绘整个场景 | 可直接修改元素属性 |
| **缩放效果** | 放大会模糊 | 无损缩放 |
| **性能特点** | 大量简单图形时更快 | 少量复杂图形时更好 |
| **内存占用** | 与画布尺寸相关 | 与图形数量相关 |
| **学习曲线** | 中等 | 较简单 |

**如何选择？**

```
你的应用需要什么？

需要点击单个图形？
├─ 是 → 考虑 SVG
└─ 否 → 继续判断
        ↓
图形数量超过 1000 个？
├─ 是 → 考虑 Canvas
└─ 否 → 继续判断
        ↓
需要放大后仍然清晰？
├─ 是 → 考虑 SVG
└─ 否 → 继续判断
        ↓
是游戏或动画应用？
├─ 是 → 考虑 Canvas
└─ 否 → 两者皆可
```

**Canvas 2D vs WebGL**

WebGL 是 Canvas 的"兄弟"，它们都通过 `<canvas>` 元素工作，但 WebGL 使用 GPU 进行 3D 渲染：

| 对比维度 | Canvas 2D | WebGL |
|---------|-----------|-------|
| **渲染硬件** | CPU | GPU |
| **图形类型** | 2D | 2D 和 3D |
| **性能** | 好 | 极好（大量图形时） |
| **学习曲线** | 中等 | 陡峭 |
| **API 复杂度** | 相对简单 | 非常复杂 |
| **适用场景** | 一般 2D 应用 | 3D 游戏、复杂特效 |

通常，如果你的应用不需要 3D 效果，也不需要渲染大量图形（数万个以上），Canvas 2D 是更好的选择，因为它的 API 更加友好，学习成本更低。

### 1.2.5 Canvas 的典型应用场景

了解 Canvas 擅长什么，可以帮助你判断何时使用它。以下是一些典型场景：

**1. 游戏开发**

Canvas 是 Web 游戏的主力技术。许多流行的游戏框架都基于 Canvas：

- **Phaser**：功能全面的 2D 游戏框架
- **PixiJS**：高性能 2D 渲染引擎
- **CreateJS**：Adobe 官方的 Canvas 框架

为什么游戏适合用 Canvas？因为游戏需要：
- 每帧重绘大量图形（高性能）
- 像素级控制（精确碰撞检测）
- 不需要 DOM 事件（自己处理输入）

**2. 数据可视化**

当数据量大到 SVG 无法承受时，Canvas 是更好的选择：

- **ECharts**：百度开源的图表库
- **Chart.js**：简单易用的图表库
- **D3.js**：虽然主要用 SVG，但也支持 Canvas

比如，如果你要绘制一个包含 10 万个数据点的散点图，用 SVG 会创建 10 万个 DOM 元素，浏览器会崩溃。但 Canvas 可以轻松处理。

**3. 图像处理**

Canvas 提供了像素级的图像操作能力：

```javascript
// 获取图像的像素数据
const imageData = ctx.getImageData(0, 0, width, height);
const pixels = imageData.data;

// pixels 是一个数组，每 4 个元素代表一个像素的 RGBA 值
// [R, G, B, A, R, G, B, A, ...]

// 可以直接修改像素值来实现滤镜效果
```

在线图片编辑器、滤镜应用、图片裁剪工具等都依赖 Canvas 的这个能力。

**4. 无限画布编辑器**

这是本系列教程的重点应用场景。像 Figma、Miro、Excalidraw 这样的设计工具，核心就是一个无限画布：

- 支持任意缩放和平移
- 渲染大量设计元素
- 需要高性能的实时交互

Canvas（通常配合 WebGL）是实现这类应用的首选技术。

**5. 创意应用**

- 在线画板和涂鸦工具
- 电子签名
- 粒子特效和动画
- 生成艺术（Generative Art）

---

## 1.3 创建 Canvas 元素

现在让我们开始动手。创建 Canvas 的第一步是在页面上添加 `<canvas>` 元素。

### 1.3.1 通过 HTML 创建

最简单的方式是直接在 HTML 中声明：

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的第一个 Canvas</title>
    <style>
        /* 给 Canvas 添加边框，方便看到它的边界 */
        #myCanvas {
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <canvas id="myCanvas" width="800" height="600">
        <!-- 回退内容：当浏览器不支持 Canvas 时显示 -->
        <p>抱歉，您的浏览器不支持 Canvas。请升级到现代浏览器。</p>
    </canvas>
    
    <script>
        // 获取 Canvas 元素
        const canvas = document.getElementById('myCanvas');
        
        // 获取 2D 绑制上下文
        const ctx = canvas.getContext('2d');
        
        // 现在可以开始绘图了！
        ctx.fillStyle = '#4D7CFF';
        ctx.fillRect(100, 100, 200, 150);
    </script>
</body>
</html>
```

让我们逐行解析这段代码：

**第 1 步：声明 Canvas 元素**

```html
<canvas id="myCanvas" width="800" height="600">
```

这里有几个要点：

1. **id 属性**：用于在 JavaScript 中获取这个元素
2. **width 和 height 属性**：设置 Canvas 的**绘制尺寸**（这非常重要，我们稍后详细讨论）
3. **回退内容**：写在 `<canvas>` 标签内部的内容只在浏览器不支持 Canvas 时显示

**第 2 步：获取 Canvas 元素引用**

```javascript
const canvas = document.getElementById('myCanvas');
```

这是标准的 DOM 操作，获取 Canvas 元素的引用，以便后续操作。

**第 3 步：获取绑制上下文**

```javascript
const ctx = canvas.getContext('2d');
```

这是关键的一步！`getContext('2d')` 返回一个 `CanvasRenderingContext2D` 对象，这个对象才是真正的"画笔"。所有的绑制方法都定义在这个对象上。

**第 4 步：开始绘图**

```javascript
ctx.fillStyle = '#4D7CFF';  // 设置填充颜色
ctx.fillRect(100, 100, 200, 150);  // 绘制填充矩形
```

### 1.3.2 通过 JavaScript 动态创建

在很多场景下，我们需要用代码动态创建 Canvas：

```javascript
// 创建 Canvas 元素
const canvas = document.createElement('canvas');

// 设置尺寸
canvas.width = 800;
canvas.height = 600;

// 可选：设置 id 和样式
canvas.id = 'dynamicCanvas';
canvas.style.border = '1px solid #ccc';

// 添加到页面
document.body.appendChild(canvas);

// 获取上下文并绘图
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FF6B6B';
ctx.fillRect(50, 50, 100, 100);
```

**为什么要动态创建？**

1. **按需创建**：只在需要时才创建 Canvas
2. **多个 Canvas**：程序可能需要创建多个 Canvas
3. **离屏 Canvas**：创建不显示在页面上的 Canvas 用于预渲染

### 1.3.3 离屏 Canvas（Offscreen Canvas）

有时候我们需要创建一个不显示在页面上的 Canvas，用于预渲染或缓存。这称为"离屏 Canvas"：

```javascript
// 传统的离屏 Canvas（不添加到 DOM）
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 800;
offscreenCanvas.height = 600;
const offscreenCtx = offscreenCanvas.getContext('2d');

// 在离屏 Canvas 上绘制复杂图形
drawComplexGraphics(offscreenCtx);

// 然后一次性绘制到主 Canvas
mainCtx.drawImage(offscreenCanvas, 0, 0);
```

**现代的 OffscreenCanvas API**

从 2018 年开始，浏览器引入了新的 `OffscreenCanvas` API，它有两个重要优势：

1. **可以在 Web Worker 中使用**：将渲染工作移到后台线程
2. **性能更好**：没有 DOM 相关的开销

```javascript
// 创建 OffscreenCanvas（需要浏览器支持）
const offscreen = new OffscreenCanvas(800, 600);
const ctx = offscreen.getContext('2d');

// 正常绘图
ctx.fillStyle = '#4D7CFF';
ctx.fillRect(0, 0, 100, 100);

// 可以转换为 ImageBitmap
const bitmap = offscreen.transferToImageBitmap();
```

**检测 OffscreenCanvas 支持**

```javascript
if (typeof OffscreenCanvas !== 'undefined') {
    console.log('OffscreenCanvas 可用！');
} else {
    console.log('使用传统离屏 Canvas');
}
```

---

## 1.4 理解 Canvas 尺寸

这是 Canvas 学习中最容易混淆、也最重要的概念之一。**Canvas 有两种尺寸，必须区分清楚。**

### 1.4.1 绘制尺寸 vs 显示尺寸

**绘制尺寸（Drawing Size）**

绘制尺寸是 Canvas 内部像素缓冲区的实际大小，通过 HTML 属性或 JavaScript 属性设置：

```javascript
// 通过 HTML 属性
<canvas width="800" height="600"></canvas>

// 通过 JavaScript 属性
canvas.width = 800;
canvas.height = 600;
```

绘制尺寸决定了 Canvas 有多少个像素可以用来绘图。可以理解为画布的"实际尺寸"。

**显示尺寸（Display Size）**

显示尺寸是 Canvas 在页面上占据的空间，通过 CSS 设置：

```javascript
// 通过 CSS
canvas.style.width = '800px';
canvas.style.height = '600px';

// 或在 CSS 文件中
#myCanvas {
    width: 800px;
    height: 600px;
}
```

显示尺寸决定了 Canvas 在页面上看起来有多大。可以理解为画框的大小。

### 1.4.2 两种尺寸不匹配会怎样？

这是新手最常犯的错误之一。让我们看看会发生什么：

**场景 1：只设置 CSS 尺寸**

```javascript
const canvas = document.createElement('canvas');
// 没有设置 canvas.width 和 canvas.height
// 所以绘制尺寸是默认值：300 × 150

canvas.style.width = '600px';
canvas.style.height = '300px';
// 显示尺寸：600 × 300

const ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, 100, 100);
// 这个 100×100 的矩形会被拉伸显示为 200×200
// 因为 600/300 = 2，300/150 = 2
```

结果：绘制的内容被拉伸，变得模糊且比例失真。

```
绘制尺寸 300×150 被拉伸到 显示尺寸 600×300：

原始绘制（300×150）       显示效果（600×300）
┌───────────────┐         ┌───────────────────────────┐
│■■■■│          │         │■■■■■■■■│                    │
│■■■■│          │         │■■■■■■■■│                    │
│    │          │    →    │■■■■■■■■│                    │
│    │          │         │■■■■■■■■│                    │
└───────────────┘         │        │                    │
                          │        │                    │
                          └───────────────────────────┘
  100×100 方块被拉伸为 200×200，而且变模糊
```

**场景 2：两种尺寸匹配**

```javascript
const canvas = document.createElement('canvas');

// 设置绘制尺寸
canvas.width = 600;
canvas.height = 300;

// 设置显示尺寸（与绘制尺寸相同）
canvas.style.width = '600px';
canvas.style.height = '300px';

const ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, 100, 100);
// 100×100 的矩形正常显示为 100×100
```

结果：1:1 显示，图形清晰。

### 1.4.3 正确的尺寸设置方式

**基本原则：始终同时设置两种尺寸，并保持一致**

```javascript
function setCanvasSize(canvas, width, height) {
    // 1. 设置绘制尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 2. 设置显示尺寸
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

// 使用
setCanvasSize(canvas, 800, 600);
```

**重要提示：修改尺寸会清空 Canvas！**

每当你修改 `canvas.width` 或 `canvas.height`，Canvas 的内容会被完全清除，绑制上下文也会被重置：

```javascript
// 绘制一些内容
ctx.fillRect(0, 0, 100, 100);

// 修改尺寸
canvas.width = canvas.width;  // 即使设置相同的值也会清空！

// 之前绘制的内容已经消失了
// 需要重新绘制
```

这个特性可以用来快速清空 Canvas：

```javascript
// 清空 Canvas 的方法 1：使用 clearRect
ctx.clearRect(0, 0, canvas.width, canvas.height);

// 清空 Canvas 的方法 2：重新设置尺寸（会重置上下文状态）
canvas.width = canvas.width;
```

### 1.4.4 响应式 Canvas

在实际应用中，我们经常需要让 Canvas 适应容器或窗口大小：

```javascript
class ResponsiveCanvas {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        container.appendChild(this.canvas);
        
        // 初始化尺寸
        this.resize();
        
        // 监听窗口变化
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        // 获取容器尺寸
        const rect = this.container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // 只在尺寸真正变化时才更新
        if (this.canvas.width !== width || this.canvas.height !== height) {
            // 保存当前内容（如果需要）
            const imageData = this.ctx.getImageData(
                0, 0, this.canvas.width, this.canvas.height
            );
            
            // 更新尺寸
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            
            // 恢复内容（可选）
            // this.ctx.putImageData(imageData, 0, 0);
            
            // 触发重绘
            this.onResize?.();
        }
    }
}

// 使用
const container = document.getElementById('canvas-container');
const app = new ResponsiveCanvas(container);

// 设置重绘回调
app.onResize = () => {
    // 重新绘制内容
    drawScene(app.ctx, app.canvas.width, app.canvas.height);
};
```

---

## 1.5 绘制上下文（Rendering Context）

### 1.5.1 什么是绘制上下文？

还记得开头的比喻吗？Canvas 元素是画布，而绘制上下文就是画笔。更准确地说，绘制上下文是一个对象，它包含了所有的绘图方法和属性。

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// ctx 就是绘制上下文
// 它是一个 CanvasRenderingContext2D 类型的对象
console.log(ctx.constructor.name);  // "CanvasRenderingContext2D"
```

**一个 Canvas 只能有一个上下文**

一旦你获取了某种类型的上下文，就不能再获取其他类型：

```javascript
const ctx2d = canvas.getContext('2d');
const webgl = canvas.getContext('webgl');  // 返回 null！

// 因为这个 Canvas 已经绑定了 2D 上下文
// 不能同时拥有 2D 和 WebGL 上下文
```

### 1.5.2 getContext 的参数

`getContext(contextType, contextAttributes)` 接受两个参数：

**第一个参数：上下文类型**

| 类型 | 说明 |
|------|------|
| `'2d'` | 2D 绑制上下文，最常用 |
| `'webgl'` 或 `'experimental-webgl'` | WebGL 1.0 上下文 |
| `'webgl2'` | WebGL 2.0 上下文 |
| `'bitmaprenderer'` | ImageBitmap 渲染上下文 |

**第二个参数：上下文属性（可选）**

对于 2D 上下文，可以传入一些配置选项：

```javascript
const ctx = canvas.getContext('2d', {
    // 是否需要 Alpha 通道（透明度）
    alpha: true,  // 默认 true
    
    // 颜色空间
    colorSpace: 'srgb',  // 或 'display-p3'
    
    // 是否解除同步（减少延迟）
    desynchronized: false,  // 默认 false
    
    // 是否会频繁读取像素
    willReadFrequently: false,  // 默认 false
});
```

**各选项详解**

1. **alpha**：是否包含透明度信息
   
   ```javascript
   // 如果你的 Canvas 不需要透明背景
   // 设置 alpha: false 可以提升性能
   const ctx = canvas.getContext('2d', { alpha: false });
   
   // 此时 Canvas 背景变成不透明的黑色
   // 但绘制性能会稍微提升
   ```

2. **willReadFrequently**：是否频繁读取像素数据
   
   ```javascript
   // 如果你需要频繁调用 getImageData()
   // 设置这个选项可以优化读取性能
   const ctx = canvas.getContext('2d', { 
       willReadFrequently: true 
   });
   
   // 适用场景：图像处理、颜色取样等
   ```

3. **desynchronized**：是否解除与 DOM 的同步
   
   ```javascript
   // 对于需要低延迟的绘图应用（如手写板）
   // 这个选项可以减少输入到显示的延迟
   const ctx = canvas.getContext('2d', { 
       desynchronized: true 
   });
   
   // 注意：可能会导致撕裂（tearing）
   ```

### 1.5.3 检测浏览器支持

在使用 Canvas 之前，最好先检测浏览器是否支持：

```javascript
/**
 * 检测 Canvas 支持
 */
function checkCanvasSupport() {
    // 检测 Canvas 元素
    const canvas = document.createElement('canvas');
    
    // 检测 2D 上下文
    if (!canvas.getContext) {
        return {
            canvas: false,
            context2d: false,
            webgl: false
        };
    }
    
    return {
        canvas: true,
        context2d: !!canvas.getContext('2d'),
        webgl: !!(
            canvas.getContext('webgl') || 
            canvas.getContext('experimental-webgl')
        ),
        webgl2: !!canvas.getContext('webgl2'),
        offscreen: typeof OffscreenCanvas !== 'undefined'
    };
}

// 使用
const support = checkCanvasSupport();

if (!support.context2d) {
    alert('您的浏览器不支持 Canvas 2D，请升级浏览器。');
} else {
    // 正常初始化应用
    initApp();
}
```

### 1.5.4 Context2D 的核心 API 预览

`CanvasRenderingContext2D` 提供了丰富的 API，这里先做一个全局预览，后续章节会详细讲解每一个：

```javascript
const ctx = canvas.getContext('2d');

// ========== 1. 矩形操作 ==========
ctx.fillRect(x, y, width, height);    // 填充矩形
ctx.strokeRect(x, y, width, height);  // 描边矩形
ctx.clearRect(x, y, width, height);   // 清除矩形区域

// ========== 2. 路径操作 ==========
ctx.beginPath();                      // 开始新路径
ctx.closePath();                      // 闭合路径
ctx.moveTo(x, y);                     // 移动画笔
ctx.lineTo(x, y);                     // 画直线
ctx.arc(x, y, r, start, end, ccw);    // 画圆弧
ctx.bezierCurveTo(...);               // 贝塞尔曲线
ctx.quadraticCurveTo(...);            // 二次曲线
ctx.fill();                           // 填充路径
ctx.stroke();                         // 描边路径
ctx.clip();                           // 裁剪路径

// ========== 3. 样式属性 ==========
ctx.fillStyle = 'red';                // 填充颜色/渐变/图案
ctx.strokeStyle = 'blue';             // 描边颜色/渐变/图案
ctx.lineWidth = 2;                    // 线条宽度
ctx.lineCap = 'round';                // 线端样式
ctx.lineJoin = 'round';               // 连接样式
ctx.globalAlpha = 0.5;                // 全局透明度
ctx.globalCompositeOperation = '...'; // 混合模式

// ========== 4. 变换操作 ==========
ctx.translate(x, y);                  // 平移
ctx.rotate(angle);                    // 旋转
ctx.scale(x, y);                      // 缩放
ctx.transform(a, b, c, d, e, f);      // 矩阵变换
ctx.setTransform(a, b, c, d, e, f);   // 重置并设置变换
ctx.resetTransform();                 // 重置变换

// ========== 5. 状态管理 ==========
ctx.save();                           // 保存状态
ctx.restore();                        // 恢复状态

// ========== 6. 图像操作 ==========
ctx.drawImage(image, ...);            // 绘制图像
ctx.getImageData(x, y, w, h);         // 读取像素
ctx.putImageData(imageData, x, y);    // 写入像素
ctx.createImageData(w, h);            // 创建图像数据

// ========== 7. 文本操作 ==========
ctx.fillText(text, x, y);             // 填充文本
ctx.strokeText(text, x, y);           // 描边文本
ctx.measureText(text);                // 测量文本
ctx.font = '16px Arial';              // 字体
ctx.textAlign = 'center';             // 水平对齐
ctx.textBaseline = 'middle';          // 垂直对齐
```

---

## 1.6 Canvas 坐标系统

### 1.6.1 默认坐标系

在开始绑制之前，我们必须理解 Canvas 的坐标系统。Canvas 使用的是**屏幕坐标系**：

```
Canvas 坐标系：

(0,0) ─────────────────→ X轴（向右增大）
  │
  │
  │
  │
  ↓
Y轴（向下增大）
```

这与数学中常见的笛卡尔坐标系不同：

```
数学坐标系（笛卡尔坐标系）：

              Y轴（向上增大）
              ↑
              │
              │
              │
─────────────(0,0)─────────────→ X轴（向右增大）
              │
              │
```

**关键区别**：

| 特性 | Canvas 坐标系 | 数学坐标系 |
|------|--------------|-----------|
| 原点位置 | 左上角 | 通常在中心 |
| X 轴方向 | 向右为正 | 向右为正 |
| Y 轴方向 | **向下为正** | 向上为正 |
| 角度方向 | 顺时针为正 | 逆时针为正 |

**为什么使用这种坐标系？**

这是历史原因。计算机屏幕从左上角开始扫描显示，所以早期的图形系统都采用这种坐标系。几乎所有的计算机图形 API（Canvas、SVG、OpenGL 等）都使用类似的坐标系。

### 1.6.2 坐标示例

```javascript
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#4D7CFF';

// 在不同位置绘制矩形
ctx.fillRect(0, 0, 50, 50);     // 左上角
ctx.fillRect(100, 0, 50, 50);   // 上方偏右
ctx.fillRect(0, 100, 50, 50);   // 左侧偏下
ctx.fillRect(100, 100, 50, 50); // 中间偏右下

// 坐标示意：
// (0,0)    (100,0)
//   ■         ■
//
// (0,100)  (100,100)
//   ■         ■
```

### 1.6.3 像素与子像素

Canvas 的坐标值可以是浮点数，这会触发**子像素渲染**（Sub-pixel Rendering）：

```javascript
// 整数坐标
ctx.fillRect(10, 10, 50, 50);  // 像素边界清晰

// 浮点坐标
ctx.fillRect(10.5, 10.5, 50, 50);  // 边缘会模糊（抗锯齿）
```

**为什么浮点坐标会导致模糊？**

想象一个像素网格。当你在整数坐标绘制时，图形边界正好落在像素边界上：

```
整数坐标 (10, 10)：
  │   │   │   │
──┼───┼───┼───┼──
  │ ■ │ ■ │ ■ │    ← 填充完整像素
──┼───┼───┼───┼──
  │ ■ │ ■ │ ■ │
──┼───┼───┼───┼──

浮点坐标 (10.5, 10.5)：
  │   │   │   │
──┼───┼───┼───┼──
  │░░░│▓▓▓│▓▓▓│░░░│  ← 边界跨越像素
──┼───┼───┼───┼──      需要抗锯齿处理
  │▓▓▓│███│███│▓▓▓│    ░ = 浅色（部分覆盖）
──┼───┼───┼───┼──      ▓ = 中等（部分覆盖）
  │░░░│▓▓▓│▓▓▓│░░░│    █ = 深色（完全覆盖）
```

**1px 线条的清晰度问题**

这是 Canvas 开发中最常见的问题之一。绘制 1px 线条时，如果使用整数坐标，线条会变成 2px 且颜色变淡：

```javascript
// 问题代码
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(50, 50);    // 整数坐标
ctx.lineTo(200, 50);
ctx.stroke();
// 结果：线条看起来是 2px 宽，颜色比设定的要淡

// 解决方案：偏移 0.5px
ctx.beginPath();
ctx.moveTo(50.5, 50.5);  // 偏移 0.5
ctx.lineTo(200.5, 50.5);
ctx.stroke();
// 结果：清晰的 1px 线条
```

**原理解释**：

```
整数坐标 (50, 50) 画 1px 线：

    49   50   51
  ──┼────┼────┼──
49  │    │    │
  ──┼────┼────┼──
50  │░░░░│░░░░│     ← 线条中心在像素边界上
  ──┼────┼────┼──      所以向两边各扩展 0.5px
51  │░░░░│░░░░│        覆盖了 2 行像素
  ──┼────┼────┼──      每行只填充 50%，颜色变淡

偏移坐标 (50.5, 50.5) 画 1px 线：

    49   50   51
  ──┼────┼────┼──
49  │    │    │
  ──┼────┼────┼──
50  │    │████│     ← 线条中心在像素中心
  ──┼────┼────┼──      完整覆盖 1 行像素
51  │    │    │        颜色 100%
  ──┼────┼────┼──
```

**封装一个清晰线条绘制函数**：

```javascript
/**
 * 绘制清晰的直线
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1 - 起点 X
 * @param {number} y1 - 起点 Y
 * @param {number} x2 - 终点 X
 * @param {number} y2 - 终点 Y
 */
function drawCrispLine(ctx, x1, y1, x2, y2) {
    // 只有奇数线宽需要偏移
    const offset = ctx.lineWidth % 2 === 1 ? 0.5 : 0;
    
    ctx.beginPath();
    ctx.moveTo(Math.round(x1) + offset, Math.round(y1) + offset);
    ctx.lineTo(Math.round(x2) + offset, Math.round(y2) + offset);
    ctx.stroke();
}

// 使用
ctx.strokeStyle = '#333';
ctx.lineWidth = 1;
drawCrispLine(ctx, 50, 50, 200, 50);  // 清晰的 1px 水平线
drawCrispLine(ctx, 50, 50, 50, 200);  // 清晰的 1px 垂直线
```

---

## 1.7 高清屏（Retina）适配

### 1.7.1 问题的由来

2010 年，Apple 推出了配备 Retina 显示屏的 iPhone 4。从此，高清屏成为主流。但这给 Canvas 开发带来了新的挑战。

**什么是 Retina 显示屏？**

Retina 显示屏的像素密度更高。以 iPhone 4 为例，它的屏幕在物理尺寸不变的情况下，像素数量翻了 4 倍（横向 2 倍，纵向 2 倍）。

```
普通屏幕：
┌─┬─┐
│ │ │  2×2 = 4 个物理像素
├─┼─┤
│ │ │
└─┴─┘

Retina 屏幕（2x）：
┌┬┬┬┐
├┼┼┼┤
├┼┼┼┤  4×4 = 16 个物理像素
├┼┼┼┤  显示同样大小的区域
└┴┴┴┘
```

为了让旧的网页和应用看起来大小不变，操作系统引入了**设备像素比（Device Pixel Ratio, DPR）**的概念。

### 1.7.2 设备像素比（devicePixelRatio）

DPR 表示一个 CSS 像素对应多少个物理像素：

```javascript
const dpr = window.devicePixelRatio;
console.log('当前设备 DPR:', dpr);

// 常见设备的 DPR：
// 普通显示器：1
// MacBook Retina：2
// iPhone 6/7/8：2
// iPhone 6/7/8 Plus：3
// iPhone X/11/12/13：3
// 部分安卓设备：1.5, 2.75 等奇怪的值
```

**DPR 对 Canvas 的影响**

假设你创建一个 200×200 的 Canvas：

```javascript
canvas.width = 200;
canvas.height = 200;
canvas.style.width = '200px';
canvas.style.height = '200px';
```

在普通屏幕（DPR=1）上：
- Canvas 有 200×200 = 40,000 个像素
- 显示在 200×200 的 CSS 像素区域
- 每个 Canvas 像素 = 1 个物理像素
- 结果：清晰

在 Retina 屏幕（DPR=2）上：
- Canvas 仍然只有 200×200 = 40,000 个像素
- 但显示在 400×400 的物理像素区域
- 每个 Canvas 像素被拉伸为 2×2 个物理像素
- 结果：模糊！

```
普通屏幕（DPR=1）：          Retina 屏幕（DPR=2）：
Canvas 像素 = 物理像素        Canvas 像素被拉伸

  ■ = 1 个 Canvas 像素          ■ = 1 个 Canvas 像素
                               被显示为 4 个物理像素
┌─┬─┬─┐                    ┌─┬─┬─┬─┬─┬─┐
│■│■│■│                    │■│■│■│■│■│■│
├─┼─┼─┤   在 Retina 上     ├─┼─┼─┼─┼─┼─┤
│■│■│■│   ────────→       │■│■│■│■│■│■│
├─┼─┼─┤   200px 变成      ├─┼─┼─┼─┼─┼─┤
│■│■│■│   400 物理像素    │■│■│■│■│■│■│
└─┴─┴─┘                    ├─┼─┼─┼─┼─┼─┤
 清晰                      │■│■│■│■│■│■│
                           ├─┼─┼─┼─┼─┼─┤
                           │■│■│■│■│■│■│
                           ├─┼─┼─┼─┼─┼─┤
                           │■│■│■│■│■│■│
                           └─┴─┴─┴─┴─┴─┘
                             模糊！
```

### 1.7.3 解决方案：缩放 Canvas

解决方案的核心思想是：**创建更大的 Canvas，然后缩小显示**。

```javascript
const dpr = window.devicePixelRatio || 1;
const width = 200;  // 期望的逻辑尺寸
const height = 200;

// 1. 创建更大的 Canvas（乘以 DPR）
canvas.width = width * dpr;   // 400（在 2x 屏幕上）
canvas.height = height * dpr; // 400

// 2. 用 CSS 把它缩小显示
canvas.style.width = width + 'px';   // 200px
canvas.style.height = height + 'px'; // 200px

// 3. 缩放绘制上下文
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

// 现在可以用逻辑坐标绑制，自动适配高清屏
ctx.fillRect(0, 0, 50, 50);  // 逻辑上 50×50
// 实际绘制 100×100 像素，但显示为 50×50 CSS 像素
// 结果：在 Retina 屏幕上也清晰！
```

**原理解释**：

```
适配后的 Retina 屏幕（DPR=2）：

Canvas 尺寸：400×400 像素
显示尺寸：200×200 CSS 像素（= 400×400 物理像素）
ctx.scale(2, 2)：所有绘制坐标乘以 2

结果：
  50×50 的逻辑矩形
  → ctx.scale(2,2) 后变成 100×100 Canvas 像素
  → 显示在 100×100 物理像素的区域
  → 每个 Canvas 像素 = 1 个物理像素
  → 清晰！
```

### 1.7.4 封装高清 Canvas 创建函数

```javascript
/**
 * 创建适配高清屏的 Canvas
 * @param {number} width - 逻辑宽度
 * @param {number} height - 逻辑高度
 * @returns {Object} { canvas, ctx, dpr }
 */
function createHDCanvas(width, height) {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    
    // 设置实际尺寸（考虑 DPR）
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    
    // 设置显示尺寸
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // 获取上下文并缩放
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return { canvas, ctx, dpr };
}

// 使用示例
const { canvas, ctx, dpr } = createHDCanvas(800, 600);
document.body.appendChild(canvas);

console.log(`创建了 ${800}×${600} 的高清 Canvas（实际 ${canvas.width}×${canvas.height} 像素）`);

// 现在可以用逻辑坐标绘图
ctx.fillStyle = '#4D7CFF';
ctx.fillRect(100, 100, 200, 150);  // 使用逻辑坐标
```

### 1.7.5 动态处理 DPR 变化

在某些场景下，DPR 可能会变化：

- 用户将窗口从普通显示器拖到 Retina 显示器
- 用户改变了显示器的缩放设置

```javascript
class HDCanvas {
    constructor(container, width, height) {
        this.container = container;
        this.logicalWidth = width;
        this.logicalHeight = height;
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        container.appendChild(this.canvas);
        
        // 初始化
        this.updateDPR();
        
        // 监听 DPR 变化
        this.setupDPRListener();
    }
    
    updateDPR() {
        const newDPR = window.devicePixelRatio || 1;
        
        if (newDPR !== this.dpr) {
            this.dpr = newDPR;
            this.resize();
        }
    }
    
    resize() {
        const { logicalWidth, logicalHeight, dpr, canvas, ctx } = this;
        
        // 更新实际尺寸
        canvas.width = Math.round(logicalWidth * dpr);
        canvas.height = Math.round(logicalHeight * dpr);
        
        // 更新显示尺寸
        canvas.style.width = logicalWidth + 'px';
        canvas.style.height = logicalHeight + 'px';
        
        // 重置并缩放上下文
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // 通知需要重绘
        this.onResize?.();
    }
    
    setupDPRListener() {
        // 使用 matchMedia 监听 DPR 变化
        const checkDPR = () => {
            this.updateDPR();
            
            // 创建新的媒体查询（因为 DPR 可能已经变化）
            const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
            const mq = window.matchMedia(mqString);
            mq.addEventListener('change', checkDPR, { once: true });
        };
        
        checkDPR();
    }
    
    // 获取逻辑坐标
    getLogicalPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
}

// 使用
const hdCanvas = new HDCanvas(document.body, 800, 600);

hdCanvas.onResize = () => {
    console.log('DPR 变化或尺寸变化，需要重绘');
    redrawContent(hdCanvas.ctx);
};
```

---

## 1.8 状态管理

### 1.8.1 什么是 Canvas 状态？

Canvas 的绑制上下文维护着大量的状态属性。每次绘图时，这些属性会影响绘制结果。

```javascript
// 一些会影响绘制的状态属性
ctx.fillStyle = 'red';           // 填充颜色
ctx.strokeStyle = 'blue';        // 描边颜色
ctx.lineWidth = 2;               // 线条宽度
ctx.globalAlpha = 0.5;           // 全局透明度
ctx.font = '20px Arial';         // 字体
// ... 还有很多
```

问题是：当你修改这些属性后，它们会一直保持，影响后续的绑制。这可能导致意外的结果：

```javascript
// 绘制一个红色矩形
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);

// 打算绘制一个蓝色矩形，但忘记改颜色
ctx.fillRect(150, 0, 100, 100);  // 还是红色！
```

### 1.8.2 save() 和 restore()

为了解决这个问题，Canvas 提供了状态栈机制：

- `save()`：把当前状态压入栈
- `restore()`：从栈中弹出状态并恢复

```javascript
// 初始状态
ctx.fillStyle = 'black';

// 保存状态
ctx.save();

// 修改状态
ctx.fillStyle = 'red';
ctx.globalAlpha = 0.5;
ctx.fillRect(0, 0, 100, 100);  // 红色半透明

// 恢复状态
ctx.restore();

// 现在 fillStyle 又是 'black'，globalAlpha 又是 1
ctx.fillRect(150, 0, 100, 100);  // 黑色不透明
```

**状态栈可视化**：

```
初始:
栈: [ 默认状态 ]

save():
栈: [ 默认状态, 状态1 ]

再 save():
栈: [ 默认状态, 状态1, 状态2 ]

restore():
栈: [ 默认状态, 状态1 ]

再 restore():
栈: [ 默认状态 ]
```

### 1.8.3 哪些状态会被保存？

`save()` 保存的状态包括：

| 类别 | 属性 |
|------|------|
| **变换** | 当前变换矩阵（translate、rotate、scale 的累积效果） |
| **裁剪** | 当前裁剪区域（clip 的效果） |
| **样式** | fillStyle、strokeStyle |
| **线条** | lineWidth、lineCap、lineJoin、miterLimit、lineDash、lineDashOffset |
| **阴影** | shadowOffsetX、shadowOffsetY、shadowBlur、shadowColor |
| **合成** | globalAlpha、globalCompositeOperation |
| **文本** | font、textAlign、textBaseline、direction |
| **平滑** | imageSmoothingEnabled、imageSmoothingQuality |
| **滤镜** | filter |

**注意：以下内容不会被保存**：

1. **Canvas 上已绘制的内容**：像素数据不在状态中
2. **当前路径**：beginPath() 到 fill()/stroke() 之间的路径

### 1.8.4 状态管理的最佳实践

**原则 1：每个绘图函数都应该使用 save/restore**

```javascript
// ✅ 好的做法：隔离状态
function drawRedCircle(ctx, x, y, radius) {
    ctx.save();
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 调用后不会影响其他绘制
drawRedCircle(ctx, 100, 100, 50);
ctx.fillRect(200, 200, 50, 50);  // 使用之前的 fillStyle
```

**原则 2：使用变换时更要注意状态管理**

```javascript
// ❌ 错误：变换会累积
function drawRotatedRect(ctx, x, y, width, height, angle) {
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillRect(-width/2, -height/2, width, height);
    // 忘记恢复！后续所有绘制都会受影响
}

// ✅ 正确
function drawRotatedRect(ctx, x, y, width, height, angle) {
    ctx.save();
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillRect(-width/2, -height/2, width, height);
    
    ctx.restore();  // 恢复变换
}
```

**原则 3：批量绘制时可以共享状态**

```javascript
// ✅ 高效：一次 save/restore 处理多个同样式图形
function drawManyRedCircles(ctx, circles) {
    ctx.save();
    ctx.fillStyle = 'red';
    
    for (const { x, y, radius } of circles) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
```

### 1.8.5 性能考虑

`save()` 和 `restore()` 有一定的性能开销。在极高频率的绑制中（如游戏的每帧），可以考虑手动管理状态：

```javascript
// 方法 1：使用 save/restore（通用，稍慢）
function draw1(ctx) {
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore();
}

// 方法 2：手动保存和恢复（性能敏感场景）
function draw2(ctx) {
    const oldFillStyle = ctx.fillStyle;
    
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    ctx.fillStyle = oldFillStyle;
}

// 方法 3：知道后续不需要旧状态，直接不恢复
function drawFinalElement(ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    // 不需要恢复，因为这是最后一个绘制操作
}
```

---

## 1.9 完整示例：Canvas 应用模板

让我们把本章学到的知识整合成一个可复用的 Canvas 应用模板：

```javascript
/**
 * Canvas 应用基础类
 * 处理高清屏适配、响应式尺寸、事件等
 */
class CanvasApp {
    /**
     * @param {HTMLElement} container - 容器元素
     * @param {Object} options - 配置选项
     */
    constructor(container, options = {}) {
        // 解析配置
        const {
            width = 800,
            height = 600,
            backgroundColor = null,
            alpha = true,
            willReadFrequently = false,
            autoResize = true,
        } = options;
        
        // 保存配置
        this.container = container;
        this.logicalWidth = width;
        this.logicalHeight = height;
        this.autoResize = autoResize;
        
        // 获取 DPR
        this.dpr = window.devicePixelRatio || 1;
        
        // 创建 Canvas 元素
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', {
            alpha,
            willReadFrequently,
        });
        
        // 设置背景色（如果指定）
        if (backgroundColor) {
            this.canvas.style.backgroundColor = backgroundColor;
        }
        
        // 初始化尺寸
        this.resize(width, height);
        
        // 添加到容器
        container.appendChild(this.canvas);
        
        // 设置事件监听
        this.bindEvents();
    }
    
    /**
     * 调整 Canvas 尺寸
     * @param {number} width - 逻辑宽度
     * @param {number} height - 逻辑高度
     */
    resize(width, height) {
        this.logicalWidth = width;
        this.logicalHeight = height;
        this.dpr = window.devicePixelRatio || 1;
        
        // 设置实际尺寸
        this.canvas.width = Math.round(width * this.dpr);
        this.canvas.height = Math.round(height * this.dpr);
        
        // 设置显示尺寸
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // 缩放上下文
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        
        // 触发重绘回调
        this.onResize?.(width, height);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听窗口大小变化
        if (this.autoResize) {
            window.addEventListener('resize', () => {
                const rect = this.container.getBoundingClientRect();
                this.resize(rect.width, rect.height);
            });
        }
        
        // 监听 DPR 变化
        this.setupDPRListener();
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            const pos = this.getPointerPosition(e);
            this.onMouseDown?.(pos, e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = this.getPointerPosition(e);
            this.onMouseMove?.(pos, e);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            const pos = this.getPointerPosition(e);
            this.onMouseUp?.(pos, e);
        });
    }
    
    /**
     * 监听 DPR 变化
     */
    setupDPRListener() {
        const checkDPR = () => {
            const newDPR = window.devicePixelRatio || 1;
            if (newDPR !== this.dpr) {
                this.resize(this.logicalWidth, this.logicalHeight);
            }
            
            const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
            const mq = window.matchMedia(mqString);
            mq.addEventListener('change', checkDPR, { once: true });
        };
        
        checkDPR();
    }
    
    /**
     * 获取指针在 Canvas 上的逻辑坐标
     * @param {MouseEvent} event
     * @returns {{x: number, y: number}}
     */
    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
    
    /**
     * 清空 Canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
    }
    
    /**
     * 导出为 DataURL
     * @param {string} type - MIME 类型
     * @param {number} quality - 质量（0-1）
     * @returns {string}
     */
    toDataURL(type = 'image/png', quality = 1) {
        return this.canvas.toDataURL(type, quality);
    }
    
    /**
     * 导出为 Blob
     * @param {string} type - MIME 类型
     * @param {number} quality - 质量（0-1）
     * @returns {Promise<Blob>}
     */
    toBlob(type = 'image/png', quality = 1) {
        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, type, quality);
        });
    }
    
    /**
     * 销毁实例
     */
    destroy() {
        this.canvas.remove();
        this.canvas = null;
        this.ctx = null;
    }
}

// ============ 使用示例 ============

// 创建应用
const app = new CanvasApp(document.getElementById('container'), {
    width: 800,
    height: 600,
    backgroundColor: '#f5f5f5',
});

// 设置回调
app.onResize = (width, height) => {
    console.log(`Canvas 尺寸变化: ${width}×${height}`);
    draw();
};

app.onMouseDown = (pos, event) => {
    console.log(`鼠标按下: (${pos.x}, ${pos.y})`);
};

app.onMouseMove = (pos, event) => {
    // 鼠标移动处理
};

// 绘图函数
function draw() {
    const { ctx, logicalWidth, logicalHeight } = app;
    
    // 清空
    app.clear();
    
    // 绘制一些图形
    ctx.save();
    
    ctx.fillStyle = '#4D7CFF';
    ctx.fillRect(100, 100, 200, 150);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(500, 200, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 初始绘制
draw();
```

---

## 1.10 本章小结

恭喜你完成了 Canvas 基础的第一章！让我们回顾一下学到的关键知识：

### 核心概念

| 概念 | 要点 |
|------|------|
| **Canvas 本质** | HTML5 位图绘制技术，即时模式渲染 |
| **Canvas vs SVG** | Canvas 适合大量图形、动画；SVG 适合可交互的矢量图 |
| **绘制上下文** | Canvas 的"画笔"，通过 `getContext('2d')` 获取 |
| **两种尺寸** | 绘制尺寸（像素）和显示尺寸（CSS）必须区分 |
| **坐标系** | 原点左上角，X 向右，Y 向下 |
| **高清屏适配** | Canvas 尺寸乘以 DPR，ctx.scale(dpr, dpr) |
| **状态管理** | save() 保存状态，restore() 恢复状态 |

### 常见问题与解决

| 问题 | 解决方案 |
|------|---------|
| Canvas 内容模糊 | 正确适配高清屏（DPR） |
| 1px 线条模糊 | 坐标偏移 0.5px |
| 尺寸变化后内容消失 | 修改尺寸后需要重绘 |
| 绘图状态污染 | 使用 save/restore 隔离 |

### 最佳实践

1. **始终同时设置绘制尺寸和显示尺寸**
2. **适配高清屏是必要的**，除非你只针对普通屏幕
3. **封装好初始化代码**，避免重复处理这些细节
4. **绘图函数使用 save/restore**，保持状态隔离

---

## 1.11 练习题

### 基础练习

1. **创建一个 600×400 的 Canvas**，适配高清屏，在中心绘制一个 200×100 的蓝色矩形。

2. **绘制一个清晰的网格**（20px 间距），注意 1px 线条的清晰度问题。

3. **实现一个简单的画板**：鼠标点击时在点击位置绘制一个圆点。

### 进阶练习

4. **实现响应式 Canvas**：当窗口大小变化时，Canvas 自动调整大小并保持内容。

5. **实现一个 Canvas 工具类**，支持：
   - 高清屏适配
   - 响应式尺寸
   - 鼠标坐标获取
   - 导出为图片

### 挑战练习

6. **研究 OffscreenCanvas**：
   - 在 Web Worker 中创建 OffscreenCanvas
   - 在 Worker 中绘制复杂图形
   - 将结果传回主线程显示

---

## 1.12 延伸阅读

- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [High DPI Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_canvas)

---

**下一章预告**：在第2章中，我们将学习如何使用 Canvas 绁制各种基础图形——矩形、圆形、直线、多边形等。你将掌握 Canvas 绘图的核心技能。

---

**文档版本**：v2.0  
**字数统计**：约 15,000 字  
**代码示例**：30+ 个
