# 提示词管理 API 需求分析

本文档从 main 后端 PromptTemplateController 提取接口契约与验收条件，供 API 自动化用例编写与追溯使用。变更 ID：`migrate-backend-prompts-to-template-management`。

## 功能点与验收条件

| 需求 ID | 功能点 | 验收条件（请求 / 预期） |
|--------|--------|--------------------------|
| REQ-1 | 按 categoryCode 渲染（带默认 fallback） | POST /api/prompts/render，query：categoryCode、defaultSystemPrompt、defaultUserPrompt；body：variables（JSON）→ 200，响应 data 含 systemPrompt、userPrompt；库中无模板时使用默认值 |
| REQ-2 | 按 categoryCode 渲染（无默认值） | POST /api/prompts/render，仅 categoryCode；无模板时返回错误信息，有模板时返回渲染结果 |
| REQ-3 | UTF-8 无乱码 | 请求/响应使用中文或特殊字符时，Content-Type 为 UTF-8，响应体中中文无乱码 |

## 用例与需求对应关系

| 测试套件 | 用例 ID | 用例名称 | 对应需求 |
|----------|---------|----------|----------|
| suite_1 提示词渲染 | case_1_1 | 渲染（带默认值 fallback） | REQ-1 |
| suite_1 提示词渲染 | case_1_2 | 渲染（带默认值，验证 data） | REQ-1 |
| suite_1 提示词渲染 | case_1_3 | 渲染（中文变量无乱码） | REQ-3 |

## 说明

- **Query 参数**：执行器通过 path 的 query 字符串传递 categoryCode、defaultSystemPrompt、defaultUserPrompt（如 `?categoryCode=xxx&defaultSystemPrompt=yyy&defaultUserPrompt=zzz`）。
- **Body**：variables 为 JSON 对象，与模板占位符对应（如 userMessage、skillsList、maxCandidates、text 等）。
- **UTF-8**：接口响应需为 `application/json;charset=UTF-8`，中文内容无乱码；用例 case_1_3 使用中文 body 验证。
