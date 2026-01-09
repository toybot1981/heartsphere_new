# Change: Integrate AgentScope Java into Mentis

## Why

Mentis 超级智能体当前采用自研的架构实现，包括意图识别、任务分解、执行引擎等核心组件。虽然功能完整，但存在以下问题：

1. **开发效率低**：需要手动实现和维护大量底层组件（意图识别、任务分解、流式响应处理等）
2. **架构复杂**：组件间依赖关系复杂，难以维护和扩展
3. **缺乏标准化**：没有遵循业界成熟的智能体框架标准
4. **功能重复**：部分功能与 AgentScope Java 重叠（如任务规划、结构化输出等）

**AgentScope Java 的优势**：
- **成熟的框架**：基于 ReAct（Reasoning-Acting）范式，提供标准化的智能体开发模式
- **统一的智能体**：ReActAgent 内部自动处理推理-行动循环，无需手动实现意图识别和任务规划
- **丰富的工具系统**：支持同步/异步工具函数、流式工具响应、并行工具调用
- **结构化输出**：支持类型安全的输出解析，减少手动 JSON 解析
- **流式响应**：原生支持流式生成和调用（`.callStream()` 方法）
- **会话管理**：支持智能体状态的持久化存储和恢复（可选）
- **长期记忆**：支持跨会话的语义搜索和知识召回（可选）
- **企业级特性**：工具沙箱（安全隔离）、钩子函数（实时介入）、可观测性支持

**当前 Mentis 的问题**：
- 手动编排多个组件（意图识别、任务规划、执行、响应生成），代码复杂
- 意图识别和任务规划逻辑分散，难以维护和扩展
- 流式响应处理需要手动管理，容易出错
- 缺乏标准化的工具调用机制

通过集成 AgentScope Java，可以：
- **简化架构**：使用 ReActAgent 替代手动编排，减少代码量约 30-40%
- **标准化实现**：遵循业界成熟的框架，提高可维护性
- **功能增强**：获得流式响应、结构化输出、工具系统等增强功能
- **提升效率**：利用框架能力，减少重复代码和手动处理

## What Changes

### 核心变更

- **ADDED**: AgentScope Java 框架依赖和集成
  - Maven 依赖配置（`io.github.modelscope:agentscope-java`，具体坐标需确认）
  - 框架初始化和配置
  - 模型适配器集成（DashScope、OpenAI 等）
  
- **MODIFIED**: Mentis 智能体核心服务重构（**主要变更**）
  - 使用 AgentScope 的 `ReActAgent` 替代当前的手动编排实现
  - **移除**独立的 `IntentRecognizer` 和 `TaskPlanner`（由 ReActAgent 内部处理）
  - **保留** Mentis 的业务逻辑层（`MentisSessionService`、`MentisMessageService`）
  - 重构流式响应处理，使用 AgentScope 的 `.callStream()` 方法
  
- **ADDED**: AgentScope 工具包装（**关键集成点**）
  - 将 `ComputerUseExecutor` 包装为 `ComputerUseTool`
  - 将 `CommandExecutor` 包装为 `CommandTool`
  - 将 `ScriptExecutor` 包装为 `ScriptTool`
  - 工具实现 AgentScope 的 `Tool` 接口，注册到 ReActAgent
  
- **ADDED**: 结构化输出支持（**可选增强**）
  - 使用 AgentScope 的结构化输出功能
  - 替代现有的 `LLMResponseParser` 手动解析逻辑
  
- **ADDED**: 会话和记忆集成（**可选增强**）
  - 评估 AgentScope 的 Session 管理（如支持）
  - 评估长期记忆功能（如支持）
  - 优先保留现有 Mentis 实现，确保业务连续性
  
- **REMOVED**: 意图识别和任务规划的独立实现
  - `IntentRecognizer` 和 `TaskPlanner` 不再需要
  - 其逻辑可以通过系统提示词和工具描述指导 ReActAgent

### 架构调整

**现有架构**（手动编排）：
```
用户消息
  ↓
MentisAgentService
  ├── IntentRecognizer (意图识别) ← LLM 调用
  ├── TaskPlanner (任务规划) ← LLM 调用
  ├── ExecutionEngine (执行引擎)
  │   ├── ComputerUseExecutor
  │   ├── CommandExecutor
  │   └── ScriptExecutor
  └── ResponseGenerator (响应生成) ← LLM 调用
      └── AIService (大模型调用)
```

**新架构**（AgentScope 驱动）：
```
用户消息 (Msg)
  ↓
MentisAgentService
  └── ReActAgent (AgentScope)
      ├── 内部 ReAct 循环（推理-行动）
      │   ├── 推理：理解用户意图
      │   └── 行动：调用工具或生成响应
      ├── Tools (工具集合)
      │   ├── ComputerUseTool (包装 ComputerUseExecutor)
      │   ├── CommandTool (包装 CommandExecutor)
      │   └── ScriptTool (包装 ScriptExecutor)
      ├── ChatModel (模型适配器)
      │   ├── DashScopeChatModel
      │   └── 其他模型适配器
      └── 结构化输出 (Structured Output)
      
保留的业务层（不变）：
  ├── MentisSessionService (会话管理)
  └── MentisMessageService (消息存储)
```

