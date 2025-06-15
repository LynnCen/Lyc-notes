# 抽象工厂模式 (Abstract Factory Pattern)

> [!NOTE]
> 抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

## 📖 模式定义

**抽象工厂模式**是一种创建型设计模式，它提供了一种方式，可以将一组具有同一主题的单独的工厂封装起来。在正常使用中，客户端程序需要创建抽象工厂的具体实现，然后使用抽象工厂作为接口来创建这一主题的具体对象。

### 核心要素
- **抽象工厂 (Abstract Factory)**：声明创建抽象产品对象的操作接口
- **具体工厂 (Concrete Factory)**：实现创建具体产品对象的操作
- **抽象产品 (Abstract Product)**：为一类产品对象声明接口
- **具体产品 (Concrete Product)**：定义一个将被相应的具体工厂创建的产品对象

## 🎯 使用场景

### 适用情况
- **产品族创建**：系统需要创建多个产品族中的产品对象
- **平台无关性**：系统需要独立于产品的创建、组合和表示
- **产品约束**：系统需要由多个产品族中的一个来配置
- **产品一致性**：产品族中的产品需要一起使用的约束

### 不适用情况
- 产品族很少变化
- 只有单一产品族
- 产品创建逻辑简单

## 💡 实现方式

### TypeScript 实现

#### 1. GUI 组件工厂示例

```typescript
// 抽象产品 - 按钮
interface Button {
    render(): void;
    onClick(callback: () => void): void;
}

// 抽象产品 - 复选框
interface Checkbox {
    render(): void;
    toggle(): void;
}

// Windows 风格按钮
class WindowsButton implements Button {
    render(): void {
        console.log('渲染 Windows 风格按钮');
    }
    
    onClick(callback: () => void): void {
        console.log('Windows 按钮点击事件');
        callback();
    }
}

// Windows 风格复选框
class WindowsCheckbox implements Checkbox {
    private checked = false;
    
    render(): void {
        console.log('渲染 Windows 风格复选框');
    }
    
    toggle(): void {
        this.checked = !this.checked;
        console.log(`Windows 复选框状态: ${this.checked}`);
    }
}

// macOS 风格按钮
class MacButton implements Button {
    render(): void {
        console.log('渲染 macOS 风格按钮');
    }
    
    onClick(callback: () => void): void {
        console.log('macOS 按钮点击事件');
        callback();
    }
}

// macOS 风格复选框
class MacCheckbox implements Checkbox {
    private checked = false;
    
    render(): void {
        console.log('渲染 macOS 风格复选框');
    }
    
    toggle(): void {
        this.checked = !this.checked;
        console.log(`macOS 复选框状态: ${this.checked}`);
    }
}

// 抽象工厂
interface GUIFactory {
    createButton(): Button;
    createCheckbox(): Checkbox;
}

// Windows 工厂
class WindowsFactory implements GUIFactory {
    createButton(): Button {
        return new WindowsButton();
    }
    
    createCheckbox(): Checkbox {
        return new WindowsCheckbox();
    }
}

// macOS 工厂
class MacFactory implements GUIFactory {
    createButton(): Button {
        return new MacButton();
    }
    
    createCheckbox(): Checkbox {
        return new MacCheckbox();
    }
}

// 客户端代码
class Application {
    private button: Button;
    private checkbox: Checkbox;
    
    constructor(factory: GUIFactory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }
    
    render(): void {
        this.button.render();
        this.checkbox.render();
    }
}

// 使用示例
function createApplication(os: string): Application {
    let factory: GUIFactory;
    
    if (os === 'Windows') {
        factory = new WindowsFactory();
    } else if (os === 'Mac') {
        factory = new MacFactory();
    } else {
        throw new Error('不支持的操作系统');
    }
    
    return new Application(factory);
}

// 测试
const windowsApp = createApplication('Windows');
windowsApp.render();

const macApp = createApplication('Mac');
macApp.render();
```

#### 2. 数据库连接工厂示例

