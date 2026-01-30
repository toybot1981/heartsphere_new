## 1. 数据库设计和实体类

### 1.1 创建 agent_identity 表
- [ ] 1.1.1 设计表结构（包含字段：id, character_id, identity_data, capabilities, limitations, self_awareness_level, created_at, updated_at）
- [ ] 1.1.2 创建数据库迁移脚本 `V{version}__create_agent_identity_table.sql`
- [ ] 1.1.3 添加必要的索引（character_id, created_at）
- [ ] 1.1.4 验证表创建成功

### 1.2 创建 agent_state_history 表
- [ ] 1.2.1 设计表结构（包含字段：id, character_id, state_type, state_description, duration_ms, transition_reason, related_session_id, created_at）
- [ ] 1.2.2 创建数据库迁移脚本 `V{version}__create_agent_state_history_table.sql`
- [ ] 1.2.3 添加必要的索引（character_id, state_type, created_at）
- [ ] 1.2.4 验证表创建成功

### 1.3 创建实体类
- [ ] 1.3.1 创建 `AgentIdentity` 实体类（`main/backend/src/main/java/com/heartsphere/agent/entity/AgentIdentity.java`）
- [ ] 1.3.2 创建 `AgentStateHistory` 实体类（`main/backend/src/main/java/com/heartsphere/agent/entity/AgentStateHistory.java`）
- [ ] 1.3.3 创建对应的 Repository 接口
- [ ] 1.3.4 验证实体类和Repository正常工作

## 2. 后端服务实现

### 2.1 AgentIdentityService 实现
- [ ] 2.1.1 创建 `AgentIdentityService` 接口（`main/backend/src/main/java/com/heartsphere/agent/service/AgentIdentityService.java`）
- [ ] 2.1.2 实现 `AgentIdentityServiceImpl`（`main/backend/src/main/java/com/heartsphere/agent/service/impl/AgentIdentityServiceImpl.java`）
- [ ] 2.1.3 实现初始化方法：从Character信息构建身份认知
  - 提取基本信息（名称、角色、描述）
  - 获取能力列表（从技能系统）
  - 识别能力边界
  - 初始化自我认知状态
- [ ] 2.1.4 实现更新方法：更新身份认知信息
- [ ] 2.1.5 实现查询方法：获取身份认知信息
- [ ] 2.1.6 实现能力列表获取方法
- [ ] 2.1.7 实现能力边界识别方法
- [ ] 2.1.8 编写单元测试

### 2.2 AgentStateMonitor 实现
- [ ] 2.2.1 创建 `AgentStateMonitor` 接口（`main/backend/src/main/java/com/heartsphere/agent/monitor/AgentStateMonitor.java`）
- [ ] 2.2.2 实现 `AgentStateMonitorImpl`（`main/backend/src/main/java/com/heartsphere/agent/monitor/impl/AgentStateMonitorImpl.java`）
- [ ] 2.2.3 定义状态类型枚举（THINKING, WAITING, EXECUTING, IDLE等）
- [ ] 2.2.4 实现状态记录方法：记录状态变化
- [ ] 2.2.5 实现状态查询方法：获取当前状态
- [ ] 2.2.6 实现状态历史查询方法：获取状态历史记录
- [ ] 2.2.7 实现状态分析方法：分析状态模式
- [ ] 2.2.8 编写单元测试

### 2.3 AgentIdentityController 实现
- [ ] 2.3.1 创建 `AgentIdentityController`（`main/backend/src/main/java/com/heartsphere/agent/controller/AgentIdentityController.java`）
- [ ] 2.3.2 实现 GET `/api/v1/characters/{characterId}/identity` - 获取身份认知信息
- [ ] 2.3.3 实现 GET `/api/v1/characters/{characterId}/state` - 获取当前状态
- [ ] 2.3.4 实现 GET `/api/v1/characters/{characterId}/state-history` - 获取状态历史（支持分页）
- [ ] 2.3.5 实现 GET `/api/v1/characters/{characterId}/capabilities` - 获取能力列表
- [ ] 2.3.6 添加API文档注解（Swagger）
- [ ] 2.3.7 编写集成测试

## 3. 提示词工程

