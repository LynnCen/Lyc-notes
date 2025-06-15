# 观察者模式 (Observer Pattern)

> [!NOTE]
> 观察者模式定义了对象之间的一对多依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知并自动更新。

## 📖 模式定义

**观察者模式**是一种行为型设计模式，它定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态变化时，会通知所有观察者对象，使它们能够自动更新自己。

### 核心要素
- **主题/被观察者**：维护观察者列表，提供注册和删除观察者的方法
- **观察者**：定义更新接口，当主题状态改变时被调用
- **具体主题**：实现主题接口，状态改变时通知观察者
- **具体观察者**：实现观察者接口，定义具体的更新行为

## 🎯 使用场景

### 适用情况
- **事件驱动系统**：GUI事件处理、消息系统
- **模型-视图架构**：MVC、MVP、MVVM模式
- **发布-订阅系统**：消息队列、事件总线
- **状态监控**：系统监控、数据变化通知
- **缓存更新**：数据变化时更新相关缓存

### 不适用情况
- 观察者和主题之间有复杂的依赖关系
- 通知过程可能导致性能问题
- 观察者数量过多

## 💡 实现方式

### TypeScript 实现

```typescript
// 观察者接口
interface Observer {
    update(subject: Subject): void;
}

// 主题接口
interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

// 具体主题 - 股票价格
class Stock implements Subject {
    private observers: Observer[] = [];
    private symbol: string;
    private price: number;
    private change: number;
    
    constructor(symbol: string, price: number) {
        this.symbol = symbol;
        this.price = price;
        this.change = 0;
    }
    
    attach(observer: Observer): void {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            console.log('Observer has been attached already.');
            return;
        }
        
        console.log('Attached an observer.');
        this.observers.push(observer);
    }
    
    detach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            console.log('Nonexistent observer.');
            return;
        }
        
        this.observers.splice(observerIndex, 1);
        console.log('Detached an observer.');
    }
    
    notify(): void {
        console.log('Notifying observers...');
        for (const observer of this.observers) {
            observer.update(this);
        }
    }
    
    setPrice(price: number): void {
        const oldPrice = this.price;
        this.price = price;
        this.change = price - oldPrice;
        console.log(`Stock ${this.symbol} price changed from $${oldPrice} to $${price}`);
        this.notify();
    }
    
    getSymbol(): string {
        return this.symbol;
    }
    
    getPrice(): number {
        return this.price;
    }
    
    getChange(): number {
        return this.change;
    }
}

// 具体观察者 - 投资者
class Investor implements Observer {
    private name: string;
    private portfolio: Map<string, number> = new Map();
    
    constructor(name: string) {
        this.name = name;
    }
    
    update(subject: Subject): void {
        if (subject instanceof Stock) {
            const stock = subject as Stock;
            console.log(`${this.name} notified: ${stock.getSymbol()} is now $${stock.getPrice()} (${stock.getChange() >= 0 ? '+' : ''}${stock.getChange()})`);
            
            // 根据价格变化做出投资决策
            if (stock.getChange() > 5) {
                console.log(`${this.name} is considering selling ${stock.getSymbol()}`);
            } else if (stock.getChange() < -5) {
                console.log(`${this.name} is considering buying ${stock.getSymbol()}`);
            }
        }
    }
    
    addToPortfolio(symbol: string, shares: number): void {
        this.portfolio.set(symbol, shares);
    }
    
    getName(): string {
        return this.name;
    }
}

// 具体观察者 - 股票显示器
class StockDisplay implements Observer {
    private displayName: string;
    
    constructor(displayName: string) {
        this.displayName = displayName;
    }
    
    update(subject: Subject): void {
        if (subject instanceof Stock) {
            const stock = subject as Stock;
            this.displayPrice(stock);
        }
    }
    
    private displayPrice(stock: Stock): void {
        const changeIndicator = stock.getChange() >= 0 ? '↗' : '↘';
        const changeColor = stock.getChange() >= 0 ? 'green' : 'red';
        
        console.log(`[${this.displayName}] ${stock.getSymbol()}: $${stock.getPrice()} ${changeIndicator} (${changeColor})`);
    }
}

// 使用示例
const appleStock = new Stock('AAPL', 150.00);

// 创建观察者
const investor1 = new Investor('Warren Buffett');
const investor2 = new Investor('Peter Lynch');
const display1 = new StockDisplay('Main Display');
const display2 = new StockDisplay('Mobile App');

// 注册观察者
appleStock.attach(investor1);
appleStock.attach(investor2);
appleStock.attach(display1);
appleStock.attach(display2);

// 价格变化
appleStock.setPrice(155.50);
appleStock.setPrice(148.25);
appleStock.setPrice(162.75);

// 移除观察者
appleStock.detach(investor2);
appleStock.setPrice(158.00);
```

