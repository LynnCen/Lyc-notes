# Vue模板语法与指令详解

> 从React JSX到Vue模板的完整转换指南

## 🎯 学习目标

- 理解Vue模板语法与React JSX的差异
- 掌握Vue的指令系统
- 学会条件渲染和列表渲染
- 理解事件处理和双向绑定

---

## 📋 模板语法概览

### React JSX vs Vue Template

```jsx
// React JSX
function UserCard({ user, isVisible }) {
  return (
    <div className={`user-card ${isVisible ? 'visible' : 'hidden'}`}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={() => handleClick(user.id)}>
        编辑用户
      </button>
    </div>
  )
}
```

```vue
<!-- Vue Template -->
<template>
  <div :class="['user-card', { visible: isVisible, hidden: !isVisible }]">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    <button @click="handleClick(user.id)">
      编辑用户
    </button>
  </div>
</template>
```

### 核心差异对比

| 特性 | React JSX | Vue Template |
|------|-----------|--------------|
| 插值语法 | `{expression}` | `{{ expression }}` |
| 属性绑定 | `prop={value}` | `:prop="value"` 或 `v-bind:prop="value"` |
| 事件监听 | `onClick={handler}` | `@click="handler"` 或 `v-on:click="handler"` |
| 条件渲染 | `{condition && <div/>}` | `v-if="condition"` |
| 列表渲染 | `{list.map(item => <div key={item.id}/>)}` | `v-for="item in list" :key="item.id"` |

---

## 🔤 文本插值和表达式

### 基础文本插值

```vue
<template>
  <div>
    <!-- 基础插值 -->
    <h1>{{ title }}</h1>
    
    <!-- 表达式计算 -->
    <p>{{ message.split('').reverse().join('') }}</p>
    
    <!-- 函数调用 -->
    <span>{{ formatDate(date) }}</span>
    
    <!-- 三元表达式 -->
    <div>{{ isOnline ? '在线' : '离线' }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const title = ref('Vue模板语法')
const message = ref('Hello Vue!')
const date = ref(new Date())
const isOnline = ref(true)

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN')
}
</script>
```

### 原始HTML渲染

```vue
<template>
  <div>
    <!-- 文本插值 (安全) -->
    <p>{{ rawHtml }}</p>
    
    <!-- 原始HTML插值 (注意XSS风险) -->
    <p v-html="rawHtml"></p>
  </div>
</template>

<script setup>
const rawHtml = '<span style="color: red;">红色文本</span>'
</script>
```

**⚠️ 安全提示**: 只对可信内容使用`v-html`，避免XSS攻击。

---

## 🔗 属性绑定指令

### v-bind指令详解

```vue
<template>
  <div>
    <!-- 动态属性绑定 -->
    <img :src="imageSrc" :alt="imageAlt" />
    
    <!-- 完整语法 -->
    <img v-bind:src="imageSrc" v-bind:alt="imageAlt" />
    
    <!-- 动态属性名 -->
    <button :[attributeName]="attributeValue">
      动态属性
    </button>
    
    <!-- 多个属性绑定 -->
    <input v-bind="inputAttrs" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const imageSrc = ref('/logo.png')
const imageAlt = ref('Vue Logo')
const attributeName = ref('disabled')
const attributeValue = ref(true)

const inputAttrs = reactive({
  type: 'text',
  placeholder: '请输入内容',
  required: true,
  maxlength: 100
})
</script>
```

### 类名和样式绑定

```vue
<template>
  <div>
    <!-- 对象语法绑定类名 -->
    <div :class="{ 
      active: isActive, 
      'text-danger': hasError,
      'btn-large': size === 'large'
    }">
      对象语法类名
    </div>
    
    <!-- 数组语法绑定类名 -->
    <div :class="[activeClass, errorClass, sizeClass]">
      数组语法类名
    </div>
    
    <!-- 混合语法 -->
    <div :class="[
      { active: isActive },
      errorClass,
      { 'btn-large': size === 'large' }
    ]">
      混合语法类名
    </div>
    
    <!-- 内联样式绑定 -->
    <div :style="{ 
      color: textColor, 
      fontSize: fontSize + 'px',
      backgroundColor: bgColor 
    }">
      内联样式
    </div>
    
    <!-- 样式对象绑定 -->
    <div :style="styleObject">
      样式对象
    </div>
    
    <!-- 样式数组绑定 -->
    <div :style="[baseStyles, overridingStyles]">
      样式数组
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const size = ref('large')

const activeClass = ref('btn-active')
const errorClass = ref('text-danger')

const sizeClass = computed(() => `btn-${size.value}`)

const textColor = ref('#333')
const fontSize = ref(16)
const bgColor = ref('#f0f0f0')

const styleObject = reactive({
  color: 'blue',
  fontSize: '14px',
  fontWeight: 'bold'
})

const baseStyles = reactive({
  padding: '10px',
  margin: '5px'
})

const overridingStyles = reactive({
  backgroundColor: 'lightblue'
})
</script>

<style scoped>
.active {
  background-color: green;
}

.text-danger {
  color: red;
}

.btn-large {
  padding: 12px 24px;
  font-size: 18px;
}

.btn-active {
  border: 2px solid blue;
}
</style>
```

