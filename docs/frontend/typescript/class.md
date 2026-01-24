# TypeScript 类 (Class) 详解

## 概述

**类 (Class)** 是 TypeScript 和现代 JavaScript (ES2015+) 中一个核心的面向对象编程概念。根据 ECMAScript 2015 (ES6) 规范，类是创建对象的模板，它们封装数据和操作数据的代码。TypeScript 在 ECMAScript 类规范的基础上，提供了完整的类型系统支持、访问控制修饰符、抽象类等高级特性。

### ES 标准中的类定义

根据 **ECMAScript® 2026 Language Specification**，类实际上是一种特殊的函数。如 MDN 文档所述：
> "Classes are a template for creating objects. They encapsulate data with code to work on that data. Classes in JS are built on prototypes but also have some syntax and semantics that are unique to classes."

### TypeScript 的增强

TypeScript 官方文档指出，类为面向对象编程提供了强大的支持，扩展了 JavaScript 类的功能：
- **类型注解系统**：为类成员提供静态类型检查
- **访问修饰符**：public、private、protected 控制成员访问
- **抽象类**：定义不能直接实例化的基类
- **接口实现**：确保类符合特定契约
- **装饰器支持**：元编程能力（实验性）

### ES 类的关键特性

根据 ECMAScript 规范，类具有以下重要特性：

1. **严格模式执行**：类体始终在严格模式下执行
2. **时序死区**：类声明具有与 `let` 和 `const` 相同的时序死区限制
3. **不被提升**：类声明不会被提升，必须在使用前声明
4. **构造函数唯一性**：每个类只能有一个构造函数方法

### 类元素分类

根据 MDN 文档，类元素可以通过三个维度来分类：
- **种类 (Kind)**：Getter、Setter、方法或字段
- **位置 (Location)**：静态或实例
- **可见性 (Visibility)**：公共或私有