**关键变化**：
- **移除**：`IntentRecognizer`、`TaskPlanner`、`ResponseGenerator`（由 ReActAgent 内部处理）
- **简化**：`ExecutionEngine` 不再需要，工具直接注册到 ReActAgent
- **保留**：执行器实现（`ComputerUseExecutor` 等），只是包装为工具
- **保留**：会话和消息管理（业务逻辑层）

## Impact

- **Affected specs**: 
  - New capability `agentscope-integration` (to be created)
  - Modified capability `mentis-agent` (to be updated)
  
- **Affected code**:
  - **Modified**: `backend/src/main/java/com/heartsphere/mentis/service/MentisAgentServiceImpl.java`
    - 重构为使用 AgentScope ReActAgent
    - 保留会话管理和消息存储逻辑
  - **Modified**: `backend/src/main/java/com/heartsphere/mentis/executor/ExecutionEngine.java`
    - 将执行引擎包装为 AgentScope 工具
  - **New**: `backend/src/main/java/com/heartsphere/mentis/agentscope/`
    - `MentisAgentScopeConfig.java` - AgentScope 配置
    - `ComputerUseTool.java` - Computer-Use 工具包装
    - `CommandTool.java` - 命令执行工具包装
    - `ScriptTool.java` - 脚本执行工具包装
  - **Modified**: `backend/src/main/java/com/heartsphere/admin/controller/AdminMentisController.java`
    - 适配新的流式响应接口
  - **Modified**: `backend/pom.xml`
    - 添加 AgentScope Java 依赖
  
- **New dependencies**:
  - `io.github.modelscope:agentscope-java` (AgentScope Java 框架)
  - `io.micrometer:micrometer-tracing` (可观测性，如果 AgentScope 支持)
  
- **Modified dependencies**:
  - 可能需要升级 Spring Boot 版本以兼容 AgentScope（需评估）
  
- **Database**: 
  - 不需要修改数据库 schema
  - 可能需要添加新的配置表（AgentScope 配置）
  
- **API compatibility**:
  - **Breaking**: 流式响应格式可能发生变化（需要评估）
  - **Non-breaking**: REST API 端点保持不变
  - **Non-breaking**: 前端接口保持兼容（可能需要小幅调整）

## Non-Breaking Changes

### 兼容性考虑

1. **API 兼容性**：
   - REST API 端点保持不变（`/api/admin/mentis/chat/stream`）
   - 响应格式保持兼容（`ChatResponseDTO`）
   - SSE 事件格式保持一致

2. **数据兼容性**：
   - 现有数据库 schema 保持不变
   - 会话和消息数据格式不变

3. **配置兼容性**：
   - 现有的 `mentis.enabled` 等配置保持不变
   - 新增 AgentScope 相关配置（可选）

### 迁移策略

1. **渐进式迁移**：
   - 保留现有实现，新增 AgentScope 实现
   - 通过配置开关选择使用哪个实现
   - 逐步迁移，确保稳定性

2. **回退机制**：
   - 如果 AgentScope 集成出现问题，可以快速切回原实现
   - 保留原代码，标记为 deprecated

3. **测试验证**：
   - 完整的单元测试和集成测试
   - 性能对比测试
   - 功能回归测试

## Risks and Mitigations

### 技术风险

1. **依赖冲突**：
   - **风险**：AgentScope Java 可能与现有依赖冲突
   - **缓解**：评估依赖兼容性，必要时隔离依赖或升级框架版本

2. **性能影响**：
   - **风险**：新框架可能影响性能
   - **缓解**：进行性能测试，对比优化

3. **学习曲线**：
   - **风险**：团队需要学习 AgentScope Java
   - **缓解**：提供培训文档，循序渐进地迁移

### 业务风险

1. **功能缺失**：
   - **风险**：AgentScope 可能不支持某些 Mentis 特有功能
   - **缓解**：评估功能覆盖，保留必要的自定义实现

2. **稳定性**：
   - **风险**：新框架可能存在未知问题
   - **缓解**：充分测试，渐进式迁移，保留回退机制

## Success Criteria

1. ✅ AgentScope Java 成功集成到 Mentis
2. ✅ 核心功能（意图识别、任务分解、执行）正常工作
3. ✅ 流式响应正常工作
4. ✅ 性能不低于现有实现
5. ✅ 代码量减少至少 20%
6. ✅ 可观测性增强（分布式追踪、性能监控）
7. ✅ 完整的测试覆盖
