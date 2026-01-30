# Main 技能执行 API 自动化测试

## 需求摘要

- **模块**：Main 后端技能执行（SkillExecutionController）
- **接口职责**：对已注册技能发起执行请求，返回执行结果或错误信息。
- **请求/响应**：
  - `POST /api/skills/execute`：请求体 `SkillExecutionRequest`（skillId、characterId、parameters、additionalContext）；响应 `ApiResponse<SkillExecutionResultDTO>`（code、data.success、data.result、data.errorMessage、data.executionTimeMs）。
  - `POST /api/skills/execute/stream`：SSE 流式执行，事件 start / result / error（本计划暂仅覆盖普通 POST）。
- **认证**：需登录用户或 API Key（Bearer Token），由 Main 后端 ApiKeyAuthenticationFilter / JWT 校验。
- **关键路径**：合法 skillId + 合法 token → 200 + 业务成功或业务错误（code 200 且 data.success true/false）；无效 token → 401；技能不存在 → 200 且 data.success false 或 500。

## 用例覆盖范围

- `POST /api/skills/execute`：单步请求，断言 HTTP 200 且响应体包含 `code`（业务错误时仍为 200，通过 data.success 区分）。

## 执行方式

- **base_url**：`http://localhost:8081`（Main 后端默认端口）
- **认证**：环境变量 `API_TEST_TOKEN` 设置为有效 JWT 或 Main 后端 API Key，计划中 `auth: "bearer"` 会添加 `Authorization: Bearer <token>`。
- **backend_service**：`main-backend`，失败时执行器会读取对应后台日志（见 api-automation-testing 技能与 `scripts/start/` 约定）。
- **启动脚本**：`scripts/start/start-main-backend.sh`；日志路径由脚本解析（如 `main/backend-backend.log`）。

### 使用登录账号获取 token 后执行（推荐）

```bash
# 使用 Admin(admin/Tyx@19811009) 与 Main(ty1/Tyx@1234) 登录，自动取 token 并运行两套 API 测试
./scripts/test/run-api-tests-with-login.sh
```

### 执行命令（在项目根目录执行）

```bash
# 设置认证（必填，否则 401）
export API_TEST_TOKEN="<your-main-jwt-or-api-key>"

# 执行测试（执行器位于技能目录下）
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/skill-execution/api_test_plan.json \
  --output main/backend/api-tests/skill-execution/results.json
```

### 从保留现场继续

```bash
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/skill-execution/api_test_plan.json \
  --output main/backend/api-tests/skill-execution/results.json \
  --resume-from main/backend/api-tests/skill-execution/test_run_state.json
```

### 失败后重启后台再测

```bash
./scripts/start/start-main-backend.sh
# 等待服务就绪后重新执行上述执行命令或 --resume-from
```

## 与 api-automation-testing 技能衔接

- 测试计划格式、执行器、失败时写 `agent_failure_summary.md` 与 `test_run_state.json` 均按技能约定。
- 失败时由 Agent 根据 `agent_failure_summary.md`（含后台日志摘要）修改代码，执行 `scripts/start/start-main-backend.sh` 重启后再测，直至通过。
