# MCP Protocol Integration

MCP (Model Context Protocol) 协议集成，为智能体提供标准化的工具和上下文访问接口。

## 核心组件

### 1. McpProtocol 接口
定义 MCP 协议的标准接口：
- `getAvailableTools(agentId)` - 获取智能体可访问的工具列表
- `executeTool(agentId, toolName, parameters)` - 执行 MCP 工具
- `shareContext(fromAgentId, toAgentIds, context)` - 共享上下文信息
- `getSharedContext(agentId)` - 获取共享的上下文信息
- `hasToolAccess(agentId, toolName)` - 检查工具访问权限

### 2. McpProtocolImpl 实现
MCP 协议的默认实现：
- 工具注册和管理
- 智能体工具访问权限管理
- 上下文共享机制
- 工具执行（通过 `McpToolExecutor` 调用 `ai.mcp` 模块的 MCP 客户端）

### 3. McpToolWrapper 工具包装器
为智能体提供便捷的 MCP 工具访问：
```java
McpToolWrapper wrapper = McpToolWrapper.forAgent(mcpProtocol, agent);

// 获取可用工具
List<McpTool> tools = wrapper.getAvailableTools();

// 执行工具
McpToolResult result = wrapper.execute("tool-name", parameters);

// 获取共享上下文
Map<String, Object> context = wrapper.getSharedContext();

// 共享上下文给其他智能体
wrapper.shareContext(toAgentIds, context);
```

## 使用示例

### 注册 MCP 工具

```java
@Autowired
private McpProtocolImpl mcpProtocol;

public void registerTool() {
    McpProtocol.McpTool tool = new McpProtocol.McpTool();
    tool.setName("search-tool");
    tool.setDescription("搜索工具");
    mcpProtocol.registerTool(tool);
}
```

### 授予智能体工具访问权限

```java
mcpProtocol.grantToolAccess("agent-1", Set.of("search-tool", "file-tool"));
```

### 智能体使用 MCP 工具

```java
public class MyAgent extends BaseAgent {
    @Autowired
    private McpProtocol mcpProtocol;
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 创建工具包装器
        McpToolWrapper wrapper = McpToolWrapper.forAgent(mcpProtocol, this);
        
        // 执行工具
        McpToolResult result = wrapper.execute("search-tool", Map.of("query", task));
        
        if (result.isSuccess()) {
            return AgentResult.success(result.getResult().toString());
        } else {
            return AgentResult.failure(result.getErrorMessage());
        }
    }
}
```

### 共享上下文

```java
// 智能体 A 共享上下文给智能体 B
mcpProtocol.shareContext("agent-a", List.of("agent-b"), Map.of(
    "search-results", results,
    "user-preference", preference
));

// 智能体 B 获取共享上下文
Map<String, Object> context = mcpProtocol.getSharedContext("agent-b");
```

## 与 ai.mcp 模块集成

MCP 功能已迁移至 main 项目的 `ai.mcp` 模块，作为 AI 基础设施与 `ai.skill` 并列。

### McpToolExecutor

`McpToolExecutor` 直接依赖 `ai.mcp` 模块的 `McpClientService` 和 `McpServerConfigRepository`：

```java
@Autowired
private McpClientService mcpClientService;  // 来自 ai.mcp
@Autowired
private McpServerConfigRepository mcpServerConfigRepository;  // 来自 ai.mcp
```

工具执行流程：
1. 从 `mcpServerConfigRepository` 查找启用的 MCP 服务器配置
2. 使用 `mcpClientService` 列出工具并执行
3. 支持工具名格式：`mcp_{configId}_{toolName}`

### MCP 配置管理

MCP 配置存储在 main 数据库（`heartsphere`）的 `mcp_server_configs` 表中，通过 main 的 REST API 管理：
- API 路径：`/api/v1/ai/mcp/configs`
- 详见：`com.heartsphere.ai.mcp.controller.McpConfigController`

## 权限管理

- 默认策略：如果没有明确配置权限，允许访问所有工具
- 可以通过 `grantToolAccess` 和 `revokeToolAccess` 管理权限
- 支持按智能体配置不同的工具访问权限

## 上下文共享

- 支持点对点共享（指定接收者）
- 支持广播共享（所有智能体）
- 上下文自动合并，不会覆盖已有数据
