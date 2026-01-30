# 记忆管理模块 E2E 测试方案

本目录存放 **记忆管理** 页面的自动化测试方案资产，由 **web-automation-testing** 技能完成需求分析与用例编写。

## 测试范围

- 登录管理端 → 进入记忆系统 → 点击「用户记忆」进入用户记忆管理
- 6 个 Tab 切换与内容验证：用户记忆（Admin API）、HSMem查询、记忆提取追溯、资源管理、记忆项管理、类别管理

## 前置条件

- Admin 前端：`http://localhost:3005/admin`
- Admin 后端：`http://localhost:8085`
- 管理员账号：admin / Tyx@19811009（或与项目一致）
- Python 3.8+、Playwright 已安装

## 执行方式

**从项目根目录执行：**

```bash
# 完整运行
python .claude/skills/web-automation-testing/scripts/test_executor.py admin/frontend/e2e/memory-management/test_plan.json --output admin/frontend/e2e/memory-management/results.json

# 失败后从现场继续（跳过已通过用例）
python .claude/skills/web-automation-testing/scripts/test_executor.py admin/frontend/e2e/memory-management/test_plan.json --output admin/frontend/e2e/memory-management/results.json --resume-from admin/frontend/e2e/memory-management/test_run_state.json
```

**生成报告：**

```bash
python .claude/skills/web-automation-testing/scripts/report_generator.py admin/frontend/e2e/memory-management/results.json markdown admin/frontend/e2e/memory-management/report.md
```

## 资产说明

- `test_plan.json` - 测试计划（requirements、test_suites、test_cases）
- `results.json` - 执行结果
- `report.md` - Markdown 报告（report_generator 生成）
- `test_run_state.json` - 现场状态（失败时生成，用于 --resume-from）
- `agent_failure_summary.md` - 失败摘要（供 Agent 修复参考）

对应 OpenSpec 变更：`refactor-memory-management-split-components`（记忆管理页面拆分为多组件）。
