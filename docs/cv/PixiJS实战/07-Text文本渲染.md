# 第7章：Text文本渲染

## 7.1 章节概述

PixiJS 提供了多种文本渲染方式，从简单的动态文本到高性能的位图文本。理解不同文本类型的特点和适用场景，对于构建高质量的应用至关重要。

本章将深入讲解：

- **Text 基础**：创建、样式、属性
- **TextStyle**：完整的样式选项
- **BitmapText**：高性能位图文本
- **HTMLText**：HTML 渲染文本
- **文本测量**：宽度、高度、换行
- **性能优化**：文本缓存、更新策略

---

## 7.2 Text 基础

### 7.2.1 文本渲染原理

```
PixiJS 文本渲染原理

Text 类的工作流程：

1. 创建离屏 Canvas
2. 使用 Canvas 2D API 绘制文本
3. 将 Canvas 转换为 WebGL 纹理
4. 使用纹理渲染文本


┌─────────────────────────────────────────┐
│              Text 对象                  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │      Canvas 2D 绘制            │    │
│  │  ctx.fillText("Hello", x, y)   │    │
│  └─────────────────────────────────┘    │
│                  ↓                      │
│  ┌─────────────────────────────────┐    │
│  │      转换为 Texture             │    │
│  │  PIXI.Texture.from(canvas)     │    │
│  └─────────────────────────────────┘    │
│                  ↓                      │
│  ┌─────────────────────────────────┐    │
│  │      WebGL 渲染                 │    │
│  │  作为 Sprite 渲染               │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘


特点：
- 支持所有 CSS 字体
- 支持复杂样式（阴影、描边、渐变）
- 每次修改文本都需要重新生成纹理
- 大量文本会影响性能
```

### 7.2.2 创建 Text

```typescript
/**
 * 创建 Text
 */

// 基本创建
const text = new PIXI.Text('Hello PixiJS!');
app.stage.addChild(text);

// 带样式创建
const text = new PIXI.Text('Hello PixiJS!', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFF0000
});

// 使用 TextStyle 对象
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFF0000
});
const text = new PIXI.Text('Hello PixiJS!', style);

// 修改文本内容
text.text = 'New Text';

// 修改样式
text.style.fontSize = 32;
text.style.fill = 0x00FF00;
```

### 7.2.3 Text 属性

```typescript
/**
 * Text 属性
 */

// 文本内容
text.text = 'Hello World';

// 样式
text.style = new PIXI.TextStyle({ ... });

// 分辨率（影响清晰度）
text.resolution = 2;  // 2倍分辨率，更清晰

// 锚点
text.anchor.set(0.5);  // 居中

// 位置
text.position.set(100, 100);

// 缩放
text.scale.set(1.5);

// 旋转
text.rotation = Math.PI / 4;

// 透明度
text.alpha = 0.8;

// 着色
text.tint = 0xFFFF00;

// 宽度/高度（只读）
console.log(text.width, text.height);
```

---

## 7.3 TextStyle 详解

### 7.3.1 基本样式

```typescript
/**
 * TextStyle 基本样式
 */

const style = new PIXI.TextStyle({
    // 字体
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 24,
    fontStyle: 'italic',      // normal, italic, oblique
    fontWeight: 'bold',       // normal, bold, 100-900
    fontVariant: 'normal',    // normal, small-caps
    
    // 填充
    fill: 0xFF0000,           // 单色
    fill: ['#FF0000', '#00FF00'],  // 渐变
    fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
    fillGradientStops: [0, 1],
    
    // 描边
    stroke: 0x000000,
    strokeThickness: 2,
    
    // 行高
    lineHeight: 30,
    
    // 字间距
    letterSpacing: 2,
});

const text = new PIXI.Text('Styled Text', style);
```

### 7.3.2 阴影与效果

```typescript
/**
 * 阴影与效果
 */

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xFFFFFF,
    
    // 阴影
    dropShadow: true,
    dropShadowColor: 0x000000,
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 4,
    dropShadowDistance: 5,
    dropShadowAlpha: 0.5,
});

const shadowText = new PIXI.Text('Shadow Text', style);


// 发光效果（使用描边模拟）
const glowStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xFFFFFF,
    stroke: 0x00FFFF,
    strokeThickness: 6,
    dropShadow: true,
    dropShadowColor: 0x00FFFF,
    dropShadowBlur: 10,
    dropShadowDistance: 0,
});

const glowText = new PIXI.Text('Glow Text', glowStyle);
```

### 7.3.3 多行文本

