#!/bin/bash

# 创建 CMDB 数据库表的脚本

set -e

echo "📊 开始创建 CMDB 数据库表..."

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
SQL_FILE="sql/create_cmdb_tables.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: SQL 文件不存在: $SQL_FILE"
    exit 1
fi

echo "📝 执行 SQL 脚本: $SQL_FILE"
echo "📦 数据库: $DB_NAME"
echo "👤 用户: $DB_USER"
echo ""

# 执行 SQL 脚本
$MYSQL_CMD $DB_NAME < $SQL_FILE

if [ $? -eq 0 ]; then
    echo "✅ CMDB 表创建成功！"
    echo ""
    echo "已创建的表:"
    echo "  - cmdb_asset_types"
    echo "  - cmdb_assets"
    echo "  - cmdb_relationship_types"
    echo "  - cmdb_asset_relationships"
    echo "  - cmdb_asset_history"
    echo "  - cmdb_audit_logs"
else
    echo "❌ CMDB 表创建失败！"
    exit 1
fi
