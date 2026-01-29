# 适配器模式 (Adapter Pattern)

> [!NOTE]
> 适配器模式允许接口不兼容的类一起工作，它将一个类的接口转换成客户希望的另一个接口。

## 📖 模式定义

**适配器模式**是一种结构型设计模式，它能使接口不兼容的对象能够相互合作。适配器模式通过创建一个包装类，将一个接口转换成客户端期望的另一个接口。

### 核心要素
- **目标接口**：客户端期望的接口
- **适配者**：需要被适配的现有接口
- **适配器**：实现目标接口并包装适配者的类
- **客户端**：使用目标接口的代码

## 🎯 使用场景

### 适用情况
- **遗留系统集成**：需要使用旧系统的功能但接口不匹配
- **第三方库集成**：第三方库的接口与系统不兼容
- **数据格式转换**：不同数据格式之间的转换
- **API版本兼容**：新旧API版本之间的兼容
- **多平台适配**：同一功能在不同平台上的实现

### 不适用情况
- 接口已经兼容
- 可以直接修改现有接口
- 适配逻辑过于复杂

## 💡 实现方式

### TypeScript 实现

```typescript
// 目标接口 - 现代支付接口
interface PaymentProcessor {
    processPayment(amount: number, currency: string): Promise<PaymentResult>;
    validatePayment(paymentData: PaymentData): boolean;
    getTransactionStatus(transactionId: string): TransactionStatus;
}

interface PaymentResult {
    success: boolean;
    transactionId: string;
    message: string;
}

interface PaymentData {
    amount: number;
    currency: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

// 适配者 - 遗留支付系统
class LegacyPaymentSystem {
    public makePayment(sum: number, currencyCode: string, cardInfo: any): any {
        console.log(`Legacy system processing payment: ${sum} ${currencyCode}`);
        
        // 模拟遗留系统的处理逻辑
        if (sum > 0 && cardInfo.number && cardInfo.expiry) {
            return {
                status: 'OK',
                reference: 'LEG_' + Date.now(),
                description: 'Payment processed successfully'
            };
        } else {
            return {
                status: 'ERROR',
                reference: null,
                description: 'Payment failed'
            };
        }
    }
    
    public checkPayment(reference: string): any {
        console.log(`Checking payment status for: ${reference}`);
        return {
            status: 'COMPLETED',
            reference: reference
        };
    }
    
    public validateCard(cardInfo: any): boolean {
        return cardInfo.number && cardInfo.number.length >= 16 && cardInfo.expiry;
    }
}

// 适配器
class LegacyPaymentAdapter implements PaymentProcessor {
    private legacySystem: LegacyPaymentSystem;
    
    constructor(legacySystem: LegacyPaymentSystem) {
        this.legacySystem = legacySystem;
    }
    
    async processPayment(amount: number, currency: string): Promise<PaymentResult> {
        // 转换数据格式
        const cardInfo = {
            number: '1234567890123456', // 在实际应用中应该从PaymentData获取
            expiry: '12/25',
            cvv: '123'
        };
        
        // 调用遗留系统
        const legacyResult = this.legacySystem.makePayment(amount, currency, cardInfo);
        
        // 转换返回结果
        return {
            success: legacyResult.status === 'OK',
            transactionId: legacyResult.reference || '',
            message: legacyResult.description
        };
    }
    
    validatePayment(paymentData: PaymentData): boolean {
        // 转换数据格式
        const cardInfo = {
            number: paymentData.cardNumber,
            expiry: paymentData.expiryDate,
            cvv: paymentData.cvv
        };
        
        return this.legacySystem.validateCard(cardInfo);
    }
    
    getTransactionStatus(transactionId: string): TransactionStatus {
        const legacyStatus = this.legacySystem.checkPayment(transactionId);
        
        // 转换状态格式
        switch (legacyStatus.status) {
            case 'COMPLETED':
                return TransactionStatus.SUCCESS;
            case 'PENDING':
                return TransactionStatus.PENDING;
            case 'FAILED':
                return TransactionStatus.FAILED;
            default:
                return TransactionStatus.PENDING;
        }
    }
}

// 现代支付系统（作为对比）
class ModernPaymentSystem implements PaymentProcessor {
    async processPayment(amount: number, currency: string): Promise<PaymentResult> {
        console.log(`Modern system processing payment: ${amount} ${currency}`);
        
        return {
            success: true,
            transactionId: 'MOD_' + Date.now(),
            message: 'Payment processed successfully'
        };
    }
    
    validatePayment(paymentData: PaymentData): boolean {
        return paymentData.amount > 0 && 
               paymentData.cardNumber.length >= 16 && 
               paymentData.expiryDate.length === 5;
    }
    
    getTransactionStatus(transactionId: string): TransactionStatus {
        return TransactionStatus.SUCCESS;
    }
}

// 客户端代码
class PaymentService {
    private processor: PaymentProcessor;
    
    constructor(processor: PaymentProcessor) {
        this.processor = processor;
    }
    
    async handlePayment(paymentData: PaymentData): Promise<void> {
        if (!this.processor.validatePayment(paymentData)) {
            console.log('Payment validation failed');
            return;
        }
        
        const result = await this.processor.processPayment(paymentData.amount, paymentData.currency);
        
        if (result.success) {
            console.log(`Payment successful: ${result.transactionId}`);
            const status = this.processor.getTransactionStatus(result.transactionId);
            console.log(`Transaction status: ${status}`);
        } else {
            console.log(`Payment failed: ${result.message}`);
        }
    }
}

// 使用示例
const paymentData: PaymentData = {
    amount: 100.00,
    currency: 'USD',
    cardNumber: '1234567890123456',
    expiryDate: '12/25',
    cvv: '123'
};

// 使用遗留系统（通过适配器）
const legacySystem = new LegacyPaymentSystem();
const legacyAdapter = new LegacyPaymentAdapter(legacySystem);
const legacyPaymentService = new PaymentService(legacyAdapter);

console.log('=== Using Legacy System (via Adapter) ===');
legacyPaymentService.handlePayment(paymentData);

// 使用现代系统
const modernSystem = new ModernPaymentSystem();
const modernPaymentService = new PaymentService(modernSystem);

console.log('\n=== Using Modern System ===');
modernPaymentService.handlePayment(paymentData);
```

