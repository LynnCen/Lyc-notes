# 第1章：PixiJS 概述与快速入门

## 1.1 章节概述

在开始学习 PixiJS 之前，我们需要了解它是什么、能做什么、以及为什么选择它。本章将带你快速入门 PixiJS，完成第一个应用。

本章将深入讲解：

- **PixiJS 简介**：定位、特点、适用场景
- **技术对比**：与其他图形库的区别
- **环境搭建**：安装配置
- **第一个应用**：Hello PixiJS
- **版本选择**：v7 与 v8 的差异

---

## 1.2 PixiJS 是什么？

### 1.2.1 定义与定位

```
PixiJS 的定位

┌─────────────────────────────────────────────────────────────┐
│                     Web 图形渲染库                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Three.js          PixiJS           Fabric.js             │
│   ┌─────────┐       ┌─────────┐      ┌─────────┐           │
│   │   3D    │       │   2D    │      │  2D/SVG │           │
│   │ 渲染引擎│       │ 渲染引擎│      │  Canvas │           │
│   └─────────┘       └─────────┘      └─────────┘           │
│                                                             │
│   复杂 3D 场景      高性能 2D 渲染    矢量图形编辑           │
│   游戏/可视化       游戏/动画/UI      设计工具               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

PixiJS 的核心定位：
- 高性能 2D 渲染引擎
- 基于 WebGL（可回退到 Canvas）
- 专注于渲染，不包含物理引擎、音频等
```

### 1.2.2 核心特点

```
PixiJS 的核心特点

1. 高性能
──────────────────────────────────
- 基于 WebGL 硬件加速
- 自动批处理（Batching）
- 智能纹理管理
- 支持 WebGPU（v8+）


2. 易用性
──────────────────────────────────
- 简洁的 API 设计
- 完善的 TypeScript 支持
- 丰富的文档和示例
- 活跃的社区


3. 灵活性
──────────────────────────────────
- 模块化设计，按需引入
- 可扩展的插件系统
- 支持自定义着色器
- 与其他框架集成友好


4. 跨平台
──────────────────────────────────
- 桌面浏览器
- 移动端浏览器
- Electron 桌面应用
- 小程序（需适配）
```

### 1.2.3 适用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| **2D 游戏** | 休闲游戏、卡牌游戏 | 消消乐、扑克牌 |
| **数据可视化** | 大规模数据展示 | 关系图、热力图 |
| **交互动画** | 营销页面、H5 活动 | 抽奖、互动广告 |
| **图形编辑器** | 在线设计工具 | 海报编辑、白板 |
| **UI 组件** | 复杂 UI 效果 | 粒子背景、动态图表 |

---

## 1.3 与其他库对比

### 1.3.1 PixiJS vs Three.js

```
PixiJS vs Three.js

                    PixiJS              Three.js
                    ──────              ────────
维度               2D                   3D
渲染目标           精灵、图形、文本     3D 模型、场景
学习曲线           较低                 较高
包大小             ~200KB               ~600KB+
性能优化           自动批处理           需手动优化
适用场景           2D 游戏、UI          3D 游戏、可视化


选择建议：
- 纯 2D 项目 → PixiJS
- 3D 项目 → Three.js
- 2.5D/伪 3D → 可以用 PixiJS + 投影
```

### 1.3.2 PixiJS vs Phaser

```
PixiJS vs Phaser

                    PixiJS              Phaser
                    ──────              ──────
定位               渲染引擎             游戏框架
渲染器             自有                 基于 PixiJS（v2）
物理引擎           无                   内置 Arcade/Matter
音频系统           无                   内置
场景管理           无                   内置
包大小             ~200KB               ~1MB+


选择建议：
- 需要完整游戏框架 → Phaser
- 只需渲染能力 → PixiJS
- 需要高度定制 → PixiJS
```

### 1.3.3 PixiJS vs Fabric.js

