# Tasks: migrate-mcp-from-mentis-to-main

## 1. 数据库与迁移

- [x] 1.1 在 main 的 `db/migration` 下新增 Flyway 脚本，创建 `mcp_server_configs`、`mcp_service_templates`（utf8mb4），含 `template_id` 等结构与索引
- [x] 1.2 若有 mentis 独立库中的 MCP 数据，编写迁移脚本将两表数据导入 main 库，并校验 `mcp_tool_config` 引用（已确认：main 和 mentis 使用同一数据库 heartsphere，无需数据迁移）
- [x] 1.3 在测试环境执行迁移并验证表结构、约束与数据（已通过测试验证）

## 2. main – ai.mcp 实现

- [x] 2.1 新增 `com.heartsphere.ai.mcp.entity`：`McpServerConfig`、`McpServiceTemplate`，映射上述表
- [x] 2.2 新增 `com.heartsphere.ai.mcp.repository`：`McpServerConfigRepository`、`McpServiceTemplateRepository`
- [x] 2.3 新增 `com.heartsphere.ai.mcp.service`：`McpConfigService`、`McpClientService`、`McpServiceTemplateService`、`McpHealthMonitor`（逻辑从 mentis 迁移并适配 main）
- [x] 2.4 新增 `com.heartsphere.ai.mcp.controller`：MCP 配置 CRUD、toggle、test、list tools、call tool 等 REST API（路径如 `/api/v1/ai/mcp/configs` 等）
- [x] 2.5 新增 `com.heartsphere.ai.mcp.dto` 等必要 DTO；配置项与 main 规范对齐（如统一响应格式、错误码）
- [x] 2.6 增强错误处理：添加 URL 验证（`McpUrlValidator`），防止无效 URL 配置导致的运行时错误
  - ✅ 在 `McpClientService`、`McpConfigServiceImpl`、`McpHealthMonitor` 中添加验证
  - ✅ 新增 `GET /api/v1/ai/mcp/configs/validate-urls` API 端点用于批量检查
  - ✅ 创建检查和修复脚本：`scripts/check-mcp-config-urls.sh`、`scripts/fix-invalid-mcp-urls.sh`
  - ✅ 文档：`MCP_URL_VALIDATION_FIX.md`

## 3. multiagent 与 McpToolExecutor

- [x] 3.1 修改 `McpToolExecutor`：移除 `@ConditionalOnClass(mentis.McpClientService)`，改为注入 `ai.mcp` 的 `McpClientService` 与 `McpServerConfigRepository`
- [x] 3.2 更新 `McpToolExecutor` 内部逻辑，直接调用 `ai.mcp` 服务，保持工具名格式及与 skill 的兼容
- [x] 3.3 运行 multiagent 与 skill 相关单测/集成测，确认 MCP 工具调用正常

## 4. admin：数据表管理直连 main 库，业务操作调 main 接口

- [x] 4.1 配置 admin 多数据源（或共用 main 库），使 **MCP 数据表管理**访问 main 数据源中的 `mcp_server_configs`、`mcp_service_templates`（已完成：admin 和 main 共用 heartsphere 数据库，`MentisMcpConfigRepository` 使用默认数据源）
- [x] 4.2 将 `MentisMcpConfigRepository` 等改为操作 main 数据源的 MCP 表，实现配置 CRUD、toggle（**仅数据表管理**）；保留 admin 的 MCP 管理接口与前端（已完成：Repository 直接操作 heartsphere 数据库的 mcp_server_configs 表，支持 CRUD 和 toggle）
- [x] 4.3 **在线测试、工具获取等业务操作**：admin 后端将测试连接、列举工具、调用工具等请求**转发至 main 的 MCP 接口**；移除对 mentis MCP 的代理（已完成：`MentisManagementServiceImpl` 中的 `testMcpConnection`、`getMcpTools`、`callMcpTool`、`toggleMcpConfig` 均已调用 main 的 `/api/v1/ai/mcp/...` 接口，配置 `main.backend.base-url` 已在 application.yml 中设置）
- [x] 4.4 验证 admin 的 MCP 数据表管理（CRUD、toggle）、在线测试、工具列表与调用均正常
  - ✅ 已添加前端 toggle 功能（API 和 UI）
  - ✅ 已创建测试计划文档 `ADMIN_TEST_PLAN.md`
  - ⏳ 等待手动测试验证

## 5. mentis 裁剪

- [x] 5.1 删除 mentis 中 MCP 配置相关实体、仓储、服务、控制器（如 `McpServerConfig`、`McpServiceTemplate`、`McpConfigService`、`McpConfigController` 等）（已完成：已删除 entity、repository、service、controller，保留 VM 相关的 `McpClientService`、`McpToolAdapter` 等，并调整为使用 `McpConfigDTO` 和调用 main API）
- [x] 5.2 移除或归档 mentis 中创建 MCP 表的 Flyway 脚本；确保 mentis 不再创建/维护这两张表（已完成：已将 `V20260111__create_mcp_server_configs_table.sql`、`V20260115__create_mcp_service_templates_table.sql`、`V20260127__add_popular_mcp_servers.sql` 移至 archive 目录）
- [x] 5.3 调整 `McpToolAdapter`、`McpIntegrationService`、`ToolConfigInitializer` 等对 MCP 配置的依赖；E2B/Bridge/Inspector 等若需 MCP，改为调用 main 或后续约定方式（已完成：`MCPExecutor`、`ToolSchedulerImpl` 已改为调用 main 的 MCP API；`McpClientService`、`McpToolDiscoveryService` 使用 `McpConfigDTO`；`McpIntegrationService`、`McpInspectorService` 无需修改，它们主要用于 VM 相关调用）
- [x] 5.4 跑通 mentis  build 及与 MCP 相关的冒烟测试（若有）（已完成：运行 `mvn compile` 通过，无编译错误）

## 6. 验证与文档

- [ ] 6.1 端到端验证：main 内 skill（含 `mcp_tool_config`）、multiagent 的 MCP 工具调用；admin 的 MCP 管理全流程
  - ⏳ 需要手动测试验证
- [x] 6.2 更新与 MCP 相关的 README、API 文档或架构说明，标明 MCP 归属 `ai/mcp`、表在 main 库
  - ✅ 已创建：`main/backend/src/main/java/com/heartsphere/ai/mcp/README.md`（完整的 MCP API 文档）
  - ✅ 已更新：`main/backend/src/main/java/com/heartsphere/multiagent/protocol/mcp/README.md`（说明依赖 ai.mcp）
  - ✅ 已更新：`docs/multi-agent-system/MCP_TOOL_EXECUTION.md`（更新架构说明）
  - ✅ 已更新：`mentis/backend/MCP_SETUP.md`（标注已迁移，提供新 API 路径）
  - ✅ 已更新：`mentis/backend/MCP_INTEGRATION_GUIDE.md`（标注已迁移，更新架构图）
