# Spec: AgentScope Integration

## ADDED Requirements

### Requirement: REQ-AGENTSCOPE-001

系统 SHALL 集成 AgentScope Java 框架作为 Mentis 智能体的核心引擎，替代当前的自研实现。框架集成包括添加依赖、配置模型适配器、初始化框架组件等。

#### Scenario: Framework Setup
- **Given**: 项目已经配置好 Spring Boot 3.2.0 和 Maven
- **When**: 开发者添加 AgentScope Java 依赖到 `pom.xml`
- **Then**: 
  - AgentScope Java 依赖成功添加，无依赖冲突
  - 框架可以正常初始化和运行
  - 与现有 Spring Boot 组件兼容

#### Scenario: Model Adapter Configuration
- **Given**: AgentScope 框架已集成
- **When**: 配置模型适配器（DashScope、OpenAI 等）
- **Then**:
  - 可以使用统一的模型配置（与现有 AIService 兼容）
  - 支持流式和非流式调用
  - 模型调用正常，响应格式正确

---

### Requirement: REQ-AGENTSCOPE-002

系统 SHALL 使用 AgentScope 的 ReActAgent 作为 Mentis 的核心智能体，实现推理-行动循环。ReActAgent 负责理解用户意图、规划任务、调用工具、生成响应等核心功能。

#### Scenario: Agent Creation
- **Given**: AgentScope 配置完成
- **When**: 创建 ReActAgent 实例
- **Then**:
  - Agent 成功创建，包含系统提示词配置
  - 工具（Tools）正确注册
  - Planner 正确配置（如果启用）

#### Scenario: Message Processing
- **Given**: ReActAgent 已创建
- **When**: 处理用户消息
- **Then**:
  - Agent 正确理解用户意图
  - 能够调用适当的工具
  - 生成正确的响应

---

### Requirement: REQ-AGENTSCOPE-003

系统 SHALL 将现有的执行器（ComputerUseExecutor、CommandExecutor、ScriptExecutor）包装为 AgentScope 工具，使 Agent 能够通过工具调用机制执行计算机操作、命令执行、脚本运行等功能。

#### Scenario: ComputerUseTool Creation
- **Given**: ComputerUseExecutor 已实现
- **When**: 创建 ComputerUseTool 包装类
- **Then**:
  - 实现 AgentScope 的 Tool 接口
  - 正确描述工具功能和参数
  - 能够调用底层的 ComputerUseExecutor
  - 工具调用结果正确返回

#### Scenario: CommandTool Creation
- **Given**: CommandExecutor 已实现
- **When**: 创建 CommandTool 包装类
- **Then**:
  - 实现 AgentScope 的 Tool 接口
  - 支持命令执行
  - 包含安全性检查

#### Scenario: ScriptTool Creation
- **Given**: ScriptExecutor 已实现
- **When**: 创建 ScriptTool 包装类
- **Then**:
  - 实现 AgentScope 的 Tool 接口
  - 支持多种脚本语言
  - 脚本执行结果正确返回

---

### Requirement: REQ-AGENTSCOPE-004

系统 SHALL 使用 AgentScope 的 MetaPlanner 进行任务分解和管理。MetaPlanner 负责将用户的复杂任务分解为可执行的步骤，并管理步骤之间的依赖关系。

#### Scenario: Task Decomposition
- **Given**: MetaPlanner 已配置
- **When**: 用户请求一个复杂任务
- **Then**:
  - Planner 正确分解任务为多个步骤
  - 步骤之间依赖关系正确
  - 任务计划可执行

#### Scenario: Task Execution with Planner
- **Given**: 任务已分解为多个步骤
- **When**: 执行任务计划
- **Then**:
  - 按照计划顺序执行步骤
  - 处理步骤依赖关系
  - 任务执行结果正确

---

### Requirement: REQ-AGENTSCOPE-005

系统 SHALL 使用 AgentScope 的 Structured Output 功能实现类型安全的输出解析。结构化输出确保 Agent 生成的响应符合预定义的数据结构，无需手动解析 JSON，减少解析错误。

#### Scenario: Structured Response Parsing
- **Given**: Structured Output 已配置
- **When**: Agent 生成响应
- **Then**:
  - 响应符合预定义的结构
  - 类型安全，无需手动解析 JSON
  - 解析错误能正确处理

---

### Requirement: REQ-AGENTSCOPE-006

系统 SHALL 使用 AgentScope 的流式能力实现实时响应流式传输。流式响应允许用户实时看到 Agent 生成的响应内容，提升用户体验。流式响应格式必须与现有的 SSE 格式兼容。

#### Scenario: Stream Message Processing
- **Given**: ReActAgent 已配置流式模式
- **When**: 处理用户消息（流式）
- **Then**:
  - Agent 以流式方式生成响应
  - 每个 chunk 及时发送给前端
  - 前端能正确接收和显示流式内容
  - 流式响应格式与现有 SSE 格式兼容

