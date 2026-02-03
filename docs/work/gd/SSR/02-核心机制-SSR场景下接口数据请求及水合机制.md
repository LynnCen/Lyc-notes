# SSR 场景下接口数据请求及水合机制

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=282593109  
> **说明**：原文档为空，本文档基于 SSR 最佳实践创建

---

## 文档概述

本文档深入讲解 **SSR（服务端渲染）场景下的数据请求与水合（Hydration）机制**，这是 SSR 应用的核心技术之一。

**核心目标**：
- 🎯 理解 SSR 数据请求的工作原理
- 💧 掌握 Hydration（水合）机制
- 🔄 确保服务端和客户端状态一致
- ⚡ 优化数据传输和性能

**前置知识**：
- [前后端同构快速入门](01-基础入门-前后端同构快速入门.md)

---

## 一、核心概念

### 1.1 什么是 Hydration（水合）

**定义**：

> **Hydration（水合）** 是指在客户端将服务端渲染的静态 HTML "激活"为可交互的应用程序的过程。

**形象理解**：

```
服务端渲染的 HTML = "干燥的"静态页面
   ↓
客户端 JavaScript 执行
   ↓
为 HTML 添加事件监听器、状态管理等
   ↓
"水合"成可交互的应用 = "湿润的"动态页面
```

**关键点**：
- ✅ 服务端生成完整的 HTML 结构
- ✅ 客户端"接管" HTML，不重新渲染
- ✅ 添加事件处理、恢复应用状态
- ✅ 最终用户得到完全交互的应用

### 1.2 为什么需要 Hydration

**传统 CSR（客户端渲染）流程**：

```
1. 服务器返回空白 HTML
   <div id="app"></div>

2. 浏览器下载 JavaScript
   ↓
3. JavaScript 执行，创建 DOM
   ↓
4. 渲染完整页面
   ↓
❌ 问题：白屏时间长，SEO 不友好
```

**SSR + Hydration 流程**：

```
1. 服务器返回完整 HTML（已渲染）
   <div id="app">
     <h1>Hello World</h1>
     <button>Click</button>
   </div>

2. 浏览器立即显示内容 ✅
   ↓
3. JavaScript 加载并执行
   ↓
4. Hydration：为已有 DOM 添加交互
   ↓
✅ 优势：首屏快，SEO 友好，体验好
```

### 1.3 SSR 数据流

**完整数据流**：

```
┌─────────────────────────────────────────────┐
│           1. 用户请求页面                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        2. 服务端处理                         │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ A. 接收请求（URL、Cookie、Header）   │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ B. 获取数据（API 请求）              │  │
│  │    - 用户信息                        │  │
│  │    - 页面数据                        │  │
│  │    - AB 实验配置                     │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ C. 渲染 HTML（使用数据）             │  │
│  │    - Vue/React 组件渲染              │  │
│  │    - 生成完整 HTML 字符串            │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ D. 序列化数据到 HTML                 │  │
│  │    <script>                          │  │
│  │      window.__INITIAL_STATE__ = {...}│  │
│  │    </script>                         │  │
│  └──────────────┬───────────────────────┘  │
└─────────────────┼───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│        3. 浏览器接收 HTML                    │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ 显示服务端渲染的 HTML                │  │
│  │ ✅ 用户立即看到内容                  │  │
│  └──────────────┬───────────────────────┘  │
└─────────────────┼───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│        4. 客户端 Hydration                  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ A. 加载并执行 JavaScript             │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ B. 读取 __INITIAL_STATE__            │  │
│  │    恢复应用状态                      │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ C. Hydration                         │  │
│  │    - 匹配服务端渲染的 DOM            │  │
│  │    - 添加事件监听器                  │  │
│  │    - 激活响应式系统                  │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│                 ▼                           │
│  ┌──────────────────────────────────────┐  │
│  │ D. 应用完全可交互                    │  │
│  │    ✅ 按钮可点击                     │  │
│  │    ✅ 表单可提交                     │  │
│  │    ✅ 路由可跳转                     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 二、服务端数据请求

### 2.1 数据请求时机

**在 SSR 中，数据请求必须在渲染前完成**：

```javascript
// ❌ 错误：在组件内直接请求（SSR 不会等待）
export default {
  mounted() {
    // mounted 只在客户端执行
    this.fetchData();
  }
}

// ✅ 正确：在 SSR 生命周期中请求
export async function getServerSideProps(context) {
  // 服务端执行，会等待完成
  const data = await fetchData();
  return { props: { data } };
}
```

### 2.2 不同框架的实现

#### Vue 3 + Vite SSR

```javascript
// server.js
import { renderToString } from 'vue/server-renderer';
import { createApp } from './app';

