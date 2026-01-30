-- 检查 MCP 配置中的无效 URL
-- 查找所有 server_url 不是以 http:// 或 https:// 开头的配置

SELECT 
    id,
    name,
    server_type,
    server_url,
    enabled,
    connection_status,
    last_error,
    created_at,
    updated_at
FROM mcp_server_configs
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%'
ORDER BY id;

-- 统计信息
SELECT 
    COUNT(*) as invalid_url_count,
    GROUP_CONCAT(DISTINCT server_type) as affected_server_types
FROM mcp_server_configs
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%';
