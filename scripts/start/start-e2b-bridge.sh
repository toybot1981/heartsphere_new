#!/bin/bash

# E2B Bridge Service 启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRIDGE_DIR="$PROJECT_ROOT/mentis/e2b-bridge"

# 加载端口管理工具
source "$SCRIPT_DIR/../utils/port-utils.sh"

PORT=3003
PROJECT_NAME="E2B Bridge Service"

echo "========================================="
echo "启动 $PROJECT_NAME (端口: $PORT)"
echo "========================================="
echo ""

# 检查并终止占用端口的进程
ensure_port_available $PORT

cd "$BRIDGE_DIR"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，正在创建..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 文件，请设置 E2B_API_KEY"
    else
        echo "E2B_API_KEY=e2b_***" > .env
        echo "E2B_BRIDGE_PORT=3003" >> .env
        echo "✅ 已创建 .env 文件，请设置 E2B_API_KEY"
    fi
fi

# 检查 node_modules
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动 E2B Bridge Service..."
npm start
