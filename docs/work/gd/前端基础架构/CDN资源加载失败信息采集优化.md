# RFC 3: CDN 资源加载失败信息采集优化

> **RFC 编号**：RFC-003  
> **作者**：前端基础架构团队  
> **最后更新**：2026-01

---

## 📋 概述

本 RFC 提出了一套完整的 CDN 资源加载失败监控方案，通过采集详细的诊断信息（DNS、IP、响应头、性能指标），帮助定位和解决 CDN 资源加载异常问题，提升用户体验和系统稳定性。

---

## 🎯 目标

### 主要目标

收集 CDN 资源异常详情，解决 CDN 资源加载失败量大的问题。

### 具体目标

1. **全面监控**：覆盖 DNS、网络、CDN 节点等各个环节
2. **精准定位**：采集足够的诊断信息，快速定位问题根因
3. **最小影响**：仅在性能异常时触发，避免影响正常用户
4. **可操作性**：提供可配置的探针机制，支持动态调整

---

## 📊 问题描述

### 现状

前端站点接入监控后，收集资源错误情况，发现**河南、北京、广东等城市 CDN 资源错误数异常高**。

![CDN 错误统计](attachments/image2023-4-17_18-39-7.png)

**数据表现**：
- 异常资源用户占比：**3.6%**
- FCP > 6000ms 用户占比：**7.5%**
- 涉及地区：河南、北京、广东等多个省份
- 错误类型：资源加载超时、网络错误、DNS 解析失败

### 反馈结果

将问题反馈给阿里云后，阿里云进行排查**并未发现 CDN 节点有异常**。

**问题分析**：
1. **信息不足**：监控收集的数据缺少关键诊断信息
2. **无法定位**：不清楚是用户网络问题、DNS 劫持还是 CDN 节点问题
3. **缺乏证据**：没有足够的数据支撑进一步的问题排查

---

## 💡 动机

### 为什么需要优化？

#### 1. 现有监控的局限性

**传统监控方案**：
```javascript
// ❌ 传统方式：只能捕获错误，但信息不足
window.addEventListener('error', (event) => {
  if (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
    console.error('资源加载失败:', event.target.src || event.target.href)
    // 问题：只知道失败了，但不知道为什么失败
  }
}, true)
```

**存在的问题**：
- ✅ 能知道**什么资源**加载失败
- ✅ 能知道**何时**加载失败
- ❌ 不知道**为什么**加载失败
- ❌ 不知道是**用户网络问题**还是 **CDN 问题**
- ❌ 不知道走的是**哪个 CDN 节点**

#### 2. 需要回答的关键问题

为了定位 CDN 资源加载失败的根因，我们需要回答以下问题：

| 问题 | 需要的数据 | 说明 |
|------|-----------|------|
| 用户在哪里？ | 本地 IP、地理位置 | 确定用户所在地区和运营商 |
| DNS 是否正常？ | Local DNS、DNS 解析结果 | 判断 DNS 是否被劫持或污染 |
| 走的哪个 CDN 节点？ | eagleid、x-oss-request-id | 定位具体的 CDN 节点 |
| CDN 节点是否正常？ | 探针响应状态、响应时间 | 检测 CDN 节点的可用性 |
| 是否命中缓存？ | X-Cache 响应头 | 判断 CDN 缓存是否生效 |
| 是用户网络慢还是 CDN 慢？ | FCP、资源加载时间 | 区分用户网络和 CDN 性能问题 |

---

## 🔍 核心概念解释

在深入技术方案前，先理解以下核心概念：

### 1. CDN（Content Delivery Network）

**定义**：内容分发网络，将静态资源缓存到全球各地的边缘节点，用户就近访问，提升加载速度。

**工作原理**：
```
用户请求 → DNS 解析 → 返回最近的 CDN 节点 IP → 访问 CDN 节点 → 返回资源
```

**示例**：
```html
<!-- 原始 URL -->
<script src="https://example.com/app.js"></script>

<!-- CDN URL -->
<script src="https://cdn.example.com/app.js"></script>
```

