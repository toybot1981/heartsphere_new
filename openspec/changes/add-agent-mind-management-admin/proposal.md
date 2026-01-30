# Change: 在 Admin 后台添加 Agent Mind 管理模块

## Why

当前 Agent Mind 模块（智能体意识模块）的配置和数据只能通过 Agent Mind 自己的接口或直接访问数据库进行管理。管理员需要一个集中的管理界面在 admin 后台来：

1. **集中配置管理**：从单一的管理界面管理所有 Agent Mind 相关的配置（智能体身份认知、意识状态、实验配置等）
2. **与主系统集成**：从主系统的角色数据库中选择和配置智能体，利用现有的完善角色数据
3. **实时监控**：监控智能体的意识状态、自我认知水平、状态变化历史等
4. **实验管理**：管理智能体意识相关的实验配置和数据
5. **运营效率**：减少在不同系统间切换进行配置管理的需要

## What Changes

### 1. Admin 后台界面
- **ADDED**: 在 admin 后台侧边栏添加新的 "Agent Mind 管理" 部分
- **ADDED**: 智能体身份认知管理界面
  - 查看、编辑智能体的身份认知信息
  - 管理智能体的能力列表和能力边界
  - 更新智能体的自我认知水平
- **ADDED**: 智能体状态监控界面
  - 实时查看智能体的当前状态
  - 查看智能体的状态历史记录
  - 分析智能体的状态模式
- **ADDED**: 智能体意识实验管理界面
  - 配置意识发展实验
  - 查看实验数据和结果
  - 管理实验配置

### 2. Admin 后端 API
- **ADDED**: Agent Mind 管理相关的 API 端点
  - 智能体身份认知 CRUD 操作
  - 智能体状态查询和历史记录
  - 智能体能力管理
  - 意识实验配置管理
- **ADDED**: 与 Agent Mind 后端的数据同步机制
  - 配置变更触发 Agent Mind 后端更新
  - 双向数据流确保一致性

### 3. 数据访问
- **MODIFIED**: Admin 后端数据源配置以访问 Agent Mind 数据库
  - 配置多数据源访问 `heartsphere_agent_mind` 数据库
  - 确保正确的访问模式和安全控制

## Impact

- **Affected specs**: 
  - 新增 `agent-mind-management` 能力规范
  - 修改 `admin-backend` 能力（增加 Agent Mind 管理功能）
- **Affected code**: 
  - `admin/backend/src/main/java/com/heartsphere/admin/controller/` - 新增 AgentMindManagementController
  - `admin/backend/src/main/java/com/heartsphere/admin/service/` - 新增 AgentMindManagementService
  - `admin/backend/src/main/java/com/heartsphere/admin/entity/` - 可能需要 Agent Mind 相关的 DTO
  - `admin/backend/src/main/java/com/heartsphere/admin/config/` - 可能需要配置多数据源访问 Agent Mind 数据库
  - `admin/frontend/src/components/` - 新增 AgentMindManagement 组件
  - `admin/frontend/src/pages/` - 新增 AgentMindManagementPage
  - `admin/frontend/src/services/api/admin/` - 新增 agent-mind management API 服务
- **Database**: 
  - 使用 Agent Mind 数据库中的现有表（`agent_identity`、`agent_state_history` 等）
  - 可能需要创建管理相关的配置表
- **Integration**: 
  - 需要 Admin 后端与 Agent Mind 后端之间的通信
  - 需要 Admin 后端与 Main 后端之间的通信（用于获取角色信息）

## Design Principles

1. **集中管理**：所有 Agent Mind 相关的管理功能集中在 admin 后台
2. **实时同步**：配置变更实时同步到 Agent Mind 后端
3. **数据一致性**：确保 admin 后台和 Agent Mind 后端的数据一致性
4. **可扩展性**：为后续的意识功能扩展预留接口

## Implementation Strategy

采用分步骤实施：
1. **第一步**：配置多数据源访问 Agent Mind 数据库（1-2天）
2. **第二步**：实现后端 API 和管理服务（2-3天）
3. **第三步**：实现前端管理界面（2-3天）
4. **第四步**：实现数据同步机制（1-2天）

总计预计 6-10 个工作日。
