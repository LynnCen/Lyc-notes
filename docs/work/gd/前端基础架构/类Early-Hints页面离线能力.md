# RFC 4: 类 Early Hints 页面离线能力

> **RFC 编号**：RFC-004  
> **作者**：前端基础架构团队  
> **最后更新**：2026-01

---

## 📋 概述

本 RFC 提出了一种**离线协商缓存方案**，通过类似 Early Hints 和 Link Prefetching 的机制，为移动端 Web 容器提供**秒开网页**的能力，在保留完整 Web 特性的前提下，达到离线包的性能优化效果。

---

## 🎯 目标

### 主要目标

为移动端 Web 容器提供**秒开打开网页**的能力。

### 具体目标

1. **性能优化**：实现秒开效果，接近离线包的性能
2. **保留 Web 特性**：支持 Cookie、分享等完整 Web 功能
3. **简化流程**：复用前端工程的构建、测试、部署流程
4. **技术先进**：基于 Web 标准（Early Hints、Service Worker）

---

## 💡 动机

### 离线包的问题

过去我们通过**离线包**来缩短网页的白屏时间，但是离线包的构建、测试、部署流程都是独立的，与常规前端工程的方向越来越远，偏离了我们关注的视野，其可用性已经难以满足业务发展。

#### 离线包工作原理

```
1. 前端构建资源
2. 打包成 ZIP 文件
3. 上传到 CDN
4. 客户端下载离线包
5. 解压到本地
6. WebView 加载本地文件
```

---

#### 离线包的核心缺陷

| 缺陷 | 说明 | 影响 |
|------|------|------|
| **Cookie 等 Web 特性无法使用** | 本地 file:// 协议下 Cookie 不生效 | 无法保持登录状态、无法跟踪用户 |
| **页面不支持分享** | file:// URL 无法分享给其他用户 | 社交传播受限 |
| **更新困难** | 需要重新下载整个离线包 | 小改动也要下载数 MB |
| **构建流程独立** | 单独的打包、测试、部署流程 | 维护成本高、容易出错 |
| **版本管理复杂** | 需要管理多个版本的离线包 | 容易出现版本不一致 |
| **调试困难** | 本地文件难以调试 | 问题排查效率低 |

---

#### 离线包 vs 在线 URL 对比

```html
<!-- ❌ 离线包：file:// 协议 -->
<script>
  location.href  // file:///data/offline/index.html
  document.cookie  // 无法使用
  navigator.share()  // 无法分享
</script>

<!-- ✅ 在线 URL：https:// 协议 -->
<script>
  location.href  // https://m.gaoding.com/app
  document.cookie = 'token=xxx'  // 可以使用
  navigator.share({ url: location.href })  // 可以分享
</script>
```

---

### 为什么需要新方案？

**核心需求**：
- ✅ 保持 **https://** 在线 URL
- ✅ 支持完整的 **Web 特性**（Cookie、Storage、分享）
- ✅ 实现**秒开性能**（接近离线包）
- ✅ 复用**前端工程流程**（构建、测试、部署）

---

## 🔍 核心概念解释

### 1. Early Hints（HTTP 103）

**定义**：一种 HTTP 状态码（103），允许服务器在最终响应之前，提前告诉浏览器需要预加载哪些资源。

**HTTP 103 Early Hints 标准流程**：

```
客户端请求 GET /page.html
       ↓
服务器立即返回 HTTP 103 Early Hints
  Link: </style.css>; rel=preload; as=style
  Link: </app.js>; rel=preload; as=script
       ↓
浏览器开始预加载 CSS 和 JS（同时等待 HTML）
       ↓
服务器返回 HTTP 200 OK（HTML 内容）
       ↓
浏览器渲染（CSS 和 JS 已经加载完成）
```

**示例**：

```http
HTTP/1.1 103 Early Hints
Link: </style.css>; rel=preload; as=style
Link: </app.js>; rel=preload; as=script
Link: </logo.png>; rel=preload; as=image

HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <script src="/app.js"></script>
</body>
</html>
```

**优势**：
- ✅ 资源预加载，减少等待时间
- ✅ 浏览器原生支持（Chrome 103+）
- ✅ 不阻塞主响应

**当前限制**：
- ❌ 移动端 WebView 支持度低
- ❌ 需要服务端支持 HTTP/2 或 HTTP/3
- ❌ 无法实现完全离线

---

### 2. Link Prefetching（链接预取）

