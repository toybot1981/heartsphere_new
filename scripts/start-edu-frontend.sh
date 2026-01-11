#!/bin/bash
# 启动教育版前端服务 (端口 3001)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 加载端口管理工具
source "$SCRIPT_DIR/utils/port-utils.sh"

PORT=3001
PROJECT_NAME="教育版前端"
PROJECT_DIR="edu/frontend"

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
nohup npm run dev > "$PROJECT_ROOT/edu-frontend.log" 2>&1 &

PID=$!
echo -e "${GREEN}$PROJECT_NAME 已启动 (PID: $PID)${NC}"
echo -e "${YELLOW}日志文件: $PROJECT_ROOT/edu-frontend.log${NC}"
echo -e "${YELLOW}访问地址: http://localhost:$PORT${NC}"
echo ""

# 保存 PID
echo "$PID" > "$PROJECT_ROOT/edu-frontend.pid"
echo -e "${GREEN}PID 已保存到: $PROJECT_ROOT/edu-frontend.pid${NC}"