app.get('*', async (req, res) => {
  const { app, router, store } = createApp();
  
  // 1. 设置路由
  router.push(req.url);
  await router.isReady();
  
  // 2. 获取匹配的组件
  const matchedComponents = router.currentRoute.value.matched;
  
  // 3. 调用组件的数据获取方法
  await Promise.all(
    matchedComponents.map(async (component) => {
      if (component.asyncData) {
        await component.asyncData({ store, route: router.currentRoute.value });
      }
    })
  );
  
  // 4. 渲染应用
  const html = await renderToString(app);
  
  // 5. 序列化状态
  const state = store.state;
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(state)}
        </script>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `);
});
```

```javascript
// 组件中定义数据获取
export default {
  async asyncData({ store, route }) {
    const data = await fetch(`/api/posts/${route.params.id}`).then(r => r.json());
    store.commit('setPost', data);
    return { post: data };
  },
  
  setup() {
    const post = computed(() => store.state.post);
    return { post };
  }
};
```

#### Next.js (React)

```javascript
// pages/post/[id].js
export async function getServerSideProps(context) {
  const { id } = context.params;
  
  // 服务端数据请求
  const post = await fetch(`https://api.example.com/posts/${id}`)
    .then(res => res.json());
  
  return {
    props: { post } // 传递给组件
  };
}

export default function Post({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

#### Nuxt.js (Vue)

```vue
<template>
  <div>
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const post = await $axios.$get(`/api/posts/${params.id}`);
    return { post };
  }
};
</script>
```

### 2.3 Meta SSR（稿定框架）

**使用 `cacheProvider` 辅助方法**：

```vue
<template>
  <div>
    <h1>{{ data.title }}</h1>
    <p>{{ data.content }}</p>
  </div>
</template>

<script setup>
import { cacheProvider } from '@web-widget/helpers/cache';

// ✅ 服务端和客户端都会执行，但数据只获取一次
const data = await cacheProvider('post-data', async () => {
  const response = await fetch('/api/post');
  return await response.json();
});
</script>
```

**工作原理**：

```
服务端：
1. cacheProvider 执行，调用 fetch
2. 数据存储到内部缓存
3. 渲染组件使用数据
4. 缓存随 HTML 传递到客户端

客户端：
1. cacheProvider 执行
2. 检测到缓存中有数据
3. 直接使用，不再 fetch ✅
4. 组件使用相同数据渲染
```

---

## 三、状态序列化与反序列化

### 3.1 为什么需要序列化

**问题**：

```
服务端获取的数据存在于内存中
   ↓
如何传递给客户端？
   ↓
需要将数据"嵌入" HTML
```

**解决方案**：**序列化**

### 3.2 序列化到 HTML

**基本方式**：

```javascript
// 服务端
const state = {
  user: { id: 1, name: 'Alice' },
  posts: [{ id: 1, title: 'Hello' }]
};

const html = `
  <!DOCTYPE html>
  <html>
    <body>
      <div id="app">${appHtml}</div>
      <script>
        window.__INITIAL_STATE__ = ${JSON.stringify(state)}
      </script>
    </body>
  </html>
`;
```

**客户端恢复**：

```javascript
// 客户端
const initialState = window.__INITIAL_STATE__;

// 使用初始状态创建 store
const store = createStore({
  state: initialState
});
```

### 3.3 安全序列化

**XSS 风险**：

```javascript
// ❌ 危险：用户输入可能包含恶意脚本
const state = {
  comment: userInput // 如果包含 </script><script>alert('XSS')</script>
};

const html = `
  <script>
    window.__INITIAL_STATE__ = ${JSON.stringify(state)}
  </script>
`;
```

**安全方案**：

```javascript
// ✅ 方案 1：使用 serialize-javascript
import serialize from 'serialize-javascript';

const html = `
  <script>
    window.__INITIAL_STATE__ = ${serialize(state, { isJSON: true })}
  </script>
`;

// ✅ 方案 2：使用 devalue（更小、更快）
import { stringify } from 'devalue';

const html = `
  <script>
    window.__INITIAL_STATE__ = ${stringify(state)}
  </script>
`;
```

**特殊数据类型处理**：

```javascript
// 问题：Date、RegExp、Map、Set 等无法直接 JSON 序列化
const state = {
  createdAt: new Date('2024-01-01'),
  pattern: /hello/gi,
  users: new Map([['1', { name: 'Alice' }]])
};

// JSON.stringify 会丢失类型
JSON.stringify(state);
// → { "createdAt": "2024-01-01T00:00:00.000Z", "pattern": {}, "users": {} }

// ✅ 使用 devalue 保留类型
import { stringify, parse } from 'devalue';

// 服务端
const serialized = stringify(state);

// 客户端
const restored = parse(serialized);
// → Date、RegExp、Map 都正确恢复 ✅
```

---

## 四、Hydration 过程详解

### 4.1 Vue 的 Hydration

**基本流程**：

```javascript
// 服务端渲染
import { renderToString } from 'vue/server-renderer';
const html = await renderToString(app);

// 客户端 Hydration
import { createSSRApp } from 'vue';
const app = createSSRApp(App);
app.mount('#app'); // 自动检测 SSR HTML 并进行 hydration
```

**Hydration 步骤**：

```
1. 创建 Vue 应用实例
   ├─ 使用与服务端相同的组件树
   └─ 使用反序列化的初始状态

2. 遍历 DOM 树和虚拟 DOM 树
   ├─ 对比每个节点
   ├─ 检查标签名、属性、文本
   └─ 确认匹配 ✅

3. 为 DOM 节点添加监听器
   ├─ 事件处理函数
   ├─ 指令（v-model、v-show 等）
   └─ 响应式更新

4. 激活组件
   ├─ 触发 mounted 生命周期
   ├─ 建立响应式系统
   └─ 应用完全可交互 ✅
```

### 4.2 React 的 Hydration

```javascript
// 服务端渲染
import { renderToString } from 'react-dom/server';
const html = renderToString(<App />);

// 客户端 Hydration
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

**React 18 的改进**：

```javascript
// React 18: Selective Hydration（选择性水合）
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ React 18 会优先 hydrate 用户交互的部分
// ✅ 不会阻塞整个应用
```

### 4.3 Hydration Mismatch（不匹配）

**什么是 Mismatch**：

> 服务端渲染的 HTML 和客户端期望的 HTML 不一致

**常见原因**：

```javascript
// ❌ 原因 1：使用了浏览器 API
export default {
  data() {
    return {
      width: window.innerWidth // ❌ 服务端没有 window
    };
  }
};

// ✅ 修复
export default {
  data() {
    return {
      width: 0
    };
  },
  mounted() {
    this.width = window.innerWidth; // ✅ mounted 只在客户端执行
  }
};
```

```javascript
// ❌ 原因 2：随机数或时间戳
export default {
  data() {
    return {
      id: Math.random() // ❌ 服务端和客户端会生成不同的值
    };
  }
};

// ✅ 修复：使用服务端传递的数据
export default {
  props: ['id'] // ✅ 由服务端生成并传递
};
```

```javascript
// ❌ 原因 3：第三方库在服务端渲染不同
<ClientOnly>
  <ThirdPartyWidget />
</ClientOnly>
```

**Mismatch 的后果**：

```
轻微 Mismatch：
  → 控制台警告
  → 可能出现闪烁

严重 Mismatch：
  → React: 完全重新渲染（丢弃 SSR HTML）
  → Vue: 可能崩溃或行为异常
```

---

## 五、最佳实践

### 5.1 数据请求最佳实践

**1. 并行请求，减少瀑布流**

```javascript
// ❌ 串行请求（慢）
const user = await fetchUser();
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);

// ✅ 并行请求（快）
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]);
```

**2. 请求超时控制**

```javascript
async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

