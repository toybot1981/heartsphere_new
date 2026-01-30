## 1. 技能骨架与元数据

- [x] 1.1 创建技能目录 `.claude/skills/ui-design-figma/`
- [x] 1.2 编写 `SKILL.md` 的 YAML frontmatter：`name`、`description`，description 中明确触发场景（基于 Figma 做 UI 设计、界面还原、设计稿解析、资源导出等）及「通过 Figma MCP 或其它 Figma 工具完成」
- [x] 1.3 在 `SKILL.md` 正文中说明：优先使用 Figma MCP（如 Framelink MCP）的 `get_figma_data`、`download_figma_images`；何时触发技能、典型工作流（获取 fileKey/nodeId → 解析设计稿 → 导出资源 → 对齐项目 UX 规范）

## 2. Figma 访问与工具说明

- [x] 2.1 在技能内（SKILL.md 或 references）说明 Figma app key（或 MCP 所需 token）的配置方式，不写入具体 key；注明在 Cursor/本项目中配置 MCP 或环境变量的位置
- [x] 2.2 编写 MCP 工具使用说明（references）：`get_figma_data`（fileKey、nodeId、depth）、`download_figma_images`（fileKey、nodes、localPath、pngScale）的参数与典型用法，以及 fileKey/nodeId 从 Figma URL 的获取方式

## 3. 与项目规范衔接

- [x] 3.1 在技能中引用 `openspec/project.md` 的 UX Design Guidelines、主题/多风格约定，说明从 Figma 导出或还原时需对齐的规范要点（色彩变量、间距、字体等）
- [x] 3.2 可选：新增 `references/figma-to-ux-checklist.md` 或等价清单，便于 Agent 做设计走查或还原自检

## 4. 验证与注册

- [x] 4.1 运行 `openspec validate add-ui-design-figma-skill --strict` 通过
- [x] 4.2 在 AGENTS.md 的 skills 表中登记 `ui-design-figma`（name + description），确保触发描述涵盖「Figma、UI 设计、设计稿、界面还原、资源导出」等关键词
