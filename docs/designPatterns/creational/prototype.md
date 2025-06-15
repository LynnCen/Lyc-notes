# 原型模式 (Prototype Pattern)

> [!NOTE]
> 原型模式通过复制现有实例来创建新对象，而不是通过实例化类。这种模式在创建对象的成本较高时特别有用。

## 📖 模式定义

**原型模式**是一种创建型设计模式，它允许复制已有对象，而无需使代码依赖它们所属的类。该模式将克隆过程委派给被克隆的实际对象。

### 核心要素
- **原型接口**：声明克隆方法的接口
- **具体原型**：实现克隆方法的类
- **客户端**：通过调用克隆方法来创建新对象

## 🎯 使用场景

### 适用情况
- **对象创建成本高**：初始化对象需要大量资源或时间
- **避免子类创建**：不想创建与产品类层次平行的工厂类层次
- **运行时确定对象**：需要在运行时确定要创建的对象类型
- **对象状态变化少**：对象的状态变化相对较少
- **配置对象**：需要创建具有特定配置的对象副本

### 不适用情况
- 对象创建简单且成本低
- 对象包含循环引用
- 对象状态经常变化

## 💡 实现方式

### TypeScript 实现

```typescript
// 原型接口
interface Cloneable {
    clone(): Cloneable;
}

// 具体原型 - 图形基类
abstract class Shape implements Cloneable {
    public x: number = 0;
    public y: number = 0;
    public color: string = '';
    
    constructor(source?: Shape) {
        if (source) {
            this.x = source.x;
            this.y = source.y;
            this.color = source.color;
        }
    }
    
    abstract clone(): Shape;
    abstract draw(): void;
}

// 具体原型 - 圆形
class Circle extends Shape {
    public radius: number = 0;
    
    constructor(source?: Circle) {
        super(source);
        if (source) {
            this.radius = source.radius;
        }
    }
    
    clone(): Circle {
        return new Circle(this);
    }
    
    draw(): void {
        console.log(`Drawing Circle at (${this.x}, ${this.y}) with radius ${this.radius} and color ${this.color}`);
    }
}

// 具体原型 - 矩形
class Rectangle extends Shape {
    public width: number = 0;
    public height: number = 0;
    
    constructor(source?: Rectangle) {
        super(source);
        if (source) {
            this.width = source.width;
            this.height = source.height;
        }
    }
    
    clone(): Rectangle {
        return new Rectangle(this);
    }
    
    draw(): void {
        console.log(`Drawing Rectangle at (${this.x}, ${this.y}) with size ${this.width}x${this.height} and color ${this.color}`);
    }
}

// 原型管理器
class ShapePrototypeManager {
    private prototypes: Map<string, Shape> = new Map();
    
    registerPrototype(name: string, prototype: Shape): void {
        this.prototypes.set(name, prototype);
    }
    
    createShape(name: string): Shape | null {
        const prototype = this.prototypes.get(name);
        return prototype ? prototype.clone() : null;
    }
    
    listPrototypes(): string[] {
        return Array.from(this.prototypes.keys());
    }
}

// 使用示例
const manager = new ShapePrototypeManager();

// 创建原型
const redCircle = new Circle();
redCircle.x = 10;
redCircle.y = 20;
redCircle.radius = 15;
redCircle.color = 'red';

const blueRectangle = new Rectangle();
blueRectangle.x = 5;
blueRectangle.y = 10;
blueRectangle.width = 30;
blueRectangle.height = 20;
blueRectangle.color = 'blue';

// 注册原型
manager.registerPrototype('redCircle', redCircle);
manager.registerPrototype('blueRectangle', blueRectangle);

// 克隆对象
const clonedCircle = manager.createShape('redCircle') as Circle;
const clonedRectangle = manager.createShape('blueRectangle') as Rectangle;

// 修改克隆对象
clonedCircle.x = 100;
clonedCircle.color = 'green';

clonedRectangle.width = 50;

// 绘制原型和克隆对象
console.log('Original shapes:');
redCircle.draw();
blueRectangle.draw();

console.log('\nCloned shapes:');
clonedCircle.draw();
clonedRectangle.draw();
```

### 深拷贝实现

