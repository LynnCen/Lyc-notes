# 第8章：Transform变换系统

## 8.1 章节概述

Transform（变换）是 PixiJS 中控制显示对象位置、旋转、缩放的核心系统。理解变换系统对于实现复杂的动画和交互至关重要。

本章将深入讲解：

- **变换基础**：position、scale、rotation、pivot
- **Transform 类**：属性、方法、矩阵
- **变换矩阵**：2D 仿射变换、矩阵运算
- **本地与世界变换**：坐标系转换
- **变换继承**：父子关系、累积效果
- **实用技巧**：围绕点旋转、缩放

---

## 8.2 变换基础

### 8.2.1 基本变换属性

```
基本变换属性

┌─────────────────────────────────────────────────────────────┐
│                    DisplayObject                            │
├─────────────────────────────────────────────────────────────┤
│  position (x, y)    - 位置                                  │
│  scale (x, y)       - 缩放                                  │
│  rotation           - 旋转（弧度）                          │
│  angle              - 旋转（角度）                          │
│  pivot (x, y)       - 旋转/缩放中心点                       │
│  skew (x, y)        - 倾斜                                  │
└─────────────────────────────────────────────────────────────┘


变换顺序：
1. 应用 pivot（移动到中心点）
2. 应用 scale（缩放）
3. 应用 skew（倾斜）
4. 应用 rotation（旋转）
5. 应用 position（移动到最终位置）
```

### 8.2.2 Position 位置

```typescript
/**
 * Position 位置
 */

const sprite = new PIXI.Sprite(texture);

// 直接设置
sprite.x = 100;
sprite.y = 200;

// 使用 position 对象
sprite.position.x = 100;
sprite.position.y = 200;

// 使用 set 方法
sprite.position.set(100, 200);

// 使用 copyFrom
sprite.position.copyFrom(otherSprite.position);

// 使用 Point
sprite.position = new PIXI.Point(100, 200);


// position 是 ObservablePoint
// 修改会自动触发变换更新
sprite.position.set(100, 200);  // 触发更新
```

### 8.2.3 Scale 缩放

```typescript
/**
 * Scale 缩放
 */

const sprite = new PIXI.Sprite(texture);

// 直接设置
sprite.scale.x = 2;    // X 方向放大 2 倍
sprite.scale.y = 0.5;  // Y 方向缩小到 0.5 倍

// 统一缩放
sprite.scale.set(2);   // 等比例放大 2 倍

// 使用 width/height（会影响 scale）
sprite.width = 200;    // 设置宽度，自动计算 scale.x
sprite.height = 100;   // 设置高度，自动计算 scale.y


/*
缩放说明：

scale = 1: 原始大小
scale = 2: 放大 2 倍
scale = 0.5: 缩小到一半
scale = -1: 镜像翻转

原始图像 (100x100):
┌─────────────────┐
│                 │
│     Sprite      │
│                 │
└─────────────────┘

scale.x = -1 (水平翻转):
┌─────────────────┐
│                 │
│     etirpS      │  ← 水平镜像
│                 │
└─────────────────┘
*/
```

### 8.2.4 Rotation 旋转

```typescript
/**
 * Rotation 旋转
 */

const sprite = new PIXI.Sprite(texture);

// 使用弧度
sprite.rotation = Math.PI / 4;  // 45 度

// 使用角度
sprite.angle = 45;  // 45 度

// 角度转弧度
const radians = degrees * Math.PI / 180;
// 或使用 PIXI 工具
const radians = PIXI.DEG_TO_RAD * degrees;

// 弧度转角度
const degrees = radians * 180 / Math.PI;
// 或使用 PIXI 工具
const degrees = PIXI.RAD_TO_DEG * radians;


// 旋转动画
app.ticker.add(() => {
    sprite.rotation += 0.01;  // 每帧旋转
});


/*
旋转方向：

rotation = 0:
    ↑
    │
────┼────
    │
    ↓

rotation = π/2 (90°):
    
←───┼───→
    │
    ↓

正值：顺时针
负值：逆时针
*/
```

### 8.2.5 Pivot 中心点

```typescript
/**
 * Pivot 中心点
 */

const sprite = new PIXI.Sprite(texture);

// 设置 pivot
sprite.pivot.set(50, 50);  // 旋转/缩放中心点

// pivot vs anchor
/*
pivot: 以像素为单位，相对于对象左上角
anchor: 以比例为单位 (0-1)，只有 Sprite 有

anchor = (0.5, 0.5) 等价于 pivot = (width/2, height/2)
*/


// 围绕中心旋转
sprite.pivot.set(sprite.width / 2, sprite.height / 2);
sprite.position.set(
    sprite.x + sprite.width / 2,
    sprite.y + sprite.height / 2
);
sprite.rotation = Math.PI / 4;


/*
Pivot 的作用：

pivot = (0, 0) 默认：
┌─────────────────┐
│●                │  ← 围绕左上角旋转
│                 │
│                 │
└─────────────────┘

pivot = (50, 50) 中心：
┌─────────────────┐
│                 │
│        ●        │  ← 围绕中心旋转
│                 │
└─────────────────┘
*/
```

