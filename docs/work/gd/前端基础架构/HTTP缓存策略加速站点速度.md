# RFC 10: 实施 HTTP 缓存策略加速站点速度

> **RFC 编号**：RFC-010  
> **状态**：✅ 已完成  
> **作者**：前端基础架构团队  
> **最后更新**：2026-01

---

## 📋 概述

本 RFC 提出了一套基于 HTTP 标准的**协商缓存业务策略**，通过协调 CDN 与客户端缓存，显著加速网站响应速度，将 LCP（Largest Contentful Paint）从 1600ms 降低到 800ms 以内。

---

## 🎯 目标

### 主要目标

通过实施 HTTP 缓存策略优化网站性能，打通 **CDN 到浏览器**的缓存链路。

### 具体目标

1. **性能提升**：将 LCP 从 1600ms 降低到 800ms（50% 提升）
2. **服务器减压**：减少源站请求量和渲染压力
3. **用户体验**：加快页面加载速度，特别是低频页面
4. **标准化**：基于 HTTP 标准，兼容 CDN 和浏览器

---

## 💡 动机

### 性能问题

详情参考：[Insmind 网络性能优化](https://doc.huanleguang.com/wiki/pages/viewpage.action?pageId=357365846)

**核心问题**：
- LCP（最大内容绘制）过长：~1600ms
- 低频页面首次访问慢
- SSR 服务器压力大
- CDN 未充分利用

**优化效果**（实测数据）：
- **启用 CDN + 强缓存前**：LCP = 1600ms
- **启用 CDN + 强缓存后**：LCP < 800ms
- **性能提升**：50%+

---

## 🔍 HTTP 缓存策略详解

### 缓存类型概览

在 HTTP 缓存策略中，有两种主要的缓存类型：**强缓存**和**协商缓存**。

```
┌────────────────────────────────────────────┐
│           HTTP 缓存决策流程                 │
└────────────────────────────────────────────┘
                   │
                   ▼
          是否有强缓存？
          (Cache-Control/Expires)
                   │
         ┌─────────┴─────────┐
         │                   │
      有效 ✓              过期 ✗
         │                   │
         ▼                   ▼
    使用本地缓存      是否有协商缓存？
    (不发送请求)      (ETag/Last-Modified)
                           │
                  ┌────────┴────────┐
                  │                 │
             资源未变化          资源已变化
                  │                 │
                  ▼                 ▼
            返回 304             返回 200
         (使用本地缓存)       (下载新资源)
```

---

### 1. 强缓存（Strong Cache）

**定义**：强缓存不会向服务器发送请求，直接从本地缓存中读取资源。

#### 控制头部

##### Cache-Control（推荐）

**格式**：
```
Cache-Control: max-age=<seconds>
Cache-Control: no-cache
Cache-Control: no-store
Cache-Control: public/private
```

**指令详解**：

| 指令 | 说明 | 使用场景 |
|------|------|---------|
| `max-age=3600` | 缓存 3600 秒（1 小时） | 静态资源、CDN |
| `no-cache` | 可以缓存，但需要验证 | 需要实时性的内容 |
| `no-store` | 不缓存任何内容 | 敏感信息 |
| `public` | 可被任何缓存（CDN、代理）缓存 | 公共资源 |
| `private` | 只能被浏览器缓存 | 用户个性化内容 |
| `must-revalidate` | 过期后必须向服务器验证 | 金融、交易数据 |
| `immutable` | 资源永不改变 | 带版本号的静态资源 |

**示例**：

```http
# 静态资源：缓存 1 年
Cache-Control: public, max-age=31536000, immutable

# 动态内容：缓存 5 分钟
Cache-Control: public, max-age=300

# 私有内容：只能浏览器缓存 1 小时
Cache-Control: private, max-age=3600

# 敏感信息：不缓存
Cache-Control: no-store
```

---

##### Expires（旧版）

**格式**：
```
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```

**说明**：
- HTTP/1.0 标准
- 指定具体的过期时间
- 优先级低于 `Cache-Control`
- 依赖客户端时间，可能不准确

**对比**：

| 特性 | Cache-Control | Expires |
|------|--------------|---------|
| HTTP 版本 | HTTP/1.1 | HTTP/1.0 |
| 时间类型 | 相对时间（秒） | 绝对时间（GMT） |
| 优先级 | 高 | 低 |
| 时间准确性 | 不受客户端时间影响 | 受客户端时间影响 |

**建议**：优先使用 `Cache-Control`，`Expires` 仅作为降级方案。

---

### 2. 协商缓存（Negotiation Cache）

**定义**：协商缓存会向服务器发送请求，询问资源是否有更新。如果没有更新，服务器返回 **304 Not Modified**，浏览器使用本地缓存。

#### 控制头部

##### ETag / If-None-Match（推荐）

**工作流程**：

```
# 首次请求
客户端 → GET /page.html
服务器 ← 200 OK
         ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
         Content: <html>...</html>

# 后续请求
客户端 → GET /page.html
         If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
         
# 资源未变化
服务器 ← 304 Not Modified
         ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
         (无 body，节省带宽)

# 资源已变化
服务器 ← 200 OK
         ETag: "新的ETag值"
         Content: <html>新内容...</html>
```

**ETag 生成方式**：

```javascript
// 方式 1：基于文件内容的哈希（推荐）
const crypto = require('crypto')
const fs = require('fs')

function generateETag(filePath) {
  const content = fs.readFileSync(filePath)
  const hash = crypto.createHash('md5').update(content).digest('hex')
  return `"${hash}"`
}

// 方式 2：基于文件修改时间和大小
function generateWeakETag(stat) {
  const mtime = stat.mtime.getTime().toString(16)
  const size = stat.size.toString(16)
  return `W/"${size}-${mtime}"`
}

// 方式 3：基于内容版本号
function generateVersionETag(content, version) {
  return `"${version}-${content.length}"`
}
```

**强 ETag vs 弱 ETag**：

| 类型 | 格式 | 说明 | 使用场景 |
|------|------|------|---------|
| 强 ETag | `"abc123"` | 字节级别精确匹配 | 静态文件、API 响应 |
| 弱 ETag | `W/"abc123"` | 语义级别匹配 | 动态内容、可接受轻微差异 |

---

##### Last-Modified / If-Modified-Since

**工作流程**：

```
# 首次请求
客户端 → GET /page.html
服务器 ← 200 OK
         Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
         Content: <html>...</html>

# 后续请求
客户端 → GET /page.html
         If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT

# 资源未变化
服务器 ← 304 Not Modified

# 资源已变化
服务器 ← 200 OK
         Last-Modified: Wed, 21 Oct 2025 08:30:00 GMT
         Content: <html>新内容...</html>
```

**局限性**：
- 精度只到秒级（1 秒内多次修改无法识别）
- 依赖服务器时间
- 某些情况下文件内容未变但修改时间变了

---

**ETag vs Last-Modified 对比**：

| 特性 | ETag | Last-Modified |
|------|------|--------------|
| 精度 | 内容级别（哈希） | 时间级别（秒） |
| 准确性 | 高（内容变化才变） | 低（时间可能不准） |
| 性能 | 需要计算哈希 | 直接读取文件时间 |
| 优先级 | 高 | 低 |
| 推荐度 | ✅ 推荐 | ⚠️ 降级方案 |

**建议**：优先使用 ETag，Last-Modified 作为降级方案，两者可以同时使用。

---

### 缓存优先级

**优先级顺序**（从高到低）：

1. `Cache-Control: no-store` → 不缓存
2. `Cache-Control: no-cache` → 必须验证
3. `Cache-Control: max-age=N` → 强缓存 N 秒
4. `Expires` → 强缓存到指定时间
5. `ETag / If-None-Match` → 协商缓存（优先）
6. `Last-Modified / If-Modified-Since` → 协商缓存（降级）

---

## 🎯 应用场景

### 1. 静态资源缓存

**场景**：CSS、JavaScript、图片等不常变化的资源。

**策略**：长时间强缓存 + 文件名版本化

```http
# 带版本号的静态资源：缓存 1 年
Cache-Control: public, max-age=31536000, immutable
```

**最佳实践**：

```html
<!-- ❌ 错误：无版本号，更新困难 -->
<script src="/app.js"></script>

<!-- ✅ 正确：带哈希版本号，缓存友好 -->
<script src="/app.a1b2c3d4.js"></script>
```

**文件命名策略**：

```javascript
// Webpack 配置
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  }
}
```

---

### 2. 动态内容缓存

**场景**：新闻、博客文章等经常变化的内容。

**策略**：短时间强缓存 + ETag 协商缓存

```http
# 缓存 5 分钟，过期后协商
Cache-Control: public, max-age=300
ETag: "abc123"
```

**服务端实现**：

```javascript
app.get('/news/:id', async (req, res) => {
  const news = await getNews(req.params.id)
  
  // 生成 ETag
  const etag = generateETag(JSON.stringify(news))
  
  // 检查客户端缓存
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }
  
  // 设置缓存头
  res.set({
    'Cache-Control': 'public, max-age=300',
    'ETag': etag
  })
  
  res.json(news)
})
```

---

### 3. API 响应缓存

**场景**：数据更新频率不高的 API。

**策略**：根据业务需求设置缓存时间 + ETag

```http
# 数据每小时更新一次
Cache-Control: public, max-age=3600
ETag: "xyz789"
```

**实现示例**：

```javascript
app.get('/api/products', async (req, res) => {
  const products = await getProducts()
  const etag = generateETag(JSON.stringify(products))
  
  // ETag 协商
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }
  
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'ETag': etag,
    'Vary': 'Accept-Encoding'  // 支持 gzip 压缩
  })
  
  res.json(products)
})
```

---

### 4. CDN 缓存

**场景**：通过 CDN 分发内容，减少源站压力。

**策略**：设置合适的 `Cache-Control`，让 CDN 缓存内容

```http
# CDN 缓存 1 小时，浏览器缓存 5 分钟
Cache-Control: public, max-age=300, s-maxage=3600
```

**字段说明**：
- `max-age`：浏览器缓存时间
- `s-maxage`：CDN/代理缓存时间（优先级高于 `max-age`）

---

### 5. 浏览器缓存

**场景**：提高页面重新加载和后退/前进的速度。

**策略**：根据资源类型设置不同的缓存策略

```html
<!DOCTYPE html>
<html>
<head>
  <!-- CSS：缓存 1 天 -->
  <link rel="stylesheet" href="/style.a1b2c3.css">
  <!-- Response: Cache-Control: public, max-age=86400 -->
  
  <!-- JS：缓存 1 天 -->
  <script src="/app.d4e5f6.js"></script>
  <!-- Response: Cache-Control: public, max-age=86400 -->
</head>
<body>
  <!-- 图片：缓存 7 天 -->
  <img src="/logo.g7h8i9.png">
  <!-- Response: Cache-Control: public, max-age=604800 -->
</body>
</html>
```

---

## 🌐 CDN 供应商支持情况

### 阿里云 DCDN

**支持情况**：✅ 完全支持 HTTP 缓存策略

**文档**：
- [配置自定义 HTTP 响应头](https://help.aliyun.com/zh/dcdn/user-guide/configure-a-custom-http-response-header)

**配置示例**：

```javascript
// 阿里云 DCDN 配置
{
  "cache_rules": [
    {
      "path_pattern": "*.js,*.css",
      "cache_time": 31536000,  // 1 年
      "cache_control": "public, max-age=31536000, immutable"
    },
    {
      "path_pattern": "*.html",
      "cache_time": 300,  // 5 分钟
      "cache_control": "public, max-age=300"
    }
  ]
}
```

---

### Cloudflare Workers

**支持情况**：✅ 完全支持 HTTP 缓存策略

**文档**：
- [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/#headers)

**配置示例**：

```javascript
// Cloudflare Workers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const cache = caches.default
  const request = event.request
  
  // 尝试从缓存获取
  let response = await cache.match(request)
  
  if (!response) {
    // 缓存未命中，从源站获取
    response = await fetch(request)
    
    // 根据响应头决定是否缓存
    const cacheControl = response.headers.get('Cache-Control')
    if (cacheControl && !cacheControl.includes('no-store')) {
      event.waitUntil(cache.put(request, response.clone()))
    }
  }
  
  return response
}
```

---

## 🚀 提议内容

### 1. SSR 服务启用 HTTP 缓存能力

**目标**：在 Insmind、Gaoding 的 SSR 服务中启用 HTTP 缓存策略。

#### 技术栈

使用 **Web Widget 元框架**，在最新版本中通过中间件支持 HTTP 缓存策略。

**相关 PR**：
- **ETag 能力**：https://git.gaoding.com/gdesign/gdesign-view/pull/5329
- **Cache-Control 能力**：https://git.gaoding.com/gdesign/gdesign-view/pull/5509

---

#### ETag 中间件实现

```javascript
// etag-middleware.js
const crypto = require('crypto')

/**
 * ETag 中间件
 * 为响应生成 ETag 并处理协商缓存
 */
function etagMiddleware(options = {}) {
  const { weak = false } = options
  
  return async (ctx, next) => {
    await next()
    
    // 只对成功响应生成 ETag
    if (ctx.status !== 200) {
      return
    }
    
    // 跳过已有 ETag 的响应
    if (ctx.response.get('ETag')) {
      return
    }
    
    // 生成 ETag
    const body = ctx.body
    let etag
    
    if (typeof body === 'string') {
      etag = generateETag(body, weak)
    } else if (Buffer.isBuffer(body)) {
      etag = generateETag(body.toString(), weak)
    } else if (typeof body === 'object') {
      etag = generateETag(JSON.stringify(body), weak)
    } else {
      return
    }
    
    // 设置 ETag
    ctx.set('ETag', etag)
    
    // 检查客户端缓存
    const clientETag = ctx.get('If-None-Match')
    if (clientETag === etag) {
      ctx.status = 304
      ctx.body = null
    }
  }
}

/**
 * 生成 ETag
 */
function generateETag(content, weak = false) {
  const hash = crypto
    .createHash('md5')
    .update(content, 'utf8')
    .digest('hex')
    .substring(0, 27)
  
  return weak ? `W/"${hash}"` : `"${hash}"`
}

module.exports = etagMiddleware
```

---

#### Cache-Control 中间件实现

```javascript
// cache-control-middleware.js

/**
 * Cache-Control 中间件
 * 为不同类型的响应设置缓存策略
 */
function cacheControlMiddleware(options = {}) {
  const {
    maxAge = 0,
    sMaxAge = null,
    public: isPublic = false,
    private: isPrivate = false,
    noCache = false,
    noStore = false,
    mustRevalidate = false,
    immutable = false
  } = options
  
  return async (ctx, next) => {
    await next()
    
    // 跳过已有 Cache-Control 的响应
    if (ctx.response.get('Cache-Control')) {
      return
    }
    
    // 构建 Cache-Control 指令
    const directives = []
    
    if (noStore) {
      directives.push('no-store')
    } else if (noCache) {
      directives.push('no-cache')
    } else {
      if (isPublic) directives.push('public')
      if (isPrivate) directives.push('private')
      if (maxAge > 0) directives.push(`max-age=${maxAge}`)
      if (sMaxAge !== null) directives.push(`s-maxage=${sMaxAge}`)
      if (mustRevalidate) directives.push('must-revalidate')
      if (immutable) directives.push('immutable')
    }
    
    if (directives.length > 0) {
      ctx.set('Cache-Control', directives.join(', '))
    }
  }
}

/**
 * 预设配置
 */
cacheControlMiddleware.presets = {
  // 静态资源：缓存 1 年
  static: {
    public: true,
    maxAge: 31536000,
    immutable: true
  },
  
  // 短期缓存：5 分钟
  short: {
    public: true,
    maxAge: 300
  },
  
  // 中期缓存：1 小时
  medium: {
    public: true,
    maxAge: 3600
  },
  
  // 长期缓存：1 天
  long: {
    public: true,
    maxAge: 86400
  },
  
  // 私有内容：仅浏览器缓存
  private: {
    private: true,
    maxAge: 3600
  },
  
  // 不缓存
  noCache: {
    noStore: true
  }
}

module.exports = cacheControlMiddleware
```

---

#### 使用示例

```javascript
// app.js
const Koa = require('koa')
const etagMiddleware = require('./etag-middleware')
const cacheControlMiddleware = require('./cache-control-middleware')

const app = new Koa()

// 全局启用 ETag
app.use(etagMiddleware())

// 路由级别的缓存策略
app.use(async (ctx, next) => {
  if (ctx.path.match(/\.(js|css|png|jpg)$/)) {
    // 静态资源：长期缓存
    await cacheControlMiddleware(
      cacheControlMiddleware.presets.static
    )(ctx, next)
  } else if (ctx.path.startsWith('/api/')) {
    // API：短期缓存
    await cacheControlMiddleware(
      cacheControlMiddleware.presets.short
    )(ctx, next)
  } else {
    // HTML 页面：中期缓存
    await cacheControlMiddleware(
      cacheControlMiddleware.presets.medium
    )(ctx, next)
  }
})

app.listen(3000)
```

---

### 2. 使用 Vary 缓存一个 URL 的多个版本

**定义**：`Vary` 是一个 HTTP 响应头，它决定了哪些请求头字段会影响缓存的存储和匹配。

#### 工作原理

```
同一个 URL：/api/products

请求 1：
  Accept-Encoding: gzip
  → 缓存键：/api/products?gzip
  → 返回 gzip 压缩版本

请求 2：
  Accept-Encoding: br
  → 缓存键：/api/products?br
  → 返回 Brotli 压缩版本

请求 3：
  Accept-Encoding: identity
  → 缓存键：/api/products?identity
  → 返回未压缩版本
```

---

#### 应用场景

##### 1. 内容协商

```http
# 根据语言返回不同版本
Vary: Accept-Language

# 根据编码返回不同版本
Vary: Accept-Encoding

# 多个头部
Vary: Accept-Language, Accept-Encoding
```

**示例**：

```javascript
app.get('/page', (req, res) => {
  const lang = req.get('Accept-Language') || 'en'
  const content = getContentByLanguage(lang)
  
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'Accept-Language'
  })
  
  res.send(content)
})
```

---

##### 2. 动态内容

```http
# 根据 Cookie 返回个性化内容
Vary: Cookie

# 根据 User-Agent 返回不同设备版本
Vary: User-Agent
```

**示例**：

```javascript
app.get('/dashboard', (req, res) => {
  const userId = req.cookies.userId
  const dashboard = getUserDashboard(userId)
  
  res.set({
    'Cache-Control': 'private, max-age=1800',
    'Vary': 'Cookie'
  })
  
  res.render('dashboard', dashboard)
})
```

---

##### 3. AB 测试

```http
# 根据 Cookie 返回不同的 AB 版本
Vary: Cookie
```

**示例**：

```javascript
app.get('/landing', (req, res) => {
  const variant = req.cookies.abTestVariant || 'A'
  const page = getABTestPage(variant)
  
  res.set({
    'Cache-Control': 'public, max-age=600',
    'Vary': 'Cookie'
  })
  
  res.send(page)
})
```

---

#### ⚠️ 注意事项

**1. Vary 会降低缓存命中率**

```
Vary: Cookie
→ 每个不同的 Cookie 值都会创建一个缓存副本
→ 如果有 1000 个用户，就有 1000 个缓存副本
→ 缓存命中率低
```

**建议**：
- 谨慎使用 `Vary: Cookie`
- 考虑将个性化内容拆分为独立 API
- 使用 `Vary: Accept-Encoding` 是安全的（只有几种编码）

**2. Vary * 的问题**

```http
# ❌ 错误：禁用缓存
Vary: *
```

`Vary: *` 表示每个请求都是唯一的，实际上禁用了缓存。

---

### 3. Insmind: 启用强缓存策略

#### 背景分析

由于 Insmind 当前**没有针对用户的个性化内容**，因此可以开启 `Cache-Control` 启用强缓存策略，尽可能提高缓存的命中率以加速低频页面的访问速度。

#### 缓存策略

**缓存过期时间**：30 分钟

```http
Cache-Control: public, max-age=1800
```

**原因**：
- ✅ Insmind 无个性化内容，所有用户看到的内容相同
- ✅ 30 分钟足够平衡实时性和性能
- ✅ CDN 和浏览器都可以缓存

---

#### 实施配置

```javascript
// insmind-server.js
app.use(async (ctx, next) => {
  await next()
  
  // 只对 HTML 页面启用强缓存
  if (ctx.type === 'text/html' && ctx.status === 200) {
    ctx.set({
      'Cache-Control': 'public, max-age=1800',
      'ETag': generateETag(ctx.body),
      'Vary': 'Accept-Encoding'
    })
  }
})
```

---

### 4. Insmind: 使用 Cloudflare Workers 加速

#### 架构设计

![Cloudflare Workers 架构](attachments/image2024-3-11_16-42-0.png)

**架构说明**：
- **边缘节点**：Cloudflare Workers 在全球边缘节点运行
- **缓存层**：Workers 缓存响应，减少回源
- **源站**：Insmind SSR 服务器

---

#### 为什么采用 CDN + 源站模式？

**Cloudflare 推荐做法**：在 CDN 节点中直接执行 SSR

**我们的选择**：采用传统的 CDN + 源站模式

**原因**：
1. **新运行时环境**：Workers 运行时与 Node.js 有差异，需要适配
2. **业务代码验证**：现有业务代码需要在 Workers 环境中验证
3. **部署流程调整**：需要新的部署流程和监控
4. **无个性化内容**：Insmind 几乎没有个性化内容，CDN + 源站模式更简单
5. **渐进式迁移**：先用 CDN + 源站，后续可以逐步迁移到 Workers SSR

---

#### Workers 实现

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const cache = caches.default
  const request = event.request
  
  // 1. 尝试从缓存获取
  let response = await cache.match(request)
  
  if (!response) {
    // 2. 缓存未命中，从源站获取
    const url = new URL(request.url)
    url.hostname = 'insmind-ssr.gaoding.com'  // 源站地址
    
    response = await fetch(new Request(url, request))
    
    // 3. 根据源站的缓存策略决定是否缓存
    const cacheControl = response.headers.get('Cache-Control')
    if (cacheControl && !cacheControl.includes('no-store')) {
      // 克隆响应并缓存
      event.waitUntil(cache.put(request, response.clone()))
    }
  }
  
  // 4. 处理 ETag 协商缓存
  const etag = response.headers.get('ETag')
  const ifNoneMatch = request.headers.get('If-None-Match')
  
  if (etag && etag === ifNoneMatch) {
    // 返回 304，不传输内容
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag
      }
    })
  }
  
  return response
}
```

---

#### 完善版本（支持多端和 AB 测试）

```javascript
// cloudflare-worker-advanced.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const cache = caches.default
  const request = event.request
  const url = new URL(request.url)
  
  // 1. 构建缓存键（考虑多端和 AB 测试）
  const cacheKey = buildCacheKey(request)
  const cacheRequest = new Request(cacheKey, request)
  
  // 2. 尝试从缓存获取
  let response = await cache.match(cacheRequest)
  
  if (!response) {
    // 3. 缓存未命中，从源站获取
    url.hostname = 'insmind-ssr.gaoding.com'
    
    response = await fetch(new Request(url, request))
    
    // 4. 缓存响应
    const cacheControl = response.headers.get('Cache-Control')
    if (shouldCache(cacheControl)) {
      event.waitUntil(cache.put(cacheRequest, response.clone()))
    }
  }
  
  // 5. 处理 ETag 协商缓存
  return handleETagNegotiation(request, response)
}

