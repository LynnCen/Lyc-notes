# 第4章：Container容器与场景图

## 4.1 章节概述

Container 是 PixiJS 中最重要的显示对象之一。它本身不渲染任何内容，但可以包含和管理子对象，形成树状的场景图结构。

本章将深入讲解：

- **Container 基础**：创建、属性、方法
- **子对象管理**：添加、移除、查找、遍历
- **场景图结构**：树形结构、父子关系
- **坐标系统**：本地坐标、世界坐标、坐标转换
- **容器变换**：变换传递、累积效果
- **高级容器**：ParticleContainer、特殊容器

---

## 4.2 Container 基础

### 4.2.1 什么是 Container

```
Container 的作用

Container 是一个"空"的显示对象，它：
- 不渲染任何可见内容
- 可以包含任意数量的子对象
- 对子对象应用统一的变换
- 形成层级结构（场景图）


场景图示例：

                    Stage (Container)
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     Background      GameLayer       UILayer
     (Container)    (Container)    (Container)
          │              │              │
          │         ┌────┴────┐         │
          │         │         │         │
       Sprite    Player    Enemies   Button
                (Sprite)  (Container)  (Sprite)
                              │
                         ┌────┴────┐
                         │         │
                      Enemy1    Enemy2
                     (Sprite)  (Sprite)
```

### 4.2.2 创建 Container

```typescript
/**
 * 创建 Container
 */

// 基本创建
const container = new PIXI.Container();

// 设置属性
container.x = 100;
container.y = 100;
container.scale.set(1.5);
container.rotation = Math.PI / 4;
container.alpha = 0.8;

// 添加到舞台
app.stage.addChild(container);

// 添加子对象
const sprite = new PIXI.Sprite(texture);
container.addChild(sprite);
```

### 4.2.3 Container 特有属性

```typescript
/**
 * Container 特有属性
 */

// children: 子对象数组
console.log(container.children);        // DisplayObject[]
console.log(container.children.length); // 子对象数量

// sortableChildren: 是否启用 zIndex 排序
container.sortableChildren = true;

// interactiveChildren: 子对象是否可交互
container.interactiveChildren = true;

// width/height: 容器的包围盒尺寸（只读）
console.log(container.width, container.height);
```

---

## 4.3 子对象管理

### 4.3.1 添加子对象

```typescript
/**
 * 添加子对象
 */

// 添加单个子对象
container.addChild(sprite);

// 添加多个子对象
container.addChild(sprite1, sprite2, sprite3);

// 在指定位置添加
container.addChildAt(sprite, 0);  // 添加到最底层
container.addChildAt(sprite, container.children.length);  // 添加到最顶层

// 添加并返回
const added = container.addChild(sprite);
console.log(added === sprite);  // true


/*
添加子对象时发生的事情：

1. 如果子对象已有父容器，先从原父容器移除
2. 设置子对象的 parent 属性
3. 将子对象添加到 children 数组
4. 触发子对象的 added 事件
*/
```

### 4.3.2 移除子对象

```typescript
/**
 * 移除子对象
 */

// 移除指定子对象
container.removeChild(sprite);

// 移除多个子对象
container.removeChild(sprite1, sprite2);

// 按索引移除
container.removeChildAt(0);  // 移除第一个

// 移除所有子对象
container.removeChildren();

// 移除指定范围的子对象
container.removeChildren(0, 5);  // 移除前5个

// 移除并销毁
const removed = container.removeChild(sprite);
removed.destroy();


/*
移除子对象时发生的事情：

1. 从 children 数组中移除
2. 将子对象的 parent 设为 null
3. 触发子对象的 removed 事件
4. 子对象不会被销毁（除非手动调用 destroy）
*/
```

### 4.3.3 查找子对象

