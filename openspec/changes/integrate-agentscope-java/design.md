# Design: AgentScope Java Integration

## Architecture Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mentis System                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MentisAgentService                                     │
│  ├── IntentRecognizer (LLM-based)                       │
│  ├── TaskPlanner (LLM-based)                            │
│  ├── ExecutionEngine                                    │
│  │   ├── ComputerUseExecutor                            │
│  │   ├── CommandExecutor                                │
│  │   └── ScriptExecutor                                 │
│  └── ResponseGenerator (LLM-based)                      │
│                                                          │
│  Session Management                                     │
│  └── MentisSessionService                               │
│                                                          │
│  Message Storage                                        │
│  └── MentisMessageService                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mentis System                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MentisAgentService (AgentScope-based)                  │
│  └── ReActAgent (AgentScope)                            │
│      ├── Tools                                          │
│      │   ├── ComputerUseTool                            │
│      │   │   └── ComputerUseExecutor (wrapped)          │
│      │   ├── CommandTool                                │
│      │   │   └── CommandExecutor (wrapped)              │
│      │   └── ScriptTool                                 │
│      │       └── ScriptExecutor (wrapped)               │
│      ├── Planner (MetaPlanner)                          │
│      ├── Memory (optional)                              │
│      └── Structured Output                              │
│                                                          │
│  Session Management (retained)                          │
│  └── MentisSessionService                               │
│                                                          │
│  Message Storage (retained)                             │
│  └── MentisMessageService                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Component Design

### 1. MentisAgentScopeService

**职责**：包装 AgentScope ReActAgent，实现 MentisAgentService 接口

**实现要点**：
- 使用 AgentScope 的 `ReActAgent.builder()` 创建智能体
- 配置系统提示词（System Prompt）
- 注册工具（Tools）
- 配置 Planner（MetaPlanner）
- 处理流式响应，转换为 Mentis 格式

**关键代码结构**（基于 AgentScope Java 实际 API）：
```java
@Service
public class MentisAgentScopeServiceImpl implements MentisAgentService {
    private final ReActAgent agent;
    private final MentisSessionService sessionService;
    
    @PostConstruct
    public void init() {
        // 创建模型适配器（使用现有的 API Key 配置）
        ChatModel model = DashScopeChatModel.builder()
            .apiKey(getDashScopeApiKey())
            .modelName(getModelName())
            .build();
        
        // 创建工具列表
        List<Tool> tools = Arrays.asList(
            new ComputerUseTool(computerUseExecutor),
            new CommandTool(commandExecutor),
            new ScriptTool(scriptExecutor)
        );
        
        // 创建 ReActAgent
        this.agent = ReActAgent.builder()
            .name("Mentis")
            .sysPrompt("你是 Mentis，一个友好的智能助手...")
            .model(model)
            .tools(tools)
            .build();
    }
    
    @Override
    public void processMessageStream(Long userId, ChatRequestDTO request, 
                                    StreamResponseHandler handler) {
        // 创建输入消息
        Msg userMsg = Msg.builder()
            .textContent(request.getMessage())
            .build();
        
        // 使用 AgentScope 的流式调用
        agent.callStream(userMsg, (chunk) -> {
            // 转换为 ChatResponseDTO
            ChatResponseDTO dto = convertChunk(chunk, request.getSessionId());
            handler.handle(dto);
        }).block(); // 或使用响应式方式
    }
    
    private ChatResponseDTO convertChunk(Msg chunk, String sessionId) {
        ChatResponseDTO dto = new ChatResponseDTO();
        dto.setSessionId(sessionId);
        
        if (chunk.isToolCall()) {
            // 工具调用
            dto.setResponse("正在执行: " + chunk.getToolName());
            dto.setTaskId(chunk.getToolCallId());
        } else {
            // 文本内容
            dto.setResponse(chunk.getTextContent());
        }
        
        return dto;
    }
}
```

### 2. Tool Wrappers

**ComputerUseTool**：
- 包装 `ComputerUseExecutor`
- 实现 AgentScope 的 `Tool` 接口
- 描述工具功能和参数
- 处理工具调用结果

**CommandTool**：
- 包装 `CommandExecutor`
- 提供命令执行能力
- 参数验证和安全性检查

**ScriptTool**：
- 包装 `ScriptExecutor`
- 支持多种脚本语言
- 脚本执行和结果处理

### 3. Model Configuration

**适配器选择**：
- 优先使用 DashScope（已集成）
- 支持 OpenAI、Gemini 等（通过 AgentScope 适配器）
- 使用统一的模型配置（`AIService`）

**配置方式**：
```java
@Configuration
public class MentisAgentScopeConfig {
    @Bean
    public ChatModel createChatModel() {
        // 使用现有的 AIService 配置
        // 或直接使用 AgentScope 的模型适配器
        return DashScopeChatModel.builder()
            .apiKey(getApiKey())
            .modelName(getModelName())
            .build();
    }
}
```

### 4. Stream Processing

**流式响应流程**：
1. AgentScope ReActAgent 生成流式响应
2. 每个 chunk 包含部分内容或工具调用
3. 转换为 Mentis 的 `ChatResponseDTO` 格式
4. 通过 SSE 发送给前端