```
PixiJS vs Fabric.js

                    PixiJS              Fabric.js
                    ──────              ─────────
渲染方式           WebGL               Canvas 2D
性能               高                   中等
对象操作           基础                 丰富（选择、变换）
序列化             无内置               JSON 导入导出
适用场景           游戏、动画           图形编辑器


选择建议：
- 高性能渲染 → PixiJS
- 图形编辑功能 → Fabric.js
- 两者结合 → PixiJS 渲染 + 自定义交互
```

---

## 1.4 安装与配置

### 1.4.1 使用 npm 安装

```bash
# 安装 PixiJS v7
npm install pixi.js@7

# 或安装最新版 v8
npm install pixi.js@8

# TypeScript 类型（v7 内置，v8 也内置）
# 无需额外安装
```

### 1.4.2 使用 CDN

```html
<!-- PixiJS v7 -->
<script src="https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.js"></script>

<!-- PixiJS v8 -->
<script src="https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js"></script>
```

### 1.4.3 模块化引入

```typescript
// 完整引入
import * as PIXI from 'pixi.js';

// 按需引入（推荐）
import { Application, Sprite, Graphics, Text } from 'pixi.js';

// v8 的新引入方式
import { Application } from 'pixi.js';
import { Sprite } from 'pixi.js';
```

### 1.4.4 项目配置

```typescript
// tsconfig.json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true
    }
}
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2020'
    },
    optimizeDeps: {
        include: ['pixi.js']
    }
});
```

---

## 1.5 第一个 PixiJS 应用

### 1.5.1 基础结构

```
PixiJS 应用的基本结构

┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Renderer                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                    Stage                        │  │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │  │
│  │  │  │ Sprite  │  │Graphics │  │  Text   │        │  │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘        │  │  │
│  │  │                                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Ticker                           │  │
│  │              (游戏循环 / 动画更新)                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

核心组件：
- Application: 应用入口，管理渲染器和舞台
- Renderer: 渲染器，负责绑制到 Canvas
- Stage: 舞台，所有显示对象的根容器
- Ticker: 定时器，驱动动画更新
```

### 1.5.2 Hello PixiJS（v7 版本）

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello PixiJS</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/pixi.js@7/dist/pixi.min.js"></script>
    <script>
        // 创建应用
        const app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1099bb,
            antialias: true
        });
        
        // 将 Canvas 添加到页面
        document.body.appendChild(app.view);
        
        // 创建一个精灵
        const sprite = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png');
        
        // 设置锚点为中心
        sprite.anchor.set(0.5);
        
        // 设置位置
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        
        // 添加到舞台
        app.stage.addChild(sprite);
        
        // 添加动画
        app.ticker.add((delta) => {
            sprite.rotation += 0.01 * delta;
        });
    </script>
</body>
</html>
```

### 1.5.3 Hello PixiJS（v8 版本）

```typescript
// v8 使用异步初始化
import { Application, Sprite } from 'pixi.js';

async function main() {
    // 创建应用（异步）
    const app = new Application();
    
    // 初始化
    await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
        antialias: true
    });
    
    // 将 Canvas 添加到页面
    document.body.appendChild(app.canvas);
    
    // 加载纹理（v8 推荐使用 Assets）
    const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
    
    // 创建精灵
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = app.screen.width / 2;
    sprite.y = app.screen.height / 2;
    
    app.stage.addChild(sprite);
    
    // 动画
    app.ticker.add((ticker) => {
        sprite.rotation += 0.01 * ticker.deltaTime;
    });
}

main();
```

### 1.5.4 代码详解

```typescript
/**
 * PixiJS 应用创建流程详解
 */

// ============ 第一步：创建应用 ============
const app = new PIXI.Application({
    width: 800,              // 画布宽度
    height: 600,             // 画布高度
    backgroundColor: 0x1099bb, // 背景色（十六进制）
    antialias: true,         // 抗锯齿
    resolution: window.devicePixelRatio || 1, // 分辨率
    autoDensity: true,       // 自动调整 CSS 尺寸
});

