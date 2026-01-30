#!/bin/bash

# 启动Redis和MongoDB服务脚本

echo "🚀 启动数据库服务..."

# 检查Redis
if pgrep -f redis-server > /dev/null; then
    echo "✅ Redis已在运行"
else
    echo "启动Redis..."
    redis-server --daemonize yes
    sleep 1
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis启动成功"
    else
        echo "❌ Redis启动失败"
    fi
fi

# 检查MongoDB
if pgrep -f mongod > /dev/null; then
    echo "✅ MongoDB已在运行"
else
    echo "启动MongoDB..."
    # 确保日志目录存在
    mkdir -p /usr/local/var/log/mongodb
    
    # 启动MongoDB
    mongod --dbpath /usr/local/var/mongodb \
           --logpath /usr/local/var/log/mongodb/mongo.log \
           --fork
    
    sleep 2
    if pgrep -f mongod > /dev/null; then
        echo "✅ MongoDB启动成功"
    else
        echo "❌ MongoDB启动失败，请检查日志: /usr/local/var/log/mongodb/mongo.log"
    fi
fi

echo ""
echo "📊 服务状态:"
echo "Redis: $(redis-cli ping 2>/dev/null || echo '未连接')"
echo "MongoDB: $(pgrep -f mongod > /dev/null && echo '运行中' || echo '未运行')"




