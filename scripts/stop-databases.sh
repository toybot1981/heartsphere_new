#!/bin/bash

# 停止Redis和MongoDB服务脚本

echo "🛑 停止数据库服务..."

# 停止Redis
if pgrep -f redis-server > /dev/null; then
    echo "停止Redis..."
    redis-cli shutdown
    sleep 1
    if ! pgrep -f redis-server > /dev/null; then
        echo "✅ Redis已停止"
    else
        echo "⚠️  Redis停止失败，尝试强制停止..."
        pkill -9 redis-server
    fi
else
    echo "✅ Redis未运行"
fi

# 停止MongoDB
if pgrep -f mongod > /dev/null; then
    echo "停止MongoDB..."
    mongosh admin --eval "db.shutdownServer()" --quiet 2>/dev/null || \
    mongo admin --eval "db.shutdownServer()" --quiet 2>/dev/null || \
    pkill -9 mongod
    
    sleep 2
    if ! pgrep -f mongod > /dev/null; then
        echo "✅ MongoDB已停止"
    else
        echo "⚠️  MongoDB停止失败，尝试强制停止..."
        pkill -9 mongod
    fi
else
    echo "✅ MongoDB未运行"
fi

echo ""
echo "✅ 所有数据库服务已停止"

