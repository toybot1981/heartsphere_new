#!/bin/bash

# 执行迁移第二步：查询数据库并生成迁移报告
# 此脚本会执行 SQL 查询并生成报告

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

REPORT_DIR="backend/migration_reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/general_images_report_$TIMESTAMP.txt"

echo "=========================================="
echo "执行迁移第二步：数据库查询"
echo "=========================================="
echo ""

# 创建报告目录
mkdir -p "$REPORT_DIR"

# 检查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误: 未找到 mysql 命令"
    echo "请安装 MySQL 客户端或使用数据库管理工具执行 SQL 脚本"
    echo ""
    echo "SQL 脚本位置:"
    echo "  1. 统计查询: backend/scripts/query_general_images_count.sql"
    echo "  2. 详细报告: backend/scripts/generate_general_images_report.sql"
    exit 1
fi

echo "数据库配置:"
echo "  主机: $DB_HOST:$DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 执行统计查询
echo "1. 执行统计查询..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < backend/scripts/query_general_images_count.sql \
    > "$REPORT_DIR/count_report_$TIMESTAMP.txt" 2>&1

if [ $? -eq 0 ]; then
    echo "   统计查询完成，结果保存到: $REPORT_DIR/count_report_$TIMESTAMP.txt"
    echo ""
    echo "   统计结果:"
    cat "$REPORT_DIR/count_report_$TIMESTAMP.txt"
    echo ""
else
    echo "   统计查询失败，请检查数据库连接配置"
    echo "   错误信息已保存到: $REPORT_DIR/count_report_$TIMESTAMP.txt"
    exit 1
fi

# 执行详细报告查询
echo "2. 执行详细报告查询..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    < backend/scripts/generate_general_images_report.sql \
    > "$REPORT_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "   详细报告查询完成，结果保存到: $REPORT_FILE"
    echo ""
    echo "   报告摘要（前20行）:"
    head -20 "$REPORT_FILE"
    echo ""
    echo "   ... (完整报告请查看文件)"
else
    echo "   详细报告查询失败"
    echo "   错误信息已保存到: $REPORT_FILE"
    exit 1
fi

echo "=========================================="
echo "查询完成"
echo ""
echo "报告文件:"
echo "  统计报告: $REPORT_DIR/count_report_$TIMESTAMP.txt"
echo "  详细报告: $REPORT_FILE"
echo ""
echo "下一步:"
echo "  1. 查看详细报告，确认需要迁移的记录"
echo "  2. 备份数据库和文件系统"
echo "  3. 执行迁移脚本: backend/scripts/migrate_general_images_to_correct_category.sql"
echo "=========================================="