**优势**：
- ✅ 就近访问，延迟低
- ✅ 分担源站压力
- ✅ 提升全球访问速度

---

### 2. Local DNS

**定义**：用户本地配置的 DNS 服务器，负责将域名解析为 IP 地址。

**解析流程**：
```
1. 浏览器查询 cdn.example.com
2. 本地 DNS 递归查询
3. 返回 CDN 节点 IP（如 123.45.67.89）
4. 浏览器访问该 IP
```

**常见问题**：
- **DNS 劫持**：恶意 DNS 返回错误的 IP
- **DNS 污染**：DNS 缓存了错误的解析结果
- **跨运营商**：电信用户使用了联通的 DNS

---

### 3. FCP (First Contentful Paint)

**定义**：首次内容渲染时间，浏览器首次渲染任何文本、图像、背景等内容的时间点。

**测量方式**：
```javascript
// 使用 Performance Observer API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime, 'ms')
    }
  }
})
observer.observe({ entryTypes: ['paint'] })
```

**性能基准**：
- **优秀**：< 1.8s
- **需要改进**：1.8s - 3.0s
- **差**：> 3.0s
- **本方案阈值**：> 6.0s（严重性能问题）

---

### 4. 响应头（Response Headers）

#### x-oss-request-id

**定义**：阿里云 OSS 对象存储服务返回的请求标识符。

**作用**：
- 唯一标识每个请求
- 用于服务器端诊断问题
- 查询请求日志

**示例**：
```
x-oss-request-id: 5C3D9175B6FC201293AD****
```

#### eagleid

**定义**：CDN 或负载均衡器附加的自定义响应头，用于标识请求并跟踪流量。

**作用**：
- 标识 CDN 节点
- 跟踪请求路径
- 定位具体的边缘服务器

**示例**：
```
eagleid: 7fd6a5e816800123456789012e
```

#### X-Cache

**定义**：记录资源是否被 CDN 缓存及缓存位置。

**可能的值**：
- **HIT**：命中缓存，从 CDN 节点直接返回
- **MISS**：未命中缓存，从源站获取
- **EXPIRED**：缓存过期，需要重新验证
- **BYPASS**：绕过缓存

**示例**：
```
X-Cache: HIT from cdn-node-123
X-Cache: MISS from cdn-node-456
```

---

### 5. CDN 探针

**定义**：在 CDN 上部署的测试资源（通常是 1x1 像素的 GIF 图片），用于检测 CDN 的可用性和性能。

**工作原理**：
```
前端定时请求探针 → 分析响应状态和响应头 → 判断 CDN 健康状况
```

**探针示例**：
```
https://cdn1.example.com/probe.gif
https://cdn2.example.com/probe.gif
https://cdn3.example.com/probe.gif
```

---

## 🚀 技术方案

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   用户浏览器                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ 性能监控     │  │ DNS 检测     │  │ CDN 探针  │ │
│  │ (FCP > 6s)  │  │ (JSONP)     │  │ (Ajax)    │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼──────────────────┼────────────────┼───────┘
          │                  │                │
          │                  │                │
          ▼                  ▼                ▼
    ┌─────────────────────────────────────────────┐
    │           数据收集与上报模块                  │
    │   ┌─────────┐  ┌─────────┐  ┌──────────┐  │
    │   │ Local IP│  │ DNS Info│  │ CDN Meta │  │
    │   └─────────┘  └─────────┘  └──────────┘  │
    └──────────────────┬──────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   ELK 平台     │
              │  (日志存储)    │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Kibana 可视化 │
              │  (问题分析)    │
              └────────────────┘
```

---

## 🛠 详细实施方案

### 方案 1：采集用户的 Local DNS 和本地 IP 信息

#### 为什么需要这些信息？

- **本地 IP**：确定用户所在地区和运营商
- **Local DNS**：判断 DNS 服务是否正常、是否跨运营商

#### 实现方式

使用阿里云昆仑用户诊断工具提供的 JSONP API：

```javascript
/**
 * 获取用户的 DNS 和 IP 信息
 * @returns {Promise<Object>} DNS 和 IP 信息
 */
