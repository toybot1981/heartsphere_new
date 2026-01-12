#!/bin/bash

# 技能激活测试脚本 - 通过后端日志验证
# 使用方法: ./test-skill-activation-with-backend-log.sh

API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"
USERNAME="ty1"
PASSWORD="Tyx@1234"
CHARACTER_ID=358  # 时小光
TEST_PROMPT="帮我分析一下今天的时间使用情况"

echo "========================================="
echo "技能激活测试（通过后端日志验证）"
echo "========================================="
echo ""
echo "测试账号: $USERNAME"
echo "测试角色ID: $CHARACTER_ID (时小光)"
echo "测试话术: $TEST_PROMPT"
echo ""

# 获取测试开始时间
TEST_START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "测试开始时间: $TEST_START_TIME"
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

# 2. 检查角色技能配置
echo "🔍 检查角色技能配置..."
SKILLS_RESPONSE=$(curl -s "${API_BASE_URL}/api/skills/character/${CHARACTER_ID}/all" \
  -H "Authorization: Bearer $TOKEN")

echo "$SKILLS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    skills = data.get('data', {})
    fc_count = len(skills.get('functionCallingSkills', []))
    pd_count = len(skills.get('promptDrivenSkills', []))
    print(f'Function Calling 技能数: {fc_count}')
    print(f'提示词驱动技能数: {pd_count}')
    if fc_count > 0:
        print('Function Calling 技能列表:')
        for s in skills.get('functionCallingSkills', []):
            print(f'  - {s.get(\"name\", \"N/A\")}: {s.get(\"description\", \"N/A\")}')
    if pd_count > 0:
        print('提示词驱动技能列表:')
        for s in skills.get('promptDrivenSkills', []):
            print(f'  - {s.get(\"name\", \"N/A\")}: {s.get(\"description\", \"N/A\")}')
except Exception as e:
    print(f'解析失败: {e}')
" 2>/dev/null

echo ""
echo "========================================="
echo "发送测试消息"
echo "========================================="
echo ""

# 记录发送消息的时间戳
MESSAGE_TIME=$(date '+%Y-%m-%d %H:%M:%S.%3N' | sed 's/\.000//')
echo "消息发送时间: $MESSAGE_TIME"
echo ""

# 3. 发送测试消息（使用AI对话API）
echo "📤 发送测试消息..."
CHAT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\": ${CHARACTER_ID},
    \"message\": \"${TEST_PROMPT}\",
    \"stream\": false
  }")

# 检查响应
echo "响应状态码: $(echo "$CHAT_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('code', 'N/A'))
except:
    print('N/A')
" 2>/dev/null)"

echo ""
echo "响应摘要:"
echo "$CHAT_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'message' in data['data']:
        msg = data['data']['message']
        text = msg.get('text', '')
        print(f'AI回复长度: {len(text)} 字符')
        print(f'AI回复预览: {text[:200]}...')
        if 'skill' in text.lower() or '技能' in text or '✨' in text:
            print('✅ 检测到技能相关标识')
    elif 'message' in data:
        print(data['message'])
except Exception as e:
    print(f'解析失败: {e}')
" 2>/dev/null

echo ""
echo "========================================="
echo "检查后端日志"
echo "========================================="
echo ""

# 等待日志写入
sleep 3

# 查找相关日志
LOG_FILE="../main/backend/logs/application.log"
if [ -f "$LOG_FILE" ]; then
    echo "📋 检查日志文件: $LOG_FILE"
    echo ""
    
    # 查找技能相关的日志
    echo "🔍 技能相关日志:"
    grep -E "技能|skill|Function Call|functionCall|getCharacterAllSkills|技能激活|技能执行" "$LOG_FILE" | tail -20 | grep -v "^$" || echo "  未找到相关日志"
    
    echo ""
    echo "🔍 角色技能查询日志:"
    grep -E "角色.*技能统计|Function Calling|提示词驱动" "$LOG_FILE" | tail -10 | grep -v "^$" || echo "  未找到相关日志"
    
    echo ""
    echo "🔍 AI服务调用日志:"
    grep -E "generateAIResponse|获取到角色技能列表|Function Call" "$LOG_FILE" | tail -10 | grep -v "^$" || echo "  未找到相关日志"
    
else
    echo "⚠️  日志文件不存在: $LOG_FILE"
fi

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "📝 测试时间范围:"
echo "   开始: $TEST_START_TIME"
echo "   消息: $MESSAGE_TIME"
echo "   结束: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "💡 建议："
echo "1. 查看完整日志: tail -f $LOG_FILE | grep -E '技能|skill|Function Call'"
echo "2. 检查数据库中的技能配置"
echo "3. 验证技能是否有 function_schema"
echo ""
