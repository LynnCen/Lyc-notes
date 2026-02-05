**状态**: In Review

## 摘要

在大型 Monorepo 中，Changesets 官方推荐的 `privatePackages` 方案会导致严重的工程效率问题：大量级联版本更新让代码评审变得困难，频繁的 `package.json` 变更导致构建缓存失效、CI/CD 性能下降。本文档提出了一种混合版本管理策略，在保留 Changesets 版本管理能力（Git Tag、CHANGELOG）的前提下，通过优化依赖关系和版本更新机制，显著减少不必要的版本变更，提升代码评审效率和 CI/CD 性能。

## 术语说明

本文档使用以下术语：

- **应用包**：非 NPM 包（例如应用程序），这些包不发布到 NPM 仓库，通过 Docker 镜像部署，需要 Changesets 管理版本以生成 Git Tag 触发部署。本文多处使用 `@app/*` 作为其命名约定。

- **private 包**：在 `package.json` 中设置了 `"private": true` 的包，这是 NPM 包规范定义的字段，它表示包不发布到 NPM 仓库。

## 动机

Changesets 是目前广泛使用的 Monorepo 版本管理工具。根据其官方文档推荐的方案（[Managing applications or non-npm packages](https://github.com/changesets/changesets/blob/main/docs/managing-applications-or-non-npm-packages.md)），建议将应用包配置为 `privatePackages` 来进行版本控制。具体做法是将应用包在 `package.json` 中设置为 `"private": true`，并在 Changesets 配置中启用 `privatePackages` 的版本控制。

### 痛点：工具哲学与应用特征的冲突

然而，在大型 Monorepo 实践中，这种方法带来了严重问题。这源于**工具的设计哲学（库导向）与应用（Application）的发布特征存在错位**。

Changesets 根植于 NPM 生态，是为库（Library）设计的。在库的依赖树中，版本传播是必须的（级联更新）。如果 `Lib A -> Lib B`，当 `Lib B` 升级时，`Lib A` 必须发版，以确保消费者获得正确的依赖组合。其核心逻辑是：依赖变更即产物变更，因此需要版本变更。

相反，应用是依赖树的叶子节点（Leaf Node），其发布行为与库有显著不同。应用通常是"部署（Deploy）"而非"发布（Publish）"，关注的是构建产物（如 Docker 镜像）。

1. **代码评审困难**：大量的 private 包版本号变更（"Cascading Version Bumps"）让 PR 包含数百行无关修改。在 GitLab 等平台上，这会触发大量不必要的 Code Owner 审核机制，导致一个简单的 PR 需要涉及无关的团队成员进行评审，不仅拖慢了流程，也让真正有意义的变更日志淹没在版本号更新中，失去了评审的焦点。
2. **CI/CD 效率低下**：频繁的 `package.json` 变动导致构建系统的缓存失效，每次版本更新都会触发全量构建，大幅降低流水线效率。

### 为什么不能直接放弃 Changesets

既然存在冲突，为什么不直接使用 Nx / Turborepo 等智能构建工具来管理版本呢？这些工具通过计算哈希（Hash）完美解决了构建缓存问题。

但在生产环境交付中，**交付产物（Artifact）的版本控制工作流** 与 **构建触发（Build Trigger）** 是两个维度的需求：

1. **交付产物的版本控制**：Changesets 提供了一套完整的“变更集 -> 版本号 -> Git Tag -> CHANGELOG”工作流。这关注的是**软件生命周期管理**，确保每次交付都有明确的语义化版本（如 `v1.2.0`）和可追溯的变更记录。这是运营、QA 和用户所需要的。
2. **基于变更的构建触发**：Nx / Turborepo 关注的是**构建效率**。它们知道“因为文件 A 变了，所以需要重新构建应用 B”。但它们通常不负责定义“应用 B 这次构建出来的版本号应该是多少”，也不负责生成面向用户的 CHANGELOG。

因此，我们需要一种方案，既能保留 Changesets 带来的**产物版本控制能力**（Git Tag / Changelog），又能消除其在构建效率方面的副作用。

### 社区解决方案现状

针对此问题，社区已经有深入的探讨，例如 [RFC: Packages extensibility #849](https://github.com/changesets/changesets/issues/849)。社区希望将 Changesets 升级为一个通用的软件交付工具，不仅支持 NPM 包，还支持 Docker、Go、Rust 等多种类型的产物，并通过插件机制（ChangesetPackage）来扩展版本管理能力。

然而，这一愿景虽然美好，但目前仍处于提案阶段，短期内无法落地。因此，社区主要有两类解决方案：

1. **智能构建工具流派（Nx / Turborepo / Rush）**：如果不修改版本号，Nx 等工具可以计算出受影响的应用并重构建。
2. **补丁/插件流派**：通过编写脚本或配置机器人来忽略内部依赖的自动更新，属于"偏方"。

本 RFC 方案与社区的长远愿景（支持非 NPM 包管理）是一致的，但作为一种**务实的中间方案（Pragmatic Solution）**，它不需要等待官方的重构，仅利用现有特性即可立即解决核心痛点。

## 提议

本方案的核心思路是：Changesets 定位为 **最终交付产物** 的版本管理工具，不再参与 private 包的版本管理。

1. **关闭 private 包的版本管理**：在 Changesets 配置中禁用 `privatePackages` 的版本控制和 Git Tag 生成。由于 private 包数量通常远多于公开发布的包，禁用其版本管理可以大幅减少版本号变更噪音。

2. **阻断级联版本更新**：将应用包对 private 包的依赖放在 `devDependencies` 中，利用 Changesets 不会因 `devDependencies` 变化而自动更新版本号的特性，阻断 private 包变更向应用包的级联传播。

3. **将应用包视作头等公民**：应用包设置为 `"private": false` 以参与版本管理，但通过发布流程的过滤机制确保不会被发布到 NPM 仓库，仅利用 Git Tag 触发 Docker 镜像部署。

通过这种方式，应用包的版本仅在自身代码变更或直接依赖的公共库变更时更新，大幅减少了因 private 包变更导致的版本噪音，同时保留了完整的版本管理能力。

## 详细设计

### 应用包配置

在所有应用包的 `package.json` 中，确保 `"private": false` 或省略该字段，使 Changesets 正常管理它们的版本。为防止意外发布（如本地误操作或 CI 配置错误），在每个应用包的 `package.json` 中添加 `prepublishOnly` 生命周期脚本，在 `pnpm publish` 执行前强制失败并输出错误信息。示例配置如下：

```json
{
  "name": "@app/my-app",
  "version": "1.0.0",
  "scripts": {
    "prepublishOnly": "echo 'ERROR: This is an application package and cannot be published to NPM. Do not set \"private\": true as Changesets needs to manage its version for Git Tag generation.' && exit 1"
  },
  "private": false
}
```

这个钩子会在发布命令执行前运行，如果被触发会立即失败并输出错误信息，确保应用包不会被意外发布到 NPM 仓库。

### 依赖管理策略

依赖 private 包的策略需要根据包的发布性质区分处理，避免不必要地放大影响面。

#### 需要发布到 NPM 的公开包

如果公开包依赖了 private 包，**必须**使用 `devDependencies` 而不是 `dependencies` 引用，否则执行 `npm publish` 时会失败（private 包无法从公共 NPM 仓库获取）。这些包需要通过打包工具将 `devDependencies` 中的依赖打包进最终产物。

#### 应用包

应用包不发布到 NPM，但需要创建 Git Tag 来触发部署。如果应用包依赖了 private 包，**必须**使用 `devDependencies` 而不是 `dependencies` 引用，原因包括：

1. **Changesets 限制**：如果应用包在 `dependencies` 中依赖了被跳过的 private 包（`privatePackages.version: false`），Changesets 会报错：`The package "@app/xxx" depends on the skipped package "@repo/xxx", but "@app/xxx" is not being skipped`。这是 Changesets 的设计限制，不允许非跳过的包依赖跳过的包。

2. 减少版本噪音：Changesets 不会因为 `devDependencies` 的变化而自动更新包的版本号（详见"版本更新策略"章节），从而减少不必要的版本变更。

3. 减少镜像体积：将依赖打包进最终产物可以减少 Docker 镜像的体积，因为这可以避免大型 Monorepo  中复杂的本地包依赖被打包到镜像中。

应用包的构建工具（如 webpack、rollup、esbuild 等）**必须**配置为将 `devDependencies` 中的依赖打包进最终产物，确保运行时能够正常工作。

示例配置如下：

```json
{
  "name": "@app/my-app",
  "version": "1.0.0",
  "private": false,
  "dependencies": {
    "public-lib": "^1.0.0"
  },
  "devDependencies": {
    "@repo/logger": "workspace:*",
    "@repo/ui": "workspace:*"
  }
}
```

#### private 包之间的依赖

private 包之间的依赖可以继续使用 `dependencies` 引用，原因包括：

1. 不会发布失败：private 包不会发布到 NPM，不存在 `npm publish` 失败的问题。

2. 减少影响面：如果要求所有 private 包之间的依赖都放在 `devDependencies` 中，需要所有 private 包都支持打包，这会大幅增加影响面和实施成本。

3. 保持灵活性：private 包可能不需要打包（如配置类包、工具类包），使用 `dependencies` 可以保持依赖关系的清晰和灵活性。

**总结：只有需要发布到 NPM 的公开包和需要减少版本噪音的应用包才需要将 private 依赖放在 `devDependencies` 中**。private 包之间的依赖可以继续使用 `dependencies`，避免不必要地放大影响面。

### Changesets 配置

在 `.changeset/config.json` 中关闭 `privatePackages` 的自动版本控制和 Git Tag 生成功能。配置示例如下：

```json
{
  "updateInternalDependencies": "patch",
  "privatePackages": {
    "version": false,
    "tag": false
  },
  "ignore": []
}
```

配置说明：

- `privatePackages.version: false`：禁用 private 包的版本号自动更新。在大型 Monorepo 中，private 包的数量通常远多于公开发布的包，如果启用版本控制会导致大量的版本号变更噪音，严重影响代码评审效率和 CI 性能。

- `privatePackages.tag: false`：禁用 private 包的 Git Tag 生成。由于版本号不会更新，创建 Tag 也没有实际意义。

- `ignore: []`：不忽略应用包，让它们参与版本管理。

**注意**：应用包是 `"private": false`，因此 `privatePackages` 配置**不会影响它们**。它们会正常更新版本并在 `changeset publish` 阶段创建 Git Tag。

### 发布流程修改

修改根目录 `package.json` 中的 `changeset:publish` 脚本，利用 pnpm 的过滤能力排除应用包。脚本配置如下：

```json
{
  "scripts": {
    "changeset:publish": "pnpm publish -r --filter=!@app/* && changeset tag"
  }
}
```

**重要**：由于使用 `pnpm publish -r` 代替 `changeset publish` 发布包，Changesets 不会自动创建 Git Tag。因此需要在发布命令后添加 `changeset tag` 来为所有已发布版本创建 Git Tag（包括应用包的 Git Tag，例如 `@app/my-app@1.0.1`）。

项目通过 `changesets-gitlab` 配置发布流程，使用环境变量 `INPUT_PUBLISH` 指向 `changeset:publish` 脚本。CI/CD 配置示例如下：

```yaml
script:
  - pnpm install
  - pnpm run build
  - pnpm exec changesets-gitlab
variables:
  INPUT_VERSION: pnpm run changeset:version
  INPUT_PUBLISH: pnpm run changeset:publish
```

工作流程中，`changesets version`（通过 `INPUT_VERSION` 执行）正常运行，更新所有包（包括应用包）的 `package.json` 版本号，生成 CHANGELOG。`changesets-gitlab` 自动将版本更新和 CHANGELOG 提交到仓库。执行 `changeset:publish`（通过 `INPUT_PUBLISH` 执行）时，该命令会：

1. 执行 `pnpm publish -r --filter=!@app/*` 发布 NPM 库到 NPM 仓库（排除应用包）
2. 执行 `changeset tag` 为所有已发布版本创建 Git Tag（包括应用包的 Git Tag，例如 `@app/my-app@1.0.1`）

### 版本更新策略

Changesets 默认行为是只有当存在对应的 `.changeset/*.md` 文件时，才会更新包的版本。使用 `devDependencies` + 打包策略后，Changesets 不会因为 private 包（devDependencies）的变化而自动更新依赖方的版本号。

#### 版本更新机制

示例场景：假设 `@app/a@1.0.0` 通过 `devDependencies` 依赖了 `@repo/lib`（使用 `workspace:*` 协议）。如果 `@repo/lib` 发生了代码变更，`@app/a` 的版本号不会自动更新，仍然保持 `1.0.0`。如果 `@app/a` 需要部署新版本（例如需要包含 `@repo/lib` 的变更），必须手动为 `@app/a` 创建 Changeset 才能触发版本更新。

#### 版本更新触发条件

1. 应用自身代码变更：必须创建 Changeset，触发版本更新和 Git Tag 生成
2. 公开库（dependencies）变更：Changesets 会自动更新版本（根据 `updateInternalDependencies` 配置）
3. private 包（devDependencies）变更：**不会自动更新版本**，需要手动创建 Changeset 才能触发版本更新

### 部署流程集成

现有的 Docker 镜像部署流程可以继续使用 Changesets 生成的 Git Tag 来触发，无需修改。应用包的 Git Tag（格式为 `@app/.*@.*`）可以正常触发部署流程。

## 总结

本方案并非完美的“银弹”，而是一种针对大型 Monorepo 现状的**妥协方案**。我们主要与官方推荐方案进行对比：

**官方方案 (private: true)** 优先保证**语义化版本的严格正确性**。它认为依赖变了，应用本身也就变了，因此版本号必须增加。这在理论上是完美的，几乎不会出错。

**本 RFC 方案** 则优先保证**工程效率**。通过隔离 `devDependencies`，我们阻断了变更的级联传播。这是一种**工程化规避（Workaround）**，其代价是牺牲了部分语义严谨性，并引入了以下**风险与副作用**：

1. **破坏了 "private" 的语义**：应用包在 `package.json` 中设置为 `"private": false`，但实际上并不发布到 NPM，这破坏了 `private` 字段的语义。

2. **版本更新需要手动触发（最大风险）**：依赖的 private 包发生变更后，依赖方（应用包或需要发布到 NPM 的公开包）不再自动更新版本号。开发者需要手动判断是否需要更新版本，并创建 Changeset 才能触发版本更新（详见"版本更新策略"章节）。如果开发者忘记创建 Changeset，可能导致代码已变更但版本号未更新（最终也不会被发布或部署）。

## 参考

- [Changesets 官方文档：Managing applications or non-npm packages](https://github.com/changesets/changesets/blob/main/docs/managing-applications-or-non-npm-packages.md)
- [Changesets 配置文档](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md)
- [RFC: Packages extensibility #849 (Community Discussion)](https://github.com/changesets/changesets/issues/849)
- [pnpm 过滤选项文档](https://pnpm.io/filtering)