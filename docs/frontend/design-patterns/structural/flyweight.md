# 享元模式 (Flyweight Pattern)

> [!NOTE]
> 享元模式运用共享技术有效地支持大量细粒度的对象，通过共享已存在的对象来大幅度减少需要创建的对象数量。

## 📖 模式定义

**享元模式**是一种结构型设计模式，它通过共享技术来有效支持大量细粒度对象的复用。享元模式可以避免大量拥有相同内容的小类的开销，使得系统使用较少的对象来实现相同的功能。

### 核心要素
- **享元接口**：定义享元对象的接口，通过这个接口享元可以接受并作用于外部状态
- **具体享元**：实现享元接口，并为内部状态增加存储空间
- **享元工厂**：创建并管理享元对象，确保合理地共享享元
- **客户端**：维护对享元的引用，计算或存储享元的外部状态

## 🎯 使用场景

### 适用情况
- **大量对象**：应用程序需要生成大量相似对象
- **存储成本高**：对象的存储开销很大
- **状态可分离**：对象的大部分状态都可以外部化
- **对象组可替代**：如果删除对象的外部状态，那么可以用相对较少的共享对象取代很多组对象

## 💡 实现方式

### TypeScript 实现

```typescript
// 享元接口
interface TreeType {
    render(canvas: string, x: number, y: number): void;
}

// 具体享元 - 树的类型
class ConcreteTreeType implements TreeType {
    private name: string;
    private color: string;
    private sprite: string; // 内部状态
    
    constructor(name: string, color: string, sprite: string) {
        this.name = name;
        this.color = color;
        this.sprite = sprite;
    }
    
    render(canvas: string, x: number, y: number): void {
        console.log(`Rendering ${this.name} tree (${this.color}) at (${x}, ${y}) on ${canvas}`);
    }
    
    getName(): string {
        return this.name;
    }
}

// 享元工厂
class TreeTypeFactory {
    private static treeTypes: Map<string, TreeType> = new Map();
    
    static getTreeType(name: string, color: string, sprite: string): TreeType {
        const key = `${name}-${color}-${sprite}`;
        
        if (!this.treeTypes.has(key)) {
            console.log(`Creating new tree type: ${key}`);
            this.treeTypes.set(key, new ConcreteTreeType(name, color, sprite));
        } else {
            console.log(`Reusing existing tree type: ${key}`);
        }
        
        return this.treeTypes.get(key)!;
    }
    
    static getCreatedTreeTypesCount(): number {
        return this.treeTypes.size;
    }
    
    static listTreeTypes(): void {
        console.log('Created tree types:');
        this.treeTypes.forEach((treeType, key) => {
            console.log(`- ${key}`);
        });
    }
}

// 上下文类 - 包含外部状态
class Tree {
    private x: number;
    private y: number;
    private treeType: TreeType; // 外部状态
    
    constructor(x: number, y: number, treeType: TreeType) {
        this.x = x;
        this.y = y;
        this.treeType = treeType;
    }
    
    render(canvas: string): void {
        this.treeType.render(canvas, this.x, this.y);
    }
}

// 森林类 - 客户端
class Forest {
    private trees: Tree[] = [];
    
    plantTree(x: number, y: number, name: string, color: string, sprite: string): void {
        const treeType = TreeTypeFactory.getTreeType(name, color, sprite);
        const tree = new Tree(x, y, treeType);
        this.trees.push(tree);
    }
    
    render(canvas: string): void {
        console.log(`\nRendering forest with ${this.trees.length} trees:`);
        this.trees.forEach(tree => tree.render(canvas));
    }
    
    getTreeCount(): number {
        return this.trees.length;
    }
}

// 使用示例
const forest = new Forest();

// 种植大量树木
forest.plantTree(10, 20, 'Oak', 'Green', 'oak_sprite');
forest.plantTree(30, 40, 'Pine', 'Dark Green', 'pine_sprite');
forest.plantTree(50, 60, 'Oak', 'Green', 'oak_sprite'); // 重用Oak类型
forest.plantTree(70, 80, 'Birch', 'Light Green', 'birch_sprite');
forest.plantTree(90, 100, 'Pine', 'Dark Green', 'pine_sprite'); // 重用Pine类型
forest.plantTree(110, 120, 'Oak', 'Green', 'oak_sprite'); // 重用Oak类型

console.log('=== Forest Simulation ===');
forest.render('MainCanvas');

console.log(`\nTotal trees: ${forest.getTreeCount()}`);
console.log(`Tree types created: ${TreeTypeFactory.getCreatedTreeTypesCount()}`);
TreeTypeFactory.listTreeTypes();
```

