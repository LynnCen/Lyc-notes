# 07 - Agent工作流程

> **导航**：[📚 返回总目录](./README.md) | [⬅️ 上一篇：AI对话系统核心技术](./06-AI对话系统核心技术.md) | [➡️ 下一篇：AI工具实现指南](./08-AI工具实现指南.md)
>
> **所属**：AI+ 智能设计编辑器架构文档
>
> **核心价值**：了解Agent编排、Dify集成和大模型调用的完整链路

---

## 一、Agent架构全景

系统采用 **Agent-X 架构**，这是一个基于 Ant Design X 改造的 Vue 2.7 兼容版本。

```
┌─────────────────────────────────────────────────────────────┐
│  用户层                                                       │
│  ChatSender (输入框) → 用户输入提示词                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Agent 编排层                                                 │
│  useXAgent (Agent 核心)                                      │
│    ├─ request()          → 处理请求                          │
│    ├─ onUpdate()         → 实时更新                          │
│    └─ onSuccess()        → 完成回调                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  网络通信层                                                   │
│  createSSEConnection() → Dify Agent 后端                     │
│    POST /api/gdesign/tool/v1/dify/chat                      │
│    Body: {                                                   │
│      scene_code: 'ai-chat',                                  │
│      query: '用户输入',                                       │
│      arguments: {                                            │
│        think: 0/1,           ← 是否开启深度思考(R1模型)      │
│        history_text: '...'   ← 历史对话(最多30组)            │
│      }                                                       │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Dify Workflow 编排层 (后端)                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ 1️⃣ PE增强    │ → │ 2️⃣ 大模型调用 │ → │ 3️⃣ 工具路由   │   │
│  │ Prompt Eng  │   │ DeepSeek API │   │ Tool Calling │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  大模型层                                                     │
│  DeepSeek-V3 / DeepSeek-R1                                  │
│  ├─ 理解用户意图                                             │
│  ├─ 决策需要调用哪些工具                                      │
│  └─ 返回 function_call / text                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  工具执行层                                                   │
│  Tool Functions (后端)                                       │
│  ├─ draw          → 文生图                                   │
│  ├─ redraw        → 图生图                                   │
│  ├─ writer        → 文案生成                                 │
│  ├─ material      → 素材推荐                                 │
│  ├─ cutout        → AI抠图                                   │
│  └─ ...           → 更多工具                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  结果返回层 (SSE 流式推送)                                    │
│  event: workflow_started   → 任务开始                        │
│  event: message            → AI文本输出(流式)                │
│  event: message (thinking) → R1思考过程                      │
│  event: workflow_finished  → 任务完成                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  前端响应层                                                   │
│  MessageHandler → PlaceholderManager → ElementAddService     │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、完整请求流程

### 2.1 用户发起请求（前端）

```typescript
// packages/business-sdks/ai-chat/src/hook/use-message.ts

const [agent] = useXAgent<MessageType>({
  request: async ({ message }, { onSuccess, onUpdate }) => {
    // 1️⃣ 创建默认响应消息（立即显示加载状态）
    const defaultAnswerMessage: MessageType = {
      content: '',
      id: uuidv4(),
      role: MESSAGE_ROLE.ASSISTANT,
      status: MESSAGE_STATUS.LOADING,
      reasoningContent: '', // R1 模型的思考内容
      taskId: '',
      thinkingElapsedMs: 0, // 思考耗时
      model: isThink.current ? 'deepseek-r1' : 'deepseek-v3',
      model_config: {
        think: isThink.current, // 是否开启深度思考
      },
    };

    // 2️⃣ 立即更新 UI（显示加载状态）
    onUpdate(defaultAnswerMessage);

    // 3️⃣ 建立 SSE 连接
    sseConnection = await createSSEConnection({
      message: message.content, // 用户输入
      messageList: messagesRef.current, // 历史消息（最多30组）
      isThink: isThink.current, // 是否使用 R1
      onError: handleError,
      isOnline,
    });

    // 4️⃣ 监听 SSE 流
    sseConnection.listen((data: SSEMessageType) => {
      onListen(data);
    });
  },
});
```

**关键设计**：

1. **立即反馈**：`onUpdate()` 立即调用，用户看到"AI思考中"，不等待网络请求
2. **历史消息管理**：只发送最近30组对话（60条消息），避免Token超限
3. **模型选择**：
   - `deepseek-v3`：快速响应（1-2秒）
   - `deepseek-r1`：深度思考（5-10秒），质量更高

### 2.2 建立SSE连接（前端→后端）

```typescript
export async function createSSEConnection(options) {
  const { message, messageList, isThink } = options;

  // 1️⃣ 构造历史消息
  let history_text: Array<MessageType> = [];
  if (messageList && messageList.length > 0) {
    const sliceMessage = messageList.slice(-60); // 最多 30 组
    history_text = sliceMessage.filter((it) => {
      return [MESSAGE_ROLE.ASSISTANT, MESSAGE_ROLE.USER].includes(it.role) && !it.error;
    });
  }

  // 2️⃣ 发送 POST 请求到 Dify 后端
  const response = await fetch(`${baseUrl}/api/gdesign/tool/v1/dify/chat`, {
    method: 'post',
    body: JSON.stringify({
      scene_code: 'ai-chat', // 场景标识
      aigc_type: 'aigc', // AIGC 类型
      query: message, // 用户输入
      arguments: {
        think: isThink ? 1 : 0, // 是否开启 R1 思考
        history_text:
          history_text.length > 0
            ? JSON.stringify(history_text).replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
            : '',
      },
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
    },
  });

  // 3️⃣ 返回流式读取接口
  return {
    async listen(callback) {
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        let text = decoder.decode(value);
        // 处理JSON分段...
        callback(data);
        if (done) break;
      }
    },
    close() {
      reader.cancel();
    },
  };
}
```

---

## 三、Dify Workflow处理（后端）

> **注意**：Dify是后端黑盒，以下是基于前端接口和经验的推断，**不涉及具体实现**。

**推测的工作流程**：

```
Node 1: 接收请求
  ├─ 解析 query、history_text、think 参数
  ├─ 生成 task_id
  └─ 发送 workflow_started 事件