/*
Application 创建时做了什么？

1. 创建 Canvas 元素
2. 获取 WebGL 上下文
3. 创建渲染器（Renderer）
4. 创建舞台（Stage）
5. 创建定时器（Ticker）
6. 启动渲染循环
*/


// ============ 第二步：添加到 DOM ============
document.body.appendChild(app.view);

/*
app.view 是什么？
- 在 v7 中是 HTMLCanvasElement
- 在 v8 中改名为 app.canvas
*/


// ============ 第三步：创建显示对象 ============
const sprite = PIXI.Sprite.from('image.png');

/*
Sprite.from() 做了什么？
1. 检查纹理缓存
2. 如果没有，创建新的 Texture
3. 创建 Sprite 实例
4. 将 Texture 绑定到 Sprite
*/


// ============ 第四步：设置属性 ============
sprite.anchor.set(0.5);  // 锚点设为中心
sprite.x = 400;          // X 位置
sprite.y = 300;          // Y 位置
sprite.scale.set(2);     // 缩放 2 倍
sprite.rotation = 0.5;   // 旋转（弧度）
sprite.alpha = 0.8;      // 透明度

/*
锚点（anchor）的作用：
- 决定精灵的旋转中心
- 决定精灵的缩放中心
- 决定位置的参考点

anchor = (0, 0)         anchor = (0.5, 0.5)
┌─────────●              ┌─────────┐
│         │              │    ●    │
│         │              │         │
└─────────┘              └─────────┘
左上角                    中心
*/


// ============ 第五步：添加到舞台 ============
app.stage.addChild(sprite);

/*
场景图结构：
stage (Container)
  └── sprite (Sprite)
  
只有添加到舞台（或舞台的子容器）的对象才会被渲染
*/


// ============ 第六步：添加动画 ============
app.ticker.add((delta) => {
    sprite.rotation += 0.01 * delta;
});

/*
Ticker 的工作原理：
1. 使用 requestAnimationFrame
2. 计算帧间隔时间（delta）
3. 调用所有注册的回调
4. 触发渲染

delta 是什么？
- 帧间隔时间的比例
- 60fps 时 delta ≈ 1
- 30fps 时 delta ≈ 2
- 用于保证动画速度一致
*/
```

---

## 1.6 版本选择：v7 vs v8

### 1.6.1 主要差异

```
PixiJS v7 vs v8 主要差异

                        v7                  v8
                        ──                  ──
初始化方式             同步                 异步
Canvas 属性            app.view            app.canvas
渲染器                 WebGL               WebGL + WebGPU
Ticker 回调            (delta)             (ticker)
资源加载               Loader              Assets
包结构                 单包                 模块化
最低浏览器             IE11 (polyfill)     现代浏览器


v8 的主要改进：
1. 支持 WebGPU
2. 更好的 Tree Shaking
3. 更现代的 API 设计
4. 性能优化
```

### 1.6.2 迁移注意事项

```typescript
// ============ 初始化差异 ============

