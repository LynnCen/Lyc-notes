# SSR 接入文档

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=282593115  
> **说明**：原文档为空，本文档基于 Meta SSR 框架创建实践指南

---

## 文档概述

本文档提供 **Meta SSR 框架的完整接入指南**，从零开始教您如何将项目迁移到 SSR 架构。

**核心目标**：
- 📘 快速接入 SSR
- 🛠️ 掌握常用配置
- ⚡ 优化性能
- 🐛 解决常见问题

**适用场景**：
- 新项目接入 SSR
- CSR 项目迁移到 SSR
- SSR 项目性能优化

---

## 一、快速开始

### 1.1 环境要求

**基础要求**：

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| **Node.js** | ≥ 16.x | 推荐 18.x LTS |
| **npm/pnpm** | ≥ 7.x / ≥ 8.x | 推荐使用 pnpm |
| **Vue** | 3.x | 支持 Composition API |

**检查环境**：

```bash
node -v  # v18.19.0
pnpm -v  # 8.14.0
```

### 1.2 创建新项目

**使用脚手架**：

```bash
# 创建项目
npx @web-widget/cli create my-ssr-app

# 选择模板
? Select a template: 
  ❯ Vue 3 + SSR
    Vue 2 + SSR
    React + SSR

# 进入项目
cd my-ssr-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

**项目结构**：

```
my-ssr-app/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── index.vue       # 首页
│   │   └── about.vue       # 关于页
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   ├── api/                # API 封装
│   ├── store/              # 状态管理
│   ├── router/             # 路由配置
│   ├── app.vue             # 根组件
│   ├── entry-client.ts     # 客户端入口
│   └── entry-server.ts     # 服务端入口
├── public/                 # 静态资源
├── meta.config.ts          # Meta SSR 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

---

## 二、核心概念

### 2.1 双入口模式

**SSR 应用有两个入口**：

```
entry-client.ts  → 浏览器执行
entry-server.ts  → Node.js 执行
```

**entry-client.ts**：

```typescript
import { createSSRApp } from 'vue';
import { createRouter } from './router';
import { createStore } from './store';
import App from './app.vue';

// 客户端 Hydration
async function hydrate() {
  const app = createSSRApp(App);
  const router = createRouter();
  const store = createStore();
  
  // 恢复服务端状态
  if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
  }
  
  app.use(router);
  app.use(store);
  
  // 等待路由就绪
  await router.isReady();
  
  // 挂载应用（自动 Hydration）
  app.mount('#app');
}

hydrate();
```

**entry-server.ts**：

```typescript
import { renderToString } from 'vue/server-renderer';
import { createSSRApp } from 'vue';
import { createRouter } from './router';
import { createStore } from './store';
import App from './app.vue';

// 服务端渲染函数
export async function render(url: string, context: any) {
  const app = createSSRApp(App);
  const router = createRouter();
  const store = createStore();
  
  app.use(router);
  app.use(store);
  
  // 设置路由
  router.push(url);
  await router.isReady();
  
  // 获取匹配的组件并请求数据
  const matchedComponents = router.currentRoute.value.matched;
  await Promise.all(
    matchedComponents.map((component) => {
      if (component.asyncData) {
        return component.asyncData({ store, route: router.currentRoute.value });
      }
    })
  );
  
  // 渲染应用
  const html = await renderToString(app, context);
  
  // 返回 HTML 和状态
  return {
    html,
    state: store.state
  };
}
```

### 2.2 生命周期差异

**SSR 中的 Vue 生命周期**：

| 生命周期 | 服务端 | 客户端 | 用途 |
|---------|-------|--------|------|
| `setup()` | ✅ 执行 | ✅ 执行 | 初始化、数据获取 |
| `onBeforeMount` | ❌ 不执行 | ✅ 执行 | 挂载前准备 |
| `onMounted` | ❌ 不执行 | ✅ 执行 | DOM 操作、浏览器 API |
| `onBeforeUpdate` | ❌ 不执行 | ✅ 执行 | 更新前 |
| `onUpdated` | ❌ 不执行 | ✅ 执行 | 更新后 |
| `onBeforeUnmount` | ❌ 不执行 | ✅ 执行 | 卸载前清理 |
| `onUnmounted` | ❌ 不执行 | ✅ 执行 | 卸载后清理 |

**关键点**：
- ✅ `setup()` 在服务端和客户端都执行
- ❌ 生命周期钩子（mounted、updated 等）只在客户端执行
- ⚠️ 服务端没有响应式更新

