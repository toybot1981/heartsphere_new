#!/bin/bash

# 修复 MCP 配置中的无效 URL
# 选项：
#   --check-only: 仅检查，不修复
#   --disable-invalid: 禁用所有无效 URL 的配置
#   --fix-url <id> <new_url>: 修复指定配置的 URL

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"

CHECK_ONLY=false
DISABLE_INVALID=false
FIX_ID=""
FIX_URL=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --disable-invalid)
            DISABLE_INVALID=true
            shift
            ;;
        --fix-url)
            FIX_ID="$2"
            FIX_URL="$3"
            shift 3
            ;;
        *)
            echo "未知参数: $1"
            echo "用法: $0 [--check-only] [--disable-invalid] [--fix-url <id> <new_url>]"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "MCP 配置 URL 检查和修复工具"
echo "=========================================="
echo "数据库: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo ""

# 检查无效 URL
echo "正在检查无效 URL 配置..."
INVALID_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -N -e "
SELECT COUNT(*) 
FROM mcp_server_configs 
WHERE server_url IS NOT NULL 
  AND server_url != '' 
  AND server_url NOT LIKE 'http://%' 
  AND server_url NOT LIKE 'https://%';
" 2>/dev/null)

if [ -z "$INVALID_COUNT" ] || [ "$INVALID_COUNT" = "0" ]; then
    echo "✅ 未发现无效 URL 配置"
    exit 0
fi

echo "⚠️  发现 $INVALID_COUNT 个无效 URL 配置"
echo ""

# 显示无效配置详情
echo "无效配置详情："
mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" <<EOF
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
EOF

echo ""

if [ "$CHECK_ONLY" = true ]; then
    echo "仅检查模式，不进行修复"
    echo ""
    echo "修复建议："
    echo "1. 将 server_url 更新为有效的 HTTP/HTTPS URL"
    echo "2. 使用 --disable-invalid 禁用所有无效配置"
    echo "3. 使用 --fix-url <id> <new_url> 修复指定配置"
    exit 0
fi

# 修复指定配置
if [ -n "$FIX_ID" ] && [ -n "$FIX_URL" ]; then
    echo "正在修复配置 ID=$FIX_ID，新 URL=$FIX_URL"
    mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" <<EOF
UPDATE mcp_server_configs 
SET server_url = '$FIX_URL',
    connection_status = 'DISCONNECTED',
    last_error = NULL,
    updated_at = NOW()
WHERE id = $FIX_ID;
EOF
    echo "✅ 配置已更新"
    exit 0
fi

# 禁用所有无效配置
if [ "$DISABLE_INVALID" = true ]; then
    echo "正在禁用所有无效 URL 配置..."
    DISABLED_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -N -e "
UPDATE mcp_server_configs 
SET enabled = 0,
    connection_status = 'ERROR',
    last_error = 'URL 格式无效（必须是 http:// 或 https:// 开头）',
    updated_at = NOW()
WHERE server_url IS NOT NULL 
  AND server_url != ''
  AND server_url NOT LIKE 'http://%'
  AND server_url NOT LIKE 'https://%';
SELECT ROW_COUNT();
" 2>/dev/null)
    
    echo "✅ 已禁用 $DISABLED_COUNT 个无效配置"
    echo ""
    echo "注意：这些配置已被禁用，需要手动修复 URL 后才能重新启用"
    exit 0
fi

echo "请指定操作："
echo "  --check-only: 仅检查"
echo "  --disable-invalid: 禁用所有无效配置"
echo "  --fix-url <id> <new_url>: 修复指定配置"