```typescript
/**
 * 查找子对象
 */

// 按索引获取
const child = container.getChildAt(0);

// 获取子对象索引
const index = container.getChildIndex(sprite);

// 按名称查找（需要设置 name 属性）
sprite.name = 'player';
const player = container.getChildByName('player');

// 递归按名称查找
const found = container.getChildByName('enemy', true);  // 深度搜索

// 自定义查找
function findChildByCondition(
    container: PIXI.Container,
    predicate: (child: PIXI.DisplayObject) => boolean
): PIXI.DisplayObject | null {
    for (const child of container.children) {
        if (predicate(child)) {
            return child;
        }
        if (child instanceof PIXI.Container) {
            const found = findChildByCondition(child, predicate);
            if (found) return found;
        }
    }
    return null;
}

// 使用
const redSprite = findChildByCondition(container, child => {
    return child instanceof PIXI.Sprite && child.tint === 0xFF0000;
});
```

### 4.3.4 遍历子对象

```typescript
/**
 * 遍历子对象
 */

// 直接遍历 children 数组
for (const child of container.children) {
    console.log(child);
}

// forEach
container.children.forEach((child, index) => {
    console.log(index, child);
});

// 递归遍历所有后代
function traverseAll(
    container: PIXI.Container,
    callback: (child: PIXI.DisplayObject, depth: number) => void,
    depth = 0
) {
    for (const child of container.children) {
        callback(child, depth);
        if (child instanceof PIXI.Container) {
            traverseAll(child, callback, depth + 1);
        }
    }
}

// 使用
traverseAll(app.stage, (child, depth) => {
    console.log('  '.repeat(depth) + child.constructor.name);
});

// 输出示例：
// Container
//   Sprite
//   Container
//     Sprite
//     Sprite
```

### 4.3.5 调整子对象顺序

```typescript
/**
 * 调整子对象顺序
 */

// 设置索引
container.setChildIndex(sprite, 0);  // 移到最底层
container.setChildIndex(sprite, container.children.length - 1);  // 移到最顶层

// 交换两个子对象
container.swapChildren(spriteA, spriteB);

// 使用 zIndex（需要 sortableChildren = true）
container.sortableChildren = true;
spriteA.zIndex = 10;
spriteB.zIndex = 5;
container.sortChildren();  // 手动排序

// 移到最顶层的便捷方法
function bringToFront(child: PIXI.DisplayObject) {
    const parent = child.parent;
    if (parent) {
        parent.setChildIndex(child, parent.children.length - 1);
    }
}

// 移到最底层的便捷方法
function sendToBack(child: PIXI.DisplayObject) {
    const parent = child.parent;
    if (parent) {
        parent.setChildIndex(child, 0);
    }
}
```

---

## 4.4 场景图结构

### 4.4.1 树形结构

```
场景图是一个树形结构

                    Root (Stage)
                    /    |    \
                   /     |     \
                Layer1  Layer2  Layer3
                /  \      |      /  \
               /    \     |     /    \
            Obj1   Obj2  Obj3  Obj4  Obj5
                          |
                         / \
                        /   \
                     Obj6   Obj7


特点：
1. 每个节点最多有一个父节点
2. 每个节点可以有任意数量的子节点
3. 根节点（Stage）没有父节点
4. 叶节点没有子节点

遍历方式：
- 深度优先（DFS）：用于渲染、事件传播
- 广度优先（BFS）：用于层级操作
```

### 4.4.2 父子关系

```typescript
/**
 * 父子关系
 */

// 获取父容器
const parent = sprite.parent;

// 检查是否有父容器
if (sprite.parent) {
    console.log('有父容器');
}

// 获取根节点（Stage）
function getRoot(obj: PIXI.DisplayObject): PIXI.Container | null {
    let current = obj;
    while (current.parent) {
        current = current.parent;
    }
    return current instanceof PIXI.Container ? current : null;
}

// 检查是否是后代
function isDescendantOf(
    child: PIXI.DisplayObject,
    ancestor: PIXI.Container
): boolean {
    let current = child.parent;
    while (current) {
        if (current === ancestor) return true;
        current = current.parent;
    }
    return false;
}

// 获取祖先链
function getAncestors(obj: PIXI.DisplayObject): PIXI.Container[] {
    const ancestors: PIXI.Container[] = [];
    let current = obj.parent;
    while (current) {
        ancestors.push(current);
        current = current.parent;
    }
    return ancestors;
}
```

