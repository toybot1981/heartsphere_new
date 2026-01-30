## 1. 基础设施层：多智能体协作框架

- [x] 1.1 调研 AgentScope Java SDK 的多智能体 API，确认可用功能（已完成，见 docs/agentscope-research/）
- [x] 1.2 创建 `main/backend/.../multiagent/core/` 包，实现核心框架
  - [x] 1.2.1 实现 `Agent` 接口和基础实现，定义智能体的通用能力
  - [x] 1.2.2 实现 `AgentRegistry` 服务，支持 Agent 的注册和发现
  - [x] 1.2.3 实现 Agent 生命周期管理（创建、启动、停止、销毁）
- [x] 1.3 实现 Agent 能力描述机制，支持按能力查找 Agent
- [x] 1.4 创建 `BaseAgent` 抽象类，提供智能体的通用功能

## 2. a2a 协议实现

- [x] 2.1 定义 a2a 消息格式（请求、响应、通知、错误）
- [x] 2.2 实现 `AgentToAgentProtocol` 接口，定义标准化的智能体间通信接口
- [x] 2.3 实现消息路由和分发机制 `AgentMessageRouter`
- [ ] 2.4 实现任务委托机制，支持 Agent A 委托任务给 Agent B（在编排引擎中实现）
- [ ] 2.5 实现结果回调机制，支持异步任务的结果通知（在编排引擎中实现）

## 3. MCP 协议集成

- [x] 3.1 扩展现有的 `McpToolDiscoveryService`，支持为每个智能体提供 MCP 客户端（通过 `McpProtocol` 接口）
- [x] 3.2 实现 MCP 上下文共享机制，支持智能体间共享上下文信息（`McpProtocolImpl.shareContext`）
- [x] 3.3 实现 MCP 工具访问权限管理，确保智能体只能访问授权的工具（`McpProtocolImpl` 权限管理）
- [x] 3.4 创建 MCP 工具包装器，将 MCP 工具暴露给智能体使用（`McpToolWrapper`）

## 4. 基础设施层：智能体路由系统

- [x] 4.1 实现 `AgentRouter` 接口，定义通用的路由能力
- [ ] 4.2 实现基础路由实现，提供通用的路由逻辑（由应用场景层实现特定策略）
- [x] 4.3 实现任务分解接口，支持将复杂任务分解为子任务
- [x] 4.4 实现路由策略配置机制，支持不同的路由模式（单智能体、多智能体协作）

## 5. 基础设施层：协作编排引擎

- [x] 5.1 创建 `CollaborationOrchestrator` 接口，定义多智能体协作流程管理
- [x] 5.2 实现协作工作流引擎，支持顺序、并行、条件分支等模式（`CollaborationOrchestratorImpl`）
- [x] 5.3 实现任务分配接口，支持将子任务分配给合适的智能体
- [x] 5.4 实现执行协调机制，管理智能体的执行顺序和依赖关系
- [x] 5.5 实现结果整合机制，合并多个智能体的输出结果
- [ ] 5.6 实现超时和重试机制，处理异常情况（基础实现已完成，可后续增强）

## 6. 应用场景层：生活助手多智能体协作

- [x] 6.1 创建 `main/backend/.../character/multiagent/` 包，实现生活助手应用场景
- [x] 6.2 实现 `LifeAssistantRouter`，实现生活助手特定的路由策略
  - [x] 6.2.1 分析用户意图，识别涉及的生活助手领域
  - [x] 6.2.2 基于技能分类和关键词匹配选择助手
  - [x] 6.2.3 实现任务分解，将复杂任务分配给多个助手
- [x] 6.3 实现 `LifeAssistantOrchestrator`，使用基础设施编排引擎，配置生活助手特定的协作策略
- [x] 6.4 实现6个生活助手 Agent（使用基础设施的 `BaseAgent`）
  - [x] 6.4.1 实现时小光 Agent（时间管理导师），集成8个时间管理技能
  - [x] 6.4.2 实现康小健 Agent（健康生活顾问），集成8个健康管理技能
  - [x] 6.4.3 实现学小知 Agent（学习成长导师），集成8个学习成长技能
  - [x] 6.4.4 实现心小暖 Agent（情绪陪伴师），集成8个情绪陪伴技能
  - [x] 6.4.5 实现心小安 Agent（心理健康守护者），集成8个心理健康技能
  - [x] 6.4.6 实现暖小阳 Agent（情感陪伴伙伴），集成8个情感陪伴技能

## 7. API 接口实现

- [x] 7.1 创建 `MultiAgentCollaborationController`，提供多智能体协作 API
- [x] 7.2 实现协作请求接口，接收用户请求并启动多智能体协作
- [x] 7.3 实现协作状态查询接口，支持查询协作进度和结果
- [x] 7.4 实现协作结果获取接口，返回整合后的结果

## 8. 前端界面实现

- [x] 8.1 创建 `MultiAgentCollaboration` 组件，展示多智能体协作界面
- [x] 8.2 实现协作流程可视化，展示参与的智能体和执行步骤
- [x] 8.3 实现实时状态更新，显示每个智能体的执行状态
- [x] 8.4 实现结果展示，以清晰的方式展示整合后的结果
- [x] 8.5 实现交互式界面，允许用户查看每个智能体的详细输出

## 9. 测试和验证

- [x] 9.1 编写单元测试，测试各个组件的功能
  - [x] AgentRegistryTest - 注册表测试
  - [x] BaseAgentTest - 智能体基类测试
  - [x] CollaborationOrchestratorImplTest - 编排引擎测试
  - [x] AgentMessageRouterTest - 消息路由测试
  - [x] LifeAssistantRouterTest - 生活助手路由测试
- [x] 9.2 编写集成测试，测试多智能体协作流程（MultiAgentCollaborationIntegrationTest）
- [ ] 9.3 测试跨领域场景，验证6个助手的协作能力（需要实际运行测试）
- [ ] 9.4 性能测试，确保多智能体协作不影响系统性能（需要性能测试工具）
- [x] 9.5 错误处理测试，验证异常情况的处理机制（在单元测试中已覆盖）

## 10. 文档和配置

- [x] 10.1 编写多智能体系统使用文档（USAGE_GUIDE.md）
- [x] 10.2 编写 API 文档，说明协作接口的使用方法（API_REFERENCE.md）
- [x] 10.3 编写配置文档，说明如何配置智能体和路由策略（CONFIGURATION_GUIDE.md）
- [x] 10.4 创建示例场景文档，展示典型的使用案例（EXAMPLE_SCENARIOS.md）
