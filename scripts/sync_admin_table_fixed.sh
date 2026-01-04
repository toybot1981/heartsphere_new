#!/bin/bash
# 导出本地 admin 表并导入到远程数据库（修复版）
# 使用方法: ./sync_admin_table_fixed.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 临时 SQL 文件
TEMP_SQL_FILE="/tmp/heartsphere_admin_fixed_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}同步 admin 表到远程数据库${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查本地数据库连接
echo -e "${YELLOW}[1/4] 检查本地数据库连接...${NC}"
if mysql -h "${LOCAL_DB_HOST}" -P "${LOCAL_DB_PORT}" -u "${LOCAL_DB_USER}" -p"${LOCAL_DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 本地数据库连接成功${NC}"
else
    echo -e "${RED}✗ 本地数据库连接失败${NC}"
    exit 1
fi
echo ""

# 检查远程数据库连接
echo -e "${YELLOW}[2/4] 检查远程数据库连接...${NC}"
if mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 远程数据库连接成功${NC}"
else
    echo -e "${RED}✗ 远程数据库连接失败${NC}"
    exit 1
fi
echo ""

# 导出本地 admin 表数据
echo -e "${YELLOW}[3/4] 导出本地 system_admin 表...${NC}"

# 检查表是否存在
TABLE_EXISTS=$(mysql -h "${LOCAL_DB_HOST}" -P "${LOCAL_DB_PORT}" -u "${LOCAL_DB_USER}" -p"${LOCAL_DB_PASSWORD}" "${LOCAL_DB_NAME}" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${LOCAL_DB_NAME}' AND table_name = 'system_admin';" 2>/dev/null)

if [ "${TABLE_EXISTS}" = "0" ]; then
    echo -e "${RED}本地 system_admin 表不存在${NC}"
    exit 1
fi

# 检查是否有数据
ROW_COUNT=$(mysql -h "${LOCAL_DB_HOST}" -P "${LOCAL_DB_PORT}" -u "${LOCAL_DB_USER}" -p"${LOCAL_DB_PASSWORD}" "${LOCAL_DB_NAME}" -N -e "SELECT COUNT(*) FROM system_admin;" 2>/dev/null)

if [ "${ROW_COUNT}" = "0" ]; then
    echo -e "${YELLOW}本地表为空，跳过导出${NC}"
    exit 0
fi

# 直接使用 MySQL 查询生成 INSERT 语句
mysql -h "${LOCAL_DB_HOST}" -P "${LOCAL_DB_PORT}" -u "${LOCAL_DB_USER}" -p"${LOCAL_DB_PASSWORD}" "${LOCAL_DB_NAME}" -N << 'EOF' > "${TEMP_SQL_FILE}"
SELECT CONCAT(
    'INSERT INTO system_admin (id, username, password, email, role, is_active, last_login, created_at, updated_at) VALUES (',
    id, ',',
    QUOTE(username), ',',
    QUOTE(password), ',',
    QUOTE(email), ',',
    QUOTE(role), ',',
    is_active, ',',
    IFNULL(QUOTE(last_login), 'NULL'), ',',
    QUOTE(created_at), ',',
    QUOTE(updated_at),
    ') ON DUPLICATE KEY UPDATE password = VALUES(password), updated_at = NOW();'
) AS sql_statement
FROM system_admin;
EOF

# 清理空行
sed -i '' '/^$/d' "${TEMP_SQL_FILE}" 2>/dev/null || sed -i '/^$/d' "${TEMP_SQL_FILE}"

if [ ! -s "${TEMP_SQL_FILE}" ]; then
    echo -e "${RED}导出失败：生成的 SQL 文件为空${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 导出完成: ${TEMP_SQL_FILE}${NC}"
echo ""
echo -e "${BLUE}导出的 SQL 内容预览:${NC}"
head -5 "${TEMP_SQL_FILE}"
echo ""

# 导入到远程数据库
echo -e "${YELLOW}[4/4] 导入到远程数据库...${NC}"

# 先确保远程表存在
mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << 'EOF'
-- 如果表不存在，创建表结构
CREATE TABLE IF NOT EXISTS system_admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF

# 导入数据
mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" < "${TEMP_SQL_FILE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 导入成功${NC}"
else
    echo -e "${RED}✗ 导入失败${NC}"
    exit 1
fi

echo ""

# 验证导入结果
echo -e "${YELLOW}验证远程数据库中的管理员...${NC}"
mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << 'EOF'
SELECT id, username, email, role, is_active, created_at, updated_at 
FROM system_admin 
ORDER BY id;
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}同步完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "临时文件: ${TEMP_SQL_FILE}"
echo "（可以手动删除）"
echo ""
