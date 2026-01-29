# 代理模式 (Proxy Pattern)

> [!NOTE]
> 代理模式为其他对象提供一种代理以控制对这个对象的访问，在访问对象时引入一定程度的间接性。

## 📖 模式定义

**代理模式**是一种结构型设计模式，它为另一个对象提供一个替身或占位符以控制对它的访问。代理模式在不改变原始类接口的条件下，为原始类定义一个代理类，主要目的是控制访问，而非加强功能。

### 核心要素
- **主题接口**：定义代理和真实主题的公共接口
- **真实主题**：定义代理所代表的真实对象
- **代理**：保存一个引用使得代理可以访问实体，控制对真实主题的访问
- **客户端**：通过代理接口与真实主题交互

## 🎯 使用场景

### 适用情况
- **远程代理**：为一个对象在不同的地址空间提供局部代表
- **虚拟代理**：根据需要创建开销很大的对象
- **保护代理**：控制对原始对象的访问权限
- **智能引用**：在访问对象时执行一些附加操作

## 💡 实现方式

### TypeScript 实现

```typescript
// 主题接口
interface Image {
    display(): void;
    getSize(): number;
}

// 真实主题 - 真实图片
class RealImage implements Image {
    private filename: string;
    private size: number;
    
    constructor(filename: string) {
        this.filename = filename;
        this.size = Math.floor(Math.random() * 1000) + 100; // 模拟文件大小
        this.loadFromDisk();
    }
    
    private loadFromDisk(): void {
        console.log(`Loading image from disk: ${this.filename}`);
        // 模拟加载时间
        const loadTime = Math.random() * 1000 + 500;
        console.log(`Image loaded in ${loadTime.toFixed(0)}ms`);
    }
    
    display(): void {
        console.log(`Displaying image: ${this.filename}`);
    }
    
    getSize(): number {
        return this.size;
    }
}

// 代理 - 图片代理
class ImageProxy implements Image {
    private realImage: RealImage | null = null;
    private filename: string;
    
    constructor(filename: string) {
        this.filename = filename;
    }
    
    display(): void {
        if (this.realImage === null) {
            console.log('Creating real image...');
            this.realImage = new RealImage(this.filename);
        }
        this.realImage.display();
    }
    
    getSize(): number {
        // 可以返回缓存的大小信息，而不需要加载真实图片
        if (this.realImage === null) {
            console.log('Getting size from metadata...');
            return 0; // 从元数据获取
        }
        return this.realImage.getSize();
    }
}

// 使用示例
console.log('=== Image Proxy Demo ===');

const image1: Image = new ImageProxy('photo1.jpg');
const image2: Image = new ImageProxy('photo2.jpg');

console.log('\n--- First display ---');
image1.display(); // 这时才会加载真实图片

console.log('\n--- Second display ---');
image1.display(); // 直接使用已加载的图片

console.log('\n--- Getting size ---');
console.log(`Size: ${image2.getSize()}`); // 不会加载图片
```

### 访问控制代理

