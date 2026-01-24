# JavaScript深入之执行上下文栈和变量对象

## 执行上下文栈定义
`执行上下文栈（Execution Context Stack）`是 JavaScript 中用于管理`执行上下文（Execution Context）`的数据结构。

思考？
是否可以将执行上下文栈理解为执行上下文和执行栈的结合？

从定义上来看 执行上下文栈 是一个栈 栈中的数据都是执行上下文类型的

先创建执行上下文，再执行阶段将各个执行上下文压入栈中。



## 变量对象定义
每个`执行上下文（execution context）`都有一个与之关联的`变量对象（variable object）`。变量对象是一个抽象的概念，它包含了在执行上下文中定义的所有变量、函数声明和形参，以及一些特定的内部变量。

在执行上下文创建阶段，`VariableEnvironment（变量环境）`被创建，里面存储着变量对象和对外部函数的引用，见一下数据结构
```js
VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 标识符绑定在这里
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
  ```
  #### 变量对象和变量环境的区别？
  **变量对象（Variable Object）**
  - 变量对象是执行上下文中的一部分，用于存储在该执行上下文中定义的变量、函数声明和函数的形参。
  - 在全局执行上下文中，变量对象被称为全局对象（Global Object）或者全局变量对象（Global Variable Object）。
  - 在函数执行上下文中，变量对象被称为活动对象（Activation Object）或者函数变量对象（Function Variable Object）。

  **变量环境（Variable Environment）**

  - 变量环境是执行上下文中的一个组成部分，它包含了变量对象以及外部环境的引用（比如外部函数的变量对象）。
  - 变量环境是执行上下文中用来解析标识符（变量名）引用的地方，即在执行代码时查找变量值的地方。
  
  所以它们并不是完全相同的概念，变量对象是执行上下文中存储变量和函数声明的具体数据结构，而变量环境则包含了变量对象以及外部环境的引用，用于标识符解析。