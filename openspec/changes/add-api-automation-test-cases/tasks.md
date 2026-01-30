# Tasks: 编写对应 API 的自动化测试用例

## 1. 范围与需求分析

- [x] 1.1 确定本期覆盖的 API 模块：Main 技能执行（/api/skills/execute、/api/skills/execute/stream）、Admin 技能管理核心接口（列表、详情、content-search、创建/更新等）。
- [x] 1.2 对 Main 技能执行模块做需求分析：接口职责、请求/响应格式、认证方式、关键成功路径与错误场景，输出简要需求摘要（可写在对应 api-tests 目录的 README 中）。
- [x] 1.3 对 Admin 技能管理模块做需求分析：同上，输出需求摘要。

## 2. Main 后端技能执行 API 测试用例

- [x] 2.1 在 `main/backend/api-tests/skill-execution/` 下创建目录（若不存在）。
- [x] 2.2 编写 `api_test_plan.json`：base_url 指向 Main 后端（如 http://localhost:8081），backend_service 为 main-backend，覆盖 POST /api/skills/execute（含必要参数与认证）、可选覆盖 POST /api/skills/execute/stream 的 SSE 连通性与事件（按执行器能力）。
- [x] 2.3 编写 README：需求摘要、用例覆盖范围、执行命令示例（含 API_TEST_TOKEN、--resume-from）、对应 scripts/start 脚本名。
- [x] 2.4 使用 api-automation-testing 技能执行器运行测试，确认通过或记录失败并交付 Agent；若失败则按技能流程修复并重启 main-backend 后再测，直至通过。

## 3. Admin 后端技能管理 API 测试用例

- [x] 3.1 在 `admin/backend/api-tests/skills/` 下创建目录（若不存在）。
- [x] 3.2 编写 `api_test_plan.json`：base_url 指向 Admin 后端（如 http://localhost:8085），backend_service 为 admin-backend，认证为 bearer（API_TEST_TOKEN）；覆盖 GET 列表、GET 详情、content-search（若存在）、POST 创建、PUT 更新等核心接口。
- [x] 3.3 编写 README：需求摘要、用例覆盖范围、执行命令示例、对应 scripts/start 脚本名。
- [x] 3.4 使用 api-automation-testing 技能执行器运行测试，确认通过或按技能流程修复并重启 admin-backend 后再测，直至通过。

## 4. 验证与文档

- [x] 4.1 执行全部新增测试计划，确保在对应后端启动且配置正确时可通过。
- [x] 4.2 在项目或 openspec 中注明：关键 API 自动化测试资产位置及由 api-automation-testing 技能执行与维护的约定（可与现有 api-automation-testing 文档交叉引用）。