```typescript
// 银行账户接口
interface BankAccount {
    deposit(amount: number): void;
    withdraw(amount: number): boolean;
    getBalance(): number;
    getAccountInfo(): string;
}

// 真实银行账户
class RealBankAccount implements BankAccount {
    private balance: number = 0;
    private accountNumber: string;
    private ownerName: string;
    
    constructor(accountNumber: string, ownerName: string, initialBalance: number = 0) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = initialBalance;
    }
    
    deposit(amount: number): void {
        if (amount > 0) {
            this.balance += amount;
            console.log(`Deposited $${amount}. New balance: $${this.balance}`);
        }
    }
    
    withdraw(amount: number): boolean {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            console.log(`Withdrew $${amount}. New balance: $${this.balance}`);
            return true;
        }
        console.log(`Withdrawal failed. Insufficient funds or invalid amount.`);
        return false;
    }
    
    getBalance(): number {
        return this.balance;
    }
    
    getAccountInfo(): string {
        return `Account: ${this.accountNumber}, Owner: ${this.ownerName}, Balance: $${this.balance}`;
    }
}

// 用户类
class User {
    constructor(
        public name: string,
        public role: 'owner' | 'authorized' | 'guest' = 'guest'
    ) {}
}

// 银行账户代理 - 访问控制
class BankAccountProxy implements BankAccount {
    private realAccount: RealBankAccount;
    private currentUser: User;
    
    constructor(realAccount: RealBankAccount, currentUser: User) {
        this.realAccount = realAccount;
        this.currentUser = currentUser;
    }
    
    private checkPermission(operation: string): boolean {
        console.log(`Checking permission for ${this.currentUser.name} (${this.currentUser.role}) to ${operation}`);
        
        switch (operation) {
            case 'deposit':
            case 'withdraw':
                return this.currentUser.role === 'owner' || this.currentUser.role === 'authorized';
            case 'getBalance':
                return this.currentUser.role !== 'guest';
            case 'getAccountInfo':
                return this.currentUser.role === 'owner';
            default:
                return false;
        }
    }
    
    deposit(amount: number): void {
        if (this.checkPermission('deposit')) {
            this.realAccount.deposit(amount);
        } else {
            console.log('❌ Access denied: Insufficient permissions to deposit');
        }
    }
    
    withdraw(amount: number): boolean {
        if (this.checkPermission('withdraw')) {
            return this.realAccount.withdraw(amount);
        } else {
            console.log('❌ Access denied: Insufficient permissions to withdraw');
            return false;
        }
    }
    
    getBalance(): number {
        if (this.checkPermission('getBalance')) {
            return this.realAccount.getBalance();
        } else {
            console.log('❌ Access denied: Insufficient permissions to view balance');
            return -1;
        }
    }
    
    getAccountInfo(): string {
        if (this.checkPermission('getAccountInfo')) {
            return this.realAccount.getAccountInfo();
        } else {
            console.log('❌ Access denied: Insufficient permissions to view account info');
            return 'Access Denied';
        }
    }
}

// 使用示例
console.log('\n=== Bank Account Proxy Demo ===');

const realAccount = new RealBankAccount('12345', 'John Doe', 1000);

// 不同角色的用户
const owner = new User('John Doe', 'owner');
const authorized = new User('Jane Smith', 'authorized');
const guest = new User('Bob Wilson', 'guest');

console.log('\n--- Owner Access ---');
const ownerProxy = new BankAccountProxy(realAccount, owner);
ownerProxy.deposit(200);
ownerProxy.withdraw(100);
console.log(`Balance: $${ownerProxy.getBalance()}`);
console.log(ownerProxy.getAccountInfo());

console.log('\n--- Authorized User Access ---');
const authorizedProxy = new BankAccountProxy(realAccount, authorized);
authorizedProxy.deposit(50);
console.log(`Balance: $${authorizedProxy.getBalance()}`);
authorizedProxy.getAccountInfo(); // 应该被拒绝

console.log('\n--- Guest Access ---');
const guestProxy = new BankAccountProxy(realAccount, guest);
guestProxy.deposit(100); // 应该被拒绝
guestProxy.getBalance(); // 应该被拒绝
```

### 缓存代理

