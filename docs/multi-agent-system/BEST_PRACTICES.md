# 多智能体框架最佳实践

## 概述

本文档提供多智能体框架开发和使用的最佳实践，帮助开发者构建高效、可靠的多智能体应用。

## 智能体设计

### 1. 单一职责原则

每个智能体应该专注于一个特定的领域或能力，避免功能过于复杂。

**好的实践**:
```java
// 专注于时间管理
public class TimeManagementAgent extends BaseAgent {
    public TimeManagementAgent() {
        super("time-agent", "时间管理助手", "专注于时间管理和效率提升");
        addCapability("time-management");
        addCapability("task-planning");
    }
}
```

**不好的实践**:
```java
// 功能过于宽泛
public class GeneralAgent extends BaseAgent {
    public GeneralAgent() {
        super("general-agent", "通用助手", "可以做任何事情");
        addCapability("time-management");
        addCapability("health");
        addCapability("learning");
        addCapability("emotion");
        // ... 太多能力
    }
}
```

### 2. 能力描述清晰

能力描述应该清晰、具体，便于路由系统准确匹配。

**好的实践**:
```java
addCapability("time-management");
addCapability("task-prioritization");
addCapability("pomodoro-technique");
```

**不好的实践**:
```java
addCapability("help");
addCapability("stuff");
addCapability("things");
```

### 3. 错误处理

智能体应该优雅地处理错误，返回有意义的错误信息。

```java
@Override
protected AgentResult doExecute(String task, Map<String, Object> context) {
    try {
        // 执行任务
        String result = performTask(task, context);
        return AgentResult.success(result);
    } catch (IllegalArgumentException e) {
        log.warn("任务参数错误: {}", e.getMessage());
        return AgentResult.failure("任务参数错误: " + e.getMessage());
    } catch (Exception e) {
        log.error("任务执行失败", e);
        return AgentResult.failure("任务执行失败: " + e.getMessage());
    }
}
```

## 路由策略

### 1. 智能匹配

路由策略应该基于任务内容和智能体能力进行智能匹配。

```java
@Override
public List<Agent> route(String task, RoutingContext context) {
    // 1. 分析任务关键词
    Set<String> keywords = extractKeywords(task);
    
    // 2. 查找匹配能力的智能体
    List<Agent> candidates = new ArrayList<>();
    for (String keyword : keywords) {
        List<Agent> agents = agentRegistry.findAgentsByCapability(keyword);
        candidates.addAll(agents);
    }
    
    // 3. 去重和排序
    return candidates.stream()
        .distinct()
        .sorted(Comparator.comparing(this::calculateRelevance))
        .collect(Collectors.toList());
}
```

### 2. 任务分解

复杂任务应该分解为多个子任务，分配给不同的智能体。

```java
@Override
public List<SubTask> decompose(String task) {
    // 识别任务类型
    if (isComplexTask(task)) {
        // 分解为子任务
        return Arrays.asList(
            new SubTask("subtask-1", "子任务1描述", Set.of("capability-1")),
            new SubTask("subtask-2", "子任务2描述", Set.of("capability-2")),
            new SubTask("subtask-3", "子任务3描述", Set.of("capability-3"))
        );
    } else {
        // 简单任务，不需要分解
        return Arrays.asList(new SubTask("main-task", task, Set.of()));
    }
}
```

## 协作编排

### 1. 选择合适的协作模式

根据任务特性选择合适的协作模式：

- **顺序模式**: 任务有依赖关系，需要顺序执行
- **并行模式**: 任务独立，可以并行执行提高效率
- **条件模式**: 需要根据条件选择执行路径

```java
public WorkflowMode selectMode(List<SubTask> subTasks) {
    // 检查依赖关系
    if (hasDependencies(subTasks)) {
        return WorkflowMode.SEQUENTIAL;
    }
    
    // 检查条件分支
    if (hasConditionalBranches(subTasks)) {
        return WorkflowMode.CONDITIONAL;
    }
    
    // 默认并行模式
    return WorkflowMode.PARALLEL;
}
```

### 2. 上下文传递

在顺序模式下，确保前一个智能体的结果正确传递给下一个智能体。

