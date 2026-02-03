# RFC 12.2: SSR 场景下的 AB 实验数据获取优化

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=427264426

---

## 文档概述

本 RFC 针对 **[RFC 12.1](09-AB实验-RFC12.1-SSR场景下的AB实验与缓存策略改进.md) 方案在落地过程中暴露的问题**，提出了优化方案。

**核心目标**：
- 🎯 解决 HTTP Header 过大问题
- 🔄 统一 SSR 和 CSR 的 AB 数据
- 👤 支持用户白名单实时生效
- 💾 提高缓存命中率

**相关文档**：
- 前置：[RFC 12.1: SSR 场景下的 AB 实验与缓存策略改进](09-AB实验-RFC12.1-SSR场景下的AB实验与缓存策略改进.md)
- 后续：[RFC 12.3: 提高 AB 缓存命中率](11-AB实验-RFC12.3-提高AB缓存命中率.md)
- 关联：[CDN Worker ABtest方案](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=416714342)

---

## 一、背景与问题

### 1.1 RFC 12.1 方案回顾

**RFC 12.1 的核心方案**：

```
步骤 1：Worker 获取 AB 数据
   ↓
步骤 2：通过 HTTP Header 透传给 SSR
   Header: x-ab-test-list: {"exp1":"a","exp2":"b",...}
   ↓
步骤 3：SSR 使用 AB 数据渲染页面
   ↓
步骤 4：将 AB 组 ID 存入 Cookie
   Cookie: x-ab-test-id = abc123
```

**设计思路**：
- ✅ 将完整的 AB 数据通过 Header 传递
- ✅ SSR 直接从 Header 读取
- ✅ 避免 SSR 重复请求 AB 接口

### 1.2 遇到的问题

在实际使用过程中，RFC 12.1 方案暴露了 **4 个关键问题**：

#### 问题 1：HTTP Header 过大 🔴

**现象**：

```
Worker 获取的 AB 数据 → 序列化为 JSON → 放入 Header
   ↓
Header: x-ab-test-list: {"exp1":"a", "exp2":"b", ...}
   ↓
当实验数量增加时，Header 可能超过 8KB
   ↓
❌ 请求失败（HTTP 413 或被拒绝）
```

**数据示例**：

```javascript
// 10 个实验的 AB 数据
{
  "homepage_layout": "variant_b",
  "template_list_style": "variant_a",
  "editor_toolbar": "variant_c",
  "search_algorithm": "variant_a",
  "recommendation_engine": "variant_b",
  "user_profile_ui": "variant_a",
  "payment_flow": "variant_b",
  "onboarding_process": "variant_c",
  "notification_center": "variant_a",
  "workspace_layout": "variant_b"
}

// JSON 序列化后可能达到数 KB
```

**影响**：
- 🔴 实验数量受限
- 🔴 可能导致接口失败
- 🔴 影响稳定性

#### 问题 2：SSR 和 CSR 的 AB 不一致 🔴

**现象**：

```
SSR 阶段：
   ├─ Worker 获取 AB 数据
   ├─ 通过 Header 传给 SSR
   └─ SSR 渲染（AB 版本 A）

CSR 阶段：
   ├─ 浏览器 JS 独立获取 AB 数据
   ├─ 可能获取到不同的数据
   └─ CSR 渲染（AB 版本 B）❌

结果：水合失败或内容不一致
```

**根本原因**：

| 阶段 | AB 数据来源 | 时间 | 可能的结果 |
|------|------------|------|-----------|
| **SSR** | Worker 获取 | T1 | 版本 A |
| **CSR** | 浏览器获取 | T2 | 版本 B（如果实验配置变了）|

**影响**：
- 🔴 SSR 和 CSR 状态不一致
- 🔴 可能导致水合失败
- 🔴 用户看到内容闪烁

#### 问题 3：用户白名单不能实时生效 ⚠️

**场景**：根据用户 ID 设置的白名单

**问题流程**：

```
步骤 1：用户未登录访问首页
   ↓
获取 AB 数据（游客身份）
   ↓
ab-test-id = abc123（缓存 30 分钟）

步骤 2：用户登录
   ↓
用户 ID: 12345（在白名单中）
   ↓
但 Cookie 中的 ab-test-id 仍是 abc123
   ↓
❌ 白名单策略不生效（需等 30 分钟）

步骤 3：30 分钟后 Cookie 过期
   ↓
重新获取 AB 数据（已登录用户）
   ↓
✅ 白名单策略生效
```

