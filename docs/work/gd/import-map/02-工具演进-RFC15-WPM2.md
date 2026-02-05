# RFC 15: Importmap 生成工具 WPM2

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=412705023

---

## 文档概述

本 RFC 提出了 **WPM2**（Web Package Manager 2.0）的设计方案，旨在解决 WPM v1 的局限性，提供更强大、更可靠的 Import Map 生成能力。

**核心目标**：
- 🎯 支持包的子路径入口
- 🔒 确保依赖版本一致性
- 🤖 完全自动化的生成流程
- ✅ 开发与生产环境一致

---

## 一、动机

### 1.1 背景

**Import Map** 是浏览器中模块版本管理的标准。

**现有工具**：
- **WPM v1**：我们自研的 Import Map 生成工具
- **esm.dancf.com**：配套的 ESM CDN 服务

**应用场景**：
- ✅ 浏览器端 npm 包加速
- ✅ 跨应用共享依赖

**详细背景**：参见 [importmap & ESM CDN 介绍](01-基础概念-importmap与ESM-CDN介绍.md)

### 1.2 WPM v1 的局限性

#### 问题 1：不支持包的子路径入口

**典型案例：lit 包**

**WPM v1 只能导入默认入口**：

```json
{
  "imports": {
    "lit": "https://esm.dancf.com/npm:lit@2.7.0/index.js"
  }
}
```

**无法支持子路径导出**：

```javascript
// ❌ 无法使用
import { customElement } from 'lit/decorators.js';
import { html } from 'lit/html.js';
```

**影响**：

| 需求 | WPM v1 的做法 | 问题 |
|------|-------------|------|
| **多入口包** | 创建多个独立的包 | ❌ 繁琐 |
| **多语言文件** | 每个语言一个包 | ❌ 需要数十个包 |
| **工具函数库** | 无法按需导入 | ❌ 包体积大 |

**示例场景**：

```
需求：支持 10 种语言的 i18n 包

WPM v1 方案：
- @company/i18n-zh-CN
- @company/i18n-en-US
- @company/i18n-ja-JP
- ... (共 10 个包)

理想方案（子路径）：
- @company/i18n/zh-CN.js
- @company/i18n/en-US.js
- @company/i18n/ja-JP.js
```

#### 问题 2：包的依赖管理容易出错

**问题描述**：

WPM v1 虽然可以引用 `package.json` 的 `dependencies` 来确定版本，但存在以下问题：

| 问题 | 说明 | 影响 |
|------|------|------|
| **覆盖配置影响** | 受仓库级别的 overrides 影响 | ⚠️ 版本不准确 |
| **版本合并策略** | 不一定是实际安装的版本 | ⚠️ 版本不一致 |
| **私有协议不支持** | pnpm 的 `workspace:*` | ❌ 无法识别 |
| **新协议不支持** | pnpm 的 `catalog:` | ❌ 无法识别 |

**示例场景**：

```json
// package.json
{
  "dependencies": {
    "vue": "catalog:default",  // ← WPM v1 无法识别
    "@company/utils": "workspace:*"  // ← WPM v1 无法识别
  }
}
```

**后果**：

```
WPM 配置的版本 ≠ 实际安装的版本
   ↓
开发环境 vs 生产环境版本不同
   ↓
服务端 vs 客户端版本不同
   ↓
可能导致故障！
```

**额外维护成本**：

```json
// 需要手工维护专属配置
{
  "web-module": {
    "dependencies": {
      "vue": "2.7.13",  // ← 手工指定
      "@company/utils": "1.2.0"  // ← 手工指定
    }
  }
}
```

**问题**：
- ❌ 手工维护容易出错
- ❌ 版本同步困难
- ❌ 容易脱节

---

## 二、提议内容

### 2.1 核心提议

> **提议**  
> 重新设计 Import Map 的依赖配置机制和生成流程，确保：
> 1. **版本一致性**：开发→生产、后端→前端的依赖版本完全一致
> 2. **流程自动化**：完全自动化生成，无需人工维护

