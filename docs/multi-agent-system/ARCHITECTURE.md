# 多智能体框架架构设计文档

## 概述

多智能体协作框架是一个可扩展的基础设施，支持多个智能体协同工作来解决复杂问题。框架采用分层架构设计，将通用基础设施与应用场景分离，确保框架的可复用性和可扩展性。

## 架构层次

```
┌─────────────────────────────────────────────┐
│           应用场景层（Application）           │
│  ┌──────────────────────────────────────┐  │
│  │  生活助手多智能体协作（Life Assistant） │  │
│  │  - LifeAssistantOrchestrator          │  │
│  │  - LifeAssistantRouter                │  │
│  │  - LifeAssistantAgent                 │  │
│  └──────────────────────────────────────┘  │
│  （未来可扩展：Mentis、其他角色系统等）      │
└──────────────────┬──────────────────────────┘
                   │ 使用
┌──────────────────▼──────────────────────────┐
│        基础设施层（Infrastructure）            │
│  ┌──────────────────────────────────────┐  │
│  │  多智能体协作框架（Multi-Agent Core）  │  │
│  │  - AgentRegistry (Agent 管理)          │  │
│  │  - CollaborationOrchestrator (编排)    │  │
│  │  - AgentRouter (通用路由)              │  │
│  │  - MCP Protocol (上下文和工具)          │  │
│  │  - A2A Protocol (智能体通信)            │  │
│  └──────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ 基于
┌──────────────────▼──────────────────────────┐
│        底层服务（Foundation Services）        │
│  - Spring Framework                          │
│  - AgentScope Java SDK                       │
│  - MCP Protocol                              │
└──────────────────────────────────────────────┘
```

## 核心组件

### 1. Agent（智能体）

**位置**: `com.heartsphere.multiagent.core.Agent`

**职责**:
- 定义智能体的通用能力接口
- 提供任务执行接口
- 定义智能体状态管理

**关键接口**:
```java
public interface Agent {
    String getId();
    String getName();
    String getDescription();
    Set<String> getCapabilities();
    AgentResult execute(String task, Map<String, Object> context);
    boolean canHandle(String task);
    AgentStatus getStatus();
}
```

**实现类**:
- `BaseAgent`: 智能体基类，提供通用功能实现
- `LifeAssistantAgent`: 生活助手智能体实现

### 2. AgentRegistry（智能体注册表）

**位置**: `com.heartsphere.multiagent.core.AgentRegistry`

**职责**:
- 智能体的注册和注销
- 智能体的查找和发现
- 按能力查找智能体
- 维护能力索引

**关键接口**:
```java
public interface AgentRegistry {
    void register(Agent agent);
    void unregister(String agentId);
    Optional<Agent> getAgent(String agentId);
    List<Agent> getAllAgents();
    List<Agent> findAgentsByCapability(String capability);
    List<Agent> findAgentsByCapabilities(Set<String> capabilities);
}
```

**实现类**: `AgentRegistryImpl`

**数据结构**:
- `Map<String, Agent> agents`: 智能体存储（ID -> Agent）
- `Map<String, Set<String>> capabilityIndex`: 能力索引（能力 -> Agent ID 集合）

### 3. CollaborationOrchestrator（协作编排引擎）

**位置**: `com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator`

**职责**:
- 创建协作任务
- 管理协作执行流程
- 支持多种工作流模式（顺序、并行、条件分支）
- 处理任务分配和结果整合

**关键接口**:
```java
public interface CollaborationOrchestrator {
    String createCollaboration(String taskDescription, 
                               List<Agent> agents, 
                               CollaborationContext context);
    CompletableFuture<CollaborationResult> execute(String collaborationId);
    CollaborationStatus getStatus(String collaborationId);
    void cancel(String collaborationId);
}
```

**工作流模式**:
- `SEQUENTIAL`: 顺序执行，前一个智能体的结果作为下一个智能体的输入
- `PARALLEL`: 并行执行，多个智能体同时执行，提高效率
- `CONDITIONAL`: 条件分支，根据条件选择执行路径

