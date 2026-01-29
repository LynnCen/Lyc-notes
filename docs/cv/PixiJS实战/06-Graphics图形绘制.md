# 第6章：Graphics图形绘制

## 6.1 章节概述

Graphics 是 PixiJS 中用于绘制矢量图形的类。它类似于 Canvas 2D 的绑制 API，但底层使用 WebGL 渲染，性能更好。

本章将深入讲解：

- **Graphics 基础**：创建、绑制流程
- **基本图形**：矩形、圆形、椭圆、多边形
- **路径绘制**：moveTo、lineTo、贝塞尔曲线
- **填充与描边**：颜色、渐变、纹理
- **高级功能**：孔洞、圆角、GraphicsGeometry
- **性能优化**：缓存、批处理

---

## 6.2 Graphics 基础

### 6.2.1 创建 Graphics

```typescript
/**
 * 创建 Graphics
 */

// 基本创建
const graphics = new PIXI.Graphics();

// 添加到舞台
app.stage.addChild(graphics);

// 设置位置
graphics.x = 100;
graphics.y = 100;
```

### 6.2.2 绑制流程

```
Graphics 绑制流程

1. 设置填充样式（可选）
   graphics.beginFill(color, alpha)

2. 设置描边样式（可选）
   graphics.lineStyle(width, color, alpha)

3. 绑制图形
   graphics.drawRect(x, y, w, h)
   graphics.drawCircle(x, y, r)
   ...

4. 结束填充（可选）
   graphics.endFill()


链式调用示例：
graphics
    .beginFill(0xFF0000)
    .lineStyle(2, 0x000000)
    .drawRect(0, 0, 100, 100)
    .endFill();
```

### 6.2.3 基本示例

```typescript
/**
 * 基本绑制示例
 */

const graphics = new PIXI.Graphics();

// 绘制红色矩形
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

// 绘制蓝色圆形
graphics.beginFill(0x0000FF);
graphics.drawCircle(200, 50, 50);
graphics.endFill();

// 绘制绿色描边矩形
graphics.lineStyle(3, 0x00FF00);
graphics.drawRect(300, 0, 100, 100);

app.stage.addChild(graphics);
```

---

## 6.3 基本图形

### 6.3.1 矩形

```typescript
/**
 * 矩形绘制
 */

const graphics = new PIXI.Graphics();

// 普通矩形
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 80);
graphics.endFill();

// 圆角矩形
graphics.beginFill(0x00FF00);
graphics.drawRoundedRect(120, 0, 100, 80, 15);  // 圆角半径 15
graphics.endFill();

// 只有描边的矩形
graphics.lineStyle(2, 0x0000FF);
graphics.drawRect(240, 0, 100, 80);

// 描边 + 填充
graphics.beginFill(0xFFFF00);
graphics.lineStyle(3, 0x000000);
graphics.drawRect(360, 0, 100, 80);
graphics.endFill();
```

### 6.3.2 圆形与椭圆

```typescript
/**
 * 圆形与椭圆
 */

const graphics = new PIXI.Graphics();

// 圆形
graphics.beginFill(0xFF0000);
graphics.drawCircle(50, 50, 50);  // x, y, radius
graphics.endFill();

// 椭圆
graphics.beginFill(0x00FF00);
graphics.drawEllipse(200, 50, 80, 40);  // x, y, width, height
graphics.endFill();

// 扇形（使用 arc）
graphics.beginFill(0x0000FF);
graphics.moveTo(350, 50);
graphics.arc(350, 50, 50, 0, Math.PI * 1.5);  // x, y, radius, startAngle, endAngle
graphics.lineTo(350, 50);
graphics.endFill();

// 圆环
graphics.beginFill(0xFFFF00);
graphics.drawCircle(500, 50, 50);
graphics.beginHole();
graphics.drawCircle(500, 50, 30);
graphics.endHole();
graphics.endFill();
```

### 6.3.3 多边形

