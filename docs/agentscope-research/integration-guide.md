# AgentScope Java 集成指南

## 集成目标

将 AgentScope Java 框架集成到 Mentis 系统中，替代当前的手动编排实现，简化架构并增强功能。

## 集成策略

### 策略选择：渐进式迁移

**原因**：
- 降低风险，确保稳定性
- 允许回退
- 逐步验证功能对等性

**步骤**：
1. 并行实现（新实现 + 旧实现）
2. 配置开关切换
3. 充分测试
4. 逐步迁移
5. 移除旧实现

## 1. 依赖集成

### 添加 Maven 依赖

```xml
<!-- 在 backend/pom.xml 中添加 -->
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope</artifactId>
    <version>1.0.5</version>
</dependency>
```

### 验证依赖

```bash
mvn dependency:tree | grep agentscope
mvn dependency:analyze
```

**检查项**：
- 依赖是否正确下载
- 是否有依赖冲突
- 传递依赖是否合理

## 2. 核心服务集成

### 创建新的服务实现

```java
@Service
@ConditionalOnProperty(prefix = "mentis", name = "agentscope.enabled", havingValue = "true")
public class MentisAgentScopeServiceImpl implements MentisAgentService {
    
    private final ReActAgent agent;
    private final MentisSessionService sessionService;
    
    @PostConstruct
    public void init() {
        // 创建 ReActAgent
        this.agent = ReActAgent.builder()
            .name("Mentis")
            .sysPrompt(createSystemPrompt())
            .model(createModel())
            .tools(createTools())
            .build();
    }
    
    @Override
    public void processMessageStream(Long userId, ChatRequestDTO request, 
                                    StreamResponseHandler handler) {
        // 实现流式处理
    }
}
```

### 保留现有实现

```java
@Service
@ConditionalOnProperty(prefix = "mentis", name = "agentscope.enabled", havingValue = "false", matchIfMissing = true)
public class MentisAgentServiceImpl implements MentisAgentService {
    // 现有实现，作为回退
}
```

### 配置开关

```yaml
# application.yml
mentis:
  enabled: true
  agentscope:
    enabled: false  # 默认使用旧实现
```

## 3. 工具包装集成

### 包装 CommandExecutor

```java
public class CommandTool implements Tool {
    private final CommandExecutor executor;
    
    public CommandTool(CommandExecutor executor) {
        this.executor = executor;
    }
    
    @Override
    public String getName() {
        return "command_executor";
    }
    
    @Override
    public String getDescription() {
        return "执行系统命令的工具。输入格式：{\"command\": \"命令内容\"}";
    }
    
    @Override
    public ToolResult call(String input) {
        try {
            // 解析 JSON 输入
            JsonNode json = objectMapper.readTree(input);
            String command = json.get("command").asText();
            
            // 调用现有执行器
            CommandResult result = executor.execute(command);
            
            // 转换为 ToolResult
            return ToolResult.success(result.getOutput());
        } catch (Exception e) {
            return ToolResult.error("命令执行失败: " + e.getMessage());
        }
    }
}
```

### 包装 ComputerUseExecutor

```java
public class ComputerUseTool implements Tool {
    private final ComputerUseExecutor executor;
    
    // 类似的实现
}
```

### 工具注册

```java
@Configuration
public class AgentScopeToolsConfig {
    
    @Bean
    public List<Tool> agentScopeTools(
            CommandExecutor commandExecutor,
            ComputerUseExecutor computerUseExecutor,
            ScriptExecutor scriptExecutor) {
        return Arrays.asList(
            new CommandTool(commandExecutor),
            new ComputerUseTool(computerUseExecutor),
            new ScriptTool(scriptExecutor)
        );
    }
}
```

## 4. 流式响应集成

### 实现流式处理

```java
@Override
public void processMessageStream(Long userId, ChatRequestDTO request, 
                                StreamResponseHandler handler) {
    String sessionId = request.getSessionId();
    String messageId = "msg_" + System.currentTimeMillis();
    
    // 创建消息
    Msg userMsg = Msg.builder()
        .textContent(request.getMessage())
        .sessionId(sessionId)
        .build();
    
    // 流式调用
    agent.callStream(userMsg)
        .doOnNext(chunk -> {
            // 转换为 ChatResponseDTO
            ChatResponseDTO dto = convertChunkToDTO(chunk, sessionId, messageId);
            handler.handle(dto);
        })
        .doOnError(error -> {
            // 错误处理
            ChatResponseDTO errorDTO = createErrorResponse(sessionId, messageId, error);
            handler.handle(errorDTO);
        })
        .block();
}
```

### 转换函数

