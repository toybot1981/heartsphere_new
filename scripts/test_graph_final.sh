#!/bin/bash

# 最终Graph流程执行测试脚本
# 直接使用最新的执行记录进行测试

set -e

DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"
GRAPH_ID=6
API_BASE="http://localhost:8081/api"

echo "=== Graph流程执行测试 ==="
echo ""

# 1. 获取最新的执行记录
echo "1. 查看最新的执行记录..."
LATEST_EXECUTION=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "
SELECT execution_id 
FROM graph_executions 
WHERE graph_id = $GRAPH_ID 
ORDER BY created_at DESC 
LIMIT 1;
" 2>/dev/null | head -1)

if [ -z "$LATEST_EXECUTION" ]; then
    echo "❌ 没有找到执行记录，需要先执行graph"
    exit 1
fi

echo "✅ 找到执行记录: $LATEST_EXECUTION"
echo ""

# 2. 查看执行状态
echo "2. 查看执行状态..."
EXECUTION_INFO=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "
SELECT CONCAT('状态: ', status, ', 当前节点: ', current_node_id, ', 等待类型: ', IFNULL(wait_type, 'NONE'), ', 步骤数: ', step_count)
FROM graph_executions 
WHERE execution_id = '$LATEST_EXECUTION';
" 2>/dev/null)

echo "$EXECUTION_INFO"
echo ""

# 3. 查看state_json中的choice_options
echo "3. 查看执行状态详情..."
STATE_JSON=$(mysql -u${DB_USER} -p${DB_PASS} -D${DB_NAME} -N -e "
SELECT state_json 
FROM graph_executions 
WHERE execution_id = '$LATEST_EXECUTION';
" 2>/dev/null)

if [ -n "$STATE_JSON" ]; then
    echo "状态JSON (前500字符):"
    echo "$STATE_JSON" | head -c 500
    echo ""
    echo ""
    
    # 尝试提取choice_options
    if echo "$STATE_JSON" | grep -q "choice_options"; then
        echo "✅ 检测到choice_options"
        echo "$STATE_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    options = data.get('choice_options', [])
    if options:
        print('可用选项:')
        for opt in options:
            print(f\"  - {opt.get('id', '')}: {opt.get('text', '')}\")
    else:
        print('选项列表为空')
except Exception as e:
    print(f'解析失败: {e}')
" 2>/dev/null || echo "无法解析JSON"
        echo ""
    fi
fi

# 4. 尝试通过API继续执行（需要token）
echo "4. 尝试通过API继续执行..."
echo "   注意: 需要有效的admin token"
echo "   执行ID: $LATEST_EXECUTION"
echo "   Graph ID: $GRAPH_ID"
echo ""

# 5. 总结
echo "=== 测试结果 ==="
echo "执行ID: $LATEST_EXECUTION"
echo "Graph ID: $GRAPH_ID"
echo "$EXECUTION_INFO"
echo ""

if echo "$EXECUTION_INFO" | grep -q "WAITING"; then
    echo "⚠️  Graph流程处于等待状态"
    echo ""
    echo "如果需要继续执行，请："
    echo "1. 获取admin token"
    echo "2. 调用API: POST ${API_BASE}/admin/graph/${GRAPH_ID}/execution/${LATEST_EXECUTION}/choice"
    echo "3. 请求体: {\"optionId\": \"选项ID\"}"
else
    echo "✅ Graph流程状态正常"
fi
