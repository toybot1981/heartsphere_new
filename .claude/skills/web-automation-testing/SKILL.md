---
name: web-automation-testing
description: "Web automation testing: plan, execute; on failure stop and hand result to Agent to fix, then Agent re-runs until all pass. Principles: (0) 测试用例出现错误后，应将错误反馈给 Agent，Agent 修改成功后继续测试；(1) 测试失败后终止交给 Agent 分析并修复，再由 Agent 发起测试直到全部通过；(2) 不断扩展用例，直到功能模块所有功能全部测试成功为止；(3) 测试不要从头开始，先保留现场；若是测试用例问题，修改用例后从保留的现场继续测试（--resume-from）。"
---

# Web Automation Testing

Complete framework for planning, executing, fixing, and reporting on web application tests. Supports continuous test execution with automatic failure fixing, service log checking, and automatic service restart until all tests pass or manually interrupted.

## 基本原则 (Fundamental Principles)

- **测试用例出现错误后，应将错误反馈给 Agent；Agent 修改成功后，由 Agent 继续（或重新发起）测试。**  
  即：失败 → 反馈给 Agent → Agent 分析并修复（测试计划或被测应用）→ 修复后由 Agent 再次运行测试，直到全部通过。

- **测试失败后终止，将结果交给 Agent 分析并修复，再由 Agent 发起下一轮测试，直到全部通过。**  
  执行测试时，若用例失败，**立即终止**（不在此进程中自动修复、不自动重试）。将失败结果（agent_failure_summary.md、cursor_analysis/、报告）交给 **Agent**；由 Agent 根据失败原因分析并修复（测试计划或被测应用），修复完成后**由 Agent 再次发起测试**。重复「运行 → 失败则交给 Agent 修复 → 再运行」直到所有用例成功。如需由脚本自动修复并重试，可显式使用 `--auto-fix-retry`。

- **不断扩展用例，直到功能模块所有功能全部测试成功为止。**  
  对目标功能模块，先覆盖核心路径，再按模块内步骤/入口逐项补充用例（如向导每一步、列表的增删改查、不同创建方式等）；每轮扩展后重新执行完整测试，失败则按上一条交给 Agent 分析修复再跑，直到该模块所有功能均有用例且全部通过。

- **测试不要从头开始，先保留现场；若是测试用例问题，修改用例后从保留的现场继续测试。**  
  用例失败后**不重新从头跑全量**：执行器会写出**现场状态**（`test_run_state.json`，默认在测试计划同目录），记录已通过用例与失败用例。若为测试用例问题，由 Agent 修改测试计划或步骤后，使用 `--resume-from test_run_state.json` 再次运行，**跳过已通过用例，只从失败用例起执行**，避免重复跑已通过用例。用法：`python scripts/test_runner.py <plan> --report <report> --resume-from <计划同目录>/test_run_state.json`；或直接使用 `python scripts/test_executor.py <plan> --output <out> --resume-from <state>`。

## 编写用例流程（需求分析 → 围绕需求编写用例）

本流程与 `openspec/project.md` 中「提案与前端自动化测试」约定一致：技能执行时先对目标模块/功能点进行需求分析，再围绕需求开展用例编写。

编写或扩展自动化用例时，须先对**待编写用例的模块或功能点**进行**需求分析**，再**围绕需求**开展用例编写：

1. **需求分析**：从提案、需求文档或页面实现中提取功能点与验收条件（入口、步骤、预期结果）。
2. **与 test plan 对应**：将分析结果体现在 test plan 的 `metadata`、`requirements` 或等价结构中；`test_suites`、`test_cases` 与上述需求对应，覆盖核心路径与关键分支。
3. **可追溯**：每个用例应能追溯到至少一个功能点或验收条件；`test_suites` 的划分与功能模块或用户流程一致。

## 测试方案存放位置

- 测试方案资产（test_plan.json、README、results、report）应保存在**对应前端项目下的专有目录**，与前端代码同仓。
- **Admin 前端**：`admin/frontend/e2e/<feature>/`（如 `admin/frontend/e2e/skill-management/`）。
- **Main 前端**：`main/frontend/e2e/<feature>/`。
- 若项目结构为单 frontend 根，则为 `frontend/e2e/<feature>/`。
- 目录内应包含 README，说明如何从项目根或技能目录调用 test_runner / test_executor 及报告生成方式。详见 `references/frontend_e2e_directory_convention.md`。

## Quick Start

