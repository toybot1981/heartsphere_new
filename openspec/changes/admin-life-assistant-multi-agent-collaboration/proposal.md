# Change: Admin Life Assistant Multi-Agent Collaboration Management

## Why

当前系统已经实现了生活助手多智能体协作功能（`build-life-assistant-multi-agent-system`），用户可以通过前端界面发起多智能体协作请求，6个生活助手可以协同解决复杂问题。

然而，作为系统管理员，需要能够：
1. **监控和管理协作场景**：查看协作任务的执行情况、成功率、耗时等指标
2. **配置协作策略**：调整路由策略、编排模式、超时设置等参数
3. **管理智能体状态**：查看各个生活助手 Agent 的状态、能力、执行历史
4. **分析协作效果**：查看协作统计、用户反馈、优化建议
5. **故障排查**：查看协作日志、错误信息、性能瓶颈

目前缺少管理后台对这些功能的支持，管理员无法有效管理和优化多智能体协作系统。

## What Changes

- **新增（管理后台）**: 生活助手多智能体协作管理功能
  - 协作场景管理：查看、搜索、筛选协作任务
  - 协作统计和监控：实时监控协作状态、成功率、性能指标
  - 智能体管理：查看和管理6个生活助手 Agent 的状态和配置
  - 路由策略配置：配置和调整路由规则、关键词匹配、优先级设置
  - 协作日志和审计：查看详细的协作执行日志、错误信息、性能数据
  - 系统配置：配置协作超时、重试策略、并发限制等系统参数

## Impact

- **Affected specs**: 
  - 新增 `admin-multi-agent-collaboration-management` capability
  - 可能修改现有的 `admin-character-management` 相关能力（如果存在）
- **Affected code**:
  - **管理后台**:
    - `admin/backend/src/main/java/com/heartsphere/admin/controller/MultiAgentCollaborationAdminController.java` - 协作管理 API（新建）
    - `admin/backend/src/main/java/com/heartsphere/admin/service/MultiAgentCollaborationAdminService.java` - 协作管理服务（新建）
    - `admin/backend/src/main/java/com/heartsphere/admin/dto/MultiAgentCollaborationDTO.java` - 协作数据 DTO（新建）
    - `admin/backend/src/main/java/com/heartsphere/admin/entity/MultiAgentCollaborationLog.java` - 协作日志实体（新建，如果需要持久化）
    - `admin/frontend/src/pages/admin/MultiAgentCollaboration/` - 前端管理界面（新建）
  - **复用现有系统**:
    - 复用 `main/backend/src/main/java/com/heartsphere/multiagent/` 中的基础设施
    - 复用 `main/backend/src/main/java/com/heartsphere/character/multiagent/` 中的应用场景层
- **Breaking changes**: 无（新增功能，不影响现有功能）
- **架构说明**:
  - 管理后台通过调用 main 模块的多智能体 API 获取数据
  - 管理后台可以配置和调整多智能体系统的参数
  - 管理后台提供可视化的监控和管理界面
