# 第13章：Ticker与动画

## 13.1 章节概述

Ticker 是 PixiJS 的帧循环系统，是实现动画和游戏逻辑的基础。理解 Ticker 的工作原理对于创建流畅的动画至关重要。

本章将深入讲解：

- **Ticker 基础**：工作原理、使用方法
- **帧率控制**：deltaTime、FPS 限制
- **动画实现**：补间动画、缓动函数
- **动画库集成**：GSAP、Anime.js
- **粒子系统**：基础粒子效果
- **性能优化**：动画性能最佳实践

---

## 13.2 Ticker 基础

### 13.2.1 Ticker 工作原理

```
Ticker 工作原理

┌─────────────────────────────────────────────────────────────┐
│                    Ticker 循环                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  requestAnimationFrame                                      │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │     计算 deltaTime                  │                   │
│  │     (距离上一帧的时间)              │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │     执行所有注册的回调              │                   │
│  │     callback(deltaTime)             │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │     渲染场景                        │                   │
│  │     renderer.render(stage)          │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                   │
│         └──────────────────────────────────────────┐       │
│                                                    │       │
│  requestAnimationFrame ◄───────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘


deltaTime 说明：
- 60 FPS 时，deltaTime ≈ 1
- 30 FPS 时，deltaTime ≈ 2
- 用于帧率无关的动画
```

### 13.2.2 使用 Ticker

```typescript
/**
 * 使用 Ticker
 */

// 使用 Application 的 ticker
app.ticker.add((delta) => {
    // delta: 帧时间因子（60 FPS 时约为 1）
    sprite.x += 1 * delta;
});

// 使用共享 Ticker
PIXI.Ticker.shared.add((delta) => {
    sprite.rotation += 0.01 * delta;
});

// 创建独立 Ticker
const myTicker = new PIXI.Ticker();
myTicker.add((delta) => {
    // 自定义逻辑
});
myTicker.start();


// 添加带上下文的回调
class Game {
    update(delta: number) {
        // 游戏逻辑
    }
}

const game = new Game();
app.ticker.add(game.update, game);  // 绑定 this


// 移除回调
const updateFn = (delta: number) => { /* ... */ };
app.ticker.add(updateFn);
app.ticker.remove(updateFn);
```

### 13.2.3 Ticker 属性

```typescript
/**
 * Ticker 属性
 */

const ticker = app.ticker;

// 当前帧率
console.log(ticker.FPS);

// 目标帧率（默认 60）
ticker.maxFPS = 60;
ticker.minFPS = 10;

// 是否运行
console.log(ticker.started);

// 上一帧的时间（毫秒）
console.log(ticker.lastTime);

// 帧时间因子
console.log(ticker.deltaTime);  // 约 1（60 FPS）

// 实际帧时间（毫秒）
console.log(ticker.deltaMS);    // 约 16.67（60 FPS）

// 经过的时间（毫秒）
console.log(ticker.elapsedMS);

// 速度倍率
ticker.speed = 1;    // 正常速度
ticker.speed = 0.5;  // 慢动作
ticker.speed = 2;    // 快进


// 控制 Ticker
ticker.start();
ticker.stop();


// 一次性更新
ticker.update();
```

### 13.2.4 帧率无关动画

```typescript
/**
 * 帧率无关动画
 */

// 不好：帧率依赖
app.ticker.add(() => {
    sprite.x += 5;  // 60 FPS 时每秒移动 300 像素
                    // 30 FPS 时每秒移动 150 像素
});

// 好：使用 delta
app.ticker.add((delta) => {
    sprite.x += 5 * delta;  // 无论帧率，每秒移动 300 像素
});

// 更好：使用实际时间
const speed = 300;  // 每秒 300 像素
app.ticker.add((delta) => {
    const dt = delta / 60;  // 转换为秒
    sprite.x += speed * dt;
});

// 或使用 deltaMS
app.ticker.add(() => {
    const dt = app.ticker.deltaMS / 1000;  // 毫秒转秒
    sprite.x += speed * dt;
});
```

---

## 13.3 动画实现

### 13.3.1 基础动画

