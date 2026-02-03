# Package Exports 最佳实践

> **目标读者**：包开发者、库作者  
> **难度等级**：⭐⭐⭐ 高级  
> **参考资料**：本文档参考了 [webpack 官方指南](https://webpack.js.org/guides/package-exports)、[Node.js 官方文档](https://nodejs.org/api/packages.html#exports)

---

## 什么是 Package Exports？

`exports` 是 `package.json` 中的一个字段,由 Node.js 在 v12.7.0 引入，用于**精确控制包的导出接口**。它是现代 npm 包的标准特性，被 Node.js、Webpack 5+、Vite、Rollup 等工具广泛支持。

---

## 为什么需要 Exports？

### 传统方式的问题

在 `exports` 出现之前，包的导出主要依赖 `main`、`module`、`types` 字段：

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts"
}
```

**存在的问题**：
1. **无法控制导出**：使用者可以导入包内任意文件
   ```javascript
   // 可以绕过 main 直接导入内部文件
   import util from '@gaoding/package/dist/internal/util.js'
   ```

2. **条件导出困难**：无法根据环境（ESM/CJS、开发/生产）提供不同的入口

3. **子路径导出复杂**：需要配合复杂的文件结构

4. **类型声明不统一**：TypeScript 需要单独的 `types` 字段

---

### Exports 的优势

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  }
}
```

**解决的问题**：
1. **封装性**：只有显式导出的路径才能被导入
2. **条件导出**：根据 `import` / `require` 自动选择入口
3. **清晰的子路径**：`@gaoding/package/utils` 这样的导入路径
4. **类型优先**：TypeScript 直接识别 `types` 条件

---

## 基础用法

### 主入口导出

最简单的配置，只导出包的主入口：

```json
{
  "name": "@gaoding/utils",
  "exports": "./dist/index.js"
}
```

**使用方式**：
```javascript
import utils from '@gaoding/utils'
```

---

### 条件导出（ESM + CJS）

同时支持 ES Module 和 CommonJS：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**使用方式**：
```javascript
// ESM 环境：自动使用 index.js
import utils from '@gaoding/utils'

// CJS 环境：自动使用 index.cjs
const utils = require('@gaoding/utils')
```

---

### 包含类型声明

TypeScript 用户需要类型声明文件：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**重要**：`types` 必须放在**最前面**，这样 TypeScript 才能正确识别。

---

## 高级用法

### 子路径导出

允许导入包的子模块：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./button": {
      "types": "./dist/button.d.ts",
      "import": "./dist/button.js",
      "require": "./dist/button.cjs"
    },
    "./input": {
      "types": "./dist/input.d.ts",
      "import": "./dist/input.js",
      "require": "./dist/input.cjs"
    }
  }
}
```

**使用方式**：
```javascript
// 导入主入口
import { Button, Input } from '@gaoding/ui-components'

// 按需导入子模块（更好的 Tree-shaking）
import Button from '@gaoding/ui-components/button'
import Input from '@gaoding/ui-components/input'
```

**优势**：
- 减少打包体积（只打包使用的组件）
- 更清晰的 API 结构
- 更好的代码分割

---

### 通配符导出

使用通配符支持所有子路径：

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "import": "./dist/components/*.js",
      "require": "./dist/components/*.cjs"
    }
  }
}
```

**使用方式**：
```javascript
import Button from '@gaoding/ui/components/button'
import Modal from '@gaoding/ui/components/modal'
```

**注意**：通配符会暴露整个目录，使用时需谨慎。

---

### 开发 vs 生产环境

根据环境提供不同的构建产物：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "development": {
        "import": "./dist/index.development.js",
        "require": "./dist/index.development.cjs"
      },
      "production": {
        "import": "./dist/index.production.js",
        "require": "./dist/index.production.cjs"
      },
      "default": "./dist/index.js"
    }
  }
}
```

**说明**：
- **development**：包含完整的错误提示、警告、调试信息
- **production**：移除调试代码、压缩、优化性能
- **default**：回退选项（必需）

**使用场景**：React、Vue 等框架常用此策略。

---

### Node.js vs Browser 环境

为不同运行环境提供不同实现：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "node": {
        "import": "./dist/index.node.js",
        "require": "./dist/index.node.cjs"
      },
      "browser": {
        "import": "./dist/index.browser.js",
        "require": "./dist/index.browser.cjs"
      },
      "default": "./dist/index.js"
    }
  }
}
```