### 对象适配器 vs 类适配器

```typescript
// 类适配器（使用继承）
class ClassAdapter extends LegacyPaymentSystem implements PaymentProcessor {
    async processPayment(amount: number, currency: string): Promise<PaymentResult> {
        const cardInfo = {
            number: '1234567890123456',
            expiry: '12/25',
            cvv: '123'
        };
        
        const legacyResult = this.makePayment(amount, currency, cardInfo);
        
        return {
            success: legacyResult.status === 'OK',
            transactionId: legacyResult.reference || '',
            message: legacyResult.description
        };
    }
    
    validatePayment(paymentData: PaymentData): boolean {
        const cardInfo = {
            number: paymentData.cardNumber,
            expiry: paymentData.expiryDate,
            cvv: paymentData.cvv
        };
        
        return this.validateCard(cardInfo);
    }
    
    getTransactionStatus(transactionId: string): TransactionStatus {
        const legacyStatus = this.checkPayment(transactionId);
        
        switch (legacyStatus.status) {
            case 'COMPLETED':
                return TransactionStatus.SUCCESS;
            case 'PENDING':
                return TransactionStatus.PENDING;
            case 'FAILED':
                return TransactionStatus.FAILED;
            default:
                return TransactionStatus.PENDING;
        }
    }
}
```

### Java 实现