```typescript
/**
 * 基础动画
 */

// 线性移动
const targetX = 500;
const speed = 200;  // 每秒像素

app.ticker.add((delta) => {
    const dt = delta / 60;
    
    if (sprite.x < targetX) {
        sprite.x += speed * dt;
        if (sprite.x > targetX) {
            sprite.x = targetX;
        }
    }
});


// 旋转动画
app.ticker.add((delta) => {
    sprite.rotation += 0.02 * delta;
});


// 缩放动画（呼吸效果）
let time = 0;
app.ticker.add((delta) => {
    time += delta * 0.05;
    const scale = 1 + Math.sin(time) * 0.1;
    sprite.scale.set(scale);
});


// 透明度动画（闪烁）
app.ticker.add((delta) => {
    time += delta * 0.1;
    sprite.alpha = 0.5 + Math.sin(time) * 0.5;
});
```

### 13.3.2 补间动画

```typescript
/**
 * 补间动画（Tween）
 */

class Tween {
    private target: any;
    private properties: Record<string, { start: number; end: number }> = {};
    private duration: number;
    private elapsed: number = 0;
    private easing: (t: number) => number;
    private onComplete?: () => void;
    private isPlaying: boolean = false;
    
    constructor(target: any) {
        this.target = target;
        this.duration = 1000;
        this.easing = (t) => t;  // 线性
    }
    
    to(properties: Record<string, number>, duration: number): this {
        this.duration = duration;
        
        for (const key in properties) {
            this.properties[key] = {
                start: this.target[key],
                end: properties[key]
            };
        }
        
        return this;
    }
    
    setEasing(easing: (t: number) => number): this {
        this.easing = easing;
        return this;
    }
    
    onCompleteCallback(callback: () => void): this {
        this.onComplete = callback;
        return this;
    }
    
    start(): this {
        this.elapsed = 0;
        this.isPlaying = true;
        
        // 保存初始值
        for (const key in this.properties) {
            this.properties[key].start = this.target[key];
        }
        
        return this;
    }
    
    update(deltaMS: number): boolean {
        if (!this.isPlaying) return false;
        
        this.elapsed += deltaMS;
        const progress = Math.min(this.elapsed / this.duration, 1);
        const easedProgress = this.easing(progress);
        
        for (const key in this.properties) {
            const { start, end } = this.properties[key];
            this.target[key] = start + (end - start) * easedProgress;
        }
        
        if (progress >= 1) {
            this.isPlaying = false;
            this.onComplete?.();
            return false;
        }
        
        return true;
    }
}

// 使用
const tween = new Tween(sprite)
    .to({ x: 500, y: 300, alpha: 0.5 }, 1000)
    .setEasing(easeOutQuad)
    .onCompleteCallback(() => console.log('完成'))
    .start();

app.ticker.add(() => {
    tween.update(app.ticker.deltaMS);
});
```

### 13.3.3 缓动函数

```typescript
/**
 * 缓动函数
 */

// 线性
const linear = (t: number) => t;

// 二次方
const easeInQuad = (t: number) => t * t;
const easeOutQuad = (t: number) => t * (2 - t);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// 三次方
const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => (--t) * t * t + 1;
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

// 四次方
const easeInQuart = (t: number) => t * t * t * t;
const easeOutQuart = (t: number) => 1 - (--t) * t * t * t;

// 五次方
const easeInQuint = (t: number) => t * t * t * t * t;
const easeOutQuint = (t: number) => 1 + (--t) * t * t * t * t;

// 正弦
const easeInSine = (t: number) => 1 - Math.cos(t * Math.PI / 2);
const easeOutSine = (t: number) => Math.sin(t * Math.PI / 2);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

// 指数
const easeInExpo = (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

// 圆形
const easeInCirc = (t: number) => 1 - Math.sqrt(1 - t * t);
const easeOutCirc = (t: number) => Math.sqrt(1 - (--t) * t);

// 弹性
const easeOutElastic = (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// 回弹
const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// 弹跳
const easeOutBounce = (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};
```

### 13.3.4 动画管理器

```typescript
/**
 * 动画管理器
 */

class AnimationManager {
    private animations: Set<Tween> = new Set();
    
    create(target: any): Tween {
        const tween = new Tween(target);
        return tween;
    }
    
    add(tween: Tween) {
        this.animations.add(tween);
    }
    
    remove(tween: Tween) {
        this.animations.delete(tween);
    }
    
    update(deltaMS: number) {
        for (const tween of this.animations) {
            if (!tween.update(deltaMS)) {
                this.animations.delete(tween);
            }
        }
    }
    
    clear() {
        this.animations.clear();
    }
}

// 使用
const animationManager = new AnimationManager();

app.ticker.add(() => {
    animationManager.update(app.ticker.deltaMS);
});

// 创建动画
const tween = animationManager.create(sprite)
    .to({ x: 500 }, 1000)
    .start();

animationManager.add(tween);
```

