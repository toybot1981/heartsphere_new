#!/bin/bash

# HSMem 服务停止脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目根目录（scripts 的父目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HSMEM_DIR="$PROJECT_ROOT/hsmem"
PID_FILE="$HSMEM_DIR/hsmem.pid"

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  HSMem REST API 服务器停止脚本${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# 检查 PID 文件
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  PID 文件不存在，尝试查找进程...${NC}"
    
    # 尝试通过进程名查找
    PIDS=$(ps aux | grep -E "python3.*rest_api_server|uvicorn.*8000" | grep -v grep | awk '{print $2}')
    
    if [ -z "$PIDS" ]; then
        echo -e "${YELLOW}   未找到运行中的 HSMem 服务${NC}"
        exit 0
    else
        echo -e "${BLUE}   找到进程: $PIDS${NC}"
        for PID in $PIDS; do
            kill $PID 2>/dev/null && echo -e "${GREEN}✅ 已停止进程 $PID${NC}" || echo -e "${RED}❌ 停止进程 $PID 失败${NC}"
        done
        exit 0
    fi
fi

# 读取 PID
PID=$(cat "$PID_FILE")

# 检查进程是否存在
if ! ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  进程 $PID 不存在，清理 PID 文件${NC}"
    rm -f "$PID_FILE"
    exit 0
fi

# 停止进程
echo -e "${BLUE}🛑 正在停止 HSMem 服务 (PID: $PID)...${NC}"
kill "$PID" 2>/dev/null

# 等待进程结束
for i in {1..10}; do
    if ! ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HSMem 服务已停止${NC}"
        rm -f "$PID_FILE"
        exit 0
    fi
    sleep 1
done

# 如果进程仍在运行，强制杀死
if ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  进程未正常退出，强制停止...${NC}"
    kill -9 "$PID" 2>/dev/null
    sleep 1
    
    if ! ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HSMem 服务已强制停止${NC}"
        rm -f "$PID_FILE"
    else
        echo -e "${RED}❌ 无法停止服务${NC}"
        exit 1
    fi
fi
