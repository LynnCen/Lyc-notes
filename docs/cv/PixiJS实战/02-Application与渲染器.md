# 第2章：Application 与渲染器

## 2.1 章节概述

`Application` 是 PixiJS 的核心入口类，它封装了渲染器、舞台、定时器等核心组件。理解 Application 的配置和工作原理，是掌握 PixiJS 的第一步。

本章将深入讲解：

- **Application 详解**：创建选项、生命周期
- **渲染器类型**：WebGL、WebGPU、Canvas
- **渲染器配置**：分辨率、抗锯齿、背景色
- **屏幕与视口**：resize 处理
- **渲染控制**：手动渲染、暂停

---

## 2.2 Application 类详解

### 2.2.1 Application 的组成

```
Application 内部结构

┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    renderer                          │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              WebGL Context                   │    │   │
│  │  │  - 着色器管理                                │    │   │
│  │  │  - 纹理管理                                  │    │   │
│  │  │  - 批处理系统                                │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     stage                            │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              Container (根容器)              │    │   │
│  │  │  - 所有显示对象的父节点                      │    │   │
│  │  │  - 场景图的根                                │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     ticker                           │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              游戏循环                         │    │   │
│  │  │  - requestAnimationFrame                     │    │   │
│  │  │  - 帧率控制                                  │    │   │
│  │  │  - 回调管理                                  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     view / canvas                    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              HTMLCanvasElement               │    │   │
│  │  │  - 渲染目标                                  │    │   │
│  │  │  - DOM 元素                                  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2.2 创建选项详解

```typescript
// PixiJS v7 完整配置选项
const app = new PIXI.Application({
    // ============ 尺寸相关 ============
    width: 800,                    // 画布宽度（像素）
    height: 600,                   // 画布高度（像素）
    resolution: window.devicePixelRatio || 1, // 分辨率
    autoDensity: true,             // 自动调整 CSS 尺寸
    
    // ============ 渲染相关 ============
    backgroundColor: 0x1099bb,     // 背景色
    backgroundAlpha: 1,            // 背景透明度
    antialias: true,               // 抗锯齿
    preserveDrawingBuffer: false,  // 保留绘制缓冲
    clearBeforeRender: true,       // 渲染前清除
    
    // ============ 渲染器选择 ============
    forceCanvas: false,            // 强制使用 Canvas 2D
    powerPreference: 'high-performance', // GPU 偏好
    
    // ============ 其他 ============
    view: existingCanvas,          // 使用已有的 Canvas
    sharedTicker: false,           // 使用共享 Ticker
    sharedLoader: false,           // 使用共享 Loader
    resizeTo: window,              // 自动调整尺寸到目标元素
});
```

```typescript
// PixiJS v8 配置（异步初始化）
const app = new Application();

await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    
    // v8 新增选项
    preference: 'webgl',           // 'webgl' | 'webgpu'
    hello: true,                   // 控制台输出版本信息
});
```

### 2.2.3 关键属性

```typescript
// ============ 核心属性 ============

// 渲染器
app.renderer;        // Renderer 实例
app.renderer.type;   // RENDERER_TYPE.WEBGL 或 CANVAS

// 舞台
app.stage;           // 根 Container

// 画布
app.view;            // v7: HTMLCanvasElement
app.canvas;          // v8: HTMLCanvasElement

// 定时器
app.ticker;          // Ticker 实例

// 屏幕尺寸
app.screen;          // Rectangle { x, y, width, height }
app.screen.width;    // 画布宽度
app.screen.height;   // 画布高度


// ============ 便捷方法 ============

// 渲染一帧
app.render();

// 调整尺寸
app.resize();

// 销毁应用
app.destroy(removeView, stageOptions);
```

---

## 2.3 渲染器类型

### 2.3.1 WebGL 渲染器

```typescript
/**
 * WebGL 渲染器（默认）
 */
const app = new PIXI.Application({
    forceCanvas: false,  // 默认使用 WebGL
    powerPreference: 'high-performance'
});

