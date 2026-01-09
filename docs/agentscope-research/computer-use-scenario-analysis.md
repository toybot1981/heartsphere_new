# Computer-Use 场景分析

## 分析日期

2026-01-09

## 分析目标

分析 Mentis 系统中 Computer-Use 场景的核心需求、虚拟机操作特点和会话管理关系，以评估 AgentScope Java 工具系统是否能够支持这些需求。

## 一、Computer-Use 核心功能分析

### 1.1 命令执行（CommandExecutor）

**接口定义**:
```java
CommandResult executeCommand(String sessionId, String command);
```

**功能描述**:
- 在虚拟机中执行系统命令（Shell 命令或 PowerShell 命令）
- 返回命令执行结果（exitCode、stdout、stderr）

**特点**:
- **同步操作**：命令执行是同步的，等待执行完成后返回
- **执行时间**：瞬时到几分钟（取决于命令复杂度）
- **状态依赖**：需要虚拟机存在且运行中
- **结果类型**：结构化结果（exitCode、stdout、stderr）

**当前实现**:
- `ShellCommandExecutor`：执行 Linux Shell 命令
- `PowerShellCommandExecutor`：执行 Windows PowerShell 命令（待实现）
- 支持命令安全验证（黑名单、权限检查）

**示例**:
```java
// 执行命令
CommandResult result = commandExecutor.execute(sessionId, "ls -la /tmp");
// result.exitCode = 0
// result.stdout = "total 1234\ndrwxr-xr-x ..."
// result.stderr = ""
```

### 1.2 脚本执行（ScriptExecutor）

**接口定义**:
```java
ScriptResult executeScript(String sessionId, String script, String language);
```

**功能描述**:
- 在虚拟机中执行脚本（Python、JavaScript 等）
- 返回脚本执行结果（success、output、error）

**特点**:
- **同步操作**：脚本执行是同步的，等待执行完成后返回
- **执行时间**：几秒到几分钟（取决于脚本复杂度）
- **状态依赖**：需要虚拟机存在且运行中，需要相应的运行时环境（Python、Node.js 等）
- **结果类型**：结构化结果（success、output、error）

**当前实现**:
- `PythonScriptExecutor`：执行 Python 脚本
- `JavaScriptScriptExecutor`：执行 JavaScript 脚本
- 支持脚本环境管理（虚拟环境、依赖安装）

**示例**:
```java
// 执行 Python 脚本
String script = "import os\nprint(os.getcwd())";
ScriptResult result = scriptExecutor.execute(sessionId, script, "python");
// result.success = true
// result.output = "/home/user"
// result.error = null
```

### 1.3 GUI 自动化（GuiAutomationExecutor）

**接口定义**:
```java
GuiActionResult performGuiAction(String sessionId, GuiAction action);
```

**功能描述**:
- 在虚拟机中执行 GUI 自动化操作（点击、输入、滚动、截图等）
- 返回操作结果（success、screenshot、message）

**特点**:
- **同步操作**：GUI 操作是同步的，等待操作完成后返回
- **执行时间**：几百毫秒到几秒（取决于操作复杂度）
- **状态依赖**：需要虚拟机存在且运行中，需要 GUI 环境（桌面环境、浏览器等）
- **结果类型**：结构化结果（success、screenshot、message）

**当前实现**:
- `SeleniumGuiAutomationExecutor`：使用 Selenium WebDriver
- `PlaywrightGuiAutomationExecutor`：使用 Playwright
- 支持浏览器自动化、桌面应用自动化

**GUI 操作类型**:
- `CLICK`：点击元素或坐标
- `TYPE`：输入文本
- `SCROLL`：滚动页面或窗口
- `SCREENSHOT`：截图

**示例**:
```java
// 执行 GUI 操作
GuiAction action = new GuiAction();
action.setActionType("CLICK");
action.setTarget("button#submit");
GuiActionResult result = guiExecutor.performAction(sessionId, action);
// result.success = true
// result.screenshot = "data:image/png;base64,..."
// result.message = "Clicked successfully"
```

### 1.4 虚拟机生命周期管理（VmManager）

**核心方法**:
- `createVmForSession(sessionId, config)`：为会话创建虚拟机
- `getVmForSession(sessionId)`：获取会话的虚拟机
- `getVmStatus(vmId)`：获取虚拟机状态
- `deleteVmForSession(sessionId)`：删除会话的虚拟机
- `startVm(vmId)`、`stopVm(vmId)`、`restartVm(vmId)`：虚拟机控制
- `createSnapshot(vmId)`、`restoreSnapshot(vmId, snapshotId)`：快照管理

