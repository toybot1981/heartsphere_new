#!/bin/bash

# 查找系统预置图片在用户文件夹中的位置
# 使用方法: ./scripts/find-system-images-in-user-folders.sh

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
echo -e "${GREEN}  查找系统预置图片在用户文件夹中的位置${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}上传目录: ${UPLOAD_PATH}${NC}"
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

echo -e "${YELLOW}检查系统预置图片位置...${NC}"
echo -e ""

MISMATCH_COUNT=0

# 检查 system_characters 表
echo -e "${BLUE}检查 system_characters 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|avatar_url|', avatar_url)
FROM system_characters
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
    
    # 检查文件是否在预期位置
    if [ -f "${expected_path}" ]; then
        continue  # 文件在正确位置
    fi
    
    # 在用户文件夹中查找
    found_files=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" || true)
    
    if [ -n "${found_files}" ]; then
        for found_file in ${found_files}; do
            relative_path=${found_file#${UPLOAD_PATH}/}
            echo -e "${RED}✗ system_characters.${record_id}.avatar_url${NC}"
            echo -e "  数据库路径: ${db_path}"
            echo -e "  实际位置: ${relative_path}"
            echo -e "  文件: ${found_file}"
            echo ""
            MISMATCH_COUNT=$((MISMATCH_COUNT + 1))
        done
    fi
done

# 检查 system_eras 表
echo -e "${BLUE}检查 system_eras 表...${NC}"
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
    
    found_files=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" || true)
    
    if [ -n "${found_files}" ]; then
        for found_file in ${found_files}; do
            relative_path=${found_file#${UPLOAD_PATH}/}
            echo -e "${RED}✗ system_eras.${record_id}.image_url${NC}"
            echo -e "  数据库路径: ${db_path}"
            echo -e "  实际位置: ${relative_path}"
            echo -e "  文件: ${found_file}"
            echo ""
            MISMATCH_COUNT=$((MISMATCH_COUNT + 1))
        done
    fi
done

# 检查 system_resources 表
echo -e "${BLUE}检查 system_resources 表...${NC}"
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
    
    found_files=$(find "${UPLOAD_PATH}" -type f -name "${filename}" 2>/dev/null | grep -E "/[0-9]+/" || true)
    
    if [ -n "${found_files}" ]; then
        for found_file in ${found_files}; do
            relative_path=${found_file#${UPLOAD_PATH}/}
            echo -e "${RED}✗ system_resources.${record_id}.url${NC}"
            echo -e "  数据库路径: ${db_path}"
            echo -e "  实际位置: ${relative_path}"
            echo -e "  文件: ${found_file}"
            echo ""
            MISMATCH_COUNT=$((MISMATCH_COUNT + 1))
        done
    fi
done

echo -e "${GREEN}========================================${NC}"
if [ "${MISMATCH_COUNT}" -gt 0 ]; then
    echo -e "${YELLOW}发现 ${MISMATCH_COUNT} 个位置不匹配的系统预置图片${NC}"
    echo -e "${YELLOW}请运行修复脚本: ./scripts/fix-system-images-location.sh${NC}"
else
    echo -e "${GREEN}✓ 所有系统预置图片位置正确${NC}"
fi
echo -e "${GREEN}========================================${NC}"
