## MODIFIED Requirements

### Requirement: 测试执行与结果记录
系统 SHALL 执行测试用例并记录详细结果，包括执行时间戳、耗时、页面上下文和测试过程时间线。

#### Scenario: 执行测试用例并记录时间戳
- **WHEN** 执行测试用例
- **THEN** 用例结果中包含 `started_at`（ISO 8601 时间戳）和 `completed_at`（ISO 8601 时间戳）
- **AND** 用例结果中包含 `duration_ms`（执行耗时，毫秒）
- **AND** 每个步骤结果中包含 `executed_at`（ISO 8601 时间戳）和 `duration_ms`（执行耗时，毫秒）

#### Scenario: 记录测试过程时间线
- **WHEN** 执行测试用例和测试流程
- **THEN** 测试结果 JSON 的顶层包含 `timeline` 字段，记录关键事件的时间戳：
  - `case_started`：用例开始执行（包含 case_id、name）
  - `case_completed`：用例完成（包含 case_id、status）
  - `step_executed`：步骤执行（包含 case_id、step_number、status）
  - `page_content_anomaly`：检测到页面内容异常（包含 case_id、step_number、anomaly_type）
  - `fix_attempted`：尝试修复（包含 fix_type、affected_cases）
  - `service_restarted`：服务重启（包含 service_name）
  - `log_checked`：日志检查（包含 service_name、log_path）
  - `iteration_started`：迭代开始（包含 iteration_number）
  - `iteration_completed`：迭代完成（包含 iteration_number、summary）
- **AND** 时间线事件按时间戳排序
- **AND** 每个事件包含 `event`（事件类型）、`timestamp`（ISO 8601 时间戳）、`metadata`（事件相关数据）

## ADDED Requirements

### Requirement: 测试过程实时进度跟踪
系统 SHALL 在执行测试时实时输出进度信息，便于用户了解当前执行状态。

#### Scenario: 输出用例和步骤进度
- **WHEN** 执行测试用例
- **THEN** 系统在控制台输出进度信息：
  - 用例开始时：`[Case M/T] case_id: name`
  - 步骤执行时：`[Case M/T] case_id: name - Step S/T: description`
  - 用例完成时：`[Case M/T] case_id: name - ✅/❌/⏭️`（根据状态显示对应图标）
- **AND** 进度输出格式清晰，便于阅读

#### Scenario: 输出迭代进度
- **WHEN** 使用 test_runner 执行持续测试
- **THEN** 系统在控制台输出迭代进度：
  - 迭代开始时：`[Iteration N/M] Starting...`
  - 迭代进行中：`[Iteration N/M] Progress: X/Y cases completed`
  - 迭代完成时：`[Iteration N/M] Completed: X passed, Y failed, Z skipped`

#### Scenario: 配置进度输出
- **WHEN** 测试计划中配置 `metadata.tracking.progress_output` 为 `false`
- **OR** 环境变量 `TEST_TRACKING_DISABLE_PROGRESS=1`
- **THEN** 系统不输出进度信息（仅输出关键事件，如用例完成）

### Requirement: 页面内容异常检测
系统 SHALL 在验证步骤成功后检查页面内容是否正常，检测到异常时自动生成 Cursor 分析工件。

#### Scenario: 检测页面内容中的错误信息
- **WHEN** 验证步骤（`verify`、`check`）执行成功
- **THEN** 系统检查页面可见文本是否包含常见错误关键词（如"错误"、"失败"、"异常"、"500"、"404"、"未授权"等）
- **AND** 若检测到错误关键词，系统标记为内容异常
- **AND** 采集页面上下文（URL、标题、可见文本、DOM 片段）
- **AND** 生成 Cursor 分析工件（Markdown + JSON），标记为"内容异常"而非"失败"

#### Scenario: 检测页面内容为空或占位符
- **WHEN** 验证步骤执行成功
- **THEN** 系统检查页面内容是否为空或仅包含占位符（如"加载中..."、"暂无数据"等）
- **AND** 若检测到空内容或占位符，系统标记为内容异常
- **AND** 生成 Cursor 分析工件

#### Scenario: 记录内容异常到测试结果
- **WHEN** 检测到页面内容异常
- **THEN** 用例状态设为 `passed_with_warnings` 或类似状态（不标记为失败）
- **AND** 用例结果中包含 `content_anomalies` 字段：`[{ "step": "步骤描述", "anomaly_type": "error_keywords|empty_content|format_error", "details": "异常详情", "cursor_analysis_path": "cursor_analysis/..." }]`
- **AND** 测试结果中的 `timeline` 包含 `page_content_anomaly` 事件

#### Scenario: 配置内容异常检测
- **WHEN** 测试计划中配置 `metadata.tracking.content_anomaly_detection` 为 `false`
- **THEN** 系统不执行内容异常检测（仅保留失败时的页面上下文采集）

### Requirement: 测试过程时间线展示
系统 SHALL 在测试报告中展示测试过程时间线，便于问题追溯和性能分析。

#### Scenario: 在 Markdown 报告中展示时间线
- **WHEN** 生成 Markdown 测试报告
- **THEN** 报告包含"测试过程时间线"章节
- **AND** 时间线按时间顺序列出事件（最早到最晚）
- **AND** 每个事件显示：时间戳、事件类型、相关用例/步骤、事件详情

#### Scenario: 在 HTML 报告中展示时间线
- **WHEN** 生成 HTML 测试报告
- **THEN** 报告包含时间线视图（时间轴或表格形式）
- **AND** 时间线可按事件类型筛选（如仅显示失败事件、仅显示服务重启事件）
- **AND** 时间线可展开/折叠详细事件信息

#### Scenario: 突出显示异常内容用例
- **WHEN** 生成测试报告
- **THEN** 报告中突出显示"通过但内容异常"的用例（如使用警告图标 ⚠️）
- **AND** 在用例详情中显示异常信息（异常类型、详情、Cursor 分析路径）
- **AND** 在报告摘要中统计异常用例数量（如"X passed, Y passed with warnings, Z failed"）