### 4.4.3 场景图事件

```typescript
/**
 * 场景图事件
 */

// 监听添加到场景图
sprite.on('added', (parent) => {
    console.log('被添加到', parent);
});

// 监听从场景图移除
sprite.on('removed', (parent) => {
    console.log('从', parent, '移除');
});

// 实际应用：自动初始化
class GameEntity extends PIXI.Sprite {
    constructor(texture: PIXI.Texture) {
        super(texture);
        
        this.on('added', () => {
            this.init();
        });
        
        this.on('removed', () => {
            this.cleanup();
        });
    }
    
    private init() {
        console.log('实体初始化');
    }
    
    private cleanup() {
        console.log('实体清理');
    }
}
```

---

## 4.5 坐标系统

### 4.5.1 本地坐标与世界坐标

```
本地坐标 vs 世界坐标

世界坐标系（全局）：
┌─────────────────────────────────────────┐
│ (0,0)                                   │
│   ┌─────────────────────────────────┐   │
│   │ Container (100, 100)            │   │
│   │   ┌─────────────────────────┐   │   │
│   │   │ Sprite (50, 50)         │   │   │
│   │   │                         │   │   │
│   │   │  本地坐标: (50, 50)     │   │   │
│   │   │  世界坐标: (150, 150)   │   │   │
│   │   └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘


计算公式：
世界坐标 = 父世界坐标 + 本地坐标 × 父缩放 × 旋转矩阵
```

### 4.5.2 坐标转换

```typescript
/**
 * 坐标转换
 */

// 本地坐标 → 世界坐标
const worldPoint = sprite.toGlobal(new PIXI.Point(0, 0));
console.log('世界坐标:', worldPoint.x, worldPoint.y);

// 世界坐标 → 本地坐标
const localPoint = sprite.toLocal(new PIXI.Point(100, 100));
console.log('本地坐标:', localPoint.x, localPoint.y);

// 从一个对象的坐标系转换到另一个对象的坐标系
const pointInB = objectA.toLocal(point, objectB);

// 获取鼠标在对象本地坐标系中的位置
app.stage.eventMode = 'static';
app.stage.on('pointermove', (event) => {
    const globalPos = event.global;
    const localPos = sprite.toLocal(globalPos);
    console.log('鼠标在精灵中的位置:', localPos);
});
```

### 4.5.3 坐标转换示例

```typescript
/**
 * 坐标转换实际应用
 */

// 场景：将一个对象从一个容器移动到另一个容器，保持视觉位置不变
function reparent(
    child: PIXI.DisplayObject,
    newParent: PIXI.Container
) {
    // 获取当前世界坐标
    const worldPos = child.toGlobal(new PIXI.Point(0, 0));
    
    // 计算在新父容器中的本地坐标
    const newLocalPos = newParent.toLocal(worldPos);
    
    // 移动到新父容器
    newParent.addChild(child);
    
    // 设置新的本地坐标
    child.position.set(newLocalPos.x, newLocalPos.y);
}

// 场景：检查点击是否在对象内部
function isPointInside(
    obj: PIXI.DisplayObject,
    globalPoint: PIXI.Point
): boolean {
    const localPoint = obj.toLocal(globalPoint);
    const bounds = obj.getLocalBounds();
    
    return localPoint.x >= bounds.x &&
           localPoint.x <= bounds.x + bounds.width &&
           localPoint.y >= bounds.y &&
           localPoint.y <= bounds.y + bounds.height;
}

// 场景：让一个对象跟随另一个对象
function follow(
    follower: PIXI.DisplayObject,
    target: PIXI.DisplayObject,
    offset = new PIXI.Point(0, 0)
) {
    // 获取目标的世界坐标
    const targetWorld = target.toGlobal(new PIXI.Point(0, 0));
    
    // 转换到跟随者的父坐标系
    const localPos = follower.parent.toLocal(targetWorld);
    
    // 应用偏移
    follower.position.set(
        localPos.x + offset.x,
        localPos.y + offset.y
    );
}
```

