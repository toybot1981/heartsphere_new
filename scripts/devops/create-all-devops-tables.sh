#!/bin/bash

# 创建所有 DevOps 相关数据库表的脚本

set -e

echo "📊 开始创建所有 DevOps 数据库表..."

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

# SQL 文件列表
SQL_FILES=(
    "sql/create_cmdb_tables.sql"
    "sql/create_pipeline_quality_tables.sql"
    "sql/create_auto_fix_tables.sql"
    "sql/migration_allow_null_step_id.sql"
)

# 检查所有 SQL 文件是否存在
MISSING_FILES=()
for file in "${SQL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ 错误: 以下 SQL 文件不存在:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

echo "📝 将执行以下 SQL 脚本:"
for file in "${SQL_FILES[@]}"; do
    echo "  - $file"
done
echo "📦 数据库: $DB_NAME"
echo "👤 用户: $DB_USER"
echo ""

# 执行每个 SQL 脚本
for file in "${SQL_FILES[@]}"; do
    echo "执行: $file"
    $MYSQL_CMD $DB_NAME < $file
    if [ $? -eq 0 ]; then
        echo "  ✅ 成功"
    else
        echo "  ❌ 失败"
        exit 1
    fi
done

echo ""
echo "✅ 所有 DevOps 表创建成功！"
echo ""
echo "已创建的表:"
echo "  CMDB 相关:"
echo "    - cmdb_asset_types"
echo "    - cmdb_assets"
echo "    - cmdb_relationship_types"
echo "    - cmdb_asset_relationships"
echo "    - cmdb_asset_history"
echo "    - cmdb_audit_logs"
echo "  流程质量相关:"
echo "    - code_scan_results"
echo "    - test_results"
echo "  自动修复相关:"
echo "    - auto_fix_records"
echo "  流程执行相关:"
echo "    - pipeline_step_executions (已更新，允许 step_id 为 NULL)"
