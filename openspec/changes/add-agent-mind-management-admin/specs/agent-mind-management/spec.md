## ADDED Requirements

### Requirement: Admin 后台多数据源配置
Admin 后端 SHALL 能够访问 Agent Mind 数据库，支持多数据源配置。

#### Scenario: 配置 Agent Mind 数据源
- **WHEN** Admin 后端需要访问 Agent Mind 数据库时
- **THEN** 系统配置多数据源，包括主数据源（heartsphere）和 Agent Mind 数据源（heartsphere_agent_mind）
- **AND** 每个数据源有独立的 EntityManager 和 TransactionManager
- **AND** Repository 可以指定使用哪个数据源

#### Scenario: 数据源连接测试
- **WHEN** Admin 后端启动时
- **THEN** 系统验证 Agent Mind 数据源连接正常
- **AND** 如果连接失败，系统记录错误但不影响主数据源的使用

### Requirement: 智能体身份认知管理
Admin 后台 SHALL 能够查看和管理智能体的身份认知信息。

#### Scenario: 查看智能体身份认知列表
- **WHEN** 管理员访问 Agent Mind 管理页面
- **THEN** 系统显示所有智能体的身份认知列表
- **AND** 列表包含智能体ID、名称、角色、自我认知水平等信息
- **AND** 支持分页和搜索

#### Scenario: 查看单个智能体身份认知详情
- **WHEN** 管理员点击某个智能体的身份认知
- **THEN** 系统显示该智能体的完整身份认知信息
- **AND** 包括基本信息、能力列表、能力边界、自我认知水平等

#### Scenario: 更新智能体身份认知
- **WHEN** 管理员编辑智能体的身份认知信息
- **THEN** 系统允许更新身份认知数据、能力列表、能力边界等
- **AND** 更新后同步到 Agent Mind 后端
- **AND** 系统记录更新历史

#### Scenario: 从 Main 模块选择智能体
- **WHEN** 管理员需要为 Agent Mind 配置智能体时
- **THEN** 系统可以从 Main 模块的角色数据库中选择智能体
- **AND** 系统自动初始化选中智能体的身份认知信息

### Requirement: 智能体状态监控
Admin 后台 SHALL 能够监控智能体的意识状态和历史记录。

#### Scenario: 查看智能体当前状态
- **WHEN** 管理员查看智能体的状态信息
- **THEN** 系统显示智能体的当前状态（思考中、等待中、执行中等）
- **AND** 系统显示状态开始时间和持续时间
- **AND** 系统显示状态描述和转换原因

#### Scenario: 查看智能体状态历史
- **WHEN** 管理员查看智能体的状态历史
- **THEN** 系统显示状态历史记录列表（支持分页）
- **AND** 系统按时间倒序排列状态记录
- **AND** 系统显示每个状态的类型、持续时间、转换原因等信息

#### Scenario: 状态模式分析
- **WHEN** 管理员查看智能体的状态分析
- **THEN** 系统统计各状态类型的出现频率
- **AND** 系统计算平均持续时间
- **AND** 系统识别状态转换模式
- **AND** 系统生成状态分析报告（可选）

#### Scenario: 状态可视化
- **WHEN** 管理员查看智能体的状态数据
- **THEN** 系统提供状态历史的时间线可视化
- **AND** 系统提供状态分布图表
- **AND** 系统提供状态转换关系图（可选）

### Requirement: 智能体能力管理
Admin 后台 SHALL 能够管理智能体的能力列表和能力边界。

#### Scenario: 查看智能体能力列表
- **WHEN** 管理员查看智能体的能力信息
- **THEN** 系统显示智能体的完整能力列表
- **AND** 能力列表包含技能ID、技能名称、技能描述、技能类型等信息
- **AND** 能力列表按类别或重要性排序

#### Scenario: 更新智能体能力列表
- **WHEN** 管理员更新智能体的能力列表
- **THEN** 系统允许添加、删除或修改能力
- **AND** 系统可以从 Main 模块的技能系统同步能力
- **AND** 更新后同步到 Agent Mind 后端

#### Scenario: 配置能力边界
- **WHEN** 管理员配置智能体的能力边界
- **THEN** 系统允许设置智能体不能做的事情
- **AND** 系统允许设置限制说明
- **AND** 系统自动基于能力列表识别能力边界（可选）

### Requirement: 意识实验管理
Admin 后台 SHALL 能够管理智能体意识相关的实验配置和数据。

