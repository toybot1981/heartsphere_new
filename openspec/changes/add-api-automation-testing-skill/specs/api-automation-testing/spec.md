## ADDED Requirements

### Requirement: API 测试计划与执行
系统 SHALL 提供 API 自动化测试的计划格式与执行能力，对后端 API 发送 HTTP 请求并断言状态码与响应体。

#### Scenario: 创建并执行 API 测试计划
- **WHEN** 用户或 Agent 提供 API 测试计划（含 base_url、认证、test_suites、test_cases）
- **THEN** 执行器按用例顺序发送 HTTP 请求（method、path、body 等）
- **AND** 对每条请求断言期望的状态码与响应体（或片段）
- **AND** 任一步失败时停止执行并写出失败摘要

#### Scenario: 用例步骤为 API 请求
- **WHEN** 测试用例包含多个步骤
- **THEN** 每个步骤对应一条 API 请求（如 GET/POST path、可选 body）
- **AND** 步骤可包含期望：status_code、response body 或 body 片段
- **AND** 支持从计划或环境变量读取认证信息（如 Bearer token）

#### Scenario: 从保留现场继续执行
- **WHEN** 用户或 Agent 使用 --resume-from 指定 test_run_state.json
- **THEN** 执行器跳过已通过的用例，从失败或未执行的用例继续
- **AND** 执行结束后更新 test_run_state.json
- **AND** 不重新从头执行全量用例

### Requirement: 失败时查看后台日志
系统 SHALL 在 API 测试不通过时自动查看被测后台服务的日志，并将日志摘要写入失败报告供 Agent 分析。

#### Scenario: 解析后台日志路径
- **WHEN** 需要读取被测后台的日志
- **THEN** 系统优先从项目根下 `scripts/start/` 中对应启动脚本（如 start-admin-backend.sh）解析日志路径（如输出重定向到 `$PROJECT_ROOT/admin-backend.log`）
- **AND** 若无法从脚本解析，则从测试计划或技能配置中读取该 backend 的日志路径
- **AND** 支持各项目差异（如 admin-backend.log、main/backend-backend.log）

#### Scenario: 失败时写入日志摘要
- **WHEN** 某 API 用例或步骤执行失败
- **THEN** 系统读取对应后台服务的日志文件（最近 N 行或基于时间窗口）
- **AND** 将日志摘要与请求/响应、错误信息一并写入 agent_failure_summary.md
- **AND** Agent 可根据该摘要定位后台问题并修改代码

#### Scenario: 日志文件不存在时
- **WHEN** 解析或配置的日志路径不存在或不可读
- **THEN** 系统在 agent_failure_summary 中注明日志不可用
- **AND** 仍输出请求/响应与错误信息供 Agent 分析

### Requirement: 后台服务重启与脚本约定
系统 SHALL 约定后台服务的启动/重启使用项目标准脚本，并文档化供 Agent 执行。

#### Scenario: 使用 scripts/start 脚本重启后台
- **WHEN** API 测试失败且 Agent 已修改后台代码
- **THEN** 后台服务的重启应使用项目根下 `scripts/start/` 目录中的对应脚本（如 start-admin-backend.sh、start-main-backend.sh）
- **AND** 技能文档中列出服务名与脚本的对应关系（如 admin-backend → start-admin-backend.sh）
- **AND** 不在此技能内自动执行重启，由 Agent 或用户根据文档执行脚本后再次发起测试

#### Scenario: 可选重启辅助工具
- **WHEN** 技能提供可选的小工具或脚本
- **THEN** 可根据服务名调用 `scripts/start/` 下对应脚本并等待服务就绪
- **AND** 便于 Agent 在修复后一键重启再测

### Requirement: 失败交 Agent 修复并再测
系统 SHALL 遵循「测试失败 → 终止并输出结果 → Agent 查看日志、修改问题、重启后台 → Agent 再次发起测试」流程，直到全部通过。

#### Scenario: 失败即终止并交付结果
- **WHEN** API 测试任一步失败
- **THEN** 执行器立即终止，不在此进程中自动重试
- **AND** 输出 agent_failure_summary.md（含请求、响应、后台日志摘要）及可选 test_run_state.json
- **AND** 将上述结果交给 Agent 分析并修复

#### Scenario: Agent 修改与重启后再测
- **WHEN** Agent 根据 agent_failure_summary 修改后台代码并执行 `scripts/start/` 下脚本重启后台
- **THEN** 由 Agent 再次运行 API 测试（或使用 --resume-from 从失败用例继续）
- **AND** 重复「失败 → 交 Agent → 修复并重启 → 再测」直到所有用例通过

#### Scenario: 扩展用例直至模块覆盖
- **WHEN** 对某后端模块进行 API 自动化测试
- **THEN** 可不断补充用例覆盖该模块所有 API 或关键路径
- **AND** 每轮执行失败则交 Agent 修复并重启后再测，直到该模块用例全部通过

### Requirement: 测试资产存放与文档
系统 SHALL 约定 API 测试计划、结果、报告与后台日志摘要的存放位置，并在技能文档中说明。

#### Scenario: 测试资产目录约定
- **WHEN** 用户或 Agent 编写 API 测试计划并执行
- **THEN** 测试资产（api_test_plan.json、results、report、agent_failure_summary、test_run_state.json）建议存放在对应后端项目下的专有目录（如 admin/backend/api-tests/<feature>/）或项目根下 api-tests/<project>/ 等
- **AND** SKILL.md 与 references 中明确目录约定与调用方式

#### Scenario: 与 scripts/start 的集成说明
- **WHEN** 技能依赖项目标准启动脚本与日志路径
- **THEN** 文档中说明后台服务器启动脚本参照 `scripts/start/` 目录
- **AND** 列出各 backend 服务名与脚本名、典型日志路径，便于不同项目适配