function getUserDNSInfo() {
  return new Promise((resolve, reject) => {
    const callbackName = `dns_detect_callback_${Date.now()}`
    
    // 定义 JSONP 回调
    window[callbackName] = function(data) {
      delete window[callbackName]
      document.body.removeChild(script)
      resolve(data)
    }
    
    // 创建 JSONP 请求
    const script = document.createElement('script')
    script.src = `https://xxxxxxx.dns-detect.alicdn.com/api/detect/DescribeDNSLookup?callback=${callbackName}`
    script.onerror = () => {
      delete window[callbackName]
      document.body.removeChild(script)
      reject(new Error('DNS 检测失败'))
    }
    
    document.body.appendChild(script)
  })
}

// 使用示例
getUserDNSInfo().then(data => {
  console.log('用户 IP:', data.client_ip)
  console.log('Local DNS:', data.dns_server)
  console.log('地理位置:', data.location)
  console.log('运营商:', data.isp)
})
```

**返回数据示例**：
```json
{
  "client_ip": "123.45.67.89",
  "dns_server": "114.114.114.114",
  "location": {
    "country": "CN",
    "province": "广东",
    "city": "深圳"
  },
  "isp": "中国电信"
}
```

---

### 方案 2：CDN 探针检测

#### 探针部署

在公司主要的 CDN 域名上分别上传 **1x1 像素的 GIF 图片**：

**创建探针图片**：
```bash
# 创建 1x1 透明 GIF（43 字节）
echo "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" | base64 -d > probe.gif
```

**上传到 CDN**：
```bash
# 上传到各个 CDN 域名
aliyun oss cp probe.gif oss://cdn1-bucket/probe.gif
aliyun oss cp probe.gif oss://cdn2-bucket/probe.gif
aliyun oss cp probe.gif oss://cdn3-bucket/probe.gif
```

**公司主要 CDN 域名示例**：
```javascript
const CDN_PROBES = [
  'https://static.gaoding.com/probe.gif',
  'https://assets.gaoding.com/probe.gif',
  'https://cdn.gaoding.com/probe.gif'
]
```

---

#### 探针检测实现

```javascript
/**
 * CDN 探针检测
 * @param {string} probeUrl - 探针 URL
 * @returns {Promise<Object>} 探针检测结果
 */
async function probeCDN(probeUrl) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(probeUrl, {
      method: 'GET',
      cache: 'no-cache',  // 避免浏览器缓存
      headers: {
        'Accept': 'image/gif'
      }
    })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // 提取关键响应头
    const headers = {
      'x-oss-request-id': response.headers.get('x-oss-request-id'),
      'eagleid': response.headers.get('eagleid'),
      'x-cache': response.headers.get('x-cache'),
      'x-swift-cachetime': response.headers.get('x-swift-cachetime'),
      'server': response.headers.get('server')
    }
    
    return {
      url: probeUrl,
      status: response.status,
      statusText: response.statusText,
      headers,
      duration,
      timestamp: Date.now(),
      success: response.ok
    }
  } catch (error) {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    return {
      url: probeUrl,
      status: 0,
      statusText: error.message,
      headers: {},
      duration,
      timestamp: Date.now(),
      success: false,
      error: {
        name: error.name,
        message: error.message
      }
    }
  }
}
```

---

#### 触发时机

**关键决策**：在 **FCP > 6000ms** 时触发探针检测。

**原因分析**：

1. **用户体验阈值**：FCP > 6s 用户通常无法接受，属于严重性能问题
2. **覆盖率**：
   - FCP > 6000ms 用户占比：**7.5%**
   - 异常资源用户占比：**3.6%**
   - **7.5% > 3.6%**，能完全覆盖异常资源的情况
3. **避免过度监控**：正常用户（FCP < 6s）不触发检测，减少额外开销

**实现**：
```javascript
/**
 * 监听 FCP 并触发探针检测
 */