**功能描述**:
- 管理虚拟机的完整生命周期
- 维护会话与虚拟机的绑定关系
- 提供虚拟机状态查询和控制
- 支持快照管理（状态保存和恢复）

**特点**:
- **有状态操作**：虚拟机状态需要持久化（状态、配置、快照）
- **长时间运行**：虚拟机可以长时间运行（几小时到几天）
- **资源管理**：需要管理 CPU、内存、磁盘等资源
- **生命周期管理**：创建、启动、停止、删除等生命周期操作

## 二、虚拟机操作特点分析

### 2.1 有状态操作

**特点**:
- **虚拟机状态**：运行中、停止、暂停等状态需要保持
- **会话状态**：会话与虚拟机的绑定关系需要保持
- **执行上下文**：命令执行的历史、工作目录、环境变量等上下文

**影响**:
- 工具调用需要能够访问和维护这些状态
- 需要在工具调用间保持状态一致性
- 状态变更需要及时反映

### 2.2 长时间运行操作

**特点**:
- **命令执行**：某些命令可能需要较长时间（编译、数据处理等）
- **脚本执行**：复杂脚本可能需要几分钟到几小时
- **虚拟机操作**：创建虚拟机可能需要几十秒到几分钟

**影响**:
- 工具调用需要支持长时间运行
- 需要超时控制和取消机制
- 需要进度反馈（如果可能）

### 2.3 上下文依赖

**特点**:
- **sessionId → vmId 映射**：每个会话对应一个虚拟机
- **虚拟机状态检查**：操作前需要检查虚拟机是否存在、是否运行中
- **环境依赖**：某些操作需要特定的运行时环境（Python、Node.js 等）

**影响**:
- 工具调用需要能够传递 sessionId
- 需要在工具调用时验证上下文的有效性
- 上下文失效时需要明确的错误处理

### 2.4 资源管理

**特点**:
- **虚拟机资源**：CPU、内存、磁盘等资源需要管理
- **资源限制**：需要设置资源限制（防止资源耗尽）
- **资源清理**：虚拟机删除时需要清理资源

**影响**:
- 需要资源使用监控
- 需要资源限制和清理机制

## 三、会话管理与虚拟机绑定关系分析

### 3.1 会话与虚拟机的绑定关系

**当前实现**:
- **一对一关系**：每个会话对应一个虚拟机（`sessionId → vmId`）
- **生命周期绑定**：会话创建时可以创建虚拟机，会话结束时可以删除虚拟机
- **映射存储**：`VmManagerImpl` 使用 `Map<String, String> sessionToVmMap` 存储映射关系

**代码示例**:
```java
// VmManagerImpl.java
private final Map<String, String> sessionToVmMap = new ConcurrentHashMap<>();

public VmInstance createVmForSession(String sessionId, VmConfig config) {
    // 检查是否已存在
    String existingVmId = sessionToVmMap.get(sessionId);
    if (existingVmId != null) {
        deleteVmForSession(sessionId);
    }
    
    // 创建新虚拟机
    VmInstance instance = vmProvider.createVm(config);
    
    // 保存映射关系
    sessionToVmMap.put(sessionId, instance.getVmId());
    
    return instance;
}
```

**特点**:
- **持久化**：映射关系存储在内存中（可能需要持久化到数据库）
- **自动清理**：会话结束时需要清理虚拟机（可选）
- **状态同步**：虚拟机状态变更需要及时反映

### 3.2 虚拟机的创建时机

**当前策略**（基于代码分析）:
- **按需创建**：会话创建时不自动创建虚拟机
- **延迟创建**：当需要执行 Computer-Use 操作时才创建虚拟机
- **显式创建**：通过 `VmManager.createVmForSession()` 显式创建

**可能的策略**:
1. **按需创建**（当前策略）
   - 优点：节省资源，只在需要时创建
   - 缺点：第一次操作需要等待虚拟机创建

2. **预创建**
   - 优点：快速响应，无需等待创建
   - 缺点：资源浪费，如果用户不使用虚拟机

3. **混合策略**
   - 会话创建时预创建虚拟机池
   - 从池中分配虚拟机给会话
   - 会话结束时归还虚拟机到池中

### 3.3 虚拟机的生命周期管理

**生命周期阶段**:
1. **创建**：`createVmForSession()` - 创建虚拟机并绑定到会话
2. **运行**：虚拟机运行中，可以执行操作
3. **停止**：`stopVm()` - 停止虚拟机（可选）
4. **快照**：`createSnapshot()` - 创建快照保存状态
5. **恢复**：`restoreSnapshot()` - 从快照恢复状态
6. **删除**：`deleteVmForSession()` - 删除虚拟机并清理资源

