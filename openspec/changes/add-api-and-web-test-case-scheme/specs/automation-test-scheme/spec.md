## ADDED Requirements

### Requirement: API 和 web 测试用例方案总览
项目 SHALL 遵循统一的「API 和 web 测试用例方案」：当提案涉及前端页面功能时须提供 Web 自动化测试方案（由 web-automation-testing 技能完成，先需求分析再编写用例，资产存于对应前端项目 `e2e/<feature>/`）；当涉及关键 API 模块时须提供或维护 API 自动化测试方案（由 api-automation-testing 技能完成，先需求分析再编写用例，资产存于对应后端项目 `api-tests/<feature>/`）；API 测试不通过时须查看后台日志、将结果交 Agent 修复、使用 `scripts/start/` 下对应脚本重启后台后再次发起测试直至通过。

#### Scenario: 提案涉及前端时提供 Web 测试方案
- **WHEN** 创建 OpenSpec 提案且变更涉及前端页面功能（如新增/修改管理端或主站页面、表单、向导、列表等）
- **THEN** 提案 SHALL 包含 Web 自动化测试方案
- **AND** 该方案 SHALL 由 web-automation-testing 技能完成（编写测试计划、执行、失败交 Agent 修复、扩展直至模块功能全覆盖）
- **AND** 技能执行时 SHALL 先对目标模块/功能点进行需求分析，再围绕需求编写用例
- **AND** 测试方案资产（test_plan.json、README、报告等）SHALL 存放在对应前端项目下的专有目录（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`）

#### Scenario: 关键 API 模块提供 API 测试方案
- **WHEN** 项目对关键 API 模块（如技能执行、技能管理、认证等）进行自动化测试
- **THEN** 须提供或维护 API 自动化测试方案
- **AND** 该方案 SHALL 由 api-automation-testing 技能完成（编写 API 测试计划、执行 HTTP 请求、断言状态与响应）
- **AND** 技能执行时 SHALL 先对目标 API 模块进行需求分析，再围绕需求编写用例
- **AND** 测试资产（api_test_plan.json、README、results.json、report、agent_failure_summary.md、test_run_state.json）SHALL 存放在对应后端项目下的专有目录（如 `main/backend/api-tests/<feature>/`、`admin/backend/api-tests/<feature>/`）

#### Scenario: API 测试失败时查看日志并重启后再测
- **WHEN** API 自动化测试执行中某用例或步骤不通过
- **THEN** 执行器 SHALL 停止并产出失败摘要（含请求、响应及后台日志摘要）
- **AND** 失败结果 SHALL 交付 Agent 分析并修改代码
- **AND** Agent 或用户 SHALL 使用项目根下 `scripts/start/` 目录中对应脚本（如 `start-admin-backend.sh`、`start-main-backend.sh`）重启被测后台服务
- **AND** 重启就绪后由 Agent 再次发起 API 测试（或使用 --resume-from 从保留现场继续），直至全部通过

### Requirement: 测试用例编写流程为先需求分析再编写
使用 web-automation-testing 或 api-automation-testing 技能编写或扩展自动化用例时，SHALL 先对**待编写用例的模块或功能点**进行**需求分析**，再**围绕需求**开展用例编写；test plan 中的 requirements、test_suites、test_cases SHALL 与需求对应。

#### Scenario: Web 用例编写前进行需求分析
- **WHEN** Agent 或人工使用 web-automation-testing 技能为某前端模块/功能点编写或扩展测试用例
- **THEN** 须先进行需求分析：从提案、需求文档或页面实现中提取功能点与验收条件（入口、步骤、预期结果）
- **AND** 需求分析结果 SHALL 体现在 test plan 的 metadata、requirements 或等价结构中
- **AND** test_suites、test_cases SHALL 与上述需求对应，覆盖核心路径与关键分支

#### Scenario: API 用例编写前进行需求分析
- **WHEN** Agent 或人工使用 api-automation-testing 技能为某 API 模块编写或扩展测试用例
- **THEN** 须先进行需求分析：从接口文档、提案或实现中提取接口契约与验收条件（请求方法、路径、参数、期望状态码与响应要点）
- **AND** 需求分析结果 SHALL 体现在 API 测试计划的 metadata、requirements 或等价结构中
- **AND** test_suites、test_cases SHALL 与上述需求对应，覆盖正常路径与关键错误分支
