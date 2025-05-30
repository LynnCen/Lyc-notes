# TypeScript Class 深入分析

> **什么是 Class（类）？**  
> Class 是面向对象编程的核心概念，它是创建对象的模板或蓝图。就像建筑师的设计图纸一样，类定义了对象应该有什么属性（数据）和方法（行为），但它本身不是对象。只有通过 `new` 关键字创建实例时，才会产生真正的对象。

## 1. 基础 Class 语法

> **核心概念：**  
> - **类（Class）**：对象的模板，定义了对象的结构
> - **实例（Instance）**：根据类创建的具体对象
> - **构造函数（Constructor）**：创建实例时自动调用的特殊方法
> - **属性（Properties）**：存储数据的变量
> - **方法（Methods）**：定义行为的函数

```typescript
class Person {
    // 属性声明 - 必须先声明才能使用
    name: string;
    age: number;
    
    // 构造函数 - 创建实例时自动执行
    constructor(name: string, age: number) {
        this.name = name;  // this 指向当前创建的实例
        this.age = age;
    }
    
    // 方法 - 定义对象的行为
    greet(): string {
        return `Hello, I'm ${this.name}`;  // this 指向调用方法的实例
    }
}

// 创建实例（对象）
const person = new Person("Alice", 25);
console.log(person.greet()); // Hello, I'm Alice

// 理解实例与类的关系
console.log(person instanceof Person); // true - person 是 Person 类的实例
console.log(typeof Person); // "function" - 类本质上是构造函数
console.log(typeof person); // "object" - 实例是对象
```

### ⚠️ 重要注意事项：

1. **this 指向问题**：
```typescript
class Counter {
    count: number = 0;
    
    increment(): void {
        this.count++; // this 指向调用 increment 的实例
    }
    
    // 箭头函数自动绑定 this
    incrementArrow = (): void => {
        this.count++; // this 始终指向类实例
    }
}

const counter = new Counter();

// 正常调用 - this 指向 counter 实例
counter.increment(); // ✅ 正确

// 方法赋值给变量 - this 指向可能丢失
const incrementFn = counter.increment;
// incrementFn(); // ❌ 错误：this 可能是 undefined

// 使用箭头函数方法 - this 绑定正确
const incrementArrowFn = counter.incrementArrow;
incrementArrowFn(); // ✅ 正确：this 始终指向 counter
```

2. **属性必须先声明**：
```typescript
class Example {
    // ❌ 错误：未声明属性
    constructor() {
        this.value = 10; // TypeScript 报错
    }
}

class ExampleFixed {
    value: number; // ✅ 正确：先声明属性
    
    constructor() {
        this.value = 10; // ✅ 现在可以赋值
    }
}
```

## 2. 访问修饰符 (Access Modifiers)

> **什么是访问修饰符？**  
> 访问修饰符控制类成员（属性和方法）的可见性和访问权限，这是封装性的体现。通过合理使用访问修饰符，我们可以隐藏内部实现细节，只暴露必要的接口。

### 2.1 public (公开) - 默认修饰符

> **特点：**  
> - 可以在类的内部、外部、子类中访问
> - 不写修饰符时默认为 public
> - 这是最开放的访问级别

```typescript
class Animal {
    public name: string; // 默认就是 public
    
    constructor(name: string) {
        this.name = name;
    }
    
    public speak(): void {
        console.log(`${this.name} makes a sound`);
    }
}

const animal = new Animal("Dog");
console.log(animal.name); // 可以访问
animal.speak(); // 可以调用
```

### 2.2 private (私有)
```typescript
class BankAccount {
    private balance: number = 0;
    
    constructor(initialBalance: number) {
        this.balance = initialBalance;
    }
    
    private validateAmount(amount: number): boolean {
        return amount > 0 && amount <= this.balance;
    }
    
    public withdraw(amount: number): boolean {
        if (this.validateAmount(amount)) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
    
    public getBalance(): number {
        return this.balance;
    }
}

const account = new BankAccount(1000);
// console.log(account.balance); // 错误：无法访问私有属性
// account.validateAmount(100); // 错误：无法访问私有方法
console.log(account.getBalance()); // 正确：通过公开方法访问
```

### 2.3 protected (受保护)
```typescript
class Employee {
    protected id: number;
    protected name: string;
    
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
    
    protected getEmployeeInfo(): string {
        return `ID: ${this.id}, Name: ${this.name}`;
    }
}

class Manager extends Employee {
    private department: string;
    
    constructor(id: number, name: string, department: string) {
        super(id, name);
        this.department = department;
    }
    
