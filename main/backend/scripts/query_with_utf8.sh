#!/bin/bash

# 使用 UTF-8 字符集查询数据库的便捷脚本
# 用法: ./query_with_utf8.sh "SELECT * FROM system_resources LIMIT 10;"

set -e

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

# 如果提供了 SQL 文件路径，执行文件
if [ -f "$1" ]; then
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        --default-character-set=utf8mb4 \
        < "$1" 2>&1 | grep -v "Warning"
# 如果提供了 SQL 语句，执行语句
elif [ -n "$1" ]; then
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        --default-character-set=utf8mb4 \
        -e "$1" 2>&1 | grep -v "Warning"
# 否则进入交互模式
else
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        --default-character-set=utf8mb4
fi
