#!/bin/bash

# 使用账号登录并测试技能

USERNAME="tongyexin"
PASSWORD="123456"
API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"

echo "========================================="
echo "登录并测试技能"
echo "========================================="
echo ""

# 1. 登录获取Token
echo "🔐 正在登录..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

# 检查登录是否成功
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ 登录成功"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. 获取角色列表
echo "🔍 查询角色列表..."
CHARACTERS_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/characters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "角色列表响应:"
echo "$CHARACTERS_RESPONSE" | python3 -m json.tool | head -50
echo ""

# 3. 查找6个日常生活助手角色
echo "🔍 查找日常生活助手角色..."
CHARACTER_NAMES=("时小光" "康小健" "学小知" "心小暖" "心小安" "暖小阳")

for CHAR_NAME in "${CHARACTER_NAMES[@]}"; do
    CHAR_ID=$(echo "$CHARACTERS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict) and 'data' in data:
        characters = data['data']
    elif isinstance(data, list):
        characters = data
    else:
        characters = []
    for char in characters:
        if char.get('name') == '$CHAR_NAME':
            print(char.get('id', ''))
            break
except:
    pass
")
    
    if [ -n "$CHAR_ID" ]; then
        echo "✅ 找到角色: $CHAR_NAME (ID: $CHAR_ID)"
    else
        echo "⚠️  未找到角色: $CHAR_NAME"
    fi
done

echo ""
echo "========================================="
echo "准备测试技能"
echo "========================================="
echo ""
echo "请选择测试方式:"
echo "1. 自动化测试（需要更新test-cases.json）"
echo "2. 手动测试（打开浏览器控制台查看日志）"
echo ""
echo "使用以下Token进行测试:"
echo "export TEST_USER_TOKEN=$TOKEN"
echo ""
echo "然后可以运行: ./scripts/test-skills/start-test.sh"