```typescript
// 支持深拷贝的复杂对象
class ComplexObject implements Cloneable {
    public id: string;
    public data: any;
    public children: ComplexObject[] = [];
    public metadata: Map<string, any> = new Map();
    
    constructor(id: string, data: any = {}) {
        this.id = id;
        this.data = { ...data };
    }
    
    addChild(child: ComplexObject): void {
        this.children.push(child);
    }
    
    setMetadata(key: string, value: any): void {
        this.metadata.set(key, value);
    }
    
    // 深拷贝实现
    clone(): ComplexObject {
        const cloned = new ComplexObject(this.id, this.data);
        
        // 深拷贝子对象
        cloned.children = this.children.map(child => child.clone());
        
        // 深拷贝元数据
        cloned.metadata = new Map(this.metadata);
        
        return cloned;
    }
    
    // 浅拷贝实现
    shallowClone(): ComplexObject {
        const cloned = new ComplexObject(this.id, this.data);
        cloned.children = [...this.children]; // 浅拷贝数组
        cloned.metadata = new Map(this.metadata);
        return cloned;
    }
    
    toString(): string {
        return `ComplexObject(${this.id}) with ${this.children.length} children`;
    }
}

// 使用示例
const parent = new ComplexObject('parent', { name: 'Parent Object' });
parent.setMetadata('created', new Date());

const child1 = new ComplexObject('child1', { name: 'Child 1' });
const child2 = new ComplexObject('child2', { name: 'Child 2' });

parent.addChild(child1);
parent.addChild(child2);

// 深拷贝
const deepClone = parent.clone();
deepClone.id = 'parent-clone';
deepClone.children[0].id = 'child1-clone';

console.log('Original:', parent.toString());
console.log('Deep Clone:', deepClone.toString());
console.log('Original child1 ID:', parent.children[0].id);
console.log('Clone child1 ID:', deepClone.children[0].id);
```

### Java 实现

```java
// 原型接口
interface Prototype extends Cloneable {
    Prototype clone();
}

// 具体原型 - 文档类
class Document implements Prototype {
    private String title;
    private String content;
    private List<String> tags;
    private Date createdDate;
    
    public Document(String title, String content) {
        this.title = title;
        this.content = content;
        this.tags = new ArrayList<>();
        this.createdDate = new Date();
    }
    
    // 拷贝构造函数
    public Document(Document source) {
        this.title = source.title;
        this.content = source.content;
        this.tags = new ArrayList<>(source.tags);
        this.createdDate = new Date(source.createdDate.getTime());
    }
    
    @Override
    public Document clone() {
        return new Document(this);
    }
    
    // Getter和Setter方法
    public void setTitle(String title) { this.title = title; }
    public String getTitle() { return title; }
    
    public void setContent(String content) { this.content = content; }
    public String getContent() { return content; }
    
    public void addTag(String tag) { this.tags.add(tag); }
    public List<String> getTags() { return new ArrayList<>(tags); }
    
    public Date getCreatedDate() { return new Date(createdDate.getTime()); }
    
    @Override
    public String toString() {
        return String.format("Document{title='%s', content='%s', tags=%s, created=%s}",
                title, content, tags, createdDate);
    }
}

// 原型注册表
class DocumentPrototypeRegistry {
    private Map<String, Document> prototypes = new HashMap<>();
    
    public void registerPrototype(String key, Document prototype) {
        prototypes.put(key, prototype);
    }
    
    public Document createDocument(String key) {
        Document prototype = prototypes.get(key);
        return prototype != null ? prototype.clone() : null;
    }
    
    public Set<String> getAvailableTypes() {
        return prototypes.keySet();
    }
}

// 使用示例
public class PrototypePatternExample {
    public static void main(String[] args) {
        DocumentPrototypeRegistry registry = new DocumentPrototypeRegistry();
        
        // 创建原型文档
        Document reportTemplate = new Document("Monthly Report", "Report content template");
        reportTemplate.addTag("report");
        reportTemplate.addTag("monthly");
        
        Document letterTemplate = new Document("Business Letter", "Dear [Name],\n\nContent...\n\nSincerely,");
        letterTemplate.addTag("letter");
        letterTemplate.addTag("business");
        
        // 注册原型
        registry.registerPrototype("report", reportTemplate);
        registry.registerPrototype("letter", letterTemplate);
        
        // 使用原型创建新文档
        Document newReport = registry.createDocument("report");
        newReport.setTitle("Q1 Sales Report");
        newReport.setContent("Q1 sales data and analysis...");
        
        Document newLetter = registry.createDocument("letter");
        newLetter.setTitle("Welcome Letter");
        newLetter.setContent("Dear John,\n\nWelcome to our company!\n\nSincerely,");
        
        System.out.println("Original report template: " + reportTemplate);
        System.out.println("New report: " + newReport);
        System.out.println("New letter: " + newLetter);
    }
}
```

