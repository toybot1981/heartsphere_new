#!/bin/bash

# 备份 DevOps 平台数据

set -e

echo "💾 开始备份 DevOps 平台数据..."

BACKUP_DIR="${BACKUP_DIR:-backups/devops}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

# 备份数据库
echo "📦 备份数据库..."
if [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
    mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        --tables \
        cmdb_assets \
        cmdb_asset_relationships \
        cmdb_asset_history \
        deployment_pipelines \
        pipeline_executions \
        code_scan_results \
        test_results \
        auto_fix_records \
        > "$BACKUP_PATH/database.sql"
    
    echo "  ✅ 数据库备份完成: $BACKUP_PATH/database.sql"
else
    echo "  ⚠️  跳过数据库备份（需要 DB_NAME, DB_USER, DB_PASSWORD）"
fi

# 备份配置文件
echo "📄 备份配置文件..."
if [ -d "admin/backend/src/main/resources" ]; then
    cp -r admin/backend/src/main/resources "$BACKUP_PATH/config"
    echo "  ✅ 配置文件备份完成"
fi

# 备份脚本
echo "📜 备份脚本..."
if [ -d "scripts" ]; then
    cp -r scripts "$BACKUP_PATH/scripts"
    echo "  ✅ 脚本备份完成"
fi

# 创建备份清单
echo "📋 创建备份清单..."
cat > "$BACKUP_PATH/backup_manifest.txt" << EOF
备份时间: $(date)
备份目录: $BACKUP_PATH
包含内容:
  - 数据库表数据
  - 配置文件
  - 脚本文件
EOF

echo "✅ 备份完成: $BACKUP_PATH"
echo "📊 备份大小: $(du -sh "$BACKUP_PATH" | cut -f1)"
