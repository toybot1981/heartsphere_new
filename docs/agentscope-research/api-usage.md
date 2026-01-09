# AgentScope Java API 使用指南

## 概述

本文档记录 AgentScope Java 框架的关键 API 使用方式和最佳实践。

**注意**：部分 API 细节基于推测和示例代码，需要通过实际原型验证确认。

## Maven 依赖

```xml
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope</artifactId>
    <version>1.0.5</version>
</dependency>
```

**两种引入方式**：
1. **All-in-One（推荐）**：单一依赖，默认带 DashScope SDK
2. **Core + 扩展**：按需引入，依赖最小化

## 1. 创建 ReActAgent

### 基础创建

```java
import io.agentscope.core.ReActAgent;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.message.Msg;

ReActAgent agent = ReActAgent.builder()
    .name("Assistant")
    .sysPrompt("你是一个有帮助的 AI 助手。")
    .model(DashScopeChatModel.builder()
        .apiKey(System.getenv("DASHSCOPE_API_KEY"))
        .modelName("qwen-max")
        .build())
    .build();
```

### 配置选项（待确认）

**可能支持的配置**：
- `.name(String)` - Agent 名称
- `.sysPrompt(String)` - 系统提示词
- `.model(ChatModel)` - 模型适配器
- `.tools(List<Tool>)` - 工具列表
- `.planner(Planner)` - 任务规划器（可选）
- `.memory(Memory)` - 长期记忆（可选）
- `.hooks(Hooks)` - 钩子函数（可选）

## 2. 调用 Agent

### 同步调用

```java
Msg userMsg = Msg.builder()
    .textContent("你好！")
    .build();

Msg response = agent.call(userMsg).block();

String text = response.getTextContent();
System.out.println("响应: " + text);
```

**注意事项**：
- `.call()` 可能返回 `Mono<Msg>`（响应式类型）
- 需要使用 `.block()` 等待结果
- 或者使用响应式方式处理

### 流式调用（待确认具体 API）

```java
// 方式 1：响应式流
agent.callStream(userMsg)
    .doOnNext(chunk -> {
        // 处理每个 chunk
        String content = chunk.getTextContent();
        System.out.print(content);
    })
    .doOnComplete(() -> {
        System.out.println("\n完成");
    })
    .block();

// 方式 2：回调方式（如果支持）
agent.callStream(userMsg, (chunk) -> {
    String content = chunk.getTextContent();
    System.out.print(content);
});
```

## 3. 工具集成

### 创建工具

```java
public class MyTool implements Tool {
    @Override
    public String getName() {
        return "my_tool";
    }
    
    @Override
    public String getDescription() {
        return "工具描述，Agent 会根据描述决定是否调用";
    }
    
    @Override
    public ToolResult call(String input) {
        // 解析输入（可能是 JSON 字符串）
        // 执行工具逻辑
        // 返回结果
        return ToolResult.success("执行结果");
    }
}
```

### 注册工具

```java
List<Tool> tools = Arrays.asList(
    new CommandTool(commandExecutor),
    new ComputerUseTool(computerUseExecutor),
    new ScriptTool(scriptExecutor)
);

ReActAgent agent = ReActAgent.builder()
    .name("Mentis")
    .model(createModel())
    .tools(tools)
    .build();
```

**工具描述**（待确认）：
- Agent 根据工具描述决定是否调用
- 可能需要 JSON Schema 描述参数
- 工具调用是自动的，无需手动编排

## 4. 模型适配器

### DashScopeChatModel

```java
DashScopeChatModel model = DashScopeChatModel.builder()
    .apiKey(System.getenv("DASHSCOPE_API_KEY"))
    .modelName("qwen-max")
    .temperature(0.7)  // 待确认
    .maxTokens(2000)   // 待确认
    .build();
```

**配置选项**（待确认）：
- API Key
- Model Name（如：qwen-max, qwen-plus 等）
- Temperature
- Max Tokens
- Top-p
- 其他参数

### 其他模型适配器（待确认）

- OpenAIChatModel
- 其他模型适配器

## 5. 消息（Msg）

### 创建消息

```java
Msg msg = Msg.builder()
    .textContent("用户消息")
    .sessionId("session_123")
    .context(contextMap)
    .build();
```

**消息属性**（待确认）：
- textContent - 文本内容
- sessionId - 会话 ID
- context - 上下文信息
- 其他元数据

## 6. 响应处理

### 同步响应

```java
Msg response = agent.call(userMsg).block();

// 提取文本内容
String text = response.getTextContent();

// 检查工具调用
if (response.isToolCall()) {
    String toolName = response.getToolName();
    String toolInput = response.getToolInput();
}

// 其他响应属性（待确认）
```

### 流式响应

```java
agent.callStream(userMsg)
    .doOnNext(chunk -> {
        if (chunk.hasContent()) {
            String content = chunk.getTextContent();
            // 处理部分内容
        }
        if (chunk.isToolCall()) {
            // 处理工具调用
        }
    })
    .block();
```

## 7. Spring Boot 集成

### 作为 Spring Bean（待验证）

```java
@Configuration
public class AgentScopeConfig {
    
    @Bean
    public ReActAgent mentisAgent(@Value("${agentscope.api-key}") String apiKey) {
        return ReActAgent.builder()
            .name("Mentis")
            .sysPrompt("你是 Mentis 助手...")
            .model(DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen-max")
                .build())
            .build();
    }
}
```

### 配置管理

```yaml
# application.yml
agentscope:
  api-key: ${DASHSCOPE_API_KEY}
  model-name: qwen-max
  agent-name: Mentis
```

## 8. 错误处理

```java
try {
    Msg response = agent.call(userMsg).block();
} catch (Exception e) {
    // 处理错误
    log.error("Agent 调用失败", e);
}
```

**错误类型**（待确认）：
- 网络错误
- API 错误
- 模型错误
- 工具执行错误

## 9. 最佳实践

### 1. 系统提示词设计

- 清晰描述 Agent 的角色和能力
- 说明可用工具及其用途
- 定义响应格式和要求

### 2. 工具设计

- 工具描述要清晰准确
- 工具功能要单一明确
- 工具返回值要有结构

### 3. 错误处理

- 使用 try-catch 处理异常
- 提供友好的错误消息
- 记录详细的错误日志

### 4. 性能优化

- 合理设置模型参数
- 优化工具调用频率
- 使用流式响应提升体验

## 待确认问题

1. **API 签名**：具体的包名、类名、方法签名
2. **返回值类型**：确切的数据类型
3. **配置选项**：所有可用的配置项
4. **错误处理**：具体的异常类型和处理方式
5. **Spring Boot 集成**：最佳实践

## 下一步

1. 创建原型代码验证 API
2. 补充完整的 API 文档
3. 更新最佳实践

## 参考资源

- 官方文档：https://java.agentscope.io/zh/intro.html
- API 参考：https://runtime.agentscope.io/zh/api/index.html
- GitHub：https://github.com/agentscope-ai/agentscope-java

## 最后更新

2026-01-09 - 初始 API 使用指南，基于已知信息和推测
