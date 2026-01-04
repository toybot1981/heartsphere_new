#!/bin/bash

# ============================================================
# 删除远程数据库中所有普通注册用户及其关联数据
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

# 从环境变量或配置文件读取远程数据库配置
# 如果没有设置，则提示用户输入
if [ -z "$REMOTE_DB_HOST" ]; then
    read -p "请输入远程数据库主机地址: " REMOTE_DB_HOST
fi

if [ -z "$REMOTE_DB_PORT" ]; then
    REMOTE_DB_PORT="${REMOTE_DB_PORT:-3306}"
    read -p "请输入远程数据库端口 (默认: 3306): " input_port
    REMOTE_DB_PORT="${input_port:-$REMOTE_DB_PORT}"
fi

if [ -z "$REMOTE_DB_NAME" ]; then
    REMOTE_DB_NAME="${REMOTE_DB_NAME:-heartsphere}"
    read -p "请输入数据库名称 (默认: heartsphere): " input_name
    REMOTE_DB_NAME="${input_name:-$REMOTE_DB_NAME}"
fi

if [ -z "$REMOTE_DB_USER" ]; then
    read -p "请输入数据库用户名: " REMOTE_DB_USER
fi

if [ -z "$REMOTE_DB_PASSWORD" ]; then
    read -sp "请输入数据库密码: " REMOTE_DB_PASSWORD
    echo ""
fi

# 显示警告
echo -e "${RED}============================================================${NC}"
echo -e "${RED}警告：此操作将删除远程数据库中所有普通注册用户及其关联数据！${NC}"
echo -e "${RED}============================================================${NC}"
echo ""
echo -e "${YELLOW}数据库信息：${NC}"
echo "  主机: $REMOTE_DB_HOST"
echo "  端口: $REMOTE_DB_PORT"
echo "  数据库: $REMOTE_DB_NAME"
echo "  用户: $REMOTE_DB_USER"
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
echo -e "${GREEN}正在连接到远程数据库并执行删除操作...${NC}"
echo ""

mysql -h "$REMOTE_DB_HOST" -P "$REMOTE_DB_PORT" -u "$REMOTE_DB_USER" -p"$REMOTE_DB_PASSWORD" "$REMOTE_DB_NAME" < "$SQL_FILE"

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
