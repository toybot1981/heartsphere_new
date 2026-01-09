#!/bin/bash
echo "检查后端端点是否可用..."
echo ""

# 测试事件端点
echo "1. 测试 /api/scenario-events/system/all"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  "http://localhost:8081/api/scenario-events/system/all"

# 测试物品端点
echo ""
echo "2. 测试 /api/scenario-items/system/all"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  "http://localhost:8081/api/scenario-items/system/all"

echo ""
echo "如果返回404，说明后端服务需要重启以加载新的Controller"
