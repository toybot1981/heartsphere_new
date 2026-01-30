# AgentScope Java SDK 集成指南

## 概述

本文档说明如何将 AgentScope Java SDK 集成到多智能体系统中，使我们的 Agent 能够利用 AgentScope 的 ReAct 推理能力。

## 架构设计

### 适配器模式

我们使用适配器模式将我们的 `Agent` 接口适配到 AgentScope 的 `ReActAgent`：

```
我们的 Agent 接口
    ↓ (适配)
AgentScopeAdapter
    ↓ (包装)
ReActAgent (AgentScope)
```

### 核心组件

1. **AgentScopeAdapter** - 适配器，将我们的 Agent 包装为 ReActAgent
2. **AgentScopeAgentWrapper** - 包装器，同时实现我们的 Agent 接口和包装 ReActAgent
3. **AgentScopeOrchestrator** - 编排器，使用 AgentScope 进行多智能体协作
4. **AgentScopeConfig** - 配置类，管理 AgentScope 相关配置

## 配置

### application.yml

```yaml
multiagent:
  agentscope:
    enabled: true
    dashscope-api-key: ${DASHSCOPE_API_KEY}
    model-name: qwen-max
    stream: false
    max-iters: 10
```

### 环境变量

```bash
export DASHSCOPE_API_KEY=your-api-key-here
```

## 使用方式

### 自动包装

系统启动时，`LifeAssistantAgentScopeConfig` 会自动将所有生活助手 Agent 包装为 AgentScope ReActAgent：

```java
@PostConstruct
public void wrapAgentsWithAgentScope() {
    // 自动包装所有生活助手 Agent
    wrapAgent("shixiaoguang", new ShiXiaoGuangAgent(skillExecutor));
    // ...
}
```

### 手动包装

如果需要手动包装 Agent：

```java
@Autowired
private AgentScopeAdapter adapter;

@Autowired
private AgentRegistry agentRegistry;

public void wrapAgent(Agent agent) {
    // 包装为 ReActAgent
    ReActAgent reactAgent = adapter.wrapAgent(agent);
    
    // 创建包装器
    AgentScopeAgentWrapper wrapper = new AgentScopeAgentWrapper(
        agent, reactAgent, adapter
    );
    
    // 注册到 AgentRegistry
    agentRegistry.register(wrapper);
}
```

### 使用 AgentScope 编排器

```java
@Autowired
private AgentScopeOrchestrator orchestrator;

public void collaborate() {
    List<Agent> agents = Arrays.asList(agent1, agent2);
    String task = "我想提高工作效率";
    
    CompletableFuture<CollaborationResult> future = orchestrator.collaborate(
        agents,
        task,
        WorkflowMode.PARALLEL
    );
    
    CollaborationResult result = future.get();
}
```

## AgentScope API 使用

### 创建 ReActAgent

```java
ReActAgent agent = ReActAgent.builder()
    .name("Assistant")
    .sysPrompt("你是一个有帮助的 AI 助手。")
    .model(DashScopeChatModel.builder()
        .apiKey(apiKey)
        .modelName("qwen-max")
        .build())
    .maxIters(10)
    .build();
```

### 调用 Agent

```java
Msg userMsg = Msg.builder()
    .role(MsgRole.USER)
    .textContent("你好！")
    .build();

Mono<Msg> responseMono = agent.call(Arrays.asList(userMsg));
Msg response = responseMono.block();
String text = response.getTextContent();
```

### 工具集成

```java
// 创建工具
public class MyTool implements AgentTool {
    @Override
    public String getName() {
        return "my_tool";
    }
    
    @Override
    public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
        // 执行工具逻辑
        return Mono.just(ToolResultBlock.builder()
            .content("执行结果")
            .build());
    }
}

// 注册工具
Toolkit toolkit = new Toolkit();
toolkit.registerAgentTool(new MyTool());

// 创建带工具的 Agent
ReActAgent agent = ReActAgent.builder()
    .model(model)
    .toolkit(toolkit)
    .build();
```

## 协作模式

### 顺序执行

```java
CollaborationResult result = orchestrator.collaborate(
    agents,
    task,
    WorkflowMode.SEQUENTIAL
).get();
```

### 并行执行

```java
CollaborationResult result = orchestrator.collaborate(
    agents,
    task,
    WorkflowMode.PARALLEL
).get();
```

## 优势

1. **ReAct 推理**: 利用 AgentScope 的 ReAct 推理能力，Agent 可以自主规划和执行任务
2. **工具调用**: 支持工具注册和调用，扩展 Agent 能力
3. **结构化输出**: 支持结构化输出，便于结果处理
4. **响应式编程**: 使用 Reactor 的 Mono/Flux，支持异步和流式处理

## 注意事项

1. **依赖**: 确保 `io.agentscope:agentscope:1.0.5` 依赖已添加到 pom.xml
2. **API Key**: 需要配置 DashScope API Key
3. **响应式编程**: AgentScope 使用 Reactor，需要了解 Mono/Flux 的使用
4. **阻塞调用**: 当前实现使用 `.block()` 阻塞等待结果，在生产环境中可以考虑异步处理

## 故障排查

### AgentScope 未启用

检查配置：
```yaml
multiagent:
  agentscope:
    enabled: true
```

### API Key 未配置

检查环境变量或配置文件中的 `dashscope-api-key`。

### 依赖缺失

确保 pom.xml 中包含：
```xml
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope</artifactId>
    <version>1.0.5</version>
</dependency>
```

## 参考资源

- [AgentScope Java 官方文档](https://java.agentscope.io/)
- [API 参考](https://runtime.agentscope.io/zh/api/index.html)
- [GitHub 仓库](https://github.com/agentscope-ai/agentscope-java)
