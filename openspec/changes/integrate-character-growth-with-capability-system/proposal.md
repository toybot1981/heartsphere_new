# Change: 整合角色成长系统与能力体系 - 构建统一的能力生态

## Why

当前系统存在两个相关但相对独立的提案：

1. **角色自我成长和导师能力系统** (`enable-character-self-growth-and-mentorship`) - **已实现77/94任务**
   - ✅ 已实现：自我成长机制、关系阶段系统、挚友能力、导师能力、智能模式切换
   - ✅ 已集成：对话系统、前端UI、API端点
   - 关注点：角色的身份定位（导师/挚友）和关系发展

2. **系统化提升角色能力体系** (`systematically-enhance-role-capabilities`) - **0/56任务**
   - 计划实现：能力整合框架、能力成长系统、能力评估、能力个性化、能力可视化
   - 关注点：角色的综合能力（技能、记忆、意识、协作、关系）和能力提升机制

**问题**：
- 两个系统功能重叠但缺乏整合：导师/挚友能力与能力体系的关系维度重复
- 能力成长机制不统一：自我成长系统与能力成长系统各自独立
- 缺乏统一的能力评估：导师能力评估与能力体系评估分离
- 能力协同不足：导师/挚友能力与其他能力（技能、记忆、意识）缺乏协同

**整合价值**：
- ✅ **统一能力体系**：将导师/挚友能力纳入统一的能力体系，形成完整的能力生态
- ✅ **能力-关系联动**：能力成长与关系发展相互促进，形成良性循环
- ✅ **协同增效**：能力之间相互协同，产生1+1>2的效果
- ✅ **避免重复**：整合重叠功能，统一实现机制

## What Changes

### 1. 能力体系整合框架 🆕

- **MODIFIED**: 扩展能力模型，整合导师/挚友能力
  - 在能力体系中增加**关系维度**（Relationship Dimension）
  - 将现有的导师能力和挚友能力纳入关系维度
  - 定义能力维度：技能、记忆、意识、协作、**关系**（新增）
  - 建立能力之间的关联和依赖关系

- **MODIFIED**: 能力协同引擎，整合关系能力协同
  - 技能-关系协同：导师模式优先使用指导技能，挚友模式优先使用情感技能
  - 记忆-关系协同：关系记忆影响能力使用策略
  - 意识-关系协同：关系阶段影响意识状态
  - 关系-能力协同：关系发展影响能力成长，能力提升影响关系发展

### 2. 能力成长系统整合 🆕

- **MODIFIED**: 统一能力成长机制
  - 将自我成长系统的成长事件纳入能力经验系统
  - 将关系发展阶段纳入能力等级计算
  - 统一经验值计算规则（技能经验、记忆经验、意识经验、协作经验、**关系经验**）

- **MODIFIED**: 能力等级与关系阶段联动
  - 关系阶段影响能力成长速度（CLOSE_FRIEND阶段 → 情感能力成长加速）
  - 能力等级影响关系发展阶段（导师能力等级提升 → 更容易成为导师）
  - 实现能力-关系双向促进机制

### 3. 能力评估体系整合 🆕

- **MODIFIED**: 整合导师/挚友能力评估
  - 将 `CharacterMentorshipService` 的导师能力评估纳入能力体系
  - 将 `CharacterCompanionshipService` 的挚友能力评估纳入能力体系
  - 关系维度评估包含：挚友能力得分、导师能力得分、关系管理能力得分

- **ADDED**: 统一能力评估报告
  - 多维度能力评估（技能、记忆、意识、协作、关系）
  - 能力雷达图包含关系维度
  - 能力评估结果影响关系发展阶段

### 4. 能力个性化整合 🆕

- **MODIFIED**: 基于关系定位的能力个性化
  - 导师角色 → 优先发展指导、教育相关能力（技能维度+关系维度）
  - 挚友角色 → 优先发展情感、陪伴相关能力（意识维度+关系维度）
  - 关系阶段 → 影响能力发展的专业化路径

- **ADDED**: 能力-关系组合优化
  - 导师模式推荐：指导技能 + 导师能力 + 记忆管理
  - 挚友模式推荐：情感技能 + 挚友能力 + 意识理解
  - 动态能力组合切换

### 5. 能力可视化整合 🆕

