#!/bin/bash

# 自动更新 Notion 回调地址配置脚本
# 从 ngrok 获取公共 URL 并更新到管理后台配置

NGROK_API="http://127.0.0.1:4040"
BACKEND_API="http://localhost:8081"

echo "=========================================="
echo "自动更新 Notion 回调地址配置"
echo "=========================================="

# 检查 ngrok 是否运行
if ! curl -s $NGROK_API/api/tunnels &> /dev/null; then
    echo "❌ ngrok 未运行，请先运行: ./start_ngrok.sh"
    exit 1
fi

# 获取公共 URL
PUBLIC_URL=$(curl -s $NGROK_API/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ 无法获取 ngrok 公共 URL"
    exit 1
fi

CALLBACK_URL="${PUBLIC_URL}/api/notes/notion/callback"

echo "检测到回调地址: $CALLBACK_URL"
echo ""

# 检查后端 API 是否可用
if ! curl -s "$BACKEND_API" &> /dev/null; then
    echo "⚠️  后端服务可能未运行"
    echo "请确保后端服务正在运行在端口 8081"
    exit 1
fi

# 检查是否有管理员 token
if [ -z "$ADMIN_TOKEN" ]; then
    echo "需要管理员 token 来更新配置"
    echo ""
    read -p "请输入管理员 JWT token (或按 Enter 跳过自动更新): " ADMIN_TOKEN
fi

if [ -z "$ADMIN_TOKEN" ]; then
    echo ""
    echo "=========================================="
    echo "请手动更新以下配置："
    echo "=========================================="
    echo ""
    echo "1. Notion 开发者门户："
    echo "   访问: https://www.notion.so/my-integrations"
    echo "   找到您的集成 → OAuth domain & URIs"
    echo "   设置 Redirect URI 为:"
    echo "   $CALLBACK_URL"
    echo ""
    echo "2. 管理后台配置："
    echo "   访问管理后台 → 系统配置 → Notion 配置"
    echo "   设置回调地址为:"
    echo "   $CALLBACK_URL"
    echo ""
    exit 0
fi

echo "正在获取当前配置..."
CURRENT_CONFIG=$(curl -s -X GET "$BACKEND_API/api/admin/system/config/notion" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json")

if echo "$CURRENT_CONFIG" | grep -q "error\|需要管理员认证"; then
    echo "❌ 获取当前配置失败，请检查 token 是否正确"
    echo "响应: $CURRENT_CONFIG"
    exit 1
fi

# 提取当前配置值（使用 Python 或 jq）
if command -v python3 &> /dev/null; then
    CLIENT_ID=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('clientId', ''))" 2>/dev/null)
    CLIENT_SECRET=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('clientSecret', ''))" 2>/dev/null)
    SYNC_ENABLED=$(echo "$CURRENT_CONFIG" | python3 -c "import sys, json; data=json.load(sys.stdin); print('true' if data.get('syncButtonEnabled', True) else 'false')" 2>/dev/null)
elif command -v jq &> /dev/null; then
    CLIENT_ID=$(echo "$CURRENT_CONFIG" | jq -r '.clientId // empty')
    CLIENT_SECRET=$(echo "$CURRENT_CONFIG" | jq -r '.clientSecret // empty')
    SYNC_ENABLED=$(echo "$CURRENT_CONFIG" | jq -r '.syncButtonEnabled // true')
else
    echo "⚠️  需要安装 python3 或 jq 工具才能自动更新配置"
    echo "   或手动在管理后台更新回调地址为: $CALLBACK_URL"
    exit 1
fi

if [ -z "$CLIENT_ID" ]; then
    CLIENT_ID=""
fi
if [ -z "$CLIENT_SECRET" ]; then
    CLIENT_SECRET=""
fi
if [ -z "$SYNC_ENABLED" ]; then
    SYNC_ENABLED="true"
fi

echo "当前配置:"
echo "  Client ID: ${CLIENT_ID:0:20}..."
echo "  Client Secret: ${CLIENT_SECRET:0:10}..."
echo "  Sync Enabled: $SYNC_ENABLED"
echo ""
echo "正在更新回调地址为: $CALLBACK_URL"

# 构建更新请求
UPDATE_JSON=$(python3 -c "
import json
import sys
data = {
    'clientId': '$CLIENT_ID',
    'clientSecret': '$CLIENT_SECRET',
    'redirectUri': '$CALLBACK_URL',
    'syncButtonEnabled': $SYNC_ENABLED
}
print(json.dumps(data))
" 2>/dev/null)

if [ -z "$UPDATE_JSON" ]; then
    UPDATE_JSON="{\"clientId\":\"$CLIENT_ID\",\"clientSecret\":\"$CLIENT_SECRET\",\"redirectUri\":\"$CALLBACK_URL\",\"syncButtonEnabled\":$SYNC_ENABLED}"
fi

# 更新配置
UPDATE_RESPONSE=$(curl -s -X PUT "$BACKEND_API/api/admin/system/config/notion" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_JSON")

if echo "$UPDATE_RESPONSE" | grep -q "redirectUri.*$CALLBACK_URL" || echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); sys.exit(0 if data.get('redirectUri') == '$CALLBACK_URL' else 1)" 2>/dev/null; then
    echo ""
    echo "✅ 后端配置更新成功！"
    echo ""
    echo "=========================================="
    echo "下一步：更新 Notion 开发者门户"
    echo "=========================================="
    echo ""
    echo "1. 访问: https://www.notion.so/my-integrations"
    echo "2. 找到您的集成 → OAuth domain & URIs"
    echo "3. 设置 Redirect URI 为:"
    echo "   $CALLBACK_URL"
    echo ""
else
    echo ""
    echo "⚠️  配置更新可能失败，请检查响应:"
    echo "$UPDATE_RESPONSE" | head -20
    echo ""
    echo "请手动在管理后台更新回调地址为: $CALLBACK_URL"
fi

echo ""
echo "✅ 回调地址信息："
echo "   $CALLBACK_URL"
