# RFC 12.4: AB 支持花瓣服务端

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=459746960

---

## 文档概述

本 RFC 提出了 **@gaoding/gd-abtest SDK 支持服务端渲染（SSR）** 的方案，特别针对**花瓣项目**（基于 Next.js）的架构特点。

**核心目标**：
- 🎯 AB SDK 支持 SSR 环境
- 🚫 消除页面闪烁问题
- ⚡ 保持良好的性能表现
- 🔄 确保 SSR 和 CSR 一致性

**相关文档**：
- 前置：[RFC 12.1: AB 实验与缓存策略改进](09-AB实验-RFC12.1-SSR场景下的AB实验与缓存策略改进.md)
- 前置：[RFC 12.2: AB 实验数据获取优化](10-AB实验-RFC12.2-SSR场景下的AB实验数据获取优化.md)
- 前置：[RFC 12.3: 提高 AB 缓存命中率](11-AB实验-RFC12.3-提高AB缓存命中率.md)

---

## 一、背景与问题

### 1.1 花瓣项目架构

**技术栈**：

```
花瓣项目架构
├── Next.js（SSR 框架）
├── React（UI 框架）
└── @gaoding/gd-abtest（AB SDK）
```

**架构特点**：

| 特性 | 稿定项目 | 花瓣项目 |
|------|---------|---------|
| **SSR 框架** | Meta SSR（自研）| Next.js（开源）|
| **中间层** | ✅ BFF + Worker | ❌ 无中间层 |
| **AB 预获取** | ✅ Worker 层获取 | ❌ 无法预获取 |
| **架构层级** | 3 层（Worker→BFF→SSR）| 1 层（直接 SSR）|

**架构对比图**：

```
稿定架构：
┌─────────┐
│  用户    │
└────┬────┘
     │
     ▼
┌─────────┐
│ Worker  │ ← 在这里获取 AB 数据
└────┬────┘
     │
     ▼
┌─────────┐
│  BFF    │ ← 缓存处理
└────┬────┘
     │
     ▼
┌─────────┐
│  SSR    │ ← 使用传递的 AB 数据
└─────────┘

花瓣架构：
┌─────────┐
│  用户    │
└────┬────┘
     │
     ▼
┌─────────┐
│ Next.js │ ← ❌ 直接 SSR，无中间层
│  SSR    │
└─────────┘
```

### 1.2 现有问题

#### 问题：页面闪烁

**现象**：

```
步骤 1：服务端渲染（SSR）
   ↓
@gaoding/gd-abtest 不支持 SSR
   ↓
返回默认版本的页面（无 AB）

步骤 2：浏览器接收 HTML
   ↓
显示默认版本

步骤 3：客户端 JS 执行
   ↓
@gaoding/gd-abtest 获取 AB 数据
   ↓
用户命中实验组

步骤 4：页面重新渲染
   ↓
从默认版本 → 实验版本
   ↓
❌ 页面闪烁/跳变
```

**截图对比**：

| 服务端渲染（默认版本）| 客户端执行 AB 后（实验版本）|
|---------------------|--------------------------|
| ![服务端渲染](../RFC%2012.4：AB%20支持花瓣服务端/attachments/image2025-6-20_14-12-29.png) | ![客户端AB](../RFC%2012.4：AB%20支持花瓣服务端/attachments/image2025-6-20_14-12-44.png) |

**影响**：

- 🔴 **用户体验差**：页面加载后出现明显闪烁
- 🔴 **视觉跳变**：布局、颜色、内容突然改变
- 🔴 **尤为突出**：在框架改版等大范围实验中

#### 根本原因

**@gaoding/gd-abtest SDK 设计**：

```javascript
// 当前 SDK 只支持浏览器环境
if (typeof window === 'undefined') {
  // 服务端环境，SDK 无法工作 ❌
  throw new Error('AB SDK only works in browser');
}

// 只能在客户端获取 AB 数据
const abData = await fetch('/api/ab-experiments');
```

