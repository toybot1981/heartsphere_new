# Change: Evaluate AgentScope Java for Computer-Use (Virtual Machine Operations)

## Why

在集成 AgentScope Java 框架之前，需要评估其工具系统（AgentTool/Toolkit）是否能够支持 Mentis 的 **computer-use** 场景，即为 AI 提供一个可以操作的虚拟机环境。

**核心问题**：
1. **AgentScope 的工具机制是否适合 computer-use 场景？**
   - Computer-Use 需要长时间运行、有状态、需要上下文的操作
   - 需要管理虚拟机的生命周期（创建、启动、停止、删除）
   - 需要在虚拟机内执行命令、脚本和 GUI 操作
   - 需要会话与虚拟机的绑定关系

2. **能否通过 AgentTool 包装现有的 VmManager 和 ComputerUseExecutor？**
   - VmManager 提供虚拟机管理功能
   - ComputerUseExecutor 提供命令执行、脚本执行、GUI 自动化
   - 这些功能需要作为工具暴露给 AgentScope 的 ReActAgent

3. **AgentScope 的工具调用机制是否能支持这种复杂的交互？**
   - 工具调用需要传入 sessionId 以获取对应的虚拟机
   - 工具执行可能是异步的、长时间运行的
   - 工具执行结果需要反馈给 Agent 进行下一步推理

如果不评估这个问题就贸然集成，可能导致：
- AgentScope 的工具机制无法满足 computer-use 的复杂需求
- 需要大量自定义代码来桥接，失去了使用框架的优势
- 无法充分利用 AgentScope 的 ReAct 推理能力来操作虚拟机
- 发现架构不匹配时需要回退或重新设计

## What Changes

### 核心变更

- **ADDED**: Computer-Use 场景分析文档
  - Computer-Use 的核心需求分析
  - 虚拟机操作的特点和要求
  - 会话管理与虚拟机绑定的关系
  - 工具调用的上下文需求

- **ADDED**: AgentScope 工具系统适配性评估
  - AgentTool 接口是否满足需求
  - Toolkit 的工具管理机制是否适用
  - 工具调用的同步/异步特性
  - 工具执行结果的反馈机制

- **ADDED**: 原型验证实现
  - VmManagerTool：将 VmManager 包装为 AgentTool
  - ComputerUseTool：将 ComputerUseExecutor 包装为 AgentTool
  - 会话上下文传递机制验证
  - 虚拟机生命周期管理工具验证

- **ADDED**: 集成方案设计
  - 工具包装架构设计
  - 会话上下文传递方案
  - 虚拟机状态管理方案
  - 错误处理和回退机制

- **ADDED**: 评估报告
  - 可行性结论（是否适合）
  - 技术难点和解决方案
  - 性能影响评估
  - 集成复杂度评估

### 交付物

1. **分析文档**：
   - `docs/agentscope-research/computer-use-evaluation.md` - Computer-Use 场景分析
   - `docs/agentscope-research/agentscope-tool-evaluation.md` - AgentScope 工具系统评估
   - `docs/agentscope-research/vm-integration-design.md` - 虚拟机集成方案设计

2. **原型代码**：
   - `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/VmManagerTool.java` - VmManager 工具包装
   - `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/ComputerUseTool.java` - ComputerUse 工具包装
   - `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/VmOperationsTest.java` - 虚拟机操作测试

3. **评估报告**：
   - 可行性结论
   - 技术难点和解决方案
   - 集成方案建议

## Impact

- **Affected specs**: New capability `agentscope-computer-use-evaluation` (to be created)
- **Affected code**:
  - **New**: `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/` - 原型验证代码
  - **New**: `docs/agentscope-research/` - 评估文档
  - **No modification** to production code
- **New dependencies**: 
  - 无（使用已有的 AgentScope 依赖）
- **Storage**: 评估文档和原型代码（不涉及数据库变更）
- **Deployment**: 无需部署（仅研究和原型）

## Non-Breaking Changes

这是一个纯粹的研究和评估阶段，**不修改任何生产代码**，因此完全向后兼容。

- 原型代码仅用于验证，不会影响现有功能
- 评估文档仅供内部参考，不影响系统运行
- 如果评估不通过，可以完全放弃，不影响现有系统

## Success Criteria

### 场景分析成功标准

1. ✅ 完成 Computer-Use 核心需求分析
2. ✅ 明确虚拟机操作的特点和要求
3. ✅ 理清会话管理与虚拟机绑定的关系
4. ✅ 识别工具调用的上下文需求

### AgentScope 评估成功标准

1. ✅ 评估 AgentTool 接口是否满足需求
2. ✅ 评估 Toolkit 的工具管理机制是否适用
3. ✅ 验证工具调用的同步/异步特性
4. ✅ 验证工具执行结果的反馈机制
5. ✅ 识别技术难点和限制

### 原型验证成功标准

1. ✅ 成功将 VmManager 包装为 AgentTool
2. ✅ 成功将 ComputerUseExecutor 包装为 AgentTool
3. ✅ 验证会话上下文传递机制
4. ✅ 验证虚拟机生命周期管理工具
5. ✅ 验证工具调用流程的完整性

### 集成方案设计成功标准

1. ✅ 设计完整的工具包装架构
2. ✅ 设计会话上下文传递方案
3. ✅ 设计虚拟机状态管理方案
4. ✅ 设计错误处理和回退机制
5. ✅ 评估集成复杂度和性能影响

### 评估报告成功标准

1. ✅ 明确的可行性结论（适合/不适合/有条件适合）
2. ✅ 详细的技术难点和解决方案
3. ✅ 性能影响评估
4. ✅ 集成复杂度评估
5. ✅ 具体的集成建议（如果可行）

## Timeline

**预计时间**：1-2 周

- **Week 1**：
  - 场景分析和 AgentScope 评估
  - 原型验证实现
- **Week 2**：
  - 集成方案设计
  - 评估报告撰写

## Next Steps

1. **如果评估通过**：将集成方案纳入 `integrate-agentscope-java` 提案
2. **如果评估不通过**：记录不通过原因，考虑替代方案或改进现有实现
3. **如果有条件通过**：根据限制条件调整集成方案，修改 `integrate-agentscope-java` 提案

## Dependencies

- **前置条件**：
  - `research-agentscope-java` 提案已完成（API 已验证）
  - 了解 AgentScope 的工具系统（Toolkit/AgentTool）
- **后续依赖**：`integrate-agentscope-java` 提案可能依赖此评估结果
