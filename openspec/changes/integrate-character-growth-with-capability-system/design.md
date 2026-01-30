# Design: 整合角色成长系统与能力体系

## Context

### 现有系统状态

#### 1. 角色自我成长和导师能力系统（已实现）

**实现状态**：77/94 任务已完成

**已实现功能**：
- ✅ 自我成长系统：`CharacterGrowthService` - 学习检测、自我反思、能力提升
- ✅ 关系阶段系统：`RelationshipDepthCalculator` - STRANGER → FRIEND → CLOSE_FRIEND → MENTOR
- ✅ 挚友能力系统：`CharacterCompanionshipService` - 情感连接、陪伴支持、记忆共鸣
- ✅ 导师能力系统：`CharacterMentorshipService` - 主动指导、个性化教育、成长规划
- ✅ 智能模式切换：`CharacterModeSwitchService` - 挚友模式/导师模式自动切换
- ✅ 前端UI：`CharacterGrowthTab` - 成长轨迹、关系发展、导师能力展示
- ✅ API端点：12个REST API端点

**数据模型**：
- `character_growth_events` - 成长事件表
- `character_relationship_milestones` - 关系里程碑表
- `character_mentorship_sessions` - 导师指导会话表
- `characters` 表扩展字段：`relationship_stage`, `growth_trajectory`, `self_reflection_history`, `mentorship_capabilities`

#### 2. 系统化提升角色能力体系（计划实现）

**实现状态**：0/56 任务

**计划功能**：
- 能力整合框架：整合技能、记忆、意识、协作能力
- 能力成长系统：经验值、等级、专业化
- 能力评估体系：多维度评估、优化建议
- 能力个性化：基于使用模式的能力特征
- 能力可视化：雷达图、成长轨迹、使用统计

**设计文档**：
- `MODULE_ARCHITECTURE.md` - 模块架构设计（独立模块 `com.heartsphere.capability`）
- `RELATIONSHIP_WITH_MENTORSHIP.md` - 与导师/挚友系统的关系说明

### 整合需求

**问题**：
1. **功能重叠**：导师/挚友能力与能力体系的关系维度重复
2. **机制不统一**：自我成长系统与能力成长系统各自独立
3. **评估分离**：导师能力评估与能力体系评估分离
4. **协同不足**：导师/挚友能力与其他能力缺乏协同

**整合目标**：
1. **统一能力体系**：将导师/挚友能力纳入统一的能力体系
2. **能力-关系联动**：能力成长与关系发展相互促进
3. **协同增效**：能力之间相互协同，产生1+1>2的效果
4. **避免重复**：整合重叠功能，统一实现机制

## Goals / Non-Goals

### Goals

1. **保留现有功能**：不破坏已实现的导师/挚友系统，在其基础上扩展
2. **统一能力体系**：将导师/挚友能力纳入统一的能力体系，形成完整生态
3. **能力-关系联动**：能力成长与关系发展相互促进，形成良性循环
4. **渐进式整合**：分阶段整合，确保系统稳定性
5. **向后兼容**：保持现有API和数据模型兼容性

### Non-Goals

1. **不重构现有系统**：不重构已实现的导师/挚友系统，而是整合到能力体系
2. **不强制迁移**：现有功能继续工作，新功能作为扩展
3. **不过度复杂化**：保持系统简单，避免过度设计
4. **不破坏模块独立性**：保持各模块的独立性，通过事件驱动集成

## Decisions

### Decision 1: 能力模型扩展

**选择**：在能力体系中增加**关系维度**（Relationship Dimension），将导师/挚友能力纳入关系维度

**能力维度**：
- **技能维度**（Skill）：技能熟练度、成功率、使用频率
- **记忆维度**（Memory）：记忆质量、检索精度、关联度
- **意识维度**（Consciousness）：意识成熟度、自主性、反思能力
- **协作维度**（Collaboration）：协作效率、互补性、沟通能力
- **关系维度**（Relationship）🆕：挚友能力、导师能力、关系管理能力