**使用场景**：
- **Node.js**：使用 `fs`、`path` 等 Node.js 模块
- **Browser**：使用 Web API（`fetch`、`localStorage`）

---

### 条件优先级

当多个条件都匹配时，**从上到下**选择第一个匹配的：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",        // 1. TypeScript
      "development": "./dist/index.dev.js", // 2. 开发环境
      "production": "./dist/index.prod.js", // 3. 生产环境
      "import": "./dist/index.js",          // 4. ESM
      "require": "./dist/index.cjs",        // 5. CJS
      "default": "./dist/index.js"          // 6. 默认
    }
  }
}
```

**匹配顺序**（Node.js / 现代打包工具）：
1. `types`（TypeScript）
2. `development` / `production`（环境）
3. `node` / `browser`（平台）
4. `import` / `require`（模块系统）
5. `default`（默认回退）

---

## 实战案例

### 案例 1：工具库

**需求**：一个纯 JavaScript 工具库，支持 ESM 和 CJS。

**package.json**：
```json
{
  "name": "@gaoding/utils",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"]
}
```

**构建配置（tsup）**：
```javascript
// tsup.config.ts
export default {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true
}
```

---

### 案例 2：React 组件库

**需求**：React 组件库，支持按需导入，减少打包体积。

**package.json**：
```json
{
  "name": "@gaoding/ui-components",
  "version": "2.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./button": {
      "types": "./dist/button.d.ts",
      "import": "./dist/button.js",
      "require": "./dist/button.cjs"
    },
    "./input": {
      "types": "./dist/input.d.ts",
      "import": "./dist/input.js",
      "require": "./dist/input.cjs"
    },
    "./modal": {
      "types": "./dist/modal.d.ts",
      "import": "./dist/modal.js",
      "require": "./dist/modal.cjs"
    }
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "files": ["dist"]
}
```

**构建配置（tsup）**：
```javascript
// tsup.config.ts
export default {
  entry: {
    index: 'src/index.ts',
    button: 'src/button.tsx',
    input: 'src/input.tsx',
    modal: 'src/modal.tsx'
  },
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  clean: true
}
```

**使用方式**：
```javascript
// 方式 1：全量导入（打包所有组件）
import { Button, Input, Modal } from '@gaoding/ui-components'

// 方式 2：按需导入（只打包 Button）
import Button from '@gaoding/ui-components/button'
```

---

### 案例 3：多平台库

**需求**：同时支持 Node.js 和浏览器，提供不同实现。

**package.json**：
```json
{
  "name": "@gaoding/http-client",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "node": {
        "import": "./dist/index.node.js",
        "require": "./dist/index.node.cjs"
      },
      "browser": {
        "import": "./dist/index.browser.js",
        "require": "./dist/index.browser.cjs"
      },
      "default": "./dist/index.browser.js"
    }
  },
  "files": ["dist"]
}
```

**实现**：
```typescript
// src/index.node.ts（Node.js 实现）
import http from 'node:http'
import https from 'node:https'

export async function fetch(url: string) {
  // 使用 Node.js 的 http/https 模块
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, resolve).on('error', reject)
  })
}
```

```typescript
// src/index.browser.ts（浏览器实现）
export async function fetch(url: string) {
  // 使用浏览器的 fetch API
  return window.fetch(url)
}
```

---

## 与其他字段的关系

### Exports 优先级

当 `exports` 存在时，它的优先级**高于** `main`、`module`、`types`：

```json
{
  "main": "./index.cjs",      // ❌ 被 exports 覆盖
  "module": "./index.esm.js", // ❌ 被 exports 覆盖
  "types": "./index.d.ts",    // ❌ 被 exports 覆盖
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**建议**：为了兼容旧版工具，仍应保留 `main`、`module`、`types` 字段。

---

### 与 TypeScript 的配合

TypeScript 4.7+ 原生支持 `exports` 的 `types` 条件：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js"
    }
  }
}
```

**tsconfig.json**：
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler", // 或 "node16"、"nodenext"
    "resolvePackageJsonExports": true
  }
}
```

---

## 常见错误与解决方案

### 错误 1：类型导出顺序错误

**❌ 错误**：
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"  // types 不在第一位
    }
  }
}
```

**✅ 正确**：
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",  // types 必须在第一位
      "import": "./dist/index.js"
    }
  }
}
```

---

