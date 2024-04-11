### js 和 ts 的区别？ts 带来的好处有哪些？讲一下泛型、在什么业务场景下使用？

类型检查系统 js 弱类型 ts 强类型
编译 js 可直接在浏览器 ndoe 下执行 ts 需要转换为 js 才能执行

### ts 的基础类型有哪些？js 没有的数据类型 ts 有的数据类型是哪些？

`布尔类型 (boolean)`：表示逻辑值，可以是 true 或 false。

数字类型 (number)：表示数字，可以是整数或浮点数，也可以使用二进制、八进制、十进制或十六进制表示。

字符串类型 (string)：表示文本数据，可以使用单引号或双引号包裹字符串。

数组类型 (array)：表示一组相同类型的值的有序集合，可以使用类型 `+ `方括号的形式声明数组类型，也可以使用泛型 `Array<type> `表示数组类型。

元组类型 (tuple)：表示固定长度和固定类型的数组，元组中每个位置的类型是固定的，通常用于表示一个固定长度的数组。

枚举类型 (enum)：表示一组具有命名的常量集合，可以使用关键字 enum 声明。

任意类型 (any)：表示任意类型，可以赋予任何类型的值。

空类型 (void)：表示没有任何类型，通常用于标识函数没有返回值。

Null 和 Undefined：分别表示 null 和 undefined。

Never 类型：表示永远不会有返回值的类型。

对象类型 (object)：表示非原始类型的类型，即除了 number、string、boolean、symbol、null 或 undefined 之外的类型。

Unknown 类型：表示未知类型，类似于 any 类型，但更加安全，因为它不能赋值给其他类型。

联合类型 (Union Types)：表示一个值可以是多种类型中的一种，使用 | 分隔多个类型。

交叉类型 (Intersection Types)：表示将多个类型合并为一个新的类型，使用 & 运算符。

类型别名 (Type Aliases)：用于给一个类型起一个新的名字，可以使用 type 关键字定义类型别名。

字面量类型 (Literal Types)：表示一个具体的值，而不是一个变量，可以通过字面量来定义。

索引类型 (Index Types)：用于描述对象的属性和方法类型，包括字符串索引签名和数字索引签名。

映射类型 (Mapped Types)：通过映射已知的类型来创建新类型。

可选类型 (Optional Types)：表示可以有一个类型，也可以是 undefined。

只读类型 (Readonly Types)：表示只读属性或只读数组。

### ts 高级类型使用过哪些？

交叉类型（Intersection Types）：表示将多个类型合并为一个新类型。

```typescript
type A = { a: number }
type B = { b: string }
type C = A & B // { a: number, b: string }
```

联合类型（Union Types）：表示一个值可以是多种类型之一。

```typescript
type MyType = string | number
```

类型别名（Type Aliases）：给一个类型起一个新名字，可以更方便地引用复杂类型。

```typescript
type Age = number
type Person = {
  name: string
  age: Age
}
```

字面量类型（Literal Types）：表示一个具体的值。

```typescript
type Direction = 'left' | 'right' | 'up' | 'down'
```

映射类型（Mapped Types）：用于从一个旧类型生成一个新类型。

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```

索引类型（Index Types）：用于获取对象中属性的类型。

```typescript
type Person = {
  name: string
  age: number
}
type AgeType = Person['age'] // number
```

条件类型（Conditional Types）：根据类型关系选择不同的类型。

```typescript
type NonNullable<T> = T extends null | undefined ? never : T
```

显式赋值断言（Definite Assignment Assertion）：在变量声明时告诉编译器该变量一定会被赋值。

```typescript
let x!: number
```

可选链操作符（Optional Chaining Operator）：用于访问可能不存在的属性或方法，防止出现错误。

```typescript
const name = obj?.person?.name
```

空值合并运算符（Nullish Coalescing Operator）：用于提供默认值，当值为 null 或 undefined 时生效。

```typescript
const result = input ?? defaultValue
```

### ReturnType 怎么实现？

需要使用`extends`和`infer`关键字

```ts
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R
  ? R
  : any
```

### 说一下 extends infer？

`extends` 关键字用于检查一个类型是否满足某种条件。

```ts
T extends U ? X : Y
```

`infer` 关键字用于推断待定的类型。它的作用是从给定的类型中提取类型，并将提取的类型赋值给一个类型变量。infer 关键字通常与泛型结合使用，以提取类型并赋值给泛型参数。

```ts
type MyType<T> = T extends SomeType<infer U> ? U : DefaultType
```
