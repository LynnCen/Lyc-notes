# 桥接模式 (Bridge Pattern)

> [!NOTE]
> 桥接模式将抽象部分与它的实现部分分离，使它们都可以独立地变化。

## 📖 模式定义

**桥接模式**是一种结构型设计模式，它将抽象部分与它的实现部分分离，使它们都可以独立地变化。桥接模式通过组合的方式建立两个类层次结构之间的联系。

### 核心要素
- **抽象类**：定义抽象类的接口，维护一个指向实现类的引用
- **扩展抽象类**：扩展抽象类，通常提供更细化的控制逻辑
- **实现接口**：定义实现类的接口，该接口不一定要与抽象类的接口完全一致
- **具体实现类**：实现实现接口并定义具体的实现

## 🎯 使用场景

### 适用情况
- **抽象与实现分离**：需要在抽象和实现之间建立永久的绑定关系
- **多维度变化**：类存在两个独立变化的维度
- **运行时切换实现**：希望在运行时切换实现
- **避免永久绑定**：不希望在抽象和实现之间建立静态的继承关系
- **共享实现**：多个对象共享一个实现

### 不适用情况
- 只有一个实现
- 抽象和实现紧密耦合
- 不需要运行时切换实现

## 💡 实现方式

### TypeScript 实现

```typescript
// 实现接口 - 绘图API
interface DrawingAPI {
    drawCircle(x: number, y: number, radius: number): void;
    drawRectangle(x: number, y: number, width: number, height: number): void;
}

// 具体实现 - Canvas绘图
class CanvasDrawingAPI implements DrawingAPI {
    drawCircle(x: number, y: number, radius: number): void {
        console.log(`Canvas: Drawing circle at (${x}, ${y}) with radius ${radius}`);
    }
    
    drawRectangle(x: number, y: number, width: number, height: number): void {
        console.log(`Canvas: Drawing rectangle at (${x}, ${y}) with size ${width}x${height}`);
    }
}

// 具体实现 - SVG绘图
class SVGDrawingAPI implements DrawingAPI {
    drawCircle(x: number, y: number, radius: number): void {
        console.log(`SVG: <circle cx="${x}" cy="${y}" r="${radius}" />`);
    }
    
    drawRectangle(x: number, y: number, width: number, height: number): void {
        console.log(`SVG: <rect x="${x}" y="${y}" width="${width}" height="${height}" />`);
    }
}

// 抽象类 - 形状
abstract class Shape {
    protected drawingAPI: DrawingAPI;
    
    constructor(drawingAPI: DrawingAPI) {
        this.drawingAPI = drawingAPI;
    }
    
    abstract draw(): void;
    abstract resize(factor: number): void;
}

// 扩展抽象类 - 圆形
class Circle extends Shape {
    private x: number;
    private y: number;
    private radius: number;
    
    constructor(x: number, y: number, radius: number, drawingAPI: DrawingAPI) {
        super(drawingAPI);
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    
    draw(): void {
        this.drawingAPI.drawCircle(this.x, this.y, this.radius);
    }
    
    resize(factor: number): void {
        this.radius *= factor;
    }
    
    getRadius(): number {
        return this.radius;
    }
}

// 扩展抽象类 - 矩形
class Rectangle extends Shape {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    
    constructor(x: number, y: number, width: number, height: number, drawingAPI: DrawingAPI) {
        super(drawingAPI);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(): void {
        this.drawingAPI.drawRectangle(this.x, this.y, this.width, this.height);
    }
    
    resize(factor: number): void {
        this.width *= factor;
        this.height *= factor;
    }
    
    getArea(): number {
        return this.width * this.height;
    }
}

// 使用示例
console.log('=== Bridge Pattern Demo ===');

// 使用Canvas API绘制
const canvasAPI = new CanvasDrawingAPI();
const circle1 = new Circle(10, 10, 5, canvasAPI);
const rectangle1 = new Rectangle(20, 20, 10, 15, canvasAPI);

console.log('\n--- Canvas Drawing ---');
circle1.draw();
rectangle1.draw();

// 使用SVG API绘制相同的形状
const svgAPI = new SVGDrawingAPI();
const circle2 = new Circle(10, 10, 5, svgAPI);
const rectangle2 = new Rectangle(20, 20, 10, 15, svgAPI);

console.log('\n--- SVG Drawing ---');
circle2.draw();
rectangle2.draw();

// 调整大小并重新绘制
console.log('\n--- After Resize ---');
circle1.resize(2);
rectangle1.resize(1.5);

circle1.draw();
rectangle1.draw();
```

