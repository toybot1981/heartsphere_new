# MCP (Model Context Protocol) 基础设施

## 概述

MCP (Model Context Protocol) 功能已迁移至 main 项目，作为 AI 基础设施与 `ai.skill` 并列，位于 `com.heartsphere.ai.mcp` 包下。

## 模块结构

```
com.heartsphere.ai.mcp/
├── entity/
│   ├── McpServerConfig.java      # MCP 服务器配置实体
│   └── McpServiceTemplate.java   # MCP 服务模板实体
├── repository/
│   ├── McpServerConfigRepository.java
│   └── McpServiceTemplateRepository.java
├── service/
│   ├── McpConfigService.java          # MCP 配置管理服务接口
│   ├── McpConfigServiceImpl.java      # MCP 配置管理服务实现
│   ├── McpClientService.java          # MCP 客户端服务（调用外部 MCP 服务器）
│   ├── McpServiceTemplateService.java # MCP 服务模板服务
│   └── McpHealthMonitor.java          # MCP 健康检查服务
├── controller/
│   ├── McpConfigController.java      # MCP 配置 REST API
│   └── McpTemplateController.java     # MCP 模板 REST API
└── config/
    └── McpRestTemplateConfig.java     # MCP RestTemplate 配置
```

## 数据库

MCP 配置存储在 main 数据库（`heartsphere`）中：

- **表名**: `mcp_server_configs` - MCP 服务器配置表
- **表名**: `mcp_service_templates` - MCP 服务模板表
- **迁移脚本**: `main/backend/src/main/resources/db/migration/V20260130__create_mcp_tables_in_main.sql`
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci

## REST API

### 基础路径

所有 MCP API 的基础路径为：`/api/v1/ai/mcp`

### 配置管理 API

#### 获取所有配置
```
GET /api/v1/ai/mcp/configs?userId={userId}&enabled={enabled}
```

#### 获取单个配置
```
GET /api/v1/ai/mcp/configs/{id}
```

#### 创建配置
```
POST /api/v1/ai/mcp/configs
Content-Type: application/json

{
  "name": "配置名称",
  "serverType": "tavily",
  "serverUrl": "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_API_KEY",
  "apiKey": "YOUR_API_KEY",
  "enabled": true,
  "description": "配置描述",
  "templateId": 1
}
```

#### 更新配置
```
PUT /api/v1/ai/mcp/configs/{id}
Content-Type: application/json

{
  "name": "更新后的名称",
  ...
}
```

#### 删除配置
```
DELETE /api/v1/ai/mcp/configs/{id}
```

#### 启用/禁用配置
```
PATCH /api/v1/ai/mcp/configs/{id}/toggle
Content-Type: application/json

{
  "enabled": true
}
```

### 工具操作 API

#### 测试连接
```
POST /api/v1/ai/mcp/configs/{id}/test
```

#### 列出工具
```
GET /api/v1/ai/mcp/configs/{id}/tools
```

#### 调用工具
```
POST /api/v1/ai/mcp/configs/{id}/tools/{toolName}/call
Content-Type: application/json

{
  "arguments": {
    "query": "搜索关键词"
  }
}
```

### 模板 API

#### 获取所有模板
```
GET /api/v1/ai/mcp/templates?category={category}&popular={popular}
```

#### 获取单个模板
```
GET /api/v1/ai/mcp/templates/{id}
```

#### 从模板创建配置
```
POST /api/v1/ai/mcp/configs/from-template/{templateId}
Content-Type: application/json

{
  "apiKey": "YOUR_API_KEY",
  ...
}
```

### 健康检查 API

#### 检查单个配置健康状态
```
POST /api/v1/ai/mcp/configs/{id}/health
```

#### 获取所有配置健康状态
```
GET /api/v1/ai/mcp/configs/health
```

#### 触发所有配置健康检查
```
POST /api/v1/ai/mcp/configs/health/check-all
```

## 响应格式

所有 API 响应统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

错误响应：

```json
{
  "code": 500,
  "message": "错误信息",
  "data": null
}
```

## 使用示例

### 在代码中使用 MCP 服务