```java
// 目标接口
interface MediaPlayer {
    void play(String audioType, String fileName);
}

// 适配者接口
interface AdvancedMediaPlayer {
    void playVlc(String fileName);
    void playMp4(String fileName);
}

// 适配者实现
class VlcPlayer implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        System.out.println("Playing vlc file. Name: " + fileName);
    }
    
    @Override
    public void playMp4(String fileName) {
        // 不支持mp4格式
    }
}

class Mp4Player implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        // 不支持vlc格式
    }
    
    @Override
    public void playMp4(String fileName) {
        System.out.println("Playing mp4 file. Name: " + fileName);
    }
}

// 适配器
class MediaAdapter implements MediaPlayer {
    private AdvancedMediaPlayer advancedMusicPlayer;
    
    public MediaAdapter(String audioType) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedMusicPlayer = new VlcPlayer();
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedMusicPlayer = new Mp4Player();
        }
    }
    
    @Override
    public void play(String audioType, String fileName) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedMusicPlayer.playVlc(fileName);
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedMusicPlayer.playMp4(fileName);
        }
    }
}

// 客户端
class AudioPlayer implements MediaPlayer {
    private MediaAdapter mediaAdapter;
    
    @Override
    public void play(String audioType, String fileName) {
        // 内置支持mp3格式
        if (audioType.equalsIgnoreCase("mp3")) {
            System.out.println("Playing mp3 file. Name: " + fileName);
        }
        // 通过适配器支持其他格式
        else if (audioType.equalsIgnoreCase("vlc") || audioType.equalsIgnoreCase("mp4")) {
            mediaAdapter = new MediaAdapter(audioType);
            mediaAdapter.play(audioType, fileName);
        } else {
            System.out.println("Invalid media. " + audioType + " format not supported");
        }
    }
}

// 使用示例
public class AdapterPatternExample {
    public static void main(String[] args) {
        AudioPlayer audioPlayer = new AudioPlayer();
        
        audioPlayer.play("mp3", "beyond_the_horizon.mp3");
        audioPlayer.play("mp4", "alone.mp4");
        audioPlayer.play("vlc", "far_far_away.vlc");
        audioPlayer.play("avi", "mind_me.avi");
    }
}
```

### Python 实现

