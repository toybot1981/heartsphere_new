# Design: 提案与前端 E2E 测试方案规范

## Context

- OpenSpec 提案创建时，若涉及前端页面功能，目前无强制要求提供自动化测试方案。
- web-automation-testing 技能已有完整执行与修复流程，但未明确「先需求分析、再写用例」以及「测试资产存放位置」的约定。
- 项目内已有示例：技能管理测试资产放在 `admin/e2e/skill-management/`（与 admin 前端相关但不在 frontend 下）；用户希望测试方案保存在**前端项目如 frontend 下的专有目录**，便于与前端代码同仓、同发布。

## Goals / Non-Goals

- **Goals**
  - 提案涉及前端页面功能时，必须提供自动化测试方案，且由 web-automation-testing 技能完成。
  - 技能执行测试前，先对目标模块/功能点做需求分析，再围绕需求编写用例。
  - 测试方案资产存放在对应前端项目下的专有目录（如 `admin/frontend/e2e/<feature>/` 或 `main/frontend/e2e/<feature>/`）。
- **Non-Goals**
  - 不改变现有 test_planner / test_executor / test_runner 的 CLI 与 JSON 格式。
  - 不强制已有 e2e 目录（如 `admin/e2e/`）迁移到 frontend 下；新方案优先采用 frontend 下专有目录，旧资产可逐步迁移或保留。

## Decisions

- **测试方案存放位置**：约定为「对应前端项目下的专有目录」。例如：
  - Admin 前端：`admin/frontend/e2e/<feature>/`（如 `admin/frontend/e2e/skill-management/`）。
  - Main 前端：`main/frontend/e2e/<feature>/`。
  - 若项目结构为单 frontend 根（如仅 `frontend/`），则为 `frontend/e2e/<feature>/`。
  - 这样测试计划、README、results、report 与前端代码同仓，便于版本一致与 CI 挂载。
- **需求分析再写用例**：在 web-automation-testing 技能中规定，编写或扩展用例前必须先对目标模块/功能点做需求分析（从提案、需求文档或页面实现中提取功能点与验收条件），再根据需求填写 test plan 的 requirements、test_suites、test_cases，避免用例与需求脱节。
- **规范写入 project.md**：在 project.md 的「Project Conventions」或「Testing Strategy」中新增小节「提案与前端自动化测试」，与现有「测试覆盖原则」等并列，便于 Agent 与人在创建提案时查阅。

## Risks / Trade-offs

- **目录迁移**：若已有 e2e 资产在 `admin/e2e/` 等非 frontend 下，本规范不强制立即迁移；新提案产生的测试方案优先放在 frontend 下，旧资产可在后续变更中逐步迁移。
- **技能执行路径**：test_runner/test_executor 接受 plan 文件路径，无论 plan 在 `admin/e2e/` 还是 `admin/frontend/e2e/` 均可；仅约定新方案存放位置，不改变执行器逻辑。

## Migration Plan

1. 合并本提案后，更新 project.md、AGENTS.md 与 web-automation-testing SKILL.md。
2. 新创建的、涉及前端页面功能的提案，在 tasks.md 中显式包含「提供自动化测试方案」任务，并指向 frontend 下 e2e 目录。
3. 已有 e2e 目录（如 admin/e2e/skill-management）可保留；新功能按新约定使用 admin/frontend/e2e/<feature>/。

## Open Questions

- 无。若后续希望统一将现有 admin/e2e 迁至 admin/frontend/e2e，可单独开变更。
