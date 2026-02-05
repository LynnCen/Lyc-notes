# Package.json 规范

> **目标读者**：包开发者、维护者  
> **难度等级**：⭐⭐ 中级

---

## 概述

`package.json` 是 npm 包的清单文件，定义了包的元数据、依赖关系、构建脚本等关键信息。本文档规范了稿定 Monorepo 中所有包的 `package.json` 配置标准。

---

## 必需字段

### name

包名必须遵循以下规范：

**格式**：`@gaoding/<package-name>`

**命名规则**：
- 使用 `@gaoding` 作用域（scope）
- 包名使用小写字母和连字符（kebab-case）
- 名称应简洁、语义化、易于理解

**示例**：
```json
{
  "name": "@gaoding/design-tokens",
  "name": "@gaoding/http-client",
  "name": "@gaoding/react-hooks"
}
```

**❌ 错误示例**：
```json
{
  "name": "design-tokens",          // 缺少作用域
  "name": "@gaoding/DesignTokens",  // 使用了大写字母
  "name": "@gaoding/design_tokens"  // 使用了下划线
}
```

---

### version

版本号必须遵循**语义化版本规范（Semver）**。

**格式**：`MAJOR.MINOR.PATCH`

```json
{
  "version": "1.2.3"
}
```

**说明**：
- **MAJOR**（主版本号）：不兼容的 API 变更
- **MINOR**（次版本号）：向后兼容的功能新增
- **PATCH**（修订号）：向后兼容的问题修复

**注意事项**：
- 新包从 `0.1.0` 或 `1.0.0` 开始
- 使用 Changesets 自动管理版本号，避免手动修改
- `0.x.y` 版本表示实验性 API，可能随时变更

---

### type

指定包的模块系统类型。

**推荐配置**：
```json
{
  "type": "module"
}
```

**说明**：
- `"module"`：将 `.js` 文件视为 ES Module（ESM）
- `"commonjs"`：将 `.js` 文件视为 CommonJS（默认值）

**建议**：优先使用 `"module"`，支持现代 JavaScript 生态。

---

### exports

`exports` 字段是控制包导出的**现代标准**，必须提供。

**基础配置**：
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

**说明**：
- **优先级**：`exports` 优先于 `main`、`module`
- **类型优先**：`types` 必须放在最前面
- **条件导出**：`import` 用于 ESM，`require` 用于 CJS

**详细用法**：参见 [Package Exports 最佳实践](../02-导出声明/Package-Exports最佳实践.md)

---

### main / module / types

为兼容旧版工具，需要同时提供这些字段：

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

**说明**：
- **main**：CJS 入口（旧版 Node.js、Webpack）
- **module**：ESM 入口（支持 Tree-shaking 的打包工具）
- **types**：TypeScript 类型声明入口

**注意**：虽然 `exports` 是现代标准，但为了兼容性，仍需保留这三个字段。

---

### files

指定发布到 npm 时包含的文件。

**推荐配置**：
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

**说明**：
- 只包含构建产物（`dist/`），不包含源代码（`src/`）
- 自动包含：`package.json`、`README.md`、`LICENSE`
- 不需要列出：`.gitignore`、`.npmignore` 中的文件会自动排除

**检查发布文件**：
```bash
npm pack --dry-run
```

---

## 推荐字段

### description

简短描述包的功能。

```json
{
  "description": "Design tokens for Gaoding design system"
}
```

**要求**：
- 一句话概括包的作用
- 不超过 100 个字符
- 使用英文或中文

---

### keywords

便于搜索的关键词。

```json
{
  "keywords": ["design-system", "tokens", "theming"]
}
```

---

### author / contributors

作者和贡献者信息。

```json
{
  "author": {
    "name": "Gaoding Frontend Team",
    "email": "frontend@gaoding.com"
  },
  "contributors": [
    "lincen <lincen@gaoding.com>"
  ]
}
```

---

### homepage / repository / bugs

项目相关链接。

```json
{
  "homepage": "https://github.com/gaoding/monorepo#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/gaoding/monorepo.git",
    "directory": "packages/design-tokens"
  },
  "bugs": {
    "url": "https://github.com/gaoding/monorepo/issues"
  }
}
```

**说明**：
- **repository.directory**：Monorepo 中必须指定包所在目录
- **bugs**：问题反馈地址

---

### license

开源协议。

```json
{
  "license": "MIT"
}
```

**常见协议**：
- **MIT**：最宽松，允许商业使用
- **Apache-2.0**：类似 MIT，但有专利授权条款
- **UNLICENSED**：私有包，不对外开源