**限制**：
- ❌ 无法在 SSR 阶段获取 AB 数据
- ❌ 无法在 SSR 阶段应用 AB 策略
- ❌ SSR 和 CSR 结果不一致

### 1.3 为什么不能复用稿定方案

**稿定方案要求**：

```
1. Worker 层：预先获取 AB 数据
2. BFF 层：传递 AB 数据到 SSR
3. SSR 层：从 Header 或 Redis 读取 AB 数据
```

**花瓣项目缺失**：

```
❌ 无 Worker 层
❌ 无 BFF 层
❌ 无中间层传递机制
```

**结论**：需要为花瓣项目设计新的方案

---

## 二、提议内容

### 2.1 核心提议

**提议 1：AB SDK 支持 SSR**

```
@gaoding/gd-abtest SDK 提供服务端渲染支持
   ↓
确保开发体验和客户端使用一致
   ↓
在 SSR 环境中也能正常工作
```

**提议 2：确保渲染一致性**

```
SSR 和 CSR 看到相同的 AB 实验结果
   ↓
避免 hydration mismatch 报错
   ↓
消除页面闪烁
```

### 2.2 方案目标

| 维度 | 目标 |
|------|------|
| **功能** | ✅ AB SDK 在 SSR 中正常工作 |
| **性能** | ✅ TTFB 增加 < 50ms (P95) |
| **体验** | ✅ 无页面闪烁 |
| **兼容** | ✅ 支持 Next.js 和其他 SSR 框架 |
| **开发** | ✅ 最小化业务代码改动 |

---

## 三、详细设计

### 3.1 AB 策略获取

#### 调整方向

**当前**：客户端获取

```javascript
// 客户端执行
useEffect(() => {
  const abData = await fetch('/api/ab-experiments');
  setABData(abData);
}, []);
```

**调整为**：服务端获取

```javascript
// 服务端执行
export async function getServerSideProps(context) {
  const abData = await getABExperiments(context.req);
  return { props: { abData } };
}
```

#### 获取策略

**策略 1：Redis 优先**

```
步骤 1：检查 Cookie 中的 ab-test-id
   ↓
存在 ab-test-id
   ↓
步骤 2：从 Redis 获取缓存的 AB 数据
   ↓
命中缓存 → 返回数据
   ↓
未命中 → 步骤 3

步骤 3：接口获取（降级）
```

**实现代码**：

```javascript
// AB 数据获取（服务端）
import axios from 'axios';
import redis from './redis-client';

async function getABExperiments(req) {
  // 步骤 1：检查 Cookie
  const abTestId = req.cookies['ab-test-id'];
  
  if (abTestId) {
    // 步骤 2：尝试从 Redis 获取
    try {
      const cached = await redis.get(`ab:${abTestId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis get failed', error);
    }
  }
  
  // 步骤 3：接口获取（降级）
  try {
    const response = await axios.get('https://ab-service.com/experiments', {
      headers: {
        'X-User-Id': req.headers['x-user-id'] || '',
        'X-Device-Id': req.headers['x-device-id'] || '',
        'User-Agent': req.headers['user-agent']
      },
      timeout: 300 // 300ms 超时
    });
    
    const abData = response.data;
    
    // 生成 ab-test-id 并缓存
    const newAbTestId = md5(JSON.stringify(abData));
    await redis.setex(`ab:${newAbTestId}`, 1800, JSON.stringify(abData));
    
    // 更新 Cookie（在响应中设置）
    res.cookie('ab-test-id', newAbTestId, {
      maxAge: 1800 * 1000, // 30 分钟
      httpOnly: true
    });
    
    return abData;
  } catch (error) {
    console.error('AB service failed', error);
    return {}; // 返回空对象（降级）
  }
}
```

#### 技术选择：axios

**为什么选择 axios**：

| 特性 | axios | node-fetch | 内置 fetch |
|------|-------|-----------|-----------|
| **SSR 支持** | ✅ 原生支持 | ✅ 需安装 | ❌ Node 18+ |
| **CSR 支持** | ✅ 原生支持 | ❌ 仅 SSR | ✅ 原生支持 |
| **稿定已使用** | ✅ 是 | ❌ 否 | ❌ 否 |
| **花瓣已使用** | ✅ 是 | ❌ 否 | ❌ 否 |

**依赖声明**（peerDependencies）：

```json
{
  "name": "@gaoding/gd-abtest",
  "peerDependencies": {
    "axios": "^0.27.0 || ^1.0.0"
  }
}
```

**好处**：
- ✅ 避免 SDK 内置 axios 版本冲突
- ✅ 业务自行控制 axios 版本
- ✅ 减少 bundle 体积

### 3.2 服务端和客户端渲染一致性

#### 核心原则

> **必须确保 SSR 和 CSR 看到完全一致的内容**

**否则会出现**：
- ❌ Hydration mismatch 报错
- ❌ 页面闪烁
- ❌ 用户体验差

#### 方案 A：Next.js 应用（推荐）⭐

**Next.js 的内置机制**：

```
SSR 阶段：
   1. getServerSideProps 获取数据
   2. 数据注入到 props
   3. 渲染 HTML
   4. 将数据序列化到 <script id="__NEXT_DATA__">

