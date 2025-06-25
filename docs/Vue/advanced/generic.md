# 泛型组件（Generic Components）

Vue 3.3 引入了泛型组件支持，这是一个重要的 TypeScript 增强功能，允许组件接受泛型类型参数，提供更强的类型安全性和更好的代码复用性。

## 基础概念

### 什么是泛型组件？

泛型组件是指能够处理多种数据类型的组件，通过泛型参数来约束和推断类型，而不是固定使用某种特定类型。这样可以让组件更加灵活和类型安全。

### 为什么需要泛型组件？

1. **类型安全**：确保传入的数据类型一致性
2. **代码复用**：同一个组件可以处理不同类型的数据
3. **智能提示**：提供更准确的 TypeScript 类型提示
4. **约束关系**：确保相关 props 之间的类型关系

## 基础语法

在 `<script setup>` 中使用 `generic` 属性来声明泛型参数：

```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```

### 泛型约束

可以使用 `extends` 关键字来约束泛型类型：

```vue
<script setup lang="ts" generic="T extends string | number">
defineProps<{
  value: T
  options: T[]
}>()
</script>
```

### 多个泛型参数

支持声明多个泛型参数：

```vue
<script setup lang="ts" generic="T extends Item, U extends string | number">
import type { Item } from './types'

defineProps<{
  id: U
  data: T
  list: T[]
}>()
</script>
```

## 实际使用示例

### 1. 选择器组件（Select）

创建一个通用的选择器组件，支持不同类型的选项：

```vue
<!-- MySelect.vue -->
<script setup lang="ts" generic="T extends { id: string | number; name: string }">
import { computed } from 'vue'

const props = defineProps<{
  options: T[]
  modelValue: T | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
}>()

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <select v-model="selected">
    <option :value="null">请选择</option>
    <option 
      v-for="option in options" 
      :key="option.id" 
      :value="option"
    >
      {{ option.name }}
    </option>
  </select>
</template>
```

使用示例：

```vue
<script setup lang="ts">
import MySelect from './MySelect.vue'

// 用户类型
interface User {
  id: number
  name: string
  email: string
}

// 角色类型
interface Role {
  id: string
  name: string
  permissions: string[]
}

const users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
]

const roles: Role[] = [
  { id: 'admin', name: '管理员', permissions: ['read', 'write'] },
  { id: 'user', name: '普通用户', permissions: ['read'] }
]

const selectedUser = ref<User | null>(null)
const selectedRole = ref<Role | null>(null)
</script>

<template>
  <!-- 选择用户 -->
  <MySelect v-model="selectedUser" :options="users" />
  
  <!-- 选择角色 -->
  <MySelect v-model="selectedRole" :options="roles" />
</template>
```

### 2. 表格组件（Table）

创建一个类型安全的表格组件：

```vue
<!-- MyTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
interface Column<T> {
  key: keyof T
  title: string
  width?: string
}

const props = defineProps<{
  data: T[]
  columns: Column<T>[]
}>()

// 定义插槽类型
const slots = defineSlots<{
  default?: (props: { 
    item: T
    index: number 
    column: Column<T> 
  }) => any
}>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th 
          v-for="column in columns" 
          :key="String(column.key)"
          :style="{ width: column.width }"
        >
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in data" :key="index">
        <td v-for="column in columns" :key="String(column.key)">
          <slot 
            :item="item" 
            :index="index" 
            :column="column"
          >
            {{ item[column.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

使用示例：

```vue
<script setup lang="ts">
import MyTable from './MyTable.vue'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

const products: Product[] = [
  { id: 1, name: '笔记本电脑', price: 5999, category: '电子产品' },
  { id: 2, name: '无线鼠标', price: 199, category: '配件' }
]

const columns = [
  { key: 'id' as const, title: 'ID', width: '80px' },
  { key: 'name' as const, title: '产品名称' },
  { key: 'price' as const, title: '价格' },
  { key: 'category' as const, title: '分类' }
]
</script>

