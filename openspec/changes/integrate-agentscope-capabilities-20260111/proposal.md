# Change: 基于 AgentScope 能力的 Mentis 增强

## Why

项目已经完成了 AgentScope Java 框架的研究和初步集成，但当前集成主要集中在框架基础设施层面（ReActAgent 创建、工具包装等），尚未充分利用 AgentScope 框架提供的丰富能力。

AgentScope 框架提供了许多高级能力，包括：
1. **多智能体协作**（Multi-Agent Collaboration）：支持多个 Agent 之间的协作和通信
2. **长期记忆管理**（Long-term Memory）：支持记忆的存储、检索和更新
3. **Planner 规划能力**（MetaPlanner）：支持复杂任务的分解和规划
4. **工具并行调用**（Parallel Tool Calls）：支持同时调用多个工具提升效率
5. **流式工具响应**（Streaming Tool Responses）：支持工具的流式输出
6. **结构化输出**（Structured Output）：支持类型安全的输出解析
7. **钩子函数系统**（Hooks）：支持实时干预和监控
8. **会话状态管理**（Session Management）：支持会话的持久化和恢复

当前 Mentis 系统虽然已经集成了 AgentScope 的基础功能，但还没有充分利用这些高级能力来提升系统的智能化水平和用户体验。

## What Changes

### 1. 多智能体协作增强 (Multi-Agent Collaboration Enhancement)
- **ADDED**: 基于 AgentScope 的多智能体协作框架
- **ADDED**: 智能体间消息传递机制（使用 AgentScope 的 Agent-to-Agent 通信）
- **ADDED**: 智能体角色定义和分工（基于 AgentScope 的 Role-based Agents）
- **ADDED**: 协作任务分解和分配（利用 AgentScope 的 Planner 能力）
- **ADDED**: 多智能体状态同步（基于 AgentScope 的 Session 管理）

### 2. 长期记忆管理增强 (Long-term Memory Enhancement)
- **ADDED**: 基于 AgentScope 的长期记忆系统
- **ADDED**: 记忆存储和检索（利用 AgentScope 的 Memory API）
- **ADDED**: 记忆重要性评分和更新
- **ADDED**: 记忆关联和上下文理解
- **ADDED**: 记忆压缩和优化

### 3. 任务规划能力增强 (Task Planning Enhancement)
- **ADDED**: 基于 AgentScope MetaPlanner 的复杂任务规划
- **ADDED**: 任务分解和步骤生成
- **ADDED**: 任务依赖关系管理
- **ADDED**: 动态任务调整和优化
- **ADDED**: 任务执行状态跟踪

### 4. 工具调用优化 (Tool Call Optimization)
- **ADDED**: 工具并行调用支持（利用 AgentScope 的 Parallel Tool Calls）
- **ADDED**: 工具流式响应处理（利用 AgentScope 的 Streaming Tool Responses）
- **ADDED**: 工具调用链优化（基于工具依赖关系的智能调度）
- **ADDED**: 工具调用失败重试和回退机制
- **ADDED**: 工具调用性能分析和优化

### 5. 结构化输出增强 (Structured Output Enhancement)
- **ADDED**: 基于 AgentScope 的结构化输出支持
- **ADDED**: 输出模式定义和验证（Schema Definition）
- **ADDED**: 类型安全的输出解析
- **ADDED**: 输出格式转换（JSON、XML、表格等）
- **ADDED**: 输出模板和自定义格式

### 6. 钩子函数系统 (Hook System)
- **ADDED**: 基于 AgentScope 的钩子函数系统
- **ADDED**: 实时监控钩子（监控 Agent 推理和执行过程）
- **ADDED**: 安全中断钩子（支持优雅取消和中断）
- **ADDED**: 人机协作钩子（支持人工干预和确认）
- **ADDED**: 自定义钩子函数开发框架

### 7. 会话状态管理增强 (Session Management Enhancement)
- **ADDED**: 基于 AgentScope 的会话状态管理
- **ADDED**: 会话持久化和恢复（利用 AgentScope 的 Session API）
- **ADDED**: 会话上下文传递和维护
- **ADDED**: 会话版本管理和回滚
- **ADDED**: 会话状态迁移和升级

### 8. AgentScope 工具生态扩展 (AgentScope Tool Ecosystem Expansion)
- **ADDED**: 基于 AgentScope 工具接口的标准工具库
- **ADDED**: 工具自动发现和注册机制
- **ADDED**: 工具文档生成和API文档
- **ADDED**: 工具测试框架和测试用例
- **ADDED**: 工具市场和管理界面

## Impact

- **Affected specs**: 多个新的能力规范（capabilities）
  - `mentis-agentscope-multi-agent` (新增)
  - `mentis-agentscope-memory` (新增)
  - `mentis-agentscope-planning` (新增)
  - `mentis-agentscope-tool-optimization` (新增)
  - `mentis-agentscope-structured-output` (新增)
  - `mentis-agentscope-hooks` (新增)
  - `mentis-agentscope-session` (修改现有会话管理)
  - `mentis-agentscope-tool-ecosystem` (新增)

- **Affected code**: 
  - 后端：
    - 新的多智能体协调服务（基于 AgentScope Multi-Agent API）
    - 新的记忆管理服务（基于 AgentScope Memory API）
    - 新的任务规划服务（基于 AgentScope MetaPlanner）
    - 工具调用优化服务（利用 AgentScope Parallel Tool Calls）
    - 结构化输出服务（基于 AgentScope Structured Output）
    - 钩子函数服务（基于 AgentScope Hooks）
    - 会话管理服务增强（基于 AgentScope Session API）
  - 前端：
    - 多智能体协作界面
    - 记忆管理界面
    - 任务规划可视化界面
    - 工具调用监控界面
    - 钩子函数配置界面
    - 会话状态管理界面
  - 数据库：
    - 新的表结构（多智能体协作记录、记忆存储、任务规划记录等）

- **New dependencies**: 
  - AgentScope Java 框架（已添加，需要升级到最新版本）
  - 可能需要额外的 AgentScope 扩展库（如果官方提供）

- **Breaking changes**: 
  - 可能需要升级 AgentScope 版本，需要验证向后兼容性
  - 会话管理 API 可能需要调整以支持新的 AgentScope Session API

## Non-Breaking Changes

此提案主要关注功能增强和新增，大部分功能与现有功能兼容。对于需要修改现有 API 的部分，会通过版本控制和渐进式迁移来保持向后兼容。

## Prerequisites

此提案依赖于以下前置条件：
1. AgentScope Java 框架已经成功集成（参考 `integrate-agentscope-java` 提案）
2. AgentScope 框架版本 >= 1.0.5（确保包含所需的高级能力）
3. 现有的工具包装（ComputerUseTool、CommandTool 等）已经完成
