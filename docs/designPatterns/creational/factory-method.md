# 工厂方法模式 (Factory Method Pattern)

> [!NOTE]
> 工厂方法模式定义了一个创建对象的接口，但让子类决定实例化哪个类。工厂方法让类的实例化推迟到子类。

## 📖 模式定义

**工厂方法模式**是一种创建型设计模式，它提供了一种创建对象的接口，但允许子类决定实例化哪个类。工厂方法将对象的创建推迟到子类中进行。

### 核心要素
- **抽象工厂**：声明工厂方法的接口
- **具体工厂**：实现工厂方法，创建具体产品
- **抽象产品**：定义产品的接口
- **具体产品**：实现产品接口的具体类

## 🎯 使用场景

### 适用情况
- **框架设计**：框架需要创建对象，但不知道具体类型
- **插件系统**：支持不同类型的插件
- **数据库驱动**：支持不同数据库的连接
- **UI组件库**：创建不同平台的UI组件
- **日志系统**：支持不同的日志输出方式

### 不适用情况
- 产品类型固定且较少
- 不需要扩展新产品类型
- 简单的对象创建场景

## 💡 实现方式

### JavaScript/TypeScript 实现

```typescript
// 抽象产品
abstract class Logger {
    abstract log(message: string): void;
}

// 具体产品
class FileLogger extends Logger {
    private filename: string;
    
    constructor(filename: string) {
        super();
        this.filename = filename;
    }
    
    log(message: string): void {
        console.log(`[FILE:${this.filename}] ${message}`);
        // 实际实现中会写入文件
    }
}

class ConsoleLogger extends Logger {
    log(message: string): void {
        console.log(`[CONSOLE] ${message}`);
    }
}

class DatabaseLogger extends Logger {
    private connectionString: string;
    
    constructor(connectionString: string) {
        super();
        this.connectionString = connectionString;
    }
    
    log(message: string): void {
        console.log(`[DB:${this.connectionString}] ${message}`);
        // 实际实现中会写入数据库
    }
}

// 抽象工厂
abstract class LoggerFactory {
    abstract createLogger(): Logger;
    
    // 模板方法，定义使用流程
    public logMessage(message: string): void {
        const logger = this.createLogger();
        logger.log(message);
    }
}

// 具体工厂
class FileLoggerFactory extends LoggerFactory {
    private filename: string;
    
    constructor(filename: string) {
        super();
        this.filename = filename;
    }
    
    createLogger(): Logger {
        return new FileLogger(this.filename);
    }
}

class ConsoleLoggerFactory extends LoggerFactory {
    createLogger(): Logger {
        return new ConsoleLogger();
    }
}

class DatabaseLoggerFactory extends LoggerFactory {
    private connectionString: string;
    
    constructor(connectionString: string) {
        super();
        this.connectionString = connectionString;
    }
    
    createLogger(): Logger {
        return new DatabaseLogger(this.connectionString);
    }
}

// 使用示例
const fileFactory = new FileLoggerFactory('app.log');
const consoleFactory = new ConsoleLoggerFactory();
const dbFactory = new DatabaseLoggerFactory('mongodb://localhost:27017');

fileFactory.logMessage('File log message');
consoleFactory.logMessage('Console log message');
dbFactory.logMessage('Database log message');
```

### Java 实现

```java
// 抽象产品
abstract class Document {
    public abstract void open();
    public abstract void save();
    public abstract void close();
}

// 具体产品
class WordDocument extends Document {
    @Override
    public void open() {
        System.out.println("Opening Word document");
    }
    
    @Override
    public void save() {
        System.out.println("Saving Word document");
    }
    
    @Override
    public void close() {
        System.out.println("Closing Word document");
    }
}

class PDFDocument extends Document {
    @Override
    public void open() {
        System.out.println("Opening PDF document");
    }
    
    @Override
    public void save() {
        System.out.println("Saving PDF document");
    }
    
    @Override
    public void close() {
        System.out.println("Closing PDF document");
    }
}

// 抽象工厂
abstract class DocumentFactory {
    public abstract Document createDocument();
    
    // 模板方法
    public void processDocument() {
        Document doc = createDocument();
        doc.open();
        doc.save();
        doc.close();
    }
}

// 具体工厂
class WordDocumentFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new WordDocument();
    }
}

class PDFDocumentFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new PDFDocument();
    }
}

// 使用示例
public class FactoryMethodExample {
    public static void main(String[] args) {
        DocumentFactory wordFactory = new WordDocumentFactory();
        DocumentFactory pdfFactory = new PDFDocumentFactory();
        
        wordFactory.processDocument();
        pdfFactory.processDocument();
    }
}
```