### 错误 2：缺少 default 回退

**❌ 错误**：
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
      // 缺少 default
    }
  }
}
```

**问题**：某些工具可能不支持 `import` / `require` 条件，导致无法导入。

**✅ 正确**：
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"  // 添加 default 回退
    }
  }
}
```

---

### 错误 3：路径不匹配

**❌ 错误**：
```json
{
  "exports": {
    "./button": "./dist/button.js"  // 文件不存在
  }
}
```

**问题**：用户导入时会报错 `Cannot find module '@gaoding/ui/button'`

**✅ 解决方案**：
1. 确保构建产物存在：`ls dist/button.js`
2. 使用 `npm pack --dry-run` 检查发布内容

---

### 错误 4：忘记添加 types 条件

**❌ 错误**：
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "types": "./dist/index.d.ts"  // 旧方式，exports 会覆盖
}
```

**问题**：TypeScript 用户无法获得类型提示。

**✅ 正确**：
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",  // 在 exports 中指定 types
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 工具支持

### 检查 Exports 配置

使用 [publint](https://publint.dev/) 检查 `package.json` 配置：

```bash
npx publint
```

**检查项**：
- exports 配置是否正确
- 文件路径是否存在
- 类型声明是否匹配
- 兼容性问题

---

### 测试 Exports 导入

创建测试脚本验证导入路径：

```javascript
// test-exports.mjs
import main from '@gaoding/utils'
import subpath from '@gaoding/utils/subpath'

console.log('Main export:', main)
console.log('Subpath export:', subpath)
```

```bash
node test-exports.mjs
```

---

## 最佳实践总结

### ✅ 推荐做法

1. **使用 exports 字段**
   - 所有新包必须提供 `exports`
   - 明确定义可导入的路径

2. **类型优先**
   - `types` 条件放在第一位
   - 每个导出都提供类型声明

3. **双格式支持**
   - 同时提供 ESM (`import`) 和 CJS (`require`)
   - 添加 `default` 回退

4. **保留兼容字段**
   - 同时提供 `main`、`module`、`types`
   - 兼容不支持 `exports` 的旧工具

5. **子路径导出**
   - 大型库提供按需导入路径
   - 优化 Tree-shaking 效果

6. **使用工具检查**
   - 发布前运行 `npx publint`
   - 使用 `npm pack --dry-run` 检查内容

---

### ❌ 避免的做法

1. **不要使用通配符暴露所有文件**
   ```json
   // ❌ 不推荐
   { "exports": "./*": "./dist/*" }
   ```

2. **不要在 exports 中使用相对路径**
   ```json
   // ❌ 错误
   { "exports": "../dist/index.js" }
   ```

3. **不要忘记 types 条件**
   ```json
   // ❌ TypeScript 用户无类型提示
   {
     "exports": {
       ".": "./dist/index.js"
     }
   }
   ```

4. **不要过度细化子路径**
   ```json
   // ❌ 过度细化，维护成本高
   {
     "exports": {
       "./button/primary": "./dist/button/primary.js",
       "./button/secondary": "./dist/button/secondary.js"
     }
   }
   ```

---

## 迁移指南

### 从旧配置迁移到 Exports

**旧配置**（只有 main/module/types）：
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

**迁移步骤**：

1. **添加 exports 字段**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

2. **添加子路径导出**（如需要）
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  }
}
```

3. **测试**
```bash
# 检查配置
npx publint

# 测试导入
node -e "import('@your-package')"
node -e "require('@your-package')"
```

4. **发布新版本**
   - 如果只添加 `exports` 而不改变 API：发布 `MINOR` 版本
   - 如果移除了之前可以导入的内部路径：发布 `MAJOR` 版本（破坏性变更）

---

## 参考资料

### 官方文档
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript 4.7 Package Exports](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#package-json-exports-imports-and-self-referencing)
- [Webpack Package Exports Guide](https://webpack.js.org/guides/package-exports/)

### 工具
- [publint](https://publint.dev/) - 检查 package.json 配置
- [tsup](https://tsup.egoist.dev/) - 快速构建 TypeScript 库
- [arethetypeswrong](https://arethetypeswrong.github.io/) - 检查类型导出

### 相关文档
- [Package.json 规范](../01-基础规范/Package.json规范.md)
- [版本管理与发布](../03-实践指南/版本管理与发布.md)
- [前端基础架构](../../前端基础架构/README.md)
