# Vue入门

## setup

定义：script标签的setup属性，用于在组件中定义响应式数据和方法。

## 数据绑定ref和reactive

定义：
- ref：用于创建响应式对象，返回一个响应式对象，可以通过.value访问和修改值。
- reactive：用于创建响应式对象，返回一个响应式对象，可以通过.value访问和修改值。


```vue
<script setup>
import { ref, reactive } from 'vue'

const count = ref(0)
const obj = reactive({ count: 0 })
</script>

<template>
  <p>Count: {{ count }}</p>
  <p>Obj: {{ obj.count }}</p>
</template>
```

## 事件绑定v-on和按键修饰符

定义：v-on 指令用于绑定事件，按键修饰符用于绑定按键事件。

给个v-on的例子：

```js
<script setup>
import { ref } from 'vue'
const count = ref(0)
const handleClick = () => {
  count.value++
}
</script>

<template>
  <button @click="handleClick">Click me</button>
  <p>Count: {{ count }}</p>
</template>
```
## 显示和隐藏v-show和v-if

定义：v-show 指令用于根据条件显示元素，v-if 指令用于根据条件删除元素。

给个v-show和v-if的例子：


```js

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<template>
  <button @click="show = !show">Toggle</button>
  <p v-show="show">Hello</p>
  // 补充：v-if的例子
  <p v-if="show">Hello</p>
  <p v-else>World</p>
</template>
```

## 动态属性绑定v-bind

定义：`v-bind `指令用于绑定动态属性。

v-bind的用法：

```js
<script setup>
import { ref } from 'vue'
const dynamicId = ref('dynamic-id')
</script>

<template>
  <div v-bind:id="dynamicId"></div>
</template>
```

## 列表渲染v-for

定义：v-for 指令用于循环渲染列表。

v-for的用法：


```js

<script setup>
import { ref } from 'vue'
const items = ref([1, 2, 3])
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="item">{{ index }}: {{ item }}</li>
  </ul>
</template>
```


## 双向数据绑定v-model

定义：`v-model` 指令用于在表单输入元素和数据之间创建双向绑定。
v-model的用法：

```js
<script setup>
import { ref } from 'vue'
const message = ref('Hello')
</script>

<template>
  <input v-model="message" />
  <p>{{ message }}</p>
</template>
```

`v-model`的修饰符：

- .lazy：在输入框失去焦点时更新数据。
- .number：将输入框的值转换为数字。
- .trim：将输入框的值转换为字符串，并去除两端的空格。

