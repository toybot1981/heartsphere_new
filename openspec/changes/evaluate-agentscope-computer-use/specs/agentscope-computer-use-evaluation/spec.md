# Spec: AgentScope Computer-Use Evaluation

## ADDED Requirements

### Requirement: REQ-EVAL-COMPUTER-USE-001 - Computer-Use 场景分析

系统 SHALL 完成 Computer-Use 场景的详细分析，明确核心需求、虚拟机操作特点和会话管理关系。

#### Scenario: 分析 Computer-Use 核心功能

**Given** Mentis 系统已有 ComputerUseExecutor 和 VmManager 实现

**When** 进行 Computer-Use 场景分析

**Then** 应该识别以下核心功能：
- 命令执行（CommandExecutor）
- 脚本执行（ScriptExecutor，支持 Python、JavaScript 等）
- GUI 自动化（GuiAutomationExecutor，支持 Selenium、Playwright）
- 虚拟机生命周期管理（创建、启动、停止、删除、快照）

**And** 应该分析每个功能的特点：
- 操作类型（同步/异步）
- 执行时间（瞬时/长时间）
- 状态依赖（需要虚拟机运行/不需要）
- 结果类型（结构化结果/非结构化结果）

#### Scenario: 分析虚拟机操作特点

**Given** Mentis 系统使用 VmManager 管理虚拟机

**When** 分析虚拟机操作的特点

**Then** 应该识别以下特点：
- 有状态操作（虚拟机状态、会话状态需要保持）
- 长时间运行操作（命令执行、脚本执行可能需要较长时间）
- 上下文依赖（sessionId → vmId 映射关系）
- 资源管理（虚拟机创建、删除、快照需要资源管理）

#### Scenario: 分析会话管理与虚拟机绑定关系

**Given** Mentis 系统使用 sessionId 管理会话

**When** 分析会话管理与虚拟机绑定的关系

**Then** 应该明确：
- 会话创建时是否需要创建虚拟机（按需创建 vs 预创建）
- 会话与虚拟机的生命周期关系（一对一、一对多、多对一）
- 多会话共享虚拟机的可能性（共享 vs 独占）
- 会话结束时虚拟机的清理策略（立即删除 vs 延迟删除）

### Requirement: REQ-EVAL-COMPUTER-USE-002 - AgentScope 工具系统适配性评估

系统 SHALL 评估 AgentScope 的工具系统（AgentTool/Toolkit）是否能够满足 Computer-Use 场景的需求。

#### Scenario: 评估 AgentTool 接口适配性

**Given** AgentScope 提供 AgentTool 接口

**When** 评估 AgentTool 接口是否满足 Computer-Use 需求

**Then** 应该评估以下方面：
- `getName()` 方法是否足够（工具命名）
- `getDescription()` 方法是否足够（工具描述，用于 Agent 理解）
- `getParameters()` 方法是否足够（参数定义，JSON Schema）
- `callAsync(ToolCallParam)` 方法是否足够（异步调用，返回 Mono<ToolResultBlock>）

**And** 应该验证：
- ToolCallParam 是否支持传入 sessionId
- ToolCallParam 是否支持复杂参数（如 GuiAction）
- ToolResultBlock 是否支持结构化结果
- ToolResultBlock 是否支持错误信息

#### Scenario: 评估 Toolkit 工具管理机制

**Given** AgentScope 提供 Toolkit 工具管理系统

**When** 评估 Toolkit 是否适用 Computer-Use 场景

**Then** 应该评估：
- 工具注册机制（`registerAgentTool()`）是否适用
- 工具查找机制（`getTool(String name)`）是否适用
- 工具调用流程（Agent → Toolkit → Tool）是否适用
- 工具调用的同步/异步特性是否满足需求

**And** 应该验证：
- 工具调用是否有超时限制
- 工具调用是否支持长时间运行
- 工具调用错误处理机制是否完善

### Requirement: REQ-EVAL-COMPUTER-USE-003 - 会话上下文传递机制验证