---

## 三、数据获取

### 3.1 使用 cacheProvider

**推荐方式**：

```vue
<template>
  <div>
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { cacheProvider } from '@web-widget/helpers/cache';

const route = useRoute();

// ✅ 自动处理 SSR 和 CSR
const post = await cacheProvider(`post-${route.params.id}`, async () => {
  const response = await fetch(`/api/posts/${route.params.id}`);
  return await response.json();
});
</script>
```

**工作原理**：

```
服务端：
  1. cacheProvider 执行
  2. 调用 fetch 获取数据
  3. 数据缓存到内部
  4. 使用数据渲染 HTML
  5. 缓存随 HTML 传递到客户端

客户端：
  1. cacheProvider 执行
  2. 检测到缓存中有数据
  3. 直接使用，不再请求 ✅
```

### 3.2 Vue 2 兼容

**使用 syncCacheProvider**：

```vue
<template>
  <div>
    <h1>{{ data.title }}</h1>
  </div>
</template>

<script>
import { syncCacheProvider } from '@web-widget/helpers/cache';

export default {
  data() {
    return {
      data: syncCacheProvider('my-data', async () => {
        const res = await fetch('/api/data');
        return await res.json();
      })
    };
  }
};
</script>
```

### 3.3 错误处理

**推荐模式**：

```vue
<script setup>
import { cacheProvider } from '@web-widget/helpers/cache';
import { ref } from 'vue';

const data = ref(null);
const error = ref(null);
const loading = ref(true);

try {
  data.value = await cacheProvider('data-key', async () => {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  });
} catch (err) {
  error.value = err.message;
} finally {
  loading.value = false;
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else>{{ data }}</div>
  </div>
</template>
```

---

## 四、路由配置

### 4.1 基本路由

**router/index.ts**：

```typescript
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/index.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/about.vue')
  },
  {
    path: '/post/:id',
    name: 'Post',
    component: () => import('../pages/post.vue')
  }
];

export function createRouter() {
  return createRouter({
    // 服务端使用 memory history，客户端使用 web history
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes
  });
}
```

### 4.2 路由守卫

**添加鉴权**：

```typescript
const router = createRouter();

router.beforeEach(async (to, from, next) => {
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
      // 服务端：重定向到登录
      if (import.meta.env.SSR) {
        return next('/login');
      }
      
      // 客户端：提示后重定向
      alert('请先登录');
      return next('/login');
    }
  }
  
  next();
});
```

### 4.3 动态路由

```typescript
const routes = [
  {
    path: '/user/:id',
    component: UserProfile,
    // 路由元信息
    meta: {
      requiresAuth: true,
      title: '用户资料'
    }
  }
];
```

---

## 五、状态管理

### 5.1 Pinia（推荐）

**store/user.ts**：

```typescript
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  
  actions: {
    async fetchUser() {
      const response = await fetch('/api/user');
      this.user = await response.json();
    },
    
    setToken(token: string) {
      this.token = token;
    }
  }
});
```

**使用**：

```vue
<script setup>
import { useUserStore } from '@/store/user';

const userStore = useUserStore();

// SSR: 服务端获取数据
await userStore.fetchUser();
</script>

<template>
  <div>
    <p>用户名: {{ userStore.user?.name }}</p>
  </div>
</template>
```

**状态序列化**：

```typescript
// entry-server.ts
const pinia = createPinia();
app.use(pinia);

// 渲染后获取状态
const state = pinia.state.value;

return {
  html,
  state
};
```

```typescript
// entry-client.ts
const pinia = createPinia();

// 恢复服务端状态
if (window.__INITIAL_STATE__) {
  pinia.state.value = window.__INITIAL_STATE__;
}

app.use(pinia);
```

### 5.2 Vuex（Vue 2/3）

```typescript
import { createStore } from 'vuex';

export function createStore() {
  return createStore({
    state: () => ({
      user: null
    }),
    
    mutations: {
      SET_USER(state, user) {
        state.user = user;
      }
    },
    
    actions: {
      async fetchUser({ commit }) {
        const response = await fetch('/api/user');
        const user = await response.json();
        commit('SET_USER', user);
      }
    }
  });
}
```

---

## 六、样式处理

### 6.1 CSS Modules

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">Hello</h1>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}

.title {
  color: #333;
  font-size: 24px;
}
</style>
```

### 6.2 Scoped CSS

```vue
<template>
  <div class="container">
    <h1>Hello</h1>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

