#!/bin/bash
# 数据库统计脚本

set -e

DATABASE="${1:-}"

# MySQL 配置
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-123456}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_BIN="${MYSQL_BIN:-mysql}"

echo "=========================================="
echo "数据库统计"
echo "=========================================="
echo "数据库: ${DATABASE:-全部}"
echo ""

if [ -n "$DATABASE" ]; then
    # 统计指定数据库
    echo "数据库: $DATABASE"
    "$MYSQL_BIN" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "
        SELECT 
            table_schema AS '数据库',
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS '大小(MB)',
            COUNT(*) AS '表数量'
        FROM information_schema.tables 
        WHERE table_schema = '$DATABASE'
        GROUP BY table_schema;
    "
else
    # 统计所有数据库
    "$MYSQL_BIN" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "
        SELECT 
            table_schema AS '数据库',
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS '大小(MB)',
            COUNT(*) AS '表数量'
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
        GROUP BY table_schema
        ORDER BY SUM(data_length + index_length) DESC;
    "
fi

echo ""
echo "=========================================="
echo "统计完成"
echo "=========================================="