系统 SHALL 验证 AgentScope 的工具调用机制是否支持会话上下文（sessionId）的传递。

#### Scenario: 验证 sessionId 在工具参数中传递

**Given** Computer-Use 工具需要 sessionId 来获取对应的虚拟机

**When** 尝试在工具参数中包含 sessionId

**Then** 应该能够：
- 在工具的 JSON Schema 中定义 sessionId 为必需参数
- Agent 在调用工具时传入 sessionId
- 工具从 `ToolCallParam.getArguments()` 中提取 sessionId
- 使用 sessionId 调用 VmManager 获取虚拟机

#### Scenario: 验证会话上下文在工具调用链中保持

**Given** 一个 Agent 调用可能涉及多个工具调用

**When** 在多个工具调用间传递 sessionId

**Then** 应该确保：
- sessionId 在每次工具调用中都可用
- sessionId 的来源一致（都来自原始消息）
- sessionId 的有效性（对应的虚拟机存在）

### Requirement: REQ-EVAL-COMPUTER-USE-004 - 虚拟机操作工具原型实现

系统 SHALL 实现 VmManagerTool 原型，将 VmManager 包装为 AgentScope 工具。

#### Scenario: 实现虚拟机创建工具

**Given** VmManager 提供 `createVmForSession()` 方法

**When** 实现 VmManagerTool 的虚拟机创建功能

**Then** 应该：
- 在 `getParameters()` 中定义 `action=create` 的参数
- 在 `callAsync()` 中调用 `VmManager.createVmForSession(sessionId, config)`
- 将结果转换为 `ToolResultBlock`
- 返回包含 vmId 和状态的结果

#### Scenario: 实现虚拟机状态查询工具

**Given** VmManager 提供 `getVmStatus()` 方法

**When** 实现 VmManagerTool 的虚拟机状态查询功能

**Then** 应该：
- 在 `getParameters()` 中定义 `action=get_status` 的参数
- 在 `callAsync()` 中先调用 `VmManager.getVmForSession(sessionId)` 获取 vmId
- 然后调用 `VmManager.getVmStatus(vmId)` 获取状态
- 返回包含虚拟机状态的结果

#### Scenario: 实现虚拟机删除工具

**Given** VmManager 提供 `deleteVmForSession()` 方法

**When** 实现 VmManagerTool 的虚拟机删除功能

**Then** 应该：
- 在 `getParameters()` 中定义 `action=delete` 的参数
- 在 `callAsync()` 中调用 `VmManager.deleteVmForSession(sessionId)`
- 返回删除成功或失败的结果

#### Scenario: 实现快照管理工具

**Given** VmManager 提供 `createSnapshot()` 和 `restoreSnapshot()` 方法

**When** 实现 VmManagerTool 的快照管理功能

**Then** 应该：
- 支持 `action=create_snapshot` 创建快照
- 支持 `action=restore_snapshot` 恢复快照
- 在 `getParameters()` 中定义快照相关的参数
- 返回快照ID或恢复结果

### Requirement: REQ-EVAL-COMPUTER-USE-005 - Computer-Use 操作工具原型实现

系统 SHALL 实现 ComputerUseTool 原型，将 ComputerUseExecutor 包装为 AgentScope 工具。

#### Scenario: 实现命令执行工具

**Given** ComputerUseExecutor 提供 `executeCommand()` 方法

**When** 实现 ComputerUseTool 的命令执行功能

**Then** 应该：
- 在 `getParameters()` 中定义 `operation=execute_command` 的参数（sessionId, command）
- 在 `callAsync()` 中先验证虚拟机存在
- 调用 `ComputerUseExecutor.executeCommand(sessionId, command)`
- 将 CommandResult 转换为 ToolResultBlock（包含 exitCode, stdout, stderr）

#### Scenario: 实现脚本执行工具

**Given** ComputerUseExecutor 提供 `executeScript()` 方法

**When** 实现 ComputerUseTool 的脚本执行功能

