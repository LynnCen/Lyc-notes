# 无限画布渲染引擎架构深度分析

> 基于 PixiJS 的新版渲染引擎：分层架构设计、纹理概念抽象、核心技术细节

## 目录

1. [架构概览](#1-架构概览)
2. [分层架构设计](#2-分层架构设计)
3. [VM 层核心设计](#3-vm-层核心设计)
4. [Sprite 体系与纹理管理](#4-sprite-体系与纹理管理)
5. [状态管理与渲染流程](#5-状态管理与渲染流程)
6. [性能优化策略](#6-性能优化策略)
7. [完整渲染流程示例](#7-完整渲染流程示例)

---

## 1. 架构概览

### 1.1 三层架构

无限画布渲染引擎采用了清晰的三层架构设计：

```
┌─────────────────────────────────────────────┐
│          Bridge Layer (桥接层)               │
│   监听 Model 变化 → 同步到 VM → 触发渲染      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│          VM Layer (视图模型层)                │
│   BaseVm → BaseElementVm → ImageVm/TextVm   │
│   状态管理 + 生命周期 + 渲染控制               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│          Engine Layer (渲染引擎层)            │
│              PixiJS WebGL                   │
│   Sprite/Container/Graphics/Texture         │
└─────────────────────────────────────────────┘
```

### 1.2 设计目标

1. **解耦数据与渲染**：Model 层不直接参与渲染，通过 VM 层隔离
2. **高性能渲染**：利用 WebGL 硬件加速，支持大量元素
3. **视口优化**：仅渲染可见区域，离屏元素自动卸载纹理
4. **纹理复用**：智能缓存和复用纹理资源
5. **动态精度**：根据缩放比例动态调整渲染精度

---

## 2. 分层架构设计

### 2.1 Engine Layer（引擎层）

**核心**: PixiJS

PixiJS 是一个快速、轻量级的 2D 渲染引擎，底层基于 WebGL。

#### 2.1.1 核心概念

**DisplayObject 显示对象**

所有可见元素的基类：

```typescript
class DisplayObject {
    x: number;              // X 坐标
    y: number;              // Y 坐标
    width: number;          // 宽度
    height: number;         // 高度
    rotation: number;       // 旋转角度
    scale: Point;           // 缩放
    visible: boolean;       // 是否可见
    alpha: number;          // 透明度
    transform: Transform;   // 变换矩阵
    parent: Container;      // 父容器
}
```

**Container 容器**

可以包含子元素的容器对象：

```typescript
class Container extends DisplayObject {
    children: DisplayObject[];

    addChild(...children: DisplayObject[]): void;
    removeChild(...children: DisplayObject[]): void;
    addChildAt(child: DisplayObject, index: number): void;
}
```

**Sprite 精灵**

用于显示纹理的基础显示对象：

```typescript
class Sprite extends Container {
    texture: Texture;       // 纹理
    anchor: Point;          // 锚点
    tint: number;           // 着色
    blendMode: BLEND_MODES; // 混合模式
}
```

**Texture & BaseTexture**

纹理是渲染的基础单元：

```typescript
// BaseTexture：GPU 上的实际纹理资源
class BaseTexture {
    resource: Resource;     // 资源（Image/Canvas/Video）
    width: number;          // 纹理宽度
    height: number;         // 纹理高度
    scaleMode: SCALE_MODES; // 缩放模式（LINEAR/NEAREST）
    mipmap: MIPMAP_MODES;   // Mipmap 模式
}

// Texture：BaseTexture 的视图
class Texture {
    baseTexture: BaseTexture;  // 基础纹理
    frame: Rectangle;          // 纹理区域（用于精灵图）
    orig: Rectangle;           // 原始尺寸
    trim: Rectangle | null;    // 裁剪区域
}
```

**Graphics 图形**

用于绘制矢量图形：

```typescript
class Graphics extends Container {
    beginFill(color: number, alpha?: number): void;
    drawRect(x: number, y: number, width: number, height: number): void;
    drawCircle(x: number, y: number, radius: number): void;
    endFill(): void;
}
```

#### 2.1.2 渲染器

```typescript
interface IRenderer {
    type: RENDERER_TYPE;           // Canvas/WebGL/Skia
    view: HTMLCanvasElement;       // 画布元素
    resolution: number;            // 渲染精度
    activeResolution: number;      // 当前激活精度
    zoom: number;                  // 缩放比例

    render(displayObject: DisplayObject): void;
}
```

---

### 2.2 VM Layer（视图模型层）

VM 层是编辑器数据模型与渲染引擎之间的桥梁。

#### 2.2.1 BaseVm - 基础视图模型

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/vms/base/base-vm.ts`

```typescript
abstract class BaseVm<T extends object = object> {
    /** 渲染引擎的显示对象 */
    abstract view: Container | DisplayObject;

    /** 全局上下文 */
    context: IContext | null = null;

    /** 内部状态 */
    protected _state: T;

    /** 生命周期：是否应该更新 */
    shouldUpdate?(nextState: T): boolean;

    /** 生命周期：更新前 */
    beforeUpdate?(nextState: T, local: boolean): void;

    /** 生命周期：渲染方法 */
    abstract render?(): void;

    /** 生命周期：更新后 */
    afterUpdate?(prevState: T, local: boolean): void;

    /** 设置状态并触发渲染 */
    setState(nextState: Partial<T>): void {
        const prevState = this._state;
        this._state = { ...prevState, ...nextState };

        // 判断是否需要更新
        if (this.shouldUpdate && !this.shouldUpdate(this._state)) {
            return;
        }

        // 更新前钩子
        this.beforeUpdate?.(this._state, false);

        // 执行渲染
        this.render?.();

        // 更新后钩子
        this.afterUpdate?.(prevState, false);
    }

    /** 销毁 */
    destroy(): void {
        this.view.destroy();
    }
}
```

#### 2.2.2 BaseContainerVm - 容器视图模型

支持子元素的容器模型：

```typescript
abstract class BaseContainerVm<
    T extends object = object,
    C = IBaseElementVm
> extends BaseVm<T> {
    /** 子元素列表 */
    children: C[] = [];

    /** 添加子元素 */
    addChild(...children: C[]): void {
        this.children.push(...children);
        children.forEach(child => {
            this.addChildView(child.view);
        });
    }

    /** 移除子元素 */
    removeChild(...children: C[]): void {
        children.forEach(child => {
            const index = this.children.indexOf(child);
            if (index !== -1) {
                this.children.splice(index, 1);
                this.removeChildView(child.view);
            }
        });
    }

    protected abstract addChildView(child: DisplayObject): void;
    protected abstract removeChildView(child: DisplayObject): void;
}
```

#### 2.2.3 BaseElementVm - 元素视图模型

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/vms/base/base-element-vm.ts`

```typescript
abstract class BaseElementVm<
    P extends BaseElementModel = BaseElementModel,
    T extends object = object
> extends BaseContainerVm<T, IBaseElementVm> {
    /** PixiJS 容器 */
    view: Container = new Container();

    /** 数据模型 */
    protected _model!: P;

    /** 三层结构 */
    protected contentLayer: Container;    // 内容层（自身渲染）
    protected childrenLayer: Container;   // 子元素层
    protected watermarkLayer: WatermarkVm;// 水印层

    constructor() {
        super();
        this.contentLayer = new Container();
        this.contentLayer.name = 'contentLayer';

        this.childrenLayer = new Container();
        this.childrenLayer.name = 'childrenLayer';

        this.watermarkLayer = new WatermarkVm();
        this.watermarkLayer.view.name = 'watermarkLayer';

        // 添加到主视图
        this.view.addChild(
            this.contentLayer,
            this.childrenLayer,
            this.watermarkLayer.view
        );
    }

    /** 设置数据模型 */
    setModel(model: P): void {
        this._model = model;
    }

    /** 获取数据模型 */
    getModel(): P {
        return this._model;
    }

    /** 更新变换矩阵 */
    updateTransform(model: P = this._model): void {
        this.view.visible = !model.hidden && !model.$hidden;

        const { a, b, c, d, tx, ty } = model.transform.localTransform;
        const matrix = new Matrix(a, b, c, d, tx, ty);

        if (this.transform) {
            matrix.prepend(this.transform);
        }

        this.view.transform.setFromMatrix(matrix);
    }

    /** 数据模型生命周期 */
    modelCreated?(model: P, context: IContext): void;
    modelUpdated?(model: P, context: IContext): void;
    modelRemoved?(model: P, context: IContext): void;
}
```

#### 2.2.4 图片 VM 实现

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/vms/image/image-vm.ts`

```typescript
class ImageVm extends BaseElementVm<ImageModel, ImageState> {
    protected _state: ImageState = {
        width: 0,
        height: 0,
        naturalWidth: 0,
        naturalHeight: 0,
    };

    /** DynamicImage 处理动态精度渲染 */
    protected dynamicImage: DynamicImage | null = null;

    /** 蒙版渲染组件 */
    protected maskVm: MaskVm | CanvasMaskVm | null = null;

    /** AIGC 水印标识 */
    protected aiWatermark: Sprite | null = null;

    constructor() {
        super();
        this.view.name = 'image';
    }

    /** 数据模型初始化 */
    modelCreated(model: ImageModel, context: IContext): void {
        // 创建 DynamicImage（动态精度图片）
        if (!this.dynamicImage) {
            this.dynamicImage = new DynamicImage();
            this.contentLayer.addChild(this.dynamicImage);
        }

        // 加载纹理
        this.loadTexture(model);

        // 更新状态
        this.updateState(model);
    }

    /** 数据模型更新 */
    modelUpdated(model: ImageModel, context: IContext): void {
        // 检查 URL 变化
        if (model.url !== this._state.url) {
            this.loadTexture(model);
        }

        // 更新状态
        this.updateState(model);
    }

    /** 加载纹理 */
    private async loadTexture(model: ImageModel): Promise<void> {
        try {
            const texture = await settings.TEXTURE_MANAGER.buildTexture(
                model.url,
                {
                    naturalWidth: model.naturalWidth,
                    naturalHeight: model.naturalHeight,
                    resourceType: model.resourceType,
                }
            );

            if (this.dynamicImage) {
                this.dynamicImage.update({
                    element: model,
                    texture,
                });
            }

            this.complete();
        } catch (error) {
            this.catch(error);
        }
    }

    /** 更新内部状态 */
    private updateState(model: ImageModel): void {
        this.setState({
            uuid: model.uuid,
            url: model.url,
            width: model.width,
            height: model.height,
            naturalWidth: model.naturalWidth,
            naturalHeight: model.naturalHeight,
            imageTransform: model.imageTransform,
            filter: model.filter,
            hasFilters: model.hasFilters,
            // ... 其他属性
        });
    }

    /** 渲染方法 */
    render(): void {
        const { width, height, imageTransform } = this._state;

        if (this.dynamicImage) {
            this.dynamicImage.resize(width, height);

            // 应用图片变换
            if (imageTransform) {
                const { a, b, c, d, tx, ty } = imageTransform;
                this.dynamicImage.transform.setFromMatrix(
                    new Matrix(a, b, c, d, tx, ty)
                );
            }
        }

        // 更新蒙版
        this.updateMask();

        // 更新 AI 水印
        this.updateAiWatermark();
    }
}
```

#### 2.2.5 文字 VM 实现

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/vms/text/text-vm.ts`

```typescript
class TextVm extends BaseElementVm<TextElementModel, TextState> {
    protected _state: TextState = {
        width: 0,
        height: 0,
        position: { x: 0, y: 0 },
    };

    /** TextSprite 处理文字渲染 */
    private _textSprite: TextSprite;

    constructor() {
        super();
        this.view.name = 'text';
        this._textSprite = new TextSprite();
        this.contentLayer.addChild(this._textSprite);
    }

    /** 数据模型初始化 */
    modelCreated(model: TextElementModel, context: IContext): void {
        // 加载字体、排版
        this.loadTextLayout(model);

        // 更新状态
        this.updateState(model);
    }

    /** 加载文字排版 */
    private async loadTextLayout(model: TextElementModel): Promise<void> {
        try {
            // 使用 TypeTool 进行排版
            const typeTool = await getTypeToolIns();
            const layout = typeTool.shape(model);

            this.setState({
                element: model,
                layout,
                renderRect: layout.renderRect(model),
            });

            this.complete();
        } catch (error) {
            this.catch(error);
        }
    }

    /** 渲染方法 */
    render(): void {
        const { element, layout, position } = this._state;
        const text = this._textSprite;

        if (element && layout) {
            text.update({
                element,
                width: this._state.width,
                height: this._state.height,
                position,
                layout,
            });

            text.x = position.x;
            text.y = position.y;
        }
    }
}
```

---

### 2.3 Bridge Layer（桥接层）

桥接层负责监听 Model 变化，并同步到 VM 层。

#### 2.3.1 VmEngine - VM 引擎

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/vm-engine/vm-engine.ts`

```typescript
class VmEngine implements IVmEngine {
    /** Page VM 缓存 */
    private pageMap = new Map<string, IPageVm>();

    /** Element VM 缓存 */
    private elementMap = new Map<string, Pointer<IBaseElementVm>>();

    /** 全局上下文 */
    private context: IContext;

    /** 根据类型生成对应的 VM */
    private generateElement<T extends BaseElementModel>(
        model: T
    ): IBaseElementVm<T> {
        const type = model.type;

        switch (type) {
            case 'image':
                return new ImageVm() as any;
            case 'text':
                return new TextVm() as any;
            case 'group':
                return new GroupVm() as any;
            case 'path':
                return new PathVm() as any;
            // ... 其他类型
            default:
                return new FallbackVm() as any;
        }
    }

    /** 创建元素 VM */
    private createElement<T extends BaseElementModel>(
        model: T,
        children = false,
        context = this.context
    ): IBaseElementVm<T> {
        // 生成 VM 实例
        const element = this.generateElement(model);

        // 设置上下文
        element.context = context;

        // 设置数据模型
        element.setModel(model);

        // 递归创建子元素
        if (children && isParentElementModel(model)) {
            const elements = model.elements.map(item =>
                this.createElement(item, children, context)
            );
            element.addChild(...elements);
        }

        // 调用 modelCreated 生命周期
        if (typeof element.modelCreated === 'function') {
            element.modelCreated(model, context);
        }

        return element;
    }

    /** 构建元素树（带缓存） */
    private buildElement<T extends BaseElementModel>(
        model: T,
        ignoreChildren = false
    ): IBaseElementVm<T> {
        // 检查缓存
        if (model.uuid && this.elementMap.has(model.uuid)) {
            return this.getElement(model)!;
        }

        // 创建新 VM
        const element = this.createElement(model, false, this.context);

        // 递归创建子元素
        if (!ignoreChildren && isParentElementModel(model)) {
            const elements = model.elements.map(item =>
                this.buildElement(item, ignoreChildren)
            );
            element.addChild(...elements);
        }

        // 缓存 VM
        if (model.uuid) {
            this.elementMap.set(model.uuid, new Pointer(element));
        }

        return element;
    }

    /** 获取缓存的 VM */
    getElement<T extends BaseElementModel>(
        model: T
    ): IBaseElementVm<T> | undefined {
        const pointer = this.elementMap.get(model.uuid);
        return pointer?.value as IBaseElementVm<T> | undefined;
    }

    /** 移除 VM */
    removeElement<T extends BaseElementModel>(model: T): void {
        const element = this.getElement(model);
        if (!element) return;

        // 调用 modelRemoved 生命周期
        if (typeof element.modelRemoved === 'function') {
            element.modelRemoved(model);
        }

        // 销毁 VM
        element.destroy();

        // 删除缓存
        this.elementMap.delete(model.uuid);
    }

    /** 更新 VM */
    updateElement<T extends BaseElementModel>(model: T): void {
        const element = this.getElement(model);
        if (!element) return;

        // 调用 modelUpdated 生命周期
        if (typeof element.modelUpdated === 'function') {
            element.modelUpdated(model, this.context);
        }
    }
}
```

#### 2.3.2 数据同步机制

编辑器通过观察者模式监听 Model 变化：

```typescript
// 伪代码示例
class Editor {
    private vmEngine: VmEngine;

    /** 添加元素 */
    addElement(element: BaseElementModel): void {
        // 1. 添加到数据模型
        this.currentLayout.elements.push(element);

        // 2. 创建 VM
        const vm = this.vmEngine.buildElement(element);

        // 3. 添加到场景树
        const parentVm = this.vmEngine.getElement(this.currentLayout);
        parentVm?.addChild(vm);

        // 4. 触发渲染
        this.render();
    }

    /** 更新元素 */
    updateElement(element: BaseElementModel): void {
        // 1. 更新数据模型（已完成，响应式系统自动触发）

        // 2. 通知 VM 更新
        this.vmEngine.updateElement(element);

        // 3. 触发渲染
        this.render();
    }

    /** 删除元素 */
    removeElement(element: BaseElementModel): void {
        // 1. 从数据模型移除
        const index = this.currentLayout.elements.indexOf(element);
        if (index !== -1) {
            this.currentLayout.elements.splice(index, 1);
        }

        // 2. 移除 VM
        this.vmEngine.removeElement(element);

        // 3. 触发渲染
        this.render();
    }
}
```

---

## 3. VM 层核心设计

### 3.1 生命周期系统

VM 有两套生命周期：**数据模型生命周期** 和 **视图模型生命周期**。

#### 3.1.1 数据模型生命周期

```typescript
interface IBaseElementLifecycle<P extends BaseElementModel> {
    /** 模型创建 */
    modelCreated?(model: P, context: IContext): void;

    /** 模型更新 */
    modelUpdated?(model: P, context: IContext): void;

    /** 模型移除 */
    modelRemoved?(model: P, context: IContext): void;
}
```

**流程图**：

```
Model 创建
    ↓
VmEngine.buildElement()
    ↓
createElement()
    ↓
element.setModel(model)
    ↓
element.modelCreated(model, context)
    ↓
加载资源（纹理、字体等）
    ↓
updateState()
    ↓
render()
```

#### 3.1.2 视图模型生命周期

```typescript
interface IBaseVmLifecycle<T> {
    /** 是否需要更新 */
    shouldUpdate?(nextState: T): boolean;

    /** 更新前钩子 */
    beforeUpdate?(nextState: T, local: boolean): void;

    /** 渲染方法 */
    render?(prevState: T, nextState: T): void;

    /** 更新后钩子 */
    afterUpdate?(prevState: T, local: boolean): void;
}
```

**流程图**：

```
setState(nextState)
    ↓
shouldUpdate(nextState) ?
    ↓ YES
beforeUpdate(nextState, local)
    ↓
render(prevState, nextState)
    ↓
afterUpdate(prevState, local)
    ↓
PixiJS 标记脏区域
    ↓
下一帧渲染
```

### 3.2 状态管理

每个 VM 维护一个内部状态对象 `_state`，通过 `setState()` 更新状态并触发渲染。

```typescript
// ImageVm 的状态
interface ImageState {
    uuid?: string;
    url?: string;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    imageTransform?: Transform;
    filter?: Filter | null;
    hasFilters?: boolean;
    opacity?: number;
    // ...
}

// TextVm 的状态
interface TextState {
    element?: TextElementModel;
    layout?: TextLayout;
    renderRect?: Rectangle;
    width: number;
    height: number;
    position: { x: number; y: number };
    // ...
}
```

### 3.3 层次结构

每个 `BaseElementVm` 包含三个独立的图层：

```typescript
class BaseElementVm {
    view: Container;                    // 根容器

    protected contentLayer: Container;  // 内容层（自身渲染）
    protected childrenLayer: Container; // 子元素层
    protected watermarkLayer: WatermarkVm; // 水印层
}
```

**层次结构示意**：

```
view (Container)
  ├── contentLayer (Container)
  │     └── 自身内容（Sprite/DynamicImage/TextSprite）
  ├── childrenLayer (Container)
  │     ├── child1.view
  │     ├── child2.view
  │     └── child3.view
  └── watermarkLayer.view (Container)
        └── 水印内容
```

**优势**：
- **分离关注点**：内容、子元素、水印各自独立
- **灵活控制**：可以单独控制每层的可见性、透明度等
- **性能优化**：可以针对不同层做不同的优化策略

---

## 4. Sprite 体系与纹理管理

### 4.1 Sprite 继承体系

```
DisplayObject (PixiJS 基类)
    ↓
Container (PixiJS 容器)
    ↓
Sprite (PixiJS 精灵)
    ↓
CanvasSprite (视口管理 + 纹理生命周期)
    ↓
DynamicSprite (动态精度)
    ├── DynamicImage (图片动态渲染)
    ├── TextSprite (文字动态渲染)
    ├── ChartSprite (图表动态渲染)
    └── ThreeTextSprite (3D 文字动态渲染)
```

### 4.2 CanvasSprite - 视口管理与纹理生命周期

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/extends/canvas-sprite.ts`

#### 4.2.1 核心职责

1. **视口裁剪**：仅在可见区域渲染
2. **纹理生命周期管理**：离屏自动卸载纹理
3. **快照机制**：缩略图预览
4. **延迟更新**：防止频繁重绘

#### 4.2.2 实现原理

```typescript
abstract class CanvasSprite<T extends object = object> extends Sprite {
    /** 最大 Canvas 尺寸 */
    static MAX_CANVAS_SIZE = getMaxCanvasSize();

    /** 最大 Canvas 面积 */
    static MAX_CANVAS_AREA = isMobile() ? 2500 * 2500 : getMaxCanvasArea();

    /** 纹理缓存最大等待时间 */
    static MAX_AGE_TIME = isMobile() ? 5000 : 10000;

    /** 快照纹理（16x16 半透明占位符） */
    static get SNAPSHOT(): Texture {
        if (!CanvasSprite._SNAPSHOT) {
            const canvas = settings.ADAPTER.createCanvas(16, 16);
            const context = canvas.getContext('2d')!;

            canvas.width = 16;
            canvas.height = 16;
            context.fillStyle = '#0000000A';
            context.fillRect(0, 0, 16, 16);

            const snapshot = new Texture(BaseTexture.from(canvas));
            CanvasSprite._SNAPSHOT = snapshot;
        }

        return CanvasSprite._SNAPSHOT;
    }

    /** 内容纹理（高清渲染结果） */
    protected content: Texture | null = null;

    /** 快照纹理（缩略图） */
    protected snapshot: Texture | null = null;

    /** 上次被访问的时间 */
    touched: number = 0;

    /** 状态数据 */
    protected _state?: T;

    /** 抽象方法：更新纹理内容 */
    abstract updateContent(renderer: IRenderer): void;

    /** 生成快照纹理 */
    generateSnapshot(_renderer: IRenderer): Texture {
        return CanvasSprite.EMPTY;
    }

    /** 是否使用快照渲染 */
    useSnapshot(_renderer: IRenderer, _bounds: Rectangle): boolean {
        return !this.state;
    }

    /** 更新状态 */
    update(state: T): void {
        this._state = state;
        this.destroySnapshot();
        this.prepare();
    }

    /** 标记为需要更新 */
    dirty(): void {
        this._dirty = true;
        this._prepared = false;
    }

    /** 准备更新（延迟） */
    prepare(): void {
        if (!this._prepared) {
            this._prepared = true;
            CanvasSprite.requestUpdate(this);
        }
    }

    /** 渲染逻辑 */
    protected _render(renderer: IRenderer): void {
        const bounds = this.getBounds();

        // 视口裁剪：判断是否在可见区域
        if (!renderer.frame.intersects(bounds)) {
            CanvasSprite.touch(this);
            return;
        }

        // 标记访问时间
        CanvasSprite.touch(this);

        // 使用快照渲染（远离视口时）
        if (this.useSnapshot(renderer, bounds)) {
            if (!this.snapshot) {
                this.snapshot = this.generateSnapshot(renderer);
            }
            this.texture = this.snapshot;
            super._render(renderer);
            return;
        }

        // 需要更新内容纹理
        if (this._dirty) {
            this._dirty = false;
            this.disposeContent();
            this.updateContent(renderer);
        }

        // 使用内容纹理渲染
        if (this.content) {
            this.texture = this.content;
        }

        super._render(renderer);
    }

    /** 释放内容纹理（保留快照） */
    protected disposeContent(): void {
        if (this.content) {
            this.content.destroy(true);
            this.content = null;
        }
    }

    /** 销毁快照纹理 */
    protected destroySnapshot(): void {
        if (this.snapshot && this.snapshot !== CanvasSprite.SNAPSHOT) {
            this.snapshot.destroy(true);
            this.snapshot = null;
        }
    }

    /** 完全销毁 */
    destroy(options?: boolean | IDestroyOptions): void {
        this.destroyContent();
        this.destroySnapshot();
        super.destroy(options);
    }

    /** 全局纹理回收机制 */
    static dispose(t: number): void {
        for (const sprite of CanvasSprite._touchList) {
            // 超过最大等待时间，释放纹理
            if (t - sprite.touched > CanvasSprite.MAX_AGE_TIME) {
                sprite.disposeContent();
                sprite.prepare();
            }
        }
    }
}
```

#### 4.2.3 视口裁剪流程

```
渲染帧开始
    ↓
_render(renderer) 被调用
    ↓
getBounds() 获取元素包围盒
    ↓
renderer.frame.intersects(bounds) ?
    ↓ NO（不在视口）
touch() 标记访问时间
return（不渲染）
    ↓ YES（在视口内）
touch() 标记访问时间
    ↓
useSnapshot() 判断是否使用快照 ?
    ↓ YES（远离视口中心）
texture = snapshot
super._render(renderer)
    ↓ NO（靠近视口中心）
_dirty ?
    ↓ YES
updateContent(renderer) 更新内容纹理
    ↓ NO
texture = content
super._render(renderer)
```

### 4.3 DynamicSprite - 动态精度渲染

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/extends/dynamic-sprite.ts`

#### 4.3.1 核心职责

根据画布缩放比例动态调整纹理精度，在清晰度和性能之间取得平衡。

#### 4.3.2 实现原理

```typescript
abstract class DynamicSprite<T extends object = object> extends CanvasSprite<T> {
    /** 当前渲染精度 */
    protected resolution = -1;

    /** 抽象方法：更新纹理 */
    abstract updateTexture(renderer: IRenderer, zoom: number): void;

    /** 计算纹理渲染比例 */
    getTextureRatio(
        renderer: IRenderer,
        width: number,
        height: number,
        resolution = renderer.activeResolution,
        maxSize = DynamicSprite.MAX_CANVAS_SIZE,
        maxArea = DynamicSprite.MAX_CANVAS_AREA
    ): number {
        // WebGL 最大纹理尺寸限制
        if (renderer.type === RENDERER_TYPE.SKIA && renderer.gl) {
            const gl = renderer.gl;
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            maxSize = Math.min(maxSize, maxTextureSize);
            maxArea = Math.min(maxArea, 4096 * 4096);
        }

        width *= resolution;
        height *= resolution;

        // 计算最大精度（不超过 Canvas/WebGL 限制）
        return calcMaxResolution(width, height, maxSize, maxArea) * resolution;
    }

    /** 更新内容（CanvasSprite 回调） */
    updateContent(renderer: IRenderer): void {
        const { zoom = 1 } = renderer;

        try {
            this.updateTexture(renderer, zoom);
        } catch (error) {
            console.error(error);
            this.emitter.emit('error', error);
        }
    }

    /** 渲染逻辑 */
    protected _render(renderer: IRenderer): void {
        const { zoom = 1 } = renderer;
        const resolution = renderer.activeResolution * zoom;

        // 精度发生变化，触发更新
        if (!isSame(this.resolution, resolution)) {
            this.resolution = resolution;

            // 延迟更新或立即标记脏区域
            if (renderer.lazyUpdateCanvasSprite) {
                this.prepare();
            } else {
                this.dirty();
            }
        }

        super._render(renderer);
    }
}
```

#### 4.3.3 精度计算示例

```typescript
// 假设参数
const width = 800;       // 元素宽度
const height = 600;      // 元素高度
const zoom = 2;          // 画布缩放 200%
const resolution = 2;    // 设备像素比（Retina）
const maxSize = 4096;    // Canvas 最大边长
const maxArea = 16777216; // Canvas 最大面积

// 计算实际需要的纹理尺寸
const textureWidth = width * zoom * resolution;  // 800 * 2 * 2 = 3200
const textureHeight = height * zoom * resolution; // 600 * 2 * 2 = 2400

// 检查是否超过限制
if (textureWidth > maxSize || textureHeight > maxSize) {
    // 缩放比例 = maxSize / max(textureWidth, textureHeight)
    ratio = maxSize / Math.max(textureWidth, textureHeight);
}

if (textureWidth * textureHeight > maxArea) {
    // 缩放比例 = sqrt(maxArea / (textureWidth * textureHeight))
    ratio = Math.sqrt(maxArea / (textureWidth * textureHeight));
}

// 最终纹理尺寸
finalWidth = textureWidth * ratio;
finalHeight = textureHeight * ratio;
```

### 4.4 纹理管理系统

#### 4.4.1 TextureManager - 纹理管理器

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/settings/adaptor/texture-manager.ts`

```typescript
class TextureManager implements ITextureManager {
    /** 纹理等待队列（防止重复加载） */
    private waitingMap = new Map<string, TextureResolver[]>();

    /** 资源适配器 */
    private resourceAdaptor: IResourceAdaptor;

    /** 获取缓存的 BaseTexture */
    getBaseTextureCache(src: string): BaseTexture | undefined {
        return BaseTexture.removeFromCache(src);
    }

    /** 删除 BaseTexture 缓存 */
    removeBaseTextureCache(src: string): BaseTexture | undefined {
        const baseTexture = BaseTexture.removeFromCache(src);
        baseTexture?.destroy();
        return baseTexture;
    }

    /** 使用 BaseTexture（带队列管理） */
    async useBaseTexture(
        src: string,
        options?: IFetchImageOptions,
        baseTextureOptions?: IBaseTextureOptions
    ): Promise<BaseTexture> {
        // 检查缓存
        const baseTexture = this.getBaseTextureCache(src);
        if (baseTexture) {
            return baseTexture;
        }

        // 检查是否正在加载
        let waiting = this.waitingMap.get(src);

        // 首次加载，初始化队列
        if (!waiting) {
            waiting = [];
            this.waitingMap.set(src, waiting);

            debug('load resource: %s', src);

            // 异步加载
            this.buildBaseTexture(src, options, baseTextureOptions)
                .then((baseTexture) => {
                    // 添加到缓存
                    BaseTexture.addToCache(baseTexture, src);

                    // 通知所有等待者
                    waiting!.forEach(resolver => resolver.resolve(baseTexture));
                })
                .catch((error) => {
                    // 通知所有等待者失败
                    waiting!.forEach(resolver => resolver.reject(error));
                })
                .finally(() => {
                    // 清理队列
                    this.waitingMap.delete(src);
                });
        }

        // 加入等待队列
        return new Promise((resolve, reject) => {
            waiting!.push({ src, resolve, reject });
        });
    }

    /** 构建 BaseTexture */
    private async buildBaseTexture(
        src: string,
        options?: IFetchImageOptions,
        baseTextureOptions?: IBaseTextureOptions
    ): Promise<BaseTexture> {
        // SVG 特殊处理
        if (src.endsWith('.svg') || src.includes('data:image/svg')) {
            return this.buildSvgBaseTexture(src, options, baseTextureOptions);
        }

        // 加载图片
        const image = await this.resourceAdaptor.fetchImage(src, options);

        // 创建 BaseTexture
        const baseTexture = BaseTexture.from(image, {
            scaleMode: this.options.scaleMode,
            mipmap: this.options.mipmap,
            ...baseTextureOptions,
        });

        return baseTexture;
    }

    /** 构建 Texture */
    async buildTexture(
        src: string,
        options?: IFetchImageOptions,
        baseTextureOptions?: IBaseTextureOptions
    ): Promise<Texture> {
        const baseTexture = await this.useBaseTexture(src, options, baseTextureOptions);
        return new Texture(baseTexture);
    }
}
```

#### 4.4.2 纹理概念抽象

**BaseTexture（基础纹理）**

- GPU 上的实际纹理资源
- 对应一个图片、Canvas 或 Video
- 多个 Texture 可以共享同一个 BaseTexture
- 占用 GPU 显存

**Texture（纹理视图）**

- BaseTexture 的引用 + 裁剪区域
- 用于精灵图（Sprite Sheet）场景
- 不额外占用显存

**示例**：

```typescript
// 加载一张图片（创建 BaseTexture）
const baseTexture = await TextureManager.useBaseTexture('avatar.jpg');

// 创建多个 Texture（共享 BaseTexture）
const texture1 = new Texture(baseTexture, new Rectangle(0, 0, 100, 100));
const texture2 = new Texture(baseTexture, new Rectangle(100, 0, 100, 100));

// 使用 Texture
const sprite1 = new Sprite(texture1);
const sprite2 = new Sprite(texture2);
```

#### 4.4.3 纹理复用机制

**TextureReuse**

**文件位置**: `domains/editor/packages/editor/infinite-renderer/src/context/texture-reuse.ts`

```typescript
class TextureReuse {
    private cache: Map<string, RenderTexture> = new Map();

    /** 缓存 RenderTexture */
    set(uuid: string, texture: RenderTexture): void {
        this.cache.set(uuid, texture);
    }

    /** 获取缓存的 RenderTexture */
    get(uuid: string): RenderTexture | undefined {
        return this.cache.get(uuid);
    }

    /** 删除缓存 */
    delete(uuid: string): void {
        const texture = this.cache.get(uuid);
        if (texture) {
            texture.destroy(true);
            this.cache.delete(uuid);
        }
    }

    /** 清空缓存 */
    clear(): void {
        this.cache.forEach(texture => texture.destroy(true));
        this.cache.clear();
    }
}
```

**RenderTexture** 是渲染到纹理（Render to Texture）的结果，常用于：
- 元素组合后的缓存
- 特效处理的中间结果
- 导出图片

---

## 5. 状态管理与渲染流程

### 5.1 状态更新流程

```
用户操作（拖拽、缩放等）
    ↓
Model 属性变化（响应式系统）
    ↓
Model 观察者触发
    ↓
vmEngine.updateElement(model)
    ↓
element.modelUpdated(model, context)
    ↓
element.updateState(model)
    ↓
element.setState(newState)
    ↓
shouldUpdate(newState) ?
    ↓ YES
beforeUpdate(newState, local)
    ↓
render(prevState, newState)
    ↓
更新 Sprite 属性（position, size, texture, etc.）
    ↓
afterUpdate(prevState, local)
    ↓
PixiJS 标记脏区域
    ↓
requestAnimationFrame
    ↓
renderer.render(stage)
    ↓
WebGL 绘制到 Canvas
```

### 5.2 渲染管线

PixiJS 使用脏区域标记 + RAF 渲染：

```typescript
class Renderer {
    /** 渲染主循环 */
    private renderLoop(): void {
        requestAnimationFrame(() => {
            this.renderLoop();
        });

        // 渲染场景
        this.render(this.stage);
    }

    /** 渲染场景树 */
    render(displayObject: DisplayObject): void {
        // 1. 更新变换矩阵（自上而下）
        displayObject.updateTransform();

        // 2. 排序渲染对象（z-index）
        displayObject.sortChildren();

        // 3. WebGL 渲染
        this.batch.flush();

        for (const child of displayObject.children) {
            if (!child.visible) continue;

            // 视口裁剪
            if (!this.frame.intersects(child.getBounds())) {
                continue;
            }

            // 递归渲染
            child._render(this);
        }

        this.batch.flush();
    }
}
```

### 5.3 批量渲染优化

PixiJS 使用批量渲染（Batching）减少 Draw Call：

```typescript
class BatchRenderer {
    private vertexBuffer: Float32Array;
    private indexBuffer: Uint16Array;
    private vertexCount = 0;

    /** 添加精灵到批次 */
    addSprite(sprite: Sprite): void {
        const texture = sprite.texture;
        const { a, b, c, d, tx, ty } = sprite.worldTransform;

        // 顶点数据（位置 + UV + 颜色）
        const vertices = [
            tx, ty, 0, 0, sprite.tint,
            tx + a * sprite.width, ty + b * sprite.width, 1, 0, sprite.tint,
            tx + c * sprite.height, ty + d * sprite.height, 0, 1, sprite.tint,
            // ...
        ];

        // 添加到缓冲区
        this.vertexBuffer.set(vertices, this.vertexCount);
        this.vertexCount += vertices.length;

        // 批次已满或纹理切换，提交渲染
        if (this.vertexCount >= MAX_BATCH_SIZE || texture !== this.currentTexture) {
            this.flush();
        }
    }

    /** 提交批次渲染 */
    flush(): void {
        if (this.vertexCount === 0) return;

        // 上传到 GPU
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexBuffer);

        // 绘制
        gl.drawElements(gl.TRIANGLES, this.vertexCount / 5 * 6, gl.UNSIGNED_SHORT, 0);

        // 重置计数器
        this.vertexCount = 0;
    }
}
```

---

## 6. 性能优化策略

### 6.1 视口裁剪（Viewport Culling）

只渲染视口内的元素：

```typescript
protected _render(renderer: IRenderer): void {
    const bounds = this.getBounds();

    // 视口裁剪
    if (!renderer.frame.intersects(bounds)) {
        return; // 不渲染
    }

    super._render(renderer);
}
```

**收益**: 大幅减少 Draw Call，支持数万个元素。

### 6.2 纹理生命周期管理

离屏元素自动卸载纹理：

```typescript
static dispose(t: number): void {
    for (const sprite of CanvasSprite._touchList) {
        // 超过 10 秒未访问，释放纹理
        if (t - sprite.touched > CanvasSprite.MAX_AGE_TIME) {
            sprite.disposeContent();
            sprite.prepare();
        }
    }
}
```

**收益**: 减少内存占用，避免 OOM。

### 6.3 快照机制（Snapshot）

远离视口的元素使用低精度快照：

```typescript
if (this.useSnapshot(renderer, bounds)) {
    if (!this.snapshot) {
        this.snapshot = this.generateSnapshot(renderer);
    }
    this.texture = this.snapshot; // 16x16 缩略图
    super._render(renderer);
    return;
}
```

**收益**: 减少高精度纹理的创建和渲染开销。

### 6.4 动态精度（Dynamic Resolution）

根据缩放比例动态调整纹理精度：

```typescript
const resolution = renderer.activeResolution * zoom;

if (!isSame(this.resolution, resolution)) {
    this.resolution = resolution;
    this.dirty(); // 触发重新渲染
}
```

**收益**: 在清晰度和性能之间取得平衡。

### 6.5 纹理缓存（Texture Cache）

避免重复加载相同资源：

```typescript
async useBaseTexture(src: string): Promise<BaseTexture> {
    // 检查缓存
    const cached = this.getBaseTextureCache(src);
    if (cached) {
        return cached;
    }

    // 加载并缓存
    const baseTexture = await this.buildBaseTexture(src);
    BaseTexture.addToCache(baseTexture, src);

    return baseTexture;
}
```

**收益**: 减少网络请求和解码开销。

### 6.6 批量渲染（Batching）

PixiJS 自动合并相同纹理的 Sprite：

- 一次 Draw Call 渲染多个 Sprite
- 减少 CPU-GPU 通信开销

### 6.7 对象池（Object Pool）

复用频繁创建销毁的对象（Matrix、Point、Rectangle 等）：

```typescript
const tempMatrix = new Matrix();
const tempPoint = new Point();

function calculateTransform(element: BaseElementModel): Matrix {
    // 复用临时对象
    tempMatrix.set(a, b, c, d, tx, ty);
    return tempMatrix.clone();
}
```

### 6.8 延迟更新（Lazy Update）

防止频繁重绘：

```typescript
@Debounce(1000 / 10) // 100ms 防抖
private static prepareUpdate(): void {
    this._updateQueue.forEach(item => item.dirty());
    this._updateQueue.clear();
}
```

---

## 7. 完整渲染流程示例

### 7.1 图片元素从 Model 到渲染

```
1. 数据层
   ─────────────────────────────────
   用户拖拽图片到画布
        ↓
   editor.addElement({
       type: 'image',
       url: 'https://example.com/image.jpg',
       left: 100,
       top: 100,
       width: 400,
       height: 300,
   })
        ↓
   ImageBaseElementModel 创建

2. 桥接层
   ─────────────────────────────────
   vmEngine.buildElement(imageModel)
        ↓
   createElement(imageModel)
        ↓
   new ImageVm()
        ↓
   element.setModel(imageModel)
        ↓
   element.modelCreated(imageModel, context)

3. VM 层
   ─────────────────────────────────
   ImageVm.modelCreated()
        ↓
   loadTexture(model)
        ↓
   settings.TEXTURE_MANAGER.buildTexture(model.url)
        ↓
   TextureManager.useBaseTexture()
        ↓
   [检查缓存] → [加载图片] → [创建 BaseTexture]
        ↓
   BaseTexture.addToCache(baseTexture, url)
        ↓
   new Texture(baseTexture)
        ↓
   dynamicImage.update({ element: model, texture })
        ↓
   updateState(model)
        ↓
   setState({ url, width, height, ... })

4. 渲染层
   ─────────────────────────────────
   setState() 触发
        ↓
   shouldUpdate() → true
        ↓
   beforeUpdate()
        ↓
   render()
        ↓
   dynamicImage.resize(width, height)
   dynamicImage.transform.setFromMatrix(...)
        ↓
   afterUpdate()
        ↓
   PixiJS 标记脏区域

5. 引擎层
   ─────────────────────────────────
   requestAnimationFrame
        ↓
   renderer.render(stage)
        ↓
   stage.updateTransform()
        ↓
   遍历场景树
        ↓
   imageVm.view._render(renderer)
        ↓
   检查视口裁剪
        ↓
   dynamicImage._render(renderer)
        ↓
   检查精度变化
        ↓
   updateContent(renderer)
        ↓
   updateTexture(renderer, zoom)
        ↓
   [Canvas 渲染] or [直接使用纹理]
        ↓
   texture = content
        ↓
   WebGL 批量渲染
        ↓
   绘制到屏幕
```

### 7.2 文字元素从 Model 到渲染

```
1. 数据层
   ─────────────────────────────────
   editor.addElement({
       type: 'text',
       content: 'Hello World',
       fontFamily: 'Arial',
       fontSize: 48,
       left: 200,
       top: 200,
   })
        ↓
   TextBaseElementModel 创建

2. 桥接层
   ─────────────────────────────────
   vmEngine.buildElement(textModel)
        ↓
   new TextVm()
        ↓
   element.modelCreated(textModel, context)

3. VM 层
   ─────────────────────────────────
   TextVm.modelCreated()
        ↓
   loadTextLayout(model)
        ↓
   getTypeToolIns()
        ↓
   typeTool.shape(model)
        ↓
   [字体加载] → [文字排版] → [计算包围盒]
        ↓
   layout = typeTool.shape(model)
        ↓
   setState({
       element: model,
       layout,
       renderRect: layout.renderRect(model),
       width: model.width,
       height: model.height,
   })

4. 渲染层
   ─────────────────────────────────
   setState() 触发
        ↓
   render()
        ↓
   textSprite.update({
       element: model,
       layout,
       width, height,
   })
        ↓
   textSprite.x = position.x
   textSprite.y = position.y

5. 引擎层
   ─────────────────────────────────
   renderer.render(stage)
        ↓
   textSprite._render(renderer)
        ↓
   检查视口裁剪
        ↓
   检查精度变化 → 触发更新
        ↓
   updateContent(renderer)
        ↓
   updateTexture(renderer, zoom)
        ↓
   创建 Canvas
        ↓
   typeTool.drawBackground(element, ctx, layout)
   typeTool.draw(element, ctx, layout)
        ↓
   [Canvas → BaseTexture → Texture]
        ↓
   content = new Texture(BaseTexture.from(canvas))
        ↓
   texture = content
        ↓
   WebGL 批量渲染
        ↓
   绘制到屏幕
```

---

## 总结

### 核心设计思想

1. **分层解耦**: Engine/VM/Bridge 三层架构，职责清晰
2. **状态驱动**: 数据变化 → 状态更新 → 自动渲染
3. **资源管理**: 纹理缓存、复用、生命周期自动管理
4. **性能优先**: 视口裁剪、动态精度、批量渲染、对象池
5. **扩展性强**: 基于继承和接口，易于添加新元素类型

### 关键优化技术

| 技术 | 原理 | 收益 |
|------|------|------|
| 视口裁剪 | 只渲染可见元素 | 支持数万元素 |
| 纹理生命周期 | 离屏自动卸载 | 降低内存占用 |
| 快照机制 | 远离视口用缩略图 | 减少渲染开销 |
| 动态精度 | 根据缩放调整质量 | 平衡清晰度和性能 |
| 纹理缓存 | 避免重复加载 | 减少网络和解码 |
| 批量渲染 | 合并 Draw Call | 提升 GPU 利用率 |
| 对象池 | 复用临时对象 | 减少 GC 压力 |

### 与旧版渲染对比

| 特性 | 旧版（DOM + Canvas） | 新版（PixiJS WebGL） |
|------|---------------------|---------------------|
| 渲染引擎 | DOM + Canvas2D | WebGL |
| 元素数量 | 数百个 | 数万个 |
| 内存占用 | 高（DOM 树庞大） | 低（纹理按需加载） |
| 渲染性能 | CPU 绘制 | GPU 加速 |
| 滚动性能 | 需要重绘 | 视口裁剪 |
| 缩放性能 | 需要重排 | 矩阵变换 |
| 架构复杂度 | 较低 | 较高 |

---

**文档版本**: v1.0
**更新日期**: 2026-01-22
**作者**: AI Assistant