**实现类**: `CollaborationOrchestratorImpl`

### 4. AgentRouter（智能体路由系统）

**位置**: `com.heartsphere.multiagent.router.AgentRouter`

**职责**:
- 根据任务需求路由到合适的智能体
- 任务分解为子任务
- 智能体选择策略

**关键接口**:
```java
public interface AgentRouter {
    List<Agent> route(String task, RoutingContext context);
    List<SubTask> decompose(String task);
}
```

**实现类**:
- `LifeAssistantRouter`: 生活助手特定的路由策略

### 5. A2A Protocol（Agent-to-Agent 协议）

**位置**: `com.heartsphere.multiagent.protocol.a2a`

**职责**:
- 标准化的智能体间通信协议
- 消息路由和分发
- 支持请求、响应、通知、错误等消息类型

**关键组件**:
- `A2AMessage`: 消息格式定义
- `AgentToAgentProtocol`: 协议接口
- `AgentMessageRouter`: 消息路由器

### 6. MCP Protocol（Model Context Protocol）

**位置**: `com.heartsphere.multiagent.protocol.mcp`

**职责**:
- 为智能体提供标准化的上下文和工具访问
- 工具发现和注册
- 工具执行和结果返回

**关键组件**:
- `McpProtocol`: 协议接口
- `McpProtocolImpl`: 协议实现
- `McpToolExecutor`: 工具执行器
- `McpToolWrapper`: 工具包装器

## 数据流

### 协作请求流程

```
用户请求
    │
    ▼
LifeAssistantOrchestrator.collaborate()
    │
    ├─► LifeAssistantRouter.route()
    │       │
    │       ├─► 任务分析
    │       ├─► 智能体匹配
    │       └─► 返回智能体列表
    │
    ├─► CollaborationOrchestrator.createCollaboration()
    │       │
    │       ├─► 创建协作任务
    │       ├─► 设置工作流模式
    │       └─► 返回协作 ID
    │
    └─► CollaborationOrchestrator.execute()
            │
            ├─► 顺序执行模式
            │       │
            │       ├─► Agent1.execute()
            │       ├─► Agent2.execute(context + Agent1.result)
            │       └─► ...
            │
            ├─► 并行执行模式
            │       │
            │       ├─► Agent1.execute() ─┐
            │       ├─► Agent2.execute() ─┤─► 等待所有完成
            │       └─► Agent3.execute() ─┘
            │
            └─► 结果聚合
                    │
                    └─► 返回 CollaborationResult
```

### 智能体间通信流程（A2A）

```
Agent1
    │
    ├─► 创建 A2AMessage
    │
    ├─► AgentToAgentProtocol.send()
    │       │
    │       └─► AgentMessageRouter.route()
    │               │
    │               └─► 路由到 Agent2
    │
    └─► Agent2 接收消息
            │
            └─► 处理并返回响应
```

### MCP 工具访问流程

```
Agent
    │
    ├─► McpProtocol.grantToolAccess()
    │       │
    │       └─► 授予工具访问权限
    │
    ├─► McpProtocol.executeTool()
    │       │
    │       ├─► McpToolExecutor.execute()
    │       │       │
    │       │       └─► 执行工具逻辑
    │       │
    │       └─► 返回 McpToolResult
    │
    └─► 使用工具结果
```

## 组件关系图

```
┌──────────────┐
│   Agent      │
│  (Interface)│
└──────┬───────┘
       │ implements
       │
┌──────▼──────────┐
│   BaseAgent     │
│  (Abstract)     │
└──────┬──────────┘
       │ extends
       │
┌──────▼──────────────────┐
│  LifeAssistantAgent     │
│  (Concrete)             │
└──────────────────────────┘
       │
       │ registers
       │
┌──────▼──────────┐
│ AgentRegistry   │
│  (Service)      │
└──────────────────┘
       │
       │ uses
       │
┌──────▼──────────────────┐
│  AgentRouter            │
│  (Interface)            │
└──────┬───────────────────┘
       │ implements
       │
┌──────▼──────────────────┐
│  LifeAssistantRouter    │
│  (Concrete)             │
└──────────────────────────┘
       │
       │ uses
       │
┌──────▼──────────────────────┐
│  CollaborationOrchestrator   │
│  (Interface)                │
└──────┬───────────────────────┘
       │ implements
       │
┌──────▼──────────────────────┐
│ CollaborationOrchestratorImpl│
│  (Concrete)                  │
└──────────────────────────────┘
```

