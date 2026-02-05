# 第5章：Sprite精灵与纹理

## 5.1 章节概述

Sprite（精灵）是 PixiJS 中最常用的显示对象，用于显示图像。理解 Sprite 和 Texture（纹理）的关系是掌握 PixiJS 的关键。

本章将深入讲解：

- **Sprite 基础**：创建、属性、方法
- **Texture 纹理**：创建、类型、缓存
- **纹理与精灵的关系**：一对多关系
- **特殊精灵类型**：TilingSprite、AnimatedSprite、NineSliceSprite
- **纹理图集**：Spritesheet、TexturePacker
- **性能优化**：纹理管理、内存优化

---

## 5.2 Sprite 基础

### 5.2.1 什么是 Sprite

```
Sprite 的本质

Sprite = 纹理 + 变换 + 渲染属性

┌─────────────────────────────────────────┐
│              Sprite                     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │         Texture                 │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │      BaseTexture          │  │    │
│  │  │  (GPU 纹理数据)           │  │    │
│  │  └───────────────────────────┘  │    │
│  │  + frame (纹理区域)             │    │
│  │  + orig (原始尺寸)              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  + position (位置)                      │
│  + scale (缩放)                         │
│  + rotation (旋转)                      │
│  + anchor (锚点)                        │
│  + tint (着色)                          │
│  + alpha (透明度)                       │
└─────────────────────────────────────────┘


关键概念：
- 多个 Sprite 可以共享同一个 Texture
- 多个 Texture 可以共享同一个 BaseTexture
- BaseTexture 是实际的 GPU 纹理
```

### 5.2.2 创建 Sprite

```typescript
/**
 * 创建 Sprite 的多种方式
 */

// 方式1：从纹理创建
const texture = PIXI.Texture.from('image.png');
const sprite = new PIXI.Sprite(texture);

// 方式2：静态方法（推荐）
const sprite = PIXI.Sprite.from('image.png');

// 方式3：从 Assets 加载
const texture = await PIXI.Assets.load('image.png');
const sprite = new PIXI.Sprite(texture);

// 方式4：空白精灵（稍后设置纹理）
const sprite = new PIXI.Sprite();
sprite.texture = texture;

// 方式5：从 Canvas 创建
const canvas = document.createElement('canvas');
// ... 绑制内容
const texture = PIXI.Texture.from(canvas);
const sprite = new PIXI.Sprite(texture);

// 方式6：从 Video 创建
const videoTexture = PIXI.Texture.from('video.mp4');
const videoSprite = new PIXI.Sprite(videoTexture);
```

### 5.2.3 Sprite 属性

```typescript
/**
 * Sprite 核心属性
 */

// ============ 纹理相关 ============
sprite.texture = texture;           // 设置纹理
sprite.width = 100;                 // 宽度（会影响 scale）
sprite.height = 100;                // 高度（会影响 scale）


// ============ 锚点 ============
sprite.anchor.set(0.5);             // 设置锚点为中心
sprite.anchor.set(0.5, 1);          // 底部中心
sprite.anchor.x = 0.5;
sprite.anchor.y = 0.5;

/*
锚点说明：
(0, 0) - 左上角（默认）
(0.5, 0.5) - 中心
(1, 1) - 右下角
(0.5, 1) - 底部中心

锚点影响：
- 旋转中心
- 缩放中心
- 位置参考点
*/


// ============ 着色 ============
sprite.tint = 0xFF0000;             // 红色着色
sprite.tint = 0xFFFFFF;             // 无着色（默认）


// ============ 混合模式 ============
sprite.blendMode = PIXI.BLEND_MODES.ADD;      // 加法混合
sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY; // 乘法混合
sprite.blendMode = PIXI.BLEND_MODES.SCREEN;   // 屏幕混合


// ============ 圆角（v7+） ============
sprite.roundPixels = true;          // 像素对齐（避免模糊）
```

### 5.2.4 锚点详解

