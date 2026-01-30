#!/bin/bash
# 停止 Psychology Mentor 服务（后端和前端）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "停止 Psychology Mentor 服务"
echo "=========================================="
echo ""

# 停止后端（端口 8083）
if lsof -Pi :8083 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "停止后端服务（端口 8083）..."
    kill $(lsof -ti:8083) 2>/dev/null || true
    sleep 1
    echo "✓ 后端服务已停止"
else
    echo "后端服务未运行"
fi

# 停止前端（端口 3003）
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "停止前端服务（端口 3003）..."
    kill $(lsof -ti:3003) 2>/dev/null || true
    sleep 1
    echo "✓ 前端服务已停止"
else
    echo "前端服务未运行"
fi

# 停止 Spring Boot 进程（备用方法）
echo "检查 Spring Boot 进程..."
pkill -f "heartsphere-psychology-mentor-service" 2>/dev/null || true

echo ""
echo "=========================================="
echo "所有服务已停止"
echo "=========================================="