### 事件驱动的观察者模式

```typescript
// 事件类型定义
type EventType = string;
type EventHandler<T = any> = (data: T) => void;

// 事件发射器
class EventEmitter {
    private events: Map<EventType, EventHandler[]> = new Map();
    
    on<T>(event: EventType, handler: EventHandler<T>): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(handler);
    }
    
    off<T>(event: EventType, handler: EventHandler<T>): void {
        const handlers = this.events.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    emit<T>(event: EventType, data?: T): void {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    
    once<T>(event: EventType, handler: EventHandler<T>): void {
        const onceHandler = (data: T) => {
            handler(data);
            this.off(event, onceHandler);
        };
        this.on(event, onceHandler);
    }
    
    removeAllListeners(event?: EventType): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
    
    listenerCount(event: EventType): number {
        const handlers = this.events.get(event);
        return handlers ? handlers.length : 0;
    }
}

// 用户管理系统
interface User {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'suspended';
}

class UserManager extends EventEmitter {
    private users: Map<number, User> = new Map();
    
    createUser(userData: Omit<User, 'id'>): User {
        const user: User = {
            id: Date.now(),
            ...userData,
            status: 'active'
        };
        
        this.users.set(user.id, user);
        this.emit('user:created', user);
        return user;
    }
    
    updateUser(id: number, updates: Partial<User>): User | null {
        const user = this.users.get(id);
        if (!user) return null;
        
        const oldUser = { ...user };
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        
        this.emit('user:updated', { old: oldUser, new: updatedUser });
        return updatedUser;
    }
    
    deleteUser(id: number): boolean {
        const user = this.users.get(id);
        if (!user) return false;
        
        this.users.delete(id);
        this.emit('user:deleted', user);
        return true;
    }
    
    suspendUser(id: number): boolean {
        const user = this.updateUser(id, { status: 'suspended' });
        if (user) {
            this.emit('user:suspended', user);
            return true;
        }
        return false;
    }
    
    getUser(id: number): User | undefined {
        return this.users.get(id);
    }
    
    getAllUsers(): User[] {
        return Array.from(this.users.values());
    }
}

// 邮件服务
class EmailService {
    constructor(private userManager: UserManager) {
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.userManager.on('user:created', (user: User) => {
            this.sendWelcomeEmail(user);
        });
        
        this.userManager.on('user:suspended', (user: User) => {
            this.sendSuspensionEmail(user);
        });
        
        this.userManager.on('user:deleted', (user: User) => {
            this.sendGoodbyeEmail(user);
        });
    }
    
    private sendWelcomeEmail(user: User): void {
        console.log(`📧 Sending welcome email to ${user.email}`);
    }
    
    private sendSuspensionEmail(user: User): void {
        console.log(`📧 Sending suspension notification to ${user.email}`);
    }
    
    private sendGoodbyeEmail(user: User): void {
        console.log(`📧 Sending goodbye email to ${user.email}`);
    }
}

// 审计服务
class AuditService {
    private logs: string[] = [];
    
    constructor(private userManager: UserManager) {
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.userManager.on('user:created', (user: User) => {
            this.log(`User created: ${user.name} (${user.email})`);
        });
        
        this.userManager.on('user:updated', (data: { old: User; new: User }) => {
            this.log(`User updated: ${data.old.name} -> ${data.new.name}`);
        });
        
        this.userManager.on('user:deleted', (user: User) => {
            this.log(`User deleted: ${user.name} (${user.email})`);
        });
        
        this.userManager.on('user:suspended', (user: User) => {
            this.log(`User suspended: ${user.name} (${user.email})`);
        });
    }
    
    private log(message: string): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.push(logEntry);
        console.log(`📝 Audit: ${logEntry}`);
    }
    
    getLogs(): string[] {
        return [...this.logs];
    }
}

// 缓存服务
class CacheService {
    private cache: Map<string, any> = new Map();
    
    constructor(private userManager: UserManager) {
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.userManager.on('user:updated', (data: { old: User; new: User }) => {
            this.invalidateUserCache(data.new.id);
        });
        
        this.userManager.on('user:deleted', (user: User) => {
            this.invalidateUserCache(user.id);
        });
        
        this.userManager.on('user:suspended', (user: User) => {
            this.invalidateUserCache(user.id);
        });
    }
    
    private invalidateUserCache(userId: number): void {
        const cacheKey = `user:${userId}`;
        if (this.cache.has(cacheKey)) {
            this.cache.delete(cacheKey);
            console.log(`🗑️ Cache invalidated for user ${userId}`);
        }
    }
    
    setCache(key: string, value: any): void {
        this.cache.set(key, value);
    }
    
    getCache(key: string): any {
        return this.cache.get(key);
    }
}

// 使用示例
const userManager = new UserManager();
const emailService = new EmailService(userManager);
const auditService = new AuditService(userManager);
const cacheService = new CacheService(userManager);

console.log('=== User Management System Demo ===');

// 创建用户
const user1 = userManager.createUser({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
});

const user2 = userManager.createUser({
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active'
});

// 更新用户
userManager.updateUser(user1.id, { name: 'John Smith' });

// 暂停用户
userManager.suspendUser(user2.id);

// 删除用户
userManager.deleteUser(user1.id);

console.log('\n=== Audit Logs ===');
auditService.getLogs().forEach(log => console.log(log));
```