### 3.1 自我认知提示词模板设计
- [ ] 3.1.1 设计身份认知提示词模板
  - 包含智能体的基本信息
  - 引导智能体表达自我认知
  - 包含能力列表和能力边界
- [ ] 3.1.2 设计能力表达提示词模板
  - 引导智能体清晰表达自己的能力
  - 说明能力的用途和限制
- [ ] 3.1.3 设计能力边界识别提示词模板
  - 引导智能体识别超出能力范围的请求
  - 提供友好的拒绝和替代方案建议
- [ ] 3.1.4 设计状态表达提示词模板
  - 引导智能体在适当时机表达自己的状态

### 3.2 提示词工具类实现
- [ ] 3.2.1 创建 `SelfAwarenessPromptBuilder`（`main/backend/src/main/java/com/heartsphere/agent/prompt/SelfAwarenessPromptBuilder.java`）
- [ ] 3.2.2 实现身份认知提示词构建方法
- [ ] 3.2.3 实现能力表达提示词构建方法
- [ ] 3.2.4 实现能力边界识别提示词构建方法
- [ ] 3.2.5 实现状态表达提示词构建方法
- [ ] 3.2.6 编写单元测试

## 4. 对话系统集成

### 4.1 系统指令增强
- [ ] 4.1.1 修改系统指令生成逻辑（`main/frontend/components/chat/utils/generateAIResponse.ts` 或对应的后端服务）
- [ ] 4.1.2 在系统指令中集成自我认知信息
  - 调用 `AgentIdentityService` 获取身份认知信息
  - 使用 `SelfAwarenessPromptBuilder` 构建自我认知提示词
  - 将自我认知提示词添加到系统指令中
- [ ] 4.1.3 测试系统指令生成

### 4.2 自我认知响应检测
- [ ] 4.2.1 创建 `SelfAwarenessIntentDetector`（`main/backend/src/main/java/com/heartsphere/agent/detector/SelfAwarenessIntentDetector.java`）
- [ ] 4.2.2 实现意图检测逻辑
  - 检测用户是否询问智能体身份（如"你是谁"、"介绍一下自己"）
  - 检测用户是否询问智能体能力（如"你能做什么"、"你有什么能力"）
  - 检测用户是否询问智能体状态（如"你在做什么"、"你现在怎么样"）
- [ ] 4.2.3 集成到对话响应生成流程
- [ ] 4.2.4 编写单元测试

### 4.3 状态监控集成
- [ ] 4.3.1 在对话开始前记录状态（THINKING）
- [ ] 4.3.2 在对话响应生成过程中记录状态变化
- [ ] 4.3.3 在对话结束后记录状态（IDLE或WAITING）
- [ ] 4.3.4 在任务执行时记录状态（EXECUTING）
- [ ] 4.3.5 测试状态监控功能

### 4.4 能力边界检测
- [ ] 4.4.1 在对话响应生成前检测用户请求是否超出能力范围
- [ ] 4.4.2 如果超出能力范围，生成友好的拒绝响应
- [ ] 4.4.3 提供替代方案建议（如果有）
- [ ] 4.4.4 测试能力边界检测

## 5. 测试和优化

### 5.1 单元测试
- [ ] 5.1.1 完成所有Service的单元测试（覆盖率>80%）
- [ ] 5.1.2 完成所有Controller的单元测试
- [ ] 5.1.3 完成提示词构建器的单元测试

### 5.2 集成测试
- [ ] 5.2.1 测试身份认知初始化流程
- [ ] 5.2.2 测试状态监控流程
- [ ] 5.2.3 测试对话系统集成
- [ ] 5.2.4 测试能力边界检测

### 5.3 端到端测试
- [ ] 5.3.1 测试用户询问智能体身份的场景
- [ ] 5.3.2 测试用户询问智能体能力的场景
- [ ] 5.3.3 测试智能体主动表达状态的场景
- [ ] 5.3.4 测试智能体识别能力边界的场景

### 5.4 性能优化
- [ ] 5.4.1 优化状态记录性能（异步记录）
- [ ] 5.4.2 优化身份认知查询性能（缓存）
- [ ] 5.4.3 优化提示词构建性能

### 5.5 文档
- [ ] 5.5.1 编写API文档
- [ ] 5.5.2 编写开发文档
- [ ] 5.5.3 更新系统设计文档