function monitorFCPAndProbe() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = entry.startTime
        
        console.log('FCP:', fcp, 'ms')
        
        // FCP > 6000ms 时触发探针检测
        if (fcp > 6000) {
          console.warn('FCP 超过 6s，触发 CDN 探针检测')
          triggerCDNProbe()
        }
        
        observer.disconnect()
      }
    }
  })
  
  observer.observe({ entryTypes: ['paint'] })
}

/**
 * 触发 CDN 探针检测
 */
async function triggerCDNProbe() {
  const results = await Promise.allSettled(
    CDN_PROBES.map(url => probeCDN(url))
  )
  
  // 收集所有探针结果
  const probeData = results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        error: result.reason.message,
        success: false
      }
    }
  })
  
  // 上报数据
  reportCDNProbeData(probeData)
}
```

---

### 方案 3：数据上报

#### 为什么上报到 ELK 而非 SLS？

**问题**：SLS SDK 本身也是通过 CDN 提供的，如果 CDN 出现异常，SDK 本身也不可用。

**解决方案**：将 CDN 检测数据上报到 **ELK 平台**（独立的日志通道）。

**架构对比**：

| 特性 | SLS 上报 | ELK 上报 |
|------|---------|---------|
| 依赖 CDN | ✅ 是 | ❌ 否 |
| CDN 异常时可用 | ❌ 不可用 | ✅ 可用 |
| 数据完整性 | ❌ 可能丢失 | ✅ 完整 |
| 适用场景 | 常规监控 | CDN 故障诊断 |

---

#### 数据上报实现

```javascript
/**
 * 上报 CDN 探针数据到 ELK
 * @param {Array} probeData - 探针检测结果
 */
