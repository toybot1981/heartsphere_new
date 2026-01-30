# Spec Delta: 角色能力整合框架（整合关系维度）

## MODIFIED Requirements

### Requirement: 角色能力整合框架
系统 SHALL 提供角色能力整合框架，将技能、记忆、意识、协作、**关系**等能力有机整合，形成统一的能力体系。

#### Scenario: 查询角色综合能力（包含关系维度）
- **WHEN** 用户查询角色的综合能力
- **THEN** 系统返回角色的多维度能力评估（技能、记忆、意识、协作、**关系**）
- **AND** 展示能力雷达图，包含关系维度（挚友能力、导师能力、关系管理）
- **AND** 展示能力等级，包含关系维度等级
- **AND** 包含导师能力和挚友能力的评估结果（从现有系统整合）

#### Scenario: 关系维度能力整合
- **WHEN** 系统查询角色能力时
- **THEN** 系统从 `CharacterMentorshipService` 获取导师能力评估结果
- **AND** 系统从 `CharacterCompanionshipService` 获取挚友能力评估结果
- **AND** 系统将导师能力和挚友能力整合到关系维度
- **AND** 系统返回统一的能力评估报告，包含关系维度得分

#### Scenario: 能力协同触发（包含关系-能力协同）
- **WHEN** 角色执行技能
- **THEN** 系统自动更新相关记忆
- **AND** 记录技能-记忆协同效果
- **AND** 影响意识状态
- **AND** 如果角色处于导师模式，更新导师能力经验值
- **AND** 如果角色处于挚友模式，更新挚友能力经验值
- **AND** 记录关系-能力协同效果

#### Scenario: 能力协同查询（包含关系维度）
- **WHEN** 用户查询能力协同效果
- **THEN** 系统返回能力协同历史记录
- **AND** 展示协同效果统计和分析
- **AND** 包含关系维度与其他维度的协同效果（关系-技能、关系-记忆、关系-意识）

## ADDED Requirements

### Requirement: 关系维度能力模型
系统 SHALL 在能力体系中增加关系维度，将导师能力和挚友能力纳入统一的能力模型。

#### Scenario: 关系维度能力定义
- **WHEN** 系统初始化角色能力模型时
- **THEN** 系统定义关系维度，包含以下能力指标：
  - 挚友能力（Companionship Capability）：情感连接、陪伴支持、记忆共鸣
  - 导师能力（Mentorship Capability）：指导能力、教育能力、成长规划
  - 关系管理（Relationship Management）：关系发展阶段、关系强度维护
- **AND** 系统将关系维度纳入能力模型，与其他维度（技能、记忆、意识、协作）并列

#### Scenario: 关系维度能力查询
- **WHEN** 用户查询角色关系维度能力时
- **THEN** 系统返回关系维度得分
- **AND** 系统返回导师能力得分（从 `CharacterMentorshipService` 整合）
- **AND** 系统返回挚友能力得分（从 `CharacterCompanionshipService` 整合）
- **AND** 系统返回关系管理能力得分

### Requirement: 关系-能力数据关联
系统 SHALL 通过 `character_id` 关联现有关系数据，实现能力体系与关系系统的数据整合。

#### Scenario: 关联关系里程碑数据
- **WHEN** 系统查询角色能力时
- **THEN** 系统通过 `character_id` 关联 `character_relationship_milestones` 表
- **AND** 系统获取关系里程碑数据
- **AND** 系统将关系里程碑数据用于能力评估和成长计算

#### Scenario: 关联导师指导会话数据
- **WHEN** 系统查询角色导师能力时
- **THEN** 系统通过 `character_id` 关联 `character_mentorship_sessions` 表
- **AND** 系统获取导师指导会话数据
- **AND** 系统将指导会话数据用于导师能力评估

#### Scenario: 关联成长事件数据
- **WHEN** 系统计算角色能力经验值时
- **THEN** 系统通过 `character_id` 关联 `character_growth_events` 表
- **AND** 系统获取成长事件数据
- **AND** 系统将成长事件转换为能力经验值

### Requirement: 关系-能力协同机制
系统 SHALL 实现关系维度与其他能力维度的协同机制，实现能力之间的相互促进。

#### Scenario: 关系-技能协同
- **WHEN** 角色处于导师模式时
- **THEN** 系统优先推荐指导相关技能
- **AND** 技能执行成功时，增加导师能力经验值
- **AND** 记录关系-技能协同效果

#### Scenario: 关系-记忆协同
- **WHEN** 角色检索关系相关记忆时
- **THEN** 系统基于关系记忆影响能力使用策略
- **AND** 能力使用更新关系记忆
- **AND** 记录关系-记忆协同效果

#### Scenario: 关系-意识协同
- **WHEN** 角色关系阶段发生变化时
- **THEN** 系统调整意识状态
- **AND** 意识状态影响关系发展
- **AND** 记录关系-意识协同效果