**Complete workflow (recommended - continuous testing):**
```bash
python scripts/test_runner.py test_plan.json --report report.json
```

**With iteration limit:**
```bash
python scripts/test_runner.py test_plan.json --max-iterations 10 --report report.json
```

**With server management:**
```bash
python scripts/run_with_server.py test_plan.json --server "npm run dev" --port 5173
```

## Workflow Overview

```
1. Create Test Plan → 2. Generate Test Cases → 3. Execute Tests → 
4. Check Service Logs → 5. Fix Service Issues → 6. Analyze Test Failures → 
7. Apply Test Fixes → 8. Retry → 9. Generate Report
```

The framework automatically iterates steps 3-8 until all tests pass, manually interrupted (Ctrl+C), or ineffective fixes are detected. The framework now includes:
- **Service log checking**: Automatically checks frontend and backend logs when tests fail
- **Service auto-restart**: Restarts services using project standard startup scripts
- **Continuous testing**: Runs until success without manual intervention
- **Graceful interruption**: Supports Ctrl+C to stop and save state

## Core Components

### 1. Test Planning (`test_planner.py`)

Create structured test plans from requirements.

**Create a new test plan:**
```bash
python scripts/test_planner.py create http://localhost:3000 "Login functionality" plan.json
```

**Add test suite:**
```bash
python scripts/test_planner.py add-suite plan.json "Authentication" "Tests for login and auth"
```

**Add test case:**
```bash
python scripts/test_planner.py add-case plan.json suite_1 "Login Test" "Test user login" "User should be logged in"
```

**Programmatic usage:**
```python
from scripts.test_planner import create_test_plan, add_test_suite, add_test_case, save_plan

plan = create_test_plan("http://localhost:3000", "Login tests", [])
suite_id = add_test_suite(plan, "Authentication", "Login tests")
add_test_case(plan, suite_id, "Valid Login", "Test valid credentials", 
              ["navigate to http://localhost:3000/login", 
               "type 'user' in #username",
               "type 'pass' in #password",
               "click #login-button",
               "verify text=Dashboard"],
              "User logged in successfully")
save_plan(plan, "plan.json")
```

See `references/test_plan_template.md` for plan structure and `references/test_case_patterns.md` for common patterns.

### 2. Test Execution (`test_executor.py`)

Execute test cases using Playwright.

**Basic execution:**
```bash
python scripts/test_executor.py plan.json --output results.json
```

**With visible browser:**
```bash
python scripts/test_executor.py plan.json --no-headless --output results.json
```

**Programmatic usage:**
```python
from scripts.test_executor import TestExecutor

executor = TestExecutor("plan.json", headless=True)
results = executor.run_all_tests("results.json")
```

The executor:
- Navigates to the application URL (uses `domcontentloaded` and timeouts to avoid hanging on SPAs)
- **Serial execution**: Runs test cases one by one; only when the current case passes does it proceed to the next
- **Stop on first failure**: If a case or step fails, remaining cases are marked skipped and execution returns; on failure writes **agent_failure_summary.md** (next to results) for the agent to fix and re-run
- Executes each test case step by step (steps are also serial; step failure stops that case)
- Captures screenshots on completion (and on failure)
- Records detailed results for each step (including `started_at`, `completed_at`, `duration_ms` per case/step)
- On step failure: collects page context (URL, title, visible text, DOM snippet) and writes it to the case result
- Supports **database verification steps** (`verify database:` / `check database:` with SELECT and optional `expect <value>`)
- Generates **Cursor 分析工件** for failed cases (Markdown + optional JSON) for use in Cursor
- **Test process tracking**: Progress output (`[Case M/T] case_id: name - Step S/T: description`), timeline events in result JSON, and **content anomaly detection** after verify/check steps (error keywords, empty/placeholder); anomalies generate Cursor analysis and mark case as `passed_with_warnings`. See `references/test_process_tracking.md`.
- Handles errors gracefully

### 3. Automatic Fixing (`test_fixer.py`)

Analyze failures and automatically apply fixes to test cases and services.

**New Features:**
- **Service Log Checking**: Automatically checks frontend and backend service logs when tests fail
- **Service Auto-Restart**: Restarts services using project standard startup scripts (`scripts/start/`)
- **Log Path Parsing**: Automatically parses log paths from startup scripts

**Analyze failures:**
```bash
python scripts/test_fixer.py plan.json results.json
```

**Auto-fix and save:**
```bash
python scripts/test_fixer.py plan.json results.json --output plan_fixed.json
```

