# 责任链模式 (Chain of Responsibility Pattern)

> [!NOTE]
> 责任链模式为请求创建了一个接收者对象的链，避免请求发送者与接收者耦合在一起，让多个对象都有可能接收请求。

## 📖 模式定义

**责任链模式**是一种行为设计模式，它允许你将请求沿着处理者链进行发送。收到请求后，每个处理者均可对请求进行处理，或将其传递给链上的下个处理者。

### 核心要素
- **处理者接口**：定义处理请求的接口，通常包含设置下一个处理者的方法
- **具体处理者**：实现处理者接口，处理它所负责的请求
- **客户端**：创建处理者链，并向链的第一个处理者发送请求

## 🎯 使用场景

### 适用情况
- **多个对象可以处理请求**：有多个对象可以处理同一个请求
- **动态指定处理者**：不想在代码中明确指定处理者
- **处理者集合动态变化**：处理者的集合应该被动态指定
- **解耦发送者和接收者**：想让多个对象都有机会处理请求

## 💡 实现方式

### TypeScript 实现

```typescript
// 请求类
class Request {
    constructor(
        public type: string,
        public content: string,
        public priority: number
    ) {}
}

// 处理者抽象类
abstract class Handler {
    protected nextHandler: Handler | null = null;
    
    setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler; // 返回handler以支持链式调用
    }
    
    handle(request: Request): string | null {
        if (this.canHandle(request)) {
            return this.doHandle(request);
        } else if (this.nextHandler) {
            console.log(`${this.constructor.name} cannot handle, passing to next handler`);
            return this.nextHandler.handle(request);
        } else {
            console.log('No handler can process this request');
            return null;
        }
    }
    
    protected abstract canHandle(request: Request): boolean;
    protected abstract doHandle(request: Request): string;
}

// 具体处理者 - 技术支持
class TechnicalSupportHandler extends Handler {
    protected canHandle(request: Request): boolean {
        return request.type === 'technical' && request.priority <= 3;
    }
    
    protected doHandle(request: Request): string {
        console.log(`TechnicalSupport handling: ${request.content}`);
        return `Technical issue resolved: ${request.content}`;
    }
}

// 具体处理者 - 账单支持
class BillingSupportHandler extends Handler {
    protected canHandle(request: Request): boolean {
        return request.type === 'billing' && request.priority <= 5;
    }
    
    protected doHandle(request: Request): string {
        console.log(`BillingSupport handling: ${request.content}`);
        return `Billing issue resolved: ${request.content}`;
    }
}

// 具体处理者 - 高级支持
class SeniorSupportHandler extends Handler {
    protected canHandle(request: Request): boolean {
        return request.priority <= 8;
    }
    
    protected doHandle(request: Request): string {
        console.log(`SeniorSupport handling: ${request.content}`);
        return `Senior support resolved: ${request.content}`;
    }
}

// 具体处理者 - 管理层
class ManagementHandler extends Handler {
    protected canHandle(request: Request): boolean {
        return true; // 管理层可以处理任何请求
    }
    
    protected doHandle(request: Request): string {
        console.log(`Management handling: ${request.content}`);
        return `Management resolved: ${request.content}`;
    }
}

// 使用示例
console.log('=== Chain of Responsibility Demo ===');

// 创建处理者
const technical = new TechnicalSupportHandler();
const billing = new BillingSupportHandler();
const senior = new SeniorSupportHandler();
const management = new ManagementHandler();

// 构建责任链
technical.setNext(billing).setNext(senior).setNext(management);

// 创建不同类型的请求
const requests = [
    new Request('technical', 'Cannot connect to server', 2),
    new Request('billing', 'Wrong charge on account', 4),
    new Request('technical', 'System crash', 9),
    new Request('general', 'Complaint about service', 6),
    new Request('unknown', 'Strange request', 10)
];

// 处理请求
requests.forEach((request, index) => {
    console.log(`\n--- Request ${index + 1}: ${request.type} (priority: ${request.priority}) ---`);
    const result = technical.handle(request);
    console.log(`Result: ${result || 'Not handled'}`);
});
```

