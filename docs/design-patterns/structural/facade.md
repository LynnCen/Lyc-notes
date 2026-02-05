# 外观模式 (Facade Pattern)

> [!NOTE]
> 外观模式为子系统中的一组接口提供一个一致的界面，定义一个高层接口，这个接口使得这一子系统更加容易使用。

## 📖 模式定义

**外观模式**是一种结构型设计模式，它为复杂的子系统提供一个简单的接口。外观模式隐藏了子系统的复杂性，并为客户端提供了一个简单的接口来访问子系统。

### 核心要素
- **外观类**：提供简单的接口，隐藏子系统的复杂性
- **子系统类**：实现子系统的功能，处理外观对象指派的工作
- **客户端**：通过外观接口与子系统通信

## 🎯 使用场景

### 适用情况
- **简化复杂接口**：需要为复杂的子系统提供简单接口
- **解耦客户端**：客户端与多个子系统之间存在很大依赖性
- **分层系统**：构建分层结构的系统
- **遗留系统集成**：需要集成复杂的遗留系统

## 💡 实现方式

### TypeScript 实现

```typescript
// 子系统 - CPU
class CPU {
    freeze(): void {
        console.log('CPU: Freezing processor');
    }
    
    jump(position: number): void {
        console.log(`CPU: Jumping to position ${position}`);
    }
    
    execute(): void {
        console.log('CPU: Executing instructions');
    }
}

// 子系统 - 内存
class Memory {
    load(position: number, data: string): void {
        console.log(`Memory: Loading data "${data}" at position ${position}`);
    }
}

// 子系统 - 硬盘
class HardDrive {
    read(lba: number, size: number): string {
        console.log(`HardDrive: Reading ${size} bytes from LBA ${lba}`);
        return 'boot data';
    }
}

// 外观类 - 计算机
class ComputerFacade {
    private cpu: CPU;
    private memory: Memory;
    private hardDrive: HardDrive;
    
    constructor() {
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hardDrive = new HardDrive();
    }
    
    start(): void {
        console.log('=== Starting Computer ===');
        this.cpu.freeze();
        const bootData = this.hardDrive.read(0, 1024);
        this.memory.load(0, bootData);
        this.cpu.jump(0);
        this.cpu.execute();
        console.log('=== Computer Started ===');
    }
}

// 使用示例
const computer = new ComputerFacade();
computer.start();
```

### 多媒体系统外观

```typescript
// 子系统 - 音频系统
class AudioSystem {
    turnOn(): void {
        console.log('Audio System: Turning on');
    }
    
    setVolume(volume: number): void {
        console.log(`Audio System: Setting volume to ${volume}`);
    }
    
    playSound(file: string): void {
        console.log(`Audio System: Playing ${file}`);
    }
    
    turnOff(): void {
        console.log('Audio System: Turning off');
    }
}

// 子系统 - 视频系统
class VideoSystem {
    turnOn(): void {
        console.log('Video System: Turning on');
    }
    
    setResolution(width: number, height: number): void {
        console.log(`Video System: Setting resolution to ${width}x${height}`);
    }
    
    playVideo(file: string): void {
        console.log(`Video System: Playing ${file}`);
    }
    
    turnOff(): void {
        console.log('Video System: Turning off');
    }
}

// 子系统 - 投影仪
class Projector {
    turnOn(): void {
        console.log('Projector: Turning on');
    }
    
    setInput(input: string): void {
        console.log(`Projector: Setting input to ${input}`);
    }
    
    turnOff(): void {
        console.log('Projector: Turning off');
    }
}

// 子系统 - 灯光系统
class LightingSystem {
    dim(level: number): void {
        console.log(`Lighting: Dimming to ${level}%`);
    }
    
    turnOff(): void {
        console.log('Lighting: Turning off');
    }
    
    turnOn(): void {
        console.log('Lighting: Turning on');
    }
}

// 外观类 - 家庭影院
class HomeTheaterFacade {
    private audio: AudioSystem;
    private video: VideoSystem;
    private projector: Projector;
    private lighting: LightingSystem;
    
    constructor() {
        this.audio = new AudioSystem();
        this.video = new VideoSystem();
        this.projector = new Projector();
        this.lighting = new LightingSystem();
    }
    
    watchMovie(movie: string): void {
        console.log('\n=== Starting Movie Experience ===');
        this.lighting.dim(10);
        this.projector.turnOn();
        this.projector.setInput('HDMI');
        this.audio.turnOn();
        this.audio.setVolume(70);
        this.video.turnOn();
        this.video.setResolution(1920, 1080);
        this.video.playVideo(movie);
        this.audio.playSound(`${movie}_audio`);
        console.log('=== Enjoy Your Movie! ===');
    }
    
    endMovie(): void {
        console.log('\n=== Ending Movie Experience ===');
        this.video.turnOff();
        this.audio.turnOff();
        this.projector.turnOff();
        this.lighting.turnOn();
        console.log('=== Movie Experience Ended ===');
    }
    
    listenToMusic(song: string): void {
        console.log('\n=== Starting Music Experience ===');
        this.lighting.dim(30);
        this.audio.turnOn();
        this.audio.setVolume(50);
        this.audio.playSound(song);
        console.log('=== Enjoy Your Music! ===');
    }
}

// 使用示例
const homeTheater = new HomeTheaterFacade();
homeTheater.watchMovie('Inception');
homeTheater.endMovie();
homeTheater.listenToMusic('Classical_Symphony');
```

