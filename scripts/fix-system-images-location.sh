#!/bin/bash

# 修复系统预置图片位置
# 将错误放置在用户文件夹下的系统预置图片移动到系统文件夹
# 使用方法: ./scripts/fix-system-images-location.sh

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
UPLOAD_PATH="${PROJECT_ROOT}/backend/uploads/images"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  系统预置图片位置修复脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}上传目录: ${UPLOAD_PATH}${NC}"
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

# 创建更新SQL文件
UPDATE_SQL=$(mktemp)
MOVED_COUNT=0
FAILED_COUNT=0
SKIP_COUNT=0

# 处理 system_characters 表
echo -e "${YELLOW}处理 system_characters 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|avatar_url|', avatar_url)
FROM system_characters
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url LIKE '%/%/%/%/%'  -- 包含userId（错误格式）
ORDER BY id;
" 2>/dev/null | while IFS='|' read -r record_id field_name file_path; do
    if [ -z "${file_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    # 提取文件名和路径信息
    filename=$(basename "${file_path}")
    # 提取category/year/month（跳过userId）
    path_parts=($(echo "${file_path}" | tr '/' ' '))
    if [ ${#path_parts[@]} -ge 5 ]; then
        # 格式：userId/category/year/month/filename
        category="${path_parts[1]}"
        year="${path_parts[2]}"
        month="${path_parts[3]}"
        system_path="${category}/${year}/${month}/${filename}"
        user_path="${file_path}"
    else
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    # 检查文件是否在用户文件夹下
    OLD_FILE="${UPLOAD_PATH}/${user_path}"
    NEW_FILE="${UPLOAD_PATH}/${system_path}"
    NEW_DIR="${UPLOAD_PATH}/${category}/${year}/${month}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        echo -e "${YELLOW}跳过: 文件不存在 - ${OLD_FILE}${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        echo -e "${YELLOW}跳过: 目标文件已存在 - ${NEW_FILE}${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        # 仍然更新数据库路径
        echo "UPDATE system_characters SET avatar_url = '${system_path}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    # 创建新目录
    mkdir -p "${NEW_DIR}"
    
    # 移动文件
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_characters.${record_id}.avatar_url: ${user_path} -> ${system_path}${NC}"
        echo "UPDATE system_characters SET avatar_url = '${system_path}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        echo -e "${RED}✗ 移动失败: ${OLD_FILE}${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_characters.background_url
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|background_url|', background_url)
FROM system_characters
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_characters.${record_id}.background_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_eras 表
echo -e "${YELLOW}处理 system_eras 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|image_url|', image_url)
FROM system_eras
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND image_url NOT LIKE 'http://%' 
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_eras.${record_id}.image_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_resources 表
echo -e "${YELLOW}处理 system_resources 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|url|', url)
FROM system_resources
WHERE url IS NOT NULL 
  AND url != '' 
  AND url NOT LIKE 'http://%' 
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_resources.${record_id}.url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_era_items 表
echo -e "${YELLOW}处理 system_era_items 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|icon_url|', icon_url)
FROM system_era_items
WHERE icon_url IS NOT NULL 
  AND icon_url != '' 
  AND icon_url NOT LIKE 'http://%' 
  AND icon_url NOT LIKE 'https://%'
  AND icon_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_era_items.${record_id}.icon_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_era_events 表
echo -e "${YELLOW}处理 system_era_events 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|icon_url|', icon_url)
FROM system_era_events
WHERE icon_url IS NOT NULL 
  AND icon_url != '' 
  AND icon_url NOT LIKE 'http://%' 
  AND icon_url NOT LIKE 'https://%'
  AND icon_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_era_events.${record_id}.icon_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 system_main_stories 表
echo -e "${YELLOW}处理 system_main_stories 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|avatar_url|', avatar_url)
FROM system_main_stories
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_main_stories.${record_id}.avatar_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|background_url|', background_url)
FROM system_main_stories
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE 'placeholder://%';
" 2>/dev/null | while IFS='|' read -r record_id field_name db_path; do
    if [ -z "${db_path}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    filename=$(basename "${db_path}")
    expected_path="${UPLOAD_PATH}/${db_path}"
    
    if [ -f "${expected_path}" ]; then
        continue
    fi
    
    found_file=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" | head -1)
    
    if [ -z "${found_file}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    relative_path=${found_file#${UPLOAD_PATH}/}
    NEW_FILE="${UPLOAD_PATH}/${db_path}"
    NEW_DIR=$(dirname "${NEW_FILE}")
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${found_file}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ system_main_stories.${record_id}.background_url: ${relative_path} -> ${db_path}${NC}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 注意：数据库记录已经是正确的系统路径格式，不需要更新
# 只需要移动文件即可

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}系统预置图片位置修复完成！${NC}"
echo -e "${GREEN}成功: ${MOVED_COUNT}, 失败: ${FAILED_COUNT}, 跳过: ${SKIP_COUNT}${NC}"
echo -e "${GREEN}========================================${NC}"
