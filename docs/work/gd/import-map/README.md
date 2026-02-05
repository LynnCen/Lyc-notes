# Import Map 技术文档集

> **文档集概述**  
> 本目录包含了 Import Map 技术的完整文档体系，从基础概念到工具演进，再到实践指南。

---

## 📚 文档目录

### 1️⃣ 基础概念

**[01-基础概念-importmap与ESM-CDN介绍.md](01-基础概念-importmap与ESM-CDN介绍.md)**

- Import Map 基础概念与特性
- ESM CDN 服务介绍
- WPM 工具使用指南
- 包规范要求
- 实际应用收益

**适合人群**：
- 🎯 新手入门
- 🎯 了解 Import Map 概念
- 🎯 了解 ESM CDN 和 WPM

---

### 2️⃣ 工具演进

#### **[02-工具演进-RFC15-WPM2.md](02-工具演进-RFC15-WPM2.md)**

**WPM v1 → WPM2 升级**

- WPM v1 的局限性分析
- WPM2 的设计方案
- 支持包的子路径入口
- 确保依赖版本一致性
- 完全自动化的生成流程

**适合人群**：
- 🎯 了解 WPM 工具演进
- 🎯 需要子路径支持
- 🎯 关注版本一致性

#### **[03-工具演进-RFC20-WPM3.md](03-工具演进-RFC20-WPM3.md)**

**WPM2 → WPM3 升级**

- Monorepo Workspace 包支持
- 使用 Git Commit Hash 作为版本
- Workspace 与 npm 包混合使用
- 完整的 CI/CD 集成方案

**适合人群**：
- 🎯 Monorepo 项目开发者
- 🎯 需要 Workspace 包支持
- 🎯 关注 CI/CD 自动化

---

### 3️⃣ 实践指南

**[04-实践指南-浏览器兼容性处理.md](04-实践指南-浏览器兼容性处理.md)**

- ES Module Shims 垫片使用
- 标准化的加载方式
- 开发与生产环境兼容
- 错误处理与性能优化

**适合人群**：
- 🎯 需要兼容旧版浏览器
- 🎯 处理生产环境部署
- 🎯 优化加载性能

---

## 🗂️ 目录结构

```
import-map/
├── README.md                                      # 本文档
├── 01-基础概念-importmap与ESM-CDN介绍.md          # 基础概念
├── 02-工具演进-RFC15-WPM2.md                     # WPM2 RFC
├── 03-工具演进-RFC20-WPM3.md                     # WPM3 RFC
├── 04-实践指南-浏览器兼容性处理.md                 # 兼容性指南
└── attachments/                                   # 所有图片附件
    ├── image2022-6-16_15-25-5.png                # CDN 工作流程图
    ├── image2022-12-7_14-42-24.png               # 插件干扰提示
    ├── image2022-12-8_13-41-45.png               # 裸模块导入错误
    ├── importmap-workspace.png                    # Workspace 流程图
    ├── wpm2 importmap 生成.png                    # WPM2 生成流程
    └── ...                                        # 其他图片
```

---

## 🎯 学习路径

### 路径 1：新手入门

```
1. 阅读基础概念文档
   ↓
2. 了解浏览器兼容性处理
   ↓
3. 根据需要深入工具文档
```

### 路径 2：工具升级

```
1. 阅读基础概念（了解背景）
   ↓
2. RFC 15: WPM2（了解第一次升级）
   ↓
3. RFC 20: WPM3（了解 Monorepo 支持）
   ↓
4. 实践指南（部署到生产）
```

### 路径 3：快速实践

```
1. 基础概念（了解原理）
   ↓
2. 浏览器兼容性处理（立即可用）
   ↓
3. 根据项目类型选择工具文档
```

---

## 🔑 关键概念

### Import Map

**定义**：浏览器中的模块版本管理标准

**核心价值**：
- ✅ 支持裸模块导入（Bare Module Imports）
- ✅ 浏览器原生运行时模块解析
- ✅ 跨应用/跨版本共享依赖
- ✅ 无构建更新

### ESM CDN

**定义**：以 npm 作为托管中心、原生 ES Module 格式的 CDN 服务

**核心服务**：
- 📦 **esm.dancf.com**：稿定自建 CDN
- 🌐 **ga.jspm.io**：JSPM 公共 CDN

**URL 格式**：

```
https://esm.dancf.com/npm:package@version/file
```

### WPM 系列工具

**演进路径**：

| 工具 | 核心能力 | 适用场景 |
|------|---------|---------|
| **WPM v1** | 基础 Import Map 生成 | 简单项目 |
| **WPM2** | 子路径 + 版本一致性 | npm 包项目 |
| **WPM3** | Workspace + Git 版本 | Monorepo 项目 |

---

## 📊 技术对比

### Import Map vs 传统构建

