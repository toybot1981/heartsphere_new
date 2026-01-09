# AgentScope 工具调用上下文需求分析

## 分析日期

2026-01-09

## 分析目标

分析 AgentScope 工具系统在 Computer-Use 场景中的上下文传递需求，特别是 sessionId 的传递机制、工具执行结果的反馈需求和工具调用的异步特性。

## 一、工具调用上下文信息需求

### 1.1 sessionId（会话ID）- 必需

**用途**:
- 标识用户会话
- 通过 `VmManager.getVmForSession(sessionId)` 获取对应的虚拟机
- 用于权限验证和审计日志

**来源**:
- 用户消息中的 sessionId（从 ChatRequestDTO 中获取）
- 会话上下文（从 MentisSessionService 获取）

**传递方式（待验证）**:
1. **方案 A：在工具参数中包含 sessionId**
   - 在工具的 JSON Schema 中定义 sessionId 为必需参数
   - Agent 在调用工具时从消息中提取 sessionId 并传入
   - 工具从 `ToolCallParam.getInput()` 中提取 sessionId（返回 `Map<String, Object>`）

2. **方案 B：从消息元数据中提取**
   - sessionId 作为消息的元数据（metadata）
   - 工具调用时从消息上下文提取 sessionId
   - 需要验证 AgentScope 是否支持消息元数据

3. **方案 C：使用 ThreadLocal 或 Context**
   - 在工具调用前设置 sessionId 到上下文（如 Reactor Context）
   - 工具从上下文中获取 sessionId
   - 需要验证 AgentScope 是否支持这种机制

**当前理解（基于 API 验证）**:
- `ToolCallParam` 包含工具调用参数
- 参数通过 `ToolCallParam.getInput()` 获取（返回 `Map<String, Object>`）✅ 已确认
- `ToolCallParam.getToolUseBlock()` 返回 `ToolUseBlock`，也包含 `getInput()` 方法 ✅
- `ToolCallParam.getContext()` 返回 `ToolExecutionContext`，可能用于传递上下文 ✅
- 参数是在工具的 JSON Schema 中定义的
- **推荐方案**：方案 A（在工具参数中包含 sessionId）

### 1.2 userId（用户ID）- 可选

**用途**:
- 权限验证（验证用户是否有权限操作虚拟机）
- 审计日志（记录谁执行了什么操作）
- 资源配额（限制用户的虚拟机资源使用）

**来源**:
- 用户消息中的 userId（从 ChatRequestDTO 中获取）
- 从 sessionId 推导（通过 MentisSessionService 获取会话对应的用户）

**传递方式**:
- 可以作为工具参数传递
- 或从 sessionId 推导（如果会话包含用户信息）

### 1.3 虚拟机状态（自动获取）

**用途**:
- 验证虚拟机是否存在
- 验证虚拟机是否运行中
- 决定是否需要先启动虚拟机

**获取方式**:
- 通过 `VmManager.getVmForSession(sessionId)` 获取虚拟机实例
- 通过 `VmManager.getVmStatus(vmId)` 获取虚拟机状态

**验证时机**:
- 在工具调用开始时验证
- 如果虚拟机不存在，返回错误或自动创建（取决于工具类型）

## 二、工具执行结果反馈需求

### 2.1 命令执行结果（CommandResult）

**结果结构**:
```java
class CommandResult {
    int exitCode;      // 退出码（0=成功，非0=失败）
    String stdout;     // 标准输出
    String stderr;     // 标准错误
}
```

**反馈需求**:
- **结构化结果**：需要将 exitCode、stdout、stderr 传递给 Agent
- **错误处理**：exitCode 非 0 时，Agent 需要知道命令失败
- **输出内容**：stdout 和 stderr 需要传递给 Agent，用于后续推理

**AgentScope 工具结果格式**:
- `ToolResultBlock` 包含 `content`（`List<ContentBlock>`）
- 可以使用 `TextBlock` 包含文本结果
- 可以使用 `ToolResultBlock.isError()` 标识错误

**转换方案**:
```java
ToolResultBlock.builder()
    .content(Arrays.asList(
        TextBlock.builder()
            .text(String.format("Exit Code: %d\nStdout: %s\nStderr: %s", 
                exitCode, stdout, stderr))
            .build()
    ))
    .isError(exitCode != 0)
    .build()
```

### 2.2 脚本执行结果（ScriptResult）

