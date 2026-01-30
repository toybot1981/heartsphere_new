## ADDED Requirements

### Requirement: 技能存储与 skill-creator 规范对应
系统 SHALL 将技能数据按 skill-creator 规范对应到数据库：SKILL.md（必选）对应单条技能主记录，Bundled Resources（可选）对应与技能关联的资源记录，资源通过类型区分 scripts/references/assets。

#### Scenario: SKILL.md 对应 skill_definitions
- **WHEN** 系统持久化或读取技能
- **THEN** SKILL.md 的 YAML frontmatter（metadata）映射到 `skill_definitions` 的 `name`、`description` 及现有元数据字段
- **AND** SKILL.md 的 Markdown 指令部分（或完整 SKILL.md 内容）存储在 `skill_definitions.skill_content`
- **AND** 单条技能对应 `skill_definitions` 的一行，通过 `skill_id` 唯一标识

#### Scenario: Bundled Resources 对应 skill_resources
- **WHEN** 系统持久化或读取技能的 Bundled Resources
- **THEN** scripts 对应 `skill_resources` 中 `resource_type = 'SCRIPT'` 的记录
- **AND** references 对应 `skill_resources` 中 `resource_type = 'REFERENCE'` 的记录
- **AND** assets 对应 `skill_resources` 中 `resource_type = 'ASSET'` 的记录
- **AND** 每条资源通过 `skill_id` 关联到 `skill_definitions`
- **AND** 资源采用单表存储，通过 `resource_type` 区分类型，不拆分为三张表

### Requirement: 技能与资源的关联查询
系统 SHALL 支持按技能 ID 查询该技能的主信息及其全部 Bundled Resources（scripts、references、assets）。

#### Scenario: 按 skill_id 返回技能与资源
- **WHEN** 客户端请求某技能的完整信息（用于展示或编辑）
- **THEN** 系统返回该技能在 `skill_definitions` 中的主数据
- **AND** 系统同时返回该技能在 `skill_resources` 中的所有记录，并按 `resource_type` 与排序字段有序展示或编辑