<template>
  <MyTable :data="products" :columns="columns">
    <!-- 自定义价格列显示 -->
    <template #default="{ item, column }">
      <span v-if="column.key === 'price'">
        ¥{{ item.price.toFixed(2) }}
      </span>
      <span v-else>
        {{ item[column.key] }}
      </span>
    </template>
  </MyTable>
</template>
```

### 3. 标签页组件（Tabs）

创建一个支持自定义数据类型的标签页组件：

```vue
<!-- MyTabs.vue -->
<script setup lang="ts" generic="T extends { id: string; title: string }">
import { ref, computed } from 'vue'

const props = defineProps<{
  tabs: T[]
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [tab: T, index: number]
}>()

const activeTabId = computed({
  get: () => props.modelValue || props.tabs[0]?.id,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = computed(() => 
  props.tabs.find(tab => tab.id === activeTabId.value)
)

const activeIndex = computed(() =>
  props.tabs.findIndex(tab => tab.id === activeTabId.value)
)

const handleTabClick = (tab: T, index: number) => {
  activeTabId.value = tab.id
  emit('change', tab, index)
}

// 定义作用域插槽类型
defineSlots<{
  default?: (props: { tab: T; index: number }) => any
  header?: (props: { tab: T; index: number; isActive: boolean }) => any
}>()
</script>

<template>
  <div class="tabs">
    <!-- 标签头部 -->
    <div class="tab-headers">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="['tab-header', { active: tab.id === activeTabId }]"
        @click="handleTabClick(tab, index)"
      >
        <slot 
          name="header" 
          :tab="tab" 
          :index="index" 
          :is-active="tab.id === activeTabId"
        >
          {{ tab.title }}
        </slot>
      </button>
    </div>
    
    <!-- 标签内容 -->
    <div class="tab-content">
      <slot 
        v-if="activeTab" 
        :tab="activeTab" 
        :index="activeIndex" 
      />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  width: 100%;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-header {
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-header.active {
  border-bottom-color: #409eff;
  color: #409eff;
}

.tab-content {
  padding: 16px;
}
</style>
```

使用示例：

```vue
<script setup lang="ts">
import MyTabs from './MyTabs.vue'

interface ContentTab {
  id: string
  title: string
  content: string
  icon?: string
}

interface ProductTab {
  id: string
  title: string
  products: Array<{ name: string; price: number }>
  featured: boolean
}

const contentTabs: ContentTab[] = [
  { id: 'home', title: '首页', content: '欢迎来到首页' },
  { id: 'about', title: '关于我们', content: '这是关于我们的页面', icon: 'info' }
]

const productTabs: ProductTab[] = [
  { 
    id: 'electronics', 
    title: '电子产品',
    products: [{ name: '手机', price: 3999 }],
    featured: true
  },
  { 
    id: 'books', 
    title: '图书',
    products: [{ name: 'Vue.js指南', price: 89 }],
    featured: false
  }
]

const activeContentTab = ref('home')
const activeProductTab = ref('electronics')
</script>

<template>
  <!-- 内容标签页 -->
  <MyTabs v-model="activeContentTab" :tabs="contentTabs">
    <template #header="{ tab, isActive }">
      <i v-if="tab.icon" :class="`icon-${tab.icon}`"></i>
      {{ tab.title }}
    </template>
    
    <template #default="{ tab }">
      <div>{{ tab.content }}</div>
    </template>
  </MyTabs>
  
  <!-- 产品标签页 -->
  <MyTabs v-model="activeProductTab" :tabs="productTabs">
    <template #header="{ tab }">
      {{ tab.title }}
      <span v-if="tab.featured" class="featured-badge">热门</span>
    </template>
    
    <template #default="{ tab }">
      <div v-for="product in tab.products" :key="product.name">
        {{ product.name }} - ¥{{ product.price }}
      </div>
    </template>
  </MyTabs>
</template>
```

## 高级特性

### 1. 导入类型支持

Vue 3.3 支持在泛型组件中导入和使用外部类型：

```vue
<script setup lang="ts" generic="T extends BaseItem">
import type { BaseItem } from './types'
import type { ApiResponse } from '@/api/types'

defineProps<{
  items: T[]
  response: ApiResponse<T>
}>()
</script>
```

### 2. 复杂类型约束

支持使用交集类型和复杂约束：

```vue
<script setup lang="ts" generic="T extends Record<string, any> & { id: string }">
defineProps<{
  data: T & { timestamp: number }
  options: Partial<T>[]
}>()
</script>
```

### 3. 条件类型支持

可以在单个 prop 中使用条件类型：

```vue
<script setup lang="ts" generic="T extends 'string' | 'number'">
defineProps<{
  type: T
  value: T extends 'string' ? string : number
}>()
</script>
```

## 最佳实践

### 1. 合理的类型约束

为泛型参数提供合适的约束，确保类型安全：

```vue
<!-- 好的做法 -->
<script setup lang="ts" generic="T extends { id: string | number }">
defineProps<{
  items: T[]
  selectedId: T['id']
}>()
</script>

<!-- 避免过于宽泛的约束 -->
<script setup lang="ts" generic="T extends any">
<!-- 这样的约束没有意义 -->
</script>
```

### 2. 清晰的命名

使用有意义的泛型参数名称：

```js
<!-- 好的做法 -->
<script setup lang="ts" generic="TItem extends BaseItem, TKey extends keyof TItem">

<!-- 避免单字母命名（除非上下文很清晰） -->
<script setup lang="ts" generic="A, B, C">
```

### 3. 文档和注释

为复杂的泛型组件提供充分的文档：

```vue
<script setup lang="ts" generic="
  TData extends Record<string, any>,
  TKey extends keyof TData
">
/**
 * 通用数据展示组件
 * @template TData - 数据项的类型，必须是对象类型
 * @template TKey - 数据项的键类型，用于指定显示字段
 */

defineProps<{
  /** 要显示的数据列表 */
  data: TData[]
  /** 要显示的字段键 */
  displayKey: TKey
  /** 是否显示索引 */
  showIndex?: boolean
}>()
</script>
```

## 与 defineSlots 结合使用

泛型组件可以与 `defineSlots` 结合，提供类型安全的插槽：

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
const props = defineProps<{
  items: T[]
}>()

defineSlots<{
  default?: (props: { item: T; index: number }) => any
  header?: (props: { count: number }) => any
  footer?: (props: { total: number }) => any
}>()
</script>

<template>
  <div>
    <slot name="header" :count="items.length" />
    
    <div v-for="(item, index) in items" :key="index">
      <slot :item="item" :index="index">
        <!-- 默认内容 -->
        <pre>{{ JSON.stringify(item, null, 2) }}</pre>
      </slot>
    </div>
    
    <slot name="footer" :total="items.length" />
  </div>
</template>
```

## 注意事项和限制

### 1. 类型分析限制

- 复杂的条件类型在组件级别不被支持
- 只能在单个 prop 类型中使用条件类型
- 需要实际类型分析的复杂类型暂不支持

### 2. 运行时行为

- 泛型仅在编译时有效，不影响运行时行为
- 所有类型信息在构建后会被移除

### 3. 工具支持

确保使用兼容的工具版本：
- Vue Language Tools (Volar) >= 1.6
- vue-tsc >= 1.6.4
- TypeScript >= 4.5

## 总结

Vue 3.3 的泛型组件功能显著提升了 TypeScript 开发体验，让组件既保持了灵活性又增强了类型安全性。通过合理使用泛型组件，可以创建更加通用、类型安全的可复用组件，提高开发效率和代码质量。

在实际项目中，建议在以下场景使用泛型组件：
- 需要处理不同数据类型但逻辑相似的组件
- 要求强类型约束的表单或列表组件  
- 需要保持数据类型一致性的组件
- 构建通用 UI 组件库时


