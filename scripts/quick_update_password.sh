#!/bin/bash
# 快速更新密码脚本
# 需要先安装 bcrypt: pip3 install bcrypt

REMOTE_DB_HOST="rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com"
REMOTE_DB_USER="heartsphere"
REMOTE_DB_PASSWORD="Tyx@19811009"
REMOTE_DB_NAME="heartsphere"
NEW_PASSWORD="Tyx@19811009"

# 尝试使用 Python 生成 BCrypt 密码
if command -v python3 &> /dev/null; then
    ENCODED=$(python3 -c "import bcrypt; print(bcrypt.hashpw(b'${NEW_PASSWORD}', bcrypt.gensalt()).decode())" 2>/dev/null)
    if [ -n "$ENCODED" ]; then
        echo "生成的 BCrypt 密码: $ENCODED"
        mysql -h "$REMOTE_DB_HOST" -u "$REMOTE_DB_USER" -p"$REMOTE_DB_PASSWORD" "$REMOTE_DB_NAME" \
            -e "UPDATE system_admin SET password = '$ENCODED' WHERE username = 'admin';" && \
            echo "✅ 密码更新成功！" || echo "❌ 更新失败"
        exit 0
    fi
fi

echo "需要安装 bcrypt: pip3 install bcrypt"
echo "或者使用在线工具: https://www.bcrypt-generator.com/"
