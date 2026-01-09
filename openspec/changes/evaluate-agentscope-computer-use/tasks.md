# Tasks: Evaluate AgentScope Java for Computer-Use

## Phase 1: Computer-Use 场景分析

### Task 1.1: Computer-Use 核心需求分析

- [x] 1.1.1 分析 Computer-Use 的核心功能
  - 命令执行（CommandExecutor）✅
  - 脚本执行（ScriptExecutor）✅
  - GUI 自动化（GuiAutomationExecutor）✅
  - 虚拟机生命周期管理（VmManager）✅
- [x] 1.1.2 分析虚拟机操作的特点
  - 有状态操作（虚拟机状态、会话状态）✅
  - 长时间运行操作（命令执行、脚本执行）✅
  - 上下文依赖（sessionId → vmId 映射）✅
  - 资源管理（虚拟机创建、删除、快照）✅
- [x] 1.1.3 分析会话管理与虚拟机绑定的关系
  - 会话创建时是否需要创建虚拟机 ✅（按需创建）
  - 会话与虚拟机的生命周期关系 ✅（一对一关系）
  - 多会话共享虚拟机的可能性 ✅（当前不支持）
- [x] 1.1.4 创建 Computer-Use 场景分析文档
  - 创建 `docs/agentscope-research/computer-use-scenario-analysis.md` ✅
  - 记录所有分析结果 ✅

### Task 1.2: 工具调用上下文需求分析

- [x] 1.2.1 分析工具调用需要的上下文信息
  - sessionId（用于获取对应的虚拟机）✅
  - userId（用于权限验证）✅
  - 虚拟机状态（需要检查虚拟机是否存在、是否运行中）✅
- [x] 1.2.2 分析工具执行结果的反馈需求
  - 命令执行结果（stdout、stderr、exitCode）✅
  - 脚本执行结果（success、output、error）✅
  - GUI 操作结果（screenshot、message）✅
  - 虚拟机操作结果（vmId、status）✅
- [x] 1.2.3 分析工具调用的异步特性
  - 哪些操作是同步的（获取状态）✅
  - 哪些操作是异步的（执行命令、创建虚拟机）✅
  - 长时间运行操作的超时处理 ✅
- [x] 1.2.4 更新场景分析文档
  - 添加工具调用上下文需求分析结果 ✅（已创建 agentscope-tool-context-analysis.md）

## Phase 2: AgentScope 工具系统评估

### Task 2.1: AgentTool 接口适配性评估

- [x] 2.1.1 评估 AgentTool 接口是否满足需求
  - `getName()` - 工具名称 ✅
  - `getDescription()` - 工具描述 ✅
  - `getParameters()` - 参数定义（JSON Schema）✅
  - `callAsync(ToolCallParam)` - 异步调用（返回 Mono<ToolResultBlock>）✅
- [x] 2.1.2 评估 ToolCallParam 是否包含足够的上下文
  - 是否能传入 sessionId ✅（通过 getInput()）
  - 是否能传入自定义参数 ✅
  - 参数解析方式 ✅（Map<String, Object>）
- [x] 2.1.3 评估 ToolResultBlock 是否满足结果反馈需求
  - 结果格式是否灵活 ✅（支持文本、错误、内容块列表）
  - 是否支持错误信息 ✅（error() 方法）
  - 是否支持结构化结果 ✅（ContentBlock 列表）
  - 是否支持图片 ✅（ImageBlock 已确认）
- [x] 2.1.4 创建 AgentTool 适配性评估文档
  - 创建 `docs/agentscope-research/agentscope-tool-adaptability.md` ✅
  - 记录评估结果和发现的问题 ✅

### Task 2.2: Toolkit 工具管理机制评估

- [x] 2.2.1 评估 Toolkit 的工具注册机制
  - `registerAgentTool(AgentTool)` 方法 ✅
  - 工具命名和冲突处理 ✅（需要注意唯一性）
  - 工具查找机制（`getTool(String name)`）✅
- [x] 2.2.2 评估工具调用流程
  - Agent 如何决定调用哪个工具 ✅（基于 ReAct 推理）
  - 工具调用的参数传递机制 ✅（通过 ToolCallParam.getInput()）
  - 工具执行结果的返回机制 ✅（ToolResultBlock）