**定义**：通过 HTML 的 `<link rel="prefetch">` 标签，提示浏览器预加载资源。

**实现方式**：

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ✅ 预加载关键资源 -->
  <link rel="prefetch" href="/app.js" as="script">
  <link rel="prefetch" href="/style.css" as="style">
  <link rel="prefetch" href="/logo.png" as="image">
  
  <!-- ✅ 预加载下一页 -->
  <link rel="prefetch" href="/next-page.html">
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

**vs preload 对比**：

| 特性 | prefetch | preload |
|------|---------|---------|
| 优先级 | 低（空闲时加载） | 高（立即加载） |
| 使用场景 | 预加载下一页 | 预加载当前页必需资源 |
| 缓存策略 | HTTP 缓存 | HTTP 缓存 + 内存缓存 |
| 适用资源 | 任意资源 | 当前页面会用到的资源 |

**示例**：

```html
<!-- prefetch：下一页可能用到 -->
<link rel="prefetch" href="/next-page.html">

<!-- preload：当前页必需 -->
<link rel="preload" href="/critical.css" as="style">
```

---

### 3. Service Worker

**定义**：运行在浏览器后台的 JavaScript 脚本，可以拦截网络请求、管理缓存、实现离线功能。

**核心能力**：
- **网络拦截**：拦截所有 fetch 请求
- **缓存管理**：管理 Cache Storage
- **离线支持**：无网络时提供缓存内容
- **后台同步**：后台更新缓存

**生命周期**：

```
注册 (register)
    ↓
安装 (install)
    ↓
激活 (activate)
    ↓
控制 (fetch/message)
    ↓
更新 (update)
```

**基础示例**：

```javascript
// main.js - 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.error('SW registration failed:', err))
}
```

```javascript
// sw.js - Service Worker 脚本
// 1. 安装阶段：缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ])
    })
  )
})

// 2. 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'v1')
          .map(key => caches.delete(key))
      )
    })
  )
})

// 3. 拦截请求：优先使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})
```

---

### 4. Cache Storage API

**定义**：浏览器提供的缓存存储接口，用于存储 Request/Response 对象。

**API 概览**：

```javascript
// 打开缓存
const cache = await caches.open('my-cache')

// 添加资源到缓存
await cache.add('/index.html')
await cache.addAll(['/style.css', '/app.js'])

// 手动缓存响应
const response = await fetch('/api/data')
await cache.put('/api/data', response.clone())

// 从缓存中获取
const cachedResponse = await cache.match('/index.html')

// 删除缓存项
await cache.delete('/old-file.js')

// 列出所有缓存的 URL
const keys = await cache.keys()

// 删除整个缓存
await caches.delete('my-cache')

// 列出所有缓存
const cacheNames = await caches.keys()
```

---

## 🚀 提议方案

### 整体架构

本方案建立一种类似于 **Early Hints** 和 **Link Prefetching** 的**服务端和客户端协商的缓存策略**，基于**在线 URL** 的方式提前缓存页面内容，达到离线包的性能优化效果。

