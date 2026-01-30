# 多智能体框架 API 使用指南

## 概述

本文档提供多智能体框架的详细 API 使用指南，包括核心接口、使用示例和最佳实践。

## 核心 API

### AgentRegistry（智能体注册表）

#### 注册智能体

```java
@Autowired
private AgentRegistry agentRegistry;

public void registerAgent() {
    Agent agent = new MyAgent();
    agentRegistry.register(agent);
}
```

#### 查找智能体

```java
// 按 ID 查找
Optional<Agent> agent = agentRegistry.getAgent("agent-id");

// 获取所有智能体
List<Agent> allAgents = agentRegistry.getAllAgents();

// 按能力查找
List<Agent> agents = agentRegistry.findAgentsByCapability("time-management");

// 按多个能力查找
Set<String> capabilities = Set.of("time-management", "health");
List<Agent> agents = agentRegistry.findAgentsByCapabilities(capabilities);
```

#### 注销智能体

```java
agentRegistry.unregister("agent-id");
```

### CollaborationOrchestrator（协作编排引擎）

#### 创建协作任务

```java
@Autowired
private CollaborationOrchestrator orchestrator;

public String createCollaboration() {
    List<Agent> agents = Arrays.asList(agent1, agent2, agent3);
    
    CollaborationContext context = new CollaborationContext(userId, sessionId);
    context.setMode(WorkflowMode.PARALLEL);
    context.setParameters(Map.of("timeout", 30000));
    
    String collaborationId = orchestrator.createCollaboration(
        "完成复杂任务", agents, context
    );
    
    return collaborationId;
}
```

#### 执行协作任务

```java
public void executeCollaboration(String collaborationId) {
    CompletableFuture<CollaborationResult> future = 
        orchestrator.execute(collaborationId);
    
    future.thenAccept(result -> {
        if (result.isSuccess()) {
            System.out.println("协作成功: " + result.getResult());
            System.out.println("智能体结果: " + result.getAgentResults());
        } else {
            System.out.println("协作失败: " + result.getErrors());
        }
    }).exceptionally(throwable -> {
        System.err.println("执行异常: " + throwable.getMessage());
        return null;
    });
}
```

#### 获取协作状态

```java
CollaborationStatus status = orchestrator.getStatus(collaborationId);
switch (status) {
    case PENDING:
        System.out.println("等待执行");
        break;
    case RUNNING:
        System.out.println("执行中");
        break;
    case COMPLETED:
        System.out.println("已完成");
        break;
    case FAILED:
        System.out.println("执行失败");
        break;
    case CANCELLED:
        System.out.println("已取消");
        break;
}
```

#### 取消协作任务

```java
orchestrator.cancel(collaborationId);
```

### AgentRouter（智能体路由）

#### 路由到智能体

```java
@Autowired
private AgentRouter router;

public List<Agent> routeTask(String task) {
    RoutingContext context = new RoutingContext(userId, sessionId);
    List<Agent> agents = router.route(task, context);
    return agents;
}
```

#### 任务分解

```java
public List<SubTask> decomposeTask(String task) {
    List<SubTask> subTasks = router.decompose(task);
    return subTasks;
}
```

### Agent（智能体）

#### 执行任务

```java
@Autowired
private Agent agent;

public void executeTask() {
    Map<String, Object> context = new HashMap<>();
    context.put("userId", "user-123");
    context.put("sessionId", "session-456");
    
    Agent.AgentResult result = agent.execute("完成任务", context);
    
    if (result.isSuccess()) {
        System.out.println("执行成功: " + result.getResult());
    } else {
        System.out.println("执行失败: " + result.getErrorMessage());
    }
}
```

#### 检查能力

```java
boolean canHandle = agent.canHandle("时间管理任务");
if (canHandle) {
    // 可以处理该任务
}
```

### A2A Protocol（智能体间通信）

#### 发送消息

```java
@Autowired
private AgentToAgentProtocol a2aProtocol;

public void sendMessage() {
    A2AMessage message = new A2AMessage();
    message.setFromAgentId("agent-1");
    message.setToAgentId("agent-2");
    message.setType(MessageType.REQUEST);
    message.setContent("请协助完成任务");
    
    CompletableFuture<A2AMessage> response = a2aProtocol.send(message);
    response.thenAccept(msg -> {
        System.out.println("收到响应: " + msg.getContent());
    });
}
```

