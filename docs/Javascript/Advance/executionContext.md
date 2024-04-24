# 理解 JavaScript 中的执行上下文和执行栈

### 定义

执行上下文：在运行 JavaScript 代码时由 JavaScript 引擎创建的一个环境。这个环境决定了代码在执行时变量如何被访问以及如何被求值。

### 执行上下文的生命周期

当我们调用一个函数时（激活），一个新的执行上下文就会被创建。

一个执行上下文的生命周期可分为 _创建阶段_ 和 _代码执行阶段_ 两个阶段。
![alt text](./img/image.png)

### 执行上下文的类型

- **全局执行上下文`GlobalExectionContext`**：只有一个，浏览器中的全局对象就是 indow 对象，`this`指向这个全局对象。
- **函数执行上下文`FunctionExectionContext`**:存在无数个，只有函数被调用的时候才会被创建，每次调用函数都会创建一个新的执行上下文。
- **Eval 函数执行上下文**：指的是运行在 eval 函数中的代码，很少用而且不建议使用。

```js

GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {    	  // 词法环境
    EnvironmentRecord: {   		// 环境记录
      Type: "Object",      		   // 全局环境
      // 标识符绑定在这里
      outer: <null>  	   		   // 对外部环境的引用
  }
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {  	  // 词法环境
    EnvironmentRecord: {  		// 环境记录
      Type: "Declarative",  	   // 函数环境
      // 标识符绑定在这里 			  // 对外部环境的引用
      outer: <Global or outer function environment reference>
  }
}
```

### 执行上下文的组成

- **变量对象（Varible Object VO）**:存储着上下文中所有的变量、函数声明以及函数参数。函数中的参数也被存储在变量对象中。对于函数执行上下文来说，变量对象也被称为活动对象（Activation Object，AO）。
- **作用域链（Scope Chain）**：每个执行上下文都有一个与之关联的作用域链，它是用于解析变量的一个对象列表。作用域链的前端是当前执行上下文的变量对象。当访问一个变量时，Js 引擎首先查找当前执行上下文的变量对象，如果找不到，就会沿着作用域链向上查找知道找到该变量或者到达全局执行上下文的变量对象。
- **this Bind**：在上下文中，有一个特殊的关键字 this，它在代码执行过程中可能指向不同的对象。在全局执行上下文中，this 通常指向全局对象（浏览器中是 window）。在函数执行上下文中，this 的值取决于函数是如何被调用的。如果它是一个方法，this 通常指向调用它的对象。

### 执行栈

执行栈，也叫**调用栈**，具有 LIFO（后进先出）结构，用于存储在代码执行期间创建的所有执行上下文。
首次运行 JS 代码时，会创建一个全局执行上下文`GlobalExectionContext`并 Push 到当前的执行栈中。每当发生函数调用，引擎都会为该函数创建一个新的函数执行上下文`FunctionExectionContext`并 Push 到当前执行栈的栈顶。
根据执行栈 LIFO 规则，当栈顶函数运行完成后，其对应的函数执行上下文将会从执行栈中 Pop 出，上下文控制权将移到当前执行栈的下一个执行上下文。

```js
var a = 'Hello World!'

function first() {
  console.log('Inside first function')
  second()
  console.log('Again inside first function')
}

function second() {
  console.log('Inside second function')
}

first()
console.log('Inside Global Execution Context')

// Inside first function
// Inside second function
// Again inside first function
// Inside Global Execution Context
```

![alt text](./img/stack.png)

一般来说，上下文的代码会运行到完成，但是正如我们上面提到的，某些对象（例如生成器）可能会违反堆栈的 LIFO 顺序。生成器函数可以挂起其运行上下文，并在完成之前将其从堆栈中删除。一旦生成器再次被激活，它的上下文就会恢复并再次被压入堆栈.

```js
function* gen() {
  yield 1
  return 2
}

let g = gen()

console.log(
  g.next().value, // 1
  g.next().value, // 2
)
```

这里的语句 yield 将值返回给调用者，并弹出上下文。在第二次 next 调用时，相同的上下文再次被推入堆栈并恢复。这样的上下文可能比创建它的调用者更长寿，因此违反了 LIFO 结构。

详细了解了这个过程之后，我们就可以对 执行上下文栈 总结一些结论了。