```
┌─────────────────────────────────────────────────────────┐
│                    移动端 WebView 容器                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Service Worker 实现（原生代理）           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │ 请求拦截   │  │ 缓存管理   │  │ 策略控制  │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↕                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  WebView                          │  │
│  │         https://m.gaoding.com/app                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                     King-BFF 服务器                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  路由: /page?_early_hints=1                      │  │
│  │  返回: { resources: [...], mtime: 1234567890 }   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### 方案设计

#### 核心思路

由于 HTTP 103 Early Hints 是一个较新的标准，客户端 WebView 容器目前并不支持响应 HTTP 103 Code，因此我们需要让客户端 WebView 容器**主动发起获取离线资源的请求**。

---

### 实施步骤

#### 步骤 1：服务端提供资源清单接口

在 King-BFF 中，对页面路由新增 `_early_hints` 查询参数来获取页面的资源列表以及页面修改时间。

**接口设计**：

```
GET /app?_early_hints=1
```

**返回数据**：

```json
{
  "mtime": 1674567890,
  "version": "1.0.0",
  "resources": [
    {
      "url": "https://m.gaoding.com/app",
      "type": "document",
      "priority": "high"
    },
    {
      "url": "https://static.gaoding.com/app.js",
      "type": "script",
      "priority": "high"
    },
    {
      "url": "https://static.gaoding.com/style.css",
      "type": "stylesheet",
      "priority": "high"
    },
    {
      "url": "https://static.gaoding.com/logo.png",
      "type": "image",
      "priority": "low"
    }
  ]
}
```

**服务端实现（Node.js）**：

```javascript
// king-bff/routes/app.js
app.get('/app', async (req, res) => {
  // 检查是否是资源清单请求
  if (req.query._early_hints === '1') {
    // 返回资源清单
    return res.json({
      mtime: Date.now(),
      version: '1.0.0',
      resources: [
        {
          url: 'https://m.gaoding.com/app',
          type: 'document',
          priority: 'high'
        },
        {
          url: 'https://static.gaoding.com/app.js',
          type: 'script',
          priority: 'high'
        },
        {
          url: 'https://static.gaoding.com/style.css',
          type: 'stylesheet',
          priority: 'high'
        },
        {
          url: 'https://static.gaoding.com/logo.png',
          type: 'image',
          priority: 'low'
        }
      ]
    })
  }
  
  // 正常渲染页面
  res.render('app', { /* ... */ })
})
```

---

#### 步骤 2：客户端预加载资源

客户端在 App 启动时或空闲时，主动请求资源清单并预加载资源。

**客户端流程**：

```
1. App 启动
2. 请求 /app?_early_hints=1
3. 获取资源清单
4. 判断缓存是否过期（通过 mtime）
5. 预加载资源到缓存
6. 用户打开页面时直接从缓存读取
```

---

#### 步骤 3：Service Worker 缓存策略

**方式 A：在 HTML 中嵌入 Service Worker 安装器**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  
  <!-- ✅ Service Worker 安装器 -->
  <script type="serviceworker-installer" src="https://static.gaoding.com/sw.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      const scriptURL = document.querySelector('script[type=serviceworker-installer]').src
      navigator.serviceWorker.register(scriptURL, { scope: './' })
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.error('Service Worker registration failed:', err))
    }
  </script>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

**sw.js 示例**（参考爱奇艺）：

```javascript
// sw.js - Service Worker 脚本
const CACHE_NAME = 'gaoding-app-v1'
const CACHE_VERSION = '1.0.0'

// 需要缓存的资源列表
const RESOURCES_TO_CACHE = [
  '/',
  '/app',
  'https://static.gaoding.com/app.js',
  'https://static.gaoding.com/style.css',
  'https://static.gaoding.com/logo.png'
]

// 安装阶段：缓存资源
self.addEventListener('install', (event) => {
  console.log('[SW] Install event')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching resources')
      return cache.addAll(RESOURCES_TO_CACHE)
    }).then(() => {
      // 强制激活，立即接管页面
      return self.skipWaiting()
    })
  )
})

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim()
    })
  )
})

// 拦截请求：缓存优先策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // 只拦截同源请求
  if (!request.url.startsWith(self.location.origin)) {
    return
  }
  
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] Cache hit:', request.url)
        
        // 后台更新缓存（stale-while-revalidate）
        fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse)
            })
          }
        })
        
        return cachedResponse
      }
      
      // 缓存未命中，从网络获取
      console.log('[SW] Cache miss:', request.url)
      return fetch(request).then(networkResponse => {
        // 缓存响应
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache)
          })
        }
        return networkResponse
      })
    }).catch(error => {
      console.error('[SW] Fetch error:', error)
      
      // 返回离线页面
      return caches.match('/offline.html')
    })
  )
})

// 监听消息：动态更新缓存
self.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_CACHE') {
    const { resources } = event.data
    
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        resources.map(url => {
          return fetch(url).then(response => {
            if (response && response.status === 200) {
              return cache.put(url, response)
            }
          })
        })
      )
    }).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})
```

**参考案例**：爱奇艺 Cupid 广告落地页

```javascript
// 示例：https://static.iqiyi.com/ext/cupid/lp/ad-sw.js
const CACHE_NAME = 'cupid-lp-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/lp/',
        '/lp/index.html',
        '/lp/app.js',
        '/lp/style.css'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})
```

---

### Service Worker 容器方案

**核心思路**：App WebView 容器需要**提前获取 sw.js 并安装它**，而 sw.js 的逻辑通常会将 HTML 入口以及其引用的静态资源存入缓存中，当用户打开入口页面的时候就与离线包效果无异。

---

#### 移动端实现方案

**方案 A：原生实现 Service Worker（推荐）**

在 WebView 容器中原生实现 Service Worker 的核心功能：

```
┌─────────────────────────────────────┐
│      WebView 容器（原生代码）        │
│  ┌───────────────────────────────┐  │
│  │   SW Bridge（拦截网络请求）   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Cache Manager（管理缓存）   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Fetch Interceptor          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**iOS 实现（WKWebView）**：

