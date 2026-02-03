# AI Agent 部署方案文档

## 📖 文档概述

本目录包含稿定 AI Agent 的完整技术方案文档，涵盖架构设计、消息系统、LangGraph 集成、业务功能和可观测性等核心模块。这些文档详细描述了 Agent 系统的设计思路、实现方案和最佳实践。

---

## 🗂️ 文档结构

```
ai-agent/
├── README.md                                        # 本文件：文档导航
├── 01-架构设计/                                     # 架构设计层
│   └── 网络架构.md                                  # 网关、服务、LLM 平台架构
├── 02-消息系统/                                     # 消息系统层
│   ├── 消息结构设计.md                              # 统一消息格式、状态消息
│   └── Completion接口与工具调用.md                  # Function Calling 实现
├── 03-LangGraph集成/                               # LangGraph 集成层
│   └── LangGraph接入方案.md                        # 工作流编排、中断与恢复
├── 04-业务功能/                                    # 业务功能层
│   └── 会话标题生成.md                              # 自动标题生成
├── 05-可观测性/                                    # 可观测性层
│   └── 链路追踪与监控.md                            # 日志、指标、告警
└── attachments/                                    # 图片附件
    ├── image2025-7-1_1-8-34.png
    ├── image2025-7-4_14-16-44.png
    └── ...
```

---

## 📚 阅读指南

### 方式一：按角色阅读

#### 技术负责人 / 架构师
1. **必读**：[网络架构](01-架构设计/网络架构.md)
   - 理解整体架构设计
   - 理解短连接和长连接分离策略
   - 理解 LLM 平台接入

2. **必读**：[消息结构设计](02-消息系统/消息结构设计.md)
   - 理解消息格式设计理念
   - 理解中断与恢复机制

3. **必读**：[LangGraph 接入方案](03-LangGraph集成/LangGraph接入方案.md)
   - 理解工作流编排
   - 理解状态管理

4. **推荐**：[链路追踪与监控](05-可观测性/链路追踪与监控.md)
   - 了解可观测性方案
   - 了解成本管控

#### 开发者（后端）
1. **必读**：[消息结构设计](02-消息系统/消息结构设计.md)
   - 掌握消息格式规范
   - 学习状态消息使用

2. **必读**：[Completion 接口与工具调用](02-消息系统/Completion接口与工具调用.md)
   - 学习工具调用实现
   - 理解不同模型适配

3. **必读**：[LangGraph 接入方案](03-LangGraph集成/LangGraph接入方案.md)
   - 学习 Node 开发规范
   - 掌握中断与恢复机制

4. **推荐**：[会话标题生成](04-业务功能/会话标题生成.md)
   - 学习异步任务处理
   - 了解降级策略

5. **推荐**：[链路追踪与监控](05-可观测性/链路追踪与监控.md)
   - 学习日志记录规范
   - 学习指标上报

#### 开发者（前端）
1. **必读**：[消息结构设计](02-消息系统/消息结构设计.md)
   - 掌握消息格式规范
   - 学习状态消息处理
   - 实现中断与恢复

2. **推荐**：[网络架构](01-架构设计/网络架构.md)
   - 了解 SSE 长连接
   - 了解请求链路

3. **推荐**：[链路追踪与监控](05-可观测性/链路追踪与监控.md)
   - 学习前端埋点

#### DevOps / 运维
1. **必读**：[网络架构](01-架构设计/网络架构.md)
   - 了解网关配置
   - 了解服务部署
   - 了解扩展策略

2. **必读**：[链路追踪与监控](05-可观测性/链路追踪与监控.md)
   - 配置监控指标
   - 配置告警规则
   - 分析系统性能

3. **推荐**：[LangGraph 接入方案](03-LangGraph集成/LangGraph接入方案.md)
   - 了解状态存储
   - 了解 Checkpoint 管理

### 方式二：按顺序阅读

#### 第一阶段：理解架构（20-30分钟）
1. [网络架构](01-架构设计/网络架构.md)
   - 整体架构设计
   - 服务分层
   - 调用链路

#### 第二阶段：掌握消息系统（30-40分钟）
2. [消息结构设计](02-消息系统/消息结构设计.md)
   - 消息格式规范
   - 状态消息
   - 中断与恢复

3. [Completion 接口与工具调用](02-消息系统/Completion接口与工具调用.md)
   - Function Calling 机制
   - 工具调用流程
   - 多模型适配

