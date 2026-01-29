# 第4章：Viewport 视口管理

> **核心问题**：如何实现无限大的画布只显示用户可见的部分？

在无限画布系统中，Viewport（视口）是连接用户屏幕与无限画布世界的桥梁。它定义了用户当前能看到画布的哪个区域，以及这个区域以什么比例显示。理解视口管理，是掌握无限画布交互的关键。

---

## 目录

- [4.1 视口核心概念](#41-视口核心概念)
  - [4.1.1 视口的本质](#411-视口的本质)
  - [4.1.2 视口状态三要素](#412-视口状态三要素)
  - [4.1.3 视口边界与限制](#413-视口边界与限制)
  - [4.1.4 视口 Padding 系统](#414-视口-padding-系统)
- [4.2 缩放系统](#42-缩放系统)
  - [4.2.1 缩放的数学模型](#421-缩放的数学模型)
  - [4.2.2 以任意点为中心的缩放](#422-以任意点为中心的缩放)
  - [4.2.3 滚轮缩放实现](#423-滚轮缩放实现)
  - [4.2.4 缩放限制与边界处理](#424-缩放限制与边界处理)
- [4.3 平移系统](#43-平移系统)
  - [4.3.1 平移的基本实现](#431-平移的基本实现)
  - [4.3.2 平移边界约束](#432-平移边界约束)
  - [4.3.3 自动位置调整](#433-自动位置调整)
  - [4.3.4 自动滚动（Auto-Scroll）](#434-自动滚动auto-scroll)
- [4.4 视口命令系统](#44-视口命令系统)
  - [4.4.1 zoomTo - 缩放到指定比例](#441-zoomto---缩放到指定比例)
  - [4.4.2 zoomToFit - 适配窗口](#442-zoomtofit---适配窗口)
  - [4.4.3 zoomToElement - 聚焦到元素](#443-zoomtoelement---聚焦到元素)
  - [4.4.4 scrollToElement - 滚动到元素](#444-scrolltoelement---滚动到元素)
- [4.5 视口动画系统](#45-视口动画系统)
  - [4.5.1 三次贝塞尔曲线原理](#451-三次贝塞尔曲线原理)
  - [4.5.2 动画插值计算](#452-动画插值计算)
  - [4.5.3 动画帧管理](#453-动画帧管理)
- [4.6 视口持久化](#46-视口持久化)
  - [4.6.1 LRU 缓存策略](#461-lru-缓存策略)
  - [4.6.2 视口状态恢复](#462-视口状态恢复)
  - [4.6.3 性能优化：Mipmap 策略切换](#463-性能优化mipmap-策略切换)
- [4.7 双层 Viewport 架构](#47-双层-viewport-架构)
  - [4.7.1 Framework Viewport（业务层）](#471-framework-viewport业务层)
  - [4.7.2 Renderer Viewport（渲染层）](#472-renderer-viewport渲染层)
  - [4.7.3 数据流同步机制](#473-数据流同步机制)
- [4.8 本章小结](#48-本章小结)

---

## 4.1 视口核心概念

### 4.1.1 视口的本质

想象你正在用相机拍摄一幅巨大的壁画。相机的取景框就是**视口（Viewport）**——它决定了你能看到壁画的哪一部分。

```
┌─────────────────────────────────────────────────────────┐
│                    无限画布（World）                      │
│                                                          │
│     ┌─────────────────────┐                             │
│     │                     │                             │
│     │    ┌───────────┐    │                             │
│     │    │  Viewport │    │                             │
│     │    │  (可见区域) │    │                             │
│     │    │           │    │                             │
│     │    └───────────┘    │                             │
│     │                     │                             │
│     │       元素 A        │                             │
│     └─────────────────────┘                             │
│                                    ┌──────────┐         │
│                                    │  元素 B   │         │
│                                    └──────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

在这个模型中：
- **无限画布（World）**：理论上无限大的坐标空间
- **视口（Viewport）**：用户屏幕上显示的矩形区域
- **可见元素**：与视口相交的元素才需要渲染

视口的核心职责：
1. **定位**：决定"看哪里"（position）
2. **缩放**：决定"看多大"（zoom）
3. **边界**：决定"能看多远"（limit）

### 4.1.2 视口状态三要素

视口状态由三个核心属性完全确定：

```typescript
interface ViewportState {
    x: number;      // 视口左上角的 X 偏移（屏幕坐标）
    y: number;      // 视口左上角的 Y 偏移（屏幕坐标）
    zoom: number;   // 缩放比例（1 = 100%）
}
```

**代码位置**：`framework/src/core/viewport/viewport.ts`

```typescript
export class Viewport implements IViewport {
    private _x = 0;
    private _y = 0;
    
    get zoom() {
        return this.editor.global.zoom || 1;
    }
    
    get x() {
        return this._x;
    }
    
    get y() {
        return this._y;
    }
}
```

> ⚠️ **重要概念**：`(x, y)` 表示的是**画布原点相对于屏幕左上角的偏移**，而不是视口在画布中的位置。
> 
> 当 `x = 100, y = 50` 时，意味着画布的原点 `(0, 0)` 显示在屏幕的 `(100, 50)` 位置。

**坐标关系的数学表达**：

```
屏幕坐标 = 世界坐标 × zoom + (x, y)
世界坐标 = (屏幕坐标 - (x, y)) / zoom
```

举例说明：
- 假设 `x = 100, y = 50, zoom = 2`
- 世界坐标 `(200, 300)` 的元素
- 显示在屏幕位置：`(200 × 2 + 100, 300 × 2 + 50) = (500, 650)`

### 4.1.3 视口边界与限制

为了防止用户无限滚动到空白区域，需要设置视口边界限制：

```typescript
interface ViewportLimit {
    left: number;      // 画布左边界（世界坐标）
    top: number;       // 画布上边界（世界坐标）
    right: number;     // 画布右边界（世界坐标）
    bottom: number;    // 画布下边界（世界坐标）
    minZoom: number;   // 最小缩放比例
    maxZoom: number;   // 最大缩放比例
}
```

**代码位置**：`framework/src/core/viewport/viewport.ts`

```typescript
// 无限画布的视窗大小最大值取 5240×5240，略超出 4K 屏（与 Figma 对齐）
const MAX_VIEWPORT_SIZE = 5240;
const MIN_VIEWPORT_ZOOM = 0.02;
const MAX_CLIENT_SIZE = MAX_VIEWPORT_SIZE / MIN_VIEWPORT_ZOOM;

export class Viewport implements IViewport {
    // 无限画布模式的边界限制
    static BOARD_LIMIT = Object.freeze<ViewportLimit>({
        left: -MAX_CLIENT_SIZE / 2,    // -131000
        top: -MAX_CLIENT_SIZE / 2,     // -131000
        right: MAX_CLIENT_SIZE / 2,    // 131000
        bottom: MAX_CLIENT_SIZE / 2,   // 131000
        minZoom: MIN_VIEWPORT_ZOOM,    // 0.02 (2%)
        maxZoom: 4,                    // 4 (400%)
    });

    // 设计模式的边界限制（无限制）
    static DESIGN_LIMIT = Object.freeze<ViewportLimit>({
        left: Number.NEGATIVE_INFINITY,
        top: Number.NEGATIVE_INFINITY,
        right: Number.POSITIVE_INFINITY,
        bottom: Number.POSITIVE_INFINITY,
        minZoom: MIN_VIEWPORT_ZOOM,    // 0.02 (2%)
        maxZoom: 10,                   // 10 (1000%)
    });
}
```

**为什么选择 5240 和 0.02？**

```
最大可视范围 = MAX_VIEWPORT_SIZE / MIN_VIEWPORT_ZOOM
            = 5240 / 0.02
            = 262000 像素

半径范围 = 262000 / 2 = 131000 像素
```

这个范围已经足够大，能容纳绝大多数设计场景，同时又不会因为坐标值过大导致浮点精度问题。

### 4.1.4 视口 Padding 系统

视口 Padding 定义了画布显示区域与屏幕边缘的内边距，通常用于为工具栏、侧边栏等 UI 元素预留空间：

```
┌──────────────────────────────────────────────┐
│                  padding-top                  │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│p │                                        │ p│
│a │          可用画布区域                   │ a│
│d │        (clientWidth × clientHeight)    │ d│
│d │                                        │ d│
│i │                                        │ i│
│n │                                        │ n│
│g │                                        │ g│
│- │                                        │ -│
│l │                                        │ r│
│e │                                        │ i│
│f │                                        │ g│
│t │                                        │ h│
│  │                                        │ t│
│  └────────────────────────────────────────┘  │
│                padding-bottom                 │
└──────────────────────────────────────────────┘
```

**代码位置**：`framework/src/core/viewport/viewport.ts`

```typescript
export class Viewport implements IViewport {
    private _padding: number[] = [0, 0, 0, 0]; // [top, right, bottom, left]

    get padding() {
        return this._padding;
    }

    setPadding(padding: number): void;
    setPadding(vertical: number, horizontal: number): void;
    setPadding(top: number, right?: number, bottom?: number, left?: number): void {
        let padding: number[];

        if (right !== undefined && bottom !== undefined && left !== undefined) {
            // 四个值：top, right, bottom, left
            padding = [top, right, bottom, left];
        } else if (right !== undefined) {
            // 两个值：vertical, horizontal
            padding = [top, right, top, right];
        } else {
            // 一个值：all
            padding = [top, top, top, top];
        }

        const prevTop = this.padding[0];
        const prevLeft = this.padding[padding.length - 1];
        const nextTop = padding[0];
        const nextLeft = padding[padding.length - 1];

        this._padding = padding;
        // 当 padding 改变时，自动调整视口位置以保持视觉连续性
        this.translate(nextLeft - prevLeft, nextTop - prevTop);
    }
}
```

Padding 的典型应用场景：
- 左侧工具栏展开时，设置 `padding-left` 避免内容被遮挡
- 底部属性面板展开时，设置 `padding-bottom`
- 执行 `zoomToFit` 时，计算适配区域需要排除 padding

---

## 4.2 缩放系统

缩放是无限画布最核心的交互之一。一个好的缩放实现需要满足：
1. 以指定点为中心缩放（通常是鼠标位置）
2. 缩放过程平滑自然
3. 正确处理边界限制

### 4.2.1 缩放的数学模型

缩放的本质是改变世界坐标到屏幕坐标的映射比例。设：
- 当前缩放比例为 $z_1$，目标缩放比例为 $z_2$
- 缩放中心点的屏幕坐标为 $(c_x, c_y)$
- 当前视口偏移为 $(x_1, y_1)$，目标视口偏移为 $(x_2, y_2)$

**核心约束**：缩放前后，缩放中心点对应的世界坐标必须保持不变。

设缩放中心对应的世界坐标为 $(w_x, w_y)$：

**缩放前**：
$$w_x = \frac{c_x - x_1}{z_1}, \quad w_y = \frac{c_y - y_1}{z_1}$$

**缩放后**（世界坐标不变，但屏幕坐标仍为 $(c_x, c_y)$）：
$$c_x = w_x \cdot z_2 + x_2, \quad c_y = w_y \cdot z_2 + y_2$$

**推导新的视口偏移**：
$$x_2 = c_x - w_x \cdot z_2 = c_x - \frac{c_x - x_1}{z_1} \cdot z_2$$

$$y_2 = c_y - w_y \cdot z_2 = c_y - \frac{c_y - y_1}{z_1} \cdot z_2$$

化简：
$$x_2 = c_x - (c_x - x_1) \cdot \frac{z_2}{z_1} = c_x \cdot (1 - \frac{z_2}{z_1}) + x_1 \cdot \frac{z_2}{z_1}$$

$$y_2 = c_y \cdot (1 - \frac{z_2}{z_1}) + y_1 \cdot \frac{z_2}{z_1}$$

### 4.2.2 以任意点为中心的缩放

上述公式可以用矩阵变换更优雅地表达：

```
新坐标 = 平移到中心 → 逆向原缩放 → 应用新缩放 → 平移回原点
```

用矩阵表示：
$$\mathbf{M} = \mathbf{T}(c_x, c_y) \cdot \mathbf{S}(z_2, z_2) \cdot \mathbf{S}(1/z_1, 1/z_1) \cdot \mathbf{T}(-c_x, -c_y)$$

**代码实现**：`infinite-plugins/src/plugins/viewport-plugin/commands/zoom.ts`

```typescript
function zoomTo(zoom: number, options: ZoomOptions = {}) {
    const { point, cubeBezier = defaultCubeBezier, ...rest } = options;

    const { viewport } = editor;
    const { minZoom, maxZoom } = viewport.limit;
    const [top, right, bottom, left] = viewport.padding;

    // 如果没有指定缩放中心，默认使用可用区域的中心点
    const origin = point || {
        x: (viewport.clientWidth - left - right) / 2 + left,
        y: (viewport.clientHeight - top - bottom) / 2 + top,
    };

    // 限制缩放范围
    zoom = clamp(zoom, minZoom, maxZoom);

    // 构建变换矩阵
    // 步骤1: 平移，使缩放中心移到原点
    // 步骤2: 逆向当前缩放（除以当前zoom）
    // 步骤3: 应用新缩放
    // 步骤4: 平移回原位
    const matrix = Matrix.IDENTITY
        .translate(-origin.x, -origin.y)           // 步骤1
        .scale(1 / viewport.zoom, 1 / viewport.zoom)  // 步骤2
        .scale(zoom, zoom)                         // 步骤3
        .translate(origin.x, origin.y);            // 步骤4

    // 应用变换矩阵到当前视口位置
    const to = matrix.apply({
        x: viewport.x,
        y: viewport.y,
    });

    // 执行动画过渡
    animate({
        x: to.x,
        y: to.y,
        zoom,
        cubeBezier,
        ...rest,
    });
}
```

**图示说明**：

```
原始状态：zoom = 1, center = (300, 200)
┌──────────────────────┐
│          ○           │  ← 缩放中心点 (300, 200)
│       ┌─────┐        │
│       │  A  │        │
│       └─────┘        │
└──────────────────────┘

缩放后：zoom = 2, 中心点位置保持不变
┌──────────────────────┐
│          ○           │  ← 仍在屏幕 (300, 200)
│   ┌───────────┐      │
│   │           │      │
│   │     A     │      │
│   │           │      │
│   └───────────┘      │
└──────────────────────┘
```

### 4.2.3 滚轮缩放实现

滚轮缩放是最常用的缩放交互方式，需要实时响应且流畅。

**代码位置**：`infinite-plugins/src/plugins/viewport-plugin/hooks/use-gesture.ts`

```typescript
function handleZoom(event: WheelEvent) {
    // 1. 计算鼠标相对于画布容器的位置（屏幕坐标）
    const { left, top } = editor.containerRect;
    const x = event.clientX - left;
    const y = event.clientY - top;

    const { viewport } = editor;
    
    // 2. 计算缩放增量
    // deltaY > 0 表示向下滚动（缩小），deltaY < 0 表示向上滚动（放大）
    // 限制 deltaY 范围防止触控板高灵敏度导致的过快缩放
    const deltaY = clamp(event.deltaY, -80, 80);
    
    // 3. 计算缩放因子
    // 0.6 是经验值，用于控制缩放速率
    // deltaY = 0 时，delta = 1（不变）
    // deltaY = -80 时，delta ≈ 1.48（放大 48%）
    // deltaY = 80 时，delta ≈ 0.52（缩小 48%）
    const delta = (100 - deltaY * 0.6) / 100;
    
    // 4. 计算目标缩放值并限制范围
    const { minZoom, maxZoom } = editor.viewport.limit;
    const zoom = clamp(delta * viewport.zoom, minZoom, maxZoom);

    // 5. 构建变换矩阵（以鼠标位置为中心）
    const matrix = Matrix.IDENTITY
        .translate(-x, -y)
        .scale(1 / viewport.zoom, 1 / viewport.zoom)
        .scale(zoom, zoom)
        .translate(x, y);

    // 6. 计算新的视口位置
    const point = matrix.apply({
        x: editor.viewport.x,
        y: editor.viewport.y,
    });

    // 7. 应用变换（无动画，即时响应）
    editor.viewport.setZoom(zoom);
    editor.viewport.setPosition(point.x, point.y);
}
```

**缩放速率曲线**：

```
delta 值与 deltaY 的关系图

delta
  ^
1.5│         ╱
   │       ╱
1.0│─────○─────────
   │       ╲
0.5│         ╲
   └──────────────► deltaY
      -80  0  80
      
○ 表示原点(0, 1)，即不滚动时保持原有缩放
```

### 4.2.4 缩放限制与边界处理

缩放时需要同时处理缩放比例限制和视口位置边界：

```typescript
setZoom(zoom: number): void {
    const { minZoom, maxZoom } = this.limit;
    // 限制缩放比例在有效范围内
    const finalZoom = Math.max(minZoom, Math.min(zoom, maxZoom));
    
    this.editor.global.zoom = finalZoom;
    // 缩放后重新计算位置边界
    this.setPosition();
}

setPosition(x = this._x, y = this._y): void {
    if (Number.isNaN(x) || Number.isNaN(y)) {
        return;
    }

    // 调用位置调整 hook（用于海报模式的居中处理）
    const point = this.editor.adjustPosition(
        x,
        y,
        this.editor.mode === 'flow' ? this.editor.currentPage : this.editor.currentLayout,
    );

    // 计算屏幕坐标系下的边界
    const { left, top, right, bottom } = this.limit;
    const clientLeft = left * this.zoom;
    const clientTop = top * this.zoom;
    const clientRight = right * this.zoom;
    const clientBottom = bottom * this.zoom;

    // 限制视口位置在有效范围内
    // clientWidth - clientRight: 右边界的最大偏移
    // -clientLeft: 左边界的最小偏移
    const clampX = clamp(point.x, this.clientWidth - clientRight, -clientLeft);
    const clampY = clamp(point.y, this.clientHeight - clientBottom, -clientTop);

    this._x = clampX;
    this._y = clampY;
}
```

**边界约束的几何意义**：

```
假设画布边界为 [-1000, -1000, 1000, 1000]，zoom = 0.5

屏幕坐标系下的边界：
- clientLeft = -1000 × 0.5 = -500
- clientRight = 1000 × 0.5 = 500

视口宽度 = 800px

x 的有效范围：
- 最小值 = clientWidth - clientRight = 800 - 500 = 300
- 最大值 = -clientLeft = 500

当 x = 500 时，画布左边界对齐屏幕左边缘
当 x = 300 时，画布右边界对齐屏幕右边缘
```

---

## 4.3 平移系统

平移（Pan）是无限画布的另一核心交互，让用户能够在无限空间中自由移动视角。

### 4.3.1 平移的基本实现

平移的本质是改变视口偏移量 `(x, y)`，最基础的实现非常简单：

**代码位置**：`infinite-renderer/src/viewport/viewport.ts`

```typescript
class Viewport<P extends IBasePageVm = IBasePageVm>
    extends EventEmitter<ViewportEvents>
    implements IViewport<P>
{
    position = new Point();
    zoom = 1;

    setPosition(x = this.position.x, y = this.position.y): void {
        this.page.setState({
            x,
            y,
        });
        this.position.set(x, y);
    }

    translate(x = 0, y = 0): void {
        this.setPosition(this.position.x + x, this.position.y + y);
    }
}
```

**滚轮平移的实现**：

```typescript
// use-gesture.ts
function handleScroll(event: WheelEvent) {
    // 滚轮的 delta 方向与视口移动方向相反
    // 向下滚动 (deltaY > 0) → 视口向上移动 (y 减少)
    editor.viewport.translate(-event.deltaX, -event.deltaY);
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + 滚轮 = 缩放
        handleZoom(event);
    } else {
        // 普通滚轮 = 平移
        handleScroll(event);
    }
}
```

### 4.3.2 平移边界约束

在业务层 Viewport 中，平移会受到边界约束：

```typescript
// framework/src/core/viewport/viewport.ts
translate(x: number, y: number): void {
    if (this.editor.enableSurfaceRender) {
        this.setPosition(this.x + x, this.y + y);
    }
}

setPosition(x = this._x, y = this._y): void {
    // ... 参数校验 ...

    // 调用 hook 进行位置调整（见 4.3.3）
    const point = this.editor.adjustPosition(x, y, ...);

    // 计算边界限制
    const { left, top, right, bottom } = this.limit;
    const clientLeft = left * this.zoom;
    const clientTop = top * this.zoom;
    const clientRight = right * this.zoom;
    const clientBottom = bottom * this.zoom;

    // 约束在有效范围内
    const clampX = clamp(point.x, this.clientWidth - clientRight, -clientLeft);
    const clampY = clamp(point.y, this.clientHeight - clientBottom, -clientTop);

    this._x = clampX;
    this._y = clampY;
}
```

### 4.3.3 自动位置调整

在海报模式下，画板需要居中显示，这需要自动调整视口位置：

**代码位置**：`infinite-plugins/src/plugins/viewport-controller-plugin/viewport-controller-plugin.ts`

```typescript
/**
 * 调整视窗偏移位置
 * @param x 视窗 X 偏移
 * @param y 视窗 Y 偏移
 * @param frame 聚焦区域（画板边界）
 * @param clientWidth 视窗宽度
 * @param clientHeight 视窗高度
 * @param padding 视窗边距
 */
function adjustPosition(
    x: number,
    y: number,
    frame: Rectangle,
    clientWidth: number,
    clientHeight: number,
    padding: number[] = [],
): Point {
    const [top = 0, right = 0, bottom = 0, left = 0] = padding;

    let adjustedX = x;
    let adjustedY = y;

    // 水平方向调整
    if (clientWidth > frame.width + left + right) {
        // 视窗比内容大 → 居中显示
        adjustedX = (clientWidth - left - right - frame.width) / 2 + left - frame.x;
    } else {
        // 视窗比内容小 → 限制在边界内
        const minX = clientWidth - right - frame.width - frame.x;
        const maxX = left - frame.x;
        adjustedX = clamp(x, minX, maxX);
    }

    // 垂直方向调整
    if (clientHeight > frame.height + top + bottom) {
        // 视窗比内容大 → 居中显示
        adjustedY = (clientHeight - top - bottom - frame.height) / 2 + top - frame.y;
    } else {
        // 视窗比内容小 → 限制在边界内
        const minY = clientHeight - bottom - frame.height - frame.y;
        const maxY = top - frame.y;
        adjustedY = clamp(y, minY, maxY);
    }

    return { x: adjustedX, y: adjustedY };
}
```

**可视化示例**：

```
情况1：视窗 > 内容（居中）
┌───────────────────────────┐
│         padding-top       │
│  ┌─────────────────────┐  │
│  │    ┌───────────┐    │  │
│  │    │   画板    │    │  │
│  │    │  (居中)   │    │  │
│  │    └───────────┘    │  │
│  └─────────────────────┘  │
│        padding-bottom     │
└───────────────────────────┘

情况2：视窗 < 内容（边界约束）
┌───────────────────────────┐
│┌─────────────────────────┐│
││                         ││
││      画板（部分可见）    ││
││                         ││
│└─────────────────────────┘│
└───────────────────────────┘
用户只能在画板范围内平移
```

### 4.3.4 自动滚动（Auto-Scroll）

当用户拖拽元素到视口边缘时，画布应该自动滚动：

**代码位置**：`infinite-plugins/src/plugins/auto-scroll-plugin/hooks/use-viewport-auto-scroll.ts`

```typescript
export function useViewportAutoScroll(editor: VPEditor) {
    const boundingThreshold = 20;  // 触发区域宽度（像素）
    const defaultTranslateStep = 10;  // 默认滚动速度

    let translateX = 0;
    let translateY = 0;
    let translateStep = defaultTranslateStep;

    // 计算滚动速度：距离边缘越近，速度越快
    function _calculateTranslateStep(distance: number) {
        // 距离为 0 时，速度最大 (= defaultTranslateStep)
        // 距离为 boundingThreshold 时，速度为 0
        const translateStep = Math.max(
            0,
            defaultTranslateStep - (distance / boundingThreshold) * defaultTranslateStep
        );
        return translateStep;
    }

    function mouseMove(event: MouseEvent) {
        if (!checkIsMousedown()) return;

        const targetElement = editor.shell;
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const { left, top, width, height } = targetElement.getBoundingClientRect();
        const right = left + width;
        const bottom = top + height;

        // 计算鼠标到各边的距离
        const distanceToTop = Math.max(0, mouseY - top);
        const distanceToBottom = Math.min(0, mouseY - bottom);
        const distanceToLeft = Math.max(0, mouseX - left);
        const distanceToRight = Math.min(0, mouseX - right);

        // 判断鼠标位移方向
        const dx = mouseX - startX;
        const dy = mouseY - startY;

        // 检测上边缘
        if (mouseY - boundingThreshold <= top && dy < 0) {
            translateStep = _calculateTranslateStep(distanceToTop);
            translateY = translateStep;  // 向上滚动
        }
        // 检测下边缘
        else if (mouseY + boundingThreshold >= bottom && dy > 0) {
            translateStep = _calculateTranslateStep(-distanceToBottom);
            translateY = -translateStep;  // 向下滚动
        }
        else {
            translateY = 0;
        }

        // 检测左边缘
        if (mouseX - boundingThreshold <= left && dx < 0) {
            translateStep = _calculateTranslateStep(distanceToLeft);
            translateX = translateStep;  // 向左滚动
        }
        // 检测右边缘
        else if (mouseX + boundingThreshold >= right && dx > 0) {
            translateStep = _calculateTranslateStep(-distanceToRight);
            translateX = -translateStep;  // 向右滚动
        }
        else {
            translateX = 0;
        }

        // 如果需要滚动，启动滚动循环
        if (translateX !== 0 || translateY !== 0) {
            startAutoScroll();
        }
    }
}
```

**自动滚动的触发区域**：

```
┌─────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← 上边缘触发区
│░                              ░│
│░                              ░│
│░                              ░│
│░   可用区域（不触发自动滚动）    ░│
│░                              ░│
│░                              ░│
│░                              ░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← 下边缘触发区
└─────────────────────────────────┘
  ↑                              ↑
左边缘                          右边缘
触发区                          触发区
```

---

## 4.4 视口命令系统

除了手势交互，还需要提供程序化的视口控制接口，用于实现"适配窗口"、"聚焦到元素"等功能。

### 4.4.1 zoomTo - 缩放到指定比例

`zoomTo` 是最基础的缩放命令，将视口缩放到指定比例：

```typescript
interface ZoomOptions {
    point?: IPointData;      // 缩放中心点（屏幕坐标）
    time?: number;           // 动画时长（秒）
    cubeBezier?: number[];   // 贝塞尔曲线参数
    callback?: () => void;   // 完成回调
}

function zoomTo(zoom: number, options: ZoomOptions = {}) {
    const { point, cubeBezier = defaultCubeBezier, ...rest } = options;

    const { viewport } = editor;
    const { minZoom, maxZoom } = viewport.limit;
    const [top, right, bottom, left] = viewport.padding;

    // 默认以可用区域中心为缩放中心
    const origin = point || {
        x: (viewport.clientWidth - left - right) / 2 + left,
        y: (viewport.clientHeight - top - bottom) / 2 + top,
    };

    zoom = clamp(zoom, minZoom, maxZoom);

    // 使用矩阵计算新位置
    const matrix = Matrix.IDENTITY
        .translate(-origin.x, -origin.y)
        .scale(1 / viewport.zoom, 1 / viewport.zoom)
        .scale(zoom, zoom)
        .translate(origin.x, origin.y);

    const to = matrix.apply({
        x: viewport.x,
        y: viewport.y,
    });

    animate({
        x: to.x,
        y: to.y,
        zoom,
        cubeBezier,
        ...rest,
    });
}
```

**使用示例**：

```typescript
// 缩放到 200%，以屏幕中心为缩放中心
editor.plugins.invokeCommand('board-viewport:zoomTo', 2);

// 缩放到 50%，以鼠标位置为中心
editor.plugins.invokeCommand('board-viewport:zoomTo', 0.5, {
    point: { x: mouseX, y: mouseY },
    time: 0.3,
});
```

### 4.4.2 zoomToFit - 适配窗口

`zoomToFit` 自动计算最佳缩放比例，使所有元素都能显示在视口中：

```typescript
interface FitZoomOptions {
    padding?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    time?: number;
    cubeBezier?: number[];
    callback?: () => void;
    viewportSize?: [number, number];  // 动画时的视口尺寸
}

function zoomToFit(options: FitZoomOptions = {}) {
    const { viewport } = editor;
    const {
        padding = {
            top: viewport.padding[0],
            right: viewport.padding[1],
            bottom: viewport.padding[2],
            left: viewport.padding[3],
        },
        cubeBezier = defaultCubeBezier,
        viewportSize = [editor.viewport.clientWidth, editor.viewport.clientHeight],
        ...rest
    } = options;

    // 获取所有元素的包围盒
    const bounds = appRef.value!.getElementsLocalBounds();

    const { x, y, zoom } = _calcFitZoom(bounds, viewportSize, padding);

    animate({
        x,
        y,
        zoom,
        cubeBezier,
        ...rest,
    });
}

function _calcFitZoom(
    bounds: Rectangle,
    size: [number, number],
    padding: Required<FitZoomOptions>['padding'],
): FitZoomResult {
    let x = 0;
    let y = 0;
    let zoom = 1;

    if (isValidSize(bounds.width) && isValidSize(bounds.height)) {
        const marginLeftAndRight = padding.left + padding.right;
        const marginTopAndBottom = padding.top + padding.bottom;
        const clientWidth = size[0] - marginLeftAndRight;
        const clientHeight = size[1] - marginTopAndBottom;

        // 计算适配缩放比例
        // 取宽高比例的较小值，确保内容完全可见
        zoom = Math.min(
            editor.mode !== 'board' ? editor.options.autoFitMaxZoom : Number.POSITIVE_INFINITY,
            Math.min(
                editor.viewport.limit.maxZoom,
                clientWidth / bounds.width,
                clientHeight / bounds.height,
            ),
        );

        // 计算居中位置
        // x = -bounds.x * zoom 将元素左上角移到视口原点
        // + (size[0] - bounds.width * zoom) / 2 水平居中
        // - (marginLeftAndRight / 2 - padding.left) 考虑非对称 padding
        x = -bounds.x * zoom +
            (size[0] - bounds.width * zoom) / 2 -
            (marginLeftAndRight / 2 - padding.left);
        
        y = -bounds.y * zoom +
            (size[1] - bounds.height * zoom) / 2 -
            (marginTopAndBottom / 2 - padding.top);
    }

    return { x, y, zoom };
}
```

**适配算法图示**：

```
输入：元素包围盒 bounds = {x: 100, y: 50, width: 800, height: 600}
     视口尺寸 = 1200 × 800
     padding = {top: 50, right: 100, bottom: 50, left: 100}

计算过程：
1. 可用区域 = (1200 - 200) × (800 - 100) = 1000 × 700
2. 缩放比例 = min(1000/800, 700/600) = min(1.25, 1.17) = 1.17
3. 缩放后尺寸 = 800 × 1.17 ≈ 936, 600 × 1.17 ≈ 702
4. 水平偏移 = -100 × 1.17 + (1200 - 936) / 2 - 0 = -117 + 132 = 15
5. 垂直偏移 = -50 × 1.17 + (800 - 702) / 2 - 0 = -58.5 + 49 = -9.5

结果：{ x: 15, y: -9.5, zoom: 1.17 }
```

### 4.4.3 zoomToElement - 聚焦到元素

`zoomToElement` 调整视口使指定元素完整显示，通常用于选中元素后的聚焦：

```typescript
interface ZoomToElementOptions {
    margin?: number;         // 元素与视口边缘的最小间距
    padding?: number[];      // 视口 padding
    time?: number;
    cubeBezier?: number[];
    callback?: () => void;
}

function zoomToBounds(bounds: Rectangle, options: ZoomToElementOptions = {}) {
    const { margin = 60, padding = [], cubeBezier = defaultCubeBezier, ...rest } = options;

    const rect = bounds;
    const { viewport } = editor;

    // 计算元素在屏幕坐标系下相对于视窗的位置
    const left = rect.x;
    const top = rect.y;
    const right = viewport.clientWidth - (rect.x + rect.width);
    const bottom = viewport.clientHeight - (rect.y + rect.height);

    const [paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0] = padding;

    // 计算元素超出视窗的部分
    const clientLeft = Math.min(left, 0);
    const clientTop = Math.min(top, 0);
    const clientRight = Math.min(right, 0);
    const clientBottom = Math.min(bottom, 0);

    let extendLeft = 0, extendTop = 0, extendRight = 0, extendBottom = 0;

    // 计算需要额外扩展的空间（padding + margin）
    if (left < paddingLeft) {
        extendLeft = paddingLeft - Math.max(left, 0) + margin;
    }
    if (top < paddingTop) {
        extendTop = paddingTop - Math.max(top, 0) + margin;
    }
    if (right < paddingRight) {
        extendRight = paddingRight - Math.max(right, 0) + margin;
    }
    if (bottom < paddingBottom) {
        extendBottom = paddingBottom - Math.max(bottom, 0) + margin;
    }

    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    const extendHorizontal = extendLeft + extendRight;
    const extendVertical = extendTop + extendBottom;

    /**
     * 比例计算核心公式
     * 
     * 视窗长度记为 a，元素包围盒扩展后记为 a + p
     * 元素包围盒 + padding/margin 记为 b = a + p + q
     * 
     * 我们要将 b 缩放到 c = a
     * 
     * λ(a + p) + q = a
     * λ = (a - q) / (a + p)
     */
    const λ = Math.min(
        (w - extendHorizontal) / (w - clientLeft - clientRight),
        (h - extendVertical) / (h - clientTop - clientBottom),
    );

    // 计算偏移量
    const offsetLeft = clientLeft - extendLeft;
    const offsetTop = clientTop - extendTop;
    const offsetRight = clientRight - extendRight;
    const offsetBottom = clientBottom - extendBottom;
    const offsetWidth = w - offsetLeft - offsetRight;
    const offsetHeight = h - offsetTop - offsetBottom;

    // 视窗坐标系中心点
    const offsetCX = offsetLeft + offsetWidth / 2;
    const offsetCY = offsetTop + offsetHeight / 2;

    // 目标缩放值
    const zoom = viewport.zoom * λ;

    // 构建视窗变换矩阵
    const matrix = Matrix.IDENTITY
        .translate(-offsetCX, -offsetCY)
        .scale(1 / viewport.zoom, 1 / viewport.zoom)
        .scale(zoom, zoom)
        .translate(offsetCX, offsetCY)
        .translate(
            -(offsetCX - viewport.clientWidth / 2),
            -(offsetCY - viewport.clientHeight / 2),
        );

    const pos = matrix.apply({
        x: viewport.x,
        y: viewport.y,
    });

    animate({
        x: pos.x,
        y: pos.y,
        zoom,
        cubeBezier,
        ...rest,
    });
}
```

### 4.4.4 scrollToElement - 滚动到元素

`scrollToElement` 只改变位置不改变缩放，用于导航到指定元素：

```typescript
interface ScrollToElementOptions {
    padding?: [number, number, number, number];
    time?: number;
    zoom?: number;           // 可选的目标缩放值
    offsetX?: number;        // X 轴额外偏移
    offsetY?: number;        // Y 轴额外偏移
    cubeBezier?: number[];
    callback?: () => void;
}

function scrollToBounds(bounds: Rectangle, options: ScrollToElementOptions = {}) {
    const { cubeBezier = defaultCubeBezier, callback = noop, ...rest } = options;
    const { viewport } = editor;
    const padding = options.padding ?? viewport.padding;

    // 如果元素已经完全在视窗内，不做处理
    if (
        appRef.value!.screen.containsRect(
            new Rectangle(
                bounds.x - padding[3],
                bounds.y - padding[0],
                bounds.width + padding[1] + padding[3],
                bounds.height + padding[2] + padding[0],
            ),
        )
    ) {
        callback();
        return;
    }

    // 将屏幕坐标的包围盒转换为世界坐标
    const localRect = appRef.value!.getLocalRect(bounds, editor.currentPage);

    const clientWidth = viewport.clientWidth - padding[1] - padding[3];
    const clientHeight = viewport.clientHeight - padding[0] - padding[2];

    // 计算目标缩放（如果没有指定且元素太大，需要缩小）
    let { zoom } = options;
    if (!zoom) {
        zoom = bounds.width > clientWidth || bounds.height > clientHeight
            ? Math.max(
                viewport.limit.minZoom,
                viewport.zoom * Math.min(
                    clientWidth / bounds.width,
                    clientHeight / bounds.height
                ),
            )
            : viewport.zoom;
    }

    // 计算偏移使元素居中
    const offsetPoint = {
        x: options.offsetX ??
            (viewport.clientWidth - localRect.width * zoom + padding[3] - padding[1]) / 2,
        y: options.offsetY ??
            (viewport.clientHeight - localRect.height * zoom + padding[0] - padding[2]) / 2,
    };

    const x = -localRect.x * zoom + offsetPoint.x;
    const y = -localRect.y * zoom + offsetPoint.y;

    animate({
        x,
        y,
        zoom,
        cubeBezier,
        callback,
        ...rest,
    });
}
```

---

## 4.5 视口动画系统

良好的动画效果能显著提升用户体验。视口动画系统基于三次贝塞尔曲线实现平滑的过渡效果。

### 4.5.1 三次贝塞尔曲线原理

三次贝塞尔曲线由四个控制点 $P_0, P_1, P_2, P_3$ 定义：

$$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3, \quad t \in [0, 1]$$

在动画中，我们使用归一化的贝塞尔曲线：
- $P_0 = (0, 0)$：动画开始
- $P_3 = (1, 1)$：动画结束
- $P_1 = (x_1, y_1)$, $P_2 = (x_2, y_2)$：控制点，决定动画曲线形状

**代码位置**：`editor/utils/src/cubic-bezier.ts`

```typescript
class CubicBezier {
    private x0 = 0, y0 = 0;  // P0 = (0, 0)
    private x1: number, y1: number;  // P1
    private x2: number, y2: number;  // P2
    private x3 = 1, y3 = 1;  // P3 = (1, 1)

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * 获取参数 t 对应的点坐标
     * @param t 参数值 ∈ [0, 1]
     */
    get(t: number): [number, number] {
        const dt = 1 - t;
        const dt2 = dt * dt;
        const dt3 = dt * dt2;
        const t2 = t * t;
        const t3 = t * t2;

        const x = dt3 * this.x0 + 3 * dt2 * t * this.x1 + 3 * dt * t2 * this.x2 + t3 * this.x3;
        const y = dt3 * this.y0 + 3 * dt2 * t * this.y1 + 3 * dt * t2 * this.y2 + t3 * this.y3;
        return [x, y];
    }
}
```

### 4.5.2 动画插值计算

动画的核心问题是：给定时间进度 $x$（0~1），求动画进度 $y$（0~1）。

由于贝塞尔曲线是参数方程，我们不能直接用 $x$ 求 $y$，需要先找到使 $B_x(t) = x$ 的参数 $t$，再计算 $y = B_y(t)$。

**两种求解方法**：

1. **牛顿迭代法（快速但可能不稳定）**：
   $$t_{n+1} = t_n - \frac{B_x(t_n) - x}{B_x'(t_n)}$$

2. **二分法（稳定但较慢）**：
   不断缩小区间直到 $B_x(t) \approx x$

```typescript
/**
 * 获取指定 x 参数下的 y 值
 * @param x 时间进度 ∈ [0, 1]
 * @param epsilon 精度阈值
 * @returns y 动画进度
 */
getY(x: number, epsilon = 1e-6): number {
    // 边界检查
    if (x <= 0) return this.y0;
    if (x >= 1) return this.y3;

    // 先尝试牛顿迭代法（快速）
    let { t, success } = this.findTByNewton(x, epsilon);

    // 如果牛顿迭代失败，使用二分法（稳定）
    if (!success) {
        t = this.findTByBisection(x, t, epsilon);
    }

    // 使用找到的 t 值计算 y
    const [, y] = this.get(t);
    return y;
}

/**
 * 牛顿迭代法
 */
private findTByNewton(targetX: number, epsilon = 1e-6) {
    if (targetX <= 0) return { t: 0, success: true };
    if (targetX >= 1) return { t: 1, success: true };

    // 初始猜测：对于单调递增曲线，x 和 t 通常接近
    let t = targetX;

    for (let i = 0; i < 10; i++) {
        const x = this.getX(t);
        const dx = this.getXDerivative(t);

        // 导数为 0 无法继续迭代
        if (Math.abs(dx) < 1e-10) {
            return { t, success: false };
        }

        const error = x - targetX;
        if (Math.abs(error) < epsilon) {
            return { t, success: true };
        }

        // 牛顿迭代公式
        const tNew = t - error / dx;

        // 确保 t 在有效范围内
        if (tNew < 0 || tNew > 1) {
            return { t, success: false };
        }

        t = tNew;
    }

    return { t, success: Math.abs(this.getX(t) - targetX) < epsilon };
}

/**
 * 二分法
 */
private findTByBisection(targetX: number, t = 0.5, epsilon = 1e-6): number {
    let low = 0;
    let high = 1;

    // 根据精度计算迭代次数：n >= log2(1/epsilon)
    const maxIterations = Math.min(Math.ceil(Math.log2(1 / epsilon)) + 1, 50);

    for (let i = 0; i < maxIterations; i++) {
        t = (low + high) / 2;
        const currentX = this.getX(t);

        if (Math.abs(currentX - targetX) < epsilon) {
            break;
        }

        if (currentX < targetX) {
            low = t;
        } else {
            high = t;
        }
    }

    return t;
}
```

**常用缓动函数**：

```typescript
export const TimingFunctionMap = {
    'linear': [0, 0, 1, 1],           // 线性，匀速
    'ease': [0.25, 0.1, 0.25, 1],     // 默认，先加速后减速
    'ease-in': [0.42, 0, 1, 1],       // 加速进入
    'ease-out': [0, 0, 0.58, 1],      // 减速退出
    'ease-in-out': [0.42, 0, 0.58, 1],// 两端慢中间快
};
```

**缓动曲线可视化**：

```
y (动画进度)
  ^
1 │           ___---=
  │       _--
  │     _/        ease-out
  │   _/
  │  /
  │ /
0 └──────────────────► x (时间进度)
       0            1

y (动画进度)
  ^
1 │                =---___
  │                      --_
  │         ease-in        \_
  │                          \_
  │                            \
  │                             \
0 └──────────────────────────────► x (时间进度)
       0                       1
```

### 4.5.3 动画帧管理

动画通过 `requestAnimationFrame` 逐帧执行：

**代码位置**：`editor/utils/src/animate.ts`

```typescript
export interface AnimateOptions<T extends number[] = number[]> {
    data: T;                    // 动画属性增量数组
    time?: number;              // 动画时长（秒）
    timingFunction?: TimingFunction | CubicBezierPoints;
    update?: Update<T>;         // 每帧回调
    callback?: Function;        // 完成回调
    requestFrame?: () => number;
}

export function animate<T extends number[] = number[]>(options: AnimateOptions<T>): void {
    const {
        data,
        time = 0.5,
        timingFunction = 'ease',
        update = noop,
        callback = noop,
        requestFrame = window.requestAnimationFrame,
    } = options;

    // 解析贝塞尔曲线参数
    const points = Array.isArray(timingFunction)
        ? timingFunction
        : TimingFunctionMap[timingFunction];
    const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = points;
    const bezier = CubicBezier.from(x1, y1, x2, y2);

    let tick = performance.now();
    let total = 0;

    const requestAnimation = () => {
        const now = performance.now();
        const elapse = now - tick;

        tick = now;
        total += elapse;

        // 计算时间进度
        const percent = time <= 0 ? 1 : total / 1000 / time;
        
        // 计算当前帧的属性值
        const delta = data.slice();

        if (percent < 1) {
            // 通过贝塞尔曲线计算动画进度
            const step = bezier.getY(percent);

            for (let i = 0; i < delta.length; i++) {
                delta[i] = step * data[i];
            }
        }

        let timer = -1;

        // 如果动画未完成，继续请求下一帧
        if (percent < 1) {
            timer = requestFrame(requestAnimation);
        }

        // 调用更新回调
        update(delta, timer);

        // 动画完成时调用完成回调
        if (percent >= 1) {
            callback();
        }
    };

    requestAnimation();
}
```

**视口动画的使用**：

```typescript
function animate(options: AnimateOptions): void {
    window.cancelAnimationFrame(timer);  // 取消之前的动画

    const {
        x = editor.viewport.x,
        y = editor.viewport.y,
        zoom = editor.viewport.zoom,
        time = 0.5,
        cubeBezier = [],
        callback = noop,
    } = options;

    const fromX = editor.viewport.x;
    const fromY = editor.viewport.y;
    const fromZoom = editor.viewport.zoom;

    // 计算增量
    const dx = x - fromX;
    const dy = y - fromY;
    const dz = zoom - fromZoom;

    const update: Update<number[]> = (data, $timer) => {
        timer = $timer;

        const [$dx, $dy, $dz] = data;

        // NOTE: 动画过程中需要先设置 zoom 再设置 position
        // 否则可能出现画面抖动
        editor.viewport.setZoom(fromZoom + $dz);
        editor.viewport.setPosition(fromX + $dx, fromY + $dy);
    };

    $animate({
        data: [dx, dy, dz],
        time,
        cubeBezier,
        update,
        callback,
    });
}
```

---

## 4.6 视口持久化

为了提升用户体验，需要记住用户的视口状态，下次打开时恢复到上次的位置和缩放。

### 4.6.1 LRU 缓存策略

视口状态使用 LRU（Least Recently Used，最近最少使用）缓存策略存储：

**代码位置**：`common/lru-cache/src/index.ts`

```typescript
export interface LRUOptions {
    capacity?: number;      // 最大容量，默认 100
    persistent?: boolean;   // 是否持久化到 localStorage，默认 true
}

interface LRUItem<T = any> {
    key: string;       // 缓存键
    data: T;           // 缓存数据
    time: number;      // 时间戳，用于 LRU 排序
}

export class LRUCache<T = any> {
    // 非持久化缓存的内存存储
    private static memoryCacheMap: Map<string, OrderArray<LRUItem>> = new Map();

    private name: string;
    private capacity: number;
    private persistent: boolean;

    constructor(name: string, options: LRUOptions = {}) {
        const { capacity = 100, persistent = true } = options;
        this.name = name;
        this.capacity = capacity;
        this.persistent = persistent;
    }

    /**
     * 获取缓存项
     */
    getItem(key: string): LRUItem<T> | undefined {
        const store = this.getStore();
        const index = store.findIndex((item) => item.key === key);
        return store.get(index);
    }

    /**
     * 设置缓存项
     * 如果已存在则更新，不存在则添加
     * 同时更新时间戳以标记为"最近使用"
     */
    setItem(key: string, data: T): void {
        const store = this.getStore();
        const index = store.findIndex((item) => item.key === key);

        // 移除旧项
        store.remove(index);
        
        // 添加新项（使用当前时间戳）
        store.push({
            key,
            data,
            time: Date.now(),
        });

        this.save(store);
    }

    /**
     * 保存到存储
     * 超出容量时移除最旧的项
     */
    private save(store: OrderArray<LRUItem<T>>): void {
        // 限制容量
        while (store.length > this.capacity) {
            store.pop();  // 移除最旧的（时间戳最小的）
        }

        if (this.persistent) {
            localStorage.setItem(this.name, JSON.stringify(store.toArray()));
        } else {
            LRUCache.memoryCacheMap.set(this.name, store as OrderArray<LRUItem>);
        }
    }
}
```

**LRU 缓存工作原理**：

```
假设容量 = 3

操作序列：
1. set('A', {...})  → [A]
2. set('B', {...})  → [B, A]       // B 更新，移到最前
3. set('C', {...})  → [C, B, A]
4. get('A')         → [C, B, A]    // get 不影响顺序
5. set('D', {...})  → [D, C, B]    // A 被淘汰（最久未使用）
6. set('B', {...})  → [B, D, C]    // B 更新，移到最前
```

### 4.6.2 视口状态恢复

**代码位置**：`infinite-plugins/src/plugins/viewport-plugin/hooks/use-viewport.ts`

```typescript
interface ViewportState {
    x: number;
    y: number;
    zoom: number;
}

export function useViewport(
    editor: VPEditor,
    surface: BoardSurface,
    options: ViewportInitOptions = {},
) {
    const { useSavedViewport = false, autoZoomToFit = false } = options;

    // 创建 LRU 缓存实例，容量 100
    const cache = new LRUCache<ViewportState>('editor-viewport-cache', {
        capacity: 100,
    });

    // 生成缓存 key：模板ID + 页面UUID
    function createCacheKey(pageUUID: string) {
        const id = getQueryParam('id') || '';
        return `${id}:${pageUUID}`;
    }

    // 节流保存视口状态（5秒一次）
    const save = throttle((x: number, y: number, zoom: number) => {
        // 模板预览模式不保存
        if (isGdTemplet()) return;
        
        const page = editor.currentPage;
        cache.setItem(createCacheKey(page.uuid), { x, y, zoom });
    }, 5000);

    let autoFitted = false;

    // 监听视口变化，自动保存
    if (useSavedViewport) {
        watch(
            () => [viewport.x, viewport.y, viewport.zoom],
            ([x, y, zoom]) => {
                if (autoFitted && typeof x === 'number' && typeof y === 'number') {
                    save(x, y, zoom);
                }
            },
        );
    }

    // 初始化时恢复视口状态
    window.requestAnimationFrame(() => {
        if (useSavedViewport) {
            const page = editor.currentPage;
            const item = cache.getItem(createCacheKey(page.uuid));
            const data = item?.data;

            // 恢复上次的缩放和位置
            if (data &&
                typeof data.x === 'number' &&
                typeof data.y === 'number' &&
                typeof data.zoom === 'number'
            ) {
                viewport.setZoom(data.zoom);
                viewport.setPosition(data.x, data.y);
                autoFitted = true;
            }
        }

        // 如果没有缓存且开启自动适配，执行 zoomToFit
        if (autoZoomToFit && !autoFitted) {
            editor.plugins.invokeCommand('board-viewport:zoomToFit', { time: 0 });
        }

        autoFitted = true;
    });
}
```

### 4.6.3 性能优化：Mipmap 策略切换

在用户快速滚动/缩放时，为了保持流畅，会临时降低渲染质量：

```typescript
const renderer = surface.viewport.app.renderer as SkRenderer;

// 恢复高质量渲染（防抖 200ms）
const restore = debounce(() => {
    renderer.mipmapStrategy = MIPMAP_STRATEGY.AUTO;
}, 200);

// 滑动时切换到低质量模式
const onWheel = () => {
    renderer.mipmapStrategy = MIPMAP_STRATEGY.NEAREST;
    restore();  // 200ms 后恢复
};

watch(
    () => [viewport.x, viewport.y],
    ([x, y]) => {
        surface.setPosition(x, y);
        onWheel();  // 触发低质量模式
    },
);

watch(
    () => viewport.zoom,
    (zoom) => {
        surface.setZoom(zoom);
        onWheel();  // 触发低质量模式
    },
);
```

**Mipmap 策略**：
- `AUTO`：自动选择最佳 mipmap 级别，质量高但计算开销大
- `NEAREST`：使用最近的 mipmap 级别，性能好但可能有锯齿

---

## 4.7 双层 Viewport 架构

项目中存在两个 Viewport 类，分别位于不同层级，各有其职责。

### 4.7.1 Framework Viewport（业务层）

**位置**：`framework/src/core/viewport/viewport.ts`

**职责**：
- 与编辑器业务逻辑集成
- 管理视口限制（limit）和内边距（padding）
- 处理响应式尺寸变化
- 提供适配缩放（fitZoom）功能

```typescript
export class Viewport implements IViewport {
    private editor: VPEditor;
    private _limit!: ViewportLimit;
    private _padding: number[] = [0, 0, 0, 0];
    private _clientWidth = 0;
    private _clientHeight = 0;
    private _x = 0;
    private _y = 0;

    get zoom() {
        return this.editor.global.zoom || 1;  // 与全局状态同步
    }

    setLimit(limit: Partial<ViewportLimit>): void { ... }
    setPadding(...): void { ... }
    bindEvent(): void { ... }
    calcFitZoom(type: FitType): number { ... }
    fitZoom(type: FitType): void { ... }
}
```

### 4.7.2 Renderer Viewport（渲染层）

**位置**：`infinite-renderer/src/viewport/viewport.ts`

**职责**：
- 管理 PixiJS Application
- 控制页面视图模型（PageVm）
- 提供坐标转换接口
- 管理画布图层和背景

```typescript
class Viewport<P extends IBasePageVm = IBasePageVm>
    extends EventEmitter<ViewportEvents>
    implements IViewport<P>
{
    get app(): Application { ... }
    get page(): P { ... }
    position = new Point();
    zoom = 1;

    initialize(page: P, options?: Partial<IApplicationOptions>): void { ... }
    setPage(page: P): void { ... }
    getLocalPoint(pos: IPointData): Point { ... }
    getGlobalPoint(pos: IPointData): Point { ... }
    setPosition(x, y): void { ... }
    setZoom(zoom): void { ... }
    resize(width, height): void { ... }
}
```

### 4.7.3 数据流同步机制

两层 Viewport 通过 Vue 的响应式系统保持同步：

```typescript
// use-viewport.ts
export function useViewport(editor: VPEditor, surface: BoardSurface, ...) {
    // 初始同步
    surface.setPosition(viewport.x, viewport.y);
    surface.setZoom(viewport.zoom);

    // 业务层 → 渲染层
    watch(
        () => [viewport.x, viewport.y],
        ([x, y]) => {
            surface.setPosition(x, y);  // 同步到渲染层
        },
    );

    watch(
        () => viewport.zoom,
        (zoom) => {
            surface.setZoom(zoom);  // 同步到渲染层
        },
    );

    watch(
        () => [viewport.clientWidth, viewport.clientHeight],
        ([width, height]) => {
            surface.resize(width, height);  // 同步到渲染层
        },
        { immediate: true },
    );
}
```

**数据流图**：

```
┌─────────────────────────────────────────────────────┐
│                    用户交互层                         │
│  (handleWheel, handleZoom, handleScroll, ...)       │
└────────────────────────┬────────────────────────────┘
                         │ 调用
                         ▼
┌─────────────────────────────────────────────────────┐
│           Framework Viewport（业务层）               │
│  - editor.viewport.setZoom()                        │
│  - editor.viewport.setPosition()                    │
│  - 应用边界限制、位置调整                             │
└────────────────────────┬────────────────────────────┘
                         │ Vue watch 同步
                         ▼
┌─────────────────────────────────────────────────────┐
│           Renderer Viewport（渲染层）                │
│  - surface.setZoom()                                │
│  - surface.setPosition()                            │
│  - 更新 PageVm 状态                                  │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│             PixiJS Renderer（WebGL）                 │
│  - 应用变换矩阵                                      │
│  - 渲染到 Canvas                                    │
└─────────────────────────────────────────────────────┘
```

---

## 4.8 本章小结

本章深入探讨了无限画布的视口管理系统，以下是关键要点：

### 核心概念

1. **视口三要素**：`position (x, y)` + `zoom` 完整描述视口状态
2. **坐标关系**：屏幕坐标 = 世界坐标 × zoom + position
3. **边界限制**：通过 `ViewportLimit` 约束视口的可移动范围和缩放范围

### 缩放系统

1. **以任意点为中心缩放**的数学推导：
   - 核心约束：缩放前后，缩放中心对应的世界坐标不变
   - 矩阵表达：`T(c) → S(1/z₁) → S(z₂) → T(-c)`

2. **滚轮缩放**：
   - 使用 `deltaY` 计算缩放因子
   - 以鼠标位置为缩放中心
   - 实时响应，无动画

### 平移系统

1. **基础平移**：直接修改 `position` 偏移量
2. **边界约束**：使用 `clamp` 限制在有效范围内
3. **自动调整**：海报模式下自动居中
4. **自动滚动**：拖拽到边缘时自动平移视口

### 命令系统

| 命令 | 功能 | 是否改变缩放 |
|------|------|-------------|
| `zoomTo` | 缩放到指定比例 | ✓ |
| `zoomToFit` | 适配所有元素 | ✓ |
| `zoomToElement` | 聚焦到元素 | ✓ |
| `scrollToElement` | 滚动到元素 | 视情况 |

### 动画系统

1. **三次贝塞尔曲线**：定义动画的时间-进度映射关系
2. **求解方法**：牛顿迭代法（快）+ 二分法（稳）
3. **帧管理**：基于 `requestAnimationFrame` 的逐帧更新

### 持久化

1. **LRU 缓存**：保留最近使用的 100 个视口状态
2. **存储结构**：`{key: "templateId:pageUUID", data: {x, y, zoom}, time}`
3. **性能优化**：滚动时临时切换到低质量 Mipmap 策略

### 架构设计

1. **双层 Viewport**：业务层（限制、padding）+ 渲染层（变换、渲染）
2. **响应式同步**：通过 Vue watch 保持两层数据一致

---

## 📖 延伸阅读

- [MDN: CSS cubic-bezier](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)
- [Cubic Bezier Visualizer](https://cubic-bezier.com/)
- [LRU Cache Algorithm](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU))

---

## 📝 练习题

1. **推导题**：证明以 `(cx, cy)` 为中心从缩放 `z₁` 变到 `z₂` 的变换矩阵为：
   $$\mathbf{M} = \begin{bmatrix} z_2/z_1 & 0 & c_x(1 - z_2/z_1) \\ 0 & z_2/z_1 & c_y(1 - z_2/z_1) \\ 0 & 0 & 1 \end{bmatrix}$$

2. **实现题**：实现一个支持惯性滚动的平移系统，要求：
   - 根据手势速度计算初始速度
   - 使用衰减函数模拟摩擦力
   - 到达边界时有回弹效果

3. **分析题**：分析 `zoomToBounds` 的比例计算公式 `λ = (a - q) / (a + p)`，解释其几何含义。

---

> 下一章：[第5章 VmEngine 视图模型引擎](./06-VmEngine视图模型引擎.md) - 了解数据如何驱动渲染

---

> 📅 文档更新时间：2026-01-28
> 
> 👤 维护者：前端团队