**关键转换逻辑**：
```java
private ChatResponseDTO convertChunk(AgentResponse chunk) {
    ChatResponseDTO dto = new ChatResponseDTO();
    dto.setSessionId(sessionId);
    dto.setMessageId(messageId);
    
    if (chunk.isToolCall()) {
        // 工具调用
        dto.setResponse("正在执行: " + chunk.getToolName());
        dto.setTaskId(chunk.getToolCallId());
    } else {
        // 文本内容
        dto.setResponse(chunk.getContent());
    }
    
    return dto;
}
```

## Integration Points

### 1. Model Adapter Integration

**方案 A**：使用 AgentScope 的模型适配器
- 优点：标准化，功能完整
- 缺点：可能与现有 AIService 配置重复

**方案 B**：适配现有的 AIService
- 优点：复用现有配置
- 缺点：需要编写适配层

**推荐**：方案 A，但保持与 AIService 的配置同步

### 2. Session Management

**保留现有实现**：
- `MentisSessionService` 保持不变
- 会话创建、查询、更新逻辑不变
- AgentScope 使用 Mentis 的会话 ID

### 3. Message Storage

**保留现有实现**：
- `MentisMessageService` 保持不变
- 消息存储格式不变
- AgentScope 响应转换为 Mentis 消息格式

### 4. Tool Execution

**集成策略**：
- 保留现有的执行器实现（`ComputerUseExecutor`、`CommandExecutor`、`ScriptExecutor`）
- 包装为 AgentScope 工具
- 工具调用通过 AgentScope 的机制触发

## Migration Strategy

### Phase 1: 并行实现（推荐）

1. 保留现有 `MentisAgentServiceImpl`
2. 创建新的 `MentisAgentScopeServiceImpl`
3. 通过配置开关选择实现
4. 充分测试新实现

### Phase 2: 灰度切换

1. 开发环境使用新实现
2. 测试环境验证
3. 生产环境灰度发布
4. 监控和优化

### Phase 3: 完全切换

1. 所有环境使用新实现
2. 标记旧实现为 deprecated
3. 评估删除旧代码

## Configuration

### application.yml

```yaml
mentis:
  enabled: true
  agentscope:
    enabled: true  # 是否使用 AgentScope 实现
    model:
      provider: dashscope  # 或 openai, gemini
      model-name: qwen-max
      api-key: ${DASHSCOPE_API_KEY}
    tools:
      computer-use:
        enabled: true
      command:
        enabled: true
      script:
        enabled: true
    planner:
      enabled: true  # 使用 MetaPlanner
    memory:
      enabled: false  # 长期记忆（可选）
    structured-output:
      enabled: true  # 结构化输出
```

## Performance Considerations

### 1. 流式响应延迟

**优化策略**：
- 使用 AgentScope 的原生流式能力
- 减少中间转换步骤
- 优化序列化性能

### 2. 工具调用性能

**优化策略**：
- 异步工具执行（如果 AgentScope 支持）
- 工具执行结果缓存
- 批量工具调用优化

### 3. 内存使用

**优化策略**：
- 流式处理，避免大量缓存
- 及时释放资源
- 限制并发请求数

## Security Considerations

### 1. 工具执行安全

**措施**：
- 使用 AgentScope 的安全沙箱（如果支持）
- 保留现有的安全验证逻辑
- 工具权限控制

### 2. API 安全

**措施**：
- 保持现有的认证授权机制
- 输入验证和过滤
- 输出内容安全检查

## Observability

### 1. 分布式追踪

**集成**：
- 使用 OpenTelemetry 追踪 AgentScope 调用
- 关联 Mentis 的业务追踪
- 可视化工具调用链路

### 2. 性能监控

**指标**：
- AgentScope 调用延迟
- 工具执行时间
- 流式响应吞吐量
- 错误率

### 3. 日志

**增强**：
- 结构化日志输出
- 关联追踪 ID
- 工具调用日志
- 决策过程日志

## Testing Strategy

### 1. 单元测试

- 工具包装类测试
- AgentScope 服务测试
- 响应转换测试

### 2. 集成测试

- 端到端流程测试
- 工具调用测试
- 流式响应测试

### 3. 性能测试

- 对比现有实现的性能
- 并发性能测试
- 内存使用测试

### 4. 兼容性测试

- API 兼容性验证
- 前端兼容性验证
- 数据兼容性验证

## Rollback Plan

### 1. 配置切换

通过 `mentis.agentscope.enabled=false` 快速切回原实现

### 2. 代码保留

保留原实现代码，标记为 deprecated，不立即删除

### 3. 数据兼容

确保数据库 schema 不变，可以无缝切换

## Open Questions

1. **AgentScope Java 的成熟度**：需要评估框架的稳定性和生产就绪性
2. **依赖兼容性**：需要确认与 Spring Boot 3.2.0 的完全兼容性
3. **性能对比**：需要实际测试对比性能和资源消耗
4. **学习曲线**：团队需要多长时间熟悉框架
5. **长期维护**：AgentScope Java 的长期维护和支持情况

## References

- AgentScope Java 官方文档（需要查找）
- ReAct 范式文档
- 当前 Mentis 实现代码
