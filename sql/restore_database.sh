#!/bin/bash
# 数据库恢复脚本

set -e

BACKUP_FILE="${1:-}"
DATABASE="${2:-}"

if [ -z "$BACKUP_FILE" ] || [ -z "$DATABASE" ]; then
    echo "错误: 请提供备份文件路径和数据库名称"
    echo "用法: $0 <备份文件> <数据库名称>"
    exit 1
fi

# MySQL 配置
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-123456}"
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_BIN="${MYSQL_BIN:-mysql}"

echo "=========================================="
echo "数据库恢复"
echo "=========================================="
echo "备份文件: $BACKUP_FILE"
echo "目标数据库: $DATABASE"
echo ""

if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

# 解压（如果是压缩文件）
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "解压备份文件..."
    gunzip -c "$BACKUP_FILE" | "$MYSQL_BIN" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DATABASE"
else
    "$MYSQL_BIN" -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DATABASE" < "$BACKUP_FILE"
fi

echo ""
echo "=========================================="
echo "数据库恢复完成"
echo "=========================================="
