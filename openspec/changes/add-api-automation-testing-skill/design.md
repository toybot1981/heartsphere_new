# Design: API 自动化测试技能

## Context

- 已有 **web-automation-testing** 技能：基于 Playwright 的 E2E、失败后交 Agent 修复、支持日志检查与服务重启（使用 `scripts/start/`）。
- 需要 **API 自动化测试**：针对后端 REST API 的 HTTP 请求测试；失败时需查看**后台日志**、由 Agent **修改代码**、**重启后台服务**后再继续测试。
- 后台启动与日志约定：项目统一使用 `scripts/start/` 下脚本（如 `start-admin-backend.sh`）启动/重启服务，日志路径可从脚本内重定向解析（与 web-automation-testing 的 service_config / log 解析一致）。

## Goals / Non-Goals

- **Goals**
  - 提供与 web-automation-testing 同构的「计划 → 执行 → 失败交 Agent → 修复并重启后台 → 再测」流程。
  - 失败时自动采集后台日志并写入 agent_failure_summary，供 Agent 定位问题。
  - 后台重启统一使用 `scripts/start/` 下脚本，日志路径从脚本解析或配置读取。
  - 支持 --resume-from 从保留现场继续、扩展用例直至模块 API 覆盖。
- **Non-Goals**
  - 不实现前端 UI 自动化（由 web-automation-testing 负责）。
  - 不修改 `scripts/start/` 内脚本逻辑，仅读取并调用。

## Decisions

- **技能名称与位置**：`api-automation-testing`，资产位于 `.claude/skills/api-automation-testing/`（SKILL.md、scripts、references）。
- **测试计划格式**：JSON，包含 `base_url`、`auth`（如 Bearer token 或无需认证）、`test_suites` / `test_cases`；每个用例步骤为一条 API 请求（method, path, body 可选）及期望（status_code, body 或 body 片段）。
- **执行器**：独立脚本（如 Python）发送 HTTP 请求（requests 或 httpx），按步骤断言；任一步失败则停止，写出 `agent_failure_summary.md`（含请求/响应与后台日志摘要）及可选 `test_run_state.json`（用于 --resume-from）。
- **后台日志**：从 `scripts/start/` 对应启动脚本解析日志路径（复用与 web-automation-testing 相同的解析规则，如 `$PROJECT_ROOT/admin-backend.log`）；若解析不到则由配置表指定。失败时读取最近 N 行或基于时间窗口写入摘要。
- **重启后台**：调用项目根下 `scripts/start/start-xxx-backend.sh`（由 base_url 或计划中声明的 backend 服务名映射），不实现通用进程管理，仅通过现有脚本启动/重启。
- **与 Agent 的协作**：失败即终止；Agent 根据 agent_failure_summary 修改代码并执行 `scripts/start/` 下脚本重启后台，再由 Agent 重新运行 API 测试（或 --resume-from）；不在此技能内自动改代码或自动重试（与 web 的「默认不 auto-fix-retry」一致）。

## Risks / Trade-offs

- **日志路径因项目/脚本而异**：通过「从脚本解析 + 配置兜底」降低差异；文档中说明各项目日志路径约定。
- **多后端服务**：计划中可声明被测 backend 服务名（如 admin-backend），技能只重启该服务；若未声明则可由 base_url 推断（如 8085 → admin-backend）。

## Open Questions

- 测试资产（api_test_plan.json、results、report）存放位置：建议与后端项目同仓的专有目录（如 `admin/backend/api-tests/<feature>/` 或项目根 `api-tests/<project>/`），在 SKILL.md 与 tasks 中明确。