async function reportCDNProbeData(probeData) {
  try {
    // 1. 获取 DNS 和 IP 信息
    const dnsInfo = await getUserDNSInfo()
    
    // 2. 获取性能指标
    const performanceData = getPerformanceData()
    
    // 3. 获取用户代理信息
    const userAgent = navigator.userAgent
    
    // 4. 组装完整的上报数据
    const reportData = {
      // 时间戳
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      
      // 用户信息
      user: {
        ip: dnsInfo.client_ip,
        dns: dnsInfo.dns_server,
        location: dnsInfo.location,
        isp: dnsInfo.isp,
        userAgent
      },
      
      // 性能数据
      performance: performanceData,
      
      // CDN 探针数据
      probes: probeData,
      
      // 页面信息
      page: {
        url: location.href,
        referrer: document.referrer,
        title: document.title
      }
    }
    
    // 5. 上报到 ELK
    await fetch('https://log.gaoding.com/api/cdn-probe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    })
    
    console.log('CDN 探针数据上报成功')
  } catch (error) {
    console.error('CDN 探针数据上报失败:', error)
  }
}

/**
 * 获取性能指标
 */
function getPerformanceData() {
  const navigation = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  
  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
  const lcp = performance.getEntriesByType('largest-contentful-paint')[0]
  
  return {
    // 页面加载时间
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
    
    // DNS 查询时间
    dnsTime: navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
    
    // TCP 连接时间
    tcpTime: navigation?.connectEnd - navigation?.connectStart || 0,
    
    // FCP
    fcp: fcp?.startTime || 0,
    
    // LCP
    lcp: lcp?.startTime || 0,
    
    // 资源加载统计
    resources: getResourceStats()
  }
}

/**
 * 获取资源加载统计
 */
function getResourceStats() {
  const resources = performance.getEntriesByType('resource')
  
  const stats = {
    total: resources.length,
    failed: 0,
    slow: 0,  // 加载时间 > 3s
    byType: {}
  }
  
  resources.forEach(resource => {
    // 统计失败的资源
    if (resource.transferSize === 0 && resource.duration > 0) {
      stats.failed++
    }
    
    // 统计慢速资源
    if (resource.duration > 3000) {
      stats.slow++
    }
    
    // 按类型统计
    const type = resource.initiatorType
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, totalDuration: 0 }
    }
    stats.byType[type].count++
    stats.byType[type].totalDuration += resource.duration
  })
  
  return stats
}
```

---

### 方案 4：启动脚本

#### 部署位置

这段代码应该放在项目入口 HTML，且**最好在 `<link>` 标签之前**。

**原因**：
- CSS 加载时间可能很长
- 如果放在 CSS 后面，可能因为 CSS 阻塞而无法执行到这段代码
- 影响 FCP 检测的准确性

**推荐位置**：
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My App</title>
  
  <!-- ✅ CDN 探针脚本（最高优先级，内联） -->
  <script>
    (function() {
      // 1. 监听 FCP
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime
            
            // 2. FCP > 6000ms 时动态加载探针脚本
            if (fcp > 6000) {
              loadCDNProbeScript()
            }
            
            observer.disconnect()
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint'] })
      
      // 3. 动态加载探针脚本
      function loadCDNProbeScript() {
        const script = document.createElement('script')
        script.src = '/cdn-probe-detector.js'
        script.async = true
        document.body.appendChild(script)
      }
    })()
  </script>
  
  <!-- CSS 加载（可能很慢） -->
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

---

#### 完整的探针脚本

```javascript
// cdn-probe-detector.js
(function() {
  'use strict'
  
  // CDN 探针 URL 列表
  const CDN_PROBES = [
    'https://static.gaoding.com/probe.gif',
    'https://assets.gaoding.com/probe.gif',
    'https://cdn.gaoding.com/probe.gif'
  ]
  
  // ELK 上报地址
  const ELK_ENDPOINT = 'https://log.gaoding.com/api/cdn-probe'
  
  /**
   * 主函数
   */
  async function main() {
    try {
      console.log('[CDN Probe] 开始检测')
      
      // 1. 获取 DNS 信息
      const dnsInfo = await getUserDNSInfo()
      console.log('[CDN Probe] DNS 信息:', dnsInfo)
      
      // 2. 执行探针检测
      const probeResults = await Promise.allSettled(
        CDN_PROBES.map(url => probeCDN(url))
      )
      console.log('[CDN Probe] 探针结果:', probeResults)
      
      // 3. 收集数据
      const reportData = {
        timestamp: Date.now(),
        datetime: new Date().toISOString(),
        user: {
          ip: dnsInfo.client_ip,
          dns: dnsInfo.dns_server,
          location: dnsInfo.location,
          isp: dnsInfo.isp,
          userAgent: navigator.userAgent
        },
        performance: getPerformanceData(),
        probes: probeResults.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason.message }),
        page: {
          url: location.href,
          referrer: document.referrer,
          title: document.title
        }
      }
      
      // 4. 上报数据
      await reportToELK(reportData)
      console.log('[CDN Probe] 数据上报成功')
    } catch (error) {
      console.error('[CDN Probe] 检测失败:', error)
    }
  }
  
  /**
   * 上报到 ELK
   */
  async function reportToELK(data) {
    try {
      await fetch(ELK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true  // 确保页面关闭时也能发送
      })
    } catch (error) {
      // 降级：使用 sendBeacon
      navigator.sendBeacon(
        ELK_ENDPOINT,
        JSON.stringify(data)
      )
    }
  }
  
  // 执行主函数
  main()
})()
```

---

## 📊 数据分析

### Kibana 查询示例

在 ELK 平台的 Kibana 中，可以进行以下分析：

#### 1. CDN 节点成功率

```
# 按 eagleid 分组，统计成功率
GET /cdn-probe-*/_search
{
  "size": 0,
  "aggs": {
    "by_eagleid": {
      "terms": {
        "field": "probes.headers.eagleid.keyword"
      },
      "aggs": {
        "success_rate": {
          "avg": {
            "field": "probes.success"
          }
        }
      }
    }
  }
}
```

---

#### 2. 地域分布

```
# 按地区分组，统计探针成功率
GET /cdn-probe-*/_search
{
  "size": 0,
  "aggs": {
    "by_province": {
      "terms": {
        "field": "user.location.province.keyword"
      },
      "aggs": {
        "success_rate": {
          "avg": {
            "field": "probes.success"
          }
        }
      }
    }
  }
}
```

---

#### 3. 运营商分析

```
# 按运营商分组
GET /cdn-probe-*/_search
{
  "size": 0,
  "aggs": {
    "by_isp": {
      "terms": {
        "field": "user.isp.keyword"
      },
      "aggs": {
        "avg_duration": {
          "avg": {
            "field": "probes.duration"
          }
        }
      }
    }
  }
}
```

---

### 可视化面板

在 Kibana 中创建以下可视化：

1. **CDN 节点健康地图**
   - 地图类型：中国地图
   - 颜色：探针成功率（绿色=正常，红色=异常）

2. **响应时间趋势图**
   - 类型：折线图
   - X 轴：时间
   - Y 轴：探针响应时间
   - 分组：CDN 域名

3. **缓存命中率**
   - 类型：饼图
   - 分组：X-Cache（HIT/MISS）

4. **TOP 异常地区**
   - 类型：柱状图
   - X 轴：省份
   - Y 轴：探针失败次数

---

## 🔮 未来可能性

### 1. CDN 探针可配置化

**当前问题**：探针 URL 硬编码在代码中，增加新 CDN 节点需要重新发布。

**改进方案**：通过配置中心动态下发探针列表。

```javascript
/**
 * 从配置中心获取探针列表
 */
