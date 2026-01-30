## ADDED Requirements

### Requirement: 技能管理测试计划
系统 SHALL 提供结构化的技能管理自动化测试计划，覆盖管理端专业创建器下的登录、AI 生成、文件导入、方式切换及到手动编辑的流程。

#### Scenario: 测试计划包含登录与进入专业创建器
- **WHEN** 执行技能管理测试计划
- **THEN** 测试计划中包含登录管理端的步骤（如打开 Admin 前端、输入账号密码、点击登录）
- **AND** 包含进入「技能管理」并打开「专业创建器」的步骤
- **AND** 上述步骤可在 test plan JSON 中表达，并可由 web-automation-testing 的 test_executor 执行

#### Scenario: 测试计划包含 AI 生成多种场景
- **WHEN** 执行技能管理测试计划
- **THEN** 测试计划中包含至少一种「AI 生成」场景（如输入简单描述、点击生成、校验结果或错误提示）
- **AND** 可选包含多种描述类型（如仅描述、带 MCP 工具描述等）以覆盖不同 AI 返回形态
- **AND** 步骤可适应 Admin 前端实际控件（按钮、输入框、结果展示区域）

#### Scenario: 测试计划包含文件导入（上传与粘贴）
- **WHEN** 执行技能管理测试计划
- **THEN** 测试计划中包含「文件导入」相关步骤：至少覆盖「上传文件」或「粘贴内容」一种方式
- **AND** 步骤可表达文件选择或文本粘贴及后续解析结果校验
- **AND** 与专业创建器内「文件导入」入口与 UI 一致

#### Scenario: 测试计划包含三种创建方式切换
- **WHEN** 执行技能管理测试计划
- **THEN** 测试计划中包含在「AI 生成」「文件导入」「手动编辑」三种方式之间切换的用例
- **AND** 切换后界面状态或表单内容可被验证（如通过文案、占位符或可见区域）
- **AND** 步骤可在 test plan JSON 中表达并执行

#### Scenario: 测试计划包含从 AI 生成/文件导入到手动编辑的流程
- **WHEN** 执行技能管理测试计划
- **THEN** 测试计划中包含从「AI 生成」结果进入「手动编辑」并可编辑/保存的流程步骤
- **AND** 包含从「文件导入」结果进入「手动编辑」并可编辑/保存的流程步骤（或明确标注为可选）
- **AND** 步骤可验证进入编辑态或表单已填充

### Requirement: 技能管理测试执行与 web-automation-testing 集成
系统 SHALL 支持使用 web-automation-testing 技能的 test_runner 执行技能管理测试计划，并在失败时进行日志检查与服务重启。

#### Scenario: 使用 test_runner 执行技能管理测试计划
- **WHEN** 用户在项目根或技能目录执行 `test_runner.py <skill_management_test_plan.json> --report <report.json>`
- **THEN** 系统使用 web-automation-testing 的 test_executor 执行该 test plan 中的用例
- **AND** 测试计划中的 app_url 指向 Admin 前端地址（如 `http://localhost:3005/admin`）
- **AND** 执行结果被记录并可用于生成报告

#### Scenario: 测试失败时检查 Admin 前后端日志
- **WHEN** 技能管理测试计划执行失败
- **AND** 已启用或默认启用日志检查（如 test_fixer / test_runner 的 check_logs）
- **THEN** 系统根据 test plan 的 app_url 或配置识别为 Admin 项目
- **AND** 自动检查 admin 前端与后端服务的日志文件（路径从 `scripts/start/start-admin-frontend.sh`、`scripts/start/start-admin-backend.sh` 解析或使用服务配置映射）
- **AND** 将日志分析结果用于诊断或修复决策

#### Scenario: 服务问题修复后使用 scripts/start 重启
- **WHEN** 日志分析表明需要重启 Admin 前端或后端服务（如端口占用、崩溃）
- **THEN** 系统使用项目根目录下 `scripts/start/` 中对应脚本（如 `start-admin-backend.sh`、`start-admin-frontend.sh`）进行重启
- **AND** 不依赖非项目约定的启动方式（如临时 ad-hoc 命令），与 enhance-web-automation-testing-with-log-checking 中约定一致
- **AND** 重启后可继续执行测试或重试失败用例

#### Scenario: 持续测试直到通过或人为中断
- **WHEN** 用户以持续测试模式运行技能管理测试计划（如不设或设较大 max_iterations）
- **THEN** 系统在失败时执行日志检查、服务重启（若适用）、测试用例修复与重试
- **AND** 循环执行直到所有用例通过或用户中断（如 Ctrl+C）
- **AND** 最终报告包含通过率与修复/重试历史

### Requirement: 技能管理测试资产与文档
系统 SHALL 提供技能管理测试资产的存放位置与使用说明，便于回归与协作。

#### Scenario: 测试资产目录与文件齐全
- **WHEN** 实现本变更的测试方案
- **THEN** 在约定目录（如 `admin/e2e/skill-management/` 或 `e2e/skill-management/`）下提供：
  - 结构化 test plan JSON（`test_plan.json`）
  - 测试计划详细说明（如 `TEST_PLAN_DETAILED.md`）
  - 执行与故障排除说明（如 `README.md`）
- **AND** README 中说明如何调用 test_runner、test_executor、report_generator 以及前置条件（Admin/Main 服务、管理员账号、API Key）

#### Scenario: 报告可复现
- **WHEN** 执行完成后生成报告（如 `report_generator.py report.json markdown report.md`）
- **THEN** 报告包含技能管理相关用例的通过/失败状态与步骤级结果
- **AND** 若发生过日志检查或服务重启，报告中可体现相关记录，便于问题追溯