### Java 实现

```java
import java.util.*;

// 观察者接口
interface Observer {
    void update(String message);
}

// 主题接口
interface Subject {
    void attach(Observer observer);
    void detach(Observer observer);
    void notifyObservers();
}

// 具体主题 - 新闻发布者
class NewsPublisher implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String news;
    
    @Override
    public void attach(Observer observer) {
        observers.add(observer);
        System.out.println("Observer attached. Total observers: " + observers.size());
    }
    
    @Override
    public void detach(Observer observer) {
        observers.remove(observer);
        System.out.println("Observer detached. Total observers: " + observers.size());
    }
    
    @Override
    public void notifyObservers() {
        System.out.println("Notifying " + observers.size() + " observers...");
        for (Observer observer : observers) {
            observer.update(news);
        }
    }
    
    public void publishNews(String news) {
        this.news = news;
        System.out.println("News published: " + news);
        notifyObservers();
    }
    
    public String getLatestNews() {
        return news;
    }
}

// 具体观察者 - 新闻频道
class NewsChannel implements Observer {
    private String channelName;
    private String latestNews;
    
    public NewsChannel(String channelName) {
        this.channelName = channelName;
    }
    
    @Override
    public void update(String news) {
        this.latestNews = news;
        broadcast();
    }
    
    private void broadcast() {
        System.out.println("[" + channelName + "] Broadcasting: " + latestNews);
    }
    
    public String getChannelName() {
        return channelName;
    }
}

// 具体观察者 - 新闻网站
class NewsWebsite implements Observer {
    private String websiteName;
    private List<String> newsArchive = new ArrayList<>();
    
    public NewsWebsite(String websiteName) {
        this.websiteName = websiteName;
    }
    
    @Override
    public void update(String news) {
        newsArchive.add(news);
        publishOnWebsite(news);
    }
    
    private void publishOnWebsite(String news) {
        System.out.println("[" + websiteName + "] Published online: " + news);
        System.out.println("[" + websiteName + "] Total articles: " + newsArchive.size());
    }
    
    public List<String> getNewsArchive() {
        return new ArrayList<>(newsArchive);
    }
}

// 使用示例
public class ObserverPatternExample {
    public static void main(String[] args) {
        // 创建新闻发布者
        NewsPublisher publisher = new NewsPublisher();
        
        // 创建观察者
        NewsChannel cnn = new NewsChannel("CNN");
        NewsChannel bbc = new NewsChannel("BBC");
        NewsWebsite newsWebsite = new NewsWebsite("NewsPortal.com");
        
        // 注册观察者
        publisher.attach(cnn);
        publisher.attach(bbc);
        publisher.attach(newsWebsite);
        
        // 发布新闻
        publisher.publishNews("Breaking: New technology breakthrough announced!");
        System.out.println();
        
        publisher.publishNews("Weather: Sunny skies expected this weekend.");
        System.out.println();
        
        // 移除一个观察者
        publisher.detach(bbc);
        
        publisher.publishNews("Sports: Local team wins championship!");
        System.out.println();
        
        // 显示网站存档
        System.out.println("News archive:");
        for (String news : newsWebsite.getNewsArchive()) {
            System.out.println("- " + news);
        }
    }
}
```

