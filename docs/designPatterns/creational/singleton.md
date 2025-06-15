# 单例模式 (Singleton Pattern)

> [!NOTE]
> 单例模式是最简单的设计模式之一，确保一个类只有一个实例，并提供全局访问点。

## 📖 模式定义

**单例模式**是一种创建型设计模式，它保证一个类只有一个实例，并提供一个全局访问点来获取该实例。

### 核心要素
- **唯一实例**：确保类只能创建一个实例
- **全局访问**：提供全局访问点
- **延迟初始化**：通常在第一次使用时才创建实例
- **线程安全**：在多线程环境下保证实例的唯一性

## 🎯 使用场景

### 适用情况
- **配置管理器**：应用程序的配置信息
- **日志记录器**：全局日志记录服务
- **数据库连接池**：管理数据库连接
- **缓存管理器**：全局缓存服务
- **线程池**：管理线程资源
- **设备驱动程序**：硬件设备的唯一访问点

### 不适用情况
- 需要多个实例的场景
- 单元测试困难的情况
- 需要继承的类

## 💡 实现方式

### JavaScript/TypeScript 实现

#### 1. 基础实现
```javascript
class Singleton {
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        
        this.data = [];
        Singleton.instance = this;
        return this;
    }
    
    addData(item) {
        this.data.push(item);
    }
    
    getData() {
        return this.data;
    }
}

// 使用示例
const instance1 = new Singleton();
const instance2 = new Singleton();

console.log(instance1 === instance2); // true
```

#### 2. 模块化实现（推荐）
```javascript
// singleton.js
class ConfigManager {
    constructor() {
        this.config = {};
    }
    
    setConfig(key, value) {
        this.config[key] = value;
    }
    
    getConfig(key) {
        return this.config[key];
    }
    
    getAllConfig() {
        return { ...this.config };
    }
}

// 导出单例实例
export default new ConfigManager();
```

#### 3. TypeScript 实现
```typescript
class Logger {
    private static instance: Logger;
    private logs: string[] = [];
    
    private constructor() {}
    
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    
    public log(message: string): void {
        const timestamp = new Date().toISOString();
        this.logs.push(`[${timestamp}] ${message}`);
        console.log(`[${timestamp}] ${message}`);
    }
    
    public getLogs(): string[] {
        return [...this.logs];
    }
    
    public clearLogs(): void {
        this.logs = [];
    }
}

// 使用示例
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

console.log(logger1 === logger2); // true

logger1.log("Application started");
logger2.log("User logged in");
console.log(logger1.getLogs()); // 包含两条日志
```

### Java 实现

#### 1. 懒汉式（线程不安全）
```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

#### 2. 懒汉式（线程安全）
```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {}
    
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

#### 3. 双重检查锁定（推荐）
```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

#### 4. 枚举实现（最佳实践）
```java
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {
        // 业务逻辑
    }
}

// 使用
Singleton.INSTANCE.doSomething();
```

### Python 实现

#### 1. 使用 __new__ 方法
```python
class Singleton:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.data = []
            self.initialized = True
    
    def add_data(self, item):
        self.data.append(item)
    
    def get_data(self):
        return self.data.copy()

# 使用示例
instance1 = Singleton()
instance2 = Singleton()
print(instance1 is instance2)  # True
```

#### 2. 使用装饰器
```python
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class DatabaseConnection:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        print("Connecting to database...")
        self.connection = "Connected"
    
    def query(self, sql):
        return f"Executing: {sql}"

# 使用示例
db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **节省内存**：只创建一个实例，减少内存开销
2. **全局访问**：提供全局访问点，方便使用
3. **延迟初始化**：只在需要时才创建实例
4. **避免资源冲突**：确保对共享资源的一致访问

### ❌ 缺点
1. **违反单一职责原则**：既要管理实例创建，又要处理业务逻辑
2. **难以测试**：全局状态使单元测试变得困难
3. **隐藏依赖关系**：代码依赖关系不明确
4. **线程安全问题**：多线程环境下需要特殊处理
5. **扩展困难**：难以继承和扩展

## 🌟 实际应用案例

### 1. 配置管理器
```typescript
class AppConfig {
    private static instance: AppConfig;
    private config: Map<string, any> = new Map();
    
    private constructor() {
        this.loadConfig();
    }
    
    public static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }
    
    private loadConfig(): void {
        // 从文件或环境变量加载配置
        this.config.set('apiUrl', process.env.API_URL || 'http://localhost:3000');
        this.config.set('dbHost', process.env.DB_HOST || 'localhost');
        this.config.set('logLevel', process.env.LOG_LEVEL || 'info');
    }
    
    public get(key: string): any {
        return this.config.get(key);
    }
    
    public set(key: string, value: any): void {
        this.config.set(key, value);
    }
}

// 在应用中使用
const config = AppConfig.getInstance();
const apiUrl = config.get('apiUrl');
```

### 2. 日志记录器
```javascript
class Logger {
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        
        this.logs = [];
        this.level = 'info';
        Logger.instance = this;
    }
    
    setLevel(level) {
        this.level = level;
    }
    
    log(level, message) {
        if (this.shouldLog(level)) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level,
                message
            };
            this.logs.push(logEntry);
            console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`);
        }
    }
    
    info(message) {
        this.log('info', message);
    }
    
    warn(message) {
        this.log('warn', message);
    }
    
    error(message) {
        this.log('error', message);
    }
    
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }
    
    getLogs() {
        return [...this.logs];
    }
}