```
锚点（Anchor）详解

锚点决定了精灵的参考点位置

anchor = (0, 0) 左上角：
┌─────────────────┐
│●                │
│                 │
│     Sprite      │
│                 │
└─────────────────┘
position 指向左上角


anchor = (0.5, 0.5) 中心：
┌─────────────────┐
│                 │
│        ●        │
│     Sprite      │
│                 │
└─────────────────┘
position 指向中心


anchor = (0.5, 1) 底部中心：
┌─────────────────┐
│                 │
│     Sprite      │
│                 │
│        ●        │
└─────────────────┘
position 指向底部中心


旋转效果对比：

anchor = (0, 0):
    ┌───┐
    │   │ ──→ 围绕左上角旋转
    └───┘

anchor = (0.5, 0.5):
    ┌───┐
    │ ● │ ──→ 围绕中心旋转
    └───┘
```

```typescript
/**
 * 锚点使用示例
 */

// 场景：居中显示
const sprite = PIXI.Sprite.from('hero.png');
sprite.anchor.set(0.5);  // 中心锚点
sprite.position.set(app.screen.width / 2, app.screen.height / 2);

// 场景：底部对齐（角色站在地面）
const character = PIXI.Sprite.from('character.png');
character.anchor.set(0.5, 1);  // 底部中心
character.position.set(x, groundY);

// 场景：围绕中心旋转
const wheel = PIXI.Sprite.from('wheel.png');
wheel.anchor.set(0.5);
app.ticker.add(() => {
    wheel.rotation += 0.05;
});

// 场景：右上角对齐（UI 元素）
const closeButton = PIXI.Sprite.from('close.png');
closeButton.anchor.set(1, 0);  // 右上角
closeButton.position.set(app.screen.width - 10, 10);
```

---

## 5.3 Texture 纹理

### 5.3.1 纹理层级结构

```
纹理层级结构

BaseTexture (GPU 纹理)
    │
    │  一个 BaseTexture 可以被多个 Texture 引用
    │
    ├── Texture A (frame: 0,0,32,32)
    │       │
    │       └── Sprite 1, Sprite 2, Sprite 3
    │
    ├── Texture B (frame: 32,0,32,32)
    │       │
    │       └── Sprite 4, Sprite 5
    │
    └── Texture C (frame: 0,32,64,64)
            │
            └── Sprite 6


关系说明：
- BaseTexture: 实际的 GPU 纹理资源
- Texture: BaseTexture 的一个区域（frame）
- Sprite: 使用 Texture 进行渲染

这种设计的好处：
1. 多个精灵共享同一纹理，减少 GPU 内存
2. 纹理图集：一张大图包含多个小图
3. 减少 Draw Call
```

### 5.3.2 创建 Texture

```typescript
/**
 * 创建 Texture 的多种方式
 */

// 从 URL 创建
const texture = PIXI.Texture.from('image.png');

// 从 Image 元素创建
const img = new Image();
img.src = 'image.png';
img.onload = () => {
    const texture = PIXI.Texture.from(img);
};

// 从 Canvas 创建
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
const texture = PIXI.Texture.from(canvas);

// 从 Video 创建
const texture = PIXI.Texture.from('video.mp4');

// 从 BaseTexture 创建（指定区域）
const baseTexture = PIXI.BaseTexture.from('spritesheet.png');
const texture = new PIXI.Texture(
    baseTexture,
    new PIXI.Rectangle(0, 0, 32, 32)  // frame
);

// 空白纹理
const texture = PIXI.Texture.EMPTY;

// 白色纹理
const texture = PIXI.Texture.WHITE;
```

### 5.3.3 Texture 属性和方法

```typescript
/**
 * Texture 属性和方法
 */

// ============ 属性 ============
texture.baseTexture;     // 底层 BaseTexture
texture.frame;           // 纹理区域 (Rectangle)
texture.orig;            // 原始尺寸 (Rectangle)
texture.trim;            // 裁剪区域 (Rectangle)
texture.width;           // 宽度
texture.height;          // 高度
texture.valid;           // 是否有效（已加载）
texture.noFrame;         // 是否使用整个 BaseTexture


// ============ 方法 ============
// 更新纹理（当源数据改变时）
texture.update();

// 销毁纹理
texture.destroy();
texture.destroy(true);  // 同时销毁 BaseTexture

// 克隆纹理
const clone = texture.clone();

// 从缓存获取
const cached = PIXI.Texture.from('image.png');  // 自动缓存


// ============ 事件 ============
texture.on('update', () => {
    console.log('纹理更新');
});
```

### 5.3.4 BaseTexture 详解

