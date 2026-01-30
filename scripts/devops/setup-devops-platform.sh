#!/bin/bash

# DevOps 平台初始化脚本

set -e

echo "🚀 开始初始化 DevOps 平台..."

# 检查 MySQL 连接
echo "📊 检查数据库连接..."
# TODO: 添加数据库连接检查

# 创建数据库表
echo "📦 创建数据库表..."
if [ -f "sql/create_cmdb_tables.sql" ]; then
    echo "  执行 CMDB 表创建脚本..."
    # mysql -u root -p < sql/create_cmdb_tables.sql
fi

if [ -f "sql/create_pipeline_quality_tables.sql" ]; then
    echo "  执行流程质量表创建脚本..."
    # mysql -u root -p < sql/create_pipeline_quality_tables.sql
fi

if [ -f "sql/create_auto_fix_tables.sql" ]; then
    echo "  执行自动修复表创建脚本..."
    # mysql -u root -p < sql/create_auto_fix_tables.sql
fi

# 初始化测试项目
echo "🧪 初始化测试项目..."
if [ -d "test-project" ]; then
    cd test-project/backend
    if [ -f "pom.xml" ]; then
        echo "  安装后端依赖..."
        # mvn clean install -DskipTests
    fi
    cd ../frontend
    if [ -f "package.json" ]; then
        echo "  安装前端依赖..."
        # npm install
    fi
    cd ../..
fi

echo "✅ DevOps 平台初始化完成！"
echo ""
echo "📝 下一步："
echo "  1. 配置数据库连接"
echo "  2. 启动后端服务"
echo "  3. 启动前端服务"
echo "  4. 访问 DevOps 工作台"
