# Change: 构建专业 Skill Creator 工具

## Why

当前系统的技能创建方式存在以下问题：
1. **技能描述不科学** - 手动填写的描述缺乏结构化指导，质量参差不齐
2. **缺乏专业规范** - 没有参考 Claude 官方 Skill Creator 的最佳实践和设计原则
3. **创建流程不完善** - 现有的表单式创建缺少引导和验证机制
4. **元数据不完整** - 技能缺少必要的元数据（如许可证、兼容性、版本信息等）
5. **技能返回不合理** - 技能可能返回 FunctionCall 格式信息，而非实际执行结果
6. **工具调用方式过时** - 使用 Function Calling 而非更标准的 MCP (Model Context Protocol)
7. **工具验证缺失** - 创建技能时未验证 MCP 工具是否可用

参考 Claude 官方的 Skill Creator 工具，我们需要构建一个专业的技能创建工具，帮助管理员创建高质量、结构化的技能定义，同时将生成的技能存储到数据库中。同时，技能应使用 MCP 协议调用工具，确保返回合理的执行结果。

## What Changes

- **新增专业 Skill Creator 工具** - 在 Admin 模块中构建类似 Claude 官方 Skill Creator 的专业工具
- **技能结构标准化** - 采用 Claude Skills 规范（YAML 元数据 + Markdown 指令结构）
- **智能引导创建流程** - 提供分步骤的创建向导，引导用户填写必要信息
- **质量验证机制** - 实现技能描述、名称格式、元数据完整性等验证
- **模板系统** - 提供常用技能类型的模板，加速创建过程
- **数据库存储增强** - 扩展技能定义表，支持完整的 Claude Skills 元数据字段
- **MCP 工具支持** - 技能使用 MCP 协议调用工具，去除 Function Calling 支持
- **MCP 工具验证** - 创建技能时验证 MCP 工具可用性，只允许选择已配置且可用的工具
- **返回合理性验证** - 确保技能返回实际执行结果，而非 FunctionCall 格式信息
- **大模型降级方案** - 如果 MCP 不支持，通过描述方式让大模型执行任务

## Impact

- **Affected specs**: 新增 `skill-creation` 能力规范
- **Affected code**: 
  - `admin/backend`: 新增 Skill Creator 相关 Controller、Service，集成 MCP 工具验证
  - `admin/frontend`: 新增 Skill Creator 组件和页面，MCP 工具选择器
  - `main/backend`: 扩展 `skill_definitions` 表结构，移除 Function Calling 相关字段
  - `mentis/backend`: 集成 MCP 工具列表查询接口
  - 数据库迁移脚本：添加新字段支持完整元数据，移除 `function_schema` 字段
