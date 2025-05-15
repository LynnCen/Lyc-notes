# 基础


###  插值语法

`{{}}`

```js
<h1>{{ msg }}</h1>


```


### ref和reactive

ref用于存储基本类型的数据，如：数字、字符串、布尔值等。使用ref创建的响应式对象，需要通过.value访问和修改其值。

reactive用于存储复杂对象类型的数据，如：数组、对象、函数等。使用reactive创建的响应式对象，可以直接访问和修改其属性。


### 绑定事件v-on和按键修饰符

`v-on:click = 'edit'` 

简写：`@click = 'edit'`

回车：
`@keyup.enter = 'add(xx,xx)'`

空格：
`@keyup.space = 'add(xx,xx)'`

Tab：
`@keyup.tab = 'add(xx,xx)'`

w：
`@keyup.w = 'add(xx,xx)'`

组合快捷键：
- ctrl+ enter：`@keyup.ctrl.enter = 'add(xx,xx)'`
- ctrl+ shift+ enter：`@keyup.ctrl.shift.enter = 'add(xx,xx)'`

### 显示和隐藏 v-show

`v-show = 'isShow'`，isShow为true时显示，为false时隐藏。

### 显示和隐藏 v-if

`v-if = 'isShow'`，isShow为true时显示，为false时隐藏。

`v-else-if = 'isShow'`，当v-if的条件不满足时，显示v-else-if的内容。

`v-else`，当v-if的条件不满足时，显示v-else的内容。


### 动态属性 v-bind

`v-bind:src = 'imgUrl'`

简写：`:src = 'imgUrl'`



### 列表渲染 v-for

`v-for = 'item in items'`，item为当前遍历的元素，items为要遍历的数组。

`v-for = '(item, index) in items'`，item为当前遍历的元素，index为当前遍历的索引。


### 双向绑定 v-model

`v-model = 'msg'`，msg为要绑定的数据，msg的值会实时更新。