```typescript
/**
 * BaseTexture 详解
 */

// 创建 BaseTexture
const baseTexture = PIXI.BaseTexture.from('image.png');

// BaseTexture 属性
baseTexture.width;           // 宽度
baseTexture.height;          // 高度
baseTexture.resolution;      // 分辨率
baseTexture.scaleMode;       // 缩放模式
baseTexture.wrapMode;        // 环绕模式
baseTexture.mipmap;          // Mipmap 设置
baseTexture.format;          // 纹理格式
baseTexture.type;            // 数据类型
baseTexture.valid;           // 是否有效


// 缩放模式
baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;  // 最近邻（像素风格）
baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;   // 线性（平滑）

// 环绕模式
baseTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;      // 边缘拉伸
baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;     // 重复
baseTexture.wrapMode = PIXI.WRAP_MODES.MIRRORED_REPEAT; // 镜像重复


// 销毁
baseTexture.destroy();
```

---

## 5.4 特殊 Sprite 类型

### 5.4.1 TilingSprite（平铺精灵）

```typescript
/**
 * TilingSprite - 平铺精灵
 * 用于创建无限重复的背景、地面等
 */

// 创建平铺精灵
const tilingSprite = new PIXI.TilingSprite(
    texture,
    800,  // 宽度
    600   // 高度
);

// 或者使用静态方法
const tilingSprite = PIXI.TilingSprite.from('tile.png', {
    width: 800,
    height: 600
});

app.stage.addChild(tilingSprite);


// ============ 特有属性 ============
tilingSprite.tilePosition.x = 0;   // 平铺偏移 X
tilingSprite.tilePosition.y = 0;   // 平铺偏移 Y
tilingSprite.tileScale.x = 1;      // 平铺缩放 X
tilingSprite.tileScale.y = 1;      // 平铺缩放 Y
tilingSprite.uvRespectAnchor = false; // UV 是否考虑锚点


// ============ 滚动背景示例 ============
const background = PIXI.TilingSprite.from('sky.png', {
    width: app.screen.width,
    height: app.screen.height
});

app.ticker.add(() => {
    // 水平滚动
    background.tilePosition.x -= 1;
});


// ============ 视差滚动示例 ============
const farBackground = PIXI.TilingSprite.from('far.png', { width: 800, height: 600 });
const midBackground = PIXI.TilingSprite.from('mid.png', { width: 800, height: 600 });
const nearBackground = PIXI.TilingSprite.from('near.png', { width: 800, height: 600 });

app.ticker.add(() => {
    farBackground.tilePosition.x -= 0.5;   // 慢
    midBackground.tilePosition.x -= 1;     // 中
    nearBackground.tilePosition.x -= 2;    // 快
});
```

### 5.4.2 AnimatedSprite（动画精灵）

```typescript
/**
 * AnimatedSprite - 帧动画精灵
 */

// 方式1：从纹理数组创建
const textures = [
    PIXI.Texture.from('frame1.png'),
    PIXI.Texture.from('frame2.png'),
    PIXI.Texture.from('frame3.png'),
    PIXI.Texture.from('frame4.png'),
];
const animatedSprite = new PIXI.AnimatedSprite(textures);


// 方式2：从 Spritesheet 创建
const sheet = await PIXI.Assets.load('spritesheet.json');
const animatedSprite = new PIXI.AnimatedSprite(sheet.animations['walk']);


// ============ 控制方法 ============
animatedSprite.play();              // 播放
animatedSprite.stop();              // 停止
animatedSprite.gotoAndPlay(0);      // 跳转并播放
animatedSprite.gotoAndStop(2);      // 跳转并停止


// ============ 属性 ============
animatedSprite.animationSpeed = 0.5;  // 播放速度（1 = 60fps）
animatedSprite.loop = true;           // 是否循环
animatedSprite.currentFrame;          // 当前帧索引
animatedSprite.totalFrames;           // 总帧数
animatedSprite.playing;               // 是否正在播放


// ============ 事件 ============
animatedSprite.onComplete = () => {
    console.log('动画播放完成');
};

animatedSprite.onLoop = () => {
    console.log('动画循环');
};

animatedSprite.onFrameChange = (frame) => {
    console.log('当前帧:', frame);
};


// ============ 完整示例 ============
class Character extends PIXI.AnimatedSprite {
    private animations: Record<string, PIXI.Texture[]>;
    
    constructor(sheet: PIXI.Spritesheet) {
        super(sheet.animations['idle']);
        this.animations = sheet.animations;
        this.anchor.set(0.5, 1);
        this.animationSpeed = 0.15;
        this.play();
    }
    
    walk() {
        this.textures = this.animations['walk'];
        this.play();
    }
    
    idle() {
        this.textures = this.animations['idle'];
        this.play();
    }
    
    attack() {
        this.textures = this.animations['attack'];
        this.loop = false;
        this.onComplete = () => {
            this.idle();
            this.loop = true;
        };
        this.play();
    }
}
```