#### Scenario: 创建意识实验
- **WHEN** 管理员创建新的意识实验
- **THEN** 系统允许配置实验参数（实验类型、目标智能体、实验时长等）
- **AND** 系统保存实验配置
- **AND** 系统启动实验并记录实验数据

#### Scenario: 查看实验列表
- **WHEN** 管理员查看意识实验列表
- **THEN** 系统显示所有实验的列表
- **AND** 列表包含实验ID、实验类型、目标智能体、状态、创建时间等信息
- **AND** 支持按状态、类型等筛选

#### Scenario: 查看实验详情
- **WHEN** 管理员查看实验详情
- **THEN** 系统显示实验的完整配置和数据
- **AND** 系统显示实验进度和结果
- **AND** 系统提供实验数据的可视化（可选）

#### Scenario: 管理实验配置
- **WHEN** 管理员管理实验配置
- **THEN** 系统允许编辑、启用、禁用实验配置
- **AND** 系统允许删除实验配置
- **AND** 系统记录配置变更历史

### Requirement: 数据同步机制
Admin 后台的配置变更 SHALL 能够同步到 Agent Mind 后端。

#### Scenario: 配置变更同步
- **WHEN** 管理员在 Admin 后台更新智能体配置
- **THEN** 系统自动同步配置变更到 Agent Mind 后端
- **AND** 同步成功后更新 Agent Mind 数据库
- **AND** 系统记录同步状态和结果

#### Scenario: 同步错误处理
- **WHEN** 配置同步失败时
- **THEN** 系统记录错误信息
- **AND** 系统提供重试机制
- **AND** 系统通知管理员同步失败

#### Scenario: 同步状态查询
- **WHEN** 管理员查询同步状态
- **THEN** 系统显示最近的同步记录
- **AND** 系统显示同步成功率和错误统计
- **AND** 系统提供同步日志查看

### Requirement: Admin 后台界面集成
Agent Mind 管理功能 SHALL 集成到 Admin 后台界面中。

#### Scenario: 侧边栏菜单
- **WHEN** 管理员访问 Admin 后台
- **THEN** 系统在侧边栏显示 "Agent Mind 管理" 菜单项
- **AND** 菜单项链接到 Agent Mind 管理页面
- **AND** 菜单项有适当的图标和样式

#### Scenario: 管理页面布局
- **WHEN** 管理员访问 Agent Mind 管理页面
- **THEN** 系统显示管理页面的主界面
- **AND** 页面包含多个管理子模块（身份认知、状态监控、能力管理、实验管理）
- **AND** 页面使用标签页或侧边导航组织子模块

#### Scenario: 权限控制
- **WHEN** 管理员访问 Agent Mind 管理功能
- **THEN** 系统验证管理员权限
- **AND** 只有有权限的管理员才能访问管理功能
- **AND** 系统记录访问日志

### Requirement: API 端点
Admin 后端 SHALL 提供 Agent Mind 管理相关的 REST API 端点。

#### Scenario: 身份认知管理 API
- **WHEN** 前端调用身份认知管理 API
- **THEN** 系统提供以下端点：
  - GET `/api/admin/agent-mind/identities` - 获取身份认知列表
  - GET `/api/admin/agent-mind/identities/{characterId}` - 获取单个身份认知
  - PUT `/api/admin/agent-mind/identities/{characterId}` - 更新身份认知
  - POST `/api/admin/agent-mind/identities/{characterId}/init` - 初始化身份认知

#### Scenario: 状态监控 API
- **WHEN** 前端调用状态监控 API
- **THEN** 系统提供以下端点：
  - GET `/api/admin/agent-mind/states/{characterId}` - 获取当前状态
  - GET `/api/admin/agent-mind/states/{characterId}/history` - 获取状态历史
  - GET `/api/admin/agent-mind/states/{characterId}/analysis` - 获取状态分析

#### Scenario: 能力管理 API
- **WHEN** 前端调用能力管理 API
- **THEN** 系统提供以下端点：
  - GET `/api/admin/agent-mind/capabilities/{characterId}` - 获取能力列表
  - PUT `/api/admin/agent-mind/capabilities/{characterId}` - 更新能力列表
  - POST `/api/admin/agent-mind/capabilities/{characterId}/sync` - 从 Main 模块同步能力

#### Scenario: API 认证和授权
- **WHEN** 客户端调用 API 接口时
- **THEN** 系统验证管理员身份和权限
- **AND** 系统确保只有有权限的管理员才能访问
- **AND** 系统返回适当的错误信息（如果认证或授权失败）