CSR 阶段：
   1. 从 __NEXT_DATA__ 读取数据
   2. 恢复页面状态
   3. hydration（无需重新请求）

结果：✅ 完全一致
```

**实现代码**：

```javascript
// pages/index.js
import { gdABTest } from '@gaoding/gd-abtest';

export async function getServerSideProps(context) {
  // 服务端获取 AB 数据
  const abData = await getABExperiments(context.req);
  
  return {
    props: {
      abData // 传递给组件
    }
  };
}

export default function HomePage({ abData }) {
  // 初始化 AB SDK
  const ab = gdABTest.setExps(abData);
  
  // 使用 AB 实验
  const showNewLayout = ab.getExperiment('homepage_layout') === 'variant_b';
  
  return (
    <div>
      {showNewLayout ? <NewLayout /> : <OldLayout />}
    </div>
  );
}
```

**数据流**：

```html
<!-- 服务端渲染的 HTML -->
<!DOCTYPE html>
<html>
<head>
  <script id="__NEXT_DATA__" type="application/json">
    {
      "props": {
        "pageProps": {
          "abData": {
            "homepage_layout": "variant_b",
            "template_list": "variant_a"
          }
        }
      }
    }
  </script>
</head>
<body>
  <!-- 已应用 AB 的内容 -->
  <div>
    <NewLayout /> <!-- variant_b -->
  </div>
</body>
</html>
```

**客户端 hydration**：

```javascript
// 客户端执行
// Next.js 自动从 __NEXT_DATA__ 读取 props
const abData = window.__NEXT_DATA__.props.pageProps.abData;

// AB SDK 使用相同的数据
const ab = gdABTest.setExps(abData);

// ✅ 结果完全一致，无闪烁
```

#### 方案 B：非 Next.js 应用

**对于稿定框架（@web-widget）**：

```javascript
// 使用 @web-widget/helpers/cache
import { cacheProvider } from '@web-widget/helpers/cache';

// 服务端获取并缓存
const abData = await cacheProvider('ab-experiments', async () => {
  return await getABExperiments(req);
});

// 设置到 AB SDK
gdABTest.setExps(abData);

// 客户端会自动从缓存获取
// ✅ 保持一致
```

**对于其他框架**：

**核心思路**：将 AB 数据注入到 HTML

```javascript
// 服务端渲染
const abData = await getABExperiments(req);

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <script>
      window.__AB_DATA__ = ${JSON.stringify(abData)};
    </script>
  </head>
  <body>
    <!-- 页面内容 -->
  </body>
  </html>
`;

res.send(html);
```

**客户端使用**：

```javascript
// 客户端初始化
const abData = window.__AB_DATA__ || {};
gdABTest.setExps(abData);

// ✅ 使用服务端传递的数据
```

#### SDK API 设计