    public getManagerInfo(): string {
        // 可以访问父类的 protected 成员
        return `${this.getEmployeeInfo()}, Department: ${this.department}`;
    }
}

const manager = new Manager(1, "John", "IT");
console.log(manager.getManagerInfo());
// console.log(manager.id); // 错误：无法在类外访问 protected 成员
```

## 3. 只读属性 (readonly)

```typescript
class Car {
    readonly brand: string;
    readonly model: string;
    private mileage: number = 0;
    
    constructor(brand: string, model: string) {
        this.brand = brand;
        this.model = model;
    }
    
    addMileage(miles: number): void {
        this.mileage += miles;
        // this.brand = "Toyota"; // 错误：无法修改只读属性
    }
    
    getMileage(): number {
        return this.mileage;
    }
}

const car = new Car("BMW", "X5");
console.log(car.brand); // 可以读取
// car.brand = "Audi"; // 错误：无法修改只读属性
```

## 4. 静态成员 (static)

```typescript
class MathUtils {
    static PI: number = 3.14159;
    static instanceCount: number = 0;
    
    constructor() {
        MathUtils.instanceCount++;
    }
    
    static calculateCircleArea(radius: number): number {
        return this.PI * radius * radius;
    }
    
    static getInstanceCount(): number {
        return this.instanceCount;
    }
    
    // 静态块（ES2022 特性）
    static {
        console.log("MathUtils class initialized");
    }
}

// 无需实例化即可访问静态成员
console.log(MathUtils.PI);
console.log(MathUtils.calculateCircleArea(5));

const utils1 = new MathUtils();
const utils2 = new MathUtils();
console.log(MathUtils.getInstanceCount()); // 2
```

## 5. 抽象类 (Abstract Class)

```typescript
abstract class Shape {
    protected name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    // 抽象方法：子类必须实现
    abstract calculateArea(): number;
    abstract calculatePerimeter(): number;
    
    // 具体方法：子类可以直接使用
    display(): void {
        console.log(`Shape: ${this.name}`);
        console.log(`Area: ${this.calculateArea()}`);
        console.log(`Perimeter: ${this.calculatePerimeter()}`);
    }
    
    // 抽象静态方法
    abstract static create(...args: any[]): Shape;
}

class Rectangle extends Shape {
    private width: number;
    private height: number;
    
    constructor(width: number, height: number) {
        super("Rectangle");
        this.width = width;
        this.height = height;
    }
    
    calculateArea(): number {
        return this.width * this.height;
    }
    
    calculatePerimeter(): number {
        return 2 * (this.width + this.height);
    }
    
    static create(width: number, height: number): Rectangle {
        return new Rectangle(width, height);
    }
}

class Circle extends Shape {
    private radius: number;
    
    constructor(radius: number) {
        super("Circle");
        this.radius = radius;
    }
    
    calculateArea(): number {
        return Math.PI * this.radius * this.radius;
    }
    
    calculatePerimeter(): number {
        return 2 * Math.PI * this.radius;
    }
    
    static create(radius: number): Circle {
        return new Circle(radius);
    }
}

// const shape = new Shape("test"); // 错误：无法实例化抽象类
const rectangle = new Rectangle(5, 3);
const circle = Circle.create(4);

rectangle.display();
circle.display();
```

## 6. 继承 (Inheritance)

> **什么是继承？**  
> 继承是面向对象编程的核心概念之一，它允许一个类（子类）从另一个类（父类）获得属性和方法。子类可以重用父类的代码，同时也可以添加新功能或修改现有功能。这实现了代码复用和"is-a"关系。

```typescript
// 父类（基类） - 定义动物的通用特征
class Animal {
    protected name: string;      // protected 让子类可以访问
    protected species: string;
    private age: number;         // private 只有父类能访问
    
    constructor(name: string, species: string, age: number) {
        this.name = name;
        this.species = species;
        this.age = age;
        console.log(`Creating ${species}: ${name}`);
    }
    
    // 可以被子类重写的方法
    makeSound(): void {
        console.log(`${this.name} makes a sound`);
    }
    
    // 通用方法
    getInfo(): string {
        return `${this.name} is a ${this.species}, age ${this.age}`;
    }
    
    // 受保护的方法，子类可以使用
    protected sleep(): void {
        console.log(`${this.name} is sleeping`);
    }
    
    // 私有方法，只有父类能使用
    private getAge(): number {
        return this.age;
    }
}

// 子类 - 继承自 Animal
class Dog extends Animal {
    private breed: string;       // 子类特有的属性
    private isTrained: boolean;
    
    constructor(name: string, breed: string, age: number, isTrained: boolean = false) {
        // 必须首先调用父类构造函数
        super(name, "Canine", age);  // super() 调用父类构造函数
        this.breed = breed;
        this.isTrained = isTrained;
    }
    
