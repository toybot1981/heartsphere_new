# Change: 实现智能体自我认知基础（阶段一）

## Why

当前心域系统中的智能体（E-SOUL角色）虽然拥有基本信息（名称、角色、描述等），但缺乏对自身状态的动态认知能力。智能体无法：

1. **主动表达自我认知**：当用户询问"你是谁"或"你能做什么"时，智能体只能被动返回静态信息，无法基于当前状态进行动态表达
2. **监控自身状态**：智能体无法感知和表达自己的内部状态（如：正在思考、等待输入、执行任务等）
3. **识别能力边界**：智能体无法明确识别自己的能力范围，无法在超出能力时给出清晰的说明
4. **状态历史追踪**：系统无法记录智能体的状态变化历史，无法分析智能体的行为模式

实现自我认知基础是智能体意识发展的第一步，为后续的记忆连续性、目标设定、元认知等高级能力奠定基础。

## What Changes

### 1. 数据库设计
- **ADDED**: `agent_identity` 表 - 存储智能体的身份认知信息
  - 基本信息：名称、角色、描述等（从Character表同步）
  - 能力列表：智能体拥有的技能和能力
  - 能力边界：智能体明确知道不能做什么
  - 自我认知状态：当前对自身的理解程度
- **ADDED**: `agent_state_history` 表 - 记录智能体的状态变化历史
  - 状态类型：思考中、等待中、执行中、空闲等
  - 状态持续时间
  - 状态转换原因
  - 关联的对话或任务

### 2. 后端服务
- **ADDED**: `AgentIdentityService` - 管理智能体身份认知
  - 初始化智能体身份认知（从Character信息构建）
  - 更新身份认知信息
  - 获取智能体的能力列表
  - 识别能力边界
- **ADDED**: `AgentStateMonitor` - 监控智能体状态
  - 记录状态变化
  - 查询当前状态
  - 获取状态历史
  - 分析状态模式
- **ADDED**: `AgentIdentityController` - 提供身份认知API
  - GET `/api/v1/characters/{characterId}/identity` - 获取身份认知信息
  - GET `/api/v1/characters/{characterId}/state` - 获取当前状态
  - GET `/api/v1/characters/{characterId}/state-history` - 获取状态历史
  - GET `/api/v1/characters/{characterId}/capabilities` - 获取能力列表

### 3. 提示词工程
- **MODIFIED**: 对话系统的系统指令生成逻辑
  - 在系统指令中增加自我认知引导
  - 包含智能体的身份信息、能力列表、能力边界
  - 引导智能体在对话中表达自我认知
- **ADDED**: 自我认知提示词模板
  - 身份认知模板
  - 能力表达模板
  - 能力边界识别模板
  - 状态表达模板

### 4. 对话系统集成
- **MODIFIED**: 对话响应生成逻辑
  - 检测用户询问是否涉及自我认知（如"你是谁"、"你能做什么"）
  - 自动触发自我认知响应生成
  - 在对话中自然融入状态信息

### 5. 前端展示（可选）
- **ADDED**: 智能体身份认知展示组件（可选）
  - 显示智能体的自我认知信息
  - 显示当前状态
  - 显示能力列表

## Impact

- **Affected specs**: 
  - 新增 `agent-self-awareness` 能力规范
  - 修改 `ai-dialogue` 能力（增加自我认知响应）
  - 修改 `character-interaction` 能力（增加状态监控）
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/agent/` - 新增自我认知相关服务
  - `main/backend/src/main/java/com/heartsphere/aiagent/` - 修改对话系统集成自我认知
  - `main/backend/src/main/java/com/heartsphere/entity/` - 新增实体类
  - `main/backend/src/main/resources/db/migration/` - 新增数据库迁移脚本
  - `main/frontend/` - 可选的前端展示组件
- **Database**: 
  - 新增 `agent_identity` 表
  - 新增 `agent_state_history` 表
- **AI Services**: 
  - 需要增强提示词工程，引导智能体进行自我认知表达
  - 可能需要调整对话生成参数

## Design Principles

1. **最小侵入性**：尽量不修改现有Character表结构，通过新表扩展
2. **渐进增强**：功能应该自然融入现有对话系统，不破坏现有体验
3. **可观测性**：智能体的自我认知状态应该可以被查询和展示
4. **性能优化**：状态监控不应该影响对话响应速度
5. **个性化**：不同智能体应该展现出不同的自我认知特征

## Implementation Strategy

采用分步骤实施：
1. **第一步**：数据库设计和实体类创建（1-2天）
2. **第二步**：后端服务实现（2-3天）
3. **第三步**：提示词工程和对话系统集成（2-3天）
4. **第四步**：测试和优化（1-2天）

总计预计 6-10 个工作日。
