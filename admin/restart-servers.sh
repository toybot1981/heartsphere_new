#!/bin/bash
# 重启管理端前后台服务器脚本

echo "=== 🔄 重启管理端服务器 ==="
echo ""

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 停止现有服务
echo "📋 停止现有服务..."
lsof -ti:8085 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
sleep 2

# 启动后端服务器
echo ""
echo "🚀 启动后端服务器 (端口 8085)..."
cd "$PROJECT_ROOT/admin/backend"
nohup mvn spring-boot:run > /tmp/admin-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/admin-backend.pid
echo "✅ 后端服务器启动中 (PID: $BACKEND_PID)"

# 等待后端启动
sleep 5

# 启动前端服务器
echo ""
echo "🚀 启动前端服务器 (端口 5173)..."
cd "$PROJECT_ROOT/admin/frontend"
nohup npm run dev > /tmp/admin-frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/admin-frontend.pid
echo "✅ 前端服务器启动中 (PID: $FRONTEND_PID)"

# 等待前端启动
sleep 5

# 检查服务状态
echo ""
echo "=== 📊 服务器状态 ==="
echo ""
if lsof -ti:8085 >/dev/null 2>&1; then
    echo "✅ 后端服务器: 运行中 (端口 8085, PID: $(lsof -ti:8085))"
else
    echo "⚠️  后端服务器: 未检测到"
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    echo "✅ 前端服务器: 运行中 (端口 5173, PID: $(lsof -ti:5173))"
else
    echo "⚠️  前端服务器: 未检测到"
fi

echo ""
echo "📋 查看日志:"
echo "  后端: tail -f /tmp/admin-backend.log"
echo "  前端: tail -f /tmp/admin-frontend.log"
echo ""
echo "📋 停止服务:"
echo "  kill \$(cat /tmp/admin-backend.pid) \$(cat /tmp/admin-frontend.pid)"