#### 第三阶段：掌握 LangGraph（40-50分钟）
4. [LangGraph 接入方案](03-LangGraph集成/LangGraph接入方案.md)
   - LangGraph 集成
   - 节点级和工具级中断
   - 状态管理

#### 第四阶段：业务功能（20-30分钟）
5. [会话标题生成](04-业务功能/会话标题生成.md)
   - 异步任务处理
   - 降级策略

#### 第五阶段：可观测性（30-40分钟）
6. [链路追踪与监控](05-可观测性/链路追踪与监控.md)
   - 日志采集
   - 监控指标
   - 告警规则

---

## 🎯 核心概念速览

### 网络架构
- **集群隔离**：短连接集群 vs 长连接集群
- **网关分离**：Kong 短连接 vs Kong SSE 专用
- **服务分层**：网关 → 服务 → AI 能力 → LLM 平台

### 消息系统
- **统一格式**：不依赖特定 LLM 的消息格式
- **状态消息**：role = status，用于控制指令
- **中断与恢复**：通过状态码实现可恢复的中断

### LangGraph
- **工作流编排**：Node 组成 Graph，实现复杂流程
- **节点级中断**：使用 NodeInterrupt 异常
- **工具级中断**：状态记录在 messages 中
- **Checkpoint**：序列化状态，支持恢复

### 工具调用
- **统一格式**：`<tool_call>` 标签 + JSON
- **流式解析**：支持流式输出中解析工具调用
- **多模型适配**：统一不同 LLM 的工具调用格式

---

## 🚀 快速开始

### 开发者快速开始

**1. 理解消息格式**
```json
{
  "thread_id": "thread_abc123",
  "message_id": "msg_001",
  "role": "user",
  "content": {
    "type": "plain",
    "text": "帮我生成一张牙膏产品图"
  },
  "input_skill_id": 2
}
```

**2. 处理状态消息**
```python
def handle_status_message(status_message):
    code = status_message['content']['code']
    
    if code == -1002:  # 稿豆不足
        # 提示用户充值
        pass
    elif code == -1004:  # Token 过期
        # 刷新 token
        pass
```

**3. 实现 LangGraph Node**
```python
def my_node(state):
    # 准备工作（可重复执行）
    context = prepare_context(state)
    
    # 调用 GaodingAssistant（只执行一次）
    assistant = GaodingAssistant()
    result = assistant.run(context)
    
    return {"messages": result}
```

**4. 记录日志**
```python
log_checkpoint(
    event="request_execute_begin",
    trace_id=trace_id,
    thread_id=thread_id,
    user_id=user_id,
    data={"text": user_query, "is_new": True}
)
```

---

## 📋 架构设计原则

### 集群隔离

| 维度 | 短连接集群 | 长连接集群 |
|------|-----------|-----------|
| 超时时间 | 60s | 15mins |
| QPS | 高 | 中低 |
| 资源占用 | 低 | 高 |
| 适用场景 | 快速查询 | 复杂任务 |

### 消息设计

**DO：**
- ✅ 使用统一的消息格式
- ✅ 消息创建后不可修改
- ✅ 使用状态消息传递控制指令
- ✅ 记录本地 ID 便于前端关联

**DON'T：**
- ❌ 直接使用 LLM 的消息格式
- ❌ 修改已创建的消息
- ❌ 在消息中存储大文件

### Node 开发

**约定：**
1. 使用 GaodingAssistant 调用 LLM 和工具
2. Node 里最多只有一次 `GaodingAssistant.run`
3. run 之前的代码可重复运行
4. 状态用 messages 承载

---

## 🔄 关键流程

### 消息流转

```
用户输入 
  → Agent 接收 (request_execute_begin)
  → LangGraph 编排
  → Node 执行 (node_execute_begin/end)
  → LLM 调用 (llm_execute_begin/end)
  → 工具调用 (tool_execute_begin/end)
  → 流式响应
  → 请求完成 (request_execute_end)
```

### 中断与恢复

```
正常执行 
  → 检测中断条件（如稿豆不足）
  → 抛出 NodeInterrupt
  → 保存 Checkpoint
  → 返回状态消息 (-1002)
  → 用户充值
  → 前端发送恢复消息 (-2001)
  → 加载 Checkpoint
  → 从中断点恢复
```

### 工具调用

