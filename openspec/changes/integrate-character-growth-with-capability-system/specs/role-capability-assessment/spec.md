# Spec Delta: 角色能力评估体系（整合导师/挚友能力评估）

## MODIFIED Requirements

### Requirement: 能力评估体系
系统 SHALL 提供多维度能力评估体系，将导师/挚友能力评估纳入统一的能力评估。

#### Scenario: 统一能力评估报告（包含关系维度）
- **WHEN** 用户查询角色能力评估时
- **THEN** 系统返回多维度能力评估（技能、记忆、意识、协作、**关系**）
- **AND** 系统从 `CharacterMentorshipService` 获取导师能力评估结果
- **AND** 系统从 `CharacterCompanionshipService` 获取挚友能力评估结果
- **AND** 系统将导师能力和挚友能力整合到关系维度评估
- **AND** 系统生成统一的能力评估报告，包含关系维度得分

#### Scenario: 能力评估影响关系发展阶段
- **WHEN** 系统完成能力评估后
- **THEN** 系统检查关系维度能力得分
- **AND** 如果导师能力得分达到阈值，系统触发关系阶段评估
- **AND** 如果满足成为导师的条件，系统建议关系阶段转换到 MENTOR

## ADDED Requirements

### Requirement: 关系维度能力评估整合
系统 SHALL 将现有的导师/挚友能力评估整合到能力体系评估中。

#### Scenario: 整合导师能力评估
- **WHEN** 系统评估角色能力时
- **THEN** 系统调用 `CharacterMentorshipService.assessMentorshipCapabilities()`
- **AND** 系统获取导师能力评估结果（指导能力、教育能力、成长规划能力）
- **AND** 系统将导师能力评估结果转换为关系维度得分
- **AND** 系统将导师能力得分纳入能力评估报告

#### Scenario: 整合挚友能力评估
- **WHEN** 系统评估角色能力时
- **THEN** 系统调用 `CharacterCompanionshipService.analyzeEmotionalConnection()`
- **AND** 系统获取挚友能力评估结果（情感连接、陪伴支持、记忆共鸣）
- **AND** 系统将挚友能力评估结果转换为关系维度得分
- **AND** 系统将挚友能力得分纳入能力评估报告

#### Scenario: 关系维度评估结果应用
- **WHEN** 系统完成关系维度能力评估后
- **THEN** 系统更新 `role_capability_profile` 表的关系维度字段：
  - `relationship_dimension_score` - 关系维度总得分
  - `mentorship_capability_score` - 导师能力得分
  - `companionship_capability_score` - 挚友能力得分
- **AND** 系统可用于后续的能力优化和关系发展建议