**影响**：
- ⚠️ 白名单用户体验不佳
- ⚠️ 测试和调试困难
- ⚠️ 运营策略滞后

#### 问题 4：缓存命中率降低 ⚠️

**现象**：

```
ab-test-id 缓存 30 分钟
   ↓
30 分钟后 Cookie 过期
   ↓
用户刷新页面
   ↓
重新获取 AB 数据
   ↓
可能分配到不同的 AB 组
   ↓
ab-test-id 改变
   ↓
之前的页面缓存失效 ❌
```

**数据影响**：

| 时间 | ab-test-id | 缓存状态 |
|------|-----------|---------|
| 0 分钟 | abc123 | 创建缓存 |
| 10 分钟 | abc123 | 命中缓存 ✅ |
| 20 分钟 | abc123 | 命中缓存 ✅ |
| 31 分钟 | def456 | 未命中（ID 变了）❌ |

**影响**：
- ⚠️ 页面缓存利用率降低
- ⚠️ TTFB 增加
- ⚠️ 用户体验下降

---

## 二、提议内容

### 2.1 四个优化方向

针对上述 4 个问题，提出以下优化方案：

| 问题 | 优化方向 | 核心思路 |
|------|---------|---------|
| **Header 过大** | 改变 AB 数据透传方式 | 使用 Redis 存储，只传 ID |
| **SSR/CSR 不一致** | 统一客户端和服务端数据 | 客户端复用服务端数据 |
| **白名单不实时** | 登录前后重新更新 AB 标识 | ab-test-id 包含登录态 |
| **缓存命中率低** | 提高 AB 缓存命中率 | 见 [RFC 12.3](11-AB实验-RFC12.3-提高AB缓存命中率.md) |

### 2.2 方案总览

**新的整体架构**：

```
┌─────────────┐
│   用户请求   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CDN Worker  │
│             │
│ 1. 调用 BFF │──────┐
│ 2. 获取 AB  │      │
└──────┬──────┘      │
       │             ▼
       │        ┌─────────┐
       │        │  Redis  │ ← 存储完整 AB 数据
       │        └─────────┘
       │
       │ Header: x-ab-test-id = abc123 (只传 ID)
       │ Cookie: x-ab-test-id = abc123.userId_hash
       ▼
┌─────────────┐
│ Meta SSR    │
│             │
│ 1. 从 Redis │──────→ 读取完整 AB 数据
│    获取 AB  │
│ 2. 渲染页面 │
│ 3. 注入数据 │──────→ window.GD_AB_DATA
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  浏览器 JS  │
│             │
│ 使用 window │
│ .GD_AB_DATA │ ← 复用服务端数据
└─────────────┘
```

---

## 三、详细设计

### 3.1 优化 1：改变 AB 数据透传方式

#### 核心思路

**旧流程（RFC 12.1）**：

```
Worker → 完整 AB 数据 → Header → SSR
❌ Header 可能过大
```

**新流程**：

```
Worker → 完整 AB 数据 → Redis → 返回 ID
   ↓
只传 ID → Header → SSR
   ↓
SSR → 通过 ID → Redis → 获取完整数据
✅ Header 很小
```

#### 实现流程

**步骤 1：Worker 层处理**

```javascript
// CDN Worker
async function handleRequest(request) {
  const userId = request.headers.get('x-user-id') || '';
  
  // 检查 Cookie 中的 ab-test-id
  const existingId = getCookie(request, 'x-ab-test-id');
  
  if (existingId && await isValidABTestId(existingId, userId)) {
    // ID 有效，直接使用
    return forwardWithABTestId(request, existingId);
  }
  
  // 获取新的 AB 数据
  const abData = await fetchABData(request);
  
  // 存储到 Redis
  const abTestId = await storeABDataToRedis(abData, userId);
  
  // 设置 Cookie
  const response = await forwardWithABTestId(request, abTestId);
  response.headers.set('Set-Cookie', `x-ab-test-id=${abTestId}; Max-Age=1800; Path=/`);
  
  return response;
}

// 存储 AB 数据到 Redis
async function storeABDataToRedis(abData, userId) {
  // 生成 ID
  const payload = hash(JSON.stringify(abData));
  const signature = userId ? hash(userId) : '';
  const abTestId = signature ? `${payload}.${signature}` : payload;
  
  // 存储到 Redis（30 分钟过期）
  const redisKey = `ab:${abTestId}`;
  await redis.setex(redisKey, 1800, JSON.stringify(abData));
  
  return abTestId;
}
```

