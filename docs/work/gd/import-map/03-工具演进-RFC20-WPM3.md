# RFC 20: Importmap 生成工具 WPM3

> **文档来源**  
> Confluence: https://doc.huanleguang.com/pages/viewpage.action?pageId=485591899

---

## 文档概述

本 RFC 提出了 **WPM3** 的设计方案，在 WPM2 的基础上进一步扩展，支持 **Monorepo Workspace 包**的 Import Map 生成。

**核心目标**：
- 📦 支持 Workspace 包管理机制
- 🔗 支持 Workspace 与 npm 包的混合使用
- 🔄 使用 Git Commit Hash 作为 Workspace 包版本
- 🤖 完整的 CI/CD 集成方案

---

## 一、背景

### 1.1 现状

**WPM2 的能力**：
- ✅ 支持 npm 包的 Import Map 生成
- ✅ 基于 npm 版本信息生成
- ✅ 自动化的依赖解析

**详细说明**：参见 [RFC 15: WPM2](02-工具演进-RFC15-WPM2.md)

### 1.2 新的挑战

#### Monorepo 架构升级

**背景**：
- 工程体系升级至 **Monorepo 架构**
- 引入 **Workspace 包管理机制**

**Workspace 特点**：

```
monorepo/
├── packages/
│   ├── utils/          ← workspace 包
│   ├── components/     ← workspace 包
│   └── hooks/          ← workspace 包
└── apps/
    └── web/            ← 使用 workspace 包
```

**依赖方式对比**：

| 类型 | npm 包 | Workspace 包 |
|------|--------|-------------|
| **安装方式** | 从 npm registry 安装 | 源码直接引用 |
| **版本信息** | package.json version | ❌ 无传统版本 |
| **引用方式** | 固定版本号 | workspace:* 协议 |
| **构建产物** | 已发布到 npm | 本地源码 |

#### WPM2 的局限

**问题**：WPM2 依赖明确的 npm 版本信息

```json
// WPM2 的工作前提
{
  "dependencies": {
    "react": "17.0.2",  // ✅ 有明确版本
    "@company/utils": "workspace:*"  // ❌ 无传统版本
  }
}
```

**现象**：

```
WPM2 尝试生成 @company/utils 的 Import Map
   ↓
查找版本信息
   ↓
workspace:* 无法转换为具体版本
   ↓
无法生成 Import Map ❌
```

**结论**：
- ❌ Workspace 包缺乏传统意义上的版本信息
- ❌ 当前工程环境下无法直接使用 WPM2

---

## 二、提议内容

### 2.1 核心提议

> **提议**  
> 1. 增加对 Workspace 包管理机制的 Import Map 生成支持
> 2. 支持将 Workspace 生成的 Import Map 与基于 npm 版本的 Import Map 合并

### 2.2 关键能力

| 能力 | WPM2 | WPM3 |
|------|------|------|
| **npm 包** | ✅ 支持 | ✅ 支持 |
| **Workspace 包** | ❌ 不支持 | ✅ 支持 |
| **混合使用** | ❌ 不支持 | ✅ 支持 |
| **版本机制** | npm 版本号 | ✅ Git Commit Hash |

---

## 三、前提概要

### 3.1 WPM2 的 Import Map 生成原理

**核心流程**：

```
1. 读取配置
   ↓
2. 获取本地 node_modules 的版本号
   ↓
3. 通过版本号生成 CDN 地址
   ↓
4. 下载 CDN 资源并解析依赖
   ↓
5. 递归处理子依赖
   ↓
6. 生成 Import Map
```

**详细示例**：以 `@gaoding/user-device-id` 为例

#### 步骤 1：获取本地版本

```bash
# node_modules/@gaoding/user-device-id/package.json
{
  "name": "@gaoding/user-device-id",
  "version": "0.5.1"
}
```

**结果**：版本号 `0.5.1`

#### 步骤 2：生成 CDN 地址

```
https://esm.dancf.com/npm:@gaoding/user-device-id@0.5.1/dist/index.js
```

#### 步骤 3：解析源码依赖

```javascript
// 下载并解析源码
import Cookies from 'js-cookie';  // ← 发现依赖
```

#### 步骤 4：获取子依赖版本

```json
// https://esm.dancf.com/npm:@gaoding/user-device-id@0.5.1/package.json
{
  "dependencies": {
    "js-cookie": "^3.0.1"  // ← 版本信息
  }
}
```

