#!/bin/bash

# 修复系统预置表中的图片URL
# 确保URL路径与system_resources保持一致

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
LOG_FILE="$LOG_DIR/fix_system_tables_$TIMESTAMP.log"

echo "=========================================="
echo "修复系统预置表中的图片URL"
echo "=========================================="
echo ""

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误: 未找到 mysql 命令"
    echo "请使用数据库管理工具执行 SQL 脚本"
    echo ""
    echo "SQL 脚本位置: backend/scripts/fix_system_tables_urls.sql"
    exit 1
fi

echo "数据库配置:"
echo "  主机: $DB_HOST:$DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 询问确认
read -p "是否已备份数据库？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先执行备份脚本: bash backend/scripts/backup_before_migration.sh"
    exit 1
fi

echo ""
echo "开始修复系统预置表的 URL 路径..."
echo ""

# 执行修复脚本
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < backend/scripts/fix_system_tables_urls.sql \
    > "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "修复完成"
    echo "日志文件: $LOG_FILE"
    echo ""
    
    # 显示验证结果
    if grep -q "remaining_count\|table_name" "$LOG_FILE"; then
        echo "修复验证结果:"
        grep -A 10 "remaining_count\|table_name" "$LOG_FILE" | head -20
    fi
else
    echo "修复失败"
    echo "错误信息已保存到: $LOG_FILE"
    echo ""
    echo "错误详情:"
    tail -20 "$LOG_FILE"
    exit 1
fi

echo ""
echo "=========================================="
echo "修复完成"
echo ""
echo "下一步:"
echo "  1. 检查修复日志: $LOG_FILE"
echo "  2. 验证数据库中的 URL 是否已正确更新"
echo "  3. 如果还有问题，请手动检查并修复"
echo "=========================================="
