#!/bin/bash
# 简化的 API 测试脚本，直接运行所有测试

BASE_URL="http://localhost:8084/api/edu"
TOTAL=0
PASSED=0
FAILED=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local desc=$4
    ((TOTAL++))
    echo -n "[$TOTAL] $desc ... "
    
    if [ "$method" = "GET" ]; then
        code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
    
    if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
        echo "✓ 通过 (HTTP $code)"
        ((PASSED++))
        return 0
    else
        echo "✗ 失败 (HTTP $code)"
        ((FAILED++))
        return 1
    fi
}

echo "🧪 HeartSphere Edu API 测试"
echo "================================"
echo ""

# 数字人角色 API
test_endpoint "GET" "/characters?page=0&size=10" "" "获取角色列表"
test_endpoint "GET" "/characters?characterType=TEACHING_ASSISTANT&page=0&size=10" "" "获取角色列表（按类型筛选）"

# 创建角色
response=$(curl -s -X POST "$BASE_URL/characters" -H "Content-Type: application/json" -d '{"name":"测试老师","characterType":"TEACHING_ASSISTANT","ageGroupSuitability":["6-12"],"subjectTags":["数学"],"difficultyLevel":"BEGINNER","languageStyle":"FRIENDLY","firstMessage":"你好！"}')
char_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$char_id" ]; then
    test_endpoint "GET" "/characters/$char_id" "" "获取角色详情"
    test_endpoint "GET" "/characters/$char_id/statistics" "" "获取角色统计"
fi

# 推荐角色
test_endpoint "GET" "/characters/recommendations?studentId=1&limit=5" "" "获取推荐角色"

# 互动记录 API
test_endpoint "GET" "/character-interactions?studentId=1&page=0&size=10" "" "获取学生互动历史"
test_endpoint "GET" "/character-interactions/students/1?page=0&size=10" "" "获取学生互动历史（便捷端点）"

echo ""
echo "================================"
echo "📊 测试结果: 通过 $PASSED / $TOTAL, 失败 $FAILED"
echo "================================"

exit $FAILED