---

## 🎧 事件处理指令

### v-on指令详解

```vue
<template>
  <div>
    <!-- 基础事件监听 -->
    <button @click="handleClick">点击我</button>
    
    <!-- 完整语法 -->
    <button v-on:click="handleClick">完整语法</button>
    
    <!-- 内联处理器 -->
    <button @click="count++">计数: {{ count }}</button>
    
    <!-- 方法调用带参数 -->
    <button @click="greet('Vue')">打招呼</button>
    
    <!-- 访问原生事件对象 -->
    <button @click="handleEvent">获取事件对象</button>
    
    <!-- 传递事件对象和自定义参数 -->
    <button @click="handleCustom($event, 'custom data')">
      自定义处理
    </button>
    
    <!-- 多个事件处理器 -->
    <button @click="one(), two()">多个处理器</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const handleClick = () => {
  console.log('按钮被点击')
}

const greet = (name) => {
  alert(`Hello ${name}!`)
}

const handleEvent = (event) => {
  console.log('事件类型:', event.type)
  console.log('目标元素:', event.target)
}

const handleCustom = (event, data) => {
  console.log('事件:', event)
  console.log('自定义数据:', data)
}

const one = () => console.log('处理器1')
const two = () => console.log('处理器2')
</script>
```

### 事件修饰符

```vue
<template>
  <div>
    <!-- 阻止默认行为 -->
    <form @submit.prevent="onSubmit">
      <input type="submit" value="提交" />
    </form>
    
    <!-- 阻止事件冒泡 -->
    <div @click="divClick">
      <button @click.stop="buttonClick">
        点击不会冒泡
      </button>
    </div>
    
    <!-- 捕获模式 -->
    <div @click.capture="captureClick">
      <button @click="buttonClick">
        捕获模式
      </button>
    </div>
    
    <!-- 只触发一次 -->
    <button @click.once="onceClick">
      只触发一次
    </button>
    
    <!-- 被动监听器 -->
    <div @scroll.passive="onScroll">
      滚动内容
    </div>
    
    <!-- 组合修饰符 -->
    <button @click.stop.prevent="handleClick">
      阻止冒泡和默认行为
    </button>
  </div>
</template>

<script setup>
const onSubmit = () => {
  console.log('表单提交')
}

const divClick = () => {
  console.log('div被点击')
}

const buttonClick = () => {
  console.log('按钮被点击')
}

const captureClick = () => {
  console.log('捕获阶段')
}

const onceClick = () => {
  console.log('只会执行一次')
}

const onScroll = () => {
  console.log('滚动事件')
}

const handleClick = () => {
  console.log('处理点击')
}
</script>
```

### 按键修饰符

