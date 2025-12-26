#!/bin/bash
# 数据库导出脚本
# 使用方法: ./export-database.sh [数据库名] [输出目录]
# 示例: ./export-database.sh heartsphere /tmp/db_backup

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
DB_NAME="${1:-${DB_NAME:-heartsphere}}"
OUTPUT_DIR="${2:-${SCRIPT_DIR}/database_backup}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"

# 检查 MySQL 客户端
if ! command -v mysqldump &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysqldump 命令${NC}"
    echo -e "${YELLOW}请安装 MySQL 客户端:${NC}"
    echo -e "  CentOS/RHEL: yum install -y mysql"
    echo -e "  Ubuntu/Debian: apt-get install -y mysql-client"
    exit 1
fi

# 创建输出目录
mkdir -p "${OUTPUT_DIR}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${OUTPUT_DIR}/${DB_NAME}_${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库导出脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e "${BLUE}输出目录: ${BACKUP_DIR}${NC}"
echo -e ""

# 构建 mysqldump 命令
MYSQLDUMP_CMD="mysqldump -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQLDUMP_CMD="${MYSQLDUMP_CMD} -p${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
fi

# 导出完整数据库结构
echo -e "${YELLOW}[1/3] 导出数据库结构...${NC}"
${MYSQLDUMP_CMD} --no-data --routines --triggers "${DB_NAME}" > "${BACKUP_DIR}/01_structure.sql" 2>/dev/null || {
    echo -e "${RED}错误: 数据库结构导出失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 数据库结构已导出${NC}"

# 导出所有表数据
echo -e "${YELLOW}[2/3] 导出表数据...${NC}"

# 获取所有表名
TABLES=$(${MYSQLDUMP_CMD% -p*} -e "USE ${DB_NAME}; SHOW TABLES;" 2>/dev/null | grep -v "^Tables_in" | awk '{print $1}')

if [ -z "${TABLES}" ]; then
    echo -e "${RED}错误: 无法获取表列表或数据库为空${NC}"
    exit 1
fi

TABLE_COUNT=0
for TABLE in ${TABLES}; do
    TABLE_COUNT=$((TABLE_COUNT + 1))
    TABLE_FILE="${BACKUP_DIR}/02_data_$(printf "%03d" ${TABLE_COUNT})_${TABLE}.sql"
    echo -e "${BLUE}  导出表: ${TABLE}${NC}"
    ${MYSQLDUMP_CMD} --no-create-info --skip-triggers "${DB_NAME}" "${TABLE}" > "${TABLE_FILE}" 2>/dev/null || {
        echo -e "${YELLOW}  警告: 表 ${TABLE} 导出失败或为空${NC}"
        rm -f "${TABLE_FILE}"
    }
done

echo -e "${GREEN}✓ 已导出 ${TABLE_COUNT} 个表的数据${NC}"

# 导出存储过程和函数
echo -e "${YELLOW}[3/3] 导出存储过程和函数...${NC}"
${MYSQLDUMP_CMD} --routines --no-create-info --no-data --no-tablespaces --skip-triggers "${DB_NAME}" > "${BACKUP_DIR}/03_routines.sql" 2>/dev/null || {
    echo -e "${YELLOW}警告: 存储过程和函数导出失败或不存在${NC}"
    touch "${BACKUP_DIR}/03_routines.sql"
}
echo -e "${GREEN}✓ 存储过程和函数已导出${NC}"

# 创建导入脚本
echo -e "${YELLOW}创建导入脚本...${NC}"
cat > "${BACKUP_DIR}/import.sh" <<'IMPORT_SCRIPT'
#!/bin/bash
# 数据库导入脚本
# 使用方法: ./import.sh [数据库名] [数据库主机] [数据库用户] [数据库密码] [数据库端口]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 参数处理
DB_NAME="${1:-heartsphere}"
DB_HOST="${2:-localhost}"
DB_USER="${3:-root}"
DB_PASSWORD="${4}"
DB_PORT="${5:-3306}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  数据库导入脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e ""

# 检查 MySQL 客户端
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: 未找到 mysql 命令${NC}"
    exit 1
fi

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_CMD="${MYSQL_CMD} -p${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
fi

# 创建数据库
echo -e "${YELLOW}[1/4] 创建数据库...${NC}"
${MYSQL_CMD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${RED}错误: 数据库创建失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 数据库已创建${NC}"

# 导入数据库结构
echo -e "${YELLOW}[2/4] 导入数据库结构...${NC}"
if [ -f "${SCRIPT_DIR}/01_structure.sql" ]; then
    ${MYSQL_CMD} "${DB_NAME}" < "${SCRIPT_DIR}/01_structure.sql" 2>/dev/null || {
        echo -e "${RED}错误: 数据库结构导入失败${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ 数据库结构已导入${NC}"
else
    echo -e "${YELLOW}警告: 未找到结构文件${NC}"
fi

# 导入表数据
echo -e "${YELLOW}[3/4] 导入表数据...${NC}"
DATA_FILES=$(ls -1 "${SCRIPT_DIR}"/02_data_*.sql 2>/dev/null | sort)
if [ -n "${DATA_FILES}" ]; then
    for DATA_FILE in ${DATA_FILES}; do
        TABLE_NAME=$(basename "${DATA_FILE}" | sed 's/02_data_[0-9]*_\(.*\)\.sql/\1/')
        echo -e "${BLUE}  导入表: ${TABLE_NAME}${NC}"
        ${MYSQL_CMD} "${DB_NAME}" < "${DATA_FILE}" 2>/dev/null || {
            echo -e "${YELLOW}  警告: 表 ${TABLE_NAME} 导入失败${NC}"
        }
    done
    echo -e "${GREEN}✓ 表数据已导入${NC}"
else
    echo -e "${YELLOW}警告: 未找到数据文件${NC}"
fi

# 导入存储过程和函数
echo -e "${YELLOW}[4/4] 导入存储过程和函数...${NC}"
if [ -f "${SCRIPT_DIR}/03_routines.sql" ] && [ -s "${SCRIPT_DIR}/03_routines.sql" ]; then
    ${MYSQL_CMD} "${DB_NAME}" < "${SCRIPT_DIR}/03_routines.sql" 2>/dev/null || {
        echo -e "${YELLOW}警告: 存储过程和函数导入失败${NC}"
    }
    echo -e "${GREEN}✓ 存储过程和函数已导入${NC}"
else
    echo -e "${YELLOW}跳过: 无存储过程和函数${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库导入完成！${NC}"
IMPORT_SCRIPT

chmod +x "${BACKUP_DIR}/import.sh"

# 创建 README
cat > "${BACKUP_DIR}/README.md" <<README
# 数据库备份说明

## 备份信息
- 数据库名: ${DB_NAME}
- 备份时间: $(date '+%Y-%m-%d %H:%M:%S')
- 备份主机: ${DB_HOST}:${DB_PORT}

## 文件说明
- \`01_structure.sql\`: 数据库结构（表、索引、约束等）
- \`02_data_*.sql\`: 各表的数据文件
- \`03_routines.sql\`: 存储过程和函数
- \`import.sh\`: 自动导入脚本

## 使用方法

### 方法1: 使用自动导入脚本（推荐）
\`\`\`bash
./import.sh [数据库名] [数据库主机] [数据库用户] [数据库密码] [数据库端口]
\`\`\`

示例（本地数据库）:
\`\`\`bash
./import.sh heartsphere localhost root yourpassword 3306
\`\`\`

示例（远程数据库）:
\`\`\`bash
./import.sh heartsphere remote-host.com root yourpassword 3306
\`\`\`

### 方法2: 手动导入
\`\`\`bash
# 1. 创建数据库
mysql -h主机 -u用户 -p密码 -e "CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入结构
mysql -h主机 -u用户 -p密码 heartsphere < 01_structure.sql

# 3. 导入数据
mysql -h主机 -u用户 -p密码 heartsphere < 02_data_*.sql

# 4. 导入存储过程
mysql -h主机 -u用户 -p密码 heartsphere < 03_routines.sql
\`\`\`

## 注意事项
1. 导入前请确保目标数据库已创建
2. 如果目标数据库已存在数据，导入可能会失败，建议先备份
3. 确保 MySQL 用户有足够的权限（CREATE, INSERT, UPDATE, DELETE等）
4. 远程导入需要确保网络连接正常
README

# 压缩备份文件
echo -e "${YELLOW}压缩备份文件...${NC}"
cd "${OUTPUT_DIR}"
tar -czf "${DB_NAME}_${TIMESTAMP}.tar.gz" "${DB_NAME}_${TIMESTAMP}" 2>/dev/null || {
    echo -e "${YELLOW}警告: 压缩失败，但备份文件已保存${NC}"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库导出完成！${NC}"
echo -e "${BLUE}备份目录: ${BACKUP_DIR}${NC}"
echo -e "${BLUE}压缩文件: ${OUTPUT_DIR}/${DB_NAME}_${TIMESTAMP}.tar.gz${NC}"
echo -e "${GREEN}========================================${NC}"


