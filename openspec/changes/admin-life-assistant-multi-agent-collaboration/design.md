# Design: Admin Life Assistant Multi-Agent Collaboration Management

## Goals

1. **可观测性**：管理员能够全面了解多智能体协作系统的运行状态
2. **可配置性**：管理员能够灵活配置协作策略和系统参数
3. **可维护性**：管理员能够快速定位和解决协作问题
4. **可分析性**：管理员能够分析协作效果，优化系统性能

## Non-Goals

1. **不修改核心协作逻辑**：管理后台只负责监控和配置，不改变核心协作流程
2. **不实现新的协作算法**：复用现有的路由和编排逻辑
3. **不提供用户端功能**：用户端功能已在 `build-life-assistant-multi-agent-system` 中实现

## Architecture

### 系统架构

```
管理后台 (admin)
    ↓ (HTTP API)
Main 模块多智能体系统
    ↓
基础设施层 (multiagent)
    ↓
应用场景层 (character/multiagent)
```

### 数据流

1. **监控数据流**：
   - 协作执行时记录日志和指标
   - 管理后台查询和聚合数据
   - 前端展示统计和图表

2. **配置数据流**：
   - 管理员在后台修改配置
   - 配置保存到数据库或配置文件
   - 系统读取配置并应用

3. **日志数据流**：
   - 协作执行时记录详细日志
   - 日志存储到数据库或日志系统
   - 管理后台查询和展示日志

## Key Design Decisions

### 1. 数据获取方式

**决策**：通过 API 调用 main 模块的服务获取数据，而不是直接访问数据库

**理由**：
- 保持模块间的解耦
- 复用现有的业务逻辑
- 避免跨模块的数据访问

**实现**：
- 管理后台通过 REST API 调用 main 模块的协作服务
- 或者通过共享的 Service 层直接调用（如果模块在同一应用中）

### 2. 日志存储策略

**决策**：协作日志存储在数据库中，支持查询和分析

**理由**：
- 需要持久化存储以便后续分析
- 支持复杂的查询和筛选
- 可以关联用户、会话等上下文信息

**实现**：
- 创建 `MultiAgentCollaborationLog` 实体
- 在协作执行时记录关键事件
- 支持按时间、用户、状态等维度查询

### 3. 配置管理方式

**决策**：使用数据库存储配置，支持动态更新

**理由**：
- 配置需要持久化
- 支持多管理员同时管理
- 可以记录配置变更历史

**实现**：
- 使用现有的 `SystemConfig` 实体或创建专门的配置表
- 提供配置 API 供管理后台调用
- 系统启动时加载配置，运行时支持热更新

### 4. 监控指标设计

**决策**：记录关键性能指标（KPI）和业务指标

**指标包括**：
- 协作任务总数、成功数、失败数
- 平均执行时间、最长执行时间
- 各智能体的调用次数、成功率
- 路由准确率、用户满意度

**实现**：
- 在协作执行时记录指标
- 定期聚合统计数据
- 提供实时和历史数据查询

## Implementation Details

### 1. 协作场景管理

**功能**：
- 查看协作任务列表（支持分页、搜索、筛选）
- 查看协作详情（任务描述、参与的智能体、执行结果）
- 查看协作状态（运行中、已完成、失败、已取消）
- 手动触发或取消协作任务

**API 设计**：
```
GET  /admin/api/multi-agent/collaborations - 获取协作列表
GET  /admin/api/multi-agent/collaborations/{id} - 获取协作详情
POST /admin/api/multi-agent/collaborations/{id}/cancel - 取消协作
GET  /admin/api/multi-agent/collaborations/statistics - 获取统计信息
```

### 2. 智能体管理

**功能**：
- 查看6个生活助手 Agent 的状态
- 查看 Agent 的能力和技能
- 查看 Agent 的执行历史
- 启用/禁用 Agent
- 查看 Agent 的性能指标

**API 设计**：
```
GET  /admin/api/multi-agent/agents - 获取 Agent 列表
GET  /admin/api/multi-agent/agents/{id} - 获取 Agent 详情
PUT  /admin/api/multi-agent/agents/{id}/status - 更新 Agent 状态
GET  /admin/api/multi-agent/agents/{id}/history - 获取执行历史
GET  /admin/api/multi-agent/agents/{id}/metrics - 获取性能指标
```

### 3. 路由策略配置

**功能**：
- 查看当前路由策略配置
- 修改关键词匹配规则
- 调整智能体优先级
- 配置任务分解规则
- 测试路由策略

**API 设计**：
```
GET  /admin/api/multi-agent/routing/config - 获取路由配置
PUT  /admin/api/multi-agent/routing/config - 更新路由配置
POST /admin/api/multi-agent/routing/test - 测试路由策略
```

### 4. 系统配置

**功能**：
- 配置协作超时时间
- 配置重试策略
- 配置并发限制
- 配置日志级别
- 配置 AgentScope 参数

**API 设计**：
```
GET  /admin/api/multi-agent/config - 获取系统配置
PUT  /admin/api/multi-agent/config - 更新系统配置
```

### 5. 日志和审计

**功能**：
- 查看协作执行日志
- 搜索和筛选日志
- 查看错误日志
- 导出日志数据

**API 设计**：
```
GET  /admin/api/multi-agent/logs - 获取日志列表
GET  /admin/api/multi-agent/logs/{id} - 获取日志详情
GET  /admin/api/multi-agent/logs/errors - 获取错误日志
POST /admin/api/multi-agent/logs/export - 导出日志
```

## Risks and Mitigations

### 风险 1：性能影响

**风险**：记录详细日志可能影响协作执行性能

**缓解**：
- 使用异步日志记录
- 批量写入数据库
- 可配置日志详细程度

### 风险 2：数据量增长

**风险**：协作日志数据量可能快速增长

**缓解**：
- 实现日志归档和清理策略
- 只保留最近N天的详细日志
- 历史数据可以压缩存储

### 风险 3：配置冲突

**风险**：多个管理员同时修改配置可能导致冲突

**缓解**：
- 实现配置版本控制
- 提供配置变更历史
- 支持配置回滚

## Testing Strategy

1. **单元测试**：测试管理服务的各个方法
2. **集成测试**：测试管理后台与 main 模块的集成
3. **端到端测试**：测试完整的管理流程
4. **性能测试**：测试大量数据下的查询性能
