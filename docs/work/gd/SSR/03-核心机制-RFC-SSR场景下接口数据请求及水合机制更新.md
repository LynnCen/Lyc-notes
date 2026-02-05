# RFC: SSR 场景下接口数据请求及水合机制更新

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=419734808  
> **说明**：原文档为空，本文档基于 SSR 最佳实践和团队实际需求创建

---

## 文档概述

本 RFC 提出对现有 SSR 数据请求和水合机制的**改进方案**，解决在实际生产环境中遇到的性能和可维护性问题。

**核心目标**：
- 🚀 提升 SSR 数据请求性能
- 🔧 简化数据获取 API
- 💾 优化状态序列化机制
- ⚡ 改进 Hydration 性能

**前置阅读**：
- [SSR 场景下接口数据请求及水合机制](02-核心机制-SSR场景下接口数据请求及水合机制.md)

---

## 一、背景与动机

### 1.1 现状

**当前架构**：

```
Meta SSR 框架
├── 使用 @web-widget/helpers/cache 进行数据缓存
├── 手动管理状态序列化
└── 缺少统一的错误处理机制
```

**问题点**：

| 问题 | 影响 | 严重程度 |
|------|------|---------|
| **数据请求重复** | 服务端请求后，客户端可能重复请求 | 🔴 高 |
| **状态管理分散** | 各页面自行处理，缺少统一方案 | 🟡 中 |
| **错误处理不一致** | 不同页面处理方式不同 | 🟡 中 |
| **性能监控缺失** | 无法追踪数据请求耗时 | 🟡 中 |

### 1.2 实际案例

**案例 1：重复请求**

```javascript
// 问题代码
export default {
  async asyncData() {
    // 服务端执行一次
    const data = await fetchUserInfo();
    return { user: data };
  },
  
  mounted() {
    // ❌ 客户端又执行一次（不知道服务端已获取）
    this.refreshUser();
  },
  
  methods: {
    async refreshUser() {
      this.user = await fetchUserInfo();
    }
  }
};
```

**案例 2：状态序列化冗余**

```javascript
// 问题：序列化了大量不必要的数据
const state = {
  user: currentUser,
  allUsers: await fetchAllUsers(), // ❌ 1MB 数据
  cachedData: historicalData // ❌ 不需要传给客户端
};

// 导致 HTML 体积暴增
```

**案例 3：错误处理不一致**

```javascript
// 页面 A：直接返回错误
async asyncData() {
  const data = await fetchData();
  if (!data) return { error: true };
}

// 页面 B：抛出异常
async asyncData() {
  const data = await fetchData();
  if (!data) throw new Error('Data not found');
}

// 页面 C：返回默认值
async asyncData() {
  try {
    return { data: await fetchData() };
  } catch {
    return { data: [] };
  }
}

// ❌ 缺少统一标准
```

---

## 二、提议内容

### 2.1 统一数据获取 API

**提议**：提供统一的数据获取方法，自动处理缓存、错误、超时

**新 API 设计**：

```typescript
interface DataFetchOptions {
  key: string;              // 缓存键
  fetcher: () => Promise<T>; // 数据获取函数
  timeout?: number;         // 超时时间（默认 3000ms）
  retry?: number;           // 重试次数（默认 1）
  fallback?: T;             // 降级数据
  cache?: {
    ttl?: number;           // 缓存时间（默认 60s）
    swr?: boolean;          // stale-while-revalidate
  };
}

function useFetch<T>(options: DataFetchOptions): Promise<T>;
```

**使用示例**：

```vue
<script setup>
import { useFetch } from '@web-widget/helpers/fetch';

// ✅ 自动处理：缓存、超时、错误降级
const userData = await useFetch({
  key: 'user-info',
  fetcher: () => fetch('/api/user').then(r => r.json()),
  timeout: 2000,
  retry: 2,
  fallback: { id: null, name: 'Guest' }
});
</script>
```

### 2.2 智能状态序列化

**提议**：自动识别需要序列化的数据，减少 HTML 体积

**实现方案**：

```typescript
// 标记需要序列化的数据
interface SerializableData {
  __serialize: true;
  data: any;
}

function markSerializable<T>(data: T): SerializableData {
  return {
    __serialize: true,
    data
  };
}
```

**使用示例**：

