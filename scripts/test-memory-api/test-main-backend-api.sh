#!/bin/bash
# 主项目后端记忆API测试脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
BACKEND_URL="${BACKEND_URL:-http://localhost:8081}"
TEST_USERNAME="${TEST_USERNAME:-test}"
TEST_PASSWORD="${TEST_PASSWORD:-test123}"
TEST_USER_ID=""
TEST_TOKEN=""

# 统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}测试: $1${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

# 登录
login() {
    print_test "用户登录"
    
    local response=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}" 2>/dev/null || echo "")
    
    if [ -z "$response" ]; then
        print_error "无法连接到后端服务"
        return 1
    fi
    
    TEST_TOKEN=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 200:
        token = data.get('data', {}).get('token', '')
        user_id = str(data.get('data', {}).get('user', {}).get('id', ''))
        print(f'{token}|{user_id}')
except:
    pass
" 2>/dev/null | cut -d'|' -f1)
    
    TEST_USER_ID=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 200:
        user_id = str(data.get('data', {}).get('user', {}).get('id', ''))
        print(user_id)
except:
    pass
" 2>/dev/null)
    
    if [ -n "$TEST_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_success "登录成功 (用户ID: $TEST_USER_ID)"
        return 0
    else
        print_error "登录失败"
        echo "响应: $response"
        return 1
    fi
}

# 测试记忆搜索
test_memory_search() {
    print_test "记忆搜索接口"
    
    local response=$(curl -s -X GET "$BACKEND_URL/api/memory/v1/users/$TEST_USER_ID/memories/search?query=test&limit=10" \
        -H "Authorization: Bearer $TEST_TOKEN" \
        -H "Content-Type: application/json")
    
    local code=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('code', 0))
except:
    print(0)
" 2>/dev/null)
    
    if [ "$code" = "200" ]; then
        print_success "记忆搜索成功"
        echo "$response" | python3 -m json.tool 2>/dev/null | head -30
    else
        print_error "记忆搜索失败 (code: $code)"
        echo "响应: $response"
    fi
}

# 测试保存记忆
test_save_memory() {
    print_test "保存记忆接口"
    
    local memory_data=$(cat <<EOF
{
    "memoryType": "FACT",
    "importance": "MEDIUM",
    "content": "测试记忆内容",
    "structuredData": {
        "key": "value"
    },
    "source": "CONVERSATION",
    "tags": ["test", "api"]
}
EOF
)
    
    local response=$(curl -s -X POST "$BACKEND_URL/api/memory/v1/users/$TEST_USER_ID/memories" \
        -H "Authorization: Bearer $TEST_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$memory_data")
    
    local code=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('code', 0))
except:
    print(0)
" 2>/dev/null)
    
    if [ "$code" = "200" ]; then
        print_success "保存记忆成功"
        MEMORY_ID=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('data', {}).get('id', ''))
except:
    pass
" 2>/dev/null)
        echo "记忆ID: $MEMORY_ID"
    else
        print_error "保存记忆失败 (code: $code)"
        echo "响应: $response"
    fi
}

# 测试获取记忆
test_get_memory() {
    if [ -z "$MEMORY_ID" ]; then
        print_test "获取记忆接口 (跳过，无记忆ID)"
        return
    fi
    
    print_test "获取记忆接口"
    
    local response=$(curl -s -X GET "$BACKEND_URL/api/memory/v1/users/$TEST_USER_ID/memories/$MEMORY_ID" \
        -H "Authorization: Bearer $TEST_TOKEN" \
        -H "Content-Type: application/json")
    
    local code=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('code', 0))
except:
    print(0)
" 2>/dev/null)
    
    if [ "$code" = "200" ]; then
        print_success "获取记忆成功"
    else
        print_error "获取记忆失败 (code: $code)"
    fi
}

# 测试错误处理
test_error_handling() {
    print_test "错误处理 - 未授权访问"
    
    local response=$(curl -s -X GET "$BACKEND_URL/api/memory/v1/users/$TEST_USER_ID/memories/search" \
        -H "Content-Type: application/json")
    
    local code=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('code', 0))
except:
    print(0)
" 2>/dev/null)
    
    if [ "$code" = "401" ] || [ "$code" = "403" ]; then
        print_success "未授权访问被正确拒绝"
    else
        print_error "未授权访问处理异常 (code: $code)"
    fi
}

# 生成报告
generate_report() {
    print_header "测试报告"
    
    echo "总测试数: $TOTAL_TESTS"
    echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
    echo -e "${RED}失败: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ 所有测试通过！${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ 部分测试失败${NC}"
        return 1
    fi
}

# 主函数
main() {
    print_header "主项目后端记忆API测试"
    
    echo "配置:"
    echo "  后端URL: $BACKEND_URL"
    echo "  测试用户: $TEST_USERNAME"
    echo ""
    
    # 检查服务
    if ! curl -s -f "$BACKEND_URL" > /dev/null 2>&1; then
        print_error "后端服务不可用"
        echo "请先启动后端服务: cd main/backend && mvn spring-boot:run"
        exit 1
    fi
    
    # 登录
    if ! login; then
        echo "无法继续测试，需要有效的登录凭证"
        exit 1
    fi
    
    # 运行测试
    test_memory_search
    test_save_memory
    test_get_memory
    test_error_handling
    
    # 生成报告
    generate_report
}

# 运行主函数
main "$@"
