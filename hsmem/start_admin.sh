#!/bin/bash

# HSMem 管理后台启动脚本

echo "=================================================="
echo "  HSMem 管理后台启动脚本"
echo "=================================================="
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
python3 -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  缺少依赖，正在安装..."
    pip3 install fastapi uvicorn -q
fi

echo "✅ 依赖检查完成"
echo ""

# 启动 API 服务器
echo "🚀 启动 API 服务器..."
echo "   服务地址: http://localhost:8000"
echo "   API 文档: http://localhost:8000/docs"
echo ""

# 启动服务器
python3 simple_api_server.py &

# 等待服务器启动
sleep 3

# 检查服务器状态
curl -s http://localhost:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API 服务器启动成功！"
    echo ""

    # 获取当前目录
    CURRENT_DIR=$(pwd)
    DASHBOARD_PATH="$CURRENT_DIR/admin_dashboard.html"

    echo "=================================================="
    echo "  📊 管理后台访问方式"
    echo "=================================================="
    echo ""
    echo "方式 1: 直接在浏览器中打开"
    echo "  file://$DASHBOARD_PATH"
    echo ""
    echo "方式 2: 双击文件打开"
    echo "  $DASHBOARD_PATH"
    echo ""
    echo "方式 3: 使用 open 命令 (macOS)"
    echo "  open $DASHBOARD_PATH"
    echo ""
    echo "=================================================="
    echo "  🌐 API 服务"
    echo "=================================================="
    echo ""
    echo "  健康检查: http://localhost:8000/health"
    echo "  API 文档: http://localhost:8000/docs"
    echo "  统计信息: http://localhost:8000/api/v1/stats"
    echo ""
    echo "=================================================="
    echo ""
    echo "💡 提示:"
    echo "  • 按 Ctrl+C 停止服务器"
    echo "  • 查看日志: tail -f server.log"
    echo "  • 更多帮助: cat ADMIN_GUIDE.md"
    echo ""

    # 尝试自动打开浏览器（macOS）
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🌐 正在打开浏览器..."
        open "$DASHBOARD_PATH"
    fi

else
    echo "❌ API 服务器启动失败"
    echo "   请检查端口 8000 是否被占用"
    exit 1
fi

# 保持脚本运行
wait
