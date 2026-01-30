# Design: UI 设计技能与 Figma 集成

## Context

- 心域项目已有 UX 设计规范（project.md 中 UX Design Guidelines、主题系统等），前端开发需与设计稿保持一致
- 用户已具备 Figma app key，希望 Agent 能基于 Figma 完成设计解析与资源导出
- 当前可用的 Figma 集成方式：Framelink MCP for Figma，提供 `get_figma_data`、`download_figma_images` 两类工具

## Goals / Non-Goals

- **Goals**
  - 定义并实现一个可复用的「UI 设计」技能，触发场景为：用户希望基于 Figma 做界面还原、规范提取、资源导出等
  - 技能内明确使用 Figma MCP 工具（fileKey、nodeId、导出路径等），并说明 Figma app key / token 的配置方式
  - 与 project.md 中的 UX 设计规范、主题系统衔接，便于产出符合项目规范的说明或资源
- **Non-Goals**
  - 不实现新的 MCP 服务或 Figma API 封装，仅使用现有 MCP 工具与文档
  - 不强制替换现有设计流程，技能为可选能力

## Decisions

- **技能命名与位置**：技能名为 `ui-design-figma`，路径 `.claude/skills/ui-design-figma/`，与现有技能（如 web-automation-testing、frontend-design）并列，便于在 AGENTS.md 的 skills 表中注册
- **MCP 优先**：以 Framelink MCP for Figma 为主要集成方式（get_figma_data、download_figma_images）；若后续接入其它 Figma 工具（如官方 REST API、其它 MCP），在技能 references 中补充说明，与现有 app key 兼容
- **App key 使用方式**：Figma app key（或 MCP 所需的 Personal Access Token）由 MCP 服务或环境变量配置，技能文档中说明「需配置 Figma 访问凭证」及在 Cursor/本项目中配置的位置，不将 key 写入技能仓库
- **与 UX 规范衔接**：技能正文或 references 中引用 `openspec/project.md` 的 UX Design Guidelines、主题/Token 约定，使「从 Figma 到实现」的指引与项目规范一致

## Risks / Trade-offs

- **MCP 可用性**：依赖 Figma MCP 已启用且鉴权成功；若 MCP 未配置或 key 失效，技能仍可提供流程说明，但实际调用需用户自行修复配置
- **能力范围**：当前 MCP 仅覆盖「取数 + 导出图片」，不包含在 Figma 内编辑；复杂设计变更仍依赖设计师在 Figma 内完成，技能侧重「读设计稿并导出/规范」

## Migration Plan

- 无迁移：纯新增技能，不影响现有技能或代码
- 上线后：在 AGENTS.md（或等价技能列表）中登记 `ui-design-figma` 的 name 与 description，便于触发

## Open Questions

- 是否需要在本技能内捆绑「设计规范检查清单」（如色彩、间距、字体与 project.md 一致）为 reference？建议首版以 MCP 使用与 app key 说明为主，规范检查可作为后续增强