Node 2: Prompt Engineering
  ├─ 注入系统提示词："你是稿定AI的智能设计助手..."
  ├─ 格式化历史对话
  ├─ 注入工具定义（Tool Definitions）
  └─ Few-Shot 示例（可选）

Node 3: 大模型调用
  ├─ 选择模型（deepseek-v3 / deepseek-r1）
  ├─ 构造请求参数（messages、tools、temperature）
  └─ 调用 DeepSeek API

Node 4: 流式响应处理
  ├─ 接收模型输出（SSE流）
  ├─ 识别思考过程（<thinking>...</thinking>）
  ├─ 识别工具调用（tool_calls）
  └─ 转发给前端（SSE推送）

Node 5: 工具执行（如果有 tool_calls）
  ├─ 解析 tool_name 和 arguments
  ├─ 路由到对应的工具服务
  │   draw → 图片生成服务（SD/Flux）
  │   writer → 文案生成服务（GPT/Claude）
  ├─ 等待工具执行完成
  └─ 将结果返回给模型（继续对话）

Node 6: 完成响应
  ├─ 发送 workflow_finished 事件
  ├─ 记录对话历史
  └─ 关闭 SSE 连接
```

---

## 四、DeepSeek模型对比

| 特性 | DeepSeek-V3 | DeepSeek-R1 |
|------|-------------|-------------|
| **响应速度** | 快速（1-2秒首字） | 较慢（2-5秒首字，需思考时间） |
| **思考过程** | 无 | 有（`<thinking>...</thinking>`） |
| **输出质量** | 标准 | 更高（经过推理） |
| **Token消耗** | 较少 | 较多（思考过程消耗额外Token） |
| **适用场景** | 快速响应、简单任务 | 复杂推理、多步骤任务 |
| **用户选择** | 默认模式 | 开启"深度思考"开关 |

**R1模型的思考示例**：

```
用户输入："帮我设计一张科技公司的海报"

<thinking>
分析：
1. 用户需求：科技公司海报
2. 关键要素：
   - 主题：科技感
   - 目标：展示公司专业性
   - 风格：现代、简约、蓝色调
3. 推荐方案：
   - 使用16:9比例（适合展示）
   - 风格选择"3d"或"realistic"
   - 提示词增强：添加"高科技"、"未来感"等关键词
4. 需要的工具：draw
5. 参数构造：
   - prompt: "科技公司海报，蓝色调，高科技，未来感，专业，简约"
   - ratio: "16:9"
   - style: "3d"
</thinking>

