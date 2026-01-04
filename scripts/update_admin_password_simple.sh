#!/bin/bash
# 更新远程数据库中的管理员密码（简化版）
# 使用方法: ./update_admin_password_simple.sh

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

# 方法1: 使用 Spring Boot 项目生成 BCrypt 密码
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"

echo -e "${YELLOW}[1/3] 生成 BCrypt 加密密码...${NC}"

if [ -d "${BACKEND_DIR}" ] && [ -f "${BACKEND_DIR}/pom.xml" ]; then
    cd "${BACKEND_DIR}"
    
    # 创建一个临时的 Spring Boot 测试类来生成密码
    TEMP_TEST_DIR="${BACKEND_DIR}/src/test/java/com/heartsphere/temp"
    mkdir -p "${TEMP_TEST_DIR}"
    
    cat > "${TEMP_TEST_DIR}/PasswordGeneratorTest.java" << 'JAVA_EOF'
package com.heartsphere.temp;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGeneratorTest {
    @Test
    public void generatePassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Tyx@19811009";
        String encoded = encoder.encode(password);
        System.out.println("ENCODED_PASSWORD:" + encoded);
    }
}
JAVA_EOF
    
    # 运行测试生成密码
    ENCODED_PASSWORD=$(mvn test -Dtest=PasswordGeneratorTest -q 2>&1 | grep "ENCODED_PASSWORD:" | cut -d: -f2- | head -1)
    
    # 清理临时文件
    rm -rf "${TEMP_TEST_DIR}"
    
    if [ -z "${ENCODED_PASSWORD}" ]; then
        echo -e "${YELLOW}方法1失败，尝试使用在线工具...${NC}"
        echo ""
        echo -e "${BLUE}请访问以下网址生成 BCrypt 密码:${NC}"
        echo "  https://www.bcrypt-generator.com/"
        echo ""
        echo -e "${YELLOW}或者使用以下命令（需要安装 bcrypt Python 库）:${NC}"
        echo "  pip3 install bcrypt"
        echo "  python3 -c \"import bcrypt; print(bcrypt.hashpw(b'${NEW_PASSWORD}', bcrypt.gensalt()).decode())\""
        echo ""
        read -p "请输入 BCrypt 加密后的密码: " ENCODED_PASSWORD
    else
        echo -e "${GREEN}✓ 密码已加密${NC}"
    fi
else
    echo -e "${YELLOW}未找到 Spring Boot 项目，请手动生成 BCrypt 密码${NC}"
    echo ""
    echo "请访问: https://www.bcrypt-generator.com/"
    echo "输入密码: ${NEW_PASSWORD}"
    echo ""
    read -p "请输入 BCrypt 加密后的密码: " ENCODED_PASSWORD
fi

if [ -z "${ENCODED_PASSWORD}" ]; then
    echo -e "${RED}错误: 未提供加密密码${NC}"
    exit 1
fi

echo ""

# 测试数据库连接
echo -e "${YELLOW}[2/3] 测试远程数据库连接...${NC}"
if mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 远程数据库连接成功${NC}"
else
    echo -e "${RED}✗ 远程数据库连接失败${NC}"
    echo "请检查数据库连接信息"
    exit 1
fi
echo ""

# 更新密码
echo -e "${YELLOW}[3/3] 更新管理员密码...${NC}"

# 检查管理员是否存在
ADMIN_COUNT=$(mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" -N -e "SELECT COUNT(*) FROM system_admin WHERE username = '${ADMIN_USERNAME}';" 2>/dev/null)

if [ "${ADMIN_COUNT}" = "0" ]; then
    echo -e "${YELLOW}管理员账户不存在，创建新账户...${NC}"
    mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << EOF
INSERT INTO system_admin (username, password, email, role, is_active, created_at, updated_at)
VALUES ('${ADMIN_USERNAME}', '${ENCODED_PASSWORD}', 'admin@heartsphere.com', 'SUPER_ADMIN', 1, NOW(), NOW());
EOF
    echo -e "${GREEN}✓ 管理员账户已创建${NC}"
else
    mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << EOF
UPDATE system_admin 
SET password = '${ENCODED_PASSWORD}', updated_at = NOW()
WHERE username = '${ADMIN_USERNAME}';
EOF
    echo -e "${GREEN}✓ 密码更新成功${NC}"
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