**结果结构**:
```java
class ScriptResult {
    boolean success;   // 是否成功
    String output;     // 脚本输出
    String error;      // 错误信息
}
```

**反馈需求**:
- **成功/失败标识**：success 字段需要传递给 Agent
- **输出内容**：output 需要传递给 Agent
- **错误信息**：error 需要传递给 Agent（如果有）

**转换方案**:
```java
ToolResultBlock.builder()
    .content(Arrays.asList(
        TextBlock.builder()
            .text(success ? output : String.format("Error: %s\nOutput: %s", error, output))
            .build()
    ))
    .isError(!success)
    .build()
```

### 2.3 GUI 操作结果（GuiActionResult）

**结果结构**:
```java
class GuiActionResult {
    boolean success;       // 是否成功
    String screenshot;     // 截图（base64 或 URL）
    String message;        // 操作消息
}
```

**反馈需求**:
- **成功/失败标识**：success 字段需要传递给 Agent
- **截图信息**：screenshot 非常重要，用于视觉理解
- **操作消息**：message 提供额外的上下文信息

**AgentScope 工具结果格式**:
- `ContentBlock` 可能支持图片（需要验证）
- 如果支持，可以使用 `ImageBlock` 包含截图
- 如果不支持，可以将 base64 编码的图片作为文本传递（不理想）

**转换方案（待验证）**:
```java
List<ContentBlock> content = new ArrayList<>();
content.add(TextBlock.builder()
    .text(String.format("Operation: %s\nMessage: %s", success ? "Success" : "Failed", message))
    .build());
if (screenshot != null) {
    // 如果支持 ImageBlock
    content.add(ImageBlock.builder()
        .image(screenshot)  // base64 或 URL
        .build());
} else {
    // 如果不支持，作为文本传递（不理想）
    content.add(TextBlock.builder()
        .text("Screenshot: " + screenshot)
        .build());
}
ToolResultBlock.builder()
    .content(content)
    .isError(!success)
    .build()
```

### 2.4 虚拟机操作结果

**结果结构**:
```java
// 虚拟机实例
class VmInstance {
    String vmId;
    String status;  // RUNNING, STOPPED, etc.
}

// 虚拟机状态
class VmStatus {
    String vmId;
    String status;
    Map<String, Object> details;  // CPU、内存、磁盘等
}
```

**反馈需求**:
- **虚拟机ID**：vmId 需要传递给 Agent（用于后续操作）
- **状态信息**：status 需要传递给 Agent（用于状态感知）
- **详细信息**：details 可能需要传递给 Agent（如果 Agent 需要了解资源使用情况）

**转换方案**:
```java
ToolResultBlock.builder()
    .content(Arrays.asList(
        TextBlock.builder()
            .text(String.format("VM ID: %s\nStatus: %s\nDetails: %s", 
                vmId, status, details.toString()))
            .build()
    ))
    .isError(false)
    .build()
```

## 三、工具调用的异步特性

### 3.1 同步操作

**类型**:
- **获取状态**：`getVmStatus()` - 瞬时返回（< 100ms）
- **查询信息**：查询虚拟机信息、会话信息等

**处理方式**:
- 直接同步执行，等待结果返回
- 使用 `Mono.just(result)` 包装结果

**示例**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    // 同步操作
    VmStatus status = vmManager.getVmStatus(vmId);
    
    // 包装为 Mono
    return Mono.just(createResultBlock(status));
}
```

### 3.2 异步操作

**类型**:
- **命令执行**：可能需要较长时间（几秒到几分钟）
- **脚本执行**：可能需要更长时间（几分钟到几小时）
- **创建虚拟机**：可能需要几十秒到几分钟

**处理方式**:
- 使用 `Mono.fromCallable()` 或 `Mono.fromSupplier()` 异步执行
- 设置超时时间（`Mono.timeout(Duration)`）
- 处理超时错误

**示例**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    return Mono.fromCallable(() -> {
        // 长时间运行的操作
        CommandResult result = executor.executeCommand(sessionId, command);
        return createResultBlock(result);
    })
    .timeout(Duration.ofMinutes(5))  // 5 分钟超时
    .doOnError(TimeoutException.class, e -> {
        log.error("Command execution timeout: {}", command);
    });
}
```

### 3.3 长时间运行操作的处理

**超时控制**:
- 使用 `Mono.timeout(Duration)` 设置超时
- 超时后返回错误信息
- 允许用户取消操作（如果支持）

