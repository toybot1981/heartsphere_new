#!/bin/bash

# HeartSphere Edu API 测试脚本

BASE_URL="http://localhost:8084/api/edu"
TEST_TOKEN=""

echo "🧪 HeartSphere Edu API 测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASSED=0
FAILED=0

# 测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "测试: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"})
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"} \
            -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"} \
            -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint" \
            ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"})
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (HTTP $http_code)"
        echo "  响应: $body" | head -3
        ((FAILED++))
        return 1
    fi
}

# 检查服务是否运行
echo "📋 检查服务状态..."
if ! curl -s http://localhost:8084/actuator/health > /dev/null 2>&1; then
    if ! curl -s http://localhost:8084/api/edu/characters > /dev/null 2>&1; then
        echo -e "${RED}❌ Edu 后端服务未运行或无法访问${NC}"
        echo "请确保服务运行在 http://localhost:8084"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 服务可访问${NC}"
echo ""

# 1. 测试数字人角色 API
echo "📊 测试数字人角色 API (EduCharacterController)"
echo "----------------------------------------"

# 1.1 获取角色列表（分页）
test_api "GET" "/characters?page=0&size=10" "" "获取数字人角色列表"

# 1.2 创建角色
CHARACTER_DATA='{
  "name": "测试数学老师",
  "avatarUrl": "https://example.com/avatar.png",
  "description": "这是一位专业的数学老师",
  "characterType": "teaching_assistant",
  "ageGroupSuitability": ["6-12"],
  "subjectTags": ["数学"],
  "difficultyLevel": "beginner",
  "languageStyle": "friendly",
  "firstMessage": "你好！我是你的数学老师，有什么问题可以问我。"
}'
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/characters" \
    -H "Content-Type: application/json" \
    ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"} \
    -d "$CHARACTER_DATA")
CHARACTER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$CHARACTER_ID" ]; then
    echo -e "${GREEN}✓ 创建角色成功${NC} (ID: $CHARACTER_ID)"
    ((PASSED++))
    
    # 1.3 获取角色详情
    test_api "GET" "/characters/$CHARACTER_ID" "" "获取角色详情 (ID: $CHARACTER_ID)"
    
    # 1.4 更新角色
    UPDATE_DATA='{
      "name": "测试数学老师（已更新）",
      "description": "这是更新后的描述"
    }'
    test_api "PUT" "/characters/$CHARACTER_ID" "$UPDATE_DATA" "更新角色"
    
    # 1.5 获取角色统计
    test_api "GET" "/characters/$CHARACTER_ID/statistics" "" "获取角色统计信息"
    
    # 1.6 删除角色（最后执行）
    # test_api "DELETE" "/characters/$CHARACTER_ID" "" "删除角色"
else
    echo -e "${YELLOW}⚠ 创建角色失败，跳过相关测试${NC}"
    ((FAILED++))
fi

# 1.7 获取推荐角色
RECOMMEND_DATA='{
  "ageGroup": "6-12",
  "subjects": ["数学"],
  "difficultyLevel": "beginner"
}'
test_api "POST" "/characters/recommendations" "$RECOMMEND_DATA" "获取推荐角色"

echo ""

# 2. 测试互动记录 API
echo "📊 测试互动记录 API (EduCharacterInteractionController)"
echo "----------------------------------------"

# 2.1 记录互动
if [ -n "$CHARACTER_ID" ]; then
    INTERACTION_DATA='{
      "studentId": 1,
      "characterId": '$CHARACTER_ID',
      "interactionType": "teaching_dialogue",
      "conversationContent": "学生：什么是加法？\n老师：加法是把两个或多个数字相加的运算。",
      "learningTopics": ["加法基础"],
      "comprehensionLevel": "well_understood",
      "startTime": "2026-01-11T10:00:00",
      "endTime": "2026-01-11T10:15:00",
      "durationMinutes": 15
    }'
    INTERACTION_RESPONSE=$(curl -s -X POST "$BASE_URL/character-interactions" \
        -H "Content-Type: application/json" \
        ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"} \
        -d "$INTERACTION_DATA")
    INTERACTION_ID=$(echo "$INTERACTION_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -n "$INTERACTION_ID" ]; then
        echo -e "${GREEN}✓ 记录互动成功${NC} (ID: $INTERACTION_ID)"
        ((PASSED++))
        
        # 2.2 获取互动详情
        test_api "GET" "/character-interactions/$INTERACTION_ID" "" "获取互动详情 (ID: $INTERACTION_ID)"
    else
        echo -e "${YELLOW}⚠ 记录互动失败，跳过相关测试${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ 跳过互动记录测试（需要有效的角色ID）${NC}"
fi

# 2.3 获取学生互动历史
test_api "GET" "/character-interactions?studentId=1&page=0&size=10" "" "获取学生互动历史"

# 2.4 获取角色互动历史
if [ -n "$CHARACTER_ID" ]; then
    test_api "GET" "/character-interactions?characterId=$CHARACTER_ID&page=0&size=10" "" "获取角色互动历史"
fi

echo ""

# 3. 测试结果汇总
echo "================================"
echo "📊 测试结果汇总"
echo "================================"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo "总计: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ 部分测试失败，请检查 API 实现${NC}"
    exit 1
fi
