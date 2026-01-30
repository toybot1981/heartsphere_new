#!/bin/bash

# 技能 API 测试脚本
# 用途：测试技能管理相关的 API 接口
# 前置条件：后端服务已启动，数据库已清理旧格式技能

BASE_URL="${BASE_URL:-http://localhost:8081}"
TOKEN="${TOKEN:-}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0

# 打印测试结果
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name: $message"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name: $message"
        ((FAILED++))
    fi
}

# 检查 Token
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}警告: 未提供 TOKEN，某些测试可能失败${NC}"
    echo "使用方法: TOKEN=your_token ./test-skill-api.sh"
fi

# 测试1：获取所有技能
echo "测试1: 获取所有技能"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/skills" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    # 检查响应中是否包含旧格式字段
    if echo "$body" | grep -q "functionSchema"; then
        print_result "测试1" "FAIL" "响应中包含已废弃的 functionSchema 字段"
    else
        print_result "测试1" "PASS" "成功获取技能列表，无旧格式字段"
    fi
else
    print_result "测试1" "FAIL" "HTTP $http_code"
fi

# 测试2：获取可用技能
echo "测试2: 获取可用技能（有 mcp_tool_config 的技能）"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/skills/available" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    # 检查所有技能都有 mcpToolConfig
    skill_count=$(echo "$body" | jq '.data | length' 2>/dev/null || echo "0")
    if [ "$skill_count" -gt 0 ]; then
        mcp_count=$(echo "$body" | jq '[.data[] | select(.mcpToolConfig != null and .mcpToolConfig != "")] | length' 2>/dev/null || echo "0")
        if [ "$mcp_count" = "$skill_count" ]; then
            print_result "测试2" "PASS" "所有可用技能都有 mcpToolConfig ($skill_count 个技能)"
        else
            print_result "测试2" "FAIL" "部分技能缺少 mcpToolConfig ($mcp_count/$skill_count)"
        fi
    else
        print_result "测试2" "PASS" "无可用技能（正常，如果数据库已清理）"
    fi
else
    print_result "测试2" "FAIL" "HTTP $http_code"
fi

# 测试3：验证技能格式
echo "测试3: 验证技能格式（检查新规范字段）"
response=$(curl -s -X GET "$BASE_URL/api/skills" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    skill_count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
    if [ "$skill_count" -gt 0 ]; then
        # 检查是否有 skillContent
        has_skill_content=$(echo "$response" | jq '[.data[] | select(.skillContent != null and .skillContent != "")] | length' 2>/dev/null || echo "0")
        
        if [ "$has_skill_content" = "$skill_count" ]; then
            print_result "测试3" "PASS" "所有技能都有 skillContent ($skill_count 个技能)"
        else
            print_result "测试3" "FAIL" "部分技能缺少 skillContent ($has_skill_content/$skill_count)"
        fi
    else
        print_result "测试3" "PASS" "无技能（正常，如果数据库已清理）"
    fi
else
    print_result "测试3" "FAIL" "响应格式错误"
fi

# 测试4：测试技能查询参数
echo "测试4: 测试技能查询参数"
for param in "category" "skillType" "executionType"; do
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/skills?$param=test" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "200" ]; then
        print_result "测试4-$param" "PASS" "查询参数 $param 正常工作"
    else
        print_result "测试4-$param" "FAIL" "HTTP $http_code"
    fi
done

# 测试5：测试角色技能接口（需要有效的角色ID）
echo "测试5: 测试角色技能接口"
if [ -n "$CHARACTER_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/skills/character/$CHARACTER_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "200" ]; then
        # 检查响应格式
        if echo "$response" | jq -e '.data.mcpToolSkills' > /dev/null 2>&1; then
            print_result "测试5" "PASS" "角色技能接口正常，返回新格式"
        else
            print_result "测试5" "FAIL" "响应格式不符合预期"
        fi
    else
        print_result "测试5" "FAIL" "HTTP $http_code（可能是角色不存在）"
    fi
else
    echo -e "${YELLOW}跳过测试5: 未提供 CHARACTER_ID${NC}"
    echo "使用方法: CHARACTER_ID=1 ./test-skill-api.sh"
fi

# 输出测试总结
echo ""
echo "========================================="
echo "测试总结"
echo "========================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo "总计: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败，请检查${NC}"
    exit 1
fi
