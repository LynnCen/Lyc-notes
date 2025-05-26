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

## v-text和v-html

定义：v-text 指令用于设置元素的文本内容，v-html 指令用于设置元素的HTML内容。

v-text的用法：

```js  
<script setup>
import { ref } from 'vue'
const htmlContent = ref('<p>Hello</p>')
const webInfo = reactive({
  name: 'Vue',
  url: "<a style='color: red;' href='https://vuejs.org'>Vue</a>"
})
</script>

<template>
  <div v-html="webInfo.url"></div>
  <p v-text="webInfo.name"></p>
</template>
```

## 计算属性computed

定义：computed 用于计算属性，可以缓存计算结果。

computed的用法：

```js

<script setup>
import { ref, computed } from 'vue'
const data = reactive({
    x:10,
    y:20
})
const sum = computed(() => data.x + data.y)
const add = () => {
  data.x++
}
</script>

<template>
  <p>Count: {{ data.x }}</p>
  <p>Sum: {{ sum }}</p>
  <button @click="add">Add</button>
</template>
```

## 侦听器watch

定义：watch 用于监听数据的变化。

watch的用法：

```js

<script setup>
import { ref, watch } from 'vue'
const count = ref(0)
watch(count, (newVal, oldVal) => {
    if( newVal > 10){
  console.log(`Count changed from ${oldVal} to ${newVal}`)
})
</script> 
<template>
  <p>Count: {{ count }}</p>
  <button @click="count++">Add</button>
</template>
```

## 自动监听器

定义：watchEffect能自动监听数据的变化。

自动监听器的用法：

```js

<script setup>
import { ref, watchEffect } from 'vue'
const count = ref(0)
watchEffect(() => {
  if(count.value > 10){
    console.log(`Count: ${count.value}`)
  }
})
</script>

<template>
  <p>Count: {{ count }}</p>
  <button @click="count++">Add</button>
</template>
```

## 基于Vite创建Vue3项目

定义：Vite 是一个快速的构建工具，用于创建Vue3项目。

基于Vite创建Vue3项目的用法：

```bash
npm create vite@latest my-vue-app --template vue
```

```bash
cd my-vue-app
npm install
npm run dev
```

## Vue3的Vscode插件

Vue-Official:Vue3的官方插件，提供Vue3的语法提示和代码补全能力。

Vue VSCode Snippets:Vue3的代码片段，提供Vue3的代码片段，提高开发效率。

## 导入组件

```vue
<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Header />
  <Footer />
</template>

<style scoped>

</style>
```

## 父组件向子组件传递数据

父组件：

```vue
<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Header name="Header" url="https://vuejs.org"/>
  // :='data' 是父组件向子组件传递数据
  <Footer :="data"/>
</template>

<style scoped>

</style>
```

Header组件：

```vue
<script setup>
const props = defineProps(['name', 'url'])
</script>

<template>
  <h1>{{ name }}</h1>
  <a :href="url">{{ url }}</a>
</template>
```

## 子组件向父组件传递数据

// 写一个子组件向父组件传递数据的例子

子组件Input.vue

```vue
<script setup>
// emit 是子组件向父组件传递数据的方法 参数：第一个参数updateData 是父组件监听的方法名 第二个参数是子组件传递的数据
const emit = defineEmits(['updateData'])
</script>

<template>
  // 子组件向父组件传递数据
  <input v-model="name" @input="emit('updateData', $event.target.value)" />
</template> 
```

父组件App.vue

```vue
<script setup>
import Input from './components/Input.vue'
// 父组件监听子组件传递的数据
const updateData = (data) => {
  console.log(data)
}
</script>
<template>
  <Input @updateData="updateData" />
</template>
```

## 跨组件通信-依赖注入

定义：provide 和 inject 用于跨组件通信。

provide 和 inject 的用法：

父组件挂在provider：

```vue
<script setup>
import { provide } from 'vue'
provide('name', 'Vue')
</script>

<template>
  <h1>父组件</h1>
  <Child />
</template>
```

子组件注入inject：

```vue
<script setup>
import { inject } from 'vue'
const name = inject('name')
</script>

<template>
  <h1>子组件</h1>
  <p>{{ name }}</p>
</template>
```

## 匿名插槽和具名插槽

插槽（slot）：是指可以在父组件中定义一个插槽，然后在子组件中使用这个插槽。

父组件Layout：

```vue
<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
 <!-- 匿名插槽 -->
  <Header>
    <slot />
  </Header>
  <!-- 具名插槽 -->
   <Footer>
    <!-- v-slot:header 是具名插槽 简写为 #header -->
    <template #header>
      <h1>Header</h1>
    </template>
    <template #footer>
      <h1>Footer</h1>
    </template>
   </Footer>

 
</template>
```

Header组件：

```vue
<script setup>
</script>

<template>
 <!-- 匿名插槽 -->
  <slot />
</template>
```

Footer组件：

```vue
<script setup>
</script>

<template>
  <!-- 具名插槽 -->
  <slot name="header" />
  <slot name="footer" />
</template>
```