---

## 13.4 动画库集成

### 13.4.1 GSAP 集成

```typescript
/**
 * GSAP 集成
 */

// 安装: npm install gsap

import gsap from 'gsap';

// 基本动画
gsap.to(sprite, {
    x: 500,
    y: 300,
    duration: 1,
    ease: 'power2.out'
});

// 从指定值开始
gsap.from(sprite, {
    x: 0,
    y: 0,
    alpha: 0,
    duration: 1
});

// 从到
gsap.fromTo(sprite, 
    { x: 0, alpha: 0 },
    { x: 500, alpha: 1, duration: 1 }
);

// 时间线
const tl = gsap.timeline();
tl.to(sprite1, { x: 100, duration: 0.5 })
  .to(sprite2, { x: 200, duration: 0.5 })
  .to(sprite3, { x: 300, duration: 0.5 });

// 同时执行
tl.to(sprite1, { x: 100, duration: 0.5 })
  .to(sprite2, { x: 200, duration: 0.5 }, '<')  // 与上一个同时开始
  .to(sprite3, { x: 300, duration: 0.5 }, '<0.2');  // 延迟 0.2 秒

// 回调
gsap.to(sprite, {
    x: 500,
    duration: 1,
    onStart: () => console.log('开始'),
    onUpdate: () => console.log('更新'),
    onComplete: () => console.log('完成')
});

// 重复
gsap.to(sprite, {
    x: 500,
    duration: 1,
    repeat: -1,      // 无限重复
    yoyo: true,      // 来回
    repeatDelay: 0.5 // 重复间隔
});

// 控制
const anim = gsap.to(sprite, { x: 500, duration: 2 });
anim.pause();
anim.resume();
anim.reverse();
anim.seek(0.5);
anim.kill();
```

### 13.4.2 PixiJS 专用插件

```typescript
/**
 * GSAP PixiJS 插件
 */

// 安装: npm install gsap @pixi/gsap

import { PixiPlugin } from '@pixi/gsap';
import gsap from 'gsap';

// 注册插件
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

// 现在可以直接动画 PixiJS 特有属性
gsap.to(sprite, {
    pixi: {
        tint: 0xFF0000,
        scale: 2,
        rotation: 360,  // 角度
        blur: 10,       // 模糊滤镜
        brightness: 1.5 // 亮度
    },
    duration: 1
});
```

---

## 13.5 粒子系统

### 13.5.1 基础粒子

```typescript
/**
 * 基础粒子系统
 */

interface Particle {
    sprite: PIXI.Sprite;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

class SimpleParticleSystem {
    private container: PIXI.Container;
    private particles: Particle[] = [];
    private texture: PIXI.Texture;
    
    constructor(texture: PIXI.Texture) {
        this.container = new PIXI.Container();
        this.texture = texture;
    }
    
    emit(x: number, y: number, count: number = 10) {
        for (let i = 0; i < count; i++) {
            const sprite = new PIXI.Sprite(this.texture);
            sprite.anchor.set(0.5);
            sprite.position.set(x, y);
            sprite.scale.set(0.5 + Math.random() * 0.5);
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            
            const particle: Particle = {
                sprite,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1 + Math.random()
            };
            
            this.particles.push(particle);
            this.container.addChild(sprite);
        }
    }
    
    update(delta: number) {
        const dt = delta / 60;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新位置
            p.sprite.x += p.vx * dt;
            p.sprite.y += p.vy * dt;
            
            // 应用重力
            p.vy += 200 * dt;
            
            // 更新生命
            p.life -= dt;
            
            // 更新透明度
            p.sprite.alpha = p.life / p.maxLife;
            
            // 移除死亡粒子
            if (p.life <= 0) {
                this.container.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
    
    getContainer(): PIXI.Container {
        return this.container;
    }
}

// 使用
const particleSystem = new SimpleParticleSystem(particleTexture);
app.stage.addChild(particleSystem.getContainer());

app.ticker.add((delta) => {
    particleSystem.update(delta);
});

// 点击发射粒子
app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.on('pointerdown', (e) => {
    particleSystem.emit(e.global.x, e.global.y, 20);
});
```