| 对比项 | 传统构建 | Import Map |
|--------|---------|-----------|
| **缓存策略** | 深度依赖更新导致全部失效 | 依赖独立缓存 |
| **更新方式** | 重新构建整个项目 | 只更新 Import Map |
| **跨应用共享** | 不支持 | ✅ 原生支持 |
| **构建时间** | 需要构建 | 无需构建 |
| **包标准** | 较松散 | 严格规范 |

### WPM 工具对比

| 特性 | WPM v1 | WPM2 | WPM3 |
|------|--------|------|------|
| **npm 包** | ✅ | ✅ | ✅ |
| **子路径** | ❌ | ✅ | ✅ |
| **版本一致性** | ⚠️ 易出错 | ✅ 保证 | ✅ 保证 |
| **Workspace** | ❌ | ❌ | ✅ |
| **Git 版本** | ❌ | ❌ | ✅ |
| **CI/CD 集成** | 简单 | 简单 | 完整 |

---

## 🛠️ 快速开始

### 场景 1：简单项目

**使用 WPM2 + Import Map**

1. 安装工具

```bash
npm install -D @growing-web/wpm2
```

2. 配置 package.json

```json
{
  "browserImportMap": {
    "packages": ["react", "vue"],
    "defaultProvider": "dancf"
  },
  "scripts": {
    "postinstall": "wpm2"
  }
}
```

3. 生成 Import Map

```bash
npm install
```

4. 在 HTML 中使用

```html
<script type="importmap" src="/importmap.json"></script>
```

**详细文档**：[02-工具演进-RFC15-WPM2.md](02-工具演进-RFC15-WPM2.md)

### 场景 2：Monorepo 项目

**使用 WPM3 + CI/CD**

1. 配置 package.json

```json
{
  "browserImportMap": {
    "packages": [
      "@company/utils",
      "react"
    ]
  }
}
```

2. 配置 CI/CD 流程

```yaml
- name: Build workspace packages
  run: pnpm build:packages
  
- name: Generate Import Map
  run: pnpm wpm3
```

**详细文档**：[03-工具演进-RFC20-WPM3.md](03-工具演进-RFC20-WPM3.md)

### 场景 3：兼容旧浏览器

**使用 ES Module Shims**

```html
<head>
  <!-- 引入垫片 -->
  <script>
  if (!HTMLScriptElement.supports || !HTMLScriptElement.supports("importmap")) {
    // 垫片代码
  }
  </script>
  
  <!-- Import Map -->
  <script type="importmap">
  {
    "imports": {
      "vue": "https://esm.dancf.com/npm:vue@2.7.13/dist/vue.runtime.esm.js"
    }
  }
  </script>
</head>
```

**详细文档**：[04-实践指南-浏览器兼容性处理.md](04-实践指南-浏览器兼容性处理.md)

---

## 🔗 相关资源

### 官方文档

- [WICG Import Maps Spec](https://github.com/WICG/import-maps)
- [ES Module Shims](https://github.com/guybedford/es-module-shims)
- [JSPM Generator](https://github.com/jspm/generator)

### CDN 服务

- [esm.dancf.com](https://esm.dancf.com) - 稿定 ESM CDN
- [ga.jspm.io](https://ga.jspm.io) - JSPM CDN
- [jsDelivr](https://www.jsdelivr.com/) - 公共 CDN

### 工具资源

- [JSPM Generator Online](https://generator.jspm.io/)
- [Import Map Viewer](https://jspm.org/import-map-viewer)

---

## 📝 文档维护

**维护团队**：前端基建团队  
**整理日期**：2025-01-24  
**文档版本**：v1.0

**更新记录**：
- 2025-01-24：初始版本，整合 4 篇 Import Map 相关文档

---

## 💡 贡献指南

如果你发现文档有误或需要补充：

1. 在 Confluence 原文档提出修改建议
2. 联系前端基建团队更新
3. 定期同步最新版本到本地

---

## ❓ 常见问题

### Q1：应该使用哪个版本的 WPM？

**答案**：

- 非 Monorepo 项目 → **WPM2**
- Monorepo 项目 → **WPM3**

### Q2：Import Map 兼容性如何？

**答案**：

- 现代浏览器（Chrome 89+）原生支持
- 旧版浏览器使用 ES Module Shims 垫片
- 参考：[浏览器兼容性处理](04-实践指南-浏览器兼容性处理.md)

### Q3：如何处理包的子路径？

**答案**：

WPM2+ 原生支持，在 `packages` 中直接指定：

```json
{
  "browserImportMap": {
    "packages": [
      "lit",
      "lit/decorators.js",  // 子路径
      "lit/html.js"
    ]
  }
}
```

### Q4：Workspace 包如何使用 Import Map？

**答案**：

使用 WPM3，自动支持 Workspace 包，使用 Git Commit Hash 作为版本。

详见：[RFC 20: WPM3](03-工具演进-RFC20-WPM3.md)

---

**Happy Coding! 🚀**
