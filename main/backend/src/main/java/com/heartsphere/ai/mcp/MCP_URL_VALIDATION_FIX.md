# MCP URL 验证和修复指南

## 问题描述

当 MCP 配置中的 `serverUrl` 不是有效的 HTTP/HTTPS URL（如 `"uvx mcp-server-fetch"` 这样的命令）时，会导致以下错误：

```
MCP list tools failed: uvx mcp-server-fetch
org.springframework.web.client.ResourceAccessException: I/O error on POST request for "/uvx%20mcp-server-fetch": Target host is not specified
```

## 原因

当前 MCP 实现仅支持 HTTP/HTTPS 类型的 MCP 服务器。如果 `serverUrl` 不是以 `http://` 或 `https://` 开头的完整 URL，会导致 RestTemplate 无法正确解析。

## 解决方案

### 1. 代码层面修复（已完成）

- ✅ 在 `McpClientService.buildRequestUrl()` 中添加了 URL 验证
- ✅ 在 `McpConfigServiceImpl` 的 `createConfig()`、`updateConfig()`、`createConfigFromTemplate()` 中添加了验证
- ✅ 创建了 `McpUrlValidator` 工具类
- ✅ 改进了 `McpHealthMonitor` 的错误处理

### 2. 检查数据库中的无效配置

#### 方法 1：使用 API 检查

```bash
# 检查所有配置的 URL 有效性
curl -X GET http://localhost:8081/api/v1/ai/mcp/configs/validate-urls
```

响应示例：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "invalidCount": 2,
    "allValid": false,
    "invalidConfigs": [
      {
        "id": 1,
        "name": "Fetch MCP",
        "serverType": "fetch",
        "serverUrl": "uvx mcp-server-fetch",
        "enabled": true,
        "error": "URL 格式无效（必须是 http:// 或 https:// 开头）: 'uvx mcp-server-fetch'"
      }
    ]
  }
}
```

#### 方法 2：使用 SQL 查询

```sql
-- 查找所有无效 URL 的配置
SELECT 
    id,
    name,
    server_type,
    server_url,
    enabled,
    connection_status,
    last_error
FROM mcp_server_configs
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%'
ORDER BY id;
```

#### 方法 3：使用检查脚本

```bash
# 仅检查，不修复
./scripts/check-mcp-config-urls.sh

# 或使用修复脚本检查
./scripts/fix-invalid-mcp-urls.sh --check-only
```

### 3. 修复无效配置

#### 方法 1：通过 API 更新配置

```bash
# 更新配置的 serverUrl
curl -X PUT http://localhost:8081/api/v1/ai/mcp/configs/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "配置名称",
    "serverType": "fetch",
    "serverUrl": "https://your-mcp-server-url.com/mcp",
    "enabled": true
  }'
```

#### 方法 2：使用修复脚本

```bash
# 禁用所有无效配置
./scripts/fix-invalid-mcp-urls.sh --disable-invalid

# 修复指定配置
./scripts/fix-invalid-mcp-urls.sh --fix-url 1 "https://your-mcp-server-url.com/mcp"
```

#### 方法 3：直接更新数据库

```sql
-- 更新指定配置的 URL
UPDATE mcp_server_configs 
SET server_url = 'https://your-mcp-server-url.com/mcp',
    connection_status = 'DISCONNECTED',
    last_error = NULL,
    updated_at = NOW()
WHERE id = 1;

-- 或者禁用无效配置
UPDATE mcp_server_configs 
SET enabled = 0,
    connection_status = 'ERROR',
    last_error = 'URL 格式无效（必须是 http:// 或 https:// 开头）',
    updated_at = NOW()
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%';
```

### 4. 对于本地命令类型的 MCP 服务器

如果确实需要使用本地命令类型的 MCP 服务器（如 `uvx mcp-server-fetch`），有以下选项：

#### 选项 1：配置 HTTP 代理

将本地命令包装为 HTTP 服务：

```bash
# 使用工具将 stdio MCP 服务器转换为 HTTP 服务
# 例如使用 mcp-http-bridge 等工具
```

然后配置 `serverUrl` 为代理的 HTTP 地址：
```
https://localhost:8080/mcp
```

#### 选项 2：实现 stdio 类型的 MCP 客户端

如果需要支持 stdio 类型的 MCP 服务器，需要：
1. 扩展 `McpClientService` 支持 stdio 连接
2. 在 `serverType` 中区分 HTTP 和 stdio 类型
3. 根据类型选择不同的连接方式

## 预防措施

### 1. 配置创建时的验证

现在所有配置创建/更新都会自动验证 URL 格式，无效 URL 会在保存时被拒绝。

### 2. 健康检查

定期健康检查会自动检测无效 URL 并记录错误信息。

### 3. 前端验证

建议在前端表单中添加 URL 格式验证：

```typescript
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};
```

## 相关文件

- `main/backend/src/main/java/com/heartsphere/ai/mcp/util/McpUrlValidator.java` - URL 验证工具类
- `main/backend/src/main/java/com/heartsphere/ai/mcp/service/McpClientService.java` - MCP 客户端服务
- `main/backend/src/main/java/com/heartsphere/ai/mcp/service/McpConfigServiceImpl.java` - 配置服务实现
- `scripts/check-mcp-config-urls.sh` - 检查脚本
- `scripts/fix-invalid-mcp-urls.sh` - 修复脚本
- `main/backend/src/main/resources/db/migration/V20260128__validate_and_fix_mcp_urls.sql` - 数据库修复脚本

## API 端点

- `GET /api/v1/ai/mcp/configs/validate-urls` - 验证所有配置的 URL
