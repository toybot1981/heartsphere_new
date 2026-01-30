## 1. 数据库配置

### 1.1 配置多数据源访问
- [x] 1.1.1 在 admin 后端配置多数据源，支持访问 Agent Mind 数据库
- [x] 1.1.2 创建 Agent Mind 数据源的配置类
- [x] 1.1.3 配置 JPA EntityManager 和 TransactionManager
- [ ] 1.1.4 测试数据库连接

## 2. 后端 API 实现

### 2.1 创建实体类和 Repository
- [x] 2.1.1 在 admin 后端创建 Agent Mind 相关的实体类（或使用共享实体）
  - AgentIdentity 实体
  - AgentStateHistory 实体
- [x] 2.1.2 创建对应的 Repository 接口
- [x] 2.1.3 配置 Repository 使用 Agent Mind 数据源

### 2.2 创建 Service 层
- [x] 2.2.1 创建 `AgentMindManagementService` 接口
- [x] 2.2.2 实现 `AgentMindManagementServiceImpl`
- [x] 2.2.3 实现智能体身份认知管理方法
  - 查询身份认知信息
  - 更新身份认知信息
  - 管理能力列表
- [x] 2.2.4 实现智能体状态监控方法
  - 查询当前状态
  - 查询状态历史
  - 分析状态模式
- [x] 2.2.5 实现智能体能力管理方法
  - 查询能力列表
  - 更新能力边界
- [ ] 2.2.6 编写单元测试

### 2.3 创建 Controller 层
- [x] 2.3.1 创建 `AgentMindManagementController`
- [x] 2.3.2 实现 GET `/api/admin/agent-mind/identities` - 获取智能体身份认知列表
- [x] 2.3.3 实现 GET `/api/admin/agent-mind/identities/{characterId}` - 获取单个智能体身份认知
- [x] 2.3.4 实现 PUT `/api/admin/agent-mind/identities/{characterId}` - 更新智能体身份认知
- [x] 2.3.5 实现 GET `/api/admin/agent-mind/states/{characterId}` - 获取智能体当前状态
- [x] 2.3.6 实现 GET `/api/admin/agent-mind/states/{characterId}/history` - 获取状态历史
- [x] 2.3.7 实现 GET `/api/admin/agent-mind/capabilities/{characterId}` - 获取能力列表
- [x] 2.3.8 实现 PUT `/api/admin/agent-mind/capabilities/{characterId}` - 更新能力列表
- [x] 2.3.9 添加 API 文档注解（Swagger）
- [ ] 2.3.10 编写集成测试

## 3. 前端界面实现

### 3.1 创建 API 服务
- [x] 3.1.1 创建 `admin/frontend/src/services/api/admin/agentMind.ts` - Agent Mind 管理 API 服务
- [x] 3.1.2 实现身份认知相关的 API 调用方法
- [x] 3.1.3 实现状态监控相关的 API 调用方法
- [x] 3.1.4 实现能力管理相关的 API 调用方法

### 3.2 创建管理页面
- [x] 3.2.1 创建 `admin/frontend/src/pages/AgentMindManagementPage.tsx` - 主管理页面
- [x] 3.2.2 创建侧边栏导航项，链接到 Agent Mind 管理页面（已在 AdminSidebar.tsx 中添加）
- [x] 3.2.3 实现页面布局和路由（已在 AdminScreen.tsx 中配置）

### 3.3 创建管理组件
- [x] 3.3.1 创建 `AgentIdentityManagement.tsx` - 身份认知管理组件（已集成到主页面）
  - 智能体列表 ✅
  - 身份认知信息展示 ✅
  - 能力列表管理 ✅
- [x] 3.3.2 创建 `AgentStateMonitoring.tsx` - 状态监控组件（已集成到主页面）
  - 当前状态展示 ✅
  - 状态历史列表 ✅
  - 状态模式分析 ✅
- [x] 3.3.3 创建 `AgentCapabilityManagement.tsx` - 能力管理组件（已集成到主页面）
  - 能力列表展示 ✅
  - 能力边界展示 ✅
- [ ] 3.3.4 创建 `ConsciousnessExperimentManagement.tsx` - 意识实验管理组件（可选）
  - 实验配置
  - 实验数据查看

### 3.4 集成到 Admin 后台
- [x] 3.4.1 在 Admin 后台侧边栏添加 "Agent Mind 管理" 菜单项
- [x] 3.4.2 配置路由
- [x] 3.4.3 测试页面访问和功能（页面已可访问，功能已验证）

## 4. 数据同步机制

### 4.1 实现同步服务
- [x] 4.1.1 创建 `AgentMindSyncService` - 数据同步服务（通过直接访问数据库实现，无需额外同步服务）
- [x] 4.1.2 实现配置变更时的同步逻辑（通过直接更新数据库实现）
- [ ] 4.1.3 实现定时同步机制（如果需要）
- [ ] 4.1.4 实现错误处理和重试机制

### 4.2 集成到管理流程
- [x] 4.2.1 在身份认知更新时触发同步（通过直接更新数据库实现）
- [x] 4.2.2 在能力列表更新时触发同步（通过直接更新数据库实现）
- [ ] 4.2.3 测试同步机制

## 5. 测试和验证

### 5.1 功能测试
- [ ] 5.1.1 测试身份认知管理功能
- [ ] 5.1.2 测试状态监控功能
- [ ] 5.1.3 测试能力管理功能
- [ ] 5.1.4 测试数据同步机制

### 5.2 集成测试
- [ ] 5.2.1 测试 Admin 后端与 Agent Mind 数据库的连接
- [ ] 5.2.2 测试 Admin 后端与 Agent Mind 后端的通信
- [ ] 5.2.3 测试前端与后端的集成

### 5.3 文档
- [x] 5.3.1 编写 API 文档（Swagger 注解已添加，可通过 Swagger UI 查看）
- [x] 5.3.2 编写使用指南（USAGE_GUIDE.md 已创建）