```python
from abc import ABC, abstractmethod
from typing import Dict, Any

# 目标接口
class DatabaseConnection(ABC):
    @abstractmethod
    def connect(self) -> bool:
        pass
    
    @abstractmethod
    def execute_query(self, query: str) -> list:
        pass
    
    @abstractmethod
    def close(self) -> None:
        pass

# 适配者 - 遗留数据库系统
class LegacyDatabase:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.connection = None
    
    def open_connection(self, username: str, password: str) -> dict:
        print(f"Legacy DB: Opening connection to {self.host}:{self.port}")
        self.connection = f"legacy_conn_{self.host}_{self.port}"
        return {
            'status': 'connected',
            'connection_id': self.connection,
            'message': 'Connection established'
        }
    
    def run_sql(self, sql_statement: str) -> dict:
        if not self.connection:
            return {'error': 'No connection established'}
        
        print(f"Legacy DB: Executing SQL: {sql_statement}")
        return {
            'result_set': [
                {'id': 1, 'name': 'John'},
                {'id': 2, 'name': 'Jane'}
            ],
            'rows_affected': 2,
            'execution_time': '0.05s'
        }
    
    def close_connection(self) -> dict:
        if self.connection:
            print(f"Legacy DB: Closing connection {self.connection}")
            self.connection = None
            return {'status': 'disconnected'}
        return {'status': 'no_connection'}

# 适配器
class LegacyDatabaseAdapter(DatabaseConnection):
    def __init__(self, legacy_db: LegacyDatabase, username: str, password: str):
        self.legacy_db = legacy_db
        self.username = username
        self.password = password
        self.is_connected = False
    
    def connect(self) -> bool:
        result = self.legacy_db.open_connection(self.username, self.password)
        self.is_connected = result.get('status') == 'connected'
        return self.is_connected
    
    def execute_query(self, query: str) -> list:
        if not self.is_connected:
            raise Exception("Database not connected")
        
        result = self.legacy_db.run_sql(query)
        
        if 'error' in result:
            raise Exception(result['error'])
        
        # 转换遗留系统的返回格式为标准格式
        return result.get('result_set', [])
    
    def close(self) -> None:
        if self.is_connected:
            self.legacy_db.close_connection()
            self.is_connected = False

# 现代数据库系统（作为对比）
class ModernDatabase(DatabaseConnection):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.is_connected = False
    
    def connect(self) -> bool:
        print(f"Modern DB: Connecting with {self.connection_string}")
        self.is_connected = True
        return True
    
    def execute_query(self, query: str) -> list:
        if not self.is_connected:
            raise Exception("Database not connected")
        
        print(f"Modern DB: Executing query: {query}")
        return [
            {'id': 1, 'name': 'Alice'},
            {'id': 2, 'name': 'Bob'}
        ]
    
    def close(self) -> None:
        if self.is_connected:
            print("Modern DB: Connection closed")
            self.is_connected = False

# 数据访问层
class DataAccessLayer:
    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection
    
    def get_users(self) -> list:
        if not self.db.connect():
            raise Exception("Failed to connect to database")
        
        try:
            users = self.db.execute_query("SELECT * FROM users")
            return users
        finally:
            self.db.close()
    
    def get_user_by_id(self, user_id: int) -> dict:
        if not self.db.connect():
            raise Exception("Failed to connect to database")
        
        try:
            users = self.db.execute_query(f"SELECT * FROM users WHERE id = {user_id}")
            return users[0] if users else None
        finally:
            self.db.close()

# 使用示例
if __name__ == "__main__":
    # 使用遗留数据库（通过适配器）
    print("=== Using Legacy Database (via Adapter) ===")
    legacy_db = LegacyDatabase("legacy-server", 1433)
    legacy_adapter = LegacyDatabaseAdapter(legacy_db, "admin", "password")
    legacy_dal = DataAccessLayer(legacy_adapter)
    
    try:
        users = legacy_dal.get_users()
        print(f"Users from legacy DB: {users}")
        
        user = legacy_dal.get_user_by_id(1)
        print(f"User 1 from legacy DB: {user}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n=== Using Modern Database ===")
    # 使用现代数据库
    modern_db = ModernDatabase("postgresql://localhost:5432/mydb")
    modern_dal = DataAccessLayer(modern_db)
    
    try:
        users = modern_dal.get_users()
        print(f"Users from modern DB: {users}")
        
        user = modern_dal.get_user_by_id(1)
        print(f"User 1 from modern DB: {user}")
    except Exception as e:
        print(f"Error: {e}")
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **代码复用**：可以复用现有的功能代码
2. **分离关注点**：将接口转换逻辑与业务逻辑分离
3. **开闭原则**：可以在不修改现有代码的情况下引入新的适配器
4. **单一职责**：每个适配器只负责一种接口转换

### ❌ 缺点
1. **增加复杂性**：引入了额外的抽象层
2. **性能开销**：增加了方法调用的层次
3. **维护成本**：需要维护适配器代码

## 🌟 实际应用案例

### 1. 日志系统适配器

```typescript
// 目标接口 - 统一日志接口
interface Logger {
    info(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    error(message: string, error?: Error, context?: any): void;
    debug(message: string, context?: any): void;
}

// 适配者 - 第三方日志库
class ThirdPartyLogger {
    log(level: string, msg: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${msg}`, meta || '');
    }
    
    logError(msg: string, err: any, meta?: any): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ERROR: ${msg}`, err.message, meta || '');
    }
}

// 另一个适配者 - 控制台日志
class ConsoleLogger {
    writeInfo(text: string): void {
        console.info(`INFO: ${text}`);
    }
    
    writeWarning(text: string): void {
        console.warn(`WARNING: ${text}`);
    }
    
    writeError(text: string, exception?: any): void {
        console.error(`ERROR: ${text}`, exception || '');
    }
    
    writeDebug(text: string): void {
        console.debug(`DEBUG: ${text}`);
    }
}

// 适配器实现
class ThirdPartyLoggerAdapter implements Logger {
    private logger: ThirdPartyLogger;
    
    constructor(logger: ThirdPartyLogger) {
        this.logger = logger;
    }
    