// 检查渲染器类型
if (app.renderer.type === PIXI.RENDERER_TYPE.WEBGL) {
    console.log('使用 WebGL 渲染');
    
    // 获取 WebGL 上下文
    const gl = app.renderer.gl;
    
    // 获取 WebGL 信息
    console.log('WebGL 版本:', gl.getParameter(gl.VERSION));
    console.log('最大纹理尺寸:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
}
```

### 2.3.2 Canvas 回退

```typescript
/**
 * Canvas 2D 渲染器（回退方案）
 */
const app = new PIXI.Application({
    forceCanvas: true  // 强制使用 Canvas 2D
});

// 检查
if (app.renderer.type === PIXI.RENDERER_TYPE.CANVAS) {
    console.log('使用 Canvas 2D 渲染');
}

/*
Canvas 渲染器的限制：
- 性能较低
- 不支持某些滤镜
- 不支持某些混合模式
- 不支持自定义着色器
*/
```

### 2.3.3 WebGPU 渲染器（v8）

```typescript
/**
 * WebGPU 渲染器（v8 新增）
 */
const app = new Application();

await app.init({
    preference: 'webgpu',  // 优先使用 WebGPU
    // 如果 WebGPU 不可用，会自动回退到 WebGL
});

// 检查
if (app.renderer.type === 'webgpu') {
    console.log('使用 WebGPU 渲染');
}

/*
WebGPU 的优势：
- 更低的 CPU 开销
- 更好的多线程支持
- 更现代的 API
- 更好的性能
*/
```

### 2.3.4 自动检测与回退

```typescript
/**
 * 渲染器自动检测
 */
function createApp() {
    // PixiJS 会自动检测并选择最佳渲染器
    // WebGPU (v8) > WebGL 2 > WebGL 1 > Canvas 2D
    
    const app = new PIXI.Application({
        // 不设置 forceCanvas，让 PixiJS 自动选择
    });
    
    // 输出使用的渲染器
    const rendererType = {
        [PIXI.RENDERER_TYPE.WEBGL]: 'WebGL',
        [PIXI.RENDERER_TYPE.CANVAS]: 'Canvas 2D',
    };
    
    console.log('渲染器:', rendererType[app.renderer.type]);
    
    return app;
}
```

---

## 2.4 渲染器配置详解

### 2.4.1 分辨率与 DPR

```typescript
/**
 * 分辨率处理
 */

// 获取设备像素比
const dpr = window.devicePixelRatio || 1;

const app = new PIXI.Application({
    width: 800,
    height: 600,
    resolution: dpr,      // 设置分辨率
    autoDensity: true,    // 自动调整 CSS 尺寸
});

/*
resolution 和 autoDensity 的作用：

假设 DPR = 2，设置 width = 800, height = 600

resolution: 2, autoDensity: true
- Canvas 实际尺寸: 1600 x 1200
- Canvas CSS 尺寸: 800 x 600
- 显示清晰，坐标系统仍是 800 x 600

resolution: 2, autoDensity: false
- Canvas 实际尺寸: 1600 x 1200
- Canvas CSS 尺寸: 1600 x 1200
- 显示清晰，但坐标系统变成 1600 x 1200

resolution: 1, autoDensity: true
- Canvas 实际尺寸: 800 x 600
- Canvas CSS 尺寸: 800 x 600
- 在高 DPR 设备上会模糊
*/


// 动态调整分辨率
function updateResolution(app: PIXI.Application) {
    const newDpr = window.devicePixelRatio || 1;
    
    if (app.renderer.resolution !== newDpr) {
        app.renderer.resolution = newDpr;
        app.resize();
    }
}

// 监听 DPR 变化（用户缩放浏览器时）
window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener('change', () => updateResolution(app));
```

### 2.4.2 抗锯齿

```typescript
/**
 * 抗锯齿配置
 */
const app = new PIXI.Application({
    antialias: true,  // 启用抗锯齿
});

/*
抗锯齿的影响：

启用 (antialias: true):
- 边缘更平滑
- 性能略有下降
- 适合矢量图形、文本

禁用 (antialias: false):
- 边缘有锯齿
- 性能更好
- 适合像素风格游戏
*/


// 对于像素风格游戏，还需要设置纹理过滤
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;  // v7
// v8 在创建纹理时设置
```

### 2.4.3 背景色与透明度

```typescript
/**
 * 背景配置
 */
const app = new PIXI.Application({
    backgroundColor: 0x1099bb,  // 十六进制颜色
    backgroundAlpha: 1,         // 完全不透明
});

// 动态修改背景色
app.renderer.backgroundColor = 0xff0000;  // v7
app.renderer.background.color = 0xff0000; // v8

// 透明背景（用于叠加在其他内容上）
const transparentApp = new PIXI.Application({
    backgroundColor: 0x000000,
    backgroundAlpha: 0,  // 完全透明
});
```

### 2.4.4 preserveDrawingBuffer

```typescript
/**
 * preserveDrawingBuffer 配置
 */
const app = new PIXI.Application({
    preserveDrawingBuffer: true,  // 保留绘制缓冲
});

/*
preserveDrawingBuffer 的作用：

false (默认):
- 渲染后缓冲区可能被清除
- 性能更好
- 无法使用 canvas.toDataURL()

true:
- 渲染后缓冲区保留
- 性能略差
- 可以使用 canvas.toDataURL() 导出图片
*/

// 导出图片
function exportImage(app: PIXI.Application) {
    // 需要 preserveDrawingBuffer: true
    const dataUrl = app.view.toDataURL('image/png');
    return dataUrl;
}

// 更好的导出方式：使用 extract 插件
function exportImageBetter(app: PIXI.Application) {
    const canvas = app.renderer.extract.canvas(app.stage);
    return canvas.toDataURL('image/png');
}
```

---

## 2.5 屏幕与视口管理

### 2.5.1 自动调整尺寸

```typescript
/**
 * 使用 resizeTo 自动调整尺寸
 */
const app = new PIXI.Application({
    resizeTo: window,  // 自动调整到窗口大小
});

// 或调整到指定元素
const container = document.getElementById('game-container');
const app2 = new PIXI.Application({
    resizeTo: container,
});

/*
resizeTo 的工作原理：
1. 监听目标元素的尺寸变化
2. 自动调用 app.resize()
3. 更新 Canvas 尺寸
*/
```

### 2.5.2 手动处理 resize

```typescript
/**
 * 手动处理 resize
 */
const app = new PIXI.Application({
    width: 800,
    height: 600,
});

// 监听窗口变化
window.addEventListener('resize', () => {
    // 获取新尺寸
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 调整渲染器尺寸
    app.renderer.resize(width, height);
    
    // 更新场景（如果需要）
    onResize(width, height);
});

function onResize(width: number, height: number) {
    // 重新定位元素
    centerSprite.x = width / 2;
    centerSprite.y = height / 2;
    
    // 调整缩放
    const scale = Math.min(width / 800, height / 600);
    app.stage.scale.set(scale);
}
```

### 2.5.3 保持宽高比

```typescript
/**
 * 保持宽高比的 resize
 */
class ResponsiveApp {
    private app: PIXI.Application;
    private designWidth = 1920;
    private designHeight = 1080;
    private gameContainer: PIXI.Container;
    
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
        });
        
        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.app.renderer.resize(width, height);
        
        // 计算缩放比例（保持宽高比）
        const scaleX = width / this.designWidth;
        const scaleY = height / this.designHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // 应用缩放
        this.gameContainer.scale.set(scale);
        
        // 居中
        this.gameContainer.x = (width - this.designWidth * scale) / 2;
        this.gameContainer.y = (height - this.designHeight * scale) / 2;
    }
}
```

---

## 2.6 渲染控制

### 2.6.1 手动渲染

```typescript
/**
 * 手动控制渲染
 */

