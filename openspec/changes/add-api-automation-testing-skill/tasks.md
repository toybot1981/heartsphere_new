## 1. 技能骨架与文档

- [x] 1.1 创建 `.claude/skills/api-automation-testing/` 目录结构（SKILL.md、scripts/、references/）
- [x] 1.2 编写 SKILL.md：描述 API 自动化测试流程、与 web-automation-testing 的异同、失败时「查看后台日志 → Agent 修改 → 重启后台 → 再测」原则
- [x] 1.3 在 SKILL.md 中说明后台服务器启动脚本参照 `scripts/start/` 目录（如 start-admin-backend.sh、start-main-backend.sh），以及测试资产建议存放位置（如各 backend 项目下的 api-tests/<feature>/ 或项目根 api-tests/）

## 2. API 测试计划格式与规划器

- [x] 2.1 定义 API 测试计划 JSON 结构（base_url、auth、test_suites、test_cases；用例步骤为 method/path/body/expected status 等）
- [x] 2.2 实现 api_test_planner（或等价脚本）：创建/编辑计划、按模块或需求组织 suite/case
- [x] 2.3 在 references 中提供 test_plan_template 与示例

## 3. API 测试执行器

- [x] 3.1 实现 API 测试执行器：读取计划、按顺序发送 HTTP 请求、断言状态码与响应体
- [x] 3.2 支持认证（如 Bearer token）从计划或环境变量读取
- [x] 3.3 任一步失败时停止执行，写出 agent_failure_summary.md（含请求、响应、错误信息）
- [x] 3.4 支持 --resume-from：读取 test_run_state.json，跳过已通过用例，从失败用例继续
- [x] 3.5 写出 test_run_state.json（已通过/失败用例、结果文件路径）供下一轮使用

## 4. 失败时后台日志采集

- [x] 4.1 实现从 `scripts/start/` 下启动脚本解析日志路径（复用或参考 web-automation-testing 的 service_config / log 解析逻辑）
- [x] 4.2 支持通过计划或配置指定 backend 服务名与日志路径（用于无法从脚本解析的项目）
- [x] 4.3 执行失败时自动读取对应后台日志（最近 N 行或时间窗口），将摘要写入 agent_failure_summary.md
- [x] 4.4 在 references 中说明各项目（admin、main 等）的 backend 服务名与日志路径约定

## 5. 后台重启约定与文档

- [x] 5.1 在技能中约定：重启后台由 Agent 或用户执行 `scripts/start/start-xxx-backend.sh`；技能文档中列出服务名与脚本对应关系
- [x] 5.2 可选：提供小工具脚本根据服务名调用 `scripts/start/` 下对应脚本并等待就绪（便于 Agent 一键重启）
- [x] 5.3 在 SKILL.md 中写明「API 测试不通过 → 查看后台日志 → 修改问题 → 重启后台 → 继续测试」的完整流程

## 6. 报告与现场状态

- [x] 6.1 实现报告生成：从执行结果生成可读报告（Markdown 或 HTML）
- [x] 6.2 报告与 agent_failure_summary、test_run_state 的存放位置与命名约定写入 SKILL.md 和 references

## 7. 验证与示例

- [x] 7.1 使用至少一个后端（如 admin-backend）编写示例 API 测试计划并执行
- [x] 7.2 验证失败时能正确写出后台日志摘要与 agent_failure_summary
- [x] 7.3 验证 --resume-from 能正确跳过已通过用例并从失败处继续
- [x] 7.4 在 examples 或 references 中提供完整示例与调用说明