    // 重写父类方法 - 方法覆盖（Override）
    makeSound(): void {
        console.log(`${this.name} barks: Woof! Woof!`);
    }
    
    // 新增子类特有的方法
    fetch(): void {
        if (this.isTrained) {
            console.log(`${this.name} fetches the ball`);
        } else {
            console.log(`${this.name} doesn't know how to fetch yet`);
        }
    }
    
    train(): void {
        this.isTrained = true;
        console.log(`${this.name} has been trained`);
    }
    
    // 重写并扩展父类方法
    getInfo(): string {
        const baseInfo = super.getInfo(); // 调用父类方法
        return `${baseInfo}, Breed: ${this.breed}, Trained: ${this.isTrained}`;
    }
    
    // 使用父类的 protected 方法
    rest(): void {
        console.log(`${this.name} is taking a rest`);
        this.sleep(); // 调用父类的 protected 方法
    }
    
    // 不能访问父类的 private 方法
    // getAge(): number {
    //     return this.getAge(); // ❌ 错误：无法访问父类的 private 方法
    // }
}

// 另一个子类
class Cat extends Animal {
    private isIndoor: boolean;
    
    constructor(name: string, age: number, isIndoor: boolean = true) {
        super(name, "Feline", age);
        this.isIndoor = isIndoor;
    }
    
    // 重写父类方法
    makeSound(): void {
        console.log(`${this.name} meows: Meow! Meow!`);
    }
    
    // 猫特有的行为
    purr(): void {
        console.log(`${this.name} is purring contentedly`);
    }
    
    hunt(): void {
        if (!this.isIndoor) {
            console.log(`${this.name} is hunting`);
        } else {
            console.log(`${this.name} is an indoor cat and doesn't hunt`);
        }
    }
}

// 使用示例
const dog = new Dog("Buddy", "Golden Retriever", 3, false);
const cat = new Cat("Whiskers", 2, true);

// 多态性 - 同样的方法调用，不同的行为
const animals: Animal[] = [dog, cat];
animals.forEach(animal => {
    console.log(animal.getInfo());
    animal.makeSound(); // 根据实际类型调用相应的方法
});

// 子类特有的功能
dog.fetch();     // Buddy doesn't know how to fetch yet
dog.train();     // Buddy has been trained
dog.fetch();     // Buddy fetches the ball
dog.rest();      // 使用继承的 protected 方法

cat.purr();      // Whiskers is purring contentedly
cat.hunt();      // Whiskers is an indoor cat and doesn't hunt
```

### ⚠️ 继承注意事项：

1. **super() 调用顺序**：
```typescript
class Parent {
    protected value: number;
    
    constructor(value: number) {
        this.value = value;
    }
}

class Child extends Parent {
    private multiplier: number;
    
    constructor(value: number, multiplier: number) {
        // super() 必须在访问 this 之前调用
        // this.multiplier = multiplier; // ❌ 错误：不能在 super() 之前使用 this
        super(value);                    // ✅ 正确：首先调用父类构造函数
        this.multiplier = multiplier;    // ✅ 现在可以使用 this
    }
}
```

2. **方法重写的类型兼容性**：
```typescript
class Bird {
    fly(speed: number): void {
        console.log(`Flying at ${speed} km/h`);
    }
}

class Eagle extends Bird {
    // ✅ 正确：参数类型和返回类型兼容
    fly(speed: number): void {
        console.log(`Eagle soaring at ${speed} km/h`);
    }
    
    // ❌ 错误：改变方法签名会破坏兼容性
    // fly(speed: string): void { ... }
}
```

## 7. 接口实现 (Implements)

> **什么是接口实现？**  
> 接口定义了类必须遵循的契约（contract）。当一个类实现（implements）一个接口时，它必须提供接口中定义的所有属性和方法。这确保了类符合特定的结构要求，是实现多态性的重要方式。

```typescript
// 定义能飞行的接口
interface Flyable {
    altitude: number;           // 飞行高度
    maxSpeed: number;           // 最大速度
    fly(): void;                // 飞行方法
    land(): void;               // 降落方法
    getFlightInfo(): string;    // 获取飞行信息
}

// 定义能游泳的接口
interface Swimmable {
    depth: number;              // 游泳深度
    waterType: 'fresh' | 'salt'; // 水的类型
    swim(): void;               // 游泳方法
    dive(targetDepth: number): void; // 潜水方法
}

// 定义可驯养的接口
interface Trainable {
    isTrained: boolean;
    train(): void;
    obeyCommand(command: string): boolean;
}

// 实现单个接口
class Bird implements Flyable {
    altitude: number = 0;
    maxSpeed: number = 50;
    
