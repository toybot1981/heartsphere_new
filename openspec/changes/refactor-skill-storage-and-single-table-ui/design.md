# 技能存储与单表 UI 设计

## Context

- skill-creator 规范：技能 = SKILL.md（必选）+ Bundled Resources（可选：scripts、references、assets）。
- 现有库表：`skill_definitions`（含 name、description、skill_content 等）、`skill_resources`（含 skill_id、resource_type、resource_name、resource_content 等），且 resource_type 已支持 SCRIPT/REFERENCE/ASSET。
- 用户诉求：AI 生成后在一处看到全部结果并编辑，编辑页与生成页一致。

## Goals / Non-Goals

- **Goals**：明确 DB 与 SKILL.md/Bundled Resources 的对应关系；AI 生成后单表/单视图展示；编辑页与生成页统一为同一套单表 UI。
- **Non-Goals**：不新增表、不迁移表名（保留 skill_definitions、skill_resources）；不改变现有 API 路径语义，仅可能扩展响应结构。

## Decisions

### 1. 存储模型对应关系

| skill-creator 概念 | 数据库 | 说明 |
|--------------------|--------|------|
| SKILL.md（必选） | `skill_definitions` | 一行一条技能 |
| ├─ YAML frontmatter（metadata） | `name`, `description` 及现有元数据字段 | 触发与展示用 |
| └─ Markdown instructions | `skill_content`（TEXT） | 完整 SKILL.md 正文（可含 frontmatter+body 或仅 body，由实现约定） |
| Bundled Resources（可选） | `skill_resources` | 与 `skill_definitions.skill_id` 关联 |
| ├─ scripts/ | `resource_type = 'SCRIPT'` | 可执行脚本等 |
| ├─ references/ | `resource_type = 'REFERENCE'` | 参考文档 |
| └─ assets/ | `resource_type = 'ASSET'` | 模板、图标等 |

- **单表 vs 三表**：采用**单表** `skill_resources` + `resource_type` 区分，与现有实现一致，无需拆成三张表。
- **关联**：`skill_resources.skill_id` → `skill_definitions.skill_id`（外键已存在）。

### 2. 单表展示与编辑 UI

- **「单表」含义**：一个页面/一个主视图内，展示并可编辑「当前技能」的完整信息：技能元数据（name、description、skill_content 等）+ 资源列表（scripts/references/assets）。
- **生成后**：AI 生成完成后，直接进入上述单表视图（不再经过多步向导），展示生成结果；用户可在同一视图编辑后保存。
- **编辑页**：从列表或其它入口进入「编辑」时，使用与「生成结果展示」相同的单表视图与布局，仅数据来源为已有技能。
- **实现建议**：可复用同一组件（如 `SkillSingleTableView` 或等价命名），生成流程在生成完成后跳转/切换到该视图并填入数据；编辑流程直接加载该视图。

### 3. 前端自动化测试与 project.md

- **project.md**：在 Testing Strategy / 提案与前端自动化测试 中增加或明确：
  - 涉及前端页面功能的提案须提供自动化测试方案；
  - 方案由 web-automation-testing 技能完成；
  - 技能执行时先对目标模块/功能点做需求分析，再围绕需求编写用例；
  - 测试方案保存在对应前端项目专有目录（如 `admin/frontend/e2e/<feature>/`）。
- **web-automation-testing**：技能内已有「需求分析 → 围绕需求编写用例」的，保持与 project.md 表述一致；若无则补充。

## Risks / Trade-offs

- **单表视图信息量大**：技能 + 多条资源可能使首屏较长，可通过折叠、分块或 Tab（元数据 / 资源列表）缓解，具体由前端实现决定。
- **与现有向导共存**：若保留「手动分步创建」入口，可与单表视图并存：生成/导入走单表，纯手动可选择向导或单表，由产品决定。

## Migration Plan

- 无表结构变更，无需数据迁移。
- 前端：新增或重构为单表视图组件，生成完成后跳转至该视图；编辑页改为使用同一视图。
- project.md 与 web-automation-testing 技能：文档与说明增补，无破坏性变更。

## Open Questions

- 无。