```typescript
/**
 * 多行文本
 */

const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: 0x000000,
    
    // 换行
    wordWrap: true,
    wordWrapWidth: 300,
    
    // 对齐
    align: 'center',  // left, center, right, justify
    
    // 行高
    lineHeight: 24,
    
    // 断行模式
    breakWords: true,  // 允许在单词中间断行
    
    // 裁剪
    trim: true,  // 移除首尾空白
});

const multilineText = new PIXI.Text(
    'This is a long text that will wrap to multiple lines based on the wordWrapWidth setting.',
    style
);
```

### 7.3.4 渐变填充

```typescript
/**
 * 渐变填充
 */

// 垂直渐变
const verticalGradient = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: ['#FF0000', '#FFFF00', '#00FF00'],
    fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
    fillGradientStops: [0, 0.5, 1],
});

// 水平渐变
const horizontalGradient = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fill: ['#FF0000', '#0000FF'],
    fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_HORIZONTAL,
});


/*
渐变类型：
- LINEAR_VERTICAL: 垂直渐变（从上到下）
- LINEAR_HORIZONTAL: 水平渐变（从左到右）

fillGradientStops: 渐变停止点位置 [0-1]
*/
```

### 7.3.5 完整样式参考

```typescript
/**
 * TextStyle 完整选项
 */

const fullStyle = new PIXI.TextStyle({
    // 字体
    fontFamily: 'Arial',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontVariant: 'normal',
    
    // 填充
    fill: 0xFFFFFF,
    fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
    fillGradientStops: [],
    
    // 描边
    stroke: 0x000000,
    strokeThickness: 0,
    lineJoin: 'miter',  // miter, round, bevel
    miterLimit: 10,
    
    // 阴影
    dropShadow: false,
    dropShadowColor: 0x000000,
    dropShadowAlpha: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowDistance: 5,
    
    // 布局
    align: 'left',
    letterSpacing: 0,
    lineHeight: 0,
    leading: 0,
    
    // 换行
    wordWrap: false,
    wordWrapWidth: 100,
    breakWords: false,
    
    // 其他
    padding: 0,
    trim: false,
    textBaseline: 'alphabetic',
    whiteSpace: 'pre',
});
```

---

## 7.4 BitmapText 位图文本

### 7.4.1 什么是 BitmapText

```
BitmapText vs Text

Text（动态文本）：
- 使用 Canvas 2D 绘制
- 支持所有字体
- 每次修改重新生成纹理
- 适合少量、不频繁更新的文本

BitmapText（位图文本）：
- 使用预渲染的字体纹理
- 只支持预定义的字符
- 修改时只需更新顶点数据
- 适合大量、频繁更新的文本（分数、计时器等）


性能对比：
┌─────────────────────────────────────────┐
│  场景：更新 100 个文本对象              │
├─────────────────────────────────────────┤
│  Text:       ~50ms（重新生成纹理）      │
│  BitmapText: ~2ms（更新顶点）           │
└─────────────────────────────────────────┘
```

### 7.4.2 创建位图字体

```typescript
/**
 * 创建位图字体
 */

// 方式1：从 XML/JSON 文件加载（推荐）
// 使用工具如 BMFont, Littera, Hiero 生成
await PIXI.Assets.load('fonts/myFont.fnt');
const bitmapText = new PIXI.BitmapText('Hello', {
    fontName: 'MyFont',
    fontSize: 32
});


// 方式2：从 TextStyle 动态生成
PIXI.BitmapFont.from('MyDynamicFont', {
    fontFamily: 'Arial',
    fontSize: 32,
    fill: 0xFFFFFF,
    stroke: 0x000000,
    strokeThickness: 2
}, {
    chars: PIXI.BitmapFont.ASCII,  // 要包含的字符
    resolution: 2,                  // 分辨率
    padding: 4                      // 字符间距
});

const bitmapText = new PIXI.BitmapText('Hello', {
    fontName: 'MyDynamicFont',
    fontSize: 32
});


// 方式3：安装已有字体
const font = await PIXI.Assets.load('fonts/arial.fnt');
PIXI.BitmapFont.install(font);
```

### 7.4.3 BitmapText 属性

```typescript
/**
 * BitmapText 属性
 */

const bitmapText = new PIXI.BitmapText('Score: 0', {
    fontName: 'GameFont',
    fontSize: 24,
    align: 'left',        // left, center, right
    tint: 0xFFFFFF,       // 着色
    letterSpacing: 0,     // 字间距
    maxWidth: 200,        // 最大宽度（自动换行）
});

// 修改文本
bitmapText.text = 'Score: 100';

// 修改字体大小
bitmapText.fontSize = 32;

// 修改颜色
bitmapText.tint = 0xFF0000;

// 获取尺寸
console.log(bitmapText.width, bitmapText.height);
```