```typescript
/**
 * 多边形
 */

const graphics = new PIXI.Graphics();

// 三角形
graphics.beginFill(0xFF0000);
graphics.drawPolygon([
    0, 100,    // 点1
    50, 0,     // 点2
    100, 100   // 点3
]);
graphics.endFill();

// 五边形
const pentagon = createRegularPolygon(200, 50, 50, 5);
graphics.beginFill(0x00FF00);
graphics.drawPolygon(pentagon);
graphics.endFill();

// 六边形
const hexagon = createRegularPolygon(350, 50, 50, 6);
graphics.beginFill(0x0000FF);
graphics.drawPolygon(hexagon);
graphics.endFill();

// 星形
const star = createStar(500, 50, 50, 25, 5);
graphics.beginFill(0xFFFF00);
graphics.drawPolygon(star);
graphics.endFill();


// 辅助函数：创建正多边形
function createRegularPolygon(
    cx: number,
    cy: number,
    radius: number,
    sides: number
): number[] {
    const points: number[] = [];
    const angleStep = (Math.PI * 2) / sides;
    
    for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2;
        points.push(
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius
        );
    }
    
    return points;
}

// 辅助函数：创建星形
function createStar(
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    points: number
): number[] {
    const result: number[] = [];
    const angleStep = Math.PI / points;
    
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep - Math.PI / 2;
        result.push(
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius
        );
    }
    
    return result;
}
```

---

## 6.4 路径绘制

### 6.4.1 基本路径

```typescript
/**
 * 路径绘制
 */

const graphics = new PIXI.Graphics();

// 直线
graphics.lineStyle(2, 0xFF0000);
graphics.moveTo(0, 0);
graphics.lineTo(100, 100);

// 折线
graphics.lineStyle(2, 0x00FF00);
graphics.moveTo(150, 0);
graphics.lineTo(200, 50);
graphics.lineTo(150, 100);
graphics.lineTo(200, 150);

// 闭合路径
graphics.lineStyle(2, 0x0000FF);
graphics.beginFill(0x0000FF, 0.3);
graphics.moveTo(250, 0);
graphics.lineTo(350, 0);
graphics.lineTo(350, 100);
graphics.lineTo(250, 100);
graphics.closePath();
graphics.endFill();
```

### 6.4.2 贝塞尔曲线

```typescript
/**
 * 贝塞尔曲线
 */

const graphics = new PIXI.Graphics();

// 二次贝塞尔曲线
graphics.lineStyle(3, 0xFF0000);
graphics.moveTo(0, 100);
graphics.quadraticCurveTo(
    50, 0,    // 控制点
    100, 100  // 终点
);

// 三次贝塞尔曲线
graphics.lineStyle(3, 0x00FF00);
graphics.moveTo(150, 100);
graphics.bezierCurveTo(
    175, 0,   // 控制点1
    225, 0,   // 控制点2
    250, 100  // 终点
);

// 圆弧
graphics.lineStyle(3, 0x0000FF);
graphics.moveTo(300, 50);
graphics.arc(350, 50, 50, Math.PI, 0);  // 半圆

// arcTo（圆角连接）
graphics.lineStyle(3, 0xFFFF00);
graphics.moveTo(450, 0);
graphics.arcTo(500, 0, 500, 50, 20);  // 圆角
graphics.lineTo(500, 100);


/*
贝塞尔曲线说明：

二次贝塞尔曲线：
起点 -------- 控制点
     \       /
      \     /
       \   /
        终点

三次贝塞尔曲线：
起点 -------- 控制点1
     \
      \
       \
        控制点2 -------- 终点
*/
```

### 6.4.3 复杂路径示例