好的，我来帮您设计一张科技公司海报。我会生成一张16:9比例的海报，风格偏向现代科技感。
```

---

## 五、前端处理SSE事件

```typescript
const onListen = (data: SSEMessageType) => {
  // 1️⃣ 任务开始
  if (data.event === 'workflow_started') {
    currentTaskId.current = data.task_id;
    toolLifecycleTracker.conflateStart({
      work_number: getUserMessageNumber(messagesRef.current),
      work_id: contentId,
    });
  }

  // 2️⃣ 文本消息（流式累加）
  if (data.event === 'message') {
    content += data.answer ?? '';

    // 识别思考标签（R1 模型）
    if (data.answer?.includes('<thinking>')) {
      isThinkTagContainer = true;
      thinkingStartTime = Date.now();
    }
    if (data.answer?.includes('</thinking>')) {
      isThinkTagContainer = false;
      defaultAnswerMessage.thinkingElapsedMs = Date.now() - thinkingStartTime;
    }

    // 实时更新 UI
    onUpdate({ ...defaultAnswerMessage, content });
  }

  // 3️⃣ 错误处理
  if (data.event === 'answer_error') {
    let errorContent = SYSTEM_ERROR_TIP;
    if (data.code === PROHIBITION_CODE) {
      errorContent = PROHIBITION_TIP; // 内容违规
    }
    onSuccess({
      ...defaultAnswerMessage,
      content: errorContent,
      status: MESSAGE_STATUS.FINISHED,
      error: true,
    });
    return;
  }

  // 4️⃣ 任务完成
  if (data.event === 'workflow_finished') {
    // 提取思考内容
    let reasoningContent = '';
    const matches = content.match(/<thinking>[\s\S]*?<\/thinking>/g);
    if (matches?.[0]) {
      reasoningContent = matches[0];
    }

    onSuccess({
      ...defaultAnswerMessage,
      content,
      reasoningContent,
      status: MESSAGE_STATUS.FINISHED,
    });

    // 埋点：任务完成
    toolLifecycleTracker.conflateCompleted({
      work_number: getUserMessageNumber(messagesRef.current),
      work_id: contentId,
    });

    // 自动保存
    saveTemplate({ message: messagesRef.current, isThink: isThink.current });
  }
};
```

---

## 六、Tool Calling机制

### 6.1 工具定义与注册

```typescript
// domains/editor/extensions/ai/src/utils/functions.ts

class AIFunctionsManager {
  private functions: ToolFunc[] = [];

  constructor() {
    this.setFunctions([
      'draw', // 文生图
      'redraw', // 图生图
      'writer', // 文案生成
      'product', // 产品图生成
      'material', // 素材推荐
      'inPaintRemove', // 智能消除
      'outPaintExpand', // 图片扩展
      'cutout', // AI抠图
      'imageToTemplate', // 图文分层
      // ... 更多工具
    ]);
  }
}
```

### 6.2 Tool Schema（传给大模型的定义）

大模型需要知道每个工具的作用和参数，Dify会生成类似这样的Schema：

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "draw",
        "description": "根据文字描述生成图片，支持多种风格和比例",
        "parameters": {
          "type": "object",
          "properties": {
            "prompt": {
              "type": "string",
              "description": "图片描述，尽量详细"
            },
            "ratio": {
              "type": "string",
              "enum": ["1:1", "16:9", "9:16", "4:3", "3:4"]
            },
            "style": {
              "type": "string",
              "enum": ["realistic", "anime", "3d", "sketch"]
            },
            "num": {
              "type": "integer",
              "default": 1,
              "maximum": 4
            }
          },
          "required": ["prompt"]
        }
      }
    }
  ]
}
```

---

## 七、核心方法说明

### 7.1 useXAgent（Agent核心）

```typescript
export function useXAgent(config) {
  const { request, onSuccess, onError, onUpdate } = config;
  const isRequesting = ref(false);

  const run = async (params) => {
    isRequesting.value = true;
    try {
      await request(params, {
        onSuccess: (data) => {
          isRequesting.value = false;
          onSuccess?.(data);
        },
        onUpdate: (data) => {
          onUpdate?.(data); // 流式更新
        },
        onError: (error) => {
          isRequesting.value = false;
          onError?.(error);
        },
      });
    } catch (error) {
      isRequesting.value = false;
      onError?.(error);
    }
  };

  return [{ request: run, isRequesting: () => isRequesting.value }];
}
```

**核心价值**：
- 统一的请求管理
- 内置loading状态
- 统一的错误处理
- 支持流式更新

### 7.2 toolLifecycleTracker（工具生命周期追踪）

```typescript
export function createToolLifecycleTracker() {
  return {
    // 任务开始
    conflateStart(params) {
      windAPI.tracker('aigc_tool_init', {
        ...params,
        timestamp: Date.now(),
      });
    },

    // 任务完成
    conflateCompleted(params) {
      windAPI.tracker('aigc_tool_complete', {
        ...params,
        timestamp: Date.now(),
      });
    },
  };
}
```

**核心价值**：
- 埋点追踪，分析用户行为
- 计算任务耗时
- 监控成功率

---

## 八、下一步

阅读完本章后，您应该：

1. ✅ 理解了Agent架构的整体设计
2. ✅ 掌握了从用户输入到AI响应的完整链路
3. ✅ 了解了Dify Workflow的工作原理（推测）
4. ✅ 理解了Tool Calling机制

**推荐阅读顺序**：

- **上一篇**：[06-AI对话系统核心技术](./06-AI对话系统核心技术.md) - 理解消息格式和SSE
- **下一篇**：[08-AI工具实现指南](./08-AI工具实现指南.md) - 学习具体AI工具的前端实现

---

> **本章完成！** 您已经理解了Agent工作流程的核心环节。