async function getCDNProbes() {
  try {
    const response = await fetch('https://config.gaoding.com/api/cdn-probes')
    const config = await response.json()
    
    return config.probes  // 动态返回探针列表
  } catch (error) {
    // 降级：使用默认探针列表
    return [
      'https://static.gaoding.com/probe.gif',
      'https://assets.gaoding.com/probe.gif',
      'https://cdn.gaoding.com/probe.gif'
    ]
  }
}
```

**配置示例**：
```json
{
  "probes": [
    {
      "url": "https://static.gaoding.com/probe.gif",
      "name": "静态资源 CDN",
      "priority": 1
    },
    {
      "url": "https://assets.gaoding.com/probe.gif",
      "name": "素材 CDN",
      "priority": 2
    },
    {
      "url": "https://cdn.gaoding.com/probe.gif",
      "name": "主 CDN",
      "priority": 3
    }
  ],
  "threshold": {
    "fcp": 6000,
    "duration": 3000
  }
}
```

---

### 2. 智能降级策略

**场景**：当检测到某个 CDN 节点异常时，自动切换到备用节点。

```javascript
/**
 * 智能降级加载资源
 */
async function loadResourceWithFallback(urls) {
  for (const url of urls) {
    try {
      // 先探测 CDN 节点
      const probeResult = await probeCDN(url.replace(/\/[^/]+$/, '/probe.gif'))
      
      if (probeResult.success && probeResult.duration < 3000) {
        // CDN 正常，直接加载
        return await loadResource(url)
      }
    } catch (error) {
      // 继续尝试下一个 URL
    }
  }
  
  throw new Error('所有 CDN 节点均不可用')
}

// 使用示例
loadResourceWithFallback([
  'https://cdn1.gaoding.com/app.js',
  'https://cdn2.gaoding.com/app.js',
  'https://cdn3.gaoding.com/app.js'
])
```

---

### 3. 实时告警

**场景**：CDN 异常率超过阈值时，实时告警通知运维团队。

```javascript
// 后端告警逻辑（伪代码）
const alertRules = [
  {
    name: 'CDN 探针失败率过高',
    condition: 'probe_fail_rate > 0.1',  // 失败率 > 10%
    window: '5m',  // 5 分钟窗口
    action: 'send_alert_to_ops'
  },
  {
    name: 'CDN 响应时间过长',
    condition: 'avg(probe_duration) > 5000',  // 平均响应时间 > 5s
    window: '10m',
    action: 'send_alert_to_ops'
  }
]
```

---

### 4. 用户网络质量评分

**场景**：根据探针数据，对用户网络质量进行评分，用于个性化优化。

```javascript
/**
 * 计算用户网络质量评分
 * @returns {Object} 评分结果
 */