### 8.2.6 Skew 倾斜

```typescript
/**
 * Skew 倾斜
 */

const sprite = new PIXI.Sprite(texture);

// 设置倾斜
sprite.skew.x = 0.5;  // X 方向倾斜
sprite.skew.y = 0;    // Y 方向倾斜

sprite.skew.set(0.5, 0.2);


/*
Skew 效果：

原始：
┌─────────────────┐
│                 │
│                 │
│                 │
└─────────────────┘

skew.x = 0.5：
    ┌─────────────────┐
   /                 /
  /                 /
 /                 /
└─────────────────┘

skew.y = 0.5：
┌─────────────────┐\
│                 │ \
│                 │  \
│                 │   \
└─────────────────┘────
*/
```

---

## 8.3 Transform 类

### 8.3.1 Transform 结构

```typescript
/**
 * Transform 类结构
 */

// 每个 DisplayObject 都有一个 transform 属性
const transform = sprite.transform;

// Transform 属性
transform.position;      // ObservablePoint - 位置
transform.scale;         // ObservablePoint - 缩放
transform.pivot;         // ObservablePoint - 中心点
transform.skew;          // ObservablePoint - 倾斜
transform.rotation;      // number - 旋转

// 矩阵
transform.localTransform;   // Matrix - 本地变换矩阵
transform.worldTransform;   // Matrix - 世界变换矩阵

// 更新标记
transform._localID;         // 本地变换 ID
transform._worldID;         // 世界变换 ID
```

### 8.3.2 变换更新

```typescript
/**
 * 变换更新机制
 */

// PixiJS 使用脏标记系统优化变换计算
// 只有当变换属性改变时才重新计算矩阵

// 手动更新变换
sprite.updateTransform();

// 变换更新流程：
/*
1. 修改 position/scale/rotation 等属性
2. 属性是 ObservablePoint，会设置脏标记
3. 渲染时检查脏标记
4. 如果脏，重新计算 localTransform
5. 结合父级 worldTransform 计算自己的 worldTransform
*/


// 获取最新的世界变换
sprite.updateTransform();
const worldMatrix = sprite.worldTransform;
```

---

## 8.4 变换矩阵

### 8.4.1 2D 仿射变换矩阵

```
2D 仿射变换矩阵

┌         ┐   ┌           ┐
│ a  c tx │   │ sx  0  tx │
│ b  d ty │ = │ 0  sy  ty │  (无旋转时)
│ 0  0  1 │   │ 0   0   1 │
└         ┘   └           ┘

各元素含义：
- a: X 缩放 (scaleX * cos(rotation))
- b: Y 倾斜 (scaleX * sin(rotation))
- c: X 倾斜 (-scaleY * sin(rotation))
- d: Y 缩放 (scaleY * cos(rotation))
- tx: X 平移
- ty: Y 平移


变换公式：
┌    ┐   ┌         ┐   ┌   ┐
│ x' │   │ a  c tx │   │ x │
│ y' │ = │ b  d ty │ × │ y │
│ 1  │   │ 0  0  1 │   │ 1 │
└    ┘   └         ┘   └   ┘

x' = a * x + c * y + tx
y' = b * x + d * y + ty
```

### 8.4.2 Matrix 类

```typescript
/**
 * PIXI.Matrix 类
 */

// 创建矩阵
const matrix = new PIXI.Matrix();

// 矩阵属性
matrix.a;   // X 缩放
matrix.b;   // Y 倾斜
matrix.c;   // X 倾斜
matrix.d;   // Y 缩放
matrix.tx;  // X 平移
matrix.ty;  // Y 平移


// 设置矩阵
matrix.set(a, b, c, d, tx, ty);

// 单位矩阵
matrix.identity();

// 平移
matrix.translate(100, 50);

// 缩放
matrix.scale(2, 2);

// 旋转
matrix.rotate(Math.PI / 4);

// 应用到点
const point = new PIXI.Point(10, 20);
const transformed = matrix.apply(point);

// 应用逆变换
const original = matrix.applyInverse(transformed);

// 矩阵相乘
matrix.append(otherMatrix);   // this = this × other
matrix.prepend(otherMatrix);  // this = other × this

// 求逆矩阵
const inverse = matrix.invert();

// 复制矩阵
const copy = matrix.clone();
matrix.copyFrom(otherMatrix);
matrix.copyTo(targetMatrix);
```

