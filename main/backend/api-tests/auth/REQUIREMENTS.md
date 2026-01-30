# 认证与访客流程 API 需求分析

本文档从 main 后端 AuthController、WorldController、EraController、CharacterController、ConversationLogController 等提取接口契约与验收条件，供 API 自动化用例编写与追溯使用。

## 功能点与验收条件

| 需求 ID | 功能点 | 验收条件（请求 / 预期） |
|--------|--------|--------------------------|
| REQ-1 | 健康检查 | GET /api/health → 200，响应含 status、service 等 |
| REQ-2 | 游客登录（新访客） | POST /api/auth/guest-login，body 含 nickname → 200，响应 data 含 token、username、isFirstLogin 为 true；token 供后续接口使用 |
| REQ-3 | 游客登录（同名称再次进入） | 同一 nickname 再次 POST /api/auth/guest-login → 200，响应 data 含 token、isFirstLogin 为 false |
| REQ-4 | 游客注册（可选） | 已登录游客 POST /api/auth/guest-register（Bearer token），body 含 username、email、password 等 → 200 |
| REQ-5 | 获取世界列表 | GET /api/worlds（Bearer token）→ 200，返回当前用户的世界列表（数组） |
| REQ-6 | 获取场景列表 | GET /api/eras（Bearer token）→ 200，返回当前用户的时代/场景列表（数组） |
| REQ-7 | 获取角色列表 | GET /api/characters（Bearer token）→ 200，返回当前用户的角色列表（数组，含游客默认角色） |
| REQ-8 | 获取对话日志列表 | GET /api/conversation-logs（Bearer token）→ 200，返回当前用户的对话日志列表（数组，可为空） |

## 用例与需求对应关系

| 测试套件 | 用例 ID | 用例名称 | 对应需求 |
|----------|---------|----------|----------|
| suite_1 健康检查 | case_1_1 | GET /api/health | REQ-1 |
| suite_2 游客登录 | case_2_1 | 游客登录（新访客） | REQ-2 |
| suite_2 游客登录 | case_2_2 | 游客登录（同名称再次进入） | REQ-3 |
| suite_3 场景（世界） | case_3_1 | 获取访客的世界列表 | REQ-5 |
| suite_4 场景（时代） | case_4_1 | 获取访客的场景列表 | REQ-6 |
| suite_5 角色 | case_5_1 | 获取访客的角色列表 | REQ-7 |
| suite_6 对话 | case_6_1 | 获取访客的对话日志列表 | REQ-8 |

## 说明

- **Token 传递**：case_2_1 第一步使用 `save_token_path: "data.token"`，执行器将响应中的 token 保存并在后续用例（GET /api/worlds、/api/eras、/api/characters、/api/conversation-logs）中自动携带为 `Authorization: Bearer <token>`。
- 游客注册（REQ-4）依赖登录态，可在后续扩展为「先 guest-login 取 token，再 guest-register」多步骤用例。
- 执行前需 Main 后端运行在 http://localhost:8081；除健康检查与游客登录外，场景/角色/对话接口均需 Bearer token（由 guest-login 自动提供）。
