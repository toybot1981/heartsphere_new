# Change: 将常用工具在管理端进行管理，支持提示词和指令管理

**变更ID**: `manage-tools-in-admin`  
**状态**: 提案中

## Why

当前系统中，工具（Tool）的定义和执行逻辑都是硬编码在代码中的，存在以下问题：

1. **无法灵活调整**：工具的提示词和指令需要修改代码才能调整，无法通过管理界面动态更新
2. **缺乏统一管理**：工具信息分散在代码中（`Tool` 接口实现类），难以统一查看和管理
3. **缺乏可视化**：管理员无法直观地查看工具列表、工具详情、提示词和指令
4. **无法测试工具**：管理员无法在管理界面中测试工具的执行效果
5. **缺乏工具配置**：无法为工具配置个性化的提示词和指令，影响工具的执行效果

参照 Manus 的设计理念，工具应该有：
- 清晰的工具列表和分类
- 详细的工具描述和参数说明
- 可配置的提示词模板
- 可配置的执行指令
- 工具测试和验证功能

## What Changes

- **工具管理界面**：
  - 在管理端添加工具管理页面，参照 `McpConfigManagement` 和 `PromptManagement` 的设计风格
  - 显示所有已注册的工具列表（从 `ToolRegistry` 获取）
  - 支持按分类筛选工具（browser、terminal、filesystem、code、system 等）
  - 支持搜索工具（按名称、描述）

- **工具详情管理**：
  - 显示工具的详细信息（名称、描述、参数模式）
  - 支持编辑工具的描述和参数说明
  - 显示工具的执行历史和使用统计

- **工具提示词管理**：
  - 为每个工具配置提示词模板（用于工具选择和参数生成）
  - 支持编辑工具的提示词模板
  - 支持提示词模板的变量替换和预览
  - 参照 `PromptManagement` 的设计，提供提示词管理功能

- **工具指令管理**：
  - 为每个工具配置执行指令（用于工具执行时的指令生成）
  - 支持编辑工具的指令模板
  - 支持指令模板的变量替换和预览
  - 对于需要脚本执行的工具（如 Python），支持编辑脚本模板

- **工具测试功能**：
  - 在管理界面中测试工具的执行
  - 支持输入工具参数并查看执行结果
  - 支持查看工具的执行日志和错误信息
  - 参照 `McpConfigManagement` 的测试功能设计

- **工具配置数据模型**：
  - 创建 `ToolConfig` 实体，存储工具的配置信息（提示词、指令等）
  - 工具配置与工具实现类关联（通过工具名称）
  - 支持工具配置的版本管理（如果需要）

- **代码重构**：
  - 修改工具执行逻辑，从管理系统读取工具的提示词和指令
  - 保留硬编码作为 fallback 机制，确保向后兼容
  - 实现工具配置的缓存机制，提高读取性能

## Impact

- **影响的规范**：
  - `tool-management` - 工具管理能力（新增）
  - `tool-config-management` - 工具配置管理能力（新增）
  - `prompt-template-management` - 提示词模板管理能力（扩展，支持工具提示词）

- **影响的代码**：
  - `admin/backend/src/main/java/com/heartsphere/admin/controller/AdminToolController.java`（新增）
  - `admin/frontend/src/components/ToolManagement.tsx`（新增）
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/registry/ToolRegistry.java`（扩展，添加配置读取）
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/executor/ToolExecutor.java`（扩展，从配置读取提示词和指令）
  - `shared/backend/src/main/java/com/heartsphere/shared/entity/ToolConfig.java`（新增）
  - `shared/backend/src/main/java/com/heartsphere/shared/repository/ToolConfigRepository.java`（新增）
  - `shared/backend/src/main/java/com/heartsphere/shared/service/ToolConfigService.java`（新增）

- **数据库**：
  - 新增 `tool_configs` 表（用于存储工具配置）
  - 可能需要扩展 `prompt_templates` 表（用于存储工具提示词，复用现有表）

## Benefits

1. **灵活调整**：管理员可以通过管理界面调整工具的提示词和指令，无需修改代码
2. **统一管理**：所有工具信息集中在管理系统中，便于维护和查看
3. **可视化编辑**：管理员可以直观地查看和编辑工具配置
4. **工具测试**：管理员可以在管理界面中测试工具，验证配置效果
5. **A/B 测试**：可以轻松创建多个版本的配置进行测试
6. **工具文档化**：工具的描述、参数说明、使用示例可以在管理界面中统一管理

## Risks

- **配置错误风险**：错误的配置可能导致工具执行失败
- **向后兼容性**：需要确保 fallback 机制正常工作
- **性能影响**：每次执行都需要从数据库读取配置，可能需要缓存优化
- **工具注册时机**：工具在运行时注册，需要确保配置数据与工具注册同步

## Migration Plan

1. 创建工具配置数据模型（`ToolConfig` 实体）
2. 从现有工具实现类中提取提示词和指令（如果有硬编码）
3. 准备工具配置数据导入脚本
4. 实现工具配置管理服务（后端 API）
5. 实现工具管理界面（前端）
6. 修改工具执行逻辑，从管理系统读取配置
7. 实现工具测试功能
8. 测试验证功能正常
9. 确认所有工具配置都已迁移后，移除硬编码（可选）
