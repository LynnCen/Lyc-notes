# Figma Dev Mode MCP 使用指南

> [!NOTE]
> 本文章介绍如何安装和使用 [Figma Dev Mode MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)，这是一个革命性的工具，将 Figma 设计直接带入开发工作流程。

## 概述

Figma Dev Mode MCP Server 是 Figma 推出的一个创新工具，它通过模型上下文协议（Model Context Protocol）将 Figma 设计文件直接集成到 AI 代码编辑器中。这个工具让 AI 智能体能够获取重要的设计信息和上下文，从而生成更准确、更符合设计意图的代码。

> [!IMPORTANT]
> Figma Dev Mode MCP Server 目前处于公开测试阶段，某些功能和设置可能尚未完全可用。

## 为什么需要 Figma MCP？

在传统的设计到代码工作流程中，开发者通常需要：
- 手动查看设计稿并理解设计意图
- 猜测颜色值、间距和字体大小
- 重复创建已存在的组件
- 在设计和代码之间来回切换

Figma MCP 解决了这些痛点，让 AI 能够：
- 直接读取设计文件中的精确数值
- 理解设计系统和组件结构
- 生成与现有代码库一致的代码
- 保持设计和代码的同步

## 主要特性

### 🎨 从选中框架生成代码
- **智能代码生成**：选择 Figma 中的任意框架，AI 可以将其转换为可用的代码
- **适用场景**：非常适合产品团队构建新流程或迭代应用功能
- **支持多种框架**：可以生成 React、Vue 等不同框架的代码

### 📐 提取设计上下文
- **变量提取**：直接将设计变量（颜色、字体、间距等）拉入 IDE
- **组件信息**：获取组件的详细结构和属性
- **布局数据**：提取布局信息，包括 Grid、Flexbox 等
- **设计系统支持**：特别适用于设计系统和基于组件的工作流程

### 🔗 Code Connect 智能集成
- **组件复用**：通过重用实际组件来提升输出质量
- **代码一致性**：确保生成的代码与现有代码库保持一致
- **映射关系**：建立设计组件与代码组件的映射关系

### 📝 丰富的设计信息
- **文本内容**：提取设计中的实际文本内容
- **图层名称**：利用有意义的图层命名来理解设计意图
- **注释信息**：读取设计中的注释和说明
- **占位符内容**：即使是占位符内容也能为 AI 提供有价值的上下文

## 系统要求

### 必需条件
- **Figma 桌面应用**：必须使用 Figma 桌面版（不支持网页版）
- **订阅计划**：需要 Professional、Organization 或 Enterprise 计划的 Dev 或 Full 席位
- **支持的编辑器**：VS Code、Cursor、Windsurf、Claude Code 等支持 MCP 的编辑器

### 推荐配置
- **最新版本**：确保 Figma 桌面应用更新到最新版本
- **稳定网络**：良好的网络连接以确保 MCP 服务器稳定运行

## 安装指南

### 第一步：启用 Figma MCP 服务器

