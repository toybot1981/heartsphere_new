# 多智能体框架快速参考

## 核心组件

### AgentRegistry（智能体注册表）
```java
@Autowired
private AgentRegistry agentRegistry;

// 注册智能体
agentRegistry.register(agent);

// 查找智能体
Optional<Agent> agent = agentRegistry.getAgent("agent-id");
List<Agent> agents = agentRegistry.findAgentsByCapability("capability");
```

### CollaborationOrchestrator（协作编排器）
```java
@Autowired
private CollaborationOrchestrator orchestrator;

// 创建协作
CollaborationContext context = new CollaborationContext("user-id", "session-id");
context.setMode(WorkflowMode.PARALLEL);
String collaborationId = orchestrator.createCollaboration("任务描述", agents, context);

// 执行协作
CompletableFuture<CollaborationResult> future = orchestrator.execute(collaborationId);
CollaborationResult result = future.get();
```

### TaskDecompositionService（任务分解服务）
```java
@Autowired
private TaskDecompositionService taskDecompositionService;

// 分解任务
DecompositionResult result = taskDecompositionService.decompose("复杂任务描述");
List<SubTask> subTasks = result.getSubTasks();
```

### LoadBalancer（负载均衡器）
```java
@Autowired
private LoadBalancer loadBalancer;

// 选择智能体
List<Agent> selected = loadBalancer.selectAgents(candidates, requiredCapabilities);

// 记录负载
loadBalancer.recordTaskStart("agent-id");
loadBalancer.recordTaskComplete("agent-id", executionTime);
```

### ResultQualityAssessor（结果质量评估器）
```java
@Autowired
private ResultQualityAssessor qualityAssessor;

// 评估结果质量
QualityAssessment assessment = qualityAssessor.assess(result, agentResults, "原始任务");

// 优化结果
CollaborationResult optimized = qualityAssessor.optimize(result, assessment);
```

## 工作流模式

### SEQUENTIAL（顺序执行）
```java
context.setMode(WorkflowMode.SEQUENTIAL);
// 智能体按顺序执行，前一个的结果传递给下一个
```

### PARALLEL（并行执行）
```java
context.setMode(WorkflowMode.PARALLEL);
// 所有智能体并行执行，提高效率
```

### CONDITIONAL（条件分支）
```java
context.setMode(WorkflowMode.CONDITIONAL);
// 根据条件选择执行路径
```

## 常用操作

### 创建智能体
```java
public class MyAgent extends BaseAgent {
    public MyAgent() {
        super("agent-id", "Agent Name", "Description");
        addCapability("capability-1");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 实现执行逻辑
        return AgentResult.success("结果");
    }
}
```

### 路由任务
```java
@Autowired
private AgentRouter router;

List<Agent> agents = router.route("任务描述", routingContext);
```

### 处理错误
```java
try {
    CollaborationResult result = future.get(30, TimeUnit.SECONDS);
    if (!result.isSuccess()) {
        // 处理错误
        List<String> errors = result.getErrors();
    }
} catch (TimeoutException e) {
    // 处理超时
}
```

## API 端点

### 管理 API
- `GET /api/admin/multi-agent/agents` - 获取所有智能体
- `GET /api/admin/multi-agent/collaborations` - 获取协作日志
- `GET /api/admin/multi-agent/collaborations/statistics` - 获取统计信息
- `GET /api/admin/multi-agent/routing/config` - 获取路由配置
- `PUT /api/admin/multi-agent/routing/config` - 更新路由配置

## 测试

### 运行测试
```bash
# 所有测试
mvn test

# 多智能体测试
mvn test -Dtest=com.heartsphere.multiagent.*

# 生成覆盖率报告
./scripts/generate-test-coverage.sh
```

### 创建测试智能体
```java
Agent testAgent = TestAgentFactory.createSimpleAgent("id", Set.of("capability"));
```

## 最佳实践

1. **智能体设计**
   - 单一职责原则
   - 明确的能力定义
   - 良好的错误处理

2. **协作编排**
   - 根据任务特性选择模式
   - 合理设置超时时间
   - 处理部分失败情况

3. **性能优化**
   - 使用并行模式提高效率
   - 合理使用负载均衡
   - 监控和调优

## 参考文档

- [架构设计](./ARCHITECTURE.md)
- [API 指南](./API_GUIDE.md)
- [最佳实践](./BEST_PRACTICES.md)
- [快速开始](./QUICKSTART.md)
- [性能优化](./PERFORMANCE.md)
- [测试指南](./TESTING_GUIDE.md)
