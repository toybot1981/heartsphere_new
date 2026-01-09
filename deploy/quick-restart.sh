#!/bin/bash

# HeartSphere 快速重启脚本（不重新构建）
# 使用方法: bash deploy/quick-restart.sh

set -e

PROJECT_DIR="/Users/admin/Workspace/heartsphere_new"  # 项目实际路径
BACKEND_DIR="$PROJECT_DIR/backend"
SERVICE_NAME="heartsphere-backend"
LOG_DIR="$BACKEND_DIR/logs"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "===== 快速重启后端服务 ====="

cd "$BACKEND_DIR"

# 停止服务
echo "${GREEN}停止服务...${NC}"

# 查找并停止 Java 进程
JAVA_PID=$(ps aux | grep "[h]eartsphere-backend" | awk '{print $2}')
if [ -n "$JAVA_PID" ]; then
    echo "发现运行中的后端进程 PID: $JAVA_PID"
    kill $JAVA_PID
    sleep 2

    # 检查进程是否还在运行
    if ps -p $JAVA_PID > /dev/null 2>&1; then
        echo "${YELLOW}进程未响应，强制停止...${NC}"
        kill -9 $JAVA_PID
        sleep 1
    fi
    echo "${GREEN}✓ 进程已停止${NC}"
else
    echo "${YELLOW}未发现运行中的后端服务${NC}"
fi

# 检查 jar 文件是否存在
JAR_FILE=$(ls target/heartsphere-backend-*.jar 2>/dev/null | head -1)
if [ -z "$JAR_FILE" ]; then
    echo "${RED}错误: 未找到编译好的 jar 文件${NC}"
    echo "请先运行: mvn clean package -DskipTests"
    exit 1
fi

echo "找到 JAR 文件: $JAR_FILE"

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 启动服务
echo "${GREEN}启动服务...${NC}"
nohup java -jar "$JAR_FILE" \
    --spring.profiles.active=prod \
    > "$LOG_DIR/backend-$(date +%Y%m%d_%H%M%S).log" 2>&1 &

NEW_PID=$!
echo $NEW_PID > backend.pid
echo "${GREEN}✓ 服务已启动，PID: $NEW_PID${NC}"

# 等待服务启动
echo "等待服务启动..."
sleep 8

# 检查端口
echo "${GREEN}检查服务状态...${NC}"
if lsof -i :8080 -i :8081 | grep -q "LISTEN"; then
    echo "${GREEN}✓ 服务运行正常，端口已监听${NC}"

    # 显示最新日志
    echo ""
    echo "${GREEN}最近的日志:${NC}"
    LATEST_LOG=$(ls -t $LOG_DIR/backend-*.log 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ]; then
        tail -n 15 "$LATEST_LOG"
    fi
else
    echo "${RED}✗ 服务启动失败，端口未监听${NC}"
    echo "请检查日志: tail -f $LOG_DIR/backend-*.log"
    exit 1
fi

echo ""
echo "${GREEN}===== 快速重启完成 =====${NC}"
echo "查看实时日志: tail -f $LOG_DIR/backend-$(date +%Y%m%d)*.log"
