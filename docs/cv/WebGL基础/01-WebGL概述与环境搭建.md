# 第1章：WebGL 概述与环境搭建

## 1.1 章节概述

欢迎来到 WebGL 的世界！如果你已经掌握了 Canvas 2D，那么你已经了解了如何在浏览器中绑制图形。但 Canvas 2D 有一个根本性的限制：它使用 CPU 进行渲染。当你需要绑制成千上万个图形元素、实现复杂的 3D 场景、或者进行实时图像处理时，CPU 渲染就会成为瓶颈。

**WebGL（Web Graphics Library）** 的出现解决了这个问题。它让 JavaScript 能够直接与 **GPU（图形处理单元）** 通信，利用 GPU 强大的并行计算能力进行高性能渲染。

本章将带你：

- 深入理解 WebGL 是什么、它的历史和发展
- 明确 WebGL 与 Canvas 2D 的本质区别
- 搭建完整的开发环境
- 编写你的第一个 WebGL 程序
- 理解 WebGL 的状态机编程模型

学完本章，你将对 WebGL 有一个全面的认识，并能够创建基本的 WebGL 应用。

---

## 1.2 什么是 WebGL？

### 1.2.1 从一个问题说起

想象你正在开发一个数据可视化应用，需要实时渲染 100,000 个数据点。使用 Canvas 2D，你的代码可能是这样的：

```javascript
// Canvas 2D 渲染 100,000 个点
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 100000; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = points[i].color;
        ctx.fill();
    }
    
    requestAnimationFrame(render);
}
```

运行这段代码，你会发现帧率可能只有 5-10 FPS，因为：

1. **CPU 串行处理**：Canvas 2D 使用 CPU 渲染，每个点必须依次处理
2. **API 调用开销**：100,000 次 `beginPath()`、`arc()`、`fill()` 调用产生巨大开销
3. **状态切换成本**：频繁改变 `fillStyle` 导致性能下降

而使用 WebGL，同样的任务可以在 60+ FPS 下轻松完成。这是因为 GPU 可以**并行处理**这些点——它有数千个处理核心，可以同时计算多个点的位置和颜色。

### 1.2.2 WebGL 的本质

**WebGL** 是一个 JavaScript API，它允许网页直接访问计算机的图形硬件（GPU）。从技术角度看：

```
WebGL 的技术栈

┌─────────────────────────────────────────────────────────────────┐
│                        你的 JavaScript 代码                      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WebGL API                                │
│    (gl.bindBuffer, gl.bindTexture, gl.drawArrays, ...)          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     浏览器的 WebGL 实现                           │
│              (将 WebGL 调用转换为底层图形 API)                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
           ┌─────────┐    ┌─────────┐    ┌─────────┐
           │ OpenGL  │    │ Direct3D│    │  Metal  │
           │ (Linux) │    │(Windows)│    │ (macOS) │
           └────┬────┘    └────┬────┘    └────┬────┘
                │              │              │
                └──────────────┼──────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GPU 硬件 (显卡)                              │
│              数千个并行处理核心，高速显存                          │
└─────────────────────────────────────────────────────────────────┘
```

WebGL 基于 **OpenGL ES**（OpenGL for Embedded Systems）标准，这是 OpenGL 的一个子集，专为移动设备和嵌入式系统设计。这意味着 WebGL 代码在不同平台上具有良好的一致性。

### 1.2.3 GPU vs CPU：并行计算的力量

要理解 WebGL 的性能优势，我们需要了解 GPU 和 CPU 的架构差异：

```
CPU 架构（少量强核心）

┌─────────────────────────────────────────┐
│                 CPU                      │
│  ┌───────────┐  ┌───────────┐           │
│  │  核心 1   │  │  核心 2   │   ...     │
│  │ (强大)    │  │ (强大)    │  (4-16核) │
│  │           │  │           │           │
│  │  复杂     │  │  复杂     │           │
│  │  逻辑     │  │  逻辑     │           │
│  └───────────┘  └───────────┘           │
│                                         │
│  特点：少量核心，但每个核心非常强大       │
│  擅长：复杂逻辑、分支预测、串行任务       │
└─────────────────────────────────────────┘


GPU 架构（大量简单核心）

┌─────────────────────────────────────────┐
│                 GPU                      │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐      │
│  │核││核││核││核││核││核││核││核│ ...  │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘      │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐      │
│  │核││核││核││核││核││核││核││核│ ...  │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘      │
│         ... (数千个核心) ...             │
│                                         │
│  特点：大量核心，但每个核心相对简单       │
│  擅长：并行计算、相同操作应用于大量数据   │
└─────────────────────────────────────────┘
```

**关键洞察**：GPU 的核心虽然不如 CPU 核心强大，但数量是 CPU 的 100-1000 倍。对于图形渲染这种"对大量数据执行相同操作"的任务，GPU 的并行架构有巨大优势。

举个例子：

- **CPU 处理 100,000 像素**：1 个核心依次处理，假设每像素需要 1μs，总共需要 100ms
- **GPU 处理 100,000 像素**：1000 个核心并行处理，每个核心处理 100 像素，只需要 0.1ms

这就是为什么 WebGL 能够实现如此高性能的原因。

### 1.2.4 WebGL 的发展历史

了解历史有助于理解 WebGL 的设计决策：

| 年份 | 事件 | 意义 |
|------|------|------|
| **1992** | OpenGL 1.0 发布 | 跨平台图形 API 的开始 |
| **2004** | OpenGL ES 1.0 发布 | 移动/嵌入式设备的 OpenGL |
| **2006** | Mozilla 实验 Canvas 3D | WebGL 的前身 |
| **2007** | OpenGL ES 2.0 发布 | 引入可编程着色器 |
| **2009** | Khronos 成立 WebGL 工作组 | WebGL 标准化开始 |
| **2011** | WebGL 1.0 正式发布 | 基于 OpenGL ES 2.0 |
| **2012** | OpenGL ES 3.0 发布 | 更多现代特性 |
| **2017** | WebGL 2.0 正式发布 | 基于 OpenGL ES 3.0 |
| **2023+** | WebGPU 逐步普及 | 下一代 Web 图形 API |

