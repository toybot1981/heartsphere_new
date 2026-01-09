#!/bin/bash

# 检查 Notion 配置脚本

NGROK_API="http://127.0.0.1:4040"
BACKEND_API="http://localhost:8081"

echo "=========================================="
echo "检查 Notion OAuth 配置"
echo "=========================================="
echo ""

# 1. 检查 ngrok 状态
echo "1. 检查 ngrok 状态..."
if curl -s $NGROK_API/api/tunnels &> /dev/null; then
    PUBLIC_URL=$(curl -s $NGROK_API/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$PUBLIC_URL" ]; then
        CALLBACK_URL="${PUBLIC_URL}/api/notes/notion/callback"
        echo "   ✅ ngrok 正在运行"
        echo "   公共地址: $PUBLIC_URL"
        echo "   回调地址: $CALLBACK_URL"
    else
        echo "   ❌ 无法获取 ngrok 公共地址"
        exit 1
    fi
else
    echo "   ❌ ngrok 未运行"
    echo "   请运行: ./start_ngrok.sh"
    exit 1
fi

echo ""

# 2. 检查后端配置（需要管理员 token）
if [ -n "$ADMIN_TOKEN" ]; then
    echo "2. 检查后端配置..."
    CONFIG=$(curl -s -X GET "$BACKEND_API/api/admin/system/config/notion" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$CONFIG" | grep -q "error\|需要管理员认证"; then
        echo "   ⚠️  无法获取后端配置（token 可能无效）"
    else
        BACKEND_REDIRECT_URI=$(echo "$CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('redirectUri', ''))" 2>/dev/null)
        CLIENT_ID=$(echo "$CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('clientId', ''))" 2>/dev/null)
        
        if [ -n "$BACKEND_REDIRECT_URI" ]; then
            echo "   后端配置的回调地址: $BACKEND_REDIRECT_URI"
            if [ "$BACKEND_REDIRECT_URI" = "$CALLBACK_URL" ]; then
                echo "   ✅ 后端回调地址与 ngrok 地址一致"
            else
                echo "   ⚠️  后端回调地址与 ngrok 地址不一致！"
                echo "   需要更新后端配置为: $CALLBACK_URL"
            fi
        else
            echo "   ⚠️  后端回调地址未配置"
        fi
        
        if [ -n "$CLIENT_ID" ]; then
            echo "   Client ID: ${CLIENT_ID:0:20}..."
            echo "   ✅ Client ID 已配置"
        else
            echo "   ❌ Client ID 未配置"
        fi
    fi
else
    echo "2. 跳过后端配置检查（需要 ADMIN_TOKEN）"
fi

echo ""

# 3. 检查 Notion 开发者门户配置
echo "3. Notion 开发者门户配置检查："
echo "   请手动检查以下配置："
echo ""
echo "   访问: https://www.notion.so/my-integrations"
echo "   找到您的集成，检查以下设置："
echo ""
echo "   ✅ Redirect URI 必须包含:"
echo "      $CALLBACK_URL"
echo ""
echo "   ⚠️  重要提示："
echo "   - Redirect URI 必须完全匹配（包括协议 https://）"
echo "   - 如果使用 ngrok，每次重启 ngrok 地址可能会变化"
echo "   - 建议在 Notion 中配置多个可能的回调地址"

echo ""
echo "=========================================="
echo "配置检查完成"
echo "=========================================="
echo ""
echo "如果遇到 'redirect_uri 缺失或无效' 错误，请确保："
echo "1. Notion 开发者门户中的 Redirect URI 包含: $CALLBACK_URL"
echo "2. 后端配置中的回调地址为: $CALLBACK_URL"
echo "3. 两个地址必须完全一致（包括协议、域名、路径）"
echo ""
