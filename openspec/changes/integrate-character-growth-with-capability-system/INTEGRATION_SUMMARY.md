# 整合提案总结

## 提案信息

**提案ID**: `integrate-character-growth-with-capability-system`  
**提案名称**: 整合角色成长系统与能力体系 - 构建统一的能力生态  
**创建日期**: 2026-01-25  
**状态**: ✅ 已验证通过

## 整合目标

将两个相关但相对独立的提案整合为统一的能力体系：

1. **enable-character-self-growth-and-mentorship**（已实现77/94任务）
   - 角色自我成长、关系阶段、挚友能力、导师能力

2. **systematically-enhance-role-capabilities**（0/56任务）
   - 能力整合框架、能力成长、能力评估、能力个性化、能力可视化

## 核心整合方案

### 1. 能力模型扩展

**新增关系维度**：
- 在能力体系中增加**关系维度**（Relationship Dimension）
- 将导师能力和挚友能力纳入关系维度
- 能力维度：技能、记忆、意识、协作、**关系**（新增）

**关系维度能力指标**：
- 挚友能力（Companionship Capability）
- 导师能力（Mentorship Capability）
- 关系管理（Relationship Management）

### 2. 能力成长整合

**统一能力成长机制**：
- 将自我成长系统的成长事件纳入能力经验系统
- 成长事件 → 转换为能力经验值
- 关系阶段 → 影响能力成长速度
- 能力等级 → 影响关系发展阶段

**能力-关系双向促进**：
- 关系发展触发能力成长加速
- 能力提升触发关系发展阶段评估
- 形成良性循环

### 3. 能力评估整合

**整合导师/挚友能力评估**：
- 将 `CharacterMentorshipService` 的评估纳入能力体系
- 将 `CharacterCompanionshipService` 的评估纳入能力体系
- 统一能力评估报告，包含关系维度得分

### 4. 能力协同整合

**关系-能力协同**：
- 关系-技能协同：导师模式优先使用指导技能
- 关系-记忆协同：关系记忆影响能力使用策略
- 关系-意识协同：关系阶段影响意识状态

### 5. 能力可视化整合

**扩展能力可视化**：
- 能力雷达图包含关系维度
- 能力成长轨迹包含关系发展阶段
- 关系-能力协同可视化

## 实施阶段

### Phase 1: 能力模型扩展与关系维度整合（1-2周）
- 创建能力体系模块
- 扩展能力模型，增加关系维度
- 实现关系能力数据关联

### Phase 2: 能力成长系统整合（2-3周）
- 统一能力成长机制
- 实现能力-关系联动
- 整合成长事件到能力经验系统

### Phase 3: 能力评估体系整合（1-2周）
- 整合导师/挚友能力评估
- 统一能力评估报告
- 实现能力-关系评估联动

### Phase 4: 能力协同引擎（2-3周）
- 实现关系-能力协同
- 实现能力协同引擎
- 实现能力协同查询API

### Phase 5: 能力个性化整合（2-3周）
- 基于关系定位的能力个性化
- 能力组合优化

### Phase 6: 能力可视化整合（2-3周）
- 扩展能力可视化面板
- 关系-能力协同可视化
- 前端UI整合

### Phase 7: 测试与文档（1-2周）
- 单元测试、集成测试
- 文档编写

## 数据模型

### 新增表结构

- `role_capability_profile` - 角色能力档案（扩展关系维度字段）
- `capability_experience` - 能力经验值（扩展关系经验字段）
- `capability_assessment` - 能力评估记录
- `capability_synergy_log` - 能力协同日志

### 数据关联

通过 `character_id` 关联现有表（不建立外键）：
- `character_relationship_milestones` - 关系里程碑
- `character_mentorship_sessions` - 导师指导会话
- `character_growth_events` - 成长事件

## 模块架构

**独立模块**: `com.heartsphere.capability`

**模块结构**：
```
com.heartsphere.capability/
├── entity/                    # 实体类
├── repository/                # Repository
├── service/
│   ├── integration/          # 能力整合（包含关系能力整合）
│   ├── growth/               # 能力成长（包含关系能力成长）
│   ├── assessment/          # 能力评估（包含关系能力评估）
│   ├── personalization/      # 能力个性化
│   └── visualization/        # 能力可视化
├── controller/               # API控制器
└── dto/                      # DTO类
```

**集成方式**：
- 通过事件驱动集成现有系统
- 通过ID关联现有数据（不建立JPA关系）
- 通过服务接口调用现有服务

## 向后兼容

- ✅ 保持现有API兼容性
- ✅ 现有功能继续工作
- ✅ 新功能作为扩展，不影响现有功能
- ✅ 通过特性开关控制启用/禁用

## 验证状态

✅ **OpenSpec验证通过** - `openspec validate integrate-character-growth-with-capability-system --strict`

## 相关文档

- `proposal.md` - 提案说明
- `design.md` - 设计文档
- `tasks.md` - 任务清单
- `specs/role-capability-integration/spec.md` - 能力整合规范
- `specs/role-capability-growth/spec.md` - 能力成长规范
- `specs/role-capability-assessment/spec.md` - 能力评估规范

## 下一步

1. 审查提案内容
2. 确认整合方案
3. 开始实施 Phase 1