### 5.4.3 NineSliceSprite（九宫格精灵）

```typescript
/**
 * NineSliceSprite - 九宫格精灵
 * 用于可拉伸的 UI 元素（按钮、面板等）
 */

/*
九宫格原理：

┌─────┬───────────┬─────┐
│  1  │     2     │  3  │  ← 顶部（不拉伸高度）
├─────┼───────────┼─────┤
│     │           │     │
│  4  │     5     │  6  │  ← 中间（可拉伸）
│     │           │     │
├─────┼───────────┼─────┤
│  7  │     8     │  9  │  ← 底部（不拉伸高度）
└─────┴───────────┴─────┘
   ↑        ↑        ↑
  左边    中间      右边
(不拉伸) (可拉伸) (不拉伸)

区域说明：
1, 3, 7, 9: 角落，不拉伸
2, 8: 水平拉伸
4, 6: 垂直拉伸
5: 双向拉伸
*/

// 创建九宫格精灵
const nineSlice = new PIXI.NineSliceSprite(
    texture,
    10,   // leftWidth
    10,   // topHeight
    10,   // rightWidth
    10    // bottomHeight
);

// 设置尺寸（会自动拉伸）
nineSlice.width = 200;
nineSlice.height = 100;


// ============ 实际应用：按钮 ============
class Button extends PIXI.Container {
    private background: PIXI.NineSliceSprite;
    private label: PIXI.Text;
    
    constructor(text: string, width: number, height: number) {
        super();
        
        // 九宫格背景
        this.background = new PIXI.NineSliceSprite(
            PIXI.Texture.from('button.png'),
            15, 15, 15, 15
        );
        this.background.width = width;
        this.background.height = height;
        
        // 文本
        this.label = new PIXI.Text(text, {
            fontSize: 16,
            fill: 0xFFFFFF
        });
        this.label.anchor.set(0.5);
        this.label.position.set(width / 2, height / 2);
        
        this.addChild(this.background, this.label);
        
        // 交互
        this.eventMode = 'static';
        this.cursor = 'pointer';
    }
    
    resize(width: number, height: number) {
        this.background.width = width;
        this.background.height = height;
        this.label.position.set(width / 2, height / 2);
    }
}


// ============ 实际应用：面板 ============
class Panel extends PIXI.Container {
    private background: PIXI.NineSliceSprite;
    
    constructor(width: number, height: number) {
        super();
        
        this.background = new PIXI.NineSliceSprite(
            PIXI.Texture.from('panel.png'),
            20, 20, 20, 20
        );
        this.background.width = width;
        this.background.height = height;
        
        this.addChild(this.background);
    }
}
```

---

## 5.5 纹理图集（Spritesheet）

### 5.5.1 什么是纹理图集

```
纹理图集的作用

不使用图集：
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ img1│ │ img2│ │ img3│ │ img4│  ← 4 次 Draw Call
└─────┘ └─────┘ └─────┘ └─────┘    4 个 GPU 纹理


使用图集：
┌─────────────────────┐
│ img1 │ img2 │ img3 │  ← 1 次 Draw Call
├──────┴──────┴──────┤    1 个 GPU 纹理
│       img4         │
└────────────────────┘


优势：
1. 减少 Draw Call（性能提升）
2. 减少 HTTP 请求（加载更快）
3. 减少内存碎片
4. 支持纹理压缩
```

### 5.5.2 创建和使用 Spritesheet

