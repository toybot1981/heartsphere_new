# Change: 将 MCP 相关功能从 mentis 迁移至 main，作为 AI 基础设施

## Why

当前 MCP（Model Context Protocol）的配置、客户端、数据表与 API 均位于 mentis 模块。main 的 skill（`mcp_tool_config`）、multiagent（`McpToolExecutor`）等依赖 mentis 的 MCP 能力，导致主项目与 mentis 耦合；且 MCP 作为通用 AI 基础设施，更适宜与 skill 并列置于主项目中统一维护。

将 MCP 迁入 main、落位 `ai/mcp`，可：
1. 解除 main 对 mentis 的 MCP 依赖，主项目自洽提供 MCP 配置与调用
2. 与 `ai/skill` 并列，形成清晰的 AI 基础设施布局（`ai/mcp`、`ai/skill`）
3. 数据表归属 main 库，由 main Flyway 管理，便于权限与迁移统一

## What Changes

- **ADDED**: main 项目下 `com.heartsphere.ai.mcp` 模块，包含：
  - 实体：`McpServerConfig`、`McpServiceTemplate`
  - 仓储：`McpServerConfigRepository`、`McpServiceTemplateRepository`
  - 服务：`McpConfigService`、`McpClientService`、`McpServiceTemplateService`、`McpHealthMonitor`
  - 控制器：MCP 配置与工具的 REST API（如 `/api/v1/ai/mcp/...`）
- **ADDED**: main 库 Flyway 迁移，创建并维护 `mcp_server_configs`、`mcp_service_templates` 表（含 `template_id` 等结构，utf8mb4）
- **MODIFIED**: `multiagent.protocol.mcp.McpToolExecutor` 改为依赖 `ai.mcp` 的 `McpClientService`，**移除**对 `com.heartsphere.mentis.service.McpClientService` 的 `@ConditionalOnClass` 依赖
- **MODIFIED**: mentis 移除 MCP 配置存储与对应 API（实体、仓储、服务、控制器及迁移）；E2B/Bridge/Inspector 等 VM 相关 MCP 能力可保留，并按需对接 main 的 MCP 配置或客户端
- **MODIFIED**: admin **对 MCP 数据表进行管理**时，直接访问 main 数据源中的 `mcp_server_configs`、`mcp_service_templates`（多数据源连 main 库），独立实现配置 CRUD、toggle 等；**涉及 MCP 的在线测试、工具获取等业务操作**（如测试连接、列举工具、调用工具）**须调用 main 的接口**

## Impact

- **Affected specs**: `ai-mcp`（新增能力）
- **Affected code**:
  - **main**: 新增 `main/backend/.../ai/mcp/`（entity, repository, service, controller），`multiagent/protocol/mcp/McpToolExecutor`，Flyway `db/migration`
  - **mentis**: `entity/McpServerConfig`、`McpServiceTemplate`，`repository/`、`service/`、`controller/` 中 MCP 配置相关类，`tool/mcp/McpToolAdapter` 等与配置存储强相关的部分；迁移脚本中 MCP 表
  - **admin**: `MentisMcpConfigRepository`、`MentisManagementController`/`MentisManagementServiceImpl` 中 MCP 代理逻辑，`mentisMcpApi`、`McpConfigManagement` 等前端调用
- **Breaking changes**: mentis 的 `/api/mentis/mcp/*` API 移除。admin 对 MCP 数据表的管理改为直连 main 数据源；在线测试、工具获取等业务操作由原 mentis 代理改为**调用 main 的 MCP 接口**
- **Migration**: 若 mentis 当前使用独立库（如 `heartsphere_mentis`）存储 MCP 表，需将 `mcp_server_configs`、`mcp_service_templates` 数据迁移至 main 库后再切换；详见 design.md
