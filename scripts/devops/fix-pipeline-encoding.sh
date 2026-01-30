#!/bin/bash

# 修复流程模板名称乱码问题的脚本

set -e

echo "🔧 开始修复流程模板名称乱码问题..."

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <数据库名> [用户名] [密码]"
    echo "示例: $0 heartsphere root"
    echo "或者: $0 heartsphere root mypassword"
    exit 1
fi

DB_NAME=$1
DB_USER=${2:-root}
DB_PASSWORD=${3:-""}

# 构建 MySQL 命令
if [ -z "$DB_PASSWORD" ]; then
    MYSQL_CMD="mysql -u $DB_USER"
else
    MYSQL_CMD="mysql -u $DB_USER -p$DB_PASSWORD"
fi

# 检查 SQL 文件是否存在
SQL_FILE="sql/fix_pipeline_name_encoding.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: SQL 文件不存在: $SQL_FILE"
    exit 1
fi

echo "📝 执行 SQL 脚本: $SQL_FILE"
echo "📦 数据库: $DB_NAME"
echo "👤 用户: $DB_USER"
echo ""

# 执行 SQL 脚本（使用 utf8mb4 字符集）
$MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME < $SQL_FILE 2>&1 | grep -v "Warning" || true

if [ $? -eq 0 ]; then
    echo "✅ 字符集修复完成！"
    echo ""
    echo "📊 验证结果："
    $MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME -e "
        SELECT id, name, project, environment 
        FROM deployment_pipelines 
        ORDER BY id;
    " 2>/dev/null | grep -v "Warning" || true
else
    echo "❌ 字符集修复失败！"
    exit 1
fi