### 1.2.5 WebGL 1.0 与 WebGL 2.0 的区别

目前主流浏览器都支持 WebGL 2.0，但了解两个版本的差异很重要：

| 特性 | WebGL 1.0 | WebGL 2.0 |
|------|-----------|-----------|
| **基于标准** | OpenGL ES 2.0 | OpenGL ES 3.0 |
| **着色器语言** | GLSL ES 1.0 | GLSL ES 3.0 |
| **纹理尺寸** | 必须是 2 的幂次方 | 任意尺寸 |
| **3D 纹理** | 不支持 | 支持 |
| **顶点数组对象 (VAO)** | 需要扩展 | 原生支持 |
| **实例化渲染** | 需要扩展 | 原生支持 |
| **多渲染目标 (MRT)** | 需要扩展 | 原生支持 |
| **整数属性** | 不支持 | 支持 |
| **统一缓冲对象 (UBO)** | 不支持 | 支持 |
| **变换反馈** | 不支持 | 支持 |

**选择建议**：

- 如果不需要兼容老旧设备，优先使用 **WebGL 2.0**
- 如果需要广泛兼容性，使用 **WebGL 1.0** 并按需加载扩展
- 本教程将主要使用 **WebGL 2.0**，但会标注 WebGL 1.0 的差异

---

## 1.3 WebGL 与 Canvas 2D 的本质区别

### 1.3.1 渲染方式的根本不同

这是最核心的区别：

```
Canvas 2D 渲染流程

JavaScript 代码
     │
     ▼
┌─────────────────┐
│  ctx.fillRect() │ ──→ CPU 计算每个像素
│  ctx.arc()      │ ──→ CPU 绘制到内存
│  ctx.drawImage()│ ──→ CPU 合成图像
└─────────────────┘
     │
     ▼
┌─────────────────┐
│     Canvas      │ ──→ CPU 将内存复制到显存
│     显示        │
└─────────────────┘

问题：CPU 成为瓶颈，所有计算都是串行的


WebGL 渲染流程

JavaScript 代码
     │
     │ 上传数据到 GPU
     ▼
┌─────────────────┐
│   GPU 显存      │
│  (顶点缓冲、    │
│   纹理等)       │
└─────────────────┘
     │
     │ 着色器程序在 GPU 上执行
     ▼
┌─────────────────┐
│   GPU 并行渲染  │ ──→ 数千核心同时计算
│   每个核心处理  │ ──→ 直接写入帧缓冲
│   不同的像素    │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│     Canvas      │ ──→ GPU 直接输出到屏幕
│     显示        │
└─────────────────┘

优势：并行计算，数据已在 GPU 显存中
```

### 1.3.2 编程模型的差异

**Canvas 2D：命令式 API**

Canvas 2D 采用简单直观的命令式 API，你告诉它"画什么"，它就画什么：

```javascript
// Canvas 2D：绘制一个红色矩形
ctx.fillStyle = 'red';
ctx.fillRect(100, 100, 200, 150);

// 绘制一个渐变圆
const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 100);
gradient.addColorStop(0, 'white');
gradient.addColorStop(1, 'blue');
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(200, 200, 100, 0, Math.PI * 2);
ctx.fill();
```

**WebGL：GPU 编程范式**

WebGL 需要你像 GPU 程序员一样思考。你需要：

1. **编写着色器程序**：告诉 GPU 如何处理每个顶点和每个像素
2. **准备数据**：将顶点数据上传到 GPU 显存
3. **配置管线**：设置各种渲染状态
4. **发起绘制调用**：命令 GPU 开始渲染

```javascript
// WebGL：绘制一个红色三角形（简化版）

// 步骤 1：编写着色器
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
    }
`;

// 步骤 2：编译着色器、创建程序（省略详细代码）
// ...

// 步骤 3：准备顶点数据
const vertices = new Float32Array([
     0.0,  0.5,   // 顶点 1
    -0.5, -0.5,   // 顶点 2
     0.5, -0.5    // 顶点 3
]);

// 步骤 4：创建缓冲区并上传数据
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// 步骤 5：配置顶点属性
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 步骤 6：绘制
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

**可以看到**：WebGL 代码量更多，但这些"样板代码"的背后是对 GPU 的精细控制。一旦数据上传到 GPU，渲染就会非常快。

### 1.3.3 坐标系统的差异

**Canvas 2D 坐标系**：

```
(0, 0) ───────────────→ X (正方向向右)
   │
   │
   │
   │
   ▼
   Y (正方向向下)

特点：
- 原点在左上角
- Y 轴向下
- 单位是像素
- 范围由 Canvas 尺寸决定
```

**WebGL 坐标系（标准化设备坐标 NDC）**：

```
                Y (正方向向上)
                ↑
                │ (0, 1)
                │
(-1, 0) ────────┼────────→ X (正方向向右)
                │          (1, 0)
                │
                │ (0, -1)

特点：
- 原点在中心
- Y 轴向上
- 范围固定：X: [-1, 1], Y: [-1, 1], Z: [-1, 1]
- 与 Canvas 像素尺寸无关
```

这种差异意味着：

```javascript
// Canvas 2D：在 (100, 100) 画一个点
ctx.fillRect(100, 100, 1, 1);

// WebGL：需要将像素坐标转换为 NDC
// 假设 Canvas 尺寸是 800 × 600
// NDC_x = (100 / 800) * 2 - 1 = -0.75
// NDC_y = 1 - (100 / 600) * 2 = 0.667
// 或者在着色器中进行转换
```

### 1.3.4 何时选择 WebGL？

**适合使用 Canvas 2D 的场景**：

- 简单的 2D 图形和 UI 绑制
- 图表和数据可视化（数据量不大时）
- 快速原型开发
- 不需要复杂特效的应用
- 需要频繁读取像素数据的场景

**适合使用 WebGL 的场景**：

