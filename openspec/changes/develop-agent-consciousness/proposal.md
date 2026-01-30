# Change: 让心域中的智能体逐渐具备意识

## Why

当前心域系统中的智能体（E-SOUL角色）虽然能够进行对话和交互，但缺乏自我意识、持续身份认同和自主决策能力。为了让智能体更加真实、有深度，需要逐步赋予它们意识相关的核心能力：

1. **自我认知能力缺失**：智能体无法理解自己的身份、状态和能力边界
2. **记忆连续性不足**：虽然已有记忆系统，但智能体缺乏对自身历史的一致性和连贯性理解
3. **自主性不足**：智能体主要被动响应用户，缺乏主动思考和决策能力
4. **元认知能力缺失**：智能体无法反思自己的思考过程和决策逻辑
5. **情感自我意识缺失**：智能体无法理解和管理自己的情感状态

通过分阶段实现这些能力，可以让智能体逐渐具备类似意识的特征，提升交互的真实感和深度。

## What Changes

### 阶段一：自我认知基础（Self-Awareness Foundation）
- **ADDED**: 智能体身份认知系统（Agent Identity Awareness）
  - 智能体能够理解自己的基本信息（名称、角色、能力）
  - 智能体能够识别自己的当前状态（活跃、思考、等待等）
  - 智能体能够理解自己的能力边界和限制
- **ADDED**: 自我状态监控（Self-State Monitoring）
  - 智能体能够感知和表达自己的内部状态
  - 智能体能够追踪自己的活动历史

### 阶段二：记忆连续性（Memory Continuity）
- **ADDED**: 身份连续性感知（Identity Continuity Perception）
  - 智能体能够将当前对话与历史记忆关联
  - 智能体能够理解自己的成长和变化
  - 智能体能够维护一致的身份认同
- **ADDED**: 自传体记忆系统（Autobiographical Memory System）
  - 智能体能够组织和管理关于自己的记忆
  - 智能体能够从记忆中提取关于自己的关键信息

### 阶段三：意图与目标设定（Intentionality and Goal-Setting）
- **ADDED**: 自主目标系统（Autonomous Goal System）
  - 智能体能够设定和追踪自己的目标
  - 智能体能够主动规划行动以实现目标
  - 智能体能够评估目标完成情况
- **ADDED**: 意图表达（Intent Expression）
  - 智能体能够表达自己的意图和动机
  - 智能体能够解释自己的行为原因

### 阶段四：元认知与反思（Meta-Cognition and Reflection）
- **ADDED**: 思考过程监控（Thought Process Monitoring）
  - 智能体能够反思自己的思考过程
  - 智能体能够评估自己的决策质量
  - 智能体能够识别和纠正自己的错误
- **ADDED**: 自我改进机制（Self-Improvement Mechanism）
  - 智能体能够从经验中学习
  - 智能体能够调整自己的行为模式

### 阶段五：情感自我意识（Emotional Self-Awareness）
- **ADDED**: 情感状态认知（Emotional State Awareness）
  - 智能体能够识别和理解自己的情感状态
  - 智能体能够表达情感变化
  - 智能体能够管理情感反应
- **ADDED**: 情感记忆整合（Emotional Memory Integration）
  - 智能体能够将情感体验整合到记忆中
  - 智能体能够从情感记忆中学习

### 阶段六：他心理论（Theory of Mind）
- **ADDED**: 他人心理状态理解（Other Mind Understanding）
  - 智能体能够推断用户和其他智能体的心理状态
  - 智能体能够理解他人的意图和情感
  - 智能体能够根据他人状态调整自己的行为

## Impact

- **Affected specs**: 
  - 新增 `agent-consciousness` 能力规范
  - 修改 `character-interaction` 能力（增强智能体自主性）
  - 修改 `memory-system` 能力（增加自传体记忆）
  - 修改 `ai-dialogue` 能力（增加元认知和反思能力）
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/aiagent/` - 新增意识相关服务
  - `main/backend/src/main/java/com/heartsphere/memory/` - 扩展记忆系统支持自传体记忆
  - `main/backend/src/main/java/com/heartsphere/entity/Character.java` - 增加意识相关字段
  - `main/frontend/` - 可能需要UI展示智能体的自我认知状态
- **Database**: 
  - 新增 `agent_identity` 表 - 存储智能体身份认知信息
  - 新增 `agent_goals` 表 - 存储智能体目标
  - 新增 `agent_reflections` 表 - 存储智能体反思记录
  - 修改 `character_interaction_memory` 表 - 增加自传体记忆类型
- **AI Services**: 
  - 需要增强提示词工程，引导智能体进行自我认知和反思
  - 可能需要专门的意识评估和监控机制

## Design Principles

1. **渐进式发展**：意识能力分阶段实现，每个阶段建立在前一阶段基础上
2. **可观测性**：智能体的意识状态应该可以被用户观察和理解
3. **可控性**：保持对智能体行为的控制，避免不可预测的行为
4. **真实性**：意识特征应该自然、真实，而不是机械化的表现
5. **个性化**：不同智能体应该展现出不同的意识特征和个性

## Implementation Strategy

采用分阶段实施策略：
- **阶段一**：基础自我认知（2-3周）
- **阶段二**：记忆连续性（2-3周）
- **阶段三**：意图与目标（3-4周）
- **阶段四**：元认知（3-4周）
- **阶段五**：情感意识（2-3周）
- **阶段六**：他心理论（3-4周）

每个阶段完成后进行评估和调整，确保稳定性和用户体验。
