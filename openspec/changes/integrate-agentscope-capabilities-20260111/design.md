# Design: 基于 AgentScope 能力的 Mentis 增强

## Context

### 背景

项目已经完成了 AgentScope Java 框架的基础集成（参考 `integrate-agentscope-java` 提案），当前 Mentis 系统使用 AgentScope 的 ReActAgent 作为核心智能体引擎，并将现有的执行器（ComputerUseExecutor、CommandExecutor、ScriptExecutor）包装为 AgentScope 工具。

然而，AgentScope 框架提供了许多高级能力，这些能力尚未被充分利用：
- 多智能体协作（Multi-Agent Collaboration）
- 长期记忆管理（Long-term Memory）
- 任务规划（MetaPlanner）
- 工具并行调用和流式响应
- 结构化输出（Structured Output）
- 钩子函数系统（Hooks）
- 会话状态管理（Session）

### 当前架构

```
MentisAgentService (AgentScope-based)
  └── ReActAgent (AgentScope)
      ├── Tools
      │   ├── ComputerUseTool
      │   ├── CommandTool
      │   └── ScriptTool
      ├── ChatModel (DashScope/OpenAI)
      └── Basic Session Management
```

### 约束条件

1. **技术约束**：
   - 必须保持与现有 Spring Boot 3.2.0 架构兼容
   - 必须保持与现有数据库 schema 兼容（或提供迁移方案）
   - 必须保持 API 向后兼容（或提供版本管理）

2. **业务约束**：
   - 不能影响现有功能的正常运行
   - 必须支持渐进式迁移和回退机制
   - 必须保持性能在可接受范围内

3. **依赖约束**：
   - AgentScope Java 框架版本 >= 1.0.5
   - 需要验证 AgentScope 高级能力的 API 稳定性和可用性

## Goals / Non-Goals

### Goals

1. **充分利用 AgentScope 框架能力**：
   - 集成 AgentScope 的多智能体协作能力
   - 集成 AgentScope 的长期记忆管理能力
   - 集成 AgentScope 的任务规划能力（MetaPlanner）
   - 利用 AgentScope 的工具优化能力（并行调用、流式响应）
   - 利用 AgentScope 的结构化输出能力
   - 利用 AgentScope 的钩子函数系统
   - 增强会话状态管理（基于 AgentScope Session API）

2. **提升系统智能化水平**：
   - 支持多智能体协作，提升复杂任务处理能力
   - 支持长期记忆，提升上下文理解能力
   - 支持智能任务规划，提升任务执行效率
   - 支持工具优化，提升执行性能

3. **提升用户体验**：
   - 支持结构化输出，提升结果可读性和可用性
   - 支持实时监控和干预，提升可控性
   - 支持会话状态管理，提升对话连续性

4. **建立工具生态**：
   - 建立标准化的工具开发框架
   - 建立工具市场和分享机制
   - 建立工具文档和测试体系

### Non-Goals

1. **不替换现有基础设施**：
   - 不替换现有的数据库系统
   - 不替换现有的消息队列（如果有）
   - 不替换现有的监控系统（如果有）

2. **不完全依赖 AgentScope**：
   - 保留现有 MentisSessionService 作为备选方案
   - 保留现有工具执行器作为底层实现
   - 保留现有 API 接口作为兼容层

3. **不强制迁移**：
   - 不强制所有功能立即使用 AgentScope 能力
   - 支持渐进式迁移
   - 支持功能开关控制

## Decisions

### Decision 1: 渐进式集成策略

**决策**：采用渐进式集成策略，逐步引入 AgentScope 高级能力，而不是一次性替换所有功能。

**理由**：
- 降低风险，确保系统稳定性
- 允许逐步验证功能对等性
- 支持回退机制
- 减少对现有功能的影响

**替代方案**：
- 一次性替换：风险高，难以回退
- 完全保留现有实现：无法利用 AgentScope 能力

**实施方式**：
- 为每个新功能提供配置开关（`mentis.agentscope.{feature}.enabled`）
- 保留现有实现作为备选方案
- 通过 A/B 测试验证新功能

### Decision 2: 混合架构模式

**决策**：采用混合架构模式，AgentScope 能力作为增强层，现有实现作为基础层。

**理由**：
- 保持现有功能的稳定性
- 充分利用 AgentScope 能力
- 支持灵活的功能组合

