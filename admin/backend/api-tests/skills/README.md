# Admin 技能管理 API 自动化测试

## 需求摘要

- **模块**：Admin 后端技能管理（AdminSkillController）
- **接口职责**：技能 CRUD、列表/详情、content-search、创建器相关接口等。
- **请求/响应**：
  - `GET /api/admin/skills`：可选 query category、skillType、executionType；响应 `{ code, data: SkillDefinitionDTO[], message }`。
  - `GET /api/admin/skills/{skillId}`：可选 `includeResources=true`；响应 `{ code, data, message }`，不存在时 404。
  - `POST /api/admin/skills`：创建技能；`PUT /api/admin/skills/{skillId}`：更新技能。
- **认证**：Admin JWT（Bearer Token），由 Admin 后端校验。
- **关键路径**：合法 token → 200 + data；无效/缺 token → 401；技能不存在 → 404。

## 用例覆盖范围

- `GET /api/admin/skills`：列表，断言 200 且响应含 `data`。
- `GET /api/admin/skills/non-existent-skill-id`：不存在的 ID，断言 404。

后续可扩展：GET 详情（存在 ID）、POST 创建、PUT 更新、content-search 等。

## 执行方式

- **base_url**：`http://localhost:8085`（Admin 后端默认端口）
- **认证**：环境变量 `API_TEST_TOKEN` 设置为 Admin 登录后的 JWT，计划中 `auth: "bearer"` 会添加 `Authorization: Bearer <token>`。
- **backend_service**：`admin-backend`，失败时执行器会读取对应后台日志。
- **启动脚本**：`scripts/start/start-admin-backend.sh`；日志路径由脚本解析（如 `admin-backend.log`）。

### 使用登录账号获取 token 后执行（推荐）

```bash
# 使用 Admin(admin/Tyx@19811009) 与 Main(ty1/Tyx@1234) 登录，自动取 token 并运行两套 API 测试
./scripts/test/run-api-tests-with-login.sh
```

可通过环境变量覆盖：`ADMIN_TEST_USER`/`ADMIN_TEST_PASSWORD`、`MAIN_TEST_USER`/`MAIN_TEST_PASSWORD`、`ADMIN_BASE_URL`、`MAIN_BASE_URL`

### 执行命令（在项目根目录执行）

```bash
# 设置 Admin JWT（必填，否则 401）
export API_TEST_TOKEN="<admin-jwt>"

# 执行测试
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  admin/backend/api-tests/skills/api_test_plan.json \
  --output admin/backend/api-tests/skills/results.json
```

### 从保留现场继续

```bash
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  admin/backend/api-tests/skills/api_test_plan.json \
  --output admin/backend/api-tests/skills/results.json \
  --resume-from admin/backend/api-tests/skills/test_run_state.json
```

### 失败后重启后台再测

```bash
./scripts/start/start-admin-backend.sh
# 等待就绪后重新执行上述执行命令或 --resume-from
```

## 与 api-automation-testing 技能衔接

- 测试计划格式、执行器、失败时写 `agent_failure_summary.md` 与 `test_run_state.json` 均按技能约定。
- 失败时由 Agent 根据 `agent_failure_summary.md`（含后台日志摘要）修改代码，执行 `scripts/start/start-admin-backend.sh` 重启后再测，直至通过。