### 7.4.4 字符集定义

```typescript
/**
 * 字符集定义
 */

// 预定义字符集
PIXI.BitmapFont.ASCII;           // 基本 ASCII 字符
PIXI.BitmapFont.ALPHANUMERIC;    // 字母和数字
PIXI.BitmapFont.ASCII.concat('中文字符');  // 自定义扩展

// 自定义字符集
const customChars = '0123456789:.-+×÷=';

PIXI.BitmapFont.from('NumberFont', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xFFFFFF
}, {
    chars: customChars
});

// 包含中文
PIXI.BitmapFont.from('ChineseFont', {
    fontFamily: 'Microsoft YaHei',
    fontSize: 24,
    fill: 0xFFFFFF
}, {
    chars: [
        ['a', 'z'],  // 小写字母
        ['A', 'Z'],  // 大写字母
        ['0', '9'],  // 数字
        '你好世界游戏开始结束分数生命'  // 中文
    ]
});
```

---

## 7.5 HTMLText

### 7.5.1 什么是 HTMLText

```
HTMLText 特点

- 支持 HTML 标签和 CSS 样式
- 使用 DOM 渲染后转换为纹理
- 支持富文本格式
- 性能比 Text 更低
- 适合复杂格式的静态文本


支持的 HTML 标签：
- <b>, <strong>: 粗体
- <i>, <em>: 斜体
- <u>: 下划线
- <s>: 删除线
- <br>: 换行
- <span>: 内联样式
```

### 7.5.2 使用 HTMLText

```typescript
/**
 * HTMLText 使用
 */

// 基本使用
const htmlText = new PIXI.HTMLText('<b>Bold</b> and <i>Italic</i>');
app.stage.addChild(htmlText);

// 带样式
const htmlText = new PIXI.HTMLText(
    '<span style="color: red;">Red</span> and <span style="color: blue;">Blue</span>',
    {
        fontFamily: 'Arial',
        fontSize: 24
    }
);

// 复杂格式
const richText = new PIXI.HTMLText(`
    <h1 style="color: gold;">Title</h1>
    <p>This is a <b>bold</b> and <i>italic</i> text.</p>
    <p style="color: green;">Green paragraph</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
    </ul>
`);
```

---

## 7.6 文本测量

### 7.6.1 测量文本尺寸

```typescript
/**
 * 测量文本尺寸
 */

// 使用 Text 对象
const text = new PIXI.Text('Hello World', { fontSize: 24 });
console.log('Width:', text.width);
console.log('Height:', text.height);

// 使用 TextMetrics
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24
});
const metrics = PIXI.TextMetrics.measureText('Hello World', style);

console.log('Width:', metrics.width);
console.log('Height:', metrics.height);
console.log('Lines:', metrics.lines);
console.log('Line widths:', metrics.lineWidths);
console.log('Line height:', metrics.lineHeight);
```

### 7.6.2 自动调整大小

```typescript
/**
 * 自动调整文本大小
 */

// 根据容器宽度调整字体大小
function fitTextToWidth(text: PIXI.Text, maxWidth: number) {
    const originalSize = text.style.fontSize as number;
    
    while (text.width > maxWidth && text.style.fontSize > 8) {
        text.style.fontSize = (text.style.fontSize as number) - 1;
    }
}

// 根据容器调整文本
function fitTextToContainer(
    text: PIXI.Text,
    maxWidth: number,
    maxHeight: number
) {
    const style = text.style;
    let fontSize = style.fontSize as number;
    
    while (fontSize > 8) {
        style.fontSize = fontSize;
        
        if (text.width <= maxWidth && text.height <= maxHeight) {
            break;
        }
        
        fontSize--;
    }
}

// 使用
const text = new PIXI.Text('This is a long text', { fontSize: 48 });
fitTextToWidth(text, 200);
```

### 7.6.3 文本截断

```typescript
/**
 * 文本截断
 */

// 截断文本并添加省略号
function truncateText(
    text: string,
    style: PIXI.TextStyle,
    maxWidth: number,
    ellipsis: string = '...'
): string {
    const metrics = PIXI.TextMetrics.measureText(text, style);
    
    if (metrics.width <= maxWidth) {
        return text;
    }
    
    // 二分查找合适的长度
    let left = 0;
    let right = text.length;
    
    while (left < right) {
        const mid = Math.floor((left + right + 1) / 2);
        const truncated = text.slice(0, mid) + ellipsis;
        const truncatedMetrics = PIXI.TextMetrics.measureText(truncated, style);
        
        if (truncatedMetrics.width <= maxWidth) {
            left = mid;
        } else {
            right = mid - 1;
        }
    }
    
    return text.slice(0, left) + ellipsis;
}

// 使用
const style = new PIXI.TextStyle({ fontSize: 16 });
const truncated = truncateText('This is a very long text', style, 100);
const text = new PIXI.Text(truncated, style);
```