### 2.2 关键改进

| 改进项 | WPM v1 | WPM2 |
|--------|--------|------|
| **子路径支持** | ❌ 不支持 | ✅ 完整支持 |
| **版本来源** | package.json dependencies | ✅ node_modules 实际安装版本 |
| **workspace 支持** | ❌ 不支持 | ✅ 支持 workspace:* |
| **catalog 支持** | ❌ 不支持 | ✅ 支持 catalog: |
| **自动化程度** | 需要手工配置 | ✅ 完全自动化 |

---

## 三、详细设计

### 3.1 Import Map 标准配置

#### 配置位置

在 `package.json` 中定义需要在浏览器中共享的 Import Map 包。

**使用 `browserImportMap` 字段**：

```json
{
  "name": "my-app",
  "browserImportMap": {
    "packages": ["react", "react-dom", "lit/decorators.js"],
    "defaultProvider": "dancf",
    "providers": {
      "@orgscope": "nodemodules"
    },
    "defaultImportMap": {}
  }
}
```

#### 配置字段说明

##### packages

**类型**：`string[]`

**说明**：生成 Import Map 的包名列表

**支持格式**：

| 格式 | 示例 | 说明 |
|------|------|------|
| **包名** | `"react"` | 包的默认入口 |
| **子路径** | `"lit/decorators.js"` | 包的子路径入口 |
| **Scoped 包** | `"@gaoding/utils"` | Scoped 包 |
| **Scoped + 子路径** | `"@gaoding/utils/date.js"` | Scoped 包的子路径 |

**示例**：

```json
{
  "browserImportMap": {
    "packages": [
      "react",
      "react-dom",
      "lit",
      "lit/decorators.js",
      "lit/html.js",
      "@gaoding/user-device-id",
      "@gaoding/utils/date.js"
    ]
  }
}
```

**关键特性**：
- ✅ **无需指定版本号**：工具会自动查找 node_modules 中的实际安装版本
- ✅ **支持子路径**：解决 WPM v1 的核心限制
- ✅ **自动解析依赖**：递归解析子依赖

##### defaultProvider

**类型**：`string`

**说明**：默认的 CDN 供应商

**可选值**：

| 值 | 说明 |
|----|----|
| `"dancf"` | esm.dancf.com（默认） |
| `"jspm"` | ga.jspm.io |
| `"nodemodules"` | 本地 node_modules |

**示例**：

```json
{
  "browserImportMap": {
    "defaultProvider": "dancf"
  }
}
```

##### providers

**类型**：`Record<string, string>`（可选）

**说明**：自定义供应商映射

**使用场景**：
- ✅ 特定 scope 使用不同的供应商
- ✅ 本地开发使用 node_modules
- ✅ 内部包使用私有 CDN

**示例**：

```json
{
  "browserImportMap": {
    "defaultProvider": "dancf",
    "providers": {
      "@company": "nodemodules",  // 公司内部包使用本地
      "@test": "jspm"              // 测试包使用 JSPM
    }
  }
}
```

**工作原理**：

```
包: @company/utils
   ↓
匹配 providers 规则
   ↓
找到 @company → nodemodules
   ↓
使用本地 node_modules 路径

包: react
   ↓
匹配 providers 规则
   ↓
未找到匹配
   ↓
使用 defaultProvider: dancf
   ↓
使用 esm.dancf.com CDN
```

##### defaultImportMap

**类型**：`ImportMap`（可选）

**说明**：默认的 Import Map 内容，会与生成的 Import Map 合并

**使用场景**：
- ✅ 添加额外的映射
- ✅ 覆盖特定包的 URL
- ✅ 添加自定义的 scopes

**示例**：

```json
{
  "browserImportMap": {
    "packages": ["react"],
    "defaultImportMap": {
      "imports": {
        "utils": "./src/utils/index.js"
      },
      "scopes": {
        "/admin/": {
          "react": "https://custom-cdn.com/react@17.0.2/index.js"
        }
      }
    }
  }
}
```