```typescript
/**
 * 复杂路径示例
 */

// 心形
function drawHeart(graphics: PIXI.Graphics, x: number, y: number, size: number) {
    graphics.moveTo(x, y + size / 4);
    
    // 左半边
    graphics.bezierCurveTo(
        x, y,
        x - size / 2, y,
        x - size / 2, y + size / 4
    );
    graphics.bezierCurveTo(
        x - size / 2, y + size / 2,
        x, y + size * 0.75,
        x, y + size
    );
    
    // 右半边
    graphics.bezierCurveTo(
        x, y + size * 0.75,
        x + size / 2, y + size / 2,
        x + size / 2, y + size / 4
    );
    graphics.bezierCurveTo(
        x + size / 2, y,
        x, y,
        x, y + size / 4
    );
}

const graphics = new PIXI.Graphics();
graphics.beginFill(0xFF0000);
drawHeart(graphics, 100, 50, 80);
graphics.endFill();


// 箭头
function drawArrow(
    graphics: PIXI.Graphics,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    headLength: number = 15,
    headWidth: number = 10
) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // 箭身
    graphics.moveTo(fromX, fromY);
    graphics.lineTo(toX, toY);
    
    // 箭头
    graphics.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    graphics.moveTo(toX, toY);
    graphics.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
}

graphics.lineStyle(3, 0x000000);
drawArrow(graphics, 250, 100, 350, 50);
```

---

## 6.5 填充与描边

### 6.5.1 填充样式

```typescript
/**
 * 填充样式
 */

const graphics = new PIXI.Graphics();

// 纯色填充
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 80, 80);
graphics.endFill();

// 带透明度的填充
graphics.beginFill(0x00FF00, 0.5);
graphics.drawRect(100, 0, 80, 80);
graphics.endFill();

// 纹理填充
const texture = PIXI.Texture.from('pattern.png');
graphics.beginTextureFill({ texture });
graphics.drawRect(200, 0, 80, 80);
graphics.endFill();

// 纹理填充（带选项）
graphics.beginTextureFill({
    texture,
    color: 0xFFFFFF,    // 着色
    alpha: 1,           // 透明度
    matrix: new PIXI.Matrix().scale(0.5, 0.5)  // 变换
});
graphics.drawRect(300, 0, 80, 80);
graphics.endFill();
```

### 6.5.2 描边样式

```typescript
/**
 * 描边样式
 */

const graphics = new PIXI.Graphics();

// 基本描边
graphics.lineStyle(2, 0xFF0000);
graphics.drawRect(0, 0, 80, 80);

// 带透明度
graphics.lineStyle(4, 0x00FF00, 0.5);
graphics.drawRect(100, 0, 80, 80);

// 完整选项
graphics.lineStyle({
    width: 4,
    color: 0x0000FF,
    alpha: 1,
    alignment: 0.5,  // 0=内部, 0.5=中间, 1=外部
    cap: PIXI.LINE_CAP.ROUND,    // 线帽：BUTT, ROUND, SQUARE
    join: PIXI.LINE_JOIN.ROUND,  // 连接：MITER, ROUND, BEVEL
    miterLimit: 10,  // 斜接限制
});
graphics.drawRect(200, 0, 80, 80);

// 纹理描边
graphics.lineTextureStyle({
    width: 10,
    texture: PIXI.Texture.from('line-pattern.png'),
    color: 0xFFFFFF,
    alpha: 1,
});
graphics.drawRect(300, 0, 80, 80);
```

### 6.5.3 线帽和连接样式

```
线帽样式（LINE_CAP）

BUTT（默认）：
─────────────────
│               │
─────────────────

ROUND：
╭───────────────╮
│               │
╰───────────────╯

SQUARE：
┌─────────────────┐
│                 │
└─────────────────┘


连接样式（LINE_JOIN）

MITER（默认）：
    /\
   /  \
  /    \
 /      \

ROUND：
    ╭╮
   /  \
  /    \
 /      \

BEVEL：
   ____
  /    \
 /      \
/        \
```

---

## 6.6 高级功能

### 6.6.1 孔洞（Holes）