    constructor(private species: string) {}
    
    fly(): void {
        this.altitude = 100;
        console.log(`${this.species} is flying at ${this.altitude}m`);
    }
    
    land(): void {
        this.altitude = 0;
        console.log(`${this.species} has landed`);
    }
    
    getFlightInfo(): string {
        return `${this.species} - Altitude: ${this.altitude}m, Max Speed: ${this.maxSpeed}km/h`;
    }
}

// 实现多个接口 - 鸭子既能飞又能游泳
class Duck implements Flyable, Swimmable {
    // Flyable 接口的属性
    altitude: number = 0;
    maxSpeed: number = 80;
    
    // Swimmable 接口的属性
    depth: number = 0;
    waterType: 'fresh' | 'salt' = 'fresh';
    
    constructor(private name: string) {}
    
    // 实现 Flyable 接口的方法
    fly(): void {
        this.altitude = 50;
        console.log(`${this.name} is flying at ${this.altitude}m`);
    }
    
    land(): void {
        this.altitude = 0;
        console.log(`${this.name} has landed`);
    }
    
    getFlightInfo(): string {
        return `Duck ${this.name} - Altitude: ${this.altitude}m, Max Speed: ${this.maxSpeed}km/h`;
    }
    
    // 实现 Swimmable 接口的方法
    swim(): void {
        this.depth = 2;
        console.log(`${this.name} is swimming at ${this.depth}m depth in ${this.waterType} water`);
    }
    
    dive(targetDepth: number): void {
        this.depth = Math.min(targetDepth, 10); // 鸭子最多潜水 10 米
        console.log(`${this.name} dived to ${this.depth}m`);
    }
}

// 类也可以作为接口使用
class Timestamp {
    timestamp: number;
    
    constructor() {
        this.timestamp = Date.now();
    }
    
    getFormattedTime(): string {
        return new Date(this.timestamp).toISOString();
    }
}

// 实现类接口
class LogEntry implements Timestamp {
    timestamp: number;          // 必须实现
    message: string;
    level: 'info' | 'warn' | 'error';
    
    constructor(message: string, level: 'info' | 'warn' | 'error' = 'info') {
        this.timestamp = Date.now(); // 实现接口要求的属性
        this.message = message;
        this.level = level;
    }
    
    // 可以选择实现类接口的方法，也可以不实现
    getFormattedTime(): string {
        return new Date(this.timestamp).toLocaleString();
    }
    
    toString(): string {
        return `[${this.level.toUpperCase()}] ${this.getFormattedTime()}: ${this.message}`;
    }
}

// 接口继承 - 接口也可以继承其他接口
interface Flyable2 extends Flyable {
    wingspan: number;           // 翼展
    canHover(): boolean;        // 是否能悬停
}

class Helicopter implements Flyable2 {
    altitude: number = 0;
    maxSpeed: number = 300;
    wingspan: number = 12;      // 旋翼直径
    
    constructor(private model: string) {}
    
    fly(): void {
        this.altitude = 500;
        console.log(`${this.model} helicopter is flying at ${this.altitude}m`);
    }
    
    land(): void {
        this.altitude = 0;
        console.log(`${this.model} helicopter has landed`);
    }
    
    getFlightInfo(): string {
        return `${this.model} - Altitude: ${this.altitude}m, Max Speed: ${this.maxSpeed}km/h, Rotor Diameter: ${this.wingspan}m`;
    }
    
    canHover(): boolean {
        return true; // 直升机可以悬停
    }
    
    hover(): void {
        console.log(`${this.model} is hovering at ${this.altitude}m`);
    }
}

// 使用示例
const bird = new Bird("Eagle");
const duck = new Duck("Donald");
const helicopter = new Helicopter("Apache");

// 多态性 - 通过接口类型调用
const flyingObjects: Flyable[] = [bird, duck, helicopter];
flyingObjects.forEach(obj => {
    obj.fly();
    console.log(obj.getFlightInfo());
    obj.land();
});

// 类型检查
const aquaticAnimals: Swimmable[] = [duck]; // 只有鸭子实现了 Swimmable
aquaticAnimals.forEach(animal => {
    animal.swim();
    animal.dive(5);
});

// 日志系统示例
const logs: LogEntry[] = [
    new LogEntry("Application started", "info"),
    new LogEntry("User login failed", "warn"),
    new LogEntry("Database connection lost", "error")
];

logs.forEach(log => console.log(log.toString()));
```

### 💡 接口 vs 抽象类：

| 特性 | 接口 (Interface) | 抽象类 (Abstract Class) |
|------|------------------|------------------------|
| **实例化** | 不能实例化 | 不能实例化 |
| **方法实现** | 只能定义方法签名 | 可以有具体实现和抽象方法 |
| **属性** | 只能定义属性类型 | 可以有具体属性值 |
| **继承/实现** | 可以多实现 | 只能单继承 |
| **构造函数** | 不能有构造函数 | 可以有构造函数 |
| **使用场景** | 定义契约和规范 | 提供部分实现的基类 |

## 8. 参数属性 (Parameter Properties)

> **什么是参数属性？**  
> 参数属性是 TypeScript 提供的语法糖，允许在构造函数参数中同时声明和初始化类属性。这大大简化了代码，避免了重复的属性声明和赋值操作。

```typescript
// 传统写法 - 繁琐且重复
class StudentTraditional {
    private id: number;
    private name: string;
    public grade: number;
    protected school: string;
    
