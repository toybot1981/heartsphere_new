## 1. 需求分析

- [x] 1.1 对现实世界模块（日记、记忆提取）进行需求分析：从提案、需求文档或页面实现中提取功能点与验收条件（入口、步骤、预期结果）
- [x] 1.2 将需求分析结果落盘到 `main/frontend/e2e/realworld-journal-memory/` 下（如 `REQUIREMENTS.md` 或 test plan 的 `metadata.requirements` / 等价结构），并确保 test_suites、test_cases 与需求可追溯

## 2. 测试计划与用例

- [x] 2.1 对照需求查漏补缺：在现有 test_plan.json 基础上，补充缺失场景（如日记排序、空状态、记忆空状态、搜索无结果等），使模块内所有功能均有对应用例
- [x] 2.2 更新 test_plan.json 的 requirements / metadata，使用例与需求一一对应；必要时调整 test_suites 划分以与功能模块或用户流程一致
- [x] 2.3 在 README 或 REQUIREMENTS.md 中说明如何从项目根或技能目录调用 test_runner / test_executor 及报告生成方式

## 3. 提供自动化测试方案（web-automation-testing）

- [x] 3.1 使用 web-automation-testing 技能执行完整测试：`test_runner.py <plan> --report <report>`（或等价命令），测试失败时终止并将结果（agent_failure_summary.md、cursor_analysis/、报告）交 Agent 分析修复
- [x] 3.2 若为测试用例问题，修改 test plan 或步骤后使用 `--resume-from test_run_state.json` 从失败用例继续执行，直至该模块所有功能用例全部通过
- [x] 3.3 生成最终报告并保存于 `main/frontend/e2e/realworld-journal-memory/`（如 report.json、report.md）

## 4. 收尾与文档

- [x] 4.1 更新 `main/frontend/e2e/realworld-journal-memory/README.md`：补充需求分析说明、用例与需求对应关系、以及「全面测试」执行结果摘要（通过率、覆盖的功能点）
- [x] 4.2 （可选）与 add-realworld-journal-memory-automation-tests 或 add-main-project-e2e-testing 对齐端口、账号、目录约定，便于后续统一回归
