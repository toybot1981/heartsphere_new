# API 测试计划结构

## JSON 结构

```json
{
  "base_url": "http://localhost:8085",
  "backend_service": "admin-backend",
  "auth": "bearer",
  "test_suites": [
    {
      "id": "suite_1",
      "name": "Health and Login",
      "description": "健康检查与登录",
      "test_cases": [
        {
          "id": "case_1",
          "name": "Health check",
          "description": "GET /api/admin/health",
          "steps": [
            {
              "method": "GET",
              "path": "/api/admin/health",
              "expected_status": 200
            }
          ]
        },
        {
          "id": "case_2",
          "name": "Login",
          "description": "POST login",
          "steps": [
            {
              "method": "POST",
              "path": "/api/admin/auth/login",
              "body": { "username": "admin", "password": "xxx" },
              "expected_status": 200,
              "expected_body_contains": "token"
            }
          ]
        }
      ]
    }
  ]
}
```

## 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| base_url | 是 | API 根地址，如 `http://localhost:8085` |
| backend_service | 否 | 被测后台服务名，用于解析日志路径（如 admin-backend、main-backend） |
| auth | 否 | `bearer` 表示从环境变量 `API_TEST_TOKEN` 读取 token；`none` 或不写表示无认证 |
| test_suites | 是 | 测试套件列表 |
| test_suites[].id | 是 | 套件 ID |
| test_suites[].name | 是 | 套件名称 |
| test_suites[].test_cases | 是 | 用例列表 |
| test_cases[].id | 是 | 用例 ID |
| test_cases[].name | 是 | 用例名称 |
| test_cases[].steps | 是 | 步骤列表，每步为一条 API 请求 |
| steps[].method | 是 | GET / POST / PUT / PATCH / DELETE |
| steps[].path | 是 | 相对 base_url 的路径 |
| steps[].body | 否 | JSON 请求体（对象） |
| steps[].expected_status | 是 | 期望 HTTP 状态码 |
| steps[].expected_body_contains | 否 | 响应体需包含的字符串或 JSON 键路径（如 "data.id"） |
| steps[].save_token_path | 否 | 从本步响应 JSON 中按路径提取 token 并用于后续步骤的 Authorization（如 "data.token"）；同一计划内后续步骤自动携带该 token |

## 认证

- `auth: "bearer"`：请求头自动添加 `Authorization: Bearer <API_TEST_TOKEN>`，token 从环境变量 `API_TEST_TOKEN` 读取。
- `auth: "none"` 或省略：不添加认证头。
