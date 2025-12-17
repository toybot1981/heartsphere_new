#!/bin/bash

echo "正在停止后端服务..."
PID=$(lsof -ti:8081 2>/dev/null)
if [ -n "$PID" ]; then
    kill $PID
    echo "已停止进程 $PID"
    sleep 2
else
    echo "未找到运行在8081端口的进程"
fi

echo "正在重新编译..."
cd backend
mvn clean compile -q

echo "正在启动后端服务..."
mvn spring-boot:run



