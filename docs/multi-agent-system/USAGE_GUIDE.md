# 多智能体系统使用指南

## 概述

多智能体协作系统是一个可扩展的基础设施，支持多个智能体协同工作来解决复杂问题。当前系统实现了6个生活助手（时小光、康小健、学小知、心小暖、心小安、暖小阳）的多智能体协作。

## 架构说明

### 基础设施层

位于 `main/backend/src/main/java/com/heartsphere/multiagent/`，提供通用的多智能体协作能力：

- **core/** - 核心框架（Agent、AgentRegistry、BaseAgent）
- **orchestrator/** - 协作编排引擎
- **router/** - 智能体路由系统
- **protocol/a2a/** - Agent-to-Agent 协议
- **protocol/mcp/** - MCP 协议支持

### 应用场景层

位于 `main/backend/src/main/java/com/heartsphere/character/multiagent/`，实现生活助手特定的协作逻辑：

- **LifeAssistantRouter** - 生活助手路由策略
- **LifeAssistantOrchestrator** - 生活助手编排服务
- **agent/** - 6个生活助手 Agent 实现

## 快速开始

### 1. 后端使用

#### 创建协作请求

```java
@Autowired
private LifeAssistantOrchestrator orchestrator;

public void collaborate(String userRequest, String userId, String sessionId) {
    CompletableFuture<CollaborationResult> future = 
        orchestrator.collaborate(userRequest, userId, sessionId);
    
    future.thenAccept(result -> {
        if (result.isSuccess()) {
            System.out.println("协作成功: " + result.getResult());
        } else {
            System.out.println("协作失败: " + result.getErrors());
        }
    });
}
```

#### 通过 API 使用

```bash
# 创建协作请求
curl -X POST http://localhost:8080/api/multi-agent/collaborate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "request": "我想提高工作效率，同时保持健康的生活方式",
    "sessionId": "session-123"
  }'

# 获取协作状态
curl http://localhost:8080/api/multi-agent/collaboration/{collaborationId}/status

# 获取协作结果
curl -X POST http://localhost:8080/api/multi-agent/collaboration/{collaborationId}/execute
```

### 2. 前端使用

```tsx
import { MultiAgentCollaboration } from './components/multiAgent';

function App() {
  return (
    <MultiAgentCollaboration
      userId="user-123"
      sessionId="session-456"
      onClose={() => console.log('关闭')}
    />
  );
}
```

## 6个生活助手

### 时小光 - 时间管理导师
- **能力**: 时间管理、效率提升、拖延症帮助
- **技能**: 时间审计、任务分解、番茄工作法、优先级矩阵、习惯追踪、目标设定、拖延症诊断、时间块规划

### 康小健 - 健康生活顾问
- **能力**: 健康、营养、运动、健康生活
- **技能**: 健康数据追踪、个性化饮食建议、运动计划、睡眠改善、压力管理、健康习惯、健康风险评估、体重管理

### 学小知 - 学习成长导师
- **能力**: 学习、教育、学习方法、成长
- **技能**: 学习计划、知识体系构建、记忆技巧、笔记方法、学习方法优化、学习动力、考试准备、学习进度追踪

### 心小暖 - 情绪陪伴师
- **能力**: 情绪、情感支持、陪伴、共情
- **技能**: 情绪支持、情绪识别、情绪调节、安慰对话、积极思维、共情表达、情感陪伴、情绪追踪

### 心小安 - 心理健康守护者
- **能力**: 心理健康、心理支持、健康、治疗
- **技能**: 心理健康评估、焦虑管理、抑郁支持、压力应对、自我关怀、正念练习、心理韧性、心理健康教育

### 暖小阳 - 情感陪伴伙伴
- **能力**: 陪伴、情感支持、温暖、关怀
- **技能**: 温暖陪伴、倾听支持、鼓励、情感确认、日常关怀、庆祝分享、困难陪伴、生活指导

## 协作模式

### 顺序执行（SEQUENTIAL）
智能体按顺序执行，前一个智能体的结果作为下一个智能体的输入。

### 并行执行（PARALLEL）
多个智能体同时执行，提高效率。

### 条件分支（CONDITIONAL）
根据条件选择执行路径（简化实现中按顺序执行）。

## 扩展开发

### 创建新的 Agent

```java
@Component
public class MyAgent extends BaseAgent {
    public MyAgent(SkillExecutor skillExecutor) {
        super("my-agent", "My Agent", "Agent description", 
              characterId, skillExecutor);
        addCapability("my-capability");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 实现具体逻辑
        return AgentResult.success("Result");
    }
}
```

### 创建新的路由策略

```java
@Component
public class MyRouter implements AgentRouter {
    @Override
    public List<Agent> route(String task, RoutingContext context) {
        // 实现路由逻辑
        return agents;
    }
    
    @Override
    public List<SubTask> decompose(String task) {
        // 实现任务分解
        return subTasks;
    }
}
```

## 配置说明

### Agent 自动注册

系统启动时，`LifeAssistantAgentConfig` 会自动注册所有生活助手 Agent 到 `AgentRegistry`。

### MCP 工具访问

通过 `McpProtocol` 接口为智能体提供 MCP 工具访问：

```java
@Autowired
private McpProtocol mcpProtocol;

// 授予工具访问权限
mcpProtocol.grantToolAccess("agent-id", Set.of("tool-name"));

// 执行工具
McpToolResult result = mcpProtocol.executeTool("agent-id", "tool-name", parameters);
```

## 常见问题

### Q: 如何添加新的生活助手？
A: 创建新的 Agent 类继承 `LifeAssistantAgent`，注册技能，并在 `LifeAssistantAgentConfig` 中注册。

### Q: 如何自定义路由策略？
A: 实现 `AgentRouter` 接口，创建自定义路由类，并在 `LifeAssistantOrchestrator` 中使用。

### Q: 如何集成 MCP 工具？
A: 使用 `McpProtocol` 接口，为智能体授予工具访问权限，智能体即可在 `doExecute` 方法中使用工具。

## 性能优化建议

1. **并行执行**: 对于独立的子任务，使用并行模式提高效率
2. **结果缓存**: 对于重复请求，可以缓存结果
3. **超时设置**: 设置合理的超时时间，避免长时间等待
4. **错误恢复**: 实现错误恢复机制，提高系统稳定性