```java
private CollaborationResult executeSequential(CollaborationTask task) {
    Map<String, Object> context = new HashMap<>();
    
    for (Agent agent : task.getAgents()) {
        AgentResult result = agent.execute(task.getTaskDescription(), context);
        
        if (result.isSuccess()) {
            // 将结果添加到上下文
            context.put(agent.getId() + "_result", result.getResult());
        } else {
            // 处理错误
            return createErrorResult(result.getErrorMessage());
        }
    }
    
    return aggregateResults(context);
}
```

### 3. 结果聚合

合理聚合多个智能体的结果，提供有意义的最终结果。

```java
private CollaborationResult aggregateResults(Map<String, Object> agentResults) {
    StringBuilder aggregatedResult = new StringBuilder();
    
    for (Map.Entry<String, Object> entry : agentResults.entrySet()) {
        String agentId = entry.getKey();
        Object result = entry.getValue();
        
        aggregatedResult.append(String.format("[%s] %s\n", agentId, result));
    }
    
    CollaborationResult collaborationResult = new CollaborationResult();
    collaborationResult.setSuccess(true);
    collaborationResult.setResult(aggregatedResult.toString());
    collaborationResult.setAgentResults(agentResults);
    
    return collaborationResult;
}
```

## 性能优化

### 1. 并行执行

对于独立任务，使用并行模式提高效率。

```java
private CollaborationResult executeParallel(CollaborationTask task) {
    List<CompletableFuture<AgentResult>> futures = task.getAgents().stream()
        .map(agent -> CompletableFuture.supplyAsync(() -> 
            agent.execute(task.getTaskDescription(), new HashMap<>())
        ))
        .collect(Collectors.toList());
    
    // 等待所有任务完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    
    // 收集结果
    Map<String, Object> agentResults = new HashMap<>();
    for (int i = 0; i < futures.size(); i++) {
        Agent agent = task.getAgents().get(i);
        AgentResult result = futures.get(i).join();
        agentResults.put(agent.getId(), result.getResult());
    }
    
    return aggregateResults(agentResults);
}
```

### 2. 缓存机制

对于重复查询，使用缓存提高性能。

```java
@Service
public class CachedAgentRegistry {
    private final AgentRegistry agentRegistry;
    private final Cache<String, List<Agent>> capabilityCache;
    
    public List<Agent> findAgentsByCapability(String capability) {
        return capabilityCache.get(capability, () -> 
            agentRegistry.findAgentsByCapability(capability)
        );
    }
}
```

### 3. 超时控制

设置合理的超时时间，避免长时间等待。

```java
public CompletableFuture<CollaborationResult> executeWithTimeout(
        String collaborationId, long timeoutMs) {
    CompletableFuture<CollaborationResult> future = orchestrator.execute(collaborationId);
    
    return future.orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
        .exceptionally(throwable -> {
            if (throwable instanceof TimeoutException) {
                orchestrator.cancel(collaborationId);
                return createTimeoutResult();
            }
            return createErrorResult(throwable);
        });
}
```

## 错误处理

### 1. 优雅降级

当部分智能体失败时，尝试继续执行其他智能体。

```java
private CollaborationResult executeWithFallback(CollaborationTask task) {
    Map<String, Object> agentResults = new HashMap<>();
    List<String> errors = new ArrayList<>();
    
    for (Agent agent : task.getAgents()) {
        try {
            AgentResult result = agent.execute(task.getTaskDescription(), new HashMap<>());
            if (result.isSuccess()) {
                agentResults.put(agent.getId(), result.getResult());
            } else {
                errors.add(agent.getId() + ": " + result.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("智能体执行异常: {}", agent.getId(), e);
            errors.add(agent.getId() + ": " + e.getMessage());
        }
    }
    
    // 如果至少有一个成功，则认为部分成功
    CollaborationResult result = new CollaborationResult();
    result.setSuccess(!agentResults.isEmpty());
    result.setAgentResults(agentResults);
    result.setErrors(errors);
    
    return result;
}
```

### 2. 重试机制

对于临时性错误，实现重试机制。

