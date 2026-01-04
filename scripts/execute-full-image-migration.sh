#!/bin/bash

# 完整的图片URL路径迁移脚本（数据库 + 文件系统）
# 使用方法: ./scripts/execute-full-image-migration.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-image-urls-before-migration.sh"
DB_MIGRATION_SCRIPT="${SCRIPT_DIR}/migrate-image-urls-to-new-structure.sh"
FILE_MIGRATION_SCRIPT="${SCRIPT_DIR}/migrate-image-files-to-new-structure.sh"
CHECK_SCRIPT="${SCRIPT_DIR}/check-database-image-urls.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  完整图片URL路径迁移脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""

# 步骤 1: 备份数据
echo -e "${YELLOW}[步骤 1/4] 备份数据${NC}"
if [ -f "${BACKUP_SCRIPT}" ]; then
    echo -e "${YELLOW}是否执行备份？ (yes/no)${NC}"
    read -r BACKUP_CONFIRM
    if [ "${BACKUP_CONFIRM}" = "yes" ]; then
        bash "${BACKUP_SCRIPT}"
    else
        echo -e "${YELLOW}跳过备份${NC}"
    fi
else
    echo -e "${YELLOW}警告: 备份脚本不存在，跳过备份${NC}"
fi

echo -e ""

# 步骤 2: 数据库迁移
echo -e "${YELLOW}[步骤 2/4] 数据库URL迁移${NC}"
if [ -f "${DB_MIGRATION_SCRIPT}" ]; then
    echo -e "${YELLOW}是否执行数据库迁移？ (yes/no)${NC}"
    read -r DB_MIGRATION_CONFIRM
    if [ "${DB_MIGRATION_CONFIRM}" = "yes" ]; then
        bash "${DB_MIGRATION_SCRIPT}"
    else
        echo -e "${YELLOW}跳过数据库迁移${NC}"
    fi
else
    echo -e "${RED}错误: 数据库迁移脚本不存在${NC}"
    exit 1
fi

echo -e ""

# 步骤 3: 文件系统迁移
echo -e "${YELLOW}[步骤 3/4] 文件系统迁移${NC}"
if [ -f "${FILE_MIGRATION_SCRIPT}" ]; then
    echo -e "${YELLOW}是否执行文件系统迁移？ (yes/no)${NC}"
    read -r FILE_MIGRATION_CONFIRM
    if [ "${FILE_MIGRATION_CONFIRM}" = "yes" ]; then
        bash "${FILE_MIGRATION_SCRIPT}"
    else
        echo -e "${YELLOW}跳过文件系统迁移${NC}"
    fi
else
    echo -e "${RED}错误: 文件系统迁移脚本不存在${NC}"
    exit 1
fi

echo -e ""

# 步骤 4: 验证结果
echo -e "${YELLOW}[步骤 4/4] 验证迁移结果${NC}"
if [ -f "${CHECK_SCRIPT}" ]; then
    echo -e "${YELLOW}是否执行验证？ (yes/no)${NC}"
    read -r CHECK_CONFIRM
    if [ "${CHECK_CONFIRM}" = "yes" ]; then
        bash "${CHECK_SCRIPT}"
    else
        echo -e "${YELLOW}跳过验证${NC}"
    fi
else
    echo -e "${YELLOW}警告: 检查脚本不存在，跳过验证${NC}"
fi

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}完整迁移流程执行完成！${NC}"
echo -e "${GREEN}========================================${NC}"
