# AgentScope Java API 参考笔记

## 官方资源

- **API 文档**：https://runtime.agentscope.io/zh/api/index.html
- **GitHub 仓库**：https://github.com/agentscope-ai/agentscope-java
- **官方文档**：https://java.agentscope.io/zh/intro.html

## 核心 API

### ReActAgent

#### 创建 Agent

```java
// 基础示例（基于用户提供的信息）
ReActAgent agent = ReActAgent.builder()
    .name("Assistant")
    .sysPrompt("你是一个有帮助的 AI 助手。")
    .model(DashScopeChatModel.builder()
        .apiKey(System.getenv("DASHSCOPE_API_KEY"))
        .modelName("qwen-max")
        .build())
    .build();
```

**Builder 方法**（待确认具体 API）：
- `.name(String name)` - 设置 Agent 名称
- `.sysPrompt(String prompt)` - 设置系统提示词
- `.model(ChatModel model)` - 设置模型适配器
- `.tools(List<Tool> tools)` - 注册工具列表
- `.planner(Planner planner)` - 配置任务规划器（可选）
- `.memory(Memory memory)` - 配置长期记忆（可选）

#### 调用方法

**同步调用**：
```java
Msg response = agent.call(Msg.builder()
    .textContent("你好！")
    .build()).block();
String text = response.getTextContent();
```

**流式调用**：
```java
// 具体 API 待确认
agent.callStream(userMsg, (chunk) -> {
    // 处理流式数据
});
```

**关键问题**：
- `.call()` 的返回值类型（Mono<Msg> 或其他？）
- `.callStream()` 的具体签名
- 流式回调的参数类型

### Tool 接口

**定义**（待确认）：
```java
public interface Tool {
    // 具体方法待确认
    ToolResult call(String input);
    String getName();
    String getDescription();
}
```

**实现示例**（待完善）：
```java
public class MyTool implements Tool {
    @Override
    public ToolResult call(String input) {
        // 工具执行逻辑
        return ToolResult.success(result);
    }
    
    @Override
    public String getName() {
        return "my_tool";
    }
    
    @Override
    public String getDescription() {
        return "工具描述";
    }
}
```

**关键问题**：
- Tool 接口的完整定义
- ToolResult 的类型和结构
- 工具参数的定义方式（是否需要 JSON Schema？）

### ChatModel（模型适配器）

#### DashScopeChatModel

```java
DashScopeChatModel model = DashScopeChatModel.builder()
    .apiKey(System.getenv("DASHSCOPE_API_KEY"))
    .modelName("qwen-max")
    .build();
```

**配置选项**（待确认）：
- API Key
- Model Name
- Temperature
- Top-p
- Max tokens
- 其他参数

#### 其他模型适配器

- OpenAIChatModel（待确认）
- 其他模型（待确认）

### Msg（消息）

**创建消息**（推测）：
```java
Msg msg = Msg.builder()
    .textContent("消息内容")
    .sessionId("session_id")
    .context(context)
    .build();
```

**消息属性**（待确认）：
- textContent
- sessionId
- context
- 其他属性

### 流式响应处理

**API 签名**（待确认）：
```java
// 可能的实现方式
agent.callStream(msg)
    .doOnNext(chunk -> {
        // 处理每个 chunk
    })
    .doOnComplete(() -> {
        // 流式完成
    })
    .doOnError(error -> {
        // 错误处理
    })
    .block();
```

**Chunk 类型**（待确认）：
- 包含部分响应文本
- 包含工具调用信息
- 其他元数据

## 待确认的 API 细节

### 1. ReActAgent API

- [ ] `.builder()` 的完整参数列表
- [ ] `.call()` 的返回值类型和处理方式
- [ ] `.callStream()` 的完整签名
- [ ] 钩子函数的配置方式
- [ ] 结构化输出的配置方式

### 2. Tool API

- [ ] Tool 接口的完整定义
- [ ] 工具参数的描述方式
- [ ] 工具返回值的格式
- [ ] 工具注册方式

### 3. 模型适配器 API

- [ ] DashScopeChatModel 的完整配置选项
- [ ] 其他模型适配器的支持情况
- [ ] 模型调用的异步处理

### 4. 消息和响应 API

- [ ] Msg 的完整属性和构建方式
- [ ] 响应类型和处理方式
- [ ] 流式响应的数据结构

### 5. 会话和记忆 API

- [ ] Session 的使用方式
- [ ] Memory 的配置和使用
- [ ] 上下文管理的 API

## 下一步行动

1. **访问官方 API 文档**：https://runtime.agentscope.io/zh/api/index.html
2. **查看 GitHub 仓库示例**：https://github.com/agentscope-ai/agentscope-java
3. **创建原型代码验证**：通过实际代码确认 API
4. **补充完整 API 文档**：基于验证结果更新此文档

## 参考资源

- API 文档：https://runtime.agentscope.io/zh/api/index.html
- 快速开始：https://java.agentscope.io/zh/quickstart/agent.html
- GitHub 仓库：https://github.com/agentscope-ai/agentscope-java

## 最后更新

2026-01-09 - 初始 API 参考框架，待补充具体 API 细节