    constructor(id: number, name: string, grade: number, school: string) {
        this.id = id;           // 重复的赋值操作
        this.name = name;       // 重复的赋值操作
        this.grade = grade;     // 重复的赋值操作
        this.school = school;   // 重复的赋值操作
    }
    
    getStudentInfo(): string {
        return `ID: ${this.id}, Name: ${this.name}, Grade: ${this.grade}`;
    }
}

// 参数属性简化写法 - 简洁高效
class Student {
    // 在构造函数参数中直接声明属性
    constructor(
        private id: number,                    // 等同于：private id: number; this.id = id;
        private name: string,                  // 等同于：private name: string; this.name = name;
        public grade: number,                  // 等同于：public grade: number; this.grade = grade;
        protected school: string,              // 等同于：protected school: string; this.school = school;
        readonly graduationYear: number,       // 只读属性
        public isActive: boolean = true        // 带默认值的属性
    ) {
        // 构造函数体可以包含其他逻辑
        console.log(`Creating student: ${name}`);
    }
    
    getStudentInfo(): string {
        return `ID: ${this.id}, Name: ${this.name}, Grade: ${this.grade}, School: ${this.school}`;
    }
    
    graduate(): void {
        console.log(`${this.name} graduated in ${this.graduationYear}`);
    }
}

// 混合使用 - 既有参数属性，也有普通属性
class Employee {
    // 普通属性声明
    private startDate: Date;
    private benefits: string[] = [];
    
    constructor(
        private employeeId: string,     // 参数属性
        private firstName: string,      // 参数属性
        private lastName: string,       // 参数属性
        public department: string,      // 参数属性
        private salary: number,         // 参数属性
        startDate?: Date               // 普通参数，不是参数属性
    ) {
        // 手动处理普通参数
        this.startDate = startDate || new Date();
        this.initializeBenefits();
    }
    
    private initializeBenefits(): void {
        this.benefits = ['Health Insurance', 'Retirement Plan'];
        if (this.salary > 50000) {
            this.benefits.push('Stock Options');
        }
    }
    
    getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
    
    getEmployeeDetails(): string {
        return `${this.getFullName()} (ID: ${this.employeeId}) - ${this.department}`;
    }
}

// 在继承中使用参数属性
class Manager extends Employee {
    constructor(
        employeeId: string,
        firstName: string,
        lastName: string,
        private teamSize: number,        // 子类特有的参数属性
        private budget: number,          // 子类特有的参数属性
        startDate?: Date
    ) {
        // 调用父类构造函数
        super(employeeId, firstName, lastName, 'Management', 80000, startDate);
    }
    
    getTeamInfo(): string {
        return `${this.getFullName()} manages ${this.teamSize} people with a budget of $${this.budget}`;
    }
}

// 使用示例
const student = new Student(
    12345,                    // id
    "Alice Johnson",          // name
    10,                       // grade
    "MIT",                   // school
    2024,                    // graduationYear
    true                     // isActive
);

console.log(student.grade);                    // 可以访问 public 属性
console.log(student.graduationYear);          // 可以访问 readonly 属性
console.log(student.getStudentInfo());
// console.log(student.id);                   // ❌ 错误：无法访问 private 属性

const employee = new Employee(
    "EMP001",
    "John",
    "Doe", 
    "Engineering",
    75000
);

const manager = new Manager(
    "MGR001",
    "Jane",
    "Smith",
    8,                       // teamSize
    500000,                  // budget
    new Date('2020-01-15')
);

console.log(employee.getEmployeeDetails());
console.log(manager.getEmployeeDetails());
console.log(manager.getTeamInfo());
```

### 💡 参数属性使用技巧：

1. **优先级顺序**：
```typescript
class Example {
    constructor(
        public publicProp: string,      // 通常放在前面
        protected protectedProp: string, // 中间
        private privateProp: string,    // 最后
        readonly readonlyProp: string   // 只读属性可以放在任何位置
    ) {}
}
```

2. **与普通属性结合**：
```typescript
class Product {
    // 普通属性
    private createdAt: Date = new Date();
    private updatedAt: Date = new Date();
    
