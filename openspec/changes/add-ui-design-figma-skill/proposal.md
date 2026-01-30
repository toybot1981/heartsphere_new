# Change: 新增基于 Figma 的 UI 设计技能

## Why

项目需要统一的 UI 设计工作流，使 Agent 能够基于 Figma 设计稿完成界面还原、设计规范提取和资源导出。用户已具备 Figma app key，希望通过 Figma MCP（如 Framelink MCP for Figma）或其它 Figma 工具，将「从设计到实现」的能力固化为可复用的技能，便于在页面开发、组件实现、设计走查等场景中一致使用。

## What Changes

- **ADDED**: 新增 **ui-design-figma** 技能（位于 `.claude/skills/ui-design-figma/`）
  - 技能通过 Figma MCP（如 Framelink MCP）或其它 Figma 工具，完成设计稿数据获取、节点信息解析、图片/图标导出等能力
  - 技能文档中明确 Figma app key（或等效 token）的配置与使用方式，与现有 MCP 鉴权约定一致
  - 提供「从 Figma 到代码/规范」的流程指引：解析设计稿 → 提取布局与样式 → 导出资源 → 对齐项目 UX 规范（如 project.md 中的 UX Design Guidelines）
- **ADDED**: 技能能力与规范
  - 使用 MCP 工具：`get_figma_data`（获取文件/节点结构、布局、内容与组件信息）、`download_figma_images`（按节点导出 SVG/PNG 到项目目录）
  - 可选：引用或说明其它 Figma 相关工具（插件、REST API 等），与现有 app key 兼容
  - 技能遵循 skill-creator 所描述的技能结构：SKILL.md（frontmatter + 正文）、可选 references/、scripts/、assets/

## Impact

- **Affected specs**: 新增 capability `ui-design-figma-skill`（本变更内以 ADDED 形式出现在 `specs/ui-design-figma-skill/spec.md`），约定 UI 设计技能提供的能力与使用方式
- **Affected code / 资产**:
  - `.claude/skills/ui-design-figma/`：新建技能目录，含 SKILL.md、可选 references（如 Figma MCP 工具说明、app key 配置）、可选脚本或模板
- **依赖与前置**:
  - 已启用 Figma 相关 MCP（如 Framelink MCP for Figma），且提供 `get_figma_data`、`download_figma_images` 等工具
  - 用户已具备 Figma app key（或 MCP 所需 token），用于访问 Figma 文件与导出资源