#### 步骤 5：检查 overrides

```json
// 项目 package.json
{
  "overrides": {
    "js-cookie": "3.0.5"  // ← 覆盖版本
  }
}
```

**结果**：使用 `3.0.5` 而非 `^3.0.1`

#### 步骤 6：递归处理

```
js-cookie@3.0.5
   ↓
下载对应版本的 CDN 资源
   ↓
解析其源码依赖
   ↓
如果无子依赖，结束
```

#### 步骤 7：生成 Import Map

```json
{
  "imports": {
    "@gaoding/user-device-id": "https://esm.dancf.com/npm:@gaoding/user-device-id@0.5.1/dist/index.js"
  },
  "scopes": {
    "https://esm.dancf.com/": {
      "js-cookie": "https://esm.dancf.com/npm:js-cookie@3.0.5/index.js"
    }
  }
}
```

### 3.2 关键技术点

**技术栈**：
- **JSPM Generator**：底层 Import Map 生成引擎
- **customProviders**：自定义 CDN 适配器
- **依赖解析**：递归解析依赖树
- **版本管理**：overrides/catalog 支持

---

## 四、详细设计

### 4.1 版本机制调整

#### 问题

**Workspace 包没有传统版本号**：

```json
{
  "name": "@company/utils",
  "version": "0.0.0",  // ← 无意义的占位版本
  "dependencies": {
    "@company/hooks": "workspace:*"  // ← 无具体版本
  }
}
```

#### 解决方案：Git Commit Hash 作为版本

**设计**：

| 要素 | 传统 npm 包 | Workspace 包 |
|------|------------|-------------|
| **版本标识** | npm 版本号 | Git Commit Hash |
| **版本来源** | package.json | Git 仓库 |
| **版本格式** | semver (1.2.3) | hash (abc1234) |
| **变更检测** | 版本号更新 | 源码变更 |

**示例**：

```bash
# 获取 Workspace 包的版本
cd packages/utils
git log -1 --format=%H  # abc1234567890...

# 使用 Commit Hash 作为版本
version = "abc1234"
```

**URL 映射**：

```
npm 包:
https://esm.dancf.com/npm:@company/utils@1.2.3/dist/index.js

Workspace 包:
https://esm.dancf.com/workspace:@company/utils@abc1234/dist/index.js
```

#### 版本更新检测

**检测逻辑**：

```
检查 Workspace 包目录
   ↓
获取当前最新 Commit Hash
   ↓
与上次构建的 Hash 对比
   ├─ 相同 → 无变更，跳过
   └─ 不同 → 有变更，需要构建
```

**应用场景**：

```
场景 1：修改源码
packages/utils/src/date.js 改动
   ↓
新的 Commit: def5678
   ↓
视为新版本，触发构建

场景 2：无改动
packages/utils/ 目录无变更
   ↓
Commit Hash 与上次相同
   ↓
跳过构建，使用缓存
```

### 4.2 构建与产物上传

#### CI/CD 流程

**整体流程**：

```
代码提交
   ↓
CI/CD 触发
   ↓
检测变更的 Workspace 包
   ↓
对每个变更的包：
   ├─ 获取 Commit Hash
   ├─ 构建包
   ├─ 上传产物到 CDN
   └─ 上传 package.json 到 CDN
      ↓
完成
```

**详细步骤**：

#### 步骤 1：检测变更

```bash
# 获取变更的 Workspace 包
pnpm --filter="[HEAD^]" list --depth -1 --json

# 输出示例
[
  {
    "name": "@company/utils",
    "path": "/workspace/packages/utils",
    "private": false
  }
]
```

#### 步骤 2：获取版本 Hash

```bash
# 获取包目录的最新 Commit
cd packages/utils
COMMIT_HASH=$(git log -1 --format=%H .)
SHORT_HASH=${COMMIT_HASH:0:8}

echo "Version: $SHORT_HASH"
# Output: Version: abc12345
```

#### 步骤 3：构建包

```bash
# 进入包目录
cd packages/utils

# 安装依赖
pnpm install

# 构建
pnpm build

# 产物目录
ls dist/
# index.js
# date.js
# string.js
```

#### 步骤 4：上传到 CDN

**上传产物**：