### Python 实现

```python
import copy
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime

# 原型接口
class Prototype(ABC):
    @abstractmethod
    def clone(self):
        pass

# 具体原型 - 游戏角色
class GameCharacter(Prototype):
    def __init__(self, name: str, character_class: str):
        self.name = name
        self.character_class = character_class
        self.level = 1
        self.health = 100
        self.mana = 50
        self.equipment = []
        self.skills = []
        self.stats = {
            'strength': 10,
            'agility': 10,
            'intelligence': 10
        }
        self.created_at = datetime.now()
    
    def add_equipment(self, item: str):
        self.equipment.append(item)
    
    def add_skill(self, skill: str):
        self.skills.append(skill)
    
    def level_up(self):
        self.level += 1
        self.health += 20
        self.mana += 10
    
    def clone(self):
        # 使用深拷贝确保所有嵌套对象都被复制
        return copy.deepcopy(self)
    
    def shallow_clone(self):
        # 浅拷贝实现
        cloned = GameCharacter(self.name, self.character_class)
        cloned.level = self.level
        cloned.health = self.health
        cloned.mana = self.mana
        cloned.equipment = self.equipment.copy()  # 浅拷贝列表
        cloned.skills = self.skills.copy()
        cloned.stats = self.stats.copy()  # 浅拷贝字典
        return cloned
    
    def __str__(self):
        return (f"{self.name} ({self.character_class}) - Level {self.level}, "
                f"HP: {self.health}, MP: {self.mana}, "
                f"Equipment: {len(self.equipment)} items, "
                f"Skills: {len(self.skills)} skills")

# 原型工厂
class CharacterPrototypeFactory:
    def __init__(self):
        self._prototypes: Dict[str, GameCharacter] = {}
    
    def register_prototype(self, key: str, prototype: GameCharacter):
        self._prototypes[key] = prototype
    
    def create_character(self, key: str) -> GameCharacter:
        prototype = self._prototypes.get(key)
        if prototype:
            return prototype.clone()
        raise ValueError(f"Prototype '{key}' not found")
    
    def get_available_types(self) -> List[str]:
        return list(self._prototypes.keys())

# 预配置的角色模板
def create_character_templates() -> CharacterPrototypeFactory:
    factory = CharacterPrototypeFactory()
    
    # 战士模板
    warrior = GameCharacter("Warrior Template", "Warrior")
    warrior.stats['strength'] = 15
    warrior.stats['agility'] = 8
    warrior.stats['intelligence'] = 7
    warrior.health = 120
    warrior.mana = 30
    warrior.add_equipment("Iron Sword")
    warrior.add_equipment("Leather Armor")
    warrior.add_skill("Slash")
    warrior.add_skill("Block")
    
    # 法师模板
    mage = GameCharacter("Mage Template", "Mage")
    mage.stats['strength'] = 6
    mage.stats['agility'] = 9
    mage.stats['intelligence'] = 15
    mage.health = 80
    mage.mana = 100
    mage.add_equipment("Magic Staff")
    mage.add_equipment("Robe")
    mage.add_skill("Fireball")
    mage.add_skill("Heal")
    
    # 盗贼模板
    rogue = GameCharacter("Rogue Template", "Rogue")
    rogue.stats['strength'] = 8
    rogue.stats['agility'] = 15
    rogue.stats['intelligence'] = 7
    rogue.health = 90
    rogue.mana = 60
    rogue.add_equipment("Dagger")
    rogue.add_equipment("Leather Armor")
    rogue.add_skill("Stealth")
    rogue.add_skill("Backstab")
    
    # 注册模板
    factory.register_prototype("warrior", warrior)
    factory.register_prototype("mage", mage)
    factory.register_prototype("rogue", rogue)
    
    return factory

# 使用示例
if __name__ == "__main__":
    # 创建角色工厂
    factory = create_character_templates()
    
    print("Available character types:", factory.get_available_types())
    
    # 创建新角色
    player1 = factory.create_character("warrior")
    player1.name = "Conan"
    player1.level_up()
    player1.add_equipment("Steel Sword")
    
    player2 = factory.create_character("mage")
    player2.name = "Gandalf"
    player2.level_up()
    player2.level_up()
    player2.add_skill("Lightning Bolt")
    
    player3 = factory.create_character("rogue")
    player3.name = "Robin"
    player3.add_equipment("Poison Dagger")
    
    print("\nCreated characters:")
    print(player1)
    print(player2)
    print(player3)
    
    # 验证原型没有被修改
    original_warrior = factory.create_character("warrior")
    print(f"\nOriginal warrior template: {original_warrior}")
    print(f"Modified warrior: {player1}")
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **性能优势**：避免重复的初始化操作
2. **简化对象创建**：不需要知道具体类就能创建对象
3. **动态配置**：可以在运行时添加或删除原型
4. **减少子类**：避免创建与产品类层次平行的工厂类
5. **保持状态**：可以保存对象的特定状态

### ❌ 缺点
1. **循环引用问题**：深拷贝时可能遇到循环引用
2. **克隆复杂对象困难**：包含复杂引用的对象难以克隆
3. **克隆方法实现复杂**：需要仔细实现克隆逻辑

## 🌟 实际应用案例

### 1. 配置对象原型

```typescript
// 应用配置原型
class ApplicationConfig implements Cloneable {
    public database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    
    public server: {
        port: number;
        host: string;
        ssl: boolean;
    };
    
