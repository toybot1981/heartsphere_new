# Design: Evaluate AgentScope Java for Computer-Use

## 设计目标

评估 AgentScope Java 的工具系统（AgentTool/Toolkit）是否能够支持 Mentis 的 computer-use 场景，即为 AI 提供一个可以操作的虚拟机环境。

## 当前架构

### Mentis 当前实现

#### 虚拟机管理（VmManager）

```
VmManager (接口)
  ├── createVmForSession(sessionId, config) → VmInstance
  ├── getVmForSession(sessionId) → VmInstance
  ├── getVmStatus(vmId) → VmStatus
  ├── deleteVmForSession(sessionId)
  ├── startVm(vmId)
  ├── stopVm(vmId)
  ├── createSnapshot(vmId) → snapshotId
  └── restoreSnapshot(vmId, snapshotId)
```

**特点**:
- 会话与虚拟机绑定（sessionId → vmId）
- 虚拟机生命周期管理
- 快照管理
- 资源统计和清理

#### Computer-Use 执行器（ComputerUseExecutor）

```
ComputerUseExecutor (接口)
  ├── executeCommand(sessionId, command) → CommandResult
  ├── executeScript(sessionId, script, language) → ScriptResult
  └── performGuiAction(sessionId, action) → GuiActionResult
```

**特点**:
- 基于 sessionId 获取对应的虚拟机
- 在虚拟机内执行命令、脚本和 GUI 操作
- 返回结构化结果（exitCode、stdout、stderr 等）

#### 当前工作流程

```
用户消息
  ↓
IntentRecognizer.recognize()
  ↓
TaskPlanner.planTask()
  ↓
ExecutionEngine.execute()
  ├── 根据任务类型选择执行器
  │   ├── ComputerUseExecutor.executeCommand()
  │   ├── ComputerUseExecutor.executeScript()
  │   └── ComputerUseExecutor.performGuiAction()
  └── 收集执行结果
  ↓
ResponseGenerator.generate()
  ↓
返回响应
```

**关键点**:
- sessionId 在流程中传递，用于获取虚拟机
- 执行器是同步调用，直接返回结果
- 执行结果用于生成响应

## AgentScope 工具系统架构

### AgentTool 接口

```java
public interface AgentTool {
    String getName();
    String getDescription();
    Map<String, Object> getParameters(); // JSON Schema
    Mono<ToolResultBlock> callAsync(ToolCallParam param);
}
```

**特点**:
- 异步调用（返回 `Mono<ToolResultBlock>`）
- 参数通过 `ToolCallParam` 传递
- 结果通过 `ToolResultBlock` 返回

### Toolkit 工具管理

```java
Toolkit toolkit = new Toolkit();
toolkit.registerAgentTool(new MyTool());
AgentTool tool = toolkit.getTool("tool_name");
Mono<ToolResultBlock> result = toolkit.callTool(param);
```

**特点**:
- 工具注册到 Toolkit
- Agent 自动发现和调用工具
- 工具调用是异步的

### ReActAgent 工具调用流程

```
用户消息
  ↓
ReActAgent (内部推理)
  ├── 决定是否需要调用工具
  ├── 选择合适的工具
  ├── 调用 Toolkit.callTool()
  │   └── tool.callAsync(param) → Mono<ToolResultBlock>
  ├── 获取工具执行结果
  └── 继续推理或生成响应
```

**关键点**:
- Agent 自动决定是否调用工具
- 工具调用是异步的
- 工具结果用于后续推理

## 集成挑战分析

### 挑战 1: 会话上下文传递

**问题**:
- AgentScope 的工具调用如何传递 sessionId？
- ToolCallParam 是否支持自定义参数？
- 如何在工具调用链中保持上下文？

**当前理解**:
- `ToolCallParam` 包含工具调用参数（从 Agent 推理得到）
- 参数是通过 JSON Schema 定义的
- 需要在 JSON Schema 中包含 sessionId 字段

**解决方案**:
1. **方案 A：在工具参数中包含 sessionId**
   - 在 `getParameters()` 的 JSON Schema 中定义 sessionId
   - Agent 在调用工具时传入 sessionId
   - 工具从 `ToolCallParam.getArguments()` 中提取 sessionId

