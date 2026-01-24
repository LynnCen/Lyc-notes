# 建造者模式 (Builder Pattern)

> [!NOTE]
> 建造者模式将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

## 📖 模式定义

**建造者模式**是一种创建型设计模式，它允许你分步骤创建复杂对象。该模式允许你使用相同的创建代码生成不同类型和形式的对象。

### 核心要素
- **产品**：被构造的复杂对象
- **抽象建造者**：定义创建产品各个部件的抽象接口
- **具体建造者**：实现抽象建造者接口，构造和装配各个部件
- **指挥者**：构建一个使用Builder接口的对象

## 🎯 使用场景

### 适用情况
- **复杂对象创建**：对象有很多属性，构造过程复杂
- **参数很多的构造函数**：避免构造函数参数过多
- **对象创建步骤固定**：创建过程需要按特定顺序进行
- **需要创建不同表示**：同样的构建过程需要创建不同的对象
- **配置对象**：需要创建配置复杂的对象

### 不适用情况
- 对象结构简单
- 对象属性较少
- 不需要分步骤创建

## 💡 实现方式

### TypeScript 实现

```typescript
// 产品类
class Computer {
    private cpu: string = '';
    private memory: string = '';
    private storage: string = '';
    private gpu: string = '';
    private motherboard: string = '';
    private powerSupply: string = '';
    private case: string = '';
    
    setCPU(cpu: string): void { this.cpu = cpu; }
    setMemory(memory: string): void { this.memory = memory; }
    setStorage(storage: string): void { this.storage = storage; }
    setGPU(gpu: string): void { this.gpu = gpu; }
    setMotherboard(motherboard: string): void { this.motherboard = motherboard; }
    setPowerSupply(powerSupply: string): void { this.powerSupply = powerSupply; }
    setCase(case: string): void { this.case = case; }
    
    getSpecifications(): string {
        return `Computer Specifications:
        CPU: ${this.cpu}
        Memory: ${this.memory}
        Storage: ${this.storage}
        GPU: ${this.gpu}
        Motherboard: ${this.motherboard}
        Power Supply: ${this.powerSupply}
        Case: ${this.case}`;
    }
}

// 抽象建造者
interface ComputerBuilder {
    reset(): void;
    buildCPU(): void;
    buildMemory(): void;
    buildStorage(): void;
    buildGPU(): void;
    buildMotherboard(): void;
    buildPowerSupply(): void;
    buildCase(): void;
    getResult(): Computer;
}

// 具体建造者 - 游戏电脑
class GamingComputerBuilder implements ComputerBuilder {
    private computer: Computer;
    
    constructor() {
        this.reset();
    }
    
    reset(): void {
        this.computer = new Computer();
    }
    
    buildCPU(): void {
        this.computer.setCPU('Intel Core i9-12900K');
    }
    
    buildMemory(): void {
        this.computer.setMemory('32GB DDR4-3200');
    }
    
    buildStorage(): void {
        this.computer.setStorage('1TB NVMe SSD + 2TB HDD');
    }
    
    buildGPU(): void {
        this.computer.setGPU('NVIDIA RTX 4080');
    }
    
    buildMotherboard(): void {
        this.computer.setMotherboard('ASUS ROG Strix Z690-E');
    }
    
    buildPowerSupply(): void {
        this.computer.setPowerSupply('850W 80+ Gold');
    }
    
    buildCase(): void {
        this.computer.setCase('NZXT H7 RGB');
    }
    
    getResult(): Computer {
        return this.computer;
    }
}

// 具体建造者 - 办公电脑
class OfficeComputerBuilder implements ComputerBuilder {
    private computer: Computer;
    
    constructor() {
        this.reset();
    }
    
    reset(): void {
        this.computer = new Computer();
    }
    
    buildCPU(): void {
        this.computer.setCPU('Intel Core i5-12400');
    }
    
    buildMemory(): void {
        this.computer.setMemory('16GB DDR4-2666');
    }
    
    buildStorage(): void {
        this.computer.setStorage('512GB SATA SSD');
    }
    
    buildGPU(): void {
        this.computer.setGPU('Integrated Graphics');
    }
    
    buildMotherboard(): void {
        this.computer.setMotherboard('MSI B660M Pro');
    }
    
    buildPowerSupply(): void {
        this.computer.setPowerSupply('450W 80+ Bronze');
    }
    
    buildCase(): void {
        this.computer.setCase('Fractal Design Core 1000');
    }
    
    getResult(): Computer {
        return this.computer;
    }
}

// 指挥者
class ComputerDirector {
    private builder: ComputerBuilder;
    
    constructor(builder: ComputerBuilder) {
        this.builder = builder;
    }
    
    setBuilder(builder: ComputerBuilder): void {
        this.builder = builder;
    }
    
    buildMinimalComputer(): Computer {
        this.builder.reset();
        this.builder.buildCPU();
        this.builder.buildMemory();
        this.builder.buildStorage();
        this.builder.buildMotherboard();
        this.builder.buildPowerSupply();
        this.builder.buildCase();
        return this.builder.getResult();
    }
    
    buildFullComputer(): Computer {
        this.builder.reset();
        this.builder.buildCPU();
        this.builder.buildMemory();
        this.builder.buildStorage();
        this.builder.buildGPU();
        this.builder.buildMotherboard();
        this.builder.buildPowerSupply();
        this.builder.buildCase();
        return this.builder.getResult();
    }
}

// 使用示例
const gamingBuilder = new GamingComputerBuilder();
const officeBuilder = new OfficeComputerBuilder();

const director = new ComputerDirector(gamingBuilder);

// 构建游戏电脑
const gamingComputer = director.buildFullComputer();
console.log(gamingComputer.getSpecifications());

// 构建办公电脑
director.setBuilder(officeBuilder);
const officeComputer = director.buildMinimalComputer();
console.log(officeComputer.getSpecifications());
```