### 13.5.2 高级粒子效果

```typescript
/**
 * 高级粒子效果
 */

interface AdvancedParticle {
    sprite: PIXI.Sprite;
    x: number;
    y: number;
    vx: number;
    vy: number;
    ax: number;
    ay: number;
    rotation: number;
    rotationSpeed: number;
    scale: number;
    scaleSpeed: number;
    alpha: number;
    alphaSpeed: number;
    color: number;
    life: number;
    maxLife: number;
}

interface ParticleConfig {
    texture: PIXI.Texture;
    count: number;
    speed: { min: number; max: number };
    angle: { min: number; max: number };
    scale: { start: number; end: number };
    alpha: { start: number; end: number };
    rotation: { min: number; max: number };
    life: { min: number; max: number };
    gravity: { x: number; y: number };
    colors: number[];
    blendMode: PIXI.BLEND_MODES;
}

class AdvancedParticleSystem {
    private container: PIXI.ParticleContainer;
    private particles: AdvancedParticle[] = [];
    private config: ParticleConfig;
    
    constructor(config: ParticleConfig) {
        this.config = config;
        this.container = new PIXI.ParticleContainer(1000, {
            scale: true,
            position: true,
            rotation: true,
            alpha: true,
            tint: true
        });
    }
    
    emit(x: number, y: number) {
        for (let i = 0; i < this.config.count; i++) {
            this.createParticle(x, y);
        }
    }
    
    private createParticle(x: number, y: number) {
        const sprite = new PIXI.Sprite(this.config.texture);
        sprite.anchor.set(0.5);
        sprite.blendMode = this.config.blendMode;
        
        const angle = this.random(this.config.angle.min, this.config.angle.max);
        const speed = this.random(this.config.speed.min, this.config.speed.max);
        const life = this.random(this.config.life.min, this.config.life.max);
        
        const particle: AdvancedParticle = {
            sprite,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            ax: this.config.gravity.x,
            ay: this.config.gravity.y,
            rotation: 0,
            rotationSpeed: this.random(this.config.rotation.min, this.config.rotation.max),
            scale: this.config.scale.start,
            scaleSpeed: (this.config.scale.end - this.config.scale.start) / life,
            alpha: this.config.alpha.start,
            alphaSpeed: (this.config.alpha.end - this.config.alpha.start) / life,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            life,
            maxLife: life
        };
        
        sprite.position.set(x, y);
        sprite.scale.set(particle.scale);
        sprite.alpha = particle.alpha;
        sprite.tint = particle.color;
        
        this.particles.push(particle);
        this.container.addChild(sprite);
    }
    
    update(delta: number) {
        const dt = delta / 60;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新速度
            p.vx += p.ax * dt;
            p.vy += p.ay * dt;
            
            // 更新位置
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            
            // 更新旋转
            p.rotation += p.rotationSpeed * dt;
            
            // 更新缩放
            p.scale += p.scaleSpeed * dt;
            
            // 更新透明度
            p.alpha += p.alphaSpeed * dt;
            
            // 更新生命
            p.life -= dt;
            
            // 应用到精灵
            p.sprite.position.set(p.x, p.y);
            p.sprite.rotation = p.rotation;
            p.sprite.scale.set(Math.max(0, p.scale));
            p.sprite.alpha = Math.max(0, p.alpha);
            
            // 移除死亡粒子
            if (p.life <= 0) {
                this.container.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
    
    private random(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }
    
    getContainer(): PIXI.Container {
        return this.container;
    }
}

// 火焰效果配置
const fireConfig: ParticleConfig = {
    texture: PIXI.Texture.from('particle.png'),
    count: 5,
    speed: { min: 50, max: 100 },
    angle: { min: -Math.PI / 2 - 0.3, max: -Math.PI / 2 + 0.3 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    rotation: { min: -0.1, max: 0.1 },
    life: { min: 0.5, max: 1 },
    gravity: { x: 0, y: -50 },
    colors: [0xFF4500, 0xFF6600, 0xFFAA00],
    blendMode: PIXI.BLEND_MODES.ADD
};

const fireSystem = new AdvancedParticleSystem(fireConfig);
```

---

## 13.6 性能优化

### 13.6.1 Ticker 优化