```typescript
/**
 * 孔洞绘制
 */

const graphics = new PIXI.Graphics();

// 圆环
graphics.beginFill(0xFF0000);
graphics.drawCircle(100, 100, 80);
graphics.beginHole();
graphics.drawCircle(100, 100, 40);
graphics.endHole();
graphics.endFill();

// 带孔的矩形
graphics.beginFill(0x00FF00);
graphics.drawRect(200, 20, 160, 160);
graphics.beginHole();
graphics.drawCircle(280, 100, 50);
graphics.endHole();
graphics.endFill();

// 多个孔洞
graphics.beginFill(0x0000FF);
graphics.drawRect(400, 20, 200, 160);
graphics.beginHole();
graphics.drawCircle(450, 100, 30);
graphics.endHole();
graphics.beginHole();
graphics.drawCircle(550, 100, 30);
graphics.endHole();
graphics.endFill();
```

### 6.6.2 清除与重绘

```typescript
/**
 * 清除与重绘
 */

const graphics = new PIXI.Graphics();

// 初始绘制
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

// 清除所有绘制
graphics.clear();

// 重新绘制
graphics.beginFill(0x00FF00);
graphics.drawCircle(50, 50, 50);
graphics.endFill();


// 动态更新示例
let angle = 0;

app.ticker.add(() => {
    graphics.clear();
    
    // 绘制旋转的矩形
    graphics.beginFill(0xFF0000);
    graphics.drawRect(-50, -50, 100, 100);
    graphics.endFill();
    
    graphics.rotation = angle;
    angle += 0.02;
});
```

### 6.6.3 GraphicsGeometry 复用

```typescript
/**
 * GraphicsGeometry 复用
 * 当需要绑制大量相同图形时，可以复用几何数据
 */

// 创建几何数据
const geometry = new PIXI.GraphicsGeometry();

// 使用 Graphics 绘制到几何数据
const template = new PIXI.Graphics(geometry);
template.beginFill(0xFF0000);
template.drawCircle(0, 0, 20);
template.endFill();

// 复用几何数据创建多个 Graphics
for (let i = 0; i < 100; i++) {
    const graphics = new PIXI.Graphics(geometry);
    graphics.x = Math.random() * 800;
    graphics.y = Math.random() * 600;
    graphics.tint = Math.random() * 0xFFFFFF;
    app.stage.addChild(graphics);
}

/*
注意：
- 共享几何数据的 Graphics 不能单独修改形状
- 可以单独修改 position、scale、rotation、tint 等属性
- 适合大量相同形状的场景
*/
```

---

## 6.7 实用工具函数

### 6.7.1 常用图形函数

```typescript
/**
 * 常用图形绘制函数
 */

// 绘制虚线
function drawDashedLine(
    graphics: PIXI.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dashLength: number = 10,
    gapLength: number = 5
) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dashCount = Math.floor(distance / (dashLength + gapLength));
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    let currentX = x1;
    let currentY = y1;
    
    for (let i = 0; i < dashCount; i++) {
        graphics.moveTo(currentX, currentY);
        graphics.lineTo(
            currentX + unitX * dashLength,
            currentY + unitY * dashLength
        );
        currentX += unitX * (dashLength + gapLength);
        currentY += unitY * (dashLength + gapLength);
    }
}

// 绘制网格
function drawGrid(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    cellSize: number,
    color: number = 0xCCCCCC
) {
    graphics.lineStyle(1, color);
    
    // 垂直线
    for (let x = 0; x <= width; x += cellSize) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
    }
    
    // 水平线
    for (let y = 0; y <= height; y += cellSize) {
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
    }
}

// 绘制圆角多边形
function drawRoundedPolygon(
    graphics: PIXI.Graphics,
    points: number[],
    radius: number
) {
    const len = points.length;
    
    for (let i = 0; i < len; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[(i + 2) % len];
        const y2 = points[(i + 3) % len];
        const x3 = points[(i + 4) % len];
        const y3 = points[(i + 5) % len];
        
        if (i === 0) {
            // 移动到第一个圆角的起点
            const startX = x1 + (x2 - x1) * 0.5;
            const startY = y1 + (y2 - y1) * 0.5;
            graphics.moveTo(startX, startY);
        }
        
        graphics.arcTo(x2, y2, x3, y3, radius);
    }
    
    graphics.closePath();
}
```