    info(message: string, context?: any): void {
        this.logger.log('info', message, context);
    }
    
    warn(message: string, context?: any): void {
        this.logger.log('warn', message, context);
    }
    
    error(message: string, error?: Error, context?: any): void {
        this.logger.logError(message, error || new Error('Unknown error'), context);
    }
    
    debug(message: string, context?: any): void {
        this.logger.log('debug', message, context);
    }
}

class ConsoleLoggerAdapter implements Logger {
    private logger: ConsoleLogger;
    
    constructor(logger: ConsoleLogger) {
        this.logger = logger;
    }
    
    info(message: string, context?: any): void {
        const msg = context ? `${message} ${JSON.stringify(context)}` : message;
        this.logger.writeInfo(msg);
    }
    
    warn(message: string, context?: any): void {
        const msg = context ? `${message} ${JSON.stringify(context)}` : message;
        this.logger.writeWarning(msg);
    }
    
    error(message: string, error?: Error, context?: any): void {
        const msg = context ? `${message} ${JSON.stringify(context)}` : message;
        this.logger.writeError(msg, error);
    }
    
    debug(message: string, context?: any): void {
        const msg = context ? `${message} ${JSON.stringify(context)}` : message;
        this.logger.writeDebug(msg);
    }
}

// 日志管理器
class LoggerManager {
    private loggers: Logger[] = [];
    
    addLogger(logger: Logger): void {
        this.loggers.push(logger);
    }
    
    info(message: string, context?: any): void {
        this.loggers.forEach(logger => logger.info(message, context));
    }
    
    warn(message: string, context?: any): void {
        this.loggers.forEach(logger => logger.warn(message, context));
    }
    
    error(message: string, error?: Error, context?: any): void {
        this.loggers.forEach(logger => logger.error(message, error, context));
    }
    
    debug(message: string, context?: any): void {
        this.loggers.forEach(logger => logger.debug(message, context));
    }
}

// 使用示例
const loggerManager = new LoggerManager();

// 添加不同的日志适配器
const thirdPartyLogger = new ThirdPartyLoggerAdapter(new ThirdPartyLogger());
const consoleLogger = new ConsoleLoggerAdapter(new ConsoleLogger());

loggerManager.addLogger(thirdPartyLogger);
loggerManager.addLogger(consoleLogger);

// 统一使用
loggerManager.info('Application started', { version: '1.0.0' });
loggerManager.warn('Low memory warning', { available: '100MB' });
loggerManager.error('Database connection failed', new Error('Connection timeout'));
loggerManager.debug('Processing user request', { userId: 123 });
```

### 2. 缓存系统适配器

```typescript
// 目标接口 - 统一缓存接口
interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    exists(key: string): Promise<boolean>;
}

// 适配者 - Redis客户端
class RedisClient {
    async getValue(key: string): Promise<string | null> {
        console.log(`Redis: Getting value for key ${key}`);
        return `redis_value_${key}`;
    }
    
    async setValue(key: string, value: string, expireSeconds?: number): Promise<void> {
        console.log(`Redis: Setting ${key} = ${value} (TTL: ${expireSeconds || 'none'})`);
    }
    
    async removeKey(key: string): Promise<void> {
        console.log(`Redis: Removing key ${key}`);
    }
    
    async flushAll(): Promise<void> {
        console.log('Redis: Flushing all keys');
    }
    
    async keyExists(key: string): Promise<boolean> {
        console.log(`Redis: Checking if key ${key} exists`);
        return true;
    }
}

// 适配者 - 内存缓存
class MemoryCache {
    private cache: Map<string, { value: any; expiry?: number }> = new Map();
    
    retrieve(key: string): any {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        console.log(`Memory: Retrieved value for key ${key}`);
        return item.value;
    }
    
    store(key: string, value: any, ttlMs?: number): void {
        const expiry = ttlMs ? Date.now() + ttlMs : undefined;
        this.cache.set(key, { value, expiry });
        console.log(`Memory: Stored value for key ${key} (TTL: ${ttlMs || 'none'}ms)`);
    }
    