```java
public AgentResult executeWithRetry(String task, Map<String, Object> context, int maxRetries) {
    int attempts = 0;
    Exception lastException = null;
    
    while (attempts < maxRetries) {
        try {
            return agent.execute(task, context);
        } catch (Exception e) {
            lastException = e;
            attempts++;
            if (attempts < maxRetries) {
                log.warn("执行失败，重试 {}/{}", attempts, maxRetries);
                try {
                    Thread.sleep(1000 * attempts); // 指数退避
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    return AgentResult.failure("执行失败: " + lastException.getMessage());
}
```

## 测试策略

### 1. 单元测试

为每个智能体和组件编写单元测试。

```java
@Test
public void testAgentExecution() {
    // 创建 Mock 智能体
    Agent agent = mock(Agent.class);
    when(agent.execute(anyString(), anyMap())).thenReturn(
        AgentResult.success("测试结果")
    );
    
    // 测试执行
    AgentResult result = agent.execute("测试任务", new HashMap<>());
    
    // 验证结果
    assertTrue(result.isSuccess());
    assertEquals("测试结果", result.getResult());
}
```

### 2. 集成测试

测试完整的协作流程。

```java
@Test
public void testMultiAgentCollaboration() {
    // 创建智能体
    List<Agent> agents = Arrays.asList(agent1, agent2, agent3);
    
    // 创建协作
    CollaborationContext context = new CollaborationContext(userId, sessionId);
    context.setMode(WorkflowMode.PARALLEL);
    
    String collaborationId = orchestrator.createCollaboration(
        "测试任务", agents, context
    );
    
    // 执行协作
    CollaborationResult result = orchestrator.execute(collaborationId).join();
    
    // 验证结果
    assertTrue(result.isSuccess());
    assertEquals(3, result.getAgentResults().size());
}
```

## 安全考虑

### 1. 输入验证

验证所有输入参数，防止恶意输入。

```java
@Override
protected AgentResult doExecute(String task, Map<String, Object> context) {
    // 验证任务描述
    if (task == null || task.trim().isEmpty()) {
        return AgentResult.failure("任务描述不能为空");
    }
    
    // 验证任务长度
    if (task.length() > MAX_TASK_LENGTH) {
        return AgentResult.failure("任务描述过长");
    }
    
    // 执行任务
    return performTask(task, context);
}
```

### 2. 权限控制

控制智能体的访问权限。

```java
public boolean canAccess(String agentId, String resource) {
    // 检查权限
    return permissionService.hasPermission(agentId, resource);
}
```

## 监控和日志

### 1. 日志记录

记录关键操作和错误。

```java
@Override
protected AgentResult doExecute(String task, Map<String, Object> context) {
    log.info("智能体 {} 开始执行任务: {}", getId(), task);
    
    try {
        AgentResult result = performTask(task, context);
        log.info("智能体 {} 执行成功", getId());
        return result;
    } catch (Exception e) {
        log.error("智能体 {} 执行失败", getId(), e);
        return AgentResult.failure(e.getMessage());
    }
}
```

### 2. 性能监控

监控协作执行时间和资源消耗。

```java
public CollaborationResult executeWithMonitoring(String collaborationId) {
    long startTime = System.currentTimeMillis();
    
    CollaborationResult result = orchestrator.execute(collaborationId).join();
    
    long executionTime = System.currentTimeMillis() - startTime;
    log.info("协作 {} 执行时间: {}ms", collaborationId, executionTime);
    
    // 记录性能指标
    metricsService.recordExecutionTime(collaborationId, executionTime);
    
    return result;
}
```

## 总结

遵循这些最佳实践可以帮助您构建高效、可靠的多智能体应用。记住：

1. **保持简单**: 智能体应该专注于单一职责
2. **智能路由**: 使用智能匹配和任务分解
3. **合理编排**: 根据任务特性选择合适的协作模式
4. **性能优化**: 使用并行执行和缓存机制
5. **错误处理**: 实现优雅降级和重试机制
6. **测试覆盖**: 编写全面的单元测试和集成测试
7. **安全第一**: 验证输入和控制权限
8. **监控日志**: 记录关键操作和性能指标
