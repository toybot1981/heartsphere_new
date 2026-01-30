# Change: 提案涉及前端页面功能时须提供自动化测试方案

## Why

当前创建 OpenSpec 提案时，若变更涉及前端页面功能，没有统一要求提供自动化测试方案，导致前端能力上线后缺少可回归的 E2E 用例，回归成本高且易遗漏。需要将「涉及前端页面功能的提案须提供自动化测试方案」固化为项目规范，并由 **web-automation-testing** 技能统一执行；同时在该技能中增加「先做需求分析、再围绕需求编写用例」的流程，并将测试方案资产存放在对应前端项目下的专有目录，便于维护与执行。

## What Changes

- **project.md 增加规范**
  - 在「Project Conventions」或「Testing Strategy」下增加：创建提案时，若变更**涉及前端页面功能**，提案中**必须提供自动化测试方案**；该方案由 **web-automation-testing** 技能完成（编写测试计划、执行、失败交 Agent 修复、扩展直至模块功能全覆盖）；测试方案资产（test_plan.json、README、报告等）保存在**对应前端项目下的专有目录**（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`），不放在项目根或与前端分离的通用 e2e 根目录。
- **web-automation-testing 技能增强**
  - 在技能中增加明确流程：对**待编写用例的模块或功能点**先进行**需求分析**（从提案/需求文档/页面实现中提取功能点与验收条件），再**围绕需求**开展用例编写（test plan 中的 requirements、test_suites、test_cases 与需求对应）；在 SKILL.md 或 references 中固化该流程，便于 Agent 与人工按同一标准执行。
- **OpenSpec 流程衔接**
  - 在 AGENTS.md 的「Create tasks.md」或 Best Practices 中注明：涉及前端页面功能的提案，tasks.md 中须包含「提供自动化测试方案」类任务，且测试方案由 web-automation-testing 技能完成、资产存放于前端项目专有目录。

## Impact

- **受影响的能力**：新增 capability `proposal-conventions`（本变更内以 ADDED 形式出现在 `specs/proposal-conventions/spec.md`），约束提案创建与测试方案产出。
- **受影响的文档/资产**：
  - `openspec/project.md`：新增「提案与前端自动化测试」规范段落。
  - `openspec/AGENTS.md`：在 Create tasks.md / Best Practices 中增加前端 E2E 测试方案要求说明。
  - `.claude/skills/web-automation-testing/SKILL.md`（及可选 references）：增加「需求分析 → 围绕需求编写用例」的流程与说明；可选增加「测试方案存放于前端项目专有目录」的约定。
- **依赖与前置**：
  - 现有 web-automation-testing 技能（test_planner、test_executor、test_runner 等）可用。
  - 各前端项目具备可挂载 e2e 专有目录的约定（如 `admin/frontend/e2e/`、`main/frontend/e2e/`）。