---

## 4.6 容器变换

### 4.6.1 变换传递

```
变换传递机制

父容器的变换会传递给所有子对象

Container (scale: 2, rotation: 45°)
    │
    └── Sprite (scale: 1, rotation: 0°)
              │
              └── 最终效果: scale: 2, rotation: 45°


Container (alpha: 0.5)
    │
    └── Sprite (alpha: 0.8)
              │
              └── 最终 worldAlpha: 0.5 × 0.8 = 0.4
```

### 4.6.2 变换累积

```typescript
/**
 * 变换累积示例
 */

// 创建嵌套容器
const outer = new PIXI.Container();
outer.scale.set(2);
outer.rotation = Math.PI / 4;  // 45°

const inner = new PIXI.Container();
inner.scale.set(0.5);
inner.rotation = Math.PI / 4;  // 45°

const sprite = new PIXI.Sprite(texture);
sprite.scale.set(2);
sprite.rotation = Math.PI / 2;  // 90°

outer.addChild(inner);
inner.addChild(sprite);
app.stage.addChild(outer);

/*
最终效果：
- 缩放: 2 × 0.5 × 2 = 2
- 旋转: 45° + 45° + 90° = 180°
*/

// 获取世界变换矩阵
console.log(sprite.worldTransform);
```

### 4.6.3 利用容器变换

```typescript
/**
 * 利用容器变换的技巧
 */

// 技巧1：整体缩放
const gameContainer = new PIXI.Container();
app.stage.addChild(gameContainer);

// 根据屏幕大小缩放整个游戏
function resizeGame() {
    const scale = Math.min(
        window.innerWidth / 800,
        window.innerHeight / 600
    );
    gameContainer.scale.set(scale);
}

// 技巧2：整体移动（实现相机）
const worldContainer = new PIXI.Container();
app.stage.addChild(worldContainer);

function moveCamera(x: number, y: number) {
    // 移动世界容器（相反方向）
    worldContainer.position.set(-x, -y);
}

// 技巧3：整体旋转
const rotatingGroup = new PIXI.Container();
app.stage.addChild(rotatingGroup);

// 围绕中心旋转
rotatingGroup.pivot.set(100, 100);  // 设置旋转中心
rotatingGroup.position.set(100, 100);  // 补偿位置

app.ticker.add(() => {
    rotatingGroup.rotation += 0.01;
});
```

---

## 4.7 高级容器

### 4.7.1 ParticleContainer

```typescript
/**
 * ParticleContainer - 高性能粒子容器
 */

// 创建粒子容器
const particleContainer = new PIXI.ParticleContainer(10000, {
    scale: true,      // 允许缩放
    position: true,   // 允许位置变化
    rotation: true,   // 允许旋转
    uvs: true,        // 允许 UV 变化
    alpha: true,      // 允许透明度变化
});

app.stage.addChild(particleContainer);

// 添加粒子
for (let i = 0; i < 10000; i++) {
    const particle = new PIXI.Sprite(particleTexture);
    particle.x = Math.random() * 800;
    particle.y = Math.random() * 600;
    particle.scale.set(0.1 + Math.random() * 0.3);
    particleContainer.addChild(particle);
}

/*
ParticleContainer 限制：
- 只能包含 Sprite
- 所有精灵必须使用相同的纹理（或纹理图集）
- 不支持嵌套容器
- 不支持遮罩和滤镜
- 不支持交互事件

优势：
- 比普通 Container 快 10-100 倍
- 适合大量相似对象（粒子、子弹等）
*/
```

### 4.7.2 自定义容器