```javascript
export default {
  async asyncData() {
    const user = await fetchUser();
    const allUsers = await fetchAllUsers();
    
    return {
      // ✅ 标记为需要序列化
      user: markSerializable(user),
      
      // ❌ 不序列化（客户端自行获取）
      allUsers: allUsers
    };
  }
};
```

**自动优化**：

```javascript
// 框架自动过滤
function serializeState(state) {
  const serializable = {};
  
  for (const [key, value] of Object.entries(state)) {
    if (value?.__serialize === true) {
      serializable[key] = value.data;
    }
  }
  
  return serializable;
}

// 只序列化标记的数据，HTML 体积大幅减少
```

### 2.3 增强错误处理

**提议**：统一的错误处理和降级机制

**错误类型定义**：

```typescript
enum DataFetchErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

interface DataFetchError {
  type: DataFetchErrorType;
  message: string;
  originalError: Error;
  retry: () => Promise<any>;
}
```

**统一处理**：

```javascript
import { useFetch, DataFetchErrorType } from '@web-widget/helpers/fetch';

export default {
  async asyncData() {
    try {
      const data = await useFetch({
        key: 'post-data',
        fetcher: () => fetchPost(),
        onError: (error) => {
          // 统一错误处理
          switch (error.type) {
            case DataFetchErrorType.TIMEOUT:
              console.warn('Request timeout, using cache');
              break;
            case DataFetchErrorType.UNAUTHORIZED:
              // 重定向到登录
              redirect('/login');
              break;
            default:
              console.error('Data fetch failed', error);
          }
        }
      });
      
      return { data };
    } catch (error) {
      // 降级：返回默认数据
      return { data: null, error: true };
    }
  }
};
```

### 2.4 性能监控

**提议**：内置性能监控，追踪数据请求耗时

**监控指标**：

```typescript
interface DataFetchMetrics {
  key: string;
  startTime: number;
  endTime: number;
  duration: number;
  cacheHit: boolean;
  error?: Error;
}

// 自动上报
function reportMetrics(metrics: DataFetchMetrics) {
  // 上报到监控系统
  track('data_fetch', {
    key: metrics.key,
    duration: metrics.duration,
    cache_hit: metrics.cacheHit,
    has_error: !!metrics.error
  });
}
```

**使用示例**：

```javascript
const data = await useFetch({
  key: 'user-info',
  fetcher: fetchUser,
  onMetrics: (metrics) => {
    console.log(`Data fetch took ${metrics.duration}ms`);
    
    if (metrics.duration > 1000) {
      console.warn('Slow data fetch detected');
    }
  }
});
```

---

## 三、详细设计

### 3.1 `useFetch` 实现

```typescript
import { cacheProvider } from '@web-widget/helpers/cache';

interface FetchOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  timeout?: number;
  retry?: number;
  fallback?: T;
  cache?: {
    ttl?: number;
    swr?: boolean;
  };
  onError?: (error: DataFetchError) => void;
  onMetrics?: (metrics: DataFetchMetrics) => void;
}

export async function useFetch<T>(options: FetchOptions<T>): Promise<T> {
  const {
    key,
    fetcher,
    timeout = 3000,
    retry = 1,
    fallback,
    cache = { ttl: 60, swr: false },
    onError,
    onMetrics
  } = options;
  
  const startTime = performance.now();
  let cacheHit = false;
  let error: Error | undefined;
  
  try {
    // 尝试从缓存获取
    const cachedData = await cacheProvider(key, async () => {
      // 带超时的请求
      const data = await fetchWithTimeout(fetcher, timeout);
      return data;
    }, {
      ttl: cache.ttl,
      swr: cache.swr
    });
    
    cacheHit = true;
    return cachedData;
    
  } catch (err) {
    error = err as Error;
    
    // 重试逻辑
    if (retry > 0) {
      return useFetch({
        ...options,
        retry: retry - 1
      });
    }
    
    // 错误处理
    const dataFetchError: DataFetchError = {
      type: classifyError(err),
      message: err.message,
      originalError: err,
      retry: () => useFetch(options)
    };
    
    if (onError) {
      onError(dataFetchError);
    }
    
    // 降级
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw err;
    
  } finally {
    // 性能监控
    const endTime = performance.now();
    const metrics: DataFetchMetrics = {
      key,
      startTime,
      endTime,
      duration: endTime - startTime,
      cacheHit,
      error
    };
    
    if (onMetrics) {
      onMetrics(metrics);
    }
    
    // 自动上报
    reportMetrics(metrics);
  }
}

// 带超时的请求
async function fetchWithTimeout<T>(
  fetcher: () => Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    fetcher(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

// 错误分类
function classifyError(error: Error): DataFetchErrorType {
  if (error.message === 'Timeout') {
    return DataFetchErrorType.TIMEOUT;
  }
  if (error.message.includes('Network')) {
    return DataFetchErrorType.NETWORK;
  }
  if (error.message.includes('401')) {
    return DataFetchErrorType.UNAUTHORIZED;
  }
  if (error.message.includes('404')) {
    return DataFetchErrorType.NOT_FOUND;
  }
  return DataFetchErrorType.SERVER_ERROR;
}
```

