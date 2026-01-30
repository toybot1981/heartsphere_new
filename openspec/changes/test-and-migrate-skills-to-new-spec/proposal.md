# Change: 测试 Skill Creator 并迁移现有技能到新规范

## Why

专业 Skill Creator 工具已经实现完成，但存在以下问题：

1. **缺乏测试覆盖** - 新创建的 Skill Creator 工具没有完整的测试，无法保证功能正确性和稳定性
2. **现有技能未迁移** - 数据库中已有的技能仍使用旧的 Function Calling 规范（`function_schema`），未迁移到新的 MCP 工具配置规范
3. **技能质量不一致** - 现有技能缺少新规范要求的字段（`skill_content`, `mcp_tool_config`, `license`, `compatibility`, `metadata`），导致技能描述不完整、指令不清晰
4. **角色掌控能力不足** - 由于技能描述和指令不完整，AI 难以准确理解和使用技能，影响角色对技能的掌控能力
5. **向后兼容性问题** - 新旧规范并存，系统需要同时支持两种格式，增加了复杂性和维护成本

为了确保技能系统能够更好地为角色服务，需要：
- 对 Skill Creator 工具进行全面的测试
- 将现有技能迁移到新规范
- 确保迁移后的技能能够被角色正确使用和执行

## What Changes

- **Skill Creator 测试** - 为 Skill Creator 工具添加单元测试、集成测试和 E2E 测试
- **技能数据迁移工具** - 创建数据迁移工具，将现有技能从旧规范迁移到新规范
- **技能质量提升** - 为现有技能补充缺失的字段，生成 `skill_content`，优化描述和指令
- **MCP 工具配置迁移** - 将 `function_schema` 转换为 `mcp_tool_config`（如果适用）
- **技能验证和修复** - 验证迁移后的技能，修复不符合新规范的问题
- **角色掌控优化** - 确保技能描述清晰、指令完整，提高 AI 对技能的理解和使用能力
- **向后兼容处理** - 在迁移过程中保持向后兼容，确保现有功能不受影响

## Impact

- **Affected specs**: 
  - 修改 `skill-creation` 能力规范（添加测试要求）
  - 新增 `skill-migration` 能力规范（技能迁移、质量提升、角色掌控优化、向后兼容）
- **Affected code**: 
  - `admin/backend`: 添加测试类、迁移服务、验证工具
  - `admin/frontend`: 添加测试用例、迁移工具 UI（可选）
  - `main/backend`: 更新技能执行逻辑以支持新规范
  - 数据库迁移脚本：技能数据迁移脚本
- **Affected data**: 
  - `skill_definitions` 表中的现有技能数据需要迁移
  - 可能需要更新 `skill_instructions` 和 `skill_resources` 表
