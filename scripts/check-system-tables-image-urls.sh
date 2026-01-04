#!/bin/bash

# 检查所有系统表的图片URL格式
# 使用方法: ./scripts/check-system-tables-image-urls.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  系统表图片URL检查脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e ""

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    export MYSQL_PWD="${DB_PASSWORD}"
fi

# 检查数据库连接
if ! ${MYSQL_CMD} -e "USE ${DB_NAME};" 2>/dev/null; then
    echo -e "${RED}错误: 无法连接到数据库${NC}"
    exit 1
fi

echo -e "${YELLOW}检查系统表图片URL格式...${NC}"
echo -e ""

# 创建临时SQL文件
TEMP_SQL=$(mktemp)
cat > "${TEMP_SQL}" <<'EOF'
-- 检查所有系统表的图片URL
SELECT 
    'system_characters' AS table_name,
    'avatar_url' AS column_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END) AS empty_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar_url LIKE '%/api/images/%' THEN 1 ELSE 0 END) AS old_format_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' AND avatar_url NOT LIKE 'http://picsum%' AND avatar_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END) AS http_count,
    SUM(CASE WHEN avatar_url LIKE 'https://%' AND avatar_url NOT LIKE 'https://picsum%' AND avatar_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END) AS https_count
FROM system_characters

UNION ALL

SELECT 
    'system_characters',
    'background_url',
    COUNT(*),
    SUM(CASE WHEN background_url IS NULL OR background_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'http://%' AND background_url NOT LIKE 'http://picsum%' AND background_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'https://%' AND background_url NOT LIKE 'https://picsum%' AND background_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_characters
WHERE background_url IS NOT NULL

UNION ALL

SELECT 
    'system_eras',
    'image_url',
    COUNT(*),
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE 'http://%' AND image_url NOT LIKE 'http://picsum%' AND image_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE 'https://%' AND image_url NOT LIKE 'https://picsum%' AND image_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_eras

UNION ALL

SELECT 
    'system_resources',
    'url',
    COUNT(*),
    SUM(CASE WHEN url IS NULL OR url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN url LIKE 'http://%' AND url NOT LIKE 'http://picsum%' AND url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN url LIKE 'https://%' AND url NOT LIKE 'https://picsum%' AND url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_resources

UNION ALL

SELECT 
    'system_era_items',
    'icon_url',
    COUNT(*),
    SUM(CASE WHEN icon_url IS NULL OR icon_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE 'http://%' AND icon_url NOT LIKE 'http://picsum%' AND icon_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE 'https://%' AND icon_url NOT LIKE 'https://picsum%' AND icon_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_era_items
WHERE icon_url IS NOT NULL

UNION ALL

SELECT 
    'system_era_events',
    'icon_url',
    COUNT(*),
    SUM(CASE WHEN icon_url IS NULL OR icon_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE 'http://%' AND icon_url NOT LIKE 'http://picsum%' AND icon_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN icon_url LIKE 'https://%' AND icon_url NOT LIKE 'https://picsum%' AND icon_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_era_events
WHERE icon_url IS NOT NULL

UNION ALL

SELECT 
    'system_main_stories',
    'avatar_url',
    COUNT(*),
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE 'http://%' AND avatar_url NOT LIKE 'http://picsum%' AND avatar_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE 'https://%' AND avatar_url NOT LIKE 'https://picsum%' AND avatar_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_main_stories
WHERE avatar_url IS NOT NULL

UNION ALL

SELECT 
    'system_main_stories',
    'background_url',
    COUNT(*),
    SUM(CASE WHEN background_url IS NULL OR background_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'http://%' AND background_url NOT LIKE 'http://picsum%' AND background_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'https://%' AND background_url NOT LIKE 'https://picsum%' AND background_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END)
FROM system_main_stories
WHERE background_url IS NOT NULL;
EOF

# 执行检查
${MYSQL_CMD} "${DB_NAME}" < "${TEMP_SQL}" 2>/dev/null | column -t

rm -f "${TEMP_SQL}"

echo -e ""
echo -e "${YELLOW}检查完成！${NC}"
echo -e "${BLUE}说明：${NC}"
echo -e "  - localhost_count: 包含 localhost 的URL数量"
echo -e "  - old_format_count: 包含 /api/images/ 的旧格式URL数量"
echo -e "  - http_count: 非占位符的 http:// URL数量"
echo -e "  - https_count: 非占位符的 https:// URL数量"
echo -e ""
echo -e "${YELLOW}理想情况：以上计数都应该为 0（外部URL如 picsum.photos 除外）${NC}"