**进度反馈**（如果支持）:
- AgentScope 工具可能不支持进度反馈
- 如果需要，可以通过中间结果传递进度信息（不理想）

**取消机制**（如果支持）:
- 响应式编程支持取消（`Mono` 可以取消）
- 需要验证 AgentScope 是否支持取消工具调用

### 3.4 AgentScope 工具调用的异步特性

**已验证的 API**:
- `AgentTool.callAsync(ToolCallParam)` 返回 `Mono<ToolResultBlock>`
- 工具调用是异步的，可以立即返回 `Mono`
- 可以通过 `Mono.block()` 同步等待结果
- 可以通过响应式流处理结果

**影响**:
- ✅ 支持长时间运行操作（通过 `Mono` 异步执行）
- ✅ 支持超时控制（通过 `Mono.timeout()`）
- ❓ 支持取消操作（待验证）
- ❓ 支持进度反馈（待验证）

## 四、上下文在工具调用链中的维护

### 4.1 工具调用链示例

**场景**：用户要求"创建一个 Ubuntu 虚拟机，然后执行 ls 命令"

**调用链**:
```
1. 用户消息: "创建一个 Ubuntu 虚拟机，然后执行 ls 命令"
   sessionId: "mentis_12345"

2. Agent 推理 → 决定调用 vm_manager 工具创建虚拟机
   → vm_manager.create_vm(sessionId="mentis_12345", config={...})
   → 返回: {vmId: "vm_67890", status: "RUNNING"}

3. Agent 推理 → 决定调用 computer_use 工具执行命令
   → computer_use.execute_command(sessionId="mentis_12345", command="ls")
   → 获取虚拟机: VmManager.getVmForSession("mentis_12345") → vmId="vm_67890"
   → 执行命令: ComputerUseExecutor.executeCommand("mentis_12345", "ls")
   → 返回: {exitCode: 0, stdout: "file1 file2", stderr: ""}

4. Agent 生成响应: "已创建 Ubuntu 虚拟机并执行了 ls 命令，结果如下：..."
```

**关键点**:
- sessionId 在工具调用链中保持一致
- 虚拟机在第一次工具调用时创建
- 后续工具调用使用同一个虚拟机（通过 sessionId 获取）

### 4.2 sessionId 的传递方式

**推荐方案：在工具参数中包含 sessionId**

**实现方式**:

1. **工具参数定义**:
```java
@Override
public Map<String, Object> getParameters() {
    return Map.of(
        "type", "object",
        "properties", Map.of(
            "sessionId", Map.of(
                "type", "string",
                "description", "会话ID，用于标识对应的虚拟机"
            ),
            "command", Map.of(
                "type", "string",
                "description", "要执行的命令"
            )
        ),
        "required", List.of("sessionId", "command")
    );
}
```

2. **Agent 系统提示词**:
```java
String sysPrompt = """
    你是 Mentis，一个智能助手，可以操作虚拟机。
    
    重要规则：
    1. 所有工具调用都必须包含 sessionId 参数
    2. sessionId 从用户消息的元数据中获取，或从会话上下文中获取
    3. 如果没有 sessionId，应该提示用户提供会话ID
    """;
```

3. **工具实现**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    Map<String, Object> args = param.getInput();
    String sessionId = (String) args.get("sessionId");
    
    if (sessionId == null || sessionId.isEmpty()) {
        return Mono.just(createErrorResult("sessionId is required"));
    }
    
    // 使用 sessionId 获取虚拟机
    VmInstance vm = vmManager.getVmForSession(sessionId);
    if (vm == null) {
        return Mono.just(createErrorResult("No VM found for session: " + sessionId));
    }
    
    // 执行操作...
}
```

### 4.3 上下文一致性保证

**挑战**:
- Agent 如何知道 sessionId？
- sessionId 如何从用户消息传递到工具调用？
- 如何在工具调用链中保持 sessionId 一致？

**解决方案**:

1. **在消息中包含 sessionId**:
```java
Msg userMsg = Msg.builder()
    .textContent(userMessage)
    .metadata(Map.of("sessionId", sessionId))  // 如果支持
    .build();
```

2. **在 Agent 系统提示词中说明**:
```java
String sysPrompt = String.format("""
    你是 Mentis，一个智能助手。
    
    当前会话ID: %s
    
    重要：所有工具调用都必须包含 sessionId 参数，值为: %s
    """, sessionId, sessionId);