```typescript
// 数据服务接口
interface DataService {
    getData(key: string): Promise<any>;
    setData(key: string, value: any): Promise<void>;
}

// 真实数据服务
class RealDataService implements DataService {
    private database: Map<string, any> = new Map();
    
    async getData(key: string): Promise<any> {
        console.log(`Fetching data from database for key: ${key}`);
        // 模拟数据库查询延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = this.database.get(key);
        console.log(`Database query completed for key: ${key}`);
        return data || null;
    }
    
    async setData(key: string, value: any): Promise<void> {
        console.log(`Saving data to database for key: ${key}`);
        // 模拟数据库写入延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.database.set(key, value);
        console.log(`Data saved to database for key: ${key}`);
    }
}

// 缓存代理
class CachedDataServiceProxy implements DataService {
    private realService: RealDataService;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheTimeout: number = 5000; // 5秒缓存过期
    
    constructor(realService: RealDataService) {
        this.realService = realService;
    }
    
    async getData(key: string): Promise<any> {
        const cached = this.cache.get(key);
        const now = Date.now();
        
        // 检查缓存是否存在且未过期
        if (cached && (now - cached.timestamp) < this.cacheTimeout) {
            console.log(`Cache hit for key: ${key}`);
            return cached.data;
        }
        
        console.log(`Cache miss for key: ${key}`);
        const data = await this.realService.getData(key);
        
        // 缓存数据
        this.cache.set(key, { data, timestamp: now });
        return data;
    }
    
    async setData(key: string, value: any): Promise<void> {
        await this.realService.setData(key, value);
        
        // 更新缓存
        this.cache.set(key, { data: value, timestamp: Date.now() });
        console.log(`Cache updated for key: ${key}`);
    }
    
    clearCache(): void {
        this.cache.clear();
        console.log('Cache cleared');
    }
    
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 使用示例
async function demonstrateCacheProxy() {
    console.log('\n=== Cache Proxy Demo ===');
    
    const realService = new RealDataService();
    const cachedService = new CachedDataServiceProxy(realService);
    
    // 设置一些数据
    await cachedService.setData('user:1', { name: 'John', age: 30 });
    await cachedService.setData('user:2', { name: 'Jane', age: 25 });
    
    console.log('\n--- First access (cache miss) ---');
    const user1 = await cachedService.getData('user:1');
    console.log('Retrieved:', user1);
    
    console.log('\n--- Second access (cache hit) ---');
    const user1Again = await cachedService.getData('user:1');
    console.log('Retrieved:', user1Again);
    
    console.log('\n--- Cache stats ---');
    console.log(cachedService.getCacheStats());
    
    console.log('\n--- Waiting for cache to expire ---');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    console.log('\n--- Access after cache expiry ---');
    const user1Expired = await cachedService.getData('user:1');
    console.log('Retrieved:', user1Expired);
}

// demonstrateCacheProxy();
```

### 智能引用代理