    public features: {
        enableLogging: boolean;
        enableCaching: boolean;
        enableMetrics: boolean;
    };
    
    public environment: string;
    
    constructor() {
        this.database = {
            host: 'localhost',
            port: 5432,
            username: '',
            password: '',
            database: ''
        };
        
        this.server = {
            port: 3000,
            host: '0.0.0.0',
            ssl: false
        };
        
        this.features = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false
        };
        
        this.environment = 'development';
    }
    
    clone(): ApplicationConfig {
        const cloned = new ApplicationConfig();
        cloned.database = { ...this.database };
        cloned.server = { ...this.server };
        cloned.features = { ...this.features };
        cloned.environment = this.environment;
        return cloned;
    }
}

// 配置管理器
class ConfigurationManager {
    private templates: Map<string, ApplicationConfig> = new Map();
    
    constructor() {
        this.initializeTemplates();
    }
    
    private initializeTemplates(): void {
        // 开发环境模板
        const devConfig = new ApplicationConfig();
        devConfig.environment = 'development';
        devConfig.database.host = 'localhost';
        devConfig.database.database = 'myapp_dev';
        devConfig.features.enableLogging = true;
        devConfig.features.enableMetrics = true;
        
        // 生产环境模板
        const prodConfig = new ApplicationConfig();
        prodConfig.environment = 'production';
        prodConfig.database.host = 'prod-db.example.com';
        prodConfig.database.database = 'myapp_prod';
        prodConfig.server.ssl = true;
        prodConfig.features.enableLogging = true;
        prodConfig.features.enableCaching = true;
        prodConfig.features.enableMetrics = true;
        
        // 测试环境模板
        const testConfig = new ApplicationConfig();
        testConfig.environment = 'test';
        testConfig.database.host = 'test-db.example.com';
        testConfig.database.database = 'myapp_test';
        testConfig.features.enableLogging = false;
        
        this.templates.set('development', devConfig);
        this.templates.set('production', prodConfig);
        this.templates.set('test', testConfig);
    }
    
    getConfig(environment: string): ApplicationConfig {
        const template = this.templates.get(environment);
        if (!template) {
            throw new Error(`Configuration template for '${environment}' not found`);
        }
        return template.clone();
    }
    
    createCustomConfig(baseEnvironment: string, customizations: any): ApplicationConfig {
        const config = this.getConfig(baseEnvironment);
        
        // 应用自定义配置
        if (customizations.database) {
            Object.assign(config.database, customizations.database);
        }
        if (customizations.server) {
            Object.assign(config.server, customizations.server);
        }
        if (customizations.features) {
            Object.assign(config.features, customizations.features);
        }
        
        return config;
    }
}

// 使用示例
const configManager = new ConfigurationManager();

// 获取标准配置
const devConfig = configManager.getConfig('development');
const prodConfig = configManager.getConfig('production');