    remove(key: string): void {
        this.cache.delete(key);
        console.log(`Memory: Removed key ${key}`);
    }
    
    clearAll(): void {
        this.cache.clear();
        console.log('Memory: Cleared all keys');
    }
    
    hasKey(key: string): boolean {
        const exists = this.cache.has(key);
        console.log(`Memory: Key ${key} exists: ${exists}`);
        return exists;
    }
}

// 适配器实现
class RedisCacheAdapter implements CacheService {
    private redis: RedisClient;
    
    constructor(redis: RedisClient) {
        this.redis = redis;
    }
    
    async get<T>(key: string): Promise<T | null> {
        const value = await this.redis.getValue(key);
        return value ? JSON.parse(value) : null;
    }
    
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        await this.redis.setValue(key, serialized, ttl);
    }
    
    async delete(key: string): Promise<void> {
        await this.redis.removeKey(key);
    }
    
    async clear(): Promise<void> {
        await this.redis.flushAll();
    }
    
    async exists(key: string): Promise<boolean> {
        return await this.redis.keyExists(key);
    }
}

class MemoryCacheAdapter implements CacheService {
    private memory: MemoryCache;
    
    constructor(memory: MemoryCache) {
        this.memory = memory;
    }
    
    async get<T>(key: string): Promise<T | null> {
        return this.memory.retrieve(key);
    }
    
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const ttlMs = ttl ? ttl * 1000 : undefined;
        this.memory.store(key, value, ttlMs);
    }
    
    async delete(key: string): Promise<void> {
        this.memory.remove(key);
    }
    
    async clear(): Promise<void> {
        this.memory.clearAll();
    }
    
    async exists(key: string): Promise<boolean> {
        return this.memory.hasKey(key);
    }
}

// 多级缓存系统
class MultiLevelCacheService implements CacheService {
    private caches: CacheService[];
    
    constructor(caches: CacheService[]) {
        this.caches = caches;
    }
    
    async get<T>(key: string): Promise<T | null> {
        for (let i = 0; i < this.caches.length; i++) {
            const value = await this.caches[i].get<T>(key);
            if (value !== null) {
                // 回填到更快的缓存层
                for (let j = 0; j < i; j++) {
                    await this.caches[j].set(key, value);
                }
                return value;
            }
        }
        return null;
    }
    
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        // 写入所有缓存层
        await Promise.all(
            this.caches.map(cache => cache.set(key, value, ttl))
        );
    }
    
    async delete(key: string): Promise<void> {
        await Promise.all(
            this.caches.map(cache => cache.delete(key))
        );
    }
    
    async clear(): Promise<void> {
        await Promise.all(
            this.caches.map(cache => cache.clear())
        );
    }
    
    async exists(key: string): Promise<boolean> {
        for (const cache of this.caches) {
            if (await cache.exists(key)) {
                return true;
            }
        }
        return false;
    }
}

// 使用示例
async function demonstrateCacheAdapters() {
    // 创建不同的缓存适配器
    const redisAdapter = new RedisCacheAdapter(new RedisClient());
    const memoryAdapter = new MemoryCacheAdapter(new MemoryCache());
    
    // 创建多级缓存（内存 -> Redis）
    const multiLevelCache = new MultiLevelCacheService([memoryAdapter, redisAdapter]);
    
    // 统一使用缓存接口
    console.log('=== Testing Multi-Level Cache ===');
    
    // 设置缓存
    await multiLevelCache.set('user:123', { id: 123, name: 'John Doe' }, 300);
    
    // 获取缓存
    const user = await multiLevelCache.get('user:123');
    console.log('Retrieved user:', user);
    
    // 检查存在性
    const exists = await multiLevelCache.exists('user:123');
    console.log('User exists:', exists);
    
    // 删除缓存
    await multiLevelCache.delete('user:123');
    
    // 再次检查
    const userAfterDelete = await multiLevelCache.get('user:123');
    console.log('User after delete:', userAfterDelete);
}