```typescript
// 抽象产品 - 连接
interface Connection {
    connect(): void;
    disconnect(): void;
    query(sql: string): any[];
}

// 抽象产品 - 命令
interface Command {
    execute(query: string): void;
}

// MySQL 连接
class MySQLConnection implements Connection {
    connect(): void {
        console.log('连接到 MySQL 数据库');
    }
    
    disconnect(): void {
        console.log('断开 MySQL 连接');
    }
    
    query(sql: string): any[] {
        console.log(`执行 MySQL 查询: ${sql}`);
        return [];
    }
}

// MySQL 命令
class MySQLCommand implements Command {
    constructor(private connection: MySQLConnection) {}
    
    execute(query: string): void {
        console.log(`执行 MySQL 命令: ${query}`);
        this.connection.query(query);
    }
}

// PostgreSQL 连接
class PostgreSQLConnection implements Connection {
    connect(): void {
        console.log('连接到 PostgreSQL 数据库');
    }
    
    disconnect(): void {
        console.log('断开 PostgreSQL 连接');
    }
    
    query(sql: string): any[] {
        console.log(`执行 PostgreSQL 查询: ${sql}`);
        return [];
    }
}

// PostgreSQL 命令
class PostgreSQLCommand implements Command {
    constructor(private connection: PostgreSQLConnection) {}
    
    execute(query: string): void {
        console.log(`执行 PostgreSQL 命令: ${query}`);
        this.connection.query(query);
    }
}

// 抽象工厂
interface DatabaseFactory {
    createConnection(): Connection;
    createCommand(connection: Connection): Command;
}

// MySQL 工厂
class MySQLFactory implements DatabaseFactory {
    createConnection(): Connection {
        return new MySQLConnection();
    }
    
    createCommand(connection: Connection): Command {
        return new MySQLCommand(connection as MySQLConnection);
    }
}

// PostgreSQL 工厂
class PostgreSQLFactory implements DatabaseFactory {
    createConnection(): Connection {
        return new PostgreSQLConnection();
    }
    
    createCommand(connection: Connection): Command {
        return new PostgreSQLCommand(connection as PostgreSQLConnection);
    }
}

// 数据访问层
class DataAccessLayer {
    private connection: Connection;
    private command: Command;
    
    constructor(factory: DatabaseFactory) {
        this.connection = factory.createConnection();
        this.command = factory.createCommand(this.connection);
    }
    
    initialize(): void {
        this.connection.connect();
    }
    
    executeQuery(sql: string): any[] {
        return this.connection.query(sql);
    }
    
    executeCommand(cmd: string): void {
        this.command.execute(cmd);
    }
    
    cleanup(): void {
        this.connection.disconnect();
    }
}

// 使用示例
const mysqlDAL = new DataAccessLayer(new MySQLFactory());
mysqlDAL.initialize();
mysqlDAL.executeQuery('SELECT * FROM users');
mysqlDAL.cleanup();

const postgresDAL = new DataAccessLayer(new PostgreSQLFactory());
postgresDAL.initialize();
postgresDAL.executeQuery('SELECT * FROM products');
postgresDAL.cleanup();
```

#### 3. 游戏角色工厂示例

