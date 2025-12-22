#!/bin/bash

# ngrok 停止脚本

echo "=========================================="
echo "停止 ngrok 隧道..."
echo "=========================================="

# 查找并停止 ngrok 进程
NGROK_PIDS=$(pgrep -f "ngrok http")

if [ -z "$NGROK_PIDS" ]; then
    echo "✅ 没有运行中的 ngrok 进程"
    exit 0
fi

for PID in $NGROK_PIDS; do
    echo "正在停止 ngrok 进程 (PID: $PID)..."
    kill $PID
done

sleep 2

# 检查是否还有残留进程
REMAINING=$(pgrep -f "ngrok http")
if [ -n "$REMAINING" ]; then
    echo "⚠️  强制停止残留进程..."
    kill -9 $REMAINING
fi

echo "✅ ngrok 已停止"


