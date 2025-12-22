#!/bin/bash

# ngrok 启动脚本
# 自动启动 ngrok 并更新 Notion 回调地址配置

BACKEND_PORT=8081
NGROK_LOG="/tmp/ngrok.log"
NGROK_API="http://127.0.0.1:4040"

echo "=========================================="
echo "启动 ngrok 隧道..."
echo "=========================================="

# 检查 ngrok 是否已安装
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok 未安装，请先运行: ./install_ngrok.sh"
    exit 1
fi

# 检查 ngrok authtoken 是否已配置
# ngrok 3.x 需要先配置 authtoken
# 尝试运行一个简单的命令来检查配置
if ! ngrok config check &> /dev/null 2>&1; then
    echo "⚠️  ngrok authtoken 未配置"
    echo ""
    echo "ngrok 3.x 需要先配置 authtoken 才能使用"
    echo ""
    echo "请先运行以下命令配置 authtoken："
    echo "   ./configure_ngrok_authtoken.sh <您的authtoken>"
    echo ""
    echo "获取 authtoken："
    echo "   访问: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo ""
    exit 1
fi

# 检查后端服务是否运行
if ! lsof -ti:$BACKEND_PORT &> /dev/null; then
    echo "⚠️  后端服务未运行在端口 $BACKEND_PORT"
    echo "正在启动后端服务..."
    cd backend
    mvn spring-boot:run > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "后端服务已启动 (PID: $BACKEND_PID)"
    sleep 5
    cd ..
fi

# 检查是否已有 ngrok 进程
NGROK_PID=$(pgrep -f "ngrok http $BACKEND_PORT")
if [ -n "$NGROK_PID" ]; then
    echo "⚠️  ngrok 已在运行 (PID: $NGROK_PID)"
    echo "正在停止旧进程..."
    kill $NGROK_PID
    sleep 2
fi

# 启动 ngrok
# 注意：ngrok 免费版不支持通过代理运行，需要清除代理环境变量
echo "正在启动 ngrok 隧道到端口 $BACKEND_PORT..."
# 清除代理环境变量（ngrok 免费版不支持代理）
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset ALL_PROXY
unset all_proxy
ngrok http $BACKEND_PORT --log=stdout > $NGROK_LOG 2>&1 &
NGROK_PID=$!

echo "ngrok 已启动 (PID: $NGROK_PID)"
echo "等待 ngrok 初始化..."

# 等待 ngrok API 可用
for i in {1..10}; do
    sleep 2
    if curl -s $NGROK_API/api/tunnels &> /dev/null; then
        break
    fi
    echo "等待中... ($i/10)"
done

# 获取公共 URL
PUBLIC_URL=$(curl -s $NGROK_API/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ 无法获取 ngrok 公共 URL"
    echo "请检查 ngrok 日志: tail -f $NGROK_LOG"
    echo "或访问 ngrok 控制台: http://127.0.0.1:4040"
    exit 1
fi

CALLBACK_URL="${PUBLIC_URL}/api/notes/notion/callback"

echo ""
echo "=========================================="
echo "✅ ngrok 启动成功！"
echo "=========================================="
echo ""
echo "📋 隧道信息："
echo "   本地地址: http://localhost:$BACKEND_PORT"
echo "   公共地址: $PUBLIC_URL"
echo "   回调地址: $CALLBACK_URL"
echo ""
echo "📊 ngrok 控制台: http://127.0.0.1:4040"
echo "📝 日志文件: $NGROK_LOG"
echo ""

# 更新配置提示
echo "=========================================="
echo "下一步操作："
echo "=========================================="
echo ""
echo "1. 在 Notion 开发者门户更新 Redirect URI："
echo "   $CALLBACK_URL"
echo ""
echo "2. 在管理后台更新 Notion 配置："
echo "   - 回调地址: $CALLBACK_URL"
echo ""
echo "3. 查看实时日志："
echo "   tail -f $NGROK_LOG"
echo ""
echo "4. 停止 ngrok："
echo "   kill $NGROK_PID"
echo "   或运行: ./stop_ngrok.sh"
echo ""

# 保存信息到文件
cat > /tmp/ngrok_info.txt << EOF
NGROK_PID=$NGROK_PID
PUBLIC_URL=$PUBLIC_URL
CALLBACK_URL=$CALLBACK_URL
BACKEND_PORT=$BACKEND_PORT
EOF

echo "信息已保存到: /tmp/ngrok_info.txt"


