# 第5章：VmEngine 视图模型引擎

> **核心问题**：数据模型如何转换为可渲染的视图对象？

在无限画布架构中，VmEngine（视图模型引擎）是连接数据层与渲染层的核心枢纽。它负责将业务数据模型（Model）映射为可渲染的视图模型（ViewModel），实现了数据驱动的渲染机制。理解 VmEngine，是掌握整个渲染系统的关键。

---

## 目录

- [第5章：VmEngine 视图模型引擎](#第5章vmengine-视图模型引擎)
  - [目录](#目录)
  - [5.1 引擎架构设计](#51-引擎架构设计)
    - [5.1.1 MVVM 架构在画布中的应用](#511-mvvm-架构在画布中的应用)
    - [5.1.2 VmEngine 核心职责](#512-vmengine-核心职责)
    - [5.1.3 数据结构设计](#513-数据结构设计)
  - [5.2 Pointer 引用机制](#52-pointer-引用机制)
    - [5.2.1 为什么需要 Pointer](#521-为什么需要-pointer)
    - [5.2.2 Pointer 的实现](#522-pointer-的实现)
    - [5.2.3 Pointer 的应用场景](#523-pointer-的应用场景)
  - [5.3 元素类型系统](#53-元素类型系统)
    - [5.3.1 类型到视图模型的映射](#531-类型到视图模型的映射)
    - [5.3.2 元素继承体系](#532-元素继承体系)
    - [5.3.3 Fallback 机制](#533-fallback-机制)
  - [5.4 视图模型管理](#54-视图模型管理)
    - [5.4.1 createVm - 创建视图模型](#541-createvm---创建视图模型)
    - [5.4.2 buildVm - 构建视图模型](#542-buildvm---构建视图模型)
    - [5.4.3 cloneVm - 克隆视图模型](#543-clonevm---克隆视图模型)
    - [5.4.4 removeVm - 移除视图模型](#544-removevm---移除视图模型)
    - [5.4.5 getVm - 查询视图模型](#545-getvm---查询视图模型)
  - [5.5 视图模型生命周期](#55-视图模型生命周期)
    - [5.5.1 数据模型生命周期](#551-数据模型生命周期)
    - [5.5.2 视图模型生命周期](#552-视图模型生命周期)
    - [5.5.3 生命周期执行顺序](#553-生命周期执行顺序)
  - [5.6 增量更新机制](#56-增量更新机制)
    - [5.6.1 Action 类型定义](#561-action-类型定义)
    - [5.6.2 Processor 处理器模式](#562-processor-处理器模式)
    - [5.6.3 BoardProcessor 实现](#563-boardprocessor-实现)
    - [5.6.4 批量更新优化](#564-批量更新优化)
  - [5.7 BaseElementVm 详解](#57-baseelementvm-详解)
    - [5.7.1 类继承体系](#571-类继承体系)
    - [5.7.2 图层结构](#572-图层结构)
    - [5.7.3 核心方法](#573-核心方法)
  - [5.8 本章小结](#58-本章小结)
    - [核心概念回顾](#核心概念回顾)
    - [API 速查表](#api-速查表)
    - [生命周期总结](#生命周期总结)
    - [Action 类型总结](#action-类型总结)
    - [架构设计要点](#架构设计要点)
  - [📖 延伸阅读](#-延伸阅读)
  - [📝 练习题](#-练习题)

---

## 5.1 引擎架构设计

### 5.1.1 MVVM 架构在画布中的应用

无限画布采用类 MVVM（Model-View-ViewModel）架构：

```
┌─────────────────────────────────────────────────────────────┐
│                        数据层（Model）                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ PageModel│  │ImageModel│  │TextModel │  │GroupModel│ ...   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        │   ┌────────┴────────────┴────────────┴────────┐
        │   │              VmEngine                      │
        │   │  ┌────────────────────────────────────┐   │
        │   │  │    elementMap: Map<uuid, Pointer>  │   │
        │   │  │    pageMap: Map<uuid, PageVm>      │   │
        │   │  └────────────────────────────────────┘   │
        │   └────────────────────────────────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌───────┴────────────┴────────────┴────────────┴──────────────┐
│                   视图模型层（ViewModel）                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  PageVm │  │ ImageVm │  │  TextVm │  │ GroupVm │  ...   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      视图层（View）                           │
│              PixiJS Container / Sprite / Graphics            │
└─────────────────────────────────────────────────────────────┘
```

**三层职责**：

| 层级 | 类型 | 职责 |
|------|------|------|
| Model | `BaseElementModel` | 存储业务数据，如位置、尺寸、资源 URL 等 |
| ViewModel | `BaseElementVm` | 管理渲染状态，处理 Model 变化，控制渲染对象 |
| View | PixiJS `Container` | 实际的渲染对象，由 WebGL 绘制到画布 |

### 5.1.2 VmEngine 核心职责

VmEngine 作为 Model 和 ViewModel 之间的桥梁，承担以下职责：

1. **映射管理**：维护 Model UUID 到 ViewModel 的映射关系
2. **工厂创建**：根据 Model 类型创建对应的 ViewModel
3. **生命周期**：管理 ViewModel 的创建、更新、销毁
4. **缓存复用**：通过缓存避免重复创建 ViewModel

**代码位置**：`infinite-renderer/src/vm-engine/vm-engine.ts`

```typescript
class VmEngine implements IVmEngine {
    // 页面视图模型映射表
    private pageMap = new Map<string, IPageVm>();
    
    // 元素视图模型映射表（使用 Pointer 包装）
    private elementMap = new Map<string, Pointer<IBaseElementVm>>();
    
    // 全局上下文
    private context: IContext;

    constructor(options: VmEngineOptions) {
        const { context } = options;
        this.context = context;
    }
    
    // ... 方法实现
}
```

### 5.1.3 数据结构设计

VmEngine 使用两个 Map 分别管理页面和元素：

```typescript
// 页面映射：uuid → PageVm
private pageMap = new Map<string, IPageVm>();

// 元素映射：uuid → Pointer<IBaseElementVm>
private elementMap = new Map<string, Pointer<IBaseElementVm>>();
```

**为什么分开存储？**

1. **页面生命周期独立**：页面切换时只需替换 pageMap 中的引用
2. **元素可能跨页面**：某些场景下元素可能需要在页面间移动
3. **查询效率**：分开存储可以减少查询时的遍历范围

---

## 5.2 Pointer 引用机制

### 5.2.1 为什么需要 Pointer

在编辑器中，元素可能会经历"替换"操作——例如将一个图片元素替换为视频元素。此时：
- Model 的 UUID 保持不变
- ViewModel 需要被销毁并重新创建

如果直接存储 ViewModel 引用，替换后所有持有旧引用的地方都需要更新。使用 Pointer 可以解决这个问题：

```
场景：图片元素替换为视频元素

不使用 Pointer：
┌─────────────┐      ┌─────────────┐
│ elementMap  │─────►│  ImageVm    │ ← 旧引用
├─────────────┤      └─────────────┘
│ component A │─────►│  ImageVm    │ ← 需要更新
├─────────────┤      └─────────────┘
│ component B │─────►│  ImageVm    │ ← 需要更新
└─────────────┘      └─────────────┘

使用 Pointer：
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ elementMap  │─────►│   Pointer   │─────►│  VideoVm    │ 新对象
├─────────────┤      │  { value }  │      └─────────────┘
│ component A │─────►│             │
├─────────────┤      └─────────────┘
│ component B │─────►│   Pointer   │ ← 所有引用自动更新
└─────────────┘      └─────────────┘
```

### 5.2.2 Pointer 的实现

Pointer 的实现非常简洁，仅是一个值容器：

**代码位置**：`infinite-renderer/src/common/pointer.ts`

```typescript
class Pointer<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }
}

export { Pointer };
```

**核心思想**：
- Pointer 本身是稳定的引用
- `value` 属性可以被替换
- 所有通过 Pointer 访问的代码自动获取最新值

### 5.2.3 Pointer 的应用场景

**场景1：元素类型变更**

当用户上传视频替换图片时：

```typescript
// BoardProcessor.replaceElement
private replaceElement<T extends BaseElementModel>(
    pointer: Pointer<IBaseElementVm<T>>,
    newModel: T,
): void {
    const element = pointer.value;
    const oldModel = element.getModel();
    const children = element.removeChildren();

    // 记录在父容器中的位置
    let index = -1;
    const { parent } = element;
    if (parent) {
        index = parent.children.indexOf(element);
    }

    // 构建新元素
    const newElement = this.vmEngine.generateElement(newModel);
    newElement.context = element.context;
    newElement.setModel(newModel);
    newElement.addChild(...children);

    // 调用生命周期
    if (typeof newElement.modelCreated === 'function') {
        newElement.modelCreated(newModel, this.context);
    }

    // 销毁旧元素
    if (typeof element.modelRemoved === 'function') {
        element.modelRemoved(oldModel, this.context);
    }
    element.destroy(true);

    // 还原图层位置
    if (parent) {
        parent.addChildAt(newElement, index);
    }

    // 关键：更新 Pointer 的 value
    pointer.value = newElement;
}
```

**场景2：元素查询**

```typescript
// 获取 Pointer
const pointer = vmEngine.getVmPointer(model);

// 通过 Pointer 获取当前 ViewModel
const vm = pointer.value;

// 即使 vm 被替换，pointer 仍然有效
// 下次访问 pointer.value 会得到新的 ViewModel
```

---

## 5.3 元素类型系统

### 5.3.1 类型到视图模型的映射

VmEngine 通过 `generateElement` 方法将 Model 类型映射到对应的 ViewModel：

```typescript
generateElement<T extends BaseElementModel>(model: T): IBaseElementVm<T> {
    // 检测是否需要 fallback
    if (this.testFallback(model)) {
        return new FallbackVm() as unknown as IBaseElementVm<T>;
    }

    let element: IBaseElementVm;

    switch (model.type) {
        case 'mask':
        case 'image': {
            // 特殊处理：视频元素可能被标记为 mask 类型
            if ((model as MaskElementModel).resourceType === 'video') {
                element = new VideoVm();
            } else {
                element = new ImageVm();
            }
            break;
        }

        case 'video':
            element = new VideoVm();
            break;

        case 'layout':
            element = new LayoutVm();
            break;

        case 'text':
            element = new TextVm();
            break;

        case 'path':
            element = new PathVm();
            break;

        case 'flex':
        case 'group':
            element = new GroupVm();
            break;

        case 'svg':
            element = new SvgVm();
            break;

        case 'shape':
            element = new ShapeVm();
            break;

        case 'connector':
            element = new ConnectorVm();
            break;

        case 'ninePatch':
            element = new NinePatchVm();
            break;

        case 'threeText':
            element = new ThreeTextVm();
            break;

        case 'effectText':
            element = new EffectTextVm();
            break;

        case 'chart':
            element = new ChartVm();
            break;

        case 'table':
            element = new TableVm();
            break;

        case 'tableRow':
            element = new TableRowVm();
            break;

        case 'tableCell':
            element = new TableCellVm();
            break;

        case 'arrow':
            element = new ArrowVm();
            break;

        case 'stickyNote':
            element = new StickyNoteVm();
            break;

        case 'puzzle':
            element = new PuzzleVm();
            break;

        case '$watermarker':
        case 'watermark':
            element = new WatermarkVm();
            break;

        case 'border':
            element = new BorderVm();
            break;

        case 'magnifier':
            element = new MagnifierVm((options) => new VmEngine(options));
            break;

        case 'magicBrushGroup':
            element = new MagicBrushGroupVm();
            break;

        case 'magicBrush':
            element = new MagicBrushVm();
            break;

        case 'eraser':
            element = new EraserVm();
            break;

        default:
            element = new FallbackVm();
            settings.LOGGER.error(
                new Error(`Can not support View Model of Element Type: "${model.type}"`)
            );
    }

    return element as IBaseElementVm<T>;
}
```

**类型映射表**：

| Model Type | ViewModel | 用途 |
|------------|-----------|------|
| `image`, `mask` | `ImageVm` | 图片元素 |
| `video` | `VideoVm` | 视频元素 |
| `text` | `TextVm` | 文本元素 |
| `layout` | `LayoutVm` | 画板/画布 |
| `group`, `flex` | `GroupVm` | 组元素 |
| `shape` | `ShapeVm` | 形状元素 |
| `svg` | `SvgVm` | SVG 矢量图 |
| `path` | `PathVm` | 路径元素 |
| `connector` | `ConnectorVm` | 连接线 |
| `table` | `TableVm` | 表格 |
| `chart` | `ChartVm` | 图表 |
| `magnifier` | `MagnifierVm` | 放大镜 |
| ... | ... | ... |

### 5.3.2 元素继承体系

所有 ViewModel 都继承自 `BaseElementVm`，形成清晰的继承链：

```
                    BaseVm
                      │
                      ▼
                BaseContainerVm
                      │
                      ▼
                BaseElementVm
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    ImageVm       TextVm        GroupVm
        │             │             │
        ▼             ▼             ▼
    VideoVm     EffectTextVm   LayoutVm
```

**各层职责**：

| 类 | 职责 |
|---|------|
| `BaseVm` | 基础状态管理、更新机制 |
| `BaseContainerVm` | 子元素管理、坐标转换 |
| `BaseElementVm` | 元素通用功能：变换、包围盒、碰撞检测 |
| 具体 Vm | 特定元素的渲染逻辑 |

### 5.3.3 Fallback 机制

当遇到未知元素类型时，VmEngine 会创建 `FallbackVm` 作为兜底：

```typescript
/**
 * 检测是否应用 fallback
 * @param model 数据模型
 */
private testFallback(model: BaseElementModel): boolean {
    // 如果 model 的构造函数是基类，说明类型未被正确识别
    return model.constructor === _BaseElementModel;
}
```

**Fallback 的意义**：
1. **容错性**：防止未知类型导致渲染崩溃
2. **向后兼容**：新版本数据在旧版本编辑器中可以正常打开
3. **调试友好**：通过日志记录未知类型，便于排查问题

---

## 5.4 视图模型管理

VmEngine 提供四个核心方法管理 ViewModel 的生命周期：

### 5.4.1 createVm - 创建视图模型

`createVm` 创建一个**不缓存**的 ViewModel，适用于临时渲染场景：

```typescript
createVm<T extends BaseElementModel>(
    model: T,
    children?: boolean,
    context?: IContext,
): IBaseElementVm<T>;

createVm(model: PageModel, children?: boolean, context?: IContext): IPageVm;
```

**内部实现**：

```typescript
private createElement<T extends BaseElementModel>(
    model: T,
    children = false,
    context = this.context,
): IBaseElementVm<T> {
    // 1. 生成 ViewModel 实例
    const element: IBaseElementVm<T> = this.generateElement(model);

    // 2. 设置全局上下文
    element.context = context;

    // 3. 设置数据模型
    element.setModel(model);

    // 4. 递归创建子元素
    if (children && isParentElementModel(model) && !this.testFallback(model)) {
        const elements = model.elements.map((item) =>
            this.createElement(item as BaseElementModel, children, context),
        );
        element.addChild(...elements);
    }

    // 5. 调用模型初始化生命周期
    if (typeof element.modelCreated === 'function') {
        element.modelCreated(model, context);
    }

    return element;
}
```

**使用场景**：
- 导出图片时创建临时渲染树
- 缩略图预览
- 不需要缓存的一次性渲染

### 5.4.2 buildVm - 构建视图模型

`buildVm` 创建并**缓存** ViewModel，适用于编辑场景：

```typescript
buildVm<T extends BaseElementModel>(model: T, ignoreChildren?: boolean): IBaseElementVm<T>;
buildVm(model: PageModel, ignoreChildren?: boolean): IPageVm;
```

**内部实现**：

```typescript
private buildElement<T extends BaseElementModel>(
    model: T,
    ignoreChildren = false,
): IBaseElementVm<T> {
    // 1. 检查缓存
    // 批量套版场景下元素可能没有 uuid，需要非空校验
    if (model.uuid && this.elementMap.has(model.uuid)) {
        return this.getElement(model)!;
    }

    // 2. 创建元素
    const element = this.createElement(model, false, this.context);

    // 3. 递归构建子元素
    if (!ignoreChildren && isParentElementModel(model) && !this.testFallback(model)) {
        const elements = model.elements.map((item) =>
            this.buildElement(item as BaseElementModel, ignoreChildren),
        );
        element.addChild(...elements);
    }

    // 4. 缓存到 Map
    if (model.uuid) {
        this.elementMap.set(model.uuid, new Pointer(element));
    }

    return element;
}
```

**createVm vs buildVm**：

| 特性 | createVm | buildVm |
|------|----------|---------|
| 缓存 | 不缓存 | 缓存到 elementMap |
| 重复调用 | 每次创建新实例 | 返回缓存实例 |
| 适用场景 | 临时渲染 | 编辑场景 |
| 子元素参数 | `children` | `ignoreChildren` |

### 5.4.3 cloneVm - 克隆视图模型

`cloneVm` 复制一个 ViewModel 及其子元素：

```typescript
cloneVm<T extends BaseElementModel>(element: IBaseElementVm<T>): IBaseElementVm<T>;
cloneVm(page: IPageVm): IPageVm;
```

**内部实现**：

```typescript
private cloneElement<T extends BaseElementModel>(
    element: IBaseElementVm<T>,
): IBaseElementVm<T> {
    const model = element.getModel();
    
    // 1. 生成新实例
    const copy = this.generateElement(model);

    // 2. 设置上下文
    copy.context = this.context;

    // 3. 递归克隆子元素
    if (model instanceof GroupBaseElement || model instanceof LayoutBaseModel) {
        const children = element.children.map((child) => this.cloneElement(child));
        copy.addChild(...children);
    }

    // 4. 调用生命周期
    if (typeof copy.modelCreated === 'function') {
        copy.modelCreated(model, this.context);
    }

    return copy;
}
```

**使用场景**：
- 复制粘贴功能
- 批量复制元素
- 创建元素副本进行预览

### 5.4.4 removeVm - 移除视图模型

`removeVm` 从缓存中移除 ViewModel 并可选地销毁它：

```typescript
removeVm<T extends BaseElementModel>(
    model: T,
    options?: IRemoveOptions | boolean,
): IBaseElementVm<T> | null;

interface IRemoveOptions {
    /** 是否销毁（释放资源） */
    destroy?: boolean;
    /** 是否移除子元素 */
    children?: boolean;
}
```

**内部实现**：

```typescript
private removeElement<T extends BaseElementModel>(
    model: T,
    options?: IRemoveOptions | boolean,
): IBaseElementVm<T> | null {
    const element = this.getVm(model);

    if (!element) {
        return null;
    }

    const removeChildren = typeof options === 'boolean' ? options : !!options?.children;

    // 1. 移除子元素
    const children = element.removeChildren();

    if (removeChildren) {
        for (const child of children) {
            const model = child.getModel();
            this.removeElement(model, options);
        }
    }

    // 2. 调用生命周期
    if (typeof element.modelRemoved === 'function') {
        element.modelRemoved(model, this.context);
    }

    // 3. 从缓存中删除
    this.elementMap.delete(model.uuid);

    // 4. 销毁元素
    const destroy = typeof options === 'boolean' ? options : !!options?.destroy;

    if (destroy) {
        element.destroy({
            texture: true,
            baseTexture: true,
            children: removeChildren,
        });
    }

    return element;
}
```

### 5.4.5 getVm - 查询视图模型

```typescript
// 根据 Model 获取 ViewModel
getVm<T extends BaseElementModel>(model: T): IBaseElementVm<T> | null;
getVm(model: PageModel): IPageVm | null;

// 根据 Model 获取 Pointer
getVmPointer<T extends BaseElementModel>(model: T): Pointer<IBaseElementVm<T>> | null;

// 根据 UUID 获取
getElementById(uuid: string): IBaseElementVm | null;
getPageById(uuid: string): IPageVm | null;

// 判断是否存在
hasVm<T extends BaseElementModel>(model: T | PageModel): boolean;
```

---

## 5.5 视图模型生命周期

### 5.5.1 数据模型生命周期

当数据模型发生变化时，会触发对应的生命周期方法：

```typescript
interface IBaseElementLifecycle<P extends BaseElementModel> {
    /**
     * 模型初始化
     * 在 ViewModel 创建并绑定 Model 后调用
     */
    modelCreated?(model: P, context: IContext): void;

    /**
     * 模型数据更新
     * 在 Model 属性变化后调用
     */
    modelUpdated?(model: P, context: IContext): void;

    /**
     * 模型被移动
     * 在元素移动到新父容器后调用
     */
    modelMoved?(model: P, parent: ParentModel, index: number, context: IContext): void;

    /**
     * 模型被移除
     * 在 ViewModel 从缓存中移除前调用
     */
    modelRemoved?(model: P, context: IContext): void;
}
```

**生命周期流程图**：

```
创建阶段：
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ generateElement │ → │   setModel   │ → │ modelCreated │
└──────────────┘    └──────────────┘    └──────────────┘

更新阶段：
┌──────────────┐    ┌──────────────┐
│   setModel   │ → │ modelUpdated │
│  (如果变化)   │    └──────────────┘
└──────────────┘

移动阶段：
┌──────────────┐    ┌──────────────┐
│  addChildAt  │ → │  modelMoved  │
└──────────────┘    └──────────────┘

移除阶段：
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ modelRemoved │ → │   destroy    │ → │  从 Map 删除  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 5.5.2 视图模型生命周期

ViewModel 自身也有生命周期，用于控制渲染行为：

```typescript
interface IBaseVmLifecycle<T> {
    /**
     * 捕获错误
     */
    catch?(error: any): void;

    /**
     * 是否需要更新（优化用）
     */
    shouldUpdate?(nextState: T): boolean;

    /**
     * Render 之前
     */
    beforeUpdate?(nextState: T): void;

    /**
     * Render 之后
     */
    afterUpdate?(prevState: T): void;

    /**
     * 渲染方法
     */
    render?(prevState: T, nextState: T): void;
}
```

**状态更新流程**：

```typescript
// BaseVm.setState 伪代码
setState(state: Partial<T>): void {
    const nextState = { ...this._state, ...state };
    
    // 1. 判断是否需要更新
    if (this.shouldUpdate && !this.shouldUpdate(nextState)) {
        return;
    }
    
    // 2. 更新前钩子
    if (this.beforeUpdate) {
        this.beforeUpdate(nextState);
    }
    
    const prevState = this._state;
    this._state = nextState;
    
    // 3. 执行渲染
    if (this.render) {
        this.render(prevState, nextState);
    }
    
    // 4. 更新后钩子
    if (this.afterUpdate) {
        this.afterUpdate(prevState);
    }
}
```

### 5.5.3 生命周期执行顺序

以创建一个图片元素为例，完整的生命周期执行顺序：

```
1. new ImageVm()
   └── constructor()
       └── onConstruct()              // 初始化内部状态
       
2. element.context = context          // 设置上下文

3. element.setModel(model)            // 绑定数据模型
   └── this._model = model

4. element.modelCreated(model, ctx)   // 模型创建生命周期
   └── updateTransform()              // 更新变换
   └── setState({ url, width, ... })  // 触发渲染
       └── shouldUpdate()
       └── beforeUpdate()
       └── render()                   // 实际渲染
       └── afterUpdate()

5. parent.addChild(element)           // 添加到父容器
   └── child.emit('added', parent)

--- 元素使用中 ---

6. element.modelUpdated(model, ctx)   // 属性更新
   └── setState({ ... })
       └── render()

7. element.modelRemoved(model, ctx)   // 移除前清理
   └── 释放资源

8. element.destroy(options)           // 销毁
   └── 销毁 PixiJS 对象
   └── emitter.removeAllListeners()
```

---

## 5.6 增量更新机制

当编辑器中的数据发生变化时，不需要重建整个渲染树，而是通过 **Action** 描述变化，由 **Processor** 处理变化。

### 5.6.1 Action 类型定义

**代码位置**：`infinite-renderer/src/types/processor.ts`

```typescript
// 更新元素属性
export interface UpdateElement {
    type: 'update_elements';
    elements: BaseElementModel[];
}

// 添加元素
export interface AddElement {
    type: 'add_element';
    parent: ParentModel;
    element: BaseElementModel;
    index?: number;
}

// 移除元素
export interface RemoveElements {
    type: 'remove_elements';
    elements: BaseElementModel[];
}

// 移动元素
export interface MoveElements {
    type: 'move_elements';
    index?: number;
    parent: ParentModel;
    elements: BaseElementModel[];
}

// 联合类型
export type Action = UpdateElement | AddElement | RemoveElements | MoveElements;
```

**Action 示例**：

```typescript
// 添加一个图片元素到画板
const addAction: AddElement = {
    type: 'add_element',
    parent: layoutModel,      // 父容器
    element: imageModel,      // 新元素
    index: 0,                 // 插入位置
};

// 更新多个元素的属性
const updateAction: UpdateElement = {
    type: 'update_elements',
    elements: [imageModel1, textModel2],  // 被更新的元素
};

// 删除元素
const removeAction: RemoveElements = {
    type: 'remove_elements',
    elements: [imageModel],
};

// 移动元素到新的父容器
const moveAction: MoveElements = {
    type: 'move_elements',
    parent: newGroupModel,
    elements: [imageModel, textModel],
    index: 0,
};
```

### 5.6.2 Processor 处理器模式

Processor 是处理 Action 的抽象类，定义了处理各类 Action 的接口：

**代码位置**：`infinite-renderer/src/surfaces/processors/processor.ts`

```typescript
export interface ProcessorOptions {
    vmEngine: IVmEngine;
    context: IContext;
    /** 严格模式，若 action 的 target 找不到则报错 */
    strict?: boolean;
}

export abstract class Processor {
    protected vmEngine: IVmEngine;
    protected context: IContext;
    protected strict: boolean;

    constructor(options: ProcessorOptions) {
        const { vmEngine, context, strict = false } = options;
        this.vmEngine = vmEngine;
        this.context = context;
        this.strict = strict;
    }

    /**
     * 处理渲染引擎事件
     */
    process(action: Action): void {
        switch (action.type) {
            case 'add_element':
                this.processAddElement(action);
                break;

            case 'remove_elements':
                this.processRemoveElements(action);
                break;

            case 'update_elements':
                this.processUpdateElements(action);
                break;

            case 'move_elements':
                this.processMoveElements(action);
                break;

            default:
                assertNever(action);  // 类型安全检查
        }
    }

    // 抽象方法，由子类实现
    abstract processAddElement(action: AddElement): void;
    abstract processRemoveElements(action: RemoveElements): void;
    abstract processUpdateElements(action: UpdateElement): void;
    abstract processMoveElements(action: MoveElements): void;
}
```

### 5.6.3 BoardProcessor 实现

`BoardProcessor` 是无限画布模式下的 Processor 实现：

**代码位置**：`infinite-renderer/src/surfaces/processors/board-processor.ts`

```typescript
export class BoardProcessor extends Processor {
    /**
     * 处理添加元素
     */
    processAddElement(action: AddElement) {
        const { parent, element, index } = action;
        
        // 1. 获取父容器的 ViewModel
        const parentVm = this.vmEngine.getVm(parent);

        if (!parentVm) {
            if (this.strict) {
                throw new NotFoundError(parent);
            }
            return;
        }

        // 2. 构建新元素的 ViewModel
        const elementVm = this.vmEngine.buildVm(element);

        // 3. 添加到父容器
        if (typeof index === 'number') {
            parentVm.addChildAt(elementVm, index);
        } else {
            parentVm.addChild(elementVm);
        }
    }

    /**
     * 处理移除元素
     */
    processRemoveElements(action: RemoveElements) {
        const { elements } = action;

        for (const item of elements) {
            const elementVm = this.vmEngine.getVm(item);

            if (!elementVm) {
                if (this.strict) {
                    throw new NotFoundError(item);
                }
                continue;
            }

            // 1. 从父容器中移除
            if (elementVm.parent) {
                elementVm.parent.removeChild(elementVm);
            }

            // 2. 从缓存中移除并销毁
            this.vmEngine.removeVm(item, true);
        }
    }

    /**
     * 处理更新元素
     */
    processUpdateElements(action: UpdateElement) {
        const { elements } = action;

        for (const element of elements) {
            // 使用 Pointer 获取 ViewModel
            const elementPointer = this.vmEngine.getVmPointer(element);

            if (!elementPointer) {
                if (this.strict) {
                    throw new NotFoundError(element);
                }
                continue;
            }

            const elementVm = elementPointer.value;

            // 处理 Model 对象变化
            // 编辑器可能会深拷贝 Model，导致引用不同
            if (elementVm.getModel() !== element) {
                elementVm.setModel(element);
            }

            // 调用更新生命周期
            if (typeof elementVm.modelUpdated === 'function') {
                elementVm.modelUpdated(element, this.context);
            }
        }
    }

    /**
     * 处理移动元素
     */
    processMoveElements(action: MoveElements) {
        const { index, parent, elements } = action;

        const parentVm = this.vmEngine.getVm(parent);

        if (!parentVm) {
            if (this.strict) {
                throw new NotFoundError(parent);
            }
            return;
        }

        for (const [i, element] of elements.entries()) {
            const elementVm = this.vmEngine.getVm(element);

            if (!elementVm) {
                if (this.strict) {
                    throw new NotFoundError(element);
                }
                continue;
            }

            let idx = 0;

            // 添加到新位置
            if (typeof index === 'number') {
                parentVm.addChildAt(elementVm, index + i);
                idx = index + i;
            } else {
                parentVm.addChild(elementVm);
                idx = parentVm.children.length - 1;
            }

            // 调用移动生命周期
            if (typeof elementVm.modelMoved === 'function') {
                elementVm.modelMoved(element, parent, idx, this.context);
            }
        }
    }
}
```

### 5.6.4 批量更新优化

为了提高性能，ViewModel 支持批量更新机制：

```typescript
interface IBaseVm<T> {
    /**
     * 当前组件是否禁用 batch 更新
     */
    _isBatchDisabled: boolean;

    /**
     * 批量更新（延迟到下一帧）
     */
    batchUpdate(): void;

    /**
     * 立即更新
     */
    flush(): void;

    /**
     * 强制更新
     */
    forceUpdate(): void;
}
```

**批量更新的工作原理**：

```typescript
// 多次 setState 只触发一次 render
element.setState({ x: 100 });
element.setState({ y: 200 });
element.setState({ width: 300 });

// 上述三次调用会合并为一次 render
// 通过 requestAnimationFrame 延迟到下一帧执行
```

---

## 5.7 BaseElementVm 详解

### 5.7.1 类继承体系

```typescript
abstract class BaseElementVm<
    P extends BaseElementModel = BaseElementModel,
    T extends object = object,
>
    extends BaseContainerVm<T, IBaseElementVm>
    implements IBaseElementVm<P, T>
{
    // 实现
}
```

**泛型参数**：
- `P`：数据模型类型（如 `ImageElementModel`）
- `T`：状态类型（如 `ImageState`）

### 5.7.2 图层结构

每个 BaseElementVm 包含三个图层：

```typescript
constructor() {
    super();
    
    // 内容图层：元素自身的渲染内容
    this.contentLayer = this.createContentLayer();
    this.contentLayer.name = 'contentLayer';
    
    // 子元素图层：子元素的容器
    this.childrenLayer = this.createChildrenLayer();
    this.childrenLayer.name = 'childrenLayer';
    
    // 水印图层：元素水印
    this.watermarkLayer = new WatermarkVm();
    this.watermarkLayer.view.name = 'watermarkLayer';
    
    // 组装图层结构
    this.view.addChild(
        this.contentLayer,
        this.childrenLayer,
        this.watermarkLayer.view
    );
    
    this.onConstruct();
}
```

**图层可视化**：

```
┌─────────────────────────────────┐
│           view (Container)       │
│  ┌───────────────────────────┐  │
│  │     watermarkLayer (top)  │  │
│  ├───────────────────────────┤  │
│  │     childrenLayer         │  │
│  │  ┌──────┐  ┌──────┐      │  │
│  │  │child1│  │child2│ ...   │  │
│  │  └──────┘  └──────┘      │  │
│  ├───────────────────────────┤  │
│  │     contentLayer (bottom) │  │
│  │  (Sprite, Graphics, etc)  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.7.3 核心方法

**1. 变换更新**

```typescript
updateTransform(model: P = this._model): void {
    // 设置可见性
    this.view.visible = !model.hidden && !model.$hidden;

    // 分解变换矩阵到 view.transform
    decomposeTransform(model, this.transform, this.view.transform);

    // 更新透明度
    this.updateOpacity(model);
}
```

**2. 包围盒计算**

```typescript
// 获取渲染包围盒（世界坐标）
getBounds(skipUpdate?: boolean, newRect?: Rectangle): Rectangle {
    return this.view.getBounds(skipUpdate, newRect);
}

// 获取模型包围盒（世界坐标）
getModelBounds(skipUpdate?: boolean, newRect?: Rectangle): Rectangle {
    const poly = this.getModelOrientedPolygon(skipUpdate, tempPoints);
    return getBounds(poly, newRect);
}

// 获取有向包围盒多边形
getOrientedPolygon(skipUpdate = false, points?: number[]): number[] {
    if (!skipUpdate) {
        this.view._recursivePostUpdateTransform();
        this.view.updateTransform();
    }

    const rect = this.getLocalBounds(RECTANGLE);
    const matrix = this.view.worldTransform;

    const vert = getPoints(rect, tempPoints);
    const poly = transform(matrix, vert, points);

    return poly;
}
```

**3. 碰撞检测**

```typescript
// 点击检测
contains(point: IPointData): boolean {
    // 优先检测 mask
    if (this.view.mask) {
        const maskObject = this.getMaskObject();
        if (maskObject instanceof Graphics) {
            return !!maskObject.containsPoint(point);
        }
    }

    // 检测 hitArea
    if (this.view.hitArea) {
        const pos = this.getLocalPoint(point, tempPoint);
        return !!this.view.hitArea.contains(pos.x, pos.y);
    }

    return false;
}

// 区域相交检测
intersects(rect: Rectangle): boolean {
    const bounds = this.view.getBounds(false, RECTANGLE);

    // 快速排除：包围盒不相交
    if (!rect.intersects(bounds)) {
        return false;
    }

    // 完全包含
    if (rect.containsRect(bounds)) {
        return true;
    }

    // 精确检测 mask 或 hitArea
    // ...
}
```

**4. 渲染完成通知**

```typescript
complete(): void {
    this._isCompleted = true;

    if (this.isCompleted) {
        this.emitter.emit('complete');
    }
}

loading(): void {
    this._isCompleted = false;
    this.emitter.emit('loading');
}
```

---

## 5.8 本章小结

### 核心概念回顾

1. **VmEngine 职责**：
   - 维护 Model → ViewModel 的映射关系
   - 根据 Model 类型创建对应的 ViewModel
   - 管理 ViewModel 的生命周期

2. **Pointer 机制**：
   - 解决元素替换时的引用更新问题
   - 简单的值容器设计

3. **元素类型系统**：
   - 30+ 种元素类型映射
   - 继承自 BaseElementVm 的统一基类
   - Fallback 机制保证容错性

### API 速查表

| 方法 | 缓存 | 用途 |
|------|------|------|
| `createVm` | ❌ | 创建临时 ViewModel |
| `buildVm` | ✅ | 创建并缓存 ViewModel |
| `cloneVm` | ❌ | 复制 ViewModel |
| `removeVm` | 删除缓存 | 移除 ViewModel |
| `getVm` | 读取缓存 | 查询 ViewModel |
| `getVmPointer` | 读取缓存 | 查询 Pointer |

### 生命周期总结

**数据模型生命周期**：
- `modelCreated` → `modelUpdated` → `modelMoved` → `modelRemoved`

**视图模型生命周期**：
- `shouldUpdate` → `beforeUpdate` → `render` → `afterUpdate`

### Action 类型总结

| Action | 作用 |
|--------|------|
| `add_element` | 添加新元素 |
| `remove_elements` | 移除元素 |
| `update_elements` | 更新元素属性 |
| `move_elements` | 移动元素到新位置 |

### 架构设计要点

1. **分离关注点**：Model 存储数据，ViewModel 管理渲染
2. **增量更新**：通过 Action + Processor 模式避免全量重建
3. **缓存复用**：通过 Map 缓存避免重复创建
4. **引用稳定**：通过 Pointer 保证引用稳定性

---

## 📖 延伸阅读

- [MVVM 架构模式](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [命令模式](https://refactoring.guru/design-patterns/command)
- [工厂模式](https://refactoring.guru/design-patterns/factory-method)

---

## 📝 练习题

1. **设计题**：如果需要支持"元素类型转换"功能（如将图片转为 SVG），如何利用 Pointer 机制实现？

2. **实现题**：实现一个新的 `VideoVm` 视图模型，要求：
   - 继承自 `BaseElementVm`
   - 支持视频播放/暂停状态
   - 实现 `modelCreated` 和 `modelUpdated` 生命周期

3. **分析题**：分析 `buildVm` 和 `createVm` 在内存占用上的差异，什么场景下应该选择哪个方法？

---

> 下一章：[第6章 元素生命周期与渲染](./06-元素生命周期与渲染.md) - 深入了解具体元素的渲染实现

---

> 📅 文档更新时间：2026-01-28
> 
> 👤 维护者：前端团队