/**
 * 构建缓存键
 * 考虑：User-Agent（设备类型）、Cookie（AB 测试）
 */
function buildCacheKey(request) {
  const url = new URL(request.url)
  
  // 提取设备类型
  const userAgent = request.headers.get('User-Agent') || ''
  const device = getDeviceType(userAgent)
  
  // 提取 AB 测试变体
  const cookie = request.headers.get('Cookie') || ''
  const abVariant = extractABVariant(cookie)
  
  // 构建唯一的缓存键
  const cacheKey = `${url.pathname}?device=${device}&ab=${abVariant}`
  
  return new URL(cacheKey, url.origin).href
}

/**
 * 判断设备类型
 */
function getDeviceType(userAgent) {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

/**
 * 提取 AB 测试变体
 */
function extractABVariant(cookie) {
  const match = cookie.match(/ab_variant=([^;]+)/)
  return match ? match[1] : 'default'
}

/**
 * 判断是否应该缓存
 */
function shouldCache(cacheControl) {
  if (!cacheControl) return false
  if (cacheControl.includes('no-store')) return false
  if (cacheControl.includes('private')) return false
  return true
}

/**
 * 处理 ETag 协商缓存
 */
function handleETagNegotiation(request, response) {
  const etag = response.headers.get('ETag')
  const ifNoneMatch = request.headers.get('If-None-Match')
  
  if (etag && etag === ifNoneMatch) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': response.headers.get('Cache-Control')
      }
    })
  }
  
  return response
}
```

---

#### 未考虑的部分（待完善）

1. **多端适配**
   - Insmind 源站根据不同端输出了不同的 HTML
   - 需要在缓存键中区分设备类型

2. **灰度发布**
   - 按地域灰度（Cloudflare 的 geo 信息）
   - 按用户灰度（Cookie 或请求头）

3. **AB 测试**
   - 需要在缓存键中包含 AB 变体
   - 避免不同变体的用户看到错误的版本

4. **缓存预热**
   - 新版本发布后，主动预热热门页面
   - 减少首次访问的等待时间

---

## 🔮 未来可能性

### 1. Gaoding 开启 CDN 全站加速

这份 RFC 的直接目标是 **Insmind**，Gaoding 套版不是当前提案重点，但本质上要解决的问题都是一样的。

#### 阶段性策略

- ✅ **阶段一**：全站点启用 **ETag 协商缓存**
  - 利用浏览器缓存能力
  - 减少传输的内容
  - 提高用户的访问速度

- 🚧 **阶段二**：未登录用户使用 **ETag 协商缓存**，登录后的用户启用 **Last-Modified**
  - 缓解渲染登录后 SSR 给服务器带来的压力
  - 减少个性化内容的计算开销

- 📅 **阶段三**：使用阿里云开启 **CDN 全站加速**
  - 路由改造：登录后的个性化内容使用不同 URL 区分
    - 未登录：`/templates`（强缓存）
    - 登录后：`/my/templates`（协商缓存）
  - 未登录用户使用强缓存
  - 登录用户使用协商缓存

- 📅 **阶段四**：解决 **AB、灰度在 CDN 的适应问题**
  - 按地域灰度
  - 登录后用户灰度
  - AB 测试缓存策略

- 📅 **阶段五**：使用阿里云的 **CDN 边缘程序**
  - 参考 Cloudflare Workers 的脚本
  - 启用 CDN + SSR 服务器源站模式
  - 逐步迁移到边缘 SSR

---

### 2. 缓存预热机制

**场景**：新版本发布后，主动预热热门页面，避免首次访问慢。

```javascript
// cache-warmer.js
const hotPages = [
  '/templates',
  '/templates/poster',
  '/templates/social-media',
  '/pricing'
]

