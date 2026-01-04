#!/bin/bash

# 数据库导出并同步到远程脚本
# 功能：导出本地heartsphere数据库，清除远程数据库所有数据，重新导入
# 使用方法: ./export_and_sync_to_remote.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 临时备份目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../database_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEMP_BACKUP_DIR="${BACKUP_DIR}/heartsphere_${TIMESTAMP}"
TEMP_SQL_FILE="/tmp/heartsphere_backup_${TIMESTAMP}.sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库导出并同步到远程${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}本地数据库: ${LOCAL_DB_USER}@${LOCAL_DB_HOST}:${LOCAL_DB_PORT}/${LOCAL_DB_NAME}${NC}"
echo -e "${BLUE}远程数据库: ${REMOTE_DB_USER}@${REMOTE_DB_HOST}:${REMOTE_DB_PORT}/${REMOTE_DB_NAME}${NC}"
echo ""

# 检查必要的命令
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

# 构建命令
LOCAL_MYSQL_CMD="mysql -h${LOCAL_DB_HOST} -P${LOCAL_DB_PORT} -u${LOCAL_DB_USER} -p${LOCAL_DB_PASSWORD}"
LOCAL_MYSQLDUMP_CMD="mysqldump -h${LOCAL_DB_HOST} -P${LOCAL_DB_PORT} -u${LOCAL_DB_USER} -p${LOCAL_DB_PASSWORD}"
REMOTE_MYSQL_CMD="mysql -h${REMOTE_DB_HOST} -P${REMOTE_DB_PORT} -u${REMOTE_DB_USER} -p${REMOTE_DB_PASSWORD}"

# 步骤1: 导出本地数据库
echo -e "${YELLOW}[1/4] 正在导出本地数据库...${NC}"
mkdir -p "${TEMP_BACKUP_DIR}"

# 导出数据库结构
echo -e "${BLUE}  导出数据库结构...${NC}"
${LOCAL_MYSQLDUMP_CMD} --no-data --routines --triggers "${LOCAL_DB_NAME}" > "${TEMP_BACKUP_DIR}/01_structure.sql" 2>/dev/null || {
    echo -e "${RED}错误: 数据库结构导出失败${NC}"
    exit 1
}

# 获取所有表名
TABLES=$(${LOCAL_MYSQL_CMD} -e "USE ${LOCAL_DB_NAME}; SHOW TABLES;" 2>/dev/null | grep -v "^Tables_in" | awk '{print $1}')

if [ -z "${TABLES}" ]; then
    echo -e "${RED}错误: 无法获取表列表或数据库为空${NC}"
    exit 1
fi

# 导出所有表数据
echo -e "${BLUE}  导出表数据...${NC}"
TABLE_COUNT=0
for TABLE in ${TABLES}; do
    TABLE_COUNT=$((TABLE_COUNT + 1))
    TABLE_FILE="${TEMP_BACKUP_DIR}/02_data_$(printf "%03d" ${TABLE_COUNT})_${TABLE}.sql"
    echo -e "${BLUE}    导出表: ${TABLE}${NC}"
    ${LOCAL_MYSQLDUMP_CMD} --no-create-info --skip-triggers "${LOCAL_DB_NAME}" "${TABLE}" > "${TABLE_FILE}" 2>/dev/null || {
        echo -e "${YELLOW}    警告: 表 ${TABLE} 导出失败或为空${NC}"
        rm -f "${TABLE_FILE}"
    }
done

# 导出存储过程和函数
echo -e "${BLUE}  导出存储过程和函数...${NC}"
${LOCAL_MYSQLDUMP_CMD} --routines --no-create-info --no-data --no-tablespaces --skip-triggers "${LOCAL_DB_NAME}" > "${TEMP_BACKUP_DIR}/03_routines.sql" 2>/dev/null || {
    echo -e "${YELLOW}警告: 存储过程和函数导出失败或不存在${NC}"
    touch "${TEMP_BACKUP_DIR}/03_routines.sql"
}

# 同时创建一个完整的SQL文件用于快速导入
echo -e "${BLUE}  创建完整SQL备份文件...${NC}"
${LOCAL_MYSQLDUMP_CMD} --single-transaction --routines --triggers --events --default-character-set=utf8mb4 "${LOCAL_DB_NAME}" > "${TEMP_SQL_FILE}" 2>/dev/null || {
    echo -e "${RED}错误: 完整SQL文件创建失败${NC}"
    exit 1
}

FILE_SIZE=$(du -h "${TEMP_SQL_FILE}" | cut -f1)
echo -e "${GREEN}✓ 数据库导出成功 (文件大小: ${FILE_SIZE})${NC}"
echo ""