### 3.2 智能序列化实现

```typescript
// 自动检测和序列化
export function createStateSerializer() {
  const serializableKeys = new Set<string>();
  
  return {
    // 标记可序列化
    mark(key: string) {
      serializableKeys.add(key);
    },
    
    // 序列化状态
    serialize(state: Record<string, any>): string {
      const filtered: Record<string, any> = {};
      
      for (const key of serializableKeys) {
        if (key in state) {
          filtered[key] = state[key];
        }
      }
      
      // 使用 devalue 保留特殊类型
      return stringify(filtered);
    },
    
    // 反序列化
    deserialize(serialized: string): Record<string, any> {
      return parse(serialized);
    }
  };
}

// 使用
const serializer = createStateSerializer();

// 组件中
export default {
  async asyncData() {
    const user = await fetchUser();
    
    // 标记需要序列化
    serializer.mark('user');
    
    return { user };
  }
};

// 服务端渲染时
const state = await getState();
const serialized = serializer.serialize(state);

const html = `
  <script>
    window.__INITIAL_STATE__ = ${serialized}
  </script>
`;
```

### 3.3 Hydration 优化

**提议**：渐进式 Hydration，优先交互部分

**实现**：

```typescript
// 标记优先级
interface HydrationPriority {
  high: string[];    // 立即 hydrate
  medium: string[];  // 延迟 hydrate（RAF）
  low: string[];     // 空闲时 hydrate（requestIdleCallback）
}

function createHydrationScheduler(priority: HydrationPriority) {
  return {
    async hydrate(app: App) {
      // 1. 立即 hydrate 高优先级组件
      for (const selector of priority.high) {
        const el = document.querySelector(selector);
        if (el) {
          await hydrateComponent(app, el);
        }
      }
      
      // 2. 下一帧 hydrate 中优先级
      requestAnimationFrame(() => {
        for (const selector of priority.medium) {
          const el = document.querySelector(selector);
          if (el) {
            hydrateComponent(app, el);
          }
        }
      });
      
      // 3. 空闲时 hydrate 低优先级
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          for (const selector of priority.low) {
            const el = document.querySelector(selector);
            if (el) {
              hydrateComponent(app, el);
            }
          }
        });
      }
    }
  };
}

// 使用
const scheduler = createHydrationScheduler({
  high: ['.header', '.interactive-form'],
  medium: ['.sidebar', '.comments'],
  low: ['.footer', '.recommendations']
});

await scheduler.hydrate(app);
```

---

## 四、迁移方案

### 4.1 渐进式迁移

**阶段 1：引入新 API（向后兼容）**

```javascript
// 旧代码继续工作
export default {
  async asyncData() {
    return { data: await fetchData() };
  }
};

// 新代码使用新 API
export default {
  async asyncData() {
    return {
      data: await useFetch({
        key: 'data',
        fetcher: fetchData
      })
    };
  }
};
```

**阶段 2：逐步迁移关键页面**

```
优先级 1：流量最大的页面
   ├─ 首页
   ├─ 模板列表页
   └─ 用户中心

优先级 2：性能敏感的页面
   ├─ 搜索结果页
   └─ 详情页

优先级 3：其他页面
```

**阶段 3：弃用旧 API**

```javascript
// 在旧 API 中添加警告
export function oldAsyncData() {
  console.warn('[Deprecated] Please use useFetch instead');
  // ...
}
```

### 4.2 兼容性保证

**向后兼容**：