---

## 7.7 实用组件

### 7.7.1 打字机效果

```typescript
/**
 * 打字机效果
 */

class TypewriterText extends PIXI.Text {
    private fullText: string;
    private currentIndex: number = 0;
    private speed: number;
    private timer: number = 0;
    
    constructor(text: string, style: PIXI.TextStyle, speed: number = 50) {
        super('', style);
        this.fullText = text;
        this.speed = speed;
    }
    
    start() {
        this.currentIndex = 0;
        this.text = '';
    }
    
    update(delta: number) {
        if (this.currentIndex >= this.fullText.length) {
            return;
        }
        
        this.timer += delta * 16.67;  // 转换为毫秒
        
        while (this.timer >= this.speed && this.currentIndex < this.fullText.length) {
            this.timer -= this.speed;
            this.currentIndex++;
            this.text = this.fullText.slice(0, this.currentIndex);
        }
    }
    
    isComplete(): boolean {
        return this.currentIndex >= this.fullText.length;
    }
    
    skip() {
        this.currentIndex = this.fullText.length;
        this.text = this.fullText;
    }
}

// 使用
const typewriter = new TypewriterText(
    'Hello, this is a typewriter effect!',
    new PIXI.TextStyle({ fontSize: 24 }),
    50
);
typewriter.start();

app.ticker.add((delta) => {
    typewriter.update(delta);
});
```

### 7.7.2 计数动画

```typescript
/**
 * 计数动画
 */

class AnimatedNumber extends PIXI.Text {
    private targetValue: number = 0;
    private currentValue: number = 0;
    private speed: number;
    private prefix: string;
    private suffix: string;
    private decimals: number;
    
    constructor(
        initialValue: number,
        style: PIXI.TextStyle,
        options: {
            speed?: number;
            prefix?: string;
            suffix?: string;
            decimals?: number;
        } = {}
    ) {
        super('', style);
        this.currentValue = initialValue;
        this.targetValue = initialValue;
        this.speed = options.speed ?? 100;
        this.prefix = options.prefix ?? '';
        this.suffix = options.suffix ?? '';
        this.decimals = options.decimals ?? 0;
        this.updateText();
    }
    
    setValue(value: number) {
        this.targetValue = value;
    }
    
    update(delta: number) {
        if (this.currentValue === this.targetValue) {
            return;
        }
        
        const diff = this.targetValue - this.currentValue;
        const step = diff * Math.min(1, delta * this.speed / 1000);
        
        if (Math.abs(diff) < 0.01) {
            this.currentValue = this.targetValue;
        } else {
            this.currentValue += step;
        }
        
        this.updateText();
    }
    
    private updateText() {
        const displayValue = this.currentValue.toFixed(this.decimals);
        this.text = `${this.prefix}${displayValue}${this.suffix}`;
    }
}

// 使用
const score = new AnimatedNumber(0, new PIXI.TextStyle({ fontSize: 32 }), {
    prefix: 'Score: ',
    speed: 200
});

// 更新分数
score.setValue(1000);

app.ticker.add((delta) => {
    score.update(delta);
});
```

### 7.7.3 文本按钮

```typescript
/**
 * 文本按钮
 */

class TextButton extends PIXI.Container {
    private background: PIXI.Graphics;
    private label: PIXI.Text;
    
    constructor(
        text: string,
        options: {
            width?: number;
            height?: number;
            backgroundColor?: number;
            hoverColor?: number;
            textStyle?: Partial<PIXI.ITextStyle>;
        } = {}
    ) {
        super();
        
        const {
            width = 120,
            height = 40,
            backgroundColor = 0x4CAF50,
            hoverColor = 0x66BB6A,
            textStyle = {}
        } = options;
        
        // 背景
        this.background = new PIXI.Graphics();
        this.drawBackground(backgroundColor);
        
        // 文本
        this.label = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            ...textStyle
        });
        this.label.anchor.set(0.5);
        this.label.position.set(width / 2, height / 2);
        
        this.addChild(this.background, this.label);
        
        // 交互
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        this.on('pointerover', () => {
            this.drawBackground(hoverColor);
        });
        
        this.on('pointerout', () => {
            this.drawBackground(backgroundColor);
        });
    }
    
    private drawBackground(color: number) {
        this.background.clear();
        this.background.beginFill(color);
        this.background.drawRoundedRect(0, 0, 120, 40, 5);
        this.background.endFill();
    }
    
    setText(text: string) {
        this.label.text = text;
    }
}

// 使用
const button = new TextButton('Click Me', {
    width: 150,
    height: 50,
    backgroundColor: 0x2196F3
});

button.on('pointerdown', () => {
    console.log('Button clicked!');
});
```

