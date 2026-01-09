#!/bin/bash
# 重启后端服务以修复 UserMainStory 实体映射问题

echo "=========================================="
echo "正在重启后端服务以修复实体映射问题..."
echo "=========================================="

# 1. 停止所有运行在 8081 端口的进程
echo "步骤 1: 停止旧的后端服务..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

# 2. 清理编译缓存
echo "步骤 2: 清理编译缓存..."
cd backend
mvn clean -q

# 3. 重新编译
echo "步骤 3: 重新编译项目..."
mvn compile -q

# 4. 启动服务
echo "步骤 4: 启动后端服务..."
echo "服务将在后台运行，日志输出到 /tmp/backend-restart.log"
mvn spring-boot:run > /tmp/backend-restart.log 2>&1 &

echo ""
echo "=========================================="
echo "后端服务正在启动中..."
echo "请等待 10-15 秒后检查服务状态"
echo "查看日志: tail -f /tmp/backend-restart.log"
echo "=========================================="