/* 深度选择器 */
:deep(.child) {
  color: red;
}
</style>
```

### 6.3 全局样式

**在 app.vue 中引入**：

```vue
<script setup>
import './styles/global.css';
</script>
```

### 6.4 CSS 预处理器

**安装**：

```bash
pnpm add -D sass
```

**使用**：

```vue
<style lang="scss" scoped>
$primary-color: #42b983;

.container {
  color: $primary-color;
  
  .title {
    font-size: 24px;
  }
}
</style>
```

---

## 七、构建与部署

### 7.1 开发模式

```bash
# 启动开发服务器
pnpm dev

# 默认地址
# http://localhost:3000
```

### 7.2 生产构建

```bash
# 构建生产版本
pnpm build

# 生成的文件
dist/
├── client/          # 客户端资源
│   ├── assets/      # CSS、JS、图片
│   └── index.html
└── server/          # 服务端包
    └── entry-server.js
```

### 7.3 预览

```bash
# 预览生产构建
pnpm preview

# 访问
# http://localhost:4173
```

### 7.4 部署到生产

**使用 Node.js**：

```javascript
// server.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 生产模式
const isProd = process.env.NODE_ENV === 'production';

// 加载构建产物
const template = fs.readFileSync(
  path.resolve(__dirname, 'dist/client/index.html'),
  'utf-8'
);

const { render } = await import('./dist/server/entry-server.js');

// 静态资源
app.use('/assets', express.static(path.resolve(__dirname, 'dist/client/assets')));

// SSR
app.get('*', async (req, res) => {
  try {
    const url = req.originalUrl;
    const { html, state } = await render(url);
    
    const finalHtml = template
      .replace('<!--app-html-->', html)
      .replace('<!--app-state-->', `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
  } catch (e) {
    console.error(e);
    res.status(500).end(e.message);
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

**启动**：

```bash
NODE_ENV=production node server.js
```

---

## 八、常见问题

### 8.1 window is not defined

**问题**：

```javascript
// ❌ 服务端会报错
export default {
  setup() {
    const width = window.innerWidth; // Error: window is not defined
  }
};
```

**解决方案**：

```javascript
// ✅ 方案 1：检查环境
export default {
  setup() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  }
};

// ✅ 方案 2：在 onMounted 中使用
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const width = ref(0);
    
    onMounted(() => {
      width.value = window.innerWidth;
    });
    
    return { width };
  }
};
```

### 8.2 Hydration Mismatch

**问题**：

```vue
<template>
  <div>{{ randomId }}</div>
</template>

<script setup>
// ❌ 服务端和客户端生成不同的 ID
const randomId = Math.random();
</script>
```

**解决方案**：

```vue
<template>
  <div>{{ id }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// ✅ 服务端使用固定值，客户端再生成
const id = ref(0);

onMounted(() => {
  id.value = Math.random();
});
</script>
```

### 8.3 第三方库不支持 SSR

**问题**：

```javascript
import ThirdPartyLib from 'third-party-lib';
// Error: document is not defined
```

**解决方案**：

```vue
<template>
  <ClientOnly>
    <ThirdPartyComponent />
  </ClientOnly>
</template>

<script setup>
// ClientOnly 组件只在客户端渲染
</script>
```

**ClientOnly 实现**：

```vue
<!-- components/ClientOnly.vue -->
<template>
  <div v-if="mounted">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});
</script>
```

### 8.4 内存泄漏

**问题**：

```javascript
// ❌ 全局单例，不同请求会污染
const store = createStore();