- **大量图形元素**：超过 1,000 个元素时，WebGL 优势明显
- **3D 场景**：WebGL 是浏览器中唯一的原生 3D 渲染方案
- **复杂着色器特效**：模糊、光照、后处理等
- **高帧率要求**：游戏、动画、实时可视化
- **GPU 图像处理**：滤镜、卷积、图像分析
- **粒子系统**：成千上万的粒子效果

### 1.3.5 性能对比实测

让我们用一个具体的测试来感受差异：

```javascript
// 测试：绘制 N 个随机位置的小圆

// Canvas 2D 版本
function renderCanvas2D(ctx, points) {
    const start = performance.now();
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
    }
    
    return performance.now() - start;
}

// WebGL 版本（使用实例化渲染）
function renderWebGL(gl, program, points) {
    const start = performance.now();
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // 更新实例数据
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointsData);
    
    // 一次绘制所有点
    gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 32, points.length);
    
    return performance.now() - start;
}
```

**测试结果**（典型数据）：

| 点数量 | Canvas 2D 耗时 | WebGL 耗时 | 倍数差异 |
|--------|---------------|------------|---------|
| 1,000 | 5ms | 0.5ms | 10× |
| 10,000 | 50ms | 0.8ms | 60× |
| 100,000 | 500ms | 2ms | 250× |
| 1,000,000 | 卡死 | 15ms | - |

---

## 1.4 开发环境搭建

### 1.4.1 浏览器支持检测

在开始之前，我们需要确保用户的浏览器支持 WebGL：

```javascript
/**
 * WebGL 支持检测工具
 */
class WebGLSupport {
    /**
     * 检测 WebGL 支持情况
     * @returns {Object} 支持信息
     */
    static detect() {
        const canvas = document.createElement('canvas');
        
        // 尝试获取 WebGL 2.0
        let gl = canvas.getContext('webgl2');
        if (gl) {
            return {
                supported: true,
                version: 2,
                gl: gl,
                renderer: gl.getParameter(gl.RENDERER),
                vendor: gl.getParameter(gl.VENDOR),
                glslVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxTextureUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
            };
        }
        
        // 尝试获取 WebGL 1.0
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            return {
                supported: true,
                version: 1,
                gl: gl,
                renderer: gl.getParameter(gl.RENDERER),
                vendor: gl.getParameter(gl.VENDOR),
                glslVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxTextureUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
            };
        }
        
        // 不支持 WebGL
        return {
            supported: false,
            version: 0,
            reason: this.diagnoseFailure()
        };
    }
    
    /**
     * 诊断 WebGL 不可用的原因
     */
    static diagnoseFailure() {
        const reasons = [];
        
        // 检查是否是旧版浏览器
        const ua = navigator.userAgent;
        if (/MSIE [1-9]\./.test(ua)) {
            reasons.push('浏览器版本过旧（IE9 及以下不支持 WebGL）');
        }
        
        // 检查是否被禁用
        if (typeof WebGLRenderingContext === 'undefined') {
            reasons.push('浏览器不支持 WebGL API');
        } else {
            reasons.push('WebGL 可能被禁用或显卡驱动有问题');
        }
        
        return reasons.join('; ');
    }
    
    /**
     * 显示用户友好的支持信息
     */
    static showSupportInfo() {
        const info = this.detect();
        
        console.group('WebGL 支持信息');
        console.log('支持状态:', info.supported ? '✅ 支持' : '❌ 不支持');
        
        if (info.supported) {
            console.log('版本:', `WebGL ${info.version}`);
            console.log('渲染器:', info.renderer);
            console.log('厂商:', info.vendor);
            console.log('GLSL 版本:', info.glslVersion);
            console.log('最大纹理尺寸:', info.maxTextureSize);
            console.log('最大顶点属性数:', info.maxVertexAttribs);
            console.log('最大纹理单元数:', info.maxTextureUnits);
        } else {
            console.log('原因:', info.reason);
        }
        
        console.groupEnd();
        
        return info;
    }
}

// 使用
const support = WebGLSupport.showSupportInfo();
if (!support.supported) {
    alert('您的浏览器不支持 WebGL，请使用现代浏览器访问');
}
```

### 1.4.2 主流浏览器支持情况

| 浏览器 | WebGL 1.0 支持 | WebGL 2.0 支持 | 备注 |
|--------|---------------|---------------|------|
| Chrome | 9+ (2011) | 56+ (2017) | 最佳支持 |
| Firefox | 4+ (2011) | 51+ (2017) | 良好支持 |
| Safari | 5.1+ (2012) | 15+ (2021) | 较晚支持 WebGL 2 |
| Edge | 12+ (2015) | 79+ (2020) | Chromium 版本后优秀 |
| IE | 11 (部分) | ❌ | 基本废弃 |
| iOS Safari | 8+ | 15+ | 移动端重要 |
| Android Chrome | 30+ | 58+ | 移动端重要 |

### 1.4.3 开发工具推荐

#### 代码编辑器：VS Code

推荐安装以下扩展：

```json
// .vscode/extensions.json
{
    "recommendations": [
        // GLSL 语法高亮和智能提示
        "slevesque.shader",
        
        // GLSL 语法检查
        "dtoplak.vscode-glsllint",
        
        // 本地服务器（处理跨域）
        "ritwickdey.liveserver",
        
        // WebGL 代码片段
        "nickmcmillan.webgl-snippets"
    ]
}
```

GLSL 代码示例配置：

```json
// .vscode/settings.json
{
    "files.associations": {
        "*.glsl": "glsl",
        "*.vert": "glsl",
        "*.frag": "glsl",
        "*.vs": "glsl",
        "*.fs": "glsl"
    }
}
```

#### 调试工具：Spector.js

**Spector.js** 是最强大的 WebGL 调试工具：

```javascript
// 方法 1：作为 Chrome 扩展安装
// 在 Chrome Web Store 搜索 "Spector.js"

// 方法 2：在代码中集成
// npm install spectorjs

import { Spector } from 'spectorjs';

const spector = new Spector();
spector.displayUI();  // 显示调试 UI

// 现在可以：
// - 捕获单帧
// - 查看所有 WebGL 调用
// - 检查缓冲区和纹理内容
// - 分析性能
```

Spector.js 能做什么：

