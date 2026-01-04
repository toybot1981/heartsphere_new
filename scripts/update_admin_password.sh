#!/bin/bash
# 更新远程数据库中的管理员密码
# 使用方法: ./update_admin_password.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 远程数据库配置
REMOTE_DB_HOST="rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com"
REMOTE_DB_PORT="3306"
REMOTE_DB_NAME="heartsphere"
REMOTE_DB_USER="heartsphere"
REMOTE_DB_PASSWORD="Tyx@19811009"

# 新密码
NEW_PASSWORD="Tyx@19811009"
ADMIN_USERNAME="admin"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}更新远程数据库管理员密码${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Java 环境（用于生成 BCrypt 密码）
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到 Java 环境${NC}"
    echo "请先安装 Java 或使用在线 BCrypt 生成器"
    exit 1
fi

# 创建临时 Java 文件来生成 BCrypt 密码
TEMP_JAVA_FILE=$(mktemp /tmp/bcrypt_generator_XXXXXX.java)
TEMP_CLASS_FILE=$(mktemp /tmp/BcryptGenerator_XXXXXX.class)

cat > "${TEMP_JAVA_FILE}" << 'JAVA_EOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptGenerator {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: java BcryptGenerator <password>");
            System.exit(1);
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encoded = encoder.encode(args[0]);
        System.out.println(encoded);
    }
}
JAVA_EOF

echo -e "${YELLOW}[1/4] 生成 BCrypt 加密密码...${NC}"

# 尝试使用 Spring Boot 项目来生成密码
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"

if [ -d "${BACKEND_DIR}" ] && [ -f "${BACKEND_DIR}/pom.xml" ]; then
    echo -e "${BLUE}使用 Spring Boot 项目生成 BCrypt 密码...${NC}"
    cd "${BACKEND_DIR}"
    
    # 创建临时 Java 类来生成密码
    TEMP_PKG_DIR="${BACKEND_DIR}/src/main/java/com/heartsphere/temp"
    mkdir -p "${TEMP_PKG_DIR}"
    
    cat > "${TEMP_PKG_DIR}/PasswordGenerator.java" << 'JAVA_EOF'
package com.heartsphere.temp;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: PasswordGenerator <password>");
            System.exit(1);
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encoded = encoder.encode(args[0]);
        System.out.println(encoded);
    }
}
JAVA_EOF
    
    # 编译并运行
    mvn compile -q > /dev/null 2>&1
    ENCODED_PASSWORD=$(mvn exec:java -Dexec.mainClass="com.heartsphere.temp.PasswordGenerator" -Dexec.args="${NEW_PASSWORD}" -q 2>/dev/null | tail -1)
    
    # 清理临时文件
    rm -rf "${TEMP_PKG_DIR}"
    
    if [ -z "${ENCODED_PASSWORD}" ] || [ "${ENCODED_PASSWORD}" = "${NEW_PASSWORD}" ]; then
        echo -e "${YELLOW}使用在线 BCrypt 生成器...${NC}"
        # 如果 Maven 方法失败，使用在线工具或 Python
        if command -v python3 &> /dev/null; then
            ENCODED_PASSWORD=$(python3 -c "
import bcrypt
password = '${NEW_PASSWORD}'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
" 2>/dev/null)
        fi
    fi
else
    echo -e "${YELLOW}使用 Python bcrypt 库...${NC}"
    if command -v python3 &> /dev/null; then
        ENCODED_PASSWORD=$(python3 -c "
import bcrypt
password = '${NEW_PASSWORD}'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
" 2>/dev/null)
    fi
fi

if [ -z "${ENCODED_PASSWORD}" ]; then
    echo -e "${RED}错误: 无法生成 BCrypt 密码${NC}"
    echo ""
    echo "请手动生成 BCrypt 密码，然后使用以下 SQL 更新:"
    echo "UPDATE system_admin SET password = '<BCrypt_Hash>' WHERE username = '${ADMIN_USERNAME}';"
    echo ""
    echo "可以使用在线工具: https://www.bcrypt-generator.com/"
    exit 1
fi

echo -e "${GREEN}✓ 密码已加密: ${ENCODED_PASSWORD:0:20}...${NC}"
echo ""

# 测试数据库连接
echo -e "${YELLOW}[2/4] 测试远程数据库连接...${NC}"
CONNECTION_TEST=$(mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" -e "SELECT 1;" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 远程数据库连接成功${NC}"
else
    echo -e "${RED}✗ 远程数据库连接失败${NC}"
    echo "${CONNECTION_TEST}"
    exit 1
fi
echo ""

# 检查管理员是否存在
echo -e "${YELLOW}[3/4] 检查管理员账户...${NC}"
ADMIN_EXISTS=$(mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" -N -e "SELECT COUNT(*) FROM system_admin WHERE username = '${ADMIN_USERNAME}';" 2>&1)

if [ "${ADMIN_EXISTS}" = "0" ]; then
    echo -e "${YELLOW}管理员账户不存在，将创建新账户...${NC}"
    mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << EOF
INSERT INTO system_admin (username, password, email, role, is_active, created_at, updated_at)
VALUES ('${ADMIN_USERNAME}', '${ENCODED_PASSWORD}', 'admin@heartsphere.com', 'SUPER_ADMIN', 1, NOW(), NOW());
EOF
    echo -e "${GREEN}✓ 管理员账户已创建${NC}"
else
    echo -e "${GREEN}✓ 找到管理员账户${NC}"
fi
echo ""

# 更新密码
echo -e "${YELLOW}[4/4] 更新管理员密码...${NC}"
mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << EOF
UPDATE system_admin 
SET password = '${ENCODED_PASSWORD}', updated_at = NOW()
WHERE username = '${ADMIN_USERNAME}';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 密码更新成功${NC}"
else
    echo -e "${RED}✗ 密码更新失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}密码更新完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "管理员信息:"
echo "  用户名: ${ADMIN_USERNAME}"
echo "  新密码: ${NEW_PASSWORD}"
echo ""
