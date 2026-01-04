#!/bin/bash

# 简化的Graph流程执行测试脚本

set -e

API_BASE="http://localhost:8081/api"
GRAPH_ID=6

echo "=== Graph流程执行测试 ==="
echo ""

# 1. 尝试多个可能的admin密码
echo "1. 获取admin token..."
TOKEN=""

for PASSWORD in "admin123" "admin" "123456" "password"; do
    RESPONSE=$(curl -s -X POST "${API_BASE}/admin/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"admin\",\"password\":\"${PASSWORD}\"}")
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ 登录成功，密码: ${PASSWORD}"
        break
    fi
done

if [ -z "$TOKEN" ]; then
    echo "❌ 无法获取admin token"
    echo "尝试的密码: admin123, admin, 123456, password"
    echo "请手动设置TOKEN环境变量: export TOKEN='your_token'"
    exit 1
fi

echo "Token: ${TOKEN:0:30}..."
echo ""

# 2. 执行graph
echo "2. 执行Graph流程 (ID: $GRAPH_ID)..."
EXECUTE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{}')

echo "执行响应:"
echo "$EXECUTE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$EXECUTE_RESPONSE"
echo ""

# 3. 提取executionId
EXECUTION_ID=$(echo "$EXECUTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('executionId', ''))" 2>/dev/null || echo "$EXECUTE_RESPONSE" | grep -o '"executionId":"[^"]*' | cut -d'"' -f4)

if [ -z "$EXECUTION_ID" ]; then
    echo "❌ 无法获取executionId"
    exit 1
fi

echo "✅ 执行ID: $EXECUTION_ID"
echo ""

# 4. 检查执行状态（循环检查直到完成或等待）
MAX_ITERATIONS=10
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "3.$ITERATION. 检查执行状态 (第 $ITERATION 次)..."
    
    STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null || echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    WAIT_TYPE=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('waitType', ''))" 2>/dev/null || echo "$STATUS_RESPONSE" | grep -o '"waitType":"[^"]*' | cut -d'"' -f4)
    CURRENT_NODE=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('currentNodeId', ''))" 2>/dev/null || echo "$STATUS_RESPONSE" | grep -o '"currentNodeId":"[^"]*' | cut -d'"' -f4)
    
    echo "状态: $STATUS, 等待类型: $WAIT_TYPE, 当前节点: $CURRENT_NODE"
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo "✅ Graph流程执行完成！"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo "❌ Graph流程执行失败"
        echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
        exit 1
    elif [ "$STATUS" = "WAITING" ] && [ "$WAIT_TYPE" = "CHOICE" ]; then
        echo "⚠️  需要用户选择..."
        
        # 提取选项
        OPTIONS=$(echo "$STATUS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    state = data.get('state', {})
    options = state.get('choice_options', [])
    for opt in options:
        print(f\"  - {opt.get('id', '')}: {opt.get('text', '')}\")
except:
    pass
" 2>/dev/null)
        
        if [ -n "$OPTIONS" ]; then
            echo "可用选项:"
            echo "$OPTIONS"
        fi
        
        # 获取第一个选项ID
        FIRST_OPTION_ID=$(echo "$STATUS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    state = data.get('state', {})
    options = state.get('choice_options', [])
    if options:
        print(options[0].get('id', ''))
except:
    pass
" 2>/dev/null)
        
        if [ -n "$FIRST_OPTION_ID" ] && [ "$FIRST_OPTION_ID" != "None" ] && [ "$FIRST_OPTION_ID" != "null" ]; then
            echo ""
            echo "4. 自动选择第一个选项: $FIRST_OPTION_ID"
            CHOICE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}/choice" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${TOKEN}" \
                -d "{\"optionId\":\"${FIRST_OPTION_ID}\"}")
            
            echo "选择响应:"
            echo "$CHOICE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHOICE_RESPONSE"
            echo ""
            
            # 继续循环检查
            sleep 1
            continue
        else
            echo "❌ 无法获取选项ID"
            break
        fi
    else
        sleep 1
    fi
done

# 5. 获取最终状态
echo ""
echo "5. 获取最终执行状态..."
FINAL_STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

echo "最终状态:"
echo "$FINAL_STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FINAL_STATUS_RESPONSE"
echo ""

# 6. 获取执行日志
echo "6. 获取执行日志..."
LOGS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/executions/${EXECUTION_ID}/logs?all=true" \
    -H "Authorization: Bearer ${TOKEN}")

echo "执行日志:"
echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGS_RESPONSE"
echo ""

# 7. 总结
FINAL_STATUS=$(echo "$FINAL_STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null || echo "$FINAL_STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
FINAL_NODE=$(echo "$FINAL_STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('currentNodeId', ''))" 2>/dev/null || echo "$FINAL_STATUS_RESPONSE" | grep -o '"currentNodeId":"[^"]*' | cut -d'"' -f4)

echo "=== 测试结果 ==="
echo "最终状态: $FINAL_STATUS"
echo "当前节点: $FINAL_NODE"
echo "执行ID: $EXECUTION_ID"
echo ""

if [ "$FINAL_STATUS" = "COMPLETED" ]; then
    echo "✅ Graph流程执行成功！"
    exit 0
elif [ "$FINAL_STATUS" = "WAITING" ]; then
    echo "⚠️  Graph流程等待用户输入"
    exit 0
elif [ "$FINAL_STATUS" = "FAILED" ]; then
    echo "❌ Graph流程执行失败"
    exit 1
else
    echo "⚠️  Graph流程状态: $FINAL_STATUS"
    exit 0
fi