### 日志处理责任链

```typescript
// 日志级别枚举
enum LogLevel {
    DEBUG = 1,
    INFO = 2,
    WARNING = 3,
    ERROR = 4,
    CRITICAL = 5
}

// 日志消息类
class LogMessage {
    constructor(
        public level: LogLevel,
        public message: string,
        public timestamp: Date = new Date()
    ) {}
}

// 抽象日志处理者
abstract class LogHandler {
    protected nextHandler: LogHandler | null = null;
    
    setNext(handler: LogHandler): LogHandler {
        this.nextHandler = handler;
        return handler;
    }
    
    handle(logMessage: LogMessage): void {
        if (this.canHandle(logMessage)) {
            this.doHandle(logMessage);
        }
        
        // 继续传递给下一个处理者（与前面的例子不同，这里总是传递）
        if (this.nextHandler) {
            this.nextHandler.handle(logMessage);
        }
    }
    
    protected abstract canHandle(logMessage: LogMessage): boolean;
    protected abstract doHandle(logMessage: LogMessage): void;
}

// 控制台日志处理者
class ConsoleLogHandler extends LogHandler {
    protected canHandle(logMessage: LogMessage): boolean {
        return logMessage.level >= LogLevel.INFO;
    }
    
    protected doHandle(logMessage: LogMessage): void {
        const levelName = LogLevel[logMessage.level];
        console.log(`[CONSOLE] ${logMessage.timestamp.toISOString()} [${levelName}] ${logMessage.message}`);
    }
}

// 文件日志处理者
class FileLogHandler extends LogHandler {
    private logFile: string[] = [];
    
    protected canHandle(logMessage: LogMessage): boolean {
        return logMessage.level >= LogLevel.WARNING;
    }
    
    protected doHandle(logMessage: LogMessage): void {
        const levelName = LogLevel[logMessage.level];
        const logEntry = `${logMessage.timestamp.toISOString()} [${levelName}] ${logMessage.message}`;
        this.logFile.push(logEntry);
        console.log(`[FILE] Logged to file: ${logEntry}`);
    }
    
    getLogFile(): string[] {
        return [...this.logFile];
    }
}

// 邮件日志处理者
class EmailLogHandler extends LogHandler {
    private emailQueue: string[] = [];
    
    protected canHandle(logMessage: LogMessage): boolean {
        return logMessage.level >= LogLevel.ERROR;
    }
    
    protected doHandle(logMessage: LogMessage): void {
        const levelName = LogLevel[logMessage.level];
        const emailContent = `ALERT: ${levelName} - ${logMessage.message} at ${logMessage.timestamp.toISOString()}`;
        this.emailQueue.push(emailContent);
        console.log(`[EMAIL] Queued email: ${emailContent}`);
    }
    
    getEmailQueue(): string[] {
        return [...this.emailQueue];
    }
}

// 数据库日志处理者
class DatabaseLogHandler extends LogHandler {
    private database: LogMessage[] = [];
    
    protected canHandle(logMessage: LogMessage): boolean {
        return true; // 所有日志都存储到数据库
    }
    
    protected doHandle(logMessage: LogMessage): void {
        this.database.push(logMessage);
        console.log(`[DATABASE] Stored log: ${LogLevel[logMessage.level]} - ${logMessage.message}`);
    }
    
    getDatabase(): LogMessage[] {
        return [...this.database];
    }
}

// 日志系统
class Logger {
    private handlerChain: LogHandler;
    
    constructor() {
        // 构建处理链
        const console = new ConsoleLogHandler();
        const file = new FileLogHandler();
        const email = new EmailLogHandler();
        const database = new DatabaseLogHandler();
        
        this.handlerChain = console;
        console.setNext(file).setNext(email).setNext(database);
    }
    
    debug(message: string): void {
        this.handlerChain.handle(new LogMessage(LogLevel.DEBUG, message));
    }
    
    info(message: string): void {
        this.handlerChain.handle(new LogMessage(LogLevel.INFO, message));
    }
    
    warning(message: string): void {
        this.handlerChain.handle(new LogMessage(LogLevel.WARNING, message));
    }
    
    error(message: string): void {
        this.handlerChain.handle(new LogMessage(LogLevel.ERROR, message));
    }
    
    critical(message: string): void {
        this.handlerChain.handle(new LogMessage(LogLevel.CRITICAL, message));
    }
}

// 使用示例
console.log('\n=== Logging Chain Demo ===');

const logger = new Logger();

logger.debug('Debug message - should only go to database');
logger.info('Info message - console and database');
logger.warning('Warning message - console, file, and database');
logger.error('Error message - all handlers');
logger.critical('Critical error - all handlers with high priority');
```