```typescript
/**
 * 自定义容器
 */

// 示例：带边界的容器
class BoundedContainer extends PIXI.Container {
    private bounds: PIXI.Rectangle;
    
    constructor(bounds: PIXI.Rectangle) {
        super();
        this.bounds = bounds;
    }
    
    addChild<T extends PIXI.DisplayObject>(child: T): T {
        super.addChild(child);
        this.constrainChild(child);
        return child;
    }
    
    private constrainChild(child: PIXI.DisplayObject) {
        child.x = Math.max(this.bounds.x, Math.min(child.x, this.bounds.right));
        child.y = Math.max(this.bounds.y, Math.min(child.y, this.bounds.bottom));
    }
    
    updateChildren() {
        for (const child of this.children) {
            this.constrainChild(child);
        }
    }
}

// 示例：自动布局容器
class HorizontalContainer extends PIXI.Container {
    private gap: number;
    
    constructor(gap = 10) {
        super();
        this.gap = gap;
    }
    
    addChild<T extends PIXI.DisplayObject>(child: T): T {
        super.addChild(child);
        this.layout();
        return child;
    }
    
    removeChild<T extends PIXI.DisplayObject>(child: T): T {
        super.removeChild(child);
        this.layout();
        return child;
    }
    
    private layout() {
        let x = 0;
        for (const child of this.children) {
            child.x = x;
            child.y = 0;
            x += child.width + this.gap;
        }
    }
}
```

---

## 4.8 场景管理实践

### 4.8.1 场景管理器

```typescript
/**
 * 场景管理器
 */

interface Scene {
    container: PIXI.Container;
    init(): void;
    update(delta: number): void;
    destroy(): void;
}

class SceneManager {
    private app: PIXI.Application;
    private currentScene: Scene | null = null;
    private scenes: Map<string, new () => Scene> = new Map();
    
    constructor(app: PIXI.Application) {
        this.app = app;
        
        // 注册更新循环
        this.app.ticker.add(this.update, this);
    }
    
    register(name: string, SceneClass: new () => Scene) {
        this.scenes.set(name, SceneClass);
    }
    
    async switchTo(name: string) {
        // 销毁当前场景
        if (this.currentScene) {
            this.currentScene.destroy();
            this.app.stage.removeChild(this.currentScene.container);
        }
        
        // 创建新场景
        const SceneClass = this.scenes.get(name);
        if (!SceneClass) {
            throw new Error(`Scene "${name}" not found`);
        }
        
        this.currentScene = new SceneClass();
        this.currentScene.init();
        this.app.stage.addChild(this.currentScene.container);
    }
    
    private update(delta: number) {
        this.currentScene?.update(delta);
    }
}

// 使用示例
class MenuScene implements Scene {
    container = new PIXI.Container();
    
    init() {
        const title = new PIXI.Text('Menu', { fontSize: 48 });
        this.container.addChild(title);
    }
    
    update(delta: number) {
        // 更新逻辑
    }
    
    destroy() {
        this.container.destroy({ children: true });
    }
}

class GameScene implements Scene {
    container = new PIXI.Container();
    
    init() {
        // 初始化游戏
    }
    
    update(delta: number) {
        // 游戏逻辑
    }
    
    destroy() {
        this.container.destroy({ children: true });
    }
}

// 注册和使用
const sceneManager = new SceneManager(app);
sceneManager.register('menu', MenuScene);
sceneManager.register('game', GameScene);
sceneManager.switchTo('menu');
```

### 4.8.2 图层管理

```typescript
/**
 * 图层管理
 */

class LayerManager {
    private layers: Map<string, PIXI.Container> = new Map();
    private stage: PIXI.Container;
    
    constructor(stage: PIXI.Container) {
        this.stage = stage;
        this.stage.sortableChildren = true;
    }
    
    createLayer(name: string, zIndex: number): PIXI.Container {
        const layer = new PIXI.Container();
        layer.name = name;
        layer.zIndex = zIndex;
        layer.sortableChildren = true;
        
        this.layers.set(name, layer);
        this.stage.addChild(layer);
        this.stage.sortChildren();
        
        return layer;
    }
    
    getLayer(name: string): PIXI.Container | undefined {
        return this.layers.get(name);
    }
    
    addToLayer(name: string, child: PIXI.DisplayObject) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.addChild(child);
        }
    }
    
    removeLayer(name: string) {
        const layer = this.layers.get(name);
        if (layer) {
            layer.destroy({ children: true });
            this.layers.delete(name);
        }
    }
}

// 使用
const layerManager = new LayerManager(app.stage);

// 创建图层（按 zIndex 排序）
layerManager.createLayer('background', 0);
layerManager.createLayer('game', 10);
layerManager.createLayer('effects', 20);
layerManager.createLayer('ui', 30);

// 添加对象到图层
layerManager.addToLayer('background', backgroundSprite);
layerManager.addToLayer('game', playerSprite);
layerManager.addToLayer('ui', healthBar);
```

