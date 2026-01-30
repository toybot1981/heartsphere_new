# MCP 工具实际执行集成指南

## 概述

本文档说明如何将 MCP 工具的实际执行集成到多智能体系统中。**MCP 功能已从 mentis 迁移至 main 项目的 `ai.mcp` 模块**，作为 AI 基础设施与 `ai.skill` 并列。

## 架构设计

### 组件关系

```
McpProtocolImpl (多智能体模块)
    ↓
McpToolExecutor (工具执行器)
    ↓ (直接依赖注入)
McpClientService (ai.mcp 模块)
    ↓
MCP Server (外部 MCP 服务器)
```

**注意**：MCP 配置和客户端服务现在位于 main 项目的 `com.heartsphere.ai.mcp` 包下，不再依赖 mentis 模块。

### 关键组件

1. **McpToolExecutor** - MCP 工具执行器
   - 通过 Spring ApplicationContext 获取 mentis 模块的服务
   - 查找工具对应的 MCP 服务器配置
   - 调用 MCP 客户端服务执行工具
   - 缓存工具到服务器的映射

2. **McpProtocolImpl** - MCP 协议实现
   - 使用 McpToolExecutor 执行工具
   - 如果 executor 不可用，降级到模拟执行

## 实现细节

### 直接依赖注入

`McpToolExecutor` 现在直接注入 `ai.mcp` 模块的服务，无需条件注入或反射：

```java
@Component
@RequiredArgsConstructor
public class McpToolExecutor {
    private final McpClientService mcpClientService;  // 来自 ai.mcp
    private final McpServerConfigRepository mcpServerConfigRepository;  // 来自 ai.mcp
    
    // 直接调用，无需反射
    public Object executeTool(String toolName, Map<String, Object> parameters) {
        McpServerConfig serverConfig = findServerConfigForTool(toolName);
        return mcpClientService.callTool(serverConfig, toolName, parameters);
    }
}
```

### 数据源

MCP 配置存储在 main 数据库（`heartsphere`）的 `mcp_server_configs` 表中，由 main 项目的 Flyway 管理。

## 工具查找流程

1. **检查缓存** - 先检查工具名称到服务器配置的缓存
2. **查询数据库** - 从数据库查找所有启用的 MCP 服务器
3. **遍历服务器** - 遍历每个服务器，列出其提供的工具
4. **匹配工具** - 查找匹配的工具名称
5. **缓存结果** - 将找到的服务器配置缓存起来

## 使用方式

### 自动集成

如果 mentis 模块可用，系统会自动使用真实的 MCP 工具执行。无需额外配置。

### 工具注册

在 main 项目中配置 MCP 服务器（通过 REST API 或直接操作数据库）：

1. 通过 main 的 REST API 创建 MCP 服务器配置：`POST /api/v1/ai/mcp/configs`
2. 启用服务器：`PATCH /api/v1/ai/mcp/configs/{id}/toggle`
3. 工具会自动被发现和注册（通过 `McpToolDiscoveryService`）

### 工具执行

```java
@Autowired
private McpProtocol mcpProtocol;

// 执行工具
McpProtocol.McpToolResult result = mcpProtocol.executeTool(
    "agent-id",
    "tool-name",
    Map.of("param1", "value1")
);
```

## 降级处理

如果 mentis 模块不可用，系统会：

1. McpToolExecutor 不会被创建
2. McpProtocolImpl 会降级到模拟执行
3. 返回警告信息，但不会抛出异常

## 缓存管理

### 清除缓存

```java
@Autowired
private McpToolExecutor executor;

executor.clearCache();
```

### 刷新缓存

```java
executor.refreshCache();
```

## 故障排查

### 工具未找到

**问题**: "No MCP server found for tool: xxx"

**解决方案**:
1. 检查 MCP 服务器配置是否正确
2. 确认服务器已启用
3. 验证工具名称是否正确
4. 尝试刷新缓存

### 服务器连接失败

**问题**: "Failed to list tools from server"

**解决方案**:
1. 检查服务器 URL 是否正确
2. 验证网络连接
3. 检查 API Key 是否有效
4. 查看服务器日志

### Executor 不可用

**问题**: "MCP tool executor not available"

**解决方案**:
1. 确认 mentis 模块已启动
2. 检查依赖是否正确
3. 验证 Bean 是否正确注册

## 性能优化

### 缓存策略

- 工具到服务器的映射会被缓存
- 减少数据库查询和服务器调用
- 支持手动刷新缓存

### 异步执行

未来可以考虑：
- 异步执行工具调用
- 使用 CompletableFuture
- 支持超时和重试

## 安全考虑

1. **权限检查** - 确保智能体有权限访问工具
2. **参数验证** - 验证工具参数的有效性
3. **错误处理** - 妥善处理执行失败的情况
4. **日志记录** - 记录所有工具执行操作

## 参考资源

- [MCP 协议文档](https://modelcontextprotocol.io/)
- [main 项目 ai.mcp 模块](../../main/backend/src/main/java/com/heartsphere/ai/mcp/)
  - `McpClientService` - MCP 客户端服务
  - `McpConfigService` - MCP 配置管理
  - `McpConfigController` - REST API 控制器
- [MCP REST API 文档](../../main/backend/src/main/java/com/heartsphere/ai/mcp/controller/McpConfigController.java)