```vue
<template>
  <div>
    <!-- 按键别名 -->
    <input @keyup.enter="handleEnter" placeholder="按回车" />
    <input @keyup.tab="handleTab" placeholder="按Tab" />
    <input @keyup.delete="handleDelete" placeholder="按删除" />
    <input @keyup.esc="handleEsc" placeholder="按ESC" />
    <input @keyup.space="handleSpace" placeholder="按空格" />
    <input @keyup.up="handleUp" placeholder="按上箭头" />
    <input @keyup.down="handleDown" placeholder="按下箭头" />
    <input @keyup.left="handleLeft" placeholder="按左箭头" />
    <input @keyup.right="handleRight" placeholder="按右箭头" />
    
    <!-- 按键码 -->
    <input @keyup.13="handleEnterCode" placeholder="按键码13(回车)" />
    
    <!-- 系统修饰键 -->
    <input @keyup.ctrl.enter="handleCtrlEnter" placeholder="Ctrl+回车" />
    <input @keyup.alt.a="handleAltA" placeholder="Alt+A" />
    <input @keyup.shift.delete="handleShiftDelete" placeholder="Shift+删除" />
    <input @keyup.meta.s="handleMetaS" placeholder="Cmd/Win+S" />
    
    <!-- 精确修饰符 -->
    <input @keyup.ctrl.exact="handleOnlyCtrl" placeholder="只按Ctrl" />
    <input @keyup.exact="handleNoModifier" placeholder="没有修饰键" />
  </div>
</template>

<script setup>
const handleEnter = () => console.log('回车键')
const handleTab = () => console.log('Tab键')
const handleDelete = () => console.log('删除键')
const handleEsc = () => console.log('ESC键')
const handleSpace = () => console.log('空格键')
const handleUp = () => console.log('上箭头')
const handleDown = () => console.log('下箭头')
const handleLeft = () => console.log('左箭头')
const handleRight = () => console.log('右箭头')
const handleEnterCode = () => console.log('按键码13')
const handleCtrlEnter = () => console.log('Ctrl+回车')
const handleAltA = () => console.log('Alt+A')
const handleShiftDelete = () => console.log('Shift+删除')
const handleMetaS = () => console.log('Cmd/Win+S')
const handleOnlyCtrl = () => console.log('只按了Ctrl')
const handleNoModifier = () => console.log('没有修饰键')
</script>
```

---

## 🔄 条件渲染

### v-if vs v-show

```vue
<template>
  <div>
    <!-- v-if: 条件性渲染 -->
    <div v-if="showContent">
      <h3>v-if渲染的内容</h3>
      <p>这个元素会被完全创建或销毁</p>
    </div>
    
    <!-- v-else-if 和 v-else -->
    <div v-if="type === 'A'">
      类型A
    </div>
    <div v-else-if="type === 'B'">
      类型B
    </div>
    <div v-else>
      其他类型
    </div>
    
    <!-- v-show: 显示/隐藏 -->
    <div v-show="isVisible">
      <h3>v-show控制的内容</h3>
      <p>这个元素始终存在DOM中，只是切换display属性</p>
    </div>
    
    <!-- template包装器 -->
    <template v-if="hasMultipleElements">
      <h3>标题</h3>
      <p>段落1</p>
      <p>段落2</p>
    </template>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="showContent = !showContent">
        切换v-if内容
      </button>
      <button @click="isVisible = !isVisible">
        切换v-show内容
      </button>
      <select v-model="type">
        <option value="A">类型A</option>
        <option value="B">类型B</option>
        <option value="C">类型C</option>
      </select>
      <button @click="hasMultipleElements = !hasMultipleElements">
        切换多元素
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showContent = ref(true)
const isVisible = ref(true)
const type = ref('A')
const hasMultipleElements = ref(true)
</script>

<style scoped>
.controls {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.controls button {
  margin: 5px;
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #007bff;
  color: white;
}

.controls select {
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

### 性能对比分析

| 指令 | 渲染成本 | 切换成本 | 适用场景 |
|------|----------|----------|----------|
| `v-if` | 低 | 高 | 不频繁切换的条件渲染 |
| `v-show` | 高 | 低 | 频繁切换的显示/隐藏 |

---

## 📝 列表渲染

### v-for指令详解

```vue
<template>
  <div>
    <!-- 数组渲染 -->
    <h3>用户列表</h3>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
    
    <!-- 带索引的数组渲染 -->
    <h3>带索引的列表</h3>
    <ul>
      <li v-for="(user, index) in users" :key="user.id">
        {{ index + 1 }}. {{ user.name }}
      </li>
    </ul>
    
    <!-- 对象渲染 -->
    <h3>对象属性</h3>
    <ul>
      <li v-for="value in userInfo" :key="value">
        {{ value }}
      </li>
    </ul>
    
    <!-- 对象渲染带键名 -->
    <h3>对象属性带键名</h3>
    <ul>
      <li v-for="(value, name) in userInfo" :key="name">
        {{ name }}: {{ value }}
      </li>
    </ul>
    
    <!-- 对象渲染带键名和索引 -->
    <h3>对象属性完整信息</h3>
    <ul>
      <li v-for="(value, name, index) in userInfo" :key="name">
        {{ index }}. {{ name }}: {{ value }}
      </li>
    </ul>
    
    <!-- 数字序列 -->
    <h3>数字序列</h3>
    <span v-for="n in 10" :key="n">{{ n }} </span>
    
    <!-- 嵌套循环 -->
    <h3>嵌套循环</h3>
    <div v-for="category in categories" :key="category.id">
      <h4>{{ category.name }}</h4>
      <ul>
        <li v-for="item in category.items" :key="item.id">
          {{ item.name }}
        </li>
      </ul>
    </div>
    
    <!-- 条件渲染结合 -->
    <h3>条件渲染结合</h3>
    <ul>
      <template v-for="user in users" :key="user.id">
        <li v-if="user.active">
          {{ user.name }} (活跃用户)
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', active: true },
  { id: 2, name: '李四', email: 'lisi@example.com', active: false },
  { id: 3, name: '王五', email: 'wangwu@example.com', active: true }
])