    constructor(
        private id: string,          // 参数属性
        public name: string,         // 参数属性
        private price: number,       // 参数属性
        category?: string           // 可选的普通参数
    ) {
        // 可以在构造函数中处理普通参数
        if (category) {
            this.setCategory(category);
        }
    }
    
    private setCategory(category: string): void {
        // 一些业务逻辑
        console.log(`Setting category to ${category}`);
    }
}
```

## 9. Getter 和 Setter (访问器)

> **什么是访问器？**  
> Getter 和 Setter 是特殊的方法，允许你控制对类属性的访问。Getter 在读取属性时调用，Setter 在设置属性时调用。它们提供了一种封装数据访问的方式，可以在获取或设置值时执行额外的逻辑。

```typescript
class Temperature {
    private _celsius: number = 0;        // 内部存储摄氏温度
    private _history: number[] = [];     // 温度变化历史
    
    // Getter - 获取摄氏温度
    get celsius(): number {
        console.log('Getting celsius temperature');
        return this._celsius;
    }
    
    // Setter - 设置摄氏温度
    set celsius(value: number) {
        console.log(`Setting celsius to ${value}`);
        
        // 数据验证
        if (value < -273.15) {
            throw new Error("Temperature cannot be below absolute zero (-273.15°C)");
        }
        
        // 记录历史
        this._history.push(this._celsius);
        this._celsius = value;
        
        // 可以触发其他逻辑
        this.logTemperatureChange();
    }
    
    // 计算属性 - 华氏温度
    get fahrenheit(): number {
        return (this._celsius * 9/5) + 32;
    }
    
    set fahrenheit(value: number) {
        // 验证华氏温度范围
        if (value < -459.67) {
            throw new Error("Temperature cannot be below absolute zero (-459.67°F)");
        }
        
        // 转换为摄氏温度并设置
        this.celsius = (value - 32) * 5/9;
    }
    
    // 计算属性 - 开尔文温度
    get kelvin(): number {
        return this._celsius + 273.15;
    }
    
    set kelvin(value: number) {
        if (value < 0) {
            throw new Error("Kelvin temperature cannot be negative");
        }
        this.celsius = value - 273.15;
    }
    
    // 只读属性 - 只有 getter，没有 setter
    get temperatureHistory(): readonly number[] {
        return [...this._history]; // 返回副本，防止外部修改
    }
    
    get averageTemperature(): number {
        if (this._history.length === 0) return this._celsius;
        const sum = this._history.reduce((acc, temp) => acc + temp, 0);
        return sum / this._history.length;
    }
    
    // 内部方法
    private logTemperatureChange(): void {
        console.log(`Temperature changed to ${this._celsius}°C`);
    }
    
    // 清除历史记录
    clearHistory(): void {
        this._history = [];
    }
    
    // 获取温度状态描述
    get status(): string {
        if (this._celsius < 0) return "Freezing";
        if (this._celsius < 10) return "Cold";
        if (this._celsius < 25) return "Cool";
        if (this._celsius < 35) return "Warm";
        return "Hot";
    }
}

// 更复杂的示例 - 银行账户
class BankAccount {
    private _balance: number = 0;
    private _transactions: Array<{type: 'deposit' | 'withdraw', amount: number, date: Date}> = [];
    private _isLocked: boolean = false;
    
    constructor(
        private accountNumber: string,
        private accountHolder: string,
        initialBalance: number = 0
    ) {
        if (initialBalance > 0) {
            this._balance = initialBalance;
            this._transactions.push({
                type: 'deposit',
                amount: initialBalance,
                date: new Date()
            });
        }
    }
    
    // 余额只读访问
    get balance(): number {
        if (this._isLocked) {
            throw new Error("Account is locked");
        }
        return this._balance;
    }
    
    // 账户状态
    get accountStatus(): string {
        if (this._isLocked) return "Locked";
        if (this._balance < 0) return "Overdrawn";
        if (this._balance < 100) return "Low Balance";
        return "Active";
    }
    
    // 交易历史（只读）
    get transactionHistory(): readonly Array<{type: 'deposit' | 'withdraw', amount: number, date: Date}> {
        return [...this._transactions];
    }
    
