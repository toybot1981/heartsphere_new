# Spec: Skill Migration

## ADDED Requirements

### Requirement: 技能数据迁移工具

系统 **SHALL** 提供工具将数据库中现有的技能从旧规范（Function Calling）迁移到新规范（MCP工具配置），包括数据转换、验证和修复。

#### Scenario: 技能分析
- **Given** 数据库中存在使用旧规范的技能
- **When** 执行技能分析
- **Then** 识别所有需要迁移的技能
- **And** 分析每个技能的缺失字段
- **And** 生成迁移报告

#### Scenario: 数据转换
- **Given** 需要迁移的技能数据
- **When** 执行数据转换
- **Then** 将 `function_schema` 转换为 `mcp_tool_config`（如果适用）
- **And** 生成 `skill_content`（SKILL.md格式）
- **And** 补充缺失的元数据字段（`license`, `compatibility`, `metadata`）
- **And** 保持数据完整性

#### Scenario: 迁移验证
- **Given** 迁移后的技能数据
- **When** 执行验证
- **Then** 验证数据格式符合新规范
- **And** 验证必填字段完整
- **And** 验证MCP工具配置可用性（如果适用）
- **And** 生成验证报告

#### Scenario: 迁移回滚
- **Given** 迁移过程中出现问题
- **When** 执行回滚操作
- **Then** 恢复到迁移前的状态
- **And** 保留迁移前的数据备份
- **And** 记录回滚原因

---

### Requirement: 技能质量提升

迁移过程中 **SHALL** 提升现有技能的质量，包括优化描述、完善指令、补充元数据，确保技能能够被AI正确理解和使用。

#### Scenario: 描述优化
- **Given** 现有技能描述质量不高
- **When** 执行质量分析
- **Then** 识别需要改进的描述
- **And** 提供改进建议
- **And** 自动优化描述内容（可选）

#### Scenario: 指令完善
- **Given** 技能缺少完整指令
- **When** 执行指令生成
- **Then** 为缺少指令的技能生成指令
- **And** 优化现有指令
- **And** 确保指令格式符合Markdown规范

#### Scenario: 元数据补充
- **Given** 技能缺少元数据字段
- **When** 执行元数据补充
- **Then** 补充 `version` 字段（默认 "1.0.0"）
- **And** 补充 `author` 字段（如果可获取）
- **And** 补充 `license` 字段（如果可获取）
- **And** 补充 `compatibility` 字段（如果可获取）

---

### Requirement: 角色掌控优化

迁移后的技能 **SHALL** 优化描述和指令，确保AI能够清晰理解技能用途、正确执行技能、合理返回结果，提高角色对技能的掌控能力。

#### Scenario: 技能描述清晰
- **Given** 迁移后的技能
- **When** AI 分析技能
- **Then** 能够清晰理解技能用途
- **And** 能够识别技能关键词
- **And** 能够判断何时使用技能

#### Scenario: 技能指令完整
- **Given** 迁移后的技能
- **When** AI 执行技能
- **Then** 能够按照指令正确执行
- **And** 能够处理参数和上下文
- **And** 能够返回合理的结果

#### Scenario: MCP工具配置正确
- **Given** 使用MCP工具的技能
- **When** AI 调用技能
- **Then** 能够正确调用MCP工具
- **And** 能够处理工具返回结果
- **And** 能够处理工具调用失败的情况

---

### Requirement: 向后兼容

迁移过程中 **SHALL** 保持向后兼容，确保旧格式技能仍能正常使用，系统能够同时支持新旧两种格式，平滑过渡。

#### Scenario: 旧格式支持
- **Given** 迁移过程中仍有旧格式技能
- **When** 系统执行技能
- **Then** 优先使用新格式（`mcp_tool_config`, `skill_content`）
- **And** 如果新格式不存在，降级使用旧格式（`function_schema`）
- **And** 记录使用旧格式的技能

#### Scenario: 过渡期兼容
- **Given** 系统处于迁移过渡期
- **When** 技能执行器处理技能
- **Then** 能够识别新旧两种格式
- **And** 能够正确执行两种格式的技能
- **And** 不产生功能错误
