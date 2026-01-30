# Change: 技能存储模型对齐与单表展示流程

## Why

1. **存储模型与 skill-creator 规范不一致**：skill-creator 将技能分为 SKILL.md（必选）与 Bundled Resources（可选：scripts、references、assets），当前数据库为 `skill_definitions` + `skill_resources`，需在规范与文档上明确对应关系，便于理解与扩展。
2. **生成与编辑流程冗长**：AI 生成技能后仍经多步向导展示与编辑，用户希望「生成后直接在一个表中看到并编辑结果」，减少步骤。
3. **编辑与生成体验不统一**：编辑页与生成结果页的展示方式不一致，需统一为同一套单表/单视图交互。
4. **提案与前端测试规范需固化**：涉及前端页面功能的提案须提供自动化测试方案（由 web-automation-testing 技能完成），且测试前对目标模块做需求分析再编写用例；该约定需写入 project.md，测试方案存放于前端项目专有目录。

## What Changes

- **project.md 规范**：在「提案与前端自动化测试」中明确：涉及前端页面功能的提案须提供自动化测试方案，由 web-automation-testing 技能完成；技能执行时先对目标模块/功能点做需求分析，再围绕需求编写用例；测试方案保存在对应前端项目专有目录（如 `admin/frontend/e2e/<feature>/`）。
- **技能存储模型**：明确 skill_definitions 表对应 SKILL.md（metadata + Markdown 指令），skill_resources 表对应 Bundled Resources，通过 resource_type（SCRIPT/REFERENCE/ASSET）区分，与 skill_id 关联。
- **简化生成流程**：AI 生成技能后，在**同一张表/同一视图**中直接展示生成结果（技能主信息 + 可选资源列表），不再分多步向导展示。
- **编辑页与生成页统一**：技能编辑页采用与「生成结果展示」相同的单表/单视图布局与交互，便于用户从生成结果直接进入编辑或从列表进入编辑时体验一致。
- **web-automation-testing 技能**：在技能说明中强化「先需求分析、再围绕需求编写用例」的流程（若已有则保持并确保与 project.md 表述一致）。

## Impact

- **Affected specs**: skill-storage（新增）、skill-creation（修改）
- **Affected code**:
  - `openspec/project.md`：补充/调整提案与前端自动化测试约定
  - `admin/frontend`：技能创建器——AI 生成后单表展示、编辑页与生成页统一为单表视图
  - `admin/backend`：无需新增表；API 可延续现有 skill_definitions + skill_resources，若前端需「生成结果 + 资源」一次性返回可扩展 DTO
  - `.claude/skills/web-automation-testing/SKILL.md`：必要时补充与 project.md 一致的需求分析→用例编写说明