### 高级桥接模式示例

```typescript
// 消息发送接口
interface MessageSender {
    sendMessage(message: string, recipient: string): Promise<boolean>;
    getDeliveryStatus(messageId: string): Promise<string>;
}

// 邮件发送实现
class EmailSender implements MessageSender {
    async sendMessage(message: string, recipient: string): Promise<boolean> {
        console.log(`📧 Sending email to ${recipient}: ${message}`);
        // 模拟异步发送
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
    }
    
    async getDeliveryStatus(messageId: string): Promise<string> {
        return 'delivered';
    }
}

// SMS发送实现
class SMSSender implements MessageSender {
    async sendMessage(message: string, recipient: string): Promise<boolean> {
        console.log(`📱 Sending SMS to ${recipient}: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        return true;
    }
    
    async getDeliveryStatus(messageId: string): Promise<string> {
        return 'sent';
    }
}

// 推送通知实现
class PushNotificationSender implements MessageSender {
    async sendMessage(message: string, recipient: string): Promise<boolean> {
        console.log(`🔔 Sending push notification to ${recipient}: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 30));
        return true;
    }
    
    async getDeliveryStatus(messageId: string): Promise<string> {
        return 'received';
    }
}

// 抽象通知类
abstract class Notification {
    protected sender: MessageSender;
    protected title: string;
    protected message: string;
    
    constructor(sender: MessageSender, title: string, message: string) {
        this.sender = sender;
        this.title = title;
        this.message = message;
    }
    
    abstract send(recipient: string): Promise<boolean>;
    
    protected formatMessage(): string {
        return `${this.title}: ${this.message}`;
    }
}

// 简单通知
class SimpleNotification extends Notification {
    async send(recipient: string): Promise<boolean> {
        const formattedMessage = this.formatMessage();
        return await this.sender.sendMessage(formattedMessage, recipient);
    }
}

// 紧急通知
class UrgentNotification extends Notification {
    private retryCount: number = 3;
    
    async send(recipient: string): Promise<boolean> {
        const formattedMessage = `🚨 URGENT: ${this.formatMessage()}`;
        
        for (let i = 0; i < this.retryCount; i++) {
            try {
                const success = await this.sender.sendMessage(formattedMessage, recipient);
                if (success) {
                    console.log(`✅ Urgent notification sent successfully on attempt ${i + 1}`);
                    return true;
                }
            } catch (error) {
                console.log(`❌ Attempt ${i + 1} failed: ${error}`);
            }
            
            if (i < this.retryCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒重试
            }
        }
        
        console.log('❌ Failed to send urgent notification after all retries');
        return false;
    }
}

// 定时通知
class ScheduledNotification extends Notification {
    private scheduleTime: Date;
    
    constructor(sender: MessageSender, title: string, message: string, scheduleTime: Date) {
        super(sender, title, message);
        this.scheduleTime = scheduleTime;
    }
    
    async send(recipient: string): Promise<boolean> {
        const now = new Date();
        const delay = this.scheduleTime.getTime() - now.getTime();
        
        if (delay > 0) {
            console.log(`⏰ Scheduling notification for ${this.scheduleTime.toLocaleString()}`);
            await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000))); // 最多等待5秒演示
        }
        
        const formattedMessage = `📅 Scheduled: ${this.formatMessage()}`;
        return await this.sender.sendMessage(formattedMessage, recipient);
    }
}

// 通知管理器
class NotificationManager {
    private notifications: Notification[] = [];
    
    addNotification(notification: Notification): void {
        this.notifications.push(notification);
    }
    
    async sendAll(recipient: string): Promise<void> {
        console.log(`\n📢 Sending ${this.notifications.length} notifications to ${recipient}`);
        
        const results = await Promise.allSettled(
            this.notifications.map(notification => notification.send(recipient))
        );
        
        const successful = results.filter(result => 
            result.status === 'fulfilled' && result.value
        ).length;
        
        console.log(`📊 Sent ${successful}/${this.notifications.length} notifications successfully`);
    }
    
    clear(): void {
        this.notifications = [];
    }
}

// 使用示例
async function demonstrateBridgePattern() {
    console.log('\n=== Advanced Bridge Pattern Demo ===');
    
    // 创建不同的发送器
    const emailSender = new EmailSender();
    const smsSender = new SMSSender();
    const pushSender = new PushNotificationSender();
    
    // 创建通知管理器
    const manager = new NotificationManager();
    
    // 添加不同类型的通知
    manager.addNotification(
        new SimpleNotification(emailSender, 'Welcome', 'Welcome to our service!')
    );
    
    manager.addNotification(
        new UrgentNotification(smsSender, 'Security Alert', 'Suspicious login detected')
    );
    
    manager.addNotification(
        new SimpleNotification(pushSender, 'Update', 'New features available')
    );
    
    const futureTime = new Date(Date.now() + 2000); // 2秒后
    manager.addNotification(
        new ScheduledNotification(emailSender, 'Reminder', 'Meeting in 10 minutes', futureTime)
    );
    
    // 发送所有通知
    await manager.sendAll('user@example.com');
}

// 运行演示
demonstrateBridgePattern();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **分离抽象和实现**：抽象和实现可以独立扩展
2. **运行时切换**：可以在运行时切换实现
3. **隐藏实现细节**：客户端代码不需要了解实现细节
4. **符合开闭原则**：可以独立扩展抽象和实现层次

### ❌ 缺点
1. **增加复杂性**：引入了额外的抽象层
2. **理解难度**：模式的概念相对复杂
3. **设计复杂**：需要正确识别两个独立变化的维度

## 🌟 实际应用案例

### 1. 数据库访问桥接

```typescript
// 数据库操作接口
interface DatabaseDriver {
    connect(connectionString: string): Promise<void>;
    execute(query: string, params?: any[]): Promise<any>;
    disconnect(): Promise<void>;
}

// MySQL驱动实现
class MySQLDriver implements DatabaseDriver {
    private connection: any = null;
    
    async connect(connectionString: string): Promise<void> {
        console.log(`🐬 Connecting to MySQL: ${connectionString}`);
        this.connection = { type: 'mysql', connected: true };
    }
    
    async execute(query: string, params?: any[]): Promise<any> {
        console.log(`🐬 MySQL executing: ${query}`, params);
        return { rows: [{ id: 1, name: 'MySQL Result' }] };
    }
    
    async disconnect(): Promise<void> {
        console.log('🐬 MySQL disconnected');
        this.connection = null;
    }
}

// PostgreSQL驱动实现
class PostgreSQLDriver implements DatabaseDriver {
    private connection: any = null;
    
    async connect(connectionString: string): Promise<void> {
        console.log(`🐘 Connecting to PostgreSQL: ${connectionString}`);
        this.connection = { type: 'postgresql', connected: true };
    }
    
    async execute(query: string, params?: any[]): Promise<any> {
        console.log(`🐘 PostgreSQL executing: ${query}`, params);
        return { rows: [{ id: 1, name: 'PostgreSQL Result' }] };
    }
    
    async disconnect(): Promise<void> {
        console.log('🐘 PostgreSQL disconnected');
        this.connection = null;
    }
}

// 抽象数据访问层
abstract class DataAccessObject {
    protected driver: DatabaseDriver;
    protected tableName: string;
    
    constructor(driver: DatabaseDriver, tableName: string) {
        this.driver = driver;
        this.tableName = tableName;
    }
    
    async connect(connectionString: string): Promise<void> {
        await this.driver.connect(connectionString);
    }
    
    async disconnect(): Promise<void> {
        await this.driver.disconnect();
    }
    
    abstract findById(id: number): Promise<any>;
    abstract findAll(): Promise<any[]>;
    abstract create(data: any): Promise<any>;
    abstract update(id: number, data: any): Promise<any>;
    abstract delete(id: number): Promise<boolean>;
}

// 用户数据访问对象
class UserDAO extends DataAccessObject {
    constructor(driver: DatabaseDriver) {
        super(driver, 'users');
    }
    
    async findById(id: number): Promise<any> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await this.driver.execute(query, [id]);
        return result.rows[0];
    }
    
    async findAll(): Promise<any[]> {
        const query = `SELECT * FROM ${this.tableName}`;
        const result = await this.driver.execute(query);
        return result.rows;
    }
    
    async create(userData: any): Promise<any> {
        const query = `INSERT INTO ${this.tableName} (name, email) VALUES (?, ?)`;
        const result = await this.driver.execute(query, [userData.name, userData.email]);
        return { id: Date.now(), ...userData };
    }
    
    async update(id: number, userData: any): Promise<any> {
        const query = `UPDATE ${this.tableName} SET name = ?, email = ? WHERE id = ?`;
        await this.driver.execute(query, [userData.name, userData.email, id]);
        return { id, ...userData };
    }
    
    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await this.driver.execute(query, [id]);
        return true;
    }
}

// 产品数据访问对象
class ProductDAO extends DataAccessObject {
    constructor(driver: DatabaseDriver) {
        super(driver, 'products');
    }
    
