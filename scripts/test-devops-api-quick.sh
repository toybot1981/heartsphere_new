#!/bin/bash

# DevOps 工作台 API 快速测试脚本
# 快速验证基本功能是否正常

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
BASE_URL="${1:-http://localhost:8085}"
ADMIN_USERNAME="${2:-admin}"
ADMIN_PASSWORD="${3:-admin123}"

API_BASE="${BASE_URL}/api/admin"
AUTH_TOKEN=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DevOps 工作台 API 快速测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Base URL: $BASE_URL"
echo ""

# 登录
echo -e "${YELLOW}1. 管理员登录...${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
    "${API_BASE}/auth/login")

AUTH_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ 登录失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 登录成功${NC}"
echo ""

# 测试脚本列表
echo -e "${YELLOW}2. 获取脚本列表...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
    "${API_BASE}/devops/scripts")
count=$(echo "$response" | grep -o '"id"' | wc -l)
if [ $count -gt 0 ]; then
    echo -e "${GREEN}✅ 获取脚本列表成功 (共 $count 个脚本)${NC}"
else
    echo -e "${RED}❌ 获取脚本列表失败或为空${NC}"
fi
echo ""

# 测试流程模板列表
echo -e "${YELLOW}3. 获取流程模板列表...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
    "${API_BASE}/devops/pipelines")
count=$(echo "$response" | grep -o '"id"' | wc -l)
if [ $count -gt 0 ]; then
    echo -e "${GREEN}✅ 获取流程模板列表成功 (共 $count 个模板)${NC}"
else
    echo -e "${YELLOW}⚠️  流程模板列表为空（可能需要先创建模板）${NC}"
fi
echo ""

# 测试统计信息
echo -e "${YELLOW}4. 获取统计信息...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
    "${API_BASE}/devops/statistics")
if echo "$response" | grep -q "totalExecutions"; then
    echo -e "${GREEN}✅ 获取统计信息成功${NC}"
else
    echo -e "${RED}❌ 获取统计信息失败${NC}"
fi
echo ""

# 测试定时任务列表
echo -e "${YELLOW}5. 获取定时任务列表...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" \
    "${API_BASE}/devops/scheduled-tasks")
if echo "$response" | grep -q "\[\|\"id\""; then
    echo -e "${GREEN}✅ 获取定时任务列表成功${NC}"
else
    echo -e "${YELLOW}⚠️  定时任务列表为空${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}快速测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