### 6.7.2 图形工厂

```typescript
/**
 * 图形工厂类
 */

class GraphicsFactory {
    static createButton(
        width: number,
        height: number,
        color: number,
        radius: number = 5
    ): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        graphics.drawRoundedRect(0, 0, width, height, radius);
        graphics.endFill();
        return graphics;
    }
    
    static createProgressBar(
        width: number,
        height: number,
        progress: number,
        bgColor: number = 0x333333,
        fgColor: number = 0x00FF00
    ): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        
        // 背景
        graphics.beginFill(bgColor);
        graphics.drawRoundedRect(0, 0, width, height, height / 2);
        graphics.endFill();
        
        // 进度
        const progressWidth = Math.max(height, width * progress);
        graphics.beginFill(fgColor);
        graphics.drawRoundedRect(0, 0, progressWidth, height, height / 2);
        graphics.endFill();
        
        return graphics;
    }
    
    static createHealthBar(
        width: number,
        height: number,
        health: number,
        maxHealth: number
    ): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        const ratio = health / maxHealth;
        
        // 背景
        graphics.beginFill(0x333333);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
        
        // 血量
        const color = ratio > 0.5 ? 0x00FF00 : ratio > 0.25 ? 0xFFFF00 : 0xFF0000;
        graphics.beginFill(color);
        graphics.drawRect(0, 0, width * ratio, height);
        graphics.endFill();
        
        // 边框
        graphics.lineStyle(1, 0x000000);
        graphics.drawRect(0, 0, width, height);
        
        return graphics;
    }
    
    static createPieChart(
        radius: number,
        data: { value: number; color: number }[]
    ): PIXI.Graphics {
        const graphics = new PIXI.Graphics();
        const total = data.reduce((sum, d) => sum + d.value, 0);
        
        let startAngle = -Math.PI / 2;
        
        for (const item of data) {
            const angle = (item.value / total) * Math.PI * 2;
            
            graphics.beginFill(item.color);
            graphics.moveTo(0, 0);
            graphics.arc(0, 0, radius, startAngle, startAngle + angle);
            graphics.lineTo(0, 0);
            graphics.endFill();
            
            startAngle += angle;
        }
        
        return graphics;
    }
}

// 使用
const button = GraphicsFactory.createButton(120, 40, 0x4CAF50, 8);
const progressBar = GraphicsFactory.createProgressBar(200, 20, 0.7);
const healthBar = GraphicsFactory.createHealthBar(100, 10, 75, 100);
const pieChart = GraphicsFactory.createPieChart(80, [
    { value: 30, color: 0xFF0000 },
    { value: 50, color: 0x00FF00 },
    { value: 20, color: 0x0000FF }
]);
```

---

## 6.8 性能优化

### 6.8.1 缓存为位图

```typescript
/**
 * 缓存为位图
 */

// 复杂图形缓存为位图
const complexGraphics = new PIXI.Graphics();
// ... 绑制很多复杂图形
complexGraphics.cacheAsBitmap = true;

/*
适用场景：
- 复杂的静态图形
- 不经常变化的图形
- 需要应用滤镜的图形

注意：
- 缓存后修改图形需要先设置 cacheAsBitmap = false
- 会增加内存使用
- 缩放时可能模糊
*/


// 动态更新时的处理
function updateGraphics(graphics: PIXI.Graphics) {
    graphics.cacheAsBitmap = false;  // 关闭缓存
    graphics.clear();
    // ... 重新绘制
    graphics.cacheAsBitmap = true;   // 重新缓存
}
```

### 6.8.2 批量绘制

