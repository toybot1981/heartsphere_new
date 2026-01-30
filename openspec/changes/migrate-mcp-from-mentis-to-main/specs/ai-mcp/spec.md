## ADDED Requirements

### Requirement: MCP 服务器配置管理
主项目（main）SHALL 在 `ai/mcp` 模块下提供 MCP 服务器配置的 CRUD、启用/禁用及连接测试能力，作为 AI 基础设施与 `ai/skill` 并列。

#### Scenario: 创建 MCP 服务器配置
- **WHEN** 调用方创建新的 MCP 服务器配置（含 name、serverType、serverUrl、apiKey 等）
- **THEN** 系统 SHALL 校验必填字段
- **AND** SHALL 持久化到 `mcp_server_configs` 表（main 库）
- **AND** SHALL 返回已创建的配置（含 id、createdAt、updatedAt）
- **AND** 表 SHALL 使用 utf8mb4 字符集与 utf8mb4_unicode_ci 排序规则

#### Scenario: 更新与删除 MCP 服务器配置
- **WHEN** 调用方更新或删除指定 id 的 MCP 配置
- **THEN** 系统 SHALL 校验配置存在并执行更新或软删除/物理删除
- **AND** SHALL 返回更新后的配置或确认删除成功

#### Scenario: 启用/禁用 MCP 配置
- **WHEN** 调用方切换某配置的 enabled 状态
- **THEN** 系统 SHALL 更新该配置的 enabled 字段
- **AND** SHALL 返回更新后的配置
- **AND** 仅启用配置可被技能、multiagent 等用于 MCP 工具调用

#### Scenario: 测试 MCP 连接
- **WHEN** 调用方请求测试某 MCP 配置的连接
- **THEN** 系统 SHALL 尝试连接对应 MCP 服务并列举可用工具
- **AND** SHALL 更新 lastTestedAt、connectionStatus、lastError（若失败）
- **AND** SHALL 返回连接是否成功及可选工具列表（或错误信息）

### Requirement: MCP 服务模板
主项目 SHALL 提供 MCP 服务模板（`mcp_service_templates`），支持基于模板快速创建配置。

#### Scenario: 列举 MCP 服务模板
- **WHEN** 调用方请求可用的 MCP 服务模板
- **THEN** 系统 SHALL 返回模板列表
- **AND** 每个模板 SHALL 包含 templateName、serverType、category、defaultUrl/defaultUrlTemplate、requiredParams、description、setupInstructions 等
- **AND** 支持按 category、isPopular 等筛选

#### Scenario: 从模板创建配置
- **WHEN** 调用方选择模板并提供所需参数（如 apiKey）
- **THEN** 系统 SHALL 根据模板生成 `mcp_server_configs` 记录
- **AND** SHALL 设置 template_id 指向该模板
- **AND** SHALL 校验必填参数并可选执行连接测试后保存

### Requirement: MCP 客户端与工具调用
主项目 SHALL 提供 MCP 客户端服务，支持列举工具与执行工具调用，供 skill、multiagent 等使用。

#### Scenario: 列举某配置的 MCP 工具
- **WHEN** 调用方请求某 MCP 配置下的工具列表
- **THEN** 系统 SHALL 连接该 MCP 服务并返回工具列表（含 name、description、parametersSchema 等）
- **AND** 仅当配置已启用时 SHALL 允许列举

#### Scenario: 执行 MCP 工具
- **WHEN** 调用方请求执行指定配置下的某工具（含工具名与参数）
- **THEN** 系统 SHALL 通过 MCP 客户端调用该工具并返回结果
- **AND** SHALL 支持工具名格式 `mcp_{configId}_{toolName}` 等约定，以便与 skill 的 `mcp_tool_config`、multiagent 的 McpToolExecutor 兼容

### Requirement: MCP 健康检查
主项目 SHALL 对启用的 MCP 配置进行健康检查，并维护 connectionStatus、lastError 等状态。

#### Scenario: 定期健康检查
- **WHEN** 定时任务或手动触发对启用配置的健康检查
- **THEN** 系统 SHALL 逐个探测 MCP 服务连接
- **AND** SHALL 更新 connectionStatus（如 CONNECTED、DISCONNECTED、ERROR）、lastTestedAt、lastError
- **AND** 工具选择与调度 SHALL 可依据健康状态排除不可用配置

#### Scenario: 健康状态查询
- **WHEN** 调用方请求 MCP 服务健康状态
- **THEN** 系统 SHALL 返回各配置的 connectionStatus、lastTestedAt、lastError 等
- **AND** 可选提供按 enabled、connectionStatus 过滤

### Requirement: MCP REST API
主项目 SHALL 暴露 REST API（如 `/api/v1/ai/mcp/configs` 等），供 admin、其它内部服务调用，与现有 API 规范一致。

#### Scenario: 配置 CRUD API
- **WHEN** 调用方通过 REST 发起配置的创建、查询、更新、删除
- **THEN** 系统 SHALL 提供对应 HTTP 方法与路径
- **AND** 响应 SHALL 符合项目统一格式（如 code、message、data、timestamp）
- **AND** 使用 application/json;charset=UTF-8

#### Scenario: 测试与工具 API
- **WHEN** 调用方请求测试连接、列举工具、调用工具
- **THEN** 系统 SHALL 提供相应 REST 端点（如 `POST .../configs/{id}/test`、`GET .../configs/{id}/tools`、`POST .../configs/{id}/tools/{toolName}/call`）
- **AND** 鉴权与 CORS 按项目现有规范配置

### Requirement: MCP 与 multiagent / skill 集成
主项目 SHALL 使 multiagent 的 McpToolExecutor 与 skill 的 `mcp_tool_config` 仅依赖 `ai.mcp`，不依赖 mentis。

#### Scenario: McpToolExecutor 使用 ai.mcp
- **WHEN** multiagent 执行 MCP 工具
- **THEN** McpToolExecutor SHALL 仅依赖 `com.heartsphere.ai.mcp` 的 McpClientService 与配置仓储
- **AND** SHALL 不依赖 `com.heartsphere.mentis` 的 MCP 实现
- **AND** 工具名解析、configId 解析与现有约定一致

#### Scenario: skill 的 mcp_tool_config 引用
- **WHEN** 技能使用 `mcp_tool_config` 引用 MCP 配置与工具
- **THEN** 所引用的 config id SHALL 对应 main 库 `mcp_server_configs` 中的记录
- **AND** 配置 SHALL 已启用且健康检查可用（若启用健康检查）