```
Spector.js 功能

┌─────────────────────────────────────────────────────────────┐
│                     Spector.js 面板                          │
├─────────────────────────────────────────────────────────────┤
│  [捕获] [播放] [分析]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Commands (WebGL 调用列表)                                  │
│  ├─ gl.clear(16640)                                        │
│  ├─ gl.useProgram(program)                                 │
│  ├─ gl.bindBuffer(34962, buffer)                          │
│  ├─ gl.drawArrays(4, 0, 3)                                │
│  └─ ...                                                    │
│                                                             │
│  State (当前 WebGL 状态)                                    │
│  ├─ Viewport: [0, 0, 800, 600]                             │
│  ├─ Clear Color: [0, 0, 0, 1]                              │
│  ├─ Depth Test: enabled                                    │
│  └─ ...                                                    │
│                                                             │
│  Textures (纹理预览)                                        │
│  ├─ [Texture 0] 512x512 RGBA                              │
│  ├─ [Texture 1] 256x256 RGB                               │
│  └─ ...                                                    │
│                                                             │
│  Buffers (缓冲区数据)                                       │
│  ├─ [Buffer 0] 1024 bytes, ARRAY_BUFFER                   │
│  └─ ...                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.4.4 项目结构最佳实践

一个组织良好的 WebGL 项目结构：

```
webgl-project/
│
├── index.html                 # 入口 HTML
│
├── src/
│   ├── main.js               # 主程序入口
│   │
│   ├── core/                 # 核心模块
│   │   ├── WebGLContext.js   # WebGL 上下文管理
│   │   ├── ShaderProgram.js  # 着色器程序封装
│   │   ├── Buffer.js         # 缓冲区封装
│   │   └── Texture.js        # 纹理封装
│   │
│   ├── shaders/              # 着色器源码
│   │   ├── basic.vert        # 顶点着色器
│   │   ├── basic.frag        # 片段着色器
│   │   ├── textured.vert
│   │   ├── textured.frag
│   │   └── ...
│   │
│   ├── geometry/             # 几何体模块
│   │   ├── Geometry.js       # 几何体基类
│   │   ├── Cube.js           # 立方体
│   │   ├── Sphere.js         # 球体
│   │   └── ...
│   │
│   ├── materials/            # 材质模块
│   │   ├── Material.js       # 材质基类
│   │   └── ...
│   │
│   ├── scene/                # 场景模块
│   │   ├── Scene.js          # 场景管理
│   │   ├── Camera.js         # 相机
│   │   └── Light.js          # 光源
│   │
│   └── utils/                # 工具函数
│       ├── math.js           # 数学工具
│       ├── color.js          # 颜色工具
│       └── loader.js         # 资源加载
│
├── assets/                   # 静态资源
│   ├── textures/             # 纹理图片
│   ├── models/               # 3D 模型
│   └── fonts/                # 字体
│
├── lib/                      # 第三方库
│   └── gl-matrix-min.js      # 矩阵运算库
│
└── package.json              # 项目配置
```

---

## 1.5 获取 WebGL 上下文

### 1.5.1 HTML 结构

首先创建一个基本的 HTML 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebGL 入门</title>
    <style>
        /* 重置默认样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* 让 Canvas 填满整个窗口 */
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <canvas id="glCanvas"></canvas>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

### 1.5.2 获取 WebGL 上下文

```javascript
// src/main.js

/**
 * 初始化 WebGL 上下文
 * @param {string} canvasId - Canvas 元素的 ID
 * @param {Object} options - 配置选项
 * @returns {Object} 包含 canvas 和 gl 的对象
 */
function initWebGL(canvasId, options = {}) {
    // 获取 Canvas 元素
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        throw new Error(`找不到 ID 为 "${canvasId}" 的 Canvas 元素`);
    }
    
    // 设置 Canvas 尺寸
    // 注意：Canvas 有两个尺寸概念
    // 1. CSS 尺寸（显示尺寸）
    // 2. 绘图缓冲区尺寸（实际像素）
    resizeCanvas(canvas);
    
    // 上下文属性
    const contextAttributes = {
        alpha: options.alpha ?? true,              // 是否有 alpha 通道
        depth: options.depth ?? true,              // 是否有深度缓冲
        stencil: options.stencil ?? false,         // 是否有模板缓冲
        antialias: options.antialias ?? true,      // 是否抗锯齿
        premultipliedAlpha: options.premultipliedAlpha ?? true,
        preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
        powerPreference: options.powerPreference ?? 'default',
        failIfMajorPerformanceCaveat: options.failIfMajorPerformanceCaveat ?? false
    };
    
    // 尝试获取 WebGL 2.0 上下文
    let gl = canvas.getContext('webgl2', contextAttributes);
    let version = 2;
    
    if (!gl) {
        // 回退到 WebGL 1.0
        gl = canvas.getContext('webgl', contextAttributes) ||
             canvas.getContext('experimental-webgl', contextAttributes);
        version = 1;
    }
    
    if (!gl) {
        throw new Error('无法获取 WebGL 上下文，请检查浏览器设置或更新显卡驱动');
    }
    
    console.log(`WebGL ${version} 初始化成功`);
    console.log('渲染器:', gl.getParameter(gl.RENDERER));
    
    return { canvas, gl, version };
}

/**
 * 调整 Canvas 尺寸以匹配显示尺寸
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean} 尺寸是否改变
 */
