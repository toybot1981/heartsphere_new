## 1. 数据库设计

- [x] 1.1 创建 Flyway 迁移脚本，新增 `skill_resources` 表
  - [x] 定义表结构（id, skill_id, resource_type, file_name, file_path, file_size, mime_type, description, order_index, created_at, updated_at）
  - [x] 创建索引（skill_id, resource_type）
  - [x] 创建外键约束（skill_id -> skill_definitions.id）
- [ ] 1.2 创建 Flyway 迁移脚本，新增 `skill_usage_stats` 表（可选，用于迭代支持）
  - [ ] 定义表结构（skill_id, usage_count, success_count, failure_count, avg_response_time, last_used_at, updated_at）
  - [ ] 创建索引和外键约束

## 2. 后端：技能资源管理

- [x] 2.1 创建 `SkillResourceService`
  - [x] 实现资源上传功能（支持多种文件类型）
  - [x] 实现资源列表查询（按类型分组）
  - [x] 实现资源删除功能
  - [x] 实现资源描述更新功能
  - [x] 实现资源文件存储（使用现有文件存储服务或对象存储）
- [x] 2.2 创建 `SkillResource` 实体类
  - [x] 定义字段和关系
  - [x] 实现 JPA 映射
- [x] 2.3 创建 `SkillResourceRepository`
  - [x] 实现按技能ID和类型查询
  - [x] 实现排序和分页
- [x] 2.4 在 `AdminSkillController` 中新增资源管理 API
  - [x] `POST /api/admin/skills/{skillId}/resources` - 上传资源
  - [x] `GET /api/admin/skills/{skillId}/resources` - 获取资源列表
  - [x] `DELETE /api/admin/skills/{skillId}/resources/{resourceId}` - 删除资源
  - [x] `PUT /api/admin/skills/{skillId}/resources/{resourceId}` - 更新资源

## 3. 后端：增强验证功能

- [x] 5.1 扩展 `SkillValidationService`
  - [x] 实现 YAML frontmatter 格式验证（使用 SnakeYAML）
  - [x] 实现技能命名规范验证（hyphen-case，最大64字符）
  - [x] 实现描述格式验证（长度、禁止字符）
  - [x] 实现渐进式披露验证（SKILL.md 长度、资源组织）
  - [x] 实现资源引用验证（检查引用的资源文件是否存在）
  - [x] 实现目录结构验证（SKILL.md 存在、无多余文件）
- [x] 5.2 创建 `SkillEnhancedValidationResult` DTO
  - [x] 包含基础验证、结构验证、质量验证、渐进式披露验证结果
  - [x] 包含详细错误和警告列表
- [x] 5.3 在 `AdminSkillController` 中新增增强验证 API
  - [x] `POST /api/admin/skills/{skillId}/validate-enhanced` - 增强验证

## 4. 前端：资源管理界面

- [x] 6.1 扩展 `SkillCreator` 组件，新增资源管理步骤
  - [x] 实现资源类型切换（Scripts/References/Assets）
  - [x] 实现文件上传功能（拖拽上传和点击选择）
  - [x] 实现资源列表展示
  - [x] 实现资源删除和编辑功能
  - [x] 实现资源预览功能（Markdown、代码等）
- [x] 6.2 创建 `SkillResourceService.ts`
  - [x] 实现资源上传 API 调用
  - [x] 实现资源列表查询 API 调用
  - [x] 实现资源删除和更新 API 调用

## 5. 前端：增强验证反馈

- [x] 9.1 扩展验证结果展示
  - [x] 显示基础验证结果
  - [x] 显示结构验证结果
  - [x] 显示质量验证结果
  - [x] 显示渐进式披露验证结果
- [x] 9.2 实现验证错误修复建议
  - [x] 提供具体的修复建议
  - [x] 支持一键修复（如果可能）

## 6. 测试

- [x] 10.1 单元测试
  - [x] `SkillResourceService` 测试
  - [x] 增强验证功能测试（`SkillValidationService.validateEnhanced`）
- [ ] 10.2 集成测试
  - [ ] 资源上传和管理的完整流程测试
  - [ ] 增强验证 API 测试
- [ ] 10.3 端到端测试
  - [ ] 完整的技能创建流程（包含资源管理）
  - [ ] 资源管理和增强验证的完整流程

## 7. 文档

- [ ] 11.1 更新用户文档
  - [ ] 说明资源管理功能（Scripts/References/Assets）
  - [ ] 说明增强验证功能
  - [ ] 提供使用示例
- [ ] 11.2 更新开发者文档
  - [ ] 说明资源管理 API（4个端点）
  - [ ] 说明增强验证 API
  - [ ] 说明验证规则（基础、结构、质量、渐进式披露）