### Python 实现

```python
from abc import ABC, abstractmethod
from typing import Protocol

# 抽象产品
class Transport(ABC):
    @abstractmethod
    def deliver(self, destination: str) -> str:
        pass

# 具体产品
class Truck(Transport):
    def deliver(self, destination: str) -> str:
        return f"Delivering by truck to {destination}"

class Ship(Transport):
    def deliver(self, destination: str) -> str:
        return f"Delivering by ship to {destination}"

class Plane(Transport):
    def deliver(self, destination: str) -> str:
        return f"Delivering by plane to {destination}"

# 抽象工厂
class TransportFactory(ABC):
    @abstractmethod
    def create_transport(self) -> Transport:
        pass
    
    def plan_delivery(self, destination: str) -> str:
        transport = self.create_transport()
        return transport.deliver(destination)

# 具体工厂
class TruckFactory(TransportFactory):
    def create_transport(self) -> Transport:
        return Truck()

class ShipFactory(TransportFactory):
    def create_transport(self) -> Transport:
        return Ship()

class PlaneFactory(TransportFactory):
    def create_transport(self) -> Transport:
        return Plane()

# 工厂选择器
class TransportFactorySelector:
    @staticmethod
    def get_factory(transport_type: str) -> TransportFactory:
        factories = {
            'truck': TruckFactory(),
            'ship': ShipFactory(),
            'plane': PlaneFactory()
        }
        
        factory = factories.get(transport_type.lower())
        if not factory:
            raise ValueError(f"Unknown transport type: {transport_type}")
        return factory

# 使用示例
if __name__ == "__main__":
    selector = TransportFactorySelector()
    
    # 根据需求选择不同的工厂
    truck_factory = selector.get_factory('truck')
    ship_factory = selector.get_factory('ship')
    plane_factory = selector.get_factory('plane')
    
    print(truck_factory.plan_delivery('New York'))
    print(ship_factory.plan_delivery('London'))
    print(plane_factory.plan_delivery('Tokyo'))
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **符合开闭原则**：对扩展开放，对修改关闭
2. **符合单一职责原则**：每个工厂只负责创建一种产品
3. **松耦合**：客户端不需要知道具体产品类
4. **易于扩展**：添加新产品只需要添加新的工厂类

### ❌ 缺点
1. **类的数量增加**：每个产品都需要对应的工厂类
2. **增加复杂性**：引入了额外的抽象层
3. **可能过度设计**：简单场景下可能不必要

## 🌟 实际应用案例

### 1. 数据库连接工厂

```typescript
// 数据库连接接口
interface DatabaseConnection {
    connect(): void;
    query(sql: string): any[];
    close(): void;
}

// 具体数据库连接实现
class MySQLConnection implements DatabaseConnection {
    private host: string;
    private port: number;
    
    constructor(host: string, port: number = 3306) {
        this.host = host;
        this.port = port;
    }
    
    connect(): void {
        console.log(`Connecting to MySQL at ${this.host}:${this.port}`);
    }
    
    query(sql: string): any[] {
        console.log(`Executing MySQL query: ${sql}`);
        return [];
    }
    
    close(): void {
        console.log('Closing MySQL connection');
    }
}

class PostgreSQLConnection implements DatabaseConnection {
    private host: string;
    private port: number;
    
    constructor(host: string, port: number = 5432) {
        this.host = host;
        this.port = port;
    }
    
    connect(): void {
        console.log(`Connecting to PostgreSQL at ${this.host}:${this.port}`);
    }
    
    query(sql: string): any[] {
        console.log(`Executing PostgreSQL query: ${sql}`);
        return [];
    }
    
