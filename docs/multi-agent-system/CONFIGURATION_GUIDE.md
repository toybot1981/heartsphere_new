# 多智能体系统配置指南

## 概述

本文档说明如何配置多智能体系统，包括智能体注册、路由策略配置、MCP 工具访问权限等。

## 智能体配置

### 自动注册

系统启动时，`LifeAssistantAgentConfig` 会自动注册所有生活助手 Agent。无需手动配置。

### 手动注册 Agent

如果需要注册自定义 Agent：

```java
@Autowired
private AgentRegistry agentRegistry;

@PostConstruct
public void registerCustomAgent() {
    Agent myAgent = new MyAgent(skillExecutor);
    agentRegistry.register(myAgent);
}
```

### Agent 能力配置

每个 Agent 通过 `addCapability()` 方法添加能力描述：

```java
public class MyAgent extends BaseAgent {
    public MyAgent() {
        super("my-agent", "My Agent", "Description");
        addCapability("my-capability");
        addCapability("another-capability");
    }
}
```

## 路由策略配置

### 生活助手路由策略

`LifeAssistantRouter` 使用关键词匹配来选择智能体。可以通过修改关键词映射来调整路由逻辑：

```java
// 在 LifeAssistantRouter 中
private static final Map<String, Set<String>> KEYWORD_TO_CAPABILITIES = Map.of(
    "时间", Set.of("time-management"),
    "健康", Set.of("health"),
    // 添加更多映射
);
```

### 自定义路由策略

创建自定义路由类：

```java
@Component
public class CustomRouter implements AgentRouter {
    @Autowired
    private AgentRegistry agentRegistry;
    
    @Override
    public List<Agent> route(String task, RoutingContext context) {
        // 实现自定义路由逻辑
        return agents;
    }
    
    @Override
    public List<SubTask> decompose(String task) {
        // 实现任务分解
        return subTasks;
    }
}
```

## MCP 工具配置

### 工具注册

```java
@Autowired
private McpProtocolImpl mcpProtocol;

@PostConstruct
public void registerMcpTools() {
    McpProtocol.McpTool tool = new McpProtocol.McpTool();
    tool.setName("my-tool");
    tool.setDescription("Tool description");
    mcpProtocol.registerTool(tool);
}
```

### 工具访问权限

```java
// 授予智能体工具访问权限
mcpProtocol.grantToolAccess("agent-id", Set.of("tool-1", "tool-2"));

// 撤销权限
mcpProtocol.revokeToolAccess("agent-id", Set.of("tool-1"));
```

### 默认权限策略

默认情况下，如果没有明确配置权限，智能体可以访问所有工具。可以通过修改 `McpProtocolImpl.hasToolAccess()` 来改变此策略。

## 协作模式配置

### 工作流模式

在创建协作时指定模式：

```java
CollaborationContext context = new CollaborationContext(userId, sessionId);
context.setMode(WorkflowMode.PARALLEL); // 或 SEQUENTIAL, CONDITIONAL
```

### 超时配置

在 `CollaborationOrchestratorImpl` 中可以配置超时时间：

```java
// 在 sendAndWait 中
future.orTimeout(30, TimeUnit.SECONDS); // 默认30秒
```

## 应用配置

### application.yml

```yaml
multiagent:
  collaboration:
    default-timeout: 30  # 默认超时时间（秒）
    max-concurrent: 10   # 最大并发协作数
    enable-parallel: true # 启用并行执行
```

## 日志配置

### 日志级别

```yaml
logging:
  level:
    com.heartsphere.multiagent: DEBUG
    com.heartsphere.character.multiagent: INFO
```

## 性能调优

### 线程池配置

对于并行执行，可以配置线程池：

```java
@Configuration
public class MultiAgentConfig {
    @Bean
    public ExecutorService collaborationExecutor() {
        return Executors.newFixedThreadPool(10);
    }
}
```

### 缓存配置

可以添加结果缓存：

```java
@Cacheable(value = "collaboration-results", key = "#collaborationId")
public CollaborationResult getCachedResult(String collaborationId) {
    // ...
}
```

## 安全配置

### 权限控制

确保只有授权用户可以创建协作：

```java
@PreAuthorize("hasRole('USER')")
@PostMapping("/collaborate")
public ResponseEntity<?> collaborate(@RequestBody CollaborationRequest request) {
    // ...
}
```

### 速率限制

使用 Spring Security 或自定义拦截器实现速率限制。

## 监控配置

### 指标收集

可以添加指标收集：

```java
@Autowired
private MeterRegistry meterRegistry;

public void recordCollaboration(String collaborationId) {
    meterRegistry.counter("collaboration.created", "id", collaborationId).increment();
}
```

## 故障排查

### 常见问题

1. **Agent 未注册**: 检查 `LifeAssistantAgentConfig` 是否正确执行
2. **路由失败**: 检查关键词映射和 Agent 能力配置
3. **工具执行失败**: 检查 MCP 工具权限和配置
4. **协作超时**: 检查超时配置和 Agent 执行时间

### 调试模式

启用调试日志：

```yaml
logging:
  level:
    com.heartsphere.multiagent: DEBUG
```