```

3. **在工具调用前注入 sessionId**（如果 AgentScope 支持）:
```java
// 如果 AgentScope 支持在工具调用前修改参数
// 可以在调用前自动注入 sessionId
```

### 4.4 虚拟机状态一致性

**问题**:
- 虚拟机状态可能在工具调用间发生变化
- 需要确保工具调用使用的是最新的虚拟机状态

**解决方案**:
- 每次工具调用时都重新获取虚拟机状态（通过 `VmManager.getVmForSession()`）
- 不缓存虚拟机状态，始终从 VmManager 获取最新状态
- 如果虚拟机状态变更，工具调用会自动使用新状态

## 五、关键验证点

### 5.1 sessionId 传递验证

**验证方法**:
1. 在工具的 JSON Schema 中定义 sessionId 为必需参数
2. 在 Agent 的系统提示词中说明 sessionId 的来源
3. 测试 Agent 是否能够正确提取和传递 sessionId
4. 验证工具是否能够正确接收和使用 sessionId

**验证标准**:
- ✅ Agent 能够从消息中提取 sessionId
- ✅ Agent 在调用工具时传入 sessionId
- ✅ 工具能够从参数中提取 sessionId
- ✅ 工具能够使用 sessionId 获取虚拟机

### 5.2 结果反馈验证

**验证方法**:
1. 测试命令执行结果的转换（exitCode、stdout、stderr）
2. 测试脚本执行结果的转换（success、output、error）
3. 测试 GUI 操作结果的转换（success、screenshot、message）
4. 验证 Agent 是否能够理解和使用这些结果

**验证标准**:
- ✅ 结果能够正确转换为 ToolResultBlock
- ✅ 错误信息能够正确标识（isError）
- ✅ Agent 能够理解结果并继续推理
- ❓ 截图是否能够正确传递（待验证）

### 5.3 异步特性验证

**验证方法**:
1. 测试长时间运行命令的超时控制
2. 测试异步执行的正确性
3. 测试超时错误的处理
4. 验证取消机制（如果支持）

**验证标准**:
- ✅ 长时间运行操作能够异步执行
- ✅ 超时控制正常工作
- ✅ 超时错误能够正确处理
- ❓ 取消机制是否支持（待验证）

### 5.4 上下文一致性验证

**验证方法**:
1. 测试多个工具调用的链式调用
2. 验证 sessionId 在不同工具调用间的一致性
3. 验证虚拟机状态的一致性
4. 测试虚拟机状态变更的影响

**验证标准**:
- ✅ sessionId 在工具调用链中保持一致
- ✅ 虚拟机状态在工具调用间保持一致
- ✅ 虚拟机状态变更能够及时反映

## 六、待解决的问题

### 问题 1: Agent 如何获取 sessionId？

**问题**：Agent 在推理时如何知道 sessionId？

**可能方案**:
1. **在系统提示词中包含 sessionId**（推荐）
   - 优点：简单直接
   - 缺点：每次调用都需要更新系统提示词

2. **在消息元数据中包含 sessionId**
   - 优点：不污染提示词
   - 缺点：需要验证 AgentScope 是否支持消息元数据

3. **使用 Agent 的上下文/记忆机制**
   - 优点：更灵活
   - 缺点：需要验证 AgentScope 是否支持

### 问题 2: 截图如何传递？

**问题**：GUI 操作的截图（base64 或 URL）如何传递给 Agent？

**可能方案**:
1. **使用 ImageBlock**（如果支持）
   - 优点：原生支持图片
   - 缺点：需要验证 AgentScope 是否支持 ImageBlock

2. **作为文本传递 base64**
   - 优点：总是可以工作
   - 缺点：不优雅，Agent 可能无法直接理解图片

3. **使用 URL 引用图片**
   - 优点：不增加消息大小
   - 缺点：需要图片存储服务，Agent 需要能够访问 URL

### 问题 3: 长时间运行操作的进度反馈？

**问题**：长时间运行的操作（如脚本执行）能否提供进度反馈？

**当前理解**:
- AgentScope 工具调用返回 `Mono<ToolResultBlock>`
- 工具执行完成后返回结果
- 可能不支持中间进度反馈

**解决方案**:
- 如果操作时间过长，可以拆分为多个步骤
- 每个步骤作为一个工具调用
- Agent 可以根据中间结果决定下一步操作

## 最后更新

2026-01-09 - 完成工具调用上下文需求分析
