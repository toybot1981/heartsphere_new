#!/bin/bash

# Heartsphere 所有数据库备份脚本
# 备份所有 heartsphere 相关的数据库到 sql/backups 目录

set -e

# MySQL 配置
MYSQL_USER="root"
MYSQL_PASSWORD="123456"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_BIN="/usr/local/mysql-8.0.43-macos15-arm64/bin/mysql"
MYSQLDUMP_BIN="/usr/local/mysql-8.0.43-macos15-arm64/bin/mysqldump"

# 备份目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

echo "========================================="
echo "Heartsphere 数据库备份工具"
echo "========================================="
echo "备份时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "备份目录: $BACKUP_DIR"
echo ""

# 获取所有 heartsphere 相关的数据库
echo "正在查找 heartsphere 数据库..."
DATABASES=$($MYSQL_BIN -u$MYSQL_USER -p$MYSQL_PASSWORD -h$MYSQL_HOST -P$MYSQL_PORT -e "SHOW DATABASES LIKE 'heartsphere%';" | grep -v "Database" | grep -v "^$" || echo "")

if [ -z "$DATABASES" ]; then
    echo "错误: 未找到任何 heartsphere 数据库！"
    exit 1
fi

echo "找到以下数据库："
echo "$DATABASES" | while read db; do
    echo "  - $db"
done
echo ""

# 备份每个数据库
for DATABASE in $DATABASES; do
    if [ -z "$DATABASE" ]; then
        continue
    fi
    
    BACKUP_FILE="${BACKUP_DIR}/${DATABASE}_${TIMESTAMP}.sql"
    
    echo "正在备份数据库: $DATABASE"
    echo "  备份文件: $(basename $BACKUP_FILE)"
    
    # 执行备份
    $MYSQLDUMP_BIN \
        -u$MYSQL_USER \
        -p$MYSQL_PASSWORD \
        -h$MYSQL_HOST \
        -P$MYSQL_PORT \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --quick \
        --lock-tables=false \
        --default-character-set=utf8mb4 \
        $DATABASE > "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        echo "  ✓ 备份成功! 文件大小: $FILE_SIZE"
    else
        echo "  ✗ 备份失败!"
        rm -f "$BACKUP_FILE"
    fi
    echo ""
done

echo "========================================="
echo "备份完成!"
echo "========================================="
echo "备份文件位置: $BACKUP_DIR"
echo ""

# 创建备份索引文件
INDEX_FILE="${BACKUP_DIR}/backup_index.txt"
echo "备份索引 - $(date '+%Y-%m-%d %H:%M:%S')" >> "$INDEX_FILE"
echo "备份时间戳: $TIMESTAMP" >> "$INDEX_FILE"
echo "备份的数据库:" >> "$INDEX_FILE"
echo "$DATABASES" | while read db; do
    if [ ! -z "$db" ]; then
        echo "  - $db -> ${db}_${TIMESTAMP}.sql" >> "$INDEX_FILE"
    fi
done
echo "" >> "$INDEX_FILE"

echo "备份索引已更新: backup_index.txt"
