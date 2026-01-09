#!/bin/bash

# 迁移前备份脚本
# 备份数据库和文件系统

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

BACKUP_DIR="backups/migration_$(date +%Y%m%d_%H%M%S)"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "迁移前备份"
echo "=========================================="
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"
echo "备份目录: $BACKUP_DIR"
echo ""

# 1. 备份数据库
echo "1. 备份数据库..."
if command -v mysqldump &> /dev/null; then
    mysqldump -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        > "$BACKUP_DIR/database_backup.sql" 2>&1
    
    if [ $? -eq 0 ]; then
        DB_SIZE=$(du -h "$BACKUP_DIR/database_backup.sql" | cut -f1)
        echo "   数据库备份完成: $BACKUP_DIR/database_backup.sql ($DB_SIZE)"
    else
        echo "   数据库备份失败，请检查数据库连接"
        exit 1
    fi
else
    echo "   警告: 未找到 mysqldump 命令，跳过数据库备份"
    echo "   请手动备份数据库"
fi
echo ""

# 2. 备份文件系统
echo "2. 备份文件系统..."
UPLOADS_DIR="backend/uploads/images"
if [ -d "$UPLOADS_DIR" ]; then
    echo "   复制上传目录..."
    cp -r "$UPLOADS_DIR" "$BACKUP_DIR/uploads_images_backup"
    if [ $? -eq 0 ]; then
        FS_SIZE=$(du -sh "$BACKUP_DIR/uploads_images_backup" | cut -f1)
        echo "   文件系统备份完成: $BACKUP_DIR/uploads_images_backup ($FS_SIZE)"
    else
        echo "   文件系统备份失败"
        exit 1
    fi
else
    echo "   警告: 上传目录不存在: $UPLOADS_DIR"
fi
echo ""

# 3. 创建备份信息文件
cat > "$BACKUP_DIR/backup_info.txt" << EOF
备份时间: $(date)
数据库: $DB_NAME
主机: $DB_HOST
备份目录: $BACKUP_DIR

备份内容:
1. 数据库: database_backup.sql
2. 文件系统: uploads_images_backup/

恢复方法:
1. 恢复数据库: mysql -u root -p $DB_NAME < database_backup.sql
2. 恢复文件系统: cp -r uploads_images_backup/* backend/uploads/images/
EOF

echo "3. 备份信息已保存到: $BACKUP_DIR/backup_info.txt"
echo ""

echo "=========================================="
echo "备份完成"
echo ""
echo "备份位置: $BACKUP_DIR"
echo "=========================================="
