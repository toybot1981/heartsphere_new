#!/bin/bash
# 启动管理后台后端服务 (端口 8085)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 加载端口管理工具
source "$SCRIPT_DIR/utils/port-utils.sh"

PORT=8085
PROJECT_NAME="管理后台后端"
PROJECT_DIR="admin/backend"

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

# 检查 Java 和 Maven
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到 Java，请先安装 Java 17+${NC}"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到 Maven，请先安装 Maven${NC}"
    exit 1
fi

# 设置 Java 17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 启动服务
echo -e "${GREEN}启动 $PROJECT_NAME...${NC}"
echo -e "${YELLOW}使用 Java: $(java -version 2>&1 | head -1)${NC}"
nohup mvn spring-boot:run > "$PROJECT_ROOT/admin-backend.log" 2>&1 &

PID=$!
echo -e "${GREEN}$PROJECT_NAME 已启动 (PID: $PID)${NC}"
echo -e "${YELLOW}日志文件: $PROJECT_ROOT/admin-backend.log${NC}"
echo -e "${YELLOW}访问地址: http://localhost:$PORT${NC}"
echo ""

# 保存 PID
echo "$PID" > "$PROJECT_ROOT/admin-backend.pid"
echo -e "${GREEN}PID 已保存到: $PROJECT_ROOT/admin-backend.pid${NC}"
