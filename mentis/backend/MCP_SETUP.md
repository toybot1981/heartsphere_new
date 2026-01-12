# MCP 配置和接入指南

## 概述

MCP (Model Context Protocol) 是一个标准化的协议，用于 AI 应用与外部工具和服务的集成。Mentis 现在支持配置和接入外部 MCP 服务器。

## 快速开始

### 1. 创建数据库表

运行数据库迁移脚本：

```sql
-- 文件位置: mentis/backend/src/main/resources/db/migration/V20260111__create_mcp_server_configs_table.sql
```

或者手动执行 SQL 创建表。

### 2. 配置 Tavily MCP 服务器

Tavily 是一个网络搜索 MCP 服务器，已经预配置在数据库迁移脚本中。

**配置信息：**
- **名称**: Tavily 搜索
- **类型**: tavily
- **URL**: `https://mcp.tavily.com/mcp/?tavilyApiKey=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`
- **API Key**: `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`

### 3. 访问配置界面

启动服务后，访问：
- **前端**: http://localhost:3002/mentis/mcp/configs
- **API**: http://localhost:8082/api/mentis/mcp/configs

## API 接口

### 获取所有配置
```
GET /api/mentis/mcp/configs
```

### 创建配置
```
POST /api/mentis/mcp/configs
Content-Type: application/json

{
  "name": "配置名称",
  "serverType": "tavily",
  "serverUrl": "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_API_KEY",
  "apiKey": "YOUR_API_KEY",
  "enabled": true,
  "description": "配置描述"
}
```

### 测试连接
```
POST /api/mentis/mcp/configs/{id}/test
```

### 列出工具
```
GET /api/mentis/mcp/configs/{id}/tools
```

### 调用工具
```
POST /api/mentis/mcp/configs/{id}/tools/{toolName}/call
Content-Type: application/json

{
  "arguments": {
    "query": "搜索关键词"
  }
}
```

## 使用示例

### 在代码中使用 MCP 客户端

```java
@Autowired
private McpClientService mcpClientService;

@Autowired
private McpConfigService mcpConfigService;

// 获取配置
McpServerConfig config = mcpConfigService.getConfig(configId);

// 列出可用工具
List<Map<String, Object>> tools = mcpClientService.listTools(config);

// 调用工具
Map<String, Object> arguments = new HashMap<>();
arguments.put("query", "搜索内容");
Map<String, Object> result = mcpClientService.callTool(config, "tavily_search", arguments);
```

## 支持的 MCP 服务器类型

1. **Tavily** - 网络搜索
2. **Filesystem** - 文件系统操作
3. **GitHub** - GitHub 集成
4. **Custom** - 自定义 MCP 服务器

## 注意事项

1. API Key 存储在数据库中，建议在生产环境中加密存储
2. 测试连接功能会验证 MCP 服务器的可访问性
3. 只有启用的配置才会在对话系统中使用
4. MCP 服务器必须支持 JSON-RPC 2.0 协议

## 故障排除

### 连接测试失败

1. 检查服务器 URL 是否正确
2. 验证 API Key 是否有效
3. 确认网络连接正常
4. 查看服务器日志获取详细错误信息

### 工具调用失败

1. 确认工具名称正确
2. 检查参数格式是否符合工具要求
3. 查看 MCP 服务器文档了解正确的调用方式