async function warmupCache() {
  console.log('开始缓存预热...')
  
  for (const page of hotPages) {
    try {
      const response = await fetch(`https://www.gaoding.com${page}`, {
        headers: {
          'User-Agent': 'CacheWarmer/1.0'
        }
      })
      
      console.log(`✓ 预热成功: ${page} (${response.status})`)
    } catch (error) {
      console.error(`✗ 预热失败: ${page}`, error.message)
    }
  }
  
  console.log('缓存预热完成!')
}

// 部署后自动执行
warmupCache()
```

---

### 3. 智能缓存时间

**场景**：根据页面访问频率动态调整缓存时间。

```javascript
// smart-cache-middleware.js
const pageStats = new Map()

function smartCacheMiddleware() {
  return async (ctx, next) => {
    const path = ctx.path
    
    await next()
    
    // 统计访问频率
    const stats = pageStats.get(path) || { count: 0, lastAccess: Date.now() }
    stats.count++
    stats.lastAccess = Date.now()
    pageStats.set(path, stats)
    
    // 根据访问频率设置缓存时间
    let maxAge
    if (stats.count > 1000) {
      maxAge = 3600  // 高频页面：1 小时
    } else if (stats.count > 100) {
      maxAge = 1800  // 中频页面：30 分钟
    } else {
      maxAge = 300   // 低频页面：5 分钟
    }
    
    ctx.set('Cache-Control', `public, max-age=${maxAge}`)
  }
}
```

---

### 4. 缓存监控和分析

**场景**：监控缓存命中率、回源率，优化缓存策略。

```javascript
// cache-monitor.js
class CacheMonitor {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      stale: 0,
      total: 0
    }
  }
  
  recordHit(type) {
    this.stats[type]++
    this.stats.total++
  }
  
  getHitRate() {
    return (this.stats.hits / this.stats.total * 100).toFixed(2) + '%'
  }
  
  getReport() {
    return {
      hitRate: this.getHitRate(),
      hits: this.stats.hits,
      misses: this.stats.misses,
      stale: this.stats.stale,
      total: this.stats.total
    }
  }
}

