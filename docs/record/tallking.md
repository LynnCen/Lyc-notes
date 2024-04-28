

## 0428

从闭包入手 



 思考下面的打印？
 如何形成闭包？
```js

  function foo() {
    let outer = 0;
    function bar() {
      let inner = 0;

      console.log(outer++, inner++);

    }
    return bar;
  }
  var fn = foo();
  fn();
  fn();

  ```

利用闭包写一个防抖并进行类型声明
``` js
function aaa(callback: (str: string) => void, delay: number) {
    let timeout: any = null
    function bar() {
        if(timeout) {
            clearTimeout(timeout)
            timeout = null
        }
        timeout = setTimeout(() => {
            callback("aaa")
        }, delay)
    }
    return bar
}

const fn: Function = aaa(() => {
    console.log("防抖")
}, 2000)

fn()
```

 深入ts类型
```ts
export function debounce<F extends (...args: any[]) => any>(func: F, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      func.call(this,...args);
    }, delay);
  };
}
```
**Note** :warning:
 为什么要进行对F约束 ?

`extends (...args: any[]) => any`

`...args` 为对象or数组？

如何确定函数返回值的类型？
`ReturnType` 

如何确定js一些内置函数的返回值类型？ 将该函数转为ts类型？
`typeof`

如何提取函数**参数**的类型？
`Parameters`

题目：如何提取apply或者call的参数类型？


对防抖函数确定this指向？

默认第一个参数this的作用？ 关联执行上下文的outer属性 作用域链？ 闭包？

```js
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {    	  // 词法环境
    EnvironmentRecord: {   		// 环境记录
      Type: "Object",      		   // 全局环境
      // 标识符绑定在这里
      outer: <null>  	   		   // 对外部环境的引用
  }
}
```
词法环境和变量环境的区别？

为什么会有变量提升？ let const 和var声明的变量分别在那个环境中？










