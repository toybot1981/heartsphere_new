# Design: MCP 迁移至 main（ai/mcp）

## Context

- **现状**：MCP 配置、客户端、表与 API 均在 mentis；main 的 skill（`mcp_tool_config`）、multiagent（`McpToolExecutor`）通过 `@ConditionalOnClass(mentis.McpClientService)` 依赖 mentis 执行 MCP 工具。
- **约束**：project.md 要求 admin 除 AI 大模型外不调用其他工程业务服务；业务逻辑隔离、各项目独立。MCP 作为 **基础设施**，可与 AI 大模型类似，由 main 提供、admin 等按需调用。
- **目标**：MCP 以 `ai/mcp` 形式落户 main，与 `ai/skill` 并列；表入 main 库；main 自洽提供配置与调用，解除对 mentis 的 MCP 依赖。

## Goals / Non-Goals

- **Goals**:
  - 在 main 中实现完整的 MCP 配置管理、客户端、健康检查及 REST API
  - 表 `mcp_server_configs`、`mcp_service_templates` 迁入 main 库，由 main Flyway 管理
  - `McpToolExecutor` 仅依赖 `ai.mcp`，不再依赖 mentis
  - mentis 不再持有 MCP 配置存储与对应 API；VM 相关 MCP（E2B/Bridge/Inspector）可保留并可选对接 main
  - admin **对 MCP 数据表进行管理**时直连 main 数据源；**涉及 MCP 的在线测试、工具获取等业务操作**须**调用 main 的接口**
- **Non-Goals**:
  - 本设计不实现新的 MCP 协议特性；不改变 `skill_definitions.mcp_tool_config` 的 JSON 结构（仍可引用 config id、tools 等）
  - E2B/Bridge/Inspector 的具体重构细节单独跟进；本迁移只明确「配置与通用客户端在 main」

## Decisions

### 1. 模块布局与包结构

- **main**：`com.heartsphere.ai.mcp`，与 `ai.skill` 平级。
  - 子包建议：`entity`、`repository`、`service`、`controller`、`dto`、`config`（若需要）。
- **API 路径**：例如 `/api/v1/ai/mcp/configs`、`/api/v1/ai/mcp/configs/{id}`、`/api/v1/ai/mcp/configs/{id}/test`、`/api/v1/ai/mcp/configs/{id}/tools` 等，与现有 REST 风格一致；具体以 main 现有 API 约定为准。

### 2. 数据表与迁移

- **表**：`mcp_server_configs`、`mcp_service_templates`（含 `template_id` FK 等），结构延续 mentis 当前设计；字符集 `utf8mb4`、排序规则 `utf8mb4_unicode_ci`，符合 project 规范。
- **迁移**：在 main 的 `db/migration` 下新增 Flyway 脚本（如 `V20260128__create_mcp_tables_in_main.sql`），创建上述两表；若存在 mentis 库中的历史数据，需额外迁移脚本将数据导入 main 库（先表后数据，避免 FK 失败）。
- **mentis 迁移**：mentis 中创建 MCP 表的 Flyway 脚本在迁移完成后删除或改为不可执行（如更名归档），避免重复建表。

### 3. McpToolExecutor 与 multiagent

- **现状**：`McpToolExecutor` 通过 `@ConditionalOnClass(mentis.McpClientService)` 从 mentis 反射调用 `McpClientService`、`McpServerConfigRepository`。
- **变更**：移除对 mentis 的 `@ConditionalOnClass` 依赖；直接注入 `ai.mcp` 的 `McpClientService` 与 `McpServerConfigRepository`（或等价 bean），在 main 内完成工具解析与执行。
- **兼容**：工具名格式（如 `mcp_{configId}_{toolName}`）、与 skill 的 `mcp_tool_config` 约定保持一致，避免已有技能或 multiagent 行为异常。

### 4. mentis 侧裁剪与保留

- **移除**：MCP 配置的实体、仓储、服务、控制器及对应 Flyway 表创建；`McpConfigService`、`McpClientService`（指 mentis 内用于配置/HTTP 调用的实现）等。
- **保留**：E2B Gateway、Bridge、Inspector 等 VM 相关 MCP 能力；若需读取配置或调用 MCP，可调用 main 的 MCP API 或使用 main 提供的 MCP 客户端 SDK（若后续封装）。
- **裁剪范围**：以「配置存储与对外 HTTP CRUD/test/tools」为界；具体类清单见 tasks.md。

