# 装饰器模式 (Decorator Pattern)

> [!NOTE]
> 装饰器模式动态地给对象添加一些额外的职责，就增加功能来说，装饰器模式相比生成子类更为灵活。

## 📖 模式定义

**装饰器模式**是一种结构型设计模式，允许向一个现有的对象添加新的功能，同时又不改变其结构。这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。

### 核心要素
- **组件接口**：定义一个对象接口，可以给这些对象动态地添加职责
- **具体组件**：定义一个对象，可以给这个对象添加一些职责
- **装饰器**：维持一个指向组件对象的引用，并定义一个与组件接口一致的接口
- **具体装饰器**：向组件添加职责

## 🎯 使用场景

### 适用情况
- **动态添加功能**：需要在不改变现有对象结构的情况下，动态地给对象添加功能
- **避免子类爆炸**：通过继承扩展功能会导致子类数量急剧增加
- **功能组合**：需要组合多种功能
- **运行时决定**：需要在运行时决定给对象添加哪些功能

## 💡 实现方式

### TypeScript 实现

```typescript
// 组件接口
interface Coffee {
    cost(): number;
    description(): string;
}

// 具体组件 - 基础咖啡
class SimpleCoffee implements Coffee {
    cost(): number {
        return 10;
    }
    
    description(): string {
        return 'Simple Coffee';
    }
}

// 装饰器基类
abstract class CoffeeDecorator implements Coffee {
    constructor(protected coffee: Coffee) {}
    
    cost(): number {
        return this.coffee.cost();
    }
    
    description(): string {
        return this.coffee.description();
    }
}

// 具体装饰器 - 牛奶
class MilkDecorator extends CoffeeDecorator {
    cost(): number {
        return this.coffee.cost() + 2;
    }
    
    description(): string {
        return this.coffee.description() + ', Milk';
    }
}

// 具体装饰器 - 糖
class SugarDecorator extends CoffeeDecorator {
    cost(): number {
        return this.coffee.cost() + 1;
    }
    
    description(): string {
        return this.coffee.description() + ', Sugar';
    }
}

// 具体装饰器 - 香草
class VanillaDecorator extends CoffeeDecorator {
    cost(): number {
        return this.coffee.cost() + 3;
    }
    
    description(): string {
        return this.coffee.description() + ', Vanilla';
    }
}

// 使用示例
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.description()} - $${coffee.cost()}`);

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);

coffee = new VanillaDecorator(coffee);
console.log(`${coffee.description()} - $${coffee.cost()}`);
```

### 文本处理装饰器

```typescript
// 文本处理接口
interface TextProcessor {
    process(text: string): string;
}

// 基础文本处理器
class PlainTextProcessor implements TextProcessor {
    process(text: string): string {
        return text;
    }
}

// 装饰器基类
abstract class TextDecorator implements TextProcessor {
    constructor(protected processor: TextProcessor) {}
    
    process(text: string): string {
        return this.processor.process(text);
    }
}

// 大写装饰器
class UpperCaseDecorator extends TextDecorator {
    process(text: string): string {
        return super.process(text).toUpperCase();
    }
}

// 加粗装饰器
class BoldDecorator extends TextDecorator {
    process(text: string): string {
        return `**${super.process(text)}**`;
    }
}

// 斜体装饰器
class ItalicDecorator extends TextDecorator {
    process(text: string): string {
        return `*${super.process(text)}*`;
    }
}

// 下划线装饰器
class UnderlineDecorator extends TextDecorator {
    process(text: string): string {
        return `_${super.process(text)}_`;
    }
}

// 使用示例
let processor: TextProcessor = new PlainTextProcessor();
let text = 'Hello World';

console.log('Original:', processor.process(text));

processor = new UpperCaseDecorator(processor);
console.log('Upper:', processor.process(text));

processor = new BoldDecorator(processor);
console.log('Bold:', processor.process(text));

processor = new ItalicDecorator(processor);
console.log('Italic:', processor.process(text));
```

### 数据源装饰器

```typescript
// 数据源接口
interface DataSource {
    writeData(data: string): void;
    readData(): string;
}

// 文件数据源
class FileDataSource implements DataSource {
    private data: string = '';
    
    constructor(private filename: string) {}
    
    writeData(data: string): void {
        console.log(`Writing to file ${this.filename}: ${data}`);
        this.data = data;
    }
    
    readData(): string {
        console.log(`Reading from file ${this.filename}`);
        return this.data;
    }
}

// 数据源装饰器基类
abstract class DataSourceDecorator implements DataSource {
    constructor(protected source: DataSource) {}
    
    writeData(data: string): void {
        this.source.writeData(data);
    }
    
    readData(): string {
        return this.source.readData();
    }
}

// 加密装饰器
class EncryptionDecorator extends DataSourceDecorator {
    writeData(data: string): void {
        const encrypted = this.encrypt(data);
        console.log('Encrypting data...');
        super.writeData(encrypted);
    }
    
    readData(): string {
        const data = super.readData();
        console.log('Decrypting data...');
        return this.decrypt(data);
    }
    
    private encrypt(data: string): string {
        return btoa(data); // 简单的Base64编码
    }
    
    private decrypt(data: string): string {
        return atob(data); // 简单的Base64解码
    }
}