### 文本编辑器享元

```typescript
// 字符享元接口
interface Character {
    render(position: number, fontSize: number, color: string): void;
}

// 具体字符享元
class ConcreteCharacter implements Character {
    private char: string; // 内部状态
    
    constructor(char: string) {
        this.char = char;
    }
    
    render(position: number, fontSize: number, color: string): void {
        console.log(`Rendering '${this.char}' at position ${position}, size: ${fontSize}px, color: ${color}`);
    }
    
    getChar(): string {
        return this.char;
    }
}

// 字符工厂
class CharacterFactory {
    private static characters: Map<string, Character> = new Map();
    
    static getCharacter(char: string): Character {
        if (!this.characters.has(char)) {
            console.log(`Creating character: '${char}'`);
            this.characters.set(char, new ConcreteCharacter(char));
        }
        return this.characters.get(char)!;
    }
    
    static getCharacterCount(): number {
        return this.characters.size;
    }
}

// 文档字符上下文
class DocumentCharacter {
    private character: Character;
    private position: number;
    private fontSize: number;
    private color: string;
    
    constructor(char: string, position: number, fontSize: number, color: string) {
        this.character = CharacterFactory.getCharacter(char);
        this.position = position;
        this.fontSize = fontSize;
        this.color = color;
    }
    
    render(): void {
        this.character.render(this.position, this.fontSize, this.color);
    }
}

// 文档类
class Document {
    private characters: DocumentCharacter[] = [];
    
    addCharacter(char: string, position: number, fontSize: number = 12, color: string = 'black'): void {
        const docChar = new DocumentCharacter(char, position, fontSize, color);
        this.characters.push(docChar);
    }
    
    addText(text: string, startPosition: number, fontSize: number = 12, color: string = 'black'): void {
        for (let i = 0; i < text.length; i++) {
            this.addCharacter(text[i], startPosition + i, fontSize, color);
        }
    }
    
    render(): void {
        console.log('\n=== Rendering Document ===');
        this.characters.forEach(char => char.render());
    }
    
    getCharacterCount(): number {
        return this.characters.length;
    }
}

// 使用示例
const document = new Document();

document.addText('Hello World!', 0, 14, 'blue');
document.addText('Hello Again!', 20, 12, 'red');
document.addText('World Peace!', 40, 16, 'green');

document.render();

console.log(`\nTotal characters in document: ${document.getCharacterCount()}`);
console.log(`Unique character flyweights: ${CharacterFactory.getCharacterCount()}`);
```

### 游戏粒子系统

