# Change: 新增 API 自动化测试技能（api-automation-testing）

## Why

当前仅有 **web-automation-testing** 技能对前端页面进行 E2E 自动化测试，缺少对后端 API 的专项自动化测试能力。API 测试失败时，需要人工查看后台日志、定位问题、修改代码、重启后台服务后再继续测试，效率低且易遗漏。需要新增 **api-automation-testing** 技能，参照 web-automation-testing 的流程与原则，实现：

1. **API 测试计划与执行**：对后端 API 进行用例编排与 HTTP 请求执行，断言状态码与响应体。
2. **失败时查看后台日志**：API 测试不通过时，自动查看后台日志并产出可供 Agent 分析的摘要。
3. **由 Agent 修改问题并重启后台**：将失败结果与日志摘要交给 Agent；Agent 修改代码后，使用项目标准脚本（`scripts/start/` 目录下）重启后台服务，然后由 Agent 再次发起测试，直到全部通过。

与 web-automation-testing 的差异在于：API 测试不通过时，要**查看后台日志 → 修改问题 → 重启后台服务器 → 继续测试**，后台服务器启动脚本统一参照 `scripts/start/` 目录下的脚本。

## What Changes

- **新增**：api-automation-testing 技能（`.claude/skills/api-automation-testing/`），包含 API 测试计划格式、执行器、失败处理与报告。
- **新增**：API 测试计划结构（base_url、认证方式、test_suites / test_cases，用例步骤为 HTTP 请求：method、path、body、expected status/body）。
- **新增**：API 测试执行器，发送 HTTP 请求并断言，失败时停止并产出 agent_failure_summary（含请求/响应与后台日志摘要）。
- **新增**：失败时自动读取后台日志（日志路径从 `scripts/start/` 下对应启动脚本解析或通过配置映射），并写入失败摘要供 Agent 使用。
- **新增**：与 `scripts/start/` 的集成约定：技能通过项目根下 `scripts/start/` 中的脚本（如 `start-admin-backend.sh`、`start-main-backend.sh`）执行后台服务的启动/重启；日志路径从上述脚本中解析或由配置提供。
- **原则与 web-automation-testing 对齐**：测试失败后终止并将结果交给 Agent；Agent 修改代码并重启后台后再次发起测试；支持从保留现场继续（--resume-from）；可扩展用例直至模块 API 全部覆盖。

## Impact

- **受影响的能力**：新增 capability `api-automation-testing`（本变更内以 ADDED 形式出现在 `specs/api-automation-testing/spec.md`）。
- **受影响的代码/资产**：
  - 新增 `.claude/skills/api-automation-testing/`：SKILL.md、scripts（如 api_test_planner、api_test_executor、log_fetcher、与 scripts/start 的集成）、references。
  - 项目根下 `scripts/start/` 为只读参照，不修改；技能通过读取该目录下的脚本解析日志路径及调用启动/重启。
- **依赖**：
  - 项目根下 `scripts/start/` 目录存在且包含各后端服务的启动脚本（如 `start-admin-backend.sh`、`start-main-backend.sh`）。
  - 后台日志路径可由启动脚本中的输出重定向解析，或由技能配置指定。
