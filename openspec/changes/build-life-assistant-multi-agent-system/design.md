# Design: Multi-Agent Collaboration Infrastructure

## Context

当前系统已有：
1. **6个预置生活助手角色**：时小光（时间管理）、康小健（健康生活）、学小知（学习成长）、心小暖（情绪陪伴）、心小安（心理健康）、暖小阳（情感陪伴）
   - 位于 `main` 模块，通过技能系统（`SkillExecutor`、`LLMBasedSkillExecutor`）工作
   - 使用 Function Calling 机制在前端触发技能执行
   - 目前是单智能体模式，每个角色独立工作
2. **48个专业技能**：每个助手8个技能，覆盖时间管理、健康、学习、情绪、心理等领域
3. **AgentScope 集成**：
   - `mentis` 模块已有 AgentScope 集成和 `MultiAgentCollaborationService`
   - 但 Mentis 的多智能体是针对通用任务协作（Computer-Use），不涉及生活助手
   - 可复用 Mentis 的 AgentScope 基础设施
4. **MCP 支持**：`mentis` 模块已有 MCP 工具发现和注册机制（`McpToolInitializer`），可复用

**架构设计原则**：
- **基础设施层**：通用的多智能体协作框架，可被多个应用场景使用
- **应用场景层**：生活助手作为第一个应用场景，使用基础设施实现多智能体协作
- 未来其他场景（如 Mentis、其他角色系统）也可以使用相同的基础设施

用户需求往往是跨领域的，需要多个助手协同工作才能提供完整解决方案。

## Goals / Non-Goals

### Goals

**基础设施层**：
- 构建通用的多智能体协作框架，可被多个应用场景使用
- 基于 AgentScope 构建可扩展的多智能体基础设施
- 集成 MCP 协议，提供标准化的上下文和工具访问
- 实现 a2a 协议，支持智能体间的标准化通信
- 提供智能任务分解和路由机制
- 支持动态协作编排和结果整合

**应用场景层**（生活助手）：
- 实现6个生活助手之间的智能协作，解决跨领域复杂问题
- 作为基础设施的第一个应用场景，验证和展示多智能体协作能力

### Non-Goals
- 不实现完整的 AgentScope Python 框架（使用现有 Java SDK）
- 不替换现有的单智能体交互模式（保持向后兼容）
- 不实现复杂的智能体学习或自适应能力（初期版本）
- 不实现跨系统的智能体通信（初期版本仅限系统内）
- 不将基础设施绑定到特定应用场景（保持通用性）

## Decisions

### Decision 1: AgentScope 作为多智能体框架基础
**What**: 使用 AgentScope Java SDK 作为多智能体协作的核心框架

**Rationale**:
- 系统已集成 AgentScope 依赖，有基础支持
- AgentScope 提供了成熟的多智能体协作能力
- Java SDK 与现有技术栈一致，无需引入 Python 运行时

**Alternatives considered**:
- LangGraph：功能强大但需要 Python 运行时，增加系统复杂度
- 自研框架：开发成本高，缺乏成熟度
- 纯 LLM 编排：灵活性差，难以实现复杂的协作逻辑

**Implementation**:
- 基于 `agentscope.multiagent` 包构建协作框架
- 每个生活助手映射为一个 AgentScope Agent
- 使用 AgentScope 的对话和协作机制

### Decision 2: MCP 协议集成
**What**: 集成 Model Context Protocol (MCP) 为智能体提供标准化的上下文和工具访问

**Rationale**:
- 系统已有 MCP 工具发现机制，可以复用
- MCP 提供了标准化的工具和上下文访问接口
- 支持智能体访问外部工具和资源

**Implementation**:
- 扩展现有的 `McpToolInitializer` 和 `McpToolDiscoveryService`
- 为每个智能体提供 MCP 客户端，访问共享工具
- 实现 MCP 上下文共享机制，支持智能体间共享信息

### Decision 3: a2a 协议实现
**What**: 实现 agent-to-agent 协议，支持智能体间的标准化通信

**Rationale**:
- 需要标准化的智能体间通信协议
- a2a 协议提供了消息传递、任务委托、结果共享等能力
- 支持异步通信和消息队列

**Implementation**:
- 定义 a2a 消息格式（请求、响应、通知、错误）
- 实现消息路由和分发机制
- 支持任务委托和结果回调

### Decision 4: 分层架构设计
**What**: 将多智能体系统分为基础设施层和应用场景层

**Rationale**:
- 多智能体协作是通用能力，不应绑定到特定应用场景
- 基础设施层可被多个应用场景复用（生活助手、Mentis、其他角色系统等）
- 应用场景层实现特定业务逻辑，使用基础设施提供的通用能力

**Implementation**:
- **基础设施层**：`main/backend/.../multiagent/` 包
  - 通用的 Agent 管理、路由、编排、协议实现
  - 不包含特定业务逻辑
- **应用场景层**：`main/backend/.../character/multiagent/` 包
  - 生活助手特定的路由策略和编排逻辑
  - 使用基础设施提供的接口

### Decision 5: 智能体路由策略
**What**: 基础设施提供通用路由接口，应用场景实现特定路由策略