```bash
# 上传整个 dist 目录
aws s3 sync ./dist/ \
  s3://esm-cdn/workspace/@company/utils@abc12345/dist/

# 生成的 URL
# https://esm.dancf.com/workspace:@company/utils@abc12345/dist/index.js
# https://esm.dancf.com/workspace:@company/utils@abc12345/dist/date.js
```

**上传 package.json**：

```bash
# 上传 package.json
aws s3 cp ./package.json \
  s3://esm-cdn/workspace/@company/utils@abc12345/package.json

# 生成的 URL
# https://esm.dancf.com/workspace:@company/utils@abc12345/package.json
```

**CDN 目录结构**：

```
esm.dancf.com/
├── npm:react@17.0.2/           ← npm 包
│   ├── index.js
│   └── package.json
└── workspace:@company/utils@abc12345/  ← workspace 包
    ├── dist/
    │   ├── index.js
    │   ├── date.js
    │   └── string.js
    └── package.json
```

#### 步骤 5：缓存策略

**版本化 URL 的缓存**：

```
Cache-Control: public, max-age=31536000, immutable
```

**特点**：
- ✅ 永久缓存（1 年）
- ✅ Commit Hash 唯一
- ✅ 新提交 = 新 Hash = 新 URL

### 4.3 Import Map 生成机制调整

#### 生成时机调整

**WPM2 的时机**：

```
npm install
   ↓
触发 postinstall
   ↓
生成 Import Map
```

**WPM3 的时机**：

```
构建 Workspace 包
   ↓
上传产物到 CDN
   ↓
所有 Workspace 包构建完成
   ↓
生成 Import Map
```

**原因**：
- ⚠️ 必须等待 Workspace 包构建完成
- ⚠️ 必须等待产物上传到 CDN
- ✅ 确保 CDN 上有对应的资源

#### 生成逻辑

**处理逻辑**：

```
读取 browserImportMap 配置
   ↓
对每个包：
   ├─ npm 包 → 使用 WPM2 逻辑
   │   ├─ 获取 node_modules 版本
   │   └─ 生成 CDN URL
   │
   └─ Workspace 包 → 使用 WPM3 逻辑
       ├─ 获取 Commit Hash
       └─ 生成 workspace CDN URL
          ↓
合并两类 Import Map
   ↓
输出最终 importmap.json
```

**代码示例**：

```javascript
async function generateImportMap(config) {
  const importMap = { imports: {}, scopes: {} };
  
  for (const pkg of config.packages) {
    if (isWorkspacePackage(pkg)) {
      // Workspace 包
      const hash = await getCommitHash(pkg);
      const url = `https://esm.dancf.com/workspace:${pkg}@${hash}/dist/index.js`;
      importMap.imports[pkg] = url;
    } else {
      // npm 包
      const version = getInstalledVersion(pkg);
      const url = `https://esm.dancf.com/npm:${pkg}@${version}/index.js`;
      importMap.imports[pkg] = url;
    }
  }
  
  return importMap;
}
```

#### 依赖解析

**Workspace 包的依赖解析**：

```
Workspace 包: @company/utils@abc1234
   ↓
下载 CDN 上的 package.json
   ↓
https://esm.dancf.com/workspace:@company/utils@abc1234/package.json
   ↓
解析 dependencies
   ├─ Workspace 依赖 → 继续递归
   └─ npm 依赖 → 走 WPM2 逻辑
      ↓
