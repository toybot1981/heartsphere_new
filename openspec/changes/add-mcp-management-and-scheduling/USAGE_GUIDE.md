# MCP 管理和调度系统使用指南

## 快速开始

### 1. 从模板创建 MCP 服务配置

使用预定义的模板快速创建配置：

```bash
POST /api/mentis/mcp/configs/from-template/{templateId}
Content-Type: application/json

{
  "apiKey": "your-api-key-here"
}
```

**可用的模板ID：**
- 1: Tavily Search
- 2: GitHub
- 3: Filesystem
- 4: PostgreSQL
- 5: Brave Search
- 6: Google Drive
- 7: Slack
- 8: Puppeteer
- 9: SQLite
- 10: Memory

### 2. 查看所有模板

```bash
GET /api/mentis/admin/mcp/templates
```

### 3. 发现并注册工具

**自动发现（系统启动时）：**
在 `application.properties` 中启用：
```properties
mentis.mcp.auto-discover=true
```

**手动发现：**
```bash
# 发现所有启用的 MCP 服务的工具
POST /api/mentis/mcp/tools/discover

# 为特定配置发现工具
POST /api/mentis/mcp/configs/{id}/tools/discover
```

### 4. 检查服务健康状态

```bash
# 检查单个服务
POST /api/mentis/mcp/configs/{id}/health

# 获取所有服务健康状态
GET /api/mentis/mcp/configs/health

# 手动触发健康检查
POST /api/mentis/mcp/configs/health/check-all
```

### 5. 查看工具元数据

```bash
# 获取所有工具元数据
GET /api/mentis/mcp/tools/metadata

# 获取特定配置的工具元数据
GET /api/mentis/mcp/configs/{id}/tools/metadata
```

## 配置管理

### 创建配置

```bash
POST /api/mentis/mcp/configs
Content-Type: application/json

{
  "name": "My Tavily Service",
  "serverType": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-tavily"],
  "env": {
    "TAVILY_API_KEY": "your-key"
  },
  "enabled": true
}
```

### 更新配置

```bash
PUT /api/mentis/mcp/configs/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "enabled": false
}
```

### 启用/禁用配置

```bash
PATCH /api/mentis/mcp/configs/{id}/toggle
```

### 测试连接

```bash
POST /api/mentis/mcp/configs/{id}/test
```

## 工具使用

### 列出工具

```bash
GET /api/mentis/mcp/configs/{id}/tools
```

### 调用工具

```bash
POST /api/mentis/mcp/configs/{id}/tools/{toolName}/call
Content-Type: application/json

{
  "query": "search term",
  "maxResults": 10
}
```

## 大脑集成

MCP 工具已自动集成到大脑调度系统。大脑会根据任务类型和描述自动选择最合适的工具：

- **搜索任务** → 自动选择 Tavily 或 Brave Search
- **数据查询** → 自动选择 PostgreSQL 或 SQLite
- **文件操作** → 自动选择 Filesystem
- **代码仓库** → 自动选择 GitHub

### 健康过滤

大脑在调度工具时会自动过滤不健康的服务，确保只使用可用的工具。

## 配置示例

### application.properties

```properties
# 启用自动发现 MCP 工具
mentis.mcp.auto-discover=true

# 健康检查间隔（默认 5 分钟）
mentis.mcp.health-check-interval=300000
```

## 常见问题

### Q: 工具没有被发现？

A: 检查：
1. MCP 服务配置是否已启用
2. 服务健康状态是否正常
3. API Key 是否正确

### Q: 工具执行失败？

A: 检查：
1. 服务健康状态
2. 工具参数是否正确
3. 查看日志获取详细错误信息

### Q: 如何添加新的 MCP 服务模板？

A: 使用模板管理 API：
```bash
POST /api/mentis/admin/mcp/templates
Content-Type: application/json

{
  "templateName": "My Service",
  "category": "search",
  "description": "My custom service",
  "serverType": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-myservice"],
  "defaultEnv": {
    "API_KEY": ""
  }
}
```

## 最佳实践

1. **使用模板**：优先使用模板创建配置，简化设置
2. **健康监控**：定期检查服务健康状态
3. **自动发现**：启用自动发现，确保工具及时注册
4. **错误处理**：监控日志，及时处理服务错误
5. **资源管理**：合理启用/禁用服务，避免资源浪费

## 相关文档

- [实施完成报告](./IMPLEMENTATION_COMPLETE.md)
- [设计文档](./design.md)
- [任务清单](./tasks.md)