**步骤 2：BFF 层代理**

```javascript
// King BFF
app.get('/api/ab-experiments', async (req, res) => {
  const userId = req.headers['x-user-id'] || '';
  const deviceId = req.headers['x-device-id'];
  
  // 调用 AB 服务
  const abData = await fetch('https://ab-service.com/experiments', {
    headers: {
      'X-User-Id': userId,
      'X-Device-Id': deviceId
    }
  }).then(r => r.json());
  
  res.json(abData);
});
```

**步骤 3：SSR 从 Redis 获取**

```javascript
// Meta SSR
app.use(async (req, res, next) => {
  const abTestId = req.headers['x-ab-test-id'];
  
  if (abTestId) {
    // 从 Redis 获取完整 AB 数据
    const redisKey = `ab:${abTestId}`;
    const abDataStr = await redis.get(redisKey);
    
    if (abDataStr) {
      req.state.abExperiments = JSON.parse(abDataStr);
    }
  }
  
  next();
});
```

#### 数据结构对比

**旧方案（通过 Header）**：

```http
GET /page HTTP/1.1
Host: www.example.com
x-ab-test-list: {"exp1":"a","exp2":"b","exp3":"c",...} 
# ↑ 可能数 KB

Content-Length: 可能超过 8KB ❌
```

**新方案（只传 ID）**：

```http
GET /page HTTP/1.1
Host: www.example.com
x-ab-test-id: a3f5d8e9.b2c1a4f6
# ↑ 只有几十字节

Content-Length: < 100 字节 ✅
```

#### 优势

| 指标 | 旧方案 | 新方案 | 改进 |
|------|--------|--------|------|
| **Header 大小** | 数 KB | < 100B | 🚀 大幅减少 |
| **实验数量限制** | 受限 | 无限制 | ✅ 扩展性好 |
| **稳定性** | 可能失败 | 稳定 | ✅ 可靠 |
| **性能** | 较慢 | 快速 | ✅ Redis 读取快 |

### 3.2 优化 2：客户端 AB 数据和服务端保持一致

#### 核心思路

**问题根源**：SSR 和 CSR 独立获取 AB 数据

**解决方案**：客户端复用服务端的 AB 数据

#### 实现流程

**步骤 1：SSR 注入 AB 数据到页面**

```javascript
// Meta SSR 渲染
async function renderPage(req, res) {
  const abExperiments = req.state.abExperiments;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script>
        // 将 AB 数据注入到全局对象
        window.GD_AB_DATA = ${JSON.stringify(abExperiments)};
      </script>
    </head>
    <body>
      <!-- 页面内容 -->
    </body>
    </html>
  `;
  
  res.send(html);
}
```

**步骤 2：客户端优先使用注入的数据**

```javascript
// 客户端 AB SDK
class ABClient {
  constructor() {
    this.abData = null;
    this.init();
  }
  
  async init() {
    // 优先使用 SSR 注入的数据
    if (window.GD_AB_DATA) {
      this.abData = window.GD_AB_DATA;
      this.syncToLocalStorage();
      return;
    }
    
    // 检查本地存储
    const cachedData = this.getFromLocalStorage();
    if (cachedData && this.isValid(cachedData)) {
      this.abData = cachedData;
      return;
    }
    
    // 降级：重新获取
    await this.fetchABData();
  }
  
