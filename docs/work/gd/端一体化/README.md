# 端一体化体系文档

## 📖 文档概述

本目录包含稿定平台从「套版」逐步走向端一体化的完整体系文档，涵盖战略规划、技术方案、设计规范和实践指南。

---

## 🗂️ 文档结构

```
端一体化/
├── README.md                          # 本文件：文档导航
├── 01-战略规划/                        # 战略层
│   └── 端一体化战略规划.md              # 从「套版」走向端一体化的战略思考
├── 02-Design-Tokens/                  # 技术实现层
│   ├── 01-概念与价值.md                # Design Tokens 是什么、为什么
│   ├── 02-方案介绍.md                  # 完整的技术方案和协作流程
│   ├── 03-定义规范.md                  # 命名规范、分类体系、版本管理
│   └── 04-接入指南.md                  # 实践指南和代码示例
└── attachments/                       # 图片附件
    ├── image2022-10-29_22-51-52.png
    ├── 整体协作流程.png
    ├── Tokens.png
    └── ...
```

---

## 📚 阅读指南

### 方式一：按角色阅读

#### 产品经理
1. **必读**：[端一体化战略规划](01-战略规划/端一体化战略规划.md)
   - 了解端一体化的背景、挑战和解决方案
   - 理解渐进式过渡策略
   
2. **推荐**：[Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md)
   - 了解 Design Tokens 的价值
   - 理解如何保证多端体验一致性

#### 设计师
1. **必读**：[Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md)
   - 理解 Design Tokens 的核心概念
   
2. **必读**：[方案介绍](02-Design-Tokens/02-方案介绍.md)
   - 了解协作流程
   - 学习如何在 Figma 中维护 Tokens
   
3. **必读**：[定义规范](02-Design-Tokens/03-定义规范.md)
   - 掌握命名规范
   - 理解分类体系
   
4. **推荐**：[端一体化战略规划](01-战略规划/端一体化战略规划.md)
   - 理解为什么要做响应式设计

#### 前端开发
1. **必读**：[Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md)
   - 理解 Design Tokens 的技术价值
   
2. **必读**：[接入指南](02-Design-Tokens/04-接入指南.md)
   - 学习如何接入 Design Tokens
   - 查看代码示例
   
3. **必读**：[定义规范](02-Design-Tokens/03-定义规范.md)
   - 了解 Tokens 分类和命名规范
   - 学会选择合适的 Token
   
4. **推荐**：[方案介绍](02-Design-Tokens/02-方案介绍.md)
   - 了解完整的技术方案
   - 理解转换流程

#### 技术负责人
1. **必读**：[端一体化战略规划](01-战略规划/端一体化战略规划.md)
   - 理解战略背景和实施路径
   
2. **必读**：[方案介绍](02-Design-Tokens/02-方案介绍.md)
   - 评估技术方案的可行性
   
3. **推荐**：全部文档
   - 全面了解体系

### 方式二：按顺序阅读

#### 第一阶段：理解背景（20分钟）
1. [端一体化战略规划](01-战略规划/端一体化战略规划.md)
   - 了解为什么需要端一体化
   - 理解渐进式过渡策略

2. [Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md)
   - 了解 Design Tokens 是什么
   - 理解为什么从这里开始

#### 第二阶段：掌握方案（30分钟）
3. [方案介绍](02-Design-Tokens/02-方案介绍.md)
   - 了解完整的技术方案
   - 理解协作流程

4. [定义规范](02-Design-Tokens/03-定义规范.md)
   - 掌握命名规范
   - 理解分类体系

#### 第三阶段：实践应用（30分钟）
5. [接入指南](02-Design-Tokens/04-接入指南.md)
   - 学习如何接入
   - 查看实战示例

---

## 🎯 核心概念速览

### 端一体化
- **定义**：通过响应式设计和技术抽象，实现多端（桌面 Web、手机 Web、安卓、iOS、桌面客户端、小程序）的代码复用和体验一致性
- **目标**：降低研发成本，提升体验一致性
- **策略**：渐进式过渡，从套版协作模块开始

### Design Tokens
- **定义**：设计系统的视觉设计原子，存储视觉设计属性的命名实体
- **价值**：设计与研发的统一语言，多端一致性的保障
- **分类**：Global Tokens、Alias Tokens、Component Tokens

### 工作流程
```
设计师（Figma）→ Tokens JSON → Git 仓库 → Style Dictionary → 多平台产物 → 各端接入
```

---

## 🚀 快速开始

### 设计师快速开始
1. 阅读 [Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md)
2. 查看 Figma 设计文件：https://www.figma.com/file/75N2O1ewVBsMW2Im6TNiff/稿定---web基础组件
3. 安装 Figma Tokens 插件：https://www.figmatokens.com/
4. 阅读 [方案介绍](02-Design-Tokens/02-方案介绍.md) 了解协作流程

### 开发者快速开始
1. 阅读 [接入指南](02-Design-Tokens/04-接入指南.md)
2. 选择接入方式（npm 或 CDN）
3. 引入 Design Tokens
4. 在代码中使用 CSS 变量

