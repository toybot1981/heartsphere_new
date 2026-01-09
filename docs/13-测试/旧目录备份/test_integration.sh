#!/bin/bash

# 前后端联调测试脚本
# 使用方法: ./test_integration.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
BACKEND_URL="http://localhost:8081/api"
FRONTEND_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)
TEST_USERNAME="testuser_${TIMESTAMP}"
TEST_PASSWORD="password123"
TEST_EMAIL="test_${TIMESTAMP}@example.com"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}前后端联调测试开始${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查服务状态
echo -e "${YELLOW}[1/10] 检查服务状态...${NC}"
if ! lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${RED}❌ 后端服务未运行 (端口 8081)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 后端服务运行中${NC}"

if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ 前端服务未运行 (端口 3000)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 前端服务运行中${NC}"
echo ""

# 测试1: 获取系统预置场景
echo -e "${YELLOW}[2/10] 测试: 获取系统预置场景...${NC}"
PRESET_ERAS=$(curl -s "${BACKEND_URL}/preset-eras")
if [ $? -eq 0 ] && [ -n "$PRESET_ERAS" ]; then
    echo -e "${GREEN}✅ 系统预置场景获取成功${NC}"
    echo "场景数量: $(echo $PRESET_ERAS | jq '. | length' 2>/dev/null || echo 'N/A')"
else
    echo -e "${RED}❌ 系统预置场景获取失败${NC}"
    exit 1
fi
echo ""

# 获取第一个场景的ID（用于后续测试）
FIRST_ERA_ID=$(echo $PRESET_ERAS | jq -r '.[0].id' 2>/dev/null || echo "1")
echo "使用场景ID: $FIRST_ERA_ID 进行测试"
echo ""

# 测试2: 获取场景的主线剧情
echo -e "${YELLOW}[3/10] 测试: 获取场景的主线剧情 (eraId=$FIRST_ERA_ID)...${NC}"
MAIN_STORY=$(curl -s "${BACKEND_URL}/preset-main-stories/era/${FIRST_ERA_ID}")
if [ $? -eq 0 ]; then
    if echo "$MAIN_STORY" | grep -q "404\|Not Found" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  该场景没有主线剧情（这是正常的）${NC}"
    elif [ -n "$MAIN_STORY" ] && [ "$MAIN_STORY" != "null" ]; then
        echo -e "${GREEN}✅ 主线剧情获取成功${NC}"
        MAIN_STORY_NAME=$(echo $MAIN_STORY | jq -r '.name' 2>/dev/null || echo "N/A")
        echo "主线剧情名称: $MAIN_STORY_NAME"
    else
        echo -e "${YELLOW}⚠️  该场景没有主线剧情${NC}"
    fi
else
    echo -e "${RED}❌ 主线剧情获取失败${NC}"
fi
echo ""

# 测试3: 获取场景的剧本
echo -e "${YELLOW}[4/10] 测试: 获取场景的剧本 (eraId=$FIRST_ERA_ID)...${NC}"
SCRIPTS=$(curl -s "${BACKEND_URL}/preset-scripts/era/${FIRST_ERA_ID}")
if [ $? -eq 0 ] && [ -n "$SCRIPTS" ]; then
    echo -e "${GREEN}✅ 剧本获取成功${NC}"
    SCRIPT_COUNT=$(echo $SCRIPTS | jq '. | length' 2>/dev/null || echo "0")
    echo "剧本数量: $SCRIPT_COUNT"
else
    echo -e "${YELLOW}⚠️  该场景没有剧本${NC}"
fi
echo ""

# 测试4: 用户注册
echo -e "${YELLOW}[5/10] 测试: 用户注册...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"${TEST_USERNAME}\",
        \"password\": \"${TEST_PASSWORD}\",
        \"email\": \"${TEST_EMAIL}\"
    }")

if [ $? -eq 0 ] && echo "$REGISTER_RESPONSE" | grep -q "token\|data" 2>/dev/null; then
    echo -e "${GREEN}✅ 用户注册成功${NC}"
    # 提取token
    TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token // .token // empty' 2>/dev/null)
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        # 尝试从响应中提取token（如果格式不同）
        TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    fi
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo "Token: ${TOKEN:0:20}..."
    else
        echo -e "${RED}❌ 无法提取token${NC}"
        echo "响应: $REGISTER_RESPONSE"
        exit 1
    fi
else
    echo -e "${RED}❌ 用户注册失败${NC}"
    echo "响应: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# 测试5: 获取当前用户信息