**关系维度能力指标**：
- **挚友能力**（Companionship Capability）：情感连接、陪伴支持、记忆共鸣
- **导师能力**（Mentorship Capability）：指导能力、教育能力、成长规划
- **关系管理**（Relationship Management）：关系发展阶段、关系强度维护

**理由**：
- ✅ 保留现有导师/挚友系统的功能
- ✅ 统一能力体系，避免重复
- ✅ 支持能力-关系联动
- ✅ 便于能力评估和可视化

**替代方案**：
- 将导师/挚友能力作为独立维度：增加复杂度，不符合统一能力体系的设计
- 不整合，保持独立：无法实现能力-关系联动，功能重叠

### Decision 2: 能力成长机制整合

**选择**：将自我成长系统的成长事件纳入能力经验系统，统一能力成长机制

**整合方式**：
- 成长事件 → 转换为能力经验值
  - 学习事件 → 技能经验 + 记忆经验
  - 反思事件 → 意识经验
  - 关系进展 → 关系经验（挚友经验/导师经验）
  - 能力提升 → 对应维度经验

- 关系阶段 → 影响能力成长速度
  - CLOSE_FRIEND阶段 → 情感能力成长速度 +20%
  - MENTOR阶段 → 指导能力成长速度 +20%

- 能力等级 → 影响关系发展阶段
  - 导师能力等级提升 → 更容易成为导师（关系阶段阈值降低）
  - 挚友能力等级提升 → 更容易成为挚友（关系阶段阈值降低）

**理由**：
- ✅ 统一能力成长机制，避免重复
- ✅ 实现能力-关系双向促进
- ✅ 保留现有成长事件记录

### Decision 3: 能力评估整合

**选择**：将导师/挚友能力评估纳入能力体系评估，统一评估报告

**整合方式**：
- `CharacterMentorshipService.assessMentorshipCapabilities()` → 纳入关系维度评估
- `CharacterCompanionshipService.analyzeEmotionalConnection()` → 纳入关系维度评估
- 能力评估报告包含关系维度得分（挚友能力、导师能力、关系管理）

**理由**：
- ✅ 统一能力评估，避免重复评估
- ✅ 提供完整的能力画像
- ✅ 支持能力-关系评估联动

### Decision 4: 模块架构

**选择**：能力体系作为独立模块 `com.heartsphere.capability`，通过事件驱动集成现有系统

**模块结构**：
```
com.heartsphere.capability/
├── entity/
│   ├── RoleCapabilityProfile.java          # 能力档案（包含关系维度）
│   ├── CapabilityExperience.java           # 能力经验（包含关系经验）
│   └── ...
├── service/
│   ├── integration/
│   │   ├── RelationshipCapabilityIntegrationService.java  # 关系能力整合
│   │   └── CapabilitySynergyEngine.java    # 能力协同引擎
│   ├── growth/
│   │   ├── RelationshipCapabilityGrowthService.java       # 关系能力成长
│   │   └── CapabilityExperienceService.java
│   └── assessment/
│       ├── RelationshipCapabilityAssessmentService.java   # 关系能力评估
│       └── CapabilityAssessmentService.java
└── ...
```

**集成方式**：
- 通过事件监听现有系统的事件（技能执行、记忆更新、关系进展等）
- 通过ID关联现有数据（不建立JPA关系）
- 通过服务接口调用现有服务（如 `CharacterMentorshipService`）

**理由**：
- ✅ 保持模块独立性
- ✅ 不破坏现有系统
- ✅ 便于维护和扩展

### Decision 5: 数据模型整合

**选择**：扩展能力体系数据模型，关联现有关系数据（不建立外键）

**数据模型**：
- `role_capability_profile` 表扩展：
  - `relationship_dimension_score` - 关系维度得分
  - `mentorship_capability_score` - 导师能力得分
  - `companionship_capability_score` - 挚友能力得分