---

## 4.9 性能优化

### 4.9.1 容器优化技巧

```typescript
/**
 * 容器性能优化
 */

// 1. 减少嵌套层级
// 不好：过深的嵌套
const a = new PIXI.Container();
const b = new PIXI.Container();
const c = new PIXI.Container();
a.addChild(b);
b.addChild(c);
c.addChild(sprite);

// 好：扁平结构
const container = new PIXI.Container();
container.addChild(sprite);


// 2. 使用 cacheAsBitmap
// 对于不经常变化的复杂容器
const staticUI = new PIXI.Container();
// ... 添加很多子对象
staticUI.cacheAsBitmap = true;  // 缓存为位图


// 3. 使用 ParticleContainer
// 对于大量相似对象
const particles = new PIXI.ParticleContainer(10000);


// 4. 及时移除不需要的对象
function cleanupOffscreen(container: PIXI.Container, viewport: PIXI.Rectangle) {
    for (let i = container.children.length - 1; i >= 0; i--) {
        const child = container.children[i];
        const bounds = child.getBounds();
        
        if (!bounds.intersects(viewport)) {
            container.removeChild(child);
        }
    }
}


// 5. 禁用不需要的功能
container.interactiveChildren = false;  // 禁用子对象交互
container.sortableChildren = false;     // 禁用排序
```

### 4.9.2 批量操作优化

```typescript
/**
 * 批量操作优化
 */

// 不好：频繁添加触发多次排序
container.sortableChildren = true;
for (let i = 0; i < 100; i++) {
    container.addChild(createSprite());  // 每次添加都可能触发排序
}

// 好：批量添加后一次排序
container.sortableChildren = false;  // 暂时禁用
for (let i = 0; i < 100; i++) {
    container.addChild(createSprite());
}
container.sortableChildren = true;
container.sortChildren();  // 一次性排序


// 不好：频繁修改 zIndex
for (const child of container.children) {
    child.zIndex = Math.random() * 100;
    container.sortChildren();  // 每次都排序
}

// 好：批量修改后一次排序
for (const child of container.children) {
    child.zIndex = Math.random() * 100;
}
container.sortChildren();  // 最后排序一次
```

---

## 4.10 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Container** | 容器，用于组织子对象 |
| **children** | 子对象数组 |
| **场景图** | 树形的显示对象结构 |
| **本地坐标** | 相对于父容器的坐标 |
| **世界坐标** | 相对于舞台的坐标 |
| **变换传递** | 父容器变换影响子对象 |
| **ParticleContainer** | 高性能粒子容器 |

### 关键代码

```typescript
// 创建容器
const container = new PIXI.Container();

// 添加/移除子对象
container.addChild(sprite);
container.removeChild(sprite);

// 坐标转换
const worldPos = sprite.toGlobal(new PIXI.Point(0, 0));
const localPos = sprite.toLocal(worldPos);

// 层级排序
container.sortableChildren = true;
sprite.zIndex = 10;
container.sortChildren();

// 遍历
for (const child of container.children) {
    // ...
}
```

---

## 4.11 练习题

### 基础练习

1. 创建一个三层结构的场景图

2. 实现一个简单的场景管理器

3. 使用坐标转换实现对象跟随

### 进阶练习

4. 实现一个图层管理系统

5. 创建一个自动布局的容器（网格布局）

### 挑战练习

6. 实现一个完整的游戏场景系统，包含场景切换、图层管理、对象池

---

**下一章预告**：在第5章中，我们将深入学习 Sprite 精灵和纹理系统。

---

**文档版本**：v1.0  
**字数统计**：约 11,000 字  
**代码示例**：45+ 个
