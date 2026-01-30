# Main 认证与访客流程 API 自动化测试

## 需求摘要

- **模块**：Main 后端认证、场景、角色、对话（AuthController、HealthController、WorldController、EraController、CharacterController、ConversationLogController）
- **接口职责**：健康检查、游客登录、获取访客的世界/场景/角色/对话日志列表。
- **请求/响应**：
  - `GET /api/health`：无认证，返回 status、service、timestamp 等。
  - `POST /api/auth/guest-login`：body 可选 `{ "nickname": "昵称" }`；返回 200，data 含 token；计划中第一步使用 `save_token_path: "data.token"`，token 自动用于后续用例。
  - `GET /api/worlds`、`GET /api/eras`、`GET /api/characters`、`GET /api/conversation-logs`：需 Bearer token（由 guest-login 保存后自动携带），返回 200 及列表（可为空）。
- **关键路径**：guest-login 新访客 → 保存 token → 同名称再次进入 → 获取世界 → 获取场景 → 获取角色 → 获取对话日志。

## 用例覆盖范围

- **suite_1**：GET /api/health。
- **suite_2**：游客登录（新访客，含 save_token_path）、游客登录（同名称再次进入）。
- **suite_3**：获取访客的世界列表 GET /api/worlds。
- **suite_4**：获取访客的场景列表 GET /api/eras。
- **suite_5**：获取访客的角色列表 GET /api/characters。
- **suite_6**：获取访客的对话日志列表 GET /api/conversation-logs。

需求与用例对应关系见 **REQUIREMENTS.md**。

## 执行方式

- **base_url**：`http://localhost:8081`（Main 后端默认端口）
- **认证**：本计划无需 token（`auth: "none"`）。
- **backend_service**：`main-backend`，失败时执行器会读取对应后台日志（见 api-automation-testing 技能与 `scripts/start/` 约定）。
- **启动脚本**：`scripts/start/start-main-backend.sh`；日志路径由脚本解析。

### 执行命令（在项目根目录执行）

**前置**：Main 后端需已启动（`./scripts/start/start-main-backend.sh`），等待 8081 就绪后再执行。

```bash
# 无需设置 API_TEST_TOKEN；游客登录第一步使用 save_token_path，后续场景/角色/对话接口自动携带该 token

python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/auth/api_test_plan.json \
  --output main/backend/api-tests/auth/results.json
```

### 从保留现场继续

```bash
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/auth/api_test_plan.json \
  --output main/backend/api-tests/auth/results.json \
  --resume-from main/backend/api-tests/auth/test_run_state.json
```

### 失败后重启后台再测

```bash
./scripts/start/start-main-backend.sh
# 等待服务就绪后重新执行上述执行命令或 --resume-from
```

## 与 api-automation-testing 技能衔接

- 编写与执行遵循 `.claude/skills/api-automation-testing/` 技能文档。
- 失败时产出 `agent_failure_summary.md`（含后台日志摘要），交 Agent 修复后使用 `scripts/start/start-main-backend.sh` 重启再测。