### 流式接口建造者模式

```typescript
class FluentComputerBuilder {
    private computer: Computer;
    
    constructor() {
        this.computer = new Computer();
    }
    
    withCPU(cpu: string): FluentComputerBuilder {
        this.computer.setCPU(cpu);
        return this;
    }
    
    withMemory(memory: string): FluentComputerBuilder {
        this.computer.setMemory(memory);
        return this;
    }
    
    withStorage(storage: string): FluentComputerBuilder {
        this.computer.setStorage(storage);
        return this;
    }
    
    withGPU(gpu: string): FluentComputerBuilder {
        this.computer.setGPU(gpu);
        return this;
    }
    
    withMotherboard(motherboard: string): FluentComputerBuilder {
        this.computer.setMotherboard(motherboard);
        return this;
    }
    
    withPowerSupply(powerSupply: string): FluentComputerBuilder {
        this.computer.setPowerSupply(powerSupply);
        return this;
    }
    
    withCase(computerCase: string): FluentComputerBuilder {
        this.computer.setCase(computerCase);
        return this;
    }
    
    build(): Computer {
        return this.computer;
    }
}

// 使用流式接口
const customComputer = new FluentComputerBuilder()
    .withCPU('AMD Ryzen 9 5900X')
    .withMemory('64GB DDR4-3600')
    .withStorage('2TB NVMe SSD')
    .withGPU('NVIDIA RTX 4090')
    .withMotherboard('ASUS ROG Crosshair VIII Hero')
    .withPowerSupply('1000W 80+ Platinum')
    .withCase('Corsair 4000D Airflow')
    .build();

console.log(customComputer.getSpecifications());
```

### Java 实现

