#!/bin/bash

# ============================================================
# 删除所有普通注册用户及其关联数据
# ============================================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/delete_all_regular_users.sql"

# 默认数据库配置（本地）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"

# 显示警告
echo -e "${RED}============================================================${NC}"
echo -e "${RED}警告：此操作将删除所有普通注册用户及其关联数据！${NC}"
echo -e "${RED}============================================================${NC}"
echo ""
echo -e "${YELLOW}将要删除的数据包括：${NC}"
echo "  - users表中的所有用户"
echo "  - 用户创建的世界、时代、角色"
echo "  - 用户的对话记录、收藏、访问历史"
echo "  - 用户的会员信息、订单、积分记录"
echo "  - 用户的心域共享配置和连接记录"
echo "  - 用户的信箱消息、对话"
echo "  - 用户的所有其他关联数据"
echo ""
echo -e "${YELLOW}不会删除：${NC}"
echo "  - system_admin表中的管理员"
echo "  - 系统预设的世界、时代、角色"
echo ""
echo -e "${RED}请确保已经备份数据库！${NC}"
echo ""

# 确认操作
read -p "是否继续？(输入 'YES' 确认): " confirm
if [ "$confirm" != "YES" ]; then
    echo "操作已取消"
    exit 1
fi

# 检查SQL文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}错误：SQL文件不存在: $SQL_FILE${NC}"
    exit 1
fi

# 执行SQL脚本
echo ""
echo -e "${GREEN}正在执行删除操作...${NC}"
echo ""

if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    # 本地数据库
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"
else
    # 远程数据库
    echo -e "${YELLOW}连接到远程数据库: $DB_HOST:$DB_PORT${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}删除操作完成！${NC}"
    echo -e "${GREEN}============================================================${NC}"
else
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}删除操作失败！请检查错误信息${NC}"
    echo -e "${RED}============================================================${NC}"
    exit 1
fi