```typescript
// 文件接口
interface FileSystem {
    readFile(filename: string): string;
    writeFile(filename: string, content: string): void;
    deleteFile(filename: string): void;
}

// 真实文件系统
class RealFileSystem implements FileSystem {
    private files: Map<string, string> = new Map();
    
    readFile(filename: string): string {
        console.log(`Reading file: ${filename}`);
        return this.files.get(filename) || '';
    }
    
    writeFile(filename: string, content: string): void {
        console.log(`Writing file: ${filename}`);
        this.files.set(filename, content);
    }
    
    deleteFile(filename: string): void {
        console.log(`Deleting file: ${filename}`);
        this.files.delete(filename);
    }
}

// 智能引用代理
class SmartFileSystemProxy implements FileSystem {
    private realFileSystem: RealFileSystem;
    private accessLog: { operation: string; filename: string; timestamp: Date }[] = [];
    private referenceCount: Map<string, number> = new Map();
    
    constructor(realFileSystem: RealFileSystem) {
        this.realFileSystem = realFileSystem;
    }
    
    private logAccess(operation: string, filename: string): void {
        this.accessLog.push({
            operation,
            filename,
            timestamp: new Date()
        });
        console.log(`[LOG] ${operation} operation on ${filename} at ${new Date().toISOString()}`);
    }
    
    private incrementReference(filename: string): void {
        const count = this.referenceCount.get(filename) || 0;
        this.referenceCount.set(filename, count + 1);
    }
    
    private decrementReference(filename: string): void {
        const count = this.referenceCount.get(filename) || 0;
        if (count > 0) {
            this.referenceCount.set(filename, count - 1);
        }
    }
    
    readFile(filename: string): string {
        this.logAccess('READ', filename);
        this.incrementReference(filename);
        
        const content = this.realFileSystem.readFile(filename);
        
        if (!content) {
            console.log(`⚠️ Warning: File ${filename} not found`);
        }
        
        return content;
    }
    
    writeFile(filename: string, content: string): void {
        this.logAccess('WRITE', filename);
        
        // 检查内容是否为空
        if (!content.trim()) {
            console.log(`⚠️ Warning: Writing empty content to ${filename}`);
        }
        
        this.realFileSystem.writeFile(filename, content);
        this.incrementReference(filename);
    }
    
    deleteFile(filename: string): void {
        const refCount = this.referenceCount.get(filename) || 0;
        
        if (refCount > 0) {
            console.log(`⚠️ Warning: File ${filename} has ${refCount} active references`);
            console.log('Are you sure you want to delete it? (Proceeding anyway for demo)');
        }
        
        this.logAccess('DELETE', filename);
        this.realFileSystem.deleteFile(filename);
        this.referenceCount.delete(filename);
    }
    
    getAccessLog(): { operation: string; filename: string; timestamp: Date }[] {
        return [...this.accessLog];
    }
    
    getReferenceCount(filename: string): number {
        return this.referenceCount.get(filename) || 0;
    }
    
    getStats(): void {
        console.log('\n=== File System Stats ===');
        console.log(`Total operations: ${this.accessLog.length}`);
        console.log('Reference counts:');
        this.referenceCount.forEach((count, filename) => {
            console.log(`  ${filename}: ${count} references`);
        });
        
        console.log('\nRecent operations:');
        this.accessLog.slice(-5).forEach(log => {
            console.log(`  ${log.timestamp.toISOString()}: ${log.operation} ${log.filename}`);
        });
    }
}

// 使用示例
console.log('\n=== Smart File System Proxy Demo ===');

const realFS = new RealFileSystem();
const smartFS = new SmartFileSystemProxy(realFS);

// 文件操作
smartFS.writeFile('document.txt', 'Hello World');
smartFS.writeFile('config.json', '{"theme": "dark"}');

smartFS.readFile('document.txt');
smartFS.readFile('document.txt'); // 再次读取
smartFS.readFile('nonexistent.txt'); // 读取不存在的文件

smartFS.writeFile('empty.txt', '   '); // 写入空内容

smartFS.deleteFile('document.txt'); // 删除有引用的文件

smartFS.getStats();
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **控制访问**：可以控制对真实对象的访问
2. **延迟加载**：可以延迟创建开销大的对象
3. **附加功能**：可以在访问时添加额外的功能
4. **透明性**：客户端无需知道代理的存在

### ❌ 缺点
1. **复杂性**：增加了系统的复杂性
2. **性能开销**：可能会增加访问的延迟
3. **间接性**：增加了一层间接访问

## 🔄 相关模式

- **装饰器模式**：装饰器增强功能，代理控制访问
- **适配器模式**：适配器改变接口，代理保持接口不变
- **外观模式**：外观简化接口，代理控制访问

## 🚀 最佳实践

1. **接口一致性**：代理应该与真实对象有相同的接口
2. **透明性**：客户端应该无法区分代理和真实对象
3. **职责单一**：每个代理应该有明确的职责
4. **性能考虑**：避免代理成为性能瓶颈

## ⚠️ 注意事项

1. **循环引用**：避免代理和真实对象之间的循环引用
2. **线程安全**：在多线程环境中确保代理的线程安全
3. **内存泄漏**：注意代理持有的引用可能导致内存泄漏
4. **过度使用**：不要为了使用模式而使用模式

## 📚 总结

代理模式为对象访问提供了一种控制机制，可以在不改变原始类接口的情况下，为原始类定义一个代理类来控制访问。它在需要控制访问、延迟加载、缓存等场景中非常有用。

**使用建议**：
- 当需要控制对对象的访问时使用
- 当需要延迟创建开销大的对象时使用
- 当需要在访问对象时添加额外功能时使用
- 当需要为远程对象提供本地代表时使用

---

**相关链接**：
- [装饰器模式](./decorator.md)
- [适配器模式](./adapter.md)
- [外观模式](./facade.md) 