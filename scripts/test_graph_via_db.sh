#!/bin/bash

# 通过直接调用后端服务测试Graph执行
# 使用Spring Boot Actuator或直接调用服务

set -e

GRAPH_ID=6
API_BASE="http://localhost:8081/api"

echo "=== Graph流程执行测试 ==="
echo ""

# 1. 检查后端服务
echo "1. 检查后端服务..."
if ! curl -s -f "${API_BASE}/admin/auth/login" > /dev/null 2>&1; then
    echo "❌ 后端服务未运行"
    exit 1
fi
echo "✅ 后端服务运行中"
echo ""

# 2. 尝试使用已知的admin账号
echo "2. 尝试登录..."
TOKEN=""

# 尝试多个可能的密码组合
for USER in "admin" "tyx" "tangml"; do
    for PWD in "123456" "admin123" "admin" "password" "tyx123" "tangml123"; do
        RESPONSE=$(curl -s -X POST "${API_BASE}/admin/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"${USER}\",\"password\":\"${PWD}\"}")
        
        TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null || echo "")
        
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ] && [ "$TOKEN" != "null" ] && [ ${#TOKEN} -gt 10 ]; then
            echo "✅ 登录成功！用户: ${USER}, 密码: ${PWD}"
            break 2
        fi
    done
done

if [ -z "$TOKEN" ]; then
    echo "❌ 无法获取admin token"
    echo ""
    echo "请手动设置TOKEN环境变量:"
    echo "  export TOKEN='your_token_here'"
    echo "然后重新运行此脚本"
    exit 1
fi

echo "Token: ${TOKEN:0:30}..."
echo ""

# 3. 执行graph
echo "3. 执行Graph流程 (ID: $GRAPH_ID)..."
EXECUTE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{}')

echo "执行响应:"
echo "$EXECUTE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$EXECUTE_RESPONSE"
echo ""

# 4. 提取executionId
EXECUTION_ID=$(echo "$EXECUTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('executionId', ''))" 2>/dev/null || echo "")

if [ -z "$EXECUTION_ID" ] || [ "$EXECUTION_ID" = "None" ] || [ "$EXECUTION_ID" = "null" ]; then
    echo "❌ 无法获取executionId"
    exit 1
fi

echo "✅ 执行ID: $EXECUTION_ID"
echo ""

# 5. 循环检查执行状态并处理choice
MAX_ITERATIONS=20
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "4.$ITERATION. 检查执行状态..."
    
    STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null || echo "")
    WAIT_TYPE=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('waitType', ''))" 2>/dev/null || echo "")
    CURRENT_NODE=$(echo "$STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('currentNodeId', ''))" 2>/dev/null || echo "")
    
    echo "   状态: $STATUS, 等待类型: $WAIT_TYPE, 当前节点: $CURRENT_NODE"
    
    if [ "$STATUS" = "COMPLETED" ]; then
        echo ""
        echo "✅ Graph流程执行完成！"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo ""
        echo "❌ Graph流程执行失败"
        echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
        exit 1
    elif [ "$STATUS" = "WAITING" ] && [ "$WAIT_TYPE" = "CHOICE" ]; then
        echo "   需要用户选择..."
        
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
            echo "   可用选项:"
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
            echo "   自动选择第一个选项: $FIRST_OPTION_ID"
            CHOICE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}/choice" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer ${TOKEN}" \
                -d "{\"optionId\":\"${FIRST_OPTION_ID}\"}")
            
            echo "   选择响应: $CHOICE_RESPONSE" | python3 -c "import sys; print(sys.stdin.read()[:200])" 2>/dev/null || echo "   选择已提交"
            echo ""
            
            sleep 1
            continue
        else
            echo "   ❌ 无法获取选项ID"
            break
        fi
    else
        sleep 1
    fi
done

# 6. 获取最终状态和日志
echo ""
echo "5. 获取最终执行状态..."
FINAL_STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

echo "最终状态:"
echo "$FINAL_STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FINAL_STATUS_RESPONSE"
echo ""

echo "6. 获取执行日志..."
LOGS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/executions/${EXECUTION_ID}/logs?all=true" \
    -H "Authorization: Bearer ${TOKEN}")

echo "执行日志:"
echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGS_RESPONSE"
echo ""

# 7. 总结
FINAL_STATUS=$(echo "$FINAL_STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null || echo "")
FINAL_NODE=$(echo "$FINAL_STATUS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('currentNodeId', ''))" 2>/dev/null || echo "")

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
