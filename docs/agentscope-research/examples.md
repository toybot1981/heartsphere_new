# AgentScope Java 示例代码收集

## 官方示例

### 基础示例（来自用户提供的信息）

```java
import io.agentscope.core.ReActAgent;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.message.Msg;

// 创建智能体
ReActAgent agent = ReActAgent.builder()
    .name("Assistant")
    .sysPrompt("你是一个有帮助的 AI 助手。")
    .model(DashScopeChatModel.builder()
        .apiKey(System.getenv("DASHSCOPE_API_KEY"))
        .modelName("qwen-max")
        .build())
    .build();

// 调用智能体
Msg response = agent.call(Msg.builder()
    .textContent("Hello!")
    .build()).block();

System.out.println(response.getTextContent());
```

## GitHub 仓库示例

**仓库地址**：https://github.com/agentscope-ai/agentscope-java

**查找步骤**：
1. 访问 GitHub 仓库
2. 查看 `examples/` 目录
3. 查看 README 中的示例
4. 查看单元测试代码作为示例参考

## 待收集的示例类型

### 1. 基础使用示例

- [ ] 最简单的 Agent 创建和调用
- [ ] 配置不同的模型适配器
- [ ] 设置系统提示词

### 2. 工具集成示例

- [ ] 创建自定义工具
- [ ] 注册工具到 Agent
- [ ] 工具调用示例
- [ ] 工具参数传递示例

### 3. 流式响应示例

- [ ] 流式调用基本示例
- [ ] 流式数据处理
- [ ] 流式错误处理

### 4. 会话管理示例

- [ ] 会话创建和使用
- [ ] 会话状态管理
- [ ] 跨消息上下文保持

### 5. 高级特性示例

- [ ] 结构化输出示例
- [ ] 钩子函数示例
- [ ] 多智能体协作示例
- [ ] 长期记忆示例

### 6. Spring Boot 集成示例

- [ ] 作为 Spring Bean 使用
- [ ] 配置管理示例
- [ ] 生命周期管理示例

## 实际收集计划

1. **访问官方资源**：
   - GitHub 仓库的 examples 目录
   - 官方文档中的代码示例
   - 社区分享的示例

2. **创建测试代码**：
   - 在原型项目中创建示例
   - 验证 API 使用方式
   - 记录问题和发现

3. **整理和分析**：
   - 按功能分类整理
   - 添加注释说明
   - 标识最佳实践

## 示例代码模板

### Mentis 集成相关的示例

**工具包装示例**（待实现）：
```java
// 将 ComputerUseExecutor 包装为工具
public class ComputerUseTool implements Tool {
    private final ComputerUseExecutor executor;
    
    public ComputerUseTool(ComputerUseExecutor executor) {
        this.executor = executor;
    }
    
    // 实现 Tool 接口
    // 具体实现待确认 API
}
```

**流式响应处理示例**（待实现）：
```java
// 将 AgentScope 流式响应转换为 Mentis 格式
agent.callStream(msg, (chunk) -> {
    ChatResponseDTO dto = convertToDTO(chunk);
    handler.handle(dto);
});
```

## 参考资源

- GitHub 仓库：https://github.com/agentscope-ai/agentscope-java
- 官方文档示例：https://java.agentscope.io/zh/quickstart/agent.html
- 社区讨论和示例

## 最后更新

2026-01-09 - 初始示例收集框架，待补充具体示例代码