function resizeCanvas(canvas) {
    // 获取浏览器显示的 Canvas 尺寸
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    // 检查 Canvas 的绘图缓冲区尺寸是否与显示尺寸不同
    const needResize = canvas.width !== displayWidth || 
                       canvas.height !== displayHeight;
    
    if (needResize) {
        // 设置绘图缓冲区尺寸以匹配显示尺寸
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    
    return needResize;
}

// 初始化
try {
    const { canvas, gl, version } = initWebGL('glCanvas');
    
    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // 设置清屏颜色（深蓝灰色）
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    
    // 清屏
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    console.log('画布尺寸:', canvas.width, '×', canvas.height);
    
} catch (error) {
    console.error('WebGL 初始化失败:', error.message);
    document.body.innerHTML = `
        <div style="padding: 20px; color: red;">
            <h2>WebGL 不可用</h2>
            <p>${error.message}</p>
        </div>
    `;
}
```

### 1.5.3 上下文属性详解

让我们详细了解每个上下文属性：

| 属性 | 默认值 | 说明 |
|------|--------|------|
| `alpha` | `true` | Canvas 是否有透明通道。设为 `false` 可以提高性能 |
| `depth` | `true` | 是否启用深度缓冲（用于 3D 场景的遮挡关系） |
| `stencil` | `false` | 是否启用模板缓冲（用于高级遮罩效果） |
| `antialias` | `true` | 是否启用抗锯齿。提高画质但可能影响性能 |
| `premultipliedAlpha` | `true` | alpha 是否预乘。影响与页面其他元素的混合方式 |
| `preserveDrawingBuffer` | `false` | 是否保留绘图缓冲区。设为 `true` 才能使用 `toDataURL()` |
| `powerPreference` | `'default'` | 电源偏好：`'default'`/`'high-performance'`/`'low-power'` |
| `failIfMajorPerformanceCaveat` | `false` | 如果有严重性能问题是否返回 null |

**性能优化提示**：

```javascript
// 如果不需要透明背景，禁用 alpha 可以提高性能
const gl = canvas.getContext('webgl2', { alpha: false });

// 如果是 2D 应用，不需要深度缓冲
const gl = canvas.getContext('webgl2', { depth: false });

// 移动端或低端设备，可以禁用抗锯齿
const gl = canvas.getContext('webgl2', { antialias: false });

// 需要高性能（如游戏）
const gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' });
```

### 1.5.4 处理 Canvas 尺寸变化

窗口大小变化时，需要更新 Canvas 尺寸和视口：

```javascript
/**
 * 响应式 Canvas 管理
 */
class ResponsiveCanvas {
    constructor(canvas, gl) {
        this.canvas = canvas;
        this.gl = gl;
        this.resizeObserver = null;
        this.onResize = null;
        
        this.setupResizeHandling();
    }
    
    setupResizeHandling() {
        // 方法 1：使用 ResizeObserver（推荐）
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(entries => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.canvas);
        } else {
            // 方法 2：监听 window resize 事件
            window.addEventListener('resize', () => {
                this.handleResize();
            });
        }
    }
    
    handleResize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        if (this.canvas.width !== displayWidth || 
            this.canvas.height !== displayHeight) {
            
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            
            // 更新视口
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            
            // 触发回调
            if (this.onResize) {
                this.onResize(this.canvas.width, this.canvas.height);
            }
            
            console.log('Canvas 尺寸更新:', displayWidth, '×', displayHeight);
        }
    }
    
    dispose() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}

// 使用
const responsiveCanvas = new ResponsiveCanvas(canvas, gl);
responsiveCanvas.onResize = (width, height) => {
    // 重新渲染
    render();
};
```

### 1.5.5 处理上下文丢失

WebGL 上下文可能因为各种原因丢失（如 GPU 重置、显卡驱动更新、系统休眠等）：

```javascript
/**
 * WebGL 上下文丢失处理
 */
class WebGLContextHandler {
    constructor(canvas, gl, initCallback) {
        this.canvas = canvas;
        this.gl = gl;
        this.initCallback = initCallback;
        this.isContextLost = false;
        this.animationFrameId = null;
        
        this.setupContextHandling();
    }
    
    setupContextHandling() {
        // 上下文丢失事件
        this.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();  // 阻止默认行为，允许恢复
            this.handleContextLost();
        });
        
        // 上下文恢复事件
        this.canvas.addEventListener('webglcontextrestored', () => {
            this.handleContextRestored();
        });
    }
    
    handleContextLost() {
        console.warn('WebGL 上下文丢失');
        this.isContextLost = true;
        
        // 停止动画循环
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // 显示提示信息
        this.showMessage('图形上下文丢失，正在尝试恢复...');
    }
    
    handleContextRestored() {
        console.log('WebGL 上下文恢复');
        this.isContextLost = false;
        
        // 重新初始化所有资源
        // 注意：所有 WebGL 资源（缓冲区、纹理、着色器等）都已丢失，需要重建
        if (this.initCallback) {
            this.initCallback();
        }
        
        this.hideMessage();
    }
    
    // 手动模拟上下文丢失（用于测试）
    simulateLoss() {
        const ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext) {
            ext.loseContext();
        }
    }
    
    // 手动恢复上下文
    restoreContext() {
        const ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext) {
            ext.restoreContext();
        }
    }
    
    showMessage(text) {
        let overlay = document.getElementById('webgl-message');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'webgl-message';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                z-index: 10000;
            `;
            document.body.appendChild(overlay);
        }
        overlay.textContent = text;
        overlay.style.display = 'flex';
    }
    
    hideMessage() {
        const overlay = document.getElementById('webgl-message');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}
```

---

## 1.6 第一个 WebGL 程序：清屏

在深入绘制图形之前，让我们先确保 WebGL 基础工作正常——执行一个简单的清屏操作。

### 1.6.1 理解清屏操作

**清屏**看似简单，但它涉及到几个重要概念：

```
WebGL 缓冲区

┌────────────────────────────────────────┐
│              帧缓冲（Framebuffer）       │
│                                        │
│  ┌──────────────────┐  ┌────────────┐  │
│  │                  │  │            │  │
│  │    颜色缓冲      │  │  深度缓冲  │  │
│  │   (存储颜色)     │  │ (存储深度) │  │
│  │                  │  │            │  │
│  └──────────────────┘  └────────────┘  │
│                                        │
│  ┌──────────────────┐                  │
│  │    模板缓冲      │                  │
│  │  (存储模板值)    │                  │
│  └──────────────────┘                  │
│                                        │
└────────────────────────────────────────┘

清屏操作会将这些缓冲区重置为指定的值
```

### 1.6.2 清屏相关 API

```javascript
// 1. 设置清屏值
gl.clearColor(r, g, b, a);  // 颜色缓冲的清屏颜色（RGBA，范围 0-1）
gl.clearDepth(depth);        // 深度缓冲的清屏值（范围 0-1，默认 1.0）
gl.clearStencil(s);          // 模板缓冲的清屏值（整数，默认 0）

// 2. 执行清屏
gl.clear(mask);  // mask 指定要清除哪些缓冲区

// mask 可以是以下常量的组合：
gl.COLOR_BUFFER_BIT    // 颜色缓冲
gl.DEPTH_BUFFER_BIT    // 深度缓冲
gl.STENCIL_BUFFER_BIT  // 模板缓冲

// 可以同时清除多个缓冲区
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

### 1.6.3 颜色值的表示

WebGL 中的颜色使用 **0-1 范围**的浮点数，而不是 CSS 中常见的 0-255：

```javascript
// CSS 颜色转 WebGL 颜色
function cssColorToGL(r, g, b, a = 255) {
    return [r / 255, g / 255, b / 255, a / 255];
}

// 十六进制颜色转 WebGL 颜色
function hexToGL(hex) {
    // 移除 # 前缀
    hex = hex.replace('#', '');
    
    // 处理短格式（如 #FFF）
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return [r, g, b, 1.0];
}

// 使用
const [r, g, b, a] = hexToGL('#4D7CFF');
gl.clearColor(r, g, b, a);
```

### 1.6.4 完整的清屏示例

```javascript
/**
 * 清屏示例 - 带动画的颜色变化
 */
function createClearScreenDemo() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
        alert('WebGL 不可用');
        return;
    }
    
    // 颜色动画参数
    let hue = 0;
    
    /**
     * HSL 转 RGB
     */
    function hslToRgb(h, s, l) {
        h = h / 360;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [r, g, b];
    }
    
    /**
     * 渲染循环
     */
    function render() {
        // 更新颜色（色相循环）
        hue = (hue + 0.5) % 360;
        const [r, g, b] = hslToRgb(hue, 0.7, 0.5);
        
        // 设置清屏颜色
        gl.clearColor(r, g, b, 1.0);
        
        // 清屏
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // 继续动画
        requestAnimationFrame(render);
    }
    
    // 开始渲染
    render();
}

