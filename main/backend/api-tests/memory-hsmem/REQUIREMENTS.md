# Memory / HSMem 兼容 API 需求分析

## 适用范围

Main 后端 memory 模块暴露的 HSMem 兼容 API（`/api/memory/v1/hsmem/*`），与 HSMem 逻辑及契约一致。默认 `memory.hsmem.mode=local`（Main 内置），可配置为 `remote`（外部 HSMem 服务）。

## 接口列表与契约

| 方法 | 路径 | 认证 | 请求体/查询 | 期望状态码 | 响应要点 |
|------|------|------|-------------|------------|----------|
| POST | /api/memory/v1/hsmem/memorize/conversation | 是 | messages, user_id?, agent_id? | 200 | data.resource_id, data.items_count, data.categories |
| POST | /api/memory/v1/hsmem/memorize/text | 是 | text, context?, user_id? | 200 | data.resource_id, data.items_count |
| POST | /api/memory/v1/hsmem/memorize/document | 是 | title, content, author?, user_id? | 200 | data.resource_id, data.items_count |
| POST | /api/memory/v1/hsmem/retrieve | 是 | queries, where?, limit? | 200 | data.method, data.items |
| GET | /api/memory/v1/hsmem/statistics | 否 | - | 200 | data.resources_count, data.items_count, data.categories_count |
| GET | /api/memory/v1/hsmem/categories | 否 | - | 200 | data.categories, data.total |
| GET | /api/memory/v1/hsmem/items | 是 | user_id? (query) | 200 | data.items, data.total |
| GET | /api/memory/v1/hsmem/resources | 否 | - | 200 | data.resources, data.total |

## 用例覆盖

- 正常路径：登录 → memorize → statistics / categories / items / resources / retrieve。
- 未认证调用需认证接口 → 401。
- 可选：user_id 过滤、缺失参数、非法 ID 等。

## 资产位置

- 测试计划：`main/backend/api-tests/memory-hsmem/api_test_plan.json`
- 结果、报告、失败摘要、现场状态：同目录。