**Rationale**:
- 不同应用场景有不同的路由需求
- 基础设施应提供灵活的接口，允许应用场景自定义路由逻辑
- 支持单智能体和多智能体协作两种模式

**Implementation**:
- 基础设施层：`AgentRouter` 接口和基础实现
- 应用场景层：`LifeAssistantRouter` 实现生活助手特定的路由逻辑
  - 分析用户意图
  - 基于技能分类和关键词匹配选择助手
  - 支持任务分解，将复杂任务分配给多个助手

### Decision 6: 协作编排引擎
**What**: 基础设施提供通用编排引擎，应用场景配置特定编排策略

**Rationale**:
- 编排逻辑有通用部分（工作流执行、结果整合、错误处理）
- 也有场景特定部分（生活助手的协作模式、Mentis 的任务执行模式）
- 基础设施提供通用能力，应用场景配置特定策略

**Implementation**:
- 基础设施层：`CollaborationOrchestrator` 通用编排引擎
  - 协作工作流引擎（顺序、并行、条件分支）
  - 结果整合机制
  - 超时和重试机制
- 应用场景层：`LifeAssistantOrchestrator` 使用编排引擎，配置生活助手特定的协作策略

## Architecture

### 分层架构

```
┌─────────────────────────────────────────────┐
│           应用场景层（Application）           │
│  ┌──────────────────────────────────────┐  │
│  │  生活助手多智能体协作（Life Assistant） │  │
│  │  - LifeAssistantOrchestrator          │  │
│  │  - LifeAssistantRouter                │  │
│  │  - LifeAssistantAgent                  │  │
│  └──────────────────────────────────────┘  │
│  （未来可扩展：Mentis、其他角色系统等）      │
└──────────────────┬──────────────────────────┘
                   │ 使用
┌──────────────────▼──────────────────────────┐
│        基础设施层（Infrastructure）            │
│  ┌──────────────────────────────────────┐  │
│  │  多智能体协作框架（Multi-Agent Core）  │  │
│  │  - AgentRouter (通用路由)              │  │
│  │  - CollaborationOrchestrator (编排)    │  │
│  │  - AgentRegistry (Agent 管理)          │  │
│  │  - MCP Protocol (上下文和工具)          │  │
│  │  - A2A Protocol (智能体通信)            │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  AgentScope Multi-Agent Framework     │  │
│  │  ┌──────────┐  ┌──────────┐          │  │
│  │  │ Agent 1  │  │ Agent 2  │  ...     │  │
│  │  └────┬─────┘  └────┬─────┘          │  │
│  │       │            │                  │  │
│  │       └─────a2a───┘                  │  │
│  │            │                          │  │
│  │       MCP Context & Tools             │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 执行流程（以生活助手为例）

```
用户请求
  ↓
LifeAssistantRouter (生活助手特定路由策略)
  ↓
CollaborationOrchestrator (通用编排引擎)
  ↓
AgentRegistry (获取相关 Agent: 时小光、康小健等)
  ↓
AgentScope Multi-Agent Framework
  ↓
结果整合
  ↓
返回用户
```

## Risks / Trade-offs

### Risk 1: AgentScope Java SDK 功能限制
**Risk**: AgentScope Java SDK 可能功能不如 Python 版本完整

**Mitigation**: 
- 先实现核心功能，验证可行性
- 如功能不足，考虑混合架构（Java 调用 Python 服务）或自研补充

### Risk 2: 多智能体协作复杂度
**Risk**: 多智能体协作可能增加系统复杂度和响应时间

**Mitigation**:
- 初期实现简单的协作模式（顺序、并行）
- 设置合理的超时和重试机制
- 提供降级方案（单智能体模式）

### Risk 3: MCP 和 a2a 协议实现复杂度
**Risk**: 协议实现可能比预期复杂

**Mitigation**:
- 先实现核心功能，逐步完善
- 参考现有 MCP 实现，复用已有代码
- 使用标准化的消息格式，便于扩展

### Risk 4: 性能问题
**Risk**: 多智能体协作可能影响响应速度

**Mitigation**:
- 实现异步执行和结果缓存
- 优化智能体选择算法，减少不必要的协作
- 提供用户可配置的协作模式（快速模式 vs 深度协作模式）

## Migration Plan

### Phase 1: 基础框架搭建
1. 扩展现有 AgentScope 集成，支持多智能体
2. 实现基础的 a2a 消息传递
3. 实现简单的智能体路由

### Phase 2: 协议集成
1. 完善 MCP 集成，支持智能体访问工具
2. 实现完整的 a2a 协议
3. 实现协作编排引擎

### Phase 3: 功能完善
1. 实现智能任务分解和路由
2. 实现结果整合机制
3. 实现前端可视化界面

### Phase 4: 优化和测试
1. 性能优化
2. 错误处理和恢复机制
3. 完整测试和文档

## Open Questions

1. **AgentScope Java SDK 的具体 API**：需要进一步调研 Java SDK 的多智能体 API
2. **a2a 协议标准**：需要确认 a2a 协议的具体规范和实现细节
3. **协作模式**：需要确定支持的协作模式（顺序、并行、条件分支等）
4. **结果整合策略**：需要确定如何整合多个助手的输出结果
