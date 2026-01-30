#!/bin/bash
# 启动 Psychology Mentor 后端服务 (端口 8083)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# 加载端口管理工具
if [ -f "$SCRIPT_DIR/../utils/port-utils.sh" ]; then
    source "$SCRIPT_DIR/../utils/port-utils.sh"
fi

PORT=8083
PROJECT_NAME="Psychology Mentor 后端"
PROJECT_DIR="psychology-mentor/backend"

echo "========================================="
echo "启动 $PROJECT_NAME (端口: $PORT)"
echo "========================================="
echo ""

# 检查并终止占用端口的进程
if [ -f "$SCRIPT_DIR/../utils/port-utils.sh" ]; then
    ensure_port_available $PORT
else
    # 简单检查端口
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "端口 $PORT 已被占用，正在终止进程..."
        kill $(lsof -ti:$PORT) 2>/dev/null || true
        sleep 2
    fi
fi

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo "错误: 项目目录 $PROJECT_DIR 不存在"
    exit 1
fi

cd "$PROJECT_DIR"

# 设置 Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)
if [ -z "$JAVA_HOME" ]; then
    echo "错误: 未找到 Java 17"
    echo "请安装 Java 17 或更高版本"
    exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"

# 检查 Java 版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "错误: Java 版本 $JAVA_VERSION，需要 Java 17 或更高版本"
    exit 1
fi

echo "✅ 使用 Java 17: $JAVA_HOME"

# 检查 Maven
if ! command -v mvn &> /dev/null; then
    echo "错误: 未找到 Maven，请先安装 Maven"
    exit 1
fi

# 启动服务
echo "启动 $PROJECT_NAME..."

# 使用 nohup + 重定向确保进程持续运行
nohup mvn spring-boot:run > "$PROJECT_ROOT/psychology-mentor-backend.log" 2>&1 < /dev/null &

PID=$!
echo "后端进程 PID: $PID"
echo "日志文件: $PROJECT_ROOT/psychology-mentor-backend.log"

# 等待服务启动
echo "等待服务启动..."
for i in {1..60}; do
    if curl -s -f http://localhost:$PORT/api/psychology/health > /dev/null 2>&1; then
        echo "✅ $PROJECT_NAME 已启动 (端口: $PORT)"
        echo "健康检查: http://localhost:$PORT/api/psychology/health"
        exit 0
    fi
    sleep 1
done

echo "❌ 服务启动超时"
exit 1
