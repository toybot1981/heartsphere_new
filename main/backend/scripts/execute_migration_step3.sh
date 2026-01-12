#!/bin/bash

# 执行迁移第三步：数据库迁移
# 更新数据库中的 URL 路径

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

LOG_DIR="backend/migration_logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/migration_step3_$TIMESTAMP.log"

echo "=========================================="
echo "执行迁移第三步：数据库迁移"
echo "=========================================="
echo ""

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误: 未找到 mysql 命令"
    echo "请使用数据库管理工具执行 SQL 脚本"
    echo ""
    echo "SQL 脚本位置: backend/scripts/migrate_general_images_to_correct_category.sql"
    exit 1
fi

echo "数据库配置:"
echo "  主机: $DB_HOST:$DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 询问确认
read -p "是否已备份数据库和文件系统？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先执行备份脚本: bash backend/scripts/backup_before_migration.sh"
    exit 1
fi

echo ""
echo "开始执行数据库迁移..."
echo ""

# 执行迁移脚本
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < backend/scripts/migrate_general_images_to_correct_category.sql \
    > "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "数据库迁移完成"
    echo "日志文件: $LOG_FILE"
    echo ""
    
    # 显示验证结果（如果有）
    if grep -q "统计汇总\|remaining_count" "$LOG_FILE"; then
        echo "迁移验证结果:"
        grep -A 20 "统计汇总\|remaining_count" "$LOG_FILE" | head -30
    fi
else
    echo "数据库迁移失败"
    echo "错误信息已保存到: $LOG_FILE"
    echo ""
    echo "错误详情:"
    tail -20 "$LOG_FILE"
    exit 1
fi

echo ""
echo "=========================================="
echo "数据库迁移完成"
echo ""
echo "下一步:"
echo "  1. 检查迁移日志: $LOG_FILE"
echo "  2. 验证数据库中的 URL 是否已更新"
echo "  3. 执行文件系统迁移: bash backend/scripts/migrate_general_images_files.sh"
echo "=========================================="
