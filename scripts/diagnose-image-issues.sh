#!/bin/bash

# 图片展示问题诊断脚本
# 使用方法: ./scripts/diagnose-image-issues.sh [image_url]

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
IMAGE_URL="${1:-}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  图片展示问题诊断脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    export MYSQL_PWD="${DB_PASSWORD}"
fi

# 如果提供了图片URL，直接诊断
if [ -n "${IMAGE_URL}" ]; then
    echo -e "${BLUE}诊断图片URL: ${IMAGE_URL}${NC}"
    echo -e ""
    
    # 检查URL格式
    if [[ "${IMAGE_URL}" == *"localhost"* ]]; then
        echo -e "${RED}✗ 问题：URL包含 localhost${NC}"
        echo -e "${YELLOW}  建议：需要迁移到相对路径格式${NC}"
    fi
    
    if [[ "${IMAGE_URL}" == *"/api/images/files/"* ]]; then
        echo -e "${RED}✗ 问题：URL使用旧格式 /api/images/files/${NC}"
        echo -e "${YELLOW}  建议：应该使用 /images/ 格式${NC}"
    fi
    
    if [[ "${IMAGE_URL}" == http://* ]] || [[ "${IMAGE_URL}" == https://* ]]; then
        echo -e "${BLUE}✓ URL是绝对路径${NC}"
    else
        echo -e "${BLUE}✓ URL是相对路径${NC}"
    fi
    
    # 提取相对路径
    RELATIVE_PATH="${IMAGE_URL}"
    RELATIVE_PATH="${RELATIVE_PATH#http://*/}"
    RELATIVE_PATH="${RELATIVE_PATH#https://*/}"
    RELATIVE_PATH="${RELATIVE_PATH#*/images/}"
    RELATIVE_PATH="${RELATIVE_PATH#*/api/images/files/}"
    
    echo -e "${BLUE}相对路径: ${RELATIVE_PATH}${NC}"
    
    # 检查文件是否存在
    UPLOAD_PATH="./backend/uploads/images/${RELATIVE_PATH}"
    if [ -f "${UPLOAD_PATH}" ]; then
        echo -e "${GREEN}✓ 文件存在: ${UPLOAD_PATH}${NC}"
    else
        echo -e "${RED}✗ 文件不存在: ${UPLOAD_PATH}${NC}"
        echo -e "${YELLOW}  检查可能的路径变体...${NC}"
        
        # 检查是否缺少userId前缀
        if [[ ! "${RELATIVE_PATH}" == */*/*/*/* ]]; then
            echo -e "${YELLOW}  路径格式可能缺少userId前缀${NC}"
        fi
    fi
    
    exit 0
fi

# 通用诊断
echo -e "${YELLOW}1. 检查数据库中的问题URL...${NC}"

# 检查系统表
SYSTEM_ISSUES=$(${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT('system_resources: ', COUNT(*), ' 条记录包含问题URL')
FROM system_resources
WHERE url LIKE '%localhost%' OR url LIKE '%/api/images/%'
UNION ALL
SELECT CONCAT('system_characters: ', COUNT(*), ' 条记录包含问题URL')
FROM system_characters
WHERE avatar_url LIKE '%localhost%' OR avatar_url LIKE '%/api/images/%'
UNION ALL
SELECT CONCAT('system_eras: ', COUNT(*), ' 条记录包含问题URL')
FROM system_eras
WHERE image_url LIKE '%localhost%' OR image_url LIKE '%/api/images/%';
" 2>/dev/null || echo "0")

if [ -n "${SYSTEM_ISSUES}" ] && [ "${SYSTEM_ISSUES}" != "0" ]; then
    echo -e "${RED}发现系统表问题：${NC}"
    echo "${SYSTEM_ISSUES}"
else
    echo -e "${GREEN}✓ 系统表URL格式正常${NC}"
fi

# 检查用户表
USER_ISSUES=$(${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT CONCAT('characters: ', COUNT(*), ' 条记录包含问题URL')
FROM characters
WHERE user_id IS NOT NULL
  AND (avatar_url LIKE '%localhost%' OR avatar_url LIKE '%/api/images/%')
UNION ALL
SELECT CONCAT('eras: ', COUNT(*), ' 条记录包含问题URL')
FROM eras
WHERE user_id IS NOT NULL
  AND (image_url LIKE '%localhost%' OR image_url LIKE '%/api/images/%');
" 2>/dev/null || echo "0")

if [ -n "${USER_ISSUES}" ] && [ "${USER_ISSUES}" != "0" ]; then
    echo -e "${RED}发现用户表问题：${NC}"
    echo "${USER_ISSUES}"
else
    echo -e "${GREEN}✓ 用户表URL格式正常${NC}"
fi

echo -e ""
echo -e "${YELLOW}2. 检查文件系统...${NC}"

UPLOAD_DIR="./backend/uploads/images"
if [ -d "${UPLOAD_DIR}" ]; then
    FILE_COUNT=$(find "${UPLOAD_DIR}" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ 上传目录存在: ${UPLOAD_DIR}${NC}"
    echo -e "${BLUE}  图片文件数量: ${FILE_COUNT}${NC}"
else
    echo -e "${RED}✗ 上传目录不存在: ${UPLOAD_DIR}${NC}"
fi

echo -e ""
echo -e "${YELLOW}3. 检查后端配置...${NC}"

# 检查ImageUrlUtils配置
if grep -q "IMAGE_BASE_URL" backend/src/main/resources/application.yml 2>/dev/null; then
    echo -e "${GREEN}✓ application.yml 中包含 IMAGE_BASE_URL 配置${NC}"
else
    echo -e "${YELLOW}⚠ application.yml 中未找到 IMAGE_BASE_URL 配置${NC}"
fi

# 检查WebMvcConfig
if grep -q "addResourceHandler.*images" backend/src/main/java/com/heartsphere/config/WebMvcConfig.java 2>/dev/null; then
    echo -e "${GREEN}✓ WebMvcConfig 中配置了 /images/ 路径${NC}"
    RESOURCE_HANDLER=$(grep -A 2 "addResourceHandler.*images" backend/src/main/java/com/heartsphere/config/WebMvcConfig.java 2>/dev/null | head -3)
    echo -e "${BLUE}  配置: ${RESOURCE_HANDLER}${NC}"
else
    echo -e "${RED}✗ WebMvcConfig 中未找到 /images/ 路径配置${NC}"
fi

echo -e ""
echo -e "${YELLOW}4. 常见问题检查...${NC}"

# 检查是否有路径缺少userId的情况
MISSING_USERID=$(${MYSQL_CMD} "${DB_NAME}" -N -e "
SELECT COUNT(*) 
FROM characters 
WHERE user_id IS NOT NULL
  AND avatar_url IS NOT NULL
  AND avatar_url != ''
  AND avatar_url NOT LIKE '%/%/%/%/%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE 'placeholder://%';
" 2>/dev/null || echo "0")

if [ "${MISSING_USERID}" != "0" ] && [ "${MISSING_USERID}" != "" ]; then
    echo -e "${RED}✗ 发现 ${MISSING_USERID} 条用户资源路径缺少userId前缀${NC}"
    echo -e "${YELLOW}  建议：执行迁移脚本添加userId前缀${NC}"
else
    echo -e "${GREEN}✓ 用户资源路径格式正常${NC}"
fi

echo -e ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}诊断完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}使用说明：${NC}"
echo -e "  诊断特定图片: ./scripts/diagnose-image-issues.sh '图片URL'"
echo -e "  检查所有问题: ./scripts/diagnose-image-issues.sh"