- `capability_experience` 表扩展：
  - `relationship_experience` - 关系维度经验值
  - `mentorship_experience` - 导师能力经验值
  - `companionship_experience` - 挚友能力经验值

- 通过 `character_id` 关联现有表（不建立外键）：
  - `character_relationship_milestones` - 关系里程碑
  - `character_mentorship_sessions` - 导师指导会话
  - `character_growth_events` - 成长事件

**理由**：
- ✅ 保持数据模型独立性
- ✅ 不破坏现有数据模型
- ✅ 支持数据查询和关联

## Risks / Trade-offs

### Risk 1: 整合复杂度

**风险**：整合两个系统可能增加系统复杂度

**缓解措施**：
- 采用渐进式整合策略，分阶段实施
- 保持现有功能不变，新功能作为扩展
- 通过事件驱动保持模块独立性

### Risk 2: 性能影响

**风险**：能力体系整合可能影响系统性能

**缓解措施**：
- 异步处理能力评估和成长计算
- 缓存能力评估结果
- 限制评估频率

### Risk 3: 数据一致性

**风险**：能力体系数据与现有关系数据可能不一致

**缓解措施**：
- 定期同步数据（如每天同步一次）
- 提供数据一致性检查工具
- 支持手动触发数据同步

### Risk 4: 功能重复

**风险**：整合后可能出现功能重复

**缓解措施**：
- 明确功能边界，避免重复实现
- 统一使用能力体系API
- 逐步迁移现有功能到能力体系

## Migration Plan

### Phase 1: 能力模型扩展（1-2周）

1. **创建能力体系模块**
   - 创建 `com.heartsphere.capability` 模块
   - 定义能力模型实体类（包含关系维度）
   - 创建数据库表结构

2. **整合关系维度**
   - 扩展能力模型，增加关系维度
   - 定义关系维度能力指标（挚友能力、导师能力、关系管理）
   - 实现关系能力整合服务

3. **数据关联**
   - 通过 `character_id` 关联现有关系数据
   - 实现数据查询和同步机制

### Phase 2: 能力成长整合（2-3周）

1. **统一能力成长机制**
   - 将成长事件转换为能力经验值
   - 实现能力经验服务
   - 整合到能力成长系统

2. **能力-关系联动**
   - 实现关系阶段影响能力成长速度
   - 实现能力等级影响关系发展阶段
   - 实现双向促进机制

3. **成长事件整合**
   - 监听现有成长事件
   - 转换为能力经验值
   - 记录到能力经验系统

### Phase 3: 能力评估整合（1-2周）

1. **整合导师/挚友能力评估**
   - 将 `CharacterMentorshipService` 的评估纳入能力体系
   - 将 `CharacterCompanionshipService` 的评估纳入能力体系
   - 实现统一的能力评估服务

2. **统一评估报告**
   - 实现多维度能力评估（包含关系维度）
   - 生成统一的能力评估报告
   - 实现能力-关系评估联动

### Phase 4: 能力协同与可视化（2-3周）

1. **关系-能力协同**
   - 实现关系-技能协同
   - 实现关系-记忆协同
   - 实现关系-意识协同

2. **能力可视化扩展**
   - 扩展能力雷达图（包含关系维度）
   - 扩展能力成长轨迹（包含关系发展阶段）
   - 实现关系-能力协同可视化

3. **前端UI整合**
   - 将 `CharacterGrowthTab` 整合到能力可视化面板
   - 实现统一的能力展示界面

### Rollback Plan

- 每个阶段独立部署，支持回滚
- 能力体系作为可选功能，不影响现有系统
- 通过特性开关控制启用/禁用
- 保留现有API，新增能力体系API

## Open Questions

1. **数据同步频率**：能力体系数据与现有关系数据应该多久同步一次？
2. **能力成长速度**：如何平衡能力成长速度，避免过快或过慢？
3. **功能迁移策略**：是否逐步将现有功能迁移到能力体系？迁移时间表？
4. **API兼容性**：现有API是否需要保持长期兼容？还是逐步废弃？