- [x] 2.2.3 评估工具调用的同步/异步特性
  - `callTool()` 返回 `Mono<ToolResultBlock>` ✅
  - 异步执行的超时控制 ✅（Mono.timeout()）
  - 错误处理机制 ✅（onErrorReturn()）
- [x] 2.2.4 更新工具系统评估文档
  - 添加 Toolkit 评估结果 ✅（已创建 toolkit-management-evaluation.md）

### Task 2.3: 技术难点识别

- [x] 2.3.1 识别会话上下文传递的难点
  - AgentScope 的工具调用是否支持传递 sessionId ✅（通过 getInput()）
  - 如何从 Agent 的消息中提取 sessionId ✅（在系统提示词中包含）
  - 如何在工具调用中保持上下文 ✅（sessionId 在提示词中保持一致）
- [x] 2.3.2 识别虚拟机状态管理的难点
  - 如何在工具调用中获取虚拟机状态 ✅（通过 VmManager.getVmForSession()）
  - 如何处理虚拟机不存在的情况 ✅（返回错误，提示创建）
  - 如何处理虚拟机状态变更 ✅（实时获取最新状态）
- [x] 2.3.3 识别长时间运行操作的难点
  - 工具调用是否有超时限制 ✅（使用 Mono.timeout()）
  - 如何处理长时间运行的命令/脚本 ✅（设置合理的超时时间）
  - 如何提供进度反馈 ⚠️（可能不支持，需要任务拆分）
- [x] 2.3.4 创建技术难点文档
  - 创建 `docs/agentscope-research/computer-use-challenges.md` ✅
  - 记录所有识别的难点和潜在解决方案 ✅

## Phase 3: 原型验证实现

### Task 3.1: VmManagerTool 原型实现（分 4 个小步骤）

#### Step 3.1.1: 创建 VmManagerTool 类框架

- [x] 3.1.1.1 创建 VmManagerTool 类框架
  - 实现 `AgentTool` 接口 ✅
  - 包装 `VmManager` 的功能 ✅
  - 定义工具名称、描述和参数 ✅
- [x] 3.1.2.1 实现会话上下文传递
  - 从 ToolCallParam.getInput() 中提取 sessionId ✅
  - 验证 sessionId 的有效性 ✅
  - 处理 sessionId 不存在的情况 ✅
- [x] 3.1.3.1 实现虚拟机操作工具（框架已完成）
  - `get_vm_status` - 获取虚拟机状态 ✅
  - `delete_vm` - 删除虚拟机 ✅
  - `create_vm` - 创建虚拟机 ⚠️（框架已实现，待完善配置解析）
  - `create_snapshot` - 创建快照 ⚠️（框架已实现，待完善实际逻辑）
  - `restore_snapshot` - 恢复快照 ⚠️（框架已实现，待完善实际逻辑）
- [ ] 3.1.4 创建测试用例
  - 创建 `VmManagerToolTest.java`
  - 测试虚拟机操作的各个功能
  - 验证会话上下文传递

### Task 3.2: ComputerUseTool 原型实现（分 4 个小步骤）

#### Step 3.2.1: 创建 ComputerUseTool 类框架
- [ ] 3.2.1.1 创建 ComputerUseTool 类
  - 实现 `AgentTool` 接口
  - 注入 `ComputerUseExecutor` 依赖
  - 定义工具名称和描述

#### Step 3.2.2: 实现命令执行工具
- [ ] 3.2.2.1 实现 `execute_command` 工具
  - 参数：sessionId, command
  - 返回：exitCode, stdout, stderr
  - 处理错误和超时

#### Step 3.2.3: 实现脚本和 GUI 操作工具
- [ ] 3.2.3.1 实现 `execute_script` 工具
  - 参数：sessionId, script, language
  - 返回：success, output, error
- [ ] 3.2.3.2 实现 `perform_gui_action` 工具
  - 参数：sessionId, actionType, target, value
  - 返回：success, screenshot, message
  - 使用 ImageBlock 传递截图

#### Step 3.2.4: 创建测试用例
- [ ] 3.2.4.1 创建 `ComputerUseToolTest.java`
  - 测试各个 Computer-Use 功能
  - 验证结果格式
  - 验证截图传递

### Task 3.3: 集成测试（分 3 个小步骤）

#### Step 3.3.1: 创建基础集成测试
- [ ] 3.3.1.1 创建 `VmOperationsIntegrationTest.java`
  - 测试完整的虚拟机操作流程（创建 → 执行命令 → 删除）
  - 测试工具调用的完整流程

