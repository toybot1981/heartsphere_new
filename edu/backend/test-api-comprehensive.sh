#!/bin/bash

# HeartSphere Edu API 全面测试脚本

BASE_URL="http://localhost:8084/api/edu"
TEST_TOKEN=""
REPORT_FILE="API_TEST_REPORT.md"

echo "🧪 HeartSphere Edu API 全面测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

# 测试结果数组
declare -a TEST_RESULTS

# 测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local expected_code=${5:-200}  # 默认期望 200
    
    ((TOTAL++))
    echo -n "[$TOTAL] 测试: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
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
            -H "Content-Type: application/json" \
            ${TEST_TOKEN:+-H "Authorization: Bearer $TEST_TOKEN"})
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # 如果期望的代码是 401/403，并且实际返回也是 401/403，也算通过（认证未配置的情况）
    if [ "$expected_code" = "401" ] && [ "$http_code" = "401" ]; then
        echo -e "${YELLOW}⚠ 需要认证（跳过）${NC} (HTTP $http_code)"
        TEST_RESULTS+=("SKIP|$description|HTTP $http_code|需要认证")
        ((SKIPPED++))
        return 2
    elif [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
        TEST_RESULTS+=("PASS|$description|HTTP $http_code")
        ((PASSED++))
        echo "$body" > /tmp/test_response_${TOTAL}.json
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (HTTP $http_code)"
        error_msg=$(echo "$body" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "$body" | head -1)
        echo "  错误: $error_msg"
        TEST_RESULTS+=("FAIL|$description|HTTP $http_code|$error_msg")
        ((FAILED++))
        echo "$body" > /tmp/test_response_${TOTAL}.json
        return 1
    fi
}

# 检查服务
echo "📋 检查服务状态..."
if ! curl -s http://localhost:8084/actuator/health > /dev/null 2>&1; then
    if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/characters" | grep -q "200\|401\|403"; then
        echo -e "${RED}❌ Edu 后端服务未运行或无法访问${NC}"
        echo "请确保服务运行在 http://localhost:8084"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 服务可访问${NC}"
echo ""

# 开始测试
echo "=========================================="
echo "📊 测试数字人角色 API (EduCharacterController)"
echo "=========================================="
echo ""

# 1. GET /api/edu/characters - 获取角色列表
test_api "GET" "/characters?page=0&size=10" "" "获取数字人角色列表（分页）"

# 2. GET /api/edu/characters - 带筛选条件
test_api "GET" "/characters?characterType=TEACHING_ASSISTANT&page=0&size=10" "" "获取角色列表（按类型筛选）"

# 3. POST /api/edu/characters - 创建角色
CHARACTER_DATA='{
  "name": "测试数学老师",
  "avatarUrl": "https://example.com/avatar.png",
  "description": "这是一位专业的数学老师",
  "characterType": "TEACHING_ASSISTANT",
  "ageGroupSuitability": ["6-12"],
  "subjectTags": ["数学"],
  "difficultyLevel": "BEGINNER",
  "languageStyle": "FRIENDLY",
  "firstMessage": "你好！我是你的数学老师，有什么问题可以问我。"
}'
CREATE_RESPONSE=$(test_api "POST" "/characters" "$CHARACTER_DATA" "创建数字人角色")
CREATE_RESULT=$?

if [ $CREATE_RESULT -eq 0 ]; then
    # 提取角色ID
    if [ -f /tmp/test_response_${TOTAL}.json ]; then
        CHARACTER_ID=$(cat /tmp/test_response_${TOTAL}.json | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -z "$CHARACTER_ID" ]; then
            CHARACTER_ID=$(cat /tmp/test_response_${TOTAL}.json | jq -r '.data.id' 2>/dev/null)
        fi
    fi
    
    if [ -n "$CHARACTER_ID" ] && [ "$CHARACTER_ID" != "null" ]; then
        echo -e "${BLUE}  角色ID: $CHARACTER_ID${NC}"
        
        # 4. GET /api/edu/characters/{id} - 获取角色详情
        test_api "GET" "/characters/$CHARACTER_ID" "" "获取角色详情 (ID: $CHARACTER_ID)"
        
        # 5. PUT /api/edu/characters/{id} - 更新角色
        UPDATE_DATA='{
          "name": "测试数学老师（已更新）",
          "description": "这是更新后的描述"
        }'
        test_api "PUT" "/characters/$CHARACTER_ID" "$UPDATE_DATA" "更新角色信息"
        
        # 6. GET /api/edu/characters/{id}/statistics - 获取角色统计
        test_api "GET" "/characters/$CHARACTER_ID/statistics" "" "获取角色统计信息"
        
        # 7. DELETE /api/edu/characters/{id} - 删除角色（最后执行，注释掉避免删除）
        # test_api "DELETE" "/characters/$CHARACTER_ID" "" "删除角色"
    else
        echo -e "${YELLOW}  ⚠ 无法提取角色ID，跳过相关测试${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠ 创建角色失败，跳过相关测试${NC}"
    CHARACTER_ID=""
fi

# 8. GET /api/edu/characters/recommendations - 获取推荐角色
RECOMMEND_DATA=""
test_api "GET" "/characters/recommendations?studentId=1&limit=5" "" "获取推荐角色列表"