### 8.4.3 矩阵运算示例

```typescript
/**
 * 矩阵运算示例
 */

// 创建变换矩阵
function createTransformMatrix(
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    rotation: number,
    pivotX: number = 0,
    pivotY: number = 0
): PIXI.Matrix {
    const matrix = new PIXI.Matrix();
    
    // 移动到 pivot
    matrix.translate(-pivotX, -pivotY);
    
    // 缩放
    matrix.scale(scaleX, scaleY);
    
    // 旋转
    matrix.rotate(rotation);
    
    // 移动到最终位置
    matrix.translate(x, y);
    
    return matrix;
}

// 使用
const matrix = createTransformMatrix(100, 100, 2, 2, Math.PI / 4, 50, 50);
const transformedPoint = matrix.apply(new PIXI.Point(0, 0));


// 组合多个变换
function combineTransforms(transforms: PIXI.Matrix[]): PIXI.Matrix {
    const result = new PIXI.Matrix();
    
    for (const transform of transforms) {
        result.append(transform);
    }
    
    return result;
}


// 从矩阵提取变换参数
function decomposeMatrix(matrix: PIXI.Matrix) {
    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    const rotation = Math.atan2(b, a);
    
    return {
        x: matrix.tx,
        y: matrix.ty,
        scaleX,
        scaleY,
        rotation
    };
}
```

---

## 8.5 本地与世界变换

### 8.5.1 坐标系统

```
本地坐标 vs 世界坐标

世界坐标系：
┌─────────────────────────────────────────────────────┐
│ (0,0)                                               │
│   ┌─────────────────────────────────────┐           │
│   │ Parent (100, 100)                   │           │
│   │   ┌─────────────────────────┐       │           │
│   │   │ Child (50, 50)          │       │           │
│   │   │                         │       │           │
│   │   │  本地坐标: (50, 50)     │       │           │
│   │   │  世界坐标: (150, 150)   │       │           │
│   │   └─────────────────────────┘       │           │
│   └─────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘


localTransform: 相对于父级的变换
worldTransform: 相对于舞台的变换

worldTransform = parent.worldTransform × localTransform
```

### 8.5.2 坐标转换

```typescript
/**
 * 坐标转换
 */

// 本地坐标 → 世界坐标
const worldPoint = sprite.toGlobal(new PIXI.Point(0, 0));

// 世界坐标 → 本地坐标
const localPoint = sprite.toLocal(new PIXI.Point(100, 100));

// 从一个对象的坐标系转换到另一个对象的坐标系
const pointInB = objectA.toLocal(point, objectB);


// 使用矩阵转换
function localToWorld(sprite: PIXI.DisplayObject, localPoint: PIXI.Point): PIXI.Point {
    sprite.updateTransform();
    return sprite.worldTransform.apply(localPoint);
}

function worldToLocal(sprite: PIXI.DisplayObject, worldPoint: PIXI.Point): PIXI.Point {
    sprite.updateTransform();
    return sprite.worldTransform.applyInverse(worldPoint);
}


// 获取对象在世界坐标系中的位置
function getWorldPosition(obj: PIXI.DisplayObject): PIXI.Point {
    return obj.toGlobal(new PIXI.Point(0, 0));
}

// 获取对象在世界坐标系中的旋转
function getWorldRotation(obj: PIXI.DisplayObject): number {
    let rotation = 0;
    let current: PIXI.DisplayObject | null = obj;
    
    while (current) {
        rotation += current.rotation;
        current = current.parent;
    }
    
    return rotation;
}

// 获取对象在世界坐标系中的缩放
function getWorldScale(obj: PIXI.DisplayObject): PIXI.Point {
    const scale = new PIXI.Point(1, 1);
    let current: PIXI.DisplayObject | null = obj;
    
    while (current) {
        scale.x *= current.scale.x;
        scale.y *= current.scale.y;
        current = current.parent;
    }
    
    return scale;
}
```

---

## 8.6 变换继承

### 8.6.1 父子变换关系