echo -e "${YELLOW}[6/10] 测试: 获取当前用户信息...${NC}"
if [ -n "$TOKEN" ]; then
    USER_INFO=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BACKEND_URL}/auth/me")
    if [ $? -eq 0 ] && echo "$USER_INFO" | grep -q "id\|username" 2>/dev/null; then
        echo -e "${GREEN}✅ 用户信息获取成功${NC}"
        USER_ID=$(echo $USER_INFO | jq -r '.data.id // .id // empty' 2>/dev/null)
        USERNAME=$(echo $USER_INFO | jq -r '.data.username // .username // empty' 2>/dev/null)
        echo "用户ID: $USER_ID"
        echo "用户名: $USERNAME"
    else
        echo -e "${RED}❌ 用户信息获取失败${NC}"
        echo "响应: $USER_INFO"
    fi
else
    echo -e "${RED}❌ Token不存在，跳过测试${NC}"
fi
echo ""

# 测试6: 获取用户的世界列表
echo -e "${YELLOW}[7/10] 测试: 获取用户的世界列表...${NC}"
if [ -n "$TOKEN" ]; then
    WORLDS=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BACKEND_URL}/worlds")
    if [ $? -eq 0 ] && [ -n "$WORLDS" ]; then
        echo -e "${GREEN}✅ 世界列表获取成功${NC}"
        WORLD_COUNT=$(echo $WORLDS | jq '. | length' 2>/dev/null || echo "0")
        echo "世界数量: $WORLD_COUNT"
    else
        echo -e "${YELLOW}⚠️  世界列表为空（新用户可能还没有世界）${NC}"
    fi
else
    echo -e "${RED}❌ Token不存在，跳过测试${NC}"
fi
echo ""

# 测试7: 获取用户的场景列表
echo -e "${YELLOW}[8/10] 测试: 获取用户的场景列表...${NC}"
if [ -n "$TOKEN" ]; then
    ERAS=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BACKEND_URL}/eras")
    if [ $? -eq 0 ] && [ -n "$ERAS" ]; then
        echo -e "${GREEN}✅ 场景列表获取成功${NC}"
        ERA_COUNT=$(echo $ERAS | jq '. | length' 2>/dev/null || echo "0")
        echo "场景数量: $ERA_COUNT"
        
        # 验证不包含体验场景
        if echo "$ERAS" | jq -e '. | map(.id) | contains(["university_era", "cyberpunk_city", "clinic"])' > /dev/null 2>&1; then
            echo -e "${RED}❌ 场景列表包含体验场景（不应该包含）${NC}"
        else
            echo -e "${GREEN}✅ 场景列表不包含体验场景（正确）${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  场景列表为空（新用户可能还没有场景）${NC}"
    fi
else
    echo -e "${RED}❌ Token不存在，跳过测试${NC}"
fi
echo ""

# 测试8: 获取用户的角色列表
echo -e "${YELLOW}[9/10] 测试: 获取用户的角色列表...${NC}"
if [ -n "$TOKEN" ]; then
    CHARACTERS=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BACKEND_URL}/characters")
    if [ $? -eq 0 ] && [ -n "$CHARACTERS" ]; then
        echo -e "${GREEN}✅ 角色列表获取成功${NC}"
        CHARACTER_COUNT=$(echo $CHARACTERS | jq '. | length' 2>/dev/null || echo "0")
        echo "角色数量: $CHARACTER_COUNT"
    else
        echo -e "${YELLOW}⚠️  角色列表为空（新用户可能还没有角色）${NC}"
    fi
else
    echo -e "${RED}❌ Token不存在，跳过测试${NC}"
fi
echo ""

# 测试9: 获取用户的剧本列表
echo -e "${YELLOW}[10/10] 测试: 获取用户的剧本列表...${NC}"
if [ -n "$TOKEN" ]; then
    USER_SCRIPTS=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BACKEND_URL}/scripts")
    if [ $? -eq 0 ] && [ -n "$USER_SCRIPTS" ]; then
        echo -e "${GREEN}✅ 剧本列表获取成功${NC}"
        USER_SCRIPT_COUNT=$(echo $USER_SCRIPTS | jq '. | length' 2>/dev/null || echo "0")
        echo "剧本数量: $USER_SCRIPT_COUNT"
    else
        echo -e "${YELLOW}⚠️  剧本列表为空（新用户可能还没有剧本）${NC}"
    fi
else
    echo -e "${RED}❌ Token不存在，跳过测试${NC}"
fi
echo ""

# 测试总结
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "测试用户信息:"
echo "  用户名: $TEST_USERNAME"
echo "  邮箱: $TEST_EMAIL"
echo ""
echo "下一步:"
echo "  1. 打开前端页面: $FRONTEND_URL"
echo "  2. 使用测试账号登录进行手动测试"
echo "  3. 验证初始化向导功能"
echo "  4. 验证场景列表不包含体验场景"
echo ""

