## 1. 数据模型对齐

- [x] 1.1 检查 Main 模块的 `SkillDefinition` 实体是否包含所有新字段（license, compatibility, metadata, skillContent, mcpToolConfig）
- [x] 1.2 从 Main 模块的 `SkillDefinitionDTO` 中移除废弃的 `functionSchema` 字段
- [x] 1.3 更新 Main 模块的 `SkillDefinitionDTO`，添加新字段（license, compatibility, metadata, skillContent, mcpToolConfig）
- [x] 1.4 从 Admin 模块的 `SkillDefinitionDTO` 中移除废弃的 `functionSchema` 字段
- [x] 1.5 更新 Main 模块的 `SkillController` 中的 DTO 转换方法，移除废弃字段，添加新字段
- [x] 1.6 更新 Admin 模块的 `AdminSkillController` 中的 DTO 转换方法，移除废弃字段
- [x] 1.7 验证两个模块的实体映射到同一个数据库表

## 2. API 兼容性验证

- [x] 2.1 检查 Admin API (`/api/admin/skills`) 和 Main API (`/api/skills`) 的响应格式是否一致
- [x] 2.2 验证 Main 模块的前端能否正确调用 Admin API（如果需要）
- [x] 2.3 确认角色技能编辑功能使用的 API 路径是否正确

## 3. 前端功能对齐

- [x] 3.1 更新 `main/frontend/services/skill/SkillService.ts` 中的 `SkillDefinition` 接口，移除 `functionSchema`，添加新字段
- [x] 3.2 更新 `admin/frontend/src/services/skill/SkillService.ts` 中的 `SkillDefinition` 接口，移除 `functionSchema`
- [x] 3.3 检查 `CharacterSkillManagement.tsx`，移除对 `functionSchema` 的引用
- [x] 3.4 更新 `admin/frontend/src/components/SkillsManagement.tsx`，移除 `functionSchema` 表单字段
- [x] 3.5 更新 `main/frontend/components/character/SkillDetailDialog.tsx`，移除 `functionSchema` 显示，添加 `mcpToolConfig` 显示
- [x] 3.6 更新 Repository 查询方法，将 `functionSchema` 判断改为 `mcpToolConfig`

## 4. 功能验证

- [x] 4.1 代码审查完成：所有 DTO、Controller、Repository 和前端接口已更新
- [x] 4.2 已移除所有废弃字段引用，统一使用新字段
- [x] 4.3 验证技能的所有字段（包括新字段）都能正确保存和读取（代码层面）
- [ ] 4.4 实际测试：需要在运行时测试技能装备、启用/禁用等功能是否正常工作

## 5. 文档和测试

- [x] 5.1 代码注释已更新，说明新字段的用途和废弃字段的移除
- [ ] 5.2 编写测试用例验证数据模型对齐（可选，建议后续添加）
- [ ] 5.3 编写集成测试验证两个模块的交互（可选，建议后续添加）
