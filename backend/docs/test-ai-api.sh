#!/bin/bash

# AI服务API测试脚本
# 使用方法: ./test-ai-api.sh

BASE_URL="http://localhost:8081"
USERNAME="${1:-test@example.com}"
PASSWORD="${2:-password123}"

echo "=== AI服务API测试脚本 ==="
echo "基础URL: $BASE_URL"
echo "用户名: $USERNAME"
echo ""

# 步骤1: 登录获取Token
echo "步骤1: 登录获取Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ 登录失败！"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 登录成功"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 步骤2: 测试文本生成
echo "步骤2: 测试文本生成..."
TEXT_GEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai/text/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "你好，请用一句话介绍一下你自己",
    "temperature": 0.7,
    "maxTokens": 200
  }')

echo "响应:"
echo $TEXT_GEN_RESPONSE | jq .
echo ""

# 步骤3: 测试OpenAPI兼容接口
echo "步骤3: 测试OpenAPI兼容接口..."
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "model": "qwen-max",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }')

echo "响应:"
echo $CHAT_RESPONSE | jq .
echo ""

echo "=== 测试完成 ==="



