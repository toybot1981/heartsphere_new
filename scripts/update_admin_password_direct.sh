#!/bin/bash
# 直接更新远程数据库管理员密码
# 需要先手动生成 BCrypt 密码

set -e

# 远程数据库配置
REMOTE_DB_HOST="rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com"
REMOTE_DB_PORT="3306"
REMOTE_DB_NAME="heartsphere"
REMOTE_DB_USER="heartsphere"
REMOTE_DB_PASSWORD="Tyx@19811009"

NEW_PASSWORD="Tyx@19811009"
ADMIN_USERNAME="admin"

echo "=========================================="
echo "更新远程数据库管理员密码"
echo "=========================================="
echo ""
echo "请先使用以下方法生成 BCrypt 密码:"
echo ""
echo "方法1: 在线工具"
echo "  访问: https://www.bcrypt-generator.com/"
echo "  输入密码: ${NEW_PASSWORD}"
echo "  复制生成的 BCrypt hash"
echo ""
echo "方法2: 使用后端项目（如果可用）"
echo "  cd backend"
echo "  mvn test-compile"
echo "  # 然后运行 PasswordGenerator.java"
echo ""
read -p "请输入 BCrypt 加密后的密码: " ENCODED_PASSWORD

if [ -z "${ENCODED_PASSWORD}" ]; then
    echo "错误: 未提供加密密码"
    exit 1
fi

echo ""
echo "正在连接数据库并更新密码..."

# 更新密码
mysql -h "${REMOTE_DB_HOST}" -P "${REMOTE_DB_PORT}" -u "${REMOTE_DB_USER}" -p"${REMOTE_DB_PASSWORD}" "${REMOTE_DB_NAME}" << EOF
-- 检查并创建或更新管理员
INSERT INTO system_admin (username, password, email, role, is_active, created_at, updated_at)
VALUES ('${ADMIN_USERNAME}', '${ENCODED_PASSWORD}', 'admin@heartsphere.com', 'SUPER_ADMIN', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    password = '${ENCODED_PASSWORD}',
    updated_at = NOW();
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 密码更新成功！"
    echo ""
    echo "管理员信息:"
    echo "  用户名: ${ADMIN_USERNAME}"
    echo "  新密码: ${NEW_PASSWORD}"
else
    echo ""
    echo "❌ 密码更新失败"
    exit 1
fi