```java
@Autowired
private McpConfigService mcpConfigService;

@Autowired
private McpClientService mcpClientService;

// 获取配置
McpServerConfig config = mcpConfigService.getConfig(configId);

// 列出可用工具
List<Map<String, Object>> tools = mcpClientService.listTools(config);

// 调用工具
Map<String, Object> arguments = new HashMap<>();
arguments.put("query", "搜索内容");
Map<String, Object> result = mcpClientService.callTool(config, "tavily_search", arguments);
```

### 在 multiagent 中使用

`multiagent.protocol.mcp.McpToolExecutor` 已集成 `ai.mcp` 模块：

```java
@Autowired
private McpToolExecutor mcpToolExecutor;

// 执行工具（工具名格式：mcp_{configId}_{toolName}）
Object result = mcpToolExecutor.executeTool("mcp_1_tavily_search", Map.of("query", "AI"));
```

### 在 skill 中使用

技能可以通过 `mcp_tool_config` 字段引用 MCP 配置：

```json
{
  "mcp_tool_config": {
    "configId": 1,
    "toolName": "tavily_search"
  }
}
```

## 集成说明

### Admin 项目

Admin 项目通过以下方式使用 MCP：

1. **数据表管理**：直接操作 main 数据库的 `mcp_server_configs` 表（通过 `MentisMcpConfigRepository`）
2. **业务操作**：调用 main 的 REST API（`/api/v1/ai/mcp/...`）

### Mentis 项目

Mentis 项目中的 VM 相关 MCP 能力（E2B/Bridge/Inspector）保留，如需使用 MCP 配置，可调用 main 的 REST API。

## 迁移说明

MCP 功能已从 mentis 迁移至 main：

- ✅ 配置存储：从 mentis 数据库迁移至 main 数据库
- ✅ API 路径：从 `/api/mentis/mcp/...` 迁移至 `/api/v1/ai/mcp/...`
- ✅ 代码位置：从 `com.heartsphere.mentis.*` 迁移至 `com.heartsphere.ai.mcp.*`
- ✅ 依赖关系：`McpToolExecutor` 不再依赖 mentis，直接依赖 `ai.mcp`

## 支持的 MCP 服务器类型

1. **Tavily** - 网络搜索
2. **Filesystem** - 文件系统操作
3. **GitHub** - GitHub 集成
4. **PostgreSQL** - PostgreSQL 数据库
5. **Brave Search** - Brave 搜索
6. **Google Drive** - Google Drive 集成
7. **Slack** - Slack 集成
8. **Puppeteer** - 浏览器自动化
9. **SQLite** - SQLite 数据库
10. **Memory** - 上下文记忆

更多模板可通过 `GET /api/v1/ai/mcp/templates` 获取。

## 注意事项

1. **API Key 安全**：API Key 存储在数据库中，建议在生产环境中加密存储
2. **连接测试**：创建配置后建议先测试连接，确保 MCP 服务器可访问
3. **启用状态**：只有启用的配置才会被 skill、multiagent 等使用
4. **协议支持**：MCP 服务器必须支持 JSON-RPC 2.0 协议
5. **工具命名**：工具在系统中的命名格式为 `mcp_{configId}_{toolName}`

## 故障排除

### 连接测试失败

1. 检查服务器 URL 是否正确
2. 验证 API Key 是否有效
3. 确认网络连接正常
4. 查看服务器日志获取详细错误信息

### 工具调用失败

1. 确认工具名称正确（格式：`mcp_{configId}_{toolName}`）
2. 检查参数格式是否符合工具要求
3. 查看 MCP 服务器文档了解正确的调用方式
4. 验证配置是否已启用

### 健康检查失败

1. 检查 MCP 服务器是否正常运行
2. 验证网络连接和防火墙设置
3. 查看 `lastError` 字段获取详细错误信息
4. 尝试手动测试连接

## 参考资源

- [MCP 协议文档](https://modelcontextprotocol.io/)
- [main 项目 multiagent MCP 集成](../../multiagent/protocol/mcp/README.md)
- [设计文档](../../../../openspec/changes/migrate-mcp-from-mentis-to-main/design.md)