**清理策略**:
- **立即清理**：会话结束时立即删除虚拟机
- **延迟清理**：会话结束后延迟一段时间再删除（允许恢复）
- **基于 TTL**：基于时间（TTL）自动清理空闲虚拟机

### 3.4 多会话共享虚拟机的可能性

**当前实现**:
- **不支持**：每个会话独占一个虚拟机
- **映射关系**：`sessionId → vmId` 一对一映射

**可能的扩展**:
1. **多会话共享虚拟机**
   - 优点：节省资源
   - 缺点：会话间可能相互影响，需要隔离机制

2. **虚拟机池**
   - 多个会话共享一个虚拟机池
   - 从池中分配虚拟机，使用完归还
   - 需要虚拟机状态重置机制

**评估**:
- 当前实现不支持多会话共享
- 未来可能需要支持（如果资源有限）
- 需要隔离机制（用户隔离、资源隔离）

## 四、工具调用上下文需求分析

### 4.1 必需的上下文信息

**sessionId（必需）**:
- **用途**：标识会话，用于获取对应的虚拟机
- **来源**：用户消息、会话上下文
- **传递方式**：需要从 Agent 的消息中提取，传递给工具调用
- **验证**：需要验证 sessionId 的有效性（会话存在）

**userId（可选）**:
- **用途**：权限验证、审计日志
- **来源**：用户消息、会话上下文
- **传递方式**：可以从 sessionId 推导，或显式传递

**虚拟机状态（自动获取）**:
- **用途**：验证虚拟机是否存在、是否运行中
- **来源**：通过 `VmManager.getVmForSession(sessionId)` 获取
- **验证**：在工具调用前验证虚拟机状态

### 4.2 工具执行结果的反馈需求

**命令执行结果（CommandResult）**:
- **exitCode**：命令退出码（0 表示成功，非 0 表示失败）
- **stdout**：标准输出（命令的正常输出）
- **stderr**：标准错误（命令的错误输出）
- **反馈需求**：需要将结果传递给 Agent，用于后续推理

**脚本执行结果（ScriptResult）**:
- **success**：是否成功（boolean）
- **output**：脚本输出（String）
- **error**：错误信息（String，如果有）
- **反馈需求**：需要将结果传递给 Agent，用于后续推理

**GUI 操作结果（GuiActionResult）**:
- **success**：是否成功（boolean）
- **screenshot**：截图（base64 或 URL）
- **message**：操作消息（String）
- **反馈需求**：需要将结果传递给 Agent，特别是截图，用于视觉理解

**虚拟机操作结果**:
- **vmId**：虚拟机ID
- **status**：虚拟机状态（RUNNING、STOPPED 等）
- **config**：虚拟机配置（可选）
- **反馈需求**：需要将结果传递给 Agent，用于状态感知

### 4.3 工具调用的异步特性

**同步操作**:
- **获取状态**：`getVmStatus()` - 瞬时返回
- **查询信息**：查询虚拟机信息、会话信息等

**异步操作**:
- **命令执行**：可能需要较长时间，应该异步执行
- **脚本执行**：可能需要更长时间，必须异步执行
- **创建虚拟机**：可能需要几十秒到几分钟，必须异步执行

**长时间运行操作的处理**:
- **超时控制**：设置超时时间（如 5 分钟）
- **取消机制**：允许取消长时间运行的操作
- **进度反馈**：如果可能，提供进度反馈（但 AgentScope 工具可能不支持）

**AgentScope 工具调用的异步特性**:
- **返回类型**：`Mono<ToolResultBlock>` - 响应式编程
- **执行方式**：工具调用是异步的，可以立即返回
- **结果获取**：通过 `Mono.block()` 同步等待，或通过响应式流处理

### 4.4 上下文在工具调用链中的维护

**工具调用链示例**:
```
用户消息: "创建一个 Ubuntu 虚拟机，然后执行 ls 命令"
  ↓
Agent 推理 → 调用 vm_manager 工具创建虚拟机
  ↓
vm_manager.create_vm(sessionId, config) → 返回 vmId
  ↓
Agent 推理 → 调用 computer_use 工具执行命令
  ↓
computer_use.execute_command(sessionId, "ls")
  ↓
返回结果给 Agent
  ↓
Agent 生成响应
```

**上下文维护需求**:
- **sessionId 一致性**：在工具调用链中保持 sessionId 一致
- **虚拟机状态**：虚拟机创建后，后续操作需要使用同一个虚拟机
- **执行上下文**：命令执行的工作目录、环境变量等上下文需要保持

