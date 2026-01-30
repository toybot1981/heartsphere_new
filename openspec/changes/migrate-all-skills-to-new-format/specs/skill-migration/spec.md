## ADDED Requirements

### Requirement: AI生成新技能并删除旧技能
系统 SHALL 使用 AI 服务根据旧技能描述生成符合新规范的新技能，并删除所有旧格式技能。

#### Scenario: 批量生成新技能
- **WHEN** 管理员触发批量迁移
- **THEN** 系统读取所有旧格式技能（使用 function_schema 或缺少新规范字段的技能）
- **AND** 系统提取每个旧技能的关键信息（skillId, name, description, function_schema, execution_config 等）
- **AND** 系统调用 AI 服务，根据旧技能信息生成新格式技能定义
- **AND** 系统验证生成的新技能是否符合新规范
- **AND** 系统保存所有生成的新技能
- **AND** 系统生成迁移报告，包括成功和失败的数量

#### Scenario: AI生成技能内容
- **WHEN** 系统为旧技能生成新技能
- **THEN** AI 生成的新技能包含以下字段：
  - **必需字段**：skillId（保持或优化）, name, description（优化）, instruction（Markdown格式）
  - **新规范字段**：skillContent（完整的 SKILL.md 格式）, mcpToolConfig（如果原技能有 function_schema）, license, version
  - **保持字段**：category, skillType, executionConfig, autoTriggerKeywords（如果存在）
- **AND** 新技能的 description 比原技能更清晰、完整
- **AND** 新技能的 instruction 包含详细的使用说明、参数说明、示例等
- **AND** 如果原技能有 function_schema，新技能尝试转换为 mcpToolConfig

#### Scenario: 技能ID处理
- **WHEN** 生成新技能时
- **THEN** 系统优先保持原 skillId（如果符合新规范格式）
- **AND** 如果原 skillId 不符合格式，系统生成新的符合格式的 skillId
- **AND** 系统建立旧 skillId 到新 skillId 的映射关系
- **AND** 系统使用映射关系迁移角色技能绑定

#### Scenario: 删除旧技能
- **WHEN** 所有新技能生成并验证完成后
- **THEN** 系统删除所有旧格式技能
- **AND** 系统在删除前备份旧技能数据到备份表
- **AND** 系统验证删除操作成功
- **AND** 系统记录删除的旧技能列表

### Requirement: 角色技能绑定迁移
系统 SHALL 将角色装备的旧技能绑定迁移到对应的新技能。

#### Scenario: 绑定数据迁移
- **WHEN** 旧技能被删除，新技能已创建
- **THEN** 系统查找所有使用旧技能的角色技能绑定
- **AND** 系统根据 skillId 映射关系更新绑定中的 skillId
- **AND** 系统保持绑定的其他配置不变（characterId, isEnabled, autoTrigger, priority, usageCount 等）
- **AND** 系统验证绑定迁移的完整性（没有孤立的绑定记录）

#### Scenario: 绑定冲突处理
- **WHEN** 迁移绑定数据时发现新技能已有绑定
- **THEN** 系统合并配置或提示管理员处理冲突
- **AND** 系统记录冲突信息到迁移报告

### Requirement: 数据备份和恢复
系统 SHALL 在删除旧技能前备份数据，并提供恢复机制。

#### Scenario: 数据备份
- **WHEN** 开始批量迁移前
- **THEN** 系统备份所有旧技能数据到备份表（skill_definitions_backup）
- **AND** 系统备份所有角色技能绑定数据
- **AND** 系统验证备份数据的完整性
- **AND** 系统记录备份时间戳和备份信息

#### Scenario: 数据恢复
- **WHEN** 迁移过程中发生严重错误需要回滚
- **THEN** 系统可以从备份表恢复旧技能数据
- **AND** 系统可以恢复角色技能绑定数据
- **AND** 系统验证恢复后的数据完整性

### Requirement: 迁移验证和报告
系统 SHALL 验证迁移结果并生成详细的迁移报告。

#### Scenario: 迁移验证
- **WHEN** 迁移完成后
- **THEN** 系统验证所有新技能是否符合新规范：
  - 包含所有必需字段
  - 字段格式正确（skillId格式、description长度等）
  - skillContent 格式正确
  - mcpToolConfig 格式正确（如果存在）
- **AND** 系统验证所有角色技能绑定已正确迁移
- **AND** 系统验证没有遗留的旧技能数据

#### Scenario: 迁移报告
- **WHEN** 迁移完成后
- **THEN** 系统生成详细的迁移报告，包括：
  - 迁移的旧技能总数
  - 成功生成的新技能数量
  - 失败的数量及原因
  - 新技能列表（skillId, name）
  - 删除的旧技能列表
  - 绑定的迁移情况
  - 验证结果
  - 建议和注意事项
- **AND** 系统支持导出报告（JSON/CSV格式）

## MODIFIED Requirements

### Requirement: 技能迁移策略
系统 SHALL 采用"删除旧技能，AI生成新技能"的迁移策略，而不是转换旧技能数据。

#### Scenario: 迁移策略变更
- **WHEN** 执行技能迁移
- **THEN** 系统不再转换旧技能数据，而是使用 AI 根据旧技能描述生成全新的技能
- **AND** 系统删除所有旧格式技能，而不是保留或标记为废弃
- **AND** 系统确保新技能的功能和用途与原技能保持一致
- **AND** 系统确保新技能符合最新的 Claude Skills 规范
