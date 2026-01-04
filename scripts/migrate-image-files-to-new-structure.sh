#!/bin/bash

# 移动图片文件到新的路径结构
# 使用方法: ./scripts/migrate-image-files-to-new-structure.sh

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

# 图片存储路径（需要与实际配置一致）
UPLOAD_PATH="${UPLOAD_PATH:-./backend/uploads/images}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
UPLOAD_ABS_PATH="${PROJECT_ROOT}/${UPLOAD_PATH#./}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  图片文件路径迁移脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}上传目录: ${UPLOAD_ABS_PATH}${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e ""

# 检查上传目录是否存在
if [ ! -d "${UPLOAD_ABS_PATH}" ]; then
    echo -e "${RED}错误: 上传目录不存在: ${UPLOAD_ABS_PATH}${NC}"
    exit 1
fi

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    export MYSQL_PWD="${DB_PASSWORD}"
fi

# 检查数据库连接
echo -e "${YELLOW}检查数据库连接...${NC}"
if ! ${MYSQL_CMD} -e "USE ${DB_NAME};" 2>/dev/null; then
    echo -e "${RED}错误: 无法连接到数据库${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库连接成功${NC}"

# 创建临时SQL文件，用于查找需要移动的用户资源
TEMP_SQL=$(mktemp)
cat > "${TEMP_SQL}" <<'EOF'
-- 查找用户资源（需要移动到 userId 目录下）
-- characters 表
SELECT CONCAT('characters|avatar_url|', id, '|', user_id, '|', avatar_url) AS migration_info
FROM characters 
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;

SELECT CONCAT('characters|background_url|', id, '|', user_id, '|', background_url) AS migration_info
FROM characters 
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;

-- eras 表
SELECT CONCAT('eras|image_url|', id, '|', user_id, '|', image_url) AS migration_info
FROM eras 
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND image_url NOT LIKE 'http://%' 
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;

-- journal_entries 表
SELECT CONCAT('journal_entries|image_url|', id, '|', user_id, '|', image_url) AS migration_info
FROM journal_entries 
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND image_url NOT LIKE 'http://%' 
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;

-- user_main_stories 表
SELECT CONCAT('user_main_stories|avatar_url|', id, '|', user_id, '|', avatar_url) AS migration_info
FROM user_main_stories 
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;

SELECT CONCAT('user_main_stories|background_url|', id, '|', user_id, '|', background_url) AS migration_info
FROM user_main_stories 
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE '%/%/%/%/%'  -- 不包含 userId（旧格式）
  AND user_id IS NOT NULL;
EOF

echo -e "${YELLOW}查找需要移动的用户资源文件...${NC}"
MIGRATION_LIST=$(${MYSQL_CMD} "${DB_NAME}" -N < "${TEMP_SQL}" 2>/dev/null | grep -v '^$' || true)
rm -f "${TEMP_SQL}"

if [ -z "${MIGRATION_LIST}" ]; then
    echo -e "${GREEN}✓ 没有需要移动的用户资源文件${NC}"
else
    MIGRATION_COUNT=$(echo "${MIGRATION_LIST}" | wc -l | tr -d ' ')
    echo -e "${BLUE}找到 ${MIGRATION_COUNT} 个用户资源需要移动${NC}"
    echo -e "${YELLOW}是否继续？ (yes/no)${NC}"
    read -r CONFIRM
    
    if [ "${CONFIRM}" != "yes" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi
    
    # 处理每个用户资源
    MOVED_COUNT=0
    FAILED_COUNT=0
    UPDATE_SQL=$(mktemp)
    
    echo "${MIGRATION_LIST}" | while IFS='|' read -r table_name field_name record_id user_id file_path; do
        if [ -z "${file_path}" ] || [ -z "${user_id}" ]; then
            continue
        fi
        
        # 构建旧路径和新路径
        OLD_FILE="${UPLOAD_ABS_PATH}/${file_path}"
        NEW_PATH="${UPLOAD_ABS_PATH}/${user_id}/$(dirname "${file_path}")"
        NEW_FILE="${UPLOAD_ABS_PATH}/${user_id}/${file_path}"
        NEW_DB_PATH="${user_id}/${file_path}"
        
        # 检查旧文件是否存在
        if [ ! -f "${OLD_FILE}" ]; then
            echo -e "${YELLOW}警告: 文件不存在，跳过: ${OLD_FILE}${NC}"
            FAILED_COUNT=$((FAILED_COUNT + 1))
            continue
        fi
        
        # 创建新目录
        mkdir -p "${NEW_PATH}"
        
        # 移动文件
        if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
            echo -e "${GREEN}✓ 移动: ${file_path} -> ${NEW_DB_PATH}${NC}"
            
            # 记录SQL更新
            case "${field_name}" in
                avatar_url)
                    echo "UPDATE ${table_name} SET ${field_name} = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
                    ;;
                background_url)
                    echo "UPDATE ${table_name} SET ${field_name} = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
                    ;;
                image_url)
                    echo "UPDATE ${table_name} SET ${field_name} = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
                    ;;
            esac
            
            MOVED_COUNT=$((MOVED_COUNT + 1))
        else
            echo -e "${RED}✗ 移动失败: ${OLD_FILE}${NC}"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    done
    
    # 执行SQL更新
    if [ -s "${UPDATE_SQL}" ]; then
        echo -e "${YELLOW}更新数据库路径...${NC}"
        ${MYSQL_CMD} "${DB_NAME}" < "${UPDATE_SQL}" 2>/dev/null || {
            echo -e "${RED}错误: 数据库更新失败${NC}"
            rm -f "${UPDATE_SQL}"
            exit 1
        }
        echo -e "${GREEN}✓ 数据库更新成功${NC}"
    fi
    rm -f "${UPDATE_SQL}"
    
    echo -e "${GREEN}✓ 文件移动完成: 成功 ${MOVED_COUNT} 个，失败 ${FAILED_COUNT} 个${NC}"
fi

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}文件迁移完成！${NC}"
echo -e "${GREEN}========================================${NC}"
