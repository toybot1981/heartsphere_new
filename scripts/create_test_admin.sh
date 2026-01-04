#!/bin/bash

# 创建测试admin账号的脚本

DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

echo "=== 创建测试Admin账号 ==="

# 检查是否已存在admin账号
EXISTING=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "SELECT COUNT(*) FROM users WHERE username = 'testadmin';" 2>/dev/null)

if [ "$EXISTING" -gt 0 ]; then
    echo "testadmin账号已存在"
    # 更新密码为admin123
    mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -e "
    UPDATE users 
    SET password = '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    WHERE username = 'testadmin';
    " 2>/dev/null
    echo "✅ 已更新testadmin密码为: admin123"
else
    # 创建新admin账号
    mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -e "
    INSERT INTO users (username, email, password, role, created_at, updated_at)
    VALUES ('testadmin', 'testadmin@test.com', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NOW(), NOW());
    " 2>/dev/null
    echo "✅ 已创建testadmin账号，密码: admin123"
fi

echo ""
echo "账号信息:"
echo "  用户名: testadmin"
echo "  密码: admin123"
echo ""
