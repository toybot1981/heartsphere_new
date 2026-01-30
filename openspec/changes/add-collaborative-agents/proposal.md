# Change: Add Collaborative Agents

## Why

当前多智能体框架已经具备了基础架构和6个生活助手智能体（时小光、康小健、学小知、心小暖、心小安、暖小阳），但缺少能够真正展示多智能体协同能力的场景。为了验证框架的可用性和展示多智能体协作的实际效果，需要设计几个能够协同工作的智能体，并编写完整的测试用例来保证框架的可用性。

## What Changes

- **ADDED**: 设计3-4个新的可协同智能体，覆盖不同领域（如：工作助手、财务顾问、旅行规划师、创意助手等）
- **ADDED**: 实现智能体间的协同场景（如：多智能体协作完成复杂任务）
- **ADDED**: 编写完整的单元测试、集成测试和端到端测试
- **ADDED**: 创建测试场景文档，展示多智能体协作的实际应用

## Impact

- **Affected specs**: `multi-agent-collaboration`
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/character/multiagent/agent/` - 新增智能体实现
  - `main/backend/src/test/java/com/heartsphere/character/multiagent/` - 新增测试用例
  - `main/backend/src/test/java/com/heartsphere/multiagent/` - 新增协作测试
- **Dependencies**: 需要确保现有的多智能体框架基础设施（AgentRegistry、CollaborationOrchestrator、AgentRouter）正常工作