    close(): void {
        console.log('Closing PostgreSQL connection');
    }
}

// 抽象工厂
abstract class DatabaseFactory {
    abstract createConnection(): DatabaseConnection;
    
    // 提供通用的数据库操作方法
    public executeQuery(sql: string): any[] {
        const connection = this.createConnection();
        connection.connect();
        const result = connection.query(sql);
        connection.close();
        return result;
    }
}

// 具体工厂
class MySQLFactory extends DatabaseFactory {
    private host: string;
    private port: number;
    
    constructor(host: string, port: number = 3306) {
        super();
        this.host = host;
        this.port = port;
    }
    
    createConnection(): DatabaseConnection {
        return new MySQLConnection(this.host, this.port);
    }
}

class PostgreSQLFactory extends DatabaseFactory {
    private host: string;
    private port: number;
    
    constructor(host: string, port: number = 5432) {
        super();
        this.host = host;
        this.port = port;
    }
    
    createConnection(): DatabaseConnection {
        return new PostgreSQLConnection(this.host, this.port);
    }
}

// 数据库工厂管理器
class DatabaseFactoryManager {
    private static factories: Map<string, () => DatabaseFactory> = new Map();
    
    static register(type: string, factory: () => DatabaseFactory): void {
        this.factories.set(type, factory);
    }
    
    static create(type: string): DatabaseFactory {
        const factoryCreator = this.factories.get(type);
        if (!factoryCreator) {
            throw new Error(`Database type ${type} not supported`);
        }
        return factoryCreator();
    }
}

// 注册工厂
DatabaseFactoryManager.register('mysql', () => new MySQLFactory('localhost'));
DatabaseFactoryManager.register('postgresql', () => new PostgreSQLFactory('localhost'));

// 使用示例
const dbType = process.env.DB_TYPE || 'mysql';
const factory = DatabaseFactoryManager.create(dbType);
factory.executeQuery('SELECT * FROM users');
```

### 2. UI组件工厂

```typescript
// UI组件接口
interface Button {
    render(): string;
    onClick(handler: () => void): void;
}

interface Dialog {
    render(): string;
    show(): void;
    hide(): void;
}

// Windows风格组件
class WindowsButton implements Button {
    render(): string {
        return '<button class="windows-button">Windows Button</button>';
    }
    
    onClick(handler: () => void): void {
        console.log('Windows button clicked');
        handler();
    }
}

class WindowsDialog implements Dialog {
    render(): string {
        return '<div class="windows-dialog">Windows Dialog</div>';
    }
    
    show(): void {
        console.log('Showing Windows dialog');
    }
    
    hide(): void {
        console.log('Hiding Windows dialog');
    }
}

// macOS风格组件
class MacButton implements Button {
    render(): string {
        return '<button class="mac-button">Mac Button</button>';
    }
    
    onClick(handler: () => void): void {
        console.log('Mac button clicked');
        handler();
    }
}

class MacDialog implements Dialog {
    render(): string {
        return '<div class="mac-dialog">Mac Dialog</div>';
    }
    
    show(): void {
        console.log('Showing Mac dialog');
    }
    
    hide(): void {
        console.log('Hiding Mac dialog');
    }
}

// 抽象UI工厂
abstract class UIFactory {
    abstract createButton(): Button;
    abstract createDialog(): Dialog;
    
    // 创建完整的UI界面
    public createInterface(): { button: Button; dialog: Dialog } {
        return {
            button: this.createButton(),
            dialog: this.createDialog()
        };
    }
}

// 具体UI工厂
class WindowsUIFactory extends UIFactory {
    createButton(): Button {
        return new WindowsButton();
    }
    
    createDialog(): Dialog {
        return new WindowsDialog();
    }
}

class MacUIFactory extends UIFactory {
    createButton(): Button {
        return new MacButton();
    }
    
    createDialog(): Dialog {
        return new MacDialog();
    }
}

// UI工厂选择器
class UIFactorySelector {
    static getFactory(): UIFactory {
        const platform = process.platform;
        
        switch (platform) {
            case 'win32':
                return new WindowsUIFactory();
            case 'darwin':
                return new MacUIFactory();
            default:
                return new WindowsUIFactory(); // 默认使用Windows风格
        }
    }
}

