#!/bin/bash
# 启动 Mentis 前端服务 (端口 3002)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 加载端口管理工具
source "$SCRIPT_DIR/utils/port-utils.sh"

PORT=3002
PROJECT_NAME="Mentis 前端"
PROJECT_DIR="mentis/frontend"

echo "========================================="
echo "启动 $PROJECT_NAME (端口: $PORT)"
echo "========================================="
echo ""

# 检查并终止占用端口的进程
ensure_port_available $PORT

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录 $PROJECT_DIR 不存在${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到 npm，请先安装 npm${NC}"
    exit 1
fi

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}未找到 node_modules，正在安装依赖...${NC}"
    npm install
fi

# 启动服务
echo -e "${GREEN}启动 $PROJECT_NAME...${NC}"

# 使用 nohup + 重定向 + disown 确保进程持续运行
# 这样可以确保即使终端关闭，进程也不会被终止
nohup npm run dev > "$PROJECT_ROOT/mentis-frontend.log" 2>&1 < /dev/null &

PID=$!

# 使用 disown 让进程完全脱离 shell 控制（macOS 兼容）
disown $PID 2>/dev/null || true

# 等待一下，确保进程真正启动
sleep 2

# 检查进程是否还在运行
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}$PROJECT_NAME 已启动 (npm PID: $PID)${NC}"
    echo -e "${YELLOW}日志文件: $PROJECT_ROOT/mentis-frontend.log${NC}"
    echo -e "${YELLOW}访问地址: http://localhost:$PORT${NC}"
    echo ""
    
    # 保存 PID（保存实际的 Node/Vite 进程 PID，而不是 npm 进程）
    # npm 会启动子进程，我们需要找到实际的 Node/Vite 进程
    sleep 3
    NODE_PID=$(pgrep -P $PID 2>/dev/null | head -n 1)
    if [ -n "$NODE_PID" ]; then
        echo "$NODE_PID" > "$PROJECT_ROOT/mentis-frontend.pid"
        echo -e "${GREEN}Node/Vite 进程 PID ($NODE_PID) 已保存到: $PROJECT_ROOT/mentis-frontend.pid${NC}"
        echo -e "${YELLOW}提示: 进程已脱离终端控制，即使关闭终端也会继续运行${NC}"
    else
        echo "$PID" > "$PROJECT_ROOT/mentis-frontend.pid"
        echo -e "${GREEN}npm 进程 PID ($PID) 已保存到: $PROJECT_ROOT/mentis-frontend.pid${NC}"
        echo -e "${YELLOW}提示: 进程已脱离终端控制，即使关闭终端也会继续运行${NC}"
    fi
else
    echo -e "${RED}启动失败，请查看日志: $PROJECT_ROOT/mentis-frontend.log${NC}"
    tail -20 "$PROJECT_ROOT/mentis-frontend.log" 2>/dev/null || true
    exit 1
fi
