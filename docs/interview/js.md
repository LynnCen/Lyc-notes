# Javascript

### 数据类型都存在哪些位置

1. 栈内存
   栈内存用于存储基本数据类型的值，例如数字、布尔值、null、undefined 和短字符串等。
   这些数据被直接存储在栈内存中，因为它们的大小是固定的，且在内存中占用空间较小。
   当变量超出其作用域时，栈内存中的数据会被自动销毁。
2. 堆内存
   堆内存用于存储引用数据类型的值，例如对象、数组、函数和长字符串等。
   引用数据类型的值存储在堆内存中，因为它们的大小不固定，且占用的内存空间较大。
   变量在栈内存中存储的是对象在堆内存中的引用地址，而不是对象本身的值。
   当变量超出其作用域时，栈内存中的引用地址会被销毁，但堆内存中的对象仍然存在，直到没有任何引用指向它们时才会被垃圾回收机制回收。

### 如何判断一个对象是否为空对象

1. Object.keys() Object.entries
2. for in

```js
function isEmptyObject(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false // 只要有一个属性存在，就认为对象不为空
    }
  }
  return true // 所有属性都不存在，则认为对象为空
}
```

3. JSON.stringify

```js
JSON.stringify(obj) === '{}'
```

### 深拷贝和浅拷贝的区别

- 基本类型是指简单的数据段，有 5 种类型： `Undefined`、`Null`、`Boolean`、`Number` 和`String`
- 引用类型是指可能有多个值构成的对象，一般为： `Object`、 `Array`、 `function` 等

浅拷贝只复制指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存。引用传递 (指针)

深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象。值传递

### 深拷贝的实现

1. JSON.parse(JSON.stringify())实现
2. Object.create()实现
3. 递归复制

```js
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const copiedObj = Array.isArray(obj) ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copiedObj[key] = deepCopy(obj[key])
    }
  }
  return copiedObj
}
```

### 如何对对象进行浅拷贝

1. 拓展运算符

```js
const obj = { a: 1, b: 2 }
const shallowCopy = { ...obj }
```

2. Object.assign()

```js
const obj = { a: 1, b: 2 }
const shallowCopy = Object.assign({}, obj)
```

3. 手动复制属性

```js
function shallowCopy(obj) {
  // 如果是数组，则使用数组的浅拷贝方法 slice()
  if (Array.isArray(obj)) {
    return obj.slice()
  }

  // 如果是对象，则递归地进行浅拷贝
  if (typeof obj === 'object' && obj !== null) {
    const copiedObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copiedObj[key] = shallowCopy(obj[key])
      }
    }
    return copiedObj
  }

  // 如果是基本数据类型或函数等，直接返回原值
  return obj
}
```

### 数组去重

1、 使用 set

```js
const originalArray = [1, 2, 2, 3, 4, 4, 5]
const uniqueArray = [...new Set(originalArray)]
```

2、使用 filter

```js
const originalArray = [1, 2, 2, 3, 4, 4, 5]
const uniqueArray = originalArray.filter((item, index) => originalArray.indexOf(item) === index)
```

3、使用 reduce

```js
const originalArray = [1, 2, 2, 3, 4, 4, 5]
const uniqueArray = originalArray.reduce((acc, curr) => {
  if (!acc.includes(curr)) {
    acc.push(curr)
  }
  return acc
}, [])
```

4、使用 forEach

```js
const originalArray = [1, 2, 2, 3, 4, 4, 5]
const uniqueArray = []
originalArray.forEach((item) => {
  if (!uniqueArray.includes(item)) {
    uniqueArray.push(item)
  }
})
```

### forEach 和 map 的区别？

forEach()方法没有返回值，而 map()方法有返回值。

forEach 遍历通常都是直接引入当前遍历数组的内存地址，生成的数组的值发生变化，当前遍历的数组对应的值也会发生变化。

