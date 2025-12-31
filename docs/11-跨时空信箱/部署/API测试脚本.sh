#!/bin/bash

# 跨时空信箱API测试脚本
# 用于快速测试所有API接口

set -e

BASE_URL="http://localhost:8081"
API_BASE="$BASE_URL/api"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 跨时空信箱API测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查服务是否启动
echo -e "${YELLOW}1. 检查服务状态...${NC}"
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务运行正常${NC}"
else
    echo -e "${RED}❌ 服务未启动，请先启动后端应用${NC}"
    exit 1
fi

# 提示用户登录
echo ""
echo -e "${YELLOW}2. 获取认证Token...${NC}"
echo "请输入登录凭据（或使用环境变量TOKEN）"
read -p "用户名: " USERNAME
read -sp "密码: " PASSWORD
echo ""

# 登录获取token
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ 登录失败，请检查用户名和密码${NC}"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ 登录成功${NC}"
echo ""

# 测试未读消息统计
echo -e "${YELLOW}3. 测试未读消息统计API...${NC}"
RESPONSE=$(curl -s -X GET "$API_BASE/mailbox/messages/unread/count" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $RESPONSE"
if echo "$RESPONSE" | grep -q "totalUnread\|error"; then
    echo -e "${GREEN}✅ API响应正常${NC}"
else
    echo -e "${RED}❌ API响应异常${NC}"
fi
echo ""

# 测试消息列表
echo -e "${YELLOW}4. 测试消息列表API...${NC}"
RESPONSE=$(curl -s -X GET "$API_BASE/mailbox/messages?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $(echo $RESPONSE | head -c 200)..."
if echo "$RESPONSE" | grep -q "content\|totalElements"; then
    echo -e "${GREEN}✅ API响应正常${NC}"
else
    echo -e "${RED}❌ API响应异常${NC}"
fi
echo ""

# 测试对话列表
echo -e "${YELLOW}5. 测试对话列表API...${NC}"
RESPONSE=$(curl -s -X GET "$API_BASE/mailbox/conversations?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $(echo $RESPONSE | head -c 200)..."
if echo "$RESPONSE" | grep -q "content\|totalElements"; then
    echo -e "${GREEN}✅ API响应正常${NC}"
else
    echo -e "${RED}❌ API响应异常${NC}"
fi
echo ""

# 测试提醒设置
echo -e "${YELLOW}6. 测试提醒设置API...${NC}"
RESPONSE=$(curl -s -X GET "$API_BASE/mailbox/notification-settings" \
  -H "Authorization: Bearer $TOKEN")
echo "响应: $RESPONSE"
if echo "$RESPONSE" | grep -q "enableNotifications\|userId"; then
    echo -e "${GREEN}✅ API响应正常${NC}"
else
    echo -e "${RED}❌ API响应异常${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ API测试完成${NC}"
echo -e "${GREEN}========================================${NC}"