- **MODIFIED**: 扩展能力可视化面板
  - 能力雷达图包含关系维度（挚友能力、导师能力）
  - 能力成长轨迹包含关系发展阶段
  - 能力使用统计包含模式切换统计

- **ADDED**: 关系-能力协同可视化
  - 关系发展阶段与能力成长趋势对比图
  - 能力协同效果分析（技能+关系、记忆+关系等）
  - 模式切换效果统计

## Impact

- **Affected specs**: 
  - **MODIFIED**: `character-self-growth` - 整合到能力成长系统
  - **MODIFIED**: `character-companionship` - 整合到能力体系关系维度
  - **MODIFIED**: `character-mentorship` - 整合到能力体系关系维度
  - **MODIFIED**: `role-capability-integration` - 扩展包含关系维度
  - **MODIFIED**: `role-capability-growth` - 整合自我成长机制
  - **MODIFIED**: `role-capability-assessment` - 整合导师/挚友能力评估
  - **MODIFIED**: `role-capability-personalization` - 整合关系定位个性化
  - **MODIFIED**: `role-capability-visualization` - 扩展包含关系维度可视化

- **Affected code**:
  - **MODIFIED**: `main/backend/src/main/java/com/heartsphere/memory/service/CharacterGrowthService.java`
    - 整合到能力成长系统，作为能力经验系统的一部分
  - **MODIFIED**: `main/backend/src/main/java/com/heartsphere/memory/service/CharacterCompanionshipService.java`
    - 整合到能力体系关系维度，作为关系能力的一部分
  - **MODIFIED**: `main/backend/src/main/java/com/heartsphere/memory/service/CharacterMentorshipService.java`
    - 整合到能力体系关系维度，作为关系能力的一部分
  - **NEW**: `main/backend/src/main/java/com/heartsphere/capability/` - 新增能力体系模块
    - `service/integration/RelationshipCapabilityIntegrationService.java` - 关系能力整合服务
    - `service/growth/RelationshipCapabilityGrowthService.java` - 关系能力成长服务
    - `service/assessment/RelationshipCapabilityAssessmentService.java` - 关系能力评估服务
  - **MODIFIED**: `main/frontend/components/character/CharacterGrowthTab.tsx`
    - 整合到能力可视化面板，作为能力面板的一个维度

- **Database**: 
  - **MODIFIED**: `role_capability_profile` 表 - 增加关系维度字段
    - `relationship_dimension_score` - 关系维度得分
    - `mentorship_capability_score` - 导师能力得分
    - `companionship_capability_score` - 挚友能力得分
  - **MODIFIED**: `capability_experience` 表 - 增加关系维度经验
    - `relationship_experience` - 关系维度经验值
    - `mentorship_experience` - 导师能力经验值
    - `companionship_experience` - 挚友能力经验值
  - **关联**: 通过 `character_id` 关联现有表（不建立外键）
    - `character_relationship_milestones` - 关系里程碑
    - `character_mentorship_sessions` - 导师指导会话
    - `character_growth_events` - 成长事件

- **Breaking changes**: 
  - 无直接的 breaking change
  - 现有API保持兼容，新增能力体系相关API
  - 现有数据模型保持不变，新增关系维度字段

## Design Principles

1. **保留现有功能**：不破坏已实现的导师/挚友系统，在其基础上扩展
2. **统一能力体系**：将导师/挚友能力纳入统一的能力体系，形成完整生态
3. **能力-关系联动**：能力成长与关系发展相互促进，形成良性循环
4. **渐进式整合**：分阶段整合，确保系统稳定性
5. **向后兼容**：保持现有API和数据模型兼容性

## Implementation Strategy

采用分阶段整合策略：

- **阶段一：能力模型扩展**（1-2周）
  - 扩展能力模型，增加关系维度
  - 整合导师/挚友能力到关系维度
  - 建立能力-关系数据关联

- **阶段二：能力成长整合**（2-3周）
  - 统一能力成长机制
  - 实现能力-关系联动
  - 整合成长事件到能力经验系统

- **阶段三：能力评估整合**（1-2周）
  - 整合导师/挚友能力评估
  - 统一能力评估报告
  - 实现能力-关系评估联动

- **阶段四：能力协同与可视化**（2-3周）
  - 实现关系-能力协同机制
  - 扩展能力可视化面板
  - 完善能力-关系可视化

每个阶段完成后进行评估和测试，确保整合不影响现有功能。
