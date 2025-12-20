#!/bin/bash

# 快速更新 Notion 回调地址
# 使用方法: ADMIN_TOKEN=your_token ./update_callback.sh

NGROK_API="http://127.0.0.1:4040"
BACKEND_API="http://localhost:8081"

# 获取 ngrok 公共 URL
PUBLIC_URL=$(curl -s $NGROK_API/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ 无法获取 ngrok 公共 URL，请确保 ngrok 正在运行"
    exit 1
fi

CALLBACK_URL="${PUBLIC_URL}/api/notes/notion/callback"

echo "回调地址: $CALLBACK_URL"
echo ""

# 如果提供了 token，尝试自动更新
if [ -n "$ADMIN_TOKEN" ]; then
    echo "正在更新后端配置..."
    
    # 获取当前配置
    CURRENT_CONFIG=$(curl -s -X GET "$BACKEND_API/api/admin/system/config/notion" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")
    
    # 提取配置（使用 Python）
    if command -v python3 &> /dev/null; then
        CLIENT_ID=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('clientId', ''))" 2>/dev/null)
        CLIENT_SECRET=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('clientSecret', ''))" 2>/dev/null)
        SYNC_ENABLED=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print('true' if data.get('syncButtonEnabled', True) else 'false')" 2>/dev/null)
        
        if [ -n "$CLIENT_ID" ] || [ -n "$CLIENT_SECRET" ]; then
            # 构建更新请求
            UPDATE_JSON=$(python3 -c "
import json
data = {
    'clientId': '$CLIENT_ID',
    'clientSecret': '$CLIENT_SECRET',
    'redirectUri': '$CALLBACK_URL',
    'syncButtonEnabled': $SYNC_ENABLED
}
print(json.dumps(data))
")
            
            # 更新配置
            RESPONSE=$(curl -s -X PUT "$BACKEND_API/api/admin/system/config/notion" \
                -H "Authorization: Bearer $ADMIN_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$UPDATE_JSON")
            
            if echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); sys.exit(0 if data.get('redirectUri') == '$CALLBACK_URL' else 1)" 2>/dev/null; then
                echo "✅ 后端配置更新成功！"
            else
                echo "⚠️  后端配置更新失败"
            fi
        else
            echo "⚠️  无法获取当前配置，请检查 token 是否正确"
        fi
    else
        echo "⚠️  需要 python3 才能自动更新"
    fi
else
    echo "提示: 设置 ADMIN_TOKEN 环境变量可自动更新后端配置"
    echo "例如: ADMIN_TOKEN=your_token ./update_callback.sh"
fi

echo ""
echo "=========================================="
echo "需要更新的配置："
echo "=========================================="
echo ""
echo "1. Notion 开发者门户："
echo "   https://www.notion.so/my-integrations"
echo "   Redirect URI: $CALLBACK_URL"
echo ""
echo "2. 管理后台（如果未自动更新）："
echo "   系统配置 → Notion 配置"
echo "   回调地址: $CALLBACK_URL"
echo ""