```typescript
/**
 * 父子变换关系
 */

const parent = new PIXI.Container();
parent.position.set(100, 100);
parent.scale.set(2);
parent.rotation = Math.PI / 4;

const child = new PIXI.Sprite(texture);
child.position.set(50, 50);

parent.addChild(child);
app.stage.addChild(parent);


/*
变换继承：

子对象的世界变换 = 父对象的世界变换 × 子对象的本地变换

child 的最终效果：
1. 先应用 child 的本地变换 (50, 50)
2. 再应用 parent 的变换 (缩放2倍, 旋转45°, 移动到100,100)

最终世界位置 ≠ (150, 150)
因为还要考虑父级的缩放和旋转
*/


// 计算子对象的世界位置
child.updateTransform();
const worldPos = child.worldTransform.apply(new PIXI.Point(0, 0));
console.log('世界位置:', worldPos);
```

### 8.6.2 保持世界位置不变

```typescript
/**
 * 保持世界位置不变
 */

// 场景：将对象从一个容器移动到另一个容器，保持视觉位置不变
function reparent(
    child: PIXI.DisplayObject,
    newParent: PIXI.Container
) {
    // 获取当前世界位置
    const worldPos = child.toGlobal(new PIXI.Point(0, 0));
    
    // 计算在新父容器中的本地位置
    const newLocalPos = newParent.toLocal(worldPos);
    
    // 移动到新父容器
    newParent.addChild(child);
    
    // 设置新的本地位置
    child.position.copyFrom(newLocalPos);
}

// 更完整的版本（保持旋转和缩放）
function reparentWithTransform(
    child: PIXI.DisplayObject,
    newParent: PIXI.Container
) {
    // 保存世界变换
    child.updateTransform();
    const worldMatrix = child.worldTransform.clone();
    
    // 移动到新父容器
    newParent.addChild(child);
    
    // 计算新的本地变换
    newParent.updateTransform();
    const parentInverse = newParent.worldTransform.clone().invert();
    const newLocalMatrix = parentInverse.append(worldMatrix);
    
    // 从矩阵提取变换参数并应用
    const decomposed = decomposeMatrix(newLocalMatrix);
    child.position.set(decomposed.x, decomposed.y);
    child.scale.set(decomposed.scaleX, decomposed.scaleY);
    child.rotation = decomposed.rotation;
}
```

---

## 8.7 实用技巧

### 8.7.1 围绕任意点旋转

```typescript
/**
 * 围绕任意点旋转
 */

// 方法1：使用 pivot
function rotateAroundPoint(
    obj: PIXI.DisplayObject,
    pointX: number,
    pointY: number,
    angle: number
) {
    // 将 pivot 设置为旋转点（相对于对象）
    obj.pivot.set(pointX - obj.x, pointY - obj.y);
    
    // 调整位置以补偿 pivot 的改变
    obj.position.set(pointX, pointY);
    
    // 旋转
    obj.rotation = angle;
}


// 方法2：使用矩阵
function rotateAroundPointMatrix(
    obj: PIXI.DisplayObject,
    pivotX: number,
    pivotY: number,
    angle: number
) {
    // 创建旋转矩阵
    const matrix = new PIXI.Matrix();
    
    // 移动到原点
    matrix.translate(-pivotX, -pivotY);
    
    // 旋转
    matrix.rotate(angle);
    
    // 移回原位
    matrix.translate(pivotX, pivotY);
    
    // 应用到对象位置
    const newPos = matrix.apply(new PIXI.Point(obj.x, obj.y));
    obj.position.copyFrom(newPos);
    obj.rotation += angle;
}


// 方法3：数学计算
function rotateAroundPointMath(
    obj: PIXI.DisplayObject,
    pivotX: number,
    pivotY: number,
    angle: number
) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const dx = obj.x - pivotX;
    const dy = obj.y - pivotY;
    
    obj.x = pivotX + dx * cos - dy * sin;
    obj.y = pivotY + dx * sin + dy * cos;
    obj.rotation += angle;
}
```

### 8.7.2 围绕任意点缩放

```typescript
/**
 * 围绕任意点缩放
 */

function scaleAroundPoint(
    obj: PIXI.DisplayObject,
    pivotX: number,
    pivotY: number,
    scaleX: number,
    scaleY: number
) {
    // 计算相对位置
    const dx = obj.x - pivotX;
    const dy = obj.y - pivotY;
    
    // 缩放相对位置
    obj.x = pivotX + dx * scaleX;
    obj.y = pivotY + dy * scaleY;
    
    // 缩放对象
    obj.scale.x *= scaleX;
    obj.scale.y *= scaleY;
}


// 使用场景：鼠标滚轮缩放（以鼠标位置为中心）
function zoomAtPoint(
    container: PIXI.Container,
    pointX: number,
    pointY: number,
    scaleFactor: number
) {
    // 获取缩放前鼠标在容器中的位置
    const beforePos = container.toLocal(new PIXI.Point(pointX, pointY));
    
    // 缩放
    container.scale.x *= scaleFactor;
    container.scale.y *= scaleFactor;
    
    // 获取缩放后鼠标在容器中的位置
    const afterPos = container.toLocal(new PIXI.Point(pointX, pointY));
    
    // 调整位置以保持鼠标位置不变
    container.x += (afterPos.x - beforePos.x) * container.scale.x;
    container.y += (afterPos.y - beforePos.y) * container.scale.y;
}
```

