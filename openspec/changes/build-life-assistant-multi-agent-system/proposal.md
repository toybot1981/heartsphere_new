# Change: Build Life Assistant Multi-Agent System

## Why

当前系统已有6个预置的生活助手角色（时小光、康小健、学小知、心小暖、心小安、暖小阳），每个角色都具备8个专业技能，共48个技能。然而，这些助手目前是独立工作的，无法协同解决用户的复杂问题。

用户的实际需求往往是跨领域的，例如：
- "我想提高工作效率，同时保持健康的生活方式"（需要时小光和康小健协作）
- "我最近学习压力大，情绪低落，想改善心理健康"（需要学小知、心小暖、心小安协作）
- "我想养成早睡早起的习惯，同时提升学习效率"（需要康小健、时小光、学小知协作）

通过构建基于 AgentScope 的多智能体系统，并融入 MCP（Model Context Protocol）和 a2a（agent-to-agent）协议，可以实现：
1. **智能任务分解**：将用户复杂需求分解为多个子任务，分配给合适的助手
2. **跨领域协作**：不同专业领域的助手可以协同工作，提供综合解决方案
3. **协议化通信**：使用标准化的 MCP 和 a2a 协议，确保智能体间通信的可靠性和可扩展性
4. **动态编排**：根据任务需求动态选择和组合助手，形成最优协作方案

## What Changes

- **新增（基础设施）**: 基于 AgentScope 的多智能体协作框架，作为可复用的基础设施
  - 多智能体协作核心框架（可被多个应用场景使用）
  - MCP（Model Context Protocol）集成，为智能体提供标准化的上下文和工具访问接口
  - a2a（agent-to-agent）协议支持，实现智能体间的标准化通信
  - 智能体路由系统，根据任务需求自动选择和组织合适的智能体
  - 协作编排引擎，管理多智能体的执行流程和结果整合
- **新增（应用场景）**: 生活助手多智能体协作应用
  - 6个生活助手的多智能体协作实现（使用基础设施）
  - 生活助手特定的路由策略和编排逻辑
  - 前端协作可视化界面，展示多智能体协作过程和结果

## Impact

- **Affected specs**: 
  - 新增 `multi-agent-collaboration` capability
  - 可能修改现有的 `mentis-agent` 相关能力（如果存在）
- **Affected code**:
  - **基础设施层**（可复用）:
    - `main/backend/src/main/java/com/heartsphere/multiagent/` - 多智能体协作基础设施（新建）
      - `core/` - 核心框架（Agent 管理、通信、协作）
      - `orchestrator/` - 协作编排引擎
      - `router/` - 智能体路由系统
      - `protocol/` - MCP 和 a2a 协议实现
    - 可能复用 `mentis/backend/src/main/java/com/heartsphere/mentis/agentscope/` 中的 AgentScope 基础设施
  - **应用场景层**（生活助手）:
    - `main/backend/src/main/java/com/heartsphere/character/multiagent/` - 生活助手多智能体应用（新建）
      - `LifeAssistantOrchestrator.java` - 生活助手编排服务（使用基础设施）
      - `LifeAssistantRouter.java` - 生活助手路由策略（使用基础设施）
      - `LifeAssistantAgent.java` - 生活助手 Agent 实现
    - `main/backend/src/main/java/com/heartsphere/skill/service/` - 可能需要扩展技能系统以支持多智能体协作
    - `main/frontend/src/components/MultiAgentCollaboration/` - 前端协作界面
- **Breaking changes**: 无（新增功能，不影响现有单智能体交互）
- **架构说明**:
  - **基础设施层**：通用的多智能体协作框架，可被多个应用场景使用（生活助手、Mentis 等）
  - **应用场景层**：生活助手作为第一个应用场景，使用基础设施实现多智能体协作
  - 未来其他场景（如 Mentis、其他角色系统）也可以使用相同的基础设施