const userInfo = reactive({
  name: '张三',
  age: 30,
  city: '北京',
  profession: '前端工程师'
})

const categories = ref([
  {
    id: 1,
    name: '前端技术',
    items: [
      { id: 1, name: 'Vue.js' },
      { id: 2, name: 'React' },
      { id: 3, name: 'Angular' }
    ]
  },
  {
    id: 2,
    name: '后端技术',
    items: [
      { id: 4, name: 'Node.js' },
      { id: 5, name: 'Python' },
      { id: 6, name: 'Java' }
    ]
  }
])
</script>
```

### Key的重要性

```vue
<template>
  <div>
    <h3>无key的列表 (不推荐)</h3>
    <ul>
      <li v-for="item in items">
        <input v-model="item.text" />
        {{ item.text }}
      </li>
    </ul>
    
    <h3>有key的列表 (推荐)</h3>
    <ul>
      <li v-for="item in items" :key="item.id">
        <input v-model="item.text" />
        {{ item.text }}
      </li>
    </ul>
    
    <button @click="shuffleItems">随机排序</button>
    <button @click="addItem">添加项目</button>
    <button @click="removeFirstItem">删除第一项</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, text: '项目1' },
  { id: 2, text: '项目2' },
  { id: 3, text: '项目3' }
])

const shuffleItems = () => {
  items.value = items.value.sort(() => Math.random() - 0.5)
}

const addItem = () => {
  const newId = Math.max(...items.value.map(item => item.id)) + 1
  items.value.push({ id: newId, text: `项目${newId}` })
}

const removeFirstItem = () => {
  if (items.value.length > 0) {
    items.value.shift()
  }
}
</script>

