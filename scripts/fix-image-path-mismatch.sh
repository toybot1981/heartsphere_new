#!/bin/bash

# 修复图片路径不匹配问题
# 检查数据库中记录的路径与实际文件系统中的文件位置是否一致
# 使用方法: ./scripts/fix-image-path-mismatch.sh

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
echo -e "${GREEN}  图片路径不匹配修复脚本${NC}"
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

echo -e "${YELLOW}检查用户资源图片路径不匹配...${NC}"
echo -e ""

# 检查 characters 表
echo -e "${BLUE}检查 characters 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT('characters|', c.id, '|', c.user_id, '|avatar_url|', c.avatar_url) AS info
FROM characters c
WHERE c.avatar_url IS NOT NULL 
  AND c.avatar_url != ''
  AND c.avatar_url NOT LIKE 'http://%'
  AND c.avatar_url NOT LIKE 'https://%'
  AND c.avatar_url NOT LIKE 'placeholder://%'
  AND c.user_id IS NOT NULL
  AND c.avatar_url LIKE '%/%/%/%/%'  -- 包含userId的路径
HAVING NOT EXISTS (
    SELECT 1 FROM (
        SELECT CONCAT(c2.user_id, '/', SUBSTRING_INDEX(c2.avatar_url, '/', -4)) AS expected_path
        FROM characters c2
        WHERE c2.id = c.id
    ) AS expected
    WHERE expected.expected_path = c.avatar_url
);
" 2>/dev/null | while IFS='|' read -r table record_id user_id field_name file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ]; then
        continue
    fi
    
    # 提取文件名
    filename=$(basename "${file_path}")
    category=$(echo "${file_path}" | cut -d'/' -f2)
    year=$(echo "${file_path}" | cut -d'/' -f3)
    month=$(echo "${file_path}" | cut -d'/' -f4)
    
    # 检查文件是否存在于记录的路径
    expected_file="${UPLOAD_PATH}/${file_path}"
    if [ ! -f "${expected_file}" ]; then
        echo -e "${YELLOW}文件不存在: ${expected_file}${NC}"
        
        # 尝试在其他用户目录中查找
        found_file=$(find "${UPLOAD_PATH}" -name "${filename}" -type f 2>/dev/null | head -1)
        if [ -n "${found_file}" ]; then
            # 提取实际路径中的userId
            actual_path=${found_file#${UPLOAD_PATH}/}
            actual_user_id=$(echo "${actual_path}" | cut -d'/' -f1)
            
            if [ "${actual_user_id}" != "${user_id}" ]; then
                echo -e "${RED}路径不匹配: 记录中userId=${user_id}, 实际文件在userId=${actual_user_id}${NC}"
                echo -e "${YELLOW}建议修复: UPDATE characters SET avatar_url = '${actual_path}' WHERE id = ${record_id};${NC}"
            fi
        else
            echo -e "${RED}文件未找到: ${filename}${NC}"
        fi
    fi
done

echo -e ""
echo -e "${GREEN}检查完成！${NC}"
echo -e "${YELLOW}注意: 此脚本只检查，不自动修复。请根据输出手动修复或创建修复脚本。${NC}"