### Python 实现

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import threading
from datetime import datetime

# 观察者接口
class Observer(ABC):
    @abstractmethod
    def update(self, subject: 'Subject', event_type: str, data: Any = None):
        pass

# 主题接口
class Subject(ABC):
    def __init__(self):
        self._observers: List[Observer] = []
        self._lock = threading.Lock()
    
    def attach(self, observer: Observer):
        with self._lock:
            if observer not in self._observers:
                self._observers.append(observer)
                print(f"Observer attached. Total: {len(self._observers)}")
    
    def detach(self, observer: Observer):
        with self._lock:
            if observer in self._observers:
                self._observers.remove(observer)
                print(f"Observer detached. Total: {len(self._observers)}")
    
    def notify(self, event_type: str, data: Any = None):
        with self._lock:
            observers_copy = self._observers.copy()
        
        print(f"Notifying {len(observers_copy)} observers about '{event_type}'")
        for observer in observers_copy:
            try:
                observer.update(self, event_type, data)
            except Exception as e:
                print(f"Error notifying observer: {e}")

# 具体主题 - 温度传感器
class TemperatureSensor(Subject):
    def __init__(self, location: str):
        super().__init__()
        self._location = location
        self._temperature = 0.0
        self._humidity = 0.0
        self._timestamp = datetime.now()
    
    def set_readings(self, temperature: float, humidity: float):
        old_temp = self._temperature
        self._temperature = temperature
        self._humidity = humidity
        self._timestamp = datetime.now()
        
        print(f"[{self._location}] Temperature: {temperature}°C, Humidity: {humidity}%")
        
        # 通知温度变化
        if abs(temperature - old_temp) > 0.5:  # 温度变化超过0.5度
            self.notify('temperature_changed', {
                'location': self._location,
                'old_temperature': old_temp,
                'new_temperature': temperature,
                'humidity': humidity,
                'timestamp': self._timestamp
            })
        
        # 检查异常情况
        if temperature > 35:
            self.notify('high_temperature_alert', {
                'location': self._location,
                'temperature': temperature,
                'timestamp': self._timestamp
            })
        elif temperature < 0:
            self.notify('low_temperature_alert', {
                'location': self._location,
                'temperature': temperature,
                'timestamp': self._timestamp
            })
    
    @property
    def location(self):
        return self._location
    
    @property
    def temperature(self):
        return self._temperature
    
    @property
    def humidity(self):
        return self._humidity

