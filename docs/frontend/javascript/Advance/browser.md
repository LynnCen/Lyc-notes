# JS引擎
js引擎解析js代码的顺序和流程

## js引擎读取执行上下文的顺序？
JavaScript 引擎在执行代码时会创建执行上下文，并按照一定的顺序读取和执行这些执行上下文。这个顺序可以大致描述为以下几个步骤：

创建阶段：

创建变量对象（Variable Object）：在函数上下文中，会创建变量对象。变量对象包含了函数的所有形参、函数声明、变量声明等信息。全局上下文中的变量对象被称为全局对象。
确定作用域链（Scope Chain）：在函数上下文中，会确定作用域链，它是一个指向变量对象的链表，用于解析标识符。
确定 this 的值：确定函数执行时 this 关键字的值，它根据函数的调用方式来确定。
执行阶段：

按顺序执行代码：按照代码的书写顺序执行语句，根据作用域链解析标识符并执行相应的操作。
变量赋值：将变量赋值给相应的变量对象中的属性。
函数引用：当引用一个函数时，会创建该函数的执行上下文并立即执行。
总的来说，JavaScript 引擎首先创建执行上下文，然后按照确定的顺序执行其中的代码。在执行过程中，它会根据作用域链来查找变量和函数，并确定 this 的值。

## 那么为什么var let const声明的变量分别存放在上下文的哪个变量对象当中

在 JavaScript 中，var 和 function 声明的变量会被存储在变量对象（Variable Object）中，而 let 和 const 声明的变量则被存储在词法环境（Lexical Environment）中。

具体来说：

var 声明的变量：

在全局上下文中，var 声明的变量会成为全局对象的属性。在浏览器环境中，全局对象是 window 对象。
在函数上下文中，var 声明的变量会成为变量对象的属性。
let 和 const 声明的变量：

在全局和函数上下文中，let 和 const 声明的变量不会成为全局对象或变量对象的属性。
相反，它们会被存储在词法环境的环境记录（Environment Record）中。
词法环境是一种用于存储标识符和变量的数据结构，它由环境记录和外部词法环境组成。环境记录是实际存储变量和函数的地方。

总结起来，var 声明的变量存储在变量对象中，而 let 和 const 声明的变量存储在词法环境的环境记录中。这种差异导致了它们在作用域、提升和重复声明等方面的行为有所不同。

## javaScript 解释器如何将变量和函数声明提升至其所在作用域的顶部？


JavaScript 解释器在代码执行前的创建阶段会将变量和函数声明提升至其所在作用域的顶部。这个过程通常被称为“变量提升”或“函数提升”。

具体来说，变量提升的规则如下：

变量声明提升：使用 var 声明的变量会被提升到其所在函数或全局作用域的顶部，并赋予一个初始值 undefined。

javascript
console.log(x); // undefined
var x;
上述代码会被解释器解释为：

javascript
var x;
console.log(x); // undefined
函数声明提升：使用函数声明的方式（如 function functionName() {}）定义的函数会被整体提升到当前作用域的顶部，函数名和函数体一起被提升。

javascript
sayHello(); // "Hello!"
function sayHello() {
    console.log("Hello!");
}
上述代码会被解释器解释为：

javascript
function sayHello() {
    console.log("Hello!");
}
sayHello(); // "Hello!"
注意：函数表达式不会提升：使用函数表达式（如 var functionName = function() {}）定义的函数不会被提升，只有变量名会被提升，而变量的值（即函数体）保持未定义。

javascript
sayHi(); // TypeError: sayHi is not a function
var sayHi = function() {
    console.log("Hi!");
};
上述代码会被解释器解释为：

javascript
var sayHi;
sayHi(); // TypeError: sayHi is not a function
sayHi = function() {
    console.log("Hi!");
};
总的来说，JavaScript 解释器在代码执行前会将变量和函数声明提升至其所在作用域的顶部，这样可以确保在执行代码时能够正确访问它们。