2. **方案 B：从消息中提取 sessionId**
   - sessionId 作为消息的一部分
   - 工具调用时从消息上下文提取 sessionId
   - 需要验证 AgentScope 是否支持这种机制

3. **方案 C：使用 ThreadLocal 或 Context**
   - 在工具调用前设置 sessionId 到上下文
   - 工具从上下文中获取 sessionId
   - 需要验证 AgentScope 的上下文机制

### 挑战 2: 虚拟机状态管理

**问题**:
- 工具调用时如何获取虚拟机状态？
- 如何处理虚拟机不存在的情况？
- 如何处理虚拟机状态变更？

**解决方案**:
1. **在工具调用前验证虚拟机**
   - 在 `callAsync()` 中先调用 `VmManager.getVmForSession(sessionId)`
   - 如果虚拟机不存在，返回错误或自动创建
   - 检查虚拟机状态（运行中、停止等）

2. **缓存虚拟机状态**
   - 在工具包装层缓存虚拟机状态
   - 定期刷新缓存
   - 处理状态变更通知

3. **错误处理**
   - 虚拟机不存在：返回明确的错误信息
   - 虚拟机停止：尝试启动或返回错误
   - 虚拟机异常：记录日志并返回错误

### 挑战 3: 长时间运行操作

**问题**:
- 命令执行可能需要较长时间
- 脚本执行可能需要更长时间
- 工具调用是否有超时限制？

**解决方案**:
1. **异步执行和超时控制**
   - 使用 `Mono.timeout()` 设置超时
   - 对于长时间运行的操作，使用后台执行
   - 提供进度反馈机制（如果支持）

2. **任务拆分**
   - 将长时间运行的任务拆分为多个步骤
   - 每个步骤作为一个工具调用
   - Agent 可以根据结果决定下一步操作

3. **后台任务管理**
   - 对于长时间运行的操作，启动后台任务
   - 立即返回任务ID
   - 提供查询任务状态的工具

### 挑战 4: 工具参数定义

**问题**:
- JSON Schema 是否能正确定义所有参数？
- 复杂对象（如 GuiAction）如何定义？
- 可选参数如何处理？

**解决方案**:
1. **简化参数定义**
   - 将复杂对象拆分为简单参数
   - 例如：GuiAction 拆分为 actionType, target, value

2. **使用 JSON Schema 的完整功能**
   - 使用 `required` 定义必需参数
   - 使用 `enum` 定义枚举值
   - 使用 `oneOf` 定义联合类型

3. **参数验证**
   - 在 `callAsync()` 中验证参数
   - 提供清晰的错误信息
   - 处理参数缺失或格式错误

## 原型设计

### VmManagerTool 设计

```java
public class VmManagerTool implements AgentTool {
    private final VmManager vmManager;
    
    @Override
    public String getName() {
        return "vm_manager";
    }
    
    @Override
    public String getDescription() {
        return "管理虚拟机的生命周期，包括创建、删除、状态查询、快照管理";
    }
    
    @Override
    public Map<String, Object> getParameters() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "action", Map.of(
                    "type", "string",
                    "enum", List.of("create", "get_status", "delete", "create_snapshot", "restore_snapshot")
                ),
                "sessionId", Map.of("type", "string"),
                "config", Map.of("type", "object"), // 可选，用于创建虚拟机
                "snapshotId", Map.of("type", "string") // 可选，用于恢复快照
            ),
            "required", List.of("action", "sessionId")
        );
    }
    
    @Override
    public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
        Map<String, Object> args = param.getArguments();
        String action = (String) args.get("action");
        String sessionId = (String) args.get("sessionId");
        
        return switch (action) {
            case "create" -> createVm(sessionId, args);
            case "get_status" -> getVmStatus(sessionId);
            case "delete" -> deleteVm(sessionId);
            case "create_snapshot" -> createSnapshot(sessionId);
            case "restore_snapshot" -> restoreSnapshot(sessionId, args);
            default -> Mono.just(createErrorResult("Unknown action: " + action));
        };
    }
}
```

**设计要点**:
- 将多个虚拟机操作合并为一个工具
- 通过 `action` 参数区分不同操作
- sessionId 作为必需参数
- 异步返回结果

### ComputerUseTool 设计

