#!/bin/bash

# 自动更新 Notion 回调地址配置脚本
# 从 ngrok 获取公共 URL 并更新到管理后台配置

NGROK_API="http://127.0.0.1:4040"
BACKEND_API="http://localhost:8081"

echo "=========================================="
echo "更新 Notion 回调地址配置"
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
if ! curl -s "$BACKEND_API/api/health" &> /dev/null; then
    echo "⚠️  后端服务可能未运行，但继续尝试更新配置..."
fi

# 提示用户手动更新
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

# 尝试通过 API 更新（需要管理员 token）
read -p "是否尝试通过 API 自动更新配置？(需要管理员 token) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "请输入管理员 JWT token: " ADMIN_TOKEN
    
    if [ -z "$ADMIN_TOKEN" ]; then
        echo "❌ Token 为空，跳过 API 更新"
        exit 0
    fi
    
    echo "正在更新配置..."
    
    # 获取当前配置
    CURRENT_CONFIG=$(curl -s -X GET "$BACKEND_API/admin/system/config/notion" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json")
    
    if [ $? -ne 0 ]; then
        echo "❌ 获取当前配置失败"
        exit 1
    fi
    
    # 提取当前配置值（需要 jq，如果没有则跳过）
    if command -v jq &> /dev/null; then
        CLIENT_ID=$(echo $CURRENT_CONFIG | jq -r '.clientId // empty')
        CLIENT_SECRET=$(echo $CURRENT_CONFIG | jq -r '.clientSecret // empty')
        SYNC_ENABLED=$(echo $CURRENT_CONFIG | jq -r '.syncButtonEnabled // true')
        
        # 更新配置
        UPDATE_RESPONSE=$(curl -s -X PUT "$BACKEND_API/admin/system/config/notion" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"clientId\": \"$CLIENT_ID\",
                \"clientSecret\": \"$CLIENT_SECRET\",
                \"redirectUri\": \"$CALLBACK_URL\",
                \"syncButtonEnabled\": $SYNC_ENABLED
            }")
        
        if echo "$UPDATE_RESPONSE" | jq -e '.success // false' &> /dev/null; then
            echo "✅ 配置更新成功！"
        else
            echo "⚠️  配置更新可能失败，请检查响应:"
            echo "$UPDATE_RESPONSE"
        fi
    else
        echo "⚠️  需要安装 jq 工具才能自动更新配置"
        echo "   安装方法: brew install jq"
        echo "   或手动在管理后台更新"
    fi
fi

echo ""
echo "✅ 回调地址信息已准备就绪"
echo "   回调地址: $CALLBACK_URL"