// 导出单例实例
export default new Logger();
```

### 3. 缓存管理器
```python
import threading
import time
from typing import Any, Optional

class CacheManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.cache = {}
            self.expiry = {}
            self.initialized = True
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        """设置缓存项，ttl为过期时间（秒）"""
        self.cache[key] = value
        self.expiry[key] = time.time() + ttl
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存项"""
        if key not in self.cache:
            return None
        
        if time.time() > self.expiry[key]:
            self.delete(key)
            return None
        
        return self.cache[key]
    
    def delete(self, key: str):
        """删除缓存项"""
        self.cache.pop(key, None)
        self.expiry.pop(key, None)
    
    def clear(self):
        """清空所有缓存"""
        self.cache.clear()
        self.expiry.clear()
    
    def cleanup_expired(self):
        """清理过期的缓存项"""
        current_time = time.time()
        expired_keys = [
            key for key, expiry_time in self.expiry.items()
            if current_time > expiry_time
        ]
        for key in expired_keys:
            self.delete(key)

# 使用示例
cache = CacheManager()
cache.set('user:123', {'name': 'John', 'email': 'john@example.com'})
user = cache.get('user:123')
```

## 🔄 相关模式

### 与其他模式的关系
- **工厂模式**：单例可以作为工厂的实现方式
- **抽象工厂模式**：抽象工厂通常实现为单例
- **建造者模式**：建造者可以是单例
- **原型模式**：原型注册表通常是单例

### 模式组合
```typescript
// 单例 + 工厂模式
class DatabaseFactory {
    private static instance: DatabaseFactory;
    private connections: Map<string, any> = new Map();
    
    private constructor() {}
    
    public static getInstance(): DatabaseFactory {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new DatabaseFactory();
        }
        return DatabaseFactory.instance;
    }
    
    public createConnection(type: string, config: any): any {
        const key = `${type}_${JSON.stringify(config)}`;
        
        if (!this.connections.has(key)) {
            let connection;
            switch (type) {
                case 'mysql':
                    connection = new MySQLConnection(config);
                    break;
                case 'postgresql':
                    connection = new PostgreSQLConnection(config);
                    break;
                default:
                    throw new Error(`Unsupported database type: ${type}`);
            }
            this.connections.set(key, connection);
        }
        
        return this.connections.get(key);
    }
}
```

## 🚀 最佳实践

### 1. 线程安全
```java
// 使用枚举实现线程安全的单例
public enum ThreadSafeSingleton {
    INSTANCE;
    
    private final Map<String, Object> data = new ConcurrentHashMap<>();
    
    public void put(String key, Object value) {
        data.put(key, value);
    }
    
    public Object get(String key) {
        return data.get(key);
    }
}
```

### 2. 可测试的单例
```typescript
interface ILogger {
    log(message: string): void;
    getLogs(): string[];
}

class Logger implements ILogger {
    private static instance: Logger;
    private logs: string[] = [];
    
    private constructor() {}
    
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    
    // 为测试提供重置方法
    public static resetInstance(): void {
        Logger.instance = null as any;
    }
    
    public log(message: string): void {
        this.logs.push(message);
    }
    
    public getLogs(): string[] {
        return [...this.logs];
    }
}

// 测试时可以重置单例
beforeEach(() => {
    Logger.resetInstance();
});
```

### 3. 依赖注入替代方案
```typescript
// 使用依赖注入容器替代单例
class ServiceContainer {
    private services: Map<string, any> = new Map();
    
    register<T>(name: string, factory: () => T): void {
        this.services.set(name, factory);
    }
    
    get<T>(name: string): T {
        const factory = this.services.get(name);
        if (!factory) {
            throw new Error(`Service ${name} not found`);
        }
        return factory();
    }
}

// 注册服务
const container = new ServiceContainer();
container.register('logger', () => new Logger());
container.register('config', () => new ConfigManager());

// 使用服务
const logger = container.get<Logger>('logger');
```

## ⚠️ 注意事项

1. **避免滥用**：不要把所有全局对象都做成单例
2. **考虑替代方案**：依赖注入、模块化等
3. **线程安全**：多线程环境下要特别注意
4. **测试困难**：考虑提供测试友好的接口
5. **序列化问题**：单例对象的序列化需要特殊处理

## 📚 总结

单例模式是一个简单但需要谨慎使用的模式。它在某些场景下非常有用，但也容易被滥用。现代开发中，更推荐使用依赖注入、模块化等方式来管理全局状态，而不是过度依赖单例模式。

**使用建议**：
- 确实需要全局唯一实例时才使用
- 优先考虑模块化和依赖注入
- 注意线程安全和测试友好性
- 避免在单例中包含过多业务逻辑

---

**相关链接**：
- [工厂方法模式](../creational/factory-method.md)
- [抽象工厂模式](../creational/abstract-factory.md)
- [依赖注入模式](../modern/dependency-injection.md) 