```java
// 产品类
class Pizza {
    private String dough;
    private String sauce;
    private String cheese;
    private List<String> toppings = new ArrayList<>();
    
    public void setDough(String dough) { this.dough = dough; }
    public void setSauce(String sauce) { this.sauce = sauce; }
    public void setCheese(String cheese) { this.cheese = cheese; }
    public void addTopping(String topping) { this.toppings.add(topping); }
    
    @Override
    public String toString() {
        return String.format("Pizza: %s dough, %s sauce, %s cheese, toppings: %s",
                dough, sauce, cheese, String.join(", ", toppings));
    }
}

// 抽象建造者
abstract class PizzaBuilder {
    protected Pizza pizza;
    
    public void createNewPizza() {
        pizza = new Pizza();
    }
    
    public Pizza getPizza() {
        return pizza;
    }
    
    public abstract void buildDough();
    public abstract void buildSauce();
    public abstract void buildCheese();
    public abstract void buildToppings();
}

// 具体建造者
class MargheritaPizzaBuilder extends PizzaBuilder {
    @Override
    public void buildDough() {
        pizza.setDough("Thin crust");
    }
    
    @Override
    public void buildSauce() {
        pizza.setSauce("Tomato sauce");
    }
    
    @Override
    public void buildCheese() {
        pizza.setCheese("Mozzarella");
    }
    
    @Override
    public void buildToppings() {
        pizza.addTopping("Fresh basil");
        pizza.addTopping("Olive oil");
    }
}

class PepperoniPizzaBuilder extends PizzaBuilder {
    @Override
    public void buildDough() {
        pizza.setDough("Regular crust");
    }
    
    @Override
    public void buildSauce() {
        pizza.setSauce("Tomato sauce");
    }
    
    @Override
    public void buildCheese() {
        pizza.setCheese("Mozzarella");
    }
    
    @Override
    public void buildToppings() {
        pizza.addTopping("Pepperoni");
        pizza.addTopping("Italian sausage");
    }
}

// 指挥者
class PizzaDirector {
    private PizzaBuilder builder;
    
    public void setPizzaBuilder(PizzaBuilder builder) {
        this.builder = builder;
    }
    
    public Pizza constructPizza() {
        builder.createNewPizza();
        builder.buildDough();
        builder.buildSauce();
        builder.buildCheese();
        builder.buildToppings();
        return builder.getPizza();
    }
}

// 使用示例
public class BuilderPatternExample {
    public static void main(String[] args) {
        PizzaDirector director = new PizzaDirector();
        
        // 制作玛格丽特披萨
        MargheritaPizzaBuilder margheritaBuilder = new MargheritaPizzaBuilder();
        director.setPizzaBuilder(margheritaBuilder);
        Pizza margherita = director.constructPizza();
        System.out.println(margherita);
        
        // 制作意大利辣香肠披萨
        PepperoniPizzaBuilder pepperoniBuilder = new PepperoniPizzaBuilder();
        director.setPizzaBuilder(pepperoniBuilder);
        Pizza pepperoni = director.constructPizza();
        System.out.println(pepperoni);
    }
}
```

### Python 实现

```python
from abc import ABC, abstractmethod
from typing import List, Optional

# 产品类
class House:
    def __init__(self):
        self.foundation: str = ""
        self.walls: str = ""
        self.roof: str = ""
        self.windows: List[str] = []
        self.doors: List[str] = []
        self.garage: Optional[str] = None
        self.garden: Optional[str] = None
    
    def __str__(self):
        description = f"House with {self.foundation}, {self.walls}, {self.roof}"
        if self.windows:
            description += f", Windows: {', '.join(self.windows)}"
        if self.doors:
            description += f", Doors: {', '.join(self.doors)}"
        if self.garage:
            description += f", Garage: {self.garage}"
        if self.garden:
            description += f", Garden: {self.garden}"
        return description

# 抽象建造者
class HouseBuilder(ABC):
    def __init__(self):
        self.house = House()
    
    def reset(self):
        self.house = House()
    
    @abstractmethod
    def build_foundation(self):
        pass
    
    @abstractmethod
    def build_walls(self):
        pass
    
    @abstractmethod
    def build_roof(self):
        pass
    
    @abstractmethod
    def build_windows(self):
        pass
    
    @abstractmethod
    def build_doors(self):
        pass
    
    def build_garage(self):
        # 可选组件，默认不实现
        pass
    
    def build_garden(self):
        # 可选组件，默认不实现
        pass
    
    def get_house(self) -> House:
        return self.house

# 具体建造者 - 现代房屋
class ModernHouseBuilder(HouseBuilder):
    def build_foundation(self):
        self.house.foundation = "Concrete foundation"
    
    def build_walls(self):
        self.house.walls = "Glass and steel walls"
    
    def build_roof(self):
        self.house.roof = "Flat roof with solar panels"
    
    def build_windows(self):
        self.house.windows = ["Floor-to-ceiling windows", "Smart windows"]
    
    def build_doors(self):
        self.house.doors = ["Automatic sliding door", "Smart lock door"]
    
    def build_garage(self):
        self.house.garage = "Electric car charging garage"
    
    def build_garden(self):
        self.house.garden = "Minimalist zen garden"

# 具体建造者 - 传统房屋
class TraditionalHouseBuilder(HouseBuilder):
    def build_foundation(self):
        self.house.foundation = "Stone foundation"
    
    def build_walls(self):
        self.house.walls = "Brick walls"
    
    def build_roof(self):
        self.house.roof = "Clay tile roof"
    
    def build_windows(self):
        self.house.windows = ["Wooden frame windows", "Bay windows"]
    
    def build_doors(self):
        self.house.doors = ["Wooden front door", "French doors"]
    
    def build_garage(self):
        self.house.garage = "Traditional two-car garage"
    
    def build_garden(self):
        self.house.garden = "English cottage garden"

# 指挥者
class HouseDirector:
    def __init__(self, builder: HouseBuilder):
        self.builder = builder
    
    def set_builder(self, builder: HouseBuilder):
        self.builder = builder
    
    def build_basic_house(self) -> House:
        self.builder.reset()
        self.builder.build_foundation()
        self.builder.build_walls()
        self.builder.build_roof()
        self.builder.build_windows()
        self.builder.build_doors()
        return self.builder.get_house()
    
    def build_luxury_house(self) -> House:
        self.builder.reset()
        self.builder.build_foundation()
        self.builder.build_walls()
        self.builder.build_roof()
        self.builder.build_windows()
        self.builder.build_doors()
        self.builder.build_garage()
        self.builder.build_garden()
        return self.builder.get_house()

# 流式建造者
class FluentHouseBuilder:
    def __init__(self):
        self.house = House()
    
    def with_foundation(self, foundation: str):
        self.house.foundation = foundation
        return self
    
    def with_walls(self, walls: str):
        self.house.walls = walls
        return self
    
    def with_roof(self, roof: str):
        self.house.roof = roof
        return self
    
    def with_windows(self, windows: List[str]):
        self.house.windows = windows
        return self
    
    def with_doors(self, doors: List[str]):
        self.house.doors = doors
        return self
    
    def with_garage(self, garage: str):
        self.house.garage = garage
        return self
    
    def with_garden(self, garden: str):
        self.house.garden = garden
        return self
    
    def build(self) -> House:
        return self.house

# 使用示例
if __name__ == "__main__":
    # 使用指挥者模式
    modern_builder = ModernHouseBuilder()
    traditional_builder = TraditionalHouseBuilder()
    
    director = HouseDirector(modern_builder)
    
    # 建造现代基础房屋
    modern_basic = director.build_basic_house()
    print("Modern Basic House:", modern_basic)
    
    # 建造现代豪华房屋
    modern_luxury = director.build_luxury_house()
    print("Modern Luxury House:", modern_luxury)
    
    # 建造传统房屋
    director.set_builder(traditional_builder)
    traditional_house = director.build_luxury_house()
    print("Traditional House:", traditional_house)
    
    # 使用流式建造者
    custom_house = (FluentHouseBuilder()
                   .with_foundation("Reinforced concrete foundation")
                   .with_walls("Insulated brick walls")
                   .with_roof("Green roof with garden")
                   .with_windows(["Triple-glazed windows", "Skylight windows"])
                   .with_doors(["Security front door", "Patio doors"])
                   .with_garage("Underground parking garage")
                   .with_garden("Rooftop garden with vegetables")
                   .build())
    
    print("Custom House:", custom_house)
```