# 具体观察者 - 显示器
class TemperatureDisplay(Observer):
    def __init__(self, display_name: str):
        self.display_name = display_name
        self.readings: List[Dict] = []
    
    def update(self, subject: Subject, event_type: str, data: Any = None):
        if isinstance(subject, TemperatureSensor):
            if event_type == 'temperature_changed':
                self._display_reading(data)
                self.readings.append(data)
            elif event_type in ['high_temperature_alert', 'low_temperature_alert']:
                self._display_alert(event_type, data)
    
    def _display_reading(self, data: Dict):
        print(f"[{self.display_name}] {data['location']}: "
              f"{data['new_temperature']}°C ({data['humidity']}% humidity) "
              f"at {data['timestamp'].strftime('%H:%M:%S')}")
    
    def _display_alert(self, alert_type: str, data: Dict):
        alert_msg = "HIGH TEMP" if "high" in alert_type else "LOW TEMP"
        print(f"[{self.display_name}] ⚠️ {alert_msg} ALERT: "
              f"{data['location']} - {data['temperature']}°C")

# 具体观察者 - 数据记录器
class DataLogger(Observer):
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.logs: List[str] = []
    
    def update(self, subject: Subject, event_type: str, data: Any = None):
        timestamp = datetime.now().isoformat()
        
        if event_type == 'temperature_changed':
            log_entry = (f"{timestamp} - TEMP_CHANGE - {data['location']}: "
                        f"{data['old_temperature']}°C -> {data['new_temperature']}°C")
        elif 'alert' in event_type:
            log_entry = (f"{timestamp} - ALERT - {event_type.upper()}: "
                        f"{data['location']} - {data['temperature']}°C")
        else:
            log_entry = f"{timestamp} - {event_type.upper()} - {data}"
        
        self.logs.append(log_entry)
        self._write_to_file(log_entry)
    
    def _write_to_file(self, log_entry: str):
        print(f"[DataLogger] Writing to {self.log_file}: {log_entry}")
    
    def get_logs(self) -> List[str]:
        return self.logs.copy()

# 具体观察者 - 空调控制器
class AirConditionerController(Observer):
    def __init__(self, controller_id: str):
        self.controller_id = controller_id
        self.target_temperature = 22.0
        self.is_running = False
    
    def update(self, subject: Subject, event_type: str, data: Any = None):
        if event_type == 'temperature_changed':
            self._adjust_temperature(data)
        elif event_type == 'high_temperature_alert':
            self._emergency_cooling(data)
    
    def _adjust_temperature(self, data: Dict):
        current_temp = data['new_temperature']
        location = data['location']
        
        if current_temp > self.target_temperature + 2:
            if not self.is_running:
                self.is_running = True
                print(f"[AC-{self.controller_id}] Starting cooling for {location} "
                      f"(Current: {current_temp}°C, Target: {self.target_temperature}°C)")
        elif current_temp < self.target_temperature - 1:
            if self.is_running:
                self.is_running = False
                print(f"[AC-{self.controller_id}] Stopping cooling for {location} "
                      f"(Current: {current_temp}°C, Target: {self.target_temperature}°C)")
    
    def _emergency_cooling(self, data: Dict):
        print(f"[AC-{self.controller_id}] 🚨 EMERGENCY COOLING ACTIVATED! "
              f"{data['location']} - {data['temperature']}°C")
        self.is_running = True
    
    def set_target_temperature(self, temperature: float):
        self.target_temperature = temperature
        print(f"[AC-{self.controller_id}] Target temperature set to {temperature}°C")

