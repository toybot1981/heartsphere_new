#!/bin/bash
# 迁移 script_executions 表的列大小

set -e

DATABASE="${1:-heartsphere}"
MYSQL_USER="${2:-root}"
MYSQL_PASSWORD="${3:-}"

echo "🔧 开始迁移 script_executions 表的列大小..."
echo "📦 数据库: $DATABASE"
echo "👤 用户: $MYSQL_USER"
echo ""

# 检查 MySQL 命令是否存在
if ! command -v mysql &> /dev/null
then
    echo "错误: mysql 命令行工具未找到。请确保 MySQL 客户端已安装并配置到 PATH 中。"
    exit 1
fi

# 构建 MySQL 连接命令
MYSQL_CMD="mysql -u$MYSQL_USER"
if [ -n "$MYSQL_PASSWORD" ]; then
    MYSQL_CMD="$MYSQL_CMD -p$MYSQL_PASSWORD"
fi
MYSQL_CMD="$MYSQL_CMD $DATABASE"

# 显示当前列的大小
echo "📊 当前列的大小:"
$MYSQL_CMD -e "
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '$DATABASE' 
AND TABLE_NAME = 'script_executions' 
AND COLUMN_NAME IN ('output', 'error')
;"
echo ""

# 执行迁移
echo "执行迁移脚本..."
$MYSQL_CMD < sql/migrate_script_execution_output_column.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 迁移成功！"
    echo ""
    echo "📊 迁移后的列大小:"
    $MYSQL_CMD -e "
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = '$DATABASE' 
AND TABLE_NAME = 'script_executions' 
AND COLUMN_NAME IN ('output', 'error')
;"
else
    echo ""
    echo "❌ 迁移失败！"
    exit 1
fi

echo ""
echo "📝 迁移详情:"
echo "  • output 列: TEXT (65KB) → LONGTEXT (4GB)"
echo "  • error 列: TEXT (65KB) → LONGTEXT (4GB)"
echo ""
echo "⚠️  注意:"
echo "  • 脚本输出超过 5MB 会被自动截断（仅保存最后 5MB）"
echo "  • 完整的日志始终保存在文件系统 (logs/script-executions/)"
echo "  • 建议在后端重启前执行此迁移"
echo ""
