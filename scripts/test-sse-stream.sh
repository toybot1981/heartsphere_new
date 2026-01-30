#!/bin/bash
# 测试 SSE 流式响应功能

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

BASE_URL="http://localhost:8083"
SESSION_ID="test-session-$(date +%s)"

echo "========================================="
echo "SSE 流式响应功能测试"
echo "========================================="
echo ""
echo "后端地址: $BASE_URL"
echo "测试会话ID: $SESSION_ID"
echo ""

# 检查后端服务是否运行
echo "1. 检查后端服务状态..."
if ! curl -s -f "$BASE_URL/api/psychology/health" > /dev/null 2>&1; then
    echo "❌ 后端服务未运行，请先启动服务："
    echo "   ./scripts/start-psychology-mentor-backend.sh"
    exit 1
fi
echo "✅ 后端服务运行正常"
echo ""

# 创建测试会话
echo "2. 创建测试会话..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/psychology/sessions/start" \
    -H "Content-Type: application/json" \
    -d '{
        "selectedMethodId": 1,
        "moodScore": 5,
        "stressLevel": 5,
        "sleepQuality": 5,
        "primaryConcern": "测试焦虑",
        "goals": ["缓解焦虑"],
        "hasPreviousTherapy": false
    }')

echo "会话创建响应: $SESSION_RESPONSE"
ACTUAL_SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACTUAL_SESSION_ID" ]; then
    echo "❌ 无法获取会话ID，请检查响应"
    echo "响应内容: $SESSION_RESPONSE"
    exit 1
fi

SESSION_ID=$ACTUAL_SESSION_ID
echo "✅ 会话创建成功，会话ID: $SESSION_ID"
echo ""

# 测试SSE流式响应
echo "3. 测试SSE流式响应..."
echo "发送消息: '你好，我最近感到焦虑'"
echo "等待流式响应..."
echo ""

curl -N -X POST "$BASE_URL/api/psychology/sessions/$SESSION_ID/message/stream" \
    -H "Content-Type: application/json" \
    -d '{
        "message": "你好，我最近感到焦虑"
    }' 2>&1 | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        # 提取JSON数据
        json_data=$(echo "$line" | sed 's/^data: //')
        echo "收到数据: $json_data"
        
        # 解析事件类型
        event_type=$(echo "$json_data" | grep -o '"type":"[^"]*"' | cut -d'"' -f4 || echo "")
        if [ "$event_type" = "complete" ]; then
            echo ""
            echo "✅ 流式响应完成"
            break
        fi
    fi
done

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
