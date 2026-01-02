#!/bin/bash
# 重启前后端服务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "停止现有服务..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "mvn.*spring-boot" 2>/dev/null || true  
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
lsof -ti:8081,5173,3000 2>/dev/null | xargs kill -9 2>/dev/null || true

sleep 2

echo "启动后端服务（后台，跳过测试）..."
cd "$SCRIPT_DIR/backend"
nohup mvn spring-boot:run -DskipTests > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "  后端 PID: $BACKEND_PID"

sleep 2

echo "启动前端服务（后台）..."
cd "$SCRIPT_DIR/frontend"
nohup npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "  前端 PID: $FRONTEND_PID"

sleep 3

echo ""
echo "========================================="
echo "服务启动中..."
echo "========================================="
echo "后端 PID: $BACKEND_PID"
echo "前端 PID: $FRONTEND_PID"
echo ""
echo "查看日志:"
echo "  tail -f backend.log    # 后端日志"
echo "  tail -f frontend.log   # 前端日志"
echo ""
echo "停止服务:"
echo "  pkill -f 'spring-boot:run'  # 停止后端"
echo "  pkill -f 'vite'             # 停止前端"
echo ""
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8081"
echo "========================================="
