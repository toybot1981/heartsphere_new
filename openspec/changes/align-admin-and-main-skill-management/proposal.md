# Change: 对齐后台管理和主工程的技能管理功能

## Why

当前系统中存在两个技能管理模块，它们之间存在不匹配的问题：

1. **数据模型不一致**：
   - Admin 模块的 `SkillDefinitionDTO` 包含新字段（license, compatibility, metadata, skillContent, mcpToolConfig）
   - Main 模块的 `SkillDefinitionDTO` 缺少这些字段
   - 导致后台创建的新技能在主工程中无法完整显示和使用

2. **API 路径分离**：
   - Admin 使用 `/api/admin/skills`
   - Main 使用 `/api/skills` 和 `/api/characters/{characterId}/skills`
   - 两个系统可能操作不同的数据源或使用不同的实体

3. **功能不对齐**：
   - Admin 有专业 Skill Creator 工具，支持 MCP 工具配置、技能内容等新功能
   - Main 的角色技能编辑界面可能无法显示或编辑这些新字段
   - 用户在后台创建的专业技能，在主工程中可能无法正常使用

4. **数据同步问题**：
   - 如果两个模块使用不同的数据库表或实体，可能导致数据不一致
   - 需要确认是否共享同一个 `skill_definitions` 表

## What Changes

- **移除废弃字段** - 从 DTO 中移除 `functionSchema` 字段（已废弃，改用 `mcpToolConfig`）
- **统一数据模型** - 确保 Admin 和 Main 模块的 `SkillDefinitionDTO` 包含相同的新字段（license, compatibility, metadata, skillContent, mcpToolConfig）
- **更新 DTO 转换** - 更新所有 DTO 转换逻辑，移除废弃字段，添加新字段
- **验证 API 兼容性** - 检查两个模块的 API 是否能够正确交互
- **对齐前端功能** - 确保主工程的角色技能编辑界面能够显示和编辑所有新字段
- **数据源验证** - 确认两个模块是否使用同一个数据源
- **功能对齐** - 确保后台创建的专业技能在主工程中能够正常使用

## Impact

- **Affected specs**: 
  - `skill-management` (如果存在)
  - `skill-creation` (已存在)
  - `character-skill-editing` (可能需要新增)
  
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/skill/dto/SkillDefinitionDTO.java` - 移除 `functionSchema`，添加新字段（license, compatibility, metadata, skillContent, mcpToolConfig）
  - `admin/backend/src/main/java/com/heartsphere/admin/dto/skill/SkillDefinitionDTO.java` - 移除 `functionSchema` 字段
  - `main/backend/src/main/java/com/heartsphere/skill/controller/SkillController.java` - 更新 DTO 转换，移除废弃字段
  - `admin/backend/src/main/java/com/heartsphere/admin/controller/AdminSkillController.java` - 更新 DTO 转换，移除废弃字段
  - `main/frontend/services/skill/SkillService.ts` - 更新接口定义，移除废弃字段，添加新字段
  - `admin/frontend/src/services/skill/SkillService.ts` - 更新接口定义，移除废弃字段
  - `main/frontend/components/character/CharacterSkillManagement.tsx` - 更新显示逻辑，移除废弃字段引用
  - `admin/frontend/src/components/SkillsManagement.tsx` - 更新表单，移除废弃字段
