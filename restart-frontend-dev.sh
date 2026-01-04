#!/bin/bash
# 重启前端开发服务器（清除 Vite 缓存）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo "重启前端开发服务器"
echo "========================================="

echo "1. 停止现有前端服务..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 2

echo "2. 清除 Vite 缓存..."
cd "$SCRIPT_DIR/frontend"
rm -rf node_modules/.vite
echo "   Vite 缓存已清除"

echo "3. 启动前端开发服务器..."
cd "$SCRIPT_DIR/frontend"
npm run dev

echo ""
echo "前端服务器应该已经启动，访问: http://localhost:3000"
echo "如果还有问题，请检查终端输出"