**3. 错误降级**

```javascript
async function getServerSideProps(context) {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    console.error('Data fetch failed:', error);
    
    // 返回默认数据，而非失败
    return {
      props: {
        data: null,
        error: 'Failed to load data'
      }
    };
  }
}
```

### 5.2 Hydration 最佳实践

**1. 确保状态一致**

```javascript
// ✅ 使用统一的数据源
const initialState = typeof window !== 'undefined'
  ? window.__INITIAL_STATE__
  : serverState;

const store = createStore({ state: initialState });
```

**2. 延迟非关键 Hydration**

```javascript
// React 18: Suspense + Lazy
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<Loading />}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**3. 使用 ClientOnly 包装浏览器专属组件**

```vue
<template>
  <div>
    <h1>My Page</h1>
    <ClientOnly>
      <BrowserOnlyComponent />
    </ClientOnly>
  </div>
</template>
```

### 5.3 性能优化

**1. 减少序列化数据体积**

```javascript
// ❌ 序列化过多数据
const state = {
  allUsers: allUsersFromDatabase, // 10000 条记录
  currentUser: currentUser
};

// ✅ 只序列化必要数据
const state = {
  currentUser: currentUser
  // allUsers 由客户端按需加载
};
```

**2. 使用流式 SSR（React 18 / Vue 3.2+）**

```javascript
// Node.js 流式渲染
import { renderToPipeableStream } from 'react-dom/server';

app.get('*', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    }
  });
});

// ✅ 优势：TTFB 更快，不需要等待所有数据
```

**3. 缓存 SSR 结果**

```javascript
const cache = new Map();

