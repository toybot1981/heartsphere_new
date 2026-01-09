# AgentScope Java API 实际发现

## 依赖信息

- **GroupId**: `io.agentscope`
- **ArtifactId**: `agentscope`
- **Version**: `1.0.5`
- **下载状态**: ✅ 已成功下载到本地 Maven 仓库

## 包结构

### 核心包

- `io.agentscope.core` - 核心功能
- `io.agentscope.core.agent` - Agent 基础类
- `io.agentscope.core.message` - 消息处理
- `io.agentscope.core.model` - 模型适配器
- `io.agentscope.core.tool` - 工具系统
- `io.agentscope.core.plan` - 任务规划
- `io.agentscope.core.memory` - 记忆管理
- `io.agentscope.core.session` - 会话管理

## 关键类 API

### 1. ReActAgent

**包名**: `io.agentscope.core.ReActAgent`

**关键方法**:
```java
// 静态方法：创建 Builder
public static ReActAgent.Builder builder()

// 实例方法：调用（返回 Mono<Msg>）
protected Mono<Msg> doCall(List<Msg> messages)
protected Mono<Msg> doCall(List<Msg> messages, Class<?> structuredOutputType)
protected Mono<Msg> doCall(List<Msg> messages, JsonNode structuredOutputSchema)

// 获取器方法
public Memory getMemory()
public String getSysPrompt()
public Model getModel()
public Toolkit getToolkit()
public int getMaxIters()
public PlanNotebook getPlanNotebook()
```

**重要发现**:
- 使用 Reactor 的 `Mono<Msg>` 返回类型（响应式编程）
- 支持结构化输出（`Class<?>` 和 `JsonNode` 两种方式）
- 有 `PlanNotebook` 支持任务规划
- 有 `Memory` 支持记忆管理

### 2. ReActAgent.Builder

**包名**: `io.agentscope.core.ReActAgent$Builder`

**关键方法**:
```java
// 基础配置
public Builder name(String)
public Builder description(String)
public Builder sysPrompt(String)
public Builder model(Model)
public Builder toolkit(Toolkit)
public Builder memory(Memory)
public Builder maxIters(int)

// 钩子函数
public Builder hook(Hook)
public Builder hooks(List<Hook>)

// 任务规划
public Builder planNotebook(PlanNotebook)
public Builder enablePlan()

// 记忆管理
public Builder longTermMemory(LongTermMemory)
public Builder longTermMemoryMode(LongTermMemoryMode)

// 技能管理
public Builder skillBox(SkillBox)

// 结构化输出
public Builder structuredOutputReminder(StructuredOutputReminder)

// RAG 支持
public Builder knowledge(Knowledge)
public Builder knowledges(List<Knowledge>)
public Builder ragMode(RAGMode)
public Builder retrieveConfig(RetrieveConfig)

// 执行配置
public Builder modelExecutionConfig(ExecutionConfig)
public Builder toolExecutionConfig(ExecutionConfig)
public Builder toolExecutionContext(ToolExecutionContext)

// 其他
public Builder enableMetaTool(boolean)
public Builder checkRunning(boolean)
public Builder statePersistence(StatePersistence)
public Builder enableOnlyForUserQueries(boolean)

// 构建
public ReActAgent build()
```

**重要发现**:
- **非常丰富的配置选项**：支持任务规划、记忆管理、RAG、技能管理等
- 有 `toolkit(Toolkit)` 方法用于注册工具集
- 支持多种高级功能（长期记忆、RAG、技能等）

### 3. Msg（消息）

**包名**: `io.agentscope.core.message.Msg`

**关键方法**:
```java
// 静态方法：创建 Builder
public static Msg.Builder builder()

// 获取器方法
public String getId()
public String getName()
public MsgRole getRole()
public List<ContentBlock> getContent()
public Map<String, Object> getMetadata()
public String getTimestamp()

// 内容块相关
public <T extends ContentBlock> boolean hasContentBlocks(Class<T>)
public <T extends ContentBlock> List<T> getContentBlocks(Class<T>)
public ContentBlock getFirstContentBlock()
public <T extends ContentBlock> T getFirstContentBlock(Class<T>)

// 文本内容
public String getTextContent()

// 结构化数据
public boolean hasStructuredData()
public <T> T getStructuredData(Class<T>)
public Map<String, Object> getStructuredData(boolean)

// 使用统计
public ChatUsage getChatUsage()
```

**重要发现**:
- 使用 `ContentBlock` 列表存储内容（支持多种类型的内容块）
- 有 `getTextContent()` 方法提取文本内容
- 支持结构化数据存储和提取
- 有工具调用相关的 ContentBlock（`ToolUseBlock`, `ToolResultBlock`）

### 4. DashScopeChatModel

**包名**: `io.agentscope.core.model.DashScopeChatModel`

**存在确认**: ✅ 已确认存在

**Builder 类**: `io.agentscope.core.model.DashScopeChatModel$Builder`

**关键方法**（推测）:
```java
public static Builder builder()
public Builder apiKey(String)
public Builder modelName(String)
// 其他配置方法...
public DashScopeChatModel build()
```

### 5. Toolkit（工具集）

**包名**: `io.agentscope.core.tool.Toolkit`

**关键方法**:
- 需要进一步查看具体 API
- 通过 `ReActAgent.Builder.toolkit(Toolkit)` 注册

### 6. 工具相关类

**发现的类**:
- `io.agentscope.core.message.ToolUseBlock` - 工具调用块
- `io.agentscope.core.message.ToolResultBlock` - 工具结果块
- `io.agentscope.core.formatter.dashscope.dto.DashScopeTool` - DashScope 工具定义
- `io.agentscope.core.formatter.dashscope.dto.DashScopeToolFunction` - DashScope 工具函数

## 响应式编程

**发现**:
- AgentScope 使用 **Reactor** 进行响应式编程
- `doCall()` 返回 `Mono<Msg>` 而不是直接返回 `Msg`
- 需要使用 `.block()` 或响应式方式处理结果

**流式响应**:
- 可能需要使用 `Mono` 的流式操作符（如 `doOnNext`）
- 或者框架可能提供专门的流式 API（需要进一步确认）

## 关键发现总结

### ✅ 已确认

1. **包名正确**: `io.agentscope.core.*`
2. **ReActAgent 存在**: 且有丰富的配置选项
3. **Builder 模式**: 使用 Builder 创建 Agent
4. **响应式编程**: 使用 Reactor 的 `Mono<Msg>`
5. **Msg 消息类**: 存在且功能丰富
6. **DashScopeChatModel**: 存在并支持 Builder 模式
7. **工具系统**: 存在 Toolkit 和工具相关的类
8. **任务规划**: 有 `PlanNotebook` 支持
9. **记忆管理**: 有 `Memory` 和 `LongTermMemory` 支持

### ⚠️ 需要进一步验证

1. **工具注册**: Tool 是注解，需要确认工具的具体注册方式
2. **AgentTool**: 如何使用 `AgentTool` 包装现有执行器
3. **流式响应处理**: 如何使用 `Mono` 的流式操作处理响应
4. **消息构建**: Msg.Builder 的其他方法（已确认 `textContent()`）

## 下一步行动

1. 创建实际可编译的原型代码
2. 验证 API 的实际使用方式
3. 测试工具集成
4. 测试流式响应

## 参考资源

- JAR 文件位置: `~/.m2/repository/io/agentscope/agentscope/1.0.5/agentscope-1.0.5.jar`
- 通过 `javap` 反编译查看 API

## 最后更新

2026-01-09 - 通过反编译 JAR 文件发现的实际 API