---

### engines

指定兼容的 Node.js 和 npm 版本。

```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**说明**：
- **node**：指定最低 Node.js 版本
- **pnpm**：Monorepo 使用 pnpm 作为包管理器
- **packageManager**：锁定确切的包管理器版本（Corepack 使用）

---

## 依赖管理

### dependencies

运行时依赖，会被一起安装。

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "lodash-es": "^4.17.21"
  }
}
```

**原则**：
- 只包含**必需的运行时依赖**
- 避免不必要的依赖，减少包体积
- 使用 `^` 允许兼容性更新

---

### devDependencies

开发时依赖，不会被安装。

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

**说明**：
- 构建工具（tsup、vite）
- 类型定义（@types/*）
- 测试工具（vitest、jest）

---

### peerDependencies

对等依赖，要求使用者提供。

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true
    }
  }
}
```

**使用场景**：
- React 组件库：要求使用者提供 `react`
- 插件：要求宿主应用提供特定依赖

**peerDependenciesMeta**：标记可选的对等依赖

---

### optionalDependencies

可选依赖，安装失败不影响主流程。

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.0"
  }
}
```

**使用场景**：
- 平台特定的依赖（如 macOS 上的 fsevents）
- 性能优化依赖（有更好，没有也能用）

---

## Scripts 脚本

### 标准脚本

所有包应提供以下标准脚本：

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  }
}
```

**说明**：
- **build**：构建生产版本
- **dev**：开发模式（监听文件变化）
- **test**：运行测试
- **lint**：代码检查
- **type-check**：类型检查（不生成文件）

---

### Monorepo 脚本

在 Monorepo 根目录使用 Turborepo 执行：

```bash
# 构建所有包
pnpm turbo build

# 构建特定包
pnpm --filter @gaoding/design-tokens build

# 并行测试
pnpm turbo test
```

---

## 配置示例

### 基础库包

```json
{
  "name": "@gaoding/utils",
  "version": "1.0.0",
  "description": "Common utility functions",
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
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest"
  },
  "keywords": ["utils", "helpers"],
  "license": "MIT",
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

---

### React 组件库

```json
{
  "name": "@gaoding/ui-components",
  "version": "2.1.0",
  "description": "React UI components",
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
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts src/button.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 常见问题

### Q: 为什么需要同时提供 `exports` 和 `main/module/types`？

**A**：兼容性考虑。
- **现代工具**（Node.js 12.20+、Webpack 5、Vite）：优先使用 `exports`
- **旧版工具**：回退到 `main/module/types`

---

### Q: `dependencies` 和 `peerDependencies` 的区别？

**A**：
- **dependencies**：包会自动安装这些依赖，使用者无需关心
- **peerDependencies**：要求使用者提供这些依赖，避免重复安装（如 React）

---

### Q: 如何查看包的发布内容？

**A**：使用以下命令预览：
```bash
npm pack --dry-run
```

或者安装后查看：
```bash
npm pack
tar -tzf gaoding-your-package-1.0.0.tgz
```

---

### Q: 如何在 Monorepo 中引用本地包？

**A**：使用 `workspace:` 协议：
```json
{
  "dependencies": {
    "@gaoding/utils": "workspace:^"
  }
}
```

发布时，pnpm 会自动替换为实际版本号。

---

## 检查清单

发布前请确认：

- [ ] `name` 使用 `@gaoding/` 作用域和 kebab-case 命名
- [ ] `version` 遵循 Semver 规范
- [ ] 提供了 `exports` 字段并包含 `types` 条件
- [ ] 同时提供了 `main`、`module`、`types` 字段（兼容性）
- [ ] `files` 只包含必要的构建产物
- [ ] `dependencies` 中只有运行时依赖
- [ ] 提供了标准的 `scripts`（build、dev、test）
- [ ] 添加了 `description`、`keywords`、`license`
- [ ] Monorepo 包的 `repository.directory` 正确指向包目录

---

## 相关文档

- [Package Exports 最佳实践](../02-导出声明/Package-Exports最佳实践.md)
- [版本管理与发布](../03-实践指南/版本管理与发布.md)
- [前端基础架构 - 工具链](../../前端基础架构/前端可生长架构设计.md)

---

## 参考资料

- [npm package.json 官方文档](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Semantic Versioning](https://semver.org/)
- [pnpm Workspace 协议](https://pnpm.io/workspaces#workspace-protocol-workspace)