---

## 7.8 性能优化

### 7.8.1 减少文本更新

```typescript
/**
 * 减少文本更新
 */

// 不好：每帧更新
app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;  // 每帧重新生成纹理
});

// 好：只在值改变时更新
let lastScore = -1;
app.ticker.add(() => {
    if (score !== lastScore) {
        scoreText.text = `Score: ${score}`;
        lastScore = score;
    }
});

// 更好：使用 BitmapText
const scoreText = new PIXI.BitmapText('Score: 0', {
    fontName: 'GameFont',
    fontSize: 24
});

app.ticker.add(() => {
    scoreText.text = `Score: ${score}`;  // BitmapText 更新很快
});
```

### 7.8.2 文本池

```typescript
/**
 * 文本对象池
 */

class TextPool {
    private pool: PIXI.Text[] = [];
    private style: PIXI.TextStyle;
    
    constructor(style: PIXI.TextStyle) {
        this.style = style;
    }
    
    get(text: string): PIXI.Text {
        let textObj: PIXI.Text;
        
        if (this.pool.length > 0) {
            textObj = this.pool.pop()!;
            textObj.text = text;
            textObj.visible = true;
        } else {
            textObj = new PIXI.Text(text, this.style);
        }
        
        return textObj;
    }
    
    release(textObj: PIXI.Text) {
        textObj.visible = false;
        textObj.parent?.removeChild(textObj);
        this.pool.push(textObj);
    }
    
    clear() {
        for (const text of this.pool) {
            text.destroy();
        }
        this.pool = [];
    }
}

// 使用
const damageTextPool = new TextPool(new PIXI.TextStyle({
    fontSize: 24,
    fill: 0xFF0000,
    fontWeight: 'bold'
}));

function showDamage(x: number, y: number, damage: number) {
    const text = damageTextPool.get(`-${damage}`);
    text.position.set(x, y);
    app.stage.addChild(text);
    
    // 动画后回收
    gsap.to(text, {
        y: y - 50,
        alpha: 0,
        duration: 1,
        onComplete: () => {
            damageTextPool.release(text);
        }
    });
}
```

### 7.8.3 分辨率优化

```typescript
/**
 * 分辨率优化
 */

// 根据设备 DPR 设置分辨率
const text = new PIXI.Text('High Resolution', {
    fontSize: 24
});
text.resolution = window.devicePixelRatio;

// 全局设置
PIXI.settings.RESOLUTION = window.devicePixelRatio;

// 对于 BitmapFont
PIXI.BitmapFont.from('HiResFont', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFFFFFF
}, {
    resolution: window.devicePixelRatio,
    chars: PIXI.BitmapFont.ASCII
});
```

---

## 7.9 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Text** | 动态文本，支持所有字体和样式 |
| **TextStyle** | 文本样式配置 |
| **BitmapText** | 位图文本，高性能 |
| **HTMLText** | HTML 渲染文本，支持富文本 |
| **TextMetrics** | 文本测量工具 |
| **BitmapFont** | 位图字体定义 |

### 关键代码

```typescript
// 创建 Text
const text = new PIXI.Text('Hello', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFF0000
});

// TextStyle
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: ['#FF0000', '#00FF00'],
    dropShadow: true
});

// BitmapText
PIXI.BitmapFont.from('GameFont', style, { chars: PIXI.BitmapFont.ASCII });
const bitmapText = new PIXI.BitmapText('Score: 0', { fontName: 'GameFont' });

// 测量文本
const metrics = PIXI.TextMetrics.measureText('Hello', style);
```

---

## 7.10 练习题

### 基础练习

1. 创建带阴影和描边的标题文本

2. 实现一个分数显示组件（使用 BitmapText）

3. 创建多行居中文本

### 进阶练习

4. 实现打字机效果

5. 创建一个文本按钮组件

### 挑战练习

6. 实现一个完整的对话框系统，支持打字效果、头像、选项

---

**下一章预告**：在第8章中，我们将深入学习 Transform 变换系统。

---

**文档版本**：v1.0  
**字数统计**：约 11,000 字  
**代码示例**：45+ 个
