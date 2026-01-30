#!/bin/bash

# 执行游客模式数据库迁移脚本
# 使用方法: ./scripts/execute-guest-mode-migration.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}执行游客模式数据库迁移${NC}"
echo -e "${GREEN}========================================${NC}"

# 数据库配置（从 application.yml 读取默认值）
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-heartsphere}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-123456}

SCRIPT_PATH="main/backend/src/main/resources/db/migration/V20260119__add_trial_membership_plan.sql"

echo -e "${YELLOW}数据库配置:${NC}"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查脚本文件是否存在
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}错误: 迁移脚本不存在: $SCRIPT_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}迁移脚本: $SCRIPT_PATH${NC}"
echo ""

# 尝试查找 mysql 命令
MYSQL_CMD=""
if command -v mysql &> /dev/null; then
    MYSQL_CMD="mysql"
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
    MYSQL_CMD="/usr/local/mysql/bin/mysql"
elif [ -f "/opt/homebrew/bin/mysql" ]; then
    MYSQL_CMD="/opt/homebrew/bin/mysql"
else
    echo -e "${YELLOW}警告: 未找到 mysql 命令行工具${NC}"
    echo -e "${YELLOW}迁移将通过 Spring Boot Flyway 自动执行${NC}"
    echo ""
    echo -e "${GREEN}替代方案:${NC}"
    echo "1. 启动 Spring Boot 应用，Flyway 会自动执行迁移"
    echo "2. 或手动安装 MySQL 客户端后重新执行此脚本"
    echo ""
    echo -e "${YELLOW}验证迁移是否已执行:${NC}"
    echo "SELECT * FROM subscription_plans WHERE type = 'trial';"
    exit 0
fi

echo -e "${GREEN}使用 MySQL 客户端: $MYSQL_CMD${NC}"
echo ""

# 执行迁移
echo -e "${YELLOW}正在执行迁移...${NC}"
$MYSQL_CMD -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    --default-character-set=utf8mb4 < "$SCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 迁移执行成功！${NC}"
    echo ""
    echo -e "${GREEN}验证迁移结果:${NC}"
    $MYSQL_CMD -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT id, name, type, text_token_quota, is_active FROM subscription_plans WHERE type = 'trial';"
else
    echo ""
    echo -e "${RED}❌ 迁移执行失败${NC}"
    exit 1
fi
