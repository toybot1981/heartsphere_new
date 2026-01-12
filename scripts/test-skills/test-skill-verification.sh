#!/bin/bash

# 技能验证测试脚本 - 用于验证现有角色的技能

USERNAME="tongyexin"
PASSWORD="123456"
API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"

echo "========================================="
echo "技能验证测试"
echo "========================================="
echo ""

# 1. 登录获取Token
echo "🔐 正在登录..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('data', {}).get('token', ''))
except:
    pass
" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ 登录成功"
echo ""

# 2. 获取角色列表
echo "🔍 查询角色列表..."
CHARACTERS_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/characters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# 3. 提取第一个角色进行测试
CHAR_ID=$(echo "$CHARACTERS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and len(data) > 0:
        print(data[0].get('id', ''))
    elif isinstance(data, dict) and 'data' in data:
        if isinstance(data['data'], list) and len(data['data']) > 0:
            print(data['data'][0].get('id', ''))
except:
    pass
" 2>/dev/null)

CHAR_NAME=$(echo "$CHARACTERS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and len(data) > 0:
        print(data[0].get('name', ''))
    elif isinstance(data, dict) and 'data' in data:
        if isinstance(data['data'], list) and len(data['data']) > 0:
            print(data['data'][0].get('name', ''))
except:
    pass
" 2>/dev/null)

if [ -z "$CHAR_ID" ]; then
    echo "❌ 未找到可用的角色"
    exit 1
fi

echo "✅ 找到角色: $CHAR_NAME (ID: $CHAR_ID)"
echo ""

# 4. 测试技能激活
echo "========================================="
echo "开始测试技能激活"
echo "========================================="
echo ""

# 测试用例1: 尝试触发技能
TEST_PROMPT="帮我分析一下今天的时间使用情况"
echo "📝 测试用例1: $TEST_PROMPT"
echo ""

# 发送消息
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\": $CHAR_ID,
    \"message\": \"$TEST_PROMPT\"
  }")

echo "响应:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# 检查是否包含技能相关信息
if echo "$RESPONSE" | grep -q "技能\|skill\|应用了"; then
    echo "✅ 检测到技能相关响应"
else
    echo "⚠️  未检测到明确的技能激活标识"
fi

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "💡 提示:"
echo "1. 打开浏览器，访问 http://localhost:3000"
echo "2. 使用账号 $USERNAME / $PASSWORD 登录"
echo "3. 选择角色并发送测试消息"
echo "4. 打开浏览器控制台（F12）查看日志："
echo "   - [generateAIResponse] 获取到角色技能列表"
echo "   - [generateAIResponse] Function Call"
echo "   - [generateAIResponse] 技能激活"
echo "5. 观察AI回复中是否显示: '✨ 应用了 {skillName} 技能'"
echo ""