// 使用示例
const uiFactory = UIFactorySelector.getFactory();
const { button, dialog } = uiFactory.createInterface();

console.log(button.render());
console.log(dialog.render());
```

## 🔄 相关模式

### 与其他模式的关系
- **抽象工厂模式**：工厂方法是抽象工厂的基础
- **模板方法模式**：工厂方法常在模板方法中使用
- **原型模式**：可以用原型模式实现工厂方法
- **单例模式**：工厂类通常实现为单例

### 模式演进

```typescript
// 从简单工厂到工厂方法的演进

// 1. 简单工厂（不是设计模式）
class SimpleShapeFactory {
    static createShape(type: string): Shape {
        switch (type) {
            case 'circle':
                return new Circle();
            case 'rectangle':
                return new Rectangle();
            default:
                throw new Error('Unknown shape type');
        }
    }
}

// 2. 工厂方法模式
abstract class ShapeFactory {
    abstract createShape(): Shape;
    
    public drawShape(): void {
        const shape = this.createShape();
        shape.draw();
    }
}

class CircleFactory extends ShapeFactory {
    createShape(): Shape {
        return new Circle();
    }
}

class RectangleFactory extends ShapeFactory {
    createShape(): Shape {
        return new Rectangle();
    }
}
```

## 🚀 最佳实践

### 1. 使用配置驱动的工厂

```typescript
interface FactoryConfig {
    type: string;
    options?: any;
}

class ConfigurableFactory {
    private static creators: Map<string, (options?: any) => any> = new Map();
    
    static register<T>(type: string, creator: (options?: any) => T): void {
        this.creators.set(type, creator);
    }
    
    static create<T>(config: FactoryConfig): T {
        const creator = this.creators.get(config.type);
        if (!creator) {
            throw new Error(`No creator registered for type: ${config.type}`);
        }
        return creator(config.options);
    }
}

// 注册创建器
ConfigurableFactory.register('fileLogger', (options) => 
    new FileLogger(options?.filename || 'default.log')
);
ConfigurableFactory.register('consoleLogger', () => 
    new ConsoleLogger()
);

// 使用配置创建对象
const loggerConfig: FactoryConfig = {
    type: 'fileLogger',
    options: { filename: 'app.log' }
};

const logger = ConfigurableFactory.create<Logger>(loggerConfig);
```

### 2. 异步工厂方法

```typescript
abstract class AsyncFactory<T> {
    abstract createAsync(): Promise<T>;
    
    protected async initialize(): Promise<void> {
        // 通用初始化逻辑
    }
}

class DatabaseConnectionFactory extends AsyncFactory<DatabaseConnection> {
    private config: DatabaseConfig;
    
    constructor(config: DatabaseConfig) {
        super();
        this.config = config;
    }
    
    async createAsync(): Promise<DatabaseConnection> {
        await this.initialize();
        
        const connection = new DatabaseConnection(this.config);
        await connection.connect();
        return connection;
    }
}

// 使用示例
const factory = new DatabaseConnectionFactory(dbConfig);
const connection = await factory.createAsync();
```

## ⚠️ 注意事项

1. **避免过度使用**：简单场景下直接创建对象即可
2. **工厂类的管理**：避免工厂类过多导致管理困难
3. **参数传递**：考虑如何向工厂方法传递参数
4. **异常处理**：工厂方法中要处理创建失败的情况
5. **性能考虑**：频繁创建对象时考虑对象池模式

## 📚 总结

工厂方法模式是一个非常实用的创建型模式，它通过将对象创建的决策推迟到子类来提供灵活性。这个模式在框架设计、插件系统等场景中特别有用。

**使用建议**：
- 当需要创建的对象类型在运行时确定时使用
- 当系统需要独立于产品创建、组合和表示时使用
- 当需要提供一个产品类库，只显示接口而不显示实现时使用
- 优先考虑组合而不是继承

---

**相关链接**：
- [抽象工厂模式](./abstract-factory.md)
- [单例模式](./singleton.md)
- [建造者模式](./builder.md) 