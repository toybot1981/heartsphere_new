#!/bin/bash

# 迁移用户资源文件到新路径结构（userId/category/year/month/filename）
# 使用方法: ./scripts/migrate-user-image-files-v2.sh

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

# 创建更新SQL文件
UPDATE_SQL=$(mktemp)
MOVED_COUNT=0
FAILED_COUNT=0
SKIP_COUNT=0

# 处理 characters 表的 avatar_url
echo -e "${YELLOW}处理 characters 表的 avatar_url...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|', avatar_url)
FROM characters
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含userId（旧格式）
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE characters SET avatar_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ characters.${record_id}.avatar_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE characters SET avatar_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 characters 表的 background_url
echo -e "${YELLOW}处理 characters 表的 background_url...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|', background_url)
FROM characters
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE '%/%/%/%/%'
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE characters SET background_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ characters.${record_id}.background_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE characters SET background_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 eras 表
echo -e "${YELLOW}处理 eras 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|', image_url)
FROM eras
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND image_url NOT LIKE 'http://%' 
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE '%/%/%/%/%'
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE eras SET image_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ eras.${record_id}.image_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE eras SET image_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 journal_entries 表
echo -e "${YELLOW}处理 journal_entries 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|', image_url)
FROM journal_entries
WHERE image_url IS NOT NULL 
  AND image_url != '' 
  AND image_url NOT LIKE 'http://%' 
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE '%/%/%/%/%'
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE journal_entries SET image_url = '${NEW_DB_PATH}' WHERE id = '${record_id}';" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ journal_entries.${record_id}.image_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE journal_entries SET image_url = '${NEW_DB_PATH}' WHERE id = '${record_id}';" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 处理 user_main_stories 表
echo -e "${YELLOW}处理 user_main_stories 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|avatar_url|', avatar_url)
FROM user_main_stories
WHERE avatar_url IS NOT NULL 
  AND avatar_url != '' 
  AND avatar_url NOT LIKE 'http://%' 
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE '%/%/%/%/%'
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id field_name file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE user_main_stories SET avatar_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ user_main_stories.${record_id}.avatar_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE user_main_stories SET avatar_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT(id, '|', user_id, '|background_url|', background_url)
FROM user_main_stories
WHERE background_url IS NOT NULL 
  AND background_url != '' 
  AND background_url NOT LIKE 'http://%' 
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE '%/%/%/%/%'
  AND user_id IS NOT NULL;
" 2>/dev/null | while IFS='|' read -r record_id user_id field_name file_path; do
    if [ -z "${file_path}" ] || [ -z "${user_id}" ] || [ -z "${record_id}" ]; then
        continue
    fi
    
    OLD_FILE="${UPLOAD_PATH}/${file_path}"
    NEW_DIR="${UPLOAD_PATH}/${user_id}/$(dirname "${file_path}")"
    NEW_FILE="${UPLOAD_PATH}/${user_id}/${file_path}"
    NEW_DB_PATH="${user_id}/${file_path}"
    
    if [ ! -f "${OLD_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    if [ -f "${NEW_FILE}" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
        echo "UPDATE user_main_stories SET background_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        continue
    fi
    
    mkdir -p "${NEW_DIR}"
    if mv "${OLD_FILE}" "${NEW_FILE}" 2>/dev/null; then
        echo -e "${GREEN}✓ user_main_stories.${record_id}.background_url: ${file_path} -> ${NEW_DB_PATH}${NC}"
        echo "UPDATE user_main_stories SET background_url = '${NEW_DB_PATH}' WHERE id = ${record_id};" >> "${UPDATE_SQL}"
        MOVED_COUNT=$((MOVED_COUNT + 1))
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# 执行数据库更新
if [ -s "${UPDATE_SQL}" ]; then
    echo -e "${YELLOW}更新数据库路径（共 $(wc -l < "${UPDATE_SQL}" | tr -d ' ') 条记录）...${NC}"
    ${MYSQL_CMD} "${DB_NAME}" < "${UPDATE_SQL}" 2>/dev/null && {
        echo -e "${GREEN}✓ 数据库更新成功${NC}"
    } || {
        echo -e "${RED}✗ 数据库更新失败${NC}"
        echo -e "${YELLOW}SQL文件保存在: ${UPDATE_SQL}${NC}"
        exit 1
    }
    rm -f "${UPDATE_SQL}"
else
    echo -e "${YELLOW}没有需要更新的数据库记录${NC}"
    rm -f "${UPDATE_SQL}"
fi

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}文件迁移完成！${NC}"
echo -e "${GREEN}成功: ${MOVED_COUNT}, 失败: ${FAILED_COUNT}, 跳过: ${SKIP_COUNT}${NC}"
echo -e "${GREEN}========================================${NC}"