# 使用示例
if __name__ == "__main__":
    # 创建温度传感器
    living_room_sensor = TemperatureSensor("Living Room")
    bedroom_sensor = TemperatureSensor("Bedroom")
    
    # 创建观察者
    main_display = TemperatureDisplay("Main Display")
    mobile_display = TemperatureDisplay("Mobile App")
    data_logger = DataLogger("temperature.log")
    ac_controller = AirConditionerController("AC-001")
    
    # 注册观察者到客厅传感器
    living_room_sensor.attach(main_display)
    living_room_sensor.attach(mobile_display)
    living_room_sensor.attach(data_logger)
    living_room_sensor.attach(ac_controller)
    
    # 注册观察者到卧室传感器
    bedroom_sensor.attach(main_display)
    bedroom_sensor.attach(data_logger)
    
    print("=== Temperature Monitoring System Started ===\n")
    
    # 模拟温度变化
    living_room_sensor.set_readings(20.0, 45.0)
    print()
    
    living_room_sensor.set_readings(25.5, 50.0)
    print()
    
    bedroom_sensor.set_readings(18.0, 40.0)
    print()
    
    living_room_sensor.set_readings(38.0, 60.0)  # 高温警报
    print()
    
    # 调整空调目标温度
    ac_controller.set_target_temperature(24.0)
    living_room_sensor.set_readings(26.5, 55.0)
    print()
    
    # 显示日志
    print("=== Data Logger History ===")
    for log in data_logger.get_logs():
        print(log)
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **松耦合**：主题和观察者之间松耦合，可以独立变化
2. **动态关系**：可以在运行时建立对象之间的关系
3. **广播通信**：支持一对多的通信机制
4. **开闭原则**：可以在不修改主题的情况下增加新的观察者

### ❌ 缺点
1. **性能问题**：观察者过多时通知可能很慢
2. **内存泄漏**：观察者没有正确移除可能导致内存泄漏
3. **循环依赖**：观察者和主题之间可能形成循环依赖
4. **调试困难**：异步通知使得调试变得困难

## 🌟 实际应用案例

### 1. 购物车系统