[map 遍历](https://so.csdn.net/so/search?q=map遍历&spm=1001.2101.3001.7020)的后的数组通常都是生成一个新的数组，新的数组的值发生变化，当前遍历的数组值不会变化。

总的来说 map 的速度大于 forEach

### 说一下 es6 的新特性以及对他们的理解

变量声明 let const
结构赋值 拓展运算符
Array Object String 新增方法
Symbol 原始数据类型 对象的属性名只能为 string 类型 Symbol 代表独一无二的 拓展了对象的属性名
set、map 和 proxy 数据结构
Reflect 、Promise、Generator、async、await、class
模块化 module import
装饰器语法

### var let const 的区别

let 声明的是变量，const 声明的是常量，并且声明就必须赋值
从执行上下文的变量存放位置来看
var 声明的变量存放在变量环境`VariableEnvironment`,let、const 声明的变量存放此法环境`LexicalEnvironment`
var 存在变量提升 这是由于 js 引擎解释器会优先将 var 和 function 声明（函数提升）提到作用域的顶部
let、const 不存在变量提升（暂时性死区），具有块级作用域

### 箭头函数和普通函数的区别

- 声明方式：箭头函数使用 const+ => 普通函数使用 function
- 箭头函数不可以使用 arguments 对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
- 箭头函数不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
- this bind：
  箭头函数的 this 由外层的作用域决定，不是由调用方式决定，也就意味着内部的 this 始终指向外层的 this，它会从自己的作用域链的上一层继承 this（因此无法使用 apply / call / bind 进行绑定 this 值）
  普通函数的 this 由调用方式决定，在全局上下文中，this 指向 window，如果在对象的方法中，this 指向调用方法的对象。

```js
class Dog {
  name
  constructor() {
    nc.on('event', function () {
      console.log(this)
    })
    nc.on('event', () => {
      console.log(this)
    })
  }
}
```

- 构造函数：
  由于 this 指向不同，在构造函数方面也会存在差异。普通函数可以使用 new 关键字，箭头函数不能使用 new 关键字

回顾一下 new 的过程：

1.创建一个新的空对象:var obj = {}
2.obj 的 proto 属性指向 Fn 的 prototype 属性:obj.proto = Fn.prototype（形成原型链:obj.proto -->Fn.prototype --->Object.prototype --->null） 3.绑定 this 执行和执行构造函数:Fn.call(obj,”jack“) 4.返回新的对象：return obj

所以：
从第二步来看，箭头函数没有 prototype 属性 ，而 new 命令在执行时需要将构造函数的 prototype 赋值给新的对象的 **proto**

从第三步来看，箭头函数没有自己的 this，无法调用 call，apply。

从 js 引擎的角度分析：
JavaScript 函数两个内部方法: [[Call]]和[[Construct]]

直接调用时执行[[Call]]方法, 直接执行函数体

new 调用时执行[[Construct]]方法, 创建一个实例对象

箭头函数并没有[[Construct]]方法, 所以不能被用作构造函数

另外, 可以参考 Proxy 中的 handler.construct 方法

当使用 new 关键字调用一个函数时，JavaScript 引擎会检查函数是否有 [[Construct]] 方法。如果函数有 [[Construct]] 方法，它会被调用来创建一个新的实例对象；如果函数没有 [[Construct]] 方法，那么将会抛出一个错误。

Construct 实现了 new 的过程？？ 错误
[[Construct]] 视为实现 new 关键字的关键内部方法之一
在 new 的第三步中，它涉及到调用构造函数本身。这个调用是通过内部的 [[Construct]] 方法实现的。如果构造函数内部具有 [[Construct]] 方法，那么它将被调用来创建对象实例。否则，JavaScript 引擎将采取其他默认的行为来创建对象实例。

### 闭包

闭包的定义：指有权访问另一个函数作用域中的变量的函数，一般情况就是在一个函数中包含另一个函数。

闭包的作用：访问函数内部变量、保持函数在环境中一直存在，不会被垃圾回收机制处理

函数内部声明的变量是局部的，只能在函数内部访问到，但是函数外部的变量是对函数内部可见的。

**定义**：一个闭包是一个可以自己拥有独立的环境与变量的的表达式（通常是函数，因为 ES6 有了块级作用域的概念），是指有权访问另一个函数作用域中的变量的函数。也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域。

闭包其实只是一个绑定了**执行环境的函数**

在 JavaScript 中，根据词法作用域的规则，**内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使该外部函数已经执行结束了，但是内部函数引用外部函数的变量依然保存在内存中，我们就把这些变量的集合称为闭包**

1. 可以在函数的外部访问到函数内部的局部变量。
2. 让这些变量始终保存在内存中，不会随着函数的结束而自动销毁。

```javascript
function init() {
  var name = 'Mozilla' // name 是一个被 init 创建的局部变量
  function displayName() {
    // displayName() 是内部函数，一个闭包
    alert(name) // 使用了父函数中声明的变量
  }
  displayName()
}
const closure = init() // 调用外部函数，得到一个闭包
closure() // 调用闭包
```

### 原型链

顾名思义，就是通过原型`prototype`来建立关系的链式数据结构。
当访问一个对象的属性或方法时，如果该对象本身没有这个属性或方法，JavaScript 引擎会沿着原型链向上查找，直到找到对应的属性或方法或者到达原型链的顶端。
对象含有*proto*属性，函数含有一个 prototype 属性。
在 new 的过程中会做这一步，用于建立原型链，
person.**proto** == Person.prototype

### 说一下 Promise 的常用方法，并说一下自己的理解

Promise.resolve(value)：这个方法可以将一个值转换为一个解决的 Promise 对象。如果传递的值是一个 Promise 对象，则直接返回这个对象。

Promise.reject(reason)：这个方法可以将一个原因转换为一个拒绝的 Promise 对象。

Promise.prototype.then(onFulfilled, onRejected)：这个方法会返回一个新的 Promise 对象，它会在当前 Promise 对象解决时调用 onFulfilled 回调函数，如果当前 Promise 对象拒绝时调用 onRejected 回调函数。

Promise.prototype.catch(onRejected)：这个方法相当于 Promise.prototype.then(null, onRejected)，用于捕获 Promise 对象的异常。

Promise.prototype.finally(callback)：这个方法会在 Promise 对象完成时（无论是解决还是拒绝），都会调用 callback 回调函数。

Promise.all(iterable) ：接受一个可迭代对象作为参数，返回一个新的 Promise 对象，当所有 Promise 对象都解决时，返回的 Promise 对象解决，否则返回的 Promise 对象拒绝。

Promise.race(iterable) ：接受一个可迭代对象作为参数，返回一个新的 Promise 对象，当可迭代对象中的任何一个 Promise 对象解决或拒绝时，返回的 Promise 对象也会相应地解决或拒绝。

Promise.any(iterable) ：只要参数实例有一个变成 fulfilled 状态，包装实例就会变成 fulfilled 状态；如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态。

Promise.allSettled(iterable)：用来确定一组异步操作是否都结束了（不管成功或失败）。所以，它的名字叫做”Settled“，包含了”fulfilled“和”rejected“两种情况。

Promise 本质上是一种状态机，在异步操作执行完成或者失败时，会改变自身的状态。它的状态可以从“pending”（未完成）变为“resolved”（已完成）或“rejected”（已失败），一旦状态变化，就会触发相应的回调函数。Promise 的优势在于可以利用链式调用的方式组织异步代码，避免回调地狱问题，使代码更加清晰和简洁。

### 事件循环

由于 js 是单线程，那么如何管理异步和 IO 相关操作呢？
js 是单线程，但浏览器是多线程，它还包括 GUI 渲染线程、网络请求线程、定时器线程、事件监听线程、webWork 线程
当 js 主线程遇到其他线程的任务时，会交给其他线程在后台处理，处理完成之后的回调函数放入任务队列中，当 js 主线程将执行栈中的任务执行完之后，就会取出任务列队中的任务执行。
由于任务的优先级不同，分为宏任务和微任务队列，优先执行微任务队列，再执行宏任务。
宏任务：

- script(整体代码)
- setTimeout()
- setInterval()
- postMessage
- I/O
- UI 交互事件
  微任务：
- new Promise().then(回调)
- await
- MutationObserver(html5 新特性)
  整个流程被称为事件循环

### 事件委托

**事件委托**（Event Delegation）: 是一种常见的**前端优化技术**，它利用事件冒泡的特性，将**事件处理程序添加到父元素上**，从而减少对子元素的事件绑定，提高性能和代码简洁度。

当一个事件在 DOM 树上触发时，它会沿着元素的祖先元素一直向上传播，直到达到根节点。利用这一特性，可以把事件处理程序添加到祖先元素上，然后通过判断事件的 `target` 属性来识别实际触发事件的子元素，从而执行相应操作。