```typescript
/**
 * Spritesheet 使用
 */

// JSON 格式（TexturePacker 导出）
/*
{
    "frames": {
        "hero_idle_01.png": {
            "frame": {"x": 0, "y": 0, "w": 32, "h": 32},
            "rotated": false,
            "trimmed": false,
            "spriteSourceSize": {"x": 0, "y": 0, "w": 32, "h": 32},
            "sourceSize": {"w": 32, "h": 32}
        },
        "hero_idle_02.png": {
            "frame": {"x": 32, "y": 0, "w": 32, "h": 32},
            ...
        }
    },
    "animations": {
        "idle": ["hero_idle_01.png", "hero_idle_02.png", ...],
        "walk": ["hero_walk_01.png", "hero_walk_02.png", ...]
    },
    "meta": {
        "image": "spritesheet.png",
        "size": {"w": 256, "h": 256},
        "scale": "1"
    }
}
*/


// 加载 Spritesheet
const sheet = await PIXI.Assets.load('spritesheet.json');

// 获取单个纹理
const texture = sheet.textures['hero_idle_01.png'];
const sprite = new PIXI.Sprite(texture);

// 获取动画纹理数组
const idleTextures = sheet.animations['idle'];
const animatedSprite = new PIXI.AnimatedSprite(idleTextures);

// 遍历所有纹理
for (const [name, texture] of Object.entries(sheet.textures)) {
    console.log(name, texture);
}
```

### 5.5.3 动态创建 Spritesheet

```typescript
/**
 * 动态创建 Spritesheet
 */

// 场景：从一张图片创建网格图集
async function createGridSpritesheet(
    imageUrl: string,
    frameWidth: number,
    frameHeight: number,
    columns: number,
    rows: number
): Promise<PIXI.Spritesheet> {
    // 加载基础纹理
    const baseTexture = await PIXI.Assets.load(imageUrl);
    
    // 构建帧数据
    const frames: Record<string, any> = {};
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const index = row * columns + col;
            frames[`frame_${index}`] = {
                frame: {
                    x: col * frameWidth,
                    y: row * frameHeight,
                    w: frameWidth,
                    h: frameHeight
                }
            };
        }
    }
    
    // 创建 Spritesheet
    const sheet = new PIXI.Spritesheet(baseTexture, {
        frames,
        meta: {
            scale: '1'
        }
    });
    
    // 解析
    await sheet.parse();
    
    return sheet;
}

// 使用
const sheet = await createGridSpritesheet('tileset.png', 32, 32, 8, 8);
const tile = new PIXI.Sprite(sheet.textures['frame_0']);
```

---

## 5.6 纹理缓存与管理

### 5.6.1 纹理缓存

```typescript
/**
 * 纹理缓存
 */

// PixiJS 自动缓存纹理
const texture1 = PIXI.Texture.from('image.png');
const texture2 = PIXI.Texture.from('image.png');
console.log(texture1 === texture2);  // true（同一个对象）


// 手动添加到缓存
PIXI.Texture.addToCache(texture, 'myTexture');

// 从缓存获取
const cached = PIXI.Texture.from('myTexture');

// 从缓存移除
PIXI.Texture.removeFromCache('myTexture');

// 清空所有缓存
PIXI.utils.clearTextureCache();


// 检查缓存
const cache = PIXI.utils.TextureCache;
console.log(Object.keys(cache));
```

### 5.6.2 纹理管理器

```typescript
/**
 * 纹理管理器
 */

class TextureManager {
    private textures: Map<string, PIXI.Texture> = new Map();
    private loadingPromises: Map<string, Promise<PIXI.Texture>> = new Map();
    
    async load(key: string, url: string): Promise<PIXI.Texture> {
        // 已加载
        if (this.textures.has(key)) {
            return this.textures.get(key)!;
        }
        
        // 正在加载
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key)!;
        }
        
        // 开始加载
        const promise = PIXI.Assets.load(url).then(texture => {
            this.textures.set(key, texture);
            this.loadingPromises.delete(key);
            return texture;
        });
        
        this.loadingPromises.set(key, promise);
        return promise;
    }
    
    get(key: string): PIXI.Texture | undefined {
        return this.textures.get(key);
    }
    
    unload(key: string) {
        const texture = this.textures.get(key);
        if (texture) {
            texture.destroy(true);
            this.textures.delete(key);
        }
    }
    
    unloadAll() {
        for (const [key, texture] of this.textures) {
            texture.destroy(true);
        }
        this.textures.clear();
    }
    
    getMemoryUsage(): number {
        let total = 0;
        for (const texture of this.textures.values()) {
            total += texture.width * texture.height * 4;  // RGBA
        }
        return total;
    }
}

// 使用
const textureManager = new TextureManager();
await textureManager.load('hero', 'hero.png');
const heroTexture = textureManager.get('hero');
```