#### Scenario: Tool Call in Stream
- **Given**: 流式处理中需要调用工具
- **When**: Agent 决定调用工具
- **Then**:
  - 工具调用信息正确发送给前端
  - 工具执行结果能及时反馈
  - 流式响应继续正常进行

---

### Requirement: REQ-AGENTSCOPE-007

系统 SHALL 集成 OpenTelemetry 实现分布式追踪和性能监控。可观测性功能包括追踪请求流程、监控性能指标、记录日志等，帮助诊断问题和优化性能。

#### Scenario: Distributed Tracing
- **Given**: OpenTelemetry 已配置
- **When**: 处理用户请求
- **Then**:
  - 请求追踪信息正确记录
  - 工具调用链路可追踪
  - 追踪数据可以查询和可视化

#### Scenario: Performance Monitoring
- **Given**: 监控系统已配置
- **When**: 系统处理请求
- **Then**:
  - AgentScope 调用时间被记录
  - 工具执行时间被记录
  - 流式响应延迟被记录
  - 性能指标可以查询和分析

---

## MODIFIED Requirements

### Requirement: REQ-MENTIS-001

系统 SHALL 重构 MentisAgentService 实现，使用 AgentScope 替代当前自研实现。重构后的实现必须保持 API 接口兼容，不影响现有客户端的使用。

#### Scenario: Service Refactoring
- **Given**: AgentScope 集成完成
- **When**: 重构 MentisAgentServiceImpl
- **Then**:
  - 实现 MentisAgentService 接口
  - 内部使用 AgentScope ReActAgent
  - 保持接口兼容性（API 不变）
  - 功能完整，性能不降

#### Scenario: Backward Compatibility
- **Given**: 新实现已部署
- **When**: 客户端调用 API
- **Then**:
  - API 端点不变（`/api/admin/mentis/chat/stream`）
  - 请求格式不变（`ChatRequestDTO`）
  - 响应格式不变（`ChatResponseDTO`）
  - SSE 格式不变

---

### Requirement: REQ-MENTIS-002

系统 SHALL 将 ExecutionEngine 重构为 AgentScope 工具，使用工具调用机制替代独立执行流程。执行引擎的功能保持不变，但调用方式改为通过 Agent 的工具调用机制触发。

#### Scenario: Tool-Based Execution
- **Given**: 执行器已包装为工具
- **When**: Agent 需要执行任务
- **Then**:
  - Agent 通过工具调用机制触发执行
  - 执行结果正确返回给 Agent
  - Agent 根据结果生成响应

---

## Configuration

### Requirement: REQ-CONFIG-001: AgentScope Configuration

**Description**: 添加 AgentScope 相关配置项，支持灵活配置和动态切换。

#### Scenario: Configuration Setup
- **Given**: AgentScope 已集成
- **When**: 配置 AgentScope 参数
- **Then**:
  - 可以在 `application.yml` 中配置
  - 支持环境变量覆盖
  - 配置验证生效
  - 配置变更能热更新（如果支持）

#### Scenario: Implementation Switching
- **Given**: 新旧实现并存
- **When**: 通过配置切换实现
- **Then**:
  - 可以动态选择使用哪个实现
  - 切换不需要重启服务
  - 切换后功能正常

---

## Performance

### Requirement: REQ-PERF-001: Performance Requirements

**Description**: AgentScope 集成的性能不低于现有实现。

#### Scenario: Response Time
- **Given**: 相同的用户请求
- **When**: 使用 AgentScope 实现处理
- **Then**:
  - 响应时间不超过现有实现的 1.2 倍
  - 流式响应延迟不超过现有实现的 1.2 倍

#### Scenario: Resource Usage
- **Given**: 相同的并发负载
- **When**: 使用 AgentScope 实现
- **Then**:
  - 内存使用不超过现有实现的 1.2 倍
  - CPU 使用不超过现有实现的 1.2 倍

---

## Security

### Requirement: REQ-SEC-001: Security Requirements

**Description**: AgentScope 集成必须保持或增强安全性。

#### Scenario: Tool Execution Security
- **Given**: 工具已配置
- **When**: Agent 调用工具
- **Then**:
  - 工具执行前进行权限检查
  - 危险操作被阻止
  - 执行日志被记录

#### Scenario: Input Validation
- **Given**: 用户输入数据
- **When**: 数据传递给 AgentScope
- **Then**:
  - 输入验证生效
  - 恶意输入被过滤
  - 错误信息安全（不泄露敏感信息）

---

## Testing

### Requirement: REQ-TEST-001: Test Coverage

**Description**: AgentScope 集成必须有充分的测试覆盖。

#### Scenario: Unit Test Coverage
- **Given**: 代码已实现
- **When**: 运行单元测试
- **Then**:
  - 测试覆盖率 >= 80%
  - 关键组件 100% 覆盖
  - 所有测试通过

#### Scenario: Integration Test
- **Given**: 系统已集成
- **When**: 运行集成测试
- **Then**:
  - 端到端流程测试通过
  - 流式响应测试通过
  - 工具调用测试通过