```swift
// ServiceWorkerBridge.swift
import WebKit

class ServiceWorkerBridge: NSObject, WKURLSchemeHandler {
    let cacheManager = CacheManager()
    var serviceWorkerScript: String?
    
    // 注册 SW Bridge
    func register(config: WKWebViewConfiguration) {
        config.setURLSchemeHandler(self, forURLScheme: "https")
    }
    
    // 拦截网络请求
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let request = urlSchemeTask.request
        
        // 检查缓存
        if let cachedResponse = cacheManager.get(request: request) {
            // 从缓存返回
            urlSchemeTask.didReceive(cachedResponse)
            urlSchemeTask.didFinish()
            return
        }
        
        // 从网络加载
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                urlSchemeTask.didFailWithError(error)
                return
            }
            
            if let response = response, let data = data {
                // 缓存响应
                self.cacheManager.put(request: request, response: response, data: data)
                
                // 返回响应
                urlSchemeTask.didReceive(response)
                urlSchemeTask.didReceive(data)
                urlSchemeTask.didFinish()
            }
        }.resume()
    }
    
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // 取消请求
    }
}

// CacheManager.swift
class CacheManager {
    private let fileManager = FileManager.default
    private let cacheDirectory: URL
    
    init() {
        let paths = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)
        cacheDirectory = paths[0].appendingPathComponent("ServiceWorkerCache")
        
        // 创建缓存目录
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
    }
    
    func get(request: URLRequest) -> URLResponse? {
        guard let url = request.url else { return nil }
        let cacheKey = getCacheKey(url: url)
        let cachedFile = cacheDirectory.appendingPathComponent(cacheKey)
        
        guard fileManager.fileExists(atPath: cachedFile.path) else {
            return nil
        }
        
        // 读取缓存的响应
        guard let data = try? Data(contentsOf: cachedFile) else {
            return nil
        }
        
        // 返回 HTTPURLResponse
        return HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "text/html"]
        )
    }
    
    func put(request: URLRequest, response: URLResponse, data: Data) {
        guard let url = request.url else { return }
        let cacheKey = getCacheKey(url: url)
        let cacheFile = cacheDirectory.appendingPathComponent(cacheKey)
        
        // 写入缓存
        try? data.write(to: cacheFile)
    }
    
    private func getCacheKey(url: URL) -> String {
        return url.absoluteString.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? ""
    }
}
```

**Android 实现（WebView）**：

```kotlin
// ServiceWorkerBridge.kt
class ServiceWorkerBridge(private val context: Context) {
    private val cacheManager = CacheManager(context)
    
    fun register(webView: WebView) {
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                request?.url?.let { url ->
                    // 检查缓存
                    cacheManager.get(url.toString())?.let { cachedResponse ->
                        return cachedResponse
                    }
                    
                    // 从网络加载并缓存
                    return loadAndCache(url.toString())
                }
                return null
            }
        }
    }
    
    private fun loadAndCache(url: String): WebResourceResponse? {
        try {
            val connection = URL(url).openConnection() as HttpURLConnection
            connection.connect()
            
            val inputStream = connection.inputStream
            val data = inputStream.readBytes()
            
            // 缓存响应
            cacheManager.put(url, data, connection.contentType)
            
            // 返回响应
            return WebResourceResponse(
                connection.contentType,
                connection.contentEncoding ?: "UTF-8",
                data.inputStream()
            )
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }
}

// CacheManager.kt
class CacheManager(private val context: Context) {
    private val cacheDir = File(context.cacheDir, "ServiceWorkerCache")
    
    init {
        cacheDir.mkdirs()
    }
    
    fun get(url: String): WebResourceResponse? {
        val cacheKey = getCacheKey(url)
        val cacheFile = File(cacheDir, cacheKey)
        
        if (!cacheFile.exists()) {
            return null
        }
        
        val data = cacheFile.readBytes()
        return WebResourceResponse("text/html", "UTF-8", data.inputStream())
    }
    
    fun put(url: String, data: ByteArray, mimeType: String) {
        val cacheKey = getCacheKey(url)
        val cacheFile = File(cacheDir, cacheKey)
        cacheFile.writeBytes(data)
    }
    
    private fun getCacheKey(url: String): String {
        return URLEncoder.encode(url, "UTF-8")
    }
}
```