```java
public class ComputerUseTool implements AgentTool {
    private final ComputerUseExecutor executor;
    private final VmManager vmManager;
    
    @Override
    public String getName() {
        return "computer_use";
    }
    
    @Override
    public String getDescription() {
        return "在虚拟机中执行命令、脚本或 GUI 操作";
    }
    
    @Override
    public Map<String, Object> getParameters() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "operation", Map.of(
                    "type", "string",
                    "enum", List.of("execute_command", "execute_script", "perform_gui_action")
                ),
                "sessionId", Map.of("type", "string"),
                "command", Map.of("type", "string"), // 用于 execute_command
                "script", Map.of("type", "string"), // 用于 execute_script
                "language", Map.of("type", "string"), // 用于 execute_script
                "actionType", Map.of("type", "string"), // 用于 perform_gui_action
                "target", Map.of("type", "string"), // 用于 perform_gui_action
                "value", Map.of("type", "string") // 用于 perform_gui_action
            ),
            "required", List.of("operation", "sessionId")
        );
    }
    
    @Override
    public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
        Map<String, Object> args = param.getArguments();
        String operation = (String) args.get("operation");
        String sessionId = (String) args.get("sessionId");
        
        // 验证虚拟机是否存在
        VmInstance vm = vmManager.getVmForSession(sessionId);
        if (vm == null) {
            return Mono.just(createErrorResult("No VM found for session: " + sessionId));
        }
        
        return switch (operation) {
            case "execute_command" -> executeCommand(sessionId, args);
            case "execute_script" -> executeScript(sessionId, args);
            case "perform_gui_action" -> performGuiAction(sessionId, args);
            default -> Mono.just(createErrorResult("Unknown operation: " + operation));
        };
    }
}
```

**设计要点**:
- 将命令执行、脚本执行、GUI 操作合并为一个工具
- 通过 `operation` 参数区分不同操作
- 在工具调用前验证虚拟机
- 异步执行并返回结果

### 会话上下文传递设计

**方案选择**: 方案 A - 在工具参数中包含 sessionId

**理由**:
1. 最直接和明确的方案
2. 不需要依赖 AgentScope 的特殊机制
3. 易于理解和调试

**实现方式**:
1. 在 Agent 的系统提示词中说明：所有工具调用必须包含 sessionId
2. 在工具的 JSON Schema 中定义 sessionId 为必需参数
3. Agent 在调用工具时从消息中提取 sessionId 并传入
4. 工具从参数中提取 sessionId 并使用

**示例**:
```java
// Agent 系统提示词
String sysPrompt = """
    你是 Mentis，一个智能助手，可以操作虚拟机。
    
    重要：所有工具调用都必须包含 sessionId 参数。
    sessionId 从用户消息或会话上下文中获取。
    """;

// 工具参数定义
"properties", Map.of(
    "sessionId", Map.of(
        "type", "string",
        "description", "会话ID，用于标识对应的虚拟机"
    ),
    ...
),
"required", List.of("sessionId", ...)
```

## 评估标准

### 可行性评估标准

1. **技术可行性**
   - AgentTool 接口能否满足需求？
   - Toolkit 机制是否适用？
   - 是否有无法解决的技术障碍？

2. **功能完整性**
   - 能否实现所有 Computer-Use 功能？
   - 功能是否与原实现等价？
   - 是否有功能缺失？

3. **性能影响**
   - 工具包装的性能开销是否可接受？
   - 异步调用对响应时间的影响？
   - 资源消耗是否增加？

4. **复杂度**
   - 集成复杂度是否合理？
   - 维护成本是否可接受？
   - 代码清晰度如何？

### 评估结果分类

1. **完全可行**
   - 所有功能都能实现
   - 性能影响可接受
   - 复杂度合理

2. **有条件可行**
   - 大部分功能能实现
   - 部分功能需要特殊处理
   - 有明确的限制条件

3. **不可行**
   - 关键技术障碍无法解决
   - 功能缺失严重
   - 性能影响不可接受

## 下一步

基于评估结果，决定：
1. 如果可行：将集成方案纳入 `integrate-agentscope-java` 提案
2. 如果有条件可行：调整集成方案，明确限制条件
3. 如果不可行：记录原因，考虑替代方案
