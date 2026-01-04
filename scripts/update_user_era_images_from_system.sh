#!/bin/bash

# 更新用户场景图片：从系统预置场景获取图片URL
# 使用方法: ./scripts/update_user_era_images_from_system.sh [remote]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SQL_FILE="${SCRIPT_DIR}/update_user_era_images_from_system.sql"

# 检查SQL文件是否存在
if [ ! -f "${SQL_FILE}" ]; then
    echo -e "${RED}错误: SQL文件不存在: ${SQL_FILE}${NC}"
    exit 1
fi

# 判断是本地还是远程
if [ "$1" = "remote" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  更新用户场景图片（远程数据库）${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # 读取远程数据库配置
    read -p "请输入远程数据库主机: " DB_HOST
    read -p "请输入数据库端口 [3306]: " DB_PORT
    DB_PORT=${DB_PORT:-3306}
    read -p "请输入数据库用户名: " DB_USER
    read -s -p "请输入数据库密码: " DB_PASSWORD
    echo ""
    read -p "请输入数据库名称: " DB_NAME
    
    # 确认操作
    echo -e "${YELLOW}即将更新远程数据库 ${DB_HOST}:${DB_PORT}/${DB_NAME} 中的用户场景图片${NC}"
    read -p "确认继续？(输入 YES 继续): " CONFIRM
    if [ "${CONFIRM}" != "YES" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
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
    
    # 执行SQL
    echo -e "${BLUE}正在执行SQL更新...${NC}"
    ${MYSQL_CMD} "${DB_NAME}" < "${SQL_FILE}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 更新完成！${NC}"
    else
        echo -e "${RED}❌ 更新失败！${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  更新用户场景图片（本地数据库）${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # 配置变量
    DB_USER="${DB_USER:-root}"
    DB_PASSWORD="${DB_PASSWORD:-123456}"
    DB_NAME="${DB_NAME:-heartsphere}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-3306}"
    
    echo -e "${BLUE}数据库: ${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
    echo -e "${BLUE}用户: ${DB_USER}${NC}"
    echo ""
    
    # 确认操作
    echo -e "${YELLOW}即将更新本地数据库中的用户场景图片${NC}"
    read -p "确认继续？(输入 YES 继续): " CONFIRM
    if [ "${CONFIRM}" != "YES" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
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
    
    # 执行SQL
    echo -e "${BLUE}正在执行SQL更新...${NC}"
    ${MYSQL_CMD} "${DB_NAME}" < "${SQL_FILE}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 更新完成！${NC}"
    else
        echo -e "${RED}❌ 更新失败！${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}========================================${NC}"
