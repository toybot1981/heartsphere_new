# Multi-Agent Collaboration Infrastructure

多智能体协作基础设施模块

## 模块结构

```
multiagent/
├── core/                    # 核心框架
│   ├── Agent.java          # 智能体接口
│   ├── BaseAgent.java      # 智能体基类
│   ├── AgentRegistry.java  # 智能体注册表接口
│   └── AgentRegistryImpl.java # 智能体注册表实现
│
├── orchestrator/            # 协作编排引擎
│   └── CollaborationOrchestrator.java # 协作编排接口
│
├── router/                 # 智能体路由系统
│   └── AgentRouter.java    # 路由接口
│
└── protocol/               # 协议实现
    ├── a2a/                # Agent-to-Agent 协议
    │   ├── A2AMessage.java           # 消息格式
    │   ├── AgentToAgentProtocol.java # 协议接口
    │   └── AgentMessageRouter.java  # 消息路由器
    └── mcp/                # MCP 协议（待实现）
```

## 核心概念

### Agent（智能体）
- `Agent` 接口：定义智能体的通用能力
- `BaseAgent` 抽象类：提供智能体的通用功能实现
- 每个智能体都有唯一 ID、名称、描述和能力集合

### AgentRegistry（智能体注册表）
- 负责智能体的注册、发现和管理
- 支持按能力查找智能体
- 维护能力索引，提高查找效率

### AgentRouter（智能体路由）
- 定义路由接口，支持任务路由和分解
- 应用场景层实现特定的路由策略

### CollaborationOrchestrator（协作编排引擎）
- 管理多智能体协作流程
- 支持顺序、并行、条件分支等工作流模式
- 处理任务分配、执行协调和结果整合

### A2A Protocol（Agent-to-Agent 协议）
- 标准化的智能体间通信协议
- 支持请求、响应、通知、错误等消息类型
- 提供消息路由和分发机制

## 使用方式

### 1. 创建智能体

```java
public class MyAgent extends BaseAgent {
    public MyAgent() {
        super("agent-1", "My Agent", "Agent description");
        addCapability("task-handling");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 实现具体任务执行逻辑
        return AgentResult.success("Task completed");
    }
}
```

### 2. 注册智能体

```java
@Autowired
private AgentRegistry agentRegistry;

public void registerAgent() {
    Agent agent = new MyAgent();
    agentRegistry.register(agent);
}
```

### 3. 路由和协作

```java
@Autowired
private AgentRouter agentRouter;

@Autowired
private CollaborationOrchestrator orchestrator;

public void collaborate(String task) {
    // 路由到合适的智能体
    List<Agent> agents = agentRouter.route(task, new RoutingContext(userId, sessionId));
    
    // 创建协作任务
    String collaborationId = orchestrator.createCollaboration(
        task, agents, new CollaborationContext(userId, sessionId)
    );
    
    // 执行协作
    CompletableFuture<CollaborationResult> future = orchestrator.execute(collaborationId);
}
```

## 扩展点

- **路由策略**：实现 `AgentRouter` 接口，定义特定应用场景的路由逻辑
- **编排策略**：实现 `CollaborationOrchestrator` 接口，定义特定的协作模式
- **智能体实现**：继承 `BaseAgent`，实现具体的智能体功能

## 待实现功能

- [ ] MCP 协议集成
- [ ] CollaborationOrchestrator 具体实现类
- [ ] 基础路由实现类
- [ ] 任务委托机制
- [ ] 结果回调机制
- [ ] 超时和重试机制
