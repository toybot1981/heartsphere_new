#!/bin/bash
# 完整的SSE流式响应测试脚本

BASE_URL="http://localhost:8083"
TIMEOUT=30

echo "========================================="
echo "SSE 流式响应完整测试"
echo "========================================="
echo ""

# 1. 检查服务健康状态
echo "1. 检查后端服务..."
if ! curl -s -f "$BASE_URL/api/psychology/health" > /dev/null 2>&1; then
    echo "❌ 后端服务未运行"
    echo "请先启动服务: cd psychology-mentor/backend && mvn spring-boot:run"
    exit 1
fi
echo "✅ 后端服务运行正常"
echo ""

# 2. 获取疗法列表
echo "2. 获取疗法列表..."
METHODS=$(curl -s "$BASE_URL/api/psychology/methods")
echo "疗法列表: $METHODS"
METHOD_ID=$(echo $METHODS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [ -z "$METHOD_ID" ]; then
    METHOD_ID=1
fi
echo "使用疗法ID: $METHOD_ID"
echo ""

# 3. 创建会话
echo "3. 创建会话..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/psychology/sessions/start" \
    -H "Content-Type: application/json" \
    -d "{
        \"selectedMethodId\": $METHOD_ID,
        \"moodScore\": 5,
        \"stressLevel\": 5,
        \"sleepQuality\": 5,
        \"primaryConcern\": \"测试焦虑\",
        \"goals\": [\"缓解焦虑\"],
        \"hasPreviousTherapy\": false
    }")

echo "会话响应: $SESSION_RESPONSE"
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$SESSION_ID" ]; then
    # 尝试从data中提取
    SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"data":{[^}]*"sessionId":"[^"]*"' | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4 || echo "")
fi

if [ -z "$SESSION_ID" ]; then
    echo "❌ 无法获取会话ID"
    echo "完整响应: $SESSION_RESPONSE"
    exit 1
fi

echo "✅ 会话创建成功，会话ID: $SESSION_ID"
echo ""

# 4. 测试SSE流式响应
echo "4. 测试SSE流式响应..."
echo "发送消息: '你好，我最近感到焦虑'"
echo "----------------------------------------"
echo ""

# 使用curl测试SSE流
curl -N -X POST "$BASE_URL/api/psychology/sessions/$SESSION_ID/message/stream" \
    -H "Content-Type: application/json" \
    -d '{
        "message": "你好，我最近感到焦虑"
    }' \
    --max-time $TIMEOUT 2>&1 | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
        # 提取并解析JSON
        json_data=$(echo "$line" | sed 's/^data: //')
        echo "📨 收到事件: $json_data"
        
        # 尝试解析事件类型
        if echo "$json_data" | grep -q '"type"'; then
            event_type=$(echo "$json_data" | grep -o '"type":"[^"]*"' | cut -d'"' -f4 || echo "")
            if [ "$event_type" = "complete" ]; then
                echo ""
                echo "✅ 流式响应完成"
                break
            elif [ "$event_type" = "error" ]; then
                echo ""
                echo "❌ 收到错误事件"
                break
            fi
        fi
    elif [[ $line == event:* ]]; then
        echo "📋 事件类型: $line"
    elif [[ $line == id:* ]]; then
        echo "🆔 事件ID: $line"
    fi
done

echo ""
echo "----------------------------------------"
echo "5. 验证会话消息..."
MESSAGES=$(curl -s "$BASE_URL/api/psychology/sessions/$SESSION_ID")
echo "会话消息: $MESSAGES"
echo ""

echo "========================================="
echo "测试完成"
echo "========================================="
