#!/bin/bash
# 执行 SQL 查询脚本

set -e

DATABASE="${1:-}"
QUERY="${2:-}"

if [ -z "$DATABASE" ] || [ -z "$QUERY" ]; then
    echo "错误: 请提供数据库名称和查询语句"
    echo "用法: $0 <数据库名称> <查询语句>"
    exit 1
fi

# MySQL 配置
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-123456}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_BIN="${MYSQL_BIN:-mysql}"

echo "=========================================="
echo "执行 SQL 查询"
echo "=========================================="
echo "数据库: $DATABASE"
echo "查询: $QUERY"
echo ""

"$MYSQL_BIN" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DATABASE" -e "$QUERY"

echo ""
echo "=========================================="
echo "查询完成"
echo "=========================================="