app.get('/page/:id', async (req, res) => {
  const cacheKey = `page-${req.params.id}`;
  
  if (cache.has(cacheKey)) {
    return res.send(cache.get(cacheKey));
  }
  
  const html = await renderPage(req.params.id);
  cache.set(cacheKey, html);
  
  res.send(html);
});
```

---

## 六、调试技巧

### 6.1 检测 Hydration Mismatch

**Vue Dev Tools**：
- 控制台会显示警告
- 指出不匹配的节点

**React Dev Tools**：
```javascript
// React 会在开发模式显示详细警告
Warning: Expected server HTML to contain a matching <div> in <App>.
```

**手动检测**：

```javascript
// 客户端
if (typeof window !== 'undefined') {
  const serverHTML = document.getElementById('app').innerHTML;
  
  // 延迟检查
  setTimeout(() => {
    const clientHTML = document.getElementById('app').innerHTML;
    if (serverHTML !== clientHTML) {
      console.warn('Hydration mismatch detected!');
    }
  }, 100);
}
```

### 6.2 查看序列化的状态

```javascript
// 浏览器控制台
console.log(window.__INITIAL_STATE__);

// 查看大小
console.log(
  'State size:',
  new Blob([JSON.stringify(window.__INITIAL_STATE__)]).size,
  'bytes'
);
```

### 6.3 性能分析

```javascript
// 服务端
console.time('SSR Render');
const html = await renderToString(app);
console.timeEnd('SSR Render');

console.time('Data Fetch');
const data = await fetchData();
console.timeEnd('Data Fetch');

// 客户端
console.time('Hydration');
app.mount('#app');
console.timeEnd('Hydration');
```

---

## 七、常见问题

### 7.1 为什么要用 Hydration 而不是重新渲染？

**性能对比**：

| 方案 | TTFB | FCP | TTI | 体验 |
|------|------|-----|-----|------|
| **CSR** | 快 | 慢 | 慢 | ❌ 白屏 |
| **SSR + 重新渲染** | 中 | 快 | 慢 | ⚠️ 闪烁 |
| **SSR + Hydration** | 中 | 快 | 快 | ✅ 最佳 |

**Hydration 优势**：
- ✅ 复用服务端 HTML（不重新创建 DOM）
- ✅ 避免闪烁
- ✅ 更快的 TTI（可交互时间）

### 7.2 所有组件都需要 Hydration 吗？

**不一定**：

```javascript
// 静态内容无需 hydration
<div>
  <h1>Static Title</h1>
  <p>This never changes</p>
</div>

// 交互组件需要 hydration
<button @click="handleClick">
  Click me
</button>
```

**Partial Hydration（部分水合）**：

```javascript
// 只 hydrate 交互部分
<Island client:load>
  <InteractiveComponent />
</Island>

// 静态部分不 hydrate
<StaticComponent />
```

### 7.3 Hydration 失败怎么办？

**Vue 的处理**：
- 开发模式：控制台警告
- 生产模式：尝试修复或重新渲染

**React 的处理**：
- 抛弃 SSR HTML
- 完全重新渲染

**预防措施**：
1. ✅ 确保服务端和客户端代码一致
2. ✅ 避免使用浏览器 API
3. ✅ 使用统一的数据源
4. ✅ 充分测试

---

## 八、总结

### 8.1 核心要点

**数据请求**：
- ✅ 在 SSR 生命周期中完成（不在 mounted）
- ✅ 使用框架提供的数据获取方法
- ✅ 并行请求，控制超时，错误降级

**状态序列化**：
- ✅ 将服务端数据嵌入 HTML
- ✅ 使用安全的序列化方法
- ✅ 控制数据体积

**Hydration**：
- ✅ 客户端"激活"服务端 HTML
- ✅ 确保服务端和客户端状态一致
- ✅ 避免 Hydration Mismatch

### 8.2 最佳实践总结

| 场景 | 推荐做法 |
|------|---------|
| **数据请求** | 使用框架的 SSR 数据获取 API |
| **状态管理** | 统一使用序列化的初始状态 |
| **浏览器 API** | 在 `mounted` / `useEffect` 中使用 |
| **第三方库** | 使用 `<ClientOnly>` 包装 |
| **性能优化** | 流式渲染、部分水合、缓存 |

### 8.3 下一步

**深入学习**：
- [RFC. SSR 场景下接口数据请求及水合机制更新](03-核心机制-RFC-SSR场景下接口数据请求及水合机制更新.md)
- [SSR 接入文档](04-实践指南-SSR接入文档.md)

**相关文档**：
- [前后端同构快速入门](01-基础入门-前后端同构快速入门.md)
- [RFC 16: SSR 鉴权流程](05-鉴权-RFC16-SSR鉴权流程标准化提议.md)

---

**文档维护**：前端基建团队  
**文档作者**：前端架构组  
**创建日期**：2025-01-25  
**文档版本**：v1.0