**CDN 快速接入：**
```html
<link rel="stylesheet" href="https://st0.dancf.com/package/npm/gaoding/design-tokens/0.1.1-beta.6/default.css">
```

**使用示例：**
```css
.my-component {
  color: var(--text-color-primary, #222529);
  padding: var(--spacing-medium, 16px);
}
```

---

## 🔗 相关资源

### 内部资源
- **Figma 设计文件**：https://www.figma.com/file/75N2O1ewVBsMW2Im6TNiff/稿定---web基础组件
- **Git 仓库**：https://git.gaoding.com/gaoding/gdesign-ui/tree/next/packages/design-tokens
- **npm 包**：@gaoding/design-tokens

### 外部资源
- **Figma Tokens 插件**：https://www.figmatokens.com/
- **Style Dictionary**：https://amzn.github.io/style-dictionary/
- **Design Tokens 标准**：https://tr.designtokens.org/

### 社区资源
- **Design Tokens Community Group**
- **Design tokens as your DNA**
- **Awesome-Design-Tokens**
- **A guide to design tokens**

---

## 📝 文档详情

### 01-战略规划

#### [端一体化战略规划](01-战略规划/端一体化战略规划.md)
从「套版」逐步走向端一体化的战略思考和实施路径。

**关键内容：**
- 多端维护的困境与挑战
- 行业参考：Canva 的成功实践
- 渐进式过渡策略
- Web 端响应式改造路径
- 团队工作方式转变
- 风险与应对策略

**适合阅读人群：**产品经理、技术负责人、设计负责人

---

### 02-Design-Tokens

#### [01-概念与价值](02-Design-Tokens/01-概念与价值.md)
Design Tokens 的核心概念、背景动机和价值主张。

**关键内容：**
- 什么是 Design Tokens
- 为什么需要 Design Tokens
- 设计系统演进的困境
- Design Tokens 的核心价值
- 目标设定和实施路径

**适合阅读人群：**全员必读

---

#### [02-方案介绍](02-Design-Tokens/02-方案介绍.md)
完整的技术方案、协作流程和 JSON 协议定义。

**关键内容：**
- 全流程协作流程
- Tokens JSON 协议
- Tokens 分类体系
- Tokens 转换流程
- 设计与研发协作方式

**适合阅读人群：**设计师、开发者、技术负责人

---

#### [03-定义规范](02-Design-Tokens/03-定义规范.md)
详细的命名规范、分类体系、值的定义和版本管理策略。

**关键内容：**
- 命名规范（kebab-case）
- 三层分类体系（Global/Alias/Component）
- 各类型值的定义规范
- 语义化版本管理
- 如何选择和添加 Token

**适合阅读人群：**设计师、开发者

---

#### [04-接入指南](02-Design-Tokens/04-接入指南.md)
实践指南、代码示例和常见问题解答。

**关键内容：**
- npm 和 CDN 两种接入方式
- 暗黑模式切换方法
- VSCode 插件配置
- 在 Figma 中查找 Token
- 推荐的写法和实战示例
- 常见问题解答

**适合阅读人群：**开发者

---

## ❓ 常见问题

### Q1: 我应该从哪个文档开始阅读？
**A:** 根据你的角色：
- **产品经理**：从 [端一体化战略规划](01-战略规划/端一体化战略规划.md) 开始
- **设计师**：从 [Design Tokens 概念与价值](02-Design-Tokens/01-概念与价值.md) 开始
- **开发者**：从 [接入指南](02-Design-Tokens/04-接入指南.md) 开始

### Q2: 如何快速接入 Design Tokens？
**A:** 查看 [接入指南](02-Design-Tokens/04-接入指南.md) 的"快速开始"部分，通过 CDN 方式几分钟即可接入。

### Q3: Design Tokens 和端一体化是什么关系？
**A:** Design Tokens 是实现端一体化的重要基础设施：
- 提供统一的设计语言
- 保证多端设计一致性
- 支持主题切换和响应式设计
- 降低多端维护成本

### Q4: 如何参与 Tokens 的定义和维护？
**A:** 
1. 阅读 [定义规范](02-Design-Tokens/03-定义规范.md) 了解规范
2. 在 Figma 中使用 Figma Tokens 插件维护
3. 提交到 Git 仓库进行代码审查

### Q5: 套版项目已经接入了吗？
**A:** 是的，套版项目已通过 CDN 方式接入。其他项目正在逐步推进中。

---

## 🤝 参与贡献

### 文档维护
如果发现文档错误或需要补充内容，请：
1. 提交 issue 或 PR
2. 联系文档维护团队

### Tokens 维护
如果需要添加或修改 Tokens：
1. 在 Figma 中更新
2. 导出 JSON 并提交 PR
3. 更新 CHANGELOG

---

## 📅 更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|---------|--------|
| v1.0 | 2025-01-25 | 初始版本，整合5个文档 | AI |

---

## 📞 联系方式

- **设计团队**：关于 Design Tokens 定义和 Figma 相关问题
- **前端团队**：关于 Design Tokens 接入和使用相关问题
- **产品团队**：关于端一体化战略和规划相关问题

---

*最后更新：2025-01-25*
