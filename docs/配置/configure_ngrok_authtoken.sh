#!/bin/bash

# ngrok authtoken 配置脚本

echo "=========================================="
echo "配置 ngrok authtoken"
echo "=========================================="
echo ""
echo "ngrok 3.x 需要先配置 authtoken 才能使用"
echo ""
echo "获取 authtoken 的步骤："
echo "1. 访问: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "2. 登录或注册 ngrok 账号"
echo "3. 复制您的 authtoken"
echo ""

if [ -z "$1" ]; then
    echo "使用方法："
    echo "  ./configure_ngrok_authtoken.sh <您的authtoken>"
    echo ""
    echo "或者直接运行，然后按提示输入："
    read -p "请输入您的 ngrok authtoken: " authtoken
else
    authtoken="$1"
fi

if [ -z "$authtoken" ]; then
    echo "❌ authtoken 不能为空"
    exit 1
fi

echo ""
echo "正在配置 authtoken..."
ngrok config add-authtoken "$authtoken"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ngrok authtoken 配置成功！"
    echo ""
    echo "现在可以运行 ./start_ngrok.sh 启动 ngrok 隧道"
else
    echo ""
    echo "❌ ngrok authtoken 配置失败"
    exit 1
fi
