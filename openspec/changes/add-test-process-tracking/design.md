# Design: 测试过程跟踪功能

## Context

- **现有能力**：web-automation-testing 技能已支持失败时采集页面上下文、生成 Cursor 分析工件、数据库验证、日志检查、服务重启、持续测试循环
- **缺失能力**：实时进度跟踪、成功用例的页面内容异常检测、测试过程时间线记录
- **目标**：提升测试可观测性，及早发现页面内容异常，便于问题追溯和 AI 辅助分析

## Goals / Non-Goals

- **Goals**：
  - 实时显示测试进度（当前用例、当前步骤）
  - 检测成功用例中的页面内容异常（错误信息、空内容、格式错误等）
  - 记录测试过程时间线（用例/步骤执行、失败/成功、修复、服务重启等事件）
  - 自动为异常内容生成 Cursor 分析工件
  - 在报告中展示时间线和异常内容
- **Non-Goals**：
  - 不改变现有测试计划 JSON 格式（新增字段为可选）
  - 不强制要求所有测试计划启用跟踪（默认启用，可配置关闭）
  - 不替代现有的失败时 Cursor 分析（两者并存）

## Decisions

1. **进度输出格式**：
   - 控制台：`[Iteration N] [Case M/T] case_id: name - Step S/T: description`（如 `[1] [Case 3/10] case_1_1: 登录管理端 - Step 5/8: 点击登录按钮`）
   - 日志文件：JSON Lines 格式，每行一个事件（用例开始、步骤执行、用例结束等）
   - 测试结果 JSON：在用例结果中添加 `started_at`、`completed_at`、`duration_ms`，在步骤结果中添加 `executed_at`、`duration_ms`

2. **页面内容异常检测策略**：
   - 在验证步骤（`verify`、`check`）成功后，检查页面内容：
     - 是否包含常见错误关键词（如"错误"、"失败"、"异常"、"500"、"404"等）
     - 是否为空或仅包含占位符
     - 是否包含异常格式（如 JSON 解析错误、HTML 结构异常）
   - 检测到异常时：
     - 采集页面上下文（URL、标题、可见文本、DOM 片段）
     - 生成 Cursor 分析工件（标记为"内容异常"而非"失败"）
     - 用例状态设为"passed_with_warnings"或类似状态
     - 在报告中突出显示

3. **时间线事件类型**：
   - `case_started`：用例开始执行
   - `case_completed`：用例完成（成功/失败/跳过）
   - `step_executed`：步骤执行（成功/失败）
   - `page_content_anomaly`：检测到页面内容异常
   - `fix_attempted`：尝试修复（test_fixer）
   - `service_restarted`：服务重启（test_runner）
   - `log_checked`：日志检查（test_fixer）
   - `iteration_started`：迭代开始（test_runner）
   - `iteration_completed`：迭代完成（test_runner）

4. **时间线存储格式**：
   - 测试结果 JSON 的顶层添加 `timeline` 字段：`[{ "event": "case_started", "case_id": "...", "timestamp": "...", "metadata": {...} }, ...]`
   - 按时间戳排序，便于报告生成器按时间顺序展示

5. **配置方式**：
   - 测试计划 JSON 的 `metadata` 中添加可选字段：
     - `tracking.progress_output`: `true`（默认）/ `false`
     - `tracking.content_anomaly_detection`: `true`（默认）/ `false`
     - `tracking.timeline_detail`: `"minimal"` / `"standard"`（默认）/ `"verbose"`
   - 环境变量：`TEST_TRACKING_VERBOSE=1` 启用详细跟踪

## Risks / Trade-offs

- **性能影响**：页面内容异常检测会增加验证步骤的执行时间（需要额外检查页面内容），但影响较小（<100ms）
- **误报风险**：页面内容异常检测可能误报（如页面正常显示"错误处理"文案），可通过关键词白名单或更智能的检测策略减少误报
- **存储开销**：时间线记录会增加测试结果 JSON 的大小，但通常可接受（每个事件约 100-200 字节）

## Migration Plan

- 向后兼容：现有测试计划无需修改即可使用新功能（默认启用跟踪）
- 现有测试结果 JSON 格式保持不变，新增字段为可选
- 报告生成器兼容旧格式（无时间线时跳过时间线展示）