### 3.2 Import Map 的标准生成流程

#### 生成时机：安装阶段

**设计原则**：Import Map 类似于 lockfile，应在包安装阶段完成。

**配置 postinstall**：

```json
{
  "scripts": {
    "postinstall": "wpm2 --output public/importmap.json"
  }
}
```

**工作流程**：

```
npm install / pnpm install
   ↓
安装依赖到 node_modules
   ↓
触发 postinstall 钩子
   ↓
执行 wpm2
   ├─ 读取 browserImportMap 配置
   ├─ 扫描 node_modules 获取实际版本
   ├─ 生成 Import Map
   └─ 输出 importmap.json
      ↓
提交到 git（类似 package-lock.json）
```

**关键特性**：
- ✅ 自动触发，无需手动执行
- ✅ 开发阶段就生成，便于调试
- ✅ 提交到 git，确保团队一致

#### 版本管理：使用 catalog 协议

**背景**：
- `overrides`：仓库级别覆盖，会影响深层依赖（风险高）
- `catalog:`：包级别控制，不覆盖深层依赖（更安全）

**推荐使用 catalog**：

```json
// pnpm-workspace.yaml
catalogs:
  default:
    vue: ^2.7.0
    react: ^17.0.2
    
// package.json
{
  "dependencies": {
    "vue": "catalog:default",
    "react": "catalog:default"
  }
}
```

**优势**：

| 特性 | overrides | catalog |
|------|-----------|---------|
| **控制粒度** | 全局（包括深层依赖） | 包级别 |
| **安全性** | ⚠️ 可能破坏深层依赖 | ✅ 不影响深层依赖 |
| **可控性** | ⚠️ 全局影响 | ✅ 精确控制 |
| **推荐** | 谨慎使用 | ✅ 优先使用 |

### 3.3 browserImportMap 与 WPM2 的边界

#### 设计理念

**分层设计**：

```
┌─────────────────────────────────────┐
│       browserImportMap              │
│   (标准配置格式，工具无关)            │
└──────────────┬──────────────────────┘
               │ 实现
               ↓
┌─────────────────────────────────────┐
│            WPM2                      │
│  (具体实现工具，支持 esm.dancf.com)   │
└──────────────┬──────────────────────┘
               │ 使用
               ↓
┌─────────────────────────────────────┐
│        JSPM Generator                │
│      (底层生成引擎)                   │
└─────────────────────────────────────┘
```

#### browserImportMap

**定位**：
- ✅ 工具无关的配置格式标准
- ✅ 未来可能被元框架内置支持
- ✅ 其他工具也可以实现

**特点**：
- ✅ 只定义标准格式
- ❌ 不包含具体实现
- ❌ 不支持标准之外的扩展

#### WPM2

**定位**：
- ✅ browserImportMap 的标准实现
- ✅ 默认支持 esm.dancf.com
- ✅ 简单易用的命令行工具

**实现边界**：
- ✅ 实现 browserImportMap 标准
- ✅ 提供合理的默认配置
- ❌ 不支持标准之外的扩展

**高级需求**：
- 如需标准之外的功能，建议直接使用 JSPM Generator API

**示例对比**：

```javascript
// ✅ WPM2 标准用法（推荐）
{
  "browserImportMap": {
    "packages": ["react", "vue"]
  }
}

// ❌ 自定义需求（使用 JSPM Generator）
import { Generator } from '@jspm/generator';

const generator = new Generator({
  // 完全自定义的配置
  customProviders: { ... },
  customResolve: { ... }
});
```

### 3.4 实现方案

#### WPM2 实现