function calculateNetworkQuality(probeData) {
  let score = 100
  
  // 扣分项
  probeData.forEach(probe => {
    if (!probe.success) {
      score -= 30  // 探针失败严重扣分
    } else if (probe.duration > 3000) {
      score -= 10  // 响应慢扣分
    } else if (probe.headers['x-cache'] !== 'HIT') {
      score -= 5   // 未命中缓存扣分
    }
  })
  
  // 评级
  let grade
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else grade = 'D'
  
  return { score, grade }
}

// 根据评分优化策略
const quality = calculateNetworkQuality(probeData)
if (quality.grade === 'D') {
  // 启用低质量网络优化
  enableLowQualityMode()
}
```

---

## 🎯 实施步骤

### 阶段 1：准备工作（1 周）

- [ ] 创建 1x1 GIF 探针文件
- [ ] 上传探针到各个 CDN 域名
- [ ] 开发探针检测脚本
- [ ] 配置 ELK 日志接收接口
- [ ] 创建 Kibana 可视化面板

---

### 阶段 2：灰度测试（2 周）

- [ ] 在 1% 用户上启用探针检测
- [ ] 监控 ELK 日志量和数据质量
- [ ] 验证数据完整性
- [ ] 分析初步数据，定位问题
- [ ] 修复发现的 bug

---

### 阶段 3：扩大范围（2 周）

- [ ] 扩大到 10% 用户
- [ ] 观察 CDN 节点分布
- [ ] 识别高风险地区和运营商
- [ ] 与阿里云沟通，定位具体节点问题
- [ ] 验证问题修复效果

---

### 阶段 4：全量发布（1 周）

- [ ] 全量发布探针检测
- [ ] 持续监控 CDN 健康状况
- [ ] 建立告警规则
- [ ] 编写运维文档
- [ ] 培训相关团队

---

## 📈 预期效果

### 1. 问题定位能力提升

| 能力 | 优化前 | 优化后 |
|------|-------|-------|
| 识别 CDN 节点 | ❌ 不能 | ✅ 可以（通过 eagleid） |
| 判断 DNS 问题 | ❌ 不能 | ✅ 可以（通过 Local DNS） |
| 区分用户网络/CDN | ❌ 不能 | ✅ 可以（通过探针响应时间） |
| 定位异常地区 | ⚠️ 部分 | ✅ 精确到省份/运营商 |

---

### 2. 故障恢复时间缩短

- **MTTD（平均故障检测时间）**：从数小时缩短到**分钟级**
- **MTTR（平均故障恢复时间）**：从数天缩短到**数小时**

---

### 3. CDN 质量改善

- CDN 异常率预计下降 **50%**
- 用户 FCP > 6s 占比下降 **30%**
- CDN 相关投诉减少 **70%**

---

## 🔗 参考资料

### 官方文档

- [阿里云 CDN - OSS 请求 ID](https://help.aliyun.com/document_detail/40193.html)
- [阿里云 CDN - 故障排查](https://help.aliyun.com/practice_detail/602254.html)
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [sendBeacon API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)

---

### 相关内部文档

- [前端可生长架构设计](./前端可生长架构设计.md)
- [无阻塞的 SLS SDK 优化](./无阻塞的SLS-SDK优化.md)
- [可观测性](../ai-agent/05-可观测性/)

---

## 📝 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2023-04 | RFC 提案初版，定义 CDN 探针监控方案 |
| 1.1.0 | 2026-01 | 补充详细技术实现、概念解释和最佳实践 |

---

**作者**：前端基础架构团队  
**审核**：@lincen  
**状态**：✅ 已上线
