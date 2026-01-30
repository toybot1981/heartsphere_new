## ADDED Requirements

### Requirement: 关键 API 测试计划与用例
项目 SHALL 为关键 API 模块编写并维护自动化测试计划与用例，先对目标模块进行需求分析，再围绕需求编写用例；由 api-automation-testing 技能执行与维护；测试资产存放于对应后端项目专有目录。

#### Scenario: 先需求分析再编写用例
- **WHEN** 为某 API 模块（如 Main 技能执行、Admin 技能管理）编写自动化测试用例
- **THEN** 先对目标模块进行需求分析（接口职责、请求/响应格式、认证方式、关键成功路径与错误场景）
- **AND** 围绕需求摘要编写测试计划（api_test_plan.json）中的 test_suites 与 test_cases
- **AND** 与 api-automation-testing 技能的测试计划格式与执行流程一致

#### Scenario: 测试资产存放于对应后端项目专有目录
- **WHEN** 编写并执行某后端（如 main、admin）的 API 测试计划
- **THEN** 测试资产（api_test_plan.json、README、results、report、agent_failure_summary、test_run_state.json）存放于该后端项目下的专有目录（如 main/backend/api-tests/<feature>/、admin/backend/api-tests/<feature>/）
- **AND** 各目录 README 说明模块需求摘要、用例覆盖范围、执行方式（base_url、认证、backend_service 与 scripts/start 对应脚本名）

#### Scenario: 执行与失败处理由 api-automation-testing 技能完成
- **WHEN** 用户或 Agent 执行已编写的 API 测试计划
- **THEN** 使用 api-automation-testing 技能的执行器运行计划
- **AND** 失败时按技能约定：查看后台日志、产出 agent_failure_summary、交 Agent 修改并重启后台后再测，直至通过
