#!/bin/bash

# 检查所有用户表的图片URL格式
# 使用方法: ./scripts/check-user-tables-image-urls.sh

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
echo -e "${GREEN}  用户表图片URL检查脚本${NC}"
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

echo -e "${YELLOW}检查用户表图片URL格式...${NC}"
echo -e ""

# 创建临时SQL文件
TEMP_SQL=$(mktemp)
cat > "${TEMP_SQL}" <<'EOF'
-- 检查所有用户表的图片URL
SELECT 
    'characters' AS table_name,
    'avatar_url' AS column_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END) AS empty_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar_url LIKE '%/api/images/%' THEN 1 ELSE 0 END) AS old_format_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' AND avatar_url NOT LIKE 'http://picsum%' AND avatar_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END) AS http_count,
    SUM(CASE WHEN avatar_url LIKE 'https://%' AND avatar_url NOT LIKE 'https://picsum%' AND avatar_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END) AS https_count,
    SUM(CASE WHEN avatar_url NOT LIKE '%/%/%/%/%' AND avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url NOT LIKE 'placeholder://%' AND avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) AS missing_userid_count
FROM characters
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'characters',
    'background_url',
    COUNT(*),
    SUM(CASE WHEN background_url IS NULL OR background_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'http://%' AND background_url NOT LIKE 'http://picsum%' AND background_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'https://%' AND background_url NOT LIKE 'https://picsum%' AND background_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url NOT LIKE '%/%/%/%/%' AND background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url NOT LIKE 'placeholder://%' AND background_url IS NOT NULL AND background_url != '' THEN 1 ELSE 0 END)
FROM characters
WHERE background_url IS NOT NULL AND user_id IS NOT NULL

UNION ALL

SELECT 
    'eras',
    'image_url',
    COUNT(*),
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE 'http://%' AND image_url NOT LIKE 'http://picsum%' AND image_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url LIKE 'https://%' AND image_url NOT LIKE 'https://picsum%' AND image_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN image_url NOT LIKE '%/%/%/%/%' AND image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url NOT LIKE 'placeholder://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END)
FROM eras
WHERE user_id IS NOT NULL

UNION ALL

SELECT 
    'user_main_stories',
    'avatar_url',
    COUNT(*),
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE 'http://%' AND avatar_url NOT LIKE 'http://picsum%' AND avatar_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url LIKE 'https://%' AND avatar_url NOT LIKE 'https://picsum%' AND avatar_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN avatar_url NOT LIKE '%/%/%/%/%' AND avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url NOT LIKE 'placeholder://%' AND avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END)
FROM user_main_stories
WHERE avatar_url IS NOT NULL

UNION ALL

SELECT 
    'user_main_stories',
    'background_url',
    COUNT(*),
    SUM(CASE WHEN background_url IS NULL OR background_url = '' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%localhost%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE '%/api/images/%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'http://%' AND background_url NOT LIKE 'http://picsum%' AND background_url NOT LIKE 'http://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url LIKE 'https://%' AND background_url NOT LIKE 'https://picsum%' AND background_url NOT LIKE 'https://placeholder%' THEN 1 ELSE 0 END),
    SUM(CASE WHEN background_url NOT LIKE '%/%/%/%/%' AND background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url NOT LIKE 'placeholder://%' AND background_url IS NOT NULL AND background_url != '' THEN 1 ELSE 0 END)
FROM user_main_stories
WHERE background_url IS NOT NULL;
EOF

# 执行检查
${MYSQL_CMD} "${DB_NAME}" < "${TEMP_SQL}" 2>/dev/null | column -t

rm -f "${TEMP_SQL}"

echo -e ""
echo -e "${YELLOW}检查完成！${NC}"
echo -e "${BLUE}说明：${NC}"
echo -e "  - localhost_count: 包含 localhost 的URL数量（应为 0）"
echo -e "  - old_format_count: 包含 /api/images/ 的旧格式URL数量（应为 0）"
echo -e "  - http_count: 非占位符的 http:// URL数量（应为 0）"
echo -e "  - https_count: 非占位符的 https:// URL数量（应为 0）"
echo -e "  - missing_userid_count: 路径中缺少userId的记录数（需要迁移）"
echo -e ""
echo -e "${YELLOW}用户资源路径格式：userId/category/year/month/filename${NC}"
echo -e "${YELLOW}理想情况：localhost_count、old_format_count、http_count、https_count 都应该为 0${NC}"
