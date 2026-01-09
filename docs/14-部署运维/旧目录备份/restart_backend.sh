#!/bin/bash

# 后端服务重启脚本

echo "=== 停止后端服务 ==="
# 方法1: 通过端口查找并杀死进程
lsof -ti:8081 | xargs kill -9 2>/dev/null

# 方法2: 通过进程名查找并杀死进程
pkill -9 -f "spring-boot:run" 2>/dev/null
pkill -9 -f "mvn.*spring-boot" 2>/dev/null

echo "等待3秒确保进程完全停止..."
sleep 3

echo ""
echo "=== 启动后端服务 ==="
cd "$(dirname "$0")/backend"

echo "当前目录: $(pwd)"
echo "开始启动 Spring Boot 应用..."

# 启动服务（前台运行，可以看到日志）
mvn spring-boot:run

# 如果需要后台运行，取消下面的注释，并注释掉上面的 mvn spring-boot:run
# nohup mvn spring-boot:run > ../backend.log 2>&1 &
# echo "后端服务已在后台启动，日志文件: ../backend.log"
# echo "查看日志: tail -f ../backend.log"
