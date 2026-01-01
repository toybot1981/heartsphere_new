#!/bin/bash

echo "========================================="
echo "后端服务重启脚本"
echo "========================================="
echo ""

# 查找后端服务进程
echo "1. 查找后端服务进程..."
PIDS=$(ps aux | grep "HeartSphereApplication" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ 没有找到运行中的后端服务"
else
    echo "找到以下进程："
    ps aux | grep "HeartSphereApplication" | grep -v grep
    echo ""
    echo "2. 停止后端服务..."
    for PID in $PIDS; do
        echo "   停止进程 $PID..."
        kill $PID 2>/dev/null
        sleep 2
        # 如果还在运行，强制停止
        if ps -p $PID > /dev/null 2>&1; then
            echo "   强制停止进程 $PID..."
            kill -9 $PID 2>/dev/null
        fi
    done
    echo "✅ 后端服务已停止"
fi

echo ""
echo "3. 等待3秒确保进程完全停止..."
sleep 3

echo ""
echo "4. 重新编译项目..."
cd backend
mvn clean compile -q

if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请检查错误信息"
    exit 1
fi

echo "✅ 编译成功"

echo ""
echo "5. 启动后端服务..."
echo "   服务将在后台启动，日志将输出到 backend.log"
nohup mvn spring-boot:run > ../backend.log 2>&1 &

echo "   等待服务启动..."
sleep 10

echo ""
echo "6. 检查服务是否启动成功..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8081/api/scenario-events/system/all" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 后端服务启动成功，端点可以访问！"
else
    echo "⏳ 服务可能还在启动中，HTTP状态码: $HTTP_CODE"
    echo "   请查看日志文件 backend.log 了解启动情况"
    echo "   或者等待几秒后再次运行此脚本"
fi

echo ""
echo "========================================="
echo "重启完成"
echo "========================================="
echo ""
echo "查看日志: tail -f backend.log"
echo "停止服务: pkill -f HeartSphereApplication"




