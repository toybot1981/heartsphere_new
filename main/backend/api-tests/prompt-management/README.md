# 提示词管理 API 自动化测试

**变更ID**: `migrate-backend-prompts-to-template-management`  
**后端**: main-backend  
**测试范围**: 与提示词管理相关的关键 API（如 `/api/prompts/render`），验证渲染与 UTF-8 无乱码。

## 需求摘要

- 按 `categoryCode`（及可选变量）渲染提示词模板，返回 `systemPrompt` / `userPrompt`。
- 支持默认值 fallback：未配置模板时使用请求中的 `defaultSystemPrompt`、`defaultUserPrompt`。
- 响应使用 UTF-8，中文及特殊字符无乱码。

## 执行方式

由 **api-automation-testing** 技能执行本目录下的 `api_test_plan.json`。  
失败时：查看后台日志 → 交 Agent 修复 → 使用 `scripts/start/start-main-backend.sh` 重启 main 后端 → 再次执行测试（可选 `--resume-from`）。

## 资产说明

- `api_test_plan.json`: 测试计划与用例。
- `README.md`: 本说明。

执行后可能生成：`results.json`、`test_run_state.json`、`agent_failure_summary.md`。

## 执行命令（项目根下）

```bash
python3 .claude/skills/api-automation-testing/scripts/api_test_executor.py main/backend/api-tests/prompt-management/api_test_plan.json --output main/backend/api-tests/prompt-management/results.json
```

需先启动 main 后端（如 `scripts/start/start-main-backend.sh`），确保 `base_url`（默认 `http://localhost:8081`）可访问。