**核心技术**：借助 [JSPM Generator](https://github.com/jspm/generator) 实现

**关键步骤**：

1. **创建 CDN 适配器**

```javascript
import { Generator } from '@jspm/generator';

// 使用 customProviders 创建 esm.dancf.com 适配器
const generator = new Generator({
  defaultProvider: 'dancf',
  customProviders: {
    dancf: {
      pkgToUrl(pkg, subpath) {
        return `https://esm.dancf.com/npm:${pkg.name}@${pkg.version}${subpath}`;
      }
    }
  }
});
```

2. **查找实际安装版本**

```javascript
// 根据项目 node_modules 确定版本号
function getInstalledVersion(packageName) {
  const pkgPath = path.join(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );
  const pkg = require(pkgPath);
  return pkg.version;
}
```

参考：[providers/nodemodules.ts](https://github.com/jspm/generator/blob/main/src/providers/nodemodules.ts)

3. **生成 Import Map**

```javascript
// 读取 browserImportMap 配置
const config = pkg.browserImportMap;

// 安装包到 Import Map
for (const packageName of config.packages) {
  const version = getInstalledVersion(packageName);
  await generator.install(packageName, version);
}

// 生成最终的 Import Map
const importMap = generator.getMap();
```

#### Vite 插件

**职责**：

| 功能 | 说明 |
|------|------|
| **排除外部化包** | 构建时自动排除 Import Map 中的包 |
| **注入 Import Map** | 自动为 HTML 插入 `<script type="importmap">` |
| **开发服务器支持** | 开发环境也使用 Import Map |

**实现示例**：

```javascript
// vite-plugin-import-map.js
export function importMapPlugin() {
  let importMap;
  
  return {
    name: 'vite-plugin-import-map',
    
    // 读取 Import Map
    configResolved(config) {
      importMap = JSON.parse(
        fs.readFileSync('importmap.json', 'utf-8')
      );
    },
    
    // 自动排除外部化包
    config(config) {
      const external = Object.keys(importMap.imports);
      return {
        build: {
          rollupOptions: {
            external
          }
        }
      };
    },
    
    // 注入到 HTML
    transformIndexHtml(html) {
      const importMapScript = `
        <script type="importmap">
          ${JSON.stringify(importMap, null, 2)}
        </script>
      `;
      return html.replace('</head>', `${importMapScript}</head>`);
    }
  };
}
```

---

## 四、使用示例

### 4.1 基础使用

**1. 安装 WPM2**

```bash
npm install -D @growing-web/wpm2
```

**2. 配置 package.json**

```json
{
  "name": "my-app",
  "browserImportMap": {
    "packages": [
      "react",
      "react-dom",
      "vue"
    ],
    "defaultProvider": "dancf"
  },
  "scripts": {
    "postinstall": "wpm2"
  }
}
```

**3. 安装依赖**

```bash
npm install
```

**4. 生成的 importmap.json**

```json
{
  "imports": {
    "react": "https://esm.dancf.com/npm:react@17.0.2/index.js",
    "react-dom": "https://esm.dancf.com/npm:react-dom@17.0.2/index.js",
    "vue": "https://esm.dancf.com/npm:vue@2.7.13/dist/vue.runtime.esm.js"
  },
  "scopes": {
    "https://esm.dancf.com/": {
      "object-assign": "https://esm.dancf.com/npm:object-assign@4.1.1/index.js",
      "@vue/runtime-core": "https://esm.dancf.com/npm:@vue/runtime-core@2.7.13/index.js"
    }
  }
}
```

### 4.2 子路径支持

**配置**：

```json
{
  "browserImportMap": {
    "packages": [
      "lit",
      "lit/decorators.js",
      "lit/html.js",
      "lit/directives/class-map.js"
    ]
  }
}
```

**生成的 Import Map**：

```json
{
  "imports": {
    "lit": "https://esm.dancf.com/npm:lit@2.7.0/index.js",
    "lit/decorators.js": "https://esm.dancf.com/npm:lit@2.7.0/decorators.js",
    "lit/html.js": "https://esm.dancf.com/npm:lit@2.7.0/html.js",
    "lit/directives/class-map.js": "https://esm.dancf.com/npm:lit@2.7.0/directives/class-map.js"
  }
}
```

**使用**：

```javascript
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit/html.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property() name = 'World';
  
  render() {
    return html`<div>Hello ${this.name}!</div>`;
  }
}
```

### 4.3 混合供应商

**配置**：

```json
{
  "browserImportMap": {
    "packages": [
      "react",
      "@company/utils",
      "@company/components"
    ],
    "defaultProvider": "dancf",
    "providers": {
      "@company": "nodemodules"
    }
  }
}
```

**生成的 Import Map**：

```json
{
  "imports": {
    "react": "https://esm.dancf.com/npm:react@17.0.2/index.js",
    "@company/utils": "/node_modules/@company/utils/dist/index.js",
    "@company/components": "/node_modules/@company/components/dist/index.js"
  }
}
```

**应用场景**：
- ✅ 开发环境：内部包使用本地，热更新更快
- ✅ 生产环境：内部包使用 CDN
- ✅ 混合部署：灵活配置

---

## 五、业务升级计划

### 5.1 升级步骤

**阶段 1：试点项目**
- [ ] 选择 1-2 个项目试点
- [ ] 安装 WPM2
- [ ] 配置 browserImportMap
- [ ] 验证功能和性能

**阶段 2：逐步推广**
- [ ] 总结试点经验
- [ ] 编写升级文档
- [ ] 逐步推广到其他项目

**阶段 3：全面迁移**
- [ ] 所有项目迁移到 WPM2
- [ ] 下线 WPM v1

### 5.2 兼容性考虑

**WPM v1 → WPM2 升级**：

| 项目 | 兼容性 | 说明 |
|------|--------|------|
| **配置格式** | ❌ 不兼容 | 需要迁移到 browserImportMap |
| **生成结果** | ✅ 兼容 | Import Map 格式相同 |
| **使用方式** | ✅ 兼容 | HTML 中的使用方式相同 |

**迁移成本**：
- 🟢 低：只需修改配置文件
- 🟢 自动：版本信息自动获取
- 🟢 透明：业务代码无需改动

---

## 六、总结

### 6.1 核心改进

**WPM2 解决的问题**：

| 问题 | WPM v1 | WPM2 | 改进 |
|------|--------|------|------|
| **子路径支持** | ❌ | ✅ | 🎯 核心特性 |
| **版本一致性** | ⚠️ 易出错 | ✅ 保证一致 | 🔒 关键改进 |
| **自动化程度** | ⚠️ 需手工维护 | ✅ 完全自动 | 🤖 效率提升 |
| **workspace 支持** | ❌ | ✅ | 📦 现代化 |
| **catalog 支持** | ❌ | ✅ | 📦 现代化 |

### 6.2 关键价值

**技术价值**：
- ✅ 支持现代包管理特性
- ✅ 完全自动化的工作流
- ✅ 确保版本一致性
- ✅ 降低维护成本

**业务价值**：
- ✅ 减少故障风险
- ✅ 提升开发效率
- ✅ 改善部署流程
- ✅ 支持更灵活的包组织

### 6.3 未来展望

**短期目标**：
- 🎯 完成 WPM2 实现
- 🎯 在试点项目验证
- 🎯 编写完整文档

**长期目标**：
- 🔮 集成到元框架
- 🔮 支持更多 CDN 供应商
- 🔮 提供可视化配置工具

---

## 七、参考资源

### 7.1 相关文档

- [Import Map 与 ESM CDN 介绍](01-基础概念-importmap与ESM-CDN介绍.md)
- [RFC 20: WPM3](03-工具演进-RFC20-WPM3.md)

### 7.2 技术资源

- [JSPM Generator](https://github.com/jspm/generator)
- [Import Maps Spec](https://github.com/WICG/import-maps)
- [pnpm Catalogs](https://pnpm.io/catalogs)

---

**文档维护**：前端基建团队  
**RFC 作者**：[作者名]  
**整理日期**：2025-01-24  
**文档版本**：v1.0