// 停止自动渲染
app.ticker.stop();

// 手动渲染一帧
app.render();

// 按需渲染
let needsRender = false;

function markDirty() {
    needsRender = true;
}

function renderLoop() {
    if (needsRender) {
        app.render();
        needsRender = false;
    }
    requestAnimationFrame(renderLoop);
}

renderLoop();

// 当数据变化时标记需要渲染
sprite.x = 100;
markDirty();
```

### 2.6.2 暂停与恢复

```typescript
/**
 * 暂停和恢复渲染
 */
class GameLoop {
    private app: PIXI.Application;
    private isPaused = false;
    
    pause() {
        if (!this.isPaused) {
            this.app.ticker.stop();
            this.isPaused = true;
        }
    }
    
    resume() {
        if (this.isPaused) {
            this.app.ticker.start();
            this.isPaused = false;
        }
    }
    
    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
}

// 页面可见性变化时自动暂停
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameLoop.pause();
    } else {
        gameLoop.resume();
    }
});
```

### 2.6.3 帧率控制

```typescript
/**
 * 帧率控制
 */

// 设置最大帧率
app.ticker.maxFPS = 60;  // 限制为 60fps

// 设置最小帧率（用于 delta 计算）
app.ticker.minFPS = 30;

// 获取当前帧率
console.log('FPS:', app.ticker.FPS);