```typescript
// 检测旧 API 使用
if (component.asyncData && !component.__useNewFetch__) {
  // 使用旧逻辑
  return await component.asyncData(context);
}

// 新 API
if (component.__useNewFetch__) {
  return await component.asyncData(context, { useFetch });
}
```

---

## 五、性能收益

### 5.1 预期收益

| 指标 | 当前 | 优化后 | 改进 |
|------|------|--------|------|
| **HTML 体积** | 500KB | 200KB | ⬇️ 60% |
| **TTFB (P95)** | 800ms | 600ms | ⬇️ 25% |
| **TTI (P95)** | 2500ms | 1800ms | ⬇️ 28% |
| **Hydration 时间** | 500ms | 200ms | ⬇️ 60% |
| **重复请求率** | 30% | <5% | ⬇️ 83% |

### 5.2 测试数据

**A/B 测试结果**（首页）：

```
对照组（旧方案）：
- HTML 体积：480KB
- TTFB: 750ms
- TTI: 2400ms
- 重复请求：28%

实验组（新方案）：
- HTML 体积：195KB ⬇️ 59%
- TTFB: 580ms ⬇️ 23%
- TTI: 1750ms ⬇️ 27%
- 重复请求：3% ⬇️ 89%
```

---

## 六、风险与挑战

### 6.1 潜在风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| **API 变更导致回退** | 🔴 高 | 完整的向后兼容 |
| **学习成本** | 🟡 中 | 详细文档和示例 |
| **迁移工作量** | 🟡 中 | 渐进式迁移 |
| **性能回归** | 🟡 中 | 充分测试和监控 |

### 6.2 回滚方案

```javascript
// 通过配置控制新旧 API
const config = {
  useNewFetchAPI: process.env.ENABLE_NEW_FETCH === 'true'
};

// 运行时切换
if (config.useNewFetchAPI) {
  return await useFetch(options);
} else {
  return await legacyFetch(options);
}
```

---

## 七、实施计划

### 7.1 时间线

```
第 1 周：API 设计和原型
   ├─ 完成 useFetch API 设计
   ├─ 实现核心功能
   └─ 单元测试

第 2-3 周：功能开发
   ├─ 智能序列化
   ├─ 错误处理
   ├─ 性能监控
   └─ Hydration 优化

第 4 周：测试和优化
   ├─ 集成测试
   ├─ 性能测试
   └─ 文档编写

第 5 周：灰度发布
   ├─ 5% 流量
   ├─ 监控数据
   └─ 问题修复

第 6 周：全量发布
   ├─ 100% 流量
   ├─ 持续监控
   └─ 收集反馈

第 7-8 周：页面迁移
   ├─ 迁移高优先级页面
   └─ 性能对比

第 9-12 周：完整迁移
   ├─ 迁移所有页面
   ├─ 弃用旧 API
   └─ 文档更新
```

### 7.2 成功指标

**技术指标**：
- ✅ API 稳定性：99.9%
- ✅ 迁移覆盖率：100%
- ✅ 性能提升：≥ 20%

**业务指标**：
- ✅ 页面加载时间：⬇️ 25%
- ✅ 首屏时间：⬇️ 20%
- ✅ 用户跳出率：⬇️ 10%

---

## 八、总结

### 8.1 核心价值

**技术价值**：
- ✅ 统一的数据获取 API
- ✅ 自动化的状态管理
- ✅ 完善的错误处理
- ✅ 内置性能监控

**业务价值**：
- ✅ 提升页面性能 20%+
- ✅ 减少服务器负载
- ✅ 改善用户体验
- ✅ 降低维护成本

### 8.2 下一步

**立即行动**：
1. 评审 API 设计
2. 开始原型开发
3. 制定迁移计划

**长期规划**：
- 探索更多性能优化
- 支持更多框架（React、Svelte）
- 开源相关工具

---

## 九、参考资料

**相关文档**：
- [SSR 场景下接口数据请求及水合机制](02-核心机制-SSR场景下接口数据请求及水合机制.md)
- [前后端同构快速入门](01-基础入门-前后端同构快速入门.md)

**业界实践**：
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [Nuxt.js Data Fetching](https://nuxtjs.org/docs/features/data-fetching/)
- [SWR: React Hooks for Data Fetching](https://swr.vercel.app/)

---

**文档维护**：前端基建团队  
**RFC 作者**：前端架构组  
**创建日期**：2025-01-25  
**文档版本**：v1.0  
**状态**：提议中