# 步骤2: 测试远程数据库连接
echo -e "${YELLOW}[2/4] 正在测试远程数据库连接...${NC}"
CONNECTION_TEST=$(${REMOTE_MYSQL_CMD} -e "SELECT 1;" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 远程数据库连接成功${NC}"
else
    echo -e "${RED}✗ 远程数据库连接失败${NC}"
    echo ""
    echo "错误详情:"
    echo "${CONNECTION_TEST}" | grep -i "ERROR" || echo "${CONNECTION_TEST}"
    echo ""
    echo "可能的原因："
    echo "  1. 当前IP未添加到阿里云RDS白名单"
    echo "  2. 远程数据库地址、用户名、密码不正确"
    echo "  3. 网络连接问题"
    echo ""
    rm -rf "${TEMP_BACKUP_DIR}"
    rm -f "${TEMP_SQL_FILE}"
    exit 1
fi
echo ""

# 步骤3: 清除远程数据库所有数据
echo -e "${YELLOW}[3/4] 正在清除远程数据库所有数据...${NC}"
echo -e "${RED}警告: 这将删除远程数据库中的所有表！${NC}"

# 获取远程数据库的所有表
REMOTE_TABLES=$(${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "SHOW TABLES;" 2>/dev/null | grep -v "^Tables_in" | awk '{print $1}')

if [ -n "${REMOTE_TABLES}" ]; then
    REMOTE_TABLE_COUNT=$(echo "${REMOTE_TABLES}" | wc -l | tr -d ' ')
    echo -e "${BLUE}  发现 ${REMOTE_TABLE_COUNT} 个表，正在删除...${NC}"
    
    # 禁用外键检查
    ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "SET FOREIGN_KEY_CHECKS = 0;" 2>/dev/null
    
    # 删除所有表
    for TABLE in ${REMOTE_TABLES}; do
        echo -e "${BLUE}    删除表: ${TABLE}${NC}"
        ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "DROP TABLE IF EXISTS \`${TABLE}\`;" 2>/dev/null || {
            echo -e "${YELLOW}    警告: 表 ${TABLE} 删除失败${NC}"
        }
    done
    
    # 重新启用外键检查
    ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "SET FOREIGN_KEY_CHECKS = 1;" 2>/dev/null
    
    echo -e "${GREEN}✓ 远程数据库已清空${NC}"
else
    echo -e "${YELLOW}远程数据库为空，无需清除${NC}"
fi
echo ""

# 步骤4: 导入数据到远程数据库
echo -e "${YELLOW}[4/4] 正在导入数据到远程数据库...${NC}"
echo "正在导入数据，这可能需要一些时间..."

# 方法1: 使用完整的SQL文件导入（更快）
echo -e "${BLUE}  使用完整SQL文件导入...${NC}"
${REMOTE_MYSQL_CMD} --default-character-set=utf8mb4 "${REMOTE_DB_NAME}" < "${TEMP_SQL_FILE}" 2>&1 | grep -v "Using a password on the command line" || {
    echo -e "${YELLOW}  完整SQL文件导入可能有问题，尝试分步导入...${NC}"
    
    # 方法2: 分步导入（更可靠）
    # 导入数据库结构
    if [ -f "${TEMP_BACKUP_DIR}/01_structure.sql" ]; then
        echo -e "${BLUE}  导入数据库结构...${NC}"
        ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" < "${TEMP_BACKUP_DIR}/01_structure.sql" 2>/dev/null || {
            echo -e "${YELLOW}  警告: 数据库结构导入时出现错误${NC}"
        }
    fi
    
    # 导入表数据
    DATA_FILES=$(ls -1 "${TEMP_BACKUP_DIR}"/02_data_*.sql 2>/dev/null | sort)
    if [ -n "${DATA_FILES}" ]; then
        for DATA_FILE in ${DATA_FILES}; do
            TABLE_NAME=$(basename "${DATA_FILE}" | sed 's/02_data_[0-9]*_\(.*\)\.sql/\1/')
            if [ -s "${DATA_FILE}" ]; then
                echo -e "${BLUE}    导入表: ${TABLE_NAME}${NC}"
                ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" < "${DATA_FILE}" 2>/dev/null || {
                    echo -e "${YELLOW}    警告: 表 ${TABLE_NAME} 导入失败${NC}"
                }
            fi
        done
    fi
    
    # 导入存储过程和函数
    if [ -f "${TEMP_BACKUP_DIR}/03_routines.sql" ] && [ -s "${TEMP_BACKUP_DIR}/03_routines.sql" ]; then
        echo -e "${BLUE}  导入存储过程和函数...${NC}"
        ${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" < "${TEMP_BACKUP_DIR}/03_routines.sql" 2>/dev/null || {
            echo -e "${YELLOW}  警告: 存储过程和函数导入失败${NC}"
        }
    fi
}

# 验证导入结果
echo -e "${BLUE}  验证导入结果...${NC}"
REMOTE_TABLE_COUNT=$(${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${REMOTE_DB_NAME}';" -s -N 2>/dev/null || echo "0")

if [ "${REMOTE_TABLE_COUNT}" -gt 0 ]; then
    echo -e "${GREEN}✓ 数据导入成功，远程数据库共有 ${REMOTE_TABLE_COUNT} 个表${NC}"
else
    echo -e "${YELLOW}警告: 远程数据库表数量为 0，请检查导入过程${NC}"
fi

# 显示一些统计信息
echo ""
echo -e "${YELLOW}远程数据库统计信息:${NC}"
${REMOTE_MYSQL_CMD} "${REMOTE_DB_NAME}" -e "
SELECT 
    table_name AS '表名',
    table_rows AS '行数',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS '大小(MB)'
FROM information_schema.tables 
WHERE table_schema = '${REMOTE_DB_NAME}' 
ORDER BY (data_length + index_length) DESC 
LIMIT 10;
" 2>/dev/null || true

# 清理临时文件
echo ""
echo -e "${BLUE}清理临时文件...${NC}"
rm -f "${TEMP_SQL_FILE}"
echo -e "${GREEN}✓ 备份文件已保存到: ${TEMP_BACKUP_DIR}${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库导出并同步完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}备份目录: ${TEMP_BACKUP_DIR}${NC}"
echo -e "${BLUE}远程数据库: ${REMOTE_DB_NAME}@${REMOTE_DB_HOST}:${REMOTE_DB_PORT}${NC}"
echo -e "${BLUE}表数量: ${REMOTE_TABLE_COUNT}${NC}"
echo -e "${GREEN}========================================${NC}"