```javascript
// @gaoding/gd-abtest SDK

class ABTest {
  constructor() {
    this.experiments = {};
  }
  
  // 设置实验数据（SSR 传递）
  setExps(experiments) {
    this.experiments = experiments;
    return this;
  }
  
  // 获取实验数据（用于传递给 setExps）
  getExps() {
    return this.experiments;
  }
  
  // 获取单个实验结果
  getExperiment(name) {
    return this.experiments[name];
  }
  
  // 检查是否命中实验
  isInExperiment(name, variant) {
    return this.experiments[name] === variant;
  }
}

export const gdABTest = new ABTest();
```

**使用示例**：

```javascript
// SSR 阶段
const abData = await getABExperiments(req);
gdABTest.setExps(abData);

// 使用
const layout = gdABTest.getExperiment('homepage_layout');

// CSR 阶段
gdABTest.setExps(window.__NEXT_DATA__.props.pageProps.abData);

// ✅ 完全一致
```

### 3.3 缓存相关

#### 页面缓存

**目标**：为未来的页面缓存做准备

**ab-test-id 生成**：

```javascript
// 生成 ab-test-id
function generateABTestId(abData) {
  // 对 AB 数据进行 MD5
  return md5(JSON.stringify(abData));
}

// 设置 Cookie
res.cookie('ab-test-id', generateABTestId(abData), {
  maxAge: 1800 * 1000, // 30 分钟
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

**Cache Key 设计**：

```javascript
// 未来的页面缓存 Key
function getPageCacheKey(url, abTestId) {
  return hash(url + abTestId);
}

// 不同 AB 组，不同缓存
// url=/home, ab-test-id=abc123 → cacheKey1
// url=/home, ab-test-id=def456 → cacheKey2
```

#### AB 策略缓存

**问题**：每次 SSR 都请求 AB 接口，影响 TTFB

**AB 接口性能**：

```
平均耗时：100ms
P95 耗时：200ms
P99 耗时：500ms

影响：
   TTFB 增加 100-500ms ❌
```

**解决方案**：Redis 缓存

```
步骤 1：首次请求
   ├─ 调用 AB 接口（100ms）
   ├─ 生成 ab-test-id
   ├─ 缓存到 Redis（30 分钟）
   └─ 返回数据

步骤 2：后续请求（30 分钟内）
   ├─ 从 Redis 读取（<5ms）
   └─ 直接返回 ✅

步骤 3：缓存过期后
   ├─ 重新请求 AB 接口
   └─ 更新缓存
```

**实现（插件化）**：

```javascript
// AB SDK 提供插件接口
class ABTest {
  setCachePlugin(plugin) {
    this.cachePlugin = plugin;
  }
  
  async getExperimentsWithCache(req) {
    if (!this.cachePlugin) {
      // 无缓存插件，直接请求
      return await this.fetchExperiments(req);
    }
    
    // 使用缓存
    const abTestId = req.cookies['ab-test-id'];
    if (abTestId) {
      const cached = await this.cachePlugin.get(abTestId);
      if (cached) {
        return cached;
      }
    }
    
    // 未命中，请求并缓存
    const data = await this.fetchExperiments(req);
    const newId = generateABTestId(data);
    await this.cachePlugin.set(newId, data, 1800);
    
    return data;
  }
}
```

**业务提供缓存实现**：

```javascript
// 业务代码（花瓣项目）
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis.example.com',
  port: 6379
});

// 缓存插件
const redisCachePlugin = {
  async get(key) {
    const value = await redis.get(`ab:${key}`);
    return value ? JSON.parse(value) : null;
  },
  
  async set(key, value, ttl) {
    await redis.setex(`ab:${key}`, ttl, JSON.stringify(value));
  }
};

// 设置到 AB SDK
gdABTest.setCachePlugin(redisCachePlugin);
```

**好处**：
- ✅ AB SDK 不依赖特定缓存实现
- ✅ 业务灵活选择（Redis / CDN / 内存）
- ✅ 解耦设计

### 3.4 AB 策略刷新

#### 触发时机

**时机 1：登录状态变化**

```
用户未登录 → 用户登录
   ↓