```java
private ChatResponseDTO convertChunkToDTO(Msg chunk, String sessionId, String messageId) {
    ChatResponseDTO dto = new ChatResponseDTO();
    dto.setSessionId(sessionId);
    dto.setMessageId(messageId);
    
    if (chunk.isToolCall()) {
        dto.setResponse("正在执行: " + chunk.getToolName());
        dto.setTaskId(chunk.getToolCallId());
    } else {
        dto.setResponse(chunk.getTextContent());
    }
    
    return dto;
}
```

## 5. 会话管理集成

### 保留现有会话管理

```java
// 继续使用现有的 MentisSessionService
@Service
public class MentisAgentScopeServiceImpl implements MentisAgentService {
    
    private final MentisSessionService sessionService;
    
    @Override
    public void processMessageStream(...) {
        // 获取会话
        MentisSession session = sessionService.getSession(sessionId);
        
        // 传递会话上下文
        Msg userMsg = Msg.builder()
            .textContent(request.getMessage())
            .sessionId(sessionId)
            .context(session.getContext())
            .build();
    }
}
```

### 可选的 AgentScope Session

如果 AgentScope 的 Session 功能有价值，可以考虑：
- 评估 AgentScope Session 的功能
- 对比与现有实现的差异
- 决定是否需要集成

## 6. 配置管理

### application.yml

```yaml
mentis:
  enabled: true
  agentscope:
    enabled: false  # 默认 false，使用旧实现
    model:
      provider: dashscope
      api-key: ${DASHSCOPE_API_KEY}
      model-name: qwen-max
      temperature: 0.7
      max-tokens: 2000
    tools:
      command:
        enabled: true
      computer-use:
        enabled: true
      script:
        enabled: true
```

### 配置类

```java
@ConfigurationProperties(prefix = "mentis.agentscope")
@Data
public class AgentScopeProperties {
    private boolean enabled = false;
    private ModelConfig model = new ModelConfig();
    private ToolsConfig tools = new ToolsConfig();
    
    @Data
    public static class ModelConfig {
        private String provider;
        private String apiKey;
        private String modelName;
        private Double temperature;
        private Integer maxTokens;
    }
    
    @Data
    public static class ToolsConfig {
        private boolean command = true;
        private boolean computerUse = true;
        private boolean script = true;
    }
}
```

## 7. 测试策略

### 单元测试

```java
@Test
public void testAgentCreation() {
    ReActAgent agent = createTestAgent();
    assertNotNull(agent);
}

@Test
public void testToolCall() {
    // 测试工具调用
}
```

### 集成测试

```java
@SpringBootTest
public class AgentScopeIntegrationTest {
    
    @Autowired
    private MentisAgentService agentService;
    
    @Test
    public void testStreamingResponse() {
        // 测试流式响应
    }
}
```

### 对比测试

```java
@Test
public void testFunctionEquivalence() {
    // 对比新旧实现的响应
    // 验证功能对等性
}
```

## 8. 迁移计划

### Phase 1: 原型验证（已完成）

- 创建原型代码
- 验证核心功能
- 评估可行性

### Phase 2: 并行实现

- 实现新的 AgentScope 版本
- 保留旧实现
- 通过配置开关切换

### Phase 3: 测试验证

- 单元测试
- 集成测试
- 性能测试
- 功能对比测试

### Phase 4: 灰度发布

- 开发环境使用新实现
- 测试环境验证
- 生产环境小范围试用

### Phase 5: 全面切换

- 所有环境使用新实现
- 监控和优化
- 移除旧实现（可选）

## 9. 回退策略

### 配置回退

```yaml
# 快速切回旧实现
mentis:
  agentscope:
    enabled: false
```

### 代码回退

- 保留旧实现代码
- 标记为 deprecated
- 不立即删除

## 10. 监控和优化

### 监控指标

- 响应时间
- 错误率
- 工具调用频率
- 资源消耗

### 优化方向

- 系统提示词优化
- 工具描述优化
- 模型参数调整
- 缓存策略

## 潜在问题和解决方案

### 问题 1: API 不兼容

**解决方案**：
- 创建适配层
- 封装差异
- 逐步适配

### 问题 2: 性能下降

**解决方案**：
- 性能测试和优化
- 调整配置参数
- 必要时回退

### 问题 3: 功能缺失

**解决方案**：
- 保留必要的自定义实现
- 通过工具扩展功能
- 使用钩子函数

## 参考资源

- 官方文档：https://java.agentscope.io/zh/intro.html
- API 参考：https://runtime.agentscope.io/zh/api/index.html
- GitHub：https://github.com/agentscope-ai/agentscope-java

## 最后更新

2026-01-09 - 初始集成指南，基于已知信息和推测
