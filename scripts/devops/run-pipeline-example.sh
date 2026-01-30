#!/bin/bash

# 运行示例部署流程

set -e

echo "🚀 运行示例部署流程..."

# 检查环境
if [ -z "$API_BASE_URL" ]; then
    API_BASE_URL="http://localhost:8080"
fi

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ 错误: 请设置 AUTH_TOKEN 环境变量"
    exit 1
fi

# 创建示例流程
echo "📝 创建示例流程..."
PIPELINE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/devops/pipelines" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "示例部署流程",
        "description": "用于测试的示例流程",
        "environment": "dev",
        "project": "test-project"
    }')

PIPELINE_ID=$(echo $PIPELINE_RESPONSE | jq -r '.id')
echo "✅ 流程已创建，ID: $PIPELINE_ID"

# 执行流程
echo "▶️  执行流程..."
EXECUTION_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/devops/pipelines/execute" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"pipelineId\": $PIPELINE_ID,
        \"environment\": \"dev\",
        \"parameters\": {}
    }")

EXECUTION_ID=$(echo $EXECUTION_RESPONSE | jq -r '.executionId')
echo "✅ 流程执行已启动，执行ID: $EXECUTION_ID"

# 轮询执行状态
echo "⏳ 等待流程执行完成..."
while true; do
    STATUS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/api/devops/pipelines/executions/$EXECUTION_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
    echo "  当前状态: $STATUS"
    
    if [ "$STATUS" = "SUCCESS" ] || [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
        break
    fi
    
    sleep 5
done

echo "✅ 流程执行完成，最终状态: $STATUS"

# 如果失败，尝试自动修复
if [ "$STATUS" = "FAILED" ]; then
    echo "🔧 尝试自动修复..."
    FIX_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/devops/auto-fix/detect-and-fix/$EXECUTION_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "✅ 自动修复已触发"
fi
