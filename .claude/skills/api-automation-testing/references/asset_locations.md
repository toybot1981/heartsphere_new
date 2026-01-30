# 测试资产存放位置与命名

## 建议目录

- **按后端项目**：`<project>/backend/api-tests/<feature>/`  
  例：`admin/backend/api-tests/health/`、`main/backend/api-tests/user-api/`
- **项目根统一**：`api-tests/<project>/`  
  例：`api-tests/admin/`、`api-tests/main/`

## 文件命名约定

| 文件 | 说明 |
|------|------|
| api_test_plan.json | 测试计划（或自定义名如 health_plan.json） |
| results.json | 最近一次执行结果（可由 --output 指定） |
| report.md / report.html | 报告（由 report_generator 生成） |
| agent_failure_summary.md | 失败时由执行器写出，供 Agent 分析 |
| test_run_state.json | 现场状态，用于 --resume-from |

## 调用方式

从**项目根**执行时，建议将计划放在上述目录内，例如：

```bash
# 计划在 admin/backend/api-tests/health/
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  admin/backend/api-tests/health/api_test_plan.json \
  --output admin/backend/api-tests/health/results.json
```

执行器会将 **agent_failure_summary.md** 和 **test_run_state.json** 写在 **--output 文件所在目录**（与 results 同目录）。