  getFromLocalStorage() {
    try {
      const data = localStorage.getItem('ab-experiments');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  syncToLocalStorage() {
    const abTestId = this.getCookie('x-ab-test-id');
    localStorage.setItem('ab-experiments', JSON.stringify({
      id: abTestId,
      data: this.abData,
      timestamp: Date.now()
    }));
  }
  
  isValid(cachedData) {
    // 检查 Cookie 中的 ab-test-id 是否一致
    const currentId = this.getCookie('x-ab-test-id');
    return cachedData.id === currentId;
  }
  
  async fetchABData() {
    const response = await fetch('/api/ab-experiments');
    this.abData = await response.json();
    this.syncToLocalStorage();
  }
  
  getExperiment(name) {
    return this.abData?.[name];
  }
  
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}

// 全局实例
const abClient = new ABClient();
```

**步骤 3：数据一致性检查**

```javascript
// 客户端检查逻辑
async function validateABConsistency() {
  const serverABId = window.GD_AB_DATA?.__id__;
  const cookieABId = getCookie('x-ab-test-id');
  const localABId = localStorage.getItem('ab-test-id');
  
  // 三者不一致，重新获取
  if (serverABId !== cookieABId || cookieABId !== localABId) {
    console.warn('AB data inconsistency detected, refetching...');
    await abClient.fetchABData();
  }
}

// 页面加载后执行
onMounted(validateABConsistency);
```

#### 数据流图

```
SSR 阶段：
┌─────────────┐
│ Redis 中的  │
│   AB 数据   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ SSR 渲染    │
│ 注入到 HTML │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ <script>         │
│ window.GD_AB_DATA│
│ = {...}          │
│ </script>        │
└──────┬───────────┘
       │
       ▼
CSR 阶段：
┌─────────────┐
│ 浏览器 JS   │
│ 读取 window │
│ .GD_AB_DATA │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 存入        │
│ localStorage│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 后续使用    │
│ 缓存数据    │
└─────────────┘
```

#### 优势

| 指标 | 旧方案 | 新方案 | 改进 |
|------|--------|--------|------|
| **数据一致性** | ❌ 可能不一致 | ✅ 完全一致 | 🎯 核心改进 |
| **网络请求** | 2 次（SSR + CSR）| 1 次（只 SSR）| 🚀 减少请求 |
| **水合风险** | 🔴 高 | ✅ 无风险 | ✅ 稳定性高 |
| **性能** | 较慢 | 快速 | ✅ 减少等待 |

### 3.3 优化 3：登录前后重新更新 AB 标识

#### 核心思路

**问题**：ab-test-id 缓存 30 分钟，登录前后不更新

**解决**：ab-test-id 包含登录态信息，登录时检查并更新

#### ab-test-id 结构设计

**新的 ab-test-id 格式**：

```
ab-test-id = ${Payload}.${Signature}
```

**类似 JWT 的设计**：

| 部分 | 含义 | 计算方式 | 示例 |
|------|------|---------|------|
| **Payload** | AB 策略的 Hash | MD5(AB 数据) | `a3f5d8e9` |
| **Signature** | 登录态标识 | Hash(userId) | `b2c1a4f6` |

**示例**：

```javascript
// 未登录用户
ab-test-id = "a3f5d8e9"
// Payload: a3f5d8e9 (AB 数据 Hash)
// Signature: (空)

// 已登录用户
ab-test-id = "a3f5d8e9.b2c1a4f6"
// Payload: a3f5d8e9 (AB 数据 Hash)
// Signature: b2c1a4f6 (userId Hash)
```

#### 实现流程

**步骤 1：生成包含登录态的 ab-test-id**

```javascript
// 生成 ab-test-id
function generateABTestId(abData, userId) {
  // Payload: AB 数据的 Hash
  const payload = md5(JSON.stringify(abData));
  
  if (!userId) {
    // 未登录
    return payload;
  }
  
  // Signature: 用户 ID 的 Hash
  const signature = md5(userId);
  
  return `${payload}.${signature}`;
}

// 使用示例
const abData = { exp1: 'a', exp2: 'b' };
const userId = '12345';

const abTestId = generateABTestId(abData, userId);
// → "a3f5d8e9.b2c1a4f6"
```

**步骤 2：登录时检查 ab-test-id**

```javascript
// Worker 层检查
async function handleRequest(request) {
  const userId = request.headers.get('x-user-id') || '';
  const existingId = getCookie(request, 'x-ab-test-id');
  
  if (existingId) {
    // 解析 ab-test-id
    const [payload, signature] = existingId.split('.');
    
    // 检查登录态是否一致
    const expectedSignature = userId ? md5(userId) : '';
    
    if (signature !== expectedSignature) {
      // 登录态不一致，重新获取 AB 数据
      console.log('Login state changed, refreshing AB data');
      return await refreshABData(request, userId);
    }
  }
  
  // 继续正常流程
  return await forwardRequest(request);
}
```

**步骤 3：登录前后的流程**

**场景 A：未登录 → 登录**

```
步骤 1：用户未登录访问
   ↓
ab-test-id = "a3f5d8e9" (无 Signature)
   ↓
进入 AB 组：游客策略

步骤 2：用户登录
   userId = "12345"
   ↓
Worker 检查：
   当前 ab-test-id = "a3f5d8e9"
   期望 ab-test-id = "a3f5d8e9.b2c1a4f6"
   ↓
❌ 不匹配！重新获取 AB 数据

步骤 3：重新获取（带用户信息）
   ↓
进入白名单 AB 组
   ↓
ab-test-id = "c7a9f2d1.b2c1a4f6" (新的 Payload + Signature)
   ↓
✅ 白名单策略立即生效
```

**场景 B：登录 → 退出**

```
步骤 1：已登录用户访问
   ↓
ab-test-id = "a3f5d8e9.b2c1a4f6"
   ↓
进入 AB 组：用户策略

步骤 2：用户退出登录
   userId = null
   ↓
Worker 检查：
   当前 ab-test-id = "a3f5d8e9.b2c1a4f6"
   期望 ab-test-id = "xxxxxxxx" (新的，无 Signature)
   ↓
❌ 不匹配！重新获取 AB 数据

步骤 3：重新获取（游客身份）
   ↓
ab-test-id = "f8e3c5a2"
   ↓
✅ 切换到游客策略
```

#### 缓存 Key 策略

**Payload 用于缓存**：

```javascript
// 提取 Payload 作为缓存 Key
function getCacheKey(url, abTestId) {
  // 只使用 Payload 部分
  const payload = abTestId.split('.')[0];
  
  return hash(url + payload);
}

// 示例
const url = '/homepage';
const abTestId1 = 'a3f5d8e9.b2c1a4f6'; // 用户 A
const abTestId2 = 'a3f5d8e9.d7f2e1c8'; // 用户 B

getCacheKey(url, abTestId1); // → hash('/homepage' + 'a3f5d8e9')
getCacheKey(url, abTestId2); // → hash('/homepage' + 'a3f5d8e9')
// ✅ 相同的 AB 组，共享缓存
```

**Signature 用于验证**：

```javascript
// 验证登录态
function validateLoginState(abTestId, currentUserId) {
  const parts = abTestId.split('.');
  
  if (parts.length === 1) {
    // 无 Signature，应该是未登录
    return !currentUserId;
  }
  
  // 有 Signature，检查是否匹配
  const signature = parts[1];
  const expectedSignature = md5(currentUserId);
  
  return signature === expectedSignature;
}
```

#### 优势

| 场景 | 旧方案 | 新方案 | 改进 |
|------|--------|--------|------|
| **登录后白名单** | 需等 30 分钟 | ✅ 立即生效 | 🎯 核心改进 |
| **测试调试** | 困难 | ✅ 方便 | ✅ 提升效率 |
| **运营策略** | 滞后 | ✅ 实时 | ✅ 业务友好 |
| **安全性** | 一般 | ✅ 更好 | ✅ 防伪造 |

### 3.4 优化 4：提高 AB 缓存命中率

**说明**：此优化详见 [RFC 12.3: 提高 AB 缓存命中率](11-AB实验-RFC12.3-提高AB缓存命中率.md)

**核心要点**：

1. **问题**：每个实验都影响缓存 Key，实验越多缓存碎片化越严重
2. **方案**：只将"公共实验"纳入缓存 Key
3. **效果**：大幅提升缓存命中率

---

## 四、整体方案流程图

### 4.1 完整流程

```
┌──────────────────────────────────────────────────────────┐
│                     用户请求                              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │        CDN Worker              │
        │                                │
        │  1. 检查 Cookie: x-ab-test-id │
        │     ├─ 存在且有效 → 直接使用   │
        │     └─ 不存在或无效 → 步骤 2   │
        │                                │
        │  2. 获取 AB 数据              │
        │     调用 BFF: /api/ab         │
        │                                │
        │  3. 生成 ab-test-id            │
        │     Payload.Signature          │
        │                                │
        │  4. 存入 Redis                │
        │     Key: ab:${abTestId}       │
        │     Value: AB 数据 JSON        │
        │     TTL: 1800s (30分钟)        │
        │                                │
        │  5. 设置 Response              │
        │     Header: x-ab-test-id      │
        │     Cookie: x-ab-test-id      │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │          BFF 层                │
        │  (Cache Key 计算)              │
        │                                │
        │  cacheKey = hash(              │
        │    url +                       │
        │    ab-test-id.split('.')[0]    │ ← 只用 Payload
        │  )                             │
        │                                │
        │  检查缓存:                      │
        │  ├─ 命中 → 返回缓存            │
        │  └─ 未命中 → 转发到 SSR        │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │        Meta SSR                │
        │                                │
        │  1. 从 Redis 读取 AB 数据      │
        │     Key: ab:${abTestId}       │
        │                                │
        │  2. 渲染页面                   │
        │     使用 AB 数据               │
        │                                │
        │  3. 注入 AB 数据到 HTML        │
        │     window.GD_AB_DATA = {...} │
        │                                │
        │  4. 返回 HTML                  │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │        浏览器                   │
        │                                │
        │  1. 接收 HTML                  │
        │                                │
        │  2. 执行 JS                    │
        │     读取 window.GD_AB_DATA     │
        │                                │
        │  3. 存入 localStorage          │
        │     ab-test-id + AB 数据       │
        │                                │
        │  4. 后续请求                   │
        │     携带 AB 标识               │
        │     使用缓存的 AB 数据          │
        └────────────────────────────────┘
```

### 4.2 关键数据结构

**Redis 存储**：

```
Key: ab:a3f5d8e9.b2c1a4f6
Value: {
  "homepage_layout": "variant_b",
  "template_list": "variant_a",
  "editor_toolbar": "variant_c",
  ...
}
TTL: 1800 (30 分钟)
```

**Cookie**：

```
x-ab-test-id=a3f5d8e9.b2c1a4f6; Max-Age=1800; Path=/; HttpOnly; Secure
```

**localStorage**：

```javascript
{
  "ab-experiments": {
    "id": "a3f5d8e9.b2c1a4f6",
    "data": {
      "homepage_layout": "variant_b",
      ...
    },
    "timestamp": 1704096000000
  }
}
```

**HTML 注入**：

```html
<script>
  window.GD_AB_DATA = {
    "__id__": "a3f5d8e9.b2c1a4f6",
    "homepage_layout": "variant_b",
    "template_list": "variant_a",
    ...
  };
</script>
```

---

## 五、对比与收益

### 5.1 方案对比

| 特性 | RFC 12.1 | RFC 12.2 | 改进 |
|------|---------|---------|------|
| **AB 数据传输** | Header 传完整数据 | Header 只传 ID | 🚀 减少 95%+ |
| **Header 大小** | 数 KB | < 100B | ✅ 避免超限 |
| **SSR/CSR 一致性** | 可能不一致 | 完全一致 | 🎯 核心改进 |
| **白名单实时性** | 需等 30 分钟 | 立即生效 | ✅ 用户友好 |
| **缓存命中率** | 受所有实验影响 | 优化后提升 | ✅ 性能提升 |
| **复杂度** | 低 | 中 | ⚠️ 增加 Redis |

### 5.2 性能收益

**网络性能**：

| 指标 | RFC 12.1 | RFC 12.2 | 改进 |
|------|---------|---------|------|
| **Header 大小** | 2-8 KB | < 100B | ⬇️ 95%+ |
| **请求次数** | 2 次 | 1 次（复用）| ⬇️ 50% |
| **首次 TTFB** | 相同 | 相同 | - |

**缓存收益**：

| 场景 | 旧缓存命中率 | 新缓存命中率 | 改进 |
|------|------------|------------|------|
| **未登录** | 60% | 60% | 无变化 |
| **已登录** | 10-15% | 40-50% | ⬆️ 3-4x |
| **整体** | 35% | 55% | ⬆️ 1.5x |

**用户体验**：

| 指标 | RFC 12.1 | RFC 12.2 | 改进 |
|------|---------|---------|------|
| **内容闪烁** | 可能发生 | ✅ 避免 | 🎯 关键 |
| **白名单生效** | 延迟 30 分钟 | ✅ 实时 | 🎯 关键 |
| **稳定性** | 可能失败 | ✅ 稳定 | ✅ 可靠 |

---

## 六、实施考虑

### 6.1 依赖和前置条件

**基础设施**：

1. ✅ **Redis 集群**
   - 高可用（主从 + 哨兵）
   - 足够容量（估算：10 万用户 × 2KB = 200MB）
   - 监控和告警

2. ✅ **BFF 层支持**
   - AB 接口代理
   - Redis 连接池
   - 错误处理

3. ✅ **CDN Worker 升级**
   - 支持 Redis 操作
   - Cookie 操作增强

### 6.2 兼容性和降级

**降级策略**：

```javascript
// Worker 层降级
async function handleRequestWithFallback(request) {
  try {
    // 尝试新方案（Redis）
    return await handleRequestV2(request);
  } catch (error) {
    console.error('V2 failed, fallback to V1', error);
    
    // 降级到旧方案（Header 传输）
    return await handleRequestV1(request);
  }
}

// SSR 层降级
app.use(async (req, res, next) => {
  const abTestId = req.headers['x-ab-test-id'];
  
  if (abTestId) {
    try {
      // 尝试从 Redis 获取
      const abData = await redis.get(`ab:${abTestId}`);
      if (abData) {
        req.state.abExperiments = JSON.parse(abData);
        return next();
      }
    } catch (error) {
      console.error('Redis failed, check header', error);
    }
    
    // 降级：检查是否有 Header 传输的数据
    const headerData = req.headers['x-ab-test-list'];
    if (headerData) {
      req.state.abExperiments = JSON.parse(headerData);
    }
  }
  
  next();
});
```

### 6.3 监控指标

**关键指标**：

| 指标 | 说明 | 告警阈值 |
|------|------|---------|
| **Redis 命中率** | 获取 AB 数据的成功率 | < 95% |
| **Header 大小** | x-ab-test-id 大小 | > 200B |
| **SSR/CSR 一致性** | 一致性检查失败次数 | > 1% |
| **白名单生效延迟** | 登录到生效的时间 | > 5s |
| **缓存命中率** | 页面缓存命中率 | < 50% |

**监控面板**：

```
AB 实验监控

1. 数据获取
   ├─ Redis 命中率: 98.5%
   ├─ Redis 响应时间: 2ms (P99)
   └─ 降级次数: 0

2. 数据一致性
   ├─ SSR/CSR 一致: 99.9%
   ├─ 一致性检查失败: 0.1%
   └─ 重新获取次数: 100/小时

3. 缓存效果
   ├─ 未登录缓存命中率: 62%
   ├─ 已登录缓存命中率: 45%
   └─ 整体缓存命中率: 58%

4. 白名单
   ├─ 生效延迟: 0.5s (P95)
   └─ 生效成功率: 99.8%
```

---

## 七、总结

### 7.1 核心改进

**四大优化**：

1. ✅ **Redis 存储 AB 数据**
   - Header 大小从 KB 级降到 Byte 级
   - 支持无限数量的实验

2. ✅ **客户端复用服务端数据**
   - 确保 SSR 和 CSR 完全一致
   - 减少网络请求

3. ✅ **ab-test-id 包含登录态**
   - 白名单策略实时生效
   - 登录前后自动更新

4. ✅ **优化缓存策略**
   - 详见 RFC 12.3
   - 大幅提升命中率

### 7.2 技术价值

| 维度 | 价值 |
|------|------|
| **性能** | ✅ 减少请求、提升缓存命中率 |
| **稳定性** | ✅ 避免 Header 超限、降级完善 |
| **用户体验** | ✅ 无闪烁、白名单实时生效 |
| **可扩展性** | ✅ 支持无限实验数量 |
| **可维护性** | ✅ 架构清晰、监控完善 |

### 7.3 后续工作

**关联 RFC**：
- [RFC 12.3: 提高 AB 缓存命中率](11-AB实验-RFC12.3-提高AB缓存命中率.md)
- [RFC 12.4: AB 支持花瓣服务端](12-AB实验-RFC12.4-AB支持花瓣服务端.md)

**潜在优化**：
- 进一步优化 Redis 访问性能
- 考虑 AB 数据的 CDN 边缘缓存
- 实验数据的实时推送

---

**文档维护**：前端基建团队  
**RFC 作者**：前端架构组  
**整理日期**：2025-01-25  
**文档版本**：v1.0