**挑战**:
- AgentScope 的工具调用是独立的，如何保持上下文？
- 需要从消息中提取 sessionId，但 Agent 可能不知道 sessionId 的来源
- 虚拟机状态在工具调用间需要保持一致

## 五、关键发现总结

### 5.1 Computer-Use 核心功能特点

| 功能 | 操作类型 | 执行时间 | 状态依赖 | 结果类型 |
|------|---------|---------|---------|---------|
| 命令执行 | 同步 | 瞬时-几分钟 | 需要虚拟机运行 | 结构化（exitCode, stdout, stderr） |
| 脚本执行 | 同步 | 几秒-几分钟 | 需要虚拟机运行+运行时环境 | 结构化（success, output, error） |
| GUI 操作 | 同步 | 几百毫秒-几秒 | 需要虚拟机运行+GUI环境 | 结构化（success, screenshot, message） |
| 虚拟机管理 | 同步/异步 | 几十秒-几分钟 | 无 | 结构化（vmId, status, config） |

### 5.2 虚拟机操作特点

1. **有状态操作**：需要维护虚拟机状态、会话状态、执行上下文
2. **长时间运行**：某些操作可能需要较长时间
3. **上下文依赖**：sessionId → vmId 映射关系、虚拟机状态检查
4. **资源管理**：需要管理 CPU、内存、磁盘等资源

### 5.3 会话管理与虚拟机绑定关系

1. **一对一关系**：每个会话对应一个虚拟机
2. **按需创建**：延迟创建，只在需要时创建
3. **生命周期绑定**：会话结束时可以删除虚拟机（可选）
4. **映射存储**：使用内存 Map 存储映射关系（可能需要持久化）

### 5.4 工具调用上下文需求

1. **必需信息**：sessionId（用于获取虚拟机）
2. **结果反馈**：结构化结果（exitCode、stdout、stderr、screenshot 等）
3. **异步特性**：长时间运行操作需要异步执行
4. **上下文维护**：在工具调用链中保持 sessionId 和虚拟机状态一致性

## 六、对 AgentScope 工具系统的要求

### 6.1 工具接口要求

**必需能力**:
- ✅ 支持异步调用（`Mono<ToolResultBlock>`）
- ✅ 支持参数传递（`ToolCallParam`）
- ✅ 支持结构化结果（`ToolResultBlock`）
- ❓ 支持 sessionId 作为参数传递（待验证）
- ❓ 支持长时间运行操作（待验证）
- ❓ 支持超时控制（待验证）

### 6.2 工具调用机制要求

**必需能力**:
- ✅ 支持工具注册和发现（`Toolkit`）
- ✅ Agent 自动决定是否调用工具（ReAct 推理）
- ❓ 支持从消息中提取 sessionId（待验证）
- ❓ 支持上下文在工具调用链中保持（待验证）
- ❓ 支持错误处理和重试（待验证）

### 6.3 结果反馈要求

**必需能力**:
- ✅ 支持结构化结果（`ToolResultBlock`）
- ✅ 支持错误信息返回
- ❓ 支持图片/二进制数据（screenshot）（待验证）
- ❓ 支持大结果分块返回（待验证）

## 七、待验证的关键问题

### 问题 1: sessionId 传递机制

**问题**：AgentScope 的工具调用如何传递 sessionId？

**验证方法**:
- 在工具的 JSON Schema 中定义 sessionId 为必需参数
- 在 Agent 的系统提示词中说明：所有工具调用必须包含 sessionId
- 验证 Agent 是否能够从消息中提取 sessionId 并传入工具

### 问题 2: 长时间运行操作

**问题**：AgentScope 的工具调用是否支持长时间运行的操作？

**验证方法**:
- 测试执行一个需要较长时间的命令（如 `sleep 60`）
- 验证工具调用是否有超时限制
- 验证超时后的错误处理

### 问题 3: 上下文维护

**问题**：在工具调用链中如何保持上下文（sessionId、虚拟机状态）？

**验证方法**:
- 测试多个工具调用的链式调用
- 验证 sessionId 在不同工具调用间的一致性
- 验证虚拟机状态在工具调用间的一致性

### 问题 4: 错误处理

**问题**：AgentScope 的工具调用错误处理机制是否完善？

**验证方法**:
- 测试虚拟机不存在的情况
- 测试命令执行失败的情况
- 验证错误信息是否能够正确返回给 Agent

## 最后更新

2026-01-09 - 完成 Computer-Use 场景分析