// 创建自定义配置
const customConfig = configManager.createCustomConfig('production', {
    database: {
        host: 'custom-db.example.com',
        port: 5433
    },
    server: {
        port: 8080
    },
    features: {
        enableCaching: false
    }
});

console.log('Development config:', devConfig);
console.log('Custom production config:', customConfig);
```

### 2. 图形编辑器中的图形克隆

```typescript
// 图形编辑器中的图形对象
abstract class GraphicElement implements Cloneable {
    public id: string;
    public x: number = 0;
    public y: number = 0;
    public rotation: number = 0;
    public scale: number = 1;
    public visible: boolean = true;
    public style: {
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        opacity: number;
    };
    
    constructor(id: string) {
        this.id = id;
        this.style = {
            fillColor: '#ffffff',
            strokeColor: '#000000',
            strokeWidth: 1,
            opacity: 1
        };
    }
    
    abstract clone(): GraphicElement;
    abstract render(): void;
    abstract getBounds(): { width: number; height: number };
}

// 文本元素
class TextElement extends GraphicElement {
    public text: string;
    public fontSize: number;
    public fontFamily: string;
    
    constructor(id: string, text: string = '') {
        super(id);
        this.text = text;
        this.fontSize = 14;
        this.fontFamily = 'Arial';
    }
    
    clone(): TextElement {
        const cloned = new TextElement(this.id + '_copy', this.text);
        cloned.x = this.x;
        cloned.y = this.y;
        cloned.rotation = this.rotation;
        cloned.scale = this.scale;
        cloned.visible = this.visible;
        cloned.style = { ...this.style };
        cloned.fontSize = this.fontSize;
        cloned.fontFamily = this.fontFamily;
        return cloned;
    }
    
    render(): void {
        console.log(`Rendering text "${this.text}" at (${this.x}, ${this.y})`);
    }
    
    getBounds(): { width: number; height: number } {
        return { width: this.text.length * this.fontSize * 0.6, height: this.fontSize };
    }
}

// 图像元素
class ImageElement extends GraphicElement {
    public src: string;
    public width: number;
    public height: number;
    
    constructor(id: string, src: string = '') {
        super(id);
        this.src = src;
        this.width = 100;
        this.height = 100;
    }
    
    clone(): ImageElement {
        const cloned = new ImageElement(this.id + '_copy', this.src);
        cloned.x = this.x;
        cloned.y = this.y;
        cloned.rotation = this.rotation;
        cloned.scale = this.scale;
        cloned.visible = this.visible;
        cloned.style = { ...this.style };
        cloned.width = this.width;
        cloned.height = this.height;
        return cloned;
    }
    
    render(): void {
        console.log(`Rendering image "${this.src}" at (${this.x}, ${this.y}) size ${this.width}x${this.height}`);
    }
    
    getBounds(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }
}

// 图形编辑器
class GraphicEditor {
    private elements: GraphicElement[] = [];
    private clipboard: GraphicElement[] = [];
    
    addElement(element: GraphicElement): void {
        this.elements.push(element);
    }
    
    selectElements(ids: string[]): GraphicElement[] {
        return this.elements.filter(element => ids.includes(element.id));
    }
    
    copyElements(ids: string[]): void {
        const selectedElements = this.selectElements(ids);
        this.clipboard = selectedElements.map(element => element.clone());
        console.log(`Copied ${this.clipboard.length} elements to clipboard`);
    }
    
    pasteElements(offsetX: number = 10, offsetY: number = 10): void {
        const pastedElements = this.clipboard.map(element => {
            const cloned = element.clone();
            cloned.id = this.generateUniqueId();
            cloned.x += offsetX;
            cloned.y += offsetY;
            return cloned;
        });
        
        this.elements.push(...pastedElements);
        console.log(`Pasted ${pastedElements.length} elements`);
    }
    
    duplicateElements(ids: string[], offsetX: number = 10, offsetY: number = 10): void {
        const selectedElements = this.selectElements(ids);
        const duplicatedElements = selectedElements.map(element => {
            const cloned = element.clone();
            cloned.id = this.generateUniqueId();
            cloned.x += offsetX;
            cloned.y += offsetY;
            return cloned;
        });
        
        this.elements.push(...duplicatedElements);
        console.log(`Duplicated ${duplicatedElements.length} elements`);
    }
    