setAttributes({ userId: '12345', orgId: '67890' })
   ↓
触发 AB 策略重新获取
   ↓
更新 ab-test-id
```

**原因**：
- 有些实验基于 userId 或 orgId
- 登录前后应该看到不同的实验结果

**时机 2：定时刷新（客户端）**

```
每 10 分钟，客户端主动刷新
   ↓
重新获取 AB 策略
   ↓
更新 ab-test-id Cookie
   ↓
更新 Redis 缓存
```

**原因**：
- 缓解服务端直接请求 AB 接口的压力
- 保持缓存相对新鲜

#### 实现

**登录状态变化**：

```javascript
// AB SDK
class ABTest {
  async setAttributes(attributes) {
    this.attributes = { ...this.attributes, ...attributes };
    
    // 检查关键属性变化
    const keyChanged = attributes.userId || attributes.orgId;
    
    if (keyChanged) {
      // 重新获取 AB 策略
      const newExperiments = await this.fetchExperiments();
      this.setExps(newExperiments);
      
      // 更新 ab-test-id Cookie
      const newAbTestId = generateABTestId(newExperiments);
      document.cookie = `ab-test-id=${newAbTestId}; max-age=1800; path=/`;
    }
  }
}

// 业务代码
// 用户登录后
gdABTest.setAttributes({
  userId: '12345',
  orgId: '67890'
});
```

**定时刷新**：

```javascript
// 客户端定时刷新
setInterval(async () => {
  try {
    // 重新获取 AB 策略
    const newExperiments = await gdABTest.fetchExperiments();
    
    // 更新本地数据
    gdABTest.setExps(newExperiments);
    
    // 更新 ab-test-id Cookie
    const newAbTestId = generateABTestId(newExperiments);
    document.cookie = `ab-test-id=${newAbTestId}; max-age=1800; path=/`;
    
    console.log('AB策略已刷新');
  } catch (error) {
    console.error('AB策略刷新失败', error);
  }
}, 10 * 60 * 1000); // 10 分钟
```

**好处**：
- ✅ 服务端可以更多地使用缓存
- ✅ 减少 AB 接口压力
- ✅ 保持数据相对新鲜

---

## 四、需要讨论的问题

### 4.1 问题 1：影响服务端性能

**问题描述**：

```
即使有 Redis 缓存，但在以下情况下仍需请求 AB 接口：
   1. 首次访问（无 ab-test-id）
   2. ab-test-id 过期
   3. Redis 未命中

每次 AB 接口调用：
   - 平均耗时：100ms
   - P95 耗时：200ms
   - P99 耗时：500ms

影响：TTFB 增加 100-500ms ❌
```

**数据对比**：

| 场景 | TTFB (无AB) | TTFB (有AB) | 增加 |
|------|------------|------------|------|
| **缓存命中** | 300ms | 305ms | +5ms ✅ |
| **缓存未命中** | 300ms | 400ms | +100ms ⚠️ |
| **接口慢** | 300ms | 800ms | +500ms 🔴 |

**讨论点**：

1. **是否可接受**？
   - ✅ 缓存命中时影响很小（+5ms）
   - ⚠️ 缓存未命中时有影响（+100ms）
   - 🔴 接口慢时影响大（+500ms）

2. **如何优化**？
   - 方案 A：提高缓存命中率（延长TTL）
   - 方案 B：AB 接口性能优化
   - 方案 C：接受性能损失（换取体验）

**建议**：

```
优先级 1：提高缓存命中率
   - ab-test-id TTL: 30分钟 → 60分钟
   - 客户端定时刷新：10分钟

优先级 2：AB 接口性能优化
   - 增加超时控制（300ms）
   - 降级策略（超时返回空）

优先级 3：监控和告警
   - 监控 AB 接口耗时
   - 告警阈值：P95 > 200ms
```

### 4.2 问题 2：stale-while-revalidate 策略

**问题描述**：

```
当前策略：
   ab-test-id 过期 → 请求 AB 接口 → 等待响应 → 渲染页面
   
   问题：增加 TTFB
