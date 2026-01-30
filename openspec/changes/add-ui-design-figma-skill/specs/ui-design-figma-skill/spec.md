## ADDED Requirements

### Requirement: 项目提供基于 Figma 的 UI 设计技能
项目 SHALL 提供名为 **ui-design-figma** 的 Agent 技能，用于基于 Figma 设计稿完成 UI 设计、界面还原、设计稿解析与资源导出；技能 SHALL 通过 Figma MCP（如 Framelink MCP for Figma）或其它 Figma 工具完成上述能力，并 SHALL 在技能文档中说明 Figma app key（或等效 token）的配置与使用方式。

#### Scenario: 用户请求基于 Figma 做 UI 设计或界面还原时触发技能
- **WHEN** 用户请求基于 Figma 做 UI 设计、设计稿解析、界面还原、资源导出或与 Figma 相关的设计工作
- **THEN** Agent SHALL 使用 ui-design-figma 技能（通过 SKILL.md 的 name/description 触发）
- **AND** 技能 SHALL 指引使用 Figma MCP 工具（如 get_figma_data、download_figma_images）或其它已配置的 Figma 工具完成操作
- **AND** 技能 SHALL 引用项目 UX 设计规范（openspec/project.md 中 UX Design Guidelines、主题系统等），使产出与项目规范一致

#### Scenario: Figma 访问凭证的配置说明
- **WHEN** 用户已具备 Figma app key 并希望使用本技能
- **THEN** 技能文档（SKILL.md 或 references）SHALL 说明 Figma app key 或 MCP 所需 token 的配置方式
- **AND** 说明 SHALL 注明在 Cursor/本项目中配置 MCP 或环境变量的位置
- **AND** 技能 SHALL 不将具体 key 或 token 写入仓库

### Requirement: 技能使用 Figma MCP 工具完成设计稿获取与资源导出
ui-design-figma 技能 SHALL 使用 Figma MCP 提供的工具完成设计稿数据获取与图片/图标导出；技能文档 SHALL 包含对 get_figma_data、download_figma_images 等工具的参数与典型用法的说明（如 fileKey、nodeId 从 Figma URL 的获取方式）。

#### Scenario: 获取 Figma 文件与节点数据
- **WHEN** Agent 需要解析 Figma 设计稿的布局、内容或组件信息
- **THEN** 技能 SHALL 指引使用 get_figma_data（fileKey 必填，nodeId、depth 按需）获取文件/节点数据
- **AND** 技能文档 SHALL 说明 fileKey、nodeId 的格式及从 Figma 设计链接中提取的方式

#### Scenario: 导出设计稿中的图片或图标
- **WHEN** Agent 需要将 Figma 中的图片或图标导出到项目目录
- **THEN** 技能 SHALL 指引使用 download_figma_images（fileKey、nodes、localPath 必填，pngScale 可选）导出 SVG/PNG
- **AND** 技能文档 SHALL 说明 nodes 结构（nodeId、fileName、imageRef 等）及 localPath 的约定（如与前端资源目录一致）