    async findById(id: number): Promise<any> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const result = await this.driver.execute(query, [id]);
        return result.rows[0];
    }
    
    async findAll(): Promise<any[]> {
        const query = `SELECT * FROM ${this.tableName} ORDER BY name`;
        const result = await this.driver.execute(query);
        return result.rows;
    }
    
    async create(productData: any): Promise<any> {
        const query = `INSERT INTO ${this.tableName} (name, price, category) VALUES (?, ?, ?)`;
        const result = await this.driver.execute(query, [productData.name, productData.price, productData.category]);
        return { id: Date.now(), ...productData };
    }
    
    async update(id: number, productData: any): Promise<any> {
        const query = `UPDATE ${this.tableName} SET name = ?, price = ?, category = ? WHERE id = ?`;
        await this.driver.execute(query, [productData.name, productData.price, productData.category, id]);
        return { id, ...productData };
    }
    
    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        await this.driver.execute(query, [id]);
        return true;
    }
    
    async findByCategory(category: string): Promise<any[]> {
        const query = `SELECT * FROM ${this.tableName} WHERE category = ?`;
        const result = await this.driver.execute(query, [category]);
        return result.rows;
    }
}

// 使用示例
async function demonstrateDataAccess() {
    console.log('\n=== Database Access Bridge Pattern ===');
    
    // 使用MySQL
    console.log('\n--- Using MySQL ---');
    const mysqlDriver = new MySQLDriver();
    const userDAOMySQL = new UserDAO(mysqlDriver);
    
    await userDAOMySQL.connect('mysql://localhost:3306/myapp');
    await userDAOMySQL.create({ name: 'John Doe', email: 'john@example.com' });
    await userDAOMySQL.findAll();
    await userDAOMySQL.disconnect();
    
    // 使用PostgreSQL
    console.log('\n--- Using PostgreSQL ---');
    const postgresDriver = new PostgreSQLDriver();
    const productDAOPostgres = new ProductDAO(postgresDriver);
    
    await productDAOPostgres.connect('postgresql://localhost:5432/myapp');
    await productDAOPostgres.create({ name: 'Laptop', price: 999.99, category: 'Electronics' });
    await productDAOPostgres.findByCategory('Electronics');
    await productDAOPostgres.disconnect();
}