**Then** 应该：
- 在 `getParameters()` 中定义 `operation=execute_script` 的参数（sessionId, script, language）
- 在 `callAsync()` 中先验证虚拟机存在
- 调用 `ComputerUseExecutor.executeScript(sessionId, script, language)`
- 将 ScriptResult 转换为 ToolResultBlock（包含 success, output, error）

#### Scenario: 实现 GUI 操作工具

**Given** ComputerUseExecutor 提供 `performGuiAction()` 方法

**When** 实现 ComputerUseTool 的 GUI 操作功能

**Then** 应该：
- 在 `getParameters()` 中定义 `operation=perform_gui_action` 的参数（sessionId, actionType, target, value）
- 在 `callAsync()` 中先验证虚拟机存在
- 构建 GuiAction 对象
- 调用 `ComputerUseExecutor.performGuiAction(sessionId, action)`
- 将 GuiActionResult 转换为 ToolResultBlock（包含 success, screenshot, message）

### Requirement: REQ-EVAL-COMPUTER-USE-006 - 集成方案设计

系统 SHALL 设计完整的集成方案，包括工具包装架构、会话上下文传递、错误处理等。

#### Scenario: 设计工具包装架构

**Given** 需要将 VmManager 和 ComputerUseExecutor 包装为 AgentScope 工具

**When** 设计工具包装架构

**Then** 应该包含：
- VmManagerTool 的设计（单一工具，多个操作通过 action 参数区分）
- ComputerUseTool 的设计（单一工具，多个操作通过 operation 参数区分）
- 工具注册机制（在 Toolkit 中注册工具）
- 工具发现机制（Agent 如何发现和选择工具）

#### Scenario: 设计会话上下文传递方案

**Given** 工具调用需要 sessionId 来获取虚拟机

**When** 设计会话上下文传递方案

**Then** 应该明确：
- sessionId 的传递方式（作为工具参数 vs 从消息提取 vs 从上下文获取）
- sessionId 的验证机制（验证会话存在、验证虚拟机存在）
- 上下文在工具调用链中的维护方式
- 上下文失效的处理（会话结束、虚拟机删除）

#### Scenario: 设计错误处理和回退机制

**Given** 工具调用可能失败（虚拟机不存在、命令执行失败等）

**When** 设计错误处理机制

**Then** 应该包括：
- 错误类型识别（虚拟机不存在、命令失败、超时等）
- 错误信息返回（通过 ToolResultBlock 返回错误信息）
- 错误恢复策略（自动创建虚拟机、重试机制）
- 回退机制（如果 AgentScope 工具调用失败，如何回退到现有实现）

### Requirement: REQ-EVAL-COMPUTER-USE-007 - 可行性评估报告

系统 SHALL 生成完整的可行性评估报告，包含评估结论、技术难点、集成方案建议等。

#### Scenario: 生成可行性结论

**Given** 完成所有评估工作（场景分析、AgentScope 评估、原型验证、方案设计）

**When** 生成可行性结论

**Then** 应该给出明确的结论：
- 完全可行：所有功能都能实现，性能影响可接受，复杂度合理
- 有条件可行：大部分功能能实现，部分功能需要特殊处理，有明确的限制条件
- 不可行：关键技术障碍无法解决，功能缺失严重，性能影响不可接受

**And** 应该说明：
- 结论的理由和依据
- 关键的限制条件（如果有）
- 风险评估

#### Scenario: 生成技术难点和解决方案文档

**Given** 在评估过程中识别了技术难点

**When** 生成技术难点文档

**Then** 应该记录：
- 每个技术难点的详细描述
- 难点的影响程度（严重、中等、轻微）
- 解决方案或替代方案
- 未解决问题的说明

#### Scenario: 生成集成方案建议

**Given** 评估结论是可行或有条件可行

**When** 生成集成方案建议

**Then** 应该包括：
- 详细的集成步骤
- 工具包装的实现方案
- 测试策略
- 性能优化建议
- 风险缓解措施