    private generateUniqueId(): string {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    renderAll(): void {
        console.log('Rendering all elements:');
        this.elements.forEach(element => {
            if (element.visible) {
                element.render();
            }
        });
    }
    
    getElementCount(): number {
        return this.elements.length;
    }
}

// 使用示例
const editor = new GraphicEditor();

// 创建一些图形元素
const text1 = new TextElement('text1', 'Hello World');
text1.x = 50;
text1.y = 100;
text1.fontSize = 18;

const image1 = new ImageElement('image1', 'logo.png');
image1.x = 200;
image1.y = 150;
image1.width = 120;
image1.height = 80;

// 添加到编辑器
editor.addElement(text1);
editor.addElement(image1);

console.log(`Initial element count: ${editor.getElementCount()}`);

// 复制和粘贴
editor.copyElements(['text1', 'image1']);
editor.pasteElements(20, 20);

console.log(`After paste element count: ${editor.getElementCount()}`);

// 直接复制
editor.duplicateElements(['text1'], 0, 50);

console.log(`After duplicate element count: ${editor.getElementCount()}`);

// 渲染所有元素
editor.renderAll();
```

## 🔄 相关模式

### 与其他模式的关系
- **工厂方法模式**：原型模式可以简化工厂方法的实现
- **抽象工厂模式**：可以用原型模式实现抽象工厂
- **组合模式**：原型模式常用于复制组合结构
- **装饰器模式**：可以克隆装饰后的对象

### 模式组合

```typescript
// 原型 + 工厂方法
abstract class PrototypeFactory {
    protected prototypes: Map<string, Cloneable> = new Map();
    
    abstract createPrototype(type: string): Cloneable;
    
    registerPrototype(type: string, prototype: Cloneable): void {
        this.prototypes.set(type, prototype);
    }
    
    create(type: string): Cloneable {
        const prototype = this.prototypes.get(type);
        if (!prototype) {
            return this.createPrototype(type);
        }
        return prototype.clone();
    }
}

class ShapePrototypeFactory extends PrototypeFactory {
    createPrototype(type: string): Cloneable {
        switch (type) {
            case 'circle':
                return new Circle();
            case 'rectangle':
                return new Rectangle();
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}
```

## 🚀 最佳实践

### 1. 深拷贝 vs 浅拷贝

```typescript
class SmartCloneable {
    private cloneStrategy: 'shallow' | 'deep' = 'deep';
    
    setCloneStrategy(strategy: 'shallow' | 'deep'): void {
        this.cloneStrategy = strategy;
    }
    
    clone(): this {
        if (this.cloneStrategy === 'shallow') {
            return this.shallowClone();
        } else {
            return this.deepClone();
        }
    }
    
    private shallowClone(): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
    
    private deepClone(): this {
        return JSON.parse(JSON.stringify(this));
    }
}
```

### 2. 原型注册表的线程安全实现

```typescript
class ThreadSafePrototypeRegistry {
    private prototypes: Map<string, Cloneable> = new Map();
    private readonly lock = new Map<string, boolean>();
    
    async register(key: string, prototype: Cloneable): Promise<void> {
        while (this.lock.get(key)) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        this.lock.set(key, true);
        try {
            this.prototypes.set(key, prototype);
        } finally {
            this.lock.delete(key);
        }
    }
    
    async create(key: string): Promise<Cloneable | null> {
        const prototype = this.prototypes.get(key);
        return prototype ? prototype.clone() : null;
    }
}
```

## ⚠️ 注意事项

1. **循环引用**：实现深拷贝时要处理循环引用问题
2. **性能考虑**：深拷贝可能比创建新对象更耗时
3. **克隆方法维护**：添加新属性时要记得更新克隆方法
4. **不可变对象**：考虑是否需要克隆不可变对象
5. **资源管理**：克隆包含资源的对象时要注意资源管理

## 📚 总结

原型模式是一个实用的创建型模式，特别适用于创建成本高或配置复杂的对象。它通过克隆现有对象来避免重复的初始化工作，提供了很好的性能优势。

**使用建议**：
- 当对象的创建成本比较大时使用
- 当需要避免创建与产品类层次平行的工厂类层次时使用
- 当一个系统应该独立于它的产品创建、构成和表示时使用
- 注意深拷贝和浅拷贝的选择
- 合理设计原型注册表来管理原型对象

---

**相关链接**：
- [工厂方法模式](./factory-method.md)
- [抽象工厂模式](./abstract-factory.md)
- [建造者模式](./builder.md) 