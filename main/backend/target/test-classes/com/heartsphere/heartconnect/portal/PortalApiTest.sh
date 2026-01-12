#!/bin/bash

# 传送门API测试脚本
# 使用方法: ./PortalApiTest.sh <base-url> <auth-token>

BASE_URL="${1:-http://localhost:8081}"
TOKEN="${2:-}"

if [ -z "$TOKEN" ]; then
    echo "错误: 请提供认证token"
    echo "使用方法: $0 <base-url> <auth-token>"
    echo "示例: $0 http://localhost:8081 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    exit 1
fi

echo "========================================="
echo "传送门API测试"
echo "========================================="
echo "Base URL: $BASE_URL"
echo ""

# 测试1: 获取场景传送门列表（不需要认证）
echo "测试1: 获取场景传送门列表"
curl -X GET "$BASE_URL/api/portal/scene/1?onlyActive=true" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

# 测试2: 创建传送门（需要认证）
echo "测试2: 创建传送门"
CREATE_RESPONSE=$(curl -X POST "$BASE_URL/api/portal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": 1,
    "portalName": "测试传送门",
    "portalType": "stargate",
    "targetShareCode": "HS-XXXXXX",
    "positionX": 0.0,
    "positionY": 0.0,
    "positionZ": 0.0,
    "size": 3.0,
    "permissionType": "public",
    "description": "这是一个测试传送门"
  }' \
  -w "\nHTTP Status: %{http_code}" \
  -s)

echo "$CREATE_RESPONSE" | head -n -1 | jq '.' || echo "$CREATE_RESPONSE" | head -n -1
HTTP_STATUS=$(echo "$CREATE_RESPONSE" | tail -n 1 | grep -o '[0-9]*$')
echo "HTTP Status: $HTTP_STATUS"
echo ""

# 如果创建成功，提取portalId
PORTAL_ID=$(echo "$CREATE_RESPONSE" | head -n -1 | jq -r '.data.id // empty' 2>/dev/null)

if [ -z "$PORTAL_ID" ]; then
    echo "警告: 无法从响应中提取portalId，跳过后续测试"
    exit 1
fi

echo "创建的传送门ID: $PORTAL_ID"
echo ""

# 测试3: 获取传送门详情
echo "测试3: 获取传送门详情 (ID: $PORTAL_ID)"
curl -X GET "$BASE_URL/api/portal/$PORTAL_ID" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

# 测试4: 获取传送门预览
echo "测试4: 获取传送门预览 (ID: $PORTAL_ID)"
curl -X GET "$BASE_URL/api/portal/$PORTAL_ID/preview" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

# 测试5: 更新传送门
echo "测试5: 更新传送门 (ID: $PORTAL_ID)"
curl -X PUT "$BASE_URL/api/portal/$PORTAL_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portalName": "更新后的传送门名称",
    "size": 4.0,
    "isActive": true
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

# 测试6: 执行传送
echo "测试6: 执行传送 (ID: $PORTAL_ID)"
curl -X POST "$BASE_URL/api/portal/$PORTAL_ID/teleport" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skipAnimation": false
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

# 测试7: 删除传送门
echo "测试7: 删除传送门 (ID: $PORTAL_ID)"
curl -X DELETE "$BASE_URL/api/portal/$PORTAL_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "响应不是JSON格式"
echo ""

echo "========================================="
echo "测试完成"
echo "========================================="