```typescript
/**
 * Ticker 性能优化
 */

// 1. 避免在 Ticker 中创建对象
// 不好
app.ticker.add(() => {
    const point = new PIXI.Point(sprite.x, sprite.y);  // 每帧创建
});

// 好
const point = new PIXI.Point();
app.ticker.add(() => {
    point.set(sprite.x, sprite.y);  // 复用对象
});


// 2. 条件更新
let needsUpdate = true;

app.ticker.add(() => {
    if (needsUpdate) {
        // 只在需要时更新
        updateLogic();
    }
});


// 3. 降低更新频率
let frameCount = 0;
app.ticker.add(() => {
    frameCount++;
    if (frameCount % 2 === 0) {  // 每两帧更新一次
        expensiveUpdate();
    }
});


// 4. 使用 requestAnimationFrame 的优先级
// PixiJS 的 Ticker 已经使用 requestAnimationFrame
// 但可以控制回调的优先级
app.ticker.add(criticalUpdate, null, PIXI.UPDATE_PRIORITY.HIGH);
app.ticker.add(normalUpdate, null, PIXI.UPDATE_PRIORITY.NORMAL);
app.ticker.add(lowPriorityUpdate, null, PIXI.UPDATE_PRIORITY.LOW);
```

### 13.6.2 动画优化

```typescript
/**
 * 动画性能优化
 */

// 1. 使用对象池
class SpritePool {
    private pool: PIXI.Sprite[] = [];
    private texture: PIXI.Texture;
    
    constructor(texture: PIXI.Texture, initialSize: number = 100) {
        this.texture = texture;
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new PIXI.Sprite(texture));
        }
    }
    
    get(): PIXI.Sprite {
        return this.pool.pop() || new PIXI.Sprite(this.texture);
    }
    
    release(sprite: PIXI.Sprite) {
        sprite.parent?.removeChild(sprite);
        sprite.alpha = 1;
        sprite.scale.set(1);
        sprite.rotation = 0;
        this.pool.push(sprite);
    }
}


// 2. 批量更新
// 不好：单独更新每个对象
for (const sprite of sprites) {
    sprite.x += 1;
}

// 好：使用容器变换
container.x += 1;  // 移动整个容器


// 3. 视口剔除
function updateWithCulling(sprites: PIXI.Sprite[], viewport: PIXI.Rectangle) {
    for (const sprite of sprites) {
        const inViewport = sprite.x > viewport.x - sprite.width &&
                          sprite.x < viewport.right &&
                          sprite.y > viewport.y - sprite.height &&
                          sprite.y < viewport.bottom;
        
        sprite.visible = inViewport;
        
        if (inViewport) {
            // 只更新可见对象
            updateSprite(sprite);
        }
    }
}


// 4. 使用 ParticleContainer
const particleContainer = new PIXI.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: true,
    alpha: true
});
```

---

## 13.7 本章小结

### 核心概念

| 概念 | 说明 |
|------|------|
| **Ticker** | 帧循环系统 |
| **delta** | 帧时间因子 |
| **deltaMS** | 实际帧时间（毫秒） |
| **补间动画** | 从 A 到 B 的平滑过渡 |
| **缓动函数** | 控制动画速度曲线 |
| **粒子系统** | 大量小对象的动画 |

### 关键代码

```typescript
// 使用 Ticker
app.ticker.add((delta) => {
    sprite.x += speed * delta;
});

// 帧率无关动画
const dt = delta / 60;  // 转换为秒
sprite.x += speedPerSecond * dt;

// 缓动函数
const easeOutQuad = (t) => t * (2 - t);

// GSAP
gsap.to(sprite, { x: 500, duration: 1, ease: 'power2.out' });

// 粒子系统
particleSystem.emit(x, y, 20);
app.ticker.add((delta) => particleSystem.update(delta));
```

---

## 13.8 练习题

### 基础练习

1. 实现一个简单的移动动画

2. 使用缓动函数实现弹性效果

3. 创建一个呼吸效果（缩放动画）

### 进阶练习

4. 实现一个补间动画类

5. 创建一个简单的粒子系统

### 挑战练习

6. 实现一个完整的动画管理器，支持序列动画、并行动画、回调

---

**下一章预告**：在第14章中，我们将深入学习性能优化实践。

---

**文档版本**：v1.0  
**字数统计**：约 12,000 字  
**代码示例**：50+ 个