```typescript
// 抽象产品 - 武器
interface Weapon {
    attack(): number;
    getType(): string;
}

// 抽象产品 - 护甲
interface Armor {
    defend(): number;
    getType(): string;
}

// 抽象产品 - 技能
interface Skill {
    cast(): void;
    getName(): string;
}

// 战士装备
class WarriorSword implements Weapon {
    attack(): number {
        return 50;
    }
    
    getType(): string {
        return '战士之剑';
    }
}

class WarriorArmor implements Armor {
    defend(): number {
        return 30;
    }
    
    getType(): string {
        return '重型护甲';
    }
}

class WarriorSkill implements Skill {
    cast(): void {
        console.log('释放战士技能：冲锋');
    }
    
    getName(): string {
        return '冲锋';
    }
}

// 法师装备
class MageStaff implements Weapon {
    attack(): number {
        return 35;
    }
    
    getType(): string {
        return '法师法杖';
    }
}

class MageRobe implements Armor {
    defend(): number {
        return 15;
    }
    
    getType(): string {
        return '法师长袍';
    }
}

class MageSkill implements Skill {
    cast(): void {
        console.log('释放法师技能：火球术');
    }
    
    getName(): string {
        return '火球术';
    }
}

// 抽象工厂
interface CharacterFactory {
    createWeapon(): Weapon;
    createArmor(): Armor;
    createSkill(): Skill;
}

// 战士工厂
class WarriorFactory implements CharacterFactory {
    createWeapon(): Weapon {
        return new WarriorSword();
    }
    
    createArmor(): Armor {
        return new WarriorArmor();
    }
    
    createSkill(): Skill {
        return new WarriorSkill();
    }
}

// 法师工厂
class MageFactory implements CharacterFactory {
    createWeapon(): Weapon {
        return new MageStaff();
    }
    
    createArmor(): Armor {
        return new MageRobe();
    }
    
    createSkill(): Skill {
        return new MageSkill();
    }
}

// 游戏角色
class GameCharacter {
    private weapon: Weapon;
    private armor: Armor;
    private skill: Skill;
    
    constructor(factory: CharacterFactory) {
        this.weapon = factory.createWeapon();
        this.armor = factory.createArmor();
        this.skill = factory.createSkill();
    }
    
    displayInfo(): void {
        console.log(`武器: ${this.weapon.getType()}, 攻击力: ${this.weapon.attack()}`);
        console.log(`护甲: ${this.armor.getType()}, 防御力: ${this.armor.defend()}`);
        console.log(`技能: ${this.skill.getName()}`);
    }
    
    useSkill(): void {
        this.skill.cast();
    }
}

// 使用示例
const warrior = new GameCharacter(new WarriorFactory());
warrior.displayInfo();
warrior.useSkill();

const mage = new GameCharacter(new MageFactory());
mage.displayInfo();
mage.useSkill();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **产品一致性**：确保同一族的产品能够一起工作
2. **易于切换**：可以轻松切换整个产品族
3. **符合开闭原则**：增加新的产品族不需要修改现有代码
4. **分离具体类**：客户端代码与具体产品类分离

### ❌ 缺点
1. **复杂性增加**：增加了系统的复杂性和理解难度
2. **扩展困难**：在产品族中增加新产品需要修改所有工厂
3. **代码量大**：需要创建大量的类和接口

## 🌟 实际应用案例

### 1. 跨平台 UI 框架

```typescript
// React Native 风格的跨平台组件工厂
interface PlatformComponentFactory {
    createButton(): Button;
    createInput(): Input;
    createModal(): Modal;
}

class IOSComponentFactory implements PlatformComponentFactory {
    createButton(): Button {
        return new IOSButton();
    }
    
    createInput(): Input {
        return new IOSInput();
    }
    
    createModal(): Modal {
        return new IOSModal();
    }
}

class AndroidComponentFactory implements PlatformComponentFactory {
    createButton(): Button {
        return new AndroidButton();
    }
    
    createInput(): Input {
        return new AndroidInput();
    }
    
    createModal(): Modal {
        return new AndroidModal();
    }
}
```

### 2. 主题系统

```typescript
// 网站主题工厂
interface ThemeFactory {
    createColors(): ColorScheme;
    createFonts(): FontScheme;
    createSpacing(): SpacingScheme;
}

class DarkThemeFactory implements ThemeFactory {
    createColors(): ColorScheme {
        return new DarkColorScheme();
    }
    
    createFonts(): FontScheme {
        return new DarkFontScheme();
    }
    
    createSpacing(): SpacingScheme {
        return new CompactSpacingScheme();
    }
}

class LightThemeFactory implements ThemeFactory {
    createColors(): ColorScheme {
        return new LightColorScheme();
    }
    
    createFonts(): FontScheme {
        return new LightFontScheme();
    }
    
    createSpacing(): SpacingScheme {
        return new StandardSpacingScheme();
    }
}
```

## 🔄 相关模式

- **工厂方法模式**：抽象工厂通常使用工厂方法来实现
- **单例模式**：具体工厂通常设计为单例
- **原型模式**：具体工厂可以使用原型模式来创建产品

## 🚀 最佳实践

1. **产品族设计**：确保产品族中的产品能够协同工作
2. **工厂注册**：使用注册机制来管理工厂实例
3. **配置驱动**：通过配置文件来决定使用哪个工厂
4. **接口隔离**：为不同的产品族定义不同的接口

## ⚠️ 注意事项

1. **避免过度设计**：只有在确实需要产品族时才使用
2. **扩展性考虑**：设计时要考虑未来可能的产品扩展
3. **性能影响**：工厂创建可能带来性能开销
4. **测试复杂性**：需要为每个工厂编写测试用例

## 📚 总结

抽象工厂模式提供了一种创建相关对象族的方式，特别适用于需要保证产品一致性的场景。

**使用建议**：
- 当系统需要独立于产品创建时使用
- 当需要配置多个产品族时使用
- 当产品族中的产品需要一起使用时使用

---

**相关链接**：
- [工厂方法模式](./factory-method.md)
- [建造者模式](./builder.md)
- [其他创建型模式](../index.md#创建型模式) 