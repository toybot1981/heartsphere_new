#!/bin/bash

# 图片URL路径结构迁移脚本
# 使用方法: ./scripts/migrate-image-urls-to-new-structure.sh

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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_FILE="${SCRIPT_DIR}/../backend/src/main/resources/db/migration/V20250103003__migrate_image_urls_to_new_path_structure.sql"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-image-urls-before-migration.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  图片URL路径结构迁移脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e "${BLUE}迁移文件: ${MIGRATION_FILE}${NC}"
echo -e ""

# 检查迁移文件是否存在
if [ ! -f "${MIGRATION_FILE}" ]; then
    echo -e "${RED}错误: 迁移文件不存在: ${MIGRATION_FILE}${NC}"
    exit 1
fi

# 提示备份
echo -e "${YELLOW}提示: 建议在执行迁移前先备份数据${NC}"
echo -e "${YELLOW}执行备份脚本: ${BACKUP_SCRIPT}${NC}"
echo -e "${YELLOW}是否已备份？ (yes/no)${NC}"
read -r BACKUP_CONFIRM

if [ "${BACKUP_CONFIRM}" != "yes" ]; then
    echo -e "${YELLOW}是否现在执行备份？ (yes/no)${NC}"
    read -r BACKUP_NOW
    if [ "${BACKUP_NOW}" = "yes" ]; then
        if [ -f "${BACKUP_SCRIPT}" ]; then
            echo -e "${BLUE}执行备份...${NC}"
            bash "${BACKUP_SCRIPT}"
        else
            echo -e "${YELLOW}警告: 备份脚本不存在，继续执行迁移${NC}"
        fi
    else
        echo -e "${YELLOW}警告: 未执行备份，继续执行迁移${NC}"
    fi
fi

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_CMD="${MYSQL_CMD} -p${DB_PASSWORD}"
    export MYSQL_PWD="${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
fi

# 检查数据库连接
echo -e "${YELLOW}检查数据库连接...${NC}"
if ! ${MYSQL_CMD} -e "USE ${DB_NAME};" 2>/dev/null; then
    echo -e "${RED}错误: 无法连接到数据库${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库连接成功${NC}"

# 执行迁移
echo -e "${YELLOW}执行迁移脚本...${NC}"
${MYSQL_CMD} "${DB_NAME}" < "${MIGRATION_FILE}" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 迁移执行成功${NC}"
else
    echo -e "${RED}✗ 迁移执行失败${NC}"
    exit 1
fi

# 验证迁移结果
echo -e "${YELLOW}验证迁移结果...${NC}"
${MYSQL_CMD} "${DB_NAME}" -e "
SELECT 
    'system_resources' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN url LIKE '%/api/images/%' THEN 1 ELSE 0 END) AS old_format_count
FROM system_resources
UNION ALL
SELECT 
    'system_eras' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url LIKE '%/api/images/%' THEN 1 ELSE 0 END) AS old_format_count
FROM system_eras
UNION ALL
SELECT 
    'characters' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar_url LIKE '%/api/images/%' OR background_url LIKE '%/api/images/%' THEN 1 ELSE 0 END) AS old_format_count
FROM characters;
" 2>/dev/null || echo -e "${YELLOW}警告: 验证查询失败${NC}"

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}迁移完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${YELLOW}注意：${NC}"
echo -e "1. 用户资源的路径迁移可能需要额外处理"
echo -e "2. 建议使用检查脚本验证迁移结果："
echo -e "   ./scripts/check-database-image-urls.sh"
echo -e "   ./scripts/check-system-resources-urls.sh"