添加到 scopes
```

**示例**：

```json
// @company/utils@abc1234/package.json
{
  "dependencies": {
    "@company/hooks": "workspace:*",  // ← Workspace 依赖
    "lodash": "^4.17.21"              // ← npm 依赖
  }
}
```

**生成的 Import Map**：

```json
{
  "imports": {
    "@company/utils": "https://esm.dancf.com/workspace:@company/utils@abc1234/dist/index.js"
  },
  "scopes": {
    "https://esm.dancf.com/": {
      "@company/hooks": "https://esm.dancf.com/workspace:@company/hooks@def5678/dist/index.js",
      "lodash": "https://esm.dancf.com/npm:lodash@4.17.21/lodash.js"
    }
  }
}
```

### 4.4 方案流程图

**完整流程**：

![Workspace Import Map 流程](../RFC%2020%20%20Importmap%20生成工具%20WPM3/attachments/importmap-workspace.png)

**WPM2 Import Map 生成流程**：

![WPM2 流程](../RFC%2020%20%20Importmap%20生成工具%20WPM3/attachments/wpm2%20importmap%20生成.png)

---

## 五、CI/CD 集成

### 5.1 完整 CI/CD 工作流

#### Pipeline 结构

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  # Job 1: 检测变更
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.packages }}
    steps:
      - uses: actions/checkout@v3
      - name: Detect changed packages
        id: filter
        run: |
          PACKAGES=$(pnpm --filter="[HEAD^]" list --depth -1 --json)
          echo "packages=$PACKAGES" >> $GITHUB_OUTPUT

  # Job 2: 构建 Workspace 包
  build-workspace-packages:
    needs: detect-changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: ${{ fromJSON(needs.detect-changes.outputs.packages) }}
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Get commit hash
        id: hash
        run: |
          cd ${{ matrix.package.path }}
          HASH=$(git log -1 --format=%h .)
          echo "hash=$HASH" >> $GITHUB_OUTPUT
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build package
        run: |
          cd ${{ matrix.package.path }}
          pnpm build
      
      - name: Upload to CDN
        run: |
          aws s3 sync ${{ matrix.package.path }}/dist/ \
            s3://esm-cdn/workspace:${{ matrix.package.name }}@${{ steps.hash.outputs.hash }}/dist/
          
          aws s3 cp ${{ matrix.package.path }}/package.json \
            s3://esm-cdn/workspace:${{ matrix.package.name }}@${{ steps.hash.outputs.hash }}/package.json

  # Job 3: 生成 Import Map
  generate-importmap:
    needs: build-workspace-packages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Generate Import Map
        run: pnpm wpm3 --output public/importmap.json
      
      - name: Upload Import Map
        run: |
          aws s3 cp public/importmap.json \
            s3://cdn-bucket/importmap.json

  # Job 4: 构建应用
  build-app:
    needs: generate-importmap
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download Import Map
        run: |
          mkdir -p public
          aws s3 cp s3://cdn-bucket/importmap.json public/
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy
        run: pnpm deploy
```

### 5.2 关键步骤说明

#### 步骤 1：检测变更

```bash
# 使用 pnpm 的变更检测
pnpm --filter="[HEAD^]" list --depth -1 --json

# 输出包含变更的包列表
```

**优势**：
- ✅ 只构建变更的包
- ✅ 节省 CI 时间
- ✅ 减少不必要的构建

#### 步骤 2：并行构建

```yaml
strategy:
  matrix:
    package: ${{ fromJSON(needs.detect-changes.outputs.packages) }}
```

**优势**：
- ✅ 多个包并行构建
- ✅ 大幅缩短总时间

#### 步骤 3：上传顺序

```
1. 上传 dist/ 产物
2. 上传 package.json

顺序很重要！
```

**原因**：
- ⚠️ package.json 存在 = 版本可用
- ⚠️ 必须确保产物已上传

### 5.3 本地开发流程

#### 开发模式

**使用本地 Workspace 包**：

```json
{
  "browserImportMap": {
    "packages": [
      "@company/utils",
      "@company/hooks"
    ],
    "defaultProvider": "dancf",
    "providers": {
      "@company": "nodemodules"  // ← 本地开发使用 node_modules
    }
  }
}
```

**生成的 Import Map（开发环境）**：

```json
{
  "imports": {
    "@company/utils": "/node_modules/@company/utils/dist/index.js",
    "@company/hooks": "/node_modules/@company/hooks/dist/index.js"
  }
}
```

**优势**：
- ✅ 无需构建上传
- ✅ 热更新更快
- ✅ 调试方便

#### 生产模式

**使用 CDN**：

```json
{
  "browserImportMap": {
    "packages": [
      "@company/utils",
      "@company/hooks"
    ],
    "defaultProvider": "dancf"
    // 不指定 providers，使用 CDN
  }
}
```

**生成的 Import Map（生产环境）**：

```json
{
  "imports": {
    "@company/utils": "https://esm.dancf.com/workspace:@company/utils@abc1234/dist/index.js",
    "@company/hooks": "https://esm.dancf.com/workspace:@company/hooks@def5678/dist/index.js"
  }
}
```

---

## 六、使用示例

### 6.1 基础配置

**项目结构**：