## ⚖️ 优缺点分析

### ✅ 优点
1. **分步构建**：可以分步骤构建复杂对象
2. **代码复用**：相同的构建过程可以创建不同的产品
3. **精细控制**：可以精细控制构建过程
4. **单一职责**：将复杂构建逻辑从产品类中分离
5. **流式接口**：提供更好的API体验

### ❌ 缺点
1. **增加复杂性**：引入了多个新类
2. **代码量增加**：需要为每个产品创建具体建造者
3. **产品结构限制**：要求产品有共同接口

## 🌟 实际应用案例

### 1. SQL查询建造者

```typescript
class SQLQuery {
    private selectFields: string[] = [];
    private fromTable: string = '';
    private joinClauses: string[] = [];
    private whereConditions: string[] = [];
    private groupByFields: string[] = [];
    private havingConditions: string[] = [];
    private orderByFields: string[] = [];
    private limitCount?: number;
    
    setSelect(fields: string[]): void { this.selectFields = fields; }
    setFrom(table: string): void { this.fromTable = table; }
    addJoin(join: string): void { this.joinClauses.push(join); }
    addWhere(condition: string): void { this.whereConditions.push(condition); }
    setGroupBy(fields: string[]): void { this.groupByFields = fields; }
    addHaving(condition: string): void { this.havingConditions.push(condition); }
    setOrderBy(fields: string[]): void { this.orderByFields = fields; }
    setLimit(count: number): void { this.limitCount = count; }
    
    build(): string {
        let query = `SELECT ${this.selectFields.join(', ')} FROM ${this.fromTable}`;
        
        if (this.joinClauses.length > 0) {
            query += ` ${this.joinClauses.join(' ')}`;
        }
        
        if (this.whereConditions.length > 0) {
            query += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        
        if (this.groupByFields.length > 0) {
            query += ` GROUP BY ${this.groupByFields.join(', ')}`;
        }
        
        if (this.havingConditions.length > 0) {
            query += ` HAVING ${this.havingConditions.join(' AND ')}`;
        }
        
        if (this.orderByFields.length > 0) {
            query += ` ORDER BY ${this.orderByFields.join(', ')}`;
        }
        
        if (this.limitCount) {
            query += ` LIMIT ${this.limitCount}`;
        }
        
        return query;
    }
}

class SQLQueryBuilder {
    private query: SQLQuery;
    
    constructor() {
        this.query = new SQLQuery();
    }
    
    select(...fields: string[]): SQLQueryBuilder {
        this.query.setSelect(fields);
        return this;
    }
    
    from(table: string): SQLQueryBuilder {
        this.query.setFrom(table);
        return this;
    }
    
    join(table: string, condition: string): SQLQueryBuilder {
        this.query.addJoin(`JOIN ${table} ON ${condition}`);
        return this;
    }
    
    leftJoin(table: string, condition: string): SQLQueryBuilder {
        this.query.addJoin(`LEFT JOIN ${table} ON ${condition}`);
        return this;
    }
    
    where(condition: string): SQLQueryBuilder {
        this.query.addWhere(condition);
        return this;
    }
    
    groupBy(...fields: string[]): SQLQueryBuilder {
        this.query.setGroupBy(fields);
        return this;
    }
    
    having(condition: string): SQLQueryBuilder {
        this.query.addHaving(condition);
        return this;
    }
    
    orderBy(...fields: string[]): SQLQueryBuilder {
        this.query.setOrderBy(fields);
        return this;
    }
    
    limit(count: number): SQLQueryBuilder {
        this.query.setLimit(count);
        return this;
    }
    
    build(): string {
        return this.query.build();
    }
}

// 使用示例
const query = new SQLQueryBuilder()
    .select('u.name', 'u.email', 'p.title')
    .from('users u')
    .leftJoin('posts p', 'u.id = p.user_id')
    .where('u.active = 1')
    .where('p.published = 1')
    .groupBy('u.id')
    .having('COUNT(p.id) > 0')
    .orderBy('u.name ASC')
    .limit(10)
    .build();

console.log(query);
// 输出: SELECT u.name, u.email, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id WHERE u.active = 1 AND p.published = 1 GROUP BY u.id HAVING COUNT(p.id) > 0 ORDER BY u.name ASC LIMIT 10
```