    // 最后交易日期
    get lastTransactionDate(): Date | null {
        if (this._transactions.length === 0) return null;
        return this._transactions[this._transactions.length - 1].date;
    }
    
    // 锁定状态
    get isLocked(): boolean {
        return this._isLocked;
    }
    
    set isLocked(value: boolean) {
        this._isLocked = value;
        console.log(`Account ${this.accountNumber} ${value ? 'locked' : 'unlocked'}`);
    }
    
    // 存款
    deposit(amount: number): void {
        if (this._isLocked) {
            throw new Error("Cannot deposit to locked account");
        }
        
        if (amount <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        
        this._balance += amount;
        this._transactions.push({
            type: 'deposit',
            amount: amount,
            date: new Date()
        });
        
        console.log(`Deposited $${amount}. New balance: $${this._balance}`);
    }
    
    // 取款
    withdraw(amount: number): boolean {
        if (this._isLocked) {
            throw new Error("Cannot withdraw from locked account");
        }
        
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be positive");
        }
        
        if (amount > this._balance) {
            console.log("Insufficient funds");
            return false;
        }
        
        this._balance -= amount;
        this._transactions.push({
            type: 'withdraw',
            amount: amount,
            date: new Date()
        });
        
        console.log(`Withdrew $${amount}. New balance: $${this._balance}`);
        return true;
    }
}

// 使用示例
const temp = new Temperature();

// 使用 getter 和 setter
temp.celsius = 25;                      // 调用 setter
console.log(temp.celsius);              // 调用 getter: 25
console.log(temp.fahrenheit);           // 77
console.log(temp.kelvin);               // 298.15
console.log(temp.status);               // "Warm"

// 通过不同单位设置温度
temp.fahrenheit = 86;                   // 通过华氏温度设置
console.log(temp.celsius);              // 30

temp.kelvin = 303.15;                   // 通过开尔文温度设置
console.log(temp.celsius);              // 30

// 查看历史记录
console.log(temp.temperatureHistory);   // [25, 30]
console.log(temp.averageTemperature);   // 27.5

// 银行账户示例
const account = new BankAccount("ACC123", "John Doe", 1000);

console.log(account.balance);            // 1000
console.log(account.accountStatus);      // "Active"

account.deposit(500);
account.withdraw(200);

console.log(account.transactionHistory.length); // 3 (初始存款 + 存款 + 取款)
console.log(account.lastTransactionDate);

// 锁定账户
account.isLocked = true;
// account.deposit(100);                 // 抛出错误：Cannot deposit to locked account

account.isLocked = false;                // 解锁账户
```

### ⚠️ 访问器注意事项：

1. **性能考虑**：
```typescript
class DataProcessor {
    private _data: number[] = [];
    
    // ❌ 避免在 getter 中进行复杂计算
    get expensiveCalculation(): number {
        return this._data.reduce((sum, val) => sum + Math.pow(val, 2), 0); // 每次访问都计算
    }
    
    // ✅ 缓存计算结果
    private _cachedSum: number | null = null;
    get efficientCalculation(): number {
        if (this._cachedSum === null) {
            this._cachedSum = this._data.reduce((sum, val) => sum + Math.pow(val, 2), 0);
        }
        return this._cachedSum;
    }
    
    addData(value: number): void {
        this._data.push(value);
        this._cachedSum = null; // 数据变化时清除缓存
    }
}
```

2. **避免无限递归**：
```typescript
class CircularExample {
    private _value: number = 0;
    
    get value(): number {
        // return this.value; // ❌ 错误：会导致无限递归
        return this._value;   // ✅ 正确：访问内部属性
    }
    
    set value(val: number) {
        // this.value = val;  // ❌ 错误：会导致无限递归
        this._value = val;    // ✅ 正确：设置内部属性
    }
}
```

## 10. 装饰器 (Decorators) - 实验性特性

```typescript
// 需要在 tsconfig.json 中启用 "experimentalDecorators": true

// 类装饰器
function logged(constructor: Function) {
    console.log(`Class ${constructor.name} was created`);
}

// 方法装饰器
function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();
        console.log(`${propertyKey} took ${end - start} milliseconds`);
        return result;
    };
}

// 属性装饰器
function readonly(target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
        writable: false
    });
}

@logged
class Calculator {
    @readonly
    public version: string = "1.0";
    
    @measure
    public complexCalculation(n: number): number {
        let result = 0;
        for (let i = 0; i < n; i++) {
            result += Math.sqrt(i);
        }
        return result;
    }
}

const calc = new Calculator();
calc.complexCalculation(1000000);
```

## 11. 混入 (Mixins)

```typescript
// 混入基类
class Disposable {
    isDisposed: boolean = false;
    