#### Step 3.3.2: 测试会话上下文和状态管理
- [ ] 3.3.2.1 测试会话上下文传递
  - 验证 sessionId 在不同工具调用间的一致性
  - 验证虚拟机状态的持久性

#### Step 3.3.3: 测试错误处理和边界情况
- [ ] 3.3.3.1 测试错误处理
  - 测试虚拟机不存在的情况
  - 测试命令执行失败的情况
  - 测试超时处理
  - 测试超时处理
- [ ] 3.3.4 验证原型功能
  - 验证所有功能是否正常工作
  - 记录遇到的问题和限制

## Phase 4: 集成方案设计

### Task 4.1: 工具包装架构设计

- [ ] 4.1.1 设计工具包装架构
  - VmManagerTool 的设计
  - ComputerUseTool 的设计
  - 工具注册和发现机制
- [ ] 4.1.2 设计会话上下文传递方案
  - sessionId 的传递方式
  - 上下文在工具调用链中的维护
  - 上下文验证和错误处理
- [ ] 4.1.3 设计虚拟机状态管理方案
  - 虚拟机状态的获取和缓存
  - 状态变更的通知机制
  - 状态一致性保证
- [ ] 4.1.4 创建架构设计文档
  - 创建 `docs/agentscope-research/vm-integration-architecture.md`
  - 包含架构图和设计说明

### Task 4.2: 错误处理和回退机制设计

- [ ] 4.2.1 设计错误处理策略
  - 工具调用失败的处理
  - 虚拟机操作失败的处理
  - 超时错误的处理
- [ ] 4.2.2 设计回退机制
  - 如果 AgentScope 工具调用失败，如何回退
  - 回退到现有实现的策略
  - 混合模式的可行性
- [ ] 4.2.3 设计监控和日志方案
  - 工具调用的监控指标
  - 错误日志记录
  - 性能指标收集
- [ ] 4.2.4 更新架构设计文档
  - 添加错误处理和回退机制设计

### Task 4.3: 性能影响评估

- [ ] 4.3.1 评估工具包装的性能开销
  - AgentTool 包装层的性能影响
  - 异步调用的性能影响
  - 上下文传递的性能影响
- [ ] 4.3.2 评估虚拟机操作的性能
  - 工具调用与直接调用的性能对比
  - 异步执行对响应时间的影响
- [ ] 4.3.3 创建性能评估文档
  - 创建 `docs/agentscope-research/vm-performance-evaluation.md`
  - 记录性能测试结果和分析

## Phase 5: 评估报告

### Task 5.1: 可行性结论

- [ ] 5.1.1 综合所有评估结果
  - AgentTool 接口适配性评估结果
  - Toolkit 工具管理机制评估结果
  - 原型验证结果
  - 技术难点和解决方案
- [ ] 5.1.2 给出明确的可行性结论
  - 适合/不适合/有条件适合
  - 说明理由和依据
  - 列出关键限制条件
- [ ] 5.1.3 创建可行性结论文档
  - 创建 `docs/agentscope-research/computer-use-feasibility.md`
  - 包含详细的可行性分析

### Task 5.2: 集成方案建议

- [ ] 5.2.1 如果可行，制定集成方案
  - 详细的集成步骤
  - 工具包装的实现方案
  - 测试策略
- [ ] 5.2.2 如果有条件可行，制定限制条件
  - 明确哪些功能可以使用 AgentScope
  - 哪些功能需要保留现有实现
  - 混合模式的实施方案
- [ ] 5.2.3 如果不可行，说明原因和替代方案
  - 详细说明不可行的原因
  - 提供替代方案建议
  - 评估替代方案的可行性
- [ ] 5.2.4 更新评估报告
  - 添加集成方案建议

### Task 5.3: 最终评估报告

- [ ] 5.3.1 整合所有评估内容
  - 场景分析结果
  - AgentScope 评估结果
  - 原型验证结果
  - 集成方案设计
  - 可行性结论
- [ ] 5.3.2 创建最终评估报告
  - 创建 `docs/agentscope-research/computer-use-evaluation-report.md`
  - 包含完整的评估内容和建议
- [ ] 5.3.3 更新 README
  - 更新 `docs/agentscope-research/README.md`
  - 添加 Computer-Use 评估相关文档的链接