### 2. HTTP请求建造者

```typescript
interface HttpRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
}

class HttpRequestBuilder {
    private request: Partial<HttpRequest> = {
        headers: {}
    };
    
    url(url: string): HttpRequestBuilder {
        this.request.url = url;
        return this;
    }
    
    method(method: string): HttpRequestBuilder {
        this.request.method = method.toUpperCase();
        return this;
    }
    
    get(): HttpRequestBuilder {
        return this.method('GET');
    }
    
    post(): HttpRequestBuilder {
        return this.method('POST');
    }
    
    put(): HttpRequestBuilder {
        return this.method('PUT');
    }
    
    delete(): HttpRequestBuilder {
        return this.method('DELETE');
    }
    
    header(key: string, value: string): HttpRequestBuilder {
        this.request.headers![key] = value;
        return this;
    }
    
    headers(headers: Record<string, string>): HttpRequestBuilder {
        this.request.headers = { ...this.request.headers, ...headers };
        return this;
    }
    
    contentType(type: string): HttpRequestBuilder {
        return this.header('Content-Type', type);
    }
    
    json(): HttpRequestBuilder {
        return this.contentType('application/json');
    }
    
    authorization(token: string): HttpRequestBuilder {
        return this.header('Authorization', `Bearer ${token}`);
    }
    
    body(body: any): HttpRequestBuilder {
        this.request.body = body;
        return this;
    }
    
    timeout(ms: number): HttpRequestBuilder {
        this.request.timeout = ms;
        return this;
    }
    
    retries(count: number): HttpRequestBuilder {
        this.request.retries = count;
        return this;
    }
    
    build(): HttpRequest {
        if (!this.request.url) {
            throw new Error('URL is required');
        }
        if (!this.request.method) {
            throw new Error('HTTP method is required');
        }
        
        return this.request as HttpRequest;
    }
    
    // 便捷方法：直接执行请求
    async execute(): Promise<any> {
        const request = this.build();
        // 这里可以集成实际的HTTP客户端
        console.log('Executing request:', request);
        return { status: 200, data: 'Mock response' };
    }
}

// 使用示例
const response = await new HttpRequestBuilder()
    .url('https://api.example.com/users')
    .post()
    .json()
    .authorization('your-token-here')
    .body({ name: 'John Doe', email: 'john@example.com' })
    .timeout(5000)
    .retries(3)
    .execute();

console.log(response);
```

