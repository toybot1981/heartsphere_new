# 冲突分析：生活助手多智能体系统

## 系统架构关系

### 1. 模块划分

- **main 模块**：主系统
  - 包含角色系统、技能系统
  - 6个生活助手角色（时小光、康小健、学小知、心小暖、心小安、暖小阳）
  - 技能系统使用 `SkillExecutor` 和 `LLMBasedSkillExecutor`
  - 通过 Function Calling 机制在前端触发技能

- **mentis 模块**：独立的超级智能体模块
  - 专注于 Computer-Use 能力
  - 已有 `MultiAgentCollaborationService` 用于通用任务协作
  - 使用 AgentScope 进行任务分解和执行
  - 不涉及生活助手角色

### 2. 现有功能分析

#### 2.1 生活助手当前实现
- **位置**：`main` 模块
- **工作方式**：单智能体模式
  - 用户与单个角色对话
  - 通过 Function Calling 触发该角色的技能
  - 技能通过 `LLMBasedSkillExecutor` 执行
- **技能系统**：
  - `SkillExecutor`：技能执行器服务
  - `LLMBasedSkillExecutor`：基于大模型的技能执行器
  - 技能通过 `RULE_BASED` 执行类型，使用 Level 2 指令和 Level 3 资源

#### 2.2 Mentis 多智能体系统
- **位置**：`mentis` 模块
- **功能**：通用任务协作
  - `MultiAgentCollaborationService`：多智能体协作服务
  - 用于任务分解和执行（Computer-Use）
  - 不涉及生活助手角色
- **AgentScope 集成**：
  - `agentscope/multiagent/` 包
  - 已有基础的协作框架

### 3. 潜在冲突点

#### 3.1 代码位置冲突
- **问题**：提案中最初将代码放在 `mentis/backend/...`，但生活助手属于 `main` 模块
- **解决**：将生活助手多智能体系统实现在 `main/backend/...` 中
- **影响**：需要明确代码组织，避免与 Mentis 模块混淆

#### 3.2 AgentScope 基础设施复用
- **问题**：两个模块都需要使用 AgentScope
- **解决**：
  - 可以复用 Mentis 的 AgentScope 配置和基础设施
  - 但生活助手的协作逻辑应该在 `main` 模块中实现
  - 考虑将 AgentScope 基础设施提取到 `shared` 模块（如果存在）

#### 3.3 技能系统集成
- **问题**：生活助手通过技能系统工作，多智能体协作需要与技能系统集成
- **解决**：
  - 保持技能系统的现有接口不变
  - 在多智能体协作中，将技能调用封装为 Agent 的能力
  - 可能需要扩展技能系统以支持多智能体场景

#### 3.4 MCP 协议复用
- **问题**：MCP 工具发现机制在 Mentis 模块中
- **解决**：
  - 可以复用 Mentis 的 MCP 基础设施
  - 或者将 MCP 相关代码提取到共享模块
  - 生活助手多智能体系统通过 MCP 访问共享工具

### 4. 无冲突的方面

#### 4.1 功能独立性
- ✅ 生活助手多智能体协作是 `main` 模块的功能
- ✅ Mentis 的多智能体是独立的功能，不冲突
- ✅ 两者可以共存，互不影响

#### 4.2 用户交互方式
- ✅ 生活助手：用户与角色对话，触发技能
- ✅ Mentis：用户与超级智能体对话，执行 Computer-Use 任务
- ✅ 两者交互方式不同，不冲突

#### 4.3 数据模型
- ✅ 生活助手使用角色和技能数据模型
- ✅ Mentis 使用任务和执行数据模型
- ✅ 数据模型独立，不冲突

### 5. 建议的解决方案

#### 5.1 代码组织（分层架构）

```
main/backend/src/main/java/com/heartsphere/
├── multiagent/                 # 新建：多智能体基础设施（可复用）
│   ├── core/                  # 核心框架
│   │   ├── Agent.java         # Agent 接口
│   │   ├── BaseAgent.java     # Agent 基类
│   │   └── AgentRegistry.java # Agent 注册和发现
│   ├── orchestrator/          # 协作编排引擎（通用）
│   ├── router/                # 智能体路由系统（通用接口）
│   └── protocol/              # MCP 和 a2a 协议
│
├── character/multiagent/      # 新建：生活助手应用场景
│   ├── LifeAssistantOrchestrator.java  # 使用基础设施
│   ├── LifeAssistantRouter.java        # 实现特定路由策略
│   └── agent/                 # 6个生活助手 Agent 实现
│
└── skill/                      # 现有：技能系统（可能需要扩展）

mentis/backend/src/main/java/com/heartsphere/mentis/
└── agentscope/                 # 现有：AgentScope 基础设施（可复用）
```

#### 5.2 依赖关系
- 生活助手多智能体系统可以依赖 Mentis 的 AgentScope 基础设施（如果提取到共享模块）
- 或者独立实现，但复用 AgentScope Java SDK

#### 5.3 技能系统扩展
- 保持现有技能系统接口不变
- 在多智能体协作中，将技能调用作为 Agent 的工具/能力
- 可能需要添加多智能体场景下的技能调用接口

### 6. 结论

**无重大冲突**：
- 多智能体协作框架作为基础设施，可被多个应用场景使用
- 生活助手是第一个应用场景，使用基础设施实现多智能体协作
- Mentis 的多智能体系统是独立功能，未来也可以使用相同的基础设施
- 两者可以共存，互不影响

**架构设计要点**：
1. **分层设计**：
   - 基础设施层：通用的多智能体协作框架（`multiagent/` 包）
   - 应用场景层：生活助手特定实现（`character/multiagent/` 包）
2. **代码位置**：基础设施和应用场景都在 `main` 模块中实现
3. **基础设施复用**：可以考虑复用 Mentis 的 AgentScope 和 MCP 基础设施
4. **技能系统集成**：需要与现有技能系统良好集成
5. **可扩展性**：基础设施设计应支持未来其他应用场景（如 Mentis、其他角色系统）