#### 接收消息

```java
@Autowired
private AgentMessageRouter messageRouter;

@PostConstruct
public void setupMessageHandler() {
    messageRouter.registerHandler("agent-id", message -> {
        // 处理接收到的消息
        System.out.println("收到消息: " + message.getContent());
        return createResponse(message);
    });
}
```

### MCP Protocol（工具访问）

#### 授予工具访问权限

```java
@Autowired
private McpProtocol mcpProtocol;

public void grantToolAccess() {
    Set<String> tools = Set.of("calculator", "database-query");
    mcpProtocol.grantToolAccess("agent-id", tools);
}
```

#### 执行工具

```java
public void executeTool() {
    Map<String, Object> parameters = Map.of(
        "operation", "add",
        "a", 10,
        "b", 20
    );
    
    McpToolResult result = mcpProtocol.executeTool(
        "agent-id", "calculator", parameters
    );
    
    if (result.isSuccess()) {
        System.out.println("工具执行成功: " + result.getResult());
    } else {
        System.out.println("工具执行失败: " + result.getErrorMessage());
    }
}
```

#### 获取可用工具

```java
List<String> tools = mcpProtocol.getAvailableTools("agent-id");
System.out.println("可用工具: " + tools);
```

## 完整使用示例

### 示例 1: 单智能体协作

```java
@Service
public class SingleAgentService {
    @Autowired
    private AgentRegistry agentRegistry;
    
    @Autowired
    private CollaborationOrchestrator orchestrator;
    
    public CompletableFuture<String> executeTask(String task, 
                                                  String userId, 
                                                  String sessionId) {
        // 1. 查找合适的智能体
        List<Agent> agents = agentRegistry.findAgentsByCapability("task-handling");
        if (agents.isEmpty()) {
            return CompletableFuture.completedFuture("未找到合适的智能体");
        }
        
        Agent agent = agents.get(0);
        
        // 2. 创建协作任务
        CollaborationContext context = new CollaborationContext(userId, sessionId);
        context.setMode(WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            task, Arrays.asList(agent), context
        );
        
        // 3. 执行协作
        return orchestrator.execute(collaborationId)
            .thenApply(result -> {
                if (result.isSuccess()) {
                    return result.getResult();
                } else {
                    return "执行失败: " + String.join(", ", result.getErrors());
                }
            });
    }
}
```

### 示例 2: 多智能体并行协作

```java
@Service
public class MultiAgentService {
    @Autowired
    private AgentRouter router;
    
    @Autowired
    private CollaborationOrchestrator orchestrator;
    
    public CompletableFuture<CollaborationResult> collaborate(
            String task, String userId, String sessionId) {
        // 1. 路由到多个智能体
        RoutingContext routingContext = new RoutingContext(userId, sessionId);
        List<Agent> agents = router.route(task, routingContext);
        
        if (agents.isEmpty()) {
            CollaborationResult errorResult = new CollaborationResult();
            errorResult.setSuccess(false);
            errorResult.setErrors(Arrays.asList("未找到合适的智能体"));
            return CompletableFuture.completedFuture(errorResult);
        }
        
        // 2. 创建并行协作任务
        CollaborationContext context = new CollaborationContext(userId, sessionId);
        context.setMode(WorkflowMode.PARALLEL);
        
        String collaborationId = orchestrator.createCollaboration(
            task, agents, context
        );
        
        // 3. 执行协作
        return orchestrator.execute(collaborationId);
    }
}
```

### 示例 3: 带任务分解的协作

```java
@Service
public class DecomposedCollaborationService {
    @Autowired
    private AgentRouter router;
    
    @Autowired
    private CollaborationOrchestrator orchestrator;
    
    public CompletableFuture<CollaborationResult> collaborateWithDecomposition(
            String complexTask, String userId, String sessionId) {
        // 1. 分解任务
        List<SubTask> subTasks = router.decompose(complexTask);
        
        // 2. 为每个子任务路由智能体
        List<Agent> allAgents = new ArrayList<>();
        RoutingContext routingContext = new RoutingContext(userId, sessionId);
        
        for (SubTask subTask : subTasks) {
            List<Agent> agents = router.route(subTask.getDescription(), routingContext);
            allAgents.addAll(agents);
        }
        
        // 3. 创建顺序协作（子任务有依赖关系）
        CollaborationContext context = new CollaborationContext(userId, sessionId);
        context.setMode(WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(
            complexTask, allAgents, context
        );
        
        // 4. 执行协作
        return orchestrator.execute(collaborationId);
    }
}
```