```
LLM 输出 
  → 解析 <tool_call> 标签
  → 提取工具名称和参数
  → 调用工具
  → 返回结果
  → 继续 LLM 生成
```

---

## 💡 最佳实践

### 错误处理

```python
def safe_execute(func):
    """安全执行装饰器"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except NodeInterrupt as e:
            # 中断异常，保存状态
            save_checkpoint()
            raise
        except Exception as e:
            # 其他异常，记录日志
            logging.error(f"Execution failed: {e}")
            return error_response(str(e))
    return wrapper
```

### 日志记录

```python
# 使用结构化日志
log_checkpoint(
    event="llm_execute_end",
    trace_id=trace_id,
    data={
        "llm_calls_num": 1,
        "prompt_tokens": 150,
        "completion_tokens": 80
    }
)
```

### 性能优化

```python
# 使用缓存
@lru_cache(maxsize=1000)
def get_tool_description(tool_name):
    return generate_tool_description(tool_name)

# 并行执行
async def parallel_tool_calls(tool_calls):
    tasks = [call_tool(tc) for tc in tool_calls]
    return await asyncio.gather(*tasks)
```

---

## 🔗 相关资源

### 外部资源

**LangGraph：**
- 官方文档：https://langchain-ai.github.io/langgraph/
- GitHub：https://github.com/langchain-ai/langgraph

**LangChain：**
- 官方文档：https://python.langchain.com/
- 工具调用：https://python.langchain.com/docs/modules/agents/tools/

**Dify：**
- 官方文档：https://docs.dify.ai/
- Workflow 编排：https://docs.dify.ai/features/workflow

---

## ❓ 常见问题

### Q1: 为什么要自定义消息格式？
**A:** LLM 的消息格式不统一，且缺少状态管理和业务扩展字段。自定义消息格式可以：
- 统一不同 LLM 的格式
- 支持状态管理（中断与恢复）
- 扩展业务字段
- 完整回溯状态

### Q2: 什么时候触发中断？
**A:** 中断场景包括：
- 稿豆不足（-1002）
- Token 过期（-1004）
- 内容安全风险（-1006）
- LLM/工具调用超限（-1003）

### Q3: 如何实现工具调用？
**A:** 工具调用流程：
1. 在 System Prompt 注入工具描述
2. LLM 生成 `<tool_call>` 标签
3. 流式解析工具调用
4. 执行工具并返回结果

### Q4: Checkpoint 存储在哪？
**A:** Checkpoint 单独存放，和 thread_id 关联。不建议存储在 messages 中，因为：
- Checkpoint 体积较大（可能几百 KB）
- 只临时性使用一次
- 与业务消息分离

### Q5: Node 开发有什么限制？
**A:** Node 开发约定：
- 最多只有一次 `GaodingAssistant.run`
- run 之前的代码可重复运行（幂等）
- 不要在 run 之前执行副作用操作（如数据库写入）

### Q6: 如何监控 Agent 性能？
**A:** 关键指标：
- **成功率**：请求完成率、工具调用成功率
- **延迟**：首响应延迟、请求处理时长
- **成本**：Token 消耗、稿豆消耗
- **业务**：技能使用率、采纳率

---

## 📝 开发规范

### 消息处理

```python
# ✅ 正确
def handle_message(message):
    if message['role'] == 'status':
        handle_status_message(message)
    elif message['role'] == 'user':
        process_user_message(message)
    # ...

# ❌ 错误
def handle_message(message):
    # 直接修改消息
    message['processed'] = True  # ❌ 消息不可变
```

### 工具注册

```python
# ✅ 正确
registry = ToolRegistry()
registry.register(ImageGenerationTool())
registry.register(SearchTool())

# ❌ 错误
tools = [ImageGenerationTool(), SearchTool()]  # ❌ 缺少统一管理
```

### 日志记录

```python
# ✅ 正确
log_checkpoint(
    event="tool_execute_begin",
    trace_id=trace_id,
    data={"func_name": "generate_image", "params": {...}}
)

# ❌ 错误
print(f"Tool called: {tool_name}")  # ❌ 缺少结构化信息
```

---

## 📅 更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|---------|--------|
| v1.0 | 2025-01-26 | 初始版本，整合 Agent 部署方案 | AI |

---

## 📞 联系方式

- **技术问题**：联系 AI Agent 团队
- **架构问题**：联系技术负责人
- **工具问题**：提交 Issue 或联系 DevOps

---

*最后更新：2025-01-26*