```typescript
// 购物车项目
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

// 购物车事件
interface CartEvent {
    type: 'item_added' | 'item_removed' | 'item_updated' | 'cart_cleared';
    item?: CartItem;
    oldItem?: CartItem;
    cart: CartItem[];
    total: number;
}

// 购物车主题
class ShoppingCart extends EventEmitter {
    private items: Map<string, CartItem> = new Map();
    
    addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
        const existingItem = this.items.get(item.id);
        
        if (existingItem) {
            const oldItem = { ...existingItem };
            existingItem.quantity += quantity;
            this.emit('item_updated', {
                type: 'item_updated',
                item: existingItem,
                oldItem,
                cart: this.getItems(),
                total: this.getTotal()
            });
        } else {
            const newItem: CartItem = { ...item, quantity };
            this.items.set(item.id, newItem);
            this.emit('item_added', {
                type: 'item_added',
                item: newItem,
                cart: this.getItems(),
                total: this.getTotal()
            });
        }
    }
    
    removeItem(itemId: string): void {
        const item = this.items.get(itemId);
        if (item) {
            this.items.delete(itemId);
            this.emit('item_removed', {
                type: 'item_removed',
                item,
                cart: this.getItems(),
                total: this.getTotal()
            });
        }
    }
    
    updateQuantity(itemId: string, quantity: number): void {
        const item = this.items.get(itemId);
        if (item) {
            const oldItem = { ...item };
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.emit('item_updated', {
                    type: 'item_updated',
                    item,
                    oldItem,
                    cart: this.getItems(),
                    total: this.getTotal()
                });
            }
        }
    }
    
    clear(): void {
        this.items.clear();
        this.emit('cart_cleared', {
            type: 'cart_cleared',
            cart: [],
            total: 0
        });
    }
    
    getItems(): CartItem[] {
        return Array.from(this.items.values());
    }
    
    getTotal(): number {
        return Array.from(this.items.values())
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount(): number {
        return Array.from(this.items.values())
            .reduce((count, item) => count + item.quantity, 0);
    }
}

// 购物车UI组件
class CartUI {
    constructor(private cart: ShoppingCart) {
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.cart.on('item_added', (event: CartEvent) => {
            console.log(`🛒 UI: Added ${event.item!.name} to cart`);
            this.updateDisplay(event);
        });
        
        this.cart.on('item_removed', (event: CartEvent) => {
            console.log(`🛒 UI: Removed ${event.item!.name} from cart`);
            this.updateDisplay(event);
        });
        
        this.cart.on('item_updated', (event: CartEvent) => {
            console.log(`🛒 UI: Updated ${event.item!.name} quantity to ${event.item!.quantity}`);
            this.updateDisplay(event);
        });
        
        this.cart.on('cart_cleared', (event: CartEvent) => {
            console.log('🛒 UI: Cart cleared');
            this.updateDisplay(event);
        });
    }
    
    private updateDisplay(event: CartEvent): void {
        console.log(`🛒 UI: Cart total: $${event.total.toFixed(2)} (${event.cart.length} items)`);
    }
}

// 库存管理
class InventoryManager {
    private inventory: Map<string, number> = new Map();
    
    constructor(private cart: ShoppingCart) {
        this.setupListeners();
        this.initializeInventory();
    }
    
    private initializeInventory(): void {
        this.inventory.set('laptop', 10);
        this.inventory.set('mouse', 25);
        this.inventory.set('keyboard', 15);
    }
    
    private setupListeners(): void {
        this.cart.on('item_added', (event: CartEvent) => {
            this.updateInventory(event.item!.id, -event.item!.quantity);
        });
        
        this.cart.on('item_updated', (event: CartEvent) => {
            const quantityDiff = event.item!.quantity - event.oldItem!.quantity;
            this.updateInventory(event.item!.id, -quantityDiff);
        });
        
        this.cart.on('item_removed', (event: CartEvent) => {
            this.updateInventory(event.item!.id, event.item!.quantity);
        });
    }
    
    private updateInventory(itemId: string, change: number): void {
        const currentStock = this.inventory.get(itemId) || 0;
        const newStock = currentStock + change;
        this.inventory.set(itemId, Math.max(0, newStock));
        
        console.log(`📦 Inventory: ${itemId} stock updated to ${newStock}`);
        
        if (newStock <= 2) {
            console.log(`⚠️ Inventory: Low stock alert for ${itemId}!`);
        }
    }
    
    getStock(itemId: string): number {
        return this.inventory.get(itemId) || 0;
    }
}

// 推荐系统
class RecommendationEngine {
    constructor(private cart: ShoppingCart) {
        this.setupListeners();
    }
    
    private setupListeners(): void {
        this.cart.on('item_added', (event: CartEvent) => {
            this.generateRecommendations(event.item!);
        });
    }
    
    private generateRecommendations(item: CartItem): void {
        const recommendations = this.getRecommendations(item.id);
        if (recommendations.length > 0) {
            console.log(`💡 Recommendations based on ${item.name}:`);
            recommendations.forEach(rec => console.log(`   - ${rec}`));
        }
    }
    
    private getRecommendations(itemId: string): string[] {
        const recommendations: Record<string, string[]> = {
            'laptop': ['Laptop Bag', 'Wireless Mouse', 'External Monitor'],
            'mouse': ['Mouse Pad', 'Keyboard', 'USB Hub'],
            'keyboard': ['Wrist Rest', 'Mouse', 'Monitor Stand']
        };
        
        return recommendations[itemId] || [];
    }
}

// 使用示例
const cart = new ShoppingCart();
const cartUI = new CartUI(cart);
const inventoryManager = new InventoryManager(cart);
const recommendationEngine = new RecommendationEngine(cart);

console.log('=== Shopping Cart System Demo ===\n');

// 添加商品到购物车
cart.addItem({ id: 'laptop', name: 'Gaming Laptop', price: 1299.99 });
cart.addItem({ id: 'mouse', name: 'Wireless Mouse', price: 29.99 }, 2);
cart.addItem({ id: 'keyboard', name: 'Mechanical Keyboard', price: 89.99 });

console.log('\n--- Updating quantities ---');
cart.updateQuantity('mouse', 3);

console.log('\n--- Removing item ---');
cart.removeItem('keyboard');

console.log('\n--- Adding more items ---');
cart.addItem({ id: 'laptop', name: 'Gaming Laptop', price: 1299.99 });

console.log(`\nFinal cart total: $${cart.getTotal().toFixed(2)}`);
console.log(`Total items: ${cart.getItemCount()}`);
```

