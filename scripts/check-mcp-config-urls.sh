#!/bin/bash

# 检查 MCP 配置中的无效 URL
# 查找所有 server_url 不是以 http:// 或 https:// 开头的配置

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"

echo "检查 MCP 配置中的无效 URL..."
echo "数据库: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo ""

mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" <<EOF
-- 查找所有无效 URL 的配置
SELECT 
    id,
    name,
    server_type,
    server_url,
    enabled,
    connection_status,
    last_error,
    created_at
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
EOF

echo ""
echo "检查完成！"
echo ""
echo "如果发现无效 URL，请："
echo "1. 将 server_url 更新为有效的 HTTP/HTTPS URL"
echo "2. 或者禁用该配置（如果不再使用）"
echo "3. 如果是本地命令类型的 MCP 服务器，需要配置 HTTP 代理或使用 stdio 客户端"
