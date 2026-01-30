# Agent Mind 管理模块设计

## Context

Admin 后台已经具备管理多个模块的能力（如 Mentis 管理）。现在需要为 Agent Mind 模块添加类似的管理功能，让管理员能够：
- 集中管理智能体的身份认知信息
- 监控智能体的意识状态
- 管理智能体的能力配置
- 配置和管理意识相关的实验

Agent Mind 模块使用独立的数据库 `heartsphere_agent_mind`，需要配置多数据源访问。

## Goals / Non-Goals

### Goals
- 在 Admin 后台提供 Agent Mind 的集中管理界面
- 支持智能体身份认知、状态、能力的完整管理
- 实现 Admin 后端与 Agent Mind 数据库的数据访问
- 提供实时监控和数据分析功能

### Non-Goals
- 不修改 Agent Mind 模块本身的代码（只通过数据库访问）
- 不实现复杂的意识分析算法（这是 Agent Mind 模块的职责）
- 不实现实时双向同步（使用简单的配置同步即可）

## Decisions

### Decision 1: 多数据源访问策略
**What**: Admin 后端配置多数据源，直接访问 Agent Mind 数据库
**Why**: 
- 保持模块独立性
- 避免跨服务调用的复杂性
- 提高数据访问性能
- 与 Mentis 管理采用相同的模式

**Alternatives considered**:
- 通过 Agent Mind API 访问：增加网络开销和复杂性
- 共享数据库：影响模块独立性

### Decision 2: 只读 + 配置更新模式
**What**: Admin 后台主要提供查看和配置更新功能，不直接修改运行时的意识状态
**Why**:
- 保持 Agent Mind 模块的自主性
- 避免破坏意识发展的自然过程
- 配置更新通过同步机制传递

**Alternatives considered**:
- 完全控制：可能影响意识发展的自然性
- 只读模式：无法进行必要的配置管理

### Decision 3: 参考 Mentis 管理模式
**What**: 采用与 Mentis 管理类似的结构和模式
**Why**:
- 保持 Admin 后台的一致性
- 复用已有的设计模式
- 降低开发成本

**Alternatives considered**:
- 全新设计：增加开发成本，可能不一致

## Architecture

### 数据访问架构

```
Admin Backend
├── Primary DataSource (heartsphere)
│   └── Admin 相关表
└── AgentMind DataSource (heartsphere_agent_mind)
    ├── agent_identity 表
    ├── agent_state_history 表
    └── 其他 Agent Mind 相关表
```

### 组件架构

```
Admin Frontend
├── AgentMindManagementPage
│   ├── AgentIdentityManagement (身份认知管理)
│   ├── AgentStateMonitoring (状态监控)
│   ├── AgentCapabilityManagement (能力管理)
│   └── ConsciousnessExperimentManagement (实验管理)
└── API Services
    └── agentMind.ts

Admin Backend
├── AgentMindManagementController
├── AgentMindManagementService
├── AgentMindRepository (使用 Agent Mind 数据源)
└── AgentMindSyncService (数据同步)
```

### 数据同步机制

```
Admin Backend (配置更新)
    ↓
AgentMindSyncService
    ↓
Agent Mind Backend API (可选)
    ↓
Agent Mind Database (更新)
```

## Risks / Trade-offs

### Risk 1: 多数据源配置复杂
**Mitigation**: 
- 参考 Admin 模块已有的多数据源配置
- 使用成熟的 Spring 多数据源方案
- 充分测试数据源切换

### Risk 2: 数据一致性
**Mitigation**:
- 配置更新通过同步机制确保一致性
- 使用事务管理确保数据完整性
- 定期验证数据一致性

### Risk 3: 性能影响
**Mitigation**:
- 使用连接池优化数据库连接
- 缓存常用的配置数据
- 异步处理非关键操作

## Migration Plan

### 实施步骤
1. 配置多数据源访问 Agent Mind 数据库
2. 实现后端 API 和管理服务
3. 实现前端管理界面
4. 实现数据同步机制
5. 测试和验证

### 向后兼容
- 不影响现有的 Admin 功能
- 不影响 Agent Mind 模块的独立运行
- 新功能作为可选功能添加

## Open Questions

1. **数据同步频率**：配置更新是否需要实时同步，还是可以延迟同步？
2. **权限控制**：哪些管理员可以管理 Agent Mind 配置？
3. **实验管理**：意识实验管理需要哪些具体功能？
4. **与 Main 模块集成**：是否需要从 Main 模块的角色系统选择智能体？