const monitor = new CacheMonitor()

// 在中间件中记录
app.use(async (ctx, next) => {
  const cacheStatus = ctx.get('X-Cache')  // CDN 返回的缓存状态
  
  if (cacheStatus === 'HIT') {
    monitor.recordHit('hits')
  } else if (cacheStatus === 'MISS') {
    monitor.recordHit('misses')
  } else if (cacheStatus === 'STALE') {
    monitor.recordHit('stale')
  }
  
  await next()
})

// 定时输出报告
setInterval(() => {
  console.log('缓存报告:', monitor.getReport())
}, 60000)  // 每分钟输出一次
```

---

## 💬 待讨论的问题

### 1. 启用 CDN 加速后，源站是否应当关闭 Redis？

**背景**：
- 当前源站使用 Redis 缓存渲染结果
- 启用 CDN 后，大部分请求会被 CDN 拦截
- Redis 的作用可能被削弱

**讨论点**：

| 方案 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **保留 Redis** | CDN 未命中时仍能加速；支持个性化内容 | 增加维护成本；可能造成双重缓存 | ✅ 推荐 |
| **关闭 Redis** | 简化架构；减少成本 | CDN 未命中时性能差；个性化内容慢 | ❌ 不推荐 |

**结论**：**保留 Redis**
- CDN 缓存公共内容（未登录用户）
- Redis 缓存个性化内容（登录用户）
- 两者互补，不冲突

---

### 2. 启用 Cloudflare Workers 后，是否能够避免外部对源站的直接访问？

**背景**：
- 使用 Workers 作为反向代理
- 希望所有流量都经过 Workers
- 避免直接访问源站（安全性、计费）

**解决方案**：

#### 方案 A：IP 白名单

```javascript
// 源站配置（Nginx）
# 只允许 Cloudflare IP 访问
allow 103.21.244.0/22;
allow 103.22.200.0/22;
allow 103.31.4.0/22;
# ... 更多 Cloudflare IP
deny all;
```

#### 方案 B：验证请求头

```javascript
// 源站验证 Workers 请求
app.use((req, res, next) => {
  const secret = req.get('X-Worker-Secret')
  const expectedSecret = process.env.WORKER_SECRET
  
  if (secret !== expectedSecret) {
    return res.status(403).send('Forbidden')
  }
  
  next()
})