## 协议规范

### A2A 协议消息格式

```java
public class A2AMessage {
    private String messageId;        // 消息 ID
    private String fromAgentId;      // 发送方智能体 ID
    private String toAgentId;        // 接收方智能体 ID
    private MessageType type;        // 消息类型
    private String content;          // 消息内容
    private Map<String, Object> metadata;  // 元数据
    private LocalDateTime timestamp; // 时间戳
}
```

**消息类型**:
- `REQUEST`: 请求消息
- `RESPONSE`: 响应消息
- `NOTIFICATION`: 通知消息
- `ERROR`: 错误消息

### MCP 协议工具访问

```java
public interface McpProtocol {
    void grantToolAccess(String agentId, Set<String> toolNames);
    McpToolResult executeTool(String agentId, String toolName, 
                              Map<String, Object> parameters);
    List<String> getAvailableTools(String agentId);
}
```

## 扩展点

### 1. 创建新的智能体

继承 `BaseAgent` 并实现 `doExecute` 方法：

```java
@Component
public class MyAgent extends BaseAgent {
    public MyAgent() {
        super("my-agent", "My Agent", "Agent description");
        addCapability("my-capability");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 实现具体逻辑
        return AgentResult.success("Result");
    }
}
```

### 2. 创建新的路由策略

实现 `AgentRouter` 接口：

```java
@Component
public class MyRouter implements AgentRouter {
    @Autowired
    private AgentRegistry agentRegistry;
    
    @Override
    public List<Agent> route(String task, RoutingContext context) {
        // 实现路由逻辑
        return agentRegistry.findAgentsByCapability("my-capability");
    }
    
    @Override
    public List<SubTask> decompose(String task) {
        // 实现任务分解
        return Arrays.asList(new SubTask("sub-task-1", "description"));
    }
}
```

### 3. 创建新的编排服务

使用 `CollaborationOrchestrator`：

```java
@Service
public class MyOrchestrator {
    @Autowired
    private CollaborationOrchestrator orchestrator;
    
    @Autowired
    private AgentRouter router;
    
    public CompletableFuture<CollaborationResult> collaborate(
            String task, String userId, String sessionId) {
        List<Agent> agents = router.route(task, new RoutingContext(userId, sessionId));
        CollaborationContext context = new CollaborationContext(userId, sessionId);
        context.setMode(WorkflowMode.PARALLEL);
        
        String collaborationId = orchestrator.createCollaboration(task, agents, context);
        return orchestrator.execute(collaborationId);
    }
}
```

## 性能考虑

### 1. 智能体查找优化

- 使用能力索引（`capabilityIndex`）加速查找
- 缓存常用智能体查询结果

### 2. 并行执行优化

- 使用 `CompletableFuture` 实现真正的并行执行
- 合理设置线程池大小
- 避免过度并行导致的资源竞争

### 3. 结果聚合优化

- 流式处理结果，避免内存积累
- 及时释放不需要的中间结果

## 安全考虑

### 1. 智能体访问控制

- 验证智能体身份
- 限制智能体访问权限

### 2. 工具访问控制

- MCP 工具访问需要授权
- 记录工具使用日志

### 3. 数据隔离

- 不同用户的协作任务隔离
- 敏感数据加密传输

## 未来扩展

1. **智能任务分解**: 基于 LLM 的智能任务分解
2. **负载均衡**: 基于智能体能力和负载的均衡分配
3. **结果质量评估**: 评估和优化协作结果质量
4. **动态策略调整**: 根据执行情况动态调整协作策略
5. **持久化支持**: 协作任务和结果的持久化存储