createClearScreenDemo();
```

---

## 1.7 绘制第一个三角形

现在，让我们进入 WebGL 的核心——绘制一个三角形。这需要完整地走一遍 WebGL 的渲染流程。

### 1.7.1 为什么是三角形？

三角形是 GPU 图形渲染的**基本图元**。所有的 3D 模型、2D 形状，最终都会被分解成三角形来渲染：

```
任何形状都可以用三角形组成

矩形 = 2 个三角形
┌─────────┐
│ ╲       │
│   ╲     │
│     ╲   │
│       ╲ │
└─────────┘

圆形 ≈ 很多个三角形
      ╱╲
     ╱  ╲
    ╱    ╲
───●───────
    ╲    ╱
     ╲  ╱
      ╲╱

3D 模型 = 成千上万个三角形
每个三角形有 3 个顶点
```

**为什么是三角形而不是其他形状？**

1. **共面性**：三个点总是在同一个平面上（四个点可能不共面）
2. **最简单的多边形**：三角形是最简单的封闭多边形
3. **硬件优化**：GPU 专门为三角形光栅化优化

### 1.7.2 WebGL 坐标系

WebGL 使用**标准化设备坐标（Normalized Device Coordinates，NDC）**：

```
WebGL 坐标系 (NDC)

                      Y
                      ↑
                      │  (0, 1)
                      │
                      │
   (-1, 0) ───────────┼───────────→ X  (1, 0)
                      │
                      │
                      │  (0, -1)
                      │

坐标范围：
- X: -1 到 +1
- Y: -1 到 +1
- Z: -1 到 +1（深度）

原点 (0, 0) 在 Canvas 中心
Y 轴向上（与 Canvas 2D 相反！）
```

### 1.7.3 着色器代码

WebGL 需要两个着色器：**顶点着色器**和**片段着色器**。

**顶点着色器**：处理每个顶点的位置

```glsl
// 顶点着色器
// 每个顶点执行一次

// attribute: 从 JavaScript 传入的顶点属性
attribute vec2 a_position;

void main() {
    // gl_Position 是内置变量，必须设置
    // 它是一个 vec4，表示顶点在裁剪空间中的位置
    // vec4(x, y, z, w)
    // - x, y, z: 坐标
    // - w: 齐次坐标分量（通常为 1.0）
    gl_Position = vec4(a_position, 0.0, 1.0);
}
```

**片段着色器**：处理每个像素的颜色

```glsl
// 片段着色器
// 每个像素（更准确地说是"片段"）执行一次

// 精度声明（片段着色器必须有）
precision mediump float;

void main() {
    // gl_FragColor 是内置变量
    // 它是一个 vec4，表示像素颜色 (R, G, B, A)
    // 每个分量范围 0.0 到 1.0
    gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0);  // 橙色
}
```

### 1.7.4 创建着色器程序

着色器程序的创建过程：

```
着色器程序创建流程

源代码字符串
     │
     ▼
┌─────────────┐
│ createShader│ ──→ 创建着色器对象
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ shaderSource│ ──→ 设置源代码
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ compileShader│ ──→ 编译着色器
└──────┬───────┘
       │
       │ (对顶点着色器和片段着色器都执行上述步骤)
       │
       ▼
┌─────────────┐
│createProgram│ ──→ 创建程序对象
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ attachShader│ ──→ 附加着色器（×2）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ linkProgram │ ──→ 链接程序
└──────┬──────┘
       │
       ▼
    可以使用了！
```

**完整的实现代码**：

```javascript
/**
 * 创建着色器
 * @param {WebGLRenderingContext} gl - WebGL 上下文
 * @param {number} type - gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
 * @param {string} source - 着色器源代码
 * @returns {WebGLShader|null} 着色器对象，失败返回 null
 */