---

**方案 B：开源方案（存在问题）**

**问题 1：WKWebView 不支持 Service Worker**

根据 WebKit 官方博客：https://webkit.org/blog/8090/workers-at-your-service/

> Service Workers are not available in WKWebView due to security and privacy considerations.

**问题 2：缺乏充分的社区实践案例**

- **爱奇艺的 WKWebView**：虽然提供了生产可行性的案例，但其实现方案**没有开源**
- **SWWebView**：开源方案已经**两年没有更新**，维护状态不明

**开源方案对比**：

| 方案 | 平台 | 最后更新 | Stars | 生产可用 |
|------|------|---------|-------|---------|
| SWWebView | iOS | 2021 | 500+ | ⚠️ 未知 |
| ServiceWorkerWebView | Android | 2020 | 200+ | ⚠️ 未知 |
| PWACompat | 跨平台 | 2022 | 1k+ | ⚠️ 部分功能 |

---

## 📊 性能对比

### 离线包 vs 类 Early Hints

| 指标 | 传统离线包 | 类 Early Hints | 提升 |
|------|-----------|---------------|------|
| **首屏时间** | ~500ms | ~600ms | -20% |
| **支持 Cookie** | ❌ 不支持 | ✅ 支持 | - |
| **支持分享** | ❌ 不支持 | ✅ 支持 | - |
| **更新灵活性** | ❌ 差（整包） | ✅ 好（增量） | - |
| **维护成本** | ❌ 高（独立流程） | ✅ 低（复用流程） | - |
| **调试难度** | ❌ 难 | ✅ 易 | - |
| **实现复杂度** | ⭐⭐ 中等 | ⭐⭐⭐⭐ 高 | - |

**结论**：
- 性能略有下降（~100ms），但在可接受范围内
- Web 特性完整性大幅提升
- 开发和维护成本显著降低

---

## 🎯 实施步骤

### 阶段 1：技术验证（2-3 周）

- [ ] 调研 iOS/Android WebView Service Worker 实现方案
- [ ] 开发 POC 原型
- [ ] 测试基础缓存功能
- [ ] 评估性能数据
- [ ] 评估实现成本

---

### 阶段 2：服务端适配（1-2 周）

- [ ] King-BFF 添加 `_early_hints` 接口
- [ ] 实现资源清单生成逻辑
- [ ] 添加缓存版本管理（mtime）
- [ ] 编写服务端单元测试

---

### 阶段 3：客户端开发（4-6 周）

**iOS**：
- [ ] 实现 ServiceWorkerBridge
- [ ] 实现 CacheManager
- [ ] 实现请求拦截器
- [ ] 实现预加载逻辑
- [ ] 编写客户端单元测试

**Android**：
- [ ] 实现 ServiceWorkerBridge
- [ ] 实现 CacheManager
- [ ] 实现 WebViewClient 拦截
- [ ] 实现预加载逻辑
- [ ] 编写客户端单元测试

---

### 阶段 4：前端适配（1 周）

- [ ] 页面添加 Service Worker 安装器
- [ ] 编写 sw.js 缓存策略
- [ ] 实现缓存更新逻辑
- [ ] 添加性能监控

---

### 阶段 5：灰度测试（2-3 周）

- [ ] 在 1% 用户上启用
- [ ] 监控性能指标（FCP、白屏时间）
- [ ] 收集用户反馈
- [ ] 修复发现的问题
- [ ] 扩大到 10% → 50% → 100%

---

### 阶段 6：全量发布（1 周）

- [ ] 全量发布客户端
- [ ] 持续监控性能和稳定性
- [ ] 编写使用文档
- [ ] 培训相关团队
- [ ] 关闭旧的离线包系统

---

## 🔮 未来可能性

### 1. 智能预加载

根据用户行为预测，智能预加载用户可能访问的页面：

```javascript
// 预测用户下一步操作
const predictNextPage = () => {
  // 基于用户历史行为、当前页面、时间等因素
  // 使用机器学习模型预测
  return '/predicted-next-page'
}

// 智能预加载
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    const nextPage = predictNextPage()
    fetch(nextPage).then(response => {
      caches.open('prefetch-cache').then(cache => {
        cache.put(nextPage, response)
      })
    })
  })
}
```