## 🔄 相关模式

### 与其他模式的关系
- **抽象工厂模式**：建造者关注分步构建，抽象工厂关注产品家族
- **组合模式**：建造者常用于构建组合模式的复杂结构
- **策略模式**：可以用策略模式来选择不同的建造算法

### 模式组合

```typescript
// 建造者 + 策略模式
interface BuildStrategy {
    build(builder: ComputerBuilder): void;
}

class GamingBuildStrategy implements BuildStrategy {
    build(builder: ComputerBuilder): void {
        builder.buildCPU();
        builder.buildGPU(); // 游戏电脑重点关注GPU
        builder.buildMemory();
        builder.buildStorage();
        builder.buildMotherboard();
        builder.buildPowerSupply();
        builder.buildCase();
    }
}

class OfficeBuildStrategy implements BuildStrategy {
    build(builder: ComputerBuilder): void {
        builder.buildCPU();
        builder.buildMemory();
        builder.buildStorage(); // 办公电脑重点关注存储
        builder.buildMotherboard();
        builder.buildPowerSupply();
        builder.buildCase();
        // 不需要独立显卡
    }
}

class StrategicComputerDirector {
    constructor(private strategy: BuildStrategy) {}
    
    buildComputer(builder: ComputerBuilder): Computer {
        builder.reset();
        this.strategy.build(builder);
        return builder.getResult();
    }
}
```

## 🚀 最佳实践

### 1. 参数验证

```typescript
class ValidatedBuilder {
    private product: any = {};
    private requiredFields: Set<string> = new Set();
    
    protected require(field: string): void {
        this.requiredFields.add(field);
    }
    
    protected validate(): void {
        const missing = Array.from(this.requiredFields).filter(
            field => !this.product[field]
        );
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }
    
    build(): any {
        this.validate();
        return this.product;
    }
}

class UserBuilder extends ValidatedBuilder {
    constructor() {
        super();
        this.require('name');
        this.require('email');
    }
    
    name(name: string): UserBuilder {
        this.product.name = name;
        return this;
    }
    
    email(email: string): UserBuilder {
        if (!email.includes('@')) {
            throw new Error('Invalid email format');
        }
        this.product.email = email;
        return this;
    }
    
    age(age: number): UserBuilder {
        if (age < 0 || age > 150) {
            throw new Error('Invalid age');
        }
        this.product.age = age;
        return this;
    }
}
```

### 2. 不可变建造者

```typescript
class ImmutableConfigBuilder {
    private readonly config: Readonly<any>;
    
    constructor(config: any = {}) {
        this.config = Object.freeze({ ...config });
    }
    
    withProperty(key: string, value: any): ImmutableConfigBuilder {
        return new ImmutableConfigBuilder({
            ...this.config,
            [key]: value
        });
    }
    
    withDatabase(host: string, port: number): ImmutableConfigBuilder {
        return new ImmutableConfigBuilder({
            ...this.config,
            database: { host, port }
        });
    }
    
    build(): Readonly<any> {
        return this.config;
    }
}

// 使用不可变建造者
const config = new ImmutableConfigBuilder()
    .withProperty('appName', 'MyApp')
    .withDatabase('localhost', 5432)
    .withProperty('debug', true)
    .build();
```

## ⚠️ 注意事项

1. **必需参数处理**：确保必需的参数得到设置
2. **参数验证**：在构建过程中验证参数的有效性
3. **线程安全**：在多线程环境中注意建造者的线程安全
4. **内存管理**：避免在建造过程中产生内存泄漏
5. **接口设计**：设计清晰直观的建造者接口

## 📚 总结

建造者模式是一个非常实用的创建型模式，特别适用于创建复杂对象的场景。它提供了很好的灵活性和可读性，特别是流式接口的实现让API使用起来更加直观。

**使用建议**：
- 当创建复杂对象的算法应该独立于该对象的组成部分以及它们的装配方式时使用
- 当构造过程必须允许被构造的对象有不同的表示时使用
- 当构造函数参数过多时，考虑使用建造者模式
- 优先使用流式接口提供更好的API体验

---

**相关链接**：
- [工厂方法模式](./factory-method.md)
- [抽象工厂模式](./abstract-factory.md)
- [原型模式](./prototype.md) 