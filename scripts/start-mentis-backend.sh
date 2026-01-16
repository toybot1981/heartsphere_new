#!/bin/bash
# 启动 Mentis 后端服务 (端口 8082)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 加载端口管理工具
source "$SCRIPT_DIR/utils/port-utils.sh"

PORT=8082
PROJECT_NAME="Mentis 后端"
PROJECT_DIR="mentis/backend"

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

# 设置 Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)
if [ -z "$JAVA_HOME" ]; then
    echo -e "${RED}错误: 未找到 Java 17${NC}"
    echo "请安装 Java 17 或更高版本"
    exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"

# 检查 Java 版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}错误: Java 版本 $JAVA_VERSION，需要 Java 17 或更高版本${NC}"
    echo "当前 JAVA_HOME: $JAVA_HOME"
    exit 1
fi

echo -e "${GREEN}✅ 使用 Java 17: $JAVA_HOME${NC}"

# 检查 Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到 Maven，请先安装 Maven${NC}"
    exit 1
fi

# 启动服务
echo -e "${GREEN}启动 $PROJECT_NAME...${NC}"

# 使用 nohup + 重定向 + disown 确保进程持续运行
# 这样可以确保即使终端关闭，进程也不会被终止
nohup mvn spring-boot:run > "$PROJECT_ROOT/mentis-backend.log" 2>&1 < /dev/null &

PID=$!

# 使用 disown 让进程完全脱离 shell 控制（macOS 兼容）
disown $PID 2>/dev/null || true

# 等待一下，确保进程真正启动
sleep 2

# 检查进程是否还在运行
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}$PROJECT_NAME 已启动 (Maven PID: $PID)${NC}"
    echo -e "${YELLOW}日志文件: $PROJECT_ROOT/mentis-backend.log${NC}"
    echo -e "${YELLOW}访问地址: http://localhost:$PORT${NC}"
    echo ""
    
    # 保存 PID（保存实际的 Java 进程 PID，而不是 Maven 进程）
    # Maven 会启动子进程，我们需要找到实际的 Java 进程
    sleep 3
    JAVA_PID=$(pgrep -P $PID 2>/dev/null | head -n 1)
    if [ -n "$JAVA_PID" ]; then
        echo "$JAVA_PID" > "$PROJECT_ROOT/mentis-backend.pid"
        echo -e "${GREEN}Java 进程 PID ($JAVA_PID) 已保存到: $PROJECT_ROOT/mentis-backend.pid${NC}"
        echo -e "${YELLOW}提示: 进程已脱离终端控制，即使关闭终端也会继续运行${NC}"
    else
        echo "$PID" > "$PROJECT_ROOT/mentis-backend.pid"
        echo -e "${GREEN}Maven 进程 PID ($PID) 已保存到: $PROJECT_ROOT/mentis-backend.pid${NC}"
        echo -e "${YELLOW}提示: 进程已脱离终端控制，即使关闭终端也会继续运行${NC}"
    fi
else
    echo -e "${RED}启动失败，请查看日志: $PROJECT_ROOT/mentis-backend.log${NC}"
    tail -20 "$PROJECT_ROOT/mentis-backend.log" 2>/dev/null || true
    exit 1
fi
