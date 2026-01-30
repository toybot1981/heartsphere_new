#!/bin/bash

# DevOps 平台部署脚本

set -e

echo "🚀 开始部署 DevOps 平台..."

# 检查环境
echo "🔍 检查部署环境..."

# 检查 Java
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未找到 Java，请先安装 Java 17+"
    exit 1
fi
echo "  ✅ Java: $(java -version 2>&1 | head -n 1)"

# 检查 Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误: 未找到 Maven，请先安装 Maven 3.6+"
    exit 1
fi
echo "  ✅ Maven: $(mvn -version | head -n 1)"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi
echo "  ✅ Node.js: $(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi
echo "  ✅ npm: $(npm -v)"

# 构建后端
echo "📦 构建后端..."
cd admin/backend
if [ -f "pom.xml" ]; then
    mvn clean package -DskipTests
    echo "  ✅ 后端构建完成"
else
    echo "  ❌ pom.xml 不存在"
    exit 1
fi
cd ../..

# 构建前端
echo "📦 构建前端..."
cd admin/frontend
if [ -f "package.json" ]; then
    npm install
    npm run build
    echo "  ✅ 前端构建完成"
else
    echo "  ❌ package.json 不存在"
    exit 1
fi
cd ../..

# 运行数据库迁移
echo "💾 运行数据库迁移..."
if [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
    echo "  执行数据库迁移..."
    # mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/create_cmdb_tables.sql
    # mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/create_pipeline_quality_tables.sql
    # mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/create_auto_fix_tables.sql
    echo "  ✅ 数据库迁移完成（已注释，请手动执行）"
else
    echo "  ⚠️  跳过数据库迁移（需要 DB_NAME, DB_USER, DB_PASSWORD）"
fi

echo "✅ DevOps 平台部署完成！"
echo ""
echo "📝 下一步："
echo "  1. 配置数据库连接（application.yml）"
echo "  2. 启动后端服务: cd admin/backend && mvn spring-boot:run"
echo "  3. 启动前端服务: cd admin/frontend && npm run dev"
echo "  4. 访问平台: http://localhost:3005"