// v7
const app = new PIXI.Application({
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

// v8
const app = new Application();
await app.init({
    width: 800,
    height: 600
});
document.body.appendChild(app.canvas);


// ============ Ticker 回调差异 ============

// v7
app.ticker.add((delta) => {
    sprite.x += 1 * delta;
});

// v8
app.ticker.add((ticker) => {
    sprite.x += 1 * ticker.deltaTime;
});


// ============ 资源加载差异 ============

// v7
const loader = new PIXI.Loader();
loader.add('bunny', 'bunny.png');
loader.load((loader, resources) => {
    const sprite = new PIXI.Sprite(resources.bunny.texture);
});

// v8
const texture = await PIXI.Assets.load('bunny.png');
const sprite = new Sprite(texture);
```

### 1.6.3 选择建议

```
版本选择建议

选择 v7 如果：
──────────────────────────────────
- 需要支持旧浏览器
- 项目已经使用 v7
- 需要稳定的 API
- 依赖的插件只支持 v7


选择 v8 如果：
──────────────────────────────────
- 新项目
- 只需支持现代浏览器
- 需要 WebGPU 支持
- 需要更好的性能
- 需要更小的包体积
```

---

## 1.7 开发工具与调试

### 1.7.1 PixiJS Devtools

```
PixiJS Devtools 浏览器扩展

功能：
- 查看场景树结构
- 检查显示对象属性
- 实时修改属性
- 性能监控

安装：
Chrome Web Store 搜索 "PixiJS Devtools"
```

### 1.7.2 调试技巧

```typescript
// ============ 显示 FPS ============
import Stats from 'stats.js';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

app.ticker.add(() => {
    stats.begin();
    // 渲染逻辑
    stats.end();
});


// ============ 显示包围盒 ============
function showBounds(displayObject: PIXI.DisplayObject) {
    const bounds = displayObject.getBounds();
    const graphics = new PIXI.Graphics();
    
    graphics.lineStyle(2, 0xff0000);
    graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    app.stage.addChild(graphics);
}


// ============ 输出场景树 ============
function printSceneTree(container: PIXI.Container, indent = 0) {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}${container.constructor.name}`);
    
    for (const child of container.children) {
        if (child instanceof PIXI.Container) {
            printSceneTree(child, indent + 1);
        } else {
            console.log(`${prefix}  ${child.constructor.name}`);
        }
    }
}

printSceneTree(app.stage);


// ============ 检查 WebGL 信息 ============
function logRendererInfo(app: PIXI.Application) {
    const gl = app.renderer.gl;
    
    console.log('WebGL 版本:', gl.getParameter(gl.VERSION));
    console.log('着色器版本:', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log('最大纹理尺寸:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log('最大纹理单元:', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
}
```

### 1.7.3 常见问题排查

```typescript
// ============ 图片不显示 ============

// 问题1：跨域
// 解决：服务器设置 CORS 或使用代理

// 问题2：路径错误
// 解决：检查路径，使用绝对路径测试

// 问题3：纹理未加载完成
// 解决：使用 Assets.load() 等待加载


// ============ 性能问题 ============

// 检查 Draw Call 数量
console.log('Draw Calls:', app.renderer.plugins.batch.currentBatchSize);

// 检查纹理数量
console.log('Textures:', PIXI.utils.TextureCache);


// ============ 内存泄漏 ============

// 正确销毁
sprite.destroy({ children: true, texture: true, baseTexture: true });

// 清理缓存
PIXI.utils.clearTextureCache();
```

---

## 1.8 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **PixiJS** | 高性能 2D WebGL 渲染引擎 |
| **Application** | 应用入口，管理渲染器和舞台 |
| **Stage** | 舞台，显示对象的根容器 |
| **Sprite** | 精灵，显示图像的基本单位 |
| **Ticker** | 定时器，驱动动画更新 |

### 关键代码

```typescript
// 创建应用
const app = new PIXI.Application({ width: 800, height: 600 });
document.body.appendChild(app.view);

// 创建精灵
const sprite = PIXI.Sprite.from('image.png');
app.stage.addChild(sprite);

// 添加动画
app.ticker.add((delta) => {
    sprite.rotation += 0.01 * delta;
});
```

---

## 1.9 练习题

### 基础练习

1. 创建一个 PixiJS 应用，显示一张图片

2. 让图片在画布中心旋转

3. 添加键盘控制，按方向键移动图片

### 进阶练习

4. 创建多个精灵，让它们以不同速度旋转

5. 实现图片跟随鼠标移动

### 挑战练习

6. 创建一个简单的弹球动画（碰到边界反弹）

---

**下一章预告**：在第2章中，我们将深入学习 Application 和渲染器的配置选项。

---

**文档版本**：v1.0  
**字数统计**：约 10,000 字  
**代码示例**：30+ 个