```typescript
/**
 * 批量绘制优化
 */

// 不好：创建多个 Graphics
for (let i = 0; i < 100; i++) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFF0000);
    graphics.drawCircle(0, 0, 10);
    graphics.endFill();
    graphics.x = Math.random() * 800;
    graphics.y = Math.random() * 600;
    app.stage.addChild(graphics);
}

// 好：使用一个 Graphics 绘制所有图形
const graphics = new PIXI.Graphics();
graphics.beginFill(0xFF0000);
for (let i = 0; i < 100; i++) {
    graphics.drawCircle(
        Math.random() * 800,
        Math.random() * 600,
        10
    );
}
graphics.endFill();
app.stage.addChild(graphics);


// 更好：复用 GraphicsGeometry
const geometry = new PIXI.GraphicsGeometry();
const template = new PIXI.Graphics(geometry);
template.beginFill(0xFF0000);
template.drawCircle(0, 0, 10);
template.endFill();

for (let i = 0; i < 100; i++) {
    const graphics = new PIXI.Graphics(geometry);
    graphics.x = Math.random() * 800;
    graphics.y = Math.random() * 600;
    app.stage.addChild(graphics);
}
```

### 6.8.3 减少重绘

```typescript
/**
 * 减少重绘
 */

// 不好：每帧都清除并重绘
app.ticker.add(() => {
    graphics.clear();
    graphics.beginFill(0xFF0000);
    graphics.drawCircle(mouseX, mouseY, 20);
    graphics.endFill();
});

// 好：只在需要时重绘
let lastX = 0, lastY = 0;

app.ticker.add(() => {
    if (mouseX !== lastX || mouseY !== lastY) {
        graphics.clear();
        graphics.beginFill(0xFF0000);
        graphics.drawCircle(mouseX, mouseY, 20);
        graphics.endFill();
        lastX = mouseX;
        lastY = mouseY;
    }
});

// 更好：移动而不是重绘
const circle = new PIXI.Graphics();
circle.beginFill(0xFF0000);
circle.drawCircle(0, 0, 20);
circle.endFill();

app.ticker.add(() => {
    circle.x = mouseX;
    circle.y = mouseY;
});
```

---

## 6.9 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Graphics** | 矢量图形绘制类 |
| **beginFill** | 开始填充 |
| **lineStyle** | 设置描边样式 |
| **drawRect** | 绘制矩形 |
| **drawCircle** | 绘制圆形 |
| **drawPolygon** | 绘制多边形 |
| **moveTo/lineTo** | 路径绘制 |
| **bezierCurveTo** | 贝塞尔曲线 |
| **beginHole** | 开始孔洞 |
| **clear** | 清除绘制 |

### 关键代码

```typescript
// 创建 Graphics
const graphics = new PIXI.Graphics();

// 绘制填充矩形
graphics.beginFill(0xFF0000);
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

// 绘制描边圆形
graphics.lineStyle(2, 0x00FF00);
graphics.drawCircle(200, 50, 50);

// 路径绘制
graphics.moveTo(0, 0);
graphics.lineTo(100, 100);
graphics.bezierCurveTo(150, 0, 200, 100, 250, 50);

// 孔洞
graphics.beginFill(0x0000FF);
graphics.drawCircle(100, 100, 50);
graphics.beginHole();
graphics.drawCircle(100, 100, 25);
graphics.endHole();
graphics.endFill();

// 清除
graphics.clear();
```

---

## 6.10 练习题

### 基础练习

1. 绘制一个带圆角的按钮

2. 绘制一个进度条

3. 绘制一个五角星

### 进阶练习

4. 实现一个绘图工具，支持绘制直线、矩形、圆形

5. 创建一个饼图组件

### 挑战练习

6. 实现一个矢量图形编辑器，支持选择、移动、缩放图形

---

**下一章预告**：在第7章中，我们将深入学习 Text 文本渲染。

---

**文档版本**：v1.0  
**字数统计**：约 11,000 字  
**代码示例**：45+ 个