- JavaScript 引擎是单线程的
- 同步执行，只有栈顶的上下文处于执行中，其他上下文需要等待
- 全局上下文只有唯一的一个，它在浏览器关闭时出栈
- 函数的执行上下文的个数没有限制
- 每次某个函数被调用，就会有个新的执行上下文为其创建，即使是调用的自身函数，也是如此

### 执行上下文的创建

执行上下文分两个阶段创建：1）创建阶段； 2）执行阶段

#### 创建阶段

- 1、确定 this 的值，也被称为 This Binding。

- 2、LexicalEnvironment（词法环境） 组件被创建。

- 3、VariableEnvironment（变量环境） 组件被创建。

```js
ExecutionContext = {
  ThisBinding = <this value>,     // 确定this
  LexicalEnvironment = { ... },   // 词法环境
  VariableEnvironment = { ... },  // 变量环境
}
```

##### ThisBinding

- 全局执行上下文中，this 的值指向全局对象，在浏览器中 this 的值指向 window 对象，而在 nodejs 中指向这个文件的 module 对象。

- 函数执行上下文中，this 的值取决于函数的调用方式。具体有：默认绑定、隐式绑定、显式绑定（硬绑定）、new 绑定、箭头函数，具体内容会在【this 全面解析】部分详解。

##### 词法环境（Lexical Environment）

词法环境有两个组成部分

- 1、环境记录`EnvironmentRecord`：存储变量和函数声明的实际位置

- 2、对外部环境的引用`outer`：可以访问其外部词法环境

词法环境有两种类型

- 1、全局环境：是一个没有外部环境的词法环境，其外部环境引用`outer`为 null。拥有一个全局对象（window 对象）及其关联的方法和属性（例如数组方法）以及任何用户自定义的全局变量，this 的值指向这个全局对象。

- 2、函数环境：用户在函数中定义的变量被存储在环境记录中，包含了 arguments 对象。对外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境。

直接看伪代码可能更加直观

```js
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {    	  // 词法环境
    EnvironmentRecord: {   		// 环境记录
      Type: "Object",      		   // 全局环境
      // 标识符绑定在这里
      outer: <null>  	   		   // 对外部环境的引用
  }
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {  	  // 词法环境
    EnvironmentRecord: {  		// 环境记录
      Type: "Declarative",  	   // 函数环境
      // 标识符绑定在这里 			  // 对外部环境的引用
      outer: <Global or outer function environment reference>
  }
}
```

##### 变量环境

变量环境也是一个词法环境，因此它具有上面定义的词法环境的所有属性。

在 ES6 中，词法环境和变量环境的区别在于前者用于存储**函数声明和变量（ let 和 const ）绑定，而后者仅用于存储变量（ var ）**绑定。

变量提升会将变量和函数声明存储在变量环境中，这意味着在创建执行上下文时，变量环境会包含当前作用域中的所有变量声明，但实际赋值操作保留在原始位置不变。

在变量提升的过程中，JavaScript 引擎会先读取变量环境中的变量声明，然后才是词法环境中的变量和函数声明。这意味着对于 `var` 声明的变量，引擎优先读取变量环境中的声明，而对于 `let` 和 `const` 声明的变量，则会优先读取词法环境中的声明。

```js
let a = 20
const b = 30
var c

function multiply(e, f) {
  var g = 20
  return e * f * g
}

c = multiply(20, 30)
```

```js
// 全局上下文
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // 标识符绑定在这里
      a: < uninitialized >,
      b: < uninitialized >,
      multiply: < func >
    }
    outer: <null>
  },

  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // 标识符绑定在这里
      c: undefined,
    }
    outer: <null>
  }
}

// 函数上下文
FunctionExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>
  },

  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
}
```

**变量提升**的原因：在创建阶段，函数声明存储在环境中，而变量会被设置为 undefined（在 var 的情况下）或保持未初始化（在 let 和 const 的情况下）。所以这就是为什么可以在声明之前访问 var 定义的变量（尽管是 undefined ），但如果在声明之前访问 let 和 const 定义的变量就会提示引用错误的原因。这就是所谓的变量提升。

### 执行阶段

创建完成之后，就会开始执行代码，并依次完成以下步骤：

- 变量赋值
- 函数引用
- 执行其他代码