**Programmatic usage:**
```python
from scripts.test_fixer import TestFixer

fixer = TestFixer("plan.json", "results.json")
failures = fixer.analyze_failures()
summary = fixer.auto_fix_all(check_logs=True)  # Enable log checking
fixer.save_updated_plan("plan_fixed.json")
```

Fix types:
- **Service Restart**: Restarts services when port conflicts or crashes detected
- **Selector Update**: Improves element selectors
- **Wait Condition**: Adds explicit waits for dynamic content
- **Interaction Fix**: Adds visibility checks and scrolls

See `references/fix_strategies.md` for detailed fix strategies.

### 4. Test Runner (`test_runner.py`)

Orchestrates the complete workflow: execute → check logs → fix services → fix tests → retry → report.

**New Features:**
- **Default: stop on failure and hand result to Agent** — 测试失败后终止，不自动修复、不自动重试；将结果（agent_failure_summary.md、cursor_analysis/、报告）交给 Agent 分析并修复，修复后由 Agent 再次发起测试，直到全部通过。
- **Optional auto-fix retry**: `--auto-fix-retry` — 失败后由脚本自动修复并重试，直到全部通过。
- **Graceful Interruption**: Supports Ctrl+C to stop and save state
- **Ineffective Fix Detection**: When using `--auto-fix-retry`, stops if same fixes applied multiple times

**Run tests (default: stop on failure, hand to Agent to fix then re-run):**
```bash
python scripts/test_runner.py plan.json --report final_report.json
```
失败即终止，将结果交给 Agent 分析并修复后再重新运行测试。

**从保留现场继续（修改用例后只从失败用例起跑，不从头跑）：**
```bash
python scripts/test_runner.py plan.json --report final_report.json --resume-from <计划同目录>/test_run_state.json
```
失败后会在测试计划同目录生成 `test_run_state.json`；修复用例后使用 `--resume-from` 跳过已通过用例，从失败用例继续执行。

**Auto-fix and retry (script fixes and retries until all pass):**
```bash
python scripts/test_runner.py plan.json --report final_report.json --auto-fix-retry --max-iterations 10
```

**With visible browser:**
```bash
python scripts/test_runner.py plan.json --no-headless
```

**Programmatic usage:**
```python
from scripts.test_runner import TestRunner

runner = TestRunner("plan.json", max_iterations=1000)  # Default: continuous
report = runner.run(headless=True)
runner.print_report()
runner.save_report("report.json")
```

The runner:
1. Executes all test cases
2. Checks service logs if tests fail
3. Restarts services if needed (using `scripts/start/` scripts)
4. Analyzes test failures
5. Applies automatic fixes to test cases
6. Updates test plan
7. Re-executes tests
8. Repeats until all pass, interrupted (Ctrl+C), or ineffective fixes detected
9. Generates final report with service fix history

### 5. Report Generation (`report_generator.py`)

Generate human-readable test reports. Reports include a **测试过程时间线** (test process timeline) section when timeline data is present, and a **Passed with Warnings (内容异常)** section for cases that passed but had content anomalies (with links to Cursor analysis artifacts).

**Generate markdown report:**
```bash
python scripts/report_generator.py report.json markdown report.md
```

**Generate HTML report:**
```bash
python scripts/report_generator.py report.json html report.html
```

**Programmatic usage:**
```python
from scripts.report_generator import ReportGenerator
import json

with open("report.json") as f:
    data = json.load(f)

generator = ReportGenerator(data)
generator.save_markdown("report.md")
generator.save_html("report.html")
```

### 6. Server Management (`run_with_server.py`)

Run tests with automatic server lifecycle management.

**Single server:**
```bash
python scripts/run_with_server.py plan.json --server "npm run dev" --port 5173
```

**With custom iterations:**
```bash
python scripts/run_with_server.py plan.json --server "npm run dev" --port 5173 --max-iterations 3
```

The script:
- Starts the server
- Waits for it to be ready
- Runs tests
- Stops the server on completion

## Test Step Syntax

Test steps use natural language patterns:

- **Navigation**: `navigate to <URL>`
- **Click**: `click <selector>` or `click text=<text>`
- **Type/Fill**: `type "<value>" in <selector>` or `fill "<value>" in <selector>`
- **Wait**: `wait for <selector>` or `wait for 5 seconds`
- **Verify**: `verify text=<text>` or `check <selector>`
- **Database verification**: `verify database: SELECT ... [expect <value>]` or `check database: SELECT ... [expect <value>]` (see below)