function createShader(gl, type, source) {
    // 1. 创建着色器对象
    const shader = gl.createShader(type);
    
    // 2. 设置源代码
    gl.shaderSource(shader, source);
    
    // 3. 编译
    gl.compileShader(shader);
    
    // 4. 检查编译结果
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    
    if (!success) {
        // 获取错误信息
        const errorLog = gl.getShaderInfoLog(shader);
        const typeName = type === gl.VERTEX_SHADER ? '顶点' : '片段';
        
        console.error(`${typeName}着色器编译错误:`);
        console.error(errorLog);
        
        // 打印带行号的源代码，方便调试
        console.error('源代码:');
        source.split('\n').forEach((line, i) => {
            console.error(`${(i + 1).toString().padStart(3)}: ${line}`);
        });
        
        // 删除失败的着色器
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

/**
 * 创建着色器程序
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexSource - 顶点着色器源代码
 * @param {string} fragmentSource - 片段着色器源代码
 * @returns {WebGLProgram|null}
 */
function createProgram(gl, vertexSource, fragmentSource) {
    // 编译两个着色器
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) {
        return null;
    }
    
    // 创建程序
    const program = gl.createProgram();
    
    // 附加着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    // 链接程序
    gl.linkProgram(program);
    
    // 检查链接结果
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    
    if (!success) {
        console.error('程序链接错误:');
        console.error(gl.getProgramInfoLog(program));
        
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }
    
    // 着色器已链接到程序，可以删除
    // 注意：这不会真正删除它们，只是标记为可删除
    // 当程序被删除时，它们才会被真正删除
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
}
```

### 1.7.5 准备顶点数据

顶点数据需要存储在 **缓冲区（Buffer）** 中：

```javascript
// 三角形的三个顶点坐标
// 每个顶点有 2 个分量 (x, y)
const vertices = new Float32Array([
     0.0,  0.5,   // 顶点 0：顶部中间
    -0.5, -0.5,   // 顶点 1：左下
     0.5, -0.5    // 顶点 2：右下
]);

// 为什么使用 Float32Array？
// - GPU 需要类型化数组
// - 32 位浮点数是最常用的格式
// - 可以直接传输到 GPU，无需转换
```

**创建缓冲区并上传数据**：

```javascript
// 1. 创建缓冲区对象
const buffer = gl.createBuffer();

// 2. 绑定缓冲区到目标
// ARRAY_BUFFER 用于顶点属性数据
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

// 3. 上传数据
// STATIC_DRAW 表示数据不会改变
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// bufferData 的第三个参数（使用提示）：
// gl.STATIC_DRAW  - 数据不会改变，用于静态几何体
// gl.DYNAMIC_DRAW - 数据会经常改变，用于动画
// gl.STREAM_DRAW  - 数据每帧都会改变
```

### 1.7.6 连接顶点属性

我们需要告诉 WebGL 如何从缓冲区读取数据：

```javascript
// 获取属性位置
const positionLocation = gl.getAttribLocation(program, 'a_position');

// 启用属性
gl.enableVertexAttribArray(positionLocation);

// 告诉 WebGL 如何读取数据
gl.vertexAttribPointer(
    positionLocation,  // 属性位置
    2,                 // 每个顶点的分量数（x, y = 2 个）
    gl.FLOAT,          // 数据类型（32 位浮点）
    false,             // 是否归一化
    0,                 // 步长（0 = 紧密排列）
    0                  // 偏移（从缓冲区开头开始）
);
```

**参数详解图示**：

```
缓冲区数据布局

                    步长 (stride) = 0 (紧密排列)
                    ├────────────────────────┤
                    
   偏移=0
      │
      ▼
    ┌───────┬───────┬───────┬───────┬───────┬───────┐
    │  x0   │  y0   │  x1   │  y1   │  x2   │  y2   │
    └───────┴───────┴───────┴───────┴───────┴───────┘
    
    ├───────────────┤
      size = 2
    (每个顶点 2 个分量)
    
    │← float (4字节) →│
         type = gl.FLOAT
```

### 1.7.7 绘制

```javascript
// 使用程序
gl.useProgram(program);

// 设置视口
gl.viewport(0, 0, canvas.width, canvas.height);

// 清屏
gl.clearColor(0.1, 0.1, 0.15, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 绘制三角形
gl.drawArrays(
    gl.TRIANGLES,  // 图元类型
    0,             // 从第几个顶点开始
    3              // 绘制几个顶点
);
```

### 1.7.8 完整的示例代码

将所有部分组合在一起：

```javascript
/**
 * 第一个 WebGL 程序 - 绘制橙色三角形
 */
function drawTriangle() {
    // ========== 1. 获取 Canvas 和 WebGL 上下文 ==========
    const canvas = document.getElementById('glCanvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 不可用，请使用现代浏览器');
        return;
    }
    
    // ========== 2. 着色器源代码 ==========
    const vertexShaderSource = `
        attribute vec2 a_position;
        
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;
    
    const fragmentShaderSource = `
        precision mediump float;
        
        void main() {
            gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0);
        }
    `;
    
    // ========== 3. 创建着色器程序 ==========
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
        console.error('无法创建着色器程序');
        return;
    }
    
    // ========== 4. 创建顶点数据 ==========
    const vertices = new Float32Array([
         0.0,  0.5,   // 顶部
        -0.5, -0.5,   // 左下
         0.5, -0.5    // 右下
    ]);
    
    // ========== 5. 创建缓冲区并上传数据 ==========
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // ========== 6. 配置顶点属性 ==========
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // ========== 7. 渲染 ==========
    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // 清屏
    gl.clearColor(0.1, 0.1, 0.15, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // 使用程序并绘制
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    console.log('三角形绘制成功！');
}

// 运行
drawTriangle();
```

---

## 1.8 WebGL 状态机模型

### 1.8.1 什么是状态机？

WebGL 采用**状态机**编程模型。这意味着 WebGL 会维护一组全局状态，所有的绑制操作都基于当前状态执行。

```
WebGL 状态机示意图

┌─────────────────────────────────────────────────────────────┐
│                      WebGL 状态                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  当前程序:           ● program_1  ○ program_2  ○ null      │
│                                                             │
│  当前 ARRAY_BUFFER:  ● buffer_1   ○ buffer_2   ○ null      │
│                                                             │
│  当前纹理单元:       [0]                                    │
│  纹理单元 0:         ● texture_1  ○ texture_2  ○ null      │
│  纹理单元 1:         ○ texture_3  ○ null                   │
│                                                             │
│  当前帧缓冲:         ● null (默认)  ○ fbo_1               │
│                                                             │
│  视口:               (0, 0, 800, 600)                       │
│  清屏颜色:           (0.1, 0.1, 0.15, 1.0)                  │
│                                                             │
│  深度测试:           ○ 开启  ● 关闭                        │
│  混合:               ○ 开启  ● 关闭                        │
│  面剔除:             ○ 开启  ● 关闭                        │
│                                                             │
│  ...更多状态...                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

● = 当前选中    ○ = 未选中
```

### 1.8.2 绑定操作

绑定操作是设置"当前"状态的方式：

```javascript
// 绑定缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
// 现在 ARRAY_BUFFER 指向 buffer1
// 后续操作 ARRAY_BUFFER 就是操作 buffer1

gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
// 数据上传到 buffer1

gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
// 现在 ARRAY_BUFFER 指向 buffer2

gl.bufferData(gl.ARRAY_BUFFER, otherData, gl.STATIC_DRAW);
// 数据上传到 buffer2

// 绑定纹理
gl.bindTexture(gl.TEXTURE_2D, texture1);
// 现在 TEXTURE_2D 指向 texture1

// 绑定程序
gl.useProgram(program1);
// 现在使用 program1
```

### 1.8.3 状态机陷阱

**陷阱 1：忘记绑定**

```javascript
// ❌ 错误：没有绑定就操作
const buffer = gl.createBuffer();
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
// 错误！数据会上传到之前绑定的缓冲区，或者操作失败

// ✅ 正确
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
```

**陷阱 2：状态污染**

```javascript
// 函数 A
function setupMaterial() {
    gl.bindTexture(gl.TEXTURE_2D, materialTexture);
    // 忘记解绑
}

// 函数 B
function renderUI() {
    // 期望使用 uiTexture，但实际还绑定着 materialTexture！
    gl.bindTexture(gl.TEXTURE_2D, uiTexture);
    // ...
}
```

**最佳实践：用完解绑或明确绑定**

```javascript
// 方法 1：用完解绑
function setupMaterial() {
    gl.bindTexture(gl.TEXTURE_2D, materialTexture);
    // ... 操作 ...
    gl.bindTexture(gl.TEXTURE_2D, null);  // 解绑
}

// 方法 2：每次使用前明确绑定（推荐）
function render() {
    // 明确所有需要的状态
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // ...绑制...
}
```

### 1.8.4 WebGL 2.0 的 VAO

WebGL 2.0 引入了**顶点数组对象（VAO）**，可以封装顶点属性状态：

```javascript
// 创建 VAO
const vao = gl.createVertexArray();

// 绑定 VAO
gl.bindVertexArray(vao);

// 设置顶点属性（这些设置会被 VAO 记住）
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 解绑 VAO
gl.bindVertexArray(null);

// 渲染时只需绑定 VAO
function render() {
    gl.useProgram(program);
    gl.bindVertexArray(vao);  // 一行代码恢复所有顶点属性设置
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```

---

## 1.9 本章小结

### 核心概念回顾

| 概念 | 说明 |
|------|------|
| **WebGL** | 浏览器中的 GPU 图形 API，基于 OpenGL ES |
| **GPU 并行计算** | WebGL 性能优势的来源 |
| **着色器** | 运行在 GPU 上的程序（顶点着色器 + 片段着色器） |
| **缓冲区** | 存储顶点数据的 GPU 内存 |
| **状态机** | WebGL 的编程模型 |
| **NDC** | 标准化设备坐标，范围 [-1, 1] |

### WebGL 程序基本流程

```
1. 获取 WebGL 上下文
        │
        ▼
2. 编写着色器代码（顶点 + 片段）
        │
        ▼
3. 编译着色器、创建并链接程序
        │
        ▼
4. 准备顶点数据（Float32Array）
        │
        ▼
5. 创建缓冲区、上传数据
        │
        ▼
6. 配置顶点属性指针
        │
        ▼
7. 设置状态、执行绘制
```

### 关键 API 总结

| API | 作用 |
|-----|------|
| `getContext('webgl2')` | 获取 WebGL 上下文 |
| `createShader()` | 创建着色器对象 |
| `shaderSource()` | 设置着色器源码 |
| `compileShader()` | 编译着色器 |
| `createProgram()` | 创建程序对象 |
| `attachShader()` | 附加着色器到程序 |
| `linkProgram()` | 链接程序 |
| `useProgram()` | 使用程序 |
| `createBuffer()` | 创建缓冲区 |
| `bindBuffer()` | 绑定缓冲区 |
| `bufferData()` | 上传数据 |
| `getAttribLocation()` | 获取属性位置 |
| `vertexAttribPointer()` | 配置属性指针 |
| `enableVertexAttribArray()` | 启用属性 |
| `viewport()` | 设置视口 |
| `clearColor()` | 设置清屏颜色 |
| `clear()` | 清屏 |
| `drawArrays()` | 绘制 |

---

## 1.10 练习题

### 基础练习

1. **修改三角形颜色**：将橙色改为渐变色（需要使用顶点颜色）

2. **修改三角形位置**：让三角形出现在右上角

3. **绘制矩形**：使用两个三角形绘制一个矩形

### 进阶练习

4. **颜色动画**：让三角形颜色随时间变化（使用 uniform 传递时间）

5. **跟随鼠标**：让三角形跟随鼠标位置移动

6. **响应式**：处理窗口大小变化，保持正确的宽高比

### 挑战练习

7. **封装 WebGL 工具类**：
   - 创建一个 `WebGLApp` 类
   - 封装初始化、着色器创建、缓冲区管理
   - 实现资源释放

---

**下一章预告**：在第2章中，我们将深入学习 GPU 渲染管线，理解从顶点数据到屏幕像素的完整流程。

---

**文档版本**：v1.0  
**字数统计**：约 18,000 字  
**代码示例**：45+ 个