echo ""
echo "=========================================="
echo "📊 测试互动记录 API (EduCharacterInteractionController)"
echo "=========================================="
echo ""

# 9. POST /api/edu/character-interactions - 记录互动
if [ -n "$CHARACTER_ID" ] && [ "$CHARACTER_ID" != "null" ]; then
    INTERACTION_DATA="{
      \"studentId\": 1,
      \"characterId\": $CHARACTER_ID,
      \"interactionType\": \"TEACHING_DIALOGUE\",
      \"conversationContent\": \"学生：什么是加法？\\n老师：加法是把两个或多个数字相加的运算。\",
      \"learningTopics\": [\"加法基础\"],
      \"comprehensionLevel\": \"WELL_UNDERSTOOD\",
      \"startTime\": \"2026-01-11T10:00:00\",
      \"endTime\": \"2026-01-11T10:15:00\",
      \"durationMinutes\": 15
    }"
    INTERACTION_RESPONSE=$(test_api "POST" "/character-interactions" "$INTERACTION_DATA" "记录学生互动")
    INTERACTION_RESULT=$?
    
    if [ $INTERACTION_RESULT -eq 0 ]; then
        # 提取互动ID
        if [ -f /tmp/test_response_${TOTAL}.json ]; then
            INTERACTION_ID=$(cat /tmp/test_response_${TOTAL}.json | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
            if [ -z "$INTERACTION_ID" ]; then
                INTERACTION_ID=$(cat /tmp/test_response_${TOTAL}.json | jq -r '.data.id' 2>/dev/null)
            fi
        fi
        
        if [ -n "$INTERACTION_ID" ] && [ "$INTERACTION_ID" != "null" ]; then
            echo -e "${BLUE}  互动ID: $INTERACTION_ID${NC}"
            
            # 10. GET /api/edu/character-interactions/{id} - 获取互动详情
            test_api "GET" "/character-interactions/$INTERACTION_ID" "" "获取互动详情 (ID: $INTERACTION_ID)"
        fi
    fi
else
    echo -e "${YELLOW}⚠ 跳过互动记录测试（需要有效的角色ID）${NC}"
    INTERACTION_ID=""
fi

# 11. GET /api/edu/character-interactions - 获取学生互动历史
test_api "GET" "/character-interactions?studentId=1&page=0&size=10" "" "获取学生互动历史"

# 12. GET /api/edu/character-interactions/students/{studentId} - 获取学生互动历史（便捷端点）
test_api "GET" "/character-interactions/students/1?page=0&size=10" "" "获取学生互动历史（便捷端点）"

# 如果有角色ID，测试按角色筛选
if [ -n "$CHARACTER_ID" ] && [ "$CHARACTER_ID" != "null" ]; then
    test_api "GET" "/character-interactions?studentId=1&characterId=$CHARACTER_ID&page=0&size=10" "" "获取角色互动历史"
fi

echo ""
echo "=========================================="
echo "📊 测试结果汇总"
echo "=========================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo -e "${YELLOW}跳过: $SKIPPED${NC}"
echo "总计: $TOTAL"
echo ""

# 生成测试报告
cat > "$REPORT_FILE" <<EOF
# HeartSphere Edu API 测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试服务**: http://localhost:8084/api/edu

## 测试结果汇总

- ✅ **通过**: $PASSED
- ❌ **失败**: $FAILED
- ⚠️ **跳过**: $SKIPPED
- 📊 **总计**: $TOTAL

## 详细测试结果

EOF

for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r status desc code msg <<< "$result"
    if [ "$status" = "PASS" ]; then
        echo "- ✅ **$desc** - $code" >> "$REPORT_FILE"
    elif [ "$status" = "FAIL" ]; then
        echo "- ❌ **$desc** - $code - $msg" >> "$REPORT_FILE"
    elif [ "$status" = "SKIP" ]; then
        echo "- ⚠️ **$desc** - $code - $msg" >> "$REPORT_FILE"
    fi
done

cat >> "$REPORT_FILE" <<EOF

## API 端点列表

### 数字人角色 API (EduCharacterController)

1. **GET** `/api/edu/characters` - 获取角色列表（支持分页和筛选）
2. **POST** `/api/edu/characters` - 创建角色
3. **GET** `/api/edu/characters/{id}` - 获取角色详情
4. **PUT** `/api/edu/characters/{id}` - 更新角色
5. **DELETE** `/api/edu/characters/{id}` - 删除角色
6. **GET** `/api/edu/characters/recommendations` - 获取推荐角色
7. **GET** `/api/edu/characters/{id}/statistics` - 获取角色统计

### 互动记录 API (EduCharacterInteractionController)

1. **POST** `/api/edu/character-interactions` - 记录互动
2. **GET** `/api/edu/character-interactions` - 获取互动历史（支持筛选和分页）
3. **GET** `/api/edu/character-interactions/{id}` - 获取互动详情
4. **GET** `/api/edu/character-interactions/students/{studentId}` - 获取学生互动历史

## 注意事项

1. 如果 API 返回 401/403 错误，可能需要配置认证
2. 某些测试可能因为依赖关系而跳过
3. 响应数据保存在 \`/tmp/test_response_*.json\` 文件中

EOF

echo -e "${BLUE}📄 测试报告已生成: $REPORT_FILE${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ 部分测试失败，请检查 API 实现${NC}"
    exit 1
fi