// 压缩装饰器
class CompressionDecorator extends DataSourceDecorator {
    writeData(data: string): void {
        const compressed = this.compress(data);
        console.log('Compressing data...');
        super.writeData(compressed);
    }
    
    readData(): string {
        const data = super.readData();
        console.log('Decompressing data...');
        return this.decompress(data);
    }
    
    private compress(data: string): string {
        return `COMPRESSED(${data})`;
    }
    
    private decompress(data: string): string {
        return data.replace(/^COMPRESSED\((.+)\)$/, '$1');
    }
}

// 使用示例
let dataSource: DataSource = new FileDataSource('data.txt');

// 添加加密功能
dataSource = new EncryptionDecorator(dataSource);

// 添加压缩功能
dataSource = new CompressionDecorator(dataSource);

console.log('\n=== Writing Data ===');
dataSource.writeData('Hello, World!');

console.log('\n=== Reading Data ===');
const result = dataSource.readData();
console.log('Final result:', result);
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **灵活性**：比继承更灵活，可以动态添加或删除功能
2. **组合性**：可以组合多个装饰器
3. **单一职责**：每个装饰器只负责一个功能
4. **开闭原则**：对扩展开放，对修改关闭

### ❌ 缺点
1. **复杂性**：会产生很多小对象，增加系统复杂性
2. **调试困难**：多层装饰器嵌套时难以调试
3. **性能开销**：多层装饰器会带来性能开销

## 🌟 实际应用案例

### HTTP请求装饰器

```typescript
interface HttpClient {
    request(url: string, options?: any): Promise<any>;
}

class BasicHttpClient implements HttpClient {
    async request(url: string, options: any = {}): Promise<any> {
        console.log(`Making request to: ${url}`);
        return { data: 'response data', status: 200 };
    }
}

abstract class HttpDecorator implements HttpClient {
    constructor(protected client: HttpClient) {}
    
    async request(url: string, options: any = {}): Promise<any> {
        return this.client.request(url, options);
    }
}

class LoggingDecorator extends HttpDecorator {
    async request(url: string, options: any = {}): Promise<any> {
        console.log(`[LOG] Request: ${url}`, options);
        const start = Date.now();
        
        try {
            const result = await super.request(url, options);
            console.log(`[LOG] Response: ${Date.now() - start}ms`, result);
            return result;
        } catch (error) {
            console.log(`[LOG] Error: ${Date.now() - start}ms`, error);
            throw error;
        }
    }
}

class RetryDecorator extends HttpDecorator {
    constructor(client: HttpClient, private maxRetries: number = 3) {
        super(client);
    }
    
    async request(url: string, options: any = {}): Promise<any> {
        let lastError: any;
        
        for (let i = 0; i <= this.maxRetries; i++) {
            try {
                if (i > 0) {
                    console.log(`[RETRY] Attempt ${i + 1}/${this.maxRetries + 1}`);
                }
                return await super.request(url, options);
            } catch (error) {
                lastError = error;
                if (i < this.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * i));
                }
            }
        }
        
        throw lastError;
    }
}

class CacheDecorator extends HttpDecorator {
    private cache = new Map<string, any>();
    
    async request(url: string, options: any = {}): Promise<any> {
        const cacheKey = `${url}:${JSON.stringify(options)}`;
        
        if (this.cache.has(cacheKey)) {
            console.log('[CACHE] Cache hit');
            return this.cache.get(cacheKey);
        }
        
        console.log('[CACHE] Cache miss');
        const result = await super.request(url, options);
        this.cache.set(cacheKey, result);
        return result;
    }
}

// 使用示例
let client: HttpClient = new BasicHttpClient();
client = new LoggingDecorator(client);
client = new RetryDecorator(client, 2);
client = new CacheDecorator(client);

console.log('\n=== HTTP Client Demo ===');
client.request('/api/users');
```

## 🔄 相关模式

- **适配器模式**：适配器改变接口，装饰器增强功能
- **组合模式**：都使用递归组合，但目的不同
- **策略模式**：策略改变算法，装饰器增加功能
- **代理模式**：代理控制访问，装饰器增强功能

## 🚀 最佳实践

1. **保持接口一致**：装饰器应该与被装饰对象有相同的接口
2. **单一职责**：每个装饰器只负责一个功能
3. **组合顺序**：注意装饰器的组合顺序，不同顺序可能产生不同结果
4. **性能考虑**：避免过度装饰，注意性能开销

## ⚠️ 注意事项

1. **装饰顺序**：装饰器的应用顺序很重要
2. **接口兼容**：确保装饰器与原对象接口兼容
3. **内存管理**：注意装饰器链的内存占用
4. **调试复杂性**：多层装饰器会增加调试难度

## 📚 总结

装饰器模式提供了一种灵活的方式来扩展对象功能，避免了继承带来的类爆炸问题。它特别适用于需要动态添加功能的场景。

**使用建议**：
- 当需要在不改变现有对象结构的情况下扩展功能时使用
- 当通过继承扩展功能不现实时使用
- 当需要动态组合多种功能时使用

---

**相关链接**：
- [适配器模式](./adapter.md)
- [组合模式](./composite.md)
- [代理模式](./proxy.md) 