> **权威参考**：
> - [ECMAScript® 2026 Language Specification - Class Definitions](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-class-definitions)
> - [MDN Classes 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
> - [TypeScript 官方手册 - Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)

## 1. 基础类语法

### 1.1 类的定义

类可以通过两种方式定义：**类声明 (Class Declaration)** 和**类表达式 (Class Expression)**。

```typescript
// 类声明
class Point {
  x: number;
  y: number;
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

// 类表达式 - 匿名类
const Rectangle = class {
  constructor(public width: number, public height: number) {}
};

// 类表达式 - 具名类
const Circle = class Circle2 {
  constructor(public radius: number) {}
};
```

**重要概念**：
- 类具有 **临时死区 (Temporal Dead Zone)** 限制，类似于 `let` 或 `const`
- 类体中的代码始终在 **严格模式** 下执行，即使没有 `"use strict"` 指令
- 类不会被提升 (hoisted)，必须在使用前声明

### 1.2 类体结构

根据 ECMAScript 规范，类元素可以通过三个方面来分类：

1. **种类 (Kind)**：Getter、Setter、方法或字段
2. **位置 (Location)**：静态或实例
3. **可见性 (Visibility)**：公共或私有

```typescript
class ExampleClass {
  // 公共实例字段
  public instanceField = "instance";
  
  // 私有实例字段  
  #privateField = "private";
  
  // 静态公共字段
  static staticField = "static";
  
  // 静态私有字段
  static #privateStaticField = "private static";
  
  // 构造函数
  constructor(value: string) {
    this.instanceField = value;
  }
  
  // 公共实例方法
  public instanceMethod() {
    return this.#privateField;
  }
  
  // 私有实例方法
  #privateMethod() {
    return "private method";
  }
  
  // 静态方法
  static staticMethod() {
    return ExampleClass.staticField;
  }
  
  // Getter
  get value() {
    return this.instanceField;
  }
  
  // Setter
  set value(newValue: string) {
    this.instanceField = newValue;
  }
  
  // 静态初始化块
  static {
    console.log("类初始化时执行");
    ExampleClass.staticField = "初始化后的值";
  }
}
```

## 2. 属性声明与初始化

### 2.1 字段声明

根据 TypeScript 官方文档，字段声明在类上创建公共可写属性。ECMAScript 规范定义了**公共类字段 (Public Class Fields)** 的行为，这些字段是可写、可枚举和可配置的属性。

```typescript
class Point {
  x: number;  // 类型注解可选，未指定时为隐式 any
  y: number;
  
  // 字段可以有初始化器，类实例化时自动运行
  z: number = 0;
  
  // 计算字段名
  ['computed' + 'Field'] = 42;
}

const pt = new Point();
pt.x = 0;  // ✅ 正确
pt.y = 0;  // ✅ 正确
console.log(pt.z);  // 0
```

### 2.2 字段初始化的 ECMAScript 语义

根据 **ECMAScript® 2026 Language Specification**，字段使用 `[[DefineOwnProperty]]` 语义添加。这意味着：

1. **字段初始化器同步执行**：不能在初始化表达式中使用 `await` 或 `yield`
2. **每次实例创建时都会重新求值**：初始化表达式对每个实例都是独立的
3. **可以访问 `this`**：在初始化器中 `this` 指向正在构造的实例

```typescript
class C {
  // 每个实例都有独立的对象
  obj = {};
  
  // 可以在初始化器中访问 this
  name = this.constructor.name;
  
  // 计算字段名只在类定义时求值一次
  [Math.random()] = "random field";
}

const instance1 = new C();
const instance2 = new C();
console.log(instance1.obj === instance2.obj); // false - 每个实例有独立对象
```

### 2.3 严格属性初始化检查

TypeScript 的 `--strictPropertyInitialization` 标志确保类属性在构造函数中被明确初始化：

```typescript
// ❌ 错误：启用严格属性初始化时
class BadGreeter {
  name: string;  // Property 'name' has no initializer and is not definitely assigned in the constructor
}

// ✅ 正确：在构造函数中初始化
class GoodGreeter {
  name: string;
  
  constructor() {
    this.name = "hello";
  }
}

// ✅ 正确：使用明确赋值断言操作符
class OKGreeter {
  name!: string;  // 明确赋值断言，告诉 TypeScript 这个字段会被初始化
}

// ✅ 正确：使用初始化器
class InitializedGreeter {
  name: string = "default";
}
```

### 2.4 字段初始化时机和顺序

根据 ECMAScript 规范，**类求值顺序** 如下：

1. `extends` 子句（如果存在）首先被求值
2. 构造函数方法被提取
3. 类元素的属性键按声明顺序求值
4. 方法和访问器按声明顺序安装
5. 类被初始化
6. 类元素的值按声明顺序求值：
   - **实例字段**：在实例创建时求值（基类在构造函数开始时，派生类在 `super()` 返回后）
   - **静态字段**：在类求值时立即求值

```typescript
class Base {
  name = "base";
  
  constructor() {
    console.log("Base constructor: " + this.name);  // 输出 "Base constructor: base"
  }
}

class Derived extends Base {
  name = "derived";  // 这个初始化在 super() 返回之后
  
  constructor() {
    super();  // 调用基类构造函数
    console.log("Derived constructor: " + this.name);  // 输出 "Derived constructor: derived"
  }
}

const d = new Derived();
// 输出：
// Base constructor: base
// Derived constructor: derived
```

### 2.5 字段初始化与 Setter 的区别

根据 ECMAScript 规范，字段声明使用 `[[DefineOwnProperty]]` 而不是赋值语义，这意味着它们不会触发 setter：

```typescript
class Base {
  set field(val: string) {
    console.log("Setter called with:", val);
  }
}

// 使用字段声明 - 不会调用 setter
class DerivedWithField extends Base {
  field = "field value";  // 不会触发 Base 的 setter
}

// 使用构造函数赋值 - 会调用 setter
class DerivedWithConstructor extends Base {
  constructor() {
    super();
    this.field = "field value";  // 会触发 Base 的 setter
  }
}

const withField = new DerivedWithField();     // 无输出
const withConstructor = new DerivedWithConstructor(); // 输出: Setter called with: field value
```

**注意**：字段初始化器可以引用其上方的字段值，但不能引用下方的：

```typescript
class C {
  a = 1;
  b = this.c;     // undefined，因为 c 还未初始化
  c = this.a + 1; // 2
  d = this.c + 1; // 3
}

const instance = new C();
console.log(instance.d); // 3
console.log(instance.b); // undefined
```

> **权威参考**：
> - [ECMAScript® 2026 - Public class fields](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#prod-FieldDefinition)
> - [MDN - Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)

## 3. 访问控制修饰符

TypeScript 提供了三种访问控制修饰符，这是对 ECMAScript 类规范的扩展：

### 3.1 public (公共)

```typescript
class Greeter {
  public greet() {  // public 是默认的，可以省略
    console.log("hi!");
  }
}

const g = new Greeter();
g.greet();  // ✅ 可以访问
```

### 3.2 protected (受保护)

`protected` 成员只在声明它们的类及其子类中可见：

```typescript
class Greeter {
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // ✅ 可以在子类中访问 protected 成员
    console.log("Howdy, " + this.getName());
  }
}

const g = new SpecialGreeter();
g.greet();      // ✅ 正确
g.getName();    // ❌ 错误：protected 成员不能在类外访问
```

**跨层次结构访问限制**：

```typescript
class Base {
  protected x: number = 1;
}

class Derived1 extends Base {
  protected x: number = 5;
}

class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;  // ✅ 正确：同一类的不同实例
  }
  
  f2(other: Derived1) {
    other.x = 10;  // ❌ 错误：不能访问兄弟类的 protected 成员
  }
}
```

### 3.3 private (私有)

`private` 成员只能在声明它们的类内部访问：

```typescript
class Base {
  private x = 0;
}

const b = new Base();
console.log(b.x);  // ❌ 错误：不能从类外部访问

class Derived extends Base {
  showX() {
    console.log(this.x);  // ❌ 错误：子类也不能访问父类的 private 成员
  }
}
```

**TypeScript private vs JavaScript 私有字段**：

```typescript
// TypeScript private（软私有）
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();
console.log(s.secretKey);      // ❌ 类型检查错误
console.log(s["secretKey"]);   // ✅ 运行时可以访问（绕过类型检查）

// JavaScript 私有字段（硬私有）
class Dog {
  #barkAmount = 0;  // 真正的私有字段
  personality = "happy";
}

const dog = new Dog();
console.log(dog.#barkAmount);  // ❌ 语法错误，运行时也无法访问
```

### 3.4 readonly 修饰符

`readonly` 防止在构造函数外对字段进行赋值：

```typescript
class Greeter {
  readonly name: string = "world";
  
  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;  // ✅ 构造函数中可以赋值
    }
  }
  
  err() {
    this.name = "not ok";  // ❌ 错误：不能赋值给只读属性
  }
}
```

## 4. 构造函数

### 4.1 构造函数基础

构造函数是用于创建和初始化类实例的特殊方法：

```typescript
class Point {
  x: number;
  y: number;
  
  // 带默认值的构造函数
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

// 构造函数重载
class Point3D {
  x: number;
  y: number;
  z: number;
  
  constructor(x: number, y: number, z: number);
  constructor(coords: string);
  constructor(xOrCoords: string | number, y: number = 0, z: number = 0) {
    if (typeof xOrCoords === 'string') {
      // 解析坐标字符串的逻辑
      const [x, y, z] = xOrCoords.split(',').map(Number);
      this.x = x; this.y = y; this.z = z;
    } else {
      this.x = xOrCoords;
      this.y = y;
      this.z = z;
    }
  }
}
```

### 4.2 构造函数的限制

- 构造函数不能有类型参数（这些属于外部类声明）
- 构造函数不能有返回类型注解（总是返回类实例类型）

### 4.3 Super 调用

在继承中，派生类必须在使用 `this` 之前调用 `super()`：

```typescript
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    console.log(this.k);  // ❌ 错误：必须先调用 super()
    super();
  }
}
```

### 4.4 参数属性

TypeScript 提供了特殊语法，将构造函数参数转换为同名的类属性：

```typescript
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // 不需要额外的代码，TypeScript 自动创建属性
  }
}

const a = new Params(1, 2, 3);
console.log(a.x);  // 1
console.log(a.z);  // ❌ 错误：private 属性不可访问
```

## 5. 静态成员

### 5.1 静态属性和方法

根据 **ECMAScript 规范** 和 **MDN 文档**，静态成员定义在类本身上，而不是每个实例上。静态属性和方法在类求值时被添加到类构造函数，并且所有实例共享：

```typescript
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}

console.log(MyClass.x);  // 0
MyClass.printX();        // 0

// 实例无法直接访问静态成员
const instance = new MyClass();
console.log(instance.x);     // undefined
console.log(instance.printX); // undefined
```

### 5.2 静态成员的继承

根据 ECMAScript 规范，静态成员会被继承，子类可以访问父类的静态成员：

```typescript
class Base {
  static getGreeting() {
    return "Hello world";
  }
}

class Derived extends Base {
  myGreeting = Derived.getGreeting();  // "Hello world"
}

// 子类可以调用父类的静态方法
console.log(Derived.getGreeting()); // "Hello world"
```

### 5.3 静态成员中的 this

在静态方法中，`this` 指向类构造函数本身：

```typescript
class MyClass {
  static name = "MyClass";
  
  static getName() {
    return this.name;  // this 指向 MyClass 构造函数
  }
  
  static create() {
    return new this();  // 创建当前类的实例
  }
}

console.log(MyClass.getName()); // "MyClass"

class Extended extends MyClass {
  static name = "Extended";
}

console.log(Extended.getName()); // "Extended" - this 指向 Extended
const instance = Extended.create(); // 创建 Extended 的实例
```

### 5.4 特殊静态名称限制

某些静态名称不能使用，因为它们与 `Function` 原型的属性冲突：

```typescript
class S {
  static name = "S!";    // ❌ 错误：与 Function.name 冲突
  static length = 42;    // ❌ 错误：与 Function.length 冲突
  static call = () => {}; // ❌ 错误：与 Function.call 冲突
  
  // ✅ 这些名称可以使用
  static myName = "S!";
  static size = 42;
  static invoke = () => {};
}
```

### 5.5 静态初始化块

**ES2022** 引入的**静态初始化块** (Static Initialization Blocks) 允许复杂的静态初始化逻辑：

```typescript
class Foo {
  static #count = 0;
  static #instances: Foo[] = [];
  
  get count() {
    return Foo.#count;
  }
  
  // 静态初始化块
  static {
    console.log("类正在初始化");
    try {
      const lastInstances = this.loadLastInstances();
      Foo.#count += lastInstances.length;
      Foo.#instances.push(...lastInstances);
    } catch (error) {
      console.error("初始化失败:", error);
      Foo.#count = 0;
    }
  }
  
  // 多个静态初始化块
  static {
    console.log("第二个初始化块");
    // 可以访问前面声明的静态字段
    console.log("当前计数:", Foo.#count);
  }
  
  private static loadLastInstances(): Foo[] {
    // 模拟从存储加载实例
    return [];
  }
}
```

### 5.6 静态初始化块的特性

根据 **ECMAScript® 2026 Language Specification**，静态初始化块具有以下特性：

1. **执行时机**：在类求值期间执行
2. **访问权限**：可以访问私有静态字段和方法
3. **作用域**：块内声明的变量具有块级作用域
4. **执行顺序**：与静态字段初始化器按声明顺序交替执行
5. **this 绑定**：`this` 指向类构造函数
6. **异常处理**：初始化块中的异常会阻止类的完全初始化

```typescript
class ComplexInitialization {
  static field1 = console.log("field1 初始化");
  
  static {
    console.log("第一个静态块");
    // 可以访问私有成员
    this.#privateSetup();
  }
  
  static field2 = console.log("field2 初始化");
  
  static {
    console.log("第二个静态块");
    // 块内变量作用域
    const temp = "临时变量";
    console.log(temp);
  }
  
  static #privateSetup() {
    console.log("私有初始化方法");
  }
}

// 输出顺序：
// "field1 初始化"
// "第一个静态块"
// "私有初始化方法"
// "field2 初始化"
// "第二个静态块"
// "临时变量"
```

### 5.7 静态块中的变量提升

在静态块中，`var` 声明会被提升到块的顶部，但不会提升到块外：

```typescript
var y = "外部变量";

class A {
  static field = "静态字段";
  
  static {
    console.log(y); // undefined（不是 "外部变量"）
    var y = this.field; // var 被提升到块顶部
  }
}

console.log(y); // "外部变量"（静态块内的 y 不影响外部）
```

### 5.8 静态字段与方法的初始化顺序

根据 ECMAScript 规范，静态成员的初始化遵循严格的顺序：

```typescript
class InitializationOrder {
  // 1. 静态字段按声明顺序初始化
  static a = console.log("静态字段 a");
  
  // 2. 静态块按声明顺序执行
  static {
    console.log("静态块 1");
  }
  
  static b = console.log("静态字段 b");
  
  static {
    console.log("静态块 2");
  }
  
  // 3. 静态方法在所有字段和块之前就被添加
  static method() {
    console.log("静态方法（可以在初始化期间调用）");
  }
  
  static {
    this.method(); // 可以调用静态方法
  }
}

// 输出：
// "静态字段 a"
// "静态块 1"
// "静态字段 b"
// "静态块 2"
// "静态方法（可以在初始化期间调用）"
```

### 5.9 静态成员的 TypeScript 类型

TypeScript 为静态成员提供了强类型支持：

```typescript
class StaticTyped {
  static readonly VERSION: string = "1.0.0";
  static instances: StaticTyped[] = [];
  
  static create<T extends StaticTyped>(this: new() => T): T {
    const instance = new this();
    StaticTyped.instances.push(instance);
    return instance;
  }
  
  static getInstanceCount(): number {
    return this.instances.length;
  }
}

class Extended extends StaticTyped {}

const instance1 = StaticTyped.create();  // 类型: StaticTyped
const instance2 = Extended.create();     // 类型: Extended
```

> **权威参考**：
> - [ECMAScript® 2026 - Static initialization blocks](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#prod-ClassStaticBlock)
> - [MDN - Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
> - [MDN - static](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)

## 6. 方法

### 6.1 方法定义

类方法可以使用与函数和构造函数相同的类型注解：

```typescript
class Point {
  x = 10;
  y = 10;
  
  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
  
  // 异步方法
  async loadData(): Promise<string> {
    return "data loaded";
  }
  
  // 生成器方法
  *getSides() {
    yield this.x;
    yield this.y;
    yield this.x;
    yield this.y;
  }
}
```

### 6.2 方法中的 this

在方法体内，必须通过 `this` 访问字段和其他方法：

```typescript
let x: number = 0;

class C {
  x: string = "hello";
  
  m() {
    x = "world";        // ❌ 修改的是全局变量，不是类属性
    this.x = "world";   // ✅ 正确：修改类属性
  }
}
```

### 6.3 访问器 (Getters/Setters)

TypeScript 对访问器有特殊的推断规则：

```typescript
class C {
  _length = 0;
  
  get length() {
    return this._length;
  }
  
  set length(value) {  // 类型从 getter 推断
    this._length = value;
  }
}

// TypeScript 4.3+ 支持不同的 getter/setter 类型
class Thing {
  _size = 0;
  
  get size(): number {
    return this._size;
  }
  
  set size(value: string | number | boolean) {
    let num = Number(value);
    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }
    this._size = num;
  }
}
```

**访问器推断规则**：
- 如果只有 `get` 没有 `set`，属性自动为 `readonly`
- 如果 setter 参数类型未指定，从 getter 返回类型推断

## 7. 私有字段 (Private Fields)

### 7.1 私有字段基础

根据 **ECMAScript 规范**，私有字段使用 `#` 前缀声明，提供真正的封装。这是一个 JavaScript 原生特性，不仅仅是 TypeScript 的类型检查。私有字段的隐私封装由 JavaScript 引擎本身强制执行。

```typescript
class ClassWithPrivate {
  #privateField: string;
  #privateFieldWithInitializer = 42;
  
  #privateMethod() {
    return "private";
  }
  
  static #privateStaticField = "static private";
  
  static #privateStaticMethod() {
    return "private static method";
  }
  
  constructor(value: string) {
    this.#privateField = value;
  }
  
  public getPrivate() {
    return this.#privateField;
  }
}
```

### 7.2 私有字段的语法限制

根据 **ECMAScript® 2026 Language Specification**，私有字段有以下语法限制：

1. **所有私有标识符必须在类中唯一**：静态和实例属性共享同一命名空间
2. **私有标识符不能是 `#constructor`**
3. **必须在使用前声明**：不能引用未声明的私有属性
4. **不能使用 `delete` 删除**：尝试删除会导致语法错误

```typescript
class ClassWithPrivateField {
  #privateField: string;
  
  constructor() {
    delete this.#privateField;    // ❌ 语法错误
    this.#undeclaredField = 42;   // ❌ 语法错误：未声明的私有字段
  }
}

const instance = new ClassWithPrivateField();
instance.#privateField;  // ❌ 语法错误：不能从类外部访问
```

### 7.3 私有字段的运行时行为

与 TypeScript 的 `private` 修饰符不同，JavaScript 私有字段提供**硬隐私**：

```typescript
class MySafe {
  private secretKey = 12345;   // TypeScript private（软隐私）
  #realSecret = 67890;         // JavaScript private（硬隐私）
}

const s = new MySafe();

// TypeScript private 可以在运行时绕过
console.log(s.secretKey);        // ❌ 类型检查错误
console.log(s["secretKey"]);     // ✅ 运行时可以访问 (12345)

// JavaScript private 无法绕过
console.log(s.#realSecret);      // ❌ 语法错误
console.log(s["#realSecret"]);   // ❌ 无法访问 (undefined)
```

### 7.4 私有字段的访问检查

可以使用 `in` 操作符检查对象是否具有私有字段（ES2022 特性）：

```typescript
class C {
  #x: number;
  
  constructor(x: number) {
    this.#x = x;
  }
  
  static getX(obj: unknown) {
    if (#x in obj) {
      return obj.#x;  // 类型安全的访问
    }
    return "obj must be an instance of C";
  }
}

console.log(C.getX(new C(42)));  // 42
console.log(C.getX({}));         // "obj must be an instance of C"
```

### 7.5 私有字段的继承行为

根据 MDN 文档，私有字段不参与原型继承模型：

```typescript
class Base {
  #basePrivate = "base private";
  
  getBasePrivate() {
    return this.#basePrivate;
  }
}

class Derived extends Base {
  #derivedPrivate = "derived private";
  
  // ❌ 不能访问父类的私有字段
  tryAccessBasePrivate() {
    return this.#basePrivate;  // 语法错误
  }
  
  // ✅ 但可以通过公共方法访问
  accessBasePrivateCorrectly() {
    return this.getBasePrivate();
  }
}
```

### 7.6 私有静态字段的特殊限制

私有静态字段只能被定义它们的确切类访问，子类无法访问：

```typescript
class ClassWithPrivateStaticField {
  static #privateStaticField = 42;
  
  static publicStaticMethod() {
    return this.#privateStaticField;  // ❌ 在继承中可能出错
  }
  
  // ✅ 推荐的做法：使用类名直接访问
  static safePublicStaticMethod() {
    return ClassWithPrivateStaticField.#privateStaticField;
  }
}

class Subclass extends ClassWithPrivateStaticField {}

// ❌ TypeError: Cannot read private member #privateStaticField from an object whose class did not declare it
Subclass.publicStaticMethod();

// ✅ 正常工作
Subclass.safePublicStaticMethod();
```

### 7.7 私有字段的内存和性能考虑

根据引擎实现，私有字段通常比公共字段有更好的性能特性：

1. **真正的封装**：避免了属性查找的原型链遍历
2. **优化友好**：引擎可以更好地优化私有字段的访问
3. **WeakMap 实现**：部分引擎使用 WeakMap 来实现私有字段

### 7.8 私有字段与 WeakMap 的比较

在私有字段出现之前，开发者常用 WeakMap 模拟私有属性：

```typescript
// 传统 WeakMap 方法
const privateFields = new WeakMap();

class OldStylePrivate {
  constructor(value: string) {
    privateFields.set(this, { secret: value });
  }
  
  getSecret() {
    return privateFields.get(this)?.secret;
  }
}

// 现代私有字段方法（推荐）
class ModernPrivate {
  #secret: string;
  
  constructor(value: string) {
    this.#secret = value;
  }
  
  getSecret() {
    return this.#secret;
  }
}
```

**私有字段的优势**：
- ✅ 语法更简洁直观
- ✅ 性能更好
- ✅ 调试器支持更好
- ✅ TypeScript 原生支持

> **权威参考**：
> - [ECMAScript® 2026 - Private properties](https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-PrivateIdentifier)
> - [MDN - Private properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
> - [TC39 Private fields proposal](https://github.com/tc39/proposal-class-fields)

## 8. 继承

### 8.1 extends 子句

类可以从基类继承：

```typescript
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
d.move();   // 继承的方法
d.woof(3);  // 自己的方法
```

### 8.2 方法重写

派生类可以重写基类的方法：

```typescript
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {  // 重写时可以更具体
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

// 通过基类引用使用派生类实例
const b: Base = new Derived();
b.greet();  // 调用派生类的方法
```

**里氏替换原则**：派生类必须是基类的子类型：

```typescript
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name: string) {  // ❌ 错误：使参数变为必需的违反了基类契约
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

### 8.3 仅类型字段声明

当 `target >= ES2022` 或 `useDefineForClassFields` 为 `true` 时，需要使用 `declare` 进行仅类型的字段声明：

```typescript
interface Animal {
  dateOfBirth: any;
}

interface Dog extends Animal {
  breed: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // 不生成 JavaScript 代码，仅确保类型正确
  declare resident: Dog;
  
  constructor(dog: Dog) {
    super(dog);
  }
}
```

### 8.4 继承内置类型

继承 `Array`、`Error` 等内置类型时可能遇到问题：

```typescript
class MsgError extends Error {
  constructor(m: string) {
    super(m);
    
    // 手动设置原型以确保继承正常工作
    Object.setPrototypeOf(this, MsgError.prototype);
  }
  
  sayHello() {
    return "hello " + this.message;
  }
}
```

## 9. 接口实现

### 9.1 implements 子句

类可以实现接口以确保符合特定契约：

```typescript
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  // ❌ 错误：缺少 ping 方法
  pong() {
    console.log("pong!");
  }
}
```

### 9.2 多接口实现

```typescript
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Duck implements Flyable, Swimmable {
  fly() {
    console.log("Duck flying");
  }
  
  swim() {
    console.log("Duck swimming");
  }
}
```

### 9.3 implements 的注意事项

`implements` 子句只是检查，不会改变类的类型：

```typescript
interface Checkable {
  check(name: string): boolean;
}

class NameChecker implements Checkable {
  check(s) {  // ❌ 参数 's' 隐式具有 'any' 类型
    return s.toLowerCase() === "ok";
  }
}
```

## 10. 抽象类 (Abstract Class)

### 10.1 抽象类基础

抽象类不能直接实例化，用作其他类的基类：

```typescript
abstract class Shape {
  // 抽象方法：子类必须实现
  abstract getArea(): number;
  
  // 具体方法：子类可以继承使用
  printArea() {
    console.log("Area: " + this.getArea());
  }
}

const shape = new Shape();  // ❌ 错误：不能实例化抽象类
```

### 10.2 抽象类实现

```typescript
class Rectangle extends Shape {
  constructor(public width: number, public height: number) {
    super();
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }
  
  getArea() {
    return Math.PI * this.radius ** 2;
  }
}

const rect = new Rectangle(10, 20);
rect.printArea();  // Area: 200

const circle = new Circle(5);
circle.printArea();  // Area: 78.54
```

### 10.3 抽象构造签名

有时需要接受派生自抽象类的类构造函数：

```typescript
abstract class Base {
  abstract getName(): string;
  printName() {
    console.log("Hello, " + this.getName());
  }
}

// ❌ 错误的方式
function greet(ctor: typeof Base) {
  const instance = new ctor();  // 不能实例化抽象类
  instance.printName();
}

// ✅ 正确的方式：使用构造签名
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}

class Derived extends Base {
  getName() {
    return "world";
  }
}

greet(Derived);  // ✅ 正确
greet(Base);     // ❌ 错误：不能传递抽象类构造函数
```

## 11. 高级类型特性

### 11.1 泛型类

类可以像接口一样是泛型的：

```typescript
class Box<Type> {
  contents: Type;
  
  constructor(value: Type) {
    this.contents = value;
  }
  
  getValue(): Type {
    return this.contents;
  }
}

const b = new Box("hello!");  // Box<string>
const numberBox = new Box<number>(42);

// 泛型约束和默认值
class Container<T extends string | number = string> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
}
```

### 11.2 静态成员中的类型参数限制

```typescript
class Box<Type> {
  static defaultValue: Type;  // ❌ 错误：静态成员不能引用类型参数
}

// 原因：运行时只有一个 Box.defaultValue 属性槽
// 设置 Box<string>.defaultValue 也会改变 Box<number>.defaultValue
```

### 11.3 this 类型

在类中，特殊类型 `this` 动态引用当前类的类型：

```typescript
class Box {
  contents: string = "";
  
  set(value: string) {
    this.contents = value;
    return this;  // 返回类型是 this
  }
  
  sameAs(other: this) {
    return other.contents === this.contents;
  }
}

class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello");  // b 的类型是 ClearableBox
```

### 11.4 this-based 类型守卫

```typescript
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  
  constructor(public path: string, private networked: boolean) {}
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}

class Directory extends FileSystemObject {
  children: FileSystemObject[] = [];
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content;  // 类型缩窄为 FileRep
} else if (fso.isDirectory()) {
  fso.children; // 类型缩窄为 Directory
}
```

## 12. 运行时的 this 行为

### 12.1 this 绑定问题

JavaScript 中 `this` 的值取决于函数如何被调用：

```typescript
class MyClass {
  name = "MyClass";
  
  getName() {
    return this.name;
  }
}

const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};

console.log(obj.getName());  // "obj"，不是 "MyClass"
```

### 12.2 箭头函数解决方案

```typescript
class MyClass {
  name = "MyClass";
  
  getName = () => {
    return this.name;  // this 始终指向类实例
  };
}

const c = new MyClass();
const g = c.getName;
console.log(g());  // "MyClass"
```

**权衡**：
- ✅ 运行时 `this` 值保证正确
- ❌ 使用更多内存（每个实例都有自己的函数副本）
- ❌ 不能在派生类中使用 `super.getName`

### 12.3 this 参数

```typescript
class MyClass {
  name = "MyClass";
  
  getName(this: MyClass) {  // 显式 this 参数
    return this.name;
  }
}

const c = new MyClass();
c.getName();  // ✅ 正确

const g = c.getName;
console.log(g());  // ❌ 错误：this 上下文类型不匹配
```

## 13. 类表达式

类表达式类似于类声明，但不需要名称：

```typescript
const someClass = class<Type> {
  content: Type;
  
  constructor(value: Type) {
    this.content = value;
  }
};

const m = new someClass("Hello, world");  // someClass<string>
```

## 14. 类之间的关系

TypeScript 中的类大多数情况下是结构比较的：

```typescript
class Point1 {
  x = 0;
  y = 0;
}

class Point2 {
  x = 0;
  y = 0;
}

const p: Point1 = new Point2();  // ✅ 正确：结构相同

// 子类型关系，即使没有显式继承
class Person {
  name: string;
  age: number;
}

class Employee {
  name: string;
  age: number;
  salary: number;
}

const p: Person = new Employee();  // ✅ 正确：Employee 是 Person 的超类型
```

**空类的特殊情况**：

```typescript
class Empty {}

function fn(x: Empty) {
  // 不能对 x 做任何操作
}

// 以下都是正确的！
fn(window);
fn({});
fn(fn);
```

## 15. 最佳实践

### 15.1 类设计原则

1. **单一职责原则**：每个类应该只有一个改变的理由
2. **开闭原则**：对扩展开放，对修改关闭
3. **里氏替换原则**：子类必须能够替换其基类
4. **接口隔离原则**：不应该强迫类依赖它们不使用的接口
5. **依赖倒置原则**：依赖抽象，不依赖具体

### 15.2 性能考虑

```typescript
class OptimizedClass {
  // ✅ 使用字段声明而不是构造函数赋值（在某些情况下更快）
  name: string = "";
  
  // ✅ 将不变的方法定义为方法，而不是箭头函数属性
  getName() {
    return this.name;
  }
  
  // ✅ 只在需要保持 this 绑定时使用箭头函数
  getNameBound = () => {
    return this.name;
  }
}
```

### 15.3 类型安全建议

```typescript
class SafeClass {
  // ✅ 显式类型注解
  private _count: number = 0;
  
  // ✅ 使用 readonly 防止意外修改
  readonly id: string;
  
  // ✅ 使用私有字段实现真正的封装
  #internalState: string = "";
  
  constructor(id: string) {
    this.id = id;
  }
  
  // ✅ 使用明确的返回类型
  getCount(): number {
    return this._count;
  }
  
  // ✅ 使用类型守卫
  isValidState(): this is SafeClass & { _count: number } {
    return this._count >= 0;
  }
}
```

### 15.4 测试友好的设计

```typescript
class TestableClass {
  constructor(
    private readonly service: DataService,  // 依赖注入
    private readonly logger: Logger = new ConsoleLogger()
  ) {}
  
  // 可测试的公共方法
  async processData(data: InputData): Promise<OutputData> {
    try {
      this.logger.log('Processing data');
      return await this.service.transform(data);
    } catch (error) {
      this.logger.error('Processing failed', error);
      throw error;
    }
  }
  
  // 暴露内部状态用于测试（如果需要）
  _getInternalState() {
    return {
      service: this.service,
      logger: this.logger
    };
  }
}
```

## 16. 常见错误与解决方案

### 16.1 常见类型错误

```typescript
// ❌ 错误：忘记类型注解
class BadExample {
  value;  // 隐式 any
  
  constructor(val) {  // 隐式 any
    this.value = val;
  }
}

// ✅ 正确：明确类型
class GoodExample {
  value: number;
  
  constructor(val: number) {
    this.value = val;
  }
}

// ❌ 错误：静态成员引用实例类型
class BadGeneric<T> {
  static defaultValue: T;  // 错误
}

// ✅ 正确：静态成员使用具体类型
class GoodGeneric<T> {
  static defaultValue: any = null;
  instanceValue: T;
  
  constructor(value: T) {
    this.instanceValue = value;
  }
}
```

### 16.2 this 相关问题

```typescript
// ❌ 错误：this 绑定丢失
class EventHandler {
  message = "Hello";
  
  handleClick() {
    console.log(this.message);  // 可能是 undefined
  }
}

const handler = new EventHandler();
button.addEventListener('click', handler.handleClick);  // this 丢失

// ✅ 解决方案1：箭头函数
class EventHandler {
  message = "Hello";
  
  handleClick = () => {
    console.log(this.message);  // 始终正确
  }
}

// ✅ 解决方案2：bind
button.addEventListener('click', handler.handleClick.bind(handler));

// ✅ 解决方案3：包装函数
button.addEventListener('click', () => handler.handleClick());
```

## 17. 与其他语言的比较

### 17.1 与 Java/C# 的差异

```typescript
// TypeScript 类更接近 JavaScript 的原型继承
class TypeScriptClass {
  // 字段可以在类体中直接声明和初始化
  field: string = "default";
  
  // 不需要显式的访问修饰符声明（默认 public）
  method() {
    return this.field;
  }
}

// 与 Java/C# 不同，TypeScript 支持：
// - 鸭子类型（结构化类型）
// - 动态属性添加（在某些情况下）
// - 函数式编程特性
```

### 17.2 与 Python 的差异

```typescript
// TypeScript 有真正的私有成员，而 Python 只有约定
class TypeScriptPrivate {
  #reallyPrivate = "cannot access";  // 真正私有
  private _tsPrivate = "ts private";  // 编译时私有
}

// Python 风格（TypeScript 中不推荐）
class PythonStyle {
  _should_be_private = "by convention only";
}
```

## 18. 未来发展与实验性特性

### 18.1 装饰器 (Decorators)

```typescript
// 实验性特性，需要启用 experimentalDecorators
function LogMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with args:`, args);
    return method.apply(this, args);
  };
}

class ExampleWithDecorator {
  @LogMethod
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
```

### 18.2 Stage 3 提案特性

```typescript
// 私有字段的 in 操作符（已在现代浏览器中实现）
class FeatureDetection {
  #feature: boolean = true;
  
  static hasFeature(obj: unknown): obj is FeatureDetection {
    return #feature in obj;
  }
}
```

## 总结

TypeScript 类系统建立在 **ECMAScript 类规范** 的坚实基础之上，并在此基础上提供了强大的类型安全、访问控制和面向对象编程特性。本文详细探讨了从基础语法到高级特性的各个方面，参考了最新的官方文档和标准规范。

### ES 类标准的演进历程

1. **ES2015 (ES6)**：引入基本类语法
   - 类声明和类表达式
   - constructor、方法、getter/setter
   - extends 和 super
   - static 方法

2. **ES2017 (ES8)**：异步方法支持
   - async 方法和 async generator 方法

3. **ES2022 (ES13)**：现代类特性
   - 公共字段声明
   - 私有字段和方法 (#)
   - 静态字段
   - 静态初始化块
   - 私有字段的 in 操作符

4. **ES2024 及未来**：持续演进
   - 装饰器提案（Stage 3）
   - 自动访问器（auto-accessors）

### TypeScript 类型系统的核心价值

根据 **TypeScript 官方文档**，TypeScript 类系统的核心价值在于：

1. **静态类型检查**：在编译时发现错误
2. **更好的 IDE 支持**：自动完成、重构、导航
3. **文档化代码**：类型注解作为活文档
4. **渐进式采用**：可以逐步添加类型

### 关键设计原则

#### 1. 类型安全优先

```typescript
// ✅ 推荐：明确的类型注解
class SafeClass {
  private readonly id: string;
  private count: number = 0;
  
  constructor(id: string) {
    this.id = id;
  }
  
  increment(amount: number = 1): number {
    this.count += amount;
    return this.count;
  }
}

// ❌ 避免：隐式 any 类型
class UnsafeClass {
  value;  // 隐式 any
  
  method(param) {  // 隐式 any
    return param;
  }
}
```

#### 2. 封装与访问控制

根据面向对象设计原则，合理使用访问修饰符：

```typescript
class WellEncapsulated {
  // 公共接口
  public readonly version: string = "1.0.0";
  
  // 受保护成员（子类可访问）
  protected config: Config;
  
  // 私有实现细节（TypeScript 私有）
  private cache: Map<string, any> = new Map();
  
  // 真正私有（JavaScript 私有）
  #internalState: InternalState;
  
  constructor(config: Config) {
    this.config = config;
    this.#internalState = new InternalState();
  }
}
```

#### 3. 性能最佳实践

基于 ECMAScript 规范和引擎优化：

```typescript
class OptimizedClass {
  // ✅ 使用字段声明（V8 优化友好）
  name: string = "";
  
  // ✅ 不变方法使用方法声明
  getName(): string {
    return this.name;
  }
  
  // ✅ 只在需要绑定 this 时使用箭头函数
  private boundMethod = (): void => {
    // 需要保持 this 绑定的场景
  }
  
  // ✅ 使用私有字段而非 WeakMap
  #cache: Map<string, any> = new Map();
}
```

### ECMAScript 规范的核心概念

#### 1. 类求值顺序

根据 **ECMAScript® 2026 Language Specification**：

```typescript
class EvaluationOrder {
  // 1. 静态字段初始化器按顺序求值
  static staticField1 = console.log("静态字段1");
  
  // 2. 静态块按顺序执行
  static {
    console.log("静态块");
  }
  
  // 3. 实例字段在构造时求值
  instanceField = console.log("实例字段");
  
  constructor() {
    console.log("构造函数");
  }
}
```

#### 2. 私有字段的强封装

```typescript
class PrivateFieldsExample {
  #data: string;
  
  constructor(data: string) {
    this.#data = data;
  }
  
  // 使用 in 操作符进行类型守卫
  static hasData(obj: unknown): obj is PrivateFieldsExample {
    return #data in obj;
  }
}
```

### 现代开发最佳实践

#### 1. 依赖注入友好的设计

```typescript
interface Logger {
  log(message: string): void;
}

interface DataService {
  fetch(id: string): Promise<Data>;
}

class ModernService {
  constructor(
    private readonly logger: Logger,
    private readonly dataService: DataService
  ) {}
  
  async processData(id: string): Promise<Data> {
    this.logger.log(`Processing data for ${id}`);
    return await this.dataService.fetch(id);
  }
}
```

#### 2. 函数式与面向对象的结合

```typescript
class FunctionalOOP {
  private readonly processors: Array<(data: string) => string> = [];
  
  addProcessor(processor: (data: string) => string): this {
    this.processors.push(processor);
    return this;  // 流式接口
  }
  
  process(data: string): string {
    return this.processors.reduce((acc, processor) => processor(acc), data);
  }
}

// 使用示例
const processor = new FunctionalOOP()
  .addProcessor(s => s.trim())
  .addProcessor(s => s.toUpperCase())
  .addProcessor(s => `[${s}]`);
```

### TypeScript 编译器选项影响

重要的编译器选项对类行为的影响：

```json
{
  "compilerOptions": {
    "strict": true,                           // 启用所有严格检查
    "strictPropertyInitialization": true,    // 强制属性初始化
    "useDefineForClassFields": true,         // 使用 ES2022 字段语义
    "target": "ES2022",                      // 支持最新类特性
    "experimentalDecorators": true,          // 启用装饰器（如果需要）
    "emitDecoratorMetadata": true           // 生成装饰器元数据
  }
}
```

### 性能考量

#### 1. 实例创建成本

```typescript
// ❌ 每个实例都有自己的函数副本
class Expensive {
  method = () => {
    // 箭头函数作为字段
  }
}

// ✅ 所有实例共享方法
class Efficient {
  method() {
    // 原型方法
  }
  
  // 只在需要绑定时使用箭头函数
  boundMethod = () => {
    // 必须绑定 this 的场景
  }
}
```

#### 2. 内存使用优化

```typescript
class MemoryOptimized {
  // ✅ 使用私有字段（引擎优化）
  #cache?: Map<string, any>;
  
  // ✅ 延迟初始化
  private getCache(): Map<string, any> {
    if (!this.#cache) {
      this.#cache = new Map();
    }
    return this.#cache;
  }
}
```

### 未来发展方向

#### 1. 装饰器标准化

```typescript
// Stage 3 装饰器提案
class FutureClass {
  @logged
  @validate
  method(param: string): string {
    return param.toUpperCase();
  }
}
```

#### 2. 更强的类型推断

TypeScript 持续改进类型推断能力：

```typescript
class SmartInference {
  // 未来可能支持更智能的类型推断
  data = this.loadData(); // 自动推断返回类型
  
  private loadData() {
    return { name: "example", value: 42 };
  }
}
```

### 学习路径建议

1. **基础阶段**：
   - 掌握基本类语法和 TypeScript 类型系统
   - 理解访问修饰符和封装概念
   - 学习继承和多态

2. **进阶阶段**：
   - 深入 ECMAScript 类规范
   - 掌握私有字段和静态初始化块
   - 理解 this 绑定和性能优化

3. **高级阶段**：
   - 设计模式在 TypeScript 中的应用
   - 元编程和装饰器
   - 与其他技术栈的集成

### 重要资源链接

- **官方文档**：
  - [TypeScript 官方手册 - Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
  - [ECMAScript® 2026 Language Specification](https://tc39.es/ecma262/)
  - [MDN Classes 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

- **规范提案**：
  - [TC39 Class Fields Proposal](https://github.com/tc39/proposal-class-fields)
  - [TC39 Private Methods Proposal](https://github.com/tc39/proposal-private-methods)
  - [TC39 Static Class Features](https://github.com/tc39/proposal-static-class-features)

TypeScript 类系统将继续与 ECMAScript 标准同步发展，为开发者提供更强大、更安全的面向对象编程能力。掌握这些基础知识和最佳实践，将有助于编写更可维护、更高性能的 TypeScript 代码。
