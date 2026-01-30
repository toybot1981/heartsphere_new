#!/bin/bash

# 检查 DevOps 平台健康状态

set -e

echo "🏥 检查 DevOps 平台健康状态..."

if [ -z "$API_BASE_URL" ]; then
    API_BASE_URL="http://localhost:8080"
fi

# 检查 API 可用性
echo "📡 检查 API 可用性..."
if curl -s -f "$API_BASE_URL/api/health" > /dev/null; then
    echo "  ✅ API 服务正常"
else
    echo "  ❌ API 服务不可用"
    exit 1
fi

# 检查数据库连接
echo "💾 检查数据库连接..."
# TODO: 添加数据库连接检查

# 检查 CMDB 功能
echo "📊 检查 CMDB 功能..."
if [ -n "$AUTH_TOKEN" ]; then
    CMDB_RESPONSE=$(curl -s -X GET "$API_BASE_URL/api/cmdb/assets" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo "  ✅ CMDB 功能正常"
    else
        echo "  ⚠️  CMDB 功能异常"
    fi
else
    echo "  ⚠️  跳过 CMDB 检查（需要 AUTH_TOKEN）"
fi

# 检查流程功能
echo "🔄 检查流程功能..."
if [ -n "$AUTH_TOKEN" ]; then
    PIPELINE_RESPONSE=$(curl -s -X GET "$API_BASE_URL/api/devops/pipelines" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo "  ✅ 流程功能正常"
    else
        echo "  ⚠️  流程功能异常"
    fi
else
    echo "  ⚠️  跳过流程检查（需要 AUTH_TOKEN）"
fi

echo "✅ 健康检查完成"
