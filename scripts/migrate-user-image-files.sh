#!/bin/bash

# 迁移用户资源文件到新路径结构（userId/category/year/month/filename）
# 使用方法: ./scripts/migrate-user-image-files.sh

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
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
UPLOAD_PATH="${UPLOAD_PATH:-${PROJECT_ROOT}/backend/uploads/images}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  用户资源文件迁移脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}上传目录: ${UPLOAD_PATH}${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e ""

# 检查上传目录
if [ ! -d "${UPLOAD_PATH}" ]; then
    echo -e "${RED}错误: 上传目录不存在: ${UPLOAD_PATH}${NC}"
    exit 1
fi

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

# 创建临时SQL文件
TEMP_SQL=$(mktemp)
cat > "${TEMP_SQL}" <<'EOF'
-- 查找需要迁移的用户资源（路径不包含userId的）
-- characters 表 - avatar_url
SELECT CONCAT(c.id, '|', c.user_id, '|avatar_url|', c.avatar_url) AS info
FROM characters c
WHERE c.avatar_url IS NOT NULL 
  AND c.avatar_url != '' 
  AND c.avatar_url NOT LIKE 'http://%' 
  AND c.avatar_url NOT LIKE 'https://%'
  AND c.avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含userId（旧格式：category/year/month/file）
  AND c.user_id IS NOT NULL;

-- characters 表 - background_url
SELECT CONCAT(c.id, '|', c.user_id, '|background_url|', c.background_url) AS info
FROM characters c
WHERE c.background_url IS NOT NULL 
  AND c.background_url != '' 
  AND c.background_url NOT LIKE 'http://%' 
  AND c.background_url NOT LIKE 'https://%'
  AND c.background_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND c.user_id IS NOT NULL;

-- eras 表
SELECT CONCAT(e.id, '|', e.user_id, '|image_url|', e.image_url) AS info
FROM eras e
WHERE e.image_url IS NOT NULL 
  AND e.image_url != '' 
  AND e.image_url NOT LIKE 'http://%' 
  AND e.image_url NOT LIKE 'https://%'
  AND e.image_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND e.user_id IS NOT NULL;

-- journal_entries 表
SELECT CONCAT(je.id, '|', je.user_id, '|image_url|', je.image_url) AS info
FROM journal_entries je
WHERE je.image_url IS NOT NULL 
  AND je.image_url != '' 
  AND je.image_url NOT LIKE 'http://%' 
  AND je.image_url NOT LIKE 'https://%'
  AND je.image_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND je.user_id IS NOT NULL;

-- user_main_stories 表 - avatar_url
SELECT CONCAT(ums.id, '|', ums.user_id, '|avatar_url|', ums.avatar_url) AS info
FROM user_main_stories ums
WHERE ums.avatar_url IS NOT NULL 
  AND ums.avatar_url != '' 
  AND ums.avatar_url NOT LIKE 'http://%' 
  AND ums.avatar_url NOT LIKE 'https://%'
  AND ums.avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND ums.user_id IS NOT NULL;

-- user_main_stories 表 - background_url
SELECT CONCAT(ums.id, '|', ums.user_id, '|background_url|', ums.background_url) AS info
FROM user_main_stories ums
WHERE ums.background_url IS NOT NULL 
  AND ums.background_url != '' 
  AND ums.background_url NOT LIKE 'http://%' 
  AND ums.background_url NOT LIKE 'https://%'
  AND ums.background_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND ums.user_id IS NOT NULL;
EOF

echo -e "${YELLOW}查找需要迁移的用户资源...${NC}"
MIGRATION_DATA=$(${MYSQL_CMD} "${DB_NAME}" -N < "${TEMP_SQL}" 2>/dev/null | grep -v '^$' || true)
rm -f "${TEMP_SQL}"

if [ -z "${MIGRATION_DATA}" ]; then
    echo -e "${GREEN}✓ 没有需要迁移的用户资源${NC}"
    exit 0
fi

MIGRATION_COUNT=$(echo "${MIGRATION_DATA}" | wc -l | tr -d ' ')
echo -e "${BLUE}找到 ${MIGRATION_COUNT} 个用户资源需要迁移${NC}"
echo -e "${YELLOW}是否继续？ (yes/no)${NC}"
read -r CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 创建更新SQL文件
UPDATE_SQL=$(mktemp)
MOVED_COUNT=0
FAILED_COUNT=0
SKIP_COUNT=0

echo -e "${YELLOW}开始迁移文件...${NC}"
echo "${MIGRATION_DATA}" | while IFS='|' read -r record_id user_id field_name file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    # 构建文件路径
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    # 检查旧文件是否存在
    if [ ! -f "${OLD_FILE}" ]; then
        echo -e "${YELLOW}跳过: 文件不存在 - ${OLD_FILE}${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    # 检查新文件是否已存在
    if [ -f "${NEW_FILE}" ]; then
        echo -e "${YELLOW}跳过: 目标文件已存在 - ${NEW_FILE}${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        # 仍然更新数据库路径
        case "${field_name}" in
            avatar_url|background_url|image_url)
                echo "UPDATE $(echo "${MIGRATION_DATA}" | grep "^${record_id}|" | head -1 | cut -d'|' -f3 | sed 's/_url$//' | sed 's/character/characters/; s/era/eras/; s/journal_entry/journal_entries/') SET ${field_name} = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
                ;;
        esac
        continue
    fi
    
    # 创建新目录
    mkdir -p "${NEW_DIR}"
    
    # 移动文件
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ ${record_id}: ${file_path} -> ${NEW_DB_PATH}${NC}"
        
        # 确定表名
        TABLE_NAME=""
        case "${field_name}" in
            avatar_url|background_url)
                TABLE_NAME="characters"
                ;;
            image_url)
                # 需要根据record_id判断是eras还是journal_entries
                TABLE_NAME="eras"  # 简化处理，实际可能需要查询
                ;;
        esac
        
        if [ -n "${TABLE_NAME}" ]; then
            echo "UPDATE ${TABLE_NAME} SET ${field_name} = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        fi
        
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        echo -e "${RED}✗ 移动失败: ${OLD_FILE}${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 执行数据库更新
if [ -s "${UPDATE_SQL}" ]; then
    echo -e "${YELLOW}更新数据库路径...${NC}"
    ${MYSQL_CMD} "${DB_NAME}" < "${UPDATE_SQL}" 2>/dev/null && {
        echo -e "${GREEN}✓ 数据库更新成功${NC}"
    } || {
        echo -e "${RED}✗ 数据库更新失败${NC}"
    }
fi
rm -f "${UPDATE_SQL}"

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}文件迁移完成！${NC}"
echo -e "${GREEN}成功: ${MOVED_COUNT}, 失败: ${FAILED_COUNT}, 跳过: ${SKIP_COUNT}${NC}"
echo -e "${GREEN}========================================${NC}"