### 8.7.3 对齐与分布

```typescript
/**
 * 对齐与分布
 */

// 水平居中对齐
function alignCenterX(objects: PIXI.DisplayObject[], containerWidth: number) {
    for (const obj of objects) {
        obj.x = (containerWidth - obj.width) / 2;
    }
}

// 垂直居中对齐
function alignCenterY(objects: PIXI.DisplayObject[], containerHeight: number) {
    for (const obj of objects) {
        obj.y = (containerHeight - obj.height) / 2;
    }
}

// 水平等距分布
function distributeHorizontally(
    objects: PIXI.DisplayObject[],
    startX: number,
    endX: number
) {
    if (objects.length < 2) return;
    
    const totalWidth = objects.reduce((sum, obj) => sum + obj.width, 0);
    const gap = (endX - startX - totalWidth) / (objects.length - 1);
    
    let currentX = startX;
    for (const obj of objects) {
        obj.x = currentX;
        currentX += obj.width + gap;
    }
}

// 网格布局
function layoutGrid(
    objects: PIXI.DisplayObject[],
    columns: number,
    cellWidth: number,
    cellHeight: number,
    gap: number = 0
) {
    objects.forEach((obj, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        obj.x = col * (cellWidth + gap);
        obj.y = row * (cellHeight + gap);
    });
}
```

### 8.7.4 平滑插值

```typescript
/**
 * 平滑插值
 */

// 线性插值
function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

// 平滑移动
function smoothMove(
    obj: PIXI.DisplayObject,
    targetX: number,
    targetY: number,
    smoothing: number = 0.1
) {
    obj.x = lerp(obj.x, targetX, smoothing);
    obj.y = lerp(obj.y, targetY, smoothing);
}

// 平滑旋转
function smoothRotate(
    obj: PIXI.DisplayObject,
    targetRotation: number,
    smoothing: number = 0.1
) {
    // 处理角度环绕
    let diff = targetRotation - obj.rotation;
    
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    obj.rotation += diff * smoothing;
}

// 平滑缩放
function smoothScale(
    obj: PIXI.DisplayObject,
    targetScale: number,
    smoothing: number = 0.1
) {
    obj.scale.x = lerp(obj.scale.x, targetScale, smoothing);
    obj.scale.y = lerp(obj.scale.y, targetScale, smoothing);
}


// 使用示例：跟随鼠标
app.ticker.add(() => {
    smoothMove(sprite, mouseX, mouseY, 0.1);
});
```

---

## 8.8 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **position** | 位置 (x, y) |
| **scale** | 缩放 |
| **rotation** | 旋转（弧度） |
| **pivot** | 旋转/缩放中心点 |
| **skew** | 倾斜 |
| **localTransform** | 本地变换矩阵 |
| **worldTransform** | 世界变换矩阵 |
| **Matrix** | 2D 仿射变换矩阵 |

### 关键代码

```typescript
// 基本变换
sprite.position.set(100, 100);
sprite.scale.set(2);
sprite.rotation = Math.PI / 4;
sprite.pivot.set(50, 50);

// 坐标转换
const worldPos = sprite.toGlobal(new PIXI.Point(0, 0));
const localPos = sprite.toLocal(worldPos);

// 矩阵操作
const matrix = new PIXI.Matrix();
matrix.translate(100, 100);
matrix.rotate(Math.PI / 4);
matrix.scale(2, 2);
const point = matrix.apply(new PIXI.Point(0, 0));

// 围绕点旋转
sprite.pivot.set(pivotX, pivotY);
sprite.position.set(pivotX, pivotY);
sprite.rotation = angle;
```

---

## 8.9 练习题

### 基础练习

1. 实现一个围绕中心旋转的精灵

2. 实现鼠标滚轮缩放（以鼠标位置为中心）

3. 实现对象的平滑跟随

### 进阶练习

4. 实现一个简单的变换编辑器（拖拽、旋转、缩放）

5. 实现对象的对齐和分布功能

### 挑战练习

6. 实现一个完整的画布变换系统（平移、缩放、旋转）

---

**下一章预告**：在第9章中，我们将深入学习交互与事件系统。

---

**文档版本**：v1.0  
**字数统计**：约 10,000 字  
**代码示例**：40+ 个
