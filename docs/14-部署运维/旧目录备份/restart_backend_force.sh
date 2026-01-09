#!/bin/bash

echo "=========================================="
echo "强制重启后端服务"
echo "=========================================="

# 1. 查找并停止所有运行在 8081 端口的进程
echo "正在停止后端服务..."
PID=$(lsof -ti:8081 2>/dev/null)
if [ -n "$PID" ]; then
    echo "找到进程 $PID，正在停止..."
    kill -9 $PID 2>/dev/null
    sleep 2
    
    # 再次检查是否还在运行
    if lsof -ti:8081 >/dev/null 2>&1; then
        echo "警告: 进程仍在运行，强制终止..."
        killall -9 java 2>/dev/null
        sleep 1
    fi
    echo "后端服务已停止"
else
    echo "未找到运行在8081端口的进程"
fi

# 2. 清理并重新编译
echo ""
echo "正在清理并重新编译..."
cd backend
mvn clean compile -q
if [ $? -ne 0 ]; then
    echo "编译失败！请检查错误信息"
    exit 1
fi
echo "编译成功"

# 3. 启动后端服务
echo ""
echo "正在启动后端服务..."
echo "提示: 服务将在后台运行，日志会输出到控制台"
echo "按 Ctrl+C 可以停止服务"
echo ""
mvn spring-boot:run