// 获取帧间隔
console.log('Delta:', app.ticker.deltaTime);
console.log('Delta MS:', app.ticker.deltaMS);
```

---

## 2.7 多渲染器场景

### 2.7.1 共享纹理

```typescript
/**
 * 多个 Application 共享纹理
 */

// 创建第一个应用
const app1 = new PIXI.Application({ width: 400, height: 300 });
document.getElementById('canvas1')?.appendChild(app1.view);

// 创建第二个应用
const app2 = new PIXI.Application({ width: 400, height: 300 });
document.getElementById('canvas2')?.appendChild(app2.view);

// 加载纹理（只需加载一次）
const texture = await PIXI.Assets.load('image.png');

// 在两个应用中使用同一纹理
const sprite1 = new PIXI.Sprite(texture);
app1.stage.addChild(sprite1);

const sprite2 = new PIXI.Sprite(texture);
app2.stage.addChild(sprite2);

/*
注意：纹理是共享的，但 Sprite 不是
每个应用需要创建自己的 Sprite 实例
*/
```

### 2.7.2 共享 Ticker

```typescript
/**
 * 共享 Ticker
 */

// 使用共享 Ticker
const app1 = new PIXI.Application({
    sharedTicker: true,
});

const app2 = new PIXI.Application({
    sharedTicker: true,
});

// 两个应用使用同一个 Ticker
// 适合需要同步更新的场景

// 添加回调到共享 Ticker
PIXI.Ticker.shared.add((delta) => {
    // 同时更新两个应用的内容
});
```

---

## 2.8 销毁与清理

```typescript
/**
 * 正确销毁 Application
 */
function destroyApp(app: PIXI.Application) {
    // 方式1：完全销毁
    app.destroy(true, {
        children: true,      // 销毁所有子对象
        texture: true,       // 销毁纹理
        baseTexture: true,   // 销毁基础纹理
    });
    
    // 方式2：保留 Canvas
    app.destroy(false);  // Canvas 元素不会被移除
    
    // 方式3：只销毁内容，保留应用
    app.stage.removeChildren();
}

// 清理纹理缓存
PIXI.utils.clearTextureCache();

// 清理所有缓存
PIXI.Assets.reset();  // v8
```

---

## 2.9 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Application** | PixiJS 应用入口，管理渲染器、舞台、定时器 |
| **Renderer** | 渲染器，负责将场景绘制到 Canvas |
| **resolution** | 分辨率，用于高 DPR 设备 |
| **autoDensity** | 自动调整 CSS 尺寸 |
| **resizeTo** | 自动调整尺寸到目标元素 |

### 关键配置

```typescript
const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    resizeTo: window,
});
```

---

## 2.10 练习题

### 基础练习

1. 创建一个全屏自适应的 PixiJS 应用

2. 实现暂停/恢复功能

3. 尝试不同的分辨率设置，观察效果

### 进阶练习

4. 实现保持宽高比的 resize

5. 创建两个共享纹理的 Application

### 挑战练习

6. 实现一个按需渲染的应用（只在数据变化时渲染）

---

**下一章预告**：在第3章中，我们将深入学习 PixiJS 的显示对象体系。

---

**文档版本**：v1.0  
**字数统计**：约 9,000 字  
**代码示例**：35+ 个