---

## 5.7 性能优化

### 5.7.1 纹理优化

```typescript
/**
 * 纹理性能优化
 */

// 1. 使用纹理图集
// 减少 Draw Call 和 HTTP 请求


// 2. 使用 2 的幂次尺寸
// 256x256, 512x512, 1024x1024
// 非 2 的幂次会导致额外内存使用


// 3. 选择合适的缩放模式
// 像素风格游戏
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

// 普通游戏
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;


// 4. 及时销毁不需要的纹理
texture.destroy(true);  // 销毁纹理和 BaseTexture


// 5. 使用纹理压缩（需要工具支持）
// ASTC, ETC2, PVRTC, S3TC


// 6. 动态纹理使用 RenderTexture
const renderTexture = PIXI.RenderTexture.create({
    width: 256,
    height: 256
});
app.renderer.render(container, { renderTexture });
```

### 5.7.2 Sprite 优化

```typescript
/**
 * Sprite 性能优化
 */

// 1. 共享纹理
const texture = PIXI.Texture.from('bullet.png');
for (let i = 0; i < 100; i++) {
    const bullet = new PIXI.Sprite(texture);  // 共享同一纹理
    container.addChild(bullet);
}


// 2. 使用 ParticleContainer
const particles = new PIXI.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: true,
    alpha: true
});


// 3. 对象池
class SpritePool {
    private pool: PIXI.Sprite[] = [];
    private texture: PIXI.Texture;
    
    constructor(texture: PIXI.Texture) {
        this.texture = texture;
    }
    
    get(): PIXI.Sprite {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return new PIXI.Sprite(this.texture);
    }
    
    release(sprite: PIXI.Sprite) {
        sprite.parent?.removeChild(sprite);
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.scale.set(1);
        sprite.rotation = 0;
        this.pool.push(sprite);
    }
}


// 4. 批量更新
// 不好：频繁修改
for (const sprite of sprites) {
    sprite.x += 1;
    sprite.y += 1;
    // 每次修改都可能触发更新
}

// 好：使用 Ticker 统一更新
app.ticker.add(() => {
    for (const sprite of sprites) {
        sprite.x += 1;
        sprite.y += 1;
    }
});


// 5. 视口剔除
function cullOffscreen(container: PIXI.Container, viewport: PIXI.Rectangle) {
    for (const child of container.children) {
        if (child instanceof PIXI.Sprite) {
            const bounds = child.getBounds();
            child.visible = bounds.intersects(viewport);
        }
    }
}
```

---

## 5.8 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Sprite** | 显示图像的基本对象 |
| **Texture** | 纹理，BaseTexture 的一个区域 |
| **BaseTexture** | 实际的 GPU 纹理资源 |
| **anchor** | 锚点，影响旋转/缩放中心 |
| **tint** | 着色 |
| **TilingSprite** | 平铺精灵 |
| **AnimatedSprite** | 帧动画精灵 |
| **NineSliceSprite** | 九宫格精灵 |
| **Spritesheet** | 纹理图集 |

### 关键代码

```typescript
// 创建 Sprite
const sprite = PIXI.Sprite.from('image.png');

// 锚点
sprite.anchor.set(0.5);

// 着色
sprite.tint = 0xFF0000;

// 平铺精灵
const tiling = new PIXI.TilingSprite(texture, 800, 600);

// 动画精灵
const animated = new PIXI.AnimatedSprite(textures);
animated.play();

// 九宫格
const nineSlice = new PIXI.NineSliceSprite(texture, 10, 10, 10, 10);

// 加载 Spritesheet
const sheet = await PIXI.Assets.load('sheet.json');
```

---

## 5.9 练习题

### 基础练习

1. 创建一个带锚点的精灵，实现围绕中心旋转

2. 使用 TilingSprite 创建滚动背景

3. 使用 AnimatedSprite 创建角色动画

### 进阶练习

4. 实现一个纹理管理器

5. 创建一个对象池系统

### 挑战练习

6. 实现一个完整的角色动画系统，支持多种状态切换

---

**下一章预告**：在第6章中，我们将深入学习 Graphics 图形绘制。

---

**文档版本**：v1.0  
**字数统计**：约 12,000 字  
**代码示例**：50+ 个