```

**stale-while-revalidate 策略**：

```
步骤 1：ab-test-id 过期
   ↓
步骤 2：SSR 使用旧的（stale）AB 策略
   ├─ 立即渲染，不等待 AB 接口
   └─ TTFB 不受影响 ✅

步骤 3：CSR 异步检查新 AB 策略
   ├─ 后台请求 AB 接口
   ├─ 更新缓存
   └─ 下次访问使用新策略
```

**流程图**：

```
用户请求
   ↓
检查 ab-test-id
   ├─ 新鲜（<30分钟）
   │    ↓
   │  直接使用 ✅
   │
   └─ 过期（>30分钟，<7天）
        ↓
      SSR: 使用旧策略渲染
        ↓
      返回页面（快速）✅
        ↓
      CSR: 后台更新策略
        ↓
      下次访问使用新策略
```

**优点**：
- ✅ TTFB 不受 AB 接口影响
- ✅ 性能稳定

**缺点**：
- ❌ AB 结果延迟更新
- ❌ 可能使用过期的实验配置

**讨论点**：

1. **是否可接受**？
   - 取决于实验的时效性要求
   - 一般实验：可接受
   - 紧急实验：不可接受

2. **如何平衡**？
   - 方案 A：默认使用，特殊实验禁用
   - 方案 B：实验级别配置
   - 方案 C：不使用（当前方案）

**建议**：

```
阶段 1：不使用 stale-while-revalidate
   - 优先保证实验时效性
   - 观察性能影响

阶段 2：如果性能问题严重，再考虑启用
   - 仅对非关键实验启用
   - 关键实验强制刷新
```

### 4.3 问题 3：页面体积变大

**问题描述**：

```
AB 策略信息注入到 HTML：
   <script id="__NEXT_DATA__">
     { "abData": { ... } }
   </script>

问题：HTML 体积增大
```

**数据估算**：

```javascript
// 假设 10 个实验
const abData = {
  "homepage_layout": "variant_b",
  "template_list": "variant_a",
  "editor_toolbar": "variant_c",
  // ... 7 个实验
};

// JSON 序列化
const json = JSON.stringify(abData);
// 大小：约 300-500 字节

// 加上标签
const html = `<script id="__NEXT_DATA__">${json}</script>`;
// 大小：约 350-600 字节
```

**影响分析**：

| 页面大小 | AB 数据 | 增加比例 |
|---------|--------|---------|
| 50 KB | 500 B | +1% |
| 100 KB | 500 B | +0.5% |
| 200 KB | 500 B | +0.25% |

**结论**：
- ✅ 绝对增加：300-500 字节
- ✅ 相对增加：< 1%
- ✅ 影响微乎其微

**优化建议**（如果需要）：

```javascript
// 1. 压缩字段名
const abData = {
  "h_layout": "b",  // homepage_layout: variant_b
  "t_list": "a"     // template_list: variant_a
};

// 2. 使用数组代替对象
const abData = ["b", "a", "c"]; // 按固定顺序

// 3. Base64 编码（减少特殊字符）
const encoded = btoa(JSON.stringify(abData));
```

**建议**：
- 🎯 **不优化**：影响太小，不值得增加复杂度
- ⚠️ **必要时优化**：如果实验数量 > 50 个

---

## 五、实施方案

### 5.1 SDK 改造

**任务清单**：

```
1. ✅ 增加 SSR 支持
   - 检测 SSR 环境
   - axios 请求适配

2. ✅ API 调整
   - setExps() 方法
   - getExps() 方法
   - getExperiment() 方法

3. ✅ 缓存插件接口
   - setCachePlugin() 方法
   - get/set 标准接口

4. ✅ 登录态刷新
   - setAttributes() 方法
   - 自动触发刷新

5. ✅ 定时刷新（客户端）
   - 每 10 分钟刷新
   - 可配置

6. ✅ 错误处理和降级
   - 超时控制
   - 降级策略