// Workers 添加请求头
async function handleRequest(event) {
  const url = new URL(event.request.url)
  url.hostname = 'origin.gaoding.com'
  
  const request = new Request(url, event.request)
  request.headers.set('X-Worker-Secret', WORKER_SECRET)
  
  return fetch(request)
}
```

#### 方案 C：使用 Cloudflare Tunnel

```bash
# 使用 Cloudflare Tunnel 隐藏源站
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns my-tunnel origin.gaoding.com
```

**结论**：**组合使用**
- IP 白名单（基础防护）
- 验证请求头（额外安全）
- Cloudflare Tunnel（终极方案，但需要额外配置）

---

## 📊 性能指标

### 优化前 vs 优化后

| 指标 | 优化前 | 优化后 | 提升 |
|------|-------|-------|------|
| **LCP** | 1600ms | < 800ms | **50%** |
| **首屏时间** | 2000ms | 1000ms | **50%** |
| **回源率** | 100% | 20% | **80%** |
| **服务器负载** | 100% | 30% | **70%** |
| **带宽成本** | 100% | 40% | **60%** |

---

### 缓存命中率目标

| 资源类型 | 目标命中率 | 缓存时间 |
|---------|-----------|---------|
| 静态资源（JS/CSS/图片） | > 95% | 1 年 |
| HTML 页面（未登录） | > 80% | 30 分钟 |
| HTML 页面（登录） | > 50% | 协商缓存 |
| API 响应 | > 70% | 5-60 分钟 |

---

## ✅ 实施清单

### 阶段 1：服务端改造（1 周）

- [ ] 实现 ETag 中间件
- [ ] 实现 Cache-Control 中间件
- [ ] 配置不同路由的缓存策略
- [ ] 添加 Vary 头部支持
- [ ] 编写单元测试

---

### 阶段 2：CDN 配置（1 周）

**Cloudflare Workers**：
- [ ] 编写 Workers 脚本
- [ ] 配置缓存策略
- [ ] 实现多端缓存键
- [ ] 实现 AB 测试支持
- [ ] 测试缓存功能

**阿里云 DCDN**：
- [ ] 配置缓存规则
- [ ] 配置回源策略
- [ ] 配置自定义响应头
- [ ] 测试缓存功能

---

### 阶段 3：灰度测试（2 周）

- [ ] 在 1% 流量上启用
- [ ] 监控性能指标（LCP、FCP）
- [ ] 监控缓存命中率
- [ ] 监控错误率
- [ ] 收集用户反馈
- [ ] 扩大到 10% → 50% → 100%

---

### 阶段 4：全量发布（1 周）

- [ ] 全量启用 HTTP 缓存
- [ ] 持续监控性能
- [ ] 建立缓存报警
- [ ] 编写使用文档
- [ ] 培训相关团队

---

### 阶段 5：优化迭代（持续）

- [ ] 分析缓存命中率
- [ ] 优化缓存时间
- [ ] 实现缓存预热
- [ ] 实现智能缓存
- [ ] 建立缓存监控面板

---

## 🔗 参考资料

### 官方文档

- **HTTP 缓存**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- **Cache-Control**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
- **ETag**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
- **Vary**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
- **Cloudflare Workers Cache API**：https://developers.cloudflare.com/workers/runtime-apis/cache/
- **阿里云 DCDN**：https://help.aliyun.com/zh/dcdn/

---

### 相关文章

- [谈一谈对浏览器的强缓存和协商缓存的理解](https://www.cnblogs.com/zhangzhacai/p/15745056.html)
- [HTTP 缓存最佳实践](https://web.dev/http-cache/)
- [CDN 缓存策略](https://www.cloudflare.com/learning/cdn/what-is-caching/)

---

### 相关内部文档

- [前端可生长架构设计](./前端可生长架构设计.md)
- [CDN 资源加载失败信息采集优化](./CDN资源加载失败信息采集优化.md)
- [类 Early Hints 页面离线能力](./类Early-Hints页面离线能力.md)

---

## 📝 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2024-03 | RFC 提案初版，定义 HTTP 缓存策略 |
| 1.1.0 | 2026-01 | 补充详细技术实现、完整代码示例、监控方案 |

---

**作者**：前端基础架构团队  
**审核**：@lincen  
**状态**：✅ 已完成并上线（Insmind）