demonstrateCacheAdapters();
```

## 🔄 相关模式

### 与其他模式的关系
- **桥接模式**：桥接模式分离抽象和实现，适配器模式改变现有接口
- **装饰器模式**：装饰器模式增强功能，适配器模式转换接口
- **外观模式**：外观模式简化接口，适配器模式转换接口
- **代理模式**：代理模式控制访问，适配器模式转换接口

### 模式组合

```typescript
// 适配器 + 装饰器模式
class CachingAdapter implements CacheService {
    private cache: CacheService;
    private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
    
    constructor(cache: CacheService) {
        this.cache = cache;
    }
    
    async get<T>(key: string): Promise<T | null> {
        const value = await this.cache.get<T>(key);
        if (value !== null) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        return value;
    }
    
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        return this.cache.set(key, value, ttl);
    }
    
    async delete(key: string): Promise<void> {
        return this.cache.delete(key);
    }
    
    async clear(): Promise<void> {
        return this.cache.clear();
    }
    
    async exists(key: string): Promise<boolean> {
        return this.cache.exists(key);
    }
    
    getStats() {
        return { ...this.stats };
    }
}
```

## 🚀 最佳实践

### 1. 适配器工厂

```typescript
interface AdapterFactory<T> {
    createAdapter(config: any): T;
}

class CacheAdapterFactory implements AdapterFactory<CacheService> {
    createAdapter(config: { type: string; options?: any }): CacheService {
        switch (config.type) {
            case 'redis':
                return new RedisCacheAdapter(new RedisClient());
            case 'memory':
                return new MemoryCacheAdapter(new MemoryCache());
            case 'multi-level':
                const caches = config.options.caches.map((cacheConfig: any) => 
                    this.createAdapter(cacheConfig)
                );
                return new MultiLevelCacheService(caches);
            default:
                throw new Error(`Unknown cache type: ${config.type}`);
        }
    }
}
```

### 2. 配置驱动的适配器

```typescript
class ConfigurableAdapter {
    private adapters: Map<string, any> = new Map();
    
    registerAdapter(name: string, adapter: any): void {
        this.adapters.set(name, adapter);
    }
    
    getAdapter(name: string): any {
        const adapter = this.adapters.get(name);
        if (!adapter) {
            throw new Error(`Adapter ${name} not found`);
        }
        return adapter;
    }
    
    static fromConfig(config: any): ConfigurableAdapter {
        const manager = new ConfigurableAdapter();
        
        for (const [name, adapterConfig] of Object.entries(config.adapters)) {
            // 根据配置创建适配器
            const adapter = this.createAdapterFromConfig(adapterConfig);
            manager.registerAdapter(name, adapter);
        }
        
        return manager;
    }
    
    private static createAdapterFromConfig(config: any): any {
        // 根据配置创建适配器的逻辑
        return null;
    }
}
```

## ⚠️ 注意事项

1. **性能影响**：适配器会增加方法调用层次，注意性能影响
2. **错误处理**：适配器应该正确处理和转换错误信息
3. **数据转换**：确保数据格式转换的正确性和完整性
4. **接口一致性**：保持适配后接口的一致性和可预测性
5. **文档说明**：清楚地文档化适配器的转换逻辑

## 📚 总结

适配器模式是一个非常实用的结构型模式，它解决了接口不兼容的问题，使得原本无法协同工作的类能够一起工作。这个模式在系统集成、遗留系统改造等场景中特别有用。

**使用建议**：
- 当需要使用现有的类，但其接口不符合需求时使用
- 当需要创建一个可复用的类，该类可以与其他不相关的类协同工作时使用
- 当需要使用一些现有的子类，但不可能对每一个都进行子类化以匹配它们的接口时使用
- 优先使用对象适配器而不是类适配器
- 保持适配器的简单性，避免在适配器中加入过多业务逻辑

---

**相关链接**：
- [桥接模式](./bridge.md)
- [装饰器模式](./decorator.md)
- [外观模式](./facade.md) 