```
monorepo/
├── packages/
│   ├── utils/
│   │   ├── src/
│   │   ├── dist/
│   │   └── package.json
│   └── hooks/
│       ├── src/
│       ├── dist/
│       └── package.json
├── apps/
│   └── web/
│       ├── src/
│       └── package.json
└── pnpm-workspace.yaml
```

**apps/web/package.json**：

```json
{
  "name": "web",
  "dependencies": {
    "@company/utils": "workspace:*",
    "@company/hooks": "workspace:*",
    "react": "^17.0.2",
    "vue": "^2.7.0"
  },
  "browserImportMap": {
    "packages": [
      "@company/utils",
      "@company/hooks",
      "react",
      "vue"
    ]
  },
  "scripts": {
    "build:importmap": "wpm3 --output public/importmap.json"
  }
}
```

### 6.2 生成 Import Map

**执行**：

```bash
cd apps/web
pnpm build:importmap
```

**生成的 importmap.json**：

```json
{
  "imports": {
    "@company/utils": "https://esm.dancf.com/workspace:@company/utils@abc1234/dist/index.js",
    "@company/hooks": "https://esm.dancf.com/workspace:@company/hooks@def5678/dist/index.js",
    "react": "https://esm.dancf.com/npm:react@17.0.2/index.js",
    "vue": "https://esm.dancf.com/npm:vue@2.7.13/dist/vue.runtime.esm.js"
  },
  "scopes": {
    "https://esm.dancf.com/": {
      "lodash": "https://esm.dancf.com/npm:lodash@4.17.21/lodash.js",
      "object-assign": "https://esm.dancf.com/npm:object-assign@4.1.1/index.js"
    }
  }
}
```

### 6.3 在应用中使用

**HTML**：

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap" src="/importmap.json"></script>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    // 直接使用裸模块导入
    import { formatDate } from '@company/utils';
    import { useAsync } from '@company/hooks';
    import React from 'react';
    import { createApp } from 'vue';
    
    console.log(formatDate(new Date()));
  </script>
</body>
</html>
```

---

## 七、总结

### 7.1 核心价值

**WPM3 的关键能力**：

| 能力 | 说明 | 价值 |
|------|------|------|
| **Workspace 支持** | 支持 Monorepo 内部包 | 🎯 核心特性 |
| **混合使用** | npm + Workspace 混合 | 🔗 灵活性 |
| **Git 版本** | 使用 Commit Hash | 🔄 版本追溯 |
| **CI/CD 集成** | 完整的自动化流程 | 🤖 效率提升 |

### 7.2 与 WPM2 的对比

| 特性 | WPM2 | WPM3 |
|------|------|------|
| **npm 包** | ✅ | ✅ |
| **子路径** | ✅ | ✅ |
| **Workspace 包** | ❌ | ✅ |
| **版本机制** | npm 版本 | npm + Git Hash |
| **生成时机** | 安装后 | 构建后 |
| **CI/CD** | 简单 | 复杂但完整 |

### 7.3 适用场景

**使用 WPM2 的场景**：
- ✅ 非 Monorepo 项目
- ✅ 只使用 npm 包
- ✅ 简单的依赖关系

**使用 WPM3 的场景**：
- ✅ Monorepo 架构
- ✅ 使用 Workspace 包
- ✅ 需要内部包共享
- ✅ 复杂的依赖关系

### 7.4 未来展望

**短期目标**：
- 🎯 完成 WPM3 实现
- 🎯 在 Monorepo 项目试点
- 🎯 优化 CI/CD 流程

**长期目标**：
- 🔮 支持更多版本策略
- 🔮 提供可视化管理工具
- 🔮 与元框架深度集成

---

## 八、参考资源

### 8.1 相关文档

- [Import Map 与 ESM CDN 介绍](01-基础概念-importmap与ESM-CDN介绍.md)
- [RFC 15: WPM2](02-工具演进-RFC15-WPM2.md)
- [RFC 17: Monorepo CI/CD 工作流设计](../RFC%2017%20%20Monorepo%20包和应用%20CI%20CD%20工作流设计/page.md)

### 8.2 技术资源

- [JSPM Generator](https://github.com/jspm/generator)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Import Maps Spec](https://github.com/WICG/import-maps)

---

**文档维护**：前端基建团队  
**RFC 作者**：[作者名]  
**整理日期**：2025-01-24  
**文档版本**：v1.0