### 5. admin 与 main 的对接（已定）

- **数据表管理**：admin **对 MCP 数据表进行管理**时，直接访问 main 数据源中的 `mcp_server_configs`、`mcp_service_templates`。配置多数据源（或共用 main 库），通过自有 Repository/DAO 读写上述两表，实现配置的 CRUD、启用/禁用（toggle）等；**不调用 main 的 MCP API**。符合 project 业务逻辑隔离、各项目独立实现。
- **业务操作**：**涉及 MCP 的在线测试、工具获取等业务操作**（测试连接、列举工具、调用工具）**须调用 main 的接口**。main 提供相应 REST 端点（如 `POST .../configs/{id}/test`、`GET .../configs/{id}/tools`、`POST .../configs/{id}/tools/{toolName}/call`），admin 后端对此类请求**转发至 main**，前端继续请求 admin 自身接口。
- **MentisMcpConfigRepository**：改为直连 **main 数据源** 中的 MCP 表，仅负责配置的增删改查与 toggle；测试/工具类能力通过调用 main 的 MCP API 实现。

### 6. 依赖与构建

- **main**：不依赖 mentis；`ai.mcp` 仅依赖 Spring、JPA、现有 main 基础设施。
- **mentis**：若保留 E2B/Bridge 等且需用 main 的 MCP 配置，可依赖 main 或通过 HTTP 调用 main 的 MCP API，避免循环依赖。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 迁移期间 mentis、admin 仍调用旧 MCP API | 分阶段切换：先 main 上线 MCP API 与表，admin 切到 main；再下线 mentis MCP API |
| 数据迁移遗漏或 FK 冲突 | 迁移脚本在测试环境充分验证；先迁 `mcp_service_templates`，再迁 `mcp_server_configs` |
| `mcp_tool_config` 中 config id 与 main 中 id 不一致 | 若 mentis 与 main 原不同库，迁移时做 id 映射或保留原 id（同一张表则无此问题） |

## Migration Plan

1. **Phase 1 – main 落地**
   - 在 main 新增 Flyway 迁移，创建 `mcp_server_configs`、`mcp_service_templates`。
   - 实现 `ai.mcp` 的 entity、repository、service、controller，以及 `McpClientService`、健康检查等。
   - 调整 `McpToolExecutor` 使用 `ai.mcp`，去掉对 mentis 的依赖；跑通 main 内 skill / multiagent 的 MCP 工具调用。

2. **Phase 2 – 数据迁移（若 mentis 有独立 MCP 库）**
   - 导出 mentis 中两表数据，按 main 表结构导入；处理 `template_id`、自增 id 等。
   - 校验 `skill_definitions.mcp_tool_config` 中引用的 config id 在 main 表中存在。

3. **Phase 3 – admin 切换**
   - admin 配置多数据源连接 main 库；`MentisMcpConfigRepository` 等改为操作 main 数据源中的 MCP 表，实现**数据表管理**（配置 CRUD、toggle）。
   - **在线测试、工具获取等业务操作**：admin 后端将此类请求**转发至 main 的 MCP 接口**；前端 `mentisMcpApi` / `McpConfigManagement` 继续请求 admin 自身接口，admin 区分「表管理」与「业务操作」分别处理。
   - 验证 admin 的 MCP 数据表管理、在线测试、工具列表与调用均正常。

4. **Phase 4 – mentis 裁剪**
   - 删除 mentis 的 MCP 配置相关代码与迁移；保留 E2B/Bridge/Inspector 等，并按需对接 main。

5. **Rollback**：保留 mentis 的 MCP 分支或标签，必要时可回退；admin 可临时复指 mentis 的 MCP 代理（若未删除）直至 main 稳定。

## Open Questions

- admin 多数据源下连接 main 库的配置方式（URL、账号、只读/读写策略等）需在实现时与运维约定。
- admin 转发在线测试/工具获取等业务请求至 main MCP API 时，main 的鉴权与 admin→main 的调用方式（同机/跨机、网关等）需对齐。
- E2B/Bridge 对接 main 的 MCP 配置的具体方式（HTTP 调 main vs 直接读库）待 mentis 侧后续设计确认。
