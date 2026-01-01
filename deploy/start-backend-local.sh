#!/bin/bash
# 本地开发环境启动后端服务器脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/../backend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}启动 HeartSphere 后端服务器（本地开发）${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查端口是否被占用
if lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${YELLOW}端口 8081 已被占用，正在停止现有进程...${NC}"
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到 Maven，请先安装 Maven${NC}"
    exit 1
fi

# 进入后端目录
cd "$BACKEND_DIR"

echo -e "${BLUE}工作目录: ${BACKEND_DIR}${NC}"
echo -e "${BLUE}启动命令: mvn spring-boot:run${NC}"
echo -e "${BLUE}端口: 8081${NC}"
echo ""

# 启动服务器
echo -e "${YELLOW}正在启动服务器...${NC}"
echo -e "${YELLOW}（按 Ctrl+C 停止服务器）${NC}"
echo ""

mvn spring-boot:run