demonstrateDataAccess();
```

## 🔄 相关模式

### 与其他模式的关系
- **适配器模式**：适配器模式改变接口，桥接模式分离抽象和实现
- **状态模式**：状态模式可以看作是桥接模式的特殊情况
- **策略模式**：策略模式关注算法的变化，桥接模式关注抽象和实现的分离
- **抽象工厂模式**：可以与桥接模式结合创建特定的实现

### 模式组合

```typescript
// 桥接 + 策略模式
interface RenderStrategy {
    render(data: any): string;
}

class HTMLRenderStrategy implements RenderStrategy {
    render(data: any): string {
        return `<div>${JSON.stringify(data)}</div>`;
    }
}

class JSONRenderStrategy implements RenderStrategy {
    render(data: any): string {
        return JSON.stringify(data, null, 2);
    }
}

abstract class Report {
    protected renderStrategy: RenderStrategy;
    
    constructor(renderStrategy: RenderStrategy) {
        this.renderStrategy = renderStrategy;
    }
    
    setRenderStrategy(strategy: RenderStrategy): void {
        this.renderStrategy = strategy;
    }
    
    abstract generateReport(): string;
}

class SalesReport extends Report {
    private salesData: any[];
    
    constructor(renderStrategy: RenderStrategy, salesData: any[]) {
        super(renderStrategy);
        this.salesData = salesData;
    }
    