<style scoped>
li {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input {
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #007bff;
  color: white;
}
</style>
```

---

## 📥 表单输入绑定

### v-model双向绑定

```vue
<template>
  <div class="form-demo">
    <h3>表单双向绑定示例</h3>
    
    <!-- 文本输入 -->
    <div class="form-group">
      <label>文本输入:</label>
      <input v-model="form.text" type="text" placeholder="输入文本" />
      <p>输入的值: {{ form.text }}</p>
    </div>
    
    <!-- 多行文本 -->
    <div class="form-group">
      <label>多行文本:</label>
      <textarea v-model="form.textarea" placeholder="输入多行文本"></textarea>
      <p>文本内容: <pre>{{ form.textarea }}</pre></p>
    </div>
    
    <!-- 复选框 -->
    <div class="form-group">
      <label>
        <input v-model="form.checked" type="checkbox" />
        单个复选框
      </label>
      <p>选中状态: {{ form.checked }}</p>
    </div>
    
    <!-- 多个复选框 -->
    <div class="form-group">
      <label>多个复选框:</label>
      <label v-for="hobby in hobbies" :key="hobby">
        <input v-model="form.checkedHobbies" type="checkbox" :value="hobby" />
        {{ hobby }}
      </label>
      <p>选中的爱好: {{ form.checkedHobbies }}</p>
    </div>
    
    <!-- 单选按钮 -->
    <div class="form-group">
      <label>单选按钮:</label>
      <label v-for="gender in genders" :key="gender">
        <input v-model="form.picked" type="radio" :value="gender" />
        {{ gender }}
      </label>
      <p>选中的性别: {{ form.picked }}</p>
    </div>
    
    <!-- 选择框 -->
    <div class="form-group">
      <label>单选下拉框:</label>
      <select v-model="form.selected">
        <option disabled value="">请选择</option>
        <option v-for="city in cities" :key="city" :value="city">
          {{ city }}
        </option>
      </select>
      <p>选中的城市: {{ form.selected }}</p>
    </div>
    
    <!-- 多选下拉框 -->
    <div class="form-group">
      <label>多选下拉框:</label>
      <select v-model="form.multiSelected" multiple>
        <option v-for="skill in skills" :key="skill" :value="skill">
          {{ skill }}
        </option>
      </select>
      <p>选中的技能: {{ form.multiSelected }}</p>
    </div>
    
    <!-- 修饰符示例 -->
    <div class="form-group">
      <h4>修饰符示例</h4>
      
      <!-- .lazy - 失焦时才更新 -->
      <label>lazy修饰符:</label>
      <input v-model.lazy="form.lazyText" type="text" placeholder="失焦时更新" />
      <p>lazy值: {{ form.lazyText }}</p>
      
      <!-- .number - 自动转换为数字 -->
      <label>number修饰符:</label>
      <input v-model.number="form.age" type="number" placeholder="自动转数字" />
      <p>年龄 ({{ typeof form.age }}): {{ form.age }}</p>
      
      <!-- .trim - 自动去除首尾空格 -->
      <label>trim修饰符:</label>
      <input v-model.trim="form.trimText" type="text" placeholder="自动去空格" />
      <p>trim值: "{{ form.trimText }}"</p>
    </div>
    
    <!-- 表单数据预览 -->
    <div class="form-preview">
      <h4>表单数据:</h4>
      <pre>{{ JSON.stringify(form, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  text: '',
  textarea: '',
  checked: false,
  checkedHobbies: [],
  picked: '',
  selected: '',
  multiSelected: [],
  lazyText: '',
  age: null,
  trimText: ''
})

const hobbies = ['读书', '运动', '音乐', '旅行']
const genders = ['男', '女']
const cities = ['北京', '上海', '广州', '深圳']
const skills = ['JavaScript', 'Vue.js', 'React', 'Node.js', 'Python']
</script>

<style scoped>
.form-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-group input[type="checkbox"],
.form-group input[type="radio"] {
  margin-right: 8px;
}

.form-group label:has(input[type="checkbox"]),
.form-group label:has(input[type="radio"]) {
  display: inline-block;
  margin-right: 15px;
  margin-bottom: 5px;
  font-weight: normal;
}

.form-group select[multiple] {
  height: 120px;
}

.form-group p {
  margin-top: 10px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.form-group pre {
  background: white;
  padding: 8px;
  border-radius: 4px;
  margin: 0;
  white-space: pre-wrap;
}

.form-preview {
  margin-top: 30px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}

.form-preview pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

---

## 🎛️ 修饰符完整指南

### 事件修饰符总结

```vue
<template>
  <div class="modifier-demo">
    <h3>事件修饰符演示</h3>
    
    <!-- 基础修饰符 -->
    <div class="demo-section">
      <h4>基础修饰符</h4>
      
      <form @submit.prevent="handleSubmit">
        <input type="text" placeholder="阻止表单默认提交" />
        <button type="submit">.prevent修饰符</button>
      </form>
      
      <div @click="outerClick" class="outer">
        外层div
        <div @click.stop="innerClick" class="inner">
          .stop修饰符 (阻止冒泡)
        </div>
      </div>
      
      <div @click.self="selfClick" class="outer">
        只有点击自身才触发
        <div class="inner">点击这里不会触发外层事件</div>
      </div>
      
      <button @click.once="onceClick">
        .once修饰符 (只触发一次)
      </button>
    </div>
    
    <!-- 键盘修饰符 -->
    <div class="demo-section">
      <h4>键盘修饰符</h4>
      
      <input @keyup.enter="handleEnter" placeholder="按回车键" />
      <input @keyup.ctrl.enter="handleCtrlEnter" placeholder="Ctrl+回车" />
      <input @keyup.exact="handleExact" placeholder="精确匹配(不能有修饰键)" />
      <input @keyup.ctrl.exact="handleCtrlExact" placeholder="只能是Ctrl" />
    </div>
    
    <!-- 鼠标修饰符 -->
    <div class="demo-section">
      <h4>鼠标修饰符</h4>
      
      <button @click.left="handleLeftClick">左键点击</button>
      <button @click.right.prevent="handleRightClick">右键点击</button>
      <button @click.middle="handleMiddleClick">中键点击</button>
    </div>
    
    <!-- 系统修饰符 -->
    <div class="demo-section">
      <h4>系统修饰符</h4>
      
      <div @keyup.ctrl="handleCtrl">按住Ctrl</div>
      <div @keyup.alt="handleAlt">按住Alt</div>
      <div @keyup.shift="handleShift">按住Shift</div>
      <div @keyup.meta="handleMeta">按住Cmd/Win</div>
    </div>
  </div>
</template>

<script setup>
const handleSubmit = () => {
  console.log('表单提交被阻止')
}

const outerClick = () => {
  console.log('外层点击')
}

const innerClick = () => {
  console.log('内层点击')
}

const selfClick = () => {
  console.log('自身点击')
}

let onceClickCount = 0
const onceClick = () => {
  onceClickCount++
  console.log(`once点击次数: ${onceClickCount}`)
}

const handleEnter = () => {
  console.log('回车键按下')
}

const handleCtrlEnter = () => {
  console.log('Ctrl+回车组合键')
}

const handleExact = () => {
  console.log('精确匹配 - 没有修饰键')
}

const handleCtrlExact = () => {
  console.log('只有Ctrl修饰键')
}

const handleLeftClick = () => {
  console.log('左键点击')
}

const handleRightClick = () => {
  console.log('右键点击')
}

const handleMiddleClick = () => {
  console.log('中键点击')
}

const handleCtrl = () => {
  console.log('Ctrl键')
}

const handleAlt = () => {
  console.log('Alt键')
}

const handleShift = () => {
  console.log('Shift键')
}

const handleMeta = () => {
  console.log('Meta键(Cmd/Win)')
}
</script>

<style scoped>
.modifier-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.outer {
  padding: 20px;
  background: #e3f2fd;
  border: 2px solid #2196f3;
  border-radius: 8px;
  margin: 10px 0;
  cursor: pointer;
}

.inner {
  padding: 15px;
  background: #fff3e0;
  border: 2px solid #ff9800;
  border-radius: 6px;
  margin: 10px;
  cursor: pointer;
}

button {
  margin: 5px;
  padding: 10px 15px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #007bff;
  color: white;
}

input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

form {
  margin: 10px 0;
}
</style>
```

---

## 🚀 最佳实践总结

### 1. 模板语法最佳实践

```vue
<!-- ✅ 推荐 -->
<template>
  <!-- 使用语义化的元素名 -->
  <user-profile :user="currentUser" @update="handleUserUpdate" />
  
  <!-- 合理使用计算属性 -->
  <div :class="userStatusClass">{{ userDisplayName }}</div>
  
  <!-- 避免在模板中使用复杂逻辑 -->
  <div v-if="isUserActive">用户活跃</div>
</template>

<!-- ❌ 不推荐 -->
<template>
  <!-- 避免复杂的内联表达式 -->
  <div :class="user.status === 'active' && user.premium ? 'premium-active' : user.status === 'inactive' ? 'inactive' : 'default'">
    {{ user.firstName + ' ' + user.lastName + (user.title ? ' (' + user.title + ')' : '') }}
  </div>
</template>
```

### 2. 性能优化建议

```vue
<template>
  <!-- 使用v-show代替v-if进行频繁切换 -->
  <expensive-component v-show="isVisible" />
  
  <!-- 为列表项提供稳定的key -->
  <item 
    v-for="item in items" 
    :key="item.id" 
    :data="item" 
  />
  
  <!-- 使用v-once进行一次性渲染 -->
  <expensive-static-component v-once />
</template>
```

### 3. 可维护性原则

- **关注点分离**: 逻辑放在`<script>`中，样式放在`<style>`中
- **组件化思维**: 将复杂模板拆分为小组件
- **命名规范**: 使用清晰、语义化的变量和方法名
- **文档注释**: 为复杂逻辑添加必要的注释

---

## 📚 延伸阅读

- [Vue3官方模板语法指南](https://cn.vuejs.org/guide/essentials/template-syntax.html)
- [Vue3条件渲染指南](https://cn.vuejs.org/guide/essentials/conditional.html)
- [Vue3列表渲染指南](https://cn.vuejs.org/guide/essentials/list.html)
- [Vue3表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)

---

**下一篇**: [组件通信](./component-communication.md) - 学习Vue组件间的通信方式 