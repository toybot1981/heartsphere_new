#!/bin/bash
# 记忆API全面测试脚本
# 测试 hsmem Python API 和主项目后端记忆API

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
HSMEM_URL="${HSMEM_URL:-http://localhost:8000}"
MAIN_BACKEND_URL="${MAIN_BACKEND_URL:-http://localhost:8081}"
TEST_USER_ID="test_user_$(date +%s)"
TEST_TOKEN=""

# 统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 打印函数
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

# 检查服务可用性
check_service() {
    local service_name=$1
    local url=$2
    
    print_test "检查 $service_name 服务可用性"
    if curl -s -f "$url/health" > /dev/null 2>&1 || curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$service_name 服务可用"
        return 0
    else
        print_error "$service_name 服务不可用 ($url)"
        return 1
    fi
}

# 登录获取Token（主项目后端）
login() {
    print_test "登录获取认证Token"
    
    local response=$(curl -s -X POST "$MAIN_BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"test123"}' 2>/dev/null || echo "")
    
    if [ -z "$response" ]; then
        print_error "无法连接到主项目后端"
        return 1
    fi
    
    TEST_TOKEN=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('data', {}).get('token', ''))
except:
    pass
" 2>/dev/null)
    
    if [ -n "$TEST_TOKEN" ]; then
        print_success "登录成功，获取Token"
        return 0
    else
        print_error "登录失败"
        echo "响应: $response"
        return 1
    fi
}

# 测试 hsmem Python API
test_hsmem_api() {
    print_header "1. HSMem Python API 测试"
    
    if ! check_service "HSMem" "$HSMEM_URL"; then
        echo -e "${YELLOW}⚠️  HSMem 服务不可用，跳过测试${NC}"
        echo -e "${YELLOW}   启动命令: cd hsmem && python3 rest_api_server.py${NC}"
        return 1
    fi
    
    # 测试健康检查
    print_test "HSMem 健康检查"
    response=$(curl -s "$HSMEM_URL/health")
    if echo "$response" | grep -q "healthy"; then
        print_success "健康检查通过"
    else
        print_error "健康检查失败"
        echo "响应: $response"
    fi
    
    # 测试对话记忆化
    print_test "HSMem 对话记忆化"
    response=$(curl -s -X POST "$HSMEM_URL/api/v1/memory/memorize/conversation" \
        -H "Content-Type: application/json" \
        -d "{
            \"messages\": [
                {\"role\": \"user\", \"content\": {\"text\": \"我是测试用户\"}},
                {\"role\": \"assistant\", \"content\": {\"text\": \"你好测试用户！\"}}
            ],
            \"user_id\": \"$TEST_USER_ID\"
        }")
    
    if echo "$response" | grep -q "success"; then
        print_success "对话记忆化成功"
        echo "$response" | python3 -m json.tool 2>/dev/null | head -20
    else
        print_error "对话记忆化失败"
        echo "响应: $response"
    fi
    
    # 测试记忆检索
    print_test "HSMem 记忆检索"
    response=$(curl -s -X POST "$HSMEM_URL/api/v1/memory/retrieve" \
        -H "Content-Type: application/json" \
        -d "{
            \"queries\": [
                {\"role\": \"user\", \"content\": {\"text\": \"测试用户\"}}
            ],
            \"where\": {\"user_id\": \"$TEST_USER_ID\"},
            \"limit\": 5
        }")
    
    if echo "$response" | grep -q "success"; then
        print_success "记忆检索成功"
    else
        print_error "记忆检索失败"
        echo "响应: $response"
    fi
    
    # 测试统计信息
    print_test "HSMem 统计信息"
    response=$(curl -s "$HSMEM_URL/api/v1/memory/statistics")
    if echo "$response" | grep -q "success"; then
        print_success "统计信息获取成功"
        echo "$response" | python3 -m json.tool 2>/dev/null | head -15
    else
        print_error "统计信息获取失败"
    fi
}

# 测试主项目后端记忆API
test_main_backend_api() {
    print_header "2. 主项目后端记忆API测试"
    
    if ! check_service "主项目后端" "$MAIN_BACKEND_URL"; then
        echo -e "${YELLOW}⚠️  主项目后端服务不可用，跳过测试${NC}"
        echo -e "${YELLOW}   启动命令: cd main/backend && mvn spring-boot:run${NC}"
        return 1
    fi
    
    # 尝试登录
    if ! login; then
        echo -e "${YELLOW}⚠️  无法登录，部分测试需要认证${NC}"
    fi
    
    # 测试记忆搜索（如果已实现）
    if [ -n "$TEST_TOKEN" ]; then
        print_test "主项目后端记忆搜索"
        response=$(curl -s -X GET "$MAIN_BACKEND_URL/api/memory/v1/users/$TEST_USER_ID/memories/search?query=test&limit=10" \
            -H "Authorization: Bearer $TEST_TOKEN")
        
        if echo "$response" | grep -q "code"; then
            print_success "记忆搜索接口可访问"
        else
            print_error "记忆搜索接口失败"
            echo "响应: $response"
        fi
    fi
}

# 测试错误处理
test_error_handling() {
    print_header "3. 错误处理测试"
    
    # 测试无效请求
    print_test "HSMem 无效请求处理"
    response=$(curl -s -X POST "$HSMEM_URL/api/v1/memory/memorize/conversation" \
        -H "Content-Type: application/json" \
        -d "{}")
    
    if echo "$response" | grep -q "422\|400\|error"; then
        print_success "无效请求被正确拒绝"
    else
        print_error "无效请求处理异常"
    fi
    
    # 测试不存在的资源
    print_test "HSMem 不存在资源处理"
    response=$(curl -s "$HSMEM_URL/api/v1/memory/categories/nonexistent_category")
    if echo "$response" | grep -q "404\|error\|not found"; then
        print_success "不存在资源处理正确"
    else
        print_error "不存在资源处理异常"
    fi
}

# 测试性能
test_performance() {
    print_header "4. 性能测试"
    
    print_test "HSMem API 响应时间"
    start_time=$(date +%s%N)
    curl -s "$HSMEM_URL/health" > /dev/null
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 1000 ]; then
        print_success "响应时间: ${duration}ms (正常)"
    else
        print_error "响应时间: ${duration}ms (较慢)"
    fi
}

# 生成测试报告
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
    print_header "记忆API全面测试"
    
    echo "配置:"
    echo "  HSMem URL: $HSMEM_URL"
    echo "  主项目后端 URL: $MAIN_BACKEND_URL"
    echo "  测试用户ID: $TEST_USER_ID"
    echo ""
    
    # 运行测试
    test_hsmem_api
    test_main_backend_api
    test_error_handling
    test_performance
    
    # 生成报告
    generate_report
}

# 运行主函数
main "$@"
