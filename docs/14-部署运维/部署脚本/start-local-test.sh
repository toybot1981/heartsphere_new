#!/bin/bash
# 本地测试启动脚本 - 同时启动前后端服务器

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "启动本地测试环境"
echo "========================================="
echo ""

# 检查必要的工具
echo "1. 检查环境..."
if ! command -v java &> /dev/null; then
    echo "❌ 未找到 Java，请先安装 Java 17+"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "❌ 未找到 Maven，请先安装 Maven"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm，请先安装 Node.js"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 停止可能正在运行的服务
echo "2. 停止现有服务..."
pkill -f "HeartSphereApplication" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ 已停止现有服务"
echo ""

# 检查数据库连接（可选）
echo "3. 检查数据库配置..."
if [ -z "$DB_PASSWORD" ]; then
    echo "   ⚠️  未设置 DB_PASSWORD 环境变量，将使用默认配置"
    echo "   如需设置数据库密码，请运行: export DB_PASSWORD=your_password"
fi

# 启动后端
echo "4. 启动后端服务 (端口: 8081)..."
cd "$SCRIPT_DIR/backend"

# 检查是否需要编译
if [ ! -d "target/classes" ] || [ "pom.xml" -nt "target/classes" ]; then
    echo "   编译后端项目..."
    mvn clean compile -q
    if [ $? -ne 0 ]; then
        echo "❌ 后端编译失败"
        exit 1
    fi
fi

# 设置JVM参数优化DNS
export JAVA_OPTS="-Djava.net.preferIPv4Stack=true \
-Dio.netty.resolver.dns.queryTimeoutMillis=30000 \
-Dio.netty.resolver.dns.maxQueriesPerResolve=16 \
-Dio.netty.resolver.dns.recursionDesired=true \
-Djava.net.useSystemProxies=false"

echo "   启动后端服务（后台运行）..."
nohup mvn spring-boot:run > "$SCRIPT_DIR/backend-test.log" 2>&1 &
BACKEND_PID=$!
echo "   后端进程ID: $BACKEND_PID"
echo "   后端日志: $SCRIPT_DIR/backend-test.log"
echo ""

# 等待后端启动
echo "5. 等待后端服务启动..."
for i in {1..30}; do
    sleep 2
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/api/scenario-events/system/all" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        echo "✅ 后端服务已启动 (HTTP $HTTP_CODE)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  后端服务可能还在启动中，请查看日志: tail -f $SCRIPT_DIR/backend-test.log"
    else
        echo "   等待中... ($i/30)"
    fi
done
echo ""

# 启动前端
echo "6. 启动前端服务 (端口: 3000)..."
cd "$SCRIPT_DIR/frontend"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "   安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 前端依赖安装失败"
        exit 1
    fi
fi

echo "   启动前端开发服务器（后台运行）..."
nohup npm run dev > "$SCRIPT_DIR/frontend-test.log" 2>&1 &
FRONTEND_PID=$!
echo "   前端进程ID: $FRONTEND_PID"
echo "   前端日志: $SCRIPT_DIR/frontend-test.log"
echo ""

# 等待前端启动
echo "7. 等待前端服务启动..."
for i in {1..15}; do
    sleep 2
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        echo "✅ 前端服务已启动 (HTTP $HTTP_CODE)"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "⚠️  前端服务可能还在启动中，请查看日志: tail -f $SCRIPT_DIR/frontend-test.log"
    else
        echo "   等待中... ($i/15)"
    fi
done
echo ""

echo "========================================="
echo "启动完成！"
echo "========================================="
echo ""
echo "📋 服务信息："
echo "   后端服务: http://localhost:8081"
echo "   前端服务: http://localhost:3000"
echo "   Swagger文档: http://localhost:8081/swagger-ui.html"
echo ""
echo "📝 日志查看："
echo "   后端日志: tail -f $SCRIPT_DIR/backend-test.log"
echo "   前端日志: tail -f $SCRIPT_DIR/frontend-test.log"
echo ""
echo "🛑 停止服务："
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   或运行: pkill -f HeartSphereApplication && pkill -f vite"
echo ""
echo "========================================="