## 最佳实践

### 1. 智能体注册

- **在应用启动时注册**: 使用 `@PostConstruct` 或 Spring 的 `@Component` 自动注册
- **检查重复注册**: 注册前检查智能体是否已存在
- **设置合理的能力描述**: 能力描述应该清晰、具体

```java
@Component
public class AgentRegistration {
    @Autowired
    private AgentRegistry agentRegistry;
    
    @PostConstruct
    public void registerAgents() {
        if (agentRegistry.getAgent("my-agent").isEmpty()) {
            Agent agent = new MyAgent();
            agentRegistry.register(agent);
        }
    }
}
```

### 2. 协作模式选择

- **顺序模式 (SEQUENTIAL)**: 适用于有依赖关系的任务
- **并行模式 (PARALLEL)**: 适用于独立任务，提高效率
- **条件模式 (CONDITIONAL)**: 适用于需要条件判断的场景

```java
// 选择顺序模式
if (hasDependencies(subTasks)) {
    context.setMode(WorkflowMode.SEQUENTIAL);
} else {
    context.setMode(WorkflowMode.PARALLEL);
}
```

### 3. 错误处理

- **检查协作结果**: 始终检查 `CollaborationResult.isSuccess()`
- **处理异常**: 使用 `exceptionally` 处理异步异常
- **记录错误日志**: 记录详细的错误信息用于调试

```java
orchestrator.execute(collaborationId)
    .thenAccept(result -> {
        if (!result.isSuccess()) {
            log.error("协作失败: {}", result.getErrors());
            // 处理失败情况
        }
    })
    .exceptionally(throwable -> {
        log.error("执行异常", throwable);
        return null;
    });
```

### 4. 性能优化

- **使用并行模式**: 对于独立任务，使用并行模式提高效率
- **缓存智能体查找结果**: 对于重复查询，缓存结果
- **设置合理的超时时间**: 避免长时间等待

```java
// 设置超时
CompletableFuture<CollaborationResult> future = orchestrator.execute(collaborationId);
try {
    CollaborationResult result = future.get(30, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    orchestrator.cancel(collaborationId);
    log.warn("协作超时，已取消");
}
```

### 5. 资源管理

- **及时取消不需要的协作**: 避免资源浪费
- **清理完成的协作任务**: 定期清理已完成的任务
- **限制并发协作数量**: 避免资源耗尽

```java
// 限制并发数量
private final Semaphore semaphore = new Semaphore(10);

public CompletableFuture<CollaborationResult> collaborateWithLimit(
        String task, String userId, String sessionId) {
    try {
        semaphore.acquire();
        return collaborate(task, userId, sessionId)
            .whenComplete((result, throwable) -> semaphore.release());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return CompletableFuture.completedFuture(createErrorResult());
    }
}
```

## 常见问题

### Q: 如何选择合适的智能体？

A: 使用 `AgentRouter` 进行智能路由，或者使用 `AgentRegistry.findAgentsByCapability()` 按能力查找。

### Q: 如何处理协作超时？

A: 使用 `CompletableFuture.get(timeout, TimeUnit)` 设置超时，超时后调用 `orchestrator.cancel()` 取消协作。

### Q: 如何获取智能体的执行结果？

A: 从 `CollaborationResult.agentResults` 中获取，这是一个 `Map<String, Object>`，键是智能体 ID，值是执行结果。

### Q: 如何实现智能体间的通信？

A: 使用 `AgentToAgentProtocol.send()` 发送消息，使用 `AgentMessageRouter` 注册消息处理器。

### Q: 如何为智能体授予工具访问权限？

A: 使用 `McpProtocol.grantToolAccess()` 授予权限，然后智能体可以在 `doExecute` 方法中使用 `mcpProtocol.executeTool()` 执行工具。