**架构设计**：
```
MentisAgentService (Interface)
  ├── MentisAgentScopeEnhancedService (AgentScope 增强实现)
  │   ├── ReActAgent (AgentScope)
  │   ├── Multi-Agent Collaboration (AgentScope)
  │   ├── Long-term Memory (AgentScope)
  │   ├── MetaPlanner (AgentScope)
  │   └── Hooks (AgentScope)
  └── MentisAgentServiceImpl (现有实现，作为备选)
```

### Decision 3: 数据存储策略

**决策**：对于 AgentScope 特定的数据（如记忆、会话状态），使用混合存储策略：
- 短期数据：存储在 AgentScope Session 中
- 长期数据：存储在 Mentis 数据库中
- 记忆数据：使用 AgentScope Memory API + Mentis 数据库持久化

**理由**：
- AgentScope Session 提供快速访问和状态管理
- Mentis 数据库提供持久化和查询能力
- 混合策略平衡性能和持久性需求

**实施方式**：
- AgentScope Session 作为运行时缓存
- Mentis 数据库作为持久化存储
- 定期同步 Session 数据到数据库

### Decision 4: 工具生态建设策略

**决策**：建立基于 AgentScope Tool 接口的标准工具生态，包括：
- 工具开发框架和规范
- 工具自动发现和注册机制
- 工具文档自动生成
- 工具测试框架
- 工具市场和分享机制

**理由**：
- 标准化工具开发，降低开发成本
- 促进工具复用和分享
- 提升工具质量和可维护性

**实施方式**：
- 定义工具开发规范和接口
- 实现工具自动发现机制（基于 Java SPI 或注解）
- 实现工具文档生成（基于 JavaDoc 和注解）
- 建立工具市场和评分机制

### Decision 5: 性能优化策略

**决策**：充分利用 AgentScope 的性能优化能力：
- 工具并行调用：对于独立工具，使用并行调用
- 流式响应：对于长时间运行的工具，使用流式响应
- 记忆缓存：使用缓存机制优化记忆检索性能

**理由**：
- 提升系统响应速度和吞吐量
- 改善用户体验（实时反馈）
- 降低资源消耗

**实施方式**：
- 识别可并行的工具调用
- 实现工具并行调用调度器
- 实现流式响应处理管道
- 实现记忆缓存层

## Risks / Trade-offs

### Risk 1: AgentScope API 稳定性

**风险**：AgentScope 框架的高级能力 API 可能不够稳定，或者版本更新导致 API 变更。

**影响**：可能导致集成代码需要频繁调整，增加维护成本。

**缓解措施**：
- 使用配置开关，支持快速回退到现有实现
- 封装 AgentScope API，提供稳定的抽象层
- 定期关注 AgentScope 版本更新和 API 变更
- 建立 API 兼容性测试

### Risk 2: 性能影响

**风险**：引入 AgentScope 高级能力可能带来性能开销（如多智能体协作、记忆检索等）。

**影响**：可能导致系统响应时间增加，资源消耗增加。

**缓解措施**：
- 进行性能基准测试，对比现有实现
- 实现性能监控和告警
- 优化关键路径（如记忆检索使用缓存）
- 支持功能降级（如禁用某些高级功能）

### Risk 3: 数据一致性

**风险**：混合存储策略（AgentScope Session + Mentis 数据库）可能导致数据不一致。

**影响**：可能导致会话状态丢失、记忆数据不一致等问题。

**缓解措施**：
- 实现数据同步机制，定期同步 Session 到数据库
- 实现数据一致性检查
- 实现数据恢复机制
- 使用事务保证关键操作的一致性

### Risk 4: 学习曲线

**风险**：开发团队需要学习 AgentScope 框架的高级能力，增加学习成本。

**影响**：可能导致开发进度延迟，代码质量下降。

**缓解措施**：
- 提供详细的文档和示例代码
- 组织技术培训和分享
- 建立代码审查机制
- 提供开发工具和模板

### Trade-off 1: 功能丰富度 vs 系统复杂度

**权衡**：引入更多 AgentScope 能力可以提升系统功能，但也会增加系统复杂度。

**决策**：采用渐进式引入，优先引入高价值、低风险的能力。

**实施**：
- 第一阶段：多智能体协作、长期记忆（高价值）
- 第二阶段：任务规划、工具优化（中等价值）
- 第三阶段：钩子函数、工具生态（长期价值）

