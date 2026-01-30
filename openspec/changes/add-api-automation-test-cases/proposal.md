# Change: 编写对应 API 的自动化测试用例

## Why

api-automation-testing 技能已就绪，具备测试计划格式、执行器、失败时查看后台日志与重启约定，但项目中尚未系统化地**编写并落地**关键 API 的自动化测试用例。需要为与当前功能对应的关键 API（如 Main 技能执行、Admin 技能管理等）编写可执行的测试计划，并遵循「先对目标模块做需求分析，再围绕需求编写用例」的流程，将测试资产存放在对应后端项目专有目录，由 api-automation-testing 技能执行与维护。

## What Changes

- **新增**：为 Main 后端「技能执行」相关 API（如 `POST /api/skills/execute`、`POST /api/skills/execute/stream`）编写 API 自动化测试计划（api_test_plan.json），存放于 `main/backend/api-tests/skill-execution/`（或项目约定的同级目录）。
- **新增**：为 Admin 后端「技能管理」核心 API（如技能列表、详情、content-search、创建/更新等）编写 API 自动化测试计划，存放于 `admin/backend/api-tests/skills/`（或项目约定的同级目录）。
- **新增**：各测试目录下提供 README，说明模块需求摘要、用例覆盖范围、执行方式（含 base_url、认证、scripts/start 对应服务名）及与 api-automation-testing 技能的衔接。
- **流程约定**：编写用例前先对目标 API 模块进行需求分析（接口职责、入参出参、关键路径与边界），再围绕需求编写用例；执行由 api-automation-testing 技能完成，失败时按技能约定查看后台日志、交 Agent 修复并重启后再测，直至通过。

## Impact

- **受影响的能力**：api-automation-testing（本变更在 `specs/api-automation-testing/spec.md` 中 ADDED「关键 API 测试计划与用例」相关要求）。
- **受影响的代码/资产**：
  - 新增 `main/backend/api-tests/skill-execution/`：api_test_plan.json、README 等。
  - 新增 `admin/backend/api-tests/skills/`：api_test_plan.json、README 等。
  - 不修改 `.claude/skills/api-automation-testing/` 技能实现；仅使用其计划格式与执行器。
- **依赖**：
  - api-automation-testing 技能已存在且可用。
  - 各后端服务可由 `scripts/start/` 下脚本启动，日志路径可解析或配置。
