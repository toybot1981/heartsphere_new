#!/bin/bash
# 重启前后端服务脚本

set -e

echo "========================================="
echo "重启 HeartSphere 前后端服务"
echo "========================================="
echo ""

# 停止现有进程
echo "1. 停止现有进程..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "mvn.*spring-boot" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
lsof -ti:8081,5173,3000 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "   等待进程完全停止..."
sleep 3

echo ""
echo "2. 检查端口状态..."
if lsof -ti:8081,5173,3000 2>/dev/null; then
    echo "   ⚠️  仍有端口被占用，尝试强制停止..."
    lsof -ti:8081,5173,3000 2>/dev/null | xargs kill -9 2>/dev/null || true
    sleep 2
else
    echo "   ✅ 所有端口已释放"
fi

echo ""
echo "========================================="
echo "请在新终端窗口中分别启动前后端："
echo ""
echo "启动后端（终端1）:"
echo "  cd backend"
echo "  mvn spring-boot:run"
echo ""
echo "启动前端（终端2）:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "或者使用以下命令在后台启动："
echo ""
echo "后台启动后端:"
echo "  cd backend && nohup mvn spring-boot:run > ../backend.log 2>&1 &"
echo ""
echo "后台启动前端:"
echo "  cd frontend && nohup npm run dev > ../frontend.log 2>&1 &"
echo "========================================="