## 🔄 相关模式

### 与其他模式的关系
- **中介者模式**：中介者模式集中控制交互，观察者模式分散通知
- **发布-订阅模式**：观察者模式的变体，通过消息代理解耦
- **MVC模式**：观察者模式是MVC架构的基础
- **命令模式**：可以将通知封装为命令对象

### 模式组合

```typescript
// 观察者 + 命令模式
interface Command {
    execute(): void;
    undo(): void;
}

class NotificationCommand implements Command {
    constructor(
        private observer: Observer,
        private subject: Subject,
        private eventType: string,
        private data: any
    ) {}
    
    execute(): void {
        this.observer.update(this.subject, this.eventType, this.data);
    }
    
    undo(): void {
        // 实现撤销逻辑
    }
}

class CommandBasedSubject extends EventEmitter {
    private commandHistory: Command[] = [];
    
    notifyWithCommand(observer: Observer, eventType: string, data: any): void {
        const command = new NotificationCommand(observer, this, eventType, data);
        command.execute();
        this.commandHistory.push(command);
    }
}
```

## 🚀 最佳实践

### 1. 弱引用观察者

```typescript
class WeakObserverSubject {
    private observers: WeakSet<Observer> = new WeakSet();
    private observerList: Observer[] = [];
    
    attach(observer: Observer): void {
        if (!this.observers.has(observer)) {
            this.observers.add(observer);
            this.observerList.push(observer);
        }
    }
    
    detach(observer: Observer): void {
        if (this.observers.has(observer)) {
            this.observers.delete(observer);
            const index = this.observerList.indexOf(observer);
            if (index > -1) {
                this.observerList.splice(index, 1);
            }
        }
    }
    
    notify(): void {
        // 清理已被垃圾回收的观察者
        this.observerList = this.observerList.filter(observer => 
            this.observers.has(observer)
        );
        
        this.observerList.forEach(observer => {
            try {
                observer.update(this);
            } catch (error) {
                console.error('Observer notification failed:', error);
            }
        });
    }
}
```

### 2. 异步观察者

```typescript
class AsyncSubject {
    private observers: Observer[] = [];
    
    async notifyAsync(): Promise<void> {
        const promises = this.observers.map(observer => 
            Promise.resolve().then(() => observer.update(this))
        );
        
        await Promise.allSettled(promises);
    }
    
    notifyParallel(): void {
        this.observers.forEach(observer => {
            setImmediate(() => {
                try {
                    observer.update(this);
                } catch (error) {
                    console.error('Async observer notification failed:', error);
                }
            });
        });
    }
}
```

## ⚠️ 注意事项

1. **内存泄漏**：确保及时移除不再需要的观察者
2. **循环依赖**：避免观察者和主题之间的循环引用
3. **异常处理**：观察者中的异常不应影响其他观察者
4. **性能优化**：观察者过多时考虑异步通知
5. **线程安全**：多线程环境下要注意同步问题

## 📚 总结

观察者模式是一个非常重要的行为型模式，它实现了对象之间的松耦合通信。这个模式在事件驱动编程、GUI开发、MVC架构等场景中广泛应用。

**使用建议**：
- 当一个抽象模型有两个方面，其中一个方面依赖于另一个方面时使用
- 当对一个对象的改变需要同时改变其他对象，而不知道具体有多少对象有待改变时使用
- 当一个对象必须通知其他对象，而它又不能假定其他对象是谁时使用
- 注意避免观察者过多导致的性能问题
- 合理管理观察者的生命周期，避免内存泄漏

---

**相关链接**：
- [中介者模式](./mediator.md)
- [命令模式](./command.md)
- [发布订阅模式](../modern/pub-sub.md) 