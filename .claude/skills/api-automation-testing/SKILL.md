---
name: api-automation-testing
description: "API automation testing: plan and execute HTTP tests; on failure stop, capture backend logs, hand result to Agent to fix and restart backend (using scripts/start/), then Agent re-runs until all pass. Aligned with web-automation-testing principles: fail → hand to Agent → Agent fixes code and restarts backend → re-run (optionally --resume-from)."
---

# API Automation Testing

API 自动化测试：编排并执行后端 API 的 HTTP 请求用例；失败时停止、采集后台日志、将结果交给 Agent 分析并修复，由 Agent 使用项目标准脚本（`scripts/start/`）重启后台后再次发起测试，直到全部通过。

## 与 web-automation-testing 的异同

- **相同**：计划 → 执行 → 失败即终止并交付结果 → Agent 修复后再测；支持 `--resume-from` 从保留现场继续；可扩展用例直至模块覆盖。
- **不同**：API 测试不通过时，要**查看后台日志 → Agent 修改代码 → 重启后台服务器 → 继续测试**。后台服务器启动/重启统一使用项目根下 **`scripts/start/`** 目录中的脚本（如 `start-admin-backend.sh`、`start-main-backend.sh`），不在此技能内自动重启，由 Agent 或用户执行脚本后再次运行测试。

## 完整流程（API 测试不通过时）

1. **执行 API 测试** → 某用例或步骤失败。
2. **查看后台日志**：执行器自动读取被测后台的日志（路径从 `scripts/start/` 下对应启动脚本解析或由计划/配置指定），将最近若干行写入 `agent_failure_summary.md`。
3. **交付结果**：输出 `agent_failure_summary.md`（含请求、响应、错误信息、后台日志摘要）及 `test_run_state.json`，交给 Agent。
4. **Agent 修改问题**：根据摘要修改后台代码。
5. **重启后台**：Agent 或用户执行 `scripts/start/start-<backend>.sh`（如 `./scripts/start/start-admin-backend.sh`），等待服务就绪。
6. **继续测试**：Agent 再次运行 API 测试（或使用 `--resume-from test_run_state.json` 从失败用例继续）。
7. 重复 2–6 直到所有用例通过。

## 后台服务器启动脚本（scripts/start/）

后台服务的启动与重启**仅**通过项目根下 `scripts/start/` 目录中的脚本进行，技能不修改这些脚本，只读取以解析日志路径，或由 Agent 调用以重启服务。

| 服务名         | 启动脚本                           | 典型日志路径（以项目根为基准） |
|----------------|------------------------------------|--------------------------------|
| admin-backend  | start-admin-backend.sh             | admin-backend.log              |
| main-backend   | start-main-backend.sh              | main/backend-backend.log 等    |
| edu-backend    | start-edu-backend.sh               | edu-backend.log                |
| company-backend| start-company-backend.sh           | company-backend.log            |
| mentis-backend | start-mentis-backend.sh            | mentis-backend.log             |
| psychology-mentor-backend | start-psychology-mentor-backend.sh | psychology-mentor-backend.log  |

实际日志路径以各启动脚本中的输出重定向为准（如 `> "$PROJECT_ROOT/admin-backend.log"`）。详见 `references/service_configuration.md`。

## 编写用例流程（需求分析 → 围绕需求编写用例）

与 `openspec/project.md` 及 `web-automation-testing` 技能一致：编写或扩展 API 用例时，先对**待测模块或接口**做需求分析，再围绕需求编写用例。

1. **需求分析**：从接口文档、提案或实现中提取接口契约与验收条件（请求方法、路径、参数、期望状态码与响应要点）。
2. **与测试计划对应**：将分析结果体现在测试计划的 `metadata`、`requirements` 或等价结构中；`test_suites`、`test_cases` 与接口/模块对应，覆盖正常路径与关键错误分支。
3. **可追溯**：每个用例可追溯到至少一个接口或验收条件；套件划分与模块或领域一致。

## 测试资产存放位置

建议将 API 测试相关资产放在**对应后端项目下的专有目录**或**项目根下统一目录**，例如：

- **按后端项目**：`admin/backend/api-tests/<feature>/`、`main/backend/api-tests/<feature>/`
- **按项目根**：`api-tests/admin/`、`api-tests/main/`

目录内建议包含：

- `api_test_plan.json`：测试计划
- `results.json`：最近一次执行结果
- `report.md` / `report.html`：报告
- `agent_failure_summary.md`：失败时产出，供 Agent 使用
- `test_run_state.json`：现场状态，用于 `--resume-from`

详见 `references/asset_locations.md`。

## Quick Start

**执行测试（失败即终止，结果交 Agent）：**
```bash
python scripts/api_test_executor.py api_test_plan.json --output results.json
```

**从保留现场继续（修改用例或修复后台后）：**
```bash
python scripts/api_test_executor.py api_test_plan.json --output results.json --resume-from test_run_state.json
```

**生成报告：**
```bash
python scripts/report_generator.py results.json markdown report.md
```

**（可选）重启后台后再测：**
```bash
python scripts/restart_backend.py admin-backend
# 等待就绪后
python scripts/api_test_executor.py api_test_plan.json --output results.json --resume-from test_run_state.json
```

## 测试计划格式

- **base_url**：API 根地址（如 `http://localhost:8085`）
- **backend_service**（可选）：被测后台服务名（如 `admin-backend`），用于解析日志路径；不填则可由 base_url 推断
- **auth**（可选）：`bearer`（从环境变量 `API_TEST_TOKEN` 读取）或 `none`
- **test_suites** / **test_cases**：每个用例的 **steps** 为 API 请求步骤
  - **method**：GET / POST / PUT / PATCH / DELETE
  - **path**：相对 base_url 的路径（如 `/api/admin/health`）
  - **body**（可选）：JSON 请求体
  - **expected_status**：期望 HTTP 状态码（如 200）
  - **expected_body_contains**（可选）：响应体需包含的字符串或键路径
- **save_token_path**（可选）：从本步响应 JSON 中按路径（如 `data.token`）提取 token，并在**同一计划内后续步骤**自动作为 `Authorization: Bearer <token>` 携带；用于「先登录取 token，再调用需认证接口」的串联用例。

详见 `references/test_plan_template.md`。

## Scripts

- `api_test_planner.py`：创建/编辑 API 测试计划
- `api_test_executor.py`：执行计划，失败时写 agent_failure_summary 与 test_run_state，支持 --resume-from
- `report_generator.py`：根据 results 生成 Markdown/HTML 报告
- `restart_backend.py`：（可选）按服务名调用 `scripts/start/start-<name>.sh` 并等待就绪

## References

- `references/test_plan_template.md`：计划结构与示例
- `references/service_configuration.md`：各 backend 服务名、启动脚本与日志路径约定
- `references/asset_locations.md`：测试资产目录与命名约定
