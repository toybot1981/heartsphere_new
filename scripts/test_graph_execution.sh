#!/bin/bash

# Graph流程执行测试脚本
# 用于测试数据库中的graph流程是否能正常执行

set -e

DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"
API_BASE="http://localhost:8081/api"
GRAPH_ID=6

echo "=== Graph流程执行测试 ==="
echo ""

# 1. 检查后端服务是否运行
echo "1. 检查后端服务..."
if ! curl -s -f "${API_BASE}/admin/auth/login" > /dev/null 2>&1; then
    echo "❌ 后端服务未运行，请先启动后端服务"
    exit 1
fi
echo "✅ 后端服务运行中"
echo ""

# 2. 获取admin token
echo "2. 获取admin token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败，尝试使用数据库中的admin账号..."
    # 尝试从数据库获取admin账号
    ADMIN_USER=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "SELECT username FROM admins LIMIT 1;" 2>/dev/null | head -1)
    if [ -n "$ADMIN_USER" ]; then
        echo "找到admin账号: $ADMIN_USER"
        LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/auth/login" \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"admin123\"}")
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    fi
fi

if [ -z "$TOKEN" ]; then
    echo "❌ 无法获取admin token，请检查admin账号密码"
    echo "登录响应: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ 获取admin token成功"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 3. 查看graph信息
echo "3. 查看Graph信息 (ID: $GRAPH_ID)..."
GRAPH_INFO=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "
    SELECT CONCAT('ID: ', id, ', Name: ', name, ', Type: ', graph_type, ', Start: ', start_node_id)
    FROM graph_definitions WHERE id = $GRAPH_ID;
" 2>/dev/null)

if [ -z "$GRAPH_INFO" ]; then
    echo "❌ Graph ID $GRAPH_ID 不存在"
    exit 1
fi

echo "$GRAPH_INFO"
echo ""

# 4. 执行graph
echo "4. 执行Graph流程..."
EXECUTE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execute" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{}')

echo "执行响应:"
echo "$EXECUTE_RESPONSE" | jq '.' 2>/dev/null || echo "$EXECUTE_RESPONSE"
echo ""

# 5. 提取executionId
EXECUTION_ID=$(echo "$EXECUTE_RESPONSE" | grep -o '"executionId":"[^"]*' | cut -d'"' -f4)

if [ -z "$EXECUTION_ID" ]; then
    echo "❌ 无法获取executionId"
    exit 1
fi

echo "✅ 执行ID: $EXECUTION_ID"
echo ""

# 6. 检查执行状态
echo "5. 检查执行状态..."
STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

echo "执行状态:"
echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

# 7. 检查是否需要用户选择
STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
WAIT_TYPE=$(echo "$STATUS_RESPONSE" | grep -o '"waitType":"[^"]*' | cut -d'"' -f4)

if [ "$STATUS" = "WAITING" ] && [ "$WAIT_TYPE" = "CHOICE" ]; then
    echo "6. 检测到需要用户选择..."
    
    # 提取选项
    echo "$STATUS_RESPONSE" | jq -r '.state.choice_options[]? | "\(.id): \(.text)"' 2>/dev/null || echo "无法解析选项"
    echo ""
    
    # 获取第一个选项ID
    FIRST_OPTION_ID=$(echo "$STATUS_RESPONSE" | jq -r '.state.choice_options[0].id' 2>/dev/null)
    
    if [ -n "$FIRST_OPTION_ID" ] && [ "$FIRST_OPTION_ID" != "null" ]; then
        echo "7. 自动选择第一个选项: $FIRST_OPTION_ID"
        CHOICE_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}/choice" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${TOKEN}" \
            -d "{\"optionId\":\"${FIRST_OPTION_ID}\"}")
        
        echo "选择响应:"
        echo "$CHOICE_RESPONSE" | jq '.' 2>/dev/null || echo "$CHOICE_RESPONSE"
        echo ""
        
        # 再次检查状态
        sleep 1
        STATUS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
            -H "Authorization: Bearer ${TOKEN}")
        
        echo "选择后的执行状态:"
        echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
        echo ""
    fi
fi

# 8. 获取执行日志
echo "8. 获取执行日志..."
LOGS_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/graph/executions/${EXECUTION_ID}/logs?all=true" \
    -H "Authorization: Bearer ${TOKEN}")

echo "执行日志:"
echo "$LOGS_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGS_RESPONSE"
echo ""

# 9. 最终状态
FINAL_STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
CURRENT_NODE=$(echo "$STATUS_RESPONSE" | grep -o '"currentNodeId":"[^"]*' | cut -d'"' -f4)

echo "=== 测试结果 ==="
echo "最终状态: $FINAL_STATUS"
echo "当前节点: $CURRENT_NODE"
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
