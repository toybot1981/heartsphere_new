#!/bin/bash

# 数据库同步脚本：将本地数据库复制到远程数据库
# 使用方法: ./sync_database_to_remote.sh

# set -e  # 注释掉，允许某些步骤失败后继续

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 本地数据库配置
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="3306"
LOCAL_DB_NAME="heartsphere"
LOCAL_DB_USER="root"
LOCAL_DB_PASSWORD="123456"

# 远程数据库配置
REMOTE_DB_HOST="rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com"
REMOTE_DB_PORT="3306"
REMOTE_DB_NAME="heartsphere"
REMOTE_DB_USER="heartsphere"
REMOTE_DB_PASSWORD="Tyx@19811009"

# 临时SQL文件
TEMP_SQL_FILE="/tmp/heartsphere_backup_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库同步脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查mysqldump和mysql命令是否可用
if ! command -v mysqldump &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysqldump 命令${NC}"
    echo "请确保已安装 MySQL 客户端工具"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysql 命令${NC}"
    echo "请确保已安装 MySQL 客户端工具"
    exit 1
fi

# 步骤1: 导出本地数据库
echo -e "${YELLOW}[1/3] 正在导出本地数据库...${NC}"
echo "本地数据库: ${LOCAL_DB_USER}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}"

mysqldump \
    -h "${LOCAL_DB_HOST}" \
    -P "${LOCAL_DB_PORT}" \
    -u "${LOCAL_DB_USER}" \
    -p"${LOCAL_DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases "${LOCAL_DB_NAME}" \
    --default-character-set=utf8mb4 \
    > "${TEMP_SQL_FILE}"

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "${TEMP_SQL_FILE}" | cut -f1)
    echo -e "${GREEN}✓ 数据库导出成功 (文件大小: ${FILE_SIZE})${NC}"
else
    echo -e "${RED}✗ 数据库导出失败${NC}"
    rm -f "${TEMP_SQL_FILE}"
    exit 1
fi

echo ""

# 步骤2: 测试远程数据库连接
echo -e "${YELLOW}[2/3] 正在测试远程数据库连接...${NC}"
echo "远程数据库: ${REMOTE_DB_USER}@${REMOTE_DB_HOST}:${REMOTE_DB_PORT}/${REMOTE_DB_NAME}"

# 获取当前公网IP（如果可能）
CURRENT_IP=$(curl -s ifconfig.me 2>/dev/null || echo "未知")

CONNECTION_TEST=$(mysql \
    -h "${REMOTE_DB_HOST}" \
    -P "${REMOTE_DB_PORT}" \
    -u "${REMOTE_DB_USER}" \
    -p"${REMOTE_DB_PASSWORD}" \
    -e "SELECT 1;" \
    2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 远程数据库连接成功${NC}"
else
    echo -e "${RED}✗ 远程数据库连接失败${NC}"
    echo ""
    echo "错误详情:"
    echo "${CONNECTION_TEST}" | grep -i "ERROR" || echo "${CONNECTION_TEST}"
    echo ""
    echo "可能的原因："
    echo "  1. 当前IP (${CURRENT_IP}) 未添加到阿里云RDS白名单"
    echo "  2. 远程数据库地址、用户名、密码不正确"
    echo "  3. 网络连接问题"
    echo ""
    echo "解决方案："
    echo "  1. 登录阿里云RDS控制台"
    echo "  2. 找到数据库实例: ${REMOTE_DB_HOST}"
    echo "  3. 进入'数据安全性' -> '白名单设置'"
    echo "  4. 添加当前IP: ${CURRENT_IP} 或 0.0.0.0/0 (允许所有IP，仅用于测试)"
    echo ""
    echo -e "${YELLOW}自动继续尝试导入...${NC}"
fi

echo ""

# 步骤3: 导入到远程数据库
echo -e "${YELLOW}[3/3] 正在导入数据到远程数据库...${NC}"
echo -e "${YELLOW}警告: 这将覆盖远程数据库中的所有数据！${NC}"
echo "正在导入数据，这可能需要一些时间..."

mysql \
    -h "${REMOTE_DB_HOST}" \
    -P "${REMOTE_DB_PORT}" \
    -u "${REMOTE_DB_USER}" \
    -p"${REMOTE_DB_PASSWORD}" \
    --default-character-set=utf8mb4 \
    < "${TEMP_SQL_FILE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据导入成功${NC}"
else
    echo -e "${RED}✗ 数据导入失败${NC}"
    rm -f "${TEMP_SQL_FILE}"
    exit 1
fi

# 清理临时文件
rm -f "${TEMP_SQL_FILE}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库同步完成！${NC}"
echo -e "${GREEN}========================================${NC}"

