# 前端 E2E 测试方案存放目录约定

测试方案资产应存放在**对应前端项目下的专有目录**，与前端代码同仓，便于版本一致与 CI 挂载。

## 目录结构

- **Admin 前端**：`admin/frontend/e2e/<feature>/`
  - 示例：`admin/frontend/e2e/skill-management/`
- **Main 前端**：`main/frontend/e2e/<feature>/`
  - 示例：`main/frontend/e2e/login/`
- **单 frontend 根**：`frontend/e2e/<feature>/`

## 目录内文件

- `test_plan.json`：结构化测试计划（metadata、requirements、test_suites、test_cases）
- `README.md`：执行说明与前置条件（如何调用 test_runner / test_executor、报告生成、失败时日志检查与 --resume-from）
- 可选：`TEST_PLAN_DETAILED.md`、`results.json`、`report.md` / `report.html`

## 执行方式示例

从**项目根目录**执行：

```bash
# 执行测试（失败即停，交 Agent 修复）
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  admin/frontend/e2e/skill-management/test_plan.json \
  --report admin/frontend/e2e/skill-management/report.json

# 从保留现场继续
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  admin/frontend/e2e/skill-management/test_plan.json \
  --report admin/frontend/e2e/skill-management/report.json \
  --resume-from admin/frontend/e2e/skill-management/test_run_state.json

# 生成报告
python .claude/skills/web-automation-testing/scripts/report_generator.py \
  admin/frontend/e2e/skill-management/report.json markdown admin/frontend/e2e/skill-management/report.md
```

从 **web-automation-testing 技能目录**执行时，将上述路径改为相对项目根的路径（或绝对路径）。

## 与 OpenSpec 提案的衔接

- 涉及前端页面功能的提案，tasks.md 须包含「提供自动化测试方案」任务。
- 方案由本技能完成，资产存放于上述前端项目专有目录。
- 编写用例前先对目标模块/功能点做需求分析，再围绕需求编写 test plan。