**Selector strategies:**
- Text: `text=Login` or `text="Sign In"`
- ID: `#login-button`
- Class: `.btn-primary`
- CSS: `button[type="submit"]`
- Role: `role=button` (Playwright role-based)

See `references/test_case_patterns.md` for common patterns.

### Cursor 分析工件（失败时）

当某用例步骤失败时，执行器会：

1. 采集当前页面上下文：URL、标题、可见文本摘要、与失败步骤相关的 DOM 片段
2. 截图并写入用例结果
3. 在**所有用例执行结束后**，为每个失败用例生成 **Cursor 分析** Markdown（及同内容 JSON）

**文件位置**：默认与测试结果同目录下的 `cursor_analysis/` 子目录；可通过测试计划中的 `cursor_analysis_output_dir` 或环境变量 `CURSOR_ANALYSIS_DIR` 指定。文件名格式：`cursor_analysis_<case_id>_<timestamp>.md`。

**在 Cursor 中使用**：在 Cursor 中打开该 `.md` 文件，或将内容复制到对话中，便于 AI 根据页面上下文、失败步骤和预期/实际值分析失败原因。报告生成器会在报告中引用该路径（「详见 Cursor 分析：<path>」）。

详见 `references/cursor_analysis.md`。

### 数据库验证步骤

在涉及增删改查的步骤之后，可用数据库验证步骤确认数据是否真正写入数据库。

**语法**：

- `verify database: SELECT ... expect <value>`
- `check database: SELECT ... expect <value>`
- 若省略 `expect <value>`，单列单行结果默认期望为 `1`（常用于 `SELECT COUNT(*) ...`）

**配置**：优先从测试计划的 `database` 字段读取（host, port, database, username, password）；若无则从环境变量 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` 读取；最后使用默认（localhost:3306, heartsphere, root, 123456）。仅支持 SELECT 查询，超时 5 秒。

**示例**：

```
verify database: SELECT COUNT(*) FROM users WHERE name='test' expect 1
check database: SELECT status FROM orders WHERE id=1 expect paid
```

详见 `references/database_verification.md`。

## Complete Example

**1. Create test plan:**
```python
from scripts.test_planner import *

plan = create_test_plan(
    "http://localhost:3000",
    "User authentication flow",
    ["Users can log in", "Users can log out"]
)

suite_id = add_test_suite(plan, "Authentication", "Login and logout tests")

add_test_case(
    plan, suite_id,
    "Valid Login",
    "Test login with valid credentials",
    [
        "navigate to http://localhost:3000/login",
        "type 'testuser' in #username",
        "type 'password123' in #password",
        "click #login-button",
        "wait for navigation",
        "verify text=Dashboard"
    ],
    "User should be logged in and see dashboard"
)

