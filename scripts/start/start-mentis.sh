#!/bin/bash

# Mentis 前后端启动脚本
# 
# 使用方法:
#   ./scripts/start-mentis.sh [backend|frontend|both]
# 
# 环境变量:
#   E2B_API_KEY - E2B API Key（必需）
#   DB_HOST - 数据库主机（可选，默认 localhost）
#   DB_PORT - 数据库端口（可选，默认 3306）
#   DB_NAME - 数据库名称（可选，默认 heartsphere）
#   DB_USER - 数据库用户（可选，默认 root）
#   DB_PASSWORD - 数据库密码（可选，默认 123456）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

# 解析参数
MODE=${1:-both}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Mentis 服务启动${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查 E2B API Key
if [ -z "$E2B_API_KEY" ]; then
    echo -e "${RED}错误: E2B_API_KEY 环境变量未设置${NC}"
    echo "请设置 E2B API Key:"
    echo "  export E2B_API_KEY=\"your-e2b-api-key-here\""
    exit 1
fi

echo -e "${GREEN}✅ E2B API Key 已设置: ${E2B_API_KEY:0:10}...${NC}"
echo ""

# 启动后端
start_backend() {
    echo -e "${YELLOW}=== 启动后端服务 ===${NC}"
    cd mentis/backend
    
    # 检查 Java 版本
    if ! command -v java &> /dev/null; then
        echo -e "${RED}错误: 未找到 Java${NC}"
        echo "请安装 Java 17 或更高版本"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo -e "${YELLOW}警告: Java 版本 $JAVA_VERSION，建议使用 Java 17+${NC}"
    fi
    
    # 检查 Maven
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}错误: 未找到 Maven${NC}"
        echo "请安装 Maven 3.6 或更高版本"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Java 和 Maven 已安装${NC}"
    echo ""
    
    # 启动后端
    echo -e "${BLUE}启动后端服务 (端口 8082)...${NC}"
    echo -e "${YELLOW}提示: 使用 Ctrl+C 停止服务${NC}"
    echo ""
    
    mvn spring-boot:run
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}=== 启动前端服务 ===${NC}"
    cd mentis/frontend
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 Node.js${NC}"
        echo "请安装 Node.js 18 或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}警告: Node.js 版本 $NODE_VERSION，建议使用 Node.js 18+${NC}"
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: 未找到 npm${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js 和 npm 已安装${NC}"
    echo ""
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    echo -e "${BLUE}启动前端服务 (端口 3002)...${NC}"
    echo -e "${YELLOW}提示: 使用 Ctrl+C 停止服务${NC}"
    echo ""
    
    npm run dev
}

# 启动两者
start_both() {
    echo -e "${YELLOW}=== 启动后端和前端服务 ===${NC}"
    echo ""
    
    # 在后台启动后端
    echo -e "${BLUE}启动后端服务...${NC}"
    cd mentis/backend
    mvn spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "后端 PID: $BACKEND_PID"
    
    # 等待后端启动
    echo -e "${YELLOW}等待后端服务启动...${NC}"
    for i in {1..60}; do
        if curl -s -f http://localhost:8082/actuator/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 后端服务已启动${NC}"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ 后端服务启动超时${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # 启动前端
    echo ""
    echo -e "${BLUE}启动前端服务...${NC}"
    cd ../frontend
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    npm run dev
    
    # 清理函数
    cleanup() {
        echo ""
        echo -e "${YELLOW}停止服务...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 0
    }
    
    trap cleanup INT TERM
}

# 根据模式启动
case "$MODE" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    both)
        start_both
        ;;
    *)
        echo -e "${RED}错误: 未知模式 '$MODE'${NC}"
        echo "使用方法: ./scripts/start-mentis.sh [backend|frontend|both]"
        exit 1
        ;;
esac