```typescript
// 粒子类型享元接口
interface ParticleType {
    render(x: number, y: number, velocity: { x: number; y: number }, color: string): void;
    update(particle: Particle): void;
}

// 具体粒子类型
class ConcreteParticleType implements ParticleType {
    private sprite: string;
    private size: number;
    
    constructor(sprite: string, size: number) {
        this.sprite = sprite;
        this.size = size;
    }
    
    render(x: number, y: number, velocity: { x: number; y: number }, color: string): void {
        console.log(`Rendering ${this.sprite} particle at (${x.toFixed(1)}, ${y.toFixed(1)}) size: ${this.size}, color: ${color}`);
    }
    
    update(particle: Particle): void {
        // 更新粒子位置
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // 简单的重力效果
        particle.velocity.y += 0.1;
        
        // 减少生命周期
        particle.life -= 1;
    }
}

// 粒子类型工厂
class ParticleTypeFactory {
    private static particleTypes: Map<string, ParticleType> = new Map();
    
    static getParticleType(sprite: string, size: number): ParticleType {
        const key = `${sprite}-${size}`;
        
        if (!this.particleTypes.has(key)) {
            console.log(`Creating particle type: ${key}`);
            this.particleTypes.set(key, new ConcreteParticleType(sprite, size));
        }
        
        return this.particleTypes.get(key)!;
    }
    
    static getTypeCount(): number {
        return this.particleTypes.size;
    }
}

// 粒子上下文类
class Particle {
    public x: number;
    public y: number;
    public velocity: { x: number; y: number };
    public color: string;
    public life: number;
    private particleType: ParticleType;
    
    constructor(
        x: number, 
        y: number, 
        velocity: { x: number; y: number }, 
        color: string, 
        life: number,
        particleType: ParticleType
    ) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.color = color;
        this.life = life;
        this.particleType = particleType;
    }
    
    update(): void {
        this.particleType.update(this);
    }
    
    render(): void {
        this.particleType.render(this.x, this.y, this.velocity, this.color);
    }
    
    isAlive(): boolean {
        return this.life > 0;
    }
}

// 粒子系统
class ParticleSystem {
    private particles: Particle[] = [];
    
    createExplosion(x: number, y: number, particleCount: number = 10): void {
        console.log(`\nCreating explosion at (${x}, ${y}) with ${particleCount} particles`);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Math.random() * 3 + 1;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            const colors = ['red', 'orange', 'yellow'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = Math.floor(Math.random() * 50) + 30;
            
            // 使用享元模式创建粒子类型
            const particleType = ParticleTypeFactory.getParticleType('spark', 2);
            
            const particle = new Particle(x, y, velocity, color, life, particleType);
            this.particles.push(particle);
        }
    }
    
    createSmoke(x: number, y: number, particleCount: number = 5): void {
        console.log(`Creating smoke at (${x}, ${y}) with ${particleCount} particles`);
        
        for (let i = 0; i < particleCount; i++) {
            const velocity = {
                x: (Math.random() - 0.5) * 0.5,
                y: -Math.random() * 2 - 1
            };
            
            const grays = ['lightgray', 'gray', 'darkgray'];
            const color = grays[Math.floor(Math.random() * grays.length)];
            const life = Math.floor(Math.random() * 100) + 50;
            
            const particleType = ParticleTypeFactory.getParticleType('cloud', 4);
            
            const particle = new Particle(x, y, velocity, color, life, particleType);
            this.particles.push(particle);
        }
    }
    
    update(): void {
        // 更新所有粒子
        this.particles.forEach(particle => particle.update());
        
        // 移除死亡的粒子
        this.particles = this.particles.filter(particle => particle.isAlive());
    }
    
    render(): void {
        if (this.particles.length > 0) {
            console.log(`\n--- Rendering ${this.particles.length} particles ---`);
            this.particles.forEach(particle => particle.render());
        }
    }
    
    getParticleCount(): number {
        return this.particles.length;
    }
    
    getStats(): void {
        console.log(`\n=== Particle System Stats ===`);
        console.log(`Active particles: ${this.getParticleCount()}`);
        console.log(`Particle types created: ${ParticleTypeFactory.getTypeCount()}`);
    }
}

// 使用示例
const particleSystem = new ParticleSystem();

// 创建多个爆炸效果
particleSystem.createExplosion(100, 100, 8);
particleSystem.createExplosion(200, 150, 6);
particleSystem.createSmoke(150, 200, 4);

// 模拟几帧更新
for (let frame = 0; frame < 3; frame++) {
    console.log(`\n=== Frame ${frame + 1} ===`);
    particleSystem.render();
    particleSystem.update();
}

particleSystem.getStats();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **内存节省**：大大减少内存中对象的数量
2. **性能提升**：减少对象创建的开销
3. **集中管理**：享元对象可以集中控制状态
4. **可扩展性**：支持大量对象的应用

### ❌ 缺点
1. **复杂性增加**：需要分离内部状态和外部状态
2. **运行时开销**：可能需要重新计算外部状态
3. **线程安全**：共享对象需要考虑线程安全问题

## 🌟 实际应用案例

### 网页元素缓存

```typescript
// 网页元素享元
interface WebElement {
    render(content: string, x: number, y: number, width: number, height: number): void;
}

