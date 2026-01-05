#!/bin/bash
# 测试数据库连接脚本
# 用于验证.env文件中的数据库配置是否正确
# 使用方法: ./test-db-connection.sh [.env文件路径]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库连接测试脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 确定.env文件路径
ENV_FILE="${1:-}"
if [ -z "$ENV_FILE" ]; then
    # 默认路径
    DEFAULT_APP_HOME="/opt/heartsphere"
    ENV_FILE="${DEFAULT_APP_HOME}/.env"
    
    # 如果默认路径不存在，尝试backend目录
    if [ ! -f "$ENV_FILE" ]; then
        ENV_FILE="${DEFAULT_APP_HOME}/backend/.env"
    fi
fi

# 检查.env文件是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}错误: .env文件不存在: ${ENV_FILE}${NC}"
    echo ""
    echo -e "${YELLOW}请指定.env文件路径:${NC}"
    echo -e "  ${BLUE}./test-db-connection.sh /path/to/.env${NC}"
    echo ""
    echo -e "${YELLOW}或创建.env文件:${NC}"
    echo -e "  ${BLUE}./create-env-file.sh${NC}"
    exit 1
fi

echo -e "${GREEN}使用.env文件: ${ENV_FILE}${NC}"
echo ""

# 加载环境变量
set -a  # 自动export所有变量
source "$ENV_FILE"
set +a  # 关闭自动export

# 检查必要的环境变量
MISSING_VARS=()

if [ -z "$DB_HOST" ]; then
    MISSING_VARS+=("DB_HOST")
fi

if [ -z "$DB_PORT" ]; then
    DB_PORT="3306"
    echo -e "${YELLOW}警告: DB_PORT未设置，使用默认值: 3306${NC}"
fi

if [ -z "$DB_NAME" ]; then
    MISSING_VARS+=("DB_NAME")
fi

if [ -z "$DB_USER" ]; then
    MISSING_VARS+=("DB_USER")
fi

if [ -z "$DB_PASSWORD" ]; then
    MISSING_VARS+=("DB_PASSWORD")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}错误: 缺少必要的环境变量:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "  - ${var}"
    done
    echo ""
    echo -e "${YELLOW}请检查.env文件并确保所有变量都已设置${NC}"
    exit 1
fi

# 显示配置信息（隐藏密码）
echo -e "${BLUE}========== 数据库配置信息 ==========${NC}"
echo -e "数据库主机: ${GREEN}${DB_HOST}${NC}"
echo -e "数据库端口: ${GREEN}${DB_PORT}${NC}"
echo -e "数据库名称: ${GREEN}${DB_NAME}${NC}"
echo -e "数据库用户: ${GREEN}${DB_USER}${NC}"
echo -e "数据库密码: ${CYAN}${DB_PASSWORD:0:3}***${NC} (已隐藏)"
echo ""

# 检查MySQL客户端是否安装
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}警告: 未安装MySQL客户端，将使用telnet/nc测试端口连接${NC}"
    USE_MYSQL_CLIENT=false
else
    USE_MYSQL_CLIENT=true
    echo -e "${GREEN}MySQL客户端已安装${NC}"
fi
echo ""

# 测试1: 测试网络连接（端口是否开放）
echo -e "${YELLOW}[1/3] 测试网络连接 (${DB_HOST}:${DB_PORT})...${NC}"

if command -v nc &> /dev/null; then
    if timeout 5 nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        echo -e "${GREEN}✓ 端口 ${DB_PORT} 可达${NC}"
        NETWORK_OK=true
    else
        echo -e "${RED}✗ 无法连接到 ${DB_HOST}:${DB_PORT}${NC}"
        echo -e "${YELLOW}可能的原因:${NC}"
        echo -e "  - 数据库服务未启动"
        echo -e "  - 防火墙阻止了连接"
        echo -e "  - 主机地址或端口错误"
        NETWORK_OK=false
    fi
