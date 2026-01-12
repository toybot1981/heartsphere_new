# MCP 集成改进说明

## 已完成的改进

### 1. Tavily MCP 服务器集成优化

#### 问题
Tavily MCP 服务器使用特殊的 HTTP API 调用方式，不遵循标准的 JSON-RPC 协议。

#### 解决方案
在 `McpClientService` 中添加了专门的 Tavily 处理方法：

- **`listTavilyTools()`**: 为 Tavily 创建标准的工具定义
  - 工具名称: `tavily_search`
  - 描述: "使用 Tavily 搜索引擎搜索互联网上的最新信息"
  - 参数: `query` (必需), `max_results` (可选，默认5)

- **`callTavilySearch()`**: 直接调用 Tavily API
  - 使用 Tavily 官方 API 端点: `https://api.tavily.com/search`
  - 自动从配置中提取 API Key
  - 将 Tavily 响应格式转换为 MCP 标准格式
  - 格式化搜索结果以便后续展示

### 2. 工具结果格式化改进

改进了 `McpIntegrationService.formatToolResult()` 方法，更好地展示搜索结果：

- **结构化展示**: 为每个搜索结果添加序号和分隔符
- **内容提取**: 支持多种结果格式
  - MCP 标准格式 (`content` 字段)
  - Tavily 原生格式 (`results` 字段)
- **内容截断**: 自动截断过长的内容（>500字符）
- **字段展示**: 展示标题、URL、内容等关键信息

### 3. 工具调用流程优化

#### 自动检测改进
- 更准确的关键词匹配
- 智能提取搜索查询（去除提示词）
- 支持中英文关键词识别

#### 错误处理增强
- 工具调用失败时的降级处理
- 详细的错误日志记录
- 用户友好的错误提示

## 技术细节

### Tavily API 调用示例

```java
// 请求格式
POST https://api.tavily.com/search
{
  "api_key": "your-api-key",
  "query": "搜索关键词",
  "max_results": 5,
  "search_depth": "basic"
}

// 响应格式转换
{
  "content": [
    {
      "type": "text",
      "text": "标题: ...\nURL: ...\n内容: ..."
    }
  ]
}
```

### 工具命名规则

- 系统内部工具名称: `mcp_{configId}_{toolName}`
- 示例: `mcp_1_tavily_search` (配置ID=1的Tavily搜索工具)

### 搜索意图检测

自动检测以下关键词：
- 中文: 搜索、查询、查找、找、搜、最新、最近、现在、当前、实时、最新消息、新闻
- 英文: search、find、lookup

## 使用示例

### 示例 1: 自动搜索

**用户输入**: "搜索一下最新的 AI 技术发展"

**处理流程**:
1. 检测到"搜索"关键词
2. 提取查询: "最新的 AI 技术发展"
3. 调用 `mcp_1_tavily_search` 工具
4. 获取搜索结果
5. 格式化结果并反馈给 AI
6. 生成包含搜索结果的回答

### 示例 2: 英文搜索

**用户输入**: "search for Python tutorials"

**处理流程**:
1. 检测到"search"关键词
2. 提取查询: "Python tutorials"
3. 调用搜索工具
4. 返回结果

## 配置要求

### Tavily 配置

确保 MCP 配置中的以下字段正确：

- **server_type**: `tavily`
- **server_url**: MCP 服务器 URL（包含 API Key）
- **api_key**: Tavily API Key
- **enabled**: `true`

### 数据库配置

确保 `mcp_server_configs` 表中有有效的 Tavily 配置：

```sql
SELECT * FROM mcp_server_configs WHERE server_type = 'tavily' AND enabled = 1;
```

## 测试建议

### 1. 基本功能测试

```bash
# 发送搜索请求
curl -X POST http://localhost:8082/api/mentis/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "message": "搜索最新的 AI 技术"
  }'
```

### 2. 查看日志

```bash
# 查看工具调用日志
tail -f mentis-backend.log | grep -E "tavily|search|工具调用"
```

### 3. 验证工具列表

```bash
# 获取可用工具
curl http://localhost:8082/api/mentis/mcp/configs/1/tools
```

## 性能优化

### 已实现的优化

1. **工具列表缓存**: 考虑在后续版本中添加缓存机制
2. **API Key 提取**: 自动从 URL 或配置中提取 API Key
3. **错误降级**: 工具调用失败时自动回退到普通对话

### 建议的进一步优化

1. **结果缓存**: 缓存相同查询的搜索结果（TTL: 1小时）
2. **并发调用**: 支持多个工具并行调用
3. **流式响应**: 支持流式返回搜索结果

## 故障排除

### 问题: Tavily 搜索返回空结果

**可能原因**:
- API Key 无效或过期
- 网络连接问题
- 查询参数格式错误

**解决方法**:
1. 验证 API Key: `curl https://api.tavily.com/search -X POST -H "Content-Type: application/json" -d '{"api_key":"your-key","query":"test"}'`
2. 检查网络连接
3. 查看详细错误日志

### 问题: 工具未被自动调用

**可能原因**:
- 用户消息中未包含搜索关键词
- MCP 配置未启用
- 工具列表为空

**解决方法**:
1. 检查 MCP 配置状态
2. 验证工具列表: `GET /api/mentis/mcp/configs/{id}/tools`
3. 查看意图检测日志

### 问题: 搜索结果格式不正确

**可能原因**:
- Tavily API 响应格式变化
- 结果解析逻辑错误

**解决方法**:
1. 检查 `callTavilySearch()` 方法
2. 验证 API 响应格式
3. 调整结果转换逻辑

## 下一步计划

1. **支持更多 MCP 服务器**: 
   - GitHub MCP
   - Filesystem MCP
   - Database MCP

2. **改进意图识别**:
   - 使用 LLM 进行更准确的意图识别
   - 支持更复杂的工具选择逻辑

3. **增强工具调用**:
   - 支持多工具链式调用
   - 支持工具调用的条件执行

4. **监控和统计**:
   - 记录工具调用统计
   - 分析工具使用情况
   - 优化工具推荐

## 相关文档

- [MCP 设置指南](./MCP_SETUP.md)
- [MCP 集成指南](./MCP_INTEGRATION_GUIDE.md)