### Trade-off 2: AgentScope 依赖 vs 自主可控

**权衡**：依赖 AgentScope 框架可以快速获得能力，但也会增加对第三方框架的依赖。

**决策**：保持现有实现作为备选，通过抽象层隔离依赖。

**实施**：
- 定义统一的接口和抽象层
- 保留现有实现作为备选方案
- 支持运行时切换实现

## Migration Plan

### Phase 1: 基础设施准备（2-3 周）

1. **AgentScope 版本升级**：
   - 检查最新版本和更新日志
   - 升级到最新稳定版本
   - 验证 API 兼容性

2. **架构设计**：
   - 设计混合架构模式
   - 设计数据存储策略
   - 设计 API 抽象层

3. **开发环境准备**：
   - 配置开发环境
   - 准备测试数据
   - 建立开发规范

### Phase 2: 核心能力集成（4-6 周）

1. **多智能体协作**（优先级：高）：
   - 实现 Agent 注册和发现
   - 实现 Agent 间通信
   - 实现协作任务分解
   - 实现状态同步

2. **长期记忆管理**（优先级：高）：
   - 实现记忆存储和检索
   - 实现记忆重要性评分
   - 实现记忆关联和上下文理解
   - 实现记忆压缩和优化

3. **任务规划**（优先级：中）：
   - 集成 MetaPlanner
   - 实现任务分解和步骤生成
   - 实现任务依赖管理
   - 实现动态任务调整

### Phase 3: 优化能力集成（3-4 周）

1. **工具调用优化**：
   - 实现并行工具调用
   - 实现流式工具响应
   - 实现工具调用链优化
   - 实现性能分析

2. **结构化输出**：
   - 实现输出模式定义
   - 实现类型安全解析
   - 实现输出格式转换
   - 实现输出模板

3. **钩子函数系统**：
   - 实现钩子注册和管理
   - 实现监控钩子
   - 实现中断钩子
   - 实现人机协作钩子

### Phase 4: 会话和工具生态（2-3 周）

1. **会话状态管理增强**：
   - 集成 AgentScope Session API
   - 实现会话持久化和恢复
   - 实现会话版本管理
   - 实现会话状态迁移

2. **工具生态建设**：
   - 建立工具开发框架
   - 实现工具自动发现
   - 实现工具文档生成
   - 建立工具市场

### Phase 5: 测试和优化（2-3 周）

1. **功能测试**：
   - 单元测试
   - 集成测试
   - 端到端测试

2. **性能测试**：
   - 性能基准测试
   - 压力测试
   - 性能优化

3. **文档和培训**：
   - 编写技术文档
   - 编写用户文档
   - 组织技术培训

### 回退计划

如果集成过程中遇到严重问题，可以：
1. 使用配置开关禁用新功能，回退到现有实现
2. 保留现有代码分支，支持快速回退
3. 实现功能降级机制，自动回退到稳定版本

## Open Questions

1. **AgentScope API 可用性**：
   - AgentScope 的高级能力 API（Multi-Agent、Memory、MetaPlanner）是否已经稳定可用？
   - API 文档是否完整？
   - 是否有示例代码和最佳实践？

2. **性能基准**：
   - AgentScope 高级能力的性能表现如何？
   - 与现有实现相比，性能提升或下降多少？
   - 需要多少资源（CPU、内存、存储）？

3. **数据迁移**：
   - 现有会话数据如何迁移到 AgentScope Session？
   - 现有记忆数据如何迁移到 AgentScope Memory？
   - 迁移过程是否会影响现有功能？

4. **工具生态**：
   - 工具市场的用户需求如何？
   - 工具分享和评分的机制如何设计？
   - 工具版本管理和兼容性如何保证？

5. **监控和可观测性**：
   - AgentScope 是否提供监控和可观测性能力？
   - 如何监控多智能体协作的性能？
   - 如何监控记忆检索和任务规划的性能？

## References

- AgentScope Java 官方文档：https://java.agentscope.io/zh/intro.html
- AgentScope Runtime API 参考：https://runtime.agentscope.io/zh/api/index.html
- AgentScope GitHub：https://github.com/agentscope-ai/agentscope-java
- 项目内 AgentScope 研究文档：`docs/agentscope-research/`
- 项目内 AgentScope 集成提案：`openspec/changes/integrate-agentscope-java/`