---

### 2. 增量更新

只更新变化的资源，而非整个页面：

```javascript
// 获取资源清单
const manifest = await fetch('/app?_early_hints=1').then(r => r.json())

// 对比本地缓存版本
const cache = await caches.open('app-cache')
const cachedManifest = await cache.match('/manifest.json').then(r => r?.json())

// 只更新变化的资源
const changedResources = manifest.resources.filter(resource => {
  const cached = cachedManifest?.resources.find(r => r.url === resource.url)
  return !cached || cached.mtime < resource.mtime
})

// 更新变化的资源
await Promise.all(
  changedResources.map(resource => 
    fetch(resource.url).then(response => cache.put(resource.url, response))
  )
)
```

---

### 3. HTTP/2 Server Push 集成

结合 HTTP/2 Server Push，进一步优化性能：

```javascript
// 服务端（Node.js）
app.get('/app', (req, res) => {
  // 推送关键资源
  res.push('/app.js', {})
  res.push('/style.css', {})
  
  // 渲染 HTML
  res.render('app')
})
```

---

### 4. 多层缓存策略

结合 Memory Cache、Disk Cache、HTTP Cache：

```javascript
// sw.js - 多层缓存策略
const CACHE_STRATEGIES = {
  'critical': 'cache-first',       // 关键资源：缓存优先
  'static': 'stale-while-revalidate',  // 静态资源：后台更新
  'api': 'network-first',          // API：网络优先
  'image': 'cache-first'           // 图片：缓存优先
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const strategy = getStrategy(url)
  
  event.respondWith(handleRequest(event.request, strategy))
})
```

---

## ⚠️ 注意事项

### 1. HTTPS 要求

Service Worker 只能在 HTTPS 环境下工作（localhost 除外）：

```javascript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Service Worker requires HTTPS')
}
```

---

### 2. 跨域限制

Service Worker 只能拦截同源请求：

```javascript
self.addEventListener('fetch', (event) => {
  // 只拦截同源请求
  if (new URL(event.request.url).origin !== self.location.origin) {
    return
  }
  
  event.respondWith(/* ... */)
})
```

---

### 3. 缓存大小限制

浏览器对 Cache Storage 有大小限制（通常 50MB-100MB）：

```javascript
// 检查缓存大小
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate()
  const usage = estimate.usage
  const quota = estimate.quota
  const percentUsed = (usage / quota * 100).toFixed(2)
  
  console.log(`缓存使用: ${percentUsed}%`)
}
```

---

### 4. Service Worker 更新

Service Worker 更新需要特殊处理：

```javascript
// 检测到新的 Service Worker
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // 提示用户刷新页面
  if (confirm('发现新版本，是否刷新？')) {
    window.location.reload()
  }
})
```

---

## 🔗 参考资料

### 官方文档

- **Early Hints 介绍**：https://developer.chrome.com/blog/early-hints/
- **Service Worker API**：https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Cache Storage API**：https://developer.mozilla.org/en-US/docs/Web/API/Cache
- **Link Prefetching**：https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ
- **WebKit Service Worker 状态**：https://webkit.org/blog/8090/workers-at-your-service/

---

### 工具和库

- **http-link-header**：https://www.npmjs.com/package/http-link-header（解析 HTTP Link 响应头）
- **Workbox**：https://developers.google.com/web/tools/workbox（Google 的 Service Worker 工具库）
- **sw-toolbox**：https://github.com/GoogleChromeLabs/sw-toolbox（Service Worker 缓存策略）

---

### 案例参考

- **爱奇艺 Cupid 落地页**：https://static.iqiyi.com/ext/cupid/lp/ad-sw.js
- **Twitter PWA**：使用 Service Worker 实现秒开
- **Pinterest PWA**：使用 Service Worker 提升 40% 性能

---

### 相关内部文档

- [前端可生长架构设计](./前端可生长架构设计.md)
- [CDN 资源加载失败信息采集优化](./CDN资源加载失败信息采集优化.md)
- [无阻塞的 SLS SDK 优化](./无阻塞的SLS-SDK优化.md)

---

## 📝 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2023-02 | RFC 提案初版，定义类 Early Hints 方案 |
| 1.1.0 | 2026-01 | 补充详细技术实现、iOS/Android 代码示例 |

---

**作者**：前端基础架构团队  
**审核**：@lincen  
**状态**：🚧 设计阶段