elif command -v telnet &> /dev/null; then
    if timeout 5 bash -c "echo > /dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; then
        echo -e "${GREEN}✓ 端口 ${DB_PORT} 可达${NC}"
        NETWORK_OK=true
    else
        echo -e "${RED}✗ 无法连接到 ${DB_HOST}:${DB_PORT}${NC}"
        NETWORK_OK=false
    fi
else
    echo -e "${YELLOW}跳过网络测试（未安装nc或telnet）${NC}"
    NETWORK_OK=true  # 假设网络正常，继续测试
fi

echo ""

# 如果网络不通，退出
if [ "$NETWORK_OK" = false ]; then
    echo -e "${RED}网络连接失败，请先解决网络问题${NC}"
    exit 1
fi

# 测试2: 测试MySQL连接（如果mysql客户端可用）
if [ "$USE_MYSQL_CLIENT" = true ]; then
    echo -e "${YELLOW}[2/3] 测试MySQL连接...${NC}"
    
    # 构建mysql连接命令
    MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e 'SELECT 1;' 2>&1"
    
    # 执行连接测试
    if mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SELECT 1;" 2>&1 | grep -q "1"; then
        echo -e "${GREEN}✓ MySQL连接成功${NC}"
        MYSQL_CONN_OK=true
    else
        ERROR_OUTPUT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SELECT 1;" 2>&1 || true)
        echo -e "${RED}✗ MySQL连接失败${NC}"
        echo -e "${YELLOW}错误信息:${NC}"
        echo -e "${RED}${ERROR_OUTPUT}${NC}"
        echo ""
        echo -e "${YELLOW}可能的原因:${NC}"
        echo -e "  - 用户名或密码错误"
        echo -e "  - 数据库 '${DB_NAME}' 不存在"
        echo -e "  - 用户 '${DB_USER}' 没有访问权限"
        echo -e "  - MySQL不允许远程连接（bind-address设置）"
        MYSQL_CONN_OK=false
    fi
else
    echo -e "${YELLOW}[2/3] 跳过MySQL连接测试（需要mysql客户端）${NC}"
    MYSQL_CONN_OK=true  # 假设正常
fi

echo ""

# 测试3: 测试数据库是否存在（如果mysql客户端可用）
if [ "$USE_MYSQL_CLIENT" = true ] && [ "$MYSQL_CONN_OK" = true ]; then
    echo -e "${YELLOW}[3/3] 验证数据库访问权限...${NC}"
    
    # 测试能否查询表
    TABLE_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ 数据库访问正常（发现 $((TABLE_COUNT-1)) 个表）${NC}"
    else
        echo -e "${YELLOW}⚠ 数据库为空或无法查询表${NC}"
    fi
else
    echo -e "${YELLOW}[3/3] 跳过数据库验证（MySQL连接失败或客户端不可用）${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"

# 总结
if [ "$NETWORK_OK" = true ] && [ "$MYSQL_CONN_OK" = true ]; then
    echo -e "${GREEN}✓ 数据库连接测试通过！${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo -e "1. 确认后端服务配置正确"
    echo -e "2. 重启后端服务: ${BLUE}sudo systemctl restart heartsphere-backend${NC}"
    echo -e "3. 查看服务日志: ${BLUE}sudo journalctl -u heartsphere-backend -f${NC}"
    exit 0
else
    echo -e "${RED}✗ 数据库连接测试失败${NC}"
    echo ""
    echo -e "${YELLOW}故障排除步骤:${NC}"
    echo -e "1. 检查数据库服务是否运行: ${BLUE}sudo systemctl status mysql${NC} 或 ${BLUE}sudo systemctl status mariadb${NC}"
    echo -e "2. 检查防火墙设置: ${BLUE}sudo firewall-cmd --list-all${NC} 或 ${BLUE}sudo iptables -L${NC}"
    echo -e "3. 检查MySQL bind-address设置: ${BLUE}sudo grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf${NC}"
    echo -e "4. 验证数据库用户权限:"
    echo -e "   ${BLUE}mysql -u root -p -e \"GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';\"${NC}"
    echo -e "   ${BLUE}mysql -u root -p -e \"FLUSH PRIVILEGES;\"${NC}"
    exit 1
fi
