-- 验证并修复 MCP 配置中的无效 URL
-- 此脚本会：
-- 1. 检查所有 server_url 不是以 http:// 或 https:// 开头的配置
-- 2. 禁用这些配置并记录错误信息
-- 3. 提供修复建议

-- 检查无效 URL 的配置
SELECT 
    id,
    name,
    server_type,
    server_url,
    enabled,
    connection_status
FROM mcp_server_configs
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%'
ORDER BY id;

-- 禁用所有无效 URL 的配置并记录错误
UPDATE mcp_server_configs 
SET enabled = 0,
    connection_status = 'ERROR',
    last_error = CONCAT('URL 格式无效（必须是 http:// 或 https:// 开头）: ', server_url),
    updated_at = NOW()
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%';

-- 注意：此脚本会自动禁用无效配置
-- 修复后需要手动更新 server_url 并重新启用配置
