#!/bin/bash

# Graph API前后端联调测试脚本
# 测试账号: admin / Tyx@19811009

set -e

BASE_URL="http://localhost:8081"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Tyx@19811009"

echo "=========================================="
echo "Graph API 前后端联调测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 管理员登录
echo -e "${YELLOW}[1/8] 管理员登录...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}登录失败: $LOGIN_RESPONSE${NC}"
  exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. 获取所有Graph定义
echo -e "${YELLOW}[2/8] 获取所有Graph定义...${NC}"
GET_ALL_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/admin/graph" \
  -H "Authorization: Bearer ${TOKEN}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api/admin/graph" \
  -H "Authorization: Bearer ${TOKEN}")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}✓ 获取Graph列表成功 (HTTP $HTTP_CODE)${NC}"
  echo "响应: $(echo $GET_ALL_RESPONSE | head -c 200)..."
else
  echo -e "${RED}✗ 获取Graph列表失败 (HTTP $HTTP_CODE): $GET_ALL_RESPONSE${NC}"
fi
echo ""

# 3. 创建Graph定义
echo -e "${YELLOW}[3/8] 创建Graph定义...${NC}"
CREATE_PAYLOAD='{
  "name": "测试Graph_'$(date +%s)'",
  "description": "联调测试创建的Graph",
  "graphType": "SCRIPT",
  "isActive": true,
  "nodes": [
    {
      "nodeId": "start",
      "nodeType": "START",
      "positionX": 100.0,
      "positionY": 100.0,
      "nodeConfig": {}
    },
    {
      "nodeId": "llm1",
      "nodeType": "LLM",
      "positionX": 300.0,
      "positionY": 100.0,
      "nodeConfig": {
        "model": "qwen-max",
        "prompt": "测试提示词"
      }
    },
    {
      "nodeId": "end",
      "nodeType": "END",
      "positionX": 500.0,
      "positionY": 100.0,
      "nodeConfig": {}
    }
  ],
  "edges": [
    {
      "sourceNodeId": "start",
      "targetNodeId": "llm1",
      "edgeType": "default"
    },
    {
      "sourceNodeId": "llm1",
      "targetNodeId": "end",
      "edgeType": "default"
    }
  ]
}'

CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/graph" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$CREATE_PAYLOAD")

GRAPH_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$GRAPH_ID" ]; then
  echo -e "${RED}✗ 创建Graph失败: $CREATE_RESPONSE${NC}"
  GRAPH_ID="0"
else
  echo -e "${GREEN}✓ 创建Graph成功，ID: $GRAPH_ID${NC}"
fi
echo ""

# 4. 根据ID获取Graph定义
if [ "$GRAPH_ID" != "0" ]; then
  echo -e "${YELLOW}[4/8] 根据ID获取Graph定义...${NC}"
  GET_BY_ID_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/admin/graph/${GRAPH_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api/admin/graph/${GRAPH_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ 获取Graph详情成功 (HTTP $HTTP_CODE)${NC}"
  else
    echo -e "${RED}✗ 获取Graph详情失败 (HTTP $HTTP_CODE): $GET_BY_ID_RESPONSE${NC}"
  fi
  echo ""
fi

# 5. 更新Graph定义
if [ "$GRAPH_ID" != "0" ]; then
  echo -e "${YELLOW}[5/8] 更新Graph定义...${NC}"
  UPDATE_PAYLOAD='{
    "name": "更新后的Graph_'$(date +%s)'",
    "description": "这是更新后的描述",
    "graphType": "SCRIPT",
    "isActive": true,
    "nodes": [],
    "edges": []
  }'

  UPDATE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/admin/graph/${GRAPH_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${BASE_URL}/api/admin/graph/${GRAPH_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD")

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ 更新Graph成功 (HTTP $HTTP_CODE)${NC}"
  else
    echo -e "${RED}✗ 更新Graph失败 (HTTP $HTTP_CODE): $UPDATE_RESPONSE${NC}"
  fi
  echo ""
fi

# 6. 执行Graph
if [ "$GRAPH_ID" != "0" ]; then
  echo -e "${YELLOW}[6/8] 执行Graph...${NC}"
  EXECUTE_PAYLOAD='{
    "initialState": {}
  }'

  EXECUTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/graph/${GRAPH_ID}/execute" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$EXECUTE_PAYLOAD")

  EXECUTION_ID=$(echo $EXECUTE_RESPONSE | grep -o '"executionId":"[^"]*' | head -1 | cut -d'"' -f4)

  if [ -z "$EXECUTION_ID" ]; then
    echo -e "${RED}✗ 执行Graph失败: $EXECUTE_RESPONSE${NC}"
    EXECUTION_ID=""
  else
    echo -e "${GREEN}✓ 执行Graph成功，执行ID: $EXECUTION_ID${NC}"
  fi
  echo ""

  # 7. 获取执行状态
  if [ -n "$EXECUTION_ID" ]; then
    echo -e "${YELLOW}[7/8] 获取执行状态...${NC}"
    STATUS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
      -H "Authorization: Bearer ${TOKEN}")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api/admin/graph/${GRAPH_ID}/execution/${EXECUTION_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✓ 获取执行状态成功 (HTTP $HTTP_CODE)${NC}"
    STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    echo "  执行状态: $STATUS"
  else
    echo -e "${RED}✗ 获取执行状态失败 (HTTP $HTTP_CODE): $STATUS_RESPONSE${NC}"
  fi
    echo ""
  fi
fi

# 8. 查询执行历史
echo -e "${YELLOW}[8/8] 查询执行历史...${NC}"
QUERY_PAYLOAD='{
  "page": 0,
  "size": 10
}'

QUERY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/graph/executions/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$QUERY_PAYLOAD")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/admin/graph/executions/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$QUERY_PAYLOAD")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}✓ 查询执行历史成功 (HTTP $HTTP_CODE)${NC}"
  TOTAL=$(echo $QUERY_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
  echo "  总记录数: $TOTAL"
else
  echo -e "${RED}✗ 查询执行历史失败 (HTTP $HTTP_CODE): $QUERY_RESPONSE${NC}"
fi
echo ""

# 清理：删除测试Graph
if [ "$GRAPH_ID" != "0" ]; then
  echo -e "${YELLOW}[清理] 删除测试Graph...${NC}"
  DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/api/admin/graph/${GRAPH_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

  if [ "$(echo $DELETE_RESPONSE | wc -c)" -lt 10 ]; then
    echo -e "${GREEN}✓ 删除Graph成功${NC}"
  else
    echo -e "${YELLOW}删除响应: $DELETE_RESPONSE${NC}"
  fi
  echo ""
fi

echo "=========================================="
echo -e "${GREEN}测试完成！${NC}"
echo "=========================================="
