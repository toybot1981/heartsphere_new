#!/bin/bash

# Mentis API 测试脚本
# 用于测试 Mentis 的所有 API 端点

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BASE_URL="${BASE_URL:-http://localhost:8080}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mentis API 测试脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 管理员登录
echo -e "${YELLOW}[1/7] 管理员登录...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ 登录失败${NC}"
  echo "响应: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. 创建会话
echo -e "${YELLOW}[2/7] 创建会话...${NC}"
SESSION_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/mentis/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"title":"API测试会话"}')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*' | grep -o '[^"]*$')

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}✗ 创建会话失败${NC}"
  echo "响应: $SESSION_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ 会话创建成功${NC}"
echo "Session ID: $SESSION_ID"
echo ""

# 3. 获取会话详情
echo -e "${YELLOW}[3/7] 获取会话详情...${NC}"
GET_SESSION_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/admin/mentis/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$GET_SESSION_RESPONSE" | grep -q '"code":200'; then
  echo -e "${GREEN}✓ 获取会话成功${NC}"
else
  echo -e "${RED}✗ 获取会话失败${NC}"
  echo "响应: $GET_SESSION_RESPONSE"
fi
echo ""

# 4. 获取会话列表
echo -e "${YELLOW}[4/7] 获取会话列表...${NC}"
GET_SESSIONS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/admin/mentis/sessions" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$GET_SESSIONS_RESPONSE" | grep -q '"code":200'; then
  SESSION_COUNT=$(echo "$GET_SESSIONS_RESPONSE" | grep -o '"sessionId"' | wc -l)
  echo -e "${GREEN}✓ 获取会话列表成功${NC}"
  echo "会话数量: $SESSION_COUNT"
else
  echo -e "${RED}✗ 获取会话列表失败${NC}"
  echo "响应: $GET_SESSIONS_RESPONSE"
fi
echo ""

# 5. 发送同步消息
echo -e "${YELLOW}[5/7] 发送同步消息...${NC}"
SEND_MESSAGE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/mentis/chat/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"sessionId\":\"${SESSION_ID}\",\"message\":\"你好，Mentis！这是一个测试消息\",\"enableComputerUse\":false}")

if echo "$SEND_MESSAGE_RESPONSE" | grep -q '"code":200'; then
  echo -e "${GREEN}✓ 发送消息成功${NC}"
  RESPONSE_MSG=$(echo "$SEND_MESSAGE_RESPONSE" | grep -o '"response":"[^"]*' | head -1 | grep -o '[^"]*$' || echo "无响应内容")
  echo "响应: ${RESPONSE_MSG:0:50}..."
else
  echo -e "${RED}✗ 发送消息失败${NC}"
  echo "响应: $SEND_MESSAGE_RESPONSE"
fi
echo ""

# 6. 发送流式消息（测试连接）
echo -e "${YELLOW}[6/7] 测试流式消息连接...${NC}"
STREAM_RESPONSE=$(curl -s -N -X POST "${BASE_URL}/api/admin/mentis/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"sessionId\":\"${SESSION_ID}\",\"message\":\"测试流式消息\",\"enableComputerUse\":false}" \
  --max-time 5)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ 流式消息连接成功${NC}"
  echo "接收到数据: ${#STREAM_RESPONSE} 字节"
else
  echo -e "${RED}✗ 流式消息连接失败${NC}"
fi
echo ""

# 7. 更新会话状态
echo -e "${YELLOW}[7/7] 更新会话状态...${NC}"
UPDATE_STATUS_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/admin/mentis/sessions/${SESSION_ID}/status?status=PAUSED" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$UPDATE_STATUS_RESPONSE" | grep -q '"code":200'; then
  echo -e "${GREEN}✓ 更新状态成功${NC}"
else
  echo -e "${RED}✗ 更新状态失败${NC}"
  echo "响应: $UPDATE_STATUS_RESPONSE"
fi
echo ""

# 8. 清理：删除测试会话
echo -e "${YELLOW}[清理] 删除测试会话...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/api/admin/mentis/sessions/${SESSION_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$DELETE_RESPONSE" | grep -q '"code":200'; then
  echo -e "${GREEN}✓ 删除会话成功${NC}"
else
  echo -e "${RED}✗ 删除会话失败${NC}"
  echo "响应: $DELETE_RESPONSE"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${BLUE}========================================${NC}"
