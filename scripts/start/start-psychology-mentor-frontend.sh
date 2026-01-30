#!/bin/bash
# 启动 Psychology Mentor 前端服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/psychology-mentor/frontend"

echo "=========================================="
echo "启动 Psychology Mentor 前端服务"
echo "=========================================="
echo "前端目录: $FRONTEND_DIR"
echo "端口: 3003"
echo ""

cd "$FRONTEND_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "警告: 端口 3003 已被占用"
    echo "正在停止占用端口的进程..."
    kill $(lsof -ti:3003) 2>/dev/null || true
    sleep 2
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 启动开发服务器
echo "启动前端开发服务器..."
echo "访问地址: http://localhost:3003"
echo ""
npm run dev
