## MODIFIED Requirements

### Requirement: 技能定义数据传输对象
技能定义 DTO SHALL 包含所有技能字段，移除废弃的 `functionSchema` 字段，使用新字段（license, compatibility, metadata, skillContent, mcpToolConfig）替代。

#### Scenario: 获取技能列表
- **WHEN** 主工程前端调用 `/api/skills` 获取技能列表
- **THEN** 返回的 `SkillDefinitionDTO` 不包含 `functionSchema` 字段，但包含新字段：license, compatibility, metadata, skillContent, mcpToolConfig

#### Scenario: 获取单个技能详情
- **WHEN** 主工程前端调用 `/api/skills/{skillId}` 获取技能详情
- **THEN** 返回的 `SkillDefinitionDTO` 不包含 `functionSchema` 字段，但包含所有新字段

#### Scenario: 角色技能编辑显示
- **WHEN** 用户在角色编辑器中选择技能标签页
- **THEN** 技能列表和详情能够正确显示所有技能信息，不显示废弃的 `functionSchema` 字段，但显示新字段

#### Scenario: 后台创建技能在主工程使用
- **WHEN** 管理员在后台使用专业 Skill Creator 创建一个包含 MCP 工具配置的技能
- **THEN** 该技能在主工程的角色技能编辑界面中能够正确显示，使用 `mcpToolConfig` 而非 `functionSchema`

## ADDED Requirements

### Requirement: 技能管理模块数据模型一致性
Admin 模块和 Main 模块的技能管理功能 SHALL 使用一致的数据模型和 API 响应格式，移除废弃字段，统一使用新字段。

#### Scenario: DTO 字段对齐
- **WHEN** 检查 Admin 和 Main 模块的 `SkillDefinitionDTO`
- **THEN** 两个 DTO 都不包含 `functionSchema` 字段，但都包含相同的新字段（license, compatibility, metadata, skillContent, mcpToolConfig），确保数据能够正确传输

#### Scenario: API 响应格式一致性
- **WHEN** 调用 Admin API (`/api/admin/skills`) 和 Main API (`/api/skills`)
- **THEN** 返回的响应格式一致，都不包含 `functionSchema` 字段，但都包含新字段，前端可以统一处理

#### Scenario: 实体和 DTO 映射一致性
- **WHEN** 从数据库实体转换为 DTO
- **THEN** 废弃的 `functionSchema` 字段不被映射，新字段（license, compatibility, metadata, skillContent, mcpToolConfig）都被正确映射

### Requirement: 角色技能编辑功能完整性
主工程的角色技能编辑界面 SHALL 能够完整显示和编辑所有技能信息，不显示废弃字段。

#### Scenario: 显示新字段
- **WHEN** 用户在角色编辑器中选择一个包含新字段的技能
- **THEN** 技能详情对话框能够显示所有新字段（license, compatibility, metadata, skillContent, mcpToolConfig），不显示废弃的 `functionSchema` 字段

#### Scenario: 技能装备功能
- **WHEN** 用户在角色技能编辑界面装备一个技能
- **THEN** 技能的所有配置信息（包括新字段）都能正确保存和读取，不使用废弃的 `functionSchema` 字段

#### Scenario: 技能启用/禁用
- **WHEN** 用户启用或禁用一个技能
- **THEN** 技能的状态能够正确更新，不影响其他字段，不依赖废弃的 `functionSchema` 字段