    dispose() {
        this.isDisposed = true;
        console.log("Object disposed");
    }
}

class Activatable {
    isActive: boolean = false;
    
    activate() {
        this.isActive = true;
        console.log("Object activated");
    }
    
    deactivate() {
        this.isActive = false;
        console.log("Object deactivated");
    }
}

// 混入函数
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
                );
            }
        });
    });
}

// 目标类
class SmartObject implements Disposable, Activatable {
    constructor() {
        console.log("SmartObject created");
    }
    
    interact() {
        console.log("SmartObject interaction");
    }
    
    // 混入接口的属性（需要占位声明）
    isDisposed!: boolean;
    isActive!: boolean;
    dispose!: () => void;
    activate!: () => void;
    deactivate!: () => void;
}

// 应用混入
applyMixins(SmartObject, [Disposable, Activatable]);

const smartObj = new SmartObject();
smartObj.activate();
smartObj.interact();
smartObj.dispose();
```

## 12. 高级模式和最佳实践

### 12.1 工厂模式
```typescript
abstract class Vehicle {
    abstract start(): void;
    abstract stop(): void;
}

class Car extends Vehicle {
    start(): void {
        console.log("Car engine started");
    }
    
    stop(): void {
        console.log("Car engine stopped");
    }
}

class Motorcycle extends Vehicle {
    start(): void {
        console.log("Motorcycle engine started");
    }
    
    stop(): void {
        console.log("Motorcycle engine stopped");
    }
}

class VehicleFactory {
    static createVehicle(type: "car" | "motorcycle"): Vehicle {
        switch (type) {
            case "car":
                return new Car();
            case "motorcycle":
                return new Motorcycle();
            default:
                throw new Error("Unknown vehicle type");
        }
    }
}

const car = VehicleFactory.createVehicle("car");
car.start();
```

### 12.2 单例模式
```typescript
class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connected: boolean = false;
    
    private constructor() {
        // 私有构造函数防止外部实例化
    }
    
    static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    
    connect(): void {
        if (!this.connected) {
            this.connected = true;
            console.log("Database connected");
        }
    }
    
    disconnect(): void {
        if (this.connected) {
            this.connected = false;
            console.log("Database disconnected");
        }
    }
}

const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true，同一个实例
```

### 12.3 建造者模式
```typescript
class HttpRequest {
    private url: string = "";
    private method: string = "GET";
    private headers: Record<string, string> = {};
    private body?: string;
    
    setUrl(url: string): this {
        this.url = url;
        return this;
    }
    
    setMethod(method: string): this {
        this.method = method;
        return this;
    }
    
    setHeader(key: string, value: string): this {
        this.headers[key] = value;
        return this;
    }
    
    setBody(body: string): this {
        this.body = body;
        return this;
    }
    
    build(): RequestConfig {
        return {
            url: this.url,
            method: this.method,
            headers: this.headers,
            body: this.body
        };
    }
}

interface RequestConfig {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
}

// 使用建造者模式
const request = new HttpRequest()
    .setUrl("https://api.example.com/users")
    .setMethod("POST")
    .setHeader("Content-Type", "application/json")
    .setHeader("Authorization", "Bearer token")
    .setBody(JSON.stringify({ name: "John" }))
    .build();

console.log(request);
```

## 总结

TypeScript 的 class 提供了强大的面向对象编程能力：

1. **访问修饰符**：合理使用 public、private、protected 控制成员访问
2. **抽象类**：定义通用结构，强制子类实现特定方法
3. **接口实现**：确保类符合特定契约
4. **继承机制**：实现代码复用和多态
5. **静态成员**：提供类级别的属性和方法
6. **参数属性**：简化构造函数代码
7. **访问器**：控制属性的读写行为

### 🎯 学习建议：

1. **从基础开始**：先掌握基本的类语法和实例创建
2. **理解封装**：学会使用访问修饰符控制成员可见性
3. **实践继承**：通过实例理解父类与子类的关系
4. **掌握多态**：了解抽象类和接口的使用场景
5. **注意细节**：特别关注 this 指向和内存管理

### 🔥 常见陷阱：

1. **this 指向丢失**：方法赋值给变量时要注意 this 绑定
2. **属性未声明**：TypeScript 要求属性必须先声明
3. **静态与实例混淆**：明确区分静态成员和实例成员
4. **过度使用 public**：遵循最小权限原则
5. **忘记实现抽象方法**：子类必须实现父类的所有抽象方法

掌握这些概念能帮助你编写更加健壮、可维护的 TypeScript 代码。记住，面向对象编程的核心是封装、继承和多态，TypeScript 的类系统为这些概念提供了强大的语法支持。