export function render() {
  app.use(store); // 所有请求共享同一个 store
}
```

**解决方案**：

```javascript
// ✅ 每个请求创建新实例
export function render() {
  const store = createStore(); // 每次都创建新的
  app.use(store);
}
```

---

## 九、性能优化

### 9.1 代码分割

**路由级别分割**：

```typescript
const routes = [
  {
    path: '/',
    // ✅ 动态导入
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];
```

**组件级别分割**：

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

// ✅ 异步组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);
</script>
```

### 9.2 缓存策略

**页面级缓存**：

```javascript
const cache = new Map();

app.get('*', async (req, res) => {
  const cacheKey = req.url;
  
  // 检查缓存
  if (cache.has(cacheKey)) {
    return res.send(cache.get(cacheKey));
  }
  
  // 渲染
  const html = await render(req.url);
  
  // 缓存 10 分钟
  cache.set(cacheKey, html);
  setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000);
  
  res.send(html);
});
```

**API 数据缓存**：

```javascript
import { cacheProvider } from '@web-widget/helpers/cache';

// ✅ 自动缓存 60 秒
const data = await cacheProvider('api-data', async () => {
  return await fetchAPI();
}, { ttl: 60 });
```

### 9.3 预取和预加载

```vue
<template>
  <div>
    <RouterLink
      to="/about"
      @mouseenter="prefetchAbout"
    >
      关于
    </RouterLink>
  </div>
</template>

<script setup>
function prefetchAbout() {
  // 预取路由组件
  import('./pages/About.vue');
}
</script>
```

### 9.4 图片优化

```vue
<template>
  <!-- 懒加载 -->
  <img
    src="/placeholder.png"
    data-src="/real-image.jpg"
    loading="lazy"
    alt="Image"
  />
  
  <!-- 响应式图片 -->
  <picture>
    <source
      media="(min-width: 1024px)"
      srcset="/image-large.jpg"
    />
    <source
      media="(min-width: 768px)"
      srcset="/image-medium.jpg"
    />
    <img src="/image-small.jpg" alt="Responsive Image" />
  </picture>
</template>
```

---

## 十、调试技巧

### 10.1 查看 SSR 输出

```bash
# 开启调试模式
DEBUG=* pnpm dev
```

### 10.2 性能分析

```javascript
// 服务端
console.time('SSR Render');
const html = await render(url);
console.timeEnd('SSR Render');
// SSR Render: 50ms

// 客户端
console.time('Hydration');
app.mount('#app');
console.timeEnd('Hydration');
// Hydration: 20ms
```

### 10.3 状态检查

```javascript
// 浏览器控制台
console.log('Initial State:', window.__INITIAL_STATE__);

// 检查状态大小
const stateSize = new Blob([
  JSON.stringify(window.__INITIAL_STATE__)
]).size;

console.log(`State size: ${stateSize} bytes`);
```

---

## 十一、最佳实践

### 11.1 开发规范

**✅ 推荐**：

```javascript
// 1. 使用 cacheProvider 获取数据
const data = await cacheProvider('key', fetchData);

// 2. 在 onMounted 中使用浏览器 API
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 3. 每个请求创建新实例
export function render() {
  const app = createSSRApp(App);
  const store = createStore(); // 新实例
  app.use(store);
}

// 4. 避免全局状态
// ❌ const globalState = {};
// ✅ 使用 store 或 provide/inject

// 5. 使用环境检测
if (import.meta.env.SSR) {
  // 服务端逻辑
} else {
  // 客户端逻辑
}
```

**❌ 避免**：

```javascript
// 1. 在 setup 中直接使用浏览器 API
const width = window.innerWidth; // ❌

// 2. 全局单例模式
export const store = createStore(); // ❌

// 3. 随机数或时间戳
const id = Date.now(); // ❌ 服务端和客户端不一致

// 4. 直接操作 DOM
document.querySelector('.app'); // ❌

// 5. 在 SSR 中使用 localStorage
const token = localStorage.getItem('token'); // ❌
```

### 11.2 性能清单

**优化前检查**：

- [ ] 代码分割（路由、组件）
- [ ] 图片懒加载
- [ ] API 数据缓存
- [ ] 页面级缓存
- [ ] CSS 压缩
- [ ] JavaScript 压缩
- [ ] Gzip/Brotli 压缩
- [ ] CDN 加速
- [ ] 预取关键资源
- [ ] 减少首屏数据量

---

## 十二、总结

### 12.1 核心要点

**SSR 的关键**：
- ✅ 双入口：服务端和客户端
- ✅ 数据获取：使用 cacheProvider
- ✅ 状态管理：序列化和反序列化
- ✅ Hydration：确保一致性
- ✅ 环境区分：避免浏览器 API

**常见陷阱**：
- ❌ window/document 未检查
- ❌ 全局单例导致污染
- ❌ 服务端和客户端状态不一致
- ❌ 内存泄漏

### 12.2 推荐资源

**官方文档**：
- [Vue SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Vite SSR](https://vitejs.dev/guide/ssr.html)

**相关文档**：
- [前后端同构快速入门](01-基础入门-前后端同构快速入门.md)
- [SSR 场景下接口数据请求及水合机制](02-核心机制-SSR场景下接口数据请求及水合机制.md)

---

**文档维护**：前端基建团队  
**文档作者**：前端架构组  
**创建日期**：2025-01-25  
**文档版本**：v1.0