save_plan(plan, "auth_plan.json")
```

**2. Run complete workflow:**
```bash
python scripts/test_runner.py auth_plan.json --max-iterations 5 --report auth_report.json
```

**3. Generate report:**
```bash
python scripts/report_generator.py auth_report.json html auth_report.html
```

## Service Configuration

The framework automatically detects and manages services based on your test plan's base URL:

- **Main Project** (localhost:8081, localhost:3000): `main-backend`, `main-frontend`
- **Admin Project** (localhost:8085, localhost:3005): `admin-backend`, `admin-frontend`
- **Edu Project** (localhost:8084): `edu-backend`, `edu-frontend`
- **Company Project** (localhost:8083): `company-backend`, `company-frontend`
- **Mentis Project** (localhost:8082): `mentis-backend`, `mentis-frontend`

**Log Paths**: The framework automatically parses log paths from startup scripts in `scripts/start/`. Different projects have different log path patterns:
- Main: `main/backend-backend.log`, `main/frontend-frontend.log`
- Admin: `admin-backend.log`, `admin-frontend.log`
- Edu: `edu-backend.log`, `edu-frontend.log`
- Company: `company-backend.log`, `company-frontend.log`
- Mentis: `mentis-backend.log`, `mentis-frontend.log`

See `references/service_configuration.md` for detailed service configuration information.

## Best Practices

1. **Ensure tests are not interrupted**: When running test_runner.py or test_executor.py via Cursor/Agent (or any execution environment that may impose a command timeout), set the **execution timeout to at least 30 minutes** (1800000 ms). Otherwise the process may be killed before tests complete. The framework does not set a global timeout for the full run; only step-level timeouts apply.
2. **Start with a clear test plan**: Define requirements and scope before creating test cases
3. **Use descriptive test case names**: Make it clear what each test validates
4. **Add explicit waits**: Use `wait for` steps for dynamic content
5. **Use reliable selectors**: Prefer IDs, text, or role-based selectors
6. **Let continuous testing run**: The framework will automatically fix issues and retry
7. **Monitor service logs**: Check logs if tests consistently fail
8. **Use Ctrl+C to interrupt**: Gracefully stop testing and save state
9. **Review reports**: Analyze failures and service fix history to improve test design
10. **SPA applications**: Do not rely on URL changes; use feature text or elements to verify screen state (see `references/spa_navigation_testing.md`).
11. **Chinese UI**: Use `text=中文文案` with UTF-8 test plans; if unstable, try `button:has-text("文案")` (see `references/chinese_ui_testing.md`).

## Troubleshooting

**Tests fail immediately:**
- Check if the application URL is correct
- Verify the application is running
- Check network connectivity
- Check service logs (framework will do this automatically)

**Chinese UI / SPA (e.g. 心域 main 现实世界日记):**
- Use `text=进入现实`, `verify text=写今日` etc.; ensure test plan JSON is UTF-8
- For SPA, verify by feature text (e.g. `verify text=写今日`) not URL
- Full example and docs: `main/frontend/e2e/realworld-journal-memory/README.md` and `EXECUTION_GUIDE.md`
- See `references/chinese_ui_testing.md`, `references/spa_navigation_testing.md`

**Service restart fails:**
- Verify startup scripts exist in `scripts/start/`
- Check script permissions (should be executable)
- Verify log paths are correct (framework parses from scripts)
- Check if services are already running

**Elements not found:**
- Use browser dev tools to verify selectors
- Add explicit waits before interactions
- Consider using more specific selectors
- Framework will automatically add waits

**Fixes don't work:**
- Review the failure analysis output
- Check service logs for underlying issues
- Manually inspect the application UI
- Update test steps based on actual DOM structure
- Framework will detect ineffective fixes and stop

**Continuous testing loops:**
- Framework automatically detects ineffective fixes
- Use Ctrl+C to interrupt gracefully
- Check service logs for persistent issues
- Review fix history in the report

**Log file not found:**
- Framework automatically parses log paths from startup scripts
- Verify startup scripts exist and contain log path redirects
- Check if log files are in expected locations
- Framework will skip log checking if files don't exist

## Examples

See `examples/` directory for:
- **`example_test_plan.json`**: Complete example test plan with authentication and navigation tests
- **`create_example_plan.py`**: Script demonstrating programmatic test plan creation
- **`README.md`**: Detailed usage examples and customization guide, including **现实世界日记 + 记忆** (Real-World Journal + Memory) example in `main/frontend/e2e/realworld-journal-memory/`

**Quick example:**
```bash
# Use the example plan
python scripts/test_runner.py examples/example_test_plan.json --max-iterations 3

# Or create your own
python examples/create_example_plan.py
python scripts/test_runner.py examples/example_test_plan.json --report my_report.json
```

## Reference Files

- **`references/test_plan_template.md`**: Test plan structure and syntax
- **`references/test_case_patterns.md`**: Common test patterns and examples (includes Chinese UI and SPA)
- **`references/chinese_ui_testing.md`**: Chinese UI step patterns and selectors
- **`references/spa_navigation_testing.md`**: SPA navigation without URL change
- **`references/fix_strategies.md`**: Automatic fix strategies and limitations
- **`references/service_configuration.md`**: Service configuration and log path mapping
- **`references/log_checking_strategies.md`**: Service log checking and error detection strategies
- **`references/cursor_analysis.md`**: 页面内容采集与 Cursor 分析工件（何时生成、文件位置、在 Cursor 中的用法）
- **`references/database_verification.md`**: 数据库验证步骤语法、配置与示例

## Scripts

All scripts support `--help` for usage information. Run scripts directly as black-box utilities rather than loading into context when possible.

- `test_planner.py`: Create and manage test plans
- `test_executor.py`: Execute test cases
- `test_fixer.py`: Analyze and fix test failures (includes service log checking)
- `test_runner.py`: Complete workflow orchestration (continuous testing)
- `report_generator.py`: Generate test reports
- `run_with_server.py`: Server lifecycle management
- `service_config.py`: Service configuration and log path management
- `log_analyzer.py`: Service log analysis and error detection
- `service_manager.py`: Service lifecycle management (start, stop, restart)
