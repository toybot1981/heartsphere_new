## 1. 测试过程进度跟踪

- [x] 1.1 在 `test_executor.py` 中添加进度输出功能
  - [x] 用例开始时输出：`[Case M/T] case_id: name`
  - [x] 步骤执行时输出：`[Case M/T] case_id: name - Step S/T: description`
  - [x] 用例完成时输出：`[Case M/T] case_id: name - ✅/❌/⏭️`
  - [x] 支持 `--verbose` 参数控制详细程度
- [x] 1.2 在 `test_runner.py` 中添加迭代进度输出
  - [x] 迭代开始时输出：`[Iteration N/M] Starting...`
  - [x] 聚合用例进度：`[Iteration N/M] Progress: X/Y cases completed`
- [x] 1.3 在测试结果 JSON 中记录执行时间戳和耗时
  - [x] 用例结果中添加 `started_at`、`completed_at`、`duration_ms`
  - [x] 步骤结果中添加 `executed_at`、`duration_ms`

## 2. 页面内容异常检测

- [x] 2.1 在 `test_executor.py` 中实现内容异常检测逻辑
  - [x] 在验证步骤成功后，检查页面内容是否包含错误关键词
  - [x] 检查页面内容是否为空或仅包含占位符
  - [x] 检查页面内容格式是否异常（可选：JSON 解析、HTML 结构）
- [x] 2.2 检测到异常时自动生成 Cursor 分析工件
  - [x] 采集页面上下文（复用现有的 `_collect_page_context`）
  - [x] 生成 Cursor 分析 Markdown（标记为"内容异常"）
  - [x] 用例状态设为 `passed_with_warnings` 或类似状态
- [x] 2.3 在测试结果中记录异常信息
  - [x] 用例结果中添加 `content_anomalies` 字段：`[{ "step": "...", "anomaly_type": "...", "details": "...", "cursor_analysis_path": "..." }]`

## 3. 测试过程时间线记录

- [x] 3.1 在 `test_executor.py` 中记录时间线事件
  - [x] 用例开始/结束事件：`case_started`、`case_completed`
  - [x] 步骤执行事件：`step_executed`
  - [x] 页面内容异常事件：`page_content_anomaly`
- [x] 3.2 在 `test_runner.py` 中记录时间线事件
  - [x] 迭代开始/结束事件：`iteration_started`、`iteration_completed`
  - [x] 修复尝试事件：`fix_attempted`
  - [ ] 服务重启事件：`service_restarted`（在 test_fixer 中触发，可后续补充）
  - [ ] 日志检查事件：`log_checked`（在 test_fixer 中触发，可后续补充）
- [x] 3.3 在测试结果 JSON 中添加时间线字段
  - [x] 顶层添加 `timeline` 字段：`[{ "event": "...", "timestamp": "...", "metadata": {...} }, ...]`
  - [x] 按时间戳排序

## 4. 配置与文档

- [x] 4.1 在测试计划 JSON 格式中支持跟踪配置
  - [x] `metadata.tracking.progress_output`: `true`/`false`（默认 `true`）
  - [x] `metadata.tracking.content_anomaly_detection`: `true`/`false`（默认 `true`）
  - [x] `metadata.tracking.timeline_detail`: `"minimal"`/`"standard"`/`"verbose"`（默认 `"standard"`）
- [x] 4.2 支持环境变量控制
  - [x] `TEST_TRACKING_VERBOSE=1` 启用详细跟踪
  - [x] `TEST_TRACKING_DISABLE_PROGRESS=1` 禁用进度输出
- [x] 4.3 更新文档
  - [x] 在 `references/test_plan_template.md` 中说明跟踪配置字段
  - [x] 创建 `references/test_process_tracking.md` 说明跟踪功能的使用和配置
  - [x] 更新 `SKILL.md` 说明新增的跟踪能力

## 5. 报告生成器增强

- [x] 5.1 在报告中展示测试过程时间线
  - [x] Markdown 报告：添加"测试过程时间线"章节，按时间顺序列出事件
  - [x] HTML 报告：可选的时间线视图（时间轴或表格）
- [x] 5.2 突出显示"通过但内容异常"的用例
  - [x] 在用例详情中显示异常信息
  - [x] 引用自动生成的 Cursor 分析工件
  - [x] 在摘要中统计异常用例数量

## 6. 测试与验证

- [x] 6.1 使用技能管理测试计划验证跟踪功能
  - [x] 运行 `admin/e2e/skill-management/test_plan.json`（需在 Admin 服务启动后执行）
  - [x] 验证进度输出是否正常
  - [x] 验证时间线是否记录完整
  - [x] 验证异常检测是否工作（如有异常内容）
- [x] 6.2 验证向后兼容性
  - [x] 使用旧格式测试计划运行，确认不报错
  - [x] 使用旧格式测试结果生成报告，确认正常显示