### HTTP中间件责任链

```typescript
// HTTP请求和响应接口
interface HttpRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
    user?: any;
}

interface HttpResponse {
    statusCode: number;
    headers: Record<string, string>;
    body?: any;
}

// 中间件接口
interface Middleware {
    handle(request: HttpRequest, response: HttpResponse, next: () => void): void;
}

// 抽象中间件处理者
abstract class MiddlewareHandler implements Middleware {
    protected nextHandler: MiddlewareHandler | null = null;
    
    setNext(handler: MiddlewareHandler): MiddlewareHandler {
        this.nextHandler = handler;
        return handler;
    }
    
    handle(request: HttpRequest, response: HttpResponse, next: () => void): void {
        this.process(request, response, () => {
            if (this.nextHandler) {
                this.nextHandler.handle(request, response, next);
            } else {
                next();
            }
        });
    }
    
    protected abstract process(request: HttpRequest, response: HttpResponse, next: () => void): void;
}

// 认证中间件
class AuthenticationMiddleware extends MiddlewareHandler {
    protected process(request: HttpRequest, response: HttpResponse, next: () => void): void {
        console.log('🔐 Authentication middleware');
        
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            console.log('❌ No authorization header');
            response.statusCode = 401;
            response.body = { error: 'Unauthorized' };
            return;
        }
        
        // 模拟token验证
        if (authHeader === 'Bearer valid-token') {
            console.log('✅ Authentication successful');
            request.user = { id: 1, name: 'John Doe' };
            next();
        } else {
            console.log('❌ Invalid token');
            response.statusCode = 401;
            response.body = { error: 'Invalid token' };
        }
    }
}

// 授权中间件
class AuthorizationMiddleware extends MiddlewareHandler {
    protected process(request: HttpRequest, response: HttpResponse, next: () => void): void {
        console.log('🛡️ Authorization middleware');
        
        if (!request.user) {
            console.log('❌ No user found');
            response.statusCode = 403;
            response.body = { error: 'Forbidden' };
            return;
        }
        
        // 模拟权限检查
        if (request.url.startsWith('/admin') && request.user.name !== 'Admin') {
            console.log('❌ Insufficient permissions');
            response.statusCode = 403;
            response.body = { error: 'Insufficient permissions' };
            return;
        }
        
        console.log('✅ Authorization successful');
        next();
    }
}

// 日志中间件
class LoggingMiddleware extends MiddlewareHandler {
    protected process(request: HttpRequest, response: HttpResponse, next: () => void): void {
        const startTime = Date.now();
        console.log(`📝 ${request.method} ${request.url} - Started`);
        
        next();
        
        const duration = Date.now() - startTime;
        console.log(`📝 ${request.method} ${request.url} - ${response.statusCode} (${duration}ms)`);
    }
}

// 限流中间件
class RateLimitMiddleware extends MiddlewareHandler {
    private requests: Map<string, number[]> = new Map();
    private limit: number = 5; // 每分钟5次请求
    private windowMs: number = 60000; // 1分钟窗口
    
    protected process(request: HttpRequest, response: HttpResponse, next: () => void): void {
        console.log('⏱️ Rate limiting middleware');
        
        const clientIp = request.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        
        if (!this.requests.has(clientIp)) {
            this.requests.set(clientIp, []);
        }
        
        const clientRequests = this.requests.get(clientIp)!;
        
        // 清理过期的请求记录
        const validRequests = clientRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.limit) {
            console.log('❌ Rate limit exceeded');
            response.statusCode = 429;
            response.body = { error: 'Too Many Requests' };
            return;
        }
        
        validRequests.push(now);
        this.requests.set(clientIp, validRequests);
        
        console.log(`✅ Rate limit check passed (${validRequests.length}/${this.limit})`);
        next();
    }
}

// HTTP服务器
class HttpServer {
    private middlewareChain: MiddlewareHandler | null = null;
    
    use(middleware: MiddlewareHandler): void {
        if (!this.middlewareChain) {
            this.middlewareChain = middleware;
        } else {
            let current = this.middlewareChain;
            while (current.nextHandler) {
                current = current.nextHandler;
            }
            current.setNext(middleware);
        }
    }
    
    handleRequest(request: HttpRequest): HttpResponse {
        const response: HttpResponse = {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: null
        };
        
        if (this.middlewareChain) {
            this.middlewareChain.handle(request, response, () => {
                // 最终处理逻辑
                if (response.statusCode === 200) {
                    response.body = { message: 'Request processed successfully', user: request.user };
                }
            });
        }
        
        return response;
    }
}

// 使用示例
console.log('\n=== HTTP Middleware Chain Demo ===');

const server = new HttpServer();

// 添加中间件（顺序很重要）
server.use(new LoggingMiddleware());
server.use(new RateLimitMiddleware());
server.use(new AuthenticationMiddleware());
server.use(new AuthorizationMiddleware());

// 测试不同的请求
const requests = [
    {
        method: 'GET',
        url: '/api/users',
        headers: { 'authorization': 'Bearer valid-token', 'x-forwarded-for': '192.168.1.1' }
    },
    {
        method: 'GET',
        url: '/admin/settings',
        headers: { 'authorization': 'Bearer valid-token', 'x-forwarded-for': '192.168.1.1' }
    },
    {
        method: 'GET',
        url: '/api/data',
        headers: { 'x-forwarded-for': '192.168.1.1' } // 没有认证头
    }
];

requests.forEach((request, index) => {
    console.log(`\n--- Request ${index + 1}: ${request.method} ${request.url} ---`);
    const response = server.handleRequest(request);
    console.log(`Response: ${response.statusCode}`, response.body);
});
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **解耦合**：发送者和接收者解耦
2. **灵活性**：可以动态地增加或删除处理者
3. **职责分离**：每个处理者只关注自己的处理逻辑
4. **扩展性**：符合开闭原则，易于扩展

### ❌ 缺点
1. **性能影响**：请求可能需要遍历整个链
2. **调试困难**：运行时难以观察链的结构
3. **不保证处理**：请求可能到达链尾都没有被处理

## 🔄 相关模式

- **装饰器模式**：都使用递归组合，但责任链专注于请求传递
- **组合模式**：责任链可以使用组合模式构建处理者树
- **命令模式**：可以将请求封装为命令对象

## 🚀 最佳实践

1. **明确职责**：每个处理者应该有明确的处理职责
2. **合理排序**：根据处理频率和优先级排序处理者
3. **避免循环**：确保链不会形成循环
4. **性能考虑**：避免过长的处理链

## ⚠️ 注意事项

1. **链的完整性**：确保有处理者能够处理请求
2. **异常处理**：妥善处理处理者中的异常
3. **内存管理**：避免处理者之间的循环引用
4. **线程安全**：在多线程环境中确保线程安全

## 📚 总结

责任链模式通过将请求的发送者和接收者解耦，提供了一种灵活的请求处理机制。它特别适用于需要多个对象处理请求的场景。

**使用建议**：
- 当有多个对象可以处理同一请求时使用
- 当不想在代码中明确指定处理者时使用
- 当需要动态指定处理者集合时使用
- 当想要解耦请求发送者和接收者时使用

---

**相关链接**：
- [装饰器模式](../structural/decorator.md)
- [组合模式](../structural/composite.md)
- [命令模式](./command.md) 