1. **打开 Figma 桌面应用**
   - 确保已更新到最新版本
   - 如果没有桌面应用，请先[下载安装](https://www.figma.com/downloads/)

2. **创建或打开设计文件**
   - 创建一个新的 Figma Design 文件
   - 或打开现有的设计文件

3. **启用 MCP 服务器**
   - 点击左上角的 Figma 菜单
   - 在 **Preferences（偏好设置）** 下选择 **Enable Dev Mode MCP Server**
   - 看到屏幕底部的确认消息，表示服务器已启用并运行

4. **记录服务器地址**
   - 服务器将在本地运行：`http://127.0.0.1:3845/sse`
   - 请记住这个地址，下一步配置时需要用到

### 第二步：配置 MCP 客户端

根据你使用的编辑器，选择相应的配置方法：

#### VS Code 配置

> [!NOTE]
> 使用 VS Code 需要启用 GitHub Copilot

1. **打开设置**
   - 使用快捷键 `⌘ ,`（Mac）或 `Ctrl ,`（Windows）
   - 或通过菜单：**Code → Settings → Settings**

2. **搜索 MCP 设置**
   - 在搜索栏中输入 "MCP"
   - 选择 **Edit in settings.json**

3. **添加配置**
   ```json
   {
     "chat.mcp.discovery.enabled": true,
     "mcp": {
       "servers": {
         "Figma Dev Mode MCP": {
           "type": "sse",
           "url": "http://127.0.0.1:3845/sse"
         }
       }
     },
     "chat.agent.enabled": true
   }
   ```

4. **验证连接**
   - 使用快捷键 `⌥⌘B`（Mac）打开聊天工具栏
   - 切换到 **Agent** 模式
   - 在选择工具菜单中查找 `MCP Server: Figma Dev Mode MCP` 部分
   - 如果没有看到工具，请重启 Figma 桌面应用和 VS Code

#### Cursor 配置

1. **打开 Cursor 设置**
   - 菜单：**Cursor → Settings → Cursor Settings**

2. **添加 MCP 服务器**
   - 转到 **MCP** 标签页
   - 点击 **+ Add new global MCP server**

3. **输入配置**
   ```json
   {
     "mcpServers": {
       "Figma": {
         "url": "http://127.0.0.1:3845/sse"
       }
     }
   }
   ```

4. **保存配置**
   - 保存设置并重启 Cursor

#### Windsurf 配置

1. **打开设置**
   - 使用快捷键 `⌘ ,` 或菜单：**Windsurf → Settings → Windsurf Settings**

2. **安装插件**
   - 导航到 **Cascade settings**
   - 选择 **Open plugin store**
   - 搜索 **Figma** 并安装插件

3. **验证安装**
   - 打开 **Cascade**
   - 应该能看到 Figma MCP 服务器和可用工具

> [!WARNING]
> 在 Windsurf 中，需要将配置文件中的 `url` 属性改为 `serverUrl` 以避免错误。

#### Claude Code 配置

1. **添加服务器**
   ```bash
   claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse
   ```

2. **管理服务器**
   ```bash
   # 列出所有配置的服务器
   claude mcp list
   
   # 获取特定服务器详情
   claude mcp get figma-dev-mode-mcp-server
   
   # 移除服务器
   claude mcp remove figma-dev-mode-mcp-server
   ```

### 第三步：验证连接

1. **刷新或启动服务器**
   - 重启你的代码编辑器
   - 确保 Figma 桌面应用中的 MCP 服务器仍在运行

2. **检查连接状态**
   - 应该看到成功连接的提示
   - 可以看到可用的工具列表

3. **故障排除**
   - 如果连接失败或看不到工具，请检查 Figma 桌面应用中的服务器是否处于活动状态
   - 确保端口 3845 没有被其他应用占用

## 使用方法

Figma Dev Mode MCP Server 提供了两种主要的使用方式：

### 基于选择的方式（推荐）

1. **在 Figma 中选择设计元素**
   - 打开 Figma 桌面应用
   - 选择你想要转换为代码的框架或图层

2. **在编辑器中发起请求**
   - 在你的 AI 代码编辑器中输入提示
   - 例如："请帮我实现当前选中的设计"
   - 或："将选中的组件转换为 React 代码"

### 基于链接的方式

1. **复制 Figma 链接**
   - 在 Figma 中右键点击框架或图层
   - 选择 "Copy link"

2. **在编辑器中使用链接**
   - 将链接粘贴到 AI 编辑器中
   - 例如："请帮我实现这个设计：[Figma链接]"

> [!TIP]
> AI 客户端无法直接导航到链接，但会提取其中的 node-id 来识别要处理的设计对象。

## 实用示例

### 创建组件
```
"请根据当前选中的 Figma 设计创建一个 React 组件，使用 Tailwind CSS 进行样式设置"
```

### 提取设计变量
```
"从当前选中的设计中提取所有颜色变量和字体样式，并生成对应的 CSS 变量"
```

### 生成响应式布局
```
"将这个 Figma 框架转换为响应式的 HTML/CSS 布局，确保在移动端和桌面端都能正常显示"
```

### 创建设计系统组件
```
"基于选中的设计创建一个可复用的按钮组件，包含不同的变体（primary、secondary、disabled）"
```

## 可用工具

Figma Dev Mode MCP Server 提供了三个主要工具：

1. **代码工具**：获取设计的代码表示，支持多种框架
2. **图像工具**：提取设计中的图像资源
3. **变量定义工具**：获取设计变量的定义和值

你可以在服务器设置中调整代码工具返回的响应类型，以便根据具体任务进行微调。

## 最佳实践

### 设计准备
- **使用有意义的图层名称**：清晰的命名有助于 AI 理解设计意图
- **添加注释**：在复杂的设计中添加注释说明
- **使用设计系统**：利用 Figma 的组件和变量系统
- **保持设计文件整洁**：删除不必要的图层和元素

### 代码生成
- **明确指定框架**：告诉 AI 你想要使用的技术栈
- **提供上下文**：说明组件的用途和预期行为
- **迭代优化**：根据生成的代码进行调整和优化

### Code Connect 集成
- **建立映射关系**：将设计组件与代码组件建立清晰的映射
- **保持同步**：定期更新 Code Connect 配置
- **文档化**：为组件添加详细的文档说明

## 故障排除

### 常见问题

#### 1. 无法连接到 MCP 服务器
- 确保 Figma 桌面应用已启用 MCP 服务器
- 检查端口 3845 是否被占用
- 重启 Figma 桌面应用和代码编辑器

#### 2. 看不到可用工具
- 验证编辑器配置是否正确
- 确保使用的是支持 MCP 的编辑器版本
- 检查网络连接

#### 3. 生成的代码质量不佳
- 提供更详细的提示信息
- 确保设计文件结构清晰
- 使用 Code Connect 提供更多上下文

#### 4. VS Code 中无法使用
- 确保已启用 GitHub Copilot
- 检查 MCP 配置是否正确
- 更新到最新版本的 VS Code

### 调试技巧

1. **检查服务器状态**
   - 在 Figma 中查看 MCP 服务器是否正在运行
   - 访问 `http://127.0.0.1:3845/sse` 检查连接

2. **查看编辑器日志**
   - 检查编辑器的错误日志
   - 查看 MCP 相关的错误信息

3. **测试连接**
   - 使用简单的提示测试基本功能
   - 逐步增加复杂度

## 未来发展

Figma 团队正在积极开发更多功能：

### 即将推出的功能
- **远程服务器功能**：无需桌面应用即可使用
- **更深入的代码库集成**：更好地与现有项目集成
- **简化的 Code Connect 体验**：更直观的设置过程
- **注释支持**：更好地处理设计注释
- **Grid 支持**：增强的布局功能支持

### 长期规划
- 支持更多设计工具
- 增强的 AI 理解能力
- 更多的代码框架支持
- 团队协作功能增强

## 反馈和支持

Figma 团队非常重视用户反馈，你可以通过以下方式提供反馈：

- **官方反馈表单**：[提交反馈](https://www.figma.com/feedback)
- **社区讨论**：参与 Figma 社区讨论
- **GitHub Issues**：如果遇到技术问题，可以在相关仓库提交 issue

## 结语

Figma Dev Mode MCP Server 代表了设计到代码工作流程的重大进步。通过将设计上下文直接带入开发环境，它不仅提高了开发效率，还确保了设计意图的准确传达。

虽然目前还处于测试阶段，但这个工具已经展现出巨大的潜力。随着功能的不断完善和扩展，我们可以期待一个更加无缝、高效的设计开发协作未来。

对于设计师和开发者来说，现在是开始探索和使用这个工具的最佳时机。通过早期采用和反馈，你不仅能够提升自己的工作效率，还能为工具的未来发展贡献力量。

---

**参考资料：**
- [Figma Dev Mode MCP Server 官方指南](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
- [Figma 博客：介绍 Dev Mode MCP Server](https://www.figma.com/blog/introducing-figmas-dev-mode-mcp-server/)
- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [Figma 开发者文档](https://www.figma.com/developers)