### 电商系统外观

```typescript
// 子系统 - 库存管理
class InventoryService {
    checkStock(productId: string, quantity: number): boolean {
        console.log(`Inventory: Checking stock for ${productId}, quantity: ${quantity}`);
        return true; // 假设有库存
    }
    
    reserveItems(productId: string, quantity: number): void {
        console.log(`Inventory: Reserving ${quantity} items of ${productId}`);
    }
    
    releaseReservation(productId: string, quantity: number): void {
        console.log(`Inventory: Releasing reservation for ${quantity} items of ${productId}`);
    }
}

// 子系统 - 支付处理
class PaymentService {
    processPayment(amount: number, paymentMethod: string): boolean {
        console.log(`Payment: Processing $${amount} via ${paymentMethod}`);
        return true; // 假设支付成功
    }
    
    refund(transactionId: string, amount: number): void {
        console.log(`Payment: Refunding $${amount} for transaction ${transactionId}`);
    }
}

// 子系统 - 物流服务
class ShippingService {
    calculateShipping(address: string, weight: number): number {
        console.log(`Shipping: Calculating shipping to ${address}, weight: ${weight}kg`);
        return 10; // 假设运费$10
    }
    
    createShipment(orderId: string, address: string): string {
        console.log(`Shipping: Creating shipment for order ${orderId} to ${address}`);
        return 'SHIP123456';
    }
}

// 子系统 - 通知服务
class NotificationService {
    sendOrderConfirmation(email: string, orderId: string): void {
        console.log(`Notification: Sending order confirmation to ${email} for order ${orderId}`);
    }
    
    sendShippingNotification(email: string, trackingNumber: string): void {
        console.log(`Notification: Sending shipping notification to ${email}, tracking: ${trackingNumber}`);
    }
}

// 订单数据接口
interface OrderData {
    productId: string;
    quantity: number;
    customerEmail: string;
    shippingAddress: string;
    paymentMethod: string;
}

// 外观类 - 订单处理
class OrderFacade {
    private inventory: InventoryService;
    private payment: PaymentService;
    private shipping: ShippingService;
    private notification: NotificationService;
    
    constructor() {
        this.inventory = new InventoryService();
        this.payment = new PaymentService();
        this.shipping = new ShippingService();
        this.notification = new NotificationService();
    }
    
    placeOrder(orderData: OrderData): string | null {
        console.log('\n=== Processing Order ===');
        
        try {
            // 1. 检查库存
            if (!this.inventory.checkStock(orderData.productId, orderData.quantity)) {
                console.log('❌ Order failed: Insufficient stock');
                return null;
            }
            
            // 2. 预留库存
            this.inventory.reserveItems(orderData.productId, orderData.quantity);
            
            // 3. 计算总价（简化）
            const productPrice = 100; // 假设产品价格
            const shippingCost = this.shipping.calculateShipping(orderData.shippingAddress, 1);
            const totalAmount = productPrice * orderData.quantity + shippingCost;
            
            // 4. 处理支付
            if (!this.payment.processPayment(totalAmount, orderData.paymentMethod)) {
                console.log('❌ Order failed: Payment failed');
                this.inventory.releaseReservation(orderData.productId, orderData.quantity);
                return null;
            }
            
            // 5. 创建订单ID
            const orderId = `ORDER_${Date.now()}`;
            
            // 6. 创建物流订单
            const trackingNumber = this.shipping.createShipment(orderId, orderData.shippingAddress);
            
            // 7. 发送确认通知
            this.notification.sendOrderConfirmation(orderData.customerEmail, orderId);
            this.notification.sendShippingNotification(orderData.customerEmail, trackingNumber);
            
            console.log(`✅ Order ${orderId} placed successfully!`);
            return orderId;
            
        } catch (error) {
            console.log('❌ Order failed:', error);
            // 回滚操作
            this.inventory.releaseReservation(orderData.productId, orderData.quantity);
            return null;
        }
    }
    
    cancelOrder(orderId: string): boolean {
        console.log(`\n=== Canceling Order ${orderId} ===`);
        
        try {
            // 简化的取消流程
            this.payment.refund('TXN123', 110); // 假设退款金额
            this.inventory.releaseReservation('PROD123', 1);
            this.notification.sendOrderConfirmation('customer@email.com', `${orderId}_CANCELLED`);
            
            console.log(`✅ Order ${orderId} cancelled successfully!`);
            return true;
        } catch (error) {
            console.log('❌ Cancel failed:', error);
            return false;
        }
    }
}

// 使用示例
const orderSystem = new OrderFacade();

const orderData: OrderData = {
    productId: 'LAPTOP001',
    quantity: 1,
    customerEmail: 'customer@example.com',
    shippingAddress: '123 Main St, City, State',
    paymentMethod: 'Credit Card'
};

const orderId = orderSystem.placeOrder(orderData);
if (orderId) {
    // 模拟取消订单
    setTimeout(() => {
        orderSystem.cancelOrder(orderId);
    }, 1000);
}
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **简化接口**：为复杂子系统提供简单接口
2. **解耦合**：减少客户端与子系统的耦合
3. **易于使用**：客户端更容易使用子系统
4. **灵活性**：可以选择性地暴露子系统功能

### ❌ 缺点
1. **功能限制**：可能无法满足所有客户端需求
2. **额外层次**：增加了系统的层次结构
3. **维护成本**：需要维护外观类与子系统的一致性

## 🌟 实际应用案例

### API网关外观

```typescript
// 子系统服务
class UserService {
    getUser(id: string): any {
        console.log(`UserService: Getting user ${id}`);
        return { id, name: 'John Doe', email: 'john@example.com' };
    }
    
