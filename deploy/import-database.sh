#!/bin/bash
# 数据库导入脚本（支持远程MySQL）
# 使用方法: ./import-database.sh [备份目录] [数据库名] [数据库主机] [数据库用户] [数据库密码] [数据库端口]
# 示例: ./import-database.sh /tmp/db_backup/heartsphere_20241224_120000 heartsphere localhost root password 3306

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="/opt/heartsphere/.env"

# 加载环境变量
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
fi

# 参数处理
BACKUP_DIR="${1}"
DB_NAME="${2:-${DB_NAME:-heartsphere}}"
DB_HOST="${3:-${DB_HOST:-localhost}}"
DB_USER="${4:-${DB_USER:-root}}"
DB_PASSWORD="${5:-${DB_PASSWORD}}"
DB_PORT="${6:-${DB_PORT:-3306}}"

# 如果未提供备份目录，尝试从环境变量或默认位置获取
if [ -z "${BACKUP_DIR}" ]; then
    BACKUP_DIR="${SCRIPT_DIR}/database_backup"
    LATEST_BACKUP=$(ls -td "${BACKUP_DIR}"/heartsphere_* 2>/dev/null | head -1)
    if [ -n "${LATEST_BACKUP}" ]; then
        BACKUP_DIR="${LATEST_BACKUP}"
        echo -e "${YELLOW}使用最新备份: ${BACKUP_DIR}${NC}"
    else
        echo -e "${RED}错误: 未找到备份目录${NC}"
        echo -e "${YELLOW}使用方法: ${0} [备份目录] [数据库名] [数据库主机] [数据库用户] [数据库密码] [数据库端口]${NC}"
        exit 1
    fi
fi

# 检查备份目录是否存在
if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${RED}错误: 备份目录不存在: ${BACKUP_DIR}${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库导入脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}备份目录: ${BACKUP_DIR}${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e ""

# 检查 MySQL 客户端
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysql 命令${NC}"
    echo -e "${YELLOW}请安装 MySQL 客户端:${NC}"
    echo -e "  CentOS/RHEL: yum install -y mysql"
    echo -e "  Ubuntu/Debian: apt-get install -y mysql-client"
    exit 1
fi

# 测试数据库连接
echo -e "${YELLOW}[0/5] 测试数据库连接...${NC}"
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_CMD="${MYSQL_CMD} -p${DB_PASSWORD}"
    export MYSQL_PWD="${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
fi

# 测试连接
${MYSQL_CMD} -e "SELECT 1;" > /dev/null 2>&1 || {
    echo -e "${RED}错误: 无法连接到数据库${NC}"
    echo -e "${YELLOW}请检查:${NC}"
    echo -e "  1. 数据库主机和端口是否正确"
    echo -e "  2. 用户名和密码是否正确"
    echo -e "  3. 网络连接是否正常"
    echo -e "  4. 防火墙是否允许连接"
    exit 1
}
echo -e "${GREEN}✓ 数据库连接成功${NC}"

# 1. 创建数据库
echo -e "${YELLOW}[1/5] 创建数据库...${NC}"
${MYSQL_CMD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${RED}错误: 数据库创建失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 数据库已创建或已存在${NC}"

# 2. 导入数据库结构
echo -e "${YELLOW}[2/5] 导入数据库结构...${NC}"
STRUCTURE_FILE="${BACKUP_DIR}/01_structure.sql"
if [ -f "${STRUCTURE_FILE}" ]; then
    ${MYSQL_CMD} "${DB_NAME}" < "${STRUCTURE_FILE}" 2>/dev/null || {
        echo -e "${YELLOW}警告: 数据库结构导入时出现错误，继续导入数据...${NC}"
    }
    echo -e "${GREEN}✓ 数据库结构已导入${NC}"
else
    echo -e "${YELLOW}警告: 未找到结构文件 ${STRUCTURE_FILE}${NC}"
fi

# 3. 导入表数据
echo -e "${YELLOW}[3/5] 导入表数据...${NC}"
DATA_FILES=$(ls -1 "${BACKUP_DIR}"/02_data_*.sql 2>/dev/null | sort)
if [ -n "${DATA_FILES}" ]; then
    TABLE_COUNT=0
    SUCCESS_COUNT=0
    FAIL_COUNT=0
    
    for DATA_FILE in ${DATA_FILES}; do
        TABLE_COUNT=$((TABLE_COUNT + 1))
        TABLE_NAME=$(basename "${DATA_FILE}" | sed 's/02_data_[0-9]*_\(.*\)\.sql/\1/')
        
        # 检查文件是否为空
        if [ ! -s "${DATA_FILE}" ]; then
            echo -e "${BLUE}  跳过空表: ${TABLE_NAME}${NC}"
            continue
        fi
        
        echo -e "${BLUE}  导入表: ${TABLE_NAME}${NC}"
        if ${MYSQL_CMD} "${DB_NAME}" < "${DATA_FILE}" 2>/dev/null; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
            echo -e "${YELLOW}    警告: 表 ${TABLE_NAME} 导入失败${NC}"
        fi
    done
    
    echo -e "${GREEN}✓ 表数据导入完成 (成功: ${SUCCESS_COUNT}, 失败: ${FAIL_COUNT}, 总计: ${TABLE_COUNT})${NC}"
else
    echo -e "${YELLOW}警告: 未找到数据文件${NC}"
fi

# 4. 导入存储过程和函数
echo -e "${YELLOW}[4/5] 导入存储过程和函数...${NC}"
ROUTINES_FILE="${BACKUP_DIR}/03_routines.sql"
if [ -f "${ROUTINES_FILE}" ] && [ -s "${ROUTINES_FILE}" ]; then
    ${MYSQL_CMD} "${DB_NAME}" < "${ROUTINES_FILE}" 2>/dev/null || {
        echo -e "${YELLOW}警告: 存储过程和函数导入失败${NC}"
    }
    echo -e "${GREEN}✓ 存储过程和函数已导入${NC}"
else
    echo -e "${YELLOW}跳过: 无存储过程和函数${NC}"
fi

# 5. 验证导入结果
echo -e "${YELLOW}[5/5] 验证导入结果...${NC}"
TABLE_COUNT=$(${MYSQL_CMD} "${DB_NAME}" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" -s -N 2>/dev/null || echo "0")
if [ "${TABLE_COUNT}" -gt 0 ]; then
    echo -e "${GREEN}✓ 数据库验证成功，共 ${TABLE_COUNT} 个表${NC}"
else
    echo -e "${YELLOW}警告: 数据库表数量为 0，请检查导入过程${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库导入完成！${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}表数量: ${TABLE_COUNT}${NC}"
echo -e "${GREEN}========================================${NC}"

# 显示一些统计信息
echo -e "${YELLOW}数据库统计信息:${NC}"
${MYSQL_CMD} "${DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS '大小(MB)'
FROM information_schema.tables 
WHERE table_schema = '${DB_NAME}' 
ORDER BY (data_length + index_length) DESC 
LIMIT 10;
" 2>/dev/null || true