class ConcreteWebElement implements WebElement {
    private tagName: string;
    private className: string;
    private styles: Record<string, string>;
    
    constructor(tagName: string, className: string, styles: Record<string, string>) {
        this.tagName = tagName;
        this.className = className;
        this.styles = styles;
    }
    
    render(content: string, x: number, y: number, width: number, height: number): void {
        console.log(`<${this.tagName} class="${this.className}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px">${content}</${this.tagName}>`);
    }
}

class WebElementFactory {
    private static elements: Map<string, WebElement> = new Map();
    
    static getElement(tagName: string, className: string, styles: Record<string, string>): WebElement {
        const key = `${tagName}-${className}-${JSON.stringify(styles)}`;
        
        if (!this.elements.has(key)) {
            this.elements.set(key, new ConcreteWebElement(tagName, className, styles));
        }
        
        return this.elements.get(key)!;
    }
    
    static getElementCount(): number {
        return this.elements.size;
    }
}

// 网页组件
class WebComponent {
    private element: WebElement;
    private content: string;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    
    constructor(
        tagName: string,
        className: string,
        styles: Record<string, string>,
        content: string,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.element = WebElementFactory.getElement(tagName, className, styles);
        this.content = content;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    render(): void {
        this.element.render(this.content, this.x, this.y, this.width, this.height);
    }
}

// 网页
class WebPage {
    private components: WebComponent[] = [];
    
    addButton(text: string, x: number, y: number): void {
        const button = new WebComponent(
            'button',
            'btn btn-primary',
            { backgroundColor: 'blue', color: 'white', border: 'none' },
            text,
            x,
            y,
            100,
            30
        );
        this.components.push(button);
    }
    
    addLabel(text: string, x: number, y: number): void {
        const label = new WebComponent(
            'span',
            'label',
            { fontSize: '14px', color: 'black' },
            text,
            x,
            y,
            200,
            20
        );
        this.components.push(label);
    }
    
    render(): void {
        console.log('\n=== Rendering Web Page ===');
        this.components.forEach(component => component.render());
        console.log(`\nComponents: ${this.components.length}, Element types: ${WebElementFactory.getElementCount()}`);
    }
}

// 使用示例
const webPage = new WebPage();

webPage.addButton('Submit', 10, 10);
webPage.addButton('Cancel', 120, 10);
webPage.addButton('Reset', 230, 10);
webPage.addLabel('Name:', 10, 50);
webPage.addLabel('Email:', 10, 80);
webPage.addLabel('Phone:', 10, 110);

webPage.render();
```

## 🔄 相关模式

- **单例模式**：享元工厂通常使用单例模式实现
- **工厂模式**：享元工厂负责创建和管理享元对象
- **组合模式**：享元模式常与组合模式结合使用
- **状态模式**：可以用享元实现状态对象的共享

## 🚀 最佳实践

1. **状态分离**：正确识别和分离内部状态与外部状态
2. **工厂管理**：使用工厂模式管理享元对象的创建
3. **线程安全**：确保享元对象的线程安全性
4. **内存监控**：监控内存使用情况，确保享元模式的效果

## ⚠️ 注意事项

1. **状态管理**：确保内部状态不可变，外部状态正确传递
2. **对象生命周期**：享元对象通常不应该被删除
3. **性能权衡**：在对象数量不大时，享元模式可能不值得使用
4. **复杂度控制**：避免过度使用导致代码复杂度增加

## 📚 总结

享元模式通过共享技术有效地支持大量细粒度对象的复用，在需要创建大量相似对象的场景中能够显著节省内存和提高性能。

**使用建议**：
- 当应用程序需要生成大量相似对象时使用
- 当对象的存储开销很大时使用
- 当对象的大部分状态都可以外部化时使用
- 当需要优化内存使用时使用

---

**相关链接**：
- [单例模式](../creational/singleton.md)
- [工厂方法模式](../creational/factory-method.md)
- [组合模式](./composite.md) 