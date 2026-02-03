# RFC 12.1: SSR 场景下的 AB 实验与缓存策略改进

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=385689046

---

## 文档概述

本 RFC 提出了 **SSR 场景下 AB 实验基础设施的改进方案**，解决 AB 实验在服务端渲染环境中的兼容性问题和缓存策略优化。

**核心目标**：
- 🎯 AB 实验在 SSR 中生效
- 💾 优化缓存策略避免碎片化
- ⚡ 提升性能和用户体验
- 🔄 兼容 CSR 和 SSR 两种模式

**状态**：
- ✅ 与基建团队达成共识
- ✅ 与业务相关团队达成共识
- ✅ 输出排期
- ✅ 输出 PR
- ✅ 已上线

**相关链接**：
- [排期计划](https://pingcode.intra.gaoding.com/pjm/projects/SREJC/backlog/652692bfa5244157b8845984)

---

## 一、描述

### 1.1 文档范围

**本 RFC 涵盖**：
- ✅ SSR 下的 AB 实验基础设施
- ✅ 缓存策略改进
- ✅ AB SDK 适配方案

**不在范围内**：
- ❌ CDN 边缘缓存（后续 RFC 处理）
- ❌ 灰度系统（独立系统）

### 1.2 背景

**架构演进**：

```
过去：CSR 优先架构
   ├─ AB SDK 基于 CSR 设计
   └─ 客户端获取 AB 实验数据

现在：SSR 优先架构
   ├─ 提供更优的用户体验
   ├─ SEO 友好
   └─ 但 AB SDK 出现非预期行为 ❌
```

---

## 二、动机

### 2.1 问题背景

**技术栈变化**：
- 从 **CSR（客户端渲染）优先** → **SSR（服务端渲染）优先**
- AB 实验 SDK 基于 CSR 模式设计
- 在 SSR 架构下出现问题

### 2.2 现象一：接口 AB 实验没有生效

**Bug 案例**：TYCPYF-7690

**问题流程**：

```
步骤 1：用户访问页面
   ↓
页面来自 SSR（服务端渲染）
   ↓
❌ 获取的是没有 AB 实验的内容

步骤 2：用户操作页面
   ↓
触发异步 API 请求
   ↓
页面局部重新渲染
   ↓
✅ 此时才呈现 AB 实验结果

步骤 3：用户刷新页面
   ↓
又回到 SSR 渲染
   ↓
❌ 又是没有 AB 实验的状态
```

**用户体验影响**：

| 操作 | 看到的内容 | 用户感受 |
|------|-----------|---------|
| **首次访问** | 没有 AB 实验 | ⚠️ 不一致 |
| **页面交互** | 有 AB 实验 | ✅ 正常 |
| **刷新页面** | 没有 AB 实验 | ⚠️ 内容变了？ |

### 2.3 现象二：频繁的内容替换

**案例**：首页编辑推荐区域

![频繁的内容替换](../RFC%2012.1%20%20SSR%20场景下的%20AB%20实验与缓存策略改进/attachments/image2024-6-24_17-2-59.png)

**问题流程**：

```
步骤 1：用户进入首页
   ↓
页面来自 SSR + 缓存（10分钟前）
   ↓
❌ 显示没有 AB 实验的内容

步骤 2：生命周期缓存过期
   ↓
浏览器 JS 发起异步请求
   ↓
命中 AB 实验
   ↓
⚠️ 页面区块内容被替换（闪烁）

步骤 3：后续每次访问
   ↓
都会看到内容替换
   ↓
❌ 体验怪异
```

**影响**：
- 🔴 页面内容闪烁
- 🔴 用户体验差
- 🔴 看起来像 Bug

---

## 三、提议内容

### 3.1 核心提议

> **提议**：在 SSR 中渲染包含 AB 实验的页面

**实现关键**：

1. **AB 实验 SDK 改进**
   - 让 SDK 能在 SSR 环境下正确工作

2. **站点缓存策略改进**
   - 将 AB 实验纳入 Cache Key
   - 根据不同实验缓存不同版本

### 3.2 改进概览

**改进前**：

```
SSR 渲染页面（无 AB）
   ↓
缓存页面（无 AB）
   ↓
客户端 JS 获取 AB
   ↓
重新渲染（有 AB）
   ↓
❌ 内容闪烁
```

**改进后**：

```
SSR 获取 AB 数据
   ↓
SSR 渲染页面（有 AB）
   ↓
缓存页面（按 AB 分组）
   ↓
客户端水合（一致）
   ↓
✅ 无闪烁
```

---

## 四、详细设计

### 4.1 AB 实验 SDK 改进

#### 改进要点

**1. 增加服务端入口**

**包结构调整**：

```
@company/ab-sdk/
├── src/
│   ├── client.ts    # 客户端实现
│   ├── server.ts    # 服务端实现
│   └── shared.ts    # 共享代码
└── package.json
```

**package.json 配置**：

```json
{
  "name": "@company/ab-sdk",
  "exports": {
    ".": {
      "worker": {
        "default": "./dist/server.js"
      },
      "browser": {
        "default": "./dist/client.js"
      },
      "default": "./dist/server.js"
    }
  }
}
```

**2. 使用请求上下文**

**服务端实现**：

```javascript
// server.ts
import { context } from '@web-widget/helpers/context';

export async function getABExperiment(experimentName) {
  // 获取请求上下文
  const { request } = context();
  
  // 从 Cookie 获取 AB 组
  const abTestId = request.cookies.get('x-ab-test-id')?.value;
  
  if (abTestId) {
    // 使用缓存的 AB 组
    return parseABFromCache(abTestId, experimentName);
  }
  
  // 首次访问，请求 AB 服务
  const abData = await fetchABService(request.headers);
  return abData[experimentName];
}
```

**客户端实现**：

```javascript
// client.ts
export async function getABExperiment(experimentName) {
  // 从全局对象获取（SSR 注入）
  if (window.__AB_EXPERIMENTS__) {
    return window.__AB_EXPERIMENTS__[experimentName];
  }
  
  // 降级：客户端请求
  const abData = await fetch('/api/ab-experiments').then(r => r.json());
  return abData[experimentName];
}
```

**业务代码使用**（无需改动）：

```javascript
// 业务组件
import { getABExperiment } from '@company/ab-sdk';

export default {
  async setup() {
    // ✅ 服务端和客户端都能工作
    const experiment = await getABExperiment('homepage_layout');
    
    return {
      showNewLayout: experiment === 'variant_b'
    };
  }
}
```

**关键优势**：

| 特性 | 说明 | 价值 |
|------|------|------|
| **无需改动业务代码** | SDK 内部适配 | ✅ 降低迁移成本 |
| **使用 context()** | 无需传递 request | ✅ 简化代码 |
| **条件导出** | 自动选择正确实现 | ✅ 透明切换 |

### 4.2 站点缓存策略改进

#### 背景

**现有缓存规模**：
- 页面级别缓存
- 百万级别 URL
- 登录前后分别缓存

**缓存策略**：

| 场景 | 缓存策略 | AB 实验影响 |
|------|---------|-----------|
| **登录后** | 按用户缓存 | ⚠️ 包含个性化推荐 |
| **登录前** | 按 URL 缓存 | 🎯 需要解决 AB 问题 |

**聚焦**：登录前的缓存策略

#### 方案设计

**核心思路**：将 AB 实验纳入 Cache Key

**Cache Key 组成**：

```javascript
// 改进前
const cacheKey = hash(url);

// 改进后
const cacheKey = hash(url + abTestGroupId);
```

**abTestGroupId 计算**：

**公式**：

```
缓存版本数 = 2^n (n = 实验数量)
```

**示例 1：单个实验**

```
实验：/api/foo
   ├─ variant_a
   └─ variant_b

缓存版本：
   1. hash('/api/foo:a')
   2. hash('/api/foo:b')

总数：2 个
```

**示例 2：两个实验**

```
实验 1：/api/foo
   ├─ variant_a
   └─ variant_b

实验 2：/api/bar
   ├─ variant_a
   └─ variant_b

缓存版本：
   1. hash('/api/foo:a' + '/api/bar:a')
   2. hash('/api/foo:a' + '/api/bar:b')
   3. hash('/api/foo:b' + '/api/bar:a')
   4. hash('/api/foo:b' + '/api/bar:b')

总数：4 个
```

**代码实现**：

```javascript
// 计算 abTestGroupId
function calculateABTestGroupId(experiments) {
  const sortedExperiments = Object.keys(experiments)
    .sort()  // 确保顺序一致
    .map(key => `${key}:${experiments[key]}`);
  
  return hash(sortedExperiments.join('+'));
}

// 使用示例
const experiments = {
  '/api/foo': 'variant_a',
  '/api/bar': 'variant_b'
};

const abTestGroupId = calculateABTestGroupId(experiments);
// → "abc123def456"

const cacheKey = hash(url + abTestGroupId);
```

#### 性能优化

**问题**：
- 每次请求都要调用 AB 接口
- 计算 abTestGroupId
- 性能损耗

**解决方案**：将 abTestGroupId 缓存到 Cookie

**Cookie 设计**：

```
Cookie Name: x-ab-test-id
Cookie Value: abc123def456 (abTestGroupId hash)
Max-Age: 7 天
HttpOnly: true
```

**优化流程**：

```
步骤 1：检查 Cookie
   ├─ 存在 x-ab-test-id
   │    ↓
   │  直接使用 Cookie 值作为 Cache Key
   │    ↓
   │  检查缓存
   │    ├─ 命中 → 返回缓存
   │    └─ 未命中 → SSR 渲染
   │
   └─ 不存在 x-ab-test-id
        ↓
      调用 AB 接口
        ↓
      计算 abTestGroupId
        ↓
      种入 Cookie
        ↓
      SSR 渲染
```

**代码实现**：

```javascript
// BFF 层处理
async function handleSSRRequest(req, res) {
  let abTestGroupId = req.cookies['x-ab-test-id'];
  
  if (!abTestGroupId) {
    // 首次访问，获取 AB 数据
    const abData = await fetchABExperiments(req.headers);
    abTestGroupId = calculateABTestGroupId(abData);
    
    // 种入 Cookie（7天）
    res.cookie('x-ab-test-id', abTestGroupId, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true
    });
    
    // 同时传递 AB 数据列表
    req.headers['x-ab-test-list'] = JSON.stringify(abData);
  }
  
  // 组装 Cache Key
  const cacheKey = hash(req.url + abTestGroupId);
  
  // 检查缓存
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.send(cached);
  }
  
  // SSR 渲染
  const html = await renderSSR(req);
  
  // 写入缓存
  await cache.set(cacheKey, html, { maxAge: 600 });
  
  res.send(html);
}
```

### 4.3 方案流程图

**整体流程**：

![SSR AB 实验流程](../RFC%2012.1%20%20SSR%20场景下的%20AB%20实验与缓存策略改进/attachments/SSR%20AB%20.png)

**流程说明**：

```
1. 用户请求 → BFF 层

2. BFF 检查 Cookie 中的 x-ab-test-id
   ├─ 存在 → 跳到步骤 4
   └─ 不存在 → 步骤 3

3. BFF 获取 AB 数据
   ├─ 调用 AB 服务
   ├─ 计算 abTestGroupId
   ├─ 种入 Cookie (x-ab-test-id)
   └─ 设置 Header (x-ab-test-list)

4. BFF 组装 Cache Key
   Cache Key = hash(URL + x-ab-test-id)

5. BFF 检查缓存
   ├─ 命中 → 返回缓存
   └─ 未命中 → 步骤 6

6. 转发到 Meta SSR 服务
   Headers:
     - x-ab-test-id: abc123
     - x-ab-test-list: {"exp1": "a", "exp2": "b"}

7. Meta SSR 渲染
   ├─ AB SDK 从 Header 读取 AB 数据
   ├─ 请求接口时携带 AB Tag
   └─ 渲染包含 AB 实验的页面

8. 返回 HTML
   └─ BFF 写入缓存

9. 响应给用户
```

**关键Header**：

| Header | 作用 | 示例 |
|--------|------|------|
| `x-ab-test-id` | Cache Key 的一部分 | `abc123def456` |
| `x-ab-test-list` | SSR 渲染时的 AB 数据 | `{"exp1":"a","exp2":"b"}` |

### 4.4 实施细节

**BFF 层改造**：

```javascript
// King BFF
const redis = require('redis');
const abCache = redis.createClient();

async function getABExperiments(headers) {
  const userId = headers['x-user-id'] || 'anonymous';
  
  // 检查 Redis 缓存（避免频繁调用 AB 服务）
  const cacheKey = `ab:${userId}`;
  const cached = await abCache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 调用 AB 服务
  const abData = await fetch('https://ab-service.com/experiments', {
    headers: {
      'X-User-Id': userId,
      'X-Device-Id': headers['x-device-id']
    }
  }).then(r => r.json());
  
  // 缓存 5 分钟
  await abCache.setex(cacheKey, 300, JSON.stringify(abData));
  
  return abData;
}
```

**Meta SSR 服务改造**：

```javascript
// Meta SSR
app.use((req, res, next) => {
  // 从 Header 读取 AB 数据
  const abTestList = req.headers['x-ab-test-list'];
  
  if (abTestList) {
    // 注入到请求上下文
    req.state.abExperiments = JSON.parse(abTestList);
  }
  
  next();
});
```

---

## 五、代替方案

### 5.1 方案 A：登录前使用 CSR

**描述**：登录前的页面使用 CSR，放弃 SSR

**流程**：

```
登录前页面
   ↓
客户端渲染（CSR）
   ↓
客户端获取 AB 实验
   ↓
✅ 无缓存问题
```

**优点**：
- ✅ 实现简单
- ✅ 无缓存碎片化问题
- ✅ AB 实验灵活

**弊端**：

| 影响 | 说明 | 数据 |
|------|------|------|
| **SEO** | 完全放弃 SEO 支持 | 🔴 搜索引擎抓不到内容 |
| **性能** | LCP 指标严重劣化 | 🔴 1.x s → 4 s+ |
| **体验** | 白屏时间长 | 🔴 用户体验差 |

**结论**：❌ 不可接受

### 5.2 方案 B：SSR 但关闭缓存

**描述**：在 SSR 中渲染 AB 实验，但关闭登录前页面的缓存

**流程**：

```
登录前页面
   ↓
SSR 实时渲染（每次都请求）
   ↓
✅ 获取最新 AB 实验
   ↓
✅ 无缓存问题
```

**优点**：
- ✅ AB 实验实时生效
- ✅ 无缓存碎片化

**弊端**：

| 影响 | 说明 | 数据 |
|------|------|------|
| **性能** | TTFB 劣化 | 🔴 0.x s → 1.x s |
| **稳定性** | 失去缓存保护 | 🔴 无降级能力 |
| **负载** | 服务器负载增加 | 🔴 成本上升 |
| **SEO** | 性能指标下降 | 🔴 优秀 → 不及格 |

**结论**：❌ 不可接受

### 5.3 方案 C：仅登录后启用 AB

**描述**：只对登录后的页面启用 AB 实验

**流程**：

```
登录前页面
   ↓
SSR 渲染（无 AB）
   ↓
缓存

登录后页面
   ↓
SSR 渲染（有 AB）
   ↓
按用户缓存
```

**优点**：
- ✅ 成本低
- ✅ 无缓存碎片化问题
- ✅ 实现简单

**弊端**：
- ⚠️ 登录前用户无法参与 AB 实验
- ⚠️ 实验覆盖率降低

**结论**：⚠️ 取决于业务是否可接受

### 5.4 方案 D：局部 CSR

**描述**：页面整体 SSR，但 AB 实验区块用 CSR

**流程**：

```
页面结构（SSR）
   ↓
AB 实验区块（CSR）
   ↓
客户端渲染该区块
```

**优点**：
- ✅ 大部分内容 SSR
- ✅ AB 区块无缓存问题

**弊端**：

| 影响 | 说明 |
|------|------|
| **SEO** | AB 区块不支持 SEO | 🔴 |
| **性能** | CSR 区块渲染慢 | 🔴 LCP 劣化 |
| **闪烁** | 区块延迟加载 | 🔴 体验差 |

**结论**：❌ 不推荐

### 5.5 方案对比

| 方案 | SEO | 性能 | 复杂度 | 推荐 |
|------|-----|------|--------|------|
| **本 RFC 方案** | ✅ | ✅ | 中 | 🎯 推荐 |
| **A: CSR** | ❌ | ❌ | 低 | ❌ |
| **B: 无缓存** | ✅ | ❌ | 低 | ❌ |
| **C: 仅登录后** | ✅ | ✅ | 低 | ⚠️ 备选 |
| **D: 局部 CSR** | ⚠️ | ⚠️ | 中 | ❌ |

---

## 六、待讨论的问题

### 6.1 问题 1：缓存时效性

**问题**：

> 页面与 AB 实验配置接口均存在缓存，这进一步降低了时效性，是否应当特殊处理？

**分析**：

**缓存链**：

```
AB 配置接口缓存（5分钟）
   +
页面缓存（10分钟）
   =
最长 15 分钟的延迟
```

**对比其他内容**：

| 内容类型 | 缓存时间 | 时效性要求 |
|---------|---------|-----------|
| **AB 实验** | 5-10 分钟 | ⚠️ 中 |
| **个性化推荐** | 1-10 分钟 | ⚠️ 中 |
| **CMS 内容** | 10 分钟 | ⚠️ 中 |
| **实时数据** | 0 分钟 | 🔴 高 |

**结论**：

> **无需特殊处理**

**理由**：
- ✅ AB 实验和 CMS 内容的时效性要求类似
- ✅ 无法同时满足：时效性 + 速度 + 稳定性
- ✅ 10 分钟是可被接受的平衡点

**现有缓存策略**：

```javascript
// 登录前
Cache-Control: max-age=600, stale-while-revalidate=604800, stale-if-error=604800

// 登录后
Cache-Control: max-age=60, stale-while-revalidate=604800, stale-if-error=604800
```

**策略说明**：

| 参数 | 值 | 说明 |
|------|----|----|
| `max-age` | 600s / 60s | 缓存有效期 |
| `stale-while-revalidate` | 604800s (7天) | 后台更新时返回旧缓存 |
| `stale-if-error` | 604800s (7天) | 错误时返回旧缓存 |

**参考**：[Meta SSR 关于缓存的一切]

### 6.2 问题 2：缓存碎片化

**问题**：

> 随着接口实验数量的增加，缓存命中率会急剧下滑，最终降低了站点速度，体验下降也会给转化率带来负面影响，我们应当如何平衡？

**现状数据**：

```
截止 RFC 创建时间：
- 线上运行了 7 个接口实验
- 带来 2^7 = 128 个缓存版本 ❌
```

![实验运行时长](../RFC%2012.1%20%20SSR%20场景下的%20AB%20实验与缓存策略改进/attachments/image2024-6-26_18-20-59.png)

**问题分析**：

| 实验数 | 缓存版本数 | 缓存命中率 | 影响 |
|--------|-----------|-----------|------|
| 1 | 2 | 50% | ✅ 可接受 |
| 2 | 4 | 25% | ✅ 可接受 |
| 3 | 8 | 12.5% | ⚠️ 开始下降 |
| 5 | 32 | 3.1% | 🔴 严重下降 |
| 7 | 128 | 0.78% | 🔴 几乎无效 |

**更严重的问题**：

```
观察：有些实验超过了 1 年的时间 ❌
```

**影响**：
- 🔴 长期实验占用缓存资源
- 🔴 新实验的缓存被挤压
- 🔴 整体命中率下降

**解决方案讨论**：

**方案 A：实验生命周期管理**

```javascript
// 实验配置
{
  experimentId: 'exp001',
  startDate: '2024-01-01',
  endDate: '2024-01-31',  // ← 强制结束时间
  status: 'running'
}

// 定期清理
async function cleanupExpiredExperiments() {
  const now = Date.now();
  const experiments = await getActiveExperiments();
  
  for (const exp of experiments) {
    if (exp.endDate < now) {
      await archiveExperiment(exp.id);
      console.log(`Archived expired experiment: ${exp.id}`);
    }
  }
}
```

**方案 B：实验数量限制**

```
硬性限制：同时运行的实验不超过 3 个
   ↓
缓存版本数：2^3 = 8
   ↓
缓存命中率：12.5% (可接受)
```

**方案 C：实验优先级**

```javascript
// 高优先级实验使用 AB 缓存
// 低优先级实验使用客户端 AB
{
  experimentId: 'homepage_redesign',
  priority: 'high',  // ← SSR AB
  cacheStrategy: 'server'
}

{
  experimentId: 'button_color',
  priority: 'low',   // ← CSR AB
  cacheStrategy: 'client'
}
```

**推荐策略**：

1. ✅ **实验生命周期管理**（必须）
   - 强制设置结束时间
   - 定期清理过期实验

2. ✅ **实验数量控制**（建议）
   - 同时运行 ≤ 3 个实验
   - 需要审批流程

3. ✅ **实验优先级**（优化）
   - 核心实验用 SSR AB
   - 次要实验用 CSR AB

### 6.3 问题 3：搜索引擎爬虫

**问题**：

> 搜索引擎爬虫是否也应当参与 AB 实验？

**分析**：

**选项 A：爬虫不参与 AB**

```javascript
// 检测爬虫
function isCrawler(userAgent) {
  return /googlebot|bingbot|baiduspider/i.test(userAgent);
}

// 爬虫跳过 AB
if (isCrawler(req.headers['user-agent'])) {
  // 返回默认版本（无 AB）
  return renderDefault(req);
}
```

**风险**：
- 🔴 可能被判定为"作弊"（Cloaking）
- 🔴 SEO 排名受影响

**选项 B：爬虫参与 AB**

```javascript
// 爬虫也分配 AB 组
const abTestId = req.cookies['x-ab-test-id'] || 
                 calculateABForCrawler(req.headers['user-agent']);
```

**好处**：
- ✅ 不会被判定作弊
- ✅ SEO 安全

**问题**：
- ⚠️ 不同爬虫可能看到不同版本
- ⚠️ 同一爬虫多次访问可能看到不同版本

**结论**：

> **爬虫应当参与 AB 实验**

**确认来源**：已与 @未知用户 (junyuxian) 确认

**实施策略**：

```javascript
// 为爬虫固定分配 AB 组
function getABGroupForCrawler(userAgent) {
  // 同一爬虫始终分配到相同组
  const crawlerType = detectCrawlerType(userAgent);
  return hash(crawlerType) % 2 === 0 ? 'variant_a' : 'variant_b';
}
```

---

## 七、未来的可能性

### 7.1 客户端缓存验证

**提议**：在「服务端缓存优先」的基础上，增加「客户端重新缓存验证」

**工作流程**：

```
步骤 1：服务端返回缓存页面
   +
   带时间戳

步骤 2：浏览器显示页面
   ↓
   JavaScript 检查时间戳

步骤 3：如果超过阈值（如 5 分钟）
   ↓
   异步请求最新数据

步骤 4：对比数据
   ├─ 数据未变化 → 无操作
   └─ 数据已变化 → 局部更新 UI
```

**实现示例**：

```javascript
// 页面中嵌入时间戳
window.__SSR_TIMESTAMP__ = 1704096000000;

// 客户端验证
async function validateCache() {
  const now = Date.now();
  const age = now - window.__SSR_TIMESTAMP__;
  
  if (age > 5 * 60 * 1000) {  // 超过 5 分钟
    const latestData = await fetch('/api/validate-cache').then(r => r.json());
    
    if (latestData.version !== window.__DATA_VERSION__) {
      // 数据已更新，局部刷新
      updateUI(latestData);
    }
  }
}

// 页面加载后执行
onMounted(validateCache);
```

**优势**：
- ✅ 提高数据时效性
- ✅ 保持缓存性能
- ✅ 渐进式增强

**挑战**：
- ⚠️ 增加复杂度
- ⚠️ 可能引起内容闪烁
- ⚠️ 需要仔细设计

---

## 八、总结

### 8.1 核心价值

**技术价值**：
- ✅ AB 实验在 SSR 中正确工作
- ✅ 服务端客户端状态一致
- ✅ 避免内容闪烁

**业务价值**：
- ✅ 提升用户体验
- ✅ 支持 SEO
- ✅ 保持网站性能

### 8.2 关键要点

**必须实施**：
1. ✅ AB SDK 适配 SSR
2. ✅ AB 组纳入 Cache Key
3. ✅ Cookie 缓存 AB 组

**需要管理**：
1. ⚠️ 控制实验数量（≤ 3）
2. ⚠️ 实验生命周期管理
3. ⚠️ 监控缓存命中率

### 8.3 下一步

**后续 RFC**：
- [RFC 12.2: AB 实验数据获取优化](10-AB实验-RFC12.2-SSR场景下的AB实验数据获取优化.md)
- [RFC 12.3: 提高 AB 缓存命中率](11-AB实验-RFC12.3-提高AB缓存命中率.md)
- [RFC 12.4: AB 支持花瓣服务端](12-AB实验-RFC12.4-AB支持花瓣服务端.md)

---

**文档维护**：前端基建团队  
**RFC 作者**：前端架构组  
**整理日期**：2025-01-25  
**文档版本**：v1.0