    generateReport(): string {
        const reportData = {
            title: 'Sales Report',
            data: this.salesData,
            total: this.salesData.reduce((sum, sale) => sum + sale.amount, 0)
        };
        
        return this.renderStrategy.render(reportData);
    }
}
```

## 🚀 最佳实践

### 1. 接口设计原则

```typescript
// 保持实现接口简单和专注
interface PaymentProcessor {
    // 只包含核心支付功能
    processPayment(amount: number, currency: string): Promise<PaymentResult>;
    validatePayment(paymentData: PaymentData): boolean;
}

// 避免在实现接口中包含太多方法
// ❌ 不好的设计
interface BadPaymentProcessor {
    processPayment(amount: number, currency: string): Promise<PaymentResult>;
    validatePayment(paymentData: PaymentData): boolean;
    generateReport(): string;  // 不属于核心支付功能
    sendEmail(): void;         // 不属于核心支付功能
    logTransaction(): void;    // 不属于核心支付功能
}
```

### 2. 抽象层次设计

```typescript
// 合理的抽象层次
abstract class BasePayment {
    protected processor: PaymentProcessor;
    
    constructor(processor: PaymentProcessor) {
        this.processor = processor;
    }
    
    // 模板方法，定义支付流程
    async pay(amount: number, currency: string): Promise<boolean> {
        if (!this.validateAmount(amount)) {
            return false;
        }
        
        const result = await this.processor.processPayment(amount, currency);
        
        if (result.success) {
            this.onPaymentSuccess(result);
        } else {
            this.onPaymentFailure(result);
        }
        
        return result.success;
    }
    
    protected validateAmount(amount: number): boolean {
        return amount > 0;
    }
    
    protected abstract onPaymentSuccess(result: PaymentResult): void;
    protected abstract onPaymentFailure(result: PaymentResult): void;
}
```

## ⚠️ 注意事项

1. **正确识别维度**：确保真的存在两个独立变化的维度
2. **避免过度设计**：不要为了使用模式而使用模式
3. **接口设计**：保持实现接口的简单和专注
4. **性能考虑**：桥接模式会增加一层间接调用
5. **文档说明**：清楚地文档化抽象和实现的职责分工

## 📚 总结

桥接模式是一个强大的结构型模式，它通过将抽象和实现分离，提供了很好的灵活性和可扩展性。这个模式特别适用于需要在多个维度上进行扩展的场景。

**使用建议**：
- 当需要在抽象和实现之间建立永久绑定关系时使用
- 当抽象和实现都需要通过子类进行扩展时使用
- 当对实现的修改不应影响客户端代码时使用
- 当需要在运行时切换实现时使用
- 优先考虑组合而不是继承

---

**相关链接**：
- [适配器模式](./adapter.md)
- [策略模式](../behavioral/strategy.md)
- [状态模式](../behavioral/state.md) 