    updateUser(id: string, data: any): void {
        console.log(`UserService: Updating user ${id}`, data);
    }
}

class OrderService {
    getUserOrders(userId: string): any[] {
        console.log(`OrderService: Getting orders for user ${userId}`);
        return [{ id: 'ORDER1', amount: 100 }, { id: 'ORDER2', amount: 200 }];
    }
}

class RecommendationService {
    getRecommendations(userId: string): any[] {
        console.log(`RecommendationService: Getting recommendations for user ${userId}`);
        return [{ id: 'PROD1', name: 'Laptop' }, { id: 'PROD2', name: 'Mouse' }];
    }
}

// API网关外观
class APIGateway {
    private userService: UserService;
    private orderService: OrderService;
    private recommendationService: RecommendationService;
    
    constructor() {
        this.userService = new UserService();
        this.orderService = new OrderService();
        this.recommendationService = new RecommendationService();
    }
    
    getUserDashboard(userId: string): any {
        console.log(`\n=== Loading User Dashboard for ${userId} ===`);
        
        const user = this.userService.getUser(userId);
        const orders = this.orderService.getUserOrders(userId);
        const recommendations = this.recommendationService.getRecommendations(userId);
        
        return {
            user,
            recentOrders: orders.slice(0, 3),
            recommendations: recommendations.slice(0, 5),
            summary: {
                totalOrders: orders.length,
                totalSpent: orders.reduce((sum, order) => sum + order.amount, 0)
            }
        };
    }
}

// 使用示例
const apiGateway = new APIGateway();
const dashboard = apiGateway.getUserDashboard('USER123');
console.log('Dashboard data:', dashboard);
```

## 🔄 相关模式

- **适配器模式**：适配器改变接口，外观简化接口
- **中介者模式**：中介者封装对象间交互，外观简化子系统访问
- **抽象工厂模式**：可以与外观模式结合使用

## 🚀 最佳实践

1. **保持简单**：外观接口应该简单易用
2. **不要过度封装**：允许客户端直接访问子系统（如果需要）
3. **单一职责**：每个外观类应该有明确的职责
4. **文档化**：清楚地文档化外观类的功能和限制

## ⚠️ 注意事项

1. **功能完整性**：确保外观提供足够的功能
2. **性能考虑**：避免外观成为性能瓶颈
3. **版本兼容**：子系统变化时保持外观接口稳定
4. **错误处理**：妥善处理子系统的错误

## 📚 总结

外观模式通过提供统一的接口来简化复杂子系统的使用。它特别适用于需要简化复杂API或集成多个子系统的场景。

**使用建议**：
- 当子系统很复杂时使用
- 当需要为子系统提供简单接口时使用
- 当需要解耦客户端与子系统时使用
- 当构建分层系统时使用

---

**相关链接**：
- [适配器模式](./adapter.md)
- [代理模式](./proxy.md)
- [中介者模式](../behavioral/mediator.md) 