```

### 5.2 花瓣项目接入

**步骤 1：安装依赖**

```bash
npm install @gaoding/gd-abtest@latest axios ioredis
```

**步骤 2：配置 Redis**

```javascript
// lib/redis.js
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
```

**步骤 3：配置 AB SDK**

```javascript
// lib/ab-test.js
import { gdABTest } from '@gaoding/gd-abtest';
import { redis } from './redis';

// 配置缓存插件
gdABTest.setCachePlugin({
  async get(key) {
    const value = await redis.get(`ab:${key}`);
    return value ? JSON.parse(value) : null;
  },
  async set(key, value, ttl) {
    await redis.setex(`ab:${key}`, ttl, JSON.stringify(value));
  }
});

export { gdABTest };
```

**步骤 4：在页面中使用**

```javascript
// pages/index.js
import { gdABTest } from '../lib/ab-test';

export async function getServerSideProps(context) {
  // 服务端获取 AB 数据
  const abData = await gdABTest.getExperimentsWithCache(context.req);
  
  return {
    props: { abData }
  };
}

export default function HomePage({ abData }) {
  // 初始化 AB SDK
  gdABTest.setExps(abData);
  
  // 使用实验
  const showNewLayout = gdABTest.getExperiment('homepage_layout') === 'variant_b';
  
  return (
    <div>
      {showNewLayout ? <NewHomePage /> : <OldHomePage />}
    </div>
  );
}
```

**步骤 5：客户端刷新**

```javascript
// pages/_app.js
import { useEffect } from 'react';
import { gdABTest } from '../lib/ab-test';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 定时刷新 AB 策略
    const interval = setInterval(async () => {
      await gdABTest.refreshExperiments();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <Component {...pageProps} />;
}
```

### 5.3 监控和告警

**监控指标**：

| 指标 | 说明 | 目标 | 告警阈值 |
|------|------|------|---------|
| **AB 接口耗时** | P95 响应时间 | ≤ 200ms | > 300ms |
| **Redis 命中率** | 缓存命中率 | ≥ 90% | < 80% |
| **TTFB 影响** | SSR TTFB 增加 | ≤ 50ms | > 100ms |
| **错误率** | AB 获取失败率 | < 1% | > 5% |

---

## 六、总结

### 6.1 方案价值

**解决的问题**：

1. ✅ **页面闪烁**
   - SSR 和 CSR 完全一致
   - 用户体验显著提升

2. ✅ **SSR 支持**
   - AB SDK 在 SSR 中正常工作
   - 开发体验一致

3. ✅ **性能优化**
   - Redis 缓存减少 AB 接口调用
   - TTFB 影响可控（< 50ms）

4. ✅ **架构适配**
   - 适配花瓣（Next.js）架构
   - 插件化设计，灵活扩展

### 6.2 关键要点

**技术要点**：

1. ✅ **SDK SSR 支持**
   - axios 统一请求
   - setExps/getExps API

2. ✅ **数据一致性**
   - Next.js __NEXT_DATA__ 机制
   - 其他框架注入 window.__AB_DATA__

3. ✅ **缓存策略**
   - Redis 缓存 AB 数据
   - ab-test-id 作为 Cache Key

4. ✅ **刷新机制**
   - 登录状态变化触发
   - 客户端定时刷新

### 6.3 待解决问题

**需要团队讨论**：

1. ⚠️ **性能影响的可接受度**
   - TTFB 增加 50-100ms
   - 如何优化

2. ⚠️ **是否使用 stale-while-revalidate**
   - 性能 vs 时效性
   - 如何平衡

3. ⚠️ **AB 接口性能优化**
   - 是否需要专项优化
   - 目标耗时

### 6.4 下一步

1. ✅ SDK 改造和测试
2. ✅ 花瓣项目试点接入
3. ✅ 监控数据收集
4. ✅ 根据数据优化方案
5. ✅ 推广到其他项目

---

**文档维护**：前端基建团队  
**RFC 作者**：前端架构组  
**整理日期**：2025-01-25  
**文档版本**：v1.0
