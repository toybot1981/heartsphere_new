#!/bin/bash

# HeartSphere Edu 数据库初始化脚本

echo "🗄️  初始化 HeartSphere Edu 数据库..."
echo ""

# 检查 MySQL 是否运行
if ! pgrep -x "mysqld" > /dev/null && ! pgrep -x "mysql" > /dev/null; then
    echo "⚠️  警告: MySQL 服务可能未启动"
    echo "请确保 MySQL 服务已启动后再运行此脚本"
    echo ""
fi

# 数据库配置（从环境变量读取，或使用默认值）
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-123456}
DB_NAME=${DB_NAME:-heartsphere_edu}

echo "📋 数据库配置:"
echo "  - 主机: $DB_HOST"
echo "  - 端口: $DB_PORT"
echo "  - 用户: $DB_USER"
echo "  - 数据库: $DB_NAME"
echo ""

# 检查是否提供了密码
if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  警告: 未设置 DB_PASSWORD 环境变量，将尝试无密码连接"
    echo "如需设置密码，请运行: export DB_PASSWORD=your_password"
    echo ""
    MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER"
else
    MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD"
fi

# 创建数据库
echo "🔧 创建数据库 $DB_NAME..."
$MYSQL_CMD <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
SQL

if [ $? -eq 0 ]; then
    echo "✅ 数据库 $DB_NAME 创建成功"
else
    echo "❌ 数据库创建失败"
    echo "请检查:"
    echo "  1. MySQL 服务是否运行"
    echo "  2. 数据库连接配置是否正确"
    echo "  3. 用户权限是否足够"
    exit 1
fi

# 验证数据库
echo ""
echo "🔍 验证数据库..."
$MYSQL_CMD -e "USE ${DB_NAME}; SHOW TABLES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库连接成功"
    echo ""
    echo "📊 数据库信息:"
    $MYSQL_CMD -e "SELECT 
        SCHEMA_NAME as '数据库名称',
        DEFAULT_CHARACTER_SET_NAME as '字符集',
        DEFAULT_COLLATION_NAME as '排序规则'
    FROM 
        information_schema.SCHEMATA
    WHERE 
        SCHEMA_NAME = '${DB_NAME}';" 2>/dev/null
else
    echo "⚠️  数据库连接验证失败，但数据库已创建"
    echo "Flyway 将在后端启动时自动执行数据库迁移"
fi

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "📝 下一步:"
echo "  1. 启动后端服务: cd edu/backend && mvn spring-boot:run"
echo "  2. Flyway 会自动执行数据库迁移脚本"
echo "  3. 查看迁移后的表: $MYSQL_CMD -e 'USE ${DB_NAME}; SHOW TABLES;'"
echo ""
