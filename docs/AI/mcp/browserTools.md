# BrowserTools MCP 使用指南

> [!NOTE]
> 本文章介绍如何安装和使用 [BrowserTools MCP](https://browsertools.agentdesk.ai/installation)，这是一个强大的 MCP 工具，可以让 AI 代码编辑器直接与浏览器交互。

## 概述

BrowserTools MCP 是由 [@tedx_ai](https://x.com/tedx_ai) 开发的一个创新工具，它将 AI 代码编辑器和智能体直接嵌入到 Web 浏览器中，提供高效的调试功能和无缝的开发体验。通过这个工具，你可以简单地告诉 Cursor 或任何支持 MCP 集成的 AI 代码编辑器："这个功能不工作...进入调试模式！"或"检查控制台和网络日志，看看哪里出错了？"

## 主要特性

BrowserTools MCP 为 AI 代码编辑器和智能体提供了以下强大功能：

### 🔍 日志监控

- **控制台日志和错误监控**：实时捕获浏览器控制台的所有日志和错误信息
- **XHR 网络请求/响应监控**：监控所有网络请求和响应，便于调试 API 调用问题

### 📸 视觉调试

- **截图功能**：支持自动截图并可选择性地自动粘贴到 Cursor 中
- **当前选中 DOM 元素获取**：获取当前在浏览器中选中的 DOM 元素信息

### 🚀 性能和质量扫描

- **SEO 扫描**：通过 Lighthouse 运行 SEO 优化扫描
- **性能扫描**：评估网页性能指标
- **代码质量扫描**：检测代码质量问题
- **NextJS 专用 SEO 审计**：针对 NextJS 应用的专门 SEO 审计

### 🛠️ 智能模式

- **调试模式**：使用多种工具和提示来自动修复 bug
- **审计模式**：执行全面的 Web 应用审计，涵盖 SEO、性能和可访问性

## 系统要求

- **Node.js**：需要在机器上安装 Node.js
- **Google Chrome 或基于 Chromium 的浏览器**
- **MCP 客户端应用**：支持 Cursor、Windsurf、RooCode、Cline、Continue、Zed、Claude Desktop

> [!IMPORTANT]
> 模型上下文协议（MCP）特定于 Anthropic 模型。使用 Cursor 等编辑器时，请确保启用 composer agent 并选择 Claude 3.5 Sonnet 作为模型。

## 安装指南

### 第一步：下载 Chrome 扩展插件

由于 Google 扩展市场对该插件还处于审核中，需要手动下载安装：

- **直接下载**：[点击下载扩展](https://github.com/AgentDeskAI/browser-tools-mcp/releases/download/v1.2.0/BrowserTools-1.2.0-extension.zip)
- **从 GitHub 下载**：
  ```bash
  git clone https://github.com/AgentDeskAI/browser-tools-mcp.git
  ```

### 第二步：安装 Chrome 扩展

1. **打开扩展管理页面**：
   - 点击 Chrome 浏览器右上角的三个点
   - 选择"更多工具" → "扩展程序"
   - 或直接访问 `chrome://extensions/`

2. **启用开发者模式**：
   - 在扩展程序页面右上角打开"开发者模式"开关

3. **安装扩展**：
   - 点击"加载已解压的扩展程序"
   - 选择下载并解压的插件文件夹
   - 安装成功后，在 Chrome 浏览器右上角可以看到 BrowserToolsMCP 图标

### 第三步：在 Cursor 中配置 BrowserTools MCP



1. **打开 Cursor 设置**：
   - 进入 Cursor Settings
   - 转到 Features，滚动到 MCP Servers

2. **添加新的 MCP 服务器**：
   - 点击"Add new MCP server"
   - 给它一个唯一名称（如：browser-tools）
   - 设置类型为"command"
   - 设置命令为：

   **macOS/Linux:**
   ```bash
   npx @agentdeskai/browser-tools-mcp@1.2.0
   ```

   **Windows:**
   ```bash
   npx @agentdeskai/browser-tools-mcp@1.2.0
   ```

```json
{
  "mcpServers": {
    "browserTools": {
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp@latest"],
      "env": {
        "BROWSER_TOOLS_MCP_PORT": "3025",
        "BROWSER_TOOLS_MCP_HOST": "localhost"
      }
    }
  }
}
```

3. **确认连接**：
   - 等待几秒钟或点击刷新按钮
   - 确认 MCP 服务器已连接，应该看到所有工具列表和工具名称旁边的绿色圆圈

### 第四步：运行 BrowserTools 服务器

在终端中运行以下命令启动服务器（聚合来自 Chrome 扩展的日志并设置截图捕获的 WebSocket）：

```bash
npx @agentdeskai/browser-tools-server@1.2.0
```

> [!NOTE]
> browser-tools-server 运行在端口 3025 上。请确保终止在此端口上运行的任何进程。

### 第五步：打开 Chrome 开发者控制台

1. **打开开发者工具**：
   - 在任何网页上右键点击
   - 选择"检查"打开 Chrome 开发工具

2. **访问 BrowserTools 面板**：
   在开发者工具中，你可以导航到 BrowserTools 面板进行：
   - 手动截图
   - 定义截图保存路径（默认：`Downloads/mcp-screenshots`）
   - 清除所有保存的日志
   - 修改日志大小限制/截断设置

> [!WARNING]
> 每次刷新页面时，日志都会从服务器中清除。你可以通过点击 BrowserTools 面板中的"Wipe Logs"按钮手动清除日志。

## 使用方法

安装完成后，你可以在 Cursor 中使用自然语言与 BrowserTools MCP 交互：

### 调试相关
- "这个功能不工作...进入调试模式！"
- "检查控制台和网络日志，看看哪里出错了？"
- "UI 看起来不太对，能截个图吗？"

### 编辑和优化
- "你能编辑当前选中的元素来实现 x、y 和 z 吗？"
- "我需要改进 SEO 和性能...进入审计模式"

### 检查和监控
- "查看网络请求，看看 API 调用是否正常"
- "运行性能审计，找出页面加载缓慢的原因"

## 可用的 MCP 工具

BrowserTools MCP 提供了以下工具，你可以通过 AI 助手调用：

- `takeScreenshot`：截取当前浏览器标签页的截图
- `getConsoleLogs`：获取浏览器控制台日志
- `getConsoleErrors`：获取浏览器控制台错误
- `getNetworkLogs`：获取所有网络日志
- `getNetworkErrors`：获取网络错误日志
- `getSelectedElement`：获取当前选中的 DOM 元素
- `runAccessibilityAudit`：运行可访问性审计
- `runPerformanceAudit`：运行性能审计
- `runSEOAudit`：运行 SEO 审计
- `runBestPracticesAudit`：运行最佳实践审计
- `runNextJSAudit`：运行 NextJS 专用审计
- `runDebuggerMode`：进入调试模式
- `runAuditMode`：进入审计模式
- `wipeLogs`：清除所有浏览器日志

## 故障排除

### 常见问题

#### 1. 截图工具失败
确保使用明确的版本号：
```bash
npx @agentdeskai/browser-tools-mcp@1.2.0
```

#### 2. 找不到截图
截图默认保存在下载文件夹的 `/mcp-screenshots` 目录中。你也可以在 BrowserToolsMCP 开发工具面板中设置自定义路径。

#### 3. 看不到任何日志
确保在要捕获日志的浏览器标签页中打开 Chrome 开发工具控制台。

#### 4. 日志过多
关闭其他打开 Chrome 开发工具的标签页，BrowserToolsMCP 会捕获多个标签页的日志。

#### 5. 日志不断消失
每次刷新页面或重启运行 browser-tool-mcp 服务器的 Node 进程时，日志都会被清除。

### 调试 MCP 连接

如果遇到连接问题，可以运行以下命令监控 Cursor MCP 日志：

```bash
tail -n 20 -F ~/Library/Application\ Support/Cursor/**/*MCP.log
```

## 测试计划

为了充分验证 BrowserTools MCP 的功能，计划进行以下测试：

### 基础功能测试
- [ ] 截图功能测试
- [ ] 控制台日志获取测试
- [ ] 网络请求监控测试
- [ ] DOM 元素选择测试

### 审计功能测试
- [ ] SEO 审计功能测试
- [ ] 性能审计功能测试
- [ ] 可访问性审计测试
- [ ] NextJS 专用审计测试

### 智能模式测试
- [ ] 调试模式综合测试
- [ ] 审计模式综合测试

### 集成测试
- [ ] 与 Cursor 的集成稳定性测试
- [ ] 多标签页环境下的功能测试
- [ ] 长时间运行稳定性测试

## 结语

BrowserTools MCP 是一个革新性的工具，它极大地简化了 Web 开发中的调试和优化工作流程。通过将浏览器功能直接集成到 AI 代码编辑器中，开发者可以更高效地识别和解决问题。

后续我将对该工具的各项功能进行详细测试，并记录实际使用体验和最佳实践。

---

**参考资料：**
- [BrowserTools MCP 官方文档](https://browsertools.agentdesk.ai/installation)
- [GitHub 仓库](https://github.com/AgentDeskAI/browser